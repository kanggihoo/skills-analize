/*
 * 49 · 돌아가는 조이트로프 — a zoetrope whose animation comes only from its geometry (WebGL2 ray tracing).
 *
 * setup: strip.js draws the 12 gallop drawings on a cream paper strip (Canvas 2D) → one texture, mipmapped,
 * wrapped round the inside of the drum below the slits. The drum's spin ω(t) (rev/s) is keyframed and integrated
 * into a table θ(t) once, so θ is a pure function of t.
 * frame(t): ONE full-screen pass (shader.js). Every pixel traces the scene analytically — table, turned plinth,
 * brass spindle, the drum (walnut body, black lacquered slit band, brass rims, 12 slits, black interior, the paper
 * strip) and the lamp's light through the open top and the slits — u_S times across the shutter interval
 * E = 1/30 s, with the drum at θ(t) + ω·(k/S − ½)·E for sample k, and averages them. The strip never changes;
 * what you see through the slits depends only on where the slits and the drawings are while the shutter is open.
 * At ω = 2.5 rev/s the drum turns exactly one slit pitch (30°) per 1/30 s: each exposure catches one pass of a
 * slit across every point of the wall, the scanned drawings stand still and the next one replaces the last — the
 * horse gallops. Slower, the slits sweep only part of the wall in an exposure: smeared bands and fragments.
 */
import { defineDemo, track, ease, clamp, lerp } from '../_lib/stage.js';
import { makeStrip } from './strip.js';
import { FS, VS } from './shader.js';

const D = 10;
const SHUTTER = 1 / 30;                 // 360° shutter at 30 fps: the eye-like long exposure
const LOCK = 2.5;                       // rev/s: one slit pitch (1/12 rev) per 1/30 s
const omegaT = track([[0, 0.05], [1.0, 0.12, ease.inOutCubic], [4.3, LOCK, ease.inOutCubic], [7.3, LOCK], [9.5, 0.07, ease.inOutCubic], [D, 0.05]]);
// camera: establishing shot → down to slit level, looking through the near slits at the far strip → pull back
const camPos = track([[0, [1.25, 2.95, 4.7]], [0.8, [1.15, 2.8, 4.45]], [3.7, [0.0, 1.56, 2.62], ease.inOutCubic], [7.4, [0.0, 1.56, 2.62]], [D, [-0.95, 2.35, 4.0], ease.inOutCubic]]);
const camTgt = track([[0, [0, 0.62, 0]], [0.8, [0, 0.64, 0]], [3.7, [0, 0.6, -1.0], ease.inOutCubic], [7.4, [0, 0.6, -1.0]], [D, [0, 0.66, 0], ease.inOutCubic]]);
const fadeT = track([[0, 0.0], [0.6, 1.0, ease.outCubic], [D - 0.25, 1.0], [D, 0.97]]);
// eye adaptation: the view through a spinning wall is mostly wall — open up as it spins
const gainT = (w) => 1.05 + 1.25 * clamp(w / LOCK) ** 1.3;

defineDemo({
  id: '49-zoetrope',
  title: '돌아가는 조이트로프',
  tech: '회전 원통 + 틈새 스트로보 · 실제 원리로 만든 움직임',
  duration: D,
  background: '#050403',
  async setup({ canvas, W, H, headless }) {
    // θ(t) = 2π ∫ ω dt, tabulated at 0.5 ms
    const DT = 0.0005, N = Math.ceil(D / DT) + 2, th = new Float64Array(N);
    for (let i = 1; i < N; i++) th[i] = th[i - 1] + 2 * Math.PI * omegaT((i - 0.5) * DT) * DT;
    const thetaAt = (t) => { const x = clamp(t / DT, 0, N - 1.001), i = Math.floor(x); return lerp(th[i], th[i + 1], x - i); };

    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false, alpha: false } });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    const u = {};
    const nu = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(prog, i); u[a.name] = gl.getUniformLocation(prog, a.name); }

    // the paper strip
    const strip = makeStrip();
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, strip);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const tanH = Math.tan((44 / 2) * Math.PI / 180);
    const maxS = headless ? 6 : 16;
    this.render = (t) => {
      const w = omegaT(t);                          // rev/s
      const omega = 2 * Math.PI * w;                // rad/s
      const sweepDeg = Math.abs(omega) * SHUTTER * 180 / Math.PI;
      const S = clamp(Math.ceil(sweepDeg / 3.0), 3, maxS);   // ~3° of drum turn per sub-frame sample
      const p = camPos(t), q = camTgt(t);
      const f = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], fl = Math.hypot(...f);
      f[0] /= fl; f[1] /= fl; f[2] /= fl;
      let r = [f[1] * 0 - f[2] * 1, f[2] * 0 - f[0] * 0, f[0] * 1 - f[1] * 0];   // f × up(0,1,0)
      const rl = Math.hypot(...r); r = r.map((v) => v / rl);
      const up = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
      gl.viewport(0, 0, W, H);
      gl.useProgram(prog);
      gl.uniform2f(u.u_res, W, H);
      gl.uniform3f(u.u_cp, p[0], p[1], p[2]); gl.uniform3f(u.u_cf, f[0], f[1], f[2]);
      gl.uniform3f(u.u_cr, r[0], r[1], r[2]); gl.uniform3f(u.u_cu, up[0], up[1], up[2]);
      gl.uniform1f(u.u_tanH, tanH);
      gl.uniform1f(u.u_theta, thetaAt(t) % (2 * Math.PI));
      gl.uniform1f(u.u_omega, omega);
      gl.uniform1f(u.u_shutter, SHUTTER);
      gl.uniform1f(u.u_gain, gainT(w));
      gl.uniform1f(u.u_fade, fadeT(t));
      gl.uniform1f(u.u_t, t);
      gl.uniform1i(u.u_S, S);
      gl.uniform3f(u.u_lamp, -1.8, 4.2, 2.4);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(u.u_strip, 0);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    };
  },
  frame(t) {
    this.render(t);
  },
});
