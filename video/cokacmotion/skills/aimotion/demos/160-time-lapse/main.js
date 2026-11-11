/*
 * 160 · 창밖의 하루 — 타임랩스 · 시간 압축 + 셔터 누적(빛 궤적·별 궤적·흐린 행인)
 *
 * A window camera watches an invented crossroads from 04:55 to 23:42 in ten seconds. The scene clock T(t) is the
 * closed-form integral of a speed curve that slows into the blue hour (clock.js). Every output frame integrates the
 * scene over its own shutter window [T − S, T] with a Hann weight: cars and people that only pass become nothing,
 * those that wait become ghosts (alpha = the share of the window they occupy), car and tram lights become trails whose
 * brightness is their dwell per pixel, clouds blur along the wind, and the sun's motion inside the window softens the
 * shadows. The stars are a different operation — a cumulative max stack since 18:50 — so their arcs keep growing.
 * A clock chip shows the shutter as a red wedge behind the racing hands.
 */
import { defineDemo, clamp, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { sceneTime, shutter, speed, sceneEV, ambientGain, emissiveGain, hannCDF, hann, hhmm, K, FPS } from './clock.js';
import { DEG, proj, projDir, sunAt, lightAt, hex, mix, mul, scale, add, css, shade, tone } from './cam.js';
import { SKY_W, SKY_H, SKY_S, bakeSkyDirs, paintSky, horizonAt, zenithAt, glowAt, makeStars, drawStarStack, T_STACK, makeClouds, drawClouds, makeMountains, drawMountains } from './sky.js';
import * as TW from './town.js';
import * as TR from './traffic.js';
import { buildProps, propItems } from './props.js';

const D = 10;
const KR = '"Pretendard Variable"';
const RED = hex('#ff3b30');               // the one accent: tail-light red (trails, the shutter wedge)
const L_WIN = Math.pow(2, -9.2), L_SHOP = Math.pow(2, -9.1), L_LAMP = Math.pow(2, -5.2), L_POOL = Math.pow(2, -10.0), L_SIG = Math.pow(2, -7.2);

let HEADLESS = false;
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}
const fillQ = (g, q) => { TW.quad(g, q); g.fill(); };

// ---------------------------------------------------------------- baked sprites
function bakeGlow(colHex, size = 128) {
  const { c, g } = mk(size, size);
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const [r, gg, b] = [1, 3, 5].map((i) => parseInt(colHex.slice(i, i + 2), 16));
  for (const [o, a] of [[0, 1], [0.12, 0.62], [0.3, 0.24], [0.6, 0.06], [1, 0]]) gr.addColorStop(o, `rgba(${r},${gg},${b},${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return c;
}
function bakeGrain() {
  const { c, g } = mk(256, 256);
  const img = g.createImageData(256, 256), r = (() => { let s = 160; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); })();
  for (let i = 0; i < 256 * 256; i++) { const v = Math.round(r() * 255); img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
  return c;
}
function bakeChipBase() {
  const { c, g } = mk(480, 220);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 6;
  g.fillStyle = 'rgba(16,20,34,0.62)';
  g.beginPath(); g.roundRect(30, 26, 412, 160, 34); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 1.5;
  g.beginPath(); g.roundRect(30.75, 26.75, 410.5, 158.5, 33.5); g.stroke();
  return c;
}

// ---------------------------------------------------------------- the clock chip
const CHIP = { x: 44, y: 64, cx: 44 + 96, cy: 64 + 80, R: 56 };
function drawChip(g, t, T, S) {
  const a = ease.outCubic(clamp((t - 0.25) / 0.5));
  if (a <= 0) return;
  g.globalAlpha = a;
  const dy = (1 - a) * -24;
  g.drawImage(CHIP.base, CHIP.x - 30, CHIP.y - 26 + dy);
  const cx = CHIP.cx, cy = CHIP.cy + dy, R = CHIP.R;
  // face and hour ticks
  g.fillStyle = 'rgba(255,255,255,0.07)';
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const an = (i / 12) * Math.PI * 2 - Math.PI / 2, r0 = i % 3 === 0 ? R - 13 : R - 8;
    g.lineWidth = i % 3 === 0 ? 3 : 2;
    g.beginPath(); g.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); g.lineTo(cx + Math.cos(an) * (R - 3), cy + Math.sin(an) * (R - 3)); g.stroke();
  }
  // the star stack: an outer arc the hour hand has swept since 18:45 (grows; never slides)
  const hourA = (x) => ((x % 12) / 12) * Math.PI * 2 - Math.PI / 2, minA = (x) => ((x % 1)) * Math.PI * 2 - Math.PI / 2;
  if (T > T_STACK) {
    g.strokeStyle = 'rgba(255,240,214,0.9)'; g.lineWidth = 4;
    g.beginPath(); g.arc(cx, cy, R + 9, hourA(T_STACK), hourA(T_STACK) + ((T - T_STACK) / 12) * Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,240,214,0.9)';
    g.beginPath(); g.arc(cx + Math.cos(hourA(T_STACK)) * (R + 9), cy + Math.sin(hourA(T_STACK)) * (R + 9), 3.2, 0, Math.PI * 2); g.fill();
  }
  // the shutter: the minute hand's sweep over the window [T − S, T], drawn with the Hann weight as its alpha
  const sweep = Math.min(S, 0.999) * Math.PI * 2, end = minA(T), start = end - sweep;
  const N = Math.max(6, Math.ceil(sweep / (4 * DEG)));
  for (let i = 0; i < N; i++) {
    const a0 = start + (sweep * i) / N, a1 = start + (sweep * (i + 1)) / N + 0.004;
    const u = 1 - (i + 0.5) / N;                       // u = 0 at "now", 1 at the oldest edge
    g.fillStyle = css(RED, 0.18 + 0.72 * hann(u));
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R - 4, a0, a1); g.closePath(); g.fill();
  }
  g.strokeStyle = css(RED, 0.95); g.lineWidth = 2;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(end) * (R - 4), cy + Math.sin(end) * (R - 4)); g.stroke();
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(start) * (R - 4), cy + Math.sin(start) * (R - 4)); g.stroke();
  // hour hand
  g.strokeStyle = '#ffffff'; g.lineWidth = 5.5;
  const ha = hourA(T);
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(ha) * (R - 22), cy + Math.sin(ha) * (R - 22)); g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fill();
  // readouts: the time (digits on a fixed pitch), the shutter in scene minutes, the stack length
  const tx = cx + R + 34;
  g.textBaseline = 'alphabetic'; g.textAlign = 'center'; g.fillStyle = '#ffffff';
  g.font = `800 50px ${KR}`;
  let px = tx;
  for (const ch of hhmm(T)) { const w = ch === ':' ? 15 : 29; g.fillText(ch, px + w / 2, cy - 6); px += w; }
  g.textAlign = 'left';
  g.font = `700 25px ${KR}`;
  g.fillStyle = css(RED); g.beginPath(); g.arc(tx + 7, cy + 26, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.88)';
  g.fillText(`셔터 ${Math.max(1, Math.round(S * 60))}분`, tx + 20, cy + 35);
  if (T > T_STACK) {
    const m = Math.round((T - T_STACK) * 60), txt = m >= 60 ? `별 누적 ${Math.floor(m / 60)}시간 ${m % 60}분` : `별 누적 ${m}분`;
    g.globalAlpha = a * clamp((T - T_STACK) * 12);
    g.strokeStyle = 'rgba(255,240,214,0.9)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(tx + 1, cy + 61); g.lineTo(tx + 13, cy + 61); g.stroke();
    g.fillStyle = 'rgba(255,240,214,0.88)';
    g.fillText(txt, tx + 20, cy + 70);
  }
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '160-time-lapse',
  title: '창밖의 하루',
  tech: '타임랩스 · 시간 압축 + 셔터 누적(빛 궤적·별 궤적·흐린 행인)',
  duration: D,
  fps: FPS,
  background: '#0b1026',

  async setup(api) {
    HEADLESS = api.headless;
    await fontReady(`800 50px ${KR}`, '0123456789:');
    await fontReady(`700 25px ${KR}`, '셔터분별누적시간0123456789 ');
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    this.skyDirs = bakeSkyDirs();
    this.sky = mk(SKY_W, SKY_H); this.skyImg = this.sky.g.createImageData(SKY_W, SKY_H);
    this.mask = mk(1080, 1920);
    this.stars = makeStars(); this.clouds = makeClouds(); this.mts = makeMountains();
    this.ground = TW.buildGround(); this.rails = TW.buildRails();
    this.blocks = TW.buildBlocks(); this.farTown = TW.buildFarTown();
    this.casters = TW.casters().concat(TW.blockCasters(this.blocks));
    this.glowW = bakeGlow('#ffd6a0'); this.glowL = bakeGlow('#fff0d8');
    this.grain = bakeGrain();
    CHIP.base = bakeChipBase();
    this.traffic = TR.build();
    this.props = buildProps();
    // warm every offscreen path once (first-composite raster differences)
    await this.frame(6.5);
  },

  frame(t) {
    const g = this.ctx;
    if (g.reset) g.reset(); else g.setTransform(1, 0, 0, 1, 0, 0);
    const T = sceneTime(t), S = shutter(t), Tm = T - S / 2;
    const sun = sunAt(Tm), ev = sceneEV(sun.h), gA = ambientGain(ev), Ge = emissiveGain(ev);
    const L = lightAt(Tm, ev, gA, T, S);
    const hor = horizonAt(sun.h);

    // 1 sky (per pixel at 1/6, smoothed up)
    paintSky(this.skyImg, this.skyDirs, sun.w, sun.h);
    this.sky.g.putImageData(this.skyImg, 0, 0);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(this.sky.c, 0, 0, SKY_W, SKY_H, 0, 0, SKY_W * SKY_S, SKY_H * SKY_S);
    // 2 stars: the cumulative stack
    drawStarStack(g, this.stars, T);
    // 3 clouds, 4 mountains
    drawClouds(g, this.clouds, T, S, L, hor);
    drawMountains(g, this.mts, L, T, hor, zenithAt(sun.h));

    // 5 ground plates
    const up = [0, 1, 0];
    const gr0 = this.ground[0];
    {
      const c = shade(gr0.alb, up, L);
      const grd = g.createLinearGradient(0, 700, 0, 1000);
      grd.addColorStop(0, css(mix(c, hor, 0.85))); grd.addColorStop(0.3, css(mix(c, hor, 0.45))); grd.addColorStop(1, css(c));
      g.fillStyle = grd; fillQ(g, gr0.scr);
    }
    for (let i = 1; i < this.ground.length; i++) { const p = this.ground[i]; g.fillStyle = css(shade(p.alb, up, L)); fillQ(g, p.scr); }

    // 6 shadows: the sun moves during the shutter, so the frame averages N shadow positions with Hann weights
    if (L.sv > 0.004) {
      const m = this.mask.g;
      m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1;
      m.clearRect(0, 0, 1080, 1920);
      // samples on a fixed grid of scene time (every 4 min), weighted by the Hann window: a sample keeps its place
      // from frame to frame and only its weight changes, so the penumbra steps never crawl
      const DT = 4 / 60, k0 = Math.ceil((T - S) / DT), k1 = Math.floor(T / DT);
      let wsum = 0; const smp = [];
      for (let k = k0; k <= k1; k++) { const w = hann((T - k * DT) / S); if (w > 1e-4) { smp.push([k * DT, w]); wsum += w; } }
      m.globalCompositeOperation = 'lighter'; m.fillStyle = '#000';
      for (const [tau, w] of smp) {
        const s = sunAt(tau);
        if (s.h <= 0.3) continue;
        const kk = clamp((s.h - 0.4) / 2.6), sv = kk * kk * (3 - 2 * kk);
        m.globalAlpha = (w / wsum) * sv;
        m.beginPath(); TW.shadowPath(m, this.casters, s.w); m.fill();
      }
      // tint = (sky light only) / (sky + sun): the multiply that turns a lit ground colour into its shadowed one
      const ka = 1, lit = add(scale(L.amb, ka), scale(L.sun, Math.max(0, L.w[1])));
      const tint = [0, 1, 2].map((c) => L.amb[c] / Math.max(1e-6, lit[c]));
      m.globalAlpha = 1; m.globalCompositeOperation = 'source-in';
      m.fillStyle = `rgb(${tint.map((v) => Math.round(Math.pow(clamp(v), 1 / 2.2) * 255)).join(',')})`;   // the multiply works on display values
      m.fillRect(0, 0, 1080, 1920);
      g.globalCompositeOperation = 'multiply';
      g.drawImage(this.mask.c, 0, 0);
      g.globalCompositeOperation = 'source-over';
    }
    for (const p of this.rails) { g.fillStyle = css(shade(p.alb, up, L)); fillQ(g, p.scr); }

    // 7 lamp pools on the ground
    const lampK = TW.lampLevel(T, S);
    if (lampK * Ge * L_POOL > 0.004) {
      g.globalCompositeOperation = 'lighter';
      for (const lp of TW.LAMPS) {
        const p = proj(lp.x, 0, lp.z), r = 6.5 * (700 / p[2]);
        g.setTransform(r / 64, 0, 0, (r / 64) * 0.55, p[0], p[1]);
        g.globalAlpha = clamp(lampK * Ge * L_POOL * 1.6);
        g.drawImage(this.glowL, -64, -64);
      }
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }

    // 8 far town
    this.drawFarTown(g, L, T, S, Ge, hor);
    // 9 blocks
    for (const b of this.blocks) this.drawBlock(g, b, L, T, S, Ge, hor);
    // 10 the street: ghosts and props sorted by depth, the light trails between the street and the plaza
    const tf = TR.collect(this.traffic, { T, S, L, Ge, mk });
    const items = tf.items.concat(propItems(this.props, L, Ge, lampK, this.glowL, L_SIG, L_LAMP, L_POOL));
    items.sort((a, b) => b.z - a.z);
    let i = 0;
    for (; i < items.length && items[i].z >= 16; i++) items[i].draw(g);
    tf.trails(g);
    for (; i < items.length; i++) items[i].draw(g);
    // 11 haze toward the low sun (in-scattering in front of everything): warm at golden hour and at dawn
    {
      const k = Math.exp(-(((sun.h - 2.5) / 6.5) ** 2)) * 0.42;
      if (k > 0.01) {
        let p = projDir(sun.w);
        if (!p) p = [sun.w[0] > 0 ? 2400 : -1300, 700];
        const cx = clamp(p[0], -1300, 2400), cy = clamp(p[1], 300, 900);
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 2100);
        const c = glowAt(sun.h);
        gr.addColorStop(0, css(scale(c, k))); gr.addColorStop(0.45, css(scale(c, k * 0.45))); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalCompositeOperation = 'screen'; g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920); g.globalCompositeOperation = 'source-over';
      }
    }
    // 12 sill, grain, vignette
    this.drawSill(g, L, Ge, T, S);
    g.globalAlpha = 0.045; g.globalCompositeOperation = 'overlay';
    const pat = g.createPattern(this.grain, 'repeat'); g.fillStyle = pat; g.fillRect(0, 0, 1080, 1920);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    const vg = g.createRadialGradient(540, 900, 500, 540, 900, 1250);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)');
    g.fillStyle = vg; g.fillRect(0, 0, 1080, 1920);
    // fade up from the dark
    const fin = clamp(t / 0.55);
    if (fin < 1) { g.fillStyle = `rgba(6,9,22,${(1 - ease.outCubic(fin)).toFixed(4)})`; g.fillRect(0, 0, 1080, 1920); }
    drawChip(g, t, T, S);
  },

  drawFarTown(g, L, T, S, Ge, hor) {
    for (const b of this.farTown) {
      const fog = 0.25 + 0.6 * (1 - Math.exp(-b.z0 / 900));
      g.fillStyle = css(mix(shade(b.alb, b.sideN, L), hor, fog)); fillQ(g, b.side);
      g.fillStyle = css(mix(shade(b.alb, [0, 0, -1], L), hor, fog)); fillQ(g, b.front);
      if (b.top) { g.fillStyle = css(mix(shade(b.roof, [0, 1, 0], L), hor, fog)); fillQ(g, b.top); }
    }
    if (Ge * L_WIN < 0.02) return;
    g.globalCompositeOperation = 'lighter';
    for (const b of this.farTown) for (const l of b.lights) {
      const v = TW.windowLevel({ on: l.on, off: l.off, morning: -1 }, T, S) * Ge * L_WIN * 0.8;
      if (v < 0.01) continue;
      g.fillStyle = css(l.warm, clamp(v));
      g.fillRect(l.x - 1.2, l.y - 1, 2.4, 2);
    }
    g.globalCompositeOperation = 'source-over';
  },

  drawBlock(g, b, L, T, S, Ge, hor) {
    const fog = clamp(1 - Math.exp(-(b.depth - 40) / 700)) * 0.8;
    for (const f of b.faces) { g.fillStyle = css(mix(shade(f.alb, f.n, L), hor, fog)); fillQ(g, f.scr); }
    const glows = [];
    for (const w of b.windows) {
      const base = mix(add(shade(GLASS_A, w.n, L), scale(hor, 0.12 * L.amb[2] * 3)), hor, fog);
      const lvl = TW.windowLevel(w, T, S), e = lvl * Ge * L_WIN * w.k;
      g.fillStyle = css(mix(shade(SILL_A, w.n, L), hor, fog)); fillQ(g, w.sill);
      g.fillStyle = css(add(scale(base, 1 - 0.7 * clamp(lvl)), scale(w.warm, e))); fillQ(g, w.q);
      if (e > 0.5) glows.push([w, e]);
    }
    for (const sh of b.shops) {
      const lvl = TW.windowLevel({ on: sh.open, off: sh.close, morning: -1 }, T, S), e = lvl * Ge * L_SHOP;
      const base = shade(GLASS_A, [0, 0, -1], L);
      g.fillStyle = css(add(scale(base, 1 - 0.6 * clamp(lvl)), scale(sh.warm, e))); fillQ(g, sh.q);
      g.fillStyle = css(mix(shade(sh.awnAlb, [0, 0.55, -0.83], L), hor, fog)); fillQ(g, sh.awn);
      if (e > 0.5) glows.push([{ q: sh.q }, e * 1.4]);
    }
    if (glows.length) {
      g.globalCompositeOperation = 'lighter';
      for (const [w, e] of glows) {
        const cx = (w.q[0][0] + w.q[2][0]) / 2, cy = (w.q[0][1] + w.q[2][1]) / 2, s = Math.abs(w.q[1][0] - w.q[0][0]) * 2.6 + 10;
        g.globalAlpha = clamp((e - 0.5) * 0.35);
        g.drawImage(this.glowW, cx - s / 2, cy - s / 2, s, s);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  },

  drawSill(g, L, Ge, T, S) {
    // the window sill the camera rests on (dark painted wood, so the captions stay legible), warmed by the room
    // lamp once it is switched on
    const room = TW.windowLevel({ on: 18.6, off: 99, morning: 5.75 }, T, S) * Math.min(1, Ge * Math.pow(2, -11));
    const wood = hex('#4a3f37');
    const topC = add(shade(wood, [0, 0.8, -0.6], L), scale(hex('#ffcf96'), room * 0.12));
    const front = add(scale(shade(wood, [0, 0, -1], L), 0.55), scale(hex('#ffcf96'), room * 0.03));
    const top = 1748;
    g.fillStyle = css(front);
    g.fillRect(0, top + 22, 1080, 1920 - top);
    g.fillStyle = css(topC);
    g.beginPath(); g.moveTo(-10, top + 24); g.lineTo(1090, top + 24); g.lineTo(1090, top + 4); g.quadraticCurveTo(540, top - 6, -10, top + 4); g.closePath(); g.fill();
    const sh = g.createLinearGradient(0, top + 22, 0, top + 120);
    sh.addColorStop(0, 'rgba(0,0,0,0.3)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(0, top + 22, 1080, 100);
  },
});

const GLASS_A = hex('#4f5f78'), SILL_A = hex('#e4ddd2');
