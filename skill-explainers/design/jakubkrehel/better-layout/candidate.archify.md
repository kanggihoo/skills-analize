# better-layout 스킬은 에이전트를 어떻게 바꾸나 {#better-layout-skill}

`better-layout`을 쓰면 에이전트는 배치를 취향으로 평가하지 않고, 묶음·정렬·읽는 순서·반응형 구조·번역 글자 여유를 열두 원칙으로 점검한다. 지적은 잘림·겹침·깨진 mirror·잘못 읽히는 묶음처럼 화면에서 보여 줄 수 있는 실패가 있을 때만 쓴다. 결과는 지적 표 하나와 `Block` 또는 `Approve` 한 단어다.[](source:ly-find)[](source:ly-fmt)[](source:ly-end)

- 켜지는 때: 호출 제한 필드가 없다. 모델이 `description`을 보고 켤 수 있고, `better-interface`는 도메인 리뷰 두 번째 순서로 이 스킬을 의무로 불러 온다.[](source:ly-fm)[](source:bi-order)
- 강제하는 것: 지적 하나에는 보여 줄 수 있는 실패 하나가 필요하다. 시작값과 다르다는 이유만으로는 지적이 아니다. 320px 폭이나 200% zoom의 잘림·겹침은 언제나 `HIGH`다.[](source:ly-find)[](source:ly-sev)
- 대표 수치: 그룹 사이 간격은 그룹 안의 2× 이상, 테두리 없는 컨트롤은 글리프 사이 `24px`, 숨은 내용은 `16–32px` peek이다. 모두 프로젝트에 spacing scale이 없을 때의 시작값이다.[](source:ly-find)[](source:ly-p1)[](source:ly-p7)[](source:ly-p8)
- 쓰면 안 되는 때: 원문은 거절 조건을 따로 적지 않는다(`원문에 명시 없음`). 대신 hit area·focus, radius·shadow·애니메이션, 줄 길이·말줄임 방식, 문구는 다른 스킬 몫이라고 못 박는다.[](source:ly-own)

@answer scope="design/jakubkrehel/better-layout · 원본 텍스트 4개 18,301B · 커밋 0465878 · 호출 제한 없음 · 관계 확인용으로 다른 스킬 줄만 읽음 · 지시상 동작"
@meta locale=ko
@source ly-fm title="design/jakubkrehel/better-layout/SKILL.md · 8414B · 지시 본문과 frontmatter" path=design/jakubkrehel/better-layout/SKILL.md lines=1:4
@source ly-lead title="SKILL.md · 스킬이 하는 일" path=design/jakubkrehel/better-layout/SKILL.md lines=8:8
@source ly-find title="SKILL.md · 수치의 적용 조건과 지적 기준" path=design/jakubkrehel/better-layout/SKILL.md lines=10:10
@source ly-own title="SKILL.md · 다른 스킬 몫" path=design/jakubkrehel/better-layout/SKILL.md lines=12:12
@source ly-p1 title="SKILL.md · 공간으로 묶기" path=design/jakubkrehel/better-layout/SKILL.md lines=14:16
@source ly-p2 title="SKILL.md · 컨트롤과 내용 구분" path=design/jakubkrehel/better-layout/SKILL.md lines=18:20
@source ly-p3 title="SKILL.md · 공유 가장자리 정렬" path=design/jakubkrehel/better-layout/SKILL.md lines=22:24
@source ly-p4 title="SKILL.md · logical property" path=design/jakubkrehel/better-layout/SKILL.md lines=26:28
@source ly-p5 title="SKILL.md · 중요도 순서" path=design/jakubkrehel/better-layout/SKILL.md lines=30:32
@source ly-p6 title="SKILL.md · 화면당 주 행동 하나" path=design/jakubkrehel/better-layout/SKILL.md lines=34:36
@source ly-p7 title="SKILL.md · 숨은 내용 단서" path=design/jakubkrehel/better-layout/SKILL.md lines=38:42
@source ly-p8 title="SKILL.md · 테두리 없는 컨트롤 간격" path=design/jakubkrehel/better-layout/SKILL.md lines=44:46
@source ly-p9 title="SKILL.md · 가장자리에서 띄운 버튼" path=design/jakubkrehel/better-layout/SKILL.md lines=48:50
@source ly-p10 title="SKILL.md · 내용은 bleed, 컨트롤은 float" path=design/jakubkrehel/better-layout/SKILL.md lines=52:56
@source ly-p11 title="SKILL.md · 깨질 때까지 구조 유지" path=design/jakubkrehel/better-layout/SKILL.md lines=58:60
@source ly-p12 title="SKILL.md · 글자 증가와 잘림 대비" path=design/jakubkrehel/better-layout/SKILL.md lines=62:66
@source ly-det title="SKILL.md · 끝내기 전 검출 표 11행" path=design/jakubkrehel/better-layout/SKILL.md lines=70:82
@source ly-sev title="SKILL.md · 심각도" path=design/jakubkrehel/better-layout/SKILL.md lines=86:86
@source ly-ver title="SKILL.md · 검증" path=design/jakubkrehel/better-layout/SKILL.md lines=88:88
@source ly-fmt title="SKILL.md · 보고 형식" path=design/jakubkrehel/better-layout/SKILL.md lines=90:95
@source ly-end title="SKILL.md · Block과 Approve" path=design/jakubkrehel/better-layout/SKILL.md lines=97:97
@source ga-space title="design/jakubkrehel/better-layout/grouping-and-alignment.md · 3936B · 묶음·정렬 레시피" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=5:30
@source ga-ctrl title="grouping-and-alignment.md · 컨트롤 구분" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=32:43
@source ga-edge title="grouping-and-alignment.md · 공유 가장자리" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=45:60
@source ga-log title="grouping-and-alignment.md · logical property 표와 RTL 진행" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=62:84
@source ga-ord title="grouping-and-alignment.md · 중요도 순서" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=86:103
@source sa-clear title="design/jakubkrehel/better-layout/spacing-and-adaptivity.md · 5834B · 간격·적응 레시피" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=5:30
@source sa-inset title="spacing-and-adaptivity.md · 가장자리 inset" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=32:52
@source sa-hint title="spacing-and-adaptivity.md · 숨은 내용 단서" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=54:83
@source sa-bleed title="spacing-and-adaptivity.md · bleed와 safe area" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=85:116
@source sa-hold title="spacing-and-adaptivity.md · container query" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=118:135
@source sa-grow title="spacing-and-adaptivity.md · 증가와 잘림" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=137:156
@source oa title="design/jakubkrehel/better-layout/agents/openai.yaml · 117B · 표시 이름과 짧은 설명" path=design/jakubkrehel/better-layout/agents/openai.yaml lines=1:3
@source bi-order title="design/jakubkrehel/better-interface/SKILL.md · r61 확인용 도메인 순서" path=design/jakubkrehel/better-interface/SKILL.md lines=42:57
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · r71 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source ir-rm title="design/jakubkrehel/interface-review/SKILL.md · r71 확인용 제거된 줄" path=design/jakubkrehel/interface-review/SKILL.md lines=56:61
@source rs-lay title="design/jakubkrehel/interface-review/removed-signals.md · r71 확인용 layout 행" path=design/jakubkrehel/interface-review/removed-signals.md lines=13:13
@source ui-bound title="design/jakubkrehel/better-ui/SKILL.md · r77 확인용" path=design/jakubkrehel/better-ui/SKILL.md lines=16:16
@source ac-sticky title="design/jakubkrehel/better-accessibility/SKILL.md · r81 확인용 sticky" path=design/jakubkrehel/better-accessibility/SKILL.md lines=32:32
@source ac-zoom title="design/jakubkrehel/better-accessibility/SKILL.md · r81 확인용 200% 확대" path=design/jakubkrehel/better-accessibility/SKILL.md lines=106:106
@source ac-fk title="design/jakubkrehel/better-accessibility/focus-and-keyboard.md · 원장에 없는 참조" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=39:39
@source ac-mo title="design/jakubkrehel/better-accessibility/motion-and-zoom.md · 원장에 없는 참조" path=design/jakubkrehel/better-accessibility/motion-and-zoom.md lines=48:48
@source wr-bound title="design/jakubkrehel/better-writing/SKILL.md · r98 확인용" path=design/jakubkrehel/better-writing/SKILL.md lines=12:12
@source ty-bound title="design/jakubkrehel/better-typography/SKILL.md · r93 확인용 공간 RTL" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source ty-trunc title="design/jakubkrehel/better-typography/SKILL.md · r93 확인용 말줄임 복귀" path=design/jakubkrehel/better-typography/SKILL.md lines=77:77
@source va-axis title="design/jakubkrehel/variant/SKILL.md · r108 확인용 변형 축" path=design/jakubkrehel/variant/SKILL.md lines=17:23
@source br-own title="design/jakubkrehel/break/SKILL.md · r117 확인용" path=design/jakubkrehel/break/SKILL.md lines=11:11
@source br-sc19 title="design/jakubkrehel/break/scenarios.md · r117 확인용 19줄" path=design/jakubkrehel/break/scenarios.md lines=19:19
@source br-sc46 title="design/jakubkrehel/break/scenarios.md · r117 확인용 46줄" path=design/jakubkrehel/break/scenarios.md lines=46:46
@source br-sc58 title="design/jakubkrehel/break/scenarios.md · r117 확인용 58줄" path=design/jakubkrehel/break/scenarios.md lines=58:58
@source ex-img title="design/jakubkrehel/explain-interface/from-an-image.md · r134 확인용" path=design/jakubkrehel/explain-interface/from-an-image.md lines=45:45
@source ex-sys title="design/jakubkrehel/explain-interface/read-the-system.md · r134 확인용" path=design/jakubkrehel/explain-interface/read-the-system.md lines=124:124
@source bd-own title="design/jakubkrehel/build-design/SKILL.md · r138 확인용" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source td-own title="design/jakubkrehel/teardown/SKILL.md · r147 확인용" path=design/jakubkrehel/teardown/SKILL.md lines=14:14
@source td-pv title="design/jakubkrehel/teardown/preview-page.md · r147 확인용" path=design/jakubkrehel/teardown/preview-page.md lines=31:31

## 언제 켜지고 무엇이 지적이 되나 {#trigger}

@code source=ly-fm language=yaml

frontmatter에는 `name`과 `description`만 있다. 호출 제한 필드가 없으므로 모델이 `description`을 보고 켤 수 있다.[](source:ly-fm) 판정: `description`은 모델이 판단할 때 참고하는 설명이다. "layout"이라는 단어가 나와야만 켜지는 목록은 아니다.

@code source=oa language=yaml

`agents/openai.yaml`에는 표시 이름과 짧은 설명만 있다.[](source:oa) 호출 정책을 다루는 필드는 `원문에 명시 없음`이다.

스킬은 일을 두 가지로 정의한다. 묶음·정렬·간격·반응형 구조를 정하고, 그 구조를 크기 조절·번역·RTL 반전으로 깨 본다.[](source:ly-lead) 지적의 문턱은 첫머리에 있다.

- 수치는 프로젝트에 spacing scale이나 density system이 없을 때만 쓴다. 있으면 그 토큰을 쓴다.[](source:ly-find)
- 지적에는 잘림, 겹침, 깨진 mirror, 잘못 읽힌 묶음처럼 보여 줄 수 있는 실패가 필요하다.[](source:ly-find)
- 시작값과 다른 값은 그 자체로 지적이 아니다.[](source:ly-find)

모든 수정은 프로젝트의 스타일 체계로 쓴다.[](source:ly-find)

## 열두 원칙은 무엇을 강제하나 {#principles}

| 원칙 | 에이전트가 하는 일 |
| --- | --- |
| 공간으로 묶기 | 공간, 배경 모양, 구분선 순서로 쓴다. 구분선은 공간만으로 구조를 못 나를 때만 쓴다[](source:ly-p1)[](source:ga-space) |
| 컨트롤과 내용 구분 | 모든 interactive 요소에 배경 모양, 테두리, 밑줄, 일관된 배치 영역 중 하나를 준다. 반대로 클릭 안 되는 badge를 버튼처럼 만들면 죽은 클릭이 쌓인다[](source:ly-p2)[](source:ga-ctrl) |
| 공유 가장자리 정렬 | 정렬 가장자리를 몇 개로 줄여 그 위에 둔다. 중첩이 깊어져도 같은 간격 단계를 되풀이한다. 표의 숫자는 `text-align: end`, 글은 `start`다[](source:ly-p3)[](source:ga-edge) |
| logical property | 방향에 따라 달라지는 배치는 `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`로 쓴다. 물리 left·right는 safe-area inset 같은 물리 기하에만 남긴다[](source:ly-p4)[](source:ga-log) |
| 중요도 순서 | 중요한 내용은 위와 앞 가장자리에 둔다. 한 행에서는 식별 정보가 앞, 메타데이터와 행동이 뒤다. 시각 순서와 DOM 순서를 맞추므로 `order`, `row-reverse`, grid 배치로 소스 순서를 어기지 않는다[](source:ly-p5)[](source:ga-ord) |
| 화면당 주 행동 하나 | 주 행동은 하나다. 보조 행동은 3개를 넘으면 메뉴 뒤로 보낸다. 길게 다 보여 주는 화면보다 짧고 깊이 연결된 화면을 고른다[](source:ly-p6) |
| 숨은 내용 단서 | 화면 밖이나 접힌 내용마다 보이는 단서를 둔다. 말줄임으로 잘린 값은 전체 글로 가는 길(펼침 컨트롤, 상세 화면, 키보드로도 닿는 tooltip)을 둔다. hover에서만 보이는 `title`은 길로 치지 않는다[](source:ly-p7)[](source:sa-hint) |
| 테두리 없는 컨트롤 간격 | 컨트롤 사이 경계를 공간이 맡는다. 확립된 밀도가 있으면 값에 맞추려고 컨트롤을 키우지 않는다[](source:ly-p8)[](source:sa-clear) |
| 가장자리에서 띄운 버튼 | 내용 layout의 전체 폭 버튼은 layout margin 안쪽에 둔다. 플랫폼 chrome을 따르고 safe area를 지키며 시스템 UI와 구분되면 가장자리까지 붙여도 된다[](source:ly-p9)[](source:sa-inset) |
| 내용은 bleed, 컨트롤은 float | 배경과 미디어는 viewport 가장자리까지 뻗고, 컨트롤과 글은 margin과 safe area 안에 둔다. 가려지지 않게 sticky 헤더 높이만큼 `scroll-padding-block-start`를 준다[](source:ly-p10)[](source:sa-bleed) |
| 깨질 때까지 구조 유지 | breakpoint는 기기 프리셋이 아니라 내용에서 나온다. 펼친 layout이 안 맞을 때까지 두었다가 접는다. 컴포넌트 단위는 container query를 선호한다[](source:ly-p11)[](source:sa-hold) |
| 글자 증가와 잘림 대비 | 번역은 길어지고 짧은 문자열일수록 비율로 더 늘어난다. 글자 컨테이너는 `max-width`와 `min-height`로 잡고 행은 감싼다(wrap). pseudo-localization과 독일어 같은 긴 locale 하나로 시험한다. 핵심 행동은 잘릴 수 있는 곳에 두지 않는다[](source:ly-p12)[](source:sa-grow) |

위 표는 `SKILL.md`의 원칙 12개를 옮겼다. 원칙 이름은 원문 소제목을 한국어로 줄인 것이다.[](source:ly-p1)[](source:ly-p12)

아래 표는 같은 문제를 나쁘게 쓴 코드와 좋게 쓴 코드로 보여 준다.

| 상황 | 나쁜 예(원문 레시피) | 좋은 예(원문 레시피) |
| --- | --- | --- |
| 묶기 | 모든 자식에 `margin-bottom: 12px`와 `border-bottom`을 붙여 균일 간격에 선으로 때운다 | 필드 그룹 안 `gap: 8px`, 그룹 사이 `gap: 24px`로 공간만 쓴다[](source:ga-space) |
| 행동 표시 | 안내 글 끝에 "Upgrade now"를 같은 색 글자로 붙인다 | 별도 `button`에 `font-medium underline underline-offset-2`를 준다[](source:ga-ctrl) |
| 숫자 먼저 | 계좌 번호와 개설일 아래 맨 끝에 잔액을 둔다 | 잔액 `$4,320.00`을 크게 맨 위에 둔다[](source:ga-ord) |
| 번역 | 버튼에 `width: 96px; overflow: hidden`을 준다 {bad:독일어에서 잘림} | `padding-inline: 16px; max-width: 100%`에 행은 `flex-wrap: wrap; gap: 12px`를 준다 {good:글자가 크기를 정함}[](source:sa-grow) |
| 컴포넌트 반응 | 좁은 sidebar 안의 카드가 `@media (max-width: 768px)`를 따른다 | `container-type: inline-size`와 `@container (width < 400px)`를 쓴다[](source:sa-hold) |
| 하단 버튼 | `width: 100vw; position: fixed; bottom: 0` {bad:scrollbar 폭이 더해짐} | `padding-inline: 16px`에 `padding-bottom: calc(16px + env(safe-area-inset-bottom))`[](source:sa-inset) |

RTL에는 따로 챙길 규칙이 있다.

- flex 행과 grid 열은 `dir="rtl"`에서 저절로 mirror된다. 그 안의 물리 값과 `translateX`, `background-position`, `left`·`right`로 손수 놓은 요소는 mirror되지 않는다.[](source:ga-log)
- 별점·단계 표시·진행 막대처럼 배열이 진행을 뜻하면 RTL에서 순서도 뒤집힌다. 숫자 안 자릿수 순서는 뒤집지 않는다.[](source:ga-log)
- floating 버튼은 물리 쪽마다 자기 safe-area inset을 짝지어 쓰고 `[dir="rtl"]`에서 덮어쓴다.[](source:sa-bleed)
- `env(safe-area-inset-*)`는 viewport meta에 `viewport-fit=cover`가 있을 때만 0이 아니다.[](source:ly-p10)

## 수치는 어떤 조건에서 쓰나 {#numbers}

원문 첫머리가 "아래 숫자는 프로젝트에 spacing scale이나 density system이 없을 때만 적용한다"고 못 박는다. 판정: 이 표의 값은 의무가 아니라 시작값이다. 다만 아래 두 줄은 시작값이 아니라 심각도 규칙이다.[](source:ly-find)[](source:ly-sev)

@facts
| 그룹 사이 간격(시작값) | 그룹 안 간격의 2× 이상. 안이 `8px`이면 사이는 `16px` 이상[](source:ly-p1) |
| 중첩 한 단계(시작값) | 프로젝트 spacing 단계 하나. `16px`이 쓸 만한 기본값[](source:ly-p3) |
| 보조 행동(규칙) | 3개를 넘으면 메뉴 뒤로[](source:ly-p6) |
| 숨은 내용 peek(시작값) | 다음 항목이 스크롤 가장자리 밖으로 `16–32px` 보인다[](source:ly-p7) |
| 테두리 있는 인접 컨트롤(시작값) | `12px`[](source:ly-p8)[](source:sa-clear) |
| 테두리 없는 텍스트·아이콘 컨트롤(시작값) | 보이는 글리프 사이 `24px`. 각 버튼의 padding을 포함해 센다[](source:ly-p8)[](source:sa-clear) |
| 관계 없는 컨트롤 그룹(참고 문서 표) | `24px` 이상[](source:sa-clear) |
| 전체 폭 버튼(시작값) | 모바일에서 layout margin 안쪽, inline `16px` 근처[](source:ly-p9) |
| 항상 `HIGH` | 320px 폭 또는 200% zoom에서 잘림·겹침[](source:ly-sev) |

- 콤팩트한 layout은 위 값보다 좁게 써도 된다. 조건은 hit area가 겹치지 않는 것과 컨트롤이 서로 구분되는 것이다.[](source:ly-p8)
- peek은 항목 폭으로 정한다. 폭 = `100%` + gap − peek이다. gap `12px`, peek `24px`이면 100% + 12 − 24 = `100% - 12px`이고, 원문 예시도 `calc(100% - 12px)`를 쓴다.[](source:sa-hint)

## 어떻게 점검하고 어떻게 끝내나 {#flow}

원문에 단계 번호는 없다. 아래는 `SKILL.md` 절 순서(원칙 → 끝내기 전 표 → 보고)를 그린 것이다. 판정: 이 순서는 절 배치에서 읽은 것이고, 원문이 "이 순서로 하라"고 명시하지는 않는다.

@workflow id=layout-flow title="better-layout 점검 흐름"
| w-rule | 원칙 점검 | backend |
| w-det | 검출 표 대조 | backend |
| w-br | 브라우저 있나? | backend |
| w-code | 코드만 확인 | backend |
| w-live | 화면에서 확인 | backend |
| w-tab | 지적 표 | backend |
| w-high | HIGH 남았나? | backend |
| w-block | Block | external |
| w-ok | Approve | external |
| w-rule > w-det | |
| w-det > w-br | |
| w-br > w-code | 없음 |
| w-br > w-live | 있음 |
| w-code > w-tab | |
| w-live > w-tab | |
| w-tab > w-high | |
| w-high > w-block | 예 |
| w-high > w-ok | 아니오 | emphasis |

@steps id=layout-steps
| w-rule | 원칙 점검 | 열두 원칙으로 코드를 읽고, 보여 줄 수 있는 실패가 있는 것만 지적 후보로 남긴다.[](source:ly-find) | layout-flow | w-rule |
| w-det | 검출 표 대조 | 끝내기 전 표의 11개 패턴(예: `width: 100vw`, 고정 `height`, 안 맞는 `@media`)을 찾아 짝지어진 수정을 쓴다.[](source:ly-det) | layout-flow | w-det |
| w-br | 브라우저 있나? | 브라우저가 없으면 코드 검증, 있으면 화면 검증이다.[](source:ly-ver) | layout-flow | w-br |
| w-code | 코드만 확인 | logical property가 물리 property 자리에 쓰였는지, container·media query가 지원 viewport 목록과 맞는지, DOM 순서가 시각 순서와 같은지 본다.[](source:ly-ver) | layout-flow | w-code |
| w-live | 화면에서 확인 | 지원하는 모든 폭, 320px, 200% zoom, RTL mirror를 본다. 못 돌린 검사는 모두 `Not verified`로 보고한다.[](source:ly-ver) | layout-flow | w-live |
| w-tab | 지적 표 | 원칙별로 묶고 심각도순으로 쓴다. 근본 원인 하나가 한 행이고, 나타난 위치를 모두 적는다. 열은 Severity, Location, Before, After, Why이고 `Location`은 `path/to/file:line`이다.[](source:ly-fmt) | layout-flow | w-tab |
| w-high | HIGH 남았나? | `HIGH`가 하나라도 남았는지 본다.[](source:ly-end) | layout-flow | w-high |
| w-block | Block | `HIGH`가 남으면 `Block`으로 끝낸다. 나머지 지적은 표에 할 일로 둔다.[](source:ly-end) | layout-flow | w-block |
| w-ok | Approve | 남은 `HIGH`가 없으면 `Approve`다. 검사하지 않은 범위는 절대 `Approve`하지 않는다. 보고할 것이 없으면 "No actionable layout findings"라고 쓰고 검증 결과를 보고한다.[](source:ly-end) | layout-flow | w-ok |

| 심각도 | 기준 |
| --- | --- |
| `HIGH` {bad:Block 조건} | 지원 viewport에서 내용이나 행동을 막는다. 320px·200% zoom의 잘림·겹침은 항상 `HIGH`. 전체 값에 닿는 길이 없는 잘린 내용도 `HIGH`. 스크롤 가장자리 너머나 접힌 곳에 보이는 단서 없이 있는 내용도 `HIGH`[](source:ly-sev) |
| `MEDIUM` | 위계, 읽는 순서, 적응성을 해친다[](source:ly-sev) |
| `LOW` | 고립된 정렬·간격 다듬기[](source:ly-sev) |

끝내기 전 검출 표 11행은 다음과 같다.

| 찾을 패턴 | 고치는 법 |
| --- | --- |
| 긴 글이나 넓은 표를 담은 `grid-template-columns: … 1fr` 또는 flex 자식이 track을 넘친다 | track에 `minmax(0, 1fr)`, flex 자식에 `min-width: 0` |
| `width: 100vw` | `width: 100%`. `100vw`는 scrollbar를 포함해 desktop에서 가로 스크롤이 생긴다 |
| 전체 높이 모바일 pane의 `height: 100vh` | `100dvh`. 브라우저 도구 막대와 키보드가 아래를 가리지 않는다 |
| 글이 든 박스의 고정 길이 `height:` | `min-height`, 또는 `max-height`에 `overflow-y: auto` |
| 재사용 컴포넌트 안의 `@media (max-width: …)` | 컴포넌트 부모의 `@container` |
| flex 자식·inline-block·절대 위치 요소에 폭 없이 `container-type: inline-size` | 확정된 폭을 준다. size containment가 shrink-to-fit 박스를 0으로 접는다 |
| `viewport-fit=cover` 없이 `env(safe-area-inset-*)` | `viewport-fit=cover`를 추가한다. 없으면 inset이 `0`이 된다 |
| `safe-area-inset-left`·`-right`와 `inset-inline-*`·`*-inline-*`를 함께 씀 | 물리 `left`·`right`와 짝이 맞는 inset, 그리고 `[dir="rtl"]` 덮어쓰기 |
| mirror되는 UI의 `float: left` | `float: inline-start` |
| mirror되는 UI의 `translateX`나 `background-position: left` | `[dir="rtl"]` 덮어쓰기. 둘 다 logical 형태가 없다 |
| `scroll-padding-block-start` 없는 sticky 헤더 | 헤더 높이로 설정 |

표 11행을 옮겼다.[](source:ly-det) `better-layout`이 사람에게 묻는 지점이나 승인 지점은 `원문에 명시 없음`이다. 종료 조건은 `Block` 또는 `Approve`를 쓰는 것이다.[](source:ly-end)

## 흐름 속 위치 {#position}

@workflow id=layout-position title="better-layout 앞뒤"
| u-ir | interface-review | backend |
| u-bi | better-interface | backend |
| u-this | better-layout | backend |
| u-out | 통합 보고서 | external |
| u-bi > u-this | 의무 위임 | emphasis |
| u-ir > u-this | 제거된 줄 단서 | dashed |
| u-this > u-out | 도메인 리뷰 증거 | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `better-interface`(앞, 묶음 안) | 리뷰할 화면·흐름·저장소 | 도메인 리뷰 증거 | 의무형. 도메인을 모두 끝낸 뒤 통합한다. 순서는 `better-accessibility`, 이 스킬, `better-writing`, `better-typography`, `better-colors`, `better-ui` 중 2번째다. 이 스킬의 원칙·references·검증만 가져가고, 심각도 사다리와 보고 형식은 `better-interface` 것으로 대체한다. 이 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 기억으로 규칙을 만들지 않는다[](source:bi-order) | r61 |
| `interface-review`(앞, 사용자 호출 전용) | 변경의 제거된 줄(`-` 쪽) 중 logical property를 `left`·`right`로 바꾼 줄 | 이 스킬이 확인한 것만 `Regression` | 조건부. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀다[](source:ir-fm)[](source:ir-rm)[](source:rs-lay) | r71 |
| `better-interface`(뒤) | - | 이 스킬의 증거 | 이 스킬 단독의 `Block`·`Approve`와 표 형식은 통합 보고서에서 `better-interface` 것으로 바뀐다. 통합 단계의 동작은 `better-interface/review-format.md`를 읽지 않았다 | r61 |
| `better-accessibility` | - | - | 역할 구분. hit area와 focus 동작은 그쪽 몫이다. 이 스킬은 확장된 hit area가 겹치지 않게 간격을 잡는다[](source:ly-own)[](source:sa-clear) | r86 |
| `better-ui` | - | - | 역할 구분. radius, shadow, 애니메이션은 그쪽 몫이다[](source:ly-own) | r87 |
| `better-typography` | - | - | 역할 구분. 줄 길이, 글자 간격, 말줄임 방식, tabular figures, bidi 규칙은 그쪽 몫이다[](source:ly-own)[](source:ga-edge)[](source:ga-log) | r88 |
| `better-writing` | - | - | 역할 구분. 문구 자체는 그쪽 몫이다[](source:ly-own) | r89 |
| `better-colors` | - | - | 역할 구분. 주 행동을 색으로 표시하는 방식은 그쪽 몫이다[](source:ly-p6) | r90 |
| `better-typography`(되받음) | - | - | 참고. 그쪽도 공간 RTL layout과 잘린 값에서 전체 글로 가는 길은 이 스킬 몫이라고 적는다[](source:ty-bound)[](source:ty-trunc) | r93 |
| `better-ui`(되받음) | - | - | 참고. 그쪽도 묶음, 섹션 간격, breakpoint, 공간 RTL은 이 스킬 몫이라고 적는다(방향 아이콘 뒤집기는 그쪽)[](source:ui-bound) | r77 |
| `better-accessibility`(되받음) | - | - | 참고. 그쪽은 target 사이 간격, 공간 RTL, 200% 확대 수정의 나머지, sticky에 가린 focus 수정을 이 스킬 몫이라고 적는다[](source:ac-sticky)[](source:ac-zoom) | r81 |
| `better-writing`(되받음) | - | - | 참고. 번역 문자열의 여유 공간은 이 스킬 몫이라고 적는다[](source:wr-bound) | r98 |
| `variant`(묶음 밖, 사용자 호출 전용) | - | - | 참고. 변형 축 표에서 Structure와 Density 축의 담당 스킬로 이 스킬을 적는다. 호출 지시는 아니다[](source:va-axis) | r108 |
| `break`(묶음 밖, 사용자 호출 전용) | - | - | 참고. 컨테이너에 여유가 없거나 빈 영역이 깨지면 이 스킬 어휘로 이름 붙인다. 호출 지시는 아니다[](source:br-own)[](source:br-sc19)[](source:br-sc46)[](source:br-sc58) | r117 |
| `explain-interface`(묶음 밖, 사용자 호출 전용) | 측정한 그룹 간·그룹 안 간격 | - | 참고. 그룹 간격이 그룹 안의 2× 이상이어야 공간이 묶음을 맡는다는 기준을 이 스킬에서 가져다 비교한다. 판정은 하지 않는다[](source:ex-img)[](source:ex-sys) | r134 |
| `build-design`(묶음 밖) | - | 충돌 보고 | 참고. 디자인이 간격·구조 규칙을 깨면 디자인대로 만들고 충돌을 이 스킬에 보고한다(의무형)[](source:bd-own) | r138 |
| `teardown`(묶음 밖) | - | - | 참고. 주변 인터페이스와 반응형 배치는 이 스킬 몫이라고 적는다. 호출 지시는 아니다[](source:td-own)[](source:td-pv) | r147 |

그림에는 묶음 안의 r61과 r71만 그렸다. 나머지는 역할 구분이거나 묶음 밖이라 표에만 남겼다. 판정: 이 스킬이 다른 스킬을 실행하라는 문장은 원문에 없고, 위 참고 행은 모두 "그쪽 몫"이라는 경계 표시다. 사용자 호출 전용인 `interface-review`는 `description` 매칭으로 시작되지 않으므로 r71은 사람이 `interface-review`를 먼저 실행한 뒤에만 열린다.[](source:ir-fm)

전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 4개, 합계 18,301B다. `SKILL.md` 8,414B, `grouping-and-alignment.md` 3,936B, `spacing-and-adaptivity.md` 5,834B, `agents/openai.yaml` 117B를 모두 읽었다. 부분 읽음 파일은 0개다.
- 제외한 파일: 번역본과 바이너리 파일은 이 폴더에 없다. `find`로 파일 4개만 확인했다.
- 관계 확인용으로 다른 스킬 11개, 파일 17개의 해당 줄만 읽었다. `better-interface`, `interface-review`(2개 파일), `better-ui`, `better-accessibility`(3개 파일), `better-writing`, `better-typography`, `variant`, `break`(2개 파일), `explain-interface`(2개 파일), `build-design`, `teardown`(2개 파일)이다.
- 원문 대조 범위(`SKILL.md`): 활성화 제한(없음), 원칙 12개, 수치 전부(2×, `8px`·`16px`, 3개, `16–32px`, `12px`, `24px`, 안쪽 `16px`, 320px·200% zoom), 검출 표 11행, 심각도 3단계, 검증 규칙, 보고 열 5개, 종료 조건을 대조했다. 두 참고 문서의 레시피 표와 코드 예시도 모두 읽었다.
- 관계 행 대조: 원장 r61, r71, r77, r81, r86~r90, r93, r98, r108, r117, r134, r138, r147의 16행을 원문 줄과 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. 작업 트리의 `design/`은 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 스킬의 CSS 코드는 읽기만 했고 브라우저에서 돌려 보지 않았다. `calc(100% - 12px)` peek이나 `container-type`의 수축 동작이 실제로 그렇게 나오는지는 확인하지 않았다.
- `better-interface`가 이 스킬의 `HIGH`를 통합 verdict에 어떻게 세는지는 `better-interface/SKILL.md` 42~57줄까지만 봤고 `review-format.md`는 읽지 않았다.
- `better-accessibility/focus-and-keyboard.md` 39줄과 `motion-and-zoom.md` 48줄도 이 스킬에 일을 넘기지만 원장 r81에는 이 두 줄이 출처로 들어 있지 않다. 39줄은 sticky에 가린 focus를 위한 `scroll-padding` 처리를, 48줄은 breakpoint 위치를 이 스킬 몫이라고 적는다.[](source:ac-fk)[](source:ac-mo)
