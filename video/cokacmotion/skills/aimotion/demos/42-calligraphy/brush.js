/*
 * 42 · brush model (pure JS, no DOM — main.js uses it, and it can be tested in Node).
 *
 * The glyph 길 is written in five strokes in the standard order (ㄱ · ㅣ · ㄹ = ㄱ, ㅡ, ㄴ). Each stroke is a
 * hand-authored key list [t, x, y, pressure, tip angle°] in stage px (y down): 기필 (the tip lands against the
 * direction of travel, presses diagonally and turns), 행필 (travel, the pressure wanders), 꺾임 (lift, re-press and turn
 * at a corner) and 수필 (lift to a point, or press-stop and 회봉 back along the stroke).
 *
 * The brush is a tuft of NB bristles. At pressure p the tuft lies on the paper as a teardrop: a belly of radius rb(p)
 * around the contact point and a tip of length ℓ(p) trailing along the tip angle φ. Each bristle has a fixed place
 * (a, v) in that teardrop (a along it, v across it), so as the pressure and the angle change the bristles fan out,
 * crowd together and cross — every bristle leaves its own track. Each bristle carries its own ink load L: contact
 * drains it (in proportion to time and to distance travelled — a fast stroke runs dry sooner), the belly of the brush
 * refills it by capillarity while the brush slows or hangs in the air, and the belly itself (G) empties over the
 * whole character. Bristles sit in clumps that hold ink differently, so a drying brush opens into parallel white
 * lanes — 비백 (flying white). Everything here is computed once, at setup, as a list of capsules (one per bristle per
 * 1/240 s) sorted by time.
 */

export const HZ = 240;            // bristle samples per second
export const NB = 96;             // bristles
export const R_MAX = 46;          // belly radius at full pressure, px

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
const sstep = (a, b, v) => smooth((v - a) / (b - a));
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- the five strokes of 길 (stage px, y down)
// keys: [t (s from the stroke's start), x, y, pressure, tip angle in degrees (0 = +x, 90 = down, 270 = up)]
export const STROKES = [
  { // 1 · ㄱ: a rising horizontal, a pressed shoulder, and a long sweep down-left that flicks off dry
    t0: 0.75, keys: [
      [0.00, 228, 378, 0.00, 222], [0.07, 247, 400, 0.78, 220], [0.16, 262, 410, 1.04, 208], [0.25, 280, 405, 0.86, 204],
      [0.40, 375, 396, 0.80, 202], [0.55, 480, 386, 0.78, 200], [0.65, 543, 379, 0.80, 203], [0.72, 563, 381, 0.60, 222],
      [0.80, 580, 399, 1.06, 252], [0.90, 584, 434, 0.98, 274], [1.00, 575, 502, 0.90, 290], [1.12, 541, 600, 0.78, 300],
      [1.22, 489, 690, 0.55, 305], [1.30, 432, 760, 0.30, 309], [1.36, 388, 806, 0.08, 312], [1.40, 362, 824, 0.00, 312],
    ],
  },
  { // 2 · ㅣ: pressed head, a long vertical that speeds up and ends in a hanging-needle point (현침)
    t0: 2.45, keys: [
      [0.00, 720, 284, 0.00, 248], [0.07, 735, 305, 0.80, 244], [0.15, 744, 320, 1.06, 254], [0.24, 742, 346, 0.93, 266],
      [0.40, 740, 470, 0.88, 270], [0.56, 737, 620, 0.85, 271], [0.68, 734, 740, 0.78, 272], [0.78, 731, 842, 0.55, 272],
      [0.86, 729, 920, 0.28, 272], [0.92, 728, 966, 0.06, 272], [0.95, 728, 984, 0.00, 272],
    ],
  },
  { // 3 · ㄹ's ㄱ: horizontal, shoulder, short vertical with a press-stop and 회봉
    t0: 3.75, keys: [
      [0.00, 304, 1016, 0.00, 222], [0.06, 320, 1035, 0.72, 218], [0.13, 331, 1042, 0.93, 206], [0.22, 352, 1038, 0.80, 200],
      [0.40, 520, 1028, 0.76, 198], [0.52, 650, 1020, 0.77, 199], [0.58, 699, 1016, 0.70, 205], [0.63, 716, 1020, 0.55, 226],
      [0.69, 729, 1037, 0.96, 256], [0.76, 729, 1063, 0.90, 272], [0.86, 725, 1112, 0.85, 272], [0.93, 723, 1138, 0.96, 282],
      [0.98, 719, 1130, 0.40, 282], [1.02, 716, 1121, 0.00, 282],
    ],
  },
  { // 4 · ㄹ's middle bar, left to right, ending pressed into the corner
    t0: 4.97, keys: [
      [0.00, 316, 1140, 0.00, 222], [0.06, 330, 1158, 0.70, 218], [0.12, 339, 1164, 0.88, 206], [0.22, 382, 1160, 0.78, 199],
      [0.40, 560, 1154, 0.74, 197], [0.52, 680, 1150, 0.75, 198], [0.58, 716, 1149, 0.86, 214], [0.63, 723, 1157, 0.93, 236],
      [0.67, 713, 1150, 0.30, 232], [0.70, 705, 1146, 0.00, 230],
    ],
  },
  { // 5 · ㄹ's ㄴ: down, a pressed corner, then the long bottom stroke — fast and dry in the middle (비백),
    //     slowing and pressing at the end where the belly refills the tip, 회봉 and lift
    t0: 5.85, keys: [
      [0.00, 320, 1150, 0.00, 250], [0.06, 333, 1166, 0.76, 246], [0.13, 340, 1178, 0.96, 256], [0.22, 338, 1206, 0.88, 268],
      [0.34, 334, 1270, 0.85, 270], [0.42, 330, 1310, 0.80, 270], [0.48, 335, 1333, 0.99, 236], [0.55, 362, 1341, 0.92, 202],
      [0.66, 462, 1338, 0.82, 193], [0.78, 604, 1331, 0.72, 191], [0.88, 744, 1321, 0.67, 191], [0.96, 832, 1312, 0.71, 196],
      [1.04, 873, 1306, 0.86, 206], [1.14, 891, 1313, 1.06, 226], [1.22, 885, 1300, 0.55, 222], [1.28, 873, 1295, 0.00, 216],
    ],
  },
];
for (const s of STROKES) s.dur = s.keys[s.keys.length - 1][0];
export const WRITE_END = STROKES[4].t0 + STROKES[4].dur;

// Catmull–Rom through the keys (uniform in key index), column k
function crKeys(keys, tl, k) {
  const n = keys.length;
  let i = 0;
  while (i < n - 2 && keys[i + 1][0] <= tl) i++;
  const u = clamp((tl - keys[i][0]) / Math.max(1e-6, keys[i + 1][0] - keys[i][0]));
  const p0 = keys[Math.max(i - 1, 0)][k], p1 = keys[i][k], p2 = keys[i + 1][k], p3 = keys[Math.min(i + 2, n - 1)][k];
  return 0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u * u * u);
}
/** brush state of a stroke at local time tl: contact point, pressure, tip angle (radians) */
export function strokeState(s, tl) {
  tl = clamp(tl, 0, s.dur);
  return { x: crKeys(s.keys, tl, 1), y: crKeys(s.keys, tl, 2), p: clamp(crKeys(s.keys, tl, 3), 0, 1.15), phi: crKeys(s.keys, tl, 4) * Math.PI / 180 };
}

/** footprint of the pressed tuft: belly radius and tip length */
export function footprint(p) {
  const rb = R_MAX * (0.07 + 0.93 * Math.pow(clamp(p, 0, 1.2), 0.85));
  const tl = rb * (1.2 + 0.5 * clamp(p, 0, 1.2));
  return { rb, tl, area: Math.PI * rb * rb * 0.5 + 0.55 * rb * tl };
}
function halfWidth(xl, rb, tl) {
  if (xl < 0) return Math.sqrt(Math.max(0, rb * rb - xl * xl));
  return rb * Math.pow(Math.max(0, 1 - xl / tl), 0.85);
}

// ---------------------------------------------------------------- the bristles
// where the hairs lie: the pressed belly splays the hairs almost to its full width (a squarish spread, so the edges of a
// stroke get as many hairs as its middle), the tip gathers them to a point
function hairHalfWidth(xl, rb, tl) {
  if (xl < 0) { const k = xl / rb; return rb * Math.pow(Math.max(0, 1 - k * k * k * k), 0.25); }
  return rb * Math.pow(Math.max(0, 1 - xl / tl), 0.85);
}
export const BRISTLES = (() => {
  const r = mulberry(4242);
  const clumpCap = Array.from({ length: 14 }, () => 0.62 + 0.38 * r());
  const out = [];
  for (let i = 0; i < NB; i++) {
    const v = -1 + 2 * (i + 0.2 + 0.6 * r()) / NB;            // lanes, stratified across the tuft
    // hairs cover the pressed footprint evenly (rejection-sample its area, shape at p ≈ 0.8)
    let a = 0;
    for (let k = 0; k < 64; k++) { a = r(); const xl = -0.88 + a * (1.6 + 0.88); if (r() < hairHalfWidth(xl, 1, 1.6)) break; }
    const clump = Math.min(13, Math.floor((v + 1) / 2 * 14 + (r() - 0.5) * 0.9 + 14) % 14);
    out.push({ a, v, size: 0.82 + 0.36 * r(), cap: clumpCap[clump] * (0.9 + 0.1 * r()), seed: r() * 100, clump });
  }
  return out;
})();
function bristlePos(b, st, fp) {
  const xl = -0.88 * fp.rb + b.a * (fp.tl + 0.88 * fp.rb);
  const yl = b.v * hairHalfWidth(xl, fp.rb, fp.tl) * 0.96;
  const c = Math.cos(st.phi), s = Math.sin(st.phi);
  return [st.x + xl * c - yl * s, st.y + xl * s + yl * c];
}

// ink: drained by contact (time + distance), refilled from the belly, the belly empties over the character
const ink = { aT: 0.42, aS: 0.135, mu: 3.4, gamma: 0.105 };
const SIGMA_C = 44;     // carbon optical depth per second of full contact
const Q_WATER = 6.0;    // water per second of contact (sim units)

/**
 * All bristle capsules of all strokes, sorted by time.
 * Per capsule (9 floats): ax, ay, bx, by | r, carbon, water, load | seed.   times[k] = time of capsule batch k.
 */
export function buildCapsules() {
  const L = BRISTLES.map(() => 1.0);       // freshly dipped: every hair saturated
  let G = 1.0;
  const data = [], times = [], firsts = [];
  const stats = [];
  let prevEnd = 0;
  for (let si = 0; si < STROKES.length; si++) {
    const s = STROKES[si];
    // the brush hung in the air since the previous stroke: the tip re-wets from the belly
    const air = s.t0 - prevEnd;
    for (let i = 0; i < NB; i++) L[i] += (G * BRISTLES[i].cap - L[i]) * (1 - Math.exp(-ink.mu * air));
    const n = Math.ceil(s.dur * HZ);
    let prev = null, prevFp = null;
    const st0 = { minL: 9, meanL: 0, cnt: 0 };
    for (let k = 0; k <= n; k++) {
      const tl = Math.min(k / HZ, s.dur), dt = 1 / HZ;
      const st = strokeState(s, tl), fp = footprint(st.p);
      const pos = BRISTLES.map((b) => bristlePos(b, st, fp));
      const contact = st.p > 0.004;
      let drained = 0;
      if (prev && contact) {
        times.push(s.t0 + tl);
        firsts.push(data.length / 9);
        const r0 = Math.min(Math.max(0.072 * fp.rb + 0.55, 0.7), 4.2);
        for (let i = 0; i < NB; i++) {
          const b = BRISTLES[i];
          const [ax, ay] = prev[i], [bx, by] = pos[i];
          const len = Math.hypot(bx - ax, by - ay);
          const Li = L[i];
          // a wet hair carries a bead of ink that merges with its neighbours; a dry hair draws a thin line
          const r = r0 * b.size * (0.65 + 0.7 * sstep(0.3, 0.8, Li));
          const omega = fp.area / (NB * Math.PI * r * r);
          const dtEff = dt * (2 * r) / (2 * r + len);
          const dens = sstep(0.03, 0.25, Li);
          const wet = Math.pow(sstep(0.15, 0.9, Li), 1.2);
          const carbon = SIGMA_C * dtEff * omega * dens;
          const water = Q_WATER * dtEff * omega * wet * (0.45 + 0.55 * Math.min(st.p, 1.1));
          data.push(ax, ay, bx, by, r, carbon, water, Li, b.seed);
          const tr = Li * (ink.aT * dt + ink.aS * len / 100) * (0.6 + 0.4 * Math.min(st.p, 1.1)) / (0.55 + 0.45 * b.cap);   // weak clumps drain faster
          L[i] = Math.max(0, Li - tr);
          drained += tr;
          st0.minL = Math.min(st0.minL, Li); st0.meanL += Li; st0.cnt++;
        }
      }
      // refill from the belly; pressing squeezes the belly and sends more ink to the hairs (heads and press-stops)
      const squeeze = contact ? Math.max(0, st.p - 0.8) : 0;
      const target = G * (contact ? 0.86 + 0.3 * Math.min(st.p, 1.1) : 1);
      for (let i = 0; i < NB; i++) L[i] += (target * BRISTLES[i].cap - L[i]) * Math.min(1, ink.mu * (1 + 4 * squeeze) * dt);
      G = Math.max(0.05, G - ink.gamma * drained / NB);
      prev = pos; prevFp = fp;
    }
    stats.push({ stroke: si + 1, G: +G.toFixed(3), meanL: +(st0.meanL / Math.max(1, st0.cnt)).toFixed(3), minL: +st0.minL.toFixed(3) });
    prevEnd = s.t0 + s.dur;
  }
  return { data: new Float32Array(data), times: new Float64Array(times), firsts: new Int32Array(firsts), count: data.length / 9, stats };
}

// ---------------------------------------------------------------- the brush as seen (for the overlay), pure in t
const ENTRY = { x: 1060, y: 1420, z: 520 }, EXIT = { x: 1180, y: 1650, z: 640 };
/** pose of the brush at time t: contact/hover point, height above the paper, pressure, tip angle, ink sheen */
export function brushPose(t) {
  const S = STROKES;
  const st = (s, tl) => strokeState(s, tl);
  if (t < S[0].t0) {
    const s0 = st(S[0], 0), u = sstep(0.0, S[0].t0, t), e = 1 - Math.pow(1 - u, 3);
    return { x: lerp(ENTRY.x, s0.x - 8, e), y: lerp(ENTRY.y, s0.y - 12, e), z: lerp(ENTRY.z, 0, e) + 26 * Math.sin(Math.PI * u) * (1 - u), p: 0, phi: s0.phi, vis: sstep(0.0, 0.35, t) };
  }
  for (let i = 0; i < S.length; i++) {
    const s = S[i];
    if (t <= s.t0 + s.dur) {
      if (t >= s.t0) { const q = st(s, t - s.t0); return { ...q, z: 0, vis: 1 }; }
      // in the air between stroke i-1 and stroke i
      const a = S[i - 1], ta = a.t0 + a.dur, tb = s.t0;
      const qa = st(a, a.dur), qb = st(s, 0);
      const u = clamp((t - ta) / (tb - ta)), e = u * u * (3 - 2 * u);
      const d = Math.hypot(qb.x - qa.x, qb.y - qa.y);
      const lift = Math.min(150, 40 + d * 0.22) * Math.sin(Math.PI * u);
      let dphi = qb.phi - qa.phi;
      return { x: lerp(qa.x, qb.x, e), y: lerp(qa.y, qb.y, e), z: lift, p: 0, phi: qa.phi + dphi * e, vis: 1 };
    }
  }
  const last = S[S.length - 1], q = st(last, last.dur), u = sstep(WRITE_END, WRITE_END + 0.8, t);
  return { x: lerp(q.x, EXIT.x, u * u), y: lerp(q.y, EXIT.y, u * u), z: EXIT.z * (1 - Math.pow(1 - u, 2)), p: 0, phi: q.phi, vis: 1 - sstep(WRITE_END + 0.55, WRITE_END + 0.8, t) };
}
