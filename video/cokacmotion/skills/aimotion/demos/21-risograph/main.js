/*
 * 21 · 리소그래프 두 도 — a two-colour risograph job on a single-drum machine, seen from above the output tray.
 *   setup(): the artwork is drawn as two separations (sep.js) → one RG texture; the copies' misregistration
 *            and ink density are drawn from rand() once.
 *   frame(t): every uniform is a pure function of t — where each sheet is, how far it has passed each drum's
 *            contact line, how the drums turn and swap — and one fragment shader (shader.js) screens, inks,
 *            overprints and lays the sheets on the stack.
 * Story: the blank sheet feeds under the pink drum and comes out pink → it leaves, the drum is swapped for
 * blue → the same sheet is fed again and the blue lands on the pink, off by a few pixels → close look at
 * the dots → six more copies flick out at full speed onto the stack, each registered a little differently.
 */
import { defineDemo, rand, track, ease, clamp, lerp } from '../_lib/stage.js';
import { drawSeparations, SW, SH, SS } from './sep.js';
import { VERT, FRAG } from './shader.js';

const D = 10;
const YD = 30, START = YD - SH, REST = 330;          // drum contact line; sheet top when entering / at rest
const sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));
const PASS1 = [0.3, 2.3], EXIT = [2.75, 3.15], PASS2 = [3.45, 5.35];

function heroTop(t) {
  if (t < PASS1[0]) return START;
  if (t < PASS1[1]) return lerp(START, REST, sine((t - PASS1[0]) / (PASS1[1] - PASS1[0])));
  if (t < EXIT[0]) return REST;
  if (t < EXIT[1]) return lerp(REST, 2100, ease.inCubic((t - EXIT[0]) / (EXIT[1] - EXIT[0])));
  if (t < PASS2[0]) return START;
  if (t < PASS2[1]) return lerp(START, REST, sine((t - PASS2[0]) / (PASS2[1] - PASS2[0])));
  return REST;
}
// the blue drum during the run of copies: spins up, one revolution (1240 px of travel) per copy, spins down
const V = 3700, T0 = 6.3, TR = 0.25, CIRC = 1240, NC = 6;
const arcRun = (tau) => (tau <= 0 ? 0 : tau < TR ? V * tau * tau / (2 * TR) : V * (tau - TR / 2));
const arcInv = (a) => (a < V * TR / 2 ? Math.sqrt(2 * TR * a / V) : a / V + TR / 2);
const COPY = Array.from({ length: NC }, (_, i) => { const a0 = 1020 + i * CIRC; return { a0, ts: arcInv(a0), tr: arcInv(a0 + SH) }; });
const TL = COPY[NC - 1].tr;
const arcB = (tau) => (tau <= TL ? arcRun(tau) : arcRun(TL) + V * 0.3 * (1 - Math.exp(-(tau - TL) / 0.3)));
const LAND = 0.22;

const camX = track([[0, 540], [5.35, 540], [5.95, 480], [6.25, 480], [6.7, 540], [D, 540]]);
const camY = track([[0, 960], [2.3, 960], [2.75, 980], [3.2, 900], [5.35, 960], [5.95, 1010], [6.25, 1010], [6.7, 950], [8.9, 950], [D, 930]]);
const camZ = track([[0, 1.0], [2.3, 1.02], [2.75, 1.06], [3.3, 1.0], [5.35, 1.0], [5.95, 1.8], [6.25, 1.85, (p) => p], [6.7, 0.97], [8.9, 0.97], [D, 1.04]]);

defineDemo({
  id: '21-risograph',
  title: '리소그래프 두 도',
  tech: 'WebGL2 · 별색 망점 분판 + 판 어긋남 + 곱하기 겹쳐 찍기',
  duration: D,
  background: '#141518',
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

    const sep = drawSeparations();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, sep.w, sep.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, sep.data);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const U = {};
    for (const n of ['uSep', 'uRes', 'uCam', 'uFrame', 'uLod', 'uCount', 'uSh', 'uMisP', 'uMisB', 'uLn', 'uDrumP', 'uDrumB']) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.uSep, 0);
    gl.uniform2f(U.uRes, W, H);
    gl.viewport(0, 0, W, H);

    // every copy is fed, inked and gripped a little differently: offsets, a hair of rotation, ink density
    const r = rand(2121);
    const sheets = [{ x: 540, rot: 0, dy: 0, seed: 1.3, misP: [0, 0, 0, 1.0], misB: [3.2, -2.4, 0.0022, 0.97] }];
    for (let k = 0; k < NC; k++) {
      sheets.push({
        x: 540 + (r() - 0.5) * 10, rot: (r() - 0.5) * 0.016, dy: (r() - 0.5) * 6, seed: 2.7 + k * 1.91,
        misP: [(r() - 0.5) * 3, (r() - 0.5) * 3, (r() - 0.5) * 0.003, 0.92 + 0.12 * r()],
        misB: [(r() - 0.5) * 9, (r() - 0.5) * 7, (r() - 0.5) * 0.006, 0.88 + 0.15 * r()],
      });
    }
    const copyTop = (k, t) => {                  // k = 0..NC-1
      const c = COPY[k], tau = t - T0;
      if (tau <= c.tr) return START + (arcB(tau) - c.a0);
      return lerp(YD, REST + sheets[k + 1].dy, ease.outCubic((tau - c.tr) / LAND));
    };

    this.draw = (t) => {
      const z = camZ(t);
      gl.uniform3f(U.uCam, camX(t), camY(t), z);
      gl.uniform1f(U.uLod, Math.max(0, Math.log2(SS / z)));
      gl.uniform1f(U.uFrame, Math.round(t * 30));
      const tau = t - T0;
      const started = COPY.filter((c) => tau >= c.ts).length;
      gl.uniform1f(U.uCount, 1 + started);
      const Sh = new Float32Array(32), MP = new Float32Array(32), MB = new Float32Array(32), Ln = new Float32Array(32);
      const NONE = SH + 10, ALL = -1e4;
      // the hero sheet (bottom of the stack)
      const ht = heroTop(t);
      Sh.set([540, ht, 0, sheets[0].seed], 0);
      Ln.set([
        t < PASS1[0] ? NONE : t < PASS1[1] ? YD - ht : ALL,
        t < PASS2[0] ? NONE : t < PASS2[1] ? YD - ht : ALL,
        clamp(Math.abs(ht - heroTop(t - 1 / 60)) * 0.5, 0, 40), 0,
      ], 0);
      MP.set(sheets[0].misP, 0); MB.set(sheets[0].misB, 0);
      for (let k = 0; k < started; k++) {
        const s = sheets[k + 1], top = copyTop(k, t), c = COPY[k];
        const speed = Math.abs(top - copyTop(k, t - 1 / 60));
        const lift = tau < c.tr ? 1 : 1 - ease.outCubic(clamp((tau - c.tr) / LAND));
        Sh.set([s.x, top, s.rot, s.seed], (k + 1) * 4);
        Ln.set([ALL, tau < c.tr ? YD - top : ALL, clamp(speed * 0.5, 0, 40), lift], (k + 1) * 4);
        MP.set(s.misP, (k + 1) * 4); MB.set(s.misB, (k + 1) * 4);
      }
      gl.uniform4fv(U.uSh, Sh); gl.uniform4fv(U.uMisP, MP); gl.uniform4fv(U.uMisB, MB); gl.uniform4fv(U.uLn, Ln);
      // drums: centre x, the sheet row at the contact line, a row blur for fast spinning, visible
      const xP = t < 2.9 ? 540 : lerp(540, -700, ease.inCubic(clamp((t - 2.9) / 0.45)));
      const rowP = t < PASS1[0] ? SH : t < PASS1[1] ? YD - ht : YD - REST;
      gl.uniform4f(U.uDrumP, xP, rowP, 0, xP > -560 ? 1 : 0);
      const xB = t < 3.0 ? 1780 : lerp(1780, 540, ease.outCubic(clamp((t - 3.0) / 0.45)));
      let rowB = SH, blurB = 0;
      if (t >= PASS2[0] && t < PASS2[1]) rowB = YD - ht;
      else if (t >= PASS2[1]) {
        rowB = YD - REST - arcB(tau);
        blurB = clamp((arcB(tau) - arcB(tau - 1 / 60)) * 0.3, 0, 24);
      }
      gl.uniform4f(U.uDrumB, xB, ((rowB % CIRC) + CIRC) % CIRC, blurB, xB < 1620 ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
