/*
 * 66 · 빗속의 시 — a stone basin at dusk, seen from straight above. A poem is carved into its floor in vertical
 * columns (right to left) with worn gold in the grooves. Drizzle → a downpour buries the poem in ripples → the rain
 * stops and the water stills → one last drop falls on "이름" and its ring crosses the whole basin.
 *
 * setup(): the poem is laid out and rasterised (Song Myung), turned into a signed distance field and baked with the
 *          granite into a lit floor texture on the GPU; the branch is painted on a canopy plane (seen only in the
 *          reflection); the rain schedule is drawn from a seeded Poisson process.
 * frame(t): replay() advances the wave equation (540×960 RG32F ping-pong, 10 leapfrog sub-steps per frame) to
 *          round(t·30) — checkpoints are GPU copies once a second — then SURF → SCENE → mip bloom → FINISH.
 */
import { defineDemo, replay, track, ease } from '../_lib/stage.js';
import { fontReady, textAlpha, signedDistance } from '../_lib/type.js';
import { glKit } from './gl.js';
import { SIM, SURF, FLOOR, SCENE, FINISH, MAXD, MAXP } from './shaders.js';
import {
  W, H, CAM, CAM_H, CAN_H, DEPTH, ETA, POEM, FONT, layoutPoem, floorToScreen, drawPoem, paintSeal,
  paintCanopy, CAN_DOM, CAN_TEX, rainSchedule, FINAL_T, DROP_V, petalsAt,
} from './scene.js';

const D = 10, FPS = 30;
const NX = 540, NY = 960, CELL = 2;      // wave grid: one cell = 2 stage px
const SUB = 10, DTS = 1 / (FPS * SUB);   // c·dt/dx = 0.5 → ripples run 1 px per sub-step = 300 px/s
const C2 = 0.25, NU = 0.004, SPONGE = 0.06;   // ν: γ_eff = ν·k² — 0.021/step at the grid scale, 0.0025 at λ = 8 cells
const G = 17640;                         // gravity, px/s² (1080 px ≈ 60 cm)

const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const LC = norm([-0.1, -0.35, 0.93]);    // toward the light that reaches the floor (the bright part of the sky)
const LG = norm([-0.12, -0.5, 0.86]);    // toward the afterglow low over the far rim (glints)

// damping: light while it rains, strong once it stops (the water stills), light again so the last ring travels far
const gam = track([[0, 0.0024], [5.2, 0.0024], [5.9, 0.011], [6.6, 0.011], [7.25, 0.0015]]);
const lin = (p) => p;
const fade = track([[0, 0], [1.3, 1, ease.outCubic], [9.25, 1], [D, 0, lin]]);
const glow = track([[0, 1.0], [D, 0.6, lin]]);              // the afterglow fades as dusk deepens
const starI = track([[0, 0], [6.3, 0], [8.8, 1]]);           // the evening star comes out in the still water
const lightK = track([[0, 1.0], [D, 0.8, lin]]);
const causK = track([[0, 0.75], [D, 0.75]]);

defineDemo({
  id: '66-rain-poem',
  title: '빗속의 시',
  tech: 'GPU 2D 파동 방정식 · 굴절 · 프레넬 반사 · 수면 커스틱',
  duration: D,
  fps: FPS,
  background: '#05060b',
  async setup({ canvas, headless }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const K = glKit(gl);

    // ---- the poem → coverage → signed distance (px) → R16F texture for the floor bake
    await fontReady(FONT, POEM.join('') + '비');
    const lay = layoutPoem();
    const alpha = textAlpha(W, H, (ctx) => drawPoem(ctx, lay.glyphs));
    const sdf = signedDistance(alpha, W, H);
    const sdfT = K.texture(W, H, { data: sdf, internal: gl.R16F, format: gl.RED, type: gl.FLOAT });
    const paintT = K.texture(W, H, { data: paintSeal(lay.seal) });
    const canopyT = K.texture(CAN_TEX[0], CAN_TEX[1], { data: paintCanopy(), mip: true });

    const P = { sim: K.program(SIM), surf: K.program(SURF), floor: K.program(FLOOR), scene: K.program(SCENE), fin: K.program(FINISH) };
    const floorT = K.target(W, H, { kind: 'f16' });
    K.pass(P.floor, floorT, { sdf: sdfT, paint: paintT, stage: [W, H], Lc: LC });
    gl.deleteTexture(sdfT.tex);
    gl.deleteTexture(paintT.tex);

    let A = K.target(NX, NY, { kind: 'rg32' }), B = K.target(NX, NY, { kind: 'rg32' });
    const surfT = K.target(NX, NY, { kind: 'f16' });
    const sceneT = K.target(W, H, { kind: 'f16', mip: true });

    // ---- rain: impacts grouped by the sub-step they fall in
    const drops = rainSchedule(floorToScreen(lay.key));
    const bySub = new Map();
    for (const d of drops) {
      const k = Math.floor(d.t / DTS);
      if (!bySub.has(k)) bySub.set(k, []);
      bySub.get(k).push(d);
    }
    const finalDrop = drops.find((d) => d.final);

    const dropU = new Float32Array(16), px = new Float32Array(4);
    const R = replay({
      dt: 1 / FPS,
      every: 30,
      init: () => {
        for (const T of [A, B]) { K.bindTarget(T); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
      },
      step: (n) => {
        for (let s = 0; s < SUB; s++) {
          const k = n * SUB + s;
          const list = bySub.get(k) || [];
          dropU.fill(0);
          list.slice(0, 4).forEach((d, i) => dropU.set([d.x, d.y, d.a, d.s], i * 4));
          K.pass(P.sim, B, { S: A, C2, gam: gam(k * DTS), nu: NU, sponge: SPONGE, cell: CELL, stageH: H, drops: dropU, nd: Math.min(4, list.length) });
          [A, B] = [B, A];
        }
        // headless (CPU) verification only: let the software GPU finish here so long seeks don't pile up
        if (headless) { K.bindTarget(A); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, px); }
      },
      save: () => { const c = K.target(NX, NY, { kind: 'rg32' }); K.copy(A, c); return c; },
      load: (c) => K.copy(c, A),
    });
    this.R = R;

    const petalU = new Float32Array(MAXP * 4), petalTint = new Float32Array(MAXP), dropsU = new Float32Array(MAXD * 4);
    this.render = (t) => {
      K.pass(P.surf, surfT, { S: A, cell: CELL });

      const ps = petalsAt(t);
      ps.forEach((p, i) => { petalU.set([p.x, p.y, p.a, p.L], i * 4); petalTint[i] = p.tint; });
      // streaks for the last 60 ms of every fall, splashes for 250 ms after impact (the last drop has its own bead)
      let nd = 0;
      dropsU.fill(0);
      for (const d of drops) {
        const age = t - d.t;
        if (age < -0.06 || age > 0.25 || (d.final && age < 0)) continue;
        if (nd >= MAXD) break;
        dropsU.set([d.x, d.y, age, d.a / 1.5], nd * 4);
        nd++;
      }
      // the last drop falls from rest 0.45 s before impact (gravity), shown with a 1/60 s shutter
      const tau = FINAL_T - t;
      const fd = tau > 0 && tau < 0.45
        ? [finalDrop.x, finalDrop.y, 0.5 * G * tau * tau, 0.5 * G * (tau + 1 / 60) * (tau + 1 / 60)]
        : [0, 0, -1, -1];

      K.pass(P.scene, sceneT, {
        surf: surfT, floorT, canopy: canopyT,
        stage: [W, H], cam: CAM, camH: CAM_H, canH: CAN_H, depth: DEPTH, eta: ETA,
        glow: glow(t), starI: starI(t), lightK: lightK(t), reflK: 3.0, causK: causK(t),
        canDom: CAN_DOM, Lc: LC, Lg: LG,
        petal: petalU, petalT: petalTint, nPetal: ps.length,
        drop: dropsU, nDrop: nd, fdrop: fd, dropV: DROP_V,
      });
      K.mipmap(sceneT);
      K.pass(P.fin, null, { img: sceneT, stage: [W, H], frameNo: Math.round(t * FPS), fade: fade(t), expo: 1.0 });
    };
  },
  async frame(t) {
    await this.R.seek(t);
    this.render(t);
  },
});
