/*
 * 41 · 끝없는 맨델브로트 — a zoom from the whole Mandelbrot set to a copy of itself 10¹⁵ times smaller.
 *
 * Doubles run out near 10⁻¹³ (pixel steps fall below their 2⁻⁵³ relative spacing); float32 at 10⁻⁶. So:
 *   1. setup() works in BigInt fixed point (256 fraction bits ≈ 77 digits). Starting from the famous seahorse
 *      valley point, Newton's method on z_p(c) = 0 (p = 998, the period found from the orbit's closest returns to 0)
 *      finds the nucleus c₀ of a minibrot; its size and rotation come from the minibrot size estimate
 *      1/(β λ²). The reference orbit Z₀…Z_p of c₀ (exactly periodic: Z_p = 0) is uploaded as a float texture.
 *   2. Perturbation: each pixel iterates only its tiny offset δ from the reference,
 *      δ ← 2Zδ + δ² + δc, in float32 — δc ~ 10⁻¹⁵ is fine in float, only the reference needed precision.
 *   3. Glitches (precision loss when the pixel's orbit leaves the reference) are avoided by Zhuoran's rebasing:
 *      whenever |Z + δ| < |δ| (or the reference ends) the pixel restarts from the reference's start with δ = z.
 *   4. Bilinear approximation (BLA): a table of affine maps δ → Aδ + Bδc that skip 2^l iterations at once
 *      while |δ| is below a validity radius (merged pairwise, radii recomputed per frame for the view size).
 *      The ~5000 iterations per pixel at the end take ~1400 loop steps.
 * Colour: smooth iteration count through a cyclic palette, shaded by the "normal map" u = z/z′ and dimmed at the
 * set's edge by the distance estimate |z| ln|z| / |z′|. The zoom is r(t) = exp(ln-scale ramp): constant speed between short cubic ease-in/out.
 */
import { defineDemo, track, ease, clamp } from '../_lib/stage.js';

const D = 9.6;
const SCALE = 0.7;                       // render at 756×1344, shown at 1080×1920
const PERIOD = 998;
const FRAC = 256n, ONE = 1n << FRAC;
// the classic deep seahorse-valley coordinate (the centre of Wikipedia's zoom sequence) — the Newton start
const START = ['-0.743643887037158704752191506114774', '0.131825904205311970493132056385139'];
const EPS = 2 ** -23;                    // BLA validity: neglected δ² below float32 resolution of 2Zδ
const MAX_STEPS = 2500;

// ---------------------------------------------------------------- high precision (BigInt fixed point)
function parseFixed(s) {
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  const [ip, fp = ''] = s.split('.');
  const v = (BigInt(ip + fp) << FRAC) / 10n ** BigInt(fp.length);
  return neg ? -v : v;
}
const fmul = (a, b) => (a * b) >> FRAC;
const toNum = (a) => { const neg = a < 0n; if (neg) a = -a; const v = Number(a >> (FRAC - 90n)) / 2 ** 90; return neg ? -v : v; };
function cdivFixed(ar, ai, br, bi) {
  const d = fmul(br, br) + fmul(bi, bi);
  return [((fmul(ar, br) + fmul(ai, bi)) << FRAC) / d, ((fmul(ai, br) - fmul(ar, bi)) << FRAC) / d];
}
// Newton's method for the nucleus of period p: c ← c − z_p(c) / z_p'(c)
function nucleus(cr, ci, p) {
  for (let it = 0; it < 60; it++) {
    let zr = 0n, zi = 0n, dr = 0n, di = 0n;
    for (let n = 0; n < p; n++) {
      const ndr = 2n * (fmul(zr, dr) - fmul(zi, di)) + ONE, ndi = 2n * (fmul(zr, di) + fmul(zi, dr));
      const nzr = fmul(zr, zr) - fmul(zi, zi) + cr, nzi = 2n * fmul(zr, zi) + ci;
      zr = nzr; zi = nzi; dr = ndr; di = ndi;
    }
    const [qr, qi] = cdivFixed(zr, zi, dr, di);
    cr -= qr; ci -= qi;
    if (Math.hypot(toNum(qr), toNum(qi)) < 1e-65) break;
  }
  return [cr, ci];
}

// ---------------------------------------------------------------- shader
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const FRAG = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 res;
uniform float r, phase, fade, frameNo;
uniform vec2 rotv, offs, C0;
uniform int P, levels, maxSteps;
uniform sampler2D refTex, blaAB, blaR, palTex;
out vec4 o;

vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * res) / (0.5 * res.y);          // y ∈ [−1, 1]
  vec2 dc = offs + vec2(q.x * rotv.x - q.y * rotv.y, q.x * rotv.y + q.y * rotv.x) * r;
  float ps = 2.0 * r / res.y;                                       // pixel size in c
  bool escaped = false, inside = false;
  vec2 z = vec2(0.0), d = vec2(0.0), dz = vec2(0.0);               // z, δ, dz/dc·ps
  float n = 0.0;
  if (r > 1e-3) {                                                    // wide views: main cardioid and period-2 bulb
    vec2 c = C0 + dc;
    float x = c.x - 0.25, q2 = x * x + c.y * c.y;
    if (q2 * (q2 + x) < 0.25 * c.y * c.y || (c.x + 1.0) * (c.x + 1.0) + c.y * c.y < 0.0625) inside = true;
  }
  int m = 0, wraps = 0, nextSave = 1;
  vec2 ws = vec2(1e30);
  for (int s = 0; s < maxSteps && !inside; s++) {
    bool jumped = false;
    if (m >= 1) {
      // BLA: the longest aligned skip whose validity radius still covers |δ| (radii shrink with length)
      int k = m - 1, best = -1;
      float d2 = dot(d, d);
      for (int l = 0; l < levels; l++) {
        if ((k & ((1 << l) - 1)) != 0 || (k >> l) >= ((P - 1) >> l)) break;
        float R = texelFetch(blaR, ivec2(k >> l, l), 0).r;
        if (d2 < R * R) best = l; else break;
      }
      if (best >= 0) {
        vec4 AB = texelFetch(blaAB, ivec2(k >> best, best), 0);
        d = cmul(AB.xy, d) + cmul(AB.zw, dc);
        dz = cmul(AB.xy, dz) + AB.zw * ps;
        int len = 1 << best;
        m += len; n += float(len);
        jumped = true;
      }
    }
    if (!jumped) {                                                   // one perturbation step
      vec2 Z = texelFetch(refTex, ivec2(m, 0), 0).xy;
      dz = 2.0 * cmul(Z + d, dz) + vec2(ps, 0.0);
      d = cmul(2.0 * Z + d, d) + dc;
      m++; n += 1.0;
    }
    z = texelFetch(refTex, ivec2(m, 0), 0).xy + d;
    float z2 = dot(z, z);
    if (z2 > 1e6) { escaped = true; break; }
    if (m >= P) {
      // the reference returned to 0 (Z_P = 0): z = δ is the pixel's point of the minibrot's own orbit.
      // Brent's cycle check on these points: converged to a cycle → inside
      vec2 dd = z - ws;
      if (dot(dd, dd) < 1e-6 * z2) { inside = true; break; }
      wraps++;
      if (wraps >= nextSave) { ws = z; nextSave *= 2; }
    }
    if (z2 < dot(d, d) || m >= P) { d = z; m = 0; }                  // Zhuoran's rebase
  }
  vec3 col = vec3(0.0);
  if (escaped) {
    float lz = 0.5 * log(dot(z, z));
    float nu = n + 1.0 - log2(lz / 0.6931472);                       // smooth iteration count
    float dzl = max(length(dz), 1e-30);
    float de = exp(lz) * lz / dzl;                                   // distance to the set, in pixels
    vec2 u = cmul(z, vec2(dz.x, -dz.y));                             // z / z' (direction only)
    u /= max(length(u), 1e-30);
    float sl = clamp(dot(u, vec2(0.6, 0.8)) * 0.5 + 0.5, 0.0, 1.0);
    float idx = 0.30 * sqrt(max(nu, 1.0)) + 0.45 * log(max(nu, 1.0)) + phase;
    vec3 base = texture(palTex, vec2(idx, 0.5)).rgb;
    col = base * (0.42 + 0.78 * sl);
    col += vec3(1.0, 0.95, 0.85) * 0.18 * pow(sl, 12.0);              // a little specular sheen
    col *= mix(0.12, 1.0, smoothstep(0.0, 1.2, de));                  // the edge: dark, anti-aliased by DE
  } else {
    col = vec3(0.004, 0.003, 0.012);
  }
  vec2 uv = gl_FragCoord.xy / res - 0.5;
  col *= 1.0 - 0.35 * dot(uv * vec2(1.0, 0.8), uv * vec2(1.0, 0.8));
  col *= fade;
  col += (h21(gl_FragCoord.xy + frameNo * 7.13) - 0.5) / 255.0 * 1.5;
  o = vec4(col, 1.0);
}`;

// a cyclic palette: ink → cobalt → cyan → cream → gold → ember → rose → plum → ink
const PAL = [[0.00, '#0b0d2b'], [0.10, '#1b2a6b'], [0.22, '#2f6fb4'], [0.34, '#5ec8d8'], [0.44, '#f2f0dc'],
  [0.54, '#f7c25c'], [0.64, '#e8743b'], [0.76, '#b8325e'], [0.88, '#4a1d5e'], [1.00, '#0b0d2b']];
function paletteData(n = 512) {
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  const out = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    let k = 0;
    while (k < PAL.length - 2 && PAL[k + 1][0] <= x) k++;
    const [x0, h0] = PAL[k], [x1, h1] = PAL[k + 1];
    const f = (x - x0) / (x1 - x0), s = f * f * (3 - 2 * f);
    const a = hex(h0).map(lin), b = hex(h1).map(lin);
    for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(255 * enc(a[c] + (b[c] - a[c]) * s));
    out[i * 4 + 3] = 255;
  }
  return out;
}

// ---------------------------------------------------------------- timeline
const R_HOLD = 1.4e-15;
// ln r(t): hold the whole set, accelerate (cubic) for 1 s, fly at a constant 2.1 decades per second, then brake
// (cubic) onto the copy. Speeds match at the joins: v = 3a/T1 = 3c/T3.
const logR = (() => {
  const L0 = Math.log(2.3), L1 = Math.log(R_HOLD), T0 = 0.3, T1 = 1.0, T2 = 6.0, T3 = D - T0 - T1 - T2;
  const v = (L0 - L1) / (T1 / 3 + T2 + T3 / 3), a = (v * T1) / 3;
  return track([[0, L0], [T0, L0], [T0 + T1, L0 - a, ease.inCubic], [T0 + T1 + T2, L0 - a - v * T2, (p) => p], [D, L1, ease.outCubic]]);
})();
const fade = track([[0, 0], [0.5, 1, ease.outCubic], [9.2, 1], [D, 0, ease.inCubic]]);
// the view turns from the upright whole set (spike up) to the upright copy, which is rotated by arg s
const spinK = track([[0, 1], [D, 0, ease.inOutCubic]]);

defineDemo({
  id: '41-deep-zoom',
  title: '끝없는 맨델브로트',
  tech: '섭동 이론 딥 줌 · 고정밀 기준 궤도 + GPU 델타',
  duration: D,
  async setup({ canvas }) {
    // ---- 1. the reference: nucleus of the period-998 minibrot by Newton in 256-bit fixed point
    const [cr, ci] = nucleus(parseFixed(START[0]), parseFixed(START[1]), PERIOD);
    const Zr = new Float64Array(PERIOD + 1), Zi = new Float64Array(PERIOD + 1);
    let zr = 0n, zi = 0n;
    for (let n = 1; n <= PERIOD; n++) {
      const a = fmul(zr, zr) - fmul(zi, zi) + cr, b = 2n * fmul(zr, zi) + ci;
      zr = a; zi = b;
      Zr[n] = toNum(zr); Zi[n] = toNum(zi);
    }
    // minibrot size estimate: λ = Π 2Z_j, β = Σ 1/Π…, size = 1/(β λ²) — complex: its argument is the rotation
    let lr = 1, li = 0, br = 1, bi = 0;
    for (let j = 1; j < PERIOD; j++) {
      [lr, li] = [2 * (Zr[j] * lr - Zi[j] * li), 2 * (Zr[j] * li + Zi[j] * lr)];
      const m2 = lr * lr + li * li;
      br += lr / m2; bi -= li / m2;
    }
    const l2r = lr * lr - li * li, l2i = 2 * lr * li;
    const qr = br * l2r - bi * l2i, qi = br * l2i + bi * l2r, q2 = qr * qr + qi * qi;
    const sr = qr / q2, si = -qi / q2;                            // s = 1 / (β λ²)
    const theta = Math.atan2(si, sr) + Math.PI / 2;               // turn the copy upright (spike up)
    const offs = [-0.75 * sr, -0.75 * si];                        // frame its body, not its nucleus

    // ---- 2. BLA table: level 0 = single steps A = 2Z_m, B = 1; level l+1 merges pairs of level l
    const levelsAB = [];
    {
      const L0 = [];
      for (let m = 1; m < PERIOD; m++) L0.push([2 * Zr[m], 2 * Zi[m], 1, 0, Math.hypot(Zr[m], Zi[m])]);
      levelsAB.push(L0);
      while (levelsAB[levelsAB.length - 1].length > 1) {
        const prev = levelsAB[levelsAB.length - 1], next = [];
        for (let j = 0; j + 1 < prev.length; j += 2) {
          const [xAr, xAi, xBr, xBi] = prev[j], [yAr, yAi, yBr, yBi] = prev[j + 1];
          next.push([yAr * xAr - yAi * xAi, yAr * xAi + yAi * xAr, yAr * xBr - yAi * xBi + yBr, yAr * xBi + yAi * xBr + yBi, 0]);
        }
        levelsAB.push(next);
      }
    }
    const LEVELS = levelsAB.length, TW = 1024;
    const radii = new Float32Array(TW * LEVELS);
    const absA = levelsAB.map((L) => L.map((e) => Math.hypot(e[0], e[1])));
    const absB = levelsAB.map((L) => L.map((e) => Math.hypot(e[2], e[3])));
    // validity radii for a view whose |δc| ≤ cmax: R = min(Rx, (Ry − |Bx| cmax) / |Ax|)
    const Rtmp = levelsAB.map((L) => new Float64Array(L.length));
    function updateRadii(cmax) {
      for (let j = 0; j < levelsAB[0].length; j++) Rtmp[0][j] = EPS * levelsAB[0][j][4];
      for (let l = 1; l < LEVELS; l++) {
        const P = Rtmp[l - 1], C = Rtmp[l];
        for (let j = 0; j < C.length; j++) {
          C[j] = Math.min(P[2 * j], Math.max(0, (P[2 * j + 1] - absB[l - 1][2 * j] * cmax) / Math.max(absA[l - 1][2 * j], 1e-300)));
        }
      }
      for (let l = 0; l < LEVELS; l++) radii.set(Rtmp[l], l * TW);
    }

    // ---- 3. GL
    const { ctx: gl, el } = canvas({ type: 'webgl2', scale: SCALE, attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    const RW = el.width, RH = el.height;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, 'p');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const U = {};
    for (const n of ['res', 'r', 'phase', 'fade', 'frameNo', 'rotv', 'offs', 'C0', 'P', 'levels', 'maxSteps', 'refTex', 'blaAB', 'blaR', 'palTex']) U[n] = gl.getUniformLocation(prog, n);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const tex = (unit, w, h, ifmt, fmt, type, data, filter = gl.NEAREST, wrap = gl.CLAMP_TO_EDGE) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, data);
      return t;
    };
    const refData = new Float32Array(TW * 2);
    for (let m = 0; m <= PERIOD; m++) { refData[m * 2] = Zr[m]; refData[m * 2 + 1] = Zi[m]; }
    tex(0, TW, 1, gl.RG32F, gl.RG, gl.FLOAT, refData);
    const abData = new Float32Array(TW * LEVELS * 4);
    levelsAB.forEach((L, l) => L.forEach((e, j) => abData.set([e[0], e[1], e[2], e[3]], (l * TW + j) * 4)));
    tex(1, TW, LEVELS, gl.RGBA32F, gl.RGBA, gl.FLOAT, abData);
    const rTex = tex(2, TW, LEVELS, gl.R32F, gl.RED, gl.FLOAT, radii);
    tex(3, 512, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, paletteData(512), gl.LINEAR, gl.REPEAT);
    gl.uniform1i(U.refTex, 0); gl.uniform1i(U.blaAB, 1); gl.uniform1i(U.blaR, 2); gl.uniform1i(U.palTex, 3);
    gl.uniform2f(U.res, RW, RH);
    gl.uniform1i(U.P, PERIOD);
    gl.uniform1i(U.levels, LEVELS);
    gl.uniform1i(U.maxSteps, MAX_STEPS);
    gl.uniform2f(U.offs, offs[0], offs[1]);
    gl.uniform2f(U.C0, Zr[1], Zi[1]);
    gl.viewport(0, 0, RW, RH);
    const aspect = RW / RH;

    this.draw = (t) => {
      const r = Math.exp(logR(t)), th = theta - Math.atan2(si, sr) * spinK(t);
      updateRadii(Math.hypot(...offs) + r * Math.hypot(1, aspect));
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, rTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TW, LEVELS, gl.RED, gl.FLOAT, radii);
      gl.uniform1f(U.r, r);
      gl.uniform2f(U.rotv, Math.cos(th), Math.sin(th));
      gl.uniform1f(U.phase, 0.035 * t);
      gl.uniform1f(U.fade, fade(t));
      gl.uniform1f(U.frameNo, Math.round(t * 30));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
