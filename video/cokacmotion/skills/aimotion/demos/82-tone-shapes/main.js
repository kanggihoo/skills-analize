/*
 * 82 · 소리가 그린 도형 — visual music after Kandinsky / Bauhaus.
 * One score (score.js) drives both senses:
 *   sound   Tone.js instruments rendered once in Tone.Offline (synth.js); played live through onTransport like demo 29
 *   picture one paused GSAP timeline built from the same note list; frame(t) = tl.time(t) + write the SVG
 * Mapping (Kandinsky's Bauhaus questionnaire pairs: yellow–triangle, red–square/warm, blue–circle/deep):
 *   kick   → a black circle that pulses and sends out rings      hat → short dashes that pop in and rotate to rest
 *   clap   → a long thin line drawn across + a red square         bass → thick bars sliding in, height = pitch
 *   melody → by register: blue ¾ arcs (low), red half arcs (mid), yellow triangles (high), placed along a diagonal by pitch
 *   pad    → one large translucent colour field per chord (CSS multiply over the paper)
 * Determinism: every tween is fromTo with immediateRender:false and its "from" equal to the value the property holds
 * before the tween starts (each property is a continuous chain), so seeking in any order lands on the same state.
 */
import { defineDemo, rand, clamp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { D, FINAL, KICK, HAT, CLAP, BASS, MEL, PAD } from './score.js';
import { renderScore } from './synth.js';

const NS = 'http://www.w3.org/2000/svg';
const C = { red: '#d63a24', blue: '#1f4fa3', yellow: '#f2c230', sky: '#6f9bd6', black: '#161513', paper: '#f1e8d6' };
const KC = [330, 560], KR = 118;  // the kick circle: centre, radius
const MEL_A = [165, 1235], MEL_B = [935, 285];  // melody axis: low pitch → high pitch
const MEL_LO = 64, MEL_HI = 86;
const MONO = '"JetBrains Mono Variable", monospace';

// ---------------------------------------------------------------- small DOM helpers (attribute writes are cached)
function svgEl(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function setA(node, name, value) {
  const c = node.__c || (node.__c = {});
  if (c[name] !== value) { c[name] = value; node.setAttribute(name, value); }
}
function setS(node, name, value) {
  const c = node.__s || (node.__s = {});
  if (c[name] !== value) { c[name] = value; node.style[name] = value; }
}
const f2 = (v) => (Math.round(v * 100) / 100).toString();
const xf = (x, y, r = 0, sx = 1, sy = sx) => `translate(${f2(x)} ${f2(y)}) rotate(${f2(r)}) scale(${f2(sx)} ${f2(sy)})`;

// ---------------------------------------------------------------- paper (drawn once)
function drawPaper(ctx, W, H) {
  const R = rand(1925);
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  // soft unevenness
  for (let i = 0; i < 60; i++) {
    const x = R() * W, y = R() * H, r = 120 + R() * 380;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = R() < 0.5;
    g.addColorStop(0, dark ? 'rgba(160,130,90,0.05)' : 'rgba(255,252,240,0.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // fibres
  ctx.lineCap = 'round';
  for (let i = 0; i < 900; i++) {
    const x = R() * W, y = R() * H, a = R() * Math.PI, l = 6 + R() * 22;
    ctx.strokeStyle = R() < 0.6 ? `rgba(130,105,70,${0.05 + R() * 0.08})` : `rgba(255,255,248,${0.12 + R() * 0.15})`;
    ctx.lineWidth = 0.6 + R() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (R() - 0.5) * 6, y + Math.sin(a) * l * 0.5 + (R() - 0.5) * 6, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  // grain
  for (let i = 0; i < 70000; i++) {
    const v = R();
    ctx.fillStyle = v < 0.55 ? `rgba(110,90,60,${0.04 + R() * 0.07})` : `rgba(255,253,245,${0.05 + R() * 0.08})`;
    ctx.fillRect(R() * W, R() * H, 1 + (R() < 0.1 ? 1 : 0), 1);
  }
  // a faint warm edge
  const v = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, H * 0.75);
  v.addColorStop(0, 'rgba(120,90,50,0)');
  v.addColorStop(1, 'rgba(120,90,50,0.16)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- live sound (same pattern as demo 29)
function audioTransport(buffer, hint) {
  let actx = null, src = null, tp = { playing: false, t: 0, at: 0 };
  const stop = () => { if (src) { try { src.stop(); } catch (e) { /* already stopped */ } src.disconnect(); src = null; } };
  const sync = () => {
    stop();
    const running = actx && actx.state === 'running';
    hint.style.display = running ? 'none' : 'flex';
    if (!running || !tp.playing) return;
    // the player's clock now (t at the last transport event + wall time since), ahead by the output latency
    const now = (tp.t + (performance.now() - tp.at) / 1000) % D;
    const lat = (actx.baseLatency || 0) + (actx.outputLatency || 0);
    src = actx.createBufferSource();
    src.buffer = buffer;
    src.connect(actx.destination);
    src.start(0, Math.min(D - 0.02, now + lat));
  };
  const unlock = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      actx = new AC({ latencyHint: 'interactive' });
      actx.addEventListener('statechange', sync);
    }
    if (actx.state !== 'running') actx.resume().catch(() => {});
    else if (!src) sync();
  };
  // the first click on the picture turns the sound on (instead of pausing the player); the bar works as usual
  addEventListener('click', (e) => {
    const first = !actx || actx.state !== 'running';
    unlock();
    if (first && !(e.target && e.target.closest && e.target.closest('.dp-bar'))) e.stopPropagation();
  }, true);
  addEventListener('keydown', unlock, true);
  return (playing, t) => { tp = { playing, t, at: performance.now() }; sync(); };
}

defineDemo({
  id: '82-tone-shapes',
  title: '소리가 그린 도형',
  tech: 'Tone.js(오프라인 합성) · 악보 기반 모션 · GSAP 타임라인 · SVG',
  duration: D,
  background: C.paper,
  async setup({ stage, canvas, layer, headless }) {
    await fontReady('500 20px "JetBrains Mono Variable"', '120 BPM · F MAJOR 4/4');

    // ---------------- sound first (the picture does not depend on it)
    let buffer = null;
    try { buffer = await renderScore(rand); } catch (e) { console.error('82: offline synthesis failed', e); }

    // ---------------- paper
    const { ctx } = canvas({ z: 0 });
    drawPaper(ctx, 1080, 1920);

    // ---------------- GSAP: one paused timeline, fromTo chains only
    const tl = gsap.timeline({ paused: true });
    const go = (obj, from, to, at) => tl.fromTo(obj, from, { ...to, immediateRender: false, overwrite: false, lazy: false }, at);
    const pulse = (env, t, amp, decay, ease = 'power3.out') => {
      go(env, { v: 0 }, { v: amp, duration: 0.012, ease: 'none' }, t);
      go(env, { v: amp }, { v: 0, duration: decay, ease }, t + 0.012);
    };
    const renders = [];

    // ---------------- pad fields: own <svg> layers, CSS transform/opacity, multiplied over the paper
    const fin = { v: 0 };                                     // the final chord's bloom, shared by all fields
    go(fin, { v: 0 }, { v: 1, duration: 0.25, ease: 'power2.out' }, FINAL);
    go(fin, { v: 1 }, { v: 0, duration: 1.2, ease: 'sine.inOut' }, FINAL + 0.25);
    const FIELDS = [  // [chord index, colour, svg markup, centre, peak, rest]
      [0, C.yellow, `<circle cx="330" cy="560" r="330"/>`, [330, 560], 0.88, 0.72],
      [1, C.blue, `<rect x="420" y="650" width="560" height="720" transform="rotate(-14 700 1010)"/>`, [700, 1010], 0.76, 0.6],
      [2, C.red, `<path d="M0 1345 A255 255 0 0 1 510 1345 Z"/>`, [255, 1215], 0.8, 0.66],
      [3, C.sky, `<path d="M560 90 L1010 90 L1010 640 Z"/>`, [860, 273], 0.62, 0.48],
    ];
    for (const [ci, col, markup, [cx, cy], peak, rest] of FIELDS) {
      const svg = layer('svg', { z: 1 + ci });
      svg.style.mixBlendMode = 'multiply';
      svg.style.willChange = 'transform, opacity';
      svg.style.transformOrigin = `${cx}px ${cy}px`;
      svg.style.opacity = '0';
      svg.innerHTML = `<g fill="${col}">${markup}</g>`;
      const t0 = PAD[ci].t;
      const st = { o: 0, s: 0.88 };
      go(st, { o: 0 }, { o: peak, duration: ci === 0 ? 1.3 : 1.0, ease: 'sine.out' }, t0);
      go(st, { o: peak }, { o: rest, duration: 0.8, ease: 'sine.inOut' }, t0 + (ci === 0 ? 1.3 : 1.0));
      go(st, { s: 0.88 }, { s: 1, duration: 1.8, ease: 'power2.out' }, t0);
      renders.push(() => {
        setS(svg, 'opacity', f2(clamp(st.o + 0.14 * fin.v * (st.o > 0.01 ? 1 : 0))));
        setS(svg, 'transform', `scale(${f2(st.s * (1 + 0.025 * fin.v))})`);
      });
    }

    // ---------------- the foreground svg
    const svg = layer('svg', { z: 10 });
    const gRings = svgEl('g', { fill: 'none', stroke: C.black }, svg);
    const gHalo = svgEl('g', {}, svg);
    const gDisc = svgEl('g', {}, svg);
    const gBass = svgEl('g', {}, svg);
    const gHat = svgEl('g', { 'stroke-linecap': 'butt' }, svg);
    const gLines = svgEl('g', {}, svg);
    const gMel = svgEl('g', {}, svg);
    const gFoot = svgEl('g', {}, svg);

    // ---- kick: disc that grows with the arrangement and pulses on every kick; a ring per kick
    const kd = { s: 0, base: 1 };
    go(kd, { s: 0 }, { s: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0);
    const BASE = [[2.0, 1.06], [4.0, 1.13], [6.0, 1.21]];  // the circle grows bar by bar
    let prev = 1;
    for (const [t, b] of BASE) { go(kd, { base: prev }, { base: b, duration: 0.5, ease: 'power2.out' }, t); prev = b; }
    go(kd, { base: prev }, { base: 1.34, duration: 1.1, ease: 'elastic.out(1, 0.45)' }, FINAL);
    const baseAt = (t) => { let b = 1; for (const [tt, v] of BASE) if (t >= tt + 0.25) b = v; return t >= FINAL ? 1.3 : b; };
    const kickEnv = KICK.map((k) => { const e = { v: 0 }; pulse(e, k.t, 0.15 * k.v, 0.42); return e; });
    const disc = svgEl('circle', { cx: 0, cy: 0, r: KR, fill: C.black }, gDisc);
    const halo = svgEl('circle', { cx: 0, cy: 0, r: KR * 1.42, fill: 'none', stroke: C.red, 'stroke-width': 24, opacity: 0 }, gHalo);
    const hs = { o: 0 };
    go(hs, { o: 0 }, { o: 0.92, duration: 2.0, ease: 'power1.in' }, 4.0);
    renders.push(() => {
      let p = 1;
      for (const e of kickEnv) p += e.v;
      const s = kd.s * kd.base;
      setA(disc, 'transform', xf(KC[0], KC[1], 0, s * p));
      setA(halo, 'transform', xf(KC[0], KC[1], 0, s));
      setA(halo, 'opacity', f2(hs.o));
    });
    KICK.forEach((k, i) => {
      const big = k.t >= FINAL;
      const r0 = KR * baseAt(k.t) * 1.02;
      const r1 = r0 + (big ? 420 : 150 + 150 * k.v);
      const ring = svgEl('circle', { cx: 0, cy: 0, r: KR, 'stroke-width': big ? 5 : 3, 'vector-effect': 'non-scaling-stroke', opacity: 0 }, gRings);
      const st = { o: 0, s: r0 / KR };
      const life = big ? 1.55 : 1.4;
      go(st, { o: 0 }, { o: big ? 0.9 : 0.75, duration: 0.02, ease: 'none' }, k.t);
      go(st, { o: big ? 0.9 : 0.75 }, { o: 0, duration: life, ease: 'power1.in' }, k.t + 0.02);
      go(st, { s: r0 / KR }, { s: r1 / KR, duration: life + 0.02, ease: 'expo.out' }, k.t);
      renders.push(() => {
        setA(ring, 'opacity', f2(st.o));
        setA(ring, 'transform', xf(KC[0], KC[1], 0, st.s));
      });
      void i;
    });

    // ---- hats: a herringbone lattice of short dashes, one per hit, each rotating into place
    const HC = [850, 870], HSTEP = 58, HROT = -18 * Math.PI / 180;
    const R = rand(4711);
    HAT.forEach((h, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      const lx = (col - 2.5) * HSTEP, ly = (row - 2.5) * HSTEP;
      const x = HC[0] + lx * Math.cos(HROT) - ly * Math.sin(HROT), y = HC[1] + lx * Math.sin(HROT) + ly * Math.cos(HROT);
      const rest = (row % 2 ? 52 : -38) + (R() - 0.5) * 12;
      const onBeat = Math.abs(h.t / 0.5 - Math.round(h.t / 0.5)) < 1e-6;
      const dash = svgEl('line', { x1: -17, y1: 0, x2: 17, y2: 0, stroke: onBeat ? C.red : C.black, 'stroke-width': 7 + 3 * h.v, opacity: 0 }, gHat);
      const st = { s: 0, r: rest + 110, o: 0 };
      go(st, { o: 0 }, { o: 1, duration: 0.03, ease: 'none' }, h.t);
      go(st, { s: 0 }, { s: 1, duration: 0.12, ease: 'power2.out' }, h.t);
      go(st, { r: rest + 110 }, { r: rest, duration: 0.5, ease: 'back.out(2.2)' }, h.t);
      renders.push(() => {
        setA(dash, 'opacity', f2(st.o));
        setA(dash, 'transform', xf(x, y, st.r, st.s));
      });
    });

    // ---- claps: long thin lines drawn across the composition, each starting at a small red square
    const LINES = [  // [x1, y1, x2, y2, width]
      [70, 1110, 1010, 690, 5], [210, 120, 640, 1270, 4], [1020, 940, 420, 1560, 6], [40, 760, 1040, 1010, 3],
    ];
    CLAP.forEach((c, j) => {
      const [x1, y1, x2, y2, w] = LINES[j];
      const L = Math.hypot(x2 - x1, y2 - y1);
      const line = svgEl('line', { x1, y1, x2, y2, stroke: C.black, 'stroke-width': w, 'stroke-dasharray': f2(L), 'stroke-dashoffset': f2(L), opacity: 0 }, gLines);
      const sq = svgEl('rect', { x: -11, y: -11, width: 22, height: 22, fill: C.red, opacity: 0 }, gLines);
      const st = { d: 0, s: 0, r: 0 };
      go(st, { d: 0 }, { d: 1, duration: 0.26, ease: 'power3.out' }, c.t);
      go(st, { s: 0 }, { s: 1, duration: 0.4, ease: 'back.out(3)' }, c.t);
      go(st, { r: 0 }, { r: 45 + 45 * j, duration: 0.6, ease: 'power2.out' }, c.t);
      renders.push(() => {
        setA(line, 'stroke-dashoffset', f2(L * (1 - st.d)));
        setA(line, 'opacity', st.d > 0.001 ? '1' : '0');
        setA(sq, 'opacity', st.s > 0.001 ? '1' : '0');
        setA(sq, 'transform', xf(x1, y1, st.r, st.s));
      });
    });

    // ---- bass: thick bars that slide in from the right; height on the page = pitch, x = when
    BASS.forEach((b) => {
      const last = b.t >= FINAL;
      if (last) {
        // the low F of the final chord: a blue ground line drawn across the whole width
        const bar = svgEl('rect', { x: 0, y: -12, width: 960, height: 24, fill: C.blue, opacity: 0 }, gBass);
        const st = { sx: 0, o: 0 };
        go(st, { o: 0 }, { o: 1, duration: 0.02, ease: 'none' }, b.t);
        go(st, { sx: 0 }, { sx: 1, duration: 0.9, ease: 'power3.inOut' }, b.t);
        renders.push(() => { setA(bar, 'opacity', f2(st.o)); setA(bar, 'transform', `translate(60 1568) scale(${f2(st.sx)} 1)`); });
        return;
      }
      const x0 = 60 + (b.t - 2) * 150, y0 = 1530 - (b.m - 34) * 16;
      const w = Math.max(34, b.d * 135);
      const bar = svgEl('rect', { x: 0, y: -13, width: f2(w), height: 26, fill: C.black, opacity: 0 }, gBass);
      const st = { x: x0 + 150, o: 0, h: 1.7 };
      go(st, { o: 0 }, { o: 1, duration: 0.04, ease: 'none' }, b.t);
      go(st, { x: x0 + 150 }, { x: x0, duration: 0.45, ease: 'power4.out' }, b.t);
      go(st, { h: 1.7 }, { h: 1, duration: 0.35, ease: 'power2.out' }, b.t);
      renders.push(() => { setA(bar, 'opacity', f2(st.o)); setA(bar, 'transform', `translate(${f2(st.x)} ${y0}) scale(1 ${f2(st.h)})`); });
    });

    // ---- melody: shapes along the low→high diagonal; grow on the note, fade to a trace after it
    const ax = MEL_B[0] - MEL_A[0], ay = MEL_B[1] - MEL_A[1], aL = Math.hypot(ax, ay);
    const ux = ax / aL, uy = ay / aL, px = -uy, py = ux;      // axis unit and its perpendicular
    const seen = new Map();
    const R2 = rand(906);
    MEL.forEach((m) => {
      const k = seen.get(m.m) || 0;
      seen.set(m.m, k + 1);
      const final = m.t >= FINAL;
      const u = (m.m - MEL_LO) / (MEL_HI - MEL_LO);
      const off = (final ? [-150, 150, -60][MEL.filter((q) => q.t >= FINAL).indexOf(m)] : [0, 110, -110, 205, -205][k % 5]) + (R2() - 0.5) * 24;
      const x = MEL_A[0] + ux * u * aL + px * off, y = MEL_A[1] + uy * u * aL + py * off;
      const r0 = (m.m % 12) * 30 + k * 25;
      const g = svgEl('g', { opacity: 0 }, gMel);
      if (m.m >= 79) {
        const R = 34 + 30 * m.v + (final ? 18 : 0);
        const pts = [-90, 30, 150].map((a) => `${f2(R * Math.cos(a * Math.PI / 180))},${f2(R * Math.sin(a * Math.PI / 180))}`).join(' ');
        svgEl('polygon', { points: pts, fill: C.yellow, ...(m.m >= 84 ? { stroke: C.black, 'stroke-width': 4, 'stroke-linejoin': 'miter' } : {}) }, g);
      } else if (m.m >= 72) {
        const r = 30 + 14 * m.v + (final ? 10 : 0);
        svgEl('path', { d: `M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`, fill: 'none', stroke: C.red, 'stroke-width': 13 }, g);
      } else {
        const r = 34 + 12 * m.v;
        svgEl('path', { d: `M${r} 0 A${r} ${r} 0 1 1 0 ${-r}`, fill: 'none', stroke: C.blue, 'stroke-width': 13 }, g);
      }
      const st = { s: 0, r: r0 - 60, o: 0 };
      go(st, { o: 0 }, { o: 1, duration: 0.04, ease: 'none' }, m.t);
      go(st, { s: 0 }, { s: 1.18, duration: 0.12, ease: 'power2.out' }, m.t);
      go(st, { s: 1.18 }, { s: 1, duration: 0.3, ease: 'power2.inOut' }, m.t + 0.12);
      go(st, { r: r0 - 60 }, { r: r0, duration: 0.55, ease: 'back.out(1.6)' }, m.t);
      if (!final) go(st, { o: 1 }, { o: 0.3, duration: 1.4, ease: 'sine.inOut' }, m.t + m.d + 0.15);
      renders.push(() => { setA(g, 'opacity', f2(st.o)); setA(g, 'transform', xf(x, y, st.r, st.s)); });
    });

    // ---- footer: black band, the score itself as a strip, a playhead
    svgEl('rect', { x: 0, y: 1600, width: 1080, height: 320, fill: C.black }, gFoot);
    svgEl('text', { x: 64, y: 1636, fill: C.paper, opacity: 0.6, 'font-family': MONO, 'font-size': 19, 'font-weight': 500, 'letter-spacing': 2 }, gFoot)
      .textContent = '120 BPM · F MAJOR · 4/4';
    const X0 = 64, XW = 952, ROW = (r) => 1656 + r * 11;
    const strip = [];
    const addRow = (list, r, col, minW = 3) => list.forEach((n) => {
      const rect = svgEl('rect', { x: f2(X0 + (n.t / D) * XW), y: ROW(r), width: f2(Math.max(minW, (n.d / D) * XW)), height: 6, fill: col, opacity: 0.25 }, gFoot);
      strip.push([n.t, rect]);
    });
    addRow(PAD, 0, C.yellow);
    addRow(MEL, 1, C.paper);
    addRow(BASS, 2, '#5b86d6');
    addRow(HAT, 3, '#9b968c', 2);
    addRow(KICK, 4, C.red, 4);
    const head = svgEl('rect', { x: -1.5, y: 1648, width: 3, height: 64, fill: C.red }, gFoot);
    const ph = { p: 0 };
    go(ph, { p: 0 }, { p: 1, duration: D, ease: 'none' }, 0);
    renders.push(() => {
      const now = ph.p * D;
      for (const [t, rect] of strip) setA(rect, 'opacity', now >= t ? '1' : '0.25');
      setA(head, 'transform', `translate(${f2(X0 + ph.p * XW)} 0)`);
    });

    this.tl = tl;
    this.renders = renders;

    // ---------------- sound on demand
    if (!headless && buffer) {
      const hint = document.createElement('div');
      hint.style.cssText = 'position:absolute;left:50%;top:34px;transform:translateX(-50%);display:flex;align-items:center;gap:14px;' +
        'padding:16px 30px 16px 26px;border-radius:999px;background:rgba(22,21,19,.86);color:#f1e8d6;' +
        'font:600 30px/1 "Pretendard Variable",Pretendard,sans-serif;letter-spacing:-0.01em;z-index:900;pointer-events:none;white-space:nowrap';
      hint.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M6 4 L20 12 L6 20 Z" fill="currentColor"/></svg>소리를 들으려면 화면을 누르세요';
      stage.appendChild(hint);
      this.transport = audioTransport(buffer, hint);
    }
  },
  onTransport({ playing, t }) {
    if (this.transport) this.transport(playing, t);
  },
  frame(t) {
    this.tl.time(t, true);
    for (const r of this.renders) r();
  },
});
