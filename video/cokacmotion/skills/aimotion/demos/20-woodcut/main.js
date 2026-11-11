/*
 * 20 · 목판화 한 장 — a woodblock print from the first cut to the pulled sheet.
 *   setup(): the block is carved procedurally (design.js: Canvas 2D masks → exact distance transforms →
 *            tone-by-line-width carving, mirrored), the baren's rubbing record is baked, washi fibres drawn.
 *   frame(t): one WebGL2 fragment shader (shader.js) renders the workshop from uniforms that are pure
 *            functions of t: carving progress, three brayer passes, the sheet lowering, the baren's path,
 *            the peel (a cylinder curl whose fold line sweeps across), light and camera.
 */
import { defineDemo, track, ease, clamp, lerp } from '../_lib/stage.js';
import { carveBlock, bakeRub, paperFibres, barenAt, TW, TH, S, RUB } from './design.js';
import { VERT, FRAG } from './shader.js';

const D = 10;
const camX = track([[0, 620], [2.5, 540], [7.15, 540], [8.75, -300], [D, -300]]);
const camY = track([[0, 560], [2.5, 860], [D, 860]]);
const camZ = track([[0, 1.9], [2.5, 1.0], [4.6, 1.0], [5.4, 1.05], [6.9, 1.05], [7.4, 1.0], [8.75, 1.0], [D, 1.08, ease.outCubic]]);
const lampX = track([[0, 560], [2.5, 440], [7.15, 440], [8.75, -260]]);

// the brayer: drops in, three passes (down, up, down), lifts away
const ROLL = [[2.6, 3.15, 150, 1570], [3.15, 3.7, 1570, 150], [3.7, 4.25, 150, 1570]];
const rollEnter = [2.35, 2.6, -160, 150], rollExit = [4.25, 4.6, 1570, 2050];
const sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));
function rollerState(t) {
  let y, lift = 0, travel = 0;
  const seg = ([a, b, y0, y1], f = sine) => { const p = f((t - a) / (b - a)); return [lerp(y0, y1, p), Math.abs(y1 - y0) * p]; };
  if (t < rollEnter[1]) { [y, travel] = seg(rollEnter, ease.outCubic); lift = 1 - ease.outCubic(clamp((t - rollEnter[0]) / 0.25)); }
  else {
    travel = Math.abs(rollEnter[3] - rollEnter[2]);
    y = rollEnter[3];
    for (const r of ROLL) { if (t >= r[0]) { const [yy, tr] = seg(r); y = yy; travel += tr; } }
    if (t > rollExit[0]) { const [yy, tr] = seg(rollExit, ease.inCubic); y = yy; travel += tr; lift = ease.inCubic(clamp((t - rollExit[0]) / 0.35)); }
  }
  return { y, lift, spin: travel / 42, visible: t >= rollEnter[0] && t <= rollExit[1] };
}
// the baren: comes in from the right, rubs along its path, leaves to the lower right
const BIN = [4.95, RUB.t0], BOUT = [RUB.t1, 7.1];
function barenState(t) {
  const s = clamp((t - RUB.t0) / (RUB.t1 - RUB.t0));
  const ang = 0.5 + 0.22 * Math.sin(s * Math.PI * 2 * 3) + 0.1 * Math.sin(s * 23.0);
  if (t < BIN[0] || t > BOUT[1]) return [0, 0, 9, 0];
  if (t < BIN[1]) {
    const p = ease.outCubic((t - BIN[0]) / (BIN[1] - BIN[0])), [x, y] = barenAt(0);
    return [lerp(1350, x, p), lerp(220, y, p), 1 - p, ang];
  }
  if (t > BOUT[0]) {
    const p = ease.inCubic((t - BOUT[0]) / (BOUT[1] - BOUT[0])), [x, y] = barenAt(1);
    return [lerp(x, 1420, p), lerp(y, 1700, p), p, ang];
  }
  const [x, y] = barenAt(s);
  return [x, y, 0, ang];
}
// the peel: the curl's crest sweeps from the right edge (beyond the lifted corner) to the left edge
const PEEL = [7.1, 8.75], R0 = 64;
function peelState(t) {
  if (t < PEEL[0]) return [0, 0, 0, 0];
  const p = ease.inOutCubic(clamp((t - PEEL[0]) / (PEEL[1] - PEEL[0])));
  const R = (10 + (R0 - 10) * ease.outCubic(clamp(p / 0.12))) * (1 - ease.inOutCubic(clamp((t - 8.7) / 0.65))) + 0.5;
  const alpha = 0.32 * Math.pow(1 - p, 1.5);
  const c = lerp(694, -420, p);
  return [c - Math.PI * R / 2, R, alpha, 1];
}
const L0 = [-0.42, -0.58, 0.70], L1 = [-0.88, -0.30, 0.30];

defineDemo({
  id: '20-woodcut',
  title: '목판화 한 장',
  tech: '절차적 판각 + WebGL2 잉크 인쇄 셰이더',
  duration: D,
  background: '#0c0907',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const tex = (unit, w, h, data, mip) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      if (data instanceof HTMLCanvasElement) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, data);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      if (mip) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    tex(0, TW, TH, carveBlock(), true);
    const rub = bakeRub();
    tex(1, rub.GW, rub.GH, rub.thr, false);
    tex(2, rub.GW, rub.GH, rub.fin, false);
    tex(3, 0, 0, paperFibres(), true);

    const U = {};
    for (const n of ['uBlock', 'uThr', 'uFin', 'uFib', 'uRes', 'uCam', 'uLight', 'uLamp', 'uFrame', 'uCarve', 'uRub', 'uEmb',
      'uLodB', 'uLodF', 'uPass', 'uRoller', 'uPaper', 'uBaren', 'uPeel']) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.uBlock, 0); gl.uniform1i(U.uThr, 1); gl.uniform1i(U.uFin, 2); gl.uniform1i(U.uFib, 3);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uEmb, 2.4);
    gl.viewport(0, 0, W, H);

    this.draw = (t) => {
      const z = camZ(t);
      gl.uniform3f(U.uCam, camX(t), camY(t), z);
      gl.uniform1f(U.uLodB, Math.max(0, Math.log2(S / z)));
      gl.uniform1f(U.uLodF, Math.max(0, Math.log2(1.25 / z)));
      gl.uniform1f(U.uFrame, Math.round(t * 30));
      gl.uniform1f(U.uCarve, clamp((t - 0.3) / 2.1));
      // brayer passes: (from, to, progress, seed)
      const pass = [];
      ROLL.forEach(([a, b, y0, y1], i) => pass.push(y0, y1, t <= a ? 0 : sine((t - a) / (b - a)), 1.7 + i * 2.3));
      gl.uniform4fv(U.uPass, pass);
      const r = rollerState(t);
      gl.uniform4f(U.uRoller, r.y, r.lift, r.visible ? 1 : 0, r.spin);
      // the sheet: lowered onto the kento, drifting into register as it lands
      const h = 1 - ease.outCubic(clamp((t - 4.45) / 0.6));
      gl.uniform4f(U.uPaper, h, t >= 4.45 ? 1 : 0, -50 * h, -110 * h);
      gl.uniform4f(U.uBaren, ...barenState(t));
      gl.uniform1f(U.uRub, clamp((t - RUB.t0) / (RUB.t1 - RUB.t0)));
      gl.uniform4f(U.uPeel, ...peelState(t));
      // light: the desk lamp, turning into a low raking light over the finished print
      const k = ease.inOutCubic(clamp((t - 8.7) / 1.0));
      const L = L0.map((v, i) => lerp(v, L1[i], k)), l = Math.hypot(...L);
      gl.uniform3f(U.uLight, L[0] / l, L[1] / l, L[2] / l);
      gl.uniform3f(U.uLamp, lampX(t), 780, 950);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
