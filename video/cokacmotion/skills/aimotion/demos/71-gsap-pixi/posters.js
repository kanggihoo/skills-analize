/*
 * The four posters. Each is a Pixi display tree in stage coordinates (1080×1920, bleed PAD on every side)
 * built from Graphics, Text / SplitText and generated photo sprites, plus an enter(tl) that adds its editorial
 * entrances to the master GSAP timeline at absolute times (anchored on the transition times in T).
 *
 * Determinism rules followed here (see main.js): every animated property gets its start value assigned
 * directly before the timeline is built, only .to() tweens are used, and two tweens never animate the same
 * property of the same object at overlapping times — so after priming, the timeline gives the same state for
 * a given t whichever way the playhead arrived.
 */
import { PIXI } from './pixi-global.js';
import { W, H, PAD, RW, RH, C, F, S, fitted, inkText, rectMask, bar, circle, fullBleed, sprite } from './kit.js';

// story beats (s). Transition k reveals poster k+1: [start, end]
export const T = {
  D: 10,
  intro: [0.0, 0.62],
  t1: [2.55, 3.4],
  t2: [4.95, 5.8],
  t3: [7.15, 8.1],
};

const DEG = Math.PI / 180;

/** offset objects now, tween them back to where they were; one tween per object, staggered */
function rise(tl, objs, at, { dx = 0, dy = 40, dur = 0.8, ease = 'power3.out', stagger = 0.08, fade = true } = {}) {
  objs.forEach((o, i) => {
    const bx = o.x, by = o.y;
    o.x = bx + dx; o.y = by + dy;
    const v = { x: bx, y: by };
    if (fade) { o.alpha = 0; v.alpha = 1; }
    tl.to(o, { pixi: v, duration: dur, ease }, at + i * stagger);
  });
}

/** SplitText chars wait below (or above) their line mask and slide into place, GSAP-staggered */
function charsIn(tl, split, rect, at, { from = 'below', dur = 1.0, ease = 'expo.out', stagger = 0.08, extra = 60 } = {}) {
  const off = (rect.h + extra) * (from === 'below' ? 1 : -1);
  for (const c of split.chars) c.y = off;
  tl.to(split.chars, { pixi: { y: 0 }, duration: dur, ease, stagger }, at);
}

function centreRoot(root) {
  root.pivot.set(W / 2, H / 2);
  root.position.set(W / 2, H / 2);
  return root;
}

// ---------------------------------------------------------------- 1 · 물결 (tomato)
export const ORB = { x: 548, y: 600, r: 320 };

export function poster1(A) {
  const root = centreRoot(new PIXI.Container());
  root.addChild(fullBleed(C.tomato));

  // masthead row + hairline
  const wave = inkText('WAVE', S(F.cond, 60, C.cream, { ls: 0.05 }), 64, 74);
  const midY = wave.rect.y + wave.rect.h / 2;
  const meta = inkText('Nº 07 — SS/27', S(F.mono, 24, C.cream, { weight: 600, ls: 0.06 }), 1016, midY, 1, 0.5);
  const rule = bar(64, wave.rect.y + wave.rect.h + 22, 952, 3, C.cream);
  rule.scale.x = 0;
  root.addChild(wave.obj, meta.obj, rule);

  // the orb: a flat ultramarine disc offset behind a circular photo, and a cream hairline ring
  const disc = circle(ORB.x + 56, ORB.y + 52, ORB.r, C.ultra);
  disc.scale.set(0);
  const orb = new PIXI.Container();
  orb.position.set(ORB.x, ORB.y);
  const photo = sprite(A.photo1, 0, 0);
  photo.scale.set(1.4);
  const orbMask = circle(0, 0, ORB.r, 0xffffff);
  orbMask.scale.set(0);
  orb.addChild(photo, orbMask);
  photo.mask = orbMask;
  const ring = new PIXI.Graphics().circle(0, 0, ORB.r + 24).stroke({ width: 3, color: C.cream });
  ring.position.set(ORB.x, ORB.y);
  ring.scale.set(0.82); ring.alpha = 0;
  root.addChild(disc, orb, ring);

  // sticker on the orb's upper-left edge
  const sticker = new PIXI.Container();
  sticker.position.set(ORB.x - ORB.r * 0.8, ORB.y - ORB.r * 0.74);
  const sSt = S(F.cond, 50, C.ink, { ls: 0.03 });
  sticker.addChild(circle(0, 0, 92, C.acid), inkText('NEW', sSt, 0, -7, 0.5, 1).obj, inkText('ISSUE', sSt, 0, 7, 0.5, 0).obj);
  sticker.scale.set(0); sticker.rotation = -40 * DEG;

  // vertical running text along the right edge (reads bottom → top)
  const vert = new PIXI.Container();
  vert.position.set(1042, 900);
  vert.rotation = -90 * DEG;
  const vt = inkText('SPRING / SUMMER 2027', S(F.cond, 38, C.cream, { ls: 0.14 }), 0, 0, 0, 1);
  vert.addChild(vt.obj);

  // 물결 — the headline, fitted to the text column, rising out of its own line mask
  const sBig = fitted(S(F.krDisplay, 400, C.cream), '물결', 952);
  const big = inkText('물결', sBig, 64, ORB.y + ORB.r - 14, 0, 0, true);
  const bigMask = rectMask(root, big.obj, big.rect, 30, 22);

  // Latin deck + Korean body
  const deckY = big.rect.y + big.rect.h + 46;
  const deck = inkText('the liquid issue', S(F.serif, 86, C.cream, { weight: 300, ls: -0.01 }), 64, deckY);
  const folio = inkText('01 / 04', S(F.mono, 24, C.cream, { weight: 600, ls: 0.08 }), 1016, deck.rect.y + deck.rect.h - 4, 1, 1);
  const sBody = S(F.kr, 34, C.cream, { weight: 600, ls: -0.01 });
  const bodyY = deck.rect.y + deck.rect.h + 40;
  const b1 = inkText('표면이 흔들릴 때,', sBody, 64, bodyY);
  const b2 = inkText('색은 가장 멀리 번진다.', sBody, 64, b1.rect.y + b1.rect.h + 16);
  root.addChild(big.obj, bigMask, deck.obj, folio.obj, b1.obj, b2.obj, sticker, vert);

  function enter(tl) {
    tl.to(rule, { pixi: { scaleX: 1 }, duration: 0.9, ease: 'expo.inOut' }, 0.3);
    rise(tl, [wave.obj, meta.obj], 0.4, { dy: 24, dur: 0.7, stagger: 0.1 });
    tl.to(disc, { pixi: { scale: 1 }, duration: 1.0, ease: 'back.out(1.5)' }, 0.25);
    tl.to(orbMask, { pixi: { scale: 1 }, duration: 1.1, ease: 'expo.out' }, 0.45);
    tl.to(photo, { pixi: { scale: 1.0 }, duration: 2.9, ease: 'power2.out' }, 0.45);
    tl.to(ring, { pixi: { scale: 1, alpha: 1 }, duration: 1.0, ease: 'expo.out' }, 0.75);
    charsIn(tl, big.obj, big.rect, 0.7, { stagger: 0.1, dur: 1.1 });
    tl.to(sticker, { pixi: { scale: 1, rotation: -10 }, duration: 1.0, ease: 'elastic.out(1, 0.55)' }, 1.05);
    rise(tl, [vt.obj], 1.15, { dx: -70, dy: 0, dur: 0.8 });
    rise(tl, [deck.obj, folio.obj], 1.2, { dy: 30, dur: 0.8, stagger: 0.1 });
    rise(tl, [b1.obj, b2.obj], 1.4, { dy: 26, dur: 0.7, stagger: 0.1 });
    // hold: the sticker keeps turning, the flat disc drifts against the photo (parallax)
    tl.to(sticker, { pixi: { rotation: 6 }, duration: 1.4, ease: 'sine.inOut' }, 2.05);
    tl.to(disc, { pixi: { x: disc.x - 18, y: disc.y + 10 }, duration: 2.2, ease: 'sine.inOut' }, 1.25);
  }
  return { root, enter };
}

// ---------------------------------------------------------------- 2 · FLOW / 흐름 (ultramarine)
export function poster2(A) {
  const root = centreRoot(new PIXI.Container());
  root.addChild(fullBleed(C.ultra));

  const sFlow = fitted(S(F.cond, 500, C.acid, { ls: 0.012 }), 'FLOW', 952);
  const flow = inkText('FLOW', sFlow, 64, 92, 0, 0, true);
  const flowMask = rectMask(root, flow.obj, flow.rect, 30, 20);
  const ruleY = flow.rect.y + flow.rect.h + 30;
  const rule = bar(64, ruleY, 952, 3, C.acid, 'right');
  rule.scale.x = 0;
  const m1 = inkText('Nº 07 · 02 / 04', S(F.mono, 22, C.acid, { weight: 600, ls: 0.08 }), 64, ruleY + 24);
  const m2 = inkText('흐름의 단면', S(F.kr, 26, C.acid, { weight: 700 }), 1016, m1.rect.y + m1.rect.h / 2, 1, 0.5);
  root.addChild(flow.obj, flowMask, rule, m1.obj, m2.obj);

  // arch window with the chrome-drop photo; the arch grows up from its sill
  const AX = 64, AW = 500, AT = ruleY + 92, AH = 820, AR = AW / 2;
  const arch = new PIXI.Container();
  const photo = sprite(A.photo2, AX + AW / 2, AT + AH / 2);
  photo.y += 150;
  const archMask = new PIXI.Graphics()
    .moveTo(AX, AT + AH).lineTo(AX, AT + AR).arc(AX + AR, AT + AR, AR, Math.PI, 0).lineTo(AX + AW, AT + AH).closePath()
    .fill(0xffffff);
  archMask.pivot.y = AT + AH; archMask.y = AT + AH;
  archMask.scale.y = 0;
  arch.addChild(photo, archMask);
  photo.mask = archMask;
  const sill = bar(AX - 18, AT + AH - 3, AW + 36, 3, C.acid, 'center');
  sill.scale.x = 0;

  // sun overlapping the arch shoulder
  const sun = circle(AX + AW - 34, AT + 70, 88, C.tomato);
  sun.scale.set(0);

  // 흐 / 름 stacked in the right column, each sliding in from the right behind its own mask
  const colX = AX + AW + 52, colW = 1016 - colX;
  const sK = fitted(S(F.krDisplay, 400, C.acid), '흐', colW);
  const k1 = inkText('흐', sK, colX, AT);
  const k2 = inkText('름', sK, colX, k1.rect.y + k1.rect.h + 40);
  const km1 = rectMask(root, k1.obj, k1.rect, 12), km2 = rectMask(root, k2.obj, k2.rect, 12);
  // stripes under the column, ragged right like a pull-quote rule
  const stripes = [];
  const sy = k2.rect.y + k2.rect.h + 40;
  for (let i = 0; i < 5; i++) {
    const w = colW * [1, 0.82, 0.92, 0.64, 0.78][i];
    const s = bar(colX + colW - w, sy + i * 17, w, 4, C.acid, 'right');
    s.scale.x = 0;
    stripes.push(s);
  }
  const line = inkText('물은 길을 기억하지 않는다', S(F.kr, 32, C.acid, { weight: 600, ls: -0.01 }), 64, AT + AH + 42);
  root.addChild(arch, sill, sun, k1.obj, k2.obj, km1, km2, ...stripes, line.obj);

  function enter(tl) {
    const t0 = T.t1[0];
    charsIn(tl, flow.obj, flow.rect, t0 + 0.3, { stagger: 0.07, dur: 1.0 });
    tl.to(rule, { pixi: { scaleX: 1 }, duration: 0.8, ease: 'expo.inOut' }, t0 + 0.5);
    tl.to(archMask, { pixi: { scaleY: 1 }, duration: 1.0, ease: 'expo.inOut' }, t0 + 0.45);
    tl.to(photo, { pixi: { y: photo.y - 150 }, duration: 1.8, ease: 'power3.out' }, t0 + 0.45);
    tl.to(sill, { pixi: { scaleX: 1 }, duration: 0.7, ease: 'power3.out' }, t0 + 0.6);
    rise(tl, [k1.obj, k2.obj], t0 + 0.7, { dx: 260, dy: 0, dur: 0.9, ease: 'expo.out', stagger: 0.12, fade: false });
    rise(tl, [m1.obj, m2.obj], t0 + 0.9, { dy: 18, dur: 0.6, stagger: 0.08 });
    tl.to(sun, { pixi: { scale: 1 }, duration: 0.8, ease: 'back.out(2)' }, t0 + 1.0);
    tl.to(stripes, { pixi: { scaleX: 1 }, duration: 0.6, ease: 'power4.out', stagger: 0.06 }, t0 + 1.05);
    rise(tl, [line.obj], t0 + 1.2, { dy: 24, dur: 0.7 });
    // hold: a swell runs through FLOW, the sun bobs
    const h0 = T.t1[0] + 1.65;
    tl.to(flow.obj.chars, { pixi: { y: -16 }, duration: 0.38, ease: 'sine.inOut', stagger: 0.09 }, h0);
    tl.to(flow.obj.chars, { pixi: { y: 0 }, duration: 0.38, ease: 'sine.inOut', stagger: 0.09 }, h0 + 0.38);
    tl.to(sun, { pixi: { y: sun.y - 16 }, duration: 1.1, ease: 'sine.inOut' }, h0 - 0.2);
  }
  return { root, enter };
}

// ---------------------------------------------------------------- 3 · 색 / Chroma (acid yellow)
export function poster3(A) {
  const root = centreRoot(new PIXI.Container());
  root.addChild(fullBleed(C.acid));

  // 색, huge, bleeding off the left edge; it settles from a tilted, oversized state about its own centre
  const sBig = fitted(S(F.krDisplay, 900, C.ultra), '색', 1000);
  const big = inkText('색', sBig, -70, 130);
  const bigC = new PIXI.Container();
  const cx = big.rect.x + big.rect.w / 2, cy = big.rect.y + big.rect.h / 2;
  bigC.pivot.set(cx, cy); bigC.position.set(cx, cy);
  bigC.addChild(big.obj);
  bigC.scale.set(1.3); bigC.rotation = -10 * DEG; bigC.alpha = 0;

  // tomato frame holding the sphere photo, rotated
  const sq = new PIXI.Container();
  sq.position.set(728, 560);
  const SQ = 420, IN = 20;
  const frame = new PIXI.Graphics().rect(-SQ / 2, -SQ / 2, SQ, SQ).fill(C.tomato);
  const photo = sprite(A.photo3, 0, 0);
  photo.scale.set(1.5);
  const pm = new PIXI.Graphics().rect(-SQ / 2 + IN, -SQ / 2 + IN, SQ - 2 * IN, SQ - 2 * IN).fill(0xffffff);
  sq.addChild(frame, photo, pm);
  photo.mask = pm;
  sq.scale.set(0); sq.rotation = -120 * DEG;

  // dot grid (4 rows × 5 cols)
  const dots = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
    const d = circle(812 + c * 46, 1010 + r * 46, 9, C.ink);
    d.scale.set(0);
    dots.push(d);
  }

  const sChroma = fitted(S(F.serif, 200, C.ink, { weight: 800, ls: -0.02 }), 'Chroma', 640);
  const chroma = inkText('Chroma', sChroma, 64, 1196, 0, 0, true);
  const chromaMask = rectMask(root, chroma.obj, chroma.rect, 24, 16);
  const kr = inkText('색은 경계에서 태어난다', S(F.kr, 38, C.ink, { weight: 700, ls: -0.01 }), 64, chroma.rect.y + chroma.rect.h + 38);

  // ink footer band (also carries the white caption)
  const bandTop = kr.rect.y + kr.rect.h + 52;
  const band = new PIXI.Container();
  band.addChild(new PIXI.Graphics().rect(-PAD, bandTop, RW, RH - bandTop).fill(C.ink));
  const f1 = inkText('03 / 04 — COLOUR FIELD', S(F.mono, 22, C.acid, { weight: 600, ls: 0.08 }), 64, bandTop + 34);
  const f2 = inkText('WAVE Nº 07', S(F.mono, 22, C.acid, { weight: 600, ls: 0.08 }), 1016, bandTop + 34, 1, 0);
  band.addChild(f1.obj, f2.obj);
  band.y = 420;
  root.addChild(bigC, sq, ...dots, chroma.obj, chromaMask, kr.obj, band);

  function enter(tl) {
    const t0 = T.t2[0];
    tl.to(bigC, { pixi: { scale: 1, rotation: 0, alpha: 1 }, duration: 1.3, ease: 'expo.out' }, t0 + 0.2);
    tl.to(sq, { pixi: { scale: 1, rotation: 12 }, duration: 1.1, ease: 'back.out(1.2)' }, t0 + 0.45);
    tl.to(photo, { pixi: { scale: 1 }, duration: 1.8, ease: 'power2.out' }, t0 + 0.45);
    tl.to(band, { pixi: { y: 0 }, duration: 0.9, ease: 'expo.out' }, t0 + 0.55);
    charsIn(tl, chroma.obj, chroma.rect, t0 + 0.65, { stagger: 0.05, dur: 0.9 });
    tl.to(dots, { pixi: { scale: 1 }, duration: 0.5, ease: 'back.out(3)', stagger: { grid: [4, 5], from: 'center', amount: 0.45 } }, t0 + 0.9);
    rise(tl, [kr.obj], t0 + 1.05, { dy: 26, dur: 0.7 });
    rise(tl, [f1.obj, f2.obj], t0 + 1.1, { dy: 14, dur: 0.6, stagger: 0.08 });
    // hold: the frame keeps turning, a ripple crosses the dot grid
    tl.to(sq, { pixi: { rotation: 19 }, duration: 0.9, ease: 'sine.inOut' }, t0 + 1.55);
    const r0 = t0 + 1.9, rs = { grid: [4, 5], from: 0, amount: 0.3 };   // after the last dot has landed (t0 + 1.85)
    tl.to(dots, { pixi: { scale: 0.45 }, duration: 0.28, ease: 'sine.inOut', stagger: rs }, r0);
    tl.to(dots, { pixi: { scale: 1 }, duration: 0.28, ease: 'sine.inOut', stagger: rs }, r0 + 0.28);
  }
  return { root, enter };
}

// ---------------------------------------------------------------- 4 · cover (cream)
export function poster4(A) {
  const root = centreRoot(new PIXI.Container());
  root.addChild(fullBleed(C.cream));
  const R = A.rand(4040);

  // masthead: fitted to the column, but never taller than ~400 px of caps
  const sMast = fitted(S(F.cond, 500, C.tomato, { ls: 0.01 }), 'WAVE', 952, 600);
  const mast = inkText('WAVE', sMast, 540, 64, 0.5, 0, true);
  const mastMask = rectMask(root, mast.obj, mast.rect, 30, 20);
  const metaY = mast.rect.y + mast.rect.h + 24;
  const ma = inkText('Nº 07   SS 2027', S(F.mono, 22, C.ink, { weight: 600, ls: 0.08 }), 64, metaY);
  const mb = inkText('2027 여름호 · 물결 넘김', S(F.kr, 26, C.ink, { weight: 700 }), 1016, ma.rect.y + ma.rect.h / 2, 1, 0.5);
  const rule = bar(64, metaY + Math.max(ma.rect.h, 26) + 18, 952, 2, C.ink);
  rule.scale.x = 0;
  root.addChild(mast.obj, mastMask, ma.obj, mb.obj, rule);

  // cover photo panel (liquid pour), wiped in from the left
  const PX = 64, PY = rule.y + 26, PW = 952, PH = 1336 - PY;
  const panel = new PIXI.Container();
  const photo = sprite(A.photo4, PX + PW / 2, PY + PH / 2);
  photo.scale.set(1.25);
  const pm = bar(PX, PY, PW, PH, 0xffffff, 'left');
  pm.scale.x = 0;
  panel.addChild(photo, pm);
  photo.mask = pm;

  // cover lines over the photo, bottom-left
  const shadow = { color: C.ink, alpha: 0.35, blur: 14, distance: 4, angle: Math.PI / 2 };
  const label = new PIXI.Container();
  const lt = inkText('특집', S(F.kr, 28, C.cream, { weight: 800 }), 0, 0, 0, 0.5);
  const lbg = bar(-16, -26, lt.rect.w + 32, 52, C.tomato, 'left');
  label.addChild(lbg, lt.obj);
  const sHead = fitted(S(F.krDisplay, 120, C.cream, { dropShadow: shadow }), '물결 넘김', 560);
  const headY = PY + PH - 56;
  const sub = inkText('색과 형태가 흐르는 네 장의 포스터', S(F.kr, 30, C.cream, { weight: 600, dropShadow: { ...shadow, blur: 8, distance: 2 } }), PX + 40, headY, 0, 1);
  const head = inkText('물결 넘김', sHead, PX + 40, sub.rect.y - 24, 0, 1, true);
  const headMask = rectMask(root, head.obj, head.rect, 24, 14);
  label.position.set(PX + 56, head.rect.y - 54);
  lbg.scale.x = 0;

  // sticker on the photo's top-right corner
  const sticker = new PIXI.Container();
  sticker.position.set(PX + PW - 70, PY + 74);
  const sSt = S(F.cond, 54, C.ink, { ls: 0.02 });
  sticker.addChild(circle(0, 0, 84, C.acid), inkText('Nº', sSt, 0, -6, 0.5, 1).obj, inkText('07', sSt, 0, 6, 0.5, 0).obj);
  sticker.scale.set(0); sticker.rotation = -30 * DEG;

  // palette strip
  const sw = [];
  const swY = PY + PH + 22, gap = 8, swW = (952 - 3 * gap) / 4;
  [C.tomato, C.ultra, C.acid, C.ink].forEach((col, i) => {
    const s = bar(64 + i * (swW + gap), swY, swW, 18, col, 'left');
    s.scale.x = 0;
    sw.push(s);
  });

  // ultramarine footer band: issue line + barcode (carries the white caption)
  const bandTop = swY + 18 + 30;
  const band = new PIXI.Container();
  band.addChild(new PIXI.Graphics().rect(-PAD, bandTop, RW, RH - bandTop).fill(C.ultra));
  const fa = inkText('THE LIQUID ISSUE', S(F.mono, 22, C.cream, { weight: 700, ls: 0.12 }), 64, bandTop + 36);
  const fb = inkText('네 장의 포스터, 하나의 물결', S(F.kr, 28, C.cream, { weight: 600 }), 64, fa.rect.y + fa.rect.h + 20);
  const BX = 806, BY = bandTop + 30, BW = 210, BH = 124;
  const code = new PIXI.Container();
  code.addChild(new PIXI.Graphics().rect(BX, BY, BW, BH).fill(C.cream));
  const bars = [];
  let x = BX + 14;
  while (x < BX + BW - 18) {
    const w = 2 + Math.floor(R() * 4) * 1.5;
    if (R() > 0.38) {
      const b = bar(x, BY + 12, w, BH - 44, C.ink, 'bottom');
      b.scale.y = 0;
      bars.push(b);
    }
    x += w + 2 + Math.floor(R() * 3) * 1.5;
  }
  code.addChild(...bars);
  const digits = inkText('9 771234 507002', S(F.mono, 14, C.ink, { weight: 600, ls: 0.06 }), BX + BW / 2, BY + BH - 10, 0.5, 1);
  code.addChild(digits.obj);
  band.addChild(fa.obj, fb.obj, code);
  band.y = 560;

  root.addChild(panel, label, head.obj, headMask, sub.obj, sticker, ...sw, band);

  function enter(tl) {
    const t0 = T.t3[0];
    charsIn(tl, mast.obj, mast.rect, t0 + 0.4, { from: 'above', stagger: 0.07, dur: 1.0 });
    tl.to(pm, { pixi: { scaleX: 1 }, duration: 0.95, ease: 'expo.inOut' }, t0 + 0.6);
    tl.to(photo, { pixi: { scale: 1 }, duration: T.D - (t0 + 0.6), ease: 'power2.out' }, t0 + 0.6);
    rise(tl, [ma.obj, mb.obj], t0 + 0.75, { dy: 16, dur: 0.6, stagger: 0.08 });
    tl.to(rule, { pixi: { scaleX: 1 }, duration: 0.8, ease: 'expo.inOut' }, t0 + 0.75);
    tl.to(band, { pixi: { y: 0 }, duration: 0.9, ease: 'expo.out' }, t0 + 0.9);
    tl.to(lbg, { pixi: { scaleX: 1 }, duration: 0.45, ease: 'power3.out' }, t0 + 1.15);
    rise(tl, [lt.obj], t0 + 1.25, { dx: -12, dy: 0, dur: 0.5 });
    charsIn(tl, head.obj, head.rect, t0 + 1.2, { stagger: 0.07, dur: 0.9 });
    rise(tl, [sub.obj], t0 + 1.45, { dy: 20, dur: 0.7 });
    tl.to(sw, { pixi: { scaleX: 1 }, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, t0 + 1.35);
    rise(tl, [fa.obj, fb.obj], t0 + 1.45, { dy: 16, dur: 0.6, stagger: 0.08 });
    tl.to(bars, { pixi: { scaleY: 1 }, duration: 0.35, ease: 'power2.out', stagger: { amount: 0.45, from: 'start' } }, t0 + 1.5);
    tl.to(sticker, { pixi: { scale: 1 }, duration: 1.0, ease: 'elastic.out(1, 0.5)' }, t0 + 1.7);
    tl.to(sticker, { pixi: { rotation: 14 }, duration: T.D - (t0 + 1.7), ease: 'power2.out' }, t0 + 1.7);
  }
  return { root, enter };
}

// ---------------------------------------------------------------- transition masks
/**
 * A flood mask: a huge rectangle whose leading edge is a sine swell (two harmonics), so the displacement
 * filter on top turns it into a liquid front. dir 'up': the edge is the top (y ≈ 0), body below;
 * 'down': the edge is the bottom (y ≈ 0), body above.
 */
export function waveMask(dir, amp = 44) {
  const pts = [];
  const x0 = -PAD - 40, x1 = W + PAD + 40, N = 64, depth = 2700, s = dir === 'up' ? 1 : -1;
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N;
    pts.push(x, -s * amp * (Math.sin(x * 0.0105 + 0.6) * 0.75 + Math.sin(x * 0.027 + 2.1) * 0.25));
  }
  pts.push(x1, s * depth, x0, s * depth);
  return new PIXI.Graphics().poly(pts).fill(0xffffff);
}

/** venetian blinds: n bars across the bleed, each scaled from its own centre line */
export function blindsMask(n = 12) {
  const c = new PIXI.Container();
  const bh = RH / n;
  const bars = [];
  for (let i = 0; i < n; i++) {
    const b = new PIXI.Graphics().rect(-PAD - 20, -bh / 2, RW + 40, bh + 1.5).fill(0xffffff);
    b.y = -PAD + bh * (i + 0.5);
    b.scale.y = 0;
    c.addChild(b);
    bars.push(b);
  }
  return { mask: c, bars };
}
