# Product render (`assets/objects/product-render`)

짧은 JSON spec으로 구성한 **임의의 실제 제품**의 스튜디오 렌더다. spec에는 부품 목록이 있으며, 각 부품의 크기와 위치는 제품 자체의 단위로 적는다. `build.js`는 spec을 모델로 바꾸고, `_print-core/print3d.js`가 그것을 렌더한다. 실제 재질(칠한 금속, 합금, 크롬, 고무, 나무, 천, 가죽, 플라스틱, 빛), 부드러운 스튜디오 조명과 부드러운 그림자, 광택 부품의 소프트박스 반사, 바닥 그림자, 그리고 요청한 부품에 적용되는 페이지 accent를 포함한다. 객체는 회전판처럼 천천히 돌거나 가만히 있는다. 조명은 클릭하면 켜지고 꺼지며, 로봇의 관절은 움직인다.

**사진이 없는 제품**에 쓴다. render가 그 제품의 그림이 되어 hero와 statement에 놓인다. 사진이 있는 제품, 장소 페이지, 캡션을 단 자리, 다른 종류의 제품에는 쓰지 않는다. 페이지에 product render는 하나만 쓴다.

## Mount: the product at anchor scale

```html
<div class="frame" id="bike" data-product="assets/objects/product-render/specs/my-bike.json"
     data-product-place="stage" data-product-view="side" data-product-color="blue"></div>
<script type="module" src="assets/objects/product-render/auto.js"></script>
```

frame이 곧 그림이다. 제품의 경계가 frame의 일정 비율을 채우며(더 빡빡한 쪽, 너비 또는 높이 기준), 제품은 페이지의 ground 위에 바닥 그림자와 함께 서고 주변은 투명하다. **패널도, 회색 상자도 없다**. frame에 크기를 준다(화면 높이만큼 큰 hero 열, 전체 너비 stage, tile). 제품이 그 크기를 채운다.

| attribute | |
|---|---|
| `data-product-place` | `hero` 0.88, `stage` 0.86, `tile` 0.84, `card` 0.9(frame 기준 비율). `legacy`는 단어 오른쪽의 예전 회전판 방식이다 |
| `data-product-view` | `three-quarter`(기본값), 그 밖에는 spec의 `supports`에 나열된 뷰만 가능(`side`, `front`, `top`, 또는 `detail-saddle`처럼 자체 close-up). `product.views`에 목록이 있다. 그 밖의 값(자전거의 `top` 등)은 오류를 던지며 frame에 `data-product-error`가 붙는다. `detail:<part name>`도 가능 |
| `data-product-scene` | spec의 장면. 제품을 싣거나 쓰는 모습(`loaded`, `desk`, `work`) |
| `data-product-color` | spec의 색상 조합 id(`spec.colors`). 기본값은 첫 번째 |
| `data-product-mode` | `auto`(기본값): 만들어 둔 정지 poster가 있으면 그것, 없으면 회전, 그도 없으면 여기서 한 프레임 렌더. `image`, `still`, `live`는 강제로 하나를 쓴다 |
| `data-product-fill` | 0.3에서 1.2. 자리의 비율에 곱해진다 |
| `data-product-params` | `{"turn":1}`은 실시간 회전을 요청한다. `{"x":0.1,"y":-0.05}`는 위치를 옮긴다. `{"step":0}`은 조명을 끈다 |
| `data-product-palette` | `{ bg, surface, ink, accent }`. 없으면 페이지 토큰 `--bg`, `--ink`, `--accent`를 쓴다 |

**섹션마다 다른 뷰.** 제품 페이지는 제품을 크게, 전체가 보이도록 최대 세 섹션에 보여 준다. 같은 뷰를 두 번 쓰지 않는다. hero에는 가장 넓은 뷰를 쓴다(자전거는 `side`, 조명이나 팔은 `three-quarter`). 다른 섹션에는 spec이 정의한 다른 각도를 쓴다. 섹션이 설명하는 부품에는 close-up을 쓴다. 문구가 약속하는 것을 실을 때는 장면이 실린 모습을 쓴다. 헤드라인에 있는 약속은 모두 그림으로 보여 준다(아이 의자와 안전벨트, 상자들, 조명이 책상에 비추는 빛).

**close-up**(`detail-*`, `detail:<part>`)은 지정된 부품들을 프레임에 담아 가운데에 둔다(manifest의 `focus`인 그 부품들의 상자가 자리 비율을 채운다). 나머지 제품은 frame의 가장자리 밖으로 뻗어 나가며, frame이 그것을 잘라낸다. close-up 안에서 부품을 가로지르며 칼로 자른 듯한 절단은 일어나지 않는다. 넓은 tile에서도 그렇게 보이도록, close-up 촬영은 충분히 넓게 만든다(`cover`, 기본값 2: 너비가 높이의 최대 두 배, 세로는 1 : 1.25). 제품은 부품을 지나 가능한 만큼 이어진다. 정지 그림은 부품들의 중심을 기준으로 고르게 잘리며, 제품 자체의 상자 기준으로 자르지 않는다.

**주문 카드의 색상 선택.** 견본 버튼이 지정된 frame을 조작한다. 스크립트가 필요 없다.

```html
<button type="button" data-product-swatch="#bike, #bike-loaded" value="red" aria-pressed="false">Signal red</button>
<input type="radio" name="colour" value="red" data-product-swatch="#bike">
```

클릭(버튼은 `aria-pressed`가 유지되며 그룹에서 하나만 눌린다) 또는 변경(input)되면, 지정된 frame(기본값: spec에 그 색상 조합이 있는 모든 frame)이 `data-product-color`를 설정하고 그 색의 정지 그림으로 바뀐다. mount된 frame의 `data-product-color`, `-view`, `-scene`을 설정해도 같은 동작을 한다. 이벤트로도 가능하다. `el.dispatchEvent(new CustomEvent('product:set', { detail: { color: 'red', view: 'side' } }))`, 또는 `document`에 보내고 `detail.target`에 선택자를 넣는다.

**frame이 알려 주는 상태**(검사와 테스트용): `data-product-mode`, `data-product-state`(`image` | `still` | `live` | `poster`), `data-product-view`, `data-product-color-shown`. 그림은 `img.product-render__img`이다. `window.__tpProduct` = `{ stills, images, live, freed }`. `image` 모드의 페이지에는 canvas와 WebGL context가 없다. `still`은 한 번 렌더하고, `<img>`를 보관하고, context를 해제하며, canvas를 제거한다. `live`만 context를 유지하며(`window.__tpGl`에 포함), 이것이 페이지의 context로 집계된다. 제품 페이지는 정지 그림을 쓴다(make-posters를 실행한 뒤 기본값). `still`은 측정된다(불투명 픽셀과 close-up의 부품). 같은 레이아웃 규칙으로 poster 정지 그림처럼 배치되므로, 자리의 비율을 정확히 채우고(tile .84) 가운데에 놓인다.

스크립트: `import { loadProduct } from '.../product-render/build.js'; const p = await loadProduct(url); const ctrl = p.mount(el, { place: 'stage', view: 'side', scene, color, mode });`. 컨트롤러에는 `setColor(id)`, `setView(v)`, `setScene(s)`, `ready()`, `pause()`, `resume()`, `step(on)`, `set(params)`, `setPalette(p | null)`, `destroy()`가 있다. `auto.js`는 `products`(frame에서 컨트롤러로)와 `ready`를 내보낸다. 이 파일 옆의 `views.html`이 작업 예시다(모든 뷰, spec별 장면, 색상 전환 두 개, `still` mount 하나).

## Stills and posters: run this after every change to a spec

```
node assets/objects/product-render/make-posters.mjs path/to/spec.json --profile <own chrome dir> [--port 5905]
     [--variants side,detail-saddle,three-quarter+loaded] [--grounds light,dark] [--px 1100] [--timeout 9] [--quiet] [--legacy]
node assets/objects/product-render/make-posters.mjs --check path/to/spec.json      (spec, views, scenes and shaders only)
```

이 명령은 spec을 검사한다(없는 부품, 소품, 재질, 뷰나 장면이 가리키는 없는 부품, 과도한 부품 수, 노트북 GPU가 거부하는 shader 단어). 그다음 헤드리스 소프트웨어 렌더링 Chrome(자체 profile을 쓰며 자신의 PID로 종료한다. 포트 3000은 쓰지 않는다)에서 `spec.make.variants`(`view` 또는 `view+scene`)의 모든 변형을 `spec.make.grounds`의 모든 ground에 대해 렌더하고, spec 옆에 결과를 쓴다. 결과물은 `stills/<id>-<variant>-<colour>[-dark].webp`와 `-half.webp`(색상 조합마다 정지 그림 하나. 투명하며 제품과 그림자에 맞춰 잘림), `<id>-<variant>.fallback-render[-dark].png`(실시간 render의 poster), `<id>.stills.json`(무엇을 만들었는지, 제품과 close-up의 부품 프레임이 어디 있는지, close-up이 어느 쪽을 자르는지)이다. 색상 조합에는 렌더 비용이 들지 않는다. 각 색상마다 accent 부품에 다시 빛을 비출 뿐이다. 각 변형은 만들어지는 대로 바로 쓰인다. CPU에서는 부품 60에서 90개짜리 변형 하나에 1에서 4분이 걸린다. 그래서 `--variants`는 몇 개씩 나눠서 넘긴다. `--legacy`는 회전판의 poster 네 개도 함께 쓴다. 정지 그림이 없는 뷰는 페이지에서 한 번 스스로 렌더한 뒤(`still` 모드) context를 해제한다.

## The spec

```json
{
  "id": "city-bike", "name": "City bicycle", "label": "A city bicycle with a front basket",
  "units": "m", "angle": -34, "turn": { "mode": "sway", "amp": 22, "period": 24 },
  "materials": { "frame": { "kind": "paint", "color": "accent", "finish": "gloss" } },
  "parts": [
    { "type": "wheel", "at": [-0.53, 0.35, 0], "r": 0.35, "spokes": 36, "wall": "#c7a57a" },
    { "type": "tube", "from": [-0.07, 0.29, 0], "to": [-0.23, 0.81, 0], "r": 0.017, "mat": "frame", "blend": 0.01 }
  ]
}
```

축: **x는 앞**(제품의 정면), **y는 위**, **z는 옆**(각도 0일 때 보는 사람 쪽). 단위는 자유다. 모델은 가장 긴 변이 1 단위가 되도록 축척되고, 가장 낮은 점이 바닥에 놓인다. 제품은 실제 치수로 모델링한다. render가 제품 사진처럼 읽히게 하는 것은 대부분 비율이다.

| key | 설명 |
|---|---|
| `id`, `name`, `label` | label은 스크린 리더가 읽는 내용이다("A desk lamp, switched on") |
| `poster` | poster 파일 이름(기본값은 id) |
| `angle` | 정지 상태와 정지 그림에서의 회전각, 도 단위(기본값 -32: 세 쿼터 뷰) |
| `turn` | `{ "mode": "sway", "amp": 26, "period": 22 }`(기본값), `{ "mode": "spin", "speed": 10 }`, `{ "mode": "still" }` |
| `camera` | `{ "elev": 12 }`, 바닥에서 올라간 각도(도) |
| `click` | `"light"`: 클릭하면 `light` 재질(과 `glow`)을 모두 켜고 끈다. 처음에는 켜진 상태다 |
| `pool` | `{ "at": [x, 0, z], "r": 0.2 }`: 켜져 있을 때 바닥에 비추는 빛 |
| `materials` | 부품에 쓰는 이름 있는 재질 |
| `motion` | 움직이는 그룹(관절), 아래 참고 |
| `colors` | 색상 조합: `[{ "id": "blue", "name": "Deep blue", "accent": "#2c4f7c" }]`(accent 부품이 이 색을 쓴다. `materials`는 재질도 바꾸며, 색상마다 한 번씩 렌더한다) |
| `views` | close-up과 자체 뷰: `{ "detail-saddle": { "part": ["saddle*", "seat post"], "angle": -42, "elev": 16, "margin": 1.3, "cover": 2 } }`(`*`로 끝나는 이름은 그 글자로 시작하는 모든 부품을 가리킨다. `cover`는 그 촬영이 채우는 가장 넓은 프레임이다. 1이면 여백만 쓴다. 2에서 3 메가픽셀짜리 close-up 렌더는 CPU에서 2에서 9분이 걸린다) |
| `scenes` | 제품을 싣거나 쓰는 장면, 아래 참고 |
| `supports` | 제품이 잘 그려지는 뷰 목록: `["three-quarter", "side", "front", "detail-saddle"]`. 이 목록의 뷰만 제공되고(`product.views`), 만들어지며(이 밖의 `make.variants`는 `--check`에 실패한다), 마운트된다. 뷰는 그 정지 그림을 확인한 뒤에만 추가한다(위에서 본 자전거는 옆으로 누운 것처럼 읽히므로, 도시형 자전거는 `top`을 뺀다). `three-quarter`(기본 뷰)는 유지한다 |
| `make` | `{ "variants": ["three-quarter", "side", "detail-saddle", "three-quarter+loaded"], "grounds": ["light", "dark"], "px": 1100 }`: make-posters가 만드는 대상 |
| `parts` | 부품 목록, 아래 참고(약 90개 이하로 유지) |

### Parts

모든 부품은 `mat`(재질 이름 또는 인라인 재질), `blend`(앞에 나열된 부품과 만나는 곳의 필렛, 단위는 spec과 같다. 용접된 튜브, 주조 몸체에 쓴다), `in`(움직이는 그룹), `name`(사용자용 이름)을 받을 수 있다. 위치는 `from` + `to`(선형 부품은 두 점 사이를 잇는다. `up`은 단면의 방향을 정한다) 또는 `at` + `axis`(`"x"`, `"y"`, `"z"` 또는 벡터) 및/또는 `rot`([x, y, z] 도 단위)로 정한다.

| type | 크기 | 용도 |
|---|---|---|
| `tube` | `r`, `r2`(테이퍼), `cap` `flat`/`round`, `round`, `seams` | 프레임 튜브, 기둥, 막대, 손잡이, 테이퍼된 로봇 링크 |
| `beam` | `w`, `d`(단면), `round`, `seams` | 납작한 바, 크랭크, 레일 |
| `box` | `size` [x, y, z], `round`, `seams` | 하우징, 몸체, 페달, 그리퍼 |
| `panel` | `size`(얇음), 더 둥글게 | 판, 뚜껑, 화면의 뒷면 |
| `cylinder` / `disc` | `r`, `h`, `round`, `seams` | 받침, 허브, 모터 하우징, 캡 |
| `sphere`, `ellipsoid` | `r` / `size` | 전구, 종, 손잡이 노브 |
| `torus` | `R`, `r` | 고리, 체인링, 상태 표시등 |
| `joint` | `r`, `w`, `capMat` | 경첩. `axis`(기본값 z) 둘레의 마디이며 양면에 캡이 있다 |
| `wheel` | `r`, `tyre` [width, height], `rim` [depth, width], `hub` [r, length], `spokes`, `spokeR`, `style` `spoked`/`disc`/`solid`, `wall`(측면 색), `rimMat`, `hubMat`, `spin`(도/초) | 자전거, 유모차, 카트, 캐스터. 축은 `axis`(기본값 z)를 따른다 |
| `shade` | `from`(닫힌 끝) `to`(열린 끝), `r1`, `r2`, `t`, `bulge` 0..1, `innerMat` | 조명 갓, 종, 나팔, 스피커 콘 |
| `seat` | `size` [length, height, width], `style` `saddle`/`cushion` | 안장, 의자, 쿠션(로컬 x가 앞) |
| `basket` | `size`, `style` `wire`/`slats`/`solid`, `pitch`, `wire`, `rimMat` | 바구니, 상자, 쓰레기통, 쟁반(위가 열려 있음) |
| `arc` | `R`, `a0`, `a1`(도), `r` 또는 `size` [radial, axial] | 흙받이, 손잡이, 휜 프레임, 고리 |
| `spring` | `from`, `to`, `R`, `r`, `turns` | 스프링, 감긴 전선 |
| `path` | `points` [[x,y,z]...], `r`, `smooth`(점 3개 이상일 때 켜짐) | 핸들바, 케이블, 휜 튜브 |

`seams`: 부품 둘레에 길이를 따라 여러 높이로 절단된 패널 선(부품 반길이의 -1에서 1 범위). 로봇 외피의 이음매나 받침의 홈에 쓴다. `seamWidth`, `seamDepth`는 단위로 적는다.

### Materials

`materials`의 이름, 내장 재질 이름, 또는 `{ "kind": ..., "color": "#hex" | "accent", "finish": "gloss" | "satin" | "matte" }`를 쓴다.

| kind | | 내장 이름 |
|---|---|---|
| `paint` | 에나멜 또는 분체 도장. `color: "accent"`는 페이지 accent를 쓴다 | `accent`, `paint`, `white`, `black`, `graphite` |
| `metal` | 헤어라인 알루미늄 | `alloy`, `aluminium` |
| `chrome` | 광택 처리 | `chrome` |
| `steel` | 어두운 스테인리스(살, 와이어) | `steel` |
| `rubber` | 타이어, 패드, 그립 | `rubber` |
| `plastic` | 새틴 플라스틱 | `plastic` |
| `wood` | 결이 있는 오일 마감 나무. `grain` x/y/z, `scale` | `wood`, `oak`, `walnut` |
| `fabric` | 고운 직조. `weave` | `fabric` |
| `leather` | | `leather` |
| `light` | 빛을 낸다. `click: "light"`가 있으면 켜고 끈다 | `light` |

모든 재질은 `glow`(0..1)를 받을 수 있다. 안쪽 면을 밝힌다(조명이 켜졌을 때 갓의 안쪽).

### Motion

```json
"motion": [
  { "id": "yaw", "pivot": [0, 0.14, 0], "axis": "y", "amp": 26, "period": 13 },
  { "id": "shoulder", "parent": "yaw", "pivot": [0, 0.32, 0], "axis": "z", "amp": 9, "period": 11, "phase": 0.2 }
]
```

그룹은 `"in": "shoulder"`로 지정된 부품을 `pivot`과 `axis` 둘레로, 부모 뒤에, `rest` + `amp` x 주기 `period`초의 사인값만큼 돌린다. pivot은 정지 상태에서 spec의 단위로 적는다. 그룹은 최대 네 개다. 관절은 제품이 회전할 때만 움직인다. 정지 상태, 휴대폰, reduced motion에서는 정지 자세를 보여 준다.

### Scenes and props: the product loaded or in use

```json
"scenes": {
  "loaded": { "label": "A city bicycle with a child seat on the rack, a crate of fruit and a pannier",
    "hide": ["basket"],
    "props": [ { "prop": "child-seat", "at": [-0.578, 0.796, 0] },
               { "prop": "crate", "at": [0.6, 0.76, 0], "size": [0.3, 0.2, 0.32], "contents": "fruit" },
               { "prop": "bag", "at": [-0.62, 0.42, 0.152], "hooks": true } ] },
  "desk": { "lit": { "at": [0.53, 0.11], "r": 0.19, "k": 3.6 }, "pool": null,
    "props": [ { "prop": "desk", "at": [0.2, -0.032, 0.02] }, { "prop": "book", "at": [0.3, 0, -0.15], "count": 2 } ] }
}
```

장면은 소품(과 일반 `parts`)을 더하고, 이름으로 부품을 숨기며, `label`, `pool`, `click`, `materials`를 바꿀 수 있다. `lit`은 조명의 따뜻한 빛 웅덩이를 소품의 윗면에 비춘다. 소품은 실제 크기의 일반 부품으로 만들며, y = 0 위에 서고 x 방향을 향한다. 단위는 미터다(`scale`로 바꾼다. spec이 밀리미터라면 1000). 각 소품은 `at`, `yaw`, `scale`, `size`, `color`, `mats`(역할: 재질), `in`(움직이는 그룹. 그리퍼가 든 소포), `name`을 받는다.

| prop | 설명 | 옵션 |
|---|---|---|
| `child-seat` | 짐받이 의자. 높은 등받이, 날개, 쿠션, 어깨와 허리 벨트(빨간 버클), 발받침 | `color`. 역할: shell, pad, belt, buckle |
| `bench` | 1에서 3명의 아이나 승객을 위한 한 줄짜리 패딩 벤치(화물 상자). 벨트 두 개와 자리마다 버클 | `seats`, `width`, `color`. 역할: frame, pad, belt, buckle |
| `crate` | 나무 살이 있는 상자. 위가 열려 있다 | `size`, `contents` fruit / bottles / loaves / parcels / none |
| `bag` | 짐받이 가방(덮개, 끈, 손잡이, 짐받이용 `hooks`) 또는 `style: "tote"` | `size`, `color` |
| `parcel` | 테이프와 라벨이 붙은 판지 상자 | `size`, `color` |
| `tray` | 낮고 위가 열린 통. 소포가 서 있다 | `size`, `parcels` 0-4 |
| `desk` | 탁자 상판 | `size`, `color` |
| `book` | 1에서 3권 쌓인 책 | `count`, `colors` |
| `mug` | 커피가 담긴 머그 | `r`, `h`, `color` |
| `sheet` | 종이 한 장 | `size` |

장면은 부품 약 110개 이하로 유지한다. 소품은 페이지에 보이는 크기에서 읽혀야 한다(벨트, 버클, 상자의 살, 가방의 덮개). 장면은 문구가 약속하는 자리에 놓는다.

## Behaviour and limits

- **항상 그림을 보여 준다**: 뷰의 정지 그림(WebGL 없이)을 쓴다. 그것이 없으면 poster를 즉시 보여 주고 그 위에 render를 올린다. WebGL이 실패해도 poster는 남는다. `prefers-reduced-motion`이거나 휴대폰(max-width 700px 또는 coarse 포인터)이면 정지 프레임 하나를 선명하게 그리고 context를 해제한다. 회전하는 제품 frame의 오른쪽 아래 모서리에는 일시정지 버튼이 있다.
- **제품당 live context는 최대 하나**: 페이지가 회전을 요청했거나 정지 그림이 만들어지지 않았을 때 마운트된 첫 번째 product render만 회전한다. 두 번째는 정지해 있다. 페이지의 context 상한 4개(`window.__tpGl`)에 이것도 포함된다.
- **비용**: 모든 부품은 광선 step마다 평가된다. 가장 가까운 부품까지의 거리보다 바운딩 구가 멀면 건너뛴다. 부품 약 20개는 print 객체처럼 렌더된다. 60에서 70개(살이 있는 자전거)는 노트북 GPU에서 괜찮고, CPU 렌더러에서는 느리다(poster 약 90초). 90개 아래로 유지한다.
- **할 수 없는 것**: 제품 위의 글자나 로고, 투명한 유리, 늘어지는 천, 자유 형태의 유기적 외피(신발, 얼굴, 자동차 차체), 텍셀 하나보다 얇은 것(두껍게 처리된다). 이런 것은 고객의 사진이나 render를 쓴다. 이 방식은 쓰지 않는다.
- **절대 쓰지 않는 것**: 다른 종류의 제품, 장소 페이지, 캡션.

`specs/` 안의 세 spec(도시형 자전거, 책상 조명, 로봇 팔)은 작업 예시다. 각각 뷰, 장면, 색상 조합을 가진다. spec에 `make-posters.mjs`를 실행해 정지 그림을 만든다. 그 전까지는 각 frame이 스스로 한 번 렌더한다. `views.html`은 세 제품을 anchor 크기로 보여 주며 색상 전환을 제공한다(`?only=bike|lamp|arm`, `?mode=still|live`). `demo.html`은 회전판을 보여 준다(`?turn=0`, `?fallback=1`).
