/*
 * 106 · 보내기 전에 — a Hangul IME, live: the message is the story of its own edits.
 *
 *   새벽 1시, 두 달 전 "잘 지내."에서 멈춘 대화창.
 *     너 진짜 너무해        — typed in one angry burst (넘 → 너무, 뭏 → 무해: the final consonant keeps jumping on)
 *     [너무해]              — a long press selects it; a hesitation
 *     보고 … 싶았어         — typed over the selection, slowly; a hesitation before the hard word; a typo (ㅏ for ㅓ)
 *     ⌫ ⌫ ⌫               — one jamo, then the empty syllable, then a whole syllable
 *     싶었어 → 보내기       — the bubble flies up; the struck-out "너무해" scatters; …입력 중 → "나도."
 *
 * The only input is KEYS, a list of [time, key]. editorAt(t) replays it from the start through a 2-beolsik automaton
 * (feed/render below) every frame — a few dozen events, so it is cheap — and returns the text, the composing syllable,
 * the caret, the selection and the trail of deleted glyphs, each glyph stamped with the time it last changed.
 * Every picture is drawn from that state and t: no state survives between frames. One Canvas 2D; GSAP only for eases.
 */
import { defineDemo, rand, clamp, lerp, track, W, H } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';

const D = 10;
const PF = `"${FONTS.pretendard.family}"`;
const font = (w, s) => `${w} ${s}px ${PF}`;
const ez = (s) => gsap.parseEase(s);
const EXPO_OUT = ez('expo.out'), EXPO_IO = ez('expo.inOut'), P2OUT = ez('power2.out'), P3OUT = ez('power3.out');
const P3IO = ez('power3.inOut'), BACK = ez('back.out(1.7)'), BACK14 = ez('back.out(1.4)'), BACK22 = ez('back.out(2.2)'), SINE_IO = ez('sine.inOut');
const seg = (t, a, d) => clamp((t - a) / d);
const bell = (u) => (u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u));

// ------------------------------------------------------------------ the keystrokes (the only input)
// physical keys of the 2-beolsik pad (a jamo key is named by its unshifted label), '⇧' (sticky shift), '␣', '⌫',
// two touches on the text — 'HOLD' (long press starts, ends composition) and 'SEL' (the press selects [a, b)) — and 'SEND'.
const KEYS = [
  // 너 진짜 너무해 — one angry burst
  [0.75, 'ㄴ'], [0.83, 'ㅓ'], [0.95, '␣'],
  [1.05, 'ㅈ'], [1.12, 'ㅣ'], [1.20, 'ㄴ'], [1.30, '⇧'], [1.36, 'ㅈ'], [1.44, 'ㅏ'], [1.57, '␣'],
  [1.67, 'ㄴ'], [1.75, 'ㅓ'], [1.83, 'ㅁ'], [1.91, 'ㅜ'], [2.01, 'ㅎ'], [2.09, 'ㅐ'],
  // stop. a long press on 너무해
  [3.00, 'HOLD', 5, 8], [3.35, 'SEL', 5, 8],
  // 보고 — typed over the selection, slower
  [3.90, 'ㅂ'], [4.03, 'ㅗ'], [4.17, 'ㄱ'], [4.30, 'ㅗ'], [4.44, '␣'],
  // … 싶았어 (ㅏ for ㅓ: the keys are neighbours)
  [5.05, 'ㅅ'], [5.13, 'ㅣ'], [5.21, 'ㅍ'], [5.30, 'ㅇ'], [5.37, 'ㅏ'], [5.47, '⇧'], [5.52, 'ㅅ'], [5.61, 'ㅇ'], [5.68, 'ㅓ'],
  // noticed: one jamo, the empty syllable, then the whole 았
  [6.00, '⌫'], [6.11, '⌫'], [6.22, '⌫'],
  [6.37, 'ㅇ'], [6.44, 'ㅓ'], [6.53, '⇧'], [6.58, 'ㅅ'], [6.67, 'ㅇ'], [6.74, 'ㅓ'],
  [7.35, 'SEND'],
];
const T_SEND = 7.35, FLY = 0.6, T_LAND = T_SEND + FLY;
const T_READ = 8.32, T_TYPING = 8.55, T_REPLY = 9.15;

// ------------------------------------------------------------------ 2-beolsik automaton
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];
const VV = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
const CC = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
const SHIFTED = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };
const isV = (j) => JUNG.includes(j);
const NO_JONG = 'ㄸㅃㅉ';

/** the jamo typed into one syllable, in order → { cho, v: [1–2 vowels], f: [0–2 finals] } */
function parse(keys) {
  let i = 0, cho = null;
  const v = [], f = [];
  if (i < keys.length && !isV(keys[i])) cho = keys[i++];
  while (i < keys.length && isV(keys[i])) v.push(keys[i++]);
  while (i < keys.length) f.push(keys[i++]);
  return { cho, v, f };
}
const vowelOf = (v) => (v.length === 2 ? VV[v[0] + v[1]] : v[0]);
const finalOf = (f) => (f.length === 2 ? CC[f[0] + f[1]] : f[0] || '');
/** the syllable the keys spell: a precomposed U+AC00 block, or a lone jamo while it has no vowel / no initial */
function render(keys) {
  if (!keys.length) return '';
  const { cho, v, f } = parse(keys);
  if (cho && v.length) return String.fromCharCode(0xac00 + (CHO.indexOf(cho) * 21 + JUNG.indexOf(vowelOf(v))) * 28 + JONG.indexOf(finalOf(f)));
  return cho || vowelOf(v);
}
/**
 * One jamo into the composing syllable → { commit, keys, moved }.
 * commit: the syllable that is finished (''), keys: the new composing syllable, moved: a final consonant that left the
 * finished syllable to become the next one's initial (한 + ㅏ → 하 | 나; 않 + ㅏ → 안 | 하).
 */
function feed(keys, j) {
  const push = { commit: '', keys: [...keys, j] }, next = { commit: render(keys), keys: [j] };
  if (!keys.length) return { commit: '', keys: [j] };
  const { cho, v, f } = parse(keys);
  if (isV(j)) {
    if (!v.length) return push;                                     // ㅎ + ㅏ → 하
    if (!f.length) return v.length === 1 && VV[v[0] + j] ? push : next; // ㅗ + ㅐ → ㅙ
    const last = f[f.length - 1];                                   // the final jumps to the next syllable
    return { commit: render(keys.slice(0, -1)), keys: [last, j], moved: last };
  }
  if (!v.length || !cho) return next;
  if (!f.length) return NO_JONG.includes(j) ? next : push;         // 하 + ㄴ → 한
  if (f.length === 1 && CC[f[0] + j]) return push;                  // 안 + ㅎ → 않
  return next;
}

// ------------------------------------------------------------------ layout (phone space = stage px at camera 1)
const PH = { x0: 150, y0: 60, x1: 930, y1: 1640, r: 112 };
const SC = { x0: 166, y0: 76, x1: 914, y1: 1624, r: 98 };
const FS = 54, FX = 286, BASE = 958;                        // input line: size, x, baseline
const FIELD = { x: 246, y: 886, w: 572, h: 104 };
const SEND = { x: 865, y: 938, r: 42 };
const BFS = 40, BPX = 30, BH = 84, BBASE = 56;               // chat bubbles
const KFS = 40;
const KB = { top: 1006, rows: [1084, 1212, 1340, 1468], kh: 110 };
const C = {
  coral: '#ff7a5c', coralRGB: [255, 122, 92],
  ink: '#eef0fa', inkRGB: [238, 240, 250], muted: '#8a93bb', faint: '#5f6890',
  them: '#262e52', key: [43, 51, 88], keyFn: [30, 37, 70], keyHi: [78, 89, 136], kb: '#131a35',
  pale: [196, 186, 222],
};
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

// camera: [focus x, focus y, scale, rotation°] — wide on the room, in on the keys, closer on the line, out with the bubble
const CAM = track([
  [0, [540, 900, 0.8, -3.2]],
  [0.62, [540, 905, 0.84, -3.0], SINE_IO],
  [1.75, [540, 1094, 1.28, -0.6], EXPO_IO],
  [2.95, [541, 1102, 1.3, -0.4], SINE_IO],
  [3.4, [546, 1150, 1.42, 0], P3IO],
  [7.3, [548, 1158, 1.45, 0.25], SINE_IO],
  [8.2, [540, 884, 0.965, -1.6], EXPO_OUT],
  [10, [540, 876, 0.99, -2.0], SINE_IO],
]);

let G, HEADLESS = false;
const SPR = {};
let MF = null, MB = null;           // measuring contexts (field font, bubble font)
const MCACHE = new Map();
let DUST = [], SPARKS = [], SCATTER = [], FORE = [];

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}
function resetCtx(g) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.lineWidth = 1; g.setLineDash([]);
  g.fillStyle = '#000'; g.strokeStyle = '#000'; g.filter = 'none';
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
function rr(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function rr4(g, x, y, w, h, tl, tr, br, bl) {
  const m = Math.min(w / 2, h / 2);
  tl = Math.min(tl, m); tr = Math.min(tr, m); br = Math.min(br, m); bl = Math.min(bl, m);
  g.beginPath();
  g.moveTo(x + tl, y); g.arcTo(x + w, y, x + w, y + h, tr); g.arcTo(x + w, y + h, x, y + h, br);
  g.arcTo(x, y + h, x, y, bl); g.arcTo(x, y, x + w, y, tl); g.closePath();
}
const measF = (s) => { const k = 'F' + s; let v = MCACHE.get(k); if (v === undefined) { v = MF.measureText(s).width; MCACHE.set(k, v); } return v; };
const measB = (s) => { const k = 'B' + s; let v = MCACHE.get(k); if (v === undefined) { v = MB.measureText(s).width; MCACHE.set(k, v); } return v; };

// ------------------------------------------------------------------ the editor at time t (replay)
/** glyph x offsets on the input line (prefix widths, so the composing syllable pushes the rest exactly as it would) */
function layout(gs) {
  const xs = [0];
  let s = '';
  for (const g of gs) { s += g.ch; xs.push(measF(s)); }
  return xs;
}
const display = (S) => [...S.glyphs.slice(0, S.caret), ...(S.comp ? [S.comp] : []), ...S.glyphs.slice(S.caret)];

function editorAt(t) {
  const S = { glyphs: [], comp: null, caret: 0, sel: null, selGone: null, hold: null, shift: false, shiftT: -9, last: -9, ghosts: [],
    press: {}, tap: null, sent: null, filled: null };
  const commitComp = () => { if (S.comp) { S.glyphs.splice(S.caret++, 0, S.comp); S.comp = null; } };
  const deleteSel = (te) => {
    const d = display(S), xs = layout(d);
    for (let i = S.sel.a; i < S.sel.b; i++) S.ghosts.push({ ch: d[i].ch, x: xs[i], w: xs[i + 1] - xs[i], t: te, kind: 'mem', k: i - S.sel.a });
    S.selGone = { ...S.sel, end: te, xs };
    S.glyphs.splice(S.sel.a, S.sel.b - S.sel.a);
    S.caret = S.sel.a; S.sel = null;
  };
  for (const [te, k, a, b] of KEYS) {
    if (te > t) break;
    S.last = te;
    if (k === '⇧') { S.shift = !S.shift; S.shiftT = te; S.press[k] = te; S.tap = { k, t: te }; }
    else if (k === 'HOLD') { commitComp(); S.hold = { a, b, t: te }; }
    else if (k === 'SEL') { S.sel = { a, b, t: te }; }
    else if (k === 'SEND') {
      commitComp();
      const d = display(S);
      S.sent = { t: te, text: d.map((g) => g.ch).join(''), xs: layout(d) };
      S.glyphs = []; S.caret = 0; S.press.SEND = te;
    } else if (k === '␣') {
      S.press[k] = te; S.tap = { k, t: te };
      if (S.sel) deleteSel(te);
      commitComp();
      S.glyphs.splice(S.caret++, 0, { ch: ' ', born: te, chg: te });
    } else if (k === '⌫') {
      S.press[k] = te; S.tap = { k, t: te };
      if (S.sel) deleteSel(te);
      else if (S.comp) {                                   // inside the composing syllable: one jamo at a time
        const d = display(S), xs = layout(d), i = S.caret;
        const gone = S.comp.keys.pop();
        S.ghosts.push({ ch: gone, x: xs[i], w: xs[i + 1] - xs[i], t: te, kind: 'jamo' });
        if (S.comp.keys.length) { S.comp.ch = render(S.comp.keys); S.comp.chg = te; } else S.comp = null;
      } else if (S.caret > 0) {                            // then whole syllables
        const d = display(S), xs = layout(d), i = S.caret - 1;
        S.ghosts.push({ ch: d[i].ch, x: xs[i], w: xs[i + 1] - xs[i], t: te, kind: 'syl' });
        S.glyphs.splice(i, 1); S.caret--;
      }
    } else {                                               // a jamo key
      const j = S.shift && SHIFTED[k] ? SHIFTED[k] : k;
      if (S.shift) S.shiftT = te;
      S.shift = false;
      S.press[k] = te; S.tap = { k, j, t: te };
      if (S.sel) deleteSel(te);
      const r = feed(S.comp ? S.comp.keys : [], j);
      if (r.commit && S.comp) {
        if (S.comp.ch !== r.commit) { S.comp.ch = r.commit; S.comp.chg = te; }
        S.comp.keys = null;
        commitComp();
      }
      if (S.comp) { S.comp.keys = r.keys; S.comp.ch = render(r.keys); S.comp.chg = te; }
      else S.comp = { keys: r.keys, ch: render(r.keys), born: te, chg: te, hop: r.moved ? { j: r.moved, t: te } : null };
    }
    const n = S.glyphs.length + (S.comp ? 1 : 0);
    if (n > 0 && S.filled === null) S.filled = te;
    if (n === 0) S.filled = null;
  }
  return S;
}

// ------------------------------------------------------------------ keyboard (2-beolsik)
const KEYCAPS = [];
function buildKeys() {
  const pitch = 73.2, kw = 64, x0 = 174;
  const add = (id, x, row, w, fn = false) => KEYCAPS.push({ id, x, y: KB.rows[row], w, h: KB.kh, fn });
  [...'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ'].forEach((j, i) => add(j, x0 + i * pitch + (pitch - kw) / 2, 0, kw));
  [...'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ'].forEach((j, i) => add(j, x0 + pitch / 2 + i * pitch + (pitch - kw) / 2, 1, kw));
  add('⇧', x0, 2, 96, true);
  [...'ㅋㅌㅊㅍㅠㅜㅡ'].forEach((j, i) => add(j, 540 - 3.5 * pitch + i * pitch + (pitch - kw) / 2, 2, kw));
  add('⌫', 810, 2, 96, true);
  add('123', x0, 3, 110, true); add('☺', 294, 3, 84, true); add('␣', 388, 3, 326); add('.', 724, 3, 76); add('⏎', 810, 3, 96, true);
}

// ------------------------------------------------------------------ baked backdrop
const FAR = { ox: 160, oy: 240, w: 1400, h: 2400 };
const NEAR = { ox: 160, oy: -1180, w: 1400, h: 1180 };
function bakeFar() {
  const { c, g } = mk(FAR.w, FAR.h);
  g.translate(FAR.ox, FAR.oy);
  let lg = g.createLinearGradient(0, -240, 0, 2160);
  lg.addColorStop(0, '#080b24'); lg.addColorStop(0.45, '#0e1236'); lg.addColorStop(1, '#06081c');
  g.fillStyle = lg; g.fillRect(-FAR.ox, -FAR.oy, FAR.w, FAR.h);

  // the night outside, painted sharp and then thrown out of focus
  const win = { x: 30, y: 100, w: 1020, h: 1000 };
  const { c: wc, g: wg } = mk(win.w, win.h);
  lg = wg.createLinearGradient(0, 0, 0, win.h);
  lg.addColorStop(0, '#0a1440'); lg.addColorStop(0.6, '#16245a'); lg.addColorStop(0.86, '#2a2c64'); lg.addColorStop(1, '#3a2e62');
  wg.fillStyle = lg; wg.fillRect(0, 0, win.w, win.h);
  const r = rand(10601);
  for (let i = 0; i < 70; i++) {
    const x = r() * win.w, y = 20 + Math.pow(r(), 1.4) * 560, s = 1 + 2.2 * r() * r();
    wg.fillStyle = `rgba(220,228,255,${(0.25 + 0.6 * r()).toFixed(3)})`;
    wg.beginPath(); wg.arc(x, y, s, 0, Math.PI * 2); wg.fill();
  }
  // moon + halo
  const mx = 800, my = 250;
  let rg = wg.createRadialGradient(mx, my, 30, mx, my, 260);
  rg.addColorStop(0, 'rgba(190,208,255,0.35)'); rg.addColorStop(1, 'rgba(190,208,255,0)');
  wg.fillStyle = rg; wg.fillRect(mx - 260, my - 260, 520, 520);
  wg.fillStyle = '#f3ead6'; wg.beginPath(); wg.arc(mx, my, 46, 0, Math.PI * 2); wg.fill();
  wg.fillStyle = 'rgba(160,150,190,0.25)';
  wg.beginPath(); wg.arc(mx - 14, my - 8, 10, 0, Math.PI * 2); wg.arc(mx + 12, my + 14, 7, 0, Math.PI * 2); wg.fill();
  // far apartments: flat blocks with a few warm windows still awake
  for (let pass = 0; pass < 2; pass++) {
    let x = -30;
    while (x < win.w + 30) {
      const bw = 70 + 130 * r(), bh = (pass ? 150 : 260) + (pass ? 170 : 220) * r();
      const top = win.h - bh;
      wg.fillStyle = pass ? '#0c1031' : '#141a46';
      wg.fillRect(x, top, bw - 6, bh);
      for (let yy = top + 18; yy < win.h - 10; yy += 26) for (let xx = x + 12; xx < x + bw - 22; xx += 22) {
        const q = r();
        if (q < (pass ? 0.12 : 0.07)) { wg.fillStyle = q < 0.04 ? 'rgba(170,200,255,0.55)' : 'rgba(255,196,120,0.75)'; wg.fillRect(xx, yy, 9, 12); }
      }
      x += bw;
    }
  }
  g.save();
  rr(g, win.x, win.y, win.w, win.h, 6); g.clip();
  g.filter = 'blur(5px)'; g.drawImage(wc, win.x, win.y); g.filter = 'none';
  // bokeh: street lights far below, out of focus
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) {
    const x = win.x + r() * win.w, y = win.y + win.h * (0.62 + 0.38 * Math.pow(r(), 0.7)), rad = 12 + 30 * r();
    const warm = r() < 0.6, a = 0.18 + 0.3 * r();
    const col = warm ? [255, 180, 110] : r() < 0.5 ? [150, 180, 255] : [255, 130, 120];
    rg = g.createRadialGradient(x, y, rad * 0.55, x, y, rad);
    rg.addColorStop(0, rgba(col, a)); rg.addColorStop(0.85, rgba(col, a * 0.8)); rg.addColorStop(1, rgba(col, 0));
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  // window frame and cross bars
  g.fillStyle = '#121845';
  g.fillRect(win.x - 22, win.y - 22, win.w + 44, 22); g.fillRect(win.x - 22, win.y + win.h, win.w + 44, 22);
  g.fillRect(win.x - 22, win.y, 22, win.h); g.fillRect(win.x + win.w, win.y, 22, win.h);
  g.fillRect(win.x + win.w / 2 - 11, win.y, 22, win.h); g.fillRect(win.x, win.y + 470, win.w, 20);
  g.fillStyle = 'rgba(150,170,255,0.10)';
  g.fillRect(win.x + win.w / 2 - 11, win.y, 3, win.h); g.fillRect(win.x, win.y + 470, win.w, 3);
  // sill
  lg = g.createLinearGradient(0, win.y + win.h + 22, 0, win.y + win.h + 62);
  lg.addColorStop(0, '#1d2452'); lg.addColorStop(1, '#0d1130');
  g.fillStyle = lg; g.fillRect(win.x - 60, win.y + win.h + 22, win.w + 120, 40);
  // curtains: soft vertical folds
  for (const [cx0, cx1] of [[-170, 70], [1010, 1250]]) {
    g.fillStyle = '#12143c'; g.fillRect(cx0, -240, cx1 - cx0, 1900);
    const n = 4, fw = (cx1 - cx0) / n;
    for (let i = 0; i < n; i++) {
      const fx = cx0 + i * fw;
      const fg = g.createLinearGradient(fx, 0, fx + fw, 0);
      fg.addColorStop(0, 'rgba(0,0,10,0.35)'); fg.addColorStop(0.45, 'rgba(120,110,210,0.10)'); fg.addColorStop(1, 'rgba(0,0,10,0.30)');
      g.fillStyle = fg; g.fillRect(fx, -240, fw, 1900);
    }
    // the edge that faces the window catches moonlight
    const ex = cx0 < 0 ? cx1 : cx0;
    const eg = g.createLinearGradient(ex - 26, 0, ex + 26, 0);
    eg.addColorStop(0, 'rgba(150,170,255,0)'); eg.addColorStop(0.5, 'rgba(150,170,255,0.13)'); eg.addColorStop(1, 'rgba(150,170,255,0)');
    g.fillStyle = eg; g.fillRect(ex - 26, -240, 52, 1900);
  }
  g.fillStyle = '#1b1f52'; g.fillRect(-170, 52, 1420, 14);
  return c;
}
function bakeNear() {
  const { c, g } = mk(NEAR.w, NEAR.h);
  g.translate(NEAR.ox, NEAR.oy);
  // pillows behind
  let lg = g.createLinearGradient(0, 1220, 0, 1440);
  lg.addColorStop(0, '#2a3170'); lg.addColorStop(1, '#161b48');
  g.fillStyle = lg; rr(g, -120, 1230, 560, 250, 110); g.fill();
  lg = g.createLinearGradient(0, 1250, 0, 1450);
  lg.addColorStop(0, '#222965'); lg.addColorStop(1, '#13183f');
  g.fillStyle = lg; rr(g, 760, 1262, 520, 230, 100); g.fill();
  // blanket with folds (painted, then softened)
  const { c: bc, g: bg } = mk(NEAR.w, NEAR.h);
  bg.translate(NEAR.ox, NEAR.oy);
  bg.beginPath();
  bg.moveTo(-170, 1420);
  bg.bezierCurveTo(120, 1370, 320, 1450, 560, 1408);
  bg.bezierCurveTo(800, 1366, 980, 1440, 1250, 1396);
  bg.lineTo(1250, 2400); bg.lineTo(-170, 2400); bg.closePath();
  lg = bg.createLinearGradient(0, 1380, 0, 2200);
  lg.addColorStop(0, '#232a68'); lg.addColorStop(0.35, '#181e52'); lg.addColorStop(1, '#0b0e2c');
  bg.fillStyle = lg; bg.fill();
  bg.save(); bg.clip();
  bg.filter = 'blur(14px)';
  bg.lineCap = 'round';
  const folds = [[-60, 1560, 420, 1720, 80], [300, 1500, 720, 1640, 70], [640, 1700, 1180, 1560, 90], [-100, 1880, 600, 1960, 110], [500, 1900, 1200, 1820, 100]];
  for (const [x0, y0, x1, y1, w] of folds) {
    bg.strokeStyle = 'rgba(4,6,24,0.55)'; bg.lineWidth = w;
    bg.beginPath(); bg.moveTo(x0, y0); bg.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 60, x1, y1); bg.stroke();
    bg.strokeStyle = 'rgba(140,160,255,0.10)'; bg.lineWidth = w * 0.45;
    bg.beginPath(); bg.moveTo(x0, y0 - w * 0.7); bg.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 60 - w * 0.7, x1, y1 - w * 0.7); bg.stroke();
  }
  bg.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(bc, 0, 0);
  return c;
}
/** soft rounded-rect halo (shadow / screen glow) baked once */
function bakeHalo(color, blur, pad) {
  const w = PH.x1 - PH.x0, h = PH.y1 - PH.y0;
  const { c: a, g: ag } = mk(w + 2 * pad, h + 2 * pad);
  ag.fillStyle = color; rr(ag, pad, pad, w, h, PH.r); ag.fill();
  const { c, g } = mk(w + 2 * pad, h + 2 * pad);
  g.filter = `blur(${blur}px)`; g.drawImage(a, 0, 0); g.filter = 'none';
  return c;
}

// ------------------------------------------------------------------ drawing helpers
function camAt(t) {
  const [fx, fy, s, rot] = CAM(t);
  const hx = 2.4 * Math.sin(t * 1.1) + 1.2 * Math.sin(t * 2.3 + 1), hy = 2.0 * Math.sin(t * 0.9 + 2) + 1.0 * Math.sin(t * 2.7);
  // a small settle when the bubble lands
  const k = t - T_LAND, shake = k > 0 && k < 0.5 ? Math.exp(-k * 9) * Math.sin(k * 50) : 0;
  return { fx, fy, s, rot: (rot + 0.12 * Math.sin(t * 0.7) + 0.5 * shake) * Math.PI / 180, hx, hy: hy + 4 * shake };
}
function applyCam(g, cam, f = 1) {
  const s = 1 + (cam.s - 1) * f, fx = 540 + (cam.fx - 540) * f, fy = 960 + (cam.fy - 960) * f;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540 + cam.hx * f, 960 + cam.hy * f);
  g.rotate(cam.rot * f);
  g.scale(s, s);
  g.translate(-fx, -fy);
}
/** warmth of the scene light: cool screen-light → coral after the send, a little more with the reply */
const warmth = (t) => 0.45 * P2OUT(seg(t, T_SEND + 0.05, 1.2)) + 0.3 * P2OUT(seg(t, T_REPLY, 0.7));

function drawRoom(g, t, cam) {
  applyCam(g, cam, 0.16);
  g.drawImage(SPR.far, -FAR.ox, -FAR.oy);
  applyCam(g, cam, 0.42);
  g.drawImage(SPR.near, -NEAR.ox, -NEAR.oy);
  // the screen lights the room (cool, warming after the send)
  applyCam(g, cam, 1);
  const w = warmth(t), col = mix([120, 150, 255], [255, 140, 110], w);
  g.globalCompositeOperation = 'lighter';
  const rg = g.createRadialGradient(540, 980, 200, 540, 980, 1250);
  rg.addColorStop(0, rgba(col, 0.20)); rg.addColorStop(0.5, rgba(col, 0.07)); rg.addColorStop(1, rgba(col, 0));
  g.fillStyle = rg; g.fillRect(-900, -600, 2900, 3200);
  // dust in the screen light
  applyCam(g, cam, 0.6);
  for (const d of DUST) {
    const x = d.x + d.ax * Math.sin(t * d.f + d.ph), y = d.y - d.v * t + d.ay * Math.sin(t * d.f * 0.7 + d.ph * 2);
    const yy = ((y + 200) % 2300 + 2300) % 2300 - 200;
    const tw = 0.6 + 0.4 * Math.sin(t * d.f * 2 + d.ph);
    g.globalAlpha = d.a * tw;
    g.drawImage(SPR.dot, x - d.r * 4, yy - d.r * 4, d.r * 8, d.r * 8);
  }
  resetCtx(g);
}

function drawStatus(g) {
  g.fillStyle = C.ink; g.font = font(600, 30); g.fillText('1:12', 214, 124);
  // punch-hole camera
  g.fillStyle = '#03040b'; g.beginPath(); g.arc(540, 110, 14, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(120,140,220,0.18)'; g.lineWidth = 2; g.stroke();
  // signal, wifi, battery
  g.fillStyle = C.ink;
  for (let i = 0; i < 4; i++) { const h = 8 + i * 5; rr(g, 742 + i * 9, 125 - h, 6, h, 2); g.fill(); }
  g.strokeStyle = C.ink; g.lineWidth = 3.4; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(800, 126, 6 + i * 7, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); }
  g.lineCap = 'butt'; g.lineWidth = 2.4;
  rr(g, 832, 106, 46, 22, 6); g.stroke();
  g.fillRect(879, 113, 4, 8);
  rr(g, 836, 110, 18, 14, 3); g.fill();          // 40 %
}
function drawHeader(g, t) {
  g.strokeStyle = C.ink; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(214, 186); g.lineTo(196, 204); g.lineTo(214, 222); g.stroke();
  // avatar
  const lg = g.createLinearGradient(230, 170, 296, 238);
  lg.addColorStop(0, '#9d8cff'); lg.addColorStop(1, '#ff9f86');
  g.fillStyle = lg; g.beginPath(); g.arc(266, 204, 34, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.font = font(700, 30); g.textAlign = 'center'; g.fillText('서', 266, 215); g.textAlign = 'left';
  // name; "입력 중…" under it while the other side is typing
  const typing = seg(t, T_TYPING, 0.15) * (1 - seg(t, T_REPLY, 0.15));
  const ny = 216 - 13 * P2OUT(typing);
  g.fillStyle = C.ink; g.font = font(700, 36); g.fillText('서진', 318, ny);
  if (typing > 0) { g.globalAlpha = typing; g.fillStyle = C.coral; g.font = font(500, 23); g.fillText('입력 중…', 319, ny + 32); g.globalAlpha = 1; }
  // right icons: search + menu
  g.strokeStyle = C.muted; g.lineWidth = 3.4;
  g.beginPath(); g.arc(800, 198, 13, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(810, 208); g.lineTo(820, 218); g.stroke();
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(848, 190 + i * 12); g.lineTo(876, 190 + i * 12); g.stroke(); }
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(SC.x0, 262, SC.x1 - SC.x0, 2);
}
function chip(g, text, y) {
  g.font = font(500, 23);
  const w = measB(text) * 23 / BFS + 40;
  g.fillStyle = 'rgba(255,255,255,0.06)'; rr(g, 540 - w / 2, y - 21, w, 42, 21); g.fill();
  g.fillStyle = C.muted; g.textAlign = 'center'; g.fillText(text, 540, y + 8); g.textAlign = 'left';
}
/** a chat bubble with its tail corner squared off */
function bubble(g, side, x, y, w, h, fill) {
  if (side === 'me') rr4(g, x, y, w, h, 34, 34, 10, 34); else rr4(g, x, y, w, h, 10, 34, 34, 34);
  g.fillStyle = fill; g.fill();
}
function staticBubble(g, side, text, top, stamp) {
  const w = measB(text) + 2 * BPX, x = side === 'me' ? 884 - w : 196;
  bubble(g, side, x, top, w, BH, side === 'me' ? C.coral : C.them);
  g.font = font(500, BFS); g.fillStyle = side === 'me' ? '#fff' : C.ink;
  g.fillText(text, x + BPX, top + BBASE);
  if (stamp) {
    g.font = font(500, 21); g.fillStyle = C.faint;
    if (side === 'me') { g.textAlign = 'right'; g.fillText(stamp, x - 12, top + BH - 6); g.textAlign = 'left'; }
    else g.fillText(stamp, x + w + 12, top + BH - 6);
  }
}

// ------------------------------------------------------------------ the input line
function glyphScale(gl, t) {
  const b = t - gl.born, a = t - gl.chg;
  if (b >= 0 && b < 0.2) return lerp(0.55, 1, BACK22(b / 0.2));        // a new syllable pops in
  if (a >= 0 && a < 0.18) return lerp(0.84, 1, BACK(a / 0.18));         // it changes shape (a jamo joined or left)
  return 1;
}
function drawLine(g, t, S) {
  const d = display(S), xs = layout(d);
  const ci = S.comp ? S.caret : -1;
  // selection highlight (grows out from the long-press point)
  if (S.sel) {
    const u = EXPO_OUT(seg(t, S.sel.t, 0.16));
    const xa = FX + xs[S.sel.a], xb = FX + xs[S.sel.b], m = (xa + xb) / 2;
    g.fillStyle = rgba(C.coralRGB, 0.36);
    rr(g, lerp(m, xa - 4, u), BASE - 52, lerp(0, xb - xa + 8, u), 70, 8); g.fill();
  }
  // composing syllable: a soft box + underline, as an IME marks it
  if (ci >= 0) {
    const x = FX + xs[ci] - 5, w = xs[ci + 1] - xs[ci] + 10;
    g.fillStyle = rgba(C.coralRGB, 0.14); rr(g, x, BASE - 52, w, 68, 9); g.fill();
    g.fillStyle = C.coral; rr(g, x + 2, BASE + 15, w - 4, 4.5, 2.25); g.fill();
  }
  g.font = font(500, FS);
  for (let i = 0; i < d.length; i++) {
    const gl = d[i];
    if (gl.ch === ' ') continue;
    const w = xs[i + 1] - xs[i], cx = FX + xs[i] + w / 2, cy = BASE - 0.36 * FS;
    let s = glyphScale(gl, t), alpha = 1;
    const hop = gl.hop && t - gl.hop.t < 0.24 && i > 0 ? (t - gl.hop.t) / 0.24 : -1;
    if (hop >= 0) alpha = lerp(0.3, 1, P2OUT(hop));
    g.setTransform(S.m.multiply(new DOMMatrix([s, 0, 0, s, cx - s * cx, cy - s * cy])));
    g.globalAlpha = alpha;
    g.fillStyle = i === ci ? '#fff3ee' : C.ink;
    g.fillText(gl.ch, FX + xs[i], BASE);
    g.setTransform(S.m);
    g.globalAlpha = 1;
    // the final consonant that just left the previous syllable flies over to start this one (복 + ㅗ → 보 | 고)
    if (hop >= 0) {
      const pw = xs[i] - xs[i - 1];
      const x0 = FX + xs[i - 1] + pw * 0.5, y0 = BASE - 4, x1 = FX + xs[i] + w * 0.36, y1 = BASE - 0.5 * FS;
      const u = P3OUT(hop), x = lerp(x0, x1, u), y = lerp(y0, y1, u) - 46 * bell(u);
      g.globalAlpha = 1 - P2OUT(seg(hop, 0.7, 0.3));
      g.font = font(700, FS * 0.62); g.fillStyle = C.coral; g.textAlign = 'center';
      g.fillText(gl.hop.j, x, y + FS * 0.22);
      g.textAlign = 'left'; g.font = font(500, FS); g.globalAlpha = 1;
    }
  }
  // caret: solid while keys are coming, blinking once the hand stops (phase from the last key)
  if (!S.sel && !(S.hold && t - S.hold.t < 0.35)) {
    const idle = t - S.last;
    let a = 1;
    if (idle > 0.5) { const p = ((idle - 0.5) / 1.0) % 1; a = p < 0.5 ? 1 - smooth01(p / 0.1) : smooth01((p - 0.5) / 0.1); }
    if (a > 0) {
      const x = FX + xs[ci >= 0 ? ci + 1 : S.caret] + 3;
      g.globalAlpha = a; g.fillStyle = C.coral; rr(g, x, BASE - 49, 4.5, 62, 2.25); g.fill(); g.globalAlpha = 1;
    }
  }
  // selection handles
  if (S.sel) {
    const u = BACK(seg(t, S.sel.t + 0.04, 0.2));
    for (const i of [S.sel.a, S.sel.b]) {
      const x = FX + xs[i] + (i === S.sel.a ? -4 : 4);
      g.fillStyle = C.coral;
      g.fillRect(x - 1.5, BASE - 52, 3, 72 * u);
      g.beginPath(); g.arc(x, BASE + 30, 12 * u, 0, Math.PI * 2); g.fill();
    }
  }
  return xs;
}
const smooth01 = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

/** deleted text: jamo and syllables puff away; the selected-and-replaced words rise, get struck out, and wait */
function drawGhosts(g, t, S, motes = false) {
  g.font = font(500, FS);
  for (const gh of S.ghosts) {
    const a = t - gh.t;
    if (gh.kind !== 'mem') {
      if (a > 0.45 || motes) continue;
      const u = a / 0.45, cx = FX + gh.x + gh.w / 2;
      g.globalAlpha = 0.85 * (1 - u) * (1 - u);
      g.fillStyle = C.coral; g.textAlign = 'center';
      g.font = font(600, gh.kind === 'jamo' ? FS * 0.7 : FS);
      g.fillText(gh.ch, cx + (gh.kind === 'jamo' ? 10 : 0), BASE - 46 * P2OUT(u) - (gh.kind === 'jamo' ? 10 : 0));
      g.textAlign = 'left'; g.globalAlpha = 1;
      continue;
    }
    const lift = EXPO_OUT(seg(a, 0, 0.9));
    let x = FX + gh.x + gh.k * 6 * lift, y = BASE - 118 * lift + 3 * Math.sin(t * 1.7 + gh.k * 1.3) * lift;
    let alpha = lerp(1, 0.4, lift), rot = 0, sc = 1;
    let flare = 0;
    if (S.sent) {                         // the send: the struck-out words flare and come apart into motes
      const b = (t - S.sent.t - 0.1) / 0.8;
      if (b >= 1) continue;
      if (b > 0) {
        const e = P2OUT(b);
        x += (gh.k - 1) * 40 * e; y -= 50 * e; sc = 1 + 0.12 * e;
        flare = bell(clamp(b / 0.35));
        alpha = lerp(alpha, 0.95, flare) * (1 - seg(b, 0.15, 0.4));
        g.globalCompositeOperation = 'lighter';
        if (motes) for (const p of SCATTER) {
          const q = clamp((b - p.d) / (0.85 - p.d));
          if (q <= 0 || q >= 1) continue;
          const px = x + gh.w * p.x + p.vx * q, py = y - FS * 0.72 * p.y + p.vy * q - 30 * q * q;
          g.globalAlpha = 0.85 * (1 - q);
          g.fillStyle = p.warm ? C.coral : '#ffe6dc';
          g.beginPath(); g.arc(px, py, p.r * (1 - 0.6 * q), 0, Math.PI * 2); g.fill();
        }
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
      }
    }
    if (motes) continue;
    const cx = x + gh.w / 2, cy = y - 0.36 * FS;
    g.globalAlpha = alpha;
    g.setTransform(S.m.multiply(new DOMMatrix([Math.cos(rot) * sc, Math.sin(rot) * sc, -Math.sin(rot) * sc, Math.cos(rot) * sc, cx, cy])));
    // on its way up it still wears the selection colour, then fades to a pale ghost
    const hl = 1 - seg(a, 0, 0.3);
    if (hl > 0) { g.fillStyle = rgba(C.coralRGB, 0.36 * hl); g.fillRect(-gh.w / 2 - 1, -0.6 * FS, gh.w + 2, 70); }
    g.fillStyle = rgba(mix(mix(C.inkRGB, C.pale, lift), [255, 170, 150], flare));
    g.font = font(500, FS);
    g.fillText(gh.ch, -gh.w / 2, 0.36 * FS);
    const st = seg(a, 0.4 + 0.09 * gh.k, 0.12);       // a coral line strikes them out, glyph by glyph
    if (st > 0) { g.fillStyle = C.coral; g.fillRect(-gh.w / 2 - 2, -2, (gh.w + 4) * st, 4.5); }
    g.setTransform(S.m);
    g.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------ keyboard
function drawKeyboard(g, t, S) {
  g.fillStyle = C.kb; g.fillRect(SC.x0, KB.top, SC.x1 - SC.x0, SC.y1 - KB.top);
  g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(SC.x0, KB.top, SC.x1 - SC.x0, 2);
  // toolbar: language chip + collapse chevron
  g.fillStyle = 'rgba(255,255,255,0.07)'; rr(g, 190, 1024, 74, 40, 20); g.fill();
  g.fillStyle = C.muted; g.font = font(600, 22); g.textAlign = 'center'; g.fillText('한/A', 227, 1052);
  g.strokeStyle = C.muted; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(856, 1038); g.lineTo(868, 1050); g.lineTo(880, 1038); g.stroke(); g.lineCap = 'butt';
  const shiftOn = S.shift;
  for (const k of KEYCAPS) {
    const pt = S.press[k.id];
    const a = pt === undefined ? 9 : t - pt;
    const d = a >= 0 && a < 0.16 ? 1 - P2OUT(a / 0.16) : 0;
    let col = mix(k.fn ? C.keyFn : C.key, C.keyHi, d);
    if (k.id === '⇧' && shiftOn) col = [233, 236, 248];
    const y = k.y + 2 * d;
    g.fillStyle = 'rgba(3,5,18,0.6)'; rr(g, k.x, k.y + 4, k.w, k.h, 14); g.fill();
    g.fillStyle = rgba(col); rr(g, k.x, y, k.w, k.h, 14); g.fill();
    const cx = k.x + k.w / 2, cy = y + k.h / 2;
    g.fillStyle = C.ink; g.strokeStyle = C.ink;
    if (!k.fn && k.id !== '␣') {
      const lab = shiftOn && SHIFTED[k.id] ? SHIFTED[k.id] : k.id;
      g.font = font(500, KFS); g.fillText(lab, cx, cy + 14);
    } else if (k.id === '␣') {
      g.fillStyle = C.faint; g.font = font(500, 24); g.fillText('한국어', cx, cy + 9);
    } else if (k.id === '123') {
      g.font = font(600, 28); g.fillText('123', cx, cy + 10);
    } else if (k.id === '☺') {
      g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 17, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(cx, cy + 2, 9, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      g.beginPath(); g.arc(cx - 6, cy - 5, 2.4, 0, Math.PI * 2); g.arc(cx + 6, cy - 5, 2.4, 0, Math.PI * 2); g.fill();
    } else if (k.id === '⇧') {
      g.beginPath(); g.moveTo(cx, cy - 18); g.lineTo(cx + 17, cy); g.lineTo(cx + 8, cy); g.lineTo(cx + 8, cy + 15);
      g.lineTo(cx - 8, cy + 15); g.lineTo(cx - 8, cy); g.lineTo(cx - 17, cy); g.closePath();
      if (shiftOn) { g.fillStyle = '#1a2040'; g.fill(); } else { g.lineWidth = 3; g.lineJoin = 'round'; g.stroke(); g.lineJoin = 'miter'; }
    } else if (k.id === '⌫') {
      g.lineWidth = 3; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(cx - 24, cy); g.lineTo(cx - 12, cy - 15); g.lineTo(cx + 22, cy - 15); g.lineTo(cx + 22, cy + 15); g.lineTo(cx - 12, cy + 15); g.closePath(); g.stroke();
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx - 2, cy - 7); g.lineTo(cx + 12, cy + 7); g.moveTo(cx + 12, cy - 7); g.lineTo(cx - 2, cy + 7); g.stroke();
      g.lineCap = 'butt'; g.lineJoin = 'miter';
    } else if (k.id === '⏎') {
      g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(cx + 16, cy - 14); g.lineTo(cx + 16, cy + 4); g.lineTo(cx - 14, cy + 4); g.stroke();
      g.beginPath(); g.moveTo(cx - 6, cy - 4); g.lineTo(cx - 15, cy + 4); g.lineTo(cx - 6, cy + 12); g.stroke();
      g.lineCap = 'butt'; g.lineJoin = 'miter';
    }
    if (k.id === '.') { g.font = font(600, 36); g.fillText('.', cx, cy + 10); }
  }
  g.textAlign = 'left';
}
/** the key preview balloon above the key just pressed (jamo keys only) */
function drawKeyPopup(g, t, S) {
  const tp = S.tap;
  if (!tp || !tp.j) return;
  const a = t - tp.t;
  if (a < 0 || a > 0.15) return;
  const k = KEYCAPS.find((c) => c.id === tp.k);
  const u = 1 - seg(a, 0.11, 0.04);
  const pw = 96, phh = 124, cx = k.x + k.w / 2;
  const bx = clamp(cx - pw / 2, SC.x0 + 4, SC.x1 - pw - 4), by = k.y - phh + 6;
  g.globalAlpha = u;
  g.fillStyle = 'rgba(2,4,16,0.45)'; rr(g, bx + 2, by + 6, pw, phh, 18); g.fill();
  g.fillStyle = '#56618f';
  rr(g, bx, by, pw, phh, 18); g.fill();
  rr(g, k.x, k.y + 10, k.w, k.h - 10, 14); g.fill();
  g.fillRect(k.x, by + phh - 20, k.w, 30);
  g.fillStyle = '#fff'; g.font = font(600, 66); g.textAlign = 'center';
  g.fillText(tp.j, bx + pw / 2, by + 84);
  g.textAlign = 'left'; g.globalAlpha = 1;
}

// ------------------------------------------------------------------ the send
/** the sent line: text lifts out of the field, a bubble grows round it, it flies up and lands in the conversation */
function flight(S, u) {
  const text = S.sent.text, k1 = BFS / FS;
  const tw = measF(text);
  const w1 = tw * k1 + 2 * BPX, x1 = 884 - w1 + BPX, y1 = 662 + BBASE;
  const ux = P3OUT(clamp(u / 0.85)), uy = BACK14(clamp(u)), uk = P3OUT(clamp(u));
  return { tx: lerp(FX, x1, ux), ty: lerp(BASE, y1, uy), k: lerp(1, k1, uk), tw, fill: seg(u, 0, 0.22), rot: -0.07 * bell(clamp(u * 1.15)),
    sq: 0.1 * bell(clamp(u * 1.4)) };
}
function drawFlightBubble(g, S, f, alpha, ghost = false) {
  const { tx, ty, k, tw } = f;
  const m = S.m.multiply(new DOMMatrix([1, 0, 0, 1, tx, ty])).rotate(0, 0, f.rot * 180 / Math.PI).scale(k * (1 - f.sq * 0.5), k * (1 + f.sq));
  g.setTransform(m);
  g.globalAlpha = alpha;
  const px = BPX / k;
  if (ghost) g.globalCompositeOperation = 'lighter';
  if (f.fill > 0) {
    g.globalAlpha = alpha * f.fill;
    rr4(g, -px, -BBASE / k, tw + 2 * px, BH / k, 34 / k, 34 / k, 10 / k, 34 / k);
    g.fillStyle = C.coral; g.fill();
    g.globalAlpha = alpha;
  }
  if (!ghost) { g.font = font(500, FS); g.fillStyle = rgba(mix(C.inkRGB, [255, 255, 255], f.fill)); g.fillText(S.sent.text, 0, 0); }
  g.setTransform(S.m); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawSendFx(g, t, S) {
  const a = t - T_SEND;
  if (a < 0 || a > 0.9) return;
  g.globalCompositeOperation = 'lighter';
  // flash at the button (≤ 0.35)
  const fl = 0.32 * Math.exp(-a * 7);
  let rg = g.createRadialGradient(SEND.x, SEND.y, 10, SEND.x, SEND.y, 420);
  rg.addColorStop(0, rgba([255, 170, 140], fl)); rg.addColorStop(1, rgba([255, 120, 90], 0));
  g.fillStyle = rg; g.fillRect(SEND.x - 420, SEND.y - 420, 840, 840);
  // two rings
  for (const [d, wdt, pk] of [[0, 4, 0.9], [0.1, 2, 0.55]]) {
    const q = seg(a, d, 0.7);
    if (q <= 0 || q >= 1) continue;
    g.strokeStyle = rgba(C.coralRGB, pk * (1 - q)); g.lineWidth = wdt * (1 - 0.5 * q);
    g.beginPath(); g.arc(SEND.x, SEND.y, lerp(SEND.r, 190, EXPO_OUT(q)), 0, Math.PI * 2); g.stroke();
  }
  // sparks (closed form: x = x0 + v(1 − e^{−kτ})/k)
  g.lineCap = 'round';
  for (const p of SPARKS) {
    const q = a / p.life;
    if (q <= 0 || q >= 1) continue;
    const e = (1 - Math.exp(-p.k * a)) / p.k, e2 = (1 - Math.exp(-p.k * Math.max(0, a - 0.035))) / p.k;
    g.strokeStyle = p.warm ? rgba([255, 160, 120], 1 - q) : rgba([255, 240, 230], 1 - q);
    g.lineWidth = p.w * (1 - q * 0.6);
    g.beginPath(); g.moveTo(SEND.x + p.vx * e2, SEND.y + p.vy * e2); g.lineTo(SEND.x + p.vx * e, SEND.y + p.vy * e); g.stroke();
  }
  g.lineCap = 'butt';
  g.globalCompositeOperation = 'source-over';
}

// ------------------------------------------------------------------ the phone
function drawInputRow(g, t, S) {
  // + button
  g.strokeStyle = C.muted; g.lineWidth = 3.4; g.lineCap = 'round';
  g.beginPath(); g.arc(206, 938, 26, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(206, 926); g.lineTo(206, 950); g.moveTo(194, 938); g.lineTo(218, 938); g.stroke(); g.lineCap = 'butt';
  // field
  g.fillStyle = '#1b2244'; rr(g, FIELD.x, FIELD.y, FIELD.w, FIELD.h, FIELD.h / 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 2; g.stroke();
  const empty = S.glyphs.length === 0 && !S.comp;
  if (empty) {
    const pa = S.sent ? seg(t, S.sent.t + 0.3, 0.3) : 1;
    if (pa > 0) { g.globalAlpha = pa; g.fillStyle = C.faint; g.font = font(500, 40); g.fillText('메시지 입력', FX + 10, BASE - 6); g.globalAlpha = 1; }
  }
  g.save();
  rr(g, FIELD.x, FIELD.y - 200, FIELD.w, FIELD.h + 260, 30); g.clip();
  drawLine(g, t, S);
  g.restore();
  // send button: grey when empty, coral when there is something to send; pressed at the send
  const on = S.filled !== null ? P2OUT(seg(t, S.filled, 0.18)) : S.sent ? 1 - seg(t, S.sent.t + 0.1, 0.3) : 0;
  const pop = S.filled !== null ? 1 + 0.18 * bell(seg(t, S.filled, 0.25)) : 1;
  const press = S.press.SEND !== undefined ? 1 - 0.14 * bell(seg(t, S.press.SEND, 0.22)) : 1;
  const r = SEND.r * pop * press;
  g.fillStyle = rgba(mix([40, 48, 84], C.coralRGB, on)); g.beginPath(); g.arc(SEND.x, SEND.y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = rgba(mix([110, 120, 160], [255, 255, 255], on)); g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round';
  const s = r / SEND.r;
  g.beginPath(); g.moveTo(SEND.x, SEND.y + 16 * s); g.lineTo(SEND.x, SEND.y - 15 * s);
  g.moveTo(SEND.x - 13 * s, SEND.y - 3 * s); g.lineTo(SEND.x, SEND.y - 16 * s); g.lineTo(SEND.x + 13 * s, SEND.y - 3 * s); g.stroke();
  g.lineCap = 'butt'; g.lineJoin = 'miter';
}
function drawSelectionUi(g, t, S) {
  // the long press: a soft touch spot swelling under the finger
  if (S.hold) {
    const a = t - S.hold.t;
    if (a < 0.55) {
      const xs = layout(display(S));
      const x = FX + (xs[Math.min(S.hold.a, xs.length - 1)] + xs[Math.min(S.hold.b, xs.length - 1)]) / 2;
      const grow = P2OUT(seg(a, 0, 0.35)), fade = 1 - seg(a, 0.35, 0.2);
      g.fillStyle = `rgba(255,255,255,${(0.16 * fade).toFixed(3)})`;
      g.beginPath(); g.arc(x, BASE - 20, 16 + 56 * grow, 0, Math.PI * 2); g.fill();
    }
  }
  // the little edit menu over the selection (pops with the selection, gone with the first key that replaces it)
  let sel = S.sel, xs, u;
  if (sel) { xs = layout(display(S)); u = BACK(seg(t, sel.t + 0.06, 0.22)); }
  else if (S.selGone && t - S.selGone.end < 0.12) { sel = S.selGone; xs = sel.xs; u = 1 - seg(t, sel.end, 0.12); }
  if (!sel || u <= 0) return;
  const items = ['잘라내기', '복사', '붙여넣기'];
  g.font = font(500, 25);
  const ws = items.map((s) => measB(s) * 25 / BFS);
  const tw = ws.reduce((a, b) => a + b, 0) + 2 * 34 + 2 * 26;
  const mx = FX + (xs[sel.a] + xs[sel.b]) / 2;
  const x = clamp(mx - tw / 2, SC.x0 + 20, SC.x1 - tw - 20), y = FIELD.y - 92;
  g.save();
  g.translate(mx, y + 66); g.scale(u, u); g.translate(-mx, -(y + 66));
  g.fillStyle = 'rgba(2,4,16,0.5)'; rr(g, x + 2, y + 6, tw, 64, 18); g.fill();
  g.fillStyle = '#2f3863'; rr(g, x, y, tw, 64, 18); g.fill();
  let cx = x + 26;
  items.forEach((s, i) => {
    g.fillStyle = C.ink; g.fillText(s, cx, y + 41);
    cx += ws[i] + 34;
    if (i < 2) { g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(cx - 18, y + 18, 2, 28); }
  });
  g.restore();
}
function drawChat(g, t, S) {
  chip(g, '8월 31일', 312);
  staticBubble(g, 'them', '잘 지내.', 360, '오후 11:48');
  staticBubble(g, 'me', '응. 너도.', 464, '오후 11:52');
  chip(g, '오늘', 600);
  // after landing: time, then 읽음
  if (S.sent && t >= T_LAND) {
    const f = flight(S, 1), bx = 884 - (f.tw * f.k + 2 * BPX);
    g.font = font(500, 21); g.textAlign = 'right';
    g.globalAlpha = seg(t, T_LAND, 0.2); g.fillStyle = C.faint; g.fillText('오전 1:12', bx - 12, 662 + BH - 6);
    const ra = P2OUT(seg(t, T_READ, 0.3));
    if (ra > 0) { g.globalAlpha = ra; g.fillStyle = C.coral; g.font = font(600, 21); g.fillText('읽음', bx - 12, 662 + BH - 34 + 8 * (1 - ra)); }
    g.globalAlpha = 1; g.textAlign = 'left';
    // a warm afterglow behind the landed bubble
    const gl = 0.5 * Math.exp(-(t - T_LAND) * 3);
    if (gl > 0.01) {
      g.globalCompositeOperation = 'lighter';
      const cx = 884 - (f.tw * f.k + 2 * BPX) / 2, cy = 662 + BH / 2;
      const rg = g.createRadialGradient(cx, cy, 20, cx, cy, 300);
      rg.addColorStop(0, rgba([255, 140, 110], gl * 0.5)); rg.addColorStop(1, rgba([255, 140, 110], 0));
      g.fillStyle = rg; g.fillRect(cx - 300, cy - 300, 600, 600);
      g.globalCompositeOperation = 'source-over';
    }
  }
  // the other side: typing dots, then the reply grows out of them
  if (t >= T_TYPING) {
    const top = 776, pop = BACK(seg(t, T_TYPING, 0.25));
    const rw = measB('나도.') + 2 * BPX, k = BACK14(seg(t, T_REPLY, 0.26));
    const w = lerp(124, rw, k), h = BH;
    g.save();
    g.translate(196, top + h); g.scale(pop, pop); g.translate(-196, -(top + h));
    bubble(g, 'them', 196, top, w, h, C.them);
    const da = 1 - seg(t, T_REPLY, 0.08);
    if (da > 0) {
      for (let i = 0; i < 3; i++) {
        const ph = (t - T_TYPING) * 2 * Math.PI * 1.5 - i * 0.9;
        const b = Math.max(0, Math.sin(ph));
        g.fillStyle = rgba(mix([120, 130, 170], C.inkRGB, b), da);
        g.beginPath(); g.arc(196 + 38 + i * 24, top + h / 2 - 7 * b, 7, 0, Math.PI * 2); g.fill();
      }
    }
    const ta = seg(t, T_REPLY + 0.06, 0.18);
    if (ta > 0) {
      g.globalAlpha = ta; g.fillStyle = C.ink; g.font = font(500, BFS);
      g.fillText('나도.', 196 + BPX, top + BBASE + 6 * (1 - ta));
      g.globalAlpha = 1;
      g.font = font(500, 21); g.fillStyle = C.faint; g.globalAlpha = ta;
      g.fillText('오전 1:13', 196 + w + 12, top + BH - 6); g.globalAlpha = 1;
    }
    g.restore();
  }
}
function drawPhone(g, t, S, cam) {
  applyCam(g, cam, 1);
  S.m = g.getTransform();
  const w = warmth(t);
  // shadow and glow around the body
  g.globalAlpha = 0.75; g.drawImage(SPR.shadow, PH.x0 - 120 + 26, PH.y0 - 120 + 60);
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.34 * (1 - w); g.drawImage(SPR.glowC, PH.x0 - 160, PH.y0 - 160);
  g.globalAlpha = 0.34 * w; g.drawImage(SPR.glowW, PH.x0 - 160, PH.y0 - 160);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  // body
  let lg = g.createLinearGradient(PH.x0, 0, PH.x1, 0);
  lg.addColorStop(0, '#2c3256'); lg.addColorStop(0.08, '#1a1f3a'); lg.addColorStop(0.92, '#1a1f3a'); lg.addColorStop(1, '#2c3256');
  g.fillStyle = lg; rr(g, PH.x0, PH.y0, PH.x1 - PH.x0, PH.y1 - PH.y0, PH.r); g.fill();
  g.strokeStyle = 'rgba(170,185,255,0.16)'; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = '#2a3052';
  rr(g, PH.x1 - 2, 380, 9, 100, 4); g.fill(); rr(g, PH.x0 - 7, 330, 9, 70, 4); g.fill(); rr(g, PH.x0 - 7, 420, 9, 110, 4); g.fill();
  g.fillStyle = '#04060f'; rr(g, PH.x0 + 9, PH.y0 + 9, PH.x1 - PH.x0 - 18, PH.y1 - PH.y0 - 18, PH.r - 9); g.fill();
  // screen
  g.save();
  rr(g, SC.x0, SC.y0, SC.x1 - SC.x0, SC.y1 - SC.y0, SC.r); g.clip();
  lg = g.createLinearGradient(0, SC.y0, 0, SC.y1);
  lg.addColorStop(0, '#111839'); lg.addColorStop(0.55, '#0d1331'); lg.addColorStop(1, '#0b112b');
  g.fillStyle = lg; g.fillRect(SC.x0, SC.y0, SC.x1 - SC.x0, SC.y1 - SC.y0);
  drawStatus(g);
  drawHeader(g, t);
  g.save(); g.beginPath(); g.rect(SC.x0, 264, SC.x1 - SC.x0, 620); g.clip();
  drawChat(g, t, S);
  g.restore();
  drawInputRow(g, t, S);
  const ghosts = (motes) => { g.save(); g.beginPath(); g.rect(SC.x0, 264, SC.x1 - SC.x0, KB.top - 264); g.clip(); drawGhosts(g, t, S, motes); g.restore(); };
  ghosts(false);
  drawKeyboard(g, t, S);
  drawKeyPopup(g, t, S);
  drawSelectionUi(g, t, S);
  drawSendFx(g, t, S);
  if (S.sent) {
    const u = (t - S.sent.t) / FLY;
    for (let i = 3; i >= 1; i--) {                 // a short echo trail while it travels
      const ue = u - 0.07 * i;
      if (ue > 0 && u < 1) drawFlightBubble(g, S, flight(S, ue), 0.2 * (1 - i / 4) * (1 - u), true);
    }
    drawFlightBubble(g, S, flight(S, Math.min(u, 1)), 1);
    ghosts(true);
  }
  // glass: a faint diagonal sheen
  g.globalCompositeOperation = 'lighter';
  lg = g.createLinearGradient(SC.x0, SC.y0, SC.x1, SC.y0 + 900);
  lg.addColorStop(0, 'rgba(160,180,255,0)'); lg.addColorStop(0.42, 'rgba(160,180,255,0.035)'); lg.addColorStop(0.5, 'rgba(160,180,255,0.06)');
  lg.addColorStop(0.58, 'rgba(160,180,255,0.02)'); lg.addColorStop(1, 'rgba(160,180,255,0)');
  g.fillStyle = lg; g.fillRect(SC.x0, SC.y0, SC.x1 - SC.x0, SC.y1 - SC.y0);
  g.globalCompositeOperation = 'source-over';
  g.restore();
}

function draw(t) {
  const g = G;
  resetCtx(g);
  const S = editorAt(t);
  const cam = camAt(t);
  drawRoom(g, t, cam);
  drawPhone(g, t, S, cam);
  resetCtx(g);
  applyCam(g, cam, 1.35);
  g.globalCompositeOperation = 'lighter';
  for (const b of FORE) {
    const x = b.x + b.ax * Math.sin(t * b.f + b.ph), y = b.y - b.v * t;
    g.globalAlpha = b.a * (0.7 + 0.3 * Math.sin(t * b.f * 1.7 + b.ph));
    g.drawImage(SPR.bokeh, x - b.r, y - b.r, 2 * b.r, 2 * b.r);
  }
  resetCtx(g);
  // vignette
  const rg = g.createRadialGradient(540, 900, 420, 540, 960, 1250);
  rg.addColorStop(0, 'rgba(2,3,12,0)'); rg.addColorStop(1, 'rgba(2,3,12,0.62)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // the caption band at the bottom stays dark
  const lg = g.createLinearGradient(0, 1560, 0, H);
  lg.addColorStop(0, 'rgba(3,4,14,0)'); lg.addColorStop(1, 'rgba(3,4,14,0.55)');
  g.fillStyle = lg; g.fillRect(0, 1560, W, H - 1560);
  // open from dark
  const fade = 1 - P2OUT(seg(t, 0, 0.5));
  if (fade > 0) { g.fillStyle = `rgba(2,3,10,${(0.7 * fade).toFixed(3)})`; g.fillRect(0, 0, W, H); }
}

defineDemo({
  id: '106-ime-compose',
  title: '보내기 전에',
  tech: '조합되는 한글 · 입력기 조합 + 쓰고 지우는 문장',
  duration: D,
  background: '#05071a',
  async setup(api) {
    HEADLESS = api.headless;
    const text = '1:12서진입력 중…8월 31일잘 지내.응. 너도.오늘오전 1:12읽음나도.오후 11:48오후 11:52 메시지 입력잘라내기복사붙여넣기한/A123한국어'
      + 'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡㅃㅉㄸㄲㅆㅒㅖ너진짜무해뭏넘보복고싶았어었아ㅇ';
    for (const w of [500, 600, 700]) await fontReady(font(w, 40), text);
    const c = api.canvas({ type: '2d', z: 0, attrs: HEADLESS ? { willReadFrequently: true } : undefined });
    G = c.ctx;
    MF = mk(8, 8).g; MF.font = font(500, FS);
    MB = mk(8, 8).g; MB.font = font(500, BFS);
    buildKeys();
    SPR.far = bakeFar();
    SPR.near = bakeNear();
    SPR.shadow = bakeHalo('rgba(0,0,8,0.9)', 38, 120);
    SPR.glowC = bakeHalo('rgb(110,140,255)', 60, 160);
    SPR.glowW = bakeHalo('rgb(255,130,100)', 60, 160);
    { const { c: d, g: dg } = mk(32, 32);
      const rg = dg.createRadialGradient(16, 16, 0, 16, 16, 16);
      rg.addColorStop(0, 'rgba(200,215,255,1)'); rg.addColorStop(0.35, 'rgba(200,215,255,0.45)'); rg.addColorStop(1, 'rgba(200,215,255,0)');
      dg.fillStyle = rg; dg.fillRect(0, 0, 32, 32); SPR.dot = d; }
    { const r = rand(10602);
      DUST = Array.from({ length: 34 }, () => ({ x: -60 + r() * 1200, y: r() * 2100, v: 6 + 18 * r(), ax: 10 + 30 * r(), ay: 6 + 14 * r(),
        f: 0.3 + 0.8 * r(), ph: r() * 6.283, r: 1.2 + 2.6 * r() * r(), a: 0.15 + 0.4 * r() })); }
    { const { c: d, g: dg } = mk(128, 128);
      const rg = dg.createRadialGradient(64, 64, 40, 64, 64, 64);
      rg.addColorStop(0, 'rgba(170,190,255,0.55)'); rg.addColorStop(0.8, 'rgba(170,190,255,0.42)'); rg.addColorStop(1, 'rgba(170,190,255,0)');
      dg.fillStyle = rg; dg.fillRect(0, 0, 128, 128); SPR.bokeh = d; }
    { const r = rand(10605);
      FORE = Array.from({ length: 9 }, () => ({ x: -100 + r() * 1280, y: 200 + r() * 1700, r: 30 + 60 * r(), v: 4 + 10 * r(), ax: 20 + 30 * r(),
        f: 0.2 + 0.4 * r(), ph: r() * 6.283, a: 0.05 + 0.08 * r() })); }
    { const r = rand(10603);
      SPARKS = Array.from({ length: 16 }, () => {
        const ang = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5, sp = 500 + 700 * r();
        return { vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, k: 5 + 3 * r(), life: 0.35 + 0.35 * r(), w: 2.5 + 3 * r(), warm: r() < 0.6 };
      }); }
    { const r = rand(10604);
      SCATTER = Array.from({ length: 14 }, () => ({ x: r(), y: r(), vx: (r() - 0.5) * 220, vy: -60 - 170 * r(), d: 0.08 + 0.2 * r(), r: 2 + 3.5 * r(), warm: r() < 0.6 })); }
    // grain over everything (moves in steps of 1/12 s)
    const gr = document.createElement('canvas'); gr.width = W + 64; gr.height = H + 64;
    gr.style.cssText = `position:absolute;left:0;top:0;width:${W + 64}px;height:${H + 64}px;z-index:4;pointer-events:none;opacity:.10;mix-blend-mode:overlay`;
    { const gg = gr.getContext('2d'), img = gg.createImageData(gr.width, gr.height), r = rand(10699);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.floor(r() * 256); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      gg.putImageData(img, 0, 0); }
    api.stage.appendChild(gr);
    this.grain = gr;
    // warm-up: every sprite composited once before the first real frame
    for (const x of [0.2, 2.0, 3.5, 4.1, 6.05, 7.5, 8.8, 9.5]) draw(x);
  },
  frame(t) {
    draw(t);
    const q = Math.floor(t * 12);
    this.grain.style.transform = `translate(${-((q * 37) % 64)}px, ${-((q * 23 + 11) % 64)}px)`;
  },
});
