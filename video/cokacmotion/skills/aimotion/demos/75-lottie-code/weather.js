/*
 * weather.js — the composition, written as Lottie JSON through lottie-kit.js.
 * Root comp 1080×1920 @ 60 fps, 10 s. Badge space = the children of the SHAKE null (origin at the badge centre).
 *
 *  ind  layer                         technique
 *    1  flash                         full-frame white, opacity keys (lightning)
 *    2  sparkles                      'sr' 4-point stars, overshoot scale pops                      parent 101
 *    3  puff (left foot of rainbow)   PRECOMP 'puff' reused                                         parent 101
 *    4  cloud                         PATH KEYFRAMES morph cumulus ↔ rain cloud, colour keys, bob    parent 101
 *    5  bolt                          PATH KEYFRAMES spark → bolt (overshoot) + round corners        parent 101
 *    6  rainbow                       5 arcs, TRIM PATHS staggered                                   parent 101
 *    7  ring                          badge outline drawn by a TRIM PATH (+ offset), morphs          parent 101
 *    8  matte                         badge shape, td = 1 (TRACK MATTE source)                       parent 101
 *    9  rain                          PRECOMP 'rainfall' (36 time-offset 'drop' precomps), tt = 1   parent 101
 *   10  sun                           REPEATER rays (fan 0° → 30°, trim grow), radial GRADIENT, tt=1 parent 101
 *   11  sky                           linear GRADIENT with animated stops, liquid-fill MASK          parent 101
 *   12  badge base, 13 badge shadow                                                                   parent 101
 * 14–17 icon tiles                    PRECOMPS (tile_rain nests rainfall → drop, and its own matte)
 * 18–20 background puffs + decor, 21–22 hills, 23 cream
 *  100  BADGE null (rise + shrink at the end), 101 SHAKE null (thunder) → PARENTING chain
 */
import { rand } from '../_lib/stage.js';
import {
  K, E, rgb, stops, group, path, ellipse, rect, star, fill, stroke, gfill, trim, roundCorners, repeater,
  shapeLayer, nullLayer, precompLayer, mask, animation, asset,
  circleAt, roundSquare, roundSquareAngles, cloudPath, arcPath, polyPath, line, scalePath,
} from './lottie-kit.js';

export const D = 10;
export const W = 1080, H = 1920;
export const BADGE = { x: 540, y: 860, endY: 680, endScale: 62 };
export const T = { ring: 0.05, sunUp: 0.85, cloudIn: 2.3, rain: 3.95, thunder: 5.38, clear: 6.5, rainbow: 6.95, final: 7.95 };

export const PAL = {
  cream: '#FFF4DE', creamShadow: '#EED6AE', navy: '#1D3557', navy2: '#2C4A73', white: '#FFFFFF',
  sun: '#FFC233', sunDeep: '#FFAA1D', bolt: '#FFD23F', boltDeep: '#F0A400', coral: '#FF7A8A', sky: '#4FB6F7',
  rainbow: ['#FF5A5F', '#FF9F1C', '#FFD23F', '#3DDC97', '#4CC9F0'],
};

// ---------- geometry ----------
const R = 360, SQ = 330, RC = 112;                               // badge: circle radius → rounded square half-size / corner
const badgePath = (grow, square) => (square ? roundSquare(SQ + grow, RC + grow) : circleAt(R + grow, roundSquareAngles(SQ + grow, RC + grow)));
const badgeK = (grow = 0) => K([[0, badgePath(grow, false)], [8.02, badgePath(grow, false)], [8.62, badgePath(grow, true), E.back]]);

const CLOUD_A = cloudPath([[-150, 28, 72], [-55, -38, 108], [70, -20, 96], [162, 32, 68]], 100);   // fair-weather cumulus
const CLOUD_B = cloudPath([[-186, 28, 72], [-70, -45, 112], [75, -50, 115], [190, 26, 74]], 100);  // broad rain cloud
const BOLT = polyPath([[-20, 0], [50, 0], [10, 95], [62, 95], [-40, 250], [0, 140], [-52, 140]].map(([x, y]) => [x * 1.12, y * 1.12]));
const SPARK = scalePath(BOLT, 0.14, 0.1, 10, 6);

function cloudGroups(P, body, shade) {
  return [group('body', [path(P), fill(body)]), group('shade', [path(P), fill(shade)], { p: [0, 15] })];
}
/** sinusoidal bob as keyframes (secondary motion): ±amp px, one swing every `half` s */
function bobK(t0, t1, amp, half, phase = 1) {
  const keys = [[0, [0, 0]], [t0, [0, 0]]];
  let s = phase;
  for (let t = t0 + half; t <= t1 + half; t += half, s = -s) keys.push([+t.toFixed(3), [0, amp * s], E.soft]);
  return K(keys);
}
/** a chain of overshoot pops (0 → peak → 0) at the given times */
function popsK(times, peak = 100, life = 0.6) {
  const keys = [[0, [0, 0]]];
  for (const t of times) keys.push([t, [0, 0]], [t + 0.22, [peak, peak], E.back], [t + life, [0, 0], E.in]);
  return K(keys);
}

// ---------- precomps ----------
function dropAsset() {
  return asset('drop', 40, 320, [shapeLayer({
    ind: 1, nm: 'streak', ip: 0, op: 0.53,
    shapes: [group('streak', [path(line(20, 10, 20, 300)), trim(K([[0.14, 0], [0.5, 100, E.in]]), K([[0, 0], [0.32, 100, E.in]])), stroke(rgb('#E8F6FF'), 11)])],
  })]);
}
/** 36 drops, each a time-offset instance (st) of the 'drop' precomp — AE's "duplicate & offset" trick */
function rainfallAsset() {
  const r = rand(7501), layers = [], N = 36, span = 2.2;
  for (let n = 0; n < N; n++) {
    const t = +((n / N) * span + r() * 0.04).toFixed(3);
    const col = (n * 5) % 9;                                       // stratified columns, shuffled order
    const x = 400 - 236 + col * 59 + (r() * 2 - 1) * 16, y = r() * 46;
    layers.push(precompLayer({ ind: n + 1, nm: `drop ${n}`, refId: 'drop', w: 40, h: 320, st: t, ip: t, op: t + 0.53,
      ks: { a: [20, 10], p: [+x.toFixed(1), +y.toFixed(1)], r: 14 } }));
  }
  return asset('rainfall', 800, 640, layers);
}
const puffAsset = () => asset('puff', 600, 360, [shapeLayer({ ind: 1, nm: 'puff', ks: { p: [300, 200] }, shapes: cloudGroups(CLOUD_A, rgb(PAL.white), rgb('#CFE6FA')) })]);

function tileBg(ind, col) {
  return shapeLayer({ ind, nm: 'tile', ks: { p: [110, 110] }, shapes: [
    group('face', [rect([196, 196], 50), fill(rgb(col))]),
    group('drop shadow', [rect([196, 196], 50), fill(rgb(PAL.creamShadow))], { p: [0, 9] }),
  ] });
}
function tileAssets() {
  const spin = K([[7.9, 0], [10.2, 70, E.lin]]);
  const sun = asset('tile_sun', 220, 220, [
    shapeLayer({ ind: 1, nm: 'sun', ks: { p: [110, 110] }, shapes: [
      group('core', [ellipse([86, 86]), gfill({ t: 2, s: [-14, -16], e: [52, 0], n: 3, g: stops([[0, '#FFE680'], [0.55, PAL.sun], [1, PAL.sunDeep]]) })]),
      group('rays', [path(line(0, -56, 0, -76)), stroke(rgb(PAL.sunDeep), 12), repeater({ c: 8, r: 45 })], { r: spin }),
    ] }),
    tileBg(2, '#FFE9A8'),
  ]);
  const cloud = asset('tile_cloud', 220, 220, [
    precompLayer({ ind: 1, nm: 'puff', refId: 'puff', w: 600, h: 360,
      ks: { a: [300, 200], p: K([[0, [110, 116]], [8.2, [110, 116]], [8.9, [110, 106], E.soft], [9.6, [110, 116], E.soft], [10.3, [110, 106], E.soft]]), s: [36, 36] } }),
    tileBg(2, '#BFE6FF'),
  ]);
  const rain = asset('tile_rain', 220, 220, [
    shapeLayer({ ind: 1, nm: 'rain cloud', ks: { p: [110, 84], s: [31, 31] }, shapes: cloudGroups(CLOUD_B, rgb('#EEF2F8'), rgb('#AEBCD0')) }),
    shapeLayer({ ind: 2, nm: 'tile matte', td: true, ks: { p: [110, 110] }, shapes: [group('m', [rect([196, 196], 50), fill(rgb(PAL.white))])] }),
    precompLayer({ ind: 3, nm: 'rainfall', refId: 'rainfall', w: 800, h: 640, tt: 1, tp: 2, st: 7.6, ip: 7.6, op: 10.5,
      ks: { a: [400, 0], p: [112, 104], s: [28, 28] } }),
    tileBg(4, '#3D5A80'),
  ]);
  const bolt = asset('tile_bolt', 220, 220, [
    shapeLayer({ ind: 1, nm: 'bolt', ks: { a: [6, 140], p: [110, 112], s: [46, 46],
      o: K([[0, 100], [9.05, 100], [9.08, 35, E.lin], [9.12, 100, E.lin], [9.2, 100], [9.23, 50, E.lin], [9.27, 100, E.lin]]) }, shapes: [
      group('bolt', [path(BOLT), roundCorners(9), fill(rgb(PAL.bolt))]),
      group('shade', [path(BOLT), roundCorners(9), fill(rgb(PAL.boltDeep))], { p: [10, 9] }),
    ] }),
    shapeLayer({ ind: 2, nm: 'sparks', shapes: [
      group('s1', [star({ or: 16, ir: 5 }), fill(rgb(PAL.white))], { p: [52, 62], s: popsK([8.95, 9.6], 100, 0.55) }),
      group('s2', [star({ or: 11, ir: 4 }), fill(rgb(PAL.bolt))], { p: [168, 150], s: popsK([9.1, 9.75], 100, 0.55) }),
    ] }),
    tileBg(3, PAL.navy),
  ]);
  return [sun, cloud, rain, bolt];
}

// ---------- the root comp ----------
export function buildAnimation() {
  const layers = [];
  const B = { parent: 101 };   // badge-space layers hang off the shake null

  // 1 · lightning flash
  layers.push(shapeLayer({ ind: 1, nm: 'flash', ip: 5.3, op: 6.0,
    ks: { o: K([[0, 0], [5.38, 0], [5.42, 70, E.lin], [5.52, 6], [5.58, 48, E.lin], [5.84, 0]]) },
    shapes: [group('white', [rect([W + 40, H + 40]), fill(rgb(PAL.white))], { p: [W / 2, H / 2] })] }));

  // 2 · sparkles around the badge
  const sp = [[330, -300, PAL.sun, 26], [-345, -255, PAL.coral, 20], [384, 150, PAL.sky, 18], [-372, 228, PAL.sun, 24], [12, -448, PAL.sky, 16], [300, 336, PAL.coral, 18]];
  layers.push(shapeLayer({ ...B, ind: 2, nm: 'sparkles', shapes: sp.map(([x, y, c, or], n) => group(`spark ${n}`, [star({ or, ir: or * 0.32 }), fill(rgb(c))], {
    p: [x, y], r: K([[0, 0], [10, 200 * (n % 2 ? -1 : 1), E.lin]]),
    s: popsK([1.72 + n * 0.05, 7.6 + n * 0.06, 8.78 + n * 0.05], 100, 0.62) })) }));

  // 3 · a second cloud (precomp reuse) at the rainbow's left foot
  layers.push(precompLayer({ ...B, ind: 3, nm: 'puff left', refId: 'puff', w: 600, h: 360, ip: 6.95,
    ks: { a: [300, 200], p: [-290, 168], s: K([[7.0, [0, 0]], [7.42, [46, 46], E.back]]) } }));

  // 4 · the cloud: drifts in, morphs into a rain cloud and darkens, clears, settles at the rainbow's right foot
  const body = K([[0, rgb(PAL.white)], [3.55, rgb(PAL.white)], [4.0, rgb('#CBD6E6')], [5.36, rgb('#CBD6E6')], [5.44, rgb('#8E9EB9'), E.lin], [6.45, rgb('#8E9EB9')], [6.95, rgb(PAL.white)]]);
  const shade = K([[0, rgb('#CFE6FA')], [3.55, rgb('#CFE6FA')], [4.0, rgb('#A3B4CC')], [5.36, rgb('#A3B4CC')], [5.44, rgb('#6C7E9C'), E.lin], [6.45, rgb('#6C7E9C')], [6.95, rgb('#CFE6FA')]]);
  const morph = K([[0, CLOUD_A], [3.55, CLOUD_A], [4.08, CLOUD_B, E.back], [6.5, CLOUD_B], [7.02, CLOUD_A, E.back]]);
  layers.push(shapeLayer({ ...B, ind: 4, nm: 'cloud', ip: 2.2,
    ks: { p: K([[0, [720, 40]], [2.3, [720, 40]], [3.1, [70, 24], E.back], [3.55, [70, 24]], [4.05, [40, -6]], [6.5, [40, -6]], [7.15, [200, 150], E.back]]),
      s: K([[0, [100, 100]], [6.5, [100, 100]], [7.15, [66, 66], E.back]]) },
    shapes: [group('cloud', [group('body', [path(morph), fill(body)]), group('shade', [path(morph), fill(shade)], { p: [0, 15] })], { p: bobK(3.1, 10, 6, 0.7) })] }));

  // 5 · lightning: the path morphs from a spark to the bolt with an overshoot, then flickers and retracts
  const boltK = K([[0, SPARK], [5.37, SPARK], [5.57, BOLT, E.backBig], [6.42, BOLT], [6.6, SPARK, E.in]]);
  layers.push(shapeLayer({ ...B, ind: 5, nm: 'bolt', ip: 5.3, op: 6.7,
    ks: { p: [26, 66], o: K([[0, 100], [5.63, 100], [5.66, 30, E.lin], [5.70, 100, E.lin], [5.93, 100], [5.96, 45, E.lin], [6.0, 100, E.lin]]) },
    shapes: [group('bolt', [path(boltK), roundCorners(9), fill(rgb(PAL.bolt))]), group('shade', [path(boltK), roundCorners(9), fill(rgb(PAL.boltDeep))], { p: [10, 9] })] }));

  // 6 · rainbow: five bands drawn by trim paths, outer band first
  layers.push(shapeLayer({ ...B, ind: 6, nm: 'rainbow', ip: 6.9,
    shapes: PAL.rainbow.map((c, j) => {
      const t0 = T.rainbow + j * 0.07;
      return group(`band ${j}`, [path(arcPath(-20, 190, 300 - j * 30)), trim(0, K([[0, 0], [t0, 0], [t0 + 0.8, 100, E.out]])), stroke(rgb(c), 31)]);
    }).reverse() }));

  // 7 · the outline ring draws itself
  layers.push(shapeLayer({ ...B, ind: 7, nm: 'ring',
    shapes: [group('ring', [path(badgeK(16)), trim(0, K([[0, 0], [T.ring, 0], [0.82, 100, E.out]]), K([[0, -80], [T.ring, -80], [0.82, 22, E.out]])), stroke(rgb(PAL.navy), 16)])] }));

  // 8 · track-matte source (never drawn itself)
  layers.push(shapeLayer({ ...B, ind: 8, nm: 'badge matte', td: true, shapes: [group('matte', [path(badgeK(0)), fill(rgb(PAL.white))])] }));

  // 9 · rain inside the badge (alpha matte → layer 8)
  layers.push(precompLayer({ ...B, ind: 9, nm: 'rain', refId: 'rainfall', w: 800, h: 640, tt: 1, tp: 8, st: T.rain, ip: T.rain, op: 6.75,
    ks: { a: [400, 0], p: [30, 92] } }));

  // 10 · the sun (alpha matte → layer 8): rises, slides behind the cloud, sets, returns for the rainbow
  layers.push(shapeLayer({ ...B, ind: 10, nm: 'sun', tt: 1, tp: 8,
    ks: {
      p: K([[0, [0, 520]], [T.sunUp, [0, 520]], [1.75, [0, -10], E.back], [2.45, [0, -10]], [3.05, [-120, -112], E.back], [3.65, [-120, -112]],
        [4.25, [-120, 480], E.backIn], [6.85, [-120, 480]], [7.6, [-150, -140], E.back]]),
      s: K([[0, [100, 100]], [2.45, [100, 100]], [3.05, [72, 72], E.back], [6.85, [72, 72]], [7.6, [68, 68]]]),
    },
    shapes: [
      group('shine', [ellipse([62, 38]), fill(rgb(PAL.white), 55)], { p: [-44, -52], r: -38 }),
      group('core', [ellipse([230, 230]), gfill({ t: 2, s: [-36, -44], e: [124, 0], n: 3, g: stops([[0, '#FFE680'], [0.55, PAL.sun], [1, PAL.sunDeep]]) })]),
      group('rays', [
        path(line(0, -142, 0, -198)),
        trim(0, K([[0, 0], [1.15, 0], [1.6, 100, E.out], [3.7, 100], [4.0, 0, E.in], [7.3, 0], [7.8, 100, E.out]])),
        stroke(rgb(PAL.sun), 24),
        repeater({ c: 12, r: K([[0, 0], [1.2, 0], [2.0, 30, E.back]]) }),
      ], { r: K([[0, 0], [10, 150, E.lin]]), s: K([[0, [100, 100]], [1.6, [100, 100]], [1.82, [114, 114], E.out], [2.25, [100, 100], E.soft]]) }),
      group('glow', [ellipse([350, 350]), fill(rgb(PAL.white), 22)]),
    ] }));

  // 11 · sky: gradient whose stops are keyframed (clear → rain → storm → clear) behind a rising liquid mask
  const sky = (a, b, c) => stops([[0, a], [0.5, b], [1, c]]);
  const CLEAR = sky('#9BE0FF', '#5BBDF8', '#3196EA'), RAIN = sky('#8FA5C4', '#6A84AA', '#4E6890'), STORM = sky('#5E6C8F', '#465478', '#323E63');
  const wave = (yT, sl) => {
    const xs = [-420, -210, 0, 210, 420], h = 70;
    const v = [...xs.map((x) => [x, yT]), [420, 440], [-420, 440]];
    const o = [...xs.map((x, k) => (k === 4 ? [0, 0] : [h, +(h * sl * (k % 2 ? -1 : 1)).toFixed(2)])), [0, 0], [0, 0]];
    const i = [...xs.map((x, k) => (k === 0 ? [0, 0] : [-h, +(-h * sl * (k % 2 ? -1 : 1)).toFixed(2)])), [0, 0], [0, 0]];
    return { c: true, v, i, o };
  };
  const liquid = K([[0, wave(420, 0.5)], [0.22, wave(420, 0.5)], [0.55, wave(160, -0.65), E.soft], [0.88, wave(-110, 0.5), E.soft], [1.18, wave(-320, -0.3), E.soft], [1.5, wave(-440, 0), E.out]]);
  layers.push(shapeLayer({ ...B, ind: 11, nm: 'sky', masks: [mask(liquid, 'liquid fill')],
    shapes: [group('sky', [path(badgeK(0)), gfill({ t: 1, s: [0, -360], e: [0, 360], n: 3,
      g: K([[0, CLEAR], [3.55, CLEAR], [4.05, RAIN], [5.36, RAIN], [5.44, STORM, E.lin], [6.4, STORM], [7.0, CLEAR]]) })])] }));

  // 12, 13 · the empty badge and its flat shadow
  const fadeIn = K([[0, 0], [T.ring, 0], [0.4, 100]]);
  layers.push(shapeLayer({ ...B, ind: 12, nm: 'badge base', ks: { o: fadeIn }, shapes: [group('base', [path(badgeK(0)), fill(rgb('#E3F3FF'))])] }));
  layers.push(shapeLayer({ ...B, ind: 13, nm: 'badge shadow', ks: { o: fadeIn }, shapes: [group('shadow', [path(badgeK(16)), fill(rgb(PAL.creamShadow))], { p: [0, 28] })] }));

  // 14–17 · the icon set (precomps) pops in under the badge
  ['tile_sun', 'tile_cloud', 'tile_rain', 'tile_bolt'].forEach((id, n) => {
    const t0 = 8.32 + n * 0.12;
    layers.push(precompLayer({ ind: 14 + n, nm: id, refId: id, w: 220, h: 220, ip: t0,
      ks: { a: [110, 110], p: [162 + n * 252, 1185], s: K([[0, [0, 0]], [t0, [0, 0]], [t0 + 0.5, [100, 100], E.backBig]]),
        r: K([[0, -14], [t0, -14], [t0 + 0.55, 0, E.back]]) } }));
  });

  // 18, 19 · background puffs drifting (precomp reuse), 20 · friendly geometric decor
  layers.push(precompLayer({ ind: 18, nm: 'bg puff A', refId: 'puff', w: 600, h: 360, ks: { a: [300, 200], p: K([[0, [150, 420]], [10, [330, 404], E.lin]]), s: [30, 30] } }));
  layers.push(precompLayer({ ind: 19, nm: 'bg puff B', refId: 'puff', w: 600, h: 360, ks: { a: [300, 200], p: K([[0, [962, 300]], [10, [790, 312], E.lin]]), s: [22, 22] } }));
  const deco = [[96, 640, 'plus', PAL.sun], [984, 600, 'dot', PAL.coral], [60, 960, 'dot', PAL.sky], [1020, 900, 'plus', PAL.coral], [112, 1532, 'plus', PAL.sky], [968, 1540, 'dot', PAL.sun]];
  layers.push(shapeLayer({ ind: 20, nm: 'decor', shapes: deco.map(([x, y, kind, c], n) => group(`deco ${n}`,
    kind === 'plus' ? [rect([12, 40], 6), rect([40, 12], 6), fill(rgb(c))] : [ellipse([26, 26]), fill(rgb(c))], {
      p: [x, y], r: kind === 'plus' ? K([[0, 0], [10, 90 * (n % 2 ? 1 : -1), E.lin]]) : 0,
      s: K([[0, [0, 0]], [0.5 + n * 0.07, [0, 0]], [0.9 + n * 0.07, [100, 100], E.backBig]]) })) }));

  // 21, 22 · rolling hills at the bottom (the caption sits on them); two phases breathe slowly
  const hill = (y, a, ph) => {
    const xs = [-40, 250, 540, 830, 1120], h = 95;
    const v = [...xs.map((x, k) => [x, y + a * Math.sin(ph + k * 1.7)]), [1120, 1960], [-40, 1960]];
    const o = [...xs.map((x, k) => (k === 4 ? [0, 0] : [h, +(a * 0.6 * Math.cos(ph + k * 1.7)).toFixed(2)])), [0, 0], [0, 0]];
    const i = [...xs.map((x, k) => (k === 0 ? [0, 0] : [-h, +(-a * 0.6 * Math.cos(ph + k * 1.7)).toFixed(2)])), [0, 0], [0, 0]];
    return { c: true, v: v.map(([p, q]) => [p, +q.toFixed(2)]), i, o };
  };
  const breathe = (y, a, p0, p1) => K([[0, hill(y, a, p0)], [5, hill(y, a, p1), E.soft], [10, hill(y, a, p0), E.soft]]);
  layers.push(shapeLayer({ ind: 21, nm: 'hill front', shapes: [group('front', [path(breathe(1618, 16, 0.3, 1.1)), fill(rgb(PAL.navy))])] }));
  layers.push(shapeLayer({ ind: 22, nm: 'hill back', shapes: [group('back', [path(breathe(1584, 20, 2.2, 1.4)), fill(rgb(PAL.navy2))])] }));
  layers.push(shapeLayer({ ind: 23, nm: 'cream', shapes: [group('bg', [rect([W + 40, H + 40]), fill(rgb(PAL.cream))], { p: [W / 2, H / 2] })] }));

  // 100 · badge null: pops in, rises and shrinks into the hero icon at the end; 101 · shake null (thunder) under it
  layers.push(nullLayer({ ind: 100, nm: 'BADGE',
    ks: { p: K([[0, [BADGE.x, BADGE.y]], [T.final, [BADGE.x, BADGE.y]], [8.7, [BADGE.x, BADGE.endY], E.back]]),
      s: K([[0, [72, 72]], [0.62, [100, 100], E.back], [T.final, [100, 100]], [8.7, [BADGE.endScale, BADGE.endScale], E.back]]) } }));
  const jolt = [[5.45, [-16, 9]], [5.5, [14, -10]], [5.55, [-12, 6]], [5.61, [10, -4]], [5.68, [-6, 3]], [5.76, [3, -1]], [5.86, [0, 0]]];
  layers.push(nullLayer({ ind: 101, nm: 'SHAKE', parent: 100,
    ks: { p: K([[0, [0, 0]], [5.4, [0, 0]], ...jolt.map(([t, v]) => [t, v, E.soft])]),
      r: K([[0, 0], [5.4, 0], [5.46, -2.2, E.soft], [5.53, 1.8, E.soft], [5.6, -1.2, E.soft], [5.7, 0.6, E.soft], [5.86, 0, E.soft]]) } }));

  return animation({ w: W, h: H, seconds: D, nm: '코드로 쓴 로티', layers,
    assets: [dropAsset(), rainfallAsset(), puffAsset(), ...tileAssets()] });
}

/** the weather word shown in the pill, by time */
export const STATES = [[1.35, '맑음'], [2.85, '구름 조금'], [4.0, '비'], [5.42, '천둥번개'], [7.15, '무지개']];
/** temperature (°C) keys for the header odometer */
export const TEMP = [[0, 26], [2.4, 26], [3.1, 23], [3.6, 23], [4.2, 18], [5.3, 18], [5.6, 15], [6.5, 15], [7.3, 20], [8.6, 21]];
