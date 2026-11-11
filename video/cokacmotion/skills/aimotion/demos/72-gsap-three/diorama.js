/*
 * The toy island, built from three.js primitives with built-in materials only (MeshStandardMaterial in flat
 * pastel colours, MeshBasicMaterial for the additive lighthouse beam, SpriteMaterial for the sun's glow).
 * The diorama floats on the studio-sky backdrop (scene.background). Nothing here moves: buildDiorama() returns the scene graph plus handles to every part main.js animates.
 *
 * World: y up, island centre at the origin, sea level y = 0. A plan angle a (deg) maps to x = r·sin a,
 * z = r·cos a — the same convention as the camera rig's azimuth, so az = a looks at that side.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DEG = Math.PI / 180;
export const polar = (a, r) => [r * Math.sin(a * DEG), r * Math.cos(a * DEG)];

export const COL = {
  plinth: 0xf7b9a1, lip: 0xfff1de, sea: 0x66d0df, foam: 0xffffff,
  sand: 0xf8e2a9, grass: 0x8fd46e, hill: 0x7ccb66, trunk: 0x9c6d4e, wood: 0xdba878,
  ink: 0x3a3d6b, white: 0xfffaf2, red: 0xff5c5f, lamp: 0xffe27a, rock: 0xbab3cf,
};

const mats = new Map();
/** shared matte "painted wood / clay" material per colour */
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...o }));
  return mats.get(key);
}
function mesh(geo, color, o) {
  const m = new THREE.Mesh(geo, color instanceof THREE.Material ? color : mat(color, o));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** lathe profile for a disc with a rounded top edge: bottom-outer → up → corner → top centre (outward normals) */
function cushion(R, y0, y1, bevel, seg = 96) {
  const pts = [new THREE.Vector2(R, y0), new THREE.Vector2(R, y1 - bevel)];
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * Math.PI / 2;
    pts.push(new THREE.Vector2(R - bevel + Math.cos(a) * bevel, y1 - bevel + Math.sin(a) * bevel));
  }
  pts.push(new THREE.Vector2(0, y1));
  return new THREE.LatheGeometry(pts, seg);
}

// ---------------------------------------------------------------- buildings & props
function house({ w, d, h, wall, roof, chimney = false }) {
  const g = new THREE.Group();
  const body = mesh(new RoundedBoxGeometry(w, h, d, 3, 0.035), wall);
  body.position.y = h / 2;
  g.add(body);
  // roof: a triangular prism along x, with overhang
  const o = 0.07, rh = d * 0.55;
  const tri = new THREE.Shape();
  tri.moveTo(-(d / 2 + o), 0); tri.lineTo(d / 2 + o, 0); tri.lineTo(0, rh); tri.closePath();
  const rg = new THREE.ExtrudeGeometry(tri, { depth: w + 2 * o, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 });
  rg.rotateY(Math.PI / 2);
  rg.translate(-(w + 2 * o) / 2, h - 0.01, 0);
  g.add(mesh(rg, roof));
  // door and windows on the front (+z) and side walls
  const door = mesh(new RoundedBoxGeometry(0.15, 0.25, 0.03, 2, 0.01), COL.ink);
  door.position.set(-w * 0.18, 0.125, d / 2 + 0.005);
  g.add(door);
  const winGeo = new RoundedBoxGeometry(0.13, 0.13, 0.03, 2, 0.012);
  const win = (x, y, z, ry = 0) => { const m = mesh(winGeo, 0xd6efff, { roughness: 0.35 }); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); };
  win(w * 0.2, h * 0.6, d / 2 + 0.005);
  if (h > 0.75) { win(-w * 0.18, h * 0.78, d / 2 + 0.005); win(w * 0.2, h * 0.3, d / 2 + 0.005); }
  win(w / 2 + 0.005, h * 0.6, 0, Math.PI / 2);
  win(-w / 2 - 0.005, h * 0.6, 0, Math.PI / 2);
  let top = null;
  if (chimney) {
    const c = mesh(new RoundedBoxGeometry(0.11, 0.34, 0.11, 2, 0.015), 0xe9a07c);
    c.position.set(w * 0.26, h + rh * 0.45, -d * 0.18);
    g.add(c);
    top = new THREE.Object3D();
    top.position.set(w * 0.26, h + rh * 0.45 + 0.2, -d * 0.18);
    g.add(top);
  }
  return { g, top };
}

function tree(kind, color, s = 1) {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.3, 8), COL.trunk);
  trunk.position.y = 0.15;
  g.add(trunk);
  if (kind === 'pine') {
    [[0.27, 0.42, 0.36], [0.21, 0.36, 0.6], [0.14, 0.3, 0.8]].forEach(([r, h, y]) => {
      const c = mesh(new THREE.ConeGeometry(r, h, 14), color);
      c.position.y = y;
      g.add(c);
    });
  } else {
    const c = mesh(new THREE.SphereGeometry(0.27, 22, 16), color);
    c.position.y = 0.48;
    c.scale.set(1, 1.08, 1);
    g.add(c);
    if (kind === 'blossom') {
      for (const [x, y, z] of [[0.17, 0.6, 0.12], [-0.15, 0.55, 0.15], [0.04, 0.7, -0.17]]) {
        const b = mesh(new THREE.SphereGeometry(0.11, 14, 10), 0xffe1ea);
        b.position.set(x, y, z);
        g.add(b);
      }
    }
  }
  g.scale.setScalar(s);
  return g;
}

function lighthouse() {
  const g = new THREE.Group();
  const H = 2.1, N = 6;
  for (let i = 0; i < N; i++) {
    const r0 = 0.4 - 0.13 * (i / N), r1 = 0.4 - 0.13 * ((i + 1) / N);
    const seg = mesh(new THREE.CylinderGeometry(r1, r0, H / N, 28), i % 2 ? COL.white : COL.red);
    seg.position.y = (i + 0.5) * (H / N);
    g.add(seg);
  }
  const gallery = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 28), COL.ink);
  gallery.position.y = H + 0.035;
  g.add(gallery);
  const lanternMat = new THREE.MeshStandardMaterial({ color: COL.lamp, emissive: 0xffd36a, emissiveIntensity: 0.25, roughness: 0.3 });
  const lantern = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.32, 20), lanternMat);
  lantern.castShadow = false;
  lantern.position.y = H + 0.23;
  g.add(lantern);
  const cap = mesh(new THREE.ConeGeometry(0.3, 0.32, 20), COL.red);
  cap.position.y = H + 0.55;
  g.add(cap);
  const knob = mesh(new THREE.SphereGeometry(0.06, 12, 8), COL.ink);
  knob.position.y = H + 0.74;
  g.add(knob);
  // two opposite light beams: open cones, apex at the lantern, additive
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xffe9a6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide });
  const beamGeo = new THREE.ConeGeometry(0.75, 5.2, 28, 1, true);
  beamGeo.rotateZ(Math.PI / 2);   // apex → −x, base → +x
  beamGeo.translate(2.6, 0, 0);   // apex at the origin
  const beamPivot = new THREE.Group();
  beamPivot.position.y = H + 0.23;
  for (const ry of [0, Math.PI]) {
    const b = new THREE.Mesh(beamGeo, beamMat);
    b.rotation.y = ry;
    b.rotation.z = -0.06;
    beamPivot.add(b);
  }
  g.add(beamPivot);
  return { g, beamPivot, beamMat, lanternMat };
}

function windmill() {
  const g = new THREE.Group();
  const tower = mesh(new THREE.CylinderGeometry(0.15, 0.27, 0.86, 14), COL.white);
  tower.position.y = 0.43;
  g.add(tower);
  const door = mesh(new RoundedBoxGeometry(0.12, 0.2, 0.04, 2, 0.01), COL.ink);
  door.position.set(0, 0.1, 0.25);
  g.add(door);
  const cap = mesh(new THREE.ConeGeometry(0.22, 0.3, 14), 0xff8c69);
  cap.position.y = 1.0;
  g.add(cap);
  const blades = new THREE.Group();
  blades.position.set(0, 0.8, 0.2);
  const hub = mesh(new THREE.SphereGeometry(0.06, 12, 8), COL.ink);
  blades.add(hub);
  for (let k = 0; k < 4; k++) {
    const arm = new THREE.Group();
    arm.rotation.z = (k * Math.PI) / 2;
    const spar = mesh(new THREE.BoxGeometry(0.035, 0.6, 0.02), COL.trunk);
    spar.position.y = 0.3;
    const sail = mesh(new RoundedBoxGeometry(0.15, 0.42, 0.015, 2, 0.006), k % 2 ? 0xfff3e2 : 0xffd2c4);
    sail.position.set(0.09, 0.36, 0.01);
    arm.add(spar, sail);
    blades.add(arm);
  }
  g.add(blades);
  return { g, blades };
}

function boat() {
  const root = new THREE.Group();     // placed on the water by the motion path
  const bob = new THREE.Group();      // bob / roll
  root.add(bob);
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-0.36, -0.15); hullShape.lineTo(0.12, -0.15);
  hullShape.quadraticCurveTo(0.36, -0.12, 0.44, 0); hullShape.quadraticCurveTo(0.36, 0.12, 0.12, 0.15);
  hullShape.lineTo(-0.36, 0.15); hullShape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
  hullGeo.rotateX(-Math.PI / 2);
  const hull = mesh(hullGeo, COL.white);
  hull.position.y = -0.06;
  const rimGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.045, bevelEnabled: true, bevelSize: 0.032, bevelThickness: 0.01, bevelSegments: 2 });
  rimGeo.rotateX(-Math.PI / 2);
  const rim = mesh(rimGeo, COL.red);
  rim.position.y = 0.11;
  const mast = mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.8, 8), COL.trunk);
  mast.position.set(-0.02, 0.5, 0);
  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 0); sailShape.lineTo(0, 0.62); sailShape.quadraticCurveTo(-0.2, 0.25, -0.38, 0); sailShape.closePath();   // main, aft of the mast
  const sail = mesh(new THREE.ShapeGeometry(sailShape), new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.9, side: THREE.DoubleSide }));
  sail.position.set(-0.03, 0.22, 0);
  const jibShape = new THREE.Shape();
  jibShape.moveTo(0, 0); jibShape.lineTo(0, 0.5); jibShape.lineTo(0.3, 0); jibShape.closePath();   // jib, forward
  const jib = mesh(new THREE.ShapeGeometry(jibShape), new THREE.MeshStandardMaterial({ color: 0xffc94a, roughness: 0.9, side: THREE.DoubleSide }));
  jib.position.set(0.02, 0.2, 0.004);
  const flag = mesh(new THREE.BoxGeometry(0.12, 0.06, 0.008), COL.red);
  flag.position.set(-0.08, 0.87, 0);
  bob.add(hull, rim, mast, sail, jib, flag);
  // a little white wake, flat on the water behind the stern
  const wakeShape = new THREE.Shape();
  wakeShape.moveTo(-0.36, -0.13); wakeShape.lineTo(-0.95, -0.34); wakeShape.lineTo(-0.88, -0.22); wakeShape.lineTo(-0.36, -0.04);
  wakeShape.lineTo(-0.36, 0.04); wakeShape.lineTo(-0.88, 0.22); wakeShape.lineTo(-0.95, 0.34); wakeShape.lineTo(-0.36, 0.13); wakeShape.closePath();
  const wakeGeo = new THREE.ShapeGeometry(wakeShape);
  wakeGeo.rotateX(-Math.PI / 2);
  const wakeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false });
  const wake = new THREE.Mesh(wakeGeo, wakeMat);
  wake.position.y = 0.012;
  root.add(wake);
  return { root, bob, wakeMat };
}

function loco() {
  const g = new THREE.Group();
  const base = mesh(new RoundedBoxGeometry(0.62, 0.08, 0.3, 2, 0.02), COL.ink);
  base.position.y = 0.1;
  const boiler = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 18), COL.red);
  boiler.rotation.z = Math.PI / 2;
  boiler.position.set(0.1, 0.25, 0);
  const cab = mesh(new RoundedBoxGeometry(0.22, 0.3, 0.3, 2, 0.025), COL.red);
  cab.position.set(-0.18, 0.3, 0);
  const roof = mesh(new RoundedBoxGeometry(0.28, 0.04, 0.34, 2, 0.015), COL.ink);
  roof.position.set(-0.18, 0.47, 0);
  const chimney = mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.16, 12), COL.ink);
  chimney.position.set(0.2, 0.42, 0);
  const lamp = mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshStandardMaterial({ color: COL.lamp, emissive: 0xffd36a, emissiveIntensity: 0.5 }));
  lamp.position.set(0.31, 0.27, 0);
  g.add(base, boiler, cab, roof, chimney, lamp);
  const wheelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 14);
  for (const x of [-0.18, 0.02, 0.2]) for (const z of [-0.15, 0.15]) {
    const w = mesh(wheelGeo, 0x2b2d4f);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, 0.07, z);
    g.add(w);
  }
  return { g, chimneyTop: new THREE.Vector3(0.2, 0.55, 0) };
}

function wagon(color, cargo) {
  const g = new THREE.Group();
  const base = mesh(new RoundedBoxGeometry(0.48, 0.07, 0.28, 2, 0.02), COL.ink);
  base.position.y = 0.1;
  const tub = mesh(new RoundedBoxGeometry(0.44, 0.17, 0.26, 2, 0.03), color);
  tub.position.y = 0.21;
  g.add(base, tub);
  const geo = new THREE.SphereGeometry(0.065, 12, 8);
  for (const [x, z] of [[-0.12, -0.05], [0.0, 0.06], [0.12, -0.04], [-0.05, 0.07], [0.08, 0.07]]) {
    const c = mesh(geo, cargo);
    c.position.set(x, 0.32, z);
    g.add(c);
  }
  const wheelGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.04, 14);
  for (const x of [-0.14, 0.14]) for (const z of [-0.14, 0.14]) {
    const w = mesh(wheelGeo, 0x2b2d4f);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, 0.065, z);
    g.add(w);
  }
  return g;
}

function cloud(R) {
  const g = new THREE.Group();
  const m = mat(0xffffff, { roughness: 0.95 });
  const parts = [[0, 0, 0, 0.55], [0.55, -0.08, 0.05, 0.42], [-0.52, -0.1, -0.02, 0.4], [0.2, 0.25, -0.05, 0.38], [-0.22, 0.18, 0.12, 0.34]];
  for (const [x, y, z, r] of parts) {
    const s = mesh(new THREE.SphereGeometry(r * (0.95 + R() * 0.1), 24, 16), m);
    s.position.set(x, y, z);
    s.scale.y = 0.86;
    g.add(s);
  }
  return g;
}

function gull() {
  const root = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.1, 14, 10), COL.white);
  body.scale.set(1.5, 0.6, 0.6);
  const beak = mesh(new THREE.ConeGeometry(0.025, 0.08, 8), 0xffb347);
  beak.rotation.z = -Math.PI / 2;
  beak.position.x = 0.17;
  root.add(body, beak);
  const wingGeo = new RoundedBoxGeometry(0.11, 0.012, 0.3, 2, 0.005);
  wingGeo.translate(0, 0, 0.15);
  const wings = [];
  for (const s of [1, -1]) {
    const w = mesh(wingGeo, 0xf2f2f7);
    w.scale.z = s;
    w.position.y = 0.02;
    root.add(w);
    wings.push(w);
  }
  return { root, wings };
}

// ---------------------------------------------------------------- the whole diorama
export function buildDiorama(R, GP, trackRaw) {
  const scene = new THREE.Scene();
  const P = {};

  // plinth tray with a raised rim; the sea sits inside it
  const tray = [[6.75, -1.1], [6.75, 0.02], [6.73, 0.08], [6.68, 0.12], [6.47, 0.12], [6.38, 0.08], [6.36, -0.25], [0, -0.25]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  scene.add(mesh(new THREE.LatheGeometry(tray, 120), COL.plinth));
  const band = mesh(new THREE.TorusGeometry(6.77, 0.05, 10, 140), COL.lip);
  band.rotation.x = Math.PI / 2; band.position.y = -0.55;
  const band2 = mesh(new THREE.TorusGeometry(6.77, 0.03, 10, 140), COL.lip);
  band2.rotation.x = Math.PI / 2; band2.position.y = -0.42;
  scene.add(band, band2);
  const sea = mesh(new THREE.CircleGeometry(6.38, 120), new THREE.MeshStandardMaterial({ color: COL.sea, roughness: 0.28, metalness: 0 }));
  sea.rotation.x = -Math.PI / 2;
  sea.castShadow = false;
  scene.add(sea);

  // island: beach + grass cushion + a hill
  scene.add(mesh(cushion(4.35, -0.1, 0.18, 0.08), COL.sand));
  scene.add(mesh(cushion(3.95, 0.05, 0.42, 0.12), COL.grass));
  const foam = mesh(new THREE.TorusGeometry(4.4, 0.055, 8, 120), mat(COL.foam, { roughness: 0.6 }));
  foam.rotation.x = Math.PI / 2; foam.scale.z = 0.45; foam.position.y = 0.0;
  foam.castShadow = false;
  scene.add(foam);
  P.foam = foam;
  const [hx, hz] = polar(-135, 1.45);
  const hill = mesh(new THREE.SphereGeometry(1, 40, 20), COL.hill);
  hill.scale.set(1.05, 0.5, 1.05); hill.position.set(hx, 0.42, hz);
  scene.add(hill);

  // pier at the harbour (plan angle 50°)
  const pier = new THREE.Group();
  const [px, pz] = polar(50, 4.55);
  pier.position.set(px, 0, pz);
  pier.rotation.y = 50 * DEG;      // local +z points outward
  const deck = mesh(new RoundedBoxGeometry(0.34, 0.05, 0.95, 2, 0.015), COL.wood);
  deck.position.set(0, 0.17, 0);
  pier.add(deck);
  for (const z of [-0.3, 0.1, 0.42]) for (const x of [-0.14, 0.14]) {
    const post = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 8), COL.trunk);
    post.position.set(x, 0.0, z);
    pier.add(post);
  }
  scene.add(pier);

  // houses (in town, inside the track loop)
  const H = [
    { at: [0.55, 1.35], ry: 15, w: 0.62, d: 0.56, h: 0.55, wall: 0xfff1dc, roof: 0xff7a6b, chimney: true },
    { at: [1.6, 0.6], ry: -20, w: 0.58, d: 0.52, h: 0.5, wall: 0xffe08a, roof: 0x5b8def },
    { at: [1.25, -0.75], ry: 35, w: 0.6, d: 0.55, h: 0.56, wall: 0xffc4d3, roof: 0x2fb5a6, chimney: true },
    { at: [-0.45, 0.35], ry: 0, w: 0.72, d: 0.6, h: 0.86, wall: 0xc4f0d8, roof: 0xff7a6b },
    { at: [-1.45, 1.15], ry: -30, w: 0.56, d: 0.5, h: 0.5, wall: 0xdccfff, roof: 0xff9f43 },
    { at: [0.2, -1.75], ry: 10, w: 0.6, d: 0.52, h: 0.52, wall: 0xfff1dc, roof: 0x5b8def },
  ];
  P.houses = [];
  P.chimneys = [];
  for (const o of H) {
    const { g, top } = house(o);
    g.position.set(o.at[0], 0.42, o.at[1]);
    g.rotation.y = o.ry * DEG;
    scene.add(g);
    P.houses.push(g);
    if (top) P.chimneys.push(top);
  }

  // trees: a few in town, a ring outside the track (skipping the harbour and the lighthouse side)
  P.trees = [];
  const greens = [0x6cc66a, 0x57b65f, 0x8ed36b, 0x4fae74];
  const addTree = (x, z, kind, color, s) => {
    const t = tree(kind, color, s);
    t.position.set(x, 0.42, z);
    t.rotation.y = R() * Math.PI * 2;
    scene.add(t);
    P.trees.push(t);
  };
  addTree(-0.1, 2.1, 'blossom', 0xffb3c7, 0.9);
  addTree(-2.0, 0.55, 'ball', greens[0], 0.85);
  addTree(1.95, -0.25, 'pine', 0x3fa36b, 0.8);
  addTree(0.35, -0.2, 'ball', greens[2], 0.7);
  [-165, -140, -105, -75, -45, -15, 15, 125, 150, 175, 30].forEach((a, i) => {
    const [x, z] = polar(a + (R() - 0.5) * 8, 3.68 + R() * 0.12);
    const kind = i % 3 === 1 ? 'pine' : i === 6 || i === 9 ? 'blossom' : 'ball';
    addTree(x, z, kind, kind === 'pine' ? 0x3fa36b : kind === 'blossom' ? 0xffb3c7 : greens[i % 4], 0.85 + R() * 0.3);
  });

  // windmill on the hill, facing roughly toward the final camera
  const wm = windmill();
  wm.g.position.set(hx, 0.86, hz);
  wm.g.rotation.y = -62 * DEG;
  scene.add(wm.g);
  P.windmill = wm.g; P.blades = wm.blades;

  // lighthouse on rocks in the sea (plan angle 85°)
  const lhBase = new THREE.Group();
  const [lx, lz] = polar(85, 5.45);
  lhBase.position.set(lx, 0, lz);
  for (const [x, y, z, r] of [[0, 0.02, 0, 0.55], [0.42, -0.05, 0.25, 0.32], [-0.35, -0.08, 0.3, 0.28], [0.1, -0.06, -0.45, 0.3]]) {
    const rock = mesh(new THREE.DodecahedronGeometry(r, 0), COL.rock, { flatShading: true });
    rock.position.set(x, y, z);
    rock.rotation.set(R() * 3, R() * 3, R() * 3);
    lhBase.add(rock);
  }
  scene.add(lhBase);
  const lh = lighthouse();
  lh.g.position.set(lx, 0.3, lz);
  scene.add(lh.g);
  P.lighthouse = lh.g; P.beamPivot = lh.beamPivot; P.beamMat = lh.beamMat; P.lanternMat = lh.lanternMat;

  // railway: rails as tubes and sleepers as instances, both sampled from the GSAP motion path (trackRaw)
  const RAIL_Y = 0.445, N = 320, pos = {};
  const railCurves = [-0.075, 0.075].map((off) => {
    const pts = [];
    for (let i = 0; i < N; i++) {
      GP.getPositionOnPath(trackRaw, i / N, true, pos);
      const a = pos.angle * DEG, x = pos.x / 100, z = pos.y / 100;
      pts.push(new THREE.Vector3(x - Math.sin(a) * off, RAIL_Y, z + Math.cos(a) * off));
    }
    return new THREE.CatmullRomCurve3(pts, true);
  });
  P.rails = railCurves.map((c) => {
    const m = mesh(new THREE.TubeGeometry(c, N, 0.022, 6, true), 0x8b8fb5, { roughness: 0.4, metalness: 0.3 });
    m.castShadow = false;
    scene.add(m);
    return m;
  });
  const SLEEPERS = 96;
  const sleepers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.025, 0.26), mat(COL.wood), SLEEPERS);
  sleepers.receiveShadow = true;
  const q = new THREE.Quaternion(), e = new THREE.Euler(), m4 = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < SLEEPERS; i++) {
    GP.getPositionOnPath(trackRaw, i / SLEEPERS, true, pos);
    q.setFromEuler(e.set(0, -pos.angle * DEG, 0));
    m4.compose(new THREE.Vector3(pos.x / 100, RAIL_Y - 0.02, pos.y / 100), q, one);
    sleepers.setMatrixAt(i, m4);
  }
  scene.add(sleepers);
  P.sleepers = sleepers;
  P.railSegments = N;

  // the train: loco + two wagons
  const lc = loco();
  P.cars = [lc.g, wagon(0xffc93c, 0xff6b6b), wagon(0x34c3b3, 0xfff1dc)];
  P.locoChimney = lc.chimneyTop;
  for (const c of P.cars) { c.position.y = RAIL_Y - 0.02; scene.add(c); }

  // the boat
  const b = boat();
  scene.add(b.root);
  P.boat = b;

  // clouds on sticks, standing on the plinth rim
  P.clouds = [];
  for (const [a, top, s] of [[-58, 4.7, 1.0], [148, 3.9, 0.85], [62, 5.4, 0.9], [-128, 5.9, 0.7]]) {
    const [x, z] = polar(a, 6.56);
    const rig = new THREE.Group();
    rig.position.set(x, 0.12, z);
    const stick = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), COL.wood);
    stick.geometry.translate(0, 0.5, 0);    // pivot at its foot
    stick.scale.y = top;
    const holder = new THREE.Group();        // rides on the top of the stick
    holder.position.y = top;
    const bob = new THREE.Group();
    const c = cloud(R);
    c.scale.setScalar(s);
    bob.add(c);
    holder.add(bob);
    rig.add(stick, holder);
    scene.add(rig);
    P.clouds.push({ rig, stick, holder, bob, top, cloud: c });
  }

  // the toy sun on a wire arc leaning behind the island (behind = +x, the side the final shot looks toward)
  const ARC_R = 6.33, ARC_C = new THREE.Vector3(1.7, 0.12, 0);   // feet at r ≈ 6.55, on the rim
  const arc = mesh(new THREE.TorusGeometry(ARC_R, 0.035, 8, 160, Math.PI), mat(COL.lip, { roughness: 0.5 }));
  arc.rotation.y = Math.PI / 2;            // the half torus lies in the x–y plane; turn it into the z–y plane
  arc.position.copy(ARC_C);
  arc.castShadow = false;
  scene.add(arc);
  const sunMat = new THREE.MeshStandardMaterial({ color: 0xffd25a, emissive: 0xffb43a, emissiveIntensity: 1.1, roughness: 0.5 });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 20), sunMat);
  scene.add(sun);
  const gc = document.createElement('canvas');
  gc.width = gc.height = 128;
  const gx = gc.getContext('2d');
  const grad = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,236,170,0.9)'); grad.addColorStop(0.35, 'rgba(255,214,120,0.35)'); grad.addColorStop(1, 'rgba(255,200,100,0)');
  gx.fillStyle = grad; gx.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(gc);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
  glow.scale.setScalar(2.6);
  scene.add(glow);
  P.arc = arc; P.sun = sun; P.sunMat = sunMat; P.sunGlow = glow; P.ARC = { R: ARC_R, C: ARC_C };

  // seagull
  P.gull = gull();
  scene.add(P.gull.root);

  // smoke puffs: one instanced mesh, matrices set per frame from GSAP-driven ages
  P.puffMat = mat(0xffffff, { roughness: 1 });

  return { scene, P };
}
