/*
 * 68 · 모양의 여행 — a flat, mid-century vector story in one SVG, driven by one paused GSAP timeline.
 *
 * One closed path (#shape, 16 cubic anchors) is the traveller: seed → sprout → leaf → bird → cloud → raindrop → seed.
 * Every shape is authored with the same anchor count and the same winding (clockwise on screen), and anchor 0 placed
 * on purpose, so MorphSVGPlugin can map anchor i → anchor i (shapeIndex 0) — or, for the raindrop → seed step whose
 * numbering starts a quarter turn apart, shapeIndex 12. Steps where the figure turns (leaf → bird, bird → cloud,
 * cloud → drop) use type:'rotational', which interpolates each anchor's angle and radius around the shape centre,
 * so the outline swings round instead of collapsing through itself.
 * The bird flaps by morphing a separate wing path (up → mid → down → mid → up) in a repeating nested timeline,
 * while MotionPathPlugin (autoRotate) carries a plain JS state object along a looping flight path.
 * DrawSVGPlugin draws the line-art: stem, roots, leaf veins, wind, the dotted flight trail (through a mask), rain, splash.
 * Background hills, sun and sky shift colour with CSS `fill` tweens; trees and the cloud get secondary motion.
 *
 * Determinism: the timeline is built paused and frame(t) only calls tl.time(t), then copies the tweened plain-object
 * state (traveller position/rotation/scale, wing scale, ray rotation, breeze) into SVG transform attributes.
 * No library randomness: specks and pebbles come from rand(seed); CustomWiggle uses its non-random types only.
 */
import { defineDemo, rand } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { MorphSVGPlugin } from '../node_modules/gsap/MorphSVGPlugin.js';
import { DrawSVGPlugin } from '../node_modules/gsap/DrawSVGPlugin.js';
import { MotionPathPlugin } from '../node_modules/gsap/MotionPathPlugin.js';
import { CustomEase } from '../node_modules/gsap/CustomEase.js';
import { CustomWiggle } from '../node_modules/gsap/CustomWiggle.js';

gsap.registerPlugin(MorphSVGPlugin, DrawSVGPlugin, MotionPathPlugin, CustomEase, CustomWiggle);

const NS = 'http://www.w3.org/2000/svg';
const D = 10;
const GROUND = 1430;                       // top of the soil (grass line)
const SEED_AT = [540, 1508];               // the seed rests here at t = 0 and t = D
const STEM = 'M540,1508C536,1420 552,1340 546,1262C540,1190 548,1150 556,1110';
const SPROUT_F = 0.42;                     // how far up the stem the sprout gets (fraction of its length)
const FLY_FROM = [360, 820];               // where the detached leaf has drifted to when it is a bird
const CLOUD_AT = [540, 430];               // the cloud settles over the sun
const SUN = [540, 360];
const FONT = '"Gowun Batang"';
const WORDS = ['씨앗', '새싹', '잎', '새', '구름', '비'];
// stage start times (also drive the caption row)
const ST = { sprout: 0.8, leaf: 1.7, bird: 3.3, cloud: 6.0, drop: 7.27, seed: 8.47 };

// ---------------------------------------------------------------- palette (limited, mid-century)
const C = {
  ink: '#23304a', cream: '#fbf3e4', mustard: '#f2b33d', coral: '#ec6b4b', pink: '#f4a99a', teal: '#2c8c86', tealDeep: '#1f625e',
  seed: '#b9773f', seedShade: '#87502a', seedLine: '#e2b07a',
  sprout: '#8cc265', sproutShade: '#5e9a47',
  leaf: '#4f9e5e', leafShade: '#2f7344', vein: '#b9df98',
  bird: '#ec6b4b', birdShade: '#c0472f',
  cloud: '#fdf8ee', cloudShade: '#d8d0c0',
  rain: '#d3dde3', rainShade: '#9fb3c1',
  drop: '#4a9ad6', dropShade: '#2d6ea3',
  grass: '#4c9a5a', soilTop: '#6d4532', soilBot: '#38241b', root: '#ecd2aa',
};
// background moods: dawn (start/end), day (plant + bird), rain
const MOOD = {
  dawn: { sky: '#f6e5cb', burst: '#f0d6b2', halo: '#f6c29c', sun: '#ee7c55', ring: '#f19a72', far: '#a9cdb8', mid: '#78b380', near: '#3f8b5c' },
  day:  { sky: '#f8eedb', burst: '#f2e1bf', halo: '#f8d793', sun: '#f2b33d', ring: '#f5c766', far: '#a1cbb2', mid: '#6cae78', near: '#3a8a58' },
  rain: { sky: '#dfe4e0', burst: '#d4dbd8', halo: '#e3e3d9', sun: '#dad5c4', ring: '#d6d3c6', far: '#a9b9bb', mid: '#83a19c', near: '#587d74' },
};

// ---------------------------------------------------------------- shapes
const f1 = (v) => Math.round(v * 10) / 10;
/**
 * Closed Catmull-Rom spline → cubic Bézier path through anchors [x, y, k?]. k scales both handles of that anchor
 * (1 = smooth, 0 = sharp corner). Every shape below has 16 anchors and runs clockwise on screen.
 */
function loop(pts) {
  const n = pts.length, P = (i) => pts[((i % n) + n) % n];
  const hd = (i) => { const a = P(i - 1), b = P(i + 1), k = P(i)[2] ?? 1; return [(b[0] - a[0]) / 6 * k, (b[1] - a[1]) / 6 * k]; };
  let d = `M${f1(P(0)[0])},${f1(P(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const p = P(i), q = P(i + 1), hp = hd(i), hq = hd(i + 1);
    d += `C${f1(p[0] + hp[0])},${f1(p[1] + hp[1])} ${f1(q[0] - hq[0])},${f1(q[1] - hq[1])} ${f1(q[0])},${f1(q[1])}`;
  }
  return d + 'Z';
}
function bounds(pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
const moveBy = (pts, dx, dy) => pts.map(([x, y, k]) => [x + dx, y + dy, k]);
function centred(pts) { const b = bounds(pts); return { pts: moveBy(pts, -(b.x0 + b.x1) / 2, -(b.y0 + b.y1) / 2), off: [-(b.x0 + b.x1) / 2, -(b.y0 + b.y1) / 2] }; }

// seed: an almond, round below and pointed above; anchor 0 at the bottom (90°), then clockwise in 22.5° steps
const SEED = centred(Array.from({ length: 16 }, (_, i) => {
  const th = (90 + 22.5 * i) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
  if (i === 8) return [0, -74, 0];
  const top = Math.max(0, -s);
  return [46 * c * (1 - 0.34 * Math.pow(top, 1.25)), s > 0 ? 58 * s : 66 * s];
})).pts;
// sprout: two cotyledons; origin = where it sits on the stem; anchor 0 at that base, anchor 8 in the notch
const SPROUT = [
  [0, 0, 0.4], [-34, -10], [-80, -30], [-116, -60], [-132, -94], [-114, -120], [-72, -114], [-32, -84],
  [0, -54, 0.15], [32, -84], [72, -114], [114, -120], [132, -94], [116, -60], [80, -30], [34, -10],
];
// leaf: origin = its base on the stem; anchor 8 = the tip. Sprout anchors grow straight into these (linear morph)
const LEAF = [
  [0, 0, 0.35], [-24, -30], [-72, -72], [-108, -124], [-122, -186], [-112, -250], [-84, -314], [-44, -374],
  [0, -432, 0], [46, -370], [88, -304], [116, -236], [120, -170], [102, -110], [66, -60], [22, -26],
];
// bird (facing +x): anchor 0 = tail tip, 4 = crown, 8 = face, 12 = belly. Against the leaf that is the same
// anchor order turned a quarter clockwise — the rotational morph swings the leaf tip round into the head.
const BIRD_RAW = [
  [-170, -58, 0], [-118, -40, 0.6], [-80, -62], [-32, -82], [18, -90], [62, -82], [96, -60], [114, -28],
  [118, 4], [104, 38], [72, 66], [26, 82], [-26, 78], [-76, 54], [-120, 14, 0.7], [-166, -30, 0],
];
const BIRD = centred(BIRD_RAW);
// cloud: anchor 0 upper left (~181°), so bird anchor i and cloud anchor i sit at similar angles (≈20° apart)
const CLOUD = centred([
  [-225, -55], [-170, -110], [-110, -88, 0.25], [-90, -150], [-20, -176], [55, -145], [80, -100, 0.25],
  [140, -130], [205, -95], [245, -20], [232, 50, 0.8], [150, 72], [0, 74], [-150, 72], [-228, 58, 0.8], [-242, 15],
]).pts;
// raindrop: anchor 0 at the left (180°), 4 = the tip; the seed's numbering starts a quarter turn later (bottom),
// so raindrop → seed uses shapeIndex 12 (seed anchor k ← drop anchor k + 12)
const DROP = centred([
  [-60, 20], [-58, -10], [-46, -44], [-21, -82], [0, -114, 0], [21, -82], [46, -44], [58, -10],
  [60, 20], [55.4, 43], [42.4, 62.4], [23, 75.4], [0, 80], [-23, 75.4], [-42.4, 62.4], [-55.4, 43],
]).pts;
const SEED_BOTTOM = bounds(SEED).y1, CLOUD_BOTTOM = bounds(CLOUD).y1, DROP_BOTTOM = bounds(DROP).y1;
const SHAPE = { seed: loop(SEED), sprout: loop(SPROUT), leaf: loop(LEAF), bird: loop(BIRD.pts), cloud: loop(CLOUD), drop: loop(DROP) };

// wing (in the raw bird frame): 8 anchors each, root fixed, tip swinging up → back → down
const WING = {
  up:   loop([[24, -36, 0.5], [22, -100], [2, -160], [-34, -202, 0], [-44, -160, 0.3], [-56, -120, 0.3], [-66, -78, 0.4], [-62, -30, 0.5]]),
  mid:  loop([[24, -36, 0.5], [-8, -74], [-70, -94], [-172, -98, 0], [-140, -74, 0.3], [-112, -58, 0.3], [-88, -44, 0.4], [-62, -30, 0.5]]),
  down: loop([[24, -36, 0.5], [20, 14], [2, 68], [-34, 116, 0], [-48, 78, 0.3], [-60, 40, 0.3], [-70, 4, 0.4], [-62, -30, 0.5]]),
};
const WING_ROOT = [-20, -33];
const BEAK_ROOT = [110, -8];

// bird flight: waypoints → one smooth cubic path (MotionPathPlugin's own curviness fit), shared by the motion and the trail
const FLIGHT_PTS = [FLY_FROM, [500, 800], [650, 822], [772, 724], [792, 584], [704, 482], [592, 520], [572, 640],
  [652, 722], [790, 692], [848, 600], [820, 470]];

// ---------------------------------------------------------------- tiny DOM helpers
function h(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
/** set an attribute only when its text changes (unchanged SVG stays unpainted) */
function put(el, k, v) {
  const key = '_' + k;
  if (el[key] !== v) { el[key] = v; el.setAttribute(k, v); }
}
const r2 = (v) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------- scenery builders
function patterns(defs) {
  // halftone stipple for hills (ink dots on a 30° grid)
  const st = h('pattern', { id: 'stipple', width: 16, height: 16, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(30)' }, defs);
  h('circle', { cx: 4, cy: 4, r: 1.7, fill: C.ink }, st);
  h('circle', { cx: 12, cy: 12, r: 1.7, fill: C.ink }, st);
  // pale speckle for the soil
  const sd = h('pattern', { id: 'soilDots', width: 22, height: 22, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-20)' }, defs);
  h('circle', { cx: 5, cy: 6, r: 1.6, fill: '#f3dcc0' }, sd);
  h('circle', { cx: 16, cy: 17, r: 1.1, fill: '#f3dcc0' }, sd);
  // print grain laid over the traveller (moves with it: user space of the traveller group)
  const gr = h('pattern', { id: 'grain', width: 46, height: 46, patternUnits: 'userSpaceOnUse' }, defs);
  const rnd = rand(68);
  for (let i = 0; i < 26; i++) h('circle', { cx: f1(rnd() * 46), cy: f1(rnd() * 46), r: f1(0.6 + rnd() * 1.3), fill: C.ink, 'fill-opacity': f1(0.3 + rnd() * 0.5) }, gr);
  // soil gradient
  const lg = h('linearGradient', { id: 'soil', x1: 0, y1: GROUND, x2: 0, y2: 1920, gradientUnits: 'userSpaceOnUse' }, defs);
  h('stop', { offset: 0, 'stop-color': C.soilTop }, lg);
  h('stop', { offset: 1, 'stop-color': C.soilBot }, lg);
}

/** a soft rolling hill line, filled down to below the grass */
function hill(g, pts, cls, fillId) {
  let d = `M-20,${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += `C${pts[i][0]},${pts[i][1]} ${pts[i][2]},${pts[i][3]} ${pts[i][4]},${pts[i][5]}`;
  d += 'L1100,1460L-20,1460Z';
  const p = h('path', { d, class: cls }, g);
  h('path', { d, fill: `url(#${fillId})`, opacity: 0.13 }, g);
  return p;
}

function grassPath() {
  const rnd = rand(7);
  let d = `M-10,${GROUND + 18}L-10,${GROUND - 2}`;
  for (let x = -10; x < 1090; x += 14 + rnd() * 10) {
    const w = 10 + rnd() * 8, hgt = 8 + rnd() * 16;
    d += `L${f1(x + w * 0.5)},${f1(GROUND - 2 - hgt)}L${f1(x + w)},${GROUND - 2}`;
  }
  return d + `L1090,${GROUND - 2}L1090,${GROUND + 18}Z`;
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '68-gsap-morphsvg',
  title: '모양의 여행',
  tech: 'GSAP MorphSVG · DrawSVG · MotionPath',
  duration: D,
  background: MOOD.dawn.sky,

  async setup(api) {
    await fontReady(`400 40px ${FONT}`, WORDS.join(''));

    const svg = api.layer('svg', { z: 1 });
    const defs = h('defs', {}, svg);
    patterns(defs);

    // the morph targets live in <defs>; everything visible is a <use> of them (fill comes from the <use>)
    const shapeP = h('path', { id: 'shapeP', d: SHAPE.seed }, defs);
    const wingP = h('path', { id: 'wingP', d: WING.up }, defs);
    const ghostP = h('path', { id: 'ghostP', d: SHAPE.cloud }, defs);
    h('use', { href: '#shapeP' }, h('clipPath', { id: 'clipShape' }, defs));
    h('use', { href: '#ghostP' }, h('clipPath', { id: 'clipGhost' }, defs));

    // flight path: MotionPathPlugin fits a smooth Bézier through the waypoints; the same string feeds motion + trail
    const flightRaw = MotionPathPlugin.arrayToRawPath(FLIGHT_PTS.map(([x, y]) => ({ x, y })), { curviness: 1 });
    const FLIGHT = MotionPathPlugin.rawPathToString(flightRaw);
    MotionPathPlugin.cacheRawPathMeasurements(flightRaw);
    const A0 = MotionPathPlugin.getPositionOnPath(flightRaw, 0.0005, true).angle;       // heading at take-off
    const A1 = MotionPathPlugin.getPositionOnPath(flightRaw, 0.9995, true).angle;       // heading on arrival
    const LEVEL = Math.round(A1 / 360) * 360;                                            // nearest upright angle

    // ---------------- sky, sunburst, sun
    const sky = h('rect', { x: 0, y: 0, width: 1080, height: 1920 }, svg);
    const burst = h('g', { opacity: 0.6 }, svg);
    for (let i = 0; i < 16; i++) {
      const a0 = (i * 22.5) * Math.PI / 180, a1 = (i * 22.5 + 11.25) * Math.PI / 180, R = 2200;
      h('path', { d: `M${SUN[0]},${SUN[1]}L${f1(SUN[0] + R * Math.cos(a0))},${f1(SUN[1] + R * Math.sin(a0))}L${f1(SUN[0] + R * Math.cos(a1))},${f1(SUN[1] + R * Math.sin(a1))}Z` }, burst);
    }
    const halo = h('circle', { cx: SUN[0], cy: SUN[1], r: 182 }, svg);
    const ring = h('circle', { cx: SUN[0], cy: SUN[1], r: 146, fill: 'none', 'stroke-width': 5, 'stroke-dasharray': '2 13', 'stroke-linecap': 'round' }, svg);
    const sun = h('circle', { cx: SUN[0], cy: SUN[1], r: 118 }, svg);

    // ---------------- hills with lollipop trees
    const hills = h('g', {}, svg);
    const far = hill(hills, [[0, 1300], [120, 1240, 260, 1230, 380, 1262], [500, 1294, 600, 1250, 720, 1228], [840, 1206, 960, 1236, 1100, 1270]], 'far', 'stipple');
    const trees = [];
    const treeDefs = [[150, 1312, C.tealDeep], [236, 1300, C.mustard], [872, 1304, C.ink], [958, 1306, C.tealDeep]];
    const mid = hill(hills, [[0, 1340], [100, 1300, 220, 1286, 340, 1310], [470, 1336, 580, 1352, 700, 1326], [820, 1300, 950, 1296, 1100, 1330]], 'mid', 'stipple');
    for (const [bx, by, col] of treeDefs) {   // trees stand on the mid hill, behind the near one
      const g = h('g', {}, hills);
      h('path', { d: `M${bx},${by}L${bx},${by - 52}`, stroke: C.ink, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
      h('ellipse', { cx: bx, cy: by - 78, rx: 27, ry: 40, fill: col }, g);
      h('ellipse', { cx: bx - 8, cy: by - 90, rx: 9, ry: 15, fill: C.cream, opacity: 0.22 }, g);
      trees.push({ g, bx, by });
    }
    const near = hill(hills, [[0, 1392], [140, 1366, 300, 1360, 430, 1380], [560, 1400, 660, 1400, 780, 1382], [900, 1364, 1010, 1368, 1100, 1388]], 'near', 'stipple');
    const hillEls = { far, mid, near };

    // ---------------- soil cross-section (dark ground also carries the harness caption)
    const soil = h('g', {}, svg);
    h('rect', { x: 0, y: GROUND, width: 1080, height: 1920 - GROUND, fill: 'url(#soil)' }, soil);
    h('rect', { x: 0, y: GROUND, width: 1080, height: 1920 - GROUND, fill: 'url(#soilDots)', opacity: 0.09 }, soil);
    for (const [y, a] of [[1590, 14], [1712, 10], [1830, 12]]) {
      h('path', { d: `M-10,${y}C200,${y - a} 380,${y + a} 560,${y}C740,${y - a} 900,${y + a} 1090,${y - 4}`, fill: 'none', stroke: '#7e5641', 'stroke-width': 3, opacity: 0.55 }, soil);
    }
    const prnd = rand(311);
    for (let i = 0; i < 18; i++) {
      let x, y;
      do { x = 40 + prnd() * 1000; y = GROUND + 50 + prnd() * 300; } while (Math.abs(x - 540) < 130 && y < 1680);
      h('ellipse', { cx: f1(x), cy: f1(y), rx: f1(6 + prnd() * 12), ry: f1(4 + prnd() * 7), fill: prnd() < 0.5 ? '#8a6650' : '#4e3226', transform: `rotate(${f1(prnd() * 40 - 20)} ${f1(x)} ${f1(y)})` }, soil);
    }
    h('ellipse', { cx: SEED_AT[0], cy: SEED_AT[1] + 4, rx: 70, ry: 84, fill: '#4a2e22', opacity: 0.75 }, soil);   // the seed's pocket
    const roots = [
      'M540,1528C536,1562 520,1592 498,1614C484,1628 478,1642 470,1654',
      'M542,1528C548,1566 566,1588 590,1600C606,1608 614,1622 620,1638',
      'M540,1530C540,1572 544,1612 538,1652',
      'M538,1542C524,1556 506,1562 490,1574',
      'M544,1546C560,1556 574,1570 578,1588',
    ].map((d, i) => h('path', { d, fill: 'none', stroke: C.root, 'stroke-width': i < 3 ? 5 : 3.5, 'stroke-linecap': 'round', opacity: 0.85 }, soil));

    // ---------------- line art layers
    // dotted flight trail, revealed through a DrawSVG'd mask stroke (DrawSVG owns the dash array, so the dots live on another path)
    const mask = h('mask', { id: 'trailMask', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1080, height: 1920 }, defs);
    const trailMask = h('path', { d: FLIGHT, fill: 'none', stroke: '#fff', 'stroke-width': 34, 'stroke-linecap': 'round' }, mask);
    const trail = h('path', { d: FLIGHT, fill: 'none', stroke: C.ink, 'stroke-width': 6, 'stroke-dasharray': '0.1 17', 'stroke-linecap': 'round', mask: 'url(#trailMask)', opacity: 0.55 }, svg);
    const winds = [
      'M1010,900C900,880 800,930 700,905C620,885 600,842 640,826C670,815 692,845 666,862',
      'M1050,1010C930,994 840,1034 720,1012C640,998 560,1022 470,992',
      'M990,786C900,768 820,800 740,780C690,768 662,742 690,724C716,708 740,734 720,752',
    ].map((d) => h('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.75 }, svg));
    const stem = h('path', { d: STEM, fill: 'none', stroke: C.leafShade, 'stroke-width': 13, 'stroke-linecap': 'round' }, svg);

    // rain streaks under the cloud (butt caps: a zero-length dash leaves no dot)
    const rrnd = rand(902);
    const rain = Array.from({ length: 16 }, (_, i) => {
      const x = 320 + (i + rrnd() * 0.8) * (440 / 16), y0 = 505 + rrnd() * 30;
      return h('path', { d: `M${f1(x)},${f1(y0)}L${f1(x - 46)},${GROUND - 6}`, fill: 'none', stroke: C.dropShade, 'stroke-width': 4, opacity: 0.7 }, svg);
    });

    // ghost cloud: stays behind when the traveller condenses into a drop
    const ghost = h('g', { transform: `translate(${CLOUD_AT[0]} ${CLOUD_AT[1]})`, opacity: 0 }, svg);
    h('use', { href: '#ghostP', fill: C.rainShade }, ghost);
    h('use', { href: '#ghostP', fill: C.rain, transform: 'translate(-9 -11)' }, h('g', { 'clip-path': 'url(#clipGhost)' }, ghost));
    h('use', { href: '#ghostP', fill: 'url(#grain)', opacity: 0.16 }, ghost);

    // ---------------- the traveller
    const trav = h('g', {}, svg);
    const birdFrame = (parent) => h('g', { transform: `translate(${f1(BIRD.off[0])} ${f1(BIRD.off[1])})` }, parent);
    const wingFar = h('g', {}, birdFrame(trav));
    h('use', { href: '#wingP', fill: C.tealDeep, transform: 'translate(-30 -6) scale(0.86)' }, wingFar);
    const useShade = h('use', { href: '#shapeP' }, trav);
    const clipG = h('g', { 'clip-path': 'url(#clipShape)' }, trav);
    const useMain = h('use', { href: '#shapeP', transform: 'translate(-9 -11)' }, clipG);
    const belly = h('ellipse', { cx: 34, cy: 58, rx: 100, ry: 46, fill: C.cream, opacity: 0 }, birdFrame(clipG));
    const seedLine = h('path', { d: 'M3,50C11,18 9,-24 0,-62', fill: 'none', stroke: C.seedLine, 'stroke-width': 4.5, 'stroke-linecap': 'round', opacity: 0.9 }, clipG);
    const veins = h('g', { fill: 'none', stroke: C.vein, 'stroke-linecap': 'round' }, clipG);
    const midrib = h('path', { d: 'M0,-6C-3,-120 -4,-260 2,-404', 'stroke-width': 6 }, veins);
    const sideVeins = [];
    for (const [y, w, side] of [[-80, 83, -1], [-98, 88, 1], [-154, 94, -1], [-172, 94, 1], [-228, 81, -1], [-246, 81, 1], [-302, 55, -1], [-320, 51, 1]]) {
      sideVeins.push(h('path', { d: `M${side},${y}C${22 * side},${y - 18} ${50 * side},${y - 32} ${w * side},${y - 44}`, 'stroke-width': 3.5 }, veins));
    }
    h('use', { href: '#shapeP', fill: 'url(#grain)', opacity: 0.16 }, trav);
    const front = birdFrame(trav);
    const wingNear = h('g', {}, front);
    h('use', { href: '#wingP', fill: C.teal }, wingNear);
    const beak = h('path', { d: 'M110,-28C128,-22 146,-14 162,-6C146,0 128,6 110,12Z', fill: C.mustard }, front);
    const face = h('g', { opacity: 0 }, front);
    h('circle', { cx: 90, cy: -2, r: 13, fill: C.pink, opacity: 0.8 }, face);
    h('circle', { cx: 76, cy: -40, r: 10.5, fill: C.ink }, face);
    h('circle', { cx: 79.5, cy: -43.5, r: 3.6, fill: C.cream }, face);

    // grass in front: the stem and the sinking drop pass behind its blades
    h('path', { d: grassPath(), fill: C.grass }, svg);

    // splash: crown strokes, a ring, droplets
    const splash = h('g', { fill: 'none', stroke: C.drop, 'stroke-linecap': 'round', 'stroke-width': 5 }, svg);
    const IMPACT = [540, GROUND + 2];
    const crown = [
      'M530,1428C510,1402 492,1384 468,1376', 'M535,1424C528,1394 520,1372 508,1352', 'M545,1424C552,1394 560,1372 572,1352',
      'M550,1428C570,1402 588,1384 612,1376', 'M524,1431C502,1424 480,1424 456,1430', 'M556,1431C578,1424 600,1424 624,1430',
    ].map((d) => h('path', { d }, splash));
    const ripple = h('ellipse', { cx: IMPACT[0], cy: IMPACT[1] + 2, rx: 10, ry: 2, 'stroke-width': 4, opacity: 0 }, splash);
    const drops = [[-1, 64, 90], [1, 70, 104], [-1, 120, 56], [1, 128, 50]].map(([s, dx, up]) => {
      const st = { x: IMPACT[0], y: IMPACT[1], r: 0 };
      return { st, el: h('circle', { cx: IMPACT[0], cy: IMPACT[1], r: 0, fill: C.drop, stroke: 'none' }, splash),
        path: `M${IMPACT[0]},${IMPACT[1] - 6}Q${IMPACT[0] + s * dx * 0.45},${IMPACT[1] - up * 1.6} ${IMPACT[0] + s * dx},${IMPACT[1] - 2}` };
    });

    // ---------------- caption row: the six stages
    const row = h('g', { 'font-family': FONT, 'font-size': 40, fill: C.ink, 'text-anchor': 'middle' }, svg);
    const ROW_Y = 176, GAP = 66;
    const words = WORDS.map((w) => h('text', { y: ROW_Y, 'letter-spacing': 2 }, row));
    words.forEach((el, i) => { el.textContent = WORDS[i]; });
    const widths = words.map((el) => el.getComputedTextLength());
    const total = widths.reduce((a, b) => a + b, 0) + GAP * (WORDS.length - 1);
    let x = 540 - total / 2;
    const wordX = widths.map((w) => { const c = x + w / 2; x += w + GAP; return c; });
    words.forEach((el, i) => el.setAttribute('x', f1(wordX[i])));
    for (let i = 0; i < WORDS.length - 1; i++) h('circle', { cx: f1((wordX[i] + widths[i] / 2 + wordX[i + 1] - widths[i + 1] / 2) / 2), cy: ROW_Y - 13, r: 3, fill: C.ink, opacity: 0.3 }, row);
    const marker = h('circle', { cx: f1(wordX[0]), cy: ROW_Y + 26, r: 6, fill: C.coral }, row);

    // ---------------- paper: specks + fibres in a pattern, on its own static layer above the scene
    const paper = api.layer('svg', { z: 2 });
    paper.style.pointerEvents = 'none';
    paper.style.willChange = 'transform';   // its own compositor layer: never repainted
    const pdefs = h('defs', {}, paper);
    const pp = h('pattern', { id: 'paper', width: 320, height: 320, patternUnits: 'userSpaceOnUse' }, pdefs);
    const srnd = rand(4242);
    for (let i = 0; i < 300; i++) h('circle', { cx: f1(srnd() * 320), cy: f1(srnd() * 320), r: f1(0.4 + srnd() * srnd() * 2.2), fill: srnd() < 0.8 ? '#4b3a28' : '#fffaf0', 'fill-opacity': f1(0.05 + srnd() * 0.13) }, pp);
    for (let i = 0; i < 34; i++) {
      const x0 = srnd() * 320, y0 = srnd() * 320, a = srnd() * Math.PI, l = 6 + srnd() * 16;
      h('path', { d: `M${f1(x0)},${f1(y0)}q${f1(Math.cos(a) * l * 0.5 + 3)},${f1(Math.sin(a) * l * 0.5 - 3)} ${f1(Math.cos(a) * l)},${f1(Math.sin(a) * l)}`, fill: 'none', stroke: '#5a4630', 'stroke-width': 0.8, 'stroke-opacity': 0.12 }, pp);
    }
    const vg = h('radialGradient', { id: 'vig', cx: 540, cy: 900, r: 1250, gradientUnits: 'userSpaceOnUse' }, pdefs);
    h('stop', { offset: 0.55, 'stop-color': '#5a4630', 'stop-opacity': 0 }, vg);
    h('stop', { offset: 1, 'stop-color': '#5a4630', 'stop-opacity': 0.16 }, vg);
    h('rect', { width: 1080, height: 1920, fill: 'url(#paper)' }, paper);
    h('rect', { width: 1080, height: 1920, fill: 'url(#vig)' }, paper);

    // ================================================================ state + initial values
    // plain objects tweened by GSAP and copied into transforms by frame() (origin of rotate/scale under our control)
    const T = { x: SEED_AT[0], y: SEED_AT[1], rotation: -18, sx: 1, sy: 1, ox: 0, oy: SEED_BOTTOM };
    const B = { wing: 0, beak: 0 };
    const S = { rays: 0, breeze: 0, gust: 0 };

    gsap.set([stem, ...roots, midrib, ...sideVeins, ...winds, ...rain, ...crown, trailMask], { drawSVG: '0% 0%' });
    gsap.set(useMain, { fill: C.seed });
    gsap.set(useShade, { fill: C.seedShade });
    gsap.set(sky, { fill: MOOD.dawn.sky });
    gsap.set(burst, { fill: MOOD.dawn.burst });
    gsap.set(halo, { fill: MOOD.dawn.halo });
    gsap.set(ring, { stroke: MOOD.dawn.ring });
    gsap.set(sun, { fill: MOOD.dawn.sun });
    for (const k in hillEls) gsap.set(hillEls[k], { fill: MOOD.dawn[k] });
    words.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0.3 }));

    // ================================================================ the timeline
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', lazy: false } });
    const WAKE = CustomWiggle.create('wake68', { wiggles: 4, type: 'easeInOut' });
    const SETTLE = CustomWiggle.create('settle68', { wiggles: 3, type: 'easeOut' });
    const GUST = CustomWiggle.create('gust68', { wiggles: 3, type: 'easeOut' });
    const BREEZE = CustomWiggle.create('breeze68', { wiggles: 5, type: 'uniform' });
    const tint = (main, shade, at, dur = 0.6) => {
      tl.to(useMain, { fill: main, duration: dur, ease: 'power1.inOut' }, at);
      tl.to(useShade, { fill: shade, duration: dur, ease: 'power1.inOut' }, at);
    };
    const mood = (m, at, dur) => {
      const M = MOOD[m], e = 'sine.inOut';
      tl.to(sky, { fill: M.sky, duration: dur, ease: e }, at);
      tl.to(burst, { fill: M.burst, duration: dur, ease: e }, at);
      tl.to(halo, { fill: M.halo, duration: dur, ease: e }, at);
      tl.to(ring, { stroke: M.ring, duration: dur, ease: e }, at);
      tl.to(sun, { fill: M.sun, duration: dur, ease: e }, at);
      for (const k in hillEls) tl.to(hillEls[k], { fill: M[k], duration: dur, ease: e }, at + 0.08 * ['far', 'mid', 'near'].indexOf(k));
    };
    /** a line that draws on, then runs off its far end (round caps: hide it once it has gone) */
    const sweep = (el, at, grow, go, len) => {
      tl.to(el, { drawSVG: `0% ${len}%`, duration: grow, ease: 'power1.in' }, at);
      tl.to(el, { drawSVG: '100% 100%', duration: go, ease: 'power2.out' }, at + grow);
      tl.set(el, { opacity: 0 }, at + grow + go);
    };
    const morph = (shape, at, dur, ease, extra = {}) =>
      tl.to(shapeP, { morphSVG: { shape, shapeIndex: 0, ...extra }, duration: dur, ease }, at);

    // ambient: sun rays turn one period (16-fold → 22.5°) per loop, trees breathe 5 times — both seamless at D
    tl.to(S, { rays: 22.5, duration: D, ease: 'none' }, 0);
    tl.to(S, { breeze: 1, duration: D, ease: BREEZE }, 0);
    mood('day', 0.9, 1.3);

    // 1 · seed wakes: wiggle, anticipation squash about its base
    tl.to(T, { rotation: -11, duration: 0.6, ease: WAKE }, 0.05);
    tl.to(T, { sx: 1.12, sy: 0.84, duration: 0.24, ease: 'power2.in' }, 0.56);

    // 2 · seed → sprout: linear morph with overshoot while it rides up the stem DrawSVG is drawing
    morph(SHAPE.sprout, ST.sprout, 0.9, 'back.out(1.5)');
    tl.to(T, { motionPath: { path: STEM, start: 0, end: SPROUT_F }, duration: 0.9, ease: 'power3.out' }, ST.sprout);
    tl.to(stem, { drawSVG: `0% ${SPROUT_F * 100}%`, duration: 0.9, ease: 'power3.out' }, ST.sprout);
    tl.to(T, { sx: 1, sy: 1, duration: 0.85, ease: 'elastic.out(1, 0.5)' }, ST.sprout);
    tl.to(T, { rotation: 0, duration: 0.6, ease: 'power2.out' }, ST.sprout);
    tl.to(seedLine, { opacity: 0, duration: 0.15, ease: 'none' }, ST.sprout);
    tint(C.sprout, C.sproutShade, ST.sprout, 0.6);
    roots.forEach((r, i) => tl.to(r, { drawSVG: '0% 100%', duration: 0.8, ease: 'power2.out' }, ST.sprout + 0.08 + i * 0.07));
    tl.set(T, { oy: 0 }, ST.leaf - 0.02);   // scale is back to 1 here, so moving the origin is invisible

    // 3 · sprout → leaf: the notch rises into the tip, the cotyledons widen into the blade
    morph(SHAPE.leaf, ST.leaf, 0.95, 'power2.inOut');
    tl.to(T, { motionPath: { path: STEM, start: SPROUT_F, end: 1 }, duration: 0.95, ease: 'power2.inOut' }, ST.leaf);
    tl.to(stem, { drawSVG: '0% 100%', duration: 0.95, ease: 'power2.inOut' }, ST.leaf);
    tint(C.leaf, C.leafShade, ST.leaf, 0.7);
    tl.to(midrib, { drawSVG: '0% 100%', duration: 0.45, ease: 'power2.out' }, 2.25);
    sideVeins.forEach((v, i) => tl.to(v, { drawSVG: '0% 100%', duration: 0.32, ease: 'power2.out' }, 2.4 + i * 0.05));
    // sway about the base (rotation pivot = local origin = the stem top)
    tl.to(T, { rotation: -6, duration: 0.32, ease: 'sine.inOut' }, 2.62);
    tl.to(T, { rotation: 5, duration: 0.34, ease: 'sine.inOut' }, 2.94);
    // wind gusts in from the right and the trees lean
    winds.forEach((w, i) => sweep(w, 2.95 + i * 0.09, 0.24, 0.44, 42));
    tl.to(S, { gust: 1, duration: 1.2, ease: GUST }, 2.95);

    // 4 · leaf → bird: blown up-left, swinging round (rotational morph), wing/beak/eye pop in
    tl.to(T, { x: FLY_FROM[0], y: FLY_FROM[1], duration: 0.75, ease: 'power2.inOut' }, ST.bird - 0.02);
    tl.to(T, { rotation: 16, duration: 0.22, ease: 'power2.out' }, ST.bird - 0.02);
    tl.to(T, { rotation: A0, duration: 0.5, ease: 'power2.inOut' }, ST.bird + 0.2);
    morph(SHAPE.bird, ST.bird, 0.72, 'power2.inOut', { type: 'rotational' });
    tl.to(veins, { opacity: 0, duration: 0.18, ease: 'none' }, ST.bird - 0.02);
    tint(C.bird, C.birdShade, ST.bird + 0.05, 0.55);
    tl.to(B, { wing: 1, duration: 0.36, ease: 'back.out(2.2)' }, 3.82);
    tl.to(B, { beak: 1, duration: 0.3, ease: 'back.out(2.5)' }, 3.86);
    tl.to([face, belly], { opacity: 1, duration: 0.2, ease: 'power1.out' }, 3.86);

    // 5 · flight: MotionPath with autoRotate on the plain state object; the trail mask draws in step
    const FLY_T = 4.05, FLY_D = 2.0;
    tl.to(T, { motionPath: { path: FLIGHT, autoRotate: true }, duration: FLY_D, ease: 'power1.inOut' }, FLY_T);
    tl.to(trailMask, { drawSVG: '0% 100%', duration: FLY_D, ease: 'power1.inOut' }, FLY_T);
    const flap = gsap.timeline({ repeat: 5, defaults: { lazy: false } });
    const wingTo = (shape, duration, ease) => flap.to(wingP, { morphSVG: { shape, shapeIndex: 0 }, duration, ease });
    wingTo(WING.mid, 0.07, 'sine.in'); wingTo(WING.down, 0.09, 'power2.out'); wingTo(WING.mid, 0.08, 'sine.in'); wingTo(WING.up, 0.08, 'sine.out');
    tl.add(flap, 3.98);
    // meanwhile the plant withdraws into the soil
    tl.to(stem, { drawSVG: '0% 0%', duration: 1.0, ease: 'power2.in' }, 4.3);
    roots.forEach((r, i) => tl.to(r, { drawSVG: '0% 0%', duration: 0.7, ease: 'power2.in' }, 4.55 + i * 0.06));

    // 6 · bird → cloud: wing folds away, the body puffs into a cloud (rotational: anchors keep their angles)
    tl.to(B, { wing: 0, duration: 0.22, ease: 'back.in(2)' }, ST.cloud - 0.08);
    tl.to(B, { beak: 0, duration: 0.18, ease: 'power2.in' }, ST.cloud - 0.08);
    tl.to([face, belly], { opacity: 0, duration: 0.15, ease: 'none' }, ST.cloud - 0.05);
    morph(SHAPE.cloud, ST.cloud, 0.7, 'power2.inOut', { type: 'rotational' });
    tl.to(T, { rotation: LEVEL, duration: 0.6, ease: 'power2.inOut' }, ST.cloud + 0.05);
    tint(C.cloud, C.cloudShade, ST.cloud, 0.6);
    tl.to(trail, { opacity: 0, duration: 0.6, ease: 'power1.in' }, ST.cloud + 0.1);
    tl.set(T, { oy: CLOUD_BOTTOM }, ST.cloud + 0.06);
    mood('rain', ST.cloud + 0.1, 1.1);
    // drift over the sun with squash & stretch about the cloud's flat bottom
    tl.to(T, { x: CLOUD_AT[0], y: CLOUD_AT[1], duration: 0.75, ease: 'power2.inOut' }, 6.5);
    tl.to(T, { sx: 1.1, sy: 0.9, duration: 0.16, ease: 'power2.out' }, 6.5);
    tl.to(T, { sx: 0.94, sy: 1.07, duration: 0.22, ease: 'sine.inOut' }, 6.66);
    tl.to(T, { sx: 1.03, sy: 0.97, duration: 0.18, ease: 'sine.inOut' }, 6.88);
    tl.to(T, { sx: 1, sy: 1, duration: 0.16, ease: 'sine.out' }, 7.06);
    tint(C.rain, C.rainShade, 6.6, 0.6);

    // 7 · cloud → raindrop: a ghost of the cloud stays (identical at this instant), the traveller condenses
    tl.set(ghost, { opacity: 1 }, ST.drop - 0.02);
    tl.set(T, { oy: DROP_BOTTOM }, ST.drop - 0.02);
    morph(SHAPE.drop, ST.drop, 0.55, 'power3.inOut', { type: 'rotational' });
    tl.to(T, { y: CLOUD_AT[1] + 105, duration: 0.55, ease: 'power2.inOut' }, ST.drop);
    tint(C.drop, C.dropShade, ST.drop, 0.45);
    rain.forEach((r, i) => {
      const rr = rand(500 + i), st = gsap.timeline({ repeat: 1, defaults: { lazy: false } });
      st.to(r, { drawSVG: '0% 8%', duration: 0.06, ease: 'none' })
        .to(r, { drawSVG: '92% 100%', duration: 0.36 + rr() * 0.1, ease: 'power1.in' })
        .to(r, { drawSVG: '100% 100%', duration: 0.04, ease: 'none' })
        .to(r, { drawSVG: '0% 0%', duration: 0.001 })
        .to({}, { duration: rr() * 0.12 });
      tl.add(st, 7.38 + rr() * 0.3);
    });
    // fall (stretching), impact (squash about its tip-to-ground point)
    const IMPACT_Y = GROUND + 4 - DROP_BOTTOM;
    tl.to(T, { y: IMPACT_Y, duration: 0.55, ease: 'power2.in' }, 7.85);
    tl.to(T, { sx: 0.86, sy: 1.22, duration: 0.55, ease: 'power1.in' }, 7.85);
    const HIT = 8.4;
    tl.to(T, { sx: 1.5, sy: 0.52, duration: 0.07, ease: 'power2.out' }, HIT);
    crown.forEach((c, i) => sweep(c, HIT + 0.01 * i, 0.1, 0.26, 70));
    tl.set(ripple, { opacity: 1 }, HIT);
    tl.to(ripple, { attr: { rx: 120, ry: 22 }, duration: 0.55, ease: 'power2.out' }, HIT);
    tl.to(ripple, { opacity: 0, duration: 0.45, ease: 'power1.in' }, HIT + 0.1);
    drops.forEach(({ st, path }, i) => {
      tl.set(st, { r: 7 - i * 0.8 }, HIT);
      tl.to(st, { motionPath: { path }, duration: 0.42 + i * 0.03, ease: 'none' }, HIT);
      tl.to(st, { r: 0, duration: 0.2, ease: 'power1.in' }, HIT + 0.24 + i * 0.03);
    });
    tl.to(ghost, { opacity: 0, duration: 0.9, ease: 'power1.in' }, 8.1);

    // 8 · raindrop → seed (shapeIndex 12) as it sinks back into its pocket; the palette returns to dawn
    tl.to(shapeP, { morphSVG: { shape: SHAPE.seed, shapeIndex: 12 }, duration: 0.7, ease: 'power2.out' }, ST.seed);
    tl.to(T, { y: SEED_AT[1], duration: 0.75, ease: 'power3.out' }, ST.seed);
    tl.to(T, { sx: 1, sy: 1, duration: 0.9, ease: 'elastic.out(1, 0.42)' }, ST.seed);
    tl.to(T, { rotation: LEVEL - 18, duration: 0.7, ease: 'power2.out' }, ST.seed);
    tint(C.seed, C.seedShade, ST.seed, 0.5);
    tl.to(seedLine, { opacity: 0.9, duration: 0.25, ease: 'none' }, ST.seed + 0.38);
    mood('dawn', 8.7, 1.0);
    tl.to(T, { rotation: LEVEL - 13, duration: 0.6, ease: SETTLE }, 9.3);

    // caption row follows the stages
    const stages = [0, ST.sprout, ST.leaf, ST.bird, ST.cloud, ST.drop, ST.seed];
    stages.forEach((at, s) => {
      if (!s) return;
      const k = s % WORDS.length, prev = (s - 1) % WORDS.length;
      tl.to(words[prev], { opacity: 0.3, duration: 0.3, ease: 'power1.out' }, at);
      tl.to(words[k], { opacity: 1, duration: 0.3, ease: 'power1.out' }, at);
      tl.to(marker, { attr: { cx: f1(wordX[k]) }, duration: 0.45, ease: 'back.out(2)' }, at);
    });
    tl.to({}, { duration: 0.001 }, D - 0.001);   // the timeline spans exactly D

    // pre-roll once: every tween initialises (records its start, parses its shapes) here in setup, in order
    tl.time(D);
    tl.time(0);

    Object.assign(this, { tl, T, B, S, trav, wingNear, wingFar, beak, burst, trees, drops });
  },

  frame(t) {
    this.tl.time(t);
    const { T, B, S } = this;
    put(this.trav, 'transform',
      `translate(${r2(T.x)} ${r2(T.y)}) rotate(${r2(T.rotation)}) translate(${r2(T.ox)} ${r2(T.oy)}) scale(${r2(T.sx * 1000) / 1000} ${r2(T.sy * 1000) / 1000}) translate(${r2(-T.ox)} ${r2(-T.oy)})`);
    const ws = Math.max(0.0001, B.wing), bs = Math.max(0.0001, B.beak);
    const wingXf = `translate(${WING_ROOT[0]} ${WING_ROOT[1]}) scale(${r2(ws * 100) / 100}) translate(${-WING_ROOT[0]} ${-WING_ROOT[1]})`;
    put(this.wingNear, 'transform', wingXf);
    put(this.wingFar, 'transform', wingXf);
    put(this.beak, 'transform', `translate(${BEAK_ROOT[0]} ${BEAK_ROOT[1]}) scale(${r2(bs * 100) / 100}) translate(${-BEAK_ROOT[0]} ${-BEAK_ROOT[1]})`);
    put(this.burst, 'transform', `rotate(${r2(S.rays)} ${SUN[0]} ${SUN[1]})`);
    this.trees.forEach(({ g, bx, by }, i) => put(g, 'transform', `rotate(${r2(2.2 * S.breeze + (i % 2 ? 9 : 7) * S.gust)} ${bx} ${by})`));
    for (const { st, el } of this.drops) { put(el, 'cx', r2(st.x)); put(el, 'cy', r2(st.y)); put(el, 'r', r2(st.r)); }
  },
});
