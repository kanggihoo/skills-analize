/*
 * 28 · the camera as a pure function of t (shared by main.js and the Node framing check).
 * Orbit-style camera around a moving target; screen-up follows world -z so the approach runs down the tall frame.
 */
const io = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const p = io(clamp01((t - t0) / (t1 - t0)));
        return Array.isArray(v0) ? v0.map((a, j) => a + (v1[j] - a) * p) : v0 + (v1 - v0) * p;
      }
    }
    return keys[keys.length - 1][1];
  };
}

export const FOV = 38 * Math.PI / 180;               // vertical field of view
export const FOCAL = 960 / Math.tan(FOV / 2);         // px
export const CY = 880;                                // lens shift: the optical centre sits above the middle (captions below)

// azimuth turns the frame with the orbit (the cores swing 293° around each other; the camera takes 113° of it,
// so on screen they trade places top ↔ bottom), the camera rises over the passage and pulls back for the tails
const dist = track([[0, 112], [2.2, 96], [3.4, 100], [6.0, 150], [9.5, 188]]);
const elev = track([[0, 54], [3.0, 66], [6.0, 70], [9.5, 63]]);
const azim = track([[0, 39], [1.0, 36], [5.5, -40], [9.5, -74]]);
const tgt = track([[0, [0, 0, 0]], [9.5, [0, 0, 0]]]);

export function camera(t) {
  const el = elev(t) * Math.PI / 180, az = azim(t) * Math.PI / 180, d = dist(t);
  const target = tgt(t);
  const eye = [target[0] + d * Math.cos(el) * Math.sin(az), target[1] + d * Math.sin(el), target[2] + d * Math.cos(el) * Math.cos(az)];
  const f = norm(sub(target, eye));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  /** stage pixel coordinates of a world point, and its depth along the view axis */
  const project = (p) => {
    const q = sub(p, eye), z = q[0] * f[0] + q[1] * f[1] + q[2] * f[2];
    return [540 + FOCAL * (q[0] * r[0] + q[1] * r[1] + q[2] * r[2]) / z, CY - FOCAL * (q[0] * u[0] + q[1] * u[1] + q[2] * u[2]) / z, z];
  };
  return { eye, target, f, r, u, focal: FOCAL, cy: CY, project };
}

function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
