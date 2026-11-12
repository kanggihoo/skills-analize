/*
 * 67 · 글자가 입장하는 법 — a brand-film manifesto on motion, set in the DOM and cut in four scenes
 * (a hard cut every 2.5 s = five beats at 120 bpm). Warm paper, ink, one accent (vermilion) and one
 * full-bleed vermilion scene at the peak.
 *
 *   01  좋은 움직임은 / 보이지 않는다      SplitText lines inside line masks slide up, cut on the exit
 *   02  필요한 건 속도 → 기교 → 리듬        ScrambleText swaps the hero word (Hangul set) and its Latin gloss
 *                                          (Latin set) while a vermilion strike crosses out each wrong answer
 *   03  다만, 느껴진다                      vermilion field; per-syllable stagger on an anticipate-overshoot
 *                                          CustomEase, then the word bursts apart and reassembles vertically
 *   04  조용히 들어와 / 정확히 멈춘다.       per-syllable rise inside line masks, the full stop drops and squashes
 *
 * Determinism: every split happens in setup after the fonts load, everything is one paused master timeline,
 * frame(t) only seeks it (tl.time(t)). ScrambleTextPlugin picks its scramble glyphs with Math.random and keeps
 * a "time of the last reshuffle" per tween, so its output depends on seek history; after setup initialises
 * every tween, each tween's plugin data is pinned (speed = ∞ → never reshuffles by itself) and frame(t) hands
 * it a glyph string chosen from a rand(seed) pool by floor(t·20) — the same picture for the same t.
 */
import { defineDemo, rand } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { SplitText } from '../node_modules/gsap/SplitText.js';
import { ScrambleTextPlugin } from '../node_modules/gsap/ScrambleTextPlugin.js';
import { CustomEase } from '../node_modules/gsap/CustomEase.js';

gsap.registerPlugin(SplitText, ScrambleTextPlugin, CustomEase);

const D = 10;
const CUT = [2.5, 5.0, 7.5];            // hard cuts (beats 5, 10, 15 at 120 bpm)
const PAPER = '#f3eee4', INK = '#16130f', VERM = '#e2401c', CREAM = '#fbf6ec';
const M = 88;                           // outer margin
const BAND = 1672;                      // solid ink band under the harness caption
const SCRAMBLE_HZ = 20;                 // scramble glyphs change 20× a second (ScrambleText's default speed)

const KR = `"${FONTS.pretendard.family}"`, HAH = `"${FONTS.hahmlet.family}"`, MJ = `"${FONTS.notoSerifKR.family}"`;
const FRA = `"${FONTS.fraunces.family}"`, INS = `"${FONTS.instrumentSerif.family}"`;

// ---------------------------------------------------------------- eases (CustomEase: drawn curves, pure functions)
CustomEase.create('reveal', 'M0,0 C0.14,0.7 0.24,1 1,1');                          // long, soft landing
CustomEase.create('anticipate', 'M0,0 C0.12,0 0.22,-0.1 0.3,-0.1 0.4,-0.1 0.48,1.1 0.62,1.1 0.74,1.1 0.84,1 1,1'); // dip, overshoot, settle
CustomEase.create('settle', 'M0,0 C0.1,0.62 0.24,1.09 0.42,1.09 0.58,1.09 0.7,1 1,1');  // overshoot 9 %, settle
CustomEase.create('burst', 'M0,0 C0.04,0.62 0.16,1 1,1');                           // explosive start

// ---------------------------------------------------------------- scramble glyph sets
const HANGUL = '가간결경고공구국글금기길나날너노누느다달도동두들라람로루리림마만말모무문물바반밤별보봄불비빛사산새선설소속손수숨시신아안어언여열영오온우울움월이인일자장저전정조주지진차참처천초춤타토파포하한해허현호화흐힘';
const LATIN = 'abcdefghijklmnopqrstuvwxyz';
const CAPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
/** n strings of len glyphs drawn from chars with rand(seed) — the only source of scramble glyphs */
function pool(chars, seed, n = 24, len = 48) {
  const r = rand(seed), a = Array.from(chars);
  return Array.from({ length: n }, () => Array.from({ length: len }, () => a[Math.floor(r() * a.length)]).join(''));
}

const CSS = `
.m67 { font-kerning: normal; }
.m67 .abs { position:absolute; left:${M}px; white-space:nowrap; margin:0; }
.m67 .w-mask { padding:0 .16em; margin:0 -.16em; }         /* room for italic overhang inside word masks */
.m67 .mk { display:inline-block; overflow:clip; padding:0 .16em; margin:0 -.16em; vertical-align:top; }
.m67 .mk > span { display:inline-block; }
`;

defineDemo({
  id: '67-gsap-splittext',
  title: '글자가 입장하는 법',
  tech: 'GSAP SplitText · ScrambleText · CustomEase — 라인 마스크 · 글자 스태거 · 스크램블',
  duration: D,
  background: PAPER,
  async setup(api) {
    const { stage } = api;
    const ALL_KR = '움직임에 관하여좋은 움직임은보이지 않는다무엇이 움직이게 하는가필요한 건느낌에 관하여그래서조용히 들어와정확히 멈춘다움직임에 관한 네 개의 문장';
    await Promise.all([
      fontReady(`800 140px ${KR}`, ALL_KR + HANGUL),
      fontReady(`800 300px ${HAH}`, '속도기교리듬' + HANGUL),
      fontReady(`900 220px ${MJ}`, '느껴진다'),
      fontReady(`500 84px ${MJ}`, '다만,'),
      fontReady(`italic 300 76px ${FRA}`, 'not but speed, flair, rhythm. 01/04' + LATIN + DIGITS),
      fontReady(`600 22px ${FRA}`, 'ON MOTION A MANIFESTO IN FOUR CUTS' + CAPS),
      fontReady(`italic 400 64px ${INS}`, 'Good motion goes unseen. only felt. Enter softly. Stop exactly. No. 67 fin.'),
    ]);

    const root = api.layer('div', { z: 1 });
    root.className = 'm67';
    root.style.pointerEvents = 'none';
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);

    const div = (parent, css, html = '') => {
      const e = document.createElement('div');
      e.style.cssText = css;
      e.innerHTML = html;
      parent.appendChild(e);
      return e;
    };
    const text = (parent, top, font, color, html, extra = '') => {
      const e = div(parent, `top:${top}px;font:${font};color:${color};${extra}`, html);
      e.className = 'abs';
      return e;
    };
    const scene = (bg) => div(root, `position:absolute;inset:0;${bg ? `background:${bg};` : ''}visibility:hidden;opacity:0`);
    // layout is read in setup only, in stage pixels
    const sc = stage.getBoundingClientRect().width / 1080 || 1;
    const rel = (e) => {
      const r = e.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: (r.left - s.left) / sc, y: (r.top - s.top) / sc, w: r.width / sc, h: r.height / sc };
    };
    /** baseline offset (px) inside a line box set in `font` (the zero-size marker sits on the baseline) */
    const baseline = (font) => {
      const p = div(root, `position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;font:${font}`, '다<span style="display:inline-block;width:0;height:0"></span>');
      const b = (p.lastChild.getBoundingClientRect().top - p.getBoundingClientRect().top) / sc;
      p.remove();
      return b;
    };
    const kicker = (parent, top, color, barColor) => {
      const k = div(parent, `position:absolute;left:${M}px;top:${top}px;height:40px;display:flex;align-items:center;gap:20px`);
      const bar = div(k, `width:48px;height:6px;background:${barColor};transform-origin:0 50%`);
      const tx = div(k, `font:600 30px/1 ${KR};letter-spacing:-0.01em;color:${color};white-space:nowrap`);
      return { bar, tx };
    };

    // ============================================================ scenes (all laid out now, hidden until their cut)
    const S = [scene(), scene(), scene(VERM), scene()];
    S[0].style.visibility = 'visible'; S[0].style.opacity = '1';

    // 01 ---------------------------------------------------------
    const k1 = kicker(S[0], 572, INK, VERM);
    const st1 = text(S[0], 640, `800 140px/1.2 ${KR}`, INK, '좋은 움직임은<br>보이지 않는다', 'letter-spacing:-0.045em');
    const la1 = text(S[0], 1010, `italic 400 66px/1.2 ${INS}`, INK, 'Good motion goes unseen.');

    // 02 ---------------------------------------------------------
    const k2 = kicker(S[1], 470, INK, VERM);
    const need = text(S[1], 548, `300 100px/1.2 ${KR}`, INK, '필요한 건', 'letter-spacing:-0.03em');
    const wordMask = div(S[1], `position:absolute;left:${M - 24}px;top:680px;overflow:clip;padding:0 24px;line-height:0`);
    const word = div(wordMask, `display:inline-block;vertical-align:top;transform-origin:50% 100%;font:800 300px/1.15 ${HAH};letter-spacing:-0.02em;color:${INK};white-space:nowrap`, '속도');
    const la2 = text(S[1], 1052, `italic 300 78px/1.2 ${FRA}`, INK,
      '<span class="mk"><span>not</span></span> <span class="mk"><span>speed,</span></span>',
      'font-variation-settings:"opsz" 144, "SOFT" 100, "WONK" 1');
    const [latA, latB] = la2.querySelectorAll('.mk > span');
    const strikeBox = div(S[1], 'position:absolute;overflow:clip');
    const strikes = [0, 1].map(() => div(strikeBox, `position:absolute;inset:0;background:${VERM}`));
    const dots = [0, 1, 2].map(() => div(S[1], `position:absolute;width:22px;height:22px;border-radius:50%;background:${VERM}`));

    // 03 ---------------------------------------------------------
    const k3 = kicker(S[2], 300, CREAM, CREAM);
    const daman = text(S[2], 384, `500 84px/1.2 ${MJ}`, CREAM, '다만,', 'letter-spacing:-0.02em');
    const hero = text(S[2], 700, `900 220px/1.2 ${MJ}`, CREAM, '느껴진다', 'letter-spacing:-0.03em');
    const la3 = text(S[2], 1468, `italic 400 84px/1.2 ${INS}`, CREAM, 'only felt.', `left:auto;right:${M}px`);

    // 04 ---------------------------------------------------------
    const k4 = kicker(S[3], 572, INK, VERM);
    const st4 = text(S[3], 640, `800 140px/1.2 ${KR}`, INK, '조용히 들어와<br>정확히 멈춘다', 'letter-spacing:-0.045em');
    const la4 = text(S[3], 1010, `italic 400 66px/1.2 ${INS}`, INK, 'Enter softly. Stop exactly.');
    const stop = div(S[3], `position:absolute;width:32px;height:32px;border-radius:50%;background:${VERM};transform-origin:50% 100%`);
    const signRule = div(S[3], `position:absolute;left:${M}px;top:1508px;width:${1080 - 2 * M}px;height:2px;background:${INK};transform-origin:0 50%`);
    const signL = text(S[3], 1530, `500 26px/1.3 ${KR}`, 'rgba(22,19,15,.62)', '움직임에 관한 네 개의 문장');
    const signR = text(S[3], 1518, `italic 400 44px/1.2 ${INS}`, VERM, 'fin.', `left:auto;right:${M}px`);

    // chrome: header, progress, footer, the caption band ------------
    const chrome = div(root, 'position:absolute;inset:0;z-index:5');
    const head = text(chrome, 82, `600 22px/1 ${FRA}`, INK, '', 'letter-spacing:.26em');
    const counter = div(chrome, `position:absolute;right:${M}px;top:72px;display:flex;align-items:baseline;gap:10px;font:italic 300 34px/1 ${FRA};color:${INK};font-variant-numeric:tabular-nums`);
    const cur = div(counter, 'min-width:1.2em;text-align:right');
    const tot = div(counter, '', '/ 04');
    const rule = div(chrome, `position:absolute;left:${M}px;top:132px;width:${1080 - 2 * M}px;height:2px;background:rgba(22,19,15,.2);transform-origin:0 50%`);
    const prog = div(chrome, `position:absolute;left:${M}px;top:131px;width:${1080 - 2 * M}px;height:4px;background:${INK};transform-origin:0 50%`);
    const foot = div(chrome, `position:absolute;left:${M}px;right:${M}px;top:1600px;display:flex;justify-content:space-between;align-items:baseline;color:${INK}`);
    const footL = div(foot, `font:600 18px/1 ${FRA};letter-spacing:.28em`, 'A MANIFESTO IN FOUR CUTS');
    const footR = div(foot, `font:italic 400 32px/1 ${INS}`, 'No. 67');
    div(root, `position:absolute;left:0;top:${BAND}px;width:1080px;height:${1920 - BAND}px;background:${INK};z-index:6`);

    // ============================================================ splits (fonts are loaded, layout is final)
    const sp1 = new SplitText(st1, { type: 'lines', mask: 'lines', linesClass: 'ln' });
    const sl1 = new SplitText(la1, { type: 'words', mask: 'words', wordsClass: 'w' });
    const spN = new SplitText(need, { type: 'lines,words,chars', mask: 'lines' });
    const spD = new SplitText(daman, { type: 'chars' });
    const spH = new SplitText(hero, { type: 'chars' });          // Korean: one char = one syllable (Intl.Segmenter)
    const sl3 = new SplitText(la3, { type: 'words', mask: 'words', wordsClass: 'w' });
    const sp4 = new SplitText(st4, { type: 'lines,words,chars', mask: 'lines' });
    const sl4 = new SplitText(la4, { type: 'words', mask: 'words', wordsClass: 'w' });

    // ---- measurements for the moves that leave the text flow (before any tween writes a transform)
    // 02: strike across the hero word, three beat dots after it
    const wr = rel(word), wb = baseline(`800 300px/1.15 ${HAH}`);
    Object.assign(strikeBox.style, { left: `${(wr.x - 22).toFixed(1)}px`, top: `${(wr.y + wb - 130).toFixed(1)}px`, width: `${(wr.w + 44).toFixed(1)}px`, height: '20px' });
    dots.forEach((d, i) => Object.assign(d.style, { left: `${(wr.x + wr.w + 36 + i * 38).toFixed(1)}px`, top: `${(wr.y + wb - 22).toFixed(1)}px` }));
    // 03: where each syllable goes when the word bursts, and where it lands in the vertical stack
    const R3 = rand(6703);
    const VS = 1.4, STEP = 220 * VS * 0.95, CX = 540, CY = 852;
    const BURST = [[-150, -360, -20, 1.18], [-40, 300, 14, 0.78], [90, -210, -10, 1.32], [190, 330, 24, 0.9]];
    const heroMoves = spH.chars.map((c, i) => {
      const r = rel(c), cx = r.x + r.w / 2, cy = r.y + r.h / 2, b = BURST[i % 4];
      return {
        burst: { x: b[0] + (R3() - 0.5) * 70, y: b[1] + (R3() - 0.5) * 70, rotation: b[2] + (R3() - 0.5) * 10, scale: b[3] },
        stack: { x: CX - cx, y: CY + (i - (spH.chars.length - 1) / 2) * STEP - cy },
      };
    });
    // 04: the full stop sits on the baseline right after the last syllable
    const last = rel(sp4.chars[sp4.chars.length - 1]), b4 = baseline(`800 140px/1.2 ${KR}`);
    Object.assign(stop.style, { left: `${(last.x + last.w + 6).toFixed(1)}px`, top: `${(last.y + b4 - 32).toFixed(1)}px` });

    // ============================================================ the master timeline
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', lazy: false } });
    const scrambles = [];
    /** ScrambleText tween (registered so frame(t) can feed it deterministic glyphs) */
    const scramble = (target, to, chars, seed, at, duration, extra = {}) => {
      const tw = gsap.to(target, { duration, ease: 'none', scrambleText: { text: to, chars, speed: 1, ...extra } });
      tl.add(tw, at);
      scrambles.push({ tw, pool: pool(chars, seed), offset: (seed * 7) % 24 });
    };
    // a hard cut is a 1 ms autoAlpha tween (never a zero-duration set, whose state at the exact cut time
    // would depend on the direction the playhead arrived from)
    const cut = (from, to, at) => {
      tl.to(from, { autoAlpha: 0, duration: 0.001, ease: 'none' }, at);
      tl.to(to, { autoAlpha: 1, duration: 0.001, ease: 'none' }, at);
    };
    const kickIn = (k, label, at, seed) => {
      tl.fromTo(k.bar, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'reveal' }, at);
      scramble(k.tx, label, HANGUL, seed, at + 0.04, 0.55);
    };

    // chrome
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'reveal' }, 0);
    tl.fromTo(prog, { scaleX: 0 }, { scaleX: 1, duration: D, ease: 'none' }, 0);
    scramble(head, 'ON MOTION', CAPS, 11, 0.06, 0.6);
    scramble(cur, '01', DIGITS, 12, 0.12, 0.35);
    tl.fromTo([tot, footL, footR], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'settle', stagger: 0.08 }, 0.18);
    CUT.forEach((at, i) => scramble(cur, `0${i + 2}`, DIGITS, 13 + i, at, 0.3));

    // 01 · lines rise out of their masks, then leave on the cut
    kickIn(k1, '움직임에 관하여', 0.22, 21);
    tl.fromTo(sp1.lines, { yPercent: 118 }, { yPercent: 0, duration: 0.95, ease: 'reveal', stagger: 0.14 }, 0.36);
    tl.fromTo(sl1.words, { yPercent: 108 }, { yPercent: 0, duration: 0.72, ease: 'settle', stagger: 0.07 }, 1.02);
    tl.to(sp1.lines, { yPercent: -118, duration: 0.3, ease: 'power3.in', stagger: 0.05 }, CUT[0] - 0.3);
    tl.to(sl1.words, { yPercent: -108, duration: 0.24, ease: 'power3.in', stagger: 0.025 }, CUT[0] - 0.26);
    cut(S[0], S[1], CUT[0]);

    // 02 · the answer is crossed out twice and scrambled until it is right
    const t2 = CUT[0];
    kickIn(k2, '무엇이 움직이게 하는가', t2, 22);
    tl.fromTo(spN.chars, { yPercent: 112 }, { yPercent: 0, duration: 0.62, ease: 'reveal', stagger: 0.045 }, t2 + 0.02);
    tl.fromTo(word, { yPercent: 104 }, { yPercent: 0, duration: 0.66, ease: 'settle' }, t2 + 0.08);
    tl.fromTo([latA, latB], { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'settle', stagger: 0.07 }, t2 + 0.2);
    const strike = (bar, at) => {
      tl.fromTo(bar, { xPercent: -101 }, { xPercent: 0, duration: 0.2, ease: 'power3.inOut' }, at);
      tl.to(bar, { xPercent: 101, duration: 0.2, ease: 'power3.in' }, at + 0.22);
    };
    strike(strikes[0], t2 + 0.66);
    scramble(word, '기교', HANGUL, 31, t2 + 0.86, 0.36, { revealDelay: 0.1 });
    scramble(latB, 'flair,', LATIN, 32, t2 + 0.88, 0.34);
    strike(strikes[1], t2 + 1.3);
    scramble(word, '리듬', HANGUL, 33, t2 + 1.5, 0.4, { revealDelay: 0.12 });
    scramble(latA, 'but', LATIN, 34, t2 + 1.5, 0.3);
    scramble(latB, 'rhythm.', LATIN, 35, t2 + 1.54, 0.42);
    tl.to([word, latB], { color: VERM, duration: 0.16, ease: 'none' }, t2 + 1.72);
    tl.fromTo(dots, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', stagger: 0.125 }, t2 + 1.95);   // sixteenths at 120 bpm
    tl.fromTo(word, { scaleY: 1 }, { scaleY: 0.94, duration: 0.0625, ease: 'power2.out', yoyo: true, repeat: 5 }, t2 + 1.95);
    cut(S[1], S[2], CUT[1]);

    // 03 · peak: the word arrives syllable by syllable, bursts, and reassembles as a column
    const t3 = CUT[1];
    kickIn(k3, '느낌에 관하여', t3, 23);
    tl.fromTo(spD.chars, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'settle', stagger: 0.06 }, t3 + 0.02);
    tl.fromTo(spH.chars, { y: 250, rotation: 12 }, { y: 0, rotation: 0, duration: 0.52, ease: 'anticipate', stagger: 0.06 }, t3 + 0.08);
    tl.fromTo(spH.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: 'none', stagger: 0.06 }, t3 + 0.2);
    tl.to(spH.chars, {
      x: (i) => heroMoves[i].burst.x, y: (i) => heroMoves[i].burst.y, rotation: (i) => heroMoves[i].burst.rotation,
      scale: (i) => heroMoves[i].burst.scale, duration: 0.36, ease: 'burst', stagger: 0.015,
    }, t3 + 1.0);
    tl.to(spH.chars, {
      x: (i) => heroMoves[i].stack.x, y: (i) => heroMoves[i].stack.y, rotation: 0, scale: VS,
      duration: 0.5, ease: 'settle', stagger: 0.05,
    }, t3 + 1.38);
    tl.fromTo(sl3.words, { yPercent: 108 }, { yPercent: 0, duration: 0.6, ease: 'settle', stagger: 0.08 }, t3 + 1.72);
    cut(S[2], S[3], CUT[2]);

    // 04 · resolution: syllables rise in their line masks, the full stop lands
    const t4 = CUT[2];
    kickIn(k4, '그래서', t4, 24);
    tl.fromTo(sp4.chars, { yPercent: 112 }, { yPercent: 0, duration: 0.6, ease: 'reveal', stagger: 0.032 }, t4 + 0.04);
    tl.fromTo(sl4.words, { yPercent: 108 }, { yPercent: 0, duration: 0.66, ease: 'settle', stagger: 0.06 }, t4 + 0.55);
    const LAND = t4 + 1.25;                 // the full stop falls (accelerating), squashes, and springs back
    tl.fromTo(stop, { y: -480 }, { y: 0, duration: 0.4, ease: 'power3.in' }, LAND - 0.4);
    tl.fromTo(stop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, ease: 'none' }, LAND - 0.4);
    tl.fromTo(stop, { scaleX: 1, scaleY: 1 }, { scaleX: 1.4, scaleY: 0.66, duration: 0.07, ease: 'power2.out' }, LAND);
    tl.to(stop, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.32)' }, LAND + 0.07);
    tl.fromTo(signRule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'reveal' }, t4 + 1.2);
    tl.fromTo([signL, signR], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'settle', stagger: 0.1 }, t4 + 1.32);

    // ---- initialise every tween in order (forward to the end, back to 0), then pin the scramble plugin's data
    tl.time(D);
    tl.time(0);
    for (const s of scrambles) {
      for (let pt = s.tw._pt; pt; pt = pt._next) if (pt.d && pt.d.charSet) s.data = pt.d;
      if (!s.data) throw new Error('ScrambleTextPlugin internals not found (gsap version changed?)');
      s.data.speed = Infinity;      // the plugin reshuffles only when |Δtime| > speed: never
    }
    this.tl = tl;
    this.scrambles = scrambles;
  },
  frame(t) {
    const k = Math.floor(t * SCRAMBLE_HZ + 1e-6);
    for (const s of this.scrambles) s.data.chars = s.pool[(k + s.offset) % s.pool.length];
    this.tl.time(t);
  },
});
