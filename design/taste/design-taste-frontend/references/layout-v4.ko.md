# Layout: one section per screen, equal edges, heroes, type

모든 페이지의 layout 명세다(house rules 3, 4, 6). `system.css`는 토큰, 섹션 박스, 그리드, hero frame을 구현한다. `assets/layout/`에는 hero(`layout.css`, `layout.js`, `heroes.json`, `hero-<id>.html`), hero 배분기(`deal.mjs`), 검사(`layout-check.js`, `check.mjs`)가 있다. `layout.css`는 `system.css`, `ui/cards.css`, `motion/motion.css`, (tech에서는) `backgrounds/backgrounds.css` 뒤에 링크한다. `layout.js`는 `system.js` 뒤에 로드한다(`starter.html`이 둘 다 한다). 토큰, 버튼, nav는 `system.md`를 본다.

## 1. What the good sites do

- figma.com과 x.ai(참조 녹화): hero가 첫 화면을 채우고, 로드 시 다음 섹션은 아무것도 보이지 않는다. 섹션은 0.45~1.25 화면의 콘텐츠를 담고, 사이에는 약 4분의 1 화면의 간격을 둔다. 둘 다 한 섹션만 찍은 화면에도 이웃 섹션이 조금 보인다. 이는 이 house가 넘어서려는 모습이다.
- 1440x900과 390x844에서 본 327개 사이트 연구: 회사 사이트의 78%에서 hero가 첫 화면에 단독으로 있다. 섹션은 키가 클수록 단독으로 보이는 경우가 많다(0.6 화면 미만에서는 0.29, 0.95~1.1 화면에서는 0.80). 간격이 넓을수록 그렇다(60px 미만에서는 0.42, 220px 이상에서는 0.82). 이 표본에는 지역 상점이 없으므로, 아래의 장소 수치는 측정값이 아니라 house가 요구하는 것과 취향이다.
- 따라서 모습은 높이와 패딩에서만 나온다. 모든 섹션은 정확히 한 화면 또는 두 화면이다.

## 2. One section per screen

**The judge tile.** "shot"은 scrollY = k x H일 때의 화면이다(1440x900에서는 k x 900, 390x844에서는 k x 844). 모든 타일은 정확히 하나의 섹션을 보여 주며, hero도 마찬가지다. 페이지를 만들기 전에 화면의 목록으로 계획한다. `html { scroll-padding-top: 0; scroll-behavior: auto }`로 두어, 앵커 점프가 타일에 맞게 착지하게 한다(고정 헤더가 섹션 패딩의 위쪽을 가린다).

**The shell.** `body`에는 `header.nav`, `main`, `footer.closing`, 그리고 휴대폰에서는 `nav.actionbar`(script, style, template과 함께)만 렌더링된다. 팝업, 뉴스레터 모달, 채팅 말풍선, 도움말 알약, 맨 위로 가기 사각형, 배지, 수상 띠, 모달 안의 요청은 두지 않는다. 그 밖에는 아무것도 fixed로 두지 않는다.

**The section box.** `main > section`과 `footer.closing`은 `height: calc(var(--h,1) * 100svh)`이며, 위쪽은 `--padt`, 아래쪽은 `--padb + --bar`로 패딩한다. `--h`는 1 또는 2다. 640px 미만에서는 hero가 아닌 섹션이 `100lvh`와 `--hm`을 쓴다(쌓이면서 콘텐츠가 더 커질 때 설정한다). `.wrap`은 섹션의 유일한 in-flow 자식이다(`z-index: 1`). 레이어는 그 옆에 둔다. `min-height`만 쓰지 않고, `dvh`를 쓰지 않으며, 세 번째 화면을 만들지 않고, 스크립트로 높이를 정하지 않는다.

```html
<section class="section" id="features" style="--h: 2"><div class="wrap"> the h2 first, then the content </div></section>
```

**Content windows** (콘텐츠 높이 c, h2의 위쪽부터 마지막 콘텐츠의 아래쪽까지. 1440x900에서 한 화면은 708px을 담는다. y 120에서 828까지):

| c at 1440x900 | Screens |
|---|---|
| 360 미만 | 위 섹션에 합치거나, 없는 그림을 추가한다 |
| 360~495 | 한 화면, 경고: 그림을 준다 |
| 495~708 | 한 화면 |
| 708~1,320 | 맞는 높이가 없다: 708로 줄이고, 두 섹션으로 나누거나(각각 495 이상이며 자기 h2를 가진다), `.g2`를 쓴다 |
| 1,320~1,608 | 두 화면(1,200~1,320은 경고) |
| 1,608 초과 | 나눈다 |

390에서는(`--padt` 96, `--padb` 48에 bar를 더한다): 한 화면은 464~700 - bar를 담고, 두 화면은 1,268~1,544 - bar를 담는다. 그 사이에서는 `.g2m`을 쓰거나 휴대폰 문구를 줄인다. 긴 기능 그리드는 나누거나 줄이며, 축소하지 않는다.

**The tablet (640~1023; the judges hold it upright at 768x1024 and 820x1180).** 이 구간에서는 박스가 겹치기보다 화면을 넘어 커진다. 그래서 키가 조금만 커도 이후의 모든 섹션이 화면 격자에서 밀려나고, 각 타일에는 한 섹션의 끝과 다음 섹션의 앞부분이 같이 보이며, 카드가 타일의 가장자리에서 잘린다(768에서 확인됨). 768x1024에서 쌓인 콘텐츠 c(더 엄격한 기준):

| c at 768x1024 | Do |
|---|---|
| 832까지 | 한 화면 |
| 832~1,130 | 한 화면으로 줄인다: 태블릿에서는 그룹의 `--p-h`를 낮추고, 나눈 프레임은 `.fill`(남은 공간을 차지한다)로 하며, 회색 선이나 네 번째 카드를 뺀다 |
| 1,130~1,856 | 거기서 두 화면으로 한다. `@media (min-width: 640px) and (max-width: 1023px) { #<id> { --h: 2 } }`(섹션에 대한 유일한 페이지 CSS 규칙), 1024의 화면 경계를 넘는 카드 행은 두지 않는다 |

`consistency.mjs`를 `--rhythm-widths 1440,820,768,390`으로 실행한다. 그러면 SR-2 `section-height`가 태블릿에서도 한 화면이나 두 화면이 아닌 섹션을 실패 처리한다(기본은 1440, 768, 390을 실행하며, 이 옵션은 820을 더한다). 시스템의 태블릿 48px 거터는 맞으므로, 넓히지 않는다.

- **Two screens as two groups:** `.g2`(또는 휴대폰에만 쓰는 `.g2m`)는 `.wrap`을 두 줄로 만든다. 각 줄은 최대 708px이다. 첫 줄은 h2와 첫 그룹(360~708)을, 둘째 줄은 나머지(420~708)를 담는다. 둘째 줄에는 두 번째 h2를 두지 않으며, 두 번째 화면의 위쪽에서 `--padt`만큼 아래에서 시작한다. 그래서 두 번째 타일도 다른 섹션과 같아 보인다. 합계가 708~780이면 맞는 높이가 없다. 최대 72px을 더하거나 줄인다.
- **Top-aligned:** 하나뿐인 h2가 첫 콘텐츠이며, 섹션의 위쪽에서 `--padt`(120, 휴대폰에서는 96)만큼 아래에 있다. 타일에서는 헤더 아래 48이며, hero의 h1과 같다. 콘텐츠를 세로 가운데에 두지 않는다. h2를 두 개 두지 않는다.
- **Fill** 0.55 이상. 다음 콘텐츠까지의 간격은 최소 2 x 패딩이다(192px, 휴대폰에서는 144 + bar). 짧은 블록은 합치거나 그림을 주며, 빈 화면 가운데에 혼자 두지 않는다. 인용문, 로고 줄, stat 줄, FAQ가 단독으로 495px 미만(390에서는 464)이면 위 섹션에 마지막 요소로 합치며, 자기 제목이나 ground를 두지 않는다. strip 섹션은 두지 않는다.
- **Separation**은 전체 너비의 ground 변화나 간격으로만 한다. 섹션 사이나 안에는 구분선, 그림자, 안쪽 헤어라인을 두지 않으며, ground를 대신하는 안쪽 색 상자도 두지 않는다. 목록은 각 행을 콘텐츠 가장자리 안에서 1px 선으로 닫을 수 있다.
- **The close and the footer are one section,** `footer.closing`(한 화면. 휴대폰에서는 `.g2m`을 허용한다). `footer.closing > .wrap`에는 정확히 두 자식만 있다. 첫 줄은 배분된 close, 둘째 줄은 링크와 법적 고지 줄이다. 별도의 closing 띠는 두지 않는다.
- **No scroll tricks:** scroll-snap, scroll-jacking, smooth-scroll 라이브러리를 쓰지 않는다. 예외는 tech다. 큰 장면과 배분된 스크롤 moment는 자기 섹션 안에서 실행된다(`data-big-scene`, `data-moment`). 섹션은 정확히 1H 또는 2H로 유지한다(`{"hold": 1}`인 장면은 두 화면이 살아 있으며, 쉬고 있을 때의 구성은 한 화면 또는 두 화면이다. `scenes.md`, Its height). 고정하려면 그 박스 안에서 `position: sticky`만 쓴다. 그 밖의 어떤 페이지에서도 아무것도 sticky로 두지 않는다.

## 3. The hero

- **Exactly the first screen,** `100svh`, `--h: 1; --hm: 1`. 고정 헤더가 그 위쪽에 놓인다. 패딩 위쪽은 `--nav + --photo + --hgap`(1440에서 120, 휴대폰에서 96), 아래쪽은 `--hpadb + --bar`(64, 휴대폰에서 24 + bar)다. 1440x900에서 콘텐츠는 y 836까지 끝난다. 1440, 1280, 1024, 820, 768, 390에서 다음 섹션은 아무것도 보이지 않는다.
- **Content:** `.wrap > .hero-text`가 구성을 담는다. 선택적인 알림 줄, h1, sub-line(`p.hero__lead`, layout.css), 최대 두 개의 버튼(장소용 버튼 하나를 포함할 수 있다), 그리고 그림이다. 평범한 주장 한 줄을 쓰며, 슬로건은 쓰지 않는다. 그림 아래에 캡션을 달지 않으며, 두 번째 float 카드를 두지 않고, 버튼 스타일은 세 가지를 쓰지 않는다. 버튼은 모든 너비에서 폴드 위에 놓인다.
- **The h1** 이 먼저 오며, 위쪽은 y 120(휴대폰에서는 96)이다. 모든 너비에서 최대 세 줄이며, h2보다 작게 두지 않는다(휴대폰에서는 28~60px). 알림 줄(본문 서체로 된 14px 한 줄, 숫자가 들어가며 대비 4.5:1. 예: 변경된 영업시간, 배송 마감)은 h1 위 16px에 둔다. 헤더 위에 bar를 두지 않는다.
- **The picture ends inside the hero:** 그림은 글 뒤의 레이어이거나, 분할에서 글 옆에 있거나, 글의 위나 아래에 있되 hero 전체가 H - 24 안에서 끝날 때만 그렇다. 글 아래의 프레임은 y 836 안에서 끝난다(356px 텍스트 블록 아래 약 296px). 이보다 크면 레이어로 바꾼다. 첫 화면이 폴드에 잘린 visual에서 끝나거나, 글 아래 그림이 반쯤 보이는 것은 허용하지 않는다.
- **The first screen at 768 and 820.** 분할은 쌓인다. 글이 먼저 오고, 그림은 남은 공간에 놓인다. 그림의 아래쪽 가장자리는 온전한 요소에서 끝나거나, 큰 그림을 의도적으로 bleed시킨다.
  - whole: 그림(조각, 휴대폰, 렌더)은 hero 바닥에서 24px 이상 위에서 끝난다.
  - a bleed: 사진이나 ground가 자기 프레임을 채운다(`.frame--photo`, `object-fit: cover`). 또는 `.frame > .stage`에 있는 조각이 프레임 아래 경계에서 잘리되, 그 행의 96px 이상이 `.stage--fade-b` 아래에 있고, 가리키는 지점(댓글, 버튼, 작업 중인 행)은 fade 위에 있다.
  자기 wrapper 안의 카드, 창, diff가 아래쪽 가장자리를 폴드가 자르는 것은 허용하지 않는다(테스트에서: 820에서 `div.hero__art` 안의 480x688 diff가 아래 가장자리를 잃었고 `fold-card`가 FAIL했다). 폴드 아래의 박스가 1~95px만 보이는 것도 허용하지 않는다. 1024 미만에서는 `.at-over` 조각이 숨는다. 주 조각에는 고정 너비가 아니라 `.fit` 너비를 준다(좁아진다). Shoot 820x1180과 768x1024를 찍고, 첫 화면의 바닥을 읽는다.
- **Docked strip:** software와 product는 hero 콘텐츠 아래에 한 줄을 붙일 수 있다(권한을 받은 실제 고객 로고, brief가 준 평점 줄, 또는 세 가지 사실). 최대 96px이며 정지 상태이고, 휴대폰에서는 H - 24 - bar에서 끝나지 않으면 숨긴다. service와 place는 아무것도 붙이지 않는다.
- **Phone:** 텍스트가 먼저다. 사진은 hero 전체가 H - 24 - bar 안에서 끝날 때만 텍스트 위에 둔다. hero 버튼은 한 너비로 쌓는다. 둘 다 한 줄에 들어갈 때는 예외다.
- **Allowed types:** 전체 bleed된 정지 사진, 전체가 스테이지에 놓인 제품, 안쪽 프레임, 진술 뒤에 작업이 오는 구성. Tech에서만: 프레임 안이나 텍스트 뒤의 film(muted, inline, poster 먼저, 일시 정지 버튼. 페이지의 effect나 loop다), 또는 3D hero(poster 먼저, 준비되면 canvas로 교체). other에서는 film이 클릭하면 재생되는 still이다. 화면이나 제품 사이의 slider나 crossfade는 쓰지 않는다. 진입 gate, loader, 단어를 숨기는 entrance도 쓰지 않는다.
- **Pictures in the hero are the work:** 클라이언트의 제품, 장소, 작업물만 쓴다. 색 면이나 분위기를 쓰지 않는다.

### The eleven heroes

kind와 brief가 실제로 가진 재료에 따라 배분한다. 취향으로 고르지 않으며, 같은 hero는 세 페이지 안에서 반복하지 않는다. 장소에는 배분하지 않는다(아래 place hero).

```bash
node <skill>/assets/layout/deal.mjs --type software|product|place|service [--kind gaming|tech] --has photo,ui,film,object --history .taste-skill/layout-history.json
```

`--type`은 페이지 타입이다(`SKILL.md` 1절. 게임은 `software`, 하드웨어는 `product`). 게임은 `--kind gaming`을 더한다(자기 가중치를 쓰며, `ui`는 쓰지 않는다). brief가 trailer나 key art를 주면 `--has film,photo`를 쓴다. 아트 파일이 없으면 `--has object`를 쓴다(key art를 `product` 스테이지에서 product-render helper로 렌더한다. 게임은 `statement`나 `word`를 배분하지 않으며, 항상 `--has`를 넘긴다). 하드웨어는 `--kind tech`를 더한다. 사진이 없는 제품이나 하드웨어는 `--has object`를 넘긴다. 이때는 항상 `product` hero가 출력된다. 렌더가 전체 너비 스테이지에 가장 넓은 뷰로 놓이며, `split` 열이나 주문 폼 단독으로 두지 않는다(`sections.md`, Product). 장소 hero는 배분하지 않고 그대로 출력한다.

배분기는 hero를 출력한다(그 데모, 숫자, 그리고 그 kind에 맞는 moment, ground, effect id를 함께 낸다. other에서는 hero 자체만 센다). `assets/layout/hero-<id>.html`에서 `<section class="hero …">`만 복사한다. 각 파일은 완전한 데모 페이지이므로, 그 nav, 다른 섹션, footer, 크레딧 줄(사진작가 이름을 밝히며 `copy.md` Credits에 따른다)은 가져오지 않는다. `hero-place.html`의 라떼 클로즈업은 데모이며, 장소 hero가 아니다. `word`와 `statement`는 강한 사진이 없을 때만 배분한다.

| id | composition at 1440 | at 390 | its motion |
|---|---|---|---|
| `split` | 텍스트 span-5. 그림은 span-6 start-7, h1과 위쪽 정렬, 올바른 줄에서 끝난다. 불투명한 float 카드 하나가 왼쪽 아래에 있다 | 텍스트, 그다음 그림(최소 240 높이) | float 카드의 점(tech) |
| `photo` | 전체 bleed된 사진 레이어. 글은 사진의 조용하고 어두운 쪽에 6열로 놓인다(h1 80, 두 줄). 네 가지 사실은 하단에 있다 | 사진이 위쪽으로 잘려 올라가고, 글이 그 아래 ground에 놓인다 | 없음 |
| `product` | 헤드 행(h1은 1~7열에 두 줄. 리드와 버튼은 9~12열에 쌓이며, 그 바닥은 h1의 바닥에 맞춘다). 그다음 제품 자체가 크게, 하나에서 셋의 hotspot과 함께 나온다. 렌더(가장 넓은 뷰, `data-product-place="stage"`) 또는 페이지 ground 위의 cut-out으로, wrap 전체에 걸치며 상자, gradient, 모서리 반경이 없다. 스테이지는 폴드 위 24까지 내려온다(1440x900에서 1280x566: 도시 자전거의 측면이 1046 너비, wrap의 82%). 제품 사진은 가장자리에서 가장자리까지 폴드까지 내려오며, 모서리는 직각이다. 게임은 h1에 자기 이름을 쓴다. 스테이지에 `[data-print]`나 `[data-scene]`이 있으면 조명 받은 둥근 스테이지를 유지한다 | 쌓인다. 렌더는 열의 86%(342 중 294), 사진은 화면 너비. 탭하면 hotspot이 열린다 | hotspot은 클릭 시. 렌더는 still이다(요청이 있을 때만 live, `data-product-mode="live"`) |
| `editorial` | 헤드라인이 그림이다. 156px이 세 줄로 wrap 전체에 걸치고, 한두 장의 사진이 줄 안에 알약처럼 놓인다 | 56px, 네 줄 | 알약은 로드 시 한 번 열린다(tech). 그 밖에는 still |
| `collage` | 텍스트 span-5. 조명된 프레임 span-6 start-7에 제품 창이 아래쪽에서 잘려 들어가며, 결과 카드 하나가 loop한다 | 창만 | 카드 loop 하나(tech) |
| `word` | 아주 큰 h1(144px, 두 줄)에 마지막 단어 하나가 살아 있으며 밑줄이 그어진다. 리드와 버튼은 span-6, 네 가지 사실은 span-5 start-8 | 54px, 세 줄 | 살아 있는 단어. 두 번 돌고 나서 쉰다(tech에서만) |
| `film` | 줄 위의 시네마 프레임에 포스터가 들어가며, h1은 조용한 부분 위의 흰색이고, 재생 원판이 바닥에 있다 | 프레임, 그다음 글 | 클릭하면 재생 |
| `statement` | 하나의 차분한 문장(56px, 두 줄)이 페이지 ground 위에 놓인다(tech: 어두운 페이지 위의 어두운 ground). 리드, 버튼, 네 가지 사실 | 34px, 세 줄 | 없음 |
| `triptych` | h1 52가 span-3에 있고, span-6 start-4에는 셋에서 다섯 조각의 collage가 있다. 조각 세트는 2.8초마다 바뀐다. 큰 버튼 하나가 올바른 줄에서 끝난다 | 342 너비 collage, 버튼은 전체 너비 | 세트 변경(tech에서만. 그 밖에는 still) |
| `centred` | 알약, 가운데 정렬된 h1 72(인라인 마크 포함), 리드, 두 개의 알약 버튼, 그다음 wrap 전체에 걸친 조명된 프레임이 제품 창을 담는다. 마지막 18%에서 페이드된다 | 창에서 목록 열을 뺀 것 | 창의 이야기(tech) |

모든 hero는 한 화면이며, 가장자리 선 위에 서고, `maxChars`(`heroes.json`) 안에 h1이 하나 있으며, 자기 motion이 최대 하나다. 그 motion은 reduced motion과 휴대폰에서 쉰다. hero는 그림이 뷰포트 가장자리 밖으로 나가거나, 화면보다 높거나, 휴대폰에서 visual이 텍스트 위에 있거나, 글이 그림의 바쁜 부분 위에 있거나, float 카드가 두 번째로 있거나, 슬로건이 있거나, 그림 아래 캡션이 있으면 실패한다.

### The place hero

모든 장소 페이지에 적용하며, 배분하지 않는다. 헤더 아래에 장소의 전체 bleed된 정지 사진 하나를 둔다. 그 위에는 아무것도 올리지 않는다(텍스트, scrim, gradient, fade, 상자 없음). 글은 아래 ground에 놓인다. moment도 없고, 움직임도 없다.

- 1440: `html[data-type="place"]`에 `.hero.hero--photo`를 두고, `--photo: 480px`(사진은 y 72~552, 그 피사체는 가운데 640px), `--hgap: 40px`. 그 아래에 h1이 48/53으로 1~6열에 놓인다(x 120~708, y 592, 최대 세 줄). 분할선(x 732)에서부터 sub-line이 20/30으로 놓인다(장소의 종류와 위치, 오늘의 영업시간. 최대 두 줄, 80자). 그 24px 아래에 48px 주요 행동 버튼 하나가 채워져 있다. 이 행은 약 y 760에서 끝나며, 836을 넘지 않는다.
- 서점이나 상점은 대신 열 안의 letterbox를 쓸 수 있다. 1200 x 504이며, 헤더 아래 24px에 둔다(`--photo: 528px`).
- 640~1023: 사진은 최대 56vw 높이이며, 글은 그 아래에 쌓이고, hero는 H - 24에서 끝난다. 390: 사진은 390 x 292(휴대폰용 크롭, 피사체는 가운데), `--hgap` 24, h1은 32/37(최대 세 줄), sub-line은 18/28, 342 x 48 버튼 하나. 쌓인 것은 H - 24 - bar에서 끝난다.
- 사진은 실제이며, 이 장소의 낮 사진이어야 한다. 문에서 본 방, 기계가 있는 카운터, 선반의 빵, 손님이 있는 가게 앞, 작업장 가판대, 실제 방의 꽃꽂이, 가장 좋은 방이나 집이다. 분위기 사진, 풍경, 잘라 낸 것, 흐릿한 파일은 안 된다. 꽃집은 꽃이 없이 열지 않는다. 방문 정보 블록은 두 번째 화면에 두며, 첫 화면 안에 두지 않는다.

## 4. Equal edges and the grid

- **One `.wrap`**: 헤더, 모든 섹션, footer가 같은 wrap을 쓴다. `width: min(100% - 2 * var(--gut), 1280px)`. 1440에서 선은 x 80과 1360에 있다(장소는 1200이며 x 120~1320). 390에서는 x 24와 366이다. 페이지 끝까지 같다.
- **12 columns, 24px gutter** (휴대폰에서는 12). 1440에서 열의 시작은 80, 189, 297, 406, 515, 623, 732, 841, 949, 1058, 1167, 1275다. span 3 = 302, 4 = 410, 5 = 519, 6 = 628, 7 = 737이다. 장소(1200)에서는 시작이 120, 222, 324, 426, 528, 630, 732, 834, 936, 1038, 1140, 1242이며, span은 282, 384, 486, 588, 690이다. 휴대폰에서는 342 열 하나, 또는 12 간격의 165 타일 둘이다. 165보다 좁은 것은 없다.
- **Every block starts on the left line or a column start,** 그리고 오른쪽에서 끝나는 블록은 열의 끝에서 끝나며, 마지막은 오른쪽 선에 맞는다. `.wrap` 절반보다 넓은 것은 전체 `.wrap`을 쓴다. 카드 행(6+6, 4+4+4, 3+3+3+3): 첫 카드는 왼쪽 선에, 마지막 카드는 오른쪽 선에 맞추며, 모두 높이가 같고, 행은 꽉 찬다. 카드나 visual 안의 텍스트는 페이지의 선이 아니다.
- **Two text lines:** 왼쪽 선과 페이지의 분할선(오른쪽 열의 시작. k = 5, 6, 7이며 x 623, 732, 841. 장소는 항상 732의 6/6). 페이지를 만들기 전에 분할 쌍을 고르고, hero 분할, FAQ, 방문 정보를 포함해 모든 분할에 쓴다. 가운데 정렬된 텍스트는 왼쪽으로 옮긴다. h1, 섹션 제목, close, 가격 제목은 모두 왼쪽 선에서 시작한다(`centred` hero만 예외이며, 페이지 축을 따른다). `.wrap` 절반보다 넓은 가운데 정렬이나 오른쪽 정렬 블록은 두지 않는다.
- **Splits:** 텍스트는 왼쪽, visual은 오른쪽, 위쪽 정렬로, 페이지의 모든 분할에서 같다. 좌우를 바꾸거나 번갈아 두지 않는다. h2와 그 소개는 왼쪽 선에서 격자 위에 놓인다. 채워진 열은 카드이며, 텍스트에 48px 패딩을 줄 수 있다. 텍스트가 맨 열 안에 안쪽으로 들어가 있지 않는다. 휴대폰: 텍스트, 그다음 visual, 둘 다 342.
- **Pictures:** 사진은 레이어로서 뷰포트 0에서 끝까지 펼쳐지거나, 열 선(628, 410, 302 너비. 장소는 588, 384, 282)에서 시작하고 끝난다. 행마다 비율은 하나다(4:5, 4:3, 3:2 또는 1:1. 장소는 4:5, 4:3, 1:1). hero 밖에서 사진은 708px보다 높으면 안 된다.
- **Bleed:** 전체 너비는 레이어에만 쓴다. 섹션의 사진이나 ground가 글 뒤에 있는 경우(`img.layer`, `aria-hidden`, 섹션의 90% 이상을 덮는다. hero는 레이어를 하나만 가진다). 한쪽 가장자리로만 뻗는 것은 안 된다. 잘린 창은 `.wrap` 안에서 프레임으로 잘린다. 사진 벽은 `.wall`(간격 0 또는 2px)이며, 선에서 선까지 간다.
- **Nothing** 섹션 가장자리를 넘거나, 잘리거나(잘린 제목, 말줄임표 없음), 엇갈리거나, 다른 것 뒤에서 삐져나오지 않는다. 짧은 텍스트 옆에 죽은 공간을 두지 않는다.
- **1024~1279:** span-4 카드에 패널이 있으면 두 개씩 나란히 둔다. **640~1023**(820과 768에서 확인): 분할은 텍스트가 먼저 오도록 쌓고, 패널 카드는 전체 행을 차지하며, 절반만 찬 행은 두지 않는다. 어떤 너비에서도 가로로 스크롤하지 않으며, 스와이프 행도 두지 않는다.

## 5. Type

- **Dealt, never picked:** `start.mjs deal --page <kind>`가 그 kind용 Google 조합 세 개를 배분한다. 클라이언트에 맞는 하나를 고르고, 그다음 `start.mjs css --page <kind>`를 쓴다. `word`나 `editorial` hero에는 weight 또는 width 축이 있는 서체가 필요하다. `--axis`로 배분한다. kind에 배분될 수 있는 모든 조합과 정확한 Google Fonts 링크는 `start.mjs types --page <kind>`로 본다. `library/type.json`은 모든 서체, weight, tracking, `--ly-scale`의 유일한 출처다. `:root` 블록은 start.mjs가 출력한 그대로 유지한다. (`assets/layout/fonts.html`은 type.json을 읽어 모든 조합을 보여 준다. hero 데모의 서체는 견본이며, 출처가 아니다.) Google Fonts에서 `display=swap`으로 불러온다. fallback 서체가 보이는 일은 없어야 한다(`font-load`는 로드되지 않은 family를 경고한다).
- 한 family, 또는 정해진 역할을 가진 display 서체와 text 서체 하나씩. 셋은 쓰지 않는다. 서체 파일은 최대 네 개다. Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Space Grotesk, Plus Jakarta Sans 또는 시스템 서체 느낌은 쓰지 않는다.
- **Weights:** 제목은 `--display-weight`를 쓴다. start.mjs가 출력하는 값이다. product, service, place에서는 400이고, tech에서는 500이다. 크기와 촘촘한 tracking(40px 이상에서 -0.5%~-4.5%)이 무게를 만든다. 굵고 크게 만들지 않는다. 본문 텍스트는 400과 500만 쓴다(라벨, 버튼, 오늘의 행, strong). 600은 한 가지 용도로만 불러온다. nav 마크의 초기 타일(`.mark--initial`)이다. 정적 서체(Instrument Serif)는 이 타일을 `var(--display-weight)`로 설정한다. 700이나 800은 쓰지 않는다(letters moment의 700은 예외다). 20px 미만에서는 light weight를 쓰지 않는다.
- **Sizes** (1440/390): h1 72/38(hero. 각 hero의 토큰은 `heroes.json`에 있다), h2 48/30, h3와 인용문 28/24, 리드와 카드 제목 20/18, 본문 16/26, 작은 글씨 14, 라벨 13/500(문장형 대소문자), stat 38/28(`--t-stat`, h2 아래). 장소: h1 48/53과 32/37, h2 32/40과 24/30, 이름 20/28과 18/26, sub-line 20/30과 18/28, 본문 16/26, 작은 글씨 14/20, 라벨 13/16. 1024부터 각 단계는 다음 단계의 최소 1.3배이며(1024 미만에서는 1.2배), 13px 미만은 없다. 줄은 최대 62자다.
- 40px 이상의 display 텍스트는 격자 항목 밖에서 제목으로 센다. 설명문을 h2 크기로 설정하면 결함이다. footer 워드마크는 더 크게 둘 수 있다.

## 6. The check

`layout-check.js`는 리뷰어가 샷을 보듯 모든 섹션을 프레임으로 잡고, `check.mjs`는 이를 한 headless Chrome(WebGL은 CPU, 자기 PID로 닫는다)에서 실행해 프레임 샷을 쓴다.

```bash
node <skill>/assets/layout/check.mjs --url index.html --profile <own dir> \
     --sizes 1440x900,1024x768,820x1180,768x1024,390x844 [--shots <dir>] [--json]     # pass these five: the judges shoot the tablet at 768x1024 and 820x1180
```

| Finding | Means |
|---|---|
| `hero-fold` | hero가 첫 화면을 채우지 않거나, 넘치거나, 다음 섹션이 보인다 |
| `hero-maxchars`, `hero-lines` | h1을 `maxChars`까지 늘렸을 때 hero가 화면을 넘치거나, h1이 너무 많은 줄을 차지한다 |
| `screen-short`, `screen-height` | 섹션이 한 화면보다 짧거나, 정확히 한 화면이나 두 화면이 아니다 |
| `sparse` | 콘텐츠가 섹션의 절반 미만을 채운다(그림의 프레임은 통째로 센다) |
| `neighbour`, `neighbour-ground` | 다른 섹션의 잉크나 ground가 한 섹션의 타일에 보인다 |
| `edge-left`, `edge-right`, `spill`, `bleed-one-side`, `one-sided` | 블록이 선에서 벗어나거나, 선을 넘거나, 한쪽 뷰포트 가장자리까지 뻗거나, visual이 오른쪽 선 앞에서 멈춘다 |
| `lines` | 텍스트가 왼쪽 선 둘 이상에서 시작한다 |
| `overflow-x` | 페이지가 가로로 스크롤된다 |

`--no-stress` 없이 실행한다. 모든 finding은 페이지를 실패시킨다. 다른 스크립트에서는 `await page.evaluate(src + ';window.lyCheck()')`가 `{ vw, vh, L, R, nav, screen, hero, sections, findings }`를 반환한다.
