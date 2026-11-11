/*
 * 74 · 스프링으로 사는 화면 — Motion (motion.dev) 14: spring physics as the subject of a UI motion showcase.
 *
 * A fictional calm app («쉼표») on a CSS-drawn generic phone. Six interactions, each with its own spring:
 *   notifications drop in and stack · a toggle flips · a finished task sinks in its list · a heart pops ·
 *   a card is flicked away (spring with an initial velocity) · a bottom sheet slides up with overshoot.
 * Above the phone a "spring inspector" shows the spring of the current interaction: its parameters and
 * damping ratio ζ, the step response x(t) sampled from Motion's own spring generator, a playhead and dot
 * at the current time, and a mass on a coil moving with the same x. At the end it lays all six side by side.
 *
 * Seeking: Motion normally hands opacity/transform to WAAPI and renders everything else on its rAF frame
 * loop, so a time set from outside would show up one frame later (or never, in a headless capture).
 * MotionGlobalConfig.useManualTiming = true (set before any animation exists) keeps every animation in JS,
 * and processFrame() runs Motion's frame steps synchronously. Every animation is created once in setup and
 * paused; frame(t) sets controls.time = t − start on all of them and calls processFrame(): a pure function of t.
 * Each element property is animated by exactly one animate() call — a property that moves twice (a card that
 * drops, is pushed back, then promoted) gets one wrapper element per move, because a second animate() on the
 * same value would stop the first.
 */
import { defineDemo, clamp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const M = window.Motion;
M.MotionGlobalConfig.useManualTiming = true;   // before any animation is created (WAAPI stays off)

const D = 10;
const ACC = '#5b6cf0';

// the six springs (k stiffness, c damping, m mass, v initial velocity in units/s of a 0→1 move)
const SEG = [
  { name: '낙하', title: '알림이 내려앉을 때', k: 380, c: 24, m: 1, v: 0, color: '#5b6cf0', at: 0.30, t0: 0.40 },
  { name: '토글', title: '스위치를 켤 때', k: 700, c: 34, m: 0.6, v: 0, color: '#14b8a6', at: 1.76, t0: 1.90 },
  { name: '재정렬', title: '끝낸 일이 아래로 갈 때', k: 260, c: 26, m: 1.1, v: 0, color: '#f59e0b', at: 2.78, t0: 3.15 },
  { name: '좋아요', title: '하트가 터질 때', k: 600, c: 11, m: 1, v: 0, color: '#f43f5e', at: 4.06, t0: 4.20 },
  { name: '던지기', title: '카드를 던져 보낼 때', k: 140, c: 20, m: 1, v: 3.4, color: '#8b5cf6', at: 5.04, t0: 5.43 },
  { name: '시트', title: '시트가 올라올 때', k: 220, c: 17, m: 1.4, v: 0, color: '#0ea5e9', at: 6.20, t0: 6.40 },
];
const SUMMARY_AT = 8.3;
const FLICK = 700, FLICK_V = SEG[4].v * FLICK;      // px and px/s of the throw (2380 px/s)
const zeta = (s) => s.c / (2 * Math.sqrt(s.k * s.m));
const SPR = (s, extra) => ({ type: 'spring', stiffness: s.k, damping: s.c, mass: s.m, ...extra });
const spr = (k, c, m = 1) => ({ type: 'spring', stiffness: k, damping: c, mass: m });
const tw = (duration, e = 'easeOut', extra) => ({ duration, ease: e, ...extra });

// the inspector plot (card px)
const PX0 = 176, PX1 = 924, PY0 = 150, PY1 = 312, TMAX = 1.6, VMIN = -0.12, VMAX = 1.55, NS = 161;   // samples every 10 ms
const PX = (s) => PX0 + (s / TMAX) * (PX1 - PX0);
const PY = (v) => PY1 - ((v - VMIN) / (VMAX - VMIN)) * (PY1 - PY0);

const HEART = 'M12 20.6C12 20.6 3 15.1 3 9 3 6.2 5.1 4 7.8 4c1.8 0 3.3 1 4.2 2.5C12.9 5 14.4 4 16.2 4 18.9 4 21 6.2 21 9c0 6.1-9 11.6-9 11.6z';

function markup() {
  const block = (i, s) => `
    <div class="abs blk"><div class="abs" data-k="bin${i}" style="inset:0;opacity:0"><div class="abs" data-k="bout${i}" style="inset:0">
      <div class="abs t">${s.title}</div>
      <div class="abs p mono">stiffness <b>${s.k}</b>   damping <b>${s.c}</b>   mass <b>${s.m}</b>${s.v ? `   velocity <b>${FLICK_V}px/s</b>` : ''}   <b style="color:${s.color}">ζ ${zeta(s).toFixed(2)}</b></div>
    </div></div></div>`;
  const summary = `
    <div class="abs blk"><div class="abs" data-k="bin6" style="inset:0;opacity:0"><div class="abs" style="inset:0">
      <div class="abs t">여섯 가지 스프링, 한 화면</div>
      <div class="abs chips">${SEG.map((s) => `<span style="--c:${s.color}">${s.name} ζ${zeta(s).toFixed(2)}</span>`).join('')}</div>
    </div></div></div>`;
  const notes = [
    ['물 한 잔 마실 시간이에요', '오늘 목표의 40%를 채웠어요', '지금'],
    ['3분 호흡, 지금 어때요?', '오후 회의 전에 잠깐 쉬어 가요', '5분 전'],
    ['어젯밤 7시간 12분 잤어요', '평소보다 30분 더 잤어요', '1시간 전'],
  ];
  const nest = (i, inner) => ['drop', 'push1', 'push2', 'prom', 'drag', 'throw'].reduceRight(
    (acc, w) => `<div class="abs wrap" data-k="${w}${i}" style="transform-origin:${w === 'drag' || w === 'throw' ? '50% 160%' : '50% 100%'}">${acc}</div>`, inner);
  const card = (i) => nest(i, `
    <div class="abs card ncard">
      <div class="abs appicon"><svg width="56" height="56" viewBox="0 0 56 56"><circle cx="27" cy="23.5" r="8.5" fill="#fff"/><path d="M34.6 25.4C35.6 33.8 31.2 40.4 23.6 43.4" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg></div>
      <div class="abs app">쉼표</div><div class="abs when">${notes[i][2]}</div>
      <div class="abs ti">${notes[i][0]}</div><div class="abs bo">${notes[i][1]}</div>
    </div>`);
  const rows = [['물 2L 마시기', '오전 내내'], ['호흡 3분', '오후 2:00'], ['20분 걷기', '오후 6:00'], ['아침 스트레칭', '완료']];
  const tick = (i, done) => `<div class="abs chk"><div class="abs fill" data-k="fill${i}" style="${done ? '' : 'transform:scale(0)'}"></div>
      <svg width="34" height="34" viewBox="0 0 34 34"><path data-k="mark${i}" d="M10 17.6 L15 22.4 L24.4 12.6" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  const row = (i) => `
    <div class="abs row-slot" data-k="move${i}" style="left:0;top:${72 + 64 * i}px;width:524px;height:64px;z-index:${i === 0 ? 3 : 1}">
      <div class="abs" data-k="lift${i}" style="inset:0">
        ${i === 0 ? '<div class="abs lift" data-k="shadow0" style="opacity:0"></div>' : ''}
        <div class="abs row${i === 3 ? ' done' : ''}">
          ${tick(i, i === 3)}
          <div class="abs lb" data-k="lb${i}">${rows[i][0]}</div>
          ${i === 0 ? '<div class="abs" data-k="strike0" style="left:74px;top:31px;height:2.5px;background:#a3a8ba;border-radius:2px;transform-origin:0 50%"></div>' : ''}
          <div class="abs tm">${rows[i][1]}</div>
        </div>
      </div>
    </div>`;
  const touch = (n, x, y) => `<div class="abs touch" data-k="tch${n}" style="left:${x}px;top:${y}px;opacity:0"><div class="abs" data-k="tmv${n}" style="inset:0"><div class="abs" data-k="tout${n}" style="inset:0"><i></i></div></div></div>`;
  const sparks = Array.from({ length: 8 }, (_, j) => `<div class="abs spark" data-k="spark${j}" style="background:${j % 2 ? '#fbbf24' : '#f43f5e'};opacity:0"></div>`).join('');
  const tabIcon = (x, svg) => `<svg style="left:${x}px" width="44" height="44" viewBox="0 0 44 44">${svg}</svg>`;
  return `
  <div class="bg"></div>
  <div class="abs insp" data-k="insp" style="opacity:0">
    <div class="abs kicker mono">SPRING INSPECTOR</div>
    <div class="abs law mono">F = −k·x − c·v</div>
    <div class="abs mono" data-k="idx" style="right:36px;top:62px;font-size:17px;font-weight:600;color:#9a9fb4"></div>
    ${SEG.map((s, i) => block(i, s)).join('')}${summary}
    <svg width="960" height="344" data-k="plot"></svg>
  </div>
  <div class="abs phone" data-k="phone" style="opacity:0">
    <div class="abs frame"></div>
    <div class="abs key" style="left:-5px;top:236px;height:64px"></div>
    <div class="abs key" style="left:-5px;top:320px;height:112px"></div>
    <div class="abs key" style="right:-5px;top:280px;height:150px"></div>
    <div class="abs screen">
      <div class="abs content" data-k="content">
        <div class="abs status"><div class="abs time">8:30</div>
          <div class="abs bars"><i style="left:0;height:6px"></i><i style="left:7.5px;height:9px"></i><i style="left:15px;height:12px"></i><i style="left:22.5px;height:16px"></i></div>
          <div class="abs batt"></div></div>
        <div class="abs date">10월 30일 금요일</div>
        <div class="abs hello">좋은 아침이에요</div>
        <div class="abs avatar">지</div>
        <div class="abs card dnd">
          <div class="abs moon"></div>
          <div class="abs ti">방해 금지</div><div class="abs bo">알림을 조용히 모아 둘게요</div>
          <div class="abs track" data-k="track"><div class="abs knob" data-k="knob" style="background:none;box-shadow:none"><div class="abs knob" data-k="squash" style="left:0;top:0"></div></div></div>
        </div>
        <div class="abs card routine">
          <div class="abs hd">오늘의 루틴</div>
          <div class="abs cnt" style="width:120px;height:24px"><span class="abs" data-k="cntA" style="right:0">1/4 완료</span><span class="abs" data-k="cntB" style="right:0;opacity:0">2/4 완료</span></div>
          <div class="abs rule" style="top:136px"></div><div class="abs rule" style="top:200px"></div><div class="abs rule" style="top:264px"></div>
          ${[3, 2, 1, 0].map(row).join('')}
        </div>
        <div class="abs card quote">
          <div class="abs lb">오늘의 문장</div>
          <div class="abs q">천천히 가도 괜찮아요.<br>멈추지만 않는다면.</div>
          <div class="abs likes"><span data-k="likeA">128</span><span data-k="likeB" style="color:#f43f5e;opacity:0">129</span></div>
          <div class="abs heartbtn">
            <div class="abs ring" data-k="ring" style="opacity:0"></div>
            ${sparks}
            <div class="abs" data-k="hOut" style="left:15px;top:15px;width:32px;height:32px"><svg width="32" height="32" viewBox="0 0 24 24"><path d="${HEART}" fill="none" stroke="#a3a8ba" stroke-width="2"/></svg></div>
            <div class="abs" data-k="hIn" style="left:15px;top:15px;width:32px;height:32px;transform:scale(0)"><svg width="32" height="32" viewBox="0 0 24 24"><path d="${HEART}" fill="#f43f5e"/></svg></div>
          </div>
        </div>
        <div class="abs stack">${[2, 1, 0].map(card).join('')}</div>
        <div class="abs tabs">
          ${tabIcon(50, `<path d="M10 21 L22 11 L34 21 V33 a2 2 0 0 1 -2 2 H12 a2 2 0 0 1 -2 -2 Z" fill="${ACC}"/><rect x="19" y="25" width="6" height="10" rx="1.5" fill="#fff"/>`)}
          ${tabIcon(193, `<rect x="10" y="22" width="5" height="12" rx="2" fill="#b4b8c8"/><rect x="19.5" y="14" width="5" height="20" rx="2" fill="#b4b8c8"/><rect x="29" y="18" width="5" height="16" rx="2" fill="#b4b8c8"/>`)}
          ${tabIcon(336, `<circle cx="22" cy="22" r="11" fill="none" stroke="#b4b8c8" stroke-width="3.5"/><circle cx="22" cy="22" r="4" fill="#b4b8c8"/>`)}
          ${tabIcon(479, `<circle cx="22" cy="16" r="6" fill="#b4b8c8"/><path d="M10 35 a12 10 0 0 1 24 0 Z" fill="#b4b8c8"/>`)}
        </div>
      </div>
      <div class="abs dim" data-k="dim" style="opacity:0"></div>
      <div class="abs sheet" data-k="sheet" style="transform:translateY(800px)">
        <div class="abs grab"></div>
        <div class="abs" data-k="sh0" style="inset:0"><div class="abs t">3분 호흡</div><div class="abs s">숨을 고르는 짧은 시간</div></div>
        <div class="abs" data-k="sh1" style="inset:0"><div class="abs chips"><span>들숨 4초</span><span>멈춤 4초</span><span>날숨 6초</span></div></div>
        <div class="abs breath" data-k="sh2"><div class="abs halo" data-k="halo" style="opacity:0"></div><div class="abs orb" data-k="orb"><span>들이쉬기</span></div></div>
        <div class="abs go" data-k="sh3">시작하기</div>
      </div>
      ${touch(0, 480, 408)}${touch(1, 65, 578)}${touch(2, 497, 959)}${touch(3, 330, 250)}${touch(4, 290, 250)}
      <div class="abs homebar"></div>
      <div class="abs cam"></div>
    </div>
  </div>
  <div class="abs band"><div class="abs" data-k="chaps" style="left:0;top:52px;width:1080px;display:flex;justify-content:center;gap:12px">
    ${SEG.map((s, i) => `<div class="chap" data-k="chap${i}" style="--c:${s.color}">${s.name}</div>`).join('')}
  </div></div>`;
}

defineDemo({
  id: '74-motion-spring',
  title: '스프링으로 사는 화면',
  tech: 'Motion(motion.dev) · 스프링 물리 · 수동 시계 seek',
  duration: D,
  background: '#efeaf3',
  async setup({ layer }) {
    await Promise.all([
      fontReady(`700 34px "${FONTS.pretendard.family}"`, '가나다'),
      fontReady(`500 18px "${FONTS.jetbrainsMono.family}"`, 'SPRING INSPECTOR stiffness damping mass velocity px/s ζ0123456789.−·= F'),
    ]);
    const root = layer('div', { z: 1 });
    root.classList.add('ui');
    root.innerHTML = markup();
    const $ = (k) => {
      const e = root.querySelector(`[data-k="${k}"]`);
      if (!e) throw new Error(`missing element ${k}`);
      return e;
    };

    $('strike0').style.width = `${$('lb0').offsetWidth + 4}px`;   // the strike-through spans the label it crosses out

    // ------------------------------------------------------------------ the choreography
    const runs = [];
    /** create a paused Motion animation that starts at `at` seconds of the demo */
    const go = (at, el, keyframes, options) => {
      const c = M.animate(el, keyframes, options);
      c.pause();
      runs.push({ c, at });
      return c;
    };

    // 0 — the phone and the inspector arrive
    go(0.0, $('phone'), { y: [46, 0], opacity: [0, 1] }, spr(120, 20));
    go(0.08, $('insp'), { y: [-24, 0], opacity: [0, 1] }, spr(160, 22));

    // inspector titles: each block slides in at its chapter and out at the next one
    SEG.forEach((s, i) => {
      go(i === 0 ? 0.16 : s.at + 0.05, $('bin' + i), { opacity: [0, 1], y: [16, 0] }, spr(320, 30));
      const next = i + 1 < SEG.length ? SEG[i + 1].at : SUMMARY_AT;
      go(next - 0.03, $('bout' + i), { opacity: [1, 0], y: [0, -12] }, tw(0.16, 'easeIn'));
    });
    go(SUMMARY_AT + 0.05, $('bin6'), { opacity: [0, 1], y: [16, 0] }, spr(320, 30));

    // 1 — notifications drop in (spring A); each new one pushes the stack back, scaled about its bottom edge
    const A = SEG[0];
    const S1 = 0.95, S2 = 0.948, T1 = 16, T2 = 15;          // depth 1 and 2: scale and downward offset
    go(0.40, $('drop2'), { y: [-380, 0] }, SPR(A));
    go(0.62, $('drop1'), { y: [-380, 0] }, SPR(A));
    go(0.70, $('push12'), { y: [0, T1], scale: [1, S1] }, SPR(A));
    go(0.84, $('drop0'), { y: [-380, 0] }, SPR(A));
    go(0.92, $('push11'), { y: [0, T1], scale: [1, S1] }, SPR(A));
    go(0.92, $('push22'), { y: [0, T2], scale: [1, S2] }, SPR(A));

    // 2 — the toggle: a stiff, light spring (B) for the knob, a squash on the way, the track takes the colour
    const Bs = SEG[1];
    go(1.80, $('tch0'), { opacity: [0, 1], scale: [0.5, 1] }, tw(0.12));
    go(2.04, $('tout0'), { opacity: [1, 0], scale: [1, 1.35] }, tw(0.26));
    go(1.90, $('knob'), { x: [0, 40] }, SPR(Bs));
    go(1.90, $('squash'), { scaleX: [1, 1.24, 1], scaleY: [1, 0.92, 1] }, tw(0.3, 'easeInOut'));
    go(1.92, $('track'), { backgroundColor: ['#e3e4ea', ACC] }, tw(0.22));

    // 3 — a task is ticked off and sinks below the open ones (spring C); the others close up
    const C = SEG[2];
    go(2.80, $('tch1'), { opacity: [0, 1], scale: [0.5, 1] }, tw(0.12));
    go(3.00, $('tout1'), { opacity: [1, 0], scale: [1, 1.35] }, tw(0.26));
    go(2.88, $('fill0'), { scale: [0, 1] }, spr(520, 20));
    go(2.96, $('mark0'), { pathLength: [0, 1] }, tw(0.26, 'easeOut'));
    go(3.02, $('lb0'), { opacity: [1, 0.45] }, tw(0.3));
    go(3.02, $('strike0'), { scaleX: [0, 1] }, tw(0.3, 'easeInOut'));
    go(3.00, $('cntA'), { opacity: [1, 0], y: [0, -16] }, tw(0.18, 'easeIn'));
    go(3.08, $('cntB'), { opacity: [0, 1], y: [16, 0] }, SPR(C));
    go(3.12, $('lift0'), { scale: [1, 1.035, 1] }, tw(0.8, 'easeInOut'));
    go(3.12, $('shadow0'), { opacity: [0, 1, 0] }, tw(0.8, 'easeInOut'));
    go(3.15, $('move0'), { y: [0, 128] }, SPR(C));
    go(3.19, $('move1'), { y: [0, -64] }, SPR(C));
    go(3.23, $('move2'), { y: [0, -64] }, SPR(C));

    // 4 — like: a very underdamped spring (E) pops the heart; a ring and sparks; the count rolls over
    const E = SEG[3];
    go(4.12, $('tch2'), { opacity: [0, 1], scale: [0.5, 1] }, tw(0.12));
    go(4.30, $('tout2'), { opacity: [1, 0], scale: [1, 1.35] }, tw(0.26));
    go(4.20, $('hOut'), { opacity: [1, 0], scale: [1, 0.6] }, tw(0.12));
    go(4.20, $('hIn'), { scale: [0, 1] }, SPR(E));
    go(4.20, $('ring'), { scale: [0.5, 1.9] }, tw(0.5, 'easeOut'));
    go(4.20, $('ring'), { opacity: [0, 0.9, 0] }, tw(0.5, 'easeOut', { times: [0, 0.15, 1] }));
    for (let j = 0; j < 8; j++) {
      const a = -Math.PI / 2 + (j * Math.PI) / 4, r = j % 2 ? 50 : 62;
      go(4.24, $('spark' + j), { x: [0, r * Math.cos(a)], y: [0, r * Math.sin(a)] }, tw(0.6, 'circOut'));
      go(4.24, $('spark' + j), { opacity: [0, 1, 0], scale: [0.6, 1.25, 0.2] }, tw(0.6, 'easeOut', { times: [0, 0.14, 1] }));
    }
    go(4.24, $('likeA'), { y: [0, -26], opacity: [1, 0] }, tw(0.2, 'easeIn'));
    go(4.28, $('likeB'), { y: [26, 0], opacity: [0, 1] }, SPR(E));

    // 5 — flick: the finger drags the front card a little, lets go, and a spring with the release velocity
    // (F, v₀ = 2380 px/s) carries it off the screen; the cards behind step forward
    const F = SEG[4];
    go(5.06, $('tch3'), { opacity: [0, 1], scale: [0.5, 1] }, tw(0.1));
    go(5.15, $('tmv3'), { x: [0, 64] }, tw(0.28, 'easeIn'));
    go(5.43, $('tout3'), { opacity: [1, 0], scale: [1, 1.3] }, tw(0.22));
    go(5.15, $('drag0'), { x: [0, 64], rotate: [0, 2.5] }, tw(0.28, 'easeIn'));
    go(5.43, $('throw0'), { x: [0, FLICK] }, SPR(F, { velocity: FLICK_V }));
    go(5.43, $('throw0'), { rotate: [0, 16] }, SPR(F, { velocity: 60 }));
    // promotion undoes the push exactly: nested scale/offset about the same bottom-centre origin
    const P = spr(420, 30);
    go(5.58, $('prom1'), { y: [0, -T1 / S1], scale: [1, 1 / S1] }, P);
    go(5.62, $('prom2'), { y: [0, -(S1 * T2) / (S1 * S2)], scale: [1, 1 / S2] }, P);

    // 6 — tap the breathing reminder: the screen recedes, the sheet comes up with overshoot (spring G)
    const G = SEG[5];
    go(6.16, $('tch4'), { opacity: [0, 1], scale: [0.5, 1] }, tw(0.1));
    go(6.34, $('tout4'), { opacity: [1, 0], scale: [1, 1.35] }, tw(0.24));
    go(6.18, $('drag1'), { scale: [1, 0.97, 1] }, tw(0.3, 'easeInOut'));
    go(6.40, $('dim'), { opacity: [0, 1] }, tw(0.35));
    go(6.40, $('content'), { scale: [1, 0.94], y: [0, 10] }, spr(260, 30, 1.2));
    go(6.40, $('sheet'), { y: [800, 0] }, SPR(G));
    for (let i = 0; i < 4; i++) go(6.56 + 0.07 * i, $('sh' + i), { y: [34, 0], opacity: [0, 1] }, spr(300, 26));
    // the calm ending: one slow breath in
    go(8.15, $('orb'), { scale: [0.86, 1] }, tw(1.75, 'easeInOut'));
    go(8.15, $('halo'), { scale: [0.8, 1.22] }, tw(1.75, 'easeInOut'));
    go(8.15, $('halo'), { opacity: [0, 1, 0.5] }, tw(1.75, 'easeInOut', { times: [0, 0.6, 1] }));

    // prime: every animation to its end and back once, so each value has been written by Motion and a fresh
    // page shows the same inline styles as one that was seeked back
    for (const e of root.querySelectorAll('[style]')) e.style.cssText = e.style.cssText;   // one serialisation
    [0.05, 0.15, 0.4, 60, 0].forEach((x, i) => {
      for (const r of runs) r.c.time = x;
      M.processFrame(500 + i * 100);
    });
    this.runs = runs;

    // ------------------------------------------------------------------ the inspector (drawn from t)
    // step responses sampled from Motion's own spring generator — the same physics the UI runs on
    const SAMP = SEG.map((s) => {
      const g = M.spring({ keyframes: [0, 1], stiffness: s.k, damping: s.c, mass: s.m, velocity: s.v, restDelta: 1e-5, restSpeed: 1e-5 });
      const a = new Float32Array(NS);
      for (let i = 0; i < NS; i++) a[i] = g.next(i * 10).value;
      return a;
    });
    const mixers = SEG.map((s, i) => (i ? M.mix(SEG[i - 1].color, s.color) : null));
    const svg = $('plot');
    const SV = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent = svg) => {
      const e = document.createElementNS(SV, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      parent.appendChild(e);
      return e;
    };
    const txt = (x, y, s, attrs, mono = true) => {
      const e = mk('text', { x, y, ...attrs });
      e.style.fontFamily = mono ? `"${FONTS.jetbrainsMono.family}", monospace` : `"${FONTS.pretendard.family}", sans-serif`;
      e.textContent = s;
      return e;
    };
    // axes
    mk('line', { x1: PX0, x2: PX1, y1: PY(0), y2: PY(0), stroke: '#e3e5ec', 'stroke-width': 2 });
    mk('line', { x1: PX0, x2: PX1, y1: PY(1), y2: PY(1), stroke: '#c9ccd8', 'stroke-width': 1.5, 'stroke-dasharray': '6 7' });
    txt(PX1, PY(1) - 8, '목표', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 600, fill: '#a3a8ba' }, false);
    for (let k = 0; k <= 4; k++) txt(PX(k * 0.4), PY1 + 24, k === 4 ? '1.6 s' : (k * 0.4).toFixed(1), { 'text-anchor': k === 0 ? 'start' : k === 4 ? 'end' : 'middle', 'font-size': 14, fill: '#a3a8ba' });
    const family = SEG.map((s) => mk('path', { fill: 'none', stroke: s.color, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }));
    const ghost = mk('path', { fill: 'none', stroke: '#d6d9e3', 'stroke-width': 2.5, 'stroke-dasharray': '1 7', 'stroke-linecap': 'round' });
    const live = mk('path', { fill: 'none', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const head = mk('line', { y1: PY0 - 4, y2: PY1, 'stroke-width': 2, opacity: 0.25 });
    const halo = mk('circle', { r: 17, opacity: 0.18 });
    const dot = mk('circle', { r: 8, stroke: '#fff', 'stroke-width': 3 });
    const read = txt(PX1, PY0 - 14, '', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 500, fill: '#6b7085' });
    // the mass on a coil (x down = the same x(t))
    const MX = 92, CEIL = PY0 - 2;
    mk('line', { x1: MX - 30, x2: MX + 30, y1: CEIL, y2: CEIL, stroke: '#9a9fb4', 'stroke-width': 3, 'stroke-linecap': 'round' });
    for (let k = 0; k < 5; k++) mk('line', { x1: MX - 26 + k * 13, x2: MX - 34 + k * 13, y1: CEIL, y2: CEIL - 8, stroke: '#c3c6d3', 'stroke-width': 2 });
    const coil = mk('polyline', { fill: 'none', stroke: '#6b7085', 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
    const weight = mk('rect', { x: MX - 26, width: 52, height: 32, rx: 9 });
    const shine = mk('rect', { x: MX - 18, width: 22, height: 5, rx: 2.5, fill: '#fff', opacity: 0.45 });
    const idx = $('idx'), chaps = SEG.map((_, i) => $('chap' + i));

    const cv = new Float32Array(NS);
    const pathOf = (a, upto, n = NS) => {
      let d = '';
      const last = Math.min(n - 1, Math.floor(upto / 0.01));
      for (let i = 0; i <= last; i++) d += `${i ? 'L' : 'M'}${PX(i * 0.01).toFixed(1)},${PY(a[i]).toFixed(1)}`;
      if (upto / 0.01 > last && last < n - 1) {
        const f = upto / 0.01 - last, v = a[last] + (a[last + 1] - a[last]) * f;
        d += `L${PX(upto).toFixed(1)},${PY(v).toFixed(1)}`;
      }
      return d;
    };
    const sample = (a, s) => {
      const x = clamp(s, 0, TMAX) / 0.01, i = Math.min(NS - 2, Math.floor(x)), f = x - i;
      return a[i] + (a[i + 1] - a[i]) * f;
    };
    this.inspect = (t) => {
      let k = 0;
      for (let i = 0; i < SEG.length; i++) if (t >= SEG[i].at) k = i;
      const s = SEG[k];
      const e = k ? ease.outCubic(clamp((t - s.at) / 0.4)) : 1;            // the curve morphs into the new spring
      const from = k ? SAMP[k - 1] : SAMP[0], to = SAMP[k];
      for (let i = 0; i < NS; i++) cv[i] = from[i] + (to[i] - from[i]) * e;
      const col = k ? mixers[k](e) : s.color;
      const sm = ease.inOutCubic(clamp((t - SUMMARY_AT) / 0.5));          // the summary takes over
      const el = clamp(t - s.t0, 0, TMAX);
      const v = sample(cv, el);
      ghost.setAttribute('d', pathOf(cv, TMAX));
      ghost.setAttribute('opacity', (1 - sm).toFixed(3));
      live.setAttribute('d', pathOf(cv, el));
      live.setAttribute('stroke', col);
      live.setAttribute('opacity', (1 - sm).toFixed(3));
      const x = PX(el), y = PY(v);
      head.setAttribute('x1', x.toFixed(1)); head.setAttribute('x2', x.toFixed(1));
      head.setAttribute('stroke', col); head.setAttribute('opacity', (0.25 * (1 - sm)).toFixed(3));
      for (const c of [halo, dot]) { c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('fill', col); }
      halo.setAttribute('opacity', (0.18 * (1 - sm)).toFixed(3));
      dot.setAttribute('opacity', (1 - sm).toFixed(3));
      read.textContent = `t ${el.toFixed(2)} s   x ${v.toFixed(2)}`;
      read.setAttribute('opacity', (1 - sm).toFixed(3));
      // the six curves, drawn one after another for the summary
      SEG.forEach((_, i) => {
        const p = ease.outCubic(clamp((t - SUMMARY_AT - 0.08 * i) / 0.7));
        family[i].setAttribute('d', p > 0 ? pathOf(SAMP[i], TMAX * p) : '');
        family[i].setAttribute('opacity', sm.toFixed(3));
      });
      // mass and coil: rest length 46 px, 60 px per unit of x; in the summary it settles at x = 1
      const vx = v + (1 - v) * sm;
      const top = CEIL + 4, wy = CEIL + 46 + 60 * vx;
      let pts = `${MX},${top} ${MX},${top + 6}`;
      const n = 12, span = wy - 6 - (top + 6);
      for (let i = 1; i < n; i++) pts += ` ${MX + (i % 2 ? 13 : -13)},${(top + 6 + (span * i) / n).toFixed(1)}`;
      pts += ` ${MX},${(wy - 6).toFixed(1)} ${MX},${wy.toFixed(1)}`;
      coil.setAttribute('points', pts);
      weight.setAttribute('y', wy.toFixed(1)); weight.setAttribute('fill', col);
      shine.setAttribute('y', (wy + 6).toFixed(1));
      idx.textContent = t >= SUMMARY_AT ? '06 / 06' : `0${k + 1} / 06`;
      // the chapter pills in the band
      chaps.forEach((c, i) => {
        const on = t >= SUMMARY_AT ? true : i === k && t >= SEG[0].at;
        const past = i < k;
        c.style.background = on ? SEG[i].color : 'transparent';
        c.style.borderColor = on ? SEG[i].color : past ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.2)';
        c.style.color = on ? '#fff' : past ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.5)';
      });
    };
  },
  frame(t) {
    for (const r of this.runs) r.c.time = Math.max(0, t - r.at);
    M.processFrame(1000 + t * 1000);   // runs Motion's update + render steps now, with every animation at its held time
    this.inspect(t);
  },
});
