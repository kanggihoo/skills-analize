/*
 * 100 · 지금 — echo & stretch typography, the repetition device of contemporary motion posters.
 * One word, repeated into echoes. Echo k is the same word sampled on the same motion curve at t − k·δ, so every
 * move trails a slinky of copies that fans out while the word moves and folds back in when it rests. Echoes
 * alternate outline and fill; the word stretches far past normal and its outlines stay one even width because the
 * glyph contours are transformed point by point and stroked untransformed.
 *
 * A poster in three flat inks on printed paper, four movements on a six-column grid:
 *   01 메아리  the word falls in, fans out like a hand of cards, cascades down the sheet (echoes pour, pile, fold)
 *   02 늘임    the word is pulled tall through the frame, then squashed flat; the echoes lag the stretch
 *   03 물결    the echoes become rows above and below the front copy; a wave runs out through the stack
 *   04 하나    every echo snaps onto the front copy: one solid word remains
 */
import { defineDemo, rand, ease, clamp, lerp, track, ramp } from '../_lib/stage.js';
import { fontReady, loadOutlineFont, outlineContours } from '../_lib/type.js';

const W = 1080, H = 1920, D = 10, TAU = Math.PI * 2, DEG = Math.PI / 180;
const C_PAPER = [236, 228, 211], C_INK = [23, 20, 15], C_RED = [236, 59, 27];
const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const PAPER = rgba(C_PAPER), INK = rgba(C_INK), RED = rgba(C_RED);
const SANS = 'Pretendard Variable', MONO = 'JetBrains Mono Variable';
const WORD = '지금';
const COPY = ['지나간 순간들이', '하나로 포개진다'];
const LABELS = ['메아리', '늘임', '물결', '하나'];
const M = 64;                 // sheet margin
const GRID_TOP = 236, GRID_BOT = 1588, BAND = 1660;
const FLOOR = 1560;           // the line the word stands on (cascade landing, stretch)
const CY = 900;               // centre line of the wave stack and of the last word
const WORD_W = 640;           // width of the word's ink at scale 1
const STROKE = 5;             // outline width (px), the same at every stretch
const PIV = 40;               // the fan pivots this far below the word's anchor
const LEVELS = 10;            // echoes behind the front copy (메아리, 늘임)
const ROWS = 6;               // echo rows on each side of the front copy (물결)
const PITCH = 100;            // px between rows
const DELTA = 0.05;           // s between echoes (메아리, 늘임)
const DELTA_W = 0.13;         // s between rows (물결)
const DELTA_G = 0.045;        // s between rows as the stack opens
const WAVE_HZ = 1.05;

// ---------------------------------------------------------------- timeline (s)
const T = {
  enter: 0.10, land: 0.55,                      // falls in from above
  swing: 0.85,                                  // the fan (rotation about a pivot below the word)
  drop: 2.0, floor: 2.55,                       // the cascade down the sheet
  wipe2: 2.86,                                  // paper → red
  pull: 3.1, tall: 3.55, hold: 4.05, squash: 4.25, settle: 4.7,
  wipe3: 4.6,                                   // red → ink
  fold: 4.55, folded: 4.9,                      // echo delay → 0 (the stack re-forms as rows)
  rise: 4.7, risen: 5.2, open: 4.95, waveOn: 5.0,
  collapse: 6.3, impact: 6.55,                  // every echo onto the front copy
  copy1: 6.95, copy2: 7.25,
};
const WIPE_LEN = 0.34, WIPE_ST = 0.035, WIPE_SPAN = WIPE_LEN + 5 * WIPE_ST;

const outBack = (c) => (p) => ease.outBack(p, c);
const lin = (p) => p;
/** impulse response: 0 at τ = 0, swings ±1 and dies out */
const wob = (tau, f, d) => (tau <= 0 ? 0 : Math.exp(-d * tau) * Math.sin(TAU * f * tau));

// the motion curve of the word: anchor position, scale, rotation, anchor fraction (0 = bottom, 0.5 = centre)
const LAND = 800;             // where the word first lands (its feet)
const ROW_SY = 0.36;          // height of a wave row, × the word
const END_S = [1.28, 1.34];   // the last word: scale at the snap → at the end (slow push)
const TALL = 1290;            // px: how tall the word is pulled (feet on FLOOR)
const Y = track([[T.enter, -40], [T.land, LAND, outBack(1.4)], [T.drop, LAND], [T.floor, FLOOR, ease.inOutCubic],
  [T.rise, FLOOR], [T.risen, CY, ease.inOutCubic]]);
const AF = track([[T.rise, 0], [T.risen, 0.5, ease.inOutCubic]]);
let SY = null;                // set in setup, once the word's ink height is known
function buildStretch(H0) {
  const tall = TALL / H0;
  SY = track([[T.pull, 1], [T.tall, tall, outBack(1.2)], [T.hold, tall], [T.squash, 0.45, ease.inCubic], [T.settle, 1, outBack(2.2)],
    [T.risen, ROW_SY, ease.inOutCubic], [T.collapse, ROW_SY], [T.impact, END_S[0], ease.inCubic], [D, END_S[1], lin]]);
}
const SX = track([[T.pull, 1], [T.tall, 0.8, outBack(1.2)], [T.hold, 0.8], [T.squash, 1.45, ease.inCubic], [T.settle, 1, outBack(2.2)],
  [T.collapse, 1], [T.impact, END_S[0], ease.inCubic], [D, END_S[1], lin]]);
const ROT = track([[T.swing, 0], [1.12, -24, ease.outCubic], [1.48, 18], [1.74, -6], [1.94, 0]]);   // degrees
const collapseK = (t) => ease.inCubic(clamp((t - T.collapse) / (T.impact - T.collapse)));
const gapK = (u) => ease.outCubic(clamp((u - T.open) / 0.5));

function basePose(u) {
  // landings squash the word on its feet; the snap squashes it about its centre (echoes sample these too)
  const land = 0.16 * wob(u - T.land + 0.12, 2.4, 6) + 0.2 * wob(u - T.floor, 2.2, 6);
  const snap = 0.2 * wob(u - T.impact, 2.3, 5);
  return {
    x: W / 2, y: Y(u), rot: ROT(u) * DEG, af: AF(u),
    sx: SX(u) * (1 + 0.6 * land + 0.6 * snap), sy: SY(u) * (1 - land - snap),
  };
}
/** the wave through the stack: a sideways sway, a horizontal stretch and a height pulse, all in one phase */
function applyWave(p, u, amp) {
  const e = ramp(u, T.waveOn, T.waveOn + 0.5) * amp;
  if (e <= 0) return p;
  const ph = TAU * WAVE_HZ * (u - T.waveOn);
  p.x += 120 * e * Math.sin(ph);
  p.sx *= 1 + 0.3 * e * Math.cos(ph);
  p.sy *= 1 + 0.22 * e * Math.sin(ph + 1.1);
  return p;
}

// ---------------------------------------------------------------- palettes (three inks, roles swap per movement)
const MUTE = (c, a) => rgba(c, a);
const PAL = {
  echo: { bg: PAPER, ink: INK, mute: MUTE(C_INK, 0.13), cross: MUTE(C_INK, 0.42),
    front: { fill: INK, stroke: INK }, odd: { fill: PAPER, stroke: INK }, even: { fill: RED, stroke: RED } },
  stretch: { bg: RED, ink: INK, mute: MUTE(C_INK, 0.16), cross: MUTE(C_INK, 0.5),
    front: { fill: INK, stroke: INK }, odd: { fill: RED, stroke: INK }, even: { fill: PAPER, stroke: INK } },
  wave: { bg: INK, ink: PAPER, mute: MUTE(C_PAPER, 0.12), cross: MUTE(C_PAPER, 0.4),
    front: { fill: PAPER, stroke: PAPER }, odd: { fill: INK, stroke: PAPER }, even: { fill: RED, stroke: RED } },
  one: { bg: PAPER, ink: INK, mute: MUTE(C_INK, 0.13), cross: MUTE(C_INK, 0.42),
    front: { fill: RED, stroke: RED }, odd: { fill: PAPER, stroke: INK }, even: { fill: RED, stroke: RED } },
};

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '100-echo-type',
  title: '지금',
  tech: '에코와 늘임 · 시간 지연 반복 + 늘어나는 글자',
  duration: D,
  background: INK,

  async setup(api) {
    const attrs = api.headless ? { willReadFrequently: true } : undefined;
    const { ctx } = api.canvas({ z: 1, attrs });
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

    await fontReady(`800 56px "${SANS}"`, COPY.join('') + LABELS.join(''));
    await fontReady(`600 22px "${MONO}"`, 'ECHOSTRETCHN°0123456789—·δ×−=().kYPRDGIBLAMUt ');
    const font = await loadOutlineFont('Pretendard-Black');

    // ------------------------------------------------ glyph contours, relative to the word's bottom-centre
    const S0 = 100, track0 = -0.03;
    const probe = outlineContours(font, WORD, 0, 0, S0, { letterSpacing: track0 * S0 });
    const ext = (gs) => {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const g of gs) for (const c of g.contours) for (let i = 0; i < c.pts.length; i += 2) {
        x0 = Math.min(x0, c.pts[i]); x1 = Math.max(x1, c.pts[i]); y0 = Math.min(y0, c.pts[i + 1]); y1 = Math.max(y1, c.pts[i + 1]);
      }
      return { x0, x1, y0, y1 };
    };
    const e0 = ext(probe), size = (S0 * WORD_W) / (e0.x1 - e0.x0);
    const glyphs = outlineContours(font, WORD, 0, 0, size, { tol: 0.08, letterSpacing: track0 * size });
    const e = ext(glyphs), cx = (e.x0 + e.x1) / 2;
    const CONT = [];
    for (const g of glyphs) for (const c of g.contours) {
      const p = new Float32Array(c.pts.length);
      for (let i = 0; i < p.length; i += 2) { p[i] = c.pts[i] - cx; p[i + 1] = c.pts[i + 1] - e.y1; }
      CONT.push(p);
    }
    const H0 = e.y1 - e.y0;   // ink height at scale 1
    buildStretch(H0);

    /** trace the word at a pose: scale about the anchor, rotate about the pivot below it — in stage pixels */
    function trace(p) {
      const c = Math.cos(p.rot), s = Math.sin(p.rot), oy = p.af * H0;
      ctx.beginPath();
      for (const pts of CONT) {
        for (let i = 0; i < pts.length; i += 2) {
          const lx = pts[i] * p.sx, ly = (pts[i + 1] + oy) * p.sy - PIV;
          const X = p.x + c * lx - s * ly, Y2 = p.y + s * lx + c * ly + PIV;
          if (i) ctx.lineTo(X, Y2); else ctx.moveTo(X, Y2);
        }
        ctx.closePath();
      }
    }
    /** fill + stroke; the stroke is drawn with an identity transform, so its width ignores the stretch */
    function paint(p, st, width = STROKE) {
      trace(p);
      if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(); }
      if (st.stroke && width > 0) { ctx.strokeStyle = st.stroke; ctx.lineWidth = width; ctx.stroke(); }
    }

    // ------------------------------------------------ printed paper: mottled grain (multiply) + dust and fibres
    const R = rand(10001);
    const paper = mk(W, H), pg = paper.getContext('2d', attrs);
    {
      const GX = 24, GY = 42, lat = new Float32Array((GX + 1) * (GY + 1));
      for (let i = 0; i < lat.length; i++) lat[i] = R();
      const im = pg.createImageData(W, H), d = im.data;
      for (let y = 0; y < H; y++) {
        const fy = (y / H) * GY, iy = Math.floor(fy), ty = fy - iy, sy = ty * ty * (3 - 2 * ty);
        for (let x = 0; x < W; x++) {
          const fx = (x / W) * GX, ix = Math.floor(fx), tx = fx - ix, sx = tx * tx * (3 - 2 * tx);
          const a = lat[iy * (GX + 1) + ix], b = lat[iy * (GX + 1) + ix + 1], c = lat[(iy + 1) * (GX + 1) + ix], dd = lat[(iy + 1) * (GX + 1) + ix + 1];
          const m = lerp(lerp(a, b, sx), lerp(c, dd, sx), sy);
          const g = R();
          const v = 1 - 0.045 * m - 0.07 * g * g * g - (g > 0.985 ? 0.06 : 0);
          const o = (y * W + x) * 4;
          d[o] = 255 * v; d[o + 1] = 253 * v; d[o + 2] = 247 * v; d[o + 3] = 255;
        }
      }
      pg.putImageData(im, 0, 0);
    }
    const dust = mk(W, H), dg = dust.getContext('2d', attrs);
    for (let i = 0; i < 1400; i++) {
      const x = R() * W, y = R() * H, dark = R() < 0.62, r = 0.5 + R() * R() * 2.2;
      dg.fillStyle = dark ? rgba(C_INK, 0.18 + 0.25 * R()) : rgba([250, 246, 236], 0.16 + 0.22 * R());
      dg.beginPath(); dg.arc(x, y, r, 0, TAU); dg.fill();
    }
    dg.lineCap = 'round';
    for (let i = 0; i < 90; i++) {
      const x = R() * W, y = R() * H, a = R() * TAU, L = 6 + R() * 18, bend = (R() - 0.5) * 10;
      dg.strokeStyle = R() < 0.5 ? rgba(C_INK, 0.14) : rgba([250, 246, 236], 0.14);
      dg.lineWidth = 0.7 + R() * 0.6;
      dg.beginPath(); dg.moveTo(x, y);
      dg.quadraticCurveTo(x + Math.cos(a) * L / 2 - Math.sin(a) * bend, y + Math.sin(a) * L / 2 + Math.cos(a) * bend, x + Math.cos(a) * L, y + Math.sin(a) * L);
      dg.stroke();
    }

    // ------------------------------------------------ per-frame state: every copy's pose (shared by both palettes of a wipe)
    function state(t) {
      const c = collapseK(t);
      const db = DELTA * (1 - ramp(t, T.fold, T.folded));
      const dw = DELTA_W * (1 - c);
      const copies = [];
      if (c < 1) {
        const n = t < T.folded ? LEVELS : ROWS;
        for (let j = n; j >= 1; j--) {
          const u = t - j * dw;
          const p = applyWave(basePose(t - j * db), u, 1 - c);
          const off = j * PITCH * gapK(t - j * DELTA_G) * (1 - c);
          const style = j % 2 ? 'odd' : 'even';
          if (off < 0.5) copies.push({ p, style });
          else copies.push({ p: { ...p, y: p.y - off }, style }, { p: { ...p, y: p.y + off }, style });
        }
      }
      const front = applyWave(basePose(t), t, 1 - c);
      // after the snap: two word-shaped shock outlines expand from the front copy
      const shocks = [];
      for (const [dl, grow, w0] of [[0, 0.32, 8], [0.08, 0.7, 6]]) {
        const k = (t - T.impact - dl) / 0.75;
        if (k <= 0 || k >= 1) continue;
        const s = 1 + grow * ease.outCubic(k);
        shocks.push({ p: { ...front, sx: SX(t) * s, sy: SY(t) * s }, w: w0 * Math.pow(1 - k, 1.6) });
      }
      const nEcho = t < T.folded ? LEVELS : Math.round(2 * ROWS * (1 - c) * gapK(t));
      return { copies, front, shocks, nEcho, delta: t < T.folded ? db : dw, c };
    }

    // ------------------------------------------------ the sheet: grid, header, index, readout
    const GW = W - 2 * M;
    function grid(t, P) {
      ctx.fillStyle = P.mute;
      for (let i = 0; i <= 6; i++) {
        const x = Math.round(M + (i * GW) / 6) - (i === 6 ? 1 : 0);
        const k = ease.outCubic(clamp((t - 0.04 - i * 0.045) / 0.6));
        ctx.fillRect(x, GRID_TOP, 1, Math.round((GRID_BOT - GRID_TOP) * k));
      }
      for (let r = 0; r <= 8; r++) {
        const y = Math.round(GRID_TOP + (r * (GRID_BOT - GRID_TOP)) / 8);
        const k = ease.outCubic(clamp((t - 0.12 - r * 0.035) / 0.6));
        ctx.fillRect(M, y, Math.round(GW * k), 1);
      }
      // registration crosses on the intersections
      ctx.fillStyle = P.cross;
      for (let i = 0; i <= 6; i++) for (let r = 0; r <= 8; r++) {
        const k = clamp((t - 0.3 - (i + r) * 0.025) / 0.2);
        if (k <= 0) continue;
        const x = Math.round(M + (i * GW) / 6), y = Math.round(GRID_TOP + (r * (GRID_BOT - GRID_TOP)) / 8), a = Math.round(7 * k);
        ctx.fillRect(x - a, y, 2 * a + 1, 1); ctx.fillRect(x, y - a, 1, 2 * a + 1);
      }
      // crop marks at the sheet corners
      ctx.fillStyle = P.ink;
      for (const [x, y, sx, sy] of [[34, 34, 1, 1], [W - 34, 34, -1, 1], [34, BAND - 26, 1, -1], [W - 34, BAND - 26, -1, -1]]) {
        ctx.fillRect(sx > 0 ? x : x - 22, sy > 0 ? y : y - 2, 22, 2);
        ctx.fillRect(sx > 0 ? x : x - 2, sy > 0 ? y : y - 22, 2, 22);
      }
    }
    const typed = (s, t, t0, cps) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
    const SLOT = GW / 4;
    const BX = track([[2.92, 0], [3.18, 1, ease.inOutCubic], [4.66, 1], [4.92, 2, ease.inOutCubic], [T.impact, 2], [T.impact + 0.28, 3, ease.inOutCubic]]);
    function labels(t, color) {
      for (let i = 0; i < 4; i++) {
        const x0 = M + i * SLOT;
        ctx.fillStyle = color;
        ctx.font = `600 20px "${MONO}"`; ctx.letterSpacing = '1px';
        ctx.fillText(`0${i + 1}`, x0 + 16, 181);
        ctx.font = `800 30px "${SANS}"`; ctx.letterSpacing = '-0.5px';
        ctx.fillText(LABELS[i], x0 + 58, 183);
      }
    }
    function header(t, P) {
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = P.ink;
      ctx.font = `600 22px "${MONO}"`; ctx.letterSpacing = '3px';
      ctx.fillText(typed('ECHO / STRETCH', t, 0.05, 40), M, 90);
      ctx.textAlign = 'right';
      ctx.fillText(typed('N°100 — 2026', t, 0.2, 40), W - M, 90);
      ctx.textAlign = 'left';
      const k = ease.outCubic(clamp((t - 0.02) / 0.5));
      ctx.fillRect(M, 112, Math.round(GW * k), 3);
      // the movement index; a box slides to the current movement
      const a = clamp((t - 0.25) / 0.3);
      if (a <= 0) return;
      ctx.save();
      ctx.beginPath(); ctx.rect(M, 140 + Math.round(60 * (1 - ease.outCubic(a))), GW, 60); ctx.clip();
      labels(t, P.ink);
      const bx = M + BX(t) * SLOT;
      ctx.beginPath(); ctx.rect(bx, 142, SLOT - 6, 56); ctx.clip();
      ctx.fillStyle = P.ink; ctx.fillRect(bx, 142, SLOT - 6, 56);
      labels(t, P.bg);
      ctx.restore();
      ctx.fillStyle = P.ink;
      ctx.fillRect(M, 216, Math.round(GW * k), 1);
    }
    function readout(t, S, P) {
      ctx.fillStyle = P.ink;
      const k = ease.outCubic(clamp((t - 0.1) / 0.5));
      ctx.fillRect(M, 1600, Math.round(GW * k), 2);
      if (t < 0.35) return;
      ctx.font = `600 22px "${MONO}"`; ctx.letterSpacing = '2px'; ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.fillText(`ECHO ${String(S.nEcho).padStart(2, '0')}`, M, 1636);
      ctx.textAlign = 'center';
      ctx.fillText(`δ ${S.delta.toFixed(3)} s`, W / 2 - 20, 1636);
      ctx.textAlign = 'right';
      ctx.fillText(`Y ×${S.front.sy.toFixed(2)}`, W - M, 1636);
      ctx.textAlign = 'left';
    }
    // the last two lines, set around the solid word
    const COPY_Y = [CY - (H0 * END_S[1]) / 2 - 64, CY + (H0 * END_S[1]) / 2 + 112];
    function copyLines(t, P) {
      if (t < T.copy1) return;
      ctx.font = `800 58px "${SANS}"`; ctx.letterSpacing = '-1.5px'; ctx.textAlign = 'center';
      COPY.forEach((s, i) => {
        const k = clamp((t - (i ? T.copy2 : T.copy1)) / 0.7);
        if (k <= 0) return;
        const y = COPY_Y[i];
        ctx.save();
        ctx.beginPath(); ctx.rect(0, y - 62, W, 80); ctx.clip();
        ctx.fillStyle = P.ink;
        ctx.fillText(s, W / 2, y + 76 * (1 - ease.outExpo(k)));
        ctx.restore();
      });
      ctx.textAlign = 'left';
    }

    function scene(t, S, P, shake) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(1, 0, 0, 1, shake[0], shake[1]);
      grid(t, P);
      header(t, P);
      for (const e of S.copies) paint(e.p, P[e.style]);
      for (const s of S.shocks) paint(s.p, { stroke: P.ink }, s.w);
      paint(S.front, P.front);
      copyLines(t, P);
      readout(t, S, P);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    /** the region the next palette already covers (subpaths added to the current path) → false if empty, 'full' if all */
    function wipeRegion(kind, t) {
      if (kind === 'iris') {
        const k = ease.outExpo(clamp((t - T.impact) / 0.5));
        if (k <= 0) return false;
        if (k >= 1) return 'full';
        ctx.arc(W / 2, CY, 2300 * k, 0, TAU);
        return true;
      }
      const t0 = kind === 'drop' ? T.wipe2 : T.wipe3;
      let any = false, all = true;
      for (let i = 0; i < 6; i++) {
        const order = kind === 'drop' ? i : [2, 1, 0, 0, 1, 2][i];
        const h = Math.round(H * ease.inOutCubic(clamp((t - t0 - order * WIPE_ST) / WIPE_LEN)));
        if (h < H) all = false;
        if (h <= 0) continue;
        any = true;
        ctx.rect(i * 180, kind === 'drop' ? 0 : H - h, 180, h);
      }
      return all ? 'full' : any;
    }

    this.draw = (t) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
      ctx.setLineDash([]); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.miterLimit = 10;
      ctx.letterSpacing = '0px'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

      const S = state(t);
      const ti = t - T.impact;
      const shake = [14 * wob(ti, 8.5, 8), 10 * wob(ti - 0.02, 7, 8)];
      let A, B, kind;
      if (t < T.wipe2) A = PAL.echo;
      else if (t < T.wipe2 + WIPE_SPAN) { A = PAL.echo; B = PAL.stretch; kind = 'drop'; }
      else if (t < T.wipe3) A = PAL.stretch;
      else if (t < T.wipe3 + WIPE_SPAN) { A = PAL.stretch; B = PAL.wave; kind = 'rise'; }
      else if (t < T.impact) A = PAL.wave;
      else { A = PAL.wave; B = PAL.one; kind = 'iris'; }

      let region = false;
      if (kind) { ctx.beginPath(); region = wipeRegion(kind, t); }
      if (region === 'full') scene(t, S, B, shake);
      else if (!region) scene(t, S, A, shake);
      else {
        ctx.fillStyle = A.bg; ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, W, H); wipeRegion(kind, t); ctx.clip('evenodd');
        scene(t, S, A, shake);
        ctx.restore();
        ctx.save();
        ctx.beginPath(); wipeRegion(kind, t); ctx.clip();
        scene(t, S, B, shake);
        ctx.restore();
      }

      // the footer band (the caption sits on it) and the credit line
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = INK; ctx.fillRect(0, BAND, W, H - BAND);
      ctx.fillStyle = rgba(C_PAPER, 0.5);
      ctx.font = `500 17px "${MONO}"`; ctx.letterSpacing = '2px'; ctx.textAlign = 'left';
      ctx.fillText('SET IN PRETENDARD BLACK · ECHO(k) = POSE(t − k·δ) · AIMOTION 100', M, BAND + 40);
      ctx.letterSpacing = '0px';

      // printed paper over everything
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(paper, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(dust, 0, 0);
    };
    // warm the offscreen canvases into the compositor once (first-composite AA differences, README 86+)
    this.draw(0);
    this.draw(T.impact + 0.1);
  },

  frame(t) {
    this.draw(t);
  },
});
