# 섹션 라이브러리

`sections.md`에 있는 모든 section id의 레시피다. 사용하는 레시피만 읽는다. 각 레시피는 역할(job), 1440과 390에서의 수치, 예시를 붙인 카피, 비주얼, 모션, 그리고 체커나 리뷰어가 잡아내는 실수를 담는다. place 페이지는 차이가 나는 부분마다 `sections.md`의 4절을 따른다.

## 모든 레시피의 전제

- **Frame.** 1440에서의 `system.css` 기준은 다음과 같다. `.wrap`은 너비 1280, x 80 위치다(place는 너비 1200, x 120). gutter는 24, h1은 72, h2는 48이다. 390에서는 너비 342, x 24다. 모든 섹션은 한두 화면 분량이며, 맨 위는 h2이고 그 위에서 `--padt`만큼 띄운다(`layout-v4.md`). 시스템에 없는 숫자는 새로 추가하지 않는다. 값이 없으면 토큰으로 만든다.
- **Splits**는 페이지에 하나뿐인 분할 쌍이다. 텍스트는 왼쪽, 비주얼은 오른쪽에 두고 위쪽 정렬한다(`.grid`를 쓰고, split에는 `.grid--middle`을 쓰지 않는다). 좌우를 뒤집지 않는다. 휴대폰에서는 텍스트가 먼저 온다.
- **Cards.** 카드, 패널, 바탕(ground), 그 위의 UI는 `cards.md`가 만든다. 깊이 규칙을 제외하면 `cards.md`가 이 문서의 내용보다 우선한다. 상자(box)는 최대 두 개까지만 쓴다. 패널에 UI가 들어가는 카드는 `.card--open`을 쓰거나(상자 없이 글은 페이지 바탕에 두고, 그 아래 패널은 네 모서리를 둥글게 한다), 패널을 가장자리까지 채운다(`.panel--flush`). 안쪽으로 들어간 패널에는 그림만 넣는다. 640에서 1023 사이에서는 패널이 있는 카드가 한 줄 전체를 차지한다. 1024에서 1279 사이에서는 패널이 있는 span-4 카드가 두 개씩 배치되므로, span-4 패널은 304px 아래로 줄어들지 않는다.
- **Grounds in frames (tech).** 페이지에는 효과(effect) 하나와 카드 그룹 하나의 정지 바탕(still grounds)만 있다(`effects-usage.md`). 아래 레시피에서 "the card ground"라고 하면 그 그룹에 배정된 id를 뜻하며, 패널마다 자체 seed를 가진다. "the effect"는 페이지의 효과 하나를 뜻하며, hero나 하나뿐인 `[data-visual]` 프레임에만 쓴다. 다른 모든 프레임은 밝은 바탕(`.frame--lit`) 그대로 두거나, 평평한 `--g-alt` 패널, 사진, 다이어그램을 쓴다. 제품, 서비스, place 프레임은 단색 바탕 위의 사진을 쓴다. 코드 바탕은 절대 쓰지 않는다.
- **Fragments**는 `assets/ui/<name>/fragment.html`에서 슬롯에 붙여 넣은 뒤 다시 쓴다. 모든 이름, 숫자, 주제, 앱, 로고를 고객의 것으로 바꾼다(`data-ui-load`에 키트의 샘플 텍스트가 있으며, 이는 초안용이다). `.stage` 안에 실제 크기(`meta.json`의 `size`, `fluid`)로 두고 절대 축소하지 않는다. 위치는 레시피가 정한 곳에 두며, 레시피에 없으면 `meta.json`의 `place`를 따른다. `.fit` 슬롯에는 최소 너비가 맞는 fragment만 넣는다(`cards.md`). 1024의 2x2 카드에는 324, span-4 카드에는 256이 기준이다. 가장자리 규칙(모든 가장자리에서 24px 여백을 두거나, 24px 이상 잘라내고 페이드 처리한다)은 1440, 1280, 1024, 768에서 모두 지켜야 한다. 맞을 때까지 `--ax`/`--ay`를 옮긴다. 휴대폰 카드에서는 cards.css가 각 fragment를 16px 안쪽에 배치하며, 위쪽은 `--ay-sm`(따로 설정하지 않으면 24px)에 둔다.
- **Motion.** Fragment는 완성된 최종 화면을 유지한다. 카드 그룹, split, 넓은 프레임 중 하나에만 반복 루프(`data-ui-loop`)를 두며, 일시정지 버튼을 함께 둔다. hero 아래에서는 한 화면에 루프가 두 개 이상 올라오지 않는다. 페이지를 스크롤했다는 이유만으로 움직이는 요소는 없다. 모든 타이밍은 `motion.md`를 따른다. 그 밖의 종류에는 루프를 두지 않는다.
- **Classes.** 시스템, cards.css, 키트의 클래스만 쓴다. 레시피에 클래스가 하나 더 필요하면 "page CSS"라고 적는다. 이는 비주얼 안에서만 쓰며, place의 방문 패널(`sections.md` 4절)에도 쓸 수 있다.
- **Photographs**는 제품, place, 서비스 페이지의 모든 주요 섹션을 연다. 고객이 준 사진을 쓰거나, 없으면 `photos.mjs`로 고른다(`photos.md`). 한 가지 분위기로 통일하고, 꾸밈 없이 보여 주며, 푸터의 한 줄에 출처를 표기한다. 사진 아래에는 캡션, 이름, 가격, 링크 줄을 달지 않는다. 판매 상품의 이름과 가격은 카드의 안쪽 여백에 둔다.
- **Names**(Ferrow, Rotaro, Kestrow, Ledgewick, Clausewise, Fenn, Halden 등)는 예시의 형태를 보여 주려고 지어낸 이름이다. 표기 방식만 따르고 단어 자체는 가져오지 않는다. 증거, 인용, 고객, 수치는 brief에서만 가져온다(`copy.md`).
- **Logo, buttons, links.** `.nav__logo`에는 고객의 SVG를 넣는다. 없으면 배정된 마크와 이름을 넣는다(푸터도 같다). 버튼은 `<html data-buttons>`에서 배정된 모양을 따른다. 내비게이션의 주요 동작은 `.btn.btn--primary`이며, 버튼 높이는 하나로 맞춘다(`system.md`의 Nav). 내비 단어, 버튼, 푸터 링크는 `#id`로 연결하고, 로고는 `#top`, Contact는 `#contact`로 연결한다. Privacy와 Imprint는 직접 작성한 페이지로 연결하거나 생략한다.

# 내비게이션

네 가지 모두 `system.md`의 바(bar)를 공유한다. 바는 고정되어 있고, 불투명하며, 높이 72px(휴대폰에서는 56px)에 1px 구분선이 있고, 깊이와 관계없이 같다. 패널은 마우스를 올린 뒤 150ms가 지나면 페이드와 6px 낙하 효과와 함께 열린다. 단어를 클릭하면 해당 섹션으로 이동하며, `preventDefault`는 쓰지 않는다. system.js가 휴대폰 시트, Esc, `aria-expanded`를 처리하므로 핸들러를 따로 작성하지 않는다.

## nav-mega

**역할과 용도.** 마우스 한 번이면 닿는 회사 지도다. 제품은 방문자가 원하는 것별로 묶고, 각 링크에는 이름과 회색 한 줄 설명을 붙이며, 최신 릴리스는 그림 카드 하나로 보여 준다. 기능 페이지가 6~12개인 소프트웨어나 제품군이 여러 개인 회사에 쓴다.

**1440에서.** `header.nav` > `.wrap.nav__bar`: 로고, 한 단어짜리 `.nav__link` 4~6개(펼쳐지는 링크에만 `.chev`를 붙인다), 그다음 `.nav__actions`에 Sign in(계정이 있는 앱에만 쓰는 일반 `.nav__link`)과 주요 버튼을 둔다. 메뉴는 항목의 `.nav__menu`이며, 바 아래 전체 너비로 펼친다. 그 안에 `.wrap.grid`를 두고, `.menu-col.span-3`을 두세 개 넣은 뒤, x 1360에서 끝나는 `a.menu-card.span-3` 하나를 둔다(열이 두 개면 `start-10`). 열은 `.t-label` 제목과 그 아래 링크 3~4개로 구성한다. 각 링크는 기능 이름과 30자 이하의 회색 한 줄 설명으로 이루어진다. 작은 메뉴(Resources, Company)는 같은 패널을 열되 평범한 열만 두고 카드는 두지 않는다.

**390에서.** 시스템의 시트를 쓴다. 행 높이는 56px다. 메뉴가 있는 단어를 탭하면 그 자리 아래에 링크가 펼쳐진다(system.js의 `.nav__expand`. 즉시 열리며 높이 애니메이션은 없다). 메뉴 카드는 평범한 행으로 두고, 두 버튼은 하단에 전체 너비로 둔다.

**카피.** 바의 라벨은 구매자가 쓰는 말로 된 평범한 단어 하나로 한다. 링크는 기능 이름(1~3단어)과 그 기능이 하는 일(3~7단어)로 구성한다. 예시는 Ferrow(물리치료 클리닉용 예약 및 메모 소프트웨어)다. 바는 Product, Clinics, Pricing, Resources, Company이다. Product에는 Front desk(Online booking / Patients book a free slot; Reminders / Texts before each visit)와 Treatment(Patient notes / Templates for every treatment)를 둔다. 카드는 New / Online payments / Take a deposit at booking이다. 예시 카피는 생성될 사이트의 언어인 영어 그대로 두었다.

**비주얼.** 메뉴 카드만 쓴다. 높이 160px의 `.panel`에 `.stage.stage--fade-br`을 넣고, 그 안에 `.at-corner` fragment 하나를 둔다(안쪽 24px). fragment는 오른쪽과 아래가 잘리게 하고, 최신 기능으로 다시 쓰며, 정지 상태로 밝은 바탕 위에 평범하게 둔다. 열에는 아이콘을 넣지 않는다.

**실수.** `.wrap`보다 좁은 바나 줄바꿈되는 링크, 평범한 링크에 붙인 chevron, 그리드를 벗어난 메뉴, 그림 카드를 하나 더 넣는 것, 30자를 넘는 회색 줄, 모호한 라벨("Solutions", "Platform")이 대표적이다.
## nav-cards

**역할과 용도.** 서로 다른 제품 두세 개를 각각 평범한 이름과 한 줄 설명이 붙은 그림 카드로 보여 주고, 자료는 평범한 링크 열로 보여 준다. 제품마다 화면이나 실제 사진이 있는 제품 두세 개를 가진 회사, 실제 작업물이 있는 서비스 라인 세 개를 가진 스튜디오, 또는 place의 제공 항목(사진 카드 네 개)에 쓴다.

**1440에서.** 바는 nav-mega와 같다. Product의 `.nav__menu`에는 `.wrap.grid`를 두고, 그 안에 `a.menu-card.span-4`(너비 410) 세 개를 넣는다. 각 카드에는 `.panel`(page CSS `.menu-card .panel { --p-h: 200px }`)을 두고, 그 안에는 `.stage.stage--fade-br`로 감싼 제품의 fragment `.at-corner`를 넣거나, 패널을 채우는 제품 사진을 넣는다. 제목은 `.t-card`에 두고, 카드 안에 52자 이하의 회색 한 줄을 붙인다. place에서는 384x288(4:3) 크기의 span-4 카드 세 개를 둔다. 각 카드에는 고객의 사진, 16/500 크기의 이름, "from" 가격을 넣는다. fragment, 바탕, 그림자는 넣지 않는다.

**390에서.** 시트에서 각 메뉴 카드를 행으로 보여 준다. 제목 아래에 한 줄 설명이 오고, 그림은 숨긴다.

**카피.** 카드 제목은 제품 이름이나 평범한 역할 이름으로 한다. 한 줄에는 그 제품이 하는 일을 쓴다. 예시는 Ferrow다. Online booking / Patients book a free slot from your website; Patient notes / Notes from your own templates.

**실수.** 세 카드에 같은 seed를 쓰는 것, 패널 높이가 서로 다른 것, 패널 위에 글을 얹는 것, 제목이 줄바꿈되는 것, 단독으로는 뜻이 통하지 않는 이름("Flow", "Pulse")을 쓰는 것이 대표적이다.

## nav-centre

**역할과 용도.** 가장 조용한 바다. 단어는 바의 가운데에 두고, 로고는 왼쪽 줄에, 주요 동작은 오른쪽 줄에 둔다. 평범한 단어가 네다섯 개인 소프트웨어나 서비스에 쓴다.

**1440에서.** `header.nav.nav--centre`를 쓴다. system.css가 `.nav__links` 묶음을 페이지 축의 가운데에 맞춘다. 로고와 동작은 `.wrap`의 양쪽 줄을 유지한다. 단어는 네다섯 개이며, 1024에서도 줄바꿈되지 않아야 한다. 메뉴는 nav-mega의 작은 메뉴와 같다.

**390에서.** 로고는 왼쪽, 토글은 오른쪽에 둔다. 시스템의 시트를 쓴다.

**실수.** 1024에서 묶음이 너무 넓어 로고나 버튼에 닿는 것, 링크가 두 번째 줄로 내려가는 것.

## nav-split

**역할과 용도.** 사람들이 찾아오는 place, 상점, 식당, 스튜디오에 쓴다. 이름은 가운데에, 짧은 단어 세 개는 왼쪽에, 주요 동작은 오른쪽에 둔다. 단어 하나(Rooms, Menu, Classes, Shop)를 누르면 제공하는 것을 사진 카드로 보여 주는 패널이 열린다.

**1440에서.** `header.nav.nav--split`을 쓴다. system.css가 링크를 왼쪽 3분의 1에, 로고(마크와 이름, 디스플레이 서체 28px)를 페이지 가운데 선에, 동작을 오른쪽 3분의 1에 둔다. 단어는 네 개를 쓴다. `system.md`의 Nav가 정한 네~여섯 개 중 낮은 쪽이며, 왼쪽 3분의 1을 함께 쓰기 때문이다. 1024에서도 단어가 줄바꿈되지 않아야 한다. 메뉴 단어의 `.nav__menu`에는 `.wrap.grid`를 두고, 그 안에 `a.menu-card.span-3`을 세 개 또는 네 개 둔다(place에서는 282x212, 4:3으로 네 개). 각 카드에는 고객의 사진(`img.frame__img`, effect 없음)을 넣고, 이름은 `.t-card`에, 가격 "from"은 카드 안에 둔다. 동작은 주요 버튼("Book a table")과, 고객이 실제로 제공하는 평범한 단어 하나를 최대로 둔다(판매하는 경우에만 Gift cards처럼). 없으면 아무것도 두지 않는다.

**390에서.** 로고는 왼쪽으로, 토글은 오른쪽으로 옮긴다. 시트를 쓴다(place는 시트 하단에 주소와 주간 영업시간을 더한다).

**카피.** 예시는 Fenn(라이프치히의 도예 스튜디오)이다. Classes(메뉴: Taster evening / from €39; Six-week course / from €260; Open studio / €18 a day), Shop, Studio, Visit을 두고, "Gift cards", "Book a class"를 쓴다.

**실수.** 세 등분이 균등하지 않아 로고가 가운데에서 밀려나는 것, 단어를 네 개보다 많이 두는 것, 메뉴 안에 UI fragment를 넣는 것, 링크를 두 번째 줄에 두는 것, 열린 패널에 그림자를 두는 것이 대표적이다.
# 히어로

10개의 hero와 place hero는 1440과 390에서의 수치와 함께 `layout-v4.md` 3절에 있다. 배정된 hero를 `assets/layout/hero-<id>.html`에서 붙여 넣고, 단어와 사진을 다시 쓴다. 레시피가 더하는 내용은 다음과 같다.

- **Copy**(`copy.md`): h1은 카테고리와 구매자 또는 place를 2~8단어로 밝힌다. 부제(sub-line)는 작동 방식과 주요 혜택을 15~30단어로 설명하며, 확실한 사실 하나를 담는다(place라면 오늘의 영업시간을 포함해 80자 이내). 주요 버튼은 동사와 목적어로 된 문구로 하며, 내비, 마무리 영역, 휴대폰 하단 바에 같은 문구를 그대로 쓴다. 조금 덜 강한 동작을 하나 둔다(place에는 없음). 예시는 Halden Dental(말뫼의 치과 클리닉)이다. "Dental clinic in central Malmö"; "Check-ups, cleaning and fillings from €95. Book online, most visits within a week."; "Book a check-up", "See prices".
- **Pictures**가 곧 작업물이다. 사용 중인 제품, place, 또는 사람들의 사진을 쓴다(제품, place, 서비스). 앱이라면 휴대폰을 쓴다(페이지 CSS로 만든 `.device` 280x570, 8px 베젤, 반경 32, 휴대폰 레이아웃의 fragment 하나, `role="img"`). 웹 앱이라면 창 하나를 쓴다(`.frame--split`에 `window`용 `.at-corner.to-edge` 56/56을 두고, 오른쪽 아래 모서리에 걸친 `cursor` 또는 `notify`용 `.at-over`를 둔다). 기술 제품이라면 제품의 실물을 쓴다(밝은 바탕에 `<div data-print="print-…">`, tech 전용). 앱 버튼은 "Download for iPhone"처럼 텍스트로 쓰며, 시스템 버튼 옆에 스토어 배지를 두지 않는다.
- **Window heroes**(`centred`, `collage`, 분할 창): fragment를 붙여 넣고 고객의 이름으로 다시 쓴다. 주요 fragment 하나는 반복 재생할 수 있고(tech이며 프레임의 일시정지 버튼을 쓴다), 두 번째 fragment는 정지 상태로 둔다. 조각은 두 개를 넘지 않으며, 기울이거나 확대하지 않고, 키트의 샘플 텍스트를 그대로 두지 않으며, 프레임 가운데에 fragment 하나만 떠 있게 두지 않는다.
- **The drawing**(`figure.drawing`, `starter.html`): 사진이 이미 제품을 보여 주는 페이지에서, 제품 사양 옆의 치수 도면으로만 쓴다. 측면도를 실제 비율의 인라인 SVG 하나로 그린다(1단위는 1mm, `viewBox`는 제품보다 6% 크게, `--ar`은 너비 대 높이). 치수선(`.dim`) 두세 개를 넣고, 수치는 `span.drawing__dim`으로 표시한다. hero로 쓰지 않으며, 제품의 유일한 사진으로도 쓰지 않는다. 하드웨어에는 쓰지 않는다(기술 제품은 사진이나 고객이 준 렌더를 보여 준다). 사진이 없는 페이지에도 쓰지 않는다. 그런 페이지는 제품 렌더를 보여 준다(`sections.md`, Product. 테스트 결과: 로봇 제작사의 hero로 그린 SVG 팔).

# 증거 (Proof)

증거는 brief에서 얻은 것만 쓴다. 실제 고객, 인용문, 리뷰, 언론 보도, 수치가 해당한다(`copy.md`). 증거가 없으면 빼고, 절대 지어내지 않는다.

## logo-row

**역할과 용도.** 제품을 쓰는 실제 기관들을 hero 콘텐츠 아래에 붙여 보여 준다(소프트웨어와 제품에만 쓴다). 로고를 보여 줘도 되는 실제 고객만 넣는다.

**1440에서.** hero의 하단 부착 행(`layout-v4.md`, 최대 96px)이다. `p.t-small.muted`(14px, 회색, 왼쪽 선에 두고 행 위 24px 간격)를 두고, 그다음 `.logos` 한 행을 x 80부터 1360까지 둔다. 로고는 최대 여섯 개이며, 높이는 28px이고, 각 로고는 고객이 준 SVG를 원래 색으로 쓴다(규칙 7, `icons.md`). 정지 상태여야 하며, 마퀴, 밝은 띠, 페이드, 타일은 쓰지 않는다. 로고는 절대 움직이지 않는다(MO-57).

**390에서.** 숨긴다. 다만 hero가 여전히 H - 24 - bar 아래에서 끝나면 보여 주며, 이때는 3열 그리드를 쓴다.

**카피.** 행 위의 한 줄에 누가 쓰는지 평범하게 적는다("Clinics using Ferrow").

**실수.** 고객이 아닌 곳의 로고나 지어낸 워드마크, 마퀴, 단색이나 흐리게 처리된 마크, 자랑하는 문구, 서비스나 place 페이지에 로고 행을 두는 것.

## quote-stat

**역할과 용도.** brief에 나온 실명 고객이 무엇이 달라졌는지 말하고, 그 옆에 이를 뒷받침하는 수치 하나를 둔다. 합친 상태에서 495px 아래로 줄어든다면 위 섹션에 합친다(`sections.md`).

**1440에서.** 위 섹션의 마지막 블록으로 두거나, 자체 `section.section.ground-surface`로 둔다. `.grid` 안에 `figure.quote.span-8`과 `div.stat-aside.span-3.start-10`을 같은 윗줄에 둔다. `blockquote`는 28px이며 40단어 이하다. 그 아래 32px 간격으로 `div.person`을 둔다(`figcaption`이 아니라 `div`). 사람의 40px 사진(인용문에는 얼굴이 필요하다) 또는 회사 로고를 넣고, 이름을 쓴 뒤 그 아래에 역할과 회사를 쓴다. 수치는 `p.t-stat`(1440에서 38, 390에서 28)이며, 여덟 단어 이내의 회색 한 줄을 붙인다.

**390에서.** 인용문, 사람, 그다음 수치 순서로 둔다. 수치 위에는 1px 구분선과 24px 간격을 둔다.

**카피.** 전과 후의 변화를 쓰며, 칭찬하는 단어는 쓰지 않는다. 예시 형태: "We used to rebuild the rota every Sunday night. Now it takes twenty minutes on Friday." / name, role, home / "20 min", "to plan a week of shifts".

**비주얼과 모션.** 정지 상태다. tech에서는 페이지의 효과가 하나뿐일 때만 그 효과(`fx-stat`)로 수치를 채울 수 있다.

**실수.** brief에 없는 인용문, 스톡 사진이나 빠진 초상 사진, 구호일 뿐인 수치, 숫자가 올라가는 카운트업.

## customer-proof-row

**역할과 용도.** brief에서 가져온 실명 고객 세 곳을 각각 측정한 결과 하나와 함께 보여 준다. B2B 소프트웨어, 스튜디오, 기업에 파는 제품에 쓴다.

**1440에서.** `.section-head.section-head--row`: 왼쪽에 h2, 오른쪽 아랫줄에 `a.link` "All customer stories"를 둔다. 48px 아래에 `article.card.span-4`를 세 개 둔다. 각 카드에는 고객의 로고(높이 28px의 `img`)나 이름(`p.t-card`)을 넣는다. 24px 간격 뒤에 스토리 제목(한 줄, 7단어 이하), 한 줄 설명, `a.link` "Read the story"를 둔다. 그다음 `.panel.panel--flush`를 두고, `.stage.stage--fade-br` 안에 `stat`용 `.at-corner.to-edge`(`--ax: 24px; --ay: 40px`, `data-ui-opts='{"fill":true}'`)를 넣는다. 이 fragment는 오른쪽과 아래가 잘리게 하며, 수치와 변화량이 보이게 한다. 서비스나 스튜디오라면 대신 각 고객 작업물의 사진이 패널을 채운다.

**1024에서 1279 사이.** 카드 두 개를 먼저 두고, 세 번째 카드는 줄 전체에 걸쳐 둔다. **768과 390.** 한 열로 둔다.

**카피.** 제목은 누가 무엇을 했는지 쓴다. 수치는 세는 대상(28자 이하), 정수, 변화 칩 "Before x · After y"로 쓴다.

**모션.** Tech: 첫 번째 카드의 수치만 반복 재생하고, 나머지 두 카드는 정지 상태로 둔다.

**실수.** brief에 이름이 없는 고객, 개수 대신 쓰는 백분율, 캐러셀, 카드를 인용문 카드로 바꾸는 것.
# 기능 (Features)

## product-statement

**역할과 용도.** 제품이 무엇이고 무엇이 다른지 평범한 문단 하나로 설명한 뒤, 세 가지 사실과 함께 넓은 그림 하나로 제품을 보여 준다. 제품에 쓰며, place에는 쓰지 않는다. 같은 너비의 hero 프레임 바로 뒤에는 두지 않는다.

**1440에서.** `span-8`에 설명을 둔다. h2(48px, 4줄 이하), 첫 문장은 진한 글자(ink)로, 나머지는 `<span class="muted">`로 쓴다. 48px 아래에 `span-12`의 `.frame.frame--hero`를 둔다(page CSS `aspect-ratio: 2 / 1`). 여기에는 오려낸 사진을 가운데에 두고, 모든 가장자리에서 최소 64px 떨어뜨린다. 다시 48px 아래에 `span-4`로 사실 세 개를 둔다. 각 사실은 1px 구분선, 단위가 붙은 28px 값, 회색 한 줄로 이루어진다. 기술 제품이라면 사진 대신 고객의 렌더나 같은 종류의 실물을 보여 줄 수 있다(`.frame--lit`에 `<div data-print="print-…">`를 넣고, `hero` 프리셋을 크게 해서 가운데보다 오른쪽에 두며, 사실은 왼쪽 아래의 `div.frame__text`에 둔다). 사진이 없는 제품이나 하드웨어는 같은 방식으로 제품 렌더(`data-product`, place `stage`)를 보여 준다. 바탕은 페이지의 단색 바탕을 쓰며, 하드웨어에서는 밝은 바탕을 쓴다(`sections.md`, Product. `effects-objects.md`, Product renders).

**390에서.** h2는 30px. 프레임은 정사각형으로 두고, 사실은 그 아래에 목록으로 둔다.

**카피.** 예시는 Pellum(책상 램프)이다. "Pellum lights a whole desk without glare. <grey>One dial dims it and turns it from warm light to daylight.</grey>". 사실은 "1,100 lm" Brightness, "2,700 to 6,500 K" Colour, "9 W" Power다.

**모션.** 오려낸 사진은 움직이지 않는다. 기술 제품의 실물이라면 천천히 돌고, 포인터에 반응하는 페이지의 효과를 쓰며, 자체 일시정지 버튼을 둔다.

**실수.** 구호, 두 번째 문단에 넣은 회색 부분, 상자 안에 있거나 가장자리에 닿은 오려낸 사진, 고객이 파는 제품 종류와 맞지 않는 실물, 주장에 불과한 사실.

## features-2x2

**역할과 용도.** 제품이 무엇을 하는지 한 화면에 보여 준다. 비중이 같은 기능 네 개를 각각 작은 작업용 비주얼과 함께 둔다(2x2. 제목, 두 줄 설명, 그 위에 더 작은 카드가 올라간 안쪽 패널). 기능 하나가 더 중요하다면 bento를 쓴다.

**1440에서.** `.section-head`에 h2를 두고, 옆으로 이어지는 회색 글자를 붙인다. 48px 아래에 `.grid`를 두고, 그 안에 `article.card.card--row.span-6`을 네 개 둔다. 상자는 두 겹까지 쓴다. 밝은 페이지에서는 `.card--open`을 쓴다(제목과 줄은 페이지 바탕에, 그 아래에 패널). 어두운 페이지에서는 카드 상자에 `.panel.panel--flush`를 쓴다(x.ai의 카드). 각 카드는 제목, 진한 글자 두 줄(16~20단어), 그다음 패널로 구성한다(page CSS `#<section> .panel { --p-h: 336px }`). 패널에는 `.stage.stage--fade-b`를 두고, 그 안에 붙여 넣은 fragment 하나를 둔다.
- `chat`은 `.at-rise.fit`을 쓴다(`--fit-max: 400px; --ax: max(24px, 50% - 200px)`, `--ay`와 `--ay-sm`은 56px). 아래로 24px 이상 잘리게 한다. `search`나 `stat`도 같은 방식이며 `.to-edge`를 붙인다(`stat`에는 `data-ui-opts='{"fill":true}'`).
- 짧은 스택(`notify`는 제목 26자 이하, `checklist`, `integrations`)은 `.at-rise.fit`을 낮게 둔다. `--ay`와 `--ay-sm`은 `calc(100% - 180px)`이며, 마지막 행은 잘리게 한다.
- `toggles`는 `.at-right.to-edge`(`--ax: 32px; --ay: 56px`)를 쓰며, 아래가 잘리게 한다.
- `window`(`{"compact":true}`)는 `.at-corner` 24/28을 쓰며, 앱 이름과 상태를 표시하는 바가 있는 `.panel--device`에 가장자리까지 채워 둔다.
- 다이어그램 카드(`diagrams.md`): `<div class="dg" data-diagram="<preset>">`로 패널을 채운다.
`calendar`는 쓰지 않는다(월 전체가 보여야 한다). `doc`나 `code`도 쓰지 않는다(1024에서 324px 슬롯보다 넓다).

**1024에서.** 패널은 너비 372다. `.fit` fragment는 324로 좁히고, 나머지는 잘린 상태를 유지한다. **768과 390.** 행마다 카드 하나씩 둔다. 각 fragment는 자체 레이아웃에서 모서리에 둔다.

**카피.** h2는 12단어 이하에 회색 부분을 붙인다. 제목은 동사와 구체적인 대상으로 한다. 줄은 구체적인 세부 사항 하나를 담은 한두 문장으로 한다. 카드에는 버튼을 두지 않는다. 예시는 Ferrow다. "Run your practice from one app. <grey>Bookings, notes and payments.</grey>"; "Takes online bookings", "Takes card payments", "Builds treatment plans", "Sends text reminders".

**비주얼.** Tech: 카드 바탕(패널마다 seed 하나, `data-fx-params='{"drift":0}'`, system.js가 조명을 준다). fragment나 다이어그램은 네 개를 각각 다르게 둔다. 앱을 명시한 경우에는 실제 앱 아이콘을 쓴다. 제품이나 서비스라면 각 기능의 사진으로 패널을 채운다.

**모션.** Tech: 첫 번째 카드의 fragment나 다이어그램이 반복 재생된다(`data-ui-loop`). 나머지는 정지 상태이며, 포인터가 해당 카드에 머무는 동안에만 재생한다. 링크된 카드는 2px 떠오른다.

**실수.** 스크롤에 따라 움직이는 카드, 줄이 맞지 않는 패널, 네 번째 줄의 글, 키트의 샘플 텍스트, 명사형 제목("Peace of mind"), 세 겹의 상자, 가운데에 떠 있는 위젯, fragment 아래에 남은 1~23px 두께의 바탕 띠.

## bento

**역할과 용도.** 주요 기능 하나는 크게, 나머지 네 개는 작게 보여 준다. 대표 기능이 하나인 소프트웨어나, 주요 부분의 실제 사진과 네 가지 세부 사항이 있는 제품에 쓴다.

**1440에서.** `.grid`를 쓴다. 첫 줄에는 `article.card.card--row.span-8`과 `.span-4`를 두고, 둘째 줄에는 `.span-4`를 세 개 둔다. 모든 카드에는 제목, 진한 글자 두 줄, 그다음 패널을 둔다. 상자는 features-2x2처럼 두 겹까지 쓴다. 그룹 전체의 `--p-h`는 하나(336px)로 맞춘다. 넓은 카드에는 `window`용 `.at-corner`(40/48, 오른쪽과 아래가 잘리게, `.stage--fade-br`)를 쓰거나, `files`용 `.at-corner.wide`(`--w: 680px`)를 쓴다. 작은 카드(1440에서 패널 너비 347, `.fit` 슬롯 256)에는 아래가 잘린 fragment 하나를 둔다. 256으로 좁혀지는 것은 가운데에 두고 `.at-rise.fit`을 쓴다(`chat`, `search`는 `.to-edge`, 짧은 스택은 낮게). `toggles`는 `.at-right.to-edge`를 쓴다. 더 넓은 것(`stat`, `notify`, `cursor`)은 실제 너비 그대로 `.at-corner`(`--ax: 24px; --ay: 40px`)를 쓰며, 오른쪽과 아래가 잘리게 한다. `voice` 호출은 `meta.json`이 지정한 곳에 두고, 그 그룹의 루프로 쓴다.

**1024에서 1279 사이.** 넓은 카드는 줄 전체에 걸쳐 두고, 작은 네 카드는 두 개씩 두 줄로 배치한다. **768과 390.** 행마다 카드 하나씩 둔다.

**카피.** 넓은 카드는 주요 기능을 동사와 대상으로 쓴다. 작은 카드는 2~4단어로 쓴다. 예시는 Ledgewick(프리랜서 디자이너를 위한 장부 관리)이다. "Reads every receipt" / "Drop in PDFs or phone photos. The date, amount and VAT are filled in."; 작은 카드는 "Matches bank payments", "Tracks VAT", "Sends invoices", "Exports for your accountant".

**비주얼.** features-2x2와 같다. 제품이라면 모든 패널에 사진을 쓰고, 분위기는 하나로 맞춘다.

**모션.** Tech: 넓은 카드가 반복 재생되고, 작은 네 카드는 정지 상태다. bento 하나에 루프를 두 개 두지 않는다.

**실수.** 카드마다 글의 위치가 다른 것, 작은 카드의 카피가 두 줄을 넘는 것, 작은 카드에 `calendar`, `doc`, `code`를 두는 것, 다른 카드 그리드 옆에 bento를 두는 것.

## split-text-left

**역할과 용도.** 제품이 하는 일 하나를 몇 문장과 사실 세 개로 설명하고, 그것을 정확히 보여 주는 그림을 옆에 둔다. 소프트웨어, 제품, 스튜디오에 가장 많이 쓰는 레이아웃이다.

**1440에서.** `.grid`를 쓰고 위쪽 정렬한다. 텍스트는 `span-5`에 둔다(h2, 24px 간격, 20px 크기의 두세 문장, 24px 간격, 평범한 줄로 된 짧은 사실 최대 세 개, 24px 간격, `.link` 하나). 그림은 `.frame.frame--split.span-6.start-7`(5:4, 휴대폰에서는 정사각형)을 쓰고, 그 안에 `.stage.stage--fade-br`을 둔다. 주요 조각은 아래가 잘리게 하며, 네 면이 모두 바탕에 둘러싸여 떠 있지 않게 한다.
- `window`나 고객이 준 스크린샷은 `.at-corner.to-edge`를 쓰며, `--ax`/`--ay`는 56px이다. 오른쪽과 아래가 잘리게 한다. `files`도 같은 방식이며 `.wide`(`--w: 680px`)를 붙인다.
- 더 좁은 조각(`doc`, `code`, `chat`, `search`, `checklist`)은 `.at-rise.to-edge`를 쓰며, `--w`로 가운데에 맞추고 위에서 56px 아래에 둔다. 짧은 것(`slider`, `toggles`)은 `.at-rise.fit`을 쓰며 40px 아래에 두고, 두 번째 행 아래에서 잘리게 한다.
결과를 보여 주는 작은 조각(`cursor`, `notify`)은 `window`나 스크린샷 위에만 올린다. `.at-over`를 쓰며 오른쪽 아래 모서리에 걸치게 한다(`--bx: 24px; --by: -40px`). 첫 행 위에는 올리지 않는다(제품 UI 위에 작은 카드가 얹힌 Figma 패널).
제품이나 서비스라면 프레임에는 텍스트가 설명하는 부분이나 작업의 사진을 넣는다(`.frame--photo`, 628x471). UI는 넣지 않는다.

**1024에서 1279 사이.** 프레임 너비는 436~564다. 주요 조각만 둔다. **768과 390.** 텍스트를 먼저 두고, 프레임은 48px 아래에 전체 너비로 둔다.

**카피.** 제목은 역할과 그 결과로 쓴다. 문장은 그림이 진행되는 순서대로 쓴다. 예시는 Clausewise(소규모 법률 사무소를 위한 계약서 검토)다. "Finds risky clauses in contracts"; "Upload a contract and every clause is checked against your firm's playbook."; 링크 "See how review works"; 아래에서 `doc`이 올라오며 "unlimited liability"가 표시된다.

**비주얼.** Tech: 이 프레임이 페이지의 `[data-visual]`이면 효과를 쓰고, 아니라면 밝은 바탕을 평범하게 쓴다. 주요 조각은 텍스트의 단계를 차례로 보여 주고, 작은 조각은 결과물을 보여 준다.

**모션.** Tech: 루프 하나를 작은 조각이나 주요 조각 중 한쪽에만 둔다.

**실수.** 텍스트와 프레임의 위쪽 정렬이 맞지 않는 것, 네 줄짜리 h2, 텍스트가 말하지 않는 것을 보여 주는 그림, 링크 하나 대신 버튼 쌍을 두는 것, 반대쪽에 두 번째 split을 두는 것.

## tabs-tour

**역할과 용도.** 소프트웨어에만 쓴다. 작업 세 개에서 여섯 개를 한 번에 하나씩, 움직이지 않는 프레임에서 보여 준다. 클릭으로만 전환하며, 시간에 맞춰 바뀌지 않는다.

**1440에서.** `.grid`를 쓰고 위쪽 정렬한다. 왼쪽 `span-5`에는 `.section-head`(h2, 회색 한 줄)를 두고, 이어서 `div.tabs[role=tablist]`에 `button.tab[role=tab]`을 3~6개 둔다. 각 버튼에는 `aria-controls`로 `[role=tabpanel]`(두 문장과 `.link`)과 화면(`aria-controls="tab-1 screen-1"`)을 연결한다. 오른쪽에는 `.frame.frame--split.span-6.start-7`을 두고, 그 안에 `.stage.stage--fade-br`을 둔다. 탭마다 슬롯 하나를 두며, 첫 번째를 제외한 나머지는 `hidden`으로 둔다. 각 슬롯은 split-text-left의 주요 조각처럼 배치하고, 아래가 잘리게 한다. 모든 패널은 높이를 하나로 고정해서 프레임 크기가 바뀌지 않게 한다. system.js가 탭의 패널과 화면을 함께 보여 준다.

**390에서.** 탭은 여러 행으로 줄바꿈한다(가로로 넘기는 한 줄은 쓰지 않는다). 프레임은 활성 패널 아래 48px에 둔다.
**카피.** 탭 라벨은 동사와 대상으로, 2~3단어에 문법을 하나로 맞춘다. 예시는 Ferrow다. "Book a session", "Move an appointment", "Pay by card", "Follow exercises".

**모션.** 클릭하면 표시기가 미끄러지듯 이동한다(`motion.md`). 보이는 화면만 반복 재생한다.

**실수.** div로 만든 탭, 명사형 라벨, 크기가 바뀌는 프레임, 두 탭에 같은 fragment를 쓰는 것, 제품, 서비스, place 페이지에 탭을 두는 것.

## chapter

**역할과 용도.** 기능 영역 하나를 깊이 설명한다. 문단 하나, 링크 하나, 제품이 그 일을 하는 넓은 프레임, 기능 이름 네 개로 구성한다. 플랫폼이라면 같은 형식을 두세 개에서 네 개까지 연달아 쓴다. 챕터 시리즈는 인접한 챕터들이 레이아웃을 공유하는 유일한 경우다. 보통 두 화면 분량의 섹션(`.g2`)이다.

**1440에서.** `.grid`를 쓰고 위쪽 정렬한다. `span-5`에는 h2를 두고, `span-6 start-7`에는 `.link`를 붙인 회색 문단(약 25단어)을 둔다. 64px 아래에 `.stage`(16:7)를 넣은 `.frame.frame--hero`를 둔다. 영역의 주요 화면(`window`, `code`, `doc`, `files`)은 `.at-rise.to-edge`를 쓰며 64px 아래에 둔다. 핵심 동작 하나(`cursor`, `notify`, `stat`, `search`)는 `.at-over`를 쓰며 오른쪽 가장자리에 둔다. 48px 아래에는 `div.span-3` 네 개를 둔다. 각각 기능 이름과 회색 한 줄로 이루어진다.

**390에서.** 텍스트를 먼저 둔다. 정사각형 프레임에는 주요 화면을 유지하고, 네 개의 이름은 목록으로 둔다.

**카피.** 예시는 Kestrow(운송 회사를 위한 화물 예약)다. "Book loads in one place"; "See every load your customers send, quote it and book a truck from one screen."; 이름은 "Imports orders" / "From email or a CSV file"이다.

**모션.** 챕터마다 루프를 하나씩 둔다. 시리즈에서는 챕터 하나씩 건너뛰며 루프를 둔다. 스크롤로 드러나거나 되감기는 요소는 없다.

**실수.** 반투명하거나 기울어진 fragment, 주요 화면에서 읽을 수 있는 유일한 행을 가리는 동작, 템플릿을 바꿔 가며 반복하는 것.

## app-frame

**역할과 용도.** Linear, Cursor, Vercel이 보여 주는 방식처럼 제품 자체를 크게 보여 준다. `.wrap` 너비에 걸쳐 실제 앱 창 하나를 두고, 열린 항목 옆에 목록을 두며, 앱 고유의 크롬(chrome)을 그대로 쓴다. 모든 소프트웨어 페이지에는 hero나 처음 세 섹션 안에 이것이 있어야 한다. (테스트 결과: 세이지 패널 가운데에 작은 diff 카드 하나만 둔 코드 리뷰 페이지는 Linear보다 약 3.5점 낮게 평가되었다. Linear는 리뷰 띠에서 풀 리퀘스트 목록을 전체 너비 diff 옆에 놓고 한 앱 프레임에 담았다.) 게임, 제품, 서비스, place에는 쓰지 않는다.

**두 개의 패널**(키트 fragment이며 고객의 이름으로 다시 쓴다. 목록은 항상 `window`다):

| 제품 | 목록 패널 | 열린 패널 |
|---|---|---|
| 코드 리뷰 | `window`: 풀 리퀘스트 | `diff-review`(상단 250px에 댓글과 Apply) |
| 고객 지원, 받은편지함, CRM, 에이전트 | `window`: 대화 | `chat`(열린 스레드) |
| 문서, 계약서, 지식 | `window`: 문서 | `doc`(표시된 문구가 있는 페이지) |
| CI, 배포 | `window`: 실행 | `pipeline-board`(넓은 형식: 노드와 로그) 또는 `terminal-run` |
| 예약, 일정 | `window`: 예약 | `calendar` |

`window`의 행은 다음과 같이 구성한다. `.ui-win__who`에는 사람(작성자, 고객, 담당자)을, `.ui-win__sub`에는 항목과 세부 내용("Retry settle jobs · +4 −3")을 넣는다. 상태 칩에는 제품 고유의 상태(`data-open`, `data-work`, `data-done`)를 쓴다. 사이드바 라벨은 각각 단어 하나로 한다. 행은 9개 이상 쓰고, 열린 항목에도 두 패널이 모두 프레임 아래를 넘을 만큼 줄을 충분히 넣는다(diff라면 24줄 이상). 프레임은 페이드 아래에서 잘라내며, 마지막 행 아래에 빈 패널 띠가 남는 일은 없어야 한다.

**1440에서.** 한 화면으로 구성한다. `.grid`를 쓰고 위쪽 정렬한다. `span-5`에는 h2를, `span-6 start-7`에는 `.link` 하나를 붙인 회색 문단(약 25단어)을 둔다. 48px 아래에 프레임이 화면의 나머지를 `.fill`로 차지한다(약 1280 x 550).

```html
<div class="ui app fill" role="img" aria-label="[what the window shows]" data-ui-pause-host>
  <div class="app__pane app__pane--list"> [window fragment] </div>
  <div class="app__pane app__pane--open" data-ui-loop> [the open item's fragment] </div>
</div>
```

`class="ui"`는 프레임에 키트의 토큰을 부여하고, 검사 도구에 이것이 그려진 창 하나임을 알려 준다. 페이지 CSS(레시피 전체)는 다음과 같다.

```css
.app.ui { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); margin-top: var(--s-7); background: var(--u-bg); border: 1px solid var(--u-border); border-radius: var(--u-r); box-shadow: var(--u-shadow); }
.app > .app__pane { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
.app > .app__pane + .app__pane { border-left: 1px solid var(--u-line); }
.app > .app__pane > .ui-panel { width: 100%; border: 0; border-radius: 0; box-shadow: none; }
.app > .app__pane::after { content: ""; position: absolute; inset: auto 0 0 0; height: 64px; background: linear-gradient(transparent, var(--u-bg)); pointer-events: none; }
@media (min-width: 1024px) and (max-width: 1279px) { .app.ui { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); } }
@media (max-width: 1023px) {
  .app.ui { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
  .app > .app__pane--list { max-height: 252px; }
  .app > .app__pane--list::after { display: none; }
  .app .ui-win__side { display: none; }
  .app .ui-win__body { grid-template-columns: minmax(0, 1fr); }
  .app > .app__pane + .app__pane { border-left: 0; border-top: 1px solid var(--u-line); }
}
@media (max-width: 639px) {
  .app.ui { grid-template-rows: minmax(0, 1fr); }
  .app > .app__pane--list { display: none; }
  .app > .app__pane + .app__pane { border-top: 0; }
}
```

`window`는 자기 패널에 맞춰 스스로 배치한다(1440에서는 이름 위에 항목이 쌓인 행, 태블릿에서는 열). fragment는 자연스러운 높이를 유지한다. 잘라내는 것은 패널이고, fragment 자체의 상자는 잘리지 않는다. 상자는 하나만 쓴다. 프레임이 곧 창이고, 패널은 그 창의 열이다. 뒤에 패널, 카드, 바탕을 두지 않는다(섹션의 바탕 위에 놓으며, `dark-band`에서는 키트의 어두운 표면을 쓴다). 그 위에 올리는 두 번째 조각(`cursor`, `notify`)은 열린 패널의 오른쪽 아래에만 `.at-over`로 올리며, 목록 위에는 올리지 않는다.

**1024에서 1279 사이.** 목록은 4열로 좁아지고(사이드바는 사라진다), 열린 항목은 8열을 차지한다. **768에서 1023 사이.** 목록을 위에 두고(바, 열 제목, 온전한 행 네 개, 252px), 그 아래에 열린 항목을 섹션 하단까지 둔다. **390에서.** 열린 항목만 두고, 크롬은 자체 헤더를 쓴다.

**카피.** h2에는 창이 보여 주는 것을 적는다("Every pull request, reviewed in one place"). 문단에는 창이 보여 주는 순서대로 단계를 적는다.

**모션.** 루프는 하나다. 열린 항목의 패널에 `data-ui-loop`를 둔다(Apply가 눌리고 답변이 써지는 장면). 목록은 정지 상태다. 창 안에서 스크롤되는 것은 없다.

**실수.** 밝은 패널 위에 열린 항목만 두는 것(그것은 제품이 아니라 카드다). 목록과 항목을 바탕을 사이에 두고 상자 두 개로 나란히 두는 것. 빈 흰색으로 끝나는 패널. 키트의 샘플 행. 패널 높이에 맞춰 늘린 fragment(그러면 자체 overflow가 텍스트를 잘라낸다).

## steps

**역할과 용도.** 제품을 쓰는 순서를 단계별로 보여 주고, 각 단계의 결과를 함께 보여 준다. 실제 단계가 세 개일 때만 쓴다.

**1440에서.** `.section-head`를 두고, 그다음 `.grid`에 `article.card.card--row.span-4`를 세 개 둔다. 각 카드에는 `span.step-num`, 제목(동사와 대상, 한 줄), 진한 글자로 된 한두 줄, 그다음 패널을 둔다. 상자는 두 겹까지 쓴다(336px. 서비스라면 그 단계의 사진이 패널을 채운다). fragment는 bento의 작은 카드처럼 하나씩 배치한다. `calendar`, `files`, `doc`, `cursor`는 쓰지 않는다. 카드 사이에 화살표나 선을 두지 않는다.

**1024에서 1279 사이.** 카드 두 개를 먼저 두고, 세 번째는 줄 전체에 걸쳐 둔다. **768과 390.** 한 열로 둔다.

**카피.** 제목에 단계 수를 넣는다. 예시는 Ledgewick이다. "Set up Ledgewick in 3 steps"; "Upload your receipts" / "Drop in PDFs or phone photos."; "Check the matches" / "You confirm the few it is unsure about."

**모션.** Tech: 첫 카드만 루프를 돌고, 나머지는 정지 상태다. 연쇄나 시차 애니메이션은 쓰지 않는다.

**실수.** 화살표나 계단식으로 배열된 카드, 지나치게 큰 디스플레이 숫자, 높이가 다른 패널.

# 사진, 공간, 서비스, 사람 (Photographs, rooms, services and people)

## photo-band

**역할과 용도.** 페이지의 미디어 섹션이다(리듬 `media-band`, 제품과 서비스용이며 place에는 쓰지 않는다). 화면 전체에 깔리는 사진 하나를 섹션의 바탕 층으로 쓰고, 사진의 차분하고 어두운 부분에 헤드라인을 둔다.

**1440에서.** `main` 안에 `section.photo-band.photo-band--bleed`를 두고 한 화면을 채운다. `img`가 바탕 층이다. 그다음 `.wrap` 안에 `div.photo-band__text`를 둔다. h2는 여덟 단어 이하, 한 줄로 하며, 필요하면 `.link`를 붙인다. 사진에서 차분한 쪽에 둔다(`--left`, 또는 밝은 크롭에 어두운 글자를 쓰는 `--light`). 스크림, 그라데이션, 상자는 쓰지 않는다. 음소거된 영상(tech 전용)은 일시정지 버튼과 함께 재생한다.

**390에서.** 차분한 영역이 있는 휴대폰용 크롭 사진을 쓰거나, 그 아래 바탕 위에 글을 둔다.
**카피.** 예시는 Brinwood(포르투에서 만드는 스탠딩 데스크)다. "Built to order in Porto"; "Each desk is cut, oiled and tested in our workshop before it ships."

**실수.** 한 페이지에 띠 두 개를 두는 것. 피사체나 복잡한 영역 위에 글을 얹는 것. hero의 사진을 다시 쓰는 것.

## photo-pair

**역할과 용도.** 사진 두 장을 나란히 둔다. 안과 밖, 세부와 전체, 작업 사례 두 개가 해당한다. 무거운 섹션 사이에 놓는 밝은 섹션이다.

**1440에서.** h2와 그 위의 한 줄을 두고, 그다음 `.grid`에 `span-6`으로 사진 두 장을 둔다. 비율은 4:5 또는 4:3이며, 한 가지 비율과 한 가지 밝기로 맞춘다. 사진 아래에는 아무것도 두지 않는다. 사진이 보여 주는 내용은 위의 한 줄에서 설명한다.

**390에서.** 한 열로 둔다.

**실수.** 서로 다른 조명의 사진 두 장, 사진 아래의 캡션이나 제목, 세 장 이상(세 장이면 한 줄에 세 장을 배치한다).

## line-up

**역할과 용도.** 제품의 모델이나 사이즈를 그림을 먼저 보여 주고, 각각에 "from" 가격을 붙여 구매자가 고를 수 있게 한다(좋은 제품 사이트 15곳 중 8곳이 범위를 앞부분에 보여 준다).

**1440에서.** `.section-head.section-head--row`(h2 "Three sizes", `.link` "Compare sizes")를 두고, 그다음 `.grid`에 `a.tile.span-4`를 세 개 둔다(네 개라면 `span-3`을 네 개). 각각 카드 하나다. 위에는 `--g-alt` 위의 오려낸 사진(`object-fit: contain`, 안쪽 32px)을 두거나, 한 각도에서 찍은 사진을 둔다. 그 아래 카드 안쪽 여백에는 `h3` 이름, "from €1,290", 그리고 한 줄의 사양("Top 140 x 70 cm · 65 to 130 cm")을 둔다.

**390에서.** 한 열로 두며, 165px 너비로 두 열을 쓰기도 한다.

**비주얼.** 모든 모델을 하나의 배율과 하나의 배경, 또는 하나의 카메라 각도로 보여 준다. 기술 제품은 사이즈별로 고객의 렌더를 보여 줄 수 있다. 모든 모델의 사진이 없는 line-up은 쓰지 않는다.

**실수.** 체크 표시와 추천 배지가 있는 요금제 카드, 월 단위 가격, 서로 다른 각도와 배율을 섞는 것.

## rooms-list

**역할과 용도.** 임대하는 방, 오두막, 스튜디오에 쓴다. place라면 방은 `sections.md` 4절을 따른다(Rooms: 타일, 행, 또는 옆). 방이 있는 서비스나 제품(공유 오피스 등)은 같은 타일을 쓴다. 방 전체를 담은 4:3 사진, 이름, 사양, 시즌과 함께 표시한 "from" 가격, "Book this room"을 넣는다.

**실수.** 체크 표시나 배지가 있는 요금제 카드 형태의 방 목록, 사진 대신 들어간 달력, 시즌 없이 적힌 가격, 좌우로 번갈아 놓인 방.

## services-list

**역할과 용도.** 병원, 사무소, 업종이 제공하는 서비스를 보여 준다. 각 서비스에는 한 줄 설명과 "from" 가격을 붙인다. 작업 사진 하나 옆에 목록을 두며, 아이콘 카드 그리드는 쓰지 않는다.

**1440에서.** `.grid`를 쓰고 위쪽 정렬한다. `span-5`에 h2, 한 줄, `ul.rows`를 둔다(서비스마다 `span.rows__name`, `<p>` 한 줄, `span.rows__value` "from €95"를 두며, 목록 아래에 `.link`를 둔다). 사진은 `span-6 start-7`에 둔다(`.frame.frame--photo`, 4:5 또는 4:3).

**390에서.** 텍스트와 목록을 먼저 두고, 사진은 그 아래 48px에 둔다.

**카피.** 예시는 Halden Dental이다. "Check-up and clean" / "Every six months, 40 minutes" / "from €95".

**실수.** 서비스를 아이콘 카드로 두는 것, 가격이 빠진 것, 여덟 행을 넘는 것(페이지로 연결한다).

## peek-list

**역할과 용도.** 사진 한 장 옆에 짧은 목록을 두고, 포인터가 올라가거나 포커스가 가거나 탭한 행에 따라 사진이 바뀌게 한다. 스튜디오의 방, 클리닉의 치료, 빵집의 빵 종류 등에 쓴다. 행마다 자체 사진이 있어야 하며, 사진이 더 적다면 services-list를 쓴다.

**1440에서.** `starter.html`의 `peek-list`다. `.grid[data-peek]`를 쓰고 위쪽 정렬한다. `span-5`에는 `ul.rows`를 두고, 그 안에 `li[data-peek-to][tabindex="0"]`을 세 개에서 여섯 개 둔다(이름은 진한 글자의 한 줄, 값은 오른쪽). `span-6 start-7`에는 사진 프레임을 두고, 행마다 `img.frame__img[data-peek-for]` 하나를 넣는다(첫 번째를 제외하고 모두 `hidden`, 지연 로딩은 없다). system.js가 사진을 바꾸며(다른 종류는 즉시, tech는 200ms 페이드), 보이는 행을 표시한다.

**768과 390에서.** 목록을 먼저 두고, 사진은 그 아래 48px에 둔다. 행을 탭하면 사진이 바뀐다.

**실수.** 자체 사진이 없는 행, 같은 사진을 두 번 쓰는 것, 사진 위의 캡션, 여섯 행을 넘는 것, 목록을 오른쪽에 두는 것.

## people-row

**역할과 용도.** 고객이 만나게 될 사람들을 한 명당 초상 사진 하나씩 보여 준다. 서비스나 작은 제작자에게 쓰며, brief에 있는 실제 팀만 보여 준다.

**1440에서.** `.section-head`를 두고, 그다음 `.grid`에 `.tile.tile--portrait.span-3` 카드 네 개를 둔다. 위에는 초상 사진(4:5)을 두고, 카드 안쪽 여백에 `h3` 이름, 역할, 그리고 하는 일을 설명하는 한 줄을 둔다.

**390에서.** 165px 너비로 두 열을 쓰며, 이름은 카드 안에서 사진 아래에 둔다.

**실수.** 스톡 사진이나 지어낸 초상, 밝기와 바탕이 섞인 것, 여덟 명을 넘는 것.

# 콘텐츠 종류별 섹션 (Sections for a kind of content)

## integrations-grid

**역할과 용도.** 제품이 함께 작동하는 도구와 파일 형식을 실제 원색 아이콘으로 보여 준다(운영 규칙). 핵심이 제품에 무엇을 공급하느냐라면, 기능 섹션 안에 `fanin-warehouse` 또는 `hub-tools` 다이어그램 카드를 두고 그 연결선에 실제 아이콘을 넣는다. 도구는 최대 여덟 개까지이며, 카드 네 개로 보여 준다. 큰 그리드는 brief에 도구가 아홉 개 이상 나열된 경우에만 쓴다.

**1440에서.** 카드 네 개를 둔다. `.section-head`를 두고, 그다음 `article.card.card--row.span-6`을 네 개 둔다. 각 카드에는 도구 이름을 밝히는 제목("Syncs with Notion and Dropbox"), 두 줄, 그리고 패널(336px)을 둔다. 패널에는 fragment 하나를 넣는다. `integrations`는 앱을 고객의 실제 도구로 바꾸고 `.at-rise.fit`을 아래쪽에 둔다(`--fit-max: 380px`, `--ay`와 `--ay-sm`은 `calc(100% - 180px)`). `files`는 실제 파일과 아이콘을 넣고 `.at-corner.wide`(`--w: 680px`)를 쓴다. 또는 허브 다이어그램(`hub-tools`)을 쓰며, 가운데에 제품을 두고 연결선에 실제 도구를 둔다. 큰 그리드는 `span-12`의 `.frame`(안쪽 여백 48px)에 72px 타일 여덟 개를 가로로 배치한다(열 간격 24px, 행 간격 32px). 각 타일은 실제 아이콘과 `.t-label`로 된 도구 이름으로 구성한다. "See all integrations" 링크는 두지 않는다(한 페이지짜리 사이트에는 연결할 곳이 없다).

**390에서.** 카드는 한 열로 두고, 타일은 64px로 네 개씩 배치한다.

**비주얼.** 아이콘은 `icons.mjs fetch`로 가져와 원래 색으로 쓴다(`icons.md`). 직접 그리거나 색을 바꾸지 않는다.

**모션.** Tech: 첫 카드가 반복 재생된다(또는 허브가 맥동한다). 나머지는 정지 상태다.

**실수.** 직접 그리거나 색을 바꾼 로고, 제품이 지원하지 않는 도구, 카드 하나에 타일이 다섯 개를 넘는 것.

## calendar-frame

**역할과 용도.** 제품이 다루는 날짜를 고객의 실제 달력으로 보여 주고, 그 날짜가 무엇을 위한 것인지 옆에 적는다. Tech 전용이며, 실제 날짜를 쓴다.

**1440에서.** split-text-left와 같다. 프레임은 모든 너비에서 높이를 하나로 맞춰 달 전체가 보이게 한다(page CSS `#dates .frame--split { --ratio: 0px; min-height: 600px }`). 여기에는 붙여 넣은 `calendar` 하나만 두고, `.at-rise.fit.to-edge`를 48px 아래에 둔다(`--fit-max: 440px; --ax: max(48px, 50% - 220px)`). 두 번째 조각은 두지 않는다.

**390에서.** 텍스트를 먼저 두고, 프레임 높이는 600으로 하며, 달력은 휴대폰 레이아웃을 쓴다.

**카피.** 날짜가 무엇을 위한 것인지 말하는 제목을 쓴다. 예시는 Keelday(세일링 학교용 예약)다. "Plan the season's courses".

**비주얼.** 달의 라벨 `data-month`, 1일의 요일에 맞춘 앞쪽 `.is-out` 날짜, 실제 날짜마다 `data-d`, `data-start`/`data-end`, `is-mark` 하나, `[data-ev]` 행 세 개를 설정한다. 이는 달력의 `meta.json`이 정한 대로 한다. `is-today`는 현재 달에만 쓴다.

**실수.** 1일의 요일이 틀린 것, 키트의 샘플 달, 달력의 배율을 바꾸거나 행이 잘린 것.

## timeline-rail

**역할과 용도.** 한 줄 위에 날짜가 있는 순간 네 개를 순서대로 보여 준다. 각 순간에는 작은 패널이 있다. 릴리스나 연혁에 쓴다. 소프트웨어와 제품에만 쓰며, place에는 쓰지 않는다.

**1440에서.** `.section-head--row`에 h2와 `.link`를 둔다. 48px 아래에 `ol.grid.rail`을 두고, 그 안에 `li.span-3`을 네 개 둔다. 각 항목에는 위에 `.panel`(200px)을 두고, 그다음 레일 행을 둔다(page CSS: 다음 열까지 이어지는 1px 선, 8px 정지 점, 가장 최신 항목은 `--accent` 색). 날짜는 `.t-label`에, 제목은 `.t-card`에 두고, 10단어 이하의 문장 한 개를 붙인다.
**390에서.** 한 열로 두며, 레일은 세로로 배치한다.

**모션.** 가장 최신 패널에서만 루프가 최대 하나 돈다(tech). 레일의 다른 요소는 움직이지 않는다.

**실수.** 점이 지그재그로 이어지는 것, 맥동하는 점, 높이가 다른 패널.

## menu-in-type

**역할과 용도.** 사진 옆에 읽기 쉬운 타이포그래피로 쓴 메뉴나 가격표를 둔다. place에서는 `sections.md` 4절을 따른다(Menu or prices: 열린 그룹, 탭은 없음). 무게나 크기로 파는 제품도 같은 방식으로 쓴다("250 g · €14").

**실수.** 가격 줄이 들쭉날쭉하거나 통화 표기가 두 가지인 것, 요리마다 카드를 따로 두는 것, 메뉴를 PDF나 이미지로만 두는 것, 탭이나 아코디언.

## visit-map

**역할과 용도.** place가 어디에 있는지, 언제 여는지, 어떻게 가는지를 실용적인 정보(주차, 반려견, 무단차 출입, 체크인)와 함께 두세 개에서 여섯 개의 행으로 보여 준다. 쇼룸, 스튜디오, 문이 있는 서비스에 쓴다. place라면 방문 섹션은 `sections.md` 4절(Visit)을 따르고, 이 레시피는 지도만 제공한다.

**1440에서.** 페이지의 split이다. 텍스트 쪽에는 h2, `<address>`(도로명과 지역. brief에 도로명이 없다면 지역만, `copy.md`), `data-tz`를 붙인 `dl.hours` 형태의 영업시간, brief가 제공할 때만 전화번호와 이메일, 주요 동작과 Get directions를 둔다. 오른쪽에는 거리 지도를 둔다. `fx-map`은 OpenStreetMap에서 구운(baked) 지도이며(`effects-creative.md`), brief가 도로를 제공할 때만 쓴다. 핀은 도로 선 위에 두고, 다른 종류에서는 정지 상태로 둔다. 지도를 쓸 수 없다면 가게 전면의 사진을 둔다.

**390에서.** 텍스트를 먼저 두고, 지도나 사진은 너비 342로 둔다.

**카피.** 예시는 Fenn(도예 스튜디오)이다. "Visit the studio"; "Book a class", "Get directions".

**실수.** 지도 임베드나 스크린샷, brief에 없는 도로의 지도, 다른 페이지에서 움직이는 경로, 지도 위의 출처 표기(푸터 한 줄에 합친다), 방문자의 시계를 기준으로 한 오늘 날짜.

## booking-form

**역할과 용도.** place나 서비스 페이지의 단 하나의 작업이다. 예약 요청을 보내는 것. 고객이 예약 시스템을 쓴다면 그 링크가 버튼이 된다.

**1440에서.** 페이지의 split이다. 왼쪽에 텍스트(h2 "Book a room", 다음에 일어날 일, brief가 제공할 때만 전화번호와 이메일)를 둔다. 오른쪽에는 `--g-alt` 위의 폼을 둔다(안쪽 여백 48px. 사진, 질감, 유리 위에는 절대 두지 않는다). place라면 방이나 카운터 사진 옆이나 아래에 둔다(`sections.md`, Booking). 필드는 날짜, 인원, 이름, 이메일을 포함해 최대 여섯 개이며, `.btn-row`에 주요 버튼을 둔다. `method="post"`, `action`은 고객의 예약 주소다. 영어가 아닌 페이지에서는 `type="date"`가 아니라 텍스트 입력 필드를 쓴다.

**390에서.** 텍스트를 먼저 두고, 폼은 전체 너비로 두며, 필드는 한 줄에 하나씩 둔다.

**카피.** 라벨은 무엇을 입력하는지 말한다("Arrival", "Guests"). 버튼은 주요 동작을 그대로 쓴다. 회신이 언제 오는지 한 줄로 적는다("We reply within a day").

**실수.** 어디로도 보내지지 않는 폼, 여섯 개를 넘는 필드, 가짜 성공 메시지, 모달.

## client-slots

**역할과 용도.** 고객이 가진 자체 트레일러, 키 아트, 엔진 내 스크린샷, CAD 렌더, 분해 모델이나 모션 영상을 위한 자리다. brief에 고객이 이것을 가지고 있다고 적혀 있을 때 쓴다(`sections.md` 1절). 각 자리는 지금도 완성된 것처럼 보이는 프레임을 받고, 나중에 고객의 파일이 들어오면 한 줄만 바꾼다. 기술 페이지(소프트웨어, 게임, 하드웨어)에 쓴다. 제품 페이지의 CAD 프레임도 포함된다. 임시 자리에는 항상 키트의 것을 쓴다(제품 렌더의 정지 화면 또는 고객 사양의 장면). 스톡 사진, 그림, 빈 프레임이나 회색 프레임은 쓰지 않는다. 페이지 어디에도 임시 자리라는 표시를 하지 않는다.

**주석.** 모든 자리는 고객 팀이 검색할 수 있는 주석 하나로 시작한다. `<!-- CLIENT FILE trailer: assets/client/trailer.mp4 (1920x1080, H.264, the 60 s trailer) and assets/client/trailer.jpg (its poster); stand-in poster: <spec>-<view>.webp -->`. 보고서에는 각 자리의 이름, 파일, 비율, 임시 자리를 나열한다.

**트레일러 또는 모션 영상 프레임.** hero(또는 세계관 섹션) 다음에 자체 섹션을 두고, 그 위에 h2를 둔다. 프레임은 wrap 너비에 걸쳐 둔다. `figure.frame.frame--photo.fit-screen`을 쓴다(page CSS `--ratio: 56.25%`). 16:9이면 1440x900에서 wrap 너비의 프레임은 약 700px 높이가 되어, 제목과 함께 한 화면보다 커진다. 그래서 `fit-screen`(`layout.css`: 제목 아래에 남는 높이, 최대 720px, 1024px 아래에서는 `auto`로 태블릿과 휴대폰이 16:9를 유지한다)을 쓰거나, 프레임에 `max-height`를 주어 섹션이 한 화면에 들어오게 한다. 그러면 포스터는 어두운 바탕 위에 레터박스로 들어간다. 프레임 안에는 `<video class="frame__img" playsinline preload="none" poster="<the stand-in still>">`을 넣는다. 포스터는 이미 영화의 첫 프레임처럼 읽히는 키트의 정지 화면이다(게임이라면 세계관의 가장 넓은 시점, 하드웨어라면 작업대에서 팔이 움직이는 사용 장면). 재생 컨트롤은 실제로 작동하거나 아예 없어야 하며, 죽은 상태로 두지 않는다. 파일이 있으면 `controls`, `preload="metadata"`, `<source src="assets/client/trailer.mp4" type="video/mp4">`, 고객의 포스터를 쓴다. 파일이 없으면 `<source>`와 `controls`를 모두 두지 않는다(파일이 없거나 컨트롤 바가 죽어 있으면 깨진 프레임이다). 임시 정지 화면은 투명하므로, 영상은 `.slot__poster`도 함께 쓰고 page CSS `.frame > .frame__img.slot__poster { object-fit: contain }`를 적용한다(키트의 `cover`는 정지 화면을 제품의 fragment로 잘라 버린다). 프레임 바탕은 세계관이나 페이지의 어두운 바탕을 쓰고, 정지 화면도 그 바탕 위에서 만든다(`make-posters.mjs --grounds dark`. 밝은 바탕의 정지 화면은 어두운 바탕에서 옅은 바닥 얼룩을 남긴다). 재생 컨트롤은 `<a class="ly-play" href="<brief가 제공하는 트레일러 페이지: 스토어 페이지>" aria-label="Watch the trailer">`이며 `.ly-play__disc`를 쓴다. `.frame`은 가운데 정렬 flex 상자지만, system.css의 규칙 `.frame > :not(canvas, .stage, .loop-pause, .frame__fx, .frame__img, [data-print], [data-scene], .print3d)`이 컨트롤을 `position: relative`로 만든다. 그래서 `.ly-play`의 `left`와 `bottom`(각각 `--s-6`)이 디스크를 정중앙에서 오른쪽과 위쪽으로 32px 밀어 버린다. 모서리로 가지는 않는다. page CSS `.frame > .ly-play { left: auto; bottom: auto }`를 두면 가운데에 놓인다. 이런 page CSS가 없으면 컨트롤을 두지 않는다. 그러면 파일이 들어올 때까지 포스터가 섹션의 정지 화면으로 남는다. 파일이 있는 경우 tech에서는 모션 영상을 음소거하고 반복 재생(`autoplay muted loop`)해도 된다. 이때 일시정지 버튼을 함께 둔다(`motion.md`). 동작 감소 설정이나 휴대폰에서는 포스터만 보여 준다. 소리는 절대 함께 재생하지 않는다.

**스크린샷 띠.** 게임이 플레이되는 모습으로 보여 주는 세계관. 캡처처럼 액자에 넣은 프레임 세 개에서 다섯 개를 쓴다. 16:9이며 크기는 모두 같다(`trio`나 `.wrap` 위의 네 개 한 줄. 휴대폰에서는 한 열). 모서리는 각지게 하거나 페이지의 반경을 따른다. 기기 크롬은 쓰지 않으며, 그림자와 캡션도 쓰지 않는다. 파일이 있으면 `figure.frame.frame--photo` 안에 `<img class="frame__img">`를 각각 넣는다. 파일이 없으면 각 프레임에 세계관 사양(`sections.md`, Gaming)의 작업 장면 하나를 담는다. `data-product-place="stage"`를 쓰고, 프레임 자체를 `[data-product]` 요소로 만든다(`div.frame.slot`, page CSS `.frame.slot[data-product] { --ratio: 56.25%; background: <the world's water, fog or night colour> }`. `layout.css`는 `.frame[data-product]`의 바탕을 지우므로, 더 약한 선택자를 쓰면 렌더가 흰 바탕에 놓인다). 장면의 소품은 프레임 전체에 걸치도록 펼친다. 정지 화면을 쓰며, 같은 장면은 두 번 쓰지 않는다. `data-product-fill`을 1 이상으로 쓰지 않는다(테스트에서 프레임이 빈 상태로 그려졌다). "무엇을 하는가" 카드로 쓸 때는 열린 카드 세 개에서 다섯 개를 두고, 각 카드에는 캡처 위에 동사 하나를 쓴다.

**CAD 또는 렌더 프레임.** 고객의 제품 전체 CAD 렌더다. 제품 섹션의 split 프레임(`frame--split`) 또는 `bleed`를 쓰며, 렌더는 밝은 단색 바탕 위에 모서리를 각지게 둔다. 임시 자리는 다른 섹션이 쓰지 않는 제품 렌더 뷰(`front` 또는 `top`)를 쓴다. 그래서 그것이 실물의 세 섹션 중 하나로 집계된다. **분해 프레임:** 부품 섹션의 그림이다. 고객의 분해 모델을 쓰고, 없으면 사양의 `exploded` 장면을 쓴다(`sections.md`, Product, 4절).

**키 아트.** hero의 스테이지(`product` 스테이지, 또는 `film` hero의 포스터)와 세계관 띠다. 그 자리에는 임시 렌더를 두고, 주석에는 `assets/client/key-art.jpg`를 적는다.

**실수.** brief가 이름을 밝힌 자리를 페이지에서 빼놓는 것. 빈 프레임, 회색 프레임, 검은 프레임. 아무 동작도 하지 않는 재생 버튼. 존재하지 않는 파일을 가리키는 `<source>`. 파일이 곧 들어온다는 캡션. 모든 자리에 hero의 실물을 임시 자리로 쓰는 것.

# 가격과 질문 (Price and questions)

## pricing-three

**역할과 용도.** 소프트웨어에 쓴다. 요금제 세 개를 나란히 두고, 가운데 것을 추천한다. 월간과 연간을 전환하는 스위치를 선택적으로 둔다.

**1440에서.** 왼쪽 줄의 `.section-head`에 "Pricing", 회색 한 줄, 스위치(`role=tab` 버튼 두 개)를 둔다. 48px 아래에 `.card.card--plan.span-4`를 세 개 둔다. 가운데 카드는 `.is-featured`를 붙이고 "Most popular" `.badge`를 단다. 각 카드에는 이름, 대상, "/month"가 붙은 `.price`, 두 모드 모두의 결제 줄, 전체 너비 버튼(가운데 카드에만 `.btn--primary`), 포함 내용 5~7줄을 둔다. 1024부터는 각 카드가 행의 subgrid가 되어 버튼과 줄이 맞춰진다. 모든 가격에는 `data-monthly`와 `data-yearly`를 붙인다.

**390에서.** 요금제 순서대로 한 열로 둔다.

**카피.** 예시는 Rotaro다. "Priced per restaurant. Try any plan free for 14 days."; Team: "For restaurants with 15 to 50 staff", €59/month.

**비주얼과 모션.** 바탕은 쓰지 않으며 정지 상태다. Tech에서는 페이지의 효과가 하나뿐일 때 추천 요금제의 테두리를 빛나게 할 수 있다(`fx-pricing`, 또는 `data-glow="edge-glow"`. 호버나 포커스 시 가장자리에 빛이 한 번 돈다).

**실수.** 스위치를 누르면 높이가 바뀌는 카드, 가격과 맞지 않는 할인율, 구독이 아닌 것(제품이나 place)에 대한 요금제.

## pricing-two

**역할과 용도.** 무료 요금제와 유료 요금제, 또는 서비스의 고정 가격 두 개를 보여 준다. 둘 다 포함하는 내용은 한 번만 말한다.

**1440에서.** `.grid`를 쓴다. `span-4`에는 h2 "Pricing", 회색 한 줄, 모든 요금제에 공통으로 포함되는 내용, `.link`를 둔다. `span-4 start-5`와 `span-4 start-9`에는 `.card.card--plan`을 두 개 둔다(이름, 대상, 가격, 버튼, 5~7줄). 추천 요금제에는 `.is-featured`를 붙인다.
**390에서.** 한 열로 둔다.

**실수.** 높이가 서로 다른 버튼, 카드마다 반복되는 모든 요금제 공통 목록.

## comparison-table

**역할과 용도.** 요금제나 모델, 또는 제품을 작업이 지금 어떻게 이루어지는지와 행 단위로 비교한다.

**1440에서.** `.section-head`를 두고, 그다음 `role=table`과 그 역할들을 가진 `.grid` 행들을 둔다. 기능은 `span-4`에, 선택지 두 개는 `span-4 start-5`와 `span-4 start-9`에, 세 개라면 `span-2`에 둔다. 헤더 행은 `--g-main` 위에 두고, 각 선택지의 이름, 가격, 버튼을 넣는다(추천 선택지에만 `.btn--primary`). 그룹 제목은 `.t-label`로 쓴다. 행 높이는 48px이며, 각 행은 1px 선으로 닫는다. 포함된 항목에는 `.sr-only` "Included"가 붙은 체크 표시를, 포함되지 않은 항목에는 회색 대시("Not included")를, 그 밖에는 짧은 값을 쓴다. 고정(sticky) 요소는 두지 않는다.

**390에서.** 선택지마다 자체 행 블록으로 나눈다. 옆으로 스크롤되는 구조는 쓰지 않는다.

**실수.** 휴대폰에서 옆으로 스크롤되는 것, 그리드를 벗어난 열, 고정 헤더.

## faq

**역할과 용도.** 구매자가 마지막으로 던지는 질문(가격, 데이터, 해지, 형식)을 모두 펼쳐진 상태로 보여 준다. 495px 아래에서는 위 섹션에 합친다.

**1440에서.** 페이지의 split이다. 왼쪽에는 h2 "Questions", 회색 한 줄, `#contact`로 가는 `.link`를 둔다(`mailto:`나 `tel:`은 brief가 주소나 번호를 줄 때만 쓴다). 오른쪽에는 `.faq`를 두고, 그 안에 `.faq__item`을 5~8개 둔다(질문은 `h3`, 그 아래에 답변, 각 항목은 1px 선으로 닫는다). 아코디언은 쓰지 않는다. 답변은 로드할 때부터 펼쳐져 있다.

**390에서.** 한 열로 둔다.

**카피.** 질문은 구매자의 말로 60자 이하로 쓴다. 답변은 50단어 이하로 쓰며, 답을 먼저 말한다. 예시는 Ferrow다. "Can I cancel at any time?" "Yes. Cancel in Settings and you are not billed again."

**실수.** 회사가 받고 싶은 질문, 답을 피하는 답변, 닫힌 상태의 답변.

# 마무리 (Closes)

마무리는 `footer.closing`의 1행이다(`layout-v4.md`). 푸터 자체의 바탕에 두며, 별도의 띠로 만들지 않는다. 주요 동작을 다시 한 번, 문구 그대로 요청한다.

## close-type

**역할과 용도.** 큰 문장 하나와 큰 주요 버튼 하나다. 모든 종류에 쓸 수 있으며, 그림은 없다. 버튼이 곧 그림이다.

**1440에서.** `.closing__cta.close--type`. h2(여덟 단어 이하, 왼쪽 줄에 둔다), 선택적인 `.t-small.muted` 줄(체험 조건, 영업시간), 그다음 `.wrap` 너비에 걸친 `a.btn.btn--primary.btn--xl`을 둔다. 소프트웨어에서는 높이 88px이며 라벨은 디스플레이 서체 32px이다. 제품과 서비스에서는 너비 640, 높이 72다(클리닉에서 이 정도로 넓은 덩어리는 무뚝뚝하게 읽히기 때문이다).

**390에서.** 버튼은 전체 너비, 높이 48px, 라벨 18px로 둔다.

**카피.** 예시는 Rotaro다. "Plan next week's rota in ten minutes" / "Start free trial" / "Free for 14 days. No card needed."

**실수.** 두 번째 버튼, 페이지의 다른 곳에 있는 큰 버튼, 그 뒤에 깔린 바탕.

## close-photo

**역할과 용도.** place, 제품, 서비스의 마무리다. 주요 동작을 장소나 제품이 사용되는 사진 옆에 둔다. place에서는 항상 이 마무리를 쓴다.

**1440에서.** `.closing__cta.close--photo`. 머리 행에는 h2(여덟 단어 이하, "Open today 7:30 to 16:00"처럼 한 줄)와 주요 동작을 둔다. 그다음 고객의 사진을 링크 아래까지 한 줄 한 줄 이어지게 둔다. 사진은 위에서 쓰지 않으며, 사진 위에 글을 얹지 않는다. place라면 1:1 사진을 `span-5`에 두고, 글은 그 옆에 둔다(`sections.md`, Close).

**390에서.** 글과 전체 너비 버튼을 먼저 두고, 그 아래에 사진을 둔다.

**카피.** 예시는 Fenn이다. "Book a Saturday wheel class"; "Three hours, €65, clay and firing included."; "Book a class".

**실수.** hero의 사진을 다시 쓰는 것, 사진 위의 글, 뷰포트 끝까지 뻗는 띠.

## close-word

**역할과 용도.** h2와 버튼 다음에, 고객의 이름을 `.wrap` 너비에 걸쳐 디스플레이 서체로 크게 짠다. 소프트웨어, 제품, 서비스에 쓴다(place의 `colour-band`에는 쓰지 않는다).

**1440에서.** `.closing__cta.close--word`. h2와 버튼을 한 머리 행에 두고, 그다음 이름을 한 줄로 한 줄 이어지게 둔다(브레이크포인트마다 직접 맞춘 크기이며, transform으로 배율을 주지 않는다).

**390에서.** 머리 부분을 쌓아 올리고, 이름은 342 너비에 걸쳐 둔다.

**실수.** 1024에서 페이지가 담을 수 없을 만큼 큰 이름, 푸터의 워드마크에서 이름을 반복하는 것.

# 푸터 (Footers)

`footer.closing`의 2행이다. 디렉터리를 한 바탕에 두고, 그 아래에 법적 고지 행을 둔다(`system.md`).

## footer-columns

**역할과 용도.** 기본 바탕 위의 조용한 푸터다. 회사 소개를 평범한 한 줄로 쓰고, 사이트맵과 법적 고지 행을 둔다. 소프트웨어, 제품, 서비스에 쓴다.

**1440에서.** `starter.html`과 같다. `span-4`에는 회사 블록을 둔다(로고, 그다음 `p.footer__lede`, 디스플레이 서체 28px로 여덟 단어 이하의 한 줄). 네 개의 `.footer__col.span-2`에는 내비와 같은 이름과 순서를 쓴다. 각 링크는 페이지의 섹션으로 가고, Contact는 `#contact`로 간다. 페이지에 뉴스레터 입력란이 있다면 한 번만 "Subscribe"와 함께 둔다. 그다음 `.footer__legal`을 둔다. 브랜드와 연도, Privacy, Terms를 쓰고, Imprint는 brief가 회사의 정보를 줄 때만 쓴다. 빈 `.socials`를 두고, 마지막에 출처 줄을 둔다.

**390에서.** 열은 두 개씩 배치하고, 법적 고지 행은 쌓아 올린다.

**실수.** 내비와 다른 열, 빌드에 없는 페이지로 가는 링크, 직접 그리거나 색을 바꾼 소셜 아이콘, 푸터의 효과.

## footer-dark

**역할과 용도.** Figma와 x.ai의 푸터다. 어두운 바탕, 큰 이름, 링크 열로 구성한다. 소프트웨어와 제품에 쓴다(끝에 오는 어두운 띠 하나).

**1440에서.** `footer.closing.footer--dark.ground-inverse`. `.grid`를 쓰고, `span-4`에 회사 블록(디스플레이 서체 48px의 마크와 이름)을 둔다. 그다음 네 개의 `.footer__col.span-2`를 두고, 법적 고지 행을 둔다. 어두운 페이지에서는 system.css가 위쪽에 1px 구분선을 두고 페이지보다 한 단계 더 어둡게 유지한다.

**390에서.** 이름은 30px이고, 열은 두 개씩 배치한다.

**실수.** 바로 위에 두 번째 어두운 섹션을 두는 것.

## footer-visit

**역할과 용도.** place나 지역 회사의 푸터다. 위치를 크게 짜 두고, 가는 방법과 영업시간을 함께 보여 주어, 방문자가 다른 정보를 찾을 필요가 없게 한다.

**1440에서.** `footer.closing.footer--visit`를 `starter.html`(`links-visit`)과 같이 쓴다. `span-7`에는 `address.footer__address`를 둔다(도로명과 지역을 두 줄로. brief에 도로명이 없다면 지역만 둔다. place에서는 32/40, 그 밖에서는 48px이며 디스플레이 서체를 쓴다). 그 아래 가는 방법 한 줄(정류장, 도보 시간)과 `a.link` "Get directions"(OpenStreetMap 검색, `copy.md`)을 둔다. `span-4 start-9`에는 "Opening hours"를 두고, 그 아래 `data-tz`를 붙인 `dl.hours`를 둔다(system.js가 오늘 날짜를 표시한다). 그다음 내비 행(로고, 내비 단어, Contact)을 두고, 출처 줄을 마지막에 둔 법적 고지 행을 둔다. place라면 마지막으로 `.wrap` 너비에 걸쳐 디스플레이 서체 400으로 이름을 크게 짠다. 단 `colour-band`에서는 제외한다. 버튼은 두지 않는다.

**390에서.** 주소는 24~30px, 그 아래에 영업시간을 두고, 내비 행은 줄바꿈한다.

**실수.** 방문 섹션과 다른 영업시간, 방문자의 시계를 기준으로 한 오늘 날짜, 푸터의 지도, brief가 제공하지 않은 이메일이나 전화번호를 인쇄하는 것.

## footer-statement

**역할과 용도.** 마무리와 푸터를 페이지의 밝은 바탕(모래색, 하늘색, 세이지, 그림) 위에 하나의 디자인된 덩어리로 묶는다. 큰 문장 하나, 전체 너비 버튼 하나, 그다음 열들로 구성한다(Figma의 마무리와 푸터). Tech 전용이다.

**1440에서.** `footer.closing.footer--statement`. system.css가 창의 양옆과 아래에서 8px 안쪽으로 들여 놓고, 모서리는 `--r-lg`를 쓴다. 마무리는 close-type과 같이 두고, 열과의 간격은 96px로 한다. 그다음 법적 고지 행을 둔다.
**390에서.** 전체 폭으로 가장자리까지 채우고, 모서리는 각지게 한다.

**실수.** 두 번째 큰 버튼, 그 위에 얹은 효과.

# 페이지 계획 (Page plans)

다섯 가지 완성된 사례이며 종류마다 하나씩이다(게임은 소프트웨어와 따로 둔다). 실제 작업은 dealer에서 받으므로, 같은 종류라도 매번 다르게 보인다. 이웃한 섹션은 레이아웃을 공유하지 않고, split은 한쪽 면을 유지하며, 차분한 섹션은 시각적 섹션 두 개 뒤에 최대 하나만 온다. 카드 레이아웃은 최대 두 번까지만 보인다.

## Software

*Fernbill: 2~20명 규모 에이전시를 위한 인보이스 발행.* 배정: hero `split`, `nav-mega`, `footer-dark`, 마무리 `close-type`, 리듬 `dark-band`, 버튼 `pill`, 마크 `ring`. hero 프레임에 효과 `painterly-landscape`, 카드 바탕 `grain-gradient`. 순간(moment) 하나는 `word-highlight`다(자체 문장 섹션 하나).

순서: hero(인보이스를 `doc`으로 열어 두고, 가장자리 위에 `notify` "Invoice 2041 paid"), app-frame(`window`의 인보이스 목록과, 그 옆에 열린 인보이스의 스레드를 `chat`으로), features-2x2(카드 바탕. `notify`로 결제 매칭, `toggles`로 리마인더 규칙, 인보이스 하나를 장부 세 개로 나누는 레인 다이어그램, 고객의 질문 `chat`), `word-highlight`를 쓴 문장(자체 한 화면 섹션), split-text-left(실제 영수증이 있는 `files`, 밝은 바탕은 평범하게), 어두운 띠 위의 tabs-tour, integrations(실제 아이콘을 연결선에 둔 `fanin-warehouse` 다이어그램 카드, 본문 옆), pricing-three, faq, footer.closing. 로고 행은 없다. brief가 고객의 이름을 밝히지 않았기 때문이다. 후기도 없다.

## Product

*Brinwood: 포르투에서 주문 제작하는 원목 스탠딩 데스크.* 배정: hero `photo`, `nav-cards`, `footer-columns`, 마무리 `close-photo`, 리듬 `media-band`, 버튼 `arrow`, 마크 `stack`.

순서: hero(실제 방에 있는 책상), product-statement(오려낸 사진과 사실 세 개: 하중 120 kg, 높이 65~130 cm, 3주 배송), line-up(€1,290부터 세 가지 사이즈), split-text-left(원목 상판: 결을 보여 주는 사진), photo-band("Built to order in Porto"), split-text-left 한 번 더(프리셋이 있는 핸드셋: 사진으로 보여 준다. 제품이 가지지 않은 UI는 절대 보여 주지 않는다), specs(`rows--spec`, 프레임 사진 옆), proof(brief가 주는 후기, 합친다), faq(질문 네 개), footer.closing. 바탕은 단색이고, 효과와 순간은 없다.

**사진이 아직 없는 경우**(*Pellum, 책상 램프*): 램프는 렌더로 보여 주며 숨기지 않는다. hero(`deal.mjs --type product --has object`: `product` 또는 `split`)는 제품 렌더를 전체로 스테이지에 켜서 둔다. product-statement는 다이얼을 가까이에서 보여 주고 사실 세 개(부품)를 붙인다. 용도는 split으로 보여 준다(책상 장면: 책과 머그 위에 따뜻한 빛의 웅덩이가 프레임을 가로지르고, 램프는 가장자리에서 잘린다). 사용 방법은 세 단계로 보여 준다. 사양은 `rows--spec`으로 두고, brief가 밝힌 부품 브랜드의 실제 아이콘을 함께 쓴다. 주문은 살아 있는 주문 카드로 보여 준다(렌더의 색을 바꾸는 마감 견본, 배송, 가격). 램프 전체는 두 번만 보이며, 모든 섹션에 넣지는 않는다. faq, footer.closing. 바탕은 단색이고, 효과와 도면은 없으며, 사진이 없다는 설명도 쓰지 않는다. 보고서에는 찍어야 할 사진 목록을 적는다.

## Gaming

*Kelpmoor: 잠긴 해안을 배경으로 한 협동 항해 게임, Steam 출시 예정.* 배정: hero `film`(brief가 제공하는 트레일러), `nav-centre`, `footer-dark`, 마무리 `close-word`, 리듬 `media-band`, 버튼 `solid`, 마크 `wordmark`. 효과는 없다(트레일러가 hero의 움직임이다). 순간 하나는 `letters-assemble`이다(자체 문장).

순서: hero(시네마 프레임 안의 트레일러 포스터, 클릭하면 재생. h1 "Kelpmoor, a co-op sailing game"; "For 1 to 4 players. Coming to Steam in spring."; "Add to Steam wishlist"), 세계관(인게임 샷 두 장을 photo-pair로, 같은 톤), `letters-assemble`을 쓴 문장, 무엇을 하는가(열린 카드 세 개, 각각 동사 하나와 인게임 샷: 잠긴 해안을 항해하기, 가라앉은 마을에서 회수하기, 항구 다시 짓기), 세계관을 미디어 띠로 한 번 더(키 아트 전체 블리드, h2는 차분한 하늘 위에), 플랫폼과 에디션(실제 Steam, PlayStation, Epic Games 마크, `icons.mjs apps --tag gaming`. Xbox와 Nintendo는 허용된 세트에 없으므로 마크를 그리지 않고, 콘솔 이름만 텍스트로 쓴다. 가격은 "from"으로 표시한다), faq, footer.closing. UI 조각, 대시보드, 위젯은 어디에도 없다.

**아트 파일이 없는 경우**(이름만 있고 제공되지 않았거나 아예 없는 경우): 키 아트는 효과로 대신하지 않고 렌더해서 보여 준다. 게임 팔레트로 된 제품 렌더 사양은 두 개다(`effects-objects.md`, Product renders). 하나는 회수 범선이다(선체와 갑판은 둥근 상자와 패널, 돛대와 붐은 튜브, 삭구는 경로, 말아 올린 돛은 튜브, `light` 등 두 개. 부품 약 40개). 다른 하나는 세계관 장면이다(잠긴 부두와 가라앉은 마을의 지붕: 기둥은 원기둥, 판자는 빔, 상자는 상자, 크레인 밧줄은 경로, 부두의 작은 범선. 부품 90개 미만. 작업마다 장면 하나씩: `light` 등 아래의 열린 선체, 크레인으로 들어 올린 상자, 다시 지은 항구). `deal.mjs --type software --kind gaming --has object`를 배정한다. hero는 `product`로 하고, hero 슬롯에는 효과 `aurora-curtains`를 배정한다(어둡게, 물 위의 황혼 하늘로 읽히도록. 돌아가는 범선 뒤에 스테이지 바탕으로 둔다. `data-product-mode="live"`). h1 "Kelpmoor, a co-op sailing game", "Coming to Steam in spring.", "Add to Steam wishlist"는 머리 행에 둔다. 그다음 트레일러 프레임(client-slots: 부두 장면의 가장 넓은 정지 화면을 포스터로, 재생 컨트롤은 brief가 주는 스토어 페이지의 트레일러로 연결). 세계관은 위에서 본 부두 장면(`top` 뷰, 해안 지도)을 어두운 띠 위에 전체 블리드로 두고, h2는 그 위에 둔다. 무엇을 하는가는 스크린샷 띠를 열린 카드 세 개로 보여 준다. 각 카드에는 세계관의 작업 장면 하나와 동사 하나를 두고, 16:9로 세계관의 물 위를 가장자리까지 채운다(client-slots). 배정된 순간을 담는 섹션. 실제 스토어 아이콘과 범선의 두 번째 전체 뷰가 있는 플랫폼. faq, footer.closing. 범선은 전체가 두 번 보이고, 나머지는 세계관이 담당한다. 렌더 하나만 돌고 나머지는 정지 화면이다. 어디에도 "render"라는 말을 적지 않는다. 각 자리는 주석에 고객의 파일 이름을 적는다. 보고서에는 교체할 아트를 밝힌다.

## Place

*Fenn: 라이프치히 플라그비츠의 Karl-Heine-Straße에 있는 도예 스튜디오 겸 상점.* 배정: `nav-split`, `footer-visit`, 리듬 `surface-pairs`, 버튼 `block`, 마크 `arc`, 제공 항목 `tall-small`, place `trio`, 타입 순간 `address`, 방은 없음.

순서: place hero(아침 햇살이 드는 작업실. "Pottery classes in Leipzig-Plagwitz"; "Wheel classes on Saturdays, open studio Tuesday to Sunday from 10."; "Book a class"), 방문(2화면. "Karl-Heine-Straße, Plagwitz"를 `.wrap` 너비에 크게 짜고 지도에 연결한다. 주간 영업시간, 무단차 입구, 4:3의 가게 전면), 표면 띠 위의 제공 항목(수업과 가격을 두 개의 열린 그룹으로, `tall-small` 옆에 둔다. 물레 수업은 큰 카드, 유약 그릇은 작은 카드로 하며, 각각 해당 수업으로 연결한다), place(`trio`: 작업실, 건조 중인 그릇 선반, 굽 고리를 깎는 손. 상단은 한 줄로), 예약(수업실 사진을 폼 옆에), footer.closing(`footer-visit`. 이름은 12vw로 제한하고, 출처 줄은 하나, `data-tz="Europe/Berlin"`). 사진 열네 장은 모두 스튜디오 자체의 사진이다. 효과와 순간은 없다. 연결된 사진은 포인터 아래에서 1.03배로 확대된다.

## Service

*Halden Dental: 말뫼 중심가의 치과 클리닉.* 배정: hero `split`, `nav-mega`, `footer-visit`, 마무리 `close-photo`, 리듬 `surface-pairs`, 버튼 `tonal`, 마크 `dots`.

순서: hero(치료실, 4:5), services-list(€95부터 여섯 가지 치료, 접수처 사진 옆), steps(온라인 예약, 검진, 치료 계획: 각각 사진 하나), people-row(brief가 밝힌 치과의사 네 명), pricing-two(Check-up과 Check-up with cleaning을 고정 가격으로), faq(brief가 주는 환자 후기와 합친다), 주소와 영업시간이 있는 booking-form, footer.closing. 바탕은 단색이고, 효과는 없다.
