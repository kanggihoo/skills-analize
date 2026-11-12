/*
 * cafe.js — the set and the props, all procedural: a corner of a small café in late sun.
 *   floor planks, a back wall with an arched window cut out of it (so the sun only enters through the opening and
 *   throws the muntin pattern across the table), the sill and its cushion, side walls with a shelf and a menu board,
 *   a pendant lamp, a round rug, a second table in the back, the café table, two cups, the plate, the cake slice
 *   (bevelled extruded wedge layers), the cream swirl and the strawberry (lathe body, instanced seeds, calyx).
 *   Canvas textures are drawn once here.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rand } from '../_lib/stage.js';
import { TABLE_Y, TABLE_R, PLATE_Y, SLICE, DOLLOP, BERRY, WINDOW, SILL, ROOM, SUN_DIR } from './layout.js';
import { PAL } from './cast.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const V2 = (x, y) => new THREE.Vector2(x, y);
const std = (color, roughness = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
// large background surfaces: diffuse only (no specular / environment lookups per pixel)
const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => V2(r, y)), seg);
const shade = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };

function canvasTex(w, h, draw, headless, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// arched opening: rectangle with a semicircular top, as a THREE.Path (counter-clockwise)
function archPath(P, cx, y0, w, h) {
  const r = w / 2, ys = y0 + h - r;
  P.moveTo(cx - r, y0);
  P.lineTo(cx + r, y0);
  P.lineTo(cx + r, ys);
  P.absarc(cx, ys, r, 0, Math.PI, false);
  P.lineTo(cx - r, y0);
  return P;
}

export function buildCafe(scene, HL) {
  const R = rand(1641);
  const out = {};

  // ---------------------------------------------------------------- floor: warm planks running toward the window
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    const n = 7, pw = w / n;
    for (let i = 0; i < n; i++) {
      let y = -R() * h;
      while (y < h) {
        const len = h * (0.35 + R() * 0.5), l = 0.42 + R() * 0.1;
        g.fillStyle = `hsl(${26 + R() * 6}, ${38 + R() * 10}%, ${l * 100}%)`;
        g.fillRect(i * pw, y, pw, len);
        g.globalAlpha = 0.08;
        for (let k = 0; k < 7; k++) {
          g.strokeStyle = R() < 0.5 ? '#2c1a10' : '#f3d2a8';
          g.lineWidth = 1 + R() * 2;
          g.beginPath();
          const x0 = i * pw + R() * pw;
          g.moveTo(x0, y); g.bezierCurveTo(x0 + (R() - 0.5) * 20, y + len * 0.3, x0 + (R() - 0.5) * 20, y + len * 0.7, x0 + (R() - 0.5) * 10, y + len);
          g.stroke();
        }
        g.globalAlpha = 1;
        g.fillStyle = 'rgba(45,25,15,0.55)';
        g.fillRect(i * pw, y, pw, 3);
        y += len;
      }
      g.fillStyle = 'rgba(45,25,15,0.5)';
      g.fillRect(i * pw, 0, 3, h);
    }
  }, HL);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(3, 3);
  const floor = shade(new THREE.Mesh(new THREE.PlaneGeometry(6, 6), lam('#ffffff', { map: floorTex })), false, true);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 0.6;
  scene.add(floor);

  // ---------------------------------------------------------------- back wall with the arched window hole
  const WW = ROOM.right - ROOM.left, WH = ROOM.ceil;
  const wallTex = canvasTex(1536, 920, (g, w, h) => {
    const sx = w / WW, sy = h / WH;
    g.fillStyle = PAL.cream; g.fillRect(0, 0, w, h);
    // soft plaster mottling
    for (let i = 0; i < 260; i++) {
      const x = R() * w, y = R() * h * 0.7, r = 20 + R() * 80;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.025 + R() * 0.03;
      gr.addColorStop(0, R() < 0.5 ? `rgba(225,196,160,${a})` : `rgba(255,250,240,${a})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    // wainscot: latte boards below 0.95 m, a caramel rail
    const yr = h - 0.95 * sy;
    g.fillStyle = PAL.latte; g.fillRect(0, yr, w, h - yr);
    for (let x = 0; x < w; x += 0.12 * sx) {
      g.fillStyle = 'rgba(120,80,50,0.18)'; g.fillRect(x, yr, 2, h - yr);
      g.fillStyle = 'rgba(255,240,220,0.18)'; g.fillRect(x + 2, yr, 2, h - yr);
    }
    g.fillStyle = PAL.caramel; g.fillRect(0, yr - 0.035 * sy, w, 0.045 * sy);
    g.fillStyle = 'rgba(60,35,20,0.35)'; g.fillRect(0, yr + 0.01 * sy, w, 3);
    g.fillStyle = 'rgba(80,50,30,0.5)'; g.fillRect(0, h - 0.08 * sy, w, 0.08 * sy);
  }, HL);
  const wallMat = lam('#ffffff', { map: wallTex });
  const wallShape = new THREE.Shape();
  wallShape.moveTo(ROOM.left, 0); wallShape.lineTo(ROOM.right, 0); wallShape.lineTo(ROOM.right, WH); wallShape.lineTo(ROOM.left, WH); wallShape.lineTo(ROOM.left, 0);
  wallShape.holes.push(archPath(new THREE.Path(), WINDOW.cx, WINDOW.y0, WINDOW.w, WINDOW.h));
  const wallGeo = new THREE.ShapeGeometry(wallShape, 48);
  { const P = wallGeo.attributes.position, uv = wallGeo.attributes.uv; for (let i = 0; i < P.count; i++) uv.setXY(i, (P.getX(i) - ROOM.left) / WW, P.getY(i) / WH); }
  const wall = shade(new THREE.Mesh(wallGeo, wallMat), true, true);
  wall.position.z = ROOM.back;
  scene.add(wall);
  // thickness of the wall around the opening (the reveal), so the sun cut has depth
  {
    const band = new THREE.Shape();
    archPath(band, WINDOW.cx, WINDOW.y0, WINDOW.w + 0.06, WINDOW.h + 0.03);
    band.holes.push(archPath(new THREE.Path(), WINDOW.cx, WINDOW.y0, WINDOW.w, WINDOW.h));
    const g = new THREE.ExtrudeGeometry(band, { depth: 0.16, bevelEnabled: false, curveSegments: 40 });
    const m = shade(new THREE.Mesh(g, lam(PAL.cream)));
    m.position.z = ROOM.back - 0.164;                    // its front face 4 mm behind the wall plane: never coplanar
    scene.add(m);
  }
  // window frame (cocoa wood) + muntins, glass/outside painted on a plane behind
  {
    const fr = new THREE.Shape();
    archPath(fr, WINDOW.cx, WINDOW.y0 - 0.02, WINDOW.w + 0.02, WINDOW.h + 0.03);
    fr.holes.push(archPath(new THREE.Path(), WINDOW.cx, WINDOW.y0 + 0.035, WINDOW.w - 0.09, WINDOW.h - 0.08));
    const g = new THREE.ExtrudeGeometry(fr, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 48 });
    const frameMat = std('#5a3d2e', 0.55);
    const m = shade(new THREE.Mesh(g, frameMat));
    m.position.z = ROOM.back - 0.11;
    scene.add(m);
    const r = WINDOW.w / 2, ys = WINDOW.y0 + WINDOW.h - r;
    const bars = [
      [WINDOW.cx, (WINDOW.y0 + WINDOW.y0 + WINDOW.h) / 2, 0.028, WINDOW.h, 0],
      [WINDOW.cx, ys, WINDOW.w, 0.026, 0],
      [WINDOW.cx, WINDOW.y0 + (ys - WINDOW.y0) * 0.5, WINDOW.w, 0.022, 0],
    ];
    for (const [x, y, w, h] of bars) {
      const b = shade(new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.03, 2, 0.008), frameMat));
      b.position.set(x, y, ROOM.back - 0.09);
      scene.add(b);
    }
    // outside: a warm late-afternoon street, soft (it is always out of focus)
    const outTex = canvasTex(512, 640, (g2, w, h) => {
      const gr = g2.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#fff3da'); gr.addColorStop(0.55, '#ffe0b3'); gr.addColorStop(1, '#f6c793');
      g2.fillStyle = gr; g2.fillRect(0, 0, w, h);
      g2.fillStyle = 'rgba(222,190,150,0.8)';
      g2.beginPath(); g2.roundRect(w * 0.55, h * 0.48, w * 0.5, h * 0.6, 18); g2.fill();
      g2.fillStyle = 'rgba(205,170,130,0.55)';
      for (let i = 0; i < 3; i++) { g2.beginPath(); g2.roundRect(w * 0.62 + i * 48, h * 0.56, 26, 40, 6); g2.fill(); }
      for (let i = 0; i < 14; i++) {
        const x = w * 0.18 + (R() - 0.5) * w * 0.42, y = h * 0.4 + (R() - 0.5) * h * 0.25, rr = 40 + R() * 60;
        const gg = g2.createRadialGradient(x, y, 0, x, y, rr);
        gg.addColorStop(0, 'rgba(150,178,130,0.75)'); gg.addColorStop(1, 'rgba(150,178,130,0)');
        g2.fillStyle = gg; g2.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
      }
      g2.fillStyle = 'rgba(140,110,90,0.5)'; g2.fillRect(w * 0.17, h * 0.5, 10, h * 0.5);
    }, HL);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WINDOW.w + 0.4, WINDOW.h + 0.4), new THREE.MeshBasicMaterial({ map: outTex, color: new THREE.Color(2.1, 1.9, 1.65), fog: false, transparent: true }));
    glass.position.set(WINDOW.cx, WINDOW.y0 + WINDOW.h / 2, ROOM.back - 0.45);
    scene.add(glass);
    out.glass = glass;
  }
  // sill + cushion
  {
    const s = shade(new THREE.Mesh(new RoundedBoxGeometry(SILL.x1 - SILL.x0, 0.045, SILL.z1 - SILL.z0, 3, 0.012), std('#6a4634', 0.55)));
    s.position.set((SILL.x0 + SILL.x1) / 2, SILL.y - 0.022, (SILL.z0 + SILL.z1) / 2);
    scene.add(s);
    const cush = shade(new THREE.Mesh(lathe([[0, 0], [0.16, 0], [0.19, 0.012], [0.2, 0.028], [0.185, 0.045], [0.12, 0.052], [0, 0.054]], 40), lam('#e2c6a0')));
    cush.scale.set(1.15, 1, 0.62);
    cush.position.set(-0.5, SILL.y, -1.6);
    scene.add(cush);
  }

  // ---------------------------------------------------------------- side walls, ceiling
  const sideMat = lam(PAL.cream, { map: wallTex });
  for (const x of [ROOM.left, ROOM.right]) {
    const w = shade(new THREE.Mesh(new THREE.PlaneGeometry(4.2, WH), sideMat), false, true);
    w.position.set(x, WH / 2, ROOM.back + 2.1);
    w.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(w);
  }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), lam('#efe0c9'));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, ROOM.ceil, 0.6);
  scene.add(ceil);

  // left wall: a menu board with chalk doodles (no words), right wall: shelves of jars and cups, a hanging plant
  {
    const boardTex = canvasTex(512, 640, (g, w, h) => {
      g.fillStyle = '#3b2e29'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(246,234,216,0.85)'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
      // cake slice doodle
      g.beginPath(); g.moveTo(150, 250); g.lineTo(360, 210); g.lineTo(360, 300); g.lineTo(150, 330); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(150, 290); g.lineTo(360, 255); g.stroke();
      g.beginPath(); g.arc(300, 190, 22, 0, Math.PI * 2); g.stroke();
      // cup doodle + steam
      g.beginPath(); g.roundRect(170, 420, 120, 100, 18); g.stroke();
      g.beginPath(); g.arc(300, 465, 26, -Math.PI / 2, Math.PI / 2); g.stroke();
      for (const x of [205, 250]) { g.beginPath(); g.moveTo(x, 395); g.bezierCurveTo(x - 14, 375, x + 14, 360, x, 340); g.stroke(); }
      g.lineWidth = 4;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(70, 70 + i * 26); g.lineTo(200 + (i % 2) * 80, 70 + i * 26); g.stroke(); }
      g.strokeStyle = 'rgba(181,123,76,1)'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
    }, HL);
    const board = shade(new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.78, 0.03, 2, 0.01), lam('#ffffff', { map: boardTex })), false);
    board.position.set(ROOM.left + 0.02, 1.62, -0.25);
    board.rotation.y = Math.PI / 2;
    scene.add(board);
    // right wall shelves
    const shelfMat = std(PAL.caramel, 0.6);
    for (const y of [1.3, 1.75]) {
      const s = shade(new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.03, 1.1, 2, 0.008), shelfMat), false);
      s.position.set(ROOM.right - 0.11, y, -0.35);
      scene.add(s);
      const RJ = rand(Math.round(y * 100));
      for (let z = -0.82; z < 0.15; z += 0.13 + RJ() * 0.06) {
        const h = 0.08 + RJ() * 0.1, r = 0.032 + RJ() * 0.02;
        const col = [PAL.cream, PAL.latte, '#c9d8bd', '#efe3cf', PAL.caramel][Math.floor(RJ() * 5)];
        const j = shade(new THREE.Mesh(lathe([[0, 0], [r, 0], [r * 1.05, h * 0.15], [r, h * 0.85], [r * 0.7, h], [r * 0.72, h * 1.08], [0, h * 1.08]], 24), std(col, 0.5)), false);
        j.position.set(ROOM.right - 0.12 + (RJ() - 0.5) * 0.06, y + 0.015, z);
        scene.add(j);
      }
    }
    // hanging plant on the right
    const pot = shade(new THREE.Mesh(lathe([[0, 0], [0.07, 0], [0.1, 0.1], [0.1, 0.12], [0, 0.12]], 28), std(PAL.cream, 0.7)), false);
    pot.position.set(ROOM.right - 0.35, 2.05, 0.55);
    scene.add(pot);
    const leafMat = lam(PAL.sageDeep);
    const RL = rand(77);
    for (let i = 0; i < 22; i++) {
      const lf = shade(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), leafMat), false);
      const a = RL() * Math.PI * 2, d = 0.04 + RL() * 0.1;
      lf.position.set(pot.position.x + Math.cos(a) * d, 2.12 - RL() * 0.45, pot.position.z + Math.sin(a) * d);
      lf.scale.set(0.8, 0.35, 1.3);
      lf.rotation.set(RL(), RL() * 6, RL());
      scene.add(lf);
    }
  }

  // ---------------------------------------------------------------- rug, background table, floor plant
  {
    const rugTex = canvasTex(512, 512, (g, w) => {
      g.fillStyle = '#d9b98f'; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(250,240,224,0.75)'; g.lineWidth = 10;
      for (const r of [0.44, 0.38]) { g.beginPath(); g.arc(w / 2, w / 2, w * r, 0, Math.PI * 2); g.stroke(); }
      g.strokeStyle = 'rgba(120,85,55,0.25)'; g.lineWidth = 4;
      g.beginPath(); g.arc(w / 2, w / 2, w * 0.495, 0, Math.PI * 2); g.stroke();
    }, HL);
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.15, 64), lam('#ffffff', { map: rugTex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    rug.rotation.x = -Math.PI / 2; rug.position.y = 0.003;
    rug.receiveShadow = true;
    scene.add(rug);
  }
  out.tableParts = [];
  function table(x, z, s = 1, cast = true) {
    const top = shade(new THREE.Mesh(lathe([[0, 0.69], [TABLE_R - 0.012, 0.69], [TABLE_R, 0.697], [TABLE_R + 0.003, 0.705], [TABLE_R, 0.713], [TABLE_R - 0.008, TABLE_Y], [0, TABLE_Y]], 72), std('#8e5b3b', 0.42)));
    const ped = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.66, 20), std(PAL.cocoa, 0.5)));
    ped.position.y = 0.36;
    const base = shade(new THREE.Mesh(lathe([[0, 0], [0.2, 0], [0.21, 0.012], [0.19, 0.03], [0.05, 0.05], [0, 0.05]], 48), std(PAL.cocoa, 0.5)));
    const g = new THREE.Group();
    g.add(top, ped, base);
    g.position.set(x, 0, z); g.scale.setScalar(s);
    if (!cast) g.traverse((o) => { o.castShadow = false; });
    scene.add(g);
    return g;
  }
  table(0, 0);
  {
    table(1.5, -1.05, 0.95, false);
    const stoolGeo = lathe([[0, 0.62], [0.16, 0.62], [0.175, 0.632], [0.178, 0.66], [0.168, 0.674], [0, 0.676]], 32);
    for (const [dx, dz] of [[-0.45, 0.1], [0.42, -0.1]]) {
      const s = shade(new THREE.Mesh(stoolGeo, std(PAL.caramel, 0.62)), false);
      s.position.set(1.5 + dx, 0, -1.05 + dz);
      scene.add(s);
      const leg = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.62, 10), std(PAL.caramel, 0.62)), false);
      leg.position.set(1.5 + dx, 0.31, -1.05 + dz);
      scene.add(leg);
    }
    const vase = shade(new THREE.Mesh(lathe([[0, 0], [0.03, 0], [0.04, 0.05], [0.022, 0.11], [0.026, 0.13], [0, 0.13]], 24), std('#c9d8bd', 0.4)), false);
    vase.position.set(1.5, TABLE_Y * 0.95, -1.05);
    scene.add(vase);
  }
  {
    const pot = shade(new THREE.Mesh(lathe([[0, 0], [0.15, 0], [0.18, 0.32], [0.19, 0.34], [0, 0.34]], 32), lam(PAL.latte)), false);
    pot.position.set(-1.62, 0, -1.25);
    scene.add(pot);
    const RL = rand(91), leafMat = lam(PAL.sage), leafMat2 = lam(PAL.sageDeep);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + RL() * 0.3, tilt = 0.35 + RL() * 0.5, len = 0.45 + RL() * 0.35;
      const lf = shade(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), i % 2 ? leafMat : leafMat2), false);
      lf.scale.set(0.42, 0.1, 1) ;
      const g = new THREE.Group();
      g.position.set(-1.62, 0.36, -1.25);
      g.rotation.set(0, a, 0);
      lf.position.set(0, Math.cos(tilt) * len * 0.6, Math.sin(tilt) * len * 0.6);
      lf.rotation.x = -(Math.PI / 2 - tilt) + 0.25;
      lf.scale.multiplyScalar(len / 0.6);
      g.add(lf);
      scene.add(g);
    }
  }

  // ---------------------------------------------------------------- pendant lamp over the table
  {
    const y = 1.66;
    const shadeOut = shade(new THREE.Mesh(lathe([[0.0, 0.192], [0.056, 0.165], [0.125, 0.078], [0.163, 0.0], [0.168, -0.004], [0.172, 0.002], [0.132, 0.085], [0.062, 0.175], [0.03, 0.205], [0.0, 0.205]], 48), std(PAL.caramel, 0.45)), false, false);
    shadeOut.position.y = y;
    scene.add(shadeOut);
    const inner = new THREE.Mesh(lathe([[0.0, 0.188], [0.054, 0.162], [0.122, 0.077], [0.16, 0.002]], 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.9, 1.3) }));
    inner.position.y = y;
    scene.add(inner);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, ROOM.ceil - y - 0.2, 8), std('#2c2220', 0.5));
    cord.position.y = (ROOM.ceil + y + 0.2) / 2;
    scene.add(cord);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 7, 4.5) }));
    bulb.position.y = y + 0.03;
    scene.add(bulb);
    const lamp = new THREE.PointLight('#ffc98a', 1.7, 0, 2);
    lamp.position.set(0, y + 0.0, 0);
    scene.add(lamp);
    out.lamp = lamp;
  }

  // ---------------------------------------------------------------- the café table props: cups, plate, cake, strawberry
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    const cupMat = std('#fbf5ec', 0.35);
    g.add(shade(new THREE.Mesh(lathe([[0, 0], [0.06, 0], [0.068, 0.006], [0.07, 0.009], [0.064, 0.008], [0.03, 0.006], [0, 0.006]], 40), cupMat)));
    const cup = shade(new THREE.Mesh(lathe([[0, 0.006], [0.026, 0.006], [0.036, 0.02], [0.042, 0.05], [0.043, 0.064], [0.04, 0.064], [0.039, 0.05], [0.033, 0.02], [0, 0.015]], 40), cupMat));
    g.add(cup);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.0395, 32), std('#6b4027', 0.25));
    coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.055;
    g.add(coffee);
    const handle = shade(new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0045, 10, 24, Math.PI * 1.3), cupMat));
    handle.position.set(0.045, 0.04, 0); handle.rotation.z = -Math.PI * 0.65;
    g.add(handle);
    g.position.set(s * 0.215, TABLE_Y, -0.16);
    g.rotation.y = s > 0 ? Math.PI : 0;
    scene.add(g);
  }
  const plate = shade(new THREE.Mesh(lathe([[0, 0.004], [0.07, 0.004], [0.072, 0], [0.08, 0], [0.083, 0.006], [0.105, 0.012], [0.122, 0.018], [0.126, 0.021], [0.123, 0.023], [0.104, 0.017], [0.08, 0.0125], [0, 0.012]], 64), std('#b9cbaa', 0.32)));
  plate.position.set(0, TABLE_Y, -0.01);
  scene.add(plate);

  // cake slice: a wedge (apex toward the camera) in five bevelled layers
  const sector = (r, half) => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, r, Math.PI / 2 - half, Math.PI / 2 + half, false);
    s.lineTo(0, 0);
    return s;
  };
  const sponge = std('#ecca88', 0.85), creamM = std('#fbf3e6', 0.55);
  const layers = [[0.017, sponge, 0.0], [0.006, creamM, 0.0015], [0.017, sponge, 0], [0.006, creamM, 0.0015], [0.012, creamM, 0.0025]];
  let y0 = PLATE_Y;
  const cake = new THREE.Group();
  for (const [h, m, grow] of layers) {
    const bev = Math.min(0.0035, h * 0.3);
    const g = new THREE.ExtrudeGeometry(sector(SLICE.r + grow - bev, SLICE.half), { depth: h - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y0 + bev, SLICE.apexZ - grow * 1.6);
    cake.add(shade(new THREE.Mesh(g, m)));
    y0 += h;
  }
  scene.add(cake);
  // cream swirl the strawberry sits on (a ridged lathe)
  const dollop = shade(new THREE.Mesh(lathe([[0, 0], [0.019, 0], [0.021, 0.004], [0.018, 0.008], [0.0195, 0.011], [0.0145, 0.016], [0.0125, 0.019], [0.006, 0.0225], [0, 0.023]], 40), creamM));
  dollop.position.copy(DOLLOP);
  scene.add(dollop);
  // what the strawberry leaves behind on the cream once it is gone: a small smear of juice
  const juiceMat = std('#c23048', 0.2);
  const juice = new THREE.Group();
  for (const [x, z, r, sx] of [[0.0, 0.0, 0.0042, 1.5], [0.0042, 0.0025, 0.0026, 1], [-0.0038, -0.0018, 0.0021, 1.2]]) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 10), juiceMat);
    d.scale.set(sx, 0.16, 1);
    d.position.set(x, 0, z);
    juice.add(d);
  }
  juice.position.copy(DOLLOP).add(V(0.001, 0.0226, 0.001));
  juice.rotation.y = 0.5;
  juice.visible = false;
  scene.add(juice);
  out.juice = juice;

  // the strawberry: lathe body, instanced seeds, a calyx of six leaves
  const berry = new THREE.Group();
  const prof = [[0.0, 0], [0.004, 0.0015], [0.0092, 0.0075], [0.0138, 0.0165], [0.0172, 0.0275], [0.0186, 0.0355], [0.0176, 0.0418], [0.0122, 0.0462], [0.0045, 0.0484], [0, 0.0488]];
  const bodyGeo = lathe(prof, 48);
  bodyGeo.translate(0, -0.026, 0);
  const berryMat = std(PAL.berry, 0.26);
  const bb = shade(new THREE.Mesh(bodyGeo, berryMat));
  berry.add(bb);
  {
    const curve = prof.map(([r, y]) => V2(r, y - 0.026));
    const rAt = (y) => { for (let i = 1; i < curve.length; i++) if (y <= curve[i].y) { const a = curve[i - 1], b = curve[i]; return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y); } return 0; };
    const N = 44, seeds = [];
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1.6, 0.7);
    for (let i = 0; i < N; i++) {
      const y = -0.023 + (i + 0.5) / N * 0.038, a = i * 2.39996;
      const r = rAt(y) - 0.0004;
      const p = V(Math.cos(a) * r, y, Math.sin(a) * r);
      const n = V(Math.cos(a), 0.35, Math.sin(a)).normalize();
      q.setFromUnitVectors(V(0, 0, 1), n);
      seeds.push(new THREE.SphereGeometry(0.0016, 8, 6).applyMatrix4(m4.compose(p, q, sc)));
    }
    berry.add(new THREE.Mesh(mergeGeometries(seeds), std('#f3d67a', 0.4)));
    const calyxMat = std(PAL.sageDeep, 0.55);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const lf = shade(new THREE.Mesh(new THREE.SphereGeometry(0.009, 14, 8), calyxMat));
      lf.scale.set(0.55, 0.22, 1.25);
      const g = new THREE.Group();
      g.rotation.y = a;
      lf.position.set(0, 0.0215, 0.009);
      lf.rotation.x = -0.32;
      g.add(lf);
      berry.add(g);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0022, 0.009, 8), calyxMat);
    stem.position.y = 0.026;
    berry.add(stem);
  }
  // resting on the cream: calyx down into the swirl, tip up
  berry.position.copy(BERRY);
  berry.rotation.set(Math.PI + 0.12, 0.4, 0.08);
  scene.add(berry);
  out.berry = berry;
  out.berryRest = berry.position.clone();
  out.berryRestQ = berry.quaternion.clone();

  // ---------------------------------------------------------------- lights
  // the sun: a distant spot aimed through the window (decay 0 = parallel-ish, constant strength). Its cone only has to
  // cover the window opening, so the shadow map spends its texels on the shaft (≈1.3 mm at the table) and the
  // room outside the cone gets no sun at all.
  const sun = new THREE.SpotLight('#ffcf98', 4.6, 0, 0.115, 0.3, 0);
  sun.target.position.set(0, 0.8, 0);
  sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, -11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 16;
  sun.shadow.radius = 2.6;           // 5 fixed taps (the per-pixel noise rotation is replaced in main.js)
  sun.shadow.bias = -0.00015;
  sun.shadow.normalBias = 0.006;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#fff1dc', '#9a6a45', 0.42);
  scene.add(hemi);
  out.sun = sun;
  return out;
}
