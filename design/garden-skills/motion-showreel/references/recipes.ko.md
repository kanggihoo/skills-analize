# 바로 쓸 수 있는 레시피

모두 **t만 입력으로 받는 순수 함수 형태**이며 `render(t)`에 바로 옮길 수 있습니다. 예제는 `motion.js`에서 필요한 함수를 이미 가져왔다고 가정합니다. `ctx`는 `setupCanvas`가 반환하는 2D 컨텍스트이며 `U = Math.min(W, H) / 1080`입니다. 아래 코드는 기법의 뼈대이므로 색상, 크기, 속도는 brief에 맞춰 다시 설계해야 합니다.

목차: 1 마스크된 글자 등장 · 2 앞뒤 가장자리 늘이기 · 3 형태 변형 연결 · 4 커서 구동 · 5 관통 전환 · 6 마스크 와이프 · 7 입자로 글자 만들기 · 8 무상태 파티클 방출기 · 9 카운터 · 10 SVG 스트로크 · 11 심리스 루프 · 12 WebGL 후처리 · 13 잔상 · 14 박자 구동 · 15 Canvas 가짜 3D 덩어리

---

## 1. 마스크된 글자 등장 (글자가 기준선 아래에서 튀어 오름)

```js
function maskedWord(word, x, baseY, size, tIn, { gap = 0.045, tOut = null, color = '#111' } = {}) {   // tOut = null: 퇴장하지 않음
  ctx.font = `800 ${size}px Display`;
  const glyphs = [...word], w = glyphs.map(g => ctx.measureText(g).width);
  let cx = x;
  glyphs.forEach((g, i) => {
    const kIn = spring(t - tIn - i * gap, { freq: 2.6, damp: 0.72 });
    const kOut = tOut == null ? 0 : ease.inCubic(seg(t, tOut + i * gap * 0.6, tOut + i * gap * 0.6 + 0.25));
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - 2, baseY - size * 0.9, w[i] + 4, size * 1.02); ctx.clip();   // 창: 대문자 높이 + 약간의 여유
    ctx.fillStyle = color;
    ctx.fillText(g, cx, baseY + (1 - kIn) * size * 1.05 - kOut * size * 1.05);
    ctx.restore();
    cx += w[i];
  });
  return cx - x;   // 단어 전체 너비. 뒤 요소를 배치할 때 유용
}
```

한국어는 글자 단위로 나누면 됩니다. 단어 묶음을 통째로 등장시킬 때는 `glyphs`를 단어 배열로 바꿉니다. 글꼴마다 실제 글자 높이가 다르므로 창의 위아래 경계를 조정하고, 먼저 한 프레임을 렌더링해 잘리는 부분이 없는지 확인합니다.

## 2. 앞뒤 가장자리 늘이기 (표시 막대, 진행 막대, 점에서 선으로)

```js
// 표시 막대가 a에서 b로 이동: 앞쪽 가장자리는 빠르게, 뒤쪽은 느리게 움직여 이동 중 늘어나고 도착하면 원래 길이로 돌아옴
const moves = [[0, 100], [2.0, 620], [3.0, 300]];             // [시간, 목표 x]
const fast = { freq: 3.6, damp: 0.8 }, slow = { freq: 2.2, damp: 0.85 };
const towardRight = (i) => i === 0 || moves[i][1] >= moves[i - 1][1];
// 오른쪽으로 이동할 때는 오른쪽이 앞쪽 가장자리, 왼쪽으로 이동할 때는 왼쪽이 앞쪽 가장자리
const right = springTo(t, moves.map(([tt, x], i) => [tt, x + 80, towardRight(i) ? fast : slow]));
const left  = springTo(t, moves.map(([tt, x], i) => [tt, x,      towardRight(i) ? slow : fast]));
ctx.fillRect(left, y, right - left, 6 * U);
```

## 3. 형태 변형 연결 (요소 하나가 일련의 UI 상태로 변환)

```js
// 각 상태: [x, y, w, h, 반경], 색상은 별도로 보간
const S = [
  [W/2 - 160, H/2 - 40, 320, 80, 40],     // 버튼
  [W/2 - 40,  H/2 - 40, 80,  80, 40],     // 로딩 원
  [W/2 - 300, H/2 - 60, 600, 120, 60],    // 다이내믹 아일랜드
  [W/2 - 360, H/2 - 220, 720, 440, 36],   // 카드
];
const T = [0, b(2), b(4), b(6)];
const box = springTo(t, S.map((s, i) => [T[i], s]), { freq: 2.4, damp: 0.78 });
const k = T.findLastIndex(x => t >= x);                     // 현재 상태 인덱스
const col = mix(COLORS[Math.max(0, k - 1)], COLORS[k], spring(t - T[k]));
ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(...box.slice(0, 4), box[4]); ctx.fill();
// 컨테이너 안의 콘텐츠는 상태마다 따로 등장함 (T[k] + 0.12초 이후 페이드 인하며 위로 이동), 다음 T 전 0.1초에 퇴장 (흐려지며 페이드 아웃)
```

콘텐츠를 바꿀 때 이전 콘텐츠에 `ctx.filter = 'blur(6px)'`를 적용해 0.1초 동안 페이드 아웃하고, 새 콘텐츠는 0.08초 뒤에 등장시킵니다. 이전 문장과 새 문장이 겹치지 않습니다.

## 4. 커서 구동

```js
// 커서 경로: 키프레임 + 구간별 이징. 눌림 상태는 시간 범위로 결정
const cur = tween(t, [[0, [W*0.7, H*0.8]], [b(1.5), [W/2, H/2], glide], [b(3.5), [W/2 + 240, H/2], ease.inOutCubic]]);
const down = (t > b(1.8) && t < b(2.0)) || (t > b(2.5) && t < b(3.6));     // 클릭 + 드래그
const press = down ? 0.88 : 1;                                             // 누르는 동안 커서를 축소
// 드래그: 드래그하는 동안 값은 커서 위치로 계산되고, 마우스를 놓으면 스냅 값으로 스프링 이동
const raw = clamp((cur[0] - trackX) / trackW);
const value = t < b(3.6) ? raw : springTo(t, [[b(3.6), raw], [b(3.6) + 0.001, Math.round(raw * 4) / 4]]);
```

클릭한 프레임에 `click` 효과음을 배치합니다 (timeline의 CUES에 기록). 커서는 단순한 벡터 화살표로 만들고 누를 때 퍼져 나가는 원형 링을 더합니다.

## 5. 관통 전환 (카메라가 점 안으로 돌진하고 다음 장면이 그 안에 나타남)

```js
// p: 0→1 전환 진행률; target: 장면 A에서 들어갈 지점 (예: 문자 O의 중심); Z: 돌진 시 최대 확대 배수
function zoomThrough(p, target, drawA, drawB, Z = 60) {
  const e = ease.inOutExpo(p);
  if (e < 0.5) {                                   // 전반부: A를 target 중심으로 지수 확대
    const z = Math.pow(Z, e * 2);
    ctx.save(); camera(ctx, W, H, { x: target[0], y: target[1], zoom: z }); drawA(); ctx.restore();
  } else {                                         // 후반부: B가 아주 작게 시작해 1까지 확대됨. B의 중심은 그 지점에 놓임
    const z = Math.pow(Z, (e - 0.5) * 2) / Z;
    ctx.save(); camera(ctx, W, H, { x: W / 2, y: H / 2, zoom: z }); drawB(); ctx.restore();
  }
}
```

핵심: A의 “구멍”을 B의 주색으로 채워 중간 프레임에서 색이 이어지게 합니다. `p ≈ 0.5` 프레임에 whoosh 효과음의 최고점을 두고 `--subframes 4`를 설정하면 효과가 더 좋아집니다.

## 6. 마스크 와이프 (장면 속 도형으로 다음 장면을 드러냄)

```js
const p = snap(seg(t, t0, t0 + 0.6));
drawA();
ctx.save();
ctx.beginPath();
// 사선 와이프: 평행사변형이 왼쪽에서 오른쪽으로 쓸고 지나감
const x = lerp(-W * 0.4, W * 1.2, p), slant = H * 0.35;
ctx.moveTo(-W, 0); ctx.lineTo(x + slant, 0); ctx.lineTo(x, H); ctx.lineTo(-W, H); ctx.closePath();
ctx.clip(); drawB(); ctx.restore();
```

경로를 커다란 글자로 바꾸고 (`ctx.font` + `ctx.fillText`와 `globalCompositeOperation = 'destination-in'` 조합) “문자 자체가 창”이 되게 할 수 있습니다.

## 7. 입자로 글자 만들기 (무상태 방식)

```js
// 초기화 (READY 전, 한 번만 실행하고 결과를 고정): 오프스크린 캔버스에 글자를 쓴 후 격자 샘플링으로 목표점 추출
function sampleText(text, font, w, h, step) {
  const c = new OffscreenCanvas(w, h), g = c.getContext('2d');
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2);
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128) pts.push([x, y]);
  return pts;
}
const TARGETS = sampleText('MOTION', `900 ${300 * U}px Display`, W, H, Math.round(6 * U));   // 글꼴이 로드된 뒤 호출

// render(t)에서: 입자 i의 위치는 i와 t만으로 결정됨
TARGETS.forEach(([tx, ty], i) => {
  const r = rng(i + 1), sx = r() * W, sy = r() * H, delay = r() * 0.6;   // 시작점과 지연 시간은 인덱스로 결정
  const k = spring(t - tForm - delay, { freq: 1.8, damp: 0.8 });        // 모여듦
  const boom = ease.outExpo(seg(t, tBurst, tBurst + 0.8));              // 폭발
  const ang = r() * TAU, dist = (200 + r() * 600) * U;
  const drift = (noise1(t * 0.7 + i * 0.13) - 0.5) * 30 * U * (1 - k);  // 모이기 전의 부유
  const x = lerp(sx, tx, k) + drift + Math.cos(ang) * dist * boom;
  const y = lerp(sy, ty, k) + drift + Math.sin(ang) * dist * boom;
  ctx.fillRect(x, y, 3 * U, 3 * U);
});
```

Canvas는 입자 수천 개까지 처리할 수 있습니다. 만 단위로 늘어나면 WebGL의 포인트 스프라이트나 Three.js의 `InstancedMesh`로 바꾸고, 동일한 공식을 vertex shader 안에서 계산하며 uniform으로 t를 전달합니다.

## 8. 무상태 방출기 (불꽃, 꼬리, 색종이)

```js
// 입자 i는 born = i / rate 시점에 생성되고 life 동안 유지됨. 위치는 해석식으로 계산하므로 이전 프레임 값이 필요 없음
function emitter(t, { rate = 120, life = 1.2, origin, speed = 600, gravity = 900, seed = 3, tStart = 0, tEnd = Infinity }) {
  const first = Math.max(0, Math.floor((t - life - tStart) * rate)), last = Math.floor((Math.min(t, tEnd) - tStart) * rate);
  for (let i = first; i <= last; i++) {
    const born = tStart + i / rate, age = t - born; if (age < 0 || age > life) continue;
    const a = -Math.PI / 2 + (hash(i, seed) - 0.5) * 1.2, v = speed * (0.5 + hash(i, seed + 1));
    const x = origin[0] + Math.cos(a) * v * age, y = origin[1] + Math.sin(a) * v * age + 0.5 * gravity * age * age;
    ctx.globalAlpha = 1 - age / life; ctx.fillRect(x, y, 4 * U, 4 * U);
  }
  ctx.globalAlpha = 1;
}
```

## 9. 카운터

```js
const v = Math.round(lerp(0, 12800, ease.outExpo(seg(t, t0, t0 + 2.0))));
const land = pulse(t, t0 + 2.0, 0.15);                         // 목표에 도달할 때 한 번 눌리는 느낌
ctx.save(); ctx.translate(cx, cy); ctx.scale(1 + land * 0.08, 1 + land * 0.08);
ctx.font = `800 ${220 * U}px Display`; ctx.textAlign = 'center';
ctx.fillText(v.toLocaleString('en-US'), 0, 0); ctx.restore();
// 사운드: 숫자가 변하는 동안 값 변화에 맞춰 tick을 재생 (점점 간격을 넓힘), 도착 순간 impact 재생
```

## 10. SVG 스트로크 (로고, 손글씨 주석)

```html
<svg viewBox="0 0 400 200"><path id="p" pathLength="1" d="..." fill="none" stroke="#111" stroke-width="6" stroke-dasharray="1"/></svg>
```
```js
const k = ease.inOutCubic(seg(t, t0, t0 + 1.2));
document.getElementById('p').style.strokeDashoffset = 1 - k;
```

여러 경로는 시간차를 둡니다: 각 경로의 시작 시점을 `t0 + i * 0.08`로 설정합니다. 선을 다 그린 뒤 스프링 효과로 채움색을 나타냅니다.

## 11. 심리스 루프

```js
const th = TAU * (t % DUR) / DUR;                          // 모든 움직임을 th의 함수로 작성
const x = Math.cos(th * 2 + i * 0.3) * R;                  // 주파수를 정수배로 설정하면 시작과 끝이 자연스럽게 이어짐
const n = noise2(Math.cos(th) * 1.5 + 10, Math.sin(th) * 1.5 + 10, i);   // 원 위에서 노이즈를 샘플링하면 주기적인 노이즈가 됨
```

`inspect.mjs loop out/final.mp4`로 이음새를 확인합니다. 마지막 프레임에서 첫 프레임으로 넘어가는 단계와 양옆의 일반 프레임 간 유사도를 비교합니다 (첫 프레임과 마지막 프레임이 완전히 같을 필요는 없습니다. `render(DUR) = render(0)`이고 마지막 프레임은 첫 프레임보다 한 프레임 빠릅니다). 두 번 연속 재생해 이음새도 확인합니다.

## 12. WebGL 후처리 (CRT / 색수차 / 비네팅 / 하프톤을 한 단계에서 처리)

```html
<canvas id="src" style="display:none"></canvas><canvas id="out"></canvas>
```
```js
const src = document.getElementById('src'), out = document.getElementById('out');
const ctx = setupCanvas(src, W, H);                                  // 평소처럼 src에 그리기
out.width = src.width; out.height = src.height; out.style.width = W + 'px'; out.style.height = H + 'px';
const gl = out.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const vs = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0, 1); }`;
const fs = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D tex; uniform float t, hit; uniform vec2 res;
vec2 curve(vec2 u){ u = u * 2.0 - 1.0; u *= 1.0 + 0.06 * dot(u.yx, u.yx); return u * 0.5 + 0.5; }   // 브라운관 곡면
void main(){
  vec2 u = curve(uv);
  if (u.x < 0.0 || u.x > 1.0 || u.y < 0.0 || u.y > 1.0) { o = vec4(0, 0, 0, 1); return; }
  float ca = 0.0015 + hit * 0.008;                                   // 색수차: 충돌 순간 강화
  vec3 c = vec3(texture(tex, u + vec2(ca, 0)).r, texture(tex, u).g, texture(tex, u - vec2(ca, 0)).b);
  c *= 0.82 + 0.18 * sin(u.y * res.y * 3.14159);                     // 스캔 라인
  c *= 1.0 - 0.35 * pow(length(uv - 0.5) * 1.3, 2.0);                // 비네팅
  o = vec4(c, 1);
}`;
const prog = gl.createProgram();
for (const [type, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
  const sh = gl.createShader(type); gl.shaderSource(sh, s); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));   // 컴파일 실패를 명확히 보고
  gl.attachShader(prog, sh);
}
gl.linkProgram(prog); gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

function post(t, hit = 0) {                                          // render(t) 끝에서 호출
  gl.viewport(0, 0, out.width, out.height);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.uniform1f(gl.getUniformLocation(prog, 't'), t);
  gl.uniform1f(gl.getUniformLocation(prog, 'hit'), hit);
  gl.uniform2f(gl.getUniformLocation(prog, 'res'), H, H);            // 스캔 라인 밀도를 프레임 높이에 맞춤
  gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish();
}
```

픽셀 스타일을 원하면 `src`에서 논리 캔버스를 낮은 해상도로 사용하고 텍스처 필터를 `gl.NEAREST`로 변경합니다. 하프톤은 fragment shader에서 밝기에 따라 격자형 점을 그립니다. 그레인은 여기서 넣지 말고 `--grain`을 사용합니다.

## 13. 잔상 (모션 블러를 사용하지 않을 때 빠른 움직임 표현)

```js
// 시간을 거슬러 몇 번 샘플링하고 투명도를 낮춰 방향이 맞는 잔상을 만듦
for (let k = 4; k >= 0; k--) {
  const tt = t - k * 0.012;                 // 12ms씩 과거 프레임 샘플링
  ctx.globalAlpha = k === 0 ? 1 : 0.18 * (1 - k / 5);
  drawMover(tt);                            // 빠르게 움직이는 요소만 그림
}
ctx.globalAlpha = 1;
```

## 14. 박자 구동

```js
import { b, CUES, BEAT } from './timeline.js';
const hits = CUES.filter(c => c.sfx === 'kick').map(c => c.t);
const kick = pulse(t, hits, 0.14);                // 강박마다 확대 / 밝기 펄스
const beatIndex = Math.floor(t / BEAT);           // 현재 박자 번호. 색상이나 레이아웃 전환에 활용 가능
const onBeat = (t % BEAT) / BEAT;                 // 박자 내 진행률 0→1. 박자 안의 작은 동작을 구동 가능
```

사용자가 곡을 제공하면 `beats.json`의 `beats` / `downbeats` / `drops`를 `timeline.js`에 복사해 배열로 export합니다. 화면과 `score.mjs`가 모두 이 데이터를 읽도록 합니다.

**전환의 공개 시점을 박자에 맞추기**: 새 화면이 전환 중 어느 시점에 처음 보이는지 (`reveal`, 0–1)를 측정한 뒤 시작 시간을 역산합니다. 박자 시점에 새 화면이 드러나게 합니다. 박자의 충격은 새 화면에만 주지 말고 무대 전체에 적용해 이전 화면과 새 화면이 함께 확대되었다 돌아오게 합니다.

```js
import { b, revealOn } from './timeline.js';
const HIT = b(16), TD = 0.5;                       // 16번째 박자에 장면 전환; 이 홍채 전환은 0.5초이고 30% 지점에서 새 장면이 보이기 시작
const T0 = revealOn(HIT, TD, 0.3);                 // = HIT − 0.15 s
const p = seg(t, T0, T0 + TD);                     // 전환 진행률 0→1
const punch = 1 + 0.03 * pulse(t, [HIT], 0.2);     // 박자에 3% 확대, 약 0.3초 동안 원래 크기로 복귀
ctx.save(); camera(ctx, W, H, { zoom: punch });    // 새 장면뿐 아니라 두 레이어 모두에 충격 적용
drawOld(t); drawIris(p, () => drawNew(t));
ctx.restore();
```

렌더 후 `inspect.mjs strip --at <HIT>`으로 연속 프레임을 봅니다. 박자 프레임에서 새 장면이 이미 보여야 하고 전체 화면에 눈에 띄는 변화가 있어야 합니다.

## 15. Canvas 가짜 3D 덩어리 (Three.js 없이 평면 그리드를 공간으로 세우기)

규칙적인 그리드의 블록, 기둥, 건물, 막대 그래프는 `motion.js`의 `camera3d` + `drawBoxes`로 충분합니다. 원근 투영과 화가 알고리즘을 사용하며 수백 개 덩어리를 프레임당 몇 ms 안에 그릴 수 있습니다. 2D 화면과 같은 캔버스를 사용하므로 “평면 → 입체”가 하나의 연속된 카메라 동작이 될 수 있습니다.

```js
import { camera3d, drawBoxes, glide, seg, spring, lerp, mix, TAU } from './motion.js';
import { BAR } from './timeline.js';
const S = 96 * U, F = 1400 * U;                                     // 그리드 간격; 초점 거리는 고정하고 dist를 줄여 당겨 들어감
const INK = { top: '#F8F7F3', px: '#8E8B85', nx: '#D2CFC8', pz: '#111', nz: '#3A3936' };   // 방향별 색상 하나 = 조명
const tilt = glide(seg(t, t0, t0 + 1.6));
const cam = camera3d({ W, H, focal: F, dist: F * lerp(1, 0.92, tilt),
  pitch: lerp(Math.PI / 2, 35 * Math.PI / 180, tilt),               // π/2 = 정수직 하향: 2D 레이아웃과 완전히 포개짐
  yaw: lerp(0, 0.5, tilt), cx: W / 2 + W * 0.16 * tilt, cy: H / 2 + H * 0.2 * tilt });   // 큰 글자 공간을 위해 주체를 비켜 배치
const boxes = [];
for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) {
  const d = Math.hypot(i, j); if (d > 6.5) continue;                // 원형 섬: 윤곽이 깔끔하고 글자를 위한 하늘 공간을 남김
  const h = S * spring(t - t0, { freq: 1, damp: 0.95 }) * (0.4 + 2.4 * (0.5 + 0.5 * Math.cos(0.6 * d - TAU * (t - t0) / BAR)));
  const top = mix('#111', INK.top, Math.min(1, h / (S * 0.4)));    // 높이 0일 때 윗면은 먹색 블록, 솟으면서 밝아짐: 색상 점프 방지
  boxes.push({ x: i * S, z: j * S, w: S * 0.5, h, color: { ...INK, top } });
}
drawBoxes(ctx, cam, boxes);
```

핵심:

- **정수직 하향 = 평면**: `pitch = π/2`, 높이가 0일 때 덩어리는 2D 그리드의 사각형이 됩니다 (`focal = dist`일 때 비율 1:1). 2D 장면에서 넘어올 때 2D의 마지막 프레임을 이 프레임에 맞춘 뒤 카메라를 기울이면 시청자는 장면 전환이 아니라 “평면이 솟아오르는” 것을 보게 됩니다.
- 카메라의 기저 벡터는 pitch / yaw에서 직접 만듭니다. 정수직 하향에서도 `lookAt(cross(forward, worldUp))`처럼 특이점이 생기지 않습니다.
- 화가 알고리즘은 카메라와의 수평 거리가 먼 순서대로 체적을 정렬하므로 서로 떨어진 덩어리에 적합합니다. 덩어리가 서로 겹치거나 실제 조명·그림자가 필요하면 Three.js로 바꿉니다.
- 월드 좌표에서 y축은 위를 향하고 지면의 y = 0입니다. yaw = 0이면 카메라는 +z 쪽에 있고 `pz`가 앞면입니다.
- 큰 글자와 덩어리를 한 화면에 둘 때는 먼저 “글자 금지 영역”(stack.md 4절)을 정합니다. `cx / cy`와 섬 반경으로 덩어리가 이 영역에 들어오지 않게 한 뒤 여러 정지 프레임을 렌더링해 확인합니다.
