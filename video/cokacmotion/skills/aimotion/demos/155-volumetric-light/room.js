/*
 * The workshop room, built in code: shell with a window opening, a mullioned frame, a plank floor (canvas texture),
 * a spindle-back chair, a potted fiddle-leaf plant and a work table with a few ceramics and books.
 * Nothing here moves. buildRoom() returns the scene graph plus the numbers main.js needs (window rectangle, room box).
 *
 * World: metres, y up, floor y = 0. The window wall is the plane z = 0 (its inside face); the room runs toward +z.
 * The window faces south (−z), so west is +x: a morning sun throws its light toward +x, an evening sun toward −x.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const ROOM = { x0: -2.1, x1: 2.1, h: 3.4, z1: 7.2, wt: 0.32 };          // inside box + wall thickness
export const WIN = { x0: -1.0, x1: 0.5, y0: 0.62, y1: 3.0, cols: 3, rows: 5, zf: -0.2 };   // opening; frame plane

// colour tokens: everything muted; the only accent in the picture is the sunlight itself
export const COL = {
  plaster: 0xc9c3b9, ceiling: 0xbdb8b0, trim: 0xd9d4cb, skirting: 0xa9a196,
  chair: 0x7c614c, table: 0x8b6f58, leaf: 0x6c7a5d, stem: 0x5d5947, pot: 0xa69a8b, soil: 0x3e3832,
  ceramic: 0xddd7cd, slate: 0x5f6873, sand: 0xa49782, brush: 0x6b5644,
};

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...o });
const place = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => {
  geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
  geo.translate(x, y, z);
  return geo;
};
const box = (w, h, d, x, y, z) => place(new THREE.BoxGeometry(w, h, d), x, y, z);
const rbox = (w, h, d, r, x, y, z, ry = 0) => place(new RoundedBoxGeometry(w, h, d, 3, r), x, y, z, 0, ry);
// merge geometries of mixed index state (RoundedBox is non-indexed, the rest indexed) after dropping the index
const merge = (list) => mergeGeometries(list.map((g) => {
  const n = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') n.deleteAttribute(k);
  return n;
}));
function mesh(geo, material, cast = true) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = cast; m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- plank floor (setup only, seeded)
function floorTexture(R, headless) {
  const N = 1024, TILE = 1.6, PW = 0.16;               // texture covers 1.6 m × 1.6 m; planks 16 cm wide, along z
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  const px = N / TILE;
  const cols = Math.round(TILE / PW);
  for (let i = 0; i < cols; i++) {
    const x0 = Math.round(i * PW * px), x1 = Math.round((i + 1) * PW * px);
    // each column: boards of random length, butt joints staggered
    let y = -R() * 1.2 * px;
    while (y < N) {
      const len = (0.9 + R() * 1.1) * px;
      const v = 0.86 + R() * 0.2, hue = R() * 10 - 5;
      g.fillStyle = `hsl(${28 + hue}, ${16 + R() * 6}%, ${44 * v}%)`;
      g.fillRect(x0, Math.max(0, y), x1 - x0, Math.min(N, y + len) - Math.max(0, y));
      // grain: long, slightly wavy darker and lighter streaks
      for (let k = 0; k < 7; k++) {
        const gx = x0 + 3 + R() * (x1 - x0 - 6), amp = 1 + R() * 2.5, ph = R() * 6, f = 0.004 + R() * 0.01;
        g.strokeStyle = R() < 0.6 ? `rgba(60,40,25,${0.06 + R() * 0.08})` : `rgba(255,240,220,${0.04 + R() * 0.05})`;
        g.lineWidth = 0.8 + R() * 1.6;
        g.beginPath();
        for (let yy = Math.max(0, y); yy <= Math.min(N, y + len); yy += 8) {
          const xx = gx + Math.sin(yy * f + ph) * amp;
          if (yy === Math.max(0, y)) g.moveTo(xx, yy); else g.lineTo(xx, yy);
        }
        g.stroke();
      }
      g.fillStyle = 'rgba(30,22,16,0.55)';
      if (y > 0) g.fillRect(x0, y - 1, x1 - x0, 2);   // butt joint
      y += len;
    }
    g.fillStyle = 'rgba(28,20,14,0.6)';
    g.fillRect(x0, 0, 2, N);                           // seam between plank columns
  }
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.anisotropy = 4;
  return { tx, tile: TILE };
}

// ---------------------------------------------------------------- the shell: floor, walls with the opening, ceiling
function shell(R, headless) {
  const g = new THREE.Group();
  const { x0, x1, h, z1, wt } = ROOM;
  const W = WIN;
  // the shell casts with its sun-facing (outer) faces: three's default (back faces) lets the depth bias leak a thin
  // line of sun into every inside corner; the outer faces sit a wall's thickness away from any inside surface
  const plaster = mat(COL.plaster, { roughness: 0.95, shadowSide: THREE.FrontSide });

  const ft = floorTexture(R, headless);
  const fw = x1 - x0, fd = z1 + 0.2;
  const floorGeo = new THREE.PlaneGeometry(fw, fd);
  floorGeo.rotateX(-Math.PI / 2);
  floorGeo.translate((x0 + x1) / 2, 0, fd / 2 - 0.1);
  // world-anchored UVs: u = x / tile, v = z / tile
  const p = floorGeo.attributes.position, uv = floorGeo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / ft.tile, p.getZ(i) / ft.tile);
  const floor = mesh(floorGeo, mat(0xffffff, { map: ft.tx, roughness: 0.62 }), false);
  g.add(floor);

  // back wall: one slab with the opening cut out (a Shape with a hole, extruded through the wall thickness). Separate
  // blocks meeting at T-junctions leave sub-pixel cracks that show the bright sky behind the wall.
  const ext = 0.4, below = 0.3;
  const outline = new THREE.Shape();
  outline.moveTo(x0 - ext, -below); outline.lineTo(x1 + ext, -below); outline.lineTo(x1 + ext, h + ext); outline.lineTo(x0 - ext, h + ext); outline.closePath();
  const hole = new THREE.Path();
  hole.moveTo(W.x0, W.y0); hole.lineTo(W.x0, W.y1); hole.lineTo(W.x1, W.y1); hole.lineTo(W.x1, W.y0); hole.closePath();
  outline.holes.push(hole);
  const back = new THREE.ExtrudeGeometry(outline, { depth: wt, bevelEnabled: false, curveSegments: 1 });
  back.translate(0, 0, -wt);
  g.add(mesh(back, plaster));
  // side walls and ceiling (closed box: they must cast, or sun would fall through them in the shadow map)
  const side = merge([
    box(0.3, h + ext + below, z1 + wt, x0 - 0.15, (h + ext - below) / 2, (z1 - wt) / 2),
    box(0.3, h + ext + below, z1 + wt, x1 + 0.15, (h + ext - below) / 2, (z1 - wt) / 2),
  ]);
  g.add(mesh(side, plaster));
  g.add(mesh(box(x1 - x0 + 0.6, 0.3, z1 + wt, (x0 + x1) / 2, h + 0.15, (z1 - wt) / 2), mat(COL.ceiling, { roughness: 0.95, shadowSide: THREE.FrontSide })));
  g.add(mesh(box(x1 - x0 + 0.6, h + 0.6 + below, 0.3, (x0 + x1) / 2, (h - below) / 2, z1 + 0.15), plaster));   // wall behind the camera

  // skirting boards
  const sk = 0.1, st = 0.018;
  g.add(mesh(merge([
    rbox(W.x0 - x0, sk, st, 0.006, (x0 + W.x0) / 2, sk / 2, st / 2),
    rbox(x1 - W.x1, sk, st, 0.006, (W.x1 + x1) / 2, sk / 2, st / 2),
    rbox(W.x1 - W.x0, sk, st, 0.006, (W.x0 + W.x1) / 2, sk / 2, st / 2),
    rbox(st, sk, z1, 0.006, x0 + st / 2, sk / 2, z1 / 2),
    rbox(st, sk, z1, 0.006, x1 - st / 2, sk / 2, z1 / 2),
  ]), mat(COL.skirting, { roughness: 0.7 })));
  return g;
}

// ---------------------------------------------------------------- window: sill, frame, mullions, transoms
function windowFrame() {
  const W = WIN, fw = 0.075, mw = 0.042, fd = 0.07;           // frame width, muntin width, frame depth
  const parts = [];
  const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2, ww = W.x1 - W.x0, wh = W.y1 - W.y0;
  parts.push(rbox(fw, wh, fd, 0.01, W.x0 + fw / 2, cy, W.zf));
  parts.push(rbox(fw, wh, fd, 0.01, W.x1 - fw / 2, cy, W.zf));
  parts.push(rbox(ww, fw, fd, 0.01, cx, W.y0 + fw / 2, W.zf));
  parts.push(rbox(ww, fw, fd, 0.01, cx, W.y1 - fw / 2, W.zf));
  for (let i = 1; i < W.cols; i++) parts.push(rbox(mw, wh - fw, fd * 0.8, 0.008, W.x0 + fw / 2 + ((ww - fw) * i) / W.cols, cy, W.zf));
  for (let j = 1; j < W.rows; j++) parts.push(rbox(ww - fw, mw, fd * 0.8, 0.008, cx, W.y0 + fw / 2 + ((wh - fw) * j) / W.rows, W.zf));
  // a heavier meeting rail two rows up, like a sash window
  parts.push(rbox(ww - fw, 0.06, fd, 0.01, cx, W.y0 + fw / 2 + ((wh - fw) * 2) / W.rows, W.zf + 0.01));
  // inner sill: a rounded ledge standing 9 cm into the room
  parts.push(rbox(ww + 0.16, 0.045, ROOM.wt + 0.09, 0.012, cx, W.y0 - 0.0225 + 0.004, -ROOM.wt / 2 + 0.045));
  return mesh(merge(parts), mat(COL.trim, { roughness: 0.55 }));
}

// ---------------------------------------------------------------- chair (spindle back), faces +z before rotation
function chair() {
  const wood = [];
  const sh = 0.45, sw = 0.44, sd = 0.42, legR = 0.019;
  wood.push(rbox(sw, 0.045, sd, 0.016, 0, sh, 0));
  const lx = sw / 2 - 0.04, lzF = sd / 2 - 0.04, lzB = -sd / 2 + 0.035;
  for (const sx of [-1, 1]) {
    wood.push(place(new THREE.CylinderGeometry(legR * 0.85, legR, sh - 0.02, 12), sx * lx, (sh - 0.02) / 2, lzF));
    wood.push(place(new THREE.CylinderGeometry(legR * 0.9, legR, sh - 0.02, 12), sx * lx, (sh - 0.02) / 2, lzB));
    wood.push(place(new THREE.CylinderGeometry(0.009, 0.009, lzF - lzB, 8), sx * lx, 0.16, (lzF + lzB) / 2, Math.PI / 2));   // side stretchers
  }
  wood.push(place(new THREE.CylinderGeometry(0.009, 0.009, 2 * lx, 8), 0, 0.12, lzF, 0, 0, Math.PI / 2));                  // front stretcher
  // the back, raked 7° about the seat's rear edge
  const back = [];
  const bh = 0.47;                                      // posts rise this far above the seat
  for (const sx of [-1, 1]) back.push(place(new THREE.CylinderGeometry(legR * 0.8, legR * 0.95, bh, 12), sx * lx, bh / 2, 0));
  back.push(rbox(2 * lx + 0.05, 0.075, 0.03, 0.012, 0, bh - 0.04, 0));
  back.push(rbox(2 * lx, 0.028, 0.022, 0.008, 0, 0.12, 0));
  const ns = 5;
  for (let i = 0; i < ns; i++) {
    const x = -lx + (2 * lx * (i + 1)) / (ns + 1);
    back.push(place(new THREE.CylinderGeometry(0.0095, 0.0095, bh - 0.18, 8), x, 0.12 + (bh - 0.18) / 2, 0));
  }
  const rake = new THREE.Matrix4().makeRotationX(-0.12);
  for (const b of back) { b.applyMatrix4(rake); b.translate(0, sh, lzB); wood.push(b); }
  const g = new THREE.Group();
  g.add(mesh(merge(wood), mat(COL.chair, { roughness: 0.58 })));
  return g;
}

// ---------------------------------------------------------------- potted fiddle-leaf plant
function leafGeometry(len, wid, fold, droop) {
  // a broad leaf, wider toward the tip (fiddle shape), folded along the midrib and drooping along its length
  const NS = 10, NW = 4;
  const pos = [], idx = [];
  for (let i = 0; i <= NS; i++) {
    const s = i / NS;
    const w = wid * Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.92 + 0.04)), 0.75) * (0.75 + 0.45 * s) * (1 - 0.12 * Math.exp(-(((s - 0.45) / 0.12) ** 2)));
    for (let j = -NW; j <= NW; j++) {
      const u = j / NW;
      const x = u * w;
      const y = s * len;
      const z = fold * Math.abs(x) - droop * s * s * len + 0.04 * len * Math.sin(Math.PI * u) * s;
      pos.push(x, y, z);
    }
  }
  const row = 2 * NW + 1;
  for (let i = 0; i < NS; i++) for (let j = 0; j < 2 * NW; j++) {
    const a = i * row + j, b = a + 1, c = a + row, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
/* A leaf as two front-facing sheets 2 mm apart with opposite normals, so each side has its own outward normal. (A single
   DoubleSide sheet shades its back with a flipped normal but offsets its shadow lookup along the front one.) */
function twoSided(g, gap) {
  const P = g.attributes.position.array, N = g.attributes.normal.array, I = g.index.array, n = P.length / 3;
  const pos = new Float32Array(P.length * 2), nor = new Float32Array(N.length * 2), idx = new Uint16Array(I.length * 2);
  pos.set(P); nor.set(N); idx.set(I);
  for (let i = 0; i < n * 3; i++) { pos[n * 3 + i] = P[i] - N[i] * gap; nor[n * 3 + i] = -N[i]; }
  for (let i = 0; i < I.length; i += 3) { idx[I.length + i] = I[i] + n; idx[I.length + i + 1] = I[i + 2] + n; idx[I.length + i + 2] = I[i + 1] + n; }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}
function plant(R) {
  const g = new THREE.Group();
  // pot: lathe with a rolled rim
  const prof = [[0, 0], [0.13, 0], [0.145, 0.01], [0.175, 0.27], [0.19, 0.285], [0.198, 0.305], [0.19, 0.318], [0.176, 0.312], [0.168, 0.29], [0, 0.29]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(prof, 40), mat(COL.pot, { roughness: 0.9 })));
  const soil = new THREE.CircleGeometry(0.168, 32).rotateX(-Math.PI / 2).translate(0, 0.29, 0);
  g.add(mesh(soil, mat(COL.soil, { roughness: 1 }), false));
  // three stems; leaves spiral up each (golden angle), larger and more upright toward the top
  const leaves = [], stems = [];
  const STEMS = [[0.02, 0.0, 1.62, 0.0], [-0.07, 0.04, 1.24, 2.1], [0.06, -0.05, 0.96, 4.2]];
  STEMS.forEach(([sx, sz, top, ph], si) => {
    const lean = new THREE.Vector3(Math.cos(ph) * 0.11, 0, Math.sin(ph) * 0.11);
    const pts = [0, 0.33, 0.66, 1].map((k) => new THREE.Vector3(sx + lean.x * k * k, 0.27 + (top - 0.27) * k, sz + lean.z * k * k));
    const curve = new THREE.CatmullRomCurve3(pts);
    stems.push(new THREE.TubeGeometry(curve, 12, 0.011 - si * 0.002, 6));
    const n = 7 - si;
    for (let i = 0; i < n; i++) {
      const k = 0.32 + (0.68 * i) / (n - 1);
      const base = curve.getPoint(k);
      const azm = ph + i * 2.39996 + (R() - 0.5) * 0.5;
      const len = 0.2 + 0.1 * k + R() * 0.04;
      const geo = twoSided(leafGeometry(len, len * 0.36, 0.22, 0.32 + 0.2 * (1 - k)), 0.002);
      // orient: leaf axis +y → outward and up; leaf face toward the sky
      const up = 0.55 + 0.6 * k + (R() - 0.5) * 0.2;              // elevation of the leaf axis (rad)
      const m = new THREE.Matrix4().makeRotationY(-azm + Math.PI / 2)
        .multiply(new THREE.Matrix4().makeRotationX(-(Math.PI / 2 - up)))
        .multiply(new THREE.Matrix4().makeRotationY((R() - 0.5) * 0.6));
      geo.applyMatrix4(m);
      geo.translate(base.x, base.y, base.z);
      leaves.push(geo);
    }
  });
  // the leaves are lit at grazing angles, where the sun's 1.6 cm penumbra stretches across a whole leaf: three's PCF
  // (5 taps, rotated per pixel by interleaved gradient noise) shows there as a dot pattern. The leaves get their own
  // lookup instead: 16 taps on a fixed Vogel disc, smooth (leaves cover few pixels, so it costs little)
  const leafMat = mat(COL.leaf, { roughness: 0.6 });
  leafMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <shadowmap_pars_fragment>', `#include <shadowmap_pars_fragment>
#ifdef USE_SHADOWMAP
float leafShadow(sampler2DShadow map, vec2 size, float intensity, float bias, float radius, vec4 c) {
  c.xyz /= c.w; c.z += bias;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
  float r = radius / size.x, s = 0.0;
  for (int k = 0; k < 16; k++) {
    float a = float(k) * 2.39996323, q = sqrt((float(k) + 0.5) / 16.0);
    s += texture(map, vec3(c.xy + vec2(cos(a), sin(a)) * q * r, c.z));
  }
  return mix(1.0, s / 16.0, intensity);
}
#endif`)
      .replace('#include <lights_fragment_begin>', THREE.ShaderChunk.lights_fragment_begin.replaceAll('getShadow( directionalShadowMap', 'leafShadow( directionalShadowMap'));
  };
  g.add(mesh(mergeGeometries(leaves), leafMat));
  g.add(mesh(mergeGeometries(stems), mat(COL.stem, { roughness: 0.8 })));
  return g;
}

// ---------------------------------------------------------------- work table + a few objects
function lathe(points, seg = 40) { return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg); }
function table(R) {
  const g = new THREE.Group();
  const tw = 0.62, tl = 1.25, th = 0.76, top = 0.045;
  const wood = [rbox(tw, top, tl, 0.012, 0, th - top / 2, 0)];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) wood.push(rbox(0.05, th - top, 0.05, 0.01, sx * (tw / 2 - 0.05), (th - top) / 2, sz * (tl / 2 - 0.06)));
  wood.push(rbox(tw - 0.1, 0.08, 0.025, 0.008, 0, th - top - 0.04, tl / 2 - 0.06));
  wood.push(rbox(tw - 0.1, 0.08, 0.025, 0.008, 0, th - top - 0.04, -tl / 2 + 0.06));
  wood.push(rbox(0.025, 0.08, tl - 0.12, 0.008, -tw / 2 + 0.05, th - top - 0.04, 0));
  g.add(mesh(merge(wood), mat(COL.table, { roughness: 0.55 })));
  const ceramic = mat(COL.ceramic, { roughness: 0.38 });
  // vase
  const vase = lathe([[0, 0], [0.06, 0], [0.068, 0.012], [0.078, 0.07], [0.074, 0.13], [0.05, 0.19], [0.042, 0.215], [0.05, 0.235], [0.047, 0.24], [0.038, 0.225], [0, 0.2]]);
  vase.translate(0.02, th, -0.36);
  // bowl
  const bowl = lathe([[0, 0.004], [0.04, 0], [0.075, 0.018], [0.095, 0.05], [0.09, 0.052], [0.07, 0.024], [0, 0.012]]);
  bowl.translate(-0.08, th, 0.43);
  // jar for brushes
  const jar = lathe([[0, 0], [0.045, 0], [0.05, 0.01], [0.05, 0.12], [0.045, 0.125], [0.043, 0.115], [0, 0.11]]);
  jar.translate(0.1, th, 0.3);
  g.add(mesh(merge([vase, bowl]), ceramic));
  g.add(mesh(jar, mat(COL.slate, { roughness: 0.5 })));
  const brushes = [];
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7 + 0.4, r = 0.02;
    const b = new THREE.CylinderGeometry(0.0045, 0.006, 0.27, 6);
    place(b, 0.1 + Math.cos(a) * r, th + 0.15, 0.3 + Math.sin(a) * r, Math.sin(a) * 0.16, 0, -Math.cos(a) * 0.16);
    brushes.push(b);
  }
  g.add(mesh(merge(brushes), mat(COL.brush, { roughness: 0.6 })));
  // two books, slightly askew
  g.add(mesh(rbox(0.2, 0.035, 0.27, 0.006, 0.05, th + 0.0175, 0.02, 0.12), mat(COL.slate, { roughness: 0.75 })));
  g.add(mesh(rbox(0.17, 0.03, 0.235, 0.006, 0.04, th + 0.05, 0.03, -0.1), mat(COL.sand, { roughness: 0.75 })));
  return g;
}

/** The whole room. Placement numbers are chosen so that the sun's path (main.js) crosses the props on cue. */
export function buildRoom(R, headless) {
  const group = new THREE.Group();
  group.add(shell(R, headless));
  group.add(windowFrame());
  const ch = chair();
  ch.position.set(-0.86, 0, 2.05);
  ch.rotation.y = 0.55;
  group.add(ch);
  const pl = plant(R);
  pl.position.set(-0.72, 0, 0.5);
  group.add(pl);
  const tb = table(R);
  tb.position.set(1.7, 0, 0.95);
  group.add(tb);
  return { group, chair: ch, plant: pl, table: tb };
}
