/*
 * 60 · 말랑한 글자 — two huge gummy letters, 말 and 랑, drop onto a glossy table in a pastel studio, squash, bounce,
 * squeeze against each other, hop and jiggle as one when the table is tapped twice, and settle.
 *
 *   setup()   Pretendard Black outlines (opentype.js) → soft-body meshes (mesh.js: even boundary + jittered interior,
 *             Delaunay, solid/ghost triangles) → XPBD bake at 60 fps (sim.js, ≈ 1 s) → WebGL2 resources.
 *   frame(t)  interpolate the two nearest baked frames → draw the deformed triangles into a coverage target (one
 *             channel per letter) + a rest-coordinate target → blur the coverage twice (σ 8 px at ½ res, σ ≈ 29 px
 *             at ¼ res) → one full-screen pass turns the blurred coverage into a rounded height field and shades
 *             candy: Beer–Lambert transmission of the refracted set (long paths at the rim → darker rims),
 *             inner glow, Fresnel + studio softbox reflections, air bubbles that ride with the jelly, coloured
 *             caustic shadows on the backdrop, contact occlusion and a glossy reflection on the table.
 */
import { defineDemo, rand, track, ease, clamp, lerp, ramp } from '../_lib/stage.js';
import { loadOutlineFont, outlineContours } from '../_lib/type.js';
import { buildScene, WORLD, D, FLOOR_Y, TAPS, tableLift } from './scene.js';
import { bakeJelly } from './sim.js';

const FPS_BAKE = 60;
const PIVOT = [540, 1010];
const zoomOf = track([[0, 1.0], [D, 1.03, ease.inOutCubic]]);
const fadeOf = (t) => ramp(t, 0, 0.45) * (1 - ramp(t, D - 0.4, D));
// the key softbox drifts a little in the afterglow so the highlights glide along the bevels
const keyAz = track([[0, -0.50], [5.6, -0.50], [D, -0.30, ease.inOutCubic]]);
const keyEl = track([[0, 0.62], [5.6, 0.62], [D, 0.66, ease.inOutCubic]]);

const srgbToLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const norm3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / l); };
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// ---------- GLSL ----------
const MESH_VS = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aRest;
layout(location = 2) in float aCh;
uniform vec2 pivot, camOff;
uniform float zoom;
out vec2 vRest;
flat out int vCh;
void main() {
  vec2 s = (aPos - pivot) * zoom + pivot + camOff;
  gl_Position = vec4(s.x / 540.0 - 1.0, 1.0 - s.y / 960.0, 0.0, 1.0);
  vRest = aRest; vCh = int(aCh + 0.5);
}`;
const MESH_FS = `#version 300 es
precision highp float;
in vec2 vRest;
flat in int vCh;
layout(location = 0) out vec4 oA;
layout(location = 1) out vec4 oC;
void main() {
  vec4 m = vec4(0.0); m[vCh] = 1.0;
  oA = m;
  // rest (material) coordinates, 1/32 px, packed into two 16-bit values
  vec2 v = floor(clamp(vRest, 0.0, 2047.0) * 32.0);
  vec2 hi = floor(v / 256.0), lo = v - hi * 256.0;
  oC = vec4(hi.x, lo.x, hi.y, lo.y) / 255.0;
}`;
const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
// separable Gaussian; the destination may be half the source size (then each tap reads a 2×2 average)
const BLUR_FS = `#version 300 es
precision highp float;
uniform sampler2D src;
uniform vec2 dstSize, stepUV;
uniform float sigma;
uniform int radius;
out vec4 o;
void main() {
  vec2 uv = gl_FragCoord.xy / dstSize;
  vec4 acc = vec4(0.0); float ws = 0.0;
  for (int k = -radius; k <= radius; k++) {
    float w = exp(-0.5 * float(k * k) / (sigma * sigma));
    acc += texture(src, uv + stepUV * float(k)) * w; ws += w;
  }
  o = acc / ws;
}`;

const FINAL_FS = `#version 300 es
precision highp float;
uniform sampler2D hA, qA, tC;
uniform vec3 col0, col1, col2, col3;      // linear transmission colour of each coverage channel
uniform float floorS, keyI, fade, time;
uniform vec3 keyDir, keyRight, keyUp, keyCol, rimDir;
out vec4 o;

const vec2 RES = vec2(1080.0, 1920.0);
const float SIG = 8.0;          // σ (px) of hA: turns blurred coverage back into a distance to the outline
const float BEV = 26.0;         // radius of the rounded bevel (px)
const float DOME = 30.0;        // extra height of the broad dome from the wide blur (px)

vec2 uvS(vec2 s) { return vec2(s.x, RES.y - s.y) / RES; }
vec4 HA(vec2 s) { return texture(hA, uvS(s)); }
vec4 QA(vec2 s) { return texture(qA, uvS(s)); }
float sum4(vec4 v) { return v.x + v.y + v.z + v.w; }
// blurred coverage b of a straight edge is Φ(d/σ); logistic inverse → signed distance inside (px)
vec4 dist4(vec4 b) { b = clamp(b, 0.0015, 0.9985); return (SIG / 1.702) * log(b / (1.0 - b)); }
vec3 chanCol(vec4 w) { return (w.x * col0 + w.y * col1 + w.z * col2 + w.w * col3) / max(sum4(w), 1e-4); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 hash32(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yzz) * p3.zyx); }
float pow5(float x) { float x2 = x * x; return x2 * x2 * x; }

// ---- the set: lilac backdrop with a soft window of sun, curving (cove) into a warm, glossy table ----
const vec3 WALL_HI = vec3(0.735, 0.700, 0.815), WALL_LO = vec3(0.845, 0.775, 0.815);
const vec3 FLR_FAR = vec3(0.860, 0.770, 0.755), FLR_NEAR = vec3(0.700, 0.590, 0.590);
float windowLight(vec2 s) {
  // a four-pane window thrown onto the wall from the upper left (sheared parallelogram, soft edges)
  vec2 p = s - vec2(330.0, 520.0);
  p = vec2(p.x - 0.32 * p.y, p.y);
  vec2 a = abs(p);
  float frame = (1.0 - smoothstep(250.0, 300.0, a.x)) * (1.0 - smoothstep(300.0, 350.0, a.y));
  float bars = smoothstep(6.0, 22.0, a.x) * smoothstep(6.0, 22.0, a.y);
  return frame * bars;
}
vec3 backdrop(vec2 s) {
  float yh = floorS - 150.0;
  vec3 wall = mix(WALL_HI, WALL_LO, smoothstep(0.0, 1.0, clamp(s.y / yh, 0.0, 1.0)));
  vec2 lp = (s - vec2(240.0, 560.0)) / vec2(980.0, 1200.0);
  wall *= 0.84 + 0.26 * exp(-dot(lp, lp) * 1.5);
  wall *= mix(vec3(1.0), vec3(1.30, 1.22, 1.08), windowLight(s) * keyI);
  float fy = clamp((s.y - yh) / (RES.y - yh), 0.0, 1.0);
  vec3 flr = mix(FLR_FAR, FLR_NEAR, smoothstep(0.0, 1.0, fy));
  vec2 fp = (s - vec2(430.0, floorS + 40.0)) / vec2(820.0, 380.0);
  flr *= 0.86 + 0.24 * exp(-dot(fp, fp));
  return mix(wall, flr, smoothstep(yh - 80.0, yh + 100.0, s.y));
}
// how much key light reaches a point of the set behind the letters: a shadow coloured by the jelly it passed
// through, darkest at the jelly's edges and focused into a bright caustic under its thick middle
vec3 keyVis(vec2 s) {
  float back = floorS - s.y;
  if (back <= 0.0) return vec3(1.0);
  back = min(back, 150.0);
  vec2 q = s - vec2(0.50, 0.40) * back;
  float pen = smoothstep(4.0, 100.0, back);
  vec4 c = mix(HA(q), QA(q), pen);
  float sh = clamp(sum4(c), 0.0, 1.0);
  if (sh < 0.003) return vec3(1.0);
  vec3 jc = chanCol(c);
  float core = smoothstep(0.55, 0.98, sum4(QA(q)));
  return mix(vec3(1.0), jc * sqrt(jc) * (0.30 + 1.30 * core), sh);
}
float contactAO(vec2 s) {
  float dy = abs(s.y - floorS);
  float a = sum4(HA(vec2(s.x, floorS - 5.0))), b = sum4(QA(vec2(s.x, floorS - 30.0)));
  return clamp(1.0 - 0.55 * a * exp(-dy / 9.0) - 0.30 * b * exp(-dy / 48.0), 0.0, 1.0);
}
vec3 litSet(vec2 s) {
  return backdrop(s) * (0.60 + 0.50 * keyI * keyVis(s)) * contactAO(s);
}
// the table is glossy: a soft, fading mirror image of the gummies in front of them
vec3 tableReflection(vec2 s, vec3 base) {
  float dy = s.y - floorS;
  if (dy <= 0.0) return base;
  vec2 m = vec2(s.x, floorS - dy);
  vec4 c = mix(HA(m), QA(m), smoothstep(0.0, 170.0, dy));
  float a = clamp(sum4(c), 0.0, 1.0) * 0.42 * exp(-dy / 150.0);
  return mix(base, chanCol(c) * 0.80 + 0.02, a);
}
// the studio as seen in reflections: dim room, the key softbox, a tall strip light at the back right
vec3 studio(vec3 r) {
  vec3 c = mix(vec3(0.30, 0.25, 0.27), vec3(0.62, 0.60, 0.70), smoothstep(-0.35, 0.45, r.y)) * 0.55;
  float w = dot(r, keyDir);
  if (w > 0.2) {
    vec2 q = vec2(dot(r, keyRight), dot(r, keyUp)) / w;
    float box = (1.0 - smoothstep(0.24, 0.31, abs(q.x))) * (1.0 - smoothstep(0.15, 0.21, abs(q.y)));
    c += keyCol * keyI * box * 30.0;
  }
  float w2 = dot(r, rimDir);
  if (w2 > 0.2) {
    vec3 up = vec3(0.0, 1.0, 0.0), rt = normalize(cross(rimDir, up)), u2 = cross(rt, rimDir);
    vec2 q = vec2(dot(r, rt), dot(r, u2)) / w2;
    float strip = (1.0 - smoothstep(0.05, 0.09, abs(q.x))) * (1.0 - smoothstep(0.55, 0.75, abs(q.y)));
    c += vec3(0.85, 0.92, 1.0) * strip * 9.0;
  }
  return c;
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, RES.y - gl_FragCoord.y);
  vec3 col = tableReflection(s, litSet(s));

  vec4 A0 = HA(s);
  vec4 D = dist4(A0);
  float dm = max(max(D.x, D.y), max(D.z, D.w));
  float alpha = clamp(dm + 0.5, 0.0, 1.0);
  if (alpha > 0.0) {
    // the letter owning this pixel: the channel deepest inside
    vec4 m = step(vec4(dm - 1e-3), D);
    m /= max(sum4(m), 1.0);
    // rounded bevel from the distance, plus a broad dome from the wide blur
    const float E = 1.5;
    vec2 gd = vec2(dot(dist4(HA(s + vec2(E, 0.0))) - dist4(HA(s - vec2(E, 0.0))), m),
                   dot(dist4(HA(s + vec2(0.0, E))) - dist4(HA(s - vec2(0.0, E))), m)) / (2.0 * E);
    float u = clamp(dm / BEV, 0.0, 1.0), w = 1.0 - u, sq = sqrt(max(1.0 - w * w, 0.0));
    float hb = BEV * sq, hp = min(w / max(sq, 1e-3), 5.0);
    vec4 Q0 = QA(s);
    float gq = dot(Q0, m);
    vec2 gg = vec2(dot(QA(s + vec2(5.0, 0.0)) - QA(s - vec2(5.0, 0.0)), m), dot(QA(s + vec2(0.0, 5.0)) - QA(s - vec2(0.0, 5.0)), m)) / 10.0;
    vec2 gh = hp * gd + DOME * gg;
    float hTot = hb + DOME * gq;
    vec3 N = normalize(vec3(-gh.x, gh.y, 1.0));          // x right, y up, z toward the viewer
    float nz = clamp(N.z, 0.0, 1.0);

    // refraction: a magnifying lens — look a little toward the middle of the stroke
    vec2 nS = vec2(N.x, -N.y);
    vec3 bgR = litSet(s - nS * (16.0 + 0.8 * hTot));
    // Beer–Lambert: the path through the gummy is longest at the rim (grazing view) → darker, deeper colour there
    vec3 C = chanCol(m);
    vec3 sig = -log(max(C * 0.88, vec3(0.003))) / 46.0;
    float path = 30.0 + 18.0 * gq + 72.0 * (1.0 - nz);
    vec3 trans = exp(-sig * path);
    // inner glow: light scattered inside, stronger where the body is thick
    vec3 glow = C * keyCol * keyI * (0.08 + 0.22 * gq);
    float F = 0.04 + 0.96 * pow5(1.0 - nz);
    vec3 r = vec3(2.0 * nz * N.x, 2.0 * nz * N.y, 2.0 * nz * nz - 1.0);
    vec3 env = studio(r);
    vec3 H = normalize(keyDir + vec3(0.0, 0.0, 1.0));
    float nh = max(dot(N, H), 0.0), nh2 = nh * nh, nh4 = nh2 * nh2, nh16 = nh4 * nh4 * nh4 * nh4, nh64 = nh16 * nh16 * nh16 * nh16;
    // the other letter pressing against this one: a soft crease
    float occ = 1.0 - 0.35 * smoothstep(0.0, 0.6, sum4(Q0 * (1.0 - m)));
    vec3 jel = (1.0 - F) * (bgR * trans + glow) * occ + F * env + keyCol * keyI * nh64 * 0.6;

    // air bubbles, fixed in the jelly's own (rest) coordinates so they ride and squash with it
    vec4 cc = texelFetch(tC, ivec2(gl_FragCoord.xy), 0);
    if (cc.r + cc.g + cc.b + cc.a > 0.0) {
      vec2 mc = vec2(cc.r * 65280.0 + cc.g * 255.0, cc.b * 65280.0 + cc.a * 255.0) / 32.0;
      float vis = smoothstep(8.0, 20.0, dm);
      vec2 cell = floor(mc / 44.0);
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 c = cell + vec2(float(i), float(j));
        vec3 hh = hash32(c + 17.0);
        if (hh.x > 0.17) continue;
        float rad = 2.2 + 5.0 * hh.z * hh.z;
        vec2 ctr = (c + 0.2 + 0.6 * vec2(hh.y, fract(hh.z * 7.31))) * 44.0;
        vec2 dv = mc - ctr;
        float dd = length(dv);
        if (dd > rad + 1.5) continue;
        float ring = (1.0 - smoothstep(rad - 0.6, rad + 0.6, dd)) * smoothstep(rad - 2.2, rad - 1.0, dd);
        float inner = 1.0 - smoothstep(rad - 1.5, rad - 0.5, dd);
        float glint = 1.0 - smoothstep(0.0, max(rad * 0.35, 0.8), length(dv + vec2(0.35, 0.35) * rad));
        jel = mix(jel, jel * 0.45, ring * vis * 0.8);
        jel += (C * 0.12 * inner + vec3(0.9) * glint * 0.55) * vis;
      }
    }
    col = mix(col, jel, alpha);
  }

  // grade: soft shoulder, sRGB, a breath of vignette and grain, fade from / to the cream of the set
  col = max(col, 0.0);
  col = 1.0 - exp(-col * 1.22);
  col = pow(col, vec3(1.0 / 2.2));
  vec2 q = s / RES - 0.5;
  col *= 1.0 - 0.16 * smoothstep(0.35, 0.95, length(q * vec2(1.0, 0.75)) * 1.4);
  col += (hash12(gl_FragCoord.xy + fract(time * 7.13) * 91.0) - 0.5) / 255.0 * 1.6;
  col = mix(vec3(0.93, 0.91, 0.93), col, fade);
  o = vec4(col, 1.0);
}`;

defineDemo({
  id: '60-jelly-type',
  title: '말랑한 글자',
  tech: 'XPBD 연체(거리·면적 제약) · 글리프 외곽선 삼각분할 · 충돌',
  duration: D,
  background: '#ece6ee',

  async setup({ canvas }) {
    // ---- outlines → meshes → bake ----
    const font = await loadOutlineFont('Pretendard-Black');
    const letters = buildScene((ch, size) => outlineContours(font, ch, 0, 0, size)[0].contours, rand);
    const t0 = performance.now();
    const bake = bakeJelly(letters, WORLD, { fps: FPS_BAKE, duration: D });
    console.log(`60-jelly-type: ${bake.N} particles, bake ${(performance.now() - t0).toFixed(0)} ms, ${(bake.frames.byteLength / 1e6).toFixed(1)} MB`);
    const { frames, nFrames, N } = bake;
    // camera dips: each landing and each tap gives the frame a tiny, quickly damped jolt
    const jolts = [
      ...bake.landed.filter(Boolean).map((L) => [L.t, 5.5 * Math.min(1, L.vy / 2500)]),
      ...TAPS.map(([t, a]) => [t, a * 0.22]),
    ];
    this.camDip = (t) => {
      let y = 0;
      for (const [tk, a] of jolts) { const s = t - tk; if (s > 0 && s < 0.6) y += a * Math.exp(-s / 0.11) * Math.sin(2 * Math.PI * 6 * s); }
      return y;
    };

    // ---- GL ----
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const floatOK = !!gl.getExtension('EXT_color_buffer_float');
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(sh));
      return sh;
    };
    const program = (vs, fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const P = { mesh: program(MESH_VS, MESH_FS), blur: program(QUAD_VS, BLUR_FS), fin: program(QUAD_VS, FINAL_FS) };

    const tex = (w, h, internal, format, type, linear) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const fbo = (texs) => {
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      texs.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
      gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return f;
    };
    // blurred coverage: half float (smooth normals need more than 8 bits), linear filtering
    const F16 = floatOK ? [gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT] : [gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE];
    const target = (w, h) => { const t = tex(w, h, ...F16, true); return { t, f: fbo([t]), w, h }; };
    const tA = tex(1080, 1920, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, true);
    const tC = tex(1080, 1920, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, false);
    const fMesh = fbo([tA, tC]);
    const h1 = target(540, 960), h2 = target(540, 960), q1 = target(270, 480), q2 = target(270, 480);

    // ---- mesh buffers (one draw for every letter) ----
    const rest = new Float32Array(N * 2), chan = new Float32Array(N), idx = [];
    letters.forEach((L, l) => {
      const p0 = bake.LP0[l], m = L.mesh;
      for (let i = 0; i < m.pts.length / 2; i++) { rest[(p0 + i) * 2] = m.pts[i * 2]; rest[(p0 + i) * 2 + 1] = m.pts[i * 2 + 1]; chan[p0 + i] = L.chan; }
      for (let k = 0; k < m.tris.length; k++) idx.push(p0 + m.tris[k]);
    });
    const pos = new Float32Array(N * 2);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vb = (data, loc, size, usage) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return b;
    };
    const posBuf = vb(pos, 0, 2, gl.DYNAMIC_DRAW);
    vb(rest, 1, 2, gl.STATIC_DRAW);
    vb(chan, 2, 1, gl.STATIC_DRAW);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, N > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), gl.STATIC_DRAW);
    const idxType = N > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, idxCount = idx.length;
    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // per-channel colours (linear)
    const chCol = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const L of letters) chCol[L.chan] = L.rgb.map(srgbToLin);

    const blur = (srcTex, dst, step, sigma) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f);
      gl.viewport(0, 0, dst.w, dst.h);
      gl.useProgram(P.blur.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.uniform1i(P.blur.u.src, 0);
      gl.uniform2f(P.blur.u.dstSize, dst.w, dst.h);
      gl.uniform2f(P.blur.u.stepUV, step[0] / dst.w, step[1] / dst.h);
      gl.uniform1f(P.blur.u.sigma, sigma);
      gl.uniform1i(P.blur.u.radius, Math.ceil(sigma * 2.6));
      gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    this.render = (t) => {
      // 1 · the jelly at time t: blend the two nearest baked frames
      const ft = clamp(t * FPS_BAKE, 0, nFrames - 1), f0 = Math.floor(ft), f1 = Math.min(f0 + 1, nFrames - 1), k = ft - f0;
      const A = f0 * N * 2, B = f1 * N * 2;
      for (let i = 0; i < N * 2; i++) pos[i] = frames[A + i] + (frames[B + i] - frames[A + i]) * k;
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
      const zoom = zoomOf(t), dip = this.camDip(t);
      const floorS = (FLOOR_Y - tableLift(t) - PIVOT[1]) * zoom + PIVOT[1] + dip;

      // 2 · coverage (one channel per letter) + rest coordinates
      gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fMesh);
      gl.viewport(0, 0, 1080, 1920);
      gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);
      gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0]);
      gl.useProgram(P.mesh.p);
      gl.uniform2f(P.mesh.u.pivot, PIVOT[0], PIVOT[1]);
      gl.uniform2f(P.mesh.u.camOff, 0, dip);
      gl.uniform1f(P.mesh.u.zoom, zoom);
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, idxCount, idxType, 0);

      // 3 · blur: ½ res σ 4 (= 8 px), then ¼ res σ 7 (≈ 29 px in all)
      blur(tA, h1, [1, 0], 4); blur(h1.t, h2, [0, 1], 4);
      blur(h2.t, q1, [1, 0], 7); blur(q1.t, q2, [0, 1], 7);

      // 4 · shade
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, 1080, 1920);
      gl.useProgram(P.fin.p);
      const u = P.fin.u;
      [[h2.t, 'hA'], [q2.t, 'qA'], [tC, 'tC']].forEach(([tx, name], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx); gl.uniform1i(u[name], i); });
      gl.uniform3fv(u.col0, chCol[0]); gl.uniform3fv(u.col1, chCol[1]); gl.uniform3fv(u.col2, chCol[2]); gl.uniform3fv(u.col3, chCol[3]);
      const az = keyAz(t), el = keyEl(t);
      const keyDir = norm3([Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]);
      const keyRight = norm3(cross3(keyDir, [0, 1, 0])), keyUp = cross3(keyRight, keyDir);
      gl.uniform3fv(u.keyDir, keyDir); gl.uniform3fv(u.keyRight, keyRight); gl.uniform3fv(u.keyUp, keyUp);
      gl.uniform3fv(u.rimDir, norm3([0.80, 0.30, 0.52]));
      gl.uniform3fv(u.keyCol, [1.0, 0.96, 0.9]);
      gl.uniform1f(u.keyI, lerp(0.85, 1.0, ramp(t, 0, 0.8)));
      gl.uniform1f(u.floorS, floorS);
      gl.uniform1f(u.fade, fadeOf(t));
      gl.uniform1f(u.time, t);
      gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    };
  },
  frame(t) {
    this.render(t);
  },
});
