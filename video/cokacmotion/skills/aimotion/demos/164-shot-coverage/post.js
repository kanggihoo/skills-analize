/*
 * post.js — lens depth of field from the shot data, as our own short pass chain (three.js targets + ShaderMaterials).
 *
 *   scene  ─▶ sceneRT   1080×1920  HDR linear colour (MSAA ×4) + resolved depth texture
 *   prep   ─▶ prepRT     540×960   2×2 average colour, alpha = signed CoC radius (half-res px) from the nearest depth
 *   gather ─▶ blurRT     540×960   32 golden-angle samples; a sample counts when its own CoC reaches the centre
 *                                  (scatter-as-gather); samples behind the centre may not exceed twice its CoC,
 *                                  so a blurred background never spills over a sharp face; alpha = near-field cover
 *   final  ─▶ canvas    1080×1920  sharp ↔ blurred by the full-res CoC (or the near cover), warm grade, vignette,
 *                                  ACES + sRGB (three's tone-mapping and colour-space chunks)
 *
 * Thin lens: the blur-circle diameter on the sensor for an object at distance S, focused at S_f, focal length f,
 * f-number N is  c = f² / (N·(S_f − f)) · |S − S_f| / S.  In image pixels: c · 1920 / SENSOR_H.
 * The sign is kept: + behind the focal plane (far field), − in front (near field, e.g. the OTS shoulder).
 */
import * as THREE from 'three';

const VS = /* glsl */`
varying vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const COMMON = /* glsl */`
uniform float uNear, uFar, uFocus, uLens, uMaxCoc;
float viewDepth(float d) { return uNear * uFar / (uFar - d * (uFar - uNear)); }
float cocDiam(float S) { return clamp(uLens * (S - uFocus) / S, -uMaxCoc, uMaxCoc); }
`;

const PREP = /* glsl */`
${COMMON}
uniform sampler2D tColor, tDepth;
varying vec2 vUv;
void main() {
  ivec2 b = ivec2(gl_FragCoord.xy) * 2;
  float d = min(min(texelFetch(tDepth, b, 0).x, texelFetch(tDepth, b + ivec2(1, 0), 0).x),
                min(texelFetch(tDepth, b + ivec2(0, 1), 0).x, texelFetch(tDepth, b + ivec2(1, 1), 0).x));
  vec3 c = 0.25 * (texelFetch(tColor, b, 0).rgb + texelFetch(tColor, b + ivec2(1, 0), 0).rgb
                 + texelFetch(tColor, b + ivec2(0, 1), 0).rgb + texelFetch(tColor, b + ivec2(1, 1), 0).rgb);
  gl_FragColor = vec4(min(c, vec3(24.0)), cocDiam(viewDepth(d)) * 0.25);
}`;

const GATHER = /* glsl */`
uniform sampler2D tPrep;
uniform vec2 uTexel;
uniform float uMaxR;
varying vec2 vUv;
#define NS 32
void main() {
  vec4 c0 = texture2D(tPrep, vUv);
  float r0 = abs(c0.a);
  vec3 acc = c0.rgb;
  float tot = 1.0, nearCover = 0.0;
  for (int i = 0; i < NS; i++) {
    float fi = float(i) + 0.5;
    float rad = uMaxR * sqrt(fi / float(NS));
    float ang = fi * 2.39996323;
    vec4 s = texture2D(tPrep, vUv + vec2(cos(ang), sin(ang)) * rad * uTexel);
    float sr = abs(s.a);
    if (s.a > c0.a) sr = min(sr, r0 * 2.0);
    float m = smoothstep(rad - 0.75, rad + 0.75, sr);
    acc += mix(acc / tot, s.rgb, m);
    tot += 1.0;
    if (s.a < -0.6 && s.a < c0.a - 0.6) nearCover = max(nearCover, m);
  }
  gl_FragColor = vec4(acc / tot, nearCover);
}`;

const FINAL = /* glsl */`
${COMMON}
uniform sampler2D tColor, tDepth, tBlur;
uniform float uVignette, uExposure;
varying vec2 vUv;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec3 sharp = texelFetch(tColor, p, 0).rgb;
  vec4 bl = texture2D(tBlur, vUv);
  float r = abs(cocDiam(viewDepth(texelFetch(tDepth, p, 0).x))) * 0.25;
  float w = max(smoothstep(0.25, 1.0, r), bl.a);
  vec3 col = mix(sharp, bl.rgb, w) * uExposure;
  // warm grade: a little lift in the shadows, gentle saturation
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, 1.06) + vec3(0.010, 0.006, 0.0) * (1.0 - smoothstep(0.0, 0.25, l));
  vec2 q = vUv - 0.5;
  col *= 1.0 - uVignette * smoothstep(0.25, 0.85, length(q * vec2(1.0, 0.72)) * 1.35);
  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function createPost(renderer, W, H, sensorH) {
  const depthTexture = new THREE.DepthTexture(W, H);
  depthTexture.type = THREE.UnsignedIntType;
  const sceneRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 2, depthTexture, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const half = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  const prepRT = new THREE.WebGLRenderTarget(W / 2, H / 2, half);
  const blurRT = new THREE.WebGLRenderTarget(W / 2, H / 2, half);
  const lensU = () => ({ uNear: { value: 0.05 }, uFar: { value: 40 }, uFocus: { value: 1 }, uLens: { value: 0 }, uMaxCoc: { value: 48 } });
  const U = lensU();
  const mk = (fs, uniforms) => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false });
  const prep = mk(PREP, { ...U, tColor: { value: sceneRT.texture }, tDepth: { value: depthTexture } });
  const gather = mk(GATHER, { tPrep: { value: prepRT.texture }, uTexel: { value: new THREE.Vector2(2 / W, 2 / H) }, uMaxR: { value: 12 } });
  const final = mk(FINAL, { ...U, tColor: { value: sceneRT.texture }, tDepth: { value: depthTexture }, tBlur: { value: blurRT.texture }, uVignette: { value: 0.32 }, uExposure: { value: 1 } });
  // share the lens uniforms by reference
  for (const k of Object.keys(U)) { prep.uniforms[k] = U[k]; final.uniforms[k] = U[k]; }
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const quad = new THREE.Mesh(tri, prep);
  quad.frustumCulled = false;
  const qScene = new THREE.Scene();
  qScene.add(quad);
  const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const pass = (m, target) => { quad.material = m; renderer.setRenderTarget(target); renderer.render(qScene, qCam); };
  return {
    sceneRT, materials: [prep, gather, final],
    /** set the lens for this frame: f (mm), N, focus distance S_f (m), camera near/far */
    setLens({ f, N, focus, near, far, ev = 0 }) {
      final.uniforms.uExposure.value = Math.pow(2, ev);
      const fm = f / 1000;
      const Sf = Math.max(focus, fm * 1.5);
      U.uNear.value = near; U.uFar.value = far; U.uFocus.value = Sf;
      U.uLens.value = (fm * fm) / (N * (Sf - fm)) * (H / sensorH);   // CoC diameter (px) per unit (S − S_f)/S
      gather.uniforms.uMaxR.value = Math.min(12, Math.max(1.5, Math.abs(U.uLens.value) * 0.25 * 1.2));
    },
    render(scene, camera, overlay, orthoCam) {
      renderer.setRenderTarget(sceneRT);
      renderer.clear();
      renderer.render(scene, camera);
      pass(prep, prepRT);
      pass(gather, blurRT);
      pass(final, null);
      if (overlay) renderer.render(overlay, orthoCam);
    },
  };
}
