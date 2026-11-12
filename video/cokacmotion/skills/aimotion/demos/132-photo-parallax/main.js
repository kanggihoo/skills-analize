/*
 * 132 · 새벽 호숫가 — one still "photo" and its depth map come alive (2.5D photo parallax).
 *
 * Setup paints a dawn lake in Canvas 2D as layers, far to near. Each layer writes its colour into ONE image and its
 * depth into ONE depth map (cards at one depth, and planes whose depth varies inside the layer: the lake, the pier deck,
 * the pier side, the boat). Then the layers are thrown away. The renderer sees only the flattened photo and depth map,
 * exactly as it would see a real photo and an estimated depth map. From those two alone setup derives
 *   - a background layer for disocclusion: far colours and depths pushed outward under every foreground edge
 *     (edge-aware walks along rows and columns, half resolution), so a moving camera finds lake behind the boat
 *   - tile maxima of inverse depth, so the march can skip empty space.
 * frame(t) draws one full-screen quad with a ShaderMaterial. Per pixel it casts the view ray of a moved camera, walks it
 * through the depth map in inverse depth (equal steps along the photo's epipolar line), refines the crossing by
 * bisection (relief mapping), and takes the background layer where the ray went behind a depth edge (decided in a
 * step model of the anti-aliased depth, so silhouettes stay smooth). Mist (exponential height fog + a drifting sheet
 * at its own height), depth haze and sun glints come from the reconstructed hit point.
 * The climax is a dolly zoom: the camera pulls back while the focal length grows as f = K·(distance to the boat).
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease, track } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2;
// the photo is larger than the stage by a margin all round; the stage at the reference pose is its central crop
const PW = 1296, PH = 2304, OX = (PW - W) / 2, OY = (PH - H) / 2;
const F0 = 1650;                          // focal length of the photo (px)
const CSX = 540, CSY = 820;               // principal point on the stage (the horizon row: a level camera)
const C0X = CSX + OX, C0Y = CSY + OY;     // the same point in photo px
const HW = 2.4;                           // the lake: world plane Y = HW (camera at the origin, X right, Y down, Z forward)
const ZSKY = 50000;
const SUN_U = 770, SUN_V = 916, SUN_R = 30;   // the sun in photo px (sits in a notch of the far range)
const TS = 24;                            // tile size (photo px) of the inverse-depth maxima
const PEN = `"${FONTS.nanumPen.family}"`;
const CAPTION = '새벽 다섯 시, 호숫가에서';

// ---------------------------------------------------------------- palette: dawn pinks and blues, ink, one gold
const SKY = [[0, '#1b2452'], [260, '#2b3974'], [520, '#545f9f'], [720, '#9187bd'], [850, '#d9a3bd'], [940, '#f6bfb3'], [1012, '#ffd6ae']];
const DEEP = [36, 44, 92];   // the lake's own colour where it reflects little

// ---------------------------------------------------------------- small helpers
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const pr = (X, Y, Z) => [C0X + F0 * X / Z, C0Y + F0 * Y / Z];          // world → photo px (reference camera)
const waterRow = (Z) => C0Y + F0 * HW / Z;                              // the photo row where depth Z meets the lake
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return { c, ctx: c.getContext('2d', { willReadFrequently: true }) };   // setup canvases are all read back
}
function poly(ctx, pts) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); }
function skyAt(v) {   // the painted sky gradient as a colour (for the lake's mirror image of it)
  const s = SKY;
  if (v <= s[0][0]) return hex(s[0][1]);
  for (let i = 1; i < s.length; i++) if (v <= s[i][0]) return mixc(hex(s[i - 1][1]), hex(s[i][1]), (v - s[i - 1][0]) / (s[i][0] - s[i - 1][0]));
  return hex(s[s.length - 1][1]);
}

// depth of a layer pixel (photo px u, v) → Z
const dConst = (Z) => () => Z;
const dPlaneY = (Y, zmin, zmax) => (u, v) => { const k = (v - C0Y) / F0; return k > 1e-6 ? clamp(Y / k, zmin, zmax) : zmax; };
// a vertical plane n·P = d with n = (nx, 0, nz): Z = d / (nx·x' + nz) along the reference ray (x', y', 1)
const dPlaneV = (nx, nz, d, zmin, zmax) => (u) => { const den = nx * (u - C0X) / F0 + nz; return Math.abs(den) > 1e-6 ? clamp(d / den, zmin, zmax) : zmax; };

// ---------------------------------------------------------------- painting primitives
function glow(ctx, x, y, R, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, rgb(c, a)); g.addColorStop(0.3, rgb(c, a * 0.45)); g.addColorStop(1, rgb(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
}
/** a flat dawn cloud: overlapping flattened puffs, dark top, lit underside */
function cloud(ctx, r, x, y, len, th, top, bot, a) {
  const g = ctx.createLinearGradient(0, y - th * 1.2, 0, y + th * 0.35);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath();
  const n = Math.max(3, Math.round(len / (th * 1.2)));
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1), tp = Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * s)), 0.7);
    const rr = th * (0.35 + 0.65 * tp) * (0.75 + 0.5 * r());
    const px = x + s * len + (r() - 0.5) * th * 0.6, py = y - rr * 0.42 + (r() - 0.5) * th * 0.2;
    ctx.moveTo(px + rr * 1.6, py); ctx.ellipse(px, py, rr * 1.6, rr * 0.6, 0, 0, TAU);
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}
function catmull(p0, p1, p2, p3, s) {
  const s2 = s * s, s3 = s2 * s;
  return 0.5 * (2 * p1 + (p2 - p0) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (3 * p1 - p0 - 3 * p2 + p3) * s3);
}
/** a ridge: Catmull-Rom through control points plus a few octaves of roughness → v for every u = 0..PW */
function ridgeLine(pts, r, rough) {
  const v = new Float32Array(PW + 1), ph = [0, 1, 2, 3, 4].map(() => r() * TAU);
  let i = 0;
  for (let u = 0; u <= PW; u++) {
    while (i < pts.length - 2 && pts[i + 1][0] < u) i++;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    v[u] = catmull(p0[1], p1[1], p2[1], p3[1], clamp((u - p1[0]) / (p2[0] - p1[0])))
      + rough * (0.5 * Math.sin(u * 0.011 + ph[0]) + 0.3 * Math.sin(u * 0.027 + ph[1]) + 0.16 * Math.sin(u * 0.063 + ph[2])
        + 0.09 * Math.sin(u * 0.15 + ph[3]) + 0.05 * Math.sin(u * 0.37 + ph[4]));
  }
  return v;
}
/** a mountain range on its own canvas: gradient body, backlit rim near the sun, brush texture, valley mist at its foot */
function paintRange(ctx, r, pts, rough, top, bot, rimA, mistC) {
  const v = ridgeLine(pts, r, rough), base = C0Y + 40;
  let vmin = 1e9; for (const y of v) vmin = Math.min(vmin, y);
  const g = ctx.createLinearGradient(0, vmin, 0, base);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, base);
  for (let u = 0; u <= PW; u += 2) ctx.lineTo(u, v[u]);
  ctx.lineTo(PW, base); ctx.fill();
  ctx.globalCompositeOperation = 'source-atop';
  // slope shading: faces turned toward the sun catch a warm wash, the others a cool one (soft wide strokes)
  for (let u = 6; u < PW - 6; u += 3) {
    const slope = (v[u + 6] - v[u - 6]) / 12, toSun = Math.sign(SUN_U - u) * -slope;
    const a = clamp(Math.abs(toSun) * 0.5, 0, 0.16);
    if (a < 0.01) continue;
    const g2 = ctx.createLinearGradient(0, v[u], 0, v[u] + 90);
    const col = toSun > 0 ? '255,214,206' : '40,36,90';
    g2.addColorStop(0, `rgba(${col},${a})`); g2.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g2; ctx.fillRect(u - 1.5, v[u], 3, 90);
  }
  // valley mist
  const m = ctx.createLinearGradient(0, base - 150, 0, base - 10);
  m.addColorStop(0, rgb(mistC, 0)); m.addColorStop(1, rgb(mistC, 0.85));
  ctx.fillStyle = m; ctx.fillRect(0, base - 150, PW, 150);
  ctx.globalCompositeOperation = 'source-over';
  // backlit rim along the ridge, strongest near the sun
  const rg = ctx.createLinearGradient(SUN_U - 560, 0, SUN_U + 560, 0);
  rg.addColorStop(0, 'rgba(255,214,176,0)'); rg.addColorStop(0.5, `rgba(255,222,180,${rimA})`); rg.addColorStop(1, 'rgba(255,214,176,0)');
  ctx.strokeStyle = rg; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let u = 0; u <= PW; u += 2) (u ? ctx.lineTo(u, v[u] + 1.2) : ctx.moveTo(u, v[u] + 1.2));
  ctx.stroke();
  return vmin;
}
/** a flat, rounded foliage pad (union of puffs on a soft flat underside) — added to the current path */
function padPath(ctx, r, cx, cy, w, h) {
  const n = 4 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1);
    const x = cx + (s - 0.5) * w * 0.78 + (r() - 0.5) * w * 0.06;
    const rr = h * (0.42 + 0.5 * Math.sin(Math.PI * (0.1 + 0.8 * s))) * (0.85 + r() * 0.3);
    const y = cy - rr * 0.3 + (r() - 0.5) * h * 0.12;
    ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, TAU);
  }
  ctx.moveTo(cx + w * 0.46, cy); ctx.roundRect(cx - w * 0.46, cy - h * 0.25, w * 0.92, h * 0.5, h * 0.25);
}
/** a pine (trunk, branches, tiers of rounded pads), backlit from the upper right; one tree per canvas (uses source-atop) */
function pine(ctx, r, x, yb, hp, pal, lean = 0) {
  const at = (s) => [x + lean * hp * s + Math.sin(s * 3.1 + 0.7) * hp * 0.012, yb - hp * s];
  const tw = Math.max(2.5, hp * 0.024);
  ctx.fillStyle = pal.trunk; ctx.beginPath();
  for (let i = 0; i <= 16; i++) { const s = i / 16, [px, py] = at(s); ctx[i ? 'lineTo' : 'moveTo'](px - tw * (1 - 0.75 * s) / 2, py); }
  for (let i = 16; i >= 0; i--) { const s = i / 16, [px, py] = at(s); ctx.lineTo(px + tw * (1 - 0.75 * s) / 2, py); }
  ctx.fill();
  const n = 5 + ((r() * 3) | 0), pads = [];
  for (let i = 0; i < n; i++) {
    const s = 0.42 + 0.58 * Math.pow(i / (n - 1), 0.85);
    const side = i === n - 1 ? 0 : (i % 2 ? 1 : -1) * (0.35 + r() * 0.55);
    const [tx, ty] = at(s);
    const w = hp * (0.36 - 0.22 * s) * (0.8 + r() * 0.4), h = w * (0.3 + r() * 0.08);
    pads.push({ tx, ty, cx: tx + side * w * 0.42, cy: ty + h * 0.15, w, h, seed: (r() * 1e9) | 0 });
  }
  ctx.strokeStyle = pal.trunk; ctx.lineCap = 'round';
  for (const p of pads) {
    ctx.lineWidth = Math.max(1.5, tw * 0.42);
    ctx.beginPath(); ctx.moveTo(p.tx, p.ty + p.h * 0.3); ctx.quadraticCurveTo((p.tx + p.cx) / 2, p.ty - p.h * 0.05, p.cx, p.cy); ctx.stroke();
  }
  // rim pass, then the body shifted down-left: the lit rim survives on the sun side
  for (const pass of [0, 1]) {
    ctx.fillStyle = pass ? pal.pad : pal.rim;
    for (const p of pads) {
      const o = pass ? [-p.h * 0.1, p.h * 0.12] : [0, 0];
      ctx.beginPath(); padPath(ctx, rand(p.seed), p.cx + o[0], p.cy + o[1], p.w, p.h); ctx.fill();
    }
  }
  // the shaded underside of every pad (only on what is painted already)
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = pal.shade;
  for (const p of pads) { ctx.beginPath(); padPath(ctx, rand(p.seed), p.cx - p.h * 0.18, p.cy + p.h * 0.48, p.w * 0.96, p.h * 0.8); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the 3D props (painted by projecting world geometry)
const PIER = { xl: -2.5, xr: -1.1, deck: HW - 0.45, under: HW - 0.25, z0: 0.7, z1: 30 };
const POSTS = [1.6, 4.2, 6.8, 9.4, 12.0, 14.6, 17.2, 19.8, 22.4, 25.0, 27.6];
const BOLLARDS = [6.6, 12.8, 19.0, 25.2];
const BOL = { x0: -1.34, x1: -1.16, h: 0.72 };
const LAMP = { z: 29.3, x0: -1.4, x1: -1.31, top: PIER.deck - 2.6 };
const BOAT = { X: 0.55, Z: 7.2, psi: 50 * Math.PI / 180, L: 2.9, B: 0.62, free: 0.4 };
const BSA = Math.sin(BOAT.psi), BCA = Math.cos(BOAT.psi);
const MOOR = { x: 1.36, z: 4.7, w: 0.19, h: 1.5 };                         // a mooring post in the right foreground
const REEDS = { z: MOOR.z, x: [1.08, 1.75], n: 9 };                        // a sparse tuft at its foot, same depth

function halfBeam(a) {
  const u = a / (BOAT.L / 2);   // −1 stern … +1 bow
  if (u <= -0.15) return BOAT.B * (1 - 0.3 * Math.pow((-0.15 - u) / 0.85, 2));
  return BOAT.B * Math.sqrt(Math.max(0, 1 - Math.pow((u + 0.15) / 1.15, 2)));
}
const gunY = (a) => { const u = a / (BOAT.L / 2); return HW - BOAT.free - 0.1 * u * u - 0.07 * Math.max(0, u); };
/** a point on the boat: a along the keel (+ bow), s = +1 near side / −1 far side, k = fraction of the half-beam, world Y */
function bw(a, s, k, Y) {
  const hb = halfBeam(a) * k;
  return [BOAT.X + a * BSA + s * hb * BCA, Y, BOAT.Z + a * BCA - s * hb * BSA];
}
const P2 = (p, mirror) => pr(p[0], mirror ? 2 * HW - p[1] : p[1], p[2]);

function boatInterior(ctx) {
  const N = 40, L2 = BOAT.L / 2, A = (i) => -L2 + (BOAT.L * i) / N;
  const ring = [];
  for (let i = 0; i <= N; i++) ring.push(P2(bw(A(i), 1, 1, gunY(A(i)))));
  for (let i = N; i >= 0; i--) ring.push(P2(bw(A(i), -1, 1, gunY(A(i)))));
  // floor (in shade) then the sunlit inner face of the far side
  const fg = ctx.createLinearGradient(0, ring[N][1] - 60, 0, ring[0][1] + 20);
  fg.addColorStop(0, '#6e5470'); fg.addColorStop(1, '#4a3a5c');
  ctx.fillStyle = fg; poly(ctx, ring); ctx.fill();
  const wall = [];
  for (let i = 0; i <= N; i++) wall.push(P2(bw(A(i), -1, 1, gunY(A(i)))));
  for (let i = N; i >= 0; i--) wall.push(P2(bw(A(i), -1, 0.62, gunY(A(i)) + 0.3)));
  const wg = ctx.createLinearGradient(0, ring[N + 20][1] - 10, 0, ring[N + 20][1] + 50);
  wg.addColorStop(0, '#c99aa6'); wg.addColorStop(1, '#8a6a82');
  ctx.fillStyle = wg; poly(ctx, wall); ctx.fill();
  // ribs on the far wall
  ctx.strokeStyle = 'rgba(70,48,80,0.45)'; ctx.lineWidth = 2;
  for (let i = 3; i < N - 2; i += 4) {
    const a = P2(bw(A(i), -1, 1, gunY(A(i)))), b = P2(bw(A(i), -1, 0.62, gunY(A(i)) + 0.3));
    ctx.beginPath(); ctx.moveTo(a[0], a[1] + 2); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  // floor boards
  ctx.strokeStyle = 'rgba(40,30,60,0.35)'; ctx.lineWidth = 1.6;
  for (const k of [-0.3, 0, 0.3]) {
    ctx.beginPath();
    for (let i = 4; i <= N - 6; i++) { const p = P2(bw(A(i), 1, k, gunY(A(i)) + 0.34)); ctx[i > 4 ? 'lineTo' : 'moveTo'](p[0], p[1]); }
    ctx.stroke();
  }
  // thwarts (seats across): a lit top and a dark front edge
  for (const a0 of [-0.95, 0.05, 0.8]) {
    const y = gunY(a0) + 0.1, a1 = a0 + 0.2;
    const top = [P2(bw(a0, 1, 0.97, y)), P2(bw(a1, 1, 0.97, y)), P2(bw(a1, -1, 0.97, y)), P2(bw(a0, -1, 0.97, y))];
    ctx.fillStyle = '#d6aeb0'; poly(ctx, top); ctx.fill();
    const front = [P2(bw(a0, 1, 0.97, y)), P2(bw(a0, -1, 0.97, y)), P2(bw(a0, -1, 0.97, y + 0.05)), P2(bw(a0, 1, 0.97, y + 0.05))];
    ctx.fillStyle = '#5c4466'; poly(ctx, front); ctx.fill();
  }
  // an oar resting along the thwarts, blade to the bow
  const o0 = P2(bw(-1.15, -1, 0.2, gunY(-1.15) + 0.06)), o1 = P2(bw(1.05, 1, 0.35, gunY(1.05) + 0.04));
  ctx.strokeStyle = '#e8c3b4'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(o0[0], o0[1]); ctx.lineTo(o1[0], o1[1]); ctx.stroke();
  const bl = P2(bw(1.3, 1, 0.55, gunY(1.3) + 0.03));
  ctx.fillStyle = '#efcdbd'; ctx.beginPath();
  ctx.ellipse((o1[0] + bl[0]) / 2, (o1[1] + bl[1]) / 2, Math.hypot(bl[0] - o1[0], bl[1] - o1[1]) * 0.75, 8, Math.atan2(bl[1] - o1[1], bl[0] - o1[0]), 0, TAU);
  ctx.fill();
  // far gunwale rim
  ctx.strokeStyle = '#f3d4c6'; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
  ctx.beginPath(); for (let i = 0; i <= N; i++) { const p = ring[N + 1 + i]; ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); } ctx.stroke();
}
function boatHull(ctx, mirror) {
  const N = 40, L2 = BOAT.L / 2, A = (i) => -L2 + (BOAT.L * i) / N;
  const side = [];
  for (let i = 0; i <= N; i++) side.push(P2(bw(A(i), 1, 1, gunY(A(i))), mirror));
  for (let i = N; i >= 0; i--) side.push(P2(bw(A(i), 1, 0.86, HW), mirror));
  const top = side[N >> 1][1], bot = side[N + 1 + (N >> 1)][1];
  const g = ctx.createLinearGradient(0, Math.min(top, bot), 0, Math.max(top, bot));
  g.addColorStop(0, mirror ? '#232a52' : '#2b345f'); g.addColorStop(1, mirror ? '#1b2046' : '#1e2449');
  ctx.fillStyle = g; poly(ctx, side); ctx.fill();
  // transom (the flat stern, facing the camera)
  const a = -L2, tr = [P2(bw(a, 1, 1, gunY(a)), mirror), P2(bw(a, -1, 1, gunY(a)), mirror), P2(bw(a, -1, 0.86, HW), mirror), P2(bw(a, 1, 0.86, HW), mirror)];
  ctx.fillStyle = mirror ? '#262b55' : '#323a68'; poly(ctx, tr); ctx.fill();
  // a pale painted strake below the gunwale
  const st = [];
  for (let i = 0; i <= N; i++) st.push(P2(bw(A(i), 1, 1, gunY(A(i)) + 0.045), mirror));
  for (let i = N; i >= 0; i--) st.push(P2(bw(A(i), 1, 0.985, gunY(A(i)) + 0.11), mirror));
  ctx.fillStyle = mirror ? 'rgba(200,150,170,0.55)' : '#e2aab3'; poly(ctx, st); ctx.fill();
  if (mirror) return;
  // near gunwale rim and transom top, a soft lit line
  ctx.strokeStyle = '#f7dccd'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); for (let i = 0; i <= N; i++) { const p = side[i]; ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); } ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tr[0][0], tr[0][1]); ctx.lineTo(tr[1][0], tr[1][1]); ctx.stroke();
  // water lapping at the waterline
  ctx.strokeStyle = 'rgba(190,170,215,0.55)'; ctx.lineWidth = 2.2;
  ctx.beginPath(); for (let i = 2; i <= N - 2; i++) { const p = P2(bw(A(i), 1, 0.87, HW - 0.01)); ctx[i > 2 ? 'lineTo' : 'moveTo'](p[0], p[1] - 1); } ctx.stroke();
}
/** perspective-correct depth raster of world triangles into a box of photo px: nearest Z wins (Infinity = empty) */
function rasterZ(tris, x0, y0, w, h) {
  const zb = new Float32Array(w * h).fill(Infinity);
  for (const tri of tris) {
    const p = tri.map((P) => [...pr(P[0], P[1], P[2]), 1 / P[2]]);
    const [a, b, c] = p, area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(area) < 1e-9) continue;
    const xa = Math.max(x0, Math.floor(Math.min(a[0], b[0], c[0]))), xb = Math.min(x0 + w - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
    const ya = Math.max(y0, Math.floor(Math.min(a[1], b[1], c[1]))), yb = Math.min(y0 + h - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
      const px = x + 0.5, py = y + 0.5;
      const l0 = ((b[0] - px) * (c[1] - py) - (b[1] - py) * (c[0] - px)) / area;
      const l1 = ((c[0] - px) * (a[1] - py) - (c[1] - py) * (a[0] - px)) / area, l2 = 1 - l0 - l1;
      if (l0 < -0.02 || l1 < -0.02 || l2 < -0.02) continue;
      const z = 1 / (l0 * a[2] + l1 * b[2] + l2 * c[2]), k = (y - y0) * w + (x - x0);
      if (z < zb[k]) zb[k] = z;
    }
  }
  return zb;
}
/** the boat's own surfaces as triangles: outside = near hull + transom, inside = far inner wall + floor */
function boatTris() {
  const N = 40, L2 = BOAT.L / 2, A = (i) => -L2 + (BOAT.L * i) / N, out = [], inn = [];
  const quad = (list, a, b, c, d) => { list.push([a, b, c], [a, c, d]); };
  const G = (a, s) => bw(a, s, 1, gunY(a)), Wl = (a, s) => bw(a, s, 0.86, HW), Fl = (a, s) => bw(a, s, 0.62, gunY(a) + 0.3);
  for (let i = 0; i < N; i++) {
    const a = A(i), b = A(i + 1);
    quad(out, G(a, 1), G(b, 1), Wl(b, 1), Wl(a, 1));
    quad(inn, G(a, -1), G(b, -1), Fl(b, -1), Fl(a, -1));
    quad(inn, Fl(a, 1), Fl(b, 1), Fl(b, -1), Fl(a, -1));
  }
  quad(out, G(-L2, 1), G(-L2, -1), Wl(-L2, -1), Wl(-L2, 1));
  return { out, inn };
}
function pierDeck(ctx, r) {
  const { xl, xr, deck, z0, z1 } = PIER;
  const plank = 0.24, gapW = 0.03;
  for (let z = z0; z < z1; z += plank + gapW) {
    const za = z, zb = Math.min(z1, z + plank), k = clamp(z / z1);
    const c = mixc(hex('#6c5b82'), hex('#c8a3b2'), Math.pow(k, 0.6)), j = 0.9 + r() * 0.2;
    ctx.fillStyle = rgb([c[0] * j, c[1] * j, c[2] * j]);
    poly(ctx, [pr(xl, deck, za), pr(xr, deck, za), pr(xr, deck, zb), pr(xl, deck, zb)]); ctx.fill();
    // worn light streaks along each plank
    ctx.fillStyle = 'rgba(255,220,225,0.10)';
    poly(ctx, [pr(xl + 0.2 + r() * 0.3, deck, za + 0.05), pr(xr - 0.2 - r() * 0.3, deck, za + 0.05), pr(xr - 0.3, deck, za + 0.09), pr(xl + 0.3, deck, za + 0.09)]); ctx.fill();
    ctx.fillStyle = 'rgba(30,22,50,0.75)';
    poly(ctx, [pr(xl, deck, zb), pr(xr, deck, zb), pr(xr, deck, zb + gapW), pr(xl, deck, zb + gapW)]); ctx.fill();
  }
}
function pierSide(ctx, mirror) {
  const { xr, deck, under, z0, z1 } = PIER;
  const P = (x, y, z) => P2([x, y, z], mirror);
  // the dark hollow under the deck, then the side beam
  ctx.fillStyle = mirror ? '#1a1d40' : '#191a37';
  poly(ctx, [P(xr, under, z0), P(xr, under, z1), P(xr, HW, z1), P(xr, HW, z0)]); ctx.fill();
  ctx.fillStyle = mirror ? '#2c2a52' : '#3a3157';
  poly(ctx, [P(xr, deck, z0), P(xr, deck, z1), P(xr, under, z1), P(xr, under, z0)]); ctx.fill();
  if (!mirror) {   // the lit deck edge
    ctx.strokeStyle = '#e2b9bf'; ctx.lineWidth = 2.5;
    const a = P(xr, deck, z0 + 0.3), b = P(xr, deck, z1);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    const e = [P(PIER.xl, deck, z1), P(xr, deck, z1), P(xr, under, z1), P(PIER.xl, under, z1)];
    ctx.fillStyle = '#4a3d63'; poly(ctx, e); ctx.fill();
  }
}
function post(ctx, z, mirror) {
  const P = (x, y) => P2([x, y, z], mirror);
  const x0 = PIER.xr - 0.13, x1 = PIER.xr + 0.07;
  ctx.fillStyle = mirror ? '#20234a' : '#2a2648';
  poly(ctx, [P(x0, PIER.under - 0.04), P(x1, PIER.under - 0.04), P(x1, HW + 0.01), P(x0, HW + 0.01)]); ctx.fill();
  if (!mirror) {
    ctx.fillStyle = 'rgba(230,180,200,0.45)';
    poly(ctx, [P(x1 - 0.04, PIER.under - 0.04), P(x1, PIER.under - 0.04), P(x1, HW), P(x1 - 0.04, HW)]); ctx.fill();
  }
}
function bollard(ctx, z, mirror) {
  const { x0, x1, h } = BOL, y0 = PIER.deck, y1 = PIER.deck - h;
  const P = (x, y, zz = z) => P2([x, y, zz], mirror);
  ctx.fillStyle = mirror ? '#22234a' : '#2d2a4e';
  poly(ctx, [P(x0, y1), P(x1, y1), P(x1, y0), P(x0, y0)]); ctx.fill();
  ctx.fillStyle = mirror ? '#2b2a52' : '#4b4068';   // the side facing the camera's right
  poly(ctx, [P(x1, y1), P(x1, y1, z + 0.18), P(x1, y0, z + 0.18), P(x1, y0)]); ctx.fill();
  if (!mirror) {
    ctx.fillStyle = '#f1c9bd';
    poly(ctx, [P(x0, y1), P(x1, y1), P(x1, y1, z + 0.18), P(x0, y1, z + 0.18)]); ctx.fill();
    ctx.fillStyle = 'rgba(255,215,200,0.5)';
    poly(ctx, [P(x1 - 0.03, y1), P(x1, y1), P(x1, y0), P(x1 - 0.03, y0)]); ctx.fill();
  }
}
function lamp(ctx, mirror) {
  const { z, x0, x1, top } = LAMP;
  const P = (x, y) => P2([x, y, z], mirror);
  ctx.fillStyle = mirror ? '#20234a' : '#242444';
  poly(ctx, [P(x0, top + 0.3), P(x1, top + 0.3), P(x1, PIER.deck), P(x0, PIER.deck)]); ctx.fill();
  const cx = (x0 + x1) / 2;
  poly(ctx, [P(cx - 0.2, top + 0.32), P(cx + 0.2, top + 0.32), P(cx + 0.15, top - 0.05), P(cx - 0.15, top - 0.05)]);
  ctx.fillStyle = mirror ? '#4a4870' : '#f4dcc0'; ctx.fill();   // glass catching the dawn
  poly(ctx, [P(cx - 0.24, top - 0.05), P(cx + 0.24, top - 0.05), P(cx, top - 0.22)]);
  ctx.fillStyle = mirror ? '#20234a' : '#242444'; ctx.fill();
}
function rope(ctx) {
  const a = [-1.25, PIER.deck - BOL.h + 0.06, BOLLARDS[0]], b = bw(-BOAT.L / 2 + 0.05, 0, 0, gunY(-BOAT.L / 2) + 0.02);
  ctx.strokeStyle = '#d9b9a8'; ctx.lineWidth = 4.2; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const s = i / 24, p = [lerp(a[0], b[0], s), lerp(a[1], b[1], s) + 0.35 * 4 * s * (1 - s), lerp(a[2], b[2], s)];
    const q = pr(p[0], p[1], p[2]); ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1]);
  }
  ctx.stroke();
}
function moor(ctx, mirror) {
  const { x, z, w, h } = MOOR, P = (X, Y, Z = z) => P2([X, Y, Z], mirror);
  const top = HW - h, x0 = x - w / 2, x1 = x + w / 2;
  ctx.fillStyle = mirror ? '#1c2046' : '#262447';
  poly(ctx, [P(x0, top), P(x1, top), P(x1, HW + 0.01), P(x0, HW + 0.01)]); ctx.fill();
  if (mirror) return;
  ctx.fillStyle = '#3a3360';   // the face turned toward the camera's right
  poly(ctx, [P(x1, top), P(x1, top, z + 0.12), P(x1, HW, z + 0.12), P(x1, HW)]); ctx.fill();
  ctx.fillStyle = 'rgba(244,190,200,0.6)';   // sun-side rim
  poly(ctx, [P(x1 - 0.025, top), P(x1, top), P(x1, HW), P(x1 - 0.025, HW)]); ctx.fill();
  ctx.fillStyle = '#f0cbbf';   // weathered top
  poly(ctx, [P(x0, top), P(x1, top), P(x1, top, z + 0.12), P(x0, top, z + 0.12)]); ctx.fill();
  // a coil of rope near the top, and a darker wet band at the waterline
  for (const [y0, y1, c] of [[top + 0.16, top + 0.2, '#e3c2b3'], [top + 0.21, top + 0.25, '#cfa99e'], [HW - 0.18, HW, 'rgba(20,22,52,0.55)']]) {
    ctx.fillStyle = c; poly(ctx, [P(x0 - 0.01, y0), P(x1 + 0.01, y0), P(x1 + 0.01, y1), P(x0 - 0.01, y1)]); ctx.fill();
  }
}
function reeds(ctx, clump, r, mirror) {
  for (let i = 0; i < clump.n; i++) {
    const x = lerp(clump.x[0], clump.x[1], r()), z = clump.z, h = 0.55 + r() * 0.75, lean = (r() - 0.3) * 0.45, wd = 0.026 + r() * 0.012;
    const bend = (r() - 0.5) * 0.25, cat = r() < 0.3;
    const pt = (s, side) => { const X = x + lean * h * s * s + bend * Math.sin(s * 3) * 0.2 + side * wd * (1 - s * 0.92) / 2; return P2([X, HW - h * s, z], mirror); };
    ctx.fillStyle = mirror ? '#1b1f45' : (r() < 0.5 ? '#232448' : '#2c2a52');
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) { const p = pt(k / 10, -1); ctx[k ? 'lineTo' : 'moveTo'](p[0], p[1]); }
    for (let k = 10; k >= 0; k--) { const p = pt(k / 10, 1); ctx.lineTo(p[0], p[1]); }
    ctx.fill();
    if (!mirror) {   // sun-side rim
      ctx.strokeStyle = 'rgba(240,170,185,0.55)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); for (let k = 2; k <= 9; k++) { const p = pt(k / 10, 1); ctx[k > 2 ? 'lineTo' : 'moveTo'](p[0] - 0.6, p[1]); } ctx.stroke();
    }
    if (cat) {
      const a = pt(0.72, 0), b = pt(0.86, 0), wpx = F0 * 0.035 / z;
      ctx.fillStyle = mirror ? '#262246' : '#3b2c4f';
      ctx.beginPath(); ctx.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, wpx, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, 0, TAU); ctx.fill();
    }
  }
}

// ---------------------------------------------------------------- the photo: layers → one colour image + one depth map
function paintPhoto(r) {
  const layers = [];   // { c, x0, y0, depth, mirrorRow?, mirrorPaint? } in painter's order (far → near)
  const add = (bbox, paint, depth, opt = {}) => {
    const x0 = clamp(Math.floor(bbox[0]), 0, PW), y0 = clamp(Math.floor(bbox[1]), 0, PH);
    const x1 = clamp(Math.ceil(bbox[2]), 0, PW), y1 = clamp(Math.ceil(bbox[3]), 0, PH);
    const L = mk(x1 - x0, y1 - y0);
    L.ctx.translate(-x0, -y0); paint(L.ctx); L.ctx.setTransform(1, 0, 0, 1, 0, 0);
    layers.push({ ...L, x0, y0, depth, ...opt });
  };

  // sky (with the sun and dawn clouds)
  add([0, 0, PW, C0Y + 40], (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, C0Y + 40);
    for (const [v, c] of SKY) g.addColorStop(v / (C0Y + 40), c);
    g.addColorStop(1, '#ffdcb2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, PW, C0Y + 40);
    glow(ctx, SUN_U, SUN_V, 700, [255, 186, 160], 0.34);
    glow(ctx, SUN_U, SUN_V, 260, [255, 214, 160], 0.5);
    const rc = rand(31);
    const CL = [
      [-80, 250, 820, 30, '#2f3a77', '#6f6aa0', 0.7], [460, 330, 760, 22, '#38427e', '#8c78a8', 0.55],
      [-60, 520, 640, 30, '#5e5f9c', '#dd9fb6', 0.8], [520, 585, 860, 40, '#6a66a3', '#f2a9b3', 0.85],
      [140, 690, 560, 22, '#9a87b7', '#ffbfae', 0.75], [860, 760, 520, 16, '#dfa1b4', '#ffd0a4', 0.8],
      [300, 805, 380, 11, '#eeaeb2', '#ffd9ad', 0.7], [-40, 860, 420, 10, '#e8a9b7', '#ffd0ad', 0.55],
    ];
    for (const c of CL) cloud(ctx, rc, ...c);
    const sg = ctx.createRadialGradient(SUN_U, SUN_V, 0, SUN_U, SUN_V, SUN_R);
    sg.addColorStop(0, '#fff8e2'); sg.addColorStop(0.65, '#ffe6a6'); sg.addColorStop(1, '#ffc65e');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(SUN_U, SUN_V, SUN_R, 0, TAU); ctx.fill();
    glow(ctx, SUN_U, SUN_V, 95, [255, 228, 168], 0.65);
  }, dConst(ZSKY));

  // three mountain ranges, far → near; their reflections fold about their own water rows
  const ranges = [
    { Z: 9000, rough: 9, top: '#8e86ba', bot: '#e6b3bf', rim: 0.9, mist: [255, 210, 196],
      pts: [[0, 760], [130, 718], [260, 752], [400, 820], [540, 848], [650, 826], [720, 892], [790, 952], [860, 902], [960, 790], [1060, 706], [1170, 752], [1296, 800]] },
    { Z: 3400, rough: 7, top: '#6d6aa3', bot: '#c398b6', rim: 0.6, mist: [240, 192, 196],
      pts: [[0, 872], [140, 836], [300, 878], [470, 902], [600, 912], [700, 962], [800, 990], [900, 962], [1010, 905], [1130, 872], [1230, 896], [1296, 912]] },
    { Z: 1250, rough: 4, top: '#4f5188', bot: '#9a82a8', rim: 0.4, mist: [222, 172, 190],
      pts: [[0, 980], [180, 962], [380, 990], [600, 1003], [800, 1007], [960, 992], [1110, 978], [1296, 988]] },
  ];
  ranges.forEach((m, i) => add([0, 600, PW, C0Y + 40], (ctx) => paintRange(ctx, rand(50 + i), m.pts, m.rough, m.top, m.bot, m.rim, m.mist),
    dConst(m.Z), { mirrorRow: waterRow(m.Z) }));

  // the far shore: a band of small conifers at ~230 m, standing on the water
  const ZS = 230, vS = waterRow(ZS);
  add([0, vS - 110, PW, vS + 2], (ctx) => {
    const rr = rand(70);
    ctx.fillStyle = '#3c3d6d';
    ctx.fillRect(0, vS - 14, PW, 14.5);
    for (let x = 300; x < PW + 20;) {
      const h = (18 + rr() * 58) * (0.7 + 0.3 * Math.sin(x * 0.009 + 1.3)), w = h * (0.34 + rr() * 0.1), y = vS - 10;
      ctx.beginPath(); ctx.moveTo(x, y - h);
      for (let k = 1; k <= 4; k++) { const s = k / 4; ctx.lineTo(x + w * s * 0.5, y - h + h * s * 0.92); ctx.lineTo(x + w * s * 0.28, y - h + h * s * 0.92); }
      ctx.lineTo(x + 1.2, y + 2); ctx.lineTo(x - 1.2, y + 2);
      for (let k = 4; k >= 1; k--) { const s = k / 4; ctx.lineTo(x - w * s * 0.28, y - h + h * s * 0.92); ctx.lineTo(x - w * s * 0.5, y - h + h * s * 0.92); }
      ctx.fill();
      x += 5 + rr() * 11;
    }
    // haze over the treeline (lighter tops toward the sun)
    ctx.globalCompositeOperation = 'source-atop';
    const g = ctx.createLinearGradient(0, vS - 90, 0, vS);
    g.addColorStop(0, 'rgba(236,182,196,0.22)'); g.addColorStop(1, 'rgba(250,206,200,0.55)');
    ctx.fillStyle = g; ctx.fillRect(0, vS - 110, PW, 112);
    ctx.globalCompositeOperation = 'source-over';
  }, (u, v) => ZS, { mirrorRow: vS });

  // two pines on the right shore (~120 m)
  for (const [u, Z, Hm, seed] of [[1110, 125, 17, 81], [1205, 118, 14, 82]]) {
    const yb = waterRow(Z) - 4, hp = F0 * Hm / Z;
    add([u - hp * 0.3, yb - hp - 10, u + hp * 0.3, yb + 4], (ctx) => {
      ctx.fillStyle = '#2f3263'; ctx.fillRect(u - hp * 0.32, yb - 3, hp * 0.64, 7);
      pine(ctx, rand(seed), u, yb + 2, hp, { trunk: '#2c2d5a', pad: '#30346a', rim: '#c98fa8', shade: '#272a59' }, -0.01);
    }, dConst(Z), { mirrorRow: waterRow(Z) });
  }

  // the left headland: a low bank receding to the right, with tall pines (45–70 m)
  const bankZ = (u) => lerp(44, 74, clamp(u / 480));
  add([0, 1000, 500, 1110], (ctx) => {
    ctx.fillStyle = '#272a50';
    ctx.beginPath(); ctx.moveTo(0, 1030);
    for (let u = 0; u <= 480; u += 8) ctx.lineTo(u, 1032 + (u / 480) * 26 + Math.sin(u * 0.05) * 2.5);
    for (let u = 480; u >= 0; u -= 8) ctx.lineTo(u, waterRow(bankZ(u)) + 1);
    ctx.fill();
    ctx.strokeStyle = 'rgba(214,150,170,0.6)'; ctx.lineWidth = 2;   // lit grass edge
    ctx.beginPath(); for (let u = 0; u <= 470; u += 8) ctx[u ? 'lineTo' : 'moveTo'](u, 1032 + (u / 480) * 26 + Math.sin(u * 0.05) * 2.5); ctx.stroke();
  }, (u) => bankZ(u), { mirrorRow: waterRow(56) });
  const PINES = [[95, 66, 19, 91, 0.01], [300, 50, 17, 92, -0.015], [400, 70, 12, 93, 0.02], [180, 53, 22, 94, -0.01], [30, 46, 25, 95, 0.012]];
  for (const [u, Z, Hm, seed, lean] of PINES) {
    const yb = 1034 + (u / 480) * 26, hp = F0 * Hm / Z;
    const pal = Z < 60
      ? { trunk: '#1f2142', pad: '#20264a', rim: '#d293a9', shade: '#191d3e' }
      : { trunk: '#272a52', pad: '#282d58', rim: '#c68fa8', shade: '#21254d' };
    add([u - hp * 0.42, yb - hp * 1.06, u + hp * 0.42, yb + 6], (ctx) => pine(ctx, rand(seed), u, yb + 4, hp, pal, lean), dConst(Z), { mirrorRow: waterRow(Z) });
  }

  // the pier (planes and posts), the lamp at its end
  add([0, 900, 640, PH], (ctx) => lamp(ctx, false), dConst(LAMP.z), { mirrorPaint: (ctx) => lamp(ctx, true) });
  for (const z of [...POSTS].reverse()) add([0, 1080, 600, PH], (ctx) => post(ctx, z, false), dConst(z), { mirrorPaint: (ctx) => post(ctx, z, true) });
  add([0, 1080, 600, PH], (ctx) => pierSide(ctx, false), dPlaneV(1, 0, PIER.xr, 0.6, 40), { mirrorPaint: (ctx) => pierSide(ctx, true) });
  add([0, 1080, 600, PH], (ctx) => pierDeck(ctx, rand(110)), dPlaneY(PIER.deck, 0.6, 40));
  for (const z of [...BOLLARDS].reverse()) add([0, 900, 640, PH], (ctx) => bollard(ctx, z, false), dConst(z), { mirrorPaint: (ctx) => bollard(ctx, z, true) });

  // the boat: its depth is rasterised from the same 3D surfaces it is painted from (perspective-correct z-buffer)
  const BB = [350, 1250, 830, 460], bt = boatTris();
  const zOut = rasterZ(bt.out, ...BB), zIn = rasterZ(bt.inn, ...BB);
  const zLook = (zb, fall) => (u, v) => {
    const x = Math.floor(u) - BB[0], y = Math.floor(v) - BB[1];
    const z = x >= 0 && y >= 0 && x < BB[2] && y < BB[3] ? zb[y * BB[2] + x] : Infinity;
    return z < 1e9 ? z : fall(u, v);
  };
  const gunPlane = dPlaneY(HW - BOAT.free, 5.5, 10);
  add([350, 1250, 1180, 1710], (ctx) => boatInterior(ctx), zLook(zIn, zLook(zOut, gunPlane)));
  add([350, 1250, 1180, 1710], (ctx) => boatHull(ctx, false), zLook(zOut, zLook(zIn, gunPlane)), { mirrorPaint: (ctx) => boatHull(ctx, true) });
  add([0, 1150, 900, 1650], (ctx) => rope(ctx), dConst(6.4));

  // the mooring post and its reeds (one depth: a single clean occluder in the foreground)
  add([800, 1150, PW, PH], (ctx) => { moor(ctx, false); reeds(ctx, REEDS, rand(120), false); }, dConst(MOOR.z),
    { mirrorPaint: (ctx) => { moor(ctx, true); reeds(ctx, REEDS, rand(120), true); } });

  // ---- the lake: mirrored sky (Fresnel), reflections of every standing layer with ripples, the sun's path
  const refl = mk(PW, PH);
  for (const L of layers) {
    const c = refl.ctx;
    if (L.mirrorRow) { c.save(); c.translate(0, 2 * L.mirrorRow); c.scale(1, -1); c.drawImage(L.c, L.x0, L.y0); c.restore(); }
    else if (L.mirrorPaint) L.mirrorPaint(c);
  }
  const reflSoft = mk(PW, PH);
  reflSoft.ctx.filter = 'blur(1.6px)'; reflSoft.ctx.drawImage(refl.c, 0, 0); reflSoft.ctx.filter = 'none';
  const water = mk(PW, PH - C0Y);
  {
    const ctx = water.ctx, rw = rand(140);
    ctx.translate(0, -C0Y);
    const g = ctx.createLinearGradient(0, C0Y, 0, PH);
    for (let k = 0; k <= 24; k++) {
      const v = C0Y + (PH - C0Y) * Math.pow(k / 24, 1.6), th = Math.atan((v - C0Y) / F0);
      const R = 0.02 + 0.98 * Math.pow(1 - Math.sin(th), 5);   // Schlick, n = 1.33
      g.addColorStop((v - C0Y) / (PH - C0Y), rgb(mixc(DEEP, skyAt(2 * C0Y - v), clamp(R * 1.25 + 0.12))));
    }
    ctx.fillStyle = g; ctx.fillRect(0, C0Y, PW, PH - C0Y);
    // reflections: drawn in horizontal strips, each shifted by a ripple; strips thicken and break up toward the camera
    const ph = [rw() * TAU, rw() * TAU, rw() * TAU];
    for (let v = C0Y; v < PH;) {
      const d = v - C0Y, hs = clamp(1 + d * 0.012, 1, 8);
      // ripple wobble: smooth in v, wavelength and amplitude growing toward the camera (perspective)
      const k = 1 / (1 + d * 0.012), dx = (1 + d * 0.022) * (0.65 * Math.sin(v * 0.35 * k + ph[0]) + 0.35 * Math.sin(v * 0.11 * k + ph[1]));
      ctx.globalAlpha = clamp(0.88 - d * 0.0004, 0.45, 0.88) * (0.82 + 0.18 * Math.sin(v * 0.23 * k + ph[2]));
      ctx.drawImage(reflSoft.c, 0, v, PW, hs, dx, v, PW, hs);
      v += hs;
    }
    ctx.globalAlpha = 1;
    // cool, darken the deeper water a touch (only where already painted)
    ctx.globalCompositeOperation = 'source-atop';
    const t = ctx.createLinearGradient(0, C0Y, 0, PH);
    t.addColorStop(0, 'rgba(40,46,100,0.0)'); t.addColorStop(0.3, 'rgba(40,46,100,0.18)'); t.addColorStop(1, 'rgba(25,30,70,0.32)');
    ctx.fillStyle = t; ctx.fillRect(0, C0Y, PW, PH - C0Y);
    ctx.globalCompositeOperation = 'source-over';
    // the sun's path: gold dashes under the sun, widening toward the camera
    glow(ctx, SUN_U, C0Y + 30, 240, [255, 200, 150], 0.35);
    for (let k = 0; k < 420; k++) {
      const s = Math.pow(rw(), 1.7), v = C0Y + 5 + s * 820, d = v - C0Y;
      const half = 14 + d * 0.16, x = SUN_U + (rw() - 0.5) * 2 * half * Math.pow(rw(), 0.6);
      const len = (5 + d * 0.06) * (0.4 + rw()), th = 1 + d * 0.004;
      const a = (0.85 - s * 0.6) * (1 - Math.abs(x - SUN_U) / (half * 1.05));
      if (a <= 0.02) continue;
      ctx.fillStyle = rgb(mixc([255, 214, 140], [255, 240, 205], rw()), a);
      ctx.beginPath(); ctx.roundRect(x - len / 2, v, len, th, th / 2); ctx.fill();
    }
    // ripple light: thin lilac streaks, sparse toward the camera
    for (let k = 0; k < 520; k++) {
      const s = Math.pow(rw(), 1.4), v = C0Y + 4 + s * (PH - C0Y), d = v - C0Y;
      const len = (8 + d * 0.12) * (0.5 + rw()), x = rw() * PW, th = 0.8 + d * 0.0022;
      ctx.fillStyle = rw() < 0.55 ? `rgba(232,200,226,${0.18 + 0.2 * (1 - s)})` : `rgba(28,34,80,${0.18 + 0.15 * s})`;
      ctx.beginPath(); ctx.roundRect(x, v, len, th, th / 2); ctx.fill();
    }
  }
  // insert the lake after the three ranges (it is the far half of the frame's floor; nearer layers overwrite it)
  layers.splice(4, 0, { c: water.c, ctx: water.ctx, x0: 0, y0: C0Y, depth: dPlaneY(HW, 0.5, ZSKY * 0.5) });

  // ---- flatten: composite colours in order; each layer writes its inverse depth exactly the way it writes colour,
  //      blended by its own coverage (source-over), so depth edges are anti-aliased like the picture's edges
  const main = mk(PW, PH), Wd = new Float32Array(PW * PH).fill(1 / ZSKY);
  for (const L of layers) {
    main.ctx.drawImage(L.c, L.x0, L.y0);
    if (!L.depth) continue;
    const w = L.c.width, h = L.c.height, a = L.ctx.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const al = a[(y * w + x) * 4 + 3];
      if (!al) continue;
      const u = L.x0 + x, v = L.y0 + y;
      if (u >= PW || v >= PH) continue;
      const i = v * PW + u, wl = 1 / L.depth(u + 0.5, v + 0.5), k = al / 255;
      Wd[i] = al === 255 ? wl : k * wl + (1 - k) * Wd[i];
    }
  }
  // haze lying on the far shore: colour only, and only on far surfaces (beyond ~150 m), like haze in a real photo
  const img = main.ctx.getImageData(0, 0, PW, PH), px = img.data;
  {
    const ov = mk(PW, 140), ctx = ov.ctx, rm = rand(160), v0 = C0Y - 60;
    for (let k = 0; k < 18; k++) {
      const v = 1012 + rm() * 22 - v0, x = rm() * PW, w = 160 + rm() * 300, h = 6 + rm() * 12;
      const g = ctx.createRadialGradient(x, v, 0, x, v, w / 2);
      g.addColorStop(0, 'rgba(250,222,226,0.38)'); g.addColorStop(1, 'rgba(250,222,226,0)');
      ctx.save(); ctx.translate(x, v); ctx.scale(1, h / (w / 2)); ctx.translate(-x, -v);
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, v - w / 2, w, w); ctx.restore();
    }
    const o = ctx.getImageData(0, 0, PW, 140).data;
    for (let y = 0; y < 140; y++) for (let x = 0; x < PW; x++) {
      const k = (y * PW + x) * 4, i = (y + v0) * PW + x, a = (o[k + 3] / 255) * clamp((1 / 150 - Wd[i]) / (1 / 150 - 1 / 260));
      if (a <= 0) continue;
      for (let c = 0; c < 3; c++) px[i * 4 + c] += (o[k + c] - px[i * 4 + c]) * a;
    }
  }
  // the print's grain: a little luminance noise baked into the photo
  const rg = rand(170);
  for (let i = 0; i < px.length; i += 4) { const n = (rg() - 0.5) * 7; px[i] += n; px[i + 1] += n; px[i + 2] += n; }
  return { rgba: px, W: Wd };
}

// ---------------------------------------------------------------- derived from photo + depth only
const JUMP = (w) => Math.max(0.003, 0.08 * w);   // an inverse-depth step this large is a depth edge (same rule in the shader)
/**
 * Background layer for disocclusion (half resolution), built from the photo and depth map alone: what lies behind each
 * foreground edge, pushed outward under the occluder.
 *   For every pixel near a depth edge, walk outward along its row and column. A step up in depth (something nearer)
 *   blocks the walk; the first clear step down is an edge, and the surface just beyond it is a far-side sample, if it
 *   is clearly behind the start pixel. The pixel takes the mean colour and inverse depth of its samples, weighted by
 *   1/distance² and favouring rows (so the lake's and the deck's horizontal streaks continue at their own row depth).
 *   Smooth surfaces never step, so the lake under a boat or the deck under a bollard is never mistaken for an occluder.
 */
function inpaint(rgba, wmap, R) {
  const hw = PW >> 1, hh = PH >> 1, n = hw * hh;
  const w0 = new Float32Array(n);
  let c = new Float32Array(n * 3);
  for (let y = 0; y < hh; y++) for (let x = 0; x < hw; x++) {
    const i = y * hw + x;
    let wm = 0, r = 0, g = 0, b = 0;
    for (let k = 0; k < 4; k++) {
      const j = (2 * y + (k >> 1)) * PW + 2 * x + (k & 1);
      wm = Math.max(wm, wmap[j]); r += rgba[j * 4]; g += rgba[j * 4 + 1]; b += rgba[j * 4 + 2];
    }
    w0[i] = wm; c[i * 3] = r / 4; c[i * 3 + 1] = g / 4; c[i * 3 + 2] = b / 4;
  }
  // far-side pixels touching an edge hold anti-aliased foreground colour: re-take it from their own surface, along the row
  {
    const c2 = c.slice(), nb = [-hw - 1, -hw, -hw + 1, -1, 1, hw - 1, hw, hw + 1];
    for (let y = 1; y < hh - 1; y++) for (let x = 3; x < hw - 3; x++) {
      const i = y * hw + x;
      let touch = false;
      for (let k = 0; k < 8 && !touch; k++) { const j = i + nb[k]; if (w0[j] > w0[i] + JUMP(w0[j])) touch = true; }
      if (!touch) continue;
      let s = 0, r = 0, g = 0, b = 0;
      for (const dx of [-3, -2, 2, 3]) {
        const j = i + dx;
        if (Math.abs(w0[j] - w0[i]) < JUMP(w0[i]) * 0.5) { s++; r += c[j * 3]; g += c[j * 3 + 1]; b += c[j * 3 + 2]; }
      }
      if (s) { c2[i * 3] = r / s; c2[i * 3 + 1] = g / s; c2[i * 3 + 2] = b / s; }
    }
    c = c2;
  }
  // which pixels can be within R of an edge: near-side seeds, dilated by R (separable running counts)
  const seed = new Uint8Array(n);
  for (let y = 2; y < hh - 2; y++) for (let x = 2; x < hw - 2; x++) {
    const i = y * hw + x, lim = w0[i] - JUMP(w0[i]);
    for (let dy = -2; dy <= 2 && !seed[i]; dy++) for (let dx = -2; dx <= 2; dx++) if (w0[i + dy * hw + dx] < lim) { seed[i] = 1; break; }
  }
  const rowD = new Uint8Array(n), near = new Uint8Array(n);
  for (let y = 0; y < hh; y++) {
    let cnt = 0;
    for (let x = -R; x < hw; x++) {
      if (x + R < hw && seed[y * hw + x + R]) cnt++;
      if (x - R - 1 >= 0 && seed[y * hw + x - R - 1]) cnt--;
      if (x >= 0) rowD[y * hw + x] = cnt > 0 ? 1 : 0;
    }
  }
  for (let x = 0; x < hw; x++) {
    let cnt = 0;
    for (let y = -R; y < hh; y++) {
      if (y + R < hh && rowD[(y + R) * hw + x]) cnt++;
      if (y - R - 1 >= 0 && rowD[(y - R - 1) * hw + x]) cnt--;
      if (y >= 0) near[y * hw + x] = cnt > 0 ? 1 : 0;
    }
  }
  // the walks
  const w = w0.slice(), cOut = c.slice();
  const DIRS = [[1, 0, 1], [-1, 0, 1], [0, -1, 0.45], [0, 1, 0.45]];
  for (let i = 0; i < n; i++) {
    if (!near[i]) continue;
    const xi = i % hw, yi = (i / hw) | 0, wi = w0[i], J = JUMP(wi), behind = wi - J;
    let sq = 0, sw = 0, sr = 0, sg = 0, sb = 0;
    for (const [dx, dy, dq] of DIRS) {
      let x = xi, y = yi, r1 = wi, r2 = wi;
      for (let d = 1; d <= R; d++) {
        x += dx; y += dy;
        if (x < 0 || y < 0 || x >= hw || y >= hh) break;
        const j = y * hw + x, wj = w0[j], ref = r1 > r2 ? r1 : r2;
        if (wj > ref + JUMP(ref)) break;                    // blocked by something nearer
        if (wj < ref - JUMP(ref)) {                         // an edge of this pixel's own surface? sample just past it
          if (Math.abs(ref - wi) > J) break;
          let m = 0, mw = 0, mr = 0, mg = 0, mb = 0;
          for (let e = 1; e <= 3; e++) {                    // three samples beyond the drop (past anti-aliasing)
            const x2 = x + dx * e, y2 = y + dy * e;
            if (x2 < 0 || y2 < 0 || x2 >= hw || y2 >= hh) break;
            const k = y2 * hw + x2;
            if (w0[k] >= behind || w0[k] > wj + JUMP(wj)) break;
            m++; mw += w0[k]; mr += c[k * 3]; mg += c[k * 3 + 1]; mb += c[k * 3 + 2];
          }
          if (m) { const q = dq / (d * d * m); sq += q * m; sw += q * mw; sr += q * mr; sg += q * mg; sb += q * mb; }
          break;
        }
        if (Math.abs(wj - wi) > 2 * J) break;               // drifted off this surface's depth without an edge
        r2 = r1; r1 = wj;
      }
    }
    if (sq) { w[i] = sw / sq; cOut[i * 3] = sr / sq; cOut[i * 3 + 1] = sg / sq; cOut[i * 3 + 2] = sb / sq; }
  }
  const out = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) { out[i * 4] = cOut[i * 3]; out[i * 4 + 1] = cOut[i * 3 + 1]; out[i * 4 + 2] = cOut[i * 3 + 2]; out[i * 4 + 3] = 255; }
  return { rgba: out, w, hw, hh };
}
/** max inverse depth per tile, dilated by one tile: a conservative bound for any ray segment shorter than a tile */
function tileMax(w, ww, wh, ts) {
  const tw = Math.ceil(ww / ts), th = Math.ceil(wh / ts), m = new Float32Array(tw * th);
  for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) { const k = ((y / ts) | 0) * tw + ((x / ts) | 0); if (w[y * ww + x] > m[k]) m[k] = w[y * ww + x]; }
  const d = new Float32Array(tw * th);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    let v = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = clamp(y + dy, 0, th - 1), xx = clamp(x + dx, 0, tw - 1); v = Math.max(v, m[yy * tw + xx]);
    }
    d[y * tw + x] = v * 1.004 + 1e-6;   // margin over half-float rounding of the depth texture
  }
  return { data: d, tw, th };
}
function halfTex(f32, w, h, filter) {
  const u = new Uint16Array(f32.length);
  for (let i = 0; i < f32.length; i++) u[i] = THREE.DataUtils.toHalfFloat(f32[i]);
  const t = new THREE.DataTexture(u, w, h, THREE.RedFormat, THREE.HalfFloatType);
  t.minFilter = t.magFilter = filter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}
function rgbaTex(u8, w, h) {
  const t = new THREE.DataTexture(u8, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}

// ---------------------------------------------------------------- the renderer
const VERT = /* glsl */`void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = /* glsl */`
uniform sampler2D uPhoto, uDepth, uTileF, uBgCol, uBgDep, uTileB, uCap;
uniform vec2 uSize, uC0, uCs, uSunPx;
uniform float uF0, uWmax, uF, uHW, uTime;
uniform vec3 uCam, uSun;
uniform mat3 uRot;
uniform vec4 uPrint;
uniform float uFade, uScan, uScanA, uMist, uDrift, uShim, uGlint, uGlow, uHaze, uWarm;
uniform float uCapA;

const float W1 = 1.0e-5;
const float M_SIDE = 34.0, M_BOT = 150.0;
const vec3 GOLD = vec3(1.0, 0.80, 0.42);

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }

// The view ray C + s·d seen from the photo's camera is a line in the photo, and its photo position is AFFINE in the
// ray's inverse depth w = 1/Z:  uv(w) = A·w + B. So equal steps in w are equal steps along that (epipolar) line.
struct Hit { float w; float wa; };
Hit march(sampler2D dep, sampler2D tmax, vec2 A, vec2 B, float L, float w0, float w1) {
  float span = w0 - w1;
  int nc = int(clamp(ceil(span * L / 22.0), 1.0, 64.0));   // coarse steps of at most 22 photo px
  float dw = span / float(nc);
  float lo = -1.0, hi = -1.0;
  for (int i = 0; i < 64; i++) {
    if (i >= nc) break;
    float wa = w0 - dw * float(i), wb = wa - dw;
    // empty-space skip: if the ray is still in front of the nearest surface in the 3x3 tiles around it, jump on
    if (wb > textureLod(tmax, (A * wa + B) / uSize, 0.0).r) continue;
    float prev = wa;
    for (int j = 1; j <= 12; j++) {   // linear search inside the interval (steep parallax)
      float w = wa - dw * float(j) / 12.0;
      if (w <= textureLod(dep, (A * w + B) / uSize, 0.0).r) { lo = prev; hi = w; break; }
      prev = w;
    }
    if (hi >= 0.0) break;
  }
  if (hi < 0.0) return Hit(w1, w1);
  float front = lo;
  for (int k = 0; k < 7; k++) {   // bisection (relief mapping)
    float m = 0.5 * (lo + hi);
    if (m <= textureLod(dep, (A * m + B) / uSize, 0.0).r) hi = m; else lo = m;
  }
  // two fixed-point steps w ← depth(uv(w)), kept inside the bracket: exact where the surface is locally flat in w
  // (bisection alone only reaches a fraction of the step, too coarse for the sky's w ≈ 0)
  float m = 0.5 * (lo + hi);
  for (int k = 0; k < 2; k++) m = clamp(textureLod(dep, (A * m + B) / uSize, 0.0).r, hi, lo);
  return Hit(m, front);
}

vec2 waveGrad(vec2 p, float t) {
  vec2 g = vec2(0.0);
  g += 0.012 * 7.0 * cos(dot(p, vec2(0.97, 0.24)) * 7.0 - 3.1 * t + 0.3) * vec2(0.97, 0.24);
  g += 0.014 * 4.6 * cos(dot(p, vec2(-0.6, 0.8)) * 4.6 - 2.3 * t + 1.9) * vec2(-0.6, 0.8);
  g += 0.006 * 11.0 * cos(dot(p, vec2(0.45, -0.89)) * 11.0 - 4.4 * t + 4.1) * vec2(0.45, -0.89);
  g += 0.004 * 16.0 * cos(dot(p, vec2(-0.93, -0.37)) * 16.0 - 5.0 * t + 2.6) * vec2(-0.93, -0.37);
  g += 0.020 * 2.7 * cos(dot(p, vec2(0.2, 0.98)) * 2.7 - 1.6 * t + 5.2) * vec2(0.2, 0.98);
  return g;
}

vec3 scene(vec2 q, out float wHit) {
  vec3 d = uRot * vec3((q - uCs) / uF, 1.0);
  vec2 dd = d.xy / d.z;
  vec2 A = uF0 * (uCam.xy - uCam.z * dd);
  vec2 B = uC0 + uF0 * dd;
  float L = length(A);   // photo px per unit of inverse depth along this ray
  float w0 = uWmax;
  if (uCam.z + 0.25 > 0.0) w0 = min(w0, 1.0 / (uCam.z + 0.25));
  Hit hf = march(uDepth, uTileF, A, B, L, w0, W1);
  vec2 uvF = A * hf.w + B;
  vec2 tF = uvF / uSize;

  // did the ray slip behind a depth edge? (the interpolated depth map stretches a skin across the hole)
  // the near and far depth among the 3x3 texels around the hit: a skin stretched across an edge has both sides there
  ivec2 ic = ivec2(floor(uvF)), lim = ivec2(uSize) - 1;
  float wN = hf.w, wR = hf.w;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    float t = texelFetch(uDepth, clamp(ic + ivec2(i, j), ivec2(0), lim), 0).r;
    wN = max(wN, t); wR = min(wR, t);
  }
  float jump = wN - wR;
  float edge = smoothstep(0.8, 1.25, jump / max(0.003, 0.08 * wN));
  float gap = L * jump;                                     // photo px the ray sweeps while crossing this step
  float act = edge * smoothstep(0.6, 1.8, gap);
  // decide in the step model, not on the interpolated skin: where was this ray when it reached the near depth?
  // inside the near object (coverage ≥ ½ in the anti-aliased depth) → a face hit there; outside → it went behind
  vec2 uvN = A * wN + B;
  float cov = (textureLod(uDepth, uvN / uSize, 0.0).r - wR) / max(jump, 1e-6);
  float aa = clamp(fwidth(cov), 0.03, 0.5);
  float cut = act * (1.0 - smoothstep(0.5 - aa, 0.5 + aa, cov));
  uvF = mix(uvF, uvN, act);

  // world hit point of the front layer (for the lake test and the cinemagraph ripple)
  float sF = (1.0 / hf.w - uCam.z) / d.z;
  vec3 PF = uCam + d * sF;
  float tolF = 0.03 + 0.004 * sF;
  float waterF = 1.0 - smoothstep(tolF, 2.0 * tolF, abs(PF.y - uHW));
  vec2 sh = vec2(uShim * waterF * (0.9 * sin(PF.z * 4.1 - uTime * 2.3 + PF.x * 0.9) + 0.6 * sin(PF.z * 9.3 + uTime * 1.7)), 0.0);
  vec3 col = textureLod(uPhoto, (uvF + sh) / uSize, 0.0).rgb;
  float w = hf.w;
  if (cut > 0.002) {   // march the background layer from where the ray went behind the edge
    Hit hb = march(uBgDep, uTileB, A, B, L, hf.wa, W1);
    vec2 uvB = A * hb.w + B;
    col = mix(col, textureLod(uBgCol, (uvB + sh) / uSize, 0.0).rgb, cut);
    w = mix(hf.w, hb.w, cut);
  }
  wHit = w;

  float s = (1.0 / w - uCam.z) / d.z;
  vec3 P = uCam + d * s;
  float dl = length(d);
  vec3 dn = d / dl;
  float S = s * dl;                                         // distance from the camera
  float sunAmt = pow(max(dot(dn, uSun), 0.0), 6.0);

  // sun glints on the lake: glint points anchored on the water plane (a jittered grid, so they parallax with it),
  // each twinkling on its own phase, lit only where the ripple normal can reflect the sun toward the camera
  if (uGlint > 0.001) {
    float tol = 0.03 + 0.004 * s;
    float water = 1.0 - smoothstep(tol, 2.0 * tol, abs(P.y - uHW));
    if (water > 0.0) {
      vec2 g = waveGrad(P.xz, uTime);
      vec3 n = normalize(vec3(-g.x, -1.0, -g.y));
      float lobe = pow(max(dot(reflect(dn, n), uSun), 0.0), 26.0);   // the sun's path on the water
      float k = uF / S;                                               // screen px per metre at this distance
      vec2 cell = vec2(0.45, 0.8), gp = P.xz / cell, gi = floor(gp);
      float spark = 0.0;
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 c = gi + vec2(float(i), float(j));
        vec2 h = vec2(hash12(c), hash12(c + 71.3));
        vec2 dxz = (c + h - gp) * cell;
        vec2 dpx = vec2(dxz.x, dxz.y * max(dn.y, 0.02)) * k;          // foreshortened toward the horizon
        float d2 = dot(dpx, dpx);
        float tw = pow(max(sin(uTime * (3.0 + 4.0 * h.x) + 6.283 * h.y), 0.0), 6.0);
        spark += tw * (exp(-d2 / 2.2) + 0.22 * exp(-d2 / 30.0));
      }
      col += GOLD * water * uGlint * lobe * (1.6 * spark * (1.0 - smoothstep(50.0, 140.0, S)) + 0.07) * smoothstep(4.0, 9.0, S);
    }
  }

  // depth haze, warm toward the sun
  vec3 hazeC = mix(vec3(0.93, 0.78, 0.84), vec3(1.0, 0.83, 0.64), sunAmt);
  col = mix(col, hazeC, uHaze * (1.0 - exp(-S / 900.0)));

  // mist, two parts. (1) an exponential height fog over the lake, integrated in closed form along the ray:
  // τ = ρ·e^(−h0/H)·H/dy·(e^(S·dy/H) − 1), the same law for every ray, so it only depends on where the ray goes.
  // (2) a thin drifting sheet lying 0.45 m above the water: it counts only where the ray crosses it before hitting
  // anything, over the slant path thickness/dy, with its density from drifting noise at the crossing point —
  // so the wisps sit at their own depth, parallax with it, and pass behind the boat, the pier and the post.
  float h0 = uHW - uCam.y, Hs = 1.15, dy = dn.y;
  float base = exp(-h0 / Hs);
  float tau = abs(dy) < 1e-4 ? base * S : base * Hs / dy * (exp(min(S * dy / Hs, 30.0)) - 1.0);
  vec3 mistC = mix(vec3(0.95, 0.86, 0.91), vec3(1.0, 0.88, 0.78), sunAmt * 0.7);
  col = mix(col, mistC, (1.0 - exp(-min(tau * 0.014, 2.0))) * uMist);
  if (dy > 0.002) {
    float sm = (h0 - 0.45) / dy;
    if (sm < S) {
      vec3 Q = uCam + dn * sm;
      float nz = fbm(Q.xz * vec2(0.16, 0.24) + vec2(-uDrift * 0.09, uDrift * 0.02));
      float dens = smoothstep(0.42, 0.72, nz) * smoothstep(0.0, 1.5, S - sm);
      col = mix(col, mistC, (1.0 - exp(-min(dens * 0.07 / dy, 2.5))) * uMist);
    }
  }

  // the sun's glow, in the camera's own picture: its radius follows the focal length, so it looms in the dolly zoom
  vec2 sd = (q - uSunPx) / uF;
  float r2 = dot(sd, sd);
  col += vec3(1.0, 0.78, 0.5) * uGlow * (0.42 * exp(-r2 * 420.0) + 0.22 * exp(-r2 * 26.0));
  return col;
}

void main() {
  vec2 pix = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);
  // the print: a card on the table, scaled and turned about its centre
  vec2 rel = pix - uPrint.xy;
  float ca = cos(uPrint.w), sa = sin(uPrint.w);
  vec2 q = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y) / uPrint.z + vec2(540.0, 960.0);
  float px = 1.0 / uPrint.z;
  float dImg = sdBox(q - vec2(540.0, 960.0), vec2(540.0, 960.0));
  vec2 pc = vec2(540.0, 960.0 + 0.5 * (M_BOT - M_SIDE)), pb = vec2(540.0 + M_SIDE, 960.0 + 0.5 * (M_BOT + M_SIDE));
  float dPap = sdBox(q - pc, pb);
  float kImg = 1.0 - smoothstep(-0.6 * px, 0.6 * px, dImg);
  float kPap = 1.0 - smoothstep(-0.6 * px, 0.6 * px, dPap);

  vec3 col = vec3(0.0);
  if (kPap < 1.0) {   // the table, lit from above, with the print's soft shadow
    float l = 1.0 - smoothstep(200.0, 1500.0, length(pix - vec2(560.0, 620.0)));
    col = mix(vec3(0.045, 0.05, 0.11), vec3(0.15, 0.15, 0.27), l);
    float ds = sdBox(q - pc - vec2(10.0, 30.0), pb);
    col *= 1.0 - 0.62 * (1.0 - smoothstep(-40.0, 90.0, ds));
  }
  if (kPap > 0.0 && kImg < 1.0) {   // paper, with the handwritten caption on the bottom margin
    vec3 paper = mix(vec3(0.96, 0.93, 0.89), vec3(0.91, 0.87, 0.84), smoothstep(0.0, 2100.0, q.y + 0.3 * q.x));
    paper += (hash12(floor(q * 1.5)) - 0.5) * 0.02;
    vec2 cu = vec2(q.x / 1080.0, (q.y - 1920.0) / M_BOT);
    if (cu.y > 0.0 && cu.y < 1.0) paper = mix(paper, vec3(0.2, 0.22, 0.42), texture(uCap, cu).a * 0.9 * uCapA);
    col = mix(col, paper, kPap);
  }
  if (kImg > 0.0) {
    float w;
    vec3 img = scene(q, w);
    // the scan: a gold contour line sweeping through the depth map, far to near, while the print wakes
    if (uScanA > 0.001 && w > 6.0e-5) {
      float lw = log(w), dl = lw - uScan;
      float sg = clamp(0.05 + 1.3 * fwidth(lw), 0.05, 0.3);
      float line = exp(-dl * dl / (sg * sg));
      float trail = dl < 0.0 ? exp(dl * 3.0) * 0.22 : 0.0;
      img = mix(img, img * 0.9 + GOLD * 0.35, trail * uScanA);
      img += GOLD * line * 0.95 * uScanA;
    }
    // afterglow: a warm lift
    img = mix(img, img * vec3(1.06, 0.98, 0.9) + vec3(0.02, 0.008, 0.0), uWarm);
    img = mix(img, img * img * (3.0 - 2.0 * img), 0.22 * uWarm);   // a gentle S-curve keeps the afterglow from washing out
    col = mix(col, img, kImg);
  }
  // vignette, grain, fade from black
  float v = length((pix - vec2(540.0, 880.0)) / vec2(760.0, 1180.0));
  col *= 1.0 - 0.3 * smoothstep(0.55, 1.2, v);
  col += (hash12(pix + fract(uTime * 7.31) * 113.0) - 0.5) * 0.022;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * uFade, 1.0);
}
`;

// ---------------------------------------------------------------- camera and timeline (closed forms of t)
const PIV = [BOAT.X, HW - BOAT.free + 0.1, BOAT.Z];   // the boat: the dolly zoom's subject
const T_GO = 1.6, T_VZ = 5.2, T_SET = 8.4;
const PUSH = [0.42, -0.12, 1.55];                     // push in with a slight lateral orbit
const PITCH_K = 0.7;
function aim(C) {
  const dx = PIV[0] - C[0], dy = PIV[1] - C[1], dz = PIV[2] - C[2];
  return {
    yaw: Math.atan2(dx, dz) - Math.atan2(PIV[0], PIV[2]),
    pitch: PITCH_K * (Math.atan2(dy, Math.hypot(dx, dz)) - Math.atan2(PIV[1], Math.hypot(PIV[0], PIV[2]))),
  };
}
const fwdOf = (yaw, pitch) => [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
const sine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
// the pull: eased in, 97% done by T_SET, then a slow settle to the end with no jump in speed
const pull = (t) => smooth(1 - Math.pow(1 - clamp((t - T_VZ) / (D - T_VZ)), 1.7));
function camera(t) {
  const p = sine((t - T_GO) / (T_VZ - T_GO));
  if (t <= T_VZ) {
    const C = PUSH.map((v) => v * p), a = aim(C);
    return { C, yaw: a.yaw, pitch: a.pitch, f: F0 };
  }
  // dolly zoom: back along the view axis while f·size/distance stays constant → f = F0·(D6 + back)/D6
  const a = aim(PUSH), fw = fwdOf(a.yaw, a.pitch);
  const D6 = (PIV[0] - PUSH[0]) * fw[0] + (PIV[1] - PUSH[1]) * fw[1] + (PIV[2] - PUSH[2]) * fw[2];
  const back = 4.4 * pull(t);
  return { C: PUSH.map((v, i) => v - back * fw[i]), yaw: a.yaw, pitch: a.pitch, f: F0 * (D6 + back) / D6 };
}
const printScale = track([[0, 0.7], [0.9, 0.72, ease.outCubic], [1.45, 0.72], [2.45, 1.0, ease.inOutCubic]]);
const printRot = track([[0, -0.075], [0.9, -0.032, ease.outCubic], [1.45, -0.032], [2.45, 0, ease.inOutCubic]]);
const printY = track([[0, 1180], [0.9, 838, ease.outCubic], [1.45, 838], [2.45, 960, ease.inOutCubic]]);
const glowK = track([[0, 0.1], [2.0, 0.14], [T_VZ, 0.2], [T_SET, 0.34], [D, 0.4]]);
const hazeK = track([[0, 0], [2.4, 0.04], [T_VZ, 0.05], [T_SET, 0.08], [D, 0.08]]);

export default defineDemo({
  id: '132-photo-parallax',
  title: '새벽 호숫가',
  tech: '2.5D 사진 시차 · 깊이맵 광선 진행 + 돌리 줌',
  duration: D,
  background: '#0b0d1c',

  async setup(api) {
    await fontReady(`400 64px ${PEN}`, CAPTION);

    // ---- the photo and its depth map (all the renderer will ever see of the scene)
    const { rgba, W: wF } = paintPhoto(rand(132));
    let wmax = 0;
    for (let i = 0; i < wF.length; i++) if (wF[i] > wmax) wmax = wF[i];
    // ---- derived from those two only: the background layer and the tile maxima
    const bg = inpaint(rgba, wF, 64);
    const tF = tileMax(wF, PW, PH, TS), tB = tileMax(bg.w, bg.hw, bg.hh, TS / 2);

    const cap = mk(1080, 150);
    cap.ctx.font = `400 64px ${PEN}`; cap.ctx.fillStyle = '#fff'; cap.ctx.textBaseline = 'alphabetic';
    cap.ctx.fillText(CAPTION, 52, 96);
    const capTex = new THREE.CanvasTexture(cap.c);
    capTex.flipY = false; capTex.colorSpace = THREE.NoColorSpace; capTex.generateMipmaps = false; capTex.minFilter = THREE.LinearFilter;

    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const sun = new THREE.Vector3((SUN_U - C0X) / F0, (SUN_V - C0Y) / F0, 1).normalize();
    this.U = {
      uPhoto: { value: rgbaTex(new Uint8Array(rgba.buffer), PW, PH) },
      uDepth: { value: halfTex(wF, PW, PH, THREE.LinearFilter) },
      uTileF: { value: halfTex(tF.data, tF.tw, tF.th, THREE.NearestFilter) },
      uBgCol: { value: rgbaTex(bg.rgba, bg.hw, bg.hh) },
      uBgDep: { value: halfTex(bg.w, bg.hw, bg.hh, THREE.LinearFilter) },
      uTileB: { value: halfTex(tB.data, tB.tw, tB.th, THREE.NearestFilter) },
      uCap: { value: capTex },
      uSize: { value: new THREE.Vector2(PW, PH) },
      uC0: { value: new THREE.Vector2(C0X, C0Y) },
      uCs: { value: new THREE.Vector2(CSX, CSY) },
      uSunPx: { value: new THREE.Vector2() },
      uF0: { value: F0 }, uWmax: { value: wmax * 1.002 }, uF: { value: F0 }, uHW: { value: HW }, uTime: { value: 0 },
      uCam: { value: new THREE.Vector3() }, uSun: { value: sun }, uRot: { value: new THREE.Matrix3() },
      uPrint: { value: new THREE.Vector4(540, 960, 1, 0) },
      uFade: { value: 1 }, uScan: { value: 0 }, uScanA: { value: 0 }, uMist: { value: 0 }, uDrift: { value: 0 },
      uShim: { value: 0 }, uGlint: { value: 0 }, uGlow: { value: 0 }, uHaze: { value: 0 }, uWarm: { value: 0 }, uCapA: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: this.U, depthTest: false, depthWrite: false });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = renderer;
    this.sun = sun;
    renderer.compile(this.scene, this.cam);
  },

  frame(t) {
    const U = this.U, c = camera(t);
    const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    // camera → world: R = Ry(yaw)·Rx(pitch)  (Y down: a positive pitch looks down)
    const R = [cy, -sy * sp, sy * cp, 0, cp, sp, -sy, -cy * sp, cy * cp];
    U.uRot.value.set(...R);
    U.uCam.value.set(c.C[0], c.C[1], c.C[2]);
    U.uF.value = c.f;
    // the sun on the stage (at infinity: only rotation and focal length move it)
    const s = this.sun, sc = [R[0] * s.x + R[3] * s.y + R[6] * s.z, R[1] * s.x + R[4] * s.y + R[7] * s.z, R[2] * s.x + R[5] * s.y + R[8] * s.z];
    U.uSunPx.value.set(CSX + c.f * sc[0] / sc[2], CSY + c.f * sc[1] / sc[2]);

    U.uPrint.value.set(540, printY(t), printScale(t), printRot(t));
    U.uFade.value = 0.25 + 0.75 * ease.outCubic(clamp(t / 0.55));
    U.uCapA.value = 1 - ramp(t, 1.45, 1.75);
    const ps = 0.5 - 0.5 * Math.cos(Math.PI * clamp((t - 1.05) / 1.35));   // far → near in log inverse depth
    U.uScan.value = lerp(Math.log(2.5e-4), Math.log(0.42), ps);
    U.uScanA.value = ramp(t, 1.0, 1.2) * (1 - ramp(t, 2.2, 2.55));
    U.uMist.value = ramp(t, 1.8, 3.4);
    U.uDrift.value = Math.max(0, t - T_GO);
    U.uShim.value = 1.3 * ramp(t, 1.8, 3.0);
    U.uTime.value = t;
    U.uGlint.value = ramp(t, 8.0, 9.0);
    U.uGlow.value = glowK(t);
    U.uHaze.value = hazeK(t);
    U.uWarm.value = ramp(t, 8.2, 9.8) * 0.8;
    this.renderer.render(this.scene, this.cam);
  },
});
