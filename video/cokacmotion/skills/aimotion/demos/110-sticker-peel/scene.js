/*
 * scene.js — 책상과 노트북 뚜껑 (110). setup에서 한 장으로 굽는다.
 * 짙은 호두나무 책상(결은 공통 흐름을 따르는 수백 개의 선), 스탠드 불빛, 반쯤 걸친 스티커 대지(빈 칼선 자리), 연필,
 * 헤어라인 가공 알루미늄 뚜껑(결·반사 띠·지문·먼지·모서리 빛), 경첩과 아래 본체의 얇은 틈.
 */
import { rand } from '../_lib/stage.js';
import { canvas2d, setM, trs } from './sticker.js';

export const MARGIN = 70;
export const LID = { x: 540, y: 968, w: 820, h: 1180, r: 46, rot: -0.04 };
const TAU = Math.PI * 2;

function noiseTile(n, seed, a0, a1) {
  const { c, g } = canvas2d(n, n, false);
  const im = g.createImageData(n, n), r = rand(seed);
  for (let i = 0; i < n * n; i++) {
    const v = r() < 0.5 ? 0 : 255;
    im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
    im.data[i * 4 + 3] = Math.round((a0 + (a1 - a0) * r()) * 255);
  }
  g.putImageData(im, 0, 0);
  return c;
}

function desk(g, W, H) {
  const r = rand(301);
  const x0 = -MARGIN, y0 = -MARGIN, w = W + 2 * MARGIN, h = H + 2 * MARGIN;
  g.fillStyle = (() => { const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#4a3426'); gr.addColorStop(1, '#2a1d15'); return gr; })();
  g.fillRect(x0, y0, w, h);
  // 결: 모든 선이 같은 큰 흐름을 따르고 저마다 조금씩 어긋난다
  const cols = ['74,52,37', '36,24,16', '92,66,46', '26,17,11', '110,78,52', '58,40,28'];
  const flow = (x, y) => 22 * Math.sin(x * 0.0019 + y * 0.0042) + 9 * Math.sin(x * 0.0057 + y * 0.011 + 1.3) + 4 * Math.sin(x * 0.013 - y * 0.02);
  for (let i = 0; i < 700; i++) {
    const y = y0 + r() * h, A2 = r() * 2.5, f2 = 0.008 + r() * 0.02, ph = r() * TAU;
    g.strokeStyle = `rgba(${cols[(r() * cols.length) | 0]},${(0.18 + r() * 0.45).toFixed(3)})`;
    g.lineWidth = 0.5 + r() * r() * 6;
    g.beginPath();
    for (let x = x0; x <= x0 + w + 30; x += 30) {
      const yy = y + flow(x, y) + A2 * Math.sin(x * f2 + ph);
      if (x === x0) g.moveTo(x, yy); else g.lineTo(x, yy);
    }
    g.stroke();
  }
  // 판재 이음매
  for (const yb of [312, 1590]) {
    g.strokeStyle = 'rgba(12,8,5,0.6)'; g.lineWidth = 3;
    g.beginPath(); for (let x = x0; x <= x0 + w + 30; x += 30) { const yy = yb + flow(x, yb) * 0.15; x === x0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
    g.strokeStyle = 'rgba(160,120,80,0.18)'; g.lineWidth = 1.2;
    g.beginPath(); for (let x = x0; x <= x0 + w + 30; x += 30) { const yy = yb + 2.5 + flow(x, yb) * 0.15; x === x0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
  }
  g.fillStyle = g.createPattern(noiseTile(160, 302, 0.0, 0.06), 'repeat');
  g.fillRect(x0, y0, w, h);
  // 바니시 광택: 스탠드 불빛
  const lp = g.createRadialGradient(240, 140, 30, 240, 140, 1500);
  lp.addColorStop(0, 'rgba(255,214,160,0.34)'); lp.addColorStop(0.45, 'rgba(255,190,130,0.10)'); lp.addColorStop(1, 'rgba(255,190,130,0)');
  g.fillStyle = lp; g.fillRect(x0, y0, w, h);
}

function stickerSheet(g, sheet, headless) {
  const r = rand(311);
  g.save();
  g.translate(920, 170); g.rotate(0.21);
  const SW = 420, SH = 560;
  g.save(); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(-SW / 2 + 8, -SH / 2 + 14, SW, SH); g.restore();
  const lg = g.createLinearGradient(-SW / 2, -SH / 2, SW / 2, SH / 2);
  lg.addColorStop(0, '#f1f3f6'); lg.addColorStop(0.55, '#dfe4ea'); lg.addColorStop(1, '#eef1f4');
  g.fillStyle = lg; g.fillRect(-SW / 2, -SH / 2, SW, SH);
  // 떼어 간 자리(이형지의 빈 칼선)
  for (const it of sheet.holes) {
    g.save(); g.translate(it.x, it.y); g.rotate(it.rot); g.scale(it.s, it.s);
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill(it.die, 'evenodd');
    g.strokeStyle = 'rgba(105,115,128,0.55)'; g.lineWidth = 1.3 / it.s; g.stroke(it.die);
    g.restore();
  }
  // 아직 남은 스티커
  for (const it of sheet.left) {
    g.save(); g.translate(it.x, it.y); g.rotate(it.rot); g.scale(it.s, it.s);
    g.save(); g.filter = 'blur(1.5px)'; g.globalAlpha = 0.35; g.translate(1, 2); g.drawImage(it.st.shT, -it.st.sw / 2, -it.st.sh / 2, it.st.sw, it.st.sh); g.restore();
    g.drawImage(it.st.front, -it.st.fw / 2, -it.st.fh / 2, it.st.fw, it.st.fh);
    g.restore();
  }
  // 이형지 광택 띠와 가장자리
  const sh = g.createLinearGradient(-SW / 2, 0, SW / 2, 0);
  sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.42, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)');
  g.fillStyle = sh; g.fillRect(-SW / 2, -SH / 2, SW, SH);
  g.strokeStyle = 'rgba(120,128,140,0.5)'; g.lineWidth = 1.2; g.strokeRect(-SW / 2, -SH / 2, SW, SH);
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,110,100,0.12)'; g.fillRect(-SW / 2 + r() * SW, -SH / 2 + r() * SH, 1.5, 1.5); }
  g.restore();
}

function pencil(g) {
  g.save();
  g.translate(88, 1560); g.rotate(-1.22);
  const L = 520, Wd = 30;
  g.save(); g.filter = 'blur(6px)'; g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(-L / 2 + 10, -Wd / 2 + 14, L, Wd); g.restore();
  // 몸통: 육각 면 세 줄
  const body = g.createLinearGradient(0, -Wd / 2, 0, Wd / 2);
  body.addColorStop(0, '#ffd877'); body.addColorStop(0.33, '#ffd877'); body.addColorStop(0.34, '#f4b437'); body.addColorStop(0.66, '#f4b437');
  body.addColorStop(0.67, '#d48d1f'); body.addColorStop(1, '#c47e18');
  g.fillStyle = body; g.fillRect(-L / 2 + 70, -Wd / 2, L - 120, Wd);
  // 쇠테 + 지우개
  const fe = g.createLinearGradient(0, -Wd / 2, 0, Wd / 2);
  fe.addColorStop(0, '#eef0f3'); fe.addColorStop(0.5, '#b9bec6'); fe.addColorStop(1, '#8e949c');
  g.fillStyle = fe; g.fillRect(-L / 2 + 30, -Wd / 2 - 1, 42, Wd + 2);
  g.strokeStyle = 'rgba(80,85,95,0.6)'; g.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-L / 2 + 38 + i * 9, -Wd / 2); g.lineTo(-L / 2 + 38 + i * 9, Wd / 2); g.stroke(); }
  g.fillStyle = '#f08ca0'; g.beginPath(); g.roundRect(-L / 2, -Wd / 2 + 1, 34, Wd - 2, [10, 0, 0, 10]); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-L / 2 + 4, -Wd / 2 + 4, 26, 6);
  // 깎은 나무와 심
  g.fillStyle = '#e9c79a'; g.beginPath(); g.moveTo(L / 2 - 50, -Wd / 2); g.lineTo(L / 2, 0); g.lineTo(L / 2 - 50, Wd / 2); g.fill();
  g.fillStyle = '#3a3a40'; g.beginPath(); g.moveTo(L / 2 - 16, -5); g.lineTo(L / 2, 0); g.lineTo(L / 2 - 16, 5); g.fill();
  g.restore();
}

function laptop(g) {
  const L = LID, r = rand(321);
  const path = new Path2D(); path.roundRect(-L.w / 2, -L.h / 2, L.w, L.h, L.r);
  g.save();
  g.translate(L.x, L.y); g.rotate(L.rot);
  g.save(); g.filter = 'blur(38px)'; g.fillStyle = 'rgba(0,0,0,0.62)'; g.translate(28, 46); g.fill(path); g.restore();
  g.save(); g.filter = 'blur(8px)'; g.fillStyle = 'rgba(0,0,0,0.7)'; g.translate(6, 11); g.fill(path); g.restore();
  // 경첩(오른쪽 긴 변)과 아래 본체의 얇은 틈
  const hg = g.createLinearGradient(L.w / 2 - 8, 0, L.w / 2 + 14, 0);
  hg.addColorStop(0, '#2b2f36'); hg.addColorStop(0.5, '#5d636d'); hg.addColorStop(1, '#2a2e35');
  g.fillStyle = hg; g.beginPath(); g.roundRect(L.w / 2 - 10, -L.h * 0.36, 24, L.h * 0.72, 10); g.fill();
  g.save(); g.translate(3, 8); g.fillStyle = '#5f656f'; g.fill(path); g.restore();
  g.save(); g.translate(1.5, 4); g.fillStyle = '#9097a1'; g.fill(path); g.restore();
  // 뚜껑 면
  const base = g.createLinearGradient(-L.w / 2, -L.h / 2, L.w / 2, L.h / 2);
  base.addColorStop(0, '#dde1e7'); base.addColorStop(0.5, '#c9ced6'); base.addColorStop(1, '#b3b9c2');
  g.fillStyle = base; g.fill(path);
  g.save(); g.clip(path);
  // 헤어라인 결(뚜껑 긴 변 방향)
  for (let i = 0; i < 3600; i++) {
    const y = -L.h / 2 + r() * L.h, x = -L.w / 2 - 40 + r() * (L.w + 80) * 0.7, len = 120 + r() * 520;
    g.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${(0.04 + r() * 0.07).toFixed(3)})` : `rgba(40,45,55,${(0.025 + r() * 0.05).toFixed(3)})`;
    g.lineWidth = 0.6 + r() * 0.9;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke();
  }
  g.fillStyle = g.createPattern(noiseTile(128, 322, 0.0, 0.05), 'repeat');
  g.fillRect(-L.w / 2, -L.h / 2, L.w, L.h);
  // 넓은 반사 띠(창문) 두 줄
  const band = (c, wdt, a) => {
    const ax = 0.6, ay = 0.8, gr = g.createLinearGradient(ax * (c - wdt), ay * (c - wdt), ax * (c + wdt), ay * (c + wdt));
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(-L.w / 2, -L.h / 2, L.w, L.h);
  };
  band(-380, 230, 0.22); band(-120, 60, 0.12); band(420, 260, 0.08);
  // 스탠드 불빛(따뜻한 쪽)
  const lp = g.createRadialGradient(-420, -640, 40, -420, -640, 1100);
  lp.addColorStop(0, 'rgba(255,226,190,0.30)'); lp.addColorStop(1, 'rgba(255,226,190,0)');
  g.fillStyle = lp; g.fillRect(-L.w / 2, -L.h / 2, L.w, L.h);
  // 지문·얼룩·먼지
  for (const [x, y, rx, ry, a] of [[-250, 420, 70, 52, 0.06], [300, -470, 60, 44, 0.05], [260, 300, 90, 60, 0.04], [-300, -200, 50, 40, 0.05]]) {
    g.save(); g.translate(x, y); g.scale(1, ry / rx);
    const sg = g.createRadialGradient(0, 0, 4, 0, 0, rx);
    sg.addColorStop(0, `rgba(255,255,255,${a})`); sg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sg; g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill(); g.restore();
  }
  for (let i = 0; i < 260; i++) {
    g.fillStyle = r() < 0.7 ? `rgba(255,255,255,${(0.2 + r() * 0.4).toFixed(2)})` : `rgba(60,55,50,${(0.15 + r() * 0.2).toFixed(2)})`;
    g.beginPath(); g.arc(-L.w / 2 + r() * L.w, -L.h / 2 + r() * L.h, 0.5 + r() * 1.3, 0, TAU); g.fill();
  }
  // 모서리 모따기 빛: 왼위는 밝게, 오른아래는 어둡게
  const rim = g.createLinearGradient(-L.w / 2, -L.h / 2, L.w / 2, L.h / 2);
  rim.addColorStop(0, 'rgba(255,255,255,0.95)'); rim.addColorStop(0.5, 'rgba(255,255,255,0.35)'); rim.addColorStop(1, 'rgba(60,64,72,0.65)');
  g.strokeStyle = rim; g.lineWidth = 7; g.stroke(path);
  g.restore();
  g.strokeStyle = 'rgba(38,42,50,0.85)'; g.lineWidth = 1.6; g.stroke(path);
  // 앞쪽(왼쪽 변) 손가락 홈
  g.fillStyle = 'rgba(40,44,52,0.45)'; g.beginPath(); g.ellipse(-L.w / 2 + 2, 0, 9, 72, 0, -Math.PI / 2, Math.PI / 2); g.fill();
  g.restore();
}

export async function bakeScene({ W, H, sheet, headless }) {
  const { c, g } = canvas2d(W + 2 * MARGIN, H + 2 * MARGIN, headless);
  g.translate(MARGIN, MARGIN);
  desk(g, W, H);
  stickerSheet(g, sheet, headless);
  pencil(g);
  laptop(g);
  return createImageBitmap(c);
}

/** 화면 고정 비네트 + 자막 자리의 어둠 */
export async function bakeVignette(W, H, headless) {
  const { c, g } = canvas2d(W, H, headless);
  const v = g.createRadialGradient(W / 2, 880, 420, W / 2, 900, 1250);
  v.addColorStop(0, 'rgba(10,6,4,0)'); v.addColorStop(1, 'rgba(10,6,4,0.55)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  const b = g.createLinearGradient(0, 1560, 0, H);
  b.addColorStop(0, 'rgba(8,5,3,0)'); b.addColorStop(1, 'rgba(8,5,3,0.6)');
  g.fillStyle = b; g.fillRect(0, 1560, W, H - 1560);
  return createImageBitmap(c);
}
export { trs, setM };
