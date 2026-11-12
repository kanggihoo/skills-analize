/*
 * chart.js — the animator's timing chart across the top: one tick per drawing of the squirrel, keys (원화) circled,
 * breakdowns under a triangle, inbetweens (동화) as plain ticks, the smear's tick in the accent. A thin hairline runs
 * on ones (every frame); the accent marker sits on the drawing being shown, so it holds and jumps — it steps.
 */
import { clamp, ease } from '../_lib/stage.js';

export const CH = { x0: 96, x1: 984, y: 268 };
const KR = '"Pretendard Variable"';
const TAU = Math.PI * 2;

/** digits at a fixed advance (canvas has no tabular figures), right-aligned at x */
function fixedText(g, s, x, y, adv) {
  for (let i = s.length - 1, px = x; i >= 0; i--) {
    const ch = s[i], w = /[0-9]/.test(ch) ? adv : g.measureText(ch).width;
    px -= w;
    g.fillText(ch, px + (/[0-9]/.test(ch) ? (adv - g.measureText(ch).width) / 2 : 0), y);
  }
}
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
};

/**
 * o: { XS, n, A, B, fg, acc, appear, legend, names, cur, hair, sections, secA, counter, dash: Map(index → { no, name }) }
 * x(n) = x0 + (n − A)/(B − A)·(x1 − x0)
 */
export function drawChart(g, o) {
  const { x0, x1, y } = CH;
  const span = x1 - x0, X = (n) => x0 + ((n - o.A) / (o.B - o.A)) * span;
  const fg = o.fg, acc = o.acc, ap = o.appear;
  if (ap <= 0) return;
  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.textBaseline = 'alphabetic';
  // header
  g.globalAlpha = ap;
  g.font = `700 27px ${KR}`; g.fillStyle = rgba(fg, 0.94); g.textAlign = 'left';
  g.fillText('타이밍 차트', x0, y - 104);
  g.font = `500 19px ${KR}`; g.fillStyle = rgba(fg, 0.58);
  g.fillText('다람쥐 그림 한 장 = 눈금 하나', x0 + 148, y - 105);
  g.font = `700 26px ${KR}`; g.fillStyle = rgba(fg, 0.9);
  fixedText(g, o.counter, x1, y - 104, 16);
  // legend
  if (o.legend > 0) {
    g.globalAlpha = ap * o.legend;
    g.font = `500 19px ${KR}`; g.fillStyle = rgba(fg, 0.62); g.strokeStyle = rgba(fg, 0.62); g.lineWidth = 2;
    let lx = x0;
    g.beginPath(); g.arc(lx + 8, y - 69, 7, 0, TAU); g.stroke(); lx += 22; g.fillText('원화', lx, y - 62); lx += 64;
    g.beginPath(); g.moveTo(lx + 1, y - 63); g.lineTo(lx + 9, y - 76); g.lineTo(lx + 17, y - 63); g.closePath(); g.stroke(); lx += 26; g.fillText('브레이크다운', lx, y - 62); lx += 128;
    g.beginPath(); g.moveTo(lx + 6, y - 76); g.lineTo(lx + 6, y - 62); g.stroke(); lx += 18; g.fillText('동화', lx, y - 62); lx += 64;
    g.strokeStyle = acc; g.lineWidth = 4; g.beginPath(); g.moveTo(lx + 6, y - 77); g.lineTo(lx + 6, y - 62); g.stroke(); lx += 18;
    g.fillStyle = acc; g.fillText('스미어', lx, y - 62);
  }
  g.globalAlpha = 1;
  // the ruler draws in from the left
  const reveal = x0 + span * ease.inOutCubic(clamp(ap * 1.2));
  g.save();
  g.beginPath(); g.rect(x0 - 30, y - 140, reveal - x0 + 30, 220); g.clip();
  g.globalAlpha = ap;
  g.strokeStyle = rgba(fg, 0.55); g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
  // frames (ones) as fine dots under the line
  const pxf = span / (o.B - o.A);
  if (pxf > 3.5) {
    g.fillStyle = rgba(fg, 0.34);
    const n0 = Math.ceil(o.A), n1 = Math.floor(o.B);
    for (let n = n0; n <= n1; n++) { g.beginPath(); g.arc(X(n), y + 9, n % 10 === 0 ? 2.2 : 1.3, 0, TAU); g.fill(); }
  }
  // sections: how many frames each drawing is held
  if (o.secA > 0) {
    g.globalAlpha = ap * o.secA;
    g.font = `600 18px ${KR}`; g.textAlign = 'center';
    for (const [a, b, lab] of o.sections) {
      const xa = Math.max(x0, X(a) + 3), xb = Math.min(x1, X(b) - 3);
      if (xb - xa < g.measureText(lab).width + 10) continue;   // a label shows only where it fits
      g.strokeStyle = rgba(fg, 0.45); g.lineWidth = 2;
      g.beginPath(); g.moveTo(xa, y + 28); g.lineTo(xa, y + 34); g.lineTo(xb, y + 34); g.lineTo(xb, y + 28); g.stroke();
      g.fillStyle = rgba(fg, lab === '3프레임' ? 0.78 : 0.6);
      g.fillText(lab, (xa + xb) / 2, y + 58);
    }
  }
  g.globalAlpha = ap;
  // ticks
  const zoomed = o.names > 0;
  for (let i = 0; i < o.XS.length; i++) {
    const d = o.XS[i], x = X(d.n);
    if (x < x0 - 2 || x > x1 + 2) continue;
    const done = d.n <= o.n;
    const k = d.kind, isSmear = d.fx === 'smear';
    const col = isSmear ? acc : rgba(fg, done ? 0.95 : 0.5);
    g.strokeStyle = col; g.fillStyle = col;
    const big = 1 + 0.35 * o.names;
    const h = (k === 'key' ? 24 : k === 'bd' ? 18 : 12) * big;
    g.lineWidth = isSmear ? 5 : 2.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke();
    if (k === 'key') {
      const r = 8.5 * big;
      g.lineWidth = 2.4;
      g.beginPath(); g.arc(x, y - h - r - 2, r, 0, TAU);
      if (d.fx === 'impact') g.fill(); else g.stroke();
    } else if (k === 'bd') {
      const s = 8 * big, ty = y - h - 4;
      g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(x - s, ty); g.lineTo(x, ty - s * 1.5); g.lineTo(x + s, ty); g.closePath(); g.stroke();
    }
    if (d.fx === 'multi') {
      g.lineWidth = 2; g.strokeStyle = rgba(fg, 0.4);
      for (const dx of [-5, -10]) { g.beginPath(); g.moveTo(x + dx * big, y); g.lineTo(x + dx * big, y - h * 0.7); g.stroke(); }
    }
    if (isSmear) {                                      // a little swoosh trailing the smear's tick
      g.fillStyle = acc;
      g.beginPath(); g.moveTo(x, y - h); g.quadraticCurveTo(x - 10 * big, y - h + 4, x - 26 * big, y - h + 2); g.quadraticCurveTo(x - 10 * big, y - h + 10, x, y - h + 9); g.fill();
    }
    // zoomed: drawing numbers and names
    const lab = o.dash && o.dash.get(i);
    if (zoomed && lab) {
      g.globalAlpha = ap * o.names;
      g.textAlign = 'center';
      const lit = i === o.cur;
      g.font = `700 ${k === 'key' ? 21 : 20}px ${KR}`;
      g.fillStyle = k === 'key' ? (lit ? acc : rgba(fg, 0.95)) : rgba(fg, 0.9);
      const ny = k === 'key' ? y - h - 8.5 * big - 2 + 7.5 : k === 'bd' ? y - h - 26 * big : y - h - 10;
      if (k === 'key' && d.fx === 'impact') g.fillStyle = o.fgInv || '#1c140e';
      g.fillText(String(lab.no), x, ny);
      g.font = `${lit ? 700 : 600} 20px ${KR}`;
      g.fillStyle = lab.name === '스미어' ? acc : rgba(fg, lit ? 1 : 0.62);
      g.fillText(lab.name, x, y + 48);
      g.globalAlpha = ap;
    }
  }
  g.restore();
  // the hairline on ones (moves every frame) and the stepping marker on the current drawing
  if (o.hair > 0) {
    const xh = X(o.n);
    if (xh >= x0 - 1 && xh <= x1 + 1) {
      g.globalAlpha = ap * o.hair;
      g.strokeStyle = rgba(fg, 0.7); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(xh, y - 50); g.lineTo(xh, y + 14); g.stroke();
    }
  }
  if (o.cur >= 0) {
    const d = o.XS[o.cur], xc = X(d.n);
    if (xc >= x0 - 1 && xc <= x1 + 1) {
      g.globalAlpha = ap;
      g.strokeStyle = acc; g.fillStyle = acc; g.lineWidth = 5;
      g.beginPath(); g.moveTo(xc, y + 3); g.lineTo(xc, y - 20); g.stroke();
      g.beginPath(); g.moveTo(xc, y + 8); g.lineTo(xc - 8, y + 21); g.lineTo(xc + 8, y + 21); g.closePath(); g.fill();
    }
  }
  g.restore();
}
