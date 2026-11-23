# Backgrounds

더 좋은 배경은 더 적고 더 좋은 색에서 나온다(house rule 6: "nicer backgrounds"). 테크 분야에서는 CSS로 그린 작은 배경 카탈로그를 쓴다. 모든 종류가 세 개의 ground 토큰을 쓰며, CSS ground를 추가로 쓰는 것은 테크뿐이다.

## The three tokens (every kind)

섹션과 패널의 ground는 `--g-main`, `--g-alt`, `--g-dark`만 쓴다(system.css의 기본값, `.ground-surface`, `.ground-inverse`). footer를 포함해 페이지 아래로 색 하나에서 셋까지만 쓰며, 390 폭에서도 같은 순서를 따른다. 사진 레이어와 아래의 테크 ground는 이 개수에 포함하지 않는다.

- **`--g-main`:** 흰색, 또는 명도 0.80에서 0.97, 채도가 낮은(채널 편차 0.12 이하) 틴트. 고객에게서 가져온다. 장소의 벽, 종이, 상점 외관(기본값은 따뜻한 오프화이트 `#F7F3EC`, 주로 온라인으로 파는 상점이면 흰색), 제품의 사진 배경, 서비스의 따뜻한 회색, 소프트웨어의 푸른 기운이 도는 회색이나 차가운 회색. 페이지 높이의 55% 이상을 덮는다(소프트웨어와 제품에서는 60% 이상). 크림색 페이지 위에 순백색 패널을 두지 않는다.
- **`--g-alt`:** 같은 hue(20도 이내), 명도가 0.06에서 0.15 더 어둡고, 0.70 아래로는 내려가지 않는다(`#ffffff`에서 `#f2f2ef`, `#f7f3ec`에서 `#ede6da`). 패널, tile, card, 그리고 전체 band는 최대 한 개.
- **`--g-dark`:** 명도 0.05 이하. 거의 검정(`#111`에서 `#1a1a1a`)이거나 브랜드 hue의 가장 짙은 음영. 회색빛 숯색이나 보라색은 쓰지 않는다. 어두운 본문 섹션은 최대 하나(한 화면 높이), 페이지 중간 이후에만 두며 hero 바로 아래에는 두지 않는다. footer는 어두워도 된다. 어두운 페이지(메인 ground 명도 0.02 이하)와 어두운 hero는 테크 전용이다.
- **브랜드 band**(`.ground-brand`, 제품과 장소): 브랜드 고유의 색(제품이나 상점 외관에서 가져온)을 쓰는 섹션 하나가 어두운 band를 대신할 수 있다. 페이지당 한 번, 후반부에만 쓴다. 장소에서는 명도 0.03에서 0.60, 채도 0.25 이상이어야 하며, 중립적인 거의 검정은 쓰지 않는다. 그 위의 모든 글자(제목, 본문, 라벨, 링크)는 7:1을 통과하는 색을 쓴다. 이것이 기준 숫자 하나다. 통과할 때까지 브랜드 색을 어둡게 한다(`check.mjs`와 `consistency.mjs`는 읽히는 글자에 7:1, 라벨에 4.5:1을 요구한다. 7:1이면 둘 다 충족한다). 기본 버튼은 색을 반전한다. 그 밖에 채도 높은 색은 accent와 사진에 둔다. 중간 톤의 섹션은 최대 하나이며, 주 ground로 쓰지 않는다.
- ground의 변화는 섹션의 가장자리에서 큰 덩어리로 일어난다. `.wrap`이나 감싸는 요소에 두지 않으며, 섹션 사이에 border-top이나 구분선을 두지 않는다. 섹션 안에 band를 두지 않는다(자기 ground를 가지며 제목을 품은, 너비의 80% 이상인 상자). 대신 쓰는 색 있는 inset 상자도 두지 않는다. 시각 요소를 담는 frame은 괜찮다.

## Other kinds stay flat

제품, 서비스, 장소(site-kind other)에서는 모든 ground와 패널이 평평한 CSS 색이며, 사진은 원래 모습 그대로 보여 준다. gradient(두 가지 색을 뚜렷이 나눈 hard-stop 포함), grain, paper, halo, texture, pattern, glass, contour, canvas, `backdrop-filter`, gradient mask, 인터페이스의 그림자나 색조는 쓰지 않는다. 이런 종류에서는 `pick.mjs`를 실행하지 않는다. 그 `index.json`에는 제품, 서비스, 장소용 ground가 여전히 나열되어 있지만 쓰지 않는다. site-kind가 tech인 제품 페이지는 테크로 배정한다.

## Tech: the CSS grounds

CSS(WebGL 없이)로 그린 배경 열여섯 개가 `assets/backgrounds`에 있다. `backgrounds.css`를 `system.css`와 `cards.css` 뒤에 연결하고, `backgrounds.js`는 `<head>` 끝에서 일반 스크립트로 불러온다. 섹션이나 hero의 감싸는 요소에 클래스 하나를 준다(`<section class="section bg-halo">`). `stage`는 시각 카드 하나를 감싸는 `<div class="bg-stage">`에서만 쓴다. `paper`는 `<body>`에, `topglow`는 nav와 hero 주위에 쓴다. 이 둘은 토큰을 설정하지 않는다. 섹션 ground 열세 개는 페이지 토큰을 설정하므로 card와 버튼이 그대로 동작한다. 모든 palette에서 ink는 7:1, muted는 4.5:1을 유지한다(`check.mjs`가 측정한다). `index.json`에는 각 ground의 분위기, 역할, 짝, 피할 조합, 섹션이 들어 있다.

- **Soft:** `mist`는 색 wash. `halo`는 제목 뒤의 빛. `ruled`는 컨테이너 가장자리의 가는 격자이며 제목 뒤는 비운다. `dots`는 여백의 점. `arcs`는 떠오르는 고리이며 마무리에 쓴다. `liquid`는 색 타원의 느린 메시이며, 움직이는 유일한 ground다.
- **Hard:** `grain`은 필름 grain이 있는 틴트. `dusk`는 페이지에 녹아드는 한 가지 톤. `band`는 밝은 ground의 두 번째 톤. `field`는 grain이 있는 gradient(Figma의 sand 타일). `photo`는 사진 레이어. `horizon`은 빛나는 가장자리가 있는 어두운 band. `deep`은 차가운 빛 웅덩이가 있는 거의 검정(x.ai의 배경).
- **Deal:**

  ```bash
  node <skill>/assets/backgrounds/pick.mjs --type software --sections <the plan's ids> --mode light|dark --history .taste-skill/bg-history.json
  ```

  하드웨어는 `--type product --kind tech`로 실행한다. effect나 scene이 이미 배정되어 있으면 `--effect`를 더하고, 그것이 들어 있는 섹션(effect hero, `[data-visual]` 섹션, scene의 섹션)은 `--sections`에서 뺀다. 그 섹션은 자체 ground를 가져온다.

  리듬상 band가 되는 섹션은 표시한다: `id:dark`, `id:band`(밝은 ground), `id:surface`. 출력된 대로 만든 뒤 규칙을 지킨다. 페이지에는 토큰 외에 배정된 ground가 최대 두 개까지만 있고, 각각 한 번씩만 쓴다. card 위에는 쓰지 않는다. 강한 ground 두 개를 이웃으로 두지 않는다. 강한 것은 최대 하나다. `avoids`에서 서로를 지정한 두 ground는 함께 쓰지 않는다.
- **The effect rule:** grain, dither, 질감이 있는 ground(`grain`, `field`, `stage`, `deep`)나 움직임이 있는 ground(`liquid`)는 페이지의 effect 하나다(`effects-usage.md`). 다른 effect가 이미 배정되어 있으면 이런 ground를 빼고 다시 배정한다. `liquid`는 로드된 시점부터 시계로 움직이며, 일시정지 원판이 있고, reduced motion에서는 정지한다.
- **The lit ground**(`<html data-ground="sand|sky|sage|painting">`)는 테크 전용이다. UI 뒤, 마무리 band, `footer-statement`에 쓴다. `band`와 `field`의 톤이 된다.
- **`photo` 위의 글자**는 사진의 차분하고 어두운 부분(`--g-photo-pos`, 피사체용 `--g-photo-pos-m`) 위에 놓는다. hero와 마무리 band 하나에만 쓴다(`system.md`).
- **Tune:** `--g-hue`(틴트), `--g-k`(강도), `--tone`(두 번째 톤), `--halo-x`/`--halo-y`, `--stage-w`. 틴트는 accent 쪽으로 기울며, 보라색으로 기울지 않는다.
- ground는 섹션의 높이를 바꾸지 않는다(`layout-v4.md`). 부드러운 ground는 120px에 걸쳐 흐려지고, hard ground는 상자 전체에 색을 유지한다. 패널은 `.wrap` 선에 `bg-inset`을 쓴다.

## Tech: code-drawn grounds, how they look

차분하고 구체적이며 스튜디오 사진 같아야 한다. 빛은 하나, palette는 하나이며, grain은 가까이서 볼 때만 보인다. 색은 토큰에서 가져온다(`--ground`, `--ground-2`, `--ink`, `--tone`, `--tone-hi` = L +0.12, `--tone-lo` = L -0.18). OKLCH에서 섞으며, ground의 chroma는 0.12 아래다. gradient는 밝은 쪽부터 쌓는다. 한 hue에서 네 개에서 여섯 개의 stop을 가진 radial을 만들고, 그다음 grain(4에서 10%)을 입힌다. 모든 어두운 gradient에는 정적 dither를 준다. 장식으로서 두 개 stop의 linear gradient는 쓰지 않는다(linear는 시각 요소 안에서 가장자리를 흐리게 할 때만 쓴다). 두 가지 톤의 이음매는 hard stop으로 만든다. Grain은 하나의 effect 안에서만 쓴다. 로드할 때 타일 하나를 만들고, 애니메이션하지 않으며, UI, 글자, 사진 위에는 쓰지 않는다. 레시피는 모두 정지 상태다.

- **Lit studio sweep:** 잘라 낸 객체나 UI 창 뒤. 타원형 radial(50-60% x 40-50%, 중심은 35-42% 아래), 약한 바닥 반사, grain 4-6%, 부드러운 접촉 그림자.
- **Corner glow:** 어두운 footer, 마무리 band, 가격 card. 한쪽 모서리 근처의 radial, 반경 110-130%, 고리가 보이지 않도록 다섯 개의 부드러운 stop.
- **Painterly field:** UI 창 아래나 마무리 band. 색조의 큰 타원 네 개에서 여섯 개를 60-120px 흐리게 하고, 10% 크게 그린 뒤 잘라 낸다. grain을 입힌다.
- **Spotlight floor:** 어두운 페이지의 하드웨어 무대나 어두운 hero. 폭 70%의 빛 웅덩이, 물체에서 멀어지는 흐린 그림자, 양옆의 비네트.
- **Product-colour wash:** 하드웨어 card나 모델 전환. 아래에서 제품 색조로 번지는 radial. 클릭하면 크로스페이드하며, 스크롤에서는 바뀌지 않는다.
- **Woven tile and ordered dither:** 페이지당 최대 한 가지 질감. band, footer, 기술 패널 중 하나에만.
- **Grid marks**(열 교차점의 점이나 플러스 기호, 잉크 12-18%)는 어두운 기술 band 하나, 데이터 패널, footer에서만 쓴다. 글자 위에는 쓰지 않는다. 얇은 원장선(헤더 셀, 줄 정렬, footer 틀)은 잉크 12-15%의 1px 규칙을 여러 개 이어 붙인 것이며, 섹션 사이에는 두지 않는다.
