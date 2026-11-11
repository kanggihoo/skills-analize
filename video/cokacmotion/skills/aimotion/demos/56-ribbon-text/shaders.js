/*
 * shaders.js — GLSL for 56 · 글자의 강.
 *   GLYPH_*  one instanced quad per glyph; the SDF edge is widened by the circle of confusion (depth of field)
 *   DUST_*   point-sprite motes, defocused into discs by the same thin-lens CoC
 *   SKY_FS   deep indigo void with the faint glow of the confluence
 *   DOWN_FS / BLUR_FS / FINAL_FS   bloom chain and tone map
 */

export const GLYPH_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aQ;      // quad corner, -1..1
layout(location = 1) in vec4 iP;      // glyph centre (world), atlas cell
layout(location = 2) in vec4 iX;      // glyph x axis × em (reading direction), colour r
layout(location = 3) in vec4 iY;      // glyph y axis × em (up), colour g
layout(location = 4) in vec4 iC;      // colour b, -, -, -
uniform mat4 uView, uProj;
uniform float uHalf;                  // half an atlas cell, in em
uniform float uCell, uCols;           // cell size (texels), cells per atlas row
uniform float uK, uDf;                // CoC radius (px) = uK·|1/z − 1/uDf|
out vec2 vTex;
flat out vec2 vOrg;
out float vR;
flat out vec3 vCol;
void main() {
  vec3 wp = iP.xyz + (iX.xyz * aQ.x + iY.xyz * aQ.y) * uHalf;
  vec4 vp = uView * vec4(wp, 1.0);
  gl_Position = uProj * vp;
  float z = max(-vp.z, 0.05);
  vR = uK * abs(1.0 / z - 1.0 / uDf);
  float row = floor((iP.w + 0.5) / uCols);
  vOrg = vec2(iP.w - row * uCols, row) * uCell;
  vTex = vec2(aQ.x * 0.5 + 0.5, 0.5 - aQ.y * 0.5) * uCell;   // texel coords in the cell (y down, like the raster)
  vCol = vec3(iX.w, iY.w, iC.x);
}`;

export const GLYPH_FS = `#version 300 es
precision highp float;
uniform sampler2D uAtlas;             // signed distance in level-0 texels (+ outside), R16F, mipmapped
uniform vec2 uAtlasSize;
uniform float uCell, uSpread, uStem;
in vec2 vTex;
flat in vec2 vOrg;
in float vR;
flat in vec3 vCol;
out vec4 o;
void main() {
  vec2 tc = clamp(vTex, vec2(0.5), vec2(uCell - 0.5));
  float d = texture(uAtlas, (vOrg + tc) / uAtlasSize).r;
  // texels per screen pixel across the edge: |∇d| on screen (∇d = 1 per texel for a distance field),
  // kept within the quad's own anisotropy so ridges of the field cannot blow it up
  vec2 jx = dFdx(vTex), jy = dFdy(vTex);
  float lx = length(jx), ly = length(jy);
  float g = length(vec2(dFdx(d), dFdy(d)));
  float tpp = max(clamp(g, 0.7 * min(lx, ly), 1.25 * max(lx, ly)), 1e-4);
  float dpx = d / tpp;                                  // signed distance to the outline in screen pixels
  // depth of field: the edge ramp widens by the circle of confusion. The field only extends uSpread texels
  // around the glyph, so the blur stops there (the ramp must reach 0 inside the cell).
  float r = clamp(vR, 0.0, max(uSpread / tpp - 0.8, 0.0));
  float w = 0.6 + r;
  float cov = 1.0 - smoothstep(-w, w, dpx);
  // a symmetric ramp keeps a stroke's light while r < its half-width h; past that the dilated glyph would
  // gain light it does not have, so divide it back out (≈ energy-conserving blur)
  float h = uStem / tpp;
  float norm = 1.0 / (1.0 + 0.3 * max(r - h, 0.0) / max(h, 0.35));
  // a faint halo of light around each glyph (windowed so it ends well inside the cell)
  float halo = exp(-max(dpx, 0.0) / (4.0 + 0.5 * r)) * (1.0 - smoothstep(0.45 * uSpread, uSpread, d)) * 0.09;
  o = vec4(vCol * (cov + halo) * norm, 1.0);
}`;

export const DUST_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec4 aP;      // position, radius (world)
layout(location = 1) in vec4 aQ;      // phase, brightness, warmth, drift
uniform mat4 uView, uProj;
uniform float uT, uK, uDf, uFpx, uMaxPt, uGain;
out vec3 vCol;
out float vRad, vSize;
void main() {
  float ph = aQ.x;
  vec3 p = aP.xyz + vec3(0.30 * sin(0.21 * uT + ph),
                         0.22 * sin(0.17 * uT + 2.0 * ph) + 0.12 * uT * (aQ.w - 0.5),
                         0.25 * sin(0.13 * uT + 3.0 * ph));
  vec4 vp = uView * vec4(p, 1.0);
  float z = -vp.z;
  vCol = vec3(0.0); vRad = 0.0; vSize = 1.0;
  if (z < 0.8) { gl_Position = vec4(0.0, 0.0, -2.0, 1.0); gl_PointSize = 1.0; return; }
  gl_Position = uProj * vp;
  float core = uFpx * aP.w / z;                         // the mote's own radius on screen (px)
  float coc = uK * abs(1.0 / z - 1.0 / uDf);
  float rad = max(core, 0.6) + coc;
  float size = min(2.0 * rad + 3.0, uMaxPt);
  rad = min(rad, size * 0.5 - 1.0);
  float e = min(1.0, (core + 0.35) * (core + 0.35) / (rad * rad));   // a defocused mote spreads the same light
  float fog = exp(-max(length(vp.xyz) - 16.0, 0.0) * 0.017);
  float tw = 0.75 + 0.25 * sin(uT * (1.1 + aQ.w) + ph * 5.0);
  vec3 col = mix(vec3(0.60, 0.68, 1.0), vec3(1.0, 0.80, 0.55), aQ.z);
  vCol = col * aQ.y * e * fog * tw * uGain * smoothstep(0.8, 2.0, z);
  vRad = rad; vSize = size;
  gl_PointSize = size;
}`;

export const DUST_FS = `#version 300 es
precision highp float;
in vec3 vCol;
in float vRad, vSize;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5) * vSize;
  float disc = 1.0 - smoothstep(vRad - 0.9, vRad + 0.5, d);
  float rim = smoothstep(vRad - 3.0, vRad - 0.6, d) * step(4.0, vRad) * 0.35;   // a lens bokeh's brighter rim
  o = vec4(vCol * disc * (1.0 + rim), 1.0);
}`;

const NOISE = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.03 + 5.1; a *= 0.5; } return s; }`;

export const SKY_FS = `#version 300 es
precision highp float;
uniform vec2 uEye;                    // the confluence (stage px, y down)
uniform float uC, uT;
out vec4 o;
${NOISE}
void main() {
  vec2 fc = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);
  vec3 col = mix(vec3(0.012, 0.012, 0.034), vec3(0.003, 0.003, 0.011), fc.y / 1920.0);
  vec2 e = (fc - uEye) / 1080.0;
  float r2 = dot(e, e);
  col += vec3(0.060, 0.042, 0.095) * exp(-r2 * 6.0) * (0.35 + 0.65 * uC);
  col += vec3(0.085, 0.060, 0.080) * exp(-r2 * 38.0) * uC;
  float n = fbm(fc / 1080.0 * 2.2 + vec2(0.012 * uT, -0.008 * uT) + 3.1);
  float m = fbm(fc / 1080.0 * 4.1 - vec2(0.006 * uT, 0.01 * uT) + 9.7);
  col += vec3(0.020, 0.013, 0.044) * smoothstep(0.42, 0.95, n) + vec3(0.006, 0.010, 0.022) * smoothstep(0.5, 0.9, m);
  o = vec4(col, 1.0);
}`;

// 4 bilinear taps = a 4×4 box
export const DOWN_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 px;
out vec4 o;
void main() {
  o = vec4(0.25 * (texture(src, uv + px * vec2(-1, -1)).rgb + texture(src, uv + px * vec2(1, -1)).rgb
                 + texture(src, uv + px * vec2(-1, 1)).rgb + texture(src, uv + px * vec2(1, 1)).rgb), 1.0);
}`;

// 13-tap separable gaussian (linear sampling)
export const BLUR_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 dir;
out vec4 o;
void main() {
  vec3 c = texture(src, uv).rgb * 0.1964825501511404;
  c += (texture(src, uv + dir * 1.411764705882353).rgb + texture(src, uv - dir * 1.411764705882353).rgb) * 0.2969069646728344;
  c += (texture(src, uv + dir * 3.2941176470588234).rgb + texture(src, uv - dir * 3.2941176470588234).rgb) * 0.09447039785044732;
  c += (texture(src, uv + dir * 5.176470588235294).rgb + texture(src, uv - dir * 5.176470588235294).rgb) * 0.010381362401148057;
  o = vec4(c, 1.0);
}`;

export const FINAL_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uScene, uBloomA, uBloomB;
uniform float uExpo, uFrame, uBloom;
out vec4 o;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec2 fc = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);
  vec3 c = texture(uScene, uv).rgb + (texture(uBloomA, uv).rgb * 0.42 + texture(uBloomB, uv).rgb * 0.55) * uBloom;
  c *= uExpo;
  c = 1.0 - exp(-c * 1.2);
  // cool the shadows a touch, keep the gold warm
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c * vec3(0.92, 0.95, 1.08), c, smoothstep(0.05, 0.4, l));
  float v = length((fc - vec2(540.0, 900.0)) / vec2(820.0, 1300.0));
  c *= 1.0 - 0.5 * smoothstep(0.35, 1.25, v);
  c += (hash(fc + uFrame * 7.13) - 0.5) * (1.6 / 255.0);
  o = vec4(max(c, 0.0), 1.0);
}`;
