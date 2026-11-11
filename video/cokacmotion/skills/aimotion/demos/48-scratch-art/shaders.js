/*
 * 48-scratch-art/shaders.js — scratch mask (instanced capsules, MAX blend), board/wax/rainbow composite,
 * wax crumbs (instanced flakes), and the tools (stylus, hake brush) with their shadows.
 * World = stage px, y down, z toward the viewer.
 */
export const COMMON = `
precision highp float;
uniform vec2 u_res, u_cam;
uniform float u_zoom, u_t, u_tau, u_fade;
uniform vec3 u_lamp;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
vec4 toClip(vec2 w) { vec2 s = (w - u_cam) * u_zoom + 0.5 * u_res; return vec4(s.x / u_res.x * 2.0 - 1.0, 1.0 - s.y / u_res.y * 2.0, 0.0, 1.0); }
vec3 tonemap(vec3 c) {
  c = max(c, vec3(0.0));
  c = c * (2.51 * c + 0.03) / (c * (2.43 * c + 0.59) + 0.14);
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
}
`;
const FRAG = `
vec2 worldAt() { vec2 sp = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y); return u_cam + (sp - 0.5 * u_res) / u_zoom; }
float vign() { vec2 vq = (gl_FragCoord.xy / u_res - 0.5) * vec2(1.0, 1.2); return 1.0 - 0.5 * clamp(dot(vq, vq) * 1.2, 0.0, 1.0); }
`;

// ---------------------------------------------------------------- 1. the scratch mask
export const MASK_VS = `#version 300 es
${COMMON}
layout(location = 0) in vec2 a_q;
layout(location = 1) in vec4 i_p;     // p0, p1
layout(location = 2) in vec4 i_w;     // width at p0, width at p1, τ0, τ1
layout(location = 3) in vec2 i_s;     // stroke seed, pressure
out vec2 v_world;
flat out vec4 v_seg;
flat out vec2 v_w;
flat out vec2 v_s;
void main() {
  float e = clamp((u_tau - i_w.z) / max(i_w.w - i_w.z, 1e-5), 0.0, 1.0);
  vec2 A = i_p.xy, B = mix(i_p.xy, i_p.zw, e);
  float w1 = mix(i_w.x, i_w.y, e);
  vec2 d = B - A;
  float L = length(d);
  vec2 T = L > 1e-4 ? d / L : vec2(1.0, 0.0), N = vec2(-T.y, T.x);
  float ext = 0.5 * max(i_w.x, w1) + 5.0;
  vec2 P = A + T * (a_q.x * (L + 2.0 * ext) - ext) + N * a_q.y * ext;
  v_world = P; v_seg = vec4(A, B); v_w = vec2(i_w.x, w1); v_s = i_s;
  gl_Position = toClip(P);
}`;
export const MASK_FS = `#version 300 es
${COMMON}
in vec2 v_world;
flat in vec4 v_seg;
flat in vec2 v_w;
flat in vec2 v_s;
out vec4 o;
void main() {
  vec2 A = v_seg.xy, B = v_seg.zw, pa = v_world - A, ba = B - A;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float r = 0.5 * mix(v_w.x, v_w.y, h);
  float d = length(pa - ba * h);
  // the wax does not cut clean: a ragged edge, and flakes that break off beyond it
  float n1 = vnoise(v_world * 0.55) - 0.5, n2 = vnoise(v_world * 1.7 + 17.0) - 0.5;
  float chip = smoothstep(0.6, 0.86, vnoise(v_world * 0.17 + 31.0)) * (0.6 + 0.8 * vnoise(v_world * 0.6));
  float rr = r + n1 * 1.4 + n2 * 0.8 + chip * 3.2 * (0.6 + 0.4 * v_s.y);
  float cov = clamp(rr - d + 0.5, 0.0, 1.0);
  // where the point skipped, specks of wax stay in the groove
  float speck = smoothstep(0.80, 0.9, vnoise(v_world * 0.95 + 5.0)) * clamp(1.25 - v_s.y, 0.0, 1.0);
  cov *= 1.0 - 0.85 * speck * clamp(r - d, 0.0, 1.0);
  if (cov <= 0.0) discard;
  float depth = cov * (0.45 + 0.55 * v_s.y) * clamp((r * 1.1 - d) / max(r, 0.5), 0.0, 1.0);
  o = vec4(cov, depth, 0.0, 1.0);
}`;

// ---------------------------------------------------------------- 2. board, wax, rainbow paper, table
export const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const BOARD_FS = `#version 300 es
${COMMON}
${FRAG}
uniform sampler2D u_mask;
uniform vec4 u_board;
out vec4 o;
const vec3 PAL[7] = vec3[7](vec3(1.0, 0.16, 0.36), vec3(1.0, 0.50, 0.12), vec3(1.0, 0.84, 0.18), vec3(0.28, 0.85, 0.42),
                            vec3(0.10, 0.78, 0.92), vec3(0.20, 0.38, 1.0), vec3(0.62, 0.26, 1.0));
vec3 rainbow(vec2 w) {
  float h = dot(w, vec2(0.36, 0.93)) / 1250.0 + 0.10 * sin(w.x / 210.0 + w.y / 330.0) + 0.05 * vnoise(w / 160.0);
  float x = fract(h) * 7.0;
  int i = min(int(floor(x)), 6);
  float f = smoothstep(0.0, 1.0, fract(x));
  vec3 c = mix(PAL[i], PAL[(i + 1) % 7], f);
  return pow(c, vec3(2.2));    // the printed colours are sRGB
}
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 w = worldAt();
  vec2 uv = gl_FragCoord.xy / u_res;
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec2 bc = 0.5 * (u_board.xy + u_board.zw), bh = 0.5 * (u_board.zw - u_board.xy);
  float bd = sdBox(w - bc, bh, 7.0);
  float pxw = 1.0 / u_zoom;
  vec3 L = normalize(u_lamp - vec3(w, 0.0));
  vec3 H = normalize(L + V);
  float lampFall = 0.55 + 0.45 * exp(-dot(w - u_lamp.xy, w - u_lamp.xy) / (1700.0 * 1700.0));
  vec3 lampC = vec3(1.0, 0.95, 0.86) * 1.15 * lampFall;
  vec3 col;
  if (bd > 0.0) {
    // the table: dark walnut, the board's shadow on it
    float g = vnoise(vec2(w.x * 0.012, w.y * 0.35)) * 0.6 + 0.4 * vnoise(vec2(w.x * 0.05, w.y * 1.4));
    vec3 wood = mix(vec3(0.045, 0.024, 0.014), vec3(0.11, 0.062, 0.034), g);
    vec2 off = -L.xy / max(L.z, 0.25) * 6.0;
    float sh = 1.0 - 0.75 * (1.0 - smoothstep(-4.0, 10.0, sdBox(w - off - bc, bh, 7.0)));
    float spw = pow(max(dot(normalize(vec3((g - 0.5) * 0.2, 0.0, 1.0)), H), 0.0), 30.0) * 0.12;
    col = (wood * (0.12 + 0.9 * max(L.z, 0.0)) + spw) * lampC * sh;
  } else {
    float m = texture(u_mask, uv).r, dep = texture(u_mask, uv).g;
    // wax relief from the mask: bevel normals (fine taps) and the pushed-up lip around a cut (wide taps)
    vec2 px = 1.6 / u_res;
    float hl = 1.0 - texture(u_mask, uv - vec2(px.x, 0.0)).r, hr = 1.0 - texture(u_mask, uv + vec2(px.x, 0.0)).r;
    float hd = 1.0 - texture(u_mask, uv - vec2(0.0, px.y)).r, hu = 1.0 - texture(u_mask, uv + vec2(0.0, px.y)).r;
    vec2 grad = vec2(hr - hl, -(hu - hd)) * 0.5;      // world y is down
    float mw = 0.0;
    for (int k = 0; k < 8; k++) { float a = float(k) * 0.785398; mw += texture(u_mask, uv + vec2(cos(a), sin(a)) * 4.2 / u_res).r; }
    mw /= 8.0;
    float lip = clamp(mw - m, 0.0, 1.0) * (1.0 - m);
    // the wax coat: brush streaks from coating, orange-peel, the lip and the cut bevel
    vec2 streak = vec2((vnoise(vec2(w.x * 0.9, w.y * 0.012)) - 0.5) * 0.05, (vnoise(vec2(w.x * 0.008, w.y * 0.5)) - 0.5) * 0.05);
    vec2 peel = (vec2(vnoise(w * 0.35), vnoise(w * 0.35 + 9.0)) - 0.5) * 0.06;
    vec3 nw = normalize(vec3(-grad * 2.4 + streak + peel - grad * lip * 2.0, 1.0));
    float ndh = max(dot(nw, H), 0.0);
    vec3 wax = vec3(0.012, 0.012, 0.014) * (0.3 + 0.7 * max(dot(nw, L), 0.0)) * lampC;
    wax += lampC * (pow(ndh, 28.0) * 0.07 + pow(ndh, 220.0) * 0.5 + pow(ndh, 60.0) * 0.6 * length(grad) + lip * pow(ndh, 18.0) * 0.08);
    // the paper under it: rainbow ink on card, fibres, a little burnish where the point pressed
    vec3 paper = rainbow(w);
    float fib = vnoise(vec2(w.x * 0.8, w.y * 0.08)) * 0.5 + vnoise(w * 0.45) * 0.5;
    paper *= 0.86 + 0.2 * fib;
    paper = mix(paper, paper * 1.25 + 0.03, dep * 0.35);
    // the cut wall shades the groove on the side away from the lamp
    vec2 toL = normalize(L.xy + 1e-5) * 2.2 / u_res * vec2(1.0, -1.0);
    float wallT = 1.0 - texture(u_mask, uv + toL).r;
    float wallF = 1.0 - texture(u_mask, uv + toL * 2.2).r;
    float shade = 1.0 - 0.55 * wallT - 0.2 * wallF;
    vec3 pcol = paper * lampC * (0.18 + 0.82 * max(L.z, 0.0)) * shade * (1.0 - 0.25 * (1.0 - smoothstep(0.4, 1.0, m)));
    col = mix(wax, pcol, m);
    // the board edge: card thickness, chipped coating
    float edge = 1.0 - smoothstep(-3.0, -0.5, bd);
    float ew = 1.0 - smoothstep(-3.0 - 2.0 * vnoise(w * 0.3), -1.0, bd);
    col = mix(vec3(0.5, 0.48, 0.44) * lampC * 0.6, col, 1.0 - (1.0 - ew) * 0.85);
  }
  col *= vign();
  vec3 outc = tonemap(col) * u_fade;
  outc += (hash12(gl_FragCoord.xy + fract(u_t * 7.0) * 113.0) - 0.5) / 255.0;
  o = vec4(outc, 1.0);
}`;

// ---------------------------------------------------------------- 3. crumbs of wax
export const CRUMB_VS = `#version 300 es
${COMMON}
layout(location = 0) in vec2 a_q;
layout(location = 1) in vec4 i_pos;   // rest x, y, spawn x, y
layout(location = 2) in vec4 i_shp;   // size, elongation, rotation, seed
layout(location = 3) in vec4 i_mv;    // τ born, brush hit time, kick vx, vy
out vec2 v_q;
flat out vec4 v_shp;
flat out vec2 v_blur;
void main() {
  float e = clamp((u_tau - i_mv.x) / 0.05, 0.0, 1.0);
  e = 1.0 - (1.0 - e) * (1.0 - e) * (1.0 - e);
  vec2 P = mix(i_pos.zw, i_pos.xy, e);
  float rot = i_shp.z + (1.0 - e) * 2.0;
  vec2 vel = vec2(0.0);
  if (i_mv.y > 0.0 && u_t > i_mv.y) {
    float dt = u_t - i_mv.y, k = 0.3;
    P += i_mv.zw * k * (1.0 - exp(-dt / k));
    vel = i_mv.zw * exp(-dt / k);
    rot += dt * (i_shp.w - 0.5) * 30.0;
  }
  float s = i_shp.x * max(i_shp.y, 1.0) + 2.5;
  float sp = length(vel);
  vec2 vd = sp > 1.0 ? vel / sp : vec2(1.0, 0.0);
  float blur = min(sp / 60.0, 140.0);                     // motion blur over a 1/60 s exposure
  vec2 corner = vec2(a_q.x * 2.0 - 1.0, a_q.y);
  vec2 off = vd * corner.x * (s + 0.5 * blur) + vec2(-vd.y, vd.x) * corner.y * s;
  v_q = off;
  v_shp = vec4(i_shp.x, i_shp.y, rot, i_shp.w);
  v_blur = vec2(blur, atan(vd.y, vd.x + 1e-6));
  gl_Position = toClip(P + off);
}`;
export const CRUMB_FS = `#version 300 es
${COMMON}
${FRAG}
in vec2 v_q;
flat in vec4 v_shp;
flat in vec2 v_blur;
out vec4 o;
float flake(vec2 q) {
  float c = cos(v_shp.z), s = sin(v_shp.z);
  q = vec2(c * q.x + s * q.y, -s * q.x + c * q.y) / vec2(v_shp.y, 1.0);
  float a = atan(q.y, q.x + 1e-5);
  float r = v_shp.x * (1.0 + 0.28 * sin(a * 3.0 + v_shp.w * 20.0) + 0.16 * sin(a * 5.0 + v_shp.w * 41.0));
  return length(q) - r;
}
void main() {
  vec2 vd = vec2(cos(v_blur.y), sin(v_blur.y));
  float cov = 0.0, shc = 0.0;
  vec3 nsum = vec3(0.0);
  // integrate the flake along its motion (1/60 s exposure)
  for (int k = 0; k < 5; k++) {
    float f = (float(k) / 4.0 - 0.5) * v_blur.x;
    vec2 q = v_q - vd * f;
    float d = flake(q);
    float c = clamp(0.5 - d * u_zoom, 0.0, 1.0);
    cov += c / 5.0;
    vec2 g = q / max(length(q), 1e-3);
    nsum += c * normalize(vec3(g * clamp(1.0 + d / max(v_shp.x, 0.5), 0.0, 1.0) * 0.9 + vec2(sin(v_shp.w * 40.0), cos(v_shp.w * 33.0)) * 0.25, 0.7));
    float ds = flake(q + vec2(0.7, -0.8) * (0.6 + 0.4 * v_shp.x));
    shc += clamp(0.8 - ds * 0.7, 0.0, 1.0) / 5.0;
  }
  if (cov + shc <= 0.003) discard;
  vec3 n = normalize(nsum + vec3(0.0, 0.0, 0.01));
  vec2 w = worldAt();
  vec3 L = normalize(u_lamp - vec3(w, 2.0));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  vec3 lampC = vec3(1.0, 0.95, 0.86) * 1.15;
  vec3 col = vec3(0.012, 0.012, 0.014) * (0.3 + max(dot(n, L), 0.0)) + lampC * (pow(max(dot(n, H), 0.0), 40.0) * 0.5);
  col = tonemap(col * vign()) * u_fade;
  float sa = shc * 0.45 * (1.0 - cov);
  o = vec4(col * cov, cov + sa);
}`;

// ---------------------------------------------------------------- 4. the tools: stylus and hake brush (+ shadows)
export const TOOL_FS = `#version 300 es
${COMMON}
${FRAG}
uniform vec2 u_tip, u_sdir;
uniform float u_lift, u_sOn;
uniform vec2 u_bc, u_bdir;
uniform float u_bOn, u_bH, u_bvel;
out vec4 o;
const float SL = 470.0;
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }
float styR(float a) {
  if (a < 0.0 || a > SL) return -1.0;
  if (a < 26.0) return mix(0.7, 4.2, a / 26.0);                       // steel nib
  if (a < 46.0) return 5.4 - 0.5 * step(0.5, fract(a / 4.0)) * step(30.0, a);   // ferrule, crimped rings
  float r = mix(6.2, 7.6, smoothstep(46.0, 200.0, a));                     // turned wooden handle
  float end = SL - a;
  if (end < 8.0) r *= sqrt(max(1.0 - (8.0 - end) * (8.0 - end) / 64.0, 0.0));
  return r;
}
vec4 brushAt(vec2 w, vec2 bc) {
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 lampC = vec3(1.0, 0.95, 0.86) * 1.15;
  vec2 q = w - bc, bn = vec2(-u_bdir.y, u_bdir.x);
  float f = dot(q, u_bdir), g = dot(q, bn);
  float inside = 1.0 - smoothstep(300.0, 302.0, abs(g));
  if (inside <= 0.0 || f > 76.0 || f < -92.0) return vec4(0.0);
  vec3 Lb = normalize(u_lamp - vec3(w, u_bH));
  if (f > 18.0) {
    // the stock (wood), rounded along its edges
    float u = (f - 18.0) / 58.0;
    vec3 n = normalize(vec3(u_bdir * (u < 0.2 ? -(1.0 - u / 0.2) : u > 0.8 ? (u - 0.8) / 0.2 : 0.0) * 0.8, 1.0));
    float gr = vnoise(vec2(g * 0.02, f * 0.6)) * 0.5 + 0.5 * vnoise(vec2(g * 0.004, f * 2.0));
    vec3 wood = mix(vec3(0.55, 0.36, 0.18), vec3(0.72, 0.52, 0.30), gr);
    vec3 c = wood * (0.2 + 0.85 * max(dot(n, Lb), 0.0)) * lampC + lampC * pow(max(dot(n, normalize(Lb + V)), 0.0), 40.0) * 0.2;
    float a = inside * smoothstep(18.0, 19.0, f) * (1.0 - smoothstep(75.0, 76.0, f)) * u_bOn;
    return vec4(tonemap(c * vign()) * a, a);
  }
  float tipN = 10.0 * vnoise(vec2(g * 0.25, 3.0)) + 8.0 * vnoise(vec2(g * 0.9, 7.0));
  float tip = -62.0 - tipN;
  float a = smoothstep(tip - 4.0, tip + 14.0, f) * inside * u_bOn;
  float fibre = vnoise(vec2(g * 1.3, f * 0.03)) * 0.6 + vnoise(vec2(g * 3.1, f * 0.05 + 4.0)) * 0.4;
  a *= 0.75 + 0.25 * smoothstep(0.2, 0.6, fibre);
  vec3 T = normalize(vec3(u_bdir, 0.25));
  vec3 Hb = normalize(Lb + V);
  float c2 = dot(T, Hb);
  float kk = pow(max(sqrt(max(1.0 - c2 * c2, 0.0)), 1e-4), 30.0);
  vec3 hair = mix(vec3(0.62, 0.55, 0.44), vec3(0.86, 0.80, 0.68), fibre);
  vec3 c = hair * (0.25 + 0.7 * max(Lb.z, 0.0)) * lampC * (0.7 + 0.3 * smoothstep(tip, 0.0, f)) + lampC * kk * 0.18;
  return vec4(tonemap(c * vign()) * a, a);
}
void main() {
  vec2 w = worldAt();
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec4 res = vec4(0.0);
  vec3 lampC = vec3(1.0, 0.95, 0.86) * 1.15;
  // ---- shadows first (black, alpha)
  float shA = 0.0;
  if (u_sOn > 0.0) {
    vec3 L = normalize(u_lamp - vec3(u_tip, 0.0));
    vec2 off = -L.xy / max(L.z, 0.25);
    vec2 S0 = u_tip + off * u_lift, Dp = u_sdir + off * 0.72;
    float a = clamp(dot(w - S0, Dp) / dot(Dp, Dp), 0.0, SL);
    float r = styR(a);
    float z = u_lift + a * 0.72;
    float dd = length(w - (S0 + Dp * a));
    float pen = 0.8 + z * 0.035;
    shA = max(shA, u_sOn * (0.62 - 0.25 * smoothstep(0.0, 300.0, z)) * (1.0 - smoothstep(r - pen, r + pen, dd)) * step(0.0, r));
  }
  if (u_bOn > 0.0) {
    vec3 L = normalize(u_lamp - vec3(u_bc, 0.0));
    vec2 off = -L.xy / max(L.z, 0.25) * u_bH;
    vec2 q = w - u_bc - off, bn = vec2(-u_bdir.y, u_bdir.x);
    float f = dot(q, u_bdir), g = dot(q, bn);
    float inH = (1.0 - smoothstep(300.0, 330.0, abs(g))) * smoothstep(-110.0, -60.0, f) * (1.0 - smoothstep(60.0, 90.0, f));
    shA = max(shA, u_bOn * 0.5 * inH);
  }
  res = vec4(0.0, 0.0, 0.0, shA);
  // ---- the brush: goat-hair bristles trailing behind a flat wooden stock, motion-blurred over 1/60 s
  if (u_bOn > 0.0) {
    vec4 acc = vec4(0.0);
    for (int k = 0; k < 6; k++) acc += brushAt(w, u_bc + u_bdir * u_bvel * ((float(k) + 0.5) / 6.0 - 0.5) / 60.0);
    acc /= 6.0;
    res = vec4(acc.rgb + res.rgb * (1.0 - acc.a), acc.a + res.a * (1.0 - acc.a));
  }
  // ---- the stylus: steel nib, crimped ferrule, turned beech handle
  if (u_sOn > 0.0) {
    vec2 q = w - u_tip, sn = vec2(-u_sdir.y, u_sdir.x);
    float a = dot(q, u_sdir), c = dot(q, sn);
    float r = styR(a);
    if (r > 0.0) {
      float cov = clamp((r - abs(c)) * u_zoom + 0.5, 0.0, 1.0) * u_sOn;
      if (cov > 0.0) {
        float cs = clamp(c / r, -1.0, 1.0);
        vec3 n = normalize(vec3(sn * cs, sqrt(max(1.0 - cs * cs, 0.0)) + 0.02) - vec3(u_sdir, 0.0) * 0.55);
        float z = u_lift + a * 0.72;
        vec3 L = normalize(u_lamp - vec3(w, z));
        vec3 H = normalize(L + V);
        vec3 col;
        if (a < 46.0) {
          vec3 Rf = reflect(-V, n);
          float env = 0.12 + 0.6 * smoothstep(0.2, 0.9, dot(Rf, normalize(vec3(0.4, -0.5, 0.75)))) + 0.15 * smoothstep(0.3, 1.0, -Rf.x);
          col = vec3(0.6, 0.62, 0.66) * env * lampC + lampC * pow(max(dot(Rf, L), 0.0), 80.0) * 2.5;
        } else {
          float gr = vnoise(vec2(a * 0.04, cs * 3.0 + 4.0)) * 0.6 + 0.4 * vnoise(vec2(a * 0.3, cs * 8.0));
          vec3 wood = mix(vec3(0.62, 0.42, 0.24), vec3(0.80, 0.62, 0.40), gr);
          col = wood * (0.18 + 0.9 * max(dot(n, L), 0.0)) * lampC + lampC * pow(max(dot(n, H), 0.0), 50.0) * 0.35;
        }
        res = over(res, tonemap(col * vign()), cov);
      }
    }
  }
  if (res.a <= 0.002) discard;
  // premultiplied: shadows are black with alpha
  o = vec4(res.rgb * u_fade, res.a);
}`;
