/*
 * 50 · 밤거리의 네온사인 — a neon sign switched on at night over a wet street.
 *   setup(): the sign's tube centrelines (sign.js) are flattened into segments → an RGBA32F data texture;
 *            the per-tube table goes into uniforms.
 *   frame(t): (1) wall map — irradiance on the bricks from every glowing segment as an analytic line light,
 *            plus the wall's radiance for reflections (MRT, mip-mapped); (2) ground map; (3) the view: glass
 *            tubes, bricks, wet asphalt with puddle reflections and rain rings, drizzle; (4) bloom; (5) tone map.
 *   Every tube's brightness is a pure function of t: sputter, strike and the failing tube's stutter are drawn
 *   from a hash of the 60 Hz step index floor(t·60), never from live randomness.
 * Story: a dark brick wall under a cold streetlight, the unlit sign only glass and shadows → the transformer
 * kicks in: the green border sputters and strikes from its electrodes, the blue cup, the white steam, then 커피
 * stroke by stroke → the wall and the wet street fill with colour → the camera rises to the ㅣ of 피, whose
 * worn electrode makes it stutter.
 */
import { defineDemo, track, ease, clamp, lerp } from '../_lib/stage.js';
import { glKit } from './gl.js';
import { buildSign } from './sign.js';
import { WALLMAP, GROUNDMAP, SCENE, PREFILTER, DOWN, UP, FINAL } from './shaders.js';

const D = 10;
const DEG = Math.PI / 180;
const sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));

// camera: low over the wet pavement, then rising in to the failing stroke
const camX = track([[0, 0.07], [6.3, 0.0, sine], [8.4, 0.86], [D, 0.84, sine]]);
const camY = track([[0, 0.36], [6.3, 0.42, sine], [8.4, 1.42], [D, 1.45, sine]]);
const camZ = track([[0, 4.7], [6.3, 4.1, sine], [8.4, 1.42], [D, 1.3, sine]]);
const pitch = track([[0, 3.5], [6.3, 4.0, sine], [8.4, 0.2], [D, 0.0]]);
const yaw = track([[0, 0], [6.3, 0, sine], [8.4, 13], [D, 13.5]]);
const expo = track([[0, 2.7], [1.0, 2.6], [4.6, 1.35, ease.inOutCubic], [6.3, 1.3], [8.4, 1.05], [D, 1.0]]);
const VFOV = 70 * DEG;

// deterministic hash of (step, salt) → [0, 1)
function h2(a, b) {
  let h = (Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const BURSTS = [[5.55, 6.2], [7.3, 7.95], [8.8, 9.6]];
/** brightness, ignition fill, cathode glow of tube i at time t */
function tubeState(T, i, t) {
  const t0 = T.ignite, k = Math.floor(t * 60);
  if (t < t0 - 0.45) return [0, 0, 0];
  if (t < t0 - 0.2) {
    // the electrodes warm: a faint, flickering glow at the ends only
    return [0, 0, (0.15 + 0.35 * h2(k, i * 11 + 1)) * (t - (t0 - 0.45)) / 0.25];
  }
  // first strike: the discharge runs in from both electrodes
  const fill = clamp((t - (t0 - 0.2)) / 0.07);
  if (t < t0 + 0.3) {
    // sputter while the transformer and gas settle: on more often as it goes
    const p = clamp((t - (t0 - 0.2)) / 0.5), r = h2(k, i * 11 + 2);
    const b = r < 0.25 + 0.75 * p * p ? 0.55 + 0.45 * h2(k, i * 11 + 3) : r < 0.35 + 0.75 * p * p ? 0.15 : 0.0;
    return [b, fill, 0.25 * (1 - p)];
  }
  let b = 0.97 + 0.03 * h2(k, i * 11 + 4);
  if (T.fail) {
    // a worn electrode: steady most of the time, then bursts of stutter in which the column drops out,
    // sometimes leaving only the ends glowing
    for (const [a, z] of BURSTS) {
      if (t >= a && t < z) {
        const r = h2(k, i * 11 + 5), r2 = h2(k >> 1, i * 11 + 6);
        if (r < 0.38) return [0.04, 1, 0.6];
        if (r < 0.55) return [0.5, 0.35 + 0.3 * r2, 0.5];
        return [0.75 + 0.25 * r2, 1, 0.1];
      }
    }
    b *= 0.9 + 0.1 * h2(k >> 2, i * 11 + 7);
  }
  return [b, 1, 0];
}

defineDemo({
  id: '50-neon',
  title: '밤거리의 네온사인',
  tech: 'WebGL2 · 유리관 기체 방전 발광 + 벽 반사광',
  duration: D,
  background: '#020203',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const K = glKit(gl);
    const { segs, tubes } = buildSign();
    const NS = segs.length;
    const sd = new Float32Array(NS * 2 * 4);
    segs.forEach((s, j) => {
      sd.set([s[0], s[1], s[2], s[3]], j * 4);
      sd.set([s[4], s[5], s[6], s[7]], (NS + j) * 4);
    });
    const segTex = K.texture(NS, 2, { data: sd, internal: gl.RGBA32F, type: gl.FLOAT, linear: false });
    const tubeU = new Float32Array(12 * 4), boxU = new Float32Array(12 * 4), endsU = new Float32Array(24 * 2);
    tubes.forEach((T, i) => {
      tubeU.set([T.segStart, T.segCount, T.len, T.type], i * 4);
      boxU.set(T.bbox, i * 4);
      endsU.set([...T.ends[0], ...T.ends[1]], i * 4);
    });

    const wallP = K.program(WALLMAP), groundP = K.program(GROUNDMAP), sceneP = K.program(SCENE);
    const pre = K.program(PREFILTER), down = K.program(DOWN), up = K.program(UP), fin = K.program(FINAL);

    // wall map: three float targets on one framebuffer (radiance for reflections, irradiance, light direction)
    const WM = [512, 400];
    const mk = () => K.texture(WM[0], WM[1], { internal: K.floatOK ? gl.RGBA16F : gl.RGBA8, type: K.floatOK ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE });
    const wRad = mk(), wIrr = mk(), wDir = mk();
    const wallFB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, wallFB);
    [wRad, wIrr, wDir].forEach((tx, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, tx, 0));
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const wallT = { fb: wallFB, w: WM[0], h: WM[1] };
    gl.bindTexture(gl.TEXTURE_2D, wRad);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    const groundT = K.target(256, 240);
    const sceneT = K.target(W, H);
    const levels = [];
    for (let i = 0, w = W / 2, h = H / 2; i < 6; i++, w = Math.max(1, Math.round(w / 2)), h = Math.max(1, Math.round(h / 2))) levels.push(K.target(w, h));

    const focal = (H / 2) / Math.tan(VFOV / 2);
    const street = [9.5, 11.0, 13.5], lamp = [-2.8, 4.6, 2.2];

    this.draw = (t) => {
      const tb = new Float32Array(12 * 4);
      tubes.forEach((T, i) => tb.set([...tubeState(T, i, t), 0], i * 4));
      const common = { uSeg: segTex, uTube: tubeU, uBox: boxU, uTB: tb, uTime: t, uLamp: lamp, uStreet: street };
      // 1) wall map, then its mips (the wet street reads it blurred)
      K.pass(wallP, wallT, common);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, wRad);
      gl.generateMipmap(gl.TEXTURE_2D);
      // 2) ground map
      K.pass(groundP, groundT, common);
      // 3) the view
      const p = pitch(t) * DEG, y = yaw(t) * DEG;
      const cp = Math.cos(p), sp = Math.sin(p), cy = Math.cos(y), sy = Math.sin(y);
      const rot = new Float32Array([cy, 0, -sy, sy * sp, cp, cy * sp, sy * cp, -sp, cy * cp]);
      K.pass(sceneP, sceneT, {
        ...common, uWallR: wRad, uWallE: wIrr, uWallD: wDir, uGroundE: groundT, uRes: [W, H],
        uCamPos: [camX(t), camY(t), camZ(t)], uCamRot: rot, uFocal: focal, uFrame: Math.round(t * 30),
        uRain: 1, uEnds: endsU,
      });
      // 4) bloom
      const ex = expo(t);
      K.pass(pre, levels[0], { uSrc: sceneT, uTexel: [1 / W, 1 / H], uExpo: ex, uThr: 1.0 });
      for (let i = 1; i < levels.length; i++) K.pass(down, levels[i], { uSrc: levels[i - 1], uTexel: [1 / levels[i - 1].w, 1 / levels[i - 1].h] });
      for (let i = levels.length - 1; i > 0; i--) K.pass(up, levels[i - 1], { uSrc: levels[i], uTexel: [1 / levels[i].w, 1 / levels[i].h], uK: 1.0 }, { blend: [gl.ONE, gl.ONE] });
      // 5) tone map
      K.pass(fin, null, { uScene: sceneT, uBloom: levels[0], uExpo: ex, uBloomK: 0.22, uFrame: Math.round(t * 30) });
    };
  },
  frame(t) { this.draw(t); },
});
