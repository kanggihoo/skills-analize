/*
 * 159 · 기차가 닿는 곳 — the frame's aspect ratio as a directing device.
 *
 *   0–2.3     2.39:1 letterbox strip: a child at a train window before dawn, the land sliding by in parallax
 *   2.3–2.8   the mattes glide to a rounded 4:3 and the picture dissolves into a memory (warm, lifted, grainy)
 *   2.8–4.15  that summer: the grandmother waves at this station as the train takes the small child away
 *   4.15–5.2  back to 2.39:1, back to now: the train glides into the same station, stops, the doors open
 *   5.2–5.95  the climax: the mattes glide open to the full 9:16 frame while the camera cranes up — a huge morning
 *             sky, birds lifting off the wire, blossoms in the wind; she waves, the child hops down and runs
 *   6–10      afterglow: the hug, small under the big sky; the lens pulls a little wider; the title
 *
 * The technique, all closed-form in t:
 *   1. the active frame is a variable rect R(t) = (x, y, w, h, corner r): h = w / a, centred, eased between states;
 *      the mattes are what lies outside it; the memory frame's corners are superellipse quarter arcs
 *   2. every shot paints its whole world; a solver places the camera for the CURRENT R: zoom fits the shot's
 *      important box into R, the key point lands on a third line of R, the box is kept inside R, and the world must
 *      still cover the whole 9:16 screen — so the mattes only ever reveal
 *   3. with the key point on the lower third (v = 2/3) and a constant zoom, opening the mattes moves the subject by
 *      dh/6 — a crane-up locked to the mattes: 2/3 of every new row of picture appears above the subject (sky)
 *   4. the memory grade (multiply gain, screen lift, partial desaturation, warm vignette, grain) is applied to the
 *      memory layer only, and that layer is composited only inside the frame's path
 *   5. subtitles sit in the bottom matte while it is thick, and are clamped to a title-safe line inside the picture
 *      when it recedes — they ride the matte edge down, then the matte slides out from under them
 */
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import * as ART from './art.js';

const W = 1080, H = 1920, D = 10;
const KR = `"${FONTS.pretendard.family}"`;
let CPU = false;
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  return { c, g: c.getContext('2d', CPU ? { willReadFrequently: true } : undefined) };
}

// ================================================================ 1. the active frame as a variable
const LB = { w: W, h: W / 2.39, r: 0 };            // 451.9 px — a thin strip in the middle
const MEM = { w: 984, h: 984 * 3 / 4, r: 74 };      // 738 px, inset 48 px, rounded corners
const FULL = { w: W, h: H, r: 0 };
const KEYS = [[0, LB], [2.3, LB], [2.8, MEM], [4.15, MEM], [4.6, LB], [5.2, LB], [5.95, FULL]];
const LABELS = ['2.39 : 1', '4 : 3', '9 : 16'];

/** R(t): eased w, h and corner radius between the keyed states, centred; open = progress of the final opening */
function frameAt(t) {
  let a = KEYS[0], b = KEYS[0], p = 0;
  for (let i = 1; i < KEYS.length; i++) {
    if (t <= KEYS[i][0]) { a = KEYS[i - 1]; b = KEYS[i]; p = clamp((t - a[0]) / (b[0] - a[0])); break; }
    a = b = KEYS[i];
  }
  const e = ease.inOutCubic(p), A = a[1], B = b[1];
  const w = lerp(A.w, B.w, e), h = lerp(A.h, B.h, e), r = lerp(A.r, B.r, e);
  return { x: (W - w) / 2, y: (H - h) / 2, w, h, r, open: B === FULL ? e : A === FULL ? 1 : 0 };
}

/** rounded rect whose corners are superellipse quarter arcs |x|^n + |y|^n = r^n (n = 4: a squircle corner).
 *  Edges lying on the screen border are pushed 6 px outside it, so mattes and shadows never draw a hairline there. */
function framePath(g, R, n = 4) {
  let x0 = R.x, y0 = R.y, x1 = R.x + R.w, y1 = R.y + R.h;
  if (x0 < 0.5) x0 = -6; if (y0 < 0.5) y0 = -6; if (x1 > W - 0.5) x1 = W + 6; if (y1 > H - 0.5) y1 = H + 6;
  const r = Math.min(R.r, (x1 - x0) / 2, (y1 - y0) / 2);
  if (r < 0.5) { g.rect(x0, y0, x1 - x0, y1 - y0); return; }
  const e = 2 / n, N = 16;
  const corner = (cx, cy, th0) => {
    for (let i = 0; i <= N; i++) {
      const th = th0 + (i / N) * (Math.PI / 2), c = Math.cos(th), s = Math.sin(th);
      g.lineTo(cx + r * Math.sign(c) * Math.abs(c) ** e, cy + r * Math.sign(s) * Math.abs(s) ** e);
    }
  };
  g.moveTo(x0 + r, y0);
  corner(x1 - r, y0 + r, -Math.PI / 2);   // top right   (screen y points down: clockwise)
  corner(x1 - r, y1 - r, 0);              // bottom right
  corner(x0 + r, y1 - r, Math.PI / 2);    // bottom left
  corner(x0 + r, y0 + r, Math.PI);        // top left
  g.closePath();
}

// ================================================================ 2. recomposition: the camera solved per active rect
/*
 * A shot: P key point (world), (u, v) the third lines it should sit on, B the important box that must fit, m the fit
 * margin, sHi the widest zoom the lens may use (it never zooms in past it), Wb the painted world (must cover 9:16).
 * World = screen at the shot's reference camera (s = 1, centre 540, 960).
 */
const SHOT_A = { P: [360, LB.h / 3 + (H - LB.h) / 2], u: 1 / 3, v: 1 / 3, B: [180, 780, 760, 1150], m: 0.94, sLo: 0.6, sHi: 1, Wb: [-300, -300, 1400, 2300] };
const SHOT_B = { P: [704, (H - MEM.h) / 2 + MEM.h / 3], u: 2 / 3, v: 1 / 3, B: [400, 770, 860, 1170], m: 0.94, sLo: 0.6, sHi: 1, Wb: [-500, -400, 1600, 2400] };
const SHOT_C = { P: [720, 1290], u: 2 / 3, v: 2 / 3, B: [300, 1180, 830, 1400], m: 0.94, sLo: 0.6, sHi: 1, Wb: [-500, -560, 1700, 2500] };
// the afterglow: the lens pulls 16 % wider while the solver keeps the hug on the lower third
const sHiC = (t) => 1 - 0.16 * (0.5 - 0.5 * Math.cos(Math.PI * clamp((t - 6.2) / 3.8)));

function fitAxis(o, s, b0, b1, r0, r1) {
  const lo = r0 - s * b0, hi = r1 - s * b1;     // o ≥ lo keeps the box's near edge inside R, o ≤ hi its far edge
  return lo <= hi ? clamp(o, lo, hi) : (lo + hi) / 2;
}
function solve(R, S, sHi = S.sHi) {
  const bw = S.B[2] - S.B[0], bh = S.B[3] - S.B[1];
  let s = clamp(S.m * Math.min(R.w / bw, R.h / bh), S.sLo, sHi);                // fit the important box
  s = Math.max(s, W / (S.Wb[2] - S.Wb[0]), H / (S.Wb[3] - S.Wb[1]));            // the world must still cover 9:16
  let ox = R.x + S.u * R.w - s * S.P[0];                                          // key point on a third line of R
  let oy = R.y + S.v * R.h - s * S.P[1];
  ox = fitAxis(ox, s, S.B[0], S.B[2], R.x, R.x + R.w);                           // keep the box inside R
  oy = fitAxis(oy, s, S.B[1], S.B[3], R.y, R.y + R.h);
  ox = clamp(ox, W - s * S.Wb[2], -s * S.Wb[0]);                                  // coverage wins over everything
  oy = clamp(oy, H - s * S.Wb[3], -s * S.Wb[1]);
  return { s, cx: (W / 2 - ox) / s, cy: (H / 2 - oy) / s };
}
/** layer transform for parallax depth d: the camera's offset from the reference is scaled by d (crane parallax) */
function layers(g, cam) {
  return (d, ex = 0, ey = 0) => {
    const cx = W / 2 + d * (cam.cx - W / 2), cy = H / 2 + d * (cam.cy - H / 2);
    g.setTransform(cam.s, 0, 0, cam.s, W / 2 - cam.s * cx + ex, H / 2 - cam.s * cy + ey);
  };
}

// ================================================================ 4. the memory grade (inside the frame only)
const GAIN = 'rgb(255,228,186)', LIFT = 'rgb(46,31,20)';
function grade(g, R) {
  const x = Math.floor(R.x) - 2, y = Math.floor(R.y) - 2, w = Math.ceil(R.w) + 4, h = Math.ceil(R.h) + 4;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.globalCompositeOperation = 'multiply'; g.fillStyle = GAIN; g.fillRect(x, y, w, h);     // c·G (warm highlights)
  g.globalCompositeOperation = 'screen'; g.fillStyle = LIFT; g.fillRect(x, y, w, h);       // L + c·G·(1 − L): lifted, low contrast
  g.globalCompositeOperation = 'saturation'; g.globalAlpha = 0.18; g.fillStyle = '#808080'; g.fillRect(x, y, w, h);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const v = g.createRadialGradient(W / 2, H / 2, R.h * 0.35, W / 2, H / 2, Math.hypot(R.w, R.h) * 0.56);
  v.addColorStop(0, 'rgba(70,38,18,0)'); v.addColorStop(1, 'rgba(70,38,18,0.42)');
  g.fillStyle = v; g.fillRect(x, y, w, h);
}

/** a soft shadow cast by the mattes onto the picture: an eased gradient per edge that borders a matte */
function innerShadow(g, R) {
  const kTB = clamp((H - R.h) / 260), kS = clamp(R.x / 30), Dp = 84;
  if (kTB <= 0 && kS <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.beginPath(); framePath(g, R); g.clip();
  const band = (x0, y0, x1, y1, k, rx, ry, rw, rh) => {
    if (k <= 0) return;
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    for (let i = 0; i <= 8; i++) { const u = i / 8; gr.addColorStop(u, `rgba(4,7,14,${(0.46 * k * (1 - u) ** 2.4).toFixed(4)})`); }
    g.fillStyle = gr; g.fillRect(rx, ry, rw, rh);
  };
  band(0, R.y, 0, R.y + Dp, kTB, R.x, R.y, R.w, Dp);
  band(0, R.y + R.h, 0, R.y + R.h - Dp, kTB, R.x, R.y + R.h - Dp, R.w, Dp);
  band(R.x, 0, R.x + Dp, 0, kS, R.x, R.y, Dp, R.h);
  band(R.x + R.w, 0, R.x + R.w - Dp, 0, kS, R.x + R.w - Dp, R.y, Dp, R.h);
  g.restore();
}

// ================================================================ text sprites (baked: shadowed text never re-rasters)
function sprite(text, font, size, color, shadow) {
  const pad = shadow ? 40 : 6;
  const m = mk(8, 8).g; m.font = `${font} ${size}px ${KR}`;
  const tw = Math.ceil(m.measureText(text).width);
  const { c, g } = mk(tw + pad * 2, size * 1.5 + pad * 2);
  g.font = `${font} ${size}px ${KR}`; g.textBaseline = 'middle'; g.fillStyle = color;
  if (shadow) { g.shadowColor = shadow; g.shadowBlur = 22; g.shadowOffsetY = 4; }
  g.fillText(text, pad, c.height / 2);
  return { c, w: tw, pad };
}

// captions: [in, out, text]
const LINES = [
  [0.35, 2.15, '새벽 첫차, 할머니한테 가는 길'],
  [2.72, 4.0, '그 여름, 할머니는 여기서 손을 흔들었다'],
  [4.5, 5.12, '이번 역은 꽃마을역입니다'],
  [5.3, 8.7, '할머니, 나 왔어!'],
];
const Y_SAFE = 1598;          // title-safe caption line inside the full picture (the bottom 270 px belong to the credits)

defineDemo({
  id: '159-aspect-ratio',
  title: '기차가 닿는 곳',
  tech: '화면비 연출 · 레터박스 → 4:3 회상 → 전체 화면이 열리는 순간',
  duration: D,
  background: ART.C.matte,

  async setup(api) {
    const glyphs = LINES.map((l) => l[2]).join('') + '기차가 닿는 곳꽃마을역, 다시 봄' + LABELS.join('') + '꽃마을← 솔밭은빛내 →';
    await fontReady(`600 40px ${KR}`, glyphs);
    await fontReady(`700 33px ${KR}`, LABELS.join(''));
    await fontReady(`800 96px ${KR}`, '기차가 닿는 곳꽃마을');
    await fontReady(`600 12px ${KR}`, '← 솔밭은빛내 →');
    CPU = api.headless;
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.g = ctx;
    this.L = mk(W, H);                                   // the memory layer (painted, graded, then composited)
    this.SIGN = ART.bakeSign(mk, KR);
    this.lines = LINES.map(([a, b, s]) => ({ a, b, bar: sprite(s, 600, 40, '#e6ebf3', null), pic: sprite(s, 700, 42, '#ffffff', 'rgba(10,18,36,0.6)') }));
    this.labels = LABELS.map((s) => sprite(s, 700, 33, '#eef2f8', null));
    this.title = sprite('기차가 닿는 곳', 800, 96, '#ffffff', 'rgba(18,40,86,0.45)');
    this.kicker = sprite('꽃마을역, 다시 봄', 600, 34, '#f4f7fb', 'rgba(18,40,86,0.4)');
    // film grain tile: grey noise around 50 %, laid on with 'overlay'
    {
      const { c, g } = mk(256, 256), id = g.createImageData(256, 256), r = rand(1599);
      for (let i = 0; i < 256 * 256; i++) { const v = 128 + (r() + r() - 1) * 120; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
      g.putImageData(id, 0, 0);
      this.grain = c;
    }
    // draw the busiest offscreen path once so its first composite is not the first one a check sees
    this.L.g.fillRect(0, 0, 4, 4);
    ctx.drawImage(this.L.c, 0, 0);
  },

  frame(t) {
    const g = this.g;
    if (g.reset) g.reset();
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]); g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)';
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'low';

    const R = frameAt(t);
    // memory layer weight: in with the 4:3 morph, out with the morph back
    const kB = t < 4.15 ? smooth((t - 2.42) / 0.3) : 1 - smooth((t - 4.2) / 0.3);

    // ---- the base shot, painted over the whole 9:16 screen
    if (kB < 1) {
      if (t < 3) ART.paintA(g, t, layers(g, solve(R, SHOT_A)));
      else {
        const beat = Math.sin(Math.PI * clamp((t - 5.2) / 1.2)) ** 2;
        ART.paintC(g, t, layers(g, solve(R, SHOT_C, sHiC(t))), this.SIGN, beat);
      }
    }
    // ---- the memory: painted whole, graded, composited only inside the frame's path
    if (kB > 0) {
      const m = this.L.g;
      if (m.reset) m.reset();
      m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over';
      ART.paintB(m, t, layers(m, solve(R, SHOT_B)), this.SIGN);
      grade(m, R);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.save(); g.beginPath(); framePath(g, R); g.clip();
      g.globalAlpha = kB; g.drawImage(this.L.c, 0, 0);
      // grain, a new offset every frame (deliberate film grain, from the frame index)
      const fi = Math.round(t * 30), rr = rand(9000 + fi);
      const ox = Math.floor(rr() * 256), oy = Math.floor(rr() * 256);
      g.globalAlpha = 0.2 * kB; g.globalCompositeOperation = 'overlay';
      for (let y = Math.floor(R.y) - oy; y < R.y + R.h; y += 256) for (let x = Math.floor(R.x) - ox; x < R.x + R.w; x += 256) g.drawImage(this.grain, x, y);
      g.restore();
    }

    // ---- soft inner shadow along the matte edges (eased gradients on each edge that meets a matte, clipped to R)
    innerShadow(g, R);
    // ---- the mattes: everything outside R
    g.globalAlpha = 1; g.fillStyle = ART.C.matte;
    g.beginPath(); g.rect(-20, -20, W + 40, H + 40); framePath(g, R); g.fill('evenodd');

    this.drawChip(g, t, R);
    this.drawCaptions(g, t, R);
    this.drawTitle(g, t);

    // fade up from black
    const fade = 1 - smooth(t / 0.5);
    if (fade > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = fade; g.fillStyle = ART.C.matte; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  },

  /** the returning teaching element: a chip in the top matte with the ratio and a tiny live copy of the frame */
  drawChip(g, t, R) {
    const SW = [2.55, 4.375, 5.575];                     // label switches (the middle of each morph)
    let cur = 0; for (const s of SW) if (t >= s) cur++;
    const lab = [0, 1, 0, 2][cur];
    const prev = cur > 0 ? [0, 1, 0, 2][cur - 1] : lab;
    const since = cur > 0 ? t - SW[cur - 1] : 9;
    const sw = smooth(since / 0.22);
    const cy = Math.max(118, R.y - 62);                  // rides the top matte edge, stops inside the picture
    const x0 = 64, hh = 64;
    const lw = lerp(this.labels[prev].w, this.labels[lab].w, sw);
    const w = 48 + lw + 18 + 24 + 22;
    const pop = 1 + 0.07 * Math.sin(Math.PI * clamp(since / 0.3)) * (since < 0.3 ? 1 : 0);
    const appear = smooth((t - 0.15) / 0.4);
    g.setTransform(pop, 0, 0, pop, x0 * (1 - pop), cy * (1 - pop));
    g.globalAlpha = appear;
    g.fillStyle = `rgba(${lerp(28, 14, R.open)},${lerp(36, 22, R.open)},${lerp(54, 38, R.open)},${lerp(1, 0.62, R.open)})`;
    g.beginPath(); g.roundRect(x0, cy - hh / 2, w, hh, hh / 2); g.fill();
    g.strokeStyle = 'rgba(220,230,246,0.14)'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = ART.C.scarf; g.beginPath(); g.arc(x0 + 27, cy, 7.5, 0, Math.PI * 2); g.fill();
    // label: the old one slides up and out, the new one up and in
    g.save(); g.beginPath(); g.rect(x0 + 40, cy - hh / 2 + 4, lw + 16, hh - 8); g.clip();
    const L0 = this.labels[prev].c, L1 = this.labels[lab].c, pd = this.labels[lab].pad;
    if (sw < 1 && prev !== lab) { g.globalAlpha = appear * (1 - sw); g.drawImage(L0, x0 + 46 - pd, cy - L0.height / 2 - 22 * sw); }
    g.globalAlpha = appear * (prev !== lab ? sw : 1); g.drawImage(L1, x0 + 46 - pd, cy - L1.height / 2 + 22 * (1 - (prev !== lab ? sw : 1)));
    g.restore();
    // the tiny frame: the whole 9:16 screen, the live active rect in it
    const ix = x0 + 48 + lw + 18, iy = cy - 21, sc = 24 / W;
    g.globalAlpha = appear;
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.roundRect(ix, iy, 24, 42.7, 4); g.fill();
    g.fillStyle = '#e8eef7';
    g.beginPath(); g.roundRect(ix + R.x * sc, iy + R.y * sc, R.w * sc, R.h * sc, Math.min(3.5, R.r * sc * 2)); g.fill();
    g.strokeStyle = 'rgba(230,236,246,0.55)'; g.lineWidth = 1.4; g.beginPath(); g.roundRect(ix, iy, 24, 42.7, 4); g.stroke();
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  },

  /** subtitles: in the bottom matte while it is thick, clamped to the title-safe line inside the picture when it opens */
  drawCaptions(g, t, R) {
    const bottom = R.y + R.h;
    const y = Math.min(bottom + 92, Y_SAFE);
    const inPic = smooth((bottom - (y + 34)) / 70);      // how far the matte edge has slid past the line
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (const l of this.lines) {
      if (t < l.a || t > l.b + 0.3) continue;
      const a = ease.outCubic(clamp((t - l.a) / 0.4)) * (1 - smooth((t - l.b) / 0.26));
      const dy = 16 * (1 - ease.outCubic(clamp((t - l.a) / 0.45)));
      for (const [sp, k] of [[l.bar, 1 - inPic], [l.pic, inPic]]) {
        if (k <= 0.001) continue;
        g.globalAlpha = a * k;
        g.drawImage(sp.c, Math.round(W / 2 - sp.w / 2 - sp.pad), y + dy - sp.c.height / 2);
      }
    }
    g.globalAlpha = 1;
  },

  drawTitle(g, t) {
    if (t < 6.75) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (const [sp, t0, yc] of [[this.kicker, 6.8, 352], [this.title, 6.92, 440]]) {
      const p = clamp((t - t0) / 0.7);
      g.globalAlpha = ease.outCubic(p);
      g.drawImage(sp.c, Math.round(W / 2 - sp.w / 2 - sp.pad), yc + 26 * (1 - ease.outExpo(p)) - sp.c.height / 2);
    }
    g.globalAlpha = 1;
  },
});
