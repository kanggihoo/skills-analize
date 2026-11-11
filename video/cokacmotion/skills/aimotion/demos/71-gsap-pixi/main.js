/*
 * 71 · 물결 넘김 포스터 — PixiJS 8 posters choreographed by one paused GSAP timeline.
 *
 * Four editorial posters (Graphics + Text/SplitText + photos generated on canvases in setup) replace each other
 * through liquid transitions. Every moving value — type entrances, masks, filter strengths, the RGB split, the
 * flash, even the film-grain seed — is a tween on ONE paused master timeline; frame(t) seeks it with tl.time(t)
 * and renders once.
 *
 * Render path per frame:
 *   world ─► fx (filters: Displacement → Blur → ColorMatrix) ─► inner (posters, masks, displacement map sprite)
 *     rendered into an MSAA RenderTexture with a PAD bleed on every side
 *   stage ─► comp (NoiseFilter grain): the RenderTexture drawn three times, tinted pure R / G / B and added
 *     together (normal + add + add). Offsetting the R and B copies is the RGB split; at offset 0 they sum back
 *     to the exact image.
 *   stage ─► flash (cream Graphics, alpha)
 */
import { PIXI } from './pixi-global.js';   // first: makes window.PIXI exist before PixiPlugin evaluates
import { gsap } from '../node_modules/gsap/index.js';
import { PixiPlugin } from '../node_modules/gsap/PixiPlugin.js';
import { CustomEase } from '../node_modules/gsap/CustomEase.js';
import { defineDemo, rand } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { W, H, PAD, RW, RH, C, F, fullBleed } from './kit.js';
import { studioPhoto, marblePhoto, displacementMap } from './art.js';
import { T, ORB, poster1, poster2, poster3, poster4, waveMask, blindsMask } from './posters.js';

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin, CustomEase);

// a hard "liquid" in-out for the transition masks: slow to leave, fast through the middle, long settle
CustomEase.create('liquid', 'M0,0 C0.52,0 0.22,1 1,1');

// every glyph the posters set, per family (fontsource Hangul fonts are unicode-range subsets: ask for these)
const GLYPHS = {
  krDisplay: '물결흐름색넘김',
  kr: '표면이 흔들릴 때,색은 가장 멀리 번진다.흐름의 단면물은 길을 기억하지 않는다색은 경계에서 태어난다2027 여름호·물결 넘김특집색과 형태가 흐르는 네 장의 포스터, 하나의 물결',
  cond: 'WAVEFLOWNEWISSUESPRING/SUMMER2027Nº07',
  serif: 'the liquid issueChroma',
  mono: 'Nº07—SS/2701234·COLOURFIELDWAVETHELIQUIDISSUE9771234507002',
};

const IDENTITY = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
const isIdentity = (m) => { for (let i = 0; i < 20; i++) if (Math.abs(m[i] - IDENTITY[i]) > 1e-4) return false; return true; };

defineDemo({
  id: '71-gsap-pixi',
  title: '물결 넘김 포스터',
  tech: 'PixiJS 8 · DisplacementFilter · GSAP PixiPlugin',
  duration: T.D,
  background: '#17130f',

  async setup(api) {
    // fonts first: Pixi measures a font once and caches it, so it must never see the fallback
    await Promise.all([
      fontReady(`400 100px "${F.krDisplay}"`, GLYPHS.krDisplay),
      fontReady(`600 100px "${F.kr}"`, GLYPHS.kr),
      fontReady(`800 100px "${F.kr}"`, GLYPHS.kr),
      fontReady(`400 100px "${F.cond}"`, GLYPHS.cond),
      fontReady(`300 100px "${F.serif}"`, GLYPHS.serif),
      fontReady(`800 100px "${F.serif}"`, GLYPHS.serif),
      fontReady(`600 100px "${F.mono}"`, GLYPHS.mono),
    ]);

    // ---- Pixi, no ticker: nothing moves unless frame(t) says so
    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const app = new PIXI.Application();
    await app.init({
      canvas: el, width: W, height: H, resolution: 1, autoDensity: false,
      autoStart: false, sharedTicker: false, preserveDrawingBuffer: true, antialias: true,
      background: C.ink, preference: 'webgl', hello: false,
    });
    app.ticker.stop();
    const renderer = app.renderer;

    // ---- generated imagery (canvas → texture), once
    const tex = (c) => PIXI.Texture.from(c);
    const A = {
      rand,
      // P1 orb: a glossy ultramarine blob on a pink cyclorama, acid gel top-right
      photo1: tex(studioPhoto(720, 720, 11, {
        bg: [0xffb7c9, 0xff7f9f, 0xdb4f78],
        gels: [{ c: 0xf3ff74, x: 0.84, y: 0.16, r: 0.5, a: 0.6 }, { c: C.violet, x: 0.04, y: 0.6, r: 0.55, a: 0.35, mode: 'multiply' }],
        object: 'blob', ox: 0.5, oy: 0.53, or: 0.3,
        body: [0x8d9bff, C.ultra, 0x0b1150], rim: 0xffa3c4,
      })),
      // P2 arch: a chrome drop on deep violet, cyan and pink gels, acid rim light
      photo2: tex(studioPhoto(560, 880, 23, {
        bg: [0x1b1f9c, 0x3b2fd2, 0x110e66],
        gels: [{ c: 0x36e0ff, x: 0.15, y: 0.22, r: 0.55, a: 0.45 }, { c: 0xff6fd0, x: 0.92, y: 0.72, r: 0.5, a: 0.42 }],
        object: 'drop', ox: 0.5, oy: 0.57, or: 0.27, chrome: true,
        body: [0xeef0ff, 0x7e86cc, 0x14154a], rim: C.acid,
      })),
      // P3 frame: a matte acid sphere on hot orange, pink and lemon gels
      photo3: tex(studioPhoto(480, 480, 37, {
        bg: [0xff9c40, 0xff6b3b, 0xd9442b],
        gels: [{ c: C.pink, x: 0.18, y: 0.18, r: 0.55, a: 0.5 }, { c: 0xfff36a, x: 0.86, y: 0.3, r: 0.42, a: 0.4 }],
        object: 'sphere', ox: 0.5, oy: 0.5, or: 0.27,
        body: [0xf9ffbf, C.acid, 0x66760e], rim: 0xffffff,
      })),
      // P4 cover: liquid acrylic pour in the issue's palette
      photo4: tex(marblePhoto(1000, 860, 41, [C.cream, C.tomato, 0xff9cb9, C.ultra, C.cream, C.acid, 0xff6b3d, 0x1b1f8f])),
    };
    const mapTex = new PIXI.Texture({
      source: new PIXI.CanvasSource({ resource: displacementMap(512), resolution: 1, addressMode: 'repeat', scaleMode: 'linear' }),
    });

    // ---- the world (rendered into a bleed-sized render texture)
    const world = new PIXI.Container();
    const fx = new PIXI.Container();
    const inner = new PIXI.Container();
    inner.position.set(PAD, PAD);
    world.addChild(fx);
    fx.addChild(inner);
    const base = fullBleed(C.cream);   // what the tomato floods over at t = 0 (and the cover's colour: the loop rhymes)
    inner.addChild(base);
    const P = [poster1(A), poster2(A), poster3(A), poster4(A)];
    for (const p of P) inner.addChild(p.root);

    // transition masks (siblings of the posters, so a poster's own push/scale does not move its mask)
    const m1 = waveMask('up');            // intro: tomato rises from the bottom
    m1.y = H + PAD + 70;
    const m2 = new PIXI.Graphics().circle(0, 0, 1720).fill(0xffffff);   // T1: iris out of the orb
    m2.position.set(ORB.x, ORB.y);
    m2.scale.set(0);
    const m3 = waveMask('down');          // T2: yellow pours down from the top
    m3.y = -PAD - 70;
    const blinds = blindsMask(12);        // T3: venetian blinds from the centre
    inner.addChild(m1, m2, m3, blinds.mask);
    P[0].root.mask = m1; P[1].root.mask = m2; P[2].root.mask = m3; P[3].root.mask = blinds.mask;

    // displacement map sprite: lives in the scene (its transform positions the map), never drawn
    const mapSprite = new PIXI.Sprite(mapTex);
    mapSprite.scale.set(2.6);
    inner.addChild(mapSprite);
    const disp = new PIXI.DisplacementFilter({ sprite: mapSprite, scale: 0, antialias: 'inherit' });
    const blur = new PIXI.BlurFilter({ strengthX: 0, strengthY: 0, quality: 4, kernelSize: 9, antialias: 'inherit' });
    const cmf = new PIXI.ColorMatrixFilter({ antialias: 'inherit' });
    fx.filters = [disp, blur, cmf];       // PixiPlugin finds this ColorMatrixFilter (instanceof) instead of adding one

    const rt = PIXI.RenderTexture.create({ width: RW, height: RH, resolution: 1, antialias: true });

    // ---- composite: three channel copies of the render texture (the RGB split) + grain + flash
    const comp = new PIXI.Container();
    const channel = (tint, blendMode) => {
      const s = new PIXI.Sprite(rt);
      s.position.set(-PAD, -PAD);
      s.tint = tint;
      s.blendMode = blendMode;
      comp.addChild(s);
      return s;
    };
    const sR = channel(0xff0000, 'normal'), sG = channel(0x00ff00, 'add'), sB = channel(0x0000ff, 'add');
    void sG;
    const noise = new PIXI.NoiseFilter({ noise: 0.05, seed: 0.11 });
    comp.filters = [noise];
    const flash = new PIXI.Graphics().rect(0, 0, W, H).fill(C.cream);
    flash.alpha = 0;
    app.stage.addChild(comp, flash);

    // ---- the master timeline
    const tl = gsap.timeline({ paused: true, defaults: { lazy: false, overwrite: false } });
    const split = (at, peak, end, dx, dy, easeIn = 'power2.in', easeOut = 'power3.out') => {
      tl.to(sR, { pixi: { x: -PAD + dx, y: -PAD + dy }, duration: peak - at, ease: easeIn }, at);
      tl.to(sB, { pixi: { x: -PAD - dx, y: -PAD - dy }, duration: peak - at, ease: easeIn }, at);
      tl.to(sR, { pixi: { x: -PAD, y: -PAD }, duration: end - peak, ease: easeOut }, peak);
      tl.to(sB, { pixi: { x: -PAD, y: -PAD }, duration: end - peak, ease: easeOut }, peak);
    };
    const wobble = (at, peak, end, s) => {
      tl.to(disp.scale, { x: s, y: s, duration: peak - at, ease: 'sine.in' }, at);
      tl.to(disp.scale, { x: 0, y: 0, duration: end - peak, ease: 'sine.out' }, peak);
    };

    // the liquid field drifts for the whole piece; the grain re-rolls at 24 steps per second
    tl.to(mapSprite, { pixi: { x: -1400, y: 2100 }, duration: T.D, ease: 'none' }, 0);
    tl.to(noise, { seed: 0.97, duration: T.D, ease: `steps(${Math.round(T.D * 24)})` }, 0);

    // intro: tomato floods up over cream
    tl.to(m1, { pixi: { y: -PAD - 150 }, duration: T.intro[1] - T.intro[0], ease: 'liquid' }, T.intro[0]);
    wobble(0, 0.3, 0.9, 150);
    split(0.02, 0.3, 0.8, 7, 0);

    // T1: the photo orb opens into the ultramarine poster
    {
      const [a, b] = T.t1, mid = (a + b) / 2 - 0.02;
      tl.to(m2, { pixi: { scale: 1 }, duration: b - a, ease: 'liquid' }, a);
      tl.to(P[0].root, { pixi: { scale: 1.1 }, duration: b - a, ease: 'power2.in' }, a);
      P[1].root.scale.set(1.14);
      tl.to(P[1].root, { pixi: { scale: 1 }, duration: 1.15, ease: 'expo.out' }, a + 0.2);
      wobble(a, mid, b + 0.15, 230);
      split(a + 0.05, mid, b + 0.1, 18, 0);
      tl.to(fx, { pixi: { brightness: 1.22 }, duration: mid - (a + 0.25), ease: 'power2.in' }, a + 0.25);
      tl.to(fx, { pixi: { brightness: 1 }, duration: b - mid, ease: 'power2.out' }, mid);
    }
    // T2: acid yellow pours down; the falling front streaks (vertical blur) and the colour saturates
    {
      const [a, b] = T.t2, mid = a + 0.4;
      tl.to(m3, { pixi: { y: H + PAD + 90 }, duration: b - a, ease: 'liquid' }, a);
      tl.to(P[1].root, { pixi: { y: H / 2 + 240 }, duration: b - a, ease: 'power2.in' }, a);
      P[2].root.y = H / 2 - 300;
      tl.to(P[2].root, { pixi: { y: H / 2 }, duration: 1.1, ease: 'expo.out' }, a + 0.25);
      wobble(a, mid, b + 0.15, 300);
      tl.to(blur, { strengthY: 28, duration: mid - (a + 0.1), ease: 'power2.in' }, a + 0.1);
      tl.to(blur, { strengthY: 0, duration: b - 0.05 - mid, ease: 'power2.out' }, mid);
      split(a + 0.05, mid, b, 0, 14);
      tl.to(fx, { pixi: { saturation: 1.7, contrast: 1.12 }, duration: mid - (a + 0.2), ease: 'power2.in' }, a + 0.2);
      tl.to(fx, { pixi: { saturation: 1, contrast: 1 }, duration: b - mid, ease: 'power2.out' }, mid);
    }
    // T3 (the peak): blinds from the centre, the strongest liquid push, the widest split, an over-exposed flash
    {
      const [a, b] = T.t3, mid = a + 0.45;
      tl.to(blinds.bars, { pixi: { scaleY: 1.03 }, duration: 0.55, ease: 'power3.inOut', stagger: { each: 0.035, from: 'center' } }, a + 0.03);
      tl.to(P[2].root, { pixi: { scale: 1.12 }, duration: b - 0.1 - a, ease: 'power2.in' }, a);
      P[3].root.scale.set(1.1);
      tl.to(P[3].root, { pixi: { scale: 1 }, duration: 1.2, ease: 'expo.out' }, a + 0.35);
      tl.to(disp.scale, { x: 440, y: 440, duration: mid - a, ease: 'power2.in' }, a);
      tl.to(disp.scale, { x: 0, y: 0, duration: b + 0.1 - mid, ease: 'power3.out' }, mid);
      split(a + 0.05, mid, b, 44, 6);
      tl.to(fx, { pixi: { brightness: 1.65 }, duration: 0.15, ease: 'power2.in' }, mid - 0.15);
      tl.to(fx, { pixi: { brightness: 1 }, duration: b - mid, ease: 'power2.out' }, mid);
      tl.to(flash, { pixi: { alpha: 0.42 }, duration: 0.08, ease: 'power1.in' }, mid - 0.08);
      tl.to(flash, { pixi: { alpha: 0 }, duration: 0.35, ease: 'power2.out' }, mid);
    }
    for (const p of P) p.enter(tl);

    // Prime: run the whole timeline forward once (every tween initialises in chronological order and records
    // its start values) and back to 0. From here on tl.time(t) is a pure function of t, from either direction.
    tl.progress(1, true).progress(0, true);

    // which posters can be seen at t (the others are fully covered or not yet revealed): skip drawing them
    const SHOW = [
      [-1, T.t1[1] + 0.05],
      [T.t1[0] - 0.01, T.t2[1] + 0.05],
      [T.t2[0] - 0.01, T.t3[1] + 0.05],
      [T.t3[0] - 0.01, T.D + 1],
    ];
    Object.assign(this, { app, renderer, tl, world, rt, base, P, SHOW, disp, blur, cmf, flash });
  },

  frame(t) {
    const { app, renderer, tl, world, rt, base, P, SHOW, disp, blur, cmf, flash } = this;
    tl.time(t, true);
    base.visible = t < T.intro[1] + 0.05;
    P.forEach((p, i) => { p.root.visible = t >= SHOW[i][0] && t < SHOW[i][1]; });
    // a filter at rest costs a full-screen pass: switch it off when it would do nothing
    disp.enabled = Math.abs(disp.scale.x) > 0.25;
    blur.enabled = blur.strengthY > 0.05;
    cmf.enabled = !isIdentity(cmf.matrix);
    flash.visible = flash.alpha > 0.002;
    renderer.render({ container: world, target: rt, clear: true, clearColor: [0, 0, 0, 1] });
    app.render();
  },
});
