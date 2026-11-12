/*
 * 47-embroidery/shaders.js — GLSL for the linen, the threads (Kajiya–Kay sheen on twisted plies), French knots,
 * the steel needle, and the height-shadow buffer.
 * World = stage px, y down; z points at the viewer (height above the cloth, px).
 */

export const COMMON = `
precision highp float;
uniform vec2 u_res, u_cam, u_hoopC;
uniform float u_zoom, u_t, u_amb, u_sheen, u_fade;
uniform vec3 u_lamp, u_lampCol, u_Lc;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash11(float x) { return hash12(vec2(x, x * 0.7 + 3.1)); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
vec3 tonemap(vec3 c) {
  c = max(c, vec3(0.0));
  c = c * (2.51 * c + 0.03) / (c * (2.43 * c + 0.59) + 0.14);
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
}
// the lamp: a warm pool, brightest under it
float pool(vec2 w) { vec2 d = w - u_lamp.xy; return 0.62 + 0.38 * exp(-dot(d, d) / (1500.0 * 1500.0)); }
float groundAt(vec2 w) { return length(w - u_hoopC) > 480.0 ? -14.0 : 0.0; }
`;

// ---------------------------------------------------------------- threads, knots, needle (instanced quads)
export const THREAD_VS = (shadow) => `#version 300 es
${shadow ? '#define SHADOW' : ''}
${COMMON}
layout(location = 0) in vec2 a_q;     // x 0..1 along, y -1..1 across
layout(location = 1) in vec4 i_ab;    // A.xy, B.xy
layout(location = 2) in vec4 i_p;     // width (knot: radius), birth, duration, type (0 stitch, 1 knot, 2 needle, 3 loose thread)
layout(location = 3) in vec4 i_c;     // linear rgb, seed
layout(location = 4) in vec4 i_h;     // base height at A, strands, twist angle (needle: hidden length), base height at B
out vec2 v_loc;
out vec2 v_world;
out float v_hb;
flat out vec4 v_p;     // length, half width / radius, type, seed
flat out vec4 v_h;
flat out vec3 v_col;
flat out vec4 v_T;     // tangent, alpha, progress
void main() {
  float type = i_p.w;
  float pr = clamp((u_t - i_p.y) / max(i_p.z, 1e-4), 0.0, 1.0);
  vec2 A = i_ab.xy, B = i_ab.zw;
  float hw = 0.5 * i_p.x, alpha = 1.0, lift = 0.0, len = 0.0, hb, hTop;
  vec2 T = vec2(1.0, 0.0), P, loc;
  float pad = 1.2 / u_zoom + 0.5;
  bool knot = type > 0.5 && type < 1.5;
  if (knot) {
    float s = 1.0 + 0.45 * (1.0 - pr) * (1.0 - pr);     // the coil is pulled tight
    hw = i_p.x * s;
    alpha = smoothstep(0.0, 0.25, pr);
    hb = i_h.x;
    hTop = hb + i_p.x * 1.25;
  } else {
    if (type < 0.5) { B = mix(A, B, pr); lift = (1.0 - pr) * 5.0; }   // a stitch being laid is still in the air
    vec2 d = B - A;
    len = length(d);
    T = len > 1e-4 ? d / len : vec2(1.0, 0.0);
    hb = 0.0;
    hTop = max(i_h.x, i_h.w) + 1.6 * hw + lift;
  }
#ifdef SHADOW
  float pen = 0.5 + max(hTop - groundAt(A), 0.0) * 0.11;
  pad += pen;
#endif
  if (knot) {
    loc = vec2(a_q.x * 2.0 - 1.0, a_q.y) * (hw + pad);
    P = A + loc;
  } else {
    vec2 N = vec2(-T.y, T.x);
    float ext = hw + pad;
    float al = a_q.x * (len + 2.0 * ext) - ext;
    loc = vec2(al, a_q.y * (hw + pad));
    P = A + T * loc.x + N * loc.y;
    hb = mix(i_h.x, i_h.w, clamp(al / max(len, 1e-3), 0.0, 1.0)) + lift;
  }
  v_world = P;
#ifdef SHADOW
  float top = knot ? hTop : hb + 1.6 * hw;
  P += -u_Lc.xy / max(u_Lc.z, 0.22) * max(top - groundAt(P), 0.0);
  v_hb = top;
  v_T = vec4(T, alpha, pen);
#else
  v_hb = hb;
  v_T = vec4(T, alpha, pr);
#endif
  v_loc = loc;
  v_p = vec4(len, hw, type, i_c.w);
  v_h = i_h;
  v_col = i_c.rgb;
  vec2 s = (P - u_cam) * u_zoom + 0.5 * u_res;
  gl_Position = vec4(s.x / u_res.x * 2.0 - 1.0, 1.0 - s.y / u_res.y * 2.0, 0.0, 1.0);
}`;

// signed distance (px) of the shape at this fragment; shared by both passes
const SHAPE = `
float needleProfile(float a, float Lf, float hw) {
  float r = hw * min(1.0, sqrt(max(a, 0.0) / (0.24 * Lf)));     // ground point
  float back = Lf - a;
  if (back < hw) r *= sqrt(max(1.0 - (hw - back) * (hw - back) / (hw * hw), 0.0));
  return back < 0.0 ? -1.0 : r;
}
float shapeDist(out float rad) {
  float type = v_p.z, len = v_p.x, hw = v_p.y;
  vec2 q = v_loc;
  if (type > 0.5 && type < 1.5) {
    float rho = length(q) / hw, th = atan(q.y, q.x + 1e-5);
    float edge = 1.0 + 0.07 * sin(th * 5.0 + v_p.w * 6.0) + 0.04 * sin(th * 9.0 + v_p.w * 13.0);
    rad = hw;
    return (rho - edge) * hw;
  }
  if (type > 1.5 && type < 2.5) {
    float hid = v_h.z, Lf = len + hid;
    rad = needleProfile(q.x + hid, Lf, hw);
    float d = abs(q.y) - rad;
    d = max(d, -q.x);                         // below the cloth from here on
    d = max(d, q.x - len);
    return d;
  }
  float taper = type > 2.5 ? 1.0 : smoothstep(-hw * 0.2, hw * 2.2, min(q.x, len - q.x));
  rad = hw * (0.66 + 0.34 * taper);
  return length(vec2(q.x - clamp(q.x, 0.0, len), q.y)) - rad;
}`;

const FRAG = `
float vign() { vec2 vq = (gl_FragCoord.xy / u_res - 0.5) * vec2(1.0, 1.25); return 1.0 - 0.55 * clamp(dot(vq, vq) * 1.1, 0.0, 1.0); }
`;

export const SHADOW_FS = `#version 300 es
${COMMON}
in vec2 v_loc; in vec2 v_world; in float v_hb;
flat in vec4 v_p; flat in vec4 v_h; flat in vec3 v_col; flat in vec4 v_T;
out vec4 o;
${SHAPE}
void main() {
  float rad;
  float d = shapeDist(rad);
  float pen = v_T.w;
  float cov = (1.0 - smoothstep(-pen, pen, d)) * v_T.z;
  if (cov <= 0.002) discard;
  // max-blended: the highest occluder height over this pixel (encoded −16..80 px), fading out in the penumbra
  float h = v_hb + 16.0;
  o = vec4(h * cov / 96.0, 0.0, 0.0, 1.0);
}`;

export const THREAD_FS = `#version 300 es
${COMMON}
uniform sampler2D u_sh;
${FRAG}
in vec2 v_loc; in vec2 v_world; in float v_hb;
flat in vec4 v_p; flat in vec4 v_h; flat in vec3 v_col; flat in vec4 v_T;
out vec4 o;
${SHAPE}
float occAt(float myH) {
  float occ = texture(u_sh, gl_FragCoord.xy / u_res).r * 96.0 - 16.0;
  return smoothstep(myH + 0.35, myH + 2.8, occ) * (1.0 - 0.45 * smoothstep(12.0, 70.0, occ - myH));
}
// Kajiya–Kay: a fibre with tangent Tf reflects into a cone; highlight ∝ sin(Tf, H)^p
float kk(vec3 Tf, vec3 H, float p) { float c = dot(Tf, H); return pow(max(sqrt(max(1.0 - c * c, 0.0)), 1e-4), p); }
void main() {
  float rad;
  float d = shapeDist(rad);
  float cov = clamp(0.5 - d * u_zoom, 0.0, 1.0) * v_T.z;
  if (cov <= 0.002) discard;
  float type = v_p.z, len = v_p.x, hw = v_p.y, seed = v_p.w;
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 col;
  float pl = pool(v_world);
  if (type > 1.5 && type < 2.5) {
    // ---- the needle: polished steel, a gold-plated eye end
    float hid = v_h.z, Lf = len + hid, a = v_loc.x + hid;
    vec2 eq = vec2((a - (Lf - 12.0)) / 5.5, v_loc.y / (0.45 * hw));
    float eye = 1.0 - smoothstep(0.75, 1.0, dot(eq, eq));
    cov *= 1.0 - eye;
    if (cov <= 0.002) discard;
    vec2 T = v_T.xy, N = vec2(-T.y, T.x);
    float cs = clamp(v_loc.y / max(rad, 1e-3), -1.0, 1.0);
    vec3 n = normalize(vec3(N * cs, sqrt(max(1.0 - cs * cs, 0.0)) + 0.02) - vec3(T, 0.0) * 0.42);
    float h = mix(v_h.x, v_h.w, clamp(a / Lf, 0.0, 1.0)) + hw;
    vec3 L = normalize(u_lamp - vec3(v_world, h));
    vec3 Rf = reflect(-V, n);
    float spec = pow(max(dot(Rf, L), 0.0), 90.0) * 3.0;
    float env = 0.10 + 0.55 * smoothstep(0.25, 0.9, dot(Rf, normalize(vec3(-0.35, -0.5, 0.8)))) + 0.18 * smoothstep(0.4, 1.0, Rf.y);
    vec3 steel = vec3(0.62, 0.64, 0.68), gold = vec3(0.95, 0.66, 0.26);
    vec3 base = mix(steel, gold, smoothstep(Lf - 26.0, Lf - 23.0, a));
    float sh = 1.0 - 0.6 * occAt(h);
    col = base * (env * 0.9 + u_amb) * pl + base * u_lampCol * spec * sh * pl;
  } else if (type > 0.5 && type < 1.5) {
    // ---- French knot: two wraps coiled round the needle hole
    vec2 q = v_loc / hw;
    float rho = length(q), th = atan(q.y, q.x + 1e-5);
    vec2 rd = q / max(rho, 1e-4), tg = vec2(-rd.y, rd.x);
    float dome = sqrt(max(1.0 - rho * rho * 0.8, 0.0));
    float ph = rho * 2.3 - th / 6.2831853 * 2.0 + seed * 3.0;
    float cs = fract(ph) * 2.0 - 1.0, sz = sqrt(max(1.0 - cs * cs, 0.0));
    float dimple = exp(-rho * rho / 0.05);
    vec3 n = normalize(vec3(rd * (rho * 1.15 + cs * 0.75 - dimple * 0.9), dome * 0.9 + sz * 0.6 + 0.08));
    float plyPh = th * hw * 1.1 / 2.6 + cs * 0.5 + seed * 11.0;
    vec3 Tf = normalize(vec3(tg * 0.94 + rd * 0.34, 0.0) + vec3(0.0, 0.0, 0.25 * cos(6.2831853 * plyPh)));
    float groove = smoothstep(0.0, 0.25, sz) * (0.75 + 0.25 * cos(6.2831853 * plyPh));
    float myH = hw * (0.5 + 0.75 * dome) * (1.0 - 0.35 * dimple);
    vec3 L = normalize(u_lamp - vec3(v_world, myH));
    vec3 H = normalize(L + V);
    float ndl = max(dot(n, L), 0.0);
    float sh = 1.0 - 0.6 * occAt(myH);
    float ao = mix(0.45, 1.0, groove) * mix(0.55, 1.0, 1.0 - smoothstep(0.55, 1.05, rho)) * (1.0 - 0.5 * dimple);
    float spec = kk(Tf, H, 60.0) * groove * smoothstep(0.0, 0.3, ndl);
    col = v_col * (u_amb * ao + ndl * ao * u_lampCol * sh * pl) + u_lampCol * sh * pl * u_sheen * spec * 0.4;
  } else {
    // ---- a stitch: 1–3 strands, each a two-ply twist; it dives into the cloth at both ends
    float a = v_loc.x, c = v_loc.y;
    float loose = step(2.5, type);
    float taper = loose > 0.5 ? 1.0 : smoothstep(-hw * 0.2, hw * 2.2, min(a, len - a));
    float ns = v_h.y, tw = v_h.z;
    float cn = clamp(c / rad, -0.999, 0.999);
    float sx = (cn * 0.5 + 0.5) * ns, si = min(floor(sx), ns - 1.0);
    float cs = (sx - si) * 2.0 - 1.0, sz = sqrt(max(1.0 - cs * cs, 0.0));
    vec2 T = v_T.xy, N = vec2(-T.y, T.x);
    vec3 T3 = vec3(T, 0.0), N3 = vec3(N, 0.0);
    float dive = 1.0 - taper, es = a < len * 0.5 ? -1.0 : 1.0;
    float pitch = max(rad * 2.0 / ns * 2.4, 1.2);
    float ph = a / pitch - cs * 0.42 * sign(tw) + seed * 7.0 + si * 0.37;
    float fp = fract(ph);
    float groove = smoothstep(0.0, 0.2, fp) * (1.0 - smoothstep(0.8, 1.0, fp));
    float bump = sin(6.2831853 * ph);
    vec3 Tf = normalize(T3 * cos(tw) + N3 * sin(tw) * sign(tw) + vec3(0.0, 0.0, -es * dive * 1.3 + 0.3 * cos(6.2831853 * ph)));
    vec3 n = normalize(N3 * cs * 0.95 + vec3(0.0, 0.0, sz + 0.06) + T3 * (0.28 * bump + es * dive * 0.9));
    float myH = v_hb + rad * (1.0 + sz) * (0.4 + 0.6 * taper);
    vec3 L = normalize(u_lamp - vec3(v_world, myH));
    vec3 H = normalize(L + V);
    float ndl = max(dot(n, L), 0.0);
    float sh = 1.0 - 0.72 * occAt(myH);
    float fuzz = 0.9 + 0.2 * vnoise(vec2(a * 0.9 + seed * 50.0, (cs + si * 2.0) * 2.5));
    float ao = mix(0.55, 1.0, groove) * mix(0.42, 1.0, taper) * mix(0.68, 1.0, sz) * fuzz;
    float spec = kk(Tf, H, 70.0) * groove * smoothstep(0.0, 0.3, ndl);
    vec3 Tf2 = normalize(Tf - n * 0.22);
    float spec2 = kk(Tf2, H, 16.0) * smoothstep(0.0, 0.3, ndl);
    col = v_col * (u_amb * ao + ndl * ao * u_lampCol * sh * pl)
        + u_lampCol * sh * pl * u_sheen * (spec * 0.5 + spec2 * 0.5 * v_col * ao);
  }
  vec3 outc = tonemap(col * vign()) * u_fade;
  o = vec4(outc * cov, cov);
}`;

// ---------------------------------------------------------------- the cloth, the hoop
export const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FABRIC_FS = `#version 300 es
${COMMON}
uniform sampler2D u_sh;
${FRAG}
out vec4 o;
const float RIN = 446.0, ROUT = 480.0;
// plain-weave linen, ~5.2 px per thread: warp (vertical) and weft (horizontal) alternate over/under,
// thick-and-thin slubs, thread-to-thread colour. Returns height (0..1) and which thread is on top.
float weave(vec2 p, out float warpTop, out vec2 cell) {
  vec2 g = p / 5.2;
  vec2 ci = floor(g), f = fract(g);
  cell = ci;
  float tw = 0.80 + 0.30 * vnoise(vec2(ci.x * 3.1, p.y / 37.0)) + 0.16 * (hash11(ci.x) - 0.5);
  float tf = 0.80 + 0.30 * vnoise(vec2(p.x / 41.0, ci.y * 2.7)) + 0.16 * (hash11(ci.y + 71.0) - 0.5);
  float dx = (f.x - 0.5) / (0.5 * tw), dy = (f.y - 0.5) / (0.5 * tf);
  float px = sqrt(max(1.0 - dx * dx, 0.0)), py = sqrt(max(1.0 - dy * dy, 0.0));
  float s = mod(ci.x + ci.y, 2.0) < 0.5 ? 1.0 : -1.0;
  float hw = px * (0.55 + 0.45 * s * cos(3.14159 * (f.y - 0.5)));
  float hf = py * (0.55 - 0.45 * s * cos(3.14159 * (f.x - 0.5)));
  warpTop = hw > hf ? 1.0 : 0.0;
  return max(hw, hf);
}
// drape outside the hoop: the cloth falls away from the ring in soft radial folds
float drape(vec2 w) {
  vec2 d = w - u_hoopC;
  float r = length(d), a = atan(d.y, d.x + 1e-5);
  float k = smoothstep(484.0, 600.0, r);
  float f = sin(a * 11.0 + 2.2 * vnoise(vec2(a * 2.0, r / 160.0)) * 3.0) * (0.6 + 0.8 * vnoise(vec2(a * 5.0, r / 90.0)));
  return -14.0 - 0.02 * (r - 480.0) + k * 9.0 * f + 4.0 * vnoise(w / 210.0);
}
void main() {
  vec2 sp = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 w = u_cam + (sp - 0.5 * u_res) / u_zoom;
  vec2 dC = w - u_hoopC;
  float r = length(dC);
  vec3 V = vec3(0.0, 0.0, 1.0);
  // ---- the linen (micro relief from the weave, macro shape inside/outside the ring)
  float wt, wt2; vec2 cell, c2;
  float e = 0.55;
  float h0 = weave(w, wt, cell);
  float hx = weave(w + vec2(e, 0.0), wt2, c2), hy = weave(w + vec2(0.0, e), wt2, c2);
  float detail = clamp(u_zoom * 0.9, 0.55, 1.6);
  vec3 nMicro = normalize(vec3(-(hx - h0) / e * 1.1 * detail, -(hy - h0) / e * 1.1 * detail, 1.0));
  float outside = smoothstep(ROUT - 1.0, ROUT + 2.0, r);
  float M = drape(w), Mx = drape(w + vec2(2.0, 0.0)), My = drape(w + vec2(0.0, 2.0));
  vec3 nMacro = normalize(vec3(-(Mx - M) / 2.0 * outside, -(My - M) / 2.0 * outside, 1.0));
  // the cloth rises over the inner ring just inside the outer one
  float lip = smoothstep(RIN - 9.0, RIN, r) * (1.0 - outside);
  nMacro = normalize(nMacro + vec3(-dC / max(r, 1.0) * lip * 0.5, 0.0));
  vec3 n = normalize(vec3(nMicro.xy + nMacro.xy, 1.0));
  float hgt = mix(0.0, M, outside) + lip * 3.0;
  vec3 P = vec3(w, hgt);
  vec3 L = normalize(u_lamp - P);
  vec3 H = normalize(L + V);
  // thread colour: natural flax, each thread a slightly different dye lot, darker slubs, fine fibres along the thread
  float tid = wt > 0.5 ? cell.x : cell.y + 191.0;
  float along = wt > 0.5 ? w.y : w.x;
  vec3 flax = vec3(0.60, 0.50, 0.33);
  flax *= 0.86 + 0.24 * hash11(tid) ;
  flax = mix(flax, vec3(0.43, 0.34, 0.21), smoothstep(0.72, 0.95, vnoise(vec2(tid * 1.7, along / 23.0))) * 0.55);
  float fib = vnoise(vec2((wt > 0.5 ? w.x : w.y) * 0.65 + tid, along / 7.0));
  flax *= 0.9 + 0.2 * mix(0.5, fib, smoothstep(0.6, 1.4, u_zoom));
  float gapDark = mix(mix(0.62, 0.3, clamp(u_zoom - 0.6, 0.0, 1.0)), 1.0, smoothstep(0.0, 0.35, h0)) * mix(0.72, 1.0, h0);   // holes between threads
  float ndl = max(dot(n, L), 0.0);
  vec3 Tf = wt > 0.5 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  float c = dot(Tf, H);
  float sheen = pow(max(sqrt(max(1.0 - c * c, 0.0)), 1e-4), 24.0) * 0.07 * h0;
  // ---- shadows: threads above (height buffer), and the wooden ring
  float occ = texture(u_sh, gl_FragCoord.xy / u_res).r * 96.0 - 16.0;
  float myH = hgt + h0 * 0.8;
  float shT = smoothstep(myH + 0.3, myH + 2.6, occ) * (1.0 - 0.5 * smoothstep(12.0, 70.0, occ - myH));
  vec2 Q = w + L.xy / max(L.z, 0.2) * max(18.0 - myH, 0.0);
  float rq = length(Q - u_hoopC);
  float shR = smoothstep(RIN - 6.0, RIN + 2.0, rq) * (1.0 - smoothstep(ROUT - 2.0, ROUT + 6.0, rq));
  float sh = (1.0 - 0.62 * shT) * (1.0 - 0.55 * shR);
  float pl = pool(w);
  vec3 col = flax * gapDark * (u_amb + ndl * u_lampCol * sh * pl) + u_lampCol * sheen * sh * pl;
  col *= mix(1.0, 0.72, outside);
  // ---- the outer hoop ring: bent birch, lacquered, grain running round the ring
  float u = (r - RIN) / (ROUT - RIN);
  float onRing = smoothstep(-0.03, 0.0, u) * (1.0 - smoothstep(1.0, 1.03, u));
  vec2 dc = w - u_hoopC;
  float ang = atan(dc.y, dc.x + 1e-5);
  // the brass clamp at the top: two lugs and a screw through them
  vec2 cl = vec2(dc.x, -dc.y - ROUT);                  // x along the tangent, y outward from the ring
  float lug = step(4.0, abs(cl.x)) * step(abs(cl.x), 22.0) * step(-6.0, cl.y) * step(cl.y, 26.0);
  float screw = step(abs(cl.x), 46.0) * step(abs(cl.y - 13.0), 5.0);
  float knob = step(46.0, cl.x) * step(cl.x, 64.0) * step(abs(cl.y - 13.0), 11.0);
  if (onRing > 0.001 || lug + screw + knob > 0.0) {
    float nr = u < 0.28 ? -(1.0 - u / 0.28) : (u > 0.72 ? (u - 0.72) / 0.28 : 0.0);
    vec2 rd = dc / max(r, 1.0);
    vec3 nw = normalize(vec3(rd * nr * 0.95, 1.0));
    float grain = vnoise(vec2(ang * 380.0, r * 0.9)) * 0.6 + 0.4 * sin(r * 1.7 + 3.0 * vnoise(vec2(ang * 60.0, r * 0.2)));
    vec3 wood = mix(vec3(0.62, 0.42, 0.22), vec3(0.78, 0.58, 0.34), smoothstep(-0.3, 0.8, grain));
    float wh = 18.0;
    if (lug > 0.0) {   // lug blocks
      float lu = (abs(cl.x) - 4.0) / 18.0;
      nw = normalize(vec3(sign(cl.x) * (lu < 0.2 ? -(1.0 - lu / 0.2) : lu > 0.8 ? (lu - 0.8) / 0.2 : 0.0) * 0.9, 0.0, 1.0));
      wood = mix(vec3(0.60, 0.40, 0.21), vec3(0.76, 0.56, 0.33), vnoise(vec2(cl.y * 0.9, cl.x * 0.08)));
      wh = 26.0;
    }
    vec3 Lw = normalize(u_lamp - vec3(w, wh));
    vec3 Hw = normalize(Lw + V);
    float dw = max(dot(nw, Lw), 0.0);
    float sp2 = pow(max(dot(nw, Hw), 0.0), 60.0) * 0.35;
    vec3 wc = wood * (u_amb + dw * u_lampCol * pl) + u_lampCol * sp2 * pl;
    if (screw > 0.0 && lug < 0.5 || knob > 0.0) {   // brass
      float cy = clamp((cl.y - 13.0) / (knob > 0.0 ? 11.0 : 5.0), -1.0, 1.0);
      vec3 nb = normalize(vec3(0.0, -cy, sqrt(max(1.0 - cy * cy, 0.0)) + 0.02));
      if (knob > 0.0) nb = normalize(nb + vec3(0.25 * sin(cl.y * 2.2), 0.0, 0.0));
      vec3 Rb = reflect(-V, nb);
      vec3 brass = vec3(0.85, 0.62, 0.28);
      float envb = 0.25 + 0.6 * smoothstep(0.2, 0.9, dot(Rb, normalize(vec3(-0.3, -0.6, 0.75))));
      wc = brass * (envb * 0.8 + u_amb) * pl + u_lampCol * pow(max(dot(Rb, Lw), 0.0), 50.0) * 1.6 * pl;
    }
    col = mix(col, wc, max(onRing, max(lug, max(screw, knob))));
  }
  vec3 outc = tonemap(col * vign()) * u_fade;
  outc += (hash12(gl_FragCoord.xy + fract(u_t) * 91.0) - 0.5) / 255.0;
  o = vec4(outc, 1.0);
}`;
