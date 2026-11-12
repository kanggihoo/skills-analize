/*
 * sky.js — the sky through the window camera: a per-pixel sky from the sun's elevation and angle (painted at 1/6
 * resolution and smoothed up), streaming clouds on a cloud deck blurred along the wind by the shutter, low-poly
 * mountains lit by the sun with aerial perspective, and the star-trail stack around the pole.
 */
import { clamp, rand } from '../_lib/stage.js';
import { DEG, HC, F, proj, projDir, pixelDir, enuToWorld, bodyENU, sunAt, hex, table, mix, mul, scale, add, css, toByte, shade } from './cam.js';
import { hannCDF } from './clock.js';

// ---------------------------------------------------------------- sky colour (image-referred, keyed by sun elevation)
const ZEN = table([[-18, '#070c22'], [-12, '#0e1c46'], [-8, '#182e64'], [-5, '#243d80'], [-2, '#344f96'], [2, '#4469aa'], [8, '#4a7cc0'], [25, '#3f82d0']]);
const HOR = table([[-18, '#141c3a'], [-12, '#22305e'], [-8, '#46508c'], [-5, '#8a7fae'], [-2, '#d9958a'], [2, '#f2ae80'], [8, '#efc996'], [16, '#e3dcc8'], [25, '#bcdcf0']]);
const GLOW = table([[-18, '#000000'], [-12, '#2a2140'], [-8, '#7a4a64'], [-5, '#d47766'], [-2, '#ff8a50'], [2, '#ff9a4e'], [8, '#ffb870'], [16, '#ffdcae'], [25, '#fff1d8']]);
const CITY = hex('#3a2a3a');
export const horizonAt = HOR, zenithAt = ZEN, glowAt = GLOW;

export const SKY_W = 180, SKY_H = 132, SKY_S = 6;   // 1/6 resolution, covers stage y 0..792

/** bake the per-texel view directions once */
export function bakeSkyDirs() {
  const dirs = new Float32Array(SKY_W * SKY_H * 3);
  for (let j = 0; j < SKY_H; j++) for (let i = 0; i < SKY_W; i++) {
    const d = pixelDir((i + 0.5) * SKY_S, (j + 0.5) * SKY_S), k = (j * SKY_W + i) * 3;
    dirs[k] = d[0]; dirs[k + 1] = d[1]; dirs[k + 2] = d[2];
  }
  return dirs;
}

/**
 * Sky colour of view direction d: horizon → zenith by 1 − e^(−alt/0.32), plus the sun's forward-scattering glow
 * e^(−γ/0.35) and a wide horizon band e^(−γ/1.2)·e^(−alt/0.12) toward the sun (γ = angle to the sun).
 */
export function paintSky(img, dirs, sunW, h) {
  const zen = ZEN(h), hor = HOR(h), glow = GLOW(h);
  const night = clamp((-h - 8) / 8);
  const px = img.data;
  for (let p = 0, k = 0; p < SKY_W * SKY_H; p++, k += 3) {
    const dx = dirs[k], dy = dirs[k + 1], dz = dirs[k + 2];
    const alt = Math.max(0, Math.asin(dy));
    const cg = clamp(dx * sunW[0] + dy * sunW[1] + dz * sunW[2], -1, 1), g = Math.acos(cg);
    const v = 1 - Math.exp(-alt / 0.32), hz = Math.exp(-alt / 0.12);
    const gl = 0.55 * Math.exp(-g / 0.35) + 0.6 * Math.exp(-g / 1.2) * hz;
    const ct = night * 0.6 * hz;
    for (let c = 0; c < 3; c++) {
      const lin = hor[c] + (zen[c] - hor[c]) * v + glow[c] * gl + CITY[c] * ct;
      px[p * 4 + c] = toByte(lin);
    }
    px[p * 4 + 3] = 255;
  }
}

// ---------------------------------------------------------------- stars and the stack
export const T_STACK = 18 + 50 / 60;           // the star stack starts at 18:50
const SID = 15.041 * DEG;                      // sidereal rate per hour (ω ≈ 15°/h)
/** limiting magnitude the camera reaches against the sky at sun elevation h */
const mLim = (h) => 1.2 + (-h - 6) * 0.55;
export function makeStars(seed = 1601) {
  const r = rand(seed), stars = [];
  const tints = ['#fff4e2', '#f2f5ff', '#dfe8ff', '#ffe6c8', '#ffffff'].map(hex);
  for (let i = 0; i < 520; i++) {
    const dec = Math.asin(-0.15 + 1.15 * r());           // uniform on the sphere above dec ≈ −9°
    const ra = r() * Math.PI * 2;
    const m = 4.9 - 4.3 * Math.pow(r(), 2.4);
    stars.push({ dec, ra, m, tint: tints[Math.floor(r() * tints.length)] });
  }
  stars.push({ dec: 89.2 * DEG, ra: 0.4, m: 1.6, tint: hex('#fff6e8'), pole: true });
  // when each star starts and finishes appearing (the dusk is monotone after sunset: scan once)
  for (const s of stars) {
    s.t0 = 99; s.t1 = 99;
    for (let T = 18.3; T < 22; T += 1 / 120) {
      const v = (mLim(sunAt(T).h) - s.m) / 1.1;
      if (v > 0 && s.t0 > 90) s.t0 = T;
      if (v >= 1) { s.t1 = T; break; }
    }
  }
  return stars;
}
/** world direction of a star at scene time T (local sidereal time ≈ solar time here) */
const starDir = (s, T) => enuToWorld(bodyENU(s.dec, SID * T - s.ra));
const vis = (s, T) => { if (T <= s.t0) return 0; if (T >= s.t1) return 1; const k = (T - s.t0) / (s.t1 - s.t0); return k * k * (3 - 2 * k); };

/**
 * Cumulative stack since T_STACK: a lighten (max) blend of every frame, so each star leaves its whole arc at full
 * brightness — angle ω·(T − T_start), ω = 15.04°/h — never diluted by the arc's length. The record of a star at each
 * point of its arc is the brightness it had when it passed there (fainter while the sky was still bright).
 */
export function drawStarStack(g, stars, T) {
  if (T <= T_STACK) return;
  g.globalCompositeOperation = 'lighter';
  g.lineCap = 'round'; g.lineJoin = 'round';
  const STEP = 1.2 * DEG / SID;                       // hours per 1.2° of rotation
  for (const s of stars) {
    const ta = Math.max(T_STACK, s.t0);
    if (T <= ta) continue;
    const bright = clamp((5.4 - s.m) / 4.2), w = 1.15 + 1.5 * bright, a = 0.38 + 0.62 * bright;
    // points along the arc, oldest first
    const n = Math.max(1, Math.ceil((T - ta) / STEP));
    const pts = [];
    let behind = 0;
    for (let i = 0; i <= n; i++) {
      const tt = ta + ((T - ta) * i) / n, d = starDir(s, tt);
      if (d[1] < -0.02) { behind++; pts.push(null); continue; }
      const p = projDir(d);
      pts.push(p && p[1] < 800 && p[0] > -40 && p[0] < 1120 ? [p[0], p[1], tt] : null);
    }
    if (behind === pts.length) continue;
    // stroke in runs; the faded beginning gets a gradient from the visibility record
    let run = [];
    const flush = () => {
      if (run.length >= 2) {
        const p0 = run[0], p1 = run[run.length - 1], v0 = vis(s, p0[2]), v1 = vis(s, p1[2]);
        const col = s.tint;
        if (v0 < 0.999) {
          const gr = g.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
          const vm = vis(s, (p0[2] + p1[2]) / 2);
          gr.addColorStop(0, css(col, a * v0)); gr.addColorStop(0.5, css(col, a * vm)); gr.addColorStop(1, css(col, a * v1));
          g.strokeStyle = gr;
        } else g.strokeStyle = css(col, a);
        g.lineWidth = w;
        g.beginPath(); g.moveTo(run[0][0], run[0][1]);
        for (let i = 1; i < run.length; i++) g.lineTo(run[i][0], run[i][1]);
        g.stroke();
        if (bright > 0.55) {                             // a soft halo on the bright ones
          g.lineWidth = w * 3.2; g.globalAlpha = 0.16 * bright; g.stroke(); g.globalAlpha = 1;
        }
      }
      run = [];
    };
    // split the arc where the visibility ramp ends, so the solid part is one cheap stroke
    for (const p of pts) {
      if (!p) { flush(); continue; }
      run.push(p);
      if (run.length > 1 && p[2] >= s.t1 && run[0][2] < s.t1) { flush(); run.push(p); }
    }
    flush();
  }
  g.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- clouds
const CLOUD_H = 2200;                          // cloud deck height (m)
const WIND = [0.8 * 1.25, -0.6 * 1.25];        // m/s on the deck (from the far left horizon toward the camera)
const ZMIN = 2600, ZMAX = 34000, XW = 13000;
const SIG_U = Math.sqrt(1 / 12 - 1 / (2 * Math.PI * Math.PI));   // std-dev of u under the Hann window: 0.1808
/** cloud cover through the day (fraction of clusters alive) */
const COVER = (T) => {
  const k = [[4.5, 0.2], [7, 0.3], [10, 0.6], [15, 0.64], [17.5, 0.55], [18.5, 0.42], [19.15, 0.05], [24, 0]];
  if (T <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (T <= k[i][0]) { let u = (T - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); u = u * u * (3 - 2 * u); return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * u; }
  return 0;
};
export function makeClouds(seed = 1602) {
  const r = rand(seed), cl = [];
  for (let i = 0; i < 60; i++) {
    const c = { x: (r() * 2 - 1) * XW, z: ZMIN + r() * (ZMAX - ZMIN), th: r() * 0.95, puffs: [] };
    const n = 7 + Math.floor(r() * 6), len = 1800 + r() * 3200;
    for (let j = 0; j < n; j++) {
      const u = j / (n - 1) - 0.5, mid = 1 - Math.abs(u) * 2;
      const rad = (260 + 420 * r()) * (0.55 + 0.45 * mid);
      c.puffs.push({ dx: u * len + (r() - 0.5) * 260, dz: (r() - 0.5) * 500, dy: rad * (0.15 + 0.5 * mid) * r(), r: rad });
    }
    cl.push(c);
  }
  return cl;
}
const wrap = (v, lo, span) => lo + ((((v - lo) % span) + span) % span);
function cloudPos(c, p, Ts) {
  return [wrap(c.x + p.dx + WIND[0] * Ts, -XW, 2 * XW), CLOUD_H + p.dy, wrap(c.z + p.dz + WIND[1] * Ts, ZMIN, ZMAX - ZMIN)];
}
/**
 * Each puff is a uniform ellipse with covariance Σ (in screen px). The shutter smears it along its screen motion Δ over
 * the window; under the Hann window the position spread has std-dev σ_u·|Δ| (σ_u = 0.181), so the blurred puff has
 *   Σ' = Σ + σ_u²·ΔΔᵀ,  drawn as the unit disc through M = chol(4Σ'), alpha × √(det Σ / det Σ') (mass is kept).
 */
export function drawClouds(g, clouds, T, S, L, hor) {
  const cov = COVER(T);
  if (cov <= 0.001) return;
  const Ts = T * 3600, Ss = S * 3600;
  // cloud light: the deck at 2.2 km keeps the sun ≈1.5° longer than the street
  const sunK = L.avg((h) => { const v = clamp((h + 1.5) / 2.5); return v * v * (3 - 2 * v); });
  const sunC = scale(sunAt(T).h > -2 ? L.sunRaw : [0, 0, 0], sunK);
  const lit = add(scale(L.amb, 0.95), scale(sunC, 0.9)), dark = add(scale(L.amb, 0.72), scale(sunC, 0.18));
  const items = [];
  for (const c of clouds) {
    const life = clamp((cov - c.th) / 0.14);
    if (life <= 0) continue;
    const sz = life * life * (3 - 2 * life);
    for (const p of c.puffs) {
      const a = cloudPos(c, p, Ts - Ss / 2), b = cloudPos(c, p, Ts), o = cloudPos(c, p, Ts - Ss);
      if (Math.abs(b[2] - o[2]) > (ZMAX - ZMIN) / 2 || Math.abs(b[0] - o[0]) > XW) continue;   // wrapped inside the window
      const pa = proj(a[0], a[1], a[2]);
      if (pa[2] < 100 || pa[1] > 760 || pa[0] < -400 || pa[0] > 1480) continue;
      const pb = proj(b[0], b[1], b[2]), po = proj(o[0], o[1], o[2]);
      const rpx = (F * p.r * (0.55 + 0.45 * sz)) / pa[2];
      const alt = Math.atan2(a[1] - HC, Math.hypot(a[0], a[2]));
      const sq = clamp(0.3 + 1.6 * Math.sin(alt), 0.3, 1);
      const fade = clamp((a[2] - ZMIN) / 1200) * clamp((ZMAX - a[2]) / 6000) * clamp((XW - Math.abs(a[0])) / 2500);   // fade out where the deck wraps
      items.push({ x: pa[0], y: pa[1], z: pa[2], rx: rpx, ry: rpx * sq, dx: pb[0] - po[0], dy: pb[1] - po[1], al: sz * fade });
    }
  }
  items.sort((u, v) => v.z - u.z);
  const hz = hor;
  for (const it of items) {
    // aerial perspective toward the horizon colour
    const fog = clamp(1 - Math.exp(-(it.z - 2500) / 16000)) * 0.85;
    const cl = mix(lit, hz, fog), cd = mix(dark, hz, fog);
    const sxx = (it.rx * it.rx) / 4 + SIG_U * SIG_U * it.dx * it.dx, syy = (it.ry * it.ry) / 4 + SIG_U * SIG_U * it.dy * it.dy;
    const sxy = SIG_U * SIG_U * it.dx * it.dy;
    const det0 = ((it.rx * it.rx) / 4) * ((it.ry * it.ry) / 4), det1 = sxx * syy - sxy * sxy;
    const k = Math.sqrt(det0 / det1);
    // M = chol(4Σ'): [[m00, 0], [m10, m11]]
    const m00 = Math.sqrt(4 * sxx), m10 = (4 * sxy) / m00, m11 = Math.sqrt(Math.max(1e-6, 4 * syy - m10 * m10));
    const soft = clamp(1 - k);                           // a smeared puff loses its crisp edge
    const e0 = 0.78 - 0.5 * soft;
    for (const [col, oy, sc, al] of [[cd, 0.16, 1, 0.95], [cl, -0.1, 0.86, 1]]) {
      g.setTransform(m00 * sc / 64, m10 * sc / 64, 0, m11 * sc / 64, it.x, it.y + oy * it.ry);
      g.globalAlpha = clamp(it.al * k * al);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 64);
      gr.addColorStop(0, css(col)); gr.addColorStop(e0, css(col)); gr.addColorStop((e0 + 1) / 2, css(col, 0.55)); gr.addColorStop(1, css(col, 0));
      g.fillStyle = gr;
      g.beginPath(); g.arc(0, 0, 64, 0, Math.PI * 2); g.fill();
    }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- mountains (low-poly, lit by the sun, aerial perspective)
export function makeMountains(seed = 1603) {
  const r = rand(seed);
  const layers = [];
  const spec = [
    { Z: 15000, base: 900, peaks: [[-0.95, 1500], [-0.55, 2300], [-0.18, 1700], [0.12, 2050], [0.55, 2500], [0.9, 1600]], alb: '#8d9dbb', snow: 1900, rough: 0.42 },
    { Z: 8200, base: 520, peaks: [[-0.9, 900], [-0.5, 1350], [-0.1, 1050], [null, 1950], [0.62, 1250], [0.95, 980]], alb: '#6b8094', snow: 1450, rough: 0.4 },
    { Z: 3600, base: 120, peaks: [[-0.95, 300], [-0.62, 420], [-0.3, 260], [0.05, 380], [0.38, 300], [0.7, 470], [1.0, 330]], alb: '#5f7a66', snow: 0, rough: 0.35 },
  ];
  const cp = Math.cos(20 * DEG), spn = Math.sin(20 * DEG);
  for (const sp of spec) {
    const W = 1.2 * sp.Z;
    // anchors: valleys between given peaks; the peak marked null stands right under the pole star
    // (pole screen x 723 → xc/zc = 0.2614, with zc = −(Y − HC)·sin p + Z·cos p)
    let pts = [[-1.25 * W, sp.base * 0.8, sp.Z]];
    for (const [u, H] of sp.peaks) {
      const X = u == null ? 0.2614 * (-(H - HC) * spn + sp.Z * cp) : u * W;
      pts.push([X, H, sp.Z + (r() - 0.5) * sp.Z * 0.08]);
    }
    pts.push([1.25 * W, sp.base * 0.8, sp.Z]);
    pts.sort((a, b) => a[0] - b[0]);
    let ridge = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      ridge.push([(a[0] + b[0]) / 2 + (r() - 0.5) * (b[0] - a[0]) * 0.3, sp.base + (Math.min(a[1], b[1]) - sp.base) * (0.25 + 0.3 * r()), (a[2] + b[2]) / 2]);
      ridge.push(b);
    }
    // midpoint displacement: two levels of smaller shoulders and notches
    for (let lev = 0; lev < 2; lev++) {
      const nr = [ridge[0]];
      for (let i = 1; i < ridge.length; i++) {
        const a = ridge[i - 1], b = ridge[i], d = Math.abs(b[0] - a[0]);
        nr.push([(a[0] + b[0]) / 2 + (r() - 0.5) * d * 0.2, (a[1] + b[1]) / 2 + (r() - 0.5) * d * sp.rough * (lev ? 0.5 : 1) * 0.45, (a[2] + b[2]) / 2 + (r() - 0.5) * 300]);
        nr.push(b);
      }
      ridge = nr;
    }
    // two rows of facets: ridge → shoulder row → foot (low-poly), every triangle with its own normal
    const mid = ridge.map((p) => [p[0] + (r() - 0.5) * 400, sp.base * 0.5 + (p[1] - sp.base) * (0.35 + 0.2 * r()), p[2] - sp.Z * (0.06 + 0.04 * r())]);
    const foot = ridge.map((p) => [p[0] + (r() - 0.5) * 300, 0, p[2] - sp.Z * 0.16]);
    const tris = [];
    for (let i = 0; i < ridge.length - 1; i++) {
      tris.push([ridge[i], ridge[i + 1], mid[i]], [ridge[i + 1], mid[i + 1], mid[i]], [mid[i], mid[i + 1], foot[i]], [mid[i + 1], foot[i + 1], foot[i]]);
    }
    const alb = hex(sp.alb), snowA = hex('#eef1f5'), albB = mix(alb, hex('#8a8f7a'), 0.25);
    layers.push({
      Z: sp.Z,
      tris: tris.map((t, k) => {
        const [p, q, s] = t, u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], v = [s[0] - p[0], s[1] - p[1], s[2] - p[2]];
        let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        const l = Math.hypot(n[0], n[1], n[2]); n = n.map((x) => x / l);
        if (n[2] > 0) n = n.map((x) => -x);              // face the camera (−Z)
        const lo = Math.min(p[1], q[1], s[1]), hi = Math.max(p[1], q[1], s[1]);
        const snow = sp.snow && hi > sp.snow && lo > sp.snow * 0.7;
        return { n, scr: t.map((P) => proj(P[0], P[1], P[2])), alb: snow ? snowA : k % 4 >= 2 ? albB : alb };
      }),
    });
  }
  return layers;
}
export function drawMountains(g, layers, L, T, horizonCol0, zen) {
  const horizonCol = mix(horizonCol0, zen, 0.4);
  // the peaks keep the sun a little after the town (alpenglow): their own sunset is at h ≈ −1°
  const sv = L.avg((h) => { const v = clamp((h + 1.1) / 2.2); return v * v * (3 - 2 * v); });
  const Lm = { ...L, sun: scale(L.sunRaw, sv) };
  for (const ly of layers) {
    const fog = 1 - Math.exp(-ly.Z / 9500);
    for (const t of ly.tris) {
      const c = shade(t.alb, t.n, Lm, 0.9);
      g.fillStyle = css(mix(c, horizonCol, fog * 0.82));
      g.beginPath();
      g.moveTo(t.scr[0][0], t.scr[0][1]); g.lineTo(t.scr[1][0], t.scr[1][1]); g.lineTo(t.scr[2][0], t.scr[2][1]);
      g.fill();
      // hairline seams between facets: stroke with the same colour
      g.strokeStyle = g.fillStyle; g.lineWidth = 0.8; g.stroke();
    }
  }
}
