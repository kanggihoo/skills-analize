# Performance budget

모든 완성된 페이지에 대해 `node scripts/perf.mjs <site/index.html>`(Node 22 이상)를 실행한다. 이 스크립트는 헤드라인 CPU Chrome에서 페이지를 1440과 390 너비로 로드하고, 뷰포트 근처의 effect가 마운트될 때까지 기다린 뒤, 맨 아래까지 스크롤하고, PASS, WARN, FAIL 중 하나를 출력한다. FAIL은 모두 고친다. `--json <file>`은 결과를 그 파일에도 쓴다. `--runs N`은 timing 로드 횟수를 정한다(기본 3).

수치 읽는 법:

- **Timing is a median of 3 loads** 이며 범위를 함께 출력한다(`runs 3, 33..161`). CPU에서 한 번 로드한 값은 노이즈다. 범위가 넓으면 호스트가 바빴던 것이다.
- **Host load** 는 전과 후에 샘플링한다. 50%를 넘으면 검사가 이를 알리고 timing을 WARN으로 제한한다. timing FAIL을 믿기 전에 기계가 한가할 때 다시 실행한다.
- **FCP and LCP are CPU-rendered.** 페이지끼리 비교하며, 현장 데이터(field data)와 비교하지 않는다.
- **WebGL off is a proxy, not a verdict.** SwiftShader는 shader를 CPU에서 돌려서 메인 스레드를 압도한다. 그래서 long task와 blocking time은 모든 WebGL 파트가 still fallback을 보여 주는 로드에서 측정한다. 이는 shader와는 다른 작업이다. 실제 GPU에서의 shader compile과 link는 측정되지 않는다. WebGL이 켜진 INFO 줄은 참고용이다.
- Counts(이미지, context, 모듈)와 bytes는 정확하며, 호스트 부하에 의존하지 않는다.

| Check | WARN | FAIL |
|---|---|---|
| Transfer (text gzipped) | 1500 KiB 초과 | 3000 KiB 초과 |
| Images total / largest single image | 1200 / 350 KiB 초과 | 2400 / 700 KiB 초과 |
| JS parsed / CSS | 450 / 120 KiB 초과 | 900 / 250 KiB 초과 |
| Requests | 60 초과 | 110 초과 |
| Font families / files / bytes | 2 / 4 / 160 KiB 초과 | 3 / 6 / 320 KiB 초과 |
| `<img>` without width and height (or CSS aspect-ratio) | 1~3 | 4 이상 |
| `<img>` below the fold and not lazy | 1~3 | 4 이상 |
| Oversized images, `<img>`, CSS background and SVG (natural over 2.2x the shown width) | 1~3 | 4 이상 |
| Photos as CSS or SVG background below the fold (cannot be lazy) | 1~3 | 4 이상 |
| WebGL contexts live (load, bottom, peak) | | 4 초과(hard cap) |
| WebGL contexts made over the whole scroll | 12 초과 | 24 초과 |
| Long tasks / blocking time, median, WebGL off | 8 / 1.5 s 초과 | 20 / 4 s 초과 |
| FCP / LCP, median | 2.5 / 4.5 s 초과 | 4.5 / 8 s 초과 |
| Layout shift, median | 0.1 초과 | 0.25 초과 |
| Effect, object or component module loaded, never mounted | 1~2 | 3 이상 |
| Broken request, sideways overflow | | 어떤 것이든 |

크기는 KiB(1024 bytes)다. 2.2x 규칙은 2x 화면을 이미 포함한다. 확대되어 쓰이는 사진(자연 크기가 표시 크기의 0.75배 미만)은 WARN이다. "Never mounted"는 진입 파일(`effect.js`, `object.js`, `component.js`, ui `fragment.js`)만 센다. `photo-kit` 같은 공유 helper는 세지 않는다. Object에는 마커가 없으므로, 로드된 object 모듈 수가 그려진 canvas나 fallback 호스트 수보다 많은지로 판단한다.

## Every visual renders

Visual이 자기 ground만 보여 준다면(빈 canvas, 로드되지 않은 사진, 발동하지 않은 reveal, 반쯤 그려진 그림) 모든 너비에서 결함이다(house rule 2). 모든 그림 슬롯은 실제 `src`, `width`, `height`를 가져야 한다. `consistency.mjs`의 `empty-visual`과 `gl-fallback`이 나머지를 찾는다. system.js는 실패한 visual을 빨간색으로 윤곽선 처리하며, `shoot.mjs`는 아직 로딩 중인 그림을 이름으로 알린다.

## Usual fixes

- **WebGL cost (tech only; 0 contexts on kind other).** 페이지당 live context는 최대 4개다(house rule). 하나의 effect나 큰 장면, 그리고 배분된 moment의 자체 canvas를 합한 수다. 각각 먼저 poster를 보여 준다. 로드 시 마운트하거나, 해당 섹션이 화면에 가까워질 때 지연 마운트한다(IntersectionObserver는 마운트만 하며, 보이는 움직임을 시작하거나 멈추지 않는다. `motion.md`). CSS px당 샘플은 하나 이하로 한다(크면 0.75). 약 1.5메가픽셀, 픽셀 비율은 최대 1.5다. 노이즈, 파티클, ray marching은 절반 해상도와 30fps 이하로 한다. 프레임이 21~24ms를 넘으면 픽셀 비율을 낮춘다. 모든 WebGL 파트는 shader가 실패하면 still을 유지한다(`effects-usage.md`). shader를 바꾼 뒤에는 `assets/objects/_print-core`와 `_scenes`에서 `lint-glsl.mjs`가 종료 코드 0이어야 한다.
- **Draw still grounds once.** 움직이지 않는 ground는 한 프레임을 그리고, 그림으로 보관하며, context를 해제한다.
- **Fonts.** 서체 파일은 최대 네 개다(`layout-v4.md` 5절. perf.mjs는 넷을 넘으면 경고한다). 일반 굵기와 display 굵기를 preload하고, `font-display: swap`을 쓰며, 실제 쓰는 굵기만 요청한다.
- **Size images.** AVIF나 WebP를 `srcset`으로 쓰되 표시 너비의 2x까지만 쓴다(1440에서 풀 bleed hero는 2880w, 390에서는 780w). Hero는 400 KiB 미만이며, 다른 모든 사진은 250 KiB 미만이다(검사는 한 이미지가 350을 넘으면 경고한다). 1440에서 페이지의 모든 이미지는 2,400 KiB 미만이다(표의 FAIL 기준. 1,200을 넘으면 경고한다). 모든 이미지에 `width`와 `height`(또는 `aspect-ratio`)를 주고, 로딩 중에는 `--g-alt` 채움을 준다. 첫 화면 아래는 lazy와 `decoding="async"`로 하고, 첫 화면 안에서는 절대 lazy를 쓰지 않는다. Hero는 eager이며 `fetchpriority="high"`를 준다. 폴드 아래의 사진은 CSS 배경이 아니라 `<img>`다. 사진이 8~20장인 장소도 이렇게 하면 빠르다.
- **No shift (CLS under 0.1).** 이미지, nav, 카운터의 공간을 미리 확보한다. transform과 opacity를 애니메이션한다(색도 가능). `background-position`은 작은 텍스트 span에서만 쓴다. height, padding, 레이아웃은 절대 애니메이션하지 않는다. 페이지가 마운트하는 모듈만 import한다.
- **Scripts.** Deferred module을 쓰고, 스크롤 리스너는 쓰지 않는다(tech moment는 `motion.md`대로 스크롤을 읽는다). 움직임 핸들러 안에서 레이아웃을 읽지 않는다. 진입 gate나 loader는 없다. other kind는 animation 라이브러리와 WebGL을 로드하지 않는다. 실시간 3D 모델은 압축 후 약 2 MB에 머물며 poster를 가진다. video는 휴대폰용과 데스크톱용 파일을 따로 제공한다.
- **Ready flag.** 페이지는 첫 화면이 완성되면 `document.documentElement.dataset.ready = '1'`을 설정할 수 있다. 그러면 검사는 effect가 마운트되기를 기다리는 것을 멈춘다.
