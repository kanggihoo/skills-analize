/*
 * 84 · orrery.js — 그림 1: the planets, their arms and the calendar ring, as SVG markup with SMIL animation.
 *
 * Each orbit is a circle in a tilted plane, seen as an ellipse (x = a cos θ, y = k a sin θ). A planet moves with
 * uniform angular speed in that plane, which on the ellipse is NOT uniform arc length, so its <animateMotion>
 * gets keyPoints (fraction of the path length) for each keyTime (fraction of the time): the angle θ(t) is
 * sampled, turned into arc length along the path, and SMIL interpolates between samples (calcMode="linear").
 * The angle comes from the drive's "mechanism time" τ(t) (it starts, runs and slows with the clock below) times
 * the planet's rate; periods follow the real ratios (Mercury 0.241 · Venus 0.615 · Earth 1 · Mars 1.881 years).
 *   rotate="auto" turns each planet with its path, so the hatched night side (drawn on the local +y side,
 *   the outward normal) always faces away from the sun.
 * The arms are lines in a group scaled (1, k) and rotated by <animateTransform> through the same θ samples: in
 * the squashed plane the arm tip lands exactly on the planet's ellipse point.
 * Occlusion against the central column: everything is drawn twice — behind the column, and again in front of it
 * clipped to the near half of the orbit plane (y > the plane's centre line).
 */

const f = (v) => (Math.round(v * 100) / 100).toString();
const f4 = (v) => (Math.round(v * 10000) / 10000).toString();
const deg = (r) => r * 180 / Math.PI;

export const ORRERY = {
  cx: 540, cy: 470, k: 0.3,                 // orbit plane centre and tilt (minor/major axis ratio)
  sun: { y: 404, r: 42 },
  ringA: 410, numA: 448,                    // calendar ring radius, numeral radius
};

// [name, a (px), period (years), start angle (deg), body radius, post height, wash colour]
export const PLANETS = [
  ['mercury', 118, 0.2408, 200, 6, 18, '#b8a48c'],
  ['venus', 190, 0.6152, 330, 10, 24, '#ead29a'],
  ['earth', 275, 1, 111, 12, 30, '#86aac6'],
  ['mars', 360, 1.8808, 28, 8.5, 36, '#cd7b5c'],
];
export const EARTH_SWEEP = 372;              // Earth turns 372° over the whole run: past all twelve numerals and on to the first again

/**
 * Sample θ(t) for a body: times ts (s), mechanism time τ(ts) (s), Earth period P (s of τ), body period in years.
 * Angles decrease: seen from above-front, counter-clockwise orbits move left-to-right on the near side.
 */
function angles(taus, theta0deg, years, P) {
  return taus.map((tau) => theta0deg * Math.PI / 180 - 2 * Math.PI * tau / (P * years));
}

/** an orbit traversed from angle θ0 with decreasing θ for `laps` laps, as a polyline (exact length known) */
function orbitPath(a, k, theta0, laps, dy = 0, stepDeg = 3) {
  const n = Math.ceil(laps * 360 / stepDeg);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const th = theta0 - (i * stepDeg) * Math.PI / 180;
    pts.push([a * Math.cos(th), k * a * Math.sin(th) + dy]);
  }
  let len = 0;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(len); }
  const d = 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L');
  // arc-length fraction at a swept angle s (radians, ≥ 0): interpolate in the cumulative table
  const frac = (s) => {
    const u = (s * 180 / Math.PI) / stepDeg, i = Math.min(n - 1, Math.floor(u)), w = u - i;
    return (cum[i] + (cum[i + 1] - cum[i]) * w) / len;
  };
  return { d, frac };
}

/**
 * The orrery markup. drive = { ts: [s…], taus: [τ…], end } sampled from t = 0 (static until the release).
 * Returns { back, column, front, numerals, earthTheta } — earthTheta(t) lets the dial light its numerals.
 */
export function orreryMarkup(drive) {
  const { cx, cy, k, ringA } = ORRERY;
  const { ts, taus, end } = drive;
  const P = drive.tauTotal * 360 / EARTH_SWEEP;           // Earth's period in mechanism seconds
  const keyTimes = ts.map((t) => f4(t / end)).join(';');

  const bodies = PLANETS.map(([name, a, years, th0, rad, h, wash]) => {
    const th = angles(taus, th0, years, P);
    const swept = th.map((x) => th[0] - x);
    const laps = swept[swept.length - 1] / (2 * Math.PI) + 0.02;
    const orbit = orbitPath(a, k, th[0], laps, 0);
    const lifted = orbitPath(a, k, th[0], laps, -h);        // the same orbit, raised by the post height
    const keyPoints = swept.map((s) => f4(Math.min(1, orbit.frac(s)))).join(';');
    const armVals = th.map((x) => f(deg(x))).join(';');
    return { name, a, years, th, rad, h, wash, orbit, lifted, keyPoints, armVals };
  });

  const motion = (path, extra = '') => `<animateMotion path="${path}" dur="${end}s" begin="0s" fill="freeze" calcMode="linear" keyTimes="${keyTimes}" keyPoints="KP" ${extra}/>`;

  // one copy of every arm, post and planet; clipped (front) or not (back)
  function bodiesCopy(front) {
    let s = '';
    for (const b of bodies) {
      const clipArm = front ? ' clip-path="url(#clip-front)"' : '';
      const clipBody = front ? ` clip-path="url(#clip-front-${b.name})"` : '';
      const armLen = b.name === 'earth' ? ringA - 6 : b.a;
      // the arm, in the squashed plane
      s += `<g${clipArm}><g transform="translate(${cx} ${cy}) scale(1 ${k})"><g>
        <animateTransform attributeName="transform" type="rotate" dur="${end}s" begin="0s" fill="freeze" calcMode="linear" keyTimes="${keyTimes}" values="${b.armVals}"/>
        <line x1="14" y1="0" x2="${armLen}" y2="0" class="arm" vector-effect="non-scaling-stroke"/>
        <circle cx="${b.a}" cy="0" r="4.5" class="armend" vector-effect="non-scaling-stroke"/>
        ${b.name === 'earth' ? `<path d="M${ringA - 26} -9L${ringA - 4} 0L${ringA - 26} 9Z" class="pointer" vector-effect="non-scaling-stroke"/>` : ''}
      </g></g></g>`;
      // the post (no rotation) and the body (rotate="auto": its night side faces outward)
      s += `<g${clipBody}><g transform="translate(${cx} ${cy})">
        <g>${motion(b.orbit.d).replace('KP', b.keyPoints)}<line x1="0" y1="0" x2="0" y2="${-b.h + b.rad * 0.6}" class="post"/><ellipse rx="3.2" ry="1.2" class="postfoot"/></g>
        ${b.name === 'earth' ? moon(b, 'far') : ''}
        <g>${motion(b.lifted.d, 'rotate="auto"').replace('KP', b.keyPoints)}${planet(b)}</g>
        ${b.name === 'earth' ? moon(b, 'near') : ''}
      </g></g>`;
    }
    return s;
  }

  // the Moon circles the Earth on a small tilted orbit: it follows the Earth's lifted path, then its own.
  // Its far half is drawn before the Earth's body and its near half after (each clipped in the Earth's frame).
  let moonPath = null;
  function moon(b, half) {
    if (!moonPath) {
      const P_M = P / 5.2;                                   // stylised: about five turns in the run
      const thM = taus.map((tau) => -2 * Math.PI * tau / P_M + Math.PI * 0.5);
      const sw = thM.map((x) => thM[0] - x);
      const mo = orbitPath(28, 0.32, thM[0], sw[sw.length - 1] / (2 * Math.PI) + 0.02, 0, 6);
      moonPath = { d: mo.d, kp: sw.map((x) => f4(Math.min(1, mo.frac(x)))).join(';') };
    }
    const body = `<g>${motion(moonPath.d).replace('KP', moonPath.kp)}<circle r="4.2" class="moon"/></g>`;
    return `<g>${motion(b.lifted.d).replace('KP', b.keyPoints)}
      ${half === 'far' ? `<ellipse rx="28" ry="${f(28 * 0.32)}" class="moonorbit"/>` : ''}
      <g clip-path="url(#clip-moon-${half})">${body}</g>
    </g>`;
  }

  function planet(b) {
    const r = b.rad;
    const night = `M${-r} 0A${r} ${r} 0 0 0 ${r} 0A${r} ${f(r * 0.38)} 0 0 1 ${-r} 0Z`;
    let s = `<circle r="${r}" fill="${b.wash}" class="body"/>`;
    if (b.name === 'earth') s += `<path d="M-6 -6q4 -3 7 0t5 4q-3 3 -6 1t-6 -5z M2 3q3 1 4 4q-3 1 -5 -1z" class="land"/>`;
    if (b.name === 'mars') s += `<circle cx="-2" cy="-2" r="2.2" class="land"/>`;
    s += `<path d="${night}" fill="url(#hatch-fine)" class="night"/><circle r="${r}" class="bodyline"/>`;
    return s;
  }

  // orbit lines and the calendar ring: full ellipses behind, the near halves again in front of the column
  let rings = '';
  for (const b of bodies) rings += `<ellipse cx="${cx}" cy="${cy}" rx="${b.a}" ry="${f(b.a * k)}" class="orbit"/>`;
  rings += `<ellipse cx="${cx}" cy="${cy}" rx="${ringA}" ry="${f(ringA * k)}" class="calring"/>`;
  rings += `<ellipse cx="${cx}" cy="${cy}" rx="${ringA + 14}" ry="${f((ringA + 14) * k)}" class="calring thin"/>`;
  let ticks = '';
  for (let i = 0; i < 72; i++) {
    const th = i * 5 * Math.PI / 180, major = (i % 6) === 3;           // majors line up with the numerals (105° + 30°·n)
    const r0 = ringA + (major ? -6 : 0), r1 = ringA + (major ? 20 : 14);
    ticks += `<line x1="${f(cx + r0 * Math.cos(th))}" y1="${f(cy + k * r0 * Math.sin(th))}" x2="${f(cx + r1 * Math.cos(th))}" y2="${f(cy + k * r1 * Math.sin(th))}" class="${major ? 'tick major' : 'tick'}"/>`;
  }
  const lines = `<g class="drawin-fade">${rings}${ticks}</g>`;

  const earth = bodies.find((b) => b.name === 'earth');
  const earthTheta = (t) => {                                      // θ_E at time t (linear between samples)
    if (t <= ts[0]) return earth.th[0];
    for (let i = 1; i < ts.length; i++) if (t <= ts[i]) { const w = (t - ts[i - 1]) / (ts[i] - ts[i - 1]); return earth.th[i - 1] + (earth.th[i] - earth.th[i - 1]) * w; }
    return earth.th[earth.th.length - 1];
  };

  return {
    back: `${lines}<g class="bodies">${bodiesCopy(false)}</g>`,
    front: `<g clip-path="url(#clip-front)">${lines}</g><g class="bodies">${bodiesCopy(true)}</g>`,
    clips: [`<clipPath id="clip-front" clipPathUnits="userSpaceOnUse"><rect x="0" y="${cy}" width="1080" height="400"/></clipPath>`,
      ...bodies.map((b) => `<clipPath id="clip-front-${b.name}" clipPathUnits="userSpaceOnUse"><rect x="0" y="${cy - b.h}" width="1080" height="400"/></clipPath>`),
      '<clipPath id="clip-moon-near" clipPathUnits="userSpaceOnUse"><rect x="-60" y="0" width="120" height="60"/></clipPath>',
      '<clipPath id="clip-moon-far" clipPathUnits="userSpaceOnUse"><rect x="-60" y="-60" width="120" height="60"/></clipPath>'].join(''),
    earthTheta,
    earthStart: earth.th[0],
  };
}
