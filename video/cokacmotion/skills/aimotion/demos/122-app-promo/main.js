/*
 * 122 · 목마르기 전에 — the app-promo film: a phone mockup in 3D, a touch indicator that drives every change,
 * screen transitions that follow the UI's own logic, feature callouts outside the device and an end card.
 * The app (촉촉, plant watering reminders), its UI, the device and the store-style badge are all invented here.
 *
 *   0.0–2.0  the phone swoops up into a 3/4 view; the home list staggers in; callout 01 rings the monstera card
 *   2.0–4.1  tap → the card expands into the detail screen (container transform: the thumbnail grows into the hero,
 *            the name flies into the title) while the phone turns to the other 3/4 view; numbers count; callout 02
 *   4.2–6.5  tap "물 줬어요" → the gauge fills 18 → 72 %, droplets pop out of the screen; a sheet slides up with the
 *            next date (chips stagger in); callout 03
 *   6.3–8.1  tap "알림 맞추기" → the sheet drops; the touch glides to the segmented tab → the content slides sideways
 *            to a growth chart whose bars rise; callout 04
 *   8.2–10   end card: the phone lies back low in the frame, the app icon pops, the name rises, the value line and
 *            a store-style badge (designed here, no real store) — and the touch presses the badge
 *
 * Rendering: DOM for all type and UI (two levels: small UI text inside the screen, big promo headlines outside),
 * one CSS 3D rig for the device (12 extruded slabs + body + screen), SVG for leader lines and droplets, Canvas 2D
 * for the backdrop. One paused GSAP timeline drives the entrances, exits and transitions; frame(t) = tl.time(t)
 * plus closed-form extras (float, touch indicator, ripples, leader geometry from the projected 3D pose, droplets).
 */
import { defineDemo, rand, clamp, lerp, ease, ramp } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';

const D = 10;
const KR = `"${FONTS.pretendard.family}"`;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

// palette: sage paper, deep-green ink, one accent (water blue)
const C = {
  bg1: '#eef3e4', bg2: '#d3e3c9', ink: '#17352a', ink2: '#5b7366', ink3: '#97a79c',
  acc: '#2c7bf2', accP: '#e3edff', ui: '#f4f7f1',
};

// device geometry (body px). The rig's centre sits at (RCX, RCY) on the stage, the camera looks from there.
const PW = 500, PH = 1036, BZ = 12;
const RCX = 540, RCY = 1092, PERSP = 2400;
const SLABS = 12, SLAB_STEP = 3.4;            // extrusion: 12 slabs, 41 px deep

// ---------------------------------------------------------------- story clock (seconds)
const T = { c1: 0.55, c1o: 1.98, ex: 2.0, c2: 2.78, c2o: 4.1, water: 4.54, sheet: 4.9, c3: 5.2, c3o: 6.48,
  down: 6.44, tab: 6.86, c4: 7.08, c4o: 8.12, end: 8.18 };
// the touch indicator's visits, in screen px: a = appears, g = glides in from the previous visit, p = press, u = release, f = fades
const TAPS = [
  { x: 190, y: 371, a: 1.55, p: 1.84, u: 1.94, f: 2.1, el: 'card0', rip: 'rip0' },
  { x: 238, y: 930, a: 4.2, p: 4.44, u: 4.52, f: 4.72, el: 'btn', rip: 'ripB' },
  { x: 238, y: 908, a: 6.06, p: 6.26, u: 6.34, f: null, el: 'sbtn', rip: 'ripS' },
  { x: 238, y: 514, g: [6.42, 6.72], p: 6.76, u: 6.84, f: 7.02, el: 'seg1', rip: 'ripG' },
];
const ETAP = { x: 702, y: 864, a: 9.16, p: 9.4, u: 9.48, f: 9.76 };   // the end-card press, stage px

// callouts: promo headline (kicker + two lines) + a leader line to a UI element (screen px) that is being demonstrated
const CO = [
  { side: 'L', n: '01', kick: '오늘 할 일', l1: '오늘 물 줄 식물,', l2: '<em>한눈에</em> 쏙', c: T.c1, o: T.c1o, box: [68, 371, 80, 80, 40] },
  { side: 'R', n: '02', kick: '흙 수분 체크', l1: '목마른 정도를', l2: '<em>숫자로</em> 딱', c: T.c2, o: T.c2o, box: [389, 716, 118, 74, 20] },
  { side: 'L', n: '03', kick: '물주기 알림', l1: '<em>톡 한 번</em>이면', l2: '알림까지 끝', c: T.c3, o: T.c3o, box: [238, 824, 444, 78, 24] },
  { side: 'R', n: '04', kick: '성장 기록', l1: '자라는 시간도', l2: '<em>차곡차곡</em>', c: T.c4, o: T.c4o, box: [409.5, 752, 50, 160, 16] },
];
const ANCHOR_Y = 452;                         // leader lines leave the headline block here

const PLANTS = [
  { name: '몬스테라', meta: '거실 창가 · 7일마다', due: '오늘', on: true, bg: '#ddf0e1', art: 'monstera' },
  { name: '바질', meta: '부엌 창틀 · 3일마다', due: '오늘', on: true, bg: '#f6edcd', art: 'basil' },
  { name: '스투키', meta: '침실 · 14일마다', due: '3일 뒤', on: false, bg: '#f9e4d7', art: 'stucky' },
  { name: '고무나무', meta: '현관 · 10일마다', due: '5일 뒤', on: false, bg: '#dfeaf8', art: 'rubber' },
];
const GROWTH = [38, 41, 43, 46, 50, 53, 57, 61];          // cm, the last eight months
const MONTHS = ['12월', '1월', '2월', '3월', '4월', '5월', '6월', '7월'];

// ---------------------------------------------------------------- small drawn icons (24-unit grid)
const ICON = {
  home: '<path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.2H9v5.2H5.5A1.5 1.5 0 0 1 4 19z"/>',
  cal: '<rect x="3.8" y="5.5" width="16.4" height="14.5" rx="3"/><path d="M3.8 10h16.4M8.2 3.6v3.6M15.8 3.6v3.6"/>',
  chart: '<path d="M5 20v-7M10 20V8M15 20v-5M20 20V5"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.3-3.8 4.2-5.6 7.5-5.6s6.2 1.8 7.5 5.6"/>',
  drop: '<path d="M12 3.2c-.4.5-6.6 7.6-6.6 11.9a6.6 6.6 0 0 0 13.2 0c0-4.3-6.2-11.4-6.6-11.9z"/>',
  bell: '<path d="M6.2 16.5V11a5.8 5.8 0 0 1 11.6 0v5.5l1.7 1.8H4.5z"/><path d="M10 20.6a2.1 2.1 0 0 0 4 0"/>',
  check: '<path d="M5 12.6 9.8 17.2 19 7.4"/>',
  back: '<path d="M14.8 5.2 8 12l6.8 6.8"/>',
  more: '<circle cx="5.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.5" cy="12" r="1.7"/>',
  get: '<rect x="6.5" y="2.8" width="11" height="18.4" rx="2.8"/><path d="M12 7.4v7.4M8.9 11.8 12 14.9l3.1-3.1"/>',
  arrow: '<path d="M12 5v13M6.5 12.6 12 18l5.5-5.4"/>',
};
const icon = (k, size, color, fill = false, sw = 2) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" ${fill ? `fill="${color}"` : `fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`}>${ICON[k]}</svg>`;

// ---------------------------------------------------------------- plant illustrations (flat, drawn in a 100-unit box)
// a monstera leaf in leaf units: petiole joint at (0, −0.05), tip at (0, −1); the slits are cut with a mask
const LEAF = 'M0 -.05C.1 .04 .42 .06 .55 -.2C.66 -.45 .5 -.82 0 -1C-.5 -.82 -.66 -.45 -.55 -.2C-.42 .06 -.1 .04 0 -.05Z';
const LEAF_R = 'M0 -.05C.1 .04 .42 .06 .55 -.2C.66 -.45 .5 -.82 0 -1Z';
const SLITS = [[0.13, -0.24, 0.74, -0.16], [0.12, -0.48, 0.76, -0.53], [0.09, -0.7, 0.6, -0.86]]
  .map(([a, b, c, d]) => `M${a} ${b}L${c} ${d}M${-a} ${b}L${-c} ${d}`).join('');
const VEINS = 'M0 -.04Q.03 -.5 0 -.95' + [[0.03, -0.36, 0.57, -0.34], [0.03, -0.6, 0.56, -0.68], [0.02, -0.82, 0.36, -0.95]]
  .map(([a, b, c, d]) => `M${a} ${b}L${c} ${d}M${-a} ${b}L${-c} ${d}`).join('');

const leafMask = (m) => `<mask id="${m}" maskUnits="userSpaceOnUse" x="-2" y="-2" width="4" height="4"><path d="${LEAF}" fill="#fff"/>` +
  `<path d="${SLITS}" stroke="#000" stroke-width=".05" stroke-linecap="round"/></mask>`;
const leafG = (m, x, y, r, L, c1, c2, cv) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${L})">` +
  `<path d="${LEAF}" fill="${c1}" mask="url(#${m})"/><path d="${LEAF_R}" fill="${c2}" mask="url(#${m})"/>` +
  `<path d="M0 -.04Q.03 -.5 0 -.95" fill="none" stroke="${cv}" stroke-width=".03" stroke-linecap="round"/></g>`;
const pot = (c1, c2, rim) => `<path d="M33 70h34l-4 22.5a4 4 0 0 1-4 3.3H41a4 4 0 0 1-4-3.3z" fill="${c1}"/>` +
  `<path d="M50 70h17l-4 22.5a4 4 0 0 1-4 3.3h-9z" fill="${c2}"/><rect x="30" y="64.5" width="40" height="8.5" rx="3.5" fill="${rim}"/>`;

let maskSeq = 0;
const ART = {
  monstera() {
    const m = `lm${++maskSeq}`;
    return `<defs>${leafMask(m)}</defs>` +
      '<path d="M49 66Q45 53 37 42M51 66Q55 52 59 39M50 66Q50 60 49 55" fill="none" stroke="#3b8a56" stroke-width="2.4" stroke-linecap="round"/>' +
      leafG(m, 37, 42, -44, 30, '#3e9a5e', '#2f8250', '#7ccb97') +
      leafG(m, 59, 39, 27, 30, '#3e9a5e', '#2f8250', '#7ccb97') +
      leafG(m, 49, 55, -6, 25, '#55b474', '#41a061', '#93d8aa') +
      pot('#e07b53', '#cf6a44', '#ec8d66');
  },
  basil() {
    const lv = (x, y, r, s, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C5.5 -3 6.5 -11.5 0 -17.5C-6.5 -11.5 -5.5 -3 0 0Z" fill="${c}"/>` +
      '<path d="M0 -1.5V-14" stroke="#a5df98" stroke-width=".9" stroke-linecap="round"/></g>';
    return '<path d="M50 68V33M50 58 40 47M50 52 61 42M50 44 42 34" stroke="#4f9a45" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      lv(50, 60, -82, 0.9, '#4fa046') + lv(50, 58, 82, 0.9, '#4fa046') + lv(40, 47, -55, 1, '#5db352') + lv(61, 42, 55, 1, '#5db352') +
      lv(42, 34, -35, 0.9, '#6cc15f') + lv(50, 35, 6, 1.05, '#6cc15f') + lv(57, 30, 42, 0.75, '#7acb6c') +
      pot('#e9d7b2', '#dcc79e', '#f2e3c2');
  },
  stucky() {
    const cy = (x, h, r, c) => `<g transform="translate(${x} 70) rotate(${r})"><rect x="-3.6" y="${-h}" width="7.2" height="${h}" rx="3.6" fill="${c}"/>` +
      `<path d="M0 ${-h + 5}V-2" stroke="#86b99a" stroke-width="7.2" stroke-dasharray="1.3 4.2" opacity=".5"/></g>`;
    return cy(40, 34, -11, '#3f7d58') + cy(60, 37, 10, '#3f7d58') + cy(45, 47, -4, '#356e4c') + cy(55, 43, 4, '#467f5b') + cy(50, 53, 0, '#3a7552') +
      pot('#f4f1ea', '#e2ddd2', '#ffffff');
  },
  rubber() {
    const lf = (x, y, r, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><ellipse cx="0" cy="-11" rx="6.6" ry="11" fill="#2f5e3e"/>` +
      '<path d="M0 -22A6.6 11 0 0 0 0 0Z" fill="#407a52"/><path d="M0 -1.2V-20" stroke="#9cc4a6" stroke-width=".9" stroke-linecap="round"/></g>';
    return '<path d="M50 68V20" stroke="#6b6a3c" stroke-width="2.2" stroke-linecap="round"/>' +
      lf(50, 58, -66, 0.95) + lf(50, 52, 64, 0.95) + lf(50, 41, -40, 1) + lf(50, 34, 44, 1) + lf(50, 22, -4, 0.95) +
      pot('#8ea2a6', '#7b8f94', '#a3b6ba');
  },
};
const plantSVG = (k) => `<svg class="pl" viewBox="0 0 100 100">${ART[k]()}</svg>`;

// ---------------------------------------------------------------- the app's screens (screen px, 476 × 1012)
function statusBar() {
  return `<div class="a status"><span class="a st-time num">8:30</span>
    <div class="a st-sig">${[5, 8, 11, 14].map((h, i) => `<i style="left:${i * 6}px;height:${h}px"></i>`).join('')}</div>
    <div class="a st-bat"></div></div><div class="a camdot"></div>`;
}
function homeHTML() {
  const cards = PLANTS.map((p, i) => `<div class="a card pcard" data-k="card${i}" style="top:${326 + i * 106}px">
      <div class="a thumb" style="background:${p.bg}">${plantSVG(p.art)}</div>
      <div class="a cn nw">${p.name}</div><div class="a cm nw">${p.meta}</div>
      <div class="a pill${p.on ? ' on' : ''}">${p.due}</div>
      ${i === 0 ? '<div class="a rip" data-k="rip0" style="left:-112px;top:-235px;width:560px;height:560px"></div>' : ''}</div>`).join('');
  const tabs = [['home', '홈'], ['cal', '달력'], ['chart', '기록'], ['user', '내 정보']]
    .map(([k, l], i) => `<div class="a tab${i === 0 ? ' on' : ''}" style="left:${19.5 + i * 109}px">${icon(k, 26, i === 0 ? C.acc : C.ink3, k === 'home')}${l}</div>`).join('');
  const can = `<svg class="a sum-can" viewBox="0 0 118 84" fill="#fff">
      <path d="M30 30h40a5 5 0 0 1 5 5v31a8 8 0 0 1-8 8H35a8 8 0 0 1-8-8V35a5 5 0 0 1 3-5z" opacity=".95"/>
      <path d="M33 30c0-17 36-17 36 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".95"/>
      <path d="M74 50 98 26" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".95"/>
      <rect x="93" y="15" width="16" height="9" rx="3" transform="rotate(-45 101 19.5)" opacity=".95"/>
      <path d="M108 34c-.3.4-3 3.6-3 5.4a3 3 0 0 0 6 0c0-1.8-2.7-5-3-5.4zM100 44c-.3.4-3 3.6-3 5.4a3 3 0 0 0 6 0c0-1.8-2.7-5-3-5.4zM111 52c-.3.4-3 3.6-3 5.4a3 3 0 0 0 6 0c0-1.8-2.7-5-3-5.4z" opacity=".75"/>
      <path d="M38 44h28" stroke="#2c7bf2" stroke-width="3" stroke-linecap="round" opacity=".25"/></svg>`;
  return `<div class="a home" data-k="home">
    <div class="a h-date nw" data-k="hDate">7월 5일 토요일</div>
    <div class="a h-title nw" data-k="hTitle">오늘 물 줄 식물 <b>2</b></div>
    <div class="a avatar" data-k="avatar">하</div>
    <div class="a sum" data-k="sum"><div class="a sum-k nw">이번 주 물주기</div>
      <div class="a sum-v num nw"><span data-k="nWeek">0</span><small>/ 7</small></div>
      <div class="a sum-track"><div class="a sum-fill" data-k="weekFill"></div></div>${can}</div>
    <div class="a sec nw" data-k="sec">내 식물<span>4</span></div><div class="a sec-r nw" data-k="secR">모두 보기</div>
    ${cards}
    <div class="a addc nw" data-k="addc">+ 새 식물 들이기</div>
    <div class="a tabbar" data-k="tabbar">${tabs}</div>
  </div><div class="a hdim" data-k="hdim"></div>`;
}
function detailHTML() {
  const tile = (i, k, v, u) => `<div class="a card tile" data-k="tile${i}" style="left:${22 + i * 148}px">
      <div class="a tile-k nw">${k}</div><div class="a tile-v num nw" data-k="tv${i}"><span data-k="n${['Days', 'Times', 'Leaves'][i]}">${v}</span><small>${u}</small></div></div>`;
  const bars = GROWTH.map((v, i) => {
    const h = ((v - 20) / (61 - 20)) * 140, x = 20 + i * 49;
    return `<div class="a bar${i === 7 ? ' last' : ''}" data-k="bar${i}" style="left:${x + 9.5}px;top:${272 - h}px;height:${h}px"></div>` +
      `<div class="a bar-lb" style="left:${x}px;top:283px">${MONTHS[i]}</div>`;
  }).join('');
  return `<div class="a detail" data-k="detail">
    <div class="a ghost-m nw" data-k="ghostM">${PLANTS[0].meta}</div><div class="a pill on ghost-p" data-k="ghostP">${PLANTS[0].due}</div>
    <div class="a navb" data-k="nav0" style="left:22px">${icon('back', 22, C.ink, false, 2.4)}</div>
    <div class="a navb" data-k="nav1" style="right:22px">${icon('more', 22, C.ink, true)}</div>
    <div class="a d-meta nw" data-k="dMeta">거실 창가 · 7일마다 · 함께한 지 7개월</div>
    <div class="a d-chip" data-k="dChip">${icon('drop', 15, C.acc, true)}오늘 물 주는 날</div>
    <div class="a seg" data-k="seg"><div class="a seg-ind" data-k="segInd"></div>
      <div class="a seg-l on" data-k="seg0" style="left:4px">상태</div><div class="a seg-l" data-k="seg1" style="left:145.33px">기록</div>
      <div class="a seg-l" style="left:286.67px">메모</div>
      <div class="a rip" data-k="ripG" style="left:136px;top:-58px;width:160px;height:160px"></div></div>
    <div class="a panes">
      <div class="a pane" data-k="pane0">
        ${tile(0, '함께한 날', 0, '일')}${tile(1, '물 준 횟수', 0, '번')}${tile(2, '새 잎', 0, '장')}
        <div class="a card mcard" data-k="mcard"><div class="a m-k nw">흙 수분</div>
          <div class="a m-st dry" data-k="stDry">${icon('drop', 14, '#b9a27a', true)}목말라요</div>
          <div class="a m-st wet" data-k="stWet">${icon('drop', 14, C.acc, true)}촉촉해요</div>
          <div class="a m-v num nw"><span data-k="nMoist">0</span><small>%</small></div>
          <div class="a g-track"><div class="a g-zone"></div><div class="a g-fill" data-k="gFill"></div></div>
          <div class="a g-lb" style="left:20px">건조</div><div class="a g-lb" style="left:203px">적당</div><div class="a g-lb" style="right:20px">촉촉</div></div>
      </div>
      <div class="a pane" data-k="pane1" style="visibility:hidden">
        <div class="a card gcard"><div class="a g-k nw">키 성장</div><div class="a g-r nw">최근 8개월</div>
          <div class="a g-v num nw"><span data-k="nGrow">0</span><small>cm</small></div>
          <div class="a g-up nw" data-k="gUp">+23cm</div><div class="a base"></div>${bars}</div>
      </div>
    </div>
    <div class="a btn" data-k="btn"><div class="a btn-l" data-k="btnA">${icon('drop', 20, '#fff', true)}물 줬어요</div>
      <div class="a btn-l b" data-k="btnB">${icon('check', 20, C.acc, false, 2.8)}기록했어요</div>
      <div class="a rip" data-k="ripB" style="left:-64px;top:-250px;width:560px;height:560px"></div></div>
  </div>
  <div class="a hero" data-k="hero">${plantSVG('monstera')}</div>
  <div class="a dtitle" data-k="dTitle">몬스테라</div>`;
}
function sheetHTML() {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const chips = days.map((d, i) => `<div class="a chip" data-k="chip${i}" style="left:${24 + i * 62}px"><span class="d">${d}</span><span class="n num">${6 + i}</span>
      ${i === 6 ? `<div class="a chip-hi" data-k="chipHi"><span class="d">${d}</span><span class="n num">12</span>${icon('drop', 13, '#fff', true)}</div>` : ''}</div>`).join('');
  return `<div class="a backdrop" data-k="backdrop"></div>
  <div class="a sheet" data-k="sheet"><div class="a grab"></div>
    <div class="a s-k nw" data-k="sK">다음 물주기</div><div class="a s-date nw" data-k="sDate">7월 12일 토요일</div>
    <div class="a s-sub nw" data-k="sSub">7일 뒤, 아침 8시에 먼저 알려 드릴게요</div>
    ${chips}
    <div class="a alarm" data-k="alarm"><div class="a bell">${icon('bell', 21, C.acc, false, 2.1)}</div>
      <div class="a a-k nw">물주기 알림</div><div class="a a-v nw">매주 토요일 · 오전 8:00</div><div class="a tog"></div></div>
    <div class="a sbtn" data-k="sbtn">알림 맞추기<div class="a rip" data-k="ripS" style="left:-66px;top:-250px;width:560px;height:560px"></div></div>
  </div>`;
}

// ---------------------------------------------------------------- promo type outside the device
function calloutHTML(c, i) {
  return `<div class="a co ${c.side}" data-k="co${i}"><div class="kick" data-k="kick${i}"><span class="kn num">${c.n}</span><span class="kl nw">${c.kick}</span></div>
    <div class="hl"><div class="ln"><span>${c.l1}</span></div><div class="ln"><span>${c.l2}</span></div></div></div>`;
}
function endHTML() {
  const appIcon = `<svg viewBox="0 0 100 100" width="188" height="188">
      <path d="M50 17c-1.1 1.3-23 26.2-23 41.4a23 23 0 0 0 46 0C73 43.2 51.1 18.3 50 17z" fill="#fff"/>
      <path d="M50 72V58.5c0-5 2.6-8.6 8.4-11" fill="none" stroke="#2f9d5d" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M57.6 47.9c3.2-6.6 10.6-8.6 15.2-7.8-1 6.2-6.8 11.6-15.2 7.8z" fill="#43b874"/>
      <path d="M50 61.5c-2.4-5.6-9.2-7.6-13.6-6.8 1 5.6 6.4 10.2 13.6 6.8z" fill="#5bc786"/></svg>`;
  return `<div class="a eicon" data-k="eIcon">${appIcon}</div>
    <div class="a ename"><span class="m"><span data-k="eN0">촉</span></span><span class="m"><span data-k="eN1">촉</span></span></div>
    <div class="a evalue"><span class="ln"><span data-k="eVal">목마르기 전에, <em>먼저</em> 알려 줄게요</span></span></div>
    <div class="a ebadge" data-k="eBadge"><div class="a eb-g">${icon('get', 32, '#fff', false, 2)}</div>
      <div class="a eb-s">무료로 시작하기</div><div class="a eb-b">지금 받기</div>
      <div class="a eb-arrow">${icon('arrow', 22, '#fff', false, 2.6)}</div>
      <div class="a rip" data-k="eRip" style="left:98px;top:-222px;width:560px;height:560px"></div></div>
    <div class="a tap etap" data-k="eTap"></div><div class="a tring etring" data-k="eRing"></div>`;
}

// ---------------------------------------------------------------- 3D: the same transform CSS applies, so leader lines can find UI points
/** body px → stage px under translate3d · rotateX · rotateY · rotateZ · scale3d about the rig centre, seen through `perspective` */
function project(pose, bx, by, bz = 0) {
  let x = (bx - PW / 2) * pose.s, y = (by - PH / 2) * pose.s, z = bz * pose.s;
  let c = Math.cos(pose.rz * DEG), s = Math.sin(pose.rz * DEG);
  [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(pose.ry * DEG); s = Math.sin(pose.ry * DEG);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(pose.rx * DEG); s = Math.sin(pose.rx * DEG);
  [y, z] = [y * c - z * s, y * s + z * c];
  x += pose.x; y += pose.y;
  const w = 1 - z / PERSP;
  return { x: RCX + x / w, y: RCY + y / w };
}

// ---------------------------------------------------------------- closed-form pieces of motion
/** press: dips to 1 − d between p and u, springs back (slight overshoot) after u */
function press(t, p, u, d) {
  if (t < p) return 1;
  if (t < u) return 1 - d * ease.outCubic((t - p) / (u - p));
  return 1 - d + d * ease.outBack(clamp((t - u) / 0.34), 2.4);
}
/** the touch indicator for a list of visits: position, opacity, scale */
function touch(t, visits) {
  let x = visits[0].x, y = visits[0].y, op = 0, sc = 1;
  for (let i = 0; i < visits.length; i++) {
    const v = visits[i];
    const start = v.a != null ? v.a : v.g[0];
    if (t < start) break;
    if (v.g) {
      const k = ease.inOutCubic(clamp((t - v.g[0]) / (v.g[1] - v.g[0])));
      x = lerp(visits[i - 1].x, v.x, k); y = lerp(visits[i - 1].y, v.y, k);
      op = 1; sc = 1 - 0.08 * Math.sin(Math.PI * k);          // lifts a little while it travels
    } else {
      x = v.x; y = v.y;
      op = ease.outCubic(clamp((t - v.a) / 0.2));
      sc = 1.45 - 0.45 * ease.outCubic(clamp((t - v.a) / 0.3));
    }
    if (v.f != null) op *= 1 - ease.inOutCubic(clamp((t - v.f) / 0.2));
    sc *= press(t, v.p, v.u, 0.18);
  }
  return { x, y, op, sc };
}
/** the ring that leaves the fingertip on release, and the ink ripple inside the pressed element */
const ringAt = (t, u) => { const k = (t - u) / 0.55; return k < 0 || k > 1 ? null : { s: 0.7 + 2.1 * ease.outCubic(k), o: 0.8 * Math.pow(1 - k, 1.6) }; };
const rippleAt = (t, u) => { const k = (t - u) / 0.6; return k < 0 || k > 1 ? null : { s: ease.outCubic(clamp(k / 0.75)), o: 1 - ease.inCubic(clamp((k - 0.25) / 0.75)) }; };
/** damped scale kick on a big beat (the water tap) */
const punch = (t, t0, amt) => (t < t0 ? 0 : amt * Math.exp(-6.5 * (t - t0)) * Math.sin(15 * (t - t0)));

/** the elbow leader: down from the anchor, a quarter turn, across to the ring — cut at fraction p of its length */
function leaderD(A, Tg, rr, p) {
  const rc = 30, dir = Math.sign(Tg.x - A.x) || 1;
  const v = Math.max(0, Tg.y - rc - A.y), arc = (Math.PI / 2) * rc;
  const h = Math.max(0, Math.abs(Tg.x - rr * dir - (A.x + rc * dir)));
  let len = p * (v + arc + h);
  let d = `M${A.x.toFixed(2)} ${A.y.toFixed(2)}`;
  const vy = A.y + Math.min(len, v);
  d += `L${A.x.toFixed(2)} ${vy.toFixed(2)}`;
  len -= v;
  if (len > 0) {
    const a = Math.min(1, len / arc) * (Math.PI / 2);
    const cx = A.x + rc * dir, cy = A.y + v;
    for (let k = 1; k <= 8; k++) {
      const q = (a * k) / 8;
      d += `L${(cx - dir * rc * Math.cos(q)).toFixed(2)} ${(cy + rc * Math.sin(q)).toFixed(2)}`;
    }
    len -= arc;
    if (len > 0) d += `L${(A.x + rc * dir + dir * Math.min(len, h)).toFixed(2)} ${(A.y + v + rc).toFixed(2)}`;
  }
  return d;
}

/** a rounded rectangle on the screen plane (screen px, grown by `grow`), projected through the device pose → SVG path */
function frameD(pose, cx, cy, w, h, r, grow) {
  const hw = Math.max(1, w / 2 + grow), hh = Math.max(1, h / 2 + grow), rr = clamp(r + grow, 0, Math.min(hw, hh));
  const corners = [[hw - rr, -(hh - rr), -90], [hw - rr, hh - rr, 0], [-(hw - rr), hh - rr, 90], [-(hw - rr), -(hh - rr), 180]];
  let d = '';
  for (const [ox, oy, a0] of corners) {
    for (let k = 0; k <= 6; k++) {
      const a = (a0 + k * 15) * DEG;
      const q = project(pose, cx + ox + rr * Math.cos(a) + BZ, cy + oy + rr * Math.sin(a) + BZ);
      d += `${d ? 'L' : 'M'}${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
    }
  }
  return d + 'Z';
}

// ---------------------------------------------------------------- backdrop painting (setup only)
function paintLeaf(ctx, x, y, rot, L, c1, c2, cv, blur, headless) {
  const w = Math.ceil(L * 1.5), h = Math.ceil(L * 1.25);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  g.translate(w / 2, L * 1.12); g.scale(L, L);
  g.fillStyle = c1; g.fill(new Path2D(LEAF));
  g.fillStyle = c2; g.fill(new Path2D(LEAF_R));
  g.strokeStyle = cv; g.lineWidth = 0.02; g.lineCap = 'round'; g.stroke(new Path2D(VEINS));
  g.globalCompositeOperation = 'destination-out';
  g.strokeStyle = '#000'; g.lineWidth = 0.05; g.stroke(new Path2D(SLITS));
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot * DEG);
  if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.strokeStyle = c2; ctx.lineWidth = L * 0.03; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -L * 0.04); ctx.quadraticCurveTo(L * 0.05, L * 0.4, L * 0.02, L * 0.9); ctx.stroke();
  ctx.drawImage(c, -w / 2, -L * 1.12);
  ctx.restore();
}

defineDemo({
  id: '122-app-promo',
  title: '목마르기 전에',
  tech: '앱 소개 모션 · 폰 목업 + 화면 전환 + 탭 + 기능 콜아웃',
  duration: D,
  background: C.bg1,
  async setup(api) {
    const { stage, headless } = api;
    const ALL = [PLANTS.map((p) => p.name + p.meta + p.due).join(''), CO.map((c) => c.kick + c.l1 + c.l2).join(''),
      '7월 5일 토요일오늘 물 줄 식물 2하이번 주 물주기0123456789/ 7내 식물4모두 보기홈달력기록내 정보 8:30거실 창가 · 7일마다 · 함께한 지 7개월',
      '오늘 물 주는 날상태기록메모함께한 날물 준 횟수새 잎일번장흙 수분목말라요촉촉해요%건조적당촉촉물 줬어요기록했어요키 성장최근 8개월cm+23',
      MONTHS.join(''), '다음 물주기7월 12일 토요일7일 뒤, 아침 8시에 먼저 알려 드릴게요일월화수목금토물주기 알림매주 토요일 · 오전 8:00알림 맞추기',
      '촉목마르기 전에, 먼저 알려 줄게요무료로 시작하기지금 받기몬스테라'].join('');
    await Promise.all([500, 550, 600, 650, 700, 750, 800, 900].map((w) => fontReady(`${w} 40px ${KR}`, ALL)));

    // ---------------- backdrop: base (static), two leaf layers (static pictures, moved by parallax), live bokeh, band, grain
    const base = api.canvas({ z: 0 });
    {
      const g = base.ctx;
      const lg = g.createLinearGradient(0, 0, 0, 1920);
      lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
      g.fillStyle = lg; g.fillRect(0, 0, 1080, 1920);
      const rg = g.createRadialGradient(860, 240, 0, 860, 240, 980);
      rg.addColorStop(0, 'rgba(255,253,238,.85)'); rg.addColorStop(1, 'rgba(255,253,238,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 1080, 1920);
      const rg2 = g.createRadialGradient(200, 1250, 0, 200, 1250, 760);
      rg2.addColorStop(0, 'rgba(186,214,176,.45)'); rg2.addColorStop(1, 'rgba(186,214,176,0)');
      g.fillStyle = rg2; g.fillRect(0, 0, 1080, 1920);
    }
    const mkLayer = (z) => {
      const L = api.canvas({ z });
      L.el.style.left = '-60px'; L.el.style.top = '-60px';
      L.el.width = 1200; L.el.height = 2040; L.el.style.width = '1200px'; L.el.style.height = '2040px';
      return { el: L.el, ctx: L.el.getContext('2d') };
    };
    const far = mkLayer(1), mid = mkLayer(2);
    // leaves at the edges only; the top centre stays clear for the headlines (layer px = stage px + 60)
    paintLeaf(far.ctx, 1240, 300, -68, 600, '#d2e1c8', '#c9dbbe', '#dce9d4', 10, headless);
    paintLeaf(far.ctx, -20, 1000, 64, 480, '#cfdfc5', '#c5d8ba', '#d9e7d1', 10, headless);
    paintLeaf(far.ctx, 1230, 1760, -38, 600, '#c9dbbf', '#bfd3b4', '#d5e4cc', 10, headless);
    paintLeaf(mid.ctx, 20, 1960, 40, 700, '#b2cea7', '#a5c599', '#c5dcbb', 1.5, headless);
    paintLeaf(mid.ctx, 1270, 1320, -80, 400, '#b6d1ab', '#a9c89d', '#c8dfbf', 1.5, headless);
    paintLeaf(mid.ctx, -40, 300, 112, 340, '#bcd5b1', '#b0cca4', '#cde2c4', 2, headless);

    const dyn = api.canvas({ z: 3, attrs: headless ? { willReadFrequently: true } : undefined });
    const dctx = dyn.ctx;
    const R = rand(12201);
    const bokeh = Array.from({ length: 30 }, () => ({
      x: R() * 1080, y: R() * 2000, r: 5 + Math.pow(R(), 2.2) * 26, v: 8 + R() * 26, w: 0.3 + R() * 0.6, ph: R() * TAU,
      a: 0.16 + R() * 0.3, par: 0.04 + R() * 0.12,
    }));

    const ui = api.layer('div', { z: 4 });
    ui.className = 'ap';
    const rigSlabs = Array.from({ length: SLABS }, (_, i) => {
      const k = i + 1, m = 1 - Math.abs((k - (SLABS + 1) / 2) / ((SLABS - 1) / 2));   // 0 at the faces, 1 mid-depth
      const col = `rgb(${Math.round(lerp(22, 58, m))},${Math.round(lerp(29, 70, m))},${Math.round(lerp(26, 64, m))})`;
      return `<div class="slab" style="background:${col};transform:translateZ(${(-k * SLAB_STEP).toFixed(1)}px)">${k > 3 && k < 10 ? '<i></i>' : ''}</div>`;
    }).reverse().join('');
    ui.innerHTML = `<div class="cam"><div class="rig" data-k="rig">
        <div class="pshadow" style="transform:translate3d(26px,46px,-110px)"></div>${rigSlabs}
        <div class="body"><div class="scr" data-k="scr">${homeHTML()}${detailHTML()}${sheetHTML()}${statusBar()}<div class="a hbar"></div>
          <div class="a tap" data-k="tap"></div><div class="a tring" data-k="tring"></div></div>
          <div class="glare" data-k="glare"></div></div></div></div><div class="a band"></div>`;
    const over = api.layer('svg', { z: 5 });
    over.style.overflow = 'visible';
    const NS = 'http://www.w3.org/2000/svg';
    const svgEl = (tag, attrs, parent = over) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
    const leaders = CO.map(() => ({
      halo: svgEl('path', { fill: 'none', stroke: 'rgba(255,255,255,.75)', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      line: svgEl('path', { fill: 'none', stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      dot: svgEl('circle', { r: 7, fill: C.ink }),
      pulse: svgEl('path', { fill: 'none', stroke: C.acc, 'stroke-width': 2.5 }),
      frameH: svgEl('path', { fill: 'none', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 9, 'stroke-linejoin': 'round' }),
      frame: svgEl('path', { fill: 'rgba(44,123,242,.06)', stroke: C.acc, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
      tip: svgEl('circle', { fill: C.acc, stroke: '#fff', 'stroke-width': 3 }),
    }));
    // droplets that leave the screen on the water tap (closed-form ballistic, stage px)
    const RD = rand(12202);
    const splashRing = svgEl('circle', { fill: 'none', stroke: C.acc, 'stroke-width': 4 });
    const drops = Array.from({ length: 18 }, (_, i) => {
      const ang = (-90 + (RD() - 0.5) * 115) * DEG, sp = 1000 + RD() * 950;
      const g = svgEl('g', {});
      const fill = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#6aa8ff' : C.acc;
      // a teardrop in drop units: round end at the origin, tip at (0, −1.7); a small highlight
      svgEl('path', { d: 'M0 -1.7C.35 -1.05 1 -.55 1 .05A1 1 0 0 1 -1 .05C-1 -.55 -.35 -1.05 0 -1.7Z', fill,
        stroke: i % 3 === 0 ? 'rgba(44,123,242,.45)' : 'none', 'stroke-width': 0.12 }, g);
      svgEl('ellipse', { cx: -0.36, cy: -0.05, rx: 0.2, ry: 0.34, fill: i % 3 === 0 ? 'rgba(44,123,242,.25)' : 'rgba(255,255,255,.7)' }, g);
      return { vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: 7 + RD() * 10, d: RD() * 0.07, life: 0.7 + RD() * 0.35, el: g };
    });

    const promo = api.layer('div', { z: 6 });
    promo.className = 'ap';
    promo.innerHTML = CO.map(calloutHTML).join('');
    const end = api.layer('div', { z: 7 });
    end.className = 'ap';
    end.innerHTML = endHTML();
    const endSvg = api.layer('svg', { z: 7 });
    endSvg.style.overflow = 'visible';
    const eRings = [0, 1].map(() => svgEl('circle', { cx: 540, cy: 322, fill: 'none', stroke: C.acc, 'stroke-width': 4 }, endSvg));

    const grain = api.canvas({ z: 8, scale: 0.5 });
    {
      const g = grain.ctx, rg = rand(12203);
      const id = g.createImageData(540, 960);
      for (let i = 0; i < id.data.length; i += 4) { const v = Math.floor(rg() * 255); id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      g.putImageData(id, 0, 0);
      grain.el.classList.add('grain');
      grain.el.style.opacity = '0.05';
    }

    // ---------------- handles
    const E = {};
    for (const root of [ui, promo, end]) root.querySelectorAll('[data-k]').forEach((e) => { E[e.dataset.k] = e; });

    // ---------------- the timeline
    const P = { x: 120, y: 880, rx: 34, ry: -32, rz: 11, s: 0.86 };          // device pose (deg, px)
    const N = { week: 0, days: 0, times: 0, leaves: 0, moist: 0, grow: 0 };  // counters
    const LD = CO.map(() => ({ p: 0, r: 0 }));                                 // leader draw / ring
    const EV = { wash: 0 };
    const tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
    const IN = (els, pos, o = {}) => tl.fromTo(els, { y: o.y ?? 24, opacity: 0 },
      { y: 0, opacity: 1, duration: o.d ?? 0.6, ease: o.ease ?? 'expo.out', stagger: o.st ?? 0 }, pos);
    const show = (el, pos) => tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, pos);   // 1 ms, never a zero-length set

    // intro: the device swoops up into a 3/4 view facing the first callout; the home screen staggers in
    tl.to(P, { x: 92, y: 4, rx: 8, ry: -19, rz: -1.5, s: 0.98, duration: 1.3, ease: 'expo.out' }, 0.02);
    IN([E.hDate, E.hTitle, E.avatar], 0.16, { st: 0.05, y: 18 });
    IN(E.sum, 0.26, { y: 30 });
    IN([E.sec, E.secR], 0.36, { y: 18 });
    IN([E.card0, E.card1, E.card2, E.card3, E.addc], 0.4, { st: 0.075, y: 44, d: 0.7 });
    IN(E.tabbar, 0.5, { y: 30 });
    tl.fromTo(N, { week: 0 }, { week: 5, duration: 0.9, ease: 'power2.out' }, 0.45);

    // callouts: kicker slides in, headline lines rise inside their masks, the leader draws to its ring; exits are faster
    CO.forEach((c, i) => {
      const co = E[`co${i}`], kick = E[`kick${i}`], lines = co.querySelectorAll('.ln > span'), sx = c.side === 'L' ? -26 : 26;
      tl.fromTo(kick, { x: sx, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, c.c);
      tl.fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, c.c + 0.06);
      tl.fromTo(LD[i], { p: 0 }, { p: 1, duration: 0.42, ease: 'power2.inOut' }, c.c + 0.3);
      tl.fromTo(LD[i], { r: 0 }, { r: 1, duration: 0.45, ease: 'back.out(2.2)' }, c.c + 0.64);
      tl.to(lines, { yPercent: -112, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.05 }, c.o);
      tl.to(kick, { x: sx * 0.5, opacity: 0, duration: 0.24, ease: 'power2.in' }, c.o);
      tl.to(LD[i], { p: 0, r: 0, duration: 0.24, ease: 'power2.in' }, c.o);
    });

    // 2.0 shared element: the card's own rectangle grows into the detail screen; the thumbnail becomes the hero,
    // the name flies into the title; the list falls back and dims; the device turns to the other 3/4 view
    const ex = T.ex;
    show(E.detail, ex);
    tl.fromTo(E.detail, { clipPath: 'inset(326px 22px 596px 22px round 22px)' },
      { clipPath: 'inset(0px 0px 0px 0px round 54px)', duration: 0.6, ease: 'power3.inOut' }, ex);
    tl.fromTo(E.detail, { backgroundColor: '#ffffff' }, { backgroundColor: C.ui, duration: 0.5, ease: 'power1.inOut' }, ex + 0.08);
    tl.to([E.ghostM, E.ghostP], { opacity: 0, duration: 0.14, ease: 'power1.in' }, ex);
    show(E.hero, ex);
    tl.fromTo(E.hero, { x: -170, y: 131, scale: 64 / 290 }, { x: 0, y: 0, scale: 1, duration: 0.64, ease: 'power3.inOut' }, ex);
    show(E.dTitle, ex);
    tl.fromTo(E.dTitle, { x: 90, y: -56, scale: 18 / 32 }, { x: 0, y: 0, scale: 1, duration: 0.64, ease: 'power3.inOut' }, ex + 0.03);
    tl.to(E.home, { scale: 0.93, duration: 0.6, ease: 'power3.inOut' }, ex);
    tl.fromTo(E.hdim, { opacity: 0 }, { opacity: 0.22, duration: 0.6, ease: 'power2.out' }, ex);
    tl.to(P, { x: -92, y: 4, rx: 6, ry: 24, rz: 1.2, s: 0.98, duration: 0.95, ease: 'power3.inOut' }, ex);
    IN([E.nav0, E.nav1], ex + 0.4, { st: 0.04, y: 14 });
    IN([E.dMeta, E.dChip, E.seg], ex + 0.46, { st: 0.05, y: 18 });
    IN([E.tile0, E.tile1, E.tile2], ex + 0.56, { st: 0.06, y: 30 });
    IN(E.mcard, ex + 0.72, { y: 36 });
    IN(E.btn, ex + 0.82, { y: 30 });
    tl.fromTo(N, { days: 0 }, { days: 214, duration: 0.95, ease: 'power2.out' }, ex + 0.62);
    tl.fromTo(N, { times: 0 }, { times: 31, duration: 0.9, ease: 'power2.out' }, ex + 0.68);
    tl.fromTo(N, { leaves: 0 }, { leaves: 3, duration: 0.6, ease: 'power2.out' }, ex + 0.74);
    tl.fromTo(N, { moist: 0 }, { moist: 18, duration: 0.8, ease: 'power2.out' }, ex + 0.84);

    // 4.2 the device faces front for the big beat; tap "물 줬어요": the gauge fills, the button confirms, droplets fly
    const w = T.water;
    tl.to(P, { x: 0, y: -4, rx: 3, ry: 0, rz: 0, s: 1.0, duration: 0.7, ease: 'power3.inOut' }, 4.06);
    tl.to(E.btn, { backgroundColor: C.accP, duration: 0.3, ease: 'power1.inOut' }, w);
    tl.to(E.btnA, { yPercent: -70, opacity: 0, duration: 0.2, ease: 'power2.in' }, w);
    tl.fromTo(E.btnB, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, w + 0.12);
    tl.to(N, { moist: 72, duration: 0.8, ease: 'power2.inOut' }, w + 0.04);
    tl.to(N, { times: 32, duration: 0.25, ease: 'power1.out' }, w + 0.1);
    tl.fromTo(E.tv1, { scale: 1 }, { scale: 1.22, duration: 0.1, ease: 'power2.out' }, w + 0.1);
    tl.to(E.tv1, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, w + 0.2);
    tl.to(E.stDry, { opacity: 0, y: -8, duration: 0.18, ease: 'power2.in' }, w + 0.42);
    tl.fromTo(E.stWet, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, w + 0.5);

    // 4.9 the sheet slides up over a dimmed screen; its date chips stagger in, the chosen day pops
    const sh = T.sheet;
    tl.fromTo(E.backdrop, { opacity: 0 }, { opacity: 0.34, duration: 0.4, ease: 'power2.out' }, sh);
    tl.fromTo(E.sheet, { y: 500 }, { y: 0, duration: 0.62, ease: 'back.out(1.05)' }, sh);
    IN([E.sK, E.sDate, E.sSub], sh + 0.18, { st: 0.05, y: 16 });
    IN([0, 1, 2, 3, 4, 5, 6].map((i) => E[`chip${i}`]), sh + 0.28, { st: 0.045, y: 28, ease: 'back.out(1.7)', d: 0.5 });
    tl.fromTo(E.chipHi, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }, sh + 0.66);
    IN([E.alarm, E.sbtn], sh + 0.44, { st: 0.06, y: 22 });
    tl.to(P, { x: 92, y: 4, rx: 13, ry: -21, rz: -1.6, s: 0.98, duration: 0.9, ease: 'power3.inOut' }, sh + 0.02);
    // 6.44 "알림 맞추기" → the sheet drops away
    tl.to(E.sheet, { y: 540, duration: 0.32, ease: 'power2.in' }, T.down);
    tl.to(E.backdrop, { opacity: 0, duration: 0.32, ease: 'power1.in' }, T.down);

    // 6.86 tab switch: the indicator slides, the content slides sideways, the bars rise
    const tb = T.tab;
    tl.to(E.segInd, { x: 141.33, duration: 0.36, ease: 'power3.inOut' }, tb);
    tl.to(E.seg0, { color: C.ink3, duration: 0.2 }, tb + 0.04);
    tl.to(E.seg1, { color: C.ink, duration: 0.2 }, tb + 0.12);
    tl.to(E.pane0, { x: -476, duration: 0.46, ease: 'power3.inOut' }, tb + 0.02);
    show(E.pane1, tb + 0.02);
    tl.fromTo(E.pane1, { x: 476 }, { x: 0, duration: 0.46, ease: 'power3.inOut' }, tb + 0.02);
    tl.fromTo(GROWTH.map((_, i) => E[`bar${i}`]), { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, tb + 0.24);
    tl.fromTo(N, { grow: 0 }, { grow: 61, duration: 0.9, ease: 'power2.out' }, tb + 0.26);
    tl.fromTo(E.gUp, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.2)' }, tb + 0.7);
    tl.to(P, { x: -92, y: 4, rx: 6, ry: 23, rz: 1.4, s: 0.98, duration: 0.9, ease: 'power3.inOut' }, tb - 0.02);

    // 8.18 end card: the device lies back low in the frame; icon pop, name rises, value line, badge
    const en = T.end;
    tl.to(P, { x: 40, y: 372, rx: 30, ry: -20, rz: 8, s: 0.68, duration: 1.15, ease: 'power3.inOut' }, en);
    tl.fromTo(EV, { wash: 0 }, { wash: 1, duration: 1.0, ease: 'power2.inOut' }, en + 0.1);
    tl.fromTo(E.eIcon, { scale: 0, rotation: -16, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }, en + 0.24);
    tl.fromTo([E.eN0, E.eN1], { yPercent: 108 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.09 }, en + 0.4);
    tl.fromTo(E.eVal, { yPercent: 110 }, { yPercent: 0, duration: 0.75, ease: 'expo.out' }, en + 0.62);
    tl.fromTo(E.eBadge, { y: 40, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.6)' }, en + 0.8);

    tl.time(D); tl.time(0);   // initialise every tween once, in order

    Object.assign(this, { tl, P, N, LD, EV, E, leaders, drops, splashRing, eRings, bokeh, dctx, far, mid });
    this.text = new Map();
  },

  frame(t) {
    const { tl, P, N, LD, EV, E, leaders, drops, splashRing, eRings, bokeh, dctx, far, mid } = this;
    tl.time(t);

    // ---------------- device pose = timeline pose + a slow float + the water-tap punch
    const fl = ramp(t, 0.8, 1.7);
    const pose = {
      x: P.x, y: P.y + fl * 9 * Math.sin((TAU * t) / 3.4),
      rx: P.rx + fl * 1.1 * Math.sin((TAU * t) / 4.3 + 1.0),
      ry: P.ry + fl * 1.6 * Math.sin((TAU * t) / 5.2 + 0.4),
      rz: P.rz, s: P.s * (1 + punch(t, T.water + 0.02, 0.02)),
    };
    E.rig.style.transform = `translate3d(${pose.x.toFixed(2)}px,${pose.y.toFixed(2)}px,0) rotateX(${pose.rx.toFixed(3)}deg) ` +
      `rotateY(${pose.ry.toFixed(3)}deg) rotateZ(${pose.rz.toFixed(3)}deg) scale3d(${pose.s.toFixed(4)},${pose.s.toFixed(4)},${pose.s.toFixed(4)})`;
    E.glare.style.backgroundPosition = `${(50 - pose.ry * 2.4 - pose.rx * 0.8).toFixed(2)}% 0`;

    // ---------------- counters (tabular figures)
    const put = (k, v) => { if (this.text.get(k) !== v) { this.text.set(k, v); E[k].textContent = v; } };
    put('nWeek', String(Math.round(N.week)));
    put('nDays', String(Math.round(N.days)));
    put('nTimes', String(Math.round(N.times)));
    put('nLeaves', String(Math.round(N.leaves)));
    put('nMoist', String(Math.round(N.moist)));
    put('nGrow', String(Math.round(N.grow)));
    E.weekFill.style.transform = `scaleX(${(N.week / 7).toFixed(4)})`;
    E.gFill.style.width = `${((392 * N.moist) / 100).toFixed(2)}px`;

    // ---------------- touch indicator, release ring, ink ripple, pressed element
    const tp = touch(t, TAPS);
    E.tap.style.opacity = tp.op.toFixed(3);
    E.tap.style.transform = `translate(${tp.x.toFixed(2)}px,${tp.y.toFixed(2)}px) scale(${tp.sc.toFixed(4)})`;
    let ring = null;
    for (const v of TAPS) {
      const rg = ringAt(t, v.u);
      if (rg) ring = { ...rg, x: v.x, y: v.y };
      const rp = rippleAt(t, v.u);
      E[v.rip].style.transform = `scale(${rp ? rp.s.toFixed(4) : 0})`;
      E[v.rip].style.opacity = rp ? rp.o.toFixed(3) : '0';
      E[v.el].style.scale = press(t, v.p, v.u, v.el === 'seg1' ? 0.08 : 0.03).toFixed(4);
    }
    E.tring.style.opacity = ring ? ring.o.toFixed(3) : '0';
    E.tring.style.transform = ring ? `translate(${ring.x}px,${ring.y}px) scale(${ring.s.toFixed(4)})` : 'scale(0)';
    // the end-card press (stage px)
    const et = touch(t, [ETAP]);
    E.eTap.style.opacity = et.op.toFixed(3);
    E.eTap.style.transform = `translate(${ETAP.x}px,${ETAP.y}px) scale(${et.sc.toFixed(4)})`;
    const er = ringAt(t, ETAP.u), ep = rippleAt(t, ETAP.u);
    E.eRing.style.opacity = er ? er.o.toFixed(3) : '0';
    E.eRing.style.transform = `translate(${ETAP.x}px,${ETAP.y}px) scale(${er ? er.s.toFixed(4) : 0})`;
    E.eRip.style.transform = `scale(${ep ? ep.s.toFixed(4) : 0})`;
    E.eRip.style.opacity = ep ? ep.o.toFixed(3) : '0';
    E.eBadge.style.scale = press(t, ETAP.p, ETAP.u, 0.035).toFixed(4);

    // ---------------- leader lines: from the headline block to the projected UI point
    CO.forEach((c, i) => {
      const L = leaders[i], ld = LD[i];
      const vis = ld.p > 0.001 || ld.r > 0.001;
      for (const k in L) L[k].style.display = vis ? '' : 'none';
      if (!vis) return;
      const [bx, by, bw, bh, br] = c.box, dir = c.side === 'L' ? -1 : 1;
      const end = project(pose, bx + dir * (bw / 2 + 5) + BZ, by + BZ);        // the frame edge that faces the headline
      const A = { x: c.side === 'L' ? 96 : 984, y: ANCHOR_Y };
      const d = leaderD(A, end, 0, ld.p);
      L.halo.setAttribute('d', d); L.line.setAttribute('d', d);
      L.dot.setAttribute('cx', A.x); L.dot.setAttribute('cy', A.y);
      L.dot.setAttribute('r', (7 * clamp(ld.p * 6)).toFixed(2));
      // the focus frame: a rounded rectangle on the screen plane, projected point by point (so it tilts with the device)
      const rs = Math.max(0, ld.r), grow = (rs - 1) * 16;
      const fd = rs > 0.01 ? frameD(pose, bx, by, bw, bh, br, grow) : '';
      L.frame.setAttribute('d', fd); L.frameH.setAttribute('d', fd);
      L.frame.setAttribute('opacity', clamp(rs).toFixed(3)); L.frameH.setAttribute('opacity', clamp(rs).toFixed(3));
      L.tip.setAttribute('cx', end.x.toFixed(2)); L.tip.setAttribute('cy', end.y.toFixed(2)); L.tip.setAttribute('r', (6.5 * clamp(rs)).toFixed(2));
      const pk = (((t - (c.c + 0.95)) / 0.95) % 1 + 1) % 1;
      const pon = t > c.c + 0.95 && rs > 0.5;
      L.pulse.setAttribute('d', pon ? frameD(pose, bx, by, bw, bh, br, 4 + 20 * ease.outCubic(pk)) : '');
      L.pulse.setAttribute('opacity', pon ? ((1 - pk) * 0.65 * clamp(rs)).toFixed(3) : '0');
    });

    // ---------------- droplets popping out of the screen on the water tap (they grow as they "come forward")
    const t0 = T.water - 0.02, src = project(pose, 238 + BZ, 930 + BZ);
    for (const d of drops) {
      const s = t - t0 - d.d;
      if (s <= 0 || s > d.life) { d.el.setAttribute('display', 'none'); continue; }
      const k = s / d.life, kd = 2.4, drag = (1 - Math.exp(-kd * s)) / kd;
      const x = src.x + d.vx * drag, y = src.y + d.vy * drag + 750 * s * s;
      const vx = d.vx * Math.exp(-kd * s), vy = d.vy * Math.exp(-kd * s) + 1500 * s;
      const rr = d.r * (0.55 + 1.25 * ease.outCubic(k));                  // grows: it is coming toward the camera
      const rot = Math.atan2(-vy, -vx) / DEG + 90;                          // the tip trails the motion
      d.el.setAttribute('display', '');
      d.el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${rr.toFixed(3)})`);
      d.el.setAttribute('opacity', (1 - ease.inCubic(clamp((k - 0.35) / 0.65))).toFixed(3));
    }
    const sk = (t - t0) / 0.6;
    splashRing.setAttribute('cx', src.x.toFixed(2)); splashRing.setAttribute('cy', src.y.toFixed(2));
    splashRing.setAttribute('r', sk > 0 && sk < 1 ? (36 + 220 * ease.outCubic(sk)).toFixed(2) : '0');
    splashRing.setAttribute('opacity', sk > 0 && sk < 1 ? (0.6 * (1 - sk)).toFixed(3) : '0');

    // ---------------- end-card rings around the icon
    eRings.forEach((c, i) => {
      const k = (t - (T.end + 0.34 + i * 0.16)) / 0.9;
      const on = k > 0 && k < 1;
      c.setAttribute('r', on ? (100 + 230 * ease.outCubic(k)).toFixed(2) : '0');
      c.setAttribute('opacity', on ? ((1 - k) * (i ? 0.35 : 0.6)).toFixed(3) : '0');
    });

    // ---------------- backdrop: parallax leaves, drifting bokeh, the end-card colour wash
    far.el.style.transform = `translate(${(-pose.x * 0.05 + 6 * Math.sin(t * 0.5)).toFixed(2)}px,${(-pose.y * 0.02 - t * 2).toFixed(2)}px)`;
    mid.el.style.transform = `translate(${(-pose.x * 0.13).toFixed(2)}px,${(-pose.y * 0.05 - t * 4).toFixed(2)}px)`;
    const g = dctx;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.clearRect(0, 0, 1080, 1920);
    if (EV.wash > 0) {
      g.fillStyle = 'rgba(225,238,250,.72)';
      g.beginPath(); g.arc(540, 322, 40 + 1900 * EV.wash, 0, TAU); g.fill();
    }
    for (const b of bokeh) {
      const x = b.x + 22 * Math.sin(t * b.w + b.ph) - pose.x * b.par;
      const y = ((((b.y - t * b.v - pose.y * b.par * 0.4) % 2000) + 2000) % 2000) - 40;
      g.globalAlpha = b.a;
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(x, y, b.r, 0, TAU); g.fill();
      g.globalAlpha = b.a * 0.9;
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.6;
      g.beginPath(); g.arc(x, y, b.r - 0.8, 0, TAU); g.stroke();
    }
    g.globalAlpha = 1;
  },
});
