/*
 * river.js — the curve machinery behind the text rivers. Pure functions of their inputs (no time, no randomness).
 *
 *   sampleCurve(cv, ctrl, m)   centripetal Catmull–Rom through m control points → dense polyline → resampled at
 *                              equal arc-length steps DS → unit tangents → rotation-minimizing frames by double
 *                              reflection (Wang, Jüttler, Zheng & Liu, "Computation of Rotation Minimizing Frames",
 *                              ACM TOG 27(1), 2008).
 *   frameAt(cv, s, out)        position, tangent and RMF normal at arc length s (linear between samples).
 *   bez3 / bez3d               cubic Bézier point / derivative (the river axes before they converge).
 *   quatFromBasis / slerp / qrot   orientation blend for the glyphs that leave their river.
 */

export const SUB = 12;     // dense samples per Catmull–Rom segment
export const DS = 0.4;     // arc-length step of the resampled curve (world units; a glyph is ~1 unit wide)

/** storage for one sampled curve, reused every frame (no allocation in frame()) */
export function makeCurve(maxCtrl, maxLen) {
  const nDense = (maxCtrl - 1) * SUB + 1;
  const nMax = Math.ceil(maxLen / DS) + 2;
  return {
    ext: new Float64Array((maxCtrl + 2) * 3),
    dense: new Float64Array(nDense * 3), cum: new Float64Array(nDense),
    P: new Float64Array(nMax * 3), T: new Float64Array(nMax * 3), N: new Float64Array(nMax * 3),
    n: 0, nMax, length: 0,
  };
}

/**
 * Catmull–Rom (centripetal, α = ½: no cusps or self-loops between control points) evaluated with the
 * Barry–Goldman pyramid, then arc-length resampling and the double-reflection RMF.
 * ctrl: Float64Array of m points (xyz). The two phantom end points are mirrored from the first/last segment.
 */
export function sampleCurve(cv, ctrl, m) {
  const E = cv.ext, D = cv.dense, cum = cv.cum;
  for (let k = 0; k < 3; k++) {
    E[k] = 2 * ctrl[k] - ctrl[3 + k];
    E[(m + 1) * 3 + k] = 2 * ctrl[(m - 1) * 3 + k] - ctrl[(m - 2) * 3 + k];
  }
  E.set(ctrl.subarray(0, m * 3), 3);

  let nd = 0;
  const knot = (a, b) => {
    const dx = E[b * 3] - E[a * 3], dy = E[b * 3 + 1] - E[a * 3 + 1], dz = E[b * 3 + 2] - E[a * 3 + 2];
    return Math.max(Math.sqrt(Math.sqrt(dx * dx + dy * dy + dz * dz)), 1e-4);   // |ΔP|^½
  };
  for (let s = 0; s < m - 1; s++) {
    const i0 = s, i1 = s + 1, i2 = s + 2, i3 = s + 3;          // ext indices of P(s-1), P(s), P(s+1), P(s+2)
    const t0 = 0, t1 = knot(i0, i1), t2 = t1 + knot(i1, i2), t3 = t2 + knot(i2, i3);
    for (let j = 0; j < SUB; j++) {
      const u = t1 + (t2 - t1) * (j / SUB);
      for (let k = 0; k < 3; k++) {
        const p0 = E[i0 * 3 + k], p1 = E[i1 * 3 + k], p2 = E[i2 * 3 + k], p3 = E[i3 * 3 + k];
        const a1 = ((t1 - u) * p0 + (u - t0) * p1) / (t1 - t0);
        const a2 = ((t2 - u) * p1 + (u - t1) * p2) / (t2 - t1);
        const a3 = ((t3 - u) * p2 + (u - t2) * p3) / (t3 - t2);
        const b1 = ((t2 - u) * a1 + (u - t0) * a2) / (t2 - t0);
        const b2 = ((t3 - u) * a2 + (u - t1) * a3) / (t3 - t1);
        D[nd * 3 + k] = ((t2 - u) * b1 + (u - t1) * b2) / (t2 - t1);
      }
      nd++;
    }
  }
  for (let k = 0; k < 3; k++) D[nd * 3 + k] = ctrl[(m - 1) * 3 + k];
  nd++;

  // cumulative chord length of the dense polyline
  cum[0] = 0;
  for (let i = 1; i < nd; i++) {
    const dx = D[i * 3] - D[i * 3 - 3], dy = D[i * 3 + 1] - D[i * 3 - 2], dz = D[i * 3 + 2] - D[i * 3 - 1];
    cum[i] = cum[i - 1] + Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // equal arc-length resampling: glyph spacing along the river is then exact
  const L = cum[nd - 1];
  const n = Math.max(2, Math.min(cv.nMax, Math.floor(L / DS) + 1));
  const P = cv.P, T = cv.T, N = cv.N;
  for (let j = 0, q = 0; j < n; j++) {
    const s = j * DS;
    while (q < nd - 2 && cum[q + 1] < s) q++;
    const seg = cum[q + 1] - cum[q];
    const a = seg > 1e-12 ? Math.min(1, Math.max(0, (s - cum[q]) / seg)) : 0;
    for (let k = 0; k < 3; k++) P[j * 3 + k] = D[q * 3 + k] + (D[(q + 1) * 3 + k] - D[q * 3 + k]) * a;
  }
  cv.n = n;
  cv.length = (n - 1) * DS;

  // unit tangents (central differences)
  for (let j = 0; j < n; j++) {
    const a = j > 0 ? j - 1 : 0, b = j < n - 1 ? j + 1 : n - 1;
    let x = P[b * 3] - P[a * 3], y = P[b * 3 + 1] - P[a * 3 + 1], z = P[b * 3 + 2] - P[a * 3 + 2];
    const l = Math.hypot(x, y, z) || 1;
    T[j * 3] = x / l; T[j * 3 + 1] = y / l; T[j * 3 + 2] = z / l;
  }

  // RMF, double reflection. r0 = world up made perpendicular to the first tangent (x if the tangent is vertical)
  {
    let rx = 0, ry = 1, rz = 0;
    let d = ry * T[1];
    if (Math.abs(T[1]) > 0.98) { rx = 1; ry = 0; d = T[0]; }
    rx -= d * T[0]; ry -= d * T[1]; rz -= d * T[2];
    const l = Math.hypot(rx, ry, rz);
    N[0] = rx / l; N[1] = ry / l; N[2] = rz / l;
  }
  for (let j = 0; j < n - 1; j++) {
    const o = j * 3, o1 = o + 3;
    const v1x = P[o1] - P[o], v1y = P[o1 + 1] - P[o + 1], v1z = P[o1 + 2] - P[o + 2];
    const c1 = v1x * v1x + v1y * v1y + v1z * v1z;
    let rx = N[o], ry = N[o + 1], rz = N[o + 2];
    if (c1 > 1e-14) {
      // reflect r and t in the bisecting plane of x_j, x_j+1 …
      const kr = (2 / c1) * (v1x * rx + v1y * ry + v1z * rz);
      rx -= kr * v1x; ry -= kr * v1y; rz -= kr * v1z;
      const tx0 = T[o], ty0 = T[o + 1], tz0 = T[o + 2];
      const kt = (2 / c1) * (v1x * tx0 + v1y * ty0 + v1z * tz0);
      const tLx = tx0 - kt * v1x, tLy = ty0 - kt * v1y, tLz = tz0 - kt * v1z;
      // … then in the plane that maps the reflected tangent onto t_j+1
      const v2x = T[o1] - tLx, v2y = T[o1 + 1] - tLy, v2z = T[o1 + 2] - tLz;
      const c2 = v2x * v2x + v2y * v2y + v2z * v2z;
      if (c2 > 1e-14) {
        const k2 = (2 / c2) * (v2x * rx + v2y * ry + v2z * rz);
        rx -= k2 * v2x; ry -= k2 * v2y; rz -= k2 * v2z;
      }
    }
    // keep it exactly perpendicular and unit (round-off only)
    const d = rx * T[o1] + ry * T[o1 + 1] + rz * T[o1 + 2];
    rx -= d * T[o1]; ry -= d * T[o1 + 1]; rz -= d * T[o1 + 2];
    const l = Math.hypot(rx, ry, rz) || 1;
    N[o1] = rx / l; N[o1 + 1] = ry / l; N[o1 + 2] = rz / l;
  }
}

/** out[0..2] = position, out[3..5] = unit tangent, out[6..8] = unit RMF normal at arc length s */
export function frameAt(cv, s, out) {
  const f = Math.min(Math.max(s / DS, 0), cv.n - 1.000001);
  const i = Math.floor(f), a = f - i, o = i * 3, o1 = o + 3;
  const P = cv.P, T = cv.T, N = cv.N;
  for (let k = 0; k < 3; k++) {
    out[k] = P[o + k] + (P[o1 + k] - P[o + k]) * a;
    out[3 + k] = T[o + k] + (T[o1 + k] - T[o + k]) * a;
    out[6 + k] = N[o + k] + (N[o1 + k] - N[o + k]) * a;
  }
  let l = Math.hypot(out[3], out[4], out[5]) || 1;
  out[3] /= l; out[4] /= l; out[5] /= l;
  const d = out[6] * out[3] + out[7] * out[4] + out[8] * out[5];
  out[6] -= d * out[3]; out[7] -= d * out[4]; out[8] -= d * out[5];
  l = Math.hypot(out[6], out[7], out[8]) || 1;
  out[6] /= l; out[7] /= l; out[8] /= l;
  return out;
}

/** cubic Bézier through 4 points [[x,y,z]×4] */
export function bez3(c, u, out = [0, 0, 0]) {
  const v = 1 - u, b0 = v * v * v, b1 = 3 * v * v * u, b2 = 3 * v * u * u, b3 = u * u * u;
  for (let k = 0; k < 3; k++) out[k] = b0 * c[0][k] + b1 * c[1][k] + b2 * c[2][k] + b3 * c[3][k];
  return out;
}
export function bez3d(c, u, out = [0, 0, 0]) {
  const v = 1 - u;
  for (let k = 0; k < 3; k++) out[k] = 3 * v * v * (c[1][k] - c[0][k]) + 6 * v * u * (c[2][k] - c[1][k]) + 3 * u * u * (c[3][k] - c[2][k]);
  return out;
}

/** unit quaternion [x, y, z, w] of the rotation whose matrix has columns X, Y, Z (orthonormal, right-handed) */
export function quatFromBasis(X, Y, Z, q) {
  const m00 = X[0], m10 = X[1], m20 = X[2], m01 = Y[0], m11 = Y[1], m21 = Y[2], m02 = Z[0], m12 = Z[1], m22 = Z[2];
  const tr = m00 + m11 + m22;
  if (tr > 0) {
    const s = 0.5 / Math.sqrt(tr + 1);
    q[3] = 0.25 / s; q[0] = (m21 - m12) * s; q[1] = (m02 - m20) * s; q[2] = (m10 - m01) * s;
  } else if (m00 > m11 && m00 > m22) {
    const s = 2 * Math.sqrt(Math.max(1 + m00 - m11 - m22, 1e-12));
    q[3] = (m21 - m12) / s; q[0] = 0.25 * s; q[1] = (m01 + m10) / s; q[2] = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = 2 * Math.sqrt(Math.max(1 + m11 - m00 - m22, 1e-12));
    q[3] = (m02 - m20) / s; q[0] = (m01 + m10) / s; q[1] = 0.25 * s; q[2] = (m12 + m21) / s;
  } else {
    const s = 2 * Math.sqrt(Math.max(1 + m22 - m00 - m11, 1e-12));
    q[3] = (m10 - m01) / s; q[0] = (m02 + m20) / s; q[1] = (m12 + m21) / s; q[2] = 0.25 * s;
  }
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  q[0] /= l; q[1] /= l; q[2] /= l; q[3] /= l;
  return q;
}

/** spherical interpolation along the shorter arc */
export function slerp(a, b, e, out) {
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  let d = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
  if (d < 0) { d = -d; bx = -bx; by = -by; bz = -bz; bw = -bw; }
  let s0, s1;
  if (d > 0.9995) { s0 = 1 - e; s1 = e; }
  else {
    const th = Math.acos(Math.min(d, 1)), sn = Math.sin(th);
    s0 = Math.sin((1 - e) * th) / sn; s1 = Math.sin(e * th) / sn;
  }
  out[0] = s0 * a[0] + s1 * bx; out[1] = s0 * a[1] + s1 * by; out[2] = s0 * a[2] + s1 * bz; out[3] = s0 * a[3] + s1 * bw;
  const l = Math.hypot(out[0], out[1], out[2], out[3]) || 1;
  out[0] /= l; out[1] /= l; out[2] /= l; out[3] /= l;
  return out;
}

/** rotate v by unit quaternion q */
export function qrot(q, vx, vy, vz, out) {
  const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  const tx = 2 * (qy * vz - qz * vy), ty = 2 * (qz * vx - qx * vz), tz = 2 * (qx * vy - qy * vx);
  out[0] = vx + qw * tx + (qy * tz - qz * ty);
  out[1] = vy + qw * ty + (qz * tx - qx * tz);
  out[2] = vz + qw * tz + (qx * ty - qy * tx);
  return out;
}
