/*
 * 82 · score.js — the piece as data. Tone.js plays it (synth.js) and the picture is choreographed from it (main.js);
 * nothing is analysed from the audio. 120 BPM, 4/4, F major, four bars + a final chord that rings out.
 *   note = { t: onset (s), d: duration (s), m: MIDI pitch (or [pitches] for chords), v: velocity 0..1 }
 */
export const BPM = 120;
export const BEAT = 60 / BPM;          // 0.5 s
export const BAR = 4 * BEAT;           // 2 s
export const D = 9.6;                  // the last chord at 8.0 s rings out to the end
export const FINAL = 4 * BAR;          // 8.0 s

const n = (t, d, m, v = 0.8) => ({ t, d, m, v });

// kick: one soft "point" at 0, then half-time in bar 2, four-on-the-floor + syncopation in bar 3, full + fill in bar 4
export const KICK = [
  n(0.0, 0.3, 29, 0.7),
  n(2.0, 0.3, 29, 0.85), n(3.0, 0.3, 29, 0.8),
  n(4.0, 0.3, 29, 0.9), n(4.75, 0.3, 29, 0.65), n(5.0, 0.3, 29, 0.85), n(5.5, 0.3, 29, 0.8),
  n(6.0, 0.3, 29, 0.95), n(6.5, 0.3, 29, 0.85), n(7.0, 0.3, 29, 0.95), n(7.5, 0.3, 29, 0.85), n(7.75, 0.2, 29, 0.6), n(7.875, 0.2, 29, 0.7),
  n(FINAL, 0.6, 29, 1.0),
];

// closed hats: a pickup at the end of bar 1, off-beat eighths in bar 2, eighths in bar 3, sixteenths in bar 4
export const HAT = [];
HAT.push(n(1.5, 0.05, 0, 0.55), n(1.75, 0.05, 0, 0.6));
for (const t of [2.25, 2.75, 3.25, 3.75, 3.875]) HAT.push(n(t, 0.05, 0, t % 0.5 ? 0.7 : 0.5));
for (let i = 0; i < 8; i++) HAT.push(n(4 + i * 0.25, 0.05, 0, i % 2 ? 0.75 : 0.5));
for (let i = 0; i < 16; i++) HAT.push(n(6 + i * 0.125, 0.04, 0, i % 4 === 2 ? 0.85 : i % 2 ? 0.45 : 0.6));

// claps on beats 2 and 4 of bars 3–4
export const CLAP = [n(4.5, 0.15, 0, 0.8), n(5.5, 0.15, 0, 0.85), n(6.5, 0.15, 0, 0.9), n(7.5, 0.15, 0, 1.0)];

// bass: D – B♭ – C under the melody, then the low F of the final chord
export const BASS = [
  n(2.0, 0.6, 38, 0.9), n(2.75, 0.2, 38, 0.7), n(3.0, 0.4, 45, 0.8), n(3.5, 0.4, 48, 0.8),
  n(4.0, 0.6, 34, 0.95), n(4.75, 0.2, 34, 0.7), n(5.0, 0.4, 41, 0.8), n(5.5, 0.25, 46, 0.8), n(5.75, 0.2, 45, 0.75),
  n(6.0, 0.6, 36, 1.0), n(6.75, 0.2, 36, 0.75), n(7.0, 0.4, 43, 0.85), n(7.5, 0.2, 46, 0.8), n(7.75, 0.2, 48, 0.85),
  n(FINAL, 1.2, 29, 1.0),
];

// melody (F major pentatonic, FM bell): sparse → falling phrase → rising arpeggio → climax on D6 → F-A-C chord
export const MEL = [
  n(0.5, 0.6, 69, 0.6), n(1.0, 0.5, 72, 0.65), n(1.5, 0.4, 74, 0.7), n(1.75, 0.25, 72, 0.6),
  n(2.25, 0.25, 74, 0.7), n(2.5, 0.25, 72, 0.65), n(2.75, 0.5, 69, 0.75), n(3.25, 0.25, 67, 0.6), n(3.5, 0.25, 69, 0.65), n(3.75, 0.25, 72, 0.7),
  n(4.0, 0.25, 74, 0.75), n(4.25, 0.25, 77, 0.75), n(4.5, 0.5, 81, 0.85), n(5.0, 0.25, 79, 0.7), n(5.25, 0.25, 77, 0.7), n(5.5, 0.25, 74, 0.7), n(5.75, 0.25, 77, 0.75),
  n(6.0, 0.25, 79, 0.8), n(6.25, 0.25, 81, 0.85), n(6.5, 0.5, 84, 0.9), n(7.0, 0.5, 86, 1.0), n(7.5, 0.25, 84, 0.85), n(7.75, 0.25, 81, 0.8),
  n(FINAL, 1.1, 77, 0.9), n(FINAL, 1.1, 81, 0.9), n(FINAL, 1.1, 84, 0.95),
];

// pad: Fmaj9 – Dm9 – B♭maj9 – C9sus4 – Fmaj9
export const PAD = [
  n(0.0, 1.9, [53, 57, 60, 64, 67], 0.7),
  n(2.0, 1.9, [50, 53, 57, 60, 64], 0.7),
  n(4.0, 1.9, [46, 50, 53, 57, 60], 0.75),
  n(6.0, 1.9, [48, 53, 58, 62, 67], 0.8),
  n(FINAL, 0.9, [53, 57, 60, 64, 67], 0.85),
];

export const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
