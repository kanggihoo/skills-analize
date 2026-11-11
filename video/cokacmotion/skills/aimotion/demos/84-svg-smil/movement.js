/*
 * 84 · movement.js — 그림 2: the going train, the mainspring barrel, the escapement and the pendulum.
 *
 * Gear train: nine spur wheels of one module in one plane, each placed at exactly (z₁ + z₂)·m/2 from the wheel
 * it meshes with and given the phase that interlocks its teeth (gears.js meshPhase). The escapement ticks the
 * whole train at once: every beat the escape arbor advances half a tooth (12°) and every wheel advances
 * 12° × 32 / z in alternating directions — exact inverse tooth ratios, so the teeth stay meshed through every tick.
 * Each wheel's motion is ONE <animateTransform type="rotate"> holding one beat — a quick turn with a slight
 * overshoot and recoil (keyTimes/keySplines) — repeated once per beat with accumulate="sum", so the n-th repeat
 * starts where the previous one stopped. Its revolution period is beat × 360° / angle-per-beat ∝ z.
 * Pendulum and anchor: one rotate animation with a value per swing; keySplines give the slow-at-the-ends,
 * fast-through-the-middle swing, and the amplitude grows at the release and dies away when the spring runs down.
 * Mainspring: an <animate attributeName="d"> through spirals computed for wind states 0…1 (same sample angles in
 * every state, so the in-between shapes are radial blends), drawn in first with stroke-dashoffset (pathLength=1).
 */
import { involute, windows, ring, meshPhase, escapeWheel, ratchet, radii } from './gears.js';

const f = (v) => (Math.round(v * 100) / 100).toString();
const f4 = (v) => (Math.round(v * 10000) / 10000).toString();

export const M = 4.6;                       // module: px of pitch diameter per tooth
export const ESC = { x: 540, y: 900, z: 15, tip: 62, root: 49 };
export const PIVOT = { x: 540, y: 790 };     // pendulum suspension = anchor arbor
export const BOB_Y = 700;                    // bob centre below the pivot

// the train: [id, teeth, meshes-with, direction from it (deg)], escape arbor wheel first
const TRAIN = [
  ['E', 32, null, 0],
  ['G3', 18, 'E', 155], ['G2', 40, 'G3', 120], ['G1', 22, 'G2', 150], ['B', 56, 'G1', 75],
  ['R1', 26, 'E', 30], ['R2', 44, 'R1', 70], ['R3', 16, 'R2', 15], ['R4', 46, 'R3', 85],
];

/** positions, phases and per-beat angles for the whole train */
export function layoutTrain() {
  const g = {};
  for (const [id, z, from, dir] of TRAIN) {
    if (!from) { g[id] = { id, z, x: ESC.x, y: ESC.y, phase: 0, sign: 1 }; continue; }
    const p = g[from], dist = M * (p.z + z) / 2, a = dir * Math.PI / 180;
    const w = { id, z, x: p.x + dist * Math.cos(a), y: p.y + dist * Math.sin(a), sign: -p.sign };
    w.phase = meshPhase(p, w);
    g[id] = w;
  }
  for (const w of Object.values(g)) w.perBeat = w.sign * 12 * 32 / w.z;   // degrees per beat
  return g;
}

/** sanity: non-meshing wheels must clear each other's tips (used by the node check, not at runtime) */
export function clearances(g) {
  const ids = Object.keys(g), out = [];
  const meshed = new Set(TRAIN.filter((t) => t[2]).map((t) => [t[0], t[2]].sort().join()));
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = g[ids[i]], b = g[ids[j]];
    if (meshed.has([a.id, b.id].sort().join())) continue;
    const gap = Math.hypot(a.x - b.x, a.y - b.y) - radii(a.z, M).ra - radii(b.z, M).ra;
    out.push([a.id, b.id, Math.round(gap)]);
  }
  return out.sort((x, y) => x[2] - y[2]);
}

// ---------------- timing (shared with main.js) ----------------
export const T_RUN = 2.0, BEAT = 0.5, N_TICKS = 13;               // ticks at 2.0, 2.5, … 8.0
export const STROKES = [[0.78, 0.98], [1.06, 1.26], [1.34, 1.54], [1.62, 1.82]];   // four winding strokes of 90°

// one beat of a wheel: turn with a slight overshoot, recoil, rest — repeated N_TICKS times, accumulating
function tick(a) {
  return `<animateTransform attributeName="transform" type="rotate" dur="${BEAT}s" begin="${T_RUN}s" repeatCount="${N_TICKS}" accumulate="sum" fill="freeze"
    calcMode="spline" values="0;${f4(a * 1.075)};${f4(a * 0.985)};${f4(a)};${f4(a)}" keyTimes="0;0.13;0.2;0.27;1"
    keySplines="0.3 0 0.2 1;0.4 0 0.6 1;0.4 0 0.6 1;0 0 1 1"/>`;
}

// stroke draw-in: pathLength=1, dash 1 1, offset 1 → 0
const drawIn = (begin, dur = 0.7) => `pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"><animate attributeName="stroke-dashoffset" from="1" to="0" begin="${begin}s" dur="${dur}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.3 1"/`;
const fadeIn = (begin, dur = 0.5, to = 1) => `<animate attributeName="opacity" from="0" to="${to}" begin="${begin}s" dur="${dur}s" fill="freeze"/>`;

/** one wheel: wash + ink outline (spoke windows cut out), turning lines, hub and arbor — all inside the tick group */
function wheel(w, delay, { spokes, barrel = false } = {}) {
  const { r, ra, rf } = radii(w.z, M);
  const rIn = rf - Math.max(5, r * 0.1), rHub = Math.max(9, r * 0.22), sw = Math.max(7, r * 0.11);
  const n = spokes ?? (w.z >= 40 ? 5 : w.z >= 26 ? 4 : 0);
  const holes = barrel ? ring(rIn) : windows(n, rIn, rHub, sw, n ? 0.12 : 0);
  const d = involute(w.z, M) + holes;
  let s = `<g transform="translate(${f(w.x)} ${f(w.y)})"><g transform="rotate(${f4(w.phase * 180 / Math.PI)})"><g>${tick(w.perBeat)}`;
  s += `<path d="${d}" fill-rule="evenodd" class="wash brass" opacity="0">${fadeIn(delay + 0.35)}</path>`;
  // turned rings on the rim (rotation-invariant, like real turning marks)
  s += `<g class="turn" opacity="0">${fadeIn(delay + 0.4)}<circle r="${f(rf - 2.2)}"/><circle r="${f(rIn + 2.4)}"/>${n || barrel ? '' : `<circle r="${f(rf * 0.62)}"/><circle r="${f(rf * 0.4)}"/>`}</g>`;
  s += `<path d="${d}" fill-rule="evenodd" class="ink" ${drawIn(delay)}></path>`;
  if (!barrel) {
    s += `<circle r="${f(rHub)}" class="hub" opacity="0">${fadeIn(delay + 0.3)}</circle>`;
    s += `<g class="arbor" opacity="0">${fadeIn(delay + 0.3)}<circle r="5.6"/><line x1="-4.2" y1="0" x2="4.2" y2="0"/></g>`;
  }
  s += '</g></g>';
  // fixed shading: a hatched crescent on the side away from the light (upper left)
  if (!barrel) s += `<path d="M${f(rf * 0.7)} ${f(-rf * 0.7)}A${f(rf)} ${f(rf)} 0 0 1 ${f(-rf * 0.7)} ${f(rf * 0.7)}A${f(rf * 1.1)} ${f(rf * 0.95)} 0 0 0 ${f(rf * 0.7)} ${f(-rf * 0.7)}Z" class="shade" opacity="0">${fadeIn(delay + 0.5, 0.5, 0.55)}</path>`;
  return s + '</g>';
}

/** spiral of the mainspring for wind state w (0 = let down against the wall, 1 = wound round the arbor) */
function spring(w) {
  const rA = 21, rW = 108, g = 5.0, N = 9;           // arbor radius, barrel wall, spring pitch, turns of spring
  const nc = 1 + 7 * w, nw = N - 1 - nc + 1;        // turns packed at the arbor / at the wall (one free turn between)
  const r1 = rA + g * nc, r2 = rW - g * nw;
  const total = (N + 1) * 2 * Math.PI, step = 7 * Math.PI / 180;
  let d = '';
  for (let th = 0, i = 0; th <= total + 1e-6; th += step, i++) {
    const turns = th / (2 * Math.PI);
    let r;
    if (turns <= nc) r = rA + g * turns;
    else if (turns <= nc + 1) { const u = turns - nc; const s = u * u * (3 - 2 * u); r = r1 + (r2 - r1) * s; }
    else r = r2 + g * (turns - nc - 1);
    const a = th + 0.4;
    d += `${i ? 'L' : 'M'}${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`;
  }
  return d;
}

/** the barrel's insides: drum floor, mainspring, ratchet, click and the winding key */
function barrelInsides(B) {
  // key and ratchet: four 90° strokes with pauses; the coil follows stroke by stroke (held during the pauses)
  const keyVals = ['0', '0'], keyTimes = ['0', f4(STROKES[0][0] / 10)];
  const coilVals = [spring(0), spring(0)], coilTimes = ['0', f4(STROKES[0][0] / 10)];
  STROKES.forEach(([a, b], i) => {
    if (i > 0) { keyVals.push(String(90 * i)); keyTimes.push(f4(a / 10)); coilVals.push(spring(i / 4)); coilTimes.push(f4(a / 10)); }
    keyVals.push(String(90 * (i + 1))); keyTimes.push(f4(b / 10));
    coilVals.push(spring((i + 1) / 4)); coilTimes.push(f4(b / 10));
  });
  keyVals.push('360'); keyTimes.push('1');
  // while the train runs the spring lets down a little
  const tEnd = T_RUN + BEAT * (N_TICKS - 1) + 0.15;
  coilVals.push(spring(1), spring(0.72), spring(0.72));
  coilTimes.push(f4(T_RUN / 10), f4(tEnd / 10), '1');
  const ks = [];
  for (let i = 1; i < keyVals.length; i++) ks.push(keyVals[i] !== keyVals[i - 1] ? '0.45 0 0.4 1' : '0 0 1 1');
  const keyAnim = `<animateTransform attributeName="transform" type="rotate" dur="10s" begin="0s" fill="freeze" calcMode="spline" values="${keyVals.join(';')}" keyTimes="${keyTimes.join(';')}" keySplines="${ks.join(';')}"/>`;
  const cs = [];
  for (let i = 1; i < coilVals.length; i++) cs.push(coilVals[i] !== coilVals[i - 1] ? '0.45 0 0.4 1' : '0 0 1 1');
  const coilAnim = `<animate attributeName="d" dur="10s" begin="0s" fill="freeze" calcMode="spline" values="${coilVals.join(';')}" keyTimes="${coilTimes.join(';')}" keySplines="${cs.join(';')}"/>`;

  // click (pawl): lifts as each ratchet tooth passes and snaps back — four teeth per 90° stroke
  const pv = ['0'], pt = ['0'];
  for (const [a, b] of STROKES) for (let j = 0; j < 4; j++) {
    const t0 = a + (b - a) * (j / 4), t1 = a + (b - a) * ((j + 0.85) / 4), t2 = a + (b - a) * ((j + 1) / 4);
    pv.push('0', '-11', '0'); pt.push(f4(t0 / 10), f4(t1 / 10), f4(t2 / 10));
  }
  pv.push('0'); pt.push('1');
  const pawlAnim = `<animateTransform attributeName="transform" type="rotate" dur="10s" begin="0s" fill="freeze" values="${pv.join(';')}" keyTimes="${pt.join(';')}"/>`;

  const key = `<g class="key" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;${f4(0.56 / 10)};${f4(1.9 / 10)};${f4(2.15 / 10)}" dur="10s" begin="0s" fill="freeze"/>
      <g>${keyAnim}
        <path d="M-8 -8L8 -8L8 8L-8 8Z" class="keyshaft"/>
        <path d="M-6 -10C-30 -18 -62 -40 -66 -14C-68 0 -50 4 -30 2C-18 1 -10 0 -6 4Z M6 10C30 18 62 40 66 14C68 0 50 -4 30 -2C18 -1 10 0 6 -4Z" class="keybow"/>
        <circle r="10" class="keyshaft"/><circle cx="-46" cy="-10" r="6" class="keyhole"/><circle cx="46" cy="10" r="6" class="keyhole"/>
      </g></g>`;

  return `<g transform="translate(${f(B.x)} ${f(B.y)})">
    <circle r="114" class="drum" opacity="0">${fadeIn(0.2, 0.5)}</circle>
    <g class="drumlines" opacity="0">${fadeIn(0.3, 0.5)}<circle r="96"/><circle r="74"/><circle r="52"/></g>
    <path d="${spring(0)}" class="spring" ${drawIn(0.15, 0.75)}>${coilAnim}</path>
    <g>${keyAnim}<path d="${ratchet(16, 34, 27)}" class="wash steel"/><path d="${ratchet(16, 34, 27)}" class="ink" ${drawIn(0.35, 0.5)}></path><circle r="9" class="hub"/><path d="M-6 -6H6V6H-6Z" class="ink"/></g>
    <g transform="translate(-50 -38)"><g>${pawlAnim}<path d="M0 -5C10 -6 22 4 30 14L24 18C18 10 8 4 0 5Z" class="wash steel"/><path d="M0 -5C10 -6 22 4 30 14L24 18C18 10 8 4 0 5Z" class="ink"/></g><circle r="5" class="screw"/><line x1="-3.5" y1="0" x2="3.5" y2="0" class="ink thin"/></g>
    <path d="M-62 -60C-90 -52 -96 -34 -86 -20" class="springwire" ${drawIn(0.4, 0.4)}></path>
    ${key}
  </g>`;
}

/** pendulum (behind the train) and anchor (in front of the escape wheel): one shared swing */
export function swing() {
  const A = 4.6, vals = ['0', '0'], times = [0, T_RUN], splines = ['0 0 1 1'];
  const lastTick = T_RUN + BEAT * (N_TICKS - 1);
  const grow = [0.42, 0.7, 0.88, 0.97];
  for (let j = 0; ; j++) {
    const t = T_RUN + BEAT / 2 + BEAT * j;
    const amp = A * (j < grow.length ? grow[j] : 1) * (t > lastTick ? Math.exp(-(t - lastTick) / 1.0) : 1);
    vals.push(f4((j % 2 ? -1 : 1) * amp)); times.push(t);
    splines.push(j === 0 ? '0.25 0.55 0.6 1' : '0.42 0 0.58 1');   // from the release: out of the middle; then extreme to extreme
    if (t > 10.2) break;
  }
  const dur = times[times.length - 1];
  return `<animateTransform attributeName="transform" type="rotate" dur="${f4(dur)}s" begin="0s" fill="freeze" calcMode="spline"
    values="${vals.join(';')}" keyTimes="${times.map((t) => f4(t / dur)).join(';')}" keySplines="${splines.join(';')}"/>`;
}

/** the whole movement: { back (plate, pendulum), train (wheels, barrel), front (escape wheel, anchor) } */
export function movementMarkup(g) {
  // back plate: an arched frame, hatched, with the top bar that carries the pendulum and the orrery
  const plate = `<path d="M118 1556L118 972C118 852 262 790 404 790L676 790C818 790 962 852 962 972L962 1556Z" class="plate" opacity="0">${fadeIn(0.1, 0.6)}</path>
    <path d="M118 1556L118 972C118 852 262 790 404 790L676 790C818 790 962 852 962 972L962 1556Z" class="ink" ${drawIn(0, 0.9)}></path>
    <path d="M136 1540L136 976C136 868 270 808 408 808L672 808C810 808 944 868 944 976L944 1540" class="ink thin" ${drawIn(0.1, 0.9)}></path>
    <rect x="178" y="756" width="724" height="30" rx="4" class="bar" opacity="0">${fadeIn(0.15, 0.5)}</rect>
    <rect x="178" y="756" width="724" height="30" rx="4" class="ink" ${drawIn(0.05, 0.6)}></rect>
    ${[192, 888].map((x) => `<circle cx="${x}" cy="771" r="7" class="screw"/><line x1="${x - 5}" y1="767" x2="${x + 5}" y2="775" class="ink thin"/>`).join('')}
    <path d="M70 1560H1010L996 1590H84Z" class="bar" opacity="0">${fadeIn(0.2, 0.5)}</path>
    <path d="M70 1560H1010L996 1590H84Z" class="ink" ${drawIn(0.1, 0.7)}></path>
    <path d="M60 1590H1020" class="ink" ${drawIn(0.15, 0.7)}></path>`;

  const swingAnim = swing();
  const L = BOB_Y;
  const pendulum = `<g transform="translate(${PIVOT.x} ${PIVOT.y})"><g>${swingAnim}
      <path d="M-2.6 12V${L - 40}M2.6 12V${L - 40}" class="ink rod" ${drawIn(0.3, 0.8)}></path>
      <circle cy="${L}" r="44" class="wash brass bob" opacity="0">${fadeIn(0.8, 0.5)}</circle>
      <circle cy="${L}" r="44" fill="url(#hatch)" opacity="0">${fadeIn(0.9, 0.5, 0.35)}</circle>
      <circle cy="${L}" r="44" class="ink" ${drawIn(0.7, 0.6)}></circle>
      <circle cy="${L}" r="34" class="ink thin" opacity="0">${fadeIn(0.9)}</circle>
      <path d="M-26 ${L - 22}A34 34 0 0 1 8 ${L - 36}" class="gleam" opacity="0">${fadeIn(1.0)}</path>
      <path d="M-7 ${L + 44}h14v14h-14z" class="wash brass"/><path d="M-7 ${L + 44}h14v14h-14z" class="ink thin"/>
    </g></g>
    <path d="M524 784h32v18h-32z" class="bar"/><path d="M524 784h32v18h-32z" class="ink"/>`;

  // anchor: arms from the arbor to two pallets that straddle three and a half teeth of the escape wheel
  const ey = ESC.y - PIVOT.y;
  const pal = [-132, -48].map((a) => { const r = a * Math.PI / 180; return [ESC.tip * Math.cos(r), ey + ESC.tip * Math.sin(r), a]; });
  const arms = `M${f(pal[0][0] - 4)} ${f(pal[0][1] - 10)}C-40 24 -24 6 0 0C24 6 40 24 ${f(pal[1][0] + 4)} ${f(pal[1][1] - 10)}`;
  const pallets = pal.map(([x, y, a]) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a + 90)})"><rect x="-4" y="-2" width="8" height="17" class="jewel"/><rect x="-4" y="-2" width="8" height="17" class="ink thin"/></g>`).join('');
  const anchor = `<g transform="translate(${PIVOT.x} ${PIVOT.y})" opacity="0">${fadeIn(0.9, 0.5)}<g>${swingAnim}
      <path d="${arms}" class="anchorink"/><path d="${arms}" class="anchorwash"/>
      <path d="M0 0L0 -14" class="anchorink"/>
      ${pallets}<circle r="11" class="wash brass"/><circle r="11" class="ink"/><circle r="4" class="ink"/>
    </g></g>`;

  // escape wheel (in front of its arbor's wheel E), ticking with the train
  const E = g.E;
  const escPhase = 5.16;      // a tooth tip rests against the left pallet between beats
  const escD = escapeWheel(ESC.z, ESC.tip, ESC.root) + windows(4, 40, 10, 6, 0.25);
  const escape = `<g transform="translate(${E.x} ${E.y})"><g transform="rotate(${escPhase})"><g>${tick(12)}
      <path d="${escD}" fill-rule="evenodd" class="wash steel" opacity="0">${fadeIn(0.8)}</path>
      <path d="${escD}" fill-rule="evenodd" class="ink" ${drawIn(0.55, 0.7)}></path>
      <circle r="14" class="hub"/><circle r="5" class="ink"/><line x1="-3.5" y1="0" x2="3.5" y2="0" class="ink thin"/>
    </g></g></g>`;

  // the wheels, back to front in drawing order; the barrel's drum is a wheel with an open centre
  const order = [['R4', 0.3], ['R3', 0.42], ['R2', 0.36], ['R1', 0.48], ['G1', 0.3], ['G2', 0.36], ['G3', 0.44], ['E', 0.5]];
  let train = '';
  train += barrelInsidesBack(g.B);
  train += wheel(g.B, 0.18, { barrel: true });
  train += barrelInsides(g.B);
  for (const [id, delay] of order) train += wheel(g[id], delay);

  return { plate, pendulum, train, escape, anchor };
}

// the barrel's back (inside the drum, behind the spring): darker paper so the coil reads
function barrelInsidesBack(B) {
  return `<g transform="translate(${f(B.x)} ${f(B.y)})"><circle r="116" class="drumback" opacity="0">${fadeIn(0.2, 0.5)}</circle></g>`;
}
