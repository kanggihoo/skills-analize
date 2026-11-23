---
name: design-taste-frontend
description: >-
  tasteskill 2.5.0, 안티 슬롭(anti-slop) 프론트엔드 스킬이다. figma.com과 x.ai 수준의 전문적인 회사 웹사이트를 만든다. 평이한 카피, 하나의 시스템, 화면마다 섹션 하나, 같은 가장자리, 실제 사진과 실제 제품 UI를 쓴다(사진이 없으면 제품 렌더를 쓴다). 셰이더 효과, 장면(scene), 모먼트(moment)는 테크, 게임, 소프트웨어 페이지에만 쓴다. 미세한 인터랙션은 조용하게 두며, 실제 브라우저에서 이 기준을 강제하는 체커를 포함한다. 랜딩 페이지, 회사, 제품, 쇼핑몰, 카페, 호텔, 스튜디오, SaaS, AI, 개발자 도구, 게임 사이트를 만들거나, 디자인하거나, 다시 디자인하거나, 스타일을 바꾸거나, 다듬거나, 검토할 때 사용한다. 스택은 HTML/CSS, React, Next.js, Vue, Svelte, Astro, Tailwind 무엇이든 상관없다. 사용자가 페이지가 범용적이거나, 템플릿처럼 보이거나, "AI가 만든 것 같다"고 말할 때도 사용한다.
---

# tasteskill 2.5

좋은 회사가 내놓을 웹사이트를 만든다. 무엇을 파는지 평이하게 말하고, 모든 화면에서 실물을 보여 주며, 템플릿에서 나온 것처럼 보이지 않고 아트 작품처럼 보이지도 않으며, 이 고객을 위해 만든 것처럼 보이게 한다.
figma.com과 x.ai가 기준이다(말로 된 기준은 `layout-v4.md` 1절에 있다).

`<skill>`은 이 폴더를 가리킨다. Node 22+와 Chrome, Edge 또는 Chromium이 필요하다(ffmpeg은 선택 사항). `<skill>/assets`를 프로젝트의 `assets`로 복사하고 `assets/starter.html`에서 시작한다.

## 하우스 룰

아래 아홉 가지는 이 스킬의 다른 모든 내용보다 우선한다.

1. **이미지, 렌더, 시각 요소 아래에 캡션이나 설명을 달지 않는다.** 라이선스 크레딧은 푸터의 한 줄에만 넣는다.
2. **빈 바탕으로 남는 시각 요소는 없다.** 모든 시각 요소는 1440, 1024, 768, 390 너비에서 그려진다.
3. **화면마다 섹션 하나:** 히어로는 첫 화면에 단독으로 있고, 모든 섹션은 1440x900에서 정확히 한 화면 또는 두 화면 높이이며, 두 번째 섹션 제목이 엿보이지 않는다.
4. **왼쪽과 오른쪽 콘텐츠 가장자리를 같게 맞춘다.**
5. **호버 마이크로 애니메이션:** 링크된 카드는 2px 떠오르고, 사진은 프레임 안에서 1.02-1.03배 확대되며, 버튼은 호버 시 한 단계 움직이고 클릭 시 눌리며, 밑줄은 그려지고, 카드 루프는 2.5-4초에 순환하며 호버 시 반복되고 다시 시작한다. 모션 레이어가 이를 담당하며, 절대 제거하거나 덮어쓰지 않는다. 기울임(tilt), 캐러셀, 시간에 따라 바뀌는 탭은 쓰지 않는다.
6. **맞는 곳에는 더 많고 더 좋은 실제 사진을 쓰며**, 배경, 히어로, 레이아웃, 폰트를 더 좋게 만든다.
7. **실제 전체 컬러 아이콘을 쓴다**(알려진 제품의 실제 아이콘이며, 그려서 만든 아이콘이 아니다). 카드 안에는 작은 다이어그램 시각 요소를 쓴다(허브와 가지, 하나의 입력·메인 프로세서·세 개의 병렬 레인, 선을 따라 달리는 펄스).
8. **큰 어워드 사이트 장면과 크리에이티브 모먼트는 이 스킬의 일부이지만**, 셰이더 효과는 업종에 기술적 주제가 있을 때만 쓴다(테크, AI, 개발자 도구, 게임, 핀테크, 하드웨어). 지역 카페, 빵집, 게스트하우스, 상점에는 절대 쓰지 않으며, 그런 곳에는 사진을 쓴다.
9. **주소:** 거리와 구(district)만 쓴다(거리가 없으면 구만 쓴다). 번지, 우편번호, 좌표는 쓰지 않는다. 법인 등록번호나 부가세 번호도 쓰지 않는다. 실제 형식의 전화번호는 쓰지 않는다. 연락처는 `.example` 도메인에 둔다.

## 1. 업종이 모든 것을 정한다

계획의 첫 줄에 업종을 적고, 페이지에도 그것을 선언한다. `<html data-type>`과 `<meta name="page-type">`에 페이지 타입을 같은 값으로 쓰고, `<meta name="site-kind">`도 쓴다. 장소라면 `<meta name="page-kind" content="place">`를 추가한다. 디스패처(`start.mjs --page`, `moments.mjs --page`)는 마지막 열을 쓰고, 히어로 디스패처는 페이지 타입을 쓴다. `consistency.mjs`는 이 메타들을 읽는다.

| 브리프 | page type | site-kind | kind |
|---|---|---|---|
| 앱, SaaS, AI, 개발자 도구, 핀테크 또는 뱅킹 앱, 자체 소프트웨어를 파는 스튜디오 | software | software | software |
| 게임, 게임을 출시하는 스튜디오 | software | gaming | gaming |
| 하드웨어 또는 기술 기기(드론, 로봇 팔, 키보드) | product | tech | tech |
| 그 밖의 실물 제품이나 브랜드(의자, 자전거, 온라인으로 파는 원두) | product | other | product |
| 사람을 고용하는 곳: 병원, 법률 사무소, 에이전시, 크리에이티브 스튜디오, trade(시공·정비 같은 기술직) | service | other | service |
| 사람이 찾아오는 곳: 카페, 바, 빵집, 레스토랑, 게스트하우스, 소형 호텔, 상점, 꽃집, 자전거 가게, 체육관, 지역 스튜디오 | place | other | place |

만드는 사람이 문을 열거나 가르치기도 하는 곳(도예 스튜디오, 웹숍을 함께 운영하는 빵집)은 **place**다. 그 웹숍은 goods 섹션이 된다. 문 앞에서 아무 일도 일어나지 않을 때만 product다.

아래에서 "테크"는 site-kind가 software, gaming 또는 tech인 것을 뜻하고, "other"는 그 밖의 전부다. 효과, 장면, 모먼트, 루프, 카운트, CSS 바탕, 다크 페이지, 다크 히어로는 테크 전용이다. other 페이지는 사진, 단색 바탕, 타이포그래피, 실제 아이콘, 호버 레이어로만 이뤄진다.

## 2. 업종별 페이지 계획

전체 계획, 딜 목록, 섹션 순서는 `references/sections.md`에 있다.

- **장소**(카페, 빵집, 게스트하우스, 상점). 사진이 앞장선다. 전체 페이지에는 12-20장, 컴팩트 페이지에는 8-12장을 쓰며, 8장 미만이면 3화면짜리 짧은 페이지로 만든다. 업종과 관계없다. 고객 사진이 없으면 드래프트 경로(`photos.md`)를 쓴 뒤 센다. 프레임이 맞으면 히어로는 사진이다(원격지 장소라면 그 지역의 풍경). 방문 블록은 두 번째 화면에 두고, 그다음 제공 항목, 장소, 주문 또는 예약을 둔다. **효과 없는 다양성**(`sections.md` 4절): 제공 항목 섹션과 장소 섹션은 서로 다른 구도를 쓰며, 한 사진을 두 섹션이 나눠 쓰지 않는다. 주소나 이름을 크게 세운 타이포그래피 모먼트는 하나다. 화면마다 주요 액션은 하나다. 목록 텍스트는 16px다. 단색 바탕, 정사각형 사진, 버튼 스타일 하나, 휴대폰 바를 쓴다. 효과, 바탕, 모먼트, 루프, 조각(fragment), 다이어그램, 탭은 쓰지 않는다.
- **제품과 서비스**(site-kind other). 사진이 앞장선다. 제품, 사람, 공간, 작업물을 담으며, 제품 페이지에서는 화면마다 두 장 이상이다. 스튜디오가 쓰는 도구에는 실제 아이콘을 쓰고, 정적 다이어그램은 많아야 하나다. 단색 바탕과 브랜드 띠 하나를 쓴다. 셰이더 효과, 인쇄 질감, 그레인, 그라데이션, 모먼트, 장면, 루프는 쓰지 않는다. WebGL은 제품 렌더에만 쓴다. **사진이 없는 실물 제품은 렌더를 보여 준다:** 그 렌더(`assets/objects/product-render`, 정지 이미지)가 히어로를 이끌고, 그다음에 전체 제품 페이지가 이어진다. 그림이나 무드 스톡으로 대신하지 않는다(`sections.md`).
- **모든 제품 페이지**(사진이 있든 렌더든, 하드웨어도 포함한다. 기준은 Figure와 1X다. `sections.md`, Product): 제품이 온전히 서 있는 자리에서는 제품을 **크게** 보여 준다(프레임의 대부분을 차지하거나, 실제 크기 기준으로 바닥에 놓는다). 회색 둥근 패널 안에 중간 크기로 회색 바탕 위에 두지 않는다. **섹션마다 다른 사진**을 쓰며, 같은 뷰를 두 번 쓰지 않는다. **헤드라인이 내거는 약속은 모두 사진으로 보여 준다**(가족용 자전거라면 아이용 벤치를 보여 준다). 딜(deal, 무작위 선택)된 구도를 쓰며, 같은 구조를 두 번 쓰지 않고, 대비되는 바탕 하나를 둔다. **색상 견본을 바꾸면 사진도 바뀐다.** 모든 색은 한 번씩 보여 준다. **같은 사실을 두 번 쓰지 않는다.** 버튼은 한 단계 움직이고 눌린다(규칙 5).
- **테크**(소프트웨어, 게임, 하드웨어). 고객 자신의 주제가 실제 크기로 앞장선다. 소프트웨어: 자신의 UI를 라이브 HTML로 하나의 `app-frame`에 담아 무엇을 다루는지 보여 준다(코드 리뷰 도구라면 빨간색과 초록색 diff, 그리고 Accept 액션). 일반적인 대시보드나 패널 안의 파편만 보여 주는 것은 안 된다. 카드에는 빛나는 패널 위의 파편, 펄스하는 다이어그램, 실제 아이콘을 쓴다. 하드웨어: 자사 사진을 쓰고, 없으면 위와 같이 렌더를 쓴다. 주문 폼만 있는 분할 히어로나 그려진 SVG는 안 된다. 게임: h1에 게임 이름, 출시 문구, 전체 폭 키 아트로 된 세계관을 둔다(없으면 렌더). 효과가 자리를 차지하는 일은 없어야 한다(`sections.md`, Gaming). UI 목업 밖에서는 **화면당 60-80단어**다(`copy.md`). 딜에 따라 **효과 하나**(히어로의 셰이더 바탕, 또는 `[data-visual]` 프레임 하나, WebGL 부품 하나, 오브젝트 또는 큰 장면 하나)와 **모먼트 하나 또는 둘**을 각자의 섹션에 둔다. 라이브 WebGL 컨텍스트는 최대 네 개다. 스크롤에 따라 움직이는 카드는 없다(`effects-usage.md`).
- **하나의 오브젝트가 페이지를 떠받치지 않는다.** 제품이나 히어로 오브젝트를 온전히 보여 주는 것은 히어로와 **그다음 두 섹션까지**만 맡는다. 나머지는 브리프가 뒷받침하는 다른 종류의 시각 요소가 맡는다(`sections.md` 1절, 표 참고). 예를 들면 게임의 세계관, 팀, 지도. 하드웨어는 작업대에서의 사용 장면, 분해도 또는 부품 뷰. 정적 다이어그램 카드, 타이포그래피 모먼트, 업종이 허용하는 곳의 맥락 사진.
- **고객의 자산에는 슬롯이 주어진다.** 브리프가 언급한 예고편, 키 아트, 스크린샷, CAD 렌더, 모션 영상은 각각 지금 봐도 완성된 것으로 읽히는 프레임을 받는다(키트 포스터가 붙은 실제 `<video>`, 재생할 페이지나 파일이 있을 때만 재생 컨트롤, 키트에서 가져온 세계관 캡처 3-5장, CAD 프레임). 고객 파일을 위해 주석에 이름을 적으며, 절대 비워 두지 않는다(`sections-library.md`, client-slots).

## 3. 무엇이 어떤 페이지에 쓰이는가

페이지가 쓰는 에셋 계열마다 해당 참고 문서를 먼저 연다. 대시(-)는 해당 없음을 뜻한다.

| 필요 | 에셋 | 소프트웨어, 게임 | 하드웨어 | 제품, 서비스 | 장소 | 참고 문서 |
|---|---|---|---|---|---|---|
| 높이, 가장자리, 히어로, 타입 | `system.css`, `assets/layout` | 딜된 히어로 | 딜된 히어로 | 딜된 히어로 | 장소 히어로 | `layout-v4.md` |
| 섹션과 레시피 | `starter.html` | 자체 계획 | 제품 계획 | 자체 계획 | 장소 계획 | `sections.md`, `sections-library.md` |
| 토큰, 그리드, 버튼, 내비, 푸터, 색 | `system.css`, `system.js` | 예 | 예 | 예 | 장소 토큰 | `system.md` |
| 카피, 연락처, 크레딧 | | 예 | 예 | 예 | 예 | `copy.md` |
| 호버, 누름, 포커스, 내비, 탭 | `assets/motion` | 예 | 예 | 예 | 예 | `motion.md` |
| 카드 루프, 카운트 | `assets/motion`, `assets/ui` | 예 | 예 | - | - | `motion.md`, `cards.md` |
| 사진 | `scripts/photos.mjs` | 사람, 고객, 게임의 아트 | 앞장 | 앞장 | 앞장, 12-20 | `photos.md` |
| 실제 도구, 앱, 파일 아이콘 | `scripts/icons.mjs` | 예 | 예 | 실제로 쓰는 도구 | - | `icons.md` |
| 기능 카드, UI 파편 | `assets/ui` | 앞장(게임: 없음) | 자사 앱 | 고객이 운영하는 앱 | - | `cards.md` |
| 다이어그램 카드(허브, 레인, 펄스) | `assets/diagrams` | 0-2, 펄스 | 0-2, 펄스 | 0-1, 정적 | - | `diagrams.md` |
| CSS 바탕 | `assets/backgrounds` | 0-2 딜됨 | 0-2 딜됨 | 단색 토큰 | 단색 토큰 | `backgrounds.md` |
| 셰이더 바탕 | `assets/effects` | 효과 하나 | 효과 하나 | - | - | `effects-usage.md` |
| 크리에이티브 파츠(`fx-*`) | `assets/components` | 예 | 예 | `fx-photo`는 평범하게, `fx-map`은 정적으로 | `fx-map`은 정적으로 | `effects-creative.md` |
| 오브젝트와 인쇄물 | `assets/objects` | 효과로서 하나. 아트가 없는 게임은 렌더 | 사진 없이 렌더 | 사진 없이 렌더 | - | `effects-objects.md` |
| 어워드 사이트 모먼트 | `assets/moments` | 0-2 | 0-2 | - | - | `moments.md` |
| 큰 장면 | `assets/scenes` | 0-1 | 0-1 | - | - | `scenes.md` |
| 속도와 용량 | `scripts/perf.mjs` | 예 | 예 | 예 | 예 | `perf.md` |

첫 페이지를 만들기 전에 `copy.md`, `system.md`, `layout-v4.md`, `sections.md`를 처음부터 끝까지 읽는다.

## 4. 실행 순서

1. **브리프를 읽는다.** 업종(1절), 무엇을 파는지, 누가 사는지, 주요 액션 하나(거래: Book a room, Order a cake, Start a free trial. 둘 다 없는 장소라면 Get directions)와 실제 재료를 적는다. 재료는 로고, 화면, 사진, 가격, 주소, 영업시간이다.

2. **카피를 먼저 전부 쓴다.** `copy.md`의 말대로 한다. h1에는 카테고리와 구매자 또는 장소를 적는다(게임이라면 이름과 장르). 첫 화면에는 단단한 사실 하나를 둔다. 모든 제목에 명사를 하나 넣는다. 버튼은 동사와 목적어로 쓴다. 새로 지은 브랜드명(먼저 검색하고, 결과는 페이지 옆 `names.json`에 보관한다)과, 장소라면 그럴듯한 영업시간과 가격을 제외하고는 아무것도 지어내지 않는다.

3. **페이지를 화면 단위로 계획한다.** 첫 줄: 업종. 둘째 줄: 딜(4단계). 그다음 섹션마다 한 줄씩 쓴다. 섹션 id, 한 가지 아이디어, 그림과 그 종류(object, use, parts, world, slot, diagram, type. object 줄은 최대 세 개), 화면 수(1 또는 2, 콘텐츠 높이에 따른다. `layout-v4.md` 2절), 테크라면 효과, 장면 또는 모먼트가 어느 섹션에 있는지. 사진은 지금 고른다(`photos.md`). 대체 사진을 포함한 사진 수가 장소의 페이지 길이를 정한다(2절). 그다음 `cards.md`와 `sections-library.md`에서 쓰는 모든 id의 레시피를 읽는다.

4. **취향으로 고르지 말고 딜한다.** 각 명령은 이력을 남기므로 페이지마다 결과가 달라진다:

   ```bash
   node <skill>/assets/layout/deal.mjs --type <page type> --has <photo,ui,object,film> --history .taste-skill/layout-history.json   # the hero; a game adds --kind gaming, hardware --kind tech
   node <skill>/scripts/start.mjs deal --page <kind> --history .taste-skill/history.json    # three palettes, three pairings; add --axis after a word or editorial hero
   node <skill>/scripts/start.mjs css --page <kind> --palette <id> --type <id> --radius soft --history .taste-skill/history.json
   node <skill>/scripts/start.mjs brand --page place --bg "#.." --ink "#.." --accent "#.." [--surface "#.."] [--muted "#.."] --type <id> --radius soft   # a place: its own colours, in place of css
   node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" <the kind's lists in sections.md>
   ```

   사진도 아트도 없는 제품, 하드웨어, 게임은 `--has object`로 딜한다. 항상 `product` 히어로이며, 렌더의 가장 넓은 뷰를 랩 전체에 쓰고 박스는 없앤다(게임은 항상 `--has`를 넘긴다). 장소의 히어로는 딜하지 않고 출력된 대로 쓴다(`--type place`). 페이지에 없는 사진이 필요한 딜된 부품은 다시 딜한다(`sections.md` 2절). 고객에게 맞는 팔레트와 페어링을 고른다(고객 고유의 색은 `start.mjs brand`로 쓰며, 장소에는 항상 쓴다. `sections.md` 4절 Look 참고). 보라색(violet)은 절대 쓰지 않으며, 나오면 다시 딜한다. `:root` 블록은 출력된 그대로 둔다. 라디우스: 핀테크와 개발자 도구는 `sharp`, 기본은 `soft`, 소비자 앱은 `round`, 장소는 square다. 테크에서만: 밝은 바탕(`<html data-ground>`: 한 줄 명령으로 `sand|sky|sage`), CSS 바탕(`backgrounds.md`), 효과 하나(`effects-usage.md`), 모먼트(`moments.md`). 결과는 모두 계획 둘째 줄과 `<body>` 맨 위 주석에 적고, 정확히 그대로 만든다(짧은 페이지는 섹션이 없는 항목을 뺀다. `sections.md` 4절).

5. **만든다.** `starter.html`에서 `<html data-type data-radius data-buttons data-motion>`과 세 개의 메타, 내비 클래스를 설정한다. `assets/layout/hero-<id>.html`에서는 `<section class="hero …">`만 복사한다(내비, 다른 섹션, 푸터, 크레딧 줄은 복사하지 않는다. 모든 단어와 그림은 고객의 것이 된다). 딜된 마무리(close)와 푸터는 `<template>`에서 꺼내고, 나머지는 삭제한다. 모든 섹션은 `.wrap` 하나를 가진 `main > section`이며, h2가 맨 앞에 오고, `--h: 1` 또는 `2`다. 각 섹션은 레시피대로 시스템의 클래스와 토큰으로 만든다. 참고 문서가 페이지 CSS를 명시한 곳(시각 요소 안의 `--p-h`, `.wall`, `.rail`, `.device`)에서만 페이지 CSS를 쓴다. UI는 `assets/ui/<name>/fragment.html`에서 붙여 넣고, 모든 이름, 숫자, 로고를 고객의 것으로 바꾼다(키트 아이콘은 `data-icon`이 된다. `cards.md`). 다이어그램 카드는 `data-diagram="<preset>"`에 고객의 라벨을 붙인다. 마지막에 `icons.mjs scan index.html --out assets/icons --colour`를 실행해, 페이지가 쓰는 모든 아이콘이 로컬 파일이 되게 한다. 효과, 오브젝트, 모먼트, 장면은 참고 문서가 말하는 그대로 연결하며, 자신이 만든 스크립트로 연결하지 않는다. 크레딧: 마크업이 사진을 쓰면 `photos.mjs credits`가 만든 푸터 한 줄을 넣는다(페이지를 읽어서 만든다).

6. **검사하고 본다.** 스킬의 스크립트만 쓴다. 각 스크립트는 CPU에서 WebGL을 켠 헤드리스 Chrome 하나를 실행하고, 자신의 PID로 종료하며, 한 번에 하나씩 돌린다. 창이 있는 브라우저나 브라우저 도구는 절대 쓰지 않는다. 각 스크립트는 페이지 파일을 127.0.0.1에서 http로 직접 제공하므로(`file://`은 절대 쓰지 않는다) 별도 서버가 필요 없다. 링크가 사이트 루트에서 시작하는 빌드된 페이지(`/_astro/page.css`)는 빌드 폴더(`dist`)와 함께 `--root`를 넘긴다. 그다음 실행한다:

   ```bash
   node <skill>/scripts/consistency.mjs index.html --widths 1440,1024,820,768,390 --rhythm-widths 1440,820,768,390 --profile <dir> --page <kind> --category "<what is sold>" --primary "<main action>"
   node <skill>/assets/layout/check.mjs --url index.html --profile <dir> --sizes 1440x900,1024x768,820x1180,768x1024,390x844 --shots shots/layout
   node <skill>/scripts/shoot.mjs --url index.html --w 1440 --out shots/1440.png --profile <dir>
   node <skill>/scripts/perf.mjs index.html --profile <dir>
   ```

   1024, 820x1180, 768x1024, 390에서도 촬영한다. `check.mjs`가 낸 모든 지적은 페이지를 실패시킨다(`--no-stress`는 쓰지 않는다). 모든 FAIL을 고친다(거짓이라고 판단한 것은 근거와 함께 보고서에 적는다). 다시 촬영하고, 모든 스크린샷을 체크리스트와 대조해 읽는다.

7. **보고한다:** 업종, 딜(팔레트, 페어링, 히어로, 바탕, 효과, 모먼트, 장면), 체커·레이아웃·성능 결과, 확인하지 못한 것, 가정한 가격·영업시간·주소와 새 이름의 검색 결과, 고객이 제공해야 할 사진과 아트(대체 프레임을 포함한 모든 것), 모든 고객 슬롯과 그 파일, 그리고 각 슬롯의 대체물.

## 5. 체크리스트

각 줄에는 확인 항목이 적혀 있다. 대괄호 안은 `consistency.mjs`의 id, 중괄호 안은 `check.mjs`의 지적이며, `perf.mjs`의 행은 성능 항목이다. 마지막 줄은 사람이 눈으로 확인한다.

- **첫 화면:** 무엇을 파는지, 누구를 위한 것인지 또는 어디인지를 단단한 사실 하나와 함께 말한다 [copy-headline, copy-fact]. 히어로가 모든 너비에서 혼자 화면을 채우며, 주요 버튼이 그 안에 들어 있다 [hero-screen, hero-fill, fold-action, fold-cut] {hero-fold}.
- **화면마다 섹션 하나:** 모든 섹션은 1 또는 2화면이며, h2가 맨 앞에 오고 위쪽에 맞춰진다. 이웃 섹션의 제목이나 그림이 타일 안에 들어가지 않으며, 성긴 곳이 없다 [section-height, one-section, one-heading, section-air, one-screen, section-gaps] {screen-short, screen-height, sparse, neighbour, neighbour-ground}.
- **같은 가장자리:** 모든 블록은 `.wrap` 선이나 그리드 열에 맞고, 한쪽으로 튀어나오는 것이 없으며, 좌우 스크롤이 없다 [container-edges, row-lines, split-pair, off-grid, right-edge, col-edge, spill, off-viewport, stagger, top-stagger] {edge-left, edge-right, spill, bleed-one-side, one-sided, lines}.
- **모든 시각 요소가 그려진다.** 1440, 1024, 768, 390에서 그려지며, 거부된 효과는 정지 대체 이미지를 보여 준다 [visual-empty, empty-visual, gl-fallback, shader-lint, no-visual, photo-weight].
- **캡션 없음:** 어떤 캡션도 그림을 설명하거나, 사과하거나, 이름 붙이지 않는다. 크레딧은 푸터 한 줄에 둔다 [visual-caption, caption, credit-wall, photo-credit]. 플레이스홀더, 샘플 안내, 인쇄된 `.example` 주소가 없다 [placeholder, sample-label].
- **업종에 맞는 것:** 테크 밖에서는 효과 바탕, 인쇄 질감, 장면, 모먼트가 없다(WebGL은 제품 렌더에만) [effect-kind, effects-fit, photo-print]. 주제 자체가 보인다. 제품은 크게, 최대 세 섹션에 걸쳐 온전히 보이며, 매번 새 사진이다 [product-shown, same-object, photo-repeat]. 브리프가 명시한 각 에셋은 자기 슬롯에 있다. 게임의 이름과 세계관은 키 아트로 있고, 코드 리뷰 도구의 diff, 소프트웨어의 `app-frame`이 있다. 실제 사진은 어울리는 곳에 쓰며 두 번 쓰지 않는다 [photo-set, photo-repeat, photo-upscale]. 실제 아이콘은 자기 색을 유지한다. 그 밖의 업종은 단색 바탕을 쓴다 [grounds]. 장소는 서로 다른 두 구도와 타이포그래피 모먼트 하나를 딜한다.
- **모션:** 모든 버튼, 링크, 링크된 카드, 링크된 사진이 포인터에 눈에 띄게 반응하며, 기울어지는 것은 없다 [motion-layer, hover, hover-move, tilt]. 카드 루프는 2.5-4초에 순환한다 [loop-cycle]. 페이지가 스크롤되었다고 움직이는 것은 없다. 다만 테크에서 딜된 모먼트나 자기 섹션 안의 큰 장면은 예외다 [scroll-linked, scroll-reveal, pinned: 이 자리에서만 허용]. 5초를 넘는 움직임에는 일시정지 버튼이 있다 [loop-pause]. 감소된 모션(reduced motion)에서는 모든 것이 멈추고 아무것도 숨겨지지 않는다 [reduced-motion, hidden-content]. 라이브 컨텍스트는 최대 네 개다 [webgl].
- **연락처:** 규칙 9와 같다 [street-number, postcode, coordinates, company-number, phone-number].
- **하나의 시스템:** 버튼 쌍 하나, 카드 스타일 하나, 라디우스 스케일 하나, 링크 모양 하나 [button-styles, button-shape, card-family, card-layout, link-styles]. 상자는 최대 두 겹까지 중첩한다 [nesting]. 제목 스케일 하나, 그 글꼴은 모두 로드된다 [heading-scale, font-load]. 텍스트 대비 [text-contrast, contrast].
- **카피와 링크:** 제목은 사물을 이름 붙이고, 버튼은 동사와 목적어로 쓰며, 히어로 액션은 최대 두 개다 [copy-headings, copy-buttons, copy-actions, action-count]. 같은 사실은 한 가지 표현으로 쓴다 [fact-agree]. 모든 링크는 제대로 이동하고, 폼은 전송된다 [links, forms].
- **빠름:** `perf.mjs`에 FAIL 행이 없다(이미지 용량, 컨텍스트, 레이아웃 이동).
- **820, 768, 390:** 섹션은 자기 화면에 맞고 [section-height], 첫 화면은 온전히 끝나거나 분명한 bleed에서 끝난다 [fold-card](`layout-v4.md`). 분할 레이아웃은 텍스트가 먼저 오도록 쌓으며, 반쯤 빈 행은 없다. 390에서는 한 열이고, 버튼은 전체 너비이며, 메뉴는 전체 화면이다. 장소는 액션 바를 쓴다.
- **눈으로 확인:** figma.com과 x.ai 화면 옆에 두었을 때 전문적인 회사 사이트로 읽힌다. 기울어지거나, 엇갈리거나, 잘리거나, 겹치는 것이 없다. 히어로는 작품이지 분위기가 아니다.

## 6. 하지 말 것

- 스크롤에 따라 움직이는 카드, 행, 타일. 리빌, 페이드인, 패럴랙스, 무작위 깜빡임.
- 스톡 사진을 고객의 제품, 사람, 장소인 척 쓰는 것. 제품을 한 번도 보여 주지 않는 제품 페이지.
- 실제 로고를 닮게 그린 것. 지어낸 리뷰, 인용, 고객, 수치.
- 페이지 자체 디자인에 보라색이나 라벤더를 쓰는 것: 강조색, 바탕, 그라데이션, 효과 색, 틴트 모두 해당된다(실제 제3자 로고는 자기 색을 유지한다. `icons.md`).
- 참고 사이트의 코드, 카피, 사진, 대표 효과를 베끼는 것.
- 체크를 통과시키려고 키트의 파일(`assets/`, `scripts/`)을 지우거나 고치는 것. 키트 파일을 지적한 체크는 보고하며, 어떤 변경 후에도 페이지를 다시 검사한다.

## 참고 자료

모두 `references/`에 있다. 3절이 각 에셋에 필요한 문서를 적어 둔다.
