# design-taste-frontend 스킬은 에이전트를 어떻게 바꾸나 {#design-taste-frontend-skill}

이 스킬을 쓰면 에이전트는 회사 웹사이트를 취향으로 꾸미지 않는다. 먼저 업종을 여섯 종류 중 하나로 정하고, 색·글꼴·hero·효과를 스크립트로 뽑고(deal), 스킬에 든 부품으로 조립한 뒤, headless Chrome 검사기의 FAIL을 모두 고칠 때까지 다시 찍어 본다.[](source:fm)[](source:run4)[](source:run6)

- 켜지는 때: 랜딩 페이지나 회사·제품·가게·SaaS·게임 사이트를 만들거나 다듬거나 리뷰할 때, 또는 사용자가 페이지가 "AI가 만든 것 같다"고 할 때다. 호출 제한 필드는 없다.[](source:fm)
- 강제하는 것: 아홉 가지 house rule(스킬 안 다른 규칙보다 앞서는 기본 규칙)과 검사 스크립트 4종이다. 섹션은 1440x900에서 정확히 한두 화면, 카드 loop는 2.5~4초, 살아 있는 WebGL context는 4개까지다.[](source:hr)[](source:run6)
- 업종이 허용 범위를 가른다: shader 효과·scene·moment는 software·gaming·tech(하드웨어) 페이지에만 쓴다. 카페·가게·서비스 업체는 사진, 글자, 단색만 쓴다.[](source:kind-other)[](source:eu-gate)
- 쓰면 안 되는 때: Node 22 이상과 Chrome·Edge·Chromium이 없는 환경이다. 대시보드·앱 화면은 이번 판 description에서 빠졌다.[](source:intro)[](source:fm)

@answer scope="design/taste/design-taste-frontend · 커밋 4e3fc89 · SKILL.md와 references 17개는 전부, scripts는 검사 기준 위주로 읽음 · assets 1,587개는 구조·표본만 · 스크립트는 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source fm title="design/taste/design-taste-frontend/SKILL.md · 21111B · frontmatter" path=design/taste/design-taste-frontend/SKILL.md lines=1:12
@source intro title="SKILL.md · 목표와 실행 조건(Node 22+, Chrome)" path=design/taste/design-taste-frontend/SKILL.md lines=16:21
@source hr title="SKILL.md · House rules 머리말" path=design/taste/design-taste-frontend/SKILL.md lines=23:25
@source hr1 title="SKILL.md · House rules 1~4" path=design/taste/design-taste-frontend/SKILL.md lines=27:32
@source hr5 title="SKILL.md · House rule 5 hover 미세 동작" path=design/taste/design-taste-frontend/SKILL.md lines=33:36
@source hr67 title="SKILL.md · House rules 6~7 사진과 아이콘" path=design/taste/design-taste-frontend/SKILL.md lines=37:41
@source hr8 title="SKILL.md · House rule 8 효과는 기술 업종에만" path=design/taste/design-taste-frontend/SKILL.md lines=42:44
@source hr9 title="SKILL.md · House rule 9 주소와 연락처" path=design/taste/design-taste-frontend/SKILL.md lines=45:46
@source kind-head title="SKILL.md · 1절 업종 선언과 meta" path=design/taste/design-taste-frontend/SKILL.md lines=48:54
@source kind-table title="SKILL.md · 1절 업종 표" path=design/taste/design-taste-frontend/SKILL.md lines=56:63
@source kind-maker title="SKILL.md · 1절 공방·빵집은 place" path=design/taste/design-taste-frontend/SKILL.md lines=65:66
@source kind-other title="SKILL.md · 1절 tech와 other의 구분" path=design/taste/design-taste-frontend/SKILL.md lines=68:70
@source plan-place title="SKILL.md · 2절 place 계획" path=design/taste/design-taste-frontend/SKILL.md lines=76:83
@source plan-prod title="SKILL.md · 2절 product·service와 제품 페이지" path=design/taste/design-taste-frontend/SKILL.md lines=84:95
@source plan-tech title="SKILL.md · 2절 tech 계획" path=design/taste/design-taste-frontend/SKILL.md lines=96:105
@source plan-slots title="SKILL.md · 2절 object 한도와 client slot" path=design/taste/design-taste-frontend/SKILL.md lines=106:114
@source serve title="SKILL.md · 3절 자산별 업종 허용 표" path=design/taste/design-taste-frontend/SKILL.md lines=116:140
@source run1 title="SKILL.md · 4절 1. 브리프" path=design/taste/design-taste-frontend/SKILL.md lines=144:146
@source run2 title="SKILL.md · 4절 2. 문구 먼저" path=design/taste/design-taste-frontend/SKILL.md lines=148:151
@source run3 title="SKILL.md · 4절 3. 화면 단위 계획" path=design/taste/design-taste-frontend/SKILL.md lines=153:158
@source run4 title="SKILL.md · 4절 4. 뽑기(deal)" path=design/taste/design-taste-frontend/SKILL.md lines=160:178
@source run5 title="SKILL.md · 4절 5. 조립" path=design/taste/design-taste-frontend/SKILL.md lines=180:192
@source run6 title="SKILL.md · 4절 6. 검사와 촬영" path=design/taste/design-taste-frontend/SKILL.md lines=194:208
@source run7 title="SKILL.md · 4절 7. 보고" path=design/taste/design-taste-frontend/SKILL.md lines=210:213
@source checklist title="SKILL.md · 5절 체크리스트(검사 id)" path=design/taste/design-taste-frontend/SKILL.md lines=215:262
@source never title="SKILL.md · 6절 Never" path=design/taste/design-taste-frontend/SKILL.md lines=264:274
@source cp-rules title="references/copy.md · 10355B · 다섯 규칙" path=design/taste/design-taste-frontend/references/copy.md lines=8:26
@source cp-tech title="copy.md · 화면당 단어와 tech 단어 예산" path=design/taste/design-taste-frontend/references/copy.md lines=55:61
@source cp-assume title="copy.md · 가정해도 되는 것, 지어내지 않는 것" path=design/taste/design-taste-frontend/references/copy.md lines=70:90
@source cp-credit title="copy.md · 크레딧 한 줄" path=design/taste/design-taste-frontend/references/copy.md lines=91:97
@source cp-contact title="copy.md · 브리프에 없는 연락처" path=design/taste/design-taste-frontend/references/copy.md lines=102:127
@source cp-names title="copy.md · 새 이름 검색과 names.json" path=design/taste/design-taste-frontend/references/copy.md lines=128:132
@source sys-contrast title="references/system.md · 10710B · 글자 대비와 크기" path=design/taste/design-taste-frontend/references/system.md lines=45:56
@source sys-violet title="system.md · 보라·라벤더 금지(hue 270~330)" path=design/taste/design-taste-frontend/references/system.md lines=80:81
@source lv-study title="references/layout-v4.md · 22429B · 327개 사이트 조사" path=design/taste/design-taste-frontend/references/layout-v4.md lines=16:20
@source lv-box title="layout-v4.md · 섹션 상자" path=design/taste/design-taste-frontend/references/layout-v4.md lines=33:37
@source lv-window title="layout-v4.md · 콘텐츠 높이 구간" path=design/taste/design-taste-frontend/references/layout-v4.md lines=43:57
@source lv-fonts title="layout-v4.md · 글꼴 금지와 굵기" path=design/taste/design-taste-frontend/references/layout-v4.md lines=247:255
@source lv-check title="layout-v4.md · check.mjs finding 표" path=design/taste/design-taste-frontend/references/layout-v4.md lines=264:286
@source eu-gate title="references/effects-usage.md · 12922B · 효과 관문(house rule 8)" path=design/taste/design-taste-frontend/references/effects-usage.md lines=9:24
@source eu-table title="effects-usage.md · 업종별 허용 표" path=design/taste/design-taste-frontend/references/effects-usage.md lines=26:37
@source eu-budget title="effects-usage.md · tech 예산" path=design/taste/design-taste-frontend/references/effects-usage.md lines=52:77
@source mom-pages title="references/moments.md · 12760B · moment를 받는 페이지" path=design/taste/design-taste-frontend/references/moments.md lines=12:17
@source sc-who title="references/scenes.md · 8708B · scene을 받는 페이지" path=design/taste/design-taste-frontend/references/scenes.md lines=8:34
@source mo-tokens title="references/motion.md · 12812B · motion token" path=design/taste/design-taste-frontend/references/motion.md lines=28:37
@source mo-loop title="motion.md · 카드 loop 2.5~4초" path=design/taste/design-taste-frontend/references/motion.md lines=64:77
@source mo-pause title="motion.md · tech 예산과 일시정지 버튼" path=design/taste/design-taste-frontend/references/motion.md lines=97:120
@source perf-table title="references/perf.md · 5707B · perf.mjs WARN·FAIL 표" path=design/taste/design-taste-frontend/references/perf.md lines=13:32
@source perf-read title="perf.md · 수치 읽는 법" path=design/taste/design-taste-frontend/references/perf.md lines=3:11
@source icons-src title="references/icons.md · 6758B · 아이콘 출처와 라이선스" path=design/taste/design-taste-frontend/references/icons.md lines=10:31
@source lock title="design/taste/skills-lock.json · 284B · 원격 출처" path=design/taste/skills-lock.json lines=1:11
@source lp-credit title="design/elayadesign/landing-page-design/SKILL.md · r40 확인용 출처 표기" path=design/elayadesign/landing-page-design/SKILL.md lines=451:451
@source lp-desc title="landing-page-design/SKILL.md · description" path=design/elayadesign/landing-page-design/SKILL.md lines=3:3
@source imp-desc title="design/impeccable/impeccable/SKILL.md · r42 확인용 description" path=design/impeccable/impeccable/SKILL.md lines=3:3
@source tk-desc title="design/10k-websites/10k-websites/SKILL.md · r44 확인용 description" path=design/10k-websites/10k-websites/SKILL.md lines=3:3
@source cs-effect title="consistency.mjs · other 페이지 effect-kind 판정" path=design/taste/design-taste-frontend/scripts/consistency.mjs lines=1102:1107
@source cs-loop title="consistency.mjs · loop-cycle 기준" path=design/taste/design-taste-frontend/scripts/consistency.mjs lines=3240:3241
@source cs-words title="consistency.mjs · 화면당 단어 WARN" path=design/taste/design-taste-frontend/scripts/consistency.mjs lines=8402:8410
@source ck-stress title="design/taste/design-taste-frontend/assets/layout/check.mjs · h1 stress 재검사" path=design/taste/design-taste-frontend/assets/layout/check.mjs lines=141:153
@source lc-screen title="assets/layout/layout-check.js · screen-short, screen-height, sparse" path=design/taste/design-taste-frontend/assets/layout/layout-check.js lines=180:183
@source perf-code title="design/taste/design-taste-frontend/scripts/perf.mjs · 예산 표" path=design/taste/design-taste-frontend/scripts/perf.mjs lines=57:61
@source perf-other title="references/perf.md · kind other는 WebGL 0" path=design/taste/design-taste-frontend/references/perf.md lines=40:40
@source st-violet title="design/taste/design-taste-frontend/scripts/start.mjs · 팔레트 보라 필터" path=design/taste/design-taste-frontend/scripts/start.mjs lines=52:53

## 언제 켜지고, 업종에 따라 무엇이 달라지나 {#trigger}

@code source=fm language=yaml

이 스킬에는 호출 제한 필드가 없어서, 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:fm) 판정: `description`은 판단용 설명이다. 나열된 단어가 요청에 있다고 해서 반드시 켜지는 것은 아니다.

- 설명이 든 작업: 랜딩 페이지와 회사·제품·가게·카페·호텔·스튜디오·SaaS·AI·개발 도구·게임 사이트를 만들기, 디자인, 리디자인, 스타일 변경, 다듬기, 리뷰다. 스택은 HTML/CSS, React, Next.js, Vue, Svelte, Astro, Tailwind 중 무엇이든 된다.[](source:fm)
- 설명이 든 불평: 페이지가 generic하다, 템플릿 같다, "AI-made" 같다.[](source:fm)
- 실행 조건: Node 22 이상과 Chrome, Edge, Chromium 중 하나가 필요하다. ffmpeg는 선택이다. 에이전트는 스킬의 `assets` 폴더를 프로젝트 `assets`로 복사하고 `assets/starter.html`에서 시작한다.[](source:intro)

**업종이 모든 것을 정한다.** 에이전트는 계획 첫 줄에 업종(kind)을 쓰고, 같은 값을 `<html data-type>`, `<meta name="page-type">`, `<meta name="site-kind">`에 넣는다. `consistency.mjs`는 이 meta를 읽어 무엇을 허용할지 정한다.[](source:kind-head)

| 브리프 | page type | site-kind | kind |
| --- | --- | --- | --- |
| 앱, SaaS, AI, 개발 도구, 핀테크·은행 앱, 자체 소프트웨어를 파는 스튜디오 | software | software | software |
| 게임, 자기 게임을 출시하는 스튜디오 | software | gaming | gaming |
| 하드웨어나 기술 기기(드론, 로봇 팔, 키보드) | product | tech | tech |
| 그 밖의 실물 제품이나 브랜드(의자, 자전거, 온라인으로 파는 원두) | product | other | product |
| 사람을 고용하는 곳(병원, 법률 사무소, 에이전시, 크리에이티브 스튜디오) | service | other | service |
| 사람이 찾아가는 곳(카페, 바, 빵집, 식당, 게스트하우스, 작은 호텔, 가게, 헬스장) | place | other | place |

[](source:kind-table) 문을 열거나 가르치는 제작자(도자기 공방, 온라인 판매도 하는 빵집)는 place다. 문 앞에서 아무 일도 일어나지 않을 때만 product다.[](source:kind-maker)

원문에서 "tech"는 site-kind가 software, gaming, tech인 페이지이고, 나머지는 "other"다. 효과, scene, moment, loop, 숫자 카운트, CSS ground, 어두운 페이지와 어두운 hero는 tech에만 쓴다.[](source:kind-other) 아래 표는 업종별로 에이전트가 쓸 수 있는 것이다.

| 무엇 | tech(software·gaming·hardware) | product·service | place |
| --- | --- | --- | --- |
| 첫 그림 | 고객 자신의 UI. 하드웨어는 사진이나 render, 게임은 이름과 key art | 고객의 사진. 사진이 없는 실물 제품은 product render | 그 장소의 사진 |
| 효과 하나 | live ground, WebGL 부품, object, big scene 중 하나 {good:1개} | 없음 {bad:금지} | 없음 {bad:금지} |
| moment | 섹션에 최대 2개, hero에 최대 1개, 합쳐서 2개 | 없음 | 없음 |
| big scene | 0~1개(그것이 효과 하나가 된다) | 없음 | 없음 |
| diagram 카드 | 0~2개, pulse 있음 | 0~1개, 정지 | 없음 |
| 사진 수 | 사람·고객·게임 아트 | 사진이 첫 그림 | 전체 페이지 12~20장, 압축형 8~12장, 8장 미만이면 3화면짜리 짧은 페이지 |

[](source:eu-table)[](source:plan-place)

other 페이지에서는 canvas와 WebGL, 자동 재생 영상, 모든 CSS gradient, `backdrop-filter`, `filter`, grain, `[data-fx]`, `[data-moment]`, `[data-big-scene]`, GIF, Lottie, 사용자 지정 커서, 스크롤·애니메이션 라이브러리가 모두 금지다. 허용되는 것은 굽힌 정지 지도(`fx-map`), 그냥 사진인 `fx-photo`, 실제 아이콘, 정지 diagram(place 제외), 사진 없는 실물 제품의 product render뿐이다.[](source:eu-gate)

**쓰면 안 되는 경우**를 원문이 따로 목록으로 적지는 않았다. `원문에 명시 없음`. 대신 아래 신호가 있다.

- 판정: 대시보드·관리 화면·앱 내부 화면은 이번 판의 대상이 아닐 가능성이 크다. 이전 판 `description`은 "app screens: dashboards, admin and analytics views"를 적었지만, 2.5.0의 `description`은 회사 웹사이트만 적고, 이번 최신화에서 `references/app-screens.md`도 지워졌다(감사 패널).[](source:fm)
- 판정: 디자인 시스템이 이미 정해진 프로젝트와는 부딪칠 수 있다. 스킬은 글꼴·hero를 취향으로 고르지 말고 뽑으라고 하고, 보라·라벤더 계열과 Inter·Roboto·Poppins 같은 글꼴을 금지한다. 고객 자체 색은 `start.mjs brand`로 넣을 수 있고, place는 항상 그렇게 한다.[](source:run4)[](source:sys-violet)[](source:lv-fonts)
- 실행 환경: 검사 단계는 스킬 스크립트로 headless Chrome을 하나씩 띄운다. 창이 있는 브라우저나 브라우저 도구는 쓰지 말라고 한다. Chrome이 없으면 6단계를 할 수 없다.[](source:run6)

## 무엇을 강제하나: house rule 아홉 개와 수치 {#rules}

`SKILL.md`는 아래 아홉 가지가 스킬 안의 다른 모든 규칙보다 앞선다고 적는다.[](source:hr)

| # | 규칙 | 에이전트가 하는 일 |
| --- | --- | --- |
| 1 | 그림 밑 설명 금지 | 이미지·render·시각물 아래에 캡션이나 설명을 달지 않는다. 라이선스 크레딧은 footer 한 줄에만 둔다[](source:hr1) |
| 2 | 모든 시각물이 그려진다 | 1440, 1024, 768, 390 폭에서 빈 바탕만 보이는 시각물이 없게 한다[](source:hr1) |
| 3 | 한 화면에 한 섹션 | 첫 화면에는 hero만 둔다. 1440x900에서 모든 섹션을 정확히 1화면이나 2화면 높이로 만들고, 다음 섹션 제목이 엿보이지 않게 한다[](source:hr1) |
| 4 | 좌우 가장자리 일치 | 콘텐츠의 왼쪽·오른쪽 끝선을 맞춘다[](source:hr1) |
| 5 | hover 미세 동작 | 링크 카드는 2px 뜨고, 사진은 틀 안에서 1.02~1.03배 커지고, 카드 loop는 2.5~4초 주기로 반복한다. 기울이기, carousel, 시간에 따라 넘어가는 tab은 쓰지 않는다. 이 motion layer를 지우거나 덮어쓰지 않는다[](source:hr5) |
| 6 | 더 많고 좋은 실제 사진 | 맞는 곳에 실제 사진을 더 쓰고, 바탕·hero·레이아웃·글꼴을 더 좋게 한다[](source:hr67) |
| 7 | 실제 풀컬러 아이콘 | 알려진 제품은 그 제품의 실제 아이콘을 쓰고 직접 그리지 않는다. 카드에는 작은 diagram(허브와 가지, 입력 하나와 처리기와 병렬 lane 셋, 선을 따라 달리는 pulse)을 넣는다[](source:hr67) |
| 8 | 효과는 기술 업종에만 | award 사이트급 scene과 moment는 스킬의 일부다. shader 효과는 기술 주제(tech, AI, 개발 도구, 게임, 핀테크, 하드웨어)에만 쓰고, 동네 카페·빵집·게스트하우스·가게에는 사진을 쓴다[](source:hr8) |
| 9 | 주소와 연락처 | 거리와 동네만 적는다. 번지·우편번호·좌표·사업자 번호·VAT 번호·실제 형식의 전화번호는 쓰지 않는다. 연락처는 `.example` 도메인에 둔다[](source:hr9) |

판정: 이 아홉 개는 대부분 검사기가 측정하는 형태로 적혀 있다. 5절 체크리스트가 줄마다 `consistency.mjs` 규칙 id와 `check.mjs` finding을 붙여 두었기 때문이다.[](source:checklist)

**의무 수치**(원문이 "never", "at most", "exactly"로 적은 것)를 모으면 다음과 같다.

@facts
| 섹션 높이 | 1440x900에서 정확히 1화면 또는 2화면. `min-height`만 쓰거나 `dvh`, 3화면은 금지 |
| 한 화면 콘텐츠 | 1440x900에서 708px(y 120~828). 360px 미만은 위 섹션에 합친다 |
| 검사 폭 | 1440, 1024, 820, 768, 390 |
| tech 화면당 단어 | 60~80단어(UI mock 제외, 권고). 검사기는 섹션이 화면당 90단어를 넘거나 페이지 평균이 80을 넘으면 WARN |
| hero 버튼 | 최대 2개(place는 1개). 페이지 전체 버튼 문구는 10종류 이하 |
| h1 | 2~8단어로 업종을 말한다. place는 40자 이하 |
| 카드 loop 주기 | 2.5~4초 반복. 기본값 3.2초 |
| 일시정지 버튼 | 보이고 5초가 지나도 움직이면 32px 원형 버튼 |
| WebGL context | 동시에 살아 있는 것 최대 4개. `perf.mjs`가 넘으면 FAIL |
| tech 효과 | 효과 1개, moment 1~2개(8섹션 이상일 때 2개), 눈에 띄는 연출(beat)은 최대 3개 |
| 글자 대비 | 읽는 글은 7:1 이상, muted 글은 4.5:1 이상. 13px 미만 글자 금지 |
| 보라 금지 | OKLCH hue 약 270~330도인 token은 255(파랑)나 345(장미) 중 가까운 쪽으로 돌린다. 뽑기에서 보라가 나오면 다시 뽑는다 |
| 글꼴 | 한 family 또는 display+text 두 개. 파일 최대 4개. 굵기 700·800 금지 |
| 크레딧 | footer 한 줄, 110자 이하, 사진가 이름 없이 출처만 |

[](source:lv-box)[](source:lv-window)[](source:run6)[](source:cp-tech)[](source:cp-rules)[](source:mo-loop)[](source:mo-pause)[](source:eu-budget)[](source:sys-contrast)[](source:sys-violet)[](source:lv-fonts)[](source:cp-credit)

**지어내지 않는 것.** 에이전트는 가격·주소·영업시간·날짜를 브리프에서만 가져온다.[](source:cp-assume)

- 브리프에 없을 때 지어도 되는 것은 둘이다. 새로 만든 브랜드 이름, 그리고 place의 그럴듯한 영업시간과 가격(3.60처럼 고르지 않은 값, 현지 통화)이다.[](source:cp-assume)
- 리뷰·평점·인용·고객 수·고객 이름·수상·보도 문구는 만들지 않는다.[](source:cp-assume)
- `sample`, `examples`, `illustrative` 같은 표시와 `[대괄호]`·lorem ipsum·`#` 링크 같은 자리 표시를 남기지 않는다.[](source:cp-assume)

새 브랜드 이름을 지으면 에이전트는 업종과 함께 검색하고 도메인으로도 찾는다. 상위 10개 결과에 같은 업종 사업체나 유명인이 있으면 다른 이름을 짓고, 질의와 결과를 페이지 옆 `names.json`에 적는다. 검색 도구가 없으면 `"searched": false`로 남긴다.[](source:cp-names)

**절대 하지 않는 것**(`SKILL.md` 6절).[](source:never)

- 스크롤에 맞춰 움직이는 카드·행·타일, reveal, fade-in, parallax, 무작위 깜빡임
- 다른 회사 stock 사진을 고객의 제품·사람·장소처럼 쓰기, 제품을 끝내 보여 주지 않는 제품 페이지
- 실제 로고를 비슷하게 그리기, 리뷰·인용·고객·수치 지어내기
- 페이지 자체 디자인에 보라나 라벤더(실제 타사 로고는 제 색을 유지)
- 참고 사이트의 코드·문구·그림·대표 효과 베끼기
- 검사를 통과하려고 스킬의 `assets/`, `scripts/` 파일을 지우거나 고치기. 스킬 파일을 지적한 검사는 보고하고, 무엇을 바꾸든 다시 검사한다

@callout level=warning title="other 페이지에 효과를 넣으면 검사가 막는다"
카페나 법률 사무소 페이지에 shader 바탕, 숫자 카운트, 스크롤 연출을 넣으면 `consistency.mjs`의 `effect-kind`, `effects-fit` 같은 규칙이 걸린다고 체크리스트가 적는다. 에이전트는 이 경우 효과를 빼고 사진, 글자, 단색으로 다시 짠다.[](source:checklist)[](source:eu-gate)

## 어떤 순서로 만드나: 뽑고, 조립하고, 검사한다 {#run}

`SKILL.md` 4절은 일곱 단계를 적는다. 검사에서 FAIL이 나오면 고치고 다시 찍는다.[](source:run6)

@workflow id=taste-run title="tasteskill 2.5의 페이지 제작 순서"
| brief | 브리프 읽기 | external |
| copy | 문구 먼저 쓰기 | backend |
| plan | 화면 단위 계획 | backend |
| deal | 스크립트로 뽑기 | backend |
| build | starter에 조립 | backend |
| check | 검사기와 촬영 | security |
| pass | FAIL 없음? | backend |
| report | 보고 | external |
| brief > copy | |
| copy > plan | |
| plan > deal | |
| deal > build | |
| build > check | |
| check > pass | |
| pass > report | 예 | emphasis |
| pass > build | 아니오 | dashed |

@steps id=taste-run-steps
| brief | 브리프 읽기 | 업종(1절), 파는 것, 사는 사람, 주 행동 하나를 적는다. 주 행동은 거래다(Book a room, Order a cake, Start a free trial). 둘 다 없는 place는 Get directions다. 로고·화면·사진·가격·주소·영업시간 같은 실제 자료도 적는다.[](source:run1) | taste-run | brief |
| copy | 문구 먼저 쓰기 | `copy.md`대로 모든 문구를 먼저 쓴다. h1은 업종과 대상이나 장소를 말하고, 첫 화면에 단단한 사실 하나(숫자, 장소, 가격, 날짜)를 둔다. 버튼은 동사와 목적어다. "Learn more", "Discover", "Click here"는 금지다.[](source:run2)[](source:cp-rules) | taste-run | copy |
| plan | 화면 단위 계획 | 1줄은 업종, 2줄은 뽑은 결과, 그다음 섹션마다 한 줄씩 id, 핵심 하나, 그림과 그 종류, 화면 수(1 또는 2)를 적는다. object 줄은 최대 3개다. tech면 효과·scene·moment가 들어갈 섹션도 적는다. 이때 사진을 고르고, place는 사진 수로 페이지 길이를 정한다.[](source:run3) | taste-run | plan |
| deal | 스크립트로 뽑기 | 취향으로 고르지 않는다. `deal.mjs`가 hero를, `start.mjs deal`이 팔레트 3개와 글꼴 조합 3개를 내고, 각 명령은 `.taste-skill/` 아래에 이력을 남겨 페이지마다 결과가 달라진다. 보라가 나오면 다시 뽑는다. radius는 핀테크·개발 도구 `sharp`, 기본 `soft`, 소비자 앱 `round`, place는 각진 모서리다.[](source:run4) | taste-run | deal |
| build | starter에 조립 | `starter.html`에 `data-type` 등 속성과 meta 세 개를 넣고, 뽑힌 `hero-<id>.html`에서 `<section class="hero …">`만 복사한다. 모든 섹션은 `main > section` 하나에 `.wrap` 하나, h2가 처음, `--h: 1` 또는 `2`다. UI 조각은 `assets/ui/<name>/fragment.html`에서 붙여 넣고 이름·숫자·로고를 고객 것으로 바꾼다. 마지막에 `icons.mjs scan`을 돌려 아이콘을 로컬 파일로 만든다.[](source:run5) | taste-run | build |
| check | 검사기와 촬영 | 스킬 스크립트만 쓴다. 각 스크립트가 CPU WebGL로 headless Chrome 하나를 띄우고 자기 PID로 닫으며, 한 번에 하나씩 돈다. 페이지는 `127.0.0.1`의 http로 띄우고 `file://`은 쓰지 않는다. `consistency.mjs`, `check.mjs`, `shoot.mjs`, `perf.mjs`를 돌리고 1024, 820x1180, 768x1024, 390도 찍는다.[](source:run6) | taste-run | check |
| pass | FAIL 없음? | 모든 FAIL을 고친다. `check.mjs`의 finding은 하나라도 있으면 페이지 실패이고 `--no-stress`는 쓰지 않는다. 에이전트가 오탐이라고 본 FAIL은 이유와 함께 보고서에 적는다. 고친 뒤 다시 찍고, 모든 스크린샷을 체크리스트와 대조해 읽는다.[](source:run6) | taste-run | pass |
| report | 보고 | 업종, 뽑은 결과(팔레트, 글꼴 조합, hero, ground, 효과, moment, scene), 검사기·layout·perf 결과, 확인하지 못한 것, 가정한 가격·시간·주소와 새 이름 검색 결과, 고객이 줘야 할 사진·아트와 대체 프레임, 고객 자산 자리(client slot)와 그 파일을 적는다.[](source:run7) | taste-run | report |

**사람이 개입하는 지점.** 이 스킬은 중간에 사용자 승인을 받는 단계가 없다. 원문에 질문하라는 지시도 없다(`원문에 명시 없음`). 사람의 몫은 마지막 보고서로 넘어간다.[](source:run7)

| 보고서에 남기는 것 | 사람의 몫 |
| --- | --- |
| 에이전트가 가정한 가격·영업시간·주소 | {caution:실제 값으로 확인} |
| 새로 지은 브랜드 이름과 검색 결과(`names.json`) | {caution:이름 확정} |
| 고객이 줘야 할 사진과 아트, 그 자리에 쓴 대체 프레임 | {bad:사진 제공} |
| client slot(트레일러, key art, CAD render 등)과 그 파일 | {caution:파일 제공} |
| 에이전트가 오탐이라고 본 FAIL과 이유 | {caution:판단 검토} |
| 스킬 파일을 지적한 검사 | {caution:확인} |

[](source:run7)[](source:run6)[](source:never)[](source:plan-slots)

## 비슷한 스킬과 무엇이 다른가 {#compare}

이 스킬은 묶음 `site-design-choice`(랜딩 페이지·회사 웹사이트를 만들 스킬 고르기)의 선택지 하나다. 묶음 안 스킬끼리는 서로 부르거나 넘기지 않는다. 작성자가 다른 대안이라서 `같은 계열` 관계만 있다. 전체 비교는 `design/_group-site-design-choice/site-design-choice.html`에 있다.

| rel-id | 상대 스킬 | 관계와 근거 방식 | 무엇이 다른가 |
| --- | --- | --- | --- |
| r40 | `landing-page-design` | 같은 계열, 명시-이름. `landing-page-design` 끝에 일부를 taste-skill(MIT)에서 가져와 다시 썼다는 출처 표기가 있다. taste-skill은 이 스킬의 원격 저장소(`Leonxlnx/taste-skill`)다. 사용 지시가 아니라 계보 표기다[](source:lp-credit)[](source:lock) | `landing-page-design`은 질문·섹션 구성·전환 카피·SEO가 중심이다[](source:lp-desc) |
| r42 | `impeccable` | 같은 계열, 추론. 둘 다 회사·제품 웹 UI를 만들고 다듬으며 흔한 "AI 티"를 없애려 한다[](source:fm)[](source:imp-desc) | `impeccable`은 명령별 디자인 작업(비평, 감사, 다듬기 등)과 디자인 문맥 파일이 중심이고, 대시보드·앱 화면도 다룬다[](source:imp-desc) |
| r44 | `10k-websites` | 같은 계열, 추론. 둘 다 회사·브랜드 웹사이트를 처음부터 만든다[](source:tk-desc) | `10k-websites`는 초보자 안내, OpenArt 이미지·영상 생성, Hostinger 배포까지 데려간다. 이 스킬은 품질 규칙과 검사기가 중심이다[](source:tk-desc) |

판정: 이 스킬만의 특징은 세 가지다. 업종 여섯 가지가 허용 범위를 가르고, 디자인 선택을 이력 파일이 있는 스크립트로 뽑고, 결과를 headless Chrome 검사기로 수치 판정한다.[](source:kind-other)[](source:run4)[](source:run6)

판정: 이 스킬, `impeccable`, `landing-page-design`은 모두 호출 제한 필드가 없다. 셋 다 `description`에 랜딩 페이지를 만들거나 리뷰하는 일을 적었다. 여러 개를 함께 설치하면 같은 요청에 어느 스킬이 켜질지 미리 알기 어렵다. 실제 동작은 확인하지 않았다.[](source:fm)[](source:imp-desc)[](source:lp-desc)

## 검사기는 무엇을 보고 무엇을 실패시키나 {#checkers}

검사 단계의 스크립트는 모두 headless Chrome을 `--disable-gpu --use-angle=swiftshader`로 띄워 WebGL을 CPU로 그린다. 페이지 파일은 `127.0.0.1`의 포트에서 스스로 서빙한다.[](source:run6)

이 분석은 스크립트를 실행하지 않았다. 아래 표는 코드를 읽어 정리한 지시상 동작이다. `consistency.mjs`의 실행 flag는 3655~3660줄에 있다.

| 스크립트 | 무엇을 보나 | 언제 실패시키나 |
| --- | --- | --- |
| `scripts/consistency.mjs` | 리뷰어가 눈으로 잡는 결함을 5개 폭에서 잰다. 규칙 id 120개(본체 100개, 모듈 5개의 20개)이고, 결과는 FAIL과 WARN 두 단계다 | FAIL이 하나라도 있으면 exit 1, 확인하지 못한 폭이 있거나 실행 오류면 exit 2다(10140줄)[](source:run6) {bad:FAIL 1개면 실패} |
| `assets/layout/check.mjs` | `layout-check.js`로 섹션마다 화면 틀(tile)을 잡는다. h1을 `heroes.json`의 `maxChars` 길이로 늘려 한 번 더 잰다(stress) | finding에 등급이 없다. 하나라도 있으면 exit 1이다. SKILL.md는 이 재검사를 끄는 `--no-stress`를 쓰지 말라고 한다[](source:ck-stress)[](source:run6) {bad:finding 1개면 실패} |
| `scripts/perf.mjs` | 1440과 390에서 3번 불러 중앙값을 낸다. 크기·개수는 정확하고 시간은 CPU 렌더링 값이다 | FAIL 행이 있으면 exit 1이다. 호스트 CPU가 50%를 넘으면 시간 항목의 FAIL을 WARN으로 낮춘다[](source:perf-read)[](source:perf-code) |
| `scripts/shoot.mjs` | 전체 페이지와 섹션 tile 스크린샷을 찍는다 | 판정하지 않는다. 사람이 아니라 에이전트가 체크리스트와 대조해 읽는다[](source:run6) |

`consistency.mjs`에서 house rule에 직접 대응하는 규칙과 기준이다. 수치는 코드 기준이다.

| 규칙 id | 기준 | 등급 |
| --- | --- | --- |
| `loop-cycle` | 카드 loop가 4,050ms보다 길면 FAIL, 2,450ms보다 짧으면 WARN(2.5~4초에 ±50ms)[](source:cs-loop) | FAIL / WARN |
| `loop-pause` | 화면에 들어오고 5.2초 뒤 다시 찍어 화면의 0.3% 이상이 바뀌고 pause 버튼이 없으면 FAIL. 코드 9832~9839줄[](source:mo-pause) | FAIL |
| `copy-length` | tech 페이지에서 섹션이 화면당 90단어를 넘고 60단어 이상이거나, 페이지 평균이 80을 넘으면 WARN[](source:cs-words) | WARN |
| `effect-kind` | place·product·service 페이지가 WebGL context, `data-fx`·scene·print, scroll moment, particle, 스크롤 연동 중 하나라도 가지면 FAIL[](source:cs-effect) | FAIL |
| `text-contrast` | 본문은 7:1(큰 글자 4.5:1), 라벨·muted 글은 4.5:1(큰 글자 3:1). 코드 6668~6673줄[](source:sys-contrast) | FAIL |
| `webgl` | 동시에 살아 있는 context가 4개를 넘으면 FAIL. 검사기 자신도 `GL_CAP = 4`(3729줄)로 다섯 번째 context를 막는다[](source:eu-budget) | FAIL |

`check.mjs`의 `layout-check.js`는 섹션이 한 화면보다 짧으면 `screen-short`, 1280 이상과 640 미만 폭에서 정확히 1·2화면이 아니면 `screen-height`, 콘텐츠가 화면의 50% 미만이면 `sparse`를 낸다.[](source:lc-screen)

`perf.mjs`의 예산은 `references/perf.md` 표와 코드 값이 같다. 주요 FAIL 기준은 다음과 같다.[](source:perf-table)[](source:perf-code)

@facts
| 전송량(텍스트 gzip) | 3,000 KiB 초과 FAIL, 1,500 KiB 초과 WARN |
| 이미지 합계 / 가장 큰 이미지 | 2,400 / 700 KiB 초과 FAIL |
| JS / CSS | 900 / 250 KiB 초과 FAIL |
| 요청 수 | 110 초과 FAIL |
| 글꼴 family / 파일 | 3 / 6 초과 FAIL |
| 동시 WebGL context | 4 초과 FAIL(절대 상한) |
| FCP / LCP 중앙값 | 4.5 / 8초 초과 FAIL |
| layout shift 중앙값 | 0.25 초과 FAIL, 0.1 초과 WARN |
| 깨진 요청, 가로 넘침 | 하나라도 있으면 FAIL |

@callout level=open-question title="문서와 코드가 다른 곳"
- 보라 금지 기준이 세 곳에서 다르다. `system.md`는 OKLCH hue 약 270~330, `start.mjs` 팔레트 필터는 LCH hue 275~330(C 0.05 초과), `icons.mjs`는 HSL hue 240~312다. `consistency.mjs`에는 페이지 색의 보라 검사가 없어서, 고객 색을 넣는 `start.mjs brand` 경로는 검사되지 않는다.[](source:sys-violet)[](source:st-violet)
- 화면 높이 정의가 다르다. `layout-check.js`는 fixed nav일 때 viewport 높이를 쓰고, `consistency.mjs`의 섹션 높이 규칙은 900 같은 고정 H를 쓴다. 같은 섹션이 두 검사기에서 다르게 판정될 수 있다. 실행해 확인하지 않았다.[](source:lc-screen)
- SKILL.md는 스크립트를 "한 번에 하나씩" 돌리라고 하지만, 코드에 동시 실행을 막는 lock은 없다. macOS·Linux에서 여러 스크립트는 `taskkill` 실패 뒤 `child.kill()`(SIGTERM)로 Chrome을 닫는다.[](source:run6)
- `perf.md`는 kind other에서 WebGL context가 0이라고 적지만, `SKILL.md`와 `effects-usage.md`는 사진 없는 제품의 product render에 WebGL을 허용한다(still 기본, live는 최대 1개).[](source:perf-other)[](source:eu-gate)

## 이 분석의 범위와 한계 {#audit}

- 끝까지 읽은 텍스트 파일은 19개, 합계 347,624B다. `SKILL.md`, `references/*.md` 원본 17개, `design/taste/skills-lock.json`이다. 이 중 `sections.md`, `sections-library.md`, `photos.md`, `effects-creative.md`, `effects-objects.md` 5개는 분석 보조 에이전트가 끝까지 읽고 줄 번호와 함께 요약했다. 파일별 목록은 같은 폴더의 `files.md`에 있다.
- 검사 기준 위주로 일부만 읽은 파일은 13개, 합계 1,327,112B다. `scripts/*.mjs` 8개, `scripts/*.template.html` 2개(제목만), `assets/layout/check.mjs`, `layout-check.js`, `deal.mjs`다. `consistency.mjs`(885,627B, 10,140줄)는 헤더 주석 1~345줄, 모듈 선언부, CLI·Chrome 실행부(3540~3760), FIX 레지스트리(8005~8132), 집계·exit(10085~10140) 등 약 1,100줄(11%)을 읽고 나머지는 grep으로 위치만 잡았다.
- 구조·표본만 확인(전부 읽지 않음): 1,435개, 합계 7,300,211B다. `assets/` 아래 텍스트 파일 1,433개(아이콘 SVG 958개, JSON 127개, JS 132개, HTML 121개, CSS 83개 등)와 `library/palettes.json`(팔레트 56개), `library/type.json`(글꼴 조합 39개)이다. 카탈로그 JSON은 키 구조와 개수만 봤다. 예를 들어 `assets/icons/index.json`은 앱 458개·파일 형식 38개·UI glyph 435개, `assets/photos/photos.json`은 사진 413장, `assets/effects/index.json`은 효과 25개, `assets/moments/index.json`은 17개, `assets/scenes/index.json`은 11개, `assets/layout/heroes.json`은 hero 11개다.
- 제외한 바이너리: 151개, 합계 25,144,954B다. jpg 39개(9,942,054B), png 46개(5,461,134B), webp 66개(11,741,766B)다. 이미지라서 읽었다고 하지 않는다.
- 제외한 번역본: 커밋된 `*.ko.stale.md` 13개는 열지 않았다. 그중 9개(`README.ko.stale.md`, `references/app-screens`·`colour`·`critique`·`imagery`·`layout`·`research`·`tells`·`type`)는 원본이 이번 최신화로 지워져 짝이 없다.
- 실행하지 않은 것: 스크립트는 하나도 실행하지 않았다. 검사 수치와 exit 동작은 코드를 읽은 지시상 동작이다. `photos.mjs`(picsum.photos, upload.wikimedia.org), `icons.mjs`(cdn.jsdelivr.net), `fx-map/bake.mjs`(OpenStreetMap Overpass)가 네트워크에 접근한다는 것도 코드와 문서로만 확인했다.

**이번 최신화(commit `4e3fc89`)의 변화.** `git show 4e3fc89 --stat -- design/taste` 기준으로 1,664개 파일이 바뀌었다(121,040줄 추가, 35,300줄 삭제). 이전 판은 파일 53개, 약 2.8MB였다.

- 판 이름이 "tasteskill v2"에서 "tasteskill 2.5.0"으로 바뀌었다. 이전 `description`의 "247개 갤러리 사이트 조사"와 앱 화면(대시보드, 관리·분석 화면) 대상이 빠지고, figma.com·x.ai 수준의 회사 웹사이트로 범위가 좁아졌다.
- 지운 것: `README.md`, `evals/evals.json`, `library/` JSON 7개(app, directions, heroes, motions, photos, sections, sites), references 8개(app-screens, colour, critique, imagery, layout, research, tells, type), 검사기 `scripts/lint.mjs`, `inspect.mjs`, `assets.mjs`, `draw.mjs`, `scenes.mjs`와 `scripts/lib/` 5개.
- 새로 생긴 것: `consistency.mjs`(10,140줄), `shoot.mjs`, `start.mjs`, `perf.mjs`, `effects.mjs`, `moments.mjs`, `icons.mjs`, `photos.mjs`, references 13개(backgrounds, cards, diagrams, effects 3종, icons, layout-v4, moments, perf, photos, sections, sections-library, system), 그리고 `assets/` 카탈로그 약 1,587개다.
- 지운 파일을 남은 파일이 가리키는 곳은 없다(grep 확인). 작업 트리에는 빈 폴더 `evals/`와 `scripts/lib/`가 남아 있다. git은 빈 폴더를 추적하지 않는다.

**원문끼리 맞지 않는 곳.** 원문이 우선순위를 적지 않아 그대로 보여 준다.

- `sections.md`는 `deal.mjs --type product --has object`가 언제나 `product` hero를 내고 `split`은 아니라고 한다. `sections-library.md`의 예시는 같은 명령에 "`product` or `split`"이라고 쓴다.
- 제품 페이지 FAQ를 `sections.md`는 5문항 이하로, `sections-library.md`의 `faq` 레시피는 5~8문항으로 적는다.
- `copy.md`는 tech 단어 예산을 화면당 60~80단어로 적지만, `consistency.mjs`는 섹션 90단어 초과 또는 평균 80 초과일 때만 WARN을 낸다.[](source:cp-tech)[](source:cs-words)

@callout level=open-question title="확인하지 못한 것"
- 검사기를 실제로 돌려 보지 않았다. 120개 규칙이 오탐 없이 작동하는지, CPU WebGL에서 효과가 제대로 그려지는지는 모른다.
- `consistency.mjs`의 규칙 120개 중 이 페이지에 기준을 옮긴 것은 약 35개다. 나머지는 이름과 등급만 확인했다.
- 분석 중 바뀐 파일: 분석하는 동안 이 폴더에 커밋되지 않은 번역 파일 23개(`*.ko.md`, `*.ko.md.part01` 등)가 새로 생겼다. 열지 않았고, 분석 근거는 commit `4e3fc89`의 원문뿐이다.
- 사람 검토: 미실시.
