/*
 * 48 · 긁어서 드러나는 무지개 — scratch art (WebGL2).
 *
 * setup: art.js lays out the picture as ~340 stylus strokes (a whale with belly pleats and back hatching, its
 * spout, rolling wave curls, firework bursts flicked from their centres, stars) and schedules them on the hand's
 * own clock τ; ~10 000 wax crumbs are spawned along the stroke edges and piled at each lift-off. The video clock t
 * maps to τ through a time-lapse warp (real hand speed for the whale outline, then a steady fast-forward).
 * frame(t):
 *   1. scratch mask — every segment with τ0 ≤ τ(t) is drawn as an instanced capsule (the one under the point only
 *      up to the point) into an RGBA8 target with MAX blending: R = wax removed (ragged, chipped edge from
 *      world-space noise, specks left where the point skipped), G = groove depth. Redrawn from zero every frame.
 *   2. board — black wax coat (coating streaks, orange-peel, bevel and pushed-up lip from the mask's gradient and
 *      blur; Blinn–Phong sheen) over rainbow card; the cut wall shades the groove on the side away from the lamp.
 *   3. crumbs — instanced flakes, born when the point passes, flung by the brush (exponential slow-down, 1/60 s
 *      motion blur integrated in the fragment shader).
 *   4. tools — stylus (steel nib, ferrule, beech handle) and a goat-hair hake brush, each with a height-offset shadow.
 */
import { defineDemo, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';
import { buildArt, BOARD } from './art.js';
import { MASK_VS, MASK_FS, QUAD_VS, BOARD_FS, CRUMB_VS, CRUMB_FS, TOOL_FS } from './shaders.js';

const D = 10;
const TS = 0.55, TE = 6.05;                       // the point touches down / lifts after the last star
const PASSES = [                                  // the hake brush: three swipes, alternating
  { t0: 6.42, t1: 6.86, y: 392, x0: -220, x1: 1300 },
  { t0: 6.92, t1: 7.36, y: 1000, x0: 1300, x1: -220 },
  { t0: 7.42, t1: 7.86, y: 1560, x0: -220, x1: 1300 },
];
const zoomT = track([[0, 1.32], [2.1, 1.24, ease.outCubic], [3.5, 1.0, ease.inOutCubic], [8.9, 1.0], [D, 1.035]]);
const camT = track([[0, [500, 1085]], [2.1, [610, 1050], ease.outCubic], [3.5, [540, 960], ease.inOutCubic], [8.9, [540, 960]], [D, [540, 950]]]);
const lampT = track([[0, [1250, 120, 1000]], [7.95, [1250, 120, 1000]], [9.85, [-250, 1450, 850], ease.inOutCubic], [D, [-280, 1500, 850]]]);
const fadeT = track([[0, 0.0], [0.5, 1.0, ease.outCubic], [D - 0.2, 1.0], [D, 0.97]]);

defineDemo({
  id: '48-scratch-art',
  title: '긁어서 드러나는 무지개',
  tech: 'WebGL2 · 스크래치 페이퍼 (긁기 마스크 + 왁스 부스러기)',
  duration: D,
  background: '#070504',
  async setup({ canvas, W, H }) {
    const art = buildArt();
    // ---- the time-lapse warp τ(t): 1× until 2.6 s, then a steady fast-forward chosen so the last star ends at TE
    const DT = 1 / 1000, NT = Math.ceil(D / DT) + 1;
    const prof = (t, K) => (t < TS ? 0 : t < 2.6 ? 1 : t < 3.3 ? lerp(1, K, smooth((t - 2.6) / 0.7)) : K);
    const integ = (K, upto) => { let s = 0; for (let t = 0; t < upto; t += DT) s += prof(t + DT / 2, K) * DT; return s; };
    let lo = 1, hi = 200;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (integ(m, TE) < art.tauEnd) lo = m; else hi = m; }
    const K = (lo + hi) / 2;
    const tauTab = new Float64Array(NT);
    for (let i = 1; i < NT; i++) tauTab[i] = tauTab[i - 1] + prof((i - 0.5) * DT, K) * DT;
    const tauOf = (t) => { const x = clamp(t / DT, 0, NT - 1.001), i = Math.floor(x); return lerp(tauTab[i], tauTab[i + 1], x - i); };
    this.tauOf = tauOf; this.art = art;

    // ---- crumbs: which brush swipe hits each one, and how it is flung
    let sd = 4321;
    const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    const crumbs = art.crumbs.slice().sort((a, b) => a.tau - b.tau);
    const NC = crumbs.length, cinst = new Float32Array(NC * 12);
    crumbs.forEach((c, i) => {
      let hit = -1, vx = 0, vy = 0;
      for (const P of PASSES) {
        if (Math.abs(c.y - P.y) > 300) continue;
        const dir = Math.sign(P.x1 - P.x0), u = (c.x + 40 * dir - P.x0) / (P.x1 - P.x0);
        if (u < 0 || u > 1) continue;
        hit = P.t0 + u * (P.t1 - P.t0);
        const sp = Math.abs(P.x1 - P.x0) / (P.t1 - P.t0);
        const k = rnd() < 0.05 ? 0.04 + 0.2 * rnd() : 0.75 + 0.6 * rnd();     // a few stick, most fly
        vx = dir * sp * k; vy = (rnd() - 0.5) * 700 * k + (c.y - P.y) * 0.6 * k;
        break;
      }
      cinst.set([c.x, c.y, c.sx, c.sy, c.size, c.elong, c.rot, c.seed, c.tau, hit, vx, vy], i * 12);
    });
    const crumbTau = new Float32Array(crumbs.map((c) => c.tau));
    const segs = art.segs, NS = segs.length, sinst = new Float32Array(NS * 10);
    segs.forEach((s, i) => sinst.set(s, i * 10));
    const segTau = new Float32Array(segs.map((s) => s[6]));
    const bornBy = (arr, x) => { let a = 0, b = arr.length; while (a < b) { const m = (a + b) >> 1; if (arr[m] <= x) a = m + 1; else b = m; } return a; };

    // ---- GL
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false, alpha: false } });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (vs, fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const P = { mask: program(MASK_VS, MASK_FS), board: program(QUAD_VS, BOARD_FS), crumb: program(CRUMB_VS, CRUMB_FS), tool: program(QUAD_VS, TOOL_FS) };
    const maskT = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, maskT);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, W, H);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const maskFB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, maskFB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, maskT, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('mask framebuffer incomplete');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const corners = new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]);
    const instVAO = (data, layout, stride) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      let off = 0;
      layout.forEach((n, k) => {
        gl.enableVertexAttribArray(1 + k);
        gl.vertexAttribPointer(1 + k, n, gl.FLOAT, false, stride * 4, off * 4);
        gl.vertexAttribDivisor(1 + k, 1);
        off += n;
      });
      gl.bindVertexArray(null);
      return vao;
    };
    const segVAO = instVAO(sinst, [4, 4, 2], 10);
    const crumbVAO = instVAO(cinst, [4, 4, 4], 12);
    const qvao = gl.createVertexArray();
    gl.bindVertexArray(qvao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const first = art.stylusAt(0);
    this.render = (t) => {
      const tau = tauOf(t), zoom = zoomT(t), cam = camT(t), lamp = lampT(t), fade = fadeT(t);
      const common = (u) => {
        gl.uniform2f(u.u_res, W, H); gl.uniform2f(u.u_cam, cam[0], cam[1]); gl.uniform1f(u.u_zoom, zoom);
        gl.uniform1f(u.u_t, t); gl.uniform1f(u.u_tau, tau); gl.uniform1f(u.u_fade, fade); gl.uniform3f(u.u_lamp, lamp[0], lamp[1], lamp[2]);
      };
      // 1. the scratch mask, rebuilt from every segment drawn so far
      gl.bindFramebuffer(gl.FRAMEBUFFER, maskFB);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const ns = bornBy(segTau, tau);
      if (ns > 0) {
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.MAX);
        gl.useProgram(P.mask.p);
        common(P.mask.u);
        gl.bindVertexArray(segVAO);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, ns);
        gl.blendEquation(gl.FUNC_ADD);
        gl.disable(gl.BLEND);
      }
      // 2. the board
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(P.board.p);
      common(P.board.u);
      gl.uniform4f(P.board.u.u_board, BOARD.x0, BOARD.y0, BOARD.x1, BOARD.y1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, maskT);
      gl.uniform1i(P.board.u.u_mask, 0);
      gl.bindVertexArray(qvao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // 3. crumbs
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const nc = bornBy(crumbTau, tau);
      if (nc > 0) {
        gl.useProgram(P.crumb.p);
        common(P.crumb.u);
        gl.bindVertexArray(crumbVAO);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nc);
      }
      // 4. the tools
      const st = this.stylus(t, first);
      let bOn = 0, bc = [0, 0], bdir = [1, 0], bvel = 0;
      for (const Pp of PASSES) {
        if (t >= Pp.t0 - 0.05 && t <= Pp.t1 + 0.05) {
          const u = (t - Pp.t0) / (Pp.t1 - Pp.t0);
          bOn = 1; bc = [lerp(Pp.x0, Pp.x1, u), Pp.y + 8 * Math.sin(u * 7)]; bdir = [Math.sign(Pp.x1 - Pp.x0), 0]; bvel = Math.abs(Pp.x1 - Pp.x0) / (Pp.t1 - Pp.t0);
        }
      }
      gl.useProgram(P.tool.p);
      common(P.tool.u);
      const u = P.tool.u;
      gl.uniform2f(u.u_tip, st.x, st.y); gl.uniform2f(u.u_sdir, st.dx, st.dy); gl.uniform1f(u.u_lift, st.lift); gl.uniform1f(u.u_sOn, st.on);
      gl.uniform2f(u.u_bc, bc[0], bc[1]); gl.uniform2f(u.u_bdir, bdir[0], bdir[1]); gl.uniform1f(u.u_bOn, bOn); gl.uniform1f(u.u_bH, 24); gl.uniform1f(u.u_bvel, bvel);
      gl.bindVertexArray(qvao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(null);
    };
  },
  // the stylus at t: comes in, follows the strokes (lifting between them), leaves after the last one
  stylus(t, first) {
    const ang = 0.9 + 0.07 * Math.sin(t * 1.3) + 0.04 * Math.sin(t * 3.1 + 1);
    const dx = Math.cos(ang), dy = Math.sin(ang);
    if (t < TS) {
      const u = ease.outCubic(clamp((t - 0.05) / (TS - 0.05)));
      return { x: lerp(first.x + 700, first.x, u), y: lerp(first.y + 820, first.y, u), lift: 40 * (1 - u), dx, dy, on: t > 0.05 ? 1 : 0 };
    }
    const tau = this.tauOf(Math.min(t, TE));
    const s = this.art.stylusAt(tau);
    if (t <= TE) return { x: s.x, y: s.y, lift: 30 * s.lift, dx, dy, on: 1 };
    const u = ease.inCubic(clamp((t - TE) / 0.42));
    return { x: s.x + 760 * u, y: s.y + 900 * u, lift: 30 * s.lift + 50 * Math.sqrt(u), dx, dy, on: u < 1 ? 1 : 0 };
  },
  frame(t) {
    this.render(t);
  },
});
