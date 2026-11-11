/*
 * _lib/stage.js — the shared stage + clock every demo runs on.
 *
 * Contract: a demo is a pure function of time.
 *   defineDemo({ id, title, tech, duration, setup, frame })
 *     setup(api)  — async, runs once: build geometry, load data/WASM, compile shaders, precompute/bake.
 *     frame(t)    — draws the frame at time t (seconds). May return a Promise. Must not depend on the
 *                   previous call: frame(5) after frame(9) must look exactly like frame(5) after frame(4).
 *   No Math.random / Date.now / timers / CSS transitions inside a demo — use api.rand(seed) and t.
 *
 * Exposes window.__video = { duration, fps, ready, seek(t) → Promise } for the renderer (_tools/render.mjs).
 * Preview: open index.html in a browser — it plays in real time. Space/click = play/pause, ←/→ = ±0.5 s,
 * ?t=3.2 starts there, ?render=1 (used by the renderer) disables playback and the HUD.
 */

export const W = 1080;
export const H = 1920;

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');

/** mulberry32: same seed → same sequence, every run */
export function rand(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
/** 0→1 over [a, b] with smoothstep */
export const ramp = (t, a, b) => smooth((t - a) / (b - a));
export const ease = {
  inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outCubic: (p) => 1 - Math.pow(1 - p, 3),
  inCubic: (p) => p * p * p,
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOutExpo: (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2),
  outBack: (p, c = 1.7) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2),
};

/**
 * Keyframed values as a pure function of t: track([[t0, v0, ease?], [t1, v1, ease?], …])(t).
 * Each segment uses the ease of its END key (default inOutCubic). Values may be numbers or number arrays.
 */
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const p = (e || ease.inOutCubic)(clamp((t - t0) / Math.max(1e-9, t1 - t0)));
        return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], p)) : lerp(v0, v1, p);
      }
    }
    return keys[keys.length - 1][1];
  };
}

/**
 * Deterministic replay for stateful simulations (fluids, reaction–diffusion, physics stepped live).
 * The sim advances in fixed steps of dt; seek(t) restores the nearest checkpoint ≤ t and steps forward.
 *   const R = replay({ dt, every, init(), step(), save() → snapshot, load(snapshot) });
 *   await R.seek(t)  // state is now exactly at step round(t / dt)
 * Checkpoints are taken every `every` steps whenever the sim passes them, so a forward render steps
 * once per frame and a backward seek costs at most `every` steps after a restore.
 * save() must return a COPY of the state (never live arrays/textures); load(s) must copy s into the live state.
 */
export function replay({ dt, every = 60, init, step, save, load }) {
  const cps = new Map();
  let n = -1;
  return {
    get step() { return n; },
    async seek(t) {
      const target = Math.max(0, Math.round(t / dt));
      if (n < 0) { await init(); n = 0; cps.set(0, await save()); }
      if (target < n || target - n > every) {
        let best = 0;
        for (const k of cps.keys()) if (k <= target && k > best) best = k;
        if (target < n || best > n) { await load(cps.get(best)); n = best; }
      }
      while (n < target) {
        await step(n);
        n++;
        if (n % every === 0 && !cps.has(n)) cps.set(n, await save());
      }
    },
  };
}

export function defineDemo(spec) {
  const { id, title, tech, duration, fps = 30, background = '#000', label = true } = spec;
  document.documentElement.style.cssText = 'background:#000;overflow:hidden';
  document.body.style.cssText = 'margin:0;overflow:hidden;background:#000;touch-action:manipulation';
  // the stage sits in a fixed, clipping frame the size of the screen: its unscaled 1080×1920 box must never widen the
  // page, or a phone lays the page out wider than its screen and the stage is fitted to that, oversized and off-centre
  const view = document.createElement('div');
  view.style.cssText = 'position:fixed;inset:0;overflow:hidden';
  const stage = document.createElement('div');
  stage.id = 'stage';
  stage.style.cssText = `position:absolute;left:50%;top:50%;width:${W}px;height:${H}px;overflow:hidden;background:${background};transform-origin:50% 50%`;
  view.appendChild(stage);
  document.body.appendChild(view);
  const fit = () => {
    const s = Math.min(view.clientWidth / W, view.clientHeight / H);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  };
  fit();
  addEventListener('resize', fit);

  // the technique caption, part of the picture (same place in every demo)
  if (label && (title || tech)) {
    const cap = document.createElement('div');
    cap.style.cssText = 'position:absolute;left:64px;right:64px;bottom:72px;z-index:1000;font-family:"Pretendard Variable",Pretendard,sans-serif;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.55);pointer-events:none';
    cap.innerHTML = `<div style="font-size:30px;font-weight:600;letter-spacing:.02em;opacity:.62">${tech || ''}</div><div style="font-size:52px;font-weight:800;margin-top:10px;letter-spacing:-.01em">${title || ''}</div>`;
    stage.appendChild(cap);
  }

  /** a canvas covering the stage at 1:1 stage pixels (opts: { z, webgl: 'webgl2' | contextAttributes }) */
  function canvas({ z = 0, scale = 1, type = '2d', attrs } = {}) {
    const c = document.createElement('canvas');
    c.width = Math.round(W * scale);
    c.height = Math.round(H * scale);
    c.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;z-index:${z}`;
    stage.appendChild(c);
    const ctx = c.getContext(type, attrs || (type === '2d' ? undefined : { preserveDrawingBuffer: true, antialias: true, premultipliedAlpha: false }));
    if (type === '2d' && scale !== 1) ctx.setTransform(scale, 0, 0, scale, 0, 0);
    return { el: c, ctx };
  }
  function layer(tag = 'div', { z = 0 } = {}) {
    const e = tag === 'svg' ? document.createElementNS('http://www.w3.org/2000/svg', 'svg') : document.createElement(tag);
    if (tag === 'svg') { e.setAttribute('viewBox', `0 0 ${W} ${H}`); e.setAttribute('width', W); e.setAttribute('height', H); }
    e.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;z-index:${z}`;
    stage.appendChild(e);
    return e;
  }

  // headless: true in the renderer's ?render mode (CPU-only SwiftShader) — for optimizations that only pay off there
  const api = { stage, W, H, rand, canvas, layer, duration, fps, headless: RENDER };
  let t = clamp(Number(params.get('t')) || 0, 0, duration);

  // Every frame() call goes through one chain, so two draws never overlap — a stateful demo (replay) would
  // otherwise step the same simulation from two places at once.
  let chain = Promise.resolve();
  const stats = { frames: 0, drawMs: 0 };
  function drawNow(x) {
    const run = chain.then(async () => {
      t = clamp(x, 0, duration);
      const t0 = performance.now();
      await spec.frame(t);   // called as a method: `this` is the spec object in setup() and frame()
      stats.frames++; stats.drawMs += performance.now() - t0;
    });
    chain = run.catch(() => {});
    return run;
  }
  const video = {
    id, title, tech, duration, fps, ready: false,
    seek: (x) => drawNow(x),
  };
  window.__video = video;

  const player = RENDER ? null : createPlayer({ title, duration, fps, drawNow, getT: () => t, stats, spec });

  (async () => {
    if (document.fonts) {
      try { await document.fonts.load('800 52px "Pretendard Variable"'); await document.fonts.ready; } catch (e) { /* fonts optional */ }
    }
    try {
      await spec.setup(api);
      await drawNow(t);
    } catch (e) {
      // surface setup/first-frame failures at once (the renderer waits on ready || error; the viewer sees the message)
      video.error = String(e && e.stack ? e.stack : e);
      console.error('demo setup failed:', video.error);
      if (player) player.fail(video.error);
      return;
    }
    video.ready = true;
    if (player) player.start();
  })();
  return video;
}

/*
 * The live player (not used with ?render): wall-clock playback that never slows down when a frame is
 * expensive (it drops frames instead), a scrub bar, frame stepping, and a frame-rate readout so the
 * viewer can judge real-time performance on their own GPU.
 *   Space / click on the picture: play/pause · ←/→ ±0.5 s (Shift ±2 s) · , . one frame (paused) ·
 *   Home: start · H: hide/show the bar
 * On a touch screen a tap while the bar is hidden only brings it back; the next tap plays/pauses.
 */
function createPlayer({ title, duration, fps, drawNow, getT, stats, spec }) {
  // transport events for demos with media that runs on its own clock (Web Audio): spec.onTransport({ playing, t })
  // fires on play, pause, any seek while playing, and the loop back to 0 — the demo restarts its media at t
  const transport = (playing, at) => { try { spec.onTransport && spec.onTransport({ playing, t: at }); } catch (e) { console.error(e); } };
  const css = document.createElement('style');
  css.textContent = `
    .dp-bar{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(560px,calc(100vw - 32px));z-index:10;box-sizing:border-box;
      display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(14,15,20,.78);
      backdrop-filter:blur(10px);color:#e9ecf2;font:13px/1 "Pretendard Variable",system-ui,sans-serif;
      font-variant-numeric:tabular-nums;transition:opacity .3s;user-select:none}
    .dp-bar.dp-hide{opacity:0;pointer-events:none}
    .dp-bar a{color:#9ab4d6;text-decoration:none;white-space:nowrap}
    .dp-bar button{all:unset;cursor:pointer;width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:rgba(255,255,255,.1)}
    .dp-bar button:hover{background:rgba(255,255,255,.18)}
    .dp-bar input{flex:1;min-width:60px;accent-color:#8fc7ff}
    .dp-time{min-width:74px;text-align:right}
    .dp-fps{min-width:118px;color:#9aa0ab;text-align:right}
    .dp-msg{position:fixed;inset:0;display:grid;place-items:center;z-index:11;color:#cfd5df;padding:24px;text-align:center;
      font:15px/1.6 "Pretendard Variable",system-ui,sans-serif;pointer-events:none;white-space:pre-wrap}
    .dp-msg.dp-err{color:#ff9a9a;font-family:ui-monospace,monospace;font-size:12px;text-align:left}
    @media (max-width:520px){.dp-fps{display:none}.dp-time{min-width:0}}
    @media (pointer:coarse){.dp-bar button{width:40px;height:40px}.dp-bar{gap:12px;padding:8px 12px}}`;
  document.head.appendChild(css);
  const msg = document.createElement('div');
  msg.className = 'dp-msg';
  msg.textContent = `${title || ''}\n불러오는 중…`;
  document.body.appendChild(msg);
  const bar = document.createElement('div');
  bar.className = 'dp-bar';
  bar.innerHTML = `<a href="../" title="갤러리">← 목록</a><button class="dp-play" title="재생/정지 (Space)">▶</button>
    <input class="dp-seek" type="range" min="0" max="${duration}" step="${1 / fps}" value="0">
    <span class="dp-time">0.00 / ${duration.toFixed(2)}</span><span class="dp-fps">– fps</span>`;
  const $ = (s) => bar.querySelector(s);
  const playBtn = $('.dp-play'), seekEl = $('.dp-seek'), timeEl = $('.dp-time'), fpsEl = $('.dp-fps');

  let playing = false, base = 0, wall = 0, pumping = false, wanted = null, hideTimer = 0, pinned = false;
  const clock = () => (base + (performance.now() - wall) / 1000) % duration;
  // show the newest requested time; requests that arrive while a frame is drawing collapse into one
  async function show(x) {
    wanted = x;
    if (pumping) return;
    pumping = true;
    while (wanted !== null) { const y = wanted; wanted = null; await drawNow(y); }
    pumping = false;
    sync();
  }
  function sync() {
    const t = getT();
    seekEl.value = t;
    timeEl.textContent = `${t.toFixed(2)} / ${duration.toFixed(2)}`;
    playBtn.textContent = playing ? '❚❚' : '▶';
  }
  let lastClock = 0;
  function setPlaying(p) {
    playing = p;
    base = getT() >= duration - 1e-3 ? 0 : getT();
    wall = performance.now();
    lastClock = base;
    transport(playing, base);
    if (playing) requestAnimationFrame(tick);
    sync();
  }
  function jump(x) {
    x = Math.max(0, Math.min(duration, x));
    if (playing) { base = x; wall = performance.now(); lastClock = x; transport(true, x); }
    show(x);
  }
  function tick() {
    if (!playing) return;
    const c = clock();
    if (c < lastClock - 0.5 * duration) transport(true, c);   // wrapped around to the start
    lastClock = c;
    if (!pumping) show(c);   // drop frames rather than fall behind the clock
    sync();
    requestAnimationFrame(tick);
  }
  // frame-rate readout: frames actually drawn per second, and the JS time spent inside frame()
  // (GPU work is asynchronous, so for WebGL demos the fps is the real measure)
  let lastFrames = 0, lastMs = 0;
  setInterval(() => {
    const n = stats.frames - lastFrames, ms = stats.drawMs - lastMs;
    lastFrames = stats.frames; lastMs = stats.drawMs;
    if (playing) fpsEl.textContent = n ? `${n} fps · JS ${(ms / n).toFixed(1)}ms` : '0 fps';
  }, 1000);
  const wake = () => {
    if (pinned) return;
    bar.classList.remove('dp-hide');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (playing) bar.classList.add('dp-hide'); }, 2500);
  };

  return {
    start() {
      msg.remove();
      document.body.appendChild(bar);
      bar.addEventListener('click', (e) => e.stopPropagation());
      playBtn.addEventListener('click', () => setPlaying(!playing));
      seekEl.addEventListener('input', () => jump(Number(seekEl.value)));
      seekEl.addEventListener('change', () => seekEl.blur());   // arrow keys then go to the player, not the slider
      // a touch that finds the bar hidden only wakes it; otherwise a tap or click on the picture plays/pauses
      let swallow = false;
      addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && bar.classList.contains('dp-hide') && !pinned) swallow = true; wake(); });
      addEventListener('click', () => { if (swallow) { swallow = false; return; } setPlaying(!playing); });
      addEventListener('mousemove', wake);
      addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 2 : 0.5;
        if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
        else if (e.code === 'ArrowRight') jump(getT() + step);
        else if (e.code === 'ArrowLeft') jump(getT() - step);
        else if (e.code === 'Period' && !playing) jump(getT() + 1 / fps);
        else if (e.code === 'Comma' && !playing) jump(getT() - 1 / fps);
        else if (e.code === 'Home') jump(0);
        else if (e.code === 'KeyH') { pinned = !pinned; bar.classList.toggle('dp-hide', pinned); }
        wake();
      });
      setPlaying(true);
      wake();
    },
    fail(err) {
      msg.classList.add('dp-err');
      msg.textContent = `데모를 시작하지 못했습니다.\n\n${err}`;
    },
  };
}
