/*
 * post.js — the eye, as passes on full-screen triangles (three.js render targets + ShaderMaterials).
 *
 *   scene  ─▶ sceneRT  1080×1920  HDR linear colour (far town, then the room over it)
 *   small  ─▶ smallRT   270×480   4×4 average + mip chain   (what the closed lids glow with)
 *   bright ─▶ brightRT  270×480   soft threshold on absolute luminance + mips (only sky/sun light passes)
 *   bloom  ─▶ bloomRT   270×480   five mip levels, each a 4-tap tent, summed
 *   prep   ─▶ prepRT     540×960  2×2 average + mips            ┐ only while the wake blur R > 0.35 px
 *   gather ─▶ gatherRT   540×960  32-sample Vogel disc, radius R┘
 *   final  ─▶ canvas               FXAA, blur mix, eyelids (in linear light), bloom, exposure E, ACES, grade, overlay
 */
import * as THREE from 'three';
import { ASPECT, LID } from './body.js';

const VS = /* glsl */`
varying vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const SMALL = (bright) => /* glsl */`
uniform sampler2D tScene;
uniform vec2 uPx;          // one full-res texel
uniform float uT;          // absolute luminance threshold (scene units, before exposure)
varying vec2 vUv;
vec3 tap(vec2 o) {
  vec3 c = min(texture(tScene, vUv + o * uPx).rgb, vec3(60.0));
  ${bright ? 'float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c *= smoothstep(uT, uT * 1.7, l);' : ''}
  return c;
}
void main() {
  // four bilinear taps at (±1, ±1) full-res px = the mean of the 4×4 block under this quarter-res texel
  vec3 c = 0.25 * (tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0)));
  gl_FragColor = vec4(c, 1.0);
}`;

const BLOOM = /* glsl */`
uniform sampler2D tBright;
uniform vec2 uQPx;         // one quarter-res texel
varying vec2 vUv;
void main() {
  vec3 s = vec3(0.0);
  float w[5] = float[5](0.34, 0.27, 0.19, 0.12, 0.08);
  for (int k = 0; k < 5; k++) {
    float lod = float(k + 1), o = exp2(lod) * 0.75;
    vec3 c = textureLod(tBright, vUv + vec2(-o, -o) * uQPx, lod).rgb + textureLod(tBright, vUv + vec2(o, -o) * uQPx, lod).rgb
           + textureLod(tBright, vUv + vec2(-o, o) * uQPx, lod).rgb + textureLod(tBright, vUv + vec2(o, o) * uQPx, lod).rgb;
    s += w[k] * 0.25 * c;
  }
  gl_FragColor = vec4(s, 1.0);
}`;

const PREP = /* glsl */`
uniform sampler2D tScene;
varying vec2 vUv;
void main() { gl_FragColor = vec4(min(texture(tScene, vUv).rgb, vec3(60.0)), 1.0); }`;

const N = 32;
const GATHER = /* glsl */`
uniform sampler2D tPrep;
uniform vec2 uHPx;         // one half-res texel
uniform float uR;          // blur radius, full-res px, at the centre
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float R = 0.5 * uR * (1.0 + 0.35 * dot(p, p));            // half-res px; a little wider toward the edge of vision
  // each sample stands for ~R²π/N pixels: read the mip of that footprint so the disc is even, not a dot pattern
  float lod = clamp(log2(R * 1.7725 / sqrt(${N}.0)) + 0.5, 0.0, 5.0);
  vec3 s = textureLod(tPrep, vUv, lod).rgb;
  for (int i = 0; i < ${N}; i++) {
    float fi = float(i);
    float r = R * sqrt((fi + 0.5) / ${N}.0);                 // Vogel: uniform density over the disc
    float th = fi * 2.39996323;                              // golden angle
    s += textureLod(tPrep, vUv + vec2(cos(th), sin(th)) * r * uHPx, lod).rgb;
  }
  gl_FragColor = vec4(s / ${N + 1}.0, 1.0);
}`;

const FINAL = /* glsl */`
uniform sampler2D tScene, tGather, tSmall, tBloom, tChip, tTitle;
uniform vec2 uPx;
uniform float uBlur, uExposure, uBloomK, uVig, uLift, uSat, uLashK, uTitleA;
uniform vec4 uLid;          // c, h_upper, h_lower, edge width w (eye units: u ∈ [−1, 1] across, v up)
uniform vec3 uSkin;         // lid transmittance (warm: red passes, blue is absorbed)
uniform vec4 uChipRect, uTitleRect;   // stage px: x, y (top-left), w, h
varying vec2 vUv;

float lu(vec3 c) { float l = dot(c, vec3(0.299, 0.587, 0.114)); return l / (1.0 + l); }
vec3 src(vec2 uv) { return min(texture(tScene, uv).rgb, vec3(60.0)); }
vec3 fxaa(vec2 uv) {
  vec3 m = src(uv);
  float lNW = lu(src(uv + vec2(-1.0, 1.0) * uPx)), lNE = lu(src(uv + vec2(1.0, 1.0) * uPx));
  float lSW = lu(src(uv + vec2(-1.0, -1.0) * uPx)), lSE = lu(src(uv + vec2(1.0, -1.0) * uPx));
  float lM = lu(m);
  float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE))), lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  if (lMax - lMin < max(0.02, lMax * 0.1)) return m;
  vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
  float red = max((lNW + lNE + lSW + lSE) * 0.03125, 1.0 / 128.0);
  dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + red), -6.0, 6.0) * uPx;
  vec3 a = 0.5 * (src(uv - dir / 6.0) + src(uv + dir / 6.0));
  vec3 b = 0.5 * a + 0.25 * (src(uv - dir * 0.5) + src(uv + dir * 0.5));
  float lb = lu(b);
  return (lb < lMin || lb > lMax) ? a : b;
}
// lid curve: cubic Bezier with evenly spaced control x, so y is a polynomial in s = (u − X0)/(X1 − X0)
float bez(float s, vec2 k) { float r = 1.0 - s; return 3.0 * r * r * s * k.x + 3.0 * r * s * s * k.y; }
float dbez(float s, vec2 k) { float r = 1.0 - s; return 3.0 * k.x * (r * r - 2.0 * r * s) + 3.0 * k.y * (2.0 * r * s - s * s); }
vec4 overlay(sampler2D tex, vec4 rect) {
  vec2 p = (vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y) - rect.xy) / rect.zw;
  if (p.x < 0.0 || p.y < 0.0 || p.x > 1.0 || p.y > 1.0) return vec4(0.0);
  return texture(tex, vec2(p.x, 1.0 - p.y));
}
void main() {
  vec3 col = fxaa(vUv);
  if (uBlur > 0.35) {
    vec2 p = vUv * 2.0 - 1.0;
    float r = uBlur * (1.0 + 0.35 * dot(p, p));
    col = mix(col, texture(tGather, vUv).rgb, smoothstep(0.35, 1.4, r));
  }

  // ---- eyelids, in linear light before exposure (what reaches the retina)
  float u = vUv.x * 2.0 - 1.0, v = (vUv.y * 2.0 - 1.0) * ${ASPECT.toFixed(6)};
  float s = (u - (${LID.X0.toFixed(3)})) / ${(LID.X1 - LID.X0).toFixed(3)};
  float c = uLid.x, w = uLid.w;
  vec2 KU = vec2(${LID.KU[0].toFixed(3)}, ${LID.KU[1].toFixed(3)}), KL = vec2(${LID.KL[0].toFixed(3)}, ${LID.KL[1].toFixed(3)});
  float yu = c - w + uLid.y * bez(s, KU), su = uLid.y * dbez(s, KU) / ${(LID.X1 - LID.X0).toFixed(3)};
  float yl = c + w - uLid.z * bez(s, KL), sl = uLid.z * dbez(s, KL) / ${(LID.X1 - LID.X0).toFixed(3)};
  float du = (yu - v) * inversesqrt(1.0 + su * su);        // signed distance to the upper lid edge (+ = open side)
  float dl = (v - yl) * inversesqrt(1.0 + sl * sl);
  float vis = smoothstep(-w, w, du) * smoothstep(-w, w, dl);
  // lashes: a soft dark fringe just inside each edge, faint streaks across
  float streak = 0.92 + 0.08 * sin(u * 9.0 + 1.3 * sin(u * 3.1));   // lashes this close are only a soft, uneven fringe
  float lash = 1.0 - uLashK * (0.6 * exp(-max(du, 0.0) / 0.045) * streak + 0.24 * exp(-max(dl, 0.0) / 0.03));
  // closed lids are not black: skin passes red light; brightest near the slit, where light scatters in
  vec3 glow = mix(textureLod(tSmall, vUv, 8.0).rgb, textureLod(tSmall, vUv, 6.5).rgb, 0.5);
  float dIn = min(du, dl);
  vec3 skin = glow * uSkin * (0.5 + 0.9 * exp(min(dIn, 0.0) / 0.07));
  vec3 bloom = texture(tBloom, vUv).rgb * uBloomK;
  col = mix(skin, col * lash + bloom, vis);

  // ---- exposure (the adapted eye), filmic curve, grade
  gl_FragColor = vec4(col * uExposure, 1.0);
  #include <tonemapping_fragment>
  vec3 o = gl_FragColor.rgb;
  float l = dot(o, vec3(0.2126, 0.7152, 0.0722));
  o = max(mix(vec3(l), o, uSat), 0.0);
  o = o * (1.0 - uLift) + uLift * vec3(1.0, 0.93, 0.84);   // warm, lifted blacks
  vec2 q = (vUv - 0.5) * vec2(1.0, ${ASPECT.toFixed(6)});
  o *= mix(1.0 - uVig, 1.0, 1.0 - smoothstep(0.35, 1.05, length(q * vec2(1.3, 0.85))));

  // ---- overlay (sRGB canvases, decoded to linear by the sampler)
  vec4 ch = overlay(tChip, uChipRect);
  o = mix(o, ch.rgb, ch.a);
  vec4 ti = overlay(tTitle, uTitleRect);
  o = mix(o, ti.rgb, ti.a * uTitleA);
  gl_FragColor = vec4(o, 1.0);
  #include <colorspace_fragment>
}`;

export function createPost(renderer, W, H, { chipTex, chipRect, titleTex, titleRect }) {
  const HW = W / 2, HH = H / 2, QW = W / 4, QH = H / 4;
  const rt = (w, h, mips = false) => new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType, depthBuffer: false, magFilter: THREE.LinearFilter,
    minFilter: mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter, generateMipmaps: mips,
  });
  const sceneRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthBuffer: true });
  const smallRT = rt(QW, QH, true), brightRT = rt(QW, QH, true), bloomRT = rt(QW, QH);
  const prepRT = rt(HW, HH, true), gatherRT = rt(HW, HH);

  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const pass = (fs, uniforms, toneMapped = false) => {
    const m = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, toneMapped });
    const sc = new THREE.Scene();
    const mesh = new THREE.Mesh(tri, m);
    mesh.frustumCulled = false;
    sc.add(mesh);
    return { sc, m };
  };
  const px = new THREE.Vector2(1 / W, 1 / H);
  const small = pass(SMALL(false), { tScene: { value: sceneRT.texture }, uPx: { value: px }, uT: { value: 0 } });
  const bright = pass(SMALL(true), { tScene: { value: sceneRT.texture }, uPx: { value: px }, uT: { value: 2.2 } });
  const bloom = pass(BLOOM, { tBright: { value: brightRT.texture }, uQPx: { value: new THREE.Vector2(1 / QW, 1 / QH) } });
  const prep = pass(PREP, { tScene: { value: sceneRT.texture } });
  const gather = pass(GATHER, { tPrep: { value: prepRT.texture }, uHPx: { value: new THREE.Vector2(1 / HW, 1 / HH) }, uR: { value: 0 } });
  const fin = pass(FINAL, {
    tScene: { value: sceneRT.texture }, tGather: { value: gatherRT.texture }, tSmall: { value: smallRT.texture }, tBloom: { value: bloomRT.texture },
    tChip: { value: chipTex }, tTitle: { value: titleTex },
    uChipRect: { value: new THREE.Vector4(...chipRect) }, uTitleRect: { value: new THREE.Vector4(...titleRect) }, uTitleA: { value: 0 },
    uPx: { value: px }, uBlur: { value: 0 }, uExposure: { value: 1 }, uBloomK: { value: 1 }, uVig: { value: 0.3 }, uLift: { value: 0.02 }, uSat: { value: 1.05 },
    uLid: { value: new THREE.Vector4(0, 10, 10, 0.05) }, uLashK: { value: 0 }, uSkin: { value: new THREE.Vector3(0.17, 0.045, 0.02) },
  }, true);

  return {
    F: fin.m.uniforms, bright: bright.m.uniforms, sceneRT,
    /** draw(scenes) renders the scene layers into sceneRT; then the eye passes */
    render(drawScene, blurPx) {
      renderer.setRenderTarget(sceneRT);
      renderer.clear(true, true, true);
      drawScene();
      renderer.setRenderTarget(smallRT); renderer.render(small.sc, cam);
      renderer.setRenderTarget(brightRT); renderer.render(bright.sc, cam);
      renderer.setRenderTarget(bloomRT); renderer.render(bloom.sc, cam);
      if (blurPx > 0.35) {
        gather.m.uniforms.uR.value = blurPx;
        renderer.setRenderTarget(prepRT); renderer.render(prep.sc, cam);
        renderer.setRenderTarget(gatherRT); renderer.render(gather.sc, cam);
      }
      fin.m.uniforms.uBlur.value = blurPx;
      renderer.setRenderTarget(null);
      renderer.render(fin.sc, cam);
    },
  };
}
