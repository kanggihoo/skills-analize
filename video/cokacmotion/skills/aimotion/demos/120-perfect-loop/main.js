/*
 * 120 · 끝에서 처음으로 — a Bauhaus / Swiss loop poster whose last frame is its first frame.
 *
 * One loop L = 9.6 s (288 frames at 30 fps). Every device runs on a cycle that divides L, and each one ends
 * in a configuration that only LOOKS like its start:
 *   field   5×5 tiles; a diagonal wave turns every tile +90° and advances its palette index by +1, while the
 *           grid drifts right by exactly one cell — orientation and colour are (column + …) patterns, so
 *           "every tile turned once" = "the pattern moved one cell", and the drift cancels it.
 *   zoom    the centre cell is a window holding the whole field at 1/5 (Droste). The field zooms ×5 into it;
 *           at ×5 the copy is the field, so z = 1 draws the same picture as z = 0.
 *   relay   a staff of 8 slots, 6 tumbling shapes, 2 gaps: the shape left of each gap tips 90° into it, and
 *           the next one starts exactly as it lands. After 12 moves every shape has moved 4 slots (one group)
 *           and turned 360°.
 *   type    the nouns of 끝에서 / 처음으로 orbit each other in depth (half a turn → 처음에서 / 끝으로, the
 *           other half → home), a ticker scrolls exactly one unit per loop, the frame counter wraps 287 → 000.
 * Arc inside the loop: rest → the wave builds (1.2–4.3 s) → the zoom dives while the words swap (4.3–7.6 s,
 * climax ≈ 5.8 s) → settle and afterglow → rest.
 *
 * Determinism / loop proof: everything is a closed-form function of t. Integer parts of cycle counts become
 * index shifts (quarter turns mod 4, palette mod 5), never accumulated floats; frame(9.6) and frame(0) are
 * compared pixel by pixel (see NOTES.md).
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

// ---------------------------------------------------------------- loop & stage
const L = 9.6, FPS = 30, NF = Math.round(L * FPS);          // 288 frames, frame 288 ≡ frame 0
const W = 1080, H = 1920, M = 120;                         // outer margin = field / title / relay left edge
const PAPER = '#efe8d8', INK = '#1a1814', RED = '#d7381f', BLUE = '#1f45a3', YEL = '#ecb11f';
const PAL = [PAPER, YEL, RED, BLUE, INK];                  // palette order the tiles cycle through
const KR = `"${FONTS.pretendard.family}"`, MONO = `"${FONTS.jetbrainsMono.family}"`;

// field: 5×5 cells, self-similar factor 5 (the centre cell holds the whole field)
const FX = M, FY = 584, FS = 840, NC = 5, S = FS / NC, FZ = 5;
const FCX = FX + FS / 2, FCY = FY + FS / 2, GUT = 3;
// relay staff: 8 slots of one box, ground line RG
const RX = M, RB = 105, RN = 8, RG = 1610;
// title
const TX = M, TY1 = 300, TY2 = 470, TSIZE = 172, TCAP = 0.72 * TSIZE;
const TFONT = `900 ${TSIZE}px ${KR}`, TTRACK = '-5px';     // −0.03 em
const BAND = 1662;                                          // ink band under the harness caption

// ---------------------------------------------------------------- timeline (s)
const WAVE0 = 1.2, WSTEP = 0.23, WDUR = 0.82;               // tile wave: diagonal d starts at WAVE0 + d·WSTEP
const PAN_A = 1.2, PAN_B = 4.6, PAN_W = 0.6;               // 60 % of the one-cell drift rides on the wave
const ZOOM_A = 4.3, ZOOM_B = 7.1;                           // ×1 → ×5
const SWAP1 = [4.75, 5.45], SWAP2 = [6.85, 7.55];           // half turn each → full turn
const RING = 5.45;                                          // the one impact: swap lands mid-dive
const ROLL = [7.9, 8.25];                                   // readout ×5.00 → ×1.00
const RELAY_N = 12, RELAY_A = 7, RELAY_PEAK = 0.6;          // 12 moves, tempo 5…19 moves/L, fastest at 0.6·L

const wrap = (x) => x - Math.floor(x);
const mod = (a, n) => ((a % n) + n) % n;
const lin = (t, a, b) => clamp((t - a) / (b - a));
const outBack = (p, c = 1.4) => (p <= 0 ? 0 : p >= 1 ? 1 : ease.outBack(p, c));   // exact 0 and 1 at the ends (ease.outBack(0) = 1e-16)

const INFO_KR = '마지막 장면이 곧 첫 장면';
const TICK = [[KR, '끝에서 처음으로'], [MONO, ' — FROM THE END TO THE BEGINNING — '], [MONO, '288 FRAMES · 9.6 S · DA CAPO'], [MONO, ' — ']];

// ---------------------------------------------------------------- field
/** drift of the whole grid in cells: 0 at t = 0, exactly 1 at t = L */
function pan(t) {
  const u = t / L;
  return u + PAN_W * (ease.inOutCubic(lin(t, PAN_A, PAN_B)) - u);
}
/** zoom level z: scale of level k is 5^(z − k) */
const zoomZ = (t) => ease.inOutCubic(lin(t, ZOOM_A, ZOOM_B));

/** state of tile (i, j): quarter turns (integer part mod 4 + fraction), palette index, shrink while turning */
function tileState(i, j, t) {
  const d = (i + 1) + j;                                      // diagonal, 0 … 9
  const p = lin(t, WAVE0 + d * WSTEP, WAVE0 + d * WSTEP + WDUR);
  const q = mod(i + j, 4) + outBack(p, 1.3);                  // base orientation (col + row) + this loop's turn
  const qi = Math.floor(q);
  return {
    quarter: mod(qi, 4), frac: q - qi,
    k: mod(i + 2 * j + (p >= 0.5 ? 1 : 0), 5),                // palette index (col + 2·row) + 1 at mid-turn
    shrink: 1 - 0.26 * Math.sin(Math.PI * p),
    lift: Math.sin(Math.PI * p),
  };
}

/** one tile, motif by row; drawn in level coordinates around (cx, cy) */
function drawTile(ctx, cx, cy, row, st) {
  const h = S / 2 - GUT / 2;
  const bg = PAL[st.k], fg = PAL[(st.k + 2) % 5], ac = PAL[(st.k + 3) % 5];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((st.quarter + st.frac) * Math.PI / 2);
  if (st.shrink !== 1) ctx.scale(st.shrink, st.shrink);
  ctx.beginPath();
  ctx.rect(-h, -h, 2 * h, 2 * h);
  ctx.clip();
  ctx.fillStyle = bg;
  ctx.fillRect(-h, -h, 2 * h, 2 * h);
  ctx.fillStyle = fg;
  ctx.beginPath();
  if (row === 0) {                    // quarter disc from the top-left corner + a dot in the open corner
    ctx.moveTo(-h, -h); ctx.arc(-h, -h, 2 * h, 0, Math.PI / 2); ctx.fill();
    ctx.fillStyle = ac; ctx.beginPath(); ctx.arc(h * 0.56, h * 0.56, h * 0.2, 0, Math.PI * 2); ctx.fill();
  } else if (row === 1) {             // three bars
    const b = (2 * h) / 7;
    for (let n = 1; n < 7; n += 2) ctx.rect(-h, -h + n * b, 2 * h, b);
    ctx.fill();
  } else if (row === 2) {             // split circle: half accent, half fg
    ctx.arc(0, 0, h * 0.78, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ac; ctx.beginPath(); ctx.arc(0, 0, h * 0.78, Math.PI / 2, Math.PI * 1.5); ctx.fill();
  } else if (row === 3) {             // dome on the bottom edge, with a small inner half
    ctx.arc(0, h, h * 0.98, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ac; ctx.beginPath(); ctx.arc(0, h, h * 0.36, Math.PI, Math.PI * 2); ctx.fill();
  } else {                            // quarter rings from the bottom-left corner
    for (const [r, c] of [[2 * h, fg], [1.5 * h, bg], [h, fg], [0.5 * h, ac]]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-h, h); ctx.arc(-h, h, r, -Math.PI / 2, 0); ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Level k of the Droste field at zoom z: scale 5^(z−k) about the field centre, clipped to its own field
 * rectangle (= the window of level k−1). Draws base, tiles, the window's rim, then level k+1 inside it.
 */
function drawLevel(ctx, k, z, states, px) {
  const sc = Math.pow(FZ, z - k);
  if (S * sc < 1.5) return;
  ctx.save();
  ctx.setTransform(sc, 0, 0, sc, FCX - sc * FCX, FCY - sc * FCY);
  ctx.beginPath();
  ctx.rect(FX, FY, FS, FS);
  ctx.clip();
  ctx.fillStyle = INK;
  ctx.fillRect(FX, FY, FS, FS);
  for (let j = 0; j < NC; j++) {
    for (let i = -1; i < NC; i++) {
      const x = FX + (i + px + 0.5) * S;
      if (x + S / 2 <= FX || x - S / 2 >= FX + FS) continue;   // fully outside: skip (its AA edge would still tint the border pixel)
      drawTile(ctx, x, FY + (j + 0.5) * S, j, states[j][i + 1]);
    }
  }
  // the window: a paper mat with a hard print shadow, then the next level inside
  const wx = FCX - S / 2, wy = FCY - S / 2;
  ctx.fillStyle = 'rgba(26,24,20,0.45)';
  ctx.fillRect(wx - 6 + 9, wy - 6 + 9, S + 12, S + 12);
  ctx.fillStyle = PAPER;
  ctx.fillRect(wx - 6, wy - 6, S + 12, S + 12);
  drawLevel(ctx, k + 1, z, states, px);
  ctx.restore();
}

// ---------------------------------------------------------------- relay (tumbling shapes on a staff)
function bakeRelay() {
  const occ = [0, 1, 2, -1, 3, 4, 5, -1], gaps = [3, 7];
  const start = [0, 1, 2, 4, 5, 6], type = [0, 1, 2, 0, 1, 2];
  const moves = [];                                           // moves[q] = [{ id, from }, …]
  for (let q = 0; q < RELAY_N; q++) {
    const mv = [];
    for (let g = 0; g < gaps.length; g++) {
      const s = (gaps[g] + RN - 1) % RN, id = occ[s];
      mv.push({ id, from: s });
      occ[gaps[g]] = id; occ[s] = -1; gaps[g] = s;
    }
    moves.push(mv);
  }
  // after 12 moves the staff must read the same by type (the loop condition)
  const byType = occ.map((id) => (id < 0 ? -1 : type[id])).join();
  if (byType !== '0,1,2,-1,0,1,2,-1') throw new Error('relay does not close: ' + byType);
  const when = start.map(() => []);
  moves.forEach((mv, q) => mv.forEach(({ id }) => when[id].push(q)));
  if (when.some((w) => w.length % 4)) throw new Error('relay turn count is not a whole turn');
  return { start, type, moves, when };
}
/** moves completed (float): 12 per loop, faster around 0.6·L; exactly 0 at t = 0 and 12 at t = L */
function relayBeat(t) {
  const u = t / L;
  const hfun = (x) => (RELAY_A / (2 * Math.PI)) * Math.sin(2 * Math.PI * (x - RELAY_PEAK));
  return RELAY_N * u + hfun(wrap(u)) - hfun(0);
}

/** a relay shape centred on its box; shadow = one flat colour for the print shadow pass */
function drawRelayShape(ctx, type, shadow) {
  const r = RB / 2 - 7;
  ctx.beginPath();
  if (type === 0) {                   // red quarter disc
    ctx.fillStyle = shadow || RED; ctx.moveTo(-r, r); ctx.arc(-r, r, 2 * r, -Math.PI / 2, 0); ctx.fill();
  } else if (type === 1) {            // blue dome
    ctx.fillStyle = shadow || BLUE; ctx.arc(0, r, r, Math.PI, Math.PI * 2); ctx.fill();
    if (shadow) return;
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(0, r, r * 0.34, Math.PI, Math.PI * 2); ctx.fill();
  } else {                            // ink square with a yellow dot in one corner
    ctx.fillStyle = shadow || INK; ctx.fillRect(-r, -r, 2 * r, 2 * r);
    if (shadow) return;
    ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(r * 0.42, -r * 0.42, r * 0.36, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------------------------------------------------------------- static layers (drawn once)
function drawStatic(ctx) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  // construction: column lines of the 5-column grid and one compass circle
  ctx.strokeStyle = 'rgba(26,24,20,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= NC; c++) { const x = FX + c * S + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, BAND); }
  ctx.moveTo(0, TY1 + 0.5); ctx.lineTo(W, TY1 + 0.5);
  ctx.moveTo(0, TY2 + 0.5); ctx.lineTo(W, TY2 + 0.5);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(FCX, FCY, FS * 0.5 * Math.SQRT2, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(FCX, FCY, FS * 0.5 * Math.SQRT2 * 1.18, 0, Math.PI * 2); ctx.stroke();
  // field shadow (hard, offset — a print plate under the tile field)
  ctx.fillStyle = 'rgba(26,24,20,0.85)';
  ctx.fillRect(FX + 12, FY + 12, FS, FS);
  // header
  ctx.fillStyle = INK;
  ctx.fillRect(M, 104, W - 2 * M, 4);
  ctx.font = `700 19px ${MONO}`;
  ctx.letterSpacing = '2px';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText('NO.120  LOOP STUDY', M, 86);
  ctx.textAlign = 'right';
  ctx.fillText('L = 9.60 S · 30 FPS', W - M, 86);
  // rule under the info row
  ctx.fillRect(M, 566, W - 2 * M, 2);
  // relay staff: ground, hairline top, repeat signs at both ends, slot ticks
  ctx.fillRect(M - 28, RG, W - 2 * M + 56, 3);
  ctx.fillStyle = 'rgba(26,24,20,0.25)';
  ctx.fillRect(M - 28, RG - RB, W - 2 * M + 56, 1);
  ctx.fillStyle = INK;
  for (let s = 0; s <= RN; s++) ctx.fillRect(RX + s * RB - 1, RG + 3, 2, 7);
  const sign = (x, dir) => {          // dir = +1: start repeat ‖:  dir = −1: end repeat :‖
    const top = RG - RB, hgt = RB;
    ctx.fillRect(x, top, 8 * dir, hgt);
    ctx.fillRect(x + 13 * dir, top, 3 * dir, hgt);
    for (const f of [0.38, 0.62]) { ctx.beginPath(); ctx.arc(x + 23 * dir, top + hgt * f, 4.5, 0, Math.PI * 2); ctx.fill(); }
  };
  sign(M - 28, 1);
  sign(W - M + 28, -1);
  ctx.font = `500 14px ${MONO}`;
  ctx.letterSpacing = '1px';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(26,24,20,0.7)';
  ctx.fillText('FIG.1  FIELD 5×5 — SELF-SIMILAR ×5', M, FY + FS + 34);
  ctx.textAlign = 'right';
  ctx.fillText('FIG.2  RELAY — 12 MOVES / LOOP', W - M, FY + FS + 34);
  // ink band under the harness caption
  ctx.fillStyle = INK;
  ctx.fillRect(0, BAND, W, H - BAND);
  ctx.fillStyle = RED;
  ctx.fillRect(0, BAND, W, 5);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
}

function drawGrain(ctx) {
  // paper tooth: sparse dark and light specks + a soft vignette (rand(seed), drawn once in setup)
  const img = ctx.createImageData(W, H), d = img.data;
  const rnd = rand(120120);
  for (let i = 0; i < W * H; i++) {
    const r = rnd(), o = i * 4;
    if (r < 0.5) { d[o] = 26; d[o + 1] = 24; d[o + 2] = 20; d[o + 3] = Math.round(r * r * 4 * 26); }
    else { d[o] = 255; d[o + 1] = 252; d[o + 2] = 244; d[o + 3] = Math.round((r - 0.5) * (r - 0.5) * 4 * 30); }
  }
  ctx.putImageData(img, 0, 0);
  const g = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.25, W / 2, H * 0.42, H * 0.75);
  g.addColorStop(0, 'rgba(26,24,20,0)');
  g.addColorStop(1, 'rgba(26,24,20,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, BAND);
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '120-perfect-loop',
  title: '끝에서 처음으로',
  tech: '완벽한 루프 · 끝과 처음이 이어지는 기하 패턴',
  duration: L,
  fps: FPS,
  background: PAPER,
  async setup(api) {
    const tickKR = TICK.filter(([f]) => f === KR).map(([, s]) => s).join('');
    await Promise.all([
      fontReady(TFONT, '끝에서처음으로'),
      fontReady(`600 28px ${KR}`, INFO_KR + tickKR),
      fontReady(`700 19px ${MONO}`, 'NO.120 LOOP STUDY L=9.60S·30FPS FRAME ZOOM ×0123456789 —/'),
      fontReady(`800 78px ${MONO}`, '0123456789'),
      fontReady(`500 14px ${MONO}`, 'FIG.12 FIELD5×—SELF-SIMILARRELAYMOVES/LOP0123456789'),
    ]);
    drawStatic(api.canvas({ z: 0 }).ctx);
    const main = api.canvas({ z: 1, attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = main.ctx;
    const grain = api.canvas({ z: 2 });
    grain.el.style.pointerEvents = 'none';
    drawGrain(grain.ctx);

    // title metrics (tracking included)
    const c = this.ctx;
    c.font = TFONT;
    c.letterSpacing = TTRACK;
    this.tw = { 끝: c.measureText('끝').width, 처음: c.measureText('처음').width };
    c.letterSpacing = '0px';
    // ticker unit
    c.font = `600 20px ${KR}`;
    let unit = 0;
    this.tick = TICK.map(([fam, s]) => {
      c.font = fam === KR ? `600 20px ${KR}` : `500 18px ${MONO}`;
      c.letterSpacing = fam === KR ? '0px' : '1px';
      const seg = { font: c.font, ls: c.letterSpacing, s, x: unit };
      unit += c.measureText(s).width;
      return seg;
    });
    c.letterSpacing = '0px';
    this.tickUnit = unit;
    this.relay = bakeRelay();
  },

  frame(t) {
    const ctx = this.ctx;
    // every context state back to default (see README: canvas state traps)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.filter = 'none';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.clearRect(0, 0, W, H);

    const u = t / L;
    this.drawField(ctx, t);
    this.drawRelay(ctx, t);
    this.drawTitle(ctx, t);
    this.drawHud(ctx, t, u);
  },

  drawField(ctx, t) {
    const states = [];
    for (let j = 0; j < NC; j++) {
      const row = [];
      for (let i = -1; i < NC; i++) row.push(tileState(i, j, t));
      states.push(row);
    }
    const z = zoomZ(t);
    ctx.save();
    ctx.beginPath();
    ctx.rect(FX, FY, FS, FS);
    ctx.clip();
    // a level whose window already covers the whole field is hidden: start at level ⌊z⌋ (at z = 1 that is
    // level 1 at scale 5^0 — exactly what level 0 was at z = 0, with the same clip stack)
    drawLevel(ctx, Math.floor(z), z, states, pan(t));
    // the impact: one paper ring when the words land mid-dive
    const p = lin(t, RING, RING + 1.3);
    if (p > 0 && p < 1) {
      const win = (S / 2) * Math.pow(FZ, z) * Math.SQRT2;        // the window's half-diagonal right now
      const r = lerp(win * 0.92, FS * 0.74, 1 - (1 - p) * (1 - p));
      ctx.globalAlpha = 1 - p * p;
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = lerp(30, 4, p);
      ctx.beginPath(); ctx.arc(FCX, FCY, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = lerp(8, 1.5, p);
      ctx.beginPath(); ctx.arc(FCX, FCY, r * 0.86, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // field frame
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(FX + 2, FY + 2, FS - 4, FS - 4);
  },

  drawRelay(ctx, t) {
    const R = this.relay;
    const B = relayBeat(t);
    const m = Math.floor(B), f = B - m;
    const e = ease.inOutCubic(f);
    ctx.save();
    ctx.beginPath();
    ctx.rect(RX, RG - RB * 1.6, RN * RB, RB * 1.6);
    ctx.clip();
    for (const shadow of ['rgba(26,24,20,0.2)', null]) {     // print shadow pass, then colour
    for (let id = 0; id < R.start.length; id++) {
      const w = R.when[id];
      let done = 0;
      for (const q of w) if (q < m) done++;
      const moving = f > 0 && m < RELAY_N && w.includes(m);
      const slot = R.start[id] + done;
      const n = done % 4;
      for (const off of [0, -RN]) {                         // the copy one staff-length back re-enters at the start repeat
        const s = mod(slot, RN) + off;
        if (off && !(moving && mod(slot, RN) === RN - 1)) continue;
        const x0 = RX + s * RB;
        ctx.save();
        if (shadow) ctx.translate(6, 0);
        if (moving) {
          ctx.translate(x0 + RB, RG);
          ctx.rotate(e * Math.PI / 2);
          ctx.translate(-RB / 2, -RB / 2);
        } else {
          ctx.translate(x0 + RB / 2, RG - RB / 2);
        }
        ctx.rotate(n * Math.PI / 2);
        drawRelayShape(ctx, R.type[id], shadow);
        ctx.restore();
      }
    }
    }
    ctx.restore();
    // slot numerals: the baton (red) passes to the slot being landed in
    const mm = mod(m, RELAY_N);
    const cur = R.moves[mm].map(({ from }) => (from + 1) % RN);
    const prev = R.moves[mod(mm - 1, RELAY_N)].map(({ from }) => (from + 1) % RN);
    ctx.font = `500 14px ${MONO}`;
    ctx.letterSpacing = '1px';
    ctx.textAlign = 'center';
    for (let s = 0; s < RN; s++) {
      let a = 0;
      if (cur.includes(s)) a = Math.max(a, ease.inOutCubic(f));
      if (prev.includes(s)) a = Math.max(a, 1 - ease.inOutCubic(f));
      ctx.fillStyle = a > 0.01 ? mixHex(INK, RED, a) : INK;
      ctx.fillText(String(s + 1).padStart(2, '0'), RX + (s + 0.5) * RB, RG + 30);
    }
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
  },

  drawTitle(ctx, t) {
    const turns = 0.5 * outBack(lin(t, SWAP1[0], SWAP1[1]), 1.25) + 0.5 * outBack(lin(t, SWAP2[0], SWAP2[1]), 1.25);
    const th = 2 * Math.PI * wrap(turns);                    // a full turn is home: reduce it exactly
    const cs = Math.cos(th), sn = Math.sin(th);
    const ym = (TY1 + TY2) / 2, ry = (TY2 - TY1) / 2, rx = 46;
    const wA = this.tw['끝'], wB = this.tw['처음'];
    const occ = (1 - cs) / 2;                                 // how far 처음 has taken line 1
    const nouns = [
      { s: '끝', w: wA, x: TX + rx * sn, y: ym - ry * cs, z: sn, col: INK },
      { s: '처음', w: wB, x: TX - rx * sn, y: ym + ry * cs, z: -sn, col: RED },
    ].sort((a, b) => a.z - b.z);
    ctx.font = TFONT;
    ctx.letterSpacing = TTRACK;
    const noun = (o) => {
      const sc = 1 + 0.16 * o.z, back = Math.max(0, -o.z);
      ctx.save();
      ctx.translate(o.x + o.w / 2, o.y - TCAP / 2);
      ctx.scale(sc, sc);
      ctx.fillStyle = back > 0 ? mixHex(o.col, PAPER, 0.62 * back) : o.col;
      ctx.fillText(o.s, -o.w / 2, TCAP / 2);
      ctx.restore();
    };
    noun(nouns[0]);
    ctx.fillStyle = INK;
    ctx.fillText('에서', TX + lerp(wA, wB, occ), TY1);
    ctx.fillText('으로', TX + lerp(wB, wA, occ), TY2);
    noun(nouns[1]);
    ctx.letterSpacing = '0px';
  },

  drawHud(ctx, t, u) {
    // frame counter (wraps 287 → 000) in the title's right column
    const fr = mod(Math.round(t * FPS), NF);
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.font = `700 15px ${MONO}`;
    ctx.letterSpacing = '3px';
    ctx.fillText('FRAME', W - M, 176);
    ctx.font = `800 78px ${MONO}`;
    ctx.letterSpacing = '-2px';
    ctx.fillText(String(fr).padStart(3, '0'), W - M + 2, 252);
    ctx.font = `500 15px ${MONO}`;
    ctx.letterSpacing = '2px';
    ctx.fillStyle = 'rgba(26,24,20,0.6)';
    ctx.fillText(`OF ${NF}`, W - M, 280);
    // loop dial: one red dot per loop, a tick per relay beat
    const dx = W - M - 62, dy = 410, dr = 54;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = INK;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 - Math.PI / 2, l = k % 4 ? 6 : 12;
      ctx.save(); ctx.translate(dx, dy); ctx.rotate(a);
      ctx.fillRect(dr - l - 4, -1, l, 2);
      ctx.restore();
    }
    const da = wrap(u) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(dx, dy, dr, da - 0.9, da); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = RED;
    ctx.beginPath(); ctx.arc(dx + dr * Math.cos(da), dy + dr * Math.sin(da), 9, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 13px ${MONO}`;
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.fillText('D.C.', dx, dy + 5);

    // info row: the claim, and the zoom readout
    ctx.textAlign = 'left';
    ctx.letterSpacing = '-0.5px';
    ctx.font = `600 28px ${KR}`;
    ctx.fillStyle = INK;
    ctx.fillText(INFO_KR, M, 548);
    ctx.textAlign = 'right';
    ctx.font = `700 19px ${MONO}`;
    ctx.letterSpacing = '2px';
    const z = zoomZ(t);
    const lbl = 'ZOOM ×';
    if (t < ROLL[0] || t >= ROLL[1]) {
      ctx.fillStyle = z > 0 && z < 1 ? RED : INK;
      ctx.fillText(lbl + (t >= ROLL[1] ? 1 : Math.pow(FZ, z)).toFixed(2), W - M, 548);
    } else {
      // the leading digit rolls 5 → 1: ×5 is ×1
      const p = ease.inOutCubic(lin(t, ROLL[0], ROLL[1]));
      ctx.fillStyle = INK;
      ctx.fillText('.00', W - M, 548);
      const tailW = ctx.measureText('.00').width;
      const dW = ctx.measureText('0').width;
      const xd = W - M - tailW;
      ctx.save();
      ctx.beginPath(); ctx.rect(xd - dW - 4, 548 - 24, dW + 6, 32); ctx.clip();
      ctx.fillStyle = p < 1 ? RED : INK;
      if (p < 1) ctx.fillText('5', xd, 548 - 30 * p);
      if (p > 0) ctx.fillText('1', xd, 548 + 30 * (1 - p));
      ctx.restore();
      ctx.fillStyle = INK;
      ctx.fillText(lbl, xd - dW, 548);
    }

    // ticker in the ink band: exactly one unit per loop
    const off = -wrap(u) * this.tickUnit;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(239,232,216,0.62)';
    for (let rep = 0; rep < 1 + Math.ceil(W / this.tickUnit) + 1; rep++) {
      for (const seg of this.tick) {
        const x = off + rep * this.tickUnit + seg.x;
        if (x > W) continue;
        ctx.font = seg.font;
        ctx.letterSpacing = seg.ls;
        ctx.fillText(seg.s, x, BAND + 44);
      }
    }
    ctx.letterSpacing = '0px';
  },
});

function mixHex(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const r = Math.round(lerp(ch(pa, 16), ch(pb, 16), k)), g = Math.round(lerp(ch(pa, 8), ch(pb, 8), k)), bl = Math.round(lerp(ch(pa, 0), ch(pb, 0), k));
  return `rgb(${r},${g},${bl})`;
}
