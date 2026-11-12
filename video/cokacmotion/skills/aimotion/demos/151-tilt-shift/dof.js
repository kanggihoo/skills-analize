/*
 * Depth of field as our own pass chain (three.js render targets + ShaderMaterials on a full-screen triangle).
 *
 *   scene ─▶ sceneRT  1080×1920  HDR colour + depth texture
 *   prep  ─▶ prepRT    540×960   colour (2×2 average, haze) + signed CoC radius in alpha, then its mip chain
 *   tile  ─▶ tileRT     68×120   max near-field CoC radius per 8×8 block
 *   dilate▶ dilRT       68×120   … max over the 3×3 neighbouring blocks
 *   gather▶ gatherRT   540×960   32 golden-angle (Vogel) samples, near and far fields kept apart; alpha = near coverage
 *   final ─▶ canvas   1080×1920   FXAA on the sharp part, sharp ↔ blurred by the full-res CoC, haze, ACES, saturation,
 *                                 vignette, the type overlay, sRGB
 *
 * CoC (thin lens): c = A·f·|S − S_f| / (S·(S_f − f)) on the sensor, × (image px / sensor height). All distances are
 * those of a 1:k model of the town (S/k), which is what makes it read as a miniature (see main.js lens()).
 * The sign is kept: + behind the focal plane (far field), − in front (near field).
 */
import * as THREE from 'three';

export const N_SAMPLES = 32;
export const TILE = 8;

const VS = /* glsl */`
varying vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const COMMON = /* glsl */`
uniform float uNear, uFar, uFocus, uLens, uMaxCoc;
// perspective depth buffer value → view depth S (metres along the optical axis)
float viewDepth(float d) { return uNear * uFar / (uFar - d * (uFar - uNear)); }
// signed CoC diameter in full-res pixels: uLens = (H px / sensor h)·A·f / (S_f/k − f), and (S − S_f)/S is scale-free
float cocDiam(float S) { return clamp(uLens * (S - uFocus) / S, -uMaxCoc, uMaxCoc); }
`;

const HAZE = /* glsl */`
uniform vec3 uHazeCol, uSunCol, uSunDir;
uniform float uHazeStart, uHazeDen, uSunGlow;
uniform mat4 uCamWorld;
uniform vec2 uTanHalf;
// morning haze: extinction by distance, its colour lifted toward the sun (a forward-scattering lobe)
vec3 haze(vec3 c, float S, vec2 uv) {
  vec3 rd = normalize(mat3(uCamWorld) * normalize(vec3((uv * 2.0 - 1.0) * uTanHalf, -1.0)));
  float f = 1.0 - exp(-max(S - uHazeStart, 0.0) * uHazeDen);
  float mu = max(dot(rd, uSunDir), 0.0);
  float m2 = mu * mu, m4 = m2 * m2;
  vec3 hc = uHazeCol + uSunCol * uSunGlow * (0.35 * m4 + 0.65 * m4 * m4 * m4);
  return mix(c, hc, f);
}
`;

// ---- 1. prep: half resolution colour + signed CoC (radius, half-res px); its mip chain is built right after
const PREP = /* glsl */`
${COMMON}
${HAZE}
uniform sampler2D tColor, tDepth;
varying vec2 vUv;
void main() {
  ivec2 b = ivec2(gl_FragCoord.xy) * 2;
  // nearest of the four depths: a near silhouette wins the block, so near blur reaches its true edge
  float d = min(min(texelFetch(tDepth, b, 0).x, texelFetch(tDepth, b + ivec2(1, 0), 0).x),
                min(texelFetch(tDepth, b + ivec2(0, 1), 0).x, texelFetch(tDepth, b + ivec2(1, 1), 0).x));
  float S = viewDepth(d);
  float c = cocDiam(S) * 0.25;                      // diameter (full px) → radius (half px)
  vec3 col = min(texture(tColor, vUv).rgb, vec3(16.0));   // bilinear at the block centre = the 2×2 mean
  gl_FragColor = vec4(haze(col, S, vUv), c);
}`;

// ---- 2. tile max of the near-field radius, 3. its 3×3 dilation
const TILE_FS = /* glsl */`
uniform sampler2D tPrep;
uniform vec2 uHalf;
void main() {
  ivec2 b = ivec2(gl_FragCoord.xy) * ${TILE};
  float m = 0.0;
  for (int y = 0; y < ${TILE}; y++) for (int x = 0; x < ${TILE}; x++)
    m = max(m, -texelFetch(tPrep, min(b + ivec2(x, y), ivec2(uHalf) - 1), 0).a);
  gl_FragColor = vec4(m, 0.0, 0.0, 1.0);
}`;
const DILATE_FS = /* glsl */`
uniform sampler2D tTile;
uniform vec2 uSize;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float m = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++)
    m = max(m, texelFetch(tTile, clamp(p + ivec2(x, y), ivec2(0), ivec2(uSize) - 1), 0).r);
  gl_FragColor = vec4(m, 0.0, 0.0, 1.0);
}`;

// ---- 4. gather: scatter-as-gather on a Vogel disc
const GATHER = /* glsl */`
uniform sampler2D tPrep, tDil;
uniform vec2 uHalfTexel;
varying vec2 vUv;
#define N ${N_SAMPLES}
void main() {
  vec4 c = texelFetch(tPrep, ivec2(gl_FragCoord.xy), 0);
  float c0 = c.a, s0 = abs(c0);
  float nearR = texelFetch(tDil, ivec2(gl_FragCoord.xy) / ${TILE}, 0).r;
  float R = max(s0, nearR);                          // kernel radius: own blur, or the widest near blur that can reach us
  if (R < 0.5) { gl_FragColor = vec4(c.rgb, 0.0); return; }
  bool centreNear = c0 < -0.5;
  float areaK = R * R / float(N);                    // (area one sample stands for) / π
  // each sample stands for a patch of about spacing² pixels: read its colour from the mip level of that size,
  // so a point light becomes an even disc instead of a stamp of the sample pattern (CoC always from level 0)
  float lod = clamp(log2(R * 1.7725 / sqrt(float(N))) + 0.5, 0.0, 4.5);   // spacing = R·√(π/N); footprints overlap by ~√2
  vec3 cl = textureLod(tPrep, vUv, lod).rgb;         // the centre at the same footprint as the samples
  vec3 farSum = centreNear ? vec3(0.0) : cl;
  float farW = centreNear ? 0.0 : 1.0;
  vec3 fillSum = vec3(0.0); float fillW = 0.0;
  vec3 nearSum = vec3(0.0); float nearW = 0.0;
  for (int i = 0; i < N; i++) {
    float fi = float(i);
    float r = R * sqrt((fi + 0.5) / float(N));        // Vogel: uniform density over the disc
    float th = fi * 2.39996323;                       // golden angle
    vec2 uv = vUv + vec2(cos(th), sin(th)) * r * uHalfTexel;
    vec4 s = vec4(textureLod(tPrep, uv, lod).rgb, textureLod(tPrep, uv, 0.0).a);
    float ci = s.a, si = abs(ci);
    if (ci < -0.5) {
      // near field: the sample's own disc reaches us; weight = sample area / its disc area (energy conserving),
      // so the summed weight is the coverage of the blurred foreground at this pixel
      float w = clamp(si - r + 0.5, 0.0, 1.0) * areaK / max(si * si, 0.25);
      nearSum += s.rgb * w; nearW += w;
    } else {
      // far field / in focus: a sample behind the centre may not spread past the centre's own blur
      // (the nearer surface hides it); an in-focus sample (si ≈ 0) never spreads, so sharp edges do not halo
      float spread = (!centreNear && ci > c0) ? min(si, s0) : si;
      float w = clamp(spread - r + 0.5, 0.0, 1.0);
      farSum += s.rgb * w; farW += w;
      fillSum += s.rgb; fillW += 1.0;
    }
  }
  vec3 far;
  if (centreNear) far = fillW > 0.0 ? (farSum + 0.15 * fillSum) / (farW + 0.15 * fillW) : cl;   // what the near object hides
  else far = farSum / farW;
  float a = clamp(nearW, 0.0, 1.0);
  vec3 nearCol = nearW > 0.0 ? nearSum / nearW : cl;
  if (centreNear) a = max(a, fillW > 0.0 ? 0.0 : 1.0);
  gl_FragColor = vec4(mix(far, nearCol, a), a);
}`;

// ---- 5. final: composite, grade, output
const FINAL = (H) => /* glsl */`
${COMMON}
${HAZE}
uniform sampler2D tColor, tDepth, tGather, tOverlay;
uniform float uExposure, uSat, uVig, uLift;
uniform vec4 uOvRect;                                // overlay canvas: x, y (top-left, stage px), width, height
uniform vec2 uPx;
varying vec2 vUv;
// FXAA (the classic 5-tap edge search) on the sharp image only: the blurred part needs no anti-aliasing
float lu(vec3 c) { float l = dot(c, vec3(0.299, 0.587, 0.114)); return l / (1.0 + l); }
vec3 fxaa(vec2 uv) {
  vec3 m = min(texture(tColor, uv).rgb, vec3(24.0));
  float lNW = lu(texture(tColor, uv + vec2(-1.0, 1.0) * uPx).rgb), lNE = lu(texture(tColor, uv + vec2(1.0, 1.0) * uPx).rgb);
  float lSW = lu(texture(tColor, uv + vec2(-1.0, -1.0) * uPx).rgb), lSE = lu(texture(tColor, uv + vec2(1.0, -1.0) * uPx).rgb);
  float lM = lu(m);
  float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE))), lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  if (lMax - lMin < max(0.03, lMax * 0.12)) return m;
  vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
  float red = max((lNW + lNE + lSW + lSE) * 0.03125, 1.0 / 128.0);
  dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + red), -6.0, 6.0) * uPx;
  vec3 a = 0.5 * (min(texture(tColor, uv - dir / 6.0).rgb, vec3(24.0)) + min(texture(tColor, uv + dir / 6.0).rgb, vec3(24.0)));
  vec3 b = 0.5 * a + 0.25 * (min(texture(tColor, uv - dir * 0.5).rgb, vec3(24.0)) + min(texture(tColor, uv + dir * 0.5).rgb, vec3(24.0)));
  float lb = lu(b);
  return (lb < lMin || lb > lMax) ? a : b;
}
void main() {
  float S = viewDepth(texture(tDepth, vUv).x);
  float r = abs(cocDiam(S)) * 0.5;                   // own blur radius, full-res px
  vec4 g = texture(tGather, vUv);
  float b = max(smoothstep(0.5, 1.6, r), g.a);       // own blur, or a blurred foreground spilling over us
  vec3 col = g.rgb;
  if (b < 0.999) col = mix(haze(fxaa(vUv), S, vUv), g.rgb, b);
  gl_FragColor = vec4(col * uExposure, 1.0);
  #include <tonemapping_fragment>
  vec3 o = gl_FragColor.rgb;
  float l = dot(o, vec3(0.2126, 0.7152, 0.0722));
  o = max(mix(vec3(l), o, uSat), 0.0);              // the toy look: a gentle saturation boost after the tone curve
  o = o * (1.0 - uLift) + uLift * vec3(1.0, 0.97, 0.92);   // a touch of warm lift in the blacks
  vec2 q = (vUv - 0.5) * vec2(1.0, 1.0);
  float v = 1.0 - smoothstep(0.25, 0.85, length(q * vec2(1.25, 0.95)));
  o *= mix(1.0 - uVig, 1.0, v);
  // the type overlay (an sRGB canvas texture, decoded to linear by the sampler), over the graded picture
  vec2 op = (vec2(gl_FragCoord.x, ${H}.0 - gl_FragCoord.y) - uOvRect.xy) / uOvRect.zw;
  if (op.x >= 0.0 && op.y >= 0.0 && op.x < 1.0 && op.y < 1.0) {
    vec4 ov = texture(tOverlay, vec2(op.x, 1.0 - op.y));
    o = mix(o, ov.rgb, ov.a);
  }
  gl_FragColor = vec4(o, 1.0);
  #include <colorspace_fragment>
}`;

export function createDof(renderer, W, H, overlay) {
  const HW = W / 2, HH = H / 2, TW = Math.ceil(HW / TILE), TH = Math.ceil(HH / TILE);
  const rt = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, ...o });
  const sceneRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(W, H) });
  const prepRT = rt(HW, HH, { minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true }), gatherRT = rt(HW, HH);
  const tileRT = rt(TW, TH, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const dilRT = rt(TW, TH, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });

  const U = {
    uNear: { value: 1 }, uFar: { value: 1000 }, uFocus: { value: 100 }, uLens: { value: 0 }, uMaxCoc: { value: 64 },
    uHazeCol: { value: new THREE.Color() }, uSunCol: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uHazeStart: { value: 80 }, uHazeDen: { value: 0.004 }, uSunGlow: { value: 1 },
    uCamWorld: { value: new THREE.Matrix4() }, uTanHalf: { value: new THREE.Vector2(1, 1) },
  };
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const pass = (fs, uniforms) => {
    const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene();
    const m = new THREE.Mesh(tri, mat);
    m.frustumCulled = false;
    sc.add(m);
    return { sc, mat };
  };
  const prep = pass(PREP, { ...U, tColor: { value: sceneRT.texture }, tDepth: { value: sceneRT.depthTexture } });
  const tile = pass(TILE_FS, { tPrep: { value: prepRT.texture }, uHalf: { value: new THREE.Vector2(HW, HH) } });
  const dil = pass(DILATE_FS, { tTile: { value: tileRT.texture }, uSize: { value: new THREE.Vector2(TW, TH) } });
  const gather = pass(GATHER, { tPrep: { value: prepRT.texture }, tDil: { value: dilRT.texture }, uHalfTexel: { value: new THREE.Vector2(1 / HW, 1 / HH) } });
  const fin = pass(FINAL(H), { ...U, tColor: { value: sceneRT.texture }, tDepth: { value: sceneRT.depthTexture }, tGather: { value: gatherRT.texture },
    uPx: { value: new THREE.Vector2(1 / W, 1 / H) }, tOverlay: { value: overlay.texture }, uOvRect: { value: new THREE.Vector4(overlay.x, overlay.y, overlay.w, overlay.h) },
    uExposure: { value: 1 }, uSat: { value: 1.2 }, uVig: { value: 0.3 }, uLift: { value: 0.02 } });

  return {
    U, F: fin.mat.uniforms, sceneRT,
    render(scene, camera) {
      renderer.setRenderTarget(sceneRT);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(prepRT); renderer.render(prep.sc, cam);
      renderer.setRenderTarget(tileRT); renderer.render(tile.sc, cam);
      renderer.setRenderTarget(dilRT); renderer.render(dil.sc, cam);
      renderer.setRenderTarget(gatherRT); renderer.render(gather.sc, cam);
      renderer.setRenderTarget(null); renderer.render(fin.sc, cam);
    },
  };
}
