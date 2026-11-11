/*
 * 28 · 백만 개의 입자 — two disc galaxies collide: 1,048,576 particles integrated by WGSL compute shaders.
 *
 * Every particle step (3 per video frame, kick–drift–kick in the symmetric "drift–kick–drift" form):
 *   force = two softened galaxy cores (bulge + dark halo; their orbit is integrated in JS, model.js)
 *         + the particles' own gravity through a coarse particle mesh (PM): a quarter of the particles deposit
 *           their mass on a 32×12×32 grid with cloud-in-cell weights (fixed-point atomicAdd — integer sums do not
 *           depend on thread order, so the result is bit-exact every run), a tiled compute pass convolves the mesh
 *           with the softened Green's function by direct summation (12,288² pairs), and each particle reads the
 *           field back with the same CIC weights.
 *   A tidal "excitation" per particle (the other galaxy's tide, decaying) lights up star formation in the
 *   bridge and tails.
 * Rendering: one instanced draw of 1M additive point quads (flux-conserving Gaussians) into an rgba16float
 * target, a 3-level bloom, ACES tone mapping over a faint star field.
 * Seeking: replay() with GPU checkpoints (copyBufferToBuffer of the position and velocity buffers).
 * Without WebGPU the stage shows a notice and frame() does nothing.
 */
import { defineDemo, replay, track, ease, clamp, rand } from '../_lib/stage.js';
import * as M from './model.js';
import { camera } from './camera.js';

const D = 9.5;
const FR = Math.round(D * M.FPS);                 // 285 video frames
const NCELL = M.GX * M.GY * M.GZ;                 // 12,288 mesh cells
const SIM_STRIDE = 256;                           // uniform slot per particle sub-step (dynamic offset alignment)
const TOTAL_SUB = (FR + 2) * M.SUB;               // sub-steps that can ever run (+ margin)
const INIT_SLOT = TOTAL_SUB;                      // the slot used while setting up velocities
const DEPOSIT_EVERY = 4;                          // every 4th particle deposits 4× the mass
const FIX = 2048;                                 // fixed-point scale of the CIC weights
const EXC_TAU = 80;                               // decay time of the tidal excitation (simulation units)

// ------------------------------------------------------------------ WGSL: simulation
const SIM_HEAD = (gridType) => /* wgsl */`
struct Sim {
  core0: vec4f, core1: vec4f,     // core positions at the half step, w = core mass
  vcore0: vec4f, vcore1: vec4f,   // core velocities (velocity set-up only)
  tide0: vec4f, tide1: vec4f,     // the other core's pull on each core (subtracted -> tidal acceleration)
  axis0: vec4f, axis1: vec4f,     // disc spin axes (velocity set-up only)
  gmin: vec4f,                    // mesh corner, w = cell size
  p0: vec4f,                      // step h, core softening^2, mesh softening^2, mass per fixed-point unit
  p1: vec4f,                      // excitation decay per step, tide threshold low, high, -
  dims: vec4u,                    // GX, GY, GZ, N
};
@group(0) @binding(0) var<uniform> S: Sim;
@group(0) @binding(1) var<storage, read_write> pos: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> vel: array<vec4f>;
@group(0) @binding(3) var<storage, read> attr: array<u32>;
@group(0) @binding(4) var<storage, read_write> grid: array<${gridType}>;
@group(0) @binding(5) var<storage, read_write> field: array<vec4f>;

fn plummer(p: vec3f, c: vec4f, e2: f32) -> vec3f {
  let d = c.xyz - p;
  let r2 = dot(d, d) + e2;
  let inv = inverseSqrt(r2);
  return d * (c.w * inv * inv * inv);
}
`;

// PM field at p: trilinear (CIC) interpolation of the mesh accelerations, clamped to the mesh
const SAMPLE_PM = /* wgsl */`
fn samplePM(p: vec3f) -> vec3f {
  let dims = vec3f(S.dims.xyz);
  let g = clamp((p - S.gmin.xyz) / S.gmin.w - 0.5, vec3f(0.0), dims - 1.001);
  let fl = floor(g);
  let f = g - fl;
  let b = vec3u(fl);
  let gx = S.dims.x;
  let gxy = S.dims.x * S.dims.y;
  let i = b.z * gxy + b.y * gx + b.x;
  let x00 = mix(field[i].xyz, field[i + 1u].xyz, f.x);
  let x10 = mix(field[i + gx].xyz, field[i + gx + 1u].xyz, f.x);
  let x01 = mix(field[i + gxy].xyz, field[i + gxy + 1u].xyz, f.x);
  let x11 = mix(field[i + gxy + gx].xyz, field[i + gxy + gx + 1u].xyz, f.x);
  return mix(mix(x00, x10, f.y), mix(x01, x11, f.y), f.z);
}
`;

// 1. mass deposit: cloud-in-cell, fixed-point atomic adds
const DEPOSIT = SIM_HEAD('atomic<i32>') + /* wgsl */`
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x * ${DEPOSIT_EVERY}u;
  if (i >= S.dims.w) { return; }
  let g = (pos[i].xyz - S.gmin.xyz) / S.gmin.w - 0.5;
  let fl = floor(g);
  let f = g - fl;
  let b = vec3i(fl);
  let dims = vec3i(S.dims.xyz);
  for (var c = 0u; c < 8u; c++) {
    let o = vec3i(i32(c & 1u), i32((c >> 1u) & 1u), i32(c >> 2u));
    let q = b + o;
    if (any(q < vec3i(0)) || any(q >= dims)) { continue; }
    let w3 = select(vec3f(1.0) - f, f, o == vec3i(1));
    let w = w3.x * w3.y * w3.z;
    atomicAdd(&grid[(q.z * dims.y + q.y) * dims.x + q.x], i32(w * ${FIX}.0 + 0.5));
  }
}`;

// 2. mesh field: direct-sum convolution with the softened Green's function, tiled through workgroup memory
const FIELD = SIM_HEAD('i32') + /* wgsl */`
var<workgroup> tile: array<vec4f, 64>;
fn node(j: u32) -> vec3f {
  let x = j % S.dims.x;
  let y = (j / S.dims.x) % S.dims.y;
  let z = j / (S.dims.x * S.dims.y);
  return S.gmin.xyz + (vec3f(f32(x), f32(y), f32(z)) + 0.5) * S.gmin.w;
}
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u, @builtin(local_invocation_index) li: u32) {
  let ncell = S.dims.x * S.dims.y * S.dims.z;
  let p = node(id.x);
  var acc = vec3f(0.0);
  for (var base = 0u; base < ncell; base += 64u) {
    let j = base + li;
    tile[li] = vec4f(node(j), f32(grid[j]) * S.p0.w);
    workgroupBarrier();
    for (var k = 0u; k < 64u; k++) {
      let s = tile[k];
      let d = s.xyz - p;
      let r2 = dot(d, d) + S.p0.z;
      let inv = inverseSqrt(r2);
      acc += d * (s.w * inv * inv * inv);
    }
    workgroupBarrier();
  }
  field[id.x] = vec4f(acc, 0.0);
}`;

// 3. one particle step: drift h/2 → kick h (cores + mesh) → drift h/2; tidal excitation
const INTEGRATE = SIM_HEAD('i32') + SAMPLE_PM + /* wgsl */`
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= S.dims.w) { return; }
  let p = pos[i];
  let v = vel[i];
  let h = S.p0.x;
  var x = p.xyz + v.xyz * (0.5 * h);
  let a0 = plummer(x, S.core0, S.p0.y);
  let a1 = plummer(x, S.core1, S.p0.y);
  let nv = v.xyz + (a0 + a1 + samplePM(x)) * h;
  x += nv * (0.5 * h);
  // tide of the other galaxy = its pull here minus its pull on our own core
  let tide = select(a1 - S.tide0.xyz, a0 - S.tide1.xyz, (attr[i] & 1u) == 1u);
  let ex = max(v.w * S.p1.x, smoothstep(S.p1.y, S.p1.z, length(tide)));
  pos[i] = vec4f(x, p.w);
  vel[i] = vec4f(nv, ex);
}`;

// set-up: (a) move each galaxy's particles to its core, (b) after a mesh pass, give every particle the circular
// speed of the force field it actually feels (own core + mesh) plus its random dispersion
const SETUP = SIM_HEAD('i32') + SAMPLE_PM + /* wgsl */`
@compute @workgroup_size(256)
fn place(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= S.dims.w) { return; }
  let c = select(S.core0, S.core1, (attr[i] & 1u) == 1u);
  pos[i] = vec4f(pos[i].xyz + c.xyz, pos[i].w);
}
@compute @workgroup_size(256)
fn spin(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= S.dims.w) { return; }
  let a = attr[i];
  let g1 = (a & 1u) == 1u;
  let pop = (a >> 1u) & 7u;
  let c = select(S.core0, S.core1, g1);
  let cv = select(S.vcore0, S.vcore1, g1).xyz;
  let ax = select(S.axis0, S.axis1, g1).xyz;
  let x = pos[i].xyz;
  let d = x - c.xyz;
  let acc = plummer(x, c, S.p0.y) + samplePM(x);
  let rnd = vel[i];
  var vr: vec3f;
  if (pop == 0u) {
    // bulge: orbits in random planes with a share of the disc's rotation, plus random motion
    let r = max(length(d), 1e-3);
    let er = d / r;
    let vc = sqrt(max(-dot(acc, er) * r, 0.0));
    let t = normalize(mix(cross(rnd.xyz, er), cross(ax, er), 0.35) + vec3f(1e-5, 2e-5, -1e-5));
    vr = t * (vc * 0.75) + rnd.xyz * (vc * rnd.w);
  } else {
    // disc: circular speed in the disc plane from the radial force, a small dispersion
    let din = d - ax * dot(d, ax);
    let R = max(length(din), 1e-3);
    let eR = din / R;
    let vc = sqrt(max(-dot(acc, eR) * R, 0.0));
    vr = cross(ax, eR) * vc + rnd.xyz * (vc * rnd.w);
  }
  vel[i] = vec4f(cv + vr, 0.0);
}`;

// ------------------------------------------------------------------ WGSL: rendering
const PARTICLE = /* wgsl */`
struct Cam { eye: vec4f, r: vec4f, u: vec4f, f: vec4f, k: vec4f, k2: vec4f };
// k: focal px, optical centre y, flux scale, reference distance * k2: starburst gain, base radius px, -, -
@group(0) @binding(0) var<uniform> C: Cam;
struct VO { @builtin(position) pos: vec4f, @location(0) q: vec2f, @location(1) col: vec3f };

@vertex
fn vs(@builtin(vertex_index) vi: u32, @location(0) p: vec4f, @location(1) ex: f32, @location(2) a: u32) -> VO {
  var o: VO;
  o.q = vec2f(0.0);
  o.col = vec3f(0.0);
  o.pos = vec4f(4.0, 4.0, 0.5, 1.0);          // off screen (culled) unless set below
  let q = p.xyz - C.eye.xyz;
  let z = dot(q, C.f.xyz);
  if (z < 2.0) { return o; }
  let pop = (a >> 1u) & 7u;
  let bri = f32((a >> 4u) & 255u) / 255.0;
  let cj = f32((a >> 12u) & 255u) / 255.0;
  let sz = f32((a >> 20u) & 255u) / 255.0;
  let e = clamp(ex, 0.0, 1.0) * C.k2.x;
  var col: vec3f;
  var flux: f32;
  var rad: f32;
  switch pop {
    case 0u: { col = mix(vec3f(1.0, 0.70, 0.42), vec3f(1.0, 0.85, 0.66), cj); flux = 0.85; rad = 1.0; }
    case 1u: { col = mix(vec3f(1.0, 0.82, 0.64), vec3f(0.90, 0.90, 0.98), cj); flux = 0.8; rad = 1.0; }
    case 2u: {
      col = mix(vec3f(0.46, 0.62, 1.0), vec3f(0.70, 0.82, 1.0), cj);
      if ((a & 1u) == 1u) { col = mix(col, vec3f(0.72, 0.58, 1.0), 0.45); }
      col = mix(col, vec3f(0.80, 0.90, 1.0), e * 0.5);
      flux = 0.8 * (1.0 + 1.8 * e); rad = 1.05;
    }
    case 3u: { col = mix(vec3f(1.0, 0.30, 0.56), vec3f(1.0, 0.46, 0.40), cj); flux = 0.45 + 4.5 * e; rad = 1.2 + 0.7 * e; }
    default: { col = vec3f(0.70, 0.83, 1.0); flux = 2.4; rad = 1.45; }
  }
  flux *= 0.3 + 2.4 * bri * bri;
  // flux falls with distance^2 (surface brightness stays put as the camera pulls back); the footprint shrinks
  // more gently, and never below ~1.5 px so a moving point never flickers
  let zr = C.k.w / z;
  flux *= C.k.z * zr * zr;
  let r = max(C.k2.y * rad * (0.8 + 0.5 * sz) * clamp(sqrt(zr), 0.75, 1.35), 1.5);
  let sx = 540.0 + C.k.x * dot(q, C.r.xyz) / z;
  let sy = C.k.y - C.k.x * dot(q, C.u.xyz) / z;
  let corner = vec2f(f32(vi & 1u), f32(vi >> 1u)) * 2.0 - 1.0;
  o.pos = vec4f((sx + corner.x * r) / 540.0 - 1.0, 1.0 - (sy + corner.y * r) / 960.0, 0.5, 1.0);
  o.q = corner;
  // a normalised Gaussian: the total light of a particle does not depend on its footprint
  o.col = col * (flux / (r * r * 0.7854));
  return o;
}
@fragment
fn fs(i: VO) -> @location(0) vec4f {
  let d2 = dot(i.q, i.q);
  let g = exp(-4.0 * d2) * (1.0 - smoothstep(0.7, 1.0, d2));
  return vec4f(i.col * g, 0.0);
}`;

const FULLSCREEN = /* wgsl */`
@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  return vec4f(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// 2× downsample: four bilinear taps = a 4×4 box (no fireflies from single bright pixels)
const DOWN = FULLSCREEN + /* wgsl */`
@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var src: texture_2d<f32>;
@fragment
fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let sz = vec2f(textureDimensions(src));
  let uv = fc.xy * 2.0 / sz;
  let t = 1.0 / sz;
  let c = textureSample(src, samp, uv + vec2f(-t.x, -t.y)) + textureSample(src, samp, uv + vec2f(t.x, -t.y))
        + textureSample(src, samp, uv + vec2f(-t.x, t.y)) + textureSample(src, samp, uv + vec2f(t.x, t.y));
  return vec4f(c.rgb * 0.25, 1.0);
}`;

// separable Gaussian (9 taps through 5 bilinear samples)
const BLUR = FULLSCREEN + /* wgsl */`
@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var src: texture_2d<f32>;
@group(0) @binding(2) var<uniform> dir: vec4f;
@fragment
fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let sz = vec2f(textureDimensions(src));
  let uv = fc.xy / sz;
  let d = dir.xy / sz;
  var c = textureSample(src, samp, uv).rgb * 0.2270270;
  c += (textureSample(src, samp, uv + d * 1.3846154).rgb + textureSample(src, samp, uv - d * 1.3846154).rgb) * 0.3162162;
  c += (textureSample(src, samp, uv + d * 3.2307692).rgb + textureSample(src, samp, uv - d * 3.2307692).rgb) * 0.0702703;
  return vec4f(c, 1.0);
}`;

const COMPOSITE = FULLSCREEN + /* wgsl */`
struct P { a: vec4f, b: vec4f };   // a: exposure, bloom near, bloom wide, frame * b: fade, sky rotation, star level, -
@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var hdr: texture_2d<f32>;
@group(0) @binding(2) var bh: texture_2d<f32>;
@group(0) @binding(3) var bq: texture_2d<f32>;
@group(0) @binding(4) var be: texture_2d<f32>;
@group(0) @binding(5) var<uniform> U: P;

fn hash2(p: vec2f) -> vec3f {
  var q = fract(vec3f(p.xyx) * vec3f(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yxz + 33.33);
  return fract((q.xxy + q.yzz) * q.zyx);
}
fn vnoise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = p - i;
  let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i).x, hash2(i + vec2f(1.0, 0.0)).x, u.x), mix(hash2(i + vec2f(0.0, 1.0)).x, hash2(i + vec2f(1.0, 1.0)).x, u.x), u.y);
}
// background stars on a hash grid; a star may sit near its cell edge, so the 3x3 neighbourhood is summed
fn stars(p: vec2f, cell: f32, seed: f32, density: f32) -> vec3f {
  let g = p / cell;
  let id = floor(g);
  var acc = vec3f(0.0);
  for (var j = -1; j <= 1; j++) {
    for (var i = -1; i <= 1; i++) {
      let c = id + vec2f(f32(i), f32(j));
      let h = hash2(c + seed);
      if (h.x > density) { continue; }
      let h2 = hash2(c + seed + 17.3);
      let sp = (c + 0.15 + 0.7 * h2.xy) * cell;
      let d = length(p - sp);
      let b = h2.z * h2.z;
      let r = 0.7 + 1.1 * b;
      let tint = mix(vec3f(0.70, 0.80, 1.0), vec3f(1.0, 0.86, 0.70), h.y);
      acc += tint * (0.25 + 1.6 * b) * exp(-d * d / (r * r));
    }
  }
  return acc;
}
fn aces(x: vec3f) -> vec3f {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}
@fragment
fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let res = vec2f(1080.0, 1920.0);
  let uv = fc.xy / res;
  var c = textureLoad(hdr, vec2i(fc.xy), 0).rgb;
  let bloomNear = textureSample(bh, samp, uv).rgb;
  let bloomWide = textureSample(bq, samp, uv).rgb * 0.6 + textureSample(be, samp, uv).rgb * 0.4;
  c = c * U.a.x + (bloomNear * U.a.y + bloomWide * U.a.z) * U.a.x;

  // sky: deep blue-violet, a faint haze, stars that turn with the camera
  let ctr = vec2f(540.0, 880.0);
  let ang = U.b.y;
  let rot = mat2x2f(cos(ang), sin(ang), -sin(ang), cos(ang));
  let sp = rot * (fc.xy - ctr);
  var sky = mix(vec3f(0.006, 0.006, 0.016), vec3f(0.012, 0.010, 0.028), 1.0 - smoothstep(0.0, 1.2, length((uv - vec2f(0.5, 0.45)) * vec2f(1.0, 0.7))));
  let haze = vnoise(sp * 0.0032 + 3.0) * vnoise(sp * 0.0071 - 7.0);
  sky += vec3f(0.020, 0.014, 0.040) * haze * haze * 2.0;
  sky += (stars(sp, 46.0, 3.1, 0.30) * 0.05 + stars(sp, 140.0, 9.7, 0.55) * 0.14) * U.b.z;
  c += sky;

  c *= U.b.x;
  var col = aces(c);
  // vignette
  let v = (uv - vec2f(0.5, 0.46)) * vec2f(1.0, 0.62) * 2.0;
  col *= 1.0 - 0.38 * smoothstep(0.35, 1.25, dot(v, v));
  col = pow(col, vec3f(1.0 / 2.2));
  // dither (fixed per frame number)
  col += (hash2(fc.xy + U.a.w * 7.13).x - 0.5) / 255.0;
  return vec4f(col, 1.0);
}`;

// ------------------------------------------------------------------ the story (pure functions of t)
// the tails thin out as they stretch, so the exposure rises a little through the afterglow
const exposure = track([[0, 0.0], [0.9, 1.0, ease.outCubic], [4.0, 1.0], [8.0, 1.3], [D, 1.15]]);
const starburst = track([[0, 1.0], [D, 1.0]]);
const bloomNear = track([[0, 0.10], [2.6, 0.12], [4.2, 0.2], [7.5, 0.13], [D, 0.11]]);
const bloomWide = track([[0, 0.18], [2.6, 0.24], [4.2, 0.36], [7.5, 0.24], [D, 0.2]]);

// the flux scale: 1M particles at ~1 px² each; chosen so a disc's outskirts sit mid-grey and tails stay visible
const FLUX = 0.32;

function notice(stage, msg, sub) {
  const el = document.createElement('div');
  el.style.cssText = 'position:absolute;left:80px;right:80px;top:760px;text-align:center;color:#e8ecf4;font-family:"Pretendard Variable",Pretendard,sans-serif;z-index:5';
  el.innerHTML = `<div style="font-size:46px;font-weight:700;letter-spacing:-0.01em;line-height:1.4">${msg}</div>` +
    `<div style="margin-top:22px;font-size:28px;font-weight:500;line-height:1.6;opacity:.66">${sub}</div>`;
  stage.appendChild(el);
}

defineDemo({
  id: '28-webgpu-particles',
  title: '백만 개의 입자',
  tech: 'WebGPU 컴퓨트 셰이더 · 입자 100만 개 중력 시뮬레이션',
  duration: D,
  background: '#020206',
  async setup({ stage, canvas, headless }) {
    this.headless = headless;
    this.ok = false;
    let adapter = null, device = null;
    try {
      if (navigator.gpu) adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (adapter) device = await adapter.requestDevice();
    } catch (e) { device = null; }
    if (!device) {
      notice(stage, '이 브라우저는 WebGPU를 지원하지 않습니다', '입자 100만 개의 컴퓨트 셰이더 시뮬레이션은 WebGPU가 필요합니다.<br>Chrome·Edge 113 이상(또는 WebGPU를 켠 Safari·Firefox)에서 열어 주세요.');
      return;
    }
    device.addEventListener('uncapturederror', (e) => console.error('WebGPU:', e.error && e.error.message));
    device.lost.then((info) => console.warn('WebGPU device lost:', info.message));
    const { el } = canvas({ type: 'webgpu' });
    const ctx = el.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: 'opaque' });

    const U = GPUBufferUsage, SS = GPUShaderStage;
    device.pushErrorScope('validation');
    const module = async (code, label) => {
      const m = device.createShaderModule({ code, label });
      const info = await m.getCompilationInfo();
      const errs = info.messages.filter((x) => x.type === 'error');
      if (errs.length) throw new Error(`WGSL ${label}: ` + errs.map((x) => `${x.lineNum}:${x.linePos} ${x.message}`).join('\n'));
      return m;
    };

    // ---------------- buffers
    const P = M.makeParticles(rand);
    const posBuf = device.createBuffer({ size: M.N * 16, usage: U.STORAGE | U.VERTEX | U.COPY_SRC | U.COPY_DST });
    const velBuf = device.createBuffer({ size: M.N * 16, usage: U.STORAGE | U.VERTEX | U.COPY_SRC | U.COPY_DST });
    const attrBuf = device.createBuffer({ size: M.N * 4, usage: U.STORAGE | U.VERTEX | U.COPY_DST });
    const gridBuf = device.createBuffer({ size: NCELL * 4, usage: U.STORAGE | U.COPY_DST });
    const fieldBuf = device.createBuffer({ size: NCELL * 16, usage: U.STORAGE | U.COPY_DST });
    device.queue.writeBuffer(attrBuf, 0, P.attr);

    // every sub-step's uniforms, written once: core positions at the half step come from the JS orbit
    const orbit = M.coreOrbit(FR + 2);
    const simBuf = device.createBuffer({ size: (TOTAL_SUB + 1) * SIM_STRIDE, usage: U.UNIFORM | U.COPY_DST });
    {
      const ab = new ArrayBuffer((TOTAL_SUB + 1) * SIM_STRIDE);
      const ax0 = M.discAxis(0), ax1 = M.discAxis(1);
      const mpc = DEPOSIT_EVERY * (2 * M.MD / M.N) / FIX;
      for (let s = 0; s <= TOTAL_SUB; s++) {
        const c = orbit.at(s === INIT_SLOT ? 0 : Math.min(2 * s + 1, orbit.halfSteps - 1));
        const f = new Float32Array(ab, s * SIM_STRIDE, 44), u = new Uint32Array(ab, s * SIM_STRIDE + 176, 4);
        const t0 = M.plummer(c.x0, c.x1, M.MC, M.EPS_C), t1 = M.plummer(c.x1, c.x0, M.MC, M.EPS_C);
        f.set([...c.x0, M.MC, ...c.x1, M.MC, ...c.v0, 0, ...c.v1, 0, ...t0, 0, ...t1, 0, ...ax0, 0, ...ax1, 0,
          ...M.GRID_MIN, M.CELL, M.H, M.EPS_C ** 2, M.EPS_PM ** 2, mpc, Math.exp(-M.H / EXC_TAU), 0.0035, 0.03, 0]);
        u.set([M.GX, M.GY, M.GZ, M.N]);
      }
      device.queue.writeBuffer(simBuf, 0, ab);
    }

    // ---------------- compute pipelines (one explicit layout shared by all kernels)
    const simLayout = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: SS.COMPUTE, buffer: { type: 'uniform', hasDynamicOffset: true, minBindingSize: 192 } },
      { binding: 1, visibility: SS.COMPUTE, buffer: { type: 'storage' } },
      { binding: 2, visibility: SS.COMPUTE, buffer: { type: 'storage' } },
      { binding: 3, visibility: SS.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 4, visibility: SS.COMPUTE, buffer: { type: 'storage' } },
      { binding: 5, visibility: SS.COMPUTE, buffer: { type: 'storage' } },
    ] });
    const simPL = device.createPipelineLayout({ bindGroupLayouts: [simLayout] });
    const simBG = device.createBindGroup({ layout: simLayout, entries: [
      { binding: 0, resource: { buffer: simBuf, offset: 0, size: 192 } },
      { binding: 1, resource: { buffer: posBuf } },
      { binding: 2, resource: { buffer: velBuf } },
      { binding: 3, resource: { buffer: attrBuf } },
      { binding: 4, resource: { buffer: gridBuf } },
      { binding: 5, resource: { buffer: fieldBuf } },
    ] });
    const cpipe = async (code, label, entryPoint = 'main') =>
      device.createComputePipelineAsync({ layout: simPL, compute: { module: await module(code, label), entryPoint } });
    const [pDeposit, pField, pIntegrate, pPlace, pSpin] = await Promise.all([
      cpipe(DEPOSIT, 'deposit'), cpipe(FIELD, 'field'), cpipe(INTEGRATE, 'integrate'),
      cpipe(SETUP, 'place', 'place'), cpipe(SETUP, 'spin', 'spin'),
    ]);
    const WG = Math.ceil(M.N / 256), WG_DEP = Math.ceil(M.N / DEPOSIT_EVERY / 256), WG_FIELD = NCELL / 64;
    const dispatch = (pass, pipe, slot, n) => { pass.setPipeline(pipe); pass.setBindGroup(0, simBG, [slot * SIM_STRIDE]); pass.dispatchWorkgroups(n); };
    const meshPass = (enc, slot) => {
      enc.clearBuffer(gridBuf);
      const pass = enc.beginComputePass();
      dispatch(pass, pDeposit, slot, WG_DEP);
      dispatch(pass, pField, slot, WG_FIELD);
      pass.end();
    };

    // ---------------- render targets and pipelines
    const tex = (w, h) => device.createTexture({ size: [w, h], format: 'rgba16float', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
    const hdr = tex(1080, 1920), half = tex(540, 960), halfB = tex(540, 960);
    const q1 = tex(270, 480), q2 = tex(270, 480), e1 = tex(135, 240), e2 = tex(135, 240);
    const samp = device.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' });

    const camBuf = device.createBuffer({ size: 96, usage: U.UNIFORM | U.COPY_DST });
    const compBuf = device.createBuffer({ size: 32, usage: U.UNIFORM | U.COPY_DST });
    const dirBufs = [[1, 0], [0, 1]].map((d) => {
      const b = device.createBuffer({ size: 16, usage: U.UNIFORM | U.COPY_DST });
      device.queue.writeBuffer(b, 0, new Float32Array([d[0], d[1], 0, 0]));
      return b;
    });
    const add = { color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } };
    const pm = await module(PARTICLE, 'particles');
    const [pParticles, pDown, pBlur, pComp] = await Promise.all([
      device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: { module: pm, entryPoint: 'vs', buffers: [
          { arrayStride: 16, stepMode: 'instance', attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }] },
          { arrayStride: 16, stepMode: 'instance', attributes: [{ shaderLocation: 1, offset: 12, format: 'float32' }] },
          { arrayStride: 4, stepMode: 'instance', attributes: [{ shaderLocation: 2, offset: 0, format: 'uint32' }] },
        ] },
        fragment: { module: pm, entryPoint: 'fs', targets: [{ format: 'rgba16float', blend: add }] },
        primitive: { topology: 'triangle-strip' },
      }),
      ...[[DOWN, 'down', 'rgba16float'], [BLUR, 'blur', 'rgba16float'], [COMPOSITE, 'composite', format]].map(async ([code, label, fmt]) => {
        const m = await module(code, label);
        return device.createRenderPipelineAsync({ layout: 'auto', vertex: { module: m, entryPoint: 'vs' }, fragment: { module: m, entryPoint: 'fs', targets: [{ format: fmt }] }, primitive: { topology: 'triangle-list' } });
      }),
    ]);
    const bg = (pipe, entries) => device.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: entries.map((r, i) => ({ binding: i, resource: r })) });
    const view = (t) => t.createView();
    const bgParticles = bg(pParticles, [{ buffer: camBuf }]);
    const bgDown = [[hdr, half], [half, q1], [q1, e1]].map(([s]) => bg(pDown, [samp, view(s)]));
    const bgBlur = {
      halfH: bg(pBlur, [samp, view(half), { buffer: dirBufs[0] }]), halfV: bg(pBlur, [samp, view(halfB), { buffer: dirBufs[1] }]),
      qH: bg(pBlur, [samp, view(q1), { buffer: dirBufs[0] }]), qV: bg(pBlur, [samp, view(q2), { buffer: dirBufs[1] }]),
      eH: bg(pBlur, [samp, view(e1), { buffer: dirBufs[0] }]), eV: bg(pBlur, [samp, view(e2), { buffer: dirBufs[1] }]),
    };
    // blurred results: half → half (via halfB), q1 → q1 (via q2), e1 → e1 (via e2)
    const bgComp = bg(pComp, [samp, view(hdr), view(half), view(q1), view(e1), { buffer: compBuf }]);
    const err = await device.popErrorScope();
    if (err) throw new Error('WebGPU set-up: ' + err.message);

    const fsPass = (enc, pipe, group, target) => {
      const pass = enc.beginRenderPass({ colorAttachments: [{ view: target, loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }] });
      pass.setPipeline(pipe); pass.setBindGroup(0, group); pass.draw(3); pass.end();
    };
    const views = { hdr: view(hdr), half: view(half), halfB: view(halfB), q1: view(q1), q2: view(q2), e1: view(e1), e2: view(e2) };

    // ---------------- the simulation, seekable
    const R = replay({
      dt: 1 / M.FPS,
      every: 60,
      init: () => {
        device.queue.writeBuffer(posBuf, 0, P.pos);
        device.queue.writeBuffer(velBuf, 0, P.vel);
        const enc = device.createCommandEncoder();
        let pass = enc.beginComputePass();
        dispatch(pass, pPlace, INIT_SLOT, WG);
        pass.end();
        meshPass(enc, INIT_SLOT);
        pass = enc.beginComputePass();
        dispatch(pass, pSpin, INIT_SLOT, WG);
        pass.end();
        device.queue.submit([enc.finish()]);
      },
      step: (n) => {
        const enc = device.createCommandEncoder();
        for (let k = 0; k < M.SUB; k++) {
          const slot = n * M.SUB + k;
          if (k === 0) meshPass(enc, slot);          // the mesh field is refreshed once per video frame
          const pass = enc.beginComputePass();
          dispatch(pass, pIntegrate, slot, WG);
          pass.end();
        }
        device.queue.submit([enc.finish()]);
      },
      save: () => {
        const c = {
          pos: device.createBuffer({ size: M.N * 16, usage: U.COPY_SRC | U.COPY_DST }),
          vel: device.createBuffer({ size: M.N * 16, usage: U.COPY_SRC | U.COPY_DST }),
        };
        const enc = device.createCommandEncoder();
        enc.copyBufferToBuffer(posBuf, 0, c.pos, 0, M.N * 16);
        enc.copyBufferToBuffer(velBuf, 0, c.vel, 0, M.N * 16);
        device.queue.submit([enc.finish()]);
        return c;
      },
      load: (c) => {
        const enc = device.createCommandEncoder();
        enc.copyBufferToBuffer(c.pos, 0, posBuf, 0, M.N * 16);
        enc.copyBufferToBuffer(c.vel, 0, velBuf, 0, M.N * 16);
        device.queue.submit([enc.finish()]);
      },
    });

    const camData = new Float32Array(24), compData = new Float32Array(8);
    const az0 = camera(0);
    this.render = (t) => {
      const C = camera(t);
      camData.set([...C.eye, 0, ...C.r, 0, ...C.u, 0, ...C.f, 0, C.focal, C.cy, FLUX, 120, starburst(t), 1.9, 0, 0]);
      device.queue.writeBuffer(camBuf, 0, camData);
      // the sky turns with the picture: the camera's yaw since t = 0 (the image turns the same way, so the star field
      // is rotated back by it)
      const skyRot = Math.atan2(C.r[0] * az0.r[2] - C.r[2] * az0.r[0], C.r[0] * az0.r[0] + C.r[2] * az0.r[2]);
      compData.set([exposure(t), bloomNear(t), bloomWide(t), Math.round(t * M.FPS), 1, -skyRot, 1, 0]);
      device.queue.writeBuffer(compBuf, 0, compData);

      const enc = device.createCommandEncoder();
      const pass = enc.beginRenderPass({ colorAttachments: [{ view: views.hdr, loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 0] }] });
      pass.setPipeline(pParticles);
      pass.setBindGroup(0, bgParticles);
      pass.setVertexBuffer(0, posBuf);
      pass.setVertexBuffer(1, velBuf);
      pass.setVertexBuffer(2, attrBuf);
      pass.draw(4, M.N);
      pass.end();
      fsPass(enc, pDown, bgDown[0], views.half);
      fsPass(enc, pDown, bgDown[1], views.q1);
      fsPass(enc, pDown, bgDown[2], views.e1);
      fsPass(enc, pBlur, bgBlur.halfH, views.halfB);
      fsPass(enc, pBlur, bgBlur.halfV, views.half);
      fsPass(enc, pBlur, bgBlur.qH, views.q2);
      fsPass(enc, pBlur, bgBlur.qV, views.q1);
      fsPass(enc, pBlur, bgBlur.eH, views.e2);
      fsPass(enc, pBlur, bgBlur.eV, views.e1);
      fsPass(enc, pComp, bgComp, ctx.getCurrentTexture().createView());
      device.queue.submit([enc.finish()]);
    };
    this.R = R;
    this.device = device;
    this.ok = true;
  },
  async frame(t) {
    if (!this.ok) return;
    const n0 = this.R.step;
    await this.R.seek(t);
    this.render(t);
    // wait for the GPU only for captures and after long seeks (scrubbing), so no backlog builds up. In playback
    // (1–2 steps per tick) the wait would end after the next display refresh and the player would skip that tick.
    if (this.headless || Math.abs(this.R.step - n0) > 6) await this.device.queue.onSubmittedWorkDone();
  },
});
