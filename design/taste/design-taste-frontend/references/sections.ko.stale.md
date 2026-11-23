# Sections

페이지는 그 종류(kind)의 계획에서 만들어진다. deal은 템플릿이 고정했을 부분을 바꾼다. 모든 id에는 `sections-library.md`에 레시피가 있다. 종류와 그것이 담을 수 있는 것은 `SKILL.md`의 1~3절과 `effects-usage.md`에 있다. 높이와 가장자리는 `layout-v4.md`에 있다.

## 1. Plan in screens

만들기 전에 계획을 먼저 쓴다. 첫 줄에는 kind, 둘째 줄에는 deal을 쓴다. 그다음에는 섹션마다 한 줄씩 쓰는데, 각 줄에는 그 섹션의 id, 핵심 아이디어 하나, 그림, 화면 수(1개 또는 2개, 콘텐츠 높이 기준: `layout-v4.md` 2절)를 적는다. 테크 페이지라면 효과가 들어가는 섹션, scene 또는 moment도 적는다.

- **모든 섹션은 실물을 보여 준다:** 사진, 인물 사진, 실제 아이콘, 고객사의 UI, 다이어그램 카드, 또는 (테크 전용) 효과. 그림이 없는 섹션은 가격표, FAQ, 사양표, 예약 폼, 또는 deal로 정해진 statement moment의 자체 섹션에만 허용되며, 각각 한 번씩만 쓴다. 그림 없는 섹션 두 개가 서로 이웃하는 것은 절대 안 된다. 짧은 페이지의 statement hero와 그 하나의 섹션만 예외다(4절 참고). 인용문에는 얼굴이 있어야 하며, 그렇지 않으면 위 섹션에 합친다. 그림은 실질적인 비중을 차지해야 한다. 타일의 절반 이상, 분할 레이아웃에서는 50/50, 레이어로 쓰일 때는 화면 전체다. 마무리(close)는 그 자체가 그림이다(사진, 큰 버튼, 또는 넓게 펼친 이름).
- **하나의 object가 페이지 전체를 끌고 가지 않는다.** 테스트에서 로봇 팔이 여섯 섹션에 나오고 게임의 회수 장비가 여섯 섹션에 나왔는데, 둘 다 "같은 object 여섯 번"으로 판정되어 4~4.5점 상한에 걸렸다. 통째로 보여 주는 object(제품, 그 사진이나 렌더, 게임의 hero object)는 hero를 이끌고, 그 밖에 **최대 두 섹션**까지만 나온다. 나머지 그림 섹션은 아래 표의 행에서 고른, 브리프가 뒷받침하는 다른 종류의 visual이 맡는다. 어떤 종류도 두 번을 넘지 않는다. 새로운 각도, 색 바꾸기, 전체의 크롭, 또는 바닥 위에 소품 하나를 둔 object도 같은 object로 본다. 사용 장면(use scene)은 그 배경이 화면을 채울 때만 사용으로 인정된다. 예를 들어 `desk`를 화면 가로로 가로지르는 벤치로 두고, 그 위에 트레이, 소포, 시트를 올려 그림의 절반 이상을 채우되 object는 그중 한 가지로만 있는 경우다. 점검은 선언된 scene을 사용으로 센다. 그래서 소품 하나가 그 장면을 object 반복으로 만드는지는 빌더가 판단한다. 계획의 각 줄에는 종류를 적고, object 줄은 최대 세 개까지만 둔다.

  | 종류 | object를 통째로: hero + 2 | 나머지 섹션을 맡는 것 |
  |---|---|---|
  | Software | `app-frame` | 주제의 UI 조각을 담은 카드, 다이어그램 카드, 실제 도구 아이콘, 타입 moment, 얼굴이 있는 실명 인용, 효과 또는 scene |
  | Gaming | hero object(우주선, 장비, 메크) 또는 고객사의 key art | 세계(세계의 object들로 된 scene, hero object는 작게 두거나 생략. 그 `top` 뷰는 지도로 쓴다), 일하는 중인 크루(고객사의 스크린샷, 없으면 작업 하나를 보여 주는 scene), 트레일러 프레임, 스크린샷 스트립, 타입 moment, 실제 플랫폼 마크 |
  | Tech hardware | 제품(사진, CAD 렌더 또는 그 렌더) | 쓰임새(작업대에서 트레이와 부품 사이에 있는 팔, 제자리에 놓인 기기), 분해도 또는 부품 뷰, 모션 비디오 프레임, 정지된 다이어그램 카드, 타입 moment(수치 하나를 크게), 그 분야의 맥락 사진(작업장, 연구실) |
  | Product | 제품(사진 또는 렌더) | 쓰임새(적재, 운반, 집에서 사용), 제품과 함께 있는 사람들, 부품 클로즈업, 정지된 다이어그램 카드, 타입 moment, 제품이 놓이는 곳의 맥락 사진 |

- **고객사의 자산에는 설계된 슬롯이 주어진다.** 브리프에 고객사가 트레일러, key art, 인게임 스크린샷, CAD 렌더, 분해 모델 또는 모션 비디오를 가지고 있다고 적혀 있으면, 각각에 지금 이미 완성된 것처럼 보이는 슬롯이 주어진다. 슬롯은 파일의 최종 비율에 맞는 프레임에, kit의 대역(stand-in) 이미지(세계 또는 제품이 쓰이는 장면의 정지 이미지)를 넣고, 고객사 파일을 위해 주석에 이름을 적는다. 비어 있거나, 회색이거나, 깨진 프레임은 절대 두지 않으며, 파일이 없다는 문장도 쓰지 않는다. 슬롯의 종류는 (`sections-library.md`, client-slots에 따라) 다음과 같다. **트레일러 또는 모션 비디오 프레임**(kit 포스터가 달린 실제 `<video>`이며, 재생할 페이지나 파일이 있을 때만 재생 컨트롤을 둔다), **스크린샷 스트립**(kit으로 구성한 세계의 3~5개 프레임을 캡처처럼 액자에 넣은 것), **CAD 또는 렌더 프레임**, **분해 프레임**. key art는 hero의 무대를 채운다. 보고서에는 모든 슬롯, 그 파일, 그리고 대역 이미지를 나열한다.
- **섹션마다 아이디어 하나,** h2 하나, 그리고 주요 행동 외의 행동은 최대 하나다(두 개는 hero에서만 허용되며, 제품에서 "compare"를 "buy" 옆에 둬야 할 때도 허용). 화면 두 개짜리 섹션에는 목록, 표 또는 폼 하나만 두거나, 두 그룹으로 나뉜 아이디어 하나만 둔다. 아이디어 두 개를 담지 않는다.
- **주요 행동**은 nav, hero, 마무리(또는 예약), phone bar에서 단어 하나 틀리지 않고 같아야 하며, 그 밖의 곳에서는 채워진 버튼으로 쓰지 않는다. 행동이 Get directions인 장소는 nav에서 빼 둔다(4절).
- **짧은 블록은 합친다:** 인용문, 로고 줄, 수치 줄 또는 FAQ가 혼자서 495px(390에서는 464px) 미만이면, 바로 위 섹션의 마지막 요소로 넣는다. 콘텐츠 아래 64~96px 간격을 두며, 자체 제목이나 배경은 두지 않는다. 답변을 모두 펼쳤을 때 495px에 이르는 FAQ만 자체 섹션이 된다.
- **반복:** 카드 레이아웃(2x2, bento, 카드 세 장, 분할 카드, 열린 타일)은 한 페이지에 최대 두 번까지다. 이웃한 섹션끼리 같은 레이아웃을 쓰지 않는다. software, product, service에서는 시각적 섹션 두 개 뒤에 차분한 섹션(인용, 가격, FAQ)을 하나 두고, 페이지 뒤쪽 3분의 1은 close 전까지 차분하게 유지한다. 섹션 틀(head, padding, 배경 규칙)은 반복해서 써서 한 번만 배우면 되게 한다.
- **증명은 작고 정확한 object로만 한다.** 브리프에 있는 것만 쓴다. 예를 들면 얼굴이 있는 실명 인용, 각주가 달린 수치, 언론 인용 줄, 평점 줄, 허락받은 실제 고객 로고다. 큰 수치의 열, 채우기용 수치 띠, 체크 아이콘 목록, 고객 로고 벽은 쓰지 않는다.
- **상자는 최대 두 겹까지:** 카드와 그 그림 패널, 또는 패널과 그 안의 UI. 패널에 UI가 들어간 카드는 상자를 없애거나(`.card--open`), 패널을 가장자리까지 붙인다(`.panel--flush`).
- **한 페이지, 실제 링크:** nav의 모든 단어, 버튼, 푸터 링크는 페이지 안의 `#id`로 가고, 로고는 `#top`으로 간다. 주요 행동은 그 일이 이루어지는 곳으로 보낸다. 예약 폼이나 주문 섹션의 id, Get directions라면 방문 블록인 `#visit`, 페이지에 폼이나 예약 시스템이 없으면 `.example`의 `mailto:`다(`copy.md`). 푸터 바깥에서 `#contact`로 가지 않는다. `footer.closing`이 그 id를 가지고 있으며, 점검기는 푸터에 떨어지는 링크에 WARN을 낸다. Privacy, Terms, Imprint는 직접 쓰는 작은 페이지로 보내거나(Imprint는 브리프에 회사의 고유 정보가 있을 때만), 아예 뺀다. `/contact`, `/[page]`, 맨 `#`은 쓰지 않는다.
- **390 폭에서** 페이지는 데스크톱의 배경, 사진, 순서를 그대로 유지하며, 각 사진은 그 텍스트 뒤에 온다.
- **768과 820에서**(심사위원의 태블릿, 세로로 세운 상태) 화면 배분을 다시 계획한다. 768x1024에서는 각 섹션의 쌓인 콘텐츠가 그 화면 안에 들어가야 하며(화면당 832px), 그렇지 않으면 두 화면 이하로 쌓는다. 첫 화면은 온전한 그림이나 분명한 bleed로 끝나야 한다(`layout-v4.md` 2절과 3절). 태블릿의 화면 수가 다르면 계획 줄에 적는다(예: "2 at 768").

## 2. The deal

템플릿이 고정하는 부분은 취향이 아니라 종류별 목록에서 deal한다.

```bash
node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" "<nav>" "<footer>" "<close>" "<rhythm>" "<buttons>" "wordmark|initial|arc|ring|stack|dots"
```

hero는 `start.mjs`의 페어링과 함께 `assets/layout/deal.mjs`에서 나오며(`layout-v4.md`), 이 한 줄에서 나오지 않는다. 장소(place)는 place hero를 쓴다. 결과는 계획 둘째 줄과 `<body>` 맨 위 주석에 적고, 정확히 그대로 짓는다. 딜한 부분은 그 레시피의 "use"가 맞지 않을 때만 다시 deal한다. 보여 줄 사진이 없으면 이렇게 딜한 부분은 맞지 않으며, 각 부분은 그것 없이 자체 목록에서 다시 deal한다. 그림으로 그리는 것은 절대 안 된다. `nav-cards`(및 사진 카드로 된 모든 nav 패널)는 패널 없는 `nav-split` 또는 `nav-centre`로, `close-photo`는 이름 없이 `close-word`의 머리글 행으로(왼쪽에 h2와 한 줄, 오른쪽에 주요 버튼, 둘 다 `.wrap` 줄에) 바꾼다. `media-band`는 `space`로 바꾼다(사진 없는 게임은 이것을 유지한다. 세계 렌더가 레이어가 된다). 장소의 hero는 `.ground-brand`에 있는 `statement` hero로 바꾼다. 바뀐 내용과 그 이유는 계획 둘째 줄에 적는다.

- **Nav**(`.wrap`에 맞춘 고정된 불투명 바 하나, `system.md`): `nav-mega`(링크 열과 패널의 그림 카드 하나), `nav-cards`(그림 카드 세 개 또는 네 개), `nav-centre`(가운데에 단어들), `nav-split`(왼쪽에 단어들, 가운데에 이름). `nav--tone`은 바를 반전 배경에 놓는다(테크 전용).
- **Footer**(`footer.closing` 둘째 행): `footer-columns`, `footer-dark`, `footer-statement`(밝은 배경, 테크 전용), `footer-visit`(문이 있는 장소나 서비스).
- **Close**(`footer.closing` 첫째 행): `close-type`(h2, 한 줄, `.wrap` 전체에 걸친 큰 버튼), `close-photo`(머리글 행 다음에 고객사 사진이 링크까지 내려옴), `close-word`(h2와 버튼, 그다음 `.wrap`에 걸쳐 펼친 이름).
- **Rhythm:** `dark-band`(페이지 가운데 또는 그 이후의 `.ground-inverse` 섹션 하나, 가장 강한 그림을 담는다), `media-band`(가운데 쯤의 전폭 사진 레이어 섹션 하나, 장소 페이지에는 쓰지 않는다), `surface-pairs`(섹션 한두 개로 된 `.ground-surface` 띠 하나), `space`(배경 하나, 섹션은 간격으로만 나뉨), `brand-band`(product 전용: 브랜드 고유 색의 `.ground-brand` 섹션 하나, 후반부). 가는 선으로 된 리듬은 쓰지 않는다.
- **Buttons**는 `<html data-buttons>`에서 고른다: `solid`, `pill`, `tonal`, `arrow`, `block`.
- **Mark**는 nav와 footer의 이름 옆에 둔다(`system.md`). 고객사 고유 로고가 있으면 그것으로 바꾼다.

## 3. The plans

선택 부분은 대괄호 안에 둔다. 각 목록은 페이지의 순서다. 이야기처럼 말한다. 무엇을 하는지 말하고, 보여 주고, 증명하고, 사람들이 탐색하게 한다. 탭은 software에서만, 클릭으로만 쓴다.

**Software**(및 AI, 개발자 도구, 핀테크). nav, hero, [hero에 붙은 logo-row], **app-frame**(제품을 크게 보여 준다. 하나의 앱 창에서 열린 항목 옆에 목록을 두고 `.wrap` 전체에 걸친다. 2절 또는 3절처럼 쓴다. `sections-library.md`), 서로 다른 레이아웃의 기능 섹션 두세 개(features-2x2, bento, split-text-left, tabs-tour, chapter, steps), [`fanin-warehouse` 또는 `hub-tools` 다이어그램 카드로 된 integrations. integrations-grid는 브리프가 나열한 도구가 9개 이상일 때만], [quote-stat(브리프가 주는 인용) 또는 customer-proof-row(브리프가 이름을 적은 고객). 둘 다 없으면 차분한 섹션은 pricing 또는 FAQ], [pricing-three, pricing-two 또는 comparison-table], faq, footer.closing. 그림은 다음과 같다. 고객사의 화면은 라이브 HTML로 쓰고, 없으면 `assets/ui`의 조각을 그 이름에 맞게 고쳐 쓴다. 각 조각은 제품 고유의 주제를 보여 준다(`cards.md`, 조각의 예: 코드 리뷰 도구는 빨간색과 초록색 diff와 Accept 행동을 보여 준다). 다이어그램 카드는 연결 방식을 보여 준다. 실제 아이콘은 제품이 연동하는 도구에 쓴다. 효과, moment, scene은 `effects-usage.md`가 딜하는 대로 쓴다.
Nav `nav-mega|nav-cards|nav-centre` · footer `footer-dark|footer-statement|footer-columns` · close `close-type|close-word` · rhythm `dark-band|surface-pairs|space` · buttons `solid|pill|tonal|arrow`.
절대 하지 않는 것: 화면 앞에 선 스톡 인물 사진, 제품 대신 쓰는 object 렌더, 제품이 색 패널 가운데에 작은 조각으로만 보이는 페이지(테스트에서 Linear보다 약 3.5점 낮았다).

**Gaming**(게임, 또는 게임을 출시하는 스튜디오. 페이지 타입 software, site-kind gaming). nav, hero(게임 이름을 밝힌다), [트레일러 프레임], 세계(섹션 한두 개, 전폭 bleed), 플레이어가 하는 일(스크린샷 스트립을 3~5장의 열린 카드로 두고, 카드마다 동사 하나씩 항해(sail), 회수(salvage), 재건(rebuild)을 쓰며 각 카드에 캡처를 붙인다), [게임의 시스템을 다이어그램 카드로: 매치메이킹, 저장, 스토어], 플랫폼과 에디션(실제 스토어와 플랫폼 아이콘, 시작 가격), [브리프가 주는 언론 인용 줄 또는 인용], [faq], 주요 행동(Add to Steam wishlist, Pre-order)이 있는 footer.closing. 테스트에서 게임 이름을 한 번도 말하지 않고 key art 자리에 추상적인 효과를 보여 준 게임 페이지는, 출시일이 있고 게임 세계의 scene, 기능 카드, 실제 플랫폼 아이콘이 있는 페이지에 3.5~5.5점 차로 졌다. 그래서 다음과 같이 한다.
- **hero는 게임 이름을 밝힌다:** h1은 이름과 장르다("Northline, a co-op survival game", `product` 무대에서 최대 40자). 또는 장르를 명시한 h1 위에 워드마크(고객사의 로고 파일)를 둔다. 리드 또는 그 아래 한 줄에는 브리프가 주는 출시일이나 상태를 적는다("Out 12 March on Steam", "Early access now"). 날짜가 없으면 상태("Coming to PC")만 적고, 날짜를 지어내지 않는다.
- **hero와 세계 섹션의 key art는 전폭 bleed로 쓴다:** 고객사의 트레일러(영상 hero), key art, 인게임 샷을 한 가지 grade로, 레이어로 또는 열 기준선에 맞춰 쓴다. art가 제공되면 `deal.mjs --type software --kind gaming --has film,photo`로 hero를 딜한다.
- **페이지를 끌고 가는 것은 hero object가 아니라 세계와 크루다**(1절, One object): hero object는 hero에 통째로, 그 밖에 두 섹션까지만 쓴다. 나머지는 세계, 일하는 중인 크루, 트레일러 프레임, 스크린샷 스트립이 맡는다. 브리프가 이름을 적은 art는 어느 경우든 자기 슬롯을 받는다(1절, client slots). 즉 트레일러 프레임, 스크린샷 스트립, 무대 위의 key art다.
- **art 파일이 없을 때**(브리프가 art의 이름만 적고 제공하지 않거나, 아예 없을 때): key art는 **렌더**하며, 효과로 대체하지 않는다. 게임의 hero object(배, 크레인 바지, 메크, 자동차)에 대한 product-render 명세(`effects-objects.md`, Product renders), 또는 자기 object들로 한 바닥에 구성한 세계의 scene(부두의 바지와 상자, 등불, 케이블. 부품 90개 미만)을 게임의 팔레트로 작성한다. 불, 램프, 화면에는 `light` 재질을 쓴다. 포스터도 만든다. 두 개를 작성한다. 하나는 hero object와 세계(부두, 선체를 잘라 연 난파선, 크레인, 상자, 등불, 그 안의 작은 hero object 또는 생략)이고, 다른 하나는 작업마다 scene 하나씩 있는 세계(`"scenes"`: 잘린 선체 안의 횃불 `light`, 상자 더미 위의 윈치, 밤의 선미 등불)다. `deal.mjs --type software --kind gaming --has object`(`product` 무대)로 딜한다. 렌더는 무대 위에 통째로 놓여 천천히 돈다(`data-product-mode="live"`: 페이지에서 유일한 라이브 렌더이며, 나머지 프레임은 모두 정지 이미지다). 하나의 효과(`effects.mjs pick --page gaming --palette dark --slots hero --exclude ruled-grounds,grid-pulse,contour-lines,dot-terrain,dotted-globe,ridgeline,bayer-dither,halftone-screen,ascii-shade,line-engraving,duotone-grade`를 물, 안개, 불씨, 빛으로 읽힐 때까지 다시 골라서 쓰거나, 제품 hero의 `spotlight-cone`, `edge-glow`)는 무대의 배경으로 렌더 뒤에 둘 수 있다. 렌더는 그 위에 그려진다(모든 배치는 프레임의 배경 위에서 투명하다). 효과 대신 쓰지는 않는다. 세계 섹션: 세계 명세의 가장 넓은 뷰(또는 지도로 쓰는 `top` 뷰)를 전폭 `media-band` 또는 `dark-band` 프레임 안의 `data-product-place="stage"`에 둔다. h2는 렌더 위에 두며, 렌더 위에 얹지 않는다. 기능 카드가 곧 스크린샷 스트립이다. 카드 하나가 세계 명세의 작업 scene 하나이며, 16:9이고, 소품을 펼쳐 scene이 프레임 전체에 걸치게 하고, 세계 고유의 배경 위에 놓는다. hero object 하나만 다시 쓰지 않는다(테스트에서 `data-product-fill`을 1로 두자 빈 프레임이 그려졌다. 대신 scene을 넓힌다). 트레일러 프레임의 포스터는 세계의 가장 넓은 정지 이미지다. 렌더는 한 개만 돌고, 나머지는 정지 이미지다. 헬퍼는 캐릭터, 얼굴, 생물, 천, 유리를 모델링할 수 없으므로, 세계의 기계, 건물, 소품만 구성하고 캐릭터는 절대 넣지 않는다. 보고서에는 교체할 art를 적는다.
- **플랫폼:** 실제 Steam, PlayStation, Epic Games 마크(`icons.mjs apps --tag gaming`). Xbox와 Nintendo는 글자로만 쓰고, 그림으로 그린 마크는 쓰지 않는다.
Nav `nav-mega|nav-centre|nav-cards` · footer `footer-dark|footer-statement` · close `close-word|close-type` · rhythm `dark-band|media-band|space` · buttons `solid|pill|block`.
절대 하지 않는 것: 게임 이름을 말하지 않는 hero, key art 대신 쓰는 추상적인 효과, 패턴, `statement` hero, `assets/ui`의 UI 조각(gaming에는 UI 킷이 없다), 패널 위의 대시보드나 SaaS 위젯, 세계 대신 놓는 다른 종류의 장난감 object, 그린 SVG, 빈 패널, 화면 앞에 선 스톡 플레이어 사진.

**Product.** nav, hero, 처음 세 섹션 안의 제품군 또는 라인업, 기능 섹션 두세 개(각각 혜택 하나씩, 각각 자체 구성, 아래 참고), 사양(`rows--spec` 또는 comparison-table), 증명(브리프가 주는 리뷰 또는 언론 인용 줄), [쇼룸이면 visit-map], [faq, 최대 다섯 개 질문], 뉴스레터가 있는 footer.closing. 모든 주요 섹션은 제품의 세계를 보여 준다. 화면마다 사진 두세 장을 두며(이름을 붙인 부분의 기능 섹션마다 한 장, 또는 배경 하나 위에 4~8개 컷아웃 격자), 제품 전체는 많아야 세 번 나온다(1절, One object). 나머지는 쓰임새, 부품, 그리고 그와 함께 있는 사람들이 맡는다. 가격은 카드나 표에서 "from" 가격으로만 표시하며, 요금제 표나 월 단위 전환은 쓰지 않는다. 테크 제품(site-kind tech)은 렌더나 효과를 쓸 수 있다. 그 밖의 제품은 효과를 쓰지 않으며, 렌더도 사진이 없을 때만 쓴다(아래 참고).
- **모든 프레임이 아니라 제품이 hero다.** 기준은 Figure와 1X다. 제품을 통째로 보여 줄 때는 큰 배율로 프레임을 채우고, 쓰임새, 부품, 놓인 자리가 나머지를 맡는다. 테스트에서 렌더한 제품 페이지는 5.5점을 받았고 창의성은 4.5점("안전한 회색 템플릿")이었다. 모든 시각 요소가 회색 바탕 위 회색 둥근 패널 안의 중간 크기 제품이었고, 같은 포즈의 사진 다섯 장, 같은 구조가 세 번 반복되었기 때문이다. 사진이든 렌더든 다음 규칙은 똑같이 적용된다.
  1. **크게.** hero와 그 밖의 섹션 최소 하나에서 제품은 프레임의 대부분을 채운다(긴 변이 프레임 너비의 80~100%, 또는 가장자리 밖으로 넘치도록 잘린다). 또는 섹션 자체의 배경 위에서 anchor 배율로 선다(1440에서 12열 중 8열 이상, 390에서는 전체 열). `product` hero는 이것을 스스로 한다(`layout.css` 3b). 렌더나 컷아웃은 wrap 전체에 걸쳐 페이지의 배경 위에 서며, 상자, 그라디언트, 둥근 모서리가 없다. 무대는 접힌 선(fold) 위 24px까지 내려오고, 제품은 무대만큼 크게 그려져서 가장 넓은 뷰가 1440에서 wrap의 80% 이상을 차지한다(킷의 도시 자전거는 `side` 뷰가 1280 중 1046이고 `three-quarter` 뷰는 818로 8열 미만이라 기준에 못 미친다). 제품 사진은 접힌 선까지 가장자리에서 가장자리로 이어지며, 제품이 wrap의 80%를 차지하도록 잘린다(`--ly-pos`). 회색 바탕 위 회색 둥근 `.panel` 안에 중간 크기 제품을 넣지 않는다. 렌더는 투명하며 배경 위에 직접 선다(`layout.css`가 모든 `.frame[data-product]`에서 채움, 테두리, 패딩을 없앤다). 컷아웃도 같다. 사진은 그 자체가 프레임이다.
  2. **제품 전체는 최대 세 섹션에만 나오고, 섹션마다 다른 그림을 쓴다.** 제품 전체(어떤 각도, 어떤 색이든)는 hero와 그 밖의 두 섹션에만 나온다. 나머지는 쓰임새(실린 모습, 작업대에서, 집에서. 배경이 프레임을 채운다), 부품 클로즈업, 분해도, 제품과 함께 있는 사람들, 정지된 다이어그램 카드 또는 타입 moment(1절, One object)가 맡는다. 같은 뷰를 두 번 쓰지 않는다. 더 작은 파일(`-700`), 색만 바꾼 것, 뷰를 뒤집은 것도 같은 뷰다. 각 계획 줄에는 그 섹션의 그림과 종류를 적으며, 두 줄이 같으면 안 된다.
  3. **제목의 모든 약속은 그림으로 보여 준다.** 가족용 자전거는 벨트가 달린 아이 좌석을 보여 주고, 램프는 테이블에 비치는 빛을 보여 주며, "상자 네 개를 싣는다"는 섹션 크기에서 읽을 수 있을 만큼 상자 네 개를 보여 준다. 그림이 없는 약속은 그림을 넣거나 약속을 잘라 낸다.
  4. **딜한 구성, 대비되는 배경 하나.** 그림 섹션마다 구성은 4절의 다섯 가지(`bleed`, `pair`, `trio`, `strip`, `tall-small`)에서 딜한다. 페이지당 한 번씩 `split`(큰 그림 하나 옆에 텍스트, 아래 전체 제품 페이지에서는 2번 섹션)과 주문 섹션(제품 옆의 주문 카드, 마지막에 두는 폼이며 split으로 세지 않는다)을 더한다. 이웃한 섹션은 같은 구성을 쓰지 않으며, 구조(제목, 패널, 그림)도 두 번 쓰지 않는다. 제품의 경우 `bleed`는 제품을 anchor 배율로 뷰포트 전체에 걸쳐 보여 주고, `pair`는 같은 비율의 두 뷰, `trio`는 전체, 부품, 디테일, `strip`은 행이 이름 붙인 부품의 클로즈업 네 장, `tall-small`은 쓰이는 모습의 제품을 세로로 크게, 디테일을 작게 둔다. 섹션 하나는 대비되는 배경에 서며(아래 rhythm의 `dark-band` 또는 `brand-band`), 가장 강한 뷰를 담는다. 나머지는 평평한 배경 하나를 공유한다. 프레임은 페이지의 모서리 반경을 따르며, 패널 안의 패널은 쓰지 않는다.
  5. **색 선택이 그림을 바꾼다.** 주문 카드의 색 견본(swatch)은 옆에 있는 제품 그림을 바꾼다. 렌더일 때는 각 견본(버튼이나 라디오)에 `data-product-swatch="#<frame id>"`와 `value="<colour id>"`(명세 `colors`의 id)를 달면, `auto.js`가 페이지 스크립트 없이 프레임의 정지 이미지를 바꾼다(`effects-objects.md`, Views 참고). 사진일 때는 색마다 한 장씩 두고, 견본이 `src`와 `alt`를 바꾼다. 제공하는 모든 색은 페이지에 적어도 한 번 보여 준다(hero, split, 사용 장면, 주문 프레임이 각각 다른 색). 제공하지만 보여 주지 않는 색은 결함이다.
  6. **같은 사실을 두 번 쓰지 않는다.** 수치 띠는 그 아래의 사양 행을 반복하지 않는다. 띠는 잘 팔리는 수치 세 개(하중, 주행 거리, 가격)를 맡고, 행은 나머지(크기, 무게, 모터, 배터리, 보증)를 맡는다. 사실 하나에 자리 하나, 표현 하나다.
  7. **버튼은 hover에서 움직이고 click에서 눌린다.** 모션 레이어가 이것을 처리한다(`motion.md`, Button). 페이지 CSS는 `.btn`의 `transform`이나 `transition`을 설정하지 않는다. 어딘가로 가는 기능 카드는 링크 카드이며, 2px 떠오르고 그림은 1.03배로 확대된다.

- **사진이 없을 때: 제품은 숨기지 않고 보여 준다.** (테스트에서 자전거가 한 번도 나오지 않은 화물 자전거 페이지는 10점 중 3점을 받았다.) 브리프가 주는 그림(렌더, CAD 뷰, 컷아웃)은 hero의 무대에 놓는다. 그것도 없으면 제품을 **렌더**한다. 즉 이 제품의 스튜디오 렌더 하나를 만든다. 이때 objects 킷의 product-render 헬퍼(`assets/objects/product-render`, `effects-objects.md`의 Product renders)로 제품을 부품 단위로 조합한다. 프레임, 바퀴, 상자, 팔 또는 갓을 적은 짧은 JSON 명세를 쓰되 크기는 브리프의 수치에 맞추고, 재질과 색은 제품 고유의 것을 쓴다. 킷의 `specs/`가 형식을 보여 준다. 킷의 명세를 고객사 제품으로 내놓지 않는다. `make-posters.mjs`로 포스터를 만들고, `<div class="frame" id="<name>-<view>" data-product="assets/objects/product-render/specs/<name>.json" data-product-place="stage" data-product-view="<view>">`로 붙인 뒤 `product-render/auto.js`를 로드한다. place는 제품의 경계가 프레임에서 차지하는 비율일 뿐이며, 그 안에 가운데 맞춘다(`build.js`). `stage`는 0.86, `hero`는 0.88, `tile`은 0.84, `card`는 0.9다. 페이지의 CSS가 프레임 크기를 정하며, 글자는 항상 프레임 밖에 선다. hero에서는 프레임을 `product` hero의 `.hero__stage` 안에 바로 넣는다(`layout.css` 3b가 크기를 정한다). `split` 프레임이나 전폭 프레임에는 `stage`, 정사각형이나 세로 타일에는 `tile`을 쓴다. 렌더는 제품의 그림이지 효과가 아니다. **기본은 정지 이미지이고, 요청이 있을 때만 라이브(`data-product-mode="live"`)이며, 라이브는 최대 한 맥락에만 쓴다.** 페이지의 평평한 배경 위에 두며, 옆에 인쇄물, 셰이더 배경, moment나 scene을 두지 않는다. site-kind가 other인 제품과 하드웨어도 같다. 규칙 2의 그림은 명세 하나에서 나온다(`effects-objects.md`, Views). 명세의 `supports`에 적힌 뷰(`three-quarter`, `side`, `front`, `rear`, `top`, `low`), 명세 자신의 뷰(`views`), `detail:<part>`(클로즈업), 명세의 `scenes`(소품 `crate`, `bag`, `child-seat`, `bench`, `parcel`, `desk`, `book`, `mug`, `sheet`, `tray`로 싣거나 사용한 상태), 그리고 `colors`를 쓴다. `make-posters.mjs`는 `make.variants`의 항목마다 색별 정지 이미지를 출력한다. `deal.mjs --type product --has object`(하드웨어는 `--kind tech`를 더한다)는 항상 `product` hero를 출력한다. 전폭 무대이며, `split` 열이 아니다.
- 그다음 **전체 제품 페이지**를 만든다. 짧은 페이지가 아니다. 섹션마다 그림 하나씩이며, 제품 전체는 1, 2, 6번 섹션에만 나온다(모든 뷰와 scene은 `make.variants`에 넣는다).
  1. hero, 뷰 **`side`**(가장 넓은 뷰이며, 키가 큰 제품, 램프, 팔이면 `three-quarter`)를 `product` 무대에 통째로 둔다. h1은 제품과 구매자를 밝히고, 주문 행동을 둔다.
  2. 제품, 뷰 **`three-quarter`**(키가 큰 제품이면 `side`). 페이지의 `split`은 이 섹션 하나다. 프레임은 8열, 판매용 수치 세 개는 나머지 4열에 둔다(규칙 6. `bleed`는 hero 바로 다음에 쓰지 않는다).
  3. 제품이 하는 일 또는 싣는 것, 즉 **쓰임새**. 배경이 프레임을 채우는 scene(`three-quarter+loaded`, `work`)을 쓴다. 예를 들어 `desk`를 작업대로 가로질러 두고, `tray`, `parcel`, `sheet`, 상자를 얹는다. 킷의 팔에 트레이 하나만 있으면 그것은 여전히 팔로 읽힌다. 제목의 약속은 읽을 수 있어야 한다(규칙 3). `bleed`를 wrap 전체에 걸고 그 아래 세 개씩 한 줄로 쓰임새를 두거나, `tall-small`에 클로즈업을 붙인다. 브리프가 이름을 적은 모션 비디오는 여기서 그 프레임이 되며, 포스터는 이 scene이 된다(고객사 슬롯).
  4. **부품**, 뷰 **`detail:<part>`**. 클로즈업을 `strip` 또는 `trio`로 두고, 섹션이 이름 붙인 부품마다 하나씩 쓴다(상자, 모터, 그리퍼, 스탠드). 부품이 프레임을 채운다. 또는 분해도를 쓴다. 조립된 부품을 숨기고 같은 부품을 축을 따라 간격을 두고 다시 추가하는 `exploded` scene이며, `three-quarter+exploded`로 촬영한다. 클로즈업 뷰는 명세 자신의 부품만 프레임에 담으므로, 간격을 띄운 부품은 빠진다. 브리프가 이름 붙인 분해 모델은 그 슬롯이다. 또는 사용 방법을 보여 준다. 정지된 다이어그램 카드에 세 단계나 레인(충전, 주행, 주차)을 둔다.
  5. 사양은 `rows--spec`로(띠가 담지 않은 사실만), 정지된 다이어그램 카드나 큰 수치 하나(타입 moment) 옆에 둔다. 브리프가 이름 붙인 구성품 브랜드의 실제 색 아이콘을 쓴다. 이 섹션 또는 2번 섹션이 대비되는 배경이다.
  6. 주문, 뷰 **`rear-quarter`**. 명세 자신의 뷰이며 `supports`에 나열한다(`"views": { "rear-quarter": { "from": "three-quarter", "angle": <명세의 angle + 180> } }`). 라이브 주문 카드(모델이나 크기, 색 견본, 배송 슬롯이나 도시, 갱신되는 가격, 주요 행동)를 선택한 색의 제품 전체 옆에 둔다. 견본이 색을 바꾼다(규칙 5). 주문 구성이며 split이 아니다. [faq, 최대 다섯 개 질문], footer.closing.

  모든 뷰는 정지 이미지다. 제목과 글은 그것이 무엇인지 말하며, 어떤 줄도 그것을 렌더, 모델, 일러스트라고 부르지 않는다(하우스 규칙 1). 보고서에는 찍어야 할 사진을 나열한다(`photos.md`). 그린 SVG, 헬퍼가 조합하지 않은 기본 도형의 모델, 분위기용 스톡, 다른 제조사 제품의 사진, 다른 종류의 object는 절대 쓰지 않는다(바퀴는 자전거가 아니다). **사진도 렌더도 없는 하드웨어도 여기로 간다.** (테스트에서 실크 셰이더와 주문 폼이 있는 로봇 팔 페이지는 졌다. 브리프가 이름만 적고 제공하지 않은 CAD 렌더나 필름은 없는 것으로 치며, 각각 슬롯을 받는다. CAD 프레임은 2번 섹션의 그림이고, 모션 비디오는 3번 섹션, 분해 모델은 4번 섹션의 것이다.) 로봇 팔은 킷의 완성된 `robot-arm` 명세를 따르되, 고객사 고유의 크기, 관절, 색으로 다시 만든다. 드론은 둥근 상자 몸체, 빔 팔, 원통형 모터, 디스크 회전자로 만든다. 카메라는 둥근 상자와 원통형 렌즈로 만든다. 곡면 외피는 실제 치수에 맞춰 둥근 상자와 필레(`round`, `blend`, `seams`)로 만든다. 주문 폼만 담은 `split` hero나, 제품 대신 효과를 두는 것은 절대 쓰지 않는다. 주문 카드는 자기 섹션(6번)이다.
Nav `nav-cards|nav-split|nav-mega` · footer `footer-columns|footer-dark` · close `close-photo|close-type|close-word` · rhythm `dark-band|brand-band`(대비 배경 하나, 규칙 4) · buttons `arrow|solid|block|pill`.
절대 하지 않는 것: 다른 것의 사진, 제품이 갖지 않은 앱의 화면, 로고 줄, 탭, 빠진 것에 사과하는 모든 것, 회색 패널 안의 중간 크기 제품, 제품 전체가 세 섹션을 넘는 것, 같은 뷰를 두 번 쓰는 것, 보여 주지 않은 약속, 제공하고 보여 주지 않은 색, 두 번 쓴 사실.

**Service**(병원, 사무소, 에이전시, 스튜디오, 현장 업종). nav, hero, services-list(각 항목에 한 줄과 시작 가격. 서비스마다 자기 사진이 있으면 peek-list), work(프로젝트 사진 3~6장의 격자, 또는 사례마다 하나씩 쓰는 photo-pair), steps, people-row, proof(브리프가 주는 인용), [pricing-two 또는 `rows` 가격표], [faq], 주소가 있는 booking-form, footer.closing. 그림은 작업물의 사진, 작업 중인 팀과 공간의 사진(화면마다 한두 장), 스튜디오가 실제로 쓰는 도구의 실제 아이콘이다.
Nav `nav-mega|nav-split|nav-centre` · footer `footer-visit|footer-dark|footer-columns` · close `close-type|close-photo` · rhythm `surface-pairs|dark-band|space` · buttons `solid|tonal|block|arrow`.
절대 하지 않는 것: 회사가 운영하지 않는 제품 UI, 스톡 악수 사진, 지어낸 고객의 로고, 탭.

## 4. Place

카페, 바, 빵집, 식당, 게스트하우스와 작은 호텔, 가게, 서점, 꽃집, 자전거 가게, 동네 스튜디오(도예, 요가 등)다. 크리에이티브 에이전시는 service에 남는다. 사람들이 찾아오고 온라인으로 가르치거나 판매도 하는 메이커는 place에 남는다. 문이 결정하며, 웹숍은 그 상품 섹션이다.
`<html data-type="place">`, `<meta name="page-kind" content="place">`를 쓰고, place CSS는 `html[data-type="place"]` 아래에 둔다. 실제 정지 사진, 타이포그래피, 평평한 색이 페이지를 이끈다. 그 주변의 인터페이스는 배경 하나, 잉크 하나, 가는 선, 버튼 스타일 하나로 한다. 레시피와 이 절이 place에서 다르면 이 절이 우선한다. 분위기를 보려면 다음 레퍼런스를 먼저 연다(어느 것도 그대로 베끼지 않는다): Daunt Books, Prufrock, Bourke Street Bakery, Gail's, Tartine, Bonanza(Bonanza에 필름이 있는 자리에는 정지 이미지를 쓴다).

**place에서는 절대 쓰지 않는다:** 효과, WebGL, canvas, CSS 그라디언트, 질감(grain), 유리, 인쇄물, scene, moment, loop, count, UI 조각이나 다이어그램, 기능 카드나 요금제 카드, 탭, 아코디언, 스위치, 로고 줄, 타임라인, 사실 띠(주소나 영업시간을 라벨로 단 것), 달력 카드, 브리프가 주지 않은 거리의 지도, 브리프가 주지 않은 평점, 리뷰, 수치, 인용, 사진 위의 글자, 둥근 모서리나 필터를 씌운 사진, 비치거나 흐린 nav, 윤곽선만 있거나 연하거나 흐리거나 회전된 디스플레이 타입, SaaS 가구(두 가지 색 제목, 채움과 윤곽선이 짝을 이룬 버튼, 점선 타임라인 레일, 캐러셀), 그리고 하나뿐인 브랜드 띠를 제외한 어두운 섹션.

### Plan and length

nav는 화면으로 세지 않으며, `footer.closing`도 하나로 센다. 화면 두 개짜리 섹션은 둘로 센다.

- **전체 페이지:** 사진 12~20장, 화면마다 2~3장, 최대 6화면. 순서는 hero, visit, offer(두 번째 offer가 뒤따를 수 있다. 로스터리라면 메뉴 뒤에 원두), place, 그다음 주문 또는 예약(있을 때 푸터 바로 앞에 두며, close 대신 그 카드나 폼을 둔다), footer.closing이다. 6화면을 넘으면 place를 뺀다. 예약은 빼지 않는다.
- **간결한 페이지:** 사진 8~12장, 4~5화면. 순서는 hero, visit, offer, [place], footer.closing이다.
- **짧은 페이지:** 쓸 수 있는 사진이 8장 미만인 경우(아래 참고). 3화면, 1440에서 2,700px 이하, `<html data-page-mode="short">`를 쓴다.
- **고객사 사진이 없을 때(초안 경로):** `photos.mjs pick --trade <trade> --sections <words> --draft-lead --pictures 12`가 1/3 상한을 풀며, 프레임이 8개에 이르면 페이지는 사진으로 이끄는 완전한 place 페이지가 된다. `pick`은 단어 하나당 프레임 하나를 딜한다. 행이나 디테일마다 단어를 반복한다(`bar,bar,coffee,coffee,beans,beans`; `rooms,rooms,rooms,breakfast,breakfast`). 8개 이상이 될 때까지 반복한다(카페는 8~12, 게스트하우스는 9). **프레임이 하나라도 맞으면 hero는 항상 사진이다.** `pick`이 돌려주는 lead(카페의 바)가 hero가 된다. 업종이 지형으로 이끄는 place(게스트하우스, 로지, 외딴 여관)이고 브리프가 지역을 적은 경우(Westfjords, Lofoten, the Lake District, 도시 이름 등)에는 그 지역을 `--place "<브리프에 적힌 그대로의 지역>"`으로 넘긴다. 그러면 그 지역의 풍경이 lead가 된다. 외딴 place는 그 자리가 곧 상품이기 때문이다(테스트에서 외딴 게스트하우스를 타입 띠로만 보여 주자 3.5점을 받았다). `.ground-brand` 위의 `statement` hero는 라이브러리에 그 지역의 프레임도 lead도 없을 때만 쓴다. 모든 프레임은 교체할 대역(stand-in)으로 보고서에 나열한다. 페이지 어디에도 그렇다고 적지 않는다. **업종이 아니라 개수가 정한다.** 단어를 `pick`이 "no new motif left"(새 모티프 없음)라고 답할 때까지 반복한 뒤, 전부 합해 8개 미만의 프레임(고객사 자체 사진 포함)이면 업종과 상관없이 짧은 페이지다. 빵집은 4개, 꽃집은 3개, 도예나 식당은 0개처럼 예시일 뿐 목록이 아니다. 8~12개는 간결한 페이지이며, 12개 이상이면 전체 페이지다.

이 세 이름은 스킬 전체에서 이 길이만을 뜻한다.
- **섹션별 사진**, 모두 서로 달라야 한다: hero 1장, visit 1장(지도가 있으면 0장), 메뉴나 가격 1장, rooms 2~6장, goods 4장, place 3장(행) 또는 1장(이야기) 또는 벽면, orders 2~3장 또는 booking 1장, close 1장. nav 패널의 사진은 세지 않는다.

### The deal

취향으로 정하지 않는다. hero와 split은 딜하지 않으며, 보여 줄 사진이 남아 있는 동안 close는 `close-photo`다(사진이 없으면 2절의 재딜을 따른다).

```bash
node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" "nav-split|nav-cards" "footer-visit|footer-columns" "surface-pairs|space|colour-band" "block|solid|arrow" "dots|arc|ring|petal|leaf|stack" "pair|strip|tall-small" "bleed|trio|strip|pair|wall|story" "address|name" "row|side"
```

순서대로 읽는다. nav, footer, rhythm, buttons, mark, offer의 구성, place의 구성(offer의 구성과 같은 동안은 다시 딜한다), type moment, rooms 레이아웃이다. Rhythm은 다음과 같다. `surface-pairs`(offer는 `--g-alt` 전폭 띠 하나에 두고, visit 섹션은 페이지 배경 위에 두되 그 패널을 `--g-alt`에 둔다), `space`(전체에 배경 하나, 섹션은 간격으로만 나뉨), `colour-band`(close는 `.ground-brand`에 두며, place 고유 색의 평평한 채움이다. 그러면 푸터에는 그 위를 가로지르는 이름이 없다).

### Designed variety without effects

place는 창의성을 효과가 아니라 사진, 그 배치, 그리고 타이포그래피의 순간 하나에서 얻는다. 테스트에서 규칙에 맞게 만든 카페와 게스트하우스 페이지가 창의성 2.5~4점, 모션 3~4.5점에 머문 것은, 모든 섹션이 한 그림 옆의 텍스트였고 포인터에 반응하는 것이 없었기 때문이다.

- **한 그림을 중심으로 짠 섹션은 두 개를 두지 않는다.** visit은 사진 하나와 함께 6/6 split을 유지한다. 사진이 있는 나머지 섹션은 각각 구성을 하나씩 쓴다. offer와 place는 서로 다른 구성을 쓰고, 이웃한 섹션은 같은 구성을 쓰지 않는다. visit 말고 사진 하나 옆의 텍스트는 페이지당 한 번만 나온다(`story` 또는 예약 폼).
- **다섯 구성**(1200 열, 간격 24, 격자 너비 span-3 282, span-4 384, span-5 486, span-6 588. 모서리는 각지게, 색 처리는 하나, 어떤 사진에도 글자는 없다):

  | id | 1440에서 | 390에서 |
  |---|---|---|
  | `bleed` | `.wrap`의 머리글 행(그 줄은 오른쪽), 그다음 뷰포트 전체에 걸친 사진 한 장, 1440x560, 그 위에는 아무것도 없다. 페이지당 한 번이며, hero 바로 뒤에는 절대 두지 않는다 | 390x488(4:5 크롭) |
  | `pair` | span-6에 같은 비율의 사진 두 장(2화면 섹션에서는 4:3이면 588x441, 4:5이면 588x735), 위쪽을 맞춘다. 그 위에 머리글 행 | 쌓이며, 폭 342, 간격 24 |
  | `trio` | 엇갈린 트리오. span-5(4:5, 486x607), span-4(1:1, 384x384), span-3(4:3, 282x212)에 사진 세 장을 두고, 위쪽을 한 줄에 맞춘다. 하나의 대상 계열 세 가지 크기(방, 그 테이블, 컵) | 첫 번째는 폭 342, 나머지 둘은 165씩 두 줄 |
  | `strip` | 디테일 스트립. span-3(282x282)의 1:1 디테일 네 장, 또는 span-2(180x180)의 여섯 장을 줄에서 줄까지 배치한다. 한 업종의 손, 도구, 재료이며, 섹션의 텍스트나 그룹 아래에 둔다 | 165씩 두 장, 최대 네 장 |
  | `tall-small` | 왼쪽 줄의 span-6에 높은 4:5 사진(588x735). 오른쪽 span-5에는 위쪽에 h2, 그 줄들과 링크를 두고, 아래쪽에 span-3의 1:1(282x282)을 둔다. 그 아랫부분은 높은 사진의 아랫부분과 맞춘다 | 텍스트, 높은 사진은 342, 작은 사진은 165 |

  offer는 `pair`, `strip` 또는 `tall-small`을 딜한다. `strip`은 메뉴 그룹 아래로 가고, `pair`와 `tall-small`은 옆에 사진 슬롯을 차지한다(그룹은 span-6으로 좁아진다). place는 `bleed`, `trio`, `strip`, `pair`, `wall` 또는 `story`(아래 참고)를 딜한다. 객실(rooms)은 자기 격자를 유지한다.
- **디스플레이 타입 moment 하나**(`address|name` 중 딜): `address`는 visit 섹션의 h2 바로 아래에 거리와 지역을 크게 쓴다. 브리프에 거리가 없으면 지역만 쓰며, 지어낸 거리는 절대 쓰지 않는다(`copy.md`). 페이지의 h2 크기에 맞춘 "Find us"를 그 위에 두어 제목 크기가 유지되게 한다. `<p class="type-moment"><a href="<map search>">Mill Street, Leith</a></p>`, 페이지 CSS `.type-moment { font: var(--display-weight) clamp(48px, 7vw, 104px)/1.02 var(--font-display); letter-spacing: -0.03em }`, `.wrap`의 왼쪽 줄에 한두 줄, hover에서 그려지는 밑줄. `name`은 close를 `close-word`로 만든다(h2와 버튼, 그다음 `.wrap`에 걸친 이름). 그 사진은 place의 구성으로 간다. 글자는 배경이나 브랜드 띠 위에 잉크로 쓰며, 윤곽선, 연한 글자, 회전, 사진 위는 쓰지 않는다. 페이지당 하나만 쓴다. 그다음 푸터의 넓게 펼친 이름은 `12vw`(1440에서 약 170px)로 제한하거나 뺀다.
- **보이는 hover:** 어딘가로 가는 모든 사진은 링크다(객실은 예약으로, goods 사진은 카드로, place는 그 이야기로). 프레임 안에서 1.03배로 확대되고, 카드는 2px 떠오른다. 머리글 행의 링크에는 화살표가 붙는다. nav의 단어는 밑줄을 그린다(`motion.md`). hero 다음의 섹션마다 이런 링크가 하나 이상 있어야 한다.
- **화면마다 주요 행동은 하나다:** 거래(Book a room, Order a cake)는 다른 페이지와 같이 nav의 버튼과 hero의 버튼이 되며, 예약이나 close, 그리고 phone bar 외에는 나타나지 않는다. Get directions는 절대 반복하지 않는다. hero의 버튼 하나와 phone bar의 버튼만 쓴다. nav는 "Visit"이라는 단어를 `#visit`로 연결하고, visit 블록은 그것을 위한 두 번째 버튼을 더하지 않는다. 푸터는 주소를 지도에 연결한 텍스트로 주며 버튼으로 주지 않는다(테스트에서 bar, hero, footer에 Get directions가 모두 있자 잡음으로 읽혔다).
- **목록 글자는 16px:** 메뉴 행, 설명, 객실 정보, 영업시간은 최소 16/24다. 흐린 색이 설명을 표시하며, 더 작은 크기로 표시하지 않는다. 13px은 그룹 라벨에만 쓴다.
- **Credits:** 크레딧 목록으로 연결되는 푸터의 한 줄(`photos.md`, Credits)이다. 사진마다 푸터에 링크를 하나씩 두지 않는다.

### The sections (1200 열, x 120 ~ 1320)

- **Hero:** place hero(`layout-v4.md` 3절). 무엇, 어디, 사실 하나를 담는다. h1 "Bakery on Mill Street, Leith"(최대 40자). 부제 "Sourdough, rye and cardamom buns from 7:30, Tuesday to Sunday."(최대 80자). 버튼 하나, 주요 행동.
- **Visit, 항상 두 번째 화면**: `data-place="visit"`와 `id="visit"`를 달고 hero 바로 뒤에 둔다. `--g-alt` 위의 패널(페이지 CSS: `.visit { background: var(--g-alt); padding: 48px }`, span-6에서만. 섹션의 80% 이상을 차지하는 배경 상자는 띠가 되어 `one-section`에서 FAIL한다)과, 가게 정면을 정면에서 찍었거나 문에서 본 방을 담은 1:1 또는 4:3 사진. 6/6이며 패널은 왼쪽에 둔다. `address` type moment가 있으면 h2와 큰 거리 이름이 split 위의 `.wrap`을 가로질러 놓이며(그때 사진은 4:3), 패널은 지금 영업 중 줄로 시작한다. 그렇지 않으면 패널의 맨 윗줄은 h2 "Visit"이고, 오른쪽에 영업 중 줄(`[data-open-now]`)을 둔다. 13px 눈썹 글자는 절대 쓰지 않는다. 16px 아래에는 간격 24의 두 열을 둔다. 왼쪽 열에는 20/30 크기의 두 줄짜리 주소를 지도 검색에 연결해 두고, 전화는 브리프가 번호를 줄 때만 `tel:` 링크로 둔다. 그다음 보조 버튼 하나를 둔다. 주요 행동이 다른 것이면 "Get directions", 브리프가 전화번호를 줄 때만 "Call", 그 밖에는 없다. 오른쪽 열에는 한 주의 영업시간을 둔다(왼쪽에 요일, 오른쪽에 시간, 표 숫자, 요일이나 범위마다 한 줄, 한 가지 크기. 휴일 변경은 위에 한 줄로). 두 열 아래에는 44px 행 최대 두 개를 둔다. 접근성, 꽃집의 배달(지역, 가격, 마감 시각), 게스트하우스의 체크인과 체크아웃, 자전거 가게의 수리 소요 기간, 또는 스튜디오의 "By appointment"다. 390에서는 패널이 먼저 온다(패딩 24, 주소 18/28). 그다음 342 폭의 사진. 영업시간, 주소, 길 안내는 절대 푸터에만 두지 않는다.
- **지도**는 브리프가 거리를 줄 때만 쓴다. `fx-map` 구운 정지 이미지(`effects-creative.md`)를 사진 프레임에 넣고, 핀은 거리 선 위에 둔다. 임베드, 등고선, 점 패턴은 절대 쓰지 않는다.
- **Offer**는 머리글 행으로 시작한다. 왼쪽 줄의 h2는 한 줄, 최대 40자다(32/40, 390에서는 24/30). 오른쪽에는 같은 기준선에 16px 한 줄과 링크("Full menu", "See all")를 둔다. 콘텐츠까지는 56px.
  - **메뉴나 가격**(음료, 빵집 카운터, 수리, 꽃다발 크기, 수업): 그룹은 offer의 딜한 구성을 따른다(Designed variety). `strip`이면 span-4의 그룹 세 개와 그 아래의 디테일 네 장 스트립. `pair` 또는 `tall-small`이면 왼쪽 span-3에 그룹 두 개, 오른쪽 span-6에 사진들. 사진의 위쪽 줄은 그룹 라벨과 맞춘다. 두 그룹은 행 수가 같아야 한다(4 대 5는 `row-lines`에서 실패한다. SR-7: 245/303px). 그룹 하나는 13px 라벨(`.t-label`, weight 500, 잉크), 라벨 아래 12px의 여백, 구분선은 없다(라벨 아래 선은 `section-air`에서 실패한다. SR-3: 부분은 여백과 굵기로 구분한다). 그다음 `.rows`가 온다. 각 행은 자기 1px 선으로 닫히며, 첫 행 위에는 선이 없다. 이름은 16/24/500으로 왼쪽에, 가격은 표 숫자로 오른쪽에 둔다. 선택 설명은 16/24 흐린 색이다. 행은 44px(설명이 있으면 64px)이고, 설명이 있으면 최대 6개, 없으면 최대 8개이며, 나머지는 머리글 행의 링크 뒤로 보낸다. 항상 텍스트로, 전부, 가격이 보이게 한다. 이미지, PDF, 탭, 아코디언으로 쓰지 않는다. 390에서는 한 열이며, 사진은 첫 그룹 뒤에 온다.
  - **객실**: h2 "Rooms and prices", 옆줄 "Breakfast 8 to 10. Check-in from 15, check-out by 11."(샘플 카피는 원문 그대로 둔다). 객실마다 방 전체를 정면에서, 창문 빛으로 찍은 4:3 사진을 쓴다. 간격 20px. 이름(`h3.t-card`, 20/28). "2 guests · 18 m² · garden side"처럼 정보는 16/24 흐린 색으로 쓴다. 가격은 시즌과 함께 16/24로 시작 가격을 쓴다. "Book this room" 링크. `row`: span-4(384x288)에 객실 세 개 또는 span-3(282x212)에 네 개. 객실이 두 개면 항상 `side`. `side`: 머리글이 왼쪽 줄의 첫 셀이 되며, 타일과 위쪽을 맞춘다(객실 두 개는 span-4, 세 개는 span-3, 네 개는 span-4에 객실 2x2, `--h: 2`). 객실이 다섯 또는 여섯 개면 2화면 섹션에서 span-4에 세 개씩 줄을 나눈다. 390에서는 한 열이며 342x256, 간격 48px.
  - **Goods**(원두, 빵, 책, 부품, 꽃다발): span-3에 링크 카드 네 장을 두며, 282x282의 1:1(꽃다발은 282x352의 4:5). 격자마다 비율 하나, 배경 하나, 각도와 빛 하나를 쓴다. 각 카드는 배경에서 한 단계 어두운 평평한 채움이나 1px 가는 선을 쓰며, 그림자, 모서리, 알약 모양은 쓰지 않는다. 카드 안의 사진 아래 패딩에는 이름(두 줄 슬롯, 16/500)과 가격만 둔다. 온라인 판매가 되는 곳에서는 줄에 맞춰 윤곽선 Add 버튼을 둔다. 전체 줄은 한두 개. 390에서는 165씩 두 장으로 나누며, 네 장 또는 여섯 장으로 하고, 그다음 범위로 가는 전체 폭 버튼을 둔다. 가로 스와이프 줄은 쓰지 않는다.
- **Place**(딜): 머리글 행 아래의 다섯 구성 중 하나다(Designed variety). `wall`(머리글 행, 그다음 줄에서 줄까지 이어지는 사진 벽, 간격 0 또는 2px) 또는 `story`(6/6, 왼쪽에 텍스트. 한두 줄의 h2, 누가 운영하는지, 언제부터인지, 정확히 무엇인지를 20/30으로 세 줄에서 여섯 줄, 링크 하나. 오른쪽에는 일하는 사람들의 4:3 사진, 588x441). 페이지당 이야기 행은 하나다. 사진 아래에 이름을 적지 않는다. 390에서 `wall`은 두 줄, `story`는 텍스트가 먼저다.
- **Orders**(케이크, 자전거 수리, 웨딩, 수업): 머리글 행 아래 span-4에 세 종류를 두거나, 첫 span-4에서 머리글 옆에 두 종류를 둔다. 각각 이 가게 자신의 상품을 찍은 4:3 사진(384x288), 1px 가는 선, 13px 라벨, 20/28 제목, 16/26으로 한두 문장을 쓴다. 문장에는 리드 타임, 수령 장소, 시작 가격을 담는다. 화살표가 붙은 텍스트 링크 하나를 둔다. 꽃집의 행사 종류는 보낼 내용을 말한다. 날짜, 장소, 손님 수, 예산.
- **Booking**(객실, 또는 날짜가 있는 수업): 머리글 행("Book a room"; "We reply within a day.")을 두고, 그다음 span-6의 4:3 사진(588x441)과 그 옆에 `--g-alt` 배경의 폼을 같은 높이로 둔다. 패딩은 48px. 도착과 출발을 한 줄에, 손님 수와 이름을 다음 줄에, 이메일, 주요 행동, 14px의 답장 줄을 둔다. 영어가 아닌 페이지에서는 `type=date`가 아니라 텍스트 입력란을 쓴다. 폼 아래에 사진, 질감, 유리를 절대 두지 않는다. 브리프가 이름을 준 예약 시스템이 있으면 그것이 폼을 대신한다.
- **Close:** `close-photo`. h2(최대 여덟 단어), 한 줄("Open today 7:30 to 16:00"), 주요 행동, 그리고 위에서 한 번도 쓰지 않은 1:1 사진이다. 그 사진에는 글자를 절대 올리지 않는다. `colour-band`에서는 `.ground-brand` 위에 두며, 모든 글자는 7:1 대비(`backgrounds.md`)이고 버튼은 반전된다.
- **Footer:** `footer-visit`(span-7에 32/40 크기의 주소를 지도 검색에 연결해 두고, 그 아래에 길 안내 한 줄을 두되 버튼은 없다. 분할 줄의 영업시간에서 오늘 요일을 표시한다. nav 행과, 크레딧 한 줄이 있는 법적 고지 행을 둔다. 그다음 `.wrap` 전체에 걸쳐 디스플레이 서체 400으로 넓게 펼친 이름을 두되, 최대 `12vw`다. 단 `colour-band`이거나 `name` moment가 있으면 예외다) 또는 `footer-columns`(Visit, 주어진 Contact, nav의 단어들, 배달이나 체크인 또는 뉴스레터, 법적 고지 행).
- **Phone bar**(`nav.actionbar`, 필수): 주문이나 예약을 전폭 버튼 하나로 둔다. 둘 다 없으면 Get directions(기본)와 Call(보조, 브리프가 번호를 줄 때만)을 둔다.
- **알림 줄**(꽃집의 배달 마감, 바뀌었거나 휴일인 영업시간): h1 위(`layout-v4.md`)에 번호가 붙은 14px 한 줄을 둔다. 그 사실이 있는 자리에 반복하며, 회전하지 않는다.
- **Split**은 6/6이며, 텍스트는 왼쪽에 두고 위쪽 정렬하며, 좌우 반전은 하지 않는다. 휴대폰에서는 텍스트가 먼저다.

### Order by trade

각각 hero와 visit으로 시작하며, 나머지는 다음 순서로 4~6화면을 쓴다.
- **Cafe:** 구성과 함께 텍스트로 된 메뉴, place(그 구성 또는 이야기 행), 원두나 상품은 팔 때만 둔다.
- **Bakery:** 굽는 것(가격이 붙은 상품), orders(종류마다 카드 하나), 공정(그 구성, `strip` 또는 `trio`, 최대 한 화면). 매장이 여럿이면 줄을 그은 목록으로 하고, 각 매장에 거리를 적는다. 사진이 8개 미만이면(라이브러리는 빵집에 4개를 딜한다) 짧은 페이지다(4절, The short page).
- **Guesthouse or small hotel:** 브리프가 지역을 명시하면 hero는 그 지역의 풍경이다(외딴 집은 그 자리가 곧 상품이다. Fogo Island Inn처럼). 위치는 visit으로 둔다(어떻게 도착하는지. `address` moment가 맞는다). 그다음 객실, 집(공용 공간과 아침 식사는 그 구성에 넣고, 주변 땅은 `bleed`로, 라벨은 없이), 예약. 체크인과 체크아웃은 객실 옆과 푸터에 둔다.
- **Shop or bookshop:** 신상품(Add가 붙은 상품), 카테고리는 평범한 텍스트 목록으로, 이야기 행 하나, 각 매장의 주소와 영업시간과 뉴스레터가 있는 footer. Nav: 카테고리 단어 네 개에서 여섯 개(`system.md` Nav. nav-split에서는 네 개).
- **Bike shop:** visit과 작업장(보통의 수리 소요 기간). 작업장 가격은 "Book a service"가 붙은 줄 있는 행으로 둔다. 신상품(흰 배경의 컷아웃, 이름과 가격), 브랜드는 평범한 텍스트 목록으로, 이야기.
- **Florist:** 배달 지역, 마감, 가격이 있는 알림 줄. 배달과 visit은 두 번째 화면으로 둔다. 꽃다발(4:5 타일 네 장, 각각 시작 가격), 웨딩과 행사(실제 설치물 사진 세 장, 보낼 내용), 워크숍은 줄 있는 행으로.

### Look

- **Grounds:** place의 벽, 종이, 또는 가게 정면에서 가져온 페이지 배경. 기본은 따뜻한 오프화이트(`#F7F3EC`이며, 주로 온라인으로 파는 가게는 흰색), 표면은 한 단계 어두운 색(`#EDE6DA`), 잉크 `#2A2622`, 흐린 색 `#665E55`(배경 위 5.8:1), 가는 선 `#DAD3C8`. 그다음 `start.mjs brand --bg "#F7F3EC" --surface "#EDE6DA" --ink "#2A2622" --muted "#665E55" --accent "#<hex>" --type <pairing>`을 실행한다(색은 따옴표로 감싼다. 따옴표 없는 `#`은 셸 주석이 된다). 전체 표면 띠는 최대 하나다. 브랜드 띠(`backgrounds.md`)도 하나다. 그 띠를 빼고 어두운 섹션은 쓰지 않는다(nav 바는 어두운 잉크를 쓸 수 있다). 평평한 색만 쓴다(`backgrounds.md`).
- **Accent:** 하나만 쓰며, place에서 가져온다(가게 정면의 페인트, 타일, 봉투 라벨). 주요 버튼, 포커스 링, `colour-band` close에 쓴다. 라벨이 4.5:1을 넘고 두 배경 모두에서 3:1을 넘을 때까지 단계적으로 어둡게 한다.
- **Type:** `start.mjs deal --page place`의 조합을 쓴다. 디스플레이 400, 본문 400과 500. 빵집, 로스터리, 게스트하우스, 서점은 세리프 제목에 평범한 산세리프를 쓴다. 가게, 자전거 가게, 꽃집, 스튜디오는 산세리프 하나를 두 굵기로 쓴다. 카페는 부드러운 산세리프를 쓴다. 크기는 `layout-v4.md` 5절.
- **Motion:** hover 레이어만 쓰며(`motion.md`), 그 움직임은 보여야 한다. nav 단어와 링크는 밑줄을 그리고, 링크된 사진은 프레임 안에서 1.03배 확대되며 카드는 2px 떠오른다. 버튼은 움직이고 눌리며, 화살표는 3px 움직인다. 로드나 스크롤에서 스스로 움직이는 것은 없다.

### The short page (사진 8장 미만)

사용할 수 있는 사진이 8장 미만이면 업종과 상관없이(개수는 Plan and length 참고) 세 화면, 1440에서 2,700px 이하다(태블릿은 아래처럼 더 길어진다). 순서는 hero, `--h: 1` 섹션 하나(visit과 offer를 담는다), footer.closing이다. 좋은 사진이 한두 장이면 가장 좋은 것은 hero에 두고, 다른 하나는 섹션에 두며, 그룹과 함께 한 줄에 놓는다(아래 "With its photograph" 참고). 사진이 하나도 없으면 hero는 `.ground-brand` 위의 statement다(`deal.mjs --hero statement`: h1, 부제, 반전된 버튼). 섹션에는 일부러 그림을 두지 않는다. 이것이 "그림 없는 섹션 두 개는 이웃하면 안 된다"는 규칙의 유일한 예외다.
- **섹션**은 페이지 배경 위의 열린 타입이다. 카드나 배경 상자는 쓰지 않는다(`.wrap`을 가로지르면 띠가 된다). offer는 그룹으로 나뉜 줄 있는 텍스트다(메이커의 식기와 그 수업은 가격이 보이는 행 두 그룹). 그다음 visit 블록은 격자의 span-4 세 열로 둔다(주소, 오늘 요일이 표시된 영업시간, 접근성. 전화는 브리프가 줄 때만). 메이커의 이야기는 visit 블록 맨 위의 20/30 단락 하나이며, 자체 섹션이 되지 않는다.
- **사진이 있을 때**(빵집은 프레임 4개를 딜하므로 보통 이 경우다): 그룹과 사진을 하나의 `.grid.grid--top` 줄에 두고, 사진은 맨 뒤에 둔다(hero 다음 프레임이며, `<img>`는 `photos.mjs fetch`가 출력한 그대로). 위쪽 줄은 그룹 라벨과 맞춘다. visit 블록은 그 줄 아래에 `margin-top: var(--s-7)`로 가로질러 둔다. 그룹이 셋이면 각각 `span-3`과 `<figure class="pl-photo span-3" style="--pl-r: 1">`(1:1, 282x282)를 쓴다. 그룹이 둘이면 각각 `span-3`과 `<figure class="pl-photo span-6" style="--pl-r: 1.5">`(3:2, 588x392)를 쓴다. 콘텐츠는 1440에서 약 560px, 페이지는 2,700이다. 그룹 옆의 4:3 `span-6`은 852px까지 늘어나 828px(`section-height`)을 넘는다. 모든 그룹은 행 수가 같아야 하며, 모든 이름은 `span-3`에서 가격 옆에 한 줄로 들어가야 한다(약 24자. "Rye chocolate cake, 10 slices"는 줄이 바뀌어 245/270px이 되므로 `row-lines`에서 실패한다. "Rye cake, 10 slices"처럼 줄인다). 640 미만에서는 섹션에 `--hm: 2`(`style="--h: 1; --hm: 2"`)를 주고, 사진은 그룹 뒤에 16:9로 둔다. 페이지 CSS 규칙을 하나 더 쓴다. `@media (max-width: 639px) { #shop .pl-photo > img { aspect-ratio: 16 / 9; } }`이다(1:1이면 섹션이 두 화면을 119px 넘긴다).
- **Nav와 주요 행동:** 단어 세 개 또는 네 개를 쓰며, 그룹마다 하나씩 그 그룹의 `id`(`#tableware`, `#classes`, `#visit`)를 가리킨다. 주요 행동은 그 일을 하는 그룹을 가리킨다(섹션 1, One page 참고). 스크롤로 표시되는 단어가 없는 섹션이면 `aria-current`는 빼 둔다.
- **사진 없이 다시 딜한 경우**(2절): 패널 없는 `nav-split`, 그리고 `close-word`에서 이름을 뺀 머리글 행으로 된 close. 브랜드 띠(`colour-band`의 close)와 푸터에 넓게 펼친 이름 중 하나만 쓰며, 둘 다 쓰지 않는다.
- **딜에서 빠지는 것.** 이 페이지에는 place 섹션도, 두 번째 offer도, moment를 넣을 자리도 없다. 인쇄된 딜에서는 nav, footer, rhythm(`space`), buttons, mark, offer의 그룹을 짓고, place의 구성, type moment, rooms 레이아웃은 건너뛴다(`address` moment는 만들지 않는다. visit 블록의 세 열이 곧 주소다). 건너뛴 부분마다 계획 둘째 줄에 "not used"라고 적는다.
- **태블릿(640~1023)에서는 섹션이 여전히 한 화면이다.** 768x1024에서 콘텐츠는 600~830px이다. 쌓으면 그룹과 visit 블록이 약 1,600px까지 늘어나 `section-height`와 `one-section`이 FAIL한다. 그 쌓임에 `--h: 2`를 주면 `hole`(768)과 `section-air` WARN(820, 48%)이 남는다. 그래서 세 그룹과 visit의 세 열을 가로로 유지한다. 페이지 CSS 규칙 하나를 쓴다(빌드된 id를 그대로 쓴다): `@media (min-width: 640px) and (max-width: 1023px) { #shop .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } #shop .grid > .span-4 { grid-column: auto; } #shop .visit__cols { grid-template-columns: repeat(3, minmax(0, 1fr)); } }`. 이렇게 하면 콘텐츠는 약 700px이 되며, 640 미만은 `--hm`이 맡는다. 섹션에 사진이 있으면 태블릿에서는 `--h: 2`로 두고 두 화면으로 읽는다. 1화면은 h2와 사진을 전폭으로 두고, 화면의 아래 패딩까지 내린다. 2화면은 그룹을 가로로, visit의 세 열을 두며, `--padt`는 그 위쪽 아래에 둔다(`hole` 없음. 768에서 콘텐츠 1,640 대 2,048). 이 규칙은 위의 규칙을 대체한다(그룹이 두 개라면 `#shop .grid`에 `repeat(2, minmax(0, 1fr))`를 쓴다). `@media (min-width: 640px) and (max-width: 1023px) { #shop { --h: 2; } #shop .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } #shop .grid > :not(.pl-photo) { grid-column: auto; } #shop .grid > .pl-photo { grid-column: 1 / -1; order: -1; } #shop .pl-photo > img { aspect-ratio: auto; height: calc(var(--pl-room) - 1.25 * var(--t-h2) - var(--head-gap)); margin-bottom: calc(var(--padt) + var(--padb) + var(--bar) - var(--card-gap)); } #shop .visit__cols { grid-template-columns: repeat(3, minmax(0, 1fr)); } }`(사진의 높이는 한 줄짜리 h2가 들어갈 자리를 남긴다. 태블릿에서는 h2를 한 줄로 유지한다). 페이지는 1440에서 3화면, 태블릿에서 3~4화면이다.

사진 분위기 스톡, 코드 배경, 드로잉, 빈 상자, 메모는 쓰지 않는다. 보고서에는 찍을 사진을 나열한다(`photos.md`). 좋은 사진이 8장이면 간결한 페이지로, 12장이면 전체 페이지로 커진다. 자기 사진이 없는 place는 먼저 초안 경로를 따른다(Plan and length). 짧은 페이지는 라이브러리가 채울 수 없는 업종(`photos.mjs`가 그 업종을 지정하지 않는 경우. 도예, 식당, 살롱)이거나, Plan and length와 같은 방식으로 셌을 때 프레임 합계가 8 미만인 경우에 쓴다.

## 5. Visuals

- **UI**(`cards.md`): `assets/ui/<name>/fragment.html`을 그 recipe가 정하는 슬롯에 붙이고, 모든 이름, 숫자, 주제, 로고를 고쳐 쓴다. 반복 재생되는 텍스트는 `data-ui-opts`에 쓴다(그 `meta.json`의 `edit`). 붙여 넣은 `<img src="assets/ui/icons/x.svg">`는 킷의 샘플 마크이므로, 각각을 고객사의 도구로 바꿔 쓴다. `<img data-icon="<id>" src="assets/icons/<id>.svg" alt="">`로 쓰면 `icons.mjs scan --colour`가 가져온다. 제품 UI 섹션은 제품 고유의 주제를 보여 주며, 대역 조각을 쓰지 않는다. `data-ui-load`는 킷의 샘플 텍스트를 보여 주므로 초안에서만 쓴다. gaming에는 쓰지 않는다.
- **Diagram cards**(`diagrams.md`): 요점이 연결 방식일 때 쓴다. tech는 펄스가 있는 0~2개, product와 service는 정지된 것 하나, place에는 쓰지 않는다.
- **Real icons**(`icons.md`): 페이지가 이름을 밝히는 모든 도구, 앱, 파일 형식을 그 고유 색으로 쓴다. 다른 페이지에서는 고객사가 실제로 쓰는 도구만 쓴다.
- **Shader grounds**(tech 전용): 효과 하나와 카드 그룹의 정지된 배경(`effects-usage.md`).
- **Photographs**(`photos.md`): 고객사의 것을 쓰고, 없으면 `photos.mjs pick`을 쓴다. 모든 `<img>`는 `data-source`와 `data-subject`를 단다.
