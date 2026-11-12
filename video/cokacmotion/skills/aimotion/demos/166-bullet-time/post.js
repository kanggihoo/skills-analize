/*
 * post.js — the frame pipeline (three.js render targets + full-screen ShaderMaterials).
 *
 *   opaque scene ─▶ sceneRT 1080×1920 HDR colour + depth
 *   copy         ─▶ backRT   540×960  (+ mips) — what the water refracts
 *   water scene  ─▶ sceneRT  (no clear: the water and drops depth-test against the opaque scene)
 *   prep         ─▶ prepRT   540×960  colour + signed circle of confusion (CoC, half-res px) in alpha, + mips
 *   tile / dilate─▶ 68×120   the widest near-field CoC within ±3 blocks of every 8×8 block (so a blurred
 *                             foreground spills over sharp things behind it, as far as its widest radius reaches)
 *   gather       ─▶ gatherRT 540×960  32 golden-angle samples; far samples may not spread past the centre's own
 *                             blur, near samples spread over everything; alpha = near coverage
 *   final        ─▶ canvas   FXAA on the sharp image, blend to the gather by the full-res CoC, flash, ACES, grade,
 *                             vignette, the chip overlay, sRGB
 *
 * CoC (thin lens, real units): c = A·f·|S − S_f| / (S·(S_f − f)) on a 36 mm-tall sensor, × 1920/36 px.
 */
import * as THREE from 'three';

const NS = 32, TILE = 8;
const VS = 'varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const DEPTH = /* glsl */`
uniform float uNear, uFar, uFocus, uLens, uMaxCoc;
float viewDepth(float d) { return uNear * uFar / (uFar - d * (uFar - uNear)); }
// signed diameter, full-res px; the near field is capped at 60 px so its spread (15 half-res px) always lies inside
// the ±3-block dilation below — a near blur that outran the dilation would end in a hard block edge
float coc(float S) { return clamp(uLens * (S - uFocus) / S, -60.0, uMaxCoc); }
`;

const COPY = /* glsl */`uniform sampler2D tColor; varying vec2 vUv;
void main() { gl_FragColor = vec4(min(texture2D(tColor, vUv).rgb, vec3(24.0)), 1.0); }`;

const PREP = /* glsl */`${DEPTH}
uniform sampler2D tColor, tDepth; varying vec2 vUv;
void main() {
  ivec2 b = ivec2(gl_FragCoord.xy) * 2;
  float d = min(min(texelFetch(tDepth, b, 0).x, texelFetch(tDepth, b + ivec2(1, 0), 0).x),
                min(texelFetch(tDepth, b + ivec2(0, 1), 0).x, texelFetch(tDepth, b + ivec2(1, 1), 0).x));
  gl_FragColor = vec4(min(texture2D(tColor, vUv).rgb, vec3(20.0)), coc(viewDepth(d)) * 0.25);
}`;

const TILE_FS = /* glsl */`uniform sampler2D tPrep; uniform vec2 uHalf;
void main() {
  ivec2 b = ivec2(gl_FragCoord.xy) * ${TILE};
  float m = 0.0;
  for (int y = 0; y < ${TILE}; y++) for (int x = 0; x < ${TILE}; x++) m = max(m, -texelFetch(tPrep, min(b + ivec2(x, y), ivec2(uHalf) - 1), 0).a);
  gl_FragColor = vec4(m, 0.0, 0.0, 1.0);
}`;
const DILATE = /* glsl */`uniform sampler2D tTile; uniform vec2 uSize;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy); float m = 0.0;
  for (int y = -3; y <= 3; y++) for (int x = -3; x <= 3; x++) m = max(m, texelFetch(tTile, clamp(p + ivec2(x, y), ivec2(0), ivec2(uSize) - 1), 0).r);
  gl_FragColor = vec4(m, 0.0, 0.0, 1.0);
}`;

const GATHER = /* glsl */`uniform sampler2D tPrep, tDil; uniform vec2 uTexel; varying vec2 vUv;
void main() {
  vec4 c = texelFetch(tPrep, ivec2(gl_FragCoord.xy), 0);
  float c0 = c.a, s0 = abs(c0);
  // the near radius from the dilated tiles, read bilinearly: a radius that jumped at tile borders would make the
  // sample pattern (and so the near-coverage estimate) jump too, printing the tile grid into soft foreground blur
  float R = max(s0, texture2D(tDil, vUv).r);
  if (R < 0.5) { gl_FragColor = vec4(c.rgb, 0.0); return; }
  bool cNear = c0 < -0.5;
  float area = R * R / float(${NS});
  // each sample stands for a patch R·√(π/N) wide: read colours from the mip level a little wider than that, so the
  // footprints overlap and a small bright source becomes an even disc instead of the sample lattice
  float lod = clamp(log2(R * 1.7725 / sqrt(float(${NS}))) + 1.1, 0.0, 4.5);
  vec3 cl = mix(c.rgb, textureLod(tPrep, vUv, lod).rgb, smoothstep(0.5, 2.5, s0));   // a sharp centre stays sharp
  vec3 farS = cNear ? vec3(0.0) : cl; float farW = cNear ? 0.0 : 1.0;
  vec3 fillS = vec3(0.0); float fillW = 0.0;
  vec3 nearS = vec3(0.0); float nearW = 0.0;
  for (int i = 0; i < ${NS}; i++) {
    float fi = float(i), r = R * sqrt((fi + 0.5) / float(${NS})), th = fi * 2.39996323;
    vec2 uv = vUv + vec2(cos(th), sin(th)) * r * uTexel;
    vec3 col = textureLod(tPrep, uv, lod).rgb;
    float ci = textureLod(tPrep, uv, 0.0).a, si = abs(ci);
    float hot = 1.0 + 0.6 * clamp(dot(col, vec3(0.3, 0.5, 0.2)) - 1.2, 0.0, 3.0);   // highlights read as bokeh discs
    if (ci < -0.5) {
      float w = clamp(si - r + 0.5, 0.0, 1.0) * area / max(si * si, 0.25);
      nearS += col * w * hot; nearW += w * hot;
    } else {
      float spread = (!cNear && ci > c0) ? min(si, s0) : si;
      float w = clamp(spread - r + 0.5, 0.0, 1.0) * hot;
      farS += col * w; farW += w; fillS += col; fillW += 1.0;
    }
  }
  vec3 far = cNear ? (fillW > 0.0 ? (farS + 0.15 * fillS) / (farW + 0.15 * fillW) : cl) : farS / farW;
  float a = clamp(nearW, 0.0, 1.0);
  vec3 nearC = nearW > 0.0 ? nearS / nearW : cl;
  if (cNear) a = max(a, fillW > 0.0 ? 0.0 : 1.0);
  gl_FragColor = vec4(mix(far, nearC, a), a);
}`;

const FINAL = (W, H) => /* glsl */`${DEPTH}
uniform sampler2D tColor, tDepth, tGather, tOverlay;
uniform vec2 uPx; uniform vec4 uOv;
uniform float uExposure, uSat, uVig, uFlash, uWarm;
varying vec2 vUv;
float lu(vec3 c) { float l = dot(c, vec3(0.299, 0.587, 0.114)); return l / (1.0 + l); }
vec3 tap(vec2 uv) { return min(texture2D(tColor, uv).rgb, vec3(24.0)); }
vec3 fxaa(vec2 uv) {
  vec3 m = tap(uv);
  float lNW = lu(tap(uv + vec2(-1.0, 1.0) * uPx)), lNE = lu(tap(uv + vec2(1.0, 1.0) * uPx));
  float lSW = lu(tap(uv + vec2(-1.0, -1.0) * uPx)), lSE = lu(tap(uv + vec2(1.0, -1.0) * uPx));
  float lM = lu(m), lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE))), lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  if (lMax - lMin < max(0.03, lMax * 0.12)) return m;
  vec2 d = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
  float red = max((lNW + lNE + lSW + lSE) * 0.03125, 1.0 / 128.0);
  d = clamp(d / (min(abs(d.x), abs(d.y)) + red), -6.0, 6.0) * uPx;
  vec3 a = 0.5 * (tap(uv - d / 6.0) + tap(uv + d / 6.0));
  vec3 b = 0.5 * a + 0.25 * (tap(uv - d * 0.5) + tap(uv + d * 0.5));
  float lb = lu(b);
  return (lb < lMin || lb > lMax) ? a : b;
}
void main() {
  float S = viewDepth(texture2D(tDepth, vUv).x);
  float r = abs(coc(S)) * 0.5;
  vec4 g = texture2D(tGather, vUv);
  float b = max(smoothstep(0.5, 1.6, r), g.a);
  vec3 col = g.rgb;
  if (b < 0.999) col = mix(fxaa(vUv), g.rgb, b);
  col *= uExposure * (1.0 + uFlash);
  col *= mix(vec3(1.0), vec3(1.06, 1.0, 0.9), uWarm);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  vec3 o = gl_FragColor.rgb;
  float l = dot(o, vec3(0.2126, 0.7152, 0.0722));
  o = max(mix(vec3(l), o, uSat), 0.0);
  vec2 q = vUv - 0.5;
  o *= mix(1.0 - uVig, 1.0, 1.0 - smoothstep(0.3, 0.9, length(q * vec2(1.3, 0.9))));
  vec2 op = (vec2(gl_FragCoord.x, ${H}.0 - gl_FragCoord.y) - uOv.xy) / uOv.zw;
  if (op.x >= 0.0 && op.y >= 0.0 && op.x < 1.0 && op.y < 1.0) {
    vec4 ov = texture2D(tOverlay, vec2(op.x, 1.0 - op.y));
    o = mix(o, ov.rgb, ov.a);                         // straight alpha, sampled 1:1 (nearest)
  }
  gl_FragColor = vec4(o, 1.0);
  #include <colorspace_fragment>
}`;

export function createPipeline(renderer, W, H, overlay) {
  const HW = W / 2, HH = H / 2, TW = Math.ceil(HW / TILE), TH = Math.ceil(HH / TILE);
  const rt = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, ...o });
  const sceneRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(W, H) });
  const mip = { minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true };
  const backRT = rt(HW, HH, mip), prepRT = rt(HW, HH, mip), gatherRT = rt(HW, HH);
  const near = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
  const tileRT = rt(TW, TH, near), dilRT = rt(TW, TH);
  const U = { uNear: { value: 0.02 }, uFar: { value: 100 }, uFocus: { value: 1 }, uLens: { value: 0 }, uMaxCoc: { value: 80 } };

  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const pass = (fs, uniforms, toneMapped = false) => {
    const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, toneMapped });
    const sc = new THREE.Scene(), m = new THREE.Mesh(tri, mat);
    m.frustumCulled = false; sc.add(m);
    return { sc, mat };
  };
  const copy = pass(COPY, { tColor: { value: sceneRT.texture } });
  const prep = pass(PREP, { ...U, tColor: { value: sceneRT.texture }, tDepth: { value: sceneRT.depthTexture } });
  const tile = pass(TILE_FS, { tPrep: { value: prepRT.texture }, uHalf: { value: new THREE.Vector2(HW, HH) } });
  const dil = pass(DILATE, { tTile: { value: tileRT.texture }, uSize: { value: new THREE.Vector2(TW, TH) } });
  const gather = pass(GATHER, { tPrep: { value: prepRT.texture }, tDil: { value: dilRT.texture }, uTexel: { value: new THREE.Vector2(1 / HW, 1 / HH) } });
  const fin = pass(FINAL(W, H), {
    ...U, tColor: { value: sceneRT.texture }, tDepth: { value: sceneRT.depthTexture }, tGather: { value: gatherRT.texture },
    tOverlay: { value: overlay.texture }, uOv: { value: new THREE.Vector4(overlay.x, overlay.y, overlay.w, overlay.h) },
    uPx: { value: new THREE.Vector2(1 / W, 1 / H) }, uExposure: { value: 1 }, uSat: { value: 1.08 }, uVig: { value: 0.28 }, uFlash: { value: 0 }, uWarm: { value: 0.5 },
  }, true);

  return {
    U, F: fin.mat.uniforms, backTex: backRT.texture,
    passes: [copy, prep, tile, dil, gather, fin],
    render(scene, waterScene, camera) {
      const r = renderer;
      r.setRenderTarget(sceneRT); r.clear(true, true, false);
      r.render(scene, camera);
      r.setRenderTarget(backRT); r.render(copy.sc, cam);
      r.setRenderTarget(sceneRT); r.render(waterScene, camera);
      r.setRenderTarget(prepRT); r.render(prep.sc, cam);
      r.setRenderTarget(tileRT); r.render(tile.sc, cam);
      r.setRenderTarget(dilRT); r.render(dil.sc, cam);
      r.setRenderTarget(gatherRT); r.render(gather.sc, cam);
      r.setRenderTarget(null); r.render(fin.sc, cam);
    },
  };
}

/*
 * Water without transmission: environment reflection weighted by Schlick's Fresnel F = F₀ + (1 − F₀)(1 − n·v)⁵,
 * the sun as a sharp highlight, and a refraction fake that reads the opaque scene behind at a screen offset along the
 * view-space normal (a ball of water inverts and magnifies what is behind it). Instanced drops use the same shader.
 */
export function waterMaterial({ env, back, sunDir }) {
  // the CubeUV layout constants three derives for its own materials (a PMREM atlas of height h)
  const h = env.image.height, maxMip = Math.log2(h) - 2;
  const defines = { ENVMAP_TYPE_CUBE_UV: '', CUBEUV_TEXEL_WIDTH: 1 / (3 * Math.max(2 ** maxMip, 7 * 16)), CUBEUV_TEXEL_HEIGHT: 1 / h, CUBEUV_MAX_MIP: `${maxMip}.0` };
  return new THREE.ShaderMaterial({
    defines,
    uniforms: { uEnv: { value: env }, uBack: { value: back }, uRes: { value: new THREE.Vector2(1080, 1920) }, uSun: { value: sunDir.clone() },
      uRefr: { value: 0.085 }, uTint: { value: new THREE.Color(0.84, 0.94, 0.97) }, uGlow: { value: 0.0 }, uKey: { value: new THREE.Vector3(0, 1, 0) }, uStreak: { value: 0 } },
    vertexShader: /* glsl */`
      uniform float uStreak;
      varying vec3 vW, vN;
      varying float vK;
      void main() {
        mat4 m = modelMatrix;
        vK = 1.0;
        #ifdef USE_INSTANCING
          m = m * instanceMatrix;
          // a drop stretched along its velocity is an exposure streak: 1/stretch of the time at any one place
          vK = mix(1.0, length(instanceMatrix[0].xyz) / max(length(instanceMatrix[1].xyz), 1e-7), uStreak);
        #endif
        vec4 w = m * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(m) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      #include <cube_uv_reflection_fragment>
      uniform sampler2D uEnv; uniform sampler2D uBack; uniform vec2 uRes; uniform vec3 uSun, uTint, uKey; uniform float uRefr, uGlow;
      varying vec3 vW, vN;
      varying float vK;
      void main() {
        vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
        if (dot(N, V) < 0.0) N = -N;
        float nv = clamp(dot(N, V), 0.0, 1.0), g = 1.0 - nv;
        float F = 0.03 + 0.97 * g * g * g * g * g;
        vec3 Rf = reflect(-V, N);
        vec3 refl = textureCubeUV(uEnv, Rf, 0.0).rgb;
        refl += vec3(1.0, 0.92, 0.8) * 60.0 * pow(max(dot(Rf, uSun), 0.0), 1400.0);
        // a ball of water is a lens: what is behind comes through displaced (inverted toward the rim)
        vec3 Nv = normalize((viewMatrix * vec4(N, 0.0)).xyz);
        vec2 uv = gl_FragCoord.xy / uRes - Nv.xy * uRefr * vK * (0.5 + 0.8 * g);
        vec3 refr = textureLod(uBack, clamp(uv, vec2(0.002), vec2(0.998)), 1.0).rgb * uTint;
        // the thick rim bends light away (total internal reflection): a darker band just inside the silhouette
        refr *= mix(1.0, 0.42, smoothstep(0.35, 0.9, g));
        // sun through the body
        float bl = pow(max(dot(-V, uSun), 0.0), 6.0);
        refr += vec3(1.0, 0.95, 0.85) * bl * uGlow * (0.4 + 0.6 * nv);
        vec3 col = mix(refr, refl, F * vK) + (1.0 - vK) * 0.05;
        // crisp glints: a light beside the lens (always reads as wet) and its soft halo
        float k = max(dot(Rf, uKey), 0.0);
        col += vec3(1.0, 0.98, 0.94) * (6.0 * pow(k, 220.0) + 0.25 * pow(k, 12.0)) * vK;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}
