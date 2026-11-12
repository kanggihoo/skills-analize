/*
 * raster.js — the engraver's job, in closed form.
 *
 * A raster engraver sweeps the head along horizontal rows y_j (row pitch d) and reverses direction on every row
 * (boustrophedon). Along a row it follows a trapezoidal velocity profile: constant acceleration A from rest over the
 * distance s_a = V²/2A, cruise at V, the mirror deceleration at the far end. The laser fires wherever the image under
 * the beam is ink. Blank rows are skipped, and every text block (line of type) gets its own row extents.
 *
 * Because each piece is a polynomial in time, everything the film needs has a closed form:
 *   head(t)          where the head is (and how fast it goes, and whether the laser is on) at any t
 *   passAt(x, y)     when the beam centre crossed board pixel (x, y): t_pass = t_row + τ(s), s = distance along the row
 *   speedAt(x, y)    the head speed there, v(s) = √(2As) | V | √(2A(L − s))  → energy per area E = P / (v·d)
 * All coordinates are board pixels (y down). Nothing here depends on the frame that was drawn before.
 */

/**
 * cover: Float32Array MW×MH ink coverage (0..1). blocks: [{ y0, y1 }] in board px, ordered bottom → top (burn order).
 * Rows of a block are aligned on its lowest ink row and laid out upward; a row is kept when its band holds ink.
 */
export function planJob({ cover, MW, MH, blocks, pitch, overscan, sa, tFire, tEnd, stepT, park0, park1, tArrive, tPark }) {
  const ink = (x, y) => cover[y * MW + x] > 0.02;
  const rows = [];
  blocks.forEach((b, bi) => {
    let xmin = MW, xmax = -1, ymin = MH, ymax = -1;
    for (let y = b.y0; y < b.y1; y++) for (let x = 0; x < MW; x++) if (ink(x, y)) {
      if (x < xmin) xmin = x; if (x > xmax) xmax = x; if (y < ymin) ymin = y; if (y > ymax) ymax = y;
    }
    if (xmax < 0) return;
    const xa = xmin - overscan, xb = xmax + 1 + overscan;
    // bands [yb, yb + pitch) from the bottom ink row upward
    for (let yb = ymax + 1 - pitch; yb + pitch > ymin; yb -= pitch) {
      let has = false;
      for (let y = Math.max(0, yb); y < Math.min(MH, yb + pitch) && !has; y++) for (let x = xmin; x <= xmax; x++) if (ink(x, y)) { has = true; break; }
      if (has) rows.push({ block: bi, yb, yc: yb + pitch / 2, xa, xb, L: xb - xa });
    }
  });
  rows.forEach((r, i) => { r.dir = i % 2 ? -1 : 1; r.index = i; });
  const startX = (r) => (r.dir > 0 ? r.xa : r.xb), endX = (r) => (r.dir > 0 ? r.xb : r.xa);

  // moves between rows: a y-step of one pitch inside a block, an eased jump between blocks
  const moves = [];
  let moveSum = 0;
  for (let i = 1; i < rows.length; i++) {
    const p = rows[i - 1], r = rows[i];
    const x0 = endX(p), y0 = p.yc, x1 = startX(r), y1 = r.yc;
    const dur = p.block === r.block ? stepT : 0.05 + Math.hypot(x1 - x0, y1 - y0) / 3200;
    moves.push({ x0, y0, x1, y1, dur });
    moveSum += dur;
  }
  // cruise speed so the last row ends exactly at tEnd: each row takes (L + 2·s_a)/V
  let pathSum = 0;
  for (const r of rows) pathSum += r.L + 2 * sa;
  const V = pathSum / (tEnd - tFire - moveSum), A = (V * V) / (2 * sa), ta = (2 * sa) / V;

  // the timeline
  const segs = [];
  let t = tFire;
  rows.forEach((r, i) => {
    if (i > 0) { const m = moves[i - 1]; segs.push({ kind: 'move', t0: t, t1: t + m.dur, ...m }); t += m.dur; }
    r.t0 = t; r.T = (r.L + 2 * sa) / V;
    segs.push({ kind: 'row', t0: t, t1: t + r.T, row: r });
    t += r.T;
  });

  /** position s (px along the row) and speed v at local time τ in a row of length L and duration T */
  function along(r, tau) {
    if (tau < ta) return { s: 0.5 * A * tau * tau, v: A * tau };
    if (tau < r.T - ta) return { s: sa + V * (tau - ta), v: V };
    const q = Math.max(0, r.T - tau);
    return { s: r.L - 0.5 * A * q * q, v: A * q };
  }
  /** the inverse: local time τ at which the head reaches s, and its speed there */
  function invert(r, s) {
    s = Math.min(r.L, Math.max(0, s));
    if (s < sa) return { tau: Math.sqrt((2 * s) / A), v: Math.sqrt(2 * A * s) };
    if (s <= r.L - sa) return { tau: ta + (s - sa) / V, v: V };
    const q = Math.sqrt((2 * (r.L - s)) / A);
    return { tau: r.T - q, v: A * q };
  }
  const cov = (x, y) => {   // bilinear ink coverage at a board point
    const fx = x - 0.5, fy = y - 0.5, x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
    const g = (xx, yy) => (xx < 0 || yy < 0 || xx >= MW || yy >= MH ? 0 : cover[yy * MW + xx]);
    return (g(x0, y0) * (1 - ax) + g(x0 + 1, y0) * ax) * (1 - ay) + (g(x0, y0 + 1) * (1 - ax) + g(x0 + 1, y0 + 1) * ax) * ay;
  };
  const smooth5 = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  const r0 = rows[0], rN = rows[rows.length - 1];
  const first = { x: startX(r0), y: r0.yc }, last = { x: endX(rN), y: rN.yc };

  /** the head at time t: { x, y, v, on (laser firing over ink, 0..1), row } */
  function head(t) {
    if (t < tFire) {
      const u = smooth5(Math.min(1, Math.max(0, (t - tArrive[0]) / (tArrive[1] - tArrive[0]))));
      return { x: park0.x + (first.x - park0.x) * u, y: park0.y + (first.y - park0.y) * u, v: 0, on: 0, row: -1 };
    }
    if (t >= tEnd) {
      const u = Math.min(1, Math.max(0, (t - tPark[0]) / (tPark[1] - tPark[0])));
      const k = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      return { x: last.x + (park1.x - last.x) * k, y: last.y + (park1.y - last.y) * k, v: 0, on: 0, row: -1 };
    }
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (segs[m].t0 <= t) lo = m; else hi = m - 1; }
    const sg = segs[lo];
    if (sg.kind === 'move') {
      const u = smooth5(Math.min(1, (t - sg.t0) / (sg.t1 - sg.t0)));
      return { x: sg.x0 + (sg.x1 - sg.x0) * u, y: sg.y0 + (sg.y1 - sg.y0) * u, v: 0, on: 0, row: -1 };
    }
    const r = sg.row, { s, v } = along(r, t - sg.t0), x = r.dir > 0 ? r.xa + s : r.xb - s;
    return { x, y: r.yc, v, on: Math.min(1, Math.max(0, (cov(x, r.yc) - 0.25) / 0.5)), row: r.index };
  }

  // every board pixel row → its nearest kept row (blank bands and the margins borrow the closest pass)
  const rowOfY = new Int32Array(MH);
  for (let y = 0; y < MH; y++) {
    let best = 0, bd = Infinity;
    for (let j = 0; j < rows.length; j++) { const d = Math.abs(y + 0.5 - rows[j].yc); if (d < bd) { bd = d; best = j; } }
    rowOfY[y] = best;
  }
  /** t_pass and speed for a board pixel centre */
  function passAt(x, y) {
    const r = rows[rowOfY[y]], s = r.dir > 0 ? x + 0.5 - r.xa : r.xb - (x + 0.5);
    const { tau, v } = invert(r, s);
    return { t: r.t0 + tau, v, yc: r.yc };
  }

  return { rows, segs, V, A, sa, ta, pitch, head, passAt, cov, tFire, tEnd };
}
