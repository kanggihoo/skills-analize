/*
 * 85 · 스크롤로 읽는 이야기 — "한 잔의 커피가 오기까지", a magazine long-read read by an invisible reader.
 *
 * The article (index.html <template>) lives in a 1080×1600 scroll container on the stage; under it, a reading dock.
 * Everything that moves is a CSS scroll-driven animation (style.css): scroll() for the progress bar and the hero
 * parallax, view() for paragraphs, named view timelines (--s1…--s5, --sum) for each section's illustration, its
 * counter (a registered <integer>) and the sticky header underline; timeline-scope lets the dock and the nav read them.
 *
 * JS does two things: in setup it lays the article out and measures where each section comes to rest under the
 * sticky bar; in frame(t) it sets scrollTop = y(t), a reader's path — a slow drift on each section (reading), a
 * quick flick to the next. In the headless renderer it then awaits one animation frame as a rendering barrier: the
 * browser samples scroll timelines in the frame's "update animations" step, which runs before requestAnimationFrame
 * callbacks, so after that callback every timeline reflects the new scrollTop (measured: synchronously after the
 * write they are stale). Live playback skips the wait — the player draws from a rAF tick and skips ticks while a
 * frame is pending, so awaiting the next rAF there drew only every other display frame (30 fps on a 60 Hz screen).
 * The picture is a pure function of scrollTop, which is a pure function of t.
 */
import { defineDemo, track, smooth, clamp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

const D = 10;
const BAR = 110;             // sticky bar height: a section is "at rest" when its top sits right under it

/** CSS-style cubic-bezier easing (x1, y1, x2, y2), solved by bisection — deterministic */
function bezier(x1, y1, x2, y2) {
  const c = (a, b, t) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  return (p) => {
    p = clamp(p);
    let lo = 0, hi = 1;
    for (let i = 0; i < 32; i++) { const m = (lo + hi) / 2; if (c(x1, x2, m) < p) lo = m; else hi = m; }
    return c(y1, y2, (lo + hi) / 2);
  };
}
const flick = bezier(0.55, 0, 0.12, 1);       // a flick: quick to start, a long glide to a stop
const read = smooth;                          // reading drift: ease in and out of a slow scroll
const settle = bezier(0.4, 0, 0.2, 1);

defineDemo({
  id: '85-scroll-timeline',
  title: '스크롤로 읽는 이야기',
  tech: 'CSS 스크롤 기반 애니메이션(scroll() · view()) · 스크롤 위치 제어',
  duration: D,
  background: '#f6efe1',
  async setup({ stage, headless }) {
    this.barrier = headless;
    const tpl = document.getElementById('article');
    // every glyph the serif headlines use (the Korean fonts load per unicode-range subset)
    const text = Array.from(new Set(tpl.content.textContent.replace(/\s/g, ''))).join('') + '0123456789,%℃';
    await Promise.all([
      fontReady('900 128px "Noto Serif KR"', text),
      fontReady('700 46px "Noto Serif KR"', text),
      fontReady('600 30px "Pretendard Variable"', text),
    ]);

    stage.appendChild(tpl.content.cloneNode(true));
    const root = stage.querySelector('.coffee');
    // the seventy-bean grid (index → its own animation-range offset)
    root.querySelector('.beans70').innerHTML = Array.from({ length: 70 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

    this.reader = root.querySelector('.reader');
    this.ok = !!(window.CSS && CSS.supports('animation-timeline: scroll()') && CSS.supports('animation-range: cover 10px cover 20px'));
    if (!this.ok) {
      const n = document.createElement('div');
      n.className = 'notice';
      n.textContent = '이 브라우저는 CSS 스크롤 기반 애니메이션(animation-timeline)을 지원하지 않습니다. Chrome·Edge 115 이상이나 Safari 26 이상에서 보세요.';
      root.appendChild(n);
      return;
    }

    // where each section comes to rest (layout is fixed: measured once, after the fonts)
    const rest = (sel) => root.querySelector(sel).offsetTop - BAR;
    const R = ['.s1', '.s2', '.s3', '.s4', '.s5'].map(rest);
    const S = rest('.summary');
    const max = this.reader.scrollHeight - this.reader.clientHeight;
    // the reader: [time, scrollTop, easing into this key]
    const keys = [[0, 0], [0.8, 160, read]];
    const beats = [[0.8, 1.4, 2.15], [2.15, 2.75, 3.5], [3.5, 4.1, 4.85], [4.85, 5.45, 6.2], [6.2, 6.8, 7.6]];
    beats.forEach(([, arrive, leave], i) => { keys.push([arrive, R[i] - 40, flick], [leave, R[i] + 60, read]); });
    keys.push([8.2, S - 40, flick], [9.6, Math.min(max, S + 900), settle], [10, Math.min(max, S + 920), read]);
    this.y = track(keys);
    this.reader.scrollTop = 0;
  },
  async frame(t) {
    if (!this.ok) return;
    this.reader.scrollTop = Math.round(this.y(t));
    // rendering barrier for captures: scroll timelines are sampled in the next frame's "update animations" step.
    // Live, the frame being drawn picks the new scrollTop up by itself; waiting here would halve the frame rate.
    if (this.barrier) await new Promise((r) => requestAnimationFrame(r));
  },
});
