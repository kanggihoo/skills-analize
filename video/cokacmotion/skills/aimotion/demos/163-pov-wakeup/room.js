/*
 * room.js — the bedroom (near scene) and the town outside the window (far scene), all built in code.
 *
 *   near:  walls with a window opening (they cast the sun's shadow), bed, dented pillow, duvet on two draped
 *          sections, nightstand, the tomato twin-bell alarm clock (the one accent), pendant lamp, two pleated
 *          curtain panels whose geometry is rewritten per frame, a plant, a picture, the viewer's two arms.
 *   far:   terrain on a slope down to a river valley and up to hills, instanced houses / roofs / windows / trees,
 *          a road, clouds and a sky dome. Rendered with its own camera (near 1 m, far 1500 m) before the room.
 * Units are metres; the room floor is y = 0, the window wall is z = −2.4 and looks toward −z.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, lerp, smooth } from '../_lib/stage.js';

export const ROOM = { X0: -1.6, X1: 1.8, Z0: -2.4, Z1: 1.8, H: 2.6, WALL: 0.14 };
export const WIN = { X0: -0.75, X1: 0.95, Y0: 0.95, Y1: 2.32 };
export const CURT = { Z: -2.23, TOP: 2.42, BOT: 0.6, L: 1.3, PLEATS: 7, OUT_L: -1.02, OUT_R: 1.22, LEAD_L: 0.07, LEAD_R: 0.13 };
export const CLOCK = new THREE.Vector3(0.88, 0.55, 1.38);   // base centre on the nightstand
export const PAL = {
  wall: '#efe1cf', ceil: '#f3ebdf', wood: '#c39066', woodL: '#d6b28c', sheet: '#f2ede4', duvet: '#a9b89d', duvetD: '#93a588',
  linen: '#f1e4cf', trim: '#f6f1e8', ink: '#2f2b2a', sleeve: '#8d9fba', skin: '#e9b591', sage: '#8fa98a', sand: '#dcc7a6',
  accent: '#ff5a3c',
};
const C = (h) => new THREE.Color(h);
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0, ...o });
const rbox = (w, h, d, r, s = 4) => new RoundedBoxGeometry(w, h, d, s, r);

export function canvasTex(w, h, draw, headless, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  draw(g, w, h);
  const tx = new THREE.CanvasTexture(c);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}

/** a polyline with rounded corners, resampled evenly by arc length → [[x, y], …] (n points) */
function roundedPath(pts, r, n) {
  const dense = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const a = Math.hypot(px - cx, py - cy), b = Math.hypot(nx - cx, ny - cy), rr = Math.min(r, a / 2, b / 2);
    const p0 = [cx + ((px - cx) / a) * rr, cy + ((py - cy) / a) * rr], p1 = [cx + ((nx - cx) / b) * rr, cy + ((ny - cy) / b) * rr];
    for (let k = 0; k <= 8; k++) {                                   // quadratic Bezier through the corner
      const s = k / 8, u = 1 - s;
      dense.push([u * u * p0[0] + 2 * u * s * cx + s * s * p1[0], u * u * p0[1] + 2 * u * s * cy + s * s * p1[1]]);
    }
  }
  dense.push(pts[pts.length - 1]);
  const L = [0];
  for (let i = 1; i < dense.length; i++) L.push(L[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const out = [];
  for (let k = 0, j = 0; k < n; k++) {
    const s = (L[L.length - 1] * k) / (n - 1);
    while (j < L.length - 2 && L[j + 1] < s) j++;
    const f = (s - L[j]) / Math.max(1e-9, L[j + 1] - L[j]);
    out.push([lerp(dense[j][0], dense[j + 1][0], f), lerp(dense[j][1], dense[j + 1][1], f)]);
  }
  return out;
}

// ================================================================ curtains: pleats that keep the cloth length
// A panel of flat width L hung over a width W folds into n pleats z = A·sin(2πn·s). A(W) solves
// ∫₀¹ √(W² + (2πnA·cos 2πns)²) ds = L by bisection (the exact arc length), tabulated once.
function pleatTable(L, n) {
  const N = 96, tab = new Float32Array(N + 1);
  const arc = (W, A) => { let s = 0; const M = 160; for (let i = 0; i < M; i++) { const c = Math.cos(2 * Math.PI * n * (i + 0.5) / M); s += Math.sqrt(W * W + (2 * Math.PI * n * A * c) ** 2); } return s / M; };
  for (let i = 0; i <= N; i++) {
    const W = Math.max(0.02, (L * i) / N);
    let lo = 0, hi = L;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (arc(W, m) > L) hi = m; else lo = m; }
    tab[i] = (lo + hi) / 2;
  }
  return (W) => { const f = clamp(W / L) * N, i = Math.min(N - 1, Math.floor(f)); return lerp(tab[i], tab[i + 1], f - i); };
}

function makeCurtain(side, material, ampOf) {
  const NC = 72, NR = 14;
  const g = new THREE.PlaneGeometry(1, 1, NC - 1, NR - 1);
  const uv = g.attributes.uv;
  for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) uv.setXY(j * NC + i, i / (NC - 1), 1 - j / (NR - 1));
  const mesh = new THREE.Mesh(g, material);
  mesh.castShadow = true; mesh.receiveShadow = true;
  const out = side < 0 ? CURT.OUT_L : CURT.OUT_R;
  const pos = g.attributes.position;
  /** lead: x of the leading edge at the rod; lag: x of the hem's leading edge; billow: forward bulge (m) */
  mesh.userData.update = (lead, lag, billow) => {
    for (let j = 0; j < NR; j++) {
      const r = j / (NR - 1);
      const xl = lerp(lead, lag, r ** 1.6), W = Math.abs(xl - out), A = ampOf(W);
      for (let i = 0; i < NC; i++) {
        const s = i / (NC - 1);
        const x = out + (xl - out) * s;
        const z = CURT.Z + A * Math.sin(2 * Math.PI * CURT.PLEATS * s) * (0.9 + 0.2 * r) + billow * Math.sin(Math.PI * s) * r * r;
        pos.setXYZ(j * NC + i, x, CURT.TOP - r * (CURT.TOP - CURT.BOT), z);
      }
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
  };
  return mesh;
}

// ================================================================ the alarm clock
function makeClock(headless) {
  const red = mat(PAL.accent, { roughness: 0.42 });
  const metal = mat('#3b3634', { roughness: 0.35, metalness: 0.6 });
  const root = new THREE.Group();                    // sits on the nightstand, faces the bed (−x)
  root.position.copy(CLOCK);
  root.rotation.y = -Math.PI / 2;
  const rock = new THREE.Group();                    // the ringing rock pivots about the base
  root.add(rock);
  // body: a lathed puck with rounded rims, axis turned to face +z (local)
  const R = 0.058, Dp = 0.052, e = 0.014, prof = [];
  prof.push(new THREE.Vector2(0.0001, -Dp / 2));
  for (let k = 0; k <= 6; k++) { const a = -Math.PI / 2 + (k / 6) * (Math.PI / 2); prof.push(new THREE.Vector2(R - e + e * Math.cos(a), -Dp / 2 + e + e * Math.sin(a))); }
  for (let k = 0; k <= 6; k++) { const a = (k / 6) * (Math.PI / 2); prof.push(new THREE.Vector2(R - e + e * Math.cos(a), Dp / 2 - e + e * Math.sin(a))); }
  prof.push(new THREE.Vector2(0.0001, Dp / 2));
  const bodyG = new THREE.LatheGeometry(prof, 48);
  bodyG.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyG, red);
  body.position.y = 0.076;
  // dial: the time it rings at, 7:00, painted once
  const dialTex = canvasTex(512, 512, (g, w) => {
    const c = w / 2;
    g.fillStyle = '#fff4e2'; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#3a3330'; g.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, big = i % 3 === 0;
      g.lineWidth = big ? 16 : 8;
      g.beginPath(); g.moveTo(c + Math.sin(a) * c * (big ? 0.66 : 0.72), c - Math.cos(a) * c * (big ? 0.66 : 0.72));
      g.lineTo(c + Math.sin(a) * c * 0.84, c - Math.cos(a) * c * 0.84); g.stroke();
    }
    const hand = (a, len, wdt) => { g.lineWidth = wdt; g.beginPath(); g.moveTo(c - Math.sin(a) * 26, c + Math.cos(a) * 26); g.lineTo(c + Math.sin(a) * len, c - Math.cos(a) * len); g.stroke(); };
    hand((7 / 12) * Math.PI * 2, c * 0.44, 22);      // hour hand on 7
    hand(0, c * 0.66, 14);                            // minute hand on 12
    g.fillStyle = '#3a3330'; g.beginPath(); g.arc(c, c, 26, 0, Math.PI * 2); g.fill();
  }, headless);
  dialTex.generateMipmaps = true;
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.046, 48), new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  dial.position.set(0, 0.076, Dp / 2 + 0.0008);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.0065, 10, 48), red);
  bezel.position.set(0, 0.076, Dp / 2 - 0.001);
  rock.add(body, dial, bezel);
  // twin bells, hammer, snooze button, feet
  const bellG = new THREE.SphereGeometry(0.031, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const bellM = mat(PAL.accent, { roughness: 0.32, metalness: 0.15, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const b = new THREE.Mesh(bellG, bellM);
    b.position.set(s * 0.036, 0.126, -0.002);
    b.rotation.z = -s * 0.62;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 8), metal);
    stem.position.set(s * 0.03, 0.124, -0.002); stem.rotation.z = -s * 0.62;
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 8), metal);
    foot.position.set(s * 0.04, 0.012, 0);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, 6), metal);
    leg.position.set(s * 0.034, 0.024, 0); leg.rotation.z = s * 0.5;
    rock.add(b, stem, foot, leg);
  }
  const hammer = new THREE.Group();
  hammer.position.set(0, 0.13, -0.004);
  const hRod = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.036, 6), metal);
  hRod.position.y = 0.018;
  const hBall = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 8), metal);
  hBall.position.y = 0.037;
  hammer.add(hRod, hBall);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.012, 20), metal);
  button.position.set(0, 0.137, -0.018);
  rock.add(hammer, button);
  rock.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // ringing lines: three arcs either side, in the dial plane, pulsing outward
  const arcs = [];
  const arcM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.93, 0.82), transparent: true, depthWrite: false });
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 20, 0.9), arcM.clone());
    m.rotation.z = (s < 0 ? Math.PI * 0.62 : Math.PI * 0.38) - 0.45;
    m.position.set(0, 0.09, 0.0);
    m.userData = { i, s };
    root.add(m);
    arcs.push(m);
  }
  return { root, rock, hammer, button, arcs, buttonY: button.position.y };
}

// ================================================================ the viewer's arm (one side; mirrored for the left)
function makeArm(side, skinM, sleeveM) {
  const g = new THREE.Group();
  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.26, 6, 16), sleeveM);
  const fore = new THREE.Group();                 // origin at the elbow, +y toward the wrist
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.042, 0.2, 18), sleeveM);
  sleeve.position.y = 0.1;
  const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 8, 20), sleeveM);
  cuff.rotation.x = Math.PI / 2; cuff.position.y = 0.2;
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.029, 0.11, 6, 14), skinM);
  arm.position.y = 0.205;
  arm.scale.set(1, 1, 0.82);
  fore.add(sleeve, cuff, arm);
  const hand = new THREE.Group();                 // origin at the wrist, +y toward the fingertips, palm faces −z
  const palm = new THREE.Mesh(rbox(0.084, 0.092, 0.032, 0.014), skinM);
  palm.position.y = 0.048;
  hand.add(palm);
  const fingers = [];
  const FX = [-0.0315, -0.0105, 0.0105, 0.0315], FL = [0.074, 0.084, 0.078, 0.062];   // index (beside the thumb) … little finger
  FX.forEach((x, k) => {
    const knuckle = new THREE.Group();
    knuckle.position.set(x * side, 0.09, -0.002);
    const r = k === 3 ? 0.0082 : 0.0093;
    const p1 = new THREE.Mesh(new THREE.CapsuleGeometry(r, FL[k] * 0.5, 4, 10), skinM);
    p1.position.y = FL[k] * 0.27;
    const mid = new THREE.Group();
    mid.position.y = FL[k] * 0.54;
    const p2 = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.95, FL[k] * 0.36, 4, 10), skinM);
    p2.position.y = FL[k] * 0.2;
    mid.add(p2); knuckle.add(p1, mid);
    hand.add(knuckle);
    fingers.push({ knuckle, mid });
  });
  const thumb = new THREE.Group();
  thumb.position.set(-0.04 * side, 0.03, -0.008);
  thumb.rotation.set(-0.35, 0, 0.75 * side);
  const t1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0115, 0.036, 4, 10), skinM);
  t1.position.y = 0.022;
  const tMid = new THREE.Group(); tMid.position.y = 0.044;
  const t2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0105, 0.024, 4, 10), skinM);
  t2.position.y = 0.016;
  tMid.add(t2); thumb.add(t1, tMid); hand.add(thumb);
  g.add(upper, fore, hand);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.visible = false;
  const Y = new THREE.Vector3(0, 1, 0), m4 = new THREE.Matrix4(), xA = new THREE.Vector3(), yA = new THREE.Vector3(), zA = new THREE.Vector3();
  const basis = (o, origin, y, back) => {          // place o with +y along `y` and +z toward `back`
    yA.copy(y).normalize();
    zA.copy(back).addScaledVector(yA, -back.dot(yA)).normalize();
    xA.crossVectors(yA, zA);
    m4.makeBasis(xA, yA, zA);
    o.quaternion.setFromRotationMatrix(m4);
    o.position.copy(origin);
  };
  const tmp = new THREE.Vector3(), back = new THREE.Vector3();
  return {
    group: g,
    /** S shoulder, E elbow, W wrist, hf hand forward, pn palm normal (world); curl 0 open … 1 fist */
    pose(S, E, W, hf, pn, curl) {
      g.visible = true;
      tmp.subVectors(E, S);
      upper.position.copy(S).addScaledVector(tmp, 0.5);
      upper.quaternion.setFromUnitVectors(Y, tmp.normalize());
      back.copy(pn).negate();
      basis(fore, E, tmp.subVectors(W, E), back);
      basis(hand, W, hf, back);
      fingers.forEach((f, k) => { const c = curl * (1 + 0.12 * k); f.knuckle.rotation.x = -1.05 * c; f.mid.rotation.x = -1.25 * c; });
      thumb.rotation.x = -0.35 - 0.5 * curl; tMid.rotation.x = -0.6 * curl;
    },
  };
}

// ================================================================ the room
export function buildRoom(headless) {
  const scene = new THREE.Scene();
  const R = ROOM;
  const wallM = mat(PAL.wall, { roughness: 0.95 }), ceilM = mat(PAL.ceil, { roughness: 0.95 });
  const add = (geo, m, x, y, z, o = {}) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = o.cast ?? true; mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  const box = (x0, x1, y0, y1, z0, z1, m) => add(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  // floor: soft planks
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = PAL.wood; g.fillRect(0, 0, w, h);
    const r = rand0(31);
    for (let i = 0; i < 8; i++) {
      const y0 = (i * h) / 8;
      g.fillStyle = `rgba(${i % 2 ? '255,236,210' : '120,80,50'},${0.05 + r() * 0.05})`;
      g.fillRect(0, y0, w, h / 8);
      for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(110,70,40,${0.03 + r() * 0.03})`; g.fillRect(r() * w, y0 + r() * h / 8, 80 + r() * 260, 2 + r() * 3); }
      g.fillStyle = 'rgba(90,58,36,0.28)'; g.fillRect(0, y0, w, 3);
      const cut = r() * w; g.fillRect(cut, y0, 3, h / 8);
    }
  }, headless);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(2.2, 2.2);
  const floor = add(new THREE.PlaneGeometry(R.X1 - R.X0, R.Z1 - R.Z0), mat('#ffffff', { map: floorTex, roughness: 0.7 }), (R.X0 + R.X1) / 2, 0, (R.Z0 + R.Z1) / 2, { cast: false });
  floor.rotation.x = -Math.PI / 2;
  box(R.X0 - 0.1, R.X1 + 0.1, R.H, R.H + 0.1, R.Z0 - R.WALL, R.Z1 + 0.1, ceilM);           // ceiling
  box(R.X0 - 0.1, R.X0, 0, R.H, R.Z0, R.Z1, wallM);                                          // left
  box(R.X1, R.X1 + 0.1, 0, R.H, R.Z0, R.Z1, wallM);                                          // right
  box(R.X0, R.X1, 0, R.H, R.Z1, R.Z1 + 0.1, wallM);                                          // headboard wall
  const zw0 = R.Z0 - R.WALL, zw1 = R.Z0;                                                     // the window wall, around the opening
  box(R.X0 - 0.1, WIN.X0, 0, R.H, zw0, zw1, wallM);
  box(WIN.X1, R.X1 + 0.1, 0, R.H, zw0, zw1, wallM);
  box(WIN.X0, WIN.X1, 0, WIN.Y0, zw0, zw1, wallM);
  box(WIN.X0, WIN.X1, WIN.Y1, R.H, zw0, zw1, wallM);
  // skirting
  const trimM = mat(PAL.trim, { roughness: 0.6 });
  box(R.X0, R.X1, 0, 0.08, R.Z1 - 0.012, R.Z1, trimM);
  box(R.X1 - 0.012, R.X1, 0, 0.08, R.Z0, R.Z1, trimM);
  box(R.X0, R.X0 + 0.012, 0, 0.08, R.Z0, R.Z1, trimM);
  // window frame, sill and a small pot on it
  const fr = 0.055, zf = R.Z0 - 0.07;
  add(rbox(fr, WIN.Y1 - WIN.Y0, 0.07, 0.012), trimM, WIN.X0 + fr / 2, (WIN.Y0 + WIN.Y1) / 2, zf);
  add(rbox(fr, WIN.Y1 - WIN.Y0, 0.07, 0.012), trimM, WIN.X1 - fr / 2, (WIN.Y0 + WIN.Y1) / 2, zf);
  add(rbox(WIN.X1 - WIN.X0, fr, 0.07, 0.012), trimM, (WIN.X0 + WIN.X1) / 2, WIN.Y1 - fr / 2, zf);
  add(rbox(WIN.X1 - WIN.X0 + 0.16, 0.045, 0.24, 0.015), trimM, (WIN.X0 + WIN.X1) / 2, WIN.Y0 + 0.0225 - 0.01, R.Z0 - 0.02);
  const potM = mat('#ece3d6', { roughness: 0.55 }), leafM = mat('#7f9f7c', { roughness: 0.8 }), leafM2 = mat('#93b28a', { roughness: 0.8 });
  const potG = new THREE.LatheGeometry([0, 1, 2, 3, 4, 5, 6].map((i) => new THREE.Vector2(i < 6 ? 0.045 + 0.012 * (i / 5) : 0.001, (i < 6 ? i / 5 : 1) * 0.075)), 24);
  add(potG, potM, 0.66, WIN.Y0 + 0.035, R.Z0 - 0.05);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2, s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), k % 2 ? leafM : leafM2);
    s.scale.set(0.022, 0.05, 0.022);
    s.position.set(0.66 + Math.cos(a) * 0.022, WIN.Y0 + 0.14, R.Z0 - 0.05 + Math.sin(a) * 0.022);
    s.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    s.castShadow = true; scene.add(s);
  }
  // curtain rod
  const rodM = mat('#8a6a52', { roughness: 0.5 });
  const rod = add(new THREE.CylinderGeometry(0.013, 0.013, CURT.OUT_R - CURT.OUT_L + 0.16, 16), rodM, (CURT.OUT_L + CURT.OUT_R) / 2, 2.465, CURT.Z);
  rod.rotation.z = Math.PI / 2;
  for (const x of [CURT.OUT_L - 0.09, CURT.OUT_R + 0.09]) add(new THREE.SphereGeometry(0.024, 16, 12), rodM, x, 2.465, CURT.Z);
  // curtains: linen panels, translucent glow through emissive stripes (darker where the cloth turns edge-on)
  const glowTex = canvasTex(512, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const c = Math.cos(2 * Math.PI * CURT.PLEATS * (x + 0.5) / w);
      const v = 1 - 0.2 * c * c;
      g.fillStyle = `rgb(${Math.round(255 * v)},${Math.round(255 * v)},${Math.round(255 * v)})`;
      g.fillRect(x, 0, 1, h);
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, h - 3, w, 3); g.fillRect(0, 0, w, 2);
  }, headless);
  const curtM = mat(PAL.linen, { roughness: 0.92, side: THREE.DoubleSide, emissive: C('#ffcf98'), emissiveMap: glowTex, emissiveIntensity: 0.3 });
  const amp = pleatTable(CURT.L, CURT.PLEATS);
  const curtL = makeCurtain(-1, curtM, amp), curtR = makeCurtain(1, curtM, amp);
  curtL.userData.update(CURT.LEAD_L, CURT.LEAD_L, 0); curtR.userData.update(CURT.LEAD_R, CURT.LEAD_R, 0);
  scene.add(curtL, curtR);

  // bed
  const woodM = mat(PAL.wood, { roughness: 0.62 }), sheetM = mat(PAL.sheet, { roughness: 0.95 });
  add(rbox(1.64, 0.3, 2.16, 0.05), woodM, 0, 0.18, 0.72);
  add(rbox(1.52, 0.2, 2.06, 0.07, 5), sheetM, 0, 0.4, 0.75);
  add(rbox(1.7, 1.02, 0.12, 0.05, 5), mat('#cdbfae', { roughness: 0.97 }), 0, 0.62, R.Z1 - 0.07);   // a padded headboard
  // pillows: superellipsoids, the right one dented by the head
  const pillowG = (dent) => {
    const g = new THREE.SphereGeometry(1, 56, 28), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const sx = Math.sign(x) * Math.abs(x) ** 0.42, sz = Math.sign(z) * Math.abs(z) ** 0.42, sy = Math.sign(y) * Math.abs(y) ** 0.9;
      x = sx * 0.32; z = sz * 0.19; y = sy * 0.075 * (1 - 0.35 * (sx * sx * sx * sx));
      if (dent && y > 0) y -= 0.055 * Math.exp(-((x - dent[0]) ** 2 + (z - dent[1]) ** 2) / 0.014);
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  };
  add(pillowG([0.03, -0.03]), sheetM, 0.17, 0.555, 1.56);
  add(pillowG(null), sheetM, -0.45, 0.555, 1.56).rotation.y = 0.05;
  // duvet: a surface over two draped cross-sections (across the bed and along it), with soft folds
  {
    const NX = 72, NZ = 56;
    const across = roundedPath([[-0.8, -0.3], [-0.8, 0], [0.8, 0], [0.8, -0.3]], 0.09, NX);
    const along = roundedPath([[-0.48, -0.3], [-0.37, 0], [1.24, 0], [1.3, -0.035]], 0.08, NZ);
    const pos = new Float32Array(NX * NZ * 3), idx = [];
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const [x, dx] = across[i], [z, dz] = along[j];
      const top = Math.max(0, 1 + Math.min(dx, dz) / 0.04);           // folds only on the flat top
      const body = 0.075 * Math.exp(-((x - 0.2) ** 2) / 0.05) * smooth((1.15 - z) / 0.3) * smooth((z + 0.2) / 0.4);
      const fold = 0.014 * Math.sin(x * 9 + z * 3.1) + 0.009 * Math.sin(z * 12.5 - x * 4) + 0.03 * Math.exp(-((z - 1.15) ** 2) / 0.004);
      const y = 0.55 + dx + dz + (fold + body) * clamp(top);
      const k = (j * NX + i) * 3;
      pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
    }
    for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    add(g, mat(PAL.duvet, { roughness: 0.96, side: THREE.DoubleSide }), 0, 0, 0);
  }
  // nightstand, books, a cup
  const lightWood = mat(PAL.woodL, { roughness: 0.6 });
  add(rbox(0.46, 0.55, 0.48, 0.025), lightWood, 1.05, 0.275, 1.36);
  const drawer = add(rbox(0.38, 0.19, 0.02, 0.007), lightWood, 0.815, 0.36, 1.36);
  drawer.rotation.y = Math.PI / 2;
  add(new THREE.SphereGeometry(0.014, 12, 10), rodM, 0.8, 0.36, 1.36);
  add(rbox(0.2, 0.026, 0.15, 0.006), mat('#8fa98a'), 1.13, 0.564, 1.52);
  add(rbox(0.18, 0.024, 0.14, 0.006), mat('#dcc7a6'), 1.12, 0.589, 1.52).rotation.y = 0.12;
  const cupG = new THREE.LatheGeometry([[0.0001, 0], [0.03, 0], [0.033, 0.004], [0.035, 0.075], [0.031, 0.077], [0.03, 0.006], [0.0001, 0.006]].map(([a, b]) => new THREE.Vector2(a, b)), 28);
  add(cupG, potM, 1.14, 0.55, 1.2);
  const clock = makeClock(headless);
  scene.add(clock.root);

  // pendant lamp (off)
  const shadeM = mat('#f1ebe1', { roughness: 0.7, side: THREE.DoubleSide });
  add(new THREE.CylinderGeometry(0.0075, 0.0075, 0.42, 8), mat('#5a514c'), 0.1, R.H - 0.21, 0.9);
  const shadeG = new THREE.LatheGeometry(Array.from({ length: 14 }, (_, i) => { const a = (i / 13) * Math.PI * 0.5; return new THREE.Vector2(0.012 + 0.2 * Math.sin(a), 0.14 * Math.cos(a)); }), 40);
  add(shadeG, shadeM, 0.1, R.H - 0.56, 0.9);
  add(new THREE.SphereGeometry(0.035, 16, 12), mat('#fff6e8', { roughness: 0.3 }), 0.1, R.H - 0.555, 0.9);

  // a picture on the right wall
  const artTex = canvasTex(400, 500, (g, w, h) => {
    g.fillStyle = '#f2eadb'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8c98e'; g.beginPath(); g.arc(w * 0.62, h * 0.36, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9fb3a0'; g.beginPath(); g.moveTo(0, h * 0.72); g.quadraticCurveTo(w * 0.35, h * 0.5, w, h * 0.66); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#7f98ae'; g.beginPath(); g.moveTo(0, h * 0.84); g.quadraticCurveTo(w * 0.6, h * 0.7, w, h * 0.86); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  }, headless);
  add(rbox(0.03, 0.64, 0.52, 0.01), lightWood, R.X1 - 0.016, 1.2, 0.72);
  const art = add(new THREE.PlaneGeometry(0.44, 0.56), mat('#ffffff', { map: artTex, roughness: 0.9 }), R.X1 - 0.033, 1.2, 0.72, { cast: false });
  art.rotation.y = -Math.PI / 2;
  // rug beside the bed
  const rug = add(new THREE.CylinderGeometry(0.62, 0.62, 0.012, 48), mat('#e2d3bd', { roughness: 1 }), 0.85, 0.006, -1.0, { cast: false });
  rug.scale.set(1, 1, 0.7);
  // a flower box outside on the sill: the foreground of the view once the curtains are open
  {
    const zb = R.Z0 - R.WALL - 0.13, yb = WIN.Y0 - 0.1, cx = (WIN.X0 + WIN.X1) / 2;
    add(rbox(1.6, 0.17, 0.24, 0.035), mat('#e8ddcc', { roughness: 0.8 }), cx, yb + 0.085, zb);
    // ~180 small parts, merged into one mesh per material (one draw call each)
    const RF = rand0(909), parts = new Map(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const put = (m, geo, x, y, z, sx, sy, sz, rx, ry, rz) => {
      if (!parts.has(m)) parts.set(m, []);
      parts.get(m).push(geo.clone().applyMatrix4(m4.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(sx, sy, sz))));
    };
    const leafA = mat('#86a77f'), leafB = mat('#9dbb8e'), leafC = mat('#759a73'), daisyM = mat('#fbf7ef', { roughness: 0.7 }), eyeM = mat('#e6d6a6'), lavM = mat('#a99fcb', { roughness: 0.8 });
    const ball = new THREE.SphereGeometry(1, 10, 7), spike = new THREE.CapsuleGeometry(1, 1, 3, 8);
    for (let k = 0; k < 120; k++) {                      // a low, uneven mound of leaves filling the box
      const x = cx + (RF() - 0.5) * 1.52, z = zb + (RF() - 0.5) * 0.2, r = 0.018 + RF() * 0.026;
      put([leafA, leafB, leafC][k % 3], ball, x, yb + 0.16 + RF() * 0.06, z, r * 0.7, r * 0.35, r * 1.5, (RF() - 0.5) * 1.2, RF() * 6.3, (RF() - 0.5) * 0.8);
    }
    for (let k = 0; k < 50; k++) {                       // short flowers poking out of it
      const x = cx + (RF() - 0.5) * 1.46, z = zb + (RF() - 0.5) * 0.14, y = yb + 0.2 + RF() * 0.06;
      if (k % 3 === 0) put(lavM, spike, x, y + 0.03, z, 0.01, 0.028, 0.01, 0, 0, (RF() - 0.5) * 0.4);
      else {
        const r = 0.02 + RF() * 0.01, rx = 0.45 + (RF() - 0.5) * 0.5, rz = (RF() - 0.5) * 0.5;
        put(daisyM, ball, x, y, z, r, r * 0.3, r, rx, 0, rz);
        put(eyeM, ball, x, y + r * 0.1, z + r * 0.08, r * 0.36, r * 0.3, r * 0.36, rx, 0, rz);
      }
    }
    for (const [m, list] of parts) add(mergeGeometries(list), m, 0, 0, 0);
  }

  // arms
  const skinM = mat(PAL.skin, { roughness: 0.62 }), sleeveM = mat(PAL.sleeve, { roughness: 0.95 });
  const armR = makeArm(1, skinM, sleeveM), armL = makeArm(-1, skinM, sleeveM);
  scene.add(armR.group, armL.group);

  return { scene, clock, curtL, curtR, curtM, armR, armL };
}

// ================================================================ the town
function rand0(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let r = Math.imul(a ^ (a >>> 15), 1 | a); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
export function terrainY(x, z) {
  const d = -z - 3;
  return -7.6 - 9 * smooth(d / 45) - 9 * smooth(d / 120) + 36 * smooth((d - 170) / 250) * (0.72 + 0.28 * Math.sin(x * 0.011 + 0.6))
    + 1.4 * Math.sin(x * 0.045 + 1) * Math.sin(z * 0.037) * smooth(d / 25) + 6 * smooth((Math.abs(x) - 0.75 * d - 60) / 120);
}

export function buildTown(R) {
  const scene = new THREE.Scene();
  // terrain with soft field patches in vertex colours
  const tg = new THREE.PlaneGeometry(1400, 900, 120, 90);
  tg.rotateX(-Math.PI / 2);
  tg.translate(0, 0, -452);
  const tp = tg.attributes.position, tc = new Float32Array(tp.count * 3);
  const g1 = C('#b4cf92'), g2 = C('#cddca0'), g3 = C('#9fbf8a'), cc = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i);
    tp.setY(i, terrainY(x, z));
    const n = 0.5 + 0.5 * Math.sin(x * 0.031 + Math.sin(z * 0.02) * 2) * Math.sin(z * 0.027 + 1.3);
    cc.copy(g1).lerp(g2, smooth(n)).lerp(g3, smooth((-z - 150) / 200) * 0.6);
    tc.set([cc.r, cc.g, cc.b], i * 3);
  }
  tg.setAttribute('color', new THREE.BufferAttribute(tc, 3));
  tg.computeVertexNormals();
  scene.add(new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })));

  // road down the slope and a river along the valley (ribbons on the terrain)
  const ribbon = (pts, w, m, lift) => {
    const pos = [], idx = [];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const [x, z] = pts[i], [xa, za] = pts[Math.max(0, i - 1)], [xb, zb] = pts[Math.min(n - 1, i + 1)];
      let tx = xb - xa, tz = zb - za; const l = Math.hypot(tx, tz); tx /= l; tz /= l;
      for (const s of [-1, 1]) { const px = x - tz * s * w / 2, pz = z + tx * s * w / 2; pos.push(px, terrainY(px, pz) + lift, pz); }
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, m);
    scene.add(mesh);
  };
  const road = [];
  for (let i = 0; i <= 120; i++) { const z = -7 - i * 1.0; road.push([-14 + 9 * Math.sin(i * 0.05) - 0.1 * i, z]); }
  ribbon(road, 4.2, new THREE.MeshStandardMaterial({ color: '#e6d8bd', roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), 0.12);
  const river = [];
  for (let i = 0; i <= 160; i++) { const x = -420 + i * 5.4; river.push([x, -118 + 10 * Math.sin(x * 0.012) + 4 * Math.sin(x * 0.041)]); }
  ribbon(river, 9, new THREE.MeshStandardMaterial({ color: '#a6c9dc', roughness: 0.25, metalness: 0, emissive: C('#7fa8c8'), emissiveIntensity: 3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), 0.15);

  // houses
  const houses = [];
  for (let z = -30; z > -176;) {
    const d = -z - 3;
    const half = 14 + 0.62 * d, step = 10 + 0.05 * d;
    for (let x = -half + R() * step; x < half; x += step * (0.85 + R() * 0.4)) {
      if (R() < 0.22) continue;
      const hx = x + (R() - 0.5) * 2, hz = z + (R() - 0.5) * 3;
      if (Math.abs(hx - (-14 + 9 * Math.sin((-7 - hz) * 0.05) - 0.1 * (-7 - hz))) < 6) continue;   // keep the road clear
      if (Math.abs(hz + 118 - 10 * Math.sin(hx * 0.012) - 4 * Math.sin(hx * 0.041)) < 12) continue;          // and the river
      houses.push({ x: hx, z: hz, w: 5 + R() * 2.6, d: 5.4 + R() * 1.8, h: 3.4 + R() * 2.2, rh: 1.8 + R() * 1.2, ry: (R() - 0.5) * 0.25, gable: R() < 0.45, d0: d });
    }
    z -= 7.5 + 0.075 * d;
  }
  const HB = new THREE.InstancedMesh(rbox(1, 1, 1, 0.05, 2), new THREE.MeshStandardMaterial({ roughness: 0.9 }), houses.length);
  const roofG = (() => {
    const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    g.translate(0, 0, -0.5);
    return g;
  })();
  const RF = new THREE.InstancedMesh(roofG, new THREE.MeshStandardMaterial({ roughness: 0.75 }), houses.length);
  const nearN = houses.filter((h) => h.d0 < 80).length;
  const WI = new THREE.InstancedMesh(rbox(1, 1, 1, 0.08, 2), new THREE.MeshStandardMaterial({ color: '#56677a', roughness: 0.35 }), nearN * 4);
  const CH = new THREE.InstancedMesh(rbox(1, 1, 1, 0.08, 2), new THREE.MeshStandardMaterial({ color: '#cdbca6', roughness: 0.9 }), houses.length);
  const walls = ['#f3e9d9', '#f6f2ea', '#ecdfc9', '#e2e8ec', '#efe6dc'].map(C);
  const roofs = ['#6f87a3', '#87a084', '#c4ad8a', '#958a82', '#8b9bb0', '#7c95a8'].map(C);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), off = new THREE.Vector3();
  let wi = 0, ci = 0;
  houses.forEach((h, i) => {
    const y0 = Math.min(terrainY(h.x - h.w / 2, h.z), terrainY(h.x + h.w / 2, h.z), terrainY(h.x, h.z - h.d / 2), terrainY(h.x, h.z + h.d / 2)) - 0.3;
    q.setFromAxisAngle(up, h.ry);
    HB.setMatrixAt(i, m4.compose(p.set(h.x, y0 + h.h / 2, h.z), q, s.set(h.w, h.h, h.d)));
    HB.setColorAt(i, walls[Math.floor(R() * walls.length)]);
    const rq = h.gable ? q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(up, Math.PI / 2)) : q;
    RF.setMatrixAt(i, m4.compose(p.set(h.x, y0 + h.h - 0.05, h.z), rq, h.gable ? s.set(h.d + 0.7, h.rh, h.w + 0.7) : s.set(h.w + 0.7, h.rh, h.d + 0.7)));
    RF.setColorAt(i, roofs[Math.floor(R() * roofs.length)]);
    if (R() < 0.45) {
      off.set((R() - 0.5) * h.w * 0.5, h.h + h.rh * 0.45, (R() - 0.5) * h.d * 0.3).applyQuaternion(q);
      CH.setMatrixAt(ci++, m4.compose(p.set(h.x, y0, h.z).add(off), q, s.set(0.7, h.rh * 0.9, 0.7)));
    }
    if (h.d0 < 80) {
      const floors = h.h > 4.6 ? 2 : 1;
      for (let k = 0; k < 4; k++) {
        const fl = k >> 1, col = k & 1;
        if (fl >= floors) { WI.setMatrixAt(wi++, m4.makeScale(0, 0, 0)); continue; }
        off.set((col - 0.5) * h.w * 0.46, 1.5 + fl * 2.2, h.d / 2 + 0.03).applyQuaternion(q);
        WI.setMatrixAt(wi++, m4.compose(p.set(h.x, y0, h.z).add(off), q, s.set(0.95, 1.15, 0.12)));
      }
    }
  });
  CH.count = ci;
  scene.add(HB, RF, WI, CH);

  // trees: in the gaps, along the road, and in clumps over the hills
  const trees = [];
  const free = (x, z, r) => houses.every((h) => Math.abs(h.x - x) > h.w / 2 + r || Math.abs(h.z - z) > h.d / 2 + r);
  for (let k = 0; trees.length < 260 && k < 4000; k++) {
    const far = k % 3 === 0;
    const z = far ? -171 - R() * 260 : -16 - R() * 150, d = -z - 3;
    const x = (R() - 0.5) * 2 * (20 + 0.7 * d);
    const r = far ? 4 + R() * 4 : 2 + R() * 1.8;
    if (!far && !free(x, z, r)) continue;
    if (Math.abs(z + 118 - 10 * Math.sin(x * 0.012) - 4 * Math.sin(x * 0.041)) < 7) continue;
    trees.push({ x, z, r, h: r * (1.1 + R() * 0.4) });
  }
  const crownG = mergeGeometries([[0, 0, 0, 1], [0.45, -0.15, 0.2, 0.72], [-0.42, -0.1, -0.15, 0.7], [0.05, 0.35, -0.1, 0.62]].map(([x, y, z, r]) => new THREE.SphereGeometry(r, 10, 7).translate(x, y, z)));
  const TC = new THREE.InstancedMesh(crownG, new THREE.MeshStandardMaterial({ roughness: 0.95 }), trees.length);
  const TT = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.25, 1, 6), new THREE.MeshStandardMaterial({ color: '#8b7766', roughness: 1 }), trees.length);
  const leaves = ['#8fb282', '#a3c08f', '#7ea47a', '#b2c995'].map(C);
  trees.forEach((t, i) => {
    const y = terrainY(t.x, t.z);
    TC.setMatrixAt(i, m4.compose(p.set(t.x, y + t.h * 0.55 + t.r * 0.55, t.z), q.identity(), s.set(t.r, t.h * 0.62, t.r)));
    TC.setColorAt(i, leaves[Math.floor(R() * leaves.length)]);
    TT.setMatrixAt(i, m4.compose(p.set(t.x, y + t.h * 0.3, t.z), q, s.set(1, t.h * 0.6, 1)));
  });
  scene.add(TC, TT);

  // clouds: merged soft spheres, lit by the sun plus a sky fill
  const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: C('#c9d9ea'), emissiveIntensity: 2.6, fog: false });
  const CL = [[-150, 62, -430, 1.2], [40, 96, -520, 1.5], [190, 70, -460, 1.1], [-40, 120, -420, 0.9], [-260, 105, -560, 1.4], [120, 140, -380, 0.8]];
  CL.forEach(([x, y, z, k]) => {
    const parts = [];
    const n = 6 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      const g = new THREE.SphereGeometry(1, 18, 12);
      const r = (10 + R() * 9) * k * (1 - Math.abs(i - n / 2) / n);
      g.scale(r * 1.25, r * 0.85, r);
      g.translate((i - n / 2) * 13 * k + (R() - 0.5) * 6, (R() * 0.6) * r * 0.5, (R() - 0.5) * 10);
      parts.push(g);
    }
    const flat = new THREE.SphereGeometry(1, 18, 10); flat.scale(n * 8 * k, 6 * k, 14 * k); flat.translate(-5, -2 * k, 0);
    parts.push(flat);
    const m = new THREE.Mesh(mergeGeometries(parts), cloudM);
    m.position.set(x, y, z);
    scene.add(m);
  });

  [HB, RF, WI, CH, TC, TT].forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.frustumCulled = false; });
  return { scene };
}
