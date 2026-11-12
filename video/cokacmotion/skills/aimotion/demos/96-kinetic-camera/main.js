/*
 * 96 · 오늘은 그냥, 한 번 — the classic kinetic-typography film, built the way it is built in a motion studio:
 * the whole monologue is set ONCE on one large sheet (a "type map"), each phrase placed against the previous one
 * (rotated 90°, scaled to fill, stacked against an edge), so the reading order becomes a path across the plane.
 * A virtual camera (x, y, rotation, zoom) then flies phrase to phrase on the beat.
 *
 *   camera     world → screen is a similarity map  s = a·w + b  (a, b complex; a = zoom·e^(−iθ)).
 *              A move from view A to view B follows the geodesic of the similarity group: B∘A⁻¹ has one fixed point
 *              c₀ on screen and the in-between maps are c₀ + λˢ(p − c₀), λ = a_B/a_A — a logarithmic spiral, so
 *              rotation and zoom stay in step, zoom is uniform in log space and Arg λ ∈ (−π, π] makes every turn
 *              the short way round. s(t) runs through anticipation (s < 0), an in-out whip, overshoot (s > 1) and a
 *              damped settle. Moves that would show the wall mid-turn get a zoom "bulge" measured in setup.
 *   blur       N samples of the whole frame inside a 180° shutter, N from the camera's screen-space speed,
 *              averaged progressively (sample k drawn at alpha 1/(k+1)).
 *   type       per-syllable slam as the camera lands: scale 1.4 → 1 (+ squash), weight axis light → final,
 *              colour orange → ink. Impacts (punch + decaying shake) on three beats only.
 *   climax     the camera rises (×5 zoom-out) and the composition is revealed as one poster on an exposed-concrete wall.
 *
 * Determinism: the frame is a closed-form function of t (camera, glyph states, shake, handheld); every texture is
 * baked in setup with rand(seed); 2D state is reset before every pass. Canvas 2D only, no library.
 */
import { defineDemo, rand, clamp, lerp, smooth } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10;
const FAM = `"${FONTS.pretendard.family}"`;
const SCR_W = 1080, SCR_H = 1920;
const FX = 540, FY = 790;                  // focal point: phrases are framed here, above the caption band
const SHUTTER = 0.5 / 30;                  // 180° shutter at 30 fps
const MAX_SAMPLES = 16;

const PAPER = [238, 232, 219], INK = [23, 21, 19], ACC = [255, 80, 24];
const GUIDE = 'rgb(78,128,196)';              // non-photo-blue layout pencil
const rgb = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// the sheet, in world px (its height comes out of the layout)
const SW = 1000, M = 80, GAP = 24, EDGE = 14;   // EDGE: how close to the sheet edge a close-up may look

// the monologue: "매일 아침 생각만 했다. 오늘은 그냥 한 번 해 보기로 했다."
const PHRASES = [
  { text: '매일 아침',   wt: 300, w0: 80,  rot: 0,   track: -0.01 },
  { text: '생각만 했다', wt: 900, w0: 480, rot: 0,   track: -0.035 },
  { text: '오 늘 은',    wt: 900, w0: 480, rot: 0,   track: 0, stack: true },
  { text: '그냥',        wt: 300, w0: 80,  rot: 90,  track: -0.01 },
  { text: '한 번',       wt: 900, w0: 900, rot: 0,   track: 0, stack: true, accent: true },
  { text: '해 보기로',   wt: 300, w0: 80,  rot: -90, track: -0.01 },
  { text: '했다.',       wt: 900, w0: 480, rot: 0,   track: -0.03 },
];
const HEAD_L = '월요일 오전 6:40', HEAD_R = '일곱 마디';
const SMALL = ['알람을 끄고', '창문을 열고', '운동화 끈을 묶었다.'];

// camera moves, view k → view k+1 (views 0–6 = phrases, 7 = the full stop, 8 = the whole poster)
//   t start · ta anticipation · tw whip · a dip · o overshoot · p whip ease power · f, z settle (Hz, damping)
const MV = (t, o = {}) => ({ t, ta: 0.11, tw: 0.3, a: 0.05, o: 0.05, p: 3.4, f: 2.6, z: 7.5, ...o });
const MOVES = [
  MV(0.92), MV(1.95), MV(2.92), MV(3.8, { o: 0.07 }), MV(4.98), MV(5.95),
  MV(6.92, { ta: 0.07, tw: 0.25, a: 0.04, o: 0.07 }),
  MV(7.48, { ta: 0.22, tw: 1.1, a: 0.035, o: 0.04, p: 2.4, f: 1.0, z: 2.8 }),
];
const landOf = (m) => m.t + m.ta + 0.8 * m.tw;          // syllables slam as the whip lands
const arriveOf = (m) => m.t + m.ta + m.tw;              // whip ends (overshoot peak)
const T_LAND = [0.2, ...MOVES.slice(0, 6).map(landOf)];  // phrase k slams at T_LAND[k]
const T_DOT = landOf(MOVES[6]) + 0.03;                   // the orange full stop
const T_FOOT = MOVES[7].t + 0.75;                        // footer small print, during the rise
const SLAM = 0.13;
const HITS = [                                           // the only three impacts
  { t: T_LAND[4] + 0.05, amp: 10, hz: 7.5, k: 7, punch: 0.026 },
  { t: T_LAND[6] + 0.08, amp: 6, hz: 8, k: 8, punch: 0.012 },
  { t: T_DOT + SLAM * 0.5, amp: 18, hz: 6.5, k: 6, punch: 0.045 },
];

// ---------------------------------------------------------------- complex numbers (the camera is a + b·w)
const cx = (re, im = 0) => ({ re, im });
const cadd = (p, q) => cx(p.re + q.re, p.im + q.im);
const csub = (p, q) => cx(p.re - q.re, p.im - q.im);
const cmul = (p, q) => cx(p.re * q.re - p.im * q.im, p.re * q.im + p.im * q.re);
const cdiv = (p, q) => { const d = q.re * q.re + q.im * q.im; return cx((p.re * q.re + p.im * q.im) / d, (p.im * q.re - p.re * q.im) / d); };
const cscale = (p, k) => cx(p.re * k, p.im * k);
const cexp = (p) => { const m = Math.exp(p.re); return cx(m * Math.cos(p.im), m * Math.sin(p.im)); };
const clog = (p) => cx(Math.log(Math.hypot(p.re, p.im)), Math.atan2(p.im, p.re));   // Arg ∈ (−π, π]: the short way
const F = cx(FX, FY);
const ROT = { 0: [1, 0], 90: [0, 1], [-90]: [0, -1] };

/** view { x, y (world centre), rot (deg), z } → camera { a, b } with screen = a·w + b */
function camOf(v) {
  const th = (v.rot * Math.PI) / 180;
  const a = cx(v.z * Math.cos(th), -v.z * Math.sin(th));
  return { a, b: csub(F, cmul(a, cx(v.x, v.y))) };
}
/** geodesic of the similarity group from A (s = 0) to B (s = 1); s may leave [0, 1] */
function blend(A, B, s) {
  const lam = cdiv(B.a, A.a), one = csub(cx(1), lam);
  if (Math.hypot(one.re, one.im) < 1e-9) return { a: A.a, b: cadd(A.b, cscale(csub(B.b, A.b), s)) };
  const c0 = cdiv(csub(B.b, cmul(lam, A.b)), one);       // the one screen point that A→B leaves in place
  const ls = cexp(cscale(clog(lam), s));
  return { a: cmul(ls, A.a), b: cadd(cmul(ls, csub(A.b, c0)), c0) };
}
/** zoom a camera by m about the focal point */
const zoomAbout = (c, m) => ({ a: cscale(c.a, m), b: cadd(cscale(csub(c.b, F), m), F) });
const toWorld = (c, sx, sy) => cdiv(csub(cx(sx, sy), c.b), c.a);
const toScreen = (c, w) => cadd(cmul(c.a, w), c.b);
const matOf = (c) => [c.a.re, c.a.im, -c.a.im, c.a.re, c.b.re, c.b.im];
/** affine A∘B, canvas order [a, b, c, d, e, f] */
const mul = (A, B) => [
  A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5],
];

/** move parameter: anticipation dip → in-out whip to 1 + o → damped settle on 1 */
function moveS(m, tau) {
  if (tau <= 0) return 0;
  if (tau < m.ta) return -m.a * 0.5 * (1 - Math.cos((Math.PI * tau) / m.ta));
  tau -= m.ta;
  if (tau < m.tw) {
    const u = tau / m.tw;
    const e = u < 0.5 ? 0.5 * Math.pow(2 * u, m.p) : 1 - 0.5 * Math.pow(2 * (1 - u), m.p);
    return -m.a + (1 + m.a + m.o) * e;
  }
  tau -= m.tw;
  const w = 2 * Math.PI * m.f;
  return 1 + m.o * Math.exp(-m.z * tau) * (Math.cos(w * tau) + (m.z / w) * Math.sin(w * tau));
}

// ---------------------------------------------------------------- periodic value noise (textures, setup only)
function vnoise(seed, P) {
  const r = rand(seed), v = new Float32Array(P * P);
  for (let i = 0; i < v.length; i++) v[i] = r() * 2 - 1;
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), w = fy * fy * (3 - 2 * fy);
    const x0 = ((xi % P) + P) % P, y0 = ((yi % P) + P) % P, x1 = (x0 + 1) % P, y1 = (y0 + 1) % P;
    const a = v[y0 * P + x0], b = v[y0 * P + x1], c = v[y1 * P + x0], d = v[y1 * P + x1];
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  };
}

defineDemo({
  id: '96-kinetic-camera',
  title: '오늘은 그냥, 한 번',
  tech: '키네틱 타이포그래피 · 글자 지도 위를 나는 카메라',
  duration: D,
  background: '#4b4843',

  async setup(api) {
    const attrs = api.headless ? { willReadFrequently: true } : undefined;
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const { ctx } = api.canvas({ z: 1, attrs });
    const scv = mk(SCR_W, SCR_H), sctx = scv.getContext('2d', attrs);      // one motion-blur sample

    const allText = PHRASES.map((p) => p.text).join('') + HEAD_L + HEAD_R + SMALL.join('') + '0123456789:.';
    await fontReady(`900 100px ${FAM}`, allText);
    await fontReady(`300 100px ${FAM}`, allText);

    // ============================================================ measure: glyph pens and ink boxes at 100 px
    const mctx = mk(8, 8).getContext('2d');
    for (const p of PHRASES) {
      mctx.font = `${p.wt} 100px ${FAM}`;
      const lines = (p.stack ? p.text.split(' ') : [p.text]).map((line) => {
        const gl = []; let x = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (const ch of Array.from(line)) {
          const m = mctx.measureText(ch);
          if (ch !== ' ') {
            const a = x - m.actualBoundingBoxLeft, b = x + m.actualBoundingBoxRight, c = -m.actualBoundingBoxAscent, d = m.actualBoundingBoxDescent;
            gl.push({ ch, x, y: 0, cx: (a + b) / 2, cy: (c + d) / 2 });
            x0 = Math.min(x0, a); x1 = Math.max(x1, b); y0 = Math.min(y0, c); y1 = Math.max(y1, d);
          }
          x += m.width + p.track * 100;
        }
        return { gl, x0, x1, y0, y1 };
      });
      // stacked lines: centred on each other, next ink top = previous ink bottom + 0.07 em
      let dy = 0;
      const box = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
      p.glyphs = [];
      lines.forEach((L, i) => {
        const dx = p.stack ? -(L.x0 + L.x1) / 2 : 0;
        if (i > 0) dy = box.y1 + 7 - L.y0;
        for (const g of L.gl) p.glyphs.push({ ...g, x: g.x + dx, y: g.y + dy, cx: g.cx + dx, cy: g.cy + dy });
        box.x0 = Math.min(box.x0, L.x0 + dx); box.x1 = Math.max(box.x1, L.x1 + dx);
        box.y0 = Math.min(box.y0, L.y0 + dy); box.y1 = Math.max(box.y1, L.y1 + dy);
      });
      p.b = { ...box, w: box.x1 - box.x0, h: box.y1 - box.y0 };
    }

    // ============================================================ the type map: each phrase placed against the last
    /** size S, rotation p.rot; anchor the rotated ink box by any of left/right/top/bottom/cx */
    function place(p, S, at) {
      const k = S / 100, [co, si] = ROT[p.rot], b = p.b;
      const pts = [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]].map(([x, y]) => [k * (co * x - si * y), k * (si * x + co * y)]);
      const wx0 = Math.min(...pts.map((q) => q[0])), wx1 = Math.max(...pts.map((q) => q[0]));
      const wy0 = Math.min(...pts.map((q) => q[1])), wy1 = Math.max(...pts.map((q) => q[1]));
      const ox = at.left != null ? at.left - wx0 : at.right != null ? at.right - wx1 : at.cx - (wx0 + wx1) / 2;
      const oy = at.top != null ? at.top - wy0 : at.bottom != null ? at.bottom - wy1 : at.cy - (wy0 + wy1) / 2;
      Object.assign(p, { S, k, M: [k * co, k * si, -k * si, k * co, ox, oy], len: k * b.w, thick: k * b.h,
        box: { x0: ox + wx0, x1: ox + wx1, y0: oy + wy0, y1: oy + wy1 } });
    }
    const P = PHRASES, L = M, R = SW - M, CW = R - L;
    const HEAD_Y = 108, RULE_Y = 128;
    // a phrase turned 90° puts the screen's long side (1920) across the sheet's width, so its zoom can't go below
    // ZROT; upright phrases only need the sheet to cover the screen (ZUP, below)
    const ZROT = (SCR_H / (SW - 2 * EDGE)) * 1.005;
    place(P[0], 84, { left: L, top: RULE_Y + 62 });
    place(P[1], (100 * CW) / P[1].b.w, { left: L, top: P[0].box.y1 + 30 });
    const Ym = P[1].box.y1 + 44;
    // middle band: [오/늘/은 stacked][그냥 ↓][해 보기로 ↑][한/번 stacked]. The two turned phrases stay near the sheet's
    // centre line: turned 90°, the screen's long side lies across the sheet, so the camera can only frame a turned
    // phrase without showing the wall if it sits near the middle. Hm is solved so the stacks leave exactly two
    // columns of thickness TT between them.
    const TT = 84;
    const fit = (Hm) => {
      place(P[2], (100 * Hm) / P[2].b.h, { left: L, top: Ym });
      place(P[4], (100 * Hm) / P[4].b.h, { right: R, top: Ym });
      return P[4].box.x0 - P[2].box.x1 - 3 * GAP - 2 * TT;
    };
    let lo = 300, hi = 1600;
    for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (fit(mid) > 0) lo = mid; else hi = mid; }
    const Hm = (lo + hi) / 2;
    fit(Hm);
    place(P[3], (100 * TT) / P[3].b.h, { left: P[2].box.x1 + GAP, top: Ym });
    place(P[5], (100 * TT) / P[5].b.h, { right: P[4].box.x0 - GAP, bottom: Ym + Hm });
    place(P[6], (100 * 0.84 * CW) / P[6].b.w, { left: L, top: Ym + Hm + 48 });
    const FOOT_Y = P[6].box.y1 + 46;
    const SH = Math.round(FOOT_Y + 3 * 40 + 70);

    // glyph timing: the slam schedule
    P.forEach((p, i) => {
      const n = p.glyphs.length, st = p.stack ? 0.085 : 0.05;
      p.glyphs.forEach((g, j) => {
        g.t0 = T_LAND[i] - SLAM * 0.5 + j * st;
        g.wt = p.wt; g.w0 = p.w0; g.accent = !!p.accent; g.lift = p.accent ? 0.7 : 0.42;
        if (g.ch === '.') Object.assign(g, { t0: T_DOT, accent: true, lift: 1.6, w0: 900 });
      });
      p.n = n;
    });
    const dot = P[6].glyphs.find((g) => g.ch === '.');
    const dotW = { x: P[6].M[4] + P[6].k * dot.cx, y: P[6].M[5] + P[6].k * dot.cy };
    // ink droplets thrown by the full stop (closed-form flight, baked directions)
    const rd = rand(9601);
    const DROPS = Array.from({ length: 7 }, (_, i) => {
      const ang = -2.6 + (i / 6) * 3.4 + (rd() - 0.5) * 0.4, d = P[6].k * (14 + rd() * 22);
      return { dx: Math.cos(ang) * d, dy: Math.sin(ang) * d * 0.8, r: P[6].k * (0.9 + rd() * 1.6), delay: rd() * 0.03 };
    });

    // ============================================================ camera views
    const ZUP = Math.max(SCR_W / (SW - 2 * EDGE), SCR_H / (SH - 2 * EDGE)) * 1.005;
    function clampView(v) {
      const c = camOf(v);
      const ws = [[0, 0], [SCR_W, 0], [0, SCR_H], [SCR_W, SCR_H]].map(([x, y]) => toWorld(c, x, y));
      const x0 = Math.min(...ws.map((w) => w.re)), x1 = Math.max(...ws.map((w) => w.re));
      const y0 = Math.min(...ws.map((w) => w.im)), y1 = Math.max(...ws.map((w) => w.im));
      const sh = (a, b, lo2, hi2) => (b - a >= hi2 - lo2 ? (lo2 + hi2) / 2 - (a + b) / 2 : a < lo2 ? lo2 - a : b > hi2 ? hi2 - b : 0);
      return { ...v, x: v.x + sh(x0, x1, EDGE, SW - EDGE), y: v.y + sh(y0, y1, EDGE, SH - EDGE) };
    }
    const viewFor = (p, fill, maxH = 1320) => clampView({
      x: (p.box.x0 + p.box.x1) / 2, y: (p.box.y0 + p.box.y1) / 2, rot: p.rot,
      z: Math.max(p.rot ? ZROT : ZUP, Math.min((fill * SCR_W) / p.len, maxH / p.thick)), push: 0.03,
    });
    const FILL = [0.7, 0.88, 0.7, 0.62, 0.8, 0.84, 0.88];
    const VIEWS = P.map((p, i) => viewFor(p, FILL[i]));
    VIEWS.push(clampView({ x: dotW.x - 10, y: dotW.y - 40, rot: 0, z: 4.6, push: 0.05 }));
    const ZEND = Math.min(860 / SW, 1470 / SH);
    VIEWS.push({ x: SW / 2, y: SH / 2 + (FY - 800) / ZEND, rot: 0, z: ZEND, push: -0.014 });
    const ARRIVE = [0, ...MOVES.map(arriveOf)];
    const pushed = (k, t) => { const v = VIEWS[k]; return camOf({ ...v, z: v.z * Math.exp(v.push * Math.max(0, t - ARRIVE[k])) }); };
    const OPEN = camOf({ ...VIEWS[0], z: VIEWS[0].z * 1.14, rot: -3.5 });
    const START = [];
    const BULGE = [];
    // exact guard for what the bulge doesn't cover (anticipation, overshoot): the least zoom-in about the focal point
    // that keeps all four screen corners on the sheet — a continuous function of the camera, so of t
    const IN = 9;
    function keepInside(c) {
      const f = toWorld(c, FX, FY);
      const need = (v, fv, a, b) => (v < a ? (fv - v) / Math.max(1e-6, fv - a) : v > b ? (v - fv) / Math.max(1e-6, b - fv) : 1);
      let m = 1;
      for (const [x, y] of [[0, 0], [SCR_W, 0], [0, SCR_H], [SCR_W, SCR_H]]) {
        const w = toWorld(c, x, y);
        m = Math.max(m, need(w.re, f.re, IN, SW - IN), need(w.im, f.im, IN, SH - IN));
      }
      return m > 1 ? zoomAbout(c, m) : c;
    }
    function baseCam(t) {
      let i = -1;
      for (let k = 0; k < MOVES.length; k++) if (t >= MOVES[k].t) i = k;
      if (i < 0) return keepInside(blend(OPEN, pushed(0, t), 1 - Math.pow(1 - clamp(t / 1.0), 3)));
      const m = MOVES[i], s = moveS(m, t - m.t);
      let c = blend(START[i], pushed(i + 1, t), s);
      if (BULGE[i]) c = zoomAbout(c, 1 + BULGE[i] * Math.sin(Math.PI * clamp(s)));
      return i < MOVES.length - 1 ? keepInside(c) : c;    // the rise is meant to show the wall
    }
    // move starts are where the previous move left the camera (no jump even if it is still settling);
    // a move that would show the wall mid-turn zooms in just enough ("bulge"), measured here
    const inside = (c, m) => {
      const cz = zoomAbout(c, m);
      return [[0, 0], [SCR_W, 0], [0, SCR_H], [SCR_W, SCR_H]].every(([x, y]) => {
        const w = toWorld(cz, x, y);
        return w.re >= 2 && w.re <= SW - 2 && w.im >= 2 && w.im <= SH - 2;
      });
    };
    for (let i = 0; i < MOVES.length; i++) {
      START[i] = baseCam(MOVES[i].t - 1e-9);
      BULGE[i] = 0;
      if (i === MOVES.length - 1) break;                 // the rise is meant to show the wall
      let need = 0;
      for (let k = 1; k < 40; k++) {
        const s = k / 40, c = blend(START[i], pushed(i + 1, MOVES[i].t + MOVES[i].ta + s * MOVES[i].tw), s);
        let m = 1;
        while (!inside(c, m) && m < 3) m *= 1.01;
        need = Math.max(need, (m - 1) / Math.max(0.25, Math.sin(Math.PI * s)));
      }
      BULGE[i] = Math.min(0.8, need * 1.08);
    }

    // handheld + impacts on top of the base camera, all closed form
    function fullCam(t) {
      const c = baseCam(t);
      let sx = 0, sy = 0, pu = 0;
      for (const h of HITS) {
        const d = t - h.t;
        if (d < 0 || d > 1.2) continue;
        const env = Math.exp(-h.k * d);
        sx += h.amp * env * Math.sin(2 * Math.PI * h.hz * d);
        sy += h.amp * 0.7 * env * Math.sin(2 * Math.PI * h.hz * 1.23 * d);
        pu += h.punch * (d < 0.05 ? d / 0.05 : Math.exp(-(d - 0.05) / 0.14));
      }
      const hx = 2.4 * Math.sin(1.27 * t + 0.4) + 1.1 * Math.sin(2.83 * t + 1.9);
      const hy = 2.0 * Math.sin(1.07 * t + 2.2) + 1.0 * Math.sin(2.41 * t + 0.3);
      const hr = 0.0016 * Math.sin(0.83 * t + 0.5) + 0.0007 * Math.sin(1.9 * t + 2.0);
      const k = cscale(cx(Math.cos(hr), Math.sin(hr)), 1 + pu);
      return { a: cmul(k, c.a), b: cadd(cadd(cmul(k, csub(c.b, F)), F), cx(sx + hx, sy + hy)) };
    }
    this.fullCam = fullCam;

    // ============================================================ textures (baked once)
    // --- paper sheet, 1 texel / world px: mottling, warm key light from the upper left, fibres, specks
    const sheet = mk(SW, SH), sh = sheet.getContext('2d', attrs);
    {
      const q = 4, w = Math.ceil(SW / q), h = Math.ceil(SH / q);
      const n1 = vnoise(11, 64), n2 = vnoise(12, 32), n3 = vnoise(13, 128);
      const img = new ImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const X = x * q, Y = y * q;
        const m = 0.022 * n1(X / 46, Y / 46) + 0.03 * n2(X / 170, Y / 170) + 0.012 * n3(X / 14, Y / 14);
        const lx = (X - SW * 0.28) / SW, ly = (Y - SH * 0.18) / SH;
        const light = 0.035 - 0.085 * Math.min(1, Math.sqrt(lx * lx * 1.3 + ly * ly * 1.1));
        const k = 1 + m + light, i = (y * w + x) * 4;
        img.data[i] = PAPER[0] * k; img.data[i + 1] = PAPER[1] * k; img.data[i + 2] = PAPER[2] * (k - 0.006); img.data[i + 3] = 255;
      }
      const lo2 = mk(w, h); lo2.getContext('2d').putImageData(img, 0, 0);
      sh.imageSmoothingQuality = 'high';
      sh.drawImage(lo2, 0, 0, SW, SH);
      const r = rand(214);
      sh.lineCap = 'round';
      for (let i = 0; i < 1500; i++) {                 // fibres
        const x = r() * SW, y = r() * SH, a = r() * Math.PI * 2, l = 6 + r() * 26, bend = (r() - 0.5) * 10;
        const dark = r() < 0.6;
        sh.strokeStyle = dark ? `rgba(120,98,70,${0.05 + r() * 0.07})` : `rgba(255,252,244,${0.14 + r() * 0.14})`;
        sh.lineWidth = 0.6 + r() * 0.7;
        sh.beginPath(); sh.moveTo(x, y);
        sh.quadraticCurveTo(x + Math.cos(a) * l * 0.5 - Math.sin(a) * bend, y + Math.sin(a) * l * 0.5 + Math.cos(a) * bend, x + Math.cos(a) * l, y + Math.sin(a) * l);
        sh.stroke();
      }
      for (let i = 0; i < 260; i++) {                  // specks
        sh.fillStyle = `rgba(60,48,36,${0.12 + r() * 0.35})`;
        sh.beginPath(); sh.arc(r() * SW, r() * SH, 0.4 + r() * r() * 1.6, 0, Math.PI * 2); sh.fill();
      }
      sh.strokeStyle = 'rgba(90,76,58,0.25)'; sh.lineWidth = 2; sh.strokeRect(1, 1, SW - 2, SH - 2);   // paper edge
    }
    // --- fine paper tooth as a repeating pattern (2 texels / world px), drawn over the ink so the ink reads printed
    const GT = 384, grain = mk(GT, GT);
    {
      const gx = grain.getContext('2d', attrs), img = new ImageData(GT, GT), nz = vnoise(31, 96), r = rand(32);
      for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
        const v = 0.65 * nz(x / 4, y / 4) + 0.55 * (r() * 2 - 1), i = (y * GT + x) * 4;
        if (v > 0) { img.data[i] = 255; img.data[i + 1] = 251; img.data[i + 2] = 240; img.data[i + 3] = Math.min(255, v * 40); }
        else { img.data[i] = 70; img.data[i + 1] = 56; img.data[i + 2] = 40; img.data[i + 3] = Math.min(255, -v * 34); }
      }
      gx.putImageData(img, 0, 0);
    }
    // --- exposed-concrete wall around the sheet (0.75 texel / world px): mottling, pores, form seams, tie holes,
    //     the sheet's shadow, and a warm lamp above the poster
    const WX = -560, WY = -760, WW = SW + 1120, WH = SH + 1700, WS = 0.75;
    const wall = mk(Math.round(WW * WS), Math.round(WH * WS)), wc = wall.getContext('2d', attrs);
    {
      const q = 3, w = Math.ceil(wall.width / q), h = Math.ceil(wall.height / q);
      const n1 = vnoise(41, 64), n2 = vnoise(42, 64), n3 = vnoise(43, 128);
      const img = new ImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const X = (x * q) / WS + WX, Y = (y * q) / WS + WY;
        let m = 0.07 * n1(X / 90, Y / 90) + 0.09 * n2(X / 320, Y / 260) + 0.03 * n3(X / 22, Y / 22);
        m -= 0.05 * Math.max(0, n2(X / 60 + 7, Y / 900)) ;      // faint vertical water stains
        const lx = (X - SW * 0.5) / 1300, ly = (Y - SH * 0.2) / 1500;
        const light = 0.16 - 0.36 * Math.min(1, Math.sqrt(lx * lx + ly * ly));
        const k = 1 + m + light, i = (y * w + x) * 4;
        img.data[i] = 124 * k; img.data[i + 1] = 121 * k; img.data[i + 2] = 115 * k; img.data[i + 3] = 255;
      }
      const lo2 = mk(w, h); lo2.getContext('2d').putImageData(img, 0, 0);
      wc.imageSmoothingQuality = 'high';
      wc.drawImage(lo2, 0, 0, wall.width, wall.height);
      wc.setTransform(WS, 0, 0, WS, -WX * WS, -WY * WS);   // draw in world px from here on
      const r = rand(77);
      for (let i = 0; i < 5200; i++) {                    // pores
        const x = WX + r() * WW, y = WY + r() * WH, rr = 0.6 + r() * r() * 3.2;
        wc.fillStyle = `rgba(40,38,35,${0.18 + r() * 0.4})`;
        wc.beginPath(); wc.arc(x, y, rr, 0, Math.PI * 2); wc.fill();
        wc.fillStyle = `rgba(215,210,200,${0.08 + r() * 0.12})`;
        wc.beginPath(); wc.arc(x + rr * 0.4, y + rr * 0.5, rr * 0.7, 0, Math.PI * 2); wc.fill();
      }
      // form panels and tie holes, laid out in the final framing so the holes frame the poster (screen x 80 / 1000,
      // four rows) and none falls behind the harness caption
      const VE = VIEWS[8], sx2w = (x) => VE.x + (x - FX) / VE.z, sy2w = (y) => VE.y + (y - FY) / VE.z;
      const PX = sx2w(1000) - sx2w(80), PY = sy2w(560) - sy2w(170), ox = sx2w(80), oy = sy2w(170);
      wc.lineWidth = 3;
      const seam = (x0, y0, x1, y1) => {
        wc.strokeStyle = 'rgba(48,45,41,0.5)'; wc.beginPath(); wc.moveTo(x0, y0); wc.lineTo(x1, y1); wc.stroke();
        wc.strokeStyle = 'rgba(220,214,204,0.18)'; wc.beginPath(); wc.moveTo(x0 + (x0 === x1 ? 3 : 0), y0 + (y0 === y1 ? 3 : 0)); wc.lineTo(x1 + (x0 === x1 ? 3 : 0), y1 + (y0 === y1 ? 3 : 0)); wc.stroke();
      };
      for (let k = -3; k <= 4; k++) seam(ox + (k - 0.5) * PX / 2 + PX / 4, WY, ox + (k - 0.5) * PX / 2 + PX / 4, WY + WH);
      for (let k = -4; k <= 8; k += 2) seam(WX, oy + (k + 0.5) * PY, WX + WW, oy + (k + 0.5) * PY);
      for (let i = -2; i <= 3; i++) for (let j = -3; j <= 6; j++) {
        const x = ox + i * PX, y = oy + j * PY;
        if (j >= 4 && i >= 0 && i <= 1) continue;          // under the caption
        const g = wc.createRadialGradient(x, y, 0, x, y, 24);
        g.addColorStop(0, 'rgba(30,28,26,0.95)'); g.addColorStop(0.55, 'rgba(52,49,45,0.85)'); g.addColorStop(0.75, 'rgba(160,155,146,0.45)'); g.addColorStop(1, 'rgba(160,155,146,0)');
        wc.fillStyle = g; wc.beginPath(); wc.arc(x, y, 24, 0, Math.PI * 2); wc.fill();
        const st = wc.createLinearGradient(x, y, x, y + 260);       // a faint water streak below each hole
        st.addColorStop(0, 'rgba(50,47,43,0.16)'); st.addColorStop(1, 'rgba(50,47,43,0)');
        wc.fillStyle = st; wc.fillRect(x - 9, y, 18, 260);
      }
      wc.filter = 'blur(22px)'; wc.fillStyle = 'rgba(14,12,10,0.5)'; wc.fillRect(10, 26, SW, SH);   // the sheet's shadow
      wc.filter = 'blur(4px)'; wc.fillStyle = 'rgba(14,12,10,0.35)'; wc.fillRect(1, 4, SW, SH);
      wc.filter = 'none';
    }
    // --- screen-space vignette + a darker band under the harness caption
    const vig = mk(SCR_W, SCR_H);
    {
      const v = vig.getContext('2d', attrs);
      const g = v.createRadialGradient(FX, 860, 380, FX, 860, 1250);
      g.addColorStop(0, 'rgba(12,10,8,0)'); g.addColorStop(1, 'rgba(12,10,8,0.34)');
      v.fillStyle = g; v.fillRect(0, 0, SCR_W, SCR_H);
      const b = v.createLinearGradient(0, 1500, 0, SCR_H);
      b.addColorStop(0, 'rgba(12,10,8,0)'); b.addColorStop(1, 'rgba(12,10,8,0.42)');
      v.fillStyle = b; v.fillRect(0, 1500, SCR_W, SCR_H - 1500);
    }

    // ============================================================ drawing
    const grainPat = ctx.createPattern(grain, 'repeat');
    grainPat.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]));
    const grainPatS = sctx.createPattern(grain, 'repeat');
    grainPatS.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]));
    const fontOf = (w) => `${Math.round(w)} 100px ${FAM}`;

    function glyphState(g, t) {
      const u = t - g.t0;
      if (u <= 0) return null;
      let s;
      if (u < SLAM) { const q = u / SLAM; s = 1 + g.lift * (1 - q * q); }
      else { const v = u - SLAM; s = 1 - 0.05 * Math.exp(-13 * v) * Math.sin(2 * Math.PI * 4.2 * v); }
      return {
        alpha: clamp(u / 0.035), s,
        wt: g.wt + (g.w0 - g.wt) * Math.exp(-u / 0.075),
        col: g.accent ? ACC : mix(ACC, INK, smooth((u - 0.05) / 0.22)),
      };
    }
    const slamming = (t) => P.some((p) => p.glyphs.some((g) => t > g.t0 && t < g.t0 + SLAM + 0.08));

    function sheetCovers(c) {
      return [[0, 0], [SCR_W, 0], [0, SCR_H], [SCR_W, SCR_H]].every(([x, y]) => {
        const w = toWorld(c, x, y);
        return w.re >= 0 && w.re <= SW && w.im >= 0 && w.im <= SH;
      });
    }
    /** a line from (x0,y0) to (x1,y1) in world px, revealed 0..1 from its start */
    const wipeLine = (g, Mc, x0, y0, x1, y1, wdt, k) => {
      if (k <= 0) return;
      g.setTransform(...Mc);
      g.fillStyle = rgb(INK);
      if (y0 === y1) g.fillRect(x0, y0 - wdt / 2, (x1 - x0) * k, wdt);
      else g.fillRect(x0 - wdt / 2, y0, wdt, (y1 - y0) * k);
    };

    function drawScene(g, t, cam, pat) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'low';
      const Mc = matOf(cam);
      if (!sheetCovers(cam)) {
        g.fillStyle = '#3d3a36'; g.fillRect(0, 0, SCR_W, SCR_H);
        g.setTransform(...Mc);
        g.drawImage(wall, WX, WY, WW, WH);
      }
      g.setTransform(...Mc);
      g.drawImage(sheet, 0, 0, SW, SH);

      // printed furniture: header, rules, small print (on the paper from the start)
      g.fillStyle = rgb(INK);
      g.textBaseline = 'alphabetic';
      g.font = `300 30px ${FAM}`;
      g.textAlign = 'left'; g.fillText(HEAD_L, L, HEAD_Y);
      g.textAlign = 'right'; g.fillText(HEAD_R, R, HEAD_Y);
      g.textAlign = 'left';
      g.fillRect(L, RULE_Y - 3, CW, 6);
      // the footer prints while the camera rises (in the close-up of 했다. it would sit under the caption)
      wipeLine(g, Mc, L, FOOT_Y, R, FOOT_Y, 2.5, ease4((t - T_FOOT) / 0.5));
      g.font = `300 31px ${FAM}`;
      SMALL.forEach((s, i) => {
        const k = ease4((t - T_FOOT - 0.18 - i * 0.1) / 0.35);
        if (k <= 0) return;
        g.globalAlpha = k;
        g.fillText(s, L, FOOT_Y + 40 + i * 42 + 14 * (1 - k));
      });
      const k6 = ease4((t - T_FOOT - 0.45) / 0.35);
      if (k6 > 0) {
        g.globalAlpha = k6;
        g.font = `900 31px ${FAM}`;
        g.textAlign = 'right'; g.fillText('06:40', R, FOOT_Y + 40 + 14 * (1 - k6)); g.textAlign = 'left';
      }
      g.globalAlpha = 1;
      // rules that ink in with their phrase
      const p0 = P[0], p3 = P[3];
      wipeLine(g, Mc, p0.box.x1 + 26, (p0.box.y0 + p0.box.y1) / 2, R, (p0.box.y0 + p0.box.y1) / 2, 2.5, ease4((t - T_LAND[0] - 0.12) / 0.45));
      const gx = (p3.box.x0 + p3.box.x1) / 2, gk = ease4((t - T_LAND[3] - 0.12) / 0.4);
      wipeLine(g, Mc, gx, p3.box.y1 + 26, gx, Ym + Hm - 10, 2.5, gk);
      if (gk >= 1) { g.beginPath(); g.arc(gx, Ym + Hm - 10, 8, 0, Math.PI * 2); g.fill(); }
      const p5 = P[5], hx = (p5.box.x0 + p5.box.x1) / 2, hk = ease4((t - T_LAND[5] - 0.12) / 0.4);
      wipeLine(g, Mc, hx, p5.box.y0 - 26, hx, Ym + 10, 2.5, hk);
      if (hk >= 1) { g.beginPath(); g.arc(hx, Ym + 10, 8, 0, Math.PI * 2); g.fill(); }

      // the type map's empty slots: pencil-blue layout boxes with their reading order, each fading as its phrase lands
      g.setTransform(...Mc);
      g.fillStyle = GUIDE;
      g.font = `300 21px ${FAM}`;
      for (let i = 1; i < P.length; i++) {
        const k = 1 - smooth((t - T_LAND[i] + 0.06) / 0.22);
        if (k <= 0) continue;
        const b = P[i].box, x0 = b.x0 - 8, y0 = b.y0 - 8, x1 = b.x1 + 8, y1 = b.y1 + 8, lw = 1.7;
        g.globalAlpha = 0.55 * k;
        g.fillRect(x0, y0, x1 - x0, lw); g.fillRect(x0, y1 - lw, x1 - x0, lw);
        g.fillRect(x0, y0, lw, y1 - y0); g.fillRect(x1 - lw, y0, lw, y1 - y0);
        g.fillText(String(i + 1).padStart(2, '0'), x0 + 10, y0 + 28);
      }
      const kd = 1 - smooth((t - T_DOT + 0.02) / 0.2);
      if (kd > 0) {                                     // the full stop's slot: a registration cross
        g.globalAlpha = 0.6 * kd;
        g.fillRect(dotW.x - 26, dotW.y - 0.85, 52, 1.7); g.fillRect(dotW.x - 0.85, dotW.y - 26, 1.7, 52);
      }
      g.globalAlpha = 1;

      // the phrases
      g.textAlign = 'left';
      for (const p of P) {
        const Mp = mul(Mc, p.M);
        for (const gl of p.glyphs) {
          const st = glyphState(gl, t);
          if (!st) continue;
          const sc = st.s;
          g.setTransform(...mul(Mp, [sc, 0, 0, sc, gl.cx * (1 - sc), gl.cy * (1 - sc)]));
          g.globalAlpha = st.alpha;
          g.font = fontOf(st.wt);
          g.fillStyle = rgb(st.col);
          g.fillText(gl.ch, gl.x, gl.y);
        }
      }
      // droplets thrown by the full stop
      const ud = t - (T_DOT + SLAM);
      if (ud > 0) {
        g.setTransform(...Mc);
        g.fillStyle = rgb(ACC);
        for (const d of DROPS) {
          const u = ud - d.delay;
          if (u <= 0) continue;
          const f = 1 - Math.exp(-u / 0.045);
          g.globalAlpha = clamp(u / 0.03);
          g.beginPath(); g.arc(dotW.x + d.dx * f, dotW.y + d.dy * f, d.r * (0.6 + 0.4 * f), 0, Math.PI * 2); g.fill();
        }
      }
      g.globalAlpha = 1;
      // paper tooth over everything printed
      g.setTransform(...Mc);
      g.fillStyle = pat;
      g.fillRect(0, 0, SW, SH);
    }
    const ease4 = (k) => { k = clamp(k); return 1 - Math.pow(1 - k, 4); };

    const PROBES = [];
    for (let y = 0; y <= 4; y++) for (let x = 0; x <= 2; x++) PROBES.push([(x * SCR_W) / 2, (y * SCR_H) / 4]);
    function samplesAt(t) {
      const c0 = fullCam(t - SHUTTER / 2), c1 = fullCam(t + SHUTTER / 2), cm = fullCam(t);
      let md = 0;
      for (const [x, y] of PROBES) {
        const w = toWorld(cm, x, y), d = csub(toScreen(c1, w), toScreen(c0, w));
        md = Math.max(md, Math.hypot(d.re, d.im));
      }
      let n = md < 1.5 ? 1 : Math.min(MAX_SAMPLES, Math.ceil(md / 6) + 1);
      if (slamming(t)) n = Math.max(n, t > T_DOT && t < T_DOT + SLAM + 0.1 ? 12 : 4);
      return n;
    }

    Object.assign(this, { ctx, sctx, scv, vig, drawScene, samplesAt, grainPat, grainPatS });
    // first raster of the offscreen sample canvas happens here, not on the first frame (README: 90)
    drawScene(sctx, 0, fullCam(0), grainPatS);
  },

  frame(t) {
    const { ctx, sctx, scv, vig, drawScene, samplesAt, fullCam, grainPat, grainPatS } = this;
    const n = samplesAt(t);
    if (n === 1) drawScene(ctx, t, fullCam(t), grainPat);
    else {
      for (let k = 0; k < n; k++) {
        const tk = t + (k / (n - 1) - 0.5) * SHUTTER;
        drawScene(sctx, tk, fullCam(tk), grainPatS);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1 / (k + 1);
        ctx.drawImage(scv, 0, 0);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(vig, 0, 0);
  },
});
