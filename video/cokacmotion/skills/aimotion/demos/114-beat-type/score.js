/*
 * score.js — the one table both the picture and the sound read. Nothing here knows about pixels or audio.
 *
 * 120 bpm, 4/4. One beat of count-in, four bars of chant, one final hit:
 *   bar 1   하나 (1)   둘 (3)
 *   bar 2   셋 (1)     넷 (3)       다시 (4&)   ← the push: the only word that lands off the beat
 *   bar 3   (hole on 1 — the downbeat the push stole)
 *   bar 4   처 (1)  음 (2)  부 (3)  터 (4)  + tom fill on 4e·4&·4a
 *   bar 5   final hit on 1 (crash) — "처음부터": the score replays from the top
 */
export const BPM = 120;
export const BEAT = 60 / BPM;          // 0.5 s
export const T0 = 0.5;                 // downbeat of bar 1 (one beat of count-in before it)
export const D = 10;
export const BARS = 4;

/** seconds at (bar, beat); beat is 1-based and may be fractional: 4.5 = the "and" of 4 */
export const at = (bar, beat) => T0 + ((bar - 1) * 4 + (beat - 1)) * BEAT;
/** inverse: position of t as { bar, beat } (beat fractional, 1-based) */
export const pos = (t) => {
  const b = (t - T0) / BEAT;
  const bar = Math.floor(b / 4) + 1;
  return { bar, beat: b - (bar - 1) * 4 + 1 };
};

// step sequencer, one character per eighth note (1 & 2 & 3 & 4 &): x = hit, . = rest
//   K kick → scale pulse of the active word
//   S snare/clap → changes the picture: on a bar line (or the push) a cut to a new layout, on beat 3 a colour inversion
//   H closed hat → a tick on the counter and the ruler
export const PATTERN = {
  1: { K: 'x..x..x.', S: '....x...', H: 'xxxxxxxx' },
  2: { K: 'x..x...x', S: 'x...x..x', H: 'xxxxxxxx' },
  3: { K: '..x..x.x', S: '....x...', H: '.xxxxxxx' },   // nothing at all on the 1: the hole after the push
  4: { K: 'x.x.x.x.', S: 'x...x...', H: 'xxxxxx..' },
};
export const PICKUP_HATS = [[0, 4], [0, 4.5]];          // count-in
export const TOMS = [[4, 4.25], [4, 4.5], [4, 4.75]];   // fill into the final hit (high → low)
export const CRASH = [[4, 1], [5, 1]];
export const FINAL = [5, 1];                            // kick + clap + crash: the last cut

// the lyric: every word lands on a hit of the pattern above
export const WORDS = [
  { text: '하나', bar: 1, beat: 1 },
  { text: '둘', bar: 1, beat: 3 },
  { text: '셋', bar: 2, beat: 1 },
  { text: '넷', bar: 2, beat: 3 },
  { text: '다시', bar: 2, beat: 4.5, synco: true },
  { text: '처', bar: 4, beat: 1 },
  { text: '음', bar: 4, beat: 2 },
  { text: '부', bar: 4, beat: 3 },
  { text: '터', bar: 4, beat: 4 },
];

// pitches for the sound only (MIDI): a bass note under every word, a chord stab on the push and on the final hit
export const BASS = [45, 52, 41, 48, 43, 48, 50, 52, 55];     // per WORDS entry
export const STAB = { push: [55, 59, 62, 67], final: [45, 57, 60, 64, 69] };

/** every hit as { t, bar, beat, inst, role } sorted by time — inst K S H T C */
export function events() {
  const ev = [];
  for (const [bar, row] of Object.entries(PATTERN)) {
    for (const inst of ['K', 'S', 'H']) {
      [...row[inst]].forEach((c, i) => {
        if (c !== 'x') return;
        const beat = 1 + i / 2, b = Number(bar);
        const role = inst !== 'S' ? '' : beat === 3 ? 'inv' : 'cut';
        ev.push({ t: at(b, beat), bar: b, beat, inst, role, synco: b === 2 && beat === 4.5 && inst !== 'H' });
      });
    }
  }
  for (const [bar, beat] of PICKUP_HATS) ev.push({ t: at(bar, beat), bar, beat, inst: 'H', role: '' });
  for (const [bar, beat] of TOMS) ev.push({ t: at(bar, beat), bar, beat, inst: 'T', role: '' });
  for (const [bar, beat] of CRASH) ev.push({ t: at(bar, beat), bar, beat, inst: 'C', role: '' });
  ev.push({ t: at(...FINAL), bar: FINAL[0], beat: FINAL[1], inst: 'K', role: '' });
  ev.push({ t: at(...FINAL), bar: FINAL[0], beat: FINAL[1], inst: 'S', role: 'cut' });
  return ev.sort((a, b) => a.t - b.t || a.inst.localeCompare(b.inst));
}
