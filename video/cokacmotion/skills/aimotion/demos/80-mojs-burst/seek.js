/*
 * seek.js — make a mo.js Timeline a pure function of time.
 *
 * What mo.js 1.3 does on tl.setProgress(p) (read from dist/mo.umd.js, Tween._update / Timeline._updateChildren):
 *   - it renders synchronously (Tween._setProgress → onUpdate → Module._draw writes style/attributes right away)
 *     and never schedules anything: the tweener's requestAnimationFrame loop only starts on play().
 *   - BUT every tween keeps its own _prevTime and only reacts to edges it sees:
 *       · the very first _update of a tween only records the time (nothing is drawn);
 *       · a child whose whole active window [startTime, endTime] lies between the previous and the new time is
 *         skipped entirely — it is never set to progress 1 (or back to 0), and its onStart/onComplete
 *         (which show/hide a Shape) never fire.
 *     So a jump 0 → 9 s leaves early bursts frozen in their start state; the picture would depend on the seek history.
 *
 * Fix (keeps the idiomatic delays/durations/then-chains): every leaf tween's window is known after the first
 * setProgress. To move from `cur` to `ms`, step the master through one sample inside every leaf window that lies
 * between them (in the direction of travel), then land on `ms`. Each leaf then enters and leaves its window exactly as
 * in continuous playback, so its state at `ms` (progress, shown/hidden) depends only on `ms`.
 * Forward playback crosses 0–3 samples per frame; a full backward sweep (loop wrap) is a few hundred cheap calls.
 */
export function createSeeker(tl) {
  // the first update of a fresh timeline only records the time — prime it so the next call draws
  tl.setProgress(0);
  tl.setProgress(0);
  const t0 = tl._props.startTime;
  const total = tl._props.repeatTime;
  const mids = new Set();
  (function walk(node) {
    for (const c of node._timelines) {
      if (c._timelines) walk(c);
      const s = c._props.startTime - t0, e = c._props.endTime - t0;
      if (e > s) mids.add(Math.round(((s + e) / 2) * 1000) / 1000);
    }
  })(tl);
  const samples = [...mids].sort((a, b) => a - b);
  const go = (ms) => tl.setProgress(Math.min(1, Math.max(0, ms / total)));
  let cur = 0;
  go(0);
  return {
    total,
    samples: samples.length,
    seek(ms) {
      if (ms > cur) {
        for (let i = 0; i < samples.length; i++) { const m = samples[i]; if (m > cur && m < ms) go(m); }
      } else if (ms < cur) {
        for (let i = samples.length - 1; i >= 0; i--) { const m = samples[i]; if (m < cur && m > ms) go(m); }
      }
      go(ms);
      cur = ms;
    },
  };
}
