# 오브젝트와 인쇄물(`assets/objects`)

세 계열의 오브젝트 13개와 빌더 하나가 있다. 계열마다 README가 계약이며, 각 `meta.json`이 매개변수다. `assets/objects/index.html`은 오브젝트를 보여 주고, `product-render/views.html`은 빌더의 세 가지 작업 예시를 모든 뷰를 anchor 크기로 보여 준다.

| 계열 | 오브젝트 | 설명 |
|---|---|---|
| Print objects | `print-cup`, `print-wheel`, `print-lamp`, `print-globe`, `print-cards` | 코드로 모델링한 사물. studio 렌더(기본값) 또는 그 인쇄본(halftone, engraving, dither). `_print-core/README.md` |
| Photo prints | `photo-halftone`, `photo-engraving`, `photo-dither` | 셰이더로 인쇄한 실제 사진 한 장. 포인터 아래의 사진. `photo-kit/README.md` |
| Scenes | `split-reveal`, `dither-sequence`, `dot-object`, `exploded-layers`, `product-turntable` | 인쇄를 거친 사진(turntable은 일반적인 형태). 포인터 아래에서 살아 움직인다. `_scenes/README.md` |
| Product render | `product-render`(빌더. 고정된 오브젝트 없음) | JSON 사양으로 구성한 모든 실물 제품을 실제 재질의 studio 정지 그림으로 렌더한다(요청할 때만 라이브). `product-render/README.md` |

## 언제 쓰나

- **페이지당 강한 오브젝트 순간은 하나다.** 두 번째 효과 옆이나 움직이는 바탕 위에는 절대 두지 않는다.
- **장소, 서비스, kind other의 모든 페이지**(카페, 게스트하우스, 상점, 스튜디오, 병원, 제품 브랜드)에는 오브젝트, 인쇄물, 장면을 두지 않는다. 평범한 사진이 앞선다. 하우스 룰: shader 효과는 업종에 기술적 주제가 있을 때만 쓴다. 예외는 아래에 있다. 사진이 없는 실물 제품은 자기 렌더를 보여 준다.
- **사진이 있는 제품**: 사진이 앞선다.
- **사진이 없는 모든 실물 제품**(램프, 의자, 자전거, 유모차, 로봇 팔 등). kind other이든 tech이든 상관없다. **제품은 렌더해야지, 가리면 안 된다**(테스트: 화물 자전거 페이지가 자전거를 한 번도 보여 주지 않자 10점 중 3점을 받았다). 고객의 렌더나 CAD 뷰가 먼저다. 없으면 `assets/objects/product-render`가 JSON 사양의 자기 부품, 크기, 재질로 이 제품을 구성하고(아래 Product renders), 히어로를 이끈다(`deal.mjs --type product --has object`). 그다음 최대 두 섹션에 전체 모습을 더 넣되, 각각 다른 뷰로 프레임에 크게 넣고, 회색 패널에는 넣지 않는다. 사용 장면(설정이 프레임을 채우는 장면), 부품 클로즈업, 분해도가 다른 섹션을 맡는다(아래 Views, `sections.md` 섹션 1 One object, 그리고 Product의 일곱 규칙). 이것은 제품의 그림이지 효과가 아니다. 플랫 바탕이나 tech의 빛나는 바탕 위에 정지 그림으로 두며, 요청할 때만 라이브(`data-product-mode="live"`)로 하고, 라이브 context는 최대 한 개다. 인쇄하지 않으며, kind other에서는 옆에 shader 바탕이나 순간을 두지 않는다. 같은 종류의 `print-*` 오브젝트(램프 제조사의 램프)는 사양을 대신할 수 있다. 다른 종류의 오브젝트는 안 된다(바퀴는 자전거가 아니다). 그린 SVG, 헬퍼가 구성하지 않은 기본 도형 모델, 분위기 스톡, 다른 제조사의 제품도 안 된다. **하드웨어와 기기도 마찬가지다**(로봇 팔, 드론, 카메라, 센서. 테스트: 로봇 팔이 실크 셰이더로 보였고 주문 폼이 사라졌다). 사진이나 고객 렌더가 없으면 제품 렌더를 쓴다(`deal.mjs --type product --kind tech --has object`). 곡면 외피는 실제 치수에 맞춘 둥근 상자, 원기둥, 필렛으로 구성한다. 주문 폼만 든 `split` 히어로는 절대 쓰지 않으며, 그 자리에 효과를 두지 않는다.
- **그림 파일이 없는 게임**: 핵심 그림은 주인공 오브젝트의 제품 렌더(배, 크레인 바지, 메카)이거나, 자기 오브젝트로 한 바닥 위에 구성한 세계의 장면이다. `product` 무대(`deal.mjs --type software --kind gaming --has object`)에서 세계 섹션에 가장자리까지 채운다. 효과는 그 뒤에 둘 수 있지만, 그것을 대체하지는 않는다(`sections.md`, Gaming).
- **소프트웨어, AI, 그림이 있는 게임**: 자기 주제 카드 위의 인쇄 오브젝트(지역을 위한 지구본). 게임 자신의 세계 오브젝트는 `fixed-hero-object`용이다(`scenes.md`).
- **Photo prints와 photo scenes**는 사진을 인쇄한다. 페이지는 사진을 인쇄하거나 dither하거나 grade하지 않는다(`photos.md`, `effects-usage.md`). 이것들은 키트의 갤러리에만 두고, 페이지에는 두지 않는다. `product-turntable`(일반적인 형태이며 사진이 없다)은 형태가 제품 자신의 것일 때만 기술 제품의 오브젝트가 된다.

## 마운트

```html
<div class="panel"><div data-print="print-globe" data-print-place="card"
  data-print-params='{"effect":"engrave"}'></div></div>
<script type="module" src="assets/objects/_print-core/auto.js"></script>
```

(키트의 photo scenes는 같은 방식으로 `data-scene`과 `_scenes/auto.js`로 마운트한다. 갤러리 전용이다. 여기의 `data-scene`은 큰 장면이 아니다. 큰 장면은 `data-big-scene`이다. `scenes.md`를 본다.)

- **스크립트**: `<id>/object.js`에서 `obj.mount(el, opts)`를 쓴다. Print objects는 `{ place, params, palette }`를, photo prints와 scenes는 `{ src, params, palette }`를 받는다. 컨트롤러는 `pause()`, `resume()`, `setPalette()`, `destroy()`를 가진다.
- **배치**(print objects): `card`는 크게, 왼쪽 아래 모서리에서 잘리게 둔다. `tile`은 전체를 보여 주며 정사각 타일의 아래쪽에 낮게 놓는다. `hero`는 넓은 프레임의 가운데에서 오른쪽에 둔다. 가운데에 정확히 두지 않는다. Photo prints와 scenes는 자기 상자를 채우므로 종횡비를 준다.
- **팔레트**: 토큰 `--bg`, `--surface`, `--ink`, `--muted`, `--accent`를 쓰거나 그 오브젝트의 것을 쓴다. 테마를 바꾼 뒤에는 `setPalette(null)`을 호출한다(photo prints는 `setPalette(fx.readPalette(el))`). 지구본의 바다는 accent이므로, 파란색이나 청록을 준다.
- **일시정지**: 돌거나 반복되는 오브젝트는 그리기 시작하면 패널의 오른쪽 아래 모서리에 둥근 일시정지 버튼을 둔다. 그 모서리는 비워 둔다. 움직이는 것은 그룹당 하나만 둔다.
- **크레딧**: print나 scene이 보여 주는 사진은 푸터의 한 줄 크레딧에 넣는다(`photos.mjs credits --adapted`, `photo.js`의 `creditsLine()`, `kit.js`의 `credits()`). 렌더는 크레딧이 필요 없다.

## 제품 렌더

`assets/objects/product-render`는 사진이나 고객 렌더가 없는 실물의 그림이다. kind other의 제품(자전거, 램프, 의자), 하드웨어(로봇 팔, 드론, 기기), 그리고 그림 파일이 없는 게임의 주인공 오브젝트나 세계가 여기에 해당한다(`sections.md`의 Product와 Gaming). `build.js`는 제품 자신의 부품을 적은 JSON 사양을 raymarch 스튜디오 렌더로 바꾼다. 실제 재질, 부드러운 빛과 그림자, 유리 부품의 softbox, 바닥 그림자, 그리고 요청한 부품에 페이지 accent를 입힌 결과다. `auto.js`가 마운트하고, `make-posters.mjs`는 사양을 검사한 뒤 포스터와 정지 그림을 낸다. 옆의 README가 전체 계약이다. `views.html`은 `specs/`의 세 가지 작업 사양(`city-bike` 부품 64개, `desk-lamp` 19개, `robot-arm` 28개)을 모든 뷰로 보여 준다. 장면은 각각 하나씩이며, 색 전환은 두 개다(`?only=bike|lamp|arm`, `?mode=still|live`). `demo.html`은 turntable을 보여 준다. 형식은 복사하되, 그 사양을 고객의 제품으로 배포하지 않는다.

### 마운트

```html
<div class="frame" data-product="assets/objects/product-render/specs/<id>.json"
     data-product-place="stage"></div>
<script type="module" src="assets/objects/product-render/auto.js"></script>
```

- `data-product`: 페이지에서 가리키는 사양의 URL. 포스터는 그 옆에 놓인다. 사양은 `assets/objects` 아래에 둔다(`make-posters.mjs`는 밖에 있는 것을 거부한다). 예: `product-render/specs/<id>.json`.
- `data-product-place`: 제품 자신의 경계가 채우는 프레임의 몫만을 쓰는, 더 촘촘한 방식이다. 항상 프레임의 가운데에 놓인다(`build.js`). `stage` 0.86, `hero` 0.88, `tile` 0.84, `card` 0.9다. `legacy`는 넓은 한 프레임에서 글 오른쪽에 있는 예전 turntable이다. 지정하지 않으면 `.frame`에서는 `hero`, `.panel`에서는 `card`, 정사각이나 세로 프레임에서는 `tile`이다. 어떤 place도 글을 제품 위에 얹거나 제품 옆에 두지 않는다. 페이지의 CSS가 프레임의 크기와 위치를 정하고, 글은 프레임 밖에 선다. `product` 히어로의 `.hero__stage`에서는 `stage`를 쓴다(`layout.css` 3b. 무대를 wrap 전체에 걸치고, 프레임은 위아래로 7%씩 넘게 두어, 제품의 높이가 무대와 같아지게 한다). `split`이나 전체 너비 프레임에서도 `stage`를 쓴다. 정사각이나 세로 타일에서는 `tile`을 쓴다. 모든 place는 프레임 바탕 위에서 투명하며, 바닥 그림자도 포함한다. `layout.css`는 `[data-product]` 프레임의 채움, 테두리, 패딩을 없앤다. 그래서 제품은 패널 없이 페이지 바탕 위에 선다.
- `data-product-view`(기본값 `three-quarter`, `side`, `front`, `top`, 클로즈업), `data-product-scene`, `data-product-color`(색상 id), `data-product-mode`(`auto`는 정지 그림이며 기본값. `live`는 요청할 때만. `image`, `still`), `data-product-fill`(0.3~1.2)은 위의 Views를 본다. 마운트된 프레임에서 `-color`, `-view`, `-scene`을 바꾸면 그 변형을 보여 준다.
- `data-product-params`: place 프리셋 위의 JSON이다. `{"angle":-20}`, `{"step":0}`은 램프를 끈다. `{"size":0.7,"x":0.1,"y":-0.05}`.
- `data-product-palette`: `{ bg, surface, ink, accent }`. 없으면 페이지의 `--bg`, `--ink`, `--accent`를 쓴다. `aria-label`은 사양의 `label`을 덮어쓴다. 렌더는 그것과 함께 `role="img"`를 설정한다(클릭으로 뷰를 바꾸면 button). `product-shown`이 이것을 읽는다.
- 스크립트: `import { loadProduct, checkSpec } from '…/product-render/build.js'`를 쓰고, `(await loadProduct(url)).mount(el, { place, params, palette })`를 호출한다. 컨트롤러는 `pause()`, `resume()`, `step(on)`, `set(params)`, `setPalette(p | null)`(테마 전환 후 `setPalette(null)`을 호출한다), `destroy()`를 가진다. `auto.js`는 `products`(요소에서 컨트롤러로), `ready`, `mountAll(root)`을 내보낸다. 로드에 실패한 사양은 요소에 `data-product-error`를 설정한다.

### 뷰 (섹션마다 다른 뷰, 제품 전체는 최대 세 섹션)

모두 한 사양에서 키트 자신의 이름으로 만든다(`build.js`, 세 가지 작업 사양이 각각 보여 준다). 각 섹션의 뷰는 계획 줄에 적고, 둘이 같지 않게 한다(`sections.md`, Product. 여섯 섹션 레시피가 `side`, `three-quarter`, 사용 장면, `detail:<part>` 또는 `exploded` 장면, 사양 자신의 `rear-quarter`를 이름으로 든다. 전체 뷰는 최대 세 섹션에 둔다).

| 사양 키 | 주는 것 |
|---|---|
| (필요 없음) | 표준 뷰 `three-quarter`(사양의 `angle`), `side`(긴 제품의 가장 넓은 면. 히어로), `side-left`, `front`, `rear`, `top`, `low`(사양의 `supports`가 나열한 것만). `detail:<part>[,<part>]`(또는 `detail-<part>`)는 이름 붙은 부품을 프레임에 맞추고, 나머지는 프레임 밖으로 밀어낸다. 클로즈업이다 |
| `views` | 사양 자신의 뷰. 예: `{ "detail-saddle": { "part": ["saddle*", "seat post"], "angle": -42, "elev": 16, "margin": 1.3 } }`(`from`은 표준 뷰이며, 부품 이름은 그 말로 시작하는 부품을 가리키고, `*`는 전부를 뜻한다) |
| `scenes` | 사용 중이거나 짐이 실린 제품: `{ "loaded": { "label", "hide": [parts], "props": [{ "prop", "at", "size", … }], "parts", "lit", "pool", "click" } }`. 소품은 `crate`, `bag`, `child-seat`, `bench`, `parcel`, `desk`, `book`, `mug`, `sheet`, `tray`다. `lit`은 램프 주변의 소품에 빛을 준다. 장면은 헤드라인의 약속을 섹션이 읽을 수 있는 크기로 보여 준다 |
| `colors` | 제공하는 색상. `[{ "id", "name", "accent", "materials"? }]`. accent는 `"color": "accent"`로 칠해진 부품에 다시 빛을 주고, `materials`는 다른 재질을 바꾼다 |
| `make` | `make-posters.mjs`가 출력하는 것. `{ "variants": ["three-quarter", "side", "front", "detail-saddle", "three-quarter+loaded"], "grounds": ["light", "dark"] }`(`view+scene`) |
| 램프의 빛 | 사양의 `click: "light"`와 `pool`. `{"step":0}`은 끈 상태다 |

**뷰 마운트.** `<div class="frame" data-product="…/specs/<id>.json" data-product-place="stage" data-product-view="side" data-product-color="blue">`. `make-posters.mjs`를 한 번 실행하면 모든 뷰는 기본적으로 자기 정지 그림이다. 그것이 쓴 `<img class="product-render__img">`(`specs/stills/<poster>-<variant>-<colour>.webp`, `srcset`의 `-half.webp`, 어두운 바탕에는 `-dark`)이며, `<poster>.stills.json`이 제품이 채우는 상자와 함께 목록을 준다. 그림은 place의 몫에 맞게 배치된다. 페이지에는 캔버스나 WebGL이 없다. **정지 그림이 기본이고, 요청할 때만 라이브(`data-product-mode="live"`)이며, 라이브 context는 최대 하나다.** `auto`(기본값)는 정지 그림을 보여 준다(먼저 `make-posters.mjs`를 실행한다. 만든 그림이 없으면 돌기 시작한다). `image`는 정지 그림만 보여 준다. `still`은 프레임 크기에서 한 번 렌더해 `<img>`로 보관하고 context를 해제한다. `live`는 회전이다. 클로즈업(`detail-*`, `detail:<part>`)은 나머지 제품이 프레임의 가장자리에서 밖으로 뻗어 나가는 쪽을 유지한다(프레임이 자른다). 안에서 딱 잘리는 일은 없다. 스크립트로는 `(await loadProduct(url)).mount(el, { place, view, scene, color, mode })`를 쓴다. 컨트롤러는 `setView(v)`, `setScene(s)`, `setColor(id)`, `ready()`를 추가로 가진다(페이지의 스와치는 아래 `data-product-swatch`를 쓰며, 이것은 쓰지 않는다). **프레임이 알려 주는 것**(검사 도구와 테스트용): `data-product-mode`, `data-product-state`(`image` | `still` | `live` | `poster`), `data-product-view`, `data-product-color-shown`, `window.__tpProduct` `{ stills, images, live, freed }`. `window.__tpGl`에 계산되는 것은 `live`뿐이다. `[data-product]` 프레임 안의 캔버스는 효과가 아니라 제품 자신의 렌더다.

**크게:** 렌더는 투명하므로, 섹션의 바탕 위에 anchor 크기로 선다. 회색 `.panel` 안에 넣지 않는다. place의 채움은 프레임의 0.84~0.9다(`size` 0.3~1.2가 이것을 덮어쓴다). 히어로와 섹션 하나 더에서는 제품의 긴 쪽이 프레임의 80~100%이거나, `detail:` 뷰가 가장자리 밖으로 밀어낸다. `product` 히어로에서는 1440에서 가장 넓은 뷰가 wrap의 80% 이상을 채운다(`layout.css` 3b. 도시 자전거의 `side`는 1280 중 1046, `three-quarter`는 818). **색 스와치:** 주문 카드의 색 버튼이나 라디오는 `data-product-swatch="#hero-bike, #loaded-bike"`(그것이 구동하는 프레임들. 비우면 사양에 그 색이 있는 모든 프레임)와 `value="<colour id>"`를 가진다. 클릭이나 변경 시 프레임은 그 색의 정지 그림으로 바뀌고, 버튼 그룹은 `aria-pressed` 하나를 유지한다. 페이지 자신의 스크립트는 필요 없다. 또는 `frame.dispatchEvent(new CustomEvent('product:set', { detail: { color } }))`를 쓰거나, `data-product-color`를 설정한다. 제공하는 모든 색은 페이지에 한 번씩 보인다. 정지 그림은 렌더로 센다. 뷰와 색마다 그림 한 장이며(`-half` 파일은 그 그림의 `srcset`에만 쓴다), 같은 뷰를 두 크기로 한 페이지에 두지 않는다.
### 사양

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

- **축**: x는 제품의 앞쪽, y는 위, z는 가로(각도 0에서 보는 사람 쪽)다. 단위는 무엇이든 된다. 모델은 가장 긴 변이 1이 되도록 크기가 조정되고, 가장 낮은 점에서 바닥에 놓인다. 실제 측정으로 모델링한다. 비율이 제품을 그 제품으로 읽히게 하는 대부분이다.
- **키**: `id`, `name`, `label`(스크린 리더가 듣는 내용), `poster`(포스터 파일 이름. 기본값은 id), `angle`(쉴 때와 정지 회전의 기준. 기본 -32이며 3/4 뷰), `turn`(`{"mode":"sway","amp":26,"period":22}`이 기본값. `{"mode":"spin","speed":10}`, `{"mode":"still"}`), `camera`(`{"elev":12}`), `click: "light"`(클릭하면 모든 `light` 재질과 `glow`가 바뀐다. 처음에는 켜져 있다), `pool`(`{"at":[x,0,z],"r":0.2}`. 바닥에 떨어지는 빛), `materials`, `motion`, `parts`.
- **모든 부품**은 `mat`(이름 또는 인라인 재질), `blend`(앞선 부품과 만나는 곳의 필렛. 단위는 사양 단위다. 용접된 튜브, 주조 몸체에 쓴다), `in`(움직임 그룹), `name`을 받는다. `from` + `to`로 배치하면 그 사이의 선형 부품이 된다(`up`은 단면을 돌린다). `axis`(`"x"`, `"y"`, `"z"` 또는 벡터)와/또는 `rot`([x, y, z] 도)를 가진 `at`으로 배치할 수도 있다. 튜브, 빔, 상자, 원기둥의 `seams`(반길이를 따라 -1..1 높이, `seamWidth`, `seamDepth`)는 패널 선을 자른다. 로봇의 외피나 베이스의 홈에 쓴다.

| 종류 | 크기 | 용도 |
|---|---|---|
| `tube` | `r`, `r2`(테이퍼), `cap` `flat`/`round`, `round` | 프레임 튜브, 기둥, 막대, 테이퍼된 로봇 링크 |
| `beam` | `w`, `d`, `round` | 납작한 막대, 크랭크, 레일, 드론의 팔 |
| `box` | `size` [x,y,z], `round` | 하우징, 몸체, 페달, 그리퍼, 상자 |
| `panel` | `size`(얇게) | 판, 뚜껑, 화면의 뒷면, 외판의 갑판 |
| `cylinder` / `disc` | `r`, `h`, `round` | 베이스, 허브, 모터, 렌즈, 로터 |
| `sphere`, `ellipsoid` | `r` / `size` | 전구, 종, 손잡이, 부표 |
| `torus` | `R`, `r` | 고리, 체인링, 상태 표시등 |
| `joint` | `r`, `w`, `capMat` | `axis`(기본 z)를 축으로 하는 캡이 있는 경첩 마디 |
| `wheel` | `r`, `tyre`, `rim`, `hub`, `spokes`, `spokeR`, `style` `spoked`/`disc`/`solid`, `wall`, `rimMat`, `hubMat`, `spin` | 자전거, 유모차, 카트, 캐스터 |
| `shade` | `from`(닫힘) `to`(열림), `r1`, `r2`, `t`, `bulge`, `innerMat` | 램프 갓, 종, 나팔, 스피커 콘 |
| `seat` | `size` [길이,높이,너비], `style` `saddle`/`cushion` | 안장, 좌석, 쿠션 |
| `basket` | `size`, `style` `wire`/`slats`/`solid`, `pitch`, `wire`, `rimMat` | 바구니, 상자, 통, 쟁반 |
| `arc` | `R`, `a0`, `a1`, `r` 또는 `size` | 흙받이, 손잡이, 고리, 구부러진 프레임 |
| `spring` | `from`, `to`, `R`, `r`, `turns` | 스프링, 감긴 코드 |
| `path` | `points`(2개 이상), `r`, `smooth` | 핸들바, 케이블, 구부러진 튜브, 크레인의 로프 |

- **재질**: `materials`의 이름, 내장 이름, 또는 `{ "kind", "color": "#hex" | "accent", "finish": "gloss" | "satin" | "matte" }`. 종류는 다음과 같다. `paint`(`color: "accent"`는 페이지 accent를 받는다), `metal`(브러시드 알루미늄 합금), `chrome`, `steel`(어두운 스테인리스. 살, 철사), `rubber`, `plastic`, `wood`(고리. `grain`, `scale`), `fabric`(`weave`), `leather`, `light`(빛을 낸다. `click`으로 켜고 끈다). 모든 재질은 `glow` 0..1(안쪽 면이 빛남)을 받을 수 있다. 내장 이름은 `accent`, `paint`, `white`, `black`, `graphite`, `alloy`, `aluminium`, `chrome`, `steel`, `rubber`, `plastic`, `wood`, `oak`, `walnut`, `fabric`, `leather`, `light`다.
- **움직임**: 최대 네 그룹. `{ "id", "parent", "pivot": [x,y,z], "axis", "amp", "period", "phase", "rest" }`. 부품은 `"in"`으로 그룹에 들어간다. 각 그룹은 부모 다음에, 쉴 때 주어진 pivot(사양 단위) 둘레로 돈다. 회전량은 `rest` + `amp` x 주기 `period`초의 사인파다(로봇의 yaw, 어깨, 팔꿈치, 손목). 관절은 제품이 회전하는 동안에만 움직인다.

### 포스터

사양을 바꿀 때마다 실행한다. 빈 포트를 쓴다(기본 5905와 그 뒤 4개):

```bash
node assets/objects/product-render/make-posters.mjs <spec.json> --profile <own chrome dir> --port <port> [--variants side,detail-saddle,three-quarter+loaded] [--grounds light,dark] [--px 1100] [--legacy]
node assets/objects/product-render/make-posters.mjs --check <spec.json>     # spec, views, scenes and shader, no browser
```

결함(알 수 없는 부품 종류, 소품, 재질, 뷰나 장면이 없는 부품을 가리키는 것, 그룹이 없는 `in`, 부품 90개 초과, 노트북 GPU가 거부하는 셰이더 단어)이 있으면 1로 종료한다. 그렇지 않으면 하나의 헤드리스 소프트웨어 렌더링 Chrome에서, 각 variant(`make.variants` 또는 `--variants`)와 바탕마다 `<poster>-<variant>.fallback-render[-dark].png`(포스터)를 쓴다. `stills/`에는 색상별 투명 정지 그림을, `<poster>.stills.json`을 쓴다. `--legacy`는 예전 turntable 포스터를 추가한다. WebGL2가 없거나 셰이더가 실패하거나 프레임이 비어 나오면 포스터가 즉시 보이고, 계속 남는다. 포스터가 없는 사양은 WebGL이 그릴 때까지 아무것도 보여 주지 않는다. CPU 렌더러에서 부품 60~90개면 variant당 1~4분이다(20~30개면 1분 미만). variant는 만들어지는 대로 바로 쓰이므로, `--timeout <분>`은 끝난 것을 잃지 않고 실행을 자를 수 있다. `--variants`로 목록의 일부만 주면 실행이 짧아진다(매니페스트는 병합된다). `--quiet`는 파일 줄을 뺀다.

### 한계

- **정지 그림이 기본이고, 요청할 때만 라이브(`data-product-mode="live"`)이며, 라이브 context는 최대 하나다.** 모든 뷰에 정지 그림이 있도록 `make-posters.mjs`를 실행한다. 만든 것이 없으면 `auto`가 돌기 시작한다. 요청받아 만드는 라이브 렌더 하나는 페이지의 네 개 context(`window.__tpGl`)에 포함된다. 휴대폰(max-width 700px 또는 coarse pointer)과 reduced motion에서는 선명한 정지 프레임 한 장을 받고 context를 해제한다. 돌아가는 제품 프레임의 오른쪽 아래 모서리에는 일시정지 버튼이 있다.
- **비용**: 모든 부품은 레이 스텝마다 계산된다(가장 가까운 충돌 너머에 있으면 바운딩 구가 건너뛰어진다). 부품 약 20개는 print object와 비슷하게 든다. 60~70개는 노트북 GPU에서 괜찮고, CPU에서는 느리다. 사양은 90개 미만으로 유지한다.
- **할 수 없는 것**: 제품 위의 글자나 로고, 투명한 유리, 늘어지는 천, 자유 형태의 유기적 외피(신발, 자동차 차체, 얼굴, 생물). 두께가 텍셀 하나보다 얇은 것(두껍게 처리된다). 이런 것에는 고객의 사진이나 렌더가 필요하다. 게임은 기계, 건물, 소품을 구성하고, 캐릭터는 구성하지 않는다. 단단한 기기 외피(드론, 카메라, 센서)는 실제 치수의 둥근 상자, 원기둥, 필렛이다. 주문 폼만 있는 `split` 히어로의 이유가 되지 않는다.
- **완성도**: 그 사물을 이름 짓는 디테일을 넣는다. 자전거의 살, 체인, 흙받이, 안장 스프링. 램프의 스프링, 손잡이, 코드. 로봇의 캡, 이음새, 그리퍼 패드. 배의 볼라드, 케이블, 램프. accent는 제조사가 칠할 부품에 준다. 금속과 고무는 자기 재질로 둔다. 배포 전에 1440과 390에서 확인한다.
- **절대 안 되는 것**: 다른 종류의 제품, place 페이지, 페이지에서 캡션이 달리거나 렌더, 모델, 일러스트로 불리는 것. 이것은 사물의 그림이지 효과가 아니다. tech에서는 효과가 뒤에 있을 수 있지만, 두 번째 비트로 옆에 두지 않는다.

## GPU 비용

| 계열 | 등급 | Context |
|---|---|---|
| Print objects | 프레임당 높음(raymarch). 화면 가까이에서 움직일 때만 | 2 공유 |
| Photo prints | 낮음. 쉴 때 정지 | 하나당 1, 최대 3 |
| Scenes | 낮음. 움직이거나 단계를 밟을 때만 그림 | 최대 2 |
| Product render | 정지 그림은 없음(`<img>`). `still` 모드는 한 번 렌더한 뒤 해제. `live`: 프레임당 높음(raymarch, 부품 수에 따라 비용 증가). 화면 가까이에서 회전할 때만 | 0(`live`: 1) |

배경과 효과를 합쳐서 **살아 있는 WebGL context는 최대 4개**다. 화면 밖이나 숨겨진 탭에서는 멈춘다. Reduced motion에서는 정지 프레임 한 장이다.

## 절대 안 되는 것

- **캡션.** 렌더나 인쇄물 아래에 설명하거나 사과하는 줄을 달지 않는다("code로 만듦", "임시 대역"). 제목이 그것이 무엇인지 말하고, 크레딧은 푸터에 넣는다.
- **스크롤에 맞춘 애니메이션.** 단, 정해진 큰 장면(`fixed-hero-object`, `object-through-giant-type`) 안에서는 예외다. 그 밖에서는 자기 느린 회전, 포인터, 클릭만 있다.
- **히어로 사진 위**, 또는 고객의 사진을 대신하는 것.
- **빈 화면.** 셰이더가 실패하거나 WebGL이 없으면 포스터가 남는다. 셰이더를 바꾼 뒤에는 `_print-core/lint-glsl.mjs`와 `_scenes/lint-glsl.mjs`를 실행한다. GLSL ES 예약어를 이름으로 쓰지 않는다. 제품 사양은 `product-render/make-posters.mjs`로 검사하고 포스터를 만든다(검사와 포스터를 한 번에 한다).
