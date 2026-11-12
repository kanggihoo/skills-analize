/*
 * designs.js — 스티커 여덟 장의 그림 (110)
 * shape(g)는 칼선을 낼 커버리지(색은 상관없음), face(g)는 그 위의 인쇄. 둘 다 스티커 중심 원점, 무대 px.
 */
export const C = {
  ink: '#1d1b2c', navy: '#1b2253', cream: '#fff4e2', yellow: '#ffd23f', yellowD: '#f2a900', pink: '#ff4d8d', plum: '#8a1c50',
  sky: '#2eb4ff', skyD: '#1688de', violet: '#7a4cff', violetD: '#3a1f96', orange: '#ff7a2b', red: '#ff3d5e',
};
const PRET = (px, w = 900) => `${w} ${px}px "Pretendard Variable"`;
const BHS = (px) => `400 ${px}px "Black Han Sans"`;
const TAU = Math.PI * 2;

/** 잉크 상자 중심을 (x, y)에 맞춰 글자를 찍는다 */
function cText(g, txt, x, y, font, mode = 'fill') {
  g.font = font; g.letterSpacing = '0px'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const m = g.measureText(txt);
  const bx = x - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const by = y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  if (mode === 'fill') g.fillText(txt, bx, by); else g.strokeText(txt, bx, by);
}
function sparkle(g, x, y, r) {
  const k = 0.16 * r;
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x + k, y - k, x + r, y);
  g.quadraticCurveTo(x + k, y + k, x, y + r);
  g.quadraticCurveTo(x - k, y + k, x - r, y);
  g.quadraticCurveTo(x - k, y - k, x, y - r);
  g.fill();
}
function crescent(g, x, y, r) {
  g.save();
  g.beginPath();
  g.rect(x - 2 * r, y - 2 * r, 4 * r, 4 * r);
  g.moveTo(x + 0.48 * r + 0.8 * r, y - 0.34 * r);
  g.arc(x + 0.48 * r, y - 0.34 * r, 0.8 * r, 0, TAU);
  g.clip('evenodd');
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.restore();
}
export function heartPath(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y + s * 0.92);
  g.bezierCurveTo(x - s * 1.45, y + s * 0.02, x - s * 0.9, y - s * 1.1, x, y - s * 0.42);
  g.bezierCurveTo(x + s * 0.9, y - s * 1.1, x + s * 1.45, y + s * 0.02, x, y + s * 0.92);
  g.closePath();
}
function starPath(g, x, y, R, k, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5, rr = i % 2 ? R * k : R;
    if (i) g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); else g.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
  }
  g.closePath();
}
function vgrad(g, y0, y1, c0, c1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }
export function holoGradient(g, x0, y0, x1, y1, phase, n = 9, sat = 92, lit = 74) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  for (let i = 0; i <= n; i++) {
    const hue = (((phase * 360 + i * 46) % 360) + 360) % 360;
    gr.addColorStop(i / n, `hsl(${hue.toFixed(1)}, ${sat}%, ${lit}%)`);
  }
  return gr;
}

/**
 * now: { path (Path2D, 중심 원점), w, h } — Pretendard Black 벡터 윤곽의 「지금」
 * ref.die: 「지금」의 칼선(먼저 구운 뒤 채워짐), rel: 「지금」 국소 → 「나중에」 국소 행렬 (나중에 위로 지금의 칼선이 도드라져 비친다)
 */
export function makeDesigns(now, ref, rel, rng) {
  // 낡은 라벨의 흠집·얼룩은 setup에서 한 번 정한다
  const scratches = Array.from({ length: 16 }, () => ({ x: (rng() - 0.5) * 600, y: (rng() - 0.5) * 270, a: (rng() - 0.5) * 1.2, l: 20 + rng() * 90 }));
  const specks = Array.from({ length: 90 }, () => ({ x: (rng() - 0.5) * 620, y: (rng() - 0.5) * 290, r: 0.6 + rng() * 1.8, a: 0.08 + rng() * 0.2 }));

  return {
    // ---------------------------------------------------------- 오래된 라벨 「나중에」
    later: {
      w: 620, h: 290, R: 0, C: 0, seed: 88, bubbles: 0, wrinkles: 0,
      white: '#efe4c9', backing: '#e6dfcf', ghost: 0.12, edge: '#b8ab8e',
      face(g) {
        const gr = g.createRadialGradient(-40, -20, 40, 0, 0, 380);
        gr.addColorStop(0, '#f4ecd7'); gr.addColorStop(1, '#ddcaa0');
        g.fillStyle = gr; g.fillRect(-330, -160, 660, 320);
        // 바랜 이중 테
        g.strokeStyle = 'rgba(132,163,184,0.75)'; g.lineWidth = 6;
        g.beginPath(); g.roundRect(-288, -123, 576, 246, 22); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.roundRect(-277, -112, 554, 224, 15); g.stroke();
        // 머리 띠 「할 일」
        g.fillStyle = 'rgba(132,163,184,0.75)';
        g.beginPath(); g.roundRect(-262, -98, 128, 44, 10); g.fill();
        g.fillStyle = '#f2e8d0'; cText(g, '할 일', -198, -76, PRET(28, 800));
        // 시계
        g.strokeStyle = '#8fa7b9'; g.lineWidth = 9; g.lineCap = 'round';
        g.beginPath(); g.arc(-190, 22, 50, 0, TAU); g.stroke();
        g.lineWidth = 8; g.beginPath(); g.moveTo(-190, 22); g.lineTo(-190, -6); g.moveTo(-190, 22); g.lineTo(-170, 36); g.stroke();
        g.lineCap = 'butt';
        // 글자
        g.fillStyle = '#7f98ab'; cText(g, '나중에', 72, 20, PRET(124));
        // 햇빛에 바램
        g.fillStyle = 'rgba(255,248,230,0.16)'; g.fillRect(-330, -160, 660, 320);
        // 커피 자국(반쯤 지워진 고리)
        g.strokeStyle = 'rgba(128,84,40,0.16)'; g.lineWidth = 6;
        g.beginPath(); g.arc(196, -62, 58, 0.4, 4.6); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.arc(196, -62, 64, 1.0, 3.9); g.stroke();
        // 흠집·때
        g.lineCap = 'round';
        for (const s of scratches) {
          g.strokeStyle = 'rgba(255,253,245,0.5)'; g.lineWidth = 1.2;
          g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x + Math.cos(s.a) * s.l, s.y + Math.sin(s.a) * s.l); g.stroke();
        }
        for (const s of specks) { g.fillStyle = `rgba(70,55,35,${s.a})`; g.beginPath(); g.arc(s.x, s.y, s.r, 0, TAU); g.fill(); }
        g.lineCap = 'butt';
        // 가장자리 때
        g.strokeStyle = 'rgba(105,85,50,0.16)'; g.lineWidth = 22;
        g.beginPath(); g.roundRect(-310, -145, 620, 290, 38); g.stroke();
        // 밑에 깔린 「지금」의 칼선이 도드라져 비친다
        g.save();
        g.transform(...rel);
        g.lineJoin = 'round';
        g.translate(1.2, 1.8); g.strokeStyle = 'rgba(80,60,30,0.10)'; g.lineWidth = 3.2; g.stroke(ref.die);
        g.translate(-2.4, -3.2); g.strokeStyle = 'rgba(255,252,240,0.3)'; g.lineWidth = 2.4; g.stroke(ref.die);
        g.restore();
      },
      back(g) {
        // 오래 붙어 있던 접착면: 가장자리에 먼지 띠
        g.strokeStyle = 'rgba(95,80,55,0.22)'; g.lineWidth = 26;
        g.beginPath(); g.roundRect(-310, -145, 620, 290, 38); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-330, -160, 660, 320);
      },
    },

    // ---------------------------------------------------------- 밑에 숨어 있던 홀로그램 「지금」
    now: {
      w: now.w + 24, h: now.h + 24, R: 22, C: 16, seed: 77, bubbles: 0, wrinkles: 0,
      shape(g) { g.lineWidth = 20; g.lineJoin = 'round'; g.stroke(now.path); g.fill(now.path); },
      face(g) {
        g.lineJoin = 'round'; g.strokeStyle = C.navy; g.lineWidth = 20; g.stroke(now.path);
        g.fillStyle = holoGradient(g, -now.w / 2, -now.h / 2, now.w / 2, now.h / 2, 0.1);
        g.fill(now.path);
      },
    },

    // ---------------------------------------------------------- 야행성 + 초승달
    night: {
      w: 470, h: 150, R: 20, C: 16, seed: 11,
      shape(g) {
        crescent(g, -176, -2, 54);
        cText(g, '야행성', 54, 2, BHS(112)); cText(g, '야행성', 54, 10, BHS(112));
        sparkle(g, -110, -56, 15);
      },
      face(g) {
        g.fillStyle = C.violetD; cText(g, '야행성', 54, 10, BHS(112));
        g.fillStyle = vgrad(g, -50, 50, '#9a77ff', C.violet); cText(g, '야행성', 54, 2, BHS(112));
        g.fillStyle = vgrad(g, -56, 52, '#ffe27a', C.yellow); crescent(g, -176, -2, 54);
        g.fillStyle = 'rgba(242,169,0,0.55)';
        for (const [x, y, r] of [[-200, 18, 7], [-186, -24, 5], [-212, -8, 4]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
        g.fillStyle = C.yellow; sparkle(g, -110, -56, 15);
      },
    },

    // ---------------------------------------------------------- 커피 진심 (알약 배지)
    coffee: {
      w: 440, h: 132, R: 13, C: 0, seed: 22,
      shape(g) { g.beginPath(); g.roundRect(-218, -64, 436, 128, 64); g.fill(); },
      face(g) {
        g.fillStyle = vgrad(g, -64, 64, '#ff9450', '#ef5f1a');
        g.beginPath(); g.roundRect(-218, -64, 436, 128, 64); g.fill();
        g.strokeStyle = 'rgba(255,244,226,0.6)'; g.lineWidth = 3; g.setLineDash([11, 8]);
        g.beginPath(); g.roundRect(-206, -52, 412, 104, 52); g.stroke(); g.setLineDash([]);
        // 컵
        g.fillStyle = C.cream; g.strokeStyle = C.cream; g.lineWidth = 7; g.lineCap = 'round';
        g.beginPath(); g.roundRect(-176, -14, 50, 46, [4, 4, 16, 16]); g.fill();
        g.beginPath(); g.arc(-122, 6, 12, -1.3, 1.3); g.stroke();
        g.fillStyle = '#7a3a14'; g.beginPath(); g.ellipse(-151, -12, 21, 4.5, 0, 0, TAU); g.fill();
        g.lineWidth = 4.5; g.strokeStyle = 'rgba(255,244,226,0.9)';
        for (const x of [-162, -148, -134]) { g.beginPath(); g.moveTo(x, -24); g.bezierCurveTo(x - 7, -32, x + 7, -38, x, -48); g.stroke(); }
        g.lineCap = 'butt';
        g.fillStyle = C.cream; cText(g, '커피 진심', 40, 2, PRET(58));
      },
    },

    // ---------------------------------------------------------- 호기심?
    curious: {
      w: 480, h: 160, R: 20, C: 16, seed: 33,
      shape(g) {
        g.lineWidth = 18; cText(g, '호기심', -34, 0, PRET(110), 'stroke'); cText(g, '호기심', -34, 0, PRET(110));
        g.save(); g.translate(186, -6); g.rotate(0.22); cText(g, '?', 0, 0, PRET(124), 'stroke'); cText(g, '?', 0, 0, PRET(124)); g.restore();
      },
      face(g) {
        g.lineJoin = 'round'; g.strokeStyle = C.navy; g.lineWidth = 18;
        cText(g, '호기심', -34, 0, PRET(110), 'stroke');
        g.fillStyle = vgrad(g, -55, 55, '#7fd4ff', C.skyD); cText(g, '호기심', -34, 0, PRET(110));
        g.save(); g.translate(186, -6); g.rotate(0.22);
        cText(g, '?', 0, 0, PRET(124), 'stroke');
        g.fillStyle = vgrad(g, -60, 60, '#ffe680', C.yellowD); cText(g, '?', 0, 0, PRET(124));
        g.restore();
      },
    },

    // ---------------------------------------------------------- 덕질 중
    fan: {
      w: 420, h: 150, R: 20, C: 16, seed: 44,
      shape(g) {
        cText(g, '덕질 중', -10, 0, BHS(104)); cText(g, '덕질 중', -6, 8, BHS(104));
        heartPath(g, 182, -38, 26); g.fill();
      },
      face(g) {
        g.fillStyle = C.plum; cText(g, '덕질 중', -6, 8, BHS(104));
        g.fillStyle = vgrad(g, -50, 50, '#ff86b3', C.pink); cText(g, '덕질 중', -10, 0, BHS(104));
        g.fillStyle = C.red; heartPath(g, 182, -38, 26); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(172, -50, 6, 4, -0.6, 0, TAU); g.fill();
      },
    },

    // ---------------------------------------------------------- 웃는 별
    star: {
      w: 176, h: 176, R: 14, C: 10, seed: 55, bubbles: 2, wrinkles: 1,
      shape(g) { starPath(g, 0, 6, 80, 0.52); g.lineWidth = 12; g.lineJoin = 'round'; g.stroke(); g.fill(); },
      face(g) {
        starPath(g, 0, 6, 80, 0.52);
        g.lineJoin = 'round'; g.strokeStyle = C.navy; g.lineWidth = 12; g.stroke();
        g.fillStyle = vgrad(g, -70, 80, '#ffe680', '#ffbf1f'); g.fill();
        g.fillStyle = C.navy;
        g.beginPath(); g.ellipse(-15, 2, 5, 7.5, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(15, 2, 5, 7.5, 0, 0, TAU); g.fill();
        g.strokeStyle = C.navy; g.lineWidth = 4.5; g.lineCap = 'round';
        g.beginPath(); g.arc(0, 14, 11, 0.35, Math.PI - 0.35); g.stroke(); g.lineCap = 'butt';
        g.fillStyle = 'rgba(255,90,120,0.45)';
        g.beginPath(); g.ellipse(-30, 18, 8, 5, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(30, 18, 8, 5, 0, 0, TAU); g.fill();
      },
    },

    // ---------------------------------------------------------- 하트
    heart: {
      w: 136, h: 124, R: 13, C: 8, seed: 66, bubbles: 1, wrinkles: 1,
      shape(g) { heartPath(g, 0, 2, 54); g.lineWidth = 10; g.lineJoin = 'round'; g.stroke(); g.fill(); },
      face(g) {
        heartPath(g, 0, 2, 54);
        g.lineJoin = 'round'; g.strokeStyle = C.navy; g.lineWidth = 10; g.stroke();
        g.fillStyle = vgrad(g, -50, 50, '#ff6f86', '#e8203f'); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.8)';
        g.beginPath(); g.ellipse(-26, -24, 11, 7, -0.7, 0, TAU); g.fill();
      },
    },
  };
}
