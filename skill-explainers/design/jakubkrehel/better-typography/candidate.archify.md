# better-typography 스킬은 에이전트를 어떻게 바꾸나 {#better-typography-skill}

`better-typography`를 쓰면 에이전트는 글자 스타일을 취향으로 평가하지 않고, 정확한 값(측정값)과 휴리스틱으로 나눠 점검한다. 측정값을 놓친 것만 지적으로 올리고, 휴리스틱은 프로젝트 자체의 scale을 깰 때만 보고한다. 새 typeface는 과제가 서체 변경을 요청하지 않으면 제안하지 않는다. 결과는 지적 표 하나와 `Block` 또는 `Approve`다.[](source:ty-exact)[](source:ty-heur)[](source:ty-end)

- 켜지는 때: 호출 제한 필드가 없다. 모델이 `description`을 보고 켤 수 있고, `better-interface`는 도메인 리뷰 네 번째 순서로 이 스킬을 의무로 불러 온다.[](source:ty-fm)[](source:bi-order)
- 강제하는 것: 단위 없는 line-height, 18px 미만 글자의 weight `400` 이상, 60–75자 measure, iOS의 `16px` input, 변하는 값의 `tabular-nums`다. 이 다섯 가지를 놓치면 지적이다.[](source:ty-exact)
- 사람에게 묻는 곳: input이 `16px`보다 작을 때 고치는 방식이 두 가지라서 어느 쪽을 원하는지 묻는다.[](source:ty-in)
- 쓰면 안 되는 때: 원문은 거절 조건을 따로 적지 않는다(`원문에 명시 없음`). 대신 문구, heading 의미 구조, 공간 RTL layout, 대비 측정과 통과 판정은 다른 스킬 몫이라고 적는다.[](source:ty-own)

@answer scope="design/jakubkrehel/better-typography · 원본 텍스트 8개 29,444B · 커밋 0465878 · 호출 제한 없음 · 관계 확인용으로 다른 스킬 줄만 읽음 · 지시상 동작"
@meta locale=ko
@source ty-fm title="design/jakubkrehel/better-typography/SKILL.md · 12244B · 지시 본문과 frontmatter" path=design/jakubkrehel/better-typography/SKILL.md lines=1:4
@source ty-lead title="SKILL.md · 스킬이 하는 일" path=design/jakubkrehel/better-typography/SKILL.md lines=8:8
@source ty-own title="SKILL.md · 다른 스킬 몫" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source ty-exact title="SKILL.md · 정확한 값" path=design/jakubkrehel/better-typography/SKILL.md lines=14:14
@source ty-heur title="SKILL.md · 휴리스틱과 새 서체 금지" path=design/jakubkrehel/better-typography/SKILL.md lines=16:16
@source ty-p1 title="SKILL.md · 서체·크기·weight 줄이기" path=design/jakubkrehel/better-typography/SKILL.md lines=18:22
@source ty-p2 title="SKILL.md · 쓰는 face 로드" path=design/jakubkrehel/better-typography/SKILL.md lines=24:26
@source ty-p3 title="SKILL.md · 속성 우선" path=design/jakubkrehel/better-typography/SKILL.md lines=28:32
@source ty-p4 title="SKILL.md · 의미 있는 이름의 type scale" path=design/jakubkrehel/better-typography/SKILL.md lines=34:38
@source ty-p5 title="SKILL.md · heading 크기 내림차순" path=design/jakubkrehel/better-typography/SKILL.md lines=40:42
@source ty-p6 title="SKILL.md · 역할별 line-height" path=design/jakubkrehel/better-typography/SKILL.md lines=44:48
@source ty-p7 title="SKILL.md · 크기별 letter-spacing" path=design/jakubkrehel/better-typography/SKILL.md lines=50:54
@source ty-p8 title="SKILL.md · measure 상한" path=design/jakubkrehel/better-typography/SKILL.md lines=56:58
@source ty-p9 title="SKILL.md · 줄바꿈" path=design/jakubkrehel/better-typography/SKILL.md lines=60:67
@source ty-p10 title="SKILL.md · tabular-nums" path=design/jakubkrehel/better-typography/SKILL.md lines=69:71
@source ty-p11 title="SKILL.md · 말줄임과 복귀 길" path=design/jakubkrehel/better-typography/SKILL.md lines=73:77
@source ty-p12 title="SKILL.md · 자연스러운 case와 문장부호" path=design/jakubkrehel/better-typography/SKILL.md lines=79:83
@source ty-p13 title="SKILL.md · 폰트에서 가져온 밑줄" path=design/jakubkrehel/better-typography/SKILL.md lines=85:89
@source ty-in title="SKILL.md · 모바일 input 16px" path=design/jakubkrehel/better-typography/SKILL.md lines=91:98
@source ty-p15 title="SKILL.md · 크기 하한" path=design/jakubkrehel/better-typography/SKILL.md lines=100:104
@source ty-p16 title="SKILL.md · 루트의 font smoothing" path=design/jakubkrehel/better-typography/SKILL.md lines=106:108
@source ty-p17 title="SKILL.md · 언어와 bidi" path=design/jakubkrehel/better-typography/SKILL.md lines=110:112
@source ty-p18 title="SKILL.md · text box 다듬기" path=design/jakubkrehel/better-typography/SKILL.md lines=114:116
@source ty-p19 title="SKILL.md · 장식 글자는 CSS로" path=design/jakubkrehel/better-typography/SKILL.md lines=118:120
@source ty-p20 title="SKILL.md · 선택 가능한 글자" path=design/jakubkrehel/better-typography/SKILL.md lines=122:126
@source ty-det title="SKILL.md · 끝내기 전 검출 표 19행" path=design/jakubkrehel/better-typography/SKILL.md lines=130:150
@source ty-sev title="SKILL.md · 심각도" path=design/jakubkrehel/better-typography/SKILL.md lines=154:154
@source ty-ver title="SKILL.md · 검증" path=design/jakubkrehel/better-typography/SKILL.md lines=156:156
@source ty-fmt title="SKILL.md · 보고 형식" path=design/jakubkrehel/better-typography/SKILL.md lines=158:163
@source ty-end title="SKILL.md · Block과 Approve" path=design/jakubkrehel/better-typography/SKILL.md lines=165:165
@source cs-head title="design/jakubkrehel/better-typography/css-cheat-sheet.md · 4288B · 선언과 Tailwind 대응표" path=design/jakubkrehel/better-typography/css-cheat-sheet.md lines=1:3
@source cs-font title="css-cheat-sheet.md · Font 표" path=design/jakubkrehel/better-typography/css-cheat-sheet.md lines=5:23
@source cs-rest title="css-cheat-sheet.md · 간격·줄바꿈·장식 표" path=design/jakubkrehel/better-typography/css-cheat-sheet.md lines=25:67
@source wp-measure title="design/jakubkrehel/better-typography/wrapping-and-punctuation.md · 1618B · 줄 길이·문장부호·국제화" path=design/jakubkrehel/better-typography/wrapping-and-punctuation.md lines=5:7
@source wp-smart title="wrapping-and-punctuation.md · 문장부호 대체표" path=design/jakubkrehel/better-typography/wrapping-and-punctuation.md lines=9:18
@source wp-i18n title="wrapping-and-punctuation.md · 국제화" path=design/jakubkrehel/better-typography/wrapping-and-punctuation.md lines=20:23
@source da-ul title="design/jakubkrehel/better-typography/details-and-accessibility.md · 3339B · 밑줄·선택·폼·장식" path=design/jakubkrehel/better-typography/details-and-accessibility.md lines=5:37
@source da-sel title="details-and-accessibility.md · 선택 범위" path=design/jakubkrehel/better-typography/details-and-accessibility.md lines=39:42
@source da-form title="details-and-accessibility.md · placeholder와 caret" path=design/jakubkrehel/better-typography/details-and-accessibility.md lines=44:47
@source da-ios title="details-and-accessibility.md · iOS input 확대 두 방식" path=design/jakubkrehel/better-typography/details-and-accessibility.md lines=49:71
@source da-dec title="details-and-accessibility.md · 장식 글자 속성" path=design/jakubkrehel/better-typography/details-and-accessibility.md lines=73:84
@source cf-cat title="design/jakubkrehel/better-typography/choosing-fonts.md · 2142B · 서체 분류·fallback·형식" path=design/jakubkrehel/better-typography/choosing-fonts.md lines=5:15
@source cf-fb title="choosing-fonts.md · 서체 변경 때의 fallback stack" path=design/jakubkrehel/better-typography/choosing-fonts.md lines=17:31
@source cf-fmt title="choosing-fonts.md · 파일 형식" path=design/jakubkrehel/better-typography/choosing-fonts.md lines=33:41
@source cf-anat title="choosing-fonts.md · 서체 구조 용어" path=design/jakubkrehel/better-typography/choosing-fonts.md lines=43:53
@source ss-units title="design/jakubkrehel/better-typography/spacing-and-sizing.md · 2234B · 단위·scale·text-box" path=design/jakubkrehel/better-typography/spacing-and-sizing.md lines=5:12
@source ss-scale title="spacing-and-sizing.md · 역할별 시작 scale" path=design/jakubkrehel/better-typography/spacing-and-sizing.md lines=14:38
@source ss-head title="spacing-and-sizing.md · heading 대응" path=design/jakubkrehel/better-typography/spacing-and-sizing.md lines=40:48
@source ss-lh title="spacing-and-sizing.md · 줄바꿈 글자의 line-height" path=design/jakubkrehel/better-typography/spacing-and-sizing.md lines=50:58
@source ss-tb title="spacing-and-sizing.md · text-box 키워드와 지원" path=design/jakubkrehel/better-typography/spacing-and-sizing.md lines=60:87
@source vf-sv title="design/jakubkrehel/better-typography/variable-fonts-and-opentype.md · 3468B · variable font과 OpenType" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=5:10
@source vf-syn title="variable-fonts-and-opentype.md · synthesis 좁게 끄기" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=12:22
@source vf-ax title="variable-fonts-and-opentype.md · axis" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=24:38
@source vf-raw title="variable-fonts-and-opentype.md · raw tag는 custom axis에만" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=40:59
@source vf-ot title="variable-fonts-and-opentype.md · OpenType feature" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=61:89
@source vf-sc title="variable-fonts-and-opentype.md · small caps와 위첨자·아래첨자" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=91:96
@source vf-ss title="variable-fonts-and-opentype.md · stylistic set과 character variant" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=98:100
@source oa title="design/jakubkrehel/better-typography/agents/openai.yaml · 111B · 표시 이름과 짧은 설명" path=design/jakubkrehel/better-typography/agents/openai.yaml lines=1:3
@source bi-order title="design/jakubkrehel/better-interface/SKILL.md · r63 확인용 도메인 순서" path=design/jakubkrehel/better-interface/SKILL.md lines=42:57
@source bi-trig title="design/jakubkrehel/better-interface/SKILL.md · r102 확인용 escalation trigger" path=design/jakubkrehel/better-interface/SKILL.md lines=77:95
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · r72 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source ir-rm title="design/jakubkrehel/interface-review/SKILL.md · r72 확인용 제거된 줄" path=design/jakubkrehel/interface-review/SKILL.md lines=56:61
@source rs-ty title="design/jakubkrehel/interface-review/removed-signals.md · r72 확인용 typography 행" path=design/jakubkrehel/interface-review/removed-signals.md lines=14:15
@source ui-bound title="design/jakubkrehel/better-ui/SKILL.md · r75 확인용" path=design/jakubkrehel/better-ui/SKILL.md lines=16:16
@source ac-bound title="design/jakubkrehel/better-accessibility/SKILL.md · r80 확인용 글자 크기와 언어" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source ac-zoom title="design/jakubkrehel/better-accessibility/SKILL.md · r80 확인용 iOS input" path=design/jakubkrehel/better-accessibility/SKILL.md lines=106:106
@source ac-tr title="design/jakubkrehel/better-accessibility/semantics-and-aria.md · 원장에 없는 참조" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=61:61
@source wr-bound title="design/jakubkrehel/better-writing/SKILL.md · r96 확인용" path=design/jakubkrehel/better-writing/SKILL.md lines=12:12
@source ly-own title="design/jakubkrehel/better-layout/SKILL.md · r88 확인용" path=design/jakubkrehel/better-layout/SKILL.md lines=12:12
@source ly-trunc title="design/jakubkrehel/better-layout/SKILL.md · r88 확인용 말줄임" path=design/jakubkrehel/better-layout/SKILL.md lines=42:42
@source ga-num title="design/jakubkrehel/better-layout/grouping-and-alignment.md · r88 확인용 tabular figures" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=49:49
@source ga-bidi title="design/jakubkrehel/better-layout/grouping-and-alignment.md · r88 확인용 bidi" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=84:84
@source va-axis title="design/jakubkrehel/variant/SKILL.md · r110 확인용 변형 축" path=design/jakubkrehel/variant/SKILL.md lines=17:23
@source br-own title="design/jakubkrehel/break/SKILL.md · r116 확인용" path=design/jakubkrehel/break/SKILL.md lines=11:11
@source br-row title="design/jakubkrehel/break/SKILL.md · r116 확인용 긴 문자열 행" path=design/jakubkrehel/break/SKILL.md lines=57:57
@source br-sc19 title="design/jakubkrehel/break/scenarios.md · r116 확인용 19줄" path=design/jakubkrehel/break/scenarios.md lines=19:19
@source br-sc33 title="design/jakubkrehel/break/scenarios.md · r116 확인용 33줄" path=design/jakubkrehel/break/scenarios.md lines=33:33
@source ex-img title="design/jakubkrehel/explain-interface/from-an-image.md · r133 확인용" path=design/jakubkrehel/explain-interface/from-an-image.md lines=37:37
@source ex-fm title="design/jakubkrehel/explain-interface/SKILL.md · 원장에 없는 참조" path=design/jakubkrehel/explain-interface/SKILL.md lines=11:11
@source bd-own title="design/jakubkrehel/build-design/SKILL.md · r137 확인용" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source td-own title="design/jakubkrehel/teardown/SKILL.md · r144 확인용" path=design/jakubkrehel/teardown/SKILL.md lines=14:14
@source sr-font title="design/jakubkrehel/interface-review/scope-resolution.md · 원장 r74에만 있는 typography 참조" path=design/jakubkrehel/interface-review/scope-resolution.md lines=68:68

## 언제 켜지고 무엇이 지적이 되나 {#trigger}

@code source=ty-fm language=yaml

frontmatter에는 `name`과 `description`만 있다. 호출 제한 필드가 없으므로 모델이 `description`을 보고 켤 수 있다.[](source:ty-fm) 판정: `description`은 모델이 판단할 때 참고하는 설명이다. "typography"라는 단어가 나와야만 켜지는 목록은 아니다.

@code source=oa language=yaml

`agents/openai.yaml`에는 표시 이름과 짧은 설명만 있다.[](source:oa) 호출 정책을 다루는 필드는 `원문에 명시 없음`이다.

스킬은 자기 일을 이렇게 정의한다. 글자가 그려지는 방식을 type scale부터 폰트 로딩, 줄바꿈, 문장부호까지 정하고 리뷰한다. 모든 수정은 프로젝트의 스타일 체계로 쓰고, 참고 문서의 cheat sheet는 선언마다 Tailwind 대응 utility를 적는다.[](source:ty-lead)[](source:cs-head)

| 구분 | 항목 | 에이전트가 다루는 방식 |
| --- | --- | --- |
| 정확한 값 {bad:놓치면 지적} | 단위 없는 line-height, 18px 미만 글자의 weight `400` 이상, 60–75자 measure, iOS의 `16px` input, 변하는 값의 `tabular-nums` | 값을 놓친 곳이 곧 지적이다[](source:ty-exact) |
| 휴리스틱 {caution:조건부 보고} | letter-spacing, 서체 짝짓기, scale 비율 | 프로젝트 자체의 scale을 깰 때만 보고한다[](source:ty-heur) |
| 금지 | 새 typeface 제안(유료·무료 모두) | 과제가 서체 변경을 요청할 때만 허용한다[](source:ty-heur) |

다른 스킬 몫은 `흐름 속 위치` 패널 표에 있다.

## 스무 개가 넘는 원칙은 무엇을 강제하나 {#principles}

`SKILL.md`는 원칙 21개를 소제목 하나씩으로 쓴다. 아래 두 표는 원칙을 서체·크기·간격과 줄바꿈·문장부호·세부로 나눠 옮겼다. 원칙 이름은 원문 소제목을 줄인 것이다.

| 원칙 | 에이전트가 하는 일 |
| --- | --- |
| 정확한 값과 휴리스틱 | 측정값은 놓치면 지적이고, 휴리스틱은 프로젝트 scale을 깰 때만 보고한다[](source:ty-exact)[](source:ty-heur) |
| 서체·크기·weight 줄이기 | 서체는 드물게 세 개를 넘긴다(마케팅 페이지는 더 가능). 위계는 weight와 크기가 나르므로 하나 늘 때마다 흐려진다. 대비를 주어 짝짓는다[](source:ty-p1)[](source:cf-cat) |
| 쓰는 face 로드 | 브라우저는 서체가 안 주는 weight·style을 만들어 얼굴을 일그러뜨린다. 디자인이 쓰는 face를 모두 로드한다. synthesis는 fallback stack을 확인한 뒤 원치 않는 모드만 끈다[](source:ty-p2)[](source:vf-syn) |
| 속성 우선 | CSS 속성이 있으면 속성을 쓴다. `font-weight: 650`이지 `font-variation-settings: "wght" 650`이 아니다. raw tag는 `"GRAD" 80` 같은 custom axis와 `"ss01" 1` 같은 속성 없는 feature에만 쓴다[](source:ty-p3)[](source:vf-raw) |
| 의미 있는 이름의 type scale | 작은 크기 집합을 정하고 벗어남을 최소로 한다. 크기마다 line-height와 weight를 한 묶음으로 둔다. 혼자 작업하면 `text-sm`도 괜찮지만 팀은 `text-body-sm`처럼 용도로 이름을 짓는다[](source:ty-p4)[](source:ss-scale) |
| heading 크기 내림차순 | 하위 heading이 상위를 압도하지 않는다. scale이 모자라면 깊은 레벨이 크기를 나눠 써도 되지만 weight나 letter-spacing으로 구분한다. 의도한 overline이 아니면 heading이 본문보다 작지 않다[](source:ty-p5)[](source:ss-head) |
| 역할별 line-height | 단위 없는 값을 쓴다(고정 `24px`은 크기를 따라 커지지 않는다). 세 줄 이상 감싸는 글은 높이 제한 행에서도 `1.4` 이상이다[](source:ty-p6)[](source:ss-lh) |
| 크기별 letter-spacing | `em`으로 써서 크기에 따라 커지게 한다. kerning은 폰트에 들어 있어 기본이 켜짐이다. `font-kerning: none`은 해결책이 아니다[](source:ty-p7) |
| 크기 하한 | 긴 글 본문은 브라우저 기본 `16px`에서 시작하고, 이유를 댈 수 있을 때만 벗어난다. `font-size`는 `rem`으로 써서 사용자의 브라우저 글자 크기가 반영되게 한다[](source:ty-p15)[](source:ss-units) |
| text box 다듬기 | 버튼과 badge에서 글자가 아래로 처지면 `text-box: trim-both cap alphabetic`을 점진적 향상으로 쓴다[](source:ty-p18)[](source:ss-tb) |

| 원칙 | 에이전트가 하는 일 |
| --- | --- |
| measure 상한 | 긴 글은 한 줄 60–75자로 상한을 둔다. 단위는 무엇이든 되지만 상한이 있고 범위에 들어야 한다[](source:ty-p8)[](source:wp-measure) |
| 줄바꿈 | `balance`는 heading과 짧은 설명에만 쓴다(문단 금지, Chromium은 여섯 줄 넘으면 무시). `pretty`는 아무 문단에나 안전하다. 긴 단어·링크·ID가 넘칠 수 있으면 `overflow-wrap: break-word`, 줄바꿈이 깨져 보이는 라벨·badge에는 `white-space: nowrap`이다. UI 글은 `text-align: start`이고 `justify`는 특정 편집 layout에만 쓴다[](source:ty-p9) |
| tabular-nums | timer, counter, 가격, 숫자 열에 `font-variant-numeric: tabular-nums`를 쓴다. 본문 안 숫자는 proportional로 둔다[](source:ty-p10) |
| 말줄임과 복귀 길 | 한 줄은 `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`(Tailwind `truncate`)이고 여러 줄은 `-webkit-line-clamp`다. 잘린 값에는 전체 글로 돌아가는 길이 필요하고 그 길은 `better-layout`이 맡는다[](source:ty-p11)[](source:cs-rest) |
| 자연스러운 case와 문장부호 | 글은 자연스러운 case로 저장하고 `text-transform`으로 바꾼다. 화면에는 키보드 대용 문자 대신 curly quote, en dash, 말줄임표 문자, non-breaking space를 쓴다. 코드는 straight quote를 유지한다[](source:ty-p12)[](source:wp-smart) |
| 언어와 bidi | `lang`으로 따옴표·hyphenation·발음을 맞추고, 문서와 방향이 바뀌는 곳에 `dir`을 둔다. 방향이 섞인 값은 `<bdi>`로 감싸고 숫자 순서는 손으로 뒤집지 않는다[](source:ty-p17)[](source:wp-i18n) |
| 폰트에서 가져온 밑줄 | `text-underline-position: from-font`와 `text-decoration-thickness: from-font`를 쓰거나 offset·두께를 손으로 맞춘다. 점선 밑줄은 약어·정의어처럼 추가 정보가 있다는 신호다. 진짜 밑줄에서 안정적으로 애니메이션되는 건 색뿐이다[](source:ty-p13)[](source:da-ul) |
| 장식 글자는 CSS로 | drop cap, gradient 글자, 윤곽선, text shadow는 CSS로 만들어 글자가 선택되고 검색되게 한다[](source:ty-p19)[](source:da-dec) |
| 선택 가능한 글자 | 기본은 선택 가능이다. `::selection`은 선택된 조합이 읽히는 한 브랜드를 담아도 된다. `user-select: none`은 드래그·제스처 면에만 쓰고 인터페이스 전체에는 쓰지 않는다[](source:ty-p20)[](source:da-sel) |
| 루트의 font smoothing | `-webkit-font-smoothing: antialiased`와 `-moz-osx-font-smoothing: grayscale`을 컴포넌트마다가 아니라 루트에 한 번 쓴다[](source:ty-p16) |
| 모바일 input 16px | iOS Safari는 input 글자가 `16px`보다 작으면 페이지를 확대한다. 해결은 두 가지이고 디자인이 어느 쪽을 원하는지 묻는다[](source:ty-in)[](source:da-ios) |

위 두 표로 원칙 21개를 옮겼다.[](source:ty-p1)[](source:ty-p20)

## 수치는 어떤 조건에서 쓰나 {#numbers}

수치마다 성격이 다르다. 의무형은 정확한 값이고 휴리스틱은 보고 조건이 붙는다. 시작점이나 예시는 표시했다.

@facts
| 서체 수(권고) | 드물게 세 개를 넘긴다. 마케팅 페이지는 더 가능[](source:ty-p1) |
| weight(정확한 값) | 18px 미만이면 `400` 이상[](source:ty-p1) |
| weight(권고) | `100`–`300`은 `28px` 이상, 거기서도 배경에 비춰 확인[](source:ty-p1) |
| line-height(권고) | Display `1.1`, heading `1.2`–`1.3`, 본문 `1.5`–`1.6`. 단위 없는 값[](source:ty-p6) |
| line-height(규칙) | 세 줄 이상 감싸는 글은 `1.4` 이상[](source:ty-p6) |
| letter-spacing(휴리스틱) | `24px` 이상 heading은 `-0.01em`~`-0.02em`, `14px` 이하 대문자 라벨은 `0.05em`, 본문은 `0`[](source:ty-p7) |
| measure(정확한 값) | 한 줄 60–75자. 본문 `16px`이면 대략 `560px`~`680px`[](source:ty-p8)[](source:wp-measure) |
| 본문 크기(시작점) | 긴 글 `16px`. input·메뉴 `14px`, 캡션 `13px`, `12px` 아래는 드물게[](source:ty-p15) |
| iOS input(정확한 값) | `16px` 미만이면 페이지가 확대됨[](source:ty-in) |
| 줄바꿈(규칙) | `text-wrap: balance`는 Chromium에서 여섯 줄을 넘으면 무시됨[](source:ty-p9) |
| `text-box` 지원 | Chromium 133+, Safari 18.2+, Firefox 아직 없음. 미지원 브라우저는 기본 leading 유지[](source:ss-tb) |

Tailwind 대응도 원문에 있다. `max-w-xl`은 `576px`, `max-w-2xl`은 `672px`, `max-w-prose`는 `65ch`이고 모두 60–75자 범위에 든다.[](source:wp-measure) 이 범위가 맞는지는 본문 글자 크기가 바뀌면 다시 확인하라고 한다.[](source:wp-measure)

참고 문서가 주는 시작 scale은 제품 인터페이스용 예시다. 같은 역할 안의 강조는 weight 한 단계 위(`400` → `500`)이고 크기를 바꾸지 않는다.[](source:ss-scale)

| 역할 | 크기 | line-height | weight |
| --- | --- | --- | --- |
| Display | `2.25rem`(36px) | `1.1` | `600` |
| Title | `1.5rem`(24px) | `1.2` | `600` |
| Heading | `1.125rem`(18px) | `1.3` | `600` |
| Body | `1rem`(16px) | `1.5` | `400` |
| Caption | `0.8125rem`(13px) | `1.4` | `400` |

표 5행을 옮겼다.[](source:ss-scale) 역할 이름은 `--text-caption`, `--text-body`, `--text-heading`, `--text-title`, `--text-display`다.[](source:ss-scale) input 두 방식에서 `13px`를 `16px` font-size로 그릴 때 비율은 13 ÷ 16 = 0.8125다.[](source:da-ios)

참고 문서에만 있는 지식은 다음과 같다.

| 주제 | 내용 |
| --- | --- |
| iOS input, 크기 키우기 | 모바일에서 `16px`로 그리고 `sm` breakpoint부터 설계 크기로 내린다. 보정할 것은 없지만 모바일 input이 desktop과 달라진다(`text-base sm:text-sm`)[](source:ty-in)[](source:da-ios) |
| iOS input, 줄여서 그리기 | `font-size`를 `16px`로 두고 `transform: scale()`로 줄인다. 요소 폭을 scale의 역수로 늘리고 `line-height`를 같은 비율로 나눈다. 둘러싼 wrapper가 배경·윤곽선을 그리고 input은 투명으로 둔다. 모든 viewport에서 같지만 유지할 코드가 늘어난다[](source:ty-in)[](source:da-ios) |
| 파일 형식 | 웹에는 `.woff2`. `.woff`는 아주 옛 브라우저용 fallback. `.ttf`·`.otf`는 다른 수가 없을 때만[](source:cf-fmt) |
| 서체 변경 때 fallback | `system-ui, sans-serif` 또는 상용 서체에 `"Helvetica Neue", Arial, sans-serif`를 단 stack[](source:cf-fb) |
| Display·Text cut | 이름에 "Display"가 있다고 display 서체가 아니다. SF Pro와 Heldane은 큰 크기용 `Display`와 작은 크기용 `Text`를 낸다. 쓰는 크기에 맞는 cut을 쓴다[](source:cf-cat) |
| synthesis 좁게 끄기 | `font-synthesis: none`은 weight·style·small-cap·position을 모두 끈다. 하나만 끄려면 longhand 넷(`font-synthesis-weight`, `-style`, `-small-caps`, `-position`)을 쓴다[](source:vf-syn) |
| static과 variable | 가중치가 한두 개면 static이 더 작을 수 있고, 여러 weight·optical size·custom axis면 variable이 대개 이긴다[](source:vf-sv) |
| 밑줄 색 전환 | 원문 예시는 `transition: text-decoration-color 200ms ease-out`이다[](source:da-ul) |
| `initial-letter` | Safari는 `-webkit-initial-letter`가 필요하고 Firefox는 아직 없다[](source:da-dec) |
| `-webkit-text-stroke` | 글자 안에 선이 그어지면 윤곽이 겹친 폰트다. variable font는 흔히 병합하지 않으므로 static cut을 쓴다[](source:da-dec) |

## 어떻게 점검하고 어떻게 끝내나 {#flow}

원문에 단계 번호는 없다. 아래는 `SKILL.md` 절 순서(원칙 → 끝내기 전 표 → 보고)를 그린 것이다. 판정: 이 순서는 절 배치에서 읽은 것이고, 원문이 "이 순서로 하라"고 명시하지는 않는다.

@workflow id=typo-flow title="better-typography 점검 흐름"
| w-rule | 원칙 점검 | backend |
| w-det | 검출 표 대조 | backend |
| w-br | 브라우저 있나? | backend |
| w-code | 선언값 확인 | backend |
| w-live | 계산값·화면 확인 | backend |
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

@steps id=typo-steps
| w-rule | 원칙 점검 | 정확한 값을 놓친 곳과, 프로젝트 scale을 깬 휴리스틱을 가려낸다.[](source:ty-exact)[](source:ty-heur) | typo-flow | w-rule |
| w-det | 검출 표 대조 | 끝내기 전 표의 19개 패턴을 코드에서 찾아 짝지어진 수정을 쓴다.[](source:ty-det) | typo-flow | w-det |
| w-br | 브라우저 있나? | 브라우저가 없으면 선언값, 있으면 계산값과 화면이다.[](source:ty-ver) | typo-flow | w-br |
| w-code | 선언값 확인 | heading 레벨마다 선언된 크기와 weight가 의미 구역 안에서 내림차순인지, 선언된 line-height·단위·measure, 말줄임 규칙이 현실적인 문자열 길이에 맞는지 본다.[](source:ty-ver) | typo-flow | w-code |
| w-live | 계산값·화면 확인 | 계산값을 비교한 뒤 실제 내용으로 viewport 크기를 바꿔 줄바꿈, 마지막 줄 외톨이 단어, 말줄임을 본다. 못 돌린 검사는 모두 `Not verified`로 보고한다.[](source:ty-ver) | typo-flow | w-live |
| w-tab | 지적 표 | 원칙별로 묶고 심각도순으로 쓴다. 근본 원인 하나가 한 행이고, 나타난 위치를 모두 적는다. 열은 Severity, Location, Before, After, Why이고 `Location`은 `path/to/file:line`이다.[](source:ty-fmt) | typo-flow | w-tab |
| w-high | HIGH 남았나? | `HIGH`가 하나라도 남았는지 본다.[](source:ty-end) | typo-flow | w-high |
| w-block | Block | `HIGH`가 남으면 `Block`으로 끝낸다. 나머지 지적은 표에 할 일로 둔다.[](source:ty-end) | typo-flow | w-block |
| w-ok | Approve | 남은 `HIGH`가 없으면 `Approve`다. 검사하지 않은 범위는 절대 `Approve`하지 않는다. 보고할 것이 없으면 "No actionable typography findings"라고 쓰고 검증 결과를 보고한다.[](source:ty-end) | typo-flow | w-ok |

| 심각도 | 기준 |
| --- | --- |
| `HIGH` {bad:Block 조건} | 글자를 읽을 수 없게 하거나, 복귀 길 없이 내용을 자르거나, 320px 폭·200% zoom에서 글자를 자른다. 뒤의 둘은 `better-interface`의 escalation trigger라서 표면이 작아도 `HIGH`다[](source:ty-sev) |
| `MEDIUM` | type system이나 heading의 시각 위계를 깬다[](source:ty-sev) |
| `LOW` | 고립된 다듬기[](source:ty-sev) |

@callout level=note title="사람에게 묻는 지점"
- input 글자가 `16px`보다 작으면 두 방식이 모양이 달라서 디자인이 어느 쪽을 원하는지 묻는다. 모바일에서만 input을 키우는 방식과, `16px`을 유지하고 `transform: scale()`로 줄여 그리는 방식이다.[](source:ty-in)
- 묻는 시점이 점검 흐름의 어디인지는 `원문에 명시 없음`이다. 그 밖의 사람 승인 지점도 `원문에 명시 없음`이다.

끝내기 전 검출 표 19행은 다음과 같다.

| 찾을 패턴 | 고치는 법 |
| --- | --- |
| 로드된 `@font-face` 파일에 없는 weight 값의 `font-weight` | 그 face를 로드하거나 서체가 주는 weight를 쓴다 |
| body·인터페이스 글자의 `font-synthesis: none` | 지운다. fallback stack을 확인한 뒤 원치 않는 longhand만 설정한다 |
| `font-variation-settings: "wght"` 또는 `"opsz"` | `font-weight`를 쓰고 `"opsz"`는 지워 `font-optical-sizing: auto`가 적용되게 한다 |
| `font-feature-settings: "tnum"` 또는 `"zero"` | `font-variant-numeric: tabular-nums` 또는 `slashed-zero` |
| `px`나 `rem` 단위의 `line-height` | 단위 없는 값 |
| 감쌀 수 있는 설명·카드 본문·그 밖의 글에 `leading-none`·`leading-tight` | `1.4` 이상 |
| `px` 단위 `letter-spacing` | 같은 값을 `em`으로 |
| body `font-size`가 `px` | `rem` |
| `18px` 미만 글자의 weight `100`–`300` 또는 `font-thin`·`font-light` | `400` 이상 |
| 문단의 `text-wrap: balance` | `text-wrap: pretty` |
| 앱 UI의 `text-align: justify` | `text-align: start` |
| `display: -webkit-box` 없는 `-webkit-line-clamp` | `display: -webkit-box`와 `-webkit-box-orient: vertical`을 추가 |
| `tabular-nums` 없는 timer·counter·가격·숫자 열 | `font-variant-numeric: tabular-nums` |
| 화면에 나오는 문자열의 `...`, `--`, 하이픈 범위 | `…`, em dash, en dash |
| `text-decoration-skip-ink: none` | 지운다. `text-underline-offset`이나 `from-font`로 맞춘다 |
| 모바일 덮어쓰기 없이 `text-sm`·`14px`인 `<input>` | **Inputs at 16px on mobile** 해결책 중 하나 |
| 컴포넌트 안의 `-webkit-font-smoothing`·`antialiased` | 루트로 옮긴다 |
| `<bdi>`나 `dir` 없는 이름·숫자·URL 같은 방향 섞인 값 | `<bdi>`로 감싼다 |
| 레이아웃 루트나 글 컨테이너의 `user-select: none`·`select-none` | 지운다. 드래그·제스처 면에만 둔다 |

표 19행을 옮겼다.[](source:ty-det) 종료 조건은 `Block` 또는 `Approve`를 쓰는 것이다.[](source:ty-end)

## 흐름 속 위치 {#position}

@workflow id=typo-position title="better-typography 앞뒤"
| u-ir | interface-review | backend |
| u-bi | better-interface | backend |
| u-this | better-typography | backend |
| u-out | 통합 보고서 | external |
| u-bi > u-this | 의무 위임 | emphasis |
| u-ir > u-this | 제거된 줄 단서 | dashed |
| u-this > u-out | 도메인 리뷰 증거 | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `better-interface`(앞, 묶음 안) | 리뷰할 화면·흐름·저장소 | 도메인 리뷰 증거 | 의무형. 도메인을 모두 끝낸 뒤 통합한다. 순서는 `better-accessibility`, `better-layout`, `better-writing`, 이 스킬, `better-colors`, `better-ui` 중 4번째다. 이 스킬의 원칙·references·검증만 가져가고 심각도 사다리와 보고 형식은 `better-interface` 것으로 대체한다. 이 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 기억으로 규칙을 만들지 않는다[](source:bi-order) | r63 |
| `interface-review`(앞, 사용자 호출 전용) | 변경의 제거된 줄(`-` 쪽) 중 `lang=`·`dir=`, `text-wrap`·`line-clamp`·`overflow-wrap`·`tabular-nums`·`font-feature-settings`가 빠진 줄 | 이 스킬이 확인한 것만 `Regression` | 조건부. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀다[](source:ir-fm)[](source:ir-rm)[](source:rs-ty) | r72 |
| `better-interface`(뒤) | - | 이 스킬의 증거 | 이 스킬 단독의 `Block`·`Approve`와 표 형식은 통합 보고서에서 `better-interface` 것으로 바뀐다. 이 스킬의 `HIGH` 두 가지(복귀 길 없는 말줄임, 320px·200% zoom 잘림)는 그쪽 escalation trigger에도 있어 표면이 작아도 `HIGH`다. 통합 단계의 세부 동작은 `better-interface/review-format.md`를 읽지 않았다[](source:ty-sev)[](source:bi-trig) | r102 |
| `better-writing` | - | - | 역할 구분. 문구 자체는 그쪽 몫이다[](source:ty-own) | r91 |
| `better-accessibility` | - | - | 역할 구분. heading의 의미 구조는 그쪽 몫이고, 대비가 통과하는지도 그쪽 몫이다[](source:ty-own) | r92 |
| `better-layout` | - | - | 역할 구분. 공간 RTL layout은 그쪽 몫이다. 말줄임으로 잘린 값에서 전체 글로 돌아가는 길도 그쪽 몫이다[](source:ty-own)[](source:ty-p11) | r93 |
| `better-colors` | - | - | 역할 구분. 대비 측정은 그쪽 몫이다[](source:ty-own) | r94 |
| `better-ui` | - | - | 역할 구분. 색이 아닌 밑줄 애니메이션의 모션은 그쪽 몫이다[](source:ty-p13) | r95 |
| `better-ui`(되받음) | - | - | 참고. 그쪽도 줄바꿈·폰트 렌더링·tabular numbers·글자 간격은 이 스킬 몫이라고 적는다[](source:ui-bound) | r75 |
| `better-accessibility`(되받음) | - | - | 참고. 그쪽은 글자 크기, iOS input 확대(`16px` 규칙), 언어 메타데이터를 이 스킬 몫이라고 적는다[](source:ac-bound)[](source:ac-zoom) | r80 |
| `better-layout`(되받음) | - | - | 참고. 그쪽은 줄 길이, 글자 간격, 말줄임 방식, 숫자 정렬의 tabular figures, bidi 규칙을 이 스킬 몫이라고 적는다[](source:ly-own)[](source:ly-trunc)[](source:ga-num)[](source:ga-bidi) | r88 |
| `better-writing`(되받음) | - | - | 참고. 그쪽은 `text-transform`·말줄임·스마트 문장부호 같은 렌더링을 이 스킬 몫이라고 적는다[](source:wr-bound) | r96 |
| `variant`(묶음 밖, 사용자 호출 전용) | - | - | 참고. 변형 축 표에서 Type 축의 담당 스킬로 이 스킬을 적는다. 호출 지시는 아니다[](source:va-axis) | r110 |
| `break`(묶음 밖, 사용자 호출 전용) | - | - | 참고. 줄바꿈 없는 긴 문자열 같은 깨짐과 줄바꿈·말줄임·RTL 글자 깨짐을 이 스킬 어휘로 이름 붙인다. 호출 지시는 아니다[](source:br-own)[](source:br-row)[](source:br-sc19)[](source:br-sc33) | r116 |
| `explain-interface`(묶음 밖, 사용자 호출 전용) | 측정한 본문 한 줄 글자 수 | - | 참고. 본문 60~75자 기준을 이 스킬에서 가져다 비교한다. 판정은 하지 않는다[](source:ex-img) | r133 |
| `build-design`(묶음 밖) | - | 충돌 보고 | 참고. 디자인이 글자 규칙을 깨면 디자인대로 만들고 충돌을 이 스킬에 보고한다(의무형)[](source:bd-own) | r137 |
| `teardown`(묶음 밖) | - | - | 참고. 글자 렌더링은 이 스킬 몫이라고 적는다. 호출 지시는 아니다[](source:td-own) | r144 |

그림에는 묶음 안의 r63과 r72만 그렸다. 나머지는 역할 구분이거나 묶음 밖이라 표에만 남겼다. 판정: 이 스킬이 다른 스킬을 실행하라는 문장은 원문에 없고, 위 참고 행은 모두 "그쪽 몫"이라는 경계 표시다. 사용자 호출 전용인 `interface-review`는 `description` 매칭으로 시작되지 않으므로 r72는 사람이 `interface-review`를 먼저 실행한 뒤에만 열린다.[](source:ir-fm)

전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 8개, 합계 29,444B다. `SKILL.md` 12,244B, `css-cheat-sheet.md` 4,288B, `wrapping-and-punctuation.md` 1,618B, `details-and-accessibility.md` 3,339B, `choosing-fonts.md` 2,142B, `spacing-and-sizing.md` 2,234B, `variable-fonts-and-opentype.md` 3,468B, `agents/openai.yaml` 111B를 모두 읽었다. 부분 읽음 파일은 0개다.
- 제외한 파일: 번역본과 바이너리 파일은 이 폴더에 없다. `find`로 파일 8개만 확인했다.
- 관계 확인용으로 다른 스킬 11개, 파일 17개의 해당 줄만 읽었다. `better-interface`, `interface-review`(2개 파일 + 원장 밖 참조 1개), `better-ui`, `better-accessibility`(`SKILL.md`와 원장 밖 참조 파일 1개), `better-writing`, `better-layout`(2개 파일), `variant`, `break`(2개 파일), `explain-interface`(2개 파일), `build-design`, `teardown`이다.
- 원문 대조 범위(`SKILL.md`): 활성화 제한(없음), 원칙 21개, 수치 전부(`400`, `18px`, `28px`, `1.1`·`1.2`–`1.3`·`1.5`–`1.6`·`1.4`, `-0.01em`~`-0.02em`·`0.05em`, 60–75자, 여섯 줄, `16px`, `14px`, `13px`, `12px`), 검출 표 19행, 심각도 3단계, 검증 규칙, 보고 열 5개, 종료 조건, 사람에게 묻는 지점(input 방식 하나)을 대조했다. 참고 문서 6개의 표와 코드 예시도 모두 읽었다.
- 관계 행 대조: 원장 r63, r72, r75, r80, r88, r91~r96, r102, r110, r116, r133, r137, r144의 17행을 원문 줄과 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. 작업 트리의 `design/`은 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- `18px`~`27px` 글자에서 weight `100`–`300`을 써도 되는지는 `원문에 명시 없음`이다. 본문은 `18px` 미만에 `400` 이상을, `100`–`300`은 `28px` 이상에 두라고만 한다.[](source:ty-p1)
- `14px`보다 크고 `24px`보다 작은 글자의 letter-spacing은 `원문에 명시 없음`이다. 어차피 휴리스틱이라 프로젝트 scale을 깰 때만 보고한다.[](source:ty-p7)[](source:ty-heur)
- Display의 `1.1`과 "세 줄 이상 감싸는 글은 `1.4` 이상"이 부딪치는 경우(Display 제목이 세 줄로 감쌀 때)는 `원문에 명시 없음`이다. 판정: 문장이 "anything"이라고 쓰므로 `1.4`가 우선한다고 읽을 수 있으나 원문이 정하지는 않았다.[](source:ty-p6)
- `text-box`와 `initial-letter`의 브라우저 지원은 원문 기재만 옮겼고 현재 지원 상태를 따로 확인하지 않았다. 스킬의 CSS 코드도 읽기만 했고 브라우저에서 돌려 보지 않았다.[](source:ss-tb)[](source:da-dec)
- 다른 스킬 세 곳이 이 스킬에 일을 넘기지만 원장에 그 줄이 없다. `better-accessibility/semantics-and-aria.md` 61줄은 `translate="no"` 처리를, `interface-review/scope-resolution.md` 68줄은 폰트 파일 추가·교체 리뷰를, `explain-interface/SKILL.md` 11줄은 글자 영역 이름 붙이기를 이 스킬 몫으로 적는다.[](source:ac-tr)[](source:sr-font)[](source:ex-fm)
