# 기술 스택: 페이지 계약, 결정성, 기술별 함정

목차: 1 페이지 계약 · 2 결정성 · 3 화면에 맞는 기술 고르기 · 4 Canvas 2D · 5 DOM / SVG · 6 WebGL 후처리 · 7 Three.js · 8 p5.js · 9 폰트 · 10 소재 · 11 다중 화면비 · 12 성능과 렌더링 시간

---

## 1. 페이지 계약

```js
window.DUR = 16;                  // 秒，render.mjs 用它算总帧数（timeline.js 导出）
window.render = (t) => { ... };   // 画出第 t 秒；确定性；可以返回 Promise（比如要等视频帧解码）
window.READY = true;              // 字体、图片、模型、纹理全部加载完以后再设置
```

- 렌더링 도구는 프로젝트 디렉터리를 HTTP 서버로 제공한다(그래야 ES module, 폰트, glTF가 로드된다). 뷰포트 = `--size`, DPR = `--dpr`. 페이지는 `stageSize()`로 `?w=&h=`를 읽고, 이 크기에 맞춰 레이아웃한다.
- 페이지의 JS 오류나 필수 스크립트의 404가 나면 도구는 즉시 종료하고 오류를 출력한다. 선택 파일의 404는 경고만 한다.
- `--out`은 명령을 실행한 작업 디렉터리 기준으로 해석하며, 프로젝트 인수와는 따로 계산한다. 프로젝트 디렉터리에 먼저 들어가지 않았다면 `<slug>/qa/...` 또는 절대 경로를 쓴다.
- 미리보기: `npx serve <slug>` 또는 임의의 정적 서버를 실행하고 `index.html?w=1920&h=1080`을 연 뒤, 콘솔에서 `render(3.2)`를 호출하면 3.2초 장면을 볼 수 있다. 디버깅용으로 임시로 `?play=1` 분기를 추가해 rAF로 `render(performance.now()/1000 % DUR)`를 구동할 수도 있지만, **렌더링 중에는 이 분기가 실행되면 안 된다.**

### 서브프레임 샘플링에서의 텍스트와 하드 컷(선택)

`--subframes 2` 같은 모션 블러 설정을 쓰면, 두 샘플이 문구 전환 지점을 가로질러 새 글자와 옛 글자가 한 프레임에 섞일 수 있다. 이를 피해야 하는 프로젝트는 샘플링 컨텍스트를 명시적으로 켠다.

```js
window.RENDER_CONTEXT = true;
window.render = (t, frame = {}) => {
  const copyTime = frame.frameTime ?? t;
  // 文案内容、硬切状态由 copyTime 决定。
  const caption = copyTime < 2 ? 'BEFORE' : 'AFTER';
  // 物体运动、文字位移和有意的淡化仍用 t，保留运动模糊。
  drawScene(t, caption);
};
```

켜면 렌더러는 추가로 `{ frameTime, fps }`를 전달한다. `t`는 현재 서브프레임 시간이고, `frameTime`은 이 출력 프레임의 정확한 시간이며, 구간 내보내기의 시작점도 포함한다. 일반 미리보기와 수동 호출은 여전히 `t`만 넘길 수 있으므로, 두 번째 인수는 기본값과 대체 동작을 유지해야 한다. 이 설정을 켜지 않은 기존 프로젝트는 기존의 한 인수 `render(t)` 호출을 그대로 쓰며, 기본 샘플링, fps, 효과는 바뀌지 않는다. 모든 애니메이션 시간을 반올림하지 않으며, 의도된 교차 페이드를 하드 컷으로 바꾸지 않는다.

### 기본 워크스페이스와 가벼운 디버그 미리보기

제작할 때 기본적으로 `node <skill>/scripts/editor.mjs <slug> --size <이 영상의 크기> --fps <이 영상의 fps>`를 실행해 워크스페이스를 능동적으로 열고, 사용자가 미리보고 확인한 뒤에야 MP4를 생성한다(자세한 내용은 `editor.md`). 아래의 `preview.mjs`는 가벼운 디버깅 도구로 남으며, 워크스페이스 검수를 자동으로 대체하지 않는다.

`preview.mjs`는 메모리에서 컨트롤을 추가하며, 프로젝트 소스 파일을 수정하지 않는다. 기존 프로젝트도 바로 쓸 수 있다. 새 스캐폴드에는 `preview.js`도 들어 있어 일반 정적 서버로도 미리볼 수 있다. 수동으로 연결하려면 이 파일을 복사하고 `body`에 `<script type="module" src="./preview.js"></script>`를 추가한다. 컨트롤은 `?preview=1`이고 `render=1`이 아닐 때만 동작하며, 페이지의 `render(t)`를 바꾸지 않는다.

```bash
node <skill>/scripts/preview.mjs <slug> --size 1920x1080 --fps 30
# 指定项目内音轨（路径相对项目）：
node <skill>/scripts/preview.mjs <slug> --size 1080x1920 --audio audio/final.wav
```

출력된 로컬 주소를 열고 재생을 누른다. 일시정지, 드래그, 좌우 프레임 이동, 미리보기 배속을 지원한다. 오디오 트랙이 있으면 `audio.currentTime`으로 화면을 구동하고, 없으면 미리보기 클록을 쓴다. 트랙을 지정하지 않으면 `audio/final.wav`, `audio/narration.wav`, `audio/music.wav` 순으로 찾는다. 오디오가 아직 생성되지 않았다면 소리 없이 동작 예고편만 보는 것이며, 그 결과로 음과 화면이 맞춰졌다고 주장할 수 없다.

화면은 지정한 너비와 높이에 맞춰 창에 비례 배치되며, 컨트롤 공간을 남긴다. 창 크기를 바꿔도 프레임을 잡는 크기는 바뀌지 않는다. 장면 레이아웃은 페이지 계약에 따라 `stageSize()`를 써야 하며, 미리보기 창의 `innerWidth`나 `vw/vh`에 의존하지 않는다.

미리보기 컨트롤과 실시간 상태는 `render(t)`를 호출하는 역할만 한다. 정식 렌더링은 여전히 결정적 시간으로 프레임을 잡는다. `?render=1`일 때는 플레이어, 컨트롤, 애니메이션 루프를 만들지 않는다. 배속은 미리보기에만 영향을 주며, 원고, 오디오 파일, 내보내기 사양은 바꾸지 않는다. 대표적인 연속 클립으로 대상의 상태, 샷의 이어짐, 핵심 단어 이벤트를 확인하며, fps 수치로 시각적 검토를 대신하지 않는다.

## 2. 결정성

렌더러는 `render(t)`를 임의의 순서로, 임의의 횟수만큼 호출한다. 여러 worker의 구간별 병렬 실행, 단일 프레임 미리보기, 구간만 다시 렌더링, 모션 블러의 서브프레임이 모두 그렇게 동작한다. 상태 하나라도 이전 프레임에 숨어 있으면, 다시 렌더링한 화면은 달라진다.

| 금지 | 대신 쓰기 |
|---|---|
| `Math.random()` | `rng(seed)`(render 안에서 고정 시드로 새로 만듦) 또는 `hash(i, seed)` |
| `Date.now()` / `performance.now()` / rAF / `setTimeout` | 매개변수 t만 사용 |
| CSS `transition` / `animation` / Web Animations | render(t) 안에서 스타일을 직접 씀(transform, opacity, clip-path …) |
| 프레임마다 누적되는 위치와 속도(`x += v`) | 해석적 `x(t)`; 스프링은 `spring` / `springTo` |
| 물리나 유체처럼 누적되어야 하는 시뮬레이션 | 0에서 고정 간격으로 t까지 진행(캐시할 수 있지만, 단일 프레임도 정확히 계산되어야 함), 또는 배열로 미리 구워 둠 |
| `<video>` 요소의 자연 재생 | `video.currentTime = t`를 설정하고 `seeked` 이벤트를 기다림(render는 Promise를 반환), 또는 ffmpeg로 이미지 시퀀스로 분해 |
| 뷰포트에 따라 달라지는 무작위 레이아웃 | 시드를 고정하고, W/H에만 의존 |

큰 수정을 한 뒤에는 `render.mjs <slug> --determinism`을 한 번 실행한다.

## 3. 화면에 맞는 기술 고르기

**먼저 화면의 스타일을 정하고, 그 스타일을 만들 수 있는 가장 단순한 기술을 고른다.** 한 가지로 끝낼 수 있다면 세 가지를 섞지 않는다. 섞어야 한다면 「내용 레이어 → 질감 레이어」 순으로 쌓고, 각 레이어를 따로 실행하고 따로 검사할 수 있게 한다.

| 기술 | 잘하는 것 | 못하는 것 |
|---|---|---|
| Canvas 2D | 픽셀, 평면 도형, 기하, 타이포그래피, 파티클(수천 개 이하), 손그림 선; 규칙적인 격자의 의사 3D 블록(`camera3d` + `drawBoxes`, recipes.md 15절) | 수만 개의 파티클, 픽셀 단위 질감, 서로 관통하는 3D 물체 |
| DOM / CSS / SVG | 인터페이스 모션, 실제 텍스트 조판, SVG 스트로크, 제품 스크린샷 카드 | 수천 개 이상의 요소, 복잡한 질감 |
| WebGL 프래그먼트 셰이더 | CRT, 그레인, 색수차, 하프톤, 액체, 노이즈 필드, SDF 도형 | 내용과 텍스트를 직접 그리기(보통 먼저 Canvas로 그리고, 그것을 텍스처로 셰이더에 넘김) |
| Three.js | 3D 장면, 압출된 텍스트, 인스턴스 배열, 유리와 금속 재질, 공간 카메라 | 사실적인 인물 |
| p5.js + p5.brush | 색연필, 수채, 크레용 붓질 | 렌더링 속도(붓이 느림. 먼저 단일 프레임 소요 시간을 측정) |
| Remotion / HyperFrames | 여러 씬으로 된 긴 영상, 사용자가 이미 쓰고 있거나 이름을 대며 요청한 경우 | 십여 초짜리 단편(단일 HTML이 더 빠름). 먼저 도입하지 않는다 |

## 4. Canvas 2D

- `setupCanvas(canvas, W, H)`는 DPR에 맞춰 캔버스 크기를 설정하고, 컨텍스트를 CSS 픽셀 단위로 스케일한다. **매 프레임 `ctx.save()` / `ctx.restore()`로 감싸고, `setTransform(1,0,0,1,0,0)`은 쓰지 않는다.** 그렇지 않으면 `--dpr 2`일 때 왼쪽 위 4분의 1만 그려진다.
- 매 프레임 먼저 배경 전체를 채운다(`clearRect` 뒤의 투명 배경에 의존하지 않는다).
- 텍스트: 먼저 `await loadFonts([...])`를 하고, `ctx.font`의 글자 크기 단위는 CSS 픽셀이다. `measureText`로 글자 폭을 얻어 자간을 맞춘다.
- 픽셀 아트: 오프스크린 캔버스 + `imageSmoothingEnabled = false` + 정수배 확대 + 좌표 반올림.
- 블러와 글로우: `ctx.filter = 'blur(8px)'`도 쓸 수 있지만 느리다. 넓은 면적의 빛 번짐은 WebGL에서 처리한다.
- 합성 모드(`globalCompositeOperation`의 `multiply`, `screen`, 마스크용 `destination-in`)는 조판 마스크에 매우 유용하다.
- **텍스트 금지 영역**: 큰 글자와 복잡한 내용(3D 블록, 파티클, 콜라주, 배열)이 같은 화면에 있을 때, 먼저 `measureText`로 글자의 사각형을 구한다(위로 올라간 부분과 아래로 내려간 부분을 포함하고, 글자 크기의 약 0.15만큼 바깥으로 넓힌다). 이 사각형을 내용이 들어갈 수 없는 영역으로 취급한다. 카메라의 프레이밍 중심(`cx / cy`), 주체의 윤곽(원형 섬, 마스크), 레이어 순서를 이용해 내용을 밖으로 밀어낸다. 같은 색의 복잡한 도형 위에 글자가 올라가면 썸네일에서 깨진 글자로 읽혀서, 자체 점검에서 폰트나 코드 오류로 오인하기 쉽다. 큰 글자가 있는 모든 샷은 최소 한 장의 정지 프레임을 렌더링해서, 글자의 가장자리를 따로 확인한다.

## 5. DOM / SVG

- 모든 스타일은 render(t)에서 직접 쓴다: `el.style.transform = ...`. CSS 트랜지션에 의존하지 않는다.
- **크기가 바뀌고 글자를 포함하는 요소에는 `will-change: transform`을 쓰지 않는다.** 그렇지 않으면 글자가 래스터화된 뒤에 확대되어 흐려진다.
- SVG 스트로크 애니메이션: `pathLength="1"` + `stroke-dasharray="1"` + render에서 `stroke-dashoffset = 1 - k`를 설정한다.
- 도형 변형: 같은 `<div>`의 `width`, `height`, `border-radius`, `background`를 바꾼다(변형되는 컨테이너 안의 내용은 별도로 진입과 퇴장을 배치한다).
- DOM의 텍스트 조판이 품질이 가장 좋다(합자, 자간, 중국어 문장부호의 압축). 글자가 많을 때 적합하다.
- 스크린샷류 소재는 `<img>`를 쓰고, 미리 `decode()`한다.

## 6. WebGL 후처리

방법: 내용을 2D 캔버스에 그린다 → 매 프레임 텍스처로 업로드한다 → 전체 화면 삼각형에서 프래그먼트 셰이더를 실행한다 → 표시 캔버스에 출력한다. 전체 템플릿은 recipes.md의 「WebGL 후처리」를 본다.

- `getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })`를 쓰고, 매 프레임 그린 뒤에 `gl.finish()`를 호출한다.
- 시간에 의존하는 효과는 `t`를 uniform으로 넘긴다. 노이즈는 `hash(uv + floor(t * fps))` 같은 결정적 방식을 쓴다.
- **먼저 한 프레임을 렌더링해 셰이더가 실제로 적용되는지 확인한 뒤**(컴파일 실패 시 화면이 검거나 원본 내용만 보인다), 전편을 렌더링한다.
- 소프트웨어 렌더링(SwiftShader)에서는 매우 느리다. macOS에서 렌더링 도구는 기본적으로 Metal을 쓴다.

## 7. Three.js

- 프로젝트에 설치: `cd <slug> && npm i three`, 그리고 `index.html`에서 importmap을 사용한다.
  ```html
  <script type="importmap">{ "imports": { "three": "./node_modules/three/build/three.module.js", "three/addons/": "./node_modules/three/examples/jsm/" } }</script>
  ```
  렌더링할 때 CDN에 의존하지 않는다.
- `new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })`, `setPixelRatio(devicePixelRatio)`, `setSize(W, H)`.
- `render(t)`에서 카메라 위치와 방향, 물체 변환, 재질 매개변수, 조명을 설정한 뒤 → `renderer.render(scene, camera)`를 호출한다. `THREE.Clock`은 쓰지 않으며, 애니메이션 클립은 `mixer.setTime(t)`를 쓴다.
- 후처리(EffectComposer, 블룸, 피사계 심도)는 쓸 수 있지만, 한 레이어를 더할 때마다 프레임 시간을 확인한다.
- glTF, 텍스처, HDRI를 로드할 때는 모두 `await`한 뒤에 READY를 설정한다.

## 8. p5.js

- 인스턴스 모드와 `noLoop()`를 쓰고, `window.render = t => { T = t; p.redraw(); }`로 구동한다. `draw()`는 `T`만 읽는다. `randomSeed`와 `noiseSeed`는 매 프레임 고정값으로 다시 설정한다.
- p5.brush는 매우 느리므로, 먼저 단일 프레임 소요 시간을 측정한 뒤 길이와 프레임레이트를 정한다. 붓 자국의 무작위 시드는 `floor(t * 12)`를 쓴다. 붓 자국은 초당 12번만 바뀌어 손그림 애니메이션처럼 보이고, 카메라는 여전히 프레임마다 부드럽게 움직인다.

## 9. 폰트

- **셀프 호스팅**: `.woff2` 파일을 `fonts/`에 넣고 `@font-face`로 선언한다. `loadFonts()`가 로드를 마친 뒤에 READY를 설정한다. 렌더링할 때 Google Fonts 링크를 쓰지 않는다.
- 오픈소스 폰트 가져오기: `https://github.com/google/fonts/tree/main/ofl/<family>`(OFL 라이선스).
- **중국어**: 완전한 CJK 폰트는 수 MB에서 십수 MB에 이른다. 실제로 쓰는 글자만 서브셋으로 만들 수 있다. Google Fonts CSS API는 `&text=` 매개변수를 지원해 이 글자들의 글리프만 돌려준다. 예: `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@900&text=<URL 인코딩된 문장>`. 이 주소가 가리키는 폰트 파일을 `fonts/`에 내려받아 로컬에서 로드한다. 문구가 바뀌면 서브셋을 다시 만든다. 네트워크가 없으면 시스템 폰트로 대체한다: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`(기기마다 렌더링 결과가 다르므로 전달 설명에 명시한다).
- 숫자가 바뀌는 경우에는 `font-variant-numeric: tabular-nums`를 쓴다(Canvas에서는 등폭 숫자를 가진 폰트를 고른다).

## 10. 소재

- 사용자가 준 로고, 스크린샷, 제품 이미지, 폰트는 `assets/`에 복사하고 상대 경로로 참조한다. 핫링크하지 않는다.
- **브랜드 작업에는 반드시 실제 로고를 써야 한다.** 구할 수 없으면 멈추고 묻는다. 색 블록에 브랜드 이름을 써서 대신하지 않는다.
- 제품 인터페이스는 실제 스크린샷을 쓴다(Playwright로 사용자가 준 주소를 2배 DPR로 캡처할 수 있다). CSS로 가짜 인터페이스를 그려 실제 제품인 척하지 않는다.
- 사용 권한이 있는 소재만 쓰며, 전달할 때 출처와 라이선스를 명확히 적는다.

## 11. 다중 화면비

- 모든 레이아웃은 `W`, `H`에서 계산한다. 단위는 `U = Math.min(W, H) / 1080`이며, 위치는 비율이나 격자로 정한다.
- 9:16과 16:9는 단순히 잘라 낸 것이 아니다. 세로 화면의 글자는 더 크고 세로로 배열하며, 위아래로 약 12%의 안전 영역을 둔다(플랫폼 UI가 가린다). 여러 화면비가 필요하면 같은 타임라인을 쓰고, 화면비마다 따로 레이아웃을 조정한 뒤 각각 렌더링한다(`--size 1080x1920`).
- 16:9 완성본을 그대로 잘라 세로 영상으로 만들지 않는다.

## 12. 성능과 렌더링 시간

2분을 넘으면 `long-form.md`의 챕터별 빌더를 쓴다. 최대 길이는 1200초다. 기존 `render.mjs --start --duration`은 프레임 추출 도구로 남으며, `build-long.mjs`가 그 위에 영구 캐시, 재시도, 중단 후 복구를 제공한다. 오디오 합성도 챕터별로 해야 하며, 여러 개의 전편 PCM 버스가 메모리를 고갈시키게 해서는 안 된다. 나레이션이 있으면 먼저 `narration.md`에 따라 실제 오디오와 문장 시간을 준비한 뒤, 샷 타임라인을 쓴다.

- 렌더링 도구는 샘플마다 밀리초를 출력한다. 예상치: **전체 시간 ≈ 단일 프레임 소요 시간 × 프레임 수 × 서브프레임 수 ÷ worker 수 × 1.2**.
- 참고 범위(Apple Silicon, 1080p): 단순한 Canvas 2D 장면 15~40밀리초/프레임, DOM 조판 30~60밀리초, WebGL 후처리 +20~80밀리초, Three.js와 후처리 80~300밀리초.
- worker는 기본 3개이며, CPU 코어가 많으면 4~6개까지 늘릴 수 있다. WebGL이 무거운 페이지는 worker가 너무 많으면 오히려 느려진다.
- 먼저 워크스페이스에서 실시간으로 리듬을 미리보고, 사용자가 확인한 뒤에 MP4를 렌더링한다. `--subframes`, `--dpr`, fps는 brief의 최종 사양대로 내보내며, 미리보기를 위해 완성본 사양을 임의로 바꾸지 않는다. 사용자가 오프라인 클립이 필요하다고 동의한 경우에만 저화질 샘플을 만든다.
- 렌더링 중 오류가 나면 먼저 워크스페이스에서 위치를 찾고 고친다. 사용자가 확인한 뒤에는 해당 구간만 다시 렌더링할 수 있다(`--start 6 --duration 3 --out out/seg.mp4`). 그다음 확정된 사양으로 전편을 다시 빌드한다.
