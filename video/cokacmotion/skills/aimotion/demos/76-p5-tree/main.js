/*
 * 76 · 바람 부는 나무 — a spring cherry tree drawn with p5.js 2 in instance mode, as an illustration on textured paper.
 * A sprout rises from the meadow and branches recursively into a full crown (0–2.8 s); buds swell and blossoms
 * pop open from the trunk outward (2.2–4.6 s); a breeze builds into one strong gust (peak ≈ 5.3–6.4 s) that bends
 * the crown, sweeps wind lines across the sky and tears half the blossoms into a storm of petals; the gust passes,
 * the branches spring back, petals drift down into the grass and one line of text appears (6.9–8.6 s).
 *
 * setup(): p5 is started on the stage canvas (createCanvas onto an existing <canvas>, pixelDensity 1, noLoop);
 *          randomSeed/noiseSeed; the tree, blossom clusters, leaves, grass and every petal's flight (and landing
 *          time) are generated; the wind is integrated into tables; sky, clouds, land, paper grain and all sprites
 *          are painted once into p5.Graphics.
 * frame(t): sets the time and calls redraw(). draw() re-seeds, poses the tree (forward kinematics from t) and
 *          paints the whole picture from scratch — branches by recursion with push/rotate/translate/pop.
 */
import p5 from '../node_modules/p5/lib/p5.esm.js';
import { defineDemo, clamp, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import {
  W, H, D, SEED, NOISE_SEED, TX, TY, groundY, growTree, fitTree, makePose, computePose, prepareWind, makeWind,
  onBranch, petalAt, landPetal,
} from './tree.js';
import {
  PAL, makeSky, makeClouds, makeLand, makeShadow, makeGrain, makeCluster, makeBud, makeLeaf, makePetal,
} from './art.js';

const LINE = '바람이 지나간 자리마다 봄';
const FONT = 'Gowun Batang', TEXT_SIZE = 50, TEXT_Y = 232, TRACK = 4;
const TEXT_T0 = 6.9, TEXT_STEP = 0.1, SEAL_T = 8.55;
const CROWN_BOX = { top: 440, left: 66, right: 1014 };
const RELEASE_FRONT = 0.5, RELEASE_BACK = 0.32;       // share of clusters the gust strips
const GUST_RELEASE = [5.05, 0.6, 0.85];                // release time = a + b·(x across the crown) + c·random
const N_STRAY = 40, N_TRICKLE = 70, N_TUFTS = 62;

// wind lines (gust traces) across the sky: start time, height, wave, loop position (0 = none), width
const STREAKS = [
  [4.75, 520, 26, 170, 0.3, 0, 2.6], [4.95, 840, 20, 140, 1.9, 560, 3.2], [5.2, 380, 30, 200, 4.0, 0, 2.2],
  [5.35, 1080, 22, 160, 2.7, 700, 3.0], [5.6, 660, 24, 180, 5.1, 380, 2.6], [5.9, 960, 18, 150, 0.9, 0, 2.2],
  [6.2, 460, 22, 190, 3.3, 0, 2.0],
];
const STREAK_LIFE = 1.3, STREAK_LEN = 380;

/** wait until p5 is out of its own draw() (redraw() is a no-op while _inUserDraw is set) */
async function settle(p) {
  for (let i = 0; i < 1000 && (!p._setupDone || p._inUserDraw); i++) await Promise.resolve();
}

// ---- scene generation (setup) ------------------------------------------------------------------------
function build(p, S) {
  p.randomSeed(SEED); p.noiseSeed(NOISE_SEED); p.noiseDetail(4, 0.5);
  const rnd = () => p.random();
  const noise = (x, y) => p.noise(x, y);

  const B = growTree(rnd);
  fitTree(B, CROWN_BOX);
  prepareWind(B);
  const wind = makeWind(noise);
  const flutter = (b, t, env) => (b.fa ? (p.noise(b.id * 0.173 + 3.1, t * b.fr) - 0.5) * 2 * b.fa * (0.3 + env) : 0);
  const Q = computePose(B, 99, null, makePose(B.length));        // rest pose: where things sit
  Object.assign(S, { B, wind, flutter, P: makePose(B.length) });

  // blossom clusters on the twigs (and some along the outer branches)
  const top = onBranch(Q, 0, 1, 0);
  const C = [];
  for (const b of B) {
    const spots = [];
    if (b.twig) {
      spots.push([1, 0]);
      if (rnd() < 0.62) spots.push([0.35 + 0.4 * rnd(), (rnd() < 0.5 ? -1 : 1) * (4 + 6 * rnd())]);
    } else if (b.depth >= 5 && rnd() < 0.42) spots.push([0.3 + 0.6 * rnd(), (rnd() < 0.5 ? -1 : 1) * (5 + 7 * rnd())]);
    for (const [s, off] of spots) {
      const [x, y] = onBranch(Q, b.id, s, off);
      C.push({ b: b.id, s, off, x, y, d: Math.hypot(x - top[0], y - top[1]) });
    }
  }
  const dMax = Math.max(...C.map((c) => c.d));
  C.forEach((c, i) => {
    const bb = B[c.b];
    c.id = i;
    c.back = rnd() < 0.3;
    c.v = Math.floor(rnd() * (c.back ? 3 : 6));
    c.sc = c.back ? 0.74 + 0.2 * rnd() : 0.86 + 0.3 * rnd();
    c.rot0 = (rnd() - 0.5) * 1.2;
    // open in a wave from the trunk outward, never before the twig has grown
    c.tOpen = Math.max(bb.birth + bb.dur + 0.15, 2.2 + 1.7 * (c.d / dMax) + 0.55 * rnd());
    const [a, k, j] = GUST_RELEASE;
    c.tRel = rnd() < (c.back ? RELEASE_BACK : RELEASE_FRONT) ? a + k * clamp((c.x - 80) / 900) + j * rnd() : Infinity;
  });
  S.back = C.filter((c) => c.back);
  S.front = C.filter((c) => !c.back);

  // young leaves near the twig tips
  S.leaves = [];
  for (const b of B) {
    if (!b.twig || rnd() >= 0.5) continue;
    S.leaves.push({ id: S.leaves.length, b: b.id, s: 0.55 + 0.4 * rnd(), side: rnd() < 0.5 ? -1 : 1,
      sc: 0.55 + 0.35 * rnd(), tone: rnd() < 0.5 ? 0 : 1, t0: b.birth + b.dur * 0.8 });
  }

  // petals: each released cluster bursts into a few, plus strays before the gust and a trickle after it
  const petals = [];
  const tmp = makePose(B.length);
  const where = (c, tr) => onBranch(computePose(B, tr, wind, tmp, flutter), c.b, c.s, c.off);   // the pose the frame shows at tr
  const spawn = (c, tr, theta, [cx, cy] = where(c, tr)) => {
    const f = wind.force(tr);
    const r0 = (4 + 12 * rnd()) * c.sc, burst = (12 + 28 * rnd()) * (0.5 + f);
    const pt = {
      tr, back: c.back, x0: cx + Math.cos(theta) * r0, y0: cy + Math.sin(theta) * r0,
      bx: Math.cos(theta) * burst, by: Math.sin(theta) * burst * 0.6,
      k: 0.45 + 0.5 * rnd(), vf: 52 + 70 * rnd(), lift: (10 + 60 * rnd()) * (0.4 + f),
      ax: 8 + 16 * rnd(), wx: 2.6 + 3.4 * rnd(), px: rnd() * 6.283,
      ay: 4 + 8 * rnd(), wy: 3 + 4 * rnd(), py: rnd() * 6.283,
      ns: 100 + petals.length * 1.37, mz: 90 + 90 * rnd(),
      r0: theta + Math.PI / 2, spin: (rnd() < 0.5 ? -1 : 1) * (1.2 + 3 * rnd()), wr: 2 + 3 * rnd(), pr: rnd() * 6.283,
      wf: 3 + 5 * rnd(), pf: (rnd() - 0.5) * 0.8,
      size: (c.back ? 0.7 : 0.85) + 0.4 * rnd(), depth: 6 + 250 * Math.pow(rnd(), 1.6), D0: wind.drift(tr),
    };
    landPetal(pt, wind, noise);
    petals.push(pt);
  };
  for (const c of C) {
    if (c.tRel === Infinity) continue;
    const n = c.back ? 3 : 5, a0 = rnd() * 6.283, at = where(c, c.tRel);
    for (let k = 0; k < n; k++) spawn(c, c.tRel, a0 + (k / n) * 6.283 + rnd() * 0.5, at);
  }
  for (let i = 0; i < N_STRAY; i++) {
    const c = C[Math.floor(rnd() * C.length)], tr = 3.5 + 1.5 * rnd();
    if (tr > c.tOpen + 0.3 && tr < c.tRel) spawn(c, tr, rnd() * 6.283);
  }
  for (let i = 0; i < N_TRICKLE; i++) {
    const c = C[Math.floor(rnd() * C.length)], tr = 6.9 + 2.8 * rnd();
    if (tr > c.tOpen + 0.3) spawn(c, tr, rnd() * 6.283);
  }
  S.petals = petals;

  // grass tufts on the meadow, back to front
  const tufts = [];
  for (let i = 0; i < N_TUFTS; i++) {
    const x = -20 + 1120 * rnd(), dep = Math.pow(rnd(), 1.35) * 360, sc = 0.5 + 1.15 * dep / 360;
    const k = dep / 360, light = [150 - 108 * k, 184 - 118 * k, 120 - 70 * k];
    const blades = [];
    for (let j = 0, n = 5 + Math.floor(rnd() * 4); j < n; j++) {
      blades.push({ dx: (rnd() - 0.5) * 26 * sc, h: (22 + 40 * rnd()) * sc, lean: (rnd() - 0.5) * 0.7,
        w: (3 + 3 * rnd()) * sc, flex: 0.4 + 0.5 * rnd(), shade: rnd() < 0.5 ? 0 : 1 });
    }
    tufts.push({ x, y: groundY(x) + 4 + dep, blades,
      col: [p.color(light[0], light[1], light[2]), p.color(light[0] * 0.8, light[1] * 0.84, light[2] * 0.8)] });
  }
  S.tufts = tufts.sort((a, b) => a.y - b.y);

  // paint once
  S.sky = makeSky(p);
  S.cloudFar = makeClouds(p, false);
  S.cloudNear = makeClouds(p, true);
  S.land = makeLand(p);
  S.shadow = makeShadow(p);
  S.grain = makeGrain(p);
  S.clFront = [0, 1, 2, 3, 4, 5].map((i) => makeCluster(p, i < 4 ? 'front' : 'white'));
  S.clBack = [0, 1, 2].map(() => makeCluster(p, 'back'));
  S.bud = makeBud(p);
  S.leaf = [makeLeaf(p, 0), makeLeaf(p, 1)];
  S.petalFront = makePetal(p, 'front');
  S.petalBack = makePetal(p, 'back');
  S.petalFallen = makePetal(p, 'fallen');
  S.col = {
    bark: PAL.bark.map((c) => p.color(...c)), hi: p.color(...PAL.barkHi, 150), shade: p.color(...PAL.barkShade, 120),
    lenticel: p.color(...PAL.barkShade, 110),
  };

  // the line of text: glyph positions from p5's own metrics
  p.textFont(FONT); p.textSize(TEXT_SIZE);
  const chars = Array.from(LINE);
  const widths = chars.map((ch) => p.textWidth(ch));
  const total = widths.reduce((a, b) => a + b, 0) + TRACK * (chars.length - 1);
  let x = W / 2 - total / 2;
  S.glyphs = chars.map((ch, i) => { const g = { ch, x, t0: TEXT_T0 + i * TEXT_STEP }; x += widths[i] + TRACK; return g; });
  S.sealX = x + 18;
}

// ---- drawing (every frame, from t) ----------------------------------------------------------------------
function drawBranch(p, S, i) {
  const b = S.B[i], P = S.P, L = P.len[i], w = P.w[i];
  p.rotate(P.a[i]);
  if (b.depth <= 1) {
    // trunk and limbs: tapered shapes with a root flare, a lit edge, a shaded edge and cherry-bark lenticels
    const wt = w * (b.depth === 0 ? 0.62 : 0.56);
    p.noStroke(); p.fill(S.col.bark[0]);
    p.beginShape();
    if (b.depth === 0) {
      p.vertex(-w * 0.98, 3); p.vertex(-w * 0.68, -L * 0.05); p.vertex(-w * 0.53, -L * 0.16); p.vertex(-wt * 0.5, -L);
      p.vertex(wt * 0.5, -L); p.vertex(w * 0.53, -L * 0.16); p.vertex(w * 0.68, -L * 0.05); p.vertex(w * 0.98, 3);
    } else {
      p.vertex(-w * 0.5, 0); p.vertex(-wt * 0.5, -L); p.vertex(wt * 0.5, -L); p.vertex(w * 0.5, 0);
    }
    p.endShape(p.CLOSE);
    p.circle(0, 0, w); p.circle(0, -L, wt);
    if (L > 20) {
      p.stroke(S.col.hi); p.strokeWeight(w * 0.16); p.line(-w * 0.25, -L * 0.1, -wt * 0.24, -L * 0.94);
      p.stroke(S.col.shade); p.strokeWeight(w * 0.14); p.line(w * 0.28, -L * 0.08, wt * 0.27, -L * 0.94);
      p.stroke(S.col.lenticel); p.strokeWeight(2);
      for (let y = 0.12; y < 0.9; y += 22 / Math.max(L, 1)) {
        const ww = w + (wt - w) * y, o = Math.sin(y * 91 + i) * 0.15 * ww;
        p.line(o - ww * 0.18, -L * y, o + ww * 0.14, -L * y);
      }
    }
  } else if (L > 0.2) {
    p.stroke(S.col.bark[b.depth < 3 ? 0 : b.depth < 6 ? 1 : 2]); p.strokeWeight(w); p.line(0, 0, 0, -L);
    if (w > 5) { p.stroke(S.col.hi); p.strokeWeight(w * 0.25); p.line(-w * 0.2, -L * 0.05, -w * 0.2, -L * 0.95); }
  }
  for (const c of b.kids) {
    if (P.len[c.id] <= 0.2) continue;
    p.push();
    p.translate(0, -L * c.at);
    drawBranch(p, S, c.id);
    p.pop();
  }
}

function drawCluster(p, S, c, t, env) {
  const P = S.P, i = c.b, tb = c.tOpen - 0.7;
  if (t < tb || P.g[i] < c.s * 0.98) return;
  const [x, y] = onBranch(P, i, c.s, c.off);
  const rot = c.rot0 + P.A[i] * 0.3 + (p.noise(c.id * 0.31 + 50, t * 1.7) - 0.5) * (0.4 + 0.8 * env);
  const o = (t - c.tOpen) / 0.55;
  p.push();
  p.translate(x, y);
  p.rotate(rot);
  if (o < 0.4) {                                              // the bud swells, then gives way to the flowers
    const bs = ease.outBack(clamp((t - tb) / 0.35)) * (o > 0 ? 1 - o / 0.4 : 1) * c.sc;
    if (bs > 0.01) { p.push(); p.scale(bs); p.image(S.bud, -12, -11, 24, 24); p.pop(); }
  }
  if (o > 0) {
    const set = c.back ? S.clBack[c.v] : S.clFront[c.v];
    let s = ease.outBack(clamp(o), 1.6) * c.sc, spr = set.full;
    if (t >= c.tRel) { spr = set.sparse; s *= 0.9 + 0.1 * (1 - Math.exp(-(t - c.tRel) / 0.25)); }
    if (s > 0.01) { p.scale(s); p.image(spr, -32, -32, 64, 64); }
  }
  p.pop();
}

function drawBlade(p, tf, bl, bend) {
  const bx = tf.x + bl.dx, by = tf.y, th = bl.lean + bend * bl.flex, h = bl.h, w = bl.w;
  const tx = bx + Math.sin(th) * h, ty = by - Math.cos(th) * h;
  const cx = bx + Math.sin(th * 0.35) * h * 0.55, cy = by - Math.cos(th * 0.35) * h * 0.55;
  const S3 = [0, 0.35, 0.7], left = [], right = [];
  for (const s of S3) {
    const u = 1 - s;
    const qx = u * u * bx + 2 * u * s * cx + s * s * tx, qy = u * u * by + 2 * u * s * cy + s * s * ty;
    const dx = 2 * u * (cx - bx) + 2 * s * (tx - cx), dy = 2 * u * (cy - by) + 2 * s * (ty - cy);
    const l = Math.hypot(dx, dy) || 1, hw = w * u * 0.5;
    left.push([qx - (dy / l) * hw, qy + (dx / l) * hw]);
    right.push([qx + (dy / l) * hw, qy - (dx / l) * hw]);
  }
  p.beginShape();
  for (const v of left) p.vertex(v[0], v[1]);
  p.vertex(tx, ty);
  for (let k = right.length - 1; k >= 0; k--) p.vertex(right[k][0], right[k][1]);
  p.endShape(p.CLOSE);
}

function drawPetal(p, S, pt, o) {
  if (o.x < -40 || o.x > W + 40 || o.y > H + 30) return;
  p.push();
  p.translate(o.x, o.y);
  if (o.landed) {                                             // lying in the grass: flattened in screen space
    p.scale(pt.size, pt.size * 0.55);
    p.rotate(o.rot);
    p.image(S.petalFallen, -12, -12, 24, 24);
  } else {
    p.rotate(o.rot);
    p.scale(o.flip * pt.size, pt.size);                     // tumbling: the petal turns edge-on, then shows its back
    p.image(o.flip > 0 && !pt.back ? S.petalFront : S.petalBack, -12, -12, 24, 24);
  }
  p.pop();
}

function drawStreaks(p, S, t) {
  p.noFill();
  for (const [t0, y0, amp, per, ph, loop, wd] of STREAKS) {
    const life = (t - t0) / STREAK_LIFE;
    if (life <= 0 || life >= 1) continue;
    const head = -100 + life * 1800, tail = head - STREAK_LEN;
    const fade = Math.sin(Math.PI * life);
    const at = (s) => {
      let x = -200 + s, y = y0 + amp * Math.sin(s / per + ph);
      if (loop && s > loop && s < loop + 150) {               // a curl: one turn of a prolate cycloid
        const f = ((s - loop) / 150) * Math.PI * 2;
        x -= 40 * Math.sin(f); y -= 40 * (1 - Math.cos(f));
      }
      return [x, y];
    };
    const N = 22;
    let prev = at(Math.max(0, tail));
    for (let k = 1; k <= N; k++) {
      const v = k / N, s = tail + v * STREAK_LEN;
      if (s < 0) { prev = at(0); continue; }
      const q = at(Math.min(s, 1500));
      p.stroke(255, 255, 255, (200 * Math.sin(Math.PI * v) + 20) * fade);
      p.strokeWeight(wd * (0.3 + Math.sin(Math.PI * v)));
      p.line(prev[0], prev[1], q[0], q[1]);
      prev = q;
    }
  }
}

function render(p, S, t) {
  const { B, P, wind } = S;
  p.randomSeed(SEED); p.noiseSeed(NOISE_SEED); p.noiseDetail(4, 0.5);   // same tables every frame
  const env = wind.env(t);
  computePose(B, t, wind, P, S.flutter);

  p.push();
  p.blendMode(p.BLEND); p.imageMode(p.CORNER); p.strokeCap(p.ROUND);
  // sky, drifting washes, land
  p.image(S.sky, 0, 0, W, 1600);
  p.image(S.cloudFar, -220 + t * 5, 120, 1440, 1040);
  p.image(S.cloudNear, -260 + t * 11, 260, 1440, 1040);
  p.image(S.land, 0, 0, W, H);
  // the crown's shadow grows with the tree
  const gs = ease.outCubic(clamp((t + 0.2) / 3));
  if (gs > 0.02) p.image(S.shadow, TX + 30 - 340 * gs, TY - 26, 680 * gs, 70);

  const o = {}, nz = (x, y) => p.noise(x, y);
  for (const pt of S.petals) if (t >= pt.tl && petalAt(pt, t, wind, nz, o)) drawPetal(p, S, pt, o);

  for (const c of S.back) drawCluster(p, S, c, t, env);
  p.push();
  p.translate(TX, TY);
  drawBranch(p, S, 0);
  p.pop();
  for (const l of S.leaves) {
    if (t < l.t0 || P.g[l.b] < l.s) continue;
    const [x, y] = onBranch(P, l.b, l.s, 0);
    const s = ease.outBack(clamp((t - l.t0) / 0.45)) * l.sc;
    if (s < 0.01) continue;
    p.push();
    p.translate(x, y);
    p.rotate(P.A[l.b] + l.side * 0.95 + (p.noise(l.id * 0.41 + 90, t * 2.1) - 0.5) * (0.5 + env));
    p.scale(s);
    p.image(S.leaf[l.tone], -16, -29, 32, 32);
    p.pop();
  }
  for (const c of S.front) drawCluster(p, S, c, t, env);

  // grass: the gust runs through it left to right
  p.noStroke();
  for (const tf of S.tufts) {
    const bend = wind.bend(9, t - tf.x / 900) * 0.55 + (p.noise(tf.x * 0.01, t * 1.3) - 0.5) * 0.25 * (0.4 + env);
    for (let sh = 0; sh < 2; sh++) {
      p.fill(tf.col[sh]);
      for (const bl of tf.blades) if (bl.shade === sh) drawBlade(p, tf, bl, bend);
    }
  }

  for (const pt of S.petals) if (t < pt.tl && petalAt(pt, t, wind, nz, o)) drawPetal(p, S, pt, o);
  drawStreaks(p, S, t);

  // one quiet line, letter by letter, carried in on the last of the wind; then a small seal
  p.noStroke();
  p.textFont(FONT); p.textSize(TEXT_SIZE); p.textAlign(p.LEFT, p.BASELINE);
  for (const g of S.glyphs) {
    const k = clamp((t - g.t0) / 0.7);
    if (k <= 0) continue;
    const e = ease.outCubic(k);
    p.fill(PAL.text[0], PAL.text[1], PAL.text[2], 255 * e);
    p.text(g.ch, g.x - 16 * (1 - e), TEXT_Y + 8 * (1 - e));
  }
  const ks = clamp((t - SEAL_T) / 0.35);
  if (ks > 0) {
    const e = ease.outCubic(ks), sc = 1.35 - 0.35 * e;
    p.push();
    p.translate(S.sealX + 21, TEXT_Y - 19);
    p.scale(sc);
    p.rotate(-0.05);
    p.fill(PAL.seal[0], PAL.seal[1], PAL.seal[2], 225 * e);
    p.rectMode(p.CENTER);
    p.rect(0, 0, 40, 40, 5);
    p.fill(252, 242, 232, 245 * e);
    p.textSize(26); p.textAlign(p.CENTER, p.CENTER);
    p.text('봄', 0, -1);
    p.pop();
  }

  // paper grain over everything
  p.blendMode(p.SOFT_LIGHT);
  p.image(S.grain, 0, 0, W, H);
  p.blendMode(p.BLEND);
  p.pop();
}

// ---- the demo -------------------------------------------------------------------------------------------
defineDemo({
  id: '76-p5-tree',
  title: '바람 부는 나무',
  tech: 'p5.js · 재귀 가지치기 · noise 바람 · 인스턴스 모드',
  duration: D,
  fps: 30,
  background: '#f3eadb',
  async setup({ layer, stage }) {
    await fontReady(`400 ${TEXT_SIZE}px "${FONT}"`, LINE);
    const el = layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const S = (this.S = { t: 0, ready: false });
    let booted;
    const boot = new Promise((r) => { booted = r; });
    this.p = new p5((p) => {
      p.setup = () => {
        p.createCanvas(W, H, p.P2D, el);                       // draw onto the stage's canvas
        p.pixelDensity(1);                                    // 1080×1920 backing store on every screen
        p.noLoop();                                           // frames come only from redraw()
      };
      p.draw = () => {
        if (!S.ready) { booted(); return; }                   // p5's own first draw after setup
        render(p, S, S.t);
      };
    }, stage);                                               // parent node: the canvas stays on the stage
    await boot;
    await settle(this.p);
    build(this.p, S);
    S.ready = true;
  },
  async frame(t) {
    const p = this.p;
    await settle(p);
    this.S.t = t;
    await p.redraw();
  },
});
