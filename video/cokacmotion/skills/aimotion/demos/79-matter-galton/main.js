/*
 * 79 · 갈톤 보드 — a Galton board (bean machine) as a clean infographic.
 *
 * matter-js does the physics, all of it in setup(): sim.js steps the engine with a fixed dt (Engine.update, 3 steps
 * per 1/60 s), records every ball's x, y per 1/60 s frame into one Float32Array and throws the engine away.
 * frame(t) only reads that table (linear between the two recorded frames around t), so any t is drawn directly.
 *
 * Canvas 2D on top: a paper background with a count axis (painted once), pegs that pop in row by row, dividers that
 * grow from the floor, the balls in two colour strata (the order they sat in the hopper), one chosen ball in coral
 * with its path and the pegs it struck, live counts over the bins, and at the end the normal curve N(np, np(1−p))
 * for n = 14, p = ½ drawn over the stacks with the formula and the measured mean and variance.
 */
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { bake, BOARD as B, pegs, dividers, hopperLeft, GATE_T, FPS } from './sim.js';

const D = 10;
const C = {
  paper: '#f3eee4', ink: '#1d2330', ink2: '#4b5161', mute: '#8e929b', faint: '#d9d1c1',
  coral: '#e8573f', navy: '#26364f', steel: '#86a9c6', tint: '#ebe3d4',
};
const font = (w, px) => `${w} ${px}px "Pretendard Variable", sans-serif`;
const NB = B.bins, MU = B.rows / 2, SIG = Math.sqrt(B.rows) / 2;   // B(14, ½): μ = np = 7, σ = √(np(1−p)) ≈ 1.87

// ---- timeline (s) ----
const T = {
  peg0: 0.04, pegStep: 0.034, pegDur: 0.34,     // pegs pop in row by row
  div0: 0.22, divDur: 0.6,                       // dividers grow up from the floor
  head1: 0.08,                                   // "우연이 모이면"
  gate0: 0.34,                                   // the gate slides away (physics removes it at GATE_T)
  curve0: 7.05, curve1: 8.4,                     // the normal curve sweeps left → right
  head2: 7.75,                                   // "질서가 된다"
  card: 8.2,                                     // formula card
};
const pop = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : ease.outBack(p, 2.2));
const phi = (z) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);

defineDemo({
  id: '79-matter-galton',
  title: '갈톤 보드',
  tech: 'matter-js 강체 물리 · 고정 dt 굽기 · 이항분포 → 정규분포',
  duration: D,
  background: C.paper,

  async setup({ canvas, W, H, headless }) {
    await fontReady(font(800, 60), '우연이 모이면 질서가 된다');
    await fontReady(font(600, 20), '착지한 공 개 한 개의 공 오른쪽 왼쪽 번 칸 실측 튄 횟수 μσ√≈½²→·−0123456789');

    // ---------------- bake ----------------
    const sim = bake(window.Matter, { rand, seed: 79, duration: D });
    const { pos, frames, n, bin, band } = sim;
    this.bakeMs = sim.ms;

    // outcome statistics (final frame)
    const counts = new Array(NB).fill(0);
    for (let i = 0; i < n; i++) if (bin[i] >= 0) counts[bin[i]]++;
    const arrived = counts.reduce((a, b) => a + b, 0);
    let s1 = 0, s2 = 0;
    counts.forEach((c, m) => { s1 += c * m; s2 += c * m * m; });
    const muM = s1 / arrived, varM = s2 / arrived - muM * muM;
    // stack height per ball: least squares (through 0) of measured pile heights against counts
    const last = frames * n * 2;
    const top = new Array(NB).fill(B.floorY);
    for (let i = 0; i < n; i++) if (bin[i] >= 0) top[bin[i]] = Math.min(top[bin[i]], pos[last + i * 2 + 1] - B.r);
    let num = 0, den = 0;
    counts.forEach((c, m) => { if (c >= 6) { num += (B.floorY - top[m]) * c; den += c * c; } });
    const hPer = num / den;
    this.stats = { counts, arrived, mu: muM, sd: Math.sqrt(varM), hPer, bakeMs: sim.ms };

    // the chosen ball: one of the first through the neck that lands off-centre (its path is easy to follow)
    const exitF = new Int32Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      for (let f = 0; f <= frames; f++) if (pos[(f * n + i) * 2 + 1] > B.lipY + 8) { exitF[i] = f; break; }
    }
    const order = [...Array(n).keys()].filter((i) => exitF[i] >= 0).sort((a, b) => exitF[a] - exitF[b] || a - b);
    const hero = order.slice(0, 12).find((i) => bin[i] >= 5 && bin[i] <= 9 && bin[i] !== MU) ?? order[0];
    // it has come to rest at the first frame inside a bin after which it moves < 0.6 px per frame for a quarter second
    const step = (f) => { const a = (f * n + hero) * 2, b = ((f - 1) * n + hero) * 2; return Math.hypot(pos[a] - pos[b], pos[a + 1] - pos[b + 1]); };
    let restF = frames;
    for (let f = exitF[hero] + 1; f <= frames - 15; f++) {
      if (pos[(f * n + hero) * 2 + 1] < B.binTop) continue;
      let still = true;
      for (let q = f; q < f + 15 && still; q++) still = step(q + 1) < 0.6;
      if (still) { restF = f; break; }
    }
    const trail0 = Math.max(0, exitF[hero] - 10);
    const heroBin = bin[hero];
    // pegs it strikes (and when)
    const PEGS = pegs();
    const hitF = PEGS.map((p) => {
      for (let f = exitF[hero]; f <= restF; f++) {
        const a = (f * n + hero) * 2;
        if (Math.hypot(pos[a] - p.x, pos[a + 1] - p.y) < B.r + B.pegR + 1.6) return f;
      }
      return -1;
    });

    // ---------------- static paper: grid, count axis, hopper, walls, floor, footer ----------------
    const bg = document.createElement('canvas');
    bg.width = W; bg.height = H;
    {
      const g = bg.getContext('2d');
      g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(29,35,48,0.075)';
      for (let y = 26; y < 1622; y += 26) for (let x = 26; x < W; x += 26) g.fillRect(x - 1, y - 1, 2, 2);
      // count axis: dashed gridlines every 20 balls (heights from the fitted height-per-ball)
      g.font = font(600, 17); g.textAlign = 'right'; g.textBaseline = 'middle';
      for (let c = 20; c * hPer < B.floorY - B.binTop - 30; c += 20) {
        const y = Math.round(B.floorY - c * hPer) + 0.5;
        g.strokeStyle = C.faint; g.lineWidth = 1.5; g.setLineDash([4, 7]);
        g.beginPath(); g.moveTo(B.binL, y); g.lineTo(B.binR, y); g.stroke(); g.setLineDash([]);
        g.strokeStyle = C.mute; g.lineWidth = 2;
        g.beginPath(); g.moveTo(B.binL - 16, y); g.lineTo(B.binL - 6, y); g.stroke();
        g.fillStyle = C.mute; g.fillText(`${c}개`, B.binL - 22, y);
      }
      // hopper: a tinted container with an ink rim
      const hl = hopperLeft(), hr = hl.map(([x, y]) => [2 * B.cx - x, y]).reverse();
      const rim = [...hl, ...hr];
      g.fillStyle = C.tint;
      g.beginPath(); rim.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y))); g.fill();
      g.strokeStyle = C.ink; g.lineWidth = 5; g.lineJoin = 'round'; g.lineCap = 'round';
      for (const side of [hl, hr]) { g.beginPath(); side.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
      // side walls of the field and the floor
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(B.binL - 2, B.pegY0 - 40); g.lineTo(B.binL - 2, B.floorY + 2); g.lineTo(B.binR + 2, B.floorY + 2); g.lineTo(B.binR + 2, B.pegY0 - 40); g.stroke();
      // bin numbers and what they count
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.font = font(700, 19); g.fillStyle = C.ink2;
      for (let m = 0; m < NB; m++) g.fillText(String(m), B.binL + (m + 0.5) * B.dx, B.floorY + 32);
      g.font = font(500, 17); g.fillStyle = C.mute; g.textAlign = 'right';
      g.fillText('k = 오른쪽으로 튄 횟수', B.binR, B.floorY + 60);
      // footer band for the caption
      g.fillStyle = C.ink; g.fillRect(0, 1636, W, H - 1636);
      g.fillStyle = C.coral; g.fillRect(64, 1700, 56, 5);
    }

    // ---------------- ball sprites (drawn at 3×, scaled down: smooth edges) ----------------
    const SS = 3, SZ = Math.ceil(B.r * 2 + 4);
    const sprite = (fill, ring) => {
      const c = document.createElement('canvas'); c.width = c.height = SZ * SS;
      const g = c.getContext('2d'); g.scale(SS, SS);
      const m = SZ / 2;
      g.fillStyle = fill; g.beginPath(); g.arc(m, m, B.r, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.26)'; g.beginPath(); g.arc(m - B.r * 0.3, m - B.r * 0.34, B.r * 0.36, 0, Math.PI * 2); g.fill();
      if (ring) { g.strokeStyle = ring; g.lineWidth = 1.6; g.beginPath(); g.arc(m, m, B.r - 0.4, 0, Math.PI * 2); g.stroke(); }
      return c;
    };
    const SPR = [sprite(C.navy), sprite(C.steel)];
    const HERO = sprite(C.coral, '#fff');

    const fast = headless ? { willReadFrequently: true } : undefined;
    const ctx = canvas({ type: '2d', z: 0, attrs: fast }).ctx;
    const DV = dividers();
    const xs = new Float32Array(n), ys = new Float32Array(n);
    const live = new Array(NB).fill(0);
    const binX = (m) => B.binL + (m + 0.5) * B.dx;
    const curveY = (u) => B.floorY - hPer * arrived * phi((u - MU) / SIG) / SIG;
    const fmt = (v, d = 2) => v.toFixed(d);

    // a rounded card with an ink rim
    const card = (x, y, w, h, a) => {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(29,35,48,0.10)';
      ctx.beginPath(); ctx.roundRect(x + 5, y + 7, w, h, 16); ctx.fill();
      ctx.fillStyle = '#fbf8f2'; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill(); ctx.stroke();
      ctx.restore();
    };

    this.render = (t) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(bg, 0, 0);

      // ---- dividers grow from the floor ----
      const dp = ease.outCubic(clamp((t - T.div0) / T.divDur));
      if (dp > 0) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = B.divW; ctx.lineCap = 'round';
        ctx.beginPath();
        for (let m = 1; m < DV.length - 1; m++) {
          const d = ease.outCubic(clamp((t - T.div0 - Math.abs(m - NB / 2) * 0.02) / T.divDur));
          ctx.moveTo(DV[m], B.floorY); ctx.lineTo(DV[m], lerp(B.floorY, B.binTop, d));
        }
        ctx.stroke();
      }
      // ---- pegs pop in row by row; the chosen ball's pegs turn coral as it strikes them ----
      const fNow = t * FPS;
      ctx.beginPath();
      for (const p of PEGS) {
        if (!p.core) continue;
        const s = pop((t - T.peg0 - p.k * T.pegStep) / T.pegDur);
        if (s > 0) { ctx.moveTo(p.x + B.pegR * s, p.y); ctx.arc(p.x, p.y, B.pegR * s, 0, Math.PI * 2); }
      }
      ctx.fillStyle = C.ink; ctx.fill();
      ctx.beginPath();
      for (const p of PEGS) {
        if (p.core) continue;
        const s = pop((t - T.peg0 - p.k * T.pegStep) / T.pegDur);
        if (s > 0) { ctx.moveTo(p.x + B.pegR * s, p.y); ctx.arc(p.x, p.y, B.pegR * s, 0, Math.PI * 2); }
      }
      ctx.fillStyle = '#b4ad9f'; ctx.fill();
      PEGS.forEach((p, j) => {
        if (hitF[j] < 0 || fNow < hitF[j]) return;
        const a = clamp((fNow - hitF[j]) / 6);
        const ring = B.pegR + 3 + 6 * (1 - ease.outCubic(clamp((fNow - hitF[j]) / 10)));
        ctx.strokeStyle = C.coral; ctx.lineWidth = 2.5; ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, ring, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(p.x, p.y, B.pegR, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ---- the gate slides out of the neck ----
      if (t < GATE_T) {
        const g = ease.inCubic(clamp((t - T.gate0) / (GATE_T - T.gate0)));
        ctx.globalAlpha = 1 - g;
        ctx.fillStyle = C.coral;
        ctx.beginPath(); ctx.roundRect(B.cx - B.neckHalf - 8 + g * 120, B.lipY + 1, B.neckHalf * 2 + 16, 11, 5.5); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ---- ball poses at t: linear between the recorded frames around it ----
      const f = clamp(t, 0, D) * FPS, i0 = Math.min(frames, Math.floor(f + 1e-6)), i1 = Math.min(frames, i0 + 1), k = clamp(f - i0);
      const o0 = i0 * n * 2, o1 = i1 * n * 2;
      live.fill(0);
      let landed = 0;
      for (let i = 0; i < n; i++) {
        const x = lerp(pos[o0 + i * 2], pos[o1 + i * 2], k), y = lerp(pos[o0 + i * 2 + 1], pos[o1 + i * 2 + 1], k);
        xs[i] = x; ys[i] = y;
        if (y > B.binTop + B.r) { landed++; live[clamp(Math.floor((x - B.binL) / B.dx), 0, NB - 1)]++; }
      }

      // ---- the chosen ball's path (under the balls) ----
      if (fNow > trail0) {
        const fe = Math.min(f, restF);
        const restA = 1 - 0.45 * smooth((fNow - restF) / 30);
        ctx.save();
        ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.globalAlpha = 0.9 * restA;
        ctx.beginPath();
        ctx.moveTo(pos[(trail0 * n + hero) * 2], pos[(trail0 * n + hero) * 2 + 1]);
        for (let q = trail0 + 1; q <= Math.floor(fe); q++) ctx.lineTo(pos[(q * n + hero) * 2], pos[(q * n + hero) * 2 + 1]);
        ctx.lineTo(xs[hero], ys[hero]);
        ctx.stroke();
        ctx.restore();
      }

      // ---- balls ----
      const h = SZ / 2;
      for (let i = 0; i < n; i++) if (i !== hero) ctx.drawImage(SPR[band[i]], xs[i] - h, ys[i] - h, SZ, SZ);
      // the chosen ball last, with a soft halo while it falls
      const falling = clamp((restF - fNow) / 20) * clamp((fNow - exitF[hero] + 20) / 20);
      if (falling > 0) {
        ctx.fillStyle = `rgba(232,87,63,${(0.18 * falling).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(xs[hero], ys[hero], B.r * 2.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.drawImage(HERO, xs[hero] - h, ys[hero] - h, SZ, SZ);

      // ---- the curve: N(np, np(1−p)) in balls per bin, drawn in the stack's own height scale ----
      const cp = ease.inOutCubic(clamp((t - T.curve0) / (T.curve1 - T.curve0)));
      const u0 = -0.5, u1 = NB - 0.5, ue = lerp(u0, u1, cp);
      // count labels ride on the stacks (and lift over the curve once it is there)
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = font(800, 20);
      for (let m = 0; m < NB; m++) {
        const c = live[m];
        if (!c) continue;
        let y = B.floorY - c * hPer - 14;
        const over = smooth((ue - m + 0.4) / 0.6);
        if (over > 0) y = lerp(y, Math.min(y, curveY(m) - 18), over);
        ctx.globalAlpha = clamp(c / 2);
        ctx.fillStyle = C.ink;
        ctx.fillText(String(c), binX(m), y);
      }
      ctx.globalAlpha = 1;
      if (cp > 0) {
        const path = new Path2D();
        path.moveTo(binX(u0), curveY(u0));
        for (let u = u0 + 0.05; u < ue; u += 0.05) path.lineTo(binX(u), curveY(u));
        path.lineTo(binX(ue), curveY(ue));
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(251,248,242,0.95)'; ctx.lineWidth = 10; ctx.stroke(path);
        ctx.strokeStyle = C.coral; ctx.lineWidth = 4.5; ctx.stroke(path);
        // the binomial values at whole k, as dots on the curve
        for (let m = 0; m < NB && m <= ue; m++) {
          const a = smooth((ue - m) / 0.4);
          const x = binX(m), y = curveY(m), rr = 5.5 * a;
          ctx.fillStyle = '#fbf8f2'; ctx.beginPath(); ctx.arc(x, y, rr + 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
        }
        if (cp < 1) {
          ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(binX(ue), curveY(ue), 8, 0, Math.PI * 2); ctx.fill();
        }
      }

      // ---- the chosen ball's card: its fourteen choices ----
      const ha = smooth((fNow - restF - 8) / 24);
      if (ha > 0) {
        // the empty pocket between the field's left wall (x 148) and the peg triangle, under the hopper:
        // no ball ever passes here (row 4's outer peg starts at x 377, row 5's at y 690)
        const cx0 = 164, cy0 = 536 - 10 * (1 - ha), cw = 200, ch = 146;
        card(cx0, cy0, cw, ch, ha);
        ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'left';
        ctx.drawImage(HERO, cx0 + 18, cy0 + 20, SZ * 1.15, SZ * 1.15);
        ctx.fillStyle = C.coral; ctx.font = font(700, 19); ctx.fillText('한 개의 공', cx0 + 44, cy0 + 34);
        ctx.fillStyle = C.ink; ctx.font = font(800, 26);
        ctx.fillText(`오른쪽 ${heroBin}번`, cx0 + 20, cy0 + 72);
        ctx.fillText(`왼쪽 ${B.rows - heroBin}번`, cx0 + 20, cy0 + 104);
        ctx.fillStyle = C.ink2; ctx.font = font(600, 19);
        ctx.fillText(`→ k = ${heroBin} 칸에 착지`, cx0 + 20, cy0 + 132);
        ctx.restore();
      }

      // ---- formula card ----
      const fa = smooth((t - T.card) / 0.55);
      if (fa > 0) {
        const x0 = 676, y0 = 1030 - 12 * (1 - fa), w = 334, hh = 236;
        // leader to the curve's right shoulder
        const lu = 9.55, lx = binX(lu), ly = curveY(lu);
        ctx.save(); ctx.globalAlpha = fa;
        ctx.strokeStyle = C.coral; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0 + 40, y0 + hh); ctx.lineTo(lx, ly - 8); ctx.stroke();
        ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        card(x0, y0, w, hh, fa);
        ctx.save(); ctx.globalAlpha = fa; ctx.textAlign = 'left';
        const lx0 = x0 + 24;
        ctx.fillStyle = C.ink; ctx.font = font(800, 38); ctx.fillText(`B(${B.rows}, ½)`, lx0, y0 + 54);
        ctx.fillStyle = C.coral; ctx.font = font(800, 32); ctx.fillText(`≈ N(${MU}, ${fmt(SIG * SIG, 1)})`, lx0, y0 + 98);
        ctx.fillStyle = C.faint; ctx.fillRect(lx0, y0 + 118, w - 48, 2);
        ctx.fillStyle = C.ink2; ctx.font = font(600, 21);
        ctx.fillText(`μ = np = ${MU}`, lx0, y0 + 152);
        ctx.fillText(`σ² = np(1−p) = ${fmt(SIG * SIG, 1)}`, lx0, y0 + 182);
        ctx.fillStyle = C.mute; ctx.font = font(600, 19);
        ctx.fillText(`실측 μ ${fmt(muM)} · σ² ${fmt(varM)}`, lx0, y0 + 214);
        ctx.restore();
      }

      // ---- headline ----
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const a1 = ease.outCubic(clamp((t - T.head1) / 0.6));
      if (a1 > 0) {
        ctx.globalAlpha = a1; ctx.fillStyle = C.ink; ctx.font = font(800, 60);
        ctx.fillText('우연이 모이면', 72, 128 + 16 * (1 - a1));
      }
      const a2 = ease.outCubic(clamp((t - T.head2) / 0.6));
      if (a2 > 0) {
        ctx.globalAlpha = a2; ctx.fillStyle = C.coral; ctx.font = font(800, 60);
        ctx.fillText('질서가 된다', 72, 202 + 16 * (1 - a2));
      }
      ctx.globalAlpha = 1;
      // ---- live counter (top right) ----
      const ca = ease.outCubic(clamp((t - T.head1 - 0.2) / 0.6));
      if (ca > 0) {
        ctx.globalAlpha = ca; ctx.textAlign = 'right';
        ctx.fillStyle = C.mute; ctx.font = font(600, 20); ctx.fillText('착지한 공', 1008, 92);
        ctx.font = font(600, 26); const tail = ` / ${n}`; ctx.fillText(tail, 1008, 150);
        const tw = ctx.measureText(tail).width;
        ctx.fillStyle = C.ink; ctx.font = font(800, 56); ctx.fillText(String(landed), 1008 - tw, 150);
        ctx.globalAlpha = 1;
      }
    };
  },

  frame(t) { this.render(t); },
});
