/*
 * forms.js — the two ceramic pieces, built in code.
 *
 *   vase    a broad-shouldered celadon vase: one closed lathe profile (underside → foot → outer wall → rounded lip →
 *           inner wall → inner floor), so the wall has a real thickness and the inside shows through the holes.
 *           sampleVase is the outer wall alone (grains leave from the glazed outside only).
 *   flower  a ceramic lotus: a seed pod plus three rings of petals (6 / 8 / 10). Each petal is a closed tube with an
 *           elliptical cross-section around a bent spine: width w(u), thickness T(u), cup across the width, and a tip that
 *           lifts. The vertex colour (glaze thinner toward the tip) and a sampling weight (upward faces) ride along.
 * Everything is y-up with the table at y = 0 and the piece centred on the y axis.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------- helpers
/** centripetal Catmull-Rom through 2D points, resampled to n points evenly by arc length */
function spline2(pts, n) {
  const dense = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const d = (a, b) => Math.max(1e-6, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
    const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
    for (let s = 0; s < 24; s++) {
      const t = t1 + ((t2 - t1) * s) / 24;
      const L = (a, b, ta, tb) => [((tb - t) * a[0] + (t - ta) * b[0]) / (tb - ta), ((tb - t) * a[1] + (t - ta) * b[1]) / (tb - ta)];
      const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
      const B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
      dense.push(L(B1, B2, t1, t2));
    }
  }
  dense.push(pts[pts.length - 1]);
  const acc = [0];
  for (let i = 1; i < dense.length; i++) acc.push(acc[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const out = [];
  for (let k = 0, j = 0; k < n; k++) {
    const s = (acc[acc.length - 1] * k) / (n - 1);
    while (j < acc.length - 2 && acc[j + 1] < s) j++;
    const f = (s - acc[j]) / Math.max(1e-9, acc[j + 1] - acc[j]);
    out.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * f, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * f]);
  }
  return out;
}

// ---------------------------------------------------------------- the vase
// outer wall, foot to lip (r, y)
const VASE_OUT = [
  [0.252, 0.0], [0.27, 0.016], [0.279, 0.048], [0.27, 0.092], [0.281, 0.2], [0.309, 0.38], [0.357, 0.6], [0.418, 0.84],
  [0.463, 1.04], [0.48, 1.17], [0.458, 1.29], [0.384, 1.383], [0.262, 1.444], [0.152, 1.479], [0.106, 1.505],
  [0.098, 1.545], [0.108, 1.574], [0.127, 1.595],
];
export const VASE_WALL = 0.03;
export const VASE_SEG = 90;

export function buildVase() {
  const outer = spline2(VASE_OUT, 112);
  // rounded lip: a half circle from the outer lip edge over the top to the inside
  const [lx, ly] = outer[outer.length - 1];
  const lipR = VASE_WALL * 0.62, lcx = lx - lipR, lcy = ly;
  const lip = [];
  for (let i = 1; i <= 10; i++) { const a = (i / 10) * Math.PI; lip.push([lcx + lipR * Math.cos(a), lcy + lipR * Math.sin(a)]); }
  // inner wall: the outer profile pushed in along its normal, from the lip down to the inner floor
  const inner = [];
  for (let i = outer.length - 2; i > 6; i--) {
    const a = outer[i - 1], b = outer[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = dy / l, ny = -dx / l;                           // outward normal of the upward profile
    const p = [outer[i][0] - nx * VASE_WALL * 1.24, outer[i][1] - ny * VASE_WALL * 1.24];
    if (p[1] < 0.075) break;
    inner.push(p);
  }
  const floorY = Math.max(0.075, inner[inner.length - 1][1]);
  const last = inner[inner.length - 1];
  inner.push([last[0] * 0.55, floorY + 0.004], [0, floorY + 0.006]);
  // underside with a shallow foot ring
  const under = [[0, 0.012], [0.16, 0.012], [0.222, 0.008], [0.24, 0.0015]];
  const prof = [...under, ...outer, ...lip, ...inner].map(([x, y]) => new THREE.Vector2(Math.max(0, x), y));
  const geo = new THREE.LatheGeometry(prof, VASE_SEG);
  const outerGeo = new THREE.LatheGeometry(outer.map(([x, y]) => new THREE.Vector2(x, y)), VASE_SEG);
  return { geo, outerGeo, height: ly + lipR };
}

// ---------------------------------------------------------------- the lotus
const RINGS = [
  // n, base radius, base y, length, half width, a0, a1 (rad from vertical), tip lift, thickness, cup, phase (fraction of a step)
  { n: 6, rb: 0.05, yb: 0.13, L: 0.38, W: 0.125, a0: 0.18, a1: 0.3, lift: -0.1, T: 0.046, cup: 0.42, ph: 0.0 },
  { n: 8, rb: 0.07, yb: 0.09, L: 0.47, W: 0.145, a0: 0.52, a1: 0.8, lift: 0.1, T: 0.05, cup: 0.38, ph: 0.5 },
  { n: 10, rb: 0.09, yb: 0.05, L: 0.52, W: 0.155, a0: 0.95, a1: 1.25, lift: 0.36, T: 0.052, cup: 0.32, ph: 0.25 },
];

function petal(R, phi, rng) {
  const NU = 30, NT = 22;
  const L = R.L * (0.95 + 0.1 * rng()), a0 = R.a0 + (rng() - 0.5) * 0.08, a1 = R.a1 + (rng() - 0.5) * 0.1;
  const er = [Math.cos(phi), 0, Math.sin(phi)], ea = [-Math.sin(phi), 0, Math.cos(phi)];
  // spine in the (radial, up) plane, integrated from the bend angle α(u)
  const alpha = (u) => a0 + (a1 - a0) * Math.pow(u, 1.15) - R.lift * Math.max(0, (u - 0.55) / 0.45) ** 2;
  const SUB = 8, spine = [[R.rb, R.yb]];
  for (let i = 1; i <= NU * SUB; i++) {
    const u = (i - 0.5) / (NU * SUB), a = alpha(u), [r, y] = spine[i - 1];
    spine.push([r + (L / (NU * SUB)) * Math.sin(a), y + (L / (NU * SUB)) * Math.cos(a)]);
  }
  const pos = [], col = [], wgt = [];
  for (let i = 0; i <= NU; i++) {
    const u = i / NU, a = alpha(u), [sr, sy] = spine[i * SUB];
    const w = R.W * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(u, 0.85))), 0.62);
    const T = R.T * Math.pow(Math.max(0, 1 - Math.pow(u, 4)), 0.5) * Math.min(1, u / 0.06 + 0.15);
    // inner-face normal (toward the centre / up) in the radial plane
    const nr = -Math.cos(a), ny = Math.sin(a);
    for (let j = 0; j < NT; j++) {
      const th = (j / NT) * Math.PI * 2, v = Math.cos(th), s = Math.sin(th);
      const off = R.cup * w * v * v + (s * T) / 2;            // cup the edges inward, then the thickness
      const rr = sr + nr * off, yy = sy + ny * off, aa = v * w;
      pos.push(er[0] * rr + ea[0] * aa, yy, er[2] * rr + ea[2] * aa);
      const k = 0.8 + 0.3 * Math.pow(u, 0.9) + 0.05 * Math.abs(v);
      col.push(k, k, k);
      wgt.push(s > 0 ? 1 : 0.12);                              // land grains mostly on the faces that look up/in
    }
  }
  const idx = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NT; j++) {
    const a = i * NT + j, b = i * NT + ((j + 1) % NT), c = (i + 1) * NT + j, d = (i + 1) * NT + ((j + 1) % NT);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('weight', new THREE.Float32BufferAttribute(wgt, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function withAttrs(g, k, w) {
  g.deleteAttribute('uv');
  const n = g.attributes.position.count;
  g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3).fill(k), 3));
  g.setAttribute('weight', new THREE.Float32BufferAttribute(new Float32Array(n).fill(w), 1));
  return g;
}

export function buildFlower(rng) {
  const parts = [];
  RINGS.forEach((R) => {
    for (let k = 0; k < R.n; k++) {
      const phi = ((k + R.ph) / R.n) * Math.PI * 2 + (rng() - 0.5) * 0.06;
      parts.push(petal(R, phi, rng));
    }
  });
  // the seed pod: a short flared drum with a domed top and seven seeds set into it
  const pod = new THREE.LatheGeometry([[0.0, 0.07], [0.07, 0.075], [0.1, 0.13], [0.122, 0.22], [0.13, 0.252], [0.118, 0.27], [0.06, 0.279], [0.0, 0.281]]
    .map(([x, y]) => new THREE.Vector2(x, y)), 48);
  parts.push(withAttrs(pod, 0.86, 0.6));
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI * 2, r = i === 6 ? 0 : 0.068;
    const s = new THREE.SphereGeometry(0.019, 14, 10);
    s.scale(1, 0.7, 1);
    s.translate(r * Math.cos(a), 0.28 - (i === 6 ? 0 : 0.004), r * Math.sin(a));
    parts.push(withAttrs(s, 1.02, 0.6));
  }
  const geo = mergeGeometries(parts, false);
  geo.computeBoundingBox();
  geo.translate(0, -geo.boundingBox.min.y + 0.002, 0);       // rest on the table
  geo.computeBoundingBox();
  return { geo };
}
