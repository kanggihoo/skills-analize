/*
 * 26 · 동판에 새긴 달 — a line engraving of the Moon, made the way a burin engraver makes one.
 *
 * The Moon is a lit sphere computed per pixel (shader.js): analytic crater profiles with exact gradients,
 * rim shadows, maria and ray systems → a darkness D. It is never shown as a picture. Instead three families
 * of engraved lines (parallels about three tilted axes, so they wrap the sphere and bend over the relief) are
 * drawn with a width proportional to D — thin flicks and dots in the light, swelling lines in the mid-tones,
 * cross-hatching in the shadow — and box-filtered against fwidth so they never alias.
 * The story is the process: cutting the plate (mirror image, bright burr at the burin tip), dabbing and wiping
 * the ink (tone left in the recesses), laying the damp sheet, turning it to show the impression on laid paper
 * with its plate mark — then the light swings round the Moon and every line answers.
 */
import { defineDemo, rand, track, ease } from '../_lib/stage.js';
import { buildFrag } from './shader.js';

const D = 10;
const NC = 150;                 // craters
const lin = (p) => p;

const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sph = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };

// a line family = parallels about an axis; e1 is the axis-perpendicular direction nearest the viewer, so the
// longitude seam (±π) sits on the far side of the Moon
function family(ax) {
  ax = norm(ax);
  const d = ax[2];
  const e1 = norm([-ax[0] * d, -ax[1] * d, 1 - ax[2] * d]);
  return [ax, e1, cross(ax, e1)];
}
const FAM = {
  A: family([0.12, 0.97, 0.20]),     // the main lines: gentle ellipses round the globe
  B: family([-0.75, -0.62, 0.22]),   // first cross-hatch, ~50° to A
  C: family([0.72, -0.66, 0.20]),    // second cross-hatch for the deepest shade
};

// the near-side maria as soft blobs (lat, lon, radius°, strength): enough to read as "the" Moon
const MARIA = [
  [33, -16, 15, 1.0], [28, 17, 9, 1.0], [8, 31, 10, 1.0], [1, 22, 6, 0.8], [17, 59, 6.5, 1.1],
  [-7, 51, 8, 0.9], [-15, 34, 5, 0.9], [-21, -16, 9, 0.85], [-10, -22, 6, 0.8], [-24, -39, 5, 0.9],
  [12, -52, 14, 0.95], [30, -55, 12, 0.85], [-3, -45, 10, 0.85], [7, -30, 7, 0.75], [13, 4, 4.5, 0.8],
  [55, -15, 5, 0.8], [56, 5, 5, 0.75], [57, 25, 4.5, 0.7],
];
const MARE = MARIA.map(([la, lo, r, k]) => { const s = 0.75 * r * Math.PI / 180; return [...sph(la, lo), k, 1 / (s * s)]; });
const mareJS = (c) => MARE.reduce((m, v) => m + v[3] * Math.exp(-(1 - (c[0] * v[0] + c[1] * v[1] + c[2] * v[2])) * v[4]), 0);

// named craters: lat, lon, radius (rad, exaggerated), depth, rim, peak, floor albedo, bright halo, flat floor
const NAMED = [
  [-43.3, -11.2, 0.050, 0.26, 0.40, 0.45, 1.00, 0.45, 1.0],   // Tycho
  [9.6, -20.1, 0.056, 0.22, 0.42, 0.40, 1.00, 0.35, 1.0],     // Copernicus
  [8.1, -38.0, 0.022, 0.28, 0.35, 0.00, 1.00, 0.35, 1.0],     // Kepler
  [23.7, -47.4, 0.020, 0.28, 0.35, 0.00, 1.15, 0.60, 1.0],    // Aristarchus
  [51.6, -9.4, 0.055, 0.10, 0.35, 0.00, 0.55, 0.00, 0.15],    // Plato (dark, flooded)
  [29.7, -4.0, 0.048, 0.10, 0.30, 0.00, 0.75, 0.00, 0.2],     // Archimedes
  [-58.4, -14.4, 0.115, 0.12, 0.30, 0.00, 1.00, 0.00, 0.5],   // Clavius
  [-9.3, -1.9, 0.078, 0.10, 0.30, 0.00, 0.85, 0.00, 0.3],     // Ptolemaeus
  [-13.4, -3.2, 0.060, 0.14, 0.32, 0.25, 0.95, 0.00, 0.6],    // Alphonsus
  [-18.2, -1.9, 0.050, 0.18, 0.34, 0.35, 1.00, 0.00, 1.0],    // Arzachel
  [-11.2, 4.1, 0.068, 0.12, 0.30, 0.20, 0.95, 0.00, 0.5],     // Albategnius
  [-11.4, 26.4, 0.056, 0.22, 0.40, 0.45, 1.00, 0.00, 1.0],    // Theophilus
  [-13.2, 24.0, 0.052, 0.16, 0.30, 0.25, 1.00, 0.00, 0.7],    // Cyrillus
  [-18.0, 23.4, 0.052, 0.14, 0.28, 0.00, 1.00, 0.00, 0.6],    // Catharina
  [-8.9, 61.0, 0.070, 0.20, 0.38, 0.40, 1.00, 0.10, 1.0],     // Langrenus
  [-25.3, 60.4, 0.090, 0.16, 0.36, 0.40, 1.00, 0.00, 0.7],    // Petavius
  [-5.2, -68.6, 0.090, 0.10, 0.25, 0.00, 0.50, 0.00, 0.2],    // Grimaldi
  [-49.6, -21.7, 0.080, 0.14, 0.30, 0.20, 1.00, 0.00, 0.6],   // Longomontanus
  [-41.8, 14.0, 0.070, 0.16, 0.30, 0.20, 1.00, 0.00, 0.7],    // Maurolycus
  [31.8, 29.9, 0.052, 0.10, 0.28, 0.00, 0.80, 0.00, 0.3],     // Posidonius
  [14.5, -11.3, 0.032, 0.25, 0.38, 0.30, 1.00, 0.00, 1.0],    // Eratosthenes
  [-50.0, -6.2, 0.085, 0.12, 0.28, 0.00, 1.00, 0.00, 0.5],    // Maginus
  [-5.1, 5.2, 0.075, 0.08, 0.22, 0.00, 0.95, 0.00, 0.3],      // Hipparchus
];

function craterData() {
  const rnd = rand(2611);
  const list = NAMED.map(([la, lo, r, dep, rim, pk, fa, halo, flat]) => ({ c: sph(la, lo), r, dep, rim, pk, fa, halo, flat }));
  while (list.length < NC) {
    const z = 0.02 + 0.98 * rnd(), ph = rnd() * Math.PI * 2, q = Math.sqrt(1 - z * z);
    const c = [q * Math.cos(ph), q * Math.sin(ph), z];
    const u = rnd();
    const r = 0.009 + 0.055 * u * u * u;                     // many small craters, few large ones
    if (mareJS(c) > 0.5 && rnd() > 0.22) continue;           // the maria are younger: few craters there
    const big = r > 0.035;
    list.push({ c, r, dep: big ? 0.16 : 0.28, rim: 0.32 + 0.1 * rnd(), pk: big ? 0.3 * rnd() : 0,
      fa: 0.92 + 0.12 * rnd(), halo: r < 0.016 && rnd() < 0.25 ? 0.25 : 0, flat: big ? 0.6 + 0.4 * rnd() : 1 });
  }
  const data = new Float32Array(NC * 3 * 4);
  list.forEach((k, i) => {
    const dl = 2.2 * k.r;
    data.set([...k.c, k.r], i * 4);
    data.set([k.dep, k.rim, k.pk, 1 - dl * dl / 2], (NC + i) * 4);
    data.set([k.fa, k.halo, k.flat, 0], (2 * NC + i) * 4);
  });
  return data;
}

// lettering engraved on the plate (red) and the printer's pencil notes under the plate mark (green)
function textCanvas(W, H) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'lighter';
  const serif = '"Cormorant Garamond", "EB Garamond", Garamond, "Times New Roman", Georgia, "Noto Serif", "DejaVu Serif", serif';
  x.textAlign = 'center';
  x.fillStyle = 'rgb(255,0,0)';
  x.font = `400 50px ${serif}`;
  if ('letterSpacing' in x) x.letterSpacing = '15px';
  x.fillText('SELENOGRAPHIA', 540 + 7, 1280);
  x.font = `italic 400 25px ${serif}`;
  if ('letterSpacing' in x) x.letterSpacing = '3px';
  x.fillText('Tabula III  ·  Luna crescens et decrescens', 540, 1330);
  x.fillStyle = 'rgb(0,255,0)';
  if ('letterSpacing' in x) x.letterSpacing = '1px';
  x.font = `italic 400 29px ${serif}`;
  x.textAlign = 'left'; x.fillText('7 / 30', 168, 1446);
  x.textAlign = 'center'; x.fillText('Luna', 540, 1446);
  x.textAlign = 'right'; x.fillText('imp.', 912, 1446);
  return c;
}

// ---------------------------------------------------------------- the story (all pure functions of t)
const fade = track([[0, 0], [0.6, 1, ease.outCubic]]);
const cutFrame = track([[0.15, 0], [0.8, 1, lin]]);
const cutSky = track([[0.3, 0], [2.0, 1, lin]]);
const cutA = track([[0.7, 0], [3.0, 1, lin]]);
const cutB = track([[2.0, 0], [3.25, 1, lin]]);
const cutC = track([[2.55, 0], [3.45, 1, lin]]);
const cutT = track([[2.85, 0], [3.5, 1, lin]]);
const inkT = track([[3.55, 0], [4.0, 1]]);
const wipeT = track([[4.0, 0], [4.8, 1]]);
const sheetT = track([[4.85, 0], [5.3, 1, ease.outCubic]]);
const curlT = track([[5.45, 0], [6.3, 1]]);
const phase = track([[0, 50], [6.6, 50], [9.2, -100, ease.inOutCubic]]);   // light azimuth (°): gibbous → full → crescent

defineDemo({
  id: '26-engraving',
  title: '동판에 새긴 달',
  tech: 'WebGL2 셰이더 · 명암을 선의 굵기로 (판화 해칭)',
  duration: D,
  background: '#000',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, '#version 300 es\nin vec2 p; void main() { gl_Position = vec4(p, 0, 1); }'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, buildFrag({ NC, FAM, MARE })));
    gl.bindAttribLocation(prog, 0, 'p');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const U = {};
    for (const n of ['stage', 'uMirror', 'uHalo', 'uSky', 'uFrame', 'uText', 'uInk', 'uWipe', 'uSheet', 'uCurl', 'uSheen', 'uFade',
      'uCut', 'L', 'tycho', 'coper', 'crTex', 'txTex']) U[n] = gl.getUniformLocation(prog, n);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const tex = (unit, fill) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      fill();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    tex(0, () => {   // crater table, read with texelFetch
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, NC, 3, 0, gl.RGBA, gl.FLOAT, craterData());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    });
    tex(1, () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas(W, H));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    });
    gl.uniform1i(U.crTex, 0);
    gl.uniform1i(U.txTex, 1);
    gl.uniform2f(U.stage, W, H);
    gl.uniform3fv(U.tycho, sph(-43.3, -11.2));
    gl.uniform3fv(U.coper, sph(9.6, -20.1));
    gl.viewport(0, 0, W, H);

    this.draw = (t) => {
      const printed = curlT(t) > 0;
      const a = phase(t) * Math.PI / 180;
      const Lv = norm([Math.sin(a), 0.18, Math.cos(a)]);
      gl.uniform3fv(U.L, Lv);
      gl.uniform1f(U.uHalo, 0.5 * (1 + Lv[2]));
      gl.uniform1f(U.uMirror, printed ? 0 : 1);
      const done = printed ? 2 : 0;
      gl.uniform4f(U.uCut, done || cutA(t), done || cutB(t), done || cutC(t), 0);
      gl.uniform1f(U.uSky, done || cutSky(t));
      gl.uniform1f(U.uFrame, done || cutFrame(t));
      gl.uniform1f(U.uText, done || cutT(t));
      gl.uniform1f(U.uInk, inkT(t));
      gl.uniform1f(U.uWipe, wipeT(t));
      gl.uniform1f(U.uSheet, sheetT(t));
      gl.uniform1f(U.uCurl, curlT(t));
      gl.uniform1f(U.uSheen, -520 + 115 * t);
      gl.uniform1f(U.uFade, fade(t));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
