/*
 * 95 · 다 같이, 멈춰 — closed-form physics on a kitchen table.
 *
 * A coin spins down like Euler's disk, a pea pod pops and sprays peas that bounce and roll, a late pea drops
 * into a spoon balanced on a chopstick rest, a pudding wobbles at every hit — and everything stops at the same
 * instant R, which the countdown knew from the first frame. Nothing is stepped or baked: every motion is a small
 * pure function of t (phys.js), and the event times — contacts, stop times, decay rates — are solved by formula
 * in setup (layout.js). After R the peas' strobe paths and the coin's contact spiral are drawn by evaluating the
 * same functions at many other times.
 *
 * Canvas 2D, one canvas. Ground points are in screen px (orthographic camera 40° above the table).
 */
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { TAU, SB, CB, LX, LZ, LIGHT, VIEW, dot, cross, norm, proj, projV, step } from './phys.js';
import { R, D, COIN, POD, PUD, SPOON, PEA_R, podSlot, spoonPoint, build } from './layout.js';

const INK = '#2B211B', CREAM = '#FFF6E8', TOMATO = '#E9483B';
const FONT = (w, px) => `${w} ${px}px "Pretendard Variable", sans-serif`;
const SFX = (px) => `${px}px "Do Hyeon", sans-serif`;
const HEAD_B = R + 0.95;

const mix = (a, b, k) => `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;
const pop = (s, f = 2.4, sig = 8.5) => step(s, TAU * f, sig);                    // UI spring (overshoots ~8 %)
const punch = (s) => (s <= 0 ? 0 : Math.exp(-7 * s) * Math.sin(TAU * 2.1 * s));
const outIn = (t, a, b) => ease.inCubic(clamp((t - a) / (b - a)));

// ------------------------------------------------------------------------------------------------ background
function bakeBackground() {
  const c = document.createElement('canvas');
  c.width = 1160; c.height = 2000;
  const g = c.getContext('2d');
  g.translate(40, 40);
  const r = rand(9501);
  const TOP = 470, FRONT = 1668;

  // wall: warm cream with soft stripes, darker toward the ceiling and into the table corner
  let gr = g.createLinearGradient(0, -40, 0, TOP);
  gr.addColorStop(0, '#EFD3B0'); gr.addColorStop(0.45, '#FAE6CA'); gr.addColorStop(1, '#F6DDBC');
  g.fillStyle = gr; g.fillRect(-40, -40, 1160, TOP + 40);
  for (let x = -40; x < 1120; x += 84) { g.fillStyle = 'rgba(214,160,104,0.10)'; g.fillRect(x, -40, 38, TOP + 40); }
  gr = g.createLinearGradient(0, TOP - 90, 0, TOP);
  gr.addColorStop(0, 'rgba(120,64,24,0)'); gr.addColorStop(1, 'rgba(120,64,24,0.22)');
  g.fillStyle = gr; g.fillRect(-40, TOP - 90, 1160, 90);

  // table top: planks across, grain, knots
  const plankH = 158, cols = [[218, 156, 96], [208, 144, 84], [222, 162, 102], [212, 150, 90]];
  for (let k = 0, y = TOP; y < FRONT; k++, y += plankH) {
    const h = Math.min(plankH, FRONT - y);
    g.fillStyle = mix(cols[k % 4], cols[k % 4], 0); g.fillRect(-40, y, 1160, h);
    for (let i = 0; i < 13; i++) {
      const y0 = y + 10 + r() * (h - 20), amp = 2 + r() * 6, f = 0.004 + r() * 0.006, ph = r() * TAU, light = r() < 0.4;
      g.strokeStyle = light ? `rgba(246,200,150,${0.18 + r() * 0.18})` : `rgba(150,86,40,${0.12 + r() * 0.16})`;
      g.lineWidth = 1.5 + r() * 2.5;
      g.beginPath();
      const x0 = -40 + r() * 400, x1 = x0 + 400 + r() * 800;
      for (let x = x0; x <= x1; x += 16) {
        const yy = y0 + amp * Math.sin(x * f + ph) + 1.5 * Math.sin(x * 0.03 + ph * 2);
        if (x === x0) g.moveTo(x, yy); else g.lineTo(x, yy);
      }
      g.stroke();
    }
    if (r() < 0.7) {
      const kx = 60 + r() * 960, ky = y + 30 + r() * (h - 60);
      for (let j = 0; j < 3; j++) {
        g.strokeStyle = `rgba(140,78,36,${0.22 - j * 0.05})`; g.lineWidth = 2;
        g.beginPath(); g.ellipse(kx, ky, 16 + j * 9, (5 + j * 4) * 0.9, 0, 0, TAU); g.stroke();
      }
    }
    g.fillStyle = 'rgba(120,64,26,0.5)'; g.fillRect(-40, y + h - 3, 1160, 3);   // seam
    g.fillStyle = 'rgba(255,214,160,0.25)'; g.fillRect(-40, y + h, 1160, 2);
  }
  // back edge highlight, lamp pool, front darkening
  g.fillStyle = '#F2C48E'; g.fillRect(-40, TOP - 2, 1160, 5);
  gr = g.createRadialGradient(610, 930, 40, 610, 930, 780);
  gr.addColorStop(0, 'rgba(255,232,182,0.55)'); gr.addColorStop(0.5, 'rgba(255,224,170,0.22)'); gr.addColorStop(1, 'rgba(255,220,160,0)');
  g.fillStyle = gr; g.fillRect(-40, TOP, 1160, FRONT - TOP);
  gr = g.createLinearGradient(0, 1250, 0, FRONT);
  gr.addColorStop(0, 'rgba(90,44,14,0)'); gr.addColorStop(1, 'rgba(90,44,14,0.22)');
  g.fillStyle = gr; g.fillRect(-40, 1250, 1160, FRONT - 1250);
  gr = g.createLinearGradient(0, TOP, 0, TOP + 120);
  gr.addColorStop(0, 'rgba(90,44,14,0.18)'); gr.addColorStop(1, 'rgba(90,44,14,0)');
  g.fillStyle = gr; g.fillRect(-40, TOP, 1160, 120);

  // front edge, apron, floor (dark, so the caption reads)
  g.fillStyle = '#EDB57C'; g.fillRect(-40, FRONT - 2, 1160, 6);
  gr = g.createLinearGradient(0, FRONT + 4, 0, FRONT + 52);
  gr.addColorStop(0, '#A3633A'); gr.addColorStop(1, '#7E4A29');
  g.fillStyle = gr; g.fillRect(-40, FRONT + 4, 1160, 48);
  gr = g.createLinearGradient(0, FRONT + 52, 0, 1960);
  gr.addColorStop(0, '#3E2617'); gr.addColorStop(1, '#22140C');
  g.fillStyle = gr; g.fillRect(-40, FRONT + 52, 1160, 1960 - FRONT - 52);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-40, FRONT + 52, 1160, 10);

  // pendant lamp (no brand): cord, cap, dome, lit opening; a soft cone of light
  const LXc = 846;
  gr = g.createLinearGradient(0, 240, 0, 1150);
  gr.addColorStop(0, 'rgba(255,240,200,0.32)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(LXc - 104, 246); g.lineTo(LXc + 104, 246); g.lineTo(LXc + 420, 1150); g.lineTo(LXc - 640, 1150); g.fill();
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(LXc, -40); g.lineTo(LXc, 112); g.stroke();
  g.fillStyle = '#244F4B'; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.roundRect(LXc - 22, 100, 44, 26, 8); g.fill(); g.stroke();
  g.beginPath();
  g.moveTo(LXc - 120, 238);
  g.bezierCurveTo(LXc - 116, 168, LXc - 70, 124, LXc, 122);
  g.bezierCurveTo(LXc + 70, 124, LXc + 116, 168, LXc + 120, 238);
  g.closePath();
  g.fillStyle = '#2F7F78'; g.fill(); g.stroke();
  g.strokeStyle = 'rgba(160,224,210,0.55)'; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(LXc - 84, 196); g.quadraticCurveTo(LXc - 74, 150, LXc - 34, 136); g.stroke();
  g.fillStyle = '#FFF0C2'; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.ellipse(LXc, 238, 120, 22, 0, 0, Math.PI); g.fill(); g.stroke();
  gr = g.createRadialGradient(LXc, 246, 4, LXc, 246, 150);
  gr.addColorStop(0, 'rgba(255,248,214,0.95)'); gr.addColorStop(0.35, 'rgba(255,236,180,0.35)'); gr.addColorStop(1, 'rgba(255,236,180,0)');
  g.fillStyle = gr; g.beginPath(); g.ellipse(LXc, 250, 170, 90, 0, 0, TAU); g.fill();
  return c;
}

function bakeVignette() {
  const c = document.createElement('canvas');
  c.width = 1080; c.height = 1920;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(560, 980, 520, 560, 980, 1250);
  gr.addColorStop(0, 'rgba(48,22,8,0)'); gr.addColorStop(1, 'rgba(48,22,8,0.34)');
  g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
  return c;
}

// ------------------------------------------------------------------------------------------------ drawing helpers
function softEllipse(ctx, cx, cy, ax, ay, bx, by, alpha, soft) {
  if (Math.abs(ax * by - ay * bx) < 4) return;
  ctx.save();
  ctx.transform(ax, ay, bx, by, cx, cy);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1 + soft);
  g.addColorStop(0, `rgba(84,40,12,${alpha})`);
  g.addColorStop(Math.max(0.01, (1 - soft) / (1 + soft)), `rgba(84,40,12,${alpha * 0.85})`);
  g.addColorStop(1, 'rgba(84,40,12,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-1 - soft, -1 - soft, 2 + 2 * soft, 2 + 2 * soft);
  ctx.restore();
}
/** polygon ellipse c + p·cosθ + q·sinθ (safe when it collapses to a line) */
function ellPath(ctx, cx, cy, px, py, qx, qy, n = 44) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, c = Math.cos(a), s = Math.sin(a);
    const x = cx + px * c + qx * s, y = cy + py * c + qy * s;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
/** tabular digits: each digit centred in a fixed cell */
function tabText(ctx, str, x, y, cell) {
  let px = x;
  for (const ch of str) {
    const w = ch === '.' ? cell * 0.42 : cell;
    ctx.fillText(ch, px + w / 2, y);
    px += w;
  }
  return px - x;
}
const tabWidth = (str, cell) => [...str].reduce((a, ch) => a + (ch === '.' ? cell * 0.42 : cell), 0);

// rotate v about unit axis k by angle a (Rodrigues)
function rot(v, k, a) {
  const c = Math.cos(a), s = Math.sin(a), kv = cross(k, v), d = dot(k, v) * (1 - c);
  return [v[0] * c + kv[0] * s + k[0] * d, v[1] * c + kv[1] * s + k[1] * d, v[2] * c + kv[2] * s + k[2] * d];
}

// ------------------------------------------------------------------------------------------------ the pea
const PEA_LIGHT = [186, 226, 120], PEA_MID = [124, 184, 66], PEA_DARK = [84, 140, 42];
const MARK0 = norm([0.25, 0.55, 0.8]), MARK1 = norm([-0.7, 0.2, -0.3]);
function drawPea(ctx, cx, cy, r, { sq = 0, vx = 0, vy = 0, axis = null, roll = 0, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  const sp = Math.hypot(vx, vy), k = Math.min(0.2, sp / 7500);
  if (k > 0.004) { const a = Math.atan2(vy, vx); ctx.rotate(a); ctx.scale(1 + k, 1 - k * 0.75); ctx.rotate(-a); }
  if (sq) { ctx.translate(0, r); ctx.scale(1 + 0.55 * sq, 1 - sq); ctx.translate(0, -r); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU);
  const g = ctx.createRadialGradient(-0.35 * r, -0.42 * r, 0.1 * r, 0, 0, r * 1.05);
  g.addColorStop(0, mix(PEA_LIGHT, PEA_LIGHT, 0)); g.addColorStop(0.55, mix(PEA_MID, PEA_MID, 0)); g.addColorStop(1, mix(PEA_DARK, PEA_DARK, 0));
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  // two marks on the skin turn with the roll (a pea has no texture, so these are what shows it rolling)
  for (const [m0, col, sz] of [[MARK0, 'rgba(70,118,34,0.85)', 0.2], [MARK1, 'rgba(222,244,180,0.8)', 0.13]]) {
    const m = axis ? rot(m0, axis, roll) : m0;
    const f = dot(m, VIEW);
    if (f <= 0.05) continue;
    const p = projV(m[0], m[1], m[2]);
    ctx.globalAlpha = alpha * clamp(f * 2.2);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(p[0] * r * 0.78, p[1] * r * 0.78, sz * r, sz * r * (0.35 + 0.65 * f), Math.atan2(p[1], p[0]) + Math.PI / 2, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(255,255,240,0.9)';
  ctx.beginPath(); ctx.ellipse(-0.38 * r, -0.44 * r, 0.17 * r, 0.11 * r, -0.7, 0, TAU); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------------------------------------ the coin
const GOLD_D = [178, 128, 40], GOLD_L = [250, 214, 110], RIM = '#A8741F';
const HALF = norm([LIGHT[0] + VIEW[0], LIGHT[1] + VIEW[1], LIGHT[2] + VIEW[2]]);
function coinFrame(c) {
  const { sinA, cosA, phi } = c;
  const n = [sinA * Math.cos(phi), cosA, sinA * Math.sin(phi)];
  const u = [cosA * Math.cos(phi), -sinA, cosA * Math.sin(phi)];       // in the coin, pointing at the contact
  const w = cross(n, u);
  const C = [COIN.x, COIN.a * sinA + (COIN.th / 2) * cosA, COIN.z];
  return { n, u, w, C };
}
function drawCoin(ctx, c) {
  const { n, u, w, C } = coinFrame(c);
  const a = COIN.a, th = COIN.th;
  const facing = dot(n, VIEW) >= 0 ? 1 : -1;
  const nv = n.map((v) => v * facing);
  const Pu = projV(u[0] * a, u[1] * a, u[2] * a), Pw = projV(w[0] * a, w[1] * a, w[2] * a);
  const tn = projV(nv[0] * th / 2, nv[1] * th / 2, nv[2] * th / 2);
  const c0 = proj(C[0], C[1], C[2]);
  const K = 5;
  ctx.beginPath();
  for (let k = 0; k <= K; k++) { const f = -1 + (2 * k) / K; ellPath(ctx, c0[0] + tn[0] * f, c0[1] + tn[1] * f, Pu[0], Pu[1], Pw[0], Pw[1]); }
  ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = RIM; ctx.fill();
  // the near face: lit by the lamp (Lambert), a glint when it tilts into the half-vector
  const fx = c0[0] + tn[0], fy = c0[1] + tn[1];
  const lam = Math.max(0, dot(nv, LIGHT)), spec = Math.pow(Math.max(0, dot(nv, HALF)), 26);
  ctx.beginPath(); ellPath(ctx, fx, fy, Pu[0], Pu[1], Pw[0], Pw[1]);
  ctx.fillStyle = mix(GOLD_D, GOLD_L, 0.25 + 0.75 * lam); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(43,33,27,0.75)'; ctx.stroke();
  const det = Pu[0] * Pw[1] - Pu[1] * Pw[0];
  const vis = clamp(Math.abs(det) / (a * a * 0.22));
  if (vis > 0.02) {
    ctx.save();
    ctx.transform(Pu[0], Pu[1], Pw[0], Pw[1], fx, fy);
    ctx.rotate(c.m);
    ctx.globalAlpha = vis;
    // raised rim ring + dots + a three-leaf sprig, each with a dark offset copy (embossed)
    const emb = (dx, dy, col) => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(dx, dy, 0.86, 0, TAU); ctx.arc(dx, dy, 0.78, 0, TAU, true); ctx.fill();
      for (let i = 0; i < 20; i++) { const q = (i / 20) * TAU; ctx.beginPath(); ctx.arc(dx + 0.68 * Math.cos(q), dy + 0.68 * Math.sin(q), 0.035, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(dx, dy - 0.3, 0.12, 0.26, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(dx - 0.2, dy + 0.02, 0.1, 0.22, -0.8, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(dx + 0.2, dy + 0.02, 0.1, 0.22, 0.8, 0, TAU); ctx.fill();
      ctx.fillRect(dx - 0.025, dy, 0.05, 0.46);
    };
    emb(0.035, 0.045, 'rgba(120,78,16,0.55)');
    emb(0, 0, mix(GOLD_D, GOLD_L, 0.45 + 0.55 * lam));
    if (spec > 0.01) {
      const hx = dot(HALF, u) * 0.55, hy = dot(HALF, w) * 0.55;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 0.7);
      g.addColorStop(0, `rgba(255,252,236,${0.9 * spec})`); g.addColorStop(1, 'rgba(255,252,236,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}
function coinShadow(ctx, c) {
  const { u, w, C } = coinFrame(c);
  const a = COIN.a;
  const sh = (v) => [v[0] + v[1] * LX, (v[2] + v[1] * LZ) * SB];
  const [cx, cy] = [C[0] + C[1] * LX, (C[2] + C[1] * LZ) * SB];
  const pu = sh(u.map((v) => v * a)), pw = sh(w.map((v) => v * a));
  softEllipse(ctx, cx, cy, pu[0], pu[1], pw[0], pw[1], 0.34, 0.16 + 0.18 * c.sinA);
}

// ------------------------------------------------------------------------------------------------ the spoon
function spoonBasis(theta) {
  const [ux, uz] = SPOON.dir;
  const Ps = projV(ux * Math.cos(theta), Math.sin(theta), uz * Math.cos(theta));
  const Pw = projV(-uz, 0, ux);
  const o = proj(SPOON.x, SPOON.hp, SPOON.z);
  return { Ps, Pw, o };
}
function spoonShape(ctx) {
  // local (s along the spoon, w across); bowl toward −s
  const { bowlS, bowlL, bowlW, handle } = SPOON;
  ctx.moveTo(bowlS + bowlL, 0);
  ctx.ellipse(bowlS, 0, bowlL, bowlW, 0, 0, TAU);
  ctx.moveTo(bowlS + bowlL - 6, -9);
  ctx.bezierCurveTo(-60, -7, -20, -9, 10, -10);
  ctx.bezierCurveTo(90, -12, handle - 60, -17, handle - 16, -17);
  ctx.arc(handle - 16, 0, 17, -Math.PI / 2, Math.PI / 2);
  ctx.bezierCurveTo(handle - 60, 17, 90, 12, 10, 10);
  ctx.bezierCurveTo(-20, 9, -60, 7, bowlS + bowlL - 6, 9);
  ctx.closePath();
}
function drawSpoon(ctx, theta) {
  const { Ps, Pw, o } = spoonBasis(theta);
  const path = (dy) => {
    ctx.save(); ctx.translate(0, dy); ctx.transform(Ps[0], Ps[1], Pw[0], Pw[1], o[0], o[1]);
    ctx.beginPath(); spoonShape(ctx);
    ctx.restore();
  };
  // thickness: a darker copy a little lower, then the top
  ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = INK;
  path(5); ctx.stroke(); ctx.fillStyle = '#7D8C99'; ctx.fill();
  path(0); ctx.stroke();
  const glint = clamp(0.5 + theta * 9);
  ctx.fillStyle = mix([176, 190, 202], [214, 224, 232], glint); ctx.fill();
  ctx.save();
  ctx.transform(Ps[0], Ps[1], Pw[0], Pw[1], o[0], o[1]);
  // the bowl's hollow, shaded like a dish; a highlight along the handle
  const { bowlS, bowlL, bowlW, handle } = SPOON;
  const g = ctx.createLinearGradient(bowlS, -bowlW, bowlS, bowlW);
  g.addColorStop(0, '#8E9EAD'); g.addColorStop(0.55, '#C7D3DD'); g.addColorStop(1, '#F2F6F9');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(bowlS + 2, 0, bowlL - 12, bowlW - 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${0.55 + 0.4 * glint})`;
  ctx.beginPath(); ctx.ellipse(handle * 0.52, -5, handle * 0.36, 3.2, -0.03, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bowlS - 20, -bowlW * 0.45, bowlL * 0.42, 5, -0.12, 0, TAU); ctx.fill();
  ctx.restore();
}
function spoonShadow(ctx, theta) {
  // the shadow is the spoon under another affine map: each point drops along the light by its height
  const [ux, uz] = SPOON.dir, c = Math.cos(theta), s = Math.sin(theta);
  const Ps = [ux * c + s * LX, (uz * c + s * LZ) * SB];
  const Pw = [-uz, ux * SB];
  const o = [SPOON.x + SPOON.hp * LX, (SPOON.z + SPOON.hp * LZ) * SB];
  ctx.save();
  ctx.transform(Ps[0], Ps[1], Pw[0], Pw[1], o[0], o[1]);
  ctx.beginPath(); spoonShape(ctx);
  ctx.restore();
  ctx.save();
  ctx.filter = 'blur(5px)';
  ctx.fillStyle = 'rgba(84,40,12,0.26)'; ctx.fill();
  ctx.restore();
}
function drawRest(ctx) {
  // a small celadon chopstick rest under the spoon's neck (a stack of capsules = its thickness)
  const [ux, uz] = SPOON.dir;
  const Pw = projV(-uz, 0, ux), Ps = projV(ux, 0, uz);
  const ground = proj(SPOON.x, 0, SPOON.z);
  const shape = (h) => {
    const cx = ground[0], cy = ground[1] - h * CB;
    ctx.save(); ctx.transform(Ps[0], Ps[1], Pw[0], Pw[1], cx, cy);
    ctx.roundRect(-16, -54, 32, 108, 16);
    ctx.restore();
  };
  ctx.beginPath(); for (let h = 0; h <= SPOON.hp - 6; h += 7) shape(h);
  ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = '#6FA894'; ctx.fill();
  ctx.beginPath(); shape(SPOON.hp - 6); ctx.fillStyle = '#A9D8C4'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(43,33,27,0.6)'; ctx.stroke();
}

// ------------------------------------------------------------------------------------------------ the pudding
function drawPudding(ctx, sx, sz, sq) {
  const gx = PUD.x, gy = PUD.z * SB;
  // plate
  ctx.beginPath(); ctx.ellipse(gx, gy + 9, PUD.plate, PUD.plate * SB, 0, 0, TAU);
  ctx.fillStyle = '#E2D3BE'; ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(gx, gy, PUD.plate, PUD.plate * SB, 0, 0, TAU);
  ctx.fillStyle = '#FFFBF3'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(gx, gy + 3, PUD.plate * 0.74, PUD.plate * 0.74 * SB, 0, 0, TAU);
  ctx.fillStyle = '#F3E8D8'; ctx.fill();
  softEllipse(ctx, gx + 30 * LX * 2, gy + 30 * LZ * SB, PUD.rb * 1.12, 0, 0, PUD.rb * SB * 1.1, 0.32, 0.25);
  // body: base stuck to the plate, top moved by the sway (sx, sz) and the squash
  const H = PUD.hgt * (1 + sq), rt = PUD.rt * (1 - 0.7 * sq), rb = PUD.rb;
  const by = gy + 2, tx = gx + sx, ty = gy + sz * SB - H * CB;
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(gx - rb, by);
    ctx.ellipse(gx, by, rb, rb * SB, 0, Math.PI, 0, true);
    ctx.quadraticCurveTo(gx + rb * 0.98 + sx * 0.4, (by + ty) / 2, tx + rt, ty);
    ctx.ellipse(tx, ty, rt, rt * SB, 0, 0, -Math.PI, true);
    ctx.quadraticCurveTo(gx - rb * 0.98 + sx * 0.4, (by + ty) / 2, gx - rb, by);
    ctx.closePath();
  };
  body();
  const g = ctx.createLinearGradient(gx - rb, 0, gx + rb, 0);
  g.addColorStop(0, '#FFE6A3'); g.addColorStop(0.5, '#F8CD6A'); g.addColorStop(1, '#E5A948');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  // caramel running down from the top, with drips
  ctx.beginPath();
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI - (i / n) * Math.PI;      // front half, left → right
    const drip = 16 + 16 * Math.pow(Math.max(0, Math.sin(a * 5 + 0.6)), 4);
    const x = tx + Math.cos(a) * (rt + 8), y = ty + Math.sin(a) * (rt * SB) + drip + 0.25 * (by - ty) * 0.2;
    if (i === 0) ctx.moveTo(x - 30, y - 60); ctx.lineTo(x, y);
  }
  ctx.lineTo(tx + rt + 40, ty - 80); ctx.closePath();
  ctx.fillStyle = '#9A4E1D'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(gx - rb * 0.55 + sx * 0.5, (by + ty) / 2 + 14, 7, (by - ty) * 0.3, 0.08, 0, TAU); ctx.fill();
  ctx.restore();
  body(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(tx, ty, rt, rt * SB, 0, 0, TAU);
  ctx.fillStyle = '#7C3A12'; ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = 'rgba(255,214,170,0.55)';
  ctx.beginPath(); ctx.ellipse(tx - rt * 0.3, ty - rt * SB * 0.25, rt * 0.34, rt * SB * 0.18, -0.15, 0, TAU); ctx.fill();
}

// ------------------------------------------------------------------------------------------------ the pod
function podBody(ctx) {
  ctx.moveTo(-150, 0);
  ctx.bezierCurveTo(-112, -50, 112, -50, 152, -6);
  ctx.bezierCurveTo(116, 46, -112, 46, -150, 0);
  ctx.closePath();
}
function drawPod(ctx, t, S, peaShown) {
  const o = S.lid(t), j = S.podJ(t);
  const cx = POD.X, cy = POD.Y - (POD.h + PEA_R) * CB;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(POD.ang + 0.02 * j);
  ctx.scale(1 - 0.025 * j, 1 + 0.06 * j);
  // lid (behind): the top half lifts and folds back
  ctx.save();
  ctx.translate(0, -44 * o); ctx.rotate(-0.06 * o); ctx.scale(1, 1 - 0.3 * clamp(o, 0, 1.2));
  ctx.beginPath();
  ctx.moveTo(-150, 0); ctx.bezierCurveTo(-112, -50, 112, -50, 152, -6);
  ctx.quadraticCurveTo(0, 6, -150, 0); ctx.closePath();
  ctx.fillStyle = o > 0.05 ? '#6AA53A' : '#7DB443'; ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fill();
  if (o > 0.05) {
    ctx.beginPath(); ctx.moveTo(-130, -2); ctx.quadraticCurveTo(0, -30, 136, -6); ctx.quadraticCurveTo(0, 2, -130, -2);
    ctx.fillStyle = '#CDE7A1'; ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(214,240,170,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-90, -24); ctx.quadraticCurveTo(0, -36, 80, -26); ctx.stroke();
  }
  ctx.restore();
  // base half with the cavity and the peas still in it
  ctx.beginPath();
  ctx.moveTo(-150, 0); ctx.quadraticCurveTo(0, 6, 152, -6);
  ctx.bezierCurveTo(116, 46, -112, 46, -150, 0); ctx.closePath();
  ctx.fillStyle = '#7DB443'; ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.fill();
  if (o > 0.05) {
    ctx.beginPath(); ctx.moveTo(-136, 2); ctx.quadraticCurveTo(0, -18, 140, -4); ctx.quadraticCurveTo(0, 40, -136, 2);
    ctx.fillStyle = '#B9DD86'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(43,33,27,0.55)'; ctx.stroke();
  }
  ctx.restore();
  // peas waiting in the pod (drawn upright in screen space at their slots)
  for (const i of peaShown) {
    const [x, z] = podSlot(i);
    const p = proj(x, POD.h + PEA_R, z);
    drawPea(ctx, p[0], p[1] + 4 * (1 - clamp(o)), PEA_R, {});
  }
  if (o < 0.05) {
    // closed: the seam over them
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(POD.ang + 0.02 * j); ctx.scale(1 - 0.025 * j, 1 + 0.06 * j);
    ctx.beginPath(); podBody(ctx); ctx.fillStyle = '#7DB443'; ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.fill();
    ctx.strokeStyle = 'rgba(214,240,170,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-96, -22); ctx.quadraticCurveTo(0, -34, 84, -24); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,100,30,0.55)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-140, 2); ctx.quadraticCurveTo(0, 8, 144, -4); ctx.stroke();
    ctx.restore();
  }
  // stem and sepals at the back end, a curl of tendril
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(POD.ang);
  ctx.translate(-150, 0);
  ctx.fillStyle = '#5E9433'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  for (const a of [-0.7, 0, 0.7]) { ctx.save(); ctx.rotate(Math.PI + a); ctx.beginPath(); ctx.moveTo(0, -9); ctx.quadraticCurveTo(22, -8, 30, 0); ctx.quadraticCurveTo(22, 8, 0, 9); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
  ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-40, -6, -58, -30); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.strokeStyle = '#5E9433'; ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(70,110,40,0.9)';
  ctx.beginPath(); ctx.moveTo(-58, -30); ctx.bezierCurveTo(-80, -52, -56, -76, -40, -60); ctx.bezierCurveTo(-30, -50, -44, -40, -50, -48); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------------------------------------ demo
defineDemo({
  id: '95-closed-form-physics',
  title: '다 같이, 멈춰',
  tech: '닫힌식 물리 · 시뮬레이션 없이 튕기고 흔들리기',
  duration: D,
  background: '#2a1a10',

  async setup(api) {
    await fontReady(FONT(900, 96), '언제멈출지처음부터안다시뮬레이션없이,식하나로정확히');
    await fontReady(FONT(700, 30), '식탁위실험정지까지초멈춤!전부0123456789.·');
    await fontReady(SFX(90), '뽁쏙!드르');
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    this.bg = bakeBackground();
    this.vig = bakeVignette();
    const S = (this.S = build());

    // puffs at every table contact: a few soft clouds sliding out with drag (x = v/k·(1 − e^(−ks)))
    const r = rand(9502);
    this.puffs = S.contacts.filter((c) => c.pea !== 4 && c.v > 140).map((c) => {
      const n = 4 + Math.round(c.v / 420), base = r() * TAU;
      return {
        c, parts: Array.from({ length: n }, (_, i) => ({
          ang: base + (i / n) * TAU + (r() - 0.5) * 0.7, sp: (0.18 + 0.32 * r()) * c.v * 0.45, life: 0.42 + 0.3 * r(),
          r0: 3 + 3 * r(), r1: (8 + 10 * r()) * (0.5 + c.v / 2400), hh: 6 + 20 * r(),
        })),
      };
    });
    // dust motes inside the lamp's cone
    this.motes = Array.from({ length: 30 }, () => {
      const y = 280 + r() * 820, k = (y - 246) / (1150 - 246);
      const x0 = lerp(846 - 104, 846 - 640, k), x1 = lerp(846 + 104, 846 + 420, k);
      return { x: lerp(x0, x1, 0.15 + 0.7 * r()), y, r: 1.6 + r() * 2.8, a: 0.35 + 0.5 * r(), vy: 4 + r() * 10, p1: r() * TAU, p2: r() * TAU, p3: r() * TAU };
    });
    this.bokeh = [[60, 1560, 70], [210, 1640, 46], [980, 1500, 84], [1040, 1250, 54], [900, 1650, 40], [-10, 1320, 60]].map(([x, y, rr]) => ({ x, y, r: rr, a: 0.07 + 0.08 * r(), p: r() * TAU }));
    // headline words
    ctx.font = FONT(900, 96);
    const lay = (lines) => lines.map((ln) => {
      let x = 0;
      return ln.map(([w, hl]) => { const o = { w, hl, x }; x += ctx.measureText(w).width + 26; return o; });
    });
    this.headA = lay([[['언제', 0], ['멈출지', 0]], [['처음부터', 1], ['안다', 0]]]);
    this.headB = lay([[['시뮬레이션', 0], ['없이,', 0]], [['식', 1], ['하나로', 1], ['정확히', 0]]]);
  },

  frame(t) {
    const ctx = this.ctx, S = this.S;
    // every frame starts from the default context state, so nothing (line caps, fonts, dashes) leaks between frames
    if (ctx.reset) ctx.reset();
    else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.setLineDash([]); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'; }

    // camera: slow push while things move, handheld that dies out exactly at R, small punches on the pops
    const push = t < R ? ease.inOutCubic(clamp(t / R)) : 1 - ease.inOutCubic(clamp((t - R - 0.5) / (D - R - 0.5)));
    const s = 1 + 0.045 * push + 0.01 * punch(t - POD.tPop) + 0.016 * punch(t - S.late.tLand);
    const hand = t < R ? 1 - smooth((t - (R - 1.6)) / 1.6) : 0;
    const hx = hand * (2.6 * Math.sin(1.1 * t + 0.3) + 1.3 * Math.sin(2.7 * t + 1.9));
    const hy = hand * (2.2 * Math.sin(0.9 * t + 2.2) + 1.1 * Math.sin(2.3 * t + 0.7));
    const hr = hand * 0.0018 * Math.sin(0.7 * t + 1.1);
    const FX = 560, FY = 1080;
    ctx.translate(FX + hx, FY + hy); ctx.rotate(hr); ctx.scale(s, s); ctx.translate(-FX, -FY);
    ctx.drawImage(this.bg, -40, -40);

    // ---------- state at t (all closed form)
    const coin = S.coin(t);
    const theta = S.spoon(t);
    const peas = S.peas.map((p, i) => ({ p, i, st: p.at(t) }));

    // ---------- shadows (all before any object)
    coinShadow(ctx, coin);
    {
      // pod shadow
      const c = Math.cos(POD.ang), sn = Math.sin(POD.ang), off = POD.h + PEA_R;
      softEllipse(ctx, POD.X + off * LX + 6, POD.Y + off * LZ * SB + 4, 150 * c, 150 * sn, -40 * sn, 40 * c, 0.3, 0.3);
    }
    softEllipse(ctx, PUD.x + 6, PUD.z * SB + 14, PUD.plate * 1.04, 0, 0, PUD.plate * SB * 1.08, 0.24, 0.22);
    spoonShadow(ctx, theta);
    softEllipse(ctx, SPOON.x - 4, SPOON.z * SB + 8, 34, 0, 0, 60 * SB, 0.28, 0.4);
    for (const { st, p } of peas) {
      if (st.phase === 'pod' || st.phase === 'in') continue;
      const h = st.h + PEA_R;
      const gx = st.x + h * LX, gy = (st.z + h * LZ) * SB;
      const k = 1 + st.h / 260;
      softEllipse(ctx, gx, gy, PEA_R * k, 0, 0, PEA_R * k * SB, 0.36 / (1 + st.h / 140), 0.3 + st.h / 500);
      if (st.h < 30) softEllipse(ctx, st.x, st.z * SB, PEA_R * 0.7, 0, 0, PEA_R * 0.7 * SB, 0.3 * (1 - st.h / 30), 0.2);
    }

    // ---------- the coin's contact point racing around (a smear on the table), whirr marks
    if (t < R) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const t0 = t - (i + 1) * 0.012, t1 = t - i * 0.012;
        if (t0 < 0) break;
        const a = S.coin(t0), b = S.coin(t1);
        const ra = COIN.a * a.cosA, rb = COIN.a * b.cosA;
        ctx.strokeStyle = `rgba(90,44,14,${0.3 * (1 - i / 12)})`; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(COIN.x + ra * Math.cos(a.phi), (COIN.z + ra * Math.sin(a.phi)) * SB);
        ctx.lineTo(COIN.x + rb * Math.cos(b.phi), (COIN.z + rb * Math.sin(b.phi)) * SB);
        ctx.stroke();
      }
    }

    // ---------- objects, back to front
    const items = [];
    const inPod = S.peas.filter((p) => t < p.tl).map((p) => p.slot);
    items.push({ z: POD.Y / SB, draw: () => drawPod(ctx, t, S, inPod) });
    items.push({ z: PUD.z, draw: () => drawPudding(ctx, S.pudX(t), S.pudZ(t), S.pudS(t)) });
    items.push({ z: COIN.z, draw: () => {
      // when the wobble outruns the frame rate, two faint echoes from earlier in this frame read as motion blur
      const blur = t < R ? clamp((coin.rate / TAU - 2.6) / 3) : 0;
      if (blur > 0) for (const k of [2, 1]) { ctx.globalAlpha = 0.22 * blur; drawCoin(ctx, S.coin(t - k / 100)); }
      ctx.globalAlpha = 1; drawCoin(ctx, coin);
    } });
    items.push({ z: SPOON.z, draw: () => { drawRest(ctx); drawSpoon(ctx, theta); } });
    for (const { st, p, i } of peas) {
      if (st.phase === 'pod') continue;
      if (st.phase === 'in') {
        // in the spoon: ride the bowl, roll back and forth along it
        const sl = SPOON.bowlS + S.rattle(t);
        const q = spoonPoint(sl, 0, theta, -6);
        const sc = proj(q.x, q.h + PEA_R, q.z);
        const sAfter = t - p.tLand;
        const sq = sAfter < 0.5 ? (0.42 * Math.exp(-14 * sAfter) * Math.cos(30 * sAfter)) : 0;
        const axis = [-SPOON.dir[1], 0, SPOON.dir[0]];
        items.push({ z: SPOON.z + 1, draw: () => drawPea(ctx, sc[0], sc[1], PEA_R, { sq, axis, roll: S.rattle(t) / PEA_R + 2.0 }) });
        continue;
      }
      const sc = proj(st.x, st.h + PEA_R, st.z);
      let sq = 0;
      for (const c of p.contacts) { const ds = t - c.t; if (ds >= 0 && ds < 0.4) sq += (c.v / 1500) * 0.36 * Math.exp(-16 * ds) * Math.cos(26 * ds); }
      const vx = p.ux * st.vh, vz = p.uz * st.vh;
      const vs = projV(vx, st.vy, vz);
      const axis = [-p.uz, 0, p.ux];
      items.push({ z: st.z, draw: () => drawPea(ctx, sc[0], sc[1], PEA_R, { sq: clamp(sq, -0.2, 0.42), vx: vs[0], vy: vs[1], axis, roll: st.d / PEA_R }) });
    }
    items.sort((a, b) => a.z - b.z);
    for (const it of items) it.draw();

    // ---------- whirr marks around the coin as it speeds up
    if (t < R && coin.rate > TAU * 2.4) {
      const k = clamp((coin.rate / TAU - 2.4) / 4);
      ctx.strokeStyle = `rgba(43,33,27,${0.6 * k})`; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (const off of [0.9, 0.9 + Math.PI]) {
        const a0 = coin.phi + off, len = 0.35 + 0.5 * k;
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
          const a = a0 - (i / 10) * len, rr = COIN.a * 1.32;
          const x = COIN.x + rr * Math.cos(a), y = (COIN.z + rr * Math.sin(a)) * SB - 12;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // ---------- puffs and impact ticks at the contacts (triggered exactly at the solved contact times)
    for (const { c, parts } of this.puffs) {
      const s0 = t - c.t;
      if (s0 < 0 || s0 > 0.8) continue;
      for (const q of parts) {
        if (s0 > q.life) continue;
        const d = (q.sp / 7) * (1 - Math.exp(-7 * s0));
        const x = c.x + d * Math.cos(q.ang), z = c.z + d * Math.sin(q.ang), h = q.hh * (1 - Math.exp(-4 * s0));
        const p = proj(x, h + 4, z);
        const rr = lerp(q.r0, q.r1, 1 - Math.exp(-6 * s0));
        ctx.fillStyle = `rgba(255,243,222,${0.7 * Math.pow(1 - s0 / q.life, 1.5)})`;
        ctx.beginPath(); ctx.ellipse(p[0], p[1], rr, rr * 0.8, 0, 0, TAU); ctx.fill();
      }
      if (c.n === 0 && s0 < 0.2) {
        const k = s0 / 0.2, gp = proj(c.x, 0, c.z);
        ctx.strokeStyle = `rgba(43,33,27,${0.85 * (1 - k)})`; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (const a of [-2.6, -2.0, -1.15, -0.55]) {
          const r0 = 30 + 30 * k, r1 = r0 + 16;
          ctx.beginPath(); ctx.moveTo(gp[0] + r0 * Math.cos(a), gp[1] + r0 * Math.sin(a) * 0.8); ctx.lineTo(gp[0] + r1 * Math.cos(a), gp[1] + r1 * Math.sin(a) * 0.8); ctx.stroke();
        }
      }
    }

    // ---------- dust in the lamp light — it freezes at R with everything else (its clock is min(t, R))
    {
      const tm = Math.min(t, R);
      for (const m of this.motes) {
        const x = m.x + 16 * Math.sin(0.45 * tm + m.p1), y = m.y - m.vy * tm + 7 * Math.sin(0.8 * tm + m.p2);
        const a = m.a * (0.55 + 0.45 * Math.sin(1.4 * tm + m.p3));
        ctx.fillStyle = `rgba(255,246,214,${a * 0.35})`; ctx.beginPath(); ctx.arc(x, y, m.r * 2.6, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,250,232,${a})`; ctx.beginPath(); ctx.arc(x, y, m.r, 0, TAU); ctx.fill();
      }
    }

    // ---------- R: everything stops — rings on the table under each thing
    if (t >= R && t < R + 0.9) {
      const k = (t - R) / 0.9, e = ease.outCubic(k);
      const bw = spoonPoint(SPOON.bowlS, 0, 0);
      const rings = [[COIN.x, COIN.z, 70, 200], [PUD.x, PUD.z, 120, 230], [bw.x, bw.z, 60, 170]];
      for (const p of S.peas.slice(0, 4)) rings.push([p.target[0], p.target[1], 20, 90]);
      ctx.strokeStyle = `rgba(255,246,224,${0.9 * (1 - k)})`; ctx.lineWidth = 5 * (1 - k) + 1;
      for (const [x, z, r0, r1] of rings) {
        const rr = lerp(r0, r1, e);
        ctx.beginPath(); ctx.ellipse(x, z * SB, rr, rr * SB, 0, 0, TAU); ctx.stroke();
      }
    }

    // ---------- after R: the strobe — the same functions evaluated at many other times
    if (t >= R) this.drawReveal(ctx, t);

    // ---------- the whirr, spelled out: it grows and shakes harder as Ω climbs, and is cut dead at R
    if (t > 3.9 && t < R) {
      const k = clamp((t - 3.9) / (R - 3.9)), word = '드르르르르르'.slice(0, 3 + Math.floor(k * 3.99));
      const amp = 1.5 + 6 * k * k, rate = coin.rate;
      ctx.save();
      ctx.font = SFX(54 + 20 * k); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
      const x0 = COIN.x - 150, y0 = COIN.z * SB - 205;
      ctx.globalAlpha = clamp((t - 3.9) / 0.3);
      let x = x0;
      [...word].forEach((ch, i) => {
        const jx = amp * Math.sin(rate * 0.9 * t + i * 2.1), jy = amp * Math.cos(rate * 1.13 * t + i * 1.3);
        ctx.save(); ctx.translate(x + jx, y0 + jy - i * 4); ctx.rotate(0.06 * Math.sin(rate * 0.7 * t + i));
        ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.strokeText(ch, 0, 0);
        ctx.fillStyle = CREAM; ctx.fillText(ch, 0, 0);
        ctx.restore();
        x += ctx.measureText(ch).width * 0.86;
      });
      ctx.restore();
    }

    // ---------- foreground bokeh (out of focus, nearer than the table) — also frozen at R
    {
      const tm = Math.min(t, R);
      for (const b of this.bokeh) {
        const x = b.x + 10 * Math.sin(0.3 * tm + b.p), y = b.y - 4 * tm;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, `rgba(255,236,196,${b.a})`); g.addColorStop(0.7, `rgba(255,236,196,${b.a * 0.75})`); g.addColorStop(1, 'rgba(255,236,196,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, b.r, 0, TAU); ctx.fill();
      }
    }

    // ---------- sound words
    this.sfx(ctx, t, '뽁!', POD.X + 150, POD.Y - 190, POD.tPop, 1.3, 96, -10);
    this.sfx(ctx, t, '뽁', POD.X - 70, POD.Y + 190, POD.tPop2, 2.95, 72, 8);
    { const b = spoonPoint(SPOON.bowlS, 0, 0); const p = proj(b.x, b.h, b.z); this.sfx(ctx, t, '쏙!', p[0] + 10, p[1] - 130, S.late.tLand, 4.1, 92, -8); }

    // ---------- screen space: vignette, words, countdown, flash
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.vig, 0, 0);
    this.drawText(ctx, t);
    if (t >= R && t < R + 0.5) {
      ctx.fillStyle = `rgba(255,246,226,${0.3 * Math.exp(-(t - R) / 0.1)})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  },

  sfx(ctx, t, word, x, y, t0, t1, px, deg) {
    const s = t - t0;
    if (s < 0 || t > t1) return;
    const p = pop(s, 2.6, 7.5), out = outIn(t, t1 - 0.22, t1);
    ctx.save();
    ctx.translate(x, y - 30 * out); ctx.rotate((deg * Math.PI) / 180); ctx.scale(0.4 + 0.6 * p, 0.4 + 0.6 * p);
    ctx.globalAlpha = clamp(s / 0.06) * (1 - out);
    ctx.font = SFX(px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.fillStyle = INK; ctx.fillText(word, 5, 7);
    ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.strokeText(word, 0, 0);
    ctx.fillStyle = TOMATO; ctx.fillText(word, 0, 0);
    ctx.restore();
  },

  drawReveal(ctx, t) {
    // at R the flash "takes the picture": every pea at every 1/20 s, the same pure functions evaluated at other times
    const S = this.S, s0 = t - R;
    const fade = clamp(s0 / 0.12) * (1 - 0.4 * smooth((t - (D - 2.4)) / 2));
    ctx.save();
    ctx.fillStyle = `rgba(52,24,8,${0.2 * clamp(s0 / 0.3)})`;
    ctx.fillRect(-60, 468, 1200, 1202);
    S.peas.forEach((p, i) => {
      const tEnd = i === 4 ? p.tLand : R;
      ctx.setLineDash([2, 11]); ctx.lineCap = 'round'; ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(255,246,226,${0.8 * fade})`;
      ctx.beginPath();
      for (let k = 0, n = Math.ceil((tEnd - p.tl) * 120); k <= n; k++) {
        const st = p.at(Math.min(p.tl + k / 120, tEnd - 1e-6)), q = proj(st.x, st.h + PEA_R, st.z);
        if (k === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke(); ctx.setLineDash([]);
      let lx = 1e9, ly = 1e9;
      for (let tt = p.tl + 1 / 12; tt < tEnd - 0.04; tt += 1 / 12) {
        const st = p.at(tt), q = proj(st.x, st.h + PEA_R, st.z);
        if (Math.hypot(q[0] - lx, q[1] - ly) < 30) continue;     // the slow end of a roll piles up: keep it legible
        lx = q[0]; ly = q[1];
        ctx.beginPath(); ctx.arc(q[0], q[1], PEA_R - 1, 0, TAU);
        ctx.fillStyle = `rgba(214,240,170,${0.2 * fade})`; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(255,248,232,${0.7 * fade})`; ctx.stroke();
      }
    });
    // every contact the formulas found: a ring where it touched
    for (const c of S.contacts) {
      if (c.pea === 4) continue;
      const q = proj(c.x, 0, c.z);
      ctx.strokeStyle = `rgba(255,236,190,${0.95 * fade})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(q[0], q[1], 13, 13 * SB, 0, 0, TAU); ctx.stroke();
    }
    // one pea's contact times, popping in one after another (a geometric series: each hop e× shorter)
    ctx.font = FONT(800, 25); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    S.peas[1].contacts.slice(0, 4).forEach((c, k) => {
      const sp = t - (R + 0.55 + 0.16 * k);
      if (sp < 0) return;
      const q = proj(c.x, 0, c.z), lab = c.t.toFixed(2);
      const dy = [46, 46, 96, 46][k], dx = [0, 0, 0, 40][k];
      const pp = pop(sp, 2.6, 8);
      ctx.globalAlpha = clamp(sp / 0.08) * fade;
      ctx.strokeStyle = 'rgba(255,236,190,0.9)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(q[0], q[1] + 6); ctx.lineTo(q[0] + dx, q[1] + dy - 18); ctx.stroke();
      ctx.save(); ctx.translate(q[0] + dx, q[1] + dy); ctx.scale(pp, pp);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-44, -18, 88, 36, 18); ctx.fill();
      ctx.fillStyle = '#FFE7B0'; ctx.textAlign = 'center';
      tabText(ctx, lab, -tabWidth(lab, 17) / 2 - 7, 1, 17);
      ctx.font = FONT(700, 18); ctx.fillText('초', tabWidth(lab, 17) / 2 + 4, 1); ctx.font = FONT(800, 25);
      ctx.restore();
      ctx.globalAlpha = 1;
    });
    // the coin: where its edge touched the table, swept in after the stop — the spiral tightens toward the end
    {
      const C = S.coin, k = ease.inOutCubic(clamp((s0 - 0.15) / 1.3));
      const ph1 = lerp(C.phi0, C.phiEnd, k);
      if (k > 0) {
        ctx.strokeStyle = `rgba(255,244,214,${0.75 * fade})`; ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let ph = C.phi0, first = true; ph <= ph1; ph += 0.06, first = false) {
          const rr = COIN.a * C.cosAtPhi(ph);
          const x = COIN.x + rr * Math.cos(ph), y = (COIN.z + rr * Math.sin(ph)) * SB - COIN.th * CB;
          if (first) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawText(ctx, t) {
    ctx.save();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const X0 = 72;
    // kicker
    const ka = clamp((t - 0.05) / 0.3) * (1 - outIn(t, R + 0.3, R + 0.55)) + clamp((t - HEAD_B + 0.1) / 0.3);
    ctx.globalAlpha = clamp(ka);
    ctx.font = FONT(700, 30); ctx.letterSpacing = '2px'; ctx.fillStyle = '#9A5A2E';
    ctx.fillText(t < R + 0.6 ? '식탁 위 실험' : '실험 결과', X0, 104);
    ctx.letterSpacing = '0px';
    // headline A (in with a spring, word by word), then B after the stop
    const head = (lines, t0, tOut) => {
      ctx.font = FONT(900, 96);
      let j = 0;
      lines.forEach((ln, li) => ln.forEach((wd) => {
        const s0 = t - (t0 + j * 0.09); j++;
        if (s0 < 0) return;
        const p = pop(s0, 2.3, 8), out = tOut ? outIn(t, tOut + j * 0.03, tOut + j * 0.03 + 0.22) : 0;
        ctx.globalAlpha = clamp(s0 / 0.1) * (1 - out);
        const y = 214 + li * 110 + (1 - p) * 50 - out * 40;
        ctx.fillStyle = wd.hl ? TOMATO : INK;
        ctx.fillText(wd.w, X0 + wd.x, y);
      }));
    };
    if (t < R + 0.8) head(this.headA, 0.12, R + 0.3);
    if (t > HEAD_B) head(this.headB, HEAD_B, 0);
    ctx.globalAlpha = 1;
    // countdown chip — the stop time R is known from the first frame
    const cp = pop(t - 0.5, 2.4, 8);
    if (t > 0.5) {
      const stopped = t >= R;
      const flip = t >= R && t < R + 0.16 ? Math.abs(Math.cos(((t - R) / 0.16) * Math.PI)) : 1;
      ctx.save();
      ctx.translate(X0, 400); ctx.scale(0.6 + 0.4 * cp, (0.6 + 0.4 * cp) * flip); ctx.globalAlpha = clamp((t - 0.5) / 0.1);
      const showStop = stopped && t >= R + 0.08;
      const Wc = showStop ? 392 : 372, Hc = 76;
      ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(4, -Hc / 2 + 7, Wc, Hc, 38); ctx.fill();
      ctx.fillStyle = showStop ? TOMATO : '#FFF8EC'; ctx.beginPath(); ctx.roundRect(0, -Hc / 2, Wc, Hc, 38); ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      // a little dial: the remaining fraction of the wait
      const rem = clamp((R - t) / R);
      ctx.fillStyle = showStop ? CREAM : '#F3DDBF'; ctx.beginPath(); ctx.arc(40, 0, 22, 0, TAU); ctx.fill();
      if (!showStop) { ctx.fillStyle = TOMATO; ctx.beginPath(); ctx.moveTo(40, 0); ctx.arc(40, 0, 22, -Math.PI / 2, -Math.PI / 2 + rem * TAU); ctx.closePath(); ctx.fill(); }
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(40, 0, 22, 0, TAU); ctx.stroke();
      if (showStop) { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(30, 1); ctx.lineTo(38, 9); ctx.lineTo(52, -8); ctx.stroke(); }
      ctx.textBaseline = 'middle';
      if (!showStop) {
        ctx.fillStyle = INK; ctx.font = FONT(700, 30); ctx.fillText('정지까지', 78, 2);
        ctx.font = FONT(900, 44); ctx.textAlign = 'center';
        const v = Math.max(0, R - t).toFixed(2);
        tabText(ctx, v, 214, 3, 27);
        ctx.textAlign = 'left'; ctx.font = FONT(700, 30); ctx.fillText('초', 214 + tabWidth(v, 27) + 6, 2);
      } else {
        ctx.fillStyle = CREAM; ctx.font = FONT(900, 40); ctx.fillText('멈춤!', 78, 2);
        ctx.font = FONT(700, 30); ctx.textAlign = 'left';
        ctx.fillText(`${R.toFixed(2)}초에 전부`, 186, 2);
      }
      ctx.restore();
    }
    ctx.restore();
  },
});
