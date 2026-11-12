/*
 * 82 · synth.js — renders the score with Tone.js into an AudioBuffer inside Tone.Offline (an OfflineAudioContext).
 *   kick  MembraneSynth (pitch-swept sine)          hat  MetalSynth (FM "cymbal" partials, high-passed)
 *   clap  NoiseSynth through a band-pass (sound only — the picture never looks at the audio)
 *   bass  MonoSynth (saw, 24 dB low-pass with its own envelope)
 *   melody PolySynth of FMSynth voices (bell), with a dotted-eighth feedback delay
 *   pad   PolySynth of fat-sawtooth Synths through a low-pass
 * Reverb: a Convolver fed with a seeded, exponentially decaying stereo impulse response (no random source of Tone's).
 */
import { D, KICK, HAT, CLAP, BASS, MEL, PAD, midiHz } from './score.js';

export const SR = 44100;

/** → AudioBuffer (a plain one, usable by any AudioContext) */
export async function renderScore(rand) {
  const Tone = window.Tone;
  const tb = await Tone.Offline(async () => {
    const master = new Tone.Gain(0.85);
    const limiter = new Tone.Limiter(-1.5).toDestination();
    master.connect(limiter);
    // fade the last 0.45 s so the loop back to 0 is seamless
    master.gain.setValueAtTime(0.85, 0);
    master.gain.setValueAtTime(0.85, D - 0.45);
    master.gain.linearRampToValueAtTime(0, D - 0.02);

    // seeded impulse response: 2.2 s, decorrelated L/R, darker tail
    const R = rand(8282);
    const len = Math.floor(SR * 2.2);
    const irL = new Float32Array(len), irR = new Float32Array(len);
    let lpL = 0, lpR = 0;
    for (let i = 0; i < len; i++) {
      const x = i / SR;
      const env = Math.exp(-x / 0.55) * Math.min(1, x / 0.004);
      const k = 0.35 + 0.6 * Math.exp(-x / 0.4);      // the tail gets duller (one-pole low-pass)
      lpL += k * ((R() * 2 - 1) - lpL); lpR += k * ((R() * 2 - 1) - lpR);
      irL[i] = lpL * env; irR[i] = lpR * env;
    }
    const verb = new Tone.Convolver(Tone.ToneAudioBuffer.fromArray([irL, irR]));
    const verbOut = new Tone.Gain(0.3).connect(master);
    verb.connect(verbOut);

    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.045, octaves: 6, oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.42, sustain: 0, release: 0.15 }, volume: -3,
    }).connect(master);
    const hat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.07, release: 0.02 }, harmonicity: 5.1, modulationIndex: 32,
      resonance: 5200, octaves: 1.5, volume: -27,
    });
    const hatPan = new Tone.Panner(0.28).connect(master);
    hat.connect(hatPan);
    const clap = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.14, sustain: 0 }, volume: -15 });
    const clapF = new Tone.Filter({ type: 'bandpass', frequency: 1350, Q: 0.9 });
    clap.connect(clapF);
    clapF.connect(master);
    clapF.connect(verb);
    const bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' }, filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.004, decay: 0.25, sustain: 0.5, release: 0.22 },
      filterEnvelope: { attack: 0.002, decay: 0.22, sustain: 0.25, release: 0.3, baseFrequency: 90, octaves: 3.3 }, volume: -10,
    }).connect(master);
    const mel = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01, modulationIndex: 5, oscillator: { type: 'sine' }, modulation: { type: 'sine' },
      envelope: { attack: 0.004, decay: 0.5, sustain: 0.12, release: 0.9 },
      modulationEnvelope: { attack: 0.002, decay: 0.25, sustain: 0.05, release: 0.3 }, volume: -14,
    });
    mel.maxPolyphony = 10;
    const delay = new Tone.FeedbackDelay({ delayTime: 0.375, feedback: 0.3, wet: 1 });
    const delayOut = new Tone.Gain(0.16).connect(master);
    const melPan = new Tone.Panner(-0.12).connect(master);
    mel.connect(melPan);
    mel.connect(verb);
    mel.connect(delay);
    delay.connect(delayOut);
    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 22 },
      envelope: { attack: 0.9, decay: 0.4, sustain: 0.8, release: 1.3 }, volume: -27,
    });
    pad.maxPolyphony = 12;
    const padF = new Tone.Filter({ type: 'lowpass', frequency: 1500, Q: 0.4 });
    pad.connect(padF);
    padF.connect(master);
    padF.connect(verb);

    for (const e of KICK) kick.triggerAttackRelease(midiHz(e.m), e.d, e.t, e.v);
    for (const e of HAT) hat.triggerAttackRelease(320, e.d, e.t, e.v);
    for (const e of CLAP) for (const [dt, v] of [[0, 0.7], [0.011, 0.8], [0.023, 1]]) clap.triggerAttackRelease(dt === 0.023 ? e.d : 0.01, e.t + dt, e.v * v);
    for (const e of BASS) bass.triggerAttackRelease(midiHz(e.m), e.d, e.t, e.v);
    for (const e of MEL) mel.triggerAttackRelease(midiHz(e.m), e.d, e.t, e.v);
    for (const e of PAD) pad.triggerAttackRelease(e.m.map(midiHz), e.d, e.t, e.v * 0.8);
  }, D, 2, SR);

  // copy into a context-free AudioBuffer for the live player
  const out = new AudioBuffer({ numberOfChannels: 2, length: tb.length, sampleRate: SR });
  for (let c = 0; c < 2; c++) out.copyToChannel(tb.getChannelData(Math.min(c, tb.numberOfChannels - 1)), c);
  return out;
}
