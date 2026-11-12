/*
 * burst.js — the water balloon as closed forms of scene time τ (τ = 0: the skin rips on the sprinkler spike).
 *
 *   body      the water's centre falls freely: c(τ) = Y_B − v₀τ − ½gτ² (released from rest DROP_H above, so
 *             v₀ = √(2g·DROP_H)); a slightly egg-shaped radius r(μ) with the l = 2 wobble the release started.
 *   rip       the tear runs up from the puncture at v_rip: front angle θ_a(φ, τ) = θ_hole + (v_rip/R)·τ + J(φ),
 *             J a ragged sum of cosines. Below the front the water is bare; above it the rubber cap still holds it.
 *   water     a sphere mesh displaced per vertex: the spike's cavity, a collar, a puncture ring wave, and a wake of
 *             ripples behind the front (a function of the age α = (θ_a − θ)/ω since the front passed).
 *             On the lawn it squashes into a pancake that keeps its volume (s_y = 1/s_xz²) and lifts a crown.
 *   rubber    the cap θ ∈ [θ_a, π] on the water plus a free lip that rolls outward along a circle of curvature κ:
 *             p(a) = P_a − e_θ·sin(κa)/κ + n·(1 − cos κa)/κ; tongues are long lips with a small κ (petals).
 *   drops     ligaments grow from the peel line at speed v_l, pinch off after a_p and fly on ballistic paths
 *             p = p₀ + v·(τ − τ_p) − ½g(τ − τ_p)²; mist flung by the lip, spray from the puncture, a crown on
 *             the lawn. All are seeded in setup; frame() only evaluates them at τ.
 */
import * as THREE from 'three';
import { clamp, lerp, smooth } from '../_lib/stage.js';
import { SPR } from './yard.js';

export const G = 9.81;
export const BAL = { R: 0.075, dimple: 0.005, dropH: 1.0, vRip: 10, hole: 0.12, thEnd: Math.PI - 0.24, rubOff: 0.0011 };
const R = BAL.R;
export const V0 = Math.sqrt(2 * G * BAL.dropH);                 // 4.43 m/s at the rip
export const Y_B = SPR.tip - BAL.dimple + R;                     // centre height at τ = 0
export const TAU_REL = -V0 / G;                                  // released from rest
export const OMEGA = BAL.vRip / R;                               // rad/s of the front
export const TAU_SNAP = (BAL.thEnd - BAL.hole) / OMEGA;          // the front reaches the neck: the skin lets go
export const TAU_GROUND = (-V0 + Math.sqrt(V0 * V0 + 2 * G * (Y_B - R))) / G;   // the free-fall bottom meets the lawn

export const cy = (t) => (t < TAU_REL ? Y_B + BAL.dropH : Y_B - V0 * t - 0.5 * G * t * t);
export const vy = (t) => (t < TAU_REL ? 0 : -V0 - G * t);

// egg-shaped radius with the wobble started by the release (l = 2 mode, P₂(μ) = (3μ² − 1)/2), μ = direction·ŷ
export function baseR(mu, t) {
  let r = R * (1 + 0.03 * (1 - mu * mu) - 0.06 * Math.max(mu, 0) ** 2);
  const a = t - TAU_REL;
  if (a > 0) r += R * 0.04 * Math.exp(-a / 0.5) * Math.cos(2 * Math.PI * 7.5 * a + 0.8) * 0.5 * (3 * mu * mu - 1);
  return r;
}

const dir = (th, ph, o) => o.set(Math.sin(th) * Math.cos(ph), -Math.cos(th), Math.sin(th) * Math.sin(ph));
const eth = (th, ph, o) => o.set(Math.cos(th) * Math.cos(ph), Math.sin(th), Math.cos(th) * Math.sin(ph));

// spike penetration into the (undeformed) water bottom
export const penetration = (t) => SPR.tip - (cy(t) - baseR(-1, t));
// lawn squash: lateral spread s_xz(a) and the matching thickness 1/s_xz², a = τ − τ_ground
export const spreadAt = (a) => (a <= 0 ? 1 : 1 + 2.5 * (1 - Math.exp(-(a * a) / (2 * 0.03 * 0.03))) + 1.6 * smooth((a - 0.12) / 0.7));
export const crownAt = (a) => (a <= 0 ? 0 : 0.038 * (a / 0.032) * Math.exp(1 - a / 0.032));
// the crown's rim is ragged: fingers where sin(11φ + 0.4) peaks
export const fingers = (ph) => 0.72 + 0.65 * Math.max(0, Math.sin(11 * ph + 0.4)) ** 2 + 0.12 * Math.sin(5 * ph + 1.1);

export function createBurst(R0, { NP = 176, NT = 92, NA = 30, NL = 14 } = {}) {
  // ---------------------------------------------------------------- the ragged front and the lip, per azimuth
  const jag = [];
  for (let k = 2; k <= 9; k++) jag.push([k, (0.05 / Math.sqrt(k)) * (0.5 + R0()), R0() * 6.283]);
  const tongues = [];
  for (let k = 0; k < 7; k++) tongues.push({ ph: (k / 7) * 6.283 + (R0() - 0.5) * 0.5, hw: 0.16 + R0() * 0.14, L: 0.016 + R0() * 0.02, rho: 0.009 + R0() * 0.006 });
  const edge = [];
  for (let k = 0; k < 6; k++) edge.push([13 + Math.floor(R0() * 30), 0.0008 + R0() * 0.0011, R0() * 6.283]);
  const J = new Float32Array(NP), LIP = new Float32Array(NP), KAP = new Float32Array(NP), TW = new Float32Array(NP);
  const Jf = (ph) => jag.reduce((s, [k, a, p]) => s + a * Math.cos(k * ph + p), 0);
  for (let j = 0; j < NP; j++) {
    const ph = (j / NP) * Math.PI * 2;
    let w = 0, L = 0, rho = 0.0026;
    for (const tg of tongues) {
      const d = Math.abs(Math.atan2(Math.sin(ph - tg.ph), Math.cos(ph - tg.ph)));
      const k = clamp(1 - d / tg.hw);
      if (k > w) { w = k; L = tg.L * Math.pow(k, 0.9); rho = lerp(0.0026, tg.rho, Math.pow(k, 0.4)); }
    }
    const rim = 0.0068 + edge.reduce((s, [k, a, p]) => s + a * Math.sin(k * ph + p), 0);
    J[j] = Jf(ph) - 0.05 * w;
    LIP[j] = rim + L;
    KAP[j] = 1 / rho;
    TW[j] = w;
  }
  const frontAt = (j, t) => clamp(BAL.hole + OMEGA * t + J[j] * smooth(t / 0.002), 0, BAL.thEnd);

  // ---------------------------------------------------------------- water mesh (pole down, columns wrap)
  const wN = (NT + 1) * NP;
  const wPos = new Float32Array(wN * 3);
  const wIdx = [];
  for (let i = 0; i < NT; i++) for (let j = 0; j < NP; j++) {
    const a = i * NP + j, b = (i + 1) * NP + j, c = i * NP + ((j + 1) % NP), d = (i + 1) * NP + ((j + 1) % NP);
    wIdx.push(a, b, c, b, d, c);
  }
  const waterGeo = new THREE.BufferGeometry();
  waterGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3).setUsage(THREE.DynamicDrawUsage));
  waterGeo.setIndex(wIdx);
  waterGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 3);

  // ---------------------------------------------------------------- rubber mesh: NA cap rows (top → front), NL lip rows
  const rRows = NA + NL;
  const rPos = new Float32Array(rRows * NP * 3);
  const rIdx = [];
  for (let i = 0; i < rRows - 1; i++) for (let j = 0; j < NP; j++) {
    const a = i * NP + j, b = (i + 1) * NP + j, c = i * NP + ((j + 1) % NP), d = (i + 1) * NP + ((j + 1) % NP);
    rIdx.push(a, c, b, b, c, d);
  }
  const rubberGeo = new THREE.BufferGeometry();
  rubberGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3).setUsage(THREE.DynamicDrawUsage));
  rubberGeo.setIndex(rIdx);
  rubberGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 3);

  const _d = new THREE.Vector3(), _e = new THREE.Vector3(), _p = new THREE.Vector3();

  // rubber vertices in balloon-local coordinates (relative to the water centre) at scene time t
  function rubberLocal(t, out) {
    const ripped = t >= 0;
    const grow = ripped ? smooth(t / 0.0016) : 0;
    const pen = Math.max(0, penetration(Math.min(t, 0)));
    for (let j = 0; j < NP; j++) {
      const ph = (j / NP) * Math.PI * 2;
      const thA = ripped ? frontAt(j, t) : 0;
      for (let i = 0; i < NA; i++) {
        const th = lerp(Math.PI, thA, i / (NA - 1));
        dir(th, ph, _d);
        let r = baseR(_d.y, t) + BAL.rubOff;
        if (!ripped) { const rho = r * Math.sin(th); r -= pen * Math.exp(-((rho / 0.017) ** 2)) * Math.max(0, -_d.y); }
        const o = (i * NP + j) * 3;
        out[o] = _d.x * r; out[o + 1] = _d.y * r; out[o + 2] = _d.z * r;
      }
      // the lip: rolls outward from the attach line
      dir(thA, ph, _d); eth(thA, ph, _e);
      const ra = baseR(_d.y, t) + BAL.rubOff;
      const L = LIP[j] * grow, k = KAP[j];
      for (let i = 1; i <= NL; i++) {
        const a = (L * i) / NL, s = Math.sin(k * a) / k, c = (1 - Math.cos(k * a)) / k;
        const crink = 0.0007 * Math.sin(ph * 41 + a * 520) * (a / (L + 1e-6));
        const o = ((NA - 1 + i) * NP + j) * 3;
        out[o] = _d.x * (ra + c + crink) - _e.x * s;
        out[o + 1] = _d.y * (ra + c + crink) - _e.y * s;
        out[o + 2] = _d.z * (ra + c + crink) - _e.z * s;
      }
    }
  }

  // ---------------------------------------------------------------- the rubber remnant after it lets go
  const rest = new Float32Array(rPos.length);
  rubberLocal(TAU_SNAP, rest);
  const topLocal = new THREE.Vector3(0, baseR(1, TAU_SNAP) + BAL.rubOff, 0);
  const SNAP = { c: new THREE.Vector3(0, cy(TAU_SNAP), 0), axis: new THREE.Vector3(0.62, 0.25, 0.74).normalize() };
  // it is flung up and sideways; aim the landing (lawn, behind and beside the sprinkler) and solve for the velocity
  const LAND = new THREE.Vector3(0.12, 0.07, -0.07);
  const p0k = SNAP.c.clone().add(topLocal);
  const vUp = 2.3 + vy(TAU_SNAP) * 0.0;                 // the snap throws the remnant upward at 2.3 m/s
  const tFly = (vUp + Math.sqrt(vUp * vUp + 2 * G * (p0k.y - LAND.y))) / G;
  const vRem = new THREE.Vector3((LAND.x - p0k.x) / tFly, vUp, (LAND.z - p0k.z) / tFly);
  const remM = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _t = new THREE.Vector3();
  function remnantMatrix(t) {
    const a = Math.min(t - TAU_SNAP, tFly);
    _t.copy(p0k).addScaledVector(vRem, a); _t.y -= 0.5 * G * a * a;
    const u = a / tFly;                                // two whole tumbles, slowing: it lands the right way up
    _q.setFromAxisAngle(SNAP.axis, 4 * Math.PI * u * (1 - 0.35 * u) / 0.65);
    const s = lerp(1, 0.78, smooth(a / 0.03));
    _s.set(s, s, s);
    remM.compose(_t, _q, _s);
    return remM.multiply(new THREE.Matrix4().makeTranslation(-topLocal.x, -topLocal.y, -topLocal.z));
  }

  // ---------------------------------------------------------------- water surface radius (for vertices and ligament bases)
  function waterR(th, j, ph, t, mu) {
    let r = baseR(mu, t);
    if (t < 0) return r;
    const rho = r * Math.sin(th);
    const P = penetration(t);
    // the spike's cavity and the collar the displaced water lifts around it
    r -= Math.min(P, 2 * R * 0.9) * Math.exp(-((rho / 0.0095) ** 2)) * Math.max(0, -mu);
    r += Math.min(P, 0.03) * 0.22 * Math.exp(-(((rho - 0.019) / 0.007) ** 2)) * Math.max(0, -mu);
    // a ring wave running out from the puncture (packet at c = 3 m/s, λ = 6 mm)
    const s = R * th, x = s - 3.0 * t;
    r += 0.0007 * Math.exp(-t / 0.03) * Math.sin(1047 * x) * Math.exp(-((x / 0.012) ** 2));
    // the wake behind the front: rings parallel to the peel line, decaying with their age
    const thA = j >= 0 ? frontAt(j, t) : BAL.hole + OMEGA * t;
    if (th < thA) {
      const age = (thA - th) / OMEGA, gone = Math.exp(-Math.max(0, t - TAU_SNAP) / 0.006);
      r += 0.0009 * Math.exp(-age / 0.0055) * Math.sin(age * 6981 + 1.3) * (1 - Math.exp(-age / 0.0004)) * gone;
    }
    // free of the skin, the water starts to lose the balloon's shape: slow l = 3 lobes
    const free = smooth((t - TAU_SNAP * 0.6) / 0.03);
    if (free > 0) r += 0.0045 * free * Math.sin(th) ** 2 * (Math.sin(3 * ph + 0.7) * 0.7 + Math.cos(2 * th + 0.4) * 0.5);
    return r;
  }

  // world water vertices at t (+ exposure smear along the fall)
  function waterWorld(t, smear) {
    const c = cy(t), a = t - TAU_GROUND;
    const sxz = spreadAt(a), sy = 1 / (sxz * sxz), crown = crownAt(a);
    const sink = 0.004 * smooth((a - 0.2) / 0.6);
    for (let i = 0; i <= NT; i++) {
      const th = (Math.PI * i) / NT;
      for (let j = 0; j < NP; j++) {
        const ph = (j / NP) * Math.PI * 2;
        dir(th, ph, _d);
        const r = waterR(th, j, ph, t, _d.y);
        let x = _d.x * r, y = _d.y * r, z = _d.z * r;
        if (a > 0) {
          // pancake: keep the bottom on the lawn, scale like an incompressible blob, lift a crown at the rim
          const rimK = smooth((Math.sin(th) - 0.72) / 0.28) * smooth((0.35 - _d.y) / 0.5);
          const rn = Math.hypot(x, z) * sxz;
          x *= sxz; z *= sxz;
          y = (y + R) * sy + crown * rimK * fingers(ph) + 0.0018 * Math.sin(rn * 260 - a * 60) * Math.exp(-a / 0.35) - sink;
        } else {
          y += c;
          const k = clamp(2 * _d.y, -1, 1);
          y += smear * k;
        }
        const o = (i * NP + j) * 3;
        wPos[o] = x; wPos[o + 1] = y; wPos[o + 2] = z;
      }
    }
    waterGeo.attributes.position.needsUpdate = true;
    waterGeo.computeVertexNormals();
    fixPoles(waterGeo, NT + 1, NP, 0, NT);
  }

  // rubber in world coordinates (on the body until it snaps, then the flung remnant)
  const _v = new THREE.Vector3();
  function rubberWorld(t, smear) {
    if (t < TAU_SNAP) {
      rubberLocal(t, rPos);
      const c = cy(t);
      for (let i = 0; i < rPos.length; i += 3) { const k = clamp(2 * rPos[i + 1] / R, -1, 1); rPos[i + 1] += c + smear * k; }
    } else {
      const M = remnantMatrix(t);
      const landed = t - TAU_SNAP >= tFly;
      for (let i = 0; i < rPos.length; i += 3) {
        _v.set(rest[i], rest[i + 1], rest[i + 2]).applyMatrix4(M);
        if (landed && _v.y < 0.062) _v.y = 0.062 - (0.062 - _v.y) * 0.08;   // it settles on the blade tips
        rPos[i] = _v.x; rPos[i + 1] = _v.y; rPos[i + 2] = _v.z;
      }
    }
    rubberGeo.attributes.position.needsUpdate = true;
    rubberGeo.computeVertexNormals();
    fixPoles(rubberGeo, rRows, NP, 0, -1);
  }
  // knot (the tied neck) on the top of the cap
  const knotM = new THREE.Matrix4();
  function knotMatrix(t, smear) {
    if (t < TAU_SNAP) {
      return knotM.makeTranslation(0, cy(t) + baseR(1, t) + BAL.rubOff + smear, 0);
    }
    return knotM.copy(remnantMatrix(t)).multiply(new THREE.Matrix4().makeTranslation(topLocal.x, topLocal.y, topLocal.z));
  }

  // ---------------------------------------------------------------- drops: ligaments, mist, puncture spray, lawn crown
  const drops = [];     // { tb, tp, r, p: [x,y,z], v: [x,y,z], th, j, lig, tHit }
  const ligs = [];      // { th, j, ph, tb, ap, L, beta, rs }
  const NLA = 34;
  for (let k = 0; k < NLA; k++) {
    const j = Math.floor(((k + R0() * 0.7) / NLA) * NP) % NP, ph = (j / NP) * Math.PI * 2;
    for (let th = BAL.hole + 0.05 + R0() * 0.06; th < BAL.thEnd - 0.06; th += 0.085 + R0() * 0.04) {
      const tb = (th - BAL.hole - J[j]) / OMEGA;
      if (tb <= 0.0002) continue;
      const lg = { th, j, ph, tb, ap: 0.0011 + R0() * 0.0014, L: 0.004 + R0() * 0.008, beta: 0.35 + R0() * 0.45, rs: 0.0008 + R0() * 0.0005 };
      ligs.push(lg);
      drops.push({ kind: 'lig', lig: lg, tb, tp: tb + lg.ap, r: 0.0011 + R0() * 0.0009 });
      if (R0() < 0.55) drops.push({ kind: 'lig', lig: lg, tb, tp: tb + lg.ap * 0.8, r: 0.0007 + R0() * 0.0003, sat: 0.55 });
    }
  }
  // the lip flings a mist of small drops outward and up along the peel direction
  for (let k = 0; k < 30; k++) {
    const j = Math.floor(((k + R0()) / 30) * NP) % NP, ph = (j / NP) * Math.PI * 2;
    for (let th = BAL.hole + 0.02 + R0() * 0.05; th < BAL.thEnd - 0.03; th += 0.075 + R0() * 0.05) {
      const tb = (th - BAL.hole - J[j]) / OMEGA;
      if (tb <= 0.0001) continue;
      dir(th, ph, _d); eth(th, ph, _e);
      const r0 = baseR(_d.y, tb) + 0.003;
      const vn = 0.5 + R0() * 1.3, vt = 0.4 + R0() * 1.6;
      drops.push({ kind: 'free', tb, tp: tb, r: 0.0007 + R0() * 0.0005,
        p: [_d.x * r0, cy(tb) + _d.y * r0, _d.z * r0],
        v: [_d.x * vn + _e.x * vt, vy(tb) + _d.y * vn + _e.y * vt, _d.z * vn + _e.z * vt] });
    }
  }
  // spray from the puncture: water shoved aside by the spike
  for (let k = 0; k < 130; k++) {
    const tb = 0.0002 + Math.pow(R0(), 1.3) * 0.016, ph = R0() * Math.PI * 2, rho = 0.011 + R0() * 0.012;
    const vr = 0.6 + R0() * 1.6, vu = 0.6 + R0() * 2.2;
    drops.push({ kind: 'free', tb, tp: tb, r: 0.0008 + R0() * 0.0010,
      p: [Math.cos(ph) * rho, cy(tb) - R + 0.004, Math.sin(ph) * rho],
      v: [Math.cos(ph) * vr, vy(tb) + vu, Math.sin(ph) * vr] });
  }
  // the crown on the lawn: drops leave the rising rim
  for (let k = 0; k < 300; k++) {
    const a = 0.006 + Math.pow(R0(), 0.8) * 0.05, tb = TAU_GROUND + a, ph = R0() * Math.PI * 2;
    const rr = R * 1.03 * spreadAt(a), h = R * 2 / spreadAt(a) ** 2 * 0.5 + crownAt(a);
    const vr = 1.2 + R0() * 2.4, vu = 0.5 + R0() * 1.9;
    drops.push({ kind: 'free', tb, tp: tb, r: 0.0009 + R0() * 0.0016,
      p: [Math.cos(ph) * rr, h, Math.sin(ph) * rr], v: [Math.cos(ph) * vr, vu, Math.sin(ph) * vr] });
  }
  // each crown finger throws two big drops
  for (let k = 0; k < 11; k++) for (const a of [0.026 + R0() * 0.008, 0.042 + R0() * 0.01]) {
    const ph = (Math.PI / 2 - 0.4 + 2 * Math.PI * k) / 11 + (R0() - 0.5) * 0.05, tb = TAU_GROUND + a;
    const rr = R * 1.0 * spreadAt(a), h = R / spreadAt(a) ** 2 + crownAt(a) * fingers(ph);
    const vr = 0.7 + R0() * 1.1, vu = 0.9 + R0() * 1.0;
    drops.push({ kind: 'free', tb, tp: tb, r: 0.0017 + R0() * 0.0011,
      p: [Math.cos(ph) * rr, h, Math.sin(ph) * rr], v: [Math.cos(ph) * vr, vu, Math.sin(ph) * vr] });
  }
  // afterwards: water beads left on the sprinkler (they appear as the blob's top slides past them) and two drips
  const passAt = (y) => { return (-V0 + Math.sqrt(V0 * V0 + 2 * G * Math.max(0, Y_B + R - y))) / G; };
  const beadAt = (x, y, z, r) => drops.push({ kind: 'bead', tb: passAt(y), tp: 1e9, r, p: [x, y, z], v: [0, 0, 0], tHit: 1e9 });
  for (let k = 0; k < 30; k++) {
    const ph = R0() * Math.PI * 2, y = 0.119 + R0() * 0.036, rb = SPR.headR - 0.0004 + (y > 0.148 ? -(y - 0.148) * 0.5 : 0);
    beadAt(Math.cos(ph) * rb, y, Math.sin(ph) * rb, 0.0007 + R0() * 0.0012);
  }
  for (let k = 0; k < 12; k++) {
    const ph = R0() * Math.PI * 2, rr = 0.012 + R0() * 0.012;
    beadAt(Math.cos(ph) * rr, SPR.headTop - (rr - 0.012) * 0.25 + 0.0005, Math.sin(ph) * rr, 0.0008 + R0() * 0.0011);
  }
  for (let k = 0; k < 6; k++) {
    const y = SPR.headTop + 0.006 + R0() * 0.05, rs = SPR.spikeR * Math.pow(1 - (y - SPR.headTop) / (SPR.tip - SPR.headTop), 1.15) + 0.0003, ph = R0() * Math.PI * 2;
    beadAt(Math.cos(ph) * (rs + 0.0003), y, Math.sin(ph) * (rs + 0.0003), 0.0006 + R0() * 0.0006);
  }
  for (const [ph, tb, tp] of [[0.6, 0.18, 0.78], [2.9, 0.45, 1.42]]) {
    const x = Math.cos(ph) * 0.027, z = Math.sin(ph) * 0.027, y = SPR.headY0 - 0.002;
    const d = { kind: 'drip', tb, tp, r: 0.0024, p: [x, y, z], v: [0, 0, 0] };
    drops.push(d);
  }

  // ligament base (world) at t
  const ligBase = (lg, t, out) => {
    dir(lg.th, lg.ph, _d);
    const r = waterR(lg.th, lg.j, lg.ph, t, _d.y);
    return out.set(_d.x * r, cy(t) + _d.y * r, _d.z * r);
  };
  const ligDir = (lg, out) => {
    dir(lg.th, lg.ph, _d); eth(lg.th, lg.ph, _e);
    return out.copy(_d).multiplyScalar(Math.cos(lg.beta)).addScaledVector(_e, Math.sin(lg.beta)).normalize();
  };
  // pinch state of every ligament drop, then its catch time on the lawn (grass blades catch drops at 1–5 cm)
  const _b = new THREE.Vector3(), _u = new THREE.Vector3();
  for (const d of drops) {
    if (d.kind === 'lig') {
      const lg = d.lig, f = d.sat || 1;
      ligBase(lg, d.tp, _b); ligDir(lg, _u);
      const vl = (lg.L / lg.ap) * f;
      d.p = [_b.x + _u.x * lg.L * f, _b.y + _u.y * lg.L * f, _b.z + _u.z * lg.L * f];
      d.v = [_u.x * vl, vy(d.tp) + _u.y * vl, _u.z * vl];
    }
    if (d.kind === 'bead') continue;
    const hc = 0.012 + R0() * 0.04 + d.r;
    const y0 = d.p[1] - (d.kind === 'drip' ? d.r : 0), v0y = d.v[1];
    d.tHit = y0 > hc ? d.tp + (v0y + Math.sqrt(v0y * v0y + 2 * G * (y0 - hc))) / G : d.tp;
  }

  // ---------------------------------------------------------------- per-frame instance writing
  const _m = new THREE.Matrix4(), _qq = new THREE.Quaternion(), _sc = new THREE.Vector3(), _pp = new THREE.Vector3(), _vv = new THREE.Vector3();
  const Y = new THREE.Vector3(0, 1, 0);
  function writeDrops(t, spanTau, mesh, stalks, eye, streaks) {
    let n = 0, ns = 0, nk = 0;
    for (const d of drops) {
      if (t < d.tb || t > d.tHit + 0.004) continue;
      let r = d.r;
      if (d.kind === 'bead') {
        _pp.set(d.p[0], d.p[1], d.p[2]); _vv.set(0, 0, 0);
        r *= smooth((t - d.tb) / 0.01);
      } else if (d.kind === 'drip') {
        // a drop swells under the rim, lets go, and falls
        const grow = clamp((t - d.tb) / (d.tp - d.tb)), a = Math.max(0, t - d.tp);
        r *= Math.cbrt(Math.max(grow, 0.001));
        _pp.set(d.p[0], d.p[1] - r * (1 + 0.4 * grow) - 0.5 * G * a * a, d.p[2]);
        _vv.set(0, -G * a, 0);
        if (t > d.tHit) r *= 1 - (t - d.tHit) / 0.004;
      } else if (t < d.tp) {
        // still a bead on its ligament: grows as the thread stretches
        const lg = d.lig, a = (t - d.tb) / lg.ap, f = d.sat || 1;
        ligBase(lg, t, _b); ligDir(lg, _u);
        _pp.copy(_b).addScaledVector(_u, lg.L * a * f);
        _vv.set(0, vy(t), 0).addScaledVector(_u, (lg.L / lg.ap) * f);
        r *= Math.sqrt(clamp(a * 1.4));
      } else {
        const a = t - d.tp;
        _pp.set(d.p[0] + d.v[0] * a, d.p[1] + d.v[1] * a - 0.5 * G * a * a, d.p[2] + d.v[2] * a);
        _vv.set(d.v[0], d.v[1] - G * a, d.v[2]);
        if (d.kind === 'free') r *= Math.sqrt(clamp((t - d.tb) / 0.0006));
        if (t > d.tHit) r *= 1 - (t - d.tHit) / 0.004;
      }
      // a drop flying at the lens would be a huge, nearly empty blur: let the ones that come within 30 cm pass by
      if (eye) r *= smooth((_pp.distanceTo(eye) - 0.15) / 0.15);
      if (r < 1e-5) continue;
      // exposure streak: stretched along the velocity by |v|·span (nothing while the scene is frozen)
      const sp = _vv.length(), L = sp * spanTau;
      if (sp > 1e-6) _qq.setFromUnitVectors(Y, _vv.multiplyScalar(1 / sp)); else _qq.identity();
      _sc.set(r, r + 0.5 * L, r);
      // a long streak is a faint smear, not a solid near object: it goes to the mesh that writes no depth
      if (L > 2 * r && streaks) streaks.setMatrixAt(nk++, _m.compose(_pp, _qq, _sc));
      else mesh.setMatrixAt(n++, _m.compose(_pp, _qq, _sc));
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (streaks) { streaks.count = nk; streaks.instanceMatrix.needsUpdate = true; }
    // ligament threads: from the base to the bead, retracting after the pinch
    for (const lg of ligs) {
      const a = t - lg.tb;
      if (a < 0 || a > lg.ap + 0.0016) continue;
      const len = a < lg.ap ? lg.L * (a / lg.ap) : lg.L * (1 - (a - lg.ap) / 0.0016);
      const rad = lg.rs * (a < lg.ap ? 1 : 1 - 0.5 * (a - lg.ap) / 0.0016) * Math.sqrt(clamp(a / 0.0003));
      if (len < 1e-4) continue;
      ligBase(lg, t, _b); ligDir(lg, _u);
      _b.addScaledVector(_u, -0.0015);
      _qq.setFromUnitVectors(Y, _u);
      _sc.set(rad, len + 0.0015, rad);
      stalks.setMatrixAt(ns++, _m.compose(_b, _qq, _sc));
    }
    stalks.count = ns;
    stalks.instanceMatrix.needsUpdate = true;
    return n;
  }

  return {
    waterGeo, rubberGeo, waterWorld, rubberWorld, knotMatrix, writeDrops,
    nDrops: drops.length, nLigs: ligs.length, tFly, LAND,
    get counts() { return { drops: drops.length, ligs: ligs.length }; },
  };
}

// pole rows of a lat-long grid share one point: give them one normal (the mean of the next row's); vertices whose
// triangles all collapsed (a lip of zero length) get the normal of the row above instead of a NaN
function fixPoles(geo, rows, NP, r0, r1) {
  const n = geo.attributes.normal.array;
  for (let i = 0; i < rows; i++) for (let j = 0; j < NP; j++) {
    const o = (i * NP + j) * 3;
    if (!(n[o] * n[o] + n[o + 1] * n[o + 1] + n[o + 2] * n[o + 2] > 0.5)) {
      const q = ((i > 0 ? i - 1 : i + 1) * NP + j) * 3;
      const l = Math.hypot(n[q], n[q + 1], n[q + 2]);
      if (l > 0.5) { n[o] = n[q] / l; n[o + 1] = n[q + 1] / l; n[o + 2] = n[q + 2] / l; } else { n[o] = 0; n[o + 1] = 1; n[o + 2] = 0; }
    }
  }
  for (const [row, nb] of [[r0, r0 + 1], [r1, r1 - 1]]) {
    if (row < 0) continue;
    let x = 0, y = 0, z = 0;
    for (let j = 0; j < NP; j++) { const o = (nb * NP + j) * 3; x += n[o]; y += n[o + 1]; z += n[o + 2]; }
    const l = Math.hypot(x, y, z) || 1;
    for (let j = 0; j < NP; j++) { const o = (row * NP + j) * 3; n[o] = x / l; n[o + 1] = y / l; n[o + 2] = z / l; }
  }
  geo.attributes.normal.needsUpdate = true;
}
