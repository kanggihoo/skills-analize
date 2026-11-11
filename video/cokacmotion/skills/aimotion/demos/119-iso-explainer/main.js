/*
 * 119 · 편지 한 통이 집에 닿기까지 — isometric explainer scene (Canvas 2D, one canvas).
 *
 * A small floating town drawn in 2:1 dimetric projection (camera 30° above the floor, 45° around) explains how a
 * letter travels: posted into a mailbox → shot through a glass tube → read and sorted on a conveyor → loaded onto a
 * van that loops the road → carried by a postman to one door. Every moving thing rides a looping path parameterised
 * by arc length (s = speed·t + phase + i·gap, mod length), so spacing is constant and the picture is a pure function
 * of t. One hero letter (coral) is threaded through all of it: the loop phases are solved in setup so that each
 * hand-off (hand → slot, tube → belt, crate → van, van → depot, depot → postman, postman → mailbox) happens at a
 * story time. Solid things are axis-aligned boxes sorted by a separating-axis dependency graph (topological sort),
 * so letters slide under the scanner hood, the postman walks behind houses, vans pass in front of trees.
 * Faces get three tones from one light; static shadows are baked once (swept footprints, blurred), moving things
 * carry soft contact shadows. Text lives in the planes where it belongs (wall sign, road paint, van sides, floor
 * step numbers, the scanner's counter) and in screen space where it must be read (title, callouts, pin).
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

const DUR = 10;
const W = 1080, H = 1920;
const A = 52;                 // px per world unit at zoom 1: +x → (A, A/2), +y → (−A, A/2)
const ZK = 1.2247;            // one unit of height = ZK·A px (cos 30° / sin 45°: what makes the floor exactly 2:1)
const KR = '"Pretendard Variable", sans-serif';
const SIGN = '"Do Hyeon", sans-serif';
const TAU = Math.PI * 2;

const mod = (a, n) => ((a % n) + n) % n;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = (p) => { p = clamp(p); return p * p * (3 - 2 * p); };
const outCubic = (p) => ease.outCubic(clamp(p));
const inOut = (p) => ease.inOutCubic(clamp(p));
const outExpo = (p) => ease.outExpo(clamp(p));
const outBack = (p, c = 1.6) => ease.outBack(clamp(p), c);
const in2 = (p) => { p = clamp(p); return p * p; };

// ================================================================================================ colour
function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const css = (c, al = 1) => (al >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${al.toFixed(3)})`);
const WARM = hex('#FFFDF5'), COOL = hex('#33405F');
/** three tones from one light: top (lit), left = +y face (half), right = +x face (away from the light, cooled) */
function mat(h, lift = 0.26, drop = 0.27) {
  const b = hex(h), T = mixc(b, WARM, lift), R = mixc(b, COOL, drop);
  return { t: css(T), l: css(b), r: css(R), T, L: b, R };
}
const INK = '#21304A', INK2 = '#5B6884', CORAL = '#EE5A43', CREAM = '#FFFBF3';
const LANE = ['#EE5A43', '#F0B13F', '#4E9FC0'];       // 별 · 해 · 달 — the three neighbourhoods
const LANE_NAME = ['별', '해', '달'];
const M = {
  wall: mat('#F4E8D4'), cap: mat('#E3D2B8'), roofCoral: mat('#E8735A'), roofTeal: mat('#5EA8A2'), roofGold: mat('#EDB04E'),
  roofSlate: mat('#7C8DB0'), coral: mat('#EE5A43', 0.22, 0.24), coralD: mat('#B8402F'), steel: mat('#C3CDD9'),
  steelD: mat('#8E9BAE'), navy: mat('#3F5378', 0.2, 0.3), wood: mat('#DDA96C'), woodD: mat('#B98450'),
  belt: mat('#C8D1DC'), beltTop: mat('#4A5468', 0.12, 0.2), van: mat('#FAF7F1', 0.1, 0.2), glassD: mat('#3C4E6E'),
  trunk: mat('#A6744E'), post: mat('#5A6982'), white: mat('#FFFFFF', 0, 0.14), hero: mat('#EE5A43', 0.18, 0.22),
  teal: mat('#4E9FC0'), gold: mat('#F0B13F'), hedge: mat('#7FBF7A'), sack: mat('#D9B98A'),
  lane: LANE.map((c) => mat(c, 0.22, 0.24)),
};

// light: from the upper left and slightly behind; top 0.84, +y face 0.46, +x face −0.29
const LV = (() => { const v = [-0.35, 0.55, 1], n = Math.hypot(...v); return v.map((a) => a / n); })();
const SHX = 0.35, SHY = -0.55;       // ground offset of a shadow per unit of height (−L.xy / L.z)
function shade(m, nx, ny, nz) {
  const f = nx * LV[0] + ny * LV[1] + nz * LV[2];
  if (f <= LV[0]) return m.r;
  if (f <= LV[1]) return css(mixc(m.R, m.L, (f - LV[0]) / (LV[1] - LV[0])));
  return css(mixc(m.L, m.T, clamp((f - LV[1]) / (LV[2] - LV[1]))));
}

// ================================================================================================ camera + drawing
let ctx = null, T = 0;
const cam = { s: A, ox: 0, oy: 0 };
function setCam(fx, fy, fz, zoom, sx, sy) {
  cam.s = A * zoom;
  cam.ox = sx - cam.s * (fx - fy);
  cam.oy = sy - cam.s * ((fx + fy) / 2 - ZK * fz);
}
const PX = (x, y) => cam.ox + cam.s * (x - y);
const PY = (x, y, z) => cam.oy + cam.s * ((x + y) * 0.5 - ZK * z);
function poly(p, fill) {
  ctx.beginPath();
  ctx.moveTo(PX(p[0], p[1]), PY(p[0], p[1], p[2]));
  for (let i = 3; i < p.length; i += 3) ctx.lineTo(PX(p[i], p[i + 1]), PY(p[i], p[i + 1], p[i + 2]));
  ctx.fillStyle = fill;
  ctx.fill();
}
/** axis-aligned box: silhouette in the dark tone first (no seams), then the +y face and the top */
function box(x0, y0, z0, x1, y1, z1, m) {
  poly([x0, y0, z1, x1, y0, z1, x1, y0, z0, x1, y1, z0, x0, y1, z0, x0, y1, z1], m.r);
  poly([x0, y1, z0, x1, y1, z0, x1, y1, z1, x0, y1, z1], m.l);
  poly([x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], m.t);
}
const resetT = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
/** draw in floor units (x, y) on the plane at height z */
function onFloor(z = 0) { ctx.setTransform(cam.s, cam.s / 2, -cam.s, cam.s / 2, cam.ox, cam.oy - cam.s * ZK * z); }
/** draw on a vertical face: origin at world (x, y, z), u along the horizontal unit (ux, uy), v pointing down */
function onWall(x, y, z, ux, uy) {
  const s = cam.s;
  ctx.setTransform(s * (ux - uy), (s * (ux + uy)) / 2, 0, s * ZK, PX(x, y), PY(x, y, z));
}
/** text in the current plane transform; size in world units */
function ptext(str, u, v, size, weight, family, color, align = 'center', ls = 0) {
  ctx.save();
  ctx.translate(u, v);
  ctx.scale(size / 100, size / 100);
  ctx.font = `${weight} 100px ${family}`;
  ctx.letterSpacing = `${ls}px`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}
function rrPath(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ================================================================================================ paths
function rrect(x0, y0, x1, y1, r, z = 0, n = 10) {
  const pts = [[x0 + r, y0, z]];
  const arc = (cx, cy, a0) => { for (let i = 1; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]); } };
  pts.push([x1 - r, y0, z]); arc(x1 - r, y0 + r, -Math.PI / 2);
  pts.push([x1, y1 - r, z]); arc(x1 - r, y1 - r, 0);
  pts.push([x0 + r, y1, z]); arc(x0 + r, y1 - r, Math.PI / 2);
  pts.push([x0, y0 + r, z]); arc(x0 + r, y0 + r, Math.PI);
  return pts;
}
function fillet(pts, r, n = 10) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const la = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]), lc = Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]);
    const p0 = b.map((v, k) => v + ((a[k] - v) / la) * r), p1 = b.map((v, k) => v + ((c[k] - v) / lc) * r);
    for (let j = 0; j <= n; j++) {
      const t = j / n, u = 1 - t;
      out.push(p0.map((v, k) => u * u * v + 2 * u * t * b[k] + t * t * p1[k]));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function mkPath(pts, closed) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  return { pts, cum, L: cum[cum.length - 1], closed };
}
function at(p, s) {
  s = p.closed ? mod(s, p.L) : clamp(s, 0, p.L);
  let lo = 0, hi = p.cum.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p.cum[m] <= s) lo = m; else hi = m; }
  const a = p.pts[lo], b = p.pts[hi], d = p.cum[hi] - p.cum[lo] || 1, k = (s - p.cum[lo]) / d;
  return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, z: a[2] + (b[2] - a[2]) * k, dx: (b[0] - a[0]) / d, dy: (b[1] - a[1]) / d, dz: (b[2] - a[2]) / d };
}
function nearestS(p, x, y) {
  let best = 0, bd = 1e9;
  for (let s = 0; s < p.L; s += 0.004) { const q = at(p, s), d = (q.x - x) ** 2 + (q.y - y) ** 2; if (d < bd) { bd = d; best = s; } }
  return best;
}
const hopPt = (a, b, p, h) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: lerp(a.z, b.z, p) + 4 * h * p * (1 - p) });

// ================================================================================================ the world
const PLOTS = [[0, 0, 6, 6], [6, 3, 13, 9], [8, 9, 14, 15], [13.6, 12, 19.6, 18]];   // ① 광장 ② 우체국 ③ 길 ④ 별빛마을
const SLAB = 0.6;

// ---- ① plaza: walkers loop, the mailbox, the glass tube
const WALK = mkPath(rrect(1.0, 2.6, 4.8, 5.3, 0.7), true);
const WALK_V = 0.75, WALK_N = 3;
const MBX = { x0: 3.92, y0: 3.72, x1: 4.48, y1: 4.28 };            // mailbox footprint (centre 4.2, 4.0)
const SLOT = { x: 4.5, y: 4.0, z: 0.86 };
const TUBE = mkPath(fillet([[4.2, 4.0, 1.12], [4.2, 4.0, 2.4], [7.25, 4.85, 2.4], [7.25, 4.85, 1.12]], 0.5), false);
const TUBE_R = 0.2;

// ---- ② post office: belt, scanner, pushers, crates
const BELT_X0 = 7.25, BELT_Y = 4.85, BELT_Z = 0.34;
const SCAN = { x0: 8.2, x1: 9.0, y0: 4.38, y1: 5.32, z0: 0.44, z1: 1.18 };
const PUSH_X = [9.75, 10.45, 11.15];
const CRATE_Y0 = 5.42, CRATE_Y1 = 6.02, CRATE_Z = 0.3;

// ---- ③ road loop with vans
const ROAD = mkPath(rrect(8.7, 7.0, 12.5, 14.0, 1.0), true);
const ROAD_W = 0.86;
const DEPOT = { x0: 13.65, y0: 12.7, x1: 14.25, y1: 13.3, z1: 0.95 };

// ---- ④ neighbourhood: postman loop, houses, mailboxes
const POST = mkPath(rrect(14.4, 14.3, 19.1, 15.1, 0.4), true);
const HOUSES = [
  { x0: 14.6, y0: 12.35, x1: 15.8, y1: 13.6, zw: 0.92, zr: 1.5, ridge: 'y', roof: M.roofTeal },
  { x0: 16.25, y0: 12.3, x1: 17.65, y1: 13.65, zw: 1.02, zr: 1.72, ridge: 'x', roof: M.roofCoral, hero: true },
  { x0: 18.1, y0: 12.4, x1: 19.3, y1: 13.6, zw: 0.9, zr: 1.48, ridge: 'y', roof: M.roofGold },
  { x0: 14.3, y0: 16.2, x1: 15.55, y1: 17.3, zw: 0.9, zr: 1.5, ridge: 'x', roof: M.roofGold, front: true },
  { x0: 16.45, y0: 16.25, x1: 17.75, y1: 17.4, zw: 0.98, zr: 1.6, ridge: 'y', roof: M.roofSlate, front: true },
];
const MAILS = [{ x: 15.2, y: 13.98 }, { x: 16.95, y: 13.98 }, { x: 18.7, y: 13.98 }];   // house mailboxes (H2 = index 1)

// ================================================================================================ flows + the hero's itinerary
// every looping mover: s = v·t + φ (+ per-item offset), mod L. φ is solved so the hero's hand-offs land on story times.
const S_POST = nearestS(WALK, 4.8, 4.0);
const T_POST0 = 0.66, POST_HOP = 0.26, T_POST1 = T_POST0 + POST_HOP;
const WALK_PHI = S_POST - WALK_V * T_POST0;                           // walker 0 (the sender) reaches the mailbox at T_POST0
const walkerS = (j, t) => WALK_V * t + WALK_PHI - (j * WALK.L) / WALK_N;

const TUBE_V = 5.4, TUBE_GAP = 0.82;
const TUBE_N = Math.ceil((TUBE.L + 0.5) / TUBE_GAP), TUBE_LOOP = TUBE_N * TUBE_GAP;
const T_TUBE0 = T_POST1 + 0.14;
const TUBE_PHI = -TUBE_V * T_TUBE0;                                   // slot 0, pass 0 = hero
const T_TUBE1 = T_TUBE0 + TUBE.L / TUBE_V;

const BELT_V = 2.4, BELT_GAP = 0.7, BELT_N = 7, BELT_LOOP = BELT_N * BELT_GAP;
const T_BELT0 = T_TUBE1 + 0.12;
const BELT_PHI = -BELT_V * T_BELT0;                                   // slot 0, pass 0 = hero
const T_PUSH = T_BELT0 + (PUSH_X[0] - BELT_X0) / BELT_V;
const PUSH_T = 0.42;                                                  // push → resting in the crate

const VAN_V = 4.0, VAN_N = 3;
const S_DOCK = nearestS(ROAD, 11.25, 7.0), S_DROP = nearestS(ROAD, 12.5, 12.15);
const BAG_HOP = 0.46;
const T_LOAD = T_PUSH + PUSH_T + 0.03 + BAG_HOP;                      // the hero's bag lands on van 0 here
const VAN_PHI = S_DOCK - VAN_V * T_LOAD;
const vanS = (j, t) => VAN_V * t + VAN_PHI - (j * ROAD.L) / VAN_N;
const T_DROP = T_LOAD + mod(S_DROP - S_DOCK, ROAD.L) / VAN_V;           // van 0 passes the depot
const DROP_HOP = 0.4;

const POST_V = 1.75;
const S_PICK = nearestS(POST, DEPOT.x1, DEPOT.y1 + 0.6);
const PICK_HOP = 0.34;
const T_PICK = T_DROP + DROP_HOP + 0.05 + PICK_HOP;                    // the letter reaches the postman's hand
const POST_PHI = S_PICK - POST_V * T_PICK;
const postS = (t) => POST_V * t + POST_PHI;
const S_MAIL = MAILS.map((m) => nearestS(POST, m.x, m.y + 0.3));
const T_MAIL0 = T_PICK + mod(S_MAIL[1] - S_PICK, POST.L) / POST_V;
const MAIL_HOP = 0.3;
const T_ARRIVE = T_MAIL0 + MAIL_HOP;

// lane of every belt letter, by entry order g (consecutive letters never share a lane; the hero, g = 0, goes to 별)
const LANES = (() => {
  const r = rand(1190), L = [0];
  for (let g = 1; g < 60; g++) { let v; do { v = Math.floor(r() * 3); } while (v === L[g - 1]); L.push(v); }
  if (L[59] === 0) L[59] = L[58] === 1 ? 2 : 1;
  return L;
})();
const laneOf = (g) => LANES[mod(g, 60)];

// ================================================================================================ camera script
const OV = { fx: 0, fy: 0, zoom: 1, sx: 540, sy: 1012 };   // overview, solved in setup from the island bounds
let CAM = null;
function camKeys() {
  const ov = [OV.fx, OV.fy, 0, Math.log(OV.zoom), OV.sx, OV.sy];
  const ov2 = [OV.fx + 0.2, OV.fy + 0.05, 0, Math.log(OV.zoom * 1.025), OV.sx, OV.sy];
  const home = [16.95, 13.75, 0.7, Math.log(1.9), 540, 1180];
  return [
    [0.0, [4.05, 3.55, 0.85, Math.log(2.75), 560, 1075]],
    [1.3, [4.3, 3.9, 0.85, Math.log(2.55), 560, 1080], inOut],
    [2.3, [8.45, 4.75, 0.5, Math.log(2.12), 540, 1080], inOut],
    [3.6, [9.35, 5.05, 0.4, Math.log(2.0), 540, 1080], (p) => p],
    [4.3, [10.9, 9.2, 0.2, Math.log(1.6), 560, 1090], inOut],
    [5.5, [11.1, 9.75, 0.2, Math.log(1.52), 560, 1090], (p) => p],
    [6.85, ov, inOut],
    [8.7, ov2, (p) => p],
    [DUR, home, inOut],
  ];
}
function camAt(t) {
  const K = CAM;
  let v = K[K.length - 1][1];
  if (t <= K[0][0]) v = K[0][1];
  else {
    for (let i = 1; i < K.length; i++) {
      if (t <= K[i][0]) {
        const p = (K[i][2] || inOut)((t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
        v = K[i - 1][1].map((a, j) => lerp(a, K[i][1][j], p));
        break;
      }
    }
  }
  // impact punch on arrival
  const q = t - T_ARRIVE;
  const punch = q > 0 ? 0.035 * Math.exp(-q * 7) * Math.cos(q * 22) : 0;
  return { fx: v[0], fy: v[1], fz: v[2], zoom: Math.exp(v[3]) * (1 + punch), sx: v[4], sy: v[5] };
}

// ================================================================================================ callouts
const CARDS = [
  { n: '1', head: '우체통에 쏙', sub: '관을 타고 우체국으로', anchor: [4.48, 4.28, 1.1], floor: [3.62, 4.78] },
  { n: '2', head: '주소를 읽고 나눠요', sub: '동네별 색깔 상자로', anchor: [8.95, 4.6, 1.18], floor: [12.15, 5.85] },
  { n: '3', head: '트럭에 싣고 출발', sub: '동네 우편함까지 달려요', anchor: [8.7, 10.8, 0.02], floor: [13.4, 14.35] },
  { n: '4', head: '집배원이 문 앞까지', sub: '마지막은 사람 손으로', anchor: [17.78, 12.975, 1.72], floor: [19.0, 16.15] },
];
// close-up appearances: [in, out, card x, card y, leader mode, anchor override]   (screen space)
const SHOT_CARD = [[1.0, 2.2, 620, 600, 'vh', [4.49, 4.0, 0.86]], [2.62, 3.85, 56, 640, 'vh'], [4.35, 5.6, 40, 760, 'vh'], null];
// overview appearances: [in, out, card x, card y, leader mode]
const OV_CARD = [[6.3, 8.78, 40, 470, 'hv'], [6.42, 8.84, 640, 690, 'vh'], [6.54, 8.9, 24, 900, 'vh'], [6.7, 8.96, 660, 1110, 'vh']];
const CARD_H = 96;

// ================================================================================================ static scene
const statics = [];
const casters = [];
function add(x0, y0, z0, x1, y1, z1, d) { const o = { x0, y0, z0, x1, y1, z1, d }; statics.push(o); return o; }
const castBox = (x0, y0, x1, y1, h, k = 1) => casters.push({ kind: 'box', x0, y0, x1, y1, h, k });
const castTree = (x, y, zc, r) => casters.push({ kind: 'tree', x, y, zc, r });

function tree(x, y, r, zc, tone = 0) {
  const greens = [['#5E9F6B', '#8CC984', '#B5DFA2'], ['#4F9171', '#7DBF8C', '#A8D9A9']][tone];
  add(x - r * 0.75, y - r * 0.75, 0, x + r * 0.75, y + r * 0.75, zc + r, () => {
    box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, zc - r * 0.4, M.trunk);
    const cx = PX(x, y), cy = PY(x, y, zc), R = r * cam.s * 1.05;
    ctx.fillStyle = greens[0];
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.fillStyle = greens[1];
    ctx.beginPath(); ctx.arc(cx - R * 0.15, cy - R * 0.18, R * 0.76, 0, TAU); ctx.fill();
    ctx.fillStyle = greens[2];
    ctx.beginPath(); ctx.arc(cx - R * 0.36, cy - R * 0.42, R * 0.2, 0, TAU); ctx.fill();
  });
  castTree(x, y, zc, r);
}
function lamp(x, y, h = 1.25) {
  add(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, h + 0.1, () => {
    box(x - 0.035, y - 0.035, 0, x + 0.035, y + 0.035, h, M.post);
    ctx.fillStyle = '#FFF4D6';
    ctx.beginPath(); ctx.arc(PX(x, y), PY(x, y, h + 0.04), 0.085 * cam.s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(PX(x, y) - 0.03 * cam.s, PY(x, y, h + 0.06), 0.03 * cam.s, 0, TAU); ctx.fill();
  });
  castBox(x - 0.03, y - 0.03, x + 0.03, y + 0.03, h, 0.6);
}
function bench(x0, y0, x1, y1) {
  add(x0, y0, 0, x1, y1, 0.42, () => {
    box(x0 + 0.05, y0 + 0.05, 0, x0 + 0.1, y1 - 0.05, 0.2, M.post);
    box(x1 - 0.1, y0 + 0.05, 0, x1 - 0.05, y1 - 0.05, 0.2, M.post);
    box(x0, y0, 0.2, x1, y1, 0.26, M.wood);
    box(x0, y0, 0.26, x1, y0 + 0.06, 0.42, M.wood);
  });
  castBox(x0, y0, x1, y1, 0.35, 0.7);
}
/** walls + gable roof; door and windows on the +y face */
function house(h, idx) {
  const { x0, y0, x1, y1, zw, zr, ridge, roof } = h, o = 0.13;
  add(x0 - o, y0 - o, 0, x1 + o, y1 + o, zr, () => {
    box(x0, y0, 0, x1, y1, zw, M.wall);
    // windows / door on the +y face (u along +x, v down)
    onWall(x0, y1, 0, 1, 0);
    const lit = h.hero ? smooth(seg(T, T_ARRIVE + 0.05, T_ARRIVE + 0.45)) : 0;
    const winC = css(mixc(hex('#55688C'), hex('#FFD978'), lit));
    const wx = x1 - x0;
    ctx.fillStyle = winC;
    if (!h.front) {
      const dx = wx / 2 - 0.16;
      rrPath(dx, -0.62, 0.32, 0.62, 0.05); ctx.fillStyle = h.hero ? '#C94A36' : '#8C6A50'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(dx + 0.25, -0.3, 0.025, 0, TAU); ctx.fill();
      ctx.fillStyle = winC;
      rrPath(0.16, -0.66, 0.24, 0.26, 0.03); ctx.fill();
      rrPath(wx - 0.4, -0.66, 0.24, 0.26, 0.03); ctx.fill();
    } else {
      rrPath(0.2, -0.66, 0.26, 0.28, 0.03); ctx.fill();
      rrPath(wx / 2 - 0.13, -0.66, 0.26, 0.28, 0.03); ctx.fill();
      rrPath(wx - 0.46, -0.66, 0.26, 0.28, 0.03); ctx.fill();
    }
    // a window on the +x face (u along −y)
    onWall(x1, y1, 0, 0, -1);
    ctx.fillStyle = css(mixc(hex('#4A5C80'), hex('#F5C964'), lit));
    rrPath((y1 - y0) / 2 - 0.14, -0.68, 0.28, 0.3, 0.03); ctx.fill();
    resetT();
    if (lit > 0) {  // warm spill from the windows
      const gx = PX((x0 + x1) / 2, y1), gy = PY((x0 + x1) / 2, y1, 0.5);
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 1.6 * cam.s);
      g.addColorStop(0, `rgba(255,214,120,${0.45 * lit})`); g.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = g; ctx.fillRect(gx - 1.6 * cam.s, gy - 1.6 * cam.s, 3.2 * cam.s, 3.2 * cam.s);
    }
    const th = 0.07;
    if (ridge === 'x') {
      const ym = (y0 + y1) / 2, k = (zr - zw) / (ym - y0), ze = zw - o * k;
      poly([x0 - o, y0 - o, ze, x1 + o, y0 - o, ze, x1 + o, ym, zr, x0 - o, ym, zr], shade(roof, 0, -k, 1));       // back slope
      if (h.hero) box(x0 + 0.3, y0 + 0.2, zw + 0.3, x0 + 0.5, y0 + 0.4, zr + 0.18, M.coralD);                   // chimney
      poly([x1, y0, zw, x1, y1, zw, x1, ym, zr], M.wall.r);                                                       // gable (+x)
      poly([x1 + o, y0 - o, ze, x1 + o, ym, zr, x1 + o, ym, zr - th, x1 + o, y0 - o, ze - th], roof.r);
      poly([x1 + o, ym, zr, x1 + o, y1 + o, ze, x1 + o, y1 + o, ze - th, x1 + o, ym, zr - th], roof.r);
      poly([x0 - o, y1 + o, ze, x1 + o, y1 + o, ze, x1 + o, y1 + o, ze - th, x0 - o, y1 + o, ze - th], css(mixc(roof.L, COOL, 0.35)));
      poly([x0 - o, ym, zr, x1 + o, ym, zr, x1 + o, y1 + o, ze, x0 - o, y1 + o, ze], shade(roof, 0, k, 1));          // front slope
    } else {
      const xm = (x0 + x1) / 2, k = (zr - zw) / (xm - x0), ze = zw - o * k;
      poly([x0 - o, y0 - o, ze, xm, y0 - o, zr, xm, y1 + o, zr, x0 - o, y1 + o, ze], shade(roof, -k, 0, 1));        // back slope (−x)
      poly([x0, y1, zw, x1, y1, zw, xm, y1, zr], M.wall.l);                                                         // gable (+y)
      poly([x0 - o, y1 + o, ze, xm, y1 + o, zr, xm, y1 + o, zr - th, x0 - o, y1 + o, ze - th], css(mixc(roof.L, COOL, 0.3)));
      poly([xm, y1 + o, zr, x1 + o, y1 + o, ze, x1 + o, y1 + o, ze - th, xm, y1 + o, zr - th], css(mixc(roof.L, COOL, 0.3)));
      poly([x1 + o, y0 - o, ze, x1 + o, y1 + o, ze, x1 + o, y1 + o, ze - th, x1 + o, y0 - o, ze - th], roof.r);
      poly([xm, y0 - o, zr, x1 + o, y0 - o, ze, x1 + o, y1 + o, ze, xm, y1 + o, zr], shade(roof, k, 0, 1));          // front slope (+x)
      // round attic window in the gable
      onWall(x0, y1, 0, 1, 0);
      ctx.fillStyle = h.front ? '#55688C' : css(mixc(hex('#55688C'), hex('#FFD978'), lit));
      ctx.beginPath(); ctx.arc((x1 - x0) / 2, -(zw + (zr - zw) * 0.38), 0.09, 0, TAU); ctx.fill();
      resetT();
    }
  });
  castBox(x0, y0, x1, y1, (zw + zr) / 2);
}
function mailPost(m, idx) {
  const { x, y } = m;
  add(x - 0.16, y - 0.13, 0, x + 0.16, y + 0.13, 0.8, () => {
    box(x - 0.025, y - 0.025, 0, x + 0.025, y + 0.025, 0.46, M.post);
    box(x - 0.15, y - 0.11, 0.46, x + 0.15, y + 0.11, 0.66, idx === 1 ? M.coral : M.white);
    // flag on the +x side: down, flips up when the hero arrives
    const up = idx === 1 ? outBack(seg(T, T_ARRIVE, T_ARRIVE + 0.35), 2.2) : 0;
    const ang = lerp(0, Math.PI / 2, up);
    const fx0 = x + 0.152, fy0 = y + 0.06, fz0 = 0.5;
    const ey = -Math.cos(ang), ez = Math.sin(ang), py = Math.sin(ang), pz = Math.cos(ang);   // along −y when down, up when raised
    const L1 = 0.22, w = 0.08;
    poly([fx0, fy0, fz0, fx0, fy0 + ey * L1, fz0 + ez * L1, fx0, fy0 + ey * L1 + py * w, fz0 + ez * L1 + pz * w, fx0, fy0 + py * w, fz0 + pz * w], idx === 1 ? '#FFD34E' : CORAL);
  });
  castBox(x - 0.15, y - 0.11, x + 0.15, y + 0.11, 0.66, 0.7);
}

function buildStatics() {
  // ---------------------------------------------------------------- ① plaza
  // café (flat roof, striped awning)
  add(0.3, 0.3, 0, 2.5, 2.3, 1.7, () => {
    box(0.3, 0.3, 0, 2.5, 1.9, 1.5, M.wall);
    box(0.25, 0.25, 1.5, 2.55, 1.95, 1.62, M.cap);
    onWall(0.3, 1.9, 0, 1, 0);
    ctx.fillStyle = '#5A6D92'; rrPath(0.2, -0.95, 1.15, 0.62, 0.04); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0.3, -0.9, 0.08, 0.5);
    ctx.fillStyle = '#8C6A50'; rrPath(1.6, -0.82, 0.38, 0.82, 0.04); ctx.fill();
    onWall(2.5, 1.9, 0, 0, -1);
    ctx.fillStyle = '#4C5E82'; rrPath(0.3, -0.95, 0.9, 0.5, 0.04); ctx.fill();
    resetT();
    for (let i = 0; i < 7; i++) {   // awning stripes
      const a = 0.4 + (i * 1.7) / 7, b = a + 1.7 / 7;
      poly([a, 1.9, 1.18, b, 1.9, 1.18, b, 2.28, 0.98, a, 2.28, 0.98], i % 2 ? '#FFF6E6' : '#F0B13F');
    }
    poly([0.4, 2.28, 0.98, 2.1, 2.28, 0.98, 2.1, 2.28, 0.92, 0.4, 2.28, 0.92], '#C98F2E');
  });
  castBox(0.3, 0.3, 2.5, 1.9, 1.6);
  // stationery shop with a gable roof
  house({ x0: 3.05, y0: 0.35, x1: 5.55, y1: 1.65, zw: 1.45, zr: 2.15, ridge: 'x', roof: M.roofTeal, front: true });
  tree(0.55, 2.55, 0.42, 1.0);
  tree(5.45, 2.35, 0.38, 0.95, 1);
  tree(0.6, 5.45, 0.4, 0.95, 1);
  tree(2.9, 3.95, 0.55, 1.25);          // the plaza's centre tree (on a round planter, painted on the floor)
  lamp(0.42, 4.25);
  bench(2.0, 5.62, 2.95, 5.86);
  // the mailbox (machine #1): coral body, cap, slot on the +x face
  add(MBX.x0, MBX.y0, 0, MBX.x1, MBX.y1, 1.1, () => {
    const { x0, y0, x1, y1 } = MBX;
    box(x0 + 0.05, y0 + 0.05, 0, x1 - 0.05, y1 - 0.05, 0.12, M.coralD);
    box(x0 + 0.03, y0 + 0.03, 0.12, x1 - 0.03, y1 - 0.03, 0.98, M.coral);
    box(x0, y0, 0.98, x1, y1, 1.1, mat('#F27A63', 0.3, 0.3));
    onWall(x1 - 0.03, y1 - 0.03, 0, 0, -1);           // +x face, u along −y
    ctx.fillStyle = '#5A1E16'; rrPath(0.1, -0.9, 0.3, 0.07, 0.03); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    rrPath(0.15, -0.66, 0.2, 0.14, 0.02); ctx.fill();
    ctx.strokeStyle = '#EE5A43'; ctx.lineWidth = 0.02; ctx.beginPath(); ctx.moveTo(0.15, -0.66); ctx.lineTo(0.25, -0.58); ctx.lineTo(0.35, -0.66); ctx.stroke();
    onWall(x0 + 0.03, y1 - 0.03, 0, 1, 0);            // +y face
    ptext('우편', 0.25, -0.55, 0.19, 400, SIGN, '#FFF3EA');
    resetT();
  });
  castBox(MBX.x0, MBX.y0, MBX.x1, MBX.y1, 1.1);

  // the glass tube (one object; packets are drawn inside it, between the back glass and the front sheen)
  let tb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
  for (const p of TUBE.pts) for (let k = 0; k < 3; k++) { tb[k] = Math.min(tb[k], p[k]); tb[k + 3] = Math.max(tb[k + 3], p[k]); }
  add(tb[0] - TUBE_R, tb[1] - TUBE_R, 1.1, tb[3] + TUBE_R, tb[4] + TUBE_R, tb[5] + TUBE_R, drawTube);

  // ---------------------------------------------------------------- ② post office (cut-away: two back walls)
  add(6.0, 3.0, 0, 13.0, 3.25, 1.52, () => {
    box(6.0, 3.0, 0, 13.0, 3.25, 1.45, M.wall);
    box(6.0, 3.0, 1.45, 13.0, 3.25, 1.52, M.cap);
    onWall(6.0, 3.25, 0, 1, 0);
    ctx.fillStyle = 'rgba(238,90,67,0.9)'; ctx.fillRect(0, -0.5, 7, 0.07);
    // sign: envelope mark + name
    const ex = 3.75, ey = -1.02;
    ctx.fillStyle = CORAL; rrPath(ex - 0.26, ey - 0.17, 0.52, 0.34, 0.05); ctx.fill();
    ctx.strokeStyle = '#FFF3EA'; ctx.lineWidth = 0.045; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(ex - 0.18, ey - 0.09); ctx.lineTo(ex, ey + 0.04); ctx.lineTo(ex + 0.18, ey - 0.09); ctx.stroke();
    ctx.lineJoin = 'miter';
    ptext('솔빛 우체국', ex + 0.42, ey + 0.02, 0.46, 400, SIGN, INK, 'left', 2);
    resetT();
  });
  castBox(6.0, 3.0, 13.0, 3.25, 1.5);
  add(6.0, 3.25, 0, 6.25, 6.4, 0.86, () => {
    box(6.0, 3.25, 0, 6.25, 6.4, 0.8, M.wall);
    box(6.0, 3.25, 0.8, 6.25, 6.4, 0.86, M.cap);
    onWall(6.25, 6.4, 0, 0, -1);
    ctx.fillStyle = 'rgba(238,90,67,0.9)'; ctx.fillRect(0, -0.5, 3.15, 0.07);
    resetT();
  });
  castBox(6.0, 3.25, 6.25, 6.4, 0.86);
  // pigeon-hole shelf on the back wall
  add(6.4, 3.25, 0, 7.98, 3.6, 1.12, () => {
    box(6.4, 3.25, 0, 7.98, 3.6, 1.12, M.wood);
    onWall(6.4, 3.6, 0, 1, 0);
    const r = rand(77);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const u = 0.1 + i * 0.37, v = -1.02 + j * 0.32;
      ctx.fillStyle = '#9B6B3F'; ctx.fillRect(u, v, 0.31, 0.26);
      const n = Math.floor(r() * 3);
      for (let k = 0; k < n; k++) { ctx.fillStyle = k === 0 ? '#FFFFFF' : LANE[(i + j + k) % 3]; ctx.fillRect(u + 0.04 + k * 0.08, v + 0.09 - k * 0.02, 0.07, 0.17 + k * 0.02); }
    }
    resetT();
  });
  castBox(6.4, 3.25, 7.98, 3.6, 1.1);
  // mail sacks by the wall
  add(12.25, 3.75, 0, 12.85, 4.45, 0.55, () => { sackAt(12.4, 4.0, 0, 0.95, '#D9B98A'); sackAt(12.65, 4.25, 0, 1.0, '#CDAA78'); });
  castBox(12.25, 3.8, 12.85, 4.4, 0.45, 0.7);
  // hopper under the tube mouth
  add(6.93, 4.53, 0.56, 7.57, 5.17, 1.1, drawHopper);
  castBox(6.95, 4.55, 7.55, 5.15, 1.1, 0.5);
  // conveyor belt
  add(7.0, 4.55, 0, 11.7, 5.15, BELT_Z, drawBelt);
  castBox(7.0, 4.55, 11.7, 5.15, 0.34, 0.7);
  // scanner (machine #2): two side legs + the hood (letters slide under it)
  add(SCAN.x0 + 0.05, SCAN.y0, 0, SCAN.x1 - 0.05, 4.53, SCAN.z0, () => box(SCAN.x0 + 0.05, SCAN.y0, 0, SCAN.x1 - 0.05, 4.53, SCAN.z0, M.navy));
  add(SCAN.x0 + 0.05, 5.17, 0, SCAN.x1 - 0.05, SCAN.y1, SCAN.z0, () => box(SCAN.x0 + 0.05, 5.17, 0, SCAN.x1 - 0.05, SCAN.y1, SCAN.z0, M.navy));
  add(SCAN.x0, SCAN.y0, SCAN.z0, SCAN.x1, SCAN.y1, SCAN.z1, drawScanner);
  castBox(SCAN.x0, SCAN.y0, SCAN.x1, SCAN.y1, SCAN.z1);
  // pusher housings (the arms are dynamic) and crates
  for (let k = 0; k < 3; k++) {
    const x = PUSH_X[k];
    add(x - 0.17, 4.08, 0, x + 0.17, 4.5, 0.62, () => {
      box(x - 0.17, 4.08, 0, x + 0.17, 4.5, 0.5, M.steel);
      box(x - 0.13, 4.12, 0.5, x + 0.13, 4.46, 0.62, M.steelD);
      onFloor(0.62); ctx.fillStyle = LANE[k]; ctx.beginPath(); ctx.arc(x, 4.29, 0.07, 0, TAU); ctx.fill(); resetT();
    });
    castBox(x - 0.17, 4.08, x + 0.17, 4.5, 0.6, 0.7);
    add(x - 0.31, CRATE_Y0, 0, x + 0.31, CRATE_Y1, CRATE_Z, () => drawCrate(k));
    castBox(x - 0.31, CRATE_Y0, x + 0.31, CRATE_Y1, CRATE_Z, 0.8);
  }
  // a worker watching the scanner
  add(7.62, 4.0, 0, 7.92, 4.3, 0.95, () => person(7.77, 4.15, 0, 1, { coat: '#4E9FC0', pants: '#33415E', hair: '#3A2E2A', apron: '#F4E8D4', idle: true }));
  castBox(7.65, 4.05, 7.9, 4.25, 0.9, 0.6);
  // outside the post office
  tree(6.65, 7.35, 0.42, 1.0);
  tree(7.45, 8.45, 0.36, 0.9, 1);
  lamp(8.0, 6.75);
  tree(12.55, 8.3, 0.3, 0.75, 1);

  // ---------------------------------------------------------------- ③ road
  tree(10.0, 8.75, 0.42, 1.0);
  tree(11.45, 9.05, 0.36, 0.9, 1);
  tree(9.85, 12.75, 0.38, 0.95, 1);
  tree(11.35, 13.0, 0.3, 0.8);
  tree(8.35, 10.6, 0.36, 0.92, 1);
  tree(8.35, 12.6, 0.34, 0.88);
  tree(9.1, 14.6, 0.3, 0.8, 1);
  lamp(13.3, 9.6);
  bench(10.15, 10.2, 10.4, 11.0);
  // depot box (machine #4)
  add(DEPOT.x0, DEPOT.y0, 0, DEPOT.x1, DEPOT.y1, DEPOT.z1, () => {
    const { x0, y0, x1, y1, z1 } = DEPOT;
    box(x0 + 0.04, y0 + 0.04, 0, x1 - 0.04, y1 - 0.04, z1 - 0.1, M.teal);
    box(x0, y0, z1 - 0.1, x1, y1, z1, mat('#3E7F9C'));
    onWall(x0 + 0.04, y1 - 0.04, 0, 1, 0);
    ctx.fillStyle = CORAL; ctx.beginPath(); ctx.arc(0.26, -0.55, 0.15, 0, TAU); ctx.fill();
    ptext('별', 0.26, -0.55, 0.17, 400, SIGN, '#FFF6EE');
    resetT();
  });
  castBox(DEPOT.x0, DEPOT.y0, DEPOT.x1, DEPOT.y1, DEPOT.z1);

  // ---------------------------------------------------------------- ④ neighbourhood
  HOUSES.forEach(house);
  MAILS.forEach(mailPost);
  tree(18.75, 16.55, 0.42, 1.0);
  tree(19.1, 17.45, 0.32, 0.82, 1);
  tree(13.95, 17.4, 0.36, 0.9, 1);
  tree(19.25, 12.45, 0.3, 0.8);
  // hedges along the yards
  for (const [a, b] of [[14.5, 15.85], [16.15, 17.75], [18.0, 19.4]]) {
    add(a, 13.72, 0, b, 13.84, 0.22, () => box(a, 13.72, 0, b, 13.84, 0.22, M.hedge));
  }
}

// ================================================================================================ drawn pieces
function sackAt(x, y, z, k, col) {
  const cx = PX(x, y), cy = PY(x, y, z), s = cam.s * k;
  ctx.fillStyle = css(mixc(hex(col), COOL, 0.25));
  ctx.beginPath(); ctx.ellipse(cx + 0.03 * s, cy - 0.2 * s, 0.22 * s, 0.24 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(cx - 0.02 * s, cy - 0.22 * s, 0.19 * s, 0.22 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = css(mixc(hex(col), COOL, 0.35));
  ctx.beginPath(); ctx.ellipse(cx, cy - 0.45 * s, 0.07 * s, 0.05 * s, 0, 0, TAU); ctx.fill();
}
/** small bag (hops between crate, van, depot) */
function bagAt(x, y, z, col, sc = 1) {
  const cx = PX(x, y), cy = PY(x, y, z), s = cam.s * sc;
  ctx.fillStyle = css(mixc(hex(col), COOL, 0.3));
  ctx.beginPath(); ctx.ellipse(cx + 0.02 * s, cy - 0.13 * s, 0.16 * s, 0.16 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(cx - 0.015 * s, cy - 0.145 * s, 0.135 * s, 0.145 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = css(mixc(hex(col), COOL, 0.4));
  ctx.beginPath(); ctx.ellipse(cx, cy - 0.3 * s, 0.05 * s, 0.035 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(cx - 0.06 * s, cy - 0.2 * s, 0.035 * s, 0.05 * s, -0.4, 0, TAU); ctx.fill();
}
/** flat envelope lying on a surface (top face only matters), long side along x */
function letterFlat(x, y, z, kind, lane = -1) {
  const hx = 0.2, hy = 0.14, th = 0.04;
  const m = kind === 'hero' ? M.hero : M.white;
  box(x - hx, y - hy, z, x + hx, y + hy, z + th, m);
  onFloor(z + th);
  ctx.strokeStyle = kind === 'hero' ? 'rgba(255,240,230,0.85)' : 'rgba(120,135,160,0.55)';
  ctx.lineWidth = 0.022;
  ctx.beginPath(); ctx.moveTo(x - hx + 0.03, y - hy + 0.03); ctx.lineTo(x, y + 0.02); ctx.lineTo(x + hx - 0.03, y - hy + 0.03); ctx.stroke();
  if (kind === 'hero') heartFloor(x + 0.08, y + 0.06, 0.06);
  else if (lane >= 0) { ctx.fillStyle = LANE[lane]; ctx.fillRect(x + hx - 0.12, y + hy - 0.1, 0.08, 0.07); }
  resetT();
}
function heartFloor(x, y, r) {
  ctx.fillStyle = '#FFF6EE';
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.9);
  ctx.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35);
  ctx.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.4, y - r * 0.1, x, y + r * 0.9);
  ctx.fill();
}
/** an envelope in flight (screen-facing card that tilts with its velocity) */
function letterFly(x, y, z, kind, rot = 0, sc = 1) {
  const cx = PX(x, y), cy = PY(x, y, z), s = cam.s * sc;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot);
  const w = 0.36 * s, h = 0.25 * s;
  ctx.fillStyle = kind === 'hero' ? '#B8402F' : '#C9D2DE';
  rrPath(-w / 2 + 0.02 * s, -h / 2 + 0.03 * s, w, h, 0.03 * s); ctx.fill();
  ctx.fillStyle = kind === 'hero' ? CORAL : '#FFFFFF';
  rrPath(-w / 2, -h / 2, w, h, 0.03 * s); ctx.fill();
  ctx.strokeStyle = kind === 'hero' ? 'rgba(255,240,230,0.9)' : 'rgba(110,125,150,0.6)';
  ctx.lineWidth = 0.025 * s;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 0.03 * s, -h / 2 + 0.03 * s); ctx.lineTo(0, 0.02 * s); ctx.lineTo(w / 2 - 0.03 * s, -h / 2 + 0.03 * s); ctx.stroke();
  if (kind === 'hero') {
    const r = 0.055 * s, hx = 0.07 * s, hy = 0.05 * s;
    ctx.fillStyle = '#FFF6EE';
    ctx.beginPath();
    ctx.moveTo(hx, hy + r * 0.9);
    ctx.bezierCurveTo(hx - r * 1.4, hy - r * 0.1, hx - r * 0.6, hy - r * 1.1, hx, hy - r * 0.35);
    ctx.bezierCurveTo(hx + r * 0.6, hy - r * 1.1, hx + r * 1.4, hy - r * 0.1, hx, hy + r * 0.9);
    ctx.fill();
  }
  ctx.restore();
}

function drawTube() {
  const R = TUBE_R * cam.s;
  const pts = TUBE.pts;
  // support strut standing on the post office's side wall
  box(6.07, 4.5, 0.86, 6.15, 4.58, 2.24, M.steelD);
  box(6.02, 4.45, 0.86, 6.2, 4.63, 0.92, M.steelD);
  ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  const trace = () => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(PX(p[0], p[1]), PY(p[0], p[1], p[2])) : ctx.moveTo(PX(p[0], p[1]), PY(p[0], p[1], p[2])))); };
  // back glass
  trace(); ctx.strokeStyle = 'rgba(150,205,224,0.55)'; ctx.lineWidth = 2 * R; ctx.stroke();
  trace(); ctx.strokeStyle = 'rgba(210,238,246,0.55)'; ctx.lineWidth = 1.45 * R; ctx.stroke();
  // packets
  for (let i = 0; i < TUBE_N; i++) {
    const u = TUBE_V * T + TUBE_PHI + i * TUBE_GAP;
    const s = mod(u, TUBE_LOOP), m = Math.floor(u / TUBE_LOOP);
    if (s > TUBE.L - 0.05 || s < 0.05) continue;
    const hero = i === 0 && m === 0;
    const q = at(TUBE, s);
    const sx = q.dx - q.dy, sy = (q.dx + q.dy) / 2 - ZK * q.dz;   // screen direction of travel
    const rot = Math.atan2(sy, sx);
    letterFly(q.x, q.y, q.z, hero ? 'hero' : 'w', rot + (Math.abs(sy) > Math.abs(sx) ? -Math.PI / 2 : 0), 0.82);
  }
  // collars + front sheen
  for (const s of [0.12, TUBE.L * 0.5, TUBE.L - 0.12]) {
    const q = at(TUBE, s);
    const sx = q.dx - q.dy, sy = (q.dx + q.dy) / 2 - ZK * q.dz, n = Math.hypot(sx, sy);
    const cx = PX(q.x, q.y), cy = PY(q.x, q.y, q.z);
    ctx.strokeStyle = 'rgba(120,150,175,0.9)'; ctx.lineWidth = 0.09 * cam.s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - (sy / n) * R * 1.05, cy + (sx / n) * R * 1.05); ctx.lineTo(cx + (sy / n) * R * 1.05, cy - (sx / n) * R * 1.05); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.save(); ctx.translate(-0.07 * cam.s, -0.08 * cam.s);
  trace(); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 0.045 * cam.s; ctx.stroke();
  ctx.restore();
  ctx.lineJoin = 'miter';
}
function drawHopper() {
  const cx = 7.25, cy = 4.85, zt = 1.1, zb = 0.6, ht = 0.3, hb = 0.13;
  const m = M.steel;
  // +y and +x slanted faces, then the top rim and the dark mouth
  const k = (ht - hb) / (zt - zb);
  poly([cx + ht, cy - ht, zt, cx + ht, cy + ht, zt, cx + hb, cy + hb, zb, cx + hb, cy - hb, zb], shade(m, 1, 0, -k));
  poly([cx - ht, cy + ht, zt, cx + ht, cy + ht, zt, cx + hb, cy + hb, zb, cx - hb, cy + hb, zb], shade(m, 0, 1, -k));
  poly([cx - ht, cy - ht, zt, cx + ht, cy - ht, zt, cx + ht, cy + ht, zt, cx - ht, cy + ht, zt], m.t);
  poly([cx - ht + 0.06, cy - ht + 0.06, zt, cx + ht - 0.06, cy - ht + 0.06, zt, cx + ht - 0.06, cy + ht - 0.06, zt, cx - ht + 0.06, cy + ht - 0.06, zt], '#5A667A');
}
function drawBelt() {
  box(7.0, 4.55, 0, 11.7, 5.15, 0.3, M.belt);
  box(7.02, 4.6, 0.3, 11.68, 5.1, BELT_Z, M.beltTop);
  // moving ribs on the belt surface
  onFloor(BELT_Z);
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 0.03;
  ctx.beginPath();
  for (let k = 0; k < 15; k++) { const x = 7.06 + mod(BELT_V * T + k * 0.31, 4.6); ctx.moveTo(x, 4.62); ctx.lineTo(x, 5.08); }
  ctx.stroke();
  // rollers on the +y side
  onWall(7.0, 5.15, 0, 1, 0);
  for (let k = 0; k < 10; k++) {
    const u = 0.25 + k * 0.47;
    ctx.fillStyle = '#8E9BAE'; ctx.beginPath(); ctx.arc(u, -0.16, 0.07, 0, TAU); ctx.fill();
    const a = (BELT_V * T) / 0.07;
    ctx.strokeStyle = '#E6ECF2'; ctx.lineWidth = 0.02;
    ctx.beginPath(); ctx.moveTo(u, -0.16); ctx.lineTo(u + Math.cos(a) * 0.06, -0.16 + Math.sin(a) * 0.06); ctx.stroke();
  }
  resetT();
}
function drawScanner() {
  const { x0, x1, y0, y1, z0, z1 } = SCAN;
  box(x0, y0, z0, x1, y1, z1, M.navy);
  // dark mouth band on the exit face (+x) and on the +y face bottom
  poly([x1, y0 + 0.05, z0, x1, y1 - 0.05, z0, x1, y1 - 0.05, z0 + 0.1, x1, y0 + 0.05, z0 + 0.1], '#1E2A40');
  // is a letter under the hood?
  let busy = 0;
  for (let i = 0; i < BELT_N; i++) {
    const s = mod(BELT_V * T + BELT_PHI + i * BELT_GAP, BELT_LOOP), x = BELT_X0 + s;
    if (x > x0 - 0.1 && x < x1 + 0.1) busy = Math.max(busy, 1 - Math.abs(x - (x0 + x1) / 2) / 0.5);
  }
  busy = clamp(busy);
  // top lamp
  onFloor(z1);
  ctx.fillStyle = css(mixc(hex('#3C7C8E'), hex('#8FF0FF'), busy));
  rrPath(x0 + 0.14, y0 + 0.2, x1 - x0 - 0.28, y1 - y0 - 0.4, 0.08); ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * busy})`;
  rrPath(x0 + 0.2, y0 + 0.26, 0.12, y1 - y0 - 0.52, 0.05); ctx.fill();
  // display on the +y face: running count of letters read
  onWall(x0, y1, 0, 1, 0);
  ctx.fillStyle = '#16203A'; rrPath(0.1, -1.06, 0.6, 0.32, 0.04); ctx.fill();
  const n = 1200 + Math.floor((BELT_V * T + BELT_PHI - (x1 - BELT_X0)) / BELT_GAP);
  const str = String(n).padStart(4, '0');
  for (let i = 0; i < 4; i++) ptext(str[i], 0.2 + i * 0.13, -0.9, 0.21, 800, KR, '#8FF0FF');
  // last read lane lamp
  resetT();
  // light curtain at the exit
  if (busy > 0) {
    const g = ctx.createLinearGradient(PX(x1, y0), PY(x1, y0, z0), PX(x1, y0), PY(x1, y0, BELT_Z));
    g.addColorStop(0, `rgba(143,240,255,${0.5 * busy})`); g.addColorStop(1, 'rgba(143,240,255,0)');
    poly([x1 + 0.01, y0 + 0.1, z0, x1 + 0.01, y1 - 0.1, z0, x1 + 0.01, y1 - 0.1, BELT_Z, x1 + 0.01, y0 + 0.1, BELT_Z], g);
  }
}
function drawCrate(k) {
  const x0 = PUSH_X[k] - 0.31, x1 = PUSH_X[k] + 0.31, y0 = CRATE_Y0, y1 = CRATE_Y1, z1 = CRATE_Z, w = 0.05;
  const m = M.crate || M.wood;
  box(x0, y0, 0, x1, y1, z1, m);
  // opening: dark inside, then a mound of letters
  poly([x0 + w, y0 + w, z1, x1 - w, y0 + w, z1, x1 - w, y1 - w, z1, x0 + w, y1 - w, z1], '#7A5232');
  const r = rand(300 + k);
  onFloor(z1 - 0.06);
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 + w, y0 + w, x1 - x0 - 2 * w, y1 - y0 - 2 * w); ctx.clip();
  for (let i = 0; i < 9; i++) {
    const lx = x0 + 0.08 + r() * 0.42, ly = y0 + 0.1 + r() * 0.36, a = (r() - 0.5) * 1.2;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(a);
    ctx.fillStyle = i % 4 === 3 ? LANE[k] : (i % 2 ? '#FFFFFF' : '#EEF1F5');
    ctx.fillRect(-0.12, -0.08, 0.24, 0.16);
    ctx.restore();
  }
  ctx.restore();
  // lane band + name on the +y face
  onWall(x0, y1, 0, 1, 0);
  ctx.fillStyle = LANE[k]; ctx.fillRect(0, -0.24, x1 - x0, 0.17);
  ptext(LANE_NAME[k], (x1 - x0) / 2, -0.155, 0.16, 400, SIGN, '#FFFFFF');
  resetT();
}
M.crate = mat('#E2B57C');

/** billboard person: legs swing with arc length (no foot sliding), body bob, head; faces screen-left or right */
function person(x, y, phase, dir, look, carry = null) {
  const fx = PX(x, y), fy = PY(x, y, 0), u = cam.s, hu = u * ZK;
  const sw = look.idle ? 0 : Math.sin(phase), bob = look.idle ? Math.sin(T * 2.2) * 0.008 * hu : Math.abs(Math.cos(phase)) * 0.025 * hu;
  const hip = fy - 0.3 * hu - bob;
  ctx.lineCap = 'round';
  ctx.strokeStyle = look.pants; ctx.lineWidth = 0.075 * u;
  for (const k of [-1, 1]) {
    const a = k * sw * 0.45;
    ctx.beginPath(); ctx.moveTo(fx + k * 0.02 * u, hip); ctx.lineTo(fx + Math.sin(a) * 0.3 * hu * dir, hip + Math.cos(a) * 0.3 * hu); ctx.stroke();
  }
  // back arm
  const arm = (side, ang, col) => {
    ctx.strokeStyle = col; ctx.lineWidth = 0.065 * u;
    ctx.beginPath(); ctx.moveTo(fx, hip - 0.3 * hu); ctx.lineTo(fx + Math.sin(ang) * 0.24 * hu * dir, hip - 0.3 * hu + Math.cos(ang) * 0.24 * hu); ctx.stroke();
  };
  arm(-1, -sw * 0.5, css(mixc(hex(look.coat), COOL, 0.25)));
  // body
  const bw = 0.27 * u, bh = 0.36 * hu;
  ctx.fillStyle = look.coat;
  rrPath(fx - bw / 2, hip - bh, bw, bh + 0.03 * hu, 0.09 * u); ctx.fill();
  if (look.apron) { ctx.fillStyle = look.apron; rrPath(fx - bw / 2 + 0.05 * u, hip - bh * 0.55, bw - 0.1 * u, bh * 0.6, 0.04 * u); ctx.fill(); }
  if (look.bag) {   // satchel on the near hip
    ctx.strokeStyle = css(mixc(hex(look.bag), COOL, 0.3)); ctx.lineWidth = 0.025 * u;
    ctx.beginPath(); ctx.moveTo(fx - bw * 0.35 * dir, hip - bh * 0.95); ctx.lineTo(fx + bw * 0.4 * dir, hip - bh * 0.25); ctx.stroke();
    ctx.fillStyle = look.bag; rrPath(fx + bw * 0.05 * dir - 0.1 * u, hip - bh * 0.42, 0.2 * u, 0.17 * hu, 0.04 * u); ctx.fill();
    ctx.fillStyle = css(mixc(hex(look.bag), COOL, 0.25)); ctx.fillRect(fx + bw * 0.05 * dir - 0.1 * u, hip - bh * 0.42, 0.2 * u, 0.05 * hu);
  }
  // head
  const hx = fx + 0.01 * u * dir, hy = hip - bh - 0.13 * hu;
  ctx.fillStyle = '#F2C9A8'; ctx.beginPath(); ctx.arc(hx, hy, 0.115 * hu, 0, TAU); ctx.fill();
  ctx.fillStyle = look.hair;
  ctx.beginPath(); ctx.arc(hx - 0.02 * hu * dir, hy - 0.025 * hu, 0.118 * hu, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  if (look.cap) {
    ctx.fillStyle = look.cap;
    ctx.beginPath(); ctx.arc(hx, hy - 0.04 * hu, 0.12 * hu, Math.PI, TAU); ctx.fill();
    ctx.fillRect(hx - (dir < 0 ? 0.2 : -0.0) * hu, hy - 0.05 * hu, 0.2 * hu, 0.035 * hu);
  }
  // front arm (reaches forward when carrying)
  const fa = carry ? -1.25 : sw * 0.5;
  arm(1, fa, look.coat);
  ctx.lineCap = 'butt';
  if (carry) {
    const hx2 = fx + Math.sin(fa) * 0.26 * hu * dir, hy2 = hip - 0.3 * hu + Math.cos(fa) * 0.26 * hu;
    carry.hand = [hx2, hy2];
  }
}
/** world position of a person's hand (approx) for hops */
const handOf = (x, y, dx, dy) => ({ x: x + dx * 0.16, y: y + dy * 0.16, z: 0.55 });

function drawVan(cx, cy, th, lane, t) {
  const c = Math.cos(th), s = Math.sin(th);
  const W2 = 0.31;
  const P2 = (a, b) => [cx + a * c - b * s, cy + a * s + b * c];
  // wheels (dark discs, drawn first)
  for (const [a, b] of [[-0.36, W2], [0.36, W2], [-0.36, -W2], [0.36, -W2]]) {
    const [wx, wy] = P2(a, b);
    ctx.fillStyle = '#2A3346'; ctx.beginPath(); ctx.ellipse(PX(wx, wy), PY(wx, wy, 0.11), 0.11 * cam.s, 0.1 * cam.s, 0, 0, TAU); ctx.fill();
  }
  const oriented = (a0, a1, z0, z1, m, deco) => {
    const C4 = [P2(a1, W2), P2(a0, W2), P2(a0, -W2), P2(a1, -W2)];
    const mx = (a0 + a1) / 2;
    const [ccx, ccy] = P2(mx, 0);
    for (let i = 0; i < 4; i++) {
      const p = C4[i], q = C4[(i + 1) % 4];
      const ex = (p[0] + q[0]) / 2 - ccx, ey = (p[1] + q[1]) / 2 - ccy, n = Math.hypot(ex, ey), nx = ex / n, ny = ey / n;
      if (nx * 0.612 + ny * 0.612 <= 0.001) continue;
      poly([p[0], p[1], z0, q[0], q[1], z0, q[0], q[1], z1, p[0], p[1], z1], shade(m, nx, ny, 0));
      if (deco) deco(p, q, nx, ny, z0, z1);
    }
    poly([C4[0][0], C4[0][1], z1, C4[1][0], C4[1][1], z1, C4[2][0], C4[2][1], z1, C4[3][0], C4[3][1], z1], m.t);
  };
  const cargo = () => oriented(-0.55, 0.16, 0.12, 0.8, M.van, (p, q, nx, ny, z0, z1) => {
    // long sides only: lane stripe + name
    const side = Math.abs(nx * c + ny * s) < 0.5;
    if (!side) return;
    let ux = q[0] - p[0], uy = q[1] - p[1];
    const len = Math.hypot(ux, uy); ux /= len; uy /= len;
    let ox = p[0], oy = p[1];
    if (ux - uy < 0) { ux = -ux; uy = -uy; ox = q[0]; oy = q[1]; }
    onWall(ox, oy, 0, ux, uy);
    ctx.fillStyle = LANE[lane]; ctx.fillRect(0.04, -0.38, len - 0.08, 0.08);
    ptext('솔빛우편', len / 2, -0.58, 0.17, 400, SIGN, INK, 'center', 1);
    resetT();
  });
  const cab = () => oriented(0.16, 0.56, 0.12, 0.62, M.van, (p, q, nx, ny, z0, z1) => {
    const front = nx * c + ny * s > 0.5;
    let ux = q[0] - p[0], uy = q[1] - p[1];
    const len = Math.hypot(ux, uy); ux /= len; uy /= len;
    let ox = p[0], oy = p[1];
    if (ux - uy < 0) { ux = -ux; uy = -uy; ox = q[0]; oy = q[1]; }
    onWall(ox, oy, 0, ux, uy);
    ctx.fillStyle = '#3F5274';
    if (front) { rrPath(0.06, -0.58, len - 0.12, 0.2, 0.03); ctx.fill(); ctx.fillStyle = '#FFE7A8'; ctx.fillRect(0.05, -0.3, 0.08, 0.05); ctx.fillRect(len - 0.13, -0.3, 0.08, 0.05); }
    else { rrPath(0.06, -0.58, len - 0.12, 0.18, 0.03); ctx.fill(); }
    ctx.fillStyle = LANE[lane]; if (!front) ctx.fillRect(0.0, -0.38, len, 0.08);
    resetT();
  });
  // draw the part further from the camera first
  if (c + s > 0) { cargo(); cab(); } else { cab(); cargo(); }
  // roof hatch
  const [hx, hy] = P2(-0.2, 0);
  onFloor(0.8);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(th); ctx.fillStyle = '#C7CFDA'; rrPath(-0.2, -0.15, 0.4, 0.3, 0.04); ctx.fill(); ctx.restore();
  resetT();
}

// ================================================================================================ per-frame movers
function dynamicObjects(t) {
  const list = [];
  const D = (x0, y0, z0, x1, y1, z1, d) => list.push({ x0, y0, z0, x1, y1, z1, d });

  // ① walkers (each posts a letter as it passes the mailbox)
  const looks = [
    { coat: '#F0B13F', pants: '#33415E', hair: '#3A2E2A' },
    { coat: '#7BB7C9', pants: '#4A3F5E', hair: '#2E2A30' },
    { coat: '#B49AD8', pants: '#33415E', hair: '#6B4A35' },
  ];
  for (let j = 0; j < WALK_N; j++) {
    const s = walkerS(j, t), q = at(WALK, s);
    const dir = q.dx - q.dy >= 0 ? 1 : -1;
    const k = Math.floor((s - S_POST) / WALK.L);            // passes done
    const tPass = (S_POST + k * WALK.L - WALK_PHI + (j * WALK.L) / WALK_N) / WALK_V;
    const sinceP = t - tPass;
    const hero = j === 0 && k === -1;                         // still approaching the first pass
    const heroPass = j === 0 && k === 0;
    const holding = mod(S_POST - s, WALK.L) < WALK.L * 0.7 && !(sinceP >= 0 && sinceP < POST_HOP);
    const carry = holding ? {} : null;
    D(q.x - 0.15, q.y - 0.15, 0, q.x + 0.15, q.y + 0.15, 0.95, () => {
      person(q.x, q.y, (s / 0.55) * Math.PI, dir, looks[j], carry);
      if (carry && carry.hand) {
        const [hx, hy] = carry.hand;
        const tmpS = cam.s * 0.7;
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.25 * dir);
        const kind = hero ? 'hero' : 'w';
        ctx.fillStyle = kind === 'hero' ? CORAL : '#FFFFFF';
        rrPath(-0.18 * tmpS, -0.13 * tmpS, 0.36 * tmpS, 0.25 * tmpS, 0.03 * tmpS); ctx.fill();
        ctx.strokeStyle = kind === 'hero' ? 'rgba(255,240,230,0.9)' : 'rgba(110,125,150,0.6)'; ctx.lineWidth = 0.025 * tmpS;
        ctx.beginPath(); ctx.moveTo(-0.15 * tmpS, -0.1 * tmpS); ctx.lineTo(0, 0.01 * tmpS); ctx.lineTo(0.15 * tmpS, -0.1 * tmpS); ctx.stroke();
        ctx.restore();
      }
    });
    // posting hop
    if (sinceP >= 0 && sinceP < POST_HOP) {
      const p = sinceP / POST_HOP;
      const q0 = at(WALK, S_POST);
      const a = handOf(q0.x, q0.y, -1, 0), b = SLOT;
      const pt = hopPt(a, b, outCubic(p), 0.18);
      const kind = heroPass ? 'hero' : 'w';
      D(pt.x - 0.15, pt.y - 0.1, pt.z, pt.x + 0.15, pt.y + 0.1, pt.z + 0.2, () => letterFly(pt.x, pt.y, pt.z, kind, -0.5 + p * 0.5, lerp(0.8, 0.55, p)));
    }
  }

  // ② belt letters, pushed letters, pusher arms
  const plate = [0, 0, 0];
  for (let i = 0; i < BELT_N; i++) {
    const u = BELT_V * t + BELT_PHI + i * BELT_GAP, m0 = Math.floor(u / BELT_LOOP);
    for (const back of [0, 1]) {
      const m = m0 - back, s = u - m * BELT_LOOP;             // back = the previous pass of this slot (s + LOOP)
      const g = m * BELT_N - i, lane = laneOf(g), hero = g === 0;
      const sPush = PUSH_X[lane] - BELT_X0;
      const tau = (s - sPush) / BELT_V;                        // time since this letter's push (negative = not yet)
      // arm extension for this pusher
      const e = tau < -0.06 ? 0 : tau < 0.08 ? outCubic((tau + 0.06) / 0.14) : tau < 0.16 ? 1 : 1 - inOut((tau - 0.16) / 0.26);
      if (tau > -0.06 && tau < 0.45) plate[lane] = Math.max(plate[lane], e);
      if (back) continue;
      if (tau < 0) {
        const x = BELT_X0 + s;
        const sc = smooth(s / 0.25);
        if (s < 0.02) continue;
        const scanned = x > SCAN.x1 - 0.05;
        D(x - 0.2, BELT_Y - 0.14, BELT_Z, x + 0.2, BELT_Y + 0.14, BELT_Z + 0.04, () => {
          if (sc < 1) { ctx.globalAlpha = sc; }
          letterFlat(x, BELT_Y, BELT_Z, hero ? 'hero' : 'w', scanned ? lane : -1);
          ctx.globalAlpha = 1;
        });
      } else if (tau < PUSH_T) {
        const p = tau / PUSH_T;
        const y = BELT_Y + 0.88 * outCubic(clamp(tau / 0.26));
        const z = BELT_Z - 0.16 * smooth((tau - 0.1) / 0.22);
        const x = PUSH_X[lane];
        D(x - 0.2, y - 0.14, z, x + 0.2, y + 0.14, z + 0.04, () => letterFlat(x, y, z, hero ? 'hero' : 'w', lane));
        void p;
      }
    }
  }
  for (let k = 0; k < 3; k++) {
    const x = PUSH_X[k], yp = 4.53 + 0.6 * plate[k];
    D(x - 0.22, 4.5, BELT_Z + 0.02, x + 0.22, yp, 0.56, () => {
      box(x - 0.035, 4.5, 0.42, x + 0.035, Math.max(4.51, yp - 0.06), 0.48, M.steelD);
      box(x - 0.21, yp - 0.06, BELT_Z + 0.03, x + 0.21, yp, 0.55, M.lane[k]);
    });
  }

  // ③ vans; bag hops crate → van at the dock (every van, its own lane) and van 0 → depot
  for (let j = 0; j < VAN_N; j++) {
    const s = vanS(j, t), q = at(ROAD, s);
    const th = Math.atan2(q.dy, q.dx);
    const lane = j;
    // AABB of the rotated footprint
    const c = Math.abs(Math.cos(th)), sn = Math.abs(Math.sin(th));
    const ex = 0.56 * c + 0.31 * sn, ey = 0.56 * sn + 0.31 * c;
    // offset the centre a little so the cab leads
    D(q.x - ex, q.y - ey, 0, q.x + ex, q.y + ey, 0.82, () => drawVan(q.x, q.y, th, lane, t));
    // loading hop: arrives when the van passes the dock
    const kd = Math.floor((s - S_DOCK) / ROAD.L);
    for (const kk of [kd, kd + 1]) {
      const tArr = (S_DOCK + kk * ROAD.L - VAN_PHI + (j * ROAD.L) / VAN_N) / VAN_V;
      const p = (t - (tArr - BAG_HOP)) / BAG_HOP;
      if (p <= 0 || p >= 1) continue;
      const qd = at(ROAD, S_DOCK);
      const a = { x: PUSH_X[lane], y: (CRATE_Y0 + CRATE_Y1) / 2, z: 0.3 }, b = { x: qd.x - 0.2 * qd.dx, y: qd.y - 0.2 * qd.dy, z: 0.82 };
      const pt = hopPt(a, b, inOut(p), 0.9);
      const heroBag = j === 0 && Math.abs(tArr - T_LOAD) < 1e-6;
      D(pt.x - 0.15, pt.y - 0.15, pt.z, pt.x + 0.15, pt.y + 0.15, pt.z + 0.3, () => bagAt(pt.x, pt.y, pt.z, LANE[lane], lerp(1, 0.75, smooth((p - 0.8) / 0.2)) * (heroBag ? 1.15 : 1)));
    }
    if (j === 0) {
      const kq = Math.floor((s - S_DROP) / ROAD.L);
      const tq = (S_DROP + kq * ROAD.L - VAN_PHI) / VAN_V;
      const p = (t - tq) / DROP_HOP;
      if (p > 0 && p < 1) {
        const qd = at(ROAD, S_DROP);
        const a = { x: qd.x, y: qd.y, z: 0.82 }, b = { x: (DEPOT.x0 + DEPOT.x1) / 2, y: (DEPOT.y0 + DEPOT.y1) / 2, z: DEPOT.z1 };
        const pt = hopPt(a, b, inOut(p), 0.8);
        D(pt.x - 0.15, pt.y - 0.15, pt.z, pt.x + 0.15, pt.y + 0.15, pt.z + 0.3, () => bagAt(pt.x, pt.y, pt.z, LANE[0], lerp(1.1, 0.8, smooth((p - 0.75) / 0.25))));
      }
    }
  }

  // ④ postman: picks a letter from the depot, drops one at every house mailbox
  {
    const s = postS(t), q = at(POST, s);
    const dir = q.dx - q.dy >= 0 ? 1 : -1;
    // which event is next / current
    const kP = Math.floor((s - S_PICK) / POST.L);
    const tPick = (S_PICK + kP * POST.L - POST_PHI) / POST_V;
    let holding = false, heroInHand = false;
    // holds a letter from the pick until each mailbox; the hero between T_PICK and T_MAIL0
    if (t >= T_PICK && t < T_MAIL0) { holding = true; heroInHand = true; }
    else {
      // between any mailbox drops he still holds white letters (except right after the last one)
      const sinceP = mod(s - S_PICK, POST.L);
      const lastMail = Math.max(...S_MAIL.map((m) => mod(m - S_PICK, POST.L)));
      holding = sinceP < lastMail;
    }
    for (let k = 0; k < MAILS.length; k++) {   // white letters are dropped while passing (the hero takes H2's slot once)
      const km = Math.floor((s - S_MAIL[k]) / POST.L);
      const tm = (S_MAIL[k] + km * POST.L - POST_PHI) / POST_V;
      const p = (t - tm) / MAIL_HOP;
      if (p > 0 && p < 1) {
        const isHero = k === 1 && Math.abs(tm - T_MAIL0) < 1e-6;
        const qm = at(POST, S_MAIL[k]);
        const a = handOf(qm.x, qm.y, 0, -1), b = { x: MAILS[k].x, y: MAILS[k].y + 0.12, z: 0.6 };
        const pt = hopPt(a, b, outCubic(p), 0.25);
        D(pt.x - 0.15, pt.y - 0.1, pt.z, pt.x + 0.15, pt.y + 0.1, pt.z + 0.2, () => letterFly(pt.x, pt.y, pt.z, isHero ? 'hero' : 'w', 0.3 - p * 0.3, lerp(0.8, 0.5, p)));
      }
    }
    for (const tp of [tPick, tPick + POST.L / POST_V]) {
      const pPick = (t - (tp - PICK_HOP)) / PICK_HOP;
      if (pPick <= 0 || pPick >= 1) continue;
      const isHero = Math.abs(tp - T_PICK) < 1e-6;
      const a = { x: (DEPOT.x0 + DEPOT.x1) / 2, y: DEPOT.y1, z: DEPOT.z1 - 0.1 };
      const qq = at(POST, S_PICK), b = handOf(qq.x, qq.y, 0, -1);
      const pt = hopPt(a, b, inOut(pPick), 0.5);
      D(pt.x - 0.15, pt.y - 0.1, pt.z, pt.x + 0.15, pt.y + 0.1, pt.z + 0.2, () => letterFly(pt.x, pt.y, pt.z, isHero ? 'hero' : 'w', pPick * 0.6, 0.75));
    }
    const carry = holding ? {} : null;
    D(q.x - 0.15, q.y - 0.15, 0, q.x + 0.15, q.y + 0.15, 0.98, () => {
      person(q.x, q.y, (s / 0.5) * Math.PI, dir, { coat: '#4E9FC0', pants: '#2F3C58', hair: '#2E2A30', cap: '#2F3C58', bag: '#F0B13F' }, carry);
      if (carry && carry.hand) {
        const [hx, hy] = carry.hand, k = cam.s * 0.7;
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.2 * dir);
        ctx.fillStyle = heroInHand ? CORAL : '#FFFFFF';
        rrPath(-0.18 * k, -0.13 * k, 0.36 * k, 0.25 * k, 0.03 * k); ctx.fill();
        ctx.strokeStyle = heroInHand ? 'rgba(255,240,230,0.9)' : 'rgba(110,125,150,0.6)'; ctx.lineWidth = 0.025 * k;
        ctx.beginPath(); ctx.moveTo(-0.15 * k, -0.1 * k); ctx.lineTo(0, 0.01 * k); ctx.lineTo(0.15 * k, -0.1 * k); ctx.stroke();
        ctx.restore();
      }
    });
  }
  return list;
}

/** where the hero is (for the pin), as a world point */
function heroAt(t) {
  if (t < T_POST0) { const q = at(WALK, walkerS(0, t)); return { x: q.x, y: q.y, z: 0.62 }; }
  if (t < T_POST1) {
    const q0 = at(WALK, S_POST);
    return hopPt(handOf(q0.x, q0.y, -1, 0), SLOT, outCubic((t - T_POST0) / POST_HOP), 0.18);
  }
  if (t < T_TUBE0) return { x: 4.2, y: 4.0, z: 1.0 };
  if (t < T_TUBE1) return at(TUBE, TUBE_V * (t - T_TUBE0));
  if (t < T_BELT0) return { x: BELT_X0, y: BELT_Y, z: 0.9 };
  if (t < T_PUSH) return { x: BELT_X0 + BELT_V * (t - T_BELT0), y: BELT_Y, z: BELT_Z };
  if (t < T_PUSH + PUSH_T) { const tau = t - T_PUSH; return { x: PUSH_X[0], y: BELT_Y + 0.88 * outCubic(clamp(tau / 0.26)), z: BELT_Z - 0.16 * smooth((tau - 0.1) / 0.22) }; }
  if (t < T_LOAD - BAG_HOP) return { x: PUSH_X[0], y: (CRATE_Y0 + CRATE_Y1) / 2, z: 0.3 };
  if (t < T_LOAD) {
    const qd = at(ROAD, S_DOCK);
    return hopPt({ x: PUSH_X[0], y: (CRATE_Y0 + CRATE_Y1) / 2, z: 0.3 }, { x: qd.x - 0.2 * qd.dx, y: qd.y - 0.2 * qd.dy, z: 0.82 }, inOut((t - (T_LOAD - BAG_HOP)) / BAG_HOP), 0.9);
  }
  if (t < T_DROP) { const q = at(ROAD, vanS(0, t)); return { x: q.x, y: q.y, z: 0.82 }; }
  const dep = { x: (DEPOT.x0 + DEPOT.x1) / 2, y: (DEPOT.y0 + DEPOT.y1) / 2, z: DEPOT.z1 };
  if (t < T_DROP + DROP_HOP) { const qd = at(ROAD, S_DROP); return hopPt({ x: qd.x, y: qd.y, z: 0.82 }, dep, inOut((t - T_DROP) / DROP_HOP), 0.8); }
  if (t < T_PICK - PICK_HOP) return dep;
  if (t < T_PICK) {
    const qq = at(POST, S_PICK);
    return hopPt({ x: dep.x, y: DEPOT.y1, z: DEPOT.z1 - 0.1 }, handOf(qq.x, qq.y, 0, -1), inOut((t - (T_PICK - PICK_HOP)) / PICK_HOP), 0.5);
  }
  if (t < T_MAIL0) { const q = at(POST, postS(t)); return { x: q.x, y: q.y, z: 0.62 }; }
  if (t < T_ARRIVE) {
    const qm = at(POST, S_MAIL[1]);
    return hopPt(handOf(qm.x, qm.y, 0, -1), { x: MAILS[1].x, y: MAILS[1].y + 0.12, z: 0.6 }, outCubic((t - T_MAIL0) / MAIL_HOP), 0.25);
  }
  return { x: MAILS[1].x, y: MAILS[1].y, z: 0.66 };
}

// ================================================================================================ depth sort
function sortObjects(list) {
  const n = list.length;
  for (const o of list) {
    o.sx0 = PX(o.x0, o.y1); o.sx1 = PX(o.x1, o.y0);
    o.sy0 = PY(o.x0, o.y0, o.z1); o.sy1 = PY(o.x1, o.y1, o.z0);
    o.dep = o.x0 + o.x1 + o.y0 + o.y1 + 0.816 * (o.z0 + o.z1);
    o.deps = null; o.mark = 0;
  }
  const E = 1e-4;
  for (let i = 0; i < n; i++) {
    const a = list[i];
    if (a.sx1 < -50 || a.sx0 > W + 50 || a.sy1 < -50 || a.sy0 > H + 50) { a.off = true; continue; }
    a.off = false;
    for (let j = i + 1; j < n; j++) {
      const b = list[j];
      if (a.sx1 <= b.sx0 || b.sx1 <= a.sx0 || a.sy1 <= b.sy0 || b.sy1 <= a.sy0) continue;
      let ab;   // a behind b?
      if (a.x1 <= b.x0 + E) ab = true; else if (b.x1 <= a.x0 + E) ab = false;
      else if (a.y1 <= b.y0 + E) ab = true; else if (b.y1 <= a.y0 + E) ab = false;
      else if (a.z1 <= b.z0 + E) ab = true; else if (b.z1 <= a.z0 + E) ab = false;
      else ab = a.dep < b.dep;
      if (ab) (b.deps ||= []).push(a); else (a.deps ||= []).push(b);
    }
  }
  const out = [];
  const visit = (o) => {
    if (o.mark) return;
    o.mark = 1;
    if (o.deps) for (const d of o.deps) visit(d);
    out.push(o);
  };
  for (const o of list) visit(o);
  return out;
}

// ================================================================================================ ground
let SIDES = [];
function islandFaces() {
  const faces = [];
  for (const p of PLOTS) {
    const [x0, y0, x1, y1] = p;
    // +x edge at x1 over [y0, y1], minus parts where another plot continues to the right
    let ivs = [[y0, y1]];
    for (const o of PLOTS) if (o !== p && o[0] <= x1 + 1e-9 && o[2] > x1 + 1e-9) ivs = subtract(ivs, o[1], o[3]);
    for (const [a, b] of ivs) if (b - a > 1e-6) faces.push({ k: 'x', x: x1, a, b, d: x1 + (a + b) / 2 });
    ivs = [[x0, x1]];
    for (const o of PLOTS) if (o !== p && o[1] <= y1 + 1e-9 && o[3] > y1 + 1e-9) ivs = subtract(ivs, o[0], o[2]);
    for (const [a, b] of ivs) if (b - a > 1e-6) faces.push({ k: 'y', y: y1, a, b, d: y1 + (a + b) / 2 });
  }
  faces.sort((u, v) => u.d - v.d);
  return faces;
}
function subtract(ivs, a, b) {
  const out = [];
  for (const [u, v] of ivs) {
    if (b <= u || a >= v) { out.push([u, v]); continue; }
    if (a > u) out.push([u, a]);
    if (b < v) out.push([b, v]);
  }
  return out;
}
const GR = { top: '#BEDFA4', lipL: '#94C77F', lipR: '#7DAE6E', soilL: '#D9A878', soilR: '#B5845A', rockL: '#C08F66', rockR: '#9C7150' };
function drawIsland() {
  // side faces
  for (const f of SIDES) {
    const lip = 0.12, mid = SLAB * 0.62;
    if (f.k === 'x') {
      const q = (z0, z1, c) => poly([f.x, f.a, z1, f.x, f.b, z1, f.x, f.b, z0, f.x, f.a, z0], c);
      q(-SLAB, 0, GR.soilR); q(-SLAB, -mid, GR.rockR); q(-lip, 0, GR.lipR);
    } else {
      const q = (z0, z1, c) => poly([f.a, f.y, z1, f.b, f.y, z1, f.b, f.y, z0, f.a, f.y, z0], c);
      q(-SLAB, 0, GR.soilL); q(-SLAB, -mid, GR.rockL); q(-lip, 0, GR.lipL);
    }
  }
  onFloor(0);
  ctx.beginPath();
  for (const [x0, y0, x1, y1] of PLOTS) ctx.rect(x0, y0, x1 - x0, y1 - y0);
  ctx.fillStyle = GR.top; ctx.fill();
  resetT();
}
function islandClip() {
  onFloor(0);
  ctx.beginPath();
  for (const [x0, y0, x1, y1] of PLOTS) ctx.rect(x0, y0, x1 - x0, y1 - y0);
  ctx.clip();
}

function drawGround(t) {
  onFloor(0);
  // ① plaza paving with a tile grid and the walking loop
  ctx.fillStyle = '#F2E4C8'; rrPath(0.2, 0.2, 5.6, 5.6, 0.35); ctx.fill();
  ctx.strokeStyle = 'rgba(205,180,140,0.35)'; ctx.lineWidth = 0.025;
  ctx.beginPath();
  for (let i = 1; i < 11; i++) { ctx.moveTo(0.2 + i * 0.5, 0.2); ctx.lineTo(0.2 + i * 0.5, 5.8); ctx.moveTo(0.2, 0.2 + i * 0.5); ctx.lineTo(5.8, 0.2 + i * 0.5); }
  ctx.stroke();
  ctx.strokeStyle = '#FBF3E3'; ctx.lineWidth = 0.6; ctx.lineJoin = 'round';
  ctx.beginPath(); WALK.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  ctx.fillStyle = '#A9D58F'; ctx.beginPath(); ctx.arc(2.9, 3.95, 0.72, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#E4CFA8'; ctx.lineWidth = 0.08; ctx.stroke();
  // ② post office floor + a driveway apron
  ctx.fillStyle = '#E6EBF1'; ctx.fillRect(6.0, 3.0, 7.0, 3.6);
  ctx.strokeStyle = 'rgba(160,175,195,0.28)'; ctx.lineWidth = 0.02;
  ctx.beginPath();
  for (let i = 1; i < 14; i++) { ctx.moveTo(6 + i * 0.5, 3.0); ctx.lineTo(6 + i * 0.5, 6.6); }
  for (let i = 1; i < 8; i++) { ctx.moveTo(6.0, 3 + i * 0.5); ctx.lineTo(13.0, 3 + i * 0.5); }
  ctx.stroke();
  // ③ road loop: curb, asphalt, centre dashes, paint
  const road = () => { ctx.beginPath(); ROAD.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
  road(); ctx.strokeStyle = '#E3E7EC'; ctx.lineWidth = ROAD_W + 0.16; ctx.stroke();
  road(); ctx.strokeStyle = '#6B7689'; ctx.lineWidth = ROAD_W; ctx.stroke();
  ctx.fillStyle = '#FFF4DC';
  for (let s = 0.2; s < ROAD.L - 0.2; s += 0.62) {
    const q = at(ROAD, s);
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(Math.atan2(q.dy, q.dx)); ctx.fillRect(-0.15, -0.025, 0.3, 0.05); ctx.restore();
  }
  // pond in the loop
  ctx.fillStyle = '#9BD3E2'; ctx.beginPath(); ctx.ellipse(11.3, 11.3, 0.62, 1.05, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#D5EEF3'; ctx.lineWidth = 0.08; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(11.15, 10.9, 0.18, 0.05, 0.3, 0, TAU); ctx.fill();
  // painted road word (along +x on the bottom side, reading from the viewer's side)
  ptext('천천히', 10.6, 14.02, 0.42, 400, SIGN, 'rgba(255,248,232,0.92)', 'center', 4);
  // ④ lane, sidewalks, yard paths
  ctx.fillStyle = '#EDE2CF'; ctx.fillRect(13.6, 13.95, 6.0, 1.5);
  ctx.fillStyle = '#F7EFE1'; ctx.fillRect(13.6, 13.95, 6.0, 0.16); ctx.fillRect(13.6, 15.29, 6.0, 0.16);
  for (const h of HOUSES) if (!h.front) { ctx.fillStyle = '#EDE2CF'; ctx.fillRect((h.x0 + h.x1) / 2 - 0.18, h.y1, 0.36, 13.95 - h.y1); }
  ptext('별빛길', 18.6, 14.72, 0.36, 400, SIGN, 'rgba(160,140,110,0.55)', 'center', 3);
  // floor step numbers (painted circles that draw on with their callout)
  CARDS.forEach((c, i) => {
    const t0 = SHOT_CARD[i] ? SHOT_CARD[i][0] : OV_CARD[i][0];
    const p = outCubic(seg(t, t0 + 0.05, t0 + 0.6));
    if (p <= 0) return;
    const [fx, fy] = c.floor;
    ctx.strokeStyle = CORAL; ctx.lineWidth = 0.06;
    ctx.beginPath(); ctx.arc(fx, fy, 0.34, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke();
    ctx.globalAlpha = smooth((p - 0.3) / 0.5);
    ctx.fillStyle = 'rgba(238,90,67,0.14)'; ctx.beginPath(); ctx.arc(fx, fy, 0.3, 0, TAU); ctx.fill();
    ptext(c.n, fx, fy + 0.02, 0.42, 400, SIGN, CORAL);
    ctx.globalAlpha = 1;
  });
  drawTrail(t);
  ctx.lineJoin = 'miter';
  resetT();
}

// the hero's route, painted on the floor as it travels (sampled once from heroAt in setup)
let TRAIL = [];
function buildTrail() {
  let last = null, acc = 0;
  for (let t = T_POST1; t <= T_ARRIVE + 1e-9; t += 0.004) {
    const h = heroAt(t);
    if (last) acc += Math.hypot(h.x - last.x, h.y - last.y);
    if (!last || acc >= 0.3) { TRAIL.push({ x: h.x, y: h.y, t }); acc = 0; }
    last = h;
  }
}
function drawTrail(t) {
  ctx.fillStyle = 'rgba(238,90,67,0.85)';
  ctx.beginPath();
  for (const d of TRAIL) {
    const a = smooth((t - d.t) / 0.18);
    if (a <= 0) break;
    const r = 0.07 * a;
    ctx.moveTo(d.x + r, d.y); ctx.arc(d.x, d.y, r, 0, TAU);
  }
  ctx.fill();
}

// soft shadows: static ones baked in setup (swept footprints along the light, blurred); movers get gradient blobs
let SHADOW = null;
const SH = { res: 22, x0: -1.5, y0: -1.5, w: 23, h: 21 };
function hull(pts) {
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function bakeShadows(headless) {
  const mk = () => { const c = document.createElement('canvas'); c.width = SH.w * SH.res; c.height = SH.h * SH.res; return c; };
  const opts = headless ? { willReadFrequently: true } : undefined;
  const cast = mk(), ao = mk(), out = mk();
  const gc = cast.getContext('2d', opts), ga = ao.getContext('2d', opts), go = out.getContext('2d', opts);
  for (const g of [gc, ga]) { g.setTransform(SH.res, 0, 0, SH.res, -SH.x0 * SH.res, -SH.y0 * SH.res); g.fillStyle = '#000'; }
  for (const c of casters) {
    if (c.kind === 'box') {
      const { x0, y0, x1, y1, h, k } = c;
      const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      const sh = pts.map(([x, y]) => [x + SHX * h, y + SHY * h]);
      const hp = hull(pts.concat(sh));
      gc.globalAlpha = 0.55 * k;
      gc.beginPath(); hp.forEach((p, i) => (i ? gc.lineTo(p[0], p[1]) : gc.moveTo(p[0], p[1]))); gc.fill();
      ga.globalAlpha = 0.7 * k;
      ga.fillRect(x0 - 0.06, y0 - 0.06, x1 - x0 + 0.12, y1 - y0 + 0.12);
    } else {
      const { x, y, zc, r } = c;
      gc.globalAlpha = 0.5;
      gc.beginPath(); gc.ellipse(x + SHX * zc, y + SHY * zc, r * 1.0, r * 0.95, 0, 0, TAU); gc.fill();
      gc.lineWidth = 0.1; gc.strokeStyle = '#000';
      gc.beginPath(); gc.moveTo(x, y); gc.lineTo(x + SHX * zc * 0.7, y + SHY * zc * 0.7); gc.stroke();
      ga.globalAlpha = 0.5;
      ga.beginPath(); ga.arc(x, y, 0.16, 0, TAU); ga.fill();
    }
  }
  go.filter = 'blur(5px)'; go.drawImage(cast, 0, 0);
  go.filter = 'blur(2px)'; go.drawImage(ao, 0, 0);
  go.filter = 'none';
  go.globalCompositeOperation = 'source-in';
  go.fillStyle = 'rgb(44,56,92)'; go.fillRect(0, 0, out.width, out.height);
  return out;
}
function blob(x, y, rx, ry, rot, a) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, `rgba(44,56,92,${a})`); g.addColorStop(0.55, `rgba(44,56,92,${a * 0.55})`); g.addColorStop(1, 'rgba(44,56,92,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawShadows(t) {
  ctx.save();
  islandClip();
  ctx.globalAlpha = 0.52;
  ctx.drawImage(SHADOW, SH.x0, SH.y0, SH.w, SH.h);
  ctx.globalAlpha = 1;
  // movers: walkers, vans, postman
  for (let j = 0; j < WALK_N; j++) { const q = at(WALK, walkerS(j, t)); blob(q.x + 0.12, q.y - 0.12, 0.3, 0.24, 0, 0.32); }
  for (let j = 0; j < VAN_N; j++) {
    const q = at(ROAD, vanS(j, t));
    blob(q.x + 0.18, q.y - 0.24, 0.78, 0.5, Math.atan2(q.dy, q.dx), 0.36);
  }
  { const q = at(POST, postS(t)); blob(q.x + 0.12, q.y - 0.12, 0.3, 0.24, 0, 0.32); }
  // the hero's contact shadow while it is airborne (shrinks with height)
  const h = heroAt(t);
  if (h.z > 0.45) blob(h.x, h.y, 0.22 / (1 + h.z * 0.4), 0.2 / (1 + h.z * 0.4), 0, 0.22);
  // arrival ring around H2's mailbox
  const q = t - T_ARRIVE;
  if (q > 0 && q < 1.3) {
    const m = MAILS[1];
    for (const [d, w] of [[0, 0.07], [0.18, 0.04]]) {
      const p = outCubic((q - d) / 1.0);
      if (p <= 0) continue;
      ctx.strokeStyle = `rgba(238,90,67,${0.8 * (1 - p)})`; ctx.lineWidth = w;
      ctx.beginPath(); ctx.arc(m.x, m.y, 0.25 + 1.6 * p, 0, TAU); ctx.stroke();
    }
  }
  ctx.restore();
  resetT();
}

// ================================================================================================ background
let BG = {};
function bakeBackground(headless) {
  const opts = headless ? { willReadFrequently: true } : undefined;
  // cloud sprite
  const c = document.createElement('canvas'); c.width = 360; c.height = 180;
  const g = c.getContext('2d', opts);
  g.filter = 'blur(6px)';
  g.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [x, y, r] of [[110, 110, 52], [170, 88, 66], [238, 108, 50], [190, 124, 46], [140, 126, 40]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  BG.cloud = c;
  // dot lattice tile (iso)
  const d = document.createElement('canvas'); d.width = 64; d.height = 32;
  const gd = d.getContext('2d', opts);
  gd.fillStyle = 'rgba(80,110,140,0.22)';
  for (const [x, y] of [[0, 0], [64, 0], [0, 32], [64, 32], [32, 16]]) { gd.beginPath(); gd.arc(x, y, 1.6, 0, TAU); gd.fill(); }
  BG.dots = d;
  // grain
  const n = document.createElement('canvas'); n.width = 256; n.height = 256;
  const gn = n.getContext('2d', opts);
  const img = gn.createImageData(256, 256), r = rand(911);
  for (let i = 0; i < 256 * 256; i++) { const v = 120 + r() * 135; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  gn.putImageData(img, 0, 0);
  BG.grain = n;
  // island underside shadow (the footprint, blurred)
  const u = document.createElement('canvas'); u.width = SH.w * 10; u.height = SH.h * 10;
  const gu = u.getContext('2d', opts);
  gu.filter = 'blur(9px)';
  gu.setTransform(10, 0, 0, 10, -SH.x0 * 10, -SH.y0 * 10);
  gu.fillStyle = 'rgb(60,80,110)';
  gu.beginPath(); for (const [x0, y0, x1, y1] of PLOTS) gu.rect(x0, y0, x1 - x0, y1 - y0); gu.fill();
  BG.under = u;
  // floating envelopes
  const rr = rand(4242);
  BG.env = Array.from({ length: 16 }, () => ({ x: rr() * W, y: 200 + rr() * 1500, s: 0.5 + rr() * 0.7, a: (rr() - 0.5) * 0.8, ph: rr() * TAU, k: 0.25 + rr() * 0.35 }));
  BG.clouds = [[-80, 560, 1.0, 0.3], [820, 420, 0.8, 0.25], [880, 1180, 1.1, 0.4], [-120, 1420, 1.2, 0.45], [600, 1700, 1.0, 0.5], [150, 860, 0.7, 0.2]];
}
function camRel() {
  // current camera relative to the overview: a point at overview screen position (x, y) lands at (rx(x), ry(y))
  const k = cam.s / (A * OV.zoom);
  const ovOx = OV.sx - A * OV.zoom * (OV.fx - OV.fy), ovOy = OV.sy - A * OV.zoom * ((OV.fx + OV.fy) / 2);
  return { k, mx: (x) => cam.ox + (x - ovOx) * k, my: (y) => cam.oy + (y - ovOy) * k };
}
function drawBackground(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#D7E9EC'); g.addColorStop(0.55, '#EEF1EA'); g.addColorStop(1, '#F7EEDF');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sun = ctx.createRadialGradient(240, 300, 0, 240, 300, 900);
  sun.addColorStop(0, 'rgba(255,250,236,0.85)'); sun.addColorStop(1, 'rgba(255,250,236,0)');
  ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
  const R = camRel();
  // dot lattice (parallax 0.35)
  const kp = 1 + (R.k - 1) * 0.35;
  const pat = ctx.createPattern(BG.dots, 'repeat');
  const ox = lerp(540, R.mx(540), 0.35), oy = lerp(1000, R.my(1000), 0.35);
  pat.setTransform(new DOMMatrix([kp, 0, 0, kp, ox, oy]));
  ctx.fillStyle = pat; ctx.globalAlpha = 0.8; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  // clouds and floating envelopes (parallax)
  for (const [x, y, s, k] of BG.clouds) {
    const px = lerp(x, R.mx(x), k), py = lerp(y, R.my(y), k), ss = s * (1 + (R.k - 1) * k);
    ctx.globalAlpha = 0.85;
    ctx.drawImage(BG.cloud, px - 180 * ss, py - 90 * ss, 360 * ss, 180 * ss);
  }
  ctx.globalAlpha = 1;
  for (const e of BG.env) {
    const x0 = e.x + Math.sin(t * 0.4 + e.ph) * 14, y0 = e.y - t * 9 * e.s + Math.cos(t * 0.5 + e.ph) * 8;
    const px = lerp(x0, R.mx(x0), e.k), py = lerp(y0, R.my(y0), e.k), ss = e.s * (1 + (R.k - 1) * e.k) * 22;
    ctx.save(); ctx.translate(px, py); ctx.rotate(e.a + Math.sin(t * 0.6 + e.ph) * 0.1);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FFFFFF'; rrPath(-ss, -ss * 0.68, ss * 2, ss * 1.36, ss * 0.12); ctx.fill();
    ctx.strokeStyle = 'rgba(120,140,170,0.6)'; ctx.lineWidth = ss * 0.08;
    ctx.beginPath(); ctx.moveTo(-ss * 0.86, -ss * 0.55); ctx.lineTo(0, ss * 0.08); ctx.lineTo(ss * 0.86, -ss * 0.55); ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // the island's shadow on the "sky" below it
  ctx.save();
  ctx.setTransform(cam.s, cam.s / 2, -cam.s, cam.s / 2, cam.ox, cam.oy + cam.s * ZK * 2.6);
  ctx.globalAlpha = 0.16;
  ctx.drawImage(BG.under, SH.x0, SH.y0, SH.w, SH.h);
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ================================================================================================ screen-space type
const HEAD = { x: 72, k: 150, l1: 262, l2: 368 };
function lineIn(t, t0, dur = 0.55) { return outExpo(seg(t, t0, t0 + dur)); }
function drawHeader(t) {
  // scrim so the title reads over the close-ups
  const sc = ctx.createLinearGradient(0, 0, 0, 560);
  sc.addColorStop(0, 'rgba(238,244,240,0.96)'); sc.addColorStop(0.62, 'rgba(238,244,240,0.78)'); sc.addColorStop(1, 'rgba(238,244,240,0)');
  ctx.fillStyle = sc; ctx.fillRect(0, 0, W, 560);
  // kicker
  const pk = lineIn(t, 0.05, 0.5);
  ctx.save();
  ctx.globalAlpha = pk;
  ctx.fillStyle = CORAL; rrPath(HEAD.x, HEAD.k - 17, 34, 34, 9); ctx.fill();
  ctx.strokeStyle = '#FFF6EE'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(HEAD.x + 8, HEAD.k - 7); ctx.lineTo(HEAD.x + 17, HEAD.k + 1); ctx.lineTo(HEAD.x + 26, HEAD.k - 7); ctx.stroke();
  ctx.lineJoin = 'miter';
  ctx.font = `700 30px ${KR}`; ctx.letterSpacing = '3px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillStyle = INK2; ctx.fillText('솔빛마을 우편 안내도', HEAD.x + 50 + (1 - pk) * 20, HEAD.k + 1);
  ctx.restore();
  // the title, two lines rising out of line masks, word by word
  ctx.font = `900 94px ${KR}`; ctx.letterSpacing = '-3px'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const words = [
    [{ s: '편지', c: CORAL }, { s: ' 한 통이', c: INK }],
    [{ s: '집에 닿기까지', c: INK }],
  ];
  const ys = [HEAD.l1, HEAD.l2];
  words.forEach((line, li) => {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, ys[li] - 100, W, 124); ctx.clip();
    let x = HEAD.x;
    line.forEach((w, wi) => {
      const p = lineIn(t, 0.18 + li * 0.14 + wi * 0.07, 0.7);
      ctx.fillStyle = w.c;
      ctx.fillText(w.s, x, ys[li] + (1 - p) * 110);
      x += ctx.measureText(w.s).width;
    });
    ctx.restore();
  });
  // when the letter arrives, "집에" gets a coral underline
  const pu = outCubic(seg(t, T_ARRIVE + 0.15, T_ARRIVE + 0.6));
  if (pu > 0) {
    ctx.font = `900 94px ${KR}`; ctx.letterSpacing = '-3px';
    const w = ctx.measureText('집에').width;
    ctx.fillStyle = 'rgba(238,90,67,0.9)';
    rrPath(HEAD.x - 2, HEAD.l2 + 12, (w + 4) * pu, 12, 6); ctx.fill();
  }
  ctx.letterSpacing = '0px';
}

function drawPin(t) {
  if (t > T_ARRIVE + 0.25) return;
  const h = heroAt(t);
  const x = PX(h.x, h.y), y = PY(h.x, h.y, h.z);
  const pin = outBack(seg(t, 0.25, 0.6), 1.8);
  const out = 1 - in2(seg(t, T_ARRIVE, T_ARRIVE + 0.2));
  const sc = pin * out;
  if (sc <= 0.01) return;
  const bob = Math.sin(t * 5.5) * 4;
  const tipY = y - 22 + bob;
  ctx.save();
  ctx.translate(x, tipY); ctx.scale(sc, sc);
  ctx.font = `800 26px ${KR}`; ctx.letterSpacing = '0px';
  const tw = ctx.measureText('내 편지').width, bw = tw + 34, bh = 44;
  ctx.fillStyle = 'rgba(33,48,74,0.18)'; rrPath(-bw / 2 + 3, -bh - 14 + 5, bw, bh, 22); ctx.fill();
  ctx.fillStyle = CORAL;
  rrPath(-bw / 2, -bh - 14, bw, bh, 22); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-9, -15); ctx.lineTo(9, -15); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('내 편지', 0, -bh / 2 - 13);
  ctx.restore();
}
function drawArrival(t) {
  const q = t - T_ARRIVE;
  if (q < 0) return;
  const m = MAILS[1];
  const x = PX(m.x, m.y), y = PY(m.x, m.y, 0.7);
  // burst ticks
  if (q < 0.6) {
    const p = outCubic(q / 0.5), a = 1 - smooth((q - 0.25) / 0.35);
    ctx.strokeStyle = `rgba(238,90,67,${a})`; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * TAU + 0.2, r0 = 26 + 30 * p, r1 = r0 + 18 * (1 - p) + 6;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * r0, y + Math.sin(ang) * r0 * 0.8); ctx.lineTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1 * 0.8); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
  // hearts float up
  for (let i = 0; i < 3; i++) {
    const p = seg(q, 0.1 + i * 0.16, 1.5 + i * 0.16);
    if (p <= 0 || p >= 1) continue;
    const hx = x + (i - 1) * 26 + Math.sin(p * 6 + i) * 8, hy = y - 20 - p * 120, r = 9 * (1 - p * 0.3) * outBack(p * 4, 2);
    ctx.globalAlpha = 1 - smooth((p - 0.6) / 0.4);
    ctx.fillStyle = CORAL;
    ctx.beginPath(); ctx.moveTo(hx, hy + r * 0.9);
    ctx.bezierCurveTo(hx - r * 1.4, hy - r * 0.1, hx - r * 0.6, hy - r * 1.1, hx, hy - r * 0.35);
    ctx.bezierCurveTo(hx + r * 0.6, hy - r * 1.1, hx + r * 1.4, hy - r * 0.1, hx, hy + r * 0.9);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // chip "도착!"
  const pc = outBack(seg(q, 0.05, 0.45), 2.0);
  if (pc > 0) {
    const cy = y - 96;
    ctx.save(); ctx.translate(x, cy); ctx.scale(pc, pc);
    ctx.font = `900 32px ${KR}`; ctx.letterSpacing = '-1px';
    const tw = ctx.measureText('도착!').width, bw = tw + 40, bh = 52;
    ctx.fillStyle = 'rgba(33,48,74,0.2)'; rrPath(-bw / 2 + 3, -bh / 2 + 5, bw, bh, 26); ctx.fill();
    ctx.fillStyle = INK; rrPath(-bw / 2, -bh / 2, bw, bh, 26); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, bh / 2 - 1); ctx.lineTo(9, bh / 2 - 1); ctx.lineTo(0, bh / 2 + 13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('도착!', 0, 1);
    ctx.restore();
    ctx.letterSpacing = '0px';
  }
}

function measureCards() {
  for (const c of CARDS) {
    ctx.font = `800 34px ${KR}`; ctx.letterSpacing = '-1px';
    const a = ctx.measureText(c.head).width;
    ctx.font = `600 23px ${KR}`; ctx.letterSpacing = '0px';
    const b = ctx.measureText(c.sub).width;
    c.w = Math.ceil(Math.max(a, b) + 78 + 26);
  }
}
function drawCard(i, t, tIn, tOut, cx, cy, mode, anchor) {
  const c = CARDS[i], an = anchor || c.anchor;
  const pOut = tOut != null ? seg(t, tOut, tOut + 0.28) : 0;
  if (t < tIn || pOut >= 1) return;
  const ax = PX(an[0], an[1]), ay = PY(an[0], an[1], an[2]);
  const w = c.w, h = CARD_H;
  // leader: straight up/down when the anchor sits under the card; else an elbow (vertical→horizontal, or horizontal→vertical)
  let pts;
  const edgeY = ay < cy ? cy : cy + h;
  if (ax >= cx + 24 && ax <= cx + w - 24) pts = [[ax, ay], [ax, edgeY]];
  else if (mode === 'hv') { const xa = clamp(ax, cx + 40, cx + w - 40); pts = [[ax, ay], [xa, ay], [xa, edgeY]]; }
  else { const atX = cx + w / 2 > ax ? cx : cx + w; pts = [[ax, ay], [ax, cy + h / 2], [atX, cy + h / 2]]; }
  let L = 0;
  for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  const pl = outExpo(seg(t, tIn, tIn + 0.42)) * (1 - in2(pOut));
  let d = pl * L;
  ctx.strokeStyle = 'rgba(33,48,74,0.82)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(ax, ay);
  for (let k = 1; k < pts.length && d > 0; k++) {
    const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], l = Math.hypot(x1 - x0, y1 - y0) || 1, q = Math.min(1, d / l);
    ctx.lineTo(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q);
    d -= l;
  }
  ctx.stroke();
  // the card enters along the last leader segment
  const [lx0, ly0] = pts[pts.length - 2], [lx1, ly1] = pts[pts.length - 1];
  const dl = Math.hypot(lx1 - lx0, ly1 - ly0) || 1, dirx = (lx1 - lx0) / dl, diry = (ly1 - ly0) / dl;
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  // anchor dot + pulse
  const pd = outBack(seg(t, tIn, tIn + 0.3), 2.2) * (1 - pOut);
  const pr = seg(t, tIn + 0.05, tIn + 0.7);
  if (pr > 0 && pr < 1) {
    ctx.strokeStyle = `rgba(238,90,67,${0.7 * (1 - pr)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(ax, ay, 9 + 26 * outCubic(pr), 0, TAU); ctx.stroke();
  }
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ax, ay, 9 * pd, 0, TAU); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = CORAL; ctx.beginPath(); ctx.arc(ax, ay, 4 * pd, 0, TAU); ctx.fill();
  // card
  const pc = outExpo(seg(t, tIn + 0.16, tIn + 0.62));
  const alpha = pc * (1 - smooth(pOut * 1.4));
  if (alpha <= 0.01) return;
  const sl = (1 - pc) * -26 - pOut * 14;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx + dirx * sl, cy + diry * sl);
  // reveal from the attach side
  const rk = lerp(0.3, 1, pc);
  if (Math.abs(dirx) > 0.5) { const rw = w * rk; ctx.beginPath(); ctx.rect(dirx > 0 ? -10 : w - rw - 10, -20, rw + 20, h + 40); ctx.clip(); }
  else { const rh = h * rk; ctx.beginPath(); ctx.rect(-10, diry > 0 ? -10 : h - rh - 10, w + 20, rh + 20); ctx.clip(); }
  ctx.fillStyle = 'rgba(33,48,74,0.13)'; rrPath(4, 7, w, h, 18); ctx.fill();
  ctx.fillStyle = CREAM; rrPath(0, 0, w, h, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(33,48,74,0.08)'; ctx.lineWidth = 2; ctx.stroke();
  // badge
  ctx.fillStyle = CORAL; ctx.beginPath(); ctx.arc(42, h / 2, 25, 0, TAU); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.font = `900 29px ${KR}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0px';
  ctx.fillText(c.n, 42, h / 2 + 1);
  // text in line masks
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const p1 = outExpo(seg(t, tIn + 0.26, tIn + 0.8)), p2 = outExpo(seg(t, tIn + 0.34, tIn + 0.88));
  ctx.save(); ctx.beginPath(); ctx.rect(76, 6, w - 76, 50); ctx.clip();
  ctx.fillStyle = INK; ctx.font = `800 34px ${KR}`; ctx.letterSpacing = '-1px';
  ctx.fillText(c.head, 78, 45 + (1 - p1) * 42);
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(76, 54, w - 76, 38); ctx.clip();
  ctx.fillStyle = INK2; ctx.font = `600 23px ${KR}`; ctx.letterSpacing = '0px';
  ctx.fillText(c.sub, 78, 79 + (1 - p2) * 32);
  ctx.restore();
  ctx.restore();
  ctx.letterSpacing = '0px';
}
function drawCallouts(t) {
  for (let i = 0; i < CARDS.length; i++) {
    const s = SHOT_CARD[i];
    if (s) drawCard(i, t, s[0], s[1], s[2], s[3], s[4], s[5]);
    const o = OV_CARD[i];
    drawCard(i, t, o[0], o[1], o[2], o[3], o[4]);
  }
}

// ================================================================================================ demo
defineDemo({
  id: '119-iso-explainer',
  title: '편지 한 통이 집에 닿기까지',
  tech: '아이소메트릭 설명 장면 · 흐름이 보이는 작은 세계',
  duration: DUR,
  background: '#EEF1EA',
  async setup(api) { captionScrim(api, '38,44,62');
    const all = '편지한통이집에닿기까지솔빛마을우편안내도우체통에쏙모인편지는관을타고우체국으로주소를읽고나눠요동네마다색이다른상자로트럭에싣고출발동네앞우편함까지달려요집배원이문앞까지마지막한걸음은사람손으로내편지도착!0123456789,';
    for (const wgt of [900, 800, 700, 600]) await fontReady(`${wgt} 60px "Pretendard Variable"`, all);
    await fontReady('400 60px "Do Hyeon"', '솔빛우체국천천히우편별빛길해달별1234');
    const cv = api.canvas({ type: '2d' });
    ctx = cv.ctx;
    buildStatics();
    SIDES = islandFaces();
    SHADOW = bakeShadows(api.headless);
    bakeBackground(api.headless);
    measureCards();
    buildTrail();
    // overview framing from the island's projected bounds (plus the tallest things at the back)
    let sx0 = 1e9, sx1 = -1e9, sy0 = 1e9, sy1 = -1e9;
    for (const [x0, y0, x1, y1] of PLOTS) for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
      sx0 = Math.min(sx0, x - y); sx1 = Math.max(sx1, x - y);
      sy0 = Math.min(sy0, (x + y) / 2 - ZK * 2.0); sy1 = Math.max(sy1, (x + y) / 2 + ZK * SLAB);
    }
    OV.zoom = Math.min(950 / ((sx1 - sx0) * A), 1150 / ((sy1 - sy0) * A));
    const cxw = (sx0 + sx1) / 2, cyw = (sy0 + sy1) / 2;      // = (fx − fy), (fx + fy)/2
    OV.fx = cyw + cxw / 2; OV.fy = cyw - cxw / 2;
    OV.sx = 540; OV.sy = 1062;
    CAM = camKeys();
    this.timing = { T_POST0, T_TUBE0, T_TUBE1, T_BELT0, T_PUSH, T_LOAD, T_DROP, T_PICK, T_MAIL0, T_ARRIVE };   // the hero's hand-offs (s)
  },
  frame(t) {
    T = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.letterSpacing = '0px';
    ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.imageSmoothingEnabled = true;
    const c = camAt(t);
    setCam(c.fx, c.fy, c.fz, c.zoom, c.sx, c.sy);
    drawBackground(t);
    drawIsland();
    drawGround(t);
    drawShadows(t);
    const objs = sortObjects(statics.concat(dynamicObjects(t)));
    for (const o of objs) { if (!o.off) { o.d(); resetT(); ctx.globalAlpha = 1; } }
    drawHeader(t);
    drawArrival(t);
    drawPin(t);
    drawCallouts(t);
    // fine grain over everything
    ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = ctx.createPattern(BG.grain, 'repeat'); ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
});

/** a soft scrim under the harness caption (bottom 19 % of the stage) so the white caption reads on light scenes */
function captionScrim(api, rgb) {
  const el = api.layer('div', { z: 999 });
  el.style.background = `linear-gradient(to bottom, rgba(${rgb},0) 81%, rgba(${rgb},.34) 89%, rgba(${rgb},.58) 100%)`;
  el.style.pointerEvents = 'none';
}
