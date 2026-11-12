/*
 * 37 · 깨지는 유리 — a window pane struck by a steel ball, filmed like a high-speed camera.
 *
 *  · fracture.js   impact-centred Voronoi (d3-delaunay) on a polar grid: tiny shards at the impact, long radial
 *                  cracks and concentric rings further out; crack-front arrival times by Dijkstra at ~1.5 km/s.
 *  · sim.js        shard fates (held by the putty / falling in the plane / drifting / punched out), and a
 *                  Rapier2D bake of every in-plane pose at dt = 1/480 s, done once in setup().
 *  · time remap    the physical time τ(t) is the integral of a slow-motion rate that goes 1/20 → 1/2000 around
 *                  the impact (the cracks run at real speed, so they need 1/2000 to be seen) → 1/3 for the fall.
 *  · rendering     WebGL2. The scene behind the glass (night city, ball, punched-out shards, dust) goes to an
 *                  MSAA framebuffer; each shard in the pane then re-samples it through its own tilt (refraction),
 *                  adds Fresnel reflections of the room lamps (glints as shards turn), a green-white broken edge
 *                  that only exists where the crack front has already passed, a dark internal rim and a
 *                  dispersive bevel. Frame and wall on top; the ball (shaded sphere, 10-sample shutter motion blur),
 *                  dust (closed-form ballistic with drag) and crack-tip / glint sprites last.
 * frame(t) only reads tables and closed forms of τ(t): any t is drawn directly.
 */
import RAPIER from '@dimforge/rapier2d-compat';
import { defineDemo, rand, clamp, lerp, smooth, track, ease } from '../_lib/stage.js';
import { buildFracture } from './fracture.js';
import { plan, bake, KIND, G } from './sim.js';

const D = 9.6;
const TAU2 = Math.PI * 2;
const OPEN = { x0: 112, y0: 196, x1: 968, y1: 1536 };               // visible glass (the window opening)
const RAB = 14;                                                      // glass hidden in the frame rebate
const PANE = [OPEN.x0 - RAB, OPEN.y0 - RAB, OPEN.x1 + RAB, OPEN.y1 + RAB];
const SILL = { x0: 30, y0: 1548, x1: 1050, y1: 1606 };
const IMPACT = [566, 716];
const CAM = { cx: 540, cy: 840, F: 1700 };                           // camera 1.7 m in front of the pane
const LAMP = [150, 150, -800], LAMP2 = [980, 300, -1500];            // warm lamp, cool fill (room side, z < 0)
const BALL_R = 11;                                                   // 22 mm steel ball
const V_IN = 38000, V_OUT = 30000;                                   // px/s = mm/s (38 → 30 m/s)
const BD = (() => { const v = [-0.13, -0.09, 1], l = Math.hypot(...v); return v.map((x) => x / l); })();
const T_IMP = 1.9, T_CRACK_END = 3.3;
const ZC = IMPACT;                                                   // camera push centre
const zoomOf = track([[0, 1.0], [T_IMP, 1.03], [T_CRACK_END, 1.07], [5.6, 1.025], [D, 1.015]]);
const fadeOf = (t) => Math.max(1 - smooth(t / 0.7), smooth((t - 9.15) / 0.45));

/* ---------------------------------------------------------------- time remap: screen t → physical τ */
// log10 of the slow-motion rate dτ/dt; the hold level H is solved so the last crack finishes at T_CRACK_END
function timeMap(crackSec) {
  const N = Math.round(D * 1000);
  let lr = null, C = null;
  const build = (Hh) => {
    lr = track([[0, -1.3], [1.1, -1.45], [1.62, -2.5], [T_IMP + 0.07, Hh], [3.15, Hh - 0.04], [3.62, -2.35],
      [4.3, -1.15], [5.05, -0.62], [D, -0.52]]);
    C = new Float64Array(N + 1);
    for (let i = 1; i <= N; i++) C[i] = C[i - 1] + Math.pow(10, lr((i - 0.5) / 1000)) / 1000;
  };
  const at = (t) => { const f = clamp(t, 0, D) * 1000, i = Math.min(N - 1, Math.floor(f)); return C[i] + (C[i + 1] - C[i]) * (f - i); };
  let lo = -4.8, hi = -2.6;
  for (let it = 0; it < 40; it++) { const mid = (lo + hi) / 2; build(mid); if (at(T_CRACK_END) - at(T_IMP) > crackSec) hi = mid; else lo = mid; }
  build((lo + hi) / 2);
  const c0 = at(T_IMP);
  return { tau: (t) => at(t) - c0, rate: (t) => Math.pow(10, lr(clamp(t, 0, D))) };
}

/* ---------------------------------------------------------------- pictures painted once */
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a.toFixed(3)})`;

// the night outside: sky, haze, an out-of-focus skyline whose windows and street lights are bokeh discs
function paintNight(W, H, rnd) {
  const c = mkCanvas(W, H), g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0.00, '#03050b'); sky.addColorStop(0.30, '#081022'); sky.addColorStop(0.50, '#131d36');
  sky.addColorStop(0.59, '#262840'); sky.addColorStop(0.63, '#35293a'); sky.addColorStop(0.70, '#120f18'); sky.addColorStop(1, '#07060a');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) {                                  // a few stars above the glow
    const y = rnd() * 820;
    g.fillStyle = `rgba(205,218,255,${(0.12 + rnd() * 0.4 * (1 - y / 900)).toFixed(3)})`;
    g.beginPath(); g.arc(rnd() * W, y, 0.5 + rnd() * 0.9, 0, TAU2); g.fill();
  }
  g.filter = 'blur(46px)';                                         // low cloud catching the city light
  for (let i = 0; i < 11; i++) {
    g.fillStyle = `rgba(${70 + rnd() * 30 | 0},${58 + rnd() * 20 | 0},${86 + rnd() * 20 | 0},${(0.10 + rnd() * 0.12).toFixed(3)})`;
    g.beginPath(); g.ellipse(rnd() * W, 300 + rnd() * 720, 200 + rnd() * 320, 40 + rnd() * 80, (rnd() - 0.5) * 0.2, 0, TAU2); g.fill();
  }
  g.filter = 'none';
  let gr = g.createRadialGradient(540, 1260, 0, 540, 1260, 1050);
  gr.addColorStop(0, 'rgba(255,150,90,0.20)'); gr.addColorStop(0.45, 'rgba(150,90,130,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);

  const disc = (x, y, r, col, a) => {
    const d = g.createRadialGradient(x, y, 0, x, y, r);
    d.addColorStop(0, rgba(col, a * 0.55)); d.addColorStop(0.7, rgba(col, a * 0.68)); d.addColorStop(0.9, rgba(col, a));
    d.addColorStop(1, rgba(col, 0));
    g.fillStyle = d; g.beginPath(); g.arc(x, y, r, 0, TAU2); g.fill();
  };
  const WARM = [255, 190, 116], CREAM = [255, 226, 182], COOL = [186, 212, 255], TEAL = [120, 228, 208], RED = [255, 96, 80];
  const pick = () => { const u = rnd(); return u < 0.5 ? WARM : u < 0.78 ? CREAM : u < 0.94 ? COOL : TEAL; };
  const layers = [
    { base: 1190, hMin: 140, hMax: 430, col: '#191a2c', blur: 4, lit: 0.20, wr: [2.4, 3.6], a: 0.6 },
    { base: 1228, hMin: 220, hMax: 590, col: '#0f0f1c', blur: 8, lit: 0.22, wr: [5.5, 8.5], a: 0.42 },
    { base: 1300, hMin: 300, hMax: 720, col: '#08080e', blur: 15, lit: 0.15, wr: [11, 17], a: 0.30 },
  ];
  for (const L of layers) {
    const blds = [];
    for (let x = -80; x < W + 80;) {
      const w = 50 + rnd() * 110, h = L.hMin + rnd() * (L.hMax - L.hMin);
      blds.push([x, w, h]); x += w + rnd() * 18;
    }
    g.filter = `blur(${L.blur}px)`;
    g.fillStyle = L.col;
    for (const [x, w, h] of blds) {
      g.fillRect(x, L.base - h, w, h + 700);
      if (rnd() < 0.25) g.fillRect(x + w * 0.4, L.base - h - 30 - rnd() * 60, w * 0.12, 100);   // a mast or a roof box
    }
    g.filter = 'none';
    g.globalCompositeOperation = 'lighter';
    for (const [x, w, h] of blds) {
      const r = L.wr[0] + rnd() * (L.wr[1] - L.wr[0]), sp = r * 2.9;
      const col0 = pick();
      for (let yy = L.base - h + sp; yy < L.base - sp * 0.5; yy += sp) {
        for (let xx = x + sp * 0.7; xx < x + w - sp * 0.4; xx += sp) {
          if (rnd() > L.lit) continue;
          disc(xx + (rnd() - 0.5) * 2, yy, r * (0.85 + rnd() * 0.3), rnd() < 0.7 ? col0 : pick(), L.a * (0.5 + rnd() * 0.5));
        }
      }
    }
    g.globalCompositeOperation = 'source-over';
  }
  // the street below: ground, then large out-of-focus street lamps and car lights
  gr = g.createLinearGradient(0, 1280, 0, H);
  gr.addColorStop(0, 'rgba(10,8,12,0)'); gr.addColorStop(0.15, 'rgba(10,8,12,0.9)'); gr.addColorStop(1, '#050407');
  g.fillStyle = gr; g.fillRect(0, 1280, W, H - 1280);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 11; i++) {
    const u = i / 10, x = -40 + u * 1160 + (rnd() - 0.5) * 50, y = 1330 + Math.sin(u * 3.1) * 40 + rnd() * 30;
    disc(x, y, 34 + rnd() * 30, rnd() < 0.8 ? [255, 168, 84] : CREAM, 0.20 + rnd() * 0.12);
  }
  for (let i = 0; i < 16; i++) {
    const x = rnd() * W, y = 1400 + rnd() * 120, r = 13 + rnd() * 14, red = rnd() < 0.5;
    disc(x, y, r, red ? RED : [255, 240, 220], 0.22 + rnd() * 0.15);
    disc(x + r * 2.6, y + (rnd() - 0.5) * 3, r, red ? RED : [255, 240, 220], 0.22 + rnd() * 0.15);
  }
  for (let i = 0; i < 5; i++) disc(rnd() * W, 1250 + rnd() * 120, 20 + rnd() * 16, rnd() < 0.5 ? TEAL : [255, 120, 160], 0.16);
  g.globalCompositeOperation = 'source-over';
  return c;
}

// the room side: wall lit by a lamp at the upper left, a dark wooden casing with the opening cut out, the sill
function paintRoom(W, H, rnd) {
  const c = mkCanvas(W, H), g = c.getContext('2d');
  const { x0, y0, x1, y1 } = OPEN;
  g.fillStyle = '#100e0d'; g.fillRect(0, 0, W, H);
  let gr = g.createRadialGradient(-80, 220, 0, -80, 220, 1600);
  gr.addColorStop(0, 'rgba(255,196,140,0.24)'); gr.addColorStop(0.45, 'rgba(255,170,110,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 7000; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(255,235,210,0.022)' : 'rgba(0,0,0,0.07)';
    g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
  }
  const C = { x0: x0 - 48, y0: y0 - 48, x1: x1 + 48, y1: SILL.y0 };
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.75)'; g.shadowBlur = 44; g.shadowOffsetX = 16; g.shadowOffsetY = 24;
  g.fillStyle = '#1b1613';
  g.fillRect(C.x0, C.y0, C.x1 - C.x0, C.y1 - C.y0);
  g.fillRect(SILL.x0, SILL.y0, SILL.x1 - SILL.x0, SILL.y1 - SILL.y0);
  g.restore();
  gr = g.createLinearGradient(C.x0, C.y0, C.x1, C.y1);
  gr.addColorStop(0, '#2c221b'); gr.addColorStop(0.5, '#1b1512'); gr.addColorStop(1, '#110e0c');
  g.fillStyle = gr; g.fillRect(C.x0, C.y0, C.x1 - C.x0, C.y1 - C.y0);
  // wood grain along each rail
  g.save();
  g.beginPath(); g.rect(C.x0, C.y0, C.x1 - C.x0, C.y1 - C.y0); g.clip();
  for (let i = 0; i < 420; i++) {
    const dark = rnd() < 0.65;
    g.strokeStyle = dark ? `rgba(0,0,0,${(0.08 + rnd() * 0.14).toFixed(3)})` : `rgba(255,214,170,${(0.015 + rnd() * 0.03).toFixed(3)})`;
    g.lineWidth = 0.6 + rnd() * 1.6;
    g.beginPath();
    const side = i % 3;
    if (side === 0) { const y = C.y0 + rnd() * 48; g.moveTo(C.x0, y); for (let x = C.x0; x <= C.x1; x += 30) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 1.2); }
    else { const x = (side === 1 ? C.x0 : x1) + rnd() * 48; g.moveTo(x, C.y0); for (let y = C.y0; y <= C.y1; y += 30) g.lineTo(x + Math.sin(y * 0.008 + i) * 1.4, y); }
    g.stroke();
  }
  g.restore();
  g.fillStyle = 'rgba(255,214,170,0.22)'; g.fillRect(C.x0, C.y0, C.x1 - C.x0, 2); g.fillRect(C.x0, C.y0, 2, C.y1 - C.y0);
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(C.x1 - 2, C.y0, 2, C.y1 - C.y0);
  // reveal bevels: each face takes the lamp light by its direction
  const bev = 12;
  const quad = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.fillStyle = fill; g.fill(); };
  quad([[x0 - bev, y0 - bev], [x1 + bev, y0 - bev], [x1, y0], [x0, y0]], 'rgba(0,0,0,0.55)');
  quad([[x0 - bev, y0 - bev], [x0, y0], [x0, y1], [x0 - bev, y1 + bev]], 'rgba(0,0,0,0.32)');
  quad([[x1 + bev, y0 - bev], [x1, y0], [x1, y1], [x1 + bev, y1 + bev]], 'rgba(255,205,160,0.10)');
  quad([[x0, y1], [x1, y1], [x1 + bev, y1 + bev], [x0 - bev, y1 + bev]], 'rgba(255,205,160,0.16)');
  g.strokeStyle = 'rgba(255,222,190,0.20)'; g.lineWidth = 1; g.strokeRect(x0 - 0.5, y0 - 0.5, x1 - x0 + 1, y1 - y0 + 1);
  // the sill: lit top face, dark front, a bright nosing
  gr = g.createLinearGradient(0, SILL.y0, 0, SILL.y0 + 14);
  gr.addColorStop(0, '#3b2d23'); gr.addColorStop(1, '#2a2019');
  g.fillStyle = gr; g.fillRect(SILL.x0, SILL.y0, SILL.x1 - SILL.x0, 14);
  gr = g.createLinearGradient(0, SILL.y0 + 14, 0, SILL.y1);
  gr.addColorStop(0, '#1d1612'); gr.addColorStop(1, '#0c0908');
  g.fillStyle = gr; g.fillRect(SILL.x0, SILL.y0 + 14, SILL.x1 - SILL.x0, SILL.y1 - SILL.y0 - 14);
  g.fillStyle = 'rgba(255,220,180,0.30)'; g.fillRect(SILL.x0, SILL.y0 + 13, SILL.x1 - SILL.x0, 1.5);
  // cut the opening; a soft contact shadow where the glass meets the rebate
  g.globalCompositeOperation = 'destination-out';
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.globalCompositeOperation = 'source-over';
  const ao = (gx0, gy0, gx1, gy1, x, y, w, h) => {
    const s = g.createLinearGradient(gx0, gy0, gx1, gy1);
    s.addColorStop(0, 'rgba(0,0,0,0.42)'); s.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = s; g.fillRect(x, y, w, h);
  };
  ao(0, y0, 0, y0 + 26, x0, y0, x1 - x0, 26);
  ao(x0, 0, x0 + 20, 0, x0, y0, 20, y1 - y0);
  ao(x1, 0, x1 - 16, 0, x1 - 16, y0, 16, y1 - y0);
  ao(0, y1, 0, y1 - 12, x0, y1 - 12, x1 - x0, 12);
  return c;
}

/* ---------------------------------------------------------------- GLSL */
const COMMON = `
uniform vec2 uC;
uniform float uF;
uniform vec3 uZ;
vec2 toStage(vec3 W) { float k = uF / max(uF + W.z, 1.0); vec2 s = uC + (W.xy - uC) * k; return uZ.xy + (s - uZ.xy) * uZ.z; }
vec4 clipW(vec3 W) {   // w = 1/k: perspective-correct varyings
  float w = max(uF + W.z, 1.0) / uF; vec2 st = toStage(W);
  return vec4((st.x / 540.0 - 1.0) * w, (1.0 - st.y / 960.0) * w, 0.0, w);
}`;
// reflected environment: the dark room with its two lamps, or (looking out) the night picture
const ENV = `
uniform vec3 uLamp;
uniform vec3 uLamp2;
uniform sampler2D uBg;
vec3 env(vec3 R, vec3 P) {
  vec3 col = vec3(0.010, 0.009, 0.011);
  col += vec3(0.05, 0.036, 0.026) * clamp(0.25 - R.y, 0.0, 1.0) * clamp(-R.z * 2.0, 0.0, 1.0);
  float c = max(dot(R, normalize(uLamp - P)), 0.0);
  col += vec3(1.0, 0.80, 0.56) * (pow(c, 2600.0) * 28.0 + pow(c, 160.0) * 1.8 + pow(c, 12.0) * 0.07);
  float c2 = max(dot(R, normalize(uLamp2 - P)), 0.0);
  col += vec3(0.62, 0.76, 1.0) * (pow(c2, 900.0) * 3.5 + pow(c2, 40.0) * 0.16);
  if (R.z > 0.02) {
    vec2 q = P.xy + R.xy / R.z * 2200.0;
    col += texture(uBg, clamp(q / vec2(1080.0, 1920.0), 0.0, 1.0)).rgb * smoothstep(0.02, 0.35, R.z);
  }
  return col;
}`;
// a shard vertex: local → in-plane rotation θ → tilt φ about an in-plane axis α → + (x, y, z)
const SHARD_WORLD = `
uniform highp sampler2D uPose;
vec3 shardWorld(int id, vec2 lc, out vec3 N, out vec2 cs, out vec4 q1, out vec4 q2) {
  vec4 q0 = texelFetch(uPose, ivec2(id, 0), 0);
  q1 = texelFetch(uPose, ivec2(id, 1), 0);
  q2 = texelFetch(uPose, ivec2(id, 2), 0);
  float c = cos(q0.z), s = sin(q0.z);
  cs = vec2(c, s);
  vec2 r = vec2(lc.x * c - lc.y * s, lc.x * s + lc.y * c);
  float ca = cos(q1.x), sa = sin(q1.x), cp = cos(q1.y), sp = sin(q1.y);
  vec3 ax = vec3(ca, sa, 0.0), v = vec3(r, 0.0);
  vec3 vr = v * cp + vec3(0.0, 0.0, ca * r.y - sa * r.x) * sp + ax * dot(ax, v) * (1.0 - cp);
  N = vec3(-sa * sp, ca * sp, -cp);
  return vec3(q0.xy, q0.w) + vr;
}`;
const VS_SHARD = `#version 300 es
precision highp float;
${COMMON}
${SHARD_WORLD}
layout(location = 0) in float aId;
layout(location = 1) in vec2 aLocal;
layout(location = 2) in vec4 aE;    // distance to the outer edge (px), position along it, crack arrival at its ends (ms)
layout(location = 3) in vec4 aE2;   // crack travel time along it (ms), outward normal, 0 = frame edge | 1 + brightness
out vec3 vW; out vec3 vN; out vec4 vE; out vec4 vE2; out vec2 vEN; out vec4 vS;
void main() {
  vec3 N; vec2 cs; vec4 q1, q2;
  vec3 W = shardWorld(int(aId + 0.5), aLocal, N, cs, q1, q2);
  gl_Position = clipW(W);
  vW = W; vN = N; vE = aE; vE2 = aE2;
  vEN = vec2(aE2.y * cs.x - aE2.z * cs.y, aE2.y * cs.y + aE2.z * cs.x);
  vS = vec4(q1.z, q1.w, q2.x, q2.y);   // frost, opacity, separated, hash
}`;
const FS_SHARD = `#version 300 es
precision highp float;
precision highp sampler2D;
${COMMON}
${ENV}
uniform sampler2D uScene;
uniform int uMode;      // 0: re-sample the rendered scene behind the pane; 1: sample the night picture
uniform float uTau;     // ms since impact
in vec3 vW; in vec3 vN; in vec4 vE; in vec4 vE2; in vec2 vEN; in vec4 vS;
out vec4 o;
vec3 behind(vec2 off) {
  if (uMode == 0) return texture(uScene, (gl_FragCoord.xy + vec2(off.x, -off.y)) / vec2(1080.0, 1920.0)).rgb;
  vec2 st = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y) + off;
  return texture(uBg, (uZ.xy + (st - uZ.xy) / uZ.z) / vec2(1080.0, 1920.0)).rgb;
}
void main() {
  float d = vE.x, s = clamp(vE.y, 0.0, 1.0), tr = vE2.x;
  float Tf = min(vE.z + s * tr, vE.w + (1.0 - s) * tr);          // when the crack front reached this point
  float open = vE2.w > 0.5 ? step(Tf, uTau) : 1.0;
  float age = max(uTau - Tf, 0.0);
  float sep = vS.z, frost = vS.x;
  vec3 V = normalize(vW - vec3(uC, -uF));
  vec3 n = normalize(vN);
  if (dot(n, V) > 0.0) n = -n;
  float tilt = clamp(length(n.xy), 0.0, 1.0);
  float aa = max(fwidth(d), 1e-3);
  float w = 0.7 + 0.45 * sep + 3.2 * tilt;                        // the edge face shows more when tilted
  float line = open * (1.0 - smoothstep(w - aa, w + aa, d));
  float rim = open * exp(-max(d - w, 0.0) / (2.0 + 2.5 * sep)) * (0.22 + 0.33 * sep);
  float bevel = open * exp(-d / 3.0);
  float cosI = clamp(-dot(V, n), 0.0, 1.0);
  float x = 1.0 - cosI, x2 = x * x;
  float F = 0.04 + 0.96 * x2 * x2 * x;                             // Schlick, n = 1.52
  vec3 R = reflect(V, n);
  vec2 off = n.xy * 26.0 + vEN * bevel * 6.0;                       // tilt displacement + the curved fracture face
  vec3 tb = vec3(behind(off * 0.93).r, behind(off).g, behind(off * 1.09).b);
  vec3 tint = mix(vec3(0.905, 0.962, 0.942), vec3(0.85, 0.94, 0.91), vS.w * sep);
  vec3 col = tb * tint * (1.0 - F) * (1.0 - rim) + env(R, vW) * F;
  vec3 Ld = normalize(uLamp - vW);
  vec3 powder = vec3(0.80, 0.83, 0.85) * (0.10 + 0.55 * max(dot(n, Ld), 0.0)) + tb * 0.3;
  col = mix(col, powder, frost);
  float lit = 0.3 + 0.7 * max(dot(vEN, normalize(uLamp.xy - vW.xy)), 0.0);
  float hot = exp(-age / 0.06);
  float bright = vE2.w > 0.5 ? vE2.w - 1.0 : 1.0;
  vec3 edge = mix(vec3(0.52, 0.92, 0.78), vec3(1.0), 0.4 + 0.45 * hot) * ((0.5 + 1.0 * lit) * mix(bright, 1.0, sep) + 1.4 * hot);
  col = mix(col, edge, line * (0.72 + 0.28 * sep));
  o = vec4(col, vS.y);
}`;
const VS_HAIR = `#version 300 es
precision highp float;
${COMMON}
${SHARD_WORLD}
layout(location = 0) in float aId;
layout(location = 1) in vec2 aLocal;
layout(location = 2) in vec3 aH;    // across (−1..1), arrival (ms), strength
out vec3 vH; out float vOp;
void main() {
  vec3 N; vec2 cs; vec4 q1, q2;
  gl_Position = clipW(shardWorld(int(aId + 0.5), aLocal, N, cs, q1, q2));
  vH = aH; vOp = q1.w;
}`;
const FS_HAIR = `#version 300 es
precision highp float;
uniform float uTau;
in vec3 vH; in float vOp;
out vec4 o;
void main() {
  float open = step(vH.y, uTau), hot = exp(-max(uTau - vH.y, 0.0) / 0.05);
  float pr = clamp(1.0 - abs(vH.x), 0.0, 1.0); pr *= pr;
  o = vec4(mix(vec3(0.6, 0.95, 0.82), vec3(1.0), 0.5 + 0.5 * hot) * (0.8 + 1.2 * hot), pr * open * vH.z * vOp * 0.7);
}`;
const VS_QUAD = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aP;
uniform vec3 uZ;
uniform int uZoomed;
out vec2 vUV;
void main() {
  vec2 st = uZoomed == 1 ? uZ.xy + (aP - uZ.xy) * uZ.z : aP;
  vUV = aP / vec2(1080.0, 1920.0);
  gl_Position = vec4(st.x / 540.0 - 1.0, 1.0 - st.y / 960.0, 0.0, 1.0);
}`;
const FS_QUAD = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uFlip;
in vec2 vUV;
out vec4 o;
void main() { o = texture(uTex, uFlip == 1 ? vec2(vUV.x, 1.0 - vUV.y) : vUV); }`;
const FS_POST = `#version 300 es
precision highp float;
uniform float uFade;
in vec2 vUV;
out vec4 o;
void main() {
  float v = smoothstep(0.38, 1.08, length((vUV - vec2(0.5, 0.45)) * vec2(1.0, 1.7)));
  o = vec4(0.0, 0.0, 0.0, 1.0 - (1.0 - 0.6 * v) * (1.0 - uFade));
}`;
const VS_STAGE = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aP;
layout(location = 1) in vec2 aUV;
layout(location = 2) in vec4 aC;
out vec2 vSt; out vec2 vUV; out vec4 vC;
void main() { vSt = aP; vUV = aUV; vC = aC; gl_Position = vec4(aP.x / 540.0 - 1.0, 1.0 - aP.y / 960.0, 0.0, 1.0); }`;
// the steel ball: a sphere reflecting the room and the night, averaged over 10 instants of an open shutter
const FS_BALL = `#version 300 es
precision highp float;
precision highp sampler2D;
${COMMON}
${ENV}
uniform vec4 uB0;   // stage centre, radius, defocus at shutter open
uniform vec4 uB1;   // … at shutter close
uniform vec3 uBW;   // world centre (for the reflections)
uniform float uBA;
in vec2 vSt; in vec2 vUV; in vec4 vC;
out vec4 o;
void main() {
  vec3 V = normalize(uBW - vec3(uC, -uF));
  vec3 acc = vec3(0.0);
  float cov = 0.0;
  for (int i = 0; i < 10; i++) {
    vec4 b = mix(uB0, uB1, (float(i) + 0.5) / 10.0);
    vec2 q = (vSt - b.xy) / b.z;
    float r = length(q), soft = (0.8 + b.w) / b.z;
    float c = 1.0 - smoothstep(1.0 - soft, 1.0 + soft, r);
    if (c <= 0.0) continue;
    vec2 qq = q / max(r, 1.0);
    float nz = sqrt(max(1.0 - dot(qq, qq), 0.0));
    vec3 n = normalize(vec3(qq, -nz));
    float fr = 1.0 - nz;
    vec3 col = env(reflect(V, n), uBW) * mix(vec3(0.60, 0.64, 0.70), vec3(0.95), fr * fr) + vec3(0.018, 0.02, 0.024);
    acc += col * c; cov += c;
  }
  o = vec4(acc, cov) * (uBA / 10.0);
}`;
const FS_SPRITE = `#version 300 es
precision highp float;
in vec2 vSt; in vec2 vUV; in vec4 vC;
out vec4 o;
void main() {
  vec2 p = vUV;
  float r2 = dot(p, p), ax = abs(p.x), ay = abs(p.y), I;
  if (vC.a < 0.5) I = exp(-r2 * 6.0) * 0.45 + exp(-r2 * 70.0) * 1.3;                     // crack tip / glow
  else I = (exp(-ay * 90.0) * exp(-ax * 3.0) + exp(-ax * 90.0) * exp(-ay * 3.0)) * 0.9  // four-point glint
        + exp(-r2 * 40.0) * 1.4 + exp(-r2 * 7.0) * 0.22;
  I *= clamp(1.0 - max(ax, ay), 0.0, 1.0);
  o = vec4(vC.rgb * I, 0.0);
}`;
// glass dust: ballistic with linear drag in closed form, x(s) = x0 + v0(1 − e^{−ks})/k, gravity → terminal g/k
const VS_DUST = `#version 300 es
precision highp float;
${COMMON}
uniform float uTauS;
layout(location = 0) in vec3 aP;
layout(location = 1) in vec3 aV;
layout(location = 2) in vec4 aK;    // emitted at (s), drag k (1/s), size (px), seed
out float vI; out vec3 vCol;
void main() {
  float dt = uTauS - aK.x, k = aK.y;
  float e = (1.0 - exp(-k * max(dt, 0.0))) / k;
  vec3 W = aP + aV * e;
  W.y += 9810.0 / k * (max(dt, 0.0) - e);
  if (dt <= 0.0 || W.z < -0.75 * uF) { gl_Position = vec4(2.0, 2.0, 0.0, 1.0); gl_PointSize = 1.0; vI = 0.0; vCol = vec3(0.0); return; }
  float kk = uF / max(uF + W.z, 1.0);
  vec2 st = toStage(W);
  gl_Position = vec4(st.x / 540.0 - 1.0, 1.0 - st.y / 960.0, 0.0, 1.0);
  float sz = aK.z * kk * uZ.z, ps = sz + abs(kk - 1.0) * 3.0;     // out of the focal plane → defocused
  gl_PointSize = clamp(ps * 2.2 + 1.5, 1.5, 48.0);
  float h = fract(aK.w * 91.7);
  float tw = max(sin(dt * (30.0 + 170.0 * h) + aK.w * 40.0), 0.0);
  tw *= tw; tw *= tw; tw *= tw;                                     // a facet flashing as the chip turns
  float fade = clamp(dt / 0.0004, 0.0, 1.0) * exp(-dt / 3.0);
  vI = (0.28 + 1.6 * tw) * fade * (sz * sz) / (ps * ps) * (0.55 + 0.45 * min(kk, 1.5));
  vCol = mix(vec3(0.82, 0.92, 1.0), vec3(1.0, 0.86, 0.66), fract(aK.w * 13.3));
}`;
const FS_DUST = `#version 300 es
precision highp float;
in float vI; in vec3 vCol;
out vec4 o;
void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; o = vec4(vCol * vI * exp(-dot(p, p) * 4.0), 0.0); }`;

/* ---------------------------------------------------------------- the demo */
defineDemo({
  id: '37-fracture',
  title: '깨지는 유리',
  tech: '보로노이 파괴 + Rapier2D 물리 미리 굽기',
  duration: D,
  background: '#000',

  async setup(api) {
    const { W, H } = api;
    await RAPIER.init();

    // ---------------- fracture, time remap, physics ----------------
    const frac = buildFracture({ rand, seed: 37, impact: IMPACT, bounds: PANE, crackSpeed: 1500 });
    const { cells, VX, VY, T, segs, Tmax } = frac;
    const TM = timeMap((Tmax / 1000) * 1.03);
    const P = plan(frac, { rand, seed: 371, impact: IMPACT, lateTimes: [6.15, 6.85, 7.45].map(TM.tau) });
    const tau0 = Tmax / 1000 + 0.0002;
    const bk = bake(RAPIER, frac, P, { dt: 1 / 480, tau0, tau1: TM.tau(D) + 0.01, bounds: PANE });
    const n = cells.length;
    const behindKind = (k) => k === KIND.BLOWN || k === KIND.LOOSE;
    const order = cells.map((c, i) => i).sort((a, b) => {
      const ga = behindKind(P[a].kind) ? 0 : 1, gb = behindKind(P[b].kind) ? 0 : 1;
      return ga !== gb ? ga - gb : ga === 0 ? P[b].vz - P[a].vz || a - b : a - b;   // far first
    });
    const slot = new Int32Array(n);
    order.forEach((i, j) => { slot[i] = j; });
    this.stats = { shards: n, Tmax, kinds: P.reduce((m, p) => { m[p.kind] = (m[p.kind] || 0) + 1; return m; }, {}) };

    // ---------------- static geometry ----------------
    // shards: one fan triangle per outline segment, carrying that segment's crack data
    // (is-a-crack is stored as 1 + brightness: some crack faces catch the light better than others)
    const crackBright = (e) => {
      let h = Math.imul(e.a * 7919 + e.b * 104729, 0x9e3779b1) >>> 0;
      h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0;
      return 0.45 + 0.55 * ((h ^ (h >>> 13)) >>> 0) / 4294967296;
    };
    const sv = [];
    const behindVerts = order.filter((i) => behindKind(P[i].kind)).reduce((s, i) => s + cells[i].full.length * 3, 0);
    order.forEach((i, j) => {
      const c = cells[i], m = c.full.length;
      for (let q = 0; q < m; q++) {
        const a = c.full[q], b = c.full[(q + 1) % m], e = c.segE[q];
        const ax = VX[a] - c.cx, ay = VY[a] - c.cy, bx = VX[b] - c.cx, by = VY[b] - c.cy;
        const L = Math.hypot(bx - ax, by - ay) || 1e-6, nx = (by - ay) / L, ny = -(bx - ax) / L;
        const dC = Math.max(0.05, ax * nx + ay * ny);
        const cr = e.crack ? 1 + crackBright(e) : 0, tr = e.crack ? L / e.speed : 0, Ta = e.crack ? T[a] : 0, Tb = e.crack ? T[b] : 0;
        sv.push(j, 0, 0, dC, 0.5, Ta, Tb, tr, nx, ny, cr);
        sv.push(j, ax, ay, 0, 0, Ta, Tb, tr, nx, ny, cr);
        sv.push(j, bx, by, 0, 1, Ta, Tb, tr, nx, ny, cr);
      }
    });
    const shardVerts = sv.length / 11;
    // hairline branches: thin quads in their shard's frame
    const hb = [[], []];
    for (const br of frac.branches) {
      const i = br.cell, c = cells[i], list = hb[behindKind(P[i].kind) ? 0 : 1], j = slot[i];
      for (let q = 0; q < br.pts.length - 1; q++) {
        const [x0, y0, t0] = br.pts[q], [x1, y1, t1] = br.pts[q + 1];
        const l = Math.hypot(x1 - x0, y1 - y0) || 1, hx = (-(y1 - y0) / l) * 0.85, hy = ((x1 - x0) / l) * 0.85;
        const f0 = 1 - (q / (br.pts.length - 1)) * 0.7, f1 = 1 - ((q + 1) / (br.pts.length - 1)) * 0.7;
        const V4 = [[x0 - hx, y0 - hy, -1, t0, f0], [x0 + hx, y0 + hy, 1, t0, f0], [x1 + hx, y1 + hy, 1, t1, f1], [x1 - hx, y1 - hy, -1, t1, f1]];
        for (const k of [0, 1, 2, 0, 2, 3]) { const [x, y, ac, tt, ff] = V4[k]; list.push(j, x - c.cx, y - c.cy, ac, tt, ff); }
      }
    }
    const hairBehind = hb[0].length / 6, hairVerts = (hb[0].length + hb[1].length) / 6;
    // dust: [x, y, z, vx, vy, vz, emitted, drag, size, seed]
    const rd = rand(3707), dust = [];
    for (let i = 0; i < 1500; i++) {                               // crushed cone: a spray, mostly out the far side
      const r = 3 + rd() * 18, a = rd() * TAU2, back = rd() < 0.18, b = rd() * TAU2;
      const vin = (0.4 + rd() * rd() * 6) * 1000 * (back ? 0.6 : 0.5) * (0.3 + rd());
      const vz = back ? -(0.4 + rd() * 2.5) * 1000 : (1.5 + rd() * 9) * 1000;
      dust.push(IMPACT[0] + r * Math.cos(a), IMPACT[1] + r * Math.sin(a), 0, Math.cos(b) * vin, Math.sin(b) * vin, vz,
        rd() * 0.0003, 1.2 + rd() * 6, 0.9 + rd() * 1.8, rd());
    }
    for (let i = 0; i < 900; i++) {                                // chipped off the crack faces as they open
      const s = segs[Math.floor(rd() * segs.length)], f = rd();
      const t = Math.min(s.Ta + f * s.tr, s.Tb + (1 - f) * s.tr) / 1000 + rd() * 0.0004;
      const sp = (0.05 + rd() * 0.5) * 1000, b = rd() * TAU2;
      dust.push(lerp(VX[s.a], VX[s.b], f), lerp(VY[s.a], VY[s.b], f), 0, Math.cos(b) * sp, Math.sin(b) * sp,
        (rd() - 0.5) * 1200, t, 2 + rd() * 5, 0.7 + rd() * 0.9, rd());
    }
    for (let i = 0; i < 600; i++) {                                // fine powder that floats down for a long time
      const r = rd() * 160, a = rd() * TAU2, b = rd() * TAU2, sp = (0.1 + rd() * 0.8) * 1000;
      dust.push(IMPACT[0] + r * Math.cos(a), IMPACT[1] + r * Math.sin(a), 0, Math.cos(b) * sp, Math.sin(b) * sp,
        (rd() - 0.3) * 900, rd() * 0.004, 12 + rd() * 14, 0.5 + rd() * 0.7, rd());
    }
    const dB = [], dF = [];
    for (let i = 0; i < dust.length; i += 10) (dust[i + 5] > 0 ? dB : dF).push(...dust.slice(i, i + 10));
    const dustBehind = dB.length / 10, dustAll = (dB.length + dF.length) / 10;

    // ---------------- WebGL2 ----------------
    const { ctx: gl } = api.canvas({ type: 'webgl2', z: 1, attrs: { alpha: false, antialias: true, preserveDrawingBuffer: true } });
    const hud = api.canvas({ type: '2d', z: 2, attrs: api.headless ? { willReadFrequently: true } : undefined }).ctx;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
      return s;
    };
    const program = (vs, fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
      const u = {};
      for (let k = 0, nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); k < nu; k++) {
        const info = gl.getActiveUniform(p, k);
        u[info.name] = gl.getUniformLocation(p, info.name);
      }
      return { p, u };
    };
    const set = (pr, name, v) => {
      const l = pr.u[name];
      if (l == null) return;
      if (typeof v === 'number') gl.uniform1f(l, v);
      else if (v.length === 2) gl.uniform2fv(l, v);
      else if (v.length === 3) gl.uniform3fv(l, v);
      else gl.uniform4fv(l, v);
    };
    const seti = (pr, name, v) => { if (pr.u[name] != null) gl.uniform1i(pr.u[name], v); };
    const vao = (data, layout, usage = gl.STATIC_DRAW) => {
      const va = gl.createVertexArray(), buf = gl.createBuffer();
      gl.bindVertexArray(va);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const stride = layout.reduce((s, [, size]) => s + size, 0) * 4;
      let off = 0;
      for (const [loc, size] of layout) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off);
        off += size * 4;
      }
      gl.bindVertexArray(null);
      return { va, buf };
    };
    const texture = (src, w, h) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };

    const bgTex = texture(paintNight(W, H, rand(11)));
    const roomTex = texture(paintRoom(W, H, rand(12)));
    const sceneTex = texture(null, W, H);
    const poseData = new Float32Array(n * 12);
    const poseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, poseTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, n, 3, 0, gl.RGBA, gl.FLOAT, poseData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, poseTex);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, roomTex);

    // the scene behind the glass: a multisampled framebuffer resolved into sceneTex
    const rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, Math.min(4, gl.getParameter(gl.MAX_SAMPLES)), gl.RGBA8, W, H);
    const fbMS = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbMS);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);
    const fbRes = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbRes);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const P_SHARD = program(VS_SHARD, FS_SHARD), P_HAIR = program(VS_HAIR, FS_HAIR);
    const P_QUAD = program(VS_QUAD, FS_QUAD), P_POST = program(VS_QUAD, FS_POST);
    const P_BALL = program(VS_STAGE, FS_BALL), P_SPRITE = program(VS_STAGE, FS_SPRITE), P_DUST = program(VS_DUST, FS_DUST);
    for (const pr of [P_SHARD, P_HAIR, P_BALL, P_DUST]) {
      gl.useProgram(pr.p);
      seti(pr, 'uBg', 0); seti(pr, 'uScene', 1); seti(pr, 'uPose', 2);
      set(pr, 'uC', [CAM.cx, CAM.cy]); set(pr, 'uF', CAM.F); set(pr, 'uLamp', LAMP); set(pr, 'uLamp2', LAMP2);
    }
    const G_SHARD = vao(new Float32Array(sv), [[0, 1], [1, 2], [2, 4], [3, 4]]);
    const G_HAIR = vao(new Float32Array([...hb[0], ...hb[1], 0, 0, 0, 0, 0, 0]), [[0, 1], [1, 2], [2, 3]]);
    const G_QUAD = vao(new Float32Array([0, 0, W, 0, W, H, 0, 0, W, H, 0, H]), [[0, 2]]);
    const G_DUST = vao(new Float32Array([...dB, ...dF]), [[0, 3], [1, 3], [2, 4]]);
    const MAXS = 900, spriteData = new Float32Array(MAXS * 6 * 8);
    const G_SPRITE = vao(spriteData, [[0, 2], [1, 2], [2, 4]], gl.DYNAMIC_DRAW);
    const ballData = new Float32Array(6 * 8);
    const G_BALL = vao(ballData, [[0, 2], [1, 2], [2, 4]], gl.DYNAMIC_DRAW);

    // ---------------- per-frame helpers ----------------
    const project = (x, y, z, zoom) => {
      const k = CAM.F / Math.max(CAM.F + z, 1), sx = CAM.cx + (x - CAM.cx) * k, sy = CAM.cy + (y - CAM.cy) * k;
      return [ZC[0] + (sx - ZC[0]) * zoom, ZC[1] + (sy - ZC[1]) * zoom, k];
    };
    const ballAt = (tau) => {
      const s = (tau <= 0 ? V_IN : V_OUT) * tau;
      return [IMPACT[0] + BD[0] * s, IMPACT[1] + BD[1] * s + (tau > 0 ? 0.5 * G * tau * tau : 0), BD[2] * s];
    };
    const wrapA = (a) => (((a + Math.PI) % TAU2) + TAU2) % TAU2 - Math.PI;
    const world = new Float32Array(n * 3), normal = new Float32Array(n * 3), seps = new Float32Array(n), ops = new Float32Array(n);

    // pose of every shard at τ (s): rest → closed-form ballistic → baked table; depth and tilt in closed form
    const poses = (tau) => {
      const f = (tau - bk.tau0) / bk.dt, k0 = clamp(Math.floor(f), 0, bk.steps), k1 = Math.min(bk.steps, k0 + 1), fr = clamp(f - k0, 0, 1);
      const o0 = k0 * n * 3, o1 = k1 * n * 3, pz = bk.pose, msec = tau * 1000;
      for (let j = 0; j < n; j++) {
        const i = order[j], c = cells[i], p = P[i];
        let x = c.cx, y = c.cy, a = 0, z = 0, phi = 0, sep = 0;
        const s = tau - p.rel;
        if (p.kind !== KIND.HELD && s > 0) {
          if (tau < bk.tau0) { x += p.vx * s; y += p.vy * s + 0.5 * G * s * s; a = p.w * s; }
          else {
            x = lerp(pz[o0 + i * 3], pz[o1 + i * 3], fr); y = lerp(pz[o0 + i * 3 + 1], pz[o1 + i * 3 + 1], fr);
            a = pz[o0 + i * 3 + 2] + wrapA(pz[o1 + i * 3 + 2] - pz[o0 + i * 3 + 2]) * fr;
          }
          if (behindKind(p.kind)) { z = p.vz * s; phi = p.tiltRate * s; }
          else phi = p.tiltAmp * Math.sin(p.tiltRate * s) * Math.exp(-s / 0.7);
          sep = clamp(s / 0.004);
        }
        const frost = c.crush ? 0.85 * clamp(msec / 0.05) : 0;
        const op = p.kind === KIND.BLOWN ? 1 - smooth((z - 3500) / 5500) : 1;
        const al = p.axis + a, r0 = j * 4, r1 = (n + j) * 4, r2 = (2 * n + j) * 4;
        poseData[r0] = x; poseData[r0 + 1] = y; poseData[r0 + 2] = a; poseData[r0 + 3] = z;
        poseData[r1] = al; poseData[r1 + 1] = phi; poseData[r1 + 2] = frost; poseData[r1 + 3] = op;
        poseData[r2] = sep; poseData[r2 + 1] = p.hash;
        world[j * 3] = x; world[j * 3 + 1] = y; world[j * 3 + 2] = z;
        const sa = Math.sin(al), ca = Math.cos(al), sp = Math.sin(phi), cp = Math.cos(phi);
        normal[j * 3] = -sa * sp; normal[j * 3 + 1] = ca * sp; normal[j * 3 + 2] = -cp;
        seps[j] = sep; ops[j] = op;
      }
      gl.activeTexture(gl.TEXTURE2);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, n, 3, gl.RGBA, gl.FLOAT, poseData);
    };

    let ns = 0;
    const sprite = (x, y, size, r, g, b, kind) => {
      if (ns >= MAXS) return;
      const o = ns * 48;
      const C = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
      for (let k = 0; k < 6; k++) spriteData.set([x + C[k][0] * size, y + C[k][1] * size, C[k][0], C[k][1], r, g, b, kind], o + k * 8);
      ns++;
    };
    const reflectSpec = (j, L, cam) => {   // how well shard j mirrors light L toward the camera (cos of the miss angle)
      const x = world[j * 3], y = world[j * 3 + 1], z = world[j * 3 + 2];
      let vx = x - cam[0], vy = y - cam[1], vz = z - cam[2];
      const vl = Math.hypot(vx, vy, vz); vx /= vl; vy /= vl; vz /= vl;
      let nx = normal[j * 3], ny = normal[j * 3 + 1], nz = normal[j * 3 + 2];
      const dn = vx * nx + vy * ny + vz * nz;
      if (dn > 0) { nx = -nx; ny = -ny; nz = -nz; }
      const dd = vx * nx + vy * ny + vz * nz;
      const rx = vx - 2 * dd * nx, ry = vy - 2 * dd * ny, rz = vz - 2 * dd * nz;
      let lx = L[0] - x, ly = L[1] - y, lz = L[2] - z;
      const ll = Math.hypot(lx, ly, lz);
      return (rx * lx + ry * ly + rz * lz) / ll;
    };

    const drawBall = (b0, b1, wpos, alpha) => {
      const pad = Math.max(b0[2] + b0[3], b1[2] + b1[3]) + 3;
      const xa = Math.min(b0[0], b1[0]) - pad, xb = Math.max(b0[0], b1[0]) + pad, ya = Math.min(b0[1], b1[1]) - pad, yb = Math.max(b0[1], b1[1]) + pad;
      const C = [[xa, ya], [xb, ya], [xb, yb], [xa, ya], [xb, yb], [xa, yb]];
      C.forEach(([x, y], k) => ballData.set([x, y, 0, 0, 0, 0, 0, 0], k * 8));
      gl.bindBuffer(gl.ARRAY_BUFFER, G_BALL.buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, ballData);
      gl.useProgram(P_BALL.p);
      set(P_BALL, 'uB0', b0); set(P_BALL, 'uB1', b1); set(P_BALL, 'uBW', wpos); set(P_BALL, 'uBA', alpha);
      gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(G_BALL.va);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    // the ball between shutter open and close; `mirror` = its reflection in the pane (image behind the glass)
    const ballShot = (t, tau, zoom, mirror) => {
      const span = TM.rate(t) / 60;                              // 180° shutter at 30 fps, in physical seconds
      let ta = tau - span / 2, tb = tau + span / 2;
      if (tau <= 0) tb = Math.min(tb, 0); else ta = Math.max(ta, 0);
      const A = ballAt(ta), B = ballAt(tb), M = ballAt(tau);
      if (Math.min(A[2], B[2]) < -0.9 * CAM.F) return null;      // still behind the camera
      const fade = tau <= 0 ? smooth((M[2] + 0.9 * CAM.F) / 160) : 1 - smooth((M[2] - 5000) / 3500);
      if (mirror) { A[2] = -A[2]; B[2] = -B[2]; M[2] = -M[2]; }
      const disc = (Q) => {
        const [x, y, k] = project(Q[0], Q[1], Q[2], zoom);
        const coc = Q[2] < 0 ? Math.max(0, k - 1) * 4.5 : (1 - k) * 2;
        return [x, y, BALL_R * k * zoom, coc];
      };
      return { b0: disc(A), b1: disc(B), M, fade };
    };

    const quad = (tex, zoomed, flip, zoom) => {
      gl.useProgram(P_QUAD.p);
      gl.uniform1i(P_QUAD.u.uTex, tex); seti(P_QUAD, 'uZoomed', zoomed); seti(P_QUAD, 'uFlip', flip);
      set(P_QUAD, 'uZ', [ZC[0], ZC[1], zoom]);
      gl.bindVertexArray(G_QUAD.va);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const shards = (first, count, mode, tauMs, zoom) => {
      if (count <= 0) return;
      gl.useProgram(P_SHARD.p);
      seti(P_SHARD, 'uMode', mode); set(P_SHARD, 'uTau', tauMs); set(P_SHARD, 'uZ', [ZC[0], ZC[1], zoom]);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(G_SHARD.va);
      gl.drawArrays(gl.TRIANGLES, first, count);
    };
    const hairs = (first, count, tauMs, zoom) => {
      if (count <= 0) return;
      gl.useProgram(P_HAIR.p);
      set(P_HAIR, 'uTau', tauMs); set(P_HAIR, 'uZ', [ZC[0], ZC[1], zoom]);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
      gl.bindVertexArray(G_HAIR.va);
      gl.drawArrays(gl.TRIANGLES, first, count);
    };
    const dustDraw = (first, count, tau, zoom) => {
      if (count <= 0 || tau <= 0) return;
      gl.useProgram(P_DUST.p);
      set(P_DUST, 'uTauS', tau); set(P_DUST, 'uZ', [ZC[0], ZC[1], zoom]);
      gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
      gl.bindVertexArray(G_DUST.va);
      gl.drawArrays(gl.POINTS, first, count);
    };

    // HUD: a high-speed camera's readout, digits on a fixed grid so they do not jitter
    const commas = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const slowText = (r) => {
      const f = 1 / r;
      const s = f >= 1000 ? commas(Math.round(f / 10) * 10) : f >= 10 ? String(Math.round(f)) : f.toFixed(1);
      return `${s}배 느리게`;
    };
    const timeText = (tau) => {
      const a = Math.abs(tau), s = a < 0.01 ? `${(a * 1000).toFixed(3)} ms` : a < 1 ? `${(a * 1000).toFixed(1)} ms` : `${a.toFixed(3)} s`;
      return tau < 0 ? `충돌 ${s} 전` : `충돌 후 ${s}`;
    };
    const tabText = (str, x, y, align) => {
      const dw = hud.measureText('0').width, ch = [...str];
      const ws = ch.map((c) => (c >= '0' && c <= '9' ? dw : hud.measureText(c).width));
      let cx = align === 'right' ? x - ws.reduce((s, v) => s + v, 0) : x;
      hud.textAlign = 'left';
      ch.forEach((c, k) => { hud.fillText(c, cx + (c >= '0' && c <= '9' ? (dw - hud.measureText(c).width) / 2 : 0), y); cx += ws[k]; });
    };

    // ---------------- the frame ----------------
    this.render = (t) => {
      const tau = TM.tau(t), tauMs = tau * 1000, zoom = zoomOf(t);
      poses(tau);
      gl.viewport(0, 0, W, H);
      gl.enable(gl.BLEND);

      // 1. behind the pane → MSAA buffer → sceneTex
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbMS);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);
      quad(0, 1, 0, zoom);
      gl.enable(gl.BLEND);
      shards(0, behindVerts, 1, tauMs, zoom);
      hairs(0, hairBehind, tauMs, zoom);
      if (tau > 0) {
        const s = ballShot(t, tau, zoom, false);
        if (s && s.fade > 0.003) drawBall(s.b0, s.b1, s.M, s.fade);
      }
      dustDraw(0, dustBehind, tau, zoom);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbMS);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fbRes);
      gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);

      // 2. the pane, the room, what is in front of the pane
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);
      quad(1, 0, 1, zoom);
      gl.enable(gl.BLEND);
      shards(behindVerts, shardVerts - behindVerts, 0, tauMs, zoom);
      hairs(hairBehind, hairVerts - hairBehind, tauMs, zoom);
      if (tau < 0) {                                             // the approaching ball mirrored in the intact pane
        const s = ballShot(t, tau, zoom, true);
        if (s && s.fade > 0.003) drawBall(s.b0, s.b1, s.M, 0.085 * s.fade);
      }
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
      quad(3, 1, 0, zoom);
      if (tau <= 0) {
        const s = ballShot(t, tau, zoom, false);
        if (s && s.fade > 0.003) drawBall(s.b0, s.b1, s.M, s.fade);
      }
      dustDraw(dustBehind, dustAll - dustBehind, tau, zoom);

      // 3. light: crack tips racing outward, the crushed spot, glints off turning shards
      ns = 0;
      if (tauMs > 0 && tauMs < Tmax + 0.02) {
        for (const s of segs) {
          const { Ta, Tb, tr } = s;
          if (tauMs < Math.min(Ta, Tb) || tauMs > (Ta + Tb + tr) / 2 || tr <= 0) continue;
          // a front from each end: from a at fa ≤ meeting point sm, from b at fb ≥ sm
          const sm = (Tb - Ta + tr) / (2 * tr), fa = (tauMs - Ta) / tr, fb = 1 - (tauMs - Tb) / tr;
          for (let side = 0; side < 2; side++) {
            const f = side ? fb : fa;
            if (f < 0 || f > 1 || (side ? f < sm : f > sm)) continue;
            const x = lerp(VX[s.a], VX[s.b], f), y = lerp(VY[s.a], VY[s.b], f);
            const edge = Math.min(x - OPEN.x0, OPEN.x1 - x, y - OPEN.y0, OPEN.y1 - y);
            if (edge < -4) continue;
            const [sx, sy] = project(x, y, 0, zoom);
            const a = 0.9 * smooth((edge + 4) / 40);
            sprite(sx, sy, 15 * zoom, 0.70 * a, 0.92 * a, 1.0 * a, 0);
          }
        }
      }
      if (tau > 0) {
        const I = 1.2 * Math.exp(-tauMs / 0.18) + 0.22 * Math.exp(-tauMs / 3);
        const [sx, sy] = project(IMPACT[0], IMPACT[1], 0, zoom);
        sprite(sx, sy, 70 * zoom, I, I * 0.96, I * 0.9, 0);
        const cam = [CAM.cx, CAM.cy, -CAM.F];
        let glints = 0;
        for (let j = 0; j < n && glints < 70; j++) {
          if (seps[j] < 0.05 || ops[j] < 0.05) continue;
          const c1 = reflectSpec(j, LAMP, cam), c2 = reflectSpec(j, LAMP2, cam);
          const g1 = c1 > 0.9975 ? ((c1 - 0.9975) / 0.0025) ** 2 : 0, g2 = c2 > 0.9985 ? ((c2 - 0.9985) / 0.0015) ** 2 : 0;
          if (g1 + g2 < 0.03) continue;
          const [sx, sy, k] = project(world[j * 3], world[j * 3 + 1], world[j * 3 + 2], zoom);
          const sz = (16 + 46 * Math.sqrt(cells[order[j]].area) / 60) * Math.min(1, k * 1.4) * zoom;
          const a = ops[j];
          sprite(sx, sy, sz, (g1 * 1.0 + g2 * 0.62) * a, (g1 * 0.84 + g2 * 0.78) * a, (g1 * 0.64 + g2 * 1.0) * a, 1);
          glints++;
        }
      }
      if (ns > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, G_SPRITE.buf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, spriteData, 0, ns * 48);
        gl.useProgram(P_SPRITE.p);
        gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
        gl.bindVertexArray(G_SPRITE.va);
        gl.drawArrays(gl.TRIANGLES, 0, ns * 6);
      }

      // 4. vignette and the fades at both ends (the player loops)
      gl.useProgram(P_POST.p);
      set(P_POST, 'uFade', fadeOf(t)); seti(P_POST, 'uZoomed', 0);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
      gl.bindVertexArray(G_QUAD.va);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);

      // 5. readout
      hud.clearRect(0, 0, W, H);
      const ha = smooth((t - 0.45) / 0.6) * (1 - smooth((t - 8.9) / 0.45));
      if (ha > 0) {
        hud.textBaseline = 'alphabetic';
        hud.shadowColor = 'rgba(0,0,0,0.6)'; hud.shadowBlur = 10;
        hud.font = '700 27px "Pretendard Variable", Pretendard, sans-serif';
        hud.fillStyle = `rgba(240,244,250,${(0.86 * ha).toFixed(3)})`;
        tabText(slowText(TM.rate(t)), 72, 82, 'left');
        hud.font = '500 25px "Pretendard Variable", Pretendard, sans-serif';
        hud.fillStyle = `rgba(214,226,240,${(0.72 * ha).toFixed(3)})`;
        tabText(timeText(tau), W - 72, 82, 'right');
        const ca = smooth((t - 2.05) / 0.4) * (1 - smooth((t - 3.55) / 0.4));
        if (ca > 0) {
          hud.font = '500 23px "Pretendard Variable", Pretendard, sans-serif';
          hud.fillStyle = `rgba(186,236,220,${(0.8 * ca * ha).toFixed(3)})`;
          tabText('균열 끝이 달리는 속도 ≈ 1,500 m/s', 72, 120, 'left');
        }
        hud.shadowBlur = 0;
      }
    };
  },

  frame(t) { this.render(t); },
});
