> AI 번역본. 원본: runtimes.md. 분석 근거는 원본이다.

# 애니메이션 런타임

HyperFrames는 프레임마다 독립적으로 seek한다. 따라서 모션은 이전 프레임이 아니라 시간의 함수여야 한다. GSAP 전체 레퍼런스: `npx hyperframes docs gsap`.

## 문제가 되는 GSAP 사실

- 타임라인은 마지막에 등록한다. `document.fonts.ready.then(…)`이나 다른 비동기 콜백 안에서 만드는 것은 괜찮다. 단, 그 콜백의 끝에서 등록해야 한다. 먼저 등록하면 빈 화면으로 렌더된다(`gsap_timeline_registered_before_async_build`).
- 트윈은 절대 초 단위로 놓는다(`tl.to(el, {…}, 2.4)`). 시작 상태는 CSS가 아니라 트윈(`fromTo`)에서 설정한다.
- 트윈을 만들기 전에 레이아웃을 한 번만 잰다. `onUpdate` 안에서는 재지 않는다.
- 반복은 유한하게만 쓴다: `repeat: Math.max(0, Math.floor(duration / cycle) - 1)`.
- 무작위성은 작은 PRNG(mulberry32)로 시드를 준다.
- 장면의 타임라인은 자기 파일 밖의 요소에 닿을 수 없다. 두 타임라인이 같은 요소의 같은 속성을 애니메이션하면 안 된다.
- `<span>`에 transform을 주려면 `display: inline-block` 또는 `block`이 필요하다.
- 너비에 맞춰야 하는 텍스트는 `window.__hyperframes.fitTextFontSize(text, { fontFamily, fontWeight, maxWidth })`가 `{ fontSize }`를 돌려준다. `window.__hyperframes.pretext`는 리플로 없이 텍스트를 잰다.

## 그 밖의 런타임

| 런타임                       | 용도                              | HyperFrames가 구동하는 방식                                                                      |
| ---------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| CSS `@keyframes`             | 단순한 루프와 장식                | 자동으로 찾는다. 유한한 iteration, `animation-fill-mode: both`, 요소에 `data-start`              |
| WAAPI                        | 네이티브 키프레임                 | `element.animate(…, { fill: "both" })` 후 `pause()`. 시간은 문서 시간이므로 `delay`를 쓴다        |
| Lottie / dotLottie           | After Effects 내보내기, 캐릭터    | `autoplay: false`, `loop`은 항상 설정, 인스턴스를 `window.__hfLottie`에 push                     |
| anime.js v4                  | 기존 anime 코드                   | `autoplay: false`, `window.__hfAnime`에 push, `anime.createSeededRandom`                         |
| Three.js, WebGPU, p5, canvas | 3D와 생성형                       | `hf-seek` 리스너에서 `e.detail.time`으로 그린다. 루트에 `data-duration`을 설정한다               |

차트와 지도 오버레이는 라이브러리 자체의 전환이 아니라 GSAP 트윈의 `onUpdate`로 구동한다. 실제 장소는 그리는 것이 아니라 구운 이미지로 보여 준다(`film.md`의 "Maps and real places"). 무거운 준비 작업(큰 메시, 셰이더 컴파일)은 `window.__hf.buildReady["<key>"]` promise를 등록한다. 준비 과정은 `renderer.compileAsync(...)` 같은 라이브러리 promise를 기다리며, `requestAnimationFrame`, 시계, 자체 타이머, `scheduler.yield()`로 기다리지 않는다(`path-tracing.md`).

## dotLottie 브라우저 설정

같은 고정 버전 `@lottiefiles/dotlottie-web` 릴리스(예: 0.81.0)에서 `dist/index.js`와 `dist/dotlottie-player.wasm`을 프로젝트의 `lib/dotlottie-web/` 디렉터리에 복사한다. 이 패키지의 CommonJS 진입점은 클래식 브라우저 스크립트로 실행되지 않는다. ESM 진입점을 import하고, 플레이어를 만들기 전에 로컬 WASM URL을 설정한다. 그래야 렌더링이 SDK, WASM, 애니메이션을 모두 프로젝트 파일에서 읽는다.

```html
<canvas id="anim" style="width:100%;height:100%"></canvas>
<script type="module">
  import { DotLottie } from "./lib/dotlottie-web/index.js";

  DotLottie.setWasmUrl(new URL("./lib/dotlottie-web/dotlottie-player.wasm", import.meta.url).href);
  const player = new DotLottie({
    canvas: document.getElementById("anim"),
    src: "assets/hello.lottie",
    autoplay: false,
    loop: false,
    renderConfig: { autoResize: false, freezeOnOffscreen: false },
  });
  window.__hfLottie = window.__hfLottie || [];
  window.__hfLottie.push(player);
</script>
```

## Seek 프로토콜

```html
<script>
  function renderAt(t) {
    /* t초 시점의 프레임을, t로부터만 얻은 상태로 그린다 */
  }
  window.addEventListener("hf-seek", (e) => {
    renderAt(e.detail.time);
    // 비동기 작업(GPU 제출, 이미지 디코딩): e.detail.waitUntil(promise)를 동기적으로 호출한다
  });
  renderAt(0);
</script>
```

`requestAnimationFrame` 루프나 타이머를 시계로 쓰지 않는다.
