/*
 * 86 · 에… 에… 에취! — one face rig, three faces on a sofa on a sunny afternoon.
 *
 * A breeze lifts a seed off a dandelion clock on the windowsill and sets it on a child's nose. "에…" — the
 * anticipation builds, almost gives up, builds again, holds with a fine tremble — then "에취!": the release snaps,
 * the room jolts (punch, shake, flash, ring, a starburst), every dandelion clock bursts into seeds. Grandma,
 * who was leaning in and mimicking the face, is blasted back; the cat jumps with its fur up. The seed lands on
 * the cat — a tiny "츄!" — everyone laughs… and another seed drifts down onto the child's nose.
 *
 *  · rig.js     the shared face rig: 24 channels, eased keyframe blending, closed-form springs, hashed blinks
 *  · here       the three performances (acting curves), the room (baked layers + parallax), the impact kit
 * Everything is a pure function of t: keys and closed forms, baked tables built in setup, rand(seed) for scatter.
 */
import { defineDemo, rand, clamp, lerp, ramp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import {
  BASE, pose, mix, EZ, acting, tremble, pulse, blinkTimes, blinkAt, spring, kick, xform, toStage, featureY, drawHead, hash01,
} from './rig.js';

const W = 1080, H = 1920, MG = 80, TAU = Math.PI * 2;
const D = 10;
const INK = '#2b211b';
const SFX = `"${FONTS.doHyeon.family}"`;   // every sound word and bubble

// ================================================================== the story clock (seconds)
const T_BREEZE = 0.3;      // a breeze through the window lifts one seed off a dandelion clock
const T_LAND = 2.15;       // …and sets it on the child's nose
const A1E = 3.2;           // "에…" peaks
const HITCH = 3.5;         // it almost goes away
const A2E = 4.85;          // "에… 에…!" peaks; then the hold, trembling
const R = 5.86;            // "에취!" — the release (climax; the poster is R + 0.14 = 0.6·D)
const CAT_LAND = 6.95;     // the seed comes down on the cat's nose
const CHOO = 7.45;         // "츄!"
const LAUGH = 7.85, LAUGH_E = 8.85;
const LAND2 = 9.3;         // another seed on the child's nose — "에…?"
const BEATS = [[2.0, 2.45], [4.55, R + 0.55], [CAT_LAND - 0.1, CHOO + 0.25], [9.2, 10.6]];   // no idle blink lands here

const smooth01 = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const outC = ease.outCubic;
const env = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));

// ================================================================== the cast: one rig, three specs
const CHILD = {
  hip: [585, 1238], neckH: 150, R: 150, s: 1.5, headUp: 92,
  head: 'round', headRx: 100, headRy: 96, ears: 'round', hair: 'kid',
  eye: { style: 'white', x: 37, y: 6, rx: 17, ry: 21, pupil: 10.5 },
  brow: { x: 37, y: -31, len: 14, w: 8, arch: 4, lift: 10 },
  nose: { style: 'human', y: 30, w: 9, h: 7 },
  mouth: { style: 'human', y: 55, w: 19, h: 36, curve: 7 },
  cheek: { x: 60, y: 36, rx: 17, ry: 10 },
  pal: { ink: INK, skin: '#f8cda4', skinLit: '#ffe6cc', skinShade: '#e7a77d', hair: '#5b3624', hairLit: '#86593c', brow: '#4a2c1e',
    nose: '#efb089', iris: '#6b4630', blush: '#f2817a', mouth: '#7a2430', tongue: '#f0767c' },
  body: { shirt: '#ffcf4d', stripe: '#f4a93c', shorts: '#4d7fc8', shoe: '#e4523b', skin: '#f8cda4' },
};
const GRAN = {
  hip: [292, 1238], neckH: 236, R: 128, s: 1.28, headUp: 90,
  head: 'round', headRx: 96, headRy: 100, ears: 'round', hair: 'bun', glasses: true, wrinkles: true,
  eye: { style: 'dot', x: 36, y: 2, rx: 8, ry: 10, shutW: 13 },
  brow: { x: 36, y: -33, len: 15, w: 5.5, arch: 5, lift: 11 },
  nose: { style: 'human', y: 30, w: 13, h: 10 },
  mouth: { style: 'human', y: 60, w: 24, h: 32, curve: 7 },
  cheek: { x: 58, y: 38, rx: 19, ry: 11 },
  pal: { ink: INK, skin: '#f3c9a6', skinLit: '#ffe4d0', skinShade: '#dc9f80', hair: '#efeaf2', hairShade: '#c6bcd3', brow: '#9f96a8',
    nose: '#e8ab88', iris: INK, blush: '#f08d88', mouth: '#7a2430', tongue: '#f0767c', frame: '#7a4c2c', pin: '#ff8a5b', line: 'rgba(150,80,50,.6)' },
  body: { top: '#a68ad0', topShade: '#8d70bb', blouse: '#fff3dc', skirt: '#5f4470', legs: '#e9c7ab', shoe: '#4b2f3f', yarn: '#ff8fa3', yarnDark: '#e2667f', button: '#ffd36e', skin: '#f3c9a6' },
};
const CAT = {
  hip: [880, 1240], neckH: 92, R: 100, s: 1.0, headUp: 70,
  head: 'cat', headRx: 108, headRy: 86, ears: 'cat',
  eye: { style: 'iris', x: 40, y: 0, rx: 18, ry: 20 },
  brow: { x: 40, y: -30, len: 9, w: 6, arch: 2, lift: 9 },
  nose: { style: 'cat', y: 18, w: 8, h: 7 },
  mouth: { style: 'cat', y: 33, w: 15, h: 30, curve: 4 },
  cheek: { x: 66, y: 30, rx: 14, ry: 8 },
  pal: { ink: INK, skin: '#f4a65c', skinLit: '#ffcb8a', skinShade: '#d9843f', stripe: '#c86d2b', muzzle: '#fff4e4', earIn: '#ffb3a7', brow: '#c86d2b',
    nose: '#ff8fa0', iris: '#d6e05a', iris2: '#bccd3e', blush: '#ff9a8a', mouth: '#7a2430', tongue: '#ff8a9a' },
  body: { fur: '#f4a65c', furLit: '#ffc583', furShade: '#d9843f', stripe: '#c86d2b', bib: '#fff4e4' },
};
for (const C of [CHILD, GRAN, CAT]) C.lw = 6.5 / C.s;   // ink outline: 6.5 stage px for everyone

// ================================================================== the child's performance
const cREST = pose(BASE, { lidLo: 0.1, mCurve: 0.55, cheek: 0.2 });
const cWATCH = pose(cREST, { browUp: 0.3, mCurve: 0.2, mOpen: 0.07, mWide: -0.35, lid: 1.08 });
const cCUR = pose(cREST, { cross: 1, browUp: 0.5, browIn: -0.25, mOpen: 0.12, mWide: -0.55, mCurve: 0, pitch: 0.2, lid: 1.12 });
const cANT1 = pose(cCUR, { lid: 0.45, lidLo: 0.35, cross: 0.6, browUp: 0.85, browIn: -0.5, mOpen: 0.42, mWide: -0.1, mCurve: -0.15, nostril: 0.75, wrinkle: 0.45, pitch: -0.5, tilt: 4, squash: -0.35, cheek: 0.25 });
const cHITCH = mix(cANT1, cCUR, 0.6);
const cANT2 = pose(cANT1, { lid: 0.28, lidLo: 0.5, shape: 0.5, cross: 0.3, browUp: 1.1, browIn: -0.75, mOpen: 0.86, mWide: -0.12, mCurve: -0.3, nostril: 1, wrinkle: 0.9, pitch: -1, tilt: 8, squash: -0.75, lean: 3, cheek: 0.4 });
const cANT2b = pose(cANT2, { lid: 0.2, mOpen: 0.96, squash: -0.88, pitch: -1.15, tilt: 10, nostril: 1.15, browUp: 1.2 });
const cREL = pose(cANT2, { lid: 0, shape: 1, lidLo: 0, cross: 0, browUp: -0.7, browIn: 0.95, mOpen: 0.85, mWide: 0.45, mCurve: -0.3, teeth: 0.7, nostril: 0.6, wrinkle: 1, cheek: 1, pitch: 1.2, tilt: -8, squash: 0.95, lean: -3 });
const cREL2 = pose(cREL, { mOpen: 0.42, mWide: 0.4, teeth: 0.4, squash: 0.55, pitch: 0.85, tilt: -6, wrinkle: 0.8 });
const cDAZED = pose(cREST, { lid: 0.62, lidLo: 0.12, browUp: 0.35, browIn: -0.2, browTilt: 0.5, mOpen: 0.1, mWide: -0.35, mCurve: 0, nostril: 0.35, wrinkle: 0.15, pitch: 0.08, tilt: 3, cheek: 0.35 });
const cLOOKCAT = pose(cREST, { lookX: 1, lookY: 0.4, browUp: 0.45, mOpen: 0.08, mWide: -0.4, mCurve: 0.25, tilt: 5, lid: 1.05 });
const cSURP = pose(cLOOKCAT, { lid: 1.3, pupil: 0.8, browUp: 0.9, mOpen: 0.3, mWide: -0.6, mCurve: 0, squash: -0.25 });
const cLAUGH = pose(cREST, { lid: 0, shape: -1, lidLo: 0, mOpen: 0.62, mWide: 0.2, mCurve: 1, teeth: 0.7, cheek: 1, browUp: 0.45, browIn: -0.3, tilt: 4, pitch: -0.35 });
const cSMILE = pose(cREST, { lid: 0.85, lidLo: 0.35, mCurve: 0.9, mOpen: 0.12, cheek: 0.6, lookX: -0.3, lookY: -0.1 });
const cCUR2 = pose(cCUR, { lid: 1.22, browUp: 0.75, mOpen: 0.16 });
const cANT3 = pose(cANT1, { lid: 0.42, cross: 0.85, mOpen: 0.42, squash: -0.4, pitch: -0.55, browUp: 1.05, tilt: 5 });
const childKeys = acting([
  [0, cREST], [1.0, cREST], [1.8, cWATCH, EZ.io], [2.3, cCUR, EZ.out], [2.45, cCUR],
  [A1E, cANT1, EZ.io],                 // 에…
  [HITCH, cHITCH, EZ.io],              // …almost gone
  [A2E, cANT2, EZ.ioQ],                // 에… 에…!
  [R - 0.035, cANT2b, EZ.lin],         // the hold creeps on
  [R + 0.035, cREL, EZ.expo],          // 에취! — 70 ms
  [R + 0.38, cREL2, EZ.out],
  [R + 0.95, cDAZED, EZ.settle],       // settle with overshoot
  [7.05, cLOOKCAT, EZ.io], [CHOO + 0.06, cLOOKCAT, EZ.lin], [CHOO + 0.14, cSURP, EZ.expo],
  [LAUGH, cLAUGH, EZ.back], [LAUGH_E, cLAUGH], [9.1, cSMILE, EZ.io],
  [LAND2 + 0.12, cCUR2, EZ.out], [9.85, cANT3, EZ.io], [D, cANT3],
]);
const HITCHES = [2.62, 3.0, 3.72, 4.12, 4.5];   // inhale catches of "에… 에…"
function childBase(t) {
  const c = childKeys(t);
  c.squash += 0.018 * Math.sin(TAU * 0.32 * t);
  for (const h of HITCHES) { const p = pulse(t - h, 0.09); c.squash -= 0.08 * p; c.pitch -= 0.08 * p; c.nostril += 0.25 * p; }
  // the held tension: a fine tremble that grows until the release (and starts again at the very end)
  const e = ramp(t, 4.4, R - 0.05) * (t < R - 0.03 ? 1 : 0) + 0.6 * ramp(t, 9.7, 10);
  if (e > 0) {
    c.tilt += 1.6 * e * tremble(t, 1); c.squash += 0.03 * e * tremble(t, 2); c.mOpen += 0.05 * e * tremble(t, 3);
    c.browUp += 0.1 * e * tremble(t, 4); c.lid += 0.05 * e * tremble(t, 5); c.lean += 0.7 * e * tremble(t, 6); c.nostril += 0.1 * e * tremble(t, 7);
  }
  // chuckles
  const l = env(t, LAUGH - 0.1, LAUGH + 0.1, LAUGH_E - 0.25, LAUGH_E + 0.1), u = t - LAUGH;
  if (l > 0) { c.lift += 0.12 * l * Math.abs(Math.sin(TAU * 2.2 * u)); c.squash += 0.07 * l * Math.sin(TAU * 4.4 * u); c.mOpen += 0.1 * l * Math.sin(TAU * 4.4 * u + 1); }
  // the nose twitches again at the very end
  c.nostril += 0.35 * pulse(t - 9.55, 0.07) + 0.45 * pulse(t - 9.8, 0.07);
  return c;
}

// ================================================================== grandma's performance (she mimics the face she watches)
const gREST = pose(BASE, { lid: 0.82, lidLo: 0.3, mCurve: 0.7, cheek: 0.35, lookX: 0.55, lookY: 0.25, tilt: 4 });
const gNOTICE = pose(gREST, { lid: 1.0, lidLo: 0.1, browUp: 0.5, mCurve: 0.3, mOpen: 0.05, lookX: 0.85, lookY: 0.35, tilt: 6, lean: 3 });
const gMIM1 = pose(gNOTICE, { browUp: 0.8, browIn: -0.45, mOpen: 0.22, mWide: -0.45, mCurve: 0, lid: 0.85, pitch: -0.2, lean: 5 });
const gMIM2 = pose(gMIM1, { lid: 0.62, lidLo: 0.3, browUp: 1.05, browIn: -0.6, mOpen: 0.42, mWide: -0.3, mCurve: -0.1, nostril: 0.5, wrinkle: 0.35, pitch: -0.5, tilt: 9, lean: 6 });
const gMIM2b = pose(gMIM2, { lean: 7, mOpen: 0.48, tilt: 10 });
const gSTART = pose(gMIM2, { lid: 1.45, lidLo: 0, pupil: 0.7, browUp: 1.3, browIn: -0.2, mOpen: 0.55, mWide: -0.75, mCurve: -0.1, nostril: 0.2, wrinkle: 0, pitch: -0.3, tilt: -7, lean: -9, lift: 0.4, squash: -0.4 });
const gSTART2 = pose(gSTART, { lift: 0, squash: 0.12, lean: -6, tilt: -5, mOpen: 0.4 });
const gBEMUSED = pose(gREST, { lid: 0.92, lidLo: 0.2, browUp: 0.55, browTilt: 0.6, mOpen: 0.06, mCurve: 0.35, tilt: 1, lean: -2, lookX: 0.7, lookY: 0.3 });
const gLOOKCAT = pose(gBEMUSED, { lookX: 1, lookY: 0.55, browTilt: 0.2, tilt: 3 });
const gSURP = pose(gLOOKCAT, { lid: 1.2, browUp: 0.8, mOpen: 0.22, mWide: -0.6, mCurve: 0.1 });
const gLAUGH = pose(gREST, { lid: 0.05, shape: -1, lidLo: 0, mOpen: 0.55, mWide: 0.15, mCurve: 1, teeth: 0.35, cheek: 1, browUp: 0.35, browIn: -0.35, tilt: -3, lean: -3, pitch: -0.3 });
const gSMILE = pose(gREST, { lid: 0.7, lidLo: 0.4, mCurve: 0.9, cheek: 0.6 });
const gALERT = pose(gREST, { lid: 1.28, lidLo: 0, pupil: 0.8, browUp: 1.0, mOpen: 0.16, mWide: -0.6, mCurve: 0, lean: -4, tilt: -2, lookX: 0.9, lookY: 0.45 });
const gBRACE = pose(gALERT, { lid: 0, shape: 0.85, browUp: 0.2, browIn: 0.6, mOpen: 0, mWide: 0.35, mCurve: -0.45, cheek: 0.7, lean: -7, tilt: -8, squash: 0.25, pitch: 0.3 });
const granKeys = acting([
  [0, gREST], [2.0, gREST], [2.7, gNOTICE, EZ.io], [3.25, gMIM1, EZ.io], [3.6, mix(gMIM1, gNOTICE, 0.6), EZ.io],
  [4.9, gMIM2, EZ.ioQ], [R + 0.1, gMIM2b, EZ.lin],
  [R + 0.2, gSTART, EZ.expo], [R + 0.55, gSTART2, EZ.out], [R + 1.3, gBEMUSED, EZ.settle],
  [7.1, gLOOKCAT, EZ.io], [CHOO + 0.08, gLOOKCAT, EZ.lin], [CHOO + 0.2, gSURP, EZ.expo],
  [LAUGH, gLAUGH, EZ.back], [LAUGH_E + 0.05, gLAUGH], [9.15, gSMILE, EZ.io], [9.5, gALERT, EZ.out], [9.82, gBRACE, EZ.back],
]);
function granBase(t) {
  const c = granKeys(t);
  c.squash += 0.015 * Math.sin(TAU * 0.27 * t + 1);
  const e = ramp(t, 4.6, R - 0.05) * (t < R ? 1 : 0);
  if (e > 0) { c.tilt += 0.8 * e * tremble(t, 11); c.mOpen += 0.03 * e * tremble(t, 12); }
  const l = env(t, LAUGH - 0.1, LAUGH + 0.1, LAUGH_E - 0.2, LAUGH_E + 0.2), u = t - LAUGH;
  if (l > 0) { c.lift += 0.1 * l * Math.abs(Math.sin(TAU * 1.8 * u + 0.4)); c.squash += 0.06 * l * Math.sin(TAU * 3.6 * u + 0.8); c.mOpen += 0.1 * l * Math.sin(TAU * 3.6 * u + 1.8); c.lean += 2 * l * Math.sin(TAU * 1.8 * u); }
  return c;
}

// ================================================================== the cat's performance
const kDOZE = pose(BASE, { lid: 0, shape: -0.55, mCurve: 0.4, earBack: 0.1, pitch: 0.15, tilt: 4 });
const kAWAKE = pose(kDOZE, { lid: 0.62, lidLo: 0.15, shape: 0, earBack: -0.3, lookX: -0.9, lookY: 0.1, tilt: -4, pitch: 0, browUp: 0.2, mCurve: 0.25 });
const kWATCH = pose(kAWAKE, { lid: 1.08, lidLo: 0, pupil: 1.55, earBack: -0.55, lookX: -1, lookY: 0.2, tilt: -9, lean: -3, browUp: 0.45, mCurve: 0.05 });
const kSTART = pose(kWATCH, { lid: 1.5, pupil: 0.45, earBack: 1, fur: 1, mOpen: 0.5, mWide: 0.15, mCurve: -0.5, teeth: 0.9, browUp: 1, lift: 1.5, squash: -0.6, tilt: 6, lean: 4, lookX: -0.7 });
const kAIR = pose(kSTART, { lift: 1.15, squash: -0.25 });
const kLAND = pose(kSTART, { lift: 0, squash: 0.5, fur: 0.8, earBack: 0.85, mOpen: 0.3 });
const kRUFF = pose(kWATCH, { lid: 0.62, lidLo: 0.35, pupil: 0.9, earBack: 0.45, fur: 0.25, mCurve: -0.35, mOpen: 0, browIn: 0.6, browUp: 0, lookX: -0.95, lookY: 0.1, tilt: -4, lean: 0 });
const kCROSS = pose(kRUFF, { lid: 1.15, lidLo: 0, pupil: 1.3, cross: 1, lookX: 0, lookY: 0.5, earBack: -0.3, fur: 0, browUp: 0.6, browIn: -0.2, mCurve: 0, mOpen: 0.06 });
const kANT = pose(kCROSS, { lid: 0.32, cross: 0.5, nostril: 1, wrinkle: 0.8, pitch: -0.7, squash: -0.32, mOpen: 0.28, mWide: -0.2, browUp: 0.9, earBack: -0.2, tilt: -6 });
const kCHOO = pose(kANT, { lid: 0, shape: 1, cross: 0, nostril: 0.4, wrinkle: 1, pitch: 0.9, squash: 0.5, mOpen: 0.12, mWide: 0.4, earBack: 0.6, browIn: 0.6, browUp: -0.3, tilt: 4, lean: 3 });
const kCHOO2 = pose(kCHOO, { squash: 0.3, pitch: 0.6, mOpen: 0.05 });
const kSELF = pose(kWATCH, { lid: 1.15, pupil: 1.2, browUp: 0.6, earBack: -0.3, mCurve: 0.25, lookX: -0.5, lookY: 0, tilt: 3, lean: 0 });
const kPROUD = pose(kDOZE, { lid: 0.1, shape: -0.6, mCurve: 0.55, earBack: -0.1, tilt: -5, pitch: -0.2, lookX: -0.5 });
const kALERT = pose(kWATCH, { lid: 1.3, pupil: 1.65, earBack: -0.65, lookX: -1, lookY: 0.15, tilt: -8 });
const kBRACE = pose(kALERT, { lid: 0, shape: 0.8, earBack: 1, fur: 0.35, squash: 0.35, pitch: 0.4, tilt: 6, mCurve: -0.4, browIn: 0.6 });
const catKeys = acting([
  [0, kDOZE], [3.62, kDOZE], [3.95, kAWAKE, EZ.out], [4.9, kWATCH, EZ.io],
  [R + 0.06, kWATCH, EZ.lin], [R + 0.13, kSTART, EZ.expo], [R + 0.38, kAIR, EZ.out], [R + 0.6, kLAND, EZ.in], [R + 1.05, kRUFF, EZ.settle],
  [6.6, kRUFF], [CAT_LAND, kCROSS, EZ.out], [CHOO - 0.035, kANT, EZ.ioQ], [CHOO + 0.035, kCHOO, EZ.expo], [CHOO + 0.25, kCHOO2, EZ.out],
  [8.05, kSELF, EZ.settle], [8.45, kSELF], [8.95, kPROUD, EZ.io], [9.4, kPROUD], [9.58, kALERT, EZ.back], [9.88, kBRACE, EZ.back],
]);
function catBase(t) {
  const c = catKeys(t);
  const doze = 1 - ramp(t, 3.6, 3.9);
  c.squash += (0.035 * doze + 0.012) * Math.sin(TAU * 0.24 * t);
  const e = env(t, CAT_LAND + 0.1, CHOO - 0.15, CHOO - 0.03, CHOO);
  if (e > 0) { c.tilt += 1.2 * e * tremble(t, 21); c.squash += 0.025 * e * tremble(t, 22); }
  return c;
}

// entrance pops (scale about the hip), staggered
const popAt = (t, t0) => (t <= t0 ? 0 : t >= t0 + 0.5 ? 1 : ease.outBack(clamp((t - t0) / 0.5), 1.35));
const POP0 = { gran: 0.0, child: 0.1, cat: 0.22 };

// ================================================================== bodies (stage px, origin = hip, up = −y)
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function el(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }
function fi(ctx, fill, lw = 6) { ctx.fillStyle = fill; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); } }
function armStroke(ctx, pts, skin, sleeve) {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]);
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 36; ctx.stroke(); ctx.strokeStyle = sleeve; ctx.lineWidth = 24; ctx.stroke();
}

function bodyChild(ctx, C, c, S) {
  const B = C.body;
  ctx.lineJoin = 'round';
  for (const [i, side] of [[0, -1], [1, 1]]) {         // legs dangle over the seat edge and swing
    ctx.save();
    ctx.translate(side * 42, 22);
    ctx.rotate((S.legs[i] * Math.PI) / 180);
    rr(ctx, -16, -4, 32, 100, 14); fi(ctx, B.skin);
    rr(ctx, -17, 84, 34, 22, 7); fi(ctx, '#fffaf0');
    el(ctx, side * 7, 116, 29, 16); fi(ctx, B.shoe);
    el(ctx, side * 1, 110, 10, 4); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.moveTo(-92, -24); ctx.lineTo(92, -24); ctx.quadraticCurveTo(100, 14, 86, 36); ctx.lineTo(10, 36); ctx.lineTo(0, 22); ctx.lineTo(-10, 36); ctx.lineTo(-86, 36);
  ctx.quadraticCurveTo(-100, 14, -92, -24); ctx.closePath(); fi(ctx, B.shorts);
  rr(ctx, -20, -C.neckH - 14, 40, 44, 12); fi(ctx, B.skin);
  ctx.beginPath();
  ctx.moveTo(-94, 0); ctx.bezierCurveTo(-100, -70, -92, -124, -56, -136); ctx.quadraticCurveTo(0, -146, 56, -136); ctx.bezierCurveTo(92, -124, 100, -70, 94, 0); ctx.closePath();
  ctx.fillStyle = B.shirt; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = B.stripe;
  for (const y of [-112, -78, -44, -10]) ctx.fillRect(-120, y, 240, 14);
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-30, -139); ctx.quadraticCurveTo(0, -112, 30, -139); ctx.lineWidth = 5; ctx.stroke();
  for (const side of [-1, 1]) {
    armStroke(ctx, [side * 84, -112, side * 108, -58, side * 58, -16], B.skin, B.shirt);
    el(ctx, side * 56, -14, 21, 17); fi(ctx, B.skin);
  }
}

function bodyGran(ctx, C, c, S) {
  const B = C.body;
  ctx.lineJoin = 'round';
  for (const side of [-1, 1]) {
    rr(ctx, side * 38 - 15, 110, 30, 112, 12); fi(ctx, B.legs);
    el(ctx, side * 44, 226, 32, 15); fi(ctx, B.shoe);
  }
  ctx.beginPath(); ctx.moveTo(-112, -30); ctx.lineTo(112, -30); ctx.quadraticCurveTo(128, 60, 106, 140); ctx.quadraticCurveTo(0, 154, -106, 140); ctx.quadraticCurveTo(-128, 60, -112, -30); ctx.closePath();
  fi(ctx, B.skirt);
  ctx.beginPath(); ctx.moveTo(-40, 40); ctx.quadraticCurveTo(-48, 90, -58, 136); ctx.moveTo(40, 40); ctx.quadraticCurveTo(48, 90, 58, 136); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(43,33,27,.35)'; ctx.stroke();
  rr(ctx, -22, -C.neckH - 10, 44, 40, 12); fi(ctx, B.skin);
  ctx.beginPath(); ctx.moveTo(-118, 0); ctx.bezierCurveTo(-126, -100, -114, -196, -72, -212); ctx.quadraticCurveTo(0, -226, 72, -212); ctx.bezierCurveTo(114, -196, 126, -100, 118, 0); ctx.closePath();
  fi(ctx, B.top);
  ctx.beginPath(); ctx.moveTo(-38, -216); ctx.lineTo(0, -146); ctx.lineTo(38, -216); ctx.quadraticCurveTo(0, -226, -38, -216); ctx.closePath(); fi(ctx, B.blouse, 5);
  ctx.beginPath(); ctx.moveTo(0, -146); ctx.lineTo(0, -6); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  for (const y of [-120, -88]) { el(ctx, 0, y, 7, 7); fi(ctx, B.button, 3); }
  for (const side of [-1, 1]) armStroke(ctx, [side * 104, -184, side * 122, -96, side * 48, -48], B.skin, B.top);
  // the yarn ball in her lap, two needles through it
  el(ctx, 0, -40, 40, 36); fi(ctx, B.yarn);
  ctx.save(); el(ctx, 0, -40, 40, 36); ctx.clip();
  ctx.strokeStyle = B.yarnDark; ctx.lineWidth = 4;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(i * 12, -40, 14, 44, 0.5, 0, TAU); ctx.stroke(); }
  ctx.restore();
  el(ctx, 0, -40, 40, 36); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-58, -92); ctx.lineTo(30, -10); ctx.moveTo(58, -94); ctx.lineTo(-24, -6); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = '#ffe2a8'; ctx.stroke();
  for (const side of [-1, 1]) { el(ctx, side * 50, -50, 21, 17); fi(ctx, B.skin); }
}

function bodyCat(ctx, C, c, S, t) {
  const B = C.body;
  ctx.lineJoin = 'round';
  const g = ctx.createRadialGradient(-40, -100, 10, 0, -50, 150);
  g.addColorStop(0, B.furLit); g.addColorStop(0.6, B.fur); g.addColorStop(1, B.furShade);
  const loaf = () => { ctx.beginPath(); ctx.moveTo(-118, 0); ctx.bezierCurveTo(-128, -70, -82, -124, 0, -124); ctx.bezierCurveTo(82, -124, 128, -70, 118, 0); ctx.closePath(); };
  loaf(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = B.stripe; ctx.lineWidth = 12; ctx.lineCap = 'round';
  for (const x of [-92, 92]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x * (1.1 - i * 0.05), -96 + i * 30); ctx.quadraticCurveTo(x * 0.82, -84 + i * 30, x * 0.72, -64 + i * 30); ctx.stroke(); }
  el(ctx, 0, -38, 54, 48); ctx.fillStyle = B.bib; ctx.fill();
  ctx.restore();
  loaf(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  for (const side of [-1, 1]) {
    el(ctx, side * 32, -4, 25, 14); fi(ctx, B.bib);
    ctx.beginPath(); for (const k of [-7, 7]) { ctx.moveTo(side * 32 + k, -12); ctx.lineTo(side * 32 + k, -4); } ctx.lineWidth = 3; ctx.stroke();
  }
  // the tail wraps round to the front; its last segment sways (idle) and lags the body (spring), and puffs up
  const ang = ((S.tail + 9 * Math.sin(TAU * 0.45 * t)) * Math.PI) / 180, cs = Math.cos(ang), sn = Math.sin(ang);
  const rot = (x, y) => [118 + (x - 118) * cs - (y - 12) * sn, 12 + (x - 118) * sn + (y - 12) * cs];
  const c2 = rot(86, 18), e = rot(52, 6);
  const wdt = 20 * (1 + 0.7 * clamp(c.fur));
  ctx.beginPath(); ctx.moveTo(96, -36); ctx.bezierCurveTo(150, -46, 166, 8, 118, 12); ctx.quadraticCurveTo(c2[0], c2[1], e[0], e[1]);
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = wdt + 12; ctx.stroke(); ctx.strokeStyle = B.fur; ctx.lineWidth = wdt; ctx.stroke();
  ctx.save(); ctx.setLineDash([10, 16]); ctx.strokeStyle = B.stripe; ctx.lineWidth = wdt * 0.8; ctx.stroke(); ctx.restore();
}
CHILD.drawBody = bodyChild; GRAN.drawBody = bodyGran; CAT.drawBody = bodyCat;

// ================================================================== the room: geometry
const WIN = { x0: 86, y0: 172, x1: 464, y1: 590 };      // window panes
const SUN = [0.6, 1];                                    // light direction (down-right)
const JAR = [300, 600];                                  // the dandelion jar on the sill
const HEADS = [[276, 452, 30], [306, 428, 32], [334, 462, 28]];   // dandelion clocks: x, y, r
const FRAME = { x: 835, y: 206 };                        // picture-frame nail
const F = [585, 990];                                    // camera focus: the child's face

function beamPath(ctx, L) {
  const { x0, y0, x1, y1 } = WIN, [dx, dy] = SUN;
  ctx.beginPath();
  ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1 + dx * L, y0 + dy * L); ctx.lineTo(x1 + dx * L, y1 + dy * L); ctx.lineTo(x0 + dx * L, y1 + dy * L); ctx.lineTo(x0, y1);
  ctx.closePath();
}
/** 0..1: how deep a point sits inside the sunbeam (soft edges) */
function inBeam(x, y) {
  const { x0, y0, x1, y1 } = WIN, [dx, dy] = SUN;
  const sLo = Math.max((x - x1) / dx, (y - y1) / dy, 0), sHi = Math.min((x - x0) / dx, (y - y0) / dy, 1100);
  if (sHi <= sLo) return 0;
  return clamp((sHi - sLo) / 160) * (1 - clamp(sLo / 1100));
}

// ================================================================== baked layers
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, g: c.getContext('2d') }; }

function bakeFar() {
  const { c, g } = mk(W + 2 * MG, 900); g.translate(MG, MG);
  const sky = g.createLinearGradient(0, 120, 0, 640);
  sky.addColorStop(0, '#8fcbe6'); sky.addColorStop(0.65, '#cfe9ec'); sky.addColorStop(1, '#f1f0d8');
  g.fillStyle = sky; g.fillRect(-MG, -MG, W + 2 * MG, 900);
  const sun = g.createRadialGradient(120, 190, 0, 120, 190, 300);
  sun.addColorStop(0, 'rgba(255,250,225,1)'); sun.addColorStop(0.25, 'rgba(255,240,190,.75)'); sun.addColorStop(1, 'rgba(255,240,190,0)');
  g.fillStyle = sun; g.fillRect(-MG, -MG, W, 700);
  const r = rand(8601);
  g.fillStyle = 'rgba(255,255,255,.85)';
  for (const [cx, cy, s] of [[330, 250, 1], [180, 330, 0.7], [430, 360, 0.6]]) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx + (i - 2.5) * 22 * s, cy + (r() - 0.5) * 10 * s - (i % 2) * 12 * s, (18 + r() * 14) * s, 0, TAU); g.fill(); }
  for (const [y, col, n, rr0] of [[520, '#a9d39d', 9, 46], [575, '#86bf86', 11, 42], [618, '#6aa774', 12, 40]]) {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) { g.beginPath(); g.arc(40 + i * 52 + r() * 20, y + r() * 18, rr0 + r() * 18, 0, TAU); g.fill(); }
    g.fillRect(0, y + 10, 560, 300);
  }
  return c;
}

function bakeWall() {
  const { c, g } = mk(W + 2 * MG, 1400 + MG); g.translate(MG, MG);
  const wall = g.createLinearGradient(0, -MG, 0, 1330);
  wall.addColorStop(0, '#ecd2ac'); wall.addColorStop(0.45, '#f6e4c6'); wall.addColorStop(1, '#edcfa5');
  g.fillStyle = wall; g.fillRect(-MG, -MG, W + 2 * MG, 1400);
  for (let x = -MG + 8; x < W + MG; x += 60) { g.fillStyle = 'rgba(214,160,110,.12)'; g.fillRect(x, -MG, 24, 1400); }
  const r = rand(8602);
  for (let y = 30, row = 0; y < 1110; y += 62, row++) for (let x = 50 + (row % 2) * 30 - 60; x < W + 60; x += 60) {
    g.fillStyle = 'rgba(232,136,96,.18)';
    for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + 4 * Math.cos((k * TAU) / 4 + 0.4), y + 4 * Math.sin((k * TAU) / 4 + 0.4), 2.6, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(255,214,120,.35)'; g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill();
  }
  // a soft warm pool where the afternoon light reflects onto the wall
  const pool = g.createRadialGradient(700, 700, 0, 700, 700, 560);
  pool.addColorStop(0, 'rgba(255,236,190,.55)'); pool.addColorStop(1, 'rgba(255,236,190,0)');
  g.fillStyle = pool; g.fillRect(-MG, -MG, W + 2 * MG, 1400);
  // wainscot + chair rail
  g.fillStyle = '#e0b487'; g.fillRect(-MG, 1110, W + 2 * MG, 300);
  for (let x = -40; x < W + 60; x += 90) { g.fillStyle = 'rgba(150,90,50,.18)'; g.fillRect(x, 1124, 5, 280); }
  rr(g, -MG, 1096, W + 2 * MG, 22, 6); fi(g, '#f3d3a8', 5);
  // window: frame, sill and the panes cut through to the far layer
  rr(g, 64, 150, 422, 462, 14); fi(g, '#fff4e3', 7);
  g.globalCompositeOperation = 'destination-out';
  g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
  g.globalCompositeOperation = 'source-over';
  // a faint glass sheen
  g.save(); g.beginPath(); g.rect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0); g.clip();
  g.fillStyle = 'rgba(255,255,255,.16)';
  for (const [x, w] of [[120, 60], [210, 24], [330, 70]]) { g.beginPath(); g.moveTo(x, 170); g.lineTo(x + w, 170); g.lineTo(x + w - 260, 600); g.lineTo(x - 260, 600); g.fill(); }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 7; g.strokeRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
  rr(g, 268, WIN.y0, 14, WIN.y1 - WIN.y0, 3); fi(g, '#fff4e3', 5);
  rr(g, WIN.x0, 374, WIN.x1 - WIN.x0, 14, 3); fi(g, '#fff4e3', 5);
  rr(g, 40, 596, 470, 30, 8); fi(g, '#fff1dc', 7);
  g.fillStyle = 'rgba(120,70,40,.18)'; g.fillRect(50, 626, 450, 14);
  // curtain rod
  rr(g, 14, 116, 530, 14, 7); fi(g, '#9a5b34', 5);
  for (const x of [14, 544]) { el(g, x, 123, 13, 13); fi(g, '#c27b45', 5); }
  // a small cactus on the sill
  rr(g, 108, 548, 64, 50, 8); fi(g, '#e0774e', 6);
  rr(g, 100, 540, 80, 18, 6); fi(g, '#ec8b60', 6);
  g.beginPath(); g.moveTo(124, 540); g.bezierCurveTo(118, 470, 160, 470, 156, 540); g.closePath(); fi(g, '#6fb07c', 6);
  g.beginPath(); g.moveTo(152, 508); g.quadraticCurveTo(176, 506, 174, 482); g.lineWidth = 16; g.strokeStyle = INK; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#6fb07c'; g.stroke();
  el(g, 141, 468, 7, 6); fi(g, '#ff9fb5', 4);
  // the jar on the sill (the dandelion clocks are drawn live: they lose their seeds)
  g.save(); g.translate(JAR[0], JAR[1]);
  rr(g, -32, -78, 64, 78, 14); g.fillStyle = 'rgba(206,236,240,.75)'; g.fill();
  g.fillStyle = 'rgba(150,205,215,.55)'; g.fillRect(-29, -40, 58, 37);
  rr(g, -32, -78, 64, 78, 14); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.7)'; rr(g, -22, -68, 9, 52, 5); g.fill();
  g.restore();
  // floor seam (hidden behind the sofa, keeps the parallax edge tidy)
  g.fillStyle = '#c98b5b'; g.fillRect(-MG, 1310, W + 2 * MG, 200);
  return c;
}

function bakeSofa() {
  const { c, g } = mk(W + 2 * MG, H + 2 * MG); g.translate(MG, MG);
  g.lineJoin = 'round';
  // floor: warm planks, a rug, the sofa's shadow
  const fl = g.createLinearGradient(0, 1290, 0, H + MG);
  fl.addColorStop(0, '#c98b5b'); fl.addColorStop(1, '#8f5534');
  g.fillStyle = fl; g.fillRect(-MG, 1290, W + 2 * MG, H - 1290 + MG);
  const r = rand(8603);
  g.strokeStyle = 'rgba(90,45,20,.22)'; g.lineWidth = 3;
  for (let y = 1320, k = 0; y < H + MG; y += 40 + k * 4, k++) {
    g.beginPath(); g.moveTo(-MG, y); g.lineTo(W + MG, y); g.stroke();
    for (let x = -MG + r() * 300; x < W + MG; x += 260 + r() * 200) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40 + k * 4); g.stroke(); }
  }
  g.strokeStyle = 'rgba(255,225,190,.18)'; g.lineWidth = 4;
  for (let y = 1328; y < H; y += 44) { g.beginPath(); g.moveTo(-MG + r() * 200, y); g.lineTo(r() * 400 + 300, y); g.stroke(); }
  g.save(); g.translate(540, 1670); g.scale(1, 0.34);
  el(g, 0, 0, 600, 600); fi(g, '#d9704f', 8);
  el(g, 0, 0, 530, 530); g.lineWidth = 14; g.strokeStyle = '#f6d9b0'; g.setLineDash([26, 22]); g.stroke(); g.setLineDash([]);
  el(g, 0, 0, 420, 420); g.lineWidth = 8; g.strokeStyle = 'rgba(246,217,176,.6)'; g.stroke();
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; el(g, 330 * Math.cos(a), 330 * Math.sin(a), 18, 18); g.fillStyle = '#ffd36e'; g.fill(); }
  g.restore();
  g.save(); g.filter = 'blur(14px)'; g.fillStyle = 'rgba(70,30,15,.45)'; el(g, 540, 1462, 560, 34); g.fill(); g.restore();
  // the sofa: back, arms, seat, front, little legs
  const T = '#4f9c94', TD = '#3d8079', TL = '#6cb4a9';
  for (const x of [80, 1000]) { rr(g, x - 16, 1420, 32, 50, 8); fi(g, '#9a5b34', 6); }
  rr(g, 30, 860, 1020, 420, [110, 110, 30, 30]);
  const bk = g.createLinearGradient(0, 860, 0, 1280); bk.addColorStop(0, TL); bk.addColorStop(0.35, T); bk.addColorStop(1, TD);
  fi(g, bk, 8);
  for (const x of [380, 720]) { g.beginPath(); g.moveTo(x, 900); g.quadraticCurveTo(x + 6, 1060, x, 1220); g.lineWidth = 5; g.strokeStyle = 'rgba(30,70,66,.45)'; g.stroke(); }
  for (const [x, y] of [[210, 1010], [550, 1000], [890, 1010], [380, 1120], [720, 1120]]) { el(g, x, y, 6, 5); g.fillStyle = 'rgba(30,70,66,.5)'; g.fill(); }
  // a knitted throw over the right shoulder of the sofa
  g.save(); g.beginPath(); g.moveTo(760, 868); g.bezierCurveTo(860, 850, 990, 860, 1046, 900); g.lineTo(1050, 1090); g.bezierCurveTo(1010, 1110, 990, 1060, 960, 1080);
  g.bezierCurveTo(930, 1100, 900, 1040, 870, 1000); g.bezierCurveTo(830, 950, 790, 940, 760, 868); g.closePath();
  g.fillStyle = '#f6d9b0'; g.fill(); g.clip(); g.strokeStyle = '#e8875f'; g.lineWidth = 12;
  for (let x = 700; x < 1100; x += 44) { g.beginPath(); g.moveTo(x, 840); g.lineTo(x + 60, 1120); g.stroke(); }
  g.restore();
  g.beginPath(); g.moveTo(760, 868); g.bezierCurveTo(860, 850, 990, 860, 1046, 900); g.lineTo(1050, 1090); g.bezierCurveTo(1010, 1110, 990, 1060, 960, 1080);
  g.bezierCurveTo(930, 1100, 900, 1040, 870, 1000); g.bezierCurveTo(830, 950, 790, 940, 760, 868); g.closePath(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  // seat cushions (top face) and the front
  rr(g, 70, 1206, 940, 70, 26); fi(g, TL, 7);
  for (const x of [384, 722]) { g.beginPath(); g.moveTo(x, 1212); g.lineTo(x, 1270); g.lineWidth = 5; g.strokeStyle = 'rgba(30,70,66,.5)'; g.stroke(); }
  rr(g, 50, 1262, 980, 170, [20, 20, 40, 40]);
  const fr = g.createLinearGradient(0, 1262, 0, 1432); fr.addColorStop(0, T); fr.addColorStop(1, TD);
  fi(g, fr, 8);
  g.beginPath(); g.moveTo(84, 1300); g.lineTo(996, 1300); g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.18)'; g.stroke();
  for (const side of [0, 1]) {
    const x = side ? 958 : 0;
    rr(g, x - (side ? 0 : MG * 0) - 8, 990, 130, 450, [60, 60, 26, 26]);
    const ag = g.createLinearGradient(x, 990, x + 130, 1440); ag.addColorStop(0, TL); ag.addColorStop(1, TD);
    fi(g, ag, 8);
    el(g, x + 57, 1010, 50, 22); g.fillStyle = 'rgba(255,255,255,.15)'; g.fill();
  }
  return c;
}

function bakeFore() {
  const { c, g } = mk(W + 2 * MG, H + 2 * MG); g.translate(MG, MG);
  g.filter = 'blur(7px)';
  g.fillStyle = '#2f5d48';
  const leaf = (x, y, a, s) => {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(60, -40, 200, -60, 260, 0); g.bezierCurveTo(200, 70, 60, 50, 0, 0); g.fill();
    g.restore();
  };
  leaf(1110, 1560, -2.5, 1.25); leaf(1130, 1700, -2.9, 1.1); leaf(1100, 1440, -2.2, 0.9);
  g.fillStyle = '#3d7558'; leaf(1150, 1620, -2.7, 0.9);
  g.filter = 'blur(10px)';
  const r = rand(8604);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = `rgba(255,236,190,${0.12 + r() * 0.12})`;
    g.beginPath(); g.arc(r() * W, 60 + r() * 520, 20 + r() * 34, 0, TAU); g.fill();
  }
  return c;
}

function bakeVignette() {
  const { c, g } = mk(W, H);
  const v = g.createRadialGradient(560, 900, 380, 560, 980, 1250);
  v.addColorStop(0, 'rgba(60,25,10,0)'); v.addColorStop(1, 'rgba(60,25,10,.42)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  const b = g.createLinearGradient(0, 1560, 0, H);
  b.addColorStop(0, 'rgba(40,18,8,0)'); b.addColorStop(1, 'rgba(40,18,8,.55)');
  g.fillStyle = b; g.fillRect(0, 1560, W, H - 1560);
  return c;
}
function bakeTension() {
  const { c, g } = mk(W, H);
  const v = g.createRadialGradient(585, 960, 260, 585, 960, 1000);
  v.addColorStop(0, 'rgba(50,20,40,0)'); v.addColorStop(1, 'rgba(50,20,40,.55)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}
function bakeGrain() {
  const { c, g } = mk(540, 960);
  const img = g.createImageData(540, 960), r = rand(8605);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r() < 0.5 ? 0 : 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = Math.floor(r() * 20);
  }
  g.putImageData(img, 0, 0);
  return c;
}
function glowSprite(rgb) {
  const { c, g } = mk(64, 64);
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.35, `rgba(${rgb},.45)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return c;
}

// ================================================================== small drawing pieces
function drawSeed(ctx, x, y, s, rot, a, glow) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalAlpha *= a;
  if (glow) ctx.drawImage(glow, -24, -46, 48, 48);
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -16); ctx.strokeStyle = '#7d5a3c'; ctx.lineWidth = 1.8; ctx.stroke();
  el(ctx, 0, 3, 2, 4.5); ctx.fillStyle = '#7d5a3c'; ctx.fill();
  ctx.beginPath();
  for (let k = 0; k <= 10; k++) { const an = Math.PI * (1.08 + (0.84 * k) / 10); ctx.moveTo(0, -16); ctx.lineTo(14 * Math.cos(an), -16 + 14 * Math.sin(an)); }
  ctx.strokeStyle = 'rgba(110,70,40,.35)'; ctx.lineWidth = 2.8; ctx.stroke();
  ctx.strokeStyle = '#fffdf6'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#fffdf6';
  for (let k = 0; k <= 10; k++) { const an = Math.PI * (1.08 + (0.84 * k) / 10); ctx.beginPath(); ctx.arc(14.5 * Math.cos(an), -16 + 14.5 * Math.sin(an), 1.6, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function drawClock(ctx, x, y, r, full, glow) {
  ctx.save();
  ctx.translate(x, y);
  if (full > 0.05) {
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glow, -r * 1.6, -r * 1.6, r * 3.2, r * 3.2);
    ctx.globalAlpha = 1;
    const n = Math.round(10 + 34 * full);
    ctx.beginPath();
    for (let k = 0; k < n; k++) { const a = (k / n) * TAU + 0.3; const rr0 = r * (0.55 + 0.45 * full); ctx.moveTo(0, 0); ctx.lineTo(rr0 * Math.cos(a), rr0 * Math.sin(a)); }
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.6; ctx.stroke();
    el(ctx, 0, 0, r * (0.55 + 0.45 * full), r * (0.55 + 0.45 * full)); ctx.strokeStyle = 'rgba(110,80,60,.28)'; ctx.lineWidth = 2; ctx.stroke();
  }
  el(ctx, 0, 0, 6, 6); fi(ctx, '#b88a55', 3);
  ctx.restore();
}
function starburst(ctx, x, y, r0, r1, n, rot) {
  ctx.beginPath();
  for (let i = 0; i < 2 * n; i++) {
    const a = rot + (i / (2 * n)) * TAU, rr0 = i % 2 ? r0 : r1 * (1 + 0.12 * Math.sin(i * 2.7));
    const px = x + rr0 * Math.cos(a), py = y + rr0 * Math.sin(a);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}
/** an outlined comic word, glyph by glyph: each pops in (back), wobbles, and leaves upward */
function word(ctx, text, x, y, size, t, t0, tOut, { fill, sw = 14, rot = -5, stagger = 0.05, spread = 0.9, wob = 0 } = {}) {
  if (t < t0 || t > tOut + 0.6) return;
  ctx.save();
  ctx.font = `${size}px ${SFX}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const gl = Array.from(text);
  const ws = gl.map((g) => (g === '!' ? size * 0.3 : ctx.measureText(g).width * spread + size * 0.16));
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = x - total / 2;
  gl.forEach((g, i) => {
    const gx = cx + ws[i] / 2; cx += ws[i];
    const p = clamp((t - t0 - i * stagger) / 0.34);
    if (p <= 0) return;
    const q = clamp((t - tOut - i * 0.04) / 0.22);
    if (q >= 1) return;
    const s = ease.outBack(p, 1.9) * (1 - 0.3 * q);
    const a = (i % 2 ? 1 : -1) * 0.06 + (rot * Math.PI) / 180 + wob * Math.sin(TAU * 1.3 * t + i);
    ctx.save();
    ctx.translate(gx, y - 170 * q * q - 18 * Math.sin(Math.PI * p) * (1 - p));
    ctx.rotate(a); ctx.scale(s, s);
    ctx.globalAlpha = 1 - q;
    if (g === '!') {   // the font's "!" is thin: draw a fat wedge and dot in the same style
      const bang = () => {
        ctx.beginPath(); ctx.moveTo(-size * 0.13, -size * 0.42); ctx.lineTo(size * 0.13, -size * 0.42); ctx.lineTo(size * 0.06, size * 0.12); ctx.lineTo(-size * 0.06, size * 0.12); ctx.closePath();
        ctx.moveTo(size * 0.09, size * 0.3); ctx.arc(0, size * 0.3, size * 0.09, 0, TAU);
      };
      ctx.save(); ctx.translate(6, size * 0.07); bang(); ctx.fillStyle = 'rgba(43,33,27,.28)'; ctx.fill(); ctx.restore();
      bang(); ctx.lineWidth = sw; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = fill; ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(43,33,27,.28)'; ctx.fillText(g, 6, size * 0.07);
      ctx.lineWidth = sw; ctx.strokeStyle = INK; ctx.strokeText(g, 0, 0);
      ctx.fillStyle = fill; ctx.fillText(g, 0, 0);
    }
    ctx.restore();
  });
  ctx.restore();
}
/** a speech bubble sized to its text, with a wedge tail toward (tx, ty) */
function bubble(ctx, x, y, tx, ty, text, size, s, rot) {
  if (s <= 0.01) return;
  ctx.save();
  ctx.font = `${size}px ${SFX}`;
  const w = ctx.measureText(text).width + size * 1.1, h = size * 1.75;
  x = clamp(x, 40 + (w * s) / 2, W - 40 - (w * s) / 2);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineJoin = 'round';
  const a = Math.atan2(ty - y, tx - x);
  const ex = (w / 2) * Math.cos(a), ey = (h / 2) * Math.sin(a), nx = -Math.sin(a), ny = Math.cos(a);
  const path = () => {
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU);
    ctx.moveTo(ex * 0.8 + nx * 24, ey * 0.8 + ny * 24);
    ctx.lineTo(ex + 62 * Math.cos(a) + nx * 4, ey + 62 * Math.sin(a) + ny * 4);
    ctx.lineTo(ex * 0.8 - nx * 22, ey * 0.8 - ny * 22);
    ctx.closePath();
  };
  const fillBoth = () => {
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ex * 0.8 + nx * 24, ey * 0.8 + ny * 24); ctx.lineTo(ex + 62 * Math.cos(a) + nx * 4, ey + 62 * Math.sin(a) + ny * 4);
    ctx.lineTo(ex * 0.8 - nx * 22, ey * 0.8 - ny * 22); ctx.fill();
  };
  ctx.fillStyle = 'rgba(43,33,27,.22)'; ctx.save(); ctx.translate(6, 9); fillBoth(); ctx.restore();
  path(); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#fff8ea'; fillBoth();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = INK; ctx.fillText(text, 0, size * 0.04);
  ctx.restore();
}
/** surprise ticks above a head */
function ticks(ctx, x, y, t, t0, scale = 1) {
  const p = (t - t0) / 0.45;
  if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 7 * scale;
  const k = outC(clamp(p / 0.4)), fade = 1 - clamp((p - 0.6) / 0.4);
  ctx.globalAlpha = fade;
  for (const a of [-2.25, -1.57, -0.9]) {
    const r0 = 18 * scale + 30 * scale * k, r1 = r0 + 34 * scale * (1 - 0.5 * clamp((p - 0.5) / 0.5));
    ctx.beginPath(); ctx.moveTo(x + r0 * Math.cos(a), y + r0 * Math.sin(a)); ctx.lineTo(x + r1 * Math.cos(a), y + r1 * Math.sin(a)); ctx.stroke();
  }
  ctx.restore();
}

// ================================================================== the demo
defineDemo({
  id: '86-face-rig',
  title: '에… 에… 에취!',
  tech: '얼굴 리그 · 표정 채널 + 연기 곡선',
  duration: D,
  background: '#f3dfbf',

  async setup(api) {
    await fontReady(`120px ${SFX}`, '에…취!츄호히?');
    this.main = api.canvas({ z: 1, type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined }).ctx;
    this.far = bakeFar(); this.wall = bakeWall(); this.sofa = bakeSofa(); this.fore = bakeFore();
    this.vig = bakeVignette(); this.tens = bakeTension(); this.grain = bakeGrain();
    this.glowW = glowSprite('255,248,225'); this.glowY = glowSprite('255,214,120');

    // ---- performances: base (keys + additive acting) and the look-at layer on top
    const perf = { child: childBase, gran: granBase, cat: catBase };
    const cast = { child: CHILD, gran: GRAN, cat: CAT };
    const pop = (k, t) => popAt(t, POP0[k]);
    const X = (k, t, c = perf[k](t)) => xform(cast[k], c, pop(k, t));
    const nose = (k, t) => {
      const C = cast[k], c = perf[k](t);
      return toStage(C, X(k, t, c), C.nose.w * 0.35, featureY(c, C.nose.y - C.nose.h * 0.35));
    };
    this.perf = perf; this.cast = cast; this.pop = pop; this.X = X; this.nose = nose;

    // ---- the travelling seed: jar → child's nose → (sneeze) → cat's nose → (츄) → out of the window
    const h0 = HEADS[1], P0 = [h0[0] + 6, h0[1] - 26];
    const L1 = nose('child', T_LAND), L2 = nose('cat', CAT_LAND), L3 = nose('cat', CHOO);
    const bez = (p0, p1, p2, p3, u) => {
      const v = 1 - u;
      return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]];
    };
    const L0 = nose('child', R);
    this.seed = (t) => {
      if (t < T_BREEZE) return { p: P0, rot: 0.1, a: 1, s: 1.5, on: 'clock' };
      if (t < T_LAND) {
        const u = clamp((t - T_BREEZE) / (T_LAND - T_BREEZE)), e = ease.inOutCubic(u);
        const p = bez(P0, [480, 300], [760, 720], L1, e);
        const sway = Math.sin(Math.PI * u) * 26 * Math.sin(TAU * 0.8 * (t - T_BREEZE));
        return { p: [p[0] + sway, p[1]], rot: 0.35 * Math.sin(TAU * 0.8 * (t - T_BREEZE) + 1) * Math.sin(Math.PI * u) + 0.55 * smooth01((u - 0.7) / 0.3), a: 1, s: 1.5 - 0.25 * smooth01((u - 0.6) / 0.4) };
      }
      if (t < R) return { p: nose('child', t), rot: 0.55 + ((perf.child(t).tilt + perf.child(t).lean) * Math.PI) / 180, a: 1, s: 1.25, on: 'child' };
      if (t < CAT_LAND) {
        const u = clamp((t - R) / (CAT_LAND - R)), e = 1 - Math.pow(1 - u, 2.2);
        const p = bez(L0, [L0[0] + 60, L0[1] - 420], [L2[0] + 140, L2[1] - 420], L2, e);
        return { p, rot: 2.4 * (1 - e) + 0.3 * Math.sin(TAU * 1.1 * t), a: 1, s: 1.5 };
      }
      if (t < CHOO) return { p: nose('cat', t), rot: 0.5 + ((perf.cat(t).tilt + perf.cat(t).lean) * Math.PI) / 180, a: 1, s: 1.15, on: 'cat' };
      const u = clamp((t - CHOO) / 2.6), e = 1 - Math.pow(1 - u, 2.6);
      const p = bez(L3, [L3[0] + 40, L3[1] - 300], [520, 380], [250, 300], e);
      return { p: [p[0] + 20 * Math.sin(TAU * 0.6 * t) * u, p[1]], rot: 0.3 * Math.sin(TAU * 0.7 * t), a: 1 - clamp((u - 0.75) / 0.25), s: 1.4 - 0.4 * u };
    };
    // the last seed: from the floating cloud down onto the child's nose
    const Lz = nose('child', LAND2);
    this.seed2 = (t) => {
      if (t < 7.9) return null;
      if (t < LAND2) {
        const u = clamp((t - 7.9) / (LAND2 - 7.9)), e = ease.inOutCubic(u);
        const p = bez([420, 330], [300, 600], [760, 700], Lz, e);
        return { p: [p[0] + 22 * Math.sin(TAU * 0.7 * t) * Math.sin(Math.PI * u), p[1]], rot: 0.3 * Math.sin(TAU * 0.7 * t) * (1 - u), a: clamp((t - 7.9) / 0.4), s: 1.5 };
      }
      return { p: nose('child', t), rot: 0.55 + ((perf.child(t).tilt + perf.child(t).lean) * Math.PI) / 180, a: 1, s: 1.25 };
    };
    // the burst: every clock on the sill loses its seeds to the sneeze
    const rs = rand(8606);
    const at = L0;
    this.cloud = Array.from({ length: 40 }, (_, i) => {
      const hd = HEADS[i % 3], a0 = rs() * TAU;
      const o = [hd[0] + hd[2] * 0.8 * Math.cos(a0), hd[1] + hd[2] * 0.8 * Math.sin(a0)];
      let dx = o[0] - at[0], dy = o[1] - at[1]; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
      const sp = (rs() - 0.5) * 2.4, cs = Math.cos(sp), sn = Math.sin(sp);
      const v = 260 + rs() * 380;
      return {
        o, v: [(dx * cs - dy * sn) * v, (dx * sn + dy * cs) * v], k: 1.6 + rs(), wind: [90 + rs() * 120, 0 + rs() * 50],
        sw: 12 + rs() * 22, sf: 0.3 + rs() * 0.5, ph: rs() * TAU, s: 0.75 + rs() * 0.75, d: 0.15 + rs() * 0.25,
      };
    });
    // the sneeze itself: a fan of droplets (front spray: sideways and down) and comic action lines
    this.spray = Array.from({ length: 18 }, (_, i) => {
      const an = Math.PI * (-0.16 + (1.32 * (i + 0.6 * rs())) / 18);
      return { dx: Math.cos(an), dy: Math.sin(an), v: 1700 + rs() * 1200, r: 5 + rs() * 5, k: 4.5 + rs() * 1.5 };
    });
    this.lines = Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * TAU + rs() * 0.25, r0: 190 + rs() * 50, len: 60 + rs() * 80 }));
    this.motes = Array.from({ length: 80 }, () => ({ x: rs() * W, y: 140 + rs() * 1350, vx: 4 + rs() * 10, vy: -6 - rs() * 10, ph: rs() * TAU, s: 3 + rs() * 7, a: 0.4 + rs() * 0.6 }));

    // ---- a slow ambient clock: the room holds its breath during the hold (closed form, baked at 240 Hz)
    const N = Math.ceil(D * 240) + 2, slow = new Float64Array(N);
    for (let i = 1; i < N; i++) {
      const t = i / 240, w = env(t, 4.6, 5.1, R - 0.02, R + 0.02);
      slow[i] = slow[i - 1] + (1 - 0.75 * w) / 240;
    }
    this.tA = (t) => { const f = clamp(t * 240, 0, N - 2), i = Math.floor(f); return lerp(slow[i], slow[i + 1], f - i); };

    // ---- secondary motion: closed-form springs on drivers sampled from each head's motion
    const t0 = -1, h = 1 / 120, n = Math.ceil((D + 0.3 - t0) / h) + 2;
    const sample = (k) => {
      const C = cast[k], roll = new Float64Array(n), y = new Float64Array(n), x = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const t = t0 + i * h, c = perf[k](Math.max(0, t)), pp = pop(k, Math.max(0, t));
        roll[i] = c.tilt + c.lean;
        y[i] = (-c.lift * C.R * 0.4 + c.squash * C.R * 0.3) * pp + (1 - pp) * 120;
        x[i] = C.neckH * Math.sin((c.lean * Math.PI) / 180) + C.R * Math.sin(((c.tilt + c.lean) * Math.PI) / 180);
      }
      return { roll, y, x };
    };
    const comb = (a, b, kb) => a.map((v, i) => v + kb * b[i]);
    const sc = sample('child'), sg = sample('gran'), sk = sample('cat');
    const sp = (arr, f, z) => spring(arr, t0, h, f, z);
    this.springs = {
      child: { tuft: sp(comb(sc.roll, sc.x, 0.25), 2.6, 0.13), tuftY: sp(sc.y, 3.4, 0.18), cheek: sp(sc.y, 5.5, 0.24), ear: sp(sc.roll, 4.2, 0.2), legs: sp(sc.y, 2.2, 0.14) },
      gran: { bun: sp(comb(sg.roll, sg.x, 0.2), 2.3, 0.15), bunY: sp(sg.y, 3.0, 0.16), glassY: sp(sg.y, 5.5, 0.2), glassR: sp(sg.roll, 4.0, 0.2), cheek: sp(sg.y, 5.5, 0.24), ear: sp(sg.roll, 4.4, 0.22) },
      cat: { ear: sp(comb(sk.roll, sk.x, 0.3), 3.4, 0.17), earY: sp(sk.y, 4.0, 0.2), whisk: sp(sk.roll, 4.5, 0.2), whiskY: sp(sk.y, 5.0, 0.2), tail: sp(comb(sk.y, sk.x, 0.5), 1.8, 0.14), cheek: sp(sk.y, 5.5, 0.24) },
    };
    // ---- hashed idle blinks that never land on a big beat, plus a few acted ones
    this.blinks = {
      child: blinkTimes(861, D, BEATS).concat([R + 0.62, R + 0.84]),
      gran: blinkTimes(862, D, BEATS).concat([R + 0.72, R + 0.94]),
      cat: blinkTimes(863, D, BEATS).filter((b) => b > 4.0),
    };
    this.twitch = [1.35 + 0.5 * hash01(864, 1), 2.9 + 0.4 * hash01(864, 2)];
    this.charsC = document.createElement('canvas'); this.charsC.width = W; this.charsC.height = H;
    this.cx = this.charsC.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
  },

  frame(t) {
    const ctx = this.main, tA = this.tA(t);
    // ------------------------------------------------ camera: settle in, push toward the child, punch, pull back, snap zoom
    let z = 1 + 0.05 * (1 - ease.outExpo(clamp(t / 1.6)));
    z += 0.075 * ease.inOutCubic(clamp((t - 2.3) / (R - 2.3))) * (1 - ease.inOutCubic(clamp((t - R - 0.6) / 1.6)));
    const punch = (t0, a) => (t < t0 ? 0 : t < t0 + 0.06 ? a * outC((t - t0) / 0.06) : a * (1 - outC(clamp((t - t0 - 0.06) / 0.5))));
    z += punch(R, 0.05) + punch(CHOO, 0.016);
    z += 0.14 * ease.outExpo(clamp((t - (LAND2 + 0.12)) / 0.45));
    const shake = (t0, amp, dur, ph) => {
      const p = (t - t0) / dur;
      if (p <= 0 || p >= 1) return [0, 0];
      const e = (1 - p) * (1 - p);
      return [amp * e * Math.sin(TAU * 7 * p + ph), amp * 0.6 * e * Math.sin(TAU * 7.9 * p + ph * 2)];
    };
    const s1 = shake(R, 18, 0.6, 0.7), s2 = shake(CHOO, 6, 0.3, 2.1);
    const ox = s1[0] + s2[0] + 2.5 * Math.sin(t * 0.55), oy = s1[1] + s2[1] + 2 * Math.sin(t * 0.73 + 1);
    const cam = (k) => { const s = 1 + (z - 1) * k; ctx.setTransform(s, 0, 0, s, F[0] * (1 - s) + ox * k, F[1] * (1 - s) + oy * k); };

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#f3dfbf'; ctx.fillRect(0, 0, W, H);

    // ------------------------------------------------ far: the garden through the window
    cam(0.35);
    ctx.drawImage(this.far, -MG, -MG);
    // ------------------------------------------------ the wall (curtains and the picture frame react to the sneeze)
    cam(0.8);
    ctx.drawImage(this.wall, -MG, -MG);
    const gust = 14 * Math.sin(TAU * 0.3 * t) + kick(t, T_BREEZE - 0.1, 26, 0.7, 0.2) + kick(t, R, 70, 0.9, 0.16) + kick(t, CHOO, 10, 1.4, 0.2);
    for (const [x0, x1, inner] of [[22, 150, 1], [434, 546, -1]]) {
      ctx.beginPath();
      const sw = (y) => gust * Math.pow((y - 128) / 600, 1.6);
      ctx.moveTo(x0, 128); ctx.lineTo(x1, 128);
      for (let y = 128; y <= 728; y += 30) ctx.lineTo((inner > 0 ? x1 : x1) + sw(y) + 8 * Math.sin(y / 40 + t), y);
      for (let y = 728; y >= 128; y -= 30) ctx.lineTo(x0 + sw(y) * 0.6 + 6 * Math.sin(y / 50 + t * 0.8), y);
      ctx.closePath();
      ctx.fillStyle = '#ef8a63'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(190,80,50,.45)'; ctx.lineWidth = 10;
      for (let k = 1; k < 4; k++) {
        const fx = lerp(x0, x1, k / 4);
        ctx.beginPath(); ctx.moveTo(fx, 128); for (let y = 128; y <= 740; y += 40) ctx.lineTo(fx + sw(y) * (0.6 + 0.1 * k) + 5 * Math.sin(y / 45 + k), y); ctx.stroke();
      }
      ctx.restore();
    }
    // picture frame: knocked crooked by the sneeze (it stays a little crooked)
    const ft = ((3 * smooth01((t - R) / 0.5) + kick(t, R + 0.02, 12, 1.3, 0.12) + kick(t, CHOO, 2.5, 1.6, 0.2)) * Math.PI) / 180;
    ctx.save(); ctx.translate(FRAME.x, FRAME.y); ctx.rotate(ft);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-70, 40); ctx.moveTo(0, 0); ctx.lineTo(70, 40); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = 'rgba(80,40,20,.18)'; ctx.fillRect(-104, 46, 220, 176);
    rr(ctx, -110, 36, 220, 176, 10); fi(ctx, '#c98a52', 6);
    rr(ctx, -90, 56, 180, 136, 4); fi(ctx, '#fff6e6', 4);
    ctx.beginPath(); ctx.moveTo(-88, 190); ctx.quadraticCurveTo(-30, 120, 20, 160); ctx.quadraticCurveTo(60, 130, 88, 150); ctx.lineTo(88, 190); ctx.closePath(); ctx.fillStyle = '#8cc49a'; ctx.fill();
    el(ctx, 50, 92, 18, 18); ctx.fillStyle = '#ffcf4d'; ctx.fill();
    // a crayon cat, the child's drawing
    el(ctx, -32, 110, 24, 20); ctx.lineWidth = 4; ctx.strokeStyle = '#e8834a'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-52, 100); ctx.lineTo(-50, 80); ctx.lineTo(-40, 92); ctx.moveTo(-12, 100); ctx.lineTo(-14, 80); ctx.lineTo(-24, 92); ctx.stroke();
    ctx.restore();
    el(ctx, FRAME.x, FRAME.y, 5, 5); fi(ctx, '#9a5b34', 3);
    // the dandelion clocks: full until the sneeze, nearly bald after
    const bald = smooth01((t - R) / 0.25);
    HEADS.forEach(([x, y, r], i) => {
      const lean = 0.06 * Math.sin(TAU * 0.4 * tA + i) + (kick(t, R, 0.25, 1.6, 0.15) - 0.1 * bald) * (i - 1.3);
      const tip = [x + 300 * Math.sin(lean) * 0.12, y];
      ctx.beginPath(); ctx.moveTo(JAR[0] + (i - 1) * 8, JAR[1] - 40); ctx.quadraticCurveTo(JAR[0] + (i - 1) * 14, (y + JAR[1]) / 2, tip[0], tip[1]);
      ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#7fb36a'; ctx.stroke();
      const full = (i === 1 ? 0.9 : 1) * (1 - 0.85 * bald);
      drawClock(ctx, tip[0], tip[1], r, full, this.glowW);
    });

    // ------------------------------------------------ the sunbeam and its dust (the room slows down during the hold)
    const beamK = 0.6 + 0.4 * ramp(t, 0, 1.2);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    beamPath(ctx, 1100);
    const bg = ctx.createLinearGradient(275, 381, 275 + 0.6 * 1000, 381 + 1000);
    bg.addColorStop(0, `rgba(255,233,170,${0.42 * beamK})`); bg.addColorStop(1, 'rgba(255,233,170,0)');
    ctx.fillStyle = bg; ctx.fill();
    ctx.restore();
    const nz = this.nose('child', Math.min(t, R));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const m of this.motes) {
      let x = ((m.x + m.vx * tA + 14 * Math.sin(0.5 * tA + m.ph)) % W + W) % W;
      let y = 140 + ((((m.y - 140 + m.vy * tA + 8 * Math.sin(0.7 * tA + m.ph)) % 1350) + 1350) % 1350);
      if (t > R) {   // the sneeze blows the dust away from the child
        const dx = x - nz[0], dy = y - nz[1], dl = Math.hypot(dx, dy) + 1, push = 180 * (1 - Math.exp(-3 * (t - R))) * Math.exp(-dl / 500);
        x += (dx / dl) * push; y += (dy / dl) * push;
      }
      const b = inBeam(x, y);
      if (b < 0.02) continue;
      ctx.globalAlpha = b * m.a * (0.6 + 0.4 * Math.sin(TAU * 0.6 * tA + m.ph)) * beamK;
      ctx.drawImage(this.glowY, x - m.s, y - m.s, 2 * m.s, 2 * m.s);
    }
    ctx.restore();

    // ------------------------------------------------ sofa + floor
    cam(1);
    ctx.drawImage(this.sofa, -MG, -MG);
    // the starburst behind the child at the release
    const sb = clamp((t - R) / 0.22), sbOut = clamp((t - R - 0.55) / 0.4);
    if (sb > 0 && sbOut < 1) {
      const c0 = this.nose('child', R + 0.1);
      const s = ease.outBack(sb, 2) * (1 - 0.35 * sbOut);
      ctx.save(); ctx.globalAlpha = 1 - sbOut;
      starburst(ctx, c0[0], c0[1] - 40, 300 * s, 420 * s, 16, 0.2 + 0.3 * (t - R));
      fi(ctx, '#ffd36e', 7);
      starburst(ctx, c0[0], c0[1] - 40, 210 * s, 300 * s, 16, 0.4 + 0.3 * (t - R));
      ctx.fillStyle = '#fff1c4'; ctx.fill();
      ctx.restore();
    }

    // ------------------------------------------------ the cast (drawn to one layer, then stamped with a sticker shadow)
    const cx = this.cx;
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H);
    const seedNow = this.seed(t), seed2 = this.seed2(t);
    const look = (k, c, Xk, target, w) => {
      if (!target || w <= 0) return;
      const C = this.cast[k], hc = toStage(C, Xk, 0, 0);
      c.lookX = lerp(c.lookX, clamp((target[0] - hc[0]) / 230, -1, 1), w);
      c.lookY = lerp(c.lookY, clamp((target[1] - hc[1]) / 200, -1, 1), w);
    };
    const sv = this.springs;
    for (const k of ['gran', 'child', 'cat']) {
      const C = this.cast[k], pp = this.pop(k, t);
      if (pp <= 0.001) continue;
      const c = this.perf[k](t), Xk = xform(C, c, pp);
      // eyes follow the drifting seed
      if (k === 'child') look(k, c, Xk, seedNow.p, env(t, 0.55, 0.85, 2.0, 2.25) + env(t, R + 0.55, R + 0.8, 6.9, 7.05) * 0.8 + env(t, 8.9, 9.05, 9.3, 9.42) * 0.9);
      if (k === 'gran') look(k, c, Xk, seedNow.p, env(t, 0.6, 0.95, 2.0, 2.35) * 0.9 + env(t, R + 0.9, R + 1.1, 6.95, 7.1) * 0.7);
      if (k === 'cat') look(k, c, Xk, seedNow.p, env(t, R + 0.9, R + 1.1, 6.85, CAT_LAND));
      const s = sv[k], S = { tuft: 0, tuftY: 0, ear: 0, earY: 0, twitch: 0, cheek: 0, bun: 0, bunY: 0, glassY: 0, glassR: 0, whisk: 0, whiskY: 0, tail: 0, legs: [0, 0] };
      if (k === 'child') {
        S.tuft = 1.5 * s.tuft(t); S.tuftY = -s.tuftY(t); S.cheek = 0.6 * s.cheek(t); S.ear = 0.5 * s.ear(t);
        // feet swing while calm, stop while the sneeze builds, kick at the release
        const calm = 1 - env(t, 2.1, 2.5, R + 0.4, R + 1.2) - 0.7 * env(t, 9.25, 9.4, 10, 11);
        const kickL = clamp(0.35 * s.legs(t), -3, 14);   // feet only kick outward (never cross)
        S.legs = [10 * calm * Math.sin(TAU * 0.8 * t) + kickL, -10 * calm * Math.sin(TAU * 0.8 * t + 0.9) - kickL];
      } else if (k === 'gran') {
        S.bun = 1.6 * s.bun(t); S.bunY = 0.5 * s.bunY(t); S.glassY = (2.2 * s.glassY(t)) / C.s; S.glassR = 1.2 * s.glassR(t); S.cheek = 0.6 * s.cheek(t); S.ear = 0.4 * s.ear(t);
      } else {
        S.ear = 1.5 * s.ear(t); S.earY = 0.8 * s.earY(t); S.whisk = 1.4 * s.whisk(t); S.whiskY = 0.25 * s.whiskY(t); S.tail = 0.9 * s.tail(t); S.cheek = 0.6 * s.cheek(t);
        S.twitch = kick(t, this.twitch[0], 16, 3.2, 0.16) + kick(t, this.twitch[1], 12, 3.2, 0.16);
      }
      const blink = blinkAt(t, this.blinks[k]);
      // body
      cx.save();
      cx.translate(C.hip[0], C.hip[1] - Xk.lift);
      cx.rotate(Xk.lean);
      cx.scale(pp * (1 + 0.04 * c.squash), pp * (1 - 0.05 * c.squash));
      C.drawBody(cx, C, c, S, t);
      cx.restore();
      drawHead(cx, C, c, S, blink, Xk);
      // the seed sits on top of whichever nose it landed on
      if (k === 'child') { if (seedNow.on === 'child') drawSeed(cx, seedNow.p[0], seedNow.p[1], seedNow.s, seedNow.rot, 1, null); if (seed2 && t >= LAND2) drawSeed(cx, seed2.p[0], seed2.p[1], seed2.s, seed2.rot, 1, null); }
      if (k === 'cat' && seedNow.on === 'cat') drawSeed(cx, seedNow.p[0], seedNow.p[1], seedNow.s, seedNow.rot, 1, null);
      // startle ticks
      if (k === 'gran') ticks(cx, ...toStage(C, Xk, 0, -150), t, R + 0.2, 1);
      if (k === 'cat') { ticks(cx, ...toStage(C, Xk, 0, -150), t, R + 0.13, 0.9); ticks(cx, ...toStage(C, Xk, 0, -140), t, CHOO + 0.05, 0.6); }
      if (k === 'child') ticks(cx, ...toStage(C, Xk, 0, -150), t, CHOO + 0.14, 0.8);
    }
    ctx.save();
    ctx.shadowColor = 'rgba(70,35,20,.26)'; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 11; ctx.shadowBlur = 0;
    ctx.drawImage(this.charsC, 0, 0);
    ctx.restore();
    // the sunbeam falls across them too
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    beamPath(ctx, 1100);
    const bg2 = ctx.createLinearGradient(275, 381, 275 + 0.6 * 1000, 381 + 1000);
    bg2.addColorStop(0, `rgba(255,240,200,${0.5 * beamK})`); bg2.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = bg2; ctx.fill();
    ctx.restore();

    // ------------------------------------------------ the sneeze: action lines, spray, ring, the seed burst
    const nR = this.nose('child', R);
    const cR = this.perf.child(R + 0.05), XR = xform(CHILD, cR, 1);
    const mR = toStage(CHILD, XR, 0, featureY(cR, CHILD.mouth.y + 18)), hR = toStage(CHILD, XR, 0, 0);
    {
      const u = t - R;
      if (u > 0 && u < 0.34) {
        const k = outC(u / 0.34);
        ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.globalAlpha = 1 - k * k;
        ctx.beginPath();
        for (const l of this.lines) {
          const r0 = l.r0 + 90 * k, r1 = r0 + l.len * (1 - 0.7 * k);
          ctx.moveTo(hR[0] + r0 * Math.cos(l.a), hR[1] + r0 * Math.sin(l.a)); ctx.lineTo(hR[0] + r1 * Math.cos(l.a), hR[1] + r1 * Math.sin(l.a));
        }
        ctx.stroke(); ctx.restore();
      }
      if (u > 0 && u < 0.6) {
        ctx.save(); ctx.lineCap = 'round';
        for (const d of this.spray) {
          const at = (w) => (d.v * (1 - Math.exp(-d.k * w))) / d.k;
          const p1 = 30 + at(u), p0 = 30 + at(Math.max(0, u - 0.06)), a = 1 - smooth01(u / 0.6);
          const x1 = mR[0] + d.dx * p1, y1 = mR[1] + d.dy * p1 + 120 * u * u, x0 = mR[0] + d.dx * p0, y0 = mR[1] + d.dy * p0;
          ctx.globalAlpha = a;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = d.r * 0.9; ctx.stroke();
          el(ctx, x1, y1, d.r, d.r); fi(ctx, '#e6f5ff', 3);
        }
        ctx.restore();
      }
    }
    for (const [d, w0] of [[0.02, 10]]) {
      const u = (t - R - d) / 0.7;
      if (u > 0 && u < 1) {
        const r = 80 + 620 * ease.outExpo(u);
        ctx.save(); ctx.globalAlpha = 0.9 * (1 - u);
        el(ctx, nR[0], nR[1], r, r * 0.92); ctx.lineWidth = w0 * (1 - u) + 2; ctx.strokeStyle = '#fff8e6'; ctx.stroke();
        ctx.restore();
      }
    }
    // the cat's little ring
    {
      const u = (t - CHOO) / 0.45;
      if (u > 0 && u < 1) {
        const nc = this.nose('cat', CHOO);
        ctx.save(); ctx.globalAlpha = 0.85 * (1 - u);
        el(ctx, nc[0], nc[1], 40 + 220 * ease.outExpo(u), 36 + 200 * ease.outExpo(u)); ctx.lineWidth = 8 * (1 - u) + 2; ctx.strokeStyle = '#fff8e6'; ctx.stroke();
        ctx.restore();
      }
    }
    if (t > R) {
      const u = t - R;
      for (const q of this.cloud) {
        const e = (1 - Math.exp(-q.k * u)) / q.k;
        const x = q.o[0] + q.v[0] * e + q.wind[0] * u + q.sw * Math.sin(TAU * q.sf * u + q.ph);
        const y = q.o[1] + q.v[1] * e + q.wind[1] * u + 0.5 * q.sw * Math.sin(TAU * q.sf * 1.3 * u + q.ph * 2);
        if (x < -60 || x > W + 60 || y < -60 || y > H) continue;
        drawSeed(ctx, x, y, q.s, 0.5 * Math.sin(TAU * q.sf * u + q.ph) + q.v[0] * 0.0015 * Math.exp(-q.k * u), clamp(u / 0.1), inBeam(x, y) > 0.2 ? this.glowW : null);
      }
    }
    if (!seedNow.on || seedNow.on === 'clock') { if (t >= T_BREEZE - 0.01) drawSeed(ctx, seedNow.p[0], seedNow.p[1], seedNow.s, seedNow.rot, seedNow.a, this.glowW); }
    if (seed2 && t < LAND2) drawSeed(ctx, seed2.p[0], seed2.p[1], seed2.s, seed2.rot, seed2.a, this.glowW);

    // ------------------------------------------------ words
    const Xc = xform(CHILD, this.perf.child(t), this.pop('child', t));
    const hd = toStage(CHILD, Xc, 70, -110);
    const tr = env(t, 4.4, R - 0.1, R - 0.02, R) * tremble(t, 31);
    const b1 = (t < 3.4 ? ease.outBack(clamp((t - 2.55) / 0.35), 2) : 1 - 0.25 * smooth01((t - 3.3) / 0.25)) * (t < 3.62 ? 1 : 0);
    if (b1 > 0) bubble(ctx, hd[0] + 175, hd[1] - 80, hd[0] + 40, hd[1] + 10, '에…', 76, b1, -0.06);
    if (t >= 3.62 && t < R + 0.04) {   // it swells with the tension and pops on the release
      const grow = ease.outBack(clamp((t - 3.62) / 0.35), 2) * (1 + 0.22 * ramp(t, 3.9, R - 0.05)) * (1 + 0.3 * clamp((t - R + 0.03) / 0.07));
      bubble(ctx, hd[0] + 190 + 4 * tr, hd[1] - 95 + 3 * tr, hd[0] + 40, hd[1] + 10, '에… 에…!', 68, grow, -0.05 + 0.02 * tr);
    }
    cam(0.92);
    word(ctx, '에취!', 540, 560, 250, t, R, R + 0.85, { fill: '#ff5b3a', sw: 20, rot: -6, stagger: 0.05, spread: 1.0 });
    cam(1);
    const nc = this.nose('cat', Math.max(CHOO, Math.min(t, CHOO + 1)));
    word(ctx, '츄!', nc[0] + 40, nc[1] - 230, 130, t, CHOO, CHOO + 0.6, { fill: '#ffd36e', sw: 15, rot: 8 });
    const gh = toStage(GRAN, xform(GRAN, this.perf.gran(t), 1), -40, -150);
    word(ctx, '호호호', gh[0] + 10, gh[1] - 40, 74, t, LAUGH + 0.05, LAUGH_E - 0.1, { fill: '#fff3dc', sw: 11, rot: -10, stagger: 0.12, wob: 0.08 });
    const hl = toStage(CHILD, Xc, -40, -175);
    word(ctx, '히히', hl[0], hl[1], 70, t, LAUGH + 0.2, LAUGH_E - 0.05, { fill: '#fff3dc', sw: 11, rot: 8, stagger: 0.14, wob: 0.08 });
    const b3 = ease.outBack(clamp((t - 9.5) / 0.35), 2);
    if (b3 > 0) bubble(ctx, hd[0] + 175, hd[1] - 80, hd[0] + 40, hd[1] + 10, '에…?', 72, b3, -0.06);

    // ------------------------------------------------ foreground, light, vignette, grain
    cam(1.3);
    ctx.drawImage(this.fore, -MG, -MG);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const fl = t > R ? 0.3 * Math.exp(-(t - R) / 0.09) : 0;
    if (fl > 0.003) { ctx.fillStyle = `rgba(255,248,228,${fl})`; ctx.fillRect(0, 0, W, H); }
    ctx.drawImage(this.vig, 0, 0);
    const tens = env(t, 4.4, R - 0.1, R, R + 0.25) + 0.5 * env(t, LAND2 + 0.1, LAND2 + 0.5, 11, 12);
    if (tens > 0.003) { ctx.globalAlpha = tens; ctx.drawImage(this.tens, 0, 0); ctx.globalAlpha = 1; }
    ctx.globalAlpha = 0.6; ctx.drawImage(this.grain, 0, 0, W, H); ctx.globalAlpha = 1;
  },
});
