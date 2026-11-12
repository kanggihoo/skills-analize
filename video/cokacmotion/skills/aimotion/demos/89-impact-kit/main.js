/*
 * 89 · 세 번 찍는 도장 — the impact kit: how one beat is made to land.
 *
 * A boxwood seal stamps a hanji practice form three times. The seal, the distance and the cells are the same;
 * only the number of layered effects grows — 톡 3 layers, 탁 6, 쾅 all 10 — and a panel lights each layer as it
 * fires, so the viewer sees the budget being spent. The three prints stay on the sheet as the comparison.
 *
 * Layers (fire order): 예비 (wind-up lift) · 멈춤 (hit-stop) · 섬광 (flash ≤ 0.35) · 펀치 (camera scale) · 흔들림 (shake on
 * CSS translate) · 링 (shockwave) · 파편 (ink spatter + paper chips + sparks: drag + gravity in closed form) · 의성어
 * (outlined sound word) · 먼지 (dust puff) · 안착 (back.out settle).
 *
 * Determinism: every effect is a closed-form envelope of the time since its beat (kit.js). The hit-stop is a time
 * warp — the ambient world and the GSAP timeline read tw = t − Σ min(max(t − hit, 0), stop). GSAP drives only the
 * camera and the type (one paused timeline, tl.time(tw)). All art is baked in setup from rand(seed).
 */
import { defineDemo } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import * as K from './kit.js';
import { C, FONT, TABLE, bakeDesk, bakePrint, drawSeal, softDisc, starburst, drawBurstShape, drawWord } from './art.js';

const D = 10;
const M = 40;                       // canvas margin past the stage edge: shake and punch never show an edge
const CW = 1080 + 2 * M, CH = 1920 + 2 * M;
const AX = 540, AY = 1060;          // screen point the camera target sits on
const R = 100;                      // seal radius (world px)
const HOVER = 120;                  // resting height above the sheet
const SLOT = TABLE.cols.map((x) => ({ x, y: 1000 }));
const BAKE = { X0: -220, Y0: -120, BW: 1520, BH: 2160, BS: 1.4 };
const LAYERS = ['예비', '멈춤', '섬광', '펀치', '흔들림', '링', '파편', '의성어', '먼지', '안착'];
const POST = ['펀치', '흔들림', '링', '파편', '의성어', '먼지'];   // reactions after release, 0.02 s apart
const DEG = Math.PI / 180;

// the three beats — the same seal and the same drop; what grows is the wind-up, the hold and the layer count
const BEATS = [
  { name: '톡', hit: 1.85, anti: 0.22, aim: 0, slam: 0.13, stop: 0, press: 0.12, settle: 0.42, lift: 175, tilt: -3,
    stretch: 0.02, squash: 0.035, back: 1.4, tremble: 0, pow: 2, use: ['예비', '의성어', '안착'] },
  { name: '탁', hit: 3.75, anti: 0.32, aim: 0.07, slam: 0.11, stop: 1 / 30, press: 0.14, settle: 0.5, lift: 205, tilt: -6,
    stretch: 0.05, squash: 0.07, back: 1.6, tremble: 0.8, pow: 3, use: ['예비', '멈춤', '흔들림', '링', '의성어', '안착'] },
  { name: '쾅', hit: 5.79, anti: 0.42, aim: 0.22, slam: 0.09, stop: 2 / 30, press: 0.42, settle: 0.62, lift: 290, tilt: -10,
    stretch: 0.09, squash: 0.13, back: 1.8, tremble: 2.4, pow: 4, use: LAYERS },
];
for (const b of BEATS) {
  b.a0 = b.hit - b.slam - b.aim - b.anti;            // wind-up starts
  b.rel0 = b.hit + b.stop;                           // release (end of the hit-stop)
  b.end = b.rel0 + b.press + b.settle;               // settled
  b.fire = {};
  let k = 0;
  for (const L of LAYERS) {
    if (!b.use.includes(L)) continue;
    b.fire[L] = L === '예비' ? b.a0 : L === '멈춤' || L === '섬광' ? b.hit : L === '안착' ? b.rel0 + b.press : b.rel0 + 0.02 * k++;
  }
}
const [B1, B2, B3] = BEATS;
const TRAVEL = [[2.42, 3.02], [4.42, 5.02]];
const ENTER = [0.05, 0.9], EXIT = [6.95, 7.5];
const RESET = [2.6, 4.58];                     // the panel clears for the next beat
const PRINT_ROT = [-3.5 * DEG, 2 * DEG, -1 * DEG];
const rel = (b, L, t) => (b.fire[L] == null ? -1 : t - b.fire[L]);

// ---------------------------------------------------------------- seal pose (closed form)
/** one beat's pose, or null outside its window: wind-up → aim (tremble) → slam → hit-stop → press → back.out settle */
function beatPose(b, t) {
  const u = t - b.hit, a0 = b.a0 - b.hit, a1 = -(b.slam + b.aim), a2 = -b.slam;
  if (u < a0 || t > b.end) return null;
  let h, rot = 0, sy = 1;
  const top = b.lift + (b.aim ? 10 : 0);
  if (u < a1) {
    const e = K.E.outCubic((u - a0) / b.anti);
    h = HOVER + (b.lift - HOVER) * e; rot = b.tilt * e; sy = 1 + b.stretch * 0.4 * e;
  } else if (u < a2) {
    const k = (u - a1) / b.aim;
    h = b.lift + 10 * K.E.smooth(k) + b.tremble * Math.sin(u * 97);
    rot = b.tilt + b.tremble * 0.3 * Math.sin(u * 71 + 1); sy = 1 + b.stretch * 0.4;
  } else if (u < 0) {
    const e = Math.pow((u - a2) / b.slam, b.pow);
    h = top * (1 - e); rot = b.tilt * (1 - e); sy = 1 + b.stretch * (0.4 + 0.6 * e);
  } else if (u < b.stop) {
    h = 0; sy = 1 - b.squash;
  } else {
    const s = u - b.stop, k = Math.max(0, (s - b.press) / b.settle);
    sy = 1 - b.squash * Math.exp(-9 * s) * Math.cos(26 * s);
    if (s < b.press) h = 0;
    else { h = HOVER * K.E.backOut(k, b.back); sy += 0.03 * Math.sin(Math.PI * k); rot = -b.tilt * 0.3 * Math.sin(Math.PI * k) * (1 - k); }
  }
  return { h, rot: rot * DEG, sy };
}
/** 1 while idling, 0 inside a beat window (so the hover bob fades out before the wind-up) */
function idle(t) {
  let w = 1;
  for (const b of BEATS) {
    const d = t < b.a0 ? b.a0 - t : t > b.end ? t - b.end : 0;
    w = Math.min(w, K.E.smooth(K.clamp01((d - 0.05) / 0.3)));
  }
  return w;
}
function sealPose(t, tw) {
  let x = t >= TRAVEL[1][0] ? SLOT[2].x : t >= TRAVEL[0][0] ? SLOT[1].x : SLOT[0].x;
  const id = idle(t);
  let h = HOVER + 7 * Math.sin(K.TAU * 0.7 * tw) * id, rot = 0.012 * Math.sin(K.TAU * 0.45 * tw + 1) * id, sy = 1;
  TRAVEL.forEach(([a, b], i) => {
    if (t < a || t >= b) return;
    const p = (t - a) / (b - a);
    x = SLOT[i].x + (SLOT[i + 1].x - SLOT[i].x) * K.E.inOutCubic(p);
    h += 55 * Math.sin(Math.PI * p); rot += 0.08 * Math.sin(Math.PI * p);
  });
  for (const b of BEATS) { const p = beatPose(b, t); if (p) ({ h, rot, sy } = p); }
  if (t < ENTER[1]) h += 1300 * (1 - K.E.outCubic(K.clamp01((t - ENTER[0]) / (ENTER[1] - ENTER[0]))));
  if (t > EXIT[0]) { const p = K.clamp01((t - EXIT[0]) / (EXIT[1] - EXIT[0])), e = p * p; h += 300 * e; x += 820 * e; rot += 0.3 * e; }   // taken away to the right
  return { x, y: SLOT[0].y, h, rot, sy, sx: 1 + (1 - sy) * 0.75 };
}

// ---------------------------------------------------------------- DOM
const CSS = `
.i89-world{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 1060px}
.i89-world canvas{position:absolute;left:${-M}px;top:${-M}px;width:${CW}px;height:${CH}px}
.i89-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 78% 62% at 50% 46%,rgba(5,6,14,0) 58%,rgba(5,6,14,.5) 100%)}
.i89-tense{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(circle at 58% 50%,rgba(5,6,14,0) 26%,rgba(5,6,14,.78) 82%)}
.i89-flash{position:absolute;inset:0;pointer-events:none;opacity:0;background:#fff8ea}
.i89-hud{position:absolute;inset:0;pointer-events:none;font-family:${FONT.kr};color:${C.cream}}
.i89-hero{position:absolute;left:0;right:0;top:84px;text-align:center}
.i89-hero .ln{display:block;font-weight:900;font-size:90px;line-height:1.1;letter-spacing:-.035em;text-shadow:0 6px 26px rgba(0,0,0,.45)}
.i89-hero em{font-style:normal;color:${C.vermHi}}
.i89-hero .sub{display:block;margin-top:22px;font-weight:700;font-size:34px;letter-spacing:-.01em;color:rgba(251,244,226,.72)}
.i89-panel{position:absolute;left:56px;right:56px;top:1382px;height:252px;border-radius:30px;background:#181614;
  box-shadow:0 22px 50px rgba(0,0,0,.4),inset 0 0 0 1.5px rgba(251,244,226,.08)}
.i89-lbl{position:absolute;left:34px;top:26px;display:flex;align-items:center;gap:16px;font-weight:800;font-size:44px;letter-spacing:-.02em;white-space:nowrap}
.i89-lbl .no{width:50px;height:50px;border-radius:50%;background:${C.verm};color:#fff4ea;font-size:30px;font-weight:900;display:grid;place-items:center;font-variant-numeric:tabular-nums}
.i89-lbl small{font-size:28px;font-weight:700;color:rgba(251,244,226,.5)}
.i89-count{position:absolute;right:36px;top:14px;font-weight:900;font-size:66px;font-variant-numeric:tabular-nums;white-space:nowrap;letter-spacing:-.02em}
.i89-count b{display:inline-block;color:${C.vermHi};transform-origin:50% 60%}
.i89-count span{font-size:30px;font-weight:700;color:rgba(251,244,226,.5);margin-left:8px}
.i89-chips{position:absolute;left:28px;right:28px;top:110px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px 12px}
.i89-chip{height:56px}
.i89-chip i{display:grid;place-items:center;height:56px;border-radius:28px;font-style:normal;font-weight:800;font-size:28px;letter-spacing:-.01em;
  color:rgba(251,244,226,.32);box-shadow:inset 0 0 0 2px rgba(251,244,226,.13)}
.i89-chip i.on{background:${C.verm};color:#fff4ea;box-shadow:0 6px 18px rgba(212,64,42,.42)}
`;

defineDemo({
  id: '89-impact-kit',
  title: '세 번 찍는 도장',
  tech: '임팩트 키트 · 한 박자를 세게 만드는 겹침',
  duration: D,
  background: C.felt,
  async setup(api) { captionScrim(api, '20,22,44');
    const { stage } = api;
    await Promise.all([
      fontReady(`900 90px ${FONT.kr}`, '같은 도장, 세 번 찍는다겹칠수록세게꽂힌다다 겹치는 건 큰 박자 한 번만작은톡중간탁쾅10겹/0123456789·예비멈춤섬광펀치흔들림링파편의성어먼지안착'),
      fontReady(`900 74px ${FONT.serif}`, '됐다한 박자연습장작게중간크게(인)날짜이름'),
      fontReady(`400 200px ${FONT.sfx}`, '톡탁쾅!'),
    ]);

    // ---- bake: desk, prints, sprites, burst tables
    this.desk = await createImageBitmap(bakeDesk(BAKE));
    const lightTap = (nx, ny) => 0.2 + 0.42 * K.clamp01(0.5 + 0.55 * (-0.55 * nx + 0.83 * ny));   // only the near-left lip touches
    const firm = (nx, ny) => 0.6 + 0.16 * K.clamp01(0.5 + 0.5 * (0.7 * nx + 0.7 * ny)) - 0.05 * nx * nx;
    const slam = () => 0.97;
    this.prints = await Promise.all([
      bakePrint(R, '됐다', { pressure: lightTap, amp: 0.95, alpha: 0.82, seed: 101 }),
      bakePrint(R, '됐다', { pressure: firm, amp: 0.6, alpha: 0.93, seed: 202 }),
      bakePrint(R, '됐다', { pressure: slam, amp: 0.3, alpha: 1, seed: 303, squeeze: 1, satellites: 26 }),
    ].map(async (p) => ({ ...p, bmp: await createImageBitmap(p.c) })));
    const gl = document.createElement('canvas');
    gl.width = gl.height = this.prints[2].N;
    this.glint = { c: gl, g: gl.getContext('2d', api.headless ? { willReadFrequently: true } : undefined) };
    this.soft = softDisc(128);
    this.dustSp = softDisc(128, [[0, 0.9], [0.5, 0.55], [1, 0]], '226,212,182');
    this.mote = softDisc(64, [[0, 1], [0.3, 0.5], [1, 0]], '255,214,150');
    this.drops = K.makeBurst(9101, 34, { rim: R, speed: [300, 900], up: [110, 360], size: [2.4, 9.5], delay: 0.03 });
    this.chips = K.makeBurst(9202, 14, { rim: R, speed: [420, 980], up: [260, 560], size: [5, 11], delay: 0.03, sizePow: 1 });
    this.sparks = K.makeBurst(9303, 20, { rim: R * 1.02, speed: [1300, 2100], up: [0, 0], size: [4, 7.5], delay: 0.02, sizePow: 1 });
    this.dust = K.makeBurst(9404, 16, { rim: R * 0.96, speed: [150, 330], up: [0, 0], size: [11, 19], delay: 0.06, sizePow: 1 });
    this.star = starburst(5151, 15);
    this.motes = Array.from({ length: 34 }, (_, i) => { const r = api.rand(700 + i); return { x: r(), y: r(), v: 0.5 + r(), ph: r() * K.TAU, s: 10 + r() * 22 }; });

    // ---- layers: world (camera canvas; CSS scale = punch, CSS translate = shake + handheld), vignettes, HUD, flash
    const css = document.createElement('style'); css.textContent = CSS; document.head.appendChild(css);
    this.world = api.layer('div', { z: 1 }); this.world.className = 'i89-world';
    const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    this.world.appendChild(cv);
    this.g = cv.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
    api.layer('div', { z: 2 }).className = 'i89-vig';
    this.tense = api.layer('div', { z: 2 }); this.tense.className = 'i89-tense';
    const hud = api.layer('div', { z: 3 }); hud.className = 'i89-hud';
    this.flashEl = api.layer('div', { z: 5 }); this.flashEl.className = 'i89-flash';
    hud.innerHTML = `
      <div class="i89-hero a"><span class="ln">같은 도장,</span><span class="ln"><em>세 번</em> 찍는다</span></div>
      <div class="i89-hero b"><span class="ln">겹칠수록</span><span class="ln"><em>세게</em> 꽂힌다</span><span class="sub">다 겹치는 건 큰 박자 한 번만</span></div>
      <div class="i89-panel">
        ${BEATS.map((b, i) => `<div class="i89-lbl"><span class="no">${i + 1}</span>${['작은', '중간', '큰'][i]} ${b.name}<small>${['가볍게', '단단히', '전부 겹쳐'][i]}</small></div>`).join('')}
        <div class="i89-count"><b>0</b><span>/ 10겹</span></div>
        <div class="i89-chips">${LAYERS.map((L) => `<div class="i89-chip"><i>${L}</i></div>`).join('')}</div>
      </div>`;
    const $ = (s) => hud.querySelector(s), $$ = (s) => Array.from(hud.querySelectorAll(s));
    this.panel = $('.i89-panel');
    this.pills = $$('.i89-chip i').map((el) => ({ el, last: '' }));
    this.countEl = $('.i89-count b'); this.countLast = '';

    // ---- one paused GSAP timeline for the camera and the type, seeked in warped time
    const cam = (this.cam = { x: 540, y: 1000, z: 1.12 });
    const out = (this.out = { a: 0, b: 0, c: 0, glint: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    tl.fromTo(cam, { x: 540, y: 1000, z: 1.12 }, { x: 368, z: 1.38, duration: 0.85 }, 0.5);
    tl.to(cam, { x: 540, duration: 0.7 }, TRAVEL[0][0]);
    tl.to(cam, { x: 712, z: 1.45, duration: 0.7 }, TRAVEL[1][0]);
    tl.to(cam, { x: 724, y: 986, z: 1.53, duration: B3.hit - B3.a0, ease: 'sine.inOut' }, B3.a0);     // lean in through the wind-up
    tl.to(cam, { x: 540, y: 1012, z: 1.12, duration: 1.0 }, 6.82);
    tl.to(cam, { z: 1.155, duration: D - 7.82, ease: 'none' }, 7.82);
    const heroA = $$('.i89-hero.a .ln'), heroB = $$('.i89-hero.b > span'), lbls = $$('.i89-lbl'), chipBoxes = $$('.i89-chip');
    tl.fromTo(heroA, { y: 46, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75, ease: 'expo.out', stagger: 0.09 }, 0.04);
    tl.to(heroA, { y: -44, autoAlpha: 0, duration: 0.32, ease: 'power2.in', stagger: 0.05 }, 4.46);   // clear the sky for the big one
    tl.fromTo(this.panel, { y: 420, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85, ease: 'expo.out' }, 0.18);
    tl.fromTo(chipBoxes, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.035 }, 0.42);
    const lblIn = [0.5, RESET[0] + 0.12, RESET[1] + 0.12], lblOut = [RESET[0] - 0.02, RESET[1] - 0.02];
    lbls.forEach((el, i) => {
      tl.fromTo(el, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: 'expo.out' }, lblIn[i]);
      if (i < 2) tl.to(el, { y: -30, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, lblOut[i]);
    });
    tl.fromTo(heroB, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85, ease: 'expo.out', stagger: 0.11 }, 7.2);
    tl.fromTo(out, { a: 0 }, { a: 1, duration: 0.55, ease: 'back.out(1.8)' }, 7.42);
    tl.fromTo(out, { b: 0 }, { b: 1, duration: 0.55, ease: 'back.out(1.8)' }, 7.56);
    tl.fromTo(out, { c: 0 }, { c: 1, duration: 0.6, ease: 'back.out(2.2)' }, 7.7);
    tl.fromTo(out, { glint: 0 }, { glint: 1, duration: 0.95, ease: 'power2.inOut' }, 8.25);
    tl.time(D); tl.time(0);
    this.tl = tl;
    this.lastWorld = ''; this.lastPanel = '';
  },

  frame(t) {
    const tw = K.warp(t, BEATS);
    this.tl.time(tw);
    const { g, cam } = this, z = cam.z;
    const toScreen = (wx, wy) => [(wx - cam.x) * z + AX, (wy - cam.y) * z + AY];

    // ---------------- world pass (camera transform)
    g.setTransform(z, 0, 0, z, AX + M - cam.x * z, AY + M - cam.y * z);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.drawImage(this.desk, BAKE.X0, BAKE.Y0, BAKE.BW, BAKE.BH);

    // (인) marks: a cell loses its mark under a full print (the seal body hides the swap); the faint first print shows it through
    g.fillStyle = 'rgba(29,26,23,0.13)'; g.font = `500 38px ${FONT.serif}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    SLOT.forEach((s, i) => { if (i === 0 || t < BEATS[i].hit) g.fillText('(인)', s.x, 1014); });

    // prints (revealed as the seal lifts off them)
    BEATS.forEach((b, i) => {
      if (t < b.hit) return;
      const p = this.prints[i], s = SLOT[i];
      g.save(); g.translate(s.x, s.y); g.rotate(PRINT_ROT[i]);
      g.drawImage(p.bmp, -p.world / 2, -p.world / 2, p.world, p.world);
      if (i === 2 && this.out.glint > 0 && this.out.glint < 1) this.drawGlint(p);
      g.restore();
    });

    // ink spatter that has landed stays on the sheet
    const sp = SLOT[2], rD = rel(B3, '파편', t);
    if (rD >= 0) {
      g.fillStyle = C.vermInk;
      for (const p of this.drops) {
        const s = rD - p.d; if (s < 0) continue;
        const f = K.fly(p, s, 3.6, 3400);
        if (!f.landed) continue;
        const k = Math.min(1, (s - f.sL) / 0.05);
        g.beginPath(); g.ellipse(sp.x + f.x, sp.y + f.y, p.sz * (0.7 + 0.6 * k), p.sz * (0.55 + 0.25 * k), Math.atan2(p.dy, p.dx), 0, K.TAU); g.fill();
        if (p.sz > 6) { g.beginPath(); g.arc(sp.x + f.x + p.dx * p.sz * 1.9, sp.y + f.y + p.dy * p.sz * 1.9, p.sz * 0.28 * k, 0, K.TAU); g.fill(); }
      }
    }

    // rings on the sheet (flattened a little: it lies on the plane)
    const ringAt = (s, rg, col) => {
      if (!rg) return;
      g.save(); g.translate(s.x, s.y); g.scale(1, 0.9);
      g.strokeStyle = col; g.globalAlpha = rg.a; g.lineWidth = rg.w;
      g.beginPath(); g.arc(0, 0, rg.r, 0, K.TAU); g.stroke(); g.restore();
    };
    ringAt(SLOT[1], K.ring(rel(B2, '링', t), { r0: R * 1.02, r1: R * 2.1, dur: 0.55, w0: 9, w1: 1, a0: 0.7 }), C.ink);
    ringAt(SLOT[2], K.ring(rel(B3, '링', t), { r0: R * 1.05, r1: R * 3.3, dur: 0.75, w0: 13, w1: 1.5, a0: 0.95 }), C.verm);
    ringAt(SLOT[2], K.ring(rel(B3, '링', t), { r0: R * 1.05, r1: R * 4.3, dur: 0.95, w0: 5, w1: 0.6, a0: 0.42, delay: 0.07 }), C.ink);

    // what flew toward the back is drawn first: the seal's body hides it
    this.flying(t, false);

    // the seal: shadow on the sheet, speed lines, body
    const P = sealPose(t, tw);
    if (P.h < 1700) {
      const lift = Math.max(0, P.h), sh = Math.min(1, lift / 520);
      const rr = R * (1.04 + lift / 700);
      g.globalAlpha = 0.42 * (1 - 0.7 * sh);
      g.drawImage(this.soft, P.x - rr + 10 + lift * 0.2, P.y - rr + 14 + lift * 0.13, rr * 2, rr * 2);
      g.globalAlpha = 1;
      const ps = 1 + lift / 1400;
      g.save();
      g.translate(P.x, P.y + R - lift);
      this.speedLines(t, ps, P.sy);
      g.rotate(P.rot); g.scale(P.sx * ps, P.sy * ps);
      drawSeal(g, R, { inkW: 5 });
      g.restore();
    }

    // flying layers that left toward the front: spatter in flight, paper chips, sparks, dust
    this.flying(t, true);

    // outro labels under each cell
    [['톡 · 3겹', this.out.a, C.ink], ['탁 · 6겹', this.out.b, C.ink], ['쾅 · 10겹', this.out.c, C.verm]].forEach(([txt, k, bg], i) => {
      if (k <= 0.001) return;
      g.save(); g.translate(SLOT[i].x, 1176); g.scale(k, k); g.globalAlpha = Math.min(1, k * 3);
      g.font = `800 30px ${FONT.kr}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const w = g.measureText(txt).width + 44;
      g.fillStyle = bg; g.beginPath(); g.roundRect(-w / 2, -27, w, 54, 27); g.fill();
      g.fillStyle = C.cream; g.fillText(txt, 0, 2);
      g.restore();
    });

    // ---------------- screen pass: sound words, motes
    g.setTransform(1, 0, 0, 1, M, M);
    this.words(t, toScreen);
    g.globalCompositeOperation = 'lighter';
    for (const m of this.motes) {
      const y = (((m.y * 1920 - 26 * m.v * tw) % 1920) + 1920) % 1920, x = m.x * 1080 + 18 * Math.sin(tw * 0.4 * m.v + m.ph);
      g.globalAlpha = 0.16 + 0.12 * Math.sin(tw * 1.3 + m.ph);
      g.drawImage(this.mote, x - m.s / 2, y - m.s / 2, m.s, m.s);
    }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;

    // ---------------- DOM channels: punch (CSS scale) and shake + handheld (CSS translate) compose on one element
    let sx = 3 * Math.sin(tw * 0.5 + 0.3), sy = 2.2 * Math.sin(tw * 0.7 + 1.9);
    const s2 = K.shake(rel(B2, '흔들림', t), { amp: 9, dur: 0.38, wiggles: 5, ph1: 0.4, ph2: 2.1 });
    const s3 = K.shake(rel(B3, '흔들림', t), { amp: 24, dur: 0.7, wiggles: 8, ph1: 1.3, ph2: 4.0 });
    sx += s2[0] + s3[0]; sy += s2[1] + s3[1];
    const sc = 1 + K.punch(rel(B3, '펀치', t), 0.035);
    const ws = `${sx.toFixed(2)}px ${sy.toFixed(2)}px|${sc.toFixed(4)}`;
    if (ws !== this.lastWorld) { this.world.style.translate = `${sx.toFixed(2)}px ${sy.toFixed(2)}px`; this.world.style.scale = sc.toFixed(4); this.lastWorld = ws; }
    const pv = `${(0.3 * (s2[0] + s3[0])).toFixed(2)}px ${(0.3 * (s2[1] + s3[1])).toFixed(2)}px`;
    if (pv !== this.lastPanel) { this.panel.style.translate = pv; this.lastPanel = pv; }
    this.flashEl.style.opacity = K.flash(B3, t, { peak: 0.32, dur: 0.42 }).toFixed(3);
    // tension: the frame closes in while the big one aims, and opens on release
    const tension = K.E.smooth(K.clamp01((t - (B3.a0 + 0.15)) / (B3.hit - B3.a0 - 0.15))) * (1 - K.E.outQuad(K.clamp01((t - B3.rel0) / 0.25)));
    this.tense.style.opacity = (0.75 * tension).toFixed(3);
    this.updatePanel(t);
  },

  /** speed lines above the seal while it slams (탁, 쾅): length follows the slam's speed */
  speedLines(t, ps, sy) {
    const g = this.g;
    for (const b of [B2, B3]) {
      const u = t - b.hit;
      if (u < -b.slam || u > b.stop + 0.03) continue;
      const k = u < 0 ? Math.pow((u + b.slam) / b.slam, b.pow - 1) : u < b.stop ? 1 : 1 - (u - b.stop) / 0.03;
      const L = (b === B3 ? 300 : 170) * k, top = -3.75 * R * ps * sy;
      g.lineCap = 'round';
      [-0.82, -0.42, 0.04, 0.46, 0.86].forEach((x, i) => {
        const y0 = top - (i % 3) * 22, y1 = y0 - L * (0.7 + 0.3 * (i % 2)), lx = x * R * ps;
        const gr = g.createLinearGradient(0, y0, 0, y1);       // trails thin out away from the seal
        gr.addColorStop(0, 'rgba(29,26,23,0.42)'); gr.addColorStop(1, 'rgba(29,26,23,0)');
        g.strokeStyle = gr; g.globalAlpha = Math.min(1, k * 2); g.lineWidth = i % 2 ? 3 : 4.5;
        g.beginPath(); g.moveTo(lx, y0); g.lineTo(lx, y1); g.stroke();
      });
      g.globalAlpha = 1;
    }
  },

  /**
   * the 파편 and 먼지 layers in flight — all closed form in the time since their fire time.
   * front = false draws what leaves toward the back (before the seal, so its body hides them), true the rest.
   */
  flying(t, front) {
    const g = this.g, s0 = SLOT[2], side = (p) => (p.dy > -0.25) === front;
    const rD = rel(B3, '파편', t);
    if (rD >= 0 && rD < 1.2) {
      // sparks: tapered gold streaks with an ink edge, fast on the plane, heavy drag, no gravity
      g.lineJoin = 'round';
      for (const p of this.sparks) {
        const s = rD - p.d; if (s < 0 || s > 0.32 || !side(p)) continue;
        const f = K.fly(p, s, 7.5, 0), u = s / 0.32, sp = Math.hypot(f.vx, f.vy) + 1e-6;
        const L = 12 + sp * 0.03, w = p.sz * 1.15 * (1 - 0.6 * u), nx = -f.vy / sp, ny = f.vx / sp, ux = f.vx / sp, uy = f.vy / sp;
        const x = s0.x + f.x, y = s0.y + f.y;
        g.globalAlpha = Math.pow(1 - u, 0.9);
        g.beginPath(); g.moveTo(x + ux * w, y + uy * w); g.lineTo(x + nx * w, y + ny * w); g.lineTo(x - ux * L, y - uy * L); g.lineTo(x - nx * w, y - ny * w); g.closePath();
        g.fillStyle = u < 0.3 ? '#ffc21f' : '#f59a16'; g.strokeStyle = 'rgba(29,26,23,0.75)'; g.lineWidth = 2;
        g.fill(); g.stroke();
      }
      // ink droplets in flight: drag on the plane, gravity on the height — drawn as stretched drops
      g.globalAlpha = 1; g.strokeStyle = C.vermInk; g.lineCap = 'round';
      for (const p of this.drops) {
        const s = rD - p.d; if (s < 0 || !side(p)) continue;
        const f = K.fly(p, s, 3.6, 3400);
        if (f.landed) continue;
        const x = s0.x + f.x, y = s0.y + f.y - f.z, sp = Math.hypot(f.vx, f.vy) + 1e-6, L = Math.min(28, sp * 0.022);
        g.lineWidth = p.sz * 1.4;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - (f.vx / sp) * L, y - (f.vy / sp) * L); g.stroke();
      }
      // paper chips: tumbling flecks that land and fade
      for (const p of this.chips) {
        const s = rD - p.d; if (s < 0 || !side(p)) continue;
        const f = K.fly(p, s, 2.6, 3600);
        const fade = f.landed ? 1 - Math.min(1, (s - f.sL) / 0.3) : 1;
        if (fade <= 0) continue;
        const ang = p.ph + p.spin * Math.min(s, f.sL);
        g.save(); g.translate(s0.x + f.x, s0.y + f.y - f.z); g.rotate(ang); g.scale(1, 0.45 + 0.55 * Math.abs(Math.cos(ang * 1.7)));
        g.globalAlpha = fade; g.fillStyle = '#fbf3df'; g.strokeStyle = 'rgba(29,26,23,0.75)'; g.lineWidth = 1.8;
        g.beginPath(); g.rect(-p.sz / 2, -p.sz * 0.35, p.sz, p.sz * 0.7); g.fill(); g.stroke();
        g.restore();
      }
      g.globalAlpha = 1;
    }
    // dust: flat cartoon puffs squeezed out from under the rim (front and sides only). Stroke every puff
    // first, then fill them all: only the outline of the union stays, so the cloud reads as one shape.
    const rU = rel(B3, '먼지', t);
    if (front && rU >= 0 && rU < 0.9) {
      const puffs = [];
      for (const p of this.dust) {
        const s = rU - p.d; if (s < 0 || p.dy < -0.35) continue;
        const f = K.fly(p, s, 3.2, 0), u = K.clamp01(s / 0.8);
        const rr = p.sz * (0.5 + 1.0 * K.E.outCubic(Math.min(1, u * 1.6))) * (1 - K.E.smooth(K.clamp01((u - 0.45) / 0.55)));
        if (rr < 0.5) continue;
        const x = s0.x + f.x * 1.1, y = s0.y + f.y * 0.7 + R * 0.62 - 30 * u;
        puffs.push([x, y, rr], [x + rr * 0.6, y - rr * 0.4, rr * 0.66]);
      }
      g.globalAlpha = 0.92;
      g.strokeStyle = 'rgba(29,26,23,0.5)'; g.lineWidth = 4.4;
      for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, K.TAU); g.stroke(); }
      g.fillStyle = '#fcf7ec';
      for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, K.TAU); g.fill(); }
      g.globalAlpha = 1;
    }
  },

  /** sound words: 톡 (ink, thin), 탁! (vermilion), 쾅! (vermilion on a gold starburst, double outline) */
  words(t, toScreen) {
    const g = this.g;
    const w1 = K.sfx(rel(B1, '의성어', t), { hold: 0.55, peak: 1.1 });
    if (w1) { const [x, y] = toScreen(SLOT[0].x + 150, SLOT[0].y - 215); drawWord(g, '톡', x, y + w1.dy, 92, { rot: -8 * DEG, scale: w1.s, alpha: w1.a, fill: C.ink, outline: C.cream, outW: 9, inkW: 0, shadow: 0.18 }); }
    const w2 = K.sfx(rel(B2, '의성어', t), { hold: 0.7, peak: 1.16 });
    if (w2) { const [x, y] = toScreen(SLOT[1].x - 165, SLOT[1].y - 250); drawWord(g, '탁!', x, y + w2.dy, 138, { rot: 8 * DEG, scale: w2.s, alpha: w2.a, outW: 12, inkW: 5 }); }
    const r3 = rel(B3, '의성어', t), w3 = K.sfx(r3, { hold: 0.88, peak: 1.24, out: 0.3 });
    if (w3) {
      const x = 548, y = 392 + w3.dy;
      const kb = K.clamp01(r3 / 0.45), burst = 0.35 + 0.65 * K.E.backOut(kb, 2.2);
      g.globalAlpha = w3.a;
      drawBurstShape(g, this.star, x + 4, y + 6, 290 * burst, -0.2 + 0.22 * r3, { fill: '#ffcf4a', inkW: 7 });
      drawWord(g, '쾅!', x, y, 250, { rot: -8 * DEG, scale: w3.s, alpha: w3.a, outW: 17, inkW: 7, shadow: 0.35 });
      g.globalAlpha = 1;
    }
  },

  /** a light band sweeping the wet print (source-atop on a scratch canvas) */
  drawGlint(p) {
    const { c, g: s } = this.glint, N = p.N, k = this.out.glint;
    s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, N, N);
    s.drawImage(p.bmp, 0, 0);
    s.globalCompositeOperation = 'source-atop';
    const x = -N * 0.6 + k * N * 2.2;
    const gr = s.createLinearGradient(x - N * 0.14, 0, x + N * 0.14, N * 0.3);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,236,214,0.42)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    s.fillStyle = gr; s.fillRect(0, 0, N, N);
    this.g.drawImage(c, -p.world / 2, -p.world / 2, p.world, p.world);
  },

  /** the budget panel: which layers this beat spends, lit at the moment each one fires */
  updatePanel(t) {
    const bi = t >= RESET[1] ? 2 : t >= RESET[0] ? 1 : 0, b = BEATS[bi];
    let n = 0, lastFire = -9;
    LAYERS.forEach((L, i) => {
      const f = b.fire[L], on = f != null && t >= f;
      let state = 'off';
      if (on) {
        n++; lastFire = Math.max(lastFire, f);
        const u = t - f, k = u < 0.08 ? K.E.outQuad(u / 0.08) : 1 - K.E.backOut(K.clamp01((u - 0.08) / 0.3), 2.2);
        state = `on|${(1 + 0.07 * k).toFixed(3)}|${(-7 * k).toFixed(2)}`;
      }
      const pill = this.pills[i];
      if (state !== pill.last) {
        pill.el.className = on ? 'on' : '';
        pill.el.style.transform = on ? `translateY(${state.split('|')[2]}px) scale(${state.split('|')[1]})` : '';
        pill.last = state;
      }
    });
    const u = t - lastFire, s = n && u < 0.35 ? 1 + 0.25 * (1 - K.E.outCubic(u / 0.35)) : 1;
    const key = `${n}|${s.toFixed(3)}`;
    if (key !== this.countLast) { this.countEl.textContent = n; this.countEl.style.transform = `scale(${s.toFixed(3)})`; this.countLast = key; }
  },
});

/** a soft scrim under the harness caption (bottom 19 % of the stage) so the white caption reads on light scenes */
function captionScrim(api, rgb) {
  const el = api.layer('div', { z: 999 });
  el.style.background = `linear-gradient(to bottom, rgba(${rgb},0) 81%, rgba(${rgb},.34) 89%, rgba(${rgb},.58) 100%)`;
  el.style.pointerEvents = 'none';
}
