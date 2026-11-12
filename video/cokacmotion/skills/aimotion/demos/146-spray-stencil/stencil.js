/*
 * stencil.js — the cut card, baked once in setup.
 *
 *   letters  → opening coverage (the holes the knife cuts)
 *   islands  → connected components of the board that no longer touch the outer card (the counters of ㅇ ㅁ …)
 *   bridges  → thin strips of board that tie every island back to the card, chosen by casting rays from the island
 *              through the opening and keeping the shortest straight pair that lands on the main board
 *   sdf      → signed distance (px) to the board material: < 0 on the board, > 0 in the holes and outside the card.
 *              One field drives the crisp holes, the underspray feather, the soft card shadow and the cut-edge bevel.
 */
import { textAlpha, signedDistance } from '../_lib/type.js';

/** 4-connected components of mask (Uint8Array 0/1); returns labels (−1 = not material) and component sizes */
function label(mask, w, h) {
  const lab = new Int32Array(w * h).fill(-1), stack = new Int32Array(w * h), sizes = [];
  let n = 0;
  for (let s = 0; s < w * h; s++) {
    if (!mask[s] || lab[s] >= 0) continue;
    let top = 0, size = 0;
    stack[top++] = s; lab[s] = n;
    while (top) {
      const i = stack[--top], x = i % w;
      size++;
      if (x > 0 && mask[i - 1] && lab[i - 1] < 0) { lab[i - 1] = n; stack[top++] = i - 1; }
      if (x < w - 1 && mask[i + 1] && lab[i + 1] < 0) { lab[i + 1] = n; stack[top++] = i + 1; }
      if (i >= w && mask[i - w] && lab[i - w] < 0) { lab[i - w] = n; stack[top++] = i - w; }
      if (i < w * (h - 1) && mask[i + w] && lab[i + w] < 0) { lab[i + w] = n; stack[top++] = i + w; }
    }
    sizes.push(size);
    n++;
  }
  return { lab, sizes };
}

/**
 * @param REG   texture region in stage px { x0, y0, w, h }
 * @param CARD  card rectangle { x, y, w, h, r }
 * @param lines [{ text, x, base }] centred text lines (stage px, alphabetic baseline)
 * @param font  CSS font shorthand
 * @param BW    bridge width (px)
 */
export function buildStencil({ REG, CARD, lines, font, letterSpacing = '0px', BW = 10 }) {
  const { x0, y0, w, h } = REG;
  const rect = textAlpha(w, h, (g) => {
    g.translate(-x0, -y0);
    g.beginPath(); g.roundRect(CARD.x, CARD.y, CARD.w, CARD.h, CARD.r); g.fill();
  });
  const letters = textAlpha(w, h, (g) => {
    g.translate(-x0, -y0);
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.letterSpacing = letterSpacing;
    for (const L of lines) g.fillText(L.text, L.x, L.base);
  });

  // board material before bridging: inside the card and not cut out
  const solid = (open) => {
    const m = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) m[i] = rect[i] >= 0.5 && open[i] < 0.5 ? 1 : 0;
    return m;
  };
  const inCard = (i) => rect[i] >= 0.5;
  let { lab, sizes } = label(solid(letters), w, h);
  const mainId = lab[(CARD.y + 6 - y0) * w + (CARD.x + 6 - x0)];

  // islands: every board component except the main card (tiny specks from anti-aliasing are ignored)
  const islands = [];
  for (let id = 0; id < sizes.length; id++) if (id !== mainId && sizes[id] >= 24) islands.push({ id, sx: 0, sy: 0, n: 0 });
  const byId = new Map(islands.map((I) => [I.id, I]));
  for (let i = 0; i < w * h; i++) {
    const I = byId.get(lab[i]);
    if (I) { I.sx += i % w; I.sy += (i / w) | 0; I.n++; }
  }

  // march from the island's centroid along ±dir: leave the island, cross the opening, land on the main board
  function march(I, cx, cy, dx, dy) {
    let x = cx, y = cy, state = 0, ax = 0, ay = 0;
    for (let k = 0; k < 1600; k++) {
      x += dx * 0.5; y += dy * 0.5;
      const xi = Math.floor(x), yi = Math.floor(y);
      if (xi < 0 || yi < 0 || xi >= w || yi >= h) return null;
      const i = yi * w + xi, L = lab[i];
      if (state === 0) {
        if (L === I.id) continue;
        if (L >= 0) return null;                 // touched other board before any opening
        state = 1; ax = x; ay = y;
      } else {
        if (L < 0) { if (!inCard(i)) return null; continue; }
        if (L === mainId) return { ax, ay, bx: x, by: y, len: Math.hypot(x - ax, y - ay) };
        return null;                             // another island: not a support
      }
    }
    return null;
  }

  const bridges = [];
  for (const I of islands) {
    let cx = I.sx / I.n + 0.5, cy = I.sy / I.n + 0.5;
    if (lab[Math.floor(cy) * w + Math.floor(cx)] !== I.id) {      // non-convex island: start from its pixel nearest the centroid
      let best = 1e18;
      for (let i = 0; i < w * h; i++) if (lab[i] === I.id) {
        const d = (i % w + 0.5 - cx) ** 2 + (((i / w) | 0) + 0.5 - cy) ** 2;
        if (d < best) { best = d; cx = i % w + 0.5; cy = ((i / w) | 0) + 0.5; }
      }
    }
    // a pair of opposite rays (two supports keep the island flat); slight preference for vertical bridges
    let pick = null;
    for (let deg = 0; deg < 180; deg += 2) {
      const a = (deg * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
      const r1 = march(I, cx, cy, dx, dy), r2 = march(I, cx, cy, -dx, -dy);
      if (!r1 || !r2) continue;
      const cost = r1.len + r2.len + 8 * Math.abs(dx);
      if (!pick || cost < pick.cost) pick = { cost, rays: [[r1, dx, dy], [r2, -dx, -dy]] };
    }
    if (!pick) continue;
    for (const [r, dx, dy] of pick.rays) bridges.push({ ax: r.ax - dx * 3 + x0, ay: r.ay - dy * 3 + y0, bx: r.bx + dx * 3 + x0, by: r.by + dy * 3 + y0 });
  }

  // cut the bridges back into the board
  const bridgeCov = textAlpha(w, h, (g) => {
    g.translate(-x0, -y0);
    g.strokeStyle = '#fff'; g.lineWidth = BW; g.lineCap = 'butt';
    for (const b of bridges) { g.beginPath(); g.moveTo(b.ax, b.ay); g.lineTo(b.bx, b.by); g.stroke(); }
  });
  const open = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) open[i] = letters[i] * (1 - bridgeCov[i]);
  ({ lab, sizes } = label(solid(open), w, h));
  const main2 = lab[(CARD.y + 6 - y0) * w + (CARD.x + 6 - x0)];
  let loose = 0;
  for (let id = 0; id < sizes.length; id++) if (id !== main2 && sizes[id] >= 24) loose++;
  if (loose) console.warn(`stencil: ${loose} island(s) still loose`);

  const material = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) material[i] = rect[i] * (1 - open[i]);
  const sdf = signedDistance(material, w, h);
  return { sdf, open, rect, bridges, islands: islands.length, loose };
}

/**
 * Bottom edges of the openings: where paint pooled against the card while it was on the wall (drip candidates).
 * Returns [{ x, y }] in stage px, one per pixel column of each edge.
 */
export function bottomEdges({ REG, open, rect }) {
  const { x0, y0, w, h } = REG, out = [];
  for (let y = 2; y < h - 4; y++) for (let x = 2; x < w - 2; x++) {
    const i = y * w + x;
    if (open[i] >= 0.5 && open[i + w] < 0.5 && open[i + 3 * w] < 0.2 && rect[i + 3 * w] >= 0.5 && open[i - 2 * w] >= 0.5) out.push({ x: x + x0 + 0.5, y: y + y0 + 0.5 });
  }
  return out;
}
