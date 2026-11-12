/*
 * 155 · 창으로 지나가는 하루 — a quiet workshop room; one winter day of sunlight passes through a tall mullioned window
 * as a timelapse. Light shafts sweep the room, and dust glows only inside them.
 *
 *   sun       solar position from latitude, declination and the clock (a smooth timelapse curve of t); colour from the
 *             Planck spectrum at a colour temperature that falls with elevation; illuminance from Kasten–Young air mass.
 *             One DirectionalLight with a 2048² PCF shadow map (the walls, frame, chair and plant all cast).
 *   room      MeshStandardMaterial everywhere; bounce = a cool-sky/warm-floor HemisphereLight + a warm point light
 *             that sits on the sunlit patch (wherever the window's centre ray lands).
 *   shafts    a half-resolution ray march: each view ray is clipped to the window's light prism and the scene depth,
 *             then sampled with the SAME shadow map (sampler2DShadow), Henyey–Greenstein phase, Beer–Lambert extinction
 *             (energy-conserving step), a drifting 3D dust density, and an interleaved-gradient-noise start jitter.
 *             Two depth-aware blur passes, then a joint-bilateral upsample in the composite.
 *   dust      3,600 points; each one tests the same shadow map in its vertex shader, so a mote shines only in a beam.
 *   post      scene·T + in-scatter, a small bloom from the bright window, AgX tone mapping, grade, vignette, grain.
 * frame(t) is a closed form of t: the clock, sun, camera, dust drift and noise offset are all functions of t.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, smooth, ramp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { buildRoom, ROOM, WIN } from './room.js';

const D = 9;
const W = 1080, H = 1920, HW = W / 2, HH = H / 2, QW = W / 4, QH = H / 4;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------- the day (tuning knobs)
const LAT = 37.5 * DEG, DECL = -18 * DEG;   // a mid-latitude winter day: the sun stays low, so beams stay long
const CLOCK_KEYS = [[0, 7.7], [2, 9.45], [5, 12.2], [7, 13.95], [9, 16.5]];   // t (s) → solar time (h)
const TAU = 0.2;                             // optical depth for the air-mass dimming of the sun
const E_NOON = 15;                           // sun illuminance (three.js units) at noon
const VOL = { sigma: 0.13, albedo: 0.9, g: 0.6, iso: 0.32 };   // scattering coeff (1/m), single-scatter albedo, HG g, isotropic mix
const N_MOTES = 3600;

/** cubic Hermite through [t, v] keys with Catmull-Rom slopes; at the ends one-sided (the clock never stops) or zero
 *  (`settle`, for camera moves that ease in and out) */
function spline(keys, settle = false) {
  const n = keys.length;
  const slope = (i) => {
    if (settle && (i === 0 || i === n - 1)) return 0;
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  };
  const m = keys.map((_, i) => slope(i));
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1] + m[0] * (t - keys[0][0]);
    if (t >= keys[n - 1][0]) return keys[n - 1][1] + m[n - 1] * (t - keys[n - 1][0]);
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1], h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * h * m[i + 1];
  };
}
const CLOCK = spline(CLOCK_KEYS);

/** solar elevation and azimuth (from south, + toward west) at solar time `hour` */
function sunAt(hour) {
  const h = (hour - 12) * 15 * DEG;
  const el = Math.asin(Math.sin(LAT) * Math.sin(DECL) + Math.cos(LAT) * Math.cos(DECL) * Math.cos(h));
  const az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(LAT) - Math.tan(DECL) * Math.cos(LAT));
  return { el, az };
}
const H0 = Math.acos(-Math.tan(LAT) * Math.tan(DECL)) / (15 * DEG);   // half day length (h): sunrise 12 − H0, sunset 12 + H0
/** relative air mass (Kasten & Young 1989) */
const airMass = (el) => { const e = Math.max(el / DEG, 0); return 1 / (Math.sin(e * DEG) + 0.50572 * Math.pow(e + 6.07995, -1.6364)); };
/** colour temperature of direct sunlight: about 4,600 K high in a winter sky, falling toward 1,500 K at the horizon */
const cctOf = (el) => 1500 + 3300 * (1 - Math.exp(-(el / DEG) / 12));

/** CIE 1931 2° colour matching functions, multi-lobe Gaussian fit (Wyman, Sloan & Shirley 2013); l in nm */
function cmf(l) {
  const g = (x, mu, s1, s2) => { const u = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * u * u); };
  return [
    1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
    1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
  ];
}
/** black body at T kelvin → linear sRGB with luminance Y = 1 (Planck's law integrated against the CMFs) */
function planckRGB(T) {
  let X = 0, Y = 0, Z = 0;
  for (let l = 380; l <= 780; l += 5) {
    const m = l * 1e-9;
    const B = 1 / (m ** 5 * (Math.exp(1.4388e-2 / (m * T)) - 1));
    const [x, y, z] = cmf(l);
    X += B * x; Y += B * y; Z += B * z;
  }
  return [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z].map((v) => Math.max(v / Y, 0));
}

// ---------------------------------------------------------------- GLSL
const QUAD_VS = `varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const COMMON = `
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }   // interleaved gradient noise
float hgPhase(float c, float g) { float k = 1.0 + g * g - 2.0 * g * c; return (1.0 - g * g) / (12.566371 * k * sqrt(k)); }
`;

// the sky outside the window: a gradient by view elevation, the sun's aureole, a far hazy hill line
const SKY_VS = `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const SKY_FS = `
uniform vec3 uZen, uHor, uHill, uSunCol, uL;
uniform float uAur;
varying vec3 vW;
void main() {
  vec3 dir = normalize(vW - cameraPosition);
  float e = dir.y;
  vec3 sky = mix(uHor, uZen, smoothstep(0.0, 0.55, e + 0.05));
  float mu = max(dot(dir, uL), 0.0), mu2 = mu * mu, mu4 = mu2 * mu2, mu8 = mu4 * mu4, mu16 = mu8 * mu8;
  sky += uSunCol * uAur * (0.35 * mu8 + 1.4 * mu16 * mu16 * mu16);
  float hill = 0.02 + 0.03 * sin(vW.x * 0.55 + 1.3) + 0.012 * sin(vW.x * 1.9 + 0.4) + 0.006 * sin(vW.x * 4.7);
  float m = smoothstep(hill + 0.006, hill - 0.006, e);
  sky = mix(sky, uHill, m);
  gl_FragColor = vec4(sky, 1.0);
}`;

// dust: a point per mote; its brightness is the sun's shadow test at its own position, times the phase toward the lens
const MOTE_VS = COMMON + `
attribute vec4 aSeed;
uniform float uTime, uG, uGain;
uniform vec3 uBoxMin, uBoxSize, uD, uSunE;
uniform sampler2DShadow uShadow;
uniform mat4 uShadowMat;
varying vec3 vC;
void main() {
  vec3 p = uBoxMin + aSeed.xyz * uBoxSize;
  float ph = aSeed.w * 6.2831853, sp = 0.6 + 0.8 * fract(aSeed.w * 7.31);
  p += vec3(0.07 * sin(uTime * 0.31 * sp + ph * 3.0) + 0.025 * sin(uTime * 0.83 + ph * 7.0),
            0.05 * sin(uTime * 0.23 * sp + ph * 5.0) + 0.018 * uTime * (fract(aSeed.w * 3.7) - 0.35),
            0.07 * cos(uTime * 0.27 * sp + ph * 2.0) + 0.025 * cos(uTime * 0.71 + ph * 11.0));
  vec3 sc = (uShadowMat * vec4(p, 1.0)).xyz;
  float vis = 0.0;
  if (sc.x > 0.0 && sc.y > 0.0 && sc.x < 1.0 && sc.y < 1.0 && sc.z < 1.0 && p.z > 0.0) vis = texture(uShadow, vec3(sc.xy, sc.z - 0.0004));
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float z = -mv.z;
  // defocus: the circle of confusion grows with |1/z − 1/z_focus|; energy spread over the disc
  float coc = 2.2 + 30.0 * abs(1.0 / z - 1.0 / 3.6);
  float size = coc * (0.75 + 0.5 * fract(aSeed.w * 31.7));
  float tw = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (1.1 + 2.2 * fract(aSeed.w * 13.1)) + ph * 9.0), 4.0);
  float phase = hgPhase(dot(normalize(cameraPosition - p), uD), uG);
  vC = uSunE * (vis * phase * tw * uGain * 6.0 / (size * size));
  gl_PointSize = vis > 0.002 ? size : 0.0;
  gl_Position = vis > 0.002 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
}`;
const MOTE_FS = `
varying vec3 vC;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r2 = dot(q, q) * 4.0;
  if (r2 > 1.0) discard;
  float a = exp(-r2 * 2.5) * (1.0 - r2 * r2);
  gl_FragColor = vec4(vC * a, 1.0);
}`;

// the in-scattering march (half resolution)
const MARCH_FS = COMMON + `
uniform sampler2D tDepth;
uniform sampler2DShadow uShadow;
uniform sampler3D tNoise;
uniform mat4 uInvProj, uCamWorld, uShadowMat;
uniform vec3 uCamPos, uD, uSunE, uAmbE, uNoiseOff;
uniform vec4 uWin;           // the opening on z = 0: x0, x1, y0, y1
uniform vec2 uFull;
uniform float uSigma, uAlbedo, uG, uIso;
void main() {
  ivec2 hp = ivec2(gl_FragCoord.xy), fp = hp * 2;          // this half-res texel stands for full-res texel 2·hp
  float d = texelFetch(tDepth, fp, 0).r;
  vec4 v = uInvProj * vec4((vec2(fp) + 0.5) / uFull * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
  v.xyz /= v.w;
  float tMax = length(v.xyz);                              // distance to the first surface
  vec3 rd = normalize(mat3(uCamWorld) * v.xyz), ro = uCamPos;
  if (rd.z < 0.0) tMax = min(tMax, -ro.z / rd.z);          // the room ends at the window plane
  // the light prism: p lies in it when p, slid back along d onto z = 0, lands in the opening. Both coordinates of that
  // landing point are linear in t, so the prism is two slabs → an interval [a0, a1] on the ray.
  float kx = uD.x / uD.z, ky = uD.y / uD.z;
  float qx = ro.x - kx * ro.z, qxd = rd.x - kx * rd.z, qy = ro.y - ky * ro.z, qyd = rd.y - ky * rd.z;
  float a0 = 0.0, a1 = tMax;
  if (abs(qxd) < 1e-6) { if (qx < uWin.x || qx > uWin.y) a1 = -1.0; }
  else { float s0 = (uWin.x - qx) / qxd, s1 = (uWin.y - qx) / qxd; a0 = max(a0, min(s0, s1)); a1 = min(a1, max(s0, s1)); }
  if (abs(qyd) < 1e-6) { if (qy < uWin.z || qy > uWin.w) a1 = -1.0; }
  else { float s0 = (uWin.z - qy) / qyd, s1 = (uWin.w - qy) / qyd; a0 = max(a0, min(s0, s1)); a1 = min(a1, max(s0, s1)); }
  float sT0 = uSigma / uAlbedo;                            // mean extinction
  float T = 1.0;
  vec3 L = vec3(0.0);
  if (a1 > a0) {
    float len = a1 - a0;
    int n = int(clamp(ceil(len / 0.055), 6.0, 36.0));
    float ds = len / float(n), j = ign(gl_FragCoord.xy);  // one jittered sample per step, the jitter fixed per pixel
    T = exp(-sT0 * a0);
    vec3 sc0 = (uShadowMat * vec4(ro, 1.0)).xyz, scd = (uShadowMat * vec4(rd, 0.0)).xyz;   // orthographic: linear in t
    float acc = 0.0;
    for (int i = 0; i < 36; i++) {
      if (i >= n) break;
      float t = a0 + (float(i) + j) * ds;
      vec3 p = ro + rd * t, sc = sc0 + scd * t;
      float vis = texture(uShadow, vec3(sc.xy, sc.z - 0.0003));
      vis *= exp(-sT0 * p.z / uD.z);                      // the sun's own path from the window plane to p
      float dn = 0.35 + 1.3 * texture(tNoise, p * vec3(0.42, 0.3, 0.42) + uNoiseOff).r;
      float sS = uSigma * dn, sT = sS / uAlbedo, tr = exp(-sT * ds);
      acc += T * vis * sS * (1.0 - tr) / sT;              // ∫ T(s) σs ds over the step, exact for a constant step
      T *= tr;
    }
    float c = dot(rd, -uD);                               // cos of the scattering angle (toward the lens vs. the light's travel)
    L = uSunE * acc * mix(hgPhase(c, uG), 0.0795775, uIso);
  }
  L += uAmbE * (uAlbedo * (1.0 - exp(-sT0 * tMax)) * 0.0795775);   // faint skylight haze everywhere (isotropic)
  gl_FragColor = vec4(L, -v.z);                         // alpha: view depth, for the depth-aware blur and upsample
}`;

// separable depth-aware blur at half resolution (kills the jitter pattern without bleeding across silhouettes)
const BLUR_FS = `
uniform sampler2D tVol;
uniform vec2 uDir;
void main() {
  ivec2 hp = ivec2(gl_FragCoord.xy), hs = textureSize(tVol, 0);
  vec4 c0 = texelFetch(tVol, hp, 0);
  float z0 = c0.a, k = 1.0 / (0.03 + 0.04 * z0);
  vec3 acc = c0.rgb; float ws = 1.0;
  for (int i = 1; i <= 4; i++) for (int sg = -1; sg <= 1; sg += 2) {
    vec4 c = texelFetch(tVol, clamp(hp + ivec2(uDir) * (i * sg), ivec2(0), hs - 1), 0);
    float w = exp(-float(i * i) / 8.0 - abs(c.a - z0) * k);
    acc += c.rgb * w; ws += w;
  }
  gl_FragColor = vec4(acc / ws, z0);
}`;

// bloom: soft-threshold prefilter to quarter resolution, then a separable Gaussian
const BRIGHT_FS = `
uniform sampler2D tScene; uniform vec2 uTexel; uniform float uThr;
varying vec2 vUv;
void main() {
  vec3 c = 0.25 * (texture2D(tScene, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tScene, vUv + uTexel * vec2(1.0, -1.0)).rgb
                 + texture2D(tScene, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tScene, vUv + uTexel * vec2(1.0, 1.0)).rgb);
  float l = max(max(c.r, c.g), c.b);
  float k = max(l - uThr, 0.0); k = k * k / (k + 0.5 * uThr + 1e-4);
  gl_FragColor = vec4(c * (k / max(l, 1e-4)), 1.0);
}`;
const GAUSS_FS = `
uniform sampler2D tSrc; uniform vec2 uStep;
varying vec2 vUv;
void main() {
  vec3 a = texture2D(tSrc, vUv).rgb * 0.1585;
  float w[6]; w[0] = 0.1505; w[1] = 0.1293; w[2] = 0.1003; w[3] = 0.0703; w[4] = 0.0446; w[5] = 0.0255;
  for (int i = 0; i < 6; i++) {
    vec2 o = uStep * (float(i) + 1.0) * 1.5;
    a += (texture2D(tSrc, vUv + o).rgb + texture2D(tSrc, vUv - o).rgb) * w[i];
  }
  gl_FragColor = vec4(a, 1.0);
}`;

// composite: joint-bilateral upsample of the haze, scene·T + L, bloom, grade, AgX (three's tonemapping chunk), sRGB, grain
const COMP_FS = COMMON + `
uniform sampler2D tScene, tDepth, tVol, tBloom;
uniform mat4 uInvProj, uCamWorld;
uniform vec3 uCamPos;
uniform vec2 uFull;
uniform float uExpo, uBloom, uTime, uFade, uSigmaT;
uniform vec3 uTint;
varying vec2 vUv;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  ivec2 fp = ivec2(gl_FragCoord.xy), hs = textureSize(tVol, 0);
  vec3 sc = texelFetch(tScene, fp, 0).rgb;
  vec4 v = uInvProj * vec4((vec2(fp) + 0.5) / uFull * 2.0 - 1.0, texelFetch(tDepth, fp, 0).r * 2.0 - 1.0, 1.0);
  v.xyz /= v.w;
  float z0 = -v.z, dist = length(v.xyz);
  vec3 rd = mat3(uCamWorld) * (v.xyz / dist);
  if (rd.z < 0.0) dist = min(dist, -uCamPos.z / rd.z);     // the haze fills the room only (the sky is seen through the opening)
  float T = exp(-uSigmaT * dist);                           // Beer–Lambert transmittance of the room air, mean coefficient
  vec2 h = vec2(fp) * 0.5;                                  // half-res texel q sits on full-res texel 2q
  ivec2 b = ivec2(floor(h)); vec2 f = h - floor(h);
  vec3 acc = vec3(0.0); float ws = 0.0;
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec4 c = texelFetch(tVol, clamp(b + ivec2(i, j), ivec2(0), hs - 1), 0);
    float w = (i == 0 ? 1.0 - f.x : f.x) * (j == 0 ? 1.0 - f.y : f.y);
    w *= exp(-abs(c.a - z0) / (0.02 + 0.03 * z0)) + 1e-4;
    acc += c.rgb * w; ws += w;
  }
  vec3 col = sc * T + acc / ws;
  col += texture2D(tBloom, vUv).rgb * uBloom;
  col *= uExpo;
  // grade: the shadows take the sky's tint of the hour (blue at dawn, mauve at dusk); the sunlight stays the only warm
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, col * uTint, (1.0 - smoothstep(0.0, 0.3, lum)) * 0.75);
  vec2 q = vUv - 0.5;
  col *= 1.0 - 0.35 * smoothstep(0.25, 0.85, length(q * vec2(1.0, 0.62)) * 1.35);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb += (hash12(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * (2.2 / 255.0);
  gl_FragColor.rgb *= uFade;
}`;

// ---------------------------------------------------------------- setup helpers
/** tileable value-noise fBm in a 32³ byte texture (seeded): the drifting dust density */
function noiseTexture(R) {
  const N = 32, data = new Uint8Array(N * N * N);
  const lattice = (P) => { const a = new Float32Array(P * P * P); for (let i = 0; i < a.length; i++) a[i] = R(); return a; };
  const octs = [[4, 0.5], [8, 0.3], [16, 0.2]].map(([P, w]) => ({ P, w, L: lattice(P) }));
  const sm = (x) => x * x * (3 - 2 * x);
  const vals = new Float32Array(N * N * N);
  let lo = Infinity, hi = -Infinity;
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let v = 0;
    for (const { P, w, L } of octs) {
      const fx = (x / N) * P, fy = (y / N) * P, fz = (z / N) * P;
      const ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
      const ux = sm(fx - ix), uy = sm(fy - iy), uz = sm(fz - iz);
      const at = (a, b, c) => L[((c % P) * P + (b % P)) * P + (a % P)];
      const x0 = lerp(lerp(at(ix, iy, iz), at(ix + 1, iy, iz), ux), lerp(at(ix, iy + 1, iz), at(ix + 1, iy + 1, iz), ux), uy);
      const x1 = lerp(lerp(at(ix, iy, iz + 1), at(ix + 1, iy, iz + 1), ux), lerp(at(ix, iy + 1, iz + 1), at(ix + 1, iy + 1, iz + 1), ux), uy);
      v += w * lerp(x0, x1, uz);
    }
    vals[(z * N + y) * N + x] = v;
    lo = Math.min(lo, v); hi = Math.max(hi, v);
  }
  for (let i = 0; i < vals.length; i++) data[i] = Math.round(((vals[i] - lo) / (hi - lo)) * 255);
  const tx = new THREE.Data3DTexture(data, N, N, N);
  tx.format = THREE.RedFormat; tx.type = THREE.UnsignedByteType;
  tx.minFilter = tx.magFilter = THREE.LinearFilter;
  tx.wrapS = tx.wrapT = tx.wrapR = THREE.RepeatWrapping;
  tx.unpackAlignment = 1;
  tx.needsUpdate = true;
  return tx;
}

const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const fmtClock = (hour) => {
  const m = Math.floor(hour * 60 + 1e-6), hh = Math.floor(m / 60), mm = m % 60;
  return `${hh < 12 ? '오전' : '오후'} ${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
};

// camera: a slow arc — the lens drifts right and in while its aim pans left, following the light across the room:
// the morning patch on the right wall → the window → the evening patch on the left wall
const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));
const CAM0 = [-0.3, 1.45, 5.7], CAM1 = [0.38, 1.34, 5.05], AIM0 = [0.95, 1.22, 0.8], AIM1 = [-1.0, 1.04, 0.9];
const AIM_X = spline([[0, 0.95], [2.6, 0.5], [5.4, -0.5], [9, -1.0]], true);

defineDemo({
  id: '155-volumetric-light',
  title: '창으로 지나가는 하루',
  tech: '볼류메트릭 빛 · 그림자 맵 광선 진행 + 먼지 입자 + 해 각도 타임랩스',
  duration: D,
  background: '#0b0c10',

  async setup(api) {
    const HL = api.headless;
    await fontReady('600 40px "Pretendard Variable"', '오전오후 0123456789:');

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.AgXToneMapping;           // applied only in the composite (it renders to the canvas)
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ---- scene
    const scene = new THREE.Scene();
    const R = rand(155);
    const room = buildRoom(R, HL);
    scene.add(room.group);

    const camera = new THREE.PerspectiveCamera(56, W / H, 0.05, 40);

    // sun: one directional light; the shadow camera is a fixed box around the room (it must hold every caster:
    // walls, ceiling, frame, props — the room is closed, so light reaches inside only through the opening)
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const C = new THREE.Vector3(0, ROOM.h / 2, 2.4);
    const sc = sun.shadow.camera;
    sc.left = -5.6; sc.right = 5.6; sc.top = 5.6; sc.bottom = -5.6; sc.near = 14 - 5.7; sc.far = 14 + 5.7;   // the light sits 14 m out; the room fits in ±5.6 m
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 3;
    sun.target.position.copy(C);
    scene.add(sun, sun.target);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(hemi);
    const bounce = new THREE.PointLight(0xffffff, 0, 0, 2);
    scene.add(bounce);

    // sky outside the window
    const SU = { uZen: { value: new THREE.Vector3() }, uHor: { value: new THREE.Vector3() }, uHill: { value: new THREE.Vector3() },
      uSunCol: { value: new THREE.Vector3() }, uL: { value: new THREE.Vector3() }, uAur: { value: 0 } };
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.ShaderMaterial({ uniforms: SU, vertexShader: SKY_VS, fragmentShader: SKY_FS }));
    sky.position.set(-0.25, 2.5, -6);
    scene.add(sky);

    // ---- render targets
    const mainRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4, depthTexture: new THREE.DepthTexture(W, H) });
    const half = () => new THREE.WebGLRenderTarget(HW, HH, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const volA = half(), volB = half();
    const quarter = () => new THREE.WebGLRenderTarget(QW, QH, { type: THREE.HalfFloatType, depthBuffer: false });
    const bloomA = quarter(), bloomB = quarter();

    // first render: creates the sun's shadow map, compiles the scene's programs
    camera.position.set(0, 1.4, 6); camera.lookAt(0, 1.2, 0); camera.updateMatrixWorld();
    sun.position.set(C.x, C.y + 8, C.z - 8);
    renderer.setRenderTarget(mainRT);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    const shadowTex = sun.shadow.map.depthTexture;

    // ---- dust motes
    const seeds = new Float32Array(N_MOTES * 4), RS = rand(1550);
    for (let i = 0; i < seeds.length; i++) seeds[i] = RS();
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N_MOTES * 3), 3));
    moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const MU = {
      uTime: { value: 0 }, uG: { value: VOL.g }, uGain: { value: 3 },
      uBoxMin: { value: new THREE.Vector3(ROOM.x0 + 0.05, 0.05, 0.05) }, uBoxSize: { value: new THREE.Vector3(ROOM.x1 - ROOM.x0 - 0.1, ROOM.h - 0.2, 4.6) },
      uD: { value: new THREE.Vector3() }, uSunE: { value: new THREE.Vector3() },
      uShadow: { value: shadowTex }, uShadowMat: { value: sun.shadow.matrix },
    };
    const motes = new THREE.Points(moteGeo, new THREE.ShaderMaterial({
      uniforms: MU, vertexShader: MOTE_VS, fragmentShader: MOTE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    motes.frustumCulled = false;
    motes.renderOrder = 10;
    scene.add(motes);

    // ---- full-screen passes
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const pass = (fs, uniforms) => {
      const s = new THREE.Scene();
      const m = new THREE.Mesh(tri, new THREE.ShaderMaterial({ uniforms, vertexShader: QUAD_VS, fragmentShader: fs, depthTest: false, depthWrite: false }));
      m.frustumCulled = false;
      s.add(m);
      return { s, u: uniforms, m: m.material };
    };
    const march = pass(MARCH_FS, {
      tDepth: { value: mainRT.depthTexture }, uShadow: { value: shadowTex }, tNoise: { value: noiseTexture(rand(4155)) },
      uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() }, uShadowMat: { value: sun.shadow.matrix },
      uCamPos: { value: new THREE.Vector3() }, uD: { value: new THREE.Vector3() }, uSunE: { value: new THREE.Vector3() },
      uAmbE: { value: new THREE.Vector3() }, uNoiseOff: { value: new THREE.Vector3() },
      uWin: { value: new THREE.Vector4(WIN.x0, WIN.x1, WIN.y0, WIN.y1) }, uFull: { value: new THREE.Vector2(W, H) },
      uSigma: { value: VOL.sigma }, uAlbedo: { value: VOL.albedo }, uG: { value: VOL.g }, uIso: { value: VOL.iso },
    });
    const blurH = pass(BLUR_FS, { tVol: { value: volA.texture }, uDir: { value: new THREE.Vector2(1, 0) } });
    const blurV = pass(BLUR_FS, { tVol: { value: volB.texture }, uDir: { value: new THREE.Vector2(0, 1) } });
    const bright = pass(BRIGHT_FS, { tScene: { value: mainRT.texture }, uTexel: { value: new THREE.Vector2(1 / W, 1 / H) }, uThr: { value: 2.2 } });
    const gaussH = pass(GAUSS_FS, { tSrc: { value: bloomA.texture }, uStep: { value: new THREE.Vector2(1 / QW, 0) } });
    const gaussV = pass(GAUSS_FS, { tSrc: { value: bloomB.texture }, uStep: { value: new THREE.Vector2(0, 1 / QH) } });
    const comp = pass(COMP_FS, {
      tScene: { value: mainRT.texture }, tDepth: { value: mainRT.depthTexture }, tVol: { value: volA.texture }, tBloom: { value: bloomA.texture },
      uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() }, uCamPos: { value: new THREE.Vector3() }, uFull: { value: new THREE.Vector2(W, H) },
      uExpo: { value: 1 }, uBloom: { value: 0.14 }, uTime: { value: 0 }, uFade: { value: 1 }, uSigmaT: { value: VOL.sigma / VOL.albedo }, uTint: { value: new THREE.Vector3(1, 1, 1) },
    });

    // ---- HUD: the clock and a small sun arc (2D canvas, redrawn from t)
    const hud = api.canvas({ type: '2d', z: 5, attrs: HL ? { willReadFrequently: true } : undefined });

    // colour temperature table (setup): 1,500–7,000 K every 50 K
    const CCT = [];
    for (let T = 1500; T <= 7000; T += 50) CCT.push(planckRGB(T));
    const sunRGB = (T) => {
      const x = clamp((T - 1500) / 50, 0, CCT.length - 1.001), i = Math.floor(x);
      return mix3(CCT[i], CCT[i + 1], x - i);
    };
    const E0 = E_NOON / Math.exp(-TAU * airMass(sunAt(12).el));

    Object.assign(this, { renderer, scene, camera, sun, hemi, bounce, SU, MU, mainRT, volA, volB, bloomA, bloomB, march, blurH, blurV, bright, gaussH, gaussV, comp, quadCam, hud, sunRGB, E0 });
    // one full frame here compiles every program; the 1-pixel read waits until the GPU has really done it (compilation
    // is lazy and asynchronous), so the cost stays in setup instead of landing on the first frame
    this.frame(4.5);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  frame(t) {
    const S = this;
    const r = S.renderer;

    // ---- the sun at this moment
    const hour = CLOCK(t);
    const { el, az } = sunAt(hour);
    const L = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az));   // toward the sun
    const d = L.clone().negate();                                                                           // the light's travel
    const cct = cctOf(el);
    const rgb = S.sunRGB(cct);
    const wake = smooth(t / 0.9);                                    // the picture opens from black
    const E = S.E0 * Math.exp(-TAU * airMass(el)) * smooth((el / DEG) / 2.5);
    const day = smooth((el / DEG) / 30);                             // 0 at the horizon … 1 near noon (sky and room fill)
    S.sun.color.setRGB(rgb[0], rgb[1], rgb[2]);
    S.sun.intensity = E;
    S.sun.position.copy(S.sun.target.position).addScaledVector(L, 14);

    // sky through the window
    const skyLvl = 1.6 + 3.2 * day;
    const zen = mix3([0.22, 0.29, 0.45], [0.46, 0.62, 0.86], day).map((v) => v * skyLvl);
    const warmH = smooth((el / DEG - 3) / 16);
    const hor = mix3([1.0, 0.66, 0.42], [0.9, 0.92, 0.94], warmH).map((v) => v * skyLvl * 1.1);
    S.SU.uZen.value.set(...zen);
    S.SU.uHor.value.set(...hor);
    S.SU.uHill.value.set(...mix3(zen, [0.3, 0.34, 0.42], 0.6).map((v) => v * 0.5));
    S.SU.uSunCol.value.set(...rgb);
    S.SU.uL.value.copy(L);
    S.SU.uAur.value = 0.5 * E;

    // fill: cool sky through the window, warm bounce from the floor, the sunlit patch as a soft point source
    const skyFill = mix3([0.42, 0.56, 0.95], [0.78, 0.8, 0.84], day);
    S.hemi.color.setRGB(...skyFill);
    S.hemi.groundColor.setRGB(rgb[0] * 0.55, rgb[1] * 0.45, rgb[2] * 0.36);
    const early = 1 - smooth((hour - 7.7) / 2.6);                  // the blue hour before the sun has any strength
    S.hemi.intensity = 0.09 + 0.11 * day + 0.12 * early;
    {
      // where the window's centre ray lands: floor, a side wall or the far wall
      const o = new THREE.Vector3((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, 0);
      let best = Infinity, n = new THREE.Vector3();
      const tryHit = (s, nx, ny, nz) => { if (s > 0 && s < best) { best = s; n.set(nx, ny, nz); } };
      tryHit(-o.y / d.y, 0, 1, 0);
      if (d.x > 1e-4) tryHit((ROOM.x1 - o.x) / d.x, -1, 0, 0);
      if (d.x < -1e-4) tryHit((ROOM.x0 - o.x) / d.x, 1, 0, 0);
      tryHit((ROOM.z1 - o.z) / d.z, 0, 0, -1);
      const p = o.addScaledVector(d, best).addScaledVector(n, 0.45);
      S.bounce.position.copy(p);
      S.bounce.color.setRGB(rgb[0], rgb[1] * 0.86, rgb[2] * 0.72);
      S.bounce.intensity = 0.12 * E * Math.max(0, -n.dot(d));
    }

    // ---- camera: the slow arc (CAM0 → CAM1 eased, aim panning with AIM_X)
    const cp = ease(t / D);
    const cam = S.camera;
    cam.position.set(...mix3(CAM0, CAM1, cp));
    const aim = mix3(AIM0, AIM1, cp);
    cam.lookAt(AIM_X(t), aim[1], aim[2]);
    cam.updateMatrixWorld();

    // ---- dust
    S.MU.uTime.value = t;
    S.MU.uD.value.copy(d);
    S.MU.uSunE.value.set(rgb[0] * E, rgb[1] * E, rgb[2] * E);

    // ---- 1 · shadow map + scene (HDR, MSAA, depth texture)
    r.setRenderTarget(S.mainRT);
    r.render(S.scene, cam);

    // ---- 2 · in-scattering march at half resolution, then depth-aware blur
    const M = S.march.u;
    M.uInvProj.value.copy(cam.projectionMatrixInverse);
    M.uCamWorld.value.copy(cam.matrixWorld);
    M.uCamPos.value.copy(cam.position);
    M.uD.value.copy(d);
    M.uSunE.value.set(rgb[0] * E, rgb[1] * E, rgb[2] * E);
    const amb = 0.12 + 0.3 * day;
    M.uAmbE.value.set(skyFill[0] * amb, skyFill[1] * amb, skyFill[2] * amb);
    M.uNoiseOff.value.set(0.021 * t, -0.034 * t, 0.013 * t);
    r.setRenderTarget(S.volA); r.render(S.march.s, S.quadCam);
    r.setRenderTarget(S.volB); r.render(S.blurH.s, S.quadCam);
    r.setRenderTarget(S.volA); r.render(S.blurV.s, S.quadCam);

    // ---- 3 · bloom from the bright window and patches
    r.setRenderTarget(S.bloomA); r.render(S.bright.s, S.quadCam);
    r.setRenderTarget(S.bloomB); r.render(S.gaussH.s, S.quadCam);
    r.setRenderTarget(S.bloomA); r.render(S.gaussV.s, S.quadCam);

    // ---- 4 · composite → canvas
    const C = S.comp.u;
    C.uInvProj.value.copy(cam.projectionMatrixInverse);
    C.uCamWorld.value.copy(cam.matrixWorld);
    C.uCamPos.value.copy(cam.position);
    C.uExpo.value = 1.3;
    const dawn = 1 - smooth((hour - 7.7) / 3.2), dusk = smooth((hour - 14) / 2.5);
    C.uTint.value.set(...mix3(mix3([0.94, 0.99, 1.06], [0.8, 0.94, 1.25], dawn), [0.97, 0.9, 1.04], dusk));
    C.uTime.value = t;
    C.uFade.value = wake;
    r.setRenderTarget(null);
    r.render(S.comp.s, S.quadCam);

    // ---- HUD
    const g = S.hud.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.setLineDash([]);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.clearRect(0, 0, W, H);
    const ha = ramp(t, 0.5, 1.2);
    if (ha > 0) {
      g.globalAlpha = ha;
      const ax = 64, ay = 132, ar = 44;
      const rise = 12 - H0, set = 12 + H0, k = clamp((hour - rise) / (set - rise));
      g.strokeStyle = 'rgba(240,236,228,0.32)'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(ax + ar, ay, ar, Math.PI, 2 * Math.PI); g.stroke();
      g.beginPath(); g.moveTo(ax - 6, ay); g.lineTo(ax + 2 * ar + 6, ay); g.stroke();
      const a = Math.PI + Math.PI * k, sx = ax + ar + Math.cos(a) * ar, sy = ay + Math.sin(a) * ar;
      const c = `255,${Math.round(150 + 60 * day)},${Math.round(70 + 60 * day)}`;   // the sun dot: the accent
      const glow = g.createRadialGradient(sx, sy, 0, sx, sy, 20);
      glow.addColorStop(0, `rgba(${c},0.55)`); glow.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = glow; g.fillRect(sx - 20, sy - 20, 40, 40);
      g.fillStyle = `rgb(${c})`;
      g.beginPath(); g.arc(sx, sy, 7.5, 0, 2 * Math.PI); g.fill();
      g.font = '600 40px "Pretendard Variable"';
      g.textBaseline = 'alphabetic'; g.textAlign = 'left';
      g.fillStyle = 'rgba(242,238,230,0.92)';
      g.fillText(fmtClock(hour), ax + 2 * ar + 26, ay + 2);
      g.globalAlpha = 1;
    }
  },
});
