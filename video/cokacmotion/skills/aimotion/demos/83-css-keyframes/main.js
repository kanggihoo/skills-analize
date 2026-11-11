/*
 * 83 · CSS로만 그린 일출 — a sunrise over layered mountains and a lake, drawn and animated entirely in CSS.
 *
 *   sky        linear-gradient whose four stops are registered <color> properties (@property) animated by one
 *              "palette" @keyframes — the colour script of the whole piece, inherited by every layer
 *   sun        radial-gradient disc + glow whose radius is a registered <length>; conic rays: two repeating
 *              conic-gradients whose start angle is a registered <angle> (they turn as the sun climbs)
 *   mountains  clip-path: polygon() silhouettes that unfold from low folded shapes (vertex-for-vertex morph), and
 *              lit facets (a second polygon per ridge) that grow on every sun-facing slope, screen-blended
 *   mist       blurred radial blobs, mix-blend-mode screen / soft-light
 *   birds      CSS arcs on offset-path (offset-distance keyframes, offset-rotate: auto), wings flapping
 *   lake       a mirrored (scaleY(-1)), blurred clone of the scene; ripple stripes on a plane tilted in 3-D;
 *              a glitter path masked around the sun's reflection
 *   type       "오늘도 해는 뜬다" (Gowun Batang), glyphs staggered; a clock from two registered <integer>s + counters
 *
 * Seeking: every animation is paused, and its delay is (start − t) — see the first rule in style.css.
 * frame(t) writes one custom property, --t. JS never touches the animated styles.
 */
import { defineDemo } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { ridgeCSS, starShadows } from './ridges.js';

const D = 10;
const LINE = '오늘도 해는 뜬다';
const LINE_START = 6.35, LINE_STEP = 0.12;      // first glyph appears at 6.35 s, then one every 0.12 s

// birds: start (s), flight time (s), path in stage px, scale at start → end, wing beat (s), wing phase (s)
const BIRDS = [
  [4.9, 4.6, 'M -70 860 C 220 700, 520 770, 760 560 S 1050 360, 1170 330', 0.95, 0.6, 0.44, 0.00],
  [5.15, 4.4, 'M -90 930 C 200 800, 470 830, 720 640 S 1010 430, 1170 410', 0.82, 0.54, 0.47, 0.13],
  [5.45, 4.5, 'M -60 790 C 260 650, 560 700, 800 520 S 1080 330, 1180 290', 0.72, 0.5, 0.41, 0.29],
  [5.8, 4.2, 'M -100 990 C 180 870, 430 880, 700 700 S 960 520, 1160 480', 0.66, 0.46, 0.5, 0.07],
  [6.05, 4.0, 'M -80 880 C 240 760, 500 780, 740 600 S 1000 420, 1170 380', 0.56, 0.4, 0.43, 0.21],
];

// long thin clouds: [left, top, [[x, y, w, h], …]]
const CLOUDS = [
  ['c1', 70, 470, [[0, 0, 360, 22], [90, 30, 300, 16], [40, -26, 180, 12]]],
  ['c2', 600, 380, [[0, 0, 300, 18], [70, 26, 380, 22], [210, -22, 150, 11]]],
  ['c3', 300, 610, [[0, 0, 420, 16], [130, 22, 260, 12]]],
];

function sceneMarkup() {
  const clouds = CLOUDS.map(([c, x, y, pills]) => `<div class="cloud ${c}" style="left:${x}px;top:${y}px">${
    pills.map(([px, py, w, h]) => `<i style="left:${px}px;top:${py}px;width:${w}px;height:${h}px"></i>`).join('')}</div>`).join('');
  return `
    <div class="sky"></div>
    <div class="stars"><i class="a" style="box-shadow:${starShadows(5, 70)}"></i><i class="b" style="box-shadow:${starShadows(9, 60)}"></i></div>
    <div class="moon"></div>
    ${clouds}
    <div class="sunrig"><div class="glow"></div><div class="rays"></div><div class="sun"></div></div>
    <div class="ridge r1"><div class="lit l1"></div></div>
    <div class="mist m1"></div>
    <div class="ridge r2"><div class="lit l2"></div></div>
    <div class="mist m2"></div>
    <div class="ridge r3"><div class="lit l3"></div></div>
    <div class="mist m3"></div>
    <div class="ridge r4"><div class="lit l4"></div></div>`;
}

function markup() {
  const birds = BIRDS.map(([start, dur, path, s0, s1, flap, wing]) =>
    `<div class="bird" style="offset-path:path('${path}');--phase:${start}s;--dur:${dur}s;--s0b:${s0};--s1b:${s1};--flap:${flap}s;--wing:${wing}s"></div>`).join('');
  let i = 0;
  const glyphs = Array.from(LINE).map((ch) => (ch === ' ' ? '<span class="sp"></span>'
    : `<span class="g" style="--phase:${(LINE_START + LINE_STEP * i++).toFixed(2)}s">${ch}</span>`)).join('');
  return `
  <div class="world">
    <div class="scene">${sceneMarkup()}</div>
    <div class="lake">
      <div class="mirror" aria-hidden="true"></div>
      <div class="water"></div>
      <div class="ripples"><div class="plane"><div class="wave"></div></div></div>
      <div class="glitter"></div>
      <div class="shore"></div>
      <div class="deep"></div>
    </div>
    <div class="birds">${birds}</div>
    <div class="line" aria-label="${LINE}">${glyphs}</div>
    <div class="rule"></div>
    <div class="clock"></div>
    <div class="grain"></div>
  </div>`;
}

defineDemo({
  id: '83-css-keyframes',
  title: 'CSS로만 그린 일출',
  tech: 'CSS @keyframes · @property · conic/radial-gradient · clip-path · mix-blend-mode',
  duration: D,
  background: '#0b0a22',
  async setup({ stage }) {
    await Promise.all([
      fontReady('700 94px "Gowun Batang"', LINE),
      fontReady('600 30px "Pretendard Variable"', '오전 0123456789:'),
    ]);
    // the mountain polygons (keyframes) are generated once, as CSS text
    const style = document.createElement('style');
    style.textContent = ridgeCSS();
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.className = 'sunrise';
    root.style.setProperty('--t', '0');
    root.innerHTML = markup();
    stage.appendChild(root);
    // the reflection is the scene itself, cloned: same classes → the same paused animations at the same --t
    // (the conic rays are left out of the reflection: invisible in water, and the largest layer to paint)
    const mirror = root.querySelector('.mirror');
    for (const el of root.querySelector('.scene').children) mirror.appendChild(el.cloneNode(true));
    mirror.querySelector('.rays').remove();

    // without @property the gradients cannot interpolate; say so on the stage (the piece still draws)
    if (!(window.CSS && CSS.registerProperty)) {
      const n = document.createElement('div');
      n.className = 'notice';
      n.textContent = '이 브라우저는 CSS @property를 지원하지 않아 색이 바뀌지 않습니다.';
      root.appendChild(n);
    }
    this.root = root;
  },
  frame(t) {
    // the only thing JS does per frame: set the clock every animation reads its delay from
    this.root.style.setProperty('--t', t.toFixed(4));
  },
});
