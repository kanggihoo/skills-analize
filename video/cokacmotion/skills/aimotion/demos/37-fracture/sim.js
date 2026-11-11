/*
 * sim.js — what each shard does once its cracks have opened, and the Rapier2D bake of the in-plane motion.
 *
 * The 2D world is the plane of the pane (we look at it face-on, gravity points down the screen); 1 px = 1 mm.
 * Shards come in five kinds:
 *   HELD   touches the frame: the glazing putty keeps it (a fixed collider — falling glass lands on it)
 *   LATE   a held tooth that slips out of the putty later and falls (kinematic → dynamic at its release time)
 *   FALL   free in the plane: gravity, a small outward kick from the elastic energy, collides with everything
 *   LOOSE  free and drifting out of the plane (no 2D contacts: it is no longer in the pane's plane)
 *   BLOWN  the punched-out centre: carried out of the plane by the ball (vz up to ~12 m/s), tumbling
 * Depth z and the out-of-plane tilt are closed-form (z = vz·s, tilt = ω·s or a damped wobble); the in-plane
 * pose (x, y, angle) of every free shard is integrated by Rapier at a fixed dt and stored per step.
 * Between a shard's crack-release time (< 1 ms) and the start of the bake it moves ballistically, in closed form.
 */
export const KIND = { HELD: 0, FALL: 1, LOOSE: 2, BLOWN: 3, LATE: 4 };
export const G = 9810;                       // px/s² (9.81 m/s² at 1 px = 1 mm)

export function plan(frac, { rand, seed, impact, lateTimes }) {
  const rnd = rand(seed);
  const [ix, iy] = impact;
  const P = frac.cells.map((c) => {
    const dx = c.cx - ix, dy = c.cy - iy, d = c.d;
    const ux = d > 1e-6 ? dx / d : 1, uy = d > 1e-6 ? dy / d : 0;
    const p = { kind: KIND.HELD, vx: 0, vy: 0, w: 0, vz: 0, axis: rnd() * Math.PI, tiltRate: 0, tiltAmp: 0, rel: c.rel / 1000, hash: rnd() };
    const Rb = 104 + 46 * rnd(), u = rnd(), v = rnd(), q = rnd(), r = rnd(), s = rnd();
    const turn = (u - 0.5) * 0.6, cu = Math.cos(turn), su = Math.sin(turn);
    const dirx = ux * cu - uy * su, diry = ux * su + uy * cu;
    if (d < Rb) {                                                   // punched out with the ball
      const sp = (0.6 + 2.4 * v) * (1 - 0.45 * d / Rb) * 1000;
      p.kind = KIND.BLOWN;
      p.vx = dirx * sp; p.vy = diry * sp;
      p.vz = (2.5 + 9 * (1 - d / Rb) * (0.5 + 0.5 * q)) * 1000;
      p.w = (r - 0.5) * 2 * (6 + 34 * s);
      p.tiltRate = (rnd() - 0.5) * 2 * (10 + 45 * rnd());
    } else if (c.frameLen > 0) {
      p.kind = KIND.HELD;
    } else {
      const sp = (0.1 + 0.9 * Math.exp(-(d - 110) / 230)) * (0.5 + 0.7 * v) * 1000;
      p.vx = dirx * sp; p.vy = diry * sp;
      p.w = (r - 0.5) * 2 * (0.4 + 3.5 * s) * Math.min(1.5, 70 / Math.sqrt(c.area));
      if (q < (d < 330 ? 0.38 : 0.12)) {
        p.kind = KIND.LOOSE;
        p.vz = (0.3 + 1.5 * rnd()) * 1000;
        p.tiltRate = (rnd() - 0.5) * 2 * (3 + 9 * rnd());
      } else {
        p.kind = KIND.FALL;
        p.tiltAmp = 0.06 + 0.24 * rnd();
        p.tiltRate = 5 + 12 * rnd();
      }
    }
    return p;
  });
  // teeth hanging from the head of the frame by a short grip slip out later: those right above the hole first
  // (then the upper side teeth); a side tooth low down would only settle onto the tooth under it
  const C = frac.cells, ok = (i) => P[i].kind === KIND.HELD && !C[i].onBottom && C[i].area > 1500 && C[i].frameLen < 1.4 * Math.sqrt(C[i].area);
  const top = C.map((c, i) => i).filter((i) => ok(i) && C[i].onTop).sort((a, b) => Math.abs(C[a].cx - ix) - Math.abs(C[b].cx - ix));
  const side = C.map((c, i) => i).filter((i) => ok(i) && !C[i].onTop && C[i].cy < iy - 80).sort((a, b) => C[a].d - C[b].d);
  const cand = [...top, ...side];
  cand.slice(0, lateTimes.length).forEach((i, k) => {
    const p = P[i];
    p.kind = KIND.LATE; p.rel = lateTimes[k];
    p.w = (rnd() - 0.5) * 1.6; p.tiltAmp = 0.06 + 0.08 * rnd(); p.tiltRate = 4 + 6 * rnd();
  });
  return P;
}

/** in-plane rigid-body motion of every shard from tau0 to tau1 (s), one pose (x, y, angle) per step */
export function bake(RAPIER, frac, P, { dt, tau0, tau1, bounds }) {
  const S = 0.001;                                          // metres per px
  const [bx0, by0, bx1, by1] = bounds;
  const world = new RAPIER.World({ x: 0, y: G * S });
  world.timestep = dt;
  world.lengthUnit = 0.03;                                  // shards are centimetres, not metres
  world.numSolverIterations = 6;
  const GP = (1 << 16) | 1;                                 // in the pane's plane: collides with the plane
  const GN = (2 << 16) | 0;                                 // out of the plane: collides with nothing
  const frameCol = (hw, hh, x, y) => world.createCollider(RAPIER.ColliderDesc.cuboid(hw * S, hh * S)
    .setTranslation(x * S, y * S).setFriction(0.6).setRestitution(0.05).setCollisionGroups(GP));
  frameCol((bx1 - bx0) / 2 + 120, 40, (bx0 + bx1) / 2, by1 + 40);   // bottom channel
  frameCol(40, (by1 - by0) / 2 + 120, bx0 - 40, (by0 + by1) / 2);   // jambs
  frameCol(40, (by1 - by0) / 2 + 120, bx1 + 40, (by0 + by1) / 2);
  frameCol((bx1 - bx0) / 2 + 120, 40, (bx0 + bx1) / 2, by0 - 40);   // head

  const { cells, VX, VY } = frac, n = cells.length;
  const bodies = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    const c = cells[i], p = P[i];
    // collider: the straight Voronoi polygon, inset 1.2 mm so neighbours start apart
    const pts = new Float32Array(c.ring.length * 2);
    c.ring.forEach((v, k) => {
      let lx = VX[v] - c.cx, ly = VY[v] - c.cy;
      const l = Math.hypot(lx, ly);
      if (l > 3) { lx -= (lx / l) * 1.2; ly -= (ly / l) * 1.2; }
      pts[k * 2] = lx * S; pts[k * 2 + 1] = ly * S;
    });
    const free = p.kind === KIND.BLOWN || p.kind === KIND.LOOSE;
    let cd = RAPIER.ColliderDesc.convexHull(pts);
    if (!cd) cd = RAPIER.ColliderDesc.ball(Math.max(1, Math.sqrt(c.area / Math.PI) * 0.8) * S);
    cd.setDensity(10).setFriction(0.45).setRestitution(0.12).setCollisionGroups(free ? GN : GP);   // 10 kg/m²: 4 mm float glass
    if (p.kind === KIND.HELD) { world.createCollider(cd.setTranslation(c.cx * S, c.cy * S)); continue; }
    let x = c.cx, y = c.cy, a = 0, vx = 0, vy = 0, w = 0;
    if (p.kind !== KIND.LATE) {
      const s = Math.max(0, tau0 - p.rel);
      x += p.vx * s; y += p.vy * s + 0.5 * G * s * s; a = p.w * s;
      vx = p.vx; vy = p.vy + G * s; w = p.w;
    }
    const desc = (p.kind === KIND.LATE ? RAPIER.RigidBodyDesc.kinematicPositionBased() : RAPIER.RigidBodyDesc.dynamic())
      .setTranslation(x * S, y * S).setRotation(a).setLinvel(vx * S, vy * S).setAngvel(w)
      .setLinearDamping(0.04).setAngularDamping(0.15).setCcdEnabled(!free);
    const body = world.createRigidBody(desc);
    world.createCollider(cd, body);
    bodies[i] = body;
  }

  const steps = Math.ceil((tau1 - tau0) / dt);
  const pose = new Float32Array((steps + 1) * n * 3);
  const rec = (k) => {
    const o = k * n * 3;
    for (let i = 0; i < n; i++) {
      const b = bodies[i];
      if (!b) { pose[o + i * 3] = cells[i].cx; pose[o + i * 3 + 1] = cells[i].cy; pose[o + i * 3 + 2] = 0; continue; }
      const t = b.translation();
      pose[o + i * 3] = t.x / S; pose[o + i * 3 + 1] = t.y / S; pose[o + i * 3 + 2] = b.rotation();
    }
  };
  rec(0);
  const late = P.map((p, i) => (p.kind === KIND.LATE ? i : -1)).filter((i) => i >= 0);
  const released = new Set();
  for (let k = 1; k <= steps; k++) {
    const now = tau0 + (k - 1) * dt;
    for (const i of late) {
      if (released.has(i) || now < P[i].rel) continue;
      released.add(i);
      const b = bodies[i];
      b.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
      b.setLinvel({ x: 0, y: 0.05 }, true);
      b.setAngvel(P[i].w, true);
    }
    world.step();
    rec(k);
  }
  world.free();
  return { pose, steps, n, dt, tau0 };
}
