/*
 * 22 · 여름날의 8mm 필름 — a Super 8 home movie, shot and projected.
 *   1. scene.js renders the summer beach as linear radiance for ONE film frame (18 fps: the picture only changes
 *      every 1/18 s; camera moves, kite, waves, glitter all step with the frame index).
 *   2. a 5-level pyramid of the over-threshold exposure gives the halation glow.
 *   3. film.js turns it into a projected frame: weave, reversal curve, dyes, grain, dust, scratches, fog, gate, lamp.
 * Both 1 and 2 depend only on the frame index n, so they are re-rendered only when n changes (same pixels either way).
 */
import { defineDemo, track, ease, clamp, lerp, ramp } from '../_lib/stage.js';
import { SCENE_FS, SUN_P, KITE_H, planeDir } from './scene.js';
import { FILM_FS, DOWN_FS, UP_FS, FS_VS } from './film.js';

const D = 10, FPS = 18;
const SW = 720, SH = 1118;                         // the film frame's resolution (≈ what Super 8 resolves)
const C = { PITCH: 1520, IMG_HW: 470, IMG_HH: 730, GATE_X: 575, GATE_Y: 862, K_IMG: 10, KB0: 127, KB1: 144 };
const END_N = 163;                                 // the tail of the film passes the gate on this projected frame
const T_OFF = 9.42;                                // the lamp is switched off

// ---------- deterministic per-frame randomness ----------
function hash1(n, s = 0) {
  let x = (Math.imul(n | 0, 374761393) + Math.imul(s | 0, 668265263) + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
/** smooth value noise in [-1, 1] */
function sn(x, s) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return 2 * lerp(hash1(i, s), hash1(i + 1, s), u) - 1;
}
/** Catmull–Rom (Hermite with neighbour tangents) through [[t, v | [v…]], …] — smooth velocity through keys */
function spline(keys) {
  const N = keys.length;
  const comp = (fn) => (Array.isArray(keys[0][1]) ? keys[0][1].map((_, j) => fn(j)) : fn(-1));
  const val = (k, j) => (j < 0 ? keys[k][1] : keys[k][1][j]);
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[N - 1][0]) return keys[N - 1][1];
    let i = 0;
    while (keys[i + 1][0] < t) i++;
    const a = Math.max(i - 1, 0), b = Math.min(i + 2, N - 1);
    const t0 = keys[i][0], t1 = keys[i + 1][0], h = t1 - t0, u = (t - t0) / h;
    const u2 = u * u, u3 = u2 * u;
    return comp((j) => {
      const p0 = val(i, j), p1 = val(i + 1, j);
      const m0 = ((p1 - val(a, j)) / (t1 - keys[a][0])) * h;
      const m1 = ((val(b, j) - p0) / (keys[b][0] - t0)) * h;
      return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
    });
  };
}

// ---------- the camera operator (in scene time = film frame / 18) ----------
const YAW = spline([[0, -0.1], [1.5, -0.09], [3.0, -0.03], [4.6, 0.1], [6.2, 0.24], [7.6, 0.27], [10, 0.29]]);
const PITCH = spline([[0, 0.04], [1.5, 0.05], [3.0, 0.08], [4.6, 0.17], [6.2, 0.3], [7.6, 0.32], [10, 0.33]]);
const FOV = track([[0, 0.4], [2.8, 0.4], [5.4, 0.47, ease.inOutCubic], [10, 0.47]]);             // a slow power zoom out
const EXPO = track([[0, 1.7], [0.6, 1.7], [1.5, 1.0, ease.outCubic], [4.4, 1.0], [6.0, 0.62, ease.inOutCubic], [7.2, 0.58], [10, 0.6]]);   // the electric eye
const KITE = spline([[0, [-0.27, -0.03]], [1.6, [-0.23, 0.02]], [3.0, [-0.15, 0.04]], [4.6, [-0.01, 0.08]], [6.3, [0.14, 0.14]], [7.6, [0.21, 0.22]], [10, [0.27, 0.3]]]);

function kiteAt(tau) {
  const b = KITE(tau);
  const x = b[0] + 0.012 * Math.sin(tau * 1.7 + 0.5) + 0.006 * Math.sin(tau * 3.9);
  const y = b[1] + 0.01 * Math.sin(tau * 2.3 + 1.1) + 0.005 * Math.sin(tau * 4.7);
  const vx = (KITE(tau + 0.05)[0] - KITE(tau - 0.05)[0]) / 0.1;
  const a = 0.25 * Math.sin(tau * 1.5 + 0.3) + 0.12 * Math.sin(tau * 3.3) - clamp(6 * vx, -0.5, 0.5);
  return [x, y, a];
}

function cameraAt(ts) {
  const yaw = YAW(ts) + 0.006 * sn(ts * 1.3, 11) + 0.003 * sn(ts * 3.1, 12) + 0.0015 * sn(ts * 7, 17);
  const pitch = PITCH(ts) + 0.005 * sn(ts * 1.1, 13) + 0.0025 * sn(ts * 2.9, 14) + 0.0012 * sn(ts * 6.5, 18);
  const roll = -0.018 + 0.012 * sn(ts * 0.7, 15) + 0.004 * sn(ts * 2.3, 16);
  const f = [Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw)];
  const r = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
  const c = Math.cos(roll), s = Math.sin(roll);
  const r2 = r.map((v, i) => v * c + u[i] * s), u2 = u.map((v, i) => v * c - r[i] * s);
  return { r: r2, u: u2, f, fov: FOV(ts) };
}

// ---------- the projector (per projected frame n) ----------
const rollAt = (n) => { const tn = n / FPS; return tn < 8.05 ? 0 : 2400 * (tn - 8.05) ** 2; };
const stripAt = (n) => n * C.PITCH + rollAt(n);
const S_END = stripAt(END_N) - 150;
function weave(n) {
  let wx = 3.0 * sn(n * 0.11, 1) + 1.4 * (hash1(n, 2) - 0.5);
  let wy = 1.8 * (hash1(n, 3) - 0.5) + 1.4 * sn(n * 0.07, 4);
  let rot = 0.0012 * (hash1(n, 5) - 0.5) + 0.0011 * sn(n * 0.05, 6);
  if (n < C.K_IMG) { wx *= 1.8; wy *= 1.8; rot *= 1.5; }
  if (n === C.K_IMG) wy += 16;                     // the splice jumps through the gate
  if (n === C.K_IMG + 1) wy -= 6;
  if (n >= 138) { const k = clamp((n - 138) / 10); wx *= 1 + 1.5 * k; wy += 7 * k * (hash1(n, 7) - 0.5); rot *= 1 + 2 * k; }
  return [wx, wy, rot];
}
const HAIR = [[300, 722], [292, 694], [276, 668], [262, 646], [262, 622], [276, 604], [296, 600]];
const hairAt = (n) => HAIR.flatMap(([x, y], i) => [
  x + ((hash1(n, 40 + i) - 0.5) * 1.6 + 2.2 * Math.sin(n * 0.7)) * (i / 6),
  y + (hash1(n, 60 + i) - 0.5) * 1.2 * (i / 6),
]);
function lampAt(t) {
  if (t < T_OFF) {
    const w = ramp(t, 0, 0.45);
    return { k: ramp(t, 0, 0.28), col: [1, lerp(0.45, 0.95, w), lerp(0.15, 0.86, w)] };
  }
  const dt = t - T_OFF, cool = 1 - Math.exp(-dt / 0.1);
  return { k: 0.88 * Math.exp(-dt / 0.06) + 0.12 * Math.exp(-dt / 0.3), col: [1, lerp(0.95, 0.4, cool), lerp(0.86, 0.1, cool)] };
}

defineDemo({
  id: '22-super8',
  title: '여름날의 8mm 필름',
  tech: 'WebGL2 후처리 · 영사기 게이트 흔들림·깜빡임·먼지·할레이션',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('no float render targets');
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (fs, names) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, FS_VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      for (const n of names) u[n] = gl.getUniformLocation(p, n);
      return { p, u };
    };
    const P = {
      scene: program(SCENE_FS, ['res', 'ts', 'uFrame', 'uFov', 'uCam', 'uKite', 'uTail', 'uSunUV']),
      down: program(DOWN_FS, ['src', 'texel', 'uGain', 'uThr']),
      up: program(UP_FS, ['src', 'texel']),
      film: program(FILM_FS(C), ['uScene', 'uHal', 'uRes', 'uStrip', 'uBlur', 'uExpo', 'uLamp', 'uFlick', 'uHairA', 'uSEnd', 'uWeave', 'uLampCol', 'uHair']),
    };
    const fsV = gl.createVertexArray();
    gl.bindVertexArray(fsV);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const target = (w, h) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete');
      return { tex, fb, w, h };
    };
    const sceneT = target(SW, SH);
    const mips = [];
    for (let i = 0, w = SW, h = SH; i < 5; i++) { w = Math.ceil(w / 2); h = Math.ceil(h / 2); mips.push(target(w, h)); }
    const pass = (prog, dst) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      gl.useProgram(prog.p);
      gl.bindVertexArray(fsV);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const bind = (unit, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); };
    const sunDir = planeDir(SUN_P);

    // the film frame n: scene + halation pyramid (cached: they depend on n only)
    let cachedN = -1;
    const shoot = (n) => {
      if (n === cachedN) return;
      cachedN = n;
      const ts = n / FPS;
      const cam = cameraAt(ts);
      const kite = kiteAt(ts);
      const tail = [];
      for (let i = 0; i < 14; i++) {
        const k = kiteAt(ts - 0.055 * i), s = Math.sin(k[2]), c = Math.cos(k[2]);
        tail.push(k[0] + s * KITE_H + 0.0035 * i + 0.0025 * Math.pow(i, 0.8) * Math.sin(ts * 7 - i * 0.9),
          k[1] - c * KITE_H - 0.0095 * i);
      }
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const z = Math.max(dot(sunDir, cam.f), 0.05);
      const sunUV = [dot(sunDir, cam.r) / z / (2 * cam.fov * SW / SH) + 0.5, dot(sunDir, cam.u) / z / (2 * cam.fov) + 0.5];

      gl.disable(gl.BLEND);
      gl.useProgram(P.scene.p);
      gl.uniform2f(P.scene.u.res, SW, SH);
      gl.uniform1f(P.scene.u.ts, ts);
      gl.uniform1f(P.scene.u.uFrame, n);
      gl.uniform1f(P.scene.u.uFov, cam.fov);
      gl.uniformMatrix3fv(P.scene.u.uCam, false, [...cam.r, ...cam.u, ...cam.f]);
      gl.uniform3f(P.scene.u.uKite, kite[0], kite[1], kite[2]);
      gl.uniform2fv(P.scene.u.uTail, new Float32Array(tail));
      gl.uniform2f(P.scene.u.uSunUV, sunUV[0], sunUV[1]);
      pass(P.scene, sceneT);

      // halation: threshold the exposure, blur it over five octaves, sum them back up
      gl.useProgram(P.down.p);
      gl.uniform1i(P.down.u.src, 0);
      let src = sceneT;
      mips.forEach((m, i) => {
        bind(0, src.tex);
        gl.uniform2f(P.down.u.texel, 1 / src.w, 1 / src.h);
        gl.uniform1f(P.down.u.uGain, i === 0 ? EXPO(ts) : 1);
        gl.uniform1f(P.down.u.uThr, i === 0 ? 1.4 : 0);
        pass(P.down, m);
        src = m;
      });
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P.up.p);
      gl.uniform1i(P.up.u.src, 0);
      for (let i = mips.length - 1; i > 0; i--) {
        bind(0, mips[i].tex);
        gl.uniform2f(P.up.u.texel, 1 / mips[i].w, 1 / mips[i].h);
        pass(P.up, mips[i - 1]);
      }
      gl.disable(gl.BLEND);
    };

    this.draw = (t) => {
      const n = Math.min(Math.floor(t * FPS + 1e-6), Math.floor(D * FPS) - 1);
      shoot(n);
      const lamp = lampAt(t);
      const w = weave(n);
      const f = P.film;
      gl.useProgram(f.p);
      bind(0, sceneT.tex); bind(1, mips[0].tex);
      gl.uniform1i(f.u.uScene, 0);
      gl.uniform1i(f.u.uHal, 1);
      gl.uniform2f(f.u.uRes, W, H);
      gl.uniform1f(f.u.uStrip, stripAt(n));
      gl.uniform1f(f.u.uBlur, Math.min(0.33 * (rollAt(n) - rollAt(n - 1)), 55));
      gl.uniform1f(f.u.uExpo, EXPO(n / FPS));
      gl.uniform1f(f.u.uLamp, lamp.k);
      gl.uniform3f(f.u.uLampCol, ...lamp.col);
      gl.uniform1f(f.u.uFlick, 1 + 0.035 * (hash1(n, 21) - 0.5));
      gl.uniform1f(f.u.uSEnd, S_END);
      gl.uniform3f(f.u.uWeave, ...w);
      gl.uniform1f(f.u.uHairA, (n >= 46 && n < 112) || n >= 158 ? 1 : 0);   // a hair caught in the gate (it comes back at the end)
      gl.uniform2fv(f.u.uHair, new Float32Array(hairAt(n)));
      pass(f, null);
    };
  },
  frame(t) { this.draw(t); },
});
