/*
 * 75 · 코드로 쓴 로티 — a Lottie composition written in code (no After Effects) and played by lottie-web's SVG renderer.
 *
 * weather.js builds the bodymovin JSON with lottie-kit.js (layers, shape groups, keyframes with bezier eases):
 *   a badge whose outline draws itself (trim path) and fills with sky like a liquid (animated mask) → the sun rises inside it
 *   (track matte) and fans its rays out (repeater) → a cloud drifts in with an overshoot → the cloud morphs into a rain cloud
 *   (path keyframes) while the sky gradient darkens and rain streaks fall (precomp of time-offset precomps, matted) →
 *   lightning: the bolt path shoots out of a spark, the frame flashes and the badge shakes (parented nulls) → it clears,
 *   a rainbow draws band by band → the badge morphs into a rounded square, rises and shrinks, and four icon tiles (precomps,
 *   one nesting the rain precomp behind its own matte) pop in. The Korean type is a DOM overlay (OFL fonts) driven by t.
 *
 * Time: lottie.loadAnimation({ autoplay: false }) and frame(t) → anim.goToAndStop(t * 1000, false). lottie-web renders
 * synchronously and evaluates every property from the frame number (its caches are keyed on the last frame and reset
 * when going backwards), so the picture is a function of t. Its rAF loop only runs for playing animations — never here.
 */
import { defineDemo, track, ease, clamp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { buildAnimation, D, STATES, TEMP } from './weather.js';

const ramp01 = (t, a, b) => clamp((t - a) / (b - a));

defineDemo({
  id: '75-lottie-code',
  title: '코드로 쓴 로티',
  tech: 'lottie-web · 트림 패스 · 리피터 · 매트 · 셰이프 모프 (JSON을 코드로 작성)',
  duration: D,
  background: '#FFF4DE',

  async setup(api) {
    const lottie = window.lottie;
    if (!lottie) throw new Error('lottie-web did not load (window.lottie missing)');
    await fontReady('400 120px "Black Han Sans"', '0123456789비온뒤무지개');
    await fontReady('800 56px "Pretendard Variable"', '오늘의날씨서울하루하늘맑음구름조금비천둥번개무지개°아이콘다섯가지');

    // ---- lottie: JSON written in code, deep-copied because lottie-web rewrites tangents in place while loading ----
    const data = buildAnimation();
    this.json = data;
    const host = api.layer('div', { z: 1 });
    const anim = lottie.loadAnimation({
      container: host, renderer: 'svg', loop: false, autoplay: false,
      animationData: JSON.parse(JSON.stringify(data)),
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: false },
    });
    // lottie catches its own render errors and only emits an 'error' event — keep it so frame() can surface it
    this.lottieError = null;
    anim.addEventListener('error', (e) => { this.lottieError = e; console.error('lottie error', e && (e.nativeError || e)); });
    if (!anim.isLoaded) {
      await new Promise((resolve, reject) => {
        anim.addEventListener('DOMLoaded', resolve);
        anim.addEventListener('data_failed', () => reject(new Error('lottie: data_failed')));
      });
    }
    if (this.lottieError) throw new Error('lottie failed while loading: ' + String(this.lottieError.nativeError || this.lottieError));
    this.anim = anim;

    // ---- DOM overlay ----
    const ov = api.layer('div', { z: 2 });
    ov.className = 'ov';
    const el = (parent, tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; parent.appendChild(e); return e; };
    this.head = el(ov, 'div', 'head', '<b>오늘의 날씨</b><span>서울 · 하루의 하늘</span>');
    const temp = el(ov, 'div', 'temp');
    const strips = [0, 1].map(() => {
      const d = el(temp, 'div', 'digit');
      return el(d, 'div', 'strip', [...'01234567890'].map((c) => `<div>${c}</div>`).join(''));
    });
    el(temp, 'div', 'deg', '°');
    this.temp = temp; this.strips = strips;
    this.tempAt = track(TEMP.map(([t, v]) => [t, v, ease.inOutCubic]));

    this.pill = el(ov, 'div', 'pill');
    const win = el(this.pill, 'div', 'win', STATES.map(([, s]) => `<div>${s}</div>`).join(''));
    this.win = win;

    const title = el(ov, 'div', 'title');
    this.letters = [];
    for (const ch of '비 온 뒤 무지개') {
      const s = el(title, 'span', ch === ' ' ? 'sp' : '', ch === ' ' ? '&nbsp;' : ch);
      if (ch !== ' ') this.letters.push(s);
    }
    this.sub = el(ov, 'div', 'sub', '오늘의 날씨 아이콘 <i>다섯 가지</i>');
    this.css = new Map();     // last written style per element (skip identical writes; the value is a function of t)
  },

  set(e, prop, v) {
    let m = this.css.get(e);
    if (!m) { m = {}; this.css.set(e, m); }
    if (m[prop] !== v) { m[prop] = v; e.style[prop] = v; }
  },

  frame(t) {
    this.anim.goToAndStop(t * 1000, false);
    if (this.lottieError) throw new Error('lottie render error: ' + String(this.lottieError.nativeError || this.lottieError));

    // header: slides in, temperature rolls like an odometer
    const h = ease.outCubic(ramp01(t, 0.1, 0.7));
    this.set(this.head, 'opacity', h.toFixed(3));
    this.set(this.head, 'transform', `translateY(${((1 - h) * -24).toFixed(2)}px)`);
    this.set(this.temp, 'opacity', h.toFixed(3));
    this.set(this.temp, 'transform', `translateY(${((1 - h) * -24).toFixed(2)}px)`);
    const v = this.tempAt(t), ones = ((v % 10) + 10) % 10, tens = Math.floor(v / 10) + clamp(ones - 9, 0, 1);
    this.set(this.strips[1], 'transform', `translateY(${(-ones * 132).toFixed(2)}px)`);
    this.set(this.strips[0], 'transform', `translateY(${(-tens * 132).toFixed(2)}px)`);

    // the weather word: pops in, rolls to the next word at each change, leaves before the final layout
    let idx = 0;
    for (let k = 1; k < STATES.length; k++) idx += ease.outBack(ramp01(t, STATES[k][0] - 0.05, STATES[k][0] + 0.35), 1.4);
    this.set(this.win, 'transform', `translateY(${(-idx * 88).toFixed(2)}px)`);
    const pin = ease.outBack(ramp01(t, 1.18, 1.55), 2.2), pout = ease.inCubic(ramp01(t, 7.85, 8.15));
    const ps = Math.max(0, pin * (1 - pout));
    this.set(this.pill, 'transform', `scale(${ps.toFixed(4)})`);
    this.set(this.pill, 'visibility', ps > 0.001 ? 'visible' : 'hidden');

    // the final label: letters spring up one by one, then the subline
    this.letters.forEach((s, n) => {
      const p = ramp01(t, 8.55 + n * 0.07, 9.05 + n * 0.07);
      const k = ease.outBack(p, 2.4);
      this.set(s, 'transform', `translateY(${((1 - k) * 60).toFixed(2)}px) scale(${Math.max(0, k).toFixed(4)})`);
      this.set(s, 'opacity', clamp(p * 4).toFixed(3));
    });
    const sb = ease.outCubic(ramp01(t, 9.05, 9.5));
    this.set(this.sub, 'opacity', sb.toFixed(3));
    this.set(this.sub, 'transform', `translateY(${((1 - sb) * 16).toFixed(2)}px)`);
  },
});
