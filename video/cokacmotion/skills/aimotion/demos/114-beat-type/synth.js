/*
 * synth.js — the score (score.js) played once into an AudioBuffer with OfflineAudioContext, in setup.
 * The picture never reads this buffer: it reads the same score table, so it stays exact with the sound off.
 * Noise comes from rand(seed), so the buffer is the same on every load.
 */
import { rand } from '../_lib/stage.js';
import { events, WORDS, BASS, STAB, at, FINAL, D } from './score.js';

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

export async function renderSound() {
  const SR = 44100;
  const ctx = new OfflineAudioContext(2, Math.ceil(D * SR), SR);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.12;
  const master = ctx.createGain();
  master.gain.value = 0.72;
  master.connect(comp).connect(ctx.destination);

  const r = rand(11407);
  const noise = ctx.createBuffer(1, SR * 4, SR);
  { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }

  const out = (pan = 0) => { const p = ctx.createStereoPanner(); p.pan.value = pan; p.connect(master); return p; };
  const env = (g, t, peak, dec, att = 0.002) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + att + dec);
  };
  const noiseSrc = (t, dur, offset = 0) => {
    const s = ctx.createBufferSource();
    s.buffer = noise;
    s.start(t, offset % 1.5, dur);
    return s;
  };
  const filt = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };

  function kick(t, amp = 1) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(165, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.13);
    env(g, t, 0.95 * amp, 0.42);
    o.connect(g).connect(out());
    o.start(t); o.stop(t + 0.5);
    const c = noiseSrc(t, 0.02, t * 7.3), cg = ctx.createGain(), hp = filt('highpass', 2500);
    env(cg, t, 0.25 * amp, 0.012, 0.0005);
    c.connect(hp).connect(cg).connect(out());
  }
  function snare(t, clap) {
    const n = noiseSrc(t, 0.35, t * 3.1), bp = filt('bandpass', 1900, 0.75), g = ctx.createGain();
    env(g, t, 0.55, 0.19);
    n.connect(bp).connect(g).connect(out(-0.05));
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(205, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    env(og, t, 0.38, 0.09);
    o.connect(og).connect(out());
    o.start(t); o.stop(t + 0.2);
    if (clap) {   // a cut is a snare + hand clap: three bursts 9 ms apart, then the tail
      for (let k = 0; k < 3; k++) {
        const c = noiseSrc(t + k * 0.009, 0.06, t * 5 + k), cb = filt('bandpass', 1300, 1.4), cg = ctx.createGain();
        env(cg, t + k * 0.009, 0.42, k < 2 ? 0.012 : 0.16, 0.0008);
        c.connect(cb).connect(cg).connect(out(0.08));
      }
    }
  }
  function hat(t, accent) {
    const n = noiseSrc(t, 0.08, t * 11.7), hp = filt('highpass', 7600), g = ctx.createGain();
    env(g, t, accent ? 0.2 : 0.11, accent ? 0.05 : 0.035, 0.0008);
    n.connect(hp).connect(g).connect(out(0.32));
  }
  function tom(t, f) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.62, t + 0.22);
    env(g, t, 0.7, 0.28);
    o.connect(g).connect(out(f > 150 ? 0.2 : -0.2));
    o.start(t); o.stop(t + 0.35);
  }
  function crash(t) {
    const n = noiseSrc(t, 2.4, t * 2.2), hp = filt('highpass', 4200), g = ctx.createGain();
    env(g, t, 0.3, 1.9, 0.001);
    n.connect(hp).connect(g).connect(out(0.15));
    const n2 = noiseSrc(t, 1.2, t * 4.4 + 0.5), bp = filt('bandpass', 9000, 2), g2 = ctx.createGain();
    env(g2, t, 0.22, 0.9, 0.001);
    n2.connect(bp).connect(g2).connect(out(-0.2));
  }
  function bass(t, m, dur = 0.42, amp = 0.5) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = filt('lowpass', 700, 2), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'square';
    o.frequency.value = hz(m); o2.frequency.value = hz(m) * 0.5;
    lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(260, t + dur);
    env(g, t, amp, dur, 0.004);
    o.connect(lp); o2.connect(lp); lp.connect(g).connect(out());
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function stab(t, notes, dur, amp) {
    const lp = filt('lowpass', 3200, 1.2), g = ctx.createGain();
    lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    env(g, t, amp, dur, 0.003);
    lp.connect(g).connect(out());
    notes.forEach((m, i) => {
      for (const det of [-9, 8]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = det + i;
        o.connect(lp); o.start(t); o.stop(t + dur + 0.05);
      }
    });
  }

  const tomF = [235, 180, 132];
  let tomI = 0;
  for (const e of events()) {
    if (e.inst === 'K') kick(e.t, e.beat === 1 ? 1 : 0.85);
    else if (e.inst === 'S') snare(e.t, e.role === 'cut');
    else if (e.inst === 'H') hat(e.t, e.beat % 1 === 0);
    else if (e.inst === 'T') tom(e.t, tomF[tomI++ % 3]);
    else if (e.inst === 'C') crash(e.t);
  }
  WORDS.forEach((w, i) => bass(at(w.bar, w.beat), BASS[i], w.synco ? 0.9 : 0.42, w.synco ? 0.42 : 0.5));
  stab(at(2, 4.5), STAB.push, 0.55, 0.16);
  stab(at(...FINAL), STAB.final, 1.4, 0.14);
  bass(at(...FINAL), STAB.final[0] - 12, 1.3, 0.55);

  return ctx.startRendering();
}
