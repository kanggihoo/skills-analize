/*
 * 77 · cut.js — small Paper.js helpers: primitive shapes, the "hand-cut" pass (resample → wobble → smooth),
 * cached live boolean slots, and day → dusk → night colour mixing. Uses the global `paper` (paper-core.js).
 * All items are created with paper.settings.insertItems = false and inserted explicitly by main.js.
 */
import { ramp, lerp } from '../_lib/stage.js';

const P = () => window.paper;

export const pt = (x, y) => new (P().Point)(x, y);
export const rect = (x, y, w, h, r = 0) => new (P().Path.Rectangle)({ rectangle: new (P().Rectangle)(x, y, w, h), radius: r });
export const circle = (x, y, r) => new (P().Path.Circle)({ center: [x, y], radius: r });
export const ellipse = (x, y, rx, ry) => new (P().Path.Ellipse)({ center: [x, y], radius: [rx, ry] });
export const poly = (pts) => new (P().Path)({ segments: pts, closed: true });
export const star = (x, y, n, r1, r2, rot = 0) => {
  const s = new (P().Path.Star)({ center: [x, y], points: n, radius1: r1, radius2: r2 });
  if (rot) s.rotate(rot, pt(x, y));
  return s;
};
/** unite a list (Paper 0.16 takes an array of operands and merges them divide-and-conquer) */
export const uniteAll = (list) => (list.length === 1 ? list[0] : list[0].unite(list.slice(1)));
/** disjoint shapes as one compound (cheaper than a union when they never touch) */
export const compound = (list) => new (P().CompoundPath)({ children: list });

/**
 * The hand-cut pass: resample the outline every `step` px, push each sample along the normal by a smooth
 * position-based wobble (the same place always wobbles the same way, so a growing shape does not "boil"),
 * then Catmull-Rom smooth. Rounds sharp cusps to roughly step/2 — scissors, not a plotter.
 */
export function handCut(item, step = 10, amp = 1.2, seed = 0) {
  if (!item) return null;
  const kids = item.className === 'CompoundPath' ? item.children.slice() : [item];
  const out = [];
  for (const path of kids) {
    const L = path.length;
    if (!(L > 4)) continue;
    const n = Math.max(12, Math.round(L / step)), segs = [];
    for (let i = 0; i < n; i++) {
      const off = (i / n) * L, q = path.getPointAt(off);
      if (!q) continue;
      const nv = path.getNormalAt(off);
      const d = amp * (0.6 * Math.sin(q.x / 29 + q.y / 41 + seed) + 0.4 * Math.sin(q.x / 11 - q.y / 17 + seed * 1.7));
      segs.push(nv ? q.add(nv.multiply(d)) : q);
    }
    if (segs.length < 3) continue;
    const np = new (P().Path)({ segments: segs, closed: true });
    np.smooth({ type: 'catmull-rom', factor: 0.5 });
    out.push(np);
  }
  if (!out.length) return null;
  return out.length === 1 ? out[0] : compound(out);
}

/**
 * A live boolean slot: an empty group at a fixed place in the scene whose content is rebuilt only when its key
 * (the rounded inputs, all functions of t) changes. Same key → same geometry, so frame(t) stays pure.
 */
export function slot(parent) {
  const g = new (P().Group)();
  parent.addChild(g);
  return {
    g, key: undefined, item: null,
    set(key, build) {
      if (key !== this.key) {
        g.removeChildren();
        this.item = build();
        if (this.item) g.addChild(this.item);
        this.key = key;
      }
      return this.item;
    },
  };
}

// ---- time of day ------------------------------------------------------------------------------------------
export const DUSK = [4.1, 6.1], NIGHT = [6.2, 8.2];
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
/** [day, dusk, night] → rgb at t */
export function tod(c, t) {
  return mix(mix(c[0], c[1], ramp(t, DUSK[0], DUSK[1])), c[2], ramp(t, NIGHT[0], NIGHT[1]));
}
export const col = (rgb, a = 1) => new (P().Color)(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, a);

/** small integer hash → [0, 1) (stop-motion jitter per flat and per 1/12 s) */
export function hash(a, b) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
