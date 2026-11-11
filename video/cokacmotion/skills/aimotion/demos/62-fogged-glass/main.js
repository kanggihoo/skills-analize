/*
 * 62 · 김 서린 창 — a window at night, from inside. Condensation creeps over the glass from the frame inward; an unseen
 * fingertip writes 보고 / 싶다 in it, and each stroke opens onto the sharp bokeh of the city. Water pushed aside beads
 * up along the stroke edges; the heavy beads break free and run, swallowing the drops in their way, leaving clear
 * trails. Then the glass mists over again — 보고 is gone, 싶다 stays, faint.
 *
 * setup(): Nanum Pen Script → skeleton → ordered, timed finger strokes (strokes.js); fog onset map + the droplet
 *          simulation baked at 60 Hz (drops.js); the city's bokeh baked on the GPU (sharp, through-a-drop) with its
 *          blur pyramid (half res σ≈14 px, quarter res σ≈51 px).
 * frame(t): the strokes/trails drawn up to t (instanced capsules, MAX blend, refog per stroke) → the droplets at t
 *          (instanced caps → height field) → composite (fog density × blur pyramid, veil, grain, refraction in
 *          the drops) → bloom/tone map. Everything per frame is read from the baked tables at t.
 */
import { defineDemo, track, ease, lerp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { glKit } from './gl.js';
import { BOKEH, DOWN, BLUR, WIPE_VS, WIPE_FS, DROP_VS, DROP_FS, COMP, FINISH, NLIGHT } from './shaders.js';
import { extractStrokes, timeStrokes } from './strokes.js';
import { fogMaps, simulateDrops, SIM_FPS, ONSET_T, ONSET_RISE } from './drops.js';

const D = 10, FPS = 30, W = 1080, H = 1920;
const FAMILY = 'Nanum Pen Script';
const LINES = [
  { text: '보고', cx: 520, cy: 700, word: 0 },
  { text: '싶다', cx: 580, cy: 1075, word: 1 },
];
const LINE_W = 600;              // target width of a written line (px)
const ROT = -0.045;              // the hand's baseline tilt (rad)
const WRITE = [1.8, 6.8];        // the finger writes in this window (s)
const FINGER_R = 19;             // fingertip radius (px)
const LENS_K = 2.9;              // drop lens: sample offset = −n·r·K (> 1/0.62 → the image inside is inverted)

const lin = (p) => p;
const fade = track([[0, 0], [0.7, 1, ease.outCubic], [9.35, 1], [D, 0, lin]]);
const par = track([[0, [-9, -5]], [D, [9, 3]]]);                       // slow drift: the city is far behind the glass
const shrink0 = track([[0, 1], [7.3, 1], [9.7, 0.4]]);                 // beads along 보고 dwindle as it fogs over
const shrink1 = track([[0, 1], [7.8, 1], [D, 0.85]]);

defineDemo({
  id: '62-fogged-glass',
  title: '김 서린 창',
  tech: '김 밀도장 · 물방울 입자(병합·흘러내림) · 굴절 법선 맵 · 보케',
  duration: D,
  fps: FPS,
  background: '#020306',
  async setup({ canvas }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const K = glKit(gl);

    // ---- the handwriting
    await fontReady(`400 100px "${FAMILY}"`, LINES.map((l) => l.text).join(''));
    const mc = document.createElement('canvas').getContext('2d');
    mc.font = `400 100px "${FAMILY}"`;
    const wMax = Math.max(...LINES.map((l) => mc.measureText(l.text).width));
    const size = Math.min(470, (LINE_W / wMax) * 100);
    const { strokes } = extractStrokes({ lines: LINES, family: FAMILY, size, rot: ROT, W, H });
    const { samples, end: writeEnd } = timeStrokes(strokes, { t0: WRITE[0], t1: WRITE[1], radius: FINGER_R });
    // the extraction must have produced a believable hand: every syllable written, sane amount of ink, on time
    const perGlyph = [0, 1, 2, 3].map((g) => strokes.filter((s) => s.glyph === g).length);
    const ink = strokes.reduce((a, s) => a + s.len, 0);
    if (perGlyph.some((c) => c < 1) || strokes.length < 6 || strokes.length > 60 || ink < 1500 || ink > 14000 || writeEnd > WRITE[1] + 0.4) {
      throw new Error(`stroke extraction looks wrong: ${strokes.length} strokes, per glyph ${perGlyph}, ${Math.round(ink)} px of ink, ends ${writeEnd.toFixed(2)} s`);
    }

    // ---- fog onset map (shared with the droplet sim) and the water on the glass
    const fm = fogMaps(W, H, 6202);
    const fogMapT = K.texture(fm.gw, fm.gh, { data: fm.rgba });
    const sim = simulateDrops({ samples, onsetAt: fm.onsetAt, W, H, D, seed: 6203 });
    this.stats = { strokes: strokes.length, ink: Math.round(ink), ...sim.stats };
    if (sim.stats.slides < 5 || sim.stats.drops < 500) throw new Error(`droplet bake looks wrong: ${JSON.stringify(sim.stats)}`);

    // ---- the city behind the glass, baked once: bokeh, through-a-drop image, blur pyramid
    const P = {
      bokeh: K.program(BOKEH), down: K.program(DOWN), blur: K.program(BLUR),
      wipe: K.program(WIPE_FS, WIPE_VS), drop: K.program(DROP_FS, DROP_VS), comp: K.program(COMP), fin: K.program(FINISH),
    };
    const bgC = K.target(W, H), bgD = K.target(W / 2, H / 2);
    K.pass(P.bokeh, bgC, { stage: [W, H], focus: 1.0, scale: 1 });
    K.pass(P.bokeh, bgD, { stage: [W, H], focus: 0.32, scale: 2 });
    const half = K.target(W / 2, H / 2), halfB = K.target(W / 2, H / 2), bgM = K.target(W / 2, H / 2);
    K.pass(P.down, half, { src: bgC });
    K.pass(P.blur, halfB, { src: half, dir: [2 / W, 0], sigma: 7 });
    K.pass(P.blur, bgM, { src: halfB, dir: [0, 2 / H], sigma: 7 });
    const q1 = K.target(W / 4, H / 4), q2 = K.target(W / 4, H / 4);
    K.pass(P.down, q1, { src: half });
    for (let i = 0; i < 2; i++) {
      K.pass(P.blur, q2, { src: q1, dir: [4 / W, 0], sigma: 9 });
      K.pass(P.blur, q1, { src: q2, dir: [0, 4 / H], sigma: 9 });
    }
    const bgF = q1;
    for (const T of [half, halfB, q2]) { gl.deleteTexture(T.tex); gl.deleteFramebuffer(T.fb); }

    // ---- instanced geometry: one unit quad, per-instance segments (static) and drops (rewritten each frame)
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const instVAO = (buf, attrs) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      for (const [loc, size, stride, off] of attrs) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off);
        gl.vertexAttribDivisor(loc, 1);
      }
      gl.bindVertexArray(null);
      return vao;
    };
    // finger segments between consecutive samples of a stroke: x0 y0 x1 y1 | t0 t1 radius word; then the drop trails
    const seg = [];
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1], b = samples[i];
      if (a.stroke !== b.stroke) continue;
      seg.push(a.x, a.y, b.x, b.y, a.t, Math.max(b.t, a.t + 1e-3), 0.5 * (a.r + b.r), b.word);
    }
    const wipeData = new Float32Array(seg.length + sim.trails.length);
    wipeData.set(seg, 0);
    wipeData.set(sim.trails, seg.length);
    const nWipe = wipeData.length / 8;
    const wipeBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wipeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, wipeData, gl.STATIC_DRAW);
    const wipeVAO = instVAO(wipeBuf, [[1, 4, 32, 0], [2, 4, 32, 16]]);

    const drops = sim.drops;
    const dropData = new Float32Array(drops.length * 4);
    const dropBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dropBuf);
    gl.bufferData(gl.ARRAY_BUFFER, dropData.byteLength, gl.DYNAMIC_DRAW);
    const dropVAO = instVAO(dropBuf, [[1, 4, 16, 0]]);

    const wipeT = K.target(W / 2, H / 2), dropT = K.target(W, H, { kind: 'rg16' });
    const sceneT = K.target(W, H, { mip: true });

    const al = new Float32Array(NLIGHT * 4), alc = new Float32Array(NLIGHT * 3);
    const setLight = (i, x, y, r, I, c) => { al.set([x, y, r, I], i * 4); alc.set(c, i * 3); };

    this.draw = (t) => {
      // 1) cleared by the finger and the running drops, up to t
      K.bindTarget(wipeT);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.MAX);
      gl.useProgram(P.wipe.p);
      K.uniforms(P.wipe, { stage: [W, H], t, rf0: 7.0, rfSpan: 2.4, rfLag: 0.22, keep: [1.0, 0.8, 1.0] });
      gl.bindVertexArray(wipeVAO);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nWipe);

      // 2) the droplets at t (60 Hz tables, interpolated)
      const f = t * SIM_FPS, k = Math.floor(f), u = f - k;
      const s0 = shrink0(t), s1 = shrink1(t);
      let n = 0;
      for (const d of drops) {
        const i = k - d.f0;
        if (i < 0 || i >= d.n) continue;
        const a = d.xyr, j = Math.min(i + 1, d.n - 1), p = i * 3, q = j * 3;
        let r = lerp(a[p + 2], a[q + 2], u);
        if (d.group === 0) r *= s0; else if (d.group === 1) r *= s1;
        if (r < 0.45) continue;
        const vy = (j > i ? a[q + 1] - a[p + 1] : i > 0 ? a[p + 1] - a[p - 2] : 0) * SIM_FPS;
        dropData[n * 4] = lerp(a[p], a[q], u);
        dropData[n * 4 + 1] = lerp(a[p + 1], a[q + 1], u);
        dropData[n * 4 + 2] = r;
        dropData[n * 4 + 3] = 1 + Math.min(0.55, Math.max(0, vy) / 500);
        n++;
      }
      K.bindTarget(dropT);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (n) {
        gl.bindBuffer(gl.ARRAY_BUFFER, dropBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, dropData, 0, n * 4);
        gl.useProgram(P.drop.p);
        K.uniforms(P.drop, { stage: [W, H] });
        gl.bindVertexArray(dropVAO);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
      }
      gl.bindVertexArray(null);
      gl.blendEquation(gl.FUNC_ADD);
      gl.disable(gl.BLEND);

      // 3) moving lights in the city: a car crossing below, tail lights the other way, a blinking mast light
      const cx = -140 + 150 * t, tx = 1240 - 112 * t;
      setLight(0, cx, 1424, 25, 1.7, [1.0, 0.86, 0.66]);
      setLight(1, cx + 62, 1427, 25, 1.7, [1.0, 0.86, 0.66]);
      setLight(2, tx, 1262, 20, 1.5, [1.0, 0.13, 0.08]);
      setLight(3, tx + 46, 1263, 20, 1.5, [1.0, 0.13, 0.08]);
      const ph = (t + 0.4) % 1.7;
      setLight(4, 872, 468, 15, 2.6 * Math.max(0, Math.sin(Math.PI * Math.min(1, ph / 0.42))), [1.0, 0.16, 0.1]);

      K.pass(P.comp, sceneT, {
        bgC, bgM, bgF, bgD, wipeT, dropT, fogMap: fogMapT,
        stage: [W, H], par: par(t), lamp: [190, 300],
        t, onsetT: ONSET_T, onsetRise: ONSET_RISE, lensK: LENS_K, fogK: 1.0,
        al, alc,
      });
      K.mipmap(sceneT);
      K.pass(P.fin, null, { img: sceneT, stage: [W, H], frameNo: Math.round(t * FPS), fade: fade(t) });
    };
  },
  frame(t) { this.draw(t); },
});
