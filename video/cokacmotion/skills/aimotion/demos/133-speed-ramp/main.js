/*
 * 133 · 웅덩이 위의 알리 — speed ramp: time remapping by integrating a speed curve, exposure-accurate motion blur,
 * and a freeze frame that keeps living in real time while story time stands still.
 *
 *   0–2.5    1×      a kid in a yellow raincoat rolls down a rain-wet alley; the camera tracks, the layers slide
 *   2.5–3.2  1→0.1×  the ramp down catches the pop: the tail snaps, the nose rises, water leaves the front wheel
 *   3.2–4.3  0.1×    the float over the puddle; droplets hang; the board's reflection rises under it
 *   4.4–6.5  0×      freeze: 찰칵, grey world, white cut-out, name card — all on real time t, τ does not move
 *   6.5–8.6  0→2→1×  the cut-out lifts off to the card; landing in the rim, a streaking tail-drag stop
 *   8.6–10   1×      he turns back to the puddle, fist up; the water settles; drips
 *
 * Every picture is a function of t only: τ(t) is the closed-form integral of the speed curve (ramp.js), the scene is
 * a closed-form function of τ (kid.js, droplets, ripples, camera), and each frame averages the scene at the story
 * times of N instants inside its exposure window, so the blur length is (shutter × speed).
 */
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { FONTS, fontReady, signedDistance } from '../_lib/type.js';
import { KNOTS, speed, tau, exposure, TAU_FREEZE, FREEZE } from './ramp.js';
import { V, T_AIR, G, WX, makeStory, makeTracks, xkOf, vkOf, pose, drawKid, PAL } from './kid.js';
import * as A from './alley.js';

const D = 10, FPS = 30;
const { W, H, F, HC, YH, ZT, YG, YWB } = A;
const KR = `"${FONTS.pretendard.family}"`, BHS = `"${FONTS.blackHanSans.family}"`;

const CAM = A.makeCamera(TAU_FREEZE);
const CXF = CAM.max;                          // the still camera from the frozen frame on
const ST = makeStory(TAU_FREEZE, CXF - 540 + 925);   // the tail-drag stop ends at x = 925 on screen
makeTracks(ST);
const xk = (ta) => xkOf(ST, ta);
const XP = xk(TAU_FREEZE);                    // the puddle lies under the apex
const PD = A.makePuddle(XP);
const kidX = (ta) => 540 + xk(ta) - CAM.x(ta);
const KXF = kidX(TAU_FREEZE);
const KPF = pose(ST, TAU_FREEZE);             // the frozen pose (also the sticker)

// freeze treatment, on real time
const T_SNAP = FREEZE[0], T_GO = FREEZE[1];   // 4.4, 6.5
const PIVOT = [KXF, YG - 430];
const grayAt = (t) => (t < T_GO ? 0.92 * smooth((t - T_SNAP - 0.02) / 0.3) : 0.92 * (1 - smooth((t - T_GO) / 0.22)));
const zoomAt = (t) => {
  if (t < T_SNAP) return 1;
  if (t < T_GO) return 1 + 0.06 * (0.5 - 0.5 * Math.cos(Math.PI * clamp((t - T_SNAP) / (T_GO - T_SNAP))));
  return 1 + 0.06 * (1 - ease.outCubic(clamp((t - T_GO) / 0.32)));
};
const liftAt = (t) => smooth((t - T_SNAP - 0.08) / 0.38);
const R_OUT = 16;                             // white cut-out border (px)
const radiusAt = (t) => R_OUT * clamp(ease.outBack(clamp((t - T_SNAP - 0.08) / 0.34), 2.2), 0, 2);
const SLOT = { x: 262, y: 350, s: 0.46, r: -0.13 };   // where the cut-out ends up, beside the card
const FLY = [T_GO, T_GO + 0.56];
const CARD = { x: 392, y: 232, w: 628, h: 204, in: [4.86, 5.3], line: [5.12, 5.42] };

// ---------------------------------------------------------------- particles (all closed form, built once)
let DROPS = [], RINGS = [], WOB = [];
function buildWater() {
  const r = rand(1331);
  const add = (o) => {
    o.th = (o.vy + Math.sqrt(o.vy * o.vy + 2 * G * o.h0)) / G;   // the instant it meets the ground
    o.hx = o.x0 + o.vx * o.th; o.hz = o.z0 + o.vz * o.th;
    o.wet = PD.inside(o.hx, o.hz);
    DROPS.push(o);
    return o;
  };
  // spray off the wheels while they roll on the wet asphalt (and through the puddle's edge)
  const spray = (ta, tb, rate) => {
    for (let te = ta; te < tb; te += 1 / rate) for (const wx of [-WX, WX]) {
      const inP = PD.inside(xk(te) + wx, ZT);
      add({ t0: te, x0: xk(te) + wx - 8, h0: 5, z0: ZT + (r() - 0.5) * 30, vx: V * (0.25 + 0.4 * r()), vy: (inP ? 260 : 70) + (inP ? 420 : 210) * r(),
        vz: (r() - 0.5) * (inP ? 320 : 150), r: inP ? 2 + 2.6 * r() : 1.1 + 1.4 * r(), k: 0 });
    }
  };
  spray(-0.6, ST.pop - 0.07, 44);
  // the tail drag: the kicked tail plows the water film and throws a fan ahead of the board
  for (let te = ST.b0 + 0.02; te < ST.stop; te += 1 / 110) {
    const vk = vkOf(ST, te), f = vk / V;
    add({ t0: te, x0: xk(te) - 112, h0: 3, z0: ZT + (r() - 0.5) * 34, vx: vk * (0.7 + 0.6 * r()) + (r() - 0.5) * 180, vy: (150 + 560 * r()) * (0.4 + 0.6 * f),
      vz: -260 + 380 * r(), r: 1.3 + 3 * r() * r(), k: 1 });
  }
  // take-off: the front wheel leaves the water as the nose snaps up, the tail slaps the wet ground
  for (let i = 0; i < 58; i++) {
    const te = ST.pop - 0.06 * r(), hi = r() < 0.35;          // a third ride up with the board and hang beside it
    add({ t0: te, x0: xk(te) + 56 + (r() - 0.5) * 30, h0: 6, z0: ZT + (r() - 0.5) * 40,
      vx: hi ? V * (0.78 + 0.22 * r()) : V * (0.45 + 0.5 * r()) + (r() - 0.5) * 260, vy: hi ? 1150 + 420 * r() : 520 + 900 * r(),
      vz: -240 + 300 * r(), r: 2.8 + 7.4 * r() * r(), k: 1 });
  }
  for (let i = 0; i < 12; i++) {
    add({ t0: ST.pop, x0: xk(ST.pop) - 120 + (r() - 0.5) * 16, h0: 3, z0: ZT + (r() - 0.5) * 20, vx: V * 0.32 + (r() - 0.5) * 360, vy: 240 + 460 * r(),
      vz: -160 + 300 * r(), r: 1.8 + 2.4 * r(), k: 1 });
  }
  // landing: the back wheel comes down inside the far rim
  for (let i = 0; i < 34; i++) {
    add({ t0: ST.land, x0: xk(ST.land) - 56 + (r() - 0.5) * 30, h0: 4, z0: ZT + (r() - 0.5) * 30, vx: V * (0.3 + 0.6 * r()) + (r() - 0.5) * 240, vy: 340 + 820 * r(),
      vz: -320 + 460 * r(), r: 2.2 + 5 * r() * r(), k: 1 });
  }
  // drips from the eaves above the frame, onto the puddle (one is mid-air in the frozen frame)
  for (const td of [0.35, TAU_FREEZE - 0.72, 4.3, 5.25, 5.95, 6.42]) {
    add({ t0: td, x0: XP + 128, h0: 1900, z0: 980, vx: 0, vy: 0, vz: 0, r: 4.4, k: 2 });
  }
  // impacts: rings on the puddle (or a tiny splat on the asphalt); big drops throw a small crown
  const crowns = [];
  for (const d of DROPS) {
    const big = d.k === 2 || d.r > 4.8;
    RINGS.push({ t0: d.t0 + d.th, x: d.hx, z: d.hz, A: d.wet ? clamp(0.25 + d.r * 0.12, 0, 1) : 0.18, r0: d.r * 0.8, wet: d.wet, life: d.wet ? 2.2 : 0.35, sp: d.wet ? 150 : 90 });
    if (d.wet && big) {
      RINGS.push({ t0: d.t0 + d.th + 0.09, x: d.hx, z: d.hz, A: 0.55, r0: 0, wet: true, life: 1.8, sp: 120 });
      const n = d.k === 2 ? 7 : 4;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + r();
        crowns.push({ t0: d.t0 + d.th, x0: d.hx, h0: 1, z0: d.hz, vx: Math.cos(a) * 120, vy: 220 + 240 * r(), vz: Math.sin(a) * 90, r: 1.2 + 1.3 * r(), k: 3 });
      }
    }
  }
  for (const c of crowns) { add(c); RINGS.push({ t0: c.t0 + c.th, x: c.hx, z: c.hz, A: 0.18, r0: 1, wet: c.wet, life: c.wet ? 1.1 : 0.3, sp: 110 }); }
  // the wheels cutting the water: a ring every 1/30 s while a wheel is inside the outline
  for (let te = ST.pop - 0.4; te < ST.land + 0.5; te += 1 / 30) {
    if (te > ST.pop - 0.03 && te < ST.land) continue;
    for (const wx of [-WX, WX]) {
      const x = xk(te) + wx;
      if (PD.inside(x, ZT - 4)) RINGS.push({ t0: te, x, z: ZT - 4, A: 0.5, r0: 6, wet: true, life: 2, sp: 140 });
    }
  }
  RINGS.push({ t0: ST.land, x: xk(ST.land) - 56, z: ZT - 6, A: 1, r0: 10, wet: true, life: 2.4, sp: 170 });
  RINGS.push({ t0: ST.pop, x: xk(ST.pop) + 56, z: ZT - 6, A: 0.9, r0: 8, wet: true, life: 2.4, sp: 160 });
  DROPS.sort((a, b) => a.t0 - b.t0);
  WOB.push({ t: ST.pop, A: 2.5, ph: 0 }, { t: ST.land, A: 5, ph: 1.3 });
  for (const d of DROPS) if (d.k === 2 && d.wet) WOB.push({ t: d.t0 + d.th, A: 1.6, ph: d.t0 * 3 });
}

// ---------------------------------------------------------------- the scene at one story time
let SKY, SKY_G, CLOUDS, FAR, WALL, WREF, GROUND, PROPS, PLATE_A, PLATE_B, PLATE_F, PLATE_AG, PLATE_BG, PLATE_FG, SHADOW, KRC;

function drawSkyClouds(g, ta, cx, M) {
  M(1, 0, 0, 1, 0, 0);
  g.drawImage(SKY, 0, 0);
  for (const c of CLOUDS) {
    const span = W + 980;
    let x = c.x0 + c.sp * ta - 0.03 * cx;
    x = ((((x + 900) % span) + span) % span) - 900;
    g.globalAlpha = c.a;
    g.drawImage(c.c, x, c.y);
  }
  g.globalAlpha = 1;
}
function drawBack(g, cx, M) {                 // distant roofs, the wall, the wall's reflection in the wet ground
  M(1, 0, 0, 1, -A.FAR_F * cx, 0); g.drawImage(FAR, 0, 0);
  M(1, 0, 0, 1, WALL.x0 - A.WALL_F * cx, WALL.y0); g.drawImage(WALL.c, 0, 0);
  M(1, 0, 0, 1, WALL.x0 - A.WALL_F * cx, YWB); g.drawImage(WREF, 0, 0);
}
function drawGround(g, cx, M) {               // asphalt (sheared plane) + the puddle's sharp mirror
  M(1, 0, -cx / HC, 1, (cx * YH) / HC, 0);
  g.drawImage(GROUND, 0, YWB);
  M(1, 0, 0, 1, 0, 0);
  g.save();
  g.beginPath(); A.puddlePath(g, PD, cx); g.clip();
  const sky = g.createLinearGradient(0, 1420, 0, 1660);
  sky.addColorStop(0, '#a3b5c4'); sky.addColorStop(1, '#8a9fb2');
  g.fillStyle = sky; g.fillRect(0, 1150, W, 560);
  M(1, 0, 0, -1, WALL.x0 - A.WALL_F * cx, 2 * YWB - WALL.y0);   // the wall flipped about its base, unblurred
  g.drawImage(WALL.c, 0, 0);
  M(1, 0, 0, 1, 0, 0);
  const tint = g.createLinearGradient(0, 1200, 0, 1660);
  tint.addColorStop(0, 'rgba(36,52,68,0.16)'); tint.addColorStop(1, 'rgba(26,38,52,0.42)');
  g.fillStyle = tint; g.fillRect(0, 1150, W, 560);
  g.restore();
}
function drawProps(g, cx, M) {
  for (const p of PROPS) {
    const sx = 540 + (p.x - cx) * A.FG_F;
    if (sx + p.w < -40 || sx - p.w > W + 40) continue;
    M(1, 0, 0, 1, sx - p.w / 2, H + 120 - p.h);
    g.drawImage(p.c, 0, 0);
  }
}

const dropAt = (d, s) => [d.x0 + d.vx * s, d.h0 + d.vy * s - 0.5 * G * s * s, d.z0 + d.vz * s];
/** droplets: each one is drawn over its own share of the exposure (dt) as a capsule, so N samples join up into one streak */
function drawDrops(g, ta, dt, cx, sel, mirror) {
  g.lineCap = 'round';
  for (const d of DROPS) {
    if (d.t0 > ta + dt) break;
    const s = ta - d.t0;
    if (s < -dt / 2 || s > d.th + dt / 2) continue;
    const s0 = clamp(s - dt / 2, 0, d.th), s1 = clamp(s + dt / 2, 0, d.th);
    const [x0, h0, z0] = dropAt(d, s0), [x1, h1, z1] = dropAt(d, s1);
    if (!sel((z0 + z1) / 2)) continue;
    const m = mirror ? -1 : 1;
    const a = A.proj(x0, m * h0, z0, cx), b = A.proj(x1, m * h1, z1, cx);
    const rad = d.r * a[2];
    const fade = d.k === 0 ? 0.7 : 1;
    g.strokeStyle = mirror ? `rgba(170,190,206,${0.5 * fade})` : `rgba(206,222,235,${0.86 * fade})`;
    g.lineWidth = rad * 2;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0] + 0.01, b[1]); g.stroke();
    if (!mirror && rad > 1.6) {
      g.fillStyle = `rgba(255,255,255,${0.9 * fade})`;
      g.beginPath(); g.arc(b[0] - rad * 0.32, b[1] - rad * 0.34, rad * 0.36, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(40,58,76,0.35)'; g.lineWidth = 1;
      g.beginPath(); g.arc(b[0], b[1], rad, 0.2, Math.PI * 0.9); g.stroke();
    }
  }
}
function drawRings(g, ta, cx, wet) {
  g.lineWidth = 2.2;
  for (const q of RINGS) {
    if (q.wet !== wet) continue;
    const s = ta - q.t0;
    if (s <= 0 || s > q.life) continue;
    const R = q.r0 + q.sp * s - 16 * s * s;
    const a = q.A * Math.exp(-s / (wet ? 0.55 : 0.12)) * Math.min(1, s / 0.04);
    if (a < 0.01) continue;
    const [sx, sy, f] = A.proj(q.x, 0, q.z, cx), rx = Math.max(0.5, R * f), ry = rx * (HC / q.z);
    g.strokeStyle = `rgba(222,233,242,${(0.62 * a).toFixed(3)})`;
    g.beginPath(); g.ellipse(sx, sy - 1, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = `rgba(12,20,30,${(0.42 * a).toFixed(3)})`;
    g.beginPath(); g.ellipse(sx, sy + 1.6, rx * 0.97, ry * 0.95, 0, 0, Math.PI * 2); g.stroke();
  }
}

/**
 * The scene at story time ta. o: { M (base transform setter), gray (0..1 frozen-frame grey), hideKid, dt }
 * From the frozen frame on the camera is still, so the static layers come from pre-rendered plates
 * (colour and grey twins); before that they are drawn live at the camera's position.
 */
function drawScene(g, ta, o) {
  const { M, gray } = o;
  const cx = CAM.x(ta), still = ta >= TAU_FREEZE;
  const grayPlate = (img) => { if (gray > 0) { g.globalAlpha = gray; g.drawImage(img, 0, 0); g.globalAlpha = 1; } };
  drawSkyClouds(g, ta, cx, M);
  if (gray > 0) { M(1, 0, 0, 1, 0, 0); grayPlate(SKY_G); }
  if (still) { M(1, 0, 0, 1, 0, 0); g.drawImage(PLATE_A, 0, 0); grayPlate(PLATE_AG); } else drawBack(g, cx, M);

  const X = kidX(ta), kidOn = X > -420 && X < W + 420;
  const k = kidOn ? pose(ST, ta) : null;
  // the kid in the wet asphalt: a mirrored, soft, darker copy under the asphalt's own wet/dry layer
  if (kidOn) {
    const q = KRC.g;
    q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, KRC.c.width, KRC.c.height);
    q.setTransform(0.25, 0, 0, 0.25, 75, 10);
    drawKid(q, PAL.refl, k);
    if (gray > 0) { q.globalAlpha = gray; drawKid(q, PAL.grayRefl, k); q.globalAlpha = 1; }
    M(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 0.62;
    const sv = 1.1;
    g.drawImage(KRC.c, X - 300, YG - 40 * sv, 600, 800 * sv);
    g.globalAlpha = 1;
  }
  if (still) {
    M(1, 0, 0, 1, 0, 0); g.drawImage(PLATE_B, 0, 0); grayPlate(PLATE_BG);
    // disturbed water: the mirror image shifts sideways in thin rows, a sum of decaying waves from each impact
    let any = 0;
    for (const w of WOB) if (ta > w.t && ta - w.t < 3) any = Math.max(any, w.A * Math.exp(-(ta - w.t) / 0.55));
    if (any > 0.08) {
      g.save(); g.beginPath(); A.puddlePath(g, PD, cx); g.clip();
      for (let y = 1196; y < 1640; y += 5) {
        let dx = 0;
        for (const w of WOB) {
          const s = ta - w.t;
          if (s <= 0 || s > 3) continue;
          dx += w.A * Math.exp(-s / 0.55) * smooth(s / 0.06) * Math.sin(0.045 * y - 12 * s + w.ph);
        }
        dx *= (y - YH) / HC;
        g.drawImage(PLATE_B, 0, y, W, 5, dx, y, W, 5);
        if (gray > 0) { g.globalAlpha = gray; g.drawImage(PLATE_BG, 0, y, W, 5, dx, y, W, 5); g.globalAlpha = 1; }
      }
      g.restore();
    }
  } else drawGround(g, cx, M);

  // inside the puddle: the kid's mirror image, the droplets' mirror images, the rings
  M(1, 0, 0, 1, 0, 0);
  g.save();
  g.beginPath(); A.puddlePath(g, PD, cx); g.clip();
  if (kidOn) {
    M(1, 0, 0, 1, X, YG);
    drawKid(g, PAL.refl, k);
    if (gray > 0) { g.globalAlpha = gray; drawKid(g, PAL.grayRefl, k); g.globalAlpha = 1; }
    M(1, 0, 0, 1, 0, 0);
  }
  drawDrops(g, ta, o.dt, cx, () => true, true);
  drawRings(g, ta, cx, true);
  g.restore();
  M(1, 0, 0, 1, 0, 0);
  g.beginPath(); A.puddlePath(g, PD, cx);
  g.strokeStyle = 'rgba(12,18,28,0.38)'; g.lineWidth = 3; g.stroke();
  g.save(); g.translate(0, -2); g.strokeStyle = 'rgba(214,226,236,0.16)'; g.lineWidth = 2; g.stroke(); g.restore();
  drawRings(g, ta, cx, false);

  // contact shadow (not on the water)
  if (kidOn) {
    const hn = clamp(k.b.y / 210, 0, 1.2);
    const w = 270 * (1 - 0.3 * hn);
    g.save();
    g.beginPath(); g.rect(0, 1100, W, 400); A.puddlePath(g, PD, cx); g.clip('evenodd');
    g.globalAlpha = 0.55 * (1 - 0.6 * hn);
    g.drawImage(SHADOW, X - w / 2, YG - 16, w, 40);
    g.restore();
    g.save();
    g.beginPath(); A.puddlePath(g, PD, cx); g.clip();
    g.globalAlpha = 0.3 * (1 - 0.5 * hn);
    g.drawImage(SHADOW, X - w / 2, YG - 16, w, 40);
    g.restore();
  }
  M(1, 0, 0, 1, 0, 0);
  drawDrops(g, ta, o.dt, cx, (z) => z >= ZT, false);
  if (kidOn && !o.hideKid) {
    M(1, 0, 0, -1, X, YG);
    drawKid(g, PAL.base, k);
    M(1, 0, 0, 1, 0, 0);
  }
  drawDrops(g, ta, o.dt, cx, (z) => z < ZT, false);
  if (still) { g.drawImage(PLATE_F, 0, 0); grayPlate(PLATE_FG); } else drawProps(g, cx, M);
}

// ---------------------------------------------------------------- baked overlays
function grayOf(c) {
  const { c: o, g } = A.mk(c.width, c.height);
  g.drawImage(c, 0, 0);
  const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = l - 4; d[i + 1] = l; d[i + 2] = l + 6;
  }
  g.putImageData(im, 0, 0);
  return o;
}
function plate(draw) { const { c, g } = A.mk(W, H); const M = (a, b, cc, d, e, f) => g.setTransform(a, b, cc, d, e, f); draw(g, M); return c; }

function bakeCard() {
  const pad = 40, { c, g } = A.mk(CARD.w + pad * 2, CARD.h + pad * 2);
  g.translate(pad, pad);
  g.shadowColor = 'rgba(8,14,24,0.38)'; g.shadowBlur = 34; g.shadowOffsetY = 14;
  g.fillStyle = '#f3f2ee'; g.beginPath(); g.roundRect(0, 0, CARD.w, CARD.h, 30); g.fill();
  g.shadowColor = 'transparent';
  g.fillStyle = A.C.acc; g.beginPath(); g.roundRect(36, 30, 156, 50, 25); g.fill();
  g.fillStyle = A.C.ink; g.font = `800 29px ${KR}`; g.textBaseline = 'middle'; g.textAlign = 'center';
  g.fillText('알리 장인', 36 + 78, 56);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.font = `900 78px ${KR}`; g.fillText('하준, 12살', 32, 160);
  g.fillStyle = '#5c6979'; g.font = `600 27px ${KR}`;
  g.fillText(`체공 ${T_AIR.toFixed(2)}초`, 212, 64);
  {                                                          // a small camera: this card is the snapshot's caption
    const cx = CARD.w - 62, cy = 58;
    g.fillStyle = A.C.ink;
    g.beginPath(); g.roundRect(cx - 30, cy - 18, 60, 40, 9); g.fill();
    g.beginPath(); g.roundRect(cx - 12, cy - 26, 24, 12, 4); g.fill();
    g.fillStyle = '#f3f2ee'; g.beginPath(); g.arc(cx, cy + 2, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = A.C.ink; g.beginPath(); g.arc(cx, cy + 2, 6.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = A.C.acc; g.beginPath(); g.arc(cx + 20, cy - 9, 3.5, 0, Math.PI * 2); g.fill();
  }
  return { c, pad };
}
function bakeChip() {
  const w = 452, h = 96, pad = 30, { c, g } = A.mk(w + pad * 2, h + pad * 2);
  g.translate(pad, pad);
  g.shadowColor = 'rgba(6,10,18,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
  g.fillStyle = 'rgba(22,28,40,0.86)'; g.beginPath(); g.roundRect(0, 0, w, h, 48); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 2; g.beginPath(); g.roundRect(1, 1, w - 2, h - 2, 47); g.stroke();
  return { c, pad, w, h };
}
function bakeWord() {
  const { c, g } = A.mk(420, 220);
  g.font = `400 132px ${BHS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.strokeStyle = A.C.ink; g.lineWidth = 18;
  g.strokeText('찰칵!', 210, 116); g.fillStyle = '#ffffff'; g.fillText('찰칵!', 210, 116);
  return c;
}
function bakeVignette() {
  const { c, g } = A.mk(W, H);
  const v = g.createRadialGradient(540, 860, 300, 540, 900, 1250);
  v.addColorStop(0, 'rgba(8,12,22,0)'); v.addColorStop(1, 'rgba(8,12,22,0.5)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  const b = g.createLinearGradient(0, 1500, 0, H);
  b.addColorStop(0, 'rgba(8,12,22,0)'); b.addColorStop(1, 'rgba(8,12,22,0.55)');
  g.fillStyle = b; g.fillRect(0, 1500, W, 420);
  return c;
}
function bakeGrain() {
  const n = 256, { c, g } = A.mk(n, n), im = g.createImageData(n, n), r = rand(77);
  for (let i = 0; i < n * n; i++) { const v = r() < 0.5 ? 0 : 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 10 + r() * 16; }
  g.putImageData(im, 0, 0);
  return c;
}

// the cut-out: the frozen kid's silhouette → signed distance → white border of any radius, and its shadow
let STK;
function bakeSticker() {
  const SW = 600, SH = 560, OX = 300, OY = 700;            // kid space (0,0) at (OX, OY), y up
  const { c, g } = A.mk(SW, SH);
  g.setTransform(1, 0, 0, -1, OX, OY);
  drawKid(g, PAL.base, KPF);
  const px = g.getImageData(0, 0, SW, SH).data;
  const a = new Float32Array(SW * SH);
  for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3] / 255;
  const sdf = signedDistance(a, SW, SH);
  const { c: sh, g: sg } = A.mk(SW, SH);
  const im = sg.createImageData(SW, SH);
  for (let i = 0; i < sdf.length; i++) {
    const d = sdf[i], t = clamp((d - (R_OUT - 6)) / 34);
    im.data[i * 4] = 10; im.data[i * 4 + 1] = 16; im.data[i * 4 + 2] = 28;
    im.data[i * 4 + 3] = 255 * 0.44 * (1 - t * t * (3 - 2 * t));
  }
  sg.putImageData(im, 0, 0);
  const out = A.mk(SW, SH);
  STK = { sdf, SW, SH, OX, OY, shadow: sh, out, img: out.g.createImageData(SW, SH), lastR: -1 };
  // centre of the cut-out in scene coordinates (in place, at the frozen frame)
  STK.cx = KXF - OX + SW / 2; STK.cy = YG - OY + SH / 2;
  void c;
}
function outlineAt(R) {
  if (Math.abs(R - STK.lastR) < 1e-4) return STK.out.c;
  const d = STK.img.data, s = STK.sdf;
  for (let i = 0; i < s.length; i++) { const v = clamp(R + 0.5 - s[i]); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = v * 255; }
  STK.out.g.putImageData(STK.img, 0, 0);
  STK.lastR = R;
  return STK.out.c;
}

// ---------------------------------------------------------------- overlays on real time
function stickerPlace(t) {
  const Z = zoomAt(t), L = liftAt(t);
  const sc = 1 + 0.035 * L;
  // in place: lifted about its centre, then the frozen frame's push-in
  const inX = PIVOT[0] + (STK.cx - 3 * L - PIVOT[0]) * Z, inY = PIVOT[1] + (STK.cy - 8 * L - PIVOT[1]) * Z;
  if (t < FLY[0]) return { x: inX, y: inY, s: sc * Z, r: 0, sh: L };
  const p = clamp((t - FLY[0]) / (FLY[1] - FLY[0])), e = ease.inOutCubic(p);
  const cxp = lerp(inX, SLOT.x, 0.5) - 120, cyp = Math.min(inY, SLOT.y) - 260;
  const x = (1 - e) * (1 - e) * inX + 2 * (1 - e) * e * cxp + e * e * SLOT.x;
  const y = (1 - e) * (1 - e) * inY + 2 * (1 - e) * e * cyp + e * e * SLOT.y;
  const q = clamp((t - FLY[1]) / 0.32), bounce = 1 + 0.07 * Math.sin(Math.PI * q) * (1 - q);
  return { x, y, s: lerp(sc * Z, SLOT.s, e) * bounce, r: lerp(0, SLOT.r, e) + 0.12 * Math.sin(Math.PI * p), sh: lerp(1, 0.8, e) };
}
function drawSticker(g, t) {
  const P = stickerPlace(t), R = t < T_SNAP + 0.5 ? radiusAt(t) : R_OUT;
  const cs = Math.cos(P.r) * P.s, sn = Math.sin(P.r) * P.s;
  // shadow, pushed down-right as the cut-out lifts
  g.setTransform(cs, sn, -sn, cs, P.x + 10 * P.sh, P.y + 18 * P.sh);
  g.globalAlpha = clamp(P.sh * 1.2);
  g.drawImage(STK.shadow, -STK.SW / 2, -STK.SH / 2);
  g.globalAlpha = 1;
  g.setTransform(cs, sn, -sn, cs, P.x, P.y);
  if (R > 0.2) g.drawImage(outlineAt(R), -STK.SW / 2, -STK.SH / 2);
  g.transform(1, 0, 0, -1, STK.OX - STK.SW / 2, STK.OY - STK.SH / 2);
  drawKid(g, PAL.base, KPF);
  g.setTransform(1, 0, 0, 1, 0, 0);
}

function chipText(s) {
  if (s <= 0.0005) return '정지';
  const r1 = Math.round(s * 10) / 10;
  return Math.abs(s - r1) < 0.004 ? `${r1.toFixed(1)}×` : `${s.toFixed(2)}×`;
}
function drawChip(g, t, CH) {
  const a = ease.outCubic(clamp((t - 0.3) / 0.45)), x = 52, y = 84 - 30 * (1 - a);
  if (a <= 0) return;
  g.globalAlpha = a;
  g.drawImage(CH.c, x - CH.pad, y - CH.pad);
  const s = speed(t), cy = y + CH.h / 2;
  // icon: ▶ (play), ▶▶ (faster than 1×), ❚❚ (stopped)
  g.fillStyle = '#ffffff';
  const ix = x + 46;
  if (s <= 0.0005) { g.beginPath(); g.roundRect(ix - 13, cy - 17, 9, 34, 3); g.roundRect(ix + 4, cy - 17, 9, 34, 3); g.fill(); }
  else if (s > 1.02) {
    for (const o of [-12, 6]) { g.beginPath(); g.moveTo(ix + o - 8, cy - 15); g.lineTo(ix + o + 12, cy); g.lineTo(ix + o - 8, cy + 15); g.fill(); }
  } else { g.beginPath(); g.moveTo(ix - 9, cy - 17); g.lineTo(ix + 15, cy); g.lineTo(ix - 9, cy + 17); g.fill(); }
  // the value, digits on a fixed pitch
  const txt = chipText(s);
  g.textBaseline = 'middle';
  if (txt === '정지') { g.font = `800 42px ${KR}`; g.fillStyle = A.C.acc; g.textAlign = 'left'; g.fillText(txt, x + 84, cy + 2); }
  else {
    g.font = `800 44px ${KR}`; g.fillStyle = s < 0.999 || s > 1.001 ? A.C.acc : '#ffffff'; g.textAlign = 'center';
    let px = x + 96;
    for (const ch of txt) { const w = ch === '.' ? 13 : ch === '×' ? 30 : 26; g.fillText(ch, px + w / 2, cy + 2); px += w; }
  }
  // the speed curve of the whole edit, played part bright, playhead in the accent
  const gx = x + 226, gw = 196, gy = cy + 24, gh = 46, sx = (tt) => gx + (tt / D) * gw, sy = (v) => gy - (v / 2) * gh;
  g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(255,255,255,0.22)';
  g.beginPath(); for (let i = 0; i <= 100; i++) { const tt = (i / 100) * D; i ? g.lineTo(sx(tt), sy(speed(tt))) : g.moveTo(sx(tt), sy(speed(tt))); } g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  g.beginPath(); const nn = Math.max(1, Math.round((t / D) * 100));
  for (let i = 0; i <= nn; i++) { const tt = (i / nn) * t; i ? g.lineTo(sx(tt), sy(speed(tt))) : g.moveTo(sx(tt), sy(speed(tt))); } g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(gx, sy(1)); g.lineTo(gx + gw, sy(1)); g.stroke();
  g.fillStyle = A.C.acc; g.strokeStyle = '#161c28'; g.lineWidth = 3;
  g.beginPath(); g.arc(sx(t), sy(s), 7.5, 0, Math.PI * 2); g.fill(); g.stroke();
  g.globalAlpha = 1;
}

function headPoint(t) {
  // the frozen kid's head in screen space (follows the push-in and the lift)
  const P = stickerPlace(Math.min(t, T_GO));
  const lx = -STK.SW / 2 + STK.OX + KPF.hip[0] + 14, ly = -STK.SH / 2 + STK.OY - (KPF.hip[1] + 196);
  return [P.x + lx * P.s, P.y + ly * P.s];
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '133-speed-ramp',
  title: '웅덩이 위의 알리',
  tech: '시간 재매핑 · 속도 곡선 적분과 노출 모션 블러, 정지 화면',
  duration: D,
  fps: FPS,
  background: '#1b2230',

  async setup(api) {
    await fontReady(`800 40px ${KR}`, '우산 고쳐요알리 장인하준, 12살체공0.50초정지×0123456789.');
    await fontReady(`900 78px ${KR}`, '하준, 12살');
    await fontReady(`600 27px ${KR}`, '체공 0.50초');
    await fontReady(`400 132px ${BHS}`, '찰칵!');
    A.setCPU(api.headless);
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    this.S = A.mk(W, H);

    const r = rand(133);
    SKY = A.bakeSky(); CLOUDS = A.bakeClouds(r);
    FAR = A.bakeFar(r, CAM.max);
    WALL = A.bakeWall(r, CAM.max, KR);
    WREF = A.bakeWallRefl(WALL);
    GROUND = A.bakeGround(r, CAM.max, PD);
    PROPS = A.bakeProps(r);
    {
      const { c, g } = A.mk(256, 64);
      const gr = g.createRadialGradient(128, 32, 0, 128, 32, 128);
      gr.addColorStop(0, 'rgba(8,12,20,0.9)'); gr.addColorStop(0.45, 'rgba(8,12,20,0.45)'); gr.addColorStop(1, 'rgba(8,12,20,0)');
      g.setTransform(1, 0, 0, 0.25, 0, 24); g.fillStyle = gr; g.fillRect(0, -100, 256, 256);
      SHADOW = c;
    }
    KRC = A.mk(150, 200);
    buildWater();

    // the still camera's plates (everything static from the frozen frame on), and their grey twins
    PLATE_A = plate((g, M) => drawBack(g, CXF, M));
    PLATE_B = plate((g, M) => drawGround(g, CXF, M));
    PLATE_F = plate((g, M) => drawProps(g, CXF, M));
    SKY_G = grayOf(SKY); PLATE_AG = grayOf(PLATE_A); PLATE_BG = grayOf(PLATE_B); PLATE_FG = grayOf(PLATE_F);

    bakeSticker();
    this.card = bakeCard();
    this.chip = bakeChip();
    this.word = bakeWord();
    this.vig = bakeVignette();
    {
      const { c, g } = A.mk(W, H);
      const l = g.createRadialGradient(900, 90, 0, 900, 90, 1150);
      l.addColorStop(0, 'rgba(255,250,238,0.30)'); l.addColorStop(0.45, 'rgba(240,244,248,0.10)'); l.addColorStop(1, 'rgba(240,244,248,0)');
      g.fillStyle = l; g.fillRect(0, 0, W, H);
      this.light = c;
    }
    this.grain = bakeGrain();
  },

  frame(t) {
    const ctx = this.ctx, S = this.S;
    if (ctx.reset) ctx.reset();
    else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }

    // ---- the exposure: N story times inside [τ(t − h), τ(t + h)]
    const tc = tau(t);
    const X = kidX(tc), vc = CAM.v(tc), vk = vkOf(ST, tc);
    let vmax = Math.max(1.85 * vc, 160);                                   // the ground nearest the lens
    if (X > -380 && X < W + 380) vmax = Math.max(vmax, Math.abs(vk - vc) + (vk > 1 ? 480 : 240));   // kid + limbs + wheels
    const ex = exposure(t, vmax);
    const zoom = zoomAt(t), ox = PIVOT[0] * (1 - zoom), oy = PIVOT[1] * (1 - zoom);
    const gray = tc >= TAU_FREEZE ? clamp(grayAt(t)) : 0;
    const hideKid = t >= T_SNAP && t < T_GO + 0.001;
    const dt = ex.span / ex.taus.length;

    const render = (g, ta) => {
      const M = (a, b, c, d, e, f) => g.setTransform(zoom * a, zoom * b, zoom * c, zoom * d, zoom * e + ox, zoom * f + oy);
      drawScene(g, ta, { M, gray, hideKid, dt });
    };
    if (ex.taus.length === 1) render(ctx, ex.taus[0]);
    else {
      // running mean of opaque frames: frame i is laid over the mean of the first i with alpha 1/(i+1)
      ex.taus.forEach((ta, i) => {
        const g = S.g;
        if (g.reset) g.reset(); else g.setTransform(1, 0, 0, 1, 0, 0);
        render(g, ta);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1 / (i + 1);
        ctx.drawImage(S.c, 0, 0);
      });
      ctx.globalAlpha = 1;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // soft light through the clouds, upper right
    ctx.globalCompositeOperation = 'screen'; ctx.drawImage(this.light, 0, 0); ctx.globalCompositeOperation = 'source-over';
    // ---- frozen-frame treatment (real time)
    if (gray > 0) { ctx.fillStyle = `rgba(14,20,32,${(0.26 * gray / 0.92).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
    ctx.drawImage(this.vig, 0, 0);
    {
      const r = rand(9000 + Math.round(t * FPS));
      const pat = ctx.createPattern(this.grain, 'repeat');
      ctx.setTransform(1, 0, 0, 1, Math.floor(r() * 256), Math.floor(r() * 256));
      ctx.fillStyle = pat; ctx.fillRect(-256, -256, W + 512, H + 512);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    if (t >= T_SNAP) drawSticker(ctx, t);

    // viewfinder corners + 찰칵 + flash
    if (t >= T_SNAP && t < 5.2) {
      const p = ease.outCubic(clamp((t - T_SNAP) / 0.14)), fade = 1 - smooth((t - 4.92) / 0.22), sc = lerp(1.22, 1, p);
      const bx0 = KXF - 250, bx1 = KXF + 250, by0 = YG - 700, by1 = YG - 160;
      const cxm = (bx0 + bx1) / 2, cym = (by0 + by1) / 2, hw = (bx1 - bx0) / 2 * sc * zoom, hh = (by1 - by0) / 2 * sc * zoom;
      const mx = PIVOT[0] + (cxm - PIVOT[0]) * zoom, my = PIVOT[1] + (cym - PIVOT[1]) * zoom;
      ctx.globalAlpha = p * fade; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x0 = mx + sx * hw, y0 = my + sy * hh;
        ctx.beginPath(); ctx.moveTo(x0, y0 - sy * 64); ctx.lineTo(x0, y0); ctx.lineTo(x0 - sx * 64, y0); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const wp = clamp((t - T_SNAP - 0.02) / 0.2), wo = smooth((t - 4.96) / 0.16);
      if (wp > 0 && wo < 1) {
        const s = lerp(0.35, 1, ease.outBack(wp, 2.4)) * (1 + 0.15 * wo);
        ctx.globalAlpha = 1 - wo;
        ctx.setTransform(s * Math.cos(-0.14), s * Math.sin(-0.14), -s * Math.sin(-0.14), s * Math.cos(-0.14), KXF + 270, YG - 650);
        ctx.drawImage(this.word, -210, -110);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      }
    }
    // name card + leader line
    if (t >= CARD.in[0]) {
      const p = clamp((t - CARD.in[0]) / (CARD.in[1] - CARD.in[0])), e = ease.outBack(p, 1.5);
      ctx.globalAlpha = clamp(p * 2.2);
      ctx.drawImage(this.card.c, CARD.x - this.card.pad + 90 * (1 - e), CARD.y - this.card.pad);
      ctx.globalAlpha = 1;
      const grow = ease.inOutCubic(clamp((t - CARD.line[0]) / (CARD.line[1] - CARD.line[0])));
      const back = ease.inCubic(clamp((t - T_GO) / 0.14));
      if (grow > 0 && back < 1) {
        const [hx, hy] = headPoint(t), ax = CARD.x + 40, ay = CARD.y + CARD.h - 6;
        const bx = lerp(ax, hx, grow), by = lerp(ay, hy, grow), sx = lerp(ax, hx, back), sy = lerp(ay, hy, back);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(lerp(sx, bx, 0), lerp(sy, by, 0)); ctx.lineTo(bx, by); ctx.stroke();
        if (grow > 0.98 && back === 0) {
          ctx.fillStyle = A.C.acc; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      }
    }
    drawChip(ctx, t, this.chip);
    const flash = 0.9 * Math.exp(-Math.max(0, t - T_SNAP) / 0.07) * smooth((t - T_SNAP + 0.035) / 0.035);
    if (flash > 0.004) { ctx.fillStyle = `rgba(255,255,255,${flash.toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
    if (t < 0.36) { ctx.fillStyle = `rgba(10,14,22,${(1 - ease.outCubic(t / 0.36)).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
  },
});
