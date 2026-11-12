/*
 * 45-stained-glass/design.js — the rose window is designed and "glazed" here, once, in setup().
 *
 * Window units: the stone frame's outer edge is r = 1 (= 3.4 m), x right, y up. The textures cover [-EXT, EXT]².
 * Tracery (stone): an outer ring, a ring of 12 stone-framed roundels, 12 pointed petal lights between radial
 * mullions with an eyelet in each spandrel, and the central oculus. Each opening is split into REGIONS
 * (fillet, ground, medallion ring, medallion …), each an exact signed-distance function (circles, lenses,
 * a lancet = wedge ∩ pointed arch ∪ round end, quatrefoil = union of four discs).
 * The glazier's cut lines are one Voronoi tessellation (d3-delaunay, Lloyd-relaxed): a piece of glass is
 * (Voronoi cell ∩ region). Per texel: delaunay.find() gives the cell, the distance to the cell's edge is the
 * smallest distance to the bisector with a Delaunay neighbour, and the lead came sits on min(cell edge,
 * region outline) with a half-round height profile. Everything is computed per texel in JS (exact, ~1–2 s);
 * only the grisaille (painted lines) is drawn with Canvas 2D.
 *
 * Output (2048², rows top = +y):
 *   T0  RGB glass colour of the piece (sRGB), A = the piece's random seed (1..255, read with texelFetch)
 *   T1  R lead came height (0 = glass)   G stone height (chamfered)   B near lead/stone (for grozed, darker edges)
 *       A grisaille paint density
 */
import { Delaunay } from 'd3-delaunay';
import { rand } from '../_lib/stage.js';

export const TS = 2048;
export const EXT = 1.02;
const PX = TS / (2 * EXT);
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- palette (sRGB)
const C = {
  blue: [40, 84, 190], blueD: [24, 52, 150], blueL: [70, 122, 210], sky: [104, 160, 216],
  ruby: [186, 26, 30], rubyD: [140, 14, 26], rose: [206, 76, 96],
  gold: [240, 180, 50], amber: [220, 128, 28], straw: [238, 216, 128],
  green: [40, 136, 72], greenL: [104, 168, 66], olive: [134, 138, 44],
  purple: [116, 40, 112], murrey: [150, 44, 86],
  white: [226, 230, 206], whiteG: [206, 224, 198],
};
const mixPal = (...pairs) => {             // [[colour, weight], …] → (r) => [r, g, b] with per-piece jitter
  const tot = pairs.reduce((s, p) => s + p[1], 0);
  return (r) => {
    let x = r() * tot, c = pairs[0][0];
    for (const [cc, w] of pairs) { if ((x -= w) <= 0) { c = cc; break; } }
    const k = 0.84 + 0.26 * r(), hue = (r() - 0.5) * 18;
    return [c[0] * k + hue * 0.3, c[1] * k - hue * 0.15, c[2] * k - hue * 0.2].map((u) => Math.max(0, Math.min(255, Math.round(u))));
  };
};
const PAL = {
  blueGround: mixPal([C.blue, 6], [C.blueD, 3], [C.blueL, 2], [C.ruby, 0.9], [C.sky, 0.4]),
  rubyGround: mixPal([C.ruby, 6], [C.rubyD, 3], [C.rose, 0.6], [C.blue, 0.7], [C.murrey, 0.4]),
  fillet: mixPal([C.straw, 4], [C.white, 3], [C.gold, 1]),
  white: mixPal([C.white, 4], [C.whiteG, 2], [C.straw, 0.6]),
  gold: mixPal([C.gold, 5], [C.amber, 2], [C.straw, 0.6]),
  amber: mixPal([C.amber, 3], [C.gold, 2]),
  green: mixPal([C.green, 4], [C.greenL, 2], [C.olive, 1]),
  purple: mixPal([C.purple, 4], [C.murrey, 2], [C.rubyD, 0.5]),
  sky: mixPal([C.sky, 4], [C.blueL, 2], [C.white, 0.5]),
  ruby: mixPal([C.ruby, 5], [C.rubyD, 2], [C.rose, 0.6]),
  blue: mixPal([C.blue, 5], [C.blueD, 2], [C.blueL, 1]),
  bandGround: mixPal([C.blue, 7], [C.blueD, 4], [C.blueL, 2], [C.ruby, 1.6], [C.gold, 0.25], [C.green, 0.25]),
};

// ---------------------------------------------------------------- the design (window units)
const polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
const PETAL_A = (k) => Math.PI / 2 + k * Math.PI / 6;
const ROUNDEL_A = (k) => Math.PI / 2 + Math.PI / 12 + k * Math.PI / 6;
const RD = { c: 0.7975, glass: 0.116, inner: 0.098, stone: 0.132, lobeD: 0.03, lobeR: 0.04, cen: 0.021 };
const BAND = [0.665, 0.935];
const OC = { r: 0.165, ring: 0.056, heart: 0.044 };
const MED = [{ s: 0.40, r: 0.044, ring: 0.056 }, { s: 0.29, r: 0.019, ring: 0.029 }, { s: 0.556, r: 0.026, ring: 0.037 }];
const EYE = { s: 0.588, r: 0.037 };
const FIL = 0.019;                       // fillet width inside each petal
// the petal lights: a lancet with a round inner end, straight sides following the 30° sector (minus a mullion),
// and a pointed arch at the outer end (two circle arcs of radius ρ centred on the far side)
const PET = { s0: 0.235, sa: 0.49, k: Math.sin(Math.PI / 12), m: 0.019 };
const wA = PET.k * PET.sa - PET.m;
const RHO = 1.25 * wA;
const R0 = PET.k * PET.s0 - PET.m;
const KK = Math.hypot(1, PET.k);
// lens (vesica) petals of the oculus: two discs of radius VR, centres ±VC off the axis, tips at s = 0.058 / 0.158
const VS = 0.108, VC = 0.02667, VR = 0.05667;

// signed distances, positive inside
function petalSD(s, w) {
  const aw = Math.abs(w);
  const dIn = R0 - Math.hypot(s - PET.s0, w);
  const dSA = s <= PET.sa ? (PET.k * s - PET.m - aw) / KK : RHO - Math.hypot(s - PET.sa, aw + (RHO - wA));
  return Math.max(Math.min(dSA, s - PET.s0), dIn);
}
const lensSD = (s, w) => VR - Math.hypot(s - VS, Math.abs(w) + VC);
function nearestAngle(a, a0, step, n = 12) { const k = Math.round((a - a0) / step); return [((k % n) + n) % n, a0 + k * step]; }

/**
 * which piece-region a point is in. Returns region id (0 = stone) and d = distance to that region's outline
 * (for stone: distance to the nearest glass).
 */
function regionAt(x, y, out) {
  const r = Math.hypot(x, y), a = Math.atan2(y, x);
  // --- band of roundels
  if (r >= BAND[0] - 0.02 && r <= 1.2) {
    const [k, ak] = nearestAngle(a, ROUNDEL_A(0), Math.PI / 6);
    const cx = RD.c * Math.cos(ak), cy = RD.c * Math.sin(ak);
    const dr = Math.hypot(x - cx, y - cy);
    const base = 160 + k * 5;
    if (dr < RD.glass) {
      if (dr > RD.inner) { out[0] = base; out[1] = Math.min(RD.glass - dr, dr - RD.inner); return; }
      if (dr < RD.cen) { out[0] = base + 3; out[1] = RD.cen - dr; return; }
      let dq = -1e9;
      for (let j = 0; j < 4; j++) {
        const la = ak + Math.PI / 4 + j * Math.PI / 2;
        dq = Math.max(dq, RD.lobeR - Math.hypot(x - cx - RD.lobeD * Math.cos(la), y - cy - RD.lobeD * Math.sin(la)));
      }
      if (dq > 0) { out[0] = base + 2; out[1] = Math.min(dq, dr - RD.cen); return; }
      out[0] = base + 1; out[1] = Math.min(-dq, RD.inner - dr); return;
    }
    const dBand = Math.min(r - BAND[0], BAND[1] - r, dr - RD.stone);
    if (dBand > 0) { out[0] = 150; out[1] = dBand; return; }
    if (r >= BAND[0]) {
      // stone: the roundel's frame ring, or the outer ring. Distance to the nearest glass.
      let dn = dr - RD.glass;
      const inBand = Math.min(r - BAND[0], BAND[1] - r);
      dn = Math.min(dn, inBand > 0 ? (dr < RD.stone ? RD.stone - dr : 1e9) : -inBand);
      out[0] = 0; out[1] = Math.max(dn, 0); return;
    }
  }
  // --- oculus
  if (r < OC.r + 0.03) {
    if (r < OC.heart) { out[0] = 11; out[1] = OC.heart - r; return; }
    if (r < OC.ring) { out[0] = 10; out[1] = Math.min(r - OC.heart, OC.ring - r); return; }
    if (r < OC.r) {
      const [k, ak] = nearestAngle(a, TAU / 16, TAU / 8, 8);
      const s = x * Math.cos(ak) + y * Math.sin(ak), w = -x * Math.sin(ak) + y * Math.cos(ak);
      const dl = lensSD(s, w);
      if (dl > 0) { out[0] = 2 + (k % 8); out[1] = dl; return; }
      out[0] = 1; out[1] = Math.min(-dl, OC.r - r, r - OC.ring); return;
    }
  }
  // --- petals and eyelets
  const [k, ak] = nearestAngle(a, PETAL_A(0), Math.PI / 6);
  const s = x * Math.cos(ak) + y * Math.sin(ak), w = -x * Math.sin(ak) + y * Math.cos(ak);
  const dp = petalSD(s, w);
  const base = 20 + k * 10;
  if (dp > 0) {
    if (dp < FIL) { out[0] = base; out[1] = Math.min(dp, FIL - dp); return; }
    let dg = dp - FIL;
    for (let j = 0; j < 3; j++) {
      const m = MED[j], dm = Math.hypot(s - m.s, w);
      if (dm < m.r) { out[0] = base + 3 + 2 * j; out[1] = m.r - dm; return; }
      if (dm < m.ring) { out[0] = base + 2 + 2 * j; out[1] = Math.min(dm - m.r, m.ring - dm); return; }
      dg = Math.min(dg, dm - m.ring);
    }
    out[0] = base + 1; out[1] = dg; return;
  }
  const [ke, ae] = nearestAngle(a, PETAL_A(0) + Math.PI / 12, Math.PI / 6);
  const de = Math.hypot(x - EYE.s * Math.cos(ae), y - EYE.s * Math.sin(ae));
  if (de < EYE.r) { out[0] = 28 + ke * 10; out[1] = EYE.r - de; return; }
  // stone: distance to the nearest glass among the candidates around here
  let dn = Math.min(-dp, de - EYE.r, Math.abs(r - OC.r), Math.abs(r - BAND[0]));
  out[0] = 0; out[1] = Math.max(dn, 0);
}
function palFor(id) {
  if (id === 1) return PAL.rubyGround;
  if (id >= 2 && id <= 9) return id % 2 ? PAL.gold : PAL.amber;
  if (id === 10) return PAL.white;
  if (id === 11) return PAL.blue;
  if (id >= 20 && id < 140) {
    const k = Math.floor((id - 20) / 10), j = (id - 20) % 10, even = k % 2 === 0;
    switch (j) {
      case 0: return PAL.fillet;
      case 1: return even ? PAL.blueGround : PAL.rubyGround;
      case 2: return PAL.white;
      case 3: return even ? PAL.ruby : PAL.green;
      case 4: return PAL.gold;
      case 5: return PAL.purple;
      case 6: return PAL.gold;
      case 7: return even ? PAL.green : PAL.sky;
      case 8: return even ? PAL.gold : PAL.ruby;
      default: return PAL.white;
    }
  }
  if (id === 150) return PAL.bandGround;
  const k = Math.floor((id - 160) / 5), j = (id - 160) % 5, even = k % 2 === 0;
  return [PAL.fillet, even ? PAL.green : PAL.purple, even ? PAL.gold : PAL.sky, even ? PAL.ruby : PAL.white][j] || PAL.white;
}

// ---------------------------------------------------------------- the glazier's cut lines
function cutSites() {
  const r = rand(4507);
  const pts = [];
  const sp = 0.047;
  for (let j = -30; j <= 30; j++) {
    for (let i = -30; i <= 30; i++) {
      const x = (i + (j % 2 ? 0.5 : 0)) * sp + (r() - 0.5) * sp * 0.7;
      const y = j * sp * 0.866 + (r() - 0.5) * sp * 0.7;
      if (x * x + y * y < 1.0) pts.push([x, y]);
    }
  }
  for (let it = 0; it < 1; it++) {              // one Lloyd step: glaziers cut fairly even pieces
    const vor = Delaunay.from(pts).voronoi([-1.1, -1.1, 1.1, 1.1]);
    for (let i = 0; i < pts.length; i++) {
      const c = vor.cellPolygon(i); if (!c) continue;
      let A = 0, cx = 0, cy = 0;
      for (let k = 0; k < c.length - 1; k++) {
        const [x0, y0] = c[k], [x1, y1] = c[k + 1], f = x0 * y1 - x1 * y0;
        A += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
      }
      if (Math.abs(A) > 1e-12) { pts[i][0] = cx / (3 * A); pts[i][1] = cy / (3 * A); }
    }
  }
  return pts;
}

function petalPts(theta, inset) {
  const side = [];
  const r0 = R0 - inset;
  const rr = RHO - inset, cen = RHO - wA;
  const sTip = PET.sa + Math.sqrt(Math.max(0, rr * rr - cen * cen));
  for (let i = 0; i <= 24; i++) {
    const s = sTip + (PET.sa - sTip) * (i / 24);
    side.push([s, Math.max(0, Math.sqrt(Math.max(0, rr * rr - (s - PET.sa) ** 2)) - cen)]);
  }
  for (let i = 1; i <= 12; i++) {
    const s = PET.sa + (PET.s0 - PET.sa) * (i / 12);
    side.push([s, PET.k * s - PET.m - inset * KK]);
  }
  const pts = [...side];
  for (let i = 1; i < 24; i++) {
    const a = Math.PI / 2 + Math.PI * (i / 24);
    pts.push([PET.s0 + r0 * Math.cos(a), r0 * Math.sin(a)]);
  }
  for (let i = side.length - 1; i >= 0; i--) pts.push([side[i][0], -side[i][1]]);
  const c = Math.cos(theta), s = Math.sin(theta);
  return pts.map(([u, w]) => [u * c - w * s, u * s + w * c]);
}

// ---------------------------------------------------------------- grisaille: painted trace lines and matting
function paintLayer(g) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const ink = (a) => `rgba(255,255,255,${a})`;
  // centre: veins on the vesica petals
  for (let i = 0; i < 8; i++) {
    const th = i * TAU / 8 + TAU / 16, c = Math.cos(th), s = Math.sin(th);
    const P = (u, w) => [u * c - w * s, u * s + w * c];
    g.strokeStyle = ink(0.85); g.lineWidth = 0.0032;
    g.beginPath(); g.moveTo(...P(0.07, 0)); g.lineTo(...P(0.145, 0)); g.stroke();
    g.lineWidth = 0.0022;
    for (const u of [0.085, 0.105, 0.125]) {
      for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(...P(u, 0)); g.quadraticCurveTo(...P(u + 0.008, sg * 0.012), ...P(u + 0.02, sg * 0.018)); g.stroke(); }
    }
  }
  // the blue heart: a painted six-lobed flower
  g.lineWidth = 0.0028; g.strokeStyle = ink(0.8);
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6;
    g.beginPath(); g.ellipse(0.019 * Math.cos(a), 0.019 * Math.sin(a), 0.016, 0.008, a, 0, TAU); g.stroke();
  }
  g.fillStyle = ink(0.9); g.beginPath(); g.arc(0, 0, 0.006, 0, TAU); g.fill();
  // petals: pearl border along each fillet, painted flowers in the medallions
  for (let k = 0; k < 12; k++) {
    const th = PETAL_A(k);
    const mid = petalPts(th, 0.0095);
    // matt the fillet strip …
    g.strokeStyle = ink(0.62); g.lineWidth = 0.0105;
    g.beginPath(); g.moveTo(mid[0][0], mid[0][1]); for (const p of mid) g.lineTo(p[0], p[1]); g.closePath(); g.stroke();
    // … then wipe pearls out of it with the stick end
    g.fillStyle = '#000';
    let acc = 0;
    for (let i = 1; i < mid.length; i++) {
      const dx = mid[i][0] - mid[i - 1][0], dy = mid[i][1] - mid[i - 1][1], L = Math.hypot(dx, dy);
      acc += L;
      while (acc > 0.0135) {
        acc -= 0.0135;
        const f = 1 - acc / L;
        g.beginPath(); g.arc(mid[i - 1][0] + dx * f, mid[i - 1][1] + dy * f, 0.0036, 0, TAU); g.fill();
      }
    }
    // the big medallion: a painted lily of four petals and a ring of dots
    const [mx, my] = polar(MED[0].s, th);
    g.strokeStyle = ink(0.85); g.lineWidth = 0.003;
    for (let i = 0; i < 4; i++) {
      const a = th + i * TAU / 4;
      g.beginPath(); g.moveTo(mx, my);
      g.bezierCurveTo(mx + 0.02 * Math.cos(a + 0.6), my + 0.02 * Math.sin(a + 0.6), mx + 0.036 * Math.cos(a + 0.2), my + 0.036 * Math.sin(a + 0.2), mx + 0.036 * Math.cos(a), my + 0.036 * Math.sin(a));
      g.bezierCurveTo(mx + 0.036 * Math.cos(a - 0.2), my + 0.036 * Math.sin(a - 0.2), mx + 0.02 * Math.cos(a - 0.6), my + 0.02 * Math.sin(a - 0.6), mx, my);
      g.stroke();
    }
    g.fillStyle = ink(0.85);
    for (let i = 0; i < 12; i++) { const a = th + (i + 0.5) * TAU / 12; g.beginPath(); g.arc(mx + 0.039 * Math.cos(a), my + 0.039 * Math.sin(a), 0.0025, 0, TAU); g.fill(); }
    // matting: a soft wash toward the medallion rim (shading that rounds the form)
    const grd = g.createRadialGradient(mx, my, 0.015, mx, my, MED[0].r);
    grd.addColorStop(0, ink(0)); grd.addColorStop(1, ink(0.38));
    g.fillStyle = grd; g.beginPath(); g.arc(mx, my, MED[0].r, 0, TAU); g.fill();
  }
  // roundels: veins on the quatrefoil lobes, a cross-rosette on the centre
  for (let k = 0; k < 12; k++) {
    const [x, y] = polar(RD.c, ROUNDEL_A(k)), a0 = ROUNDEL_A(k) + Math.PI / 4;
    g.strokeStyle = ink(0.8); g.lineWidth = 0.0026;
    for (let j = 0; j < 4; j++) {
      const a = a0 + j * TAU / 4, c = Math.cos(a), s = Math.sin(a);
      g.beginPath(); g.moveTo(x + 0.024 * c, y + 0.024 * s); g.lineTo(x + 0.062 * c, y + 0.062 * s); g.stroke();
      for (const sg of [-1, 1]) {
        g.beginPath(); g.moveTo(x + 0.038 * c, y + 0.038 * s);
        g.quadraticCurveTo(x + 0.046 * c - sg * 0.01 * s, y + 0.046 * s + sg * 0.01 * c, x + 0.05 * c - sg * 0.02 * s, y + 0.05 * s + sg * 0.02 * c); g.stroke();
      }
    }
    g.lineWidth = 0.0024;
    for (let j = 0; j < 4; j++) { const a = a0 + j * TAU / 4; g.beginPath(); g.ellipse(x + 0.009 * Math.cos(a), y + 0.009 * Math.sin(a), 0.008, 0.004, a, 0, TAU); g.stroke(); }
    const grd = g.createRadialGradient(x, y, RD.inner * 0.55, x, y, RD.inner);
    grd.addColorStop(0, ink(0)); grd.addColorStop(1, ink(0.3));
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, RD.inner, 0, TAU); g.fill();
  }
  // eyelets: a little cross of leaves
  for (let k = 0; k < 12; k++) {
    const [ex, ey] = polar(0.588, PETAL_A(k) + Math.PI / 12);
    g.strokeStyle = ink(0.75); g.lineWidth = 0.0024;
    for (let j = 0; j < 4; j++) { const a = j * TAU / 4 + 0.4; g.beginPath(); g.ellipse(ex + 0.013 * Math.cos(a), ey + 0.013 * Math.sin(a), 0.012, 0.0055, a, 0, TAU); g.stroke(); }
  }
}


/** builds T0 (colour + seed) and T1 (lead, stone, proximity, paint) as Uint8Arrays */
export function glazeWindow() {
  const sites = cutSites();
  const del = Delaunay.from(sites);
  const NS = sites.length;
  // Delaunay neighbours → the bisectors that bound each cell: unit normal + half distance
  const nbStart = new Int32Array(NS + 1), nbList = [];
  for (let i = 0; i < NS; i++) { nbStart[i] = nbList.length; for (const j of del.neighbors(i)) nbList.push(j); }
  nbStart[NS] = nbList.length;
  const NB = nbList.length, nbX = new Float32Array(NB), nbY = new Float32Array(NB), nbH = new Float32Array(NB);
  for (let i = 0; i < NS; i++) for (let q = nbStart[i]; q < nbStart[i + 1]; q++) {
    const j = nbList[q], ex = sites[j][0] - sites[i][0], ey = sites[j][1] - sites[i][1], L = Math.hypot(ex, ey);
    nbX[q] = ex / L; nbY[q] = ey / L; nbH[q] = L / 2;
  }

  const N = TS * TS;
  const T0 = new Uint8Array(N * 4), T1 = new Uint8Array(N * 4);
  const leadH = new Float32Array(N), stoneM = new Float32Array(N), stoneD = new Float32Array(N), near = new Float32Array(N);
  const pieceCol = new Map();
  const out = [0, 0];
  const HWC = 0.0021, HWR = 0.0025;     // half widths of the came: cut lines / region outlines
  const prof = (d, hw) => { const x = d / hw; return x >= 1 ? 0 : Math.sqrt(1 - Math.pow(x, 2.6)); };
  let cell = 0;
  for (let py = 0; py < TS; py++) {
    const y = EXT - (py + 0.5) / PX;
    for (let px = 0; px < TS; px++) {
      const x = (px + 0.5) / PX - EXT, i = py * TS + px;
      if (x * x + y * y > 1.0) {             // beyond the frame: stone
        stoneM[i] = 1; stoneD[i] = 1; T0[i * 4 + 3] = 0; continue;
      }
      regionAt(x, y, out);
      const id = out[0], dReg = out[1];
      if (id === 0) {
        // stone, antialiased against the glass it frames
        stoneM[i] = Math.min(1, 0.5 + dReg * PX); stoneD[i] = dReg;
        if (stoneM[i] >= 1) continue;
      }
      cell = del.find(x, y, cell);
      const sx = sites[cell][0], sy = sites[cell][1];
      let dc = 1e9;
      for (let q = nbStart[cell]; q < nbStart[cell + 1]; q++) dc = Math.min(dc, nbH[q] - ((x - sx) * nbX[q] + (y - sy) * nbY[q]));
      const key = id * 4096 + cell;
      let pc = pieceCol.get(key);
      if (!pc) {
        const r = rand(key * 7919 + 13);
        r(); r();
        pc = [...palFor(id)(r), 1 + Math.floor(r() * 254)];
        pieceCol.set(key, pc);
      }
      T0[i * 4] = pc[0]; T0[i * 4 + 1] = pc[1]; T0[i * 4 + 2] = pc[2]; T0[i * 4 + 3] = pc[3];
      if (id !== 0) {
        leadH[i] = Math.max(prof(dc, HWC), prof(dReg, HWR));
        near[i] = Math.min(dc - HWC, dReg - HWR);
      }
    }
  }
  // the colour under the stone's antialiased edge: copy from the nearest glass texel row-wise (it is never seen
  // except through the blend), and give empty texels a neutral value
  // grisaille
  const pc = document.createElement('canvas'); pc.width = pc.height = TS;
  const g = pc.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, TS, TS);
  g.setTransform(PX, 0, 0, -PX, EXT * PX, EXT * PX);
  paintLayer(g);
  const paint = g.getImageData(0, 0, TS, TS).data;

  for (let i = 0; i < N; i++) {
    const s = stoneM[i];
    const sh = s * (0.35 + 0.65 * Math.min(1, stoneD[i] / 0.012));
    T1[i * 4] = Math.round(Math.min(1, leadH[i]) * 255 * (1 - s));
    T1[i * 4 + 1] = Math.round(Math.min(1, sh) * 255);
    const nr = s > 0.5 ? 1 : Math.exp(-Math.max(near[i], 0) / 0.006);
    T1[i * 4 + 2] = Math.round(nr * 255);
    T1[i * 4 + 3] = paint[i * 4];
  }
  return { T0, T1 };
}
