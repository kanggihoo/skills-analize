/*
 * 84 · 태엽 장치 — an engraved plate of a clockwork orrery: hand-tinted ink on cream paper.
 *
 *   그림 1 (top)    the planets on tilted orbits (<animateMotion> with keyPoints, rotate="auto"), arms swept by
 *                   <animateTransform>, the Moon round the Earth, and a calendar ring whose twelve numerals light
 *                   (<animate> on fill / opacity / r) as the Earth's pointer passes them
 *   그림 2 (bottom) the going train: involute wheels meshing tooth for tooth, ticking together (accumulate="sum"),
 *                   the escape wheel and anchor, the pendulum (keyTimes / keySplines), the mainspring barrel wound
 *                   by a key at the start (<animate> on d, stroke-dashoffset)
 *   story: the plate is drawn in · the key winds the spring (0.6–1.9 s) · release: tick, tock, the planets glide
 *          and the months light one by one (2–8 s) · the spring runs down, the pendulum dies away, the seal (9 s)
 *
 * JS builds the SVG markup once (geometry, sampled motion, timings), then only seeks the SMIL timeline:
 *   setup: svg.pauseAnimations()      frame(t): svg.setCurrentTime(t)
 */
import { defineDemo } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { orreryMarkup, ORRERY } from './orrery.js';
import { movementMarkup, layoutTrain, T_RUN } from './movement.js';

const D = 10;
const f = (v) => (Math.round(v * 100) / 100).toString();

// the drive of the orrery: its speed s(t) eases in at the release and out as the spring runs down;
// "mechanism time" τ(t) = ∫ s dt moves every planet (and the crown wheel under the orrery)
const DRIVE = { up: [T_RUN, 2.8], down: [7.6, 9.2], step: 1 / 30 };
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const speed = (t) => smooth((t - DRIVE.up[0]) / (DRIVE.up[1] - DRIVE.up[0])) * (1 - smooth((t - DRIVE.down[0]) / (DRIVE.down[1] - DRIVE.down[0])));
function sampleDrive() {
  const ts = [0], taus = [0];
  let tau = 0;
  for (let t = DRIVE.up[0]; t <= DRIVE.down[1] + 1e-9; t += DRIVE.step) {
    // integrate s over the step with Simpson's rule (exact enough for a smoothstep)
    const prev = ts[ts.length - 1];
    if (t > prev) { const m = (prev + t) / 2; tau += (t - prev) / 6 * (speed(prev) + 4 * speed(m) + speed(t)); }
    ts.push(+t.toFixed(5)); taus.push(tau);
  }
  return { ts, taus, end: ts[ts.length - 1], tauTotal: tau };
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const HEADER = '태엽으로 움직이는 천체 운행기';
const KO = HEADER + '도판그림행성의궤도와역법고리태엽동력장치탈진기가나다라마바통바퀴열닻진자 ·';

defineDemo({
  id: '84-svg-smil',
  title: '태엽 장치',
  tech: 'SVG SMIL(animateTransform · animateMotion · animate) · setCurrentTime',
  duration: D,
  background: '#efe4cc',
  async setup({ stage }) {
    await Promise.all([
      fontReady('800 44px "Nanum Myeongjo"', KO),
      fontReady('400 24px "Nanum Myeongjo"', KO),
      fontReady('400 36px "Instrument Serif"', ROMAN.join('') + 'PL.VII0123456789'),
      fontReady('italic 400 36px "Instrument Serif"', 'Machina planetaria'),
    ]);

    const paper = document.createElement('div');
    paper.className = 'paper';
    stage.appendChild(paper);

    const drive = sampleDrive();
    const orr = orreryMarkup(drive);
    const train = layoutTrain();
    const mov = movementMarkup(train);
    const { cx, cy, k, numA, sun } = ORRERY;

    // ---- the calendar numerals: each lights when the Earth's pointer reaches it (θ decreasing from 111°)
    const th0 = orr.earthStart;
    const crossTime = (target) => {                       // first t with θ_E(t) ≤ target (bisection on the sampled drive)
      let lo = 0, hi = drive.end;
      if (orr.earthTheta(hi) > target) return null;
      for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (orr.earthTheta(m) > target) lo = m; else hi = m; }
      return hi;
    };
    let numerals = '';
    ROMAN.forEach((rn, n) => {
      const thDeg = 105 - 30 * n;
      let target = thDeg * Math.PI / 180;
      while (target > th0) target -= 2 * Math.PI;
      const t1 = crossTime(target), t2 = crossTime(target - 2 * Math.PI);
      const a = thDeg * Math.PI / 180, x = cx + numA * Math.cos(a), y = cy + k * numA * Math.sin(a);
      const size = 30 + 8 * (Math.sin(a) + 1) / 2;       // nearer numerals are larger
      const on = t1 == null ? '' : `${t1.toFixed(3)}s`;
      const again = t2 == null ? '' : `${t2.toFixed(3)}s`;
      numerals += `<g class="numeral">
        <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(size * 0.95)}" ry="${f(size * 0.72)}" fill="url(#gild)" opacity="0">
          ${on ? `<animate attributeName="opacity" values="0;1;0.78" keyTimes="0;0.3;1" dur="0.7s" begin="${on}" fill="freeze"/>` : ''}
          ${again ? `<animate attributeName="opacity" values="0.78;1;0.85" keyTimes="0;0.3;1" dur="0.7s" begin="${again}" fill="freeze"/>` : ''}
        </ellipse>
        <circle cx="${f(x)}" cy="${f(y)}" r="10" class="spark" stroke-opacity="0">
          ${on ? `<animate attributeName="r" from="10" to="${f(size * 1.5)}" dur="0.8s" begin="${on}${again ? ';' + again : ''}" fill="freeze"/>
          <animate attributeName="stroke-opacity" values="0;0.85;0" dur="0.8s" begin="${on}${again ? ';' + again : ''}" fill="freeze"/>` : ''}
        </circle>
        <text x="${f(x)}" y="${f(y + size * 0.34)}" font-size="${f(size)}" class="roman" fill="#8d806a">${rn}
          ${on ? `<animate attributeName="fill" values="#8d806a;#e2502a;#a92d17" keyTimes="0;0.3;1" dur="0.7s" begin="${on}" fill="freeze"/>` : ''}
        </text></g>`;
    });

    // ---- the sun on its column: gold wash, turned rings, sixteen rays (straight and flame), turning slowly
    let rays = '';
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8, r0 = sun.r + 5, r1 = sun.r + (i % 2 ? 20 : 30);
      const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      if (i % 2) rays += `<path d="M${f(r0 * ca - 3 * px)} ${f(r0 * sa - 3 * py)}L${f(r1 * ca)} ${f(r1 * sa)}L${f(r0 * ca + 3 * px)} ${f(r0 * sa + 3 * py)}" class="ray"/>`;
      else {
        const m = (r0 + r1) / 2;
        rays += `<path d="M${f(r0 * ca)} ${f(r0 * sa)}Q${f((r0 + 6) * ca + 5 * px)} ${f((r0 + 6) * sa + 5 * py)} ${f(m * ca)} ${f(m * sa)}T${f(r1 * ca)} ${f(r1 * sa)}" class="ray flame"/>`;
      }
    }
    const sunMarkup = `<g transform="translate(${cx} ${sun.y})">
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="-36" dur="${D}s" begin="0s" fill="freeze"/>${rays}</g>
      <circle r="${sun.r}" fill="url(#sungrad)"/><circle r="${sun.r}" class="ink"/>
      <circle r="${sun.r - 7}" class="ink hair"/><circle r="${sun.r - 14}" class="ink hair"/><circle r="${sun.r - 21}" class="ink hair"/>
      <path d="M${-sun.r * 0.55} ${-sun.r * 0.3}A${sun.r * 0.7} ${sun.r * 0.7} 0 0 1 ${sun.r * 0.1} ${-sun.r * 0.62}" class="gleam"/>
    </g>`;

    // ---- column and pedestal (from the sun down to the movement's top bar), with the crown wheel housing
    const crownVals = drive.taus.map((tau) => f(tau * 26)).join(';');
    const keyTimes = drive.ts.map((t) => (t / drive.end).toFixed(4)).join(';');
    let crownTeeth = '';
    for (let x = -400; x <= 60; x += 9) crownTeeth += `<path d="M${x} 0v-7l4 -3l4 3v7" class="ink hair"/>`;
    const column = `<g class="column">
      <path d="M533 ${sun.y + sun.r - 2}V640M547 ${sun.y + sun.r - 2}V640" class="ink"/>
      <rect x="533" y="${sun.y + sun.r}" width="14" height="${640 - sun.y - sun.r}" fill="url(#hatch)" opacity="0.45"/>
      <ellipse cx="540" cy="${cy}" rx="16" ry="5" class="wash brass"/><ellipse cx="540" cy="${cy}" rx="16" ry="5" class="ink"/>
      <path d="M528 640C528 662 498 680 488 700H592C582 680 552 662 552 640Z" class="wash brass"/>
      <path d="M528 640C528 662 498 680 488 700H592C582 680 552 662 552 640Z" class="ink"/>
      <path d="M535 642C535 664 512 682 503 698" class="ink hair"/>
      <rect x="470" y="700" width="140" height="56" rx="4" class="wash brass"/><rect x="470" y="700" width="140" height="56" rx="4" class="ink"/>
      <rect x="486" y="716" width="108" height="24" class="drumback"/>
      <g clip-path="url(#crown-window)"><g transform="translate(540 736)"><g>
        <animateTransform attributeName="transform" type="translate" dur="${drive.end}s" begin="0s" fill="freeze" calcMode="linear" keyTimes="${keyTimes}" values="${crownVals}"/>
        ${crownTeeth}<path d="M-400 0H60" class="ink"/></g></g></g>
      <rect x="486" y="716" width="108" height="24" class="ink thin"/>
      ${[480, 600].map((x) => `<circle cx="${x}" cy="728" r="4.5" class="screw"/>`).join('')}
    </g>`;

    // ---- labels and the plate furniture
    const label = (ch, x, y, begin = 1.25) => `<g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${begin}s" dur="0.5s" fill="freeze"/>
      <text x="${x}" y="${y}" class="label">${ch}</text></g>`;
    const labels = [label('가', 118, 1196), label('나', 248, 1002), label('다', 612, 846), label('라', 468, 824),
      label('마', 670, 1502), label('바', 1000, 574, 1.4)].join('');
    const header = `<g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="0.1s" dur="0.6s" fill="freeze"/>
      <text x="76" y="112" class="small">도판 VII</text>
      <text x="1004" y="112" class="small end"><tspan class="it">Machina planetaria</tspan></text>
      <text x="540" y="128" class="title">${HEADER}</text>
      <text x="96" y="254" class="small">그림 1 · 행성의 궤도와 역법 고리</text>
      <text x="76" y="742" class="small">그림 2 · 태엽 동력 장치와 탈진기</text></g>
      <path d="M76 160H1004M76 166H1004" class="ink thin" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1">
        <animate attributeName="stroke-dashoffset" from="1" to="0" begin="0s" dur="0.9s" fill="freeze"/></path>`;
    const frame = `<rect x="44" y="44" width="992" height="1562" class="ink frame" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1">
        <animate attributeName="stroke-dashoffset" from="1" to="0" begin="0s" dur="1.1s" fill="freeze"/></rect>
      <rect x="54" y="54" width="972" height="1542" class="ink thin" opacity="0"><animate attributeName="opacity" from="0" to="1" begin="0.5s" dur="0.6s" fill="freeze"/></rect>
      ${[[54, 54], [1026, 54], [54, 1596], [1026, 1596]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" class="corner"/><circle cx="${x}" cy="${y}" r="2.4" class="ink"/>`).join('')}`;

    // the band under the plate carries the legend; the harness caption sits below it
    const band = `<rect x="0" y="1622" width="1080" height="298" fill="#211912"/>
      <path d="M0 1626H1080M0 1632H1080" stroke="#b48a4a" stroke-width="1.2" opacity="0.8"/>
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="1.3s" dur="0.6s" fill="freeze"/>
      <text x="540" y="1684" class="legend">가 태엽통 · 나 바퀴열 · 다 탈진 바퀴 · 라 닻 · 마 진자 · 바 역법 고리</text></g>`;

    // the seal, stamped when the mechanism has settled
    const seal = `<g transform="translate(940 1520)"><g opacity="0">
      <animate attributeName="opacity" values="0;0.95;0.9" keyTimes="0;0.4;1" begin="9.0s" dur="0.45s" fill="freeze"/>
      <animateTransform attributeName="transform" type="scale" values="1.7;0.94;1" keyTimes="0;0.55;1" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.5 1" begin="9.0s" dur="0.45s" fill="freeze"/>
      <rect x="-36" y="-36" width="72" height="72" rx="5" class="sealbox"/><rect x="-30" y="-30" width="60" height="60" rx="2" class="sealline"/>
      <text x="0" y="-4" class="sealtext">태</text><text x="0" y="24" class="sealtext">엽</text></g></g>`;

    const defs = `<defs>
      <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(42)"><line x1="0" y1="0" x2="0" y2="5" stroke="#2a2118" stroke-width="0.9"/></pattern>
      <pattern id="hatch-fine" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><line x1="0" y1="0" x2="0" y2="2.6" stroke="#22190f" stroke-width="0.85"/></pattern>
      <pattern id="hatch-cross" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V6M0 0H6" stroke="#2a2118" stroke-width="0.7"/></pattern>
      <radialGradient id="sungrad" cx="0.4" cy="0.38" r="0.7"><stop offset="0" stop-color="#fbe7a8"/><stop offset="0.6" stop-color="#ecc160"/><stop offset="1" stop-color="#d49a3c"/></radialGradient>
      <radialGradient id="gild" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#f3cf6e" stop-opacity="0.95"/><stop offset="0.65" stop-color="#e2b14c" stop-opacity="0.6"/><stop offset="1" stop-color="#d9a640" stop-opacity="0"/></radialGradient>
      <clipPath id="crown-window" clipPathUnits="userSpaceOnUse"><rect x="486" y="716" width="108" height="24"/></clipPath>
      ${orr.clips}
    </defs>`;

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1080 1920');
    svg.setAttribute('width', '1080');
    svg.setAttribute('height', '1920');
    svg.setAttribute('class', 'plate-svg');
    svg.innerHTML = `${defs}
      <g class="fig2">${mov.plate}${mov.pendulum}${mov.train}${mov.escape}${mov.anchor}</g>
      <g class="fig1">${orr.back}${column}${sunMarkup}${orr.front}${numerals}</g>
      ${labels}${header}${frame}${band}${seal}`;
    stage.appendChild(svg);

    // the SMIL timeline is the clock: stop it, then seek it from frame()
    svg.pauseAnimations();
    svg.setCurrentTime(0);
    this.svg = svg;
  },
  frame(t) {
    this.svg.setCurrentTime(t);
  },
});
