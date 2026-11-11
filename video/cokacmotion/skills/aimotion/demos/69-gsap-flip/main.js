/*
 * 69 · 다시 놓이는 것들 — the 24 solar terms (24절기) as catalogue cards, laid out five times:
 * a 6 × 4 grid (one row per season) → a year wheel (입춘 at twelve o'clock, clockwise) → a single timeline row
 * that follows the sun's height and scrolls through the year → four seasonal piles → 입춘 is lifted out while the
 * other 23 tuck into an index strip, and the card opens into a full catalogue page (nested shared-element morph).
 *
 * Every layout is a real CSS layout state of the same deck (grid, absolute + rotate, flex row + relative offsets,
 * grid cells stacked with transforms, flex strip). In setup the deck takes each layout class in turn and
 * Flip.getState() records every card. Back in the base layout (the grid), Flip.fit(card, state, { getVars: true,
 * scale: true }) turns each recorded state into the transform that puts the card there — x, y, rotation, skewX,
 * scaleX, scaleY relative to the base — without touching the DOM for good. The master timeline (paused) is built
 * from fromTo tweens between those var sets, staggered per card; the expanding page's parts get their start
 * transforms the same way (Flip.fit of each part onto the small card's part). frame(t) only seeks: tl.time(t).
 */
import { defineDemo } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { Flip } from '../node_modules/gsap/Flip.js';

gsap.registerPlugin(Flip);

const D = 10;
// beats of the piece (s)
const T = { enter: 0.1, wheel: 1.6, row: 3.3, scroll: 3.9, scrollEnd: 5.8, stack: 5.8, lift: 7.2, open: 7.95, info: 8.65, seal: 9.05 };
const PAPER = '#efece6', CARD = '#fbfaf7', INK = '#1d1c1a', SEAL = '#c4432c';
const ink = (a) => `rgba(29,28,26,${a})`;
const M = 72;
const BAND = 1672;                                   // solid ink band under the harness caption
const KR = `"${FONTS.pretendard.family}"`, MJ = `"${FONTS.notoSerifKR.family}"`;

// ---------------------------------------------------------------- the 24 solar terms
// name, hanja, month, day (Gregorian, approximate), ecliptic longitude (°), swatch, motif
const TERMS = [
  ['입춘', '立春', 2, 4, 315, '#e4e3c1', 'sprout'], ['우수', '雨水', 2, 19, 330, '#cbd8d2', 'rain'],
  ['경칩', '驚蟄', 3, 6, 345, '#bccf9c', 'spark'], ['춘분', '春分', 3, 21, 0, '#f1cbc2', 'equinoxA'],
  ['청명', '淸明', 4, 5, 15, '#aecfdc', 'sun'], ['곡우', '穀雨', 4, 20, 30, '#93b48d', 'grainRain'],
  ['입하', '立夏', 5, 6, 45, '#78ab72', 'leaf'], ['소만', '小滿', 5, 21, 60, '#cfc774', 'ear'],
  ['망종', '芒種', 6, 6, 75, '#5f9160', 'rows'], ['하지', '夏至', 6, 21, 90, '#f0c04f', 'solstice'],
  ['소서', '小暑', 7, 7, 105, '#e59d5c', 'waves'], ['대서', '大暑', 7, 23, 120, '#d8673d', 'heat'],
  ['입추', '立秋', 8, 8, 135, '#cba35d', 'fall'], ['처서', '處暑', 8, 23, 150, '#bca684', 'wind'],
  ['백로', '白露', 9, 8, 165, '#deddd3', 'dew'], ['추분', '秋分', 9, 23, 180, '#b8683f', 'equinoxB'],
  ['한로', '寒露', 10, 8, 195, '#8f6c5d', 'coldDew'], ['상강', '霜降', 10, 23, 210, '#aab3b9', 'frost'],
  ['입동', '立冬', 11, 7, 225, '#8b9ba7', 'branch'], ['소설', '小雪', 11, 22, 240, '#cad4db', 'snowLight'],
  ['대설', '大雪', 12, 7, 255, '#edf0f1', 'snowflake'], ['동지', '冬至', 12, 22, 270, '#2f3b50', 'moon'],
  ['소한', '小寒', 1, 5, 285, '#5f7487', 'ice'], ['대한', '大寒', 1, 20, 300, '#414d59', 'cold'],
].map(([name, hanja, mon, day, lon, color, motif], i) => ({ name, hanja, mon, day, lon, color, motif, i, s: Math.floor(i / 6), k: i % 6 }));
const SEASONS = [['봄', '春'], ['여름', '夏'], ['가을', '秋'], ['겨울', '冬']];

// ---------------------------------------------------------------- motifs: 48 × 48, stroked in currentColor
const drop = (x, y, s = 1) => `<path d="M${x} ${y - 6 * s}c${2.6 * s} ${3.4 * s} ${4 * s} ${5.4 * s} ${4 * s} ${7.2 * s}a${4 * s} ${4 * s} 0 0 1-${8 * s} 0c0-${1.8 * s} ${1.4 * s}-${3.8 * s} ${4 * s}-${7.2 * s}z"/>`;
const rays = (n, r1, r2) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  return `<path d="M${(24 + r1 * c).toFixed(1)} ${(24 + r1 * s).toFixed(1)}L${(24 + r2 * c).toFixed(1)} ${(24 + r2 * s).toFixed(1)}"/>`;
}).join('');
const dot = (x, y, r = 2.3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const grain = (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="2.8" ry="5.2" transform="rotate(${a} ${x} ${y})"/>`;
const MOTIF = {
  sprout: '<path d="M24 42V24"/><path d="M24 30c-7.5 0-11.5-4.6-11.5-11.5 7.5 0 11.5 4.6 11.5 11.5z"/><path d="M24 25c0-7.5 4.6-12 11.5-12 0 7.4-4.6 12-11.5 12z"/><path d="M13 42h22"/>',
  rain: drop(15, 15) + drop(32, 19) + drop(22, 33),
  spark: '<path d="M27 6 16 26h9l-4 16 13-22h-9z"/>',
  equinoxA: '<circle cx="24" cy="24" r="14"/><path d="M24 10a14 14 0 0 0 0 28z" fill="currentColor"/>',
  sun: '<circle cx="24" cy="24" r="6.5"/>' + rays(8, 11, 17),
  grainRain: drop(16, 13, 0.8) + drop(32, 13, 0.8) + '<path d="M10 39h28M16 39v-9M24 39v-12M32 39v-9"/>',
  leaf: '<path d="M11 37C11 21 21 11 37 11c0 16-10 26-26 26z"/><path d="M11 37 29 19"/>',
  ear: '<path d="M24 43V11"/>' + grain(19.5, 17, -28) + grain(28.5, 17, 28) + grain(19.5, 26, -28) + grain(28.5, 26, 28) + grain(24, 9.5, 0),
  rows: '<path d="M8 40h32M14 40v-8M24 40v-12M34 40v-8"/>' + dot(14, 26.5) + dot(24, 22.5) + dot(34, 26.5),
  solstice: '<circle cx="24" cy="24" r="9" fill="currentColor"/><circle cx="24" cy="24" r="16"/>',
  waves: '<path d="M7 17c4-4 8-4 12 0s8 4 12 0 6-3 10-2M7 25c4-4 8-4 12 0s8 4 12 0 6-3 10-2M7 33c4-4 8-4 12 0s8 4 12 0 6-3 10-2"/>',
  heat: '<path d="M16 41c-4-5 4-9 0-14s4-9 0-14M24 41c-4-5 4-9 0-14s4-9 0-14M32 41c-4-5 4-9 0-14s4-9 0-14"/>',
  fall: '<path d="M15 33C15 21 22 14 34 14c0 12-7 19-19 19z"/><path d="M15 33l9-9M15 33l-5 7"/><path d="M33 34l4 4M37 30l3 2"/>',
  wind: '<path d="M8 18h21a5 5 0 1 0-5-5M8 26h31M8 34h17a5 5 0 1 1-5 5"/>',
  dew: drop(24, 23, 2.1),
  equinoxB: '<circle cx="24" cy="24" r="14"/><path d="M24 10a14 14 0 0 1 0 28z" fill="currentColor"/>',
  coldDew: drop(24, 20, 1.7) + '<path d="M13 41h22"/>',
  frost: '<path d="M24 9v30M11 16.5l26 15M11 31.5l26-15"/>' + dot(24, 24, 3),
  branch: '<path d="M24 43V11M24 31l-9-9M24 24l8-8M24 37l7-6"/>',
  snowLight: dot(14, 14) + dot(30, 11) + dot(22, 24) + dot(37, 27) + dot(12, 34) + dot(28, 38),
  snowflake: '<path d="M24 8v32M10.1 16l27.8 16M10.1 32l27.8-16"/><path d="M19.5 11.5 24 15l4.5-3.5M19.5 36.5 24 33l4.5 3.5"/>',
  moon: '<path d="M24 9A15 15 0 0 0 24 39A20 20 0 0 1 24 9z" fill="currentColor"/>',
  ice: '<path d="M24 8l14 8v16l-14 8-14-8V16z"/><path d="M24 8v32M10 16l28 16"/>',
  cold: '<path d="M21 30V11a3 3 0 0 1 6 0v19"/><circle cx="24" cy="35" r="6"/><path d="M33 13h6M33 19h6M33 25h6"/>',
};
const svg = (cls, motif, sw) => `<svg class="${cls}" viewBox="0 0 48 48" style="stroke-width:${sw}">${MOTIF[motif]}</svg>`;
const fgOn = (hex) => {
  const n = parseInt(hex.slice(1), 16), L = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return L < 0.5 ? 'rgba(255,255,255,.88)' : ink(0.72);
};

// ---------------------------------------------------------------- layouts: real CSS states of one deck
const WHEEL = { cx: 540, cy: 900, r: 360, w: 84 };   // card centres on a circle, card tops pointing outward
const ROW = { w: 132, gap: 20, top: 812, amp: 110 }; // flex row; each card raised by the sun's height sin(longitude)
const CSS = `
.f69 { position:absolute; inset:0; pointer-events:none; }
.f69 .deck { position:absolute; left:0; top:0; width:1080px; height:1920px; box-sizing:border-box; transform-origin:${WHEEL.cx}px ${WHEEL.cy}px; }
.f69 .card { position:relative; z-index:0; box-sizing:border-box; width:144px; aspect-ratio:3/4; flex:none; align-self:start; justify-self:start;
  background:${CARD}; border-radius:4px; overflow:hidden; box-shadow:0 0 0 1px ${ink(0.07)}, 0 12px 24px -16px rgba(50,40,30,.5); }
.f69 .sw { position:absolute; left:0; top:0; width:100%; height:62%; background:var(--c); }
.f69 .ix { position:absolute; left:9px; top:8px; font:600 10.5px/1 ${KR}; letter-spacing:.1em; color:var(--fg); }
.f69 .mo { position:absolute; left:49px; top:36.5px; width:46px; height:46px; color:var(--fg); }
.f69 svg.mo, .f69 svg.dmo { fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; overflow:visible; }
.f69 .nm { position:absolute; left:11px; top:9px; font:700 21px/1.15 ${MJ}; color:${INK}; white-space:nowrap; }
.f69 .hj { position:absolute; right:11px; top:13px; font:400 13px/1.15 ${MJ}; color:${ink(0.5)}; white-space:nowrap; }
.f69 .dt { position:absolute; left:11px; bottom:9px; font:500 11px/1 ${KR}; letter-spacing:.04em; color:${ink(0.5)}; font-variant-numeric:tabular-nums; }
.f69 .lb { position:absolute; left:0; right:0; top:62%; bottom:0; }

.f69 .deck.L-grid  { display:grid; grid-template-columns:repeat(6,144px); column-gap:14px; row-gap:58px; padding:420px 0 0 73px; align-content:start; }
.f69 .deck.L-wheel .card { position:absolute; left:${WHEEL.cx - WHEEL.w / 2}px; top:${WHEEL.cy - (WHEEL.w * 4) / 6}px; width:${WHEEL.w}px;
  transform:rotate(var(--a)) translateY(-${WHEEL.r}px); }
.f69 .deck.L-row   { display:flex; align-items:flex-start; column-gap:${ROW.gap}px; padding:${ROW.top}px 0 0 ${M}px; }
.f69 .deck.L-row .card { width:${ROW.w}px; top:var(--alt); }
.f69 .deck.L-stack { display:grid; grid-template-columns:216px 216px; grid-template-rows:288px 288px; column-gap:264px; row-gap:226px;
  padding:576px 0 0 192px; align-content:start; }
.f69 .deck.L-stack .card { width:216px; grid-row:var(--gr); grid-column:var(--gc);
  transform:translate(calc(var(--k) * 9px), calc(var(--k) * -10px)) rotate(calc((var(--k) - 2.5) * 2.4deg)); }
.f69 .deck.L-strip { display:flex; align-items:flex-start; column-gap:7px; padding:1536px 0 0 99.5px; }
.f69 .deck.L-strip .card { width:30px; }
.f69 .deco { position:absolute; left:0; top:0; overflow:visible; }
`;

defineDemo({
  id: '69-gsap-flip',
  title: '다시 놓이는 것들',
  tech: 'GSAP Flip · FLIP 레이아웃 전환 · CSS 그리드/플렉스',
  duration: D,
  background: PAPER,
  async setup(api) {
    const { stage } = api;
    const KTEXT = '스물넷의 절기, 다섯 번 다시 놓다격자바퀴해의 길계절입춘봄여름가을겨울월일무렵황경가운데첫째문턱을 넘는 날언 땅이 풀리고한 해가 다시 놓인다하지낮이 가장 길다동지밤이 가장 길다마다 한 절기날짜는 양력 기준0123456789°·—×=';
    await Promise.all([
      fontReady(`500 22px ${KR}`, KTEXT + TERMS.map((d) => d.name).join('')),
      fontReady(`700 21px ${MJ}`, TERMS.map((d) => d.name).join('') + '立春大吉'),
      fontReady(`400 13px ${MJ}`, TERMS.map((d) => d.hanja).join('')),
      fontReady(`600 40px ${MJ}`, '二十四節氣' + '격자바퀴해의 길계절입춘봄여름가을겨울한 해' + SEASONS.map((s) => s[1]).join('')),
    ]);

    const root = api.layer('div', { z: 1 });
    root.className = 'f69';
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
    const el = (parent, css, html = '', cls = '') => {
      const e = document.createElement('div');
      if (cls) e.className = cls;
      e.style.cssText = css;
      e.innerHTML = html;
      parent.appendChild(e);
      return e;
    };
    const sc = stage.getBoundingClientRect().width / 1080 || 1;
    const rel = (e) => {
      const r = e.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: (r.left - s.left) / sc, y: (r.top - s.top) / sc, w: r.width / sc, h: r.height / sc };
    };

    // ============================================================ the deck: decorations first (under the cards), then 24 cards
    const deck = el(root, '', '', 'deck L-grid');
    const NS = 'http://www.w3.org/2000/svg';
    const ringSvg = document.createElementNS(NS, 'svg');
    ringSvg.setAttribute('class', 'deco');
    ringSvg.setAttribute('width', 1080); ringSvg.setAttribute('height', 1920);
    deck.appendChild(ringSvg);
    const rowLayer = el(deck, 'position:absolute;left:0;top:0;width:4000px;height:1920px', '', 'deco');

    const cards = TERMS.map((d) => {
      const c = el(deck, '', '', 'card');
      const alt = -ROW.amp * Math.sin((d.lon * Math.PI) / 180);
      c.style.cssText = `--c:${d.color};--fg:${fgOn(d.color)};--a:${(d.i * 15 + 7.5).toFixed(1)}deg;--alt:${alt.toFixed(1)}px;--gr:${1 + (d.s >> 1)};--gc:${1 + (d.s & 1)};--k:${d.k}`;
      c.innerHTML = `<div class="sw"><span class="ix">${String(d.i + 1).padStart(2, '0')}</span>${svg('mo', d.motif, 2.2)}</div>`
        + `<div class="lb"><span class="nm">${d.name}</span><span class="hj">${d.hanja}</span><span class="dt">${d.mon}월 ${d.day}일</span></div>`;
      return c;
    });

    // ============================================================ capture every layout (real CSS) with Flip.getState
    const LAYOUTS = ['grid', 'wheel', 'row', 'stack', 'strip'];
    const states = {}, geo = {};
    for (const L of LAYOUTS) {
      deck.className = `deck L-${L}`;
      states[L] = Flip.getState(cards);
      geo[L] = cards.map(rel);
    }
    deck.className = 'deck L-grid';                    // the base layout for playback; everything else is a transform
    // the lifted 입춘 and the catalogue page (absolute, outside the deck)
    const P = { x: M, y: 240, w: 1080 - 2 * M, h: (1080 - 2 * M) * 4 / 3 };   // 936 × 1248, the card's 3:4
    const ghost = el(root, `position:absolute;left:${540 - 120}px;top:${P.y + P.h / 2 - 160}px;width:240px;height:320px;visibility:hidden`);   // the lift spot: the page's centre
    const d0 = TERMS[0];
    const detail = el(root, `position:absolute;left:${P.x}px;top:${P.y}px;width:${P.w}px;height:${P.h}px;visibility:hidden;opacity:0;z-index:3`);
    const dCard = el(detail, `position:absolute;inset:0;background:${CARD};border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px ${ink(0.07)},0 40px 80px -50px rgba(50,40,30,.55)`,
      `<div style="position:absolute;left:0;top:0;width:100%;height:62%;background:${d0.color}"></div>`
      + `<div style="position:absolute;left:40px;top:36px;font:600 24px/1 ${KR};letter-spacing:.14em;color:${fgOn(d0.color)}">01 / 24</div>`);
    const MO = 340;
    const dMo = el(detail, `position:absolute;left:${(P.w - MO) / 2}px;top:${(P.h * 0.62 - MO) / 2}px;width:${MO}px;height:${MO}px;color:${fgOn(d0.color)}`,
      svg('dmo', d0.motif, 1.3));
    dMo.firstChild.style.cssText = 'width:100%;height:100%;display:block';
    const dNm = el(detail, `position:absolute;left:56px;top:808px;font:700 136px/1.15 ${MJ};color:${INK};white-space:nowrap`, d0.name);
    const dHj = el(detail, `position:absolute;right:56px;top:840px;font:400 92px/1.15 ${MJ};color:${ink(0.45)};white-space:nowrap`, d0.hanja);
    const dMeta = el(detail, `position:absolute;left:56px;top:992px;font:500 27px/1 ${KR};letter-spacing:.02em;color:${ink(0.55)};white-space:nowrap;font-variant-numeric:tabular-nums`,
      '2월 4일 무렵 &nbsp;·&nbsp; 황경 315° &nbsp;·&nbsp; 스물넷 가운데 첫째');
    const dRule = el(detail, `position:absolute;left:56px;right:56px;top:1048px;height:1px;background:${ink(0.16)};transform-origin:0 50%`);
    const dDesc = ['봄이 문턱을 넘는 날.', '언 땅이 풀리고, 한 해가 다시 놓인다.'].map((s, i) =>
      el(detail, `position:absolute;left:56px;top:${1080 + i * 57}px;font:400 38px/1.5 ${KR};letter-spacing:-0.01em;color:${INK};white-space:nowrap`, s));
    const dSeal = el(detail, `position:absolute;right:56px;top:${P.h - 56 - 112}px;width:112px;height:112px;background:${SEAL};border-radius:3px;display:grid;place-items:center;text-align:center;font:700 38px/1.12 ${MJ};color:${CARD}`,
      '立春<br>大吉');

    // ============================================================ Flip.fit → per-card transforms for every layout
    const KEYS = ['x', 'y', 'rotation', 'skewX', 'scaleX', 'scaleY'];
    const clean = (v) => Object.fromEntries(KEYS.map((k) => [k, Math.round((Number(v[k]) || (k.startsWith('scale') ? 1 : 0)) * 1000) / 1000]));
    const fit = (from, to) => clean(Flip.fit(from, to, { getVars: true, scale: true }));
    const V = {};
    for (const L of LAYOUTS) V[L] = cards.map((c) => fit(c, states[L]));
    const ID = clean({ x: 0, y: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1 });
    V.grid = cards.map(() => ({ ...ID }));             // the base itself (Flip.fit returns ~0; make it exact)
    V.lift = fit(cards[0], ghost);
    // nested shared elements: each part of the page starts exactly on the matching part of the lifted small card
    gsap.set(cards[0], V.lift);
    const q = (s) => cards[0].querySelector(s);
    const F = { card: fit(dCard, cards[0]), mo: fit(dMo, q('.mo')), nm: fit(dNm, q('.nm')), hj: fit(dHj, q('.hj')) };
    gsap.set(cards, { clearProps: 'transform' });

    // ============================================================ decorations, placed from the captured geometry
    // header: title, plate number of the current layout, rule; footer
    const head = el(root, `position:absolute;left:${M}px;top:84px;font:600 40px/1 ${MJ};letter-spacing:.14em;color:${INK}`, '二十四節氣');
    const sub = el(root, `position:absolute;left:${M}px;top:144px;font:400 22px/1 ${KR};color:${ink(0.55)}`, '스물넷의 절기, 다섯 번 다시 놓다');
    const rule = el(root, `position:absolute;left:${M}px;top:212px;width:${1080 - 2 * M}px;height:1px;background:${ink(0.2)};transform-origin:0 50%`);
    const plateBox = el(root, `position:absolute;right:${M}px;top:80px;width:420px;height:84px;overflow:clip`);
    const PLATES = [['01', 'GRID', '격자'], ['02', 'WHEEL', '바퀴'], ['03', 'TIMELINE', '해의 길'], ['04', 'SEASONS', '계절'], ['05', 'DETAIL', '입춘']];
    const plates = PLATES.map(([n, en, ko]) => el(plateBox, 'position:absolute;right:0;top:0;text-align:right;white-space:nowrap',
      `<div style="font:600 15px/1 ${KR};letter-spacing:.24em;color:${ink(0.45)}">PL. ${n} &nbsp;·&nbsp; ${en}</div>`
      + `<div style="margin-top:14px;font:600 36px/1 ${MJ};color:${INK}">${ko}</div>`));
    const foot = el(root, `position:absolute;left:${M}px;right:${M}px;top:1614px;display:flex;justify-content:space-between;font:400 17px/1 ${KR};color:${ink(0.45)}`,
      '<span>황경 15°마다 한 절기 · 날짜는 양력 기준 무렵</span><span>24 × 15° = 360°</span>');
    el(root, `position:absolute;left:0;top:${BAND}px;width:1080px;height:${1920 - BAND}px;background:${INK};z-index:4`);

    // grid: a season label over each row
    const gridLabels = SEASONS.map(([ko, hj], s) => {
      const g = geo.grid[s * 6];
      return el(root, `position:absolute;left:${g.x}px;top:${(g.y - 36).toFixed(1)}px;font:600 17px/1 ${KR};letter-spacing:.18em;color:${ink(0.55)};white-space:nowrap`,
        `${ko} · <span style="font-family:${MJ}">${hj}</span> <span style="margin-left:14px;font-weight:400;letter-spacing:.04em;color:${ink(0.4)}">${TERMS[s * 6].name} — ${TERMS[s * 6 + 5].name}</span>`);
    });

    // wheel: inner ring, a tick at each term, the four seasons, the centre (inside the deck, so it turns with it)
    const pol = (r, deg) => [WHEEL.cx + r * Math.sin((deg * Math.PI) / 180), WHEEL.cy - r * Math.cos((deg * Math.PI) / 180)];
    const RR = 286, CIRC = 2 * Math.PI * RR;
    ringSvg.innerHTML = `<g class="ring" fill="none" stroke="${ink(0.22)}" stroke-width="1.2">`
      + `<circle cx="${WHEEL.cx}" cy="${WHEEL.cy}" r="${RR}" stroke-dasharray="${CIRC.toFixed(1)}" transform="rotate(-90 ${WHEEL.cx} ${WHEEL.cy})"/>`
      + `<g class="ticks">${TERMS.map((d) => { const a = pol(RR - 12, d.i * 15 + 7.5), b = pol(RR, d.i * 15 + 7.5); return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/>`; }).join('')}`
      + [0, 90, 180, 270].map((deg) => { const a = pol(150, deg), b = pol(RR - 22, deg); return `<path stroke-dasharray="2 6" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/>`; }).join('')
      + '</g></g>'
      + `<g class="ringText" fill="${ink(0.55)}" text-anchor="middle" font-family='${MJ}' font-weight="600" font-size="28">`
      + SEASONS.map(([ko], s) => { const p = pol(212, 45 + 90 * s); return `<text x="${p[0].toFixed(1)}" y="${(p[1] + 10).toFixed(1)}">${ko}</text>`; }).join('')
      + `<text x="${WHEEL.cx}" y="${WHEEL.cy + 8}" fill="${INK}" font-size="60">한 해</text>`
      + `<text x="${WHEEL.cx}" y="${WHEEL.cy + 56}" font-family='${KR}' font-weight="500" font-size="20" letter-spacing="2">15° × 24</text></g>`;
    const ringCircle = ringSvg.querySelector('circle'), ticks = ringSvg.querySelector('.ticks'), ringText = ringSvg.querySelector('.ringText');

    // row: the sun's path through the card centres, a month ruler, the two solstices
    const C = geo.row.map((g) => [g.x + g.w / 2, g.y + g.h / 2]);
    const pts = [[C[0][0] - 90, C[0][1] + (C[0][1] - C[1][1])], ...C, [C[23][0] + 90, C[23][1] + (C[23][1] - C[22][1])]];
    let dPath = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {      // Catmull-Rom → cubic Bézier
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      dPath += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    const RULER_Y = 1150, rowRight = geo.row[23].x + geo.row[23].w;
    rowLayer.innerHTML = `<svg width="4000" height="1920" style="position:absolute;left:0;top:0;overflow:visible" fill="none">`
      + `<path class="sunpath" d="${dPath}" stroke="${ink(0.32)}" stroke-width="2" stroke-linecap="round"/>`
      + `<g class="ruler" stroke="${ink(0.3)}" stroke-width="1"><path d="M${M} ${RULER_Y}H${rowRight.toFixed(1)}"/>`
      + C.map(([x]) => `<path d="M${x.toFixed(1)} ${RULER_Y - 5}v10"/>`).join('') + '</g></svg>';
    const months = el(rowLayer, 'position:absolute;left:0;top:0');
    TERMS.forEach((d, i) => {
      if (i > 0 && TERMS[i - 1].mon === d.mon) return;
      el(months, `position:absolute;left:${(C[i][0] - 40).toFixed(1)}px;top:${RULER_Y + 18}px;width:80px;text-align:center;font:600 18px/1 ${KR};letter-spacing:.08em;color:${ink(0.5)}`, `${d.mon}월`);
    });
    const solLabels = [[9, '하지 — 낮이 가장 길다'], [21, '동지 — 밤이 가장 길다']].map(([i, s]) =>
      el(rowLayer, `position:absolute;left:${(C[i][0] - 160).toFixed(1)}px;top:${(geo.row[i].y - 44).toFixed(1)}px;width:320px;text-align:center;font:500 19px/1 ${KR};color:${ink(0.6)};white-space:nowrap`, s));
    const sunPath = rowLayer.querySelector('.sunpath'), ruler = rowLayer.querySelector('.ruler');
    const PATHLEN = sunPath.getTotalLength();
    sunPath.setAttribute('stroke-dasharray', PATHLEN.toFixed(1));
    const SCROLL = rowRight - (1080 - M);               // pan until 대한 reaches the right margin
    const firstScreen = (1080 - pts[0][0]) / (pts[pts.length - 1][0] - pts[0][0]);   // share of the path visible before the pan

    // stacks: a label over each pile (its union box in the stack layout)
    const stackLabels = SEASONS.map(([ko, hj], s) => {
      const b = geo.stack.slice(s * 6, s * 6 + 6);
      const x = Math.min(...b.map((g) => g.x)), y = Math.min(...b.map((g) => g.y));
      return el(root, `position:absolute;left:${x.toFixed(1)}px;top:${(y - 74).toFixed(1)}px;white-space:nowrap`,
        `<div style="font:600 32px/1 ${MJ};color:${INK}">${ko} <span style="color:${ink(0.45)}">${hj}</span></div>`
        + `<div style="margin-top:10px;font:500 16px/1 ${KR};letter-spacing:.06em;color:${ink(0.5)}">${TERMS[s * 6].name} — ${TERMS[s * 6 + 5].name} · ${TERMS[s * 6].mon}월 — ${TERMS[s * 6 + 5].mon}월</div>`);
    });

    // strip: the empty place 입춘 left behind
    const sg = geo.strip[0];
    const slot = el(root, `position:absolute;left:${(sg.x - 3).toFixed(1)}px;top:${(sg.y - 3).toFixed(1)}px;width:${(sg.w + 6).toFixed(1)}px;height:${(sg.h + 6).toFixed(1)}px;box-sizing:border-box;border:1.5px solid ${INK};border-radius:3px`);

    // ============================================================ the master timeline
    const tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
    const fadeIn = (t, at, d = 0.5, y = 10) => tl.fromTo(t, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: d, ease: 'power3.out', stagger: 0.06 }, at);
    const fadeOut = (t, at, d = 0.3) => tl.to(t, { autoAlpha: 0, duration: d, ease: 'power2.in' }, at);
    /** one Flip transition: every card goes from its var set to the next, on its own delay */
    const move = (from, to, at, { dur = 0.8, ease = 'power3.inOut', delay = (i) => i * 0.013, only = () => true } = {}) =>
      cards.forEach((c, i) => {
        if (only(i)) tl.fromTo(c, { ...from[i] }, { ...to[i], duration: dur, ease, immediateRender: false }, at + delay(i));
      });
    // plate numbers: the current one leaves upward, the next rises in
    const plateAt = (k, at) => {
      if (k > 0) tl.to(plates[k - 1], { yPercent: -120, duration: 0.42, ease: 'power3.in' }, at);
      tl.fromTo(plates[k], { yPercent: 120 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' }, at + (k > 0 ? 0.3 : 0));
    };

    // header
    fadeIn(head, 0, 0.8, 14);
    fadeIn(sub, 0.12, 0.8, 10);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power3.inOut' }, 0.05);
    fadeIn(foot, 0.5, 0.6, 0);
    plateAt(0, 0.2);

    // 01 grid — cards rise into the CSS grid on a diagonal wave
    cards.forEach((c, i) => {
      tl.fromTo(c, { x: 0, y: 64, rotation: 0, skewX: 0, scaleX: 0.94, scaleY: 0.94, autoAlpha: 0 },
        { ...ID, autoAlpha: 1, duration: 0.7, ease: 'expo.out' }, T.enter + (Math.floor(i / 6) + (i % 6)) * 0.045);
    });
    fadeIn(gridLabels, 0.55, 0.5, 8);

    // 02 wheel — absolute positions + rotation; the wheel turns half a term while it holds
    fadeOut(gridLabels, T.wheel, 0.25);
    plateAt(1, T.wheel);
    move(V.grid, V.wheel, T.wheel, { dur: 0.8, delay: (i) => i * 0.014 });
    tl.fromTo(ringCircle, { attr: { 'stroke-dashoffset': CIRC } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power2.inOut' }, T.wheel + 0.4);
    fadeIn(ticks, T.wheel + 0.7, 0.5, 0);
    fadeIn(ringText, T.wheel + 0.8, 0.6, 0);
    tl.fromTo(deck, { rotation: 0 }, { rotation: -12, duration: T.row - (T.wheel + 0.65), ease: 'sine.inOut' }, T.wheel + 0.65);

    // 03 timeline row — flex row along the sun's height, then the pan through the year
    plateAt(2, T.row);
    fadeOut([ringCircle, ticks, ringText], T.row, 0.25);
    tl.to(deck, { rotation: 0, duration: 0.75, ease: 'power3.inOut' }, T.row);
    move(V.wheel, V.row, T.row, { dur: 0.75, delay: (i) => i * 0.013 });
    tl.fromTo(sunPath, { attr: { 'stroke-dashoffset': PATHLEN } }, { attr: { 'stroke-dashoffset': PATHLEN * (1 - firstScreen) }, duration: T.scroll - (T.row + 0.35), ease: 'power2.out' }, T.row + 0.35);
    tl.to(sunPath, { attr: { 'stroke-dashoffset': 0 }, duration: T.scrollEnd - T.scroll, ease: 'power2.inOut' }, T.scroll);
    fadeIn([ruler, months], T.row + 0.45, 0.5, 0);
    fadeIn(solLabels, T.row + 0.9, 0.5, 8);
    tl.fromTo(deck, { x: 0 }, { x: -SCROLL, duration: T.scrollEnd - T.scroll, ease: 'power2.inOut' }, T.scroll);
    fadeOut([sunPath, ruler, months, ...solLabels], T.scrollEnd - 0.2, 0.2);
    // hand the pan over to the cards (deck back to 0, every card shifted by the same amount: nothing moves)
    const rowShift = V.row.map((v) => ({ ...v, x: Math.round((v.x - SCROLL) * 1000) / 1000 }));
    tl.to(deck, { x: 0, duration: 0.001, ease: 'none' }, T.stack);
    cards.forEach((c, i) => tl.fromTo(c, { x: V.row[i].x }, { x: rowShift[i].x, duration: 0.001, ease: 'none', immediateRender: false }, T.stack));

    // 04 seasons — grid cells stacked with transforms; the piles build bottom-up together
    // (starts 2 ms after the hand-over, so no frame ever sees the shifted cards on an unshifted deck)
    plateAt(3, T.stack);
    move(rowShift, V.stack, T.stack + 0.002, { dur: 0.75, delay: (i) => (i % 6) * 0.03 + Math.floor(i / 6) * 0.04 });
    fadeIn(stackLabels, T.stack + 0.75, 0.5, 10);

    // 05 입춘 — lifted out; the rest tuck into the index strip; the card opens into the page
    plateAt(4, T.lift);
    fadeOut(stackLabels, T.lift, 0.25);
    tl.to(cards[0], { zIndex: 30, duration: 0.001, ease: 'none' }, T.lift);   // first in DOM order: raise it over the others
    tl.fromTo(cards[0], { ...V.stack[0] }, { ...V.lift, duration: T.open - T.lift, ease: 'power3.inOut', immediateRender: false }, T.lift);
    move(V.stack, V.strip, T.lift + 0.05, { dur: 0.7, delay: (i) => i * 0.008, only: (i) => i > 0 });
    tl.fromTo(slot, { autoAlpha: 0, scale: 1.5 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, T.open + 0.1);
    tl.fromTo(detail, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, ease: 'none' }, T.open);
    tl.to(cards[0], { autoAlpha: 0, duration: 0.1, ease: 'none' }, T.open);
    tl.fromTo(dCard, F.card, { ...ID, duration: 0.9, ease: 'power3.inOut' }, T.open);
    tl.fromTo(dMo, F.mo, { ...ID, duration: 0.9, ease: 'power4.inOut' }, T.open + 0.04);
    tl.fromTo(dNm, F.nm, { ...ID, duration: 0.9, ease: 'power4.inOut' }, T.open + 0.07);
    tl.fromTo(dHj, F.hj, { ...ID, duration: 0.9, ease: 'power4.inOut' }, T.open + 0.1);
    fadeIn([dMeta, ...dDesc], T.info, 0.6, 22);
    tl.fromTo(dRule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, T.info + 0.05);
    // the seal is stamped: accelerating in, a little give, settled askew
    tl.fromTo(dSeal, { autoAlpha: 0, scale: 1.6, rotation: -4 }, { autoAlpha: 1, scale: 0.95, rotation: -4, duration: 0.24, ease: 'power3.in' }, T.seal);
    tl.to(dSeal, { scale: 1, duration: 0.3, ease: 'power2.out' }, T.seal + 0.24);
    tl.to({}, { duration: 0.001 }, D - 0.001);           // the timeline spans the whole piece

    // initialise every tween in playing order (start values of `to` tweens, fromTo start-at records), then rewind
    tl.time(D);
    tl.time(0);
    this.tl = tl;
  },
  frame(t) {
    this.tl.time(t);
  },
});
