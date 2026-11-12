/*
 * 84 · gears.js — gear geometry, computed once at setup and emitted as SVG path data. No time in here.
 *
 *   involute(z, m)     a spur gear outline: involute flanks (pressure angle 20°), tip and root arcs, backlash
 *   windows(...)       the spoke cut-outs (subpaths, drawn with fill-rule evenodd)
 *   meshPhase(a, b)    the phase that makes gear b's teeth interlock with gear a's
 *   escapeWheel(...)   a Graham-style escape wheel (pointed teeth leaning in the turning direction)
 *   ratchet(...)       a saw-tooth ratchet
 *
 * Conventions: SVG user space (y down), angles in radians here, tooth 0 centred on angle 0 (+x).
 * A positive rotation is clockwise on screen, the same sense as SVG rotate().
 */

const PA = 20 * Math.PI / 180;                  // pressure angle
const inv = (a) => Math.tan(a) - a;             // involute function
const f = (v) => (Math.round(v * 100) / 100).toString();
const P = (r, a) => `${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`;

/** pitch, base, tip and root radii of a gear with z teeth of module m (px per tooth of pitch diameter) */
export function radii(z, m) {
  const r = m * z / 2;
  return { r, rb: r * Math.cos(PA), ra: r + m, rf: r - 1.25 * m };
}

/** closed outline of an involute spur gear (one subpath), centred on the origin */
export function involute(z, m, backlash = 0.1) {
  const { r, rb, ra, rf } = radii(z, m);
  // half the tooth's angular thickness at radius ρ (backlash taken off the pitch-circle thickness)
  const psi = Math.PI / (2 * z) - (backlash * m) / (2 * r);
  const half = (rho) => psi + inv(PA) - inv(Math.acos(Math.min(1, rb / Math.max(rho, rb))));
  const r0 = Math.max(rb, rf);
  const N = 7, flank = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, rho = r0 + (ra - r0) * (1 - (1 - u) * (1 - u));   // denser near the base, where it curves most
    flank.push([rho, half(rho)]);
  }
  const hRoot = half(r0);
  const pitch = 2 * Math.PI / z;
  let d = '';
  for (let k = 0; k < z; k++) {
    const c = k * pitch;
    // right flank (lower angle): root → base (radial, if the root is inside the base circle) → tip
    const start = c - hRoot;
    d += k === 0 ? `M${P(rf, start)}` : `A${f(rf)} ${f(rf)} 0 0 1 ${P(rf, start)}`;
    if (rf < rb) d += `L${P(rb, start)}`;
    for (const [rho, h] of flank) d += `L${P(rho, c - h)}`;
    // tip land
    const ht = flank[N][1];
    d += `A${f(ra)} ${f(ra)} 0 0 1 ${P(ra, c + ht)}`;
    // left flank: tip → base → root
    for (let i = N - 1; i >= 0; i--) d += `L${P(flank[i][0], c + flank[i][1])}`;
    if (rf < rb) d += `L${P(rf, c + hRoot)}`;
  }
  d += `A${f(rf)} ${f(rf)} 0 0 1 ${P(rf, -hRoot)}Z`;
  return d;
}

/**
 * Spoke windows between a rim (inner radius rIn) and a hub (radius rHub): n annular sectors, spokes w px wide.
 * Returned as subpaths to append to an outline (fill-rule evenodd cuts them out). twist curves the spokes.
 */
export function windows(n, rIn, rHub, w, twist = 0) {
  if (n < 2 || rIn - rHub < 12) return '';
  let d = '';
  const step = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) {
    const a0 = i * step, a1 = a0 + step;
    const oa0 = a0 + w / 2 / rIn + twist, oa1 = a1 - w / 2 / rIn + twist;
    const ia0 = a0 + w / 2 / rHub, ia1 = a1 - w / 2 / rHub;
    const big = oa1 - oa0 > Math.PI ? 1 : 0;
    const rm = (rIn + rHub) / 2;
    d += `M${P(rHub, ia0)}Q${P(rm, (ia0 + oa0) / 2 + twist * 0.15)} ${P(rIn, oa0)}A${f(rIn)} ${f(rIn)} 0 ${big} 1 ${P(rIn, oa1)}` +
      `Q${P(rm, (ia1 + oa1) / 2 + twist * 0.15)} ${P(rHub, ia1)}A${f(rHub)} ${f(rHub)} 0 0 0 ${P(rHub, ia0)}Z`;
  }
  return d;
}

/** a circle as a path subpath (for evenodd holes) */
export const ring = (r) => `M${f(r)} 0A${f(r)} ${f(r)} 0 1 1 ${f(-r)} 0A${f(r)} ${f(r)} 0 1 1 ${f(r)} 0Z`;

/**
 * Phase of gear b (radians) so that its teeth interlock with gear a's.
 * a, b: { x, y, z, phase }. When a has a tooth centred on the line of centres (towards b), b must have a gap
 * centred on that line (towards a); rotating a by δ turns b by −δ·za/zb, so b's phase follows a's offset.
 */
export function meshPhase(a, b) {
  const beta = Math.atan2(b.y - a.y, b.x - a.x);
  return beta + Math.PI - Math.PI / b.z - (a.phase - beta) * a.z / b.z;
}

/** a Graham-style escape wheel turning clockwise: z pointed teeth between rRoot and rTip, tips leaning forward */
export function escapeWheel(z, rTip, rRoot) {
  const pitch = 2 * Math.PI / z;
  let d = '';
  for (let k = 0; k < z; k++) {
    const c = k * pitch;
    const pts = [
      [rRoot, c],                       // foot of the locking face
      [rTip, c + pitch * 0.16],         // the face leans forward to the tip
      [rTip - 2.2, c + pitch * 0.27],   // a small club at the tip
      [rRoot + 2, c + pitch * 0.86],    // the long back of the tooth
    ];
    pts.forEach(([r, a], i) => { d += `${k === 0 && i === 0 ? 'M' : 'L'}${P(r, a)}`; });
  }
  return d + 'Z';
}

/** a saw-tooth ratchet (steep face leading in the clockwise sense) */
export function ratchet(z, rTip, rRoot) {
  const pitch = 2 * Math.PI / z;
  let d = '';
  for (let k = 0; k < z; k++) {
    const c = k * pitch;
    d += `${k === 0 ? 'M' : 'L'}${P(rRoot, c)}L${P(rTip, c + pitch * 0.04)}L${P(rRoot, c + pitch * 0.96)}`;
  }
  return d + 'Z';
}
