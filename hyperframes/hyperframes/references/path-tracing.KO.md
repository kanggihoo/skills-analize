> AI 번역본. 원본: path-tracing.md. 분석 근거는 원본이다.

# Path-traced 3D

Path tracing은 실제에 가까운 부드러운 그림자, 물체 사이에서 튀는 빛, 장면의 반사를 준다. 대신 비용은 raster보다 훨씬 크다(아래 측정에서는 내보내기 시간이 75배였다). 시작점은 `path-traced-3d` 예제다(`npx hyperframes init <dir> --example path-traced-3d`). 빠른 raster 미리보기와 선택형 path-traced 내보내기가 들어 있는 Three.js 장면이다. three, three-gpu-pathtracer(WebGL), three-mesh-bvh가 고정 버전의 로컬 파일 하나로 같이 들어 있어서, 2D 프로젝트는 트레이서를 로드하지 않는다. `assets/scene.js`를 편집하고, `assets/render.js`에 아래 계약이 있다.

## Raster 또는 path

| 변수                           | 용도                                                                                  | 비용                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `renderer: "raster"` (기본값)  | 미리보기, 초안, 타이밍, Studio 미리보기                                               | 프레임당 밀리초                                                |
| `renderer: "path"`             | 최종 내보내기. 튕겨 나오는 빛, 부드러운 그림자, 상호 반사가 핵심일 때                 | 매 프레임마다 `samples` 패스를 `bounces`만큼 튕기며 추적       |

raster로 미리 보고, 내보내기는 한 번만 한다: `npx hyperframes render --variables '{"renderer":"path","samples":64}'`. Apple M4 Max와 하드웨어 GPU에서 8 s짜리 720p 클립을 측정했다. raster는 10.8 s, path tracing은 810.5 s였다(픽셀당 32 샘플, 6 바운스). 노이즈는 샘플 수의 제곱근에 비례해 줄어든다. 그러므로 노이즈를 절반으로 줄이려면 샘플이 네 배 필요하다. 바운스가 늘어날수록 경로 하나가 길어진다. 예제 기본값은 샘플 64, 바운스 4다.

하드웨어 GPU가 없으면 Chrome은 WebGL을 소프트웨어로 그린다. SwiftShader에서는 트레이서의 첫 셰이더 실행만으로 320×180에서 약 1분이 걸렸다. 기본 준비 대기 시간 45 s보다 길다. 그런 환경에서는 path 모드를 몇 백 px 너비, 샘플 1~2개로 테스트하고, 대기 시간을 늘린다. `check`와 `snapshot`에는 `--timeout 170000`, `render`에는 `--player-ready-timeout 180000`을 준다. 준비가 시간 초과되면 "Composition has zero duration"이라고 보고될 수 있다.

## 계약

- 준비 과정은 `window.__hf.buildReady["<key>"]` promise 하나다. 장면을 만들고, `await renderer.compileAsync(scene, camera)`를 호출하고, 트레이서를 만든 다음, 버리는 프레임을 한 번 그리고 픽셀 하나를 읽어 온다. 렌더러가 처음 그리는 프레임은 나중 프레임과 다르다. 픽셀 읽기로 GPU가 가장 느린 첫 실행을 준비 단계 안에서 끝내게 한다. `gl.finish()`는 소프트웨어 GPU에서 작업이 끝나기 전에 돌아올 수 있으므로 쓰지 않는다.
- 그리기는 `hf-seek` 리스너 안에서만 하고, 작업은 동기적으로 등록한다: `e.detail.waitUntil(promise)`. 각 seek는 이전 seek 뒤에 줄을 세운다. 루프를 시작하지 않는다(`renderer.setAnimationLoop`, `requestAnimationFrame` 루프 모두 안 된다).
- 화면에 보이는 모든 것은 `e.detail.time`의 함수다. 새 시간마다 `tracer.setScene`을 호출하고(물체가 움직였을 때), 0부터 정확히 `samples` 패스만큼 누적한다. 캔버스에 이미 있는 시간으로 다시 seek하면 아무 작업도 하지 않는다. 샘플링은 경과 시간이나 트레이서 자체의 "완료" 상태가 아니라 패스 수로 진행한다.
- `tracer.renderDelay = 0`, `fadeDuration = 0`, `minSamples = 1`, `dynamicLowRes = false`, `rasterizeScene = false`, `stableNoise = true`로 설정한다. 트레이서는 지연과 페이드를 `THREE.Clock`으로 재는데, 렌더 중에는 이 시계가 움직이지 않는다.
- 장면을 만들고 트레이서를 만드는 동안 `Math.random`에 시드를 주고, 끝나면 원래대로 되돌린다. 나중에 만들어지는 것(준비 중에 불러오는 모델 등)도 같은 시드 아래에서 만든다. Three의 object uuid가 이 시드에서 나오고, 그 uuid가 트레이서가 조명, 메시, 텍스처를 정렬하는 순서를 정한다. 트레이서의 노이즈 텍스처도 이 시드로 만든다. 시드가 없으면 페이지를 로드할 때마다(렌더 워커마다) 노이즈가 달라지고, 한 워커의 프레임이 다음 워커와 만나는 곳에서 튄다. 로컬 렌더는 `Math.random`을 그대로 두며, 분산 렌더에서만 시드를 준다.
- 시간에 따라 조명과 재질 기능의 집합을 고정한다. 트레이서의 셰이더를 바꾸는 변경은 seek 중에 컴파일을 시작시킨다.

## 얼어붙은 시계

렌더 중에는 `Date.now()`와 `performance.now()`가 현재 seek 시간을 돌려주며, seek 사이에는 움직이지 않는다(첫 seek 전에는 0). `requestAnimationFrame` 콜백은 seek가 올 때까지 기다리고, 첫 seek는 모든 `buildReady` promise를 기다린다. 따라서 animation frame을 기다리거나 시계가 움직이기를 기다리는 준비 코드는 영원히 끝나지 않는다. Composition 코드는 자체 타이머를 쓰지 않는다. 대신 라이브러리의 준비 promise를 기다린다:

- Raster: `await renderer.compileAsync(scene, camera)`.
- three-gpu-pathtracer 0.0.24는 컴파일 상태를 `isCompiling` 플래그로만 보여 준다. 그 뒤에 있는 promise는 three의 `compileAsync`이므로, 예제는 `isCompiling`이 켜진 채로 남는 `renderSample` 뒤에 작은 헬퍼 하나를 두어 `tracer._pathTracer._compilePromise`를 기다린다. 이 헬퍼는 그리기를 언제 시작할지만 정하며, 무엇을 그릴지는 바꾸지 않는다.

`renderer.compileAsync`를 동기 `compile`로 바꿔서 멈춤을 피하지 않는다. 대기 자체를 고친다. `scheduler.yield()`로 기다리지 않는다. 그 continuation은 타이머보다 먼저 실행되므로, 컴파일이 끝날 때까지 yield하는 루프가 `compileAsync` 내부의 `setTimeout` 폴링을 굶긴다. 그러면 HyperFrames와 무관하게 페이지가 멈춘다.

## 확인하기

한 번의 실행으로 시간 4, 이전 시간 0, 다시 4를 스냅샷한다: `npx hyperframes snapshot --at 4,0,4 --no-end`. 4 s의 두 스틸은 바이트 단위로 같아야 한다. 그다음 짧은 클립을 렌더하고, 종료 코드만 보지 말고 프레임 자체를 본다. 예제의 `source/verify-render.mjs`(HyperFrames 저장소에 있음)는 raster와 path 모드 둘 다에서 이 두 가지를 확인한다. path 모드는 워커 두 개로 렌더하고, 새 페이지 로드가 같은 스틸을 그리는지 검사한다.
