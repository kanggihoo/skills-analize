# 효과 라이브러리

`engine/fx.js`와 `engine/fx.css`에는 오늘날 프리미엄 컴포넌트 라이브러리에서 가장 많이 쓰이는 패턴을 본떠, 일반 HTML로 다시 만든 효과들이 들어 있다. 빌드 단계 없이 어떤 호스트에서도 실행된다. 두 파일을 scene 엔진과 마찬가지로 `site/`에 변경 없이 복사한다. `data-fx="name"`으로 효과를 켜고(한 요소에 여러 이름을 함께 쓸 수 있다: `data-fx="glass magnet"`), `data-fx-*` 속성으로 조정하고, CSS 변수(`--fx-accent`, `--fx-radius`, `--fx-gap`, `--fx-ease`)로 테마를 지정한다. 효과를 손으로 다시 쓰지 않는다. 비용이 들고 결과도 더 나빠진다.

모든 효과는 이미 동작 감소를 처리한다(최종 상태, 움직임 없음). 휴대폰에서도 처리한다(포인터 효과는 터치 화면에서 꺼지고, 고정된 효과는 스와이프 가능한 행이 된다). 화면 밖에서는 일시 정지된다.

## 효과 고르기

- **이야기를 위해 효과를 고른다.** 시그니처 상호작용(`design.md` 참고)과 보조 모션을 분명한 목적과 함께 계획한다. 효과 할당량은 없다. 조용한 대목이 있어야 더 강한 순간이 살아난다.
- **효과를 비즈니스의 목적에 맞춘다.** 화려해 보이는 것이 아니라.
  - 장소(호텔, 레스토랑, 공간): `expand`, `rail`, `shift`, `reveal`
  - 서비스와 신뢰(클리닉, 컨설턴트, 기술직): `split`, `count`(실제 숫자만), 실제 후기를 위한 `columns`, `spotlight`
  - 제품과 앱: 화면이나 제품 사진용 `tilt`, `spotlight`, 실제 언론이나 파트너 이름용 `marquee`, `aurora`
  - 메이커와 포트폴리오: `reveal`, `rail`, `hover-tilt`, `paths`
- **내용을 지어내서 효과를 채우지 않는다.** `count`에는 참인 숫자가, `columns`에는 실제 후기(또는 데모에서 분명히 라벨을 붙인 샘플)가, `marquee`에는 실제 이름이 필요하다.
- 호출 버튼은 사진 위에서는 `glass`를, 평범한 바탕에서는 `magnet`을 쓴다. 한 페이지에 두 스타일을 모두 쓰지 않는다.

## 카탈로그

**expand**: 사진이나 클립이 카드로 시작해서, 방문자가 스크롤하면서 화면을 가득 채울 때까지 커진다. 동시에 헤드라인의 두 절반이 서로 떨어져 나간다. 스크롤 장면 뒤의 가장 좋은 "두 번째 히어로", 또는 내부 페이지에서는 히어로 자체.
```html
<section data-fx="expand" data-fx-span="2">
  <div class="fx-expand-stage">
    <div class="fx-expand-media"><img src="assets/workshop.webp" alt="Describe the photo"></div>
    <div class="fx-apart" aria-hidden="true"><h2>First</h2><h2>Word</h2></div>
    <div class="fx-expand-text"><p>One line that the full picture earns.</p></div>
  </div>
</section>
```
`data-fx-span`은 화면 단위의 스크롤 길이다(1~3).

**tilt**: 액자에 든 화면이나 제품 사진이 기울어 있다가, 도착하면서 평평하게 자리 잡는다. 앱 스크린샷과 메뉴에 이상적이다.
```html
<section data-fx="tilt"><div class="fx-tilt-frame"><img src="assets/app.webp" alt="The booking screen"></div></section>
```

**rail**: 사진 행이 옆으로 움직이는 동안 섹션은 고정된다. 휴대폰에서는 스와이프 가능한 행이 된다.
```html
<section data-fx="rail"><div class="fx-rail-stage"><div class="fx-rail-track">
  <figure class="item">...</figure><figure class="item">...</figure><figure class="item">...</figure>
</div></div></section>
```
트랙이 화면보다 넓도록 항목 크기를 `vw`로 정한다(예: `width: 38vw`).

**shift**: 방문자가 스크롤하면 페이지 전체의 배경색과 글자색이 바뀐다. 예를 들어 마무리 섹션을 위해 밝은 바탕에서 어두운 바탕으로 바뀐다. `<body>`에 붙이고, 섹션이 그것을 따라야 하는 곳마다 `var(--fx-bg)`와 `var(--fx-ink)`를 쓴다.
```html
<body data-fx="shift" data-fx-stops="0 #f4efe6 #241d16, 0.6 #f7e3c8 #241d16, 1 #221b25 #f3ece2">
```
각 stop은 위치(0~1), 배경색, 글자색이다. 모든 stop에서 대비를 확인한다.

**spotlight**: 부드러운 빛이 포인터를 따라 카드 격자 위를 움직이며 카드의 가장자리를 밝힌다.
```html
<div class="cards" data-fx="spotlight" style="--fx-accent:#f3c98b"> <article class="card">...</article> ... </div>
```
카드에는 둥근 모서리와 배경이 필요하다. 어두운 바탕에서 가장 잘 보인다.

**hover-tilt**: 카드가 움직이는 반사광과 함께 포인터 쪽으로 기운다. 많아야 한 줄의 카드에만 쓴다. `data-fx-max="8"`로 각도를 정한다.

**magnet**: 버튼이 포인터 쪽으로 부드럽게 끌려간다. `data-fx-strength="0.35"`.

**glass**: 움직이는 광택이 있는 유리 질감의 버튼이나 배지. 사진 위와 스크롤 장면에서 쓴다. 글자색과 패딩은 평소처럼 스타일링한다.

**reveal**: 행에 마우스를 올리면 포인터 옆에 떠다니는 사진이 나타나는 목록. 객실, 요리, 프로젝트, 서비스에 좋다.
```html
<ul data-fx="reveal"><li data-fx-img="assets/consultation.webp"><a href="services/consultation.html">Consultation</a></li> ... </ul>
```

**split**: 처음 나타날 때 단어들이 제자리로 올라오는 헤드라인. `data-fx-split="chars"`를 쓰면 대신 글자가 애니메이션된다(짧은 헤드라인에만). 등장 효과가 읽는 리듬을 살릴 곳에 쓴다. 분할기는 작성된 인라인 요소와 줄바꿈을 보존하고, 하나의 접근 가능한 이름을 유지하며, 일반 span에 잘못된 aria-label을 붙이지 않는다. 분할된 텍스트 안에 상호작용 콘텐츠를 넣지 않는다.

**words**: 문장 속 한 단어가 목록을 따라 순환한다. `data-fx-words="calm,warm,yours"`와 선택적인 `data-fx-every="2400"`(밀리초). 스크린 리더는 전체 목록을 한 번 읽는다.

**count**: 숫자가 나타날 때 올라간다. `data-fx-to="12480"`, 선택적으로 `data-fx-prefix="€"`, `data-fx-suffix="+"`, `data-fx-decimals="1"`. 실제 숫자만 쓴다.

**columns**: 후기 두 개 또는 세 개의 열이 영원히 위로 떠오르며, 마우스를 올리면 멈춘다. 휴대폰에서는 한 열만 보인다.
```html
<div data-fx="columns" style="--fx-height:620px">
  <div class="fx-col"><blockquote class="review">...</blockquote>...</div>
  <div class="fx-col" data-fx-seconds="46">...</div>
</div>
```

**marquee**: 영원히 옆으로 흘러가는 행(언론 이름, 파트너 로고, 요리). `data-fx-seconds="40"`.

**paths**: 섹션 뒤에 천천히 흐르는 선이 그려진다. `currentColor`를 쓴다. 섹션의 `color`를 조용한 브랜드 톤으로 설정한다. `data-fx-lines="18"`.

**aurora**: 섹션 뒤의 부드럽게 움직이는 색의 장. 뷰포트 가까이에서만 초기화되며, 화면 밖이나 숨겨진 탭에서는 그리기가 일시 정지된다. 동작 감소 상태에서는 WebGL 컨텍스트를 만들지 않고 정적 CSS 대체 화면을 쓴다. 실제 시작 및 스크롤 비용을 측정한다. 그래픽 효과가 본래 가벼운 것은 아니다. `data-fx-colors="#f3d9b1,#e9a87c,#7a9ea8"`(브랜드 톤 세 가지). 그 위의 텍스트는 대비를 높게 유지한다.

## 페이지 전환 (여러 페이지 사이트)

`engine/pages.css`는 Chrome, Edge, Safari에서 페이지 사이를 이동할 때 하나의 연속된 사이트처럼 느끼게 한다. 다른 브라우저는 페이지를 평소처럼 로드한다. `pages.md`를 참고한다.
