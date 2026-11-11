/*
 * 154 · 넘어지며 쓰는 말 — a domino run that writes a word.
 *
 *   physics   physics.js: every domino is a rigid box hinged on its front-bottom edge (one angle each). Gravity torque
 *             about the edge, a restitution impulse on first touch, then a one-sided contact constraint (projected
 *             Gauss–Seidel), so the leaning dominoes ride on each other as one chain. Baked once in setup with a fixed
 *             step into per-domino angle tracks; frame(t) only reads them.
 *   layout    a centripetal Catmull-Rom run (even arc spacing, each domino turned to the tangent) feeding a fan of
 *             concentric rings (ring k holds k dominoes, each straddled by two of the ring before), clipped to a band.
 *   message   the word (and a heart) rasterised from the font in setup; every field domino samples the mask where its
 *             back face will lie once fallen, and gets a painted back (a decal on the back face) when it is inside.
 *   picture   two InstancedMeshes of rounded boxes (~3,300) + one of painted panels, a coral marble, a felt table with
 *             soft PCF shadows cast by a plain-box proxy in its own pass; the camera runs ahead of the wave looking back,
 *             then cranes up over the field to a top-down view, where the painted backs read as the word.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { defineDemo, rand, clamp, lerp, smooth } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { findContacts, bake, angleAt } from './physics.js';

const D = 10;
const SW = 1080, SH = 1920;

// ---------------------------------------------------------------- the domino (its height is the unit of length)
const DH = 1, DW = 0.48, DT = 0.12, DR = 0.04;   // height, width, thickness, edge radius
const SPACE = 0.42;          // pivot-to-pivot spacing along the run, and between rings
const PITCH = 0.62;          // spacing along a ring (arc length)
const K0 = 5;                // the rings' centre sits K0 spacings behind the junction (keeps ring-to-ring divergence small)
const RINGS = 86, XCLIP = 15.5;
// the run, plan (x, z); it ends at the junction (0, 0) heading +z
const PATH = [[-2, -47], [-8, -40], [-6, -32], [2, -26], [7, -19], [4, -11], [0.5, -6], [0, -3], [0, 0]];

// ---------------------------------------------------------------- timing (s)
const T_IMP = 1.0;           // the marble hits the first domino
const T_APEX = 4.5;          // the wave reaches the junction (fixes the time scale of the whole bake)
const T_CR0 = 3.6, T_CR1 = 7.4;   // the crane

// ---------------------------------------------------------------- the message (plan coordinates, top-down: +x right, +z down)
const WORD = '고마워';
const WORD_BOX = { z: 27.4, w: 27.5, h: 9.0 };
const HEART = { z: 11.6, w: 6.6 };
const MASK_PX = 24;          // mask pixels per unit
const MASK = { x0: -17, z0: -2, x1: 17, z1: 38 };

// ---------------------------------------------------------------- final framing (top-down)
const ZC = 20.4, FOV_END = 33, HALF_H = 29.6;
const DIST_END = HALF_H / Math.tan((FOV_END / 2) * Math.PI / 180);

// ---------------------------------------------------------------- marble (natural units for the hit)
const MB = { r: 0.2, m: 2.0, e: 0.3, omega0: 0.36, decel: 0.8 };

// accent = the one accent colour as it should read on screen; paint = the albedo that gives it under the key + ACES
const COL = { table: '#4b8b83', haze: '#d5e4db', ivory: '#f2ebdf', accent: '#ff5a3c', paint: '#e2402a' };
const LIGHT_DIR = new THREE.Vector3(-0.66, 0.68, -0.3).normalize();   // from the far left: grazes the fallen backs

// ---------------------------------------------------------------- canvases (setup only)
function canvasTex(w, h, draw, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  draw(g, w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}
// smooth value noise for the felt mottling
function valueNoise(R, n) {
  const g = new Float32Array((n + 1) * (n + 1));
  for (let i = 0; i < g.length; i++) g[i] = R();
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi;
    const a = g[(yi % n) * (n + 1) + (xi % n)], b = g[(yi % n) * (n + 1) + ((xi + 1) % n)];
    const c = g[((yi + 1) % n) * (n + 1) + (xi % n)], d = g[((yi + 1) % n) * (n + 1) + ((xi + 1) % n)];
    const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    return lerp(lerp(a, b, su), lerp(c, d, su), sv);
  };
}

defineDemo({
  id: '154-domino-chain',
  title: '넘어지며 쓰는 말',
  tech: '도미노 연쇄 · 경첩 회전 강체 + 충돌 전달 미리 굽기',
  duration: D,
  background: COL.haze,

  async setup(api) {
    const HL = api.headless;
    await fontReady('900 200px "Pretendard Variable"', WORD);

    // ================================================================ layout: the run, then the fan
    const curve = new THREE.CatmullRomCurve3(PATH.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    curve.arcLengthDivisions = 4000;
    const L = curve.getLength();
    const NC = Math.floor(L / SPACE + 1e-6) + 1;                // the last one stands exactly on the junction
    const bx = [], bz = [], bfx = [], bfz = [], brank = [], bring = [];
    const _p = new THREE.Vector3(), _t = new THREE.Vector3();
    for (let k = 0; k < NC; k++) {
      const u = (L - (NC - 1 - k) * SPACE) / L;
      curve.getPointAt(u, _p); curve.getTangentAt(u, _t);
      const l = Math.hypot(_t.x, _t.z);
      bx.push(_p.x); bz.push(_p.z); bfx.push(_t.x / l); bfz.push(_t.z / l); brank.push(k); bring.push(0);
    }
    for (let k = 1; k <= RINGS; k++) {
      const r = (k + K0) * SPACE;
      for (let j = 0; j < k; j++) {
        const a = ((j - (k - 1) / 2) * PITCH) / r;
        const x = r * Math.sin(a);
        if (Math.abs(x) > XCLIP) continue;
        bx.push(x); bz.push(r * Math.cos(a) - K0 * SPACE); bfx.push(Math.sin(a)); bfz.push(Math.cos(a));
        brank.push(NC - 1 + k); bring.push(k);
      }
    }
    const N = bx.length;
    const B = { n: N, x: Float64Array.from(bx), z: Float64Array.from(bz), fx: Float64Array.from(bfx), fz: Float64Array.from(bfz), rank: Int32Array.from(brank) };

    // ================================================================ physics bake (natural units: h = 1, g = 1)
    const C = findContacts(B, { h: DH, w: DW, d: DT, minOverlap: 0.12 });
    const S = bake(B, C, { h: DH, d: DT, omega0: MB.omega0, dt: 0.0075, recEvery: 4, eHit: 0.15, eFloor: 0.25, restOmega: 5e-3, restTau: 1.0 });
    // one time scale for everything: the wave reaches the junction at T_APEX
    const TS = (T_APEX - T_IMP) / S.wake[NC - 1];                // seconds per natural time unit
    const tauOf = (t) => (t - T_IMP) / TS;

    // ================================================================ the message mask → painted backs
    const MW = Math.round((MASK.x1 - MASK.x0) * MASK_PX), MHh = Math.round((MASK.z1 - MASK.z0) * MASK_PX);
    const mc = document.createElement('canvas');
    mc.width = MW; mc.height = MHh;
    const mg = mc.getContext('2d', { willReadFrequently: true });
    mg.fillStyle = '#fff';
    {
      const cx = (0 - MASK.x0) * MASK_PX, cz = (WORD_BOX.z - MASK.z0) * MASK_PX;
      mg.font = '900 100px "Pretendard Variable"';
      const m = mg.measureText(WORD);
      const hgt = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const size = 100 * Math.min((WORD_BOX.w * MASK_PX) / m.width, (WORD_BOX.h * MASK_PX) / hgt);
      mg.font = `900 ${size.toFixed(2)}px "Pretendard Variable"`;
      mg.letterSpacing = `${(-0.02 * size).toFixed(2)}px`;
      const m2 = mg.measureText(WORD);
      mg.textAlign = 'center';
      mg.textBaseline = 'alphabetic';
      mg.fillText(WORD, cx, cz + (m2.actualBoundingBoxAscent - m2.actualBoundingBoxDescent) / 2);
      // heart: the classic parametric curve, scaled to HEART.w
      const hx = cx, hz = (HEART.z - MASK.z0) * MASK_PX, k = (HEART.w * MASK_PX) / 34;
      mg.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        const X = 16 * Math.sin(a) ** 3, Yh = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
        if (i === 0) mg.moveTo(hx + X * k, hz - (Yh - 2.5) * k); else mg.lineTo(hx + X * k, hz - (Yh - 2.5) * k);
      }
      mg.fill();
    }
    const mpx = mg.getImageData(0, 0, MW, MHh).data;
    const maskAt = (x, z) => {
      const u = (x - MASK.x0) * MASK_PX - 0.5, v = (z - MASK.z0) * MASK_PX - 0.5;
      const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
      const px = (a, b) => (a < 0 || b < 0 || a >= MW || b >= MHh ? 0 : mpx[(b * MW + a) * 4 + 3] / 255);
      return lerp(lerp(px(i, j), px(i + 1, j), fu), lerp(px(i, j + 1), px(i + 1, j + 1), fu), fv);
    };
    // where each back face shows once fallen: the strip above the contact of the domino behind (q·h up the face)
    const painted = [];
    for (let b = NC; b < N; b++) {
      const th = S.fin[b];
      const q = th > 1.45 ? 0.5 : 0.8;
      const o = -DT * Math.cos(th) + q * DH * Math.sin(th);
      if (maskAt(B.x[b] + B.fx[b] * o, B.z[b] + B.fz[b] * o) > 0.5) painted.push(b);
    }

    // ================================================================ renderer, scene
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;     // the shadow map is drawn from a low-poly proxy in its own pass (frame)

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COL.haze);
    scene.fog = new THREE.Fog(COL.haze, 18, 72);
    const camera = new THREE.PerspectiveCamera(44, SW / SH, 0.05, 400);

    // ---- light: a warm key from the far left (casts every shadow), a sky/felt hemisphere fill
    const hemi = new THREE.HemisphereLight(0xfff4e8, 0x3d6e68, 2.0);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffeedb, 2.9);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 3.5;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.018;
    key.shadow.camera.near = 1; key.shadow.camera.far = 140;
    scene.add(key, key.target);

    // ---- the table: felt with a soft light pool over the field, mottled a little
    const TAB = { size: 420, cz: -8 };
    const tableTex = canvasTex(512, 512, (g, w, h) => {
      const im = g.createImageData(w, h);
      const nz = valueNoise(rand(1541), 64);
      const base = new THREE.Color(COL.table).getRGB({}, THREE.SRGBColorSpace);   // the token's sRGB bytes
      for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
        const X = ((px + 0.5) / w - 0.5) * TAB.size, Z = ((py + 0.5) / h - 0.5) * TAB.size + TAB.cz;
        const pool = Math.exp(-((X / 34) ** 2 + ((Z - 14) / 46) ** 2));
        const mott = (nz(px / 4.5, py / 4.5) - 0.5) * 0.05 + (nz(px / 1.55 + 17, py / 1.55 + 5) - 0.5) * 0.025;
        const k = 0.86 + 0.16 * pool + mott;
        const i = (py * w + px) * 4;
        im.data[i] = clamp(base.r * 255 * k, 0, 255);
        im.data[i + 1] = clamp(base.g * 255 * k, 0, 255);
        im.data[i + 2] = clamp(base.b * 255 * k, 0, 255);
        im.data[i + 3] = 255;
      }
      g.putImageData(im, 0, 0);
    }, HL);
    const table = new THREE.Mesh(new THREE.PlaneGeometry(TAB.size, TAB.size), new THREE.MeshLambertMaterial({ map: tableTex }));
    table.rotation.x = -Math.PI / 2;
    table.position.set(0, 0, TAB.cz);
    table.receiveShadow = true;
    scene.add(table);

    // ---- dominoes: rounded boxes with the pivot (front-bottom edge) at the origin, +z = the way it falls
    const boxGeo = (segs) => {
      const g = new RoundedBoxGeometry(DW, DH, DT, segs, DR);
      g.translate(0, DH / 2, -DT / 2);
      return g;
    };
    const ivory = new THREE.MeshLambertMaterial({ color: COL.ivory });   // matte (and the cheapest lit shader)
    const chainMesh = new THREE.InstancedMesh(boxGeo(3), ivory, NC);
    const fieldMesh = new THREE.InstancedMesh(boxGeo(1), ivory, N - NC);
    // shadow proxy: plain boxes (12 triangles) for all N, drawn only into the shadow map
    const proxyGeo = new THREE.BoxGeometry(DW - 0.02, DH - 0.01, DT - 0.01);
    proxyGeo.translate(0, DH / 2, -DT / 2);
    const proxy = new THREE.InstancedMesh(proxyGeo, new THREE.MeshBasicMaterial(), N);
    proxy.castShadow = true; proxy.visible = false;
    proxy.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    {   // dominoes only turn in place: one sphere around every pivot (+ a domino height) bounds them at any t
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let b = 0; b < N; b++) { x0 = Math.min(x0, B.x[b]); x1 = Math.max(x1, B.x[b]); z0 = Math.min(z0, B.z[b]); z1 = Math.max(z1, B.z[b]); }
      proxy.boundingSphere = new THREE.Sphere(new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2), Math.hypot(x1 - x0, z1 - z0) / 2 + DH * 1.5);
    }
    scene.add(proxy);
    // the shadow pass runs inside a render through a camera that sees nothing (lights are not culled by the view,
    // so the light's map is still drawn), into a 1×1 target: no colour programs, no colour pixels
    const tinyRT = new THREE.WebGLRenderTarget(1, 1);
    const blind = new THREE.PerspectiveCamera(10, 1, 0.1, 1);
    blind.position.set(0, -500, 0); blind.lookAt(0, -1000, 0); blind.updateMatrixWorld(true);
    const tone = new THREE.Color(), RT = rand(15402);
    for (const [m, cnt] of [[chainMesh, NC], [fieldMesh, N - NC]]) {
      m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < cnt; i++) { const v = 0.955 + 0.045 * RT(); m.setColorAt(i, tone.setRGB(v, v * 0.998, v * 0.994)); }
      scene.add(m);
    }
    // painted backs: a rounded panel on the back face (it becomes the top face once the domino has fallen)
    const panel = new THREE.Shape();
    {
      const w = DW - 0.035, h = DH - 0.045, r = 0.03;
      panel.moveTo(-w / 2 + r, -h / 2);
      panel.lineTo(w / 2 - r, -h / 2); panel.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      panel.lineTo(w / 2, h / 2 - r); panel.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      panel.lineTo(-w / 2 + r, h / 2); panel.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      panel.lineTo(-w / 2, -h / 2 + r); panel.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    }
    const panelGeo = new THREE.ShapeGeometry(panel, 3);
    panelGeo.rotateY(Math.PI);
    panelGeo.translate(0, DH / 2 + 0.008, -DT - 0.0025);
    // the panel floats only 0.0025 off the back face: pull it toward the camera in depth too, so it never z-fights
    const paintMat = new THREE.MeshLambertMaterial({ color: COL.paint, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
    const paintMesh = new THREE.InstancedMesh(panelGeo, paintMat, Math.max(1, painted.length));
    paintMesh.count = painted.length;
    paintMesh.receiveShadow = true; paintMesh.frustumCulled = false;
    paintMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(paintMesh);

    // ---- the marble: coral glass with an ivory ribbon (so the roll reads)
    const marbleTex = canvasTex(512, 256, (g, w, h) => {
      g.fillStyle = COL.paint; g.fillRect(0, 0, w, h);
      const lg = g.createLinearGradient(0, 0, 0, h);
      lg.addColorStop(0, 'rgba(120,20,10,0.35)'); lg.addColorStop(0.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(120,20,10,0.35)');
      g.fillStyle = lg; g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff4e6';
      g.beginPath();
      for (let x = 0; x <= w; x += 4) g.lineTo(x, h * 0.5 + Math.sin((x / w) * Math.PI * 4) * h * 0.16 - 11);
      for (let x = w; x >= 0; x -= 4) g.lineTo(x, h * 0.5 + Math.sin((x / w) * Math.PI * 4) * h * 0.16 + 11);
      g.fill();
    }, HL);
    const marble = new THREE.Mesh(new THREE.SphereGeometry(MB.r, 48, 32), new THREE.MeshPhongMaterial({ map: marbleTex, shininess: 110, specular: 0x8a8a8a }));
    marble.castShadow = true;
    scene.add(marble);
    // the hit: impulse λ at height r on the first domino's back face, restitution e; returns the marble's speeds
    const I = (DH * DH + DT * DT) / 3;
    const vIn = (MB.omega0 * I * (1 / MB.m + (MB.r * MB.r) / I)) / ((1 + MB.e) * MB.r);   // natural units
    const lam = ((1 + MB.e) * vIn) / (1 / MB.m + (MB.r * MB.r) / I);
    const vOut = vIn - lam / MB.m;                                                        // < 0: it bounces back a little
    const marbleK = { vIn: vIn / TS, vOut: vOut / TS, a: MB.decel };                      // per second
    const f0 = new THREE.Vector3(B.fx[0], 0, B.fz[0]);
    const hit = new THREE.Vector3(B.x[0], MB.r, B.z[0]).addScaledVector(f0, -(DT + MB.r));
    const roll0 = marbleK.vIn * T_IMP + 0.5 * marbleK.a * T_IMP * T_IMP;                   // distance at t = 0
    const marbleAt = (t) => {   // signed travel along f0 since t = 0 (the hit at roll0)
      if (t <= T_IMP) { const r = T_IMP - t; return roll0 - (marbleK.vIn * r + 0.5 * marbleK.a * r * r); }
      const dt = Math.min(t - T_IMP, -marbleK.vOut / marbleK.a);
      return roll0 + marbleK.vOut * dt + 0.5 * marbleK.a * dt * dt;
    };

    // ================================================================ the wave front as an arc length (camera)
    // run: the k-th domino starts at wake[k]; field: ring k (mean start) sits k·SPACE past the junction
    const keysT = [0], keysS = [0];
    const s0 = L - (NC - 1) * SPACE;
    keysS[0] = s0;
    for (let k = 0; k < NC; k++) { keysT.push(T_IMP + S.wake[k] * TS); keysS.push(s0 + k * SPACE); }
    const ringSum = new Float64Array(RINGS + 1), ringCnt = new Float64Array(RINGS + 1);
    for (let b = NC; b < N; b++) { ringSum[bring[b]] += S.wake[b]; ringCnt[bring[b]]++; }
    for (let k = 1; k <= RINGS; k++) { keysT.push(T_IMP + (ringSum[k] / ringCnt[k]) * TS); keysS.push(L + k * SPACE); }
    keysT.push(D + 2); keysS.push(L + RINGS * SPACE);
    for (let i = 1; i < keysT.length; i++) { keysT[i] = Math.max(keysT[i], keysT[i - 1] + 1e-6); keysS[i] = Math.max(keysS[i], keysS[i - 1]); }
    const HZ = 240, NG = D * HZ + 1;
    const raw = new Float64Array(NG), sm = new Float64Array(NG);
    for (let g = 0, k = 0; g < NG; g++) {
      const t = g / HZ;
      while (k < keysT.length - 2 && keysT[k + 1] < t) k++;
      raw[g] = lerp(keysS[k], keysS[k + 1], clamp((t - keysT[k]) / (keysT[k + 1] - keysT[k])));
    }
    const SIG = 0.16 * HZ, KR = Math.ceil(3 * SIG);
    for (let g = 0; g < NG; g++) {
      let a = 0, wsum = 0;
      for (let q = -KR; q <= KR; q++) { const w = Math.exp(-0.5 * (q / SIG) ** 2); a += raw[clamp(g + q, 0, NG - 1)] * w; wsum += w; }
      sm[g] = a / wsum;
    }
    const SF = (t) => { const u = clamp(t, 0, D) * HZ, i = Math.min(NG - 2, Math.floor(u)); return lerp(sm[i], sm[i + 1], u - i); };
    // a point / tangent on the run at arc length s (straight on past either end)
    const p0 = curve.getPointAt(0), t0 = curve.getTangentAt(0);
    const pathAt = (s, out) => {
      if (s <= 0) return out.copy(p0).addScaledVector(t0, s);
      if (s >= L) return out.set(0, 0, s - L);
      return curve.getPointAt(s / L, out);
    };
    const tanAt = (s, out) => {
      if (s <= 0) return out.copy(t0);
      if (s >= L) return out.set(0, 0, 1);
      return curve.getTangentAt(s / L, out);
    };

    // ================================================================ camera rig
    const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
    const wrapPi = (a) => a - Math.PI * 2 * Math.floor((a + Math.PI) / (Math.PI * 2));
    const pose = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), up: new THREE.Vector3(), fov: 44, dist: 1 };
    function rig(t) {
      // chase: ahead of the front on the run, low, looking back at it
      const sF = SF(t);
      const k = smooth(t / T_APEX);
      const open = 1 - smooth((t - 0.5) / 1.6);             // the opening sits wider, so the marble shows beside domino 1
      const lead = lerp(4.4, 3.5, k) + 1.4 * open, side = lerp(3.0, 2.5, k) + 0.4 * open, hc = lerp(2.25, 2.0, k) + 0.3 * open;
      const sc = sF + lead;
      pathAt(sc, _a); tanAt(sc, _b);
      const cx = _a.x + _b.z * side, cy = hc, cz = _a.z - _b.x * side;   // beside the run (+x of its heading)
      pathAt(sF - 0.7 - 0.9 * open, _c);
      const lx = _c.x, ly = 0.22, lz = _c.z;
      const dx = cx - lx, dy = cy - ly, dz = cz - lz;
      const d0 = Math.hypot(dx, dy, dz), el0 = Math.asin(dy / d0), az0 = Math.atan2(dx, dz);
      // crane: one smooth progress u, eased differently per parameter (height first, framing later)
      const u = clamp((t - T_CR0) / (T_CR1 - T_CR0));
      const su = u * u * (3 - 2 * u);
      const eEl = 1 - (1 - su) ** 1.7;
      const eD = 1 - (1 - su) ** 3.0;
      const eT = smooth((t - 4.3) / (6.6 - 4.3));
      const drift = smooth((t - 7.0) / (D - 7.0));
      const tx = lerp(lx, 0, eT), ty = lerp(ly, 0, eT), tz = lerp(lz, ZC, eT);
      const dist = Math.exp(lerp(Math.log(d0), Math.log(DIST_END), eD)) * (1 - 0.04 * drift);
      const elv = lerp(el0, Math.PI / 2, eEl);
      const az = az0 + wrapPi(0 - az0) * eEl + 0.045 * drift;
      const ce = Math.cos(elv), Dx = Math.sin(az), Dz = Math.cos(az);
      pose.tgt.set(tx, ty, tz);
      pose.pos.set(tx + dist * ce * Dx, ty + dist * Math.sin(elv), tz + dist * ce * Dz);
      // up: world up while low, turning to "toward the run" (−D) as the view goes top-down — never parallel to the view
      const c2 = ce * ce, s2 = 1 - c2;
      pose.up.set(-Dx * s2, c2, -Dz * s2).normalize();
      pose.fov = lerp(44, FOV_END, eD);
      pose.dist = dist;
      return pose;
    }

    // ---- static overlay: vignette + a soft scrim under the caption (drawn once)
    const ov = api.canvas({ z: 1 });
    {
      const g = ov.ctx;
      const rg = g.createRadialGradient(SW / 2, SH * 0.46, SH * 0.22, SW / 2, SH * 0.46, SH * 0.72);
      rg.addColorStop(0, 'rgba(10,32,32,0)'); rg.addColorStop(1, 'rgba(10,32,32,0.38)');
      g.fillStyle = rg; g.fillRect(0, 0, SW, SH);
      const lg = g.createLinearGradient(0, SH - 420, 0, SH);
      lg.addColorStop(0, 'rgba(12,36,36,0)'); lg.addColorStop(1, 'rgba(12,36,36,0.5)');
      g.fillStyle = lg; g.fillRect(0, SH - 420, SW, 420);
    }

    Object.assign(this, {
      renderer, scene, camera, key, hemi, chainMesh, fieldMesh, paintMesh, proxy, tinyRT, blind, painted, marble, hit, f0, marbleAt, roll0,
      B, S, N, NC, tauOf, rig, ang: new Float32Array(N), ld: new THREE.Vector3(), yAxis: new THREE.Vector3(0, 1, 0),
      mAxis: new THREE.Vector3(f0.z, 0, -f0.x),
    });
    // compile every program here, not on the first frame: one warm-up draw, then a 1-pixel read waits for the GPU
    this.frame(0);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  frame(t) {
    const S = this, { B, ang } = S;
    const tau = S.tauOf(t);

    // ---- angles from the baked tracks
    for (let b = 0; b < S.N; b++) ang[b] = tau <= 0 ? 0 : angleAt(S.S, b, tau);
    const put = (arr, o, b) => {
      const th = ang[b], c = Math.cos(th), s = Math.sin(th), fx = B.fx[b], fz = B.fz[b];
      arr[o] = fz; arr[o + 1] = 0; arr[o + 2] = -fx; arr[o + 3] = 0;          // lateral (hinge axis)
      arr[o + 4] = s * fx; arr[o + 5] = c; arr[o + 6] = s * fz; arr[o + 7] = 0;  // up, tipped by θ toward f
      arr[o + 8] = c * fx; arr[o + 9] = -s; arr[o + 10] = c * fz; arr[o + 11] = 0;
      arr[o + 12] = B.x[b]; arr[o + 13] = 0; arr[o + 14] = B.z[b]; arr[o + 15] = 1;
    };
    const all = S.proxy.instanceMatrix.array;
    for (let b = 0; b < S.N; b++) put(all, b * 16, b);
    S.chainMesh.instanceMatrix.array.set(all.subarray(0, S.NC * 16));
    S.fieldMesh.instanceMatrix.array.set(all.subarray(S.NC * 16, S.N * 16));
    { const a = S.paintMesh.instanceMatrix.array; S.painted.forEach((b, i) => a.set(all.subarray(b * 16, b * 16 + 16), i * 16)); }
    for (const m of [S.proxy, S.chainMesh, S.fieldMesh, S.paintMesh]) m.instanceMatrix.needsUpdate = true;

    // ---- marble
    const tr = S.marbleAt(t);
    S.marble.position.copy(S.hit).addScaledVector(S.f0, tr - S.roll0);
    S.marble.quaternion.setFromAxisAngle(S.mAxis, tr / MB.r);             // rolling: angle = distance / radius

    // ---- camera
    const P = S.rig(t), cam = S.camera;
    cam.fov = P.fov;
    // near plane follows the camera height: every visible point lies at least 0.9·(height − 1.2) in front (nothing
    // stands above 1.2, the frustum's half-diagonal is < 25°), so near = half of that keeps depth precision fine from
    // the low chase (≈0.5) to the top-down view (≈50) — a fixed 0.05 left the painted backs z-fighting from far away
    cam.near = Math.max(0.05, 0.5 * (P.pos.y - 1.2));
    cam.position.copy(P.pos);
    cam.up.copy(P.up);
    cam.lookAt(P.tgt);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    // fog only while the camera is low (the haze is the horizon)
    const kf = smooth((P.pos.y - 3) / 25);
    S.scene.fog.near = lerp(16, 500, kf); S.scene.fog.far = lerp(62, 1200, kf);

    // ---- key light + its shadow box follow the action
    const sweep = -0.12 * smooth((t - 6.8) / (D - 6.8));   // the afterglow: the light drifts round a little
    const ld = S.ld.copy(LIGHT_DIR).applyAxisAngle(S.yAxis, sweep);
    const kz = smooth((P.dist - 4) / 40);
    const half = lerp(13, 23.5, kz);
    const cx = P.tgt.x, cz = P.tgt.z + lerp(-4, 0, kz);
    S.key.target.position.set(cx, 0, cz);
    S.key.position.set(cx + ld.x * 60, ld.y * 60, cz + ld.z * 60);
    const sc = S.key.shadow.camera;
    sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half;
    sc.updateProjectionMatrix();
    S.key.target.updateMatrixWorld(true);

    // ---- two passes: the shadow map from the box proxy (through the blind camera), then the picture with that map
    const r = S.renderer, vis = [S.chainMesh, S.fieldMesh, S.paintMesh];
    for (const m of vis) m.visible = false;
    S.proxy.visible = true;
    r.shadowMap.needsUpdate = true;
    r.setRenderTarget(S.tinyRT);
    r.render(S.scene, S.blind);
    S.proxy.visible = false;
    for (const m of vis) m.visible = true;
    r.setRenderTarget(null);
    r.render(S.scene, cam);
  },
});
