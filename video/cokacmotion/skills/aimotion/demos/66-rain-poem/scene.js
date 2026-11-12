/*
 * scene.js — everything about the basin that is designed on the CPU once: the poem's layout (vertical, right to left),
 * its carving mask, the red seal, the overhanging branch (painted on the canopy plane, seen only in reflection),
 * the rain schedule (seeded Poisson process through a rate envelope) and the floating petals.
 * Coordinates are stage pixels, y down. The water surface is z = 0, the floor z = −DEPTH, the camera z = CAM_H.
 */
import { rand, track } from '../_lib/stage.js';

export const W = 1080, H = 1920;
export const CAM = [540, 960];        // the camera looks straight down from above this point
export const CAM_H = 2600;            // camera height above the water (px)
export const CAN_H = 1500;            // height of the overhanging branch (the canopy plane)
export const DEPTH = 170;             // water depth over the carved floor (px)
export const ETA = 1 / 1.333;

// ---------------------------------------------------------------- the poem
export const POEM = ['비가 그치고', '물이 잔잔해지면', '돌 위에 새긴', '너의 이름'];
export const KEY = { col: 3, from: 3, to: 4 };      // "이름" — where the last drop falls
export const FONT_PX = 104;
export const FONT = `400 ${FONT_PX}px "Song Myung"`;
const ADV = FONT_PX * 1.1, SPACE = FONT_PX * 0.46, COL_GAP = 170, TOP = 560;

/** glyph centres on the floor: columns right → left, each read top → bottom */
export function layoutPoem() {
  const glyphs = [];
  POEM.forEach((line, c) => {
    const x = W / 2 + (1.5 - c) * COL_GAP;
    let y = TOP;
    Array.from(line).forEach((ch, i) => {
      if (ch === ' ') { y += SPACE; return; }
      glyphs.push({ ch, x, y: y + ADV / 2, col: c, i });
      y += ADV;
    });
  });
  const key = glyphs.filter((g) => g.col === KEY.col && g.i >= KEY.from && g.i <= KEY.to);
  const kx = key.reduce((s, g) => s + g.x, 0) / key.length, ky = key.reduce((s, g) => s + g.y, 0) / key.length;
  const last = glyphs.filter((g) => g.col === POEM.length - 1).pop();
  return { glyphs, key: [kx, ky], seal: [last.x, last.y + ADV * 0.5 + 58] };
}

/** where a floor point appears on screen through flat water (the refracted view ray lands farther out) */
export function floorToScreen([x, y]) {
  const k = 1 + (DEPTH * ETA) / CAM_H;      // small-angle Snell: tan θt ≈ η tan θi
  return [CAM[0] + (x - CAM[0]) / k, CAM[1] + (y - CAM[1]) / k];
}

export function drawPoem(ctx, glyphs) {
  ctx.font = FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const g of glyphs) ctx.fillText(g.ch, g.x, g.y);
}

/** a small vermilion seal (낙관) under the last column: the character is left as bare stone */
export function paintSeal(seal) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const s = 64, [x, y] = seal;
  g.save();
  g.translate(x, y);
  g.rotate(-0.025);
  g.fillStyle = 'rgba(150, 30, 18, 0.9)';
  g.beginPath();
  g.roundRect(-s / 2, -s / 2, s, s, 5);
  g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.font = '400 50px "Song Myung"';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('비', 0, 2);
  g.lineWidth = 3;
  g.strokeRect(-s / 2 + 6, -s / 2 + 6, s - 12, s - 12);
  g.restore();
  return c;
}

// ---------------------------------------------------------------- the branch (canopy plane, reflection only)
export const CAN_DOM = [-1300, -1500, 2300, 3300];   // plane x0, y0, x1, y1 covered by the canopy texture
export const CAN_TEX = [720, 960];

/** a cherry branch reaching in from beyond the top-right corner; black silhouette in the alpha channel */
export function paintCanopy(seed = 6606) {
  const r = rand(seed);
  const c = document.createElement('canvas');
  [c.width, c.height] = CAN_TEX;
  const g = c.getContext('2d');
  const [x0, y0, x1, y1] = CAN_DOM;
  g.scale(CAN_TEX[0] / (x1 - x0), CAN_TEX[1] / (y1 - y0));
  g.translate(-x0, -y0 - 170);          // the whole branch sits 170 px further out: its reflection clears the poem
  g.fillStyle = '#000';
  g.strokeStyle = '#000';
  g.lineCap = 'round';
  g.lineJoin = 'round';

  // tapered limb: Catmull–Rom through the points, drawn as short segments of shrinking width
  const along = (pts, k) => {
    const n = pts.length - 1, f = Math.min(n - 1e-6, k * n), i = Math.floor(f), u = f - i;
    const P = (j) => pts[Math.max(0, Math.min(n, j))];
    const [a, b, cc, d] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    const u2 = u * u, u3 = u2 * u;
    return [0, 1].map((e) => 0.5 * ((2 * b[e]) + (-a[e] + cc[e]) * u + (2 * a[e] - 5 * b[e] + 4 * cc[e] - d[e]) * u2 + (-a[e] + 3 * b[e] - 3 * cc[e] + d[e]) * u3));
  };
  const limb = (pts, w0, w1, wobble = 6) => {
    const N = 80;
    let prev = along(pts, 0);
    for (let i = 1; i <= N; i++) {
      const k = i / N, p = along(pts, k);
      p[0] += (r() - 0.5) * wobble; p[1] += (r() - 0.5) * wobble;
      g.lineWidth = w0 + (w1 - w0) * Math.pow(k, 0.8);
      g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke();
      prev = p;
    }
  };
  const leaf = (x, y, ang, L) => {
    const w = L * (0.3 + 0.08 * r());
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(L * 0.18, 0); g.stroke();     // petiole
    g.translate(L * 0.16, 0);
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(L * 0.2, -w, L * 0.7, -w * 0.9, L, 0);
    g.bezierCurveTo(L * 0.7, w * 0.9, L * 0.2, w, 0, 0);
    g.fill();
    g.restore();
  };
  const cluster = (x, y, n, base) => {
    for (let i = 0; i < n; i++) leaf(x, y, base + (r() - 0.5) * 1.9, 95 + 60 * r());
  };

  const main = [[2900, -1900], [2250, -1150], [1760, -620], [1360, -260], [1060, -40], [840, 100], [690, 170]];
  limb(main, 110, 8, 8);
  const twigs = [
    [[1760, -620], [1660, -360], [1600, -140], [1580, 30]],
    [[1360, -260], [1250, -80], [1200, 110], [1215, 250]],
    [[1060, -40], [985, 120], [950, 250]],
    [[2250, -1150], [2060, -820], [1960, -560], [1930, -380]],
    [[1600, -140], [1460, -40], [1390, 70]],
  ];
  twigs.forEach((tw, i) => limb(tw, 30 - i * 3, 5, 4));
  // leaves hang from the outer half of the limb and from every twig tip
  for (let k = 0.45; k <= 1.0; k += 0.075) {
    const [x, y] = along(main, k);
    cluster(x, y, 2, Math.PI / 2 + (r() - 0.5) * 0.8);
  }
  for (const tw of twigs) {
    const tip = tw[tw.length - 1];
    cluster(tip[0], tip[1], 4, Math.PI / 2);
    const mid = along(tw, 0.55);
    cluster(mid[0], mid[1], 2, Math.PI / 2 + (r() - 0.5));
  }
  const tip = main[main.length - 1];
  cluster(tip[0], tip[1], 3, Math.PI * 0.75);
  return c;
}

// ---------------------------------------------------------------- rain
// drops per second: drizzle → a downpour that buries the poem in ripples → it stops
export const rainRate = track([[0, 0], [0.5, 0], [1.0, 2.5], [2.1, 4], [3.2, 52], [4.7, 52], [5.6, 0]]);
export const FINAL_T = 7.55;            // the last drop, on the key word
export const DROP_V = 11000;            // fall speed (px/s, ≈ 6 m/s at this scale)

/** every impact: { t, x, y, a (dip depth, px), s (radius, px), final? } sorted by t */
export function rainSchedule(keyScreen, seed = 6607) {
  const r = rand(seed);
  const drops = [
    // the first drizzle drops are placed (composition): away from the text, each one read on its own
    { t: 0.62, x: 852, y: 448, a: 1.5, s: 5.5 },
    { t: 1.22, x: 168, y: 1452, a: 1.35, s: 5.0 },
    { t: 1.71, x: 930, y: 1250, a: 1.45, s: 5.2 },
  ];
  const LMAX = 60;
  let t = 0.9;
  for (;;) {
    t += -Math.log(1 - r()) / LMAX;                // candidate arrivals at the peak rate, thinned by rainRate(t)
    if (t > 5.7) break;
    const keep = r() < rainRate(t) / LMAX;
    const x = -40 + r() * (W + 80), y = -40 + r() * (H + 80), u = r(), v = r();
    if (!keep) continue;
    const heavy = rainRate(t) > 20;
    drops.push({ t, x, y, a: (0.85 + 0.7 * u) * (heavy ? 1.45 : 1.2), s: 4.2 + 2.2 * v });
  }
  // after the rain the branch still drips (it hangs over the top-right corner)
  drops.push({ t: 6.38, x: 1012, y: 182, a: 2.1, s: 6.2 }, { t: 6.93, x: 944, y: 268, a: 1.7, s: 5.8 });
  drops.push({ t: FINAL_T, x: keyScreen[0], y: keyScreen[1], a: 3.1, s: 7.5, final: true });
  return drops.sort((p, q) => p.t - q.t);
}

// ---------------------------------------------------------------- petals adrift (cherry, late spring)
// x, y, angle, half-length, drift vx, vy (px/s), spin (rad/s), tint
const PETALS0 = [
  [150, 400, 0.6, 19, 5.0, 2.0, 0.05, 0.2],
  [948, 830, 2.4, 17, -2.5, 4.5, -0.07, 0.6],
  [118, 1188, 4.1, 18, 3.5, -3.0, 0.04, 0.4],
  [905, 1452, 1.2, 20, -4.0, -2.5, 0.06, 0.8],
  [430, 1515, 5.3, 16, 4.5, 1.0, -0.05, 0.3],
  [700, 312, 3.3, 18, -3.0, 3.0, 0.03, 0.7],
  [1006, 1150, 0.2, 15, -2.0, -4.0, -0.04, 0.5],
];
export function petalsAt(t) {
  return PETALS0.map(([x, y, a, L, vx, vy, w, tint], i) => ({
    x: x + vx * t + 3 * Math.sin(0.5 * t + i), y: y + vy * t + 3 * Math.cos(0.42 * t + 2 * i), a: a + w * t, L, tint,
  }));
}
