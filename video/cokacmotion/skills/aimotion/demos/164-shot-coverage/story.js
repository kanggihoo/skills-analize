/*
 * story.js — the action, on ONE clock. Characters and the cat act continuously whatever camera is running, so a cut
 * only chooses where to look: the reach that starts in the bust shot is the same reach that lands in the overhead.
 * Every channel is a closed-form function of t (tracks and bumps); nothing accumulates.
 */
import * as THREE from 'three';
import { track, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { CH, EYE, facePoint, BERRY, MEET, CAT_SILL, CAT_TABLE } from './layout.js';
import { REACH0, REACH_LEN, CLINK } from './shots.js';

const bump = (t, a, rise, hold, fall) => smooth((t - a) / rise) * (1 - smooth((t - a - rise - hold) / fall));
const step = (t, a, len) => smooth((t - a) / len);

// ---------------------------------------------------------------- gaze: [time, target], saccades of 0.09 s
const EYES = { A: facePoint(CH.A, 0, EYE.ey), B: facePoint(CH.B, 0, EYE.ey) };
const CAKE_LOOK = BERRY.clone();
const GAZE = {
  A: [[0, 'cake'], [2.22, 'B'], [2.95, 'B'], [4.12, 'cake'], [4.5, 'B'], [5.86, 'cake'], [6.42, 'meet'], [7.36, 'cat']],
  B: [[0, 'cake'], [2.3, 'A'], [2.62, 'cake'], [3.16, 'A'], [4.12, 'cake'], [4.74, 'A'], [5.86, 'cake'], [6.42, 'meet'], [7.4, 'cat']],
};
const SACCADE = 0.09;

export function gazePoint(key, t, catHead) {
  const list = GAZE[key];
  const pt = (name) => name === 'cake' ? CAKE_LOOK : name === 'meet' ? MEET : name === 'cat' ? (catHead || catHeadRest) : EYES[name];
  let i = 0;
  while (i + 1 < list.length && t >= list[i + 1][0]) i++;
  const cur = pt(list[i][1]);
  if (i === 0) return cur.clone();
  const k = smooth((t - list[i][0]) / SACCADE);
  return pt(list[i - 1][1]).clone().lerp(cur, k);
}
const catHeadRest = CAT_TABLE.clone().add(new THREE.Vector3(0, 0.215, 0.03));

// ---------------------------------------------------------------- the reach (cut on action happens a third of the way in)
// p: 0 = fork held up, 1 = fork tip at MEET. Anticipation pulls back first; the lunge accelerates into the hit.
export function reachAt(t) {
  if (t < 5.56) return 0;
  if (t < REACH0) return -0.09 * ease.outCubic(clamp((t - 5.56) / (REACH0 - 5.56)));
  if (t < CLINK) {
    const u = (t - REACH0) / REACH_LEN;
    return lerp(-0.09, 1, Math.pow(u, 1.25));          // nearly even travel (¼ done at the cut), still fast at the hit
  }
  const r = t - CLINK;                                   // the hit: a small recoil, then the tips rest together
  return 1 - 0.07 * Math.sin(Math.PI * clamp(r / 0.22)) * (r < 0.22 ? 1 : 0) - 0.012 * smooth(r / 0.3);
}

// ---------------------------------------------------------------- per-character channels
const T = {
  A: {
    lid: track([[0, -1.15], [3.62, -1.15], [3.9, -0.28], [4.96, -0.3], [5.22, 0.1], [5.56, 0.02], [5.86, -0.5], [6.45, -1.0], [6.6, -1.38], [7.25, -0.62], [7.48, -1.42]]),
    low: track([[0, -1.2], [3.62, -1.2], [3.9, -0.82], [4.96, -0.8], [5.22, -0.5], [5.86, -0.86], [6.6, -1.2]]),
    tilt: track([[0, 0], [3.62, 0], [3.9, 0.3], [4.96, 0.32], [5.22, 0.46], [5.86, 0.36], [6.5, -0.1], [7.45, -0.28]]),
    raise: track([[0, 0], [3.62, 0], [3.9, -0.004], [5.22, -0.007], [6.5, 0.002], [7.45, 0.011]]),
    mouth: track([[0, 0], [7.4, 0], [7.62, 1, ease.outBack]]),
    blinks: [1.12, 8.7],
  },
  B: {
    lid: track([[0, -1.15], [2.62, -1.15], [2.78, -0.58], [3.12, -0.58], [3.2, -1.05], [4.6, -0.95], [4.9, -0.2], [5.28, -0.18], [5.5, 0.14], [5.86, -0.5], [6.45, -1.0], [6.6, -1.38], [7.25, -0.62], [7.52, -1.42]]),
    low: track([[0, -1.2], [4.6, -1.2], [4.9, -0.78], [5.28, -0.76], [5.5, -0.5], [5.86, -0.86], [6.6, -1.2]]),
    tilt: track([[0, 0], [3.2, 0], [3.5, 0.18], [4.9, 0.36], [5.5, 0.5], [5.86, 0.36], [6.5, -0.1], [7.5, -0.28]]),
    raise: track([[0, 0], [3.2, 0], [4.9, -0.005], [5.5, -0.008], [6.5, 0.002], [7.5, 0.011]]),
    mouth: track([[0, 0], [7.44, 0], [7.66, 1, ease.outBack]]),
    blinks: [1.95, 9.05],
  },
};

const BLINK = (t, list) => list.reduce((m, tb) => Math.max(m, bump(t, tb, 0.05, 0.03, 0.08)), 0);

/** everything a character needs at time t */
export function charAt(key, t, catHead, out = {}) {
  const C = T[key];
  const p = reachAt(t);
  out.reach = p;
  // body: settle-in lean toward the cake, anticipation back, lunge, hit, then the turn toward the cat
  out.lean = 0.04 + 0.3 * smooth(clamp(p * 1.5)) + 0.7 * Math.min(0, p) + 0.04 * bump(t, CLINK, 0.04, 0.0, 0.25)
    - 0.06 * step(t, 7.36, 0.6);
  out.turn = (key === 'A' ? 1 : -1) * 0.36 * ease.inOutCubic(clamp((t - (key === 'A' ? 7.36 : 7.4)) / 0.55));
  out.breath = 0.012 * Math.sin((t / 2.6) * Math.PI * 2 + (key === 'A' ? 0 : 1.9)) * (1 - step(t, 5.5, 0.3)) ;
  out.squash = 0.05 * bump(t, CLINK, 0.03, 0.0, 0.3);              // a little jolt through the body at the hit
  out.gaze = gazePoint(key, t, catHead);
  const bl = BLINK(t, C.blinks);
  out.lid = lerp(C.lid(t), 1.5, bl);
  out.low = C.low(t);
  out.tilt = C.tilt(t);
  out.raise = C.raise(t);
  out.mouth = C.mouth(t);
  return out;
}

// ---------------------------------------------------------------- the cat (acts only while no camera can see it)
export const CAT_GO = 4.64, CAT_LAND = 5.06, STEAL = 5.3;
export function catAt(t, out = { pos: new THREE.Vector3() }) {
  const jump = clamp((t - CAT_GO) / (CAT_LAND - CAT_GO));
  const je = ease.inOutCubic(jump);
  out.pos.copy(CAT_SILL).lerp(CAT_TABLE, je);
  out.pos.y += 0.3 * Math.sin(Math.PI * jump);                    // a hop arc (off-screen)
  out.yaw = lerp(Math.PI * 0.5, 0, smooth((t - CAT_GO) / 0.4));
  out.sit = smooth((t - (CAT_GO - 0.08)) / 0.36);                // loaf → sitting
  out.crouch = 0.12 * bump(t, CAT_GO - 0.1, 0.08, 0.0, 0.08) + 0.15 * bump(t, CAT_LAND, 0.04, 0.0, 0.14);
  out.lean = bump(t, 5.14, 0.15, 0.03, 0.2);                     // stretches to the strawberry and back
  out.headDown = 1 - smooth((t - (CAT_GO - 0.12)) / 0.15);       // asleep, chin on the paws
  // eyes: 0 = closed arcs (asleep / blissful), 1 = open; the blink near the end
  out.eyes = clamp(bump(t, CAT_GO - 0.12, 0.08, 0.86, 0.12) + step(t, 8.5, 0.18) - bump(t, 9.32, 0.05, 0.02, 0.08));
  out.chew = t > 5.48 ? 0.5 - 0.5 * Math.cos((t - 5.48) * 2 * Math.PI * 2.4) : 0;
  out.chew *= 1 - step(t, 8.4, 0.3) * 0.75;
  out.tilt = 0.16 * ease.inOutCubic(clamp((t - 7.9) / 0.6)) - 0.16 * ease.inOutCubic(clamp((t - 9.3) / 0.5));
  out.tail = Math.sin(t * 2.2) * (t > 5.5 ? 1 : 0.25);
  out.breath = 0.02 * Math.sin((t / 2.2) * Math.PI * 2);
  out.hasBerry = t >= STEAL;
  return out;
}
