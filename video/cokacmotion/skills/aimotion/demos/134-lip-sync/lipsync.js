/*
 * lipsync.js — Korean text + a TTS alignment → mouth parameters over time. Pure functions, no drawing.
 *
 *   1. ALIGNMENT   one row per character of the spoken text, as a TTS engine returns it: [char, start, end]
 *                  (spaces and punctuation included; the full stop carries the pause)
 *   2. decompose   Hangul syllable → 초성/중성/종성: s = code − 0xAC00, 초 = ⌊s/588⌋, 중 = ⌊(s mod 588)/28⌋, 종 = s mod 28
 *   3. pronounce   the written jamo → the spoken ones (연음, ㅎ 탈락, 받침 대표음, 비음화, 유음화, 격음화)
 *   4. segments    each spoken syllable → consonant / glide / vowel segments inside its time interval
 *   5. mouthAt     Cohen–Massaro coarticulation: every segment pulls each mouth parameter toward its target
 *                  with an exponential dominance around its centre; the blend is normalised
 *                  F_p(t) = Σ_s D_sp(t)·T_sp / Σ_s D_sp(t),  D_sp(t) = α_sp · exp(−θ_sp |τ|^c),  τ = centre − t
 *                  (θ_sp differs before the centre — anticipation — and after it — carry-over)
 */

// the mouth parameter space (all 0..1 except wide, which is −1 narrow … +1 spread)
export const PARAMS = ['jaw', 'wide', 'round', 'upper', 'teeth', 'tongue', 'press'];
export const NP = PARAMS.length;
export const [JAW, WIDE, ROUND, UPPER, TEETH, TONGUE, PRESS] = [0, 1, 2, 3, 4, 5, 6];

// ================================================================ 1. the alignment (seconds)
// Character-level timings the way a TTS engine reports them. The third column of a syllable row is its end; the
// fourth (optional) is prosodic prominence from the same engine's pitch track: 1 accent, 2 strong accent.
export const ALIGNMENT = [
  ['좋', 1.56, 1.80, 1], ['은', 1.80, 1.94], [' ', 1.94, 1.98],
  ['아', 1.98, 2.18, 2], ['침', 2.18, 2.37], ['입', 2.37, 2.53], ['니', 2.53, 2.69], ['다', 2.69, 3.02],
  ['.', 3.02, 3.60],                                              // the full stop: a pause (and a breath)
  [' ', 3.60, 3.60],
  ['오', 3.60, 3.81], ['늘', 3.81, 3.98], ['은', 3.98, 4.15], [' ', 4.15, 4.22],
  ['바', 4.22, 4.43, 2], ['람', 4.43, 4.61], ['이', 4.61, 4.79], [' ', 4.79, 4.87],
  ['조', 4.87, 5.08, 1], ['금', 5.08, 5.32], [' ', 5.32, 5.34],
  ['불', 5.34, 5.61, 2], ['어', 5.61, 5.83], ['요', 5.83, 6.27],
  ['.', 6.27, 6.27],
];
// SSML-style emphasis marks on whole words (index of the word in the text): the eyebrows rise on this one
export const EMPHASIS = [{ word: '오늘은', kind: 'brow' }];
export const VIS_LEAD = 0.035;   // the picture leads the sound a little (a mouth shape late by a frame reads as lag)

// ================================================================ 2. Hangul decomposition
const CHO = Array.from('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ');
const JUNG = Array.from('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ');
const JONG = ['', ...Array.from('ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ')];
export function decompose(ch) {
  const s = ch.codePointAt(0) - 0xac00;
  if (!(s >= 0 && s <= 11171)) return null;
  return { cho: CHO[Math.floor(s / 588)], jung: JUNG[Math.floor((s % 588) / 28)], jong: JONG[s % 28] };
}

// ================================================================ 3. pronunciation (표준 발음법, the rules a lip needs)
const SPLIT = { ㄳ: 'ㄱㅅ', ㄵ: 'ㄴㅈ', ㄶ: 'ㄴㅎ', ㄺ: 'ㄹㄱ', ㄻ: 'ㄹㅁ', ㄼ: 'ㄹㅂ', ㄽ: 'ㄹㅅ', ㄾ: 'ㄹㅌ', ㄿ: 'ㄹㅍ', ㅀ: 'ㄹㅎ', ㅄ: 'ㅂㅅ' };
const KEEP = { ㄳ: 'ㄱ', ㄵ: 'ㄴ', ㄶ: 'ㄴ', ㄺ: 'ㄱ', ㄻ: 'ㅁ', ㄼ: 'ㄹ', ㄽ: 'ㄹ', ㄾ: 'ㄹ', ㄿ: 'ㅂ', ㅀ: 'ㄹ', ㅄ: 'ㅂ' };
const REP = { ㄱ: 'ㄱ', ㄲ: 'ㄱ', ㅋ: 'ㄱ', ㄴ: 'ㄴ', ㄷ: 'ㄷ', ㅅ: 'ㄷ', ㅆ: 'ㄷ', ㅈ: 'ㄷ', ㅊ: 'ㄷ', ㅌ: 'ㄷ', ㅎ: 'ㄷ', ㄹ: 'ㄹ', ㅁ: 'ㅁ', ㅂ: 'ㅂ', ㅍ: 'ㅂ', ㅇ: 'ㅇ' };
const ASPIRATE = { ㄱ: 'ㅋ', ㄷ: 'ㅌ', ㅈ: 'ㅊ', ㅂ: 'ㅍ' };

/** syllables of one breath group [{ cho, jung, jong }] → spoken [{ on, v, co }] (on/co null when empty) */
export function pronounce(group) {
  const s = group.map((g) => ({ on: g.cho === 'ㅇ' ? null : g.cho, v: g.jung, co: g.jong || null }));
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = s[i + 1];
    if (!a.co || !b) continue;
    if (b.on === null) {                                     // the next syllable starts with a vowel
      if (a.co === 'ㅎ') a.co = null;                        // ㅎ 탈락: 좋은 → 조은
      else if (a.co === 'ㄶ' || a.co === 'ㅀ') { b.on = SPLIT[a.co][0]; a.co = null; }
      else if (SPLIT[a.co]) { b.on = SPLIT[a.co][1]; a.co = SPLIT[a.co][0]; }   // 겹받침: the second one moves over
      else if (a.co !== 'ㅇ') { b.on = a.co; a.co = null; }  // 연음: 침입 → 치밉, 불어 → 부러
    } else if (b.on === 'ㅎ' && ASPIRATE[REP[KEEP[a.co] || a.co]]) {   // 격음화: 축하 → 추카
      b.on = ASPIRATE[REP[KEEP[a.co] || a.co]]; a.co = null;
    } else if ((a.co === 'ㅎ' || a.co === 'ㄶ' || a.co === 'ㅀ') && ASPIRATE[b.on]) {   // 좋다 → 조타
      b.on = ASPIRATE[b.on]; a.co = a.co === 'ㅎ' ? null : KEEP[a.co];
    }
  }
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = s[i + 1];
    if (a.co) a.co = REP[KEEP[a.co] || a.co];                // 받침 대표음 일곱
    if (a.co && b && b.on) {
      if ((b.on === 'ㄴ' || b.on === 'ㅁ') && { ㄱ: 1, ㄷ: 1, ㅂ: 1 }[a.co]) a.co = { ㄱ: 'ㅇ', ㄷ: 'ㄴ', ㅂ: 'ㅁ' }[a.co];   // 비음화: 입니 → 임니
      if (a.co === 'ㄴ' && b.on === 'ㄹ') a.co = 'ㄹ';        // 유음화: 신라 → 실라
      else if (a.co === 'ㄹ' && b.on === 'ㄴ') b.on = 'ㄹ';   // 칼날 → 칼랄
    }
  }
  return s;
}

/** spoken jamo back into one syllable (for display and notes) */
export function compose({ on, v, co }) {
  const c = CHO.indexOf(on || 'ㅇ'), j = JUNG.indexOf(v), k = co ? JONG.indexOf(co) : 0;
  return String.fromCharCode(0xac00 + c * 588 + j * 28 + k);
}

// ================================================================ 4. visemes: targets in the parameter space
//            jaw   wide  round upper teeth tongue press
const V = {
  ㅏ: [0.86, 0.30, 0.00, 0.45, 0.45, 0.35, 0],
  ㅓ: [0.60, 0.00, 0.28, 0.25, 0.25, 0.30, 0],
  ㅗ: [0.40, -0.50, 0.88, 0.10, 0.05, 0.10, 0],
  ㅜ: [0.20, -0.75, 1.00, 0.05, 0.00, 0.05, 0],
  ㅡ: [0.20, 0.55, 0.00, 0.20, 0.70, 0.05, 0],
  ㅣ: [0.16, 0.85, 0.00, 0.35, 0.85, 0.05, 0],
  ㅔ: [0.52, 0.62, 0.00, 0.40, 0.60, 0.25, 0],   // ㅐ and ㅔ are one vowel in today's Seoul speech
};
V.ㅐ = V.ㅔ;
// vowel letter → [glide, nucleus]: y-glides start from ㅣ, w-glides from ㅜ, ㅢ glides from ㅡ to ㅣ
const VOWEL = {
  ㅏ: [null, 'ㅏ'], ㅐ: [null, 'ㅐ'], ㅑ: ['ㅣ', 'ㅏ'], ㅒ: ['ㅣ', 'ㅐ'], ㅓ: [null, 'ㅓ'], ㅔ: [null, 'ㅔ'], ㅕ: ['ㅣ', 'ㅓ'],
  ㅖ: ['ㅣ', 'ㅔ'], ㅗ: [null, 'ㅗ'], ㅘ: ['ㅜ', 'ㅏ'], ㅙ: ['ㅜ', 'ㅐ'], ㅚ: ['ㅜ', 'ㅔ'], ㅛ: ['ㅣ', 'ㅗ'], ㅜ: [null, 'ㅜ'],
  ㅝ: ['ㅜ', 'ㅓ'], ㅞ: ['ㅜ', 'ㅔ'], ㅟ: ['ㅜ', 'ㅣ'], ㅠ: ['ㅣ', 'ㅜ'], ㅡ: [null, 'ㅡ'], ㅢ: ['ㅡ', 'ㅣ'], ㅣ: [null, 'ㅣ'],
};
export const REST = [0.02, 0.05, 0.05, 0.0, 0.0, 0.0, 0.35];
const NEUT = [0.3, 0.1, 0.1, 0.15, 0.2, 0.1, 0];
const _ = null;   // "no target": the segment barely pulls this parameter, so it inherits it from its neighbours
// consonant classes: target (null = inherit) and dominance magnitude α per parameter, onset share of the syllable
const CONS = {
  bilabial: { T: [0.08, _, _, 0, 0, 0, 1], a: [1.6, 0.04, 0.04, 1.2, 1.5, 0.6, 6], share: 0.32 },
  alveolar: { T: [0.24, _, _, 0.2, 0.55, 0.85, 0], a: [0.9, 0.04, 0.04, 0.3, 0.8, 2.6, 0.5], share: 0.26 },
  liquid:   { T: [0.34, _, _, 0.25, 0.4, 1.0, 0], a: [0.6, 0.04, 0.04, 0.3, 0.5, 2.6, 0.5], share: 0.22 },
  sibilant: { T: [0.10, 0.25, _, 0.38, 1.0, 0.0, 0], a: [2.2, 0.3, 0.06, 0.6, 3.2, 1.0, 0.5], share: 0.38 },
  velar:    { T: [0.28, _, _, _, _, 0.0, 0], a: [0.5, 0.04, 0.04, 0.04, 0.1, 0.4, 0.3], share: 0.28 },
  glottal:  { T: [0.45, _, _, _, _, _, 0], a: [0.15, 0.02, 0.02, 0.02, 0.02, 0.02, 0.3], share: 0.22 },
};
const CLASS = {
  ㅁ: 'bilabial', ㅂ: 'bilabial', ㅃ: 'bilabial', ㅍ: 'bilabial',
  ㄴ: 'alveolar', ㄷ: 'alveolar', ㄸ: 'alveolar', ㅌ: 'alveolar', ㄹ: 'liquid',
  ㅅ: 'sibilant', ㅆ: 'sibilant', ㅈ: 'sibilant', ㅉ: 'sibilant', ㅊ: 'sibilant',
  ㄱ: 'velar', ㄲ: 'velar', ㅋ: 'velar', ㅇ: 'velar', ㅎ: 'glottal',
};
const CODA_SHARE = { ㅁ: 0.36, ㄴ: 0.3, ㄹ: 0.28, ㅇ: 0.3, ㄱ: 0.24, ㄷ: 0.24, ㅂ: 0.26 };
const A_VOWEL = [1.0, 1.2, 1.2, 0.8, 0.6, 0.5, 0.8];
const A_GLIDE = [0.5, 0.9, 0.9, 0.5, 0.4, 0.3, 0.5];

// dominance widths (seconds): D = α·exp(−(|τ|/w)^C), i.e. θ = w^−C. Anticipation reaches further than carry-over.
export const C_POW = 1.5;
const W_VOWEL = [0.085, 0.07];          // [before the centre, after it]
const W_CONS = [0.055, 0.04];
const W_PRESS = [0.032, 0.026];         // the lip seal of ㅁㅂㅍ is narrow in time and very dominant
const W_REST = [0.07, 0.06];
const W_BIL = [W_CONS, W_CONS, W_CONS, W_CONS, W_CONS, W_CONS, W_PRESS];   // per parameter

const mk = (T, a, w, extra) => {
  const tt = new Float32Array(NP), aa = new Float32Array(NP), wa = new Float32Array(NP), wc = new Float32Array(NP);
  for (let p = 0; p < NP; p++) {
    tt[p] = T[p] === null ? NEUT[p] : T[p]; aa[p] = a[p];
    const ww = Array.isArray(w[0]) ? w[p] : w;
    wa[p] = ww[0]; wc[p] = ww[1];
  }
  return { T: tt, a: aa, wa, wc, half: 0, ...extra };
};

/**
 * The alignment → { syl: [...spoken syllables with times], segs: [...dominance segments], words, pauses }.
 * Breath groups split at sentence punctuation; liaison never crosses a pause.
 */
export function analyse(rows = ALIGNMENT) {
  const syl = [], words = [], pauses = [];
  let group = [], word = null;
  const flush = () => {
    if (!group.length) return;
    const spoken = pronounce(group.map((g) => g.jamo));
    group.forEach((g, i) => { g.spoken = spoken[i]; g.say = compose(spoken[i]); });
    group = [];
  };
  rows.forEach(([ch, t0, t1, prom = 0], ci) => {
    const jamo = decompose(ch);
    if (jamo) {
      if (!word) { word = { text: '', syl: [], t0 }; words.push(word); }
      const s = { ch, t0, t1, prom, jamo, ci, word: words.length - 1, first: word.syl.length === 0 };
      word.text += ch; word.syl.push(syl.length); word.t1 = t1;
      syl.push(s); group.push(s);
    } else {
      word = null;
      if (/[.!?,…]/.test(ch)) { flush(); if (t1 - t0 > 0.05) pauses.push([t0, t1]); }
    }
  });
  flush();

  const segs = [];
  const add = (s) => { segs.push(s); return s; };
  // silence: plateau segments (dominance flat inside, exponential tails outside), so a long pause holds the rest shape
  const first = syl[0].t0, last = syl[syl.length - 1].t1;
  const rest = (t0, t1, T = REST, a = [1, 1, 1, 1, 1, 1, 1]) => add(mk(T, a, W_REST, { kind: 'rest', ph: '·', c: (t0 + t1) / 2, half: Math.max(0, (t1 - t0) / 2), t0, t1 }));
  rest(-10, first - 0.06);
  rest(last + 0.04, 30);
  for (const [a, b] of pauses) rest(a + 0.05, b - 0.06);

  for (const s of syl) {
    const { on, v, co } = s.spoken;
    const d = s.t1 - s.t0;
    const onC = on ? CONS[CLASS[on]] : null;
    const dOn = onC ? Math.min(0.11, Math.max(0.045, onC.share * d)) : 0;
    const dCo = co ? Math.min(0.1, Math.max(0.04, (CODA_SHARE[co] || 0.26) * d)) : 0;
    const v0 = s.t0 + dOn, v1 = s.t1 - dCo;
    s.v0 = v0; s.v1 = v1;
    if (onC) {
      const bil = CLASS[on] === 'bilabial';
      // a stop's articulation is centred near the release (the start of the acoustic syllable)
      const c = s.t0 + (bil ? 0.35 : 0.5) * dOn;
      add(mk(onC.T, onC.a, bil ? W_BIL : W_CONS, { kind: 'C', ph: on, cls: CLASS[on], c, t0: s.t0, t1: v0 }));
    }
    const [gl, nu] = VOWEL[v];
    let n0 = v0;
    if (gl) {
      const dg = 0.36 * (v1 - v0);
      add(mk(V[gl], A_GLIDE, W_CONS, { kind: 'G', ph: gl, c: v0 + dg * 0.45, t0: v0, t1: v0 + dg }));
      n0 = v0 + dg;
    }
    add(mk(V[nu], A_VOWEL, W_VOWEL, { kind: 'V', ph: nu, c: (n0 + v1) / 2, t0: n0, t1: v1 }));
    if (co) {
      const cc = CONS[CLASS[co]], bil = CLASS[co] === 'bilabial';
      // a coda is weaker than an onset (unreleased) except the lip seal of ㅁ/ㅂ, which must close
      const a = cc.a.map((x, p) => (bil && (p === PRESS || p === JAW) ? x : 0.7 * x));
      add(mk(cc.T, a, bil ? W_BIL : W_CONS, { kind: 'C', ph: co, cls: CLASS[co], coda: true, c: v1 + 0.55 * dCo, t0: v1, t1: s.t1 }));
    }
  }
  for (const s of segs) { s.c -= VIS_LEAD; s.t0 -= VIS_LEAD; s.t1 -= VIS_LEAD; }
  segs.sort((a, b) => a.c - b.c);
  return { syl, segs, words, pauses, first, last };
}

/** extra non-speech gestures (an in-breath before speaking) join the same blend as segments */
export function gesture(T, a, c, w = [0.09, 0.08]) {
  return mk(T, a, w, { kind: 'gesture', ph: '~', c, t0: c - w[0], t1: c + w[1] });
}

/**
 * Cohen–Massaro blend at time t → out[NP]. Only segments within 0.6 s are summed (their tails are negligible there);
 * a silence segment's dominance is flat inside its interval (d = 0) and decays outside it.
 */
export function mouthAt(segs, t, out = new Float32Array(NP)) {
  const num = new Float64Array(NP), den = new Float64Array(NP);
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const tau = s.c - t;                                  // > 0: the segment is still ahead (anticipation)
    let d = Math.abs(tau) - s.half;
    if (d > 0.6) continue;
    if (d < 0) d = 0;
    for (let p = 0; p < NP; p++) {
      const w = tau >= 0 ? s.wa[p] : s.wc[p];
      const D = s.a[p] * Math.exp(-Math.pow(d / w, C_POW));
      num[p] += D * s.T[p]; den[p] += D;
    }
  }
  for (let p = 0; p < NP; p++) out[p] = den[p] > 1e-12 ? num[p] / den[p] : REST[p];
  return out;
}
