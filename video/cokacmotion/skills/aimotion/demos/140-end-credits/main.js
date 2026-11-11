/*
 * 140 · 빈 의자 — 엔딩 크레딧 · 가운데 거터 정렬 + 일정 속도 스크롤 + 크레딧 스퀴즈
 *
 * The closing of an invented short film. Its last shot (an empty wooden chair by a window at dusk) fills the screen,
 * then squeezes into a framed window in the upper part while the end credits roll up beneath it. Canvas 2D only.
 *   layout  · a small credit typesetter: every line sits on an 8 px baseline grid; a centre gutter splits role and
 *             name (role right-aligned at gutter − g/2, names left-aligned at gutter + g/2, several names per role,
 *             name pairs across the gutter); widths are measured and too-long items step their size down.
 *   strip   · the whole credit list, final card included, is typeset once in setup into one tall canvas.
 *   roll    · the strip is blitted at a whole-pixel offset: K px per frame at 60 fps (speed = K × fps px/s), then
 *             a deceleration whose per-frame steps are non-increasing integers, landing the final card on a
 *             computed position. No resampling, no sub-pixel phase: every frame is the same pixels, moved.
 *   squeeze · the live shot is drawn under one affine map (scale and translate on one eased p) inside a clip rect
 *             interpolated with the same p, so the picture always covers its frame while it keeps animating.
 *   light   · the window light (the one accent colour) leaves the room over the piece and comes back as the small
 *             rules on the headings and, at the end, as the lit pane of the production mark.
 * Everything is invented: film, people, roles and the production company.
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2;
const FPS = 60;                                   // the roll is designed per frame at this rate
const SERIF = `"${FONTS.notoSerifKR.family}"`, SANS = `"${FONTS.pretendard.family}"`;

// ---------------------------------------------------------------- tokens: dusk room, dark surround, one accent
const AMB = [245, 169, 78];                       // the window light — the only accent colour
const CREAM = '#F3ECE0', ROLE_C = '#A69E93', HEAD_C = '#D9CDBA', FINE_C = '#8A837A';
const NIGHT = [14, 16, 34];                       // the room cools toward this as the light leaves
const WALL_T = [40, 44, 74], WALL_M = [66, 72, 106], WALL_B = [58, 63, 96], BASEB = [34, 36, 58];
const FLOOR_N = [70, 56, 66], FLOOR_F = [38, 31, 44];
const FRAME_L = [190, 180, 182], FRAME_D = [118, 112, 132];
const CURT = [52, 58, 94], CURT_L = [70, 78, 118], SHEER = [242, 232, 216];
const WOOD = [92, 60, 44], WOOD_L = [120, 80, 56], WOOD_D = [64, 41, 31];
const SHAWL = [196, 172, 160], SHAWL_D = [168, 144, 134];
const SKY_A = [[96, 104, 156], [200, 146, 166], [244, 172, 104], [250, 206, 140]];   // sky stops, sun up
const SKY_B = [[40, 44, 86], [108, 82, 126], [190, 116, 96], [214, 144, 104]];       // sky stops, sun gone
const ROOF = [58, 62, 100];

// ---------------------------------------------------------------- the squeeze: full screen → framed window
const WIN = { x: 96, y: 150, w: 888, h: 500, r: 18 };
const WCX = WIN.x + WIN.w / 2, WCY = WIN.y + WIN.h / 2;
const FX = 540, FY = 1290;                        // shot point that lands on the window centre
const S1 = 0.86;                                  // shot scale inside the window (≥ WIN.w / W, so it always covers)
const T_SQ0 = 1.5, T_SQ1 = 2.55;

// ---------------------------------------------------------------- the credit area and its typesetter
const CR_TOP = 702, CR_BOT = 1652, FADE = 124;    // visible band, soft masks at both ends
const G = 8;                                      // baseline grid
const GX = 540, GUTTER = 44, ROLE_X = GX - GUTTER / 2, NAME_X = GX + GUTTER / 2, MARGIN = 92;
const PITCH = 7 * G, HEAD_TO_ROW = 8 * G, SECTION = 13 * G, TOP_BASE = 6 * G, FINAL_MIN_GAP = 40 * G;
const RULE_W = 30, RULE_H = 3, RULE_DY = 2 * G;   // the amber rule under each heading (3 px: never a hairline)
const F_NAME = [500, 38, SERIF, 0.6], F_ROLE = [500, 24, SANS, 1.0], F_HEAD = [600, 22, SANS, 7.5];
const F_PAIR = [500, 36, SERIF, 0.6], F_THANKS = [500, 40, SERIF, 0.8], F_CO = [600, 24, SANS, 7.7], F_FINE = [400, 20, SANS, 0.8];
const THANKS_Y = 1057;                            // screen baseline of the thank-you line when the roll stops
const CREDITS = [
  { head: '연출 · 각본', rows: [{ role: '연출', names: ['한서윤'] }, { role: '각본', names: ['한서윤', '오지후'] }, { role: '조연출', names: ['문가람'] }] },
  { head: '출연', rows: [{ role: '정순', names: ['백영란'] }, { role: '해인', names: ['김다온'] }, { role: '우체부', names: ['서재민'] }, { role: '옆집 아이', names: ['노은솔'] }] },
  { head: '촬영', rows: [{ role: '촬영', names: ['윤도경'] }, { role: '조명', names: ['마은호'] }, { role: '촬영부', names: ['장하람', '표지안'] }] },
  { head: '미술', rows: [{ role: '미술', names: ['차여름'] }, { role: '소품 · 의상', names: ['진누리'] }] },
  { head: '음악', rows: [{ role: '음악', names: ['류시온'] }, { role: '첼로', names: ['엄다빈'] }, { role: '음향', names: ['구태린'] }] },
  { head: '도움 주신 분들', rows: [{ pair: ['우승아', '하보미'] }, { pair: ['남궁솔', '진영채'] }, { center: '골목 이웃 여러분' }] },
];
const THANKS = '끝까지 함께해 주셔서 고맙습니다', COMPANY = '저녁창 필름', FICTION = '이 작품의 인물과 단체는 모두 가상입니다';
const MARK_DY = 70, MARK_H = 84, CO_DY = 214, FINE_DY = 270;   // final card, from the thank-you baseline

// ---------------------------------------------------------------- the roll (frames at 60 fps)
const K = 8;                                      // px per frame → 480 px/s
const N0 = Math.round(2.15 * FPS);                // first moving frame
const N_STOP = Math.round(8.4 * FPS);             // the strip stands still from here
const ND = 72;                                    // deceleration frames (1.2 s)
const T_LIT0 = 8.55, T_LIT1 = 9.15;               // the mark's pane lights

// ---------------------------------------------------------------- helpers
const smooth = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const rgba = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const font = (f, px = f[1]) => `${f[0]} ${px}px ${f[2]}`;
function rrPath(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function poly(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }
function seg(c, x0, y0, x1, y1) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
/** convex hull (monotone chain) */
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
/** distance inside a convex polygon (≤ 0 outside) */
function insideDist(h, x, y) {
  let d = -Infinity;
  for (let i = 0; i < h.length; i++) {
    const a = h[i], b = h[(i + 1) % h.length], ex = b[0] - a[0], ey = b[1] - a[1];
    d = Math.max(d, ((x - a[0]) * ey - (y - a[1]) * ex) / Math.hypot(ex, ey));
  }
  return -d;   // hull() winds so that the interior is on the negative side of every edge: the nearest edge decides
}

// ---------------------------------------------------------------- typesetting (setup only)
/** per-character advances with tracking; Korean has no kerning, so the sum is the set width */
function measure(c, text, f, px = f[1]) {
  c.font = font(f, px);
  const tr = f[3] * px / f[1], adv = [];
  let w = 0;
  for (const ch of text) { const a = c.measureText(ch).width; adv.push(a); w += a; }
  return { w: w + tr * Math.max(0, adv.length - 1), adv, tr, px };
}
/** largest size ≤ the design size whose set width fits maxW (step 1 px) */
function fit(c, text, f, maxW) {
  let px = f[1], m = measure(c, text, f, px);
  while (m.w > maxW && px > 12) { px--; m = measure(c, text, f, px); }
  return m;
}
function setText(c, text, f, m, x, y, align, color) {
  c.font = font(f, m.px);
  c.fillStyle = color;
  let px = Math.round(align === 'right' ? x - m.w : align === 'center' ? x - m.w / 2 : x);
  let i = 0;
  for (const ch of text) { c.fillText(ch, px, y); px += m.adv[i++] + m.tr; }
}
/** lay the credits out on the baseline grid: returns draw ops and the last baseline */
function layoutCredits(c) {
  const ops = [], roleMax = ROLE_X - MARGIN, nameMax = W - MARGIN - NAME_X;
  let y = TOP_BASE, shrunk = 0;
  const put = (text, f, x, align, maxW, color) => {
    const m = fit(c, text, f, maxW);
    if (m.px < f[1]) shrunk++;
    ops.push({ text, f, m, x, y, align, color });
  };
  CREDITS.forEach((sec, si) => {
    if (si) y += SECTION;
    put(sec.head, F_HEAD, GX, 'center', W - 2 * MARGIN, HEAD_C);
    ops.push({ rule: true, x: GX - RULE_W / 2, y: y + RULE_DY });
    y += HEAD_TO_ROW;
    sec.rows.forEach((row, ri) => {
      if (ri) y += PITCH;
      if (row.pair) { put(row.pair[0], F_PAIR, ROLE_X, 'right', roleMax, CREAM); put(row.pair[1], F_PAIR, NAME_X, 'left', nameMax, CREAM); }
      else if (row.center) put(row.center, F_PAIR, GX, 'center', W - 2 * MARGIN, CREAM);
      else {
        put(row.role, F_ROLE, ROLE_X, 'right', roleMax, ROLE_C);         // shares the first name's baseline
        row.names.forEach((n, j) => { if (j) y += PITCH; put(n, F_NAME, NAME_X, 'left', nameMax, CREAM); });
      }
    });
  });
  return { ops, end: y, shrunk };
}

// ---------------------------------------------------------------- the production mark (an arched window), drawn in code
const MARK_CX = 540.5;                            // half-pixel centre: the 3 px strokes land on whole pixels
function markGeom(top) {
  const x0 = MARK_CX - 30, x1 = MARK_CX + 30, ya = top + 30, yb = top + MARK_H + 0.5, ym = top + 50.5;
  return { x0, x1, ya, yb, ym, pane: [MARK_CX + 1.5, ym + 1.5, x1 - 1.5 - (MARK_CX + 1.5), yb - 1.5 - (ym + 1.5)] };
}
function drawMark(c, top) {
  const m = markGeom(top);
  c.strokeStyle = CREAM; c.lineWidth = 3; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(m.x0, m.yb); c.lineTo(m.x0, m.ya); c.arc(MARK_CX, m.ya, 30, Math.PI, 0); c.lineTo(m.x1, m.yb); c.closePath(); c.stroke();
  seg(c, MARK_CX, top + 1, MARK_CX, m.yb); seg(c, m.x0, m.ym, m.x1, m.ym);
  c.fillStyle = CREAM; c.fillRect(Math.round(m.x0) - 12, Math.round(m.yb) + 6, 84, 4);   // the sill
}

// ---------------------------------------------------------------- the shot (shot space = the full 1080×1920 frame)
const WALL_BASE = 1330;
const GX0 = 200, GX1 = 620, GY0 = 520, GY1 = 1220, CASE = 22;   // window glass and casing
const MUNT_X = 410, MUNT_Y = [753, 987], MUNT = 12;
const ROOFS = [[190, 1230], [190, 1152], [236, 1118], [282, 1152], [282, 1170], [326, 1170], [326, 1138], [370, 1106], [414, 1138], [414, 1176],
  [462, 1176], [462, 1150], [500, 1150], [500, 1128], [516, 1128], [516, 1150], [580, 1150], [580, 1132], [612, 1112], [640, 1132], [640, 1230]];
const LIT = [[244, 1178, 10, 12, 6.3], [352, 1150, 9, 11, 7.6], [480, 1162, 9, 11, 8.9]];   // neighbours' windows: x, y, w, h, on at
// the chair (3/4 view, backlit): feet, seat corners, back posts, crest, rails
const FT = { bl: [604, 1480], br: [756, 1476], fl: [588, 1550], fr: [778, 1546] };
const SEAT = { bl: [604, 1384], br: [758, 1380], fr: [780, 1426], fl: [584, 1432] };
const POST_L = [[606, 1388], [596, 1094]], POST_R = [[754, 1384], [764, 1090]];
const SLATS = [640, 680, 720], RAIL_Y = 1250;

function light(t) { return 1 - 0.3 * smooth(t / 8.5) - 0.45 * smooth((t - 8.0) / 1.8); }

function drawShot(c, t, L, S) {
  const sink = 1 - L, kd = 0.5 * sink;
  const A = (col, a = 1) => rgba(mix(col, NIGHT, kd), a);
  const amb = (a) => rgba(AMB, a);
  let g;

  // ---- back wall: dusk gradient, faint wallpaper stripes, a warm bounce around the window
  g = c.createLinearGradient(0, 0, 0, WALL_BASE);
  g.addColorStop(0, A(WALL_T)); g.addColorStop(0.55, A(WALL_M)); g.addColorStop(1, A(WALL_B));
  c.fillStyle = g; c.fillRect(0, 0, W, WALL_BASE);
  c.fillStyle = 'rgba(255,255,255,0.022)';
  c.beginPath(); for (let x = 14; x < W; x += 60) c.rect(x, 0, 22, WALL_BASE - 18); c.fill();
  c.globalCompositeOperation = 'lighter';
  g = c.createRadialGradient(420, 900, 40, 420, 900, 700);
  g.addColorStop(0, amb(0.13 * L)); g.addColorStop(1, amb(0));
  c.fillStyle = g; c.fillRect(0, 160, W, WALL_BASE - 160);
  c.globalCompositeOperation = 'source-over';

  // ---- pendant lamp (off) and a framed photo of two people
  c.strokeStyle = A([30, 30, 48]); c.lineWidth = 3; seg(c, 826, 0, 826, 320);
  c.fillStyle = A([36, 38, 60]);
  c.beginPath(); c.moveTo(808, 318); c.lineTo(844, 318); c.quadraticCurveTo(874, 330, 888, 394); c.lineTo(764, 394); c.quadraticCurveTo(778, 330, 808, 318); c.fill();
  c.fillStyle = A([24, 25, 42]); c.beginPath(); c.ellipse(826, 394, 62, 9, 0, 0, TAU); c.fill();
  c.strokeStyle = amb(0.22 * L); c.lineWidth = 2;
  c.beginPath(); c.moveTo(806, 321); c.quadraticCurveTo(778, 332, 766, 390); c.stroke();
  c.fillStyle = A([60, 44, 40]); c.fillRect(800, 742, 150, 182);
  c.fillStyle = A([200, 190, 176]); c.fillRect(811, 753, 128, 160);
  g = c.createLinearGradient(0, 768, 0, 898); g.addColorStop(0, A([176, 150, 124])); g.addColorStop(1, A([136, 112, 94]));
  c.fillStyle = g; c.fillRect(825, 767, 100, 132);
  c.save(); c.beginPath(); c.rect(825, 767, 100, 132); c.clip();
  c.fillStyle = A([98, 78, 68]);
  c.beginPath(); c.arc(858, 818, 14, 0, TAU); c.fill(); c.beginPath(); c.ellipse(858, 874, 31, 34, 0, Math.PI, TAU); c.fill(); c.fillRect(827, 873, 62, 30);
  c.beginPath(); c.arc(897, 846, 10, 0, TAU); c.fill(); c.beginPath(); c.ellipse(897, 886, 21, 26, 0, Math.PI, TAU); c.fill(); c.fillRect(876, 885, 42, 20);
  c.restore();
  c.strokeStyle = amb(0.18 * L); c.lineWidth = 2; seg(c, 801, 744, 801, 922);

  // ---- floor: plank lines toward one vanishing point, baseboard
  g = c.createLinearGradient(0, WALL_BASE, 0, H);
  g.addColorStop(0, A(FLOOR_N)); g.addColorStop(1, A(FLOOR_F));
  const floorFill = g;
  c.fillStyle = g; c.fillRect(0, WALL_BASE, W, H - WALL_BASE);
  c.strokeStyle = 'rgba(0,0,0,0.16)'; c.lineWidth = 2;
  c.beginPath();
  for (let i = -7; i <= 7; i++) { const xb = 540 + i * 150, xw = 540 + i * 150 * 0.4914; c.moveTo(xw, WALL_BASE); c.lineTo(xb, H); }
  c.stroke();
  c.fillStyle = A(BASEB); c.fillRect(0, WALL_BASE - 18, W, 18);
  c.fillStyle = A([78, 84, 120]); c.fillRect(0, WALL_BASE - 20, W, 3);

  // ---- outside the glass: sky, sinking sun, far hill, birds, roofs, neighbours' lights
  c.save(); c.beginPath(); c.rect(GX0, GY0, GX1 - GX0, GY1 - GY0); c.clip();
  const sk = clamp(sink * 1.15);
  g = c.createLinearGradient(0, GY0, 0, GY1);
  [0, 0.5, 0.86, 1].forEach((u, i) => g.addColorStop(u, rgba(mix(SKY_A[i], SKY_B[i], sk))));
  c.fillStyle = g; c.fillRect(GX0, GY0, GX1 - GX0, GY1 - GY0);
  const sunY = 1132 + 96 * sink;
  c.globalCompositeOperation = 'lighter';
  g = c.createRadialGradient(306, sunY, 20, 306, sunY, 260);
  g.addColorStop(0, amb(0.55 * L)); g.addColorStop(1, amb(0));
  c.fillStyle = g; c.fillRect(GX0, GY0, GX1 - GX0, GY1 - GY0);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = rgba(mix([255, 232, 184], [250, 190, 130], sk)); c.beginPath(); c.arc(306, sunY, 40, 0, TAU); c.fill();
  c.fillStyle = rgba(mix([150, 112, 146], [80, 64, 104], sk), 0.85);
  c.beginPath(); c.moveTo(GX0, 1160); c.quadraticCurveTo(300, 1112, 420, 1140); c.quadraticCurveTo(520, 1160, GX1, 1124); c.lineTo(GX1, GY1); c.lineTo(GX0, GY1); c.fill();
  if (t < 4) {
    c.strokeStyle = rgba(mix([60, 56, 92], NIGHT, kd)); c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [d, y0, sz] of [[0, 668, 11], [0.32, 702, 8]]) {
      const bx = 650 - 172 * (t - 0.15 - d), by = y0 + 10 * Math.sin(1.7 * t + d * 4), fl = 0.55 * Math.sin(17 * t + d * 9);
      c.beginPath(); c.moveTo(bx - sz, by - sz * fl); c.quadraticCurveTo(bx - sz * 0.4, by - 2, bx, by + 2); c.quadraticCurveTo(bx + sz * 0.4, by - 2, bx + sz, by - sz * fl); c.stroke();
    }
    c.lineCap = 'butt'; c.lineJoin = 'miter';
  }
  c.fillStyle = A(ROOF); poly(c, ROOFS); c.fill();
  for (const [x, y, w, h, on] of LIT) { const a = smooth((t - on) / 0.25); if (a > 0) { c.fillStyle = amb(0.9 * a); c.fillRect(x, y, w, h); } }
  c.restore();

  // ---- window casing and muntins (dark against the bright glass), light wrapping their edges
  c.fillStyle = A(FRAME_D);
  c.beginPath(); c.rect(GX0 - CASE, GY0 - CASE, GX1 - GX0 + 2 * CASE, GY1 - GY0 + 2 * CASE); c.rect(GX0, GY0, GX1 - GX0, GY1 - GY0); c.fill('evenodd');
  c.fillRect(MUNT_X - MUNT / 2, GY0, MUNT, GY1 - GY0);
  for (const y of MUNT_Y) c.fillRect(GX0, y - MUNT / 2, GX1 - GX0, MUNT);
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = amb(0.42 * L); c.lineWidth = 3;
  c.strokeRect(GX0 + 1.5, GY0 + 1.5, GX1 - GX0 - 3, GY1 - GY0 - 3);
  c.beginPath();
  c.moveTo(MUNT_X - MUNT / 2 - 1.5, GY0); c.lineTo(MUNT_X - MUNT / 2 - 1.5, GY1); c.moveTo(MUNT_X + MUNT / 2 + 1.5, GY0); c.lineTo(MUNT_X + MUNT / 2 + 1.5, GY1);
  for (const y of MUNT_Y) { c.moveTo(GX0, y - MUNT / 2 - 1.5); c.lineTo(GX1, y - MUNT / 2 - 1.5); c.moveTo(GX0, y + MUNT / 2 + 1.5); c.lineTo(GX1, y + MUNT / 2 + 1.5); }
  c.stroke();
  c.globalCompositeOperation = 'source-over';
  const sillY = GY1 + CASE - 2;
  c.fillStyle = A(FRAME_L); c.fillRect(GX0 - 46, sillY, GX1 - GX0 + 92, 12);
  c.fillStyle = A(FRAME_D); c.fillRect(GX0 - 46, sillY + 12, GX1 - GX0 + 92, 14);
  g = c.createLinearGradient(0, sillY + 26, 0, sillY + 70); g.addColorStop(0, 'rgba(8,8,20,0.32)'); g.addColorStop(1, 'rgba(8,8,20,0)');
  c.fillStyle = g; c.fillRect(GX0 - 46, sillY + 26, GX1 - GX0 + 92, 44);
  // a small plant on the sill, a silhouette against the glass
  c.fillStyle = A([46, 62, 58]);
  [-1.05, -0.55, -0.05, 0.45, 0.95].forEach((a, i) => {
    const r = a + 0.05 * Math.sin(1.3 * t + i * 1.7), len = 34 + 10 * Math.cos(i * 2.1);
    c.beginPath(); c.ellipse(281 + Math.sin(r) * len * 0.55, 1208 - Math.cos(r) * len * 0.55, 8, len * 0.55, r, 0, TAU); c.fill();
  });
  c.fillStyle = A([128, 82, 68]); poly(c, [[260, 1206], [302, 1206], [297, sillY], [265, sillY]]); c.fill();
  c.fillStyle = A([150, 98, 80]); c.fillRect(258, 1203, 46, 7);

  // ---- curtains: a heavy one at the left, a sheer one breathing in the draught at the right
  const sw1 = 4 * Math.sin(1.2 * t + 0.4);
  c.fillStyle = A(CURT); poly(c, [[108, 466], [236, 466], [246 + sw1, 1322], [96 + sw1, 1322]]); c.fill();
  c.fillStyle = A(CURT_L, 0.55);
  for (const f of [0.2, 0.5, 0.79]) {
    const xt = lerp(108, 236, f), xb = lerp(96, 246, f) + sw1;
    poly(c, [[xt - 6, 466], [xt + 6, 466], [xb + 10, 1322], [xb - 10, 1322]]); c.fill();
  }
  c.strokeStyle = amb(0.32 * L); c.lineWidth = 3; seg(c, 236.5, 470, 246 + sw1, 1320);
  const sw = 26 * Math.sin(1.05 * t) + 12 * Math.sin(2.1 * t + 1.3), hem = 6 * Math.sin(2 * t + 0.6);
  const sheer = () => {
    c.beginPath(); c.moveTo(452, 466); c.lineTo(684, 466);
    c.quadraticCurveTo(690 + sw * 0.1, 900, 692 + sw * 0.2, 1306);
    c.quadraticCurveTo(586 + sw * 0.6, 1318 + hem, 488 + sw, 1306);
    c.quadraticCurveTo(444 + sw * 0.45, 900, 452, 466); c.closePath();
  };
  sheer(); c.fillStyle = rgba(mix(SHEER, NIGHT, kd), 0.16); c.fill();
  c.save(); sheer(); c.clip();
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = amb(0.12 * L); c.fillRect(GX0, GY0, GX1 - GX0, GY1 - GY0);
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = rgba(mix(SHEER, NIGHT, kd), 0.13); c.lineWidth = 3;
  for (let i = 1; i < 6; i++) {
    const f = i / 6, xt = lerp(452, 684, f), xb = lerp(488 + sw, 692 + sw * 0.2, f);
    c.beginPath(); c.moveTo(xt, 466); c.quadraticCurveTo(lerp(444 + sw * 0.45, 690 + sw * 0.1, f) + 6 * Math.sin(i * 2.3 + t), 900, xb, 1308); c.stroke();
  }
  c.restore();
  c.fillStyle = A([30, 30, 46]); c.fillRect(104, 464, 612, 7);
  c.beginPath(); c.arc(104, 467, 9, 0, TAU); c.arc(716, 467, 9, 0, TAU); c.fill();

  // ---- the sun's patch on the floor: the window's panes projected (bilinear cells), soft edges by stacking
  const NL = [304 + 20 * sink, 1376 + 18 * sink], NR = [604 + 30 * sink, 1370 + 18 * sink];
  const FL = [430 + 60 * sink, 1704 + 70 * sink], FR = [962 + 90 * sink, 1692 + 70 * sink];
  const P = (u, v) => { const a = [lerp(NL[0], NR[0], u), lerp(NL[1], NR[1], u)], b = [lerp(FL[0], FR[0], u), lerp(FL[1], FR[1], u)]; return [lerp(a[0], b[0], v), lerp(a[1], b[1], v)]; };
  const COLS = [[0, 0.484], [0.516, 1]], ROWS = [[0, 0.318], [0.344, 0.656], [0.682, 1]];
  c.globalCompositeOperation = 'lighter';
  for (const [grow, a] of [[0.016, 0.16], [0, 0.26], [-0.014, 0.2]]) {
    c.fillStyle = amb(a * 1.15 * L);
    c.beginPath();
    for (const [u0, u1] of COLS) for (const [v0, v1] of ROWS) {
      const q = [P(u0 - grow, v0 - grow), P(u1 + grow, v0 - grow), P(u1 + grow, v1 + grow), P(u0 - grow, v1 + grow)];
      c.moveTo(q[0][0], q[0][1]); for (let i = 1; i < 4; i++) c.lineTo(q[i][0], q[i][1]);
    }
    c.fill();
  }
  c.globalCompositeOperation = 'source-over';
  // the chair's shadow, visible only inside the patch: every point is pushed along the light by its height
  const sx = 0.3 + 0.1 * sink, sy = 0.4 + 0.12 * sink;
  const pr = (pt, foot) => { const h = foot[1] - pt[1]; return [pt[0] + h * sx, foot[1] + h * sy]; };   // h = height above its foot
  const backFoot = (x) => [lerp(FT.bl[0], FT.br[0], (x - FT.bl[0]) / (FT.br[0] - FT.bl[0])), lerp(FT.bl[1], FT.br[1], (x - FT.bl[0]) / (FT.br[0] - FT.bl[0]))];
  c.save();
  poly(c, [P(-0.03, -0.03), P(1.03, -0.03), P(1.03, 1.03), P(-0.03, 1.03)]); c.clip();
  c.fillStyle = floorFill; c.strokeStyle = floorFill; c.globalAlpha = 0.9; c.lineCap = 'round';
  poly(c, [pr(SEAT.bl, FT.bl), pr(SEAT.br, FT.br), pr(SEAT.fr, FT.fr), pr(SEAT.fl, FT.fl)]); c.fill();
  c.lineWidth = 13;
  for (const k of ['bl', 'br', 'fl', 'fr']) { const a = pr(SEAT[k], FT[k]); seg(c, FT[k][0], FT[k][1], a[0], a[1]); }
  c.lineWidth = 12;
  for (const post of [POST_L, POST_R]) { const f = backFoot(post[0][0]), a = pr(post[0], f), b = pr(post[1], f); seg(c, a[0], a[1], b[0], b[1]); }
  for (const x of SLATS) { const f = backFoot(x), a = pr([x, 1120], f), b = pr([x, RAIL_Y], f); seg(c, a[0], a[1], b[0], b[1]); }
  c.lineWidth = 9; { const a = pr([604, RAIL_Y], backFoot(604)), b = pr([756, RAIL_Y], backFoot(756)); seg(c, a[0], a[1], b[0], b[1]); }
  { const a = pr([590, 1092], backFoot(596)), m = pr([680, 1074], backFoot(680)), b = pr([770, 1088], backFoot(764));
    const a2 = pr([600, 1126], backFoot(600)), m2 = pr([680, 1112], backFoot(680)), b2 = pr([760, 1122], backFoot(760));
    c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(m[0], m[1], b[0], b[1]); c.lineTo(b2[0], b2[1]); c.quadraticCurveTo(m2[0], m2[1], a2[0], a2[1]); c.closePath(); c.fill();
    const s0 = pr([588, 1092], backFoot(596)), s1 = pr([600, 1250], backFoot(600)), s2 = pr([672, 1236], backFoot(672)), s3 = pr([694, 1100], backFoot(694));
    poly(c, [s0, s3, s2, s1]); c.fill(); }
  c.restore();
  c.globalAlpha = 1; c.lineCap = 'butt';

  // ---- the chair, backlit: dark wood with a warm rim on the edges that face the window
  drawChair(c, t, L, A, amb);

  // ---- the shaft: the hull of the glass and its patch, a soft additive gradient, dust drifting in it
  const sh = hull([[GX0, GY0], [GX1, GY0], [GX1, GY1], [GX0, GY1], NL, NR, FR, FL]);
  c.globalCompositeOperation = 'lighter';
  g = c.createLinearGradient(400, 760, 700, 1660);
  g.addColorStop(0, amb(0)); g.addColorStop(0.2, amb(0.1 * L)); g.addColorStop(0.62, amb(0.05 * L)); g.addColorStop(1, amb(0));
  c.fillStyle = g; poly(c, sh); c.fill();
  for (const m of S.dust) {
    const x = m.x + 16 * Math.sin(0.45 * t + m.p1);
    const y = 440 + ((((m.y - 440 - 11 * t + 7 * Math.sin(0.6 * t + m.p2)) % 1340) + 1340) % 1340);
    const a = smooth(insideDist(sh, x, y) / 60) * (0.55 + 0.45 * Math.sin(m.tw * t + m.p1)) * L;
    if (a <= 0.01) continue;
    c.fillStyle = `rgba(255,214,160,${(0.75 * a).toFixed(3)})`;
    c.beginPath(); c.arc(x, y, m.r, 0, TAU); c.fill();
  }
  c.globalCompositeOperation = 'source-over';

  // ---- lens vignette
  g = c.createRadialGradient(560, 1180, 320, 560, 1180, 1300);
  g.addColorStop(0, 'rgba(8,8,20,0)'); g.addColorStop(1, 'rgba(8,8,20,0.62)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

function drawChair(c, t, L, A, amb) {
  const wood = A(WOOD), woodL = A(WOOD_L), woodD = A(WOOD_D);
  c.lineCap = 'round';
  const stick = (a, b, w, col) => { c.strokeStyle = col; c.lineWidth = w; seg(c, a[0], a[1], b[0], b[1]); };
  // back legs and the side rung, then the back
  stick([608, 1392], FT.bl, 12, woodD); stick([752, 1388], FT.br, 12, woodD);
  stick([594, 1500], [607, 1462], 7, woodD);
  stick(POST_L[0], POST_L[1], 14, wood); stick(POST_R[0], POST_R[1], 14, wood);
  for (const x of SLATS) stick([x, 1118], [x, RAIL_Y], 11, woodD);
  stick([604, RAIL_Y], [756, RAIL_Y - 4], 10, wood);
  // the crest rail
  c.fillStyle = wood;
  c.beginPath(); c.moveTo(588, 1094); c.quadraticCurveTo(680, 1070, 772, 1090); c.lineTo(762, 1124); c.quadraticCurveTo(680, 1108, 600, 1128); c.closePath(); c.fill();
  c.fillStyle = woodD;
  c.beginPath(); c.moveTo(600, 1128); c.quadraticCurveTo(680, 1108, 762, 1124); c.lineTo(761, 1118); c.quadraticCurveTo(680, 1102, 599, 1122); c.closePath(); c.fill();
  // the shawl draped over the crest, hanging down the left of the back
  const sway = 2.5 * Math.sin(1.1 * t + 0.8);
  const shawl = () => {
    c.beginPath(); c.moveTo(583, 1092); c.quadraticCurveTo(640, 1074, 698, 1082);
    c.quadraticCurveTo(706, 1112, 690 + sway * 0.5, 1146); c.quadraticCurveTo(676 + sway, 1196, 678 + sway, 1248);
    c.lineTo(596 + sway, 1262); c.quadraticCurveTo(586, 1190, 579, 1120); c.closePath();
  };
  shawl(); c.fillStyle = A(SHAWL); c.fill();
  c.save(); shawl(); c.clip();
  c.fillStyle = A(SHAWL_D);
  for (const y of [1150, 1176, 1216]) { c.beginPath(); c.moveTo(570, y); c.quadraticCurveTo(640, y - 10, 720, y - 2); c.lineTo(720, y + 9); c.quadraticCurveTo(640, y - 1, 570, y + 9); c.fill(); }
  c.fillStyle = 'rgba(10,8,24,0.18)'; c.fillRect(650, 1060, 80, 220);
  c.restore();
  c.strokeStyle = A(SHAWL_D); c.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const x = 600 + sway + i * 10.5, y = lerp(1261, 1249, i / 7); seg(c, x, y, x - 1 + sway * 0.4, y + 12); }
  // the seat: top, front face; a closed book with reading glasses on it
  c.fillStyle = woodL; poly(c, [SEAT.bl, SEAT.br, SEAT.fr, SEAT.fl]); c.fill();
  c.fillStyle = wood; poly(c, [SEAT.fl, SEAT.fr, [780, 1442], [584, 1448]]); c.fill();
  c.fillStyle = A([226, 214, 194]); poly(c, [[636, 1404], [718, 1399], [726, 1418], [632, 1424]]); c.fill();
  c.fillStyle = A([78, 90, 126]); poly(c, [[636, 1398], [718, 1393], [726, 1412], [632, 1418]]); c.fill();
  c.strokeStyle = A([22, 20, 32]); c.lineWidth = 2.5;
  c.beginPath(); c.ellipse(667, 1402, 10, 6, -0.05, 0, TAU); c.stroke();
  c.beginPath(); c.ellipse(694, 1400, 10, 6, -0.05, 0, TAU); c.stroke();
  seg(c, 677, 1401, 684, 1400); seg(c, 657, 1401, 646, 1396); seg(c, 704, 1399, 714, 1394);
  c.fillStyle = amb(0.7 * L); c.fillRect(661, 1398, 4, 2);
  // front legs and the front rung
  stick([592, 1446], FT.fl, 15, wood); stick([772, 1442], FT.fr, 15, wood);
  stick([592, 1508], [774, 1504], 8, woodD);
  // the rim: light from the window catching the left and top edges
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = amb(0.75 * L); c.lineWidth = 3;
  seg(c, POST_L[0][0] - 6, POST_L[0][1], POST_L[1][0] - 6, POST_L[1][1] + 4);
  c.beginPath(); c.moveTo(590, 1092); c.quadraticCurveTo(680, 1068, 770, 1089); c.stroke();
  c.beginPath(); c.moveTo(583, 1092); c.quadraticCurveTo(640, 1073, 698, 1081); c.stroke();
  seg(c, 581, 1112, 586, 1180);
  seg(c, SEAT.bl[0], SEAT.bl[1], SEAT.br[0], SEAT.br[1]);
  seg(c, 585, 1452, 581, 1546); seg(c, 601, 1396, 597, 1478);
  c.strokeStyle = amb(0.35 * L);
  seg(c, POST_R[0][0] - 6, POST_R[0][1], POST_R[1][0] - 6, POST_R[1][1] + 6);
  for (const x of SLATS) seg(c, x - 5, 1124, x - 5, RAIL_Y - 6);
  c.globalCompositeOperation = 'source-over';
  c.lineCap = 'butt';
}

// ---------------------------------------------------------------- demo
defineDemo({
  id: '140-end-credits',
  title: '빈 의자',
  tech: '엔딩 크레딧 · 가운데 거터 정렬 + 일정 속도 스크롤 + 크레딧 스퀴즈',
  duration: D,
  fps: FPS,
  background: '#111218',
  async setup(api) {
    const t0 = performance.now();
    const attrs = api.headless ? { willReadFrequently: true } : undefined;
    this.ctx = api.canvas({ z: 0, attrs }).ctx;
    this.cctx = api.canvas({ z: 1, attrs }).ctx;

    // ---- fonts: load exactly the glyphs the credits use
    const serifText = CREDITS.flatMap((s) => s.rows.flatMap((r) => r.names || r.pair || [r.center])).join('') + THANKS;
    const sansText = CREDITS.map((s) => s.head + s.rows.map((r) => r.role || '').join('')).join('') + COMPANY + FICTION;
    await Promise.all([fontReady(font(F_NAME), serifText), fontReady(font(F_PAIR), serifText), fontReady(font(F_THANKS), serifText),
      fontReady(font(F_ROLE), sansText), fontReady(font(F_HEAD), sansText), fontReady(font(F_CO), sansText), fontReady(font(F_FINE), sansText)]);

    // ---- the roll: K px per frame, then a deceleration whose steps are non-increasing whole pixels
    // v_j = K·(1 − j/M)², rounded; M is stretched so that the last 1 px step falls on the last decel frame
    const M = ND / (1 - Math.sqrt(0.5 / K)), dec = [];
    for (let j = 1; j <= ND; j++) dec.push(Math.max(1, Math.round(K * (1 - j / M) ** 2)));
    const NC = N_STOP - ND - N0;                    // frames at full speed
    const steps = [...Array(NC).fill(K), ...dec];
    const total = steps.reduce((a, b) => a + b, 0);
    // ---- layout, then place the final card where the roll will stop
    const meas = document.createElement('canvas').getContext('2d');
    const lay = layoutCredits(meas);
    const startTop = CR_BOT - (TOP_BASE - 20);      // strip top when it starts: the first heading just under the band
    const finalTop = startTop - total;               // strip top when it stops
    const thanksB = THANKS_Y - finalTop;             // the thank-you baseline inside the strip
    this.finalGap = thanksB - lay.end;
    if (this.finalGap < FINAL_MIN_GAP) console.warn('final card too close to the last credit:', this.finalGap);
    const pos = new Int32Array(steps.length + 1);
    pos[0] = startTop;
    for (let i = 0; i < steps.length; i++) pos[i + 1] = pos[i] - steps[i];
    this.pos = pos; this.finalTop = pos[pos.length - 1];
    this.markTop = thanksB + MARK_DY;
    this.t0 = N0 / FPS; this.tStop = (N0 + steps.length) / FPS;

    // ---- typeset the strip once
    const SH = thanksB + FINE_DY + 40;
    const strip = document.createElement('canvas');
    strip.width = W; strip.height = SH;
    const s = strip.getContext('2d', attrs);
    s.textBaseline = 'alphabetic';
    for (const op of lay.ops) {
      if (op.rule) { s.fillStyle = rgba(AMB); s.fillRect(op.x, op.y, RULE_W, RULE_H); continue; }
      setText(s, op.text, op.f, op.m, op.x, op.y, op.align, op.color);
    }
    setText(s, THANKS, F_THANKS, fit(s, THANKS, F_THANKS, W - 2 * MARGIN), GX, thanksB, 'center', CREAM);
    drawMark(s, this.markTop);
    setText(s, COMPANY, F_CO, fit(s, COMPANY, F_CO, W), GX, thanksB + CO_DY, 'center', CREAM);
    setText(s, FICTION, F_FINE, fit(s, FICTION, F_FINE, W), GX, thanksB + FINE_DY, 'center', FINE_C);
    this.strip = strip;

    // ---- the credit band's soft masks (smoothstep sampled into gradient stops)
    const mg = this.cctx.createLinearGradient(0, CR_TOP, 0, CR_BOT), fr = FADE / (CR_BOT - CR_TOP);
    for (let i = 0; i <= 8; i++) { const u = i / 8, a = smooth(u); mg.addColorStop(u * fr, `rgba(0,0,0,${a})`); mg.addColorStop(1 - u * fr, `rgba(0,0,0,${a})`); }
    this.mask = mg;
    const bg = this.ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1B1C27'); bg.addColorStop(0.45, '#15161E'); bg.addColorStop(1, '#0F1015');
    this.bg = bg;

    // ---- dust in the light shaft (seeded)
    const r = rand(140);
    this.dust = Array.from({ length: 70 }, () => ({ x: 250 + r() * 720, y: 440 + r() * 1340, r: 1.3 + r() * 1.9, p1: r() * TAU, p2: r() * TAU, tw: 0.8 + r() * 1.6 }));

    this.setupMs = performance.now() - t0;
    console.log(`setup ${this.setupMs | 0} ms · strip ${W}×${SH} · roll ${this.t0.toFixed(3)}–${this.tStop.toFixed(3)} s, ${total} px` +
      ` (${NC}×${K} + ${total - NC * K} decel) · final gap ${this.finalGap} px · shrunk ${lay.shrunk}`);
  },

  /** strip top (whole pixels) at time t: the frame index on the 60 fps grid picks a precomputed integer */
  stripTop(t) {
    const n = Math.floor(t * FPS + 1e-6) - N0;
    return this.pos[clamp(n, 0, this.pos.length - 1)];
  },

  frame(t) {
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.setLineDash([]); c.lineDashOffset = 0;
    c.lineCap = 'butt'; c.lineJoin = 'miter'; c.filter = 'none'; c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
    const L = light(t);
    const p = ease.inOutCubic(clamp((t - T_SQ0) / (T_SQ1 - T_SQ0)));

    // ---- surround: dark, with the window's warmth spilling around the frame
    c.fillStyle = this.bg; c.fillRect(0, 0, W, H);
    const rx = lerp(0, WIN.x, p), ry = lerp(0, WIN.y, p), rw = lerp(W, WIN.w, p), rh = lerp(H, WIN.h, p), rr = WIN.r * p;
    if (p > 0) {
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(rx + rw / 2, ry + rh * 0.62, 60, rx + rw / 2, ry + rh * 0.62, 760);
      g.addColorStop(0, rgba(AMB, 0.085 * L * p)); g.addColorStop(1, rgba(AMB, 0));
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 7; i++) { const e = 3 + i * 5; rrPath(c, rx - e, ry - e + 20, rw + 2 * e, rh + 2 * e, rr + e); c.fillStyle = `rgba(0,0,0,${(0.06 * p).toFixed(4)})`; c.fill(); }
    }

    // ---- the live shot under one map: scale z·lerp(1, S1, p) about F, F carried to the window centre
    const z = 1 + 0.04 * t / D, sc = z * lerp(1, S1, p);
    const ox = lerp(FX, WCX, p), oy = lerp(FY, WCY, p);
    c.save();
    rrPath(c, rx, ry, rw, rh, rr); c.clip();
    c.setTransform(sc, 0, 0, sc, ox - FX * sc, oy - FY * sc);
    drawShot(c, t, L, this);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (p > 0) { rrPath(c, rx, ry, rw, rh, rr); c.strokeStyle = `rgba(0,0,0,${(0.3 * p).toFixed(4)})`; c.lineWidth = 12; c.stroke(); }
    c.restore();
    if (p > 0) { rrPath(c, rx, ry, rw, rh, rr); c.strokeStyle = `rgba(243,236,224,${(0.24 * p).toFixed(4)})`; c.lineWidth = 2; c.stroke(); }

    // ---- the credits: blit the strip at a whole-pixel offset, light the mark, mask the band's ends
    const g = this.cctx;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, W, H);
    const top = this.stripTop(t);
    const a = Math.max(CR_TOP, top), b = Math.min(CR_BOT, top + this.strip.height);
    if (b > a) g.drawImage(this.strip, 0, a - top, W, b - a, 0, a, W, b - a);
    const lit = ease.outCubic(clamp((t - T_LIT0) / (T_LIT1 - T_LIT0)));
    if (lit > 0) {
      const m = markGeom(top + this.markTop), [px, py, pw, ph] = m.pane, cx = px + pw / 2, cy = py + ph / 2;
      g.globalCompositeOperation = 'lighter';
      const gl = g.createRadialGradient(cx, cy, 4, cx, cy, 120);
      gl.addColorStop(0, rgba(AMB, 0.3 * lit)); gl.addColorStop(1, rgba(AMB, 0));
      g.fillStyle = gl; g.fillRect(cx - 120, cy - 120, 240, 240);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = rgba(AMB, lit); g.fillRect(px, py, pw, ph);
    }
    g.globalCompositeOperation = 'destination-in';
    g.fillStyle = this.mask; g.fillRect(0, CR_TOP, W, CR_BOT - CR_TOP);
    g.globalCompositeOperation = 'source-over';
  },
});
