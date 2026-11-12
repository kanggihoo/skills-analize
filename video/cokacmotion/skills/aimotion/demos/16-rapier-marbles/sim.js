/*
 * sim.js — a Galton box in Rapier2D, stepped at a fixed dt and baked once.
 *
 * Units are physical: 1 stage pixel = 1 mm, so the marbles are 16 mm glass marbles and the box is ~1.6 m tall.
 * y points down (gravity is +y). The box leans back at TILT, so the in-plane gravity is g·sin(TILT); the marbles
 * roll and rub on the backboard and front glass, which a 2D world cannot contain — that contact is modelled as a
 * lateral drag inside the pin field (without it a frictionless 2D plane is far too diffusive: σ ≈ 4.3 bins
 * instead of ≈ 2.2, a flat spread rather than a bell).
 *
 * bake() returns every video frame's marble poses (x, y in stage px, angle) in one Float32Array, so drawing a
 * frame never touches the physics world again: seeking is a table lookup.
 */
export const PX = 0.001;                         // metres per stage pixel

export const BOARD = {
  cx: 540,
  mouthY: 150, mouthHalf: 300,                   // funnel mouth (top)
  neckY: 404, neckHalf: 36,                      // funnel neck (bottom): 72 mm ≈ 4.5 marbles wide
  lipY: 428,
  pegY0: 482, rows: 14, dx: 56, dy: 48, pegR: 7, // marble r + pin r = 15 > dx/4 = 14: no straight lanes
  binTop: 1170, floorY: 1612, divW: 6,
  marbleR: 8,
};
BOARD.bins = BOARD.rows + 1;
BOARD.binL = BOARD.cx - BOARD.dx * BOARD.bins / 2;   // 120
BOARD.binR = BOARD.cx + BOARD.dx * BOARD.bins / 2;   // 960

export const PHYS = {
  tilt: 34 * Math.PI / 180,                      // box leans back 34°
  gravity: 9.81,
  marble: { restitution: 0.4, friction: 0.4, density: 2500 },   // glass on brass / glass on glass
  pin: { restitution: 0.4, friction: 0.4 },
  wall: { restitution: 0.2, friction: 0.15 },
  airDrag: 0.2,                                  // s⁻¹, Rapier linear damping (air + rolling resistance)
  backDrag: 19.5,                                // s⁻¹ on lateral speed above backDragFrom, inside the pin field
  backDragFrom: 0.06,                            // m/s: slow roll-offs from a pin stay free
  lengthUnit: 0.016,                             // Rapier's tolerances scaled to the marble (default assumes ~1 m)
  solverIterations: 6,
};

/** pin centres (stage px): a triangle with one extra pin on each side of every row so no marble escapes it */
export function pegs() {
  const out = [];
  const { cx, rows, dx, dy, pegY0, binL, binR } = BOARD;
  for (let k = 0; k < rows; k++) {
    for (let i = -1; i <= k + 1; i++) {
      const x = cx + (i - k / 2) * dx;
      if (x >= binL - 1 && x <= binR + 1) out.push([x, pegY0 + k * dy]);
    }
  }
  return out;
}
/** x of each bin divider (the outer two are the side walls) */
export function dividers() {
  return Array.from({ length: BOARD.bins + 1 }, (_, m) => BOARD.binL + m * BOARD.dx);
}

/**
 * Run the whole pour at dt = 1/(fps·sub) and record one pose per video frame.
 * Marbles enter above the funnel in rows of `perRow`, one row every `rowEvery` steps, from a seeded rand().
 */
export function bake(RAPIER, { rand, seed = 16, n = 420, fps = 30, duration = 9.6, sub = 4, perRow = 6, rowEvery = 4 }) {
  const B = BOARD, P = PHYS, S = PX;
  const dt = 1 / (fps * sub);
  const world = new RAPIER.World({ x: 0, y: P.gravity * Math.sin(P.tilt) });
  world.timestep = dt;
  world.numSolverIterations = P.solverIterations;
  world.lengthUnit = P.lengthUnit;

  // ---- static geometry ----
  const wall = (desc) => world.createCollider(desc.setFriction(P.wall.friction).setRestitution(P.wall.restitution));
  const seg = (x0, y0, x1, y1) => wall(RAPIER.ColliderDesc.segment({ x: x0 * S, y: y0 * S }, { x: x1 * S, y: y1 * S }));
  const slab = (x, y, hw, hh) => wall(RAPIER.ColliderDesc.cuboid(hw * S, hh * S).setTranslation(x * S, y * S));
  for (const sd of [-1, 1]) {                    // funnel: hopper walls, the slopes, the neck lips (exact lines)
    seg(B.cx + sd * B.mouthHalf, B.mouthY - 200, B.cx + sd * B.mouthHalf, B.mouthY);
    seg(B.cx + sd * B.mouthHalf, B.mouthY, B.cx + sd * B.neckHalf, B.neckY);
    seg(B.cx + sd * B.neckHalf, B.neckY, B.cx + sd * B.neckHalf, B.lipY);
  }
  const wallH = (B.floorY + 20 - 80) / 2;
  slab(B.binL - 7, 80 + wallH, 7, wallH);        // side walls, inner faces at binL / binR
  slab(B.binR + 7, 80 + wallH, 7, wallH);
  slab(B.cx, B.floorY + 7, (B.binR - B.binL) / 2 + 20, 7);
  for (const [x, y] of pegs()) {
    world.createCollider(RAPIER.ColliderDesc.ball(B.pegR * S).setTranslation(x * S, y * S)
      .setFriction(P.pin.friction).setRestitution(P.pin.restitution));
  }
  const dv = dividers();
  for (let m = 1; m < dv.length - 1; m++) {      // dividers, capped with a round top so nothing balances on one
    slab(dv[m], (B.binTop + B.floorY) / 2, B.divW / 2, (B.floorY - B.binTop) / 2);
    wall(RAPIER.ColliderDesc.ball(B.divW / 2 * S).setTranslation(dv[m] * S, B.binTop * S));
  }

  // ---- the marbles and their schedule ----
  const r = rand(seed);
  const colour = new Uint8Array(n), coin = new Uint8Array(n);
  for (let i = 0; i < n; i++) { colour[i] = Math.floor(r() * 5); coin[i] = r() < 0.5 ? 1 : 0; }
  const t0Step = Math.round(0.12 / dt);
  const bodies = [];
  const spawn = () => {
    for (let j = 0; j < perRow && bodies.length < n; j++) {
      const x = B.cx + (j - (perRow - 1) / 2) * 34 + (r() - 0.5) * 10 + (r() - 0.5) * 50;
      const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x * S, (-24 - r() * 14) * S)
        .setLinvel((r() - 0.5) * 0.06, 0.32 + r() * 0.06)                     // m/s: already falling
        .setLinearDamping(P.airDrag).setAngularDamping(0.6).setCcdEnabled(true));
      world.createCollider(RAPIER.ColliderDesc.ball(B.marbleR * S).setDensity(P.marble.density)
        .setRestitution(P.marble.restitution).setFriction(P.marble.friction), body);
      bodies.push(body);
    }
  };

  // ---- backboard contact: lateral drag in the pin field (exponential, so it does not depend on dt) ----
  const keep = Math.exp(-P.backDrag * dt), v0 = P.backDragFrom;
  const backboard = () => {
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i], y = b.translation().y / S;
      if (y < B.pegY0 - 20 || y > B.binTop) continue;
      const v = b.linvel(), a = Math.abs(v.x);
      if (a > v0) b.setLinvel({ x: Math.sign(v.x) * (v0 + (a - v0) * keep), y: v.y }, true);
      // a marble balanced dead-centre on a pin (unstable, but exact in a solver) gets the small push a real
      // pin's imperfection would give it; its direction is a per-marble coin, so the bake stays deterministic
      else if (a < 0.003 && Math.abs(v.y) < 0.04) b.setLinvel({ x: (coin[i] ? 1 : -1) * 0.035, y: v.y }, true);
    }
  };

  // ---- step + record ----
  const frames = Math.round(duration * fps);
  const pose = new Float32Array((frames + 1) * n * 3).fill(NaN);   // NaN = not yet released
  const save = (f) => {
    const o = f * n * 3;
    for (let i = 0; i < bodies.length; i++) {
      const p = bodies[i].translation();
      pose[o + i * 3] = p.x / S; pose[o + i * 3 + 1] = p.y / S; pose[o + i * 3 + 2] = bodies[i].rotation();
    }
  };
  save(0);
  for (let s = 1; s <= frames * sub; s++) {
    if (s >= t0Step && (s - t0Step) % rowEvery === 0) spawn();
    backboard();
    world.step();
    if (s % sub === 0) save(s / sub);
  }
  world.free();
  return { pose, frames, n, colour, dt, sub };
}
