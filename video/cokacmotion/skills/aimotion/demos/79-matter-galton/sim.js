/*
 * sim.js — the Galton board in matter-js, baked once with a fixed step (no Runner, no wall clock).
 *
 * Stage pixels are the physics units (y down). The board is a hopper → a triangular lattice of ROWS rows of pegs →
 * ROWS + 1 bins. A gate holds the balls in the hopper during an unrecorded pre-roll (so frame 0 already shows a
 * settled, full hopper); it is removed at GATE_T and the balls pour.
 *
 * A 2-D rigid-body Galton board is too diffusive on its own: with nothing to take sideways speed out of a ball,
 * one peg strike throws it two or three columns wide and the histogram flattens (σ ≈ 2× the binomial's). A real
 * board is tilted back, and its balls roll and rub on the backboard. That contact is modelled here as a lateral drag
 * inside the peg field (`side`, exponential in time so it does not depend on the step size), which keeps every
 * peg strike a left/right choice of about half a column: the coin flip the binomial counts.
 *
 * bake() records x, y for every ball at FPS frames per second into one Float32Array; frame(t) only reads it.
 * The same module runs in node (tuning: node tune.mjs) and in the browser (setup()).
 */
export const BOARD = {
  cx: 540,
  // hopper: vertical reservoir walls, then slopes down to the neck
  hopTop: 238, hopHalf: 318, shoulderY: 300, neckY: 470, neckHalf: 40, lipY: 486,
  // peg lattice
  pegY0: 532, rows: 14, dx: 52, dy: 33, pegR: 6.5,
  // bins
  binTop: 1004, floorY: 1556, divW: 3,
  r: 7.6,                                   // ball radius: r + pegR = 14.1 > dx/4 = 13 → no straight lane through the lattice
};
BOARD.bins = BOARD.rows + 1;
BOARD.binL = BOARD.cx - BOARD.dx * BOARD.bins / 2;   // 150
BOARD.binR = BOARD.cx + BOARD.dx * BOARD.bins / 2;   // 930

export const PHYS = {
  gravity: 0.0026,          // matter gravity.scale (default 0.001 ≈ 1000 px/s²): a brisk, readable fall
  sub: 3,                   // physics steps per recorded 1/60 s frame → dt = 5.56 ms (no tunnelling through pegs)
  ball: { restitution: 0.18, friction: 0.012, frictionStatic: 0.05, frictionAir: 0.004, density: 0.002, slop: 0.02 },
  peg: { restitution: 0.25, friction: 0.0 },
  wall: { restitution: 0.05, friction: 0.0 },
  side: 9.0,                // s⁻¹: lateral drag in the peg field (the backboard contact, see above) — tuned so σ ≈ √14/2
  sideFrom: 26,             // px/s: below this sideways speed the drag lets go (slow roll-offs from a peg stay free)
  positionIterations: 14,
  velocityIterations: 10,
};

export const N = 420;       // balls
export const FPS = 60;      // recorded frames per second
export const GATE_T = 0.55; // s: the gate is pulled
const PREROLL = 1.6;        // s of unrecorded settling with the gate shut

/** peg centres: the triangle, plus one extra peg on each side of every row (inside the walls) so strays come back */
export function pegs() {
  const out = [];
  const { cx, rows, dx, dy, pegY0, binL, binR } = BOARD;
  for (let k = 0; k < rows; k++) {
    for (let i = -1; i <= k + 1; i++) {
      const x = cx + (i - k / 2) * dx;
      const core = i >= 0 && i <= k;
      if (x > binL + 6 && x < binR - 6) out.push({ x, y: pegY0 + k * dy, k, core });
    }
  }
  return out;
}
/** x of every bin wall (the outer two are the side walls) */
export function dividers() {
  return Array.from({ length: BOARD.bins + 1 }, (_, m) => BOARD.binL + m * BOARD.dx);
}
/** hopper outline, left side top → neck (mirror for the right) */
export function hopperLeft() {
  const B = BOARD;
  return [[B.cx - B.hopHalf, B.hopTop], [B.cx - B.hopHalf, B.shoulderY], [B.cx - B.neckHalf, B.neckY], [B.cx - B.neckHalf, B.lipY]];
}

/**
 * Run the pre-roll and the recorded pour. `rand` is the harness mulberry32 factory (pure, seeded).
 * Returns { pos: Float32Array[(frames+1)·N·2], frames, n, band: Uint8Array, bin: Int8Array, ms }.
 */
export function bake(Matter, { rand, seed = 79, duration = 10, n = N } = {}) {
  const { Engine, Bodies, Composite, Sleeping, Common } = Matter;
  const B = BOARD, P = PHYS;
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  Common._seed = seed;          // matter's own LCG (only used by Common.shuffle/choose — not by the solver)
  Common._nextId = 0;           // body ids order the pair list: same ids → the same solve order every run

  const engine = Engine.create({
    enableSleeping: true,
    positionIterations: P.positionIterations,
    velocityIterations: P.velocityIterations,
    gravity: { x: 0, y: 1, scale: P.gravity },
  });
  const world = engine.world;
  const dt = 1000 / FPS / P.sub;

  // ---- static geometry ----
  const stat = (o) => ({ isStatic: true, restitution: P.wall.restitution, friction: P.wall.friction, ...o });
  const segment = (x0, y0, x1, y1, th = 14) => {
    // a thin box lying on the far side of the line (normal (dy, −dx)/L): its near face is exactly the drawn line.
    // Callers order the two points so that normal points out of the hopper.
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = dy / L, ny = -dx / L;
    return Bodies.rectangle((x0 + x1) / 2 + nx * th / 2, (y0 + y1) / 2 + ny * th / 2, L + th * 0.6, th, stat({ angle: Math.atan2(dy, dx) }));
  };
  const statics = [];
  const hl = hopperLeft();
  for (const s of [1, -1]) {                  // left (s = 1) then right (mirrored, reversed so the inner face matches)
    const pts = hl.map(([x, y]) => [B.cx + (x - B.cx) * s, y]);
    for (let j = 0; j < pts.length - 1; j++) {
      const [a, b] = s === 1 ? [pts[j + 1], pts[j]] : [pts[j], pts[j + 1]];
      statics.push(segment(a[0], a[1], b[0], b[1]));
    }
  }
  for (const p of pegs()) statics.push(Bodies.circle(p.x, p.y, B.pegR, stat({ restitution: P.peg.restitution, friction: P.peg.friction }), 24));
  const dv = dividers();
  const wallTop = B.pegY0 - 40;
  statics.push(Bodies.rectangle(B.binL - 10, (wallTop + B.floorY) / 2, 20, B.floorY - wallTop, stat()));
  statics.push(Bodies.rectangle(B.binR + 10, (wallTop + B.floorY) / 2, 20, B.floorY - wallTop, stat()));
  statics.push(Bodies.rectangle(B.cx, B.floorY + 10, B.binR - B.binL + 40, 20, stat()));
  for (let m = 1; m < dv.length - 1; m++) {
    statics.push(Bodies.rectangle(dv[m], (B.binTop + B.floorY) / 2, B.divW, B.floorY - B.binTop, stat()));
    statics.push(Bodies.circle(dv[m], B.binTop, B.divW / 2, stat(), 12));   // round cap: nothing balances on a divider
  }
  const gate = Bodies.rectangle(B.cx, B.lipY + 6, B.neckHalf * 2 + 30, 12, stat());
  Composite.add(world, statics);
  Composite.add(world, gate);

  // ---- the balls: packed into the hopper bottom-up, so spawn order = height in the hopper ----
  const rnd = rand(seed);
  const balls = [];
  const R = B.r, pitch = 2 * R + 0.9;
  let row = 0;
  outer:
  for (let y = B.lipY - R - 2; ; y -= pitch * 0.9, row++) {
    // inner half-width of the hopper at this height
    let half;
    if (y >= B.neckY) half = B.neckHalf;
    else if (y >= B.shoulderY) half = B.neckHalf + (B.hopHalf - B.neckHalf) * (B.neckY - y) / (B.neckY - B.shoulderY);
    else half = B.hopHalf;
    half -= R + 2;
    const cnt = Math.max(1, Math.floor((2 * half) / pitch) + 1);
    const off = (row % 2) * pitch * 0.5;
    for (let j = 0; j < cnt; j++) {
      const x = B.cx - half + off * (cnt > 1 ? 1 : 0) + j * pitch + (rnd() - 0.5) * 1.2;
      if (x > B.cx + half + 0.5) continue;
      balls.push(Bodies.circle(x, y + (rnd() - 0.5) * 1.2, R, { ...P.ball, sleepThreshold: 30 }, 20));
      if (balls.length >= n) break outer;
    }
    if (y < B.hopTop - 400) break;           // safety: the hopper could not take n balls
  }
  const count = balls.length;
  Composite.add(world, balls);
  const coin = Uint8Array.from({ length: count }, () => (rnd() < 0.5 ? 1 : 0));
  const nudgeV = 4 * dt / 1000;                // px per step (4 px/s)

  // ---- per-step forces: backboard drag in the peg field; wake anything above the bins ----
  const keep = Math.exp(-P.side * dt / 1000);
  const vFrom = P.sideFrom * dt / 1000;       // px per step
  const fieldY0 = B.pegY0 - B.dy * 0.6, fieldY1 = B.binTop - 6;
  const beforeStep = () => {
    for (let i = 0; i < count; i++) {
      const b = balls[i], p = b.position;
      // above the bins nothing may sleep: a ball asleep in the hopper or on a peg would hang in the air once its support moves on
      if (b.isSleeping && p.y < B.binTop) Sleeping.set(b, false);
      if (p.y > fieldY0 && p.y < fieldY1) {
        const vx = p.x - b.positionPrev.x, a = Math.abs(vx), vy = p.y - b.positionPrev.y;
        if (a > vFrom) b.positionPrev.x = p.x - Math.sign(vx) * (vFrom + (a - vFrom) * keep);
        // a ball balanced dead-centre on a peg (unstable, but exact in a solver) gets the small push a real peg's
        // imperfection would give it; the side is a per-ball coin from the seeded rand, so the bake stays deterministic
        else if (a < nudgeV && Math.abs(vy) < nudgeV) b.positionPrev.x = p.x - (coin[i] ? 1 : -1) * nudgeV * 2;
      }
    }
  };

  // ---- pre-roll (not recorded): the hopper settles behind the gate ----
  const preSteps = Math.round(PREROLL * FPS * P.sub);
  for (let s = 0; s < preSteps; s++) { beforeStep(); Engine.update(engine, dt); }

  // ---- recorded pour ----
  const frames = Math.round(duration * FPS);
  const pos = new Float32Array((frames + 1) * count * 2);
  const save = (f) => {
    const o = f * count * 2;
    for (let i = 0; i < count; i++) { pos[o + i * 2] = balls[i].position.x; pos[o + i * 2 + 1] = balls[i].position.y; }
  };
  save(0);
  const gateStep = Math.round(GATE_T * FPS * P.sub);
  for (let s = 1; s <= frames * P.sub; s++) {
    if (s === gateStep) {
      Composite.remove(world, gate);
      for (const b of balls) Sleeping.set(b, false);
    }
    beforeStep();
    Engine.update(engine, dt);
    if (s % P.sub === 0) save(s / P.sub);
  }

  // ---- outcome: the bin each ball came to rest in (−1: never arrived) ----
  const bin = new Int8Array(count).fill(-1);
  const last = frames * count * 2;
  for (let i = 0; i < count; i++) {
    const x = pos[last + i * 2], y = pos[last + i * 2 + 1];
    if (y > B.binTop) bin[i] = Math.max(0, Math.min(B.bins - 1, Math.floor((x - B.binL) / B.dx)));
  }
  // colour band by fill order: four strata from the bottom of the hopper up
  const band = new Uint8Array(count);
  for (let i = 0; i < count; i++) band[i] = Math.floor((i / count) * 4) % 2;
  const ms = (typeof performance !== 'undefined' ? performance.now() : 0) - t0;
  return { pos, frames, n: count, bin, band, ms, fps: FPS };
}
