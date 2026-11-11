/*
 * flow.js — the pure half of 141: the changing shape, its scanline spans and the Knuth–Plass line breaker.
 * No DOM and no clock: every function is a function of its arguments (setup calls them once per keyframe).
 */
import { track, ease, clamp, lerp, smooth } from '../_lib/stage.js';

export const TAU = Math.PI * 2;

// ---------------------------------------------------------------- the paragraph
export const TEXT = '깊고 푸른 바다 밑에서 고래는 오래 노래한다. 아무도 듣지 못하는 낮은 소리로, 물살의 결을 따라 천천히 몸을 굽힌다. '
  + '가슴속 공기가 바닥나면 고래는 빛이 내려오는 쪽을 올려다본다. 꼬리를 한 번 크게 젓고, 숨을 쉬러 올라온다. '
  + '수면을 가르는 「후우」 한 번에 흰 물기둥이 하늘로 선다. 등에 내려앉은 햇빛이 잠깐 따뜻하다. '
  + '그 숨 하나를 가슴에 품고 고래는 다시 깊은 곳으로 내려간다. 바다는 고래를 따로 기억하지 않는다. 고래도 바다의 한 방울이니까.';
export const ACCENT = '숨을 쉬러 올라온다';

// ---------------------------------------------------------------- typesetting parameters
export const FS = 28, LH = 38;                               // body size and line pitch (px)
const SPACE = 0.32 * FS, STR = 0.3 * FS, SHR = 0.09 * FS;    // interword glue: natural width, stretch, shrink
const ASC = 0.8 * FS, DESC = 0.14 * FS;                       // ink box of a line around its baseline
const MARGIN = 3, MINW = 3.2 * FS;                            // span inset; shorter spans are dropped
const LINEPEN = 10, ADJ_DEM = 10000, FLAG_DEM = 1e6, COH_DEM = 1e7, EMPTY_DEM = 2e10;
const TIE_PEN = 200, SYL_PEN = 700, INF = 1e9;
export const R_OK = 1.0, LS_MAX = 0.12 * FS;                  // glue stretches to r = 1, then letter-spacing (자간)
const FILL = 1.08, SMARGIN = 1.0;                             // spans hold 8 % more than the natural paragraph
const CLOSE = '.,?!)」』…:;’”', OPEN = '(「『‘“';
const DEB = 4;                                                // debounce window (keyframes) for line flicker
const isHangul = (ch) => ch >= '가' && ch <= '힣';

// ---------------------------------------------------------------- the whale (local px, head to the right)
const LSP = 760, NSP = 100, SIG0 = 0.36;                     // spine length, samples, pivot (fraction of length)
const QA = 0.27, QB = 0.37, FINL = 128;                      // pectoral fin root (spine fractions) and length
export const MH = 200;                                       // resampled points per half outline
const hUp = (q) => 200 * Math.sqrt(Math.max(0, 1 - (1 - Math.min(q / 0.34, 1)) ** 2)) * (1 - 0.78 * smooth((q - 0.36) / 0.6));
const hDn = (q) => 180 * Math.sqrt(Math.max(0, 1 - (1 - Math.min(q / 0.22, 1)) ** 2)) * (1 - 0.76 * smooth((q - 0.3) / 0.62));

// ---------------------------------------------------------------- story (shape only; placement lives in main.js)
// keyframes: dense while the whale swims (the text follows the bending outline continuously), then stages through
// the dive and the morph (each stage a full layout of the in-between shape; every word makes one flight per stage)
const KT0 = 2.0, KDT = 0.08, DENSE_END = 4.56;
const STAGES = [4.95, 5.4, 5.85, 6.3, 6.75, 7.2];
export function keyTimes() {
  const t = [0];
  for (let x = KT0; x <= DENSE_END + 1e-6; x += KDT) t.push(+x.toFixed(3));
  return t.concat(STAGES);
}
// the whale rises nose-up (head = first lines, tail = last lines), arches over at the surface and dives
const SWIM = track([[0, 0], [2.0, 0], [2.6, 1], [4.6, 1], [5.6, 0.2], [6.8, 0]]);
const CURL = track([[0, 0.35], [4.5, 0.35], [5.4, 0.85], [6.3, 0.3], [7.1, 0.3]]);
const PITCH = track([[0, -0.6], [4.5, -0.6], [5.5, 0.3], [6.4, 1.36], [7.1, 1.42]]);
const MORPH = track([[0, 0], [5.6, 0], [7.1, 1]]);

export function poseAt(t) {
  const amp = SWIM(t), ph = 0.72 * Math.max(0, t - 2.0);
  return {
    amp: 0.11 * amp,
    phase: ph,
    curl: CURL(t),
    pitch: PITCH(t),
    flick: 0.2 * amp * Math.sin(TAU * ph - 1.4),
    fin: 0.95 + 0.2 * amp * Math.sin(TAU * ph - 2.2),
    m: ease.inOutCubic(MORPH(t)),
  };
}

// ---------------------------------------------------------------- geometry helpers
function bez3(out, p0, p1, p2, p3, n, skipFirst) {
  for (let i = skipFirst ? 1 : 0; i <= n; i++) {
    const u = i / n, a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
  }
}
function bez2(out, p0, p1, p2, n, skipFirst) {
  for (let i = skipFirst ? 1 : 0; i <= n; i++) {
    const u = i / n, a = (1 - u) ** 2, b = 2 * u * (1 - u), c = u * u;
    out.push([a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]);
  }
}

/** open polyline → n points evenly spaced by arc length, from its start up to (not including) its end */
export function resample(pts, n) {
  const m = pts.length, cum = new Float64Array(m);
  for (let i = 1; i < m; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const out = new Float64Array(n * 2), total = cum[m - 1];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = (i / n) * total;
    while (j < m - 2 && cum[j + 1] < s) j++;
    const k = (s - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j]);
    out[i * 2] = lerp(pts[j][0], pts[j + 1][0], k);
    out[i * 2 + 1] = lerp(pts[j][1], pts[j + 1][1], k);
  }
  return out;
}

export function polyArea(P) {
  let a = 0, cx = 0, cy = 0;
  const n = P.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, x0 = P[i * 2], y0 = P[i * 2 + 1], x1 = P[j * 2], y1 = P[j * 2 + 1], c = x0 * y1 - x1 * y0;
    a += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
  }
  return { area: Math.abs(a / 2), cx: cx / (3 * a), cy: cy / (3 * a) };
}

/**
 * The whale for a pose, as two chains that meet at the fluke notch and at the snout:
 *   A: notch → head-side fluke lobe → back → snout      B: snout → chin, fin, belly → far lobe → notch
 * The spine is a turning function θ(σ) = π + pitch + curl·q³ + swim wave, integrated from the pivot, so bending
 * never changes its length; the outline is the spine offset by a thickness profile on each side.
 */
export function whale(p) {
  const X = new Float64Array(NSP + 1), Y = new Float64Array(NSP + 1), TH = new Float64Array(NSP + 1);
  for (let i = 0; i <= NSP; i++) {
    const q = i / NSP;
    TH[i] = Math.PI + p.pitch + p.curl * q * q * q + p.amp * Math.pow(q, 1.6) * Math.sin(TAU * (0.8 * q - p.phase));
  }
  const ds = LSP / NSP, i0 = Math.round(SIG0 * NSP);
  for (let i = i0 + 1; i <= NSP; i++) { const a = (TH[i] + TH[i - 1]) / 2; X[i] = X[i - 1] + Math.cos(a) * ds; Y[i] = Y[i - 1] + Math.sin(a) * ds; }
  for (let i = i0 - 1; i >= 0; i--) { const a = (TH[i] + TH[i + 1]) / 2; X[i] = X[i + 1] - Math.cos(a) * ds; Y[i] = Y[i + 1] - Math.sin(a) * ds; }
  // N_up = (−sin θ, cos θ) is the back side of the spine
  const up = (i) => { const h = hUp(i / NSP); return [X[i] - Math.sin(TH[i]) * h, Y[i] + Math.cos(TH[i]) * h]; };
  const dn = (i) => { const h = hDn(i / NSP); return [X[i] + Math.sin(TH[i]) * h, Y[i] - Math.cos(TH[i]) * h]; };
  // flukes: a frame at the tail end (u along the tail, v toward the back side), turned by the flick
  const te = TH[NSP] + p.flick, ct = Math.cos(te), st = Math.sin(te);
  const F = (u, v) => [X[NSP] + ct * u - st * v, Y[NSP] + st * u + ct * v];
  const uEnd = up(NSP), dEnd = dn(NSP), notch = F(92, 0);
  const A = [];
  bez3(A, notch, F(130, 56), F(128, 150), F(74, 204), 14, false);            // notch → lobe tip (the scalloped edge)
  bez3(A, F(74, 204), F(16, 176), F(-12, 100), uEnd, 14, true);              // tip → back of the tail stock
  for (let i = NSP - 1; i >= 0; i--) A.push(up(i));                          // the back, tail → snout
  const B = [];
  const iA = Math.round(QA * NSP), iB = Math.round(QB * NSP);
  for (let i = 0; i <= iA; i++) B.push(dn(i));                               // snout → chin
  // pectoral fin: root on the belly, pointing back and down by angle p.fin
  const im = (iA + iB) >> 1, tm = TH[im], Tx = Math.cos(tm), Ty = Math.sin(tm), Nx = -Math.sin(tm), Ny = Math.cos(tm);
  const ca = Math.cos(p.fin), sa = Math.sin(p.fin);
  const dx = Tx * ca - Nx * sa, dy = Ty * ca - Ny * sa;                      // along the fin
  const ex = -Tx * sa - Nx * ca, ey = -Ty * sa - Ny * ca;                    // its leading side
  const a0 = dn(iA), b0 = dn(iB), mx = (a0[0] + b0[0]) / 2, my = (a0[1] + b0[1]) / 2;
  const tip = [mx + dx * FINL, my + dy * FINL];
  bez2(B, a0, [a0[0] + dx * FINL * 0.6 + ex * 26, a0[1] + dy * FINL * 0.6 + ey * 26], tip, 12, true);
  bez2(B, tip, [mx + dx * FINL * 0.5 - ex * 30, my + dy * FINL * 0.5 - ey * 30], b0, 12, true);
  for (let i = iB + 1; i <= NSP; i++) B.push(dn(i));                         // belly → tail stock
  bez3(B, dEnd, F(-12, -100), F(16, -176), F(74, -204), 14, true);          // far lobe
  bez3(B, F(74, -204), F(128, -150), F(130, -56), notch, 14, true);
  const ie = Math.round(0.11 * NSP);
  const eye = [X[ie] + Math.sin(TH[ie]) * 22, Y[ie] - Math.cos(TH[ie]) * 22];
  return { A, B, eye, blow: up(Math.round(0.2 * NSP)) };
}

/** teardrop, tip up: x = R·sin u·sin(u/2)^1.3, y = −R·cos u; chains tip → right → bottom and bottom → left → tip */
function dropChains(R) {
  const f = (u) => [R * Math.sin(u) * Math.pow(Math.sin(u / 2), 1.3), -R * Math.cos(u)];
  const A = [], B = [];
  for (let i = 0; i <= 240; i++) A.push(f((i / 240) * Math.PI));
  for (let i = 0; i <= 240; i++) B.push(f(Math.PI + (i / 240) * Math.PI));
  return { A, B };
}

/**
 * The shape family: whale poses and the drop, both resampled to 2·MH points by arc length between matched anchors
 * (fluke notch ↔ drop tip, snout ↔ drop bottom), so the morph is a point-wise blend.
 */
export function makeShapes() {
  const rest = whale(poseAt(0));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of rest.A.concat(rest.B)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const sx = -(x0 + x1) / 2, sy = -(y0 + y1) / 2;
  const join = (A, B) => {
    const a = resample(A, MH), b = resample(B, MH), P = new Float64Array(MH * 4);
    P.set(a, 0); P.set(b, MH * 2);
    return P;
  };
  const whaleP = (wh) => { const P = join(wh.A, wh.B); for (let i = 0; i < P.length; i += 2) { P[i] += sx; P[i + 1] += sy; } return P; };
  // the drop has the area of the resting whale and its centroid on the origin
  const aW = polyArea(whaleP(rest)).area;
  const R = 100 * Math.sqrt(aW / polyArea(join(dropChains(100).A, dropChains(100).B)).area);
  const dc = dropChains(R), drop = join(dc.A, dc.B), dcen = polyArea(drop);
  for (let i = 0; i < drop.length; i += 2) { drop[i] -= dcen.cx; drop[i + 1] -= dcen.cy; }
  const hilite = [-0.34 * R, -0.16 * R - dcen.cy];
  return {
    drop, dropR: R, hilite,
    /** unscaled local shape at time t: polygon, hole (eye → highlight), centroid, vertical extent */
    at(t) {
      const p = poseAt(t), wh = whale(p), P = whaleP(wh);
      if (p.m > 0) for (let i = 0; i < P.length; i++) P[i] = lerp(P[i], drop[i], p.m);
      const ex = wh.eye[0] + sx, ey = wh.eye[1] + sy;
      const hole = { x: lerp(ex, hilite[0], p.m), y: lerp(ey, hilite[1], p.m), r: lerp(19, 22, p.m), pad: 7 };
      let lo = Infinity, hi = -Infinity;
      for (let i = 1; i < P.length; i += 2) { lo = Math.min(lo, P[i]); hi = Math.max(hi, P[i]); }
      return { P, hole, cy: polyArea(P).cy, y0: lo, y1: hi, m: p.m, eye: [ex, ey], blow: [wh.blow[0] + sx, wh.blow[1] + sy] };
    },
  };
}

// ---------------------------------------------------------------- scanline spans
/** sorted x crossings of the closed polygon P with the horizontal line y (half-open rule: a vertex counts once) */
function crossings(P, y) {
  const out = [], n = P.length / 2;
  let x0 = P[n * 2 - 2], y0 = P[n * 2 - 1];
  for (let i = 0; i < n; i++) {
    const x1 = P[i * 2], y1 = P[i * 2 + 1];
    if ((y0 <= y) !== (y1 <= y)) out.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
    x0 = x1; y0 = y1;
  }
  return out.sort((a, b) => a - b);
}
/** intersection of two sorted interval lists [a0, a1, a2, a3, …] */
function intersect(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    const lo = Math.max(a[i], b[j]), hi = Math.min(a[i + 1], b[j + 1]);
    if (hi > lo) out.push(lo, hi);
    if (a[i + 1] < b[j + 1]) i += 2; else j += 2;
  }
  return out;
}

/**
 * Spans of the shape S (unscaled) at scale s. Line bands hang from the shape's top edge, so moving the shape never
 * reflows it, and a band that appears or vanishes as the outline bends does so at the bottom, at the paragraph's end. Per band [baseline − ASC, baseline + DESC]: intervals inside the outline on the top, middle
 * and bottom scanlines, intersected; the eye hole cut out; each piece inset by MARGIN; pieces under MINW dropped.
 */
export function spansOf(S, s, prev) {
  const spans = [], top0 = S.y0 * s, k1 = Math.ceil(((S.y1 - S.y0) * s) / LH);
  const hx = S.hole.x * s, hy = S.hole.y * s, hr = S.hole.r * s + S.hole.pad;
  for (let k = 0; k <= k1; k++) {
    const yb = top0 + (k + 0.9) * LH, top = yb - ASC, bot = yb + DESC;
    let set = null;
    for (const y of [top, (top + bot) / 2, bot]) {
      const xs = crossings(S.P, y / s).map((x) => x * s);
      set = set ? intersect(set, xs) : xs;
      if (!set.length) break;
    }
    if (!set.length) continue;
    const d = hy < top ? top - hy : hy > bot ? hy - bot : 0;
    if (d < hr) {
      const hw = Math.sqrt(hr * hr - d * d), cut = [];
      for (let i = 0; i < set.length; i += 2) {
        const a = set[i], b = set[i + 1];
        if (b <= hx - hw || a >= hx + hw) { cut.push(a, b); continue; }
        if (a < hx - hw) cut.push(a, hx - hw);
        if (b > hx + hw) cut.push(hx + hw, b);
      }
      set = cut;
    }
    for (let i = 0; i < set.length; i += 2) {
      const a = set[i] + MARGIN, b = set[i + 1] - MARGIN;
      // hysteresis: a span that overlaps one of the previous keyframe's spans in the same band stays down to
      // 0.8·MINW; a new one must reach 1.15·MINW (first keyframe: MINW)
      const known = prev && prev.some((q) => q.k === k && q.x1 > a && q.x0 < b);
      if (b - a >= (!prev ? MINW : known ? 0.8 * MINW : 1.15 * MINW)) spans.push({ y: yb, x0: a, x1: b, k, key: -1 });
    }
  }
  return spans;
}

// ---------------------------------------------------------------- the paragraph as boxes, glue and penalties
/** measure(ch, accent) → advance width. One box per syllable/mark, glue at spaces, penalties at legal breaks. */
export function buildParagraph(measure) {
  const items = [], chars = [];
  const aS = TEXT.indexOf(ACCENT), aE = aS + ACCENT.length;
  const words = TEXT.split(' ');
  let off = 0;
  words.forEach((wd, wi) => {
    if (wi) {
      const prev = words[wi - 1];
      let p = 0;
      if (CLOSE.includes(wd[0]) || OPEN.includes(prev[prev.length - 1])) p = INF;   // 금칙 at a space
      else if (off > aS && off < aE) p = TIE_PEN;                                   // inside the accent phrase
      items.push({ t: 1, w: SPACE, y: STR, z: SHR, p, f: 0 });
      off += 1;
    }
    const cs = Array.from(wd), syl = cs.filter(isHangul).length;
    let left = 0;
    cs.forEach((ch, ci) => {
      // a syllable break only inside an over-long 어절 (4+ syllables), with 2+ syllables on each side, never before
      // a closing mark or after an opening one (금칙), never inside the accent phrase
      if (ci && syl >= 4 && left >= 2 && syl - left >= 2 && !CLOSE.includes(ch) && !OPEN.includes(cs[ci - 1]) && !(off > aS && off < aE))
        items.push({ t: 2, w: 0, y: 0, z: 0, p: SYL_PEN, f: 1 });
      const acc = off >= aS && off < aE;
      const box = { t: 0, w: measure(ch, acc), y: 0, z: 0, p: 0, f: 0, ch, acc, ai: off - aS, word: wi, c: chars.length };
      items.push(box); chars.push(box);
      if (isHangul(ch)) left++;
      off += ch.length;
    });
  });
  const n = items.length;
  const SW = new Float64Array(n + 1), SY = new Float64Array(n + 1), SZ = new Float64Array(n + 1), SB = new Int32Array(n + 1);
  for (let i = 0; i < n; i++) {
    const it = items[i];
    SW[i + 1] = SW[i] + it.w; SY[i + 1] = SY[i] + it.y; SZ[i + 1] = SZ[i] + it.z; SB[i + 1] = SB[i] + (it.t === 0 ? 1 : 0);
  }
  const bps = [];
  items.forEach((it, i) => { if (it.t !== 0 && it.p < INF) bps.push(i); });
  bps.push(n);                                                                       // the end of the paragraph
  const boxW = items.reduce((a, it) => a + (it.t === 0 ? it.w : 0), 0);
  const nGlue = items.filter((it) => it.t === 1).length;
  return { items, chars, SW, SY, SZ, SB, bps, boxW, nGlue, nWords: words.length };
}

const fitness = (r) => (r < -0.5 ? 0 : r <= 0.5 ? 1 : r <= 1 ? 2 : 3);

/** line from break a (index into bps, −1 = paragraph start) to break b in a span of width L */
function lineMetrics(P, a, b, L) {
  const s0 = a < 0 ? 0 : P.bps[a] + 1, e = P.bps[b];
  const Wn = P.SW[e] - P.SW[s0], Y = P.SY[e] - P.SY[s0], Z = P.SZ[e] - P.SZ[s0], nb = P.SB[e] - P.SB[s0];
  // adjustment ratio; a line without glue (a single 어절) is scored as if it had one space's stretch
  const r = Wn <= L ? (L - Wn) / Math.max(Y, STR) : Z > 0 ? (L - Wn) / Z : -Infinity;
  return { s0, e, Wn, Y, Z, nb, r };
}

/**
 * Knuth–Plass total fit over spans of varying width, the line count pinned to the span count (TeX's \looseness,
 * forced; an empty span is allowed only as a last resort). State (line j, break b, fitness class c) → least total
 * demerits. Demerits of one line:
 *   (linepenalty + 100·|r|³)² + p² + [syllable break after a syllable break]·FLAG + [fitness jump > 1]·ADJ
 *   + [this span ended elsewhere in the previous keyframe]·COH   (temporal coherence: a span keeps its last word
 *     unless changing it pays; a span added or lost then moves a few words, not every line of the paragraph)
 */
export function knuthPlass(P, spans, prev) {
  const N = spans.length, NB = P.bps.length, END = NB - 1;
  if (!N) return null;
  const best = new Float64Array(N * NB * 4).fill(Infinity);
  const from = new Int32Array(N * NB * 4).fill(-2);
  const id = (j, b, c) => (j * NB + b) * 4 + c;
  const relax = (j, a, cp, base) => {
    const L = spans[j].x1 - spans[j].x0;
    if (a >= 0) {                                          // last resort: leave this span empty
      const k = id(j, a, cp);
      if (base + EMPTY_DEM < best[k]) { best[k] = base + EMPTY_DEM; from[k] = id(j - 1, a, cp); }
    }
    for (let b = a + 1; b < NB; b++) {
      const m = lineMetrics(P, a, b, L);
      if (m.Wn - m.Z > L) break;                           // cannot shrink enough; later breaks are only longer
      if (m.nb < 1) continue;
      const it = b === END ? null : P.items[m.e];
      let d = (LINEPEN + 100 * Math.abs(m.r) ** 3) ** 2;
      if (it && it.p > 0) d += it.p * it.p;
      if (it && it.f && a >= 0 && P.items[P.bps[a]].f) d += FLAG_DEM;
      const c = fitness(m.r);
      if (Math.abs(c - cp) > 1) d += ADJ_DEM;
      if (prev && it && prev.get(spans[j].key) !== m.e) d += COH_DEM;
      const k = id(j, b, c);
      if (base + d < best[k]) { best[k] = base + d; from[k] = a < 0 ? -1 : id(j - 1, a, cp); }
    }
  };
  relax(0, -1, 1, 0);
  for (let j = 1; j < N; j++)
    for (let a = 0; a < NB; a++)
      for (let c = 0; c < 4; c++) { const v = best[id(j - 1, a, c)]; if (v < Infinity) relax(j, a, c, v); }
  let bk = -1, bv = Infinity;
  for (let c = 0; c < 4; c++) { const k = id(N - 1, END, c); if (best[k] < bv) { bv = best[k]; bk = k; } }
  if (bk < 0) return null;
  const brk = new Array(N);
  for (let k = bk, j = N - 1; j >= 0; j--) { brk[j] = ((k / 4) | 0) % NB; k = from[k]; }
  return { brk, demerits: bv };
}

/** first-fit greedy over the same spans, for comparison: each span takes as much as fits */
export function greedy(P, spans) {
  const NB = P.bps.length, END = NB - 1, rs = [];
  let a = -1, j = 0;
  for (; j < spans.length && a !== END; j++) {
    const L = spans[j].x1 - spans[j].x0;
    let pick = -1;
    for (let b = a + 1; b < NB; b++) { const m = lineMetrics(P, a, b, L); if (m.Wn - m.Z > L) break; if (m.nb >= 1) pick = b; }
    if (pick < 0) pick = a + 1;
    rs.push(lineMetrics(P, a, pick, L).r);
    a = pick;
  }
  return { rs, emptySpans: spans.length - j, overflow: a !== END };
}

/** place every syllable of a solved layout: glue to r ≤ R_OK, the rest as letter-spacing ≤ LS_MAX, then centre */
export function place(P, spans, brk) {
  const n = P.chars.length;
  const X = new Float32Array(n), Y = new Float32Array(n), S = new Float64Array(n), rs = [];
  let a = -1;
  spans.forEach((sp, j) => {
    if (brk[j] === a) { rs.push(0); return; }                     // an empty span (last resort)
    const L = sp.x1 - sp.x0, m = lineMetrics(P, a, brk[j], L);
    let gl, ls = 0, x = sp.x0;
    if (m.r < 0) gl = m.r;                                         // shrink: each glue w + r·z
    else if (m.Y > 0 && m.r <= R_OK) gl = m.r;                     // stretch: each glue w + r·y
    else {                                                         // too loose: letter-spacing, then centre
      gl = m.Y > 0 ? R_OK : 0;
      const rest = L - m.Wn - gl * m.Y;
      ls = m.nb > 1 ? Math.min(LS_MAX, rest / (m.nb - 1)) : 0;
      x += (rest - ls * Math.max(0, m.nb - 1)) / 2;
    }
    rs.push(m.r);
    let first = -1, last = -1;
    for (let i = m.s0; i < m.e; i++) if (P.items[i].t === 0) { if (first < 0) first = P.items[i].c; last = P.items[i].c; }
    const sig = (sp.key * 1000 + first) * 1000 + last;                 // which line, holding which syllables
    let boxes = 0;
    for (let i = m.s0; i < m.e; i++) {
      const it = P.items[i];
      if (it.t === 0) {
        if (boxes++) x += ls;
        X[it.c] = x; Y[it.c] = sp.y; S[it.c] = sig;
        x += it.w;
      } else if (it.t === 1) x += it.w + (gl < 0 ? gl * it.z : gl * it.y);
    }
    a = brk[j];
  });
  return { X, Y, S, rs };
}

/**
 * Span identity across keyframes: a span inherits the id of the previous keyframe's span in the same band that it
 * overlaps most; new spans get fresh ids. Coherence and line signatures use these ids, so a fluke span appearing to
 * the left of a body span does not rename the body span.
 */
let nextId = 1;
function trackSpans(spans, prev) {
  const taken = new Set();
  for (const sp of spans) {
    let best = null, bo = 0;
    if (prev) for (const q of prev) {
      if (q.k !== sp.k || taken.has(q.key)) continue;
      const o = Math.min(q.x1, sp.x1) - Math.max(q.x0, sp.x0);
      if (o > bo) { bo = o; best = q; }
    }
    sp.key = best ? best.key : nextId++;
    if (best) taken.add(best.key);
  }
}

/**
 * All keyframe layouts. Pass 1 finds, per keyframe, the scale at which the spans' total length matches the
 * paragraph (bisection); the scales are smoothed with a wide Gaussian so the outline does not pulse. Pass 2 breaks
 * the paragraph with Knuth–Plass at that scale (coherent with the previous keyframe), growing the scale 0.3 % at a
 * time in the rare case nothing fits. Returns positions, line signatures and scales per keyframe.
 */
export function solveLayouts(P, shapes, times) {
  const K = times.length, NC = P.chars.length;
  nextId = 1;
  const need = (N) => (P.boxW + (P.nGlue - (N - 1)) * SPACE) * FILL;
  const S = times.map((t) => shapes.at(t));
  const raw = S.map((sh) => {
    let lo = 0.7, hi = 1.8;
    for (let i = 0; i < 24; i++) {
      const s = (lo + hi) / 2, sp = spansOf(sh, s);
      if (sp.reduce((a, q) => a + q.x1 - q.x0, 0) < need(sp.length)) lo = s; else hi = s;
    }
    return hi;
  });
  // bending keeps the area, so the scale only drifts: a wide Gaussian (σ = 0.6 s) plus a small margin
  const scale = raw.map((_, k) => {
    let a = 0, w = 0;
    for (let j = 0; j < K; j++) { const q = Math.exp(-(((times[j] - times[k]) / 0.6) ** 2) / 2); a += raw[j] * q; w += q; }
    return (a / w) * SMARGIN;
  });
  const KX = new Float32Array(K * NC), KY = new Float32Array(K * NC), KSIG = new Float64Array(K * NC), KS = new Float64Array(K);
  const stats = [];
  let prev = null, prevSpans = null;
  for (let k = 0; k < K; k++) {
    let s = scale[k], res = null, spans = null, tries = 0;
    for (; tries < 60 && !res; tries++) {
      spans = spansOf(S[k], s, prevSpans);
      trackSpans(spans, prevSpans);
      res = knuthPlass(P, spans, prev);
      if (!res) s *= 1.003;
    }
    prevSpans = spans;
    if (!res) throw new Error(`no layout at t = ${times[k]}`);
    const pl = place(P, spans, res.brk);
    KX.set(pl.X, k * NC); KY.set(pl.Y, k * NC); KSIG.set(pl.S, k * NC); KS[k] = s;
    prev = new Map(spans.map((sp, j) => [sp.key, P.bps[res.brk[j]]]));
    const gr = greedy(P, spans);
    stats.push({ t: times[k], s, raw: raw[k], tries, lines: spans.length, kp: pl.rs, gr });
  }
  // debounce: when a syllable's line returns within DEB keyframes to the line it had, the excursion in between was
  // flicker (the outline wiggled around a tie) — replace it by a straight drift between the two equal states
  for (let c = 0; c < NC; c++)
    for (let k = 0; k + 2 < K; k++) {
      const s0 = KSIG[k * NC + c];
      if (KSIG[(k + 1) * NC + c] === s0) continue;
      for (let j = Math.min(DEB, K - 1 - k); j >= 2; j--) {
        if (KSIG[(k + j) * NC + c] !== s0 || times[k + j] - times[k] > 0.4) continue;
        for (let i = 1; i < j; i++) {
          const q = (k + i) * NC + c;
          KX[q] = lerp(KX[k * NC + c], KX[(k + j) * NC + c], i / j);
          KY[q] = lerp(KY[k * NC + c], KY[(k + j) * NC + c], i / j);
          KSIG[q] = s0;
        }
        break;
      }
    }
  return { KX, KY, KSIG, KS, stats };
}
