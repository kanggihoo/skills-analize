/*
 * 104 · 오늘이라는 터널 — a tunnel built from type, flown through by a camera whose speed is a pure function of t.
 *
 * World: one bent path P(u) (u ≈ distance travelled). Everything is placed in cylinder coordinates around it,
 * (u, a, r) → P(u) + r·(cos a·B(u) + sin a·N(u)), so words can lie ON the wall (wrapped, u and a vary across
 * the word), stand ACROSS the path facing the camera (one u), or run AROUND it as rings.
 *   wall words   painted light, laid on the inner wall, each turned so it reads upright from the axis
 *   lanterns     paper signs across the path: lit panels with the letters cut out
 *   rings        clock times set around the circumference (the day goes 07:10 → 22:50)
 *   streaks      light specks that stretch with speed (motion-blur length = v·shutter) and shrink to motes at rest
 *   the wall     an opaque cylinder with a faint manuscript-grid texture, fogged toward the far end
 * Camera: u_cam(t) = ∫v, v(t) = creep → accelerate → rush → brake (끽) → rest, baked once into a table.
 * The day's colour runs along the tunnel (dawn blue-white → noon gold → evening coral → lantern amber).
 * Climax: the camera brakes at the end of the tunnel; one sentence stands in front of it, the tunnel behind dims,
 * and in the hold the tunnel's lights go out deepest-first (the bookend of the opening's lights-on cascade).
 * Draw calls: wall + 2 glyph batches (atlas A, atlas B) + streaks + motes + halo + sentence = 7. No custom shaders:
 * MeshBasicMaterial with vertex colours and (ONE, ONE) blending over premultiplied atlases; geometry rebuilt on the CPU.
 */
import * as THREE from '../node_modules/three/build/three.module.js';
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

THREE.ColorManagement.enabled = false;   // colours below are written as-is (output is not re-encoded either)

const D = 10;
const RT = 4.0;                                   // tunnel radius (world units)
const T_GO = 0.9, T_FAST = 2.5, T_BRAKE = 5.3, T_STOP = 7.0;
const V_CREEP = 2.4, V_TOP = 80, V_SURGE = 88, V_DRIFT = 0.16;
const STOP_GAP = 6.4;                             // camera → sentence at rest
const FONT = '"Pretendard Variable"';
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- content (small things of one day, in order)
const WALL = [
  [0.00, ['알람 다섯 번', '찬물 세수', '식빵 반 조각', '엘리베이터 거울', '이어폰 한쪽', '지각 3분', '젖은 우산', '출근길']],
  [0.20, ['회의', '또 회의', '메일 47통', '점심 뭐 먹지', '김밥 한 줄', '커피 두 잔', '답장 없음', '보고서 7차', '창밖 구름', '단톡방 알림', '택배 도착', '졸음']],
  [0.60, ['퇴근', '노을 한 조각', '버스 창가', '편의점 불빛', '엄마 전화', '붕어빵 냄새', '골목 가로등']],
  [0.84, ['라면 물', '빨래 개기', '내일 알람', '이불 속', '배터리 2%', '현관 불빛']],
];
// lantern signs across the path: [u fraction, text, angle (deg) of the sign's centre around the axis, radius]
const CARDS = [
  [0.036, '알람 세 번', 96, 1.85], [0.07, '식은 커피', 228, 1.9], [0.12, '만원 지하철', 38, 2.2], [0.19, '지각 3분', 150, 2.1],
  [0.26, '회의 또 회의', 268, 2.0], [0.33, '메일 47통', 70, 2.1], [0.40, '점심 뭐 먹지', 205, 2.0], [0.47, '답장 없음', 320, 2.2],
  [0.54, '커피 두 잔', 110, 2.0], [0.61, '퇴근길 노을', 250, 2.0], [0.68, '편의점 불빛', 30, 2.2], [0.75, '엄마 전화', 160, 2.1],
  [0.81, '붕어빵 냄새', 285, 2.0], [0.87, '골목 가로등', 80, 2.1], [0.92, '라면 물', 215, 2.2], [0.955, '현관 불빛', 330, 2.4],
];
const WALL_POOL = '오늘하루알람커피회의메일점심답장퇴근노을버스불빛전화라면빨래이불우산구름택배';   // faint syllables in the wall's grid
const TIMES = ['07:10', '08:05', '09:30', '11:00', '12:30', '13:45', '15:00', '16:20', '17:50', '19:10', '20:30', '21:40', '22:50'];
const LINES = [{ text: '23:47', size: 0.20, weight: 600, y: 1.02 }, { text: '오늘도', size: 0.44, weight: 900, y: 0.42 },
  { text: '잘 지나왔어', size: 0.62, weight: 900, y: -0.40, accentFrom: 1 }];   // accentFrom: first accented cell (지나왔어)

// colour of the day along the tunnel (fraction of the way), and the haze it sits in
const DAY = [[0, [0.72, 0.84, 1.0]], [0.15, [0.98, 0.94, 0.84]], [0.40, [1.0, 0.87, 0.60]], [0.62, [1.0, 0.62, 0.44]],
  [0.82, [1.0, 0.70, 0.42]], [1, [1.0, 0.80, 0.54]]];
const HAZE = [[0, [0.08, 0.10, 0.19]], [0.38, [0.17, 0.15, 0.23]], [0.64, [0.25, 0.12, 0.17]], [0.86, [0.16, 0.09, 0.13]], [1, [0.12, 0.07, 0.11]]];
const ACCENT = [1.0, 0.40, 0.24];
function grad(stops, f) {
  if (f <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (f <= stops[i][0]) {
      const [f0, a] = stops[i - 1], [f1, b] = stops[i], k = smooth((f - f0) / (f1 - f0));
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    }
  }
  return stops[stops.length - 1][1];
}

// ---------------------------------------------------------------- speed: a pure function of t; distance baked once
function vel(t) {
  if (t <= 0) return 0;
  if (t < T_GO) return V_CREEP * smooth(t / T_GO);
  if (t < T_FAST) return lerp(V_CREEP, V_TOP, ease.inOutCubic((t - T_GO) / (T_FAST - T_GO)));
  if (t < T_BRAKE) return lerp(V_TOP, V_SURGE, smooth((t - T_FAST) / (T_BRAKE - T_FAST)));
  if (t < T_STOP) return V_DRIFT + (V_SURGE - V_DRIFT) * Math.pow(1 - (t - T_BRAKE) / (T_STOP - T_BRAKE), 2.4);
  return V_DRIFT;
}
const DTT = 1 / 1000;
let UTAB = null;
function bakeTravel() {
  const n = Math.round(D / DTT) + 2;
  UTAB = new Float64Array(n);
  for (let i = 1; i < n; i++) UTAB[i] = UTAB[i - 1] + 0.5 * (vel((i - 1) * DTT) + vel(i * DTT)) * DTT;
}
function uCam(t) {
  const f = clamp(t, 0, D) / DTT, i = Math.min(UTAB.length - 2, Math.floor(f));
  return lerp(UTAB[i], UTAB[i + 1], f - i);
}

// ---------------------------------------------------------------- the path and its frames (table, linear lookup)
let U_S = 0, U_END = 0;          // sentence position, end of the tunnel
const U0 = -30, DU = 0.05;
let PT = null, PN = 0;           // per sample: P(3) B(3) N(3) T(3)
function rawPath(u, o) {
  // the bends ease in after the entrance, and the last stretch is straight so the sentence faces the camera
  const w = smooth((u - 4) / 80) * (1 - smooth((u - (U_S - 140)) / 92));
  o[0] = w * (17 * Math.sin(u / 50 + 0.6) + 4.2 * Math.sin(u / 23 + 1.9) - 17 * Math.sin(0.6) - 4.2 * Math.sin(1.9));
  o[1] = w * 4 * (Math.sin(u / 64 + 2.2) - Math.sin(2.2));
  o[2] = -u;
}
function bakePath() {
  PN = Math.ceil((U_END + 40 - U0) / DU) + 1;
  PT = new Float32Array(PN * 12);
  const a = [0, 0, 0], b = [0, 0, 0], p = [0, 0, 0];
  for (let i = 0; i < PN; i++) {
    const u = U0 + i * DU;
    rawPath(u, p); rawPath(u - 0.05, a); rawPath(u + 0.05, b);
    let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2];
    const tl = Math.hypot(tx, ty, tz); tx /= tl; ty /= tl; tz /= tl;
    // B = T × up, N = B × T
    let bx = -tz, bz = tx; const bl = Math.hypot(bx, bz); bx /= bl; bz /= bl;
    const nx = -bz * ty, ny = bz * tx - bx * tz, nz = bx * ty;
    PT.set([p[0], p[1], p[2], bx, 0, bz, nx, ny, nz, tx, ty, tz], i * 12);
  }
}
const PF = new Float32Array(12);
function frameAt(u) {
  const f = clamp((u - U0) / DU, 0, PN - 1.001), i = Math.floor(f), k = f - i, o = i * 12;
  for (let j = 0; j < 12; j++) PF[j] = PT[o + j] + (PT[o + 12 + j] - PT[o + j]) * k;
  return PF;
}
/** world position of cylinder coordinates (u, a, r) written into arr at o */
function posInto(arr, o, u, a, r) {
  const F = frameAt(u), c = Math.cos(a) * r, s = Math.sin(a) * r;
  arr[o] = F[0] + c * F[3] + s * F[6];
  arr[o + 1] = F[1] + c * F[4] + s * F[7];
  arr[o + 2] = F[2] + c * F[5] + s * F[8];
}

// ---------------------------------------------------------------- texture atlases (drawn once)
let SOFT = false;   // headless check: CPU-raster the setup canvases (a GPU canvas can differ by ±1 between page loads)
const ctx2d = (c) => c.getContext('2d', SOFT ? { willReadFrequently: true } : undefined);
const mctx = document.createElement('canvas').getContext('2d');
function metrics(text, size, weight, trackEm) {
  mctx.font = `${weight} ${size}px ${FONT}`;
  mctx.letterSpacing = `${(trackEm * size).toFixed(2)}px`;
  const m = mctx.measureText(text), ref = mctx.measureText('한글뷁');
  return { left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, adv: m.width,
    asc: ref.actualBoundingBoxAscent, desc: ref.actualBoundingBoxDescent };
}
function setFont(ctx, size, weight, trackEm) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.letterSpacing = `${(trackEm * size).toFixed(2)}px`;
  ctx.textBaseline = 'alphabetic';
}
/** glowing light-type: crisp letters over a baked blur halo */
function lightText(text, { size, weight = 800, trackEm = -0.02, glow = 0.15, padX = null }) {
  const m = metrics(text, size, weight, trackEm), pad = Math.ceil(size * glow * 1.7), px = padX == null ? pad : padX;
  const e = { kind: 'light', text, em: size, w: Math.ceil(m.left + m.right + 2 * px), h: Math.ceil(m.asc + m.desc + 2 * pad),
    ox: px + m.left, oy: pad + m.asc, adv: m.adv, pad };
  e.draw = (ctx, x, y) => {
    setFont(ctx, size, weight, trackEm);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = size * glow;
    ctx.fillText(text, x + e.ox, y + e.oy);
    ctx.shadowColor = 'rgba(255,255,255,0.55)'; ctx.shadowBlur = size * glow * 0.35;
    ctx.fillText(text, x + e.ox, y + e.oy);
    ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.fillText(text, x + e.ox, y + e.oy);
  };
  return e;
}
/** clock ring segment: advance-width cell (no side padding) so copies tile seamlessly around the circle */
function ringText(text, size) {
  const str = `${text}  ·  `, m = metrics(str, size, 700, 0.02), pad = Math.ceil(size * 0.3);
  const e = { kind: 'ring', text, em: size, w: Math.ceil(m.adv), h: Math.ceil(m.asc + m.desc + 2 * pad), pad };
  e.draw = (ctx, x, y) => {
    setFont(ctx, size, 700, 0.02);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = size * 0.16;
    ctx.fillText(`  ${text}  ·`, x + 2, y + pad + m.asc);
    ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.fillText(`  ${text}  ·`, x + 2, y + pad + m.asc);
  };
  return e;
}
/** lantern sign: a lit paper panel, a thin frame and the letters cut out of it */
function lanternText(text, size) {
  const m = metrics(text, size, 800, -0.02), ph = size * 0.34, pw = size * 0.58, g = Math.ceil(size * 0.42);
  const pW = m.left + m.right + 2 * pw, pH = m.asc + m.desc + 2 * ph;
  const e = { kind: 'lantern', text, em: size, w: Math.ceil(pW + 2 * g), h: Math.ceil(pH + 2 * g), pad: g };
  e.draw = (ctx, x, y) => {
    const x0 = x + g, y0 = y + g, rr = size * 0.2;
    const gr = ctx.createLinearGradient(0, y0, 0, y0 + pH);
    gr.addColorStop(0, 'rgba(255,255,255,0.62)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.92)'); gr.addColorStop(1, 'rgba(255,255,255,0.70)');
    ctx.fillStyle = gr;
    ctx.shadowColor = 'rgba(255,255,255,0.75)'; ctx.shadowBlur = size * 0.34;
    ctx.beginPath(); ctx.roundRect(x0, y0, pW, pH, rr); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = size * 0.045;
    const ins = size * 0.12;
    ctx.beginPath(); ctx.roundRect(x0 + ins, y0 + ins, pW - 2 * ins, pH - 2 * ins, rr * 0.6); ctx.stroke();
    setFont(ctx, size, 800, -0.02);
    ctx.fillStyle = '#000';
    ctx.fillText(text, x0 + pw + m.left, y0 + ph + m.asc);
    ctx.globalCompositeOperation = 'source-over';
  };
  return e;
}
/** procedural sprites: a speed streak (tail → round head) and a soft round glow */
function pillSprite() {
  const w = 256, h = 40;
  const e = { kind: 'sprite', w, h };
  e.draw = (ctx, x, y) => {
    const img = ctx.createImageData(w, h), d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const dy = (j + 0.5 - h / 2) / (h / 2), along = (i + 0.5) / w;
      const hx = Math.max(0, (i + 0.5 - (w - h / 2)) / (h / 2));
      const rr = Math.hypot(hx, dy);
      const a = Math.pow(along, 1.7) * Math.exp(-rr * rr * 3.2) * (rr < 1 ? 1 : 0);
      const o = (j * w + i) * 4; d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = Math.round(255 * clamp(a));
    }
    ctx.putImageData(img, x, y);
  };
  return e;
}
function glowSprite(size = 192) {
  const e = { kind: 'sprite', w: size, h: size };
  e.draw = (ctx, x, y) => {
    const img = ctx.createImageData(size, size), d = img.data;
    for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
      const r = Math.hypot(i + 0.5 - size / 2, j + 0.5 - size / 2) / (size / 2);
      const a = r >= 1 ? 0 : Math.pow(1 - r, 2.2) * (0.55 + 0.45 * Math.exp(-r * r * 18));
      const o = (j * size + i) * 4; d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = Math.round(255 * clamp(a));
    }
    ctx.putImageData(img, x, y);
  };
  return e;
}
function buildAtlas(W, entries, aniso) {
  const G = 10;
  let x = 0, y = 0, rowH = 0;
  for (const e of entries) {
    if (x + e.w > W) { x = 0; y += rowH + G; rowH = 0; }
    e.x = x; e.y = y; x += e.w + G; rowH = Math.max(rowH, e.h);
  }
  const H = Math.ceil((y + rowH) / 8) * 8;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = ctx2d(c);
  for (const e of entries) { ctx.save(); e.draw(ctx, e.x, e.y); ctx.restore(); }
  for (const e of entries) { e.u0 = e.x / W; e.u1 = (e.x + e.w) / W; e.vT = 1 - e.y / H; e.vB = 1 - (e.y + e.h) / H; }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.premultiplyAlpha = true;          // coverage in rgb → additive (ONE, ONE) blending, clean mip levels
  tex.anisotropy = aniso;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
}
function wallTexture(aniso, R) {
  const S = 1024, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = ctx2d(c);
  g.fillStyle = 'rgb(120,120,120)'; g.fillRect(0, 0, S, S);
  // paper fibre: faint blotches
  for (let i = 0; i < 900; i++) {
    const v = 105 + Math.floor(R() * 30);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.floor(R() * S), Math.floor(R() * S), 2 + Math.floor(R() * 10), 1 + Math.floor(R() * 3));
  }
  // manuscript-paper grid: 16 squares around a quarter turn, a gutter row every 4 squares along the tunnel
  const cell = S / 16;
  g.fillStyle = 'rgb(176,176,176)';
  for (let i = 0; i < 16; i++) { g.fillRect(i * cell, 0, 3, S); g.fillRect(0, i * cell, S, 3); }
  g.fillStyle = 'rgb(150,150,150)';
  for (let i = 0; i < 4; i++) g.fillRect(0, i * 4 * cell + cell * 0.5, S, cell * 0.16);
  // a few faint syllables written in the squares
  const pool = WALL_POOL;
  g.fillStyle = 'rgb(168,168,168)';
  g.font = `700 ${Math.round(cell * 0.62)}px ${FONT}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
    if (R() > 0.2) continue;
    g.fillText(pool[Math.floor(R() * pool.length)], (i + 0.5) * cell, (j + 0.5) * cell + 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = aniso;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

// ---------------------------------------------------------------- glyph batches: quads/grids in cylinder coordinates
class Batch {
  constructor(copies) { this.copies = copies; this.items = []; this.U = []; this.A = []; this.R = []; this.UV = []; this.I = []; }
  /** a (nx × ny) grid; fn(s, q) → [u, a, r] for s, q in 0..1 (s across the cell left → right, q bottom → top) */
  grid(item, e, nx, ny, fn) {
    const base = this.U.length;
    item.v0 = base;
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const s = i / nx, q = j / ny, [u, a, r] = fn(s, q);
      this.U.push(u); this.A.push(a); this.R.push(r);
      this.UV.push(lerp(e.u0, e.u1, s), lerp(e.vB, e.vT, q));
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = base + j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
      this.I.push(a, b, d, a, d, c);
    }
    item.v1 = this.U.length;
    this.items.push(item);
    return item;
  }
  finish(material) {
    const n = this.U.length, C = this.copies, L = this.I.length;
    this.n = n;
    this.U = Float32Array.from(this.U); this.A = Float32Array.from(this.A); this.R = Float32Array.from(this.R);
    this.pos = new Float32Array(n * C * 3);
    this.col = new Float32Array(n * C * 3);
    const uv = new Float32Array(n * C * 2), idx = new Uint32Array(L * C);
    for (let k = 0; k < C; k++) {
      uv.set(this.UV, k * n * 2);
      for (let i = 0; i < L; i++) idx[k * L + i] = this.I[i] + k * n;
    }
    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.colAttr = new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('color', this.colAttr);
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    this.mesh = new THREE.Mesh(geo, material);
    this.mesh.frustumCulled = false;
    return this.mesh;
  }
  /** shift[k]: path offset of copy k (motion-blur echoes); bright(item, k) → item gain; vfade(du) → per-vertex fade */
  update(shift, bright, vfade, uc) {
    const { n, U, A, R, pos, col } = this;
    for (let k = 0; k < this.copies; k++) {
      const du = shift[k], o = k * n;
      for (const it of this.items) {
        const g = bright(it, k);
        if (g < 0.002) {
          pos.fill(0, (o + it.v0) * 3, (o + it.v1) * 3); col.fill(0, (o + it.v0) * 3, (o + it.v1) * 3);
          continue;
        }
        const [tr, tg, tb] = it.tint;
        for (let v = it.v0; v < it.v1; v++) {
          const uu = U[v] + du, p = (o + v) * 3;
          posInto(pos, p, uu, A[v], R[v]);
          const f = g * vfade(uu - uc, it);
          col[p] = tr * f; col[p + 1] = tg * f; col[p + 2] = tb * f;
        }
      }
    }
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- little closed-form helpers
const bump = (x, w) => (x <= 0 ? 0 : (x / w) * Math.exp(1 - x / w));             // 0 → 1 at x = w → 0
const lightOn = (t, t0, ph) => {                                               // a lantern catching: flicker, then steady
  const k = t - t0;
  if (k <= 0) return 0;
  return smooth(k / 0.1) * (1 + 0.55 * Math.exp(-k / 0.11) * Math.sin(k * 64 + ph));
};

const FOV = track([[0, 60], [T_GO, 60], [T_FAST, 76, ease.inOutCubic], [T_BRAKE, 78], [6.25, 61, ease.outCubic], [T_STOP + 0.3, 55], [D, 52.5]]);
// fog / distance fade window (world units ahead of the camera): wide while travelling, close in once stopped
const FADE_N = track([[0, 34], [T_BRAKE, 40], [T_STOP, 14], [8.4, 5.5, ease.inOutCubic]]);
const FADE_F = track([[0, 150], [T_BRAKE, 160], [T_STOP, 70], [8.4, 26, ease.inOutCubic]]);
const T_OUT = 8.75;                               // lights-out cascade starts (deepest first)
const DIM = track([[0, 1], [T_STOP - 0.2, 1], [8.4, 0.34, ease.inOutCubic]]);     // the tunnel behind dims

defineDemo({
  id: '104-type-tunnel',
  title: '오늘이라는 터널',
  tech: '글자 터널 · 3D 공간을 지나가는 글자',
  duration: D,
  background: '#0b0c18',

  async setup(api) {
    const wallWords = [...new Set(WALL.flatMap((g) => g[1]))];
    const allText = wallWords.join('') + CARDS.map((c) => c[1]).join('') + TIMES.join('') + LINES.map((l) => l.text).join('') + WALL_POOL + '·%0123456789한글뷁';
    await Promise.all([
      fontReady(`800 112px ${FONT}`, allText),
      fontReady(`900 230px ${FONT}`, allText),
      fontReady(`700 72px ${FONT}`, allText),
      fontReady(`600 230px ${FONT}`, allText),
    ]);

    SOFT = api.headless;
    bakeTravel();
    U_S = uCam(D) + STOP_GAP;
    U_END = U_S + 48;
    bakePath();

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = api.W; el.height = api.H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(api.W, api.H, false);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 30, 150);
    const camera = new THREE.PerspectiveCamera(60, api.W / api.H, 0.1, 320);

    // ---- atlases
    const ent = {};
    const atlasA = [];
    for (const w of wallWords) atlasA.push(ent['w:' + w] = lightText(w, { size: 112 }));
    for (const tm of TIMES) atlasA.push(ent['r:' + tm] = ringText(tm, 64));
    atlasA.push(ent.pill = pillSprite(), ent.glow = glowSprite(192));
    const atlasB = [];
    for (const c of CARDS) atlasB.push(ent['c:' + c[1]] = lanternText(c[1], 108));
    for (const L of LINES) {
      L.cells = [];
      const big = 230, m = metrics(L.text, big, L.weight, -0.03);
      L.em = big; L.width = m.adv;
      if (L.text === '23:47') {
        const e = lightText(L.text, { size: big, weight: L.weight, trackEm: 0.06, glow: 0.12 });
        L.cells.push({ e, x: 0 });
        L.width = e.adv - 0.06 * big;
      }
      else {
        let pen = 0;
        for (const ch of L.text) {
          if (ch !== ' ') L.cells.push({ e: lightText(ch, { size: big, weight: L.weight, trackEm: 0, glow: 0.13 }), x: pen, ch });
          pen += metrics(ch, big, L.weight, 0).adv - 0.03 * big;
        }
        L.width = pen + 0.03 * big;
      }
      for (const c of L.cells) atlasB.push(c.e);
    }
    const texA = buildAtlas(2048, atlasA, aniso), texB = buildAtlas(2048, atlasB, aniso);
    const glyphMat = (map) => new THREE.MeshBasicMaterial({
      map, vertexColors: true, transparent: true, depthWrite: false, depthTest: true, fog: false, side: THREE.DoubleSide,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    });

    // ---- the wall: an opaque fogged cylinder along the path
    {
      const segA = 48, du = 1.25, u0 = -10, nU = Math.ceil((U_END + 12 - u0) / du);
      const pos = new Float32Array((nU + 1) * (segA + 1) * 3), uv = new Float32Array((nU + 1) * (segA + 1) * 2), idx = [];
      for (let iu = 0; iu <= nU; iu++) for (let ia = 0; ia <= segA; ia++) {
        const u = u0 + iu * du, a = (ia / segA) * TAU, o = iu * (segA + 1) + ia;
        posInto(pos, o * 3, u, a, RT);
        uv[o * 2] = (ia / segA) * 4; uv[o * 2 + 1] = u / ((TAU * RT) / 4);
      }
      for (let iu = 0; iu < nU; iu++) for (let ia = 0; ia < segA; ia++) {
        const a = iu * (segA + 1) + ia, b = a + 1, c = a + segA + 1, d = c + 1;
        idx.push(a, c, d, a, d, b);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      this.wallMat = new THREE.MeshBasicMaterial({ map: wallTexture(aniso, rand(1040)), side: THREE.DoubleSide, fog: true });
      const wall = new THREE.Mesh(geo, this.wallMat);
      wall.frustumCulled = false;
      scene.add(wall);
    }

    // ---- batch A: wall words + clock rings (with 3 motion-blur echoes); batch B: lantern signs (+ echoes)
    const R = rand(104);
    const bA = new Batch(4), bB = new Batch(4);
    const dayTint = (u) => grad(DAY, clamp(u / U_S));
    // wall words: rejection-placed boxes in (u, arc) so they never overlap; each turned to read upright from the axis
    const placed = [];
    const rW = RT - 0.045;
    for (let u = 2.5; u < U_END - 2; u += 0.5) {
      const f = u / U_S;
      let grp = WALL[0][1];
      for (const g of WALL) if (f >= g[0]) grp = g[1];
      const word = grp[Math.floor(R() * grp.length)], e = ent['w:' + word];
      for (let tries = 0; tries < 7; tries++) {
        const th = R() * TAU, s = lerp(0.34, 0.74, Math.pow(R(), 1.4)), k = s / e.em;
        const Wc = e.w * k, Hc = e.h * k, Wi = (e.w - 2 * e.pad) * k, Hi = (e.h - 2 * e.pad) * k;
        const bA_ = -Math.cos(th), bC = -Math.sin(th), uA = -Math.sin(th), uC = Math.cos(th);   // baseline / up in (axis, arc)
        const extA = Math.abs(Wi * bA_) + Math.abs(Hi * uA), extC = Math.abs(Wi * bC) + Math.abs(Hi * uC);
        if (extC > 3.3) continue;
        const box = { u0: u - extA / 2 - 0.25, u1: u + extA / 2 + 0.25, c: th * rW, hc: extC / 2 + 0.2 };
        let hit = false;
        for (let i = placed.length - 1; i >= 0 && !hit; i--) {
          const p = placed[i];
          if (p.u1 < box.u0 - 8) break;
          if (p.u1 < box.u0 || p.u0 > box.u1) continue;
          let dc = Math.abs(p.c - box.c) % (TAU * rW); dc = Math.min(dc, TAU * rW - dc);
          if (dc < p.hc + box.hc) hit = true;
        }
        if (hit) continue;
        placed.push(box);
        placed.sort((a, b) => a.u1 - b.u1);
        const nx = clamp(Math.ceil(Wc / 0.42), 1, 14);
        bA.grid({ kind: 'wall', u, on: 0.12 + 0.0105 * u, ph: R() * 6, gain: lerp(0.62, 1.0, R()), tint: dayTint(u), breathe: 2 + R() * 3 },
          e, nx, 1, (sx, q) => {
            const x = (sx - 0.5) * Wc, y = (q - 0.5) * Hc;
            return [u + x * bA_ + y * uA, th + (x * bC + y * uC) / rW, rW];
          });
        break;
      }
    }
    // clock rings: the time repeated around the circumference, letters' tops outward, reading clockwise
    const ringStep = (U_S - 17 - 9) / (TIMES.length - 1);
    TIMES.forEach((tm, i) => {
      const e = ent['r:' + tm], u = 9 + i * ringStep, h = 0.36, r0 = RT - 0.62;
      const arc = (e.w / e.h) * h, n = Math.max(4, Math.round((TAU * r0) / arc)), dA = TAU / n;
      const it0 = { kind: 'ring', u, on: 0.12 + 0.0105 * u, ph: i * 1.7, gain: 0.9, tint: dayTint(u), breathe: 3 };
      for (let j = 0; j < n; j++) {
        const a0 = Math.PI / 2 + dA / 2 - j * dA + i * 0.37;
        bA.grid({ ...it0 }, e, 6, 1, (s, q) => [u, a0 - s * dA, r0 + (q - 0.5) * h]);
      }
    });
    // lantern signs across the path
    for (const [fu, text, deg, rad] of CARDS) {
      const e = ent['c:' + text], u = fu * U_S, s = 0.5, k = s / e.em, Wc = e.w * k, Hc = e.h * k;
      const cx = Math.cos(deg * Math.PI / 180) * rad, cy = Math.sin(deg * Math.PI / 180) * rad;
      bB.grid({ kind: 'card', u, on: 0.12 + 0.0105 * u, ph: R() * 6, gain: 0.8, tint: dayTint(u), breathe: 2.5 }, e, 1, 1, (sx, q) => {
        const x = cx + (sx - 0.5) * Wc, y = cy + (q - 0.5) * Hc;
        return [u, Math.atan2(y, x), Math.hypot(x, y)];
      });
    }
    scene.add(bA.finish(glyphMat(texA)), bB.finish(glyphMat(texB)));

    // ---- light specks: streaks at speed, motes at rest (same specks, two sprites)
    const NS = 820;
    const sp = { u: new Float32Array(NS), a: new Float32Array(NS), r: new Float32Array(NS), w: new Float32Array(NS), g: new Float32Array(NS), ph: new Float32Array(NS), tint: [] };
    for (let i = 0; i < NS; i++) {
      sp.u[i] = 1 + R() * (U_END - 1); sp.a[i] = R() * TAU; sp.r[i] = lerp(1.35, RT - 0.3, Math.sqrt(R()));
      sp.w[i] = lerp(0.012, 0.04, R() * R()); sp.g[i] = lerp(0.3, 1, R()); sp.ph[i] = R() * TAU;
      const tnt = dayTint(sp.u[i]), wm = R() < 0.25 ? 0.6 : 1;
      sp.tint.push([tnt[0], tnt[1] * wm + (1 - wm) * 0.75, tnt[2] * wm + (1 - wm) * 0.55]);
    }
    const quadMesh = (e, tex) => {
      const pos = new Float32Array(NS * 12), col = new Float32Array(NS * 12), uv = new Float32Array(NS * 8), idx = new Uint32Array(NS * 6);
      for (let i = 0; i < NS; i++) {
        uv.set([e.u0, e.vB, e.u0, e.vT, e.u1, e.vB, e.u1, e.vT], i * 8);   // 0 tail-left 1 tail-right 2 head-left 3 head-right
        idx.set([i * 4, i * 4 + 2, i * 4 + 3, i * 4, i * 4 + 3, i * 4 + 1], i * 6);
      }
      const geo = new THREE.BufferGeometry();
      const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage), ca = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('position', pa); geo.setAttribute('color', ca); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setIndex(new THREE.BufferAttribute(idx, 1));
      const mesh = new THREE.Mesh(geo, glyphMat(tex));
      mesh.frustumCulled = false;
      scene.add(mesh);
      return { pos, col, pa, ca };
    };
    this.streaks = quadMesh(ent.pill, texA);
    this.motes = quadMesh(ent.glow, texA);
    this.sp = sp;

    // ---- the sentence at the end (and a warm halo behind it)
    {
      const F = frameAt(U_S), P = [F[0], F[1], F[2]], Bv = [F[3], F[4], F[5]], Nv = [F[6], F[7], F[8]], Tv = [F[9], F[10], F[11]];
      const quads = [];   // { e, x0, y0, w, h (world, plane coords), cols, line, idx, accent, z }
      const glowQ = { x0: -4.2, y0: -3.9, w: 8.4, h: 8.4 };
      let order = 0;
      for (const [li, L] of LINES.entries()) {
        const k = L.size / L.em, x0 = -L.width * k / 2;
        L.cells.forEach((c, ci) => {
          const e = c.e;
          const left = x0 + c.x * k - e.ox * k, top = L.y + e.oy * k;
          quads.push({ e, x0: left, y0: top - e.h * k, w: e.w * k, h: e.h * k, cols: L.text === '23:47' ? 1 : 5, line: li, idx: order++,
            accent: L.accentFrom != null && ci >= L.accentFrom, z: 0 });
        });
      }
      let nv = 0;
      for (const q of quads) { q.v0 = nv; nv += (q.cols + 1) * 2; }
      const pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = [];
      for (const q of quads) {
        for (let j = 0; j <= 1; j++) for (let i = 0; i <= q.cols; i++) {
          const v = q.v0 + j * (q.cols + 1) + i;
          uv[v * 2] = lerp(q.e.u0, q.e.u1, i / q.cols); uv[v * 2 + 1] = j ? q.e.vT : q.e.vB;
        }
        for (let i = 0; i < q.cols; i++) {
          const a = q.v0 + i, b = a + 1, c = a + q.cols + 1, d = c + 1;
          idx.push(a, b, d, a, d, c);
        }
      }
      const geo = new THREE.BufferGeometry();
      const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage), ca = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('position', pa); geo.setAttribute('color', ca); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      // the halo uses atlas A's glow sprite: give it its own small mesh so the sentence batch stays on atlas B
      const haloGeo = new THREE.BufferGeometry();
      const hpos = new Float32Array(12), hcol = new Float32Array(12);
      const e = ent.glow;
      haloGeo.setAttribute('position', new THREE.BufferAttribute(hpos, 3).setUsage(THREE.DynamicDrawUsage));
      haloGeo.setAttribute('color', new THREE.BufferAttribute(hcol, 3).setUsage(THREE.DynamicDrawUsage));
      haloGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([e.u0, e.vB, e.u1, e.vB, e.u0, e.vT, e.u1, e.vT]), 2));
      haloGeo.setIndex([0, 1, 3, 0, 3, 2]);
      const haloMesh = new THREE.Mesh(haloGeo, glyphMat(texA));
      haloMesh.frustumCulled = false;
      const sentMesh = new THREE.Mesh(geo, glyphMat(texB));
      sentMesh.frustumCulled = false;
      scene.add(haloMesh, sentMesh);
      this.sent = { P, Bv, Nv, Tv, quads, pos, col, pa, ca, hpos, hcol, haloGeo, glowQ };
    }

    // ---- a static vignette over everything (deeper at the bottom, where the caption sits)
    {
      const { ctx } = api.canvas({ z: 2, attrs: SOFT ? { willReadFrequently: true } : undefined });
      const g = ctx.createRadialGradient(540, 900, 260, 540, 960, 1250);
      g.addColorStop(0, 'rgba(6,5,14,0)'); g.addColorStop(0.62, 'rgba(6,5,14,0.16)'); g.addColorStop(1, 'rgba(6,5,14,0.72)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, api.H);
      const b = ctx.createLinearGradient(0, 1480, 0, 1920);
      b.addColorStop(0, 'rgba(6,5,14,0)'); b.addColorStop(1, 'rgba(6,5,14,0.55)');
      ctx.fillStyle = b; ctx.fillRect(0, 1480, api.W, 440);
    }

    Object.assign(this, { renderer, scene, camera, bA, bB });
  },

  frame(t) {
    const { renderer, scene, camera, bA, bB, sp, sent } = this;
    const uc = uCam(t), v = vel(t);
    const kb = t - T_BRAKE;

    // ---------------- camera: on the axis, banking into the bends, nose-dip + damped shake at the brake
    const F = frameAt(uc);
    const P = [F[0], F[1], F[2]], Bv = [F[3], F[4], F[5]], Nv = [F[6], F[7], F[8]];
    const Fa = frameAt(uc + 3), Ta = [Fa[9], Fa[10], Fa[11]];
    const Fb = frameAt(uc - 3), Tb = [Fb[9], Fb[10], Fb[11]];
    const kLat = ((Ta[0] - Tb[0]) * Bv[0] + (Ta[1] - Tb[1]) * Bv[1] + (Ta[2] - Tb[2]) * Bv[2]) / 6;   // lateral curvature
    const roll = clamp(kLat * v * v * 0.0021, -0.22, 0.22);
    const shake = kb > 0 ? Math.exp(-kb / 0.26) : 0;
    const vk = v / V_SURGE;
    const sx = 0.05 * shake * Math.sin(kb * 41) + 0.012 * vk * (Math.sin(t * 37) + 0.6 * Math.sin(t * 59 + 1)) + 0.03 * Math.sin(t * 0.9) * (1 - vk);
    const sy = 0.075 * shake * Math.sin(kb * 52 + 0.7) + 0.012 * vk * (Math.sin(t * 43 + 2) + 0.5 * Math.sin(t * 71)) + 0.022 * Math.sin(t * 1.3 + 1) * (1 - vk);
    const camY = -0.12;
    camera.position.set(P[0] + Bv[0] * sx + Nv[0] * (camY + sy), P[1] + Bv[1] * sx + Nv[1] * (camY + sy), P[2] + Bv[2] * sx + Nv[2] * (camY + sy));
    const dip = 0.95 * bump(kb, 0.17) - 0.25 * bump(kb - 0.34, 0.25);
    const Ft = frameAt(uc + 10);
    const ty = camY - dip + 0.1 * ramp(t, 6.4, 7.6);
    camera.up.set(Nv[0] * Math.cos(roll) + Bv[0] * Math.sin(roll), Nv[1] * Math.cos(roll) + Bv[1] * Math.sin(roll), Nv[2] * Math.cos(roll) + Bv[2] * Math.sin(roll));
    camera.lookAt(Ft[0] + Ft[6] * ty, Ft[1] + Ft[7] * ty, Ft[2] + Ft[8] * ty);
    camera.fov = FOV(t);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);   // the mote billboards read this frame's camera axes (never the previous seek's)

    // ---------------- light & haze
    const fN = FADE_N(t), fF = FADE_F(t), dim = DIM(t);
    const flash = 1 + 0.32 * (kb > 0 ? Math.exp(-kb / 0.11) : 0);
    const haze = grad(HAZE, clamp(uc / U_S));
    const hz = 1.25 * (0.55 + 0.45 * dim) * (1 + 0.25 * (flash - 1));
    scene.fog.color.setRGB(haze[0] * hz, haze[1] * hz, haze[2] * hz);
    scene.fog.near = fN * 0.15; scene.fog.far = fF * 0.95;
    renderer.setClearColor(scene.fog.color, 1);
    const wl = 0.85 * (0.45 + 0.55 * dim) * flash * (0.35 + 0.65 * ramp(t, 0, 0.6));
    this.wallMat.color.setRGB(haze[0] * wl * 1.15 + 0.012, haze[1] * wl * 1.1 + 0.012, haze[2] * wl + 0.02);

    const far = (d) => (d < -0.5 ? 0 : 1 - smooth((d - fN) / (fF - fN)));
    // deep down the tunnel (behind the sentence's letters) goes dark before the sentence lights; the walls around it stay, dimmed
    const bk = ramp(t, 5.6, 6.5);
    const beyond = (u) => 1 - bk * smooth((u - U_S - 3) / 11);
    // the bookend of the opening: in the hold the tunnel's lights go out from the deep end toward the camera
    const lightsOut = (u, ph) => {
      const k = t - (T_OUT + (U_S + 34 - u) * 0.026);
      if (k <= 0) return 1;
      return 1 - 0.8 * smooth(k / 0.14) * (1 - 0.5 * Math.exp(-k / 0.08) * Math.sin(k * 70 + ph));
    };
    const near = (d) => smooth((d - 0.7) / 1.9);

    // ---------------- glyph batches: main copy + three echoes along the path (length ∝ speed)
    const blur = smooth((v - 10) / 45);
    const shift = [0, v * 0.011, v * 0.022, v * 0.034];
    const echo = [1, 0.5 * blur, 0.3 * blur, 0.16 * blur];
    const gain = (it, k) => {
      const d = it.u - uc;
      if (k > 0 && (echo[k] < 0.01 || d > 80 || d < -2)) return 0;
      if (d > fF + 6 || d < -6) return 0;
      const on = lightOn(t, it.on, it.ph);
      const breathe = 1 + 0.06 * Math.sin(t * it.breathe + it.ph);
      const ek = k > 0 && it.kind === 'card' ? smooth((d - 5) / 9) : 1;   // no echoes on a sign right in front of the lens
      return it.gain * on * breathe * echo[k] * ek * dim * flash * beyond(it.u) * lightsOut(it.u, it.ph);
    };
    const vfWall = (d) => far(d);
    const vfCard = (d) => far(d) * near(d);
    bA.update(shift, gain, vfWall, uc);
    bB.update(shift, gain, vfCard, uc);

    // ---------------- specks: streaks (length = v · shutter) ↔ motes (at rest)
    {
      const S = this.streaks, M = this.motes;
      const L = v * 0.075, kS = smooth((v - 6) / 30), kM = 1 - smooth((v - 3) / 14);
      const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
      const h = new Float32Array(3), tl = new Float32Array(3);
      const cr = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), cu = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      for (let i = 0; i < sp.u.length; i++) {
        const d = sp.u[i] - uc, o = i * 12;
        const g0 = d < 0.6 || d > fF + 2 ? 0 : sp.g[i] * far(d) * (0.3 + 0.7 * beyond(sp.u[i])) * (0.5 + 0.5 * lightsOut(sp.u[i], sp.ph[i])) * smooth((d - 0.6) / 2.2) * lightOn(t, 0.12 + 0.0105 * sp.u[i], sp.ph[i]) * flash;
        const [tr, tg, tb] = sp.tint[i];
        // streak
        const gs = g0 * kS * (0.75 + 0.25 * dim);
        if (gs > 0.002) {
          posInto(h, 0, sp.u[i], sp.a[i], sp.r[i]);
          posInto(tl, 0, sp.u[i] + L + sp.w[i] * 2, sp.a[i], sp.r[i]);
          let dx = tl[0] - h[0], dy = tl[1] - h[1], dz = tl[2] - h[2];
          const mx = (h[0] + tl[0]) / 2 - cx, my = (h[1] + tl[1]) / 2 - cy, mz = (h[2] + tl[2]) / 2 - cz;
          let qx = dy * mz - dz * my, qy = dz * mx - dx * mz, qz = dx * my - dy * mx;
          const ql = Math.hypot(qx, qy, qz) || 1, w = sp.w[i];
          qx *= w / ql; qy *= w / ql; qz *= w / ql;
          S.pos.set([tl[0] - qx, tl[1] - qy, tl[2] - qz, tl[0] + qx, tl[1] + qy, tl[2] + qz,
            h[0] - qx, h[1] - qy, h[2] - qz, h[0] + qx, h[1] + qy, h[2] + qz], o);
          const c = gs * 1.1;
          for (let j = 0; j < 4; j++) { S.col[o + j * 3] = tr * c; S.col[o + j * 3 + 1] = tg * c; S.col[o + j * 3 + 2] = tb * c; }
        } else { S.pos.fill(0, o, o + 12); S.col.fill(0, o, o + 12); }
        // mote (slow drift at rest)
        const gm = g0 * kM * (0.55 + 0.45 * Math.sin(t * 1.7 + sp.ph[i] * 3)) * (0.6 + 0.4 * dim);
        if (gm > 0.002) {
          const rise = 0.05 * Math.sin(t * 0.8 + sp.ph[i]) + 0.03 * t;
          posInto(h, 0, sp.u[i], sp.a[i] + 0.012 * Math.sin(t * 0.6 + sp.ph[i] * 2), sp.r[i]);
          h[0] += Nv[0] * rise; h[1] += Nv[1] * rise; h[2] += Nv[2] * rise;
          const w = sp.w[i] * 3.2;
          const ax = cr.x * w, ay = cr.y * w, az = cr.z * w, bx = cu.x * w, by = cu.y * w, bz = cu.z * w;
          M.pos.set([h[0] - ax - bx, h[1] - ay - by, h[2] - az - bz, h[0] + ax - bx, h[1] + ay - by, h[2] + az - bz,
            h[0] - ax + bx, h[1] - ay + by, h[2] - az + bz, h[0] + ax + bx, h[1] + ay + by, h[2] + az + bz], o);
          const c = gm * 0.9;
          for (let j = 0; j < 4; j++) { M.col[o + j * 3] = tr * c; M.col[o + j * 3 + 1] = tg * c; M.col[o + j * 3 + 2] = tb * c; }
        } else { M.pos.fill(0, o, o + 12); M.col.fill(0, o, o + 12); }
      }
      S.pa.needsUpdate = S.ca.needsUpdate = M.pa.needsUpdate = M.ca.needsUpdate = true;
    }

    // ---------------- the sentence: dim lanterns far away → lit one by one as the camera settles → a glint
    {
      const { P: SP, Bv: SB, Nv: SN, Tv: ST, quads, pos, col, hpos, hcol } = sent;
      const dS = U_S - uc;
      const vis = 1 - smooth((dS - 60) / 70);          // seen only down the final straight
      const put = (arr, o, x, y, z) => {
        arr[o] = SP[0] + SB[0] * x + SN[0] * y + ST[0] * z;
        arr[o + 1] = SP[1] + SB[1] * x + SN[1] * y + ST[1] * z;
        arr[o + 2] = SP[2] + SB[2] * x + SN[2] * y + ST[2] * z;
      };
      const gx = lerp(-1.9, 2.2, ease.inOutCubic(clamp((t - 7.95) / 0.8)));   // glint position (plane x)
      const glintOn = t > 7.9 && t < 8.85;
      const T0 = 6.55;
      for (const q of quads) {
        const tq = T0 + (q.line === 0 ? 0 : q.line === 1 ? 0.16 + q.idx * 0.075 : 0.3 + q.idx * 0.075);
        const k = t - tq;
        const lit = lightOn(t, tq, q.idx * 1.3);
        const pre = 0.16;                                         // dim before it catches
        const pop = k <= 0 ? 0.86 : lerp(0.86, 1, clamp(ease.outBack(clamp(k / 0.55), 1.7), 0, 1.2));
        const rise = k <= 0 ? -0.07 : -0.07 * (1 - ease.outExpo(clamp(k / 0.6)));
        const cxq = q.x0 + q.w / 2, cyq = q.y0 + q.h / 2 + rise;
        const base = q.accent ? ACCENT : q.line === 0 ? [0.95, 0.80, 0.62] : [1.0, 0.93, 0.80];
        const breathe = 1 + 0.04 * Math.sin(t * 2.3 + q.idx);
        const bright = vis * (pre + (1 - pre) * lit) * breathe * (q.line === 0 ? 0.8 : 1);
        for (let j = 0; j <= 1; j++) for (let i = 0; i <= q.cols; i++) {
          const v2 = q.v0 + j * (q.cols + 1) + i;
          const x = cxq + (i / q.cols - 0.5) * q.w * pop, y = cyq + (j - 0.5) * q.h * pop;
          put(pos, v2 * 3, x, y, q.z);
          let gb = 0;
          if (glintOn && q.line === 2) { const dx = (x - gx) / 0.32; gb = 1.25 * Math.exp(-dx * dx) * smooth((t - 7.9) / 0.15) * (1 - smooth((t - 8.6) / 0.25)); }
          const c0 = bright * (1 + gb);
          col[v2 * 3] = lerp(base[0], 1, gb * 0.5) * c0;
          col[v2 * 3 + 1] = lerp(base[1], 1, gb * 0.5) * c0;
          col[v2 * 3 + 2] = lerp(base[2], 1, gb * 0.5) * c0;
        }
      }
      sent.pa.needsUpdate = sent.ca.needsUpdate = true;
      // halo: a warm lantern glow behind the sentence, brightening as it lights up
      const G = sent.glowQ, hb = vis * (0.1 + 0.32 * ramp(t, 6.5, 7.6)) * (1 + 0.05 * Math.sin(t * 1.9));
      const hzq = [[G.x0, G.y0], [G.x0 + G.w, G.y0], [G.x0, G.y0 + G.h], [G.x0 + G.w, G.y0 + G.h]];
      hzq.forEach(([x, y], i) => {
        put(hpos, i * 3, x, y + 0.15, 1.4);
        hcol[i * 3] = 1.0 * hb; hcol[i * 3 + 1] = 0.66 * hb; hcol[i * 3 + 2] = 0.40 * hb;
      });
      sent.haloGeo.attributes.position.needsUpdate = sent.haloGeo.attributes.color.needsUpdate = true;
    }

    renderer.render(scene, camera);
  },
});

