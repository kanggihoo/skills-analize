/*
 * 45 · 빛이 머무는 유리창 — a rose window in a dark chapel at sunrise.
 *   setup(): the window is designed and glazed (design.js: tracery, Voronoi cut lines, lead came profile,
 *            grisaille) into two 2048² textures; a GPU pass bakes its transmission map TX (glass colour ×
 *            thickness × streaks × seeds × paint, lead/stone opaque) with mipmaps.
 *   frame(t): five passes, all uniforms pure functions of t — volumetric shafts (half res), the scene
 *            (floor with the projected window, wall, reveal, window), dust motes, bloom, tone map.
 * Story: dawn — the window glows dimly with sky light, a tree across the street keeps the sun off it →
 * the sun clears the crown: the shadow's edge sweeps down the glass and the colours ignite, the camera sits in
 * the beam and looks into the sun through the glass, rays converging → as the sun climbs the beam tilts down
 * and the coloured rose slides in across the floor toward the wall → it settles; motes drift in the light.
 */
import { defineDemo, track, ease, clamp, lerp, rand } from '../_lib/stage.js';
import { glKit } from './gl.js';
import { glazeWindow, TS } from './design.js';
import { BAKE, VOL, SCENE, MOTE_VS, MOTE_FS, PREFILTER, DOWN, UP, FINAL } from './shaders.js';

const D = 10;
const DEG = Math.PI / 180;
const lin = (p) => p;
const sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);

// the sun: low behind the tree, then climbing and swinging right → its beam tilts down onto the floor
const sunEl = track([[0, 22], [2.2, 25, lin], [4.0, 30, lin], [8.4, 60, ease.inOutCubic], [D, 62.5, ease.outCubic]]);
const sunAz = track([[0, -13], [4.0, -8, lin], [8.4, 9, ease.inOutCubic], [D, 11, ease.outCubic]]);
// lower edge of the tree's shadow on the window (window units, +1 = top): sweeps down as the sun clears the crown
const edge = track([[0, 1.6], [2.2, 1.2, lin], [4.6, -1.45, ease.inOutCubic]]);
const warm = [4.2, 2.1, 0.95], white = [5.4, 4.6, 3.6];
const sunMix = track([[0, 0], [2.5, 0.08], [8.5, 1, ease.inOutCubic]]);
const skyZ0 = [0.03, 0.05, 0.13], skyZ1 = [0.2, 0.32, 0.6];
const skyH0 = [0.18, 0.1, 0.11], skyH1 = [0.55, 0.5, 0.45];
const skyMix = track([[0, 0], [D, 1, sine]]);
const expo = track([[0, 3.3], [2.2, 3.1], [4.6, 1.25, ease.inOutCubic], [D, 1.15]]);
// camera: starts close, looking up at the window; drifts back and tilts down to the floor as the beam lands
const camZ = track([[0, 7.3], [D, 9.8, sine]]);
const camY = track([[0, 1.6], [D, 2.6, sine]]);
const pitch = track([[0, 23], [3.8, 20.5, lin], [7.8, 1.5, ease.inOutCubic], [D, 0, ease.outCubic]]);
const yaw = track([[0, -2.5], [D, 2.5, sine]]);
const VFOV = 78 * DEG;

function camRot(pt, yw) {
  const cp = Math.cos(pt), sp = Math.sin(pt), cy = Math.cos(yw), sy = Math.sin(yw);
  // R = Ry(yaw) · Rx(pitch), stored column-major for GLSL
  const r = [
    [cy, sy * sp, sy * cp],
    [0, cp, -sp],
    [-sy, cy * sp, cy * cp],
  ];
  return new Float32Array([r[0][0], r[1][0], r[2][0], r[0][1], r[1][1], r[2][1], r[0][2], r[1][2], r[2][2]]);
}
function sunDir(t) {          // direction the light travels (into the room: +z, downward)
  const e = sunEl(t) * DEG, a = sunAz(t) * DEG;
  return [-Math.sin(a) * Math.cos(e), -Math.sin(e), Math.cos(a) * Math.cos(e)];
}

defineDemo({
  id: '45-stained-glass',
  title: '빛이 머무는 유리창',
  tech: 'WebGL2 · 색유리 투과광 + 납선 + 바닥에 맺힌 빛',
  duration: D,
  background: '#050404',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const K = glKit(gl);

    // ---- the window, glazed on the CPU, then its transmission map baked on the GPU
    const { T0, T1 } = glazeWindow();
    const t0 = K.texture(TS, TS, { data: T0, mip: true });
    const t1 = K.texture(TS, TS, { data: T1, mip: true });
    const TX = K.target(1024, 1024, { float: false });
    const bake = K.program(BAKE);
    K.pass(bake, TX, { uT0: t0, uT1: t1, uTime: 0, uEdge: -9, uWind: 0 });
    gl.bindTexture(gl.TEXTURE_2D, TX.tex);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    const vol = K.program(VOL), scene = K.program(SCENE);
    const mote = K.program(MOTE_FS, MOTE_VS);
    const pre = K.program(PREFILTER), down = K.program(DOWN), up = K.program(UP), fin = K.program(FINAL);

    const VW = W / 2, VH = H / 2;
    const volT = K.target(VW, VH);
    const sceneT = K.target(W, H);
    const levels = [];
    for (let i = 0, w = W / 2, h = H / 2; i < 6; i++, w = Math.max(1, Math.round(w / 2)), h = Math.max(1, Math.round(h / 2))) levels.push(K.target(w, h));

    // dust motes: fixed seeds, drift is a pure function of t in the vertex shader
    const NM = 1600, r = rand(4545), md = new Float32Array(NM * 4);
    for (let i = 0; i < NM; i++) {
      md[i * 4] = (r() - 0.5) * 9;
      md[i * 4 + 1] = 0.2 + r() * 8.5;
      md[i * 4 + 2] = 0.3 + r() * 9.5;
      md[i * 4 + 3] = r() * 100;
    }
    const mvao = gl.createVertexArray();
    gl.bindVertexArray(mvao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, md, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const focal = (H / 2) / Math.tan(VFOV / 2);

    this.draw = (t) => {
      const frameNo = Math.round(t * 30);
      const rot = camRot(pitch(t) * DEG, yaw(t) * DEG);
      const cam = [0.15 * Math.sin(t * 0.4), camY(t), camZ(t)];
      const sd = sunDir(t);
      const m = sunMix(t);
      const sunC = warm.map((v, i) => lerp(v, white[i], m));
      const k = skyMix(t);
      const skyZ = skyZ0.map((v, i) => lerp(v, skyZ1[i], k)), skyH = skyH0.map((v, i) => lerp(v, skyH1[i], k));
      const e = edge(t);
      const lit = clamp((1.15 - e) / 2.3);
      const amb = [0.006 + 0.045 * lit, 0.0075 + 0.034 * lit, 0.013 + 0.028 * lit];
      const wind = 0.25 * Math.sin(t * 1.3) + 0.12 * Math.sin(t * 2.9 + 1.0);
      const common = { uTime: t, uEdge: e, uWind: wind, uCamPos: cam, uCamRot: rot, uSunD: sd, uSunC: sunC };

      // 1) shafts
      K.pass(vol, volT, { ...common, uTX: TX, uRes: [VW, VH], uFocal: focal / 2, uDust: 0.055, uFrame: frameNo });
      // 2) scene
      K.pass(scene, sceneT, {
        ...common, uT0: t0, uT1: t1, uTX: TX, uVol: volT, uRes: [W, H], uVolRes: [VW, VH], uFocal: focal,
        uSkyZ: skyZ, uSkyH: skyH, uAmbC: amb, uLit: lit,
      });
      // 3) motes, added into the scene
      K.bindTarget(sceneT);
      gl.useProgram(mote.p);
      K.uniforms(mote, { ...common, uTX: TX, uRes: [W, H], uFocal: focal, uMote: 0.6 });
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.bindVertexArray(mvao);
      gl.drawArrays(gl.POINTS, 0, NM);
      gl.bindVertexArray(null);
      gl.disable(gl.BLEND);
      // 4) bloom
      const ex = expo(t);
      K.pass(pre, levels[0], { uSrc: sceneT, uTexel: [1 / W, 1 / H], uExpo: ex, uThr: 1.0 });
      for (let i = 1; i < levels.length; i++) K.pass(down, levels[i], { uSrc: levels[i - 1], uTexel: [1 / levels[i - 1].w, 1 / levels[i - 1].h] });
      for (let i = levels.length - 1; i > 0; i--) {
        K.pass(up, levels[i - 1], { uSrc: levels[i], uTexel: [1 / levels[i].w, 1 / levels[i].h], uK: 1.0 }, { blend: [gl.ONE, gl.ONE] });
      }
      // 5) tone map to the canvas
      K.pass(fin, null, { uScene: sceneT, uBloom: levels[0], uExpo: ex, uBloomK: 0.16, uFrame: frameNo });
    };
  },
  frame(t) { this.draw(t); },
});
