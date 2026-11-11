/*
 * 139 · 구름 위 봉우리 — "text behind the subject": a huge title set between two depths of the scene.
 *
 * Setup paints a dawn mountain range above a sea of clouds as separate layers, each with its own depth: three far
 * ridges, cloud-sea bands at their feet, three cloud wisps around the title (two at one depth, one on an oblique plane
 * whose depth changes across the screen), the main summit (a hiker with a flag stands on it) and a near cloud sea.
 * Every cloud texel also stores a thickness (a dome per puff), so a cloud is a slab [zNear, zFar], not a sheet.
 *
 * frame(t) draws full-screen quads with one ShaderMaterial in four modes. Per pixel it projects every layer through a
 * moving perspective camera (parallax ∝ 1/depth), fogs each layer by its own depth, and composites them front to back
 * into two stacks split at the title plane z_T: in front of the title (F, transmittance T_F) and behind it (B).
 * A layer that straddles the plane is split by optical depth: behind gets alpha 1 − (1 − a)^s, in front
 * 1 − (1 − a)^(1 − s), with s the fraction of its slab behind z_T.
 *   final = F + T_F·B + T_Fm·α_T·(title − B)      (T_Fm: front transmittance with the summit's matte feathered)
 * Light wrap: quarter-resolution passes of the same shader render "everything behind the title" and "everything
 * behind the summit"; their blurs bleed over the inner edges of the title and of the summit. A fourth quarter-res pass
 * renders only the sunlit sky as seen through every layer (title included); a radial blur of it toward the sun gives the
 * beams of the climax, so the letters cast shafts of shadow.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2;
const F0 = 1500;                           // reference camera: focal length (px); principal point (540, 960) is the horizon row
// depths (world units). The camera starts at the origin looking down +Z; X right, Y down (screen orientation).
const Z_R3 = 3200, Z_C3 = 2650, Z_R2 = 2000, Z_C2 = 1720, Z_R1 = 1250, Z_C1 = 1060, Z_WB = 990;
const Z_T = 760;                           // the title plane
const Z_WF = 610, Z_S = 420, Z_CN = 300;
const SUN_X = 822;
const TITLE = '정상', SUB = '오늘 오른 곳';
const BHS = `"${FONTS.blackHanSans.family}"`, PRE = `"${FONTS.pretendard.family}"`;
const LW = 270, LH = 480;                  // the light-wrap passes: quarter resolution

// ---------------------------------------------------------------- palette (sRGB 0..1): dawn, and the pre-dawn sky
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const SKY_DAWN = ['#1c2154', '#3d3d85', '#8f6bae', '#eb98b2', '#ffcda8'].map(hex);
const SKY_PRE = ['#0e1131', '#1f2155', '#4a3a78', '#99608a', '#cf8a82'].map(hex);
// three colours per layer: shadow → lit → snow/mist (ridges, summit) or shadow → mid → lit (clouds)
const PAL = [
  '#7a6aa3', '#a587b8', '#f2d3df',   // 0  R3
  '#544b86', '#86679f', '#e3bdd0',   // 3  R2
  '#3a3468', '#644d88', '#c99cb9',   // 6  R1
  '#191739', '#4a3568', '#f6cfd8',   // 9  summit
  '#a28dc2', '#dcabc8', '#ffe4d2',   // 12 far cloud sea
  '#7c6aa8', '#cf9cc0', '#ffdcc9',   // 15 near-ish cloud sea (C1)
  '#1f2149', '#3f3c74', '#f2a9b8',   // 18 near cloud sea, in the summit's shadow
  '#b48fc0', '#e8b6cc', '#fff0e4',   // 21 wisps
].map(hex);
const C = {
  hazeD: hex('#d3a2c4'), hazeP: hex('#5a4f86'), hazeWD: hex('#ffcaa8'), hazeWP: hex('#9a6a86'),
  rim: hex('#ffcfa0'), titTop: hex('#fff7ee'), titBot: hex('#ffd9cb'), ink: hex('#17142f'), flag: hex('#ff4a2a'), cream: hex('#fff3e8'),
};

// ---------------------------------------------------------------- small helpers
const sm5 = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };   // smootherstep
const outBack = (p, c) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
const grey = (v) => { const n = Math.round(clamp(v) * 255); return `rgb(${n},${n},${n})`; };
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, ctx: c.getContext('2d', { willReadFrequently: true }) };   // setup canvases are all read back
}
function chan(ctx, w, h, k = 0) {
  const d = ctx.getImageData(0, 0, w, h).data, out = new Float32Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + k] / 255;
  return out;
}
/** separable box blur, three passes ≈ Gaussian; wrapX for textures that tile horizontally */
function blur(src, w, h, r, wrapX = false) {
  r = Math.max(1, Math.round(r));
  const a = Float32Array.from(src), b = new Float32Array(src.length), inv = 1 / (2 * r + 1);
  const ix = (x) => (wrapX ? ((x % w) + w) % w : x < 0 ? 0 : x >= w ? w - 1 : x);
  const iy = (y) => (y < 0 ? 0 : y >= h ? h - 1 : y);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      const o = y * w;
      let s = 0;
      for (let k = -r; k <= r; k++) s += a[o + ix(k)];
      for (let x = 0; x < w; x++) { b[o + x] = s * inv; s += a[o + ix(x + r + 1)] - a[o + ix(x - r)]; }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += b[iy(k) * w + x];
      for (let y = 0; y < h; y++) { a[y * w + x] = s * inv; s += b[iy(y + r + 1) * w + x] - b[iy(y - r) * w + x]; }
    }
  }
  return a;
}
/** RGBA8 data texture from up to four channels (Float32Array 0..1 or a constant) */
function pack(w, h, ch, repeat = false) {
  const u8 = new Uint8Array(w * h * 4);
  for (let c = 0; c < 4; c++) {
    const v = ch[c] ?? 1;
    for (let i = 0; i < w * h; i++) u8[i * 4 + c] = Math.round(clamp(typeof v === 'number' ? v : v[i]) * 255);
  }
  const t = new THREE.DataTexture(u8, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
  t.wrapS = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}
function catmull(p0, p1, p2, p3, s) {
  const s2 = s * s, s3 = s2 * s;
  return 0.5 * (2 * p1 + (p2 - p0) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (3 * p1 - p0 - 3 * p2 + p3) * s3);
}
/** a silhouette y(x): Catmull-Rom through control points plus a few octaves of sine roughness */
function ridgeFn(pts, r, rough) {
  const ph = Array.from({ length: 6 }, () => r() * TAU);
  return (x) => {
    let i = 0;
    while (i < pts.length - 2 && pts[i + 1][0] < x) i++;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    return catmull(p0[1], p1[1], p2[1], p3[1], clamp((x - p1[0]) / (p2[0] - p1[0])))
      + rough * (0.45 * Math.sin(x * 0.013 + ph[0]) + 0.3 * Math.sin(x * 0.031 + ph[1]) + 0.18 * Math.sin(x * 0.071 + ph[2])
        + 0.1 * Math.sin(x * 0.17 + ph[3]) + 0.06 * Math.sin(x * 0.41 + ph[4]) + 0.035 * Math.sin(x * 0.93 + ph[5]));
  };
}

// ---------------------------------------------------------------- the far ridges (cards: shade, alpha, rim)
// Each ridge is a card at one depth, painted in reference-screen px (where it sits for the camera at the origin).
// Shade (stored premultiplied by alpha) indexes the layer's three colours: 0 shadow, 0.5 lit face, 1 snow / foot mist.
const RIDGES = {
  R3: { z: Z_R3, x0: -220, y0: 730, w: 1520, h: 540, rough: 9, snow: 845, mist: 150,
    pts: [[-220, 880], [-80, 812], [60, 768], [170, 812], [262, 796], [362, 842], [470, 815], [580, 852], [690, 832], [780, 905], [860, 992], [940, 928], [1040, 872], [1140, 836], [1300, 868]] },
  R2: { z: Z_R2, x0: -220, y0: 815, w: 1520, h: 470, rough: 7, snow: 0, mist: 120,
    pts: [[-220, 905], [-80, 872], [40, 846], [150, 884], [250, 864], [350, 906], [460, 882], [560, 932], [660, 912], [760, 962], [860, 1016], [960, 966], [1060, 936], [1160, 914], [1300, 942]] },
  R1: { z: Z_R1, x0: -220, y0: 860, w: 1520, h: 450, rough: 6, snow: 0, mist: 100,
    pts: [[-220, 962], [-90, 932], [20, 906], [120, 942], [220, 926], [330, 972], [440, 956], [560, 992], [680, 986], [780, 1022], [860, 1050], [950, 1012], [1040, 986], [1150, 970], [1300, 1002]] },
};
function paintRidge(L, r) {
  const k = 1, tw = Math.round(L.w * k), th = Math.round(L.h * k);
  const fn = ridgeFn(L.pts, r, L.rough);
  const X0 = L.x0 - 400, NX = L.w + 800;            // slope table with margin (spines lean sideways)
  const yl = new Float32Array(NX + 1);
  for (let i = 0; i <= NX; i++) yl[i] = fn(X0 + i);
  const slope = (x) => { const i = clamp(Math.round(x - X0), 9, NX - 9); return (yl[i + 9] - yl[i - 9]) / 18; };
  const A = new Float32Array(tw * th), S = new Float32Array(tw * th);
  const jr = rand(r() * 1e9 | 0), jag = Array.from({ length: 4 }, () => jr() * TAU);
  for (let i = 0; i < tw; i++) {
    const x = L.x0 + (i + 0.5) / k, ry = fn(x), side = x < SUN_X ? 1 : -1;
    for (let j = 0; j < th; j++) {
      const y = L.y0 + (j + 0.5) / k, d = Math.max(0, y - ry);
      const a = clamp((y - ry) * k + 0.5);
      // facets: the slope a little to the side as we go down (slanted spines); faces turned to the sun are lit
      const lean = 0.42 + 0.18 * Math.sin(d * 0.045 + jag[0]) + 0.1 * Math.sin(x * 0.02 + jag[1]);
      const s = slope(x - side * lean * d) * side;
      let sh = 0.16 + 0.3 * smooth((s + 0.03) / 0.3);
      if (L.snow) {   // snow caps on the peaks that rise above the snow line, ragged lower edge
        const depth = (L.snow - ry) * 0.55 + 6 * Math.sin(x * 0.11 + jag[2]) + 4 * Math.sin(x * 0.27 + jag[3]);
        const cap = smooth(1 - (d - depth) / 3) * smooth((L.snow - ry) / 12);
        sh = lerp(sh, sh > 0.3 ? 0.98 : 0.8, cap);
      }
      sh = lerp(sh, 0.9, smooth((d - L.mist * 0.3) / L.mist) * 0.8);   // the foot dissolves into mist
      A[j * tw + i] = a; S[j * tw + i] = sh * a;
    }
  }
  const b = blur(A, tw, th, 2 * k), rim = new Float32Array(tw * th);
  for (let i = 0; i < rim.length; i++) rim[i] = clamp(2 * A[i] * (1 - b[i]));
  return pack(tw, th, [S, A, rim, 1]);
}

// ---------------------------------------------------------------- the main summit (shade, alpha, rim, feathered matte)
const SUMMIT = { x0: -180, y0: 620, w: 1440, h: 1400, k: 1.2,
  pts: [[-180, 872], [-60, 836], [60, 806], [160, 784], [235, 770], [300, 757], [365, 739], [420, 718], [462, 701], [492, 691],
    [520, 689], [548, 698], [585, 722], [628, 760], [668, 812], [700, 860], [735, 920], [772, 985], [815, 1055], [870, 1120],
    [950, 1180], [1060, 1235], [1260, 1300]] };
function paintSummit(r) {
  const { x0, y0, w, h, k } = SUMMIT, tw = Math.round(w * k), th = Math.round(h * k);
  const fn = ridgeFn(SUMMIT.pts, r, 2.6);
  const sil = (c) => { c.beginPath(); c.moveTo(x0 - 20, y0 + h + 20); for (let x = x0 - 20; x <= x0 + w + 20; x += 2) c.lineTo(x, fn(x)); c.lineTo(x0 + w + 20, y0 + h + 20); };
  const poly = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };
  const al = mk(tw, th), sh = mk(tw, th);
  for (const o of [al, sh]) o.ctx.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
  al.ctx.fillStyle = '#fff'; sil(al.ctx); al.ctx.fill();
  // shade is painted over black inside a clip of the silhouette, so it comes out premultiplied by the coverage
  const s = sh.ctx;
  s.fillStyle = '#000'; s.fillRect(x0, y0, w, h);
  s.save(); sil(s); s.clip();
  s.fillStyle = grey(0.1); s.fillRect(x0 - 20, y0 - 20, w + 40, h + 40);
  // the sun is behind and to the right: faces right of the main spine catch the light
  const spine = [[506, 640], [506, 690], [520, 742], [503, 800], [532, 868], [514, 940], [552, 1030], [534, 1120], [580, 1230], [560, 1350], [610, 1500], [600, 2060]];
  s.fillStyle = grey(0.4); poly(s, [...spine, [1300, 2060], [1300, 640]]); s.fill();
  // a brighter plane along the right flank
  const flank = [], inner = [];
  for (let x = 540; x <= 905; x += 5) { flank.push([x, fn(x) - 2]); inner.push([x - 30, fn(x) + 42]); }
  s.fillStyle = grey(0.56); poly(s, [...flank, ...inner.reverse()]); s.fill();
  // crevices on the lit side, rock planes on the shadow side
  s.fillStyle = grey(0.27); poly(s, [[600, 760], [622, 792], [596, 850], [618, 930], [585, 982], [580, 880]]); s.fill();
  s.fillStyle = grey(0.3); poly(s, [[690, 905], [708, 936], [676, 1010], [690, 1090], [660, 1062], [668, 985]]); s.fill();
  s.fillStyle = grey(0.2); poly(s, [[300, 768], [328, 802], [312, 862], [334, 932], [296, 902], [290, 830]]); s.fill();
  s.fillStyle = grey(0.19); poly(s, [[160, 808], [186, 840], [172, 902], [146, 872]]); s.fill();
  s.fillStyle = grey(0.21); poly(s, [[410, 724], [432, 762], [418, 822], [396, 792]]); s.fill();
  // strata
  s.lineCap = 'round'; s.lineWidth = 3;
  for (const [v, x1, y1, x2, y2] of [[0.5, 548, 822, 575, 864], [0.48, 600, 992, 640, 1042], [0.5, 704, 1104, 744, 1152],
    [0.16, 420, 862, 446, 906], [0.17, 300, 942, 330, 992], [0.16, 180, 962, 204, 1002]]) {
    s.strokeStyle = grey(v); s.beginPath(); s.moveTo(x1, y1); s.lineTo(x2, y2); s.stroke();
  }
  // snow hugging the ridge near the apex (lit side brighter)
  const snow = (xa, xb, v, dep) => {
    const top = [], bot = [];
    for (let x = xa; x <= xb; x += 3) {
      const e = smooth((x - xa) / 18) * smooth((xb - x) / 18);
      top.push([x, fn(x) - 3]); bot.push([x, fn(x) + e * (dep + 6 * Math.sin(x * 0.09) + 3 * Math.sin(x * 0.23))]);
    }
    s.fillStyle = grey(v); poly(s, [...top, ...bot.reverse()]); s.fill();
  };
  snow(506, 650, 0.95, 11); snow(430, 509, 0.7, 9);
  s.restore();
  const A = chan(al.ctx, tw, th, 3), S = chan(s, tw, th, 0);
  // rim: the inner edge band; matte: a slightly dilated, feathered copy (for the title only); wide: for the light wrap
  const b1 = blur(A, tw, th, 2.6 * k), b2 = blur(A, tw, th, 2 * k), wide = blur(A, tw, th, 16 * k);
  const rim = new Float32Array(A.length), mat = new Float32Array(A.length);
  for (let i = 0; i < A.length; i++) { rim[i] = clamp(2 * A[i] * (1 - b1[i])); mat[i] = Math.max(A[i], smooth((b2[i] - 0.06) / 0.5)); }
  // the hiker's feet: the flat top just right of the apex
  return { t1: pack(tw, th, [S, A, rim, mat]), t2: pack(tw, th, [wide, 0, 0, 1]), feet: [508, fn(508) + 1.2] };
}

// ---------------------------------------------------------------- clouds (shade, alpha, thickness), tiling horizontally
/**
 * Clouds are painted group by group (a row of a cloud sea, or one wisp), back to front, on ONE canvas whose alpha is the
 * coverage and whose grey is the shade (so shade·alpha comes out premultiplied). A group is the union of flattened
 * puffs (ellipses, aspect asp). Only its outer top edge is lit: the rim tone fills the union, then the body tone fills
 * the union shifted down by the rim width, clipped to the union. Before a group is painted, a contact shadow (the union
 * shifted up) darkens what is already there ('source-atop', so it never paints empty sky). The thickness canvas gets a
 * dome per puff (max of sqrt(1 − ρ²) profiles), taller for bigger puffs.
 */
function cloudGroup(s, b, puffs, asp, { body, rim, rimW, shade = 0.1, rmax, clipBase = null, env = null }) {
  const Ravg = puffs.reduce((q, p) => q + p[2], 0) / puffs.length;
  const path = (dx, dy, k = 1) => {
    s.beginPath();
    if (env) {   // a sea row: everything below its top envelope (no holes between heaps), tiling
      const P = env.length;
      s.moveTo(-4 + dx, 1e4);
      for (let x = -4; x <= P + 4; x += 2) s.lineTo(x + dx, env[(x + P) % P] + dy);
      s.lineTo(P + 4 + dx, 1e4);
      return;
    }
    for (const [x, y, R, a = asp] of puffs) { s.moveTo(x + dx + a * R * k, y + dy); s.ellipse(x + dx, y + dy, a * R * k, R * k, 0, 0, TAU); }
  };
  s.save();
  if (clipBase !== null) { s.beginPath(); s.rect(-1e4, -1e4, 2e4, clipBase + 1e4); s.clip(); }   // flat-bottomed
  s.globalCompositeOperation = 'source-atop';
  s.fillStyle = grey(body[0] - shade); path(0, -0.16 * Ravg, 1.02); s.fill();
  s.globalCompositeOperation = 'source-over';
  s.fillStyle = grey(rim); path(0, 0); s.fill();
  s.save(); path(0, 0); s.clip();
  const ys = puffs.map((p) => p[1]), y0 = Math.min(...ys) - Ravg, y1 = Math.max(...ys) + Ravg;
  const g = s.createLinearGradient(0, y0, 0, y1);
  body.forEach((v, i) => g.addColorStop(i / (body.length - 1) * (body.length > 2 && i === 1 ? 0.8 : 1), grey(v)));
  s.fillStyle = g; path(-0.25 * rimW * Ravg, rimW * Ravg); s.fill();
  s.restore();
  s.restore();
  b.save();
  if (clipBase !== null) { b.beginPath(); b.rect(-1e4, -1e4, 2e4, clipBase + 1e4); b.clip(); }
  for (const [x, y, R, a = asp] of puffs) {
    b.save(); b.translate(x, y); b.scale(a, 1);
    const g2 = b.createRadialGradient(0, 0, 0, 0, 0, R), hgt = Math.min(1, R / rmax);
    for (const [o, v] of [[0, 1], [0.5, 0.87], [0.8, 0.6], [0.95, 0.31], [1, 0]]) g2.addColorStop(o, grey(v * hgt));
    b.fillStyle = g2; b.fillRect(-R, -R, 2 * R, 2 * R);
    b.restore();
  }
  b.restore();
}
function cloudCanvases(P, Hh) {
  const sh = mk(P, Hh), bu = mk(P, Hh);
  bu.ctx.fillStyle = '#000'; bu.ctx.fillRect(0, 0, P, Hh);
  bu.ctx.globalCompositeOperation = 'lighten';
  return { sh, bu };
}
function cloudTex({ sh, bu }, P, Hh, soft = 0) {
  let A = chan(sh.ctx, P, Hh, 3), S = chan(sh.ctx, P, Hh, 0);
  for (let i = 0; i < S.length; i++) S[i] *= A[i];                                   // premultiply
  const Bm = chan(bu.ctx, P, Hh, 0);
  if (soft) { A = blur(A, P, Hh, soft, true); S = blur(S, P, Hh, soft, true); }   // same blur on both keeps S premultiplied
  return pack(P, Hh, [S, A, Bm, 1], true);
}
/**
 * A sea of clouds: rows of cumulus heaps, back to front. A heap is a wide base ellipse with small puffs riding a dome
 * (a bumpy, cauliflower top). Each row is lit from the top: a strong vertical gradient, so its bright top stands out
 * against the shadowed bottom of the row behind it. Solid below the last row.
 */
function paintSea(r, P, Hh, rows) {
  const cv = cloudCanvases(P, Hh), { sh, bu } = cv;
  const rmax = Math.max(...rows.map((q) => q.hmax)) * 0.6;
  rows.forEach((row, ri) => {
    const puffs = [];
    const add = (px, py, R, a = row.asp) => { for (const dx of [-P, 0, P]) if (px + dx + a * R > -4 && px + dx - a * R < P + 4) puffs.push([px + dx, py, R, a]); };
    let x = r() * row.wmin;
    while (x < P) {
      const Wc = lerp(row.wmin, row.wmax, r()), Hc = lerp(row.hmin, row.hmax, r()), base = row.y + (r() - 0.5) * row.jy;
      add(x, base, Hc * 0.5, Wc / (1.0 * Hc));                                    // the heap's flat body
      const n = Math.max(3, Math.round(Wc / (Hc * 0.42)));
      for (let i = 0; i < n; i++) {                                                  // bumps riding a dome
        const u = (i + 0.5 * r()) / n, dome = Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * u)), 0.9), R = Hc * (0.24 + 0.16 * r());
        add(x + (u - 0.5) * Wc * 0.9, base - Hc * (0.3 + 0.7 * dome) + R, R, 1.15);
      }
      x += Wc * (0.55 + 0.3 * r());
    }
    // the row's top envelope: per column, where the union of its puffs first reaches half coverage (sub-pixel)
    const m = mk(P, Hh).ctx;
    m.fillStyle = '#fff'; m.beginPath();
    for (const [px, py, R, a] of puffs) { m.moveTo(px + a * R, py); m.ellipse(px, py, a * R, R, 0, 0, TAU); }
    m.fill();
    const A = chan(m, P, Hh, 3), env = new Float32Array(P);
    for (let x = 0; x < P; x++) {
      let y = 0;
      while (y < Hh && A[y * P + x] < 0.5) y++;
      const a0 = y > 0 ? A[(y - 1) * P + x] : 0, a1 = y < Hh ? A[y * P + x] : 1;
      env[x] = Math.min(row.y, y - 0.5 + (0.5 - a0) / Math.max(1e-3, a1 - a0));
    }
    cloudGroup(sh.ctx, bu.ctx, puffs, row.asp, { body: [row.sh + 0.3, row.sh, row.sh - 0.12], rim: row.lit, rimW: row.rim, shade: 0.1, rmax, env });
  });
  const last = rows[rows.length - 1];   // the bottom rows clamp downward: keep them one flat tone
  sh.ctx.fillStyle = grey(last.sh - 0.12); sh.ctx.fillRect(0, Hh - 40, P, 40);
  bu.ctx.globalCompositeOperation = 'source-over'; bu.ctx.fillStyle = '#000'; bu.ctx.fillRect(0, Hh - 40, P, 40);
  return cloudTex(cv, P, Hh);
}
/** flat-bottomed wisps: a chain of flattened puffs, biggest in the middle, cut by a flat base */
function paintWisps(r, P, Hh, list) {
  const cv = cloudCanvases(P, Hh), { sh, bu } = cv;
  for (const wsp of list) {
    const n = Math.max(4, Math.round(wsp.L / (wsp.T * 1.15)));
    const ps = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), R = wsp.T * (0.42 + 0.58 * Math.pow(Math.sin(Math.PI * (0.06 + 0.88 * u)), 0.8)) * (0.82 + 0.36 * r());
      ps.push([wsp.x - wsp.L / 2 + u * wsp.L, wsp.base - R * 0.6, R]);
    }
    for (const dx of [-P, 0, P]) {
      if (wsp.x + dx + wsp.L < -40 || wsp.x + dx - wsp.L > P + 40) continue;
      cloudGroup(sh.ctx, bu.ctx, ps.map(([x, y, R]) => [x + dx, y, R]), 1.9, { body: [0.62, 0.3], rim: 0.96, rimW: 0.2, shade: 0, rmax: wsp.T, clipBase: wsp.base });
    }
  }
  return cloudTex(cv, P, Hh, 1.4);
}
const SEA = { P: 1600, Hh: 380, rows: [{ y: 120, hmin: 30, hmax: 46, wmin: 90, wmax: 170, jy: 12, asp: 1.3, sh: 0.52, rim: 0.1, lit: 0.95 },
  { y: 196, hmin: 40, hmax: 62, wmin: 120, wmax: 220, jy: 14, asp: 1.3, sh: 0.44, rim: 0.09, lit: 0.92 }, { y: 276, hmin: 52, hmax: 80, wmin: 160, wmax: 280, jy: 14, asp: 1.25, sh: 0.36, rim: 0.08, lit: 0.88 }] };
// the near sea, seen from just above: small, lighter heaps at the back, big heaps in the summit's shadow at the front
const NEAR = { P: 2000, Hh: 640, rows: [{ y: 110, hmin: 40, hmax: 66, wmin: 120, wmax: 220, jy: 14, asp: 1.4, sh: 0.56, rim: 0.08, lit: 0.9 },
  { y: 214, hmin: 58, hmax: 92, wmin: 180, wmax: 320, jy: 18, asp: 1.35, sh: 0.46, rim: 0.07, lit: 0.84 }, { y: 340, hmin: 78, hmax: 120, wmin: 250, wmax: 430, jy: 20, asp: 1.3, sh: 0.37, rim: 0.06, lit: 0.78 },
  { y: 490, hmin: 100, hmax: 150, wmin: 340, wmax: 560, jy: 22, asp: 1.25, sh: 0.28, rim: 0.05, lit: 0.7 }] };
const WISP = { P: 2400, Hh: 200, list: [{ x: 260, L: 460, T: 46, base: 150 }, { x: 1020, L: 300, T: 36, base: 140 }, { x: 1640, L: 560, T: 52, base: 156 }, { x: 2190, L: 220, T: 30, base: 132 }] };
const WISP_K = 92 / 200;                   // the oblique wisp: world units per texel (band 92 world units tall)

// ---------------------------------------------------------------- the title and the subtitle (coverage textures)
const TT = { x0: 20, y0: 340, w: 1040, h: 640, k: 1.3, inkTop: 418, inkH: 452, gap: 30 };
function paintTitle() {
  const { x0, y0, w, h, k } = TT, tw = Math.round(w * k), th = Math.round(h * k);
  const m = mk(8, 8).ctx;
  m.font = `400 100px ${BHS}`;
  const g = Array.from(TITLE).map((ch) => m.measureText(ch));
  const inkH = Math.max(...g.map((q) => q.actualBoundingBoxAscent + q.actualBoundingBoxDescent));
  let size = 100 * TT.inkH / inkH;
  const inkW = (q) => q.actualBoundingBoxLeft + q.actualBoundingBoxRight;
  const total = (sz) => (inkW(g[0]) + inkW(g[1])) * sz / 100 + TT.gap;
  if (total(size) > 870) size *= (870 - TT.gap) / (total(size) - TT.gap);
  const asc = Math.max(...g.map((q) => q.actualBoundingBoxAscent)) * size / 100;
  const base = TT.inkTop + asc, left = 540 - total(size) / 2;
  const c = mk(tw, th), ctx = c.ctx;
  ctx.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
  ctx.font = `400 ${size}px ${BHS}`; ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic';
  const x1 = left + g[0].actualBoundingBoxLeft * size / 100;
  const x2 = left + inkW(g[0]) * size / 100 + TT.gap + g[1].actualBoundingBoxLeft * size / 100;
  ctx.fillText(TITLE[0], x1, base); ctx.fillText(TITLE[1], x2, base);
  const A = chan(ctx, tw, th, 3), Bl = blur(A, tw, th, 11 * k);
  const e0 = left + inkW(g[0]) * size / 100;
  return {
    tex: pack(tw, th, [A, Bl, 0, 1]),
    split: e0 + TT.gap / 2,                                    // x between the two syllables
    piv: [left + inkW(g[0]) * size / 200, e0 + TT.gap + inkW(g[1]) * size / 200],
    base, top: base - asc, bottom: base - asc + inkH * size / 100,
  };
}
function paintSub() {
  const c = mk(1080, 120), ctx = c.ctx;
  ctx.font = `700 42px ${PRE}`; ctx.letterSpacing = '9px'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
  ctx.fillText(SUB, 540 + 4.5, 60);
  const wdt = ctx.measureText(SUB).width;
  const A = chan(ctx, 1080, 120, 3), Bl = blur(A, 1080, 120, 7);
  return { tex: pack(1080, 120, [A, Bl, 0, 1]), half: wdt / 2 };
}

// ---------------------------------------------------------------- the renderer
const VERT = /* glsl */`void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const f1 = (v) => v.toFixed(1);
const FRAG = /* glsl */`
#define PP vec2(540.0, 960.0)
const float ZT = ${f1(Z_T)}, ZS = ${f1(Z_S)};
uniform vec2 uRes, uSun, uShake, uPiv, uFeet;
uniform vec3 uCam, uWvA, uDim, uHaze, uHazeW, uRimC, uTitTop, uTitBot, uInk, uFlag, uCream;
uniform vec2 uWvT;
uniform float uF, uTime, uSunI, uRim, uWrapS, uWrapT, uFog, uSubA, uSubY, uSubW, uLine, uStars;
uniform vec3 uSky[5];
uniform vec3 uPal[24];
uniform sampler2D tR3, tR2, tR1, tSea, tWisp, tNear, tSum, tSum2, tTitle, tSub, tBlurB, tBlurS, tRays;
uniform float uRays;
uniform vec4 rR3, rR2, rR1, rSum, rTitle, rSub;
uniform vec4 sC3, sC2, sC1, sCN, sWB, sWF, sWV;   // cloud bands: (top y, height, period, drift)
uniform vec4 uSyl0, uSyl1, uTit, uHik;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }

// a card at depth z: where screen pixel p lands on it, in the card's reference px (its place for the camera at the origin)
vec2 refq(vec2 p, float z) { return PP + (1500.0 / z) * (uCam.xy + (p - PP) * (z - uCam.z) / uF); }
float ss(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }   // smoothstep, either direction
vec3 ramp3(vec3 a, vec3 b, vec3 c, float s) { return s < 0.5 ? mix(a, b, s * 2.0) : mix(b, c, s * 2.0 - 1.0); }
float lum(vec3 c) { return dot(c, vec3(0.3, 0.55, 0.15)); }
// light wrap source: only the bright part of what lies behind wraps around an edge (the glow, the sky by the sun, the title)
vec3 wrapSrc(sampler2D t) { vec3 c = textureLod(t, gl_FragCoord.xy / uRes, 0.0).rgb; return c * smoothstep(0.42, 0.92, lum(c)); }
float sunNear(vec2 p) { vec2 d = p - uSun; return exp(-dot(d, d) / 290000.0); }
// atmospheric perspective: every layer, the title included, blends to the haze by its own depth
vec3 fogged(vec3 c, float z, vec3 fc) { return mix(c, fc, uFog * (1.0 - exp(-z / 2600.0))); }

// ---- the two stacks, split at the title plane (front to back)
vec3 F, B; float FT, FTm, TB;
void put(vec3 c, float a, float zn, float zf, float am) {
  float s = clamp((zf - ZT) / max(zf - zn, 1e-3), 0.0, 1.0);          // fraction of the slab behind the title
  float l = log2(max(1.0 - a, 1e-6));
  float aF = 1.0 - exp2(l * (1.0 - s)), aB = 1.0 - exp2(l * s);       // optical-depth split: (1-aF)(1-aB) = 1-a
  F += FT * aF * c; FT *= 1.0 - aF;
  FTm *= exp2(log2(max(1.0 - am, 1e-6)) * (1.0 - s));                 // the same with the feathered matte
  B += TB * aB * c; TB *= 1.0 - aB;
}

void card(sampler2D t, vec4 r, float z, int pi, vec2 p, vec3 fc) {
  vec4 s = textureLod(t, (refq(p, z) - r.xy) / r.zw, 0.0);
  if (s.g < 0.002) return;
  vec3 c = ramp3(uPal[pi], uPal[pi + 1], uPal[pi + 2], s.r / s.g) * uDim;
  c = fogged(c, z, fc) + uRimC * s.b * uRim * (0.12 + 0.88 * sunNear(p));
  put(c, s.g, z * 0.99, z * 1.01, s.g);
}
// a cloud band at depth z: its slab reaches th·thickness toward the camera
void cloud(sampler2D t, vec4 b, float z, float th, int pi, vec2 p, vec3 fc, float op, float keep) {
  vec2 q = refq(p, z);
  vec2 uv = vec2((q.x + b.w) / b.z, (q.y - b.x) / b.y);
  if (fract(uv.x) > keep) return;                                     // keep only part of the period (fewer wisps)
  vec4 s = textureLod(t, uv, 0.0);
  float a = s.g * op;
  if (a < 0.002) return;
  float sh = s.r / s.g;
  vec3 c = ramp3(uPal[pi], uPal[pi + 1], uPal[pi + 2], sh) * uDim;
  c = fogged(c, z, fc) + uRimC * sh * sh * sunNear(p) * 0.35 * uRim;     // tops facing the low sun warm up
  put(c, a, z - th * s.b, z + 0.12 * th, a);
}
// the oblique wisp: a vertical plane through uWvA along uWvT (x, z); its depth changes across the screen
void weave(vec2 p, vec3 fc) {
  vec3 dir = vec3((p - PP) / uF, 1.0);
  vec3 N = vec3(-uWvT.y, 0.0, uWvT.x);
  float lam = dot(N, uWvA - uCam) / dot(N, dir);
  if (lam < 1.0) return;
  vec3 P = uCam + lam * dir;
  float u = dot(P.xz - uWvA.xz, uWvT);
  vec4 s = textureLod(tWisp, vec2((u + sWV.w) / sWV.z, (P.y - sWV.x) / sWV.y), 0.0);
  float a = s.g;
  if (a < 0.002) return;
  vec3 c = ramp3(uPal[21], uPal[22], uPal[23], s.r / s.g) * uDim;
  put(fogged(c, P.z, fc), a, P.z - 18.0 * s.b, P.z + 2.0, a);
}

// ---- the hiker on the apex (signed distances in the summit card's px; feet at the origin, y down)
float sdCap(vec2 p, vec2 a, vec2 b, float r) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdRBox(vec2 p, vec2 b, float r) { vec2 d = abs(p) - b + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
float body(vec2 l, vec2 hand, vec2 pb, vec2 pt) {
  float d = sdCap(l, vec2(-3.4, -19.0), vec2(-6.6, -0.8), 3.0);
  d = min(d, sdCap(l, vec2(3.4, -19.0), vec2(6.2, -0.8), 3.0));
  d = min(d, sdCap(l, vec2(0.0, -20.0), vec2(0.6, -32.0), 6.2));
  d = min(d, sdRBox(l - vec2(-7.4, -28.5), vec2(4.4, 7.6), 3.0));
  d = min(d, length(l - vec2(1.8, -41.6)) - 5.2);
  d = min(d, sdCap(l, vec2(2.8, -31.0), hand, 2.3));
  return min(d, sdCap(l, pb, pt, 1.3));
}
vec4 hiker(vec2 q) {
  vec2 l = q - uFeet;
  if (l.x < -40.0 || l.x > 80.0 || l.y < -115.0 || l.y > 6.0) return vec4(0.0);
  float px = (1500.0 / ZS) * (ZS - uCam.z) / uF;                     // card px per screen px
  float th = uHik.x;
  vec2 up = vec2(sin(th), -cos(th));
  vec2 hand = vec2(10.5, -37.0 + uHik.y), pb = hand - up * 16.0, pt = hand + up * 50.0;
  float d = body(l, hand, pb, pt);
  vec2 e = vec2(0.7, 0.0);
  vec2 n = normalize(vec2(body(l + e, hand, pb, pt) - body(l - e, hand, pb, pt), body(l + e.yx, hand, pb, pt) - body(l - e.yx, hand, pb, pt)) + 1e-5);
  float rim = smoothstep(-2.6, -0.2, d) * clamp(dot(n, vec2(0.6, -0.8)) * 1.3, 0.0, 1.0);
  vec3 c = uInk * uDim + uRimC * rim * uRim;
  float a = clamp(0.5 - d / px, 0.0, 1.0);
  // the pennant on the pole top, travelling wave
  vec2 ux = vec2(cos(th), sin(th));
  vec2 f = vec2(dot(l - pt, ux), dot(l - pt, -up));
  float L = 34.0, u = f.x / L;
  float wv = uHik.z * u * sin(f.x * 0.24 - uHik.w);
  float fd = max(abs(f.y - 9.5 - wv) - 9.5 * (1.0 - u), max(-f.x, f.x - L));
  float fa = clamp(0.5 - fd / px, 0.0, 1.0);
  if (fa > 0.0) {
    float fold = cos(f.x * 0.24 - uHik.w) * u;
    vec3 fc = uFlag * (0.84 + 0.2 * fold) * mix(vec3(1.0), uDim, 0.6) + vec3(0.22, 0.12, 0.06) * u * uRim;
    c = mix(c, fc, fa); a = max(a, fa);
  }
  return vec4(c, a);
}
void summit(vec2 p, vec3 fc) {
  vec2 q = refq(p, ZS), uv = (q - rSum.xy) / rSum.zw;
  vec4 s = textureLod(tSum, uv, 0.0);
  float a = s.g, am = s.a;
  vec3 c = vec3(0.0);
  if (a > 0.002) {
    c = fogged(ramp3(uPal[9], uPal[10], uPal[11], s.r / a) * uDim, ZS, fc);
    c += uRimC * s.b * uRim * (0.3 + 0.9 * sunNear(p));
#if MODE == 0
    // light wrap: what lies behind the summit (title included), blurred, bleeds over its inner edge
    float wide = textureLod(tSum2, uv, 0.0).r;
    float edge = a * (1.0 - wide);
    c += uWrapS * wrapSrc(tBlurS) * edge * edge * 2.0;
#endif
  }
  vec4 hk = hiker(q);
  if (hk.a > 0.0) { c = a > 0.002 ? mix(c, hk.rgb, hk.a) : hk.rgb; a = max(a, hk.a); am = max(am, hk.a); }
  if (a < 0.002) return;
  put(c, a, ZS * 0.99, ZS * 1.01, am);
}

// ---- the title on its plane: each syllable falls on its own (dy, squash, motion blur along y)
vec4 title(vec2 p, out float edge) {
  vec2 q = refq(p, ZT);
  bool right = q.x >= uTit.x;
  vec4 S = right ? uSyl1 : uSyl0;                                     // (dy, scale y, scale x, blur length)
  vec2 piv = vec2(right ? uPiv.y : uPiv.x, uTit.y);
  vec2 r = piv + (q - piv - vec2(0.0, S.x)) / vec2(S.z, S.y);
  int n = S.w > 1.0 ? 7 : 1;
  float cov = 0.0, g = 0.0;
  for (int i = 0; i < 7; i++) {
    if (i >= n) break;
    float o = n > 1 ? (float(i) / 6.0 - 0.5) * S.w : 0.0;
    vec4 s = textureLod(tTitle, (r + vec2(0.0, o) - rTitle.xy) / rTitle.zw, 0.0);
    cov += s.r; g += s.g;
  }
  cov /= float(n); g /= float(n);
  edge = cov * clamp(1.0 - g, 0.0, 1.0);
  return vec4(mix(uTitTop, uTitBot, smoothstep(uTit.z, uTit.w, r.y)) * uDim, cov);
}

vec3 sky(vec2 p) {
  float y = p.y;
  vec3 c = mix(uSky[0], uSky[1], smoothstep(0.0, 560.0, y));
  c = mix(c, uSky[2], smoothstep(420.0, 800.0, y));
  c = mix(c, uSky[3], smoothstep(700.0, 930.0, y));
  c = mix(c, uSky[4], smoothstep(880.0, 1030.0, y));
  // high streaks lit from below
  float band = smoothstep(120.0, 260.0, y) * ss(700.0, 500.0, y);
  if (band > 0.0) {
    float n = fbm(vec2(p.x * 0.0024 - uTime * 0.01, y * 0.02));
    float st = smoothstep(0.55, 0.72, n) * band;
    c = mix(c, mix(c * 1.25 + vec3(0.04, 0.02, 0.05), vec3(1.0, 0.76, 0.78), smoothstep(260.0, 680.0, y)) * uDim, st * 0.5);
  }
  // stars before dawn (each star stays inside its own cell)
  if (uStars > 0.0 && y < 760.0) {
    vec2 cell = floor(p / 46.0), f = p - cell * 46.0;
    float h = hash12(cell), h2 = hash12(cell + 17.3);
    vec2 sp = 46.0 * vec2(0.2 + 0.6 * h, 0.2 + 0.6 * h2);
    float st = step(0.72, hash12(cell + 5.1)) * ss(1.7, 0.3, length(f - sp)) * (0.5 + 0.5 * sin(uTime * 3.0 + h * 40.0));
    c += vec3(0.9, 0.9, 1.0) * st * uStars * ss(760.0, 200.0, y);
  }
  // the sun: two glows, a horizon band, the disc
  vec2 d = p - uSun; float r = length(d);
  c += vec3(1.0, 0.70, 0.48) * uSunI * (0.5 * exp(-r / 105.0) + 0.3 * exp(-r / 380.0));
  c += vec3(1.0, 0.62, 0.56) * uSunI * 0.22 * exp(-abs(d.y + 20.0) / 70.0) * exp(-abs(d.x) / 520.0);
  return mix(c, vec3(1.0, 0.97, 0.88), ss(46.0, 44.0, r) * clamp(uSunI * 1.4, 0.0, 1.0));
}

// the small pennant icon of the afterglow line
float pennant(vec2 l) {
  float pole = sdCap(l, vec2(0.0, 0.0), vec2(0.0, -34.0), 1.6);
  float u = clamp(l.x / 22.0, 0.0, 1.0);
  float fl = max(abs(l.y + 27.0 + 1.5 * sin(l.x * 0.3 - uTime * 6.0) * u) - 7.0 * (1.0 - u), max(-l.x, l.x - 22.0));
  return min(pole, fl);
}

void main() {
  vec2 fcd = gl_FragCoord.xy * (1080.0 / uRes.x);
  vec2 p = vec2(fcd.x, 1920.0 - fcd.y) + uShake;
  vec3 fc = mix(uHaze, uHazeW, sunNear(p));
  F = vec3(0.0); B = vec3(0.0); FT = 1.0; FTm = 1.0; TB = 1.0;
#if MODE == 0 || MODE == 3
  cloud(tNear, sCN, ${f1(Z_CN)}, 60.0, 18, p, fc, 1.0, 1.0);
  if (FT > 0.002) summit(p, fc);
#endif
#if MODE == 1
  #define LIVE (TB > 0.002)
  #define LIVEF true
#else
  #define LIVE (FT > 0.002 && TB > 0.002)
  #define LIVEF (FT > 0.002)
#endif
  if (LIVEF) cloud(tWisp, sWF, ${f1(Z_WF)}, 30.0, 21, p, fc, 1.0, 0.5);
  if (LIVEF) weave(p, fc);
  if (LIVEF) cloud(tWisp, sWB, ${f1(Z_WB)}, 30.0, 21, p, fc, 0.95, 1.0);
  if (LIVE) cloud(tSea, sC1, ${f1(Z_C1)}, 70.0, 15, p, fc, 1.0, 1.0);
  if (LIVE) card(tR1, rR1, ${f1(Z_R1)}, 6, p, fc);
  if (LIVE) cloud(tSea, sC2, ${f1(Z_C2)}, 90.0, 12, p, fc, 1.0, 1.0);
  if (LIVE) card(tR2, rR2, ${f1(Z_R2)}, 3, p, fc);
  if (LIVE) cloud(tSea, sC3, ${f1(Z_C3)}, 120.0, 12, p, fc, 1.0, 1.0);
  if (LIVE) card(tR3, rR3, ${f1(Z_R3)}, 0, p, fc);
#if MODE != 3
  if (LIVE) B += TB * sky(p);
#endif
#if MODE == 1
  vec3 col = B;                                                       // everything behind the title plane
#elif MODE == 3
  // the sunlit sky as the camera sees it through every layer: the light source of the beams (layers count as black)
  vec3 col = vec3(0.0);
  if (FT > 0.002 && TB > 0.002) {
    float edge;
    vec4 T = title(p, edge);
    vec3 sk = sky(p);
    col = TB * sk * smoothstep(0.5, 1.0, lum(sk)) * max(FT - FTm * T.a, 0.0);
  }
#else
  vec3 col = F;
  if (FT > 0.002) {
    float edge;
    vec4 T = title(p, edge);
    vec3 tc = fogged(T.rgb, ZT, fc);
#if MODE == 0
    tc = mix(tc, max(tc, wrapSrc(tBlurB) * 1.15), uWrapT * edge);
#endif
    col = F + FT * B + FTm * T.a * (tc - B);
  }
#endif
#if MODE == 0
  // sunbeams: the light source above, blurred radially toward the sun (gaps between letters let beams through)
  if (uRays > 0.0 && FT > 0.002) {
    vec2 uv = gl_FragCoord.xy / uRes, su = vec2(uSun.x - uShake.x, 1920.0 - uSun.y + uShake.y) / vec2(1080.0, 1920.0);
    vec2 d = (su - uv) * (0.95 / 24.0);
    float j = hash12(p * 0.73), w = 1.0;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 24; i++) { acc += w * textureLod(tRays, uv + d * (float(i) + j), 0.0).rgb; w *= 0.96; }
    vec3 ray = (1.0 - exp(-acc * (uRays * 0.07 * FT))) * vec3(1.0, 0.86, 0.74);   // soft-saturating in-scatter
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - ray);
  }
  // afterglow line (screen space): a soft shade under the letters, the letters, the pennant, two rules
  if (uSubA > 0.0) {
    vec2 sp = p - uShake - vec2(0.0, uSubY);
    vec4 s = textureLod(tSub, (sp - rSub.xy) / rSub.zw, 0.0);
    col = mix(col, uInk, s.g * 0.32 * uSubA);
    col = mix(col, uCream, s.r * uSubA);
    vec2 pl = sp - vec2(540.0 - uSubW - 46.0, rSub.y + rSub.w * 0.5 + 18.0);
    float pd = pennant(pl);
    float pa = clamp(0.5 - pd, 0.0, 1.0) * uSubA;
    col = mix(col, pl.x > 1.2 ? uFlag : uCream, pa);
    float ry = rSub.y + rSub.w * 0.5 + 1.0, x0 = uSubW + 74.0;
    float rl = max(abs(sp.y - ry) - 1.0, max(x0 - abs(sp.x - 540.0), abs(sp.x - 540.0) - x0 - 90.0 * uLine));
    col = mix(col, uCream, clamp(0.5 - rl, 0.0, 1.0) * uSubA * 0.7 * step(0.001, uLine));
  }
  vec2 v = (p - vec2(540.0, 900.0)) / vec2(820.0, 1300.0);
  col *= 1.0 - 0.2 * smoothstep(0.45, 1.05, length(v));
  col += (hash12(p + fract(uTime * 7.31) * 113.0) - 0.5) * (2.2 / 255.0);
#endif
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
const BLUR = /* glsl */`
uniform sampler2D tSrc;
uniform vec2 uStep, uRes;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 s = vec3(0.0); float wsum = 0.0;
  for (int i = -6; i <= 6; i++) { float w = exp(-float(i * i) / 18.0); s += w * textureLod(tSrc, uv + uStep * float(i), 0.0).rgb; wsum += w; }
  gl_FragColor = vec4(s / wsum, 1.0);
}`;

// ---------------------------------------------------------------- time
const T0 = [2.0, 2.18], FALL = 1.6, DROP = 1250, OVR = 0.9;   // the title: each syllable falls DROP px with an outBack settle
const CONTACT = T0.map((t) => t + FALL * (1 - OVR / (OVR + 1)));   // when it first reaches its rest line
const dawnK = (t) => sm5(t / 2.8);
const sunY = (t) => 1090 - 340 * (1 - Math.exp(-t / 4.6));   // out of the notch at ~1.5 s, behind the title's ㅇ at the climax
function camera(t) {
  const s = sm5((t - 4.2) / 4.8);                                   // the dolly
  return { x: -6 + 10 * smooth(t / 9.6), y: 3 - 8 * smooth(t / 9.6), z: 0.9 * t + 66 * s };
}
const sylDy = (i, t) => { const p = clamp((t - T0[i]) / FALL); return -DROP * (1 - outBack(p, OVR)); };
const bump = (t, t0, w) => Math.exp(-(((t - t0) / w) ** 2));

export default defineDemo({
  id: '139-text-behind',
  title: '구름 위 봉우리',
  tech: '글자 뒤 피사체 · 깊이 사이에 끼운 제목 + 매트 + 깊이 안개',
  duration: D,
  background: '#1c2154',

  async setup(api) {
    await fontReady(`400 200px ${BHS}`, TITLE);
    await fontReady(`700 42px ${PRE}`, SUB);
    const r = rand(139);
    const ridges = {};
    for (const key of ['R3', 'R2', 'R1']) ridges[key] = paintRidge(RIDGES[key], r);
    const sum = paintSummit(r);
    const sea = paintSea(r, SEA.P, SEA.Hh, SEA.rows);
    const near = paintSea(r, NEAR.P, NEAR.Hh, NEAR.rows);
    const wisp = paintWisps(r, WISP.P, WISP.Hh, WISP.list);
    const tt = paintTitle(), sub = paintSub();

    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    const rt = () => new THREE.WebGLRenderTarget(LW, LH, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.rts = { b: rt(), s: rt(), l: rt(), tmp: rt() };

    const v4 = (a, b, c, d) => new THREE.Vector4(a, b, c, d);
    const rect = (L) => v4(L.x0, L.y0, L.w, L.h);
    // the oblique wisp's plane: through X = 0 at the title's depth, turning away to the right (depth 640 … 930 on screen)
    const wt = new THREE.Vector2(1, 0.52).normalize();
    this.U = {
      uRes: { value: new THREE.Vector2(W, H) }, uSun: { value: new THREE.Vector2(SUN_X, 1000) }, uShake: { value: new THREE.Vector2() },
      uPiv: { value: new THREE.Vector2(tt.piv[0], tt.piv[1]) }, uFeet: { value: new THREE.Vector2(sum.feet[0], sum.feet[1]) },
      uCam: { value: new THREE.Vector3() }, uWvA: { value: new THREE.Vector3(0, 0, Z_T) }, uWvT: { value: wt },
      uDim: { value: new THREE.Vector3(1, 1, 1) }, uHaze: { value: new THREE.Vector3() }, uHazeW: { value: new THREE.Vector3() },
      uRimC: { value: new THREE.Vector3(...C.rim) }, uTitTop: { value: new THREE.Vector3(...C.titTop) }, uTitBot: { value: new THREE.Vector3(...C.titBot) },
      uInk: { value: new THREE.Vector3(...C.ink) }, uFlag: { value: new THREE.Vector3(...C.flag) }, uCream: { value: new THREE.Vector3(...C.cream) },
      uF: { value: F0 }, uTime: { value: 0 }, uSunI: { value: 0 }, uRim: { value: 0 }, uWrapS: { value: 0 }, uWrapT: { value: 0 }, uFog: { value: 0.8 },
      uSubA: { value: 0 }, uSubY: { value: 0 }, uSubW: { value: sub.half }, uLine: { value: 0 }, uStars: { value: 0 },
      uSky: { value: SKY_DAWN.map(() => new THREE.Vector3()) },
      uPal: { value: PAL.map((c) => new THREE.Vector3(...c)) },
      tR3: { value: ridges.R3 }, tR2: { value: ridges.R2 }, tR1: { value: ridges.R1 }, tSea: { value: sea }, tWisp: { value: wisp }, tNear: { value: near },
      tSum: { value: sum.t1 }, tSum2: { value: sum.t2 }, tTitle: { value: tt.tex }, tSub: { value: sub.tex },
      tBlurB: { value: this.rts.b.texture }, tBlurS: { value: this.rts.s.texture }, tRays: { value: this.rts.l.texture }, uRays: { value: 0 },
      rR3: { value: rect(RIDGES.R3) }, rR2: { value: rect(RIDGES.R2) }, rR1: { value: rect(RIDGES.R1) }, rSum: { value: rect(SUMMIT) },
      rTitle: { value: rect(TT) }, rSub: { value: v4(0, 236, 1080, 120) },
      sC3: { value: v4(948, SEA.Hh * 0.3, SEA.P * 0.3, 0) }, sC2: { value: v4(972, SEA.Hh * 0.45, SEA.P * 0.45, 0) },
      sC1: { value: v4(1000, SEA.Hh * 0.65, SEA.P * 0.65, 0) }, sCN: { value: v4(1150, NEAR.Hh, NEAR.P, 0) },
      sWB: { value: v4(470, WISP.Hh * 0.7, WISP.P * 0.7, 0) }, sWF: { value: v4(770, WISP.Hh * 0.85, WISP.P * 0.85, 0) },
      sWV: { value: v4(-232, WISP.Hh * WISP_K, WISP.P * WISP_K, 0) },
      uSyl0: { value: v4(0, 1, 1, 0) }, uSyl1: { value: v4(0, 1, 1, 0) }, uTit: { value: v4(tt.split, tt.base, tt.top, tt.bottom) },
      uHik: { value: v4(0, 0, 0, 0) },
    };
    const mat = (mode) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: this.U, defines: { MODE: mode }, depthTest: false, depthWrite: false });
    this.mats = [mat(0), mat(1), mat(2), mat(3)];
    this.blurU = { tSrc: { value: null }, uStep: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2(LW, LH) } };
    this.blurMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: BLUR, uniforms: this.blurU, depthTest: false, depthWrite: false });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mats[0]);
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = renderer;
    for (const m of [...this.mats, this.blurMat]) { this.quad.material = m; renderer.compile(this.scene, this.cam); }
  },

  frame(t) {
    const U = this.U, R = this.renderer, dawn = dawnK(t);
    const cam = camera(t);
    U.uCam.value.set(cam.x, cam.y, cam.z);
    U.uTime.value = t;
    // light: pre-dawn → dawn, the sun climbs out of the notch, a pulse when the title lands, the climax glow
    const climax = ramp(t, 4.3, 7.2);
    const land = t > CONTACT[1] ? Math.exp(-(t - CONTACT[1]) * 2.6) : 0;
    U.uSun.value.set(SUN_X, sunY(t));
    U.uSunI.value = 0.3 + 0.62 * dawn + 0.22 * land + 0.16 * climax;
    U.uRim.value = (0.2 + 0.8 * dawn) * (0.85 + 0.3 * climax + 0.25 * land);
    U.uWrapS.value = 0.45 + 0.55 * climax;
    U.uWrapT.value = 0.35 + 0.35 * climax;
    U.uRays.value = ramp(t, 4.2, 6.6);
    U.uStars.value = 1 - smooth(t / 2.2);
    U.uSky.value.forEach((v, i) => v.set(...SKY_PRE[i].map((a, j) => lerp(a, SKY_DAWN[i][j], dawn))));
    U.uDim.value.set(lerp(0.5, 1, dawn), lerp(0.5, 1, dawn), lerp(0.68, 1, dawn));
    U.uHaze.value.set(...C.hazeP.map((a, j) => lerp(a, C.hazeD[j], dawn)));
    U.uHazeW.value.set(...C.hazeWP.map((a, j) => lerp(a, C.hazeWD[j], dawn)));
    // clouds drift right → left, nearer ones faster; the oblique wisp moves from far (right) to near (left)
    U.sC3.value.w = 6 * t; U.sC2.value.w = 9 * t; U.sC1.value.w = 13 * t + 300; U.sCN.value.w = 21 * t + 500;
    U.sWB.value.w = 15 * t + 120; U.sWF.value.w = 22 * t + 468; U.sWV.value.w = 21 * t + 628;
    // the title: two syllables, each falls with an outBack settle; squash on contact; motion blur from the velocity
    const syl = [U.uSyl0.value, U.uSyl1.value];
    for (let i = 0; i < 2; i++) {
      const dy = sylDy(i, t), v = (sylDy(i, t + 1 / 240) - sylDy(i, t - 1 / 240)) * 120;
      const sq = bump(t, CONTACT[i] + 0.05, 0.1);
      syl[i].set(dy, 1 - 0.05 * sq, 1 + 0.025 * sq, Math.min(70, Math.abs(v) / 60));
    }
    // camera shake on the second contact (image space, a few px)
    const ts = t - CONTACT[1];
    U.uShake.value.set(0, ts > 0 ? 3.2 * Math.exp(-ts * 8) * Math.sin(TAU * 7 * ts) : 0);
    // the hiker raises the flag as the title lands
    const raise = ease.outBack(clamp((t - CONTACT[1] + 0.12) / 0.6), 1.4);
    U.uHik.value.set(lerp(0.95, 0.07, raise) + 0.03 * Math.sin(t * 1.7), lerp(10, 0, clamp(raise)), lerp(1.8, 4.2, clamp(raise)), 7.5 * t);
    // afterglow line
    const sa = ramp(t, 8.0, 8.8);
    U.uSubA.value = sa; U.uSubY.value = 16 * (1 - ease.outCubic(clamp((t - 8.0) / 0.9)));
    U.uLine.value = ease.outCubic(clamp((t - 8.25) / 0.9));

    // passes (¼ res): behind the title → blur; behind the summit → blur; the beams' light source; then the final picture
    const { b, s, l, tmp } = this.rts;
    const pass = (mat, target) => { this.quad.material = mat; R.setRenderTarget(target); R.render(this.scene, this.cam); };
    const blurInto = (src) => {
      this.blurU.tSrc.value = src.texture; this.blurU.uStep.value.set(1 / LW, 0); pass(this.blurMat, tmp);
      this.blurU.tSrc.value = tmp.texture; this.blurU.uStep.value.set(0, 1 / LH); pass(this.blurMat, src);
    };
    U.uRes.value.set(LW, LH);
    pass(this.mats[1], b); blurInto(b);
    pass(this.mats[2], s); blurInto(s);
    if (U.uRays.value > 0) pass(this.mats[3], l);
    U.uRes.value.set(W, H);
    pass(this.mats[0], null);
  },
});
