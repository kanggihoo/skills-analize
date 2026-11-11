/*
 * 16 · 쏟아지는 구슬 — a Galton box simulated with Rapier2D (Rust → WebAssembly), baked once in setup().
 * sim.js (physical units: 1 px = 1 mm, g·sin 34°, glass-on-brass contacts) steps the world at dt = 1/120 s,
 * 4 substeps per video frame, releasing marbles on a fixed schedule, and stores every frame's poses
 * (x, y, angle) in one Float32Array. frame(t) only reads that table — interpolating between neighbouring frames
 * for live playback — so any t is drawn directly and seeking is exact.
 * Wood, brass and glass never move: they are painted once into static canvases. At the end the bell curve is
 * fitted to where the marbles actually came to rest, next to the binomial B(14, ½) it approximates.
 */
import RAPIER from '@dimforge/rapier2d-compat';
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { bake, BOARD as B, pegs, dividers } from './sim.js';

const D = 9.6, FPS = 30;
const PANEL = { x0: 64, x1: 1016, y1: 1628 };          // wood panel (runs off the top of the frame)
const curveP = (t) => ease.inOutCubic(clamp((t - 7.0) / 1.25));
const labelA = (t) => smooth((t - 8.0) / 0.6);
const fadeIn = (t) => 0.75 * (1 - smooth(t / 0.7));
const fadeOut = (t) => 0.88 * smooth((t - 9.22) / 0.38);  // the player loops: end dim, start dim → soft seam

// glass marbles: [body, light, dark]
const GLASS = [
  ['#9c2f2a', '#f29a7e', '#360b09'],   // oxblood
  ['#22807b', '#93e2d4', '#06302d'],   // teal
  ['#d8cdb6', '#fffaf0', '#665a44'],   // ivory
  ['#2d4f93', '#9fbaf0', '#0b1634'],   // cobalt
];

defineDemo({
  id: '16-rapier-marbles',
  title: '쏟아지는 구슬',
  tech: 'Rapier2D (WebAssembly) 물리 · 미리 굽기',
  duration: D,
  background: '#0d0907',

  async setup({ canvas, W, H }) {
    await RAPIER.init();
    const sim = bake(RAPIER, { rand, seed: 16, fps: FPS, duration: D });
    const { pose, n, colour, frames } = sim;
    const R = B.marbleR;

    // headless render (SwiftShader, no GPU): keep the per-frame canvases on Skia's CPU raster path there
    const RENDER = new URLSearchParams(location.search).has('render');
    const fast = RENDER ? { willReadFrequently: true } : undefined;
    const board = canvas({ type: '2d', z: 0 }).ctx;
    const live = canvas({ type: '2d', z: 1, attrs: fast }).ctx;
    const glass = canvas({ type: '2d', z: 2 }).ctx;
    const fx = canvas({ type: '2d', z: 3, attrs: fast }).ctx;

    // ---------------- the board: wood, brass, painted once ----------------
    const rw = rand(7);
    {
      const g = board;
      g.fillStyle = '#0d0907'; g.fillRect(0, 0, W, H);
      const { x0, x1, y1 } = PANEL;
      // walnut frame rails
      const rail = (x, y, w, h, horiz) => {
        const gr = horiz ? g.createLinearGradient(0, y, 0, y + h) : g.createLinearGradient(x, 0, x + w, 0);
        gr.addColorStop(0, '#3b2416'); gr.addColorStop(0.18, '#5a3822'); gr.addColorStop(0.5, '#2d1b10'); gr.addColorStop(1, '#170d07');
        g.fillStyle = gr; g.fillRect(x, y, w, h);
      };
      rail(x0 - 34, -10, 34, y1 + 60, false);
      rail(x1, -10, 34, y1 + 60, false);
      rail(x0 - 34, y1, x1 - x0 + 68, 50, true);
      // oak panel: base tone + long wavy grain + light pool + edge falloff
      const base = g.createLinearGradient(0, 0, 0, y1);
      base.addColorStop(0, '#8a5a30'); base.addColorStop(0.45, '#a06a39'); base.addColorStop(1, '#7a4c27');
      g.fillStyle = base; g.fillRect(x0, -10, x1 - x0, y1 + 10);
      g.save();
      g.beginPath(); g.rect(x0, -10, x1 - x0, y1 + 10); g.clip();
      for (let i = 0; i < 260; i++) {
        const x = x0 + rw() * (x1 - x0), dark = rw() < 0.7;
        const a1 = 3 + rw() * 10, f1 = 0.002 + rw() * 0.004, p1 = rw() * 6.28, a2 = 0.5 + rw() * 2, f2 = 0.02 + rw() * 0.03;
        g.strokeStyle = dark ? `rgba(58,28,8,${(0.04 + rw() * 0.1).toFixed(3)})` : `rgba(255,214,160,${(0.02 + rw() * 0.05).toFixed(3)})`;
        g.lineWidth = 0.5 + rw() * (dark ? 2.6 : 1.4);
        g.beginPath();
        for (let y = -10; y <= y1; y += 12) {
          const xx = x + a1 * Math.sin(y * f1 + p1) + a2 * Math.sin(y * f2 + p1 * 3);
          if (y === -10) g.moveTo(xx, y); else g.lineTo(xx, y);
        }
        g.stroke();
      }
      for (let i = 0; i < 1400; i++) {   // pores
        g.fillStyle = `rgba(50,24,8,${(0.05 + rw() * 0.12).toFixed(3)})`;
        g.fillRect(x0 + rw() * (x1 - x0), rw() * y1, 0.8, 2 + rw() * 7);
      }
      const pool = g.createRadialGradient(360, 520, 0, 360, 520, 1100);
      pool.addColorStop(0, 'rgba(255,214,150,0.22)'); pool.addColorStop(0.5, 'rgba(255,190,120,0.06)'); pool.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalCompositeOperation = 'screen'; g.fillStyle = pool; g.fillRect(x0, -10, x1 - x0, y1 + 10);
      const fall = g.createRadialGradient(540, 800, 300, 540, 900, 1250);
      fall.addColorStop(0, 'rgba(0,0,0,0)'); fall.addColorStop(1, 'rgba(20,8,0,0.55)');
      g.globalCompositeOperation = 'source-over'; g.fillStyle = fall; g.fillRect(x0, -10, x1 - x0, y1 + 10);
      // inner shadow where the panel meets the frame
      for (const [gx0, gy0, gx1, gy1, x, y, w, h] of [[x0, 0, x0 + 26, 0, x0, -10, 26, y1 + 10], [x1, 0, x1 - 26, 0, x1 - 26, -10, 26, y1 + 10], [0, y1, 0, y1 - 22, x0, y1 - 22, x1 - x0, 22]]) {
        const sg = g.createLinearGradient(gx0, gy0, gx1, gy1);
        sg.addColorStop(0, 'rgba(15,6,0,0.55)'); sg.addColorStop(1, 'rgba(15,6,0,0)');
        g.fillStyle = sg; g.fillRect(x, y, w, h);
      }
      g.restore();

      // brass: a strip along a segment (offset to the side away from the marbles), lit from the upper left
      const brassStrip = (ax, ay, bx, by, side, wdt = 9) => {
        const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy), nx = (-dy / l) * side, ny = (dx / l) * side;
        const ox = nx * wdt / 2, oy = ny * wdt / 2;
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(20,8,0,0.45)'; g.lineWidth = wdt + 4;      // cast shadow
        g.beginPath(); g.moveTo(ax + ox + 3, ay + oy + 5); g.lineTo(bx + ox + 3, by + oy + 5); g.stroke();
        const gr = g.createLinearGradient(ax + ox - nx * wdt / 2, ay + oy - ny * wdt / 2, ax + ox + nx * wdt / 2, ay + oy + ny * wdt / 2);
        const lit = (-nx - ny) > 0;   // which face sees the light
        gr.addColorStop(0, lit ? '#6e4a16' : '#fff0c0'); gr.addColorStop(0.35, '#d9a948'); gr.addColorStop(0.7, '#9c6c22'); gr.addColorStop(1, lit ? '#fff0c0' : '#5a3a10');
        g.strokeStyle = gr; g.lineWidth = wdt;
        g.beginPath(); g.moveTo(ax + ox, ay + oy); g.lineTo(bx + ox, by + oy); g.stroke();
        g.restore();
      };
      // the funnel: one continuous brass band per side, offset outward from the physics line (mitred corners)
      const offsetLine = (pts, side, d) => pts.map((p, j) => {
        const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [(-dy / l) * side, (dx / l) * side]; };
        const na = j > 0 ? nrm(pts[j - 1], p) : null, nb = j < pts.length - 1 ? nrm(p, pts[j + 1]) : null;
        if (!na || !nb) { const q = na || nb; return [p[0] + q[0] * d, p[1] + q[1] * d]; }
        let mx = na[0] + nb[0], my = na[1] + nb[1]; const ml = Math.hypot(mx, my); mx /= ml; my /= ml;
        const k = d / (mx * nb[0] + my * nb[1]);
        return [p[0] + mx * k, p[1] + my * k];
      });
      const poly = (pts, dx = 0, dy = 0) => { g.beginPath(); pts.forEach(([x, y], j) => (j ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy))); };
      const { cx } = B;
      for (const side of [1, -1]) {
        const sx = -side;   // left side: x = cx − …
        const pts = [[cx + sx * B.mouthHalf, -30], [cx + sx * B.mouthHalf, B.mouthY], [cx + sx * B.neckHalf, B.neckY], [cx + sx * B.neckHalf, B.lipY]];
        g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
        poly(offsetLine(pts, side, 5), 3, 6); g.strokeStyle = 'rgba(20,8,0,0.42)'; g.lineWidth = 13; g.stroke();   // cast shadow
        const bg = g.createLinearGradient(0, 0, 0, B.lipY);
        bg.addColorStop(0, '#b88a34'); bg.addColorStop(0.6, '#d6a84c'); bg.addColorStop(1, '#a87a2c');
        poly(offsetLine(pts, side, 5)); g.strokeStyle = bg; g.lineWidth = 10; g.stroke();
        poly(offsetLine(pts, side, 9.2)); g.strokeStyle = 'rgba(60,36,8,0.9)'; g.lineWidth = 1.6; g.stroke();     // dark outer edge
        poly(offsetLine(pts, side, 1.2)); g.strokeStyle = 'rgba(255,242,200,0.9)'; g.lineWidth = 1.6; g.stroke();  // polished inner edge
        g.restore();
      }
      // side walls of the pin field + bins, the floor
      brassStrip(B.binL, 470, B.binL, B.floorY, 1, 8);
      brassStrip(B.binR, 470, B.binR, B.floorY, -1, 8);
      brassStrip(B.binL - 8, B.floorY, B.binR + 8, B.floorY, 1, 10);
      // dividers with rounded caps
      const dv = dividers();
      for (let m = 1; m < dv.length - 1; m++) {
        const x = dv[m];
        g.fillStyle = 'rgba(20,8,0,0.4)'; g.fillRect(x - 3 + 3, B.binTop + 5, B.divW, B.floorY - B.binTop);
        const gr = g.createLinearGradient(x - 3, 0, x + 3, 0);
        gr.addColorStop(0, '#fbe6b0'); gr.addColorStop(0.4, '#d0a046'); gr.addColorStop(1, '#6a4512');
        g.fillStyle = gr;
        g.beginPath(); g.arc(x, B.binTop, 3, Math.PI, 0); g.lineTo(x + 3, B.floorY); g.lineTo(x - 3, B.floorY); g.closePath(); g.fill();
      }
      // brass pins: soft shadow, polished body, a pin-prick highlight
      for (const [x, y] of pegs()) {
        const r = B.pegR;
        const sh = g.createRadialGradient(x + 3, y + 4.5, 0, x + 3, y + 4.5, r * 1.7);
        sh.addColorStop(0, 'rgba(25,10,0,0.55)'); sh.addColorStop(1, 'rgba(25,10,0,0)');
        g.fillStyle = sh; g.fillRect(x - 2 * r, y - 2 * r, 5 * r, 5 * r);
        const body = g.createRadialGradient(x - r * 0.4, y - r * 0.45, 0, x, y, r);
        body.addColorStop(0, '#fffbea'); body.addColorStop(0.16, '#f2cd72'); body.addColorStop(0.55, '#8c5c1a'); body.addColorStop(1, '#2c1a05');
        g.fillStyle = body; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      // engraved bin plate below the floor
      g.fillStyle = 'rgba(255,225,170,0.10)';
      g.fillRect(B.binL, PANEL.y1 + 8, B.binR - B.binL, 1);
    }

    // ---------------- the glass: soft diagonal reflections, painted once ----------------
    {
      const g = glass;
      const { x0, x1, y1 } = PANEL;
      g.save();
      g.beginPath(); g.rect(x0, -10, x1 - x0, y1 + 10); g.clip();
      const band = (cx0, w, a) => {   // a band at 62° across the panel
        const ang = -62 * Math.PI / 180, dx = Math.cos(ang + Math.PI / 2), dy = Math.sin(ang + Math.PI / 2);
        const gr = g.createLinearGradient(cx0 - dx * w, 800 - dy * w, cx0 + dx * w, 800 + dy * w);
        gr.addColorStop(0, 'rgba(255,248,235,0)'); gr.addColorStop(0.5, `rgba(255,248,235,${a})`); gr.addColorStop(1, 'rgba(255,248,235,0)');
        g.fillStyle = gr; g.fillRect(x0, -10, x1 - x0, y1 + 10);
      };
      band(250, 170, 0.09);
      band(470, 40, 0.08);
      band(900, 260, 0.05);
      const top = g.createLinearGradient(0, 0, 0, 360);
      top.addColorStop(0, 'rgba(255,240,220,0.08)'); top.addColorStop(1, 'rgba(255,240,220,0)');
      g.fillStyle = top; g.fillRect(x0, -10, x1 - x0, 370);
      g.fillStyle = 'rgba(255,245,230,0.22)'; g.fillRect(x0, -10, 1.5, y1 + 10);   // glass edge catching light
      g.fillStyle = 'rgba(255,245,230,0.10)'; g.fillRect(x0, y1 - 1.5, x1 - x0, 1.5);
      g.restore();
    }

    // ---------------- marble sprites: glass body, a cat's-eye vane that turns with the body, a fixed gloss ----------------
    const SS = 4, SZ = (R + 3) * 2;                          // sprites drawn at 4× then scaled down: smooth edges
    const spriteCanvas = (draw) => {
      const c = document.createElement('canvas'); c.width = c.height = SZ * SS;
      const g = c.getContext('2d');
      g.scale(SS, SS);
      draw(g, SZ / 2);
      return c;
    };
    const spr = GLASS.map(([body, light, dark]) => spriteCanvas((g, m) => {
      const gr = g.createRadialGradient(m - R * 0.32, m - R * 0.38, 0, m, m, R);
      gr.addColorStop(0, light); gr.addColorStop(0.42, body); gr.addColorStop(0.88, dark); gr.addColorStop(1, dark);
      g.fillStyle = gr; g.beginPath(); g.arc(m, m, R, 0, Math.PI * 2); g.fill();
      g.save(); g.clip();
      const tr = g.createRadialGradient(m + R * 0.32, m + R * 0.42, 0, m + R * 0.32, m + R * 0.42, R * 0.75);   // light through the glass
      tr.addColorStop(0, light); tr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.6; g.fillStyle = tr; g.fillRect(0, 0, SZ, SZ);
      g.restore();
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = R * 0.08; g.beginPath(); g.arc(m, m, R * 0.96, 0, Math.PI * 2); g.stroke();
    }));
    const vane = GLASS.map(([, light]) => spriteCanvas((g, m) => {   // an S-shaped ribbon inside the glass
      g.beginPath(); g.arc(m, m, R * 0.9, 0, Math.PI * 2); g.clip();
      g.strokeStyle = light; g.globalAlpha = 0.55; g.lineWidth = R * 0.22; g.lineCap = 'round';
      g.beginPath(); g.moveTo(m - R * 0.7, m); g.bezierCurveTo(m - R * 0.3, m - R * 0.55, m + R * 0.3, m + R * 0.55, m + R * 0.7, m); g.stroke();
      g.globalAlpha = 0.3; g.lineWidth = R * 0.1;
      g.beginPath(); g.moveTo(m - R * 0.6, m + R * 0.25); g.bezierCurveTo(m - R * 0.2, m - R * 0.25, m + R * 0.2, m + R * 0.8, m + R * 0.6, m + R * 0.25); g.stroke();
    }));
    const gloss = spriteCanvas((g, m) => {                     // the key light is fixed, so the gloss never turns
      const hl = g.createRadialGradient(m - R * 0.36, m - R * 0.42, 0, m - R * 0.36, m - R * 0.42, R * 0.32);
      hl.addColorStop(0, 'rgba(255,255,255,0.95)'); hl.addColorStop(0.5, 'rgba(255,255,255,0.45)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = hl; g.fillRect(0, 0, SZ, SZ);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(m + R * 0.38, m + R * 0.36, R * 0.09, 0, Math.PI * 2); g.fill();
    });
    const shadow = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(20,6,0,0.6)'); gr.addColorStop(0.45, 'rgba(20,6,0,0.35)'); gr.addColorStop(1, 'rgba(20,6,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return c;
    })();
    const sprOf = Uint8Array.from(colour, (c) => c % GLASS.length);

    // ---------------- the bell curve, fitted to where the marbles actually came to rest ----------------
    const NB = B.bins, counts = new Array(NB).fill(0), heights = new Array(NB).fill(0);
    const last = frames * n * 3;
    for (let i = 0; i < n; i++) {
      const y = pose[last + i * 3 + 1], m = Math.floor((pose[last + i * 3] - B.binL) / B.dx);
      if (m >= 0 && m < NB && y > B.binTop) { counts[m]++; heights[m] = Math.max(heights[m], B.floorY - (y - R)); }
    }
    let s0 = 0, s1 = 0, s2 = 0;
    counts.forEach((c, m) => { s0 += c; s1 += c * m; s2 += c * m * m; });
    const mu = s1 / s0, sd = Math.sqrt(s2 / s0 - mu * mu);
    // amplitude: least squares against the measured pile heights, so the curve rests on the marbles
    const gauss = (x) => Math.exp(-0.5 * ((x - mu) / sd) ** 2);
    let num = 0, den = 0;
    heights.forEach((h, m) => { const gm = gauss(m); num += h * gm; den += gm * gm; });
    const amp = num / den;
    const curveX = (u) => B.binL + (u + 0.5) * B.dx;                      // bin coordinate → px
    const curveY = (u) => B.floorY - amp * gauss(u) - 8;
    // the theory it approximates: 14 left/right coin flips → B(14, ½) ≈ N(7, 14/4), same area as the fit
    const muTh = B.rows / 2, sdTh = Math.sqrt(B.rows) / 2, ampTh = amp * sd / sdTh;
    const theoryY = (u) => B.floorY - ampTh * Math.exp(-0.5 * ((u - muTh) / sdTh) ** 2) - 8;
    this.stats = { mu, sd, counts };
    const xs = new Float32Array(n), ys = new Float32Array(n), an = new Float32Array(n);

    // ---------------- per frame ----------------
    this.render = (t) => {
      const f = t * FPS, i0 = Math.min(frames, Math.floor(f + 1e-6)), i1 = Math.min(frames, i0 + 1), k = clamp(f - i0);
      const o0 = i0 * n * 3, o1 = i1 * n * 3;
      live.setTransform(1, 0, 0, 1, 0, 0);
      live.clearRect(0, 0, W, H);
      for (let i = 0; i < n; i++) {           // pose at t: linear between the two baked frames around it
        let x = pose[o0 + i * 3], y = pose[o0 + i * 3 + 1], a = pose[o0 + i * 3 + 2];
        const x1 = pose[o1 + i * 3], y1 = pose[o1 + i * 3 + 1], a1 = pose[o1 + i * 3 + 2];
        if (Number.isNaN(x)) { x = x1; y = y1; a = a1; } else if (!Number.isNaN(x1)) {
          x = lerp(x, x1, k); y = lerp(y, y1, k);
          a += (((a1 - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) * k;   // shortest turn
        }
        xs[i] = x; ys[i] = y; an[i] = a;
      }
      const vis = (i) => !Number.isNaN(xs[i]) && ys[i] > -2 * R;
      // contact shadows first (light from the upper left), then the glass, its turning vane, the fixed gloss
      const ss = R * 2.9, h = SZ / 2;
      for (let i = 0; i < n; i++) if (vis(i)) live.drawImage(shadow, xs[i] + 3.2 - ss / 2, ys[i] + 4.2 - ss / 2, ss, ss);
      for (let i = 0; i < n; i++) {
        if (!vis(i)) continue;
        live.setTransform(1, 0, 0, 1, xs[i], ys[i]);
        live.drawImage(spr[sprOf[i]], -h, -h, SZ, SZ);
        const cs = Math.cos(an[i]), sn = Math.sin(an[i]);
        live.setTransform(cs, sn, -sn, cs, xs[i], ys[i]);
        live.drawImage(vane[sprOf[i]], -h, -h, SZ, SZ);
        live.setTransform(1, 0, 0, 1, xs[i], ys[i]);
        live.drawImage(gloss, -h, -h, SZ, SZ);
      }
      live.setTransform(1, 0, 0, 1, 0, 0);

      // ---- fx layer (above the glass): the curve, the counts, the label, the fades ----
      fx.setTransform(1, 0, 0, 1, 0, 0);
      fx.clearRect(0, 0, W, H);
      const cp = curveP(t);
      if (cp > 0) {
        const u0 = -0.5, u1 = NB - 0.5, ue = lerp(u0, u1, cp);
        const path = new Path2D();
        let first = true;
        for (let u = u0; u <= ue + 1e-9; u += 0.05) {
          const x = curveX(u), y = curveY(u);
          if (first) { path.moveTo(x, y); first = false; } else path.lineTo(x, y);
        }
        path.lineTo(curveX(ue), curveY(ue));
        // soft fill under the drawn part
        const fill = new Path2D(path);
        fill.lineTo(curveX(ue), B.floorY); fill.lineTo(curveX(u0), B.floorY); fill.closePath();
        const fg = fx.createLinearGradient(0, curveY(mu) - 20, 0, B.floorY);
        fg.addColorStop(0, `rgba(255,236,200,${(0.16 * cp).toFixed(3)})`); fg.addColorStop(1, 'rgba(255,236,200,0)');
        fx.fillStyle = fg; fx.fill(fill);
        fx.lineJoin = 'round'; fx.lineCap = 'round';
        fx.globalCompositeOperation = 'lighter';
        fx.strokeStyle = 'rgba(255,200,130,0.16)'; fx.lineWidth = 14; fx.stroke(path);
        fx.strokeStyle = 'rgba(255,214,160,0.35)'; fx.lineWidth = 6; fx.stroke(path);
        fx.globalCompositeOperation = 'source-over';
        fx.strokeStyle = 'rgba(255,250,238,0.96)'; fx.lineWidth = 2.6; fx.stroke(path);
        const ta = labelA(t);   // the binomial reference arrives with the label: faint, dashed
        if (ta > 0) {
          const th = new Path2D();
          for (let u = u0; u <= u1 + 1e-9; u += 0.05) (u === u0 ? th.moveTo(curveX(u), theoryY(u)) : th.lineTo(curveX(u), theoryY(u)));
          fx.setLineDash([7, 7]);
          fx.strokeStyle = `rgba(170,215,235,${(0.75 * ta).toFixed(3)})`; fx.lineWidth = 1.8; fx.stroke(th);
          fx.setLineDash([]);
        }
        if (cp < 1) {   // the pen
          const hx = curveX(ue), hy = curveY(ue);
          const hg = fx.createRadialGradient(hx, hy, 0, hx, hy, 26);
          hg.addColorStop(0, 'rgba(255,250,235,0.95)'); hg.addColorStop(0.2, 'rgba(255,220,160,0.5)'); hg.addColorStop(1, 'rgba(255,200,120,0)');
          fx.fillStyle = hg; fx.fillRect(hx - 26, hy - 26, 52, 52);
        }
        // bin counts, revealed as the pen passes
        fx.font = '600 22px "Pretendard Variable", sans-serif';
        fx.textAlign = 'center'; fx.textBaseline = 'middle';
        for (let m = 0; m < NB; m++) {
          const a = smooth((ue - m + 0.3) / 0.8);
          if (a <= 0) continue;
          fx.fillStyle = `rgba(255,232,190,${(0.85 * a).toFixed(3)})`;
          fx.fillText(String(counts[m]), curveX(m), PANEL.y1 + 26);
        }
      }
      const la = labelA(t);
      if (la > 0) {
        // upper left of the bins, where the piles stay low: never on top of the bell
        const px = B.binL + 26, py = 1236 - 10 * (1 - la);
        fx.textAlign = 'left'; fx.textBaseline = 'alphabetic';
        const pcx = px + 150, pcy = py + 30;
        const bd = fx.createRadialGradient(pcx, pcy, 0, pcx, pcy, 260);   // a soft dark pool behind the words
        bd.addColorStop(0, `rgba(30,14,4,${(0.6 * la).toFixed(3)})`); bd.addColorStop(1, 'rgba(30,14,4,0)');
        fx.save(); fx.translate(pcx, pcy); fx.scale(1, 0.5); fx.translate(-pcx, -pcy);
        fx.fillStyle = bd; fx.fillRect(pcx - 260, pcy - 260, 520, 520);
        fx.restore();
        fx.fillStyle = `rgba(20,8,0,${(0.5 * la).toFixed(3)})`;
        fx.font = '800 46px "Pretendard Variable", sans-serif';
        fx.fillText('정규분포', px + 2, py + 3);
        fx.fillStyle = `rgba(255,246,228,${la.toFixed(3)})`;
        fx.fillText('정규분포', px, py);
        fx.font = '600 25px "Pretendard Variable", sans-serif';
        fx.fillStyle = `rgba(255,226,180,${(0.85 * la).toFixed(3)})`;
        fx.fillText(`구슬 ${s0}개 · 실측 σ ${sd.toFixed(2)}칸`, px, py + 40);
        fx.fillStyle = `rgba(170,215,235,${(0.9 * la).toFixed(3)})`;
        fx.fillText(`- - 이론 B(${B.rows}, ½) σ ${sdTh.toFixed(2)}칸`, px, py + 74);
      }
      const dark = Math.max(fadeIn(t), fadeOut(t));
      if (dark > 0) { fx.fillStyle = `rgba(8,5,3,${dark.toFixed(3)})`; fx.fillRect(0, 0, W, H); }
    };
  },

  frame(t) { this.render(t); },
});
