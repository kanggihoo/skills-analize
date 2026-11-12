/*
 * 29 · offline analysis of the rendered piece (pure JS, no Web Audio): our own radix-2 FFT, per analysis frame
 *   band levels (log-spaced bands, dB, normalised), RMS, low-band level, spectral-flux onsets and the pitches of
 *   each onset (spectral peaks after the attack, parabolic interpolation, harmonic rejection).
 * The visuals read only these tables (as functions of t).
 */

export const AR = 120;                 // analysis frames per second
export const NFFT = 2048;              // analysis window (≈ 43 ms at 48 kHz)
export const NPITCH = 4096;            // pitch window (≈ 85 ms: shorter than the fastest note spacing)
export const BANDS = 64;
export const F_LO = 50, F_HI = 12000;  // band range (log spaced)
export const DB_RANGE = 60;            // levels: global max → 1, max − 60 dB → 0

/** in-place iterative radix-2 complex FFT */
export function makeFFT(n) {
  const levels = Math.log2(n) | 0;
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < levels; b++) r |= ((i >> b) & 1) << (levels - 1 - b); rev[i] = r; }
  const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos((2 * Math.PI * i) / n); sin[i] = -Math.sin((2 * Math.PI * i) / n); }
  return (re, im) => {
    for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = 0, k = 0; j < half; j++, k += step) {
          const a = i + j, b = a + half;
          const tr = re[b] * cos[k] - im[b] * sin[k], ti = re[b] * sin[k] + im[b] * cos[k];
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        }
      }
    }
  };
}

const hann = (n) => Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));

/** magnitude spectrum (n/2 + 1 bins) of a Hann window of x starting at `start` (zero outside x) */
function spectrum(x, start, n, win, fft, re, im, out) {
  for (let i = 0; i < n; i++) { const j = start + i; re[i] = (j >= 0 && j < x.length ? x[j] : 0) * win[i]; im[i] = 0; }
  fft(re, im);
  for (let b = 0; b <= n / 2; b++) out[b] = Math.hypot(re[b], im[b]);
  return out;
}

export const bandOf = (f) => (BANDS * Math.log(f / F_LO)) / Math.log(F_HI / F_LO);   // fractional band index
export const midiOf = (f) => 69 + 12 * Math.log2(f / 440);

/**
 * x: mono samples, sr: sample rate, duration: seconds.
 * returns { frames, bands (frames × BANDS, smoothed 0..1), rms, low (0..1), onsets: [{ t, strength, notes }], pulses: [{ t, strength }] }
 */
export function analyse(x, sr, duration, { scale = [2, 4, 6, 9, 11] } = {}) {
  const frames = Math.ceil(duration * AR) + 1;
  const fft = makeFFT(NFFT), win = hann(NFFT);
  const re = new Float64Array(NFFT), im = new Float64Array(NFFT), mag = new Float64Array(NFFT / 2 + 1);
  const nb = NFFT / 2 + 1, hz = sr / NFFT;
  // band edges in bins
  const edges = Array.from({ length: BANDS + 1 }, (_, i) => (F_LO * Math.pow(F_HI / F_LO, i / BANDS)) / hz);
  const raw = new Float32Array(frames * BANDS);
  const rmsDb = new Float32Array(frames), lowDb = new Float32Array(frames);
  const logMag = [new Float32Array(nb), new Float32Array(nb)];
  const fluxHi = new Float32Array(frames), fluxLo = new Float32Array(frames);
  const winPow = win.reduce((s, w) => s + w * w, 0);
  const lo1 = Math.round(30 / hz), lo2 = Math.round(180 / hz), hi1 = Math.round(280 / hz), hi2 = Math.round(9000 / hz);
  for (let k = 0; k < frames; k++) {
    const centre = Math.round((k / AR) * sr);
    spectrum(x, centre - NFFT / 2, NFFT, win, fft, re, im, mag);
    // band levels (dB of the mean power in the band; a band narrower than a bin interpolates at its centre)
    for (let b = 0; b < BANDS; b++) {
      const a = edges[b], c = edges[b + 1];
      const i0 = Math.ceil(a), i1 = Math.floor(c);
      let p = 0, cnt = 0;
      for (let i = i0; i <= i1 && i < nb; i++) { p += mag[i] * mag[i]; cnt++; }
      if (!cnt) { const m = Math.sqrt(a * c), i = Math.floor(m), f = m - i; const v = mag[i] * (1 - f) + mag[Math.min(i + 1, nb - 1)] * f; p = v * v; cnt = 1; }
      raw[k * BANDS + b] = 10 * Math.log10(p / cnt + 1e-14);
    }
    // RMS (window-weighted) and low-band power
    let s = 0;
    for (let i = 0; i < NFFT; i++) { const j = centre - NFFT / 2 + i; const v = j >= 0 && j < x.length ? x[j] : 0; s += v * v * win[i] * win[i]; }
    rmsDb[k] = 10 * Math.log10(s / winPow + 1e-14);
    let pl = 0;
    for (let i = lo1; i <= lo2; i++) pl += mag[i] * mag[i];
    lowDb[k] = 10 * Math.log10(pl + 1e-14);
    // spectral flux on log-compressed magnitudes (positive changes only), high and low regions separately
    const L = logMag[k & 1], P = logMag[(k + 1) & 1];
    for (let i = 0; i < nb; i++) L[i] = Math.log1p(1000 * mag[i] / NFFT);
    if (k > 0) {
      let fh = 0, fl = 0;
      for (let i = hi1; i <= hi2; i++) { const d = L[i] - P[i]; if (d > 0) fh += d; }
      for (let i = lo1; i <= lo2; i++) { const d = L[i] - P[i]; if (d > 0) fl += d; }
      fluxHi[k] = fh; fluxLo[k] = fl;
    }
  }
  // normalise levels to 0..1 over DB_RANGE below the global maximum, then a falling-peak smoothing
  // (instant attack, release over ~0.5 s) like a spectrum analyser's ballistics
  const norm = (arr) => { let mx = -Infinity; for (const v of arr) mx = Math.max(mx, v); return Float32Array.from(arr, (v) => Math.min(1, Math.max(0, (v - (mx - DB_RANGE)) / DB_RANGE))); };
  const fall = 1 / (AR * 0.5);
  const smoothCols = (arr, stride, n) => {
    for (let c = 0; c < stride; c++) for (let k = 1; k < n; k++) { const i = k * stride + c; arr[i] = Math.max(arr[i], arr[i - stride] - fall); }
    return arr;
  };
  const bands = smoothCols(norm(raw), BANDS, frames);
  const rms = smoothCols(norm(rmsDb), 1, frames);
  const low = smoothCols(norm(lowDb), 1, frames);

  // onsets: peaks of the flux above an adaptive threshold (local mean + a floor), at least 70 ms apart
  const peaks = (flux, floorK, meanK, gap) => {
    let mx = 0; for (const v of flux) mx = Math.max(mx, v);
    const f = Float32Array.from(flux, (v) => v / (mx || 1));
    const out = [], w = Math.round(0.25 * AR), g = Math.round(gap * AR);
    for (let k = 1; k < frames - 1; k++) {
      let m = 0, c = 0;
      for (let j = Math.max(0, k - w); j <= Math.min(frames - 1, k + w); j++) { m += f[j]; c++; }
      const thr = floorK + meanK * (m / c);
      if (f[k] < thr) continue;
      let isMax = true;
      for (let j = Math.max(0, k - 3); j <= Math.min(frames - 1, k + 3); j++) if (f[j] > f[k]) { isMax = false; break; }
      if (!isMax) continue;
      if (out.length && k - out[out.length - 1].k < g) { if (f[k] > out[out.length - 1].s) out[out.length - 1] = { k, s: f[k] }; continue; }
      out.push({ k, s: f[k] });
    }
    return out.map(({ k, s }) => ({ t: k / AR, strength: s }));
  };
  const hiOn = peaks(fluxHi, 0.12, 1.4, 0.07);
  const loOn = peaks(fluxLo, 0.2, 1.4, 0.2).filter((o) => o.t < duration - 0.15);

  // pitches of each high onset: what is NEW in the spectrum — the magnitudes of a 4096 window starting 20 ms
  // after the onset minus those of the window just before it (notes still ringing from earlier fall away),
  // then spectral peaks with parabolic interpolation
  const pf = makeFFT(NPITCH), pw = hann(NPITCH);
  const pre = new Float64Array(NPITCH), pim = new Float64Array(NPITCH);
  const post = new Float64Array(NPITCH / 2 + 1), before = new Float64Array(NPITCH / 2 + 1), pm = new Float64Array(NPITCH / 2 + 1);
  const phz = sr / NPITCH;
  const onsets = hiOn.filter((o) => o.t < duration - 0.15).map((o) => {
    spectrum(x, Math.round((o.t + 0.02) * sr), NPITCH, pw, pf, pre, pim, post);
    spectrum(x, Math.round((o.t - 0.008) * sr) - NPITCH, NPITCH, pw, pf, pre, pim, before);
    // candidates: peaks of the post-onset spectrum (frequency refined there), ranked by how much they grew
    for (let b = 0; b < pm.length; b++) pm[b] = Math.max(0, post[b] - before[b]);
    const b0 = Math.floor(250 / phz), b1 = Math.ceil(2600 / phz);
    const cands = [];
    for (let b = b0; b <= b1; b++) {
      if (!(post[b] > post[b - 1] && post[b] >= post[b + 1])) continue;
      const a = Math.log(post[b - 1] + 1e-12), c = Math.log(post[b] + 1e-12), d = Math.log(post[b + 1] + 1e-12);
      const off = (0.5 * (a - d)) / (a - 2 * c + d || 1e-9);
      cands.push({ f: (b + Math.max(-0.5, Math.min(0.5, off))) * phz, m: Math.max(pm[b - 1], pm[b], pm[b + 1]), p: post[b], g: post[b] / (before[b] + 1e-9) });
    }
    // a peak at 2–4× the frequency of a clearly present lower peak is that note's harmonic, not a note
    // (presence, not growth: a re-struck note that was still ringing grows little, its harmonic may grow more)
    const isHarmonic = (c) => cands.some((d) => {
      if (d.f >= c.f || d.p < 0.5 * c.p) return false;
      const r = c.f / d.f, k = Math.round(r);
      return k >= 2 && k <= 4 && Math.abs(r - k) < 0.02 * k;
    });
    const asNote = (c, top) => {
      const midi = midiOf(c.f), near = Math.round(midi);
      if (Math.abs(midi - near) > 0.35) return null;                    // not a tempered pitch (an inharmonic partial)
      const pc = ((near % 12) + 12) % 12, deg = scale.indexOf(pc);
      if (deg < 0) return null;                                         // not in the scale
      return { f: c.f, midi: near, pc, deg, oct: Math.floor(near / 12) - 1, level: Math.min(1, c.m / top) };
    };
    const fresh = cands.filter((c) => c.m > 0 && !isHarmonic(c)).sort((p, q) => q.m - p.m);
    const notes = [];
    const top = fresh.length ? fresh[0].m : 0;
    for (const c of fresh) {
      if (c.m < top * 0.6 || notes.length >= 4) break;                  // within ~4.4 dB of the strongest new peak
      if (notes.length && c.g < 1.8) continue;                          // a second note must at least ~double its bin (not a beating old note)
      const n = asNote(c, top);
      if (n && !notes.some((q) => q.midi === n.midi)) notes.push(n);
    }
    if (!notes.length) {
      // nothing new and tonal: fall back to the strongest tonal peak present after the onset
      for (const c of cands.filter((c) => !isHarmonic(c)).sort((p, q) => q.p - p.p)) { const n = asNote({ ...c, m: 1 }, 1); if (n) { notes.push(n); break; } }
    }
    return { t: o.t, strength: o.strength, notes };
  });
  return { frames, bands, rms, low, onsets, pulses: loOn };
}
