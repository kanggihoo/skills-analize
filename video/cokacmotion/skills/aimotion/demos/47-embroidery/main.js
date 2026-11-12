/*
 * 47 · 한 땀 한 땀 수놓은 꽃 — procedural hand embroidery (WebGL2, instanced stitches).
 *
 * setup: stitches.js turns the design (a long-and-short shaded rose, a satin cornflower, a bud, forget-me-nots,
 * satin leaves, stem-stitched stems, French-knot centres) into ~3000 individual stitches in working order, each
 * with a birth time from a "speeding hand" schedule (one stitch every half second at first, a thousand a second at
 * the peak). They go into ONE static instance buffer sorted by birth.
 * frame(t): (1) the height-shadow pass draws every born stitch (+ the needle and the working thread) offset along
 * the lamp direction by its height into an R8 buffer with MAX blending; (2) the linen pass draws the plain weave,
 * the drape outside the hoop, the birch ring and its brass clamp, shaded by that buffer; (3) the thread pass draws
 * the same instances as twisted plies with a Kajiya–Kay highlight (fibre tangent, not surface normal), ends that
 * dive into their holes, knots as coils, the needle as polished steel. A stitch in progress is laid from its
 * start toward its end (vertex shader, progress = (t − birth) / duration), lifted until it is pulled tight.
 * The needle and the working thread are computed from t each frame (needleAt) — nothing is carried between frames.
 */
import { defineDemo, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';
import { buildPattern, HOOP, TW } from './stitches.js';
import { THREAD_VS, THREAD_FS, SHADOW_FS, QUAD_VS, FABRIC_FS } from './shaders.js';

const D = 10;
const T0 = 0.6, TMAIN = 5.55;            // the main stitching window
const TK0 = 5.7, TK1 = 6.85;             // French knots
const T_SNIP = 7.0, T_PARK = 7.5, T_IN = 7.85;
const LF = 150;                           // needle length (px, as seen from above)
const PARK = [748, 1172];
const FL = 16;                            // floats per instance

// ---------- the working schedule: rate(i) = r0·e^{k t}, capped (a hand that speeds up, then keeps a steady pace)
function schedule(main, knots) {
  const r0 = 1.9, k = 2.3, n = main.length, span = TMAIN - T0;
  const total = (rm) => { const t1 = Math.log(rm / r0) / k; return (rm - r0) / k + rm * Math.max(0, span - t1); };
  let lo = r0 * 1.01, hi = 1e6;
  for (let i = 0; i < 80; i++) { const m = Math.sqrt(lo * hi); if (total(m) < n) lo = m; else hi = m; }
  const rm = lo, c1 = (rm - r0) / k, t1 = Math.log(rm / r0) / k;
  main.forEach((s, i) => {
    s.birth = i < c1 ? T0 + Math.log(1 + (i * k) / r0) / k : T0 + t1 + (i - c1) / rm;
    s.rate = Math.min(r0 + k * i, rm);
    s.dur = clamp(0.72 / s.rate, 1 / 50, 0.4);
  });
  const nk = knots.length;
  knots.forEach((s, j) => {
    s.birth = TK0 + (TK1 - TK0) * Math.pow(j / Math.max(nk - 1, 1), 0.85);
    s.rate = nk / (TK1 - TK0);
    s.dur = 0.22;
  });
}

// ---------- story
const zoomT = track([[0, 2.9], [1.9, 2.55, ease.outCubic], [4.7, 1.0, ease.inOutCubic], [9.0, 1.0], [D, 1.05]]);
const lampT = track([[0, [-260, 140, 980]], [7.0, [-260, 140, 980]], [9.1, [1380, 560, 430], ease.inOutCubic], [D, [1330, 640, 470]]]);
const sheenT = track([[0, 1.0], [7.0, 1.0], [7.7, 1.75], [9.2, 1.55], [D, 1.35]]);
const fadeT = track([[0, 0.0], [0.55, 1.0, ease.outCubic], [D - 0.25, 1.0], [D, 0.96]]);

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const scl = (a, k) => [a[0] * k, a[1] * k];
const lerpv = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

defineDemo({
  id: '47-embroidery',
  title: '한 땀 한 땀 수놓은 꽃',
  tech: '절차적 자수 · 땀 경로 + 실 광택 셰이더',
  duration: D,
  background: '#140f0a',
  async setup({ canvas, W, H }) {
    const { main, knots, cut } = buildPattern();
    schedule(main, knots);
    const ALL = [...main, ...knots];
    this.ALL = ALL;

    // ---- static instances: threads lying on the cloth (always there), then every stitch in working order
    const statics = [];
    for (const th of cut) {
      const pitch = Math.max((th.w / 2) * 2.4, 1.2);
      for (const sg of th.segs) statics.push({ a: sg.a, b: sg.b, w: th.w, birth: -10, dur: 1, type: 3, col: th.col, seed: sg.s / pitch / 7, h0: -14, ns: 2, tw: 0.45, h1: -14 });
    }
    let sd = 99;
    const srnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (const s of ALL) statics.push({ a: s.a, b: s.b, w: s.w, birth: s.birth, dur: s.dur, type: s.kind, col: s.col, seed: srnd(), h0: s.h, ns: s.strands, tw: s.twist, h1: s.h });
    const N = statics.length;
    const inst = new Float32Array(N * FL);
    statics.forEach((s, i) => inst.set([s.a[0], s.a[1], s.b[0], s.b[1], s.w, s.birth, s.dur, s.type, s.col[0], s.col[1], s.col[2], s.seed, s.h0, s.ns, s.tw, s.h1], i * FL));
    const births = new Float32Array(statics.map((s) => s.birth));
    const bornBy = (t) => { let lo = 0, hi = N; while (lo < hi) { const m = (lo + hi) >> 1; if (births[m] <= t) lo = m + 1; else hi = m; } return lo; };
    const allBirth = new Float32Array(ALL.map((s) => s.birth));
    this.startedBy = (t) => { let lo = 0, hi = ALL.length; while (lo < hi) { const m = (lo + hi) >> 1; if (allBirth[m] <= t) lo = m + 1; else hi = m; } return lo; };

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
    const P = {
      shadow: program(THREAD_VS(true), SHADOW_FS),
      thread: program(THREAD_VS(false), THREAD_FS),
      fabric: program(QUAD_VS, FABRIC_FS),
    };
    // shadow height buffer (R8, max-blended)
    const shT = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shT);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R8, W, H);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const shFB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shFB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shT, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('shadow framebuffer incomplete');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const quadCorners = new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]);
    const makeVAO = (data, usage) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, quadCorners, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      for (let a = 0; a < 4; a++) {
        gl.enableVertexAttribArray(1 + a);
        gl.vertexAttribPointer(1 + a, 4, gl.FLOAT, false, FL * 4, a * 16);
        gl.vertexAttribDivisor(1 + a, 1);
      }
      gl.bindVertexArray(null);
      return { vao, buf };
    };
    const ST = makeVAO(inst, gl.STATIC_DRAW);
    const DYN_MAX = 96;
    const dyn = new Float32Array(DYN_MAX * FL);
    const DY = makeVAO(dyn, gl.DYNAMIC_DRAW);
    const qvao = gl.createVertexArray();
    gl.bindVertexArray(qvao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // camera: starts close on the first stitches at the rose's petal edge
    const c0 = [0, 0];
    for (let i = 0; i < 6; i++) { c0[0] += main[i].a[0] / 6; c0[1] += main[i].a[1] / 6; }
    const c1 = [c0[0] + 22, c0[1] + 38];
    const camT = track([[0, c0], [1.9, c1, ease.outCubic], [4.7, [540, 960], ease.inOutCubic], [9.0, [540, 960]], [D, [556, 930]]]);

    this.render = (t) => {
      const zoom = zoomT(t), cam = camT(t), lamp = lampT(t);
      const lc = [lamp[0] - HOOP.c[0], lamp[1] - HOOP.c[1], lamp[2]];
      const ll = Math.hypot(...lc);
      const Lc = lc.map((v) => v / ll);
      const nDyn = this.buildDynamic(t, dyn, FL, DYN_MAX);
      gl.bindBuffer(gl.ARRAY_BUFFER, DY.buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn, 0, nDyn * FL);
      const nSt = bornBy(t);
      const common = (u) => {
        gl.uniform2f(u.u_res, W, H); gl.uniform2f(u.u_cam, cam[0], cam[1]); gl.uniform2f(u.u_hoopC, HOOP.c[0], HOOP.c[1]);
        gl.uniform1f(u.u_zoom, zoom); gl.uniform1f(u.u_t, t); gl.uniform1f(u.u_amb, 0.16); gl.uniform1f(u.u_sheen, sheenT(t)); gl.uniform1f(u.u_fade, fadeT(t));
        gl.uniform3f(u.u_lamp, lamp[0], lamp[1], lamp[2]); gl.uniform3f(u.u_lampCol, 1.05, 0.97, 0.86); gl.uniform3f(u.u_Lc, Lc[0], Lc[1], Lc[2]);
      };
      const drawInstances = (pr) => {
        gl.bindVertexArray(ST.vao);
        if (nSt > 0) gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nSt);
        gl.bindVertexArray(DY.vao);
        if (nDyn > 0) gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nDyn);
        gl.bindVertexArray(null);
      };
      // 1. heights → shadow buffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, shFB);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.MAX);
      gl.useProgram(P.shadow.p);
      common(P.shadow.u);
      drawInstances();
      gl.blendEquation(gl.FUNC_ADD);
      gl.disable(gl.BLEND);
      // 2. the linen and the hoop
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(P.fabric.p);
      common(P.fabric.u);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, shT);
      gl.uniform1i(P.fabric.u.u_sh, 0);
      gl.bindVertexArray(qvao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // 3. threads, knots, needle
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(P.thread.p);
      common(P.thread.u);
      gl.uniform1i(P.thread.u.u_sh, 0);
      drawInstances();
      gl.disable(gl.BLEND);
    };
  },

  // ---------- the needle and the working thread at time t (pure function of t)
  needleRaw(t) {
    const ALL = this.ALL, k = this.startedBy(t) - 1;
    if (k < 0) {
      const nx = ALL[0], g = clamp((t - (nx.birth - 0.5)) / 0.5);
      return { tip: nx.a, hidden: LF * (1 - smooth(g)), lift: 0, hole: nx.a, holeZ: 0, s: nx, rate: 0 };
    }
    const s = ALL[k], p = (t - s.birth) / s.dur;
    let ex;
    if (p < 1) {
      if (s.kind === 1) {
        const ang = p * 4 * Math.PI, r = 7 * (1 - p);
        ex = { tip: add(s.a, [Math.cos(ang) * r, Math.sin(ang) * r]), hidden: 0, lift: 3, hole: s.a, holeZ: 2, s };
      } else {
        const q = lerpv(s.a, s.b, p);
        ex = { tip: q, hidden: 0, lift: 2.5, hole: q, holeZ: 5 * (1 - p), s };
      }
    } else {
      const nx = ALL[k + 1], g0 = s.birth + s.dur, g1 = nx ? nx.birth : g0 + 0.4;
      const g = clamp((t - g0) / Math.max(g1 - g0, 1e-6));
      if (g < 0.5 || !nx) ex = { tip: s.b, hidden: smooth(g * 2) * 0.55 * LF, lift: 0, hole: s.b, holeZ: 0, s };
      else ex = { tip: nx.a, hidden: smooth((1 - g) * 2) * 0.55 * LF, lift: 0, hole: nx.a, holeZ: 0, s: nx };
    }
    // at speed the eye cannot follow single stitches: the needle hovers over the last few, bobbing in and out
    const wf = smooth((s.rate - 4) / 9);
    if (wf > 0) {
      const Wn = clamp(Math.round(s.rate * 0.035), 2, 36);
      const c = [0, 0];
      let n = 0;
      for (let j = Math.max(0, k - Wn + 1); j <= k; j++) { c[0] += ALL[j].b[0]; c[1] += ALL[j].b[1]; n++; }
      const tipF = scl(c, 1 / n);
      ex.tip = lerpv(ex.tip, tipF, wf);
      ex.hidden = lerp(ex.hidden, LF * (0.24 + 0.14 * Math.sin(t * 29) * Math.sin(t * 7.3 + 1)), wf);
      ex.lift = lerp(ex.lift, 0, wf);
      if (wf > 0.5) { ex.hole = s.b; ex.holeZ = 0; }
    }
    ex.rate = s.rate;
    return ex;
  },
  needleAt(t) {
    const ang0 = 0.95 + 0.08 * Math.sin(t * 1.1) + 0.05 * Math.sin(t * 2.6 + 1.0);
    if (t < T_SNIP) {
      const n = this.needleRaw(t);
      return { ...n, ang: ang0, thread: true, col: n.s.col };
    }
    const n0 = this.needleRaw(T_SNIP - 1e-4);
    const col = n0.s.col;
    if (t < T_PARK) {
      const u = ease.inOutCubic(clamp((t - T_SNIP) / (T_PARK - T_SNIP)));
      return { tip: lerpv(n0.tip, PARK, u), hidden: lerp(n0.hidden, 0, smooth(u * 3)), lift: 46 * Math.sin(Math.PI * u), ang: ang0, thread: false, col };
    }
    const u = ease.inOutCubic(clamp((t - T_PARK) / (T_IN - T_PARK)));
    return { tip: PARK, hidden: 0.36 * LF * u, lift: 0, ang: ang0, thread: false, col };
  },
  buildDynamic(t, dyn, FLn, MAX) {
    let n = 0;
    const put = (a, b, w, type, col, seed, h0, ns, tw, h1) => {
      if (n >= MAX) return;
      dyn.set([a[0], a[1], b[0], b[1], w, -10, 1, type, col[0], col[1], col[2], seed, h0, ns, tw, h1], n * FLn);
      n++;
    };
    const nd = this.needleAt(t);
    if (nd.hidden >= LF - 0.5) return 0;
    const ed = [Math.cos(nd.ang), Math.sin(nd.ang)], pd = [-ed[1], ed[0]];
    const Lvis = LF - nd.hidden;
    const eye = add(nd.tip, scl(ed, Lvis - 12));
    const hTip = nd.lift, hEye = nd.lift + 64 * (Lvis / LF);
    // the thread, as a polyline in 3D → loose-thread instances with continuous ply phase
    const pitch = Math.max((TW / 2) * 2.4, 1.2);
    let acc = 0;
    const rope = (pts) => {
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1];
        put([a[0], a[1]], [b[0], b[1]], TW, 3, nd.col, acc / pitch / 7, a[2], 2, 0.45, b[2]);
        acc += Math.hypot(b[0] - a[0], b[1] - a[1]);
      }
    };
    const bezier3 = (p0, p1, p2, m) => {
      const out = [];
      for (let i = 0; i <= m; i++) { const s = i / m, u = 1 - s; out.push([0, 1, 2].map((j) => u * u * p0[j] + 2 * u * s * p1[j] + s * s * p2[j])); }
      return out;
    };
    const E3 = [eye[0], eye[1], hEye - TW * 0.5];
    if (nd.thread && nd.hole) {
      const H3 = [nd.hole[0], nd.hole[1], nd.holeZ];
      const dx = E3[0] - H3[0], dy = E3[1] - H3[1], dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const slack = 10 + 0.22 * dist, side = [-dy / dist, dx / dist];
        const M3 = [(H3[0] + E3[0]) / 2 + side[0] * slack, (H3[1] + E3[1]) / 2 + side[1] * slack, E3[2] * 1.15 + 6];
        rope(bezier3(H3, M3, E3, 22));
      }
    }
    // the short end through the eye, and (when cut) the long tail falling onto the cloth
    rope(bezier3(E3, [E3[0] + ed[0] * 22 + pd[0] * 6, E3[1] + ed[1] * 22 + pd[1] * 6, E3[2] + 4], [E3[0] + ed[0] * 34 + pd[0] * 18, E3[1] + ed[1] * 34 + pd[1] * 18, E3[2] * 0.55], 5));
    if (!nd.thread) {
      acc = 0;
      rope(bezier3(E3, [E3[0] - pd[0] * 40 + ed[0] * 30, E3[1] - pd[1] * 40 + ed[1] * 30, E3[2] * 0.7], [E3[0] - pd[0] * 70 + ed[0] * 110, E3[1] - pd[1] * 70 + ed[1] * 110, -12], 14));
    }
    // the needle last (over its thread): A = where it leaves the cloth (or its point), B = eye end
    put(nd.tip, add(nd.tip, scl(ed, Lvis)), 5.2, 2, [0.6, 0.6, 0.62], 0, hTip, 1, nd.hidden, hTip + 64 * (Lvis / LF));
    return n;
  },
  frame(t) {
    this.render(t);
  },
});
