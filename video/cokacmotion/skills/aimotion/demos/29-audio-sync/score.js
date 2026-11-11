/*
 * 29 · the piece: D major pentatonic (D E F♯ A B), 9.6 s.
 * intro: three bells → melody of plucks over a soft heartbeat pulse → a bell chord and a rising cascade (climax)
 * → a low bell and the reverb tail (afterglow). Used only by the synthesiser; the picture reads the analysis.
 */
export const D = 9.6;
export const SCALE = [2, 4, 6, 9, 11];   // pitch classes of D major pentatonic

// [time s, MIDI, voice, velocity]
export const NOTES = [
  [0.40, 81, 'bell', 0.85], [1.05, 78, 'bell', 0.75], [1.70, 86, 'bell', 0.8],
  [2.30, 74, 'pluck', 0.8], [2.60, 78, 'pluck', 0.7], [2.90, 81, 'pluck', 0.75], [3.20, 83, 'pluck', 0.7],
  [3.50, 81, 'pluck', 0.75], [3.80, 78, 'pluck', 0.7], [4.10, 76, 'pluck', 0.75], [4.40, 81, 'pluck', 0.7],
  [4.70, 86, 'pluck', 0.85], [5.00, 83, 'pluck', 0.7],
  [5.30, 74, 'bell', 0.6], [5.30, 81, 'bell', 0.6], [5.30, 86, 'bell', 0.62], [5.30, 90, 'bell', 0.55],
  [5.62, 78, 'pluck', 0.7], [5.77, 81, 'pluck', 0.72], [5.92, 83, 'pluck', 0.74], [6.07, 86, 'pluck', 0.76],
  [6.22, 88, 'pluck', 0.78], [6.37, 90, 'pluck', 0.8], [6.52, 93, 'pluck', 0.85],
  [6.85, 86, 'bell', 0.75],
  [7.45, 62, 'bell', 0.95], [7.45, 74, 'bell', 0.4],
];

// the heartbeat: [time, velocity]
export const PULSES = [2.3, 2.9, 3.5, 4.1, 4.7, 5.3, 5.9, 6.5, 7.1].map((t, i) => [t, [0.55, 0.6, 0.65, 0.7, 0.75, 0.95, 0.8, 0.65, 0.5][i]]);

// a pad (D3 + A3) that swells under the melody, and a noise shimmer rising into the chord
export const PAD = { from: 2.0, peak: 5.4, to: 8.6, level: 0.05 };
export const SHIMMER = { from: 4.4, peak: 5.3, level: 0.06 };

// bell partials: [frequency ratio, amplitude, decay time constant s]
export const BELL = [[1, 1, 2.4], [2.0, 0.42, 1.4], [2.76, 0.28, 0.85], [5.4, 0.14, 0.42], [8.93, 0.06, 0.2]];
