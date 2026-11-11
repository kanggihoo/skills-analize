/*
 * 23 · 1997년 비디오테이프 — a home video from 1997, played from VHS on a Trinitron-style CRT.
 * Per video field (59.94/s; the picture only changes when the field index changes):
 *   scene.js  camcorder frame (720×480): candle-lit birthday cake, CCD smear, AGC noise, date stamp
 *   RECORD    → tape (720×240 YIQ): band-limited luma, smeared and delayed chroma
 *   PLAY      → video (720×240 RGB): time-base wobble, tracking bands, dropouts, hiss, peaking, OSD
 *   bloom     → 360×120 light pyramid
 * then every call: CRT on the stage (curved glass, scanlines, grille, bezel) incl. the power-off collapse.
 */
import { defineDemo, track, ease, clamp, lerp, ramp } from '../_lib/stage.js';
import { SCENE_FS } from './scene.js';
import { RECORD_FS, PLAY_FS, LIN_FS, DOWN_FS, UP_FS, FS_VS, CRT_FS } from './vhs.js';

const D = 10, FIELDS = 59.94;
const G = { PCX: 540, PCY: 820, PH: 620, SLOT0: 1495, SLOT1: 1690, LEDX: 930, LEDY: 1590 };
const T_OFF = 8.45;

function hash1(n, s = 0) {
  let x = (Math.imul(n | 0, 374761393) + Math.imul(s | 0, 668265263) + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
function sn(x, s) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return 2 * lerp(hash1(i, s), hash1(i + 1, s), u) - 1;
}

// ---------- the home video (field time) ----------
const ZOOM = track([[0, 1.0], [1.3, 1.0], [3.8, 1.16, ease.inOutCubic], [10, 1.16]]);
const AGC = track([[0, 1], [6.95, 1], [7.6, 2.6, ease.outCubic], [8.4, 3.3]]);
const T_OUT = [0.2, 0.12, 0.05, 0.0, 0.07, 0.15, 0.24].map((d) => 6.93 + d);   // blown out from the middle
function candles(tf) {
  const fl = [], fs = [];
  const blow = ramp(tf, 6.8, 6.93);
  for (let i = 0; i < 7; i++) {
    const th = ((30 + 20 * i) * Math.PI) / 180;
    const x = 0.667 + 0.19 * Math.cos(th), y = 0.39 + 0.042 * Math.sin(th) + 0.092;
    let h = 0.038 * (1 + 0.08 * sn(tf * 6 + i * 3.1, 30 + i) + 0.05 * sn(tf * 15, 40 + i));
    let sway = 0.1 * sn(tf * 2.5 + i, 50 + i) + 0.06 * sn(tf * 8, 60 + i);
    h *= 1 - 0.45 * blow;
    sway += blow * 0.7 * sn(tf * 20, 70 + i);
    const lit = clamp((T_OUT[i] - tf) / 0.05);
    const age = tf >= T_OUT[i] ? tf - T_OUT[i] : -1;
    fl.push(x, y, h, sway);
    fs.push(lit, age, age >= 0 ? Math.exp(-age / 0.7) : 0, lit * (h / 0.038) * (1 + 0.15 * sn(tf * 9, 80 + i)));
  }
  return { fl, fs };
}

// ---------- the VCR (field index / time) ----------
const SNOW = track([[0.33, 0.85], [0.55, 0.35], [0.95, 0.0]]);
const TRK_START = track([[0.33, 0.9], [0.7, 0.55], [1.3, 0.0]]);
const TRK_EP = track([[3.9, 0], [4.35, 0.3], [4.75, 1.0], [5.25, 0.95], [5.55, 0.5], [5.85, 0.15], [6.1, 0.0]]);
const METER = track([[4.85, 0.1], [5.15, 0.3], [5.45, 0.5], [5.75, 0.6], [6.45, 0.6]]);
function vcr(tf) {
  const k = clamp((tf - 0.33) / 0.39);
  return {
    blue: tf < 0.33 ? 1 : 0,
    roll: tf >= 0.33 && tf < 0.72 ? (262 * 1.7 * (1 - k) * (1 - k)) % 262 : 0,
    snow: tf < 0.33 ? 0 : SNOW(tf),
    trk: Math.max(tf < 0.33 ? 0 : TRK_START(tf), TRK_EP(tf)),
    osdPlay: tf < 3.3 ? 1 : 0,
    osdTrk: tf >= 4.85 && tf < 6.45 ? 1 : 0,
    meter: METER(tf),
  };
}

// ---------- the television's power-off ----------
function tv(t) {
  const on = { mode: 0, vs: 1, hs: 1, line: 0, dot: 0, glow: 0, led: [0.12, 0.9, 0.3] };
  if (t < T_OFF) return on;
  const dt = t - T_OFF, led = [0.95, 0.1, 0.04];
  if (dt < 0.1) return { ...on, vs: lerp(1, 0.12, ease.inCubic(dt / 0.1)), led };
  if (dt < 0.3) {
    const hs = dt < 0.13 ? 1 : lerp(1, 0, ease.inOutCubic((dt - 0.13) / 0.17));
    return { mode: 1, vs: lerp(0.012, 0.005, (dt - 0.1) / 0.2), hs, line: 2.6, dot: 0, glow: 0.05 * hs, led };
  }
  const d = 0.9 * Math.exp(-(dt - 0.3) / 0.45) + 0.1 * Math.exp(-(dt - 0.3) / 1.5);
  return { mode: 1, vs: 0.005, hs: 0, line: 0, dot: d, glow: 0.02 * d, led };
}

// ---------- text: the chocolate writing, the camcorder date stamp, the VCR character generator ----------
function textCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g);
  return c;
}
const MONO = '"DejaVu Sans Mono", "Menlo", "Consolas", "Courier New", monospace';

defineDemo({
  id: '23-vhs',
  title: '1997년 비디오테이프',
  tech: 'WebGL2 후처리 · YIQ 색 번짐·트래킹 노이즈·브라운관',
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
      scene: program(SCENE_FS, ['res', 'tf', 'uGain', 'uField', 'uZoom', 'uShake', 'uFl', 'uFs', 'uText', 'uStamp']),
      record: program(RECORD_FS, ['uCam']),
      play: program(PLAY_FS, ['uTape', 'uOSD', 'uField', 'uTrk', 'uBlue', 'uRoll', 'uSnow', 'uOsdPlay', 'uOsdTrk', 'uMeter']),
      lin: program(LIN_FS, ['src', 'texel']),
      down: program(DOWN_FS, ['src', 'texel']),
      up: program(UP_FS, ['src', 'texel']),
      crt: program(CRT_FS(G), ['uSig', 'uBloom', 'uAvg', 'uRes', 'uMode', 'uVs', 'uHs', 'uGain', 'uLine', 'uDot', 'uGlow', 'uLed']),
    };
    const fsV = gl.createVertexArray();
    gl.bindVertexArray(fsV);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const texParams = () => {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    const target = (w, h) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      texParams();
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete');
      return { tex, fb, w, h };
    };
    const upload = (cv) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      texParams();
      return tex;
    };

    // chocolate writing on the cake top (the canvas is the top disc seen from above; the front is its lower half)
    const cakeText = upload(textCanvas(512, 512, (g) => {
      g.fillStyle = '#000';
      g.textAlign = 'center';
      g.font = '800 92px "Pretendard Variable", Pretendard, sans-serif';
      g.fillText('생일', 256, 322);
      g.font = '800 96px "Pretendard Variable", Pretendard, sans-serif';
      g.fillText('축하해', 256, 432);
    }));
    // the camcorder's date stamp, keyed into the picture before it reaches the tape
    const stamp = upload(textCanvas(720, 480, (g) => {
      g.font = `bold 34px ${MONO}`;
      g.textAlign = 'right';
      g.lineJoin = 'round';
      for (const [s, y] of [['PM  8:42', 414], ['1997. 6.14', 452]]) {
        g.lineWidth = 5; g.strokeStyle = 'rgba(10,8,6,0.9)'; g.strokeText(s, 596, y);
        g.fillStyle = '#f4f0d8'; g.fillText(s, 596, y);
      }
    }));
    // the VCR's character generator: 720 samples × 240 lines, glyphs drawn squashed so they come out square on the tube
    const osd = upload(textCanvas(720, 240, (g) => {
      g.setTransform(1, 0, 0, 0.45, 0, 0);
      g.lineJoin = 'round';
      g.font = `bold 44px ${MONO}`;
      const outline = (fn) => { g.lineWidth = 6; g.strokeStyle = '#050505'; fn(true); g.fillStyle = '#f2f6f2'; fn(false); };
      outline((stroke) => {
        g.beginPath(); g.moveTo(150, 52); g.lineTo(150, 92); g.lineTo(180, 72);
        if (stroke) g.stroke(); else g.fill();
        if (stroke) g.strokeText('PLAY', 194, 92); else g.fillText('PLAY', 194, 92);
      });
      g.textAlign = 'center';
      outline((stroke) => (stroke ? g.strokeText('TRACKING', 360, 436) : g.fillText('TRACKING', 360, 436)));
    }));

    const camT = target(720, 480), tapeT = target(720, 240), sigT = target(720, 240);
    const bl = [target(360, 120), target(180, 60), target(90, 30)];
    const pass = (prog, dst) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      gl.useProgram(prog.p);
      gl.bindVertexArray(fsV);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const bind = (unit, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); };

    let cachedF = -1;
    const field = (F) => {
      if (F === cachedF) return;
      cachedF = F;
      const tf = F / FIELDS;
      gl.disable(gl.BLEND);
      // camcorder
      const c = candles(tf), s = P.scene;
      gl.useProgram(s.p);
      bind(0, cakeText); bind(1, stamp);
      gl.uniform1i(s.u.uText, 0); gl.uniform1i(s.u.uStamp, 1);
      gl.uniform2f(s.u.res, 720, 480);
      gl.uniform1f(s.u.tf, tf);
      gl.uniform1f(s.u.uGain, AGC(tf));
      gl.uniform1f(s.u.uField, F);
      gl.uniform1f(s.u.uZoom, ZOOM(tf));
      gl.uniform2f(s.u.uShake, 0.004 * sn(tf * 1.1, 1) + 0.002 * sn(tf * 3.3, 2), 0.003 * sn(tf * 0.9, 3) + 0.0015 * sn(tf * 2.7, 4));
      gl.uniform4fv(s.u.uFl, new Float32Array(c.fl));
      gl.uniform4fv(s.u.uFs, new Float32Array(c.fs));
      pass(s, camT);
      // record onto tape
      gl.useProgram(P.record.p);
      bind(0, camT.tex);
      gl.uniform1i(P.record.u.uCam, 0);
      pass(P.record, tapeT);
      // play back through the VCR
      const v = vcr(tf), pl = P.play;
      gl.useProgram(pl.p);
      bind(0, tapeT.tex); bind(1, osd);
      gl.uniform1i(pl.u.uTape, 0); gl.uniform1i(pl.u.uOSD, 1);
      gl.uniform1f(pl.u.uField, F);
      gl.uniform1f(pl.u.uTrk, v.trk);
      gl.uniform1f(pl.u.uBlue, v.blue);
      gl.uniform1f(pl.u.uRoll, v.roll);
      gl.uniform1f(pl.u.uSnow, v.snow);
      gl.uniform1f(pl.u.uOsdPlay, v.osdPlay);
      gl.uniform1f(pl.u.uOsdTrk, v.osdTrk);
      gl.uniform1f(pl.u.uMeter, v.meter);
      pass(pl, sigT);
      // light pyramid for the glass halation and for the light the picture throws on the cabinet
      gl.useProgram(P.lin.p);
      bind(0, sigT.tex);
      gl.uniform1i(P.lin.u.src, 0);
      gl.uniform2f(P.lin.u.texel, 1 / 720, 1 / 240);
      pass(P.lin, bl[0]);
      gl.useProgram(P.down.p);
      gl.uniform1i(P.down.u.src, 0);
      for (let i = 1; i < bl.length; i++) {
        bind(0, bl[i - 1].tex);
        gl.uniform2f(P.down.u.texel, 1 / bl[i - 1].w, 1 / bl[i - 1].h);
        pass(P.down, bl[i]);
      }
      // tent up-sweep adds into levels 1 and 0; the coarsest level (90×30) stays untouched and serves as the room light
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P.up.p);
      gl.uniform1i(P.up.u.src, 0);
      for (let i = bl.length - 1; i > 0; i--) {
        bind(0, bl[i].tex);
        gl.uniform2f(P.up.u.texel, 1 / bl[i].w, 1 / bl[i].h);
        pass(P.up, bl[i - 1]);
      }
      gl.disable(gl.BLEND);
    };

    this.draw = (t) => {
      const F = Math.min(Math.floor(t * FIELDS + 1e-6), Math.floor(D * FIELDS) - 1);
      field(F);
      const s = tv(t), u = P.crt.u;
      gl.useProgram(P.crt.p);
      bind(0, sigT.tex); bind(1, bl[0].tex); bind(2, bl[2].tex);
      gl.uniform1i(u.uSig, 0); gl.uniform1i(u.uBloom, 1); gl.uniform1i(u.uAvg, 2);
      gl.uniform2f(u.uRes, W, H);
      gl.uniform1f(u.uMode, s.mode);
      gl.uniform1f(u.uVs, s.vs);
      gl.uniform1f(u.uHs, Math.max(s.hs, 1e-3));
      gl.uniform1f(u.uGain, 1);
      gl.uniform1f(u.uLine, s.line);
      gl.uniform1f(u.uDot, s.dot);
      gl.uniform1f(u.uGlow, s.glow);
      gl.uniform3f(u.uLed, ...s.led);
      pass(P.crt, null);
    };
  },
  frame(t) { this.draw(t); },
});
