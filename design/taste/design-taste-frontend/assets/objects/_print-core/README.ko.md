# Objects (`assets/objects/print-*`)

컵과 받침, 자전거 바퀴, 책상 조명, 책상 지구본, 트럼프 카드처럼 일상의 물건을 코드로 3D 모델링한다. 각 객체는 **render**(기본값: 자체 재질로 찍은 스튜디오 렌더, 페이지 accent를 한 부품에 적용, 부드러운 그림자와 소프트박스 반사)로 보여 주거나, 그 render의 **print**(halftone, engraving, dither 또는 type)로 보여 준다. 객체는 천천히 돌고, 포인터 쪽으로 기울며, 클릭하면 작은 동작을 한 단계 한다(조명이 켜지고, 카드가 펼쳐진다).

**어디에 쓰나**
- **사진이 없는 제품 페이지**: 제품 종류에 맞는 객체가 그 제품의 그림이 된다. hero(`hero` preset 또는 hero split의 `tile`)와 statement의 그림으로 render를 쓴다. 조명 회사에는 책상 조명, 식기 회사에는 컵, 바퀴 회사에는 바퀴를 쓴다. 다른 종류의 객체는 쓰지 않는다. 바퀴는 자전거 전체를 보여 주지 않고, 컵은 커피 머신을 보여 주지 않는다. 같은 종류의 객체가 없으면 부품 사양으로 제품 자체를 구성한다(`../product-render`의 README 참고). 제품 그림 없이 `hero-product`를 쓰지 않는다.
- **소프트웨어, 테크, 게임 페이지**: feature card나 넓은 frame에서 카드가 말하는 대상을 보여 주는 순간 하나다(지역을 설명하면 지구본, 게임 기능이면 카드). 이 자리에는 print가 어울린다.
- **장소 페이지에는 쓰지 않는다**(카페, 상점, 호텔, 방문하는 스튜디오 등). 고객 자신의 사진 옆에도 쓰지 않는다. 이런 곳은 사진을 앞세운다.
- print(halftone, engraving, dither, type)는 소프트웨어, 테크, AI, 게임 페이지에서만 쓴다. 제품 페이지는 render를 보여 준다.
- 객체 아래에 캡션을 달지 않는다. render, drawing, illustration, model, sample, stand-in 같은 단어로 설명하지 않는다. 섹션의 제목과 본문이 제품이 무엇인지 말해야 한다. `aria-label`은 그대로 두거나 평범하게 적는다("A desk lamp, switched on").

| id | render | prints | 클릭 |
|---|---|---|---|
| `print-cup` | 받침 위 도자기 커피잔. 유약은 accent색 | halftone, engraving | 커피 위로 고리 무늬가 지나간다 |
| `print-wheel` | 도로용 바퀴: 탄색 측면 타이어, 알루미늄 림, 살 24개, accent색 허브 | halftone(살은 단색 선) | 빠르게 회전한다 |
| `print-lamp` | 균형 팔 책상 조명: 계단형 밑받침, 쌍 막대, 크롬 스프링, 둥근 갓. 밑받침과 갓은 accent로 에나멜 처리 | halftone | 켜진다 |
| `print-globe` | 책상 지구본. 실제 해안선, 황동 자오선, 호두나무 받침 | engraving | 회전한다 |
| `print-cards` | 트럼프 카드. 다이아몬드 에이스는 앞면, 뒷면은 accent색 | halftone | 카드가 부채처럼 펼쳐진다 |

`index.json`에 목록이 있다. 각 폴더의 `meta.json`에는 객체별 메모가 있고, `demo.html`은 객체를 전체 화면으로 보여 주며 그림과 종이를 바꾸는 스위치가 있다.

## Put one on a page

```html
<!-- a split section's visual (references/sections-library.md): whole, standing low -->
<div class="frame frame--square">
  <div data-print="print-lamp" data-print-place="tile"></div>
</div>

<!-- a feature card: large, cut by the panel's bottom-left edge -->
<article class="card card--row">
  <h3>Regions</h3>
  <p>Pick where your data lives: 14 regions on four continents.</p>
  <div class="panel" data-fx="grain-gradient" data-fx-params='{"speed":0,"grainMotion":0}'>
    <div data-print="print-globe" data-print-params='{"effect":"engrave"}'></div>
  </div>
</article>

<!-- once, after system.js -->
<script type="module" src="assets/objects/_print-core/auto.js"></script>
```

- `auto.js`는 모든 `[data-print]`를 mount한다. host는 빈 `div`다. `.panel`, `.panel__screen`, `.frame` 안에서는 그 영역을 채우고, 패널의 ground 위에 그린다.
- **위치**(`data-print-place`, 또는 들어 있는 상자에서 자동 선택):
  - `.panel` 안의 `card`: 크게, 왼쪽 아래 모서리로 잘린다. x.ai와 Figma의 feature card처럼 보이며, 오른쪽 아래 모서리는 일시정지 버튼을 위해 비워 둔다. 가로와 세로가 비슷한 패널(휴대폰의 card)에서는 덜 잘라서 사물이 알아볼 수 있게 한다. card의 텍스트는 패널 위에 놓이며, 객체 위에 놓지 않는다.
  - `.panel--top` 또는 정사각 frame의 `tile`: 전체를 낮게 세워 보여 준다.
  - 넓은 `.frame`의 `hero`: 크게, 중앙 오른쪽에 둔다. 텍스트는 왼쪽의 빈 절반에 둔다. 가로와 세로가 비슷한 frame(휴대폰)에서는 더 작게, 텍스트 아래 낮은 위치에 둔다.
  - `none`: 자체 종이 위 가운데에 둔다.
- **옵션**: preset 위에 `data-print-params='{"angle":-20}'`를 쓴다(모든 param은 `meta.json`에 있다). print는 `data-print-params='{"effect":"halftone"}'`로 지정한다. `data-print-palette='{"bg":..,"ink":..,"accent":..}'`도 쓸 수 있다.
- **색**: 배정된 ground 위에서는 그 ground의 종이 위에 그리며, 그 종이에서 잘 읽히는 잉크와 페이지의 accent를 쓴다. 그 밖에서는 페이지 토큰(`--bg`, `--surface`, `--ink`, `--accent`)을 쓴다. accent는 한 부품에만 쓴다(유약, 허브, 갓과 밑받침, 카드 뒷면. 액센트가 파랑이나 청록이면 지구본의 바다). 해당 ground가 그려지기 전까지(한 번에 패널 하나씩 굽고, CPU 렌더러에서는 느리며, 굽기가 실패할 수도 있다) 객체는 ground의 종이를 자기 밑에 평평하게 깔고, ground가 그려지면 그 종이를 돌려준다(`data-print-paper`는 `own` 또는 `ground`). 그래서 어두운 종이용 print가 그려지지 않은 밝은 패널 위에 서는 일은 없다. `blank-ground.html`로 이를 테스트한다(`data-ready`는 `pass` 또는 `fail`).
- **그룹당 루프 하나**: 카드 묶음마다 객체 하나만 스스로 돈다(첫 번째 객체 또는 `data-print-loop`를 단 객체). 나머지는 포인터가 카드에 닿을 때까지 정지해 있다. 돌고 있는 객체는 그림을 그린 뒤 패널의 오른쪽 아래 모서리에 자체 원형 일시정지 버튼을 둔다(poster에는 두지 않는다). 그 모서리는 비워 둔다.
- **스크립트**: `import obj from '<assets>/objects/print-cup/object.js'; const ctrl = obj.mount(el, { place: 'card', params: {...}, palette: {...} })`. 컨트롤러에는 `pause()`, `resume()`, `step(on)`, `set(params)`, `setPalette(p | null)`, `destroy()`가 있다. `auto.js`는 요소에서 컨트롤러로 가는 Map인 `prints`를 내보낸다. 테마가 바뀌면 각 컨트롤러에 `setPalette(null)`을 호출한다.

## Do and don't

- 카드 묶음마다 객체는 하나만 두고, 화면에 최대 두 개까지만 둔다. 움직이는 ground 위에는 두지 않는다. ground는 가만히 있는다(`"speed":0,"grainMotion":0`). 제품 페이지에서는 단순한 조명 ground나 페이지의 surface를 쓴다.
- 객체가 그림이다. 객체 위에 UI 조각을 올리지 않고, 옆에 두 번째 effect를 두지도 않는다.
- 카드 패널의 가운데에 객체를 딱 놓고 사방이 같은 ground인 구성은 쓰지 않는다. preset을 쓴다.
- 스크롤로 움직이지 않는다. 객체는 느린 자체 회전, 포인터, 클릭에만 반응한다.
- 고객 자신의 사진과 스크린샷이 먼저다. 객체가 그 자리를 대신하지 않는다.

## It always shows a picture

- **Poster**는 즉시 보인다. 객체를 미리 그린 그림(`fallback-render.png`, print는 `fallback.png`)을 페이지 palette로 실시간 그림이 놓일 자리에 보여 준다. 실시간 그림은 그 위로 페이드인된다.
- 모든 shader 소스는 컴파일 전에 노트북 GPU가 거부하는 단어가 있는지 검사한다(`print3d.js`의 `glslProblems`: GLSL ES 예약어, `flat` 같은 한정자를 이름으로 쓰는 경우, 내장 함수 이름, 이중 밑줄). CPU 렌더링 Chrome은 이런 것 일부를 컴파일하므로, 스크린샷이 실제 GPU에서 shader가 빌드된다는 증거가 되지 않는다. 모델을 바꾼 뒤에는 `node assets/objects/_print-core/lint-glsl.mjs`를 실행한다(문제가 있으면 종료 코드 1).
- 검사를 통과하지 못한 shader, 컴파일이나 link 실패, WebGL2 없음, context 손실, 첫 프레임이 비어 나온 경우 poster가 그대로 남는다. 빈 ground가 보이는 일은 없다. 테스트는 객체가 mount되기 전에 `window.__printBreak = 'compile' | 'link' | 'reserved' | 'empty'`를 설정하거나, 데모 페이지에서 `?fallback=1`(WebGL2 없음)을 붙여 각 경우를 강제로 재현한다.

## Light on a laptop GPU

- 페이지의 모든 객체는 **WebGL context 2개**를 공유한다(`print3d.js`의 `config.maxLive`). 그래서 구운 ground와 effect 하나가 있는 페이지도 3개 안에 머문다.
- 객체는 자신의 무엇인가가 화면 근처에서 움직일 때만(회전, 포인터, 스텝) context를 점유한다. 움직이지 않는 객체는 한 번 그리고, 그 프레임을 평범한 그림으로 보관한 뒤 context를 해제한다. 포인터가 카드에 닿으면 다시 확보한다. 화면 밖(화면 크기의 40%를 넘어서)이거나 탭이 숨겨져 있으면 context를 해제한다.
- raymarch는 CSS 픽셀당 최대 1 texel로 돈다(프레임이 약 0.48 메가픽셀을 넘으면 0.75 x 0.75). dither는 셀당 1 texel로 돌고, canvas는 셀당 픽셀 하나를 가지며 선명하게 확대된다. 어떤 canvas도 약 1.5 메가픽셀을 넘지 않는다. 느린 프레임은 texel을 줄이고, 다음으로 march step을 줄이며, 그다음 회전을 멈춘다.
- 정지 상태의 render(회전하지 않는 객체, context 해제 시 보관된 프레임, reduced-motion 프레임)는 canvas 픽셀당 최대 1 texel(`config.fineTexels`, 1.2 메가텍셀)로 한 번 더 그려서, 페이지에 남는 그림이 선명하게 한다. 프레임은 한 장이며 반복하지 않는다.
- `prefers-reduced-motion`에서는 정지 프레임 하나만 그림으로 보여 주고, context는 즉시 해제한다(정지 상태에서는 아무 context도 쥐지 않는다). hover도, 일시정지 버튼도 없다. 클릭하면 즉시 그 단계를 보여 준다.

## Posters

`make-fallbacks.html`은 모든 객체의 poster를 만든다(한 객체만 보려면 `?ids=print-cup`을 연다). `fallback.png`와 `fallback-dark.png`는 print 판(빨강 잉크, 초록 accent, 파랑은 실루엣)이다. `fallback-render.png`와 `fallback-render-dark.png`는 두 배 넓이이며, 왼쪽에는 판(빨강은 바닥 그림자, 초록은 accent 부품, 파랑은 덮는 영역)이, 오른쪽에는 컬러 render가 있다. accent 부품은 중립 회색이며, 페이지 accent가 그 색을 대체한다. 그림이 palette에 따라 달라지는 객체는 추가 판(`plates`)을 두고 `poster(palette, dark, render)`로 고른다. 지구본은 파란 accent용 `-sea` poster를 가진다. 모델을 바꿀 때마다 poster를 다시 만든다.

## A new object

`<id>/object.js`에서 `definePrint({ id, name, label, press, base: import.meta.url, glsl, pivot, radius, extent, camera, turn, step, params, place, update, texture, poster, plates, posterPrint })`를 호출한다. 여기서 `glsl`은 `vec2 map(vec3 p)`(거리, 재질 id, y축 위, 바닥은 y = 0)와 `void surf(float id, vec3 p, vec3 n, inout Surf s)`를 정의한다. `surf`는 print의 톤(`albedo`, `gloss`, `wire`, `lo`, `hi`)을 정하고, `u_render > 0.5`일 때는 render의 재질(선형 색의 `col`, `metal`, `gloss`, `shine`, `accent`)을 정한다. 나머지 항목은 `print3d.js` 머리말에 있다. 실제 물건처럼 모델링한다(비율, 부품, 재질). 그래야 render가 그림이 아니라 제품 사진처럼 읽힌다. lint를 실행하고, poster를 만들고, 1440, 820, 390 폭에서 밝은 종이와 어두운 종이 양쪽으로 확인한다. 정직하게 두 번 시도한 뒤에도 싸 보이면 버린다.
