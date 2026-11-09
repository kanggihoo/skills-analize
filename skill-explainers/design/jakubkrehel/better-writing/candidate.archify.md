# better-writing 스킬은 에이전트를 어떻게 바꾸나 {#better-writing-skill}

`better-writing`을 쓰면 에이전트는 문구를 취향대로 고치지 않고, 먼저 저장소의 기존 문자열에서 용어·동사·대소문자를 조사한 뒤 그 목록에 맞춰 쓰거나 리뷰한다. 오류는 고치는 방법을 실패한 곳 옆에 적고, 되돌릴 수 있는 동작은 확인 창 대신 undo로 처리한다. 복구 방법이 없는 오류와, 확인도 undo도 없는 파괴 동작은 `HIGH`라서 `Block`으로 끝난다.[](source:inv)[](source:err)[](source:undo)[](source:sev)[](source:format)

- 켜지는 때: 호출 제한 필드가 없다. 모델이 `description`을 보고 켤 수 있다. 사용자가 직접 부를 때만 켜진다는 말은 없다.[](source:fm)
- 강제하는 것: 새 문구는 조사한 용어 목록을 쓴다. 변수 둘레에 문장 조각을 이어 붙이지 않고 문장 하나를 통째로 쓴다.[](source:inv)[](source:whole)
- 지키는 선: 의도한 브랜드 어조는 결함이 아니다. 어조가 일관성·모호함·번역 위험을 만들거나 상황의 무게에 안 맞을 때만 지적한다.[](source:intro)
- 쓰면 안 되는 때: 취향에 맞춰 문구를 바꾸는 일이다. 렌더링, 오류 마크업, 번역 문자열의 공간은 다른 스킬이 맡는다.[](source:intro)[](source:owners)

@answer scope="design/jakubkrehel/better-writing · 원본 텍스트 3개 12,367B · 커밋 0465878 · 호출 제한 없음 · 지시상 동작"
@meta locale=ko
@source fm title="design/jakubkrehel/better-writing/SKILL.md · 9414B · 지시 본문과 frontmatter" path=design/jakubkrehel/better-writing/SKILL.md lines=1:4
@source intro title="SKILL.md · 하는 일과 브랜드 어조" path=design/jakubkrehel/better-writing/SKILL.md lines=8:10
@source owners title="SKILL.md · 다른 스킬의 몫" path=design/jakubkrehel/better-writing/SKILL.md lines=12:12
@source inv title="SKILL.md · 기존 문자열 조사" path=design/jakubkrehel/better-writing/SKILL.md lines=14:22
@source voice title="SKILL.md · 어조와 어휘" path=design/jakubkrehel/better-writing/SKILL.md lines=26:35
@source you title="SKILL.md · 독자에게 직접" path=design/jakubkrehel/better-writing/SKILL.md lines=39:41
@source plain title="SKILL.md · 쉬운 말" path=design/jakubkrehel/better-writing/SKILL.md lines=45:47
@source whole title="SKILL.md · 문자열 통째로 쓰기" path=design/jakubkrehel/better-writing/SKILL.md lines=51:51
@source verb title="SKILL.md · 동사로 시작하는 버튼" path=design/jakubkrehel/better-writing/SKILL.md lines=55:57
@source links title="SKILL.md · 링크 문구" path=design/jakubkrehel/better-writing/SKILL.md lines=61:63
@source cap title="SKILL.md · 대소문자 정책" path=design/jakubkrehel/better-writing/SKILL.md lines=67:67
@source toggle title="SKILL.md · 설정 토글" path=design/jakubkrehel/better-writing/SKILL.md lines=71:73
@source err title="SKILL.md · 오류" path=design/jakubkrehel/better-writing/SKILL.md lines=77:85
@source undo title="SKILL.md · undo와 확인" path=design/jakubkrehel/better-writing/SKILL.md lines=89:98
@source empty title="SKILL.md · 빈 상태" path=design/jakubkrehel/better-writing/SKILL.md lines=102:116
@source ph title="SKILL.md · placeholder" path=design/jakubkrehel/better-writing/SKILL.md lines=120:120
@source detect title="SKILL.md · 끝내기 전 검사 11개" path=design/jakubkrehel/better-writing/SKILL.md lines=124:136
@source sev title="SKILL.md · 심각도" path=design/jakubkrehel/better-writing/SKILL.md lines=140:140
@source verify title="SKILL.md · 검증" path=design/jakubkrehel/better-writing/SKILL.md lines=142:142
@source format title="SKILL.md · 보고 형식과 Block·Approve" path=design/jakubkrehel/better-writing/SKILL.md lines=144:151
@source pt-destr title="design/jakubkrehel/better-writing/patterns.md · 2845B · 파괴 흐름·상태 문구·plural·locale 형식" path=design/jakubkrehel/better-writing/patterns.md lines=7:15
@source pt-status title="patterns.md · 상태 문구" path=design/jakubkrehel/better-writing/patterns.md lines=19:27
@source pt-icu title="patterns.md · ICU 메시지 예" path=design/jakubkrehel/better-writing/patterns.md lines=31:42
@source pt-icu-code title="patterns.md · ICU 코드 블록" path=design/jakubkrehel/better-writing/patterns.md lines=34:39
@source pt-intl title="patterns.md · locale 형식" path=design/jakubkrehel/better-writing/patterns.md lines=46:56
@source yaml title="design/jakubkrehel/better-writing/agents/openai.yaml · 108B · 표시 이름과 한 줄 설명" path=design/jakubkrehel/better-writing/agents/openai.yaml lines=1:3
@source bi-order title="design/jakubkrehel/better-interface/SKILL.md · r62 확인용 도메인 순서" path=design/jakubkrehel/better-interface/SKILL.md lines=42:57
@source bi-trig title="design/jakubkrehel/better-interface/SKILL.md · escalation trigger 비교용" path=design/jakubkrehel/better-interface/SKILL.md lines=77:91
@source bi-ro title="design/jakubkrehel/better-interface/SKILL.md · 기본은 읽기 전용 리뷰" path=design/jakubkrehel/better-interface/SKILL.md lines=113:115
@source ir-rm title="design/jakubkrehel/interface-review/SKILL.md · r73 확인용 제거된 줄 읽기" path=design/jakubkrehel/interface-review/SKILL.md lines=56:61
@source ir-sig title="design/jakubkrehel/interface-review/removed-signals.md · r73 확인용 신호 표" path=design/jakubkrehel/interface-review/removed-signals.md lines=17:17
@source ac-own title="design/jakubkrehel/better-accessibility/SKILL.md · r82 확인용" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source la-own title="design/jakubkrehel/better-layout/SKILL.md · r89 확인용" path=design/jakubkrehel/better-layout/SKILL.md lines=12:12
@source ty-own title="design/jakubkrehel/better-typography/SKILL.md · r91 확인용" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source va-axis title="design/jakubkrehel/variant/SKILL.md · r111 확인용 변형 축" path=design/jakubkrehel/variant/SKILL.md lines=23:23
@source br-own title="design/jakubkrehel/break/SKILL.md · r118 확인용 시나리오 표" path=design/jakubkrehel/break/SKILL.md lines=58:58
@source br-sc1 title="design/jakubkrehel/break/scenarios.md · r118 확인용 긴 텍스트" path=design/jakubkrehel/break/scenarios.md lines=19:19
@source br-sc2 title="design/jakubkrehel/break/scenarios.md · r118 확인용 빈 컬렉션" path=design/jakubkrehel/break/scenarios.md lines=46:46
@source bd-own title="design/jakubkrehel/build-design/SKILL.md · r139 확인용" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source td-own title="design/jakubkrehel/teardown/preview-page.md · r148 확인용" path=design/jakubkrehel/teardown/preview-page.md lines=31:31

## 언제 켜지고, 무엇이 다른 스킬의 몫인가 {#trigger}

@code source=fm language=yaml

frontmatter에는 `name`과 `description`만 있다. 호출 제한 필드가 없으므로 모델이 `description`을 보고 켤 수 있다.[](source:fm)

판정: `description`은 모델이 판단할 때 참고하는 설명이다. "labels"나 "errors"라는 단어가 나와야만 켜지는 목록은 아니다. 첫 응답 규칙이나 호출 인자는 `원문에 명시 없음`이다.

`agents/openai.yaml`에는 표시 이름 `Better Writing`과 한 줄 설명만 있고, 동작 지시는 없다.[](source:yaml)

이 스킬은 라벨, 오류, 빈 상태, 확인 창 같은 인터페이스 문구와 그 문구를 관통하는 용어를 쓰고 리뷰한다.[](source:intro) 다음 영역은 다른 스킬이 맡는다.[](source:owners)

| 영역 | 담당 스킬 | 이 스킬에 남는 것 |
| --- | --- | --- |
| `text-transform`, 말줄임, 스마트 문장부호 같은 렌더링 | `better-typography` | 문구 자체만 본다 |
| 오류 마크업, 스크린 리더 안내, 접근 가능한 이름을 싣는 속성 | `better-accessibility` | 아이콘 버튼의 이름이 동작을 말하는지만 본다[](source:verb) |
| placeholder 옆에 visible label이 필요한지, undo toast가 화면에 머무는 시간 | `better-accessibility` | placeholder와 toast의 문구[](source:ph)[](source:pt-destr) |
| 번역 문자열이 들어갈 공간 | `better-layout` | 문장을 통째로 쓰는 규칙만 둔다[](source:whole) |
| 파괴 버튼의 구분되는 색 | `better-colors` | 버튼 문구[](source:undo) |

판정에 쓰는 선도 정해 두었다.[](source:intro)

- 의도한 브랜드 어조는 결함이 아니다.
- 평이한 말에서 벗어난 것은 일관성 부족, 모호함, 번역 위험, 상황의 무게에 안 맞는 어조를 만들 때만 제기한다.
- 취향에 맞춘 재작성은 지적이 아니다.

## 먼저 무엇을 조사하고, 어떤 규칙으로 쓰나 {#rules}

쓰거나 리뷰하기 전에 에이전트는 문구가 어디에 있는지 찾고 주변 문구를 읽는다.[](source:inv)

@steps id=inventory-steps
| find | 문자열 위치 찾기 | 번역 호출(`t(`, `i18n.`, `<FormattedMessage`, `$t(`)과 locale 파일(`locales/**/*.json`, `messages/*.json`, `*.po`, `*.strings`)을 찾는다. 문구가 CMS나 API에서 올 수도 있다.[](source:inv) |
| nouns | 용어 목록 | 객체마다 쓰는 명사("project"인지 "workspace"인지)와 동작마다 쓰는 동사("Delete"인지 "Remove"인지)를 적는다.[](source:inv) |
| case | 대소문자와 가이드 | 요소 종류별 대소문자와, 있으면 어조·콘텐츠 가이드를 적는다.[](source:inv) |

새 문구는 이 목록의 용어를 쓴다. 같은 것을 두 이름으로 부른 곳에서만 동의어가 지적이다.[](source:inv)

어조는 상황의 무게에 따라 달라진다.[](source:voice)

| 상황 | 어조 |
| --- | --- |
| 성공, 온보딩, 빈 상태 | 따뜻하고 가벼워도 된다 |
| 일상 동작, 설정 | 중립적이고 최소한으로 쓴다 |
| 오류, 파괴 확인 | 차분하고 평이하게. 장난은 전혀 없다 {caution:장난 금지} |
| 데이터 손실, 보안 | 진지하고 명시적으로 쓴다 |

| 규칙 | 하는 것 | 하지 않는 것 |
| --- | --- | --- |
| 어조와 어휘 | 제품의 기존 문구가 정한 어조 하나를 따른다. 여러 단계 흐름은 어휘 하나로 간다. 예: 진입 "Get started", 진행 "Continue" 또는 "Next", 완료 "Done"[](source:voice) | 국소 수정이 새 어조를 만들지 않는다. 메뉴가 "Archive"면 toast도 "Move to storage"가 아니다 |
| 독자에게 직접 | 안내 문구는 "you"로 쓴다. 오류는 "Unable to load content. Check your connection and try again."처럼 쓴다[](source:you) | 안내에서 "the user", 오류에서 "we"(회피처럼 읽힌다). 확립된 1인칭은 위험이 낮은 문구에서 유지해도 된다. 소유격은 아껴서 "Favorites"가 "Your favorites"보다 낫고, 한 흐름에서 "My account"와 "Your settings"를 섞지 않는다 |
| 쉬운 말 | 지친 독자가 한 번에 이해할 단어를 고르고, 일하지 않는 단어를 지운다. 불필요한 성별 표현은 피한다("Subscribers can post recipes"). 입력 장치에 맞춰 touch는 "tap", pointer는 "click", 둘 다 가능하면 "select"[](source:plain) | idiom, 구어, 번역되지 않는 유머 |
| 버튼 | 동작을 가리키는 동사로 시작한다("Send", "Save draft", "Delete project"). 아이콘만 있는 버튼의 접근 가능한 이름도 동작을 적는다[](source:verb) | "OK!", "Let's go!", glyph 이름("Trash icon") |
| 링크 | 문맥 없이도 뜻이 통하게 쓴다("Read the billing docs"). "Learn more"가 한 페이지에 둘 이상이면 각각 덧붙인다("Learn more about exports")[](source:links) | "Click here". screen reader 사용자는 링크 목록으로 이동하기 때문이다 |
| 대소문자 | 요소 종류마다 title case나 sentence case 하나를 골라 그 종류 전체에 적용한다. 프로젝트 정책이 없으면 sentence case가 기본이다[](source:cap) | "Save Changes"와 "Discard changes"를 나란히 두지 않는다 |
| 설정 토글 | 켜졌을 때 일어나는 일을 라벨로 쓴다("Send read receipts"). 참조하는 설정은 경로 설명 대신 링크로 건다("Notification settings")[](source:toggle) | "Don't send read receipts"(이중 부정), `Go to Settings > Notifications > Email` |
| placeholder | 필드가 받는 형식의 현실적인 예를 보여 준다(`name@example.com`, `DD/MM/YYYY`)[](source:ph) | 지시문 |

## 오류·확인·빈 상태는 어떻게 쓰나 {#flows}

오류는 지시문이고, 실패한 필드 옆에 있어야 한다.[](source:err)

| 나쁜 예 | 좋은 예 |
| --- | --- |
| That password is too short | Choose a password with at least 8 characters |
| Invalid date | Enter a date as DD/MM/YYYY |
| Oops! Something went wrong. | Unable to save. Check your connection and try again. |

- 탓하지 않는다. "oops"와 느낌표를 쓰지 않는다.[](source:err)
- 힌트는 긍정문으로 쓴다. "Use at least 8 characters"가 "Don't use fewer than 8"보다 낫다.[](source:err)
- 알려진 요구 사항은 입력 전에 helper text로 보여 준다. 오류에만 두지 않는다.[](source:err)
- 같은 오류가 계속 나면 일어날 수 없게 상호작용을 다시 설계한다.[](source:err)

되돌릴 수 있고 사람들이 자주 하는 동작(archive, 이동, 휴지통으로 삭제)은 바로 실행하고 결과에 undo를 붙인다. 예: "Project archived. Undo". 되돌릴 수 없거나, 다른 사람에게 영향을 주거나, 한 번에 많은 항목을 지우면 실행 전에 확인한다.[](source:undo)

확인 창은 결과를 반복해서, 본문을 읽지 않아도 답할 수 있게 쓴다.[](source:undo)

- 제목은 동작과 대상을 말한다. "Delete 'Q3 report'?"처럼 쓰고 "Are you sure?"는 쓰지 않는다.
- 본문은 잃는 것과 복구할 수 없는 것을 적는다. 해당하면 개수도 적는다.
- 버튼은 동사와 대상이다. `Delete project`와 `Cancel`처럼 쓰고 `Yes`와 `No`는 쓰지 않는다.
- 계정, workspace, repository는 대상 이름을 입력하게 한다.

| 상황 | 문구 템플릿 |
| --- | --- |
| 되돌릴 수 있고 자주 하는 동작 | toast "Project archived"에 `Undo` 동작을 붙인다 |
| 되돌릴 수 없는 항목 하나 | 제목 "Delete 'Q3 report'?", 본문 "This permanently deletes the report and its 4 comments.", 버튼 `Delete report`와 `Cancel` |
| 되돌릴 수 없는 항목 여럿 | 제목 "Delete 12 files?", 본문 "You can't undo this.", 버튼 `Delete 12 files`와 `Cancel` |
| 다른 사람에게 영향 | 본문이 누구인지 적는다. "The 8 members of Design lose access." |
| 계정, workspace, repository | 필드 라벨 "Type 'acme-web' to confirm". 입력이 일치할 때까지 버튼은 비활성이다 |

위 표의 문구는 템플릿 예시이고, 숫자(4, 12, 8)는 모두 예문의 값이다.[](source:pt-destr) 판정: 여러 항목 삭제 템플릿의 본문은 한 문장이다. 개수는 제목과 버튼에 있고, 본문에 잃는 것을 적으라는 `SKILL.md`의 규칙보다 짧다.[](source:undo)[](source:pt-destr)

빈 상태는 이 자리가 무엇인지, 어떻게 채우는지 말하고 분명한 다음 동작 하나를 준다.[](source:empty)

| 경우 | 쓰는 법 | 예 |
| --- | --- | --- |
| 처음부터 비어 있다 | 오리엔테이션과 다음 단계를 준다. "No results."만 쓰는 것은 나쁜 예다 | 제목 "No projects yet", 설명 "Projects keep your tasks and files together.", 버튼 "Create a project"[](source:empty) |
| 필터 결과가 비었다 | 검색어를 말하고 빠져나갈 길을 준다 | "No results for 'quarterly'. Clear filters"[](source:empty) |
| 계속 보여야 하는 정보 | 빈 상태에 두지 않는다. 내용이 생기면 사라지기 때문이다 | - |


## 문자열은 어떻게 조립하고 형식은 누가 맡나 {#strings}

변수 둘레에 문장 조각을 이어 붙이지 않는다. 예: `"You have " + n + " new messages"`. 언어마다 어순이 달라서다.[](source:whole)

- 문장 하나를 placeholder가 든 메시지 하나로 쓴다.
- 복수형은 `n === 1 ? "" : "s"` 대신 locale의 plural 규칙을 따른다. 복수형이 둘보다 많은 언어가 많다.
- 숫자, 날짜, 목록은 `Intl`로 형식을 만든다.[](source:whole)

ICU MessageFormat 한 문장으로 쓴다. 변수는 문장 안에 있고 번역가가 옮긴다.[](source:pt-icu)

@code source=pt-icu-code language=text

`=0`은 숫자 0과 정확히 맞는다. `one`과 `other`는 plural 범주이고, 번역가가 언어에 필요하면 `few`나 `many`를 더한다. 라이브러리가 없으면 `new Intl.PluralRules(locale).select(count)`로 범주를 고른다.[](source:pt-icu)

숫자, 날짜, 목록을 손으로 만들지 않고 사용자의 locale을 `Intl`에 넘긴다.[](source:pt-intl)

| 값 | 호출 | `en-US` 출력 |
| --- | --- | --- |
| 통화 | `new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" })` | `€4,320.00` |
| 단위 | `new Intl.NumberFormat(locale, { style: "unit", unit: "megabyte" })` | `12 MB` |
| 날짜 | `new Intl.DateTimeFormat(locale, { dateStyle: "medium" })` | `Jun 30, 2026` |
| 상대 시간 | `new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-1, "day")` | `yesterday` |
| 목록 | `new Intl.ListFormat(locale, { type: "conjunction" })` | `Ana, Ben, and Cy` |

`Intl.ListFormat`은 locale마다 다른 쉼표와 접속사 규칙을 따른다. 그래서 이름을 `", "`와 `" and "`로 직접 잇지 않는다.[](source:pt-intl)

진행·완료·실패·사용 불가·부분 성공 상태는 아래 패턴을 쓴다. 진행 중 문구와 완료 문구는 나란히 대응해야 한다. "Saving changes…"는 "Changes saved"로 끝난다.[](source:pt-status)

| 상태 | 패턴 | 예 |
| --- | --- | --- |
| 진행 중 | `-ing` 동사와 대상 | "Saving changes…", "Loading invoices…" |
| 완료 | 대상과 과거 동사. "successfully"는 쓰지 않는다 | "Changes saved", "Invite sent to sam@example.com" |
| 실패 | 일어나지 않은 일, 그다음 단계 | "Changes not saved. Check your connection and try again." |
| 사용 불가 | 이유와 풀리는 조건을 컨트롤 옆에 | "Add a payment method to publish" |
| 부분 성공 | 두 결과의 개수 | "9 of 12 files uploaded. Retry 3 failed files" |

## 리뷰는 어떻게 하고 어떻게 끝나나 {#review}

에이전트는 라벨마다 호출하는 동작과 맞는지, 오류마다 고치는 방법이 있는지, 용어마다 조사한 목록과 맞는지 확인한다. 컴포넌트뿐 아니라 locale 파일도 읽는다. 서버나 CMS가 주는 문구를 볼 수 없으면 `Not verified`로 보고한다.[](source:verify)

@facts
| `HIGH` | 사용자를 오도하거나 오류에서 벗어나는 방법을 숨긴다. 복구 방법을 이름 붙이지 않은 오류는 항상 `HIGH`이고, 확인도 undo도 없는 파괴 동작도 `HIGH`다[](source:sev) |
| `MEDIUM` | 어조, 용어, 대소문자의 일관성을 깬다[](source:sev) |
| `LOW` | 고립된 문구 다듬기다[](source:sev) |

지적은 어긴 원칙별로 묶고, 심각도 순으로 놓고, 원인 하나에 한 행으로 쓰며 그 원인이 나타나는 위치를 모두 적는다. 열은 `Severity`, `Location`, `Before`, `After`, `Why`이고, `Location`은 `path/to/file:line`, `Why`는 원칙과 사용자 영향이다.[](source:format)

`HIGH`가 하나라도 남으면 `Block`, 아니면 `Approve`로 끝낸다. 나머지 지적은 표에 할 일로 남는다. 검사하지 않은 범위는 `Approve`하지 않는다. 지적이 없으면 "No actionable writing findings"라고 쓰고 검증 결과를 보고한다.[](source:format)

끝내기 전에 코드에서 아래 11개를 찾는다.[](source:detect)

| 찾을 것 | 고치는 것 |
| --- | --- |
| `Click here`, `here`라고만 쓴 링크, 같은 `Learn more` 링크 둘 | 목적지를 이름으로 쓴다 |
| `Oops`, `Something went wrong`, 오류 문자열의 `!` | 무엇이 실패했는지와 다음 단계를 쓴다 |
| `" + n + "`, 문장 조각이 든 template literal, `=== 1 ? "" : "s"` | plural 인자가 있는 ICU 메시지 하나로 쓴다 |
| 대화창 버튼의 `>OK<`, `>Yes<`, `>No<` | 동사와 대상으로 쓴다 |
| `Are you sure` | 동작과 대상을 이름으로 쓴다 |
| `successfully` | 지운다. "Changes saved"로 쓴다 |
| 일상 안내의 `Please` | 지운다 |
| `Don't`, `Disable`, `Hide`로 시작하는 토글 라벨 | 켜진 상태를 설명한다 |
| `aria-label="Trash"`, `"Close icon"`, `"X"` | 동작 이름을 쓴다. "Delete project", "Close dialog" |
| locale 없는 `toLocaleDateString()`, `getMonth()`로 만든 날짜 | 사용자 locale의 `Intl.DateTimeFormat`을 쓴다 |
| `Save Changes` 옆의 `Discard changes` | 요소 종류마다 대소문자 하나로 맞춘다 |

## 흐름 속 위치 {#position}

@workflow id=writing-position title="better-writing 앞뒤"
| u-ir | interface-review | backend |
| u-bi | better-interface | backend |
| u-prev | better-accessibility, better-layout | backend |
| u-wr | better-writing | backend |
| u-next | better-typography, better-colors, better-ui | backend |
| u-out | 통합 보고서 | external |
| u-bi > u-prev | 내부 위임 |
| u-prev > u-wr | 3번째 | emphasis |
| u-wr > u-next | 순서만 |
| u-next > u-out | 도메인 증거 |
| u-ir > u-wr | 제거된 문구 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `better-interface`(앞) | 리뷰할 화면·흐름·저장소 범위 | 도메인 리뷰 증거 | 의무형 내부 위임이다. 여섯 도메인 중 3번째이고, 기초 실패가 장식에 가려지지 않게 이 순서로 한다. `better-interface`는 이 스킬에서 원칙, references, 검증만 가져가고 심각도와 형식은 자기 것으로 바꾼다. 이 스킬을 쓸 수 없으면 그 도메인을 `Not reviewed`로 표시하고 기억으로 규칙을 만들지 않는다[](source:bi-order) | r62 |
| `interface-review`(앞) | 변경에서 사용자에게 보이는 문자열이 지워지거나 줄어든 줄 | 이 스킬이 확인한 것만 `Regression` | 조건부 내부 위임이다. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀다. 담당 스킬이 확인한 것만 보고한다[](source:ir-rm)[](source:ir-sig) | r73 |
| `better-accessibility` | - | - | 참고. 오류 마크업, 안내, 접근 가능한 이름을 싣는 속성, undo toast 표시 시간, visible label 필요 여부는 그쪽 몫이다. 반대로 그쪽은 라벨·오류·alt text의 문구를 이 스킬 몫으로 적는다[](source:owners)[](source:ac-own) | r97, r82 |
| `better-typography` | - | - | 참고. `text-transform`, 말줄임, 스마트 문장부호 같은 렌더링은 그쪽 몫이다. 그쪽도 문구 자체를 이 스킬 몫으로 적는다[](source:owners)[](source:ty-own) | r96, r91 |
| `better-layout` | - | - | 참고. 번역 문자열이 들어갈 공간은 그쪽 몫이다. 그쪽도 문구 자체를 이 스킬 몫으로 적는다[](source:owners)[](source:la-own) | r98, r89 |
| `better-colors` | - | - | 참고. 파괴 버튼의 구분되는 색은 그쪽 몫이다[](source:undo) | r99 |
| `better-interface`의 escalation trigger | - | - | 원장에 없는 겹침이다. 13개 trigger 중 "복구 방법 없는 오류"와 "확인·undo·구분 처리 없는 파괴 동작"이 이 스킬의 `HIGH` 기준과 겹친다. 뒤의 것은 `distinct treatment`(구분 처리)가 있으면 발동하지 않지만, 이 스킬은 확인도 undo도 없으면 구분 처리와 관계없이 `HIGH`로 본다[](source:bi-trig)[](source:sev) | - |
| `variant`(묶음 밖) | - | - | 참고. 변형 축 표에서 Voice 축의 담당 스킬로 이 스킬을 적는다[](source:va-axis) | r111 |
| `break`(묶음 밖) | - | - | 참고. 깨짐을 고칠 담당 스킬의 어휘로 이름 붙인다. 시나리오 표가 원문 문구가 문제인 깨짐과 빈 컬렉션의 빈 상태를 이 스킬에 배정한다. 호출 지시는 아니다[](source:br-own)[](source:br-sc1)[](source:br-sc2) | r118 |
| `build-design`(묶음 밖) | - | 충돌 보고 | 참고. 디자인이 카피 규칙을 깨면 디자인대로 만들고 충돌을 소유자와 함께 보고한다(의무형)[](source:bd-own) | r139 |
| `teardown`(묶음 밖) | - | - | 참고. 컨트롤 카피는 이 스킬이 맡는다고 적는다. 호출 지시는 아니다[](source:td-own) | r148 |

그림은 묶음 안의 r62와 r73만 그렸다. 나머지는 참고와 역할 구분이라 표에만 남겼다.

전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 3개, 합계 12,367B다. `SKILL.md` 9,414B, `patterns.md` 2,845B, `agents/openai.yaml` 108B를 모두 읽었다. 구조·표본만 본 파일은 0개다.
- 제외한 파일: 없음. 번역본과 바이너리 파일은 이 폴더에 없다.
- 관계 확인용으로 다른 스킬의 해당 줄만 읽었다. `better-interface` 42~57줄·77~91줄·113~115줄, `interface-review/SKILL.md` 56~61줄과 `removed-signals.md` 17줄, `better-accessibility` 12줄, `better-layout` 12줄, `better-typography` 10줄, `variant` 23줄, `break/SKILL.md` 58줄과 `break/scenarios.md` 19줄·46줄, `build-design` 12줄, `teardown/preview-page.md` 31줄이다.
- 원문 대조 범위(`SKILL.md`): frontmatter와 호출 제한 필드 0개, 규칙 절 13개, 어조 표 4행, 오류 표 3행, 검사 표 11행, 심각도 3단계, 검증 규칙, 보고 형식, `Block`·`Approve` 조건을 모두 대조했다. `patterns.md`는 파괴 흐름 5행, 상태 문구 5행, ICU 예, `Intl` 5행을 모두 대조했다.
- 수치 기준: 이 스킬에 임계값은 없다. 본문의 숫자(8자, 4개 comment, 12개 file, 8명)는 모두 예문의 값이다.
- 관계 행 대조: r62, r73, r82, r89, r91, r96, r97, r98, r99, r111, r118, r139, r148 모두 13행을 원문과 다시 대조했고 원장과 같다. 사람 승인 지점과 종료 조건은 원문에 `Block`·`Approve`와, 계정·workspace·repository 삭제 때 이름을 입력하게 하는 확인 외에 없다.
- 분석 중 바뀐 파일: 없음. `design/` 아래는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 되돌릴 수 있지만 드물게 하는 동작이 undo 대상인지 확인 대상인지는 `원문에 명시 없음`이다. 원문은 "되돌릴 수 있고 자주 하는 동작"과 "되돌릴 수 없거나, 다른 사람에게 영향을 주거나, 많은 항목을 지우는 동작"만 나눈다.[](source:undo)
- 이 스킬만 부를 때 에이전트가 파일을 고치는지 보고만 하는지는 `원문에 명시 없음`이다. `better-interface`를 거치면 기본이 읽기 전용이다.[](source:bi-ro)
- 이 스킬을 실제로 돌려 보지 않았다. 에이전트가 용어 조사와 보고 형식을 지키는지는 확인하지 않았다.
