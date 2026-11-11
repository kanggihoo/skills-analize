/*
 * 135 · 오늘 저녁 뭐 먹지 — 메신저 대화 장면 · 말풍선 레이아웃 + 스프링 스크롤 + 입력 중 표시
 *
 * A family group chat 「우리집」 (엄마, 아빠, 동생, 나) settles dinner in ten seconds. One script table (THREAD) and one
 * read table (OPENS) drive everything; frame(t) is a pure function of t:
 *   - text layout (setup): measureText line breaking that keeps Korean words together (break at spaces, fall back to
 *     syllables only for a word wider than the bubble, never start a line with closing punctuation); the widest line
 *     + padding is the bubble width, lines × line height + padding its height
 *   - grouping: consecutive messages from one sender in one minute form a group — avatar and name on the first,
 *     tail on the last, corner radii by position; when a message joins, the tail and the timestamp move to it
 *   - content-space list: an item's top is the running sum of gaps and heights; reaction rows grow in place
 *   - scroll(t) = T0 + Σ ΔT_e · s(t − t_e): one closed-form damped-spring step response per layout event
 *   - bubbles scale in from their tail corner (underdamped spring); a typing indicator (three phase-offset dots)
 *     morphs into the real bubble (size interpolation); unread counts tick down as members open the chat;
 *     reaction chips pop; the poll's bars spring to each vote; the climax is a burst of reactions
 * The UI, the family, the avatars, the photo and every icon are drawn here (Canvas 2D, Pretendard, no emoji font).
 */
import { defineDemo, rand, ease, clamp, lerp, smooth } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const W = 1080, H = 1920, D = 10;
const TAU = Math.PI * 2;
const SANS = `"${FONTS.pretendard.family}"`;
const F = (w, s) => `${w} ${s}px ${SANS}`;
let HEADLESS = false;

// ---------------------------------------------------------------- palette: cool light grey, white bubbles, ink, ONE accent (coral = "나")
const BG0 = '#e2e7ef', BG1 = '#c5cedb';
const PANEL = '#eef1f6', SURF = '#ffffff', LINE = '#e1e6ee', CHIP = '#e1e6ee';
const INK = '#1c2233', INK2 = '#596276', INK3 = '#9199ab';
const ACC = '#f0583e', ACC_T = '#ffe3db';
const COOL_T = '#dfe6f0', ROW = '#f1f4f8';
const SKIN = '#f6cfb2', CHEEK = '#ff9c88', FACE = '#ffdca2';

// ---------------------------------------------------------------- the chat card and the list metrics (stage px)
const CX = 44, CY = 118, CW = 992, CH = 1508, CR = 60;
const HEAD_H = 182, FOOT_H = 142;
const VIEW_T = CY + HEAD_H, VIEW_B = CY + CH - FOOT_H, VIEW_H = VIEW_B - VIEW_T;
const AV = 84, AV_X = CX + 28, LEFT_X = AV_X + AV + 16, RIGHT_X = CX + CW - 30;
const FS = 44, LH = 60, PADX = 32, PADY = 22, MAXW = 620;          // body text, line height, bubble padding, max bubble width
const NAME_H = 44, GAP_GROUP = 30, GAP_IN = 8, GAP_DIV = 24, DIV_H = 48, PAD_TOP = 22, PAD_BOT = 26;
const R_BIG = 30, R_SMALL = 8;
const TYPE_W = 132, TYPE_H = 88;
const REACT_H = 36, CHIP_H = 46;
const PHOTO_W = 480, PHOTO_H = 360, PHOTO_PAD = 8;
const POLL_W = 600, POLL_H = 356, ROW_H = 86;

// ---------------------------------------------------------------- springs: closed-form step response of a damped oscillator
// s(τ) = 1 − e^(−ζωτ) (cos ω_d τ + ζω/ω_d · sin ω_d τ), ω = 2πf, ω_d = ω√(1−ζ²); s(0) = 0, s'(0) = 0, s(∞) = 1
function spring(tau, f, z) {
  if (tau <= 0) return 0;
  const w = TAU * f, wd = w * Math.sqrt(1 - z * z), e = Math.exp(-z * w * tau);
  return 1 - e * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
const SCROLL = [1.75, 0.74];   // scroll, morph and in-place growth: settles in ≈ 0.5 s with a 3 % overshoot
const POP = [2.3, 0.55];       // bubble entrance: ≈ 13 % overshoot
const BOUNCE = [3.0, 0.42];    // reaction chips, stamp
const win = (t, a, b, fi, fo) => smooth((t - a) / fi) * (1 - smooth((t - b) / fo));

// ================================================================ the conversation
const PEOPLE = {
  mom: { name: '엄마', tint: '#f1dfe5', shirt: '#a997c7', hair: '#4a332f' },
  dad: { name: '아빠', tint: '#d9e2ef', shirt: '#6f87aa', hair: '#2d2a36' },
  sis: { name: '동생', tint: '#d6eadf', shirt: '#7bb495', hair: '#3c2a27' },
  me: { name: '나', tint: ACC_T, shirt: ACC, hair: '#272431' },
};
const OTHERS = ['mom', 'dad', 'sis'];
const M = (h, m) => h * 60 + m;     // clock minute of a message (timestamps and grouping)
// t = second in the film it is sent; typing = second its typing indicator appears; no t → history (already there)
const THREAD = [
  { div: M(16, 52) },
  { from: 'mom', text: '다들 오늘 몇 시에 와?', at: M(16, 52) },
  { from: 'sis', text: '학원 끝나고 다섯 시 반!', at: M(16, 53) },
  { from: 'me', text: '나는 여섯 시쯤', at: M(16, 55) },
  { div: M(17, 58) },
  { from: 'dad', text: '지금 퇴근!', at: M(17, 58) },
  { from: 'dad', text: '배고프다', at: M(17, 58) },
  { from: 'me', text: '조심히 오세요', at: M(17, 59) },
  { div: M(18, 12), t: 0.55 },
  { from: 'mom', text: '얘들아 오늘 저녁 뭐 먹을래? 일곱 시 전에 정하자', at: M(18, 12), t: 0.55 },
  { from: 'sis', text: '치킨!!', at: M(18, 12), typing: 1.05, t: 1.55 },
  { from: 'sis', text: '치킨치킨치킨치킨치킨치킨치킨치킨!!', at: M(18, 12), t: 1.95 },
  { from: 'dad', text: '또?', at: M(18, 13), typing: 2.28, t: 2.72, react: [['mom', 'laugh', 2.92], ['sis', 'laugh', 3.42]] },
  { from: 'me', photo: true, at: M(18, 13), t: 3.1, react: [['sis', 'heart', 3.36], ['dad', 'heart', 3.74], ['mom', 'heart', 3.86]] },
  { from: 'me', text: '떡볶이 어때?', at: M(18, 13), t: 3.58 },
  { from: 'mom', poll: true, at: M(18, 14), t: 4.02, react: [['sis', 'yum', 5.7], ['dad', 'yum', 5.76]] },
  { from: 'mom', text: '둘 다 시키자', at: M(18, 14), typing: 4.92, t: 5.42, react: [['me', 'heart', 5.58], ['sis', 'heart', 5.66], ['dad', 'heart', 5.74]] },
  { from: 'dad', typing: 7.7, at: M(18, 15) },          // the last beat: 아빠 is typing again (never sent)
];
const VOTES = [['sis', 0, 4.32], ['me', 1, 4.48], ['dad', 0, 4.66], ['mom', 1, 4.82]];
const OPTS = ['치킨', '떡볶이'];
const T_BOTH = 5.56;                                   // "둘 다" — both options win: the climax
// moments a member opens the chat without writing (typing, sending, voting and reacting also count as reading)
const OPENS = { sis: [0.95, 3.28, 4.24, 5.6], dad: [2.2, 3.66, 4.62, 5.68], mom: [1.8, 2.86, 3.8] };
// 나 at the keyboard: the photo is attached, then a line is typed into the field, each followed by a press on send
const ATTACH = [2.86, 3.08], TYPED = { text: '떡볶이 어때?', a: 3.27, b: 3.5 }, PRESS = [3.08, 3.56];

const clockLabel = (m) => `오후 ${Math.floor(m / 60) - 12}:${String(m % 60).padStart(2, '0')}`;

// ================================================================ text layout (setup, after the font is loaded)
const NO_START = /^[!?.,…~)\]}」』]/;                 // closing punctuation never starts a line (금칙)
/** Greedy line breaking: words (어절) stay whole; a word wider than the line breaks between syllables. */
function wrapLines(g, text, maxW) {
  const wid = (s) => g.measureText(s).width;
  const out = [];
  let line = '';
  for (const word of text.split(' ')) {
    const cand = line ? `${line} ${word}` : word;
    if (wid(cand) <= maxW) { line = cand; continue; }
    if (line) { out.push(line); line = ''; }
    if (wid(word) <= maxW) { line = word; continue; }
    for (const ch of Array.from(word)) {                 // fallback: one syllable at a time
      if (wid(line + ch) <= maxW) { line += ch; continue; }
      if (NO_START.test(ch) && Array.from(line).length > 1) {   // carry the last syllable down with the mark
        const cs = Array.from(line), last = cs.pop();
        out.push(cs.join('')); line = last + ch;
      } else { out.push(line); line = ch; }
    }
  }
  if (line) out.push(line);
  return out;
}

let MID = 0.36;   // (ascent − descent)/2 of Hangul per px of font size: baseline = centre + MID·size
const baseY = (cy, size) => cy + MID * size;

// ================================================================ items, groups, reads, layout events (setup)
let ITEMS = [], STEPS = [], T0 = 0, BURST_AT = [540, 1200];

function buildItems(g) {
  g.font = F(500, FS);
  const items = [];
  let prev = null;
  for (const src of THREAD) {
    const it = { ...src };
    it.tIn = src.typing ?? src.t ?? -10;
    it.tMsg = src.typing !== undefined ? (src.t ?? Infinity) : it.tIn;
    if (src.div !== undefined) {
      it.kind = 'div'; it.label = clockLabel(src.div);
    } else {
      it.kind = src.photo ? 'photo' : src.poll ? 'poll' : src.text ? 'text' : 'typing';
      it.side = src.from === 'me' ? 1 : 0;
      it.first = !(prev && prev.kind !== 'div' && prev.from === src.from && prev.at === src.at);
      it.showName = it.side === 0 && it.first;
      if (it.kind === 'text') {
        it.lines = wrapLines(g, src.text, MAXW - 2 * PADX);
        const lw = Math.max(...it.lines.map((s) => g.measureText(s).width));
        it.bw = Math.max(Math.ceil(lw) + 2 * PADX, 2 * PADX + 40);
        it.bh = it.lines.length * LH + 2 * PADY;
      } else if (it.kind === 'photo') { it.bw = PHOTO_W + 2 * PHOTO_PAD; it.bh = PHOTO_H + 2 * PHOTO_PAD; }
      else if (it.kind === 'poll') { it.bw = POLL_W; it.bh = POLL_H; }
      else { it.bw = TYPE_W; it.bh = TYPE_H; }
      // reactions → one chip per icon, in order of first appearance
      it.chips = [];
      for (const [who, icon, at] of src.react || []) {
        let c = it.chips.find((k) => k.icon === icon);
        if (!c) it.chips.push(c = { icon, times: [] });
        c.times.push(at);
      }
      it.tReact = it.chips.length ? Math.min(...it.chips.map((c) => c.times[0])) : undefined;
    }
    it.gap = !prev ? PAD_TOP : (it.kind === 'div' || prev.kind === 'div') ? GAP_DIV : it.first ? GAP_GROUP : GAP_IN;
    items.push(it); prev = it;
  }
  // tail and timestamp belong to the last message of a group: both move on when the next one in the group is sent
  for (let i = 0; i < items.length; i++) {
    const it = items[i], nx = items[i + 1];
    it.lastUntil = nx && nx.kind !== 'div' && nx.kind !== 'typing' && !nx.first ? nx.tMsg : Infinity;
  }
  // unread: members (other than the sender and 나, who reads at once) who have not opened the chat since it was sent
  const acts = { mom: [...OPENS.mom], dad: [...OPENS.dad], sis: [...OPENS.sis] };
  for (const it of items) {
    if (it.kind === 'div') continue;
    if (it.tIn >= 0 && acts[it.from]) acts[it.from].push(it.tIn, it.tMsg);
    for (const [who, , at] of it.react || []) if (acts[who]) acts[who].push(at);
  }
  for (const [who, , at] of VOTES) if (acts[who]) acts[who].push(at);
  for (const it of items) {
    it.readAts = []; it.unreadN = 0;
    if (it.kind === 'div' || it.kind === 'typing' || it.tMsg < 0) continue;
    const readers = OTHERS.filter((m) => m !== it.from);
    it.unreadN = readers.length;
    it.readAts = readers.map((m) => Math.min(...acts[m].filter((a) => a >= it.tMsg), Infinity)).sort((a, b) => a - b);
  }
  return items;
}

/** Item height in content space. settled: reaction rows at full height (for scroll targets), else spring-grown. */
function itemH(it, t, settled) {
  if (it.kind === 'div') return DIV_H;
  let h = (it.showName ? NAME_H : 0) + (t < it.tMsg ? TYPE_H : it.bh);
  if (it.tReact !== undefined && t >= it.tReact) h += REACT_H * (settled ? 1 : spring(t - it.tReact, ...SCROLL));
  return h;
}
function contentH(t, settled) {
  let y = 0;
  for (const it of ITEMS) { if (t < it.tIn) break; y += it.gap + itemH(it, t, settled); }
  return y + PAD_BOT;
}
/** One scroll step per layout event: ΔT_e = target after the event − target before it (target = content − viewport). */
function buildSteps() {
  const ev = new Set();
  for (const it of ITEMS) {
    if (it.tIn >= 0) ev.add(it.tIn);
    if (Number.isFinite(it.tMsg) && it.tMsg >= 0) ev.add(it.tMsg);
    if (it.tReact !== undefined) ev.add(it.tReact);
  }
  const target = (t) => Math.max(0, contentH(t, true) - VIEW_H);
  T0 = target(-1);
  let prev = T0;
  STEPS = [...ev].sort((a, b) => a - b).map((te) => { const T = target(te), d = T - prev; prev = T; return [te, d]; });
}
const scrollAt = (t) => STEPS.reduce((s, [te, d]) => s + d * spring(t - te, ...SCROLL), T0);

/** Screen tops of every item that exists at t (content y − scroll). */
function layoutAt(t) {
  const sc = scrollAt(t), out = [];
  let y = 0;
  for (const it of ITEMS) {
    if (t < it.tIn) break;
    y += it.gap;
    const h = itemH(it, t, false);
    out.push({ it, y: VIEW_T + y - sc, h });
    y += h;
  }
  return out;
}

/** Bubble rectangle, radii and tails of a message item at t (screen space, before the entrance scale). */
function bubbleGeom(it, top, t) {
  const by = top + (it.showName ? NAME_H : 0);
  const morphs = it.tMsg !== it.tIn;
  const m = !morphs ? 1 : t < it.tMsg ? 0 : spring(t - it.tMsg, ...SCROLL);   // typing → message size
  const bw = lerp(TYPE_W, it.bw, morphs ? m : 1), bh = lerp(TYPE_H, it.bh, morphs ? m : 1);
  const bx = it.side ? RIGHT_X - bw : LEFT_X;
  const p = clamp(m);
  const last = t < it.tMsg ? 0 : p * (1 - smooth((t - it.lastUntil) / 0.22));
  let tl, tr, br, bl;
  if (it.side === 0) { tl = it.first ? R_BIG : R_SMALL; tr = R_BIG; br = R_BIG; bl = R_SMALL; }
  else { tl = R_BIG; tr = it.first ? R_BIG : R_SMALL; br = R_SMALL; bl = R_BIG; }
  const pill = TYPE_H / 2, cap = bh / 2;
  [tl, tr, br, bl] = [tl, tr, br, bl].map((r) => Math.min(cap, lerp(pill, r, p)));
  return { bx, by, bw, bh, tl, tr, br, bl, kL: it.side ? 0 : last, kR: it.side ? last : 0, m, p };
}

// ================================================================ bubble path: per-corner radii + a tail on a bottom corner
// A bottom corner is two cubics in local (u along the bottom edge into the bubble, v up the side). k = 0: a 90° arc
// of radius r (two 45° pieces, handle 0.2652 r); k = 1: the tail flick. Every control point interpolates with k.
const KH = 0.2652, A7 = Math.SQRT1_2;
const TAIL = [[24, 0], [12, 0], [3, -3], [-13, -5], [-5, -1], [0, 9], [0, 26]];
function bottomCorner(g, ox, oy, sx, r, k, reverse) {
  const L = KH * r, m = r * (1 - A7);
  const arc = [[r, 0], [r - L, 0], [m + L * A7, m - L * A7], [m, m], [m - L * A7, m + L * A7], [0, r - L], [0, r]];
  const P = arc.map((a, i) => [ox + sx * lerp(a[0], TAIL[i][0], k), oy - lerp(a[1], TAIL[i][1], k)]);
  if (reverse) P.reverse();
  g.lineTo(P[0][0], P[0][1]);
  g.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]);
  g.bezierCurveTo(P[4][0], P[4][1], P[5][0], P[5][1], P[6][0], P[6][1]);
}
function bubblePath(g, b, dy = 0) {
  const { bx: x, bw: w, bh: h, tl, tr, br, bl, kL, kR } = b, y = b.by + dy;
  g.beginPath();
  g.moveTo(x + tl, y);
  g.lineTo(x + w - tr, y);
  g.arcTo(x + w, y, x + w, y + tr, tr);
  bottomCorner(g, x + w, y + h, -1, br, kR, true);
  bottomCorner(g, x, y + h, 1, bl, kL, false);
  g.lineTo(x, y + tl);
  g.arcTo(x, y, x + tl, y, tl);
  g.closePath();
}
function fillBubble(g, b, color) {
  g.fillStyle = 'rgba(38,50,84,0.07)'; bubblePath(g, b, 5); g.fill();
  g.fillStyle = 'rgba(38,50,84,0.05)'; bubblePath(g, b, 2); g.fill();
  g.fillStyle = color; bubblePath(g, b); g.fill();
}
function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// ================================================================ drawn icons
function heartPath(g, x, y, s) {
  const k = s / 2;
  g.beginPath();
  g.moveTo(x, y + 0.86 * k);
  g.bezierCurveTo(x - 0.35 * k, y + 0.55 * k, x - 1.05 * k, y + 0.12 * k, x - 0.98 * k, y - 0.38 * k);
  g.bezierCurveTo(x - 0.9 * k, y - 0.95 * k, x - 0.2 * k, y - 1.0 * k, x, y - 0.5 * k);
  g.bezierCurveTo(x + 0.2 * k, y - 1.0 * k, x + 0.9 * k, y - 0.95 * k, x + 0.98 * k, y - 0.38 * k);
  g.bezierCurveTo(x + 1.05 * k, y + 0.12 * k, x + 0.35 * k, y + 0.55 * k, x, y + 0.86 * k);
  g.closePath();
}
function drawIcon(g, icon, x, y, s) {
  if (icon === 'heart') {
    g.fillStyle = ACC; heartPath(g, x, y + s * 0.03, s * 0.94); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.beginPath(); g.ellipse(x - s * 0.22, y - s * 0.17, s * 0.09, s * 0.055, -0.7, 0, TAU); g.fill();
    return;
  }
  const r = s * 0.47;
  g.fillStyle = FACE; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.fillStyle = 'rgba(232,160,80,0.35)'; g.beginPath(); g.arc(x, y + r * 0.08, r * 0.96, 0.15 * Math.PI, 0.85 * Math.PI); g.fill();
  g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = Math.max(1.5, s * 0.075); g.lineCap = 'round'; g.lineJoin = 'round';
  if (icon === 'laugh') {
    for (const sx of [-1, 1]) {
      g.beginPath(); g.moveTo(x + sx * r * 0.58, y - r * 0.12); g.lineTo(x + sx * r * 0.36, y - r * 0.34); g.lineTo(x + sx * r * 0.14, y - r * 0.12); g.stroke();
    }
    g.beginPath(); g.moveTo(x - r * 0.52, y + r * 0.08);
    g.quadraticCurveTo(x, y + r * 0.14, x + r * 0.52, y + r * 0.08);
    g.quadraticCurveTo(x + r * 0.44, y + r * 0.7, x, y + r * 0.7);
    g.quadraticCurveTo(x - r * 0.44, y + r * 0.7, x - r * 0.52, y + r * 0.08);
    g.fill();
    g.fillStyle = ACC; g.beginPath(); g.ellipse(x, y + r * 0.53, r * 0.24, r * 0.13, 0, 0, TAU); g.fill();
  } else {   // yum: a wink and the tongue out
    g.beginPath(); g.arc(x - r * 0.34, y - r * 0.2, r * 0.11, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(x + r * 0.14, y - r * 0.18); g.quadraticCurveTo(x + r * 0.33, y - r * 0.36, x + r * 0.52, y - r * 0.18); g.stroke();
    g.fillStyle = ACC; g.beginPath(); g.ellipse(x + r * 0.18, y + r * 0.42, r * 0.17, r * 0.22, -0.35, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(x - r * 0.46, y + r * 0.18); g.quadraticCurveTo(x, y + r * 0.5, x + r * 0.46, y + r * 0.18); g.stroke();
  }
  g.fillStyle = 'rgba(255,128,100,0.45)';
  g.beginPath(); g.ellipse(x - r * 0.6, y + r * 0.22, r * 0.14, r * 0.09, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(x + r * 0.6, y + r * 0.22, r * 0.14, r * 0.09, 0, 0, TAU); g.fill();
}

// ================================================================ baked art (setup)
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}

function paintAvatar(g, who, S) {
  const P = PEOPLE[who], c = S / 2, u = (v) => v * S;
  g.save();
  g.beginPath(); g.arc(c, c, c, 0, TAU); g.fillStyle = P.tint; g.fill(); g.clip();
  // soft light from the top left
  const lg = g.createRadialGradient(u(0.3), u(0.2), 0, u(0.3), u(0.2), u(0.8));
  lg.addColorStop(0, 'rgba(255,255,255,0.55)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = lg; g.fillRect(0, 0, S, S);
  g.fillStyle = P.hair;
  if (who === 'sis') {                                     // two buns
    for (const sx of [0.29, 0.71]) { g.beginPath(); g.arc(u(sx), u(0.23), u(0.09), 0, TAU); g.fill(); }
  }
  if (who === 'mom') {                                     // bob, behind the face
    g.beginPath(); g.ellipse(c, u(0.46), u(0.275), u(0.285), 0, Math.PI, TAU);
    g.lineTo(u(0.775), u(0.66)); g.quadraticCurveTo(u(0.775), u(0.71), u(0.72), u(0.71));
    g.lineTo(u(0.28), u(0.71)); g.quadraticCurveTo(u(0.225), u(0.71), u(0.225), u(0.66)); g.closePath(); g.fill();
  }
  if (who === 'sis') { g.beginPath(); g.ellipse(c, u(0.46), u(0.25), u(0.26), 0, 0, TAU); g.fill(); }
  // shoulders and neck
  g.fillStyle = P.shirt; g.beginPath(); g.ellipse(c, u(1.0), u(0.4), u(0.27), 0, 0, TAU); g.fill();
  g.fillStyle = '#e8b592'; g.fillRect(c - u(0.07), u(0.6), u(0.14), u(0.16));
  if (who === 'dad') {                                     // collar
    g.fillStyle = '#fff';
    g.beginPath(); g.moveTo(c - u(0.12), u(0.73)); g.lineTo(c, u(0.81)); g.lineTo(c - u(0.04), u(0.86)); g.lineTo(c - u(0.15), u(0.77)); g.fill();
    g.beginPath(); g.moveTo(c + u(0.12), u(0.73)); g.lineTo(c, u(0.81)); g.lineTo(c + u(0.04), u(0.86)); g.lineTo(c + u(0.15), u(0.77)); g.fill();
  }
  // ears + face
  g.fillStyle = SKIN;
  for (const sx of [0.285, 0.715]) { g.beginPath(); g.arc(u(sx), u(0.5), u(0.042), 0, TAU); g.fill(); }
  g.beginPath(); g.ellipse(c, u(0.47), u(0.215), u(0.235), 0, 0, TAU); g.fill();
  // hair in front
  g.fillStyle = P.hair;
  g.beginPath();
  if (who === 'mom') {
    g.moveTo(u(0.265), u(0.5)); g.bezierCurveTo(u(0.25), u(0.2), u(0.64), u(0.13), u(0.75), u(0.36));
    g.lineTo(u(0.75), u(0.56)); g.bezierCurveTo(u(0.69), u(0.4), u(0.52), u(0.31), u(0.41), u(0.35));
    g.bezierCurveTo(u(0.34), u(0.38), u(0.3), u(0.44), u(0.265), u(0.5));
  } else if (who === 'dad') {
    g.moveTo(u(0.282), u(0.47)); g.bezierCurveTo(u(0.27), u(0.17), u(0.73), u(0.17), u(0.718), u(0.47));
    g.bezierCurveTo(u(0.69), u(0.37), u(0.62), u(0.33), u(0.52), u(0.335));
    g.bezierCurveTo(u(0.42), u(0.33), u(0.31), u(0.37), u(0.282), u(0.47));
  } else if (who === 'sis') {
    g.moveTo(u(0.285), u(0.47)); g.bezierCurveTo(u(0.27), u(0.17), u(0.73), u(0.17), u(0.715), u(0.47));
    g.lineTo(u(0.69), u(0.4)); g.quadraticCurveTo(u(0.5), u(0.36), u(0.31), u(0.4)); g.closePath();
  } else {
    g.moveTo(u(0.28), u(0.48)); g.bezierCurveTo(u(0.26), u(0.15), u(0.74), u(0.15), u(0.72), u(0.48));
    g.lineTo(u(0.67), u(0.37)); g.lineTo(u(0.61), u(0.42)); g.lineTo(u(0.55), u(0.35)); g.lineTo(u(0.48), u(0.41));
    g.lineTo(u(0.42), u(0.35)); g.lineTo(u(0.35), u(0.41)); g.closePath();
  }
  g.fill();
  // face
  const eyeR = who === 'sis' ? 0.03 : 0.024;
  g.fillStyle = INK;
  for (const sx of [0.415, 0.585]) { g.beginPath(); g.arc(u(sx), u(0.5), u(eyeR), 0, TAU); g.fill(); }
  if (who === 'sis') {
    g.fillStyle = '#fff';
    for (const sx of [0.425, 0.595]) { g.beginPath(); g.arc(u(sx), u(0.49), u(0.01), 0, TAU); g.fill(); }
  }
  g.fillStyle = CHEEK; g.globalAlpha = 0.5;
  for (const sx of [0.36, 0.64]) { g.beginPath(); g.ellipse(u(sx), u(0.575), u(0.042), u(0.026), 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  g.strokeStyle = INK; g.lineWidth = u(0.017); g.lineCap = 'round';
  g.beginPath(); g.arc(c, u(0.55), u(0.05), 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  if (who === 'dad') {                                     // round glasses
    g.lineWidth = u(0.016);
    for (const sx of [0.41, 0.59]) { g.beginPath(); g.arc(u(sx), u(0.5), u(0.068), 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(u(0.478), u(0.495)); g.quadraticCurveTo(c, u(0.48), u(0.522), u(0.495)); g.stroke();
  }
  g.restore();
}

// The photo 나 sends: 떡볶이 in a shallow pan on a linen cloth (480 × 360 units, baked at 2×).
function paintPhoto(g) {
  const r = rand(135);
  const tg = g.createLinearGradient(0, 0, 480, 360);
  tg.addColorStop(0, '#f7eee3'); tg.addColorStop(1, '#e3d2bf');
  g.fillStyle = tg; g.fillRect(0, 0, 480, 360);
  g.fillStyle = 'rgba(206,170,138,0.2)';                   // linen checks
  for (let x = -14; x < 480; x += 68) g.fillRect(x, 0, 20, 360);
  for (let y = -30; y < 360; y += 68) g.fillRect(0, y, 480, 20);
  const ell = (x, y, rx, ry, a = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); };
  // chopsticks under the pan's edge
  g.save(); g.translate(64, 300); g.rotate(-0.42);
  for (const dy of [0, 16]) {
    g.fillStyle = 'rgba(90,50,30,0.18)'; rrect(g, -10, dy + 7, 250, 9, 4.5); g.fill();
    g.fillStyle = '#d9b98f'; rrect(g, -10, dy, 250, 9, 4.5); g.fill();
    g.fillStyle = '#b48d62'; rrect(g, 170, dy, 70, 9, 4.5); g.fill();
  }
  g.restore();
  // soft contact shadow (a radial gradient squashed into an ellipse)
  g.save(); g.translate(250, 226); g.scale(1, 0.66);
  const sg = g.createRadialGradient(0, 0, 120, 0, 0, 236);
  sg.addColorStop(0, 'rgba(80,38,18,0.42)'); sg.addColorStop(1, 'rgba(80,38,18,0)');
  g.fillStyle = sg; g.beginPath(); g.arc(0, 0, 236, 0, TAU); g.fill();
  g.restore();
  // pan: handles, body, inner wall, sauce
  g.fillStyle = '#2b2730';
  rrect(g, 30, 178, 46, 26, 12); g.fill(); rrect(g, 420, 178, 46, 26, 12); g.fill();
  g.fillStyle = '#2f2b34'; ell(248, 198, 198, 138); g.fill();
  g.strokeStyle = '#625c69'; g.lineWidth = 3; ell(248, 194, 194, 133); g.stroke();
  g.fillStyle = '#3c3742'; ell(248, 196, 182, 124); g.fill();
  const sauce = g.createRadialGradient(222, 170, 10, 248, 204, 190);
  sauce.addColorStop(0, '#ef5a33'); sauce.addColorStop(0.7, '#d23f22'); sauce.addColorStop(1, '#a52c18');
  g.fillStyle = sauce; ell(248, 204, 172, 112); g.fill();
  g.save(); ell(248, 204, 172, 112); g.clip();
  // ingredients: pieces on a jittered grid inside the pan, painted back to front
  const pieces = [];
  for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 6; gx++) {
    const x = 104 + gx * 56 + (r() - 0.5) * 26, y = 118 + gy * 42 + (r() - 0.5) * 16;
    const dx = (x - 248) / 160, dy = (y - 204) / 100;
    if (dx * dx + dy * dy > 1) continue;
    const egg = x > 290 && y < 190;
    pieces.push({ x, y, a: (r() - 0.5) * 1.6, kind: egg ? 'skip' : r() < 0.2 ? 'eomuk' : 'tteok', l: 56 + r() * 18 });
  }
  pieces.sort((p, q) => p.y - q.y);
  for (const p of pieces) {
    if (p.kind === 'skip') continue;
    g.save(); g.translate(p.x, p.y); g.rotate(p.a);
    if (p.kind === 'tteok') {
      const L = p.l, T = 25;                                 // a sauce-coated rice cake
      g.fillStyle = 'rgba(105,22,10,0.5)'; rrect(g, -L / 2, -T / 2 + 5, L, T, T / 2); g.fill();
      const tb = g.createLinearGradient(0, -T / 2, 0, T / 2);
      tb.addColorStop(0, '#ff9d78'); tb.addColorStop(0.45, '#ec5b37'); tb.addColorStop(1, '#bf3a1c');
      g.fillStyle = tb; rrect(g, -L / 2, -T / 2, L, T, T / 2); g.fill();
      g.fillStyle = 'rgba(255,214,190,0.55)'; rrect(g, -L / 2 + 3, -T / 2 + 2, 9, T - 6, 4.5); g.fill();
      g.fillStyle = 'rgba(255,224,204,0.85)'; rrect(g, -L / 2 + 13, -T / 2 + 4, L - 30, 5, 2.5); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(L / 2 - 12, -T / 2 + 6.5, 2.2, 0, TAU); g.fill();
    } else {
      g.fillStyle = 'rgba(105,22,10,0.4)'; rrect(g, -30, -14, 60, 34, 6); g.fill();
      g.fillStyle = '#eab46d'; g.beginPath();
      g.moveTo(-30, -18);
      for (let i = 0; i <= 6; i++) g.lineTo(-30 + i * 10, -18 + (i % 2 ? -3 : 0));
      g.lineTo(30, 14); g.lineTo(-30, 14); g.closePath(); g.fill();
      g.fillStyle = 'rgba(214,72,36,0.45)'; g.fillRect(-30, 2, 60, 12);
      g.strokeStyle = '#c98a44'; g.lineWidth = 2; g.beginPath(); g.moveTo(-26, -6); g.lineTo(26, -6); g.stroke();
    }
    g.restore();
  }
  // two egg halves (top right)
  for (const [x, y, a] of [[318, 150, -0.3], [372, 176, 0.25]]) {
    g.fillStyle = 'rgba(105,22,10,0.4)'; ell(x, y + 6, 34, 25, a); g.fill();
    g.fillStyle = '#fbf6ee'; ell(x, y, 34, 25, a); g.fill();
    g.fillStyle = '#ffbd38'; ell(x + 2, y + 1, 15, 13, a); g.fill();
    g.fillStyle = '#ffd76f'; ell(x - 2, y - 2, 7, 5, a); g.fill();
  }
  // green onion rings, sesame, gloss
  for (let i = 0; i < 18; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 0.86, x = 248 + Math.cos(a) * 160 * d, y = 204 + Math.sin(a) * 100 * d, s = 5 + r() * 4;
    g.fillStyle = '#c9e8a8'; ell(x, y, s, s * 0.8); g.fill();
    g.strokeStyle = '#4f9d50'; g.lineWidth = 3; ell(x, y, s, s * 0.8); g.stroke();
  }
  g.fillStyle = '#fff3d8';
  for (let i = 0; i < 46; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 0.9;
    ell(248 + Math.cos(a) * 166 * d, 204 + Math.sin(a) * 106 * d, 2.4, 1.3, r() * 3); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 14; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 0.85;
    ell(248 + Math.cos(a) * 160 * d, 204 + Math.sin(a) * 100 * d, 4 + r() * 4, 2 + r() * 1.5, -0.4); g.fill();
  }
  g.restore();
  // steam
  g.lineCap = 'round';
  for (const [x0, ph] of [[190, 0], [252, 1.8], [314, 3.1]]) {
    for (const [lw, al] of [[16, 0.12], [8, 0.22]]) {
      g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = lw;
      g.beginPath();
      for (let k = 0; k <= 20; k++) { const v = k / 20, y = 120 - v * 100, x = x0 + 12 * Math.sin(v * 5 + ph); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
  }
  // photo light: warm key from the top left, a gentle vignette
  const kl = g.createRadialGradient(80, 40, 0, 80, 40, 420);
  kl.addColorStop(0, 'rgba(255,248,232,0.35)'); kl.addColorStop(1, 'rgba(255,248,232,0)');
  g.fillStyle = kl; g.fillRect(0, 0, 480, 360);
  const vg = g.createRadialGradient(240, 180, 150, 240, 180, 330);
  vg.addColorStop(0, 'rgba(60,30,20,0)'); vg.addColorStop(1, 'rgba(60,30,20,0.22)');
  g.fillStyle = vg; g.fillRect(0, 0, 480, 360);
}

// poll option icons (100 × 100 units)
function paintDrumstick(g) {
  g.save(); g.translate(50, 50); g.rotate(Math.PI / 4);   // local x runs from the meat to the bone
  g.fillStyle = '#efe0c4'; rrect(g, 6, -6, 40, 12, 6); g.fill();
  for (const y of [-7.5, 7.5]) { g.beginPath(); g.arc(46, y, 8.5, 0, TAU); g.fill(); }
  g.fillStyle = '#fdf6ea'; rrect(g, 8, -4.5, 34, 5, 2.5); g.fill();
  for (const y of [-9, 6]) { g.beginPath(); g.arc(47, y, 4, 0, TAU); g.fill(); }
  const a0 = 62 * Math.PI / 180;
  const meat = () => {
    g.beginPath(); g.arc(-18, 0, 25, a0, TAU - a0);
    g.quadraticCurveTo(0, -18, 14, -7); g.lineTo(14, 7); g.quadraticCurveTo(0, 18, -18 + 25 * Math.cos(a0), 25 * Math.sin(a0));
    g.closePath();
  };
  g.fillStyle = '#b8611f'; meat(); g.fill();
  g.save(); meat(); g.clip();
  g.fillStyle = '#de8c3a'; g.beginPath(); g.ellipse(-14, -4, 32, 20, 0, 0, TAU); g.fill();
  g.fillStyle = '#f0b061'; g.beginPath(); g.ellipse(-22, -11, 13, 7, -0.2, 0, TAU); g.fill();
  g.fillStyle = '#c06a24';
  for (const [x, y, r] of [[-30, 8, 3], [-14, 12, 3.2], [0, 5, 2.6], [-20, -1, 2.2], [-6, -8, 2.4], [-36, -6, 2.2], [6, -3, 2]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.restore();
  g.restore();
}
function paintSkewer(g) {
  g.strokeStyle = '#c9a06b'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(14, 88); g.lineTo(88, 14); g.stroke();
  for (const k of [0.3, 0.52, 0.74]) {
    const x = lerp(14, 88, k), y = lerp(88, 14, k);
    g.save(); g.translate(x, y); g.rotate(Math.PI / 4);
    g.fillStyle = '#b8321d'; rrect(g, -15, -11, 30, 24, 11); g.fill();
    g.fillStyle = '#e4512f'; rrect(g, -15, -13, 30, 24, 11); g.fill();
    g.fillStyle = 'rgba(255,190,160,0.8)'; rrect(g, -9, -9, 16, 5, 2.5); g.fill();
    g.restore();
  }
}

function bake() {
  const bg = mk(W, H);
  const lg = bg.g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, BG0); lg.addColorStop(1, BG1);
  bg.g.fillStyle = lg; bg.g.fillRect(0, 0, W, H);
  const kl = bg.g.createRadialGradient(180, 220, 0, 180, 220, 1100);
  kl.addColorStop(0, 'rgba(255,255,255,0.7)'); kl.addColorStop(1, 'rgba(255,255,255,0)');
  bg.g.fillStyle = kl; bg.g.fillRect(0, 0, W, H);

  const dot = mk(256, 256);                                 // soft round sprite (blobs, bokeh, glow)
  const dg = dot.g.createRadialGradient(128, 128, 0, 128, 128, 128);
  dg.addColorStop(0, 'rgba(255,255,255,1)'); dg.addColorStop(0.45, 'rgba(255,255,255,0.55)'); dg.addColorStop(1, 'rgba(255,255,255,0)');
  dot.g.fillStyle = dg; dot.g.fillRect(0, 0, 256, 256);
  const cool = mk(256, 256);                                // cool shade blob (depth in the backdrop)
  const cg = cool.g.createRadialGradient(128, 128, 0, 128, 128, 128);
  cg.addColorStop(0, 'rgba(160,174,200,0.5)'); cg.addColorStop(1, 'rgba(160,174,200,0)');
  cool.g.fillStyle = cg; cool.g.fillRect(0, 0, 256, 256);

  const shadow = mk(W, H);                                  // the card's soft drop shadow
  shadow.g.filter = 'blur(34px)';
  shadow.g.fillStyle = 'rgba(42,54,86,0.30)'; rrect(shadow.g, CX + 16, CY + 40, CW - 32, CH - 10, CR); shadow.g.fill();
  shadow.g.filter = 'none';
  shadow.g.fillStyle = 'rgba(42,54,86,0.08)'; rrect(shadow.g, CX - 1, CY + 3, CW + 2, CH + 2, CR + 1); shadow.g.fill();

  const avatars = {};
  for (const who of Object.keys(PEOPLE)) { const a = mk(192, 192); paintAvatar(a.g, who, 192); avatars[who] = a.c; }
  const photo = mk(PHOTO_W * 2, PHOTO_H * 2); photo.g.scale(2, 2); paintPhoto(photo.g);
  const drum = mk(112, 112); drum.g.scale(1.12, 1.12); paintDrumstick(drum.g);
  const skew = mk(112, 112); skew.g.scale(1.12, 1.12); paintSkewer(skew.g);
  return { bg: bg.c, dot: dot.c, cool: cool.c, shadow: shadow.c, avatars, photo: photo.c, optIcons: [drum.c, skew.c] };
}

// ================================================================ scene constants made with rand()
const BLOBS = (() => { const r = rand(21); return Array.from({ length: 6 }, (_, i) => ({ x: r() * W, y: 200 + r() * 1500, s: 360 + r() * 380, a: 0.35 + r() * 0.3, cool: i % 2 === 1, ph: r() * TAU })); })();
const BOKEH = (() => { const r = rand(33); return Array.from({ length: 6 }, (_, i) => ({ x: i % 2 ? 1000 + r() * 160 : -80 + r() * 160, y: 260 + r() * 1300, s: 70 + r() * 90, a: 0.16 + r() * 0.14, ph: r() * TAU })); })();
const BURST = (() => {
  const r = rand(77), n = 18;
  return Array.from({ length: n }, (_, i) => {
    const depth = r();                                       // 0 far … 1 near: nearer icons are bigger and faster
    // a fan to the open right side of the thread (the poll sits right above the bubble); buoyancy then lifts them
    const a = lerp(-0.45, 0.36, (i + r()) / n), v = lerp(1700, 3200, depth) * lerp(0.85, 1.1, r());
    return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, d: r() * 0.12, life: lerp(1.6, 2.6, r()), s: lerp(40, 104, depth), depth,
      icon: ['heart', 'heart', 'laugh', 'yum', 'heart'][Math.floor(r() * 5)], spin: lerp(-1.4, 1.4, r()), ph: r() * TAU };
  }).sort((p, q) => p.depth - q.depth);
})();

// ================================================================ drawing: list items
function drawAvatar(g, A, who, x, y, s) { g.drawImage(A[who], x, y, s, s); }

/** a small number that rolls: the old value slides up and out, the new one in from below (clipped to the pill) */
function rollNumber(g, prev, cur, p, cx, cy, size, color, clipW, clipH) {
  const a0 = g.globalAlpha;
  g.save();
  rrect(g, cx - clipW / 2, cy - clipH / 2, clipW, clipH, clipH / 2); g.clip();
  g.fillStyle = color; g.textAlign = 'center';
  const bl = baseY(cy, size), d = clipH * 0.8;
  if (p < 1 && prev !== null) { g.globalAlpha = a0 * (1 - p); g.fillText(String(prev), cx, bl - d * ease.outCubic(p)); }
  if (cur !== null) { g.globalAlpha = a0 * (p < 1 && prev !== null ? p : 1); g.fillText(String(cur), cx, bl + (prev !== null ? d * (1 - ease.outCubic(p)) : 0)); }
  g.restore();
}

function unreadAt(it, t) {
  let k = 0;
  while (k < it.readAts.length && it.readAts[k] <= t) k++;
  return { cur: it.unreadN - k, tc: k ? it.readAts[k - 1] : -Infinity };
}

function drawBadge(g, it, t, x, cy, right, alpha) {
  if (!it.unreadN || alpha <= 0) return;
  const { cur, tc } = unreadAt(it, t);
  const p = clamp((t - tc) / 0.28);
  if (cur === 0 && p >= 1) return;
  const w = 38, h = 32, cx = right ? x - w / 2 : x + w / 2;
  const sc = cur === 0 ? 1 - ease.inCubic(clamp((p - 0.35) / 0.65)) : 1 + 0.16 * Math.sin(Math.PI * p);
  g.save(); g.globalAlpha = alpha;
  g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  g.fillStyle = ACC_T; rrect(g, cx - w / 2, cy - h / 2, w, h, h / 2); g.fill();
  g.font = F(800, 23);
  rollNumber(g, p < 1 ? cur + 1 : null, cur > 0 ? cur : null, p, cx, cy, 23, ACC, w, h);
  g.restore();
}

/** reaction chips under a bubble; returns nothing (they sit inside the reaction row the slot grew for them) */
function drawChips(g, it, t, b, alpha) {
  if (!it.chips.length || t < it.tReact) return;
  g.font = F(700, 24);
  let x = it.side ? b.bx + b.bw - 22 : b.bx + 22;
  const y = b.by + b.bh - 12;
  for (const c of it.chips) {
    if (t < c.times[0]) continue;
    let n = 0; while (n < c.times.length && c.times[n] <= t) n++;
    const tl = c.times[n - 1], p = clamp((t - tl) / 0.22);
    const w = 86, cx = it.side ? x - w / 2 : x + w / 2, cy = y + CHIP_H / 2;
    const pop = spring(t - c.times[0], ...BOUNCE);
    const bump = n > 1 && p < 1 ? 0.2 * Math.sin(Math.PI * p) : 0;
    const s = pop + bump;
    g.save(); g.globalAlpha = alpha * clamp((t - c.times[0]) / 0.06);
    g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy);
    g.fillStyle = 'rgba(38,50,84,0.08)'; rrect(g, cx - w / 2, cy - CHIP_H / 2 + 3, w, CHIP_H, CHIP_H / 2); g.fill();
    g.fillStyle = SURF; rrect(g, cx - w / 2, cy - CHIP_H / 2, w, CHIP_H, CHIP_H / 2); g.fill();
    g.strokeStyle = LINE; g.lineWidth = 2; g.stroke();
    drawIcon(g, c.icon, cx - 16, cy, 30);
    rollNumber(g, p < 1 && n > 1 ? n - 1 : null, n, n > 1 ? p : 1, cx + 22, cy, 24, INK2, 28, CHIP_H - 6);
    g.restore();
    // sparks on each new reaction
    const ts = t - tl;
    if (ts > 0 && ts < 0.42) {
      const q = ts / 0.42;
      g.save(); g.globalAlpha = alpha * (1 - q); g.fillStyle = ACC;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + n, rr = 30 + 46 * ease.outCubic(q);
        g.beginPath(); g.arc(cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr, 4.5 * (1 - q) + 1, 0, TAU); g.fill();
      }
      g.restore();
    }
    x += it.side ? -(w + 10) : w + 10;
  }
}

function drawTypingDots(g, cx, cy, t, alpha, r = 8, gap = 24) {
  for (let i = 0; i < 3; i++) {
    const ph = TAU * 1.5 * t - i * 0.95;                 // three dots, phase-offset by 0.95 rad
    const up = Math.max(0, Math.sin(ph));
    g.globalAlpha = alpha * (0.35 + 0.65 * up);
    g.fillStyle = up > 0.5 ? INK2 : INK3;
    g.beginPath(); g.arc(cx + (i - 1) * gap, cy - 9 * up * (r / 8), r, 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
}

function drawPoll(g, it, b, t, R) {
  const x = b.bx, y = b.by, w = POLL_W;
  const both = t >= T_BOTH ? spring(t - T_BOTH, ...SCROLL) : 0;
  // header: a drawn bar-chart mark, title, subtitle
  g.fillStyle = ACC_T; g.beginPath(); g.arc(x + 56, y + 52, 32, 0, TAU); g.fill();
  g.strokeStyle = ACC; g.lineWidth = 6; g.lineCap = 'round';
  for (const [dy, len] of [[-11, 26], [0, 18], [11, 32]]) { g.beginPath(); g.moveTo(x + 41, y + 52 + dy); g.lineTo(x + 41 + len, y + 52 + dy); g.stroke(); }
  g.fillStyle = INK; g.font = F(750, 32); g.textAlign = 'left'; g.fillText('오늘 저녁 투표', x + 104, y + 48);
  g.fillStyle = INK3; g.font = F(500, 23); g.fillText('한 사람 한 표', x + 104, y + 82);
  // the two options
  for (let o = 0; o < 2; o++) {
    const ry = y + 108 + o * (ROW_H + 12), rx = x + 22, rw = w - 44;
    const mine = VOTES.filter((v) => v[1] === o);
    let frac = 0;
    for (const v of mine) frac += 0.25 * spring(t - v[2], ...SCROLL);
    frac += (1 - 0.25 * mine.length) * both;
    g.fillStyle = ROW; rrect(g, rx, ry, rw, ROW_H, 24); g.fill();
    g.save(); rrect(g, rx, ry, rw, ROW_H, 24); g.clip();
    g.fillStyle = o === 1 ? ACC_T : COOL_T; g.fillRect(rx, ry, rw * Math.max(0, frac), ROW_H);
    if (o === 0 && both > 0) { g.globalAlpha = clamp(both); g.fillStyle = ACC_T; g.fillRect(rx, ry, rw * Math.max(0, frac), ROW_H); g.globalAlpha = 1; }
    g.restore();
    if (o === 1 && t >= VOTES[1][2]) {                     // 나's own vote: a coral outline
      g.strokeStyle = ACC; g.globalAlpha = clamp((t - VOTES[1][2]) / 0.15); g.lineWidth = 3;
      rrect(g, rx + 1.5, ry + 1.5, rw - 3, ROW_H - 3, 22.5); g.stroke(); g.globalAlpha = 1;
    }
    g.drawImage(R.optIcons[o], rx + 16, ry + ROW_H / 2 - 28, 56, 56);
    g.fillStyle = INK; g.font = F(700, 32); g.textAlign = 'left'; g.fillText(OPTS[o], rx + 86, baseY(ry + ROW_H / 2, 32));
    // check after "둘 다"
    if (both > 0) {
      g.font = F(700, 32);
      const lx = rx + 86 + g.measureText(OPTS[o]).width + 26, s = spring(t - T_BOTH - o * 0.06, ...BOUNCE);
      g.save(); g.translate(lx, ry + ROW_H / 2); g.scale(s, s);
      g.fillStyle = ACC; g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 4; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-6.5, 0.5); g.lineTo(-1.5, 5.5); g.lineTo(7, -5); g.stroke();
      g.restore();
    }
    // count (rolls on each vote) and the voters' faces
    let n = 0; while (n < mine.length && mine[n][2] <= t) n++;
    const tv = n ? mine[n - 1][2] : -Infinity, p = clamp((t - tv) / 0.26);
    g.font = F(800, 32);
    rollNumber(g, p < 1 ? n - 1 : null, n, p, rx + rw - 34, ry + ROW_H / 2, 32, INK, 40, ROW_H - 16);
    for (let k = 0; k < n; k++) {
      const s = spring(t - mine[k][2], ...BOUNCE), ax = rx + rw - 96 - (n - 1 - k) * 26, ay = ry + ROW_H / 2;
      g.save(); g.translate(ax, ay); g.scale(s, s);
      g.fillStyle = SURF; g.beginPath(); g.arc(0, 0, 21, 0, TAU); g.fill();
      g.drawImage(R.avatars[mine[k][0]], -18, -18, 36, 36);
      g.restore();
    }
  }
  // footer status
  const nv = VOTES.filter((v) => v[2] <= t).length;
  const states = [
    [`4명 중 ${nv}명 투표`, INK3, 600, 1 - smooth((t - VOTES[3][2]) / 0.12)],
    ['2 : 2 동점!', INK, 750, win(t, VOTES[3][2], T_BOTH, 0.12, 0.1)],
    ['둘 다 주문하기로!', ACC, 800, smooth((t - T_BOTH) / 0.14)],
  ];
  g.textAlign = 'left';
  for (const [s, col, wt, a] of states) {
    if (a <= 0.003) continue;
    g.globalAlpha = a; g.fillStyle = col; g.font = F(wt, 24); g.fillText(s, x + 28, y + POLL_H - 26);
  }
  g.globalAlpha = 1;
  // the stamp: lands hard on the big beat
  if (t >= T_BOTH) {
    const q = t - T_BOTH, s = 1 + 0.9 * (1 - ease.outExpo(clamp(q / 0.26))), a = clamp(q / 0.06);
    const sx = x + w - 92, sy = y + 50;
    g.save(); g.globalAlpha = a; g.translate(sx, sy); g.rotate(-0.16); g.scale(s, s);
    g.fillStyle = 'rgba(255,255,255,0.92)'; rrect(g, -78, -32, 156, 64, 18); g.fill();
    g.strokeStyle = ACC; g.lineWidth = 4.5; rrect(g, -78, -32, 156, 64, 18); g.stroke();
    g.fillStyle = ACC; g.font = F(900, 36); g.textAlign = 'center'; g.fillText('둘 다!', 0, baseY(0, 36));
    g.restore();
  }
}

function drawItem(g, L, t, R) {
  const { it, y: top } = L;
  const ent = it.tIn < 0 ? 1 : clamp((t - it.tIn) / 0.1);
  if (it.kind === 'div') {
    g.font = F(600, 24);
    const tw = g.measureText(it.label).width + 40, cx = CX + CW / 2, cy = top + DIV_H / 2;
    const s = it.tIn < 0 ? 1 : 0.7 + 0.3 * spring(t - it.tIn, ...POP);
    g.save(); g.globalAlpha = ent; g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy);
    g.fillStyle = CHIP; rrect(g, cx - tw / 2, cy - 22, tw, 44, 22); g.fill();
    g.fillStyle = INK2; g.textAlign = 'center'; g.fillText(it.label, cx, baseY(cy, 24));
    g.restore();
    return;
  }
  const b = bubbleGeom(it, top, t);
  const pop = it.tIn < 0 ? 1 : 0.2 + 0.8 * spring(t - it.tIn, ...POP);
  // avatar and name on the first of a group
  if (it.showName) {
    const s = it.tIn < 0 ? 1 : spring(t - it.tIn, ...POP), cx = AV_X + AV / 2, cy = top + AV / 2;
    g.save(); g.globalAlpha = ent; g.translate(cx, cy); g.scale(s, s);
    drawAvatar(g, R.avatars, it.from, -AV / 2, -AV / 2, AV);
    g.restore();
    g.globalAlpha = ent; g.fillStyle = INK2; g.font = F(600, 28); g.textAlign = 'left';
    g.fillText(PEOPLE[it.from].name, LEFT_X + 6, top + 31);
    g.globalAlpha = 1;
  }
  // the bubble, scaled in from its tail corner
  const ox = it.side ? b.bx + b.bw : b.bx, oy = b.by + b.bh;
  g.save();
  g.globalAlpha = ent;
  g.translate(ox, oy); g.scale(pop, pop); g.translate(-ox, -oy);
  const fill = it.side && it.kind !== 'poll' && !(it.kind === 'typing') && t >= it.tMsg ? ACC : SURF;
  fillBubble(g, b, fill);
  if (it.kind === 'text' && t >= it.tMsg) {
    const ta = it.tMsg === it.tIn ? 1 : clamp((t - it.tMsg - 0.04) / 0.14);
    g.save(); bubblePath(g, b); g.clip();
    g.globalAlpha = ent * ta; g.fillStyle = it.side ? '#fff' : INK; g.font = F(500, FS); g.textAlign = 'left';
    it.lines.forEach((s, i) => g.fillText(s, b.bx + PADX, baseY(b.by + PADY + LH * (i + 0.5), FS)));
    g.restore();
  } else if (it.kind === 'photo') {
    const ix = b.bx + PHOTO_PAD, iy = b.by + PHOTO_PAD, ir = (r) => Math.max(4, r - 6);
    g.save(); g.beginPath(); g.roundRect(ix, iy, PHOTO_W, PHOTO_H, [ir(b.tl), ir(b.tr), ir(b.br) * (1 - b.kR) + 4 * b.kR, ir(b.bl)]); g.clip();
    g.drawImage(R.photo, ix, iy, PHOTO_W, PHOTO_H);
    g.restore();
  } else if (it.kind === 'poll') {
    drawPoll(g, it, b, t, R);
  }
  if (it.tMsg !== it.tIn && t < it.tMsg + 0.1) {         // typing indicator (fades out as the bubble takes over)
    const a = ent * (t < it.tMsg ? 1 : 1 - clamp((t - it.tMsg) / 0.08));
    drawTypingDots(g, b.bx + b.bw / 2, b.by + b.bh / 2 + 2, t, a);
  }
  g.restore();
  if (t < it.tMsg) return;
  // reactions, unread count, timestamp (beside the bubble's bottom, on the inner side)
  drawChips(g, it, t, b, ent);
  const msgA = it.tMsg === it.tIn ? ent : clamp((t - it.tMsg) / 0.15);
  const timeA = msgA * (1 - smooth((t - it.lastUntil) / 0.2));
  const sx = it.side ? b.bx - 12 : b.bx + b.bw + 12;
  if (timeA > 0.003) {
    g.globalAlpha = timeA; g.fillStyle = INK3; g.font = F(500, 23); g.textAlign = it.side ? 'right' : 'left';
    g.fillText(clockLabel(it.at), sx, b.by + b.bh - 6);
    g.globalAlpha = 1;
  }
  const timeVis = 1 - smooth((t - it.lastUntil) / 0.2);
  drawBadge(g, it, t, sx, b.by + b.bh - lerp(20, 52, timeVis), it.side === 1, msgA);
}

// ================================================================ drawing: the card chrome
function drawCard(g, t, R) {
  g.drawImage(R.shadow, 0, 0);
  g.fillStyle = PANEL; rrect(g, CX, CY, CW, CH, CR); g.fill();
  g.save(); rrect(g, CX, CY, CW, CH, CR); g.clip();
  g.fillStyle = SURF; g.fillRect(CX, CY, CW, HEAD_H); g.fillRect(CX, VIEW_B, CW, FOOT_H);
  g.fillStyle = LINE; g.fillRect(CX, VIEW_T - 2, CW, 2); g.fillRect(CX, VIEW_B, CW, 2);
  g.restore();
}

function drawHeader(g, t, R) {
  // group face: the four of them in a 2 × 2 cluster
  const gx = CX + 34, gy = CY + 38;
  [['mom', 0, 0], ['dad', 56, 0], ['sis', 0, 56], ['me', 56, 56]].forEach(([w, dx, dy]) => {
    g.fillStyle = SURF; g.beginPath(); g.arc(gx + dx + 26, gy + dy + 26, 28, 0, TAU); g.fill();
    drawAvatar(g, R.avatars, w, gx + dx, gy + dy, 52);
  });
  g.textAlign = 'left'; g.fillStyle = INK; g.font = F(800, 44); g.fillText('우리집', CX + 166, CY + 86);
  const tw = g.measureText('우리집').width;
  g.fillStyle = INK3; g.font = F(600, 34); g.fillText('4', CX + 166 + tw + 14, CY + 86);
  // subtitle: the members, or who is typing (with the same three dots)
  let who = null, a = 0;
  for (const it of ITEMS) if (it.kind !== 'div' && it.tMsg !== it.tIn) {
    const v = win(t, it.tIn, it.tMsg, 0.12, 0.12);
    if (v > a) { a = v; who = it.from; }
  }
  g.save(); g.beginPath(); g.rect(CX + 160, CY + 98, 600, 46); g.clip();
  const roll = ease.inOutCubic(a);
  g.font = F(500, 27);
  if (a < 1) { g.globalAlpha = 1 - a; g.fillStyle = INK3; g.fillText('엄마 · 아빠 · 동생 · 나', CX + 168, CY + 130 - 36 * roll); }
  if (who && a > 0) {
    const oy = 36 * (1 - roll);
    g.globalAlpha = a; g.fillStyle = ACC; g.font = F(650, 27);
    const s = `${PEOPLE[who].name} 입력 중`;
    g.fillText(s, CX + 168, CY + 130 + oy);
    const dx = CX + 168 + g.measureText(s).width + 30;
    for (let i = 0; i < 3; i++) {
      const up = Math.max(0, Math.sin(TAU * 1.5 * t - i * 0.95));
      g.globalAlpha = a * (0.35 + 0.65 * up);
      g.beginPath(); g.arc(dx + i * 14, CY + 121 - 5 * up + oy, 4.5, 0, TAU); g.fill();
    }
  }
  g.restore();
  // right: a round button with a drawn bowl (the dinner topic)
  const bx = CX + CW - 78, by = CY + 90;
  g.fillStyle = PANEL; g.beginPath(); g.arc(bx, by, 40, 0, TAU); g.fill();
  g.strokeStyle = INK2; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(bx - 20, by + 2); g.lineTo(bx + 20, by + 2); g.arc(bx, by + 2, 20, 0, Math.PI); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(bx + 4, by - 4); g.lineTo(bx + 20, by - 22); g.moveTo(bx + 10, by - 2); g.lineTo(bx + 26, by - 18); g.stroke();
  g.beginPath(); g.moveTo(bx - 8, by - 6); g.quadraticCurveTo(bx - 13, by - 13, bx - 8, by - 20); g.stroke();
}

function drawFooter(g, t, R) {
  const cy = VIEW_B + FOOT_H / 2;
  // plus
  g.fillStyle = PANEL; g.beginPath(); g.arc(CX + 64, cy, 34, 0, TAU); g.fill();
  g.strokeStyle = INK2; g.lineWidth = 4.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(CX + 64 - 13, cy); g.lineTo(CX + 64 + 13, cy); g.moveTo(CX + 64, cy - 13); g.lineTo(CX + 64, cy + 13); g.stroke();
  // field
  const fx = CX + 114, fw = CW - 114 - 132, fh = 74;
  g.fillStyle = PANEL; rrect(g, fx, cy - fh / 2, fw, fh, fh / 2); g.fill();
  const att = win(t, ATTACH[0], ATTACH[1], 0.1, 0.05);
  const typed = win(t, TYPED.a - 0.02, PRESS[1] + 0.02, 0.02, 0.03);
  const busy = Math.max(att, typed);
  g.textAlign = 'left'; g.font = F(500, 30);
  if (busy < 1) { g.globalAlpha = 1 - busy; g.fillStyle = INK3; g.fillText('메시지 보내기', fx + 32, baseY(cy, 30)); }
  if (att > 0) {
    g.globalAlpha = att;
    g.save(); rrect(g, fx + 14, cy - 25, 66, 50, 12); g.clip(); g.drawImage(R.photo, fx + 14, cy - 25, 66, 50); g.restore();
    g.fillStyle = INK2; g.font = F(600, 28); g.fillText('사진 1장', fx + 96, baseY(cy, 28));
  }
  if (typed > 0) {
    const chars = Array.from(TYPED.text), n = Math.ceil(clamp((t - TYPED.a) / (TYPED.b - TYPED.a)) * chars.length);
    const s = chars.slice(0, n).join('');
    g.globalAlpha = typed; g.fillStyle = INK; g.font = F(500, 30); g.fillText(s, fx + 32, baseY(cy, 30));
    const caretX = fx + 34 + g.measureText(s).width;
    g.fillStyle = ACC; g.fillRect(caretX, cy - 19, 3, 38);
  }
  g.globalAlpha = 1;
  // send button: pressed for each of 나's messages
  let press = 0, ring = -1;
  for (const p of PRESS) {
    const q = t - p;
    if (q > 0 && q < 0.2) press = Math.max(press, Math.sin(Math.PI * q / 0.2));
    if (q > 0 && q < 0.45) ring = q / 0.45;
  }
  const sx = CX + CW - 76, s = 1 - 0.12 * press;
  if (ring >= 0) {
    g.strokeStyle = ACC; g.globalAlpha = 0.5 * (1 - ring); g.lineWidth = 4;
    rrect(g, sx - 46 - 26 * ring, cy - 37 - 22 * ring, 92 + 52 * ring, 74 + 44 * ring, 37 + 22 * ring); g.stroke();
    g.globalAlpha = 1;
  }
  g.save(); g.translate(sx, cy); g.scale(s, s);
  g.fillStyle = ACC; rrect(g, -46, -37, 92, 74, 37); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.moveTo(3, -11); g.lineTo(14, 0); g.lineTo(3, 11); g.stroke();
  g.restore();
}

// ================================================================ camera, burst
function camera(t) {
  const e = spring(t + 0.1, 1.3, 0.78);                   // the card rises in
  const q = t - T_BOTH;
  const punch = q > 0 ? 0.02 * (1 - Math.exp(-q * 34)) * Math.exp(-q * 4.5) : 0;
  const s = (0.93 + 0.07 * e) * (1 + 0.014 * smooth(t / D) + punch);
  const fx = 540, fy = 1050;
  return { s, x: fx - fx * s, y: fy - fy * s + 190 * (1 - e) };
}

function drawBurst(g, t) {
  const q0 = t - T_BOTH;
  if (q0 <= 0) return;
  const [x0, y0, hw] = BURST_AT;
  // two rings from the bubble
  for (const [d, rmax] of [[0, 170], [0.08, 110]]) {
    const q = (q0 - d) / 0.45;
    if (q <= 0 || q >= 1) continue;
    g.strokeStyle = ACC; g.globalAlpha = 0.6 * (1 - q); g.lineWidth = 9 * (1 - q) + 1;
    g.beginPath(); g.arc(x0, y0, 40 + rmax * ease.outCubic(q), 0, TAU); g.stroke();
  }
  g.globalAlpha = 1;
  // reaction icons: linear drag k and an upward buoyancy b, in closed form —
  // x = x0 + vx (1 − e^(−kτ))/k,  y = y0 + (b/k) τ + (vy − b/k)(1 − e^(−kτ))/k
  const k = 4.2, bu = -300;
  for (const p of BURST) {
    const tau = q0 - p.d;
    if (tau <= 0 || tau > p.life) continue;
    const ex = (1 - Math.exp(-k * tau)) / k;
    const x = x0 + hw * 0.6 + p.vx * ex + 16 * Math.sin(tau * 3 + p.ph) * tau;
    const y = y0 + (bu / k) * tau + (p.vy - bu / k) * ex;
    const fade = 1 - smooth((tau - (p.life - 0.5)) / 0.5);
    const s = p.s * spring(tau, 2.6, 0.5) * fade;
    if (s < 1) continue;
    g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate(p.spin * 0.1 * tau + 0.22 * Math.sin(tau * 2.6 + p.ph));
    stickerRim(g, p.icon, s);
    drawIcon(g, p.icon, 0, 0, s);
    g.restore();
  }
}

/** a white sticker rim + soft drop under a flying icon, so it reads over coral and white alike */
function stickerRim(g, icon, s) {
  for (const [dy, col, grow] of [[s * 0.07, 'rgba(38,50,84,0.16)', 0.1], [0, '#fff', 0.1]]) {
    g.fillStyle = col;
    if (icon === 'heart') { heartPath(g, 0, dy + s * 0.03, s * (0.94 + grow * 1.6)); g.fill(); }
    else { g.beginPath(); g.arc(0, dy, s * (0.47 + grow * 0.5), 0, TAU); g.fill(); }
  }
}

// ================================================================ demo
defineDemo({
  id: '135-chat-thread',
  title: '오늘 저녁 뭐 먹지',
  tech: '메신저 대화 장면 · 말풍선 레이아웃 + 스프링 스크롤 + 입력 중 표시',
  duration: D,
  background: BG1,
  async setup(api) {
    HEADLESS = api.headless;
    const glyphs = THREAD.map((m) => m.text || '').join('') + OPTS.join('') + TYPED.text +
      '오후0123456789:우리집엄마아빠동생나입력중·메시지보내기사진장오늘저녁투표한사람표명중동점둘다주문하기로!?';
    for (const f of [F(500, FS), F(600, 28), F(800, 44), F(700, 32), F(900, 36)]) await fontReady(f, glyphs);
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.g = ctx;
    ctx.font = F(500, 100);
    const m = ctx.measureText('가');
    MID = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 / 100;
    ITEMS = buildItems(ctx);
    buildSteps();
    // the burst leaves from "둘 다 시키자" where it is at the climax
    const last = layoutAt(T_BOTH).find((L) => L.it.text === '둘 다 시키자');
    const b = bubbleGeom(last.it, last.y, T_BOTH);
    BURST_AT = [b.bx + b.bw / 2, b.by + b.bh / 2, last.it.bw / 2];
    this.R = bake();
    // composite every baked image once now (first-composite differences stay out of the frames)
    const R = this.R;
    ctx.drawImage(R.bg, 0, 0); ctx.drawImage(R.dot, 0, 0); ctx.drawImage(R.cool, 0, 0); ctx.drawImage(R.shadow, 0, 0); ctx.drawImage(R.photo, 0, 0, 96, 72);
    for (const k of Object.keys(R.avatars)) ctx.drawImage(R.avatars[k], 0, 0, 52, 52);
    for (const c of R.optIcons) ctx.drawImage(c, 0, 0, 56, 56);
  },
  frame(t) {
    const g = this.g, R = this.R;
    g.reset();
    g.imageSmoothingQuality = 'high';
    const sc = scrollAt(t);
    // --- far: the backdrop, slow blobs that drift against the scroll (parallax 0.06)
    g.drawImage(R.bg, 0, 0);
    for (const b of BLOBS) {
      const y = b.y - sc * 0.06 + 30 * Math.sin(t * 0.4 + b.ph), x = b.x + 24 * Math.sin(t * 0.3 + b.ph * 2);
      g.globalAlpha = b.a;
      g.drawImage(b.cool ? R.cool : R.dot, x - b.s / 2, y - b.s / 2, b.s, b.s);
    }
    g.globalAlpha = 1;
    // warm glow behind the card on the climax
    const glow = t > T_BOTH ? smooth((t - T_BOTH) / 0.25) * (0.42 - 0.24 * smooth((t - T_BOTH - 0.4) / 2.2)) : 0;
    const cam = camera(t);
    g.setTransform(cam.s, 0, 0, cam.s, cam.x, cam.y);
    if (glow > 0.003) {
      const gr = g.createRadialGradient(W / 2, BURST_AT[1] - 220, 40, W / 2, BURST_AT[1] - 220, 900);
      gr.addColorStop(0, `rgba(255,140,110,${glow.toFixed(3)})`); gr.addColorStop(1, 'rgba(255,140,110,0)');
      g.fillStyle = gr; g.fillRect(-200, -200, W + 400, H + 400);
    }
    // --- mid: the card
    drawCard(g, t, R);
    // the list, in content space shifted by the spring scroll, clipped to the viewport
    g.save();
    g.beginPath(); g.rect(CX, VIEW_T, CW, VIEW_H); g.clip();
    for (const L of layoutAt(t)) {
      if (L.y > VIEW_B + 30 || L.y + L.h < VIEW_T - 60) continue;
      drawItem(g, L, t, R);
      g.globalAlpha = 1;
    }
    // soft edges: the list fades under the header and above the input bar
    let fg = g.createLinearGradient(0, VIEW_T, 0, VIEW_T + 48);
    fg.addColorStop(0, 'rgba(238,241,246,1)'); fg.addColorStop(1, 'rgba(238,241,246,0)');
    g.fillStyle = fg; g.fillRect(CX, VIEW_T, CW, 48);
    fg = g.createLinearGradient(0, VIEW_B - 26, 0, VIEW_B);
    fg.addColorStop(0, 'rgba(238,241,246,0)'); fg.addColorStop(1, 'rgba(238,241,246,1)');
    g.fillStyle = fg; g.fillRect(CX, VIEW_B - 26, CW, 26);
    g.restore();
    drawHeader(g, t, R);
    drawFooter(g, t, R);
    g.globalAlpha = 1;
    // --- near: the burst of reactions flies in front of everything
    drawBurst(g, t);
    // --- screen space: foreground bokeh, the caption scrim
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (const b of BOKEH) {
      g.globalAlpha = b.a;
      const y = b.y + sc * 0.05 - 40 * t * 0.1 + 20 * Math.sin(t * 0.5 + b.ph);
      g.drawImage(R.dot, b.x - b.s / 2, y - b.s / 2, b.s, b.s);
    }
    g.globalAlpha = 1;
    const sg = g.createLinearGradient(0, 1630, 0, H);
    sg.addColorStop(0, 'rgba(22,27,42,0)'); sg.addColorStop(0.45, 'rgba(22,27,42,0.62)'); sg.addColorStop(1, 'rgba(22,27,42,0.86)');
    g.fillStyle = sg; g.fillRect(0, 1630, W, H - 1630);
  },
});
