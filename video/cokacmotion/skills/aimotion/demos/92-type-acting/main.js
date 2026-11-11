/*
 * 92 · 고백하던 날 — a confession in eight short lines, written on a letter in afternoon window light.
 * Each line has one key word that performs its own meaning: 떨린다 trembles, 숨 breathes out a wave through the poem,
 * 뜨겁다 shimmers with heat, 쿵 falls from the top of the page and squashes on its line, 무너진다 cracks and collapses
 * into rubble on the bottom rule, 녹는다 sags and drips, 기분 탓 is struck through, 반짝 glints — and the light rises
 * through the whole page.
 *
 *   fx.js     the channel system: units with rest places, neutral channels every frame, effects that add into
 *             them inside time windows, one write per unit (text / row-shifted raster / bent outline / clipped shard)
 *   main.js   layout (syllable units, Pretendard Black outlines for 녹는다, Voronoi shards for 무너진다), the
 *             timeline of effects, the page (desk, paper, window light with leaf shadows, foreground plant), overlays
 */
import { defineDemo, rand, ease, clamp, lerp } from '../_lib/stage.js';
import { fontReady, loadOutlineFont, outlineContours } from '../_lib/type.js';
import {
  createFX, makeWriter, drawGroups, hash, noise, wobble, spring, drift, bounce, landTime, hump, smooth,
  voronoi, centroid, resampleContour, TAU, DEG,
} from './fx.js';

const W = 1080, H = 1920, D = 10;
const INK = [31, 26, 23], INK2 = [96, 84, 74], ACC = [214, 50, 28], HI = [255, 250, 240];
const SANS = 'Pretendard Variable', SERIF = 'Gowun Batang';
const PAPER = [34, 58, 1046, 1672];          // the letter on the desk (x0, y0, x1, y1)
const FLOOR = 1606;                           // the bottom rule: everything that falls comes to rest on it
const X0 = 104;                               // left margin of the poem
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const frac = (v) => v - Math.floor(v);

// ---------------------------------------------------------------- timeline (s)
const T = {
  kicker: 0.10,
  l1: 0.26, l1a: 0.42, tremble: 0.66,
  l2: 0.98, l2a: 1.14, l2b: 1.26, breathIn: 1.30, breathOut: 1.86,
  l3: 2.02, l3a: 2.16, heat: 2.40,
  l4: 2.70, drop: 2.92,                       // T.impact = drop + fall time (set in setup)
  l5: 3.66, l5a: 3.86, crack: 4.58, collapse: 4.80,
  l6: 5.32, l6a: 5.50, melt: 5.86, meltEnd: 7.20,
  l7: 6.16, l7a: 6.32, l7b: 6.48, strike: 6.96,
  l8: 7.28, l8a: 7.48, glint: 7.90, sweep: 8.30,
  calm: 8.95,
};
const WAVE_V = 1400;     // px/s, the breath wave front
const STRIKE_DUR = 0.42;

const KICKER = '시월의 마지막 날';
// [text, entrance time, role?, size?] — parts without a role are the quiet serif words
const LINES = [
  { base: 330, parts: [['손끝이', T.l1], ['떨린다', T.l1a, 'tremble']] },
  { base: 472, parts: [['크게', T.l2], ['숨', T.l2a, 'breath'], ['한 번', T.l2b]] },
  { base: 640, parts: [['귀까지', T.l3], ['뜨겁다', T.l3a, 'heat']] },
  { base: 812, parts: [['심장이', T.l4], ['쿵', T.drop, 'thud', 168]] },
  { base: 975, parts: [['준비한 말이', T.l5], ['무너진다', T.l5a, 'crumble']] },
  { base: 1120, parts: [['네 웃음에', T.l6], ['녹는다', T.l6a, 'melt']] },
  { base: 1318, parts: [['그냥', T.l7], ['기분 탓', T.l7a, 'strike'], ['이겠지', T.l7b]] },
  { base: 1524, parts: [['네 눈도', T.l8], ['반짝', T.l8a, 'glint', 206]] },
];
const STY = {
  ctx: { family: SERIF, size: 58, weight: 700, color: INK2, track: 0 },
  act: { family: SANS, size: 124, weight: 900, color: INK, track: -0.02 },
  kick: { family: SERIF, size: 34, weight: 700, color: INK2, track: 0.12 },
};

// ---------------------------------------------------------------- layout
function layoutRun(m, str, x, base, st, size = st.size) {
  m.font = `${st.weight} ${size}px "${st.family}"`;
  const units = [];
  const space = m.measureText(' ').width;
  for (const ch of Array.from(str)) {
    if (ch === ' ') { x += space + st.track * size; continue; }
    const mm = m.measureText(ch);
    const top = base - mm.actualBoundingBoxAscent, bot = base + mm.actualBoundingBoxDescent, w = mm.width;
    const u = { kind: 'text', ch, family: st.family, size, weight: st.weight, color: st.color, base,
      bx: x, by: top, bw: w, bh: bot - top, px: x + w / 2, py: (top + bot) / 2 };
    u.ox = -w / 2; u.oy = base - u.py;
    units.push(u);
    x += w + st.track * size;
  }
  return { units, x };
}
/** glyph outlines (Pretendard Black, opentype.js) as units: evenly resampled points + ink-outward normals */
function layoutOutline(font, str, x, base, size) {
  const gl = outlineContours(font, str, x, base, size, { tol: 0.3 }).filter((g) => g.contours.length);
  // which side is "away from ink" for this font: outward normals of the biggest contour point away from its centre
  let best = gl[0].contours[0];
  for (const C of gl[0].contours) if (Math.abs(C.area) > Math.abs(best.area)) best = C;
  const probe = resampleContour(best.pts, 3, 1), n = probe.pts.length / 2;
  let mx = 0, my = 0, s = 0;
  for (let i = 0; i < n; i++) { mx += probe.pts[2 * i] / n; my += probe.pts[2 * i + 1] / n; }
  for (let i = 0; i < n; i++) s += probe.nrm[2 * i] * (probe.pts[2 * i] - mx) + probe.nrm[2 * i + 1] * (probe.pts[2 * i + 1] - my);
  const flip = s < 0 ? -1 : 1;
  const units = gl.map((g) => {
    const contours = g.contours.map((C) => resampleContour(C.pts, 3, flip));
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const C of contours) for (let i = 0; i < C.pts.length; i += 2) {
      x0 = Math.min(x0, C.pts[i]); x1 = Math.max(x1, C.pts[i]); y0 = Math.min(y0, C.pts[i + 1]); y1 = Math.max(y1, C.pts[i + 1]);
    }
    return { kind: 'outline', ch: g.ch, contours, color: INK, base, bx: x0, by: y0, bw: x1 - x0, bh: y1 - y0, px: (x0 + x1) / 2, py: (y0 + y1) / 2 };
  });
  const last = gl[gl.length - 1];
  return { units, x: last.x0 + last.advance };
}

// ---------------------------------------------------------------- baked textures
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function bakeDesk() {
  const c = mk(W, H), g = c.getContext('2d'), R = rand(9201);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#2e2520'); gr.addColorStop(0.6, '#261f1b'); gr.addColorStop(1, '#1a1512');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // wood grain: long, slightly wavy strokes
  for (let i = 0; i < 160; i++) {
    const y = R() * H, a = 0.025 + R() * 0.05, light = R() < 0.5, amp = 2 + R() * 6, f = 0.002 + R() * 0.004, ph = R() * TAU;
    g.strokeStyle = light ? `rgba(120,96,78,${a})` : `rgba(8,5,3,${a * 1.4})`;
    g.lineWidth = 0.8 + R() * 2.4;
    g.beginPath();
    for (let x = -10; x <= W + 10; x += 20) { const yy = y + amp * Math.sin(x * f + ph) + 3 * Math.sin(x * f * 3.7 + ph * 2); if (x < 0) g.moveTo(x, yy); else g.lineTo(x, yy); }
    g.stroke();
  }
  return c;
}

function bakePaper() {
  const c = mk(W, H), g = c.getContext('2d'), R = rand(9202);
  const [x0, y0, x1, y1] = PAPER, pw = x1 - x0, ph = y1 - y0;
  // the sheet and its shadow on the desk (light from the upper right → shadow falls lower left)
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 46; g.shadowOffsetX = -10; g.shadowOffsetY = 20;
  g.fillStyle = '#f6efe2'; g.fillRect(x0, y0, pw, ph);
  g.restore();
  g.save();
  g.beginPath(); g.rect(x0, y0, pw, ph); g.clip();
  // mottling
  for (let i = 0; i < 40; i++) {
    const x = x0 + R() * pw, y = y0 + R() * ph, r = 80 + R() * 260, dark = R() < 0.55;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, dark ? 'rgba(150,120,90,0.05)' : 'rgba(255,255,250,0.06)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // fibres
  g.lineCap = 'round';
  for (let i = 0; i < 9000; i++) {
    const x = x0 + R() * pw, y = y0 + R() * ph, a = R() * TAU, l = 2 + R() * 9;
    g.strokeStyle = R() < 0.6 ? `rgba(120,98,76,${0.03 + R() * 0.05})` : `rgba(255,255,255,${0.05 + R() * 0.08})`;
    g.lineWidth = 0.6 + R() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // ruled lines under every line of the poem and the bottom rule (the floor)
  g.fillStyle = 'rgba(70,55,42,0.13)';
  for (const L of LINES) g.fillRect(X0 - 24, L.base + 16, 1000 - X0 + 24 - 30, 1.6);
  g.fillStyle = 'rgba(70,55,42,0.22)';
  g.fillRect(X0 - 24, FLOOR, 1000 - X0 + 24 - 30, 2);
  // edges a touch darker, like a sheet that is not perfectly flat
  const edge = (gx0, gy0, gx1, gy1, rx, ry, rw, rh) => {
    const lg = g.createLinearGradient(gx0, gy0, gx1, gy1);
    lg.addColorStop(0, 'rgba(110,86,60,0.16)'); lg.addColorStop(1, 'rgba(110,86,60,0)');
    g.fillStyle = lg; g.fillRect(rx, ry, rw, rh);
  };
  edge(x0, 0, x0 + 50, 0, x0, y0, 50, ph); edge(x1, 0, x1 - 50, 0, x1 - 50, y0, 50, ph);
  edge(0, y0, 0, y0 + 40, x0, y0, pw, 40); edge(0, y1, 0, y1 - 60, x0, y1 - 60, pw, 60);
  g.restore();
  return c;
}

// window light at half resolution: a slanted pane of sun with two mullion shadows, soft-edged
const LIGHT = { cx: 690, cy: 860, hw: 470, hh: 900, ang: -15 * DEG };
function bakeWindow() {
  const c = mk(540, 960), g = c.getContext('2d');
  g.scale(0.5, 0.5);
  g.translate(LIGHT.cx, LIGHT.cy); g.rotate(LIGHT.ang);
  g.fillStyle = '#fff';
  g.fillRect(-LIGHT.hw, -LIGHT.hh, 2 * LIGHT.hw, 2 * LIGHT.hh);
  g.globalCompositeOperation = 'destination-out';
  g.fillRect(-150 - 15, -LIGHT.hh, 30, 2 * LIGHT.hh);
  g.fillRect(-LIGHT.hw, -260 - 15, 2 * LIGHT.hw, 30);
  const b = mk(540, 960), bg = b.getContext('2d');
  bg.filter = 'blur(7px)';
  bg.drawImage(c, 0, 0);
  return b;
}
function leafPath(g, x, y, len, wid, a) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.beginPath(); g.moveTo(0, 0);
  g.quadraticCurveTo(len * 0.45, -wid, len, 0);
  g.quadraticCurveTo(len * 0.45, wid, 0, 0);
  g.fill();
  g.restore();
}
function bakeLeaves() {
  const c = mk(540, 960), g = c.getContext('2d'), R = rand(9203);
  g.scale(0.5, 0.5);
  g.fillStyle = '#000';
  // three hanging sprays from the upper right, plus stray leaves
  const sprays = [[980, 150, 2.3], [880, 520, 2.0], [1040, 900, 2.5]];
  for (const [sx, sy, dir] of sprays) {
    let x = sx, y = sy, a = dir;
    g.lineWidth = 7; g.strokeStyle = '#000';
    for (let k = 0; k < 9; k++) {
      const nx = x + Math.cos(a) * 60, ny = y + Math.sin(a) * 60;
      g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke();
      x = nx; y = ny; a += (R() - 0.5) * 0.4;
      leafPath(g, x, y, 70 + R() * 50, 18 + R() * 10, a + (k % 2 ? 0.9 : -0.9) + (R() - 0.5) * 0.4);
    }
  }
  for (let i = 0; i < 16; i++) leafPath(g, 650 + R() * 500, 80 + R() * 1300, 50 + R() * 50, 14 + R() * 8, R() * TAU);
  const b = mk(540, 960), bg = b.getContext('2d');
  bg.filter = 'blur(2.5px)';
  bg.drawImage(c, 0, 0);
  return b;
}
// the out-of-focus plant right in front of the lens, top right corner
function bakePlant() {
  const c = mk(720, 760), g = c.getContext('2d'), R = rand(9204);
  g.translate(720, 0);
  const leaves = [[-40, 40, 2.5, 330, 92], [-120, 10, 2.15, 300, 80], [-20, 160, 2.9, 260, 70], [-230, 30, 1.95, 250, 66], [-90, 250, 2.6, 220, 60]];
  for (const [x, y, a, len, wid] of leaves) {
    g.fillStyle = `rgb(${24 + R() * 8},${28 + R() * 8},${20 + R() * 6})`;
    leafPath(g, x, y, len, wid, a);
  }
  const b = mk(720, 760), bg = b.getContext('2d');
  bg.filter = 'blur(13px)';
  bg.drawImage(c, 0, 0);
  return b;
}
function bakeGrain() {
  const c = mk(256, 256), g = c.getContext('2d'), R = rand(9205);
  const im = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = 128 + (R() - 0.5) * 120; im.data[4 * i] = im.data[4 * i + 1] = im.data[4 * i + 2] = v; im.data[4 * i + 3] = 255; }
  g.putImageData(im, 0, 0);
  return c;
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '92-type-acting',
  title: '고백하던 날',
  tech: '뜻을 연기하는 글자 · 채널 기반 글자 효과',
  duration: D,
  background: '#1d1714',

  async setup(api) {
    const attrs = api.headless ? { willReadFrequently: true } : undefined;
    const { ctx } = api.canvas({ z: 1, attrs });
    const textCv = mk(W, H), tctx = textCv.getContext('2d', attrs);
    const lightCv = mk(540, 960), lctx = lightCv.getContext('2d', attrs);
    const mapCv = mk(540, 960), mctx = mapCv.getContext('2d', attrs);

    // fonts first: every syllable the page will show
    const words = (f) => LINES.flatMap((L) => L.parts.filter(f).map((p) => p[0])).join('');
    await fontReady(`900 124px "${SANS}"`, words((p) => p[2]));
    await fontReady(`700 58px "${SERIF}"`, words((p) => !p[2]) + KICKER);
    const outlineFont = await loadOutlineFont('Pretendard-Black');

    // ------------------------------------------------ layout → groups
    const FX = createFX();
    const { fx } = FX;
    const R = {};          // acting groups by role
    const quiet = [];      // serif groups
    const kick = layoutRun(tctx, KICKER, X0 + 46, 192, STY.kick);
    const GK = FX.group('kicker', kick.units);
    for (const L of LINES) {
      let x = X0;
      L.parts.forEach(([text, at, role, size], pi) => {
        if (pi) x += role || !L.parts[pi - 1][2] ? 26 : 22;
        let run;
        if (role === 'melt') run = layoutOutline(outlineFont, text, x, L.base, size || STY.act.size);
        else run = layoutRun(tctx, text, x, L.base, role ? STY.act : STY.ctx, size);
        x = run.x;
        const G = FX.group(role || `q${quiet.length}`, run.units, { ghosts: role === 'tremble' ? { n: 2, shutter: 0.03, alpha: 0.5, thr: 0.6 } : role === 'thud' ? { n: 4, shutter: 0.05, alpha: 0.55, thr: 2 } : null });
        G.at = at; G.base = L.base;
        if (role) R[role] = G; else quiet.push(G);
      });
    }
    const BR = R.breath, HT = R.heat, TH = R.thud, CR = R.crumble, ML = R.melt, ST = R.strike, GL = R.glint, TR = R.tremble;
    const thud = TH.units[0];
    for (const u of GL.units) u.color = ACC;

    // ------------------------------------------------ entrances
    function rise(G, at, { dy = 44, st = 0.055, dur = 0.75, blur = 8 } = {}) {
      fx(G, { from: at, to: at + dur + st * G.units.length, fill: 'backwards' }, (u, s, c) => {
        const lt = s.lt - u.i * st, k = clamp(lt / dur), e = ease.outExpo(k);
        c.y += dy * (1 - e); c.o *= smooth(lt / (dur * 0.4)); c.blur += blur * (1 - e) * (1 - e);
      });
    }
    function pop(G, at, { st = 0.08, freq = 1.4, decay = 5.5, lift = 36, dur = 1.5, rot = 9 } = {}) {
      fx(G, { from: at, to: at + dur + st * G.units.length, fill: 'backwards' }, (u, s, c) => {
        const lt = s.lt - u.i * st, k = spring(lt, freq, decay);
        c.sx *= Math.max(0, k); c.sy *= Math.max(0, k); c.y += lift * (1 - clamp(k)); c.o *= clamp(lt * 14);
        c.r += rot * (1 - k) * (u.r(3) - 0.5) * 2;
      });
    }
    rise(GK, T.kicker, { dy: 24, st: 0.03, blur: 4 });
    for (const G of quiet) rise(G, G.at);
    rise(TR, T.l1a, { dy: 30, blur: 6 });
    pop(BR, T.l2a, { lift: 20, rot: 0 });
    rise(HT, T.l3a, { dy: 40 });
    rise(ML, T.l6a, { dy: 40 });
    rise(ST, T.l7a, { dy: 40 });
    pop(GL, T.l8a);

    // ------------------------------------------------ 떨린다 — tremble (calmed by the breath wave, scared again by 쿵)
    const BP = [BR.cx, BR.cy];
    const FALL_H = thud.py + 170, G_FALL = 8200, T_FALL = landTime(FALL_H, G_FALL);
    T.impact = T.drop + T_FALL;
    const calmAt = (u) => T.breathOut + 0.1 + Math.hypot(u.px - BP[0], u.py - BP[1]) / WAVE_V;
    fx(TR, { from: T.tremble - 0.05, to: D }, (u, s, c) => {
      const t = s.t;
      const a = (smooth((t - T.tremble) / 0.3) * (1 - 0.8 * smooth((t - calmAt(u)) / 0.45)) + 1.1 * hump(t - T.impact + 0.02, 0.9))
        * (1 - smooth((t - T.calm) / 0.6));
      if (a < 0.004) return;
      const q = t * 24, q0 = Math.floor(q), f = smooth(q - q0), sd = u.G.seed + u.i;
      const j = (salt) => (lerp(hash(sd, q0, salt), hash(sd, q0 + 1, salt), f) - 0.5) * 2;
      c.x += 5.5 * a * j(1); c.y += 4 * a * j(2); c.r += 3.5 * a * j(3); c.kx += 2.5 * a * j(4);
    });

    // ------------------------------------------------ 숨 — inhale (swell, lighter), exhale (spring back) + a wave through the page
    fx(BR, { from: T.breathIn, to: D }, (u, s, c) => {
      const t = s.t;
      const inh = smooth((t - T.breathIn) / (T.breathOut - T.breathIn));
      const sw = inh * (1 - spring(t - T.breathOut, 1.25, 5));
      const idle = 0.03 * Math.sin(TAU * 0.45 * (t - T.breathOut)) * smooth((t - T.breathOut - 0.8) / 0.8);
      c.sx *= 1 + 0.36 * sw + idle; c.sy *= 1 + 0.36 * sw + idle;
      c.w += -380 * clamp(sw); c.y += -12 * sw;
    });
    fx('page', { from: T.breathOut, to: T.breathOut + 1.9 }, (u, s, c) => {
      if (u.G === BR) return;
      const d = Math.hypot(u.px - BP[0], u.py - BP[1]), f = Math.exp(-d / 800);
      const tau = s.lt - 0.1 - d / WAVE_V, h = hump(tau, 0.55);
      c.y -= 17 * f * h;
      c.r += 3.5 * f * (tau > 0 && tau < 0.55 ? Math.sin((TAU * tau) / 0.55) : 0);
      c.sx *= 1 + 0.04 * f * h; c.sy *= 1 + 0.04 * f * h;
    });

    // ------------------------------------------------ 뜨겁다 — heat: tint to the accent, rows shimmer, a slow swell
    fx(HT, { from: T.heat, to: D }, (u, s, c) => {
      const k = smooth((s.t - T.heat) / 0.5);
      c.tint += k;
      c.ripple += 7 * k * (1 - 0.45 * smooth((s.t - 4.2) / 1.6));
      c.sy *= 1 + 0.03 * k * Math.sin(s.t * 5.3 + u.i * 1.3);
      c.y += -2.5 * k * Math.sin(s.t * 6.1 + u.i * 1.7);
    });

    // ------------------------------------------------ 쿵 — falls from above the page, squashes on its line, then beats
    const beat = (t) => {
      let b = 0;
      for (let n = 0; n < 10; n++) {
        const tb = T.impact + 0.8 + n * 0.9;
        if (t < tb) break;
        b += 0.1 * Math.pow(0.72, n) * (hump(t - tb, 0.16) + 0.55 * hump(t - tb - 0.2, 0.16));
      }
      return b;
    };
    fx(TH, { from: T.drop, to: D, fill: 'backwards' }, (u, s, c) => {
      if (s.t < T.drop) { c.o = 0; return; }
      const lt = s.lt;
      c.y -= bounce(lt, FALL_H, G_FALL, 0.22, 2);
      if (lt < T_FALL) { const v = clamp((G_FALL * lt) / 4200); c.sy *= 1 + 0.3 * v; c.sx *= 1 - 0.12 * v; }
      else { const sq = 0.42 * wobble(lt - T_FALL, 3.0, 7); c.sy *= 1 - sq; c.sx *= 1 + 0.8 * sq; c.y += (sq * u.bh) / 2; }
      const b = beat(s.t);
      c.sx *= 1 + b; c.sy *= 1 + b; c.y -= (b * u.bh) / 2;
      c.tint += 0.9 * hump(lt - T_FALL, 0.5);
    });
    const IMP = [thud.px, thud.base];
    fx('page', { from: T.impact, to: T.impact + 1.6 }, (u, s, c) => {
      if (u.G === TH) return;
      const dx = u.px - IMP[0], d = Math.hypot(dx, u.py - IMP[1]), f = Math.exp(-d / 520);
      const tau = s.lt - d / 2200;
      c.y -= 20 * f * wobble(tau, 3.4, 6.5);
      c.r += 4 * f * Math.sign(dx || 1) * wobble(tau - 0.02, 3.4, 6.5);
    });

    // ------------------------------------------------ 무너진다 — bricks set in place, strain, crack into shards, collapse
    fx(CR, { from: T.l5a, to: T.l5a + 1.3, fill: 'backwards' }, (u, s, c) => {
      const lt = s.lt - u.i * 0.075;
      if (lt <= 0) { c.o = 0; return; }
      const h = 110, g = 5600, t0 = landTime(h, g);
      c.y -= bounce(lt, h, g, 0.28, 2); c.o *= clamp(lt * 14);
      if (lt > t0) { const sq = 0.22 * wobble(lt - t0, 3.6, 8); c.sy *= 1 - sq; c.sx *= 1 + 0.7 * sq; c.y += (sq * u.bh) / 2; }
    });
    fx(CR, { from: T.crack - 0.4, to: T.crack }, (u, s, c) => {   // the strain before it gives way
      const q = Math.floor(s.t * 30), k = smooth(s.p);
      c.x += (hash(u.G.seed + u.i, q, 5) - 0.5) * 2.5 * k; c.r += (hash(u.G.seed + u.i, q, 6) - 0.5) * 1.6 * k;
    });
    fx(CR, { from: T.crack, to: D + 1 }, (u, s, c) => { c.o = 0; });   // the shards stand in from the crack on

    const shards = [];
    CR.units.forEach((p, si) => {
      const m = 10, bx0 = p.bx - m, by0 = p.by - m, bx1 = p.bx + p.bw + m, by1 = p.by + p.bh + m;
      p.impX = p.px + (hash(77, si, 1) - 0.5) * p.bw * 0.4; p.impY = p.by + p.bh * 0.78;
      const pts = [];
      for (let k = 0; k < 11; k++) {
        const hk = si * 32 + k;
        if (k < 5) {
          const a = hash(78, hk, 1) * TAU, rr = Math.pow(hash(78, hk, 2), 1.3) * p.bh * 0.5;
          pts.push([p.impX + Math.cos(a) * rr, p.impY + Math.sin(a) * rr * 0.7]);
        } else pts.push([bx0 + hash(79, hk, 1) * (bx1 - bx0), by0 + hash(79, hk, 2) * (by1 - by0)]);
      }
      for (const cell of voronoi(pts, [bx0, by0, bx1, by1])) {
        const [cx, cy] = centroid(cell);
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const [x, y] of cell) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        const n = shards.length, half = 0.5 * Math.max(x1 - x0, y1 - y0);
        const rest = FLOOR - 0.5 * half - hash(80, n, 1) * 12;
        shards.push({
          kind: 'shard', parent: p, poly: Float32Array.from(cell.flat()), color: p.color,
          px: cx, py: cy, bx: x0, by: y0, bw: x1 - x0, bh: y1 - y0,
          fallH: Math.max(0, rest - cy),
          vx: (hash(80, n, 2) - 0.5) * 260 + (cx - CR.cx) * 0.55,
          spin: (hash(80, n, 3) - 0.5) * 2 * 160,
          delay: 0.07 * si + 0.1 * (1 - (cy - p.by) / p.bh) + 0.05 * hash(80, n, 4),
        });
      }
    });
    const SH = FX.group('shards', shards, { ghosts: { n: 3, shutter: 0.028, alpha: 0.3, thr: 3 } });
    fx(SH, { from: -1, to: T.crack - 1e-4 }, (u, s, c) => { c.o = 0; });
    fx(SH, { from: T.crack, to: T.collapse, fill: 'forwards' }, (u, s, c) => {
      const k = smooth(s.p * 1.6), p = u.parent;
      const dx = u.px - p.impX, dy = u.py - p.impY, d = Math.hypot(dx, dy) || 1, gap = 3.4 * k * (0.6 + 0.8 * u.r(11));
      c.x += (dx / d) * gap; c.y += (dy / d) * gap; c.r += (u.r(12) - 0.5) * 3 * k;
      if (s.t < T.collapse) {
        const q = Math.floor(s.t * 30);
        c.x += (hash(u.G.seed + u.i, q, 1) - 0.5) * 2.4 * k; c.y += (hash(u.G.seed + u.i, q, 2) - 0.5) * 2.4 * k;
      }
    });
    fx(SH, { from: T.collapse, to: D + 1, fill: 'forwards' }, (u, s, c) => {
      const lt = s.lt - u.delay;
      if (lt <= 0) return;
      c.y += u.fallH - bounce(lt, u.fallH, 4600, 0.3, 3);
      c.x += drift(lt, u.vx, 2.4);
      c.r += u.spin * (1 - Math.exp(-2.6 * lt));
    });

    // ------------------------------------------------ 녹는다 — outlines sag; every downward-facing edge drips
    const MB = { top: ML.y0, bot: ML.y1, cx: ML.cx };
    const drips = [];
    for (let i = 0; i < 7; i++) {
      drips.push({
        x: ML.x0 + ((i + 0.2 + 0.6 * hash(81, i, 1)) / 7) * ML.w,
        w: 5 + 6 * hash(81, i, 2),
        len: 18 + 62 * Math.pow(hash(81, i, 3), 1.2),
        start: 0.05 + 0.45 * hash(81, i, 4),
      });
    }
    const meltDeform = (x, y, nx, ny, k, t, out) => {
      const low = clamp((y - MB.top) / (MB.bot - MB.top));
      let dy = 10 * k * low * low;                                    // the word slumps
      const dx = (x - MB.cx) * 0.035 * k * low * low + 2 * k * noise(y * 0.04, x * 0.015, 3);
      const down = smooth((ny - 0.2) / 0.6);                          // a downward-facing edge
      if (down > 0) {
        const bottom = smooth((low - 0.45) / 0.45);                   // drips hang from the lower edges only
        let dr = 4 * k;
        for (const d of drips) {
          const kd = clamp((k - d.start) / (1 - d.start));
          if (kd > 0) dr += d.len * kd * kd * Math.exp(-(((x - d.x) / d.w) ** 2)) * bottom;
        }
        dy += dr * down;
      }
      out[0] = dx; out[1] = dy;
    };
    for (const u of ML.units) u.deform = meltDeform;
    const meltK = (t) => Math.pow(clamp((t - T.melt) / (T.meltEnd - T.melt)), 1.5);
    fx(ML, { from: T.melt, to: T.meltEnd, fill: 'forwards' }, (u, s, c) => { c.melt += Math.pow(s.p, 1.5); });
    // two drops let go of the longest drips that hang under ink, fall to the bottom rule and splat
    const drops = [];
    {
      const OUT = [0, 0];
      const cands = drips.map((d) => {
        let tip = -Infinity;
        for (const u of ML.units) for (const C of u.contours) for (let i = 0; i < C.pts.length; i += 2) {
          if (C.nrm[i + 1] > 0.6 && Math.abs(C.pts[i] - d.x) < 4) tip = Math.max(tip, C.pts[i + 1]);
        }
        return { d, tip };
      }).filter((c) => c.tip > -Infinity).sort((a, b) => b.d.len - a.d.len).slice(0, 2);
      // they let go early enough to have landed before 반짝 (below them) appears
      cands.forEach(({ d, tip }, i) => {
        const td = 6.62 + 0.26 * i, kT = meltK(td);
        meltDeform(d.x, tip, 0, 1, kT, td, OUT);
        drops.push({ x: d.x + OUT[0], y: tip + OUT[1] - 2, td, r: 4 + 0.35 * d.w });
      });
    }

    // ------------------------------------------------ 기분 탓 — a marker strikes it through; each syllable flinches, then fades and thins
    const SX0 = ST.x0 - 20, SX1 = ST.x1 + 20, SY = ST.cy + 6;
    const penAt = (t) => ease.outCubic(clamp((t - T.strike) / STRIKE_DUR));
    const passT = (x) => T.strike + STRIKE_DUR * (1 - Math.cbrt(1 - clamp((x - SX0) / (SX1 - SX0))));
    fx(ST, { from: T.strike, to: D }, (u, s, c) => {
      const lt = s.t - passT(u.px);
      if (lt <= 0) return;
      c.y += 8 * wobble(lt, 4.5, 7); c.r += -5 * wobble(lt, 4.5, 7);
      const k = smooth((lt - 0.08) / 0.55);
      c.o *= 1 - 0.5 * k; c.w += -480 * k;
    });

    // ------------------------------------------------ 반짝 — the sheen crosses it; then light rises through the whole page
    const GLINT_DUR = 0.55;
    const sheenX = (t) => lerp(GL.x0 - 140, GL.x1 + 140, ease.inOutCubic(clamp((t - T.glint) / GLINT_DUR)));
    fx(GL, { from: T.glint, to: T.glint + 0.6 }, (u, s, c) => { c.light += 0.22 * Math.exp(-(((u.px - sheenX(s.t)) / 80) ** 2)); });
    fx(GL, { from: T.glint + 0.6, to: D }, (u, s, c) => {
      const k = smooth((s.t - T.glint - 0.6) / 0.8);
      const f = 1 + 0.02 * k * Math.sin(TAU * 0.5 * (s.t - T.glint) + u.i);
      c.sx *= f; c.sy *= f;
    });
    const sweepY = (t) => lerp(1660, 110, ease.inOutCubic(clamp((t - T.sweep) / 1.15)));
    // …and every word blushes in the accent as the band of light passes it (adds into whatever it is already doing)
    fx('page', { from: T.sweep, to: T.sweep + 1.15 }, (u, s, c) => {
      const g = Math.exp(-(((u.py - sweepY(s.t)) / 85) ** 2));
      c.tint += 0.8 * g; c.light += 0.08 * g;
    });
    // the last breath: a soft swell travels up from the last line, the poem settles
    fx('page', { from: T.calm, to: D }, (u, s, c) => {
      if (u.kind === 'shard') return;
      const tau = s.lt - Math.max(0, GL.cy - u.py) / 1300;
      c.y -= 8 * hump(tau, 0.8);
    });

    const order = [GK, ...quiet, TR, BR, HT, CR, SH, ML, ST, GL, TH];
    const writer = makeWriter({ accent: ACC, light: HI }, { attrs });

    // ------------------------------------------------ the page
    const desk = bakeDesk(), paper = bakePaper(), win = bakeWindow(), leaves = bakeLeaves(), plant = bakePlant(), grain = bakeGrain();
    const grainPat = ctx.createPattern(grain, 'repeat');
    const shade = (t) => {   // ambient colour: cool and dim at first, warm by the end
      const k = smooth((t - 1.0) / 5) * 0.55 + smooth((t - T.glint) / 1.2) * 0.45;
      return [lerp(200, 226, k), lerp(198, 204, k), lerp(206, 182, k)];
    };
    const sun = (t) => 0.62 + 0.18 * smooth((t - 1) / 4) + 0.2 * smooth((t - T.glint) / 1.0);

    // the dashed outline left where 무너진다 stood
    const ghostBox = [Math.floor(CR.x0) - 20, Math.floor(CR.y0) - 20, Math.ceil(CR.w) + 40, Math.ceil(CR.h) + 40];
    const ghostCv = mk(ghostBox[2], ghostBox[3]);
    {
      const g = ghostCv.getContext('2d');
      g.translate(-ghostBox[0], -ghostBox[1]);
      g.setLineDash([6, 7]); g.lineWidth = 1.8; g.strokeStyle = rgba(INK, 1);
      for (const u of CR.units) { g.font = writer.fontOf(u, null); g.strokeText(u.ch, u.bx, u.base); }
    }

    const overlays = {
      // 숨: two faint rings — the wave front itself
      breathRings(g, t) {
        for (let k = 0; k < 2; k++) {
          const r = WAVE_V * (t - T.breathOut - 0.1 - k * 0.12);
          if (r <= 10 || r > 900) continue;
          g.strokeStyle = rgba(INK, 0.2 * (1 - r / 900) * (k ? 0.6 : 1));
          g.lineWidth = 3 - k;
          g.beginPath(); g.ellipse(BP[0], BP[1], r, r * 0.92, 0, 0, TAU); g.stroke();
        }
      },
      // 뜨겁다: heat lines rising off the word
      heatHaze(g, t) {
        const k = smooth((t - T.heat - 0.15) / 0.5);
        if (k <= 0) return;
        g.lineCap = 'round'; g.lineWidth = 4;
        for (let j = 0; j < 4; j++) {
          const ph = frac((t - T.heat) * 0.9 + j / 4), xj = HT.x0 + (0.14 + 0.24 * j) * HT.w;
          const yb = HT.y0 + 6 - 26 * ph, a = 0.7 * Math.sin(Math.PI * ph) * k;
          g.strokeStyle = rgba(ACC, a);
          g.beginPath();
          for (let y = 0; y <= 30; y += 3) { const x = xj + 5 * Math.sin((yb - y) * 0.16 + t * 6 + j); if (y) g.lineTo(x, yb - y); else g.moveTo(x, yb - y); }
          g.stroke();
        }
      },
      // 쿵: contact shadow while it falls, then a ring and impact ticks
      thudShadow(g, t) {
        if (t < T.drop) return;
        const hgt = bounce(t - T.drop, FALL_H, G_FALL, 0.22, 2), near = 1 - clamp(hgt / 700);
        const a = 0.3 * near * near * (1 - smooth((t - T.impact - 0.25) / 0.5));
        if (a <= 0.002) return;
        g.fillStyle = rgba([40, 28, 20], a);
        g.beginPath(); g.ellipse(thud.px, thud.base + 10, thud.bw * (0.25 + 0.4 * near), 9 * (0.4 + 0.6 * near), 0, 0, TAU); g.fill();
      },
      impact(g, t) {
        const p = (t - T.impact) / 0.75;
        if (p <= 0 || p >= 1) return;
        const e = ease.outExpo(p);
        g.strokeStyle = rgba(ACC, 0.9 * (1 - p));
        g.lineWidth = 1.5 + 5 * (1 - p);
        const rx = 40 + 200 * e;
        g.beginPath(); g.ellipse(IMP[0], IMP[1] + 8, rx, rx * 0.2, 0, 0, TAU); g.stroke();
        g.strokeStyle = rgba(INK, 0.75 * (1 - p)); g.lineCap = 'round'; g.lineWidth = 5 * (1 - p) + 1;
        for (let i = 0; i < 7; i++) {
          const a = Math.PI + (0.12 + (0.76 * i) / 6) * Math.PI, r0 = thud.bw * 0.62 + 90 * e, r1 = r0 + 34 + 50 * (1 - e);
          const cx = IMP[0], cy = IMP[1] - thud.bh * 0.35;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.9); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.9); g.stroke();
        }
      },
      // 무너진다: the place it stood keeps a dashed outline
      // (baked once in setup: Chrome's dashed strokeText does not restart its dash phase reliably between frames)
      crumbleGhost(g, t) {
        const a = 0.42 * smooth((t - T.collapse - 0.3) / 0.8);
        if (a <= 0) return;
        g.globalAlpha = a;
        g.drawImage(ghostCv, ghostBox[0], ghostBox[1]);
        g.globalAlpha = 1;
      },
      // 녹는다: drops
      drops(g, t) {
        g.fillStyle = rgba(INK, 1);
        for (const dp of drops) {
          const lt = t - dp.td;
          if (lt < -0.3) continue;
          if (lt < 0) { const k = smooth((lt + 0.3) / 0.3); g.beginPath(); g.arc(dp.x, dp.y, dp.r * k, 0, TAU); g.fill(); continue; }
          const y = dp.y + 1600 * lt * lt, yl = FLOOR - dp.r * 0.6;
          if (y < yl) {
            const st = clamp(lt * 4);
            g.beginPath(); g.ellipse(dp.x, y, dp.r * (1 - 0.15 * st), dp.r * (1 + 0.35 * st), 0, 0, TAU); g.fill();
          } else {
            const tl = lt - Math.sqrt((yl - dp.y) / 1600), e = ease.outCubic(clamp(tl / 0.22));
            g.beginPath(); g.ellipse(dp.x, FLOOR - dp.r * (0.55 - 0.3 * e), dp.r * (1 + 1.5 * e), dp.r * (0.9 - 0.55 * e), 0, 0, TAU); g.fill();
          }
        }
      },
      // 기분 탓: a hand-drawn marker stroke (multiplied onto paper and ink)
      strike(g, t) {
        const p = penAt(t);
        if (p <= 0) return;
        const N = 40, top = [], bot = [];
        const L = SX1 - SX0, tilt = Math.tan(3 * DEG);
        for (let i = 0; i <= N; i++) {
          const s = (i / N) * p, x = lerp(SX0, SX1, s);
          const y = SY - (s - 0.5) * L * tilt + 3.5 * Math.sin(s * 7.3 + 0.8);
          const w = 9.5 * (0.82 + 0.18 * Math.sin(s * 13)) * Math.min(1, 0.45 + s / 0.04) * Math.min(1, 0.55 + (p - s) / 0.05);
          top.push([x, y - w]); bot.push([x, y + w]);
        }
        g.save();
        g.globalCompositeOperation = 'multiply';
        g.fillStyle = rgba(ACC, 0.93);
        g.beginPath();
        g.moveTo(top[0][0], top[0][1]);
        for (const q of top) g.lineTo(q[0], q[1]);
        for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]);
        g.fill();
        // the quick return stroke
        const p2 = ease.outCubic(clamp((t - T.strike - STRIKE_DUR + 0.04) / 0.3));
        if (p2 > 0) {
          g.strokeStyle = rgba(ACC, 0.9); g.lineWidth = 5.5; g.lineCap = 'round';
          g.beginPath();
          for (let i = 0; i <= 24; i++) {
            const s = (i / 24) * p2, x = lerp(SX1 - 6, SX0 + 70, s), y = SY + 14 - (0.5 - s) * L * tilt * 0.6 + 2 * Math.sin(s * 9);
            if (i) g.lineTo(x, y); else g.moveTo(x, y);
          }
          g.stroke();
        }
        g.restore();
      },
      // 반짝: sparkles and a warm bloom
      sparkles(g, t) {
        const S = [[GL.x1 + 42, GL.y0 + 26, 46, 0.34], [GL.x0 - 38, GL.y0 + 46, 22, 0.1], [GL.x1 + 150, GL.y0 + 70, 22, 0.22],
          [GL.x1 + 18, GL.y1 - 24, 18, 0.44], [GL.x1 + 96, GL.cy + 44, 12, 0.52], [GL.x1 + 210, GL.cy - 10, 14, 0.6]];
        S.forEach(([x, y, R0, d], i) => {
          const lt = t - T.glint - d;
          if (lt <= 0) return;
          const twinkle = i < 2 ? 0.45 + 0.25 * Math.sin(TAU * 1.2 * lt + i) : 0;
          const sc = Math.max(0, spring(lt, 2.2, 6)) * (1 - smooth((lt - 0.45) / 0.45)) + twinkle * smooth((lt - 0.6) / 0.4);
          if (sc <= 0.01) return;
          g.save(); g.translate(x, y); g.rotate(0.6 * lt + i);
          const r = R0 * sc;
          g.fillStyle = rgba(i % 3 === 1 ? INK : ACC, 1);
          g.beginPath();
          g.moveTo(0, -r); g.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0); g.quadraticCurveTo(r * 0.12, r * 0.12, 0, r);
          g.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0); g.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r);
          g.fill();
          g.restore();
        });
      },
    };
    // a sheen band clipped to the ink of the text layer (source-atop)
    function sheen(g, x0, y0, x1, y1, cx, cy, ang, half, alpha) {
      if (alpha <= 0.003) return;
      g.save();
      g.globalCompositeOperation = 'source-atop';
      g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
      g.translate(cx, cy); g.rotate(ang);
      const lg = g.createLinearGradient(-half, 0, half, 0);
      lg.addColorStop(0, rgba(HI, 0)); lg.addColorStop(0.5, rgba(HI, alpha)); lg.addColorStop(1, rgba(HI, 0));
      g.fillStyle = lg; g.fillRect(-half, -1400, 2 * half, 2800);
      g.restore();
    }

    this.draw = (t) => {
      // camera shake at the impact
      const sx = 5 * wobble(t - T.impact - 0.015, 7, 9), sy = 13 * wobble(t - T.impact, 6, 8);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
      ctx.setTransform(1.02, 0, 0, 1.02, -W * 0.01 + sx, -H * 0.01 + sy);
      ctx.drawImage(desk, 0, 0);
      ctx.setTransform(1, 0, 0, 1, sx, sy);
      ctx.drawImage(paper, 0, 0);

      // window light (computed first): lit mask = pane − leaf shadows, both swaying a little
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalCompositeOperation = 'copy';
      lctx.drawImage(win, 3 * Math.sin(t * 0.3), 2 * Math.sin(t * 0.23));
      lctx.globalCompositeOperation = 'destination-out';
      lctx.globalAlpha = 0.82;
      lctx.translate(270 + 6 * noise(t * 0.5, 1), 480 + 4 * noise(t * 0.5, 2));
      lctx.rotate(0.012 * noise(t * 0.4, 3));
      lctx.drawImage(leaves, -270, -480);
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalAlpha = 1;
      // the sun lifts the paper (not the ink: drawn before the text), and warms around 반짝 at the end
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.16 + 0.14 * smooth((t - T.glint) / 1.0);
      ctx.drawImage(lightCv, 0, 0, 540, 960, sx, sy, W, H);
      ctx.globalAlpha = 1;
      const bk = smooth((t - T.glint) / 0.5);
      if (bk > 0) {
        const rg = ctx.createRadialGradient(GL.cx + sx, GL.cy + sy, 0, GL.cx + sx, GL.cy + sy, 560);
        rg.addColorStop(0, `rgba(255,206,160,${0.5 * bk})`); rg.addColorStop(1, 'rgba(255,206,160,0)');
        ctx.fillStyle = rg; ctx.fillRect(GL.cx - 560 + sx, GL.cy - 560 + sy, 1120, 1120);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, sx, sy);

      // marks on the paper
      ctx.fillStyle = rgba(ACC, smooth((t - T.kicker) / 0.4));
      ctx.fillRect(X0, 180, 30 * ease.outExpo(clamp((t - T.kicker) / 0.6)), 4);
      overlays.crumbleGhost(ctx, t);
      overlays.thudShadow(ctx, t);
      overlays.breathRings(ctx, t);

      // the text layer: every unit, one write each
      tctx.setTransform(1, 0, 0, 1, 0, 0);
      tctx.clearRect(0, 0, W, H);
      tctx.globalCompositeOperation = 'source-over';
      tctx.textBaseline = 'alphabetic'; tctx.textAlign = 'left';
      drawGroups(tctx, FX, writer, order, t);
      overlays.drops(tctx, t);
      // 반짝's own sheen, then the band of light that rises through the page
      const gp = clamp((t - T.glint) / GLINT_DUR);
      if (gp > 0 && gp < 1) {
        sheen(tctx, GL.x0 - 30, GL.y0 - 40, GL.x1 + 30, GL.y1 + 40, sheenX(t), GL.cy, 22 * DEG, 34, 1);
        sheen(tctx, GL.x0 - 30, GL.y0 - 40, GL.x1 + 30, GL.y1 + 40, sheenX(t) - 62, GL.cy, 22 * DEG, 9, 0.85);
      }
      const sp = clamp((t - T.sweep) / 1.15);
      if (sp > 0 && sp < 1) sheen(tctx, 0, 0, W, H, W / 2, sweepY(t), (90 - 4) * DEG, 40, 0.3 * Math.sin(Math.PI * sp));

      ctx.save();
      ctx.shadowColor = 'rgba(52,34,20,0.2)'; ctx.shadowBlur = 5; ctx.shadowOffsetX = -2; ctx.shadowOffsetY = 4;
      ctx.drawImage(textCv, 0, 110, W, 1580, 0, 110, W, 1580);
      ctx.restore();

      overlays.strike(ctx, t);
      overlays.heatHaze(ctx, t);
      overlays.impact(ctx, t);

      // the light map multiplies everything, ink included: shade where the sun does not reach, leaf shadows over the words
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const sh = shade(t), su = sun(t);
      mctx.globalCompositeOperation = 'source-over';
      mctx.fillStyle = `rgb(${sh[0] | 0},${sh[1] | 0},${sh[2] | 0})`;
      mctx.fillRect(0, 0, 540, 960);
      mctx.globalAlpha = su;
      mctx.drawImage(lightCv, 0, 0);
      mctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(mapCv, 0, 0, 540, 960, sx, sy, W, H);
      ctx.globalCompositeOperation = 'source-over';

      ctx.setTransform(1, 0, 0, 1, sx, sy);
      overlays.sparkles(ctx, t);

      // foreground: the plant in front of the lens sways; vignette; film grain (moves 12 times a second)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.save();
      ctx.translate(W + 20, -40); ctx.rotate((1.4 * Math.sin(t * 0.8) + 0.8 * noise(t * 0.6, 7)) * DEG);
      ctx.drawImage(plant, -720 + sx * 1.6, 0 + sy * 1.6);
      ctx.restore();
      const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.5, H * 0.78);
      vg.addColorStop(0, 'rgba(12,8,6,0)'); vg.addColorStop(1, 'rgba(12,8,6,0.5)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      const q = Math.floor(t * 12);
      ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07;
      ctx.translate(Math.floor(hash(q, 3, 1) * 256), Math.floor(hash(q, 5, 2) * 256));
      ctx.fillStyle = grainPat; ctx.fillRect(-256, -256, W + 256, H + 256);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    };
  },

  frame(t) {
    this.draw(t);
  },
});
