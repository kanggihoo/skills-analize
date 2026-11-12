/*
 * 113 · shader — one full-screen pass that inflates every shape from its precomputed distance field.
 *
 * Atlas texel (RGBA16F, LINEAR): R = smoothed signed distance (local px, < 0 inside), G = coverage blurred a little,
 * B = coverage blurred a lot (the two shadow penumbrae). Each object is an affine copy of one atlas cell.
 *   height  h(d) = R·√(1 − (1 − d/R)²) for 0 ≤ d ≤ R, else R      (d = inside depth + fattening e)
 *   normal  n = normalize(−∇h, 1),  ∇h = h'(d)·∇d (central differences on the atlas) + the poke dent's own gradient
 *   shading wrap diffuse with a saturated "candy" shade, tight Blinn specular + broad sheen, Fresnel-weighted
 *           studio reflection (wall/floor colours, a softbox, a strip light, the neighbour's colour), a backlight rim
 *   shadow  every object's blurred coverage, offset along the light by its height above the wall; the penumbra
 *           widens and the shadow fades as the shape puffs up and floats off
 * The canvas is transparent where nothing is drawn: the backdrop and ribbons are a 2D canvas below.
 */
export const N = 8;

export const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

export const FRAG = `#version 300 es
precision highp float;
#define N ${N}
uniform sampler2D uAtlas;
uniform vec2 uAtlasSize;
uniform int uN;
uniform vec4 uM[N];     // stage → local 2×2 (column-major)
uniform vec4 uP[N];     // world position xy, atlas cell centre xy (texels)
uniform vec4 uK[N];     // cell half extents (local px), R, e
uniform vec4 uDent[N];  // dent centre (local), amplitude (fraction of height), sigma (local px)
uniform vec4 uCol[N];   // albedo rgb, gloss 0..1
uniform vec4 uNb[N];    // neighbour colour (seen in reflection), side: +1 right, -1 left, 0 none
uniform vec4 uSh[N];    // shadow offset xy (world px), penumbra mix 0..1, strength
uniform vec4 uS[N];     // stage px per local px, visibility, rim boost, outline push at the dent (local px, < 0 = notch)
uniform vec3 uCam;      // camera scale, centre xy
uniform vec3 uL;        // key light direction (to the light), y down, z towards the viewer
uniform vec4 uBox;      // softbox centre in reflection space (xy), half size (zw)
uniform vec3 uWall, uFloor, uShadow;
out vec4 outColor;

vec4 at(vec2 t) { return texture(uAtlas, t / uAtlasSize); }

void main() {
  vec2 p = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);
  vec2 w = uCam.yz + (p - uCam.yz) / uCam.x;

  // ---- shadows on the backdrop (union: 1 − Π(1 − a))
  float keep = 1.0;
  for (int i = 0; i < N; i++) {
    if (i >= uN) break;
    if (uS[i].y <= 0.0) continue;
    mat2 M = mat2(uM[i]);
    vec2 q = M * (w - uSh[i].xy - uP[i].xy);
    if (abs(q.x) > uK[i].x || abs(q.y) > uK[i].y) continue;
    vec4 s = at(uP[i].zw + q);
    keep *= 1.0 - clamp(mix(s.g, s.b, uSh[i].z), 0.0, 1.0) * uSh[i].w * uS[i].y;
  }
  vec4 acc = vec4(uShadow * (1.0 - keep), 1.0 - keep);

  // ---- the puffy shapes, back to front
  const vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 Hb = normalize(uL + V);
  for (int i = 0; i < N; i++) {
    if (i >= uN) break;
    if (uS[i].y <= 0.0) continue;
    mat2 M = mat2(uM[i]);
    vec2 q = M * (w - uP[i].xy);
    if (abs(q.x) > uK[i].x || abs(q.y) > uK[i].y) continue;
    vec2 tc = uP[i].zw + q;
    float R = uK[i].z, e = uK[i].w;
    // the poke: a Gaussian dent g that scales the height (h·(1 − A·g)) and moves the outline by P·g (notch in / bulge out)
    vec2 rr = q - uDent[i].xy;
    float sg2 = uDent[i].w * uDent[i].w;
    float g = exp(-dot(rr, rr) / (2.0 * sg2));
    float A = uDent[i].z;
    float P = uS[i].w;
    float d = -at(tc).r + e + P * g;
    float pxs = uS[i].x * uCam.x;
    float a = clamp(d * pxs + 0.5, 0.0, 1.0) * uS[i].y;
    if (a <= 0.0) continue;

    const float hs = 1.25;
    float gx = at(tc + vec2(hs, 0.0)).r - at(tc - vec2(hs, 0.0)).r;
    float gy = at(tc + vec2(0.0, hs)).r - at(tc - vec2(0.0, hs)).r;
    vec2 gd = -vec2(gx, gy) / (2.0 * hs) - P * g * rr / sg2;   // ∇d, local (with the outline push)

    // inflation profile: a quarter circle of radius R rising from the outline, flat once d ≥ R
    float dc = clamp(d, 0.0, R);
    float u = 1.0 - dc / R;
    float h = R * sqrt(max(1.0 - u * u, 0.0));
    float dh = d < R ? (R - dc) / max(h, 0.35) : 0.0;           // dh/dd
    dh = min(dh, 14.0);
    vec2 gh = dh * gd;

    float f = 1.0 - A * g;                                      // ∇(h·f) = f∇h + h∇f, ∇f = A·g·r/σ²
    vec2 gq = gh * f + h * A * g * rr / sg2;
    float H = h * f;
    vec2 gw = uS[i].x * (gq * M);                               // back to stage axes (Mᵀ·∇ × scale)
    vec3 n = normalize(vec3(-gw, 1.0));

    vec3 alb = uCol[i].rgb;
    float gloss = uCol[i].a;
    float ndl = dot(n, uL);
    float dif = clamp((ndl + 0.35) / 1.35, 0.0, 1.0);
    vec3 deep = alb * alb * vec3(0.86, 0.80, 1.0);              // candy shade: deeper, more saturated
    vec3 col = mix(deep * 0.82, alb * 1.04, smoothstep(0.0, 1.0, dif));
    col = mix(alb * mix(0.93, 1.0, dif), col, gloss);           // flat sticker → shaded balloon
    float hn = clamp(H / max(R, 1.0), 0.0, 1.0);
    col *= mix(1.0, mix(0.84, 1.0, smoothstep(0.0, 0.45, hn)), gloss);   // low skirt sits in the wall's shade

    // studio reflection
    vec3 r = reflect(-V, n);
    vec3 env = mix(uWall, uFloor, smoothstep(-0.05, 0.55, r.y));
    env = mix(env, uWall * 1.08, smoothstep(-0.2, -0.8, r.y));
    if (uNb[i].a != 0.0) env = mix(env, uNb[i].rgb, 0.75 * smoothstep(0.15, 0.75, r.x * uNb[i].a) * (1.0 - smoothstep(0.2, 0.7, abs(r.y))));
    vec2 bb = abs(r.xy - uBox.xy) - uBox.zw;
    float bd = length(max(bb, 0.0)) + min(max(bb.x, bb.y), 0.0) - 0.05;
    float box = 1.0 - smoothstep(-0.04, 0.05, bd);
    float strip = (1.0 - smoothstep(0.02, 0.08, abs(r.x - 0.80))) * (1.0 - smoothstep(0.25, 0.55, abs(r.y + 0.15)));
    float fres = 0.06 + 0.94 * pow(1.0 - clamp(n.z, 0.0, 1.0), 4.0);
    float F = fres * gloss;
    col = col * (1.0 - F) + env * F;
    col += vec3(1.0, 0.99, 0.97) * (box * 4.2 + strip * 2.0) * F;

    // speculars: a tight hot spot and a broad sheen
    float nh = max(dot(n, Hb), 0.0);
    col += vec3(1.0) * (pow(nh, 240.0) * 1.25 + pow(nh, 28.0) * 0.10) * gloss;

    // backlight rim on the upper-right edges
    vec2 nxy = n.xy / max(length(n.xy), 1e-4);
    float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2) * smoothstep(-0.1, 0.9, dot(nxy, normalize(vec2(0.55, -0.85))));
    col += mix(vec3(1.0), alb, 0.35) * rim * (0.32 + uS[i].z) * gloss;

    col = clamp(col, 0.0, 1.0);
    acc = vec4(col * a, a) + acc * (1.0 - a);
  }
  outColor = acc.a > 0.0 ? vec4(acc.rgb / acc.a, acc.a) : vec4(0.0);
}`;
