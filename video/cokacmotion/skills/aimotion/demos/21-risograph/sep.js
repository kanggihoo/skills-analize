/*
 * 21-risograph/sep.js — the artwork, drawn as two SEPARATIONS (one greyscale canvas per drum), the way a
 * riso artist prepares a two-colour job: white = 100 % of that ink, black = none. A shape can be on one
 * drum, on both (overprint → violet), or knocked out of one. Tones are continuous here; the screening into
 * dots happens later, in the shader, at each drum's own angle.
 *   R = fluorescent pink drum, G = medium blue drum. Sheet-local units: 820 × 1160 px, rasterised at 1.5×.
 */
import { rand } from '../_lib/stage.js';

export const SW = 820, SH = 1160, SS = 1.5;
const TAU = Math.PI * 2;
const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function drawSeparations() {
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = Math.round(SW * SS); c.height = Math.round(SH * SS);
    const g = c.getContext('2d', { willReadFrequently: true });   // setup-only readback
    g.setTransform(SS, 0, 0, SS, 0, 0);
    g.fillStyle = '#000'; g.fillRect(0, 0, SW, SH);
    g.lineCap = 'round'; g.lineJoin = 'round';
    return g;
  };
  const P = mk(), B = mk();
  const grey = (v) => { const k = Math.round(c01(v) * 255); return `rgb(${k},${k},${k})`; };
  // style for one plate: a number (tone), or [[stop, tone], …] for a vertical gradient y0→y1
  const style = (g, v, y0 = 0, y1 = SH) => {
    if (typeof v === 'number') return grey(v);
    const gr = g.createLinearGradient(0, y0, 0, y1);
    for (const [s, k] of v) gr.addColorStop(s, grey(k));
    return gr;
  };
  // fill a Path2D on either plate; null leaves that plate untouched (overprint), 0 knocks it out
  const fill = (path, p, b, y0, y1) => {
    if (p != null) { P.fillStyle = style(P, p, y0, y1); P.fill(path); }
    if (b != null) { B.fillStyle = style(B, b, y0, y1); B.fill(path); }
  };
  const stroke = (path, w, p, b) => {
    if (p != null) { P.lineWidth = w; P.strokeStyle = grey(p); P.stroke(path); }
    if (b != null) { B.lineWidth = w; B.strokeStyle = grey(b); B.stroke(path); }
  };
  const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
  const circ = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; };
  const rrect = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  const r = rand(2104);

  // the image area: a white margin all round, as a riso cannot print to the edge
  for (const g of [P, B]) { g.save(); g.beginPath(); g.rect(34, 34, 752, 1092); g.clip(); }

  // ---- dusk sky: blue from the top, fluorescent pink rising from the horizon; where both, violet
  fill(rect(34, 34, 752, 700), [[0, 0.04], [0.42, 0.3], [0.86, 0.9], [1, 0.95]], [[0, 0.92], [0.3, 0.64], [0.66, 0.24], [0.86, 0]], 34, 734);
  for (let i = 0; i < 30; i++) {           // stars knocked out of both plates
    const x = 50 + r() * 720, y = 50 + r() * 260 * r();
    fill(circ(x, y, 0.9 + 1.4 * r() * r()), 0, 0);
  }
  // crescent moon: a knocked-out disc, then the sky put back over part of it
  fill(circ(640, 150, 30), 0, 0);
  fill(circ(653, 141, 27), [[0, 0.04], [0.42, 0.3], [0.86, 0.9], [1, 0.95]], [[0, 0.92], [0.3, 0.64], [0.66, 0.24], [0.86, 0]], 34, 734);
  // the low sun: solid pink, blue knocked out, with a thin halo ring on the pink plate only
  fill(circ(300, 590, 150), 1, 0);
  const halo = new Path2D(); halo.arc(300, 590, 176, 0, TAU); halo.arc(300, 590, 166, 0, TAU, true);
  fill(halo, 0.6, null);
  // sun bands: the horizon haze cuts thin stripes through its lower half
  for (let k = 0; k < 5; k++) {
    const y = 530 + k * 18 + k * k * 2, h = 3 + k * 1.6, hw = Math.sqrt(Math.max(0, 150 * 150 - (y + h / 2 - 590) ** 2));
    fill(rect(300 - hw, y, 2 * hw, h), 0.55, 0.25);
  }

  // ---- far skyline (light violet), mid skyline (blue, lit windows in pink), a tower
  for (let x = 34; x < 786;) {
    const w = 28 + r() * 46, top = 470 + r() * 110;
    fill(rect(x, top, w + 1, 760 - top), 0.42, 0.4);
    x += w;
  }
  const lit = [];
  for (let x = 20; x < 800;) {
    const w = 50 + r() * 70, top = 380 + r() * 150;
    if (x + w < 150 || x > 690) { x += w; continue; }      // the near blocks stand there
    fill(rect(x, top, w, 780 - top), 0.1, 0.7);
    for (let wy = top + 14; wy < 700; wy += 20) for (let wx = x + 8; wx < x + w - 10; wx += 15) if (r() < 0.28) lit.push([wx, wy, 7, 9]);
    x += w + 4 + r() * 10;
  }
  fill(rect(560, 262, 52, 520), 0.12, 0.8);
  stroke((() => { const p = new Path2D(); p.moveTo(586, 262); p.lineTo(586, 196); return p; })(), 3, null, 0.85);
  fill(circ(586, 194, 4.5), 1, 0);
  for (let wy = 280; wy < 700; wy += 22) for (let wx = 568; wx < 604; wx += 14) if (r() < 0.35) lit.push([wx, wy, 6, 10]);
  // near blocks at both edges, dark blue, rim-lit pink on the side facing the sun
  fill(rect(20, 160, 132, 640), 0.05, 0.93);
  fill(rect(146, 160, 6, 640), 0.7, 0.5);
  fill(rect(690, 230, 110, 570), 0.05, 0.93);
  fill(rect(690, 230, 5, 570), 0.75, 0.5);
  for (let wy = 186; wy < 700; wy += 26) for (const wx of [44, 74, 104, 714, 744]) if (r() < 0.4) lit.push([wx, wy, 12, 14]);
  for (const [x, y, w, h] of lit) fill(rect(x, y, w, h), 0.95, 0.12);

  // ---- street
  fill(rect(34, 760, 752, 240), 0.32, 0.55);
  fill(rect(34, 760, 752, 22), 0.22, 0.32);
  for (let i = 0; i < 90; i++) fill(rect(34 + r() * 740, 790 + r() * 200, 6 + r() * 16, 1.5), null, 0.75);   // cobbles' glints
  // overhead wires and the birds sitting on them
  const wire = (y0, y1, sag) => { const p = new Path2D(); p.moveTo(20, y0); p.quadraticCurveTo(410, (y0 + y1) / 2 + sag, 800, y1); return p; };
  stroke(wire(604, 630, 34), 2.6, null, 1);
  stroke(wire(618, 644, 34), 1.6, null, 1);
  for (const bx of [92, 118, 470, 520, 548]) {
    const t = (bx - 20) / 780, wy = (1 - t) * (1 - t) * 604 + 2 * (1 - t) * t * (617 + 34) + t * t * 630;
    const p = new Path2D(); p.ellipse(bx, wy - 6, 6, 4.5, -0.3, 0, TAU); p.moveTo(bx - 2, wy - 9); p.arc(bx - 5, wy - 10, 3, 0, TAU);
    fill(p, null, 1); fill(p, 0, null);
  }
  // street lamp with a pink glow
  fill(rect(694, 560, 9, 440), 0.15, 1);
  stroke((() => { const p = new Path2D(); p.moveTo(698, 566); p.quadraticCurveTo(690, 548, 664, 556); return p; })(), 5, 0.15, 1);
  P.save(); P.globalCompositeOperation = 'lighter';
  const glow = P.createRadialGradient(660, 572, 4, 660, 572, 80); glow.addColorStop(0, grey(0.75)); glow.addColorStop(1, grey(0));
  P.fillStyle = glow; P.fill(circ(660, 572, 80)); P.restore();
  fill(circ(660, 572, 9), 0, 0);

  // ---- the tram: fluorescent pink body, blue skirt and stripe, lit windows, passengers, pantograph to the wire
  const tram = rrect(140, 688, 472, 212, [26, 34, 6, 6]);
  fill(tram, 0.96, 0);
  fill(rect(140, 856, 472, 44), 0.3, 0.88);
  fill(rect(140, 800, 472, 12), null, 0.92);
  fill(rect(160, 676, 420, 14), 0.25, 0.7);
  for (let k = 0; k < 6; k++) {
    const x = 160 + k * 66, win = rrect(x, 712, 54, 78, 6);
    fill(win, 0.14, 0);
    if (k !== 2 && k !== 5) {                // passengers' silhouettes
      const hx = x + 14 + r() * 26, sil = new Path2D();
      sil.arc(hx, 748, 9, 0, TAU); sil.moveTo(hx - 18, 790); sil.quadraticCurveTo(hx, 752, hx + 18, 790);
      fill(sil, 0.2, 0.78);
    }
  }
  fill(rrect(560, 708, 40, 92, [4, 14, 4, 4]), 0.1, 0);          // windscreen
  fill(rect(468, 694, 62, 14), 0, 0);                             // destination blind
  B.font = '800 12px "Pretendard Variable", Pretendard, sans-serif'; B.fillStyle = grey(1); B.fillText('2 종점', 474, 705);
  fill(circ(596, 838, 7), 0, 0);                                  // headlight
  P.save(); P.globalCompositeOperation = 'lighter';
  const beam = P.createRadialGradient(640, 900, 6, 640, 900, 120); beam.addColorStop(0, grey(0.6)); beam.addColorStop(1, grey(0));
  P.fillStyle = beam; P.fill(rect(600, 840, 186, 150)); P.restore();
  for (const wx of [212, 268, 482, 538]) { fill(circ(wx, 900, 17), 0.3, 1); fill(circ(wx, 900, 5), 0.9, 0.2); }
  const panto = new Path2D();
  panto.moveTo(350, 676); panto.lineTo(374, 650); panto.lineTo(398, 676); panto.moveTo(374, 650); panto.lineTo(362, 628); panto.moveTo(346, 628); panto.lineTo(382, 628);
  stroke(panto, 2.6, null, 1);
  fill(rect(140, 914, 480, 8), 0.4, 1);                           // shadow under the tram
  for (const ry of [928, 952]) fill(rect(34, ry, 752, 3), 0.9, 0.15);   // rails catching the sunset
  fill(rect(34, 990, 752, 12), 0.1, 1);                           // kerb

  // ---- the footer: paper, a rule, and type
  fill(rect(34, 1002, 752, 130), 0, 0);
  fill(rect(48, 1018, 724, 2.5), null, 1);
  B.fillStyle = grey(1); B.font = '800 92px "Pretendard Variable", Pretendard, sans-serif'; B.textBaseline = 'alphabetic';
  B.fillText('저녁 전차', 44, 1106);
  P.fillStyle = grey(1); P.font = '800 50px "Pretendard Variable", Pretendard, sans-serif'; P.textAlign = 'right';
  P.fillText('19:42', 772, 1068);
  B.font = '600 21px "Pretendard Variable", Pretendard, sans-serif'; B.textAlign = 'right';
  B.fillText('2호선 · 종점행 막차', 772, 1100);
  for (const g of [P, B]) g.restore();

  // pack: R = pink plate, G = blue plate
  const n = P.canvas.width * P.canvas.height;
  const dp = P.getImageData(0, 0, P.canvas.width, P.canvas.height).data, db = B.getImageData(0, 0, B.canvas.width, B.canvas.height).data;
  const out = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) { out[i * 4] = dp[i * 4]; out[i * 4 + 1] = db[i * 4]; out[i * 4 + 3] = 255; }
  return { w: P.canvas.width, h: P.canvas.height, data: out };
}
