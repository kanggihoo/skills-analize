/*
 * yard.js — the summer backyard, all in code: a lawn (painted tile + macro tint + instanced blades that sway with
 * SCENE time), a ring of cream fence boards, round trees and shrubs, a pale house, sun glints in the leaves (the
 * bokeh), a coiled garden hose and the spike sprinkler. Units are metres; the burst sits over the origin.
 *
 * Everything that moves on its own (grass, leaves, glints) reads uTau — scene time — so it stops with the balloon.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp } from '../_lib/stage.js';

export const SPR = { tip: 0.24, headTop: 0.165, headR: 0.034, headY0: 0.112, stakeR: 0.0068, spikeR: 0.0085 };
export const PAL = {
  lawn: '#7fae5a', lawnDeep: '#4f8a3f', lawnDry: '#a9c46f', fence: '#f1e7d4', trunk: '#8a7663',
  leaf: ['#6f9d53', '#86b063', '#5d8b48', '#97bb6c'], house: '#d3dbe0', roof: '#8c98a3',
  hose: '#3f6c59', stake: '#3b4846', head: '#93a69f', steel: '#dfe3e4', flower: '#fbf6ea', flowerEye: '#efe1b8',
  sky: '#a9cbe6', horizon: '#f6ead3',
};

// smooth value noise on a periodic n×n lattice
export function valueNoise(R, n) {
  const g = new Float32Array(n * n);
  for (let i = 0; i < g.length; i++) g[i] = R();
  const at = (x, y) => g[(((y % n) + n) % n) * n + (((x % n) + n) % n)];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi;
    const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    return lerp(lerp(at(xi, yi), at(xi + 1, yi), su), lerp(at(xi, yi + 1), at(xi + 1, yi + 1), su), sv);
  };
}

function canvasTex(w, h, draw, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// a sky dome: warm horizon → soft blue zenith, a hot sun disc and its glow (HDR, also seen by the reflection probe)
export function makeSky(sunDir) {
  return new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: sunDir.clone() }, uTop: { value: new THREE.Color(PAL.sky) }, uHor: { value: new THREE.Color(PAL.horizon) } },
    vertexShader: 'varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vD; uniform vec3 uSun, uTop, uHor;
      void main() {
        vec3 d = normalize(vD);
        float h = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(uHor, uTop, pow(h, 0.6));
        if (d.y < 0.0) c = mix(uHor * 0.9, vec3(0.32, 0.42, 0.22), clamp(-d.y * 6.0, 0.0, 1.0));
        float mu = max(dot(d, uSun), 0.0);
        c += vec3(1.0, 0.86, 0.62) * (0.55 * pow(mu, 8.0) + 0.35 * pow(mu, 48.0));
        c += vec3(40.0, 34.0, 26.0) * smoothstep(0.9993, 0.9997, mu);
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
}

/** Builds the yard. Returns { group, grassU, glints, parts } — the burst objects are added by the caller. */
export function buildYard(R, { headless, envMap }) {
  const group = new THREE.Group();
  const grassU = { uTau: { value: 0 } };
  const lam = (o) => new THREE.MeshLambertMaterial(o);

  // ---------------------------------------------------------------- the lawn
  const tile = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = PAL.lawn; g.fillRect(0, 0, w, h);
    const r = R;
    for (let i = 0; i < 2600; i++) {   // short soft strokes: blades seen from above
      const x = r() * w, y = r() * h, l = 6 + r() * 16, a = -Math.PI / 2 + (r() - 0.5) * 0.9;
      const k = r();
      g.strokeStyle = k < 0.45 ? 'rgba(62,112,48,0.28)' : k < 0.8 ? 'rgba(170,205,112,0.30)' : 'rgba(40,82,36,0.35)';
      g.lineWidth = 1.5 + r() * 2.5; g.lineCap = 'round';
      for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
        if (x + ox < -30 || x + ox > w + 30 || y + oy < -30 || y + oy > h + 30) continue;
        g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke();
      }
    }
  }, headless);
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping;
  tile.repeat.set(36, 36);
  const ground = new THREE.PlaneGeometry(72, 72, 96, 96);
  ground.rotateX(-Math.PI / 2);
  {
    const nz = valueNoise(R, 32), col = [], cA = new THREE.Color(PAL.lawnDeep), cB = new THREE.Color(PAL.lawnDry), c = new THREE.Color();
    const p = ground.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const n = nz(x / 2.2 + 50, z / 2.2 + 50) * 0.7 + nz(x / 0.7 + 9, z / 0.7 + 3) * 0.3;
      c.lerpColors(cA, cB, clamp(0.25 + 0.6 * n)).lerp(new THREE.Color('#ffffff'), 0.0);
      // the map carries the lawn colour; vertex colour is a ±20 % tint around white
      const k = 0.82 + 0.36 * n;
      col.push(k * (0.96 + 0.08 * (c.r - c.g)), k, k * 0.95);
    }
    ground.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  }
  const lawn = new THREE.Mesh(ground, lam({ map: tile, vertexColors: true }));
  lawn.receiveShadow = true;
  group.add(lawn);

  // ---------------------------------------------------------------- grass blades (instanced, sway with scene time)
  const blade = (() => {
    const S = 4, pos = [], col = [], idx = [];
    const base = new THREE.Color('#3f7a37'), tip = new THREE.Color('#b5d47a');
    for (let i = 0; i <= S; i++) {
      const h = i / S, w = 0.5 * (1 - Math.pow(h, 1.6)) + 0.02, z = 0.28 * h * h;
      const c = base.clone().lerp(tip, Math.pow(h, 0.9));
      pos.push(-w, h, z, w, h, z);
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
      if (i < S) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  })();
  const NB = 7000;
  const bladeMat = lam({ vertexColors: true, side: THREE.DoubleSide });
  bladeMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTau = grassU.uTau;
    sh.vertexShader = 'uniform float uTau;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      {
        vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        float ph = dot(ip.xz, vec2(4.1, 2.7));
        float h2 = position.y * position.y;
        transformed.z += h2 * 0.22 * (0.6 * sin(uTau * 1.9 + ph) + 0.4 * sin(uTau * 3.3 + ph * 1.7));
      }`);
  };
  const blades = new THREE.InstancedMesh(blade, bladeMat, NB);
  {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color(), e = new THREE.Euler();
    for (let i = 0; i < NB; i++) {
      const r = 0.05 + Math.pow(R(), 0.75) * 1.9, a = R() * Math.PI * 2;   // beyond ~2 m the lens melts the lawn anyway
      p.set(Math.cos(a) * r, -0.004, Math.sin(a) * r);
      e.set((R() - 0.5) * 0.35, R() * Math.PI * 2, (R() - 0.5) * 0.35);
      q.setFromEuler(e);
      const hh = 0.045 + R() * 0.075, ww = 0.009 + R() * 0.007;
      s.set(ww, hh, hh);
      m.compose(p, q, s);
      blades.setMatrixAt(i, m);
      const v = 0.75 + R() * 0.4;
      blades.setColorAt(i, c.setRGB(v * (0.92 + R() * 0.12), v, v * (0.85 + R() * 0.1)));
    }
  }
  blades.receiveShadow = true;
  group.add(blades);

  // little white flowers in the lawn (clover heads): a flattened ball of petals and a pale eye
  {
    const N = 140, petal = new THREE.SphereGeometry(1, 10, 6), eye = new THREE.SphereGeometry(1, 8, 5);
    const fP = new THREE.InstancedMesh(petal, lam({ color: PAL.flower }), N), fE = new THREE.InstancedMesh(eye, lam({ color: PAL.flowerEye }), N);
    const stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0012, 0.0015, 1, 5), lam({ color: '#5f9446' }), N);
    const m = new THREE.Matrix4();
    for (let i = 0; i < N; i++) {
      const r = 0.35 + Math.pow(R(), 0.6) * 4.2, a = R() * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const h = 0.06 + R() * 0.07, s = 0.009 + R() * 0.006;
      fP.setMatrixAt(i, m.compose(new THREE.Vector3(x, h, z), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.55, s)));
      fE.setMatrixAt(i, m.compose(new THREE.Vector3(x, h + s * 0.45, z), new THREE.Quaternion(), new THREE.Vector3(s * 0.4, s * 0.3, s * 0.4)));
      stem.setMatrixAt(i, m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(1, h, 1)));
    }
    group.add(fP, fE, stem);
  }

  // ---------------------------------------------------------------- the fence: a ring of rounded cream boards
  const FR = 5.4, BW = 0.115, BG = 0.022, BH = 1.12;
  {
    const nB = Math.floor((Math.PI * 2 * FR) / (BW + BG));
    const g = new RoundedBoxGeometry(BW, BH, 0.024, 2, 0.01);
    g.translate(0, BH / 2, 0);
    const boards = new THREE.InstancedMesh(g, lam({ color: PAL.fence }), nB);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    for (let i = 0; i < nB; i++) {
      const a = (i / nB) * Math.PI * 2, hj = (R() - 0.5) * 0.03;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + Math.PI / 2);
      boards.setMatrixAt(i, m.compose(new THREE.Vector3(Math.cos(a) * FR, hj - 0.02, Math.sin(a) * FR), q, new THREE.Vector3(1, 1 + hj, 1)));
      const v = 0.93 + R() * 0.07;
      boards.setColorAt(i, c.setRGB(v, v * 0.99, v * 0.97));
    }
    group.add(boards);
    // a rail behind the boards (seen through the gaps)
    const rail = new THREE.Mesh(new THREE.TorusGeometry(FR + 0.04, 0.03, 6, 160), lam({ color: '#ddd1bb' }));
    rail.rotation.x = Math.PI / 2; rail.position.y = 0.85;
    const rail2 = rail.clone(); rail2.position.y = 0.25;
    group.add(rail, rail2);
  }

  // ---------------------------------------------------------------- shrubs inside the fence, trees beyond it, a house
  const blob = new THREE.IcosahedronGeometry(1, 3);
  const leafMats = PAL.leaf.map((c) => lam({ color: c }));
  const glintPts = [];
  const addCanopy = (cx, cy, cz, rad, nBlobs, near) => {
    for (let k = 0; k < nBlobs; k++) {
      const a = R() * Math.PI * 2, d = rad * 0.55 * Math.sqrt(R());
      const s = rad * (0.45 + R() * 0.4);
      const x = cx + Math.cos(a) * d, y = cy + (R() - 0.3) * rad * 0.6, z = cz + Math.sin(a) * d;
      const b = new THREE.Mesh(blob, leafMats[Math.floor(R() * leafMats.length)]);
      b.position.set(x, y, z); b.scale.set(s, s * (0.85 + R() * 0.25), s);
      group.add(b);
      // glints: points on the blob's sunny, yard-facing side
      const ng = near ? 7 : 12;
      for (let j = 0; j < ng; j++) {
        const u = R() * 2 - 1, ph = R() * Math.PI * 2, rr = Math.sqrt(1 - u * u);
        const n = new THREE.Vector3(rr * Math.cos(ph), u, rr * Math.sin(ph));
        const inward = new THREE.Vector3(-x, 0, -z).normalize();
        if (n.dot(inward) < -0.1 || n.y < -0.3) continue;
        glintPts.push(new THREE.Vector3(x + n.x * s * 1.01, y + n.y * s * 0.95, z + n.z * s * 1.01));
      }
    }
  };
  // trees: trunks + canopies at 7–13 m
  for (let i = 0; i < 17; i++) {
    const a = (i / 17) * Math.PI * 2 + (R() - 0.5) * 0.25, r = 7.2 + R() * 5.5;
    if (Math.abs(Math.atan2(Math.sin(a - 2.0), Math.cos(a - 2.0))) < 0.42) continue;   // keep the house clear of trees
    const x = Math.cos(a) * r, z = Math.sin(a) * r, h = 2.6 + R() * 2.4;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, h, 8), lam({ color: PAL.trunk }));
    trunk.position.set(x, h / 2, z);
    group.add(trunk);
    addCanopy(x, h + 0.4, z, 1.6 + R() * 1.0, 5 + Math.floor(R() * 3), false);
  }
  // shrubs along the inside of the fence
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.4, r = FR - 0.55;
    addCanopy(Math.cos(a) * r, 0.35, Math.sin(a) * r, 0.55 + R() * 0.25, 4, true);
  }
  // a pale house behind the fence at one side (its window catches the sky)
  {
    const a = 2.0, r = 10.5, hx = Math.cos(a) * r, hz = Math.sin(a) * r;   // behind the camera's sweep: seen only in reflections
    const house = new THREE.Group();
    const wall = new THREE.Mesh(new RoundedBoxGeometry(7, 3.4, 5, 2, 0.08), lam({ color: PAL.house }));
    wall.position.y = 1.7;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.6, 1.9, 4, 1), lam({ color: PAL.roof }));
    roof.rotation.y = Math.PI / 4; roof.position.y = 4.35; roof.scale.set(1.1, 1, 0.82);
    const winM = lam({ color: '#e9f2f6', emissive: new THREE.Color('#bcd2e0'), emissiveIntensity: 0.6 });
    for (const wx of [-1.9, 0, 1.9]) {
      const w = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.2, 0.1, 2, 0.04), winM);
      w.position.set(wx, 2.1, 2.52);
      house.add(w);
    }
    house.add(wall, roof);
    house.position.set(hx, 0, hz);
    house.lookAt(0, 0, 0);
    group.add(house);
  }
  // glints → one instanced mesh of small HDR discs-as-spheres; brightness twinkles with scene time (leaves)
  const glints = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), glintPts.length);
  const glintPh = glintPts.map(() => [R() * 6.28, 0.6 + R() * 1.8, 0.022 + R() * 0.028]);
  glints.userData = { pts: glintPts, ph: glintPh };
  group.add(glints);

  // ---------------------------------------------------------------- the sprinkler: stake, drum head, spike nozzle
  const std = (o) => new THREE.MeshStandardMaterial({ envMap, ...o });
  const spr = new THREE.Group();
  const stakeM = std({ color: PAL.stake, roughness: 0.55, metalness: 0.2 });
  const headM = std({ color: PAL.head, roughness: 0.34, metalness: 0.35 });
  const steelM = std({ color: PAL.steel, roughness: 0.22, metalness: 0.85 });
  const stake = new THREE.Mesh(new THREE.CylinderGeometry(SPR.stakeR, SPR.stakeR * 0.6, 0.15, 16), stakeM);
  stake.position.y = 0.045;
  const headPts = [[0.001, SPR.headY0 - 0.004], [SPR.stakeR + 0.002, SPR.headY0 - 0.004], [0.026, SPR.headY0], [SPR.headR - 0.002, SPR.headY0 + 0.006],
    [SPR.headR, SPR.headY0 + 0.016], [SPR.headR, 0.148], [SPR.headR - 0.003, 0.157], [0.024, 0.163], [0.012, SPR.headTop], [0.001, SPR.headTop]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const head = new THREE.Mesh(new THREE.LatheGeometry(headPts, 48), headM);
  // a groove ring and spray holes on the drum
  const groove = new THREE.Mesh(new THREE.TorusGeometry(SPR.headR + 0.0004, 0.0018, 8, 64), stakeM);
  groove.rotation.x = Math.PI / 2; groove.position.y = 0.137;
  const holeG = new THREE.CylinderGeometry(0.0026, 0.0026, 0.004, 10);
  holeG.rotateZ(Math.PI / 2);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, h = new THREE.Mesh(holeG, stakeM);
    h.position.set(Math.cos(a) * (SPR.headR - 0.0005), 0.126, Math.sin(a) * (SPR.headR - 0.0005));
    h.rotation.y = -a;
    spr.add(h);
  }
  const spikePts = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, y = lerp(SPR.headTop - 0.002, SPR.tip, u);
    spikePts.push(new THREE.Vector2(i === 24 ? 0.0001 : SPR.spikeR * Math.pow(1 - u, 1.15) + 0.0003, y));
  }
  const spike = new THREE.Mesh(new THREE.LatheGeometry(spikePts, 32), steelM);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.0105, 0.0028, 10, 40), steelM);
  collar.rotation.x = Math.PI / 2; collar.position.y = SPR.headTop + 0.001;
  // hose inlet: an elbow at the stake foot
  const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.05, 16), stakeM);
  inlet.rotation.z = Math.PI / 2; inlet.position.set(0.026, 0.016, 0);
  spr.add(stake, head, groove, spike, collar, inlet);
  for (const o of spr.children) { o.castShadow = true; o.receiveShadow = true; }
  group.add(spr);

  // ---------------------------------------------------------------- the hose: from the inlet, a lazy coil, off to the house
  {
    const pts = [[0.05, 0.016, 0], [0.14, 0.012, 0.03], [0.32, 0.011, 0.16], [0.42, 0.011, 0.42], [0.25, 0.011, 0.66], [-0.06, 0.011, 0.62],
      [-0.2, 0.011, 0.38], [-0.02, 0.011, 0.18], [0.36, 0.011, 0.1], [0.9, 0.011, -0.2], [1.6, 0.011, -0.62], [2.6, 0.011, -1.2], [4.0, 0.011, -1.9], [6.0, 0.011, -2.9]];
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
    // rotate the whole run so it leaves toward the house
    const hose = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, 0.0095, 12, false), std({ color: PAL.hose, roughness: 0.42, metalness: 0.0 }));
    hose.castShadow = true; hose.receiveShadow = true;
    group.add(hose);
  }

  return { group, grassU, glints, spr, lawn, blades, steelM };
}

/** glint brightness/size at scene time τ (leaves flutter → glints twinkle; frozen while τ is frozen) */
export function updateGlints(glints, tau) {
  const { pts, ph } = glints.userData, m = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < pts.length; i++) {
    const [p0, w, s] = ph[i];
    const k = 0.55 + 0.45 * Math.sin(tau * w * 2.2 + p0) * Math.sin(tau * w * 1.3 + p0 * 1.7);
    m.makeScale(s, s, s).setPosition(pts[i]);
    glints.setMatrixAt(i, m);
    glints.setColorAt(i, c.setRGB(6.2 * k, 5.2 * k, 3.4 * k));
  }
  glints.instanceMatrix.needsUpdate = true;
  if (glints.instanceColor) glints.instanceColor.needsUpdate = true;
}
