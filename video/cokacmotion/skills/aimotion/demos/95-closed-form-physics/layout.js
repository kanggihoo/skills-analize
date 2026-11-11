/*
 * layout.js — where things sit on the table and how every motion is solved (setup-time, formulas only).
 * Pure module (no DOM) so the same numbers can be checked from node.
 */
import { SB, G, EPS, CB, eulerDisk, pea, oscillator } from './phys.js';

export const R = 5.4;          // the instant everything comes to rest
export const D = 9.5;

// ground points are given in screen px (X, Y on the table plane); world z = Y / SB
const Z = (Y) => Y / SB;

export const COIN = { x: 520, z: Z(772), a: 84, th: 8 };
export const POD = { X: 198, Y: 1012, ang: (-62 * Math.PI) / 180, len: 300, h: 16, slots: [-92, -46, 0, 46, 92], tPop: 0.7, tPop2: 2.3 };
export const PUD = { x: 862, z: Z(684), rb: 84, rt: 62, hgt: 104, plate: 142 };
export const SPOON = {
  x: 562, z: Z(1500), hp: 34,
  dir: (() => { const a = (16 * Math.PI) / 180, dx = Math.cos(a), dz = Math.sin(a) / SB, l = Math.hypot(dx, dz); return [dx / l, dz / l]; })(),
  bowlS: -168, bowlL: 82, bowlW: 52, handle: 262,
  w: Math.PI * 2 * 2.3,
};
export const PEA_R = 23;

/** pod slot → ground (x, z) */
export function podSlot(i) {
  const s = POD.slots[i];
  return [POD.X + s * Math.cos(POD.ang), Z(POD.Y + s * Math.sin(POD.ang))];
}
/** spoon-local s (along the spoon, + toward the handle) at tilt θ → world x, z, h */
export function spoonPoint(s, w, theta, dh = 0) {
  const [ux, uz] = SPOON.dir;
  const c = Math.cos(theta);
  return { x: SPOON.x + ux * s * c - uz * w, z: SPOON.z + uz * s * c + ux * w, h: SPOON.hp + s * Math.sin(theta) + dh };
}

export function build() {
  const coin = eulerDisk({ R, f0: 1.8, phi0: 0.6 });

  // four peas spray out at the first pop and stop where we want them, at R; the fifth (late) one lands in the spoon
  const spec = [
    { slot: 4, tl: 0.74, target: [664, Z(884)], T1: 0.74 },
    { slot: 3, tl: 0.80, target: [906, Z(1092)], T1: 0.82 },
    { slot: 2, tl: 0.86, target: [540, Z(1150)], T1: 0.70 },
    { slot: 1, tl: 0.92, target: [846, Z(1336)], T1: 0.78 },
  ];
  const peas = spec.map((p) => Object.assign(pea({ tl: p.tl, p0: podSlot(p.slot), h0: POD.h, target: p.target, T1: p.T1, R, e: 0.56, mu: 0.8, k: 0.2 }), { slot: p.slot }));

  // the straggler: aim at the spoon's bowl, landing height = the bowl's height then (spoon motion before is tiny)
  const bowl0 = spoonPoint(SPOON.bowlS, 0, 0, -6);
  const tl5 = POD.tPop2 + 0.02, T5 = 0.86;
  const late = Object.assign(pea({ tl: tl5, p0: podSlot(0), h0: POD.h, target: [bowl0.x, bowl0.z], T1: T5, R, into: { h: bowl0.h } }), { slot: 0 });
  peas.push(late);

  // every table contact, sorted (puffs, squash and the kicks the spoon and the pudding feel)
  const contacts = [];
  peas.forEach((p, i) => p.contacts.forEach((c, j) => contacts.push({ ...c, pea: i, n: j })));
  contacts.sort((a, b) => a.t - b.t);

  // spoon tilt θ: small jolts from contacts on the table, then the late pea lands in the bowl —
  // a kick (its momentum) plus a step (its weight moves the balance point): re-kicked, overshooting, settling at R
  const dist = (c, x, z) => Math.hypot(c.x - x, c.z - z);
  const spoonKicks = contacts.filter((c) => c.pea !== 4).map((c) => ({ t: c.t, J: (0.00011 * c.v) / (1 + dist(c, SPOON.x, SPOON.z) / 260) * (c.n % 2 ? -1 : 1) }));
  spoonKicks.push({ t: late.tLand, J: 0.0006 * late.vImp });
  spoonKicks.push({ t: POD.tPop, J: -0.012 });
  const spoon = oscillator({ w: SPOON.w, kicks: spoonKicks, steps: [{ t: late.tLand, D: 0.05 }], R, eps: EPS, scale: (SPOON.handle + 20) * CB });

  // pudding: a sway (shear along x and z) and a squash; every hit on the table rings it
  const pk = (c, k) => { const dx = PUD.x - c.x, dz = PUD.z - c.z, d = Math.hypot(dx, dz); return { t: c.t, k: (k * c.v) / (1 + d / 330), ux: dx / d, uz: dz / d }; };
  const hits = contacts.map((c) => pk(c, c.pea === 4 ? 0.006 : 0.0042));
  hits.push({ t: POD.tPop, k: 2.6, ux: 1, uz: 0.15 });
  hits.push({ t: POD.tPop2, k: 1.3, ux: 1, uz: 0.1 });
  const wSway = Math.PI * 2 * 2.6, wSq = Math.PI * 2 * 3.7;
  const sway = PUD.hgt;
  const pudX = oscillator({ w: wSway, kicks: hits.map((h) => ({ t: h.t, J: h.k * h.ux * 90 })), R, eps: EPS });
  const pudZ = oscillator({ w: wSway, kicks: hits.map((h) => ({ t: h.t, J: h.k * h.uz * 90 })), R, eps: EPS, scale: SB });
  const pudS = oscillator({ w: wSq, kicks: hits.map((h) => ({ t: h.t, J: -h.k * 0.9 })), R, eps: EPS, scale: sway * CB });

  // the late pea rolls back and forth in the bowl (along the spoon) — an impulse response that is sub-pixel at R
  const along = late.ux * SPOON.dir[0] + late.uz * SPOON.dir[1];
  const rattle = oscillator({ w: Math.PI * 2 * 1.7, kicks: [{ t: late.tLand, J: along * late.vh * 0.35 }], R, eps: EPS });

  // the pod: the lid springs open with overshoot (a step response), and shivers before each pop (an impulse train)
  const lid = oscillator({ w: Math.PI * 2 * 3.1, steps: [{ t: POD.tPop, D: 1 }], kicks: [{ t: POD.tPop2, J: 6 }], R, eps: 0.004 });
  const podJ = oscillator({ w: Math.PI * 2 * 7.5, kicks: [0.4, 0.51, 0.61, 2.0, 2.11, 2.2].map((t, i) => ({ t, J: (i % 2 ? -1 : 1) * (i < 3 ? 1.1 : 0.9) })), R, eps: 0.002 });

  return { coin, peas, late, contacts, spoon, pudX, pudZ, pudS, rattle, lid, podJ };
}
