/*
 * 144 · 줄무늬 너머의 글자 — a printed card on a desk and two clear films.
 *   Film A (barrier grid) over an interlaced print: scanimation. The print holds N = 6 frames of a dancing 「춤」,
 *   column x belongs to frame (−floor(x / w)) mod N; the film has opaque bars (N − 1)·w wide and slits w wide, so every
 *   slit shows the same frame and sliding the film by w steps the animation one frame.
 *   Film B (lens array, period PR) over a microtext band (a tiny upside-down 「안녕」 repeated with period PB): a moiré
 *   magnifier. The word comes out PB / (PB − PR) = 50 times larger and runs 50 times faster than the film moves;
 *   a small rotation of the film turns and shrinks it, so aligning the film makes the word swell into place.
 *
 * Rendering: one three.js full-screen ShaderMaterial (shader.js) composites desk, card and both films per pixel —
 * exact slit coverage for the barrier, one surface lookup per lenslet for the lenses. Crisp UI type is a 2D canvas on top.
 * Determinism: no state. Card, films and every readout are closed forms of t; the print, the glyph cell and the desk
 * are baked once in setup.
 */
import * as THREE from 'three';
import { defineDemo, clamp, lerp, smooth, ease, rand } from '../_lib/stage.js';
import { FONTS, fontReady, loadOutlineFont, outlineContours } from '../_lib/type.js';
import { VERT, fragSrc } from './shader.js';

const D = 10, TAU = Math.PI * 2, W = 1080, H = 1920;
const KR = `"${FONTS.pretendard.family}"`, MONO = `"${FONTS.jetbrainsMono.family}"`;

// ---------------------------------------------------------------- palette: desk, paper, ink, cream + one accent
const DESK = '#2c4a50', PAPER = '#f3ebdb', INK = '#1d2132', CREAM = '#f6efe2', ACCENT = '#ff5a3f', BAR = '#151a27';
const hex3 = (h) => new THREE.Vector3(...[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255));

// ---------------------------------------------------------------- the card (stage px; integer origin at rest)
const CW = 840, CH = 1240, CR = 30, CX0 = 120, CY0 = 320;
const ZA = { x: 50, y: 80, w: 740, h: 600 };            // scanimation window (card px)
const ZB = { x: 50, y: 776, w: 740, h: 380 };           // microtext band (card px)

// ---------------------------------------------------------------- the two tricks
const N = 6, SW = 2, PF = N * SW;                       // frames, stripe = slit width, barrier period (bars 10 px)
const PB = 15, PR = 14.7;                               // base period, lens period
const MAG = PB / (PB - PR);                             // 50: the word moves 50 px on the card per px of film
const PM = PB * PR / (PB - PR);                         // 735 px: moiré period = the base cell × PR / (PB − PR) = ×49
const LENS_K = 1 - PB / PR;                             // −0.0204: a lenslet images ps → c + K·(ps − c) (inverted, ×49)

// ---------------------------------------------------------------- films (stage px)
const F1 = { w: 1000, h: 636, top: CY0 + 62, inset: 16 };   // bars cover card y 78…682
const F2 = { w: 784, h: 424, inset: 14 };                   // lenses cover the band ± 8 px
const BC = { x: CX0 + ZB.x + ZB.w / 2, y: CY0 + ZB.y + ZB.h / 2 };   // band centre on screen: (540, 1286)

// ---------------------------------------------------------------- timeline (s)
const T_CARD = 1.05;                                    // card lands
const T_F1 = 1.3, TAU1 = 0.26, X1_REST = 167.6;       // film A slides in (critically damped from rest); at 6.0 s a slit sits exactly on one stripe
const V1 = [[1.3, 0], [1.6, 24], [4.4, 24], [5.0, 12], [7.6, 12]];   // then drifts left (px/s): 12 → 6 frames/s
const T_F2 = 4.4, T_F2_IN = 0.7;                        // film B slides in, turned THETA0
const T_ROT = 4.95, T_LOCK = 5.85, THETA0 = 7 * Math.PI / 180;  // …and is turned square: the word swells
const T_GLIDE = [6.0, 7.55], DRIFT = PR;                // film B moves one lens (14.7 px) → the word one moiré period (735 px)
const T_LIFT = 7.6;                                     // both films lift away
const CAPS = [[1.75, 4.3], [4.5, 6.05], [6.1, 7.6], [8.25, 99]];

/** ∫ of a piecewise-linear speed (keys [t, v]) from keys[0][0] to t — exact, so the film position is a closed form of t */
function integ(keys, t) {
  let s = 0;
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
    if (t <= t0) return s;
    const te = Math.min(t, t1), ve = v0 + (v1 - v0) * (te - t0) / (t1 - t0);
    s += 0.5 * (v0 + ve) * (te - t0);
  }
  const [tl, vl] = keys[keys.length - 1];
  return s + (t > tl ? vl * (t - tl) : 0);
}

function cardPose(t) {
  const p = clamp(t / T_CARD), k = ease.outCubic(p);
  return { cx: CX0 + CW / 2, cy: CY0 + CH / 2 + 620 * (1 - k), rot: -0.13 * (1 - ease.outBack(p, 1.3)),
    s: 1 + 0.05 * (1 - k), lift: 1 - ease.outCubic(clamp((t - 0.1) / 0.95)) };
}
/** film A: left edge x while it lies on the card, then the lift-off (scale about its centre, slide off to the top right) */
function film1(t) {
  if (t < T_F1) return null;
  const a = (t - T_F1) / TAU1;
  const x = X1_REST - integ(V1, t) + 1000 * (1 + a) * Math.exp(-a);
  const lift = smooth((t - T_LIFT) / 0.3);
  const u = clamp((t - T_LIFT - 0.1) / 0.6), uo = u * u * u;
  return { x, lift, flat: lift < 0.02, cx: x + F1.w / 2 + 1450 * uo, cy: F1.top + F1.h / 2 - 340 * uo,
    rot: 0.07 * uo, s: 1 + 0.03 * lift + 0.04 * uo };
}
/** film B: slides in turned by THETA0, is turned square (the lock), drifts DRIFT px, lifts away to the bottom left */
function film2(t) {
  if (t < T_F2) return null;
  const pin = ease.outCubic(clamp((t - T_F2) / T_F2_IN));
  const pr = ease.outCubic(clamp((t - T_ROT) / (T_LOCK - T_ROT)));
  const drift = DRIFT * smooth((t - T_GLIDE[0]) / (T_GLIDE[1] - T_GLIDE[0]));
  const lift = smooth((t - T_LIFT - 0.05) / 0.3);
  const u = clamp((t - T_LIFT - 0.15) / 0.6), uo = u * u * u;
  return { drift, lift, theta: THETA0 * (1 - pr), cx: BC.x - 1150 * (1 - pin) + drift - 1350 * uo, cy: BC.y + 280 * uo,
    rot: THETA0 * (1 - pr) - 0.06 * uo, s: 1 + 0.008 * lift + 0.04 * uo };
}
/** moiré magnification of a lens lattice (period PR·s, turned θ) over the base (period PB): 1 / (PB·|1/PB − e^{−iθ}/(PR·s)|) */
function moireMag(theta, s) {
  const r = 1 / (PR * s), re = 1 / PB - r * Math.cos(theta), im = r * Math.sin(theta);
  return 1 / (PB * Math.hypot(re, im));
}
// screen → local (column-major mat2) for rotation r and scale s, and local → screen
const inv2 = (m, r, s) => { const c = Math.cos(r) / s, n = Math.sin(r) / s; m[0] = c; m[1] = -n; m[2] = n; m[3] = c; };
const fwd2 = (m, r, s) => { const c = Math.cos(r) * s, n = Math.sin(r) * s; m[0] = c; m[1] = n; m[2] = -n; m[3] = c; };

function mkCanvas(w, h, api) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', api.headless ? { willReadFrequently: true } : undefined)];
}
function rrect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function grain(g, w, h, amp, seed) {
  const R = rand(seed), img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * amp; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
}

// ---------------------------------------------------------------- the dancing 「춤」: N frames, three jamo pieces
function rowWidth(pts, y) {
  const xs = [], n = pts.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, ay = pts[2 * i + 1], by = pts[2 * j + 1];
    if ((ay <= y) !== (by <= y)) xs.push(pts[2 * i] + (y - ay) / (by - ay) * (pts[2 * j] - pts[2 * i]));
  }
  xs.sort((a, b) => a - b);
  let w = 0;
  for (let k = 0; k + 1 < xs.length; k += 2) w += xs[k + 1] - xs[k];
  return [w, xs];
}
/**
 * Split one syllable's outline into stacked jamo by two horizontal cuts: below the top contour (ㅊ), and through the
 * narrowest row of the biggest remaining contour (the stem joining ㅜ to ㅁ). Each piece = the whole path clipped to its band.
 */
function jamoPieces(glyph) {
  const cs = glyph.contours.map((c) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < c.pts.length; i += 2) {
      x0 = Math.min(x0, c.pts[i]); x1 = Math.max(x1, c.pts[i]); y0 = Math.min(y0, c.pts[i + 1]); y1 = Math.max(y1, c.pts[i + 1]);
    }
    return { ...c, x0, y0, x1, y1 };
  });
  const path = new Path2D();
  for (const c of cs) { path.moveTo(c.pts[0], c.pts[1]); for (let i = 2; i < c.pts.length; i += 2) path.lineTo(c.pts[i], c.pts[i + 1]); }
  const head = cs.reduce((m, c) => (c.y0 < m.y0 ? c : m));
  const rest = cs.filter((c) => c !== head);
  const ya = 0.5 * (head.y1 + Math.min(...rest.map((c) => c.y0)));
  const big = rest.reduce((m, c) => (Math.abs(c.area) > Math.abs(m.area) ? c : m));
  let wMin = 1e9, rows = [];
  for (let y = big.y0 + 0.12 * (big.y1 - big.y0); y < big.y1 - 0.12 * (big.y1 - big.y0); y += 0.25) {
    const [w] = rowWidth(big.pts, y);
    if (w < wMin - 0.5) { wMin = w; rows = [y]; } else if (Math.abs(w - wMin) <= 0.5) rows.push(y);
  }
  const yb = 0.5 * (rows[0] + rows[rows.length - 1]);
  const [, sx] = rowWidth(big.pts, yb);
  const gx0 = Math.min(...cs.map((c) => c.x0)), gx1 = Math.max(...cs.map((c) => c.x1)), gy1 = Math.max(...cs.map((c) => c.y1));
  return {
    path, ya, yb, gx0, gx1, gy0: head.y0, gy1,
    head: { px: 0.5 * (head.x0 + head.x1), py: 0.5 * (head.y0 + head.y1) },
    arms: { px: 0.5 * (sx[0] + sx[sx.length - 1]), py: yb },
    feet: { px: 0.5 * (big.x0 + big.x1), py: gy1 },
  };
}
function star(g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.3 : r;
    g[i ? 'lineTo' : 'moveTo'](x + rr * Math.cos(a), y + rr * Math.sin(a));
  }
  g.fill();
}
/** frame k of the loop: ㅁ squashes and stretches on the floor, ㅜ rides on it and waves, ㅊ hops and turns */
function drawDanceFrame(g, J, k) {
  const p = k / N, c = Math.cos(TAU * p), s = Math.sin(TAU * p);
  const GX = ZA.w / 2, GY = 566;
  const sq = c > 0 ? c : 0.55 * c;                      // + squashed (p = 0), − stretched (p = ½)
  const syM = 1 - 0.14 * sq, sxM = 1 / Math.sqrt(syM);
  const liftU = 16 * (1 - c) / 2;
  const hop = Math.max(0, -Math.cos(TAU * (p - 0.1)));  // 0…1, top near p ≈ 0.6
  const hopH = 54 * hop, rotH = 0.3 * Math.sin(TAU * (p - 0.12)), rotU = 0.12 * Math.sin(TAU * (p + 0.05));
  const sway = 16 * s;
  // a dark stage printed in ink; the letter, the floor and the sparkles are left in paper colour
  g.fillStyle = INK; g.fillRect(0, 0, ZA.w, ZA.h);
  // floor: a pool of light that narrows when the letter leaves the ground, and a short ground line
  g.fillStyle = 'rgba(243,235,219,0.16)';
  g.beginPath(); g.ellipse(GX + sway * 0.6, GY + 10, 225 * (1 + 0.1 * sq) - 40 * hop, 17, 0, 0, TAU); g.fill();
  g.fillStyle = PAPER;
  rrect(g, GX - 270, GY + 4, 540, 9, 4.5); g.fill();
  // glyph space → frame: the feet pivot (bottom centre) stands on the ground point
  const ox = GX + sway - J.feet.px, oy = GY - J.feet.py;
  const piece = (y0, y1, pv, dx, dy, rot, sx, sy) => {
    g.save();
    g.translate(ox + pv.px + dx, oy + pv.py + dy); g.rotate(rot); g.scale(sx, sy); g.translate(-pv.px, -pv.py);
    g.beginPath(); g.rect(J.gx0 - 80, y0, J.gx1 - J.gx0 + 160, y1 - y0); g.clip();
    g.fill(J.path);
    g.restore();
  };
  const dyTop = (J.feet.py - J.yb) * (1 - syM);         // ㅁ's top moves down when it squashes
  piece(J.yb, J.gy1 + 40, J.feet, 0, 0, 0, sxM, syM);
  piece(J.ya, J.yb, J.arms, 0, dyTop - liftU, rotU, 1, 1);
  const hsq = 1 - 0.08 * Math.max(0, c);                // the head lands with a little squash too
  piece(J.gy0 - 80, J.ya, J.head, -sway * 0.25, dyTop - liftU - hopH, rotH, 1 / Math.sqrt(hsq), hsq);
  // sparkles at the top of the hop
  if (hop > 0.6) {
    const hx = ox + J.head.px, hy = oy + J.head.py + dyTop - liftU - hopH, r = 13 + 16 * (hop - 0.6) / 0.4;
    star(g, hx - 250, hy - 30 + 18 * (k % 2), r);
    star(g, hx + 262, hy + 14 - 18 * (k % 2), r * 0.8);
    star(g, hx + 215, hy - 92, r * 0.55);
  }
}

// ---------------------------------------------------------------- crisp type (screen space)
function maskLine(g, parts, x, y, h, kin, kout, align = 'left') {
  if (kin <= 0 || kout >= 1) return;
  g.save();
  g.beginPath(); g.rect(0, y - h * 1.05, W, h * 1.4); g.clip();
  const dy = (1 - kin) * h * 1.15 - kout * h * 1.15;
  let w = 0;
  for (const p of parts) { g.font = p.font; g.letterSpacing = p.ls || '0px'; p.w = g.measureText(p.s).width; w += p.w; }
  let px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  for (const p of parts) {
    g.font = p.font; g.letterSpacing = p.ls || '0px'; g.fillStyle = p.color;
    g.fillText(p.s, px, y + dy);
    px += p.w;
  }
  g.restore();
}
const inK = (t, t0, d = 0.6) => ease.outExpo(clamp((t - t0) / d));
const outK = (t, t0, d = 0.25) => { const p = clamp((t - t0) / d); return p * p; };
const cream = (a) => `rgba(246,239,226,${a.toFixed(3)})`;
const ink = (a) => `rgba(29,33,50,${a.toFixed(3)})`;

/** a pill: badge letter, Korean label, a fixed-width mono readout; on = 0 outlined … 1 filled */
function chip(g, x, y, letter, label, extra, on, k) {
  if (k <= 0) return 0;
  g.font = `700 27px ${KR}`; g.letterSpacing = '-0.5px';
  const lw = g.measureText(label).width;
  g.font = `600 20px ${MONO}`; g.letterSpacing = '0px';
  const ew = extra ? g.measureText(extra).width : 0;
  const w = 12 + 30 + 11 + lw + (extra ? 14 + ew : 0) + 20, h = 50;
  g.save();
  g.globalAlpha = k;
  g.translate(x, y + (1 - k) * 18);
  rrect(g, 0, 0, w, h, h / 2);
  g.fillStyle = cream(0.06 + 0.9 * on); g.fill();
  g.lineWidth = 2; g.strokeStyle = cream(0.32 + 0.6 * on); g.stroke();
  g.fillStyle = on > 0.5 ? INK : cream(0.85);
  g.beginPath(); g.arc(12 + 15, h / 2, 15, 0, TAU); g.fill();
  g.fillStyle = on > 0.5 ? CREAM : INK;
  g.font = `700 18px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(letter, 27, h / 2 + 1);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.font = `700 27px ${KR}`; g.letterSpacing = '-0.5px';
  g.fillStyle = on > 0.5 ? INK : cream(0.78);
  g.fillText(label, 53, 34);
  if (extra) {
    g.font = `600 20px ${MONO}`; g.letterSpacing = '0px';
    g.fillStyle = on > 0.5 ? ink(0.62) : cream(0.5);
    g.fillText(extra, 53 + lw + 14, 33);
  }
  g.restore();
  return w;
}

defineDemo({
  id: '144-scanimation',
  title: '줄무늬 너머의 글자',
  tech: '스캐니메이션 · 바리어 그리드 인터레이스 + 모아레 확대',
  duration: D,
  background: DESK,

  async setup(api) {
    const KO = '춤추는글자숨은필름을올리고천천히밀어보세요틈마다다른장면이비친다주기를어긋나게겹치면글자떼면다시줄무늬막대렌즈안녕,→';
    await Promise.all([
      fontReady(`900 200px ${KR}`, '안녕'),
      fontReady(`700 36px ${KR}`, KO), fontReady(`600 21px ${KR}`, KO),
      fontReady(`600 20px ${MONO}`, 'SCANIMATION·MOIRÉ ABN=wpx0123456789./+–×-'),
    ]);
    const font = await loadOutlineFont('Pretendard-Black');

    // ---- the dancing 「춤」 → N frames → interlaced into the card print
    const [glyph] = outlineContours(font, '춤', 0, 0, 505);
    const J = jamoPieces(glyph);
    const frames = [];
    for (let k = 0; k < N; k++) {
      const [c, g] = mkCanvas(ZA.w, ZA.h, api);
      drawDanceFrame(g, J, k);
      frames.push(c);
    }
    const [card, cg] = mkCanvas(CW, CH, api);
    cg.fillStyle = PAPER; cg.fillRect(0, 0, CW, CH);
    cg.save(); rrect(cg, ZA.x, ZA.y, ZA.w, ZA.h, 18); cg.clip();
    // interlace: card column x shows frame (−floor(x / SW)) mod N — film A moving left then plays the loop forward
    for (let x = ZA.x; x < ZA.x + ZA.w;) {
      const s = Math.floor(x / SW), xe = Math.min((s + 1) * SW, ZA.x + ZA.w), k = ((-s % N) + N) % N;
      cg.drawImage(frames[k], x - ZA.x, 0, xe - x, ZA.h, x, ZA.y, xe - x, ZA.h);
      x = xe;
    }
    cg.restore();
    // crop marks around the band (the band itself is drawn by the shader)
    cg.strokeStyle = ink(0.45); cg.lineCap = 'round';
    for (const [cx, cy, sx, sy] of [[ZB.x, ZB.y, -1, -1], [ZB.x + ZB.w, ZB.y, 1, -1], [ZB.x, ZB.y + ZB.h, -1, 1], [ZB.x + ZB.w, ZB.y + ZB.h, 1, 1]]) {
      cg.beginPath();
      cg.moveTo(cx + sx * 24, cy); cg.lineTo(cx + sx * 40, cy);          // the band's edges, continued outside the corner
      if (sy > 0) { cg.moveTo(cx, cy + 24); cg.lineTo(cx, cy + 40); }
      cg.stroke();
    }
    const label = (y, letter, text, spec) => {
      cg.fillStyle = INK; cg.beginPath(); cg.arc(ZA.x + 14, y - 8, 15, 0, TAU); cg.fill();
      cg.fillStyle = PAPER; cg.font = `700 17px ${MONO}`; cg.textAlign = 'center'; cg.textBaseline = 'middle';
      cg.fillText(letter, ZA.x + 14, y - 7);
      cg.textAlign = 'left'; cg.textBaseline = 'alphabetic';
      cg.fillStyle = ink(0.86); cg.font = `700 23px ${KR}`; cg.letterSpacing = '-0.5px'; cg.fillText(text, ZA.x + 40, y);
      cg.letterSpacing = '0px'; cg.fillStyle = ink(0.5); cg.font = `500 17px ${MONO}`; cg.textAlign = 'right';
      cg.fillText(spec, ZA.x + ZA.w, y - 1); cg.textAlign = 'left';
    };
    label(48, 'A', '춤추는 글자', `N=${N} · w=${SW}px`);
    label(744, 'B', '숨은 글자', `p=${PB}px`);
    cg.fillStyle = ink(0.5); cg.font = `600 21px ${KR}`; cg.textAlign = 'center';
    cg.fillText('필름을 올리고 천천히 밀어 보세요', CW / 2, 1214); cg.textAlign = 'left';
    grain(cg, CW, CH, 7, 144);

    // ---- the moiré base cell: 「안녕」 upside down (a lens lattice finer than the base inverts the moiré), coverage in R
    const GS = 1024;
    const [gcan, gg] = mkCanvas(GS, GS, api);
    gg.fillStyle = '#000'; gg.fillRect(0, 0, GS, GS);
    gg.font = `900 200px ${KR}`; gg.letterSpacing = '-4px';
    let m = gg.measureText('안녕');
    const fsz = 200 * (0.86 * GS) / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
    gg.font = `900 ${fsz.toFixed(2)}px ${KR}`; gg.letterSpacing = `${(-4 * fsz / 200).toFixed(2)}px`;
    m = gg.measureText('안녕');
    gg.translate(GS / 2, GS / 2); gg.rotate(Math.PI);
    gg.fillStyle = '#fff'; gg.textAlign = 'left'; gg.textBaseline = 'alphabetic';
    gg.fillText('안녕', -(m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2, (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    gg.setTransform(1, 0, 0, 1, 0, 0);

    // ---- the desk, props baked with it
    const [desk, dg] = mkCanvas(W, H, api);
    this.paintDesk(dg);

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    const tex = (c, mip, repeat) => {
      const t = new THREE.CanvasTexture(c);
      t.flipY = false;
      t.generateMipmaps = !!mip;
      t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
      return t;
    };
    const U = {
      uDesk: { value: tex(desk) }, uCard: { value: tex(card, true) }, uGlyph: { value: tex(gcan, true, true) },
      uCardT: { value: new THREE.Vector2() }, uCardInv: { value: new Float32Array(4) }, uCardLift: { value: 0 }, uGloss: { value: new THREE.Vector2() },
      uBand: { value: new THREE.Vector4(ZB.x, ZB.y, ZB.x + ZB.w, ZB.y + ZB.h) },
      uB0: { value: new THREE.Vector2(ZB.x + ZB.w / 2 - PB / 2, ZB.y + ZB.h / 2 - PB / 2) },   // u = ½ at the band centre
      uPB: { value: PB }, uAccent: { value: hex3(ACCENT) }, uBar: { value: hex3(BAR) },
      uF1On: { value: 0 }, uF1Lift: { value: 0 }, uF1T: { value: new THREE.Vector2() }, uF1Inv: { value: new Float32Array(4) },
      uSW: { value: SW }, uPF: { value: PF },
      uF2On: { value: 0 }, uF2Lift: { value: 0 }, uPR: { value: PR }, uLensK: { value: LENS_K }, uLensBlur: { value: 0 },
      uF2T: { value: new THREE.Vector2() }, uF2Inv: { value: new Float32Array(4) }, uF2M: { value: new Float32Array(4) }, uSheen: { value: new THREE.Vector2() },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: U, vertexShader: VERT, depthTest: false, depthWrite: false,
      fragmentShader: fragSrc({ W, H, CW, CH, CR, F1W: F1.w, F1H: F1.h, IN1: F1.inset, F2W: F2.w, F2H: F2.h, IN2: F2.inset, GPX: GS / PB }),
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const ui = api.canvas({ type: '2d', z: 2, attrs: api.headless ? { willReadFrequently: true } : undefined }).ctx;
    Object.assign(this, { renderer, scene, cam, U, ui });
  },

  paintDesk(g) {
    g.fillStyle = DESK; g.fillRect(0, 0, W, H);
    let gr = g.createRadialGradient(280, 560, 0, 280, 560, 1350);
    gr.addColorStop(0, 'rgba(255,238,210,0.17)'); gr.addColorStop(0.45, 'rgba(255,238,210,0.06)'); gr.addColorStop(1, 'rgba(255,238,210,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    grain(g, W, H, 6, 7);
    const shadowed = (draw, blur = 26, ox = 7, oy = 14, a = 0.42) => {
      g.save(); g.shadowColor = `rgba(6,16,20,${a})`; g.shadowBlur = blur; g.shadowOffsetX = ox; g.shadowOffsetY = oy;
      draw(); g.restore();
    };
    // a small stack of other cards, top right: the front one shows a neat swatch of printed stripes
    shadowed(() => { g.save(); g.translate(1010, 70); g.rotate(0.42); rrect(g, -300, -190, 600, 380, 26); g.fillStyle = '#e4d9c4'; g.fill(); g.restore(); });
    shadowed(() => {
      g.save(); g.translate(960, 150); g.rotate(0.2);
      rrect(g, -270, -170, 540, 340, 26); g.fillStyle = PAPER; g.fill();
      g.shadowColor = 'transparent';
      g.save(); rrect(g, -230, -126, 300, 196, 14); g.clip();
      g.fillStyle = INK; g.fillRect(-230, -126, 300, 196);
      g.fillStyle = PAPER;
      for (let x = -224; x < 70; x += 12) g.fillRect(x, -126, 3, 196);   // evenly spaced slits, like a barrier swatch
      g.restore();
      g.fillStyle = ink(0.22);
      rrect(g, -230, 96, 170, 10, 5); g.fill();
      rrect(g, -230, 118, 110, 10, 5); g.fill();
      g.restore();
    });
    // a pencil on the right
    shadowed(() => {
      g.save(); g.translate(1040, 1420); g.rotate(1.86);
      g.fillStyle = INK; rrect(g, -230, -19, 400, 38, 8); g.fill();
      g.fillStyle = '#2b3350'; g.fillRect(-222, -19, 384, 12);
      g.fillStyle = '#e8d6b6'; g.beginPath(); g.moveTo(170, -19); g.lineTo(238, -3); g.lineTo(238, 3); g.lineTo(170, 19); g.fill();
      g.fillStyle = INK; g.beginPath(); g.moveTo(222, -7); g.lineTo(246, 0); g.lineTo(222, 7); g.fill();
      g.fillStyle = '#c9cbd0'; g.fillRect(-262, -19, 36, 38);
      g.fillStyle = '#e4d9c4'; rrect(g, -300, -19, 46, 38, 10); g.fill();
      g.restore();
    }, 18, 5, 10, 0.5);
    // a paper clip on the left
    shadowed(() => {
      g.save(); g.translate(58, 700); g.rotate(-0.28);
      g.strokeStyle = '#d8dde0'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(0, 60); g.lineTo(0, -70); g.arc(18, -70, 18, Math.PI, 0); g.lineTo(36, 80); g.arc(14, 80, 22, 0, Math.PI);
      g.lineTo(-8, -40); g.arc(5, -40, 13, Math.PI, 0); g.lineTo(18, 50); g.stroke();
      g.restore();
    }, 10, 3, 6, 0.45);
    // vignette, darker floor for the captions
    gr = g.createRadialGradient(540, 860, 520, 540, 860, 1300);
    gr.addColorStop(0, 'rgba(6,16,20,0)'); gr.addColorStop(1, 'rgba(6,16,20,0.5)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    gr = g.createLinearGradient(0, 1580, 0, H);
    gr.addColorStop(0, 'rgba(6,16,20,0)'); gr.addColorStop(1, 'rgba(6,16,20,0.42)');
    g.fillStyle = gr; g.fillRect(0, 1580, W, H - 1580);
  },

  frame(t) {
    const U = this.U;
    // ---- card
    const cp = cardPose(t);
    U.uCardT.value.set(cp.cx, cp.cy); inv2(U.uCardInv.value, cp.rot, cp.s); U.uCardLift.value = cp.lift;
    const gp = clamp((t - 8.5) / 1.25);
    U.uGloss.value.set(lerp(-250, 1750, ease.inOutCubic(gp)), Math.sin(Math.PI * gp));
    // ---- film A
    const f1 = film1(t);
    U.uF1On.value = f1 && f1.cx - 0.5 * F1.w * f1.s < W + 40 ? 1 : 0;
    if (f1) { U.uF1T.value.set(f1.cx, f1.cy); inv2(U.uF1Inv.value, f1.rot, f1.s); U.uF1Lift.value = f1.lift; }
    // ---- film B
    const f2 = film2(t);
    U.uF2On.value = f2 && f2.cx + 0.5 * F2.w * f2.s > -40 ? 1 : 0;
    if (f2) {
      U.uF2T.value.set(f2.cx, f2.cy); inv2(U.uF2Inv.value, f2.rot, f2.s); fwd2(U.uF2M.value, f2.rot, f2.s);
      U.uF2Lift.value = f2.lift; U.uLensBlur.value = 3.5 * f2.lift;   // defocus radius on the card (px) once the lenses leave it
      const sp = clamp((t - T_LOCK) / 0.6);
      U.uSheen.value.set(lerp(-640, 700, ease.inOutCubic(sp)), Math.sin(Math.PI * sp));
    }
    this.renderer.render(this.scene, this.cam);
    this.drawUI(t, f1, f2);
  },

  drawUI(t, f1, f2) {
    const g = this.ui;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]); g.letterSpacing = '0px';
    g.clearRect(0, 0, W, H);

    // header
    maskLine(g, [{ s: 'SCANIMATION · MOIRÉ', font: `600 22px ${MONO}`, ls: '4px', color: cream(0.6) }], 64, 112, 30, inK(t, 0.15, 0.7), 0);
    const onA = smooth((t - T_F1) / 0.2) * (1 - smooth((t - T_F2) / 0.2));
    const onB = smooth((t - T_F2) / 0.2) * (1 - smooth((t - T_LIFT) / 0.2));
    let frameTxt = '–/6';
    if (f1 && f1.flat && f1.x < W) frameTxt = `${(((-Math.floor((f1.x + F1.inset - CX0) / SW)) % N + N) % N) + 1}/${N}`;
    const wA = chip(g, 64, 150, 'A', '막대 필름', frameTxt, onA, inK(t, T_F1 - 0.1, 0.6));
    // live magnification of film B: ×8 while it is turned 7°, ×49 once it is square
    const magTxt = f2 && f2.lift < 0.02 ? `×${Math.round(moireMag(f2.theta, 1))}`.padEnd(3, ' ') : '×– ';
    chip(g, 64 + wA + 14, 150, 'B', '렌즈 필름', magTxt, onB, inK(t, T_F2 - 0.1, 0.6));

    // the line under the card
    const Y = 1628, kin = (i) => inK(t, CAPS[i][0], 0.6), kout = (i) => outK(t, CAPS[i][1], 0.25);
    const big = `700 38px ${KR}`;
    maskLine(g, [{ s: '틈마다 다른 장면이 비친다', font: big, ls: '-1px', color: cream(0.94) }], W / 2, Y, 46, kin(0), kout(0), 'center');
    maskLine(g, [{ s: '주기를 ', font: big, ls: '-1px', color: cream(0.94) }, { s: '0.3px', font: `700 34px ${MONO}`, ls: '-1px', color: cream(0.94) },
      { s: ' 어긋나게 겹치면', font: big, ls: '-1px', color: cream(0.94) }], W / 2, Y, 46, kin(1), kout(1), 'center');
    const d = f2 ? f2.drift : 0;
    maskLine(g, [{ s: '필름 ', font: big, ls: '-1px', color: cream(0.72) }, { s: `+${d.toFixed(1)}px`, font: `700 34px ${MONO}`, ls: '-1px', color: cream(0.94) },
      { s: '   →   ', font: `500 34px ${MONO}`, ls: '0px', color: cream(0.5) },
      { s: '글자 ', font: big, ls: '-1px', color: cream(0.72) }, { s: `+${Math.round(MAG * d)}px`, font: `700 34px ${MONO}`, ls: '-1px', color: ACCENT }],
      W / 2, Y, 46, kin(2), kout(2), 'center');
    maskLine(g, [{ s: '필름을 떼면, 다시 줄무늬', font: big, ls: '-1px', color: cream(0.94) }], W / 2, Y, 46, kin(3), kout(3), 'center');
  },
});
