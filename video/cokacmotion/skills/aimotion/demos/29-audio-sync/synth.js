/*
 * 29 · the piece rendered offline with Web Audio: OfflineAudioContext, oscillators + envelopes (AudioParam
 * automation), biquad filters, stereo panners, a generated noise shimmer, and a ConvolverNode reverb whose impulse
 * response is synthesised here (decaying, darkening stereo noise + early reflections). Deterministic: the only
 * randomness is a seeded generator.
 */
import { D, NOTES, PULSES, PAD, SHIMMER, BELL } from './score.js';

export const SR = 48000;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

function impulseResponse(ac, R) {
  const len = Math.floor(2.8 * SR), pre = Math.floor(0.018 * SR);
  const ir = ac.createBuffer(2, len, SR);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    let lp = 0, e = 0;
    for (let i = pre; i < len; i++) {
      const tt = (i - pre) / SR;
      // a one-pole low-pass whose cutoff falls with time: the tail darkens like a real room
      const a = 0.08 + 0.82 * Math.exp(-tt / 0.7);
      lp += a * ((R() * 2 - 1) - lp);
      d[i] = lp * Math.exp(-tt / 0.42) * (1 - Math.exp(-tt / 0.012));
    }
    // a few early reflections, mirrored between the channels
    for (const [ms, g] of [[9, 0.55], [17, 0.42], [29, 0.33], [43, 0.26], [61, 0.2], [83, 0.14]]) {
      d[Math.floor(((ms + (ch ? 2.3 : 0)) * SR) / 1000)] += g * (ch ? -1 : 1) * 0.6;
    }
    for (let i = 0; i < len; i++) e += d[i] * d[i];
    const k = 1 / Math.sqrt(e);                     // unit energy: the wet level is set by a gain
    for (let i = 0; i < len; i++) d[i] *= k;
  }
  return ir;
}

/** renders the piece; returns an AudioBuffer (stereo, 48 kHz, D seconds) */
export async function renderPiece(rand) {
  const R = rand(2929);
  const ac = new OfflineAudioContext({ numberOfChannels: 2, length: Math.ceil(D * SR), sampleRate: SR });

  // master: gentle tanh saturation keeps the chord's peak round
  const master = ac.createGain();
  master.gain.value = 0.62;
  const shaper = ac.createWaveShaper();
  const curve = new Float32Array(2049);
  for (let i = 0; i < curve.length; i++) { const x = (i / 1024) - 1; curve[i] = Math.tanh(1.4 * x) / Math.tanh(1.4); }
  shaper.curve = curve;
  shaper.oversample = '2x';
  master.connect(shaper).connect(ac.destination);
  const dry = ac.createGain();
  dry.connect(master);
  const conv = ac.createConvolver();
  conv.normalize = false;
  conv.buffer = impulseResponse(ac, R);
  const wet = ac.createGain();
  wet.gain.value = 0.34;
  conv.connect(wet).connect(master);
  // a voice goes through its own panner to the dry bus and, scaled, into the reverb
  const out = (node, pan, send) => {
    const p = ac.createStereoPanner();
    p.pan.value = pan;
    node.connect(p).connect(dry);
    const s = ac.createGain();
    s.gain.value = send;
    p.connect(s).connect(conv);
  };
  const panOf = (m) => Math.max(-0.65, Math.min(0.65, (m - 81) / 14));

  // pluck: triangle + a slightly sharp sawtooth through a low-pass whose cutoff falls (the string dulls)
  const pluck = (t, m, vel) => {
    const f = hz(m);
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g2 = ac.createGain();
    o1.type = 'triangle'; o1.frequency.value = f;
    o2.type = 'sawtooth'; o2.frequency.value = f * 1.003;
    g2.gain.value = 0.22;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 0.8;
    lp.frequency.setValueAtTime(Math.min(f * 9, 14000), t);
    lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.4);
    const env = ac.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.3 * vel, t + 0.004);
    env.gain.setTargetAtTime(0, t + 0.004, 0.3);
    o1.connect(lp); o2.connect(g2).connect(lp); lp.connect(env);
    out(env, panOf(m), 0.5);
    for (const o of [o1, o2]) { o.start(t); o.stop(t + 2.2); }
  };
  // bell: additive inharmonic partials, each with its own exponential decay (tuned a hair sharp, as bells are)
  const bell = (t, m, vel) => {
    const f = hz(m) * Math.pow(2, 7 / 1200);
    const sum = ac.createGain();
    sum.gain.value = 0.19 * vel;
    for (const [ratio, amp, tau] of BELL) {
      if (f * ratio > SR * 0.45) continue;
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f * ratio + (ratio === 2 ? 1.3 : 0);   // a slow beat in the octave partial
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.003);
      g.gain.setTargetAtTime(0, t + 0.003, tau);
      o.connect(g).connect(sum);
      o.start(t); o.stop(Math.min(D, t + tau * 8 + 0.1));
    }
    out(sum, panOf(m), 0.75);
  };
  // heartbeat: a sine that drops from 120 to 52 Hz, plus a short D2 body, low-passed
  const pulse = (t, vel) => {
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.5;
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.16);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.75 * vel, t + 0.006);
    g.gain.setTargetAtTime(0, t + 0.03, 0.16);
    const o2 = ac.createOscillator(), g3 = ac.createGain();
    o2.frequency.value = hz(38);
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(0.3 * vel, t + 0.012);
    g3.gain.setTargetAtTime(0, t + 0.04, 0.3);
    o.connect(g).connect(lp); o2.connect(g3).connect(lp);
    out(lp, 0, 0.12);
    for (const x of [o, o2]) { x.start(t); x.stop(t + 1.8); }
  };

  for (const [t, m, voice, vel] of NOTES) (voice === 'bell' ? bell : pluck)(t, m, vel);
  for (const [t, vel] of PULSES) pulse(t, vel);

  // pad: D3 + A3 triangles, slowly swelling under the melody
  {
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, PAD.from);
    g.gain.linearRampToValueAtTime(PAD.level, PAD.peak);
    g.gain.linearRampToValueAtTime(0, PAD.to);
    for (const [m, det] of [[50, -0.0015], [50, 0.0015], [57, 0.001]]) {
      const o = ac.createOscillator();
      o.type = 'triangle'; o.frequency.value = hz(m) * (1 + det);
      o.connect(lp);
      o.start(PAD.from); o.stop(PAD.to);
    }
    lp.connect(g);
    out(g, 0, 0.6);
  }
  // shimmer: band-passed noise rising into the chord, then gone
  {
    const len = Math.ceil(2.6 * SR), nb = ac.createBuffer(2, len, SR);
    for (let ch = 0; ch < 2; ch++) { const d = nb.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = R() * 2 - 1; }
    const src = ac.createBufferSource();
    src.buffer = nb;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(3500, SHIMMER.from);
    bp.frequency.exponentialRampToValueAtTime(8500, SHIMMER.peak);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, SHIMMER.from);
    g.gain.exponentialRampToValueAtTime(SHIMMER.level, SHIMMER.peak);
    g.gain.setTargetAtTime(0, SHIMMER.peak, 0.45);
    src.connect(bp).connect(g);
    out(g, 0, 0.9);
    src.start(SHIMMER.from); src.stop(SHIMMER.from + 2.6);
  }
  return ac.startRendering();
}
