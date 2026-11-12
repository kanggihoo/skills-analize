/*
 * 02 · 펼쳐지는 종이 마을 — a pop-up book opens on a desk at dusk and a paper village stands up. Pure DOM + CSS 3D.
 *
 *   .cam (perspective; perspective-origin = the camera) → .world (rotateX = desk tilt, translateZ = dolly)
 *     → nested preserve-3d hinge nodes; each node's transform-origin lies on its fold line:
 *        far page   rotateX(−φ) about the gutter                    closed 180° → standing 98°
 *        hills      rotateX(−180° + a) about their base             parallel folds: they stand as the page does
 *        house      rotateZ(yaw) rotateX(…) → side wall rotateY(180°→90°) (a V-fold opening)
 *                   → roof panels rotateZ(gable slope) rotateX(−175°→−90°) (lids closing onto the gable)
 *        tree       rotateX(…) → crossing card rotateY(0°→90°)
 *   Cards are printed paper: a grain texture multiplied over CSS-gradient / canvas-painted artwork, cut to shape
 *   with clip-path (pentagon facades, arched bridge, scalloped clouds, hill silhouettes, trees), with lettering.
 *   Lighting: for every printed card the hinge chain is composed into a world normal n, and
 *       brightness = ambient + sun·max(0, n·Ls) + lamp·max(0, n·Ll),  warmth = lamp·max(0, n·Ll)
 *   becomes the card's filter: brightness() saturate() sepia(). A filter is applied by the compositor to the
 *   rasterised card, so re-lighting never repaints a 3-D layer (repainting 3-D layers every frame flickers:
 *   the compositor may show a card before its new tiles exist). Paper is two-sided: the light of the front and
 *   the back are blended as the card turns edge-on, so a turning card never pops.
 *   Windows, lantern bulbs, light pools and stars are emissive cards whose opacity rises at dusk.
 * Every transform, filter and opacity is a pure function of t. No CSS transitions or animations.
 */
import { defineDemo, track, ease, clamp, lerp, ramp, rand } from '../_lib/stage.js';

const D = 9.6;
const PAGE_Z = 16;                       // page block thickness above the board
const X0 = 70, W = 940;                  // page left edge and width (desk units)
const GY = 1030, DN = 700, DF = 700;     // gutter line, near / far page depth
// cards lying on the page: shadows, then window spill, then lantern pools — parallel planes kept ≥ 2 px apart
// (closer than that, the 3-D depth sort of overlapping sheets can flicker)
const Z_SHADOW = PAGE_Z + 2, Z_SPILL = PAGE_Z + 4, Z_POOL = PAGE_Z + 6;

// ---------- 3-D math for normals (CSS convention: x right, y down, z toward the viewer) ----------
const rad = (d) => d * Math.PI / 180;
const mul = (a, b) => [0, 1, 2].map((i) => [0, 1, 2].map((j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]));
function rot(axis, deg) {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  if (axis === 'rx') return [[1, 0, 0], [0, c, -s], [0, s, c]];
  if (axis === 'ry') return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}
const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// ---------- scene graph ----------
const NODES = [], CARDS = [];
class Node {
  /** a positioned element; ops = [['t', x, y, z] | ['rx' | 'ry' | 'rz', deg], …] is set per frame */
  constructor(parent, { x = 0, y = 0, w = 0, h = 0, origin = '0 0', cls = 'n', css = '' } = {}) {
    this.parent = parent instanceof Node ? parent : null;
    this.el = document.createElement('div');
    this.el.className = cls;
    this.el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:${origin};${css}`;
    (parent instanceof Node ? parent.el : parent).appendChild(this.el);
    this.ops = [];
    this.key = '';
    this.R = I3;
    NODES.push(this);
  }
  set(...ops) { this.ops = ops; return this; }
  /** world rotation (parents come before children in NODES, so one pass per frame suffices) + the transform */
  update() {
    let m = this.parent ? this.parent.R : I3;
    for (const o of this.ops) if (o[0] !== 't') m = mul(m, rot(o[0], o[1]));
    this.R = m;
    const tr = this.ops.map((o) => (o[0] === 't' ? `translate3d(${o[1].toFixed(2)}px,${o[2].toFixed(2)}px,${o[3].toFixed(2)}px)`
      : `${o[0] === 'rx' ? 'rotateX' : o[0] === 'ry' ? 'rotateY' : 'rotateZ'}(${o[1].toFixed(3)}deg)`)).join(' ');
    if (tr !== this.key) { this.key = tr; this.el.style.transform = tr || 'none'; }
  }
}
const hinge = (parent, x, y, w, h, origin) => new Node(parent, { x, y, w, h, origin });

// ---------- paper ----------
let GRAIN = '';
function canvasArt(w, h, paint) {          // painted once in setup (CPU canvas) → PNG data URL
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  paint(c.getContext('2d', { willReadFrequently: true }), w, h);
  return `url(${c.toDataURL('image/png')})`;
}
function grainArt() {
  return canvasArt(256, 256, (g) => {
    const r = rand(7), img = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) {
      const v = 236 + r() * 19 + (r() < 0.02 ? -18 : 0);     // paper tooth + the odd fibre fleck
      img.data[i * 4] = v; img.data[i * 4 + 1] = v - 2; img.data[i * 4 + 2] = v - 6; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
}
/**
 * a card: x, y, w, h in the parent's plane. art = CSS background(s) printed under the paper grain;
 * clip = clip-path; html = printed details; kind 'lit' (lit by its normal) | 'glow' (emissive) | 'face'
 * (a lit, one-sided sheet). z lifts it off the parent plane, rz spins it about its centre.
 */
function card(parent, x, y, w, h, art, { clip = '', html = '', kind = 'lit', z = 0, rz = 0, css = '', grain = true } = {}) {
  const bg = kind === 'glow' || !grain ? `background:${art};` : `background:${GRAIN} 0 0/256px 256px,${art};background-blend-mode:multiply;`;
  const c = new Node(parent, { x, y, w, h, origin: '50% 50%', cls: kind === 'face' ? 'card face' : 'card',
    css: bg + (clip ? `clip-path:${clip};` : '') + css });
  if (html) c.el.innerHTML = html;
  c.kind = kind;
  CARDS.push(c);
  const ops = [];
  if (z) ops.push(['t', 0, 0, z]);
  if (rz) ops.push(['rz', rz]);
  return c.set(...ops);
}
const flat = (c) => `linear-gradient(${c}, ${c})`;
const glowGrad = (rgb, a, stop = 70) => `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${rgb},${a}), rgba(${rgb},${(a * 0.35).toFixed(2)}) ${stop * 0.6}%, rgba(${rgb},0) ${stop}%)`;

const smooth01 = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
/** a piece's printed cards appear as it turns the first 12° up off the page */
function reveal(cards, angle) {
  const v = clamp(angle / 12), o = v >= 1 ? '1' : v.toFixed(3);
  for (const c of cards) put(c.el, 'opacity', o);
}
/** write a style value only when it changes */
function put(el, k, v) {
  const key = '__' + k;
  if (el[key] === v) return;
  el[key] = v;
  if (k.startsWith('--')) el.style.setProperty(k, v); else el.style[k] = v;
}

defineDemo({
  id: '02-css-popup',
  title: '펼쳐지는 종이 마을',
  tech: 'CSS 3D 변형 · perspective + preserve-3d',
  duration: D,
  background: '#140e0b',
  async setup({ stage }) {
    // every face that is printed must be loaded before the first frame (the cover uses both weights)
    await Promise.all([document.fonts.load('700 110px Gaegu', '종이마을빵책꽃'), document.fonts.load('400 44px Gaegu', '펼쳐 보세요')]);
    GRAIN = grainArt();

    // ======== the desk: plain 2-D paint (wood, the book's shadow, the lamp pool, dusk) — repainted per frame ========
    this.desk = document.createElement('div');
    this.desk.style.cssText = 'position:absolute;inset:0';
    this.deskWood = `radial-gradient(ellipse 48% 22% at 50% 66%, rgba(0,0,0,.55), rgba(0,0,0,0) 100%),
      radial-gradient(ellipse 70% 45% at 50% 52%, rgba(120,80,50,.35), rgba(0,0,0,0) 70%),
      repeating-linear-gradient(94deg, rgba(0,0,0,.10) 0 3px, rgba(0,0,0,0) 3px 11px, rgba(255,220,180,.025) 11px 13px, rgba(0,0,0,0) 13px 29px),
      linear-gradient(180deg, #2c1e16, #3a271c 55%, #24170f)`;
    stage.appendChild(this.desk);

    // ======== camera + world ========
    const cam = document.createElement('div');
    cam.className = 'cam';
    stage.appendChild(cam);
    this.cam = cam;
    const world = new Node(cam, { x: 0, y: 0, w: 1080, h: 1920, origin: '540px 1180px', cls: 'world' });
    this.world = world;

    // ======== the book: cloth board rim, page block edge, the near page (meadow, river, path) ========
    const cloth = 'radial-gradient(ellipse at 40% 35%, #7a3b30, #4e2520)';
    for (const [x, y, w, h] of [[X0 - 16, GY, 16, DN + 16], [X0 + W, GY, 16, DN + 16], [X0, GY + DN, W, 16]]) card(world, x, y, w, h, cloth, { z: 2 });
    const edge = hinge(world, X0, GY + DN - PAGE_Z, W, PAGE_Z, '50% 100%').set(['t', 0, 0, 2], ['rx', -90]);
    card(edge, 0, 0, W, PAGE_Z, 'repeating-linear-gradient(180deg,#f3ead8 0 2px,#d9cdb6 2px 3px)', { grain: false });
    card(world, X0, GY, W, DN, this.nearArt(), { z: PAGE_Z });

    // ======== far page, hinged on the gutter: the dusk sky inside, the cloth cover outside ========
    const far = hinge(world, X0, GY - DF, W, DF, '50% 100%');
    this.far = far;
    card(far, 0, 0, W, DF, this.skyArt(), { kind: 'face' });
    const cover = hinge(far, -16, -16, W + 32, DF + 16, '50% 50%').set(['t', 0, 0, -(PAGE_Z - 2)], ['ry', 180]);
    card(cover, 0, 0, W + 32, DF + 16, cloth, { kind: 'face', css: 'border-radius:6px 6px 0 0;overflow:hidden;',
      // closed, the far page lies upside down, so the lettering is printed rotated by 180°
      html: `<div style="position:absolute;inset:0;transform:rotate(180deg);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#d8b46a;font-family:Gaegu">
        <div style="position:absolute;inset:44px;border:3px solid rgba(216,180,106,.75)"></div>
        <div style="position:absolute;inset:56px;border:1px solid rgba(216,180,106,.5)"></div>
        <div style="font-weight:700;font-size:118px;letter-spacing:.06em;text-shadow:0 3px 0 rgba(40,10,5,.45)">종이 마을</div>
        <div style="width:300px;height:3px;margin:14px 0 18px;background:linear-gradient(90deg,transparent,#d8b46a,transparent)"></div>
        <div style="font-size:44px;opacity:.85">펼쳐 보세요</div></div>` });
    // pop-out layers on foam pads: the sun (slides down its slot at dusk), the moon, clouds; stars printed glow
    this.sun = card(far, 600, 170, 130, 130, 'radial-gradient(circle at 40% 38%, #ffd9a0, #f4a65f 60%, #e48a4c)', { clip: 'circle(50%)' });
    this.moon = card(far, 170, 190, 96, 96, 'radial-gradient(circle at 38% 36%, #fffaf0, #efe2be 70%, #e2d2a6)', { clip: 'circle(50%)', kind: 'glow' });
    this.clouds = [[110, 120, 250, 70, 1], [520, 330, 300, 80, 2], [720, 70, 210, 60, 3]].map(([x, y, w, h, s], i) =>
      ({ c: card(far, x, y, w, h, 'linear-gradient(#fff8ec,#eadfcd)', { clip: `path('${cloudPath(w, h, s)}')` }), i }));
    this.stars = card(far, 0, 0, W, 330, this.starArt(), { kind: 'glow', z: 2 });

    // ======== near page: two parallel-fold hill ranges ========
    this.hills = [{ y: GY + 40, h: 250, col: ['#8fa37c', '#6f8662'], seed: 3, lag: 0 }, { y: GY + 120, h: 190, col: ['#a3b47f', '#82976a'], seed: 9, lag: 0.12 }].map((o) => {
      const n = hinge(world, X0 + 4, o.y - o.h, W - 8, o.h, '50% 100%');
      const r = rand(o.seed), ph = [r() * 6, r() * 6, r() * 6];
      const pts = [];
      for (let x = 0; x <= W - 8; x += 12) {
        const u = x / (W - 8);
        const wob = Math.sin(x * 0.024 + ph[0]) * 0.6 + Math.sin(x * 0.059 + ph[1]) * 0.3 + Math.sin(x * 0.134 + ph[2]) * 0.1;
        pts.push(`${x}px ${Math.max(6, o.h * (0.18 + 0.32 * (1 - Math.sin(Math.PI * u) ** 0.6) + 0.22 * wob + 0.12 * Math.sin(u * 11 + o.seed))).toFixed(1)}px`);
      }
      card(n, 0, 0, W - 8, o.h, `linear-gradient(180deg, ${o.col[0]}, ${o.col[1]})`, { clip: `polygon(0 100%,${pts.join(',')},100% 100%)` });
      return { n, ...o };
    });

    // ======== houses, trees, the bridge, lanterns ========
    const HOUSES = [ // x, base y, width, wall h, gable h, depth, yaw, wall, roof, delay, sign
      [250, GY + 250, 130, 92, 58, 90, 12, '#f1e3c6', '#b5533c', 0.0, '빵'], [520, GY + 215, 112, 84, 52, 80, -6, '#e8d9b8', '#5f6f8a', 0.12, ''],
      [770, GY + 270, 150, 100, 62, 95, -14, '#f4e8cf', '#a5643c', 0.22, '책'], [380, GY + 430, 120, 88, 54, 86, 8, '#efe1c2', '#7d4c3a', 0.45, ''],
      [705, GY + 470, 136, 96, 60, 92, -10, '#f2e5c9', '#b5533c', 0.6, '꽃']];
    this.houses = HOUSES.map(([x, y, w, hw, hg, dd, yaw, wall, roof, delay, sign], i) => this.house(world, { x, y, w, hw, hg, dd, yaw, wall, roof, delay, sign, seed: i + 1 }));
    const TREES = [[140, GY + 210, 1.0, 0, 0.05], [655, GY + 205, 0.9, 1, 0.15], [900, GY + 230, 1.15, 0, 0.25],
      [190, GY + 470, 1.2, 1, 0.5], [560, GY + 540, 0.85, 0, 0.62], [880, GY + 520, 1.0, 1, 0.75], [470, GY + 300, 0.75, 1, 0.35]];
    this.trees = TREES.map(([x, y, s, kind, delay], i) => this.tree(world, { x, y, s, kind, delay, seed: 20 + i }));
    { // an arched stone bridge over the printed river, with a railing card just in front
      const bw = 240, bh = 92;
      const n = hinge(world, X0 + 400 - bw / 2, GY + 388 - bh, bw, bh, '50% 100%');
      card(n, 0, 0, bw, bh, 'linear-gradient(#d9ccb2 0 30%,#b9a789)', { clip: `path('M0 ${bh}L0 30Q${bw / 2} 8 ${bw} 30L${bw} ${bh}L${bw - 40} ${bh}Q${bw / 2} 22 40 ${bh}Z')` });
      let posts = '';
      for (let i = 0; i <= 10; i++) { const u = i / 10, px = 6 + u * (bw - 12), py = 30 - 22 * Math.sin(Math.PI * u); posts += `<div style="position:absolute;left:${(px - 2).toFixed(1)}px;top:${(py - 17).toFixed(1)}px;width:4px;height:18px;background:#9a7d60"></div>`; }
      card(n, 0, 0, bw, bh, 'transparent', { kind: 'glow', z: 3, css: 'overflow:visible;',
        html: posts + `<svg width="${bw}" height="${bh}" style="position:absolute;left:0;top:0;overflow:visible"><path d="M0 14Q${bw / 2} -30 ${bw} 14" fill="none" stroke="#9a7d60" stroke-width="4"/></svg>` });
      this.bridge = n;
    }
    this.lanterns = [[X0 + 248, GY + 548, 7.0], [X0 + 542, GY + 318, 7.3], [X0 + 810, GY + 395, 7.6]].map(([x, y, on], i) => {
      const n = hinge(world, x - 12, y - 130, 24, 130, '50% 100%');
      card(n, 10, 22, 4, 108, flat('#4a3a30'));
      card(n, 2, 4, 20, 24, flat('#5a4636'), { z: 3, css: 'border-radius:4px 4px 2px 2px;' });      // cap: in front of the post
      const head = card(n, -38, -32, 100, 100, 'radial-gradient(circle at 50% 50%, #fff3c8 0 9%, rgba(255,205,120,.75) 12%, rgba(255,170,80,.22) 34%, rgba(255,160,70,0) 62%)', { kind: 'glow', z: 6 });
      const pool = card(world, x - 110, y - 80, 220, 150, glowGrad('255,190,105', 0.55, 75), { kind: 'glow' });
      return { n, head, pool, on, delay: 0.55 + i * 0.12 };
    });

    this.lights = { sun: norm([-0.55, 0.5, 0.68]), lamp: norm([0.62, 0.62, 0.48]) };
    // every piece shows itself only once it has turned ~12° up off the page: lying folded it would be a sheet
    // coplanar with the page and with the other folded pieces, which the compositor's depth sort cannot order
    const printed = (node) => CARDS.filter((c) => c.kind !== 'glow' && node.el.contains(c.el));
    for (const p of [...this.hills, ...this.houses, ...this.trees, ...this.lanterns]) p.cards = printed(p.n || p.root);
    this.bridgeCards = printed(this.bridge);
    // every printed image is decoded before the first frame
    const urls = new Set();
    for (const c of CARDS) for (const m of c.el.style.background.matchAll(/url\("?([^")]+)"?\)/g)) urls.add(m[1]);
    await Promise.all([...urls].map((u) => { const im = new Image(); im.src = u; return im.decode().catch(() => {}); }));
  },

  // ---------- builders ----------
  nearArt() {
    return canvasArt(W, DN, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#b9c592'); grd.addColorStop(1, '#a3b37d');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      const r = rand(31);
      for (let i = 0; i < 26; i++) { // soft field patches
        g.fillStyle = `rgba(${r() < 0.5 ? '120,140,90' : '210,200,150'},${(0.06 + r() * 0.08).toFixed(2)})`;
        g.beginPath(); g.ellipse(r() * w, r() * h, 60 + r() * 140, 20 + r() * 40, (r() - 0.5) * 0.6, 0, Math.PI * 2); g.fill();
      }
      // the river: from the back-left to the front-right, under the bridge at (400, 388)
      const river = (wd) => { g.beginPath(); g.moveTo(-40, 120); g.bezierCurveTo(200, 160, 260, 380, 400, 388); g.bezierCurveTo(560, 396, 600, 560, 760, 640); g.lineTo(820, h + 40); g.lineWidth = wd; g.stroke(); };
      g.lineCap = 'round';
      g.strokeStyle = '#8aa39a'; river(92);
      g.strokeStyle = '#7d9fb0'; river(70);
      g.strokeStyle = 'rgba(240,248,250,.5)'; g.setLineDash([18, 26]); river(4); g.setLineDash([]);
      g.strokeStyle = 'rgba(236,224,196,.75)'; g.lineWidth = 14;                     // a footpath
      g.beginPath(); g.moveTo(180, h + 20); g.bezierCurveTo(240, 520, 330, 470, 380, 430); g.bezierCurveTo(470, 360, 560, 300, 700, 300); g.stroke();
      g.strokeStyle = 'rgba(80,100,60,.35)'; g.lineWidth = 1.5;                       // printed grass ticks
      for (let i = 0; i < 220; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - 5 - r() * 5); g.stroke(); }
    });
  },
  skyArt() {
    return canvasArt(W, DF, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#5d6a9a'); grd.addColorStop(0.45, '#b98aa0'); grd.addColorStop(0.8, '#f0b98e'); grd.addColorStop(1, '#f6d2a6');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(120,110,150,.35)';                                          // a faint printed distant range
      g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 10) g.lineTo(x, h - 150 - 50 * Math.sin(x * 0.012 + 1) - 30 * Math.sin(x * 0.031));
      g.lineTo(w, h); g.fill();
    });
  },
  starArt() {
    return canvasArt(W, 330, (g, w, h) => {
      const r = rand(5);
      for (let i = 0; i < 70; i++) {
        const x = r() * w, y = r() * h, s = 1 + r() * 2.2;
        const grd = g.createRadialGradient(x, y, 0, x, y, s * 4);
        grd.addColorStop(0, 'rgba(255,245,220,.95)'); grd.addColorStop(0.3, 'rgba(255,230,190,.35)'); grd.addColorStop(1, 'rgba(255,230,190,0)');
        g.fillStyle = grd; g.fillRect(x - s * 4, y - s * 4, s * 8, s * 8);
      }
    });
  },
  house(world, { x, y, w, hw, hg, dd, yaw, wall, roof, delay, sign, seed }) {
    const r = rand(seed), H = hw + hg;
    const root = hinge(world, x - w / 2, y - H, w, H, '50% 100%');
    // facade: a pentagon of card with a printed door, windows, a round attic window and a shop sign
    const doorX = w * (0.3 + r() * 0.3);
    const wins = [[w * 0.18, hg + 18], [w * 0.68, hg + 18]].filter((p) => Math.abs(p[0] + 9 - doorX - 11) > 26);
    let html = `<div style="position:absolute;left:${doorX}px;bottom:0;width:22px;height:38px;background:#6b4a36;border-radius:11px 11px 0 0"></div>`;
    for (const [wx, wy] of wins) html += `<div style="position:absolute;left:${wx}px;top:${wy}px;width:20px;height:22px;background:#3d4660;border:2px solid #fff5e0"></div>`;
    html += `<div style="position:absolute;left:${w / 2 - 8}px;top:${hg * 0.45}px;width:16px;height:16px;border-radius:50%;background:#3d4660;border:2px solid #fff5e0"></div>`;
    if (sign) html += `<div style="position:absolute;left:${w / 2 - 22}px;top:${hg + 2}px;width:44px;font:700 22px/1 Gaegu;color:#5a3020;text-align:center">${sign}</div>`;
    card(root, 0, 0, w, H, flat(wall), { clip: `polygon(0 ${hg}px, 50% 0, 100% ${hg}px, 100% 100%, 0 100%)`, html });
    // the same windows, lit from inside: an emissive card just in front of the facade
    let glow = '';
    for (const [wx, wy] of wins) glow += `<div style="position:absolute;left:${wx - 22}px;top:${wy - 22}px;width:68px;height:70px;background:radial-gradient(circle, rgba(255,214,140,.55), rgba(255,170,80,0) 60%)"></div><div style="position:absolute;left:${wx + 2}px;top:${wy + 2}px;width:20px;height:22px;background:#ffd48a"></div>`;
    glow += `<div style="position:absolute;left:${w / 2 - 6}px;top:${hg * 0.45 + 2}px;width:16px;height:16px;border-radius:50%;background:#ffd48a"></div>`;
    const lit = card(root, 0, 0, w, H, 'transparent', { kind: 'glow', z: 3, html: glow, css: 'opacity:0;' });
    // side wall on a hinge at the facade's right edge: folded back flat (180°) → square to the facade (90°)
    const sideHinge = hinge(root, w, hg, dd, hw, '0 50%');
    card(sideHinge, 0, 0, dd, hw, flat(wall), { html: `<div style="position:absolute;left:${dd * 0.35}px;top:18px;width:18px;height:20px;background:#3d4660;border:2px solid #fff5e0"></div>` });
    // roof panels hinged on the gable edges (left eave → apex, apex → right eave): lids closing onto the house
    const L = Math.hypot(w / 2, hg) + 14, aL = Math.atan2(-hg, w / 2) * 180 / Math.PI, aR = Math.atan2(hg, w / 2) * 180 / Math.PI;
    const roofL = hinge(root, 0, hg, L, dd + 10, '0 0'), roofR = hinge(root, w / 2, 0, L, dd + 10, '0 0');
    const tiles = `repeating-linear-gradient(90deg, ${roof} 0 16px, rgba(0,0,0,.1) 16px 18px), repeating-linear-gradient(0deg, ${roof} 0 20px, rgba(0,0,0,.06) 20px 22px), ${roof}`;
    card(roofL, -10, -4, L, dd + 10, tiles);
    card(roofR, -4, -4, L, dd + 10, tiles);
    // on the page: a soft contact shadow and, at dusk, the windows' light spilling onto the ground
    const sh = card(world, x - w * 0.75, y - dd - 20, w * 1.5, dd + 60, glowGrad('30,30,10', 0.35), { kind: 'glow', css: 'opacity:0;' });
    const spill = card(world, x - 95, y - 10, 190, 110, 'radial-gradient(ellipse 50% 45% at 50% 30%, rgba(255,190,105,.42), rgba(255,170,80,0) 72%)', { kind: 'glow', css: 'opacity:0;' });
    return { root, lit, sideHinge, roofL, roofR, sh, spill, yaw, aL, aR, delay, light: 6.6 + r() * 1.6 };
  },
  tree(world, { x, y, s, kind, delay, seed }) {
    const r = rand(seed), w = 90 * s, hgt = 150 * s, tw = 8 * s, th = 30 * s;
    const root = hinge(world, x - w / 2, y - hgt, w, hgt, '50% 100%');
    // round deciduous (0) or layered conifer (1), trunk included, as one clip path
    const path = kind === 0
      ? `M${w / 2 - tw / 2} ${hgt} L${w / 2 - tw / 2} ${w / 2 + 4 + w * 0.3} A${w / 2} ${w / 2} 0 1 1 ${w / 2 + tw / 2} ${w / 2 + 4 + w * 0.3} L${w / 2 + tw / 2} ${hgt}Z`
      : `M${w / 2 - tw / 2} ${hgt} L${w / 2 - tw / 2} ${hgt - th} L4 ${hgt - th} L${w * 0.3} ${hgt * 0.5} L${w * 0.12} ${hgt * 0.52} L${w / 2} 0 L${w * 0.88} ${hgt * 0.52} L${w * 0.7} ${hgt * 0.5} L${w - 4} ${hgt - th} L${w / 2 + tw / 2} ${hgt - th} L${w / 2 + tw / 2} ${hgt}Z`;
    const green = kind === 0 ? ['#7f9c5e', '#5d7a48'] : ['#557a5a', '#3f5f47'], cut = ((hgt - th) / hgt * 100).toFixed(0);
    const art = `linear-gradient(180deg, ${green[0]} 0%, ${green[1]} ${cut}%, #6b4a36 ${cut}%)`;
    card(root, 0, 0, w, hgt, art, { clip: `path('${path}')` });
    const cross = hinge(root, 0, 0, w, hgt, '50% 50%');
    card(cross, 0, 0, w, hgt, art, { clip: `path('${path}')` });
    const sh = card(world, x - w * 0.6, y - 40 * s, w * 1.2, 70 * s, glowGrad('30,30,10', 0.32), { kind: 'glow', css: 'opacity:0;' });
    return { root, cross, sh, yaw: (r() - 0.5) * 30, delay };
  },

  frame(t) {
    // ---------- story clock ----------
    const phi = track([[0.45, 180], [2.7, 98, ease.inOutCubic], [3.1, 100, ease.inOutCubic]])(t);   // far page angle
    const open = clamp((180 - phi) / 80);
    const dusk = ramp(t, 4.0, 8.0), lamp = ramp(t, 6.0, 8.4);
    // the loop: everything rises out of the dark at the start and sinks back into it at the very end
    const dark = Math.max(1 - ramp(t, 0, 0.45), ramp(t, D - 0.4, D)), up = 1 - 0.88 * dark;

    // ---------- camera: high and wide → lower and closer ----------
    const tilt = track([[0, 62], [3.0, 57], [D, 47, ease.inOutCubic]])(t);
    const dolly = track([[0, -300], [2.8, -40, ease.inOutCubic], [D, 150, ease.inOutCubic]])(t);
    const lift = track([[0, -230], [3.0, -210], [D, -250, ease.inOutCubic]])(t);
    put(this.cam, 'perspectiveOrigin', '540px 900px');
    this.world.set(['t', 0, lift, dolly], ['rx', tilt]);

    // ---------- the far page and what is mounted on it ----------
    this.far.set(['t', 0, 0, PAGE_Z], ['rx', -phi]);
    const pad = 4 + 26 * ease.outCubic(open);                 // foam pads spring up as the page opens
    this.sun.set(['t', 0, 300 * ease.inOutCubic(ramp(t, 4.2, 9.0)), pad * 0.5]);
    this.moon.set(['t', 0, 120 * (1 - ease.outCubic(ramp(t, 6.0, 9.4))) + 40, pad * 0.4]);
    put(this.moon.el, 'opacity', (ramp(t, 6.0, 7.2) * up).toFixed(3));
    for (const { c, i } of this.clouds) c.set(['t', 14 * Math.sin(t * 0.35 + i * 2) + 6 * t * (i % 2 ? -1 : 1), 0, pad * (0.8 + 0.25 * i)]);
    put(this.stars.el, 'opacity', (ease.inOutCubic(ramp(t, 6.4, 8.8)) * up).toFixed(3));

    // ---------- parallel folds stand with the page ----------
    for (const hl of this.hills) {
      const a = 90 * ease.inOutCubic(clamp((open - hl.lag) / (1 - hl.lag)));
      hl.n.set(['t', 0, 0, PAGE_Z + 0.4], ['rx', -180 + a]);
      reveal(hl.cards, a);
    }

    // ---------- houses: stand up, side wall swings out of the V-fold, roof panels close ----------
    for (const hs of this.houses) {
      const t0 = 1.35 + hs.delay * 2.4;
      const rise = ease.outBack(clamp((t - t0) / 0.75), 1.1);
      const unfold = ease.inOutCubic(clamp((t - t0 - 0.35) / 0.7));
      const roof = ease.outBack(clamp((t - t0 - 0.45) / 0.75), 1.3);
      hs.root.set(['t', 0, 0, PAGE_Z + 0.6], ['rz', hs.yaw], ['rx', -180 + 90 * rise]);
      reveal(hs.cards, 90 * rise);
      hs.sideHinge.set(['ry', 176 - 86 * unfold]);        // folded 4° off the facade's back, never flat on it
      hs.roofL.set(['rz', hs.aL], ['rx', -90 - 85 * (1 - roof)]);
      hs.roofR.set(['rz', hs.aR], ['rx', -90 - 85 * (1 - roof)]);
      hs.sh.set(['t', 0, 0, Z_SHADOW]);
      put(hs.sh.el, 'opacity', (clamp(rise) * (1 - 0.5 * dusk) * up).toFixed(3));
      const on = (ease.outCubic(ramp(t, hs.light, hs.light + 0.5)) * up).toFixed(3);
      put(hs.lit.el, 'opacity', on);
      hs.spill.set(['t', 0, 0, Z_SPILL]);
      put(hs.spill.el, 'opacity', on);
    }
    // ---------- trees: a card stands, its crossing card swings round ----------
    for (const tr of this.trees) {
      const t0 = 1.5 + tr.delay * 2.4;
      const rise = ease.outBack(clamp((t - t0) / 0.7), 1.2);
      tr.root.set(['t', 0, 0, PAGE_Z + 0.6], ['rz', tr.yaw], ['rx', -180 + 90 * rise]);
      reveal(tr.cards, 90 * rise);
      tr.cross.set(['ry', 8 + 82 * ease.inOutCubic(clamp((t - t0 - 0.3) / 0.6))]);   // never exactly on its twin
      tr.sh.set(['t', 0, 0, Z_SHADOW]);
      put(tr.sh.el, 'opacity', (clamp(rise) * (1 - 0.5 * dusk) * up).toFixed(3));
    }
    const bridgeUp = 90 * ease.outBack(clamp((t - 2.6) / 0.7), 1.1);
    this.bridge.set(['t', 0, 0, PAGE_Z + 0.6], ['rx', -180 + bridgeUp]);
    reveal(this.bridgeCards, bridgeUp);
    for (const ln of this.lanterns) {
      const lnUp = 90 * ease.outBack(clamp((t - 1.5 - ln.delay * 2.4) / 0.7), 1.2);
      ln.n.set(['t', 0, 0, PAGE_Z + 0.6], ['rx', -180 + lnUp]);
      reveal(ln.cards, lnUp);
      const on = (ease.outCubic(ramp(t, ln.on, ln.on + 0.45)) * up).toFixed(3);
      put(ln.head.el, 'opacity', on);
      ln.pool.set(['t', 0, 0, Z_POOL]);
      put(ln.pool.el, 'opacity', on);
    }

    // ---------- transforms + world rotations, then light every printed card from its normal ----------
    for (const n of NODES) n.update();
    const amb = lerp(0.62, 0.4, dusk), sunI = lerp(0.5, 0.12, dusk), lampI = 0.8 * lamp, sat = lerp(1, 0.74, dusk);
    const view = [0, Math.sin(rad(tilt)), Math.cos(rad(tilt))];
    const sideLight = (n) => {                               // [brightness, warmth] of a side with normal n
      const ds = Math.max(0, dot(n, this.lights.sun)), dl = Math.max(0, dot(n, this.lights.lamp));
      return [amb + sunI * ds + 0.9 * lampI * dl, 0.7 * lampI * dl + 0.25 * dusk * ds];
    };
    for (const c of CARDS) {
      if (c.kind === 'glow') continue;
      const n = [c.R[0][2], c.R[1][2], c.R[2][2]];           // R · (0, 0, 1)
      // paper is two-sided: light the side we see, blending the two as the card passes edge-on
      const k = smooth01((dot(n, view) + 0.15) / 0.3), f = sideLight(n), b = sideLight(n.map((v) => -v));
      const bright = lerp(b[0], f[0], k) * up, warm = clamp(lerp(b[1], f[1], k));
      put(c.el, 'filter', `brightness(${bright.toFixed(3)}) saturate(${sat.toFixed(3)}) sepia(${warm.toFixed(3)})`);
    }

    // ---------- the desk: lamp pool and dusk (2-D paint) ----------
    const shade = clamp(0.88 * dark + 0.3 * dusk);
    put(this.desk, 'background', `linear-gradient(rgba(10,8,14,${shade.toFixed(3)}), rgba(10,8,14,${shade.toFixed(3)})),
      radial-gradient(ellipse 62% 42% at 88% 64%, rgba(255,170,90,${(0.5 * lamp * up).toFixed(3)}), rgba(255,140,60,${(0.16 * lamp * up).toFixed(3)}) 45%, rgba(0,0,0,0) 75%), ${this.deskWood}`);
  },
});

/** a scalloped paper cloud: quadratic bumps along the top, flat underside */
function cloudPath(w, h, s) {
  const r = rand(s * 13), n = 5;
  let d = `M0 ${h}`;
  for (let i = 0; i < n; i++) {
    const x0 = (i / n) * w, x1 = ((i + 1) / n) * w, top = h * (0.05 + 0.45 * (1 - Math.sin(Math.PI * (i + 0.5) / n))) + r() * 10;
    d += ` Q${((x0 + x1) / 2).toFixed(1)} ${(top - h * 0.25).toFixed(1)} ${x1.toFixed(1)} ${(h * 0.75 - (i === n - 1 ? 0 : 6)).toFixed(1)}`;
  }
  return d + ` L${w} ${h}Z`;
}
