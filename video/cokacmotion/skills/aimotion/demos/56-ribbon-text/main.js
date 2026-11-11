/*
 * 56 · 글자의 강 — the four lines of a short poem flow as rivers of glyphs along 3D curves through dark space.
 *
 *   setup():  every unique syllable is rasterised once (Noto Serif KR 600, 96 px) → signed distance (sub-pixel EDT)
 *             → one R16F atlas with three CPU-built mip levels. Each river is a set of glyph instances that know
 *             only their offset along their river's text (advances measured with measureText).
 *   frame(t): each river's 48 control points are a blend of a "wander" shape (braids: helices around a Bézier axis,
 *             or single Bézier ribbons) and a "confluence" shape (a spiral funnel around the view axis that ends in
 *             one far point), so the rivers can bend into each other. The control points go through a centripetal
 *             Catmull–Rom spline, are resampled at equal arc length and get rotation-minimizing frames by double
 *             reflection (river.js). A glyph sits at s = s0 + v·t − x on its river, faces along the frame, twisted
 *             about the tangent by φ(s, t). One instanced draw renders them; the fragment shader widens the SDF
 *             edge by the circle of confusion, so out-of-focus glyphs become soft bokeh text and the focal plane
 *             stays razor sharp.
 * Story: darkness and faint distant rivers → the camera glides between twisting braids, a ribbon passes overhead,
 * another underfoot → the rivers bend into one spiral funnel while the syllables of the last line leave their
 * rivers one by one and settle, facing us, into one line in perfect focus → the line drifts, loosens and softens.
 */
import { defineDemo, rand, track, ease, clamp, lerp } from '../_lib/stage.js';
import { fontReady, textAlpha, signedDistance } from '../_lib/type.js';
import { createGL, QUAD_VS } from './gl.js';
import { makeCurve, sampleCurve, frameAt, bez3, bez3d, quatFromBasis, slerp, qrot } from './river.js';
import { GLYPH_VS, GLYPH_FS, DUST_VS, DUST_FS, SKY_FS, DOWN_FS, BLUR_FS, FINAL_FS } from './shaders.js';

const D = 10;
const TAU = Math.PI * 2;
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const md = (a, n) => ((a % n) + n) % n;

// ---------------------------------------------------------------- type
const FONT_PX = 96;           // raster size of a glyph in the atlas …
const CELL = 168;             // … centred in a square cell: 36 texels of distance field all round
const ATLAS_COLS = 8;
const SPREAD = 30;            // blur stops where the field would run into the cell border (texels)
const STEM = 3.4;             // typical stroke half-width of Noto Serif KR 600 at 96 px (texels)
const MIPS = 3;               // 168 → 84 → 42 → 21 texels per cell
const FONT = `600 ${FONT_PX}px "Noto Serif KR"`;

const POEM = [
  '어둠을 건너는 작은 빛들이',
  '서로의 이름을 감아 돌다가',
  '굽이진 밤을 지나',
  '마침내 한 줄로 흐른다',
];
const LINE = 3;               // the line that gathers in front of the camera
const TRACK = -0.02;          // tracking of river text (em)
const GAP = 2.4;              // gap between repeats of a line on a river (em)
const WRAP = 250;             // a river's text loop (world units) — longer than any river ever gets
const LINE_TRACK = 0.05;      // tracking of the gathered line (em)
const LINE_WIDTH = 9.3;       // its width in world units: ≈ 870 px at 22 units

// ---------------------------------------------------------------- lens and camera
const FOVY = 50 * Math.PI / 180;
const FPX = 960 / Math.tan(FOVY / 2);         // focal length in stage pixels (≈ 2059)
const T_ARRIVE = 6.6;                          // the glide ends here
const F0 = [0, 0.25, -22];                     // centre of the gathered line
const AIM = [0, -0.6, -22];                    // final aim: the line sits ~80 px above the frame centre (y ≈ 880)
const AXIS_K = F0[1] / F0[2];                  // the funnel axis is the ray from the final camera through F0
const EYE = [0, AXIS_K * -175, -175];          // where every river ends
const CAM_PATH = [[2.0, 1.2, 30], [1.6, -0.9, 20], [-1.1, 0.5, 7], [0, 0, 0]];
const AIM0 = [-1.0, 1.2, -46];
const DRIFT_CAM = [0, 0.1, -0.8];              // afterglow: the camera keeps easing forward a little
const LINE_DRIFT = [0.3, 0.75, -1.0];          // … while the line rises and turns away

// ---------------------------------------------------------------- story
const conv = track([[0, 0], [4.3, 0], [6.8, 1, ease.inOutCubic]]);        // wander → confluence
const roll = track([[0, -0.07], [T_ARRIVE, 0], [D, 0.02]]);
const focusPt = track([[0, [0, 0.5, -34]], [3.9, [0, 0.5, -34]], [6.3, F0], [7.8, F0], [9.8, [0.3, 0.9, -12]]]);
const aperture = track([[0, 250], [5, 290], [7.6, 300], [D, 400]]);        // CoC px = K·|1/z − 1/z_f|
const expo = (t) => ease.outCubic(clamp(t / 1.9)) * (1 - sm((t - 9.15) / 0.85));
const streamGain = track([[0, 1], [5.3, 1], [7.2, 0.5], [D, 0.36]]);
const lineGain = track([[0, 1.0], [6.4, 1.3], [7.35, 1.8], [8.3, 1.45], [D, 1.2]]);
const bloomAmt = track([[0, 0.8], [6.8, 1.0], [7.4, 1.35], [8.5, 1.0], [D, 0.9]]);
const REL0 = 4.85, REL_STEP = 0.1, FLIGHT = 1.6;                           // the line's syllables leave in reading order

// ---------------------------------------------------------------- the rivers
const M = 48;                                  // control points per river
const BRAID_A = [[15, -9.5, 12], [7, -4.5, -6], [-5, 4.5, -28], [-19, 11, -60]];   // near lower right → deep upper left
const BRAID_B = [[24, 6.5, -14], [9, 2.2, -40], [-9, -1.2, -40], [-24, -5.5, -14]]; // across the view, right → left
const STREAMS = [
  // two strands braided round a diagonal axis
  { line: 0, em: 1.0, v: 2.6, axis: BRAID_A, rho: 1.35, pitch: 11, phase: 0, kappa: 0, rc: 9.5, thc: 0.3 },
  { line: 1, em: 1.0, v: 2.6, axis: BRAID_A, rho: 1.35, pitch: 11, phase: Math.PI, kappa: 0, rc: 8.5, thc: 1.1 },
  // three strands across the view, where the line will gather
  { line: 3, em: 1.0, v: 2.3, axis: BRAID_B, rho: 1.7, pitch: 12.5, phase: 0, kappa: 0, rc: 10.0, thc: 1.9 },
  { line: 1, em: 1.0, v: 2.3, axis: BRAID_B, rho: 1.7, pitch: 12.5, phase: TAU / 3, kappa: 0, rc: 8.0, thc: 2.7 },
  { line: 3, em: 1.0, v: 2.3, axis: BRAID_B, rho: 1.7, pitch: 12.5, phase: 2 * TAU / 3, kappa: 0, rc: 10.5, thc: 3.5 },
  // single twisting ribbons: one passes over the camera, one under it; one far away across the sky
  { line: 2, em: 1.1, v: 3.0, axis: [[-17, 8.5, 31], [-5, 5.6, 19], [6, 4.4, 4], [19, 9, -24]], rho: 0, kappa: 0.06, rc: 9.0, thc: 4.3 },
  { line: 0, em: 1.1, v: 2.8, axis: [[19, -8.5, 33], [6, -5.2, 15], [-5, -4.6, -1], [-17, -9, -30]], rho: 0, kappa: -0.05, rc: 11.0, thc: 5.1 },
  { line: 3, em: 1.6, v: 3.4, axis: [[42, 24, -62], [15, 17, -98], [-13, 5, -104], [-42, -13, -72]], rho: 0, kappa: 0, rc: 8.8, thc: 5.9 },
];

const GOLD = [1.0, 0.66, 0.34], IVORY = [1.0, 0.90, 0.74], LINEC = [1.0, 0.87, 0.64], COOL = [0.36, 0.34, 0.66];

/** the wander shape of a river: a helix of radius rho around its Bézier axis (rho 0: the axis itself) */
function wanderCtrl(st) {
  const out = new Float64Array(M * 3);
  const NA = 400, cum = new Float64Array(NA + 1), p = [0, 0, 0], q = bez3(st.axis, 0, [0, 0, 0]);
  for (let i = 1; i <= NA; i++) {
    bez3(st.axis, i / NA, p);
    cum[i] = cum[i - 1] + Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
    q[0] = p[0]; q[1] = p[1]; q[2] = p[2];
  }
  const a = [0, 0, 0], ta = [0, 0, 0];
  for (let i = 0; i < M; i++) {
    const u = i / (M - 1);
    bez3(st.axis, u, a); bez3d(st.axis, u, ta);
    let l = Math.hypot(ta[0], ta[1], ta[2]);
    const tx = ta[0] / l, ty = ta[1] / l, tz = ta[2] / l;
    // e1 = t × up (horizontal, across the axis), e2 = e1 × t
    let e1x = -tz, e1y = 0, e1z = tx;
    l = Math.hypot(e1x, e1z) || 1; e1x /= l; e1z /= l;
    const e2x = e1y * tz - e1z * ty, e2y = e1z * tx - e1x * tz, e2z = e1x * ty - e1y * tx;
    const f = u * NA, i0 = Math.min(NA - 1, Math.floor(f));
    const arc = cum[i0] + (cum[i0 + 1] - cum[i0]) * (f - i0);
    const th = st.phase + TAU * arc / st.pitch;
    const c = Math.cos(th) * st.rho, s = Math.sin(th) * st.rho;
    out[i * 3] = a[0] + c * e1x + s * e2x;
    out[i * 3 + 1] = a[1] + c * e1y + s * e2y;
    out[i * 3 + 2] = a[2] + c * e1z + s * e2z;
  }
  return out;
}

/** the confluence shape: an elliptic spiral funnel round the view axis, from behind the camera (z 24) to EYE */
function funnelCtrl(st, t, out) {
  for (let i = 0; i < M; i++) {
    const u = i / (M - 1);
    const z = 24 - 199 * Math.pow(u, 1.1);
    const env = 0.12 + 0.88 * sm((z + 172) / 142);          // wide round the line, narrowing to the far point
    const rho = st.rc * env;
    const th = st.thc + 0.032 * (24 - z) + 0.09 * t;          // one slow turn along its length, turning in time
    out[i * 3] = 0.82 * rho * Math.cos(th);
    out[i * 3 + 1] = AXIS_K * z + 1.22 * rho * Math.sin(th);  // taller than wide: a portrait funnel
    out[i * 3 + 2] = z;
  }
  return out;
}

// ---------------------------------------------------------------- camera
function cross(a, b, o) { o[0] = a[1] * b[2] - a[2] * b[1]; o[1] = a[2] * b[0] - a[0] * b[2]; o[2] = a[0] * b[1] - a[1] * b[0]; return o; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; a[0] /= l; a[1] /= l; a[2] /= l; return a; }

/** camera pose at t: a Bézier glide with one smooth deceleration into the final position, then a slow drift */
function camera(t, c) {
  const x = clamp(t / T_ARRIVE), v0 = 0.5;                       // cubic Hermite timing: moving at t = 0, at rest on arrival
  const u = v0 * (x * x * x - 2 * x * x + x) + 3 * x * x - 2 * x * x * x;
  bez3(CAM_PATH, u, c.p);
  const a = clamp((t - T_ARRIVE) / (D - T_ARRIVE)), a2 = a * a;
  const e = ease.inOutCubic(clamp(t / 6.4));
  const tg = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    c.p[k] += DRIFT_CAM[k] * a2;
    tg[k] = lerp(AIM0[k], AIM[k], e) + DRIFT_CAM[k] * a2;
  }
  c.f[0] = tg[0] - c.p[0]; c.f[1] = tg[1] - c.p[1]; c.f[2] = tg[2] - c.p[2]; norm(c.f);
  const r = norm([-c.f[2], 0, c.f[0]]);                          // f × up
  const up = cross(r, c.f, [0, 0, 0]);
  const rl = roll(t), cr = Math.cos(rl), sr = Math.sin(rl);
  for (let k = 0; k < 3; k++) { c.r[k] = r[k] * cr + up[k] * sr; c.u[k] = up[k] * cr - r[k] * sr; }
  return c;
}
function viewMatrix(c, m) {
  const { p, f, r, u } = c;
  m[0] = r[0]; m[1] = u[0]; m[2] = -f[0]; m[3] = 0;
  m[4] = r[1]; m[5] = u[1]; m[6] = -f[1]; m[7] = 0;
  m[8] = r[2]; m[9] = u[2]; m[10] = -f[2]; m[11] = 0;
  m[12] = -(r[0] * p[0] + r[1] * p[1] + r[2] * p[2]);
  m[13] = -(u[0] * p[0] + u[1] * p[1] + u[2] * p[2]);
  m[14] = f[0] * p[0] + f[1] * p[1] + f[2] * p[2];
  m[15] = 1;
  return m;
}
function projMatrix(m, near = 0.25, far = 600) {
  const f = 1 / Math.tan(FOVY / 2), nf = 1 / (near - far);
  m.fill(0);
  m[0] = f / (1080 / 1920); m[5] = f; m[10] = (far + near) * nf; m[11] = -1; m[14] = 2 * far * near * nf;
  return m;
}

defineDemo({
  id: '56-ribbon-text',
  title: '글자의 강',
  tech: 'SDF 글리프 아틀라스 · 회전 최소화 프레임 위 글자 배치 · 인스턴싱 · 피사계 심도',
  duration: D,
  background: '#000',
  async setup({ canvas, W, H }) {
    const allText = POEM.join(' ');
    await fontReady(FONT, allText);

    // ---------- glyph atlas: raster → signed distance, one cell per unique syllable ----------
    const uniq = [...new Set(Array.from(allText.replace(/\s/g, '')))];
    const cellOf = new Map(uniq.map((ch, i) => [ch, i]));
    const rows = Math.ceil(uniq.length / ATLAS_COLS);
    const AW = ATLAS_COLS * CELL, AH = rows * CELL;
    const atlas = new Float32Array(AW * AH).fill(SPREAD + 10);
    uniq.forEach((ch, i) => {
      const a = textAlpha(CELL, CELL, (ctx) => {
        ctx.font = FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(ch, CELL / 2, CELL / 2);                    // the em box is centred in the cell
      });
      const d = signedDistance(a, CELL, CELL);
      const ox = (i % ATLAS_COLS) * CELL, oy = Math.floor(i / ATLAS_COLS) * CELL;
      for (let y = 0; y < CELL; y++) atlas.set(d.subarray(y * CELL, (y + 1) * CELL), (oy + y) * AW + ox);
    });
    // advances (em) from the same font
    const mctx = document.createElement('canvas').getContext('2d');
    mctx.font = FONT;
    const advCache = new Map();
    const adv = (ch) => {
      if (!advCache.has(ch)) advCache.set(ch, mctx.measureText(ch).width / FONT_PX);
      return advCache.get(ch);
    };

    const { ctx: gl } = canvas({ type: 'webgl2' });
    const G = createGL(gl);
    const atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, AW, AH, 0, gl.RED, gl.FLOAT, atlas);
    // mip levels: 2×2 box averages of the field, kept in level-0 texel units (cells stay aligned: 168 = 8·21)
    for (let lv = 1, src = atlas, w = AW, h = AH; lv <= MIPS; lv++) {
      const nw = w >> 1, nh = h >> 1, dst = new Float32Array(nw * nh);
      for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
        const i = 2 * y * w + 2 * x;
        dst[y * nw + x] = 0.25 * (src[i] + src[i + 1] + src[i + w] + src[i + w + 1]);
      }
      gl.texImage2D(gl.TEXTURE_2D, lv, gl.R16F, nw, nh, 0, gl.RED, gl.FLOAT, dst);
      src = dst; w = nw; h = nh;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, MIPS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // ---------- rivers: static wander shapes, text instances ----------
    const R = rand(5606);
    const curves = STREAMS.map(() => makeCurve(M, 420));
    const wander = STREAMS.map(wanderCtrl);
    const ctrl = new Float64Array(M * 3), fun = new Float64Array(M * 3);
    const iK = [], iX = [], iCell = [], iWarm = [], iCh = [];
    STREAMS.forEach((st, k) => {
      const items = [];
      let len = 0;
      for (const ch of Array.from(POEM[st.line])) {
        const a = adv(ch) + TRACK;
        if (ch !== ' ') items.push({ ch, x: len + a / 2 });
        len += a;
      }
      len += GAP;
      const reps = Math.ceil(WRAP / (len * st.em));
      st.period = reps * len * st.em;
      st.s0 = R() * st.period;
      st.phi0 = (R() - 0.5) * 0.8;
      for (let r = 0; r < reps; r++) for (const it of items) {
        iK.push(k); iX.push((r * len + it.x) * st.em); iCell.push(cellOf.get(it.ch)); iWarm.push(R()); iCh.push(it.ch);
      }
    });
    const NI = iK.length;
    const iSlot = new Int16Array(NI).fill(-1);

    /** every river's sampled curve at time t */
    const buildStreams = (t) => {
      const c = conv(t);
      STREAMS.forEach((st, k) => {
        funnelCtrl(st, t, fun);
        const W0 = wander[k];
        for (let i = 0; i < M; i++) {
          const o = i * 3;
          ctrl[o] = W0[o] + (fun[o] - W0[o]) * c + 0.35 * Math.sin(0.47 * t + 0.61 * i + 1.3 * k);
          ctrl[o + 1] = W0[o + 1] + (fun[o + 1] - W0[o + 1]) * c + 0.35 * Math.sin(0.39 * t + 0.53 * i + 2.1 * k);
          ctrl[o + 2] = W0[o + 2] + (fun[o + 2] - W0[o + 2]) * c + 0.18 * Math.sin(0.31 * t + 0.7 * i + k);
        }
        sampleCurve(curves[k], ctrl, M);
      });
    };
    const arcPos = (i, t) => md(STREAMS[iK[i]].s0 + STREAMS[iK[i]].v * t - iX[i], STREAMS[iK[i]].period);

    // ---------- the gathered line: slots, a frame that faces the final camera ----------
    const lineChars = Array.from(POEM[LINE]);
    let lw = 0;
    const slotX = [];
    for (const ch of lineChars) { const a = adv(ch) + LINE_TRACK; if (ch !== ' ') slotX.push({ ch, x: lw + a / 2 }); lw += a; }
    lw -= LINE_TRACK;
    const emLine = LINE_WIDTH / lw;
    const camEnd = camera(T_ARRIVE, { p: [0, 0, 0], f: [0, 0, 0], r: [0, 0, 0], u: [0, 0, 0] });
    const LX = camEnd.r.slice(), LY = camEnd.u.slice();
    const RS = rand(3301);
    const slots = slotX.map((s, j) => ({
      ch: s.ch,
      x: (s.x - lw / 2) * emLine,
      tr: REL0 + REL_STEP * j + (RS() - 0.5) * 0.06,
      bulge: [0, 0.45 * (0.7 + 0.6 * RS()), 1.3 * (0.7 + 0.6 * RS())],
      loose: [(RS() - 0.5) * 0.9, (RS() - 0.2) * 0.7, (RS() - 0.5) * 1.6],
      roll: (RS() - 0.5) * 0.3,
      src: -1,
    }));
    const flightE = (t, j) => { const w = clamp((t - slots[j].tr) / FLIGHT); return w * w * w * (w * (w * 6 - 15) + 10); };
    const SP = new Float64Array(9);
    /** slot pose of glyph j at t: centre, x axis, y axis (unit) */
    const slotPose = (t, j, o) => {
      const k = sm((t - 7.5) / 2.5), k2 = k * k, yaw = -0.12 * k, cy = Math.cos(yaw), sy = Math.sin(yaw);
      const Xx = LX[0] * cy + LX[2] * sy, Xy = LX[1], Xz = -LX[0] * sy + LX[2] * cy;
      const Yx = LY[0] * cy + LY[2] * sy, Yy = LY[1], Yz = -LY[0] * sy + LY[2] * cy;
      const s = slots[j], x = s.x;
      o[0] = F0[0] + LINE_DRIFT[0] * k + Xx * x + s.loose[0] * k2;
      o[1] = F0[1] + LINE_DRIFT[1] * k + Xy * x + s.loose[1] * k2;
      o[2] = F0[2] + LINE_DRIFT[2] * k + Xz * x + s.loose[2] * k2;
      const a = s.roll * k2, ca = Math.cos(a), sa = Math.sin(a);
      o[3] = Xx * ca + Yx * sa; o[4] = Xy * ca + Yy * sa; o[5] = Xz * ca + Yz * sa;
      o[6] = Yx * ca - Xx * sa; o[7] = Yy * ca - Xy * sa; o[8] = Yz * ca - Xz * sa;
      return o;
    };

    // ---------- which glyph of which river becomes each syllable of the line ----------
    // at its release time, the best candidate is visible, in front of us at a moderate depth and not too far
    // across the frame from its slot; spreading the picks over different rivers makes the rivers converge
    {
      const cam = { p: [0, 0, 0], f: [0, 0, 0], r: [0, 0, 0], u: [0, 0, 0] };
      const F9 = new Float64Array(9), used = new Set(), perStream = new Array(STREAMS.length).fill(0);
      const project = (P, c) => {
        const rx = P[0] - c.p[0], ry = P[1] - c.p[1], rz = P[2] - c.p[2];
        const zv = rx * c.f[0] + ry * c.f[1] + rz * c.f[2];
        return [zv, 540 + FPX * (rx * c.r[0] + ry * c.r[1] + rz * c.r[2]) / zv, 960 - FPX * (rx * c.u[0] + ry * c.u[1] + rz * c.u[2]) / zv];
      };
      slots.forEach((sl, j) => {
        const goal = project(slotPose(7.3, j, SP), camera(7.3, cam));
        buildStreams(sl.tr);
        camera(sl.tr, cam);
        let best = -1, bestCost = Infinity;
        for (let pass = 0; pass < 3 && best < 0; pass++) {
          for (let i = 0; i < NI; i++) {
            if (iCh[i] !== sl.ch || used.has(i)) continue;
            const cv = curves[iK[i]], s = arcPos(i, sl.tr);
            if (pass < 2 && (s < 14 || s > cv.length - 14)) continue;
            frameAt(cv, Math.min(s, cv.length), F9);
            const [zv, sx, sy] = project(F9, cam);
            if (pass === 0 && (zv < 9 || zv > 75 || sx < 60 || sx > 1020 || sy < 160 || sy > 1560)) continue;
            if (pass === 1 && zv < 4) continue;
            const cost = Math.abs(zv - 30) / 25 + Math.hypot(sx - goal[1], sy - goal[2]) / 900 + perStream[iK[i]] * 0.3
              + (pass === 2 ? 10 + Math.max(0, 4 - zv) : 0);
            if (cost < bestCost) { bestCost = cost; best = i; }
          }
        }
        if (best >= 0) { used.add(best); perStream[iK[best]]++; iSlot[best] = j; sl.src = best; }
      });
    }

    // ---------- GL: programs, instance buffer, dust ----------
    const PG = G.program(GLYPH_VS, GLYPH_FS);
    const PD = G.program(DUST_VS, DUST_FS);
    const PS = G.program(QUAD_VS, SKY_FS), PDN = G.program(QUAD_VS, DOWN_FS), PBL = G.program(QUAD_VS, BLUR_FS), PFN = G.program(QUAD_VS, FINAL_FS);

    const vaoG = gl.createVertexArray();
    gl.bindVertexArray(vaoG);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const instBuf = gl.createBuffer();
    const buf = new Float32Array(NI * 16);
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferData(gl.ARRAY_BUFFER, buf.byteLength, gl.DYNAMIC_DRAW);
    for (let a = 1; a <= 4; a++) {
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 4, gl.FLOAT, false, 64, (a - 1) * 16);
      gl.vertexAttribDivisor(a, 1);
    }
    gl.bindVertexArray(null);

    // dust: most of it through the whole corridor, a little more round the place where the line gathers
    const RD = rand(9090), ND = 1700;
    const dd = new Float32Array(ND * 8);
    for (let i = 0; i < ND; i++) {
      const wide = i < 1250;
      const x = (RD() * 2 - 1) * (wide ? 13 : 5), y = (RD() * 2 - 1) * (wide ? 19 : 6), z = wide ? 34 - RD() * 140 : 8 - RD() * 22;
      const warm = RD() < 0.7 ? 0.75 + 0.25 * RD() : 0.15 * RD();
      dd.set([x, y, z, 0.012 + 0.035 * RD() * RD(), RD() * TAU, 0.35 + 0.9 * RD() * RD() * RD(), warm, RD()], i * 8);
    }
    const vaoD = gl.createVertexArray();
    gl.bindVertexArray(vaoD);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, dd, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16);
    gl.bindVertexArray(null);
    const maxPt = Math.min(160, gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1] || 64);

    const scene = G.target(W, H);
    const qa = G.target(W / 4, H / 4), qb = G.target(W / 4, H / 4);
    const ea = G.target(W / 8, H / 8), eb = G.target(W / 8, H / 8);
    const gain = G.half ? 1 : 0.6;                               // an 8-bit buffer clips sooner

    const view = new Float32Array(16), proj = projMatrix(new Float32Array(16));
    const cam = { p: [0, 0, 0], f: [0, 0, 0], r: [0, 0, 0], u: [0, 0, 0] };
    const F9 = new Float64Array(9), QA = [0, 0, 0, 1], QB = [0, 0, 0, 1], QQ = [0, 0, 0, 1];
    const vX = [0, 0, 0], vY = [0, 0, 0], vZ = [0, 0, 0], sX = [0, 0, 0], sY = [0, 0, 0], sZ = [0, 0, 0];

    /** every glyph's pose and light at t → instance buffer; returns the number written */
    const place = (t) => {
      const c = conv(t), sg = streamGain(t) * gain, lg = lineGain(t) * gain;
      const cp = cam.p, cf = cam.f, cr = cam.r, cu = cam.u;
      let n = 0;
      for (let i = 0; i < NI; i++) {
        const k = iK[i], st = STREAMS[k], cv = curves[k], L = cv.length;
        const s = arcPos(i, t);
        const j = iSlot[i];
        const e = j >= 0 ? flightE(t, j) : 0;
        if (e <= 0 && s > L) continue;
        let px = 0, py = 0, pz = 0, em = st.em, cR = 0, cG = 0, cB = 0;
        if (e < 1) {
          frameAt(cv, Math.min(s, L), F9);
          const tx = F9[3], ty = F9[4], tz = F9[5], nx = F9[6], ny = F9[7], nz = F9[8];
          const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;     // B = T × N
          const ph = st.phi0 + st.kappa * s + 0.35 * Math.sin(0.4 * t + k);                // twist about the tangent
          const cph = Math.cos(ph), sph = Math.sin(ph);
          vX[0] = -tx; vX[1] = -ty; vX[2] = -tz;                     // reading direction against the flow: the line's head leads
          vY[0] = cph * nx + sph * bx; vY[1] = cph * ny + sph * by; vY[2] = cph * nz + sph * bz;
          px = F9[0]; py = F9[1]; pz = F9[2];
          // light pulses running down the river faster than the text flows
          const pu = 0.5 + 0.5 * Math.cos(TAU * (s - 8.5 * t - 13 * k) / 52), p2 = pu * pu, p4 = p2 * p2;
          const inten = 1.1 * (0.72 + 0.9 * p4 * p4) * sm(s / 12) * sm((L - s) / 12) * sg;
          const wm = 0.12 + 0.5 * iWarm[i];
          cR = lerp(GOLD[0], IVORY[0], wm) * inten; cG = lerp(GOLD[1], IVORY[1], wm) * inten; cB = lerp(GOLD[2], IVORY[2], wm) * inten;
        }
        if (e > 0) {
          slotPose(t, j, SP);
          if (e >= 1) {
            px = SP[0]; py = SP[1]; pz = SP[2];
            vX[0] = SP[3]; vX[1] = SP[4]; vX[2] = SP[5]; vY[0] = SP[6]; vY[1] = SP[7]; vY[2] = SP[8];
          } else {
            // leave the river: position eases to the slot along a slight arc, orientation slerps to face the camera
            cross(vX, vY, vZ);
            quatFromBasis(vX, vY, vZ, QA);
            sX[0] = SP[3]; sX[1] = SP[4]; sX[2] = SP[5]; sY[0] = SP[6]; sY[1] = SP[7]; sY[2] = SP[8];
            cross(sX, sY, sZ);
            quatFromBasis(sX, sY, sZ, QB);
            slerp(QA, QB, e, QQ);
            qrot(QQ, 1, 0, 0, vX); qrot(QQ, 0, 1, 0, vY);
            const b = Math.sin(Math.PI * e), bu = slots[j].bulge;
            px = lerp(px, SP[0], e) + bu[0] * b; py = lerp(py, SP[1], e) + bu[1] * b; pz = lerp(pz, SP[2], e) + bu[2] * b;
          }
          em = lerp(st.em, emLine, e);
          cR = lerp(cR, LINEC[0] * lg, e); cG = lerp(cG, LINEC[1] * lg, e); cB = lerp(cB, LINEC[2] * lg, e);
        }
        // view-space fades: too close, fog, and (while the rivers converge) a quiet zone round the line
        const rx = px - cp[0], ry = py - cp[1], rz = pz - cp[2];
        const zv = rx * cf[0] + ry * cf[1] + rz * cf[2];
        if (zv < 2.5) continue;
        const near = sm((zv - 2.5) / 4);
        const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);
        const fog = Math.exp(-Math.max(dist - 16, 0) * 0.017);
        let dim = 1;
        if (j < 0 && c > 0) {
          const sx = 540 + FPX * (rx * cr[0] + ry * cr[1] + rz * cr[2]) / zv;
          const sy = 960 - FPX * (rx * cu[0] + ry * cu[1] + rz * cu[2]) / zv;
          const qx = (sx - 540) / 520, qy = (sy - 880) / 200;
          dim = 1 - 0.75 * c * Math.exp(-qx * qx - qy * qy);
        }
        const a = near * fog * dim, cool = 0.5 * (1 - fog) * (cR + cG + cB) / 3;
        const oR = (cR + COOL[0] * cool) * a, oG = (cG + COOL[1] * cool) * a, oB = (cB + COOL[2] * cool) * a;
        if (oR + oG + oB < 0.004) continue;
        const o = n * 16;
        buf[o] = px; buf[o + 1] = py; buf[o + 2] = pz; buf[o + 3] = iCell[i];
        buf[o + 4] = vX[0] * em; buf[o + 5] = vX[1] * em; buf[o + 6] = vX[2] * em; buf[o + 7] = oR;
        buf[o + 8] = vY[0] * em; buf[o + 9] = vY[1] * em; buf[o + 10] = vY[2] * em; buf[o + 11] = oG;
        buf[o + 12] = oB;
        n++;
      }
      return n;
    };

    const project2 = (P) => {
      const rx = P[0] - cam.p[0], ry = P[1] - cam.p[1], rz = P[2] - cam.p[2];
      const zv = Math.max(rx * cam.f[0] + ry * cam.f[1] + rz * cam.f[2], 1e-3);
      return [540 + FPX * (rx * cam.r[0] + ry * cam.r[1] + rz * cam.r[2]) / zv, 960 - FPX * (rx * cam.u[0] + ry * cam.u[1] + rz * cam.u[2]) / zv];
    };

    this.draw = (t) => {
      const c = conv(t);
      camera(t, cam);
      buildStreams(t);
      const n = place(t);
      viewMatrix(cam, view);
      const fp = focusPt(t);
      const df = Math.max((fp[0] - cam.p[0]) * cam.f[0] + (fp[1] - cam.p[1]) * cam.f[1] + (fp[2] - cam.p[2]) * cam.f[2], 2);
      const K = aperture(t);

      // 1. the void
      gl.disable(gl.BLEND);
      const eye = project2(EYE);
      G.pass(PS, scene, (u) => { gl.uniform2f(u.uEye, eye[0], eye[1]); gl.uniform1f(u.uC, c); gl.uniform1f(u.uT, t); });
      // 2. dust and glyphs, additive (they emit light)
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(PD.p);
      gl.uniformMatrix4fv(PD.u.uView, false, view); gl.uniformMatrix4fv(PD.u.uProj, false, proj);
      gl.uniform1f(PD.u.uT, t); gl.uniform1f(PD.u.uK, K); gl.uniform1f(PD.u.uDf, df); gl.uniform1f(PD.u.uFpx, FPX);
      gl.uniform1f(PD.u.uMaxPt, maxPt); gl.uniform1f(PD.u.uGain, 0.55 * gain);
      gl.bindVertexArray(vaoD);
      gl.drawArrays(gl.POINTS, 0, ND);

      gl.useProgram(PG.p);
      gl.uniformMatrix4fv(PG.u.uView, false, view); gl.uniformMatrix4fv(PG.u.uProj, false, proj);
      gl.uniform1f(PG.u.uHalf, CELL / FONT_PX / 2); gl.uniform1f(PG.u.uCell, CELL); gl.uniform1f(PG.u.uCols, ATLAS_COLS);
      gl.uniform1f(PG.u.uK, K); gl.uniform1f(PG.u.uDf, df);
      gl.uniform2f(PG.u.uAtlasSize, AW, AH); gl.uniform1f(PG.u.uSpread, SPREAD); gl.uniform1f(PG.u.uStem, STEM);
      G.tex(0, atlasTex, PG.u.uAtlas);
      gl.bindVertexArray(vaoG);
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, buf, 0, n * 16);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
      gl.bindVertexArray(null);
      gl.disable(gl.BLEND);

      // 3. bloom: quarter and eighth resolution
      G.pass(PDN, qa, (u) => { G.tex(0, scene, u.src); gl.uniform2f(u.px, 1 / W, 1 / H); });
      G.pass(PBL, qb, (u) => { G.tex(0, qa, u.src); gl.uniform2f(u.dir, 4 / W, 0); });
      G.pass(PBL, qa, (u) => { G.tex(0, qb, u.src); gl.uniform2f(u.dir, 0, 4 / H); });
      G.pass(PDN, ea, (u) => { G.tex(0, qa, u.src); gl.uniform2f(u.px, 4 / W, 4 / H); });
      G.pass(PBL, eb, (u) => { G.tex(0, ea, u.src); gl.uniform2f(u.dir, 8 / W, 0); });
      G.pass(PBL, ea, (u) => { G.tex(0, eb, u.src); gl.uniform2f(u.dir, 0, 8 / H); });
      // 4. tone map to the canvas
      G.pass(PFN, null, (u) => {
        G.tex(0, scene, u.uScene); G.tex(1, qa, u.uBloomA); G.tex(2, ea, u.uBloomB);
        gl.uniform1f(u.uExpo, expo(t)); gl.uniform1f(u.uFrame, Math.round(t * 30)); gl.uniform1f(u.uBloom, bloomAmt(t));
      });
    };
  },
  frame(t) { this.draw(t); },
});
