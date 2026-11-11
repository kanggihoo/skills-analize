/*
 * 46 · 꾹 눌러 찍은 활판 — a letterpress job on a small clamshell platen press.
 *   setup(): the forme is composed (forme.js): Pretendard Hangul glyphs rasterised into sorts with exact
 *            signed distances → a type-height map; impression profiles, fibres and occlusion are baked.
 *   frame(t): one ray-cast fragment shader (shader.js); every uniform is a closed-form function of t.
 * Story: two inked rollers run down and back up over the mirrored type → the platen swings up and slams shut
 * on the forme (a jolt) → it opens: the sheet on the platen carries the print → the camera goes down to the
 * paper while a low lamp sweeps across it, raking the deep impression and the squeezed ink.
 */
import { defineDemo, track, ease, clamp, lerp } from '../_lib/stage.js';
import { glKit } from './gl.js';
import { setForme, TW, TH, S, SW, SH } from './forme.js';
import { VERT, FRAG } from './shader.js';

const D = 10;
const PI = Math.PI, DEG = PI / 180;
const sine = (p) => 0.5 - 0.5 * Math.cos(PI * clamp(p));
const lin = (p) => p;

// ---- rollers: down over the forme, a beat, back up and away
const R_IN = [0.25, 1.25, 2000, 830], R_OUT = [1.35, 2.3, 830, 2050], RR = 58;
function rollerY(t) {
  if (t < R_IN[0]) return R_IN[2];
  if (t < R_IN[1]) return lerp(R_IN[2], R_IN[3], sine((t - R_IN[0]) / (R_IN[1] - R_IN[0])));
  if (t < R_OUT[0]) return R_IN[3];
  if (t < R_OUT[1]) return lerp(R_OUT[2], R_OUT[3], sine((t - R_OUT[0]) / (R_OUT[1] - R_OUT[0])));
  return R_OUT[3];
}
// ---- the platen: closes with a cam's accelerating swing, hits, rebounds a hair, dwells, opens
const CLOSE = [2.35, 3.45], OPEN = [3.85, 4.95];
function platen(t) {
  if (t < CLOSE[0]) return 0;
  if (t < CLOSE[1]) { const p = (t - CLOSE[0]) / (CLOSE[1] - CLOSE[0]); return PI * (0.15 * p + 0.85 * (1 - Math.cos(p * PI / 2))) ; }
  if (t < OPEN[0]) { const u = t - CLOSE[1]; return PI - 0.03 * Math.sin(u * 40) * Math.exp(-u * 18); }
  if (t < OPEN[1]) return PI * (1 - ease.inOutCubic((t - OPEN[0]) / (OPEN[1] - OPEN[0])));
  return 0;
}
// ---- camera: close on the inked forme → the whole press → down to the print → a close look at one glyph
const eyeX = track([[0, 540], [2.2, 540], [2.9, 540], [4.9, 560], [6.0, 540], [8.0, 520], [D, 470]]);
const eyeY = track([[0, 930], [2.2, 960], [2.9, -420, ease.inOutCubic], [4.9, -380], [6.0, -150], [8.0, 140], [D, 420]]);
const eyeZ = track([[0, 1450], [2.2, 1500], [2.9, 2650, ease.inOutCubic], [4.9, 2600], [6.0, 1650], [8.0, 1150], [D, 760]]);
const tgtX = track([[0, 540], [2.9, 540], [4.9, 540], [6.0, 540], [8.0, 500], [D, 440]]);
const tgtY = track([[0, 1390], [2.2, 1360], [2.9, 980, ease.inOutCubic], [4.9, 960], [6.0, 520], [8.0, 610], [D, 690]]);
const tgtZ = track([[0, 205], [2.9, 160], [4.9, 160], [6.0, 210], [D, 210]]);
// ---- light: a key lamp; then a low raking lamp sweeps across the sheet
const keyI = track([[0, 2.0], [5.4, 2.0], [6.4, 0.45], [D, 0.32]]);
const rakeI = track([[5.3, 0], [6.2, 3.3], [D, 3.4]]);
const rakeAz = track([[5.3, 200], [7.6, 255, lin], [D, 322]]);
const rakeEl = track([[5.3, 11], [D, 8]]);
const spotX = track([[5.3, -120], [7.6, 420, lin], [D, 820]]);

const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

defineDemo({
  id: '46-letterpress',
  title: '꾹 눌러 찍은 활판',
  tech: '높이맵 활자 + 잉크 압착 셰이더 · 활판 인쇄',
  duration: D,
  background: '#0b0a09',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const K = glKit(gl);
    const { F, P, hick } = await setForme();
    const tF = K.texture(TW, TH, { data: F, mip: true });
    const tP = K.texture(TW, TH, { data: P, mip: true });
    const frag = FRAG.replaceAll('@TW@', String(TW)).replaceAll('@THx@', String(TH)).replaceAll('@S@', String(S))
      .replaceAll('@SWx@', String(SW)).replaceAll('@SHx@', String(SH));
    const prog = K.program(frag);
    const focal = (H / 2) / Math.tan(20 * DEG);
    const hickU = new Float32Array(hick);

    this.draw = (t) => {
      // the jolt of the impression shakes the camera a little
      const u = t - CLOSE[1];
      const jolt = u > 0 && u < 0.6 ? Math.exp(-u * 9) : 0;
      const eye = [eyeX(t) + 4 * jolt * Math.sin(u * 47), eyeY(t) + 3 * jolt * Math.sin(u * 61 + 1), eyeZ(t) - 14 * jolt * Math.cos(u * 38)];
      const tgt = [tgtX(t), tgtY(t), tgtZ(t)];
      const f = norm([tgt[0] - eye[0], tgt[1] - eye[1], tgt[2] - eye[2]]);
      const r = norm(cross(f, [0, 1, 1]));
      const up = cross(r, f);
      const ry = rollerY(t);
      const travel = t < R_IN[1] ? R_IN[2] - ry : (R_IN[2] - R_IN[3]) + (ry - R_IN[3]);
      const on1 = t >= R_IN[0] ? 1 : 0, on2 = t >= R_OUT[0] ? 1 : 0;
      const fr1 = t < R_IN[1] ? ry : R_IN[3];
      const fr2 = t < R_OUT[0] ? 1e5 : ry;
      const az = rakeAz(t) * DEG, el = rakeEl(t) * DEG;
      K.pass(prog, null, {
        uF: tF, uP: tP, uRes: [W, H], uEye: eye, uFwd: f, uRight: r, uUp: up, uFocal: focal,
        uPhi: platen(t), uImp: t >= CLOSE[1] ? 1 : 0, uTransfer: t >= CLOSE[1] ? 0.45 : 1, uKeyI: keyI(t),
        uFrame: Math.round(t * 30),
        uRoll: [ry, 150, -travel / RR, t <= 2.35 ? 1 : 0],
        uFront: [fr1, fr1 + 150, fr2, fr2 + 150], uOn: [on1, on1, on2, on2],
        uRake: [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el), rakeI(t)],
        uSpot: [spotX(t), 520, 560],
        uHick: hickU,
      });
    };
  },
  frame(t) { this.draw(t); },
});
