/*
 * 126 · 출근길 100명 — 아이소타입 통계 · 반복 아이콘 + 격자→무리 재배치
 *
 * An infographic beat built on Otto Neurath's Isotype rules. Canvas 2D only, no library.
 *   · one symbol = one person; every symbol of a chart has the same size; a quantity is told by HOW MANY symbols
 *     there are, never by how big one is; a remainder is a cut symbol; a legend states the unit
 *   setup  · the people table: 100 people with an invented commute mode and breakfast flag (seeded shuffle)
 *          · FLIP 1 (grid → rows): first = grid cell, last = row slot; slots are matched to people by the Hungarian
 *            method on squared distance; quadratic arcs that hop upward; launches ordered by travel distance
 *          · FLIP 2 (rows → tokens): ten people per token, matched the same way; arcs that all turn clockwise,
 *            so each group swirls into its token; a token pops (an inversion wipe) when its tenth member lands
 *          · every launch, arrival, sweep and count is a time stored in the table
 *   frame  · a closed form of t over that table: same t → same picture, whatever was drawn before
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10;
const W = 1080, H = 1920;
const PRE = `"${FONTS.pretendard.family}"`;

// ---------------------------------------------------------------- palette: paper, ink, ONE accent
const CREAM = '#FBF5EA';
const INK = '#1F2B4A';
const ACC = '#E9583A', ACC_HI = '#FFB59B';
const ink = (a) => `rgba(31,43,74,${a})`;
const acc = (a) => `rgba(233,88,58,${a})`;
const shade = (a) => `rgba(98,64,30,${a})`;

// ---------------------------------------------------------------- example data (invented, labelled 예시)
const MODES = [
  { name: '버스', n: 38, skip: 13, icon: 'bus' },
  { name: '지하철', n: 41, skip: 14, icon: 'subway' },
  { name: '걸어서', n: 13, skip: 3, icon: 'walk' },
  { name: '자전거', n: 8, skip: 2, icon: 'bike' },
];
const SKIP = 32;                          // skipped breakfast (13 + 14 + 3 + 2)
const UNIT = 10;                          // people per token after the unit change

// ---------------------------------------------------------------- layout (stage px)
const S_ICON = 0.72, S_UNIT = 0.7;        // person symbol, 100 design units tall: 72 px in the charts, 70 px inside a token
const GRID_PX = 76, GRID_PY = 98, GRID_X0 = 540 - 4.5 * GRID_PX, GRID_Y0 = 584;   // feet of grid cell (0, 0)
const ROW_X0 = 218, ROW_PX = 38, ROW_GAP10 = 14, ROW_LINE = 84, PER_LINE = 20;  // 20 per line, a gap after every ten
const ROW_TOP = [576, 788, 1084, 1252];
const RND_X = 122, RND_R = 44;            // mode roundels
// the ending is one block centred between the header rule (392) and the footnote (1600): tokens, tally, bracket +
// labels, legend, message. Offsets below are from the token centre line TOK_Y.
const TOK_Y = 694, TOK_R = 46, TOK_PX = 95;
const U_FEET = 50 * S_UNIT;               // feet of the person inside a token, below the token centre
const Y_TALLY = 66, Y_BRACKET = 94, Y_LABEL = 166, Y_SUB = 206, Y_LEGEND = 294, Y_MSG1 = 508, Y_MSG2 = 638;
const tokX = (g) => 540 + (g - 4.5) * TOK_PX;
const slotXY = (m, k) => {
  const line = Math.floor(k / PER_LINE), c = k % PER_LINE;
  return [ROW_X0 + c * ROW_PX + (c >= 10 ? ROW_GAP10 : 0), ROW_TOP[m] + 82 + line * ROW_LINE];
};
const LEG_X = 776, LEG_Y = 1478;          // legend while the rows stand: symbol centre x, row centre y (it moves into the block)
const CNT_X = 150, CNT_Y = 1548;          // breakfast counter: number baseline

// ---------------------------------------------------------------- timeline (s)
const T_DROP = 0.32, DROP_ROW = 0.12, DROP_COL = 0.022, FALL = 0.3, DROP_H = 100;
const T_ROWS = 2.2, L2_0 = 2.34, L2_SPAN = 1.25, CROUCH = 0.12;
const T_SKIP = 4.8, SW_0 = 4.95, SW_COL = 0.072, SW_ROW = 0.15, SW_T = 0.34;
const T_UNIT = 7.0, L4_0 = 7.04, L4_G = 0.04, L4_SPAN = 0.2, A4_0 = 7.86, A4_G = 0.045, A4_I = 0.016;
const T_FLY32 = 8.05, T_LEGFLY = 8.2, T_TEXT = 8.45, T_SHEEN = 9.2, T_HEAD = 3.75;
const VACATE = 0.24, A2_MAX = 4.72;     // a lander touches down only after its cell's occupant left VACATE s ago
const SUBLINES = [
  [0.3, '출근하는 사람 100명을 세워 봤어요'],
  [T_ROWS, '무엇을 타고 출근하나요?'],
  [T_SKIP, '그중 아침을 거르고 나온 사람은?'],
  [T_UNIT, '열 명을 기호 하나로 묶으면'],
];

// ---------------------------------------------------------------- small helpers
const quad = (a, c, b, e) => (1 - e) * (1 - e) * a + 2 * (1 - e) * e * c + e * e * b;
const pop = (u, d = 0.32, c = 2.2) => (u <= 0 ? 0 : ease.outBack(clamp(u / d), c));
/** rounded rectangle, clockwise on screen; r = [tl, tr, br, bl]; works on Path2D and on a context */
function rr(p, x, y, w, h, r) {
  const [tl, tr, br, bl] = typeof r === 'number' ? [r, r, r, r] : r;
  p.moveTo(x + tl, y);
  p.lineTo(x + w - tr, y);
  if (tr) p.arc(x + w - tr, y + tr, tr, -Math.PI / 2, 0);
  p.lineTo(x + w, y + h - br);
  if (br) p.arc(x + w - br, y + h - br, br, 0, Math.PI / 2);
  p.lineTo(x + bl, y + h);
  if (bl) p.arc(x + bl, y + h - bl, bl, Math.PI / 2, Math.PI);
  p.lineTo(x, y + tl);
  if (tl) p.arc(x + tl, y + tl, tl, Math.PI, Math.PI * 1.5);
  p.closePath();
}
/** rectangle wound counter-clockwise: under the nonzero rule it cuts a hole in a clockwise shape */
function hole(p, x, y, w, h) { p.moveTo(x, y); p.lineTo(x, y + h); p.lineTo(x + w, y + h); p.lineTo(x + w, y); p.closePath(); }

/**
 * The person symbol (after Gerd Arntz's Isotype figures): head, shoulder block whose arms are split off by two slits,
 * two legs. 100 units tall, 39 wide, feet at the origin. One Path2D, filled with the nonzero rule.
 */
function personPath() {
  const p = new Path2D();
  p.moveTo(10.5, -89.5); p.arc(0, -89.5, 10.5, 0, Math.PI * 2);      // head
  rr(p, -19.5, -76, 39, 38, [11, 11, 3, 3]);                         // shoulders, torso and arms in one block
  rr(p, -12.2, -40.5, 10.6, 40.5, [0, 0, 3, 3]);                     // legs (overlap the block, union under nonzero)
  rr(p, 1.6, -40.5, 10.6, 40.5, [0, 0, 3, 3]);
  hole(p, -14.6, -63, 2.4, 25);                                      // arm slits, down to the block's bottom edge
  hole(p, 12.2, -63, 2.4, 25);
  return p;
}

/** Hungarian method (Kuhn–Munkres with potentials), square cost matrix → a[i] = column of row i, total cost minimal */
function hungarian(cost) {
  const n = cost.length, INF = 1e18;
  const u = new Float64Array(n + 1), v = new Float64Array(n + 1), p = new Int32Array(n + 1), way = new Int32Array(n + 1);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Float64Array(n + 1).fill(INF), used = new Uint8Array(n + 1);
    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = INF, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const a = new Int32Array(n);
  for (let j = 1; j <= n; j++) a[p[j] - 1] = j - 1;
  return a;
}

/**
 * Control point of a quadratic arc from (x0, y0) to (x1, y1); the curve's peak sits k·d/2 off the chord.
 * 'hop': bulge upward (sideways to the right for near-vertical moves). 'swirl': always to the left of the direction of
 * travel, so every path turns clockwise and a group converging on one point reads as a whirl.
 */
function arcCtrl(x0, y0, x1, y1, k, hMax, mode) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy);
  if (d < 1) return [x0, y0];
  let nx, ny;
  if (mode === 'hop') {
    nx = -dy / d; ny = dx / d;
    if (Math.abs(ny) < 0.2) { if (nx < 0) { nx = -nx; ny = -ny; } } else if (ny > 0) { nx = -nx; ny = -ny; }
  } else { nx = dy / d; ny = -dx / d; }
  const h = Math.min(k * d, hMax);
  return [(x0 + x1) / 2 + nx * h, (y0 + y1) / 2 + ny * h];
}

// ---------------------------------------------------------------- mode pictograms (cream on an ink roundel, r = 44)
function drawPicto(ctx, key) {
  ctx.fillStyle = CREAM; ctx.strokeStyle = CREAM; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (key === 'bus') {                    // side view: body, window band, wheels cut out of the body
    ctx.beginPath(); rr(ctx, -27, -19, 54, 32, [6, 11, 4, 4]); ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    for (let k = 0; k < 4; k++) rr(ctx, -22.5 + k * 9.6, -14, 7.6, 9.5, 1.8);
    rr(ctx, 17.6, -14, 6.2, 14, [1.8, 4, 1.8, 1.8]);
    ctx.fill();
    ctx.fillRect(-27, 2.5, 41, 2.6);
    for (const x of [-14.5, 14.5]) { ctx.beginPath(); ctx.arc(x, 13.5, 8.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = CREAM;
    for (const x of [-14.5, 14.5]) { ctx.beginPath(); ctx.arc(x, 13.5, 5.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = INK;
    for (const x of [-14.5, 14.5]) { ctx.beginPath(); ctx.arc(x, 13.5, 1.9, 0, Math.PI * 2); ctx.fill(); }
  } else if (key === 'subway') {          // front view: body, windscreen, lamps, rails
    ctx.beginPath(); rr(ctx, -18, -28, 36, 41, [12, 12, 5, 5]); ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath(); rr(ctx, -13, -21.5, 26, 14.5, 4); ctx.fill();
    ctx.beginPath(); rr(ctx, -6.5, -26, 13, 2.6, 1.3); ctx.fill();
    for (const x of [-9.4, 9.4]) { ctx.beginPath(); ctx.arc(x, 4, 3.1, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); rr(ctx, -3.6, 2, 7.2, 4, 1.6); ctx.fill();
    ctx.lineWidth = 3.8;
    ctx.beginPath(); ctx.moveTo(-10, 16.5); ctx.lineTo(-16.5, 27); ctx.moveTo(10, 16.5); ctx.lineTo(16.5, 27); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-13.2, 22.2); ctx.lineTo(13.2, 22.2); ctx.stroke();
  } else if (key === 'walk') {            // profile, mid-stride, facing right
    ctx.beginPath(); ctx.arc(4.5, -22.5, 6.6, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 8.4; ctx.beginPath(); ctx.moveTo(2.6, -12.5); ctx.lineTo(-0.6, 3.5); ctx.stroke();
    ctx.lineWidth = 6.6;
    ctx.beginPath(); ctx.moveTo(-0.6, 4); ctx.lineTo(5.6, 13.5); ctx.lineTo(7, 24.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.6, 4); ctx.lineTo(-4.6, 14); ctx.lineTo(-11.5, 22.5); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(7, 25); ctx.lineTo(11.6, 25); ctx.stroke();
    ctx.lineWidth = 5.6;
    ctx.beginPath(); ctx.moveTo(2.4, -9.5); ctx.lineTo(8.6, -2); ctx.lineTo(13.2, 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2.4, -9.5); ctx.lineTo(-4.8, -3.2); ctx.lineTo(-8.6, 3.2); ctx.stroke();
  } else {                                // bicycle: two wheels, diamond frame, saddle, bars
    ctx.lineWidth = 3.7;
    for (const x of [-14.5, 14.5]) { ctx.beginPath(); ctx.arc(x, 9.5, 10.2, 0, Math.PI * 2); ctx.stroke(); }
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(-14.5, 9.5); ctx.lineTo(-0.5, 9.5); ctx.lineTo(9.5, -5.5); ctx.lineTo(14.5, 9.5);
    ctx.moveTo(-0.5, 9.5); ctx.lineTo(-6, -6); ctx.lineTo(-14.5, 9.5);
    ctx.moveTo(-6, -6); ctx.lineTo(9.5, -5.5);
    ctx.moveTo(9.5, -5.5); ctx.lineTo(7.6, -11.5); ctx.lineTo(13, -12.6);
    ctx.stroke();
    ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(-10.6, -9.6); ctx.lineTo(-2.6, -9.6); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6.4, -9.6); ctx.lineTo(-6, -6); ctx.stroke();
    for (const x of [-14.5, 14.5, -0.5]) { ctx.beginPath(); ctx.arc(x, 9.5, 2.3, 0, Math.PI * 2); ctx.fill(); }
  }
}

// ---------------------------------------------------------------- the static paper (drawn once, never touched again)
function paintPaper(g, R) {
  const lin = g.createLinearGradient(0, 0, 0, H);
  lin.addColorStop(0, '#F7EFDF'); lin.addColorStop(0.55, '#F3E8D4'); lin.addColorStop(1, '#EDE0C6');
  g.fillStyle = lin; g.fillRect(0, 0, W, H);
  const lit = g.createRadialGradient(260, 300, 0, 260, 300, 1150);       // soft light from the upper left
  lit.addColorStop(0, 'rgba(255,253,246,0.8)'); lit.addColorStop(1, 'rgba(255,253,246,0)');
  g.fillStyle = lit; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(540, 860, 520, 540, 860, 1300);
  vg.addColorStop(0, 'rgba(120,82,38,0)'); vg.addColorStop(1, 'rgba(120,82,38,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // printed dot grid
  g.fillStyle = ink(0.055);
  for (let y = 36; y < 1650; y += 28) for (let x = 22; x < W; x += 28) g.fillRect(x - 1, y - 1, 2, 2);
  // fibres
  g.lineCap = 'round';
  for (let i = 0; i < 220; i++) {
    const x = R() * W, y = R() * 1660, a = R() * Math.PI, l = 8 + R() * 26, b = (R() - 0.5) * 0.8;
    g.strokeStyle = R() < 0.5 ? 'rgba(130,96,52,0.07)' : 'rgba(255,255,250,0.22)';
    g.lineWidth = 0.8 + R() * 0.8;
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + b) * l * 0.5, y + Math.sin(a + b) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  // grain
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9; }
  g.putImageData(img, 0, 0);
  // footer band (the captions sit on it)
  const band = g.createLinearGradient(0, 1668, 0, H);
  band.addColorStop(0, '#25324F'); band.addColorStop(1, '#151D33');
  g.fillStyle = band; g.fillRect(0, 1668, W, H - 1668);
  g.fillStyle = 'rgba(251,245,234,0.16)'; g.fillRect(0, 1668, W, 1.5);
  g.fillStyle = 'rgba(31,43,74,0.10)'; g.fillRect(0, 1662, W, 6);
}

defineDemo({
  id: '126-isotype',
  title: '출근길 100명',
  tech: '아이소타입 통계 · 반복 아이콘 + 격자→무리 재배치',
  duration: D,
  background: '#F3E8D4',

  async setup(api) {
    const t0 = performance.now();
    const ALL = '먹예시데이터출근길설문100명하는사람을세워봤어요무엇타고나요?그중아침거르나온은열기호하나로묶으면버스지하철걸어서자전거=1032468중꼴해실제조사가아닌가상의이에·0123456789';
    await Promise.all([500, 600, 700, 800, 900].map((w) => fontReady(`${w} 40px ${PRE}`, ALL)));

    paintPaper(api.canvas({ z: 0 }).ctx, rand(4242));
    const { ctx } = api.canvas({ z: 1, attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    this.figure = personPath();

    // ---- the people: an invented mode + breakfast flag for each, dealt into the grid by a seeded shuffle
    const R = rand(126);
    const kinds = [];
    MODES.forEach((m, mi) => { for (let k = 0; k < m.n; k++) kinds.push({ m: mi, skip: k < m.skip }); });
    for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const s = kinds[i]; kinds[i] = kinds[j]; kinds[j] = s; }
    const P = kinds.map((k, i) => {
      const row = Math.floor(i / 10), col = i % 10, d0 = T_DROP + row * DROP_ROW + col * DROP_COL;
      return { i, m: k.m, skip: k.skip, gx: GRID_X0 + col * GRID_PX, gy: GRID_Y0 + row * GRID_PY, d0, d1: d0 + FALL };
    });

    // ---- FLIP 1: last positions = row slots. Breakfast-skippers take the first slots of their row (Isotype groups a
    // sub-quantity into one block); inside each block, people ↔ slots by minimum total squared distance.
    MODES.forEach((m, mi) => {
      for (const sk of [true, false]) {
        const who = P.filter((p) => p.m === mi && p.skip === sk);
        const slots = [];
        for (let k = sk ? 0 : m.skip; k < (sk ? m.skip : m.n); k++) slots.push(k);
        const a = hungarian(who.map((p) => slots.map((k) => { const [x, y] = slotXY(mi, k); return (x - p.gx) ** 2 + (y - p.gy) ** 2; })));
        who.forEach((p, n) => { p.k = slots[a[n]]; [p.rx, p.ry] = slotXY(mi, p.k); });
      }
    });
    const d2 = P.map((p) => Math.hypot(p.rx - p.gx, p.ry - p.gy)), d2max = Math.max(...d2);
    P.map((p, i) => i).sort((a, b) => d2[a] - d2[b] || a - b).forEach((i, rank) => {
      const p = P[i];
      p.L2 = L2_0 + (L2_SPAN * rank) / 99;                 // launch order = travel distance, shortest first
      p.T2 = 0.48 + (0.4 * d2[i]) / d2max;                  // longer trips take a little longer
      p.A2 = p.L2 + p.T2;
      [p.c2x, p.c2y] = arcCtrl(p.gx, p.gy, p.rx, p.ry, 0.42, 300, 'hop');
      p.tilt2 = clamp((p.rx - p.gx) / 180, -1, 1) * 0.2;
    });
    // grid and rows share the same ground: a person may land on a row slot only after whoever stands on that spot
    // in the grid has left (launch + VACATE). Delays are relaxed until nothing moves (capped at A2_MAX).
    const block = P.map((p) => P.filter((q) => q !== p && Math.abs(q.gx - p.rx) < 32 && Math.abs(q.gy - p.ry) < 78));
    let delayed = 0;
    for (let pass = 0; pass < 24; pass++) {
      let moved = false;
      for (const p of P) {
        let need = p.A2;
        for (const q of block[p.i]) need = Math.max(need, q.L2 + VACATE);
        need = Math.min(need, A2_MAX);
        if (need > p.A2 + 1e-6) { p.L2 = need - p.T2; p.A2 = need; moved = true; }
      }
      if (!moved) break;
    }
    for (const p of P) for (const q of block[p.i]) if (p.A2 < q.L2 + VACATE - 1e-6) delayed++;
    this.landClash = delayed;                          // landings that still touch an occupied cell (0 when solved)
    // ---- the accent sweep ripples along each row (slot order) and down the rows
    for (const p of P) if (p.skip) p.sw = SW_0 + p.k * SW_COL + p.m * SW_ROW;

    // ---- FLIP 2: ten people per token. Tokens 0-2 take 30 skippers, token 3 takes the last 2 skippers and 8 others.
    const cap = { true: [], false: [] };
    for (let n = 0; n < 100; n++) cap[n < SKIP].push(Math.floor(n / UNIT));
    for (const sk of [true, false]) {
      const who = P.filter((p) => p.skip === sk), gs = cap[sk];
      const a = hungarian(who.map((p) => gs.map((g) => (tokX(g) - p.rx) ** 2 + (TOK_Y + U_FEET - p.ry) ** 2)));
      who.forEach((p, n) => { p.g = gs[a[n]]; p.ux = tokX(p.g); p.uy = TOK_Y + U_FEET; });
    }
    // one motion, not a scatter: the groups lift off as a left → right wave; inside a group the farthest leaves first,
    // and arrival times are set (not launch + speed) so each group lands in a tight cluster, token after token
    for (let g = 0; g < 10; g++) {
      const mem = P.filter((p) => p.g === g).map((p) => ({ p, d: Math.hypot(p.ux - p.rx, p.uy - p.ry) })).sort((a, b) => a.d - b.d || a.p.i - b.p.i);
      mem.forEach(({ p }, i) => {
        p.L4 = L4_0 + L4_G * g + (L4_SPAN * (UNIT - 1 - i)) / (UNIT - 1);
        p.A4 = A4_0 + A4_G * g + A4_I * i;
        p.T4 = p.A4 - p.L4;
        [p.c4x, p.c4y] = arcCtrl(p.rx, p.ry, p.ux, p.uy, 0.42, 240, 'swirl');
        p.c4x = clamp(p.c4x, 70, W - 70);               // keep the whirl inside the frame
      });
    }
    this.units = [];
    for (let g = 0; g < 10; g++) {
      const mem = P.filter((p) => p.g === g).sort((a, b) => a.A4 - b.A4);
      const nAcc = mem.filter((p) => p.skip).length;
      let ia = 0, ib = nAcc;
      const ticks = mem.map((p) => ({ at: p.A4, seg: p.skip ? ia++ : ib++, skip: p.skip }));
      this.units.push({
        g, x: tokX(g), mem, ticks, frac: nAcc / UNIT, show: T_UNIT + 0.03 * g,
        arrive: mem.map((p) => p.A4), M: mem[mem.length - 1].A4 + 0.04,
      });
    }
    this.tLeg = Math.min(...this.units.map((u) => u.M)) + 0.08;   // the legend changes its unit with the first token
    this.tBracket = Math.max(...this.units.map((u) => u.M)) + 0.05; // the bracket waits for the last token

    // ---- counts are read off the same table
    this.rowArrive = MODES.map((_, mi) => P.filter((p) => p.m === mi).map((p) => p.A2).sort((a, b) => a - b));
    this.skipDone = P.filter((p) => p.skip).map((p) => p.sw + SW_T * 0.55).sort((a, b) => a - b);
    this.P = P;
    this.cells = new Map();
    this.setupMs = performance.now() - t0;
  },

  // ---------------------------------------------------------------- frame
  frame(t) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.miterLimit = 10;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.imageSmoothingEnabled = true;
    ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, W, H);

    this.drawHeader(ctx, t);
    this.drawGuides(ctx, t);
    this.drawRows(ctx, t);
    this.drawGlow(ctx, t);
    this.drawPeople(ctx, t);
    this.drawCounter(ctx, t);
    this.drawLegend(ctx, t);
    this.drawFinal(ctx, t);
  },

  // ---------------------------------------------------------------- one person's pose at t (null = not drawn)
  pose(p, t) {
    if (t < p.d0) return null;
    const o = { x: 0, y: 0, s: S_ICON, sx: 1, sy: 1, rot: 0, a: 1, hx: 0, hy: 0, hk: 1, layer: 0, fill: 0, f: 0 };
    if (t < p.L2) {                                          // the grid: fall, land, wait, crouch
      o.x = o.hx = p.gx; o.hy = p.gy;
      if (t < p.d1) {
        const q = (t - p.d0) / FALL;
        o.y = p.gy - DROP_H * (1 - q * q);
        o.a = clamp(q / 0.22); o.sy = 1 + 0.12 * q * q; o.sx = 1 - 0.05 * q * q; o.hk = 0.3 + 0.7 * q * q; o.layer = 2;
      } else { o.y = p.gy; this.squash(o, t - p.d1); o.layer = 1; }
      this.crouch(o, t, p.L2);
      return o;
    }
    if (t < p.A2) {                                          // FLIP 1 in flight: arc + lift
      const e = ease.inOutCubic((t - p.L2) / p.T2), lift = Math.sin(Math.PI * e);
      o.x = quad(p.gx, p.c2x, p.rx, e); o.y = quad(p.gy, p.c2y, p.ry, e);
      o.hx = lerp(p.gx, p.rx, e); o.hy = lerp(p.gy, p.ry, e); o.hk = 1 - 0.5 * lift;
      o.s = S_ICON * (1 + 0.16 * lift); o.sy = 1 + 0.07 * lift; o.sx = 1 - 0.04 * lift; o.rot = p.tilt2 * lift; o.layer = 3; o.lift = lift;
      return o;
    }
    if (t < p.L4) {                                          // in its row: land, sweep, crouch
      o.x = o.hx = p.rx; o.y = o.hy = p.ry;
      this.squash(o, t - p.A2);
      if (p.skip) {
        o.f = ease.inOutCubic(clamp((t - p.sw) / SW_T));
        const b = clamp((t - p.sw - SW_T * 0.75) / 0.24);
        if (b > 0 && b < 1) { const k = 0.09 * Math.sin(Math.PI * b); o.sx *= 1 + k; o.sy *= 1 + k; }
      }
      this.crouch(o, t, p.L4);
      return o;
    }
    if (t < p.A4) {                                          // FLIP 2 in flight: swirl into the token, size → token size
      const e = ease.inOutCubic((t - p.L4) / p.T4), lift = Math.sin(Math.PI * e);
      o.x = quad(p.rx, p.c4x, p.ux, e); o.y = quad(p.ry, p.c4y, p.uy, e);
      o.hx = lerp(p.rx, p.ux, e); o.hy = lerp(p.ry, p.uy, e); o.hk = 1 - 0.5 * lift;
      o.s = lerp(S_ICON, S_UNIT, e) * (1 + 0.14 * lift); o.sy = 1 + 0.06 * lift; o.sx = 1 - 0.03 * lift;
      o.rot = 0.16 * lift * Math.sign(p.ux - p.rx); o.f = p.skip ? 1 : 0; o.layer = 3; o.lift = lift;
      return o;
    }
    return null;                                             // arrived: drawn as the token's stack
  },
  squash(o, u) {                                             // landing: squash, then a damped wobble back
    if (u < 0 || u > 0.5) return;
    const k = 0.2 * Math.exp(-8.5 * u) * Math.cos(19 * u);
    o.sy *= 1 - k; o.sx *= 1 + 0.65 * k;
  },
  crouch(o, t, at) {                                         // anticipation just before a launch
    const c = (t - (at - CROUCH)) / CROUCH;
    if (c <= 0 || c >= 1) return;
    const k = 0.12 * Math.sin(Math.PI * c);
    o.sy *= 1 - k; o.sx *= 1 + 0.6 * k;
  },

  /** the person symbol at feet (x, y): scale s, squash sx/sy about the feet, tilt about the body's middle */
  person(ctx, x, y, s, sx, sy, rot, color, a = 1) {
    ctx.setTransform(1, 0, 0, 1, x, y - 50 * s * sy);
    if (rot) ctx.rotate(rot);
    ctx.translate(0, 50 * s * sy);
    ctx.scale(s * sx, s * sy);
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.fill(this.figure);
  },
  /** the accent fill swept across one symbol: a clip to the symbol, a rectangle that grows from its left edge */
  sweepFill(ctx, f) {
    ctx.save();
    ctx.clip(this.figure);
    const x = -21 + 42 * f;
    ctx.fillStyle = ACC; ctx.fillRect(-21, -102, 42 * f, 104);
    if (f < 1) { ctx.fillStyle = ACC_HI; ctx.fillRect(x - 5, -102, 5, 104); }
    ctx.restore();
  },

  // ---------------------------------------------------------------- people + tokens
  drawPeople(ctx, t) {
    const L = [[], [], [], []];
    for (const p of this.P) { const o = this.pose(p, t); if (o) { o.p = p; L[o.layer].push(o); } }
    // ground shadows: resting ones in one path, lifted ones each fainter and smaller
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    ctx.beginPath();
    for (const o of [...L[0], ...L[1]]) { const rx = 15 * (o.s / S_ICON) * o.sx; ctx.moveTo(o.hx + rx, o.hy + 1.5); ctx.ellipse(o.hx, o.hy + 1.5, rx, 4.2, 0, 0, Math.PI * 2); }
    ctx.fillStyle = shade(0.16); ctx.fill();
    for (const o of [...L[2], ...L[3]]) {
      const rx = 15 * o.hk * (o.s / S_ICON);
      ctx.beginPath(); ctx.ellipse(o.hx, o.hy + 1.5, rx, 4.2 * o.hk, 0, 0, Math.PI * 2);
      ctx.fillStyle = shade(0.16 * o.hk * o.a); ctx.fill();
    }
    this.drawTokenGuides(ctx, t);                            // empty token places + tallies, under everyone
    const draw = (o) => {
      this.person(ctx, o.x, o.y, o.s, o.sx, o.sy, o.rot, o.f >= 1 ? ACC : INK, o.a);
      if (o.f > 0 && o.f < 1) this.sweepFill(ctx, o.f);
    };
    L[0].forEach(draw); L[1].forEach(draw);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    this.drawTokens(ctx, t);
    L[2].forEach(draw);
    L[3].sort((a, b) => a.lift - b.lift).forEach(draw);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  },

  /** a token: ink or accent disc with the person cut out in cream; R is the disc radius (pop), frac the accent share */
  token(ctx, x, cy, R, base, frac, fs = 1, ps = S_UNIT * (R / TOK_R)) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = shade(0.14); ctx.beginPath(); ctx.ellipse(x + 2, cy + R * 0.94, R * 0.8, R * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = base; ctx.beginPath(); ctx.arc(x, cy, R, 0, Math.PI * 2); ctx.fill();
    if (frac > 0) {                                          // the cut symbol: accent swept in from the left edge
      ctx.save(); ctx.beginPath(); ctx.arc(x, cy, R, 0, Math.PI * 2); ctx.clip();
      const w = 2 * R * frac;
      ctx.fillStyle = ACC; ctx.fillRect(x - R, cy - R, w, 2 * R);
      if (frac < fs) { ctx.fillStyle = ACC_HI; ctx.fillRect(x - R + w - 3, cy - R, 3, 2 * R); }
      else if (frac < 1) { ctx.fillStyle = CREAM; ctx.fillRect(x - R + w - 1, cy - R, 2, 2 * R); }   // crisp cut line
      ctx.restore();
    }
    ctx.save(); ctx.beginPath(); ctx.arc(x, cy, R, 0, Math.PI * 2); ctx.clip();   // the figure turns cream only inside the disc
    this.person(ctx, x, cy + 50 * ps, ps, 1, 1, 0, CREAM);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  },

  /** the ten empty places and their tallies appear left → right as the people lift off (drawn beneath the people) */
  drawTokenGuides(ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const u of this.units) {
      const k0 = clamp((t - u.show) / 0.3);
      if (k0 <= 0) continue;
      const x = u.x, cy = TOK_Y, ty = cy + Y_TALLY;
      ctx.globalAlpha = k0;
      if (t < u.M + 0.2) {
        const r = TOK_R * (0.82 + 0.18 * ease.outCubic(k0));
        ctx.fillStyle = ink(0.045); ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = ink(0.2); ctx.stroke();
      }
      // tally: ten dots, each filled when its member lands (skippers fill from the left)
      ctx.fillStyle = ink(0.14);
      ctx.beginPath();
      for (let s = 0; s < UNIT; s++) { const dx = x + (s - 4.5) * 8; ctx.moveTo(dx + 2.3, ty); ctx.arc(dx, ty, 2.3, 0, Math.PI * 2); }
      ctx.fill();
      for (const tk of u.ticks) {
        const q = pop(t - tk.at, 0.16, 2.6);
        if (q <= 0) continue;
        ctx.fillStyle = tk.skip ? ACC : INK; ctx.beginPath(); ctx.arc(x + (tk.seg - 4.5) * 8, ty, 3.1 * q, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  },

  drawTokens(ctx, t) {
    for (const u of this.units) {
      const x = u.x, cy = TOK_Y;
      const R = TOK_R * pop(t - u.M);
      // the stack: members that already landed coincide in one symbol; each landing thumps it
      let nIn = 0;
      while (nIn < u.arrive.length && u.arrive[nIn] <= t) nIn++;
      if (nIn > 0 && R < TOK_R * 0.95) {
        const v = t - u.arrive[nIn - 1], k = 0.16 * Math.exp(-11 * v) * Math.cos(16 * v);
        const anyInk = u.mem.some((p) => !p.skip && p.A4 <= t);
        this.person(ctx, x, cy + U_FEET, S_UNIT, 1 + 0.6 * k, 1 - k, 0, anyInk ? INK : ACC);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      if (R > 0) {
        // the pop: a disc that grows from the centre over the stack and turns the symbol cream (an inversion wipe)
        const full = u.frac >= 1, base = full ? ACC : INK;
        const fr = u.frac > 0 && u.frac < 1 ? u.frac * ease.inOutCubic(clamp((t - u.M - 0.3) / 0.36)) : 0;
        this.token(ctx, x, cy, R, base, fr, u.frac, S_UNIT);
        const q = clamp((t - u.M) / 0.5);
        if (q < 1) {
          const e = ease.outCubic(q);
          ctx.beginPath(); ctx.arc(x, cy, TOK_R + 4 + 32 * e, 0, Math.PI * 2);
          ctx.lineWidth = 3.5 * (1 - e); ctx.strokeStyle = full ? acc(0.55 * (1 - e)) : ink(0.4 * (1 - e)); ctx.stroke();
        }
      }
    }
    // afterglow: one light sheen across every token
    if (t > T_SHEEN && t < T_SHEEN + 0.7) {
      const e = ease.inOutCubic((t - T_SHEEN) / 0.7), sx = lerp(20, 1060, e);
      ctx.save();
      ctx.beginPath();
      for (const u of this.units) { ctx.moveTo(u.x + TOK_R, TOK_Y); ctx.arc(u.x, TOK_Y, TOK_R, 0, Math.PI * 2); }
      ctx.clip();
      const gr = ctx.createLinearGradient(sx - 70, 0, sx + 70, 0);
      gr.addColorStop(0, 'rgba(255,250,238,0)'); gr.addColorStop(0.5, 'rgba(255,250,238,0.42)'); gr.addColorStop(1, 'rgba(255,250,238,0)');
      ctx.fillStyle = gr; ctx.fillRect(sx - 70, TOK_Y - TOK_R, 140, 2 * TOK_R);
      ctx.restore();
    }
  },

  drawGlow(ctx, t) {
    const k = clamp((t - 8.1) / 0.7);
    if (k <= 0) return;
    // soft light pooled behind the closing block, and a warm one behind the 3.2 accent tokens
    const cy = TOK_Y + (Y_MSG2 - TOK_R) / 2;
    ctx.setTransform(1.15, 0, 0, 1, 540, cy);
    let gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 520);
    gr.addColorStop(0, `rgba(255,252,243,${0.55 * k})`); gr.addColorStop(1, 'rgba(255,252,243,0)');
    ctx.fillStyle = gr; ctx.fillRect(-520, -520, 1040, 1040);
    const breath = 0.8 + 0.2 * Math.sin(((t - 8.1) / 1.6) * Math.PI * 2);
    const ax = (tokX(0) - TOK_R + this.cutX()) / 2;
    ctx.setTransform(1.5, 0, 0, 0.7, ax, TOK_Y + 4);
    gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 160);
    gr.addColorStop(0, acc(0.2 * k * breath)); gr.addColorStop(1, acc(0));
    ctx.fillStyle = gr; ctx.fillRect(-160, -160, 320, 320);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },

  // ---------------------------------------------------------------- header
  drawHeader(ctx, t) {
    // kicker: "예시 데이터" pill + survey name
    const kp = pop(t - 0.02, 0.36, 1.8);
    if (kp > 0) {
      ctx.font = `700 24px ${PRE}`;
      const tw = ctx.measureText('예시 데이터').width, pw = tw + 36;
      ctx.setTransform(kp, 0, 0, kp, 72 + pw / 2, 122);
      ctx.fillStyle = INK; ctx.beginPath(); rr(ctx, -pw / 2, -23, pw, 46, 23); ctx.fill();
      ctx.fillStyle = CREAM; ctx.fillText('예시 데이터', -tw / 2, 8.5);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const a = clamp((t - 0.12) / 0.3);
      ctx.globalAlpha = a; ctx.font = `600 26px ${PRE}`; ctx.fillStyle = ink(0.62);
      ctx.fillText('출근길 설문 · 100명', 72 + pw + 18 + (1 - ease.outCubic(a)) * 14, 131);
      ctx.globalAlpha = 1;
    }
    this.rise(ctx, '출근길 100명', 70, 262, `900 128px ${PRE}`, 128, INK, t, 0.1, { stagger: 0.05, dur: 0.5, track: -3 });
    this.roll(ctx, SUBLINES, t, 72, 334, `600 34px ${PRE}`, 34, ink(0.66));
    // double rule, drawn left → right
    const e = ease.inOutCubic(clamp((t - 0.3) / 0.6));
    if (e > 0) {
      ctx.fillStyle = INK; ctx.fillRect(72, 380, 936 * e, 3);
      ctx.fillStyle = ink(0.35); ctx.fillRect(72, 389, 936 * e, 1.2);
    }
    // column headings of the chart (they leave before the tokens take this band)
    const ca = clamp((t - T_HEAD) / 0.35) * (1 - clamp((t - T_UNIT + 0.05) / 0.2));
    if (ca > 0) {
      const dy = (1 - ease.outCubic(clamp((t - T_HEAD) / 0.35))) * 10;
      ctx.globalAlpha = ca; ctx.font = `700 23px ${PRE}`; ctx.fillStyle = ink(0.55);
      ctx.textAlign = 'center'; ctx.fillText('교통수단', RND_X, 536 + dy);
      ctx.textAlign = 'left'; ctx.fillText('출근하는 사람', ROW_X0 - 14, 536 + dy);
      ctx.fillStyle = ink(0.16); ctx.fillRect(72, 552 + dy, 936 * ease.inOutCubic(clamp((t - T_HEAD) / 0.5)), 1.2);
      ctx.globalAlpha = 1;
    }
  },

  // ---------------------------------------------------------------- guides: grid ground marks, row baselines
  drawGuides(ctx, t) {
    const gin = clamp((t - 0.1) / 0.4), gout = 1 - clamp((t - 2.3) / 0.5);
    if (gin * gout > 0) {
      ctx.fillStyle = ink(0.07 * gin * gout);
      ctx.beginPath();
      for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
        const x = GRID_X0 + c * GRID_PX, y = GRID_Y0 + r * GRID_PY + 1.5;
        ctx.moveTo(x + 11, y); ctx.ellipse(x, y, 11, 3, 0, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  },

  // ---------------------------------------------------------------- rows: roundel, name, baseline, count
  drawRows(ctx, t) {
    const out = 1 - ease.inCubic(clamp((t - T_UNIT) / 0.22));
    if (out <= 0 || t < T_ROWS) return;
    for (let m = 0; m < 4; m++) {
      const M = MODES[m], top = ROW_TOP[m], cy = top + 46, tin = t - (T_ROWS + 0.04 + 0.08 * m);
      if (tin <= 0) continue;
      const lines = Math.ceil(M.n / PER_LINE);
      // baselines: one hairline per line, drawn left → right
      const be = ease.inOutCubic(clamp(tin / 0.5)) * out;
      ctx.fillStyle = ink(0.13);
      for (let l = 0; l < lines; l++) {
        const y = top + 82 + l * ROW_LINE + 5, x1 = ROW_X0 - 22, x2 = slotXY(m, Math.min(M.n - 1, l * PER_LINE + PER_LINE - 1))[0] + 22;
        ctx.fillRect(x1, y, (x2 - x1) * be, 1.5);
      }
      // roundel
      const k = pop(tin, 0.42, 1.9) * out;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = shade(0.16 * Math.min(1, k)); ctx.beginPath(); ctx.ellipse(RND_X + 3, cy + RND_R + 2, RND_R * 0.82 * k, 6 * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.setTransform(k, 0, 0, k, RND_X, cy);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, 0, RND_R, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(251,245,234,0.22)'; ctx.beginPath(); ctx.arc(0, 0, RND_R - 5, 0, Math.PI * 2); ctx.stroke();
      drawPicto(ctx, M.icon);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // name
      const na = clamp((tin - 0.12) / 0.3) * out;
      ctx.globalAlpha = na; ctx.font = `700 27px ${PRE}`; ctx.fillStyle = INK; ctx.textAlign = 'center';
      ctx.fillText(M.name, RND_X, top + 126 + (1 - ease.outCubic(clamp((tin - 0.12) / 0.3))) * 10);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      // count: how many of this row have landed, at the end of the row
      const arr = this.rowArrive[m];
      let n = 0;
      while (n < arr.length && arr[n] <= t) n++;
      if (n > 0) {
        const [lx, ly] = slotXY(m, M.n - 1), bump = 1 + 0.16 * Math.exp(-14 * (t - arr[n - 1]));
        ctx.globalAlpha = clamp((t - arr[0]) / 0.15) * out;
        ctx.setTransform(bump, 0, 0, bump, lx + 34, ly - 20);
        const w = this.tab(ctx, String(n), 0, 0, `900 46px ${PRE}`, INK);
        ctx.font = `700 25px ${PRE}`; ctx.fillStyle = ink(0.62); ctx.fillText('명', w + 4, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      }
    }
  },

  // ---------------------------------------------------------------- breakfast counter (bottom left) → bracket label
  drawCounter(ctx, t) {
    if (t < T_SKIP) return;
    const a = ease.outCubic(clamp((t - T_SKIP) / 0.35));
    const lab = a * (1 - clamp((t - T_UNIT) / 0.25));
    // label + accent symbol (a legend for the colour)
    if (lab > 0) {
      ctx.globalAlpha = lab;
      ctx.fillStyle = shade(0.16); ctx.beginPath(); ctx.ellipse(98, 1534, 15, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      this.person(ctx, 98, 1532 + (1 - a) * 16, S_ICON, 1, 1, 0, ACC, lab);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = lab;
      ctx.font = `700 27px ${PRE}`; ctx.fillStyle = ink(0.7); ctx.fillText('아침을 거르고 나온 사람', CNT_X, 1446 + (1 - a) * 16);
      ctx.globalAlpha = 1;
    }
    // the number: counts the finished sweeps; later flies to the bracket under the tokens
    const arr = this.skipDone;
    let n = 0;
    while (n < arr.length && arr[n] <= t) n++;
    const fe = ease.inOutCubic(clamp((t - T_FLY32) / 0.45));
    const size = lerp(104, 62, fe), x = lerp(CNT_X, 0, fe), y = lerp(CNT_Y + (1 - a) * 16, TOK_Y + Y_LABEL, fe);
    ctx.font = `900 ${size}px ${PRE}`;
    const digits = String(n), wN = this.tabWidth(ctx, digits, `900 ${size}px ${PRE}`);
    ctx.font = `800 ${size * 0.46}px ${PRE}`;
    const wM = ctx.measureText('명').width, total = wN + size * 0.05 + wM;
    const bx = fe > 0 ? lerp(CNT_X, this.bracketMid() - total / 2, fe) : x;
    const bump = n > 0 && t < arr[n - 1] + 0.3 ? 1 + 0.1 * Math.exp(-14 * (t - arr[n - 1])) : 1;
    ctx.globalAlpha = a;
    ctx.setTransform(bump, 0, 0, bump, bx, y);
    this.tab(ctx, digits, 0, 0, `900 ${size}px ${PRE}`, ACC);
    ctx.font = `800 ${size * 0.46}px ${PRE}`; ctx.fillStyle = ACC; ctx.fillText('명', wN + size * 0.05, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  },
  /** where 32 people end on the token row: 3.2 tokens = three whole ones and 0.2 of the fourth's width */
  cutX() { const n = SKIP / UNIT, g = Math.floor(n); return tokX(g) - TOK_R + 2 * TOK_R * (n - g); },
  bracketMid() { return (tokX(0) - TOK_R + this.cutX()) / 2; },

  // ---------------------------------------------------------------- legend: [symbol] = 1명 → [token] = 10명
  drawLegend(ctx, t) {
    const a = ease.outCubic(clamp((t - 2.6) / 0.4));
    if (a <= 0) return;
    // after the unit change it glides into the closing block, centred under the bracket labels
    ctx.font = `900 50px ${PRE}`; const wNum = ctx.measureText('10명').width;
    ctx.font = `800 46px ${PRE}`; const wEq = ctx.measureText('=').width;
    const fx = 540 - (2 * TOK_R + 18 + wEq + 16 + wNum) / 2 + TOK_R, fy = TOK_Y + Y_LEGEND;
    const fe = ease.inOutCubic(clamp((t - T_LEGFLY) / 0.45));
    const x = lerp(LEG_X + (1 - a) * 40, fx, fe), cy = lerp(LEG_Y, fy, fe);
    ctx.globalAlpha = a * (1 - fe);
    ctx.font = `600 22px ${PRE}`; ctx.fillStyle = ink(0.55); ctx.fillText('범례', x - 22, cy - 64);
    ctx.globalAlpha = a;
    const R = TOK_R * pop(t - this.tLeg);
    if (R < TOK_R * 0.95) {
      ctx.fillStyle = shade(0.16); ctx.beginPath(); ctx.ellipse(x, cy + 38, 15, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      this.person(ctx, x, cy + 36, S_ICON, 1, 1, 0, INK, a);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    if (R > 0) { ctx.globalAlpha = 1; this.token(ctx, x, cy, R, INK, 0, 1, S_UNIT); ctx.globalAlpha = a; }
    ctx.font = `800 46px ${PRE}`; ctx.fillStyle = ink(0.45); ctx.fillText('=', x + TOK_R + 18, cy + 16);
    this.roll(ctx, [[0, '1명'], [this.tLeg, '10명']], t, x + TOK_R + 18 + wEq + 16, cy + 17, `900 50px ${PRE}`, 50, INK, wNum + 30);
    ctx.globalAlpha = 1;
  },

  // ---------------------------------------------------------------- the ending: bracket, message, footnote
  drawFinal(ctx, t) {
    // footnote (whole film)
    const fa = clamp((t - 0.6) / 0.4);
    if (fa > 0) {
      ctx.globalAlpha = fa; ctx.font = `500 22px ${PRE}`; ctx.fillStyle = ink(0.55);
      ctx.fillText('예시 데이터 · 실제 조사가 아닌 가상의 100명이에요', 72, 1614);
      ctx.globalAlpha = 1;
    }
    // bracket under 3.2 tokens (accent) and under the other 6.8 (ink), drawn left → right, after the last token
    const T_BRACKET = this.tBracket;
    if (t >= T_BRACKET) {
      const by = TOK_Y + Y_BRACKET, x0 = tokX(0) - TOK_R, xm = this.cutX(), x1 = tokX(9) + TOK_R;
      const e = ease.inOutCubic(clamp((t - T_BRACKET) / 0.45));
      const b = xm - 3, xe = x0 + (b - x0) * e;
      ctx.fillStyle = ACC; ctx.fillRect(x0, by, xe - x0, 4); ctx.fillRect(x0, by - 11, 4, 15);
      if (e >= 1) ctx.fillRect(b - 4, by - 11, 4, 15);
      if (t > T_BRACKET + 0.12) {
        const e2 = ease.inOutCubic(clamp((t - T_BRACKET - 0.12) / 0.45));
        const a = xm + 3, xe2 = a + (x1 - a) * e2;
        ctx.fillStyle = ink(0.4); ctx.fillRect(a, by, xe2 - a, 3); ctx.fillRect(a, by - 11, 3, 14);
        if (e2 >= 1) ctx.fillRect(x1 - 3, by - 11, 3, 14);
        const la = clamp((t - T_BRACKET - 0.4) / 0.3);
        ctx.globalAlpha = la; ctx.font = `800 54px ${PRE}`; ctx.fillStyle = ink(0.5); ctx.textAlign = 'center';
        const dy = (1 - ease.outCubic(la)) * 10;
        ctx.fillText(`${100 - SKIP}명`, (xm + x1) / 2, TOK_Y + Y_LABEL + dy);
        ctx.font = `700 27px ${PRE}`;
        ctx.fillText('아침 먹고 나옴', (xm + x1) / 2, TOK_Y + Y_SUB + dy);
        ctx.fillStyle = ACC; ctx.fillText('아침 거름', this.bracketMid(), TOK_Y + Y_SUB + dy);
        ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      }
    }
    // the message
    const L1 = '10명 중 3명꼴은', y1 = TOK_Y + Y_MSG1;
    this.rise(ctx, L1, 540, y1, `900 140px ${PRE}`, 140, INK, t, T_TEXT, { stagger: 0.04, dur: 0.5, align: 'center', accent: [6, 9], track: -3 });
    // the accent bar under "3명꼴" sweeps in after the words land
    const he = ease.inOutCubic(clamp((t - T_TEXT - 0.55) / 0.4));
    if (he > 0) {
      const [hx0, hx1] = this.accentSpan;
      ctx.fillStyle = ACC; ctx.beginPath(); rr(ctx, hx0 - 4, y1 + 28, Math.max(12, (hx1 - hx0 + 8) * he), 12, 6); ctx.fill();
    }
    this.rise(ctx, '아침을 거르고 출근해요', 540, TOK_Y + Y_MSG2, `700 72px ${PRE}`, 72, INK, t, T_TEXT + 0.22, { stagger: 0.03, dur: 0.45, align: 'center' });
  },

  // ---------------------------------------------------------------- type helpers
  /** syllables rise one after another inside a mask; accent = [from, to) index range drawn in the accent colour */
  rise(ctx, str, x, y, font, size, color, t, t0, { stagger = 0.04, dur = 0.5, align = 'left', accent = null, track = 0 } = {}) {
    if (t < t0) return;
    ctx.font = font;
    const ch = Array.from(str), xs = [];
    let w = 0;
    for (let i = 0; i < ch.length; i++) { xs.push(ctx.measureText(str.slice(0, i)).width + i * track); }
    w = ctx.measureText(str).width + (ch.length - 1) * track;
    const x0 = align === 'center' ? x - w / 2 : x;
    if (accent) this.accentSpan = [x0 + xs[accent[0]], x0 + xs[accent[1] - 1] + ctx.measureText(ch[accent[1] - 1]).width];
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 - 30, y - size * 1.02, w + 60, size * 1.18); ctx.clip();   // bottom edge just under the baseline
    for (let i = 0; i < ch.length; i++) {
      const u = clamp((t - t0 - i * stagger) / dur);
      if (u <= 0) continue;
      const e = ease.outBack(u, 1.2);
      ctx.globalAlpha = clamp(u * 3);
      ctx.fillStyle = accent && i >= accent[0] && i < accent[1] ? ACC : color;
      ctx.fillText(ch[i], x0 + xs[i], y + (1 - e) * size * 0.9);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  },
  /** a line that changes by rolling up inside a mask: items = [[t, text], …] */
  roll(ctx, items, t, x, y, font, size, color, maskW = 960) {
    let i = -1;
    for (let k = 0; k < items.length; k++) if (t >= items[k][0]) i = k;
    if (i < 0) return;
    const u = clamp((t - items[i][0]) / 0.45), e = ease.outCubic(u);
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 10, y - size * 1.12, maskW, size * 1.5); ctx.clip();
    ctx.font = font; ctx.fillStyle = color;
    const ga = ctx.globalAlpha;
    if (i > 0 && u < 1) { ctx.globalAlpha = ga * (1 - e); ctx.fillText(items[i - 1][1], x, y - e * size * 1.25); }
    ctx.globalAlpha = ga * e; ctx.fillText(items[i][1], x, y + (1 - e) * size * 1.25);
    ctx.restore();
    ctx.globalAlpha = ga;
  },
  /** digits in fixed-width cells (no jitter while counting); returns the width */
  tab(ctx, str, x, y, font, color) {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'center';
    const cell = this.cell(ctx, font);
    for (let i = 0; i < str.length; i++) ctx.fillText(str[i], x + cell * (i + 0.5), y);
    ctx.textAlign = 'left';
    return cell * str.length;
  },
  tabWidth(ctx, str, font) { ctx.font = font; return this.cell(ctx, font) * str.length; },
  cell(ctx, font) {
    if (!this.cells.has(font)) { let m = 0; for (const d of '0123456789') m = Math.max(m, ctx.measureText(d).width); this.cells.set(font, m * 0.96); }
    return this.cells.get(font);
  },
});
