# Upgrades After the First Build: More Pages and a Second Language

요청받은 범위부터 시작한다. 보통은 완성된 페이지 하나다. 추가 페이지나 언어는 preview 후 관련이 있을 때만 제안한다. 이미 승인된 launch를 지연시키지 않는다. 추가 작업의 글쓰기, 이미지, 검수 공수를 이 프로젝트에 맞게 추정한다. GPT 사용량이나 생성 비용의 고정 비율을 약속하지 않는다.

## More pages (multi-page site)

방문자가 자세히 보고 싶어 할 것이 여러 개 있을 때 제안한다. 예: 객실, 요리나 메뉴, 서비스, 프로젝트, 제품. 항목마다 상세 페이지가 있으면 랜딩 페이지가 아니라 $10,000짜리 사이트처럼 느껴진다.

**구조:**
```
site/index.html             the home page (the scroll scene stays here)
site/services/consultation.html   one page per item, in a folder named for the group
site/about.html             optional: the people and the story
site/contact.html           optional: when the form deserves its own page
```
- 모든 페이지에서 root-relative 링크와 에셋을 쓴다(`/style.css`, `/assets/consultation.webp`, `/services/consultation.html`). 하위 폴더의 페이지도 에셋을 찾을 수 있게 한다.
- 공유 header와 footer를 모든 페이지에 동일하게 복사하고, header에는 `class="site-header"`를 붙인다.
- 모든 페이지에는 고유한 `<title>`, meta description, `<h1>` 하나, canonical link, 공유 이미지가 있어야 한다.
- 내부 페이지는 스크롤 장면을 반복하지 않는다. 대신 `expand` 또는 큰 정지 히어로를 준다(`effects.md`).
- 모든 페이지에 `pages.css`(스킬의 `engine/`에서 가져온다)를 추가한다. 페이지 전환을 부드럽게 만든다. "사진이 다음 페이지로 커지는" 순간을 만들려면, 홈의 카드 사진과 상세 페이지의 히어로 사진에 같은 `style="view-transition-name: item-consultation"`을 준다. 각 이름은 페이지마다 한 번만 쓴다.
- 모든 페이지에 같은 폼으로 연결되는 하나의 call to action을 유지한다.

`check.mjs`는 모든 페이지와 페이지 사이의 모든 링크를 검사한다. `report.mjs --seo https://their-domain.com --seo-only`는 sitemap에 모든 페이지를 나열한다.

## A second language

방문자가 다른 언어를 쓰는 고객(관광객, 이중 언어 도시, 국경 간 고객)일 때, 또는 사업주의 모국어가 영어가 아닐 때 제안한다.

**구조:** 주 언어는 루트에, 두 번째 언어는 같은 파일 이름을 가진 자체 폴더에 둔다:
```
site/index.html        (lang="en")
site/es/index.html     (lang="es")
site/es/services/consultation.html
```
- 모든 페이지에서 `<html lang="..">`를 설정하고, 각 버전을 가리키는 `<link rel="alternate" hreflang="en" href="https://domain/">`과 `hreflang="es"`를 넣는다. 모두 전체 https 주소여야 한다.
- Header의 언어 전환은 홈이 아니라 같은 페이지의 다른 언어 버전으로 연결한다. 라벨은 해당 언어의 자체 이름을 쓴다("Español", "English").
- 두 번째 언어는 디자인 패키지를 바탕으로, 브랜드의 말투를 유지하면서 원어민 카피라이터가 쓰듯 작성한다. 브랜드명, 고유 명사인 제품명이나 장소명, 사업주의 인용문은 번역하지 않는다. 날짜, 가격, 전화번호 형식은 현지에 맞게 조정한다.
- 라이브 전에 사업주(또는 신뢰하는 사람)에게 두 번째 언어를 읽어 달라고 요청하고, 이를 분명히 말한다: "좋은 스페인어를 쓰지만, 출시 전에 원어민이 한 번 읽어 보는 것이 좋습니다."
- 폼은 두 언어에서 동일하게 동작한다. 각 폼에 고유한 `data-k-form` 이름(`booking-es`)을 주면, 문의함에서 방문자가 어떤 언어를 썼는지 알 수 있다.
