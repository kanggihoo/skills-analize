/*
 * 21-risograph/shader.js — the output side of a single-drum riso, as one fragment shader.
 *   · each separation is screened into AM dots at its drum's own angle (pink 15°, blue 45°), with dot gain,
 *     ragged dot edges from the paper's tooth, uneven ink film (feed-direction streaks, mottle, pinholes);
 *   · the inks are transparent filters laid on the paper one after the other (multiply), so pink over
 *     blue gives violet, and each pass carries its own misregistration (shift + tiny rotation);
 *   · a sheet only carries a colour where it has already passed that drum's contact line;
 *   · the pressure rollers of the second pass pick up wet pink and set it off along two lanes;
 *   · the drum shows its own master: the separation, upside down, scrolling as it turns.
 */
export const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

export const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uSep;
uniform vec2 uRes;
uniform vec3 uCam;                 // world centre x, y, zoom
uniform float uFrame, uLod, uCount;
uniform vec4 uSh[8];               // sheet: centre x, top y, rotation, seed
uniform vec4 uMisP[8], uMisB[8];   // per pass: dx, dy, rotation, ink density
uniform vec4 uLn[8];               // pink printed below local y = x, blue below y, motion blur (px), lift
uniform vec4 uDrumP, uDrumB;       // drum: centre x, row at the contact line, row blur, visible
out vec4 o;

const float SW = 820.0, SH = 1160.0, YD = 30.0, RD = 197.35, CIRC = 1240.0, CELL = 7.5, PI = 3.14159265;
const vec3 PINK = vec3(1.0, 0.282, 0.69);    // fluorescent pink
const vec3 BLUE = vec3(0.196, 0.333, 0.643); // medium blue
const vec3 L = vec3(-0.35, -0.55, 0.76);

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float sdBox(vec2 p, vec2 b) { vec2 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); }
vec2 sep(vec2 q) { return textureLod(uSep, q / vec2(SW, SH), uLod).rg; }
float shade(vec3 n) { return 0.4 + 0.6 * max(dot(n, normalize(L)), 0.0) / normalize(L).z; }

// an ink layer registered on the sheet: shifted by m.xy and turned by m.z about the sheet centre
vec2 reg(vec2 q, vec4 m) {
  vec2 c = vec2(SW, SH) * 0.5, d = q - c;
  float cs = cos(m.z), sn = sin(m.z);
  return c + vec2(cs * d.x - sn * d.y, sn * d.x + cs * d.y) - m.xy;
}

// AM screen: a euclidean dot cell (round dots → checkerboard at 50 % → inverted dots), anti-aliased with
// the analytic gradient of the spot function; dot gain fattens the mid-tones; the paper's tooth roughens
// the dot edges; the ink film is uneven along the drum, mottled, and leaves pinholes in the solids.
float inkCov(vec2 qp, vec2 q, float tone, float ang, float seed, float dens) {
  tone = clamp(tone, 0.0, 1.0);
  tone += 0.16 * tone * (1.0 - tone);
  float cs = cos(ang), sn = sin(ang);
  vec2 p = vec2(cs * qp.x + sn * qp.y, -sn * qp.x + cs * qp.y) / CELL;
  vec2 f = fract(p) - 0.5;
  float v = 0.5 + 0.25 * (cos(6.2832 * f.x) + cos(6.2832 * f.y));
  float g = 1.5708 * length(vec2(sin(6.2832 * f.x), sin(6.2832 * f.y))) / (CELL * uCam.z);
  float rough = (noise(q * 0.9 + seed * 11.0) - 0.5) * 0.14 + (noise(q * 2.6 + seed * 3.0) - 0.5) * 0.07;
  float th = mix(1.08, -0.08, tone);
  float w = g * 0.75 + 0.015;
  float cov = smoothstep(th - w, th + w, v + rough * (1.0 - 0.5 * tone));
  float d = dens * (0.9 + 0.1 * noise(q * 0.004 + seed));
  d *= 1.0 - 0.14 * smoothstep(0.55, 0.9, noise(vec2(q.x * 0.07, q.y * 0.0025 + seed * 5.0)));   // drum streaks
  d *= 1.0 - 0.1 * smoothstep(0.6, 0.95, noise(vec2(q.x * 0.012 + seed, 0.5)));                    // a starved band
  d *= 0.9 + 0.1 * noise(q * 0.32 + seed * 2.0);                                                    // mottle
  cov *= d * (1.0 - 0.55 * smoothstep(0.82, 0.97, noise(q * 1.25 + seed * 7.0)));                  // pinholes
  return clamp(cov, 0.0, 1.0);
}

vec3 paper(vec2 q, float seed) {
  vec3 c = vec3(0.962, 0.953, 0.925);
  c *= 0.975 + 0.035 * noise(q * 0.012 + seed) + 0.025 * (noise(q * 0.6 + seed) - 0.5);
  // fibres and specks: one candidate per 6-px cell, kept inside its cell
  vec2 cell = floor(q / 6.0);
  if (hash(cell + seed * 17.0) > 0.982) {
    vec2 ctr = (cell + 0.3 + 0.4 * vec2(hash(cell + 3.1), hash(cell + 7.7))) * 6.0;
    float r = 0.35 + 0.6 * hash(cell + 5.3);
    c *= 1.0 - 0.4 * smoothstep(r + 0.6, r - 0.3, length(q - ctr));
  }
  return c;
}

vec3 printAt(int k, vec2 q) {
  vec4 sh = uSh[k], mp = uMisP[k], mb = uMisB[k], ln = uLn[k];
  float seed = sh.w;
  vec3 col = paper(q, seed);
  if (q.y > ln.x) {
    vec2 qp = reg(q, mp);
    float cov = inkCov(qp, q, sep(qp).r, 0.2618, seed + 1.0, mp.w);
    col *= mix(vec3(1.0), PINK, cov);
  }
  if (q.y > ln.y) {
    vec2 qb = reg(q, mb);
    float cov = inkCov(qb, q, sep(qb).g, 0.7854, seed + 2.0, mb.w);
    col *= mix(vec3(1.0), BLUE, cov);
    // set-off: the exit rollers (two lanes) touched wet pink one roller-turn (138 px) earlier
    float lane = max(smoothstep(15.0, 6.0, abs(q.x - 196.0)), smoothstep(15.0, 6.0, abs(q.x - 624.0)));
    if (lane > 0.0) {
      vec2 qs = reg(q - vec2(0.0, 138.0), mp);
      float so = (sep(qs).r + sep(qs - vec2(0.0, 9.0)).r + sep(qs + vec2(0.0, 9.0)).r) / 3.0;
      col *= mix(vec3(1.0), PINK, so * lane * (0.1 + 0.06 * noise(q * vec2(0.3, 0.05) + seed)));
    }
  }
  // a fresh sheet is not quite flat
  col *= 0.985 + 0.03 * noise(q * 0.0035 + seed * 3.0);
  return col;
}
vec3 sheetColor(int k, vec2 q) {
  float bl = uLn[k].z;
  if (bl < 1.5) return printAt(k, q);
  return (printAt(k, q - vec2(0.0, 0.4 * bl)) + printAt(k, q) + printAt(k, q + vec2(0.0, 0.4 * bl))) / 3.0;
}

// the drum: inked master on a mesh cylinder; the visible top half shows the rows that are R·ψ past contact
vec3 drum(vec2 w, vec4 D, int which, out float a) {
  vec2 q = w - vec2(D.x, YD);
  a = 0.0;
  if (D.w < 0.5 || abs(q.x) > 488.0 || abs(q.y) >= RD) return vec3(0.0);
  a = smoothstep(488.0, 486.0, abs(q.x)) * smoothstep(RD, RD - 1.5, abs(q.y));
  float sy = q.y / RD;
  vec3 n = vec3(0.0, sy, sqrt(max(1.0 - sy * sy, 0.0)));
  vec3 H = normalize(normalize(L) + vec3(0.0, 0.0, 1.0));
  vec3 inkc = which == 0 ? PINK : BLUE;
  if (abs(q.x) > 464.0) {                                  // flanges
    vec3 c = vec3(0.30, 0.31, 0.33) * shade(n) + 0.35 * pow(max(dot(n, H), 0.0), 40.0);
    return c * (0.85 + 0.15 * sin(q.x * 0.9));
  }
  float psi = PI - asin(clamp(sy, -1.0, 1.0));
  float row = mod(D.y + RD * psi, CIRC);
  vec3 c;
  if (row > SH + 6.0 && row < CIRC - 6.0) {               // the master clamp bar
    c = vec3(0.55, 0.56, 0.58) * shade(n) + 0.5 * pow(max(dot(n, H), 0.0), 50.0);
    c *= 0.9 + 0.1 * step(0.5, fract(q.x / 40.0));
    return c;
  }
  vec2 sq = vec2(q.x + SW * 0.5, row);                     // rows grow upward on the top of the drum: upside down
  float tone = 0.0;
  if (sq.x > 0.0 && sq.x < SW) {
    vec2 tt = vec2(0.0);
    for (int i = -1; i <= 1; i++) tt += sep(sq + vec2(0.0, float(i) * D.z));
    tone = (which == 0 ? tt.r : tt.g) / 3.0;
  }
  float cs = cos(which == 0 ? 0.2618 : 0.7854), sn = sin(which == 0 ? 0.2618 : 0.7854);
  vec2 p = vec2(cs * sq.x + sn * sq.y, -sn * sq.x + cs * sq.y) / CELL;
  vec2 f = fract(p) - 0.5;
  float v = 0.5 + 0.25 * (cos(6.2832 * f.x) + cos(6.2832 * f.y));
  float th = mix(1.08, -0.08, tone);
  float cov = mix(smoothstep(th - 0.08, th + 0.08, v), tone, clamp(D.z / 20.0, 0.0, 1.0));
  vec3 film = mix(vec3(0.80, 0.79, 0.76), inkc, 0.25);    // ink-stained stencil tissue over the mesh
  c = mix(film, inkc * 0.74, cov);
  c *= 0.93 + 0.07 * sin(q.x * 2.4) * sin(row * 2.4);      // mesh under the tissue
  c = c * shade(n) + (0.12 + 0.35 * cov) * pow(max(dot(n, H), 0.0), 36.0);
  return c;
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 w = (s - 0.5 * uRes) / uCam.z + uCam.xy;

  // the output tray
  vec3 col = vec3(0.155, 0.157, 0.172) * (0.94 + 0.06 * noise(w * vec2(0.02, 0.4)) + 0.03 * noise(w * 0.9));
  col *= 0.9 + 0.1 * smoothstep(1700.0, 300.0, w.y);
  // end stop at the foot of the stack
  if (w.y > 1494.0 && w.y < 1512.0 && abs(w.x - 540.0) < 300.0) col = vec3(0.30, 0.31, 0.33) * (w.y < 1497.0 ? 1.35 : 1.0);

  // the sheets, top-most first; every sheet above the one we hit casts its shadow on it
  float shadow = 0.0;
  for (int k = 7; k >= 0; k--) {
    if (float(k) >= uCount) continue;
    vec4 sh = uSh[k];
    float lift = uLn[k].w;
    vec2 C = vec2(sh.x, sh.y + 0.5 * SH);
    float cr = cos(sh.z), sr = sin(sh.z);
    vec2 d = w - C;
    vec2 q = vec2(cr * d.x + sr * d.y, -sr * d.x + cr * d.y);
    float sd = sdBox(q, vec2(SW, SH) * 0.5);
    if (sd < 0.75) {
      vec3 pc = sheetColor(k, q + vec2(SW, SH) * 0.5);
      pc *= 1.0 - 0.07 * smoothstep(-3.0, 0.0, sd);        // the cut edge catches a little shadow
      col = mix(col, pc, smoothstep(0.75, -0.75, sd)) * (1.0 - shadow);
      shadow = -1.0;
      break;
    }
    vec2 ds = d - vec2(5.0, 9.0) * (1.0 + 6.0 * lift);
    vec2 qs = vec2(cr * ds.x + sr * ds.y, -sr * ds.x + cr * ds.y);
    float soft = 3.0 + 28.0 * lift;
    float sk = (0.34 - 0.12 * lift) * smoothstep(soft, -soft, sdBox(qs, vec2(SW, SH) * 0.5));
    shadow = 1.0 - (1.0 - shadow) * (1.0 - sk);
  }
  if (shadow >= 0.0) col *= 1.0 - shadow;

  // paper guides (side fences), standing over the stack
  for (int i = 0; i < 2; i++) {
    float fx = i == 0 ? 116.0 : 964.0;
    if (abs(w.x - fx) < 7.0 && w.y > 300.0 && w.y < 1500.0) col = vec3(0.62, 0.63, 0.65) * (0.8 + 0.25 * smoothstep(7.0, -7.0, (w.x - fx) * (i == 0 ? -1.0 : 1.0)));
    else col *= 1.0 - 0.35 * smoothstep(22.0, 7.0, abs(w.x - fx - (i == 0 ? 6.0 : 6.0))) * step(300.0, w.y) * step(w.y, 1500.0);
  }

  // the machine: housing, the drum in its window, the lip the sheets slide out from under
  if (w.y < 240.0) {
    float aP, aB;
    vec3 cP = drum(w, uDrumP, 0, aP), cB = drum(w, uDrumB, 1, aB);
    vec3 house = vec3(0.105, 0.108, 0.118) * (0.92 + 0.08 * noise(w * 0.05));
    bool win = abs(w.x - 540.0) < 492.0 && w.y < 228.0;
    vec3 m = win ? vec3(0.02, 0.02, 0.025) * (0.6 + 0.4 * smoothstep(-200.0, 227.0, w.y)) : house;
    if (win) { m = mix(m, cP, aP); m = mix(m, cB, aB); }
    if (w.y > 227.0) m = mix(vec3(0.33, 0.34, 0.36), vec3(0.16, 0.165, 0.18), (w.y - 227.0) / 13.0);
    col = m;
  } else {
    col *= 1.0 - 0.45 * exp(-(w.y - 240.0) / 26.0);      // the lip's shadow on whatever comes out
  }

  // soft top light, vignette, a little sensor grain (seeded by frame number)
  vec2 sv = s / uRes - 0.5;
  col *= 1.0 - 0.5 * dot(sv * vec2(1.05, 0.8), sv * vec2(1.05, 0.8));
  col *= 1.04 - 0.08 * (s.y / uRes.y);
  col += (hash(s + uFrame * 7.31) - 0.5) * 0.01;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
