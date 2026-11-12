/*
 * 128 · 한 방울에서 지구까지 — 스케일 줌 · 지수 줌 + 단계별 장면 + 원점 재설정
 *
 * One continuous zoom-out across ten orders of magnitude: a dew drop on a leaf (1 mm) → the leaf → a garden →
 * a neighbourhood → a city with a river → a peninsula → the Earth. All geography is invented.
 *   · zoom: ζ = log10(px per metre) is an eased interpolation in log space, so every decade takes the same time
 *   · seven levels, each drawn in its OWN units around its own origin; anchors (2×3 affine maps) place each level's
 *     origin inside its parent. The camera is stored in the units of the reference level (the one nearest its framed
 *     size) and every level's screen map is the reference map composed with anchors — origin rebasing: no number handed
 *     to the canvas is ever larger than a few times the screen, while the scene spans 10^10
 *   · the zoom centre is the drop: its screen position is a smooth path through one framing point per level
 *   · a level fades in below an on-screen size X and out below Y; the screen behind it is its parent's surface colour
 *   · scale bar: 1/2/5 × 10^n kept 120–300 px, odometer digits, mm → cm → m → km
 * Canvas 2D only (no library). Levels: small.js (drop, leaf, garden), large.js (neighbourhood, city, peninsula, Earth).
 */
import { defineDemo, clamp, lerp, ease, smooth, rand } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { Af } from './geo.js';
import { SC, buildLeaf, buildVeinlets, dropSite, buildDew, drawLeaf, buildDrop, drawDrop, GLINT_AT, buildGarden, drawGarden, HERO_PLANT } from './small.js';
import { LC, buildGeo, P2, P3, buildHood, drawHood, buildCity, drawCity, buildEarth, drawEarth, buildPeninsula, drawPeninsula,
  buildAirClouds, drawAirClouds, view, anchorAffine, ANCHOR } from './large.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2, DEG = Math.PI / 180;
const F = [540, 840];                     // image centre of the camera
const G = [540, 870];                     // where the globe comes to rest
const PRE = `"${FONTS.pretendard.family}"`;
const ACC = '#FFB547', ACC_CORE = '#FFF5DD', PAPER = '#F3F8F1', INK = '#0F2129';

// ---------------------------------------------------------------- levels
// unit = 10^e m · x = the level's order of magnitude for the label · ground = the surface its objects sit on
// fin  = on-screen size S (px) of its 1000-unit extent at which it is [invisible, fully in] while shrinking
// fout = [gone, still full] at the small end; a level is drawn only while it is inside both windows
const LV = [
  { e: -6, x: -3, name: '이슬 한 방울', ground: SC.lit, fin: null, fout: [24, 70] },
  { e: -4, x: -1, name: '잎 한 장', ground: SC.soil, fin: null, fout: [20, 60] },
  { e: -2, x: 1, name: '텃밭', ground: SC.lawn, fin: [1.4e5, 5e4], fout: [20, 60] },
  { e: 0, x: 3, name: '우리 동네', ground: LC.suburb, fin: [1.4e5, 5e4], fout: [25, 80] },
  { e: 2, x: 5, name: '강이 흐르는 도시', ground: LC.land, fin: [1.4e5, 5e4], fout: [40, 120] },
  { e: 3, x: 6, name: '바다로 뻗은 반도', ground: LC.ocean, fin: [2.2e4, 8e3], fout: [100, 320] },
  { e: 4, x: 7, name: '지구', ground: '#0A1622', fin: [2.2e4, 8e3], fout: null },
];
const lsm = (S, a, b) => smooth((Math.log(S) - Math.log(a)) / (Math.log(b) - Math.log(a)));   // smoothstep in log size
const fadeIn = (L, S) => (L.fin ? lsm(S, L.fin[0], L.fin[1]) : 1);
const fadeOut = (L, S) => (L.fout ? lsm(S, L.fout[0], L.fout[1]) : 1);

// ---------------------------------------------------------------- the zoom: constant speed in log space
// ζ(t) = log10(px per metre). Its velocity rises over T0–T1, cruises, falls over T2–T3; ζ is the normalised integral.
const Z0 = Math.log10(6.8e5);             // the 1 mm drop fills 680 px
const DZ = 10.08;                         // … down to the 12,742 km Earth at 720 px
const T0 = 1.05, T1 = 2.0, T2 = 6.5, T3 = 8.9;
const NT = 6000, CUM = new Float64Array(NT + 1);
for (let i = 1; i <= NT; i++) { const t = ((i - 0.5) * D) / NT; CUM[i] = CUM[i - 1] + smooth((t - T0) / (T1 - T0)) * (1 - smooth((t - T2) / (T3 - T2))); }
export function zeta(t) {
  const f = clamp(t / D) * NT, i = Math.min(NT - 1, Math.floor(f)), c = CUM[i] + (CUM[i + 1] - CUM[i]) * (f - i);
  return Z0 - (DZ * c) / CUM[NT];
}
const tAtZeta = (z) => { let lo = 0, hi = D; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (zeta(m) > z) lo = m; else hi = m; } return (lo + hi) / 2; };
const LEVEL_Z = [0, 2, 4, 6, 8, 9, DZ].map((d) => Z0 - d);      // ζ at which each level is framed (1000 units ≈ 680 px)
const TL = LEVEL_Z.map((z, j) => (j === 0 ? T0 : j === 6 ? T3 : tAtZeta(z)));
// the reference level switches half-way (in ζ) between two framings
const T_SWITCH = LEVEL_Z.slice(1).map((z, j) => tAtZeta((z + LEVEL_Z[j]) / 2));

// the drop's screen position at each framing (it is the zoom centre; between framings a Hermite spline in t)
const WAY = [[540, 840], [500, 790], [596, 720], [520, 820], [575, 800], [515, 745], G];
const TAN = WAY.map((p, j) => (j === 0 || j === 6 ? [0, 0] : [0, 1].map((c) => (WAY[j + 1][c] - WAY[j - 1][c]) / (TL[j + 1] - TL[j - 1]))));
function wayAt(t) {
  if (t <= TL[0]) return WAY[0];
  if (t >= TL[6]) return WAY[6];
  let j = 0; while (t > TL[j + 1]) j++;
  const h = TL[j + 1] - TL[j], s = (t - TL[j]) / h, s2 = s * s, s3 = s2 * s;
  const a = 2 * s3 - 3 * s2 + 1, b = s3 - 2 * s2 + s, c = -2 * s3 + 3 * s2, d = s3 - s2;
  return [0, 1].map((k) => a * WAY[j][k] + b * h * TAN[j][k] + c * WAY[j + 1][k] + d * h * TAN[j + 1][k]);
}
// the Earth turns a little once it has settled (deg), clouds a little faster
const ROT_V = 4, ROT_A = 7.9, ROT_R = 0.9;
function rotAt(t) { const x = (t - ROT_A) / ROT_R; return x <= 0 ? 0 : x <= 1 ? ROT_V * ROT_R * (x * x * x - x * x * x * x / 2) : ROT_V * (ROT_R / 2 + (t - ROT_A - ROT_R)); }

// ---------------------------------------------------------------- scale bar: 1/2/5 × 10^n m, 120–300 px
const NICE = []; for (let n = -4; n <= 6; n++) for (const m of [1, 2, 5]) NICE.push(m * 10 ** n);
const BAR_MAX = 300;
// NICE[i] becomes the shown length when it first fits in 300 px (ζ falls → px per metre falls)
const T_NICE = NICE.map((v) => { const z = Math.log10(BAR_MAX / v); return zeta(0) <= z ? -1 : zeta(D) > z ? Infinity : tAtZeta(z); });
const comma = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function fmt(v) {
  if (v < 0.00999) return [String(Number((v * 1000).toFixed(1))), 'mm'];
  if (v < 0.999) return [String(Math.round(v * 100)), 'cm'];
  if (v < 999) return [String(Math.round(v)), 'm'];
  return [comma(String(Math.round(v / 1000))), 'km'];
}

defineDemo({
  id: '128-scale-zoom',
  title: '한 방울에서 지구까지',
  tech: '스케일 줌 · 지수 줌 + 단계별 장면 + 원점 재설정',
  duration: D,
  background: INK,
  async setup(api) {
    const t0 = performance.now();
    captionScrim(api, '10,24,30');
    const KR = LV.map((l) => l.name).join('') + '약배에서까지';
    await Promise.all([
      fontReady(`800 66px ${PRE}`, KR), fontReady(`600 30px ${PRE}`, KR + '0123456789m −→·,.'),
      fontReady(`800 56px ${PRE}`, '0123456789.,'), fontReady(`700 32px ${PRE}`, 'mck'), fontReady(`600 19px ${PRE}`, '0123456789,mk '),
    ]);
    const { ctx } = api.canvas({ attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    // ---- small levels
    const leaf = buildLeaf(), vl = buildVeinlets(leaf), P0 = dropSite(leaf);
    this.leaf = leaf;
    this.L1 = { leaf, vl, dew: buildDew(leaf, P0) };
    this.drop = buildDrop(leaf, vl, P0);
    this.garden = buildGarden(leaf);
    // ---- large levels
    const geo = buildGeo();
    this.hood = buildHood();
    this.city = buildCity(geo);
    this.earth = buildEarth(geo);
    this.pen = buildPeninsula(geo, this.earth);
    this.clouds = buildAirClouds();
    // motes drifting a few millimetres above the leaf (L1 units, height in m)
    const RM = rand(91);
    this.motes = Array.from({ length: 16 }, () => ({ x: P0[0] + (RM() - 0.5) * 70, y: P0[1] + (RM() - 0.5) * 110, h: 0.0024 + RM() * 0.012, r: 0.5 + RM() * 1.4, ph: RM() * TAU }));
    // ---- anchors: each level's origin inside its parent (scale = unit ratio, no rotation)
    const P1 = [HERO_PLANT[0] - 0.01 * leaf.stem[0], HERO_PLANT[1] - 0.01 * leaf.stem[1]];
    this.A = [Af.of(0.01, P0[0], P0[1]), Af.of(0.01, P1[0], P1[1]), Af.of(0.01, P2[0], P2[1]), Af.of(0.01, P3[0], P3[1]), Af.of(0.1, 0, 0)];
    this.setupMs = performance.now() - t0;
    console.log('setup', this.setupMs | 0, 'ms · veinlet cells', vl.n, 'epidermis', this.drop.nCells, 'fields', this.city.n, 'mag0', this.drop.mag0.toFixed(3),
      'TL', TL.map((x) => x.toFixed(2)).join(' '), 'switch', T_SWITCH.map((x) => x.toFixed(2)).join(' '));
  },

  /** the camera at t: every level's screen map, built from the reference level outwards */
  camera(t) {
    const z = zeta(t), rot = rotAt(t), V = view(ANCHOR.lon - rot * DEG, ANCHOR.lat);
    const A = [...this.A, anchorAffine(V)];
    // the drop in every level's units: walk up the anchors (each step multiplies by 0.01 or 0.1 — numbers stay small)
    const drop = [[0, 0]];
    for (let j = 0; j < 6; j++) drop.push(Af.ap(A[j], drop[j][0], drop[j][1]));
    let r = 0; for (let j = 1; j < 7; j++) if (Math.abs(z - LEVEL_Z[j]) < Math.abs(z - LEVEL_Z[r])) r = j;
    // the zoom centre: the drop's screen path, which bends into "globe centred at G" as the Earth settles
    let d = wayAt(t);
    const w = smooth((t - 7.2) / 1.5);
    if (w > 0) { const p6 = 10 ** (z + LV[6].e); d = [lerp(d[0], G[0] + drop[6][0] * p6, w), lerp(d[1], G[1] + drop[6][1] * p6, w)]; }
    // camera centre in reference units → reference map → all other maps by composing anchors
    const pr = 10 ** (z + LV[r].e), c = [drop[r][0] - (d[0] - F[0]) / pr, drop[r][1] - (d[1] - F[1]) / pr];
    const M = []; M[r] = [pr, 0, 0, pr, F[0] - pr * c[0], F[1] - pr * c[1]];
    for (let j = r - 1; j >= 0; j--) M[j] = Af.mul(M[j + 1], A[j]);
    for (let j = r + 1; j < 7; j++) M[j] = Af.mul(M[j - 1], Af.inv(A[j - 1]));
    return { z, M, r, V, A, d, rot };
  },

  frame(t) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.imageSmoothingEnabled = true;
    const cam = this.camera(t), { z, M } = cam;
    const st = LV.map((L, j) => { const k = 10 ** (z + L.e), S = 1000 * k; return { k: Af.sc(M[j]), S, ain: fadeIn(L, S), aout: fadeOut(L, S) }; });
    const on = st.map((s) => s.ain > 0 && s.aout > 0);
    let K = 0; for (let j = 0; j < 7; j++) if (on[j]) K = j;
    // the outermost level over its own ground; while it is still fading in, a veil of the child's ground covers it
    ctx.fillStyle = LV[K].ground; ctx.fillRect(0, 0, W, H);
    this.drawLevel(K, t, cam, st[K], 1);
    if (st[K].ain < 1) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - st[K].ain; ctx.fillStyle = LV[K - 1].ground; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    for (let j = K - 1; j >= 0; j--) if (on[j]) this.drawLevel(j, t, cam, st[j], st[j].aout);
    // air: a camera at height Hc looking down sees anything at height h scaled by Hc / (Hc − h)
    const Hc = W / (10 ** z * 2 * Math.tan(30 * DEG));
    if (st[4].aout > 0) drawAirClouds(ctx, M[4], st[4].k, Hc, F, this.clouds, st[4].aout);
    this.drawMotes(ctx, t, M[1], st[1].k, Hc, st[1].aout);
    this.drawGlint(ctx, t, cam, st);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    this.drawHud(ctx, t, z, cam);
    const veil = 0.9 * (1 - ease.outCubic(clamp(t / 0.6)));
    if (veil > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = veil; ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  },

  drawLevel(j, t, cam, s, fa) {
    const ctx = this.ctx, M = cam.M[j], k = s.k;
    if (j === 0) drawDrop(ctx, M, k, t, this.drop, fa);
    else if (j === 1) drawLeaf(ctx, M, k, t, this.L1, fa);
    else if (j === 2) drawGarden(ctx, M, k, t, this.garden, this.leaf, fa);
    else if (j === 3) drawHood(ctx, M, k, t, this.hood, fa);
    else if (j === 4) drawCity(ctx, M, k, t, this.city, fa);
    else if (j === 5) drawPeninsula(ctx, M, k, t, this.pen, cam.V, Af.inv(cam.A[5]), fa);
    else drawEarth(ctx, M, k, t, this.earth, cam.V, cam.rot * 0.4 * DEG);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  },

  /** pollen and mist a few mm above the leaf: soft out-of-focus discs that rush past the rising camera */
  drawMotes(ctx, t, M1, k1, Hc, fa) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const m of this.motes) {
      if (Hc < m.h * 1.1) continue;
      const kz = Hc / (Hc - m.h), a = fa * (1 - smooth((kz - 1.6) / 2.4)) * smooth((t - 0.9) / 0.4) * smooth((m.r * k1 * kz * 1.5 - 6) / 30);
      if (a <= 0.01) continue;
      const [sx, sy] = Af.ap(M1, m.x + 1.2 * Math.sin(t * 0.7 + m.ph), m.y + 0.8 * Math.cos(t * 0.5 + m.ph));
      const x = F[0] + (sx - F[0]) * kz, y = F[1] + (sy - F[1]) * kz, r = m.r * k1 * kz * 1.5;
      if (r < 6 || x < -r || x > W + r || y < -r || y > H + r) continue;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(240,255,222,0.10)'); g.addColorStop(0.78, 'rgba(240,255,222,0.2)'); g.addColorStop(0.92, 'rgba(250,255,236,0.32)'); g.addColorStop(1, 'rgba(250,255,236,0)');
      ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  /** the accent: a warm glint born on the drop's highlight; it stays where the drop is, through every level */
  drawGlint(ctx, t, cam, st) {
    const [x, y] = Af.ap(cam.M[0], GLINT_AT[0], GLINT_AT[1]);
    const birth = clamp((t - 0.35) / 0.45), s0 = birth <= 0 ? 0 : ease.outBack(birth, 2.2);
    if (s0 <= 0) return;
    const big = smooth((Math.log(st[0].S) - Math.log(60)) / (Math.log(500) - Math.log(60)));   // larger while the drop is large
    const s = s0 * (0.6 + 0.4 * big), tw = 0.86 + 0.14 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let g = ctx.createRadialGradient(x, y, 0, x, y, 54 * s);
    g.addColorStop(0, 'rgba(255,196,96,0.6)'); g.addColorStop(0.35, 'rgba(255,176,70,0.2)'); g.addColorStop(1, 'rgba(255,176,70,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 54 * s, 0, TAU); ctx.fill();
    // pulses: when the glint is born, at each new level, and twice in the afterglow
    for (const tp of [0.42, ...T_SWITCH, 8.75, 9.45]) {
      const q = (t - tp) / 0.9; if (q < 0 || q > 1) continue;
      ctx.strokeStyle = ACC; ctx.globalAlpha = (1 - q) * 0.85; ctx.lineWidth = 1 + 3 * (1 - q);
      ctx.beginPath(); ctx.arc(x, y, 12 + 78 * ease.outCubic(q), 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.15 * Math.sin(t * 0.8));
    const star = (L, w) => { ctx.beginPath(); ctx.moveTo(0, -L); ctx.quadraticCurveTo(w * 0.35, -w * 0.35, L, 0); ctx.quadraticCurveTo(w * 0.35, w * 0.35, 0, L); ctx.quadraticCurveTo(-w * 0.35, w * 0.35, -L, 0); ctx.quadraticCurveTo(-w * 0.35, -w * 0.35, 0, -L); ctx.fill(); };
    ctx.fillStyle = ACC; star(36 * s * tw, 9 * s);
    ctx.rotate(Math.PI / 4); ctx.globalAlpha = 0.8; star(17 * s * tw, 6 * s);
    ctx.globalAlpha = 1; ctx.fillStyle = ACC_CORE; ctx.beginPath(); ctx.arc(0, 0, 5.5 * s, 0, TAU); ctx.fill();
    ctx.restore();
  },

  drawHud(ctx, t, z, cam) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // top scrim + level label
    let g = ctx.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, 'rgba(10,24,30,0.5)'); g.addColorStop(1, 'rgba(10,24,30,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 380);
    const lin = ease.outCubic(clamp((t - 0.25) / 0.6));
    let cur = 0; while (cur < 6 && t >= T_SWITCH[cur]) cur++;
    // title change in two beats: the old magnitude and name slide up and fade out completely (0.2 s), then the new
    // ones rise in (0.32 s, the name 0.05 s after the magnitude). The two titles are never on screen at the same time.
    const Ts = cur > 0 ? T_SWITCH[cur - 1] : -9, OUT = 0.2, IN = 0.32;
    const mag = (j, dy) => {
      ctx.font = `600 30px ${PRE}`; ctx.fillText('10', 100, 138 + dy);
      const w10 = ctx.measureText('10').width;
      ctx.font = `700 20px ${PRE}`; const ex = LV[j].x < 0 ? '−' + -LV[j].x : String(LV[j].x); ctx.fillText(ex, 102 + w10, 124 + dy);
      const we = ctx.measureText(ex).width;
      ctx.font = `600 30px ${PRE}`; ctx.fillText(' m', 104 + w10 + we, 138 + dy);
    };
    const name = (j, dy) => { ctx.font = `800 66px ${PRE}`; ctx.fillText(LV[j].name, 64, 218 + dy); };
    ctx.fillStyle = PAPER;
    const qo = clamp((t - Ts) / OUT);
    if (cur > 0 && qo < 1) { ctx.globalAlpha = lin * (1 - ease.inCubic(qo)); const dy = -24 * ease.inCubic(qo); mag(cur - 1, dy); name(cur - 1, dy); }
    for (const [draw, lag] of [[mag, 0], [name, 0.05]]) {
      const qi = cur > 0 ? clamp((t - Ts - OUT - lag) / IN) : 1;
      if (qi <= 0) continue;
      ctx.globalAlpha = lin * ease.outCubic(qi);
      draw(cur, 28 * (1 - ease.outCubic(qi)) + 30 * (1 - lin));
    }
    ctx.globalAlpha = 1;
    ctx.globalAlpha = lin; ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(76, 128, 8, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    // afterglow line
    const af = ease.outCubic(clamp((t - 8.45) / 0.6));
    if (af > 0) {
      ctx.globalAlpha = af; ctx.fillStyle = PAPER; ctx.font = `600 30px ${PRE}`;
      const y = 276 + (1 - af) * 24, s1 = '1 mm에서 12,742 km까지 · 약 10', s2 = '배';
      ctx.fillText(s1, 64, y); const w1 = ctx.measureText(s1).width;
      ctx.font = `700 20px ${PRE}`; ctx.fillText('10', 66 + w1, y - 14); const w2 = ctx.measureText('10').width;
      ctx.font = `600 30px ${PRE}`; ctx.fillText(s2, 70 + w1 + w2, y);
      ctx.globalAlpha = 1;
    }
    this.drawScale(ctx, t, z);
  },

  /** bottom panel: a scale bar of a "nice" length with an odometer, and the ten-decade track */
  drawScale(ctx, t, z) {
    const pin = ease.outCubic(clamp((t - 0.4) / 0.6)), oy = (1 - pin) * 70;
    if (pin <= 0) return;
    ctx.setTransform(1, 0, 0, 1, 0, oy); ctx.globalAlpha = pin;
    ctx.fillStyle = 'rgba(12,28,36,0.66)'; ctx.beginPath(); ctx.roundRect(64, 1466, 952, 160, 30); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5; ctx.stroke();
    const p = 10 ** z;                                           // px per metre
    let i = 0; while (i + 1 < NICE.length && T_NICE[i + 1] <= t) i++;
    const dt = i > 0 ? t - T_NICE[i] : 9, q = ease.inOutCubic(clamp(dt / 0.15));
    const L = lerp((i > 0 ? NICE[i - 1] : NICE[i]) * p, NICE[i] * p, q);
    // the bar: a filled half and an outlined half, ticks at 0, ½, 1
    const x0 = 104, y0 = 1534;
    ctx.fillStyle = PAPER; ctx.fillRect(x0, y0 - 6, L / 2, 12);
    ctx.strokeStyle = PAPER; ctx.lineWidth = 2; ctx.strokeRect(x0 + L / 2, y0 - 5, L / 2, 10);
    ctx.fillRect(x0 - 1.5, y0 - 18, 3, 30); ctx.fillRect(x0 + L / 2 - 1, y0 - 12, 2, 18); ctx.fillRect(x0 + L - 1.5, y0 - 18, 3, 30);
    // odometer: characters right-aligned in fixed slots; changed ones roll up, staggered from the right
    const [nNew, uNew] = fmt(NICE[i]), [nOld, uOld] = i > 0 ? fmt(NICE[i - 1]) : [nNew, uNew];
    ctx.save(); ctx.beginPath(); ctx.rect(560, 1490, 440, 74); ctx.clip();
    ctx.font = `800 56px ${PRE}`; const wd = ctx.measureText('0').width;
    const slots = (s) => { const out = []; let x = 918; for (let c = s.length - 1; c >= 0; c--) { const ch = s[c], w = ch === '.' || ch === ',' ? wd * 0.42 : wd; x -= w; out.push([ch, x, s.length - 1 - c]); } return out; };
    const roll = (ch, x, dy, a) => { if (a <= 0) return; ctx.globalAlpha = pin * a; ctx.fillText(ch, x, 1550 + dy); };
    const A_ = slots(nNew), B_ = slots(nOld);
    ctx.fillStyle = PAPER;
    for (const [ch, x, r] of A_) {
      const same = q >= 1 || B_.some(([c2, x2, r2]) => r2 === r && c2 === ch && Math.abs(x2 - x) < 0.5);
      const qq = same ? 1 : ease.outCubic(clamp((dt - r * 0.02) / 0.11));
      roll(ch, x, (1 - qq) * 58, qq);
    }
    for (const [ch, x, r] of B_) {
      if (q >= 1 || A_.some(([c2, x2, r2]) => r2 === r && c2 === ch && Math.abs(x2 - x) < 0.5)) continue;
      const qq = ease.outCubic(clamp((dt - r * 0.02) / 0.11));
      roll(ch, x, -qq * 58, 1 - qq);
    }
    ctx.font = `700 32px ${PRE}`;
    if (uNew === uOld || q >= 1) roll(uNew, 930, 0, 1);
    else { roll(uOld, 930, -q * 50, 1 - q); roll(uNew, 930, (1 - q) * 50, q); }
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, oy); ctx.globalAlpha = pin;
    // decade track: 10^-3 … 10^7 m, the marker is the size of the framed view
    const tx0 = 104, tx1 = 976, ty = 1588, lg = Math.log10(680 / p), X = (d) => tx0 + ((d + 3) / DZ) * (tx1 - tx0);
    ctx.fillStyle = 'rgba(243,248,241,0.22)'; ctx.fillRect(tx0, ty - 1, tx1 - tx0, 2);
    ctx.fillStyle = 'rgba(243,248,241,0.85)'; ctx.fillRect(tx0, ty - 1.5, Math.max(0, X(lg) - tx0), 3);
    ctx.font = `600 19px ${PRE}`; ctx.textAlign = 'center';
    for (let d = -3; d <= 7; d++) {
      const passed = lg >= d - 0.02;
      ctx.fillStyle = passed ? 'rgba(243,248,241,0.9)' : 'rgba(243,248,241,0.32)';
      ctx.fillRect(X(d) - 1, ty - 7, 2, 14);
      const lab = { '-3': '1 mm', 0: '1 m', 3: '1 km', 6: '1,000 km' }[d];
      if (lab) { ctx.globalAlpha = pin * (passed ? 0.75 : 0.4); ctx.fillText(lab, X(d), ty + 30); ctx.globalAlpha = pin; }
    }
    ctx.textAlign = 'left';
    const gg = ctx.createRadialGradient(X(lg), ty, 0, X(lg), ty, 22);
    gg.addColorStop(0, 'rgba(255,190,90,0.55)'); gg.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(X(lg), ty, 22, 0, TAU); ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(X(lg), ty, 7.5, 0, TAU); ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  },
});

/** a dark gradient under the harness caption (static DOM layer) */
function captionScrim(api, rgb) {
  const el = api.layer('div', { z: 999 });
  el.style.background = `linear-gradient(to bottom, rgba(${rgb},0) 82%, rgba(${rgb},.36) 90%, rgba(${rgb},.6) 100%)`;
  el.style.pointerEvents = 'none';
}
