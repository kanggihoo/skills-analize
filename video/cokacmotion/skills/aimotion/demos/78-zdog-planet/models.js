/*
 * models.js — the little things on the planet, built from Zdog primitives.
 *
 * Every builder adds shapes to an object Group in its local frame: up = −y, the ground at y = 0, the model's
 * "front" at +z. Shapes are registered for painting (`reg(shape, key, mode)`), and main.js sets their colours
 * every frame from the palette and the light:
 *   'flat' — palette colour · 'face' — palette colour toned by the face normal against the light (flat per face)
 *   'ball' — a custom-rendered sphere (Zdog dot) with a screen-space crescent shadow and a highlight
 *   'win'  — a window that switches from sky-reflection blue to lamplight at its own time
 *
 * Draw order inside a model is fixed (Group updateSort: false) and correct from any view above the ground:
 * walls and gables are culled when they face away (their `front` points outward), so the visible ones of a convex
 * box never overlap; doors and windows sit on the walls; the roof comes last.
 */
const TAU = Math.PI * 2;

/** per-frame state the custom renderers read (main.js writes it before each render) */
export const FX = { lx: -0.8, ly: -0.6, off: 0.24, beam: 0, head: 0, hiA: 0.35 };

// ---------- custom renderers ----------

/** a cel-shaded ball: shadow disc, the lit disc shifted toward the light (clipped), a small highlight */
export function ballRender(ctx) {
  if (!this.visible) return;
  const r = this.stroke / 2;
  if (r < 0.4) return;
  const p = this.pathCommands[0].endRenderPoint;
  const P = this.pal;
  ctx.fillStyle = P.shade;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
  ctx.save();
  ctx.clip();
  const o = r * FX.off * (this.offK || 1);
  ctx.fillStyle = P.base;
  ctx.beginPath(); ctx.arc(p.x + FX.lx * o, p.y + FX.ly * o, r, 0, TAU); ctx.fill();
  if (!this.noHi && FX.hiA > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${FX.hiA.toFixed(3)})`;
    ctx.beginPath(); ctx.arc(p.x + FX.lx * r * 0.5, p.y + FX.ly * r * 0.5, r * 0.2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** soft lamplight around a lit window (only when the window faces the camera) */
function glowRender(ctx) {
  const w = this.win;
  if (!this.visible || !w.visible || w.isFacingBack || !(w.on > 0.01)) return;
  const p = w.renderOrigin, r = this.radius * this.k;
  if (r < 1) return;
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
  g.addColorStop(0, `rgba(255,214,120,${(0.42 * w.on).toFixed(3)})`);
  g.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
  ctx.fillRect(p.x - r, p.y - r, 2 * r, 2 * r);
  ctx.restore();
}

/** light wedges from a lamp point to pairs of tip anchors (lighthouse beams, headlights) */
function wedgeRender(ctx) {
  const a = this.amount();
  if (!this.visible || a <= 0.01 || this.k <= 0.01) return;
  const p = this.pathCommands[0].endRenderPoint;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [A, B] of this.tips) {
    const a0 = A.renderOrigin, b0 = B.renderOrigin;
    const mx = (a0.x + b0.x) / 2, my = (a0.y + b0.y) / 2;
    if (Math.hypot(mx - p.x, my - p.y) < 2) continue;
    const g = ctx.createLinearGradient(p.x, p.y, mx, my);
    g.addColorStop(0, `rgba(255,238,170,${(this.alpha * a).toFixed(3)})`);
    g.addColorStop(1, 'rgba(255,238,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(a0.x, a0.y); ctx.lineTo(b0.x, b0.y); ctx.fill();
  }
  if (this.halo) {
    const r = this.halo * this.k;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    g.addColorStop(0, `rgba(255,246,200,${(0.85 * a).toFixed(3)})`);
    g.addColorStop(0.25, `rgba(255,230,150,${(0.35 * a).toFixed(3)})`);
    g.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = g; ctx.fillRect(p.x - r, p.y - r, 2 * r, 2 * r);
  }
  ctx.restore();
}

// ---------- builders ----------

export function makeKit(Z, reg) {
  const ball = (addTo, { x = 0, y = 0, z = 0, d, key, offK, noHi }) => {
    const s = new Z.Shape({ addTo, translate: { x, y, z }, stroke: d, color: '#fff' });
    s.render = ballRender; s.offK = offK; s.noHi = noHi;
    reg(s, key, 'ball');
    return s;
  };

  /** a wall: Rect in the local x-y plane, turned so its front (outward normal) is `side` */
  const wall = (addTo, { w, h, at, side, key, stroke = 2.5 }) => {
    const rot = { '+z': {}, '-z': { y: Math.PI }, '+x': { y: -Math.PI / 2 }, '-x': { y: Math.PI / 2 } }[side];
    const s = new Z.Rect({ addTo, width: w, height: h, translate: at, rotate: rot, stroke, fill: true, color: '#fff', backface: false });
    reg(s, key, 'face');
    return s;
  };

  function house(g, { w = 40, d = 32, h = 26, roofH = 18, wallKey, roofKey, chimney = false, rnd, winOn }) {
    const hw = w / 2, hd = d / 2, o = 0.9;
    wall(g, { w, h, at: { y: -h / 2, z: hd }, side: '+z', key: wallKey });
    wall(g, { w, h, at: { y: -h / 2, z: -hd }, side: '-z', key: wallKey });
    wall(g, { w: d, h, at: { x: hw, y: -h / 2 }, side: '+x', key: wallKey });
    wall(g, { w: d, h, at: { x: -hw, y: -h / 2 }, side: '-x', key: wallKey });
    for (const s of [1, -1]) {   // gables
      const gb = new Z.Shape({ addTo: g, path: [{ x: s * hw, y: -h, z: -hd }, { x: s * hw, y: -h, z: hd }, { x: s * hw, y: -h - roofH, z: 0 }],
        front: { x: s }, backface: false, fill: true, stroke: 2.5, color: '#fff' });
      reg(gb, wallKey, 'face');
    }
    // door + windows; each window gets a glow that draws right after it
    const glows = [];
    const win = (side, x, y) => {
      const at = side === '+z' ? { x, y, z: hd + o } : side === '-z' ? { x, y, z: -hd - o } : side === '+x' ? { x: hw + o, y, z: x } : { x: -hw - o, y, z: x };
      const rot = { '+z': {}, '-z': { y: Math.PI }, '+x': { y: -Math.PI / 2 }, '-x': { y: Math.PI / 2 } }[side];
      const s = new Z.Rect({ addTo: g, width: 7.5, height: 7.5, translate: at, rotate: rot, stroke: 2.5, fill: true, color: '#fff', backface: false });
      s.on = 0;
      reg(s, 'window', 'win', { t0: winOn + rnd() * 1.5 });
      glows.push(s);
    };
    const door = new Z.Rect({ addTo: g, width: 8, height: 13, translate: { x: w >= 40 ? 0 : -w / 5, y: -6.5, z: hd + o }, stroke: 2.5, fill: true, color: '#fff', backface: false });
    reg(door, 'door', 'flat');
    const yWin = -h * 0.62;
    if (w >= 40) { win('+z', -w / 4 - 1, yWin); win('+z', w / 4 + 1, yWin); } else win('+z', w / 5 + 2, yWin);
    win('-z', -w / 4, yWin); win('-z', w / 4, yWin);
    win('+x', 0, yWin); win('-x', 0, yWin);
    if (h > 34) {   // a second storey
      win('+z', -w / 4 - 1, -h * 0.28 - 4); win('+z', w / 4 + 1, -h * 0.28 - 4);
      win('-z', 0, -h * 0.28 - 4);
    }
    for (const s of glows) {
      const gl = new Z.Shape({ addTo: g, stroke: 0, visible: true });
      gl.render = glowRender; gl.win = s; gl.radius = 15; gl.k = 1;
      reg(gl, null, 'scale', { prop: 'k' });
    }
    // roof: two planes, culled when they face away, eaves overhanging the walls
    const ov = 4, ry = -h - roofH, ey = -h + 3, ez = hd + ov;
    for (const s of [1, -1]) {
      const a = roofH + 3, b = ez, L = Math.hypot(a, b);
      const rf = new Z.Shape({ addTo: g, path: [{ x: -hw - ov, y: ry, z: 0 }, { x: hw + ov, y: ry, z: 0 }, { x: hw + ov, y: ey, z: s * ez }, { x: -hw - ov, y: ey, z: s * ez }],
        front: { y: -b / L, z: s * a / L }, backface: false, fill: true, stroke: 3, color: '#fff' });
      reg(rf, roofKey, 'face');
    }
    if (chimney) {
      const c = new Z.Shape({ addTo: g, path: [{ x: w / 4, y: ry + roofH * 0.45, z: -hd * 0.35 }, { x: w / 4, y: ry - 4, z: -hd * 0.35 }], stroke: 7, color: '#fff' });
      reg(c, 'brick', 'flat');
    }
  }

  function tree(g, { h = 18, d = 34, key = 'leaf1', twin = false }) {
    const tr = new Z.Shape({ addTo: g, path: [{ y: 0 }, { y: -h - d * 0.3 }], stroke: 7, color: '#fff' });
    reg(tr, 'trunk', 'flat');
    if (twin) ball(g, { x: d * 0.32, y: -h - d * 0.12, z: d * 0.1, d: d * 0.62, key: key === 'leaf1' ? 'leaf2' : 'leaf1' });
    ball(g, { y: -h - d * 0.42, d, key });
  }

  function pine(g, { s = 1 }) {
    const tr = new Z.Shape({ addTo: g, path: [{ y: 0 }, { y: -8 * s }], stroke: 6, color: '#fff' });
    reg(tr, 'trunk', 'flat');
    const c1 = new Z.Cone({ addTo: g, diameter: 30 * s, length: 30 * s, translate: { y: -6 * s }, rotate: { x: Math.PI / 2 }, stroke: 3, color: '#fff' });
    reg(c1, 'pine', 'flat');
    const c2 = new Z.Cone({ addTo: g, diameter: 22 * s, length: 26 * s, translate: { y: -22 * s }, rotate: { x: Math.PI / 2 }, stroke: 3, color: '#fff' });
    reg(c2, 'pine2', 'flat');
  }

  function bush(g, { d = 18 }) {
    ball(g, { x: -d * 0.3, y: -d * 0.32, d: d * 0.8, key: 'leaf3', noHi: true });
    ball(g, { x: d * 0.22, y: -d * 0.42, d, key: 'bush' });
  }

  function flowers(g, { rnd }) {
    const keys = ['flowerPink', 'flowerYellow', 'flowerWhite', 'flowerPink', 'flowerYellow', 'flowerPink', 'flowerWhite'];
    keys.forEach((key, i) => {
      const a = i * 2.4 + rnd() * 0.6, r = 4 + rnd() * 12;
      const dot = new Z.Shape({ addTo: g, translate: { x: Math.cos(a) * r, y: -3, z: Math.sin(a) * r }, stroke: 6.5, color: '#fff' });
      reg(dot, key, 'flat');
    });
  }

  function lighthouse(g) {
    // stacked cylinders (bottom → top, each drawn over the one below), the lantern, the cap
    let y = 0;
    const cyl = (dia, len, key, mode = 'flat') => {
      const c = new Z.Cylinder({ addTo: g, diameter: dia, length: len, translate: { y: -(y + len / 2) }, rotate: { x: Math.PI / 2 }, stroke: 1, color: '#fff' });
      reg(c, key, mode);
      y += len;
      return c;
    };
    cyl(38, 10, 'lhDark');
    cyl(33, 18, 'lhWhite'); cyl(30, 17, 'lhRed'); cyl(27, 17, 'lhWhite'); cyl(24, 15, 'lhRed');
    cyl(34, 4, 'lhDark');
    const lampY = y + 7;
    cyl(17, 14, 'lamp');
    const cap = new Z.Cone({ addTo: g, diameter: 26, length: 15, translate: { y: -y }, rotate: { x: Math.PI / 2 }, stroke: 2, color: '#fff' });
    reg(cap, 'lhRed', 'flat');
    const tip = new Z.Shape({ addTo: g, translate: { y: -y - 17 }, stroke: 5, color: '#fff' });
    reg(tip, 'lhDark', 'flat');
    // the rotating lens: two opposite beams, set turning by main.js (beam.rotate.y)
    const beam = new Z.Anchor({ addTo: g, translate: { y: -lampY } });
    const L = 280, S = 52;
    const tips = [[new Z.Anchor({ addTo: beam, translate: { x: -S, y: 6, z: L } }), new Z.Anchor({ addTo: beam, translate: { x: S, y: 6, z: L } })],
      [new Z.Anchor({ addTo: beam, translate: { x: S, y: 6, z: -L } }), new Z.Anchor({ addTo: beam, translate: { x: -S, y: 6, z: -L } })]];
    const w = new Z.Shape({ addTo: beam, stroke: 0 });
    w.render = wedgeRender; w.tips = tips; w.amount = () => FX.beam; w.alpha = 0.5; w.halo = 34; w.k = 1;
    reg(w, null, 'scale', { prop: 'k' });
    return { beam };
  }

  function windmill(g) {
    const tower = new Z.Cylinder({ addTo: g, diameter: 26, length: 46, translate: { y: -23 }, rotate: { x: Math.PI / 2 }, stroke: 2, color: '#fff' });
    reg(tower, 'millBody', 'flat');
    const door = new Z.Rect({ addTo: g, width: 7, height: 11, translate: { y: -5.5, z: 13.6 }, stroke: 2, fill: true, color: '#fff', backface: false });
    reg(door, 'door', 'flat');
    const win1 = new Z.Rect({ addTo: g, width: 6, height: 6, translate: { y: -27, z: 13.4 }, stroke: 2, fill: true, color: '#fff', backface: false });
    win1.on = 0;
    reg(win1, 'window', 'win', { t0: 5.7 });
    const cap = new Z.Cone({ addTo: g, diameter: 32, length: 18, translate: { y: -46 }, rotate: { x: Math.PI / 2 }, stroke: 3, color: '#fff' });
    reg(cap, 'millCap', 'flat');
    const rotor = new Z.Anchor({ addTo: g, translate: { y: -47, z: 19 } });
    const hub = new Z.Shape({ addTo: rotor, stroke: 9, color: '#fff' });
    reg(hub, 'millCap', 'flat');
    for (let k = 0; k < 4; k++) {
      const arm = new Z.Anchor({ addTo: rotor, rotate: { z: k * Math.PI / 2 } });
      const sail = new Z.Shape({ addTo: arm, path: [{ x: -1, y: -6 }, { x: 9, y: -9 }, { x: 9, y: -42 }, { x: -1, y: -42 }], stroke: 2, fill: true, color: '#fff', backface: true });
      reg(sail, 'blade', 'flat');
      const spar = new Z.Shape({ addTo: arm, path: [{ y: -4 }, { y: -44 }], stroke: 3, color: '#fff' });
      reg(spar, 'millCap', 'flat');
    }
    return { rotor };
  }

  function car(g, { key }) {
    for (const [x, z] of [[-11, -10], [11, -10], [-11, 10], [11, 10]]) {
      const wh = new Z.Shape({ addTo: g, translate: { x, y: -4, z }, stroke: 9, color: '#fff' });
      reg(wh, 'tire', 'flat');
    }
    const box = (x, y, w, h, d, k, st) => {
      const hw = w / 2, hd = d / 2;
      wall(g, { w, h, at: { x, y, z: hd }, side: '+z', key: k, stroke: st });
      wall(g, { w, h, at: { x, y, z: -hd }, side: '-z', key: k, stroke: st });
      wall(g, { w: d, h, at: { x: x + hw, y }, side: '+x', key: k, stroke: st });
      wall(g, { w: d, h, at: { x: x - hw, y }, side: '-x', key: k, stroke: st });
      const top = new Z.Rect({ addTo: g, width: w, height: d, translate: { x, y: y - h / 2 }, rotate: { x: Math.PI / 2 }, stroke: st, fill: true, color: '#fff', backface: false });
      reg(top, k, 'face');
    };
    box(0, -10, 34, 9, 19, key, 6);
    box(-3, -20, 17, 8, 15, 'cabin', 5);
    const lamps = [];
    for (const z of [-6, 6]) {
      const l = new Z.Shape({ addTo: g, translate: { x: 20.5, y: -10, z }, stroke: 4.5, color: '#fff' });
      reg(l, 'headlight', 'flat');
      lamps.push(l);
    }
    const head = new Z.Anchor({ addTo: g, translate: { x: 21, y: -10 } });
    const tips = [[new Z.Anchor({ addTo: head, translate: { x: 70, y: 2, z: -24 } }), new Z.Anchor({ addTo: head, translate: { x: 70, y: 2, z: 24 } })]];
    const w = new Z.Shape({ addTo: head, stroke: 0 });
    w.render = wedgeRender; w.tips = tips; w.amount = () => FX.head; w.alpha = 0.4; w.halo = 14; w.k = 1;
    reg(w, null, 'scale', { prop: 'k' });
  }

  return { ball, house, tree, pine, bush, flowers, lighthouse, windmill, car };
}
