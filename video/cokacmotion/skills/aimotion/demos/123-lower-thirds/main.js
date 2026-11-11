/*
 * 123 · 모퉁이 라이브 — a broadcast graphics package for an invented vertical-video channel ("모퉁이"), 10 s, 1080×1920.
 *
 * One design system, applied to six elements over a flat-illustrated "camera shot" (scene.js):
 *   grid      8 px unit · 6 columns (124 + 24 gutter) from x 72 to 936 · slots that never overlap · 9:16 safe areas
 *   colour    ink #0d1730 · paper #f7f3ea · one accent (lime #c9f23a) that only the graphics may use
 *   type      Pretendard (Hangul, numerals with tnum) + Roboto Flex (Latin caps labels), sizes on a 1.25 scale from 30 px
 *   radius    16 px everywhere, also on the moving edge of a wipe
 *   motion    the signature "lead & follow": a lime slab wipes in first, the ink/paper bar follows 75 ms behind and leaves
 *             a 10 px lime tab; text rises inside the bar; out = the same path backwards, faster (power3.in)
 * Elements: channel bug (idle: the corner mark turns a quarter every 2.4 s) · topic bar + live ticker (crawl, separators,
 * tabular clock) · name super (name rises, role follows, lime rule slides to the measured name width) · transition
 * stinger (the signature move at full frame, with the channel lockup) · data chip (tabular counter + odometer tick) ·
 * quote card (balanced 어절 line break, hanging quote mark, accent rule on the key phrase). Every bar is sized from text
 * measured in setup. The safe areas are drawn at the start and, with the slot map, at the end.
 *
 * Determinism: the scene is a closed form of t on one 2D canvas; the graphics are DOM driven by one paused GSAP timeline
 * (frame(t) → tl.time(t)); the counter, crawl, clock and idle turns are closed forms written after the seek.
 */
import { defineDemo, rand, clamp } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { CustomEase } from '../node_modules/gsap/CustomEase.js';
import { makeScene, bakeAlley, drawA, drawB, CUT, BEAT } from './scene.js';

gsap.registerPlugin(CustomEase);

const D = 10;
const KR = `"${FONTS.pretendard.family}"`, LAT = `"${FONTS.robotoFlex.family}"`;
const TOK = { ink: '#0d1730', ink2: '#18264a', paper: '#f7f3ea', acc: '#c9f23a', mute: '#9aa6c0', inkMute: '#59647f' };
const U = 8, STRIPE = 10;
const TS = (k) => Math.round(30 * 1.25 ** k);          // type scale: k −1…5 → 24 30 38 47 59 73 92
const snap = (v) => Math.ceil(v / U) * U;               // every box dimension lands on the 8 px grid
const GRID = { x0: 72, x1: 936, top: 200, cols: 6, col: 124, gut: 24 };
const SAFE = { action: [38, 67, 1042, 1853], gfx: [54, 96, 1026, 1824] };          // 93 % / 90 % of 1080×1920
const APP = { top: 160, bottom: 1560, right: 936, rightTop: 880 };                     // where a vertical-video app draws its UI
const X0 = GRID.x0 + STRIPE;                                                           // bars start after their lime tab

// timing (s)
const T = {
  guideIn: 0.05, guideOut: 1.2, bugIn: 0.3, bugOut: 9.42, topicIn: 0.68, tickIn: 0.84, topicOut: 8.3,
  l3In: 1.25, l3Out: 3.55, stIn: 3.9, stOut: 4.4, chipIn: 4.78, count: [4.98, 5.55], chipOut: 7.68,
  quoteIn: 5.0, hl: 5.72, quoteOut: 7.8, endIn: 8.5,
};
const CRAWL = 112;                                                                     // px/s

// copy (Korean names: surname + given name set solid; a NBSP binds number + counter word and the key phrase)
const COPY = {
  name: '최말순', role: '붕어빵 노점 · 23년 차',
  topic: '오늘 밤, 골목 단골집', live: 'LIVE',
  ticker: ['오늘 밤 첫눈 소식', '팥 · 슈크림 두 가지 맛', '세 마리 2,000원', '밤 10시까지 굽습니다', '골목 단골집 3화'],
  chipLabel: '오늘 구운 붕어빵', chipUnit: '마리', from: 1180, to: 1284,
  quote: '추운 날엔 한 마리 더 드려요', key: '한 마리 더', by: '최말순 · 붕어빵 노점',
  brand: '모퉁이', tag: '골목의 오늘을 세로로',
};

CustomEase.create('sig', 'M0,0 C0.12,0.74 0.24,1 1,1');
const SIG = { dur: 0.52, lag: 0.075, outDur: 0.26, outLag: 0.05 };

// ------------------------------------------------------------------ small DOM kit
function el(parent, css = '', html = '', cls = '') {
  const e = document.createElement('div');
  e.style.cssText = css;
  if (html) e.innerHTML = html;
  if (cls) e.className = cls;
  parent.appendChild(e);
  return e;
}
const font = (w, k, fam = KR) => `${w} ${TS(k)}px/${TS(k)}px ${fam}`;
let MEAS = null, SC = 1;
/** rendered width (stage px) of `html` set in `css` — the number every bar is sized from */
function textW(css, html) {
  MEAS.style.cssText = `position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;${css}`;
  MEAS.innerHTML = html;
  return MEAS.getBoundingClientRect().width / SC;
}
/** vertical offset that centres the INK of a sample (Hangul, caps or figures) in a box, for a line box of height = size */
const CV = document.createElement('canvas').getContext('2d');
function opticTop(canvasFont, size, sample, boxH) {
  CV.font = canvasFont;
  const m = CV.measureText(sample);
  const base = (size - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
  return boxH / 2 - (base - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
}
/** baseline position inside a line box whose line-height equals the font size (CSS half-leading model) */
function baseOf(canvasFont, size) {
  CV.font = canvasFont;
  const m = CV.measureText('가');
  return (size - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
}
/** the largest step k ≤ k0 on the type scale at which `text` fits maxW (never below the label step −1) */
function fitStep(text, k0, maxW, css) {
  let k = k0;
  while (k > -1 && textW(css(k), text) > maxW) k--;
  return k;
}
/** balanced two-line break at 어절 (spaces; NBSP never breaks): the split with the shortest longer line */
function balance(text, css, maxW) {
  const words = text.split(' ');
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const w = Math.max(textW(css, a), textW(css, b));
    if (w <= maxW && (!best || w < best.w)) best = { lines: [a, b], w };
  }
  return best ? best.lines : [text];
}

/** one bar of the package: an accent slab under an ink/paper slab, both cut by the shared clip-path */
function bar(parent, { x, y, w, h, bg, shadow = true }) {
  const box = el(parent, `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px`, '', shadow ? 'sh' : '');
  const acc = el(box, `left:${-STRIPE}px;width:${w + STRIPE}px`, '', 'acc');
  const base = el(box, `left:0;width:${w}px;background:${bg}`, '', 'base');
  return { box, acc, base, x, y, w, h };
}
function sigIn(tl, b, at, k = 1) {
  tl.fromTo(b.acc, { '--r': 0 }, { '--r': 1, duration: SIG.dur * k, ease: 'sig' }, at);
  tl.fromTo(b.base, { '--r': 0 }, { '--r': 1, duration: SIG.dur * k, ease: 'sig' }, at + SIG.lag * k);
}
function sigOut(tl, b, at) {
  tl.to(b.base, { '--r': 0, duration: SIG.outDur, ease: 'power2.in' }, at);
  tl.to(b.acc, { '--r': 0, duration: SIG.outDur, ease: 'power2.in' }, at + SIG.outLag);
}
/** the brand mark: a square with one rounded corner (모퉁이 = a street corner) */
function mark(parent, s, x, y, color = TOK.acc, corner = 1) {
  const m = el(parent, `position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px`);
  const rad = [0, 0, 0, 0]; rad[corner] = Math.round(s * 0.62);
  const inner = el(m, `position:absolute;inset:0;background:${color};border-radius:${rad.map((v) => v + 'px').join(' ')}`);
  return { m, inner };
}

const seg = (t, a, b) => clamp((t - a) / (b - a));
const inOut3 = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const outExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const outBack = (p, c = 1.7) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
const fmt = (n) => n.toLocaleString('en-US');

defineDemo({
  id: '123-lower-thirds',
  title: '모퉁이 라이브',
  tech: '방송 그래픽 패키지 · 로어서드 · 티커 · 버그 · 스팅어',
  duration: D,
  background: '#0f1530',
  async setup(api) {
    const { stage } = api;
    const allKR = Object.values(COPY).flat().join('') + '액션세이프타이틀세로앱UI영역버그데이터칩이름자막인용카드주제바티커그래픽패키지단거터설계도' + '0123456789,:%×·—';
    await Promise.all([
      fontReady(`800 73px ${KR}`, allKR), fontReady(`400 38px ${KR}`, allKR), fontReady(`700 59px ${KR}`, allKR),
      fontReady(`500 30px ${KR}`, allKR), fontReady(`600 24px ${KR}`, allKR),
      fontReady(`700 24px ${LAT}`, 'LIVEACTIONTITLESAFEBUGCHIPSLOTGRIDPX0123456789%×·REC'), 
    ]);
    this.S = makeScene();
    this.S.alley = bakeAlley(api.headless);
    const cv = api.canvas({ z: 0 });
    this.g = cv.ctx;

    // grain + vignette (static, the grain only shifts)
    const gr = document.createElement('canvas');
    gr.width = 1144; gr.height = 1984;
    {
      const g2 = gr.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
      const img = g2.createImageData(gr.width, gr.height), r = rand(9123);
      for (let i = 0; i < img.data.length; i += 4) { const v = 110 + r() * 145; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g2.putImageData(img, 0, 0);
    }
    gr.style.cssText = 'position:absolute;left:0;top:0;z-index:1;opacity:.055;mix-blend-mode:overlay;pointer-events:none';
    stage.appendChild(gr);
    this.grain = gr;
    el(stage, 'position:absolute;left:0;right:0;bottom:0;height:420px;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(6,8,20,0) 0%,rgba(6,8,20,.5) 100%)');
    el(stage, 'position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(5,6,18,.55) 100%)');

    const L = (z) => { const d = api.layer('div', { z }); d.className = 'pk'; return d; };
    const dimL = L(2), slotL = L(3), stL = L(4), perL = L(5), gdL = L(6);
    MEAS = el(gdL, 'position:absolute;visibility:hidden');
    SC = stage.getBoundingClientRect().width / 1080 || 1;
    const dim = el(dimL, `position:absolute;inset:0;background:${TOK.ink};opacity:0`);
    const tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
    const box = {};                                                         // measured element rects (for the slot map)

    // ---------------------------------------------------------------- channel bug (top right, right edge on 1008)
    {
      const h = 64, ms = 30, pad = 20, gap = 14;
      const css = `font:${font(800, 1)};letter-spacing:-0.02em`;
      const ww = textW(css, COPY.brand);
      const w = snap(pad + ms + gap + ww + pad);
      const b = bar(perL, { x: 1008 - w, y: GRID.top, w, h, bg: TOK.ink });
      const mk = mark(b.base, ms, pad, (h - ms) / 2);
      const word = el(b.base, `left:${pad + ms + gap}px;top:${opticTop(`800 ${TS(1)}px ${KR}`, TS(1), '모퉁이', h)}px;${css};color:${TOK.paper}`, COPY.brand, 'abs');
      sigIn(tl, b, T.bugIn, 0.85);
      tl.fromTo(mk.m, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.7)' }, T.bugIn + 0.12);
      tl.fromTo(word, { y: h }, { y: 0, duration: 0.6, ease: 'expo.out' }, T.bugIn + 0.18);
      tl.to(word, { y: h, duration: 0.16, ease: 'power2.in' }, T.bugOut);
      tl.to(mk.m, { scale: 0, duration: 0.18, ease: 'power2.in' }, T.bugOut + 0.03);
      sigOut(tl, b, T.bugOut + 0.07);
      this.bugMark = mk.inner;
      box.bug = { x: b.x - STRIPE, y: b.y, w: w + STRIPE, h };
    }

    // ---------------------------------------------------------------- topic bar + ticker (bottom of the graphics column)
    {
      const th = 72, kh = 56, y = 1424, padL = 16, padR = 32;
      const liveCss = `font:700 ${TS(-1)}px/${TS(-1)}px ${LAT};letter-spacing:0.14em`;
      const liveW = snap(textW(liveCss + ';font-variation-settings:"wdth" 84', COPY.live) + 46);
      const topicK = fitStep(COPY.topic, 1, GRID.x1 - X0 - padL - liveW - 18 - padR, (k) => `font:${font(700, k)};letter-spacing:-0.015em`);
      const topicCss = `font:${font(700, topicK)};letter-spacing:-0.015em`;
      const topicW = textW(topicCss, COPY.topic);
      const w = snap(padL + liveW + 18 + topicW + padR);
      const b = bar(perL, { x: X0, y, w: Math.min(w, GRID.x1 - X0), h: th, bg: TOK.paper });
      const chip = el(b.base, `position:absolute;left:${padL}px;top:${(th - 40) / 2}px;width:${liveW}px;height:40px;border-radius:8px;background:${TOK.ink}`);
      const dot = el(chip, `position:absolute;left:14px;top:15px;width:10px;height:10px;border-radius:5px;background:${TOK.acc}`);
      el(chip, `left:30px;top:${opticTop(`700 ${TS(-1)}px ${LAT}`, TS(-1), 'LIVE', 40)}px;${liveCss};color:${TOK.paper}`, COPY.live, 'abs lat');
      const topic = el(b.base, `left:${padL + liveW + 18}px;top:${opticTop(`700 ${TS(topicK)}px ${KR}`, TS(topicK), '오늘밤골목', th)}px;${topicCss};color:${TOK.ink}`, COPY.topic, 'abs');
      // ticker: full column, crawl viewport + tabular clock box
      const kw = GRID.x1 - X0;
      const k = bar(perL, { x: X0, y: y + th + 0, w: kw, h: kh, bg: TOK.ink, shadow: false });
      const clockCss = `font:600 ${TS(0)}px/${TS(0)}px ${KR};letter-spacing:0.01em;font-variant-numeric:tabular-nums`;
      const clockW = snap(textW(clockCss, '00:00:00') + 40);
      const view = el(k.base, `position:absolute;left:6px;top:0;width:${kw - clockW - 12}px;height:${kh}px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 34px,#000 calc(100% - 34px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 34px,#000 calc(100% - 34px),transparent 100%)`);
      el(k.base, `position:absolute;left:${kw - clockW}px;top:12px;width:2px;height:${kh - 24}px;background:rgba(247,243,234,.22)`);
      const clock = el(k.base, `left:${kw - clockW + 20}px;top:${opticTop(`600 ${TS(0)}px ${KR}`, TS(0), '0123', kh)}px;${clockCss};color:${TOK.acc}`, '21:47:05', 'abs');
      const itemCss = `font:500 ${TS(0)}px/${TS(0)}px ${KR};letter-spacing:-0.005em;font-variant-numeric:tabular-nums;color:${TOK.paper}`;
      const strip = el(view, `position:absolute;left:0;top:0;height:${kh}px;white-space:nowrap`);
      const itemTop = opticTop(`500 ${TS(0)}px ${KR}`, TS(0), '오늘밤첫눈', kh);
      let x = 28;
      const sepW = 14, sepGap = 26;
      for (let rep = 0; rep < 3; rep++) {
        for (const it of COPY.ticker) {
          const iw = textW(itemCss, it);
          el(strip, `left:${x}px;top:${itemTop}px;${itemCss}`, it, 'abs');
          x += iw + sepGap;
          const sep = el(strip, `position:absolute;left:${x}px;top:${(kh - sepW) / 2}px;width:${sepW}px;height:${sepW}px;background:${TOK.acc};border-radius:0 ${Math.round(sepW * 0.62)}px 0 0`);
          x += sepW + sepGap;
          if (rep === 0 && it === COPY.ticker[COPY.ticker.length - 1]) this.loopW = x - 28;
          void sep;
        }
      }
      sigIn(tl, b, T.topicIn);
      tl.fromTo(chip, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.8)' }, T.topicIn + 0.2);
      tl.fromTo(topic, { y: th }, { y: 0, duration: 0.62, ease: 'expo.out' }, T.topicIn + 0.24);
      sigIn(tl, k, T.tickIn);
      tl.fromTo(strip, { y: kh }, { y: 0, duration: 0.6, ease: 'expo.out' }, T.tickIn + 0.22);
      tl.fromTo(clock, { y: kh }, { y: 0, duration: 0.6, ease: 'expo.out' }, T.tickIn + 0.3);
      // out: text first, then the bars retrace (ticker leaves before the topic, like it arrived after it)
      tl.to([strip, clock], { y: kh, duration: 0.16, ease: 'power2.in' }, T.topicOut);
      tl.to(topic, { y: th, duration: 0.16, ease: 'power2.in' }, T.topicOut + 0.04);
      tl.to(chip, { scale: 0.4, opacity: 0, duration: 0.16, ease: 'power2.in' }, T.topicOut + 0.04);
      sigOut(tl, k, T.topicOut + 0.06);
      sigOut(tl, b, T.topicOut + 0.11);
      Object.assign(this, { strip, clock, liveDot: dot });
      box.topic = { x: GRID.x0, y, w: GRID.x1 - GRID.x0, h: th + kh };
    }

    // ---------------------------------------------------------------- name super (lower third slot, bottom on 1384)
    {
      const nh = 112, rh = 64, y = 1384 - nh - rh, padX = 36;
      const nameCss = `font:${font(800, 4)};letter-spacing:-0.02em`;
      const roleK = fitStep(COPY.role, 1, GRID.x1 - X0 - 56, (k) => `font:${font(400, k)};letter-spacing:-0.01em`);
      const roleCss = `font:${font(400, roleK)};letter-spacing:-0.01em`;
      const nameW = textW(nameCss, COPY.name), roleW = textW(roleCss, COPY.role);
      const nb = bar(slotL, { x: X0, y, w: snap(nameW + padX * 2), h: nh, bg: TOK.ink });
      const rb = bar(slotL, { x: X0, y: y + nh, w: snap(roleW + 28 * 2), h: rh, bg: TOK.paper });
      const nTop = opticTop(`800 ${TS(4)}px ${KR}`, TS(4), COPY.name, nh) - 4;
      const name = el(nb.base, `left:${padX}px;top:${nTop}px;${nameCss};color:${TOK.paper}`, COPY.name, 'abs');
      const rule = el(nb.base, `position:absolute;left:${padX}px;top:${nh - 20}px;width:${nameW}px;height:6px;border-radius:3px;background:${TOK.acc};transform-origin:0 50%`);
      const role = el(rb.base, `left:28px;top:${opticTop(`400 ${TS(roleK)}px ${KR}`, TS(roleK), '붕어빵노점', rh)}px;${roleCss};color:${TOK.ink}`, COPY.role, 'abs');
      const a = T.l3In;
      sigIn(tl, nb, a);
      sigIn(tl, rb, a + 0.12);
      tl.fromTo(name, { y: nh }, { y: 0, duration: 0.64, ease: 'expo.out' }, a + 0.17);
      tl.fromTo(role, { y: rh }, { y: 0, duration: 0.6, ease: 'expo.out' }, a + 0.32);
      tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'sig' }, a + 0.5);
      const o = T.l3Out;
      tl.to(rule, { scaleX: 0, duration: 0.14, ease: 'power2.in' }, o);
      tl.to(name, { y: nh, duration: 0.16, ease: 'power2.in' }, o);
      tl.to(role, { y: rh, duration: 0.16, ease: 'power2.in' }, o + 0.04);
      sigOut(tl, rb, o + 0.06);
      sigOut(tl, nb, o + 0.09);
      box.l3 = { x: GRID.x0, y, w: Math.max(nb.w, rb.w) + STRIPE, h: nh + rh };
    }

    // ---------------------------------------------------------------- data chip (top left slot, over the insert shot)
    {
      const padX = 32, padT = 26, gapY = 10, h = 176;
      const labCss = `font:${font(500, 0)};letter-spacing:-0.01em`;
      const numCss = `font:800 ${TS(5)}px/${TS(5)}px ${KR};letter-spacing:-0.02em;font-variant-numeric:tabular-nums`;
      const unitCss = `font:${font(600, 1)};letter-spacing:-0.01em`;
      const labW = textW(labCss, COPY.chipLabel);
      const prefW = textW(numCss, fmt(COPY.to + 1).slice(0, -1));
      const digW = textW(numCss, '0');
      const unitW = textW(unitCss, COPY.chipUnit);
      const numW = prefW + digW;
      const w = snap(padX + Math.max(labW, numW + 10 + unitW) + padX);
      const b = bar(slotL, { x: X0, y: GRID.top, w, h, bg: TOK.paper });
      const lab = el(b.base, `left:${padX}px;top:${padT}px;${labCss};color:${TOK.inkMute}`, COPY.chipLabel, 'abs');
      const numY = padT + TS(0) + gapY;
      const row = el(b.base, `position:absolute;left:${padX}px;top:${numY}px;height:${TS(5) + 10}px;width:${numW + 10 + unitW}px`);
      const pre = el(row, `left:0;top:4px;${numCss};color:${TOK.ink}`, fmt(COPY.from).slice(0, -1), 'abs');
      const cell = el(row, `position:absolute;left:${prefW}px;top:0;width:${digW}px;height:${TS(5) + 10}px;overflow:hidden`);
      const col = el(cell, `position:absolute;left:0;top:4px;${numCss};color:${TOK.ink};line-height:${TS(5) + 10}px;white-space:pre`, '0\n1');
      const unit = el(row, `left:${numW + 10}px;top:${4 + baseOf(`800 ${TS(5)}px ${KR}`, TS(5)) - baseOf(`600 ${TS(1)}px ${KR}`, TS(1))}px;${unitCss};color:${TOK.ink}`, COPY.chipUnit, 'abs');
      sigIn(tl, b, T.chipIn);
      tl.fromTo(lab, { y: -60 }, { y: 0, duration: 0.6, ease: 'expo.out' }, T.chipIn + 0.16);
      tl.fromTo(row, { y: h }, { y: 0, duration: 0.66, ease: 'expo.out' }, T.chipIn + 0.24);
      tl.to(row, { y: h, duration: 0.18, ease: 'power2.in' }, T.chipOut);
      tl.to(lab, { y: -60, duration: 0.16, ease: 'power2.in' }, T.chipOut + 0.04);
      sigOut(tl, b, T.chipOut + 0.04);
      Object.assign(this, { chipPre: pre, chipCol: col, chipCellH: TS(5) + 10, chipAcc: b.acc });
      box.chip = { x: GRID.x0, y: GRID.top, w: w + STRIPE, h };
    }

    // ---------------------------------------------------------------- quote card (lower third slot, bottom on 1384)
    {
      const padX = 44, padT = 34, markH = 64, lh = Math.round(TS(3) * 1.2), gapBy = 22;
      const qCss = `font:700 ${TS(3)}px/${lh}px ${KR};letter-spacing:-0.025em`;
      const byCss = `font:${font(400, 0)};letter-spacing:-0.01em`;
      const lines = balance(COPY.quote, qCss, GRID.x1 - X0 - padX * 2);
      const lw = lines.map((s) => textW(qCss, s));
      const byW = textW(byCss, COPY.by);
      const w = snap(Math.max(...lw, byW) + padX * 2);
      const h = snap(padT + markH + lines.length * lh + gapBy + TS(0) + padT);
      const b = bar(slotL, { x: X0, y: 1384 - h, w, h, bg: TOK.ink });
      // the big quote mark hangs into the left margin (optical alignment: its ink, not its box, meets the text edge)
      // the opening quote is built from the brand mark: two corner squares, round corner bottom-left (a geometric “)
      const qs = 34, qg = 10;
      const qm = el(b.base, `position:absolute;left:${padX}px;top:${padT + (markH - qs) / 2 - 8}px;width:${qs * 2 + qg}px;height:${qs}px;transform-origin:0% 100%`);
      mark(qm, qs, 0, 0, TOK.acc, 3); mark(qm, qs, qs + qg, 0, TOK.acc, 3);
      const lineEls = lines.map((s, i) => {
        const m = el(b.base, `left:${padX}px;top:${padT + markH + i * lh}px;width:${lw[i] + 8}px;height:${lh}px`, '', 'mask');
        const html = s.includes(COPY.key) ? s.replace(COPY.key, `<span class="key">${COPY.key}</span>`) : s;
        const ln = el(m, `left:0;top:0;${qCss};color:${TOK.paper}`, html, 'abs');
        return ln;
      });
      const by = el(b.base, `left:${padX}px;top:${padT + markH + lines.length * lh + gapBy}px;${byCss};color:${TOK.mute}`, COPY.by, 'abs');
      // the key phrase: measure where it sits, put an accent rule under it
      const keyEl = b.base.querySelector('.key');
      let hl = null;
      if (keyEl) {
        const kr = keyEl.getBoundingClientRect(), br = b.base.getBoundingClientRect();
        const li = lineEls.findIndex((l) => l.contains(keyEl));
        const kx = (kr.left - br.left) / SC, kw = kr.width / SC;
        hl = el(b.base, `position:absolute;left:${kx}px;top:${padT + markH + li * lh + lh - 4}px;width:${kw}px;height:7px;border-radius:4px;background:${TOK.acc};transform-origin:0 50%`);
        tl.fromTo(keyEl, { color: TOK.paper }, { color: TOK.acc, duration: 0.28, ease: 'power1.out' }, T.hl + 0.06);
        tl.fromTo(hl, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power3.out' }, T.hl);
        tl.to(hl, { scaleX: 0, duration: 0.12, ease: 'power2.in' }, T.quoteOut);
      }
      sigIn(tl, b, T.quoteIn);
      tl.fromTo(qm, { scale: 0, rotation: -24 }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.8)' }, T.quoteIn + 0.16);
      lineEls.forEach((ln, i) => tl.fromTo(ln, { yPercent: 112 }, { yPercent: 0, duration: 0.66, ease: 'expo.out' }, T.quoteIn + 0.26 + i * 0.11));
      tl.fromTo(by, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, T.quoteIn + 0.52);
      const o = T.quoteOut;
      tl.to(by, { opacity: 0, duration: 0.12, ease: 'power2.in' }, o);
      lineEls.forEach((ln, i) => tl.to(ln, { yPercent: 112, duration: 0.16, ease: 'power2.in' }, o + i * 0.03));
      tl.to(qm, { scale: 0, duration: 0.16, ease: 'power2.in' }, o + 0.04);
      sigOut(tl, b, o + 0.05);
      const top = Math.min(box.l3.y, b.y);
      box.l3 = { x: GRID.x0, y: top, w: Math.max(box.l3.w, w + STRIPE), h: 1384 - top };
      box.quote = { x: GRID.x0, y: b.y, w: w + STRIPE, h };
    }

    // ---------------------------------------------------------------- stinger: the signature move at full frame + lockup
    {
      const n = 6, sh = 1920 / n;
      const stripes = [];
      for (let i = 0; i < n; i++) stripes.push(bar(stL, { x: -40, y: Math.floor(i * sh) - 1, w: 1160, h: Math.ceil(sh) + 2, bg: TOK.ink, shadow: false }));
      const lock = el(stL, 'position:absolute;left:0;top:0;width:1080px;height:1920px');
      const big = TS(5) * 1.3;
      const wCss = `font:900 ${big}px/${big}px ${KR};letter-spacing:-0.035em`;
      const ww = textW(wCss, COPY.brand), ms = Math.round(big * 0.74), gap = 26;
      const lx = (1080 - (ms + gap + ww)) / 2, ly = 860;
      const mk = mark(lock, ms, lx, ly + (big - ms) / 2);
      const word = el(lock, `left:${lx + ms + gap}px;top:${ly}px;${wCss};color:${TOK.paper}`, COPY.brand, 'abs');
      const tagCss = `font:${font(500, 0)};letter-spacing:0.02em`;
      const tag = el(lock, `left:${(1080 - textW(tagCss, COPY.tag)) / 2}px;top:${ly + big + 34}px;${tagCss};color:${TOK.mute}`, COPY.tag, 'abs');
      stripes.forEach((s, i) => sigIn(tl, s, T.stIn + i * 0.035, 0.78));
      tl.fromTo(mk.m, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.42, ease: 'back.out(1.7)' }, T.stIn + 0.2);
      tl.fromTo(word, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4, ease: 'expo.out' }, T.stIn + 0.24);
      tl.fromTo(tag, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.36, ease: 'expo.out' }, T.stIn + 0.3);
      tl.to([mk.m, word, tag], { opacity: 0, x: 40, duration: 0.14, ease: 'power2.in' }, T.stOut - 0.02);
      stripes.forEach((s, i) => {
        tl.to(s.base, { '--l': 1, duration: 0.34, ease: 'power3.in' }, T.stOut + i * 0.03);
        tl.to(s.acc, { '--l': 1, duration: 0.34, ease: 'power3.in' }, T.stOut + 0.07 + i * 0.03);
      });
    }

    // ---------------------------------------------------------------- guides: 9:16 safe areas, app UI zones, grid, slots
    {
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 1080 1920'); svg.setAttribute('width', 1080); svg.setAttribute('height', 1920);
      svg.style.cssText = 'position:absolute;left:0;top:0';
      gdL.appendChild(svg);
      const S = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
      const defs = S('defs', {});
      const pat = S('pattern', { id: 'hatch123', width: 14, height: 14, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      S('rect', { x: 0, y: 0, width: 3, height: 14, fill: 'rgba(247,243,234,0.30)' }, pat);
      const rpath = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
      const frameG = S('g', { opacity: 0 });
      const zones = [[0, 0, 1080, APP.top], [APP.right, APP.rightTop, 1080 - APP.right, APP.bottom - APP.rightTop], [0, APP.bottom, 1080, 1920 - APP.bottom]];
      const hatch = S('g', {}, frameG);
      for (const [x, y, w, h] of zones) S('rect', { x, y, width: w, height: h, fill: 'url(#hatch123)', opacity: 0.7 }, hatch);
      const [ax0, ay0, ax1, ay1] = SAFE.action, [tx0, ty0, tx1, ty1] = SAFE.gfx;
      const act = S('path', { d: `M${ax0},${ay0}H${ax1}V${ay1}H${ax0}Z`, fill: 'none', stroke: 'rgba(247,243,234,0.7)', 'stroke-width': 2, 'stroke-dasharray': '12 10' }, frameG);
      const ttl = S('path', { d: `M${tx0},${ty0}H${tx1}V${ty1}H${tx0}Z`, fill: 'none', stroke: TOK.acc, 'stroke-width': 2.5, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, frameG);
      const gridG = S('g', { opacity: 0 });
      const cols = [];
      for (let i = 0; i < GRID.cols; i++) {
        const x = GRID.x0 + i * (GRID.col + GRID.gut);
        cols.push(S('rect', { x, y: APP.top, width: GRID.col, height: APP.bottom - APP.top, fill: 'rgba(201,242,58,0.07)', stroke: 'rgba(201,242,58,0.35)', 'stroke-width': 1.5 }, gridG));
      }
      // labels are DOM text in the package's type, set on small ink tags
      const labels = el(gdL, 'position:absolute;inset:0;opacity:0');
      const tag = (parent, x, y, text, { acc = false, lat = false, align = 'left' } = {}) => {
        const css = lat ? `font:700 ${TS(-1)}px/${TS(-1)}px ${LAT};letter-spacing:0.12em` : `font:600 ${TS(-1)}px/${TS(-1)}px ${KR};letter-spacing:-0.005em;font-variant-numeric:tabular-nums`;
        const w = snap(textW(css + (lat ? ';font-variation-settings:"wdth" 84' : ''), text) + 24), h = 40;
        const left = align === 'right' ? x - w : x;
        const t = el(parent, `position:absolute;left:${left}px;top:${y}px;width:${w}px;height:${h}px;border-radius:8px;background:${acc ? TOK.acc : 'rgba(13,23,48,0.86)'}`);
        el(t, `left:12px;top:${opticTop(lat ? `700 ${TS(-1)}px ${LAT}` : `600 ${TS(-1)}px ${KR}`, TS(-1), lat ? 'TITLE' : '액션세이프', h)}px;${css};color:${acc ? TOK.ink : TOK.paper}`, text, lat ? 'abs lat' : 'abs');
        return t;
      };
      const lb = [
        tag(labels, tx0 + 12, ty0 + 12, '타이틀 세이프 90%', { acc: true }),
        tag(labels, ax1 - 12, ay0 + 12, '액션 세이프 93%', { align: 'right' }),
        tag(labels, 1080 - 18, APP.rightTop + 18, '앱 UI', { align: 'right' }),
        tag(labels, 540 - 70, APP.bottom + 24, '세로 앱 UI 영역'),
      ];
      const gridLab = tag(labels, GRID.x0, 560, '6단 그리드 · 8px', { acc: false });
      // opening: draw the title-safe line, hatch the app zones, raise the grid
      tl.fromTo(frameG, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' }, T.guideIn);
      tl.fromTo(ttl, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power3.inOut' }, T.guideIn + 0.05);
      tl.fromTo(act, { opacity: 0 }, { opacity: 1, duration: 0.3 }, T.guideIn + 0.25);
      tl.fromTo(gridG, { opacity: 0 }, { opacity: 1, duration: 0.2 }, T.guideIn + 0.15);
      tl.fromTo(cols, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, T.guideIn + 0.15);
      tl.fromTo(labels, { opacity: 0 }, { opacity: 1, duration: 0.25 }, T.guideIn + 0.35);
      tl.fromTo(lb.concat(gridLab), { y: 10 }, { y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.05 }, T.guideIn + 0.35);
      tl.to([gridG, labels], { opacity: 0, duration: 0.3, ease: 'power2.in' }, T.guideOut);
      tl.to(frameG, { opacity: 0, duration: 0.35, ease: 'power2.in' }, T.guideOut + 0.08);
      // ending: the slot map — each slot outlined at its measured size, with its label and W×H
      const slotG = S('g', { opacity: 0 });
      const endLab = el(gdL, 'position:absolute;inset:0');
      const slots = [
        ['bug', '버그', box.bug, 'right'], ['chip', '데이터 칩', box.chip, 'left'],
        ['l3', '이름 자막 / 인용 카드', box.l3, 'left'], ['topic', '주제 바 + 티커', box.topic, 'left'],
      ];
      const outlines = [], slotTags = [];
      for (const [, name, r, side] of slots) {
        outlines.push(S('path', { d: rpath(r.x, r.y, r.w, r.h, 16), fill: 'rgba(201,242,58,0.08)', stroke: TOK.acc, 'stroke-width': 3, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, slotG));
        const txt = `${name}  ${Math.round(r.w)}×${Math.round(r.h)}`;
        slotTags.push(tag(endLab, side === 'right' ? r.x + r.w - 12 : r.x + 12 + STRIPE, r.y + 12, txt, { acc: true, align: side }));
      }
      // the package card in the free middle of the frame
      const card = el(endLab, 'position:absolute;left:0;top:0');
      const cTitleCss = `font:800 ${TS(3)}px/${TS(3)}px ${KR};letter-spacing:-0.03em`;
      const cSubCss = `font:500 ${TS(0)}px/${Math.round(TS(0) * 1.45)}px ${KR};letter-spacing:-0.01em;font-variant-numeric:tabular-nums`;
      const cy = 640;
      const cm = mark(card, 44, GRID.x0, cy + 8);
      const ct = el(card, `left:${GRID.x0 + 64}px;top:${cy}px;${cTitleCss};color:${TOK.paper}`, '모퉁이 그래픽 패키지', 'abs');
      const scaleRow = el(card, `position:absolute;left:${GRID.x0}px;top:${cy + 100}px;height:100px;display:flex;align-items:baseline;gap:18px;color:${TOK.paper}`);
      for (let k2 = -1; k2 <= 5; k2++) el(scaleRow, `font:800 ${TS(k2)}px/1 ${KR};letter-spacing:-0.02em`, '가');
      const nums = el(card, `left:${GRID.x0}px;top:${cy + 214}px;${cSubCss};color:${TOK.mute}`, `${[-1, 0, 1, 2, 3, 4, 5].map(TS).join(' · ')} px  (×1.25)`, 'abs');
      const spec = el(card, `left:${GRID.x0}px;top:${cy + 258}px;${cSubCss};color:${TOK.mute}`, 'Pretendard + Roboto Flex · 모서리 16 · 그리드 8', 'abs');
      tl.fromTo(dim, { opacity: 0 }, { opacity: 0.72, duration: 0.5, ease: 'power2.out' }, T.endIn);
      tl.to(frameG, { opacity: 1, duration: 0.35, ease: 'power1.out' }, T.endIn + 0.05);
      tl.fromTo(slotG, { opacity: 0 }, { opacity: 1, duration: 0.2 }, T.endIn + 0.16);
      tl.fromTo(outlines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: 'power3.inOut', stagger: 0.08 }, T.endIn + 0.18);
      tl.fromTo(slotTags, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.08 }, T.endIn + 0.42);
      tl.fromTo(cm.m, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }, T.endIn + 0.5);
      tl.fromTo([ct, scaleRow, nums, spec], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out', stagger: 0.07 }, T.endIn + 0.56);
    }

    tl.time(D); tl.time(0);
    this.tl = tl;
  },

  frame(t) {
    this.tl.time(t);
    // scene
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]);
    if (t < CUT) drawA(g, t, this.S); else drawB(g, t, this.S);
    const q = Math.floor(t * 12);
    this.grain.style.transform = `translate(${-((q * 37) % 64)}px, ${-((q * 23 + 11) % 64)}px)`;

    // bug idle: the corner mark turns a quarter every 2.4 s
    const P = 2.4, s0 = 1.7;
    let turn = 0;
    if (t > s0) { const u = (t - s0) / P, n = Math.floor(u); turn = n + inOut3(clamp(((u - n) * P) / 0.55)); }
    this.bugMark.style.transform = `rotate(${(turn * 90).toFixed(3)}deg)`;
    // LIVE dot: 1 Hz
    this.liveDot.style.opacity = (0.35 + 0.65 * (0.5 + 0.5 * Math.cos(t * Math.PI * 2))).toFixed(3);
    // ticker crawl + clock (tabular figures: the clock never changes width)
    const x = t < T.tickIn ? 0 : -(((t - T.tickIn) * CRAWL) % this.loopW);
    this.strip.style.translate = `${x.toFixed(2)}px 0`;
    const sec = 5 + Math.floor(t);
    this.clock.textContent = `21:47:${String(sec).padStart(2, '0')}`;
    // data chip: count up with expo.out, then the ones digit rolls 4 → 5 when the fresh pastry lands
    const v = Math.round(COPY.from + (COPY.to - COPY.from) * outExpo(seg(t, T.count[0], T.count[1])));
    const s = fmt(v);
    const d = Number(s.slice(-1));
    this.chipPre.textContent = s.slice(0, -1);
    this.chipCol.textContent = `${d}\n${(d + 1) % 10}`;
    const roll = t < BEAT ? 0 : outBack(seg(t, BEAT, BEAT + 0.34), 1.3);
    this.chipCol.style.translate = `0 ${(-roll * this.chipCellH).toFixed(2)}px`;
  },
});
