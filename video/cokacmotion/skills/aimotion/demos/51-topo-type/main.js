/*
 * 51 · 등고선 글자 — a topographic map that breathes. The words 물결 → 바람결 → 숨결 are islands in a sea of
 * contour lines; "결" (grain, the trace a passing thing leaves) is the same in all three, only what passes changes.
 *   setup(): each word is set in Black Han Sans on a half-resolution canvas (textAlpha) → sub-pixel signed
 *            distance (signedDistance) → the three fields are packed into one RGBA16F texture (LINEAR-filterable).
 *   frame(t): uniforms only — the drop's radius, the ripple front, the flow phase (integrated speed), the wind
 *            offset, the breathing, line weights — and one fragment shader (shader.js) prints the sheet.
 * Story: blank sheet → an ink drop falls and rings run out (the SDF of a point) → the rings condense into 물결
 * and its contours flow outward like a sound echo → the wind sweeps 바람결 in, contours streak sideways → an
 * exhale from the centre turns it into 숨결; the lines thin to hairlines and the map breathes slowly.
 */
import { defineDemo, track, clamp, ramp, lerp } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha, signedDistance } from '../_lib/type.js';
import { VERT, frag } from './shader.js';

const D = 10;
const SC = 0.5, GW = 540, GH = 960;                        // distance-field grid (stage × 0.5)
const EM = 400;                                            // word size (stage px)
const WORD_FONT = `400 ${EM}px "${FONTS.blackHanSans.family}"`;
const UI = `"${FONTS.pretendard.family}"`;
const HEADS = ['물', '바람', '숨'];                         // + 결 on the second line
const LINE_GAP = 58, CHAR_GAP = 22, Y2 = 985;               // ink gaps (px); centre of 결
const SHEET = [40, 44, 1040, 1636], FRAME = [76, 80, 1004, 1500];
// when each change starts (s), how fast it travels (px/s) and how long each point takes (s) — used in the shader
const TL = { T0: 1.25, V0: 1100, D0: 1.1, T1: 4.3, D1: 0.7, T2: 6.75, V2: 2000, D2: 0.7 };
const SUBS = [
  { text: '물이 지나간 자리', a: (t) => ramp(t, 2.5, 3.1) * (1 - ramp(t, 4.35, 4.8)) },
  { text: '바람이 지나간 자리', a: (t) => ramp(t, 5.3, 5.9) * (1 - ramp(t, 6.8, 7.2)) },
  { text: '숨이 머무는 자리', a: (t) => ramp(t, 7.9, 8.6) },
];

// ---------------------------------------------------------------- timeline (all pure in t)
const fade = (t) => ramp(t, 0, 0.5) * (1 - ramp(t, 9.62, D));
const dropR = (t) => { const p = clamp((t - 0.33) / 0.35); return 9 * (1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2)); };
const frontR = (t) => (t < 0.38 ? 0 : 1300 * (1 - Math.pow(1 - clamp((t - 0.38) / 4.2), 3)));
const vBase = track([[0, 0.5], [4.3, 0.5], [5.4, 0.28], [6.75, 0.28], [8.1, 0.05], [D, 0.04]]);
const vDrop = (t) => (t < 0.38 ? 0 : 2.6 * Math.exp(-(t - 0.38) / 0.7));   // the splash pushes the first rings out fast
const windEnv = track([[0, 0], [4.4, 0], [5.3, 1], [6.6, 1], [7.6, 0]]);
const breath = (t) => 0.35 * ramp(t, 7.3, 8.3) * Math.sin((2 * Math.PI * (t - 7.3)) / 2.9);
const s0 = track([[0, 18], [6.75, 18], [8.3, 12.5]]);       // contour interval at the coast (px): finer at the end
const lw = track([[0, 1], [6.75, 1], [8.3, 0.62]]);         // line weight: hairlines at the end
const tint = track([[0, 1], [6.75, 1], [8.6, 0.66]]);       // hypsometric tint strength: airier at the end

/** ∫₀ᵗ f — a fixed midpoint sum, so the value depends on t alone (never on the previous frame) */
function integrate(fn, t, h = 1 / 240) {
  const n = Math.floor(t / h);
  let s = 0;
  for (let i = 0; i < n; i++) s += fn((i + 0.5) * h) * h;
  return s + fn((n * h + t) / 2) * (t - n * h);
}

// ---------------------------------------------------------------- type → distance field
/** lay out "<head>\n결": syllables placed by their ink boxes, 결's centre fixed, the head sitting LINE_GAP above it */
function layout(ctx) {
  ctx.font = WORD_FONT;
  const ink = (s) => { const m = ctx.measureText(s); return { s, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent }; };
  const g = ink('결');
  const base2 = Y2 + (g.a - g.d) / 2;
  const top2 = base2 - g.a;
  const lines = HEADS.map((head) => {
    const sy = Array.from(head).map(ink);
    const width = sy.reduce((w, k) => w + k.l + k.r, 0) + CHAR_GAP * (sy.length - 1);
    let x = 540 - width / 2;
    const items = sy.map((k) => { const it = { s: k.s, x: x + k.l }; x += k.l + k.r + CHAR_GAP; return it; });
    const base1 = top2 - LINE_GAP - Math.max(...sy.map((k) => k.d));
    return { items, base1 };
  });
  return { lines, gx: 540 - (g.r - g.l) / 2, base2, top2 };
}

function buildFields(L) {
  const data = new Float32Array(GW * GH * 4);
  L.lines.forEach((line, ch) => {
    const a = textAlpha(GW, GH, (ctx) => {
      ctx.setTransform(SC, 0, 0, SC, 0, 0);
      ctx.font = WORD_FONT;
      ctx.textBaseline = 'alphabetic';
      for (const it of line.items) ctx.fillText(it.s, it.x, line.base1);
      ctx.fillText('결', L.gx, L.base2);
    });
    const d = signedDistance(a, GW, GH);
    for (let i = 0; i < d.length; i++) data[i * 4 + ch] = d[i] / SC;   // grid px → stage px
  });
  return data;
}

// ---------------------------------------------------------------- the map collar (2D overlay, Pretendard)
function drawCollar(g, t) {
  g.clearRect(0, 1505, 1080, 135);
  const f = fade(t);
  if (f <= 0) return;
  const ink = (a) => `rgba(27, 34, 48, ${a})`;
  const base = ramp(t, 0.7, 1.5) * f;
  g.textBaseline = 'alphabetic';
  // overline: what 결 is
  g.textAlign = 'left';
  g.font = `500 19px ${UI}`;
  g.fillStyle = ink(0.55 * base);
  g.fillText('결 — 지나간 것이 남기는 무늬', FRAME[0], 1541);
  // the line that changes with the word
  g.font = `650 34px ${UI}`;
  for (const s of SUBS) {
    const a = s.a(t) * f;
    if (a <= 0.002) continue;
    g.fillStyle = ink(0.88 * a);
    g.fillText(s.text, FRAME[0], 1590 + (1 - a) * 6);
  }
  // scale bar + contour interval, right-aligned to the neatline
  const x1 = FRAME[2], seg = 36, x0 = x1 - 5 * seg, y = 1528;
  g.strokeStyle = ink(0.8 * base);
  g.lineWidth = 1;
  g.strokeRect(x0 + 0.5, y + 0.5, 5 * seg - 1, 6);
  g.fillStyle = ink(0.8 * base);
  for (let i = 0; i < 5; i += 2) g.fillRect(x0 + i * seg, y, seg, 7);
  g.font = `500 15px ${UI}`;
  g.fillStyle = ink(0.62 * base);
  g.textAlign = 'center';
  g.fillText('0', x0, y + 26);
  g.fillText('100', x0 + 2.5 * seg, y + 26);
  g.textAlign = 'right';
  g.fillText('200 m', x1 + 2, y + 26);
  g.fillText('주곡선 20 m · 계곡선 100 m', x1, 1590);
}

defineDemo({
  id: '51-topo-type',
  title: '등고선 글자',
  tech: '부호 거리장 · 등치선 · 거리장 보간 모핑',
  duration: D,
  background: '#111317',
  async setup({ canvas }) {
    await fontReady(WORD_FONT, '물결바람숨');
    await fontReady(`650 34px ${UI}`, SUBS.map((s) => s.text).join('') + '결—지나간것이남기는무늬주곡선계곡선0123456789m·');

    const { ctx: gl } = canvas({ type: 'webgl2', z: 0 });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag({ ...TL, sheet: SHEET, frame: FRAME })));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // the three words → one RGBA16F distance texture (half floats filter LINEAR in core WebGL2)
    const mctx = document.createElement('canvas').getContext('2d');
    const L = layout(mctx);
    const fields = buildFields(L);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, GW, GH, 0, gl.RGBA, gl.FLOAT, fields);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const U = {};
    for (const n of ['uSdf', 'uT', 'uPhase', 'uWind', 'uWindAmp', 'uS0', 'uLw', 'uTint', 'uFade', 'uRf', 'uRd', 'uPacket', 'uKOn', 'uBreath', 'uFrame', 'uC', 'uL']) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.uSdf, 0);
    // the drop lands in the gap between the two lines, on the axis
    gl.uniform2f(U.uC, 540, L.top2 - LINE_GAP / 2);
    gl.viewport(0, 0, 1080, 1920);

    const { ctx: g } = canvas({ type: '2d', z: 1 });

    this.draw = (t) => {
      const b = breath(t);
      gl.uniform1f(U.uT, t);
      gl.uniform1f(U.uPhase, integrate((x) => vBase(x) + vDrop(x), t) + b);
      gl.uniform1f(U.uWind, integrate((x) => 0.15 + 0.85 * windEnv(x), t));
      gl.uniform1f(U.uWindAmp, 1.5 + 14 * windEnv(t));
      gl.uniform1f(U.uS0, s0(t));
      gl.uniform1f(U.uLw, lw(t));
      gl.uniform1f(U.uTint, tint(t));
      gl.uniform1f(U.uFade, fade(t));
      gl.uniform1f(U.uRf, frontR(t));
      gl.uniform1f(U.uRd, t < 0.33 ? 0 : dropR(t));
      gl.uniform1f(U.uPacket, ramp(t, 1.4, 3.0));
      gl.uniform1f(U.uKOn, ramp(t, 0.31, 0.37));
      gl.uniform1f(U.uBreath, b);
      gl.uniform1f(U.uFrame, Math.round(t * 30));
      const az = lerp(-2.3, -2.05, t / D);                  // the sun drifts a little: the relief turns in the light
      gl.uniform2f(U.uL, Math.cos(az), Math.sin(az));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      drawCollar(g, t);
    };
  },
  frame(t) { this.draw(t); },
});
