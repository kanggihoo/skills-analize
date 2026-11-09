# Scene objects (`assets/objects/<id>`, runtime in `_scenes`)

print effect를 거친 실제 대상이며, 포인터 아래에서 움직인다. 이 중 네 개는 고객 자신의 사진(`src`)을 쓰고, 하나는 코드로 만든 일반적인 물건을 그린다. 각 scene은 카드 하나 또는 hero frame 하나의 그림이다. 정지 상태에서는 거의 움직이지 않으며, 포인터에만 반응하고, 스크롤에는 반응하지 않는다.

| id | 보여 주는 것 | 스스로 움직이는가 | hover / touch |
|---|---|---|---|
| `split-reveal` | 사진 한 장. 절반은 halftone으로 인쇄되고, 그 사이에 선이 있다 | 아니요 | 선이 포인터를 따라간다. 터치에서는 드래그. 키보드용 슬라이더 |
| `dither-sequence` | 함께 속한 사진 2장에서 6장. dither 처리되어 하나에서 다음으로 잘려 바뀐다 | 예: 멈춘 뒤 전환(일시정지 원판) | 포인터로 프레임을 훑는다. 터치에서는 드래그 |
| `dot-object` | 사진에서 오려 내어 점으로 찍은 물건 하나 | 아니요 | 포인터 아래에서는 점들이 사진의 실제 색을 띤다(돋보기처럼) |
| `exploded-layers` | 사진 한 장(최대 네 장)을 원근감 있는 인쇄 시트 네 장으로 | 아니요 | 포인터에 따라 시트가 벌어진다. `names`가 있으면 각 시트에 라벨이 붙는다. 터치에서는 탭 |
| `product-turntable` | 일반적인 카메라, 의자, 스피커, 컵을 회전판에 올려 dither 처리 | 예: 1.7초마다 한 단계(일시정지 원판) | 움직이면 한 단계씩 돈다. 터치에서는 드래그 |

`index.json`에 목록이 있다. 각 폴더의 `meta.json`에는 모든 param(그리고 `for`, `never`)이 있으며, `demo.html`(디스크에서가 아니라 서버를 통해 제공)은 객체를 hero 하나와 카드 두 개에 보여 주고 palette 전환을 제공한다.

## Where they go: software pages only

**scene은 print(halftone, dither, dots)이며, print는 소프트웨어, 테크, AI, 개발자 도구, 게임 페이지에만 속한다.** 페이지에서 그 한 순간으로 쓰며, hero frame이나 feature card 하나에만 쓴다. 원칙은 다음과 같다. effect는 테크나 게임 사이트에 맞고, 동네 카페에는 맞지 않는다.

- **장소, 서비스, 지역 업체 페이지**(카페, 바, 상점, 호텔, 병원, 방문하는 스튜디오 등): scene을 쓰지 않는다. 이런 곳의 사진은 halftone, dither, dots로 인쇄하지 않고 평범하게 보여 준다(`references/photos.md`).
- **제품 페이지**(자전거, 가구, 조명, 기기 제조사): scene을 쓰지 않는다. 제품 자체의 사진은 평범하게 보여 준다. 사진이 없으면 객체 render를 쓴다(`assets/objects/print-*`, `_print-core/README.md`). scene을 쓰거나 전혀 다른 물건의 자료 사진을 쓰지 않는다.
- **소프트웨어 페이지**에서 scene은 소프트웨어가 다루거나 함께 쓰는 실제 대상을 보여 준다.
  - `split-reveal`, `exploded-layers`: 사진 편집이나 디자인, 인쇄 도구가 다루는 사진, 테크 기업이 만드는 기기, 게임의 key art.
    `exploded-layers`는 고객의 언어로 된 `names`(소프트웨어가 다루는 레이어)가 있을 때만 라벨을 붙인다. `names`가 없으면 라벨 없이 열리며, 시트를 기법 이름(halftone, dither)으로 부르지 않는다.
  - `dither-sequence`: 함께 속한 사진 2장에서 6장(여러 측면에서 본 기기, 소프트웨어가 만드는 결과의 단계, 게임의 장면). 무작위 사진이나 분위기만 맞춘 사진 묶음은 쓰지 않는다.
  - `dot-object`: 단색의 이음새 없는 배경(물건보다 밝거나 어둡거나, 다른 색) 위에서 촬영한 물건, 또는 투명 배경의 오려낸 PNG 물건에만 쓴다. 복잡하거나 햇빛이 드는 배경은 오려지지 않는다. 그럴 때는 `split-reveal`을 쓴다.
  - `product-turntable`은 고객의 제품이 아니라 일반적인 물건을 그린다. 소프트웨어가 다루는 종류의 물건을 보여 주는 카드에 쓴다(렌탈 플랫폼의 카메라 재고, 가구 마켓플레이스의 의자, 오디오 앱이 제어하는 스피커).
- 한 화면에 scene은 하나, 페이지 전체에서도 최대 둘이다. 페이지의 다른 WebGL도 이 수에 포함한다.
- scene 아래에 그것을 설명하거나 사과하는 캡션을 달지 않는다("made in code", "a print of", "a stand-in" 등). 카드의 제목과 본문이 그 대상이 무엇인지 말해야 한다.
- 데모 사진은 테스트용 그림이다. 고객의 사진으로 배포하지 않는다.

## Put one on a page

```html
<article class="card">
  <h3>Every edit on its own layer</h3>
  <p>Turn any adjustment off later without touching the rest.</p>
  <div class="panel">
    <div data-scene="exploded-layers" data-scene-src="assets/img/sample-edit.jpg"
         data-scene-params='{"names":["Photo","Colour","Shade","Masks"]}'
         aria-label="A portrait taken apart into its four edit layers"></div>
  </div>
</article>
<!-- once, after system.js -->
<script type="module" src="assets/objects/_scenes/auto.js"></script>
```

scene마다 하나씩, `src`와 문구를 복사해서 바꾼다.

```html
<div data-scene="split-reveal" data-scene-src='{"src":"assets/img/raw-scan.jpg","alt":"A scanned print, half of it screened","focus":[0.5,0.4]}' data-scene-params='{"split":0.6}'></div>
<div data-scene="dither-sequence" data-scene-src='[{"src":"assets/img/a.jpg","alt":"Front"},{"src":"assets/img/b.jpg","alt":"Side"},{"src":"assets/img/c.jpg","alt":"Back"}]'></div>
<div data-scene="dot-object" data-scene-src="assets/img/sensor-on-white.jpg" aria-label="The sensor the app reads"></div>
<div data-scene="exploded-layers" data-scene-src="assets/img/map-tile.png" data-scene-params='{"names":["Imagery","Roads","Labels","Terrain"]}'></div>
<div data-scene="product-turntable" data-scene-params='{"form":"chair"}' aria-label="A side chair from the catalogue"></div>
```

- host는 빈 `div`다. `.panel`, `.panel__screen`, `.frame` 안에서는 그 상자를 채운다(상자에 크기를 주어야 한다: 종횡비나 높이). 그 밖에서는 직접 크기를 준다.
- `data-scene-src`: 페이지 기준 상대 경로나 URL, 또는 JSON `{ src, alt, focus: [x, y], by, page, licence, licenceUrl }`(배열도 가능). 사진은 사이트 자체에서 제공한다. CORS 헤더를 보내지 않는 호스트의 사진은 인쇄할 수 없다(평범한 사진이 대신 보인다).
- `data-scene-params`: JSON이며 `meta.json`의 모든 param을 쓸 수 있다. `data-scene-palette`: JSON `{ bg, ink, muted, accent }`. `aria-label`: 그림이 보여 주는 내용(없으면 사진의 alt를 쓴다).
- **색**: palette를 주지 않으면 scene은 자신이 놓인 상자의 ground에서 페이지 토큰(`--bg`, `--surface`, `--ink`, `--muted`, `--accent`)으로 인쇄한다(`--surface` 위의 `.panel`은 `--surface`에 인쇄하고, 어두운 band에서는 밝은 잉크로 인쇄한다). scene은 자신의 ground를 직접 그린다. 평범한 패널에 넣고, 배정된 effect ground 위에 두지 않는다.
- **섹션당 움직이는 scene은 하나**: 섹션(또는 `[data-scene-group]`) 안에서는 `product-turntable`이나 `dither-sequence` 중 첫 번째만 스스로 움직인다(또는 `data-scene-loop`를 단 것). 나머지는 포인터가 닿을 때까지 정지해 있다. 움직이는 scene은 상자의 오른쪽 아래 모서리에 32px의 공용 일시정지 원판(`.loop-pause`)을 둔다. 그 모서리는 비워 둔다.
- 텍스트는 패널 위나 옆에 둔다. scene 위에 두지 않는다. effect를 설명하는 캡션이나 chip은 두지 않는다. 사진의 출처 표기는 페이지의 출처 줄 하나에 넣는다.
- **출처 표기**: `import { credits } from 'assets/objects/_scenes/kit.js'`를 쓴다. `credits([entry, ...])`는 scene이 인쇄한 모든 사진에 대해 footer의 작은 글씨 한 줄을 반환한다. 각 사진은 한 번씩만 이름이 나온다("Photographs: A on Unsplash, adapted; B, CC BY-SA 4.0, via Wikimedia Commons, adapted."). 사진 아래에 출처를 달지 않으며, 사진마다 한 줄씩 달지도 않는다. 고객 자신의 사진에는 출처가 필요 없다.
- **스크립트**: `import obj from 'assets/objects/split-reveal/object.js'; const ctrl = obj.mount(el, { src, params, palette })`. 컨트롤러에는 `pause()`, `resume()`, `setPalette(p | null)`, `destroy()`, `ready`(사진이 모두 준비되면 resolve되는 promise)가 있다. `auto.js`는 요소에서 컨트롤러로 가는 Map인 `scenes`를 내보낸다. 테마를 바꾼 뒤에는 각 컨트롤러에 `setPalette(null)`을 호출한다.

## Behaviour

- **정지 상태**: `split-reveal`, `dot-object`, `exploded-layers`는 한 번 그리고, 포인터가 움직일 때만 다시 그린다. `product-turntable`과 `dither-sequence`는 단계를 밟거나 전환할 때만 그린다(초당 최대 30프레임). 멈춰 있는 동안에는 아무것도 그리지 않는다.
- **스크롤에 반응하지 않는다**: 화면에 들어올 때 애니메이션하지 않는다. 완성된 상태로 그려진다.
- **Reduced motion**: 정지 프레임 하나만 보여 준다. 일시정지 원판은 없다. 포인터는 여전히 선, 프레임, 돋보기, 회전판을 즉시 움직인다.
- **WebGL 없음, shader 실패, 사진 실패**: 평범한 사진(focus 기준으로 cover 자르기)이 패널을 채우고 오버레이는 사라진다. 회전판은 그 형태의 정지 그림을 보여 준다(`fallback-<form>-light|dark.png`, `make-fallbacks.html`이 만든다). sequence는 실패한 사진을 반복에서 뺀다. 패널이 비어 있는 일은 없다. shader가 GLSL ES 1.00 또는 3.00 규칙을 어기거나(`kit.js`의 `glslLint`가 컴파일 전에 모든 shader를 검사한다), 컴파일이나 link에 실패하거나, 프레임에서 예외가 나거나, 첫 프레임이 단색으로 나오면 정지 그림이 대신 들어간다. 사진 자체를 아예 불러올 수 없는 경우(호스트가 다운되었거나 차단됨)에만 패널의 ground가 그대로 남는다. 이때 호스트에는 `data-scene-empty`가 붙고 콘솔에는 오류가 찍힌다. 사진은 사이트 자체에서 제공한다.
- **Shader**: 테스트용 Chrome은 WebGL을 CPU(SwiftShader)에서 그린다. 그래서 노트북 GPU가 거부하는 단어를 컴파일해 버린다(구조체 필드 이름이 `flat`이었던 탓에 hero가 빈 채로 나온 사례가 있다). shader를 바꾼 뒤에는 `node assets/objects/_scenes/lint-glsl.mjs`를 실행한다. 이 스크립트는 모든 scene shader를 컴파일된 상태 그대로 검사하며, 예약어, 이름이나 필드로 쓰인 키워드와 타입, 이중 밑줄, 알 수 없는 `gl_` 이름, 내장 함수를 가리는 이름이 있으면 종료 코드 1로 끝낸다.

## Light on a laptop GPU

- scene마다 canvas 하나와 WebGL context 하나를 가진다. 화면 밖이거나 탭이 숨겨져 있으면 일시정지하며, 화면을 벗어난 뒤 1.5초가 지나면 해제한다. 다시 돌아오면 새로 만든다.
- scene context는 동시에 최대 2개까지 살아 있다(`kit.js`의 `config.live`, 엄격한 상한). 화면 밖의 것이 먼저 context를 내놓고, 그다음 유휴 상태의 것, 그다음 정지 상태의 것 순서로 내놓는다(정지 상태의 scene은 마지막 프레임을 그림으로 보관한다). 페이지의 ground와 다른 effect도 함께 세어서, 페이지 전체의 live context를 4개로 유지한다.
- 부드러운 canvas는 CSS 픽셀당 최대 1 canvas 픽셀로 그리며(1 메가픽셀을 넘는 frame의 layer는 0.75), 1.5 메가픽셀을 넘기지 않는다. dither된 canvas는 dither 셀당 canvas 픽셀 하나를 쓴다. MSAA는 쓰지 않는다. 점과 레이어는 정적 버퍼에서 그리며, 프레임마다 CPU에서 계산하는 것은 없다.
