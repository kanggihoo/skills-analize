# better-writing — 제품 어조와 안내 원칙에 맞게 UI 카피를 쓰고 리뷰한다 {#overview}

`better-writing`은 에이전트가 버튼 레이블, 에러, 빈 상태, 확인 대화상자 같은 인터페이스 문구를 제품의 기존 어조와 용어에 맞게 작성하거나 리뷰하게 하는 스킬이다.[](source:bw-intro)

- 인터페이스 카피를 새로 쓰거나, 번역 가능성·용어 일관성·에러 안내·파괴적 작업 확인 문구를 점검할 때 켠다.[](source:bw-fm)[](source:bw-intro)
- 결과는 기존 용어 목록과 메시지 포맷에 맞춘 UI 카피 수정안이거나, 원칙별 위반표와 `Block`/`Approve` 판정 결과가 담긴 리뷰 보고서다.[](source:bw-inv)[](source:bw-report)
- `better-interface`·`interface-review`가 이 스킬을 호출하고, `better-accessibility`와 `better-typography`가 문구 소유권을 참고한다. 이 스킬은 아이콘 버튼 접근성 속성·실행 취소 토스트 유지 시간 소유권을 `better-accessibility`로, 파괴적 버튼 색상 소유권을 `better-colors`로 가리켜 참고한다.
- 의도된 브랜드 어조를 취향만으로 고치지 않으며, `text-transform`·말줄임·접근성 속성·번역 길이 공간 확보는 다른 소유 스킬 영역으로 남긴다.[](source:bw-intro)

@answer scope="design/jakubkrehel/better-writing · 원본 파일 4개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source bw-fm title="frontmatter: 이름과 description" path=design/jakubkrehel/better-writing/SKILL.md lines=1:4
@source bw-oa title="agents/openai.yaml: UI 표시 정보" path=design/jakubkrehel/better-writing/agents/openai.yaml lines=1:3
@source bw-intro title="카피 범위, 브랜드 어조와 도메인 경계" path=design/jakubkrehel/better-writing/SKILL.md lines=6:12
@source bw-inv title="사전 문자열·용어 조사 절차" path=design/jakubkrehel/better-writing/SKILL.md lines=14:22
@source bw-voice title="단일 어조, 독자 호칭, 평이한 단어" path=design/jakubkrehel/better-writing/SKILL.md lines=24:47
@source bw-whole title="문장 단위 메시지와 Intl 포맷" path=design/jakubkrehel/better-writing/SKILL.md lines=49:51
@source bw-ctrl title="동사 우선 버튼, 링크, 대소문자, 설정 레이블" path=design/jakubkrehel/better-writing/SKILL.md lines=53:73
@source bw-err title="해결 지침을 담은 인라인 에러" path=design/jakubkrehel/better-writing/SKILL.md lines=75:85
@source bw-undo title="실행 취소(undo) 우선과 파괴적 작업 확인" path=design/jakubkrehel/better-writing/SKILL.md lines=87:98
@source bw-empty title="다음 행동을 제시하는 빈 상태와 자리표시자 예시" path=design/jakubkrehel/better-writing/SKILL.md lines=100:120
@source bw-finish title="마감 전 11개 탐지·수정표" path=design/jakubkrehel/better-writing/SKILL.md lines=122:136
@source bw-report title="검증 기준과 보고서 참조" path=design/jakubkrehel/better-writing/SKILL.md lines=138:142
@source bw-pat title="파괴적 흐름·상태 문구·복수형·Intl 포맷 템플릿" path=design/jakubkrehel/better-writing/patterns.md lines=5:56
@source bw-repref title="단독 리뷰 심각도와 형식" path=design/jakubkrehel/better-writing/reporting.md lines=1:14
@source bi-order title="better-interface의 도메인 스킬 순차 호출" path=design/jakubkrehel/better-interface/SKILL.md lines=42:58
@source ir-sig title="interface-review의 문구 제거 신호" path=design/jakubkrehel/interface-review/removed-signals.md lines=17:17
@source ba-own title="better-accessibility의 도메인 경계" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source bt-own title="better-typography의 문구 소유권" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source bc-own title="better-colors의 도메인 경계" path=design/jakubkrehel/better-colors/SKILL.md lines=12:12
@source bc-dest title="better-colors의 파괴적 작업 구분 색상" path=design/jakubkrehel/better-colors/SKILL.md lines=71:71

## 어떻게 동작하나 {#flow span=12}

원칙형이다. 시작 전 기존 문자열과 용어를 먼저 조사하고, 이후 12개 인터페이스 카피 규칙과 마감 점검표를 순서 없이 적용한다.[](source:bw-inv)[](source:bw-finish)

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 사전 문자열·용어 조사 | `SKILL.md` | 쓰기나 리뷰 전 번역 호출(`t(`, `i18n.`, `<FormattedMessage`, `$t(`), locale 파일, CMS·API 출처를 찾아 주변 문구를 읽는다. 객체별 명사와 동작별 동사, 요소별 대소문자와 어조 가이드를 정리한 뒤 새 문구에도 같은 목록만 쓴다. | 같은 대상을 `"Archive"`와 `"Move to storage"`로 섞어 쓴 경우만 지적[](source:bw-inv)[](source:bw-voice) |
| 어조·호칭·평이한 단어 | `SKILL.md` | 흐름 전체에서 하나의 어휘와 대소문자 정책(기본 sentence case)을 지키며 상황 무게에 따라 어조를 조절한다. 안내 문구는 `you`로 직접 부르고, 에러에서 `we`나 `Please`, `successfully`, 번역 안 되는 관용구와 불필요한 성별 표현을 뺀다. | `"My account"` 옆 `"Your settings"` 혼용 금지, 클릭·탭은 장치에 맞춤[](source:bw-voice)[](source:bw-ctrl) |
| 문장 단위·복수형·지역화 | `SKILL.md`, `patterns.md` | 변수 앞뒤로 문자열 조각을 이어 붙이거나 `=== 1 ? "" : "s"`로 분기하지 않고, ICU MessageFormat이나 `Intl.PluralRules`로 완전한 문장을 쓴다. 숫자·통화·단위·날짜·상대 시간·목록은 `Intl` API 함수로 포맷한다. | `{count, plural, =0 {No new messages} one {# new message} other {# new messages}}`[](source:bw-whole)[](source:bw-pat) |
| 버튼·링크·설정·상태 문구 | `SKILL.md`, `patterns.md` | 버튼과 아이콘 버튼의 접근성 이름은 동사로 시작하는 버튼 규칙(`Delete project`)을 따른다(`OK!`, `Trash icon` 금지). 링크는 목적지를 밝히고(`Click here` 금지), 토글은 `ON` 상태를 적으며, 진행·완료·실패·불가·부분 완료 문구 시제를 맞춘다. | 진행 `"Saving changes…"` ↔ 완료 `"Changes saved"`, `Learn more` 단독 반복 금지[](source:bw-ctrl)[](source:bw-pat) |
| 에러·빈 상태·자리표시자 | `SKILL.md` | 에러는 실패한 필드 옆에 두고 비난이나 `Oops!`, `!` 없이 해결 지침을 적는다. 빈 상태는 용도와 채우는 방법, 다음 행동 버튼 1개를 제시하고 필터 결과 없음에는 검색어와 초기화 출구를 둔다. `placeholder`에는 지시 대신 입력 예시만 넣는다. | `"Invalid date"` 대신 `"Enter a date as DD/MM/YYYY"`, 예시 `name@example.com`[](source:bw-err)[](source:bw-empty) |
| undo 우선과 파괴적 작업 확인 | `SKILL.md`, `patterns.md` | 되돌릴 수 있고 자주 하는 작업은 즉시 실행하고 토스트로 `Undo`를 제공한다(유지 시간은 `better-accessibility` 소유). 되돌릴 수 없거나 타인·다수 항목에 영향을 주면 제목에 행동·대상을, 본문에 손실 내용을 적고 버튼은 동사+목적어로 둔다. | 제목 `"Delete 'Q3 report'?"`, 버튼 `Delete report`·`Cancel`(`Yes`/`No` 금지)[](source:bw-undo)[](source:bw-pat) |
| 마감 점검과 보고 | `SKILL.md`, `reporting.md` | `Before you finish` 11개 탐지 패턴과 대조하고 컴포넌트뿐 아니라 locale 파일까지 읽는다(서버·CMS 미확인 문자열은 `Not verified`). 단독 리뷰는 복구 수단 없는 에러와 확인·undo 없는 파괴적 작업을 `HIGH`로 분류해 `Block`/`Approve` 판정 결과를 낸다. | 복구 안내 없는 에러 발견 시 `HIGH` 및 `Block` 판정[](source:bw-finish)[](source:bw-report)[](source:bw-repref) |

기존 문자열을 먼저 조사하는 이유는 제품 어휘 일관성을 지키고 취향 교체를 막기 위해서다.[](source:bw-intro)[](source:bw-inv) 조각 결합 대신 완전한 문장을 요구하는 이유는 언어마다 어순과 plural 범주가 달라 번역이 깨지기 때문이다.[](source:bw-whole)[](source:bw-pat) 예컨대 `"Are you sure?"`와 `Yes`/`No` 대신 `"Delete 'Q3 report'?"`와 `Delete report`/`Cancel`로 고친다.[](source:bw-undo)[](source:bw-finish)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 `description`을 보고 켠다. 호출 제한 필드는 frontmatter와 `agents/openai.yaml`에 없다.[](source:bw-fm)[](source:bw-oa) |
| 성격 | 인터페이스 카피와 어조·번역 규칙을 작성·검증하는 도메인 스킬(`better-interface`의 3번째 리뷰 단계). |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `better-interface` {#rel-r48} | **이 스킬** | 호출 | 의무: `better-interface`가 3번 순서로 이 스킬을 로드해 리뷰하고, 단독 심각도·형식은 `better-interface` 기준으로 대체해 통합한다(사용자 개입 없음).[](source:bi-order) |
| `interface-review` {#rel-r60} | **이 스킬** | 호출 | diff `-` 쪽에서 사용자 노출 문자열이 삭제되거나 짧아진 제거 신호가 나오면 이 스킬로 확인을 위임한다(사용자 개입 없음).[](source:ir-sig) |
| `better-accessibility` {#rel-r65} | **이 스킬** | 참고 | 레이블·에러·이미지 `alt` 텍스트 문구 소유권이 이 스킬에 있음을 참조한다(사용자 개입 없음).[](source:ba-own) |
| `better-typography` {#rel-r69} | **이 스킬** | 참고 | 텍스트 렌더링이 아니라 카피 문구 자체는 이 스킬 소유임을 참조한다(사용자 개입 없음).[](source:bt-own) |
| **이 스킬** {#rel-r73} | `better-accessibility` | 참고 | 아이콘 버튼의 접근성 속성, `placeholder` 외 가시적 레이블 필요성, `Undo` 토스트 유지 시간, 에러 마크업과 알림 소유권을 `better-accessibility`로 참조한다(사용자 개입 없음).[](source:bw-intro)[](source:bw-ctrl)[](source:bw-empty)[](source:bw-pat) |
| **이 스킬** {#rel-r74} | `better-colors` | 참고 | 파괴적 확인 버튼의 구분 색상은 `better-colors` 소유임을 참조한다(사용자 개입 없음).[](source:bw-undo)[](source:bc-own)[](source:bc-dest) |

@architecture id=relation-map title="better-writing과 이어지는 스킬"
| bi | better-interface | backend |
| ir | interface-review | backend |
| bt | better-typography | backend |
| self | better-writing(이 스킬) | backend |
| ba | better-accessibility | backend |
| bc | better-colors | backend |
| bi > self | 호출 | |
| ir > self | 호출 | |
| bt > self | 참고 | dashed |
| ba > self | 참고 | dashed |
| self > ba | 참고 | |
| self > bc | 참고 | |

@code source=bw-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 문자열 사전 조사, 12개 카피 원칙, 11개 마감 점검표, 보고 지시 본문 | 스킬이 켜질 때 읽는다 | 사전 문자열·용어 조사; 어조·호칭·평이한 단어; 문장 단위·복수형·지역화; 버튼·링크·설정·상태 문구; 에러·빈 상태·자리표시자; undo 우선과 파괴적 작업 확인; 마감 점검과 보고 |
| `patterns.md` | 파괴적 흐름 5종, 상태 문구 5종, ICU MessageFormat 복수형, `Intl` 지역화 표 | 파괴적 대화상자·상태 문구·복수형·포맷 작성 시 읽는다 | 문장 단위·복수형·지역화; 버튼·링크·설정·상태 문구; undo 우선과 파괴적 작업 확인 |
| `reporting.md` | 단독 리뷰의 `HIGH`/`MEDIUM`/`LOW` 기준, 표 형식, `Block`/`Approve` 규칙 | `better-interface` 없이 단독 리뷰를 보고할 때 읽는다 | 마감 점검과 보고 |
| `agents/openai.yaml` | 호스트 UI 표시 이름(`Better Writing`)과 짧은 설명 | 호스트가 UI 표시 정보를 읽을 때 사용한다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 브랜드 어조와 단순 문체 차이 | 일관성 결함, 모호함, 번역 위험, 상황과 맞지 않는 어조가 아니라면 취향상 표현 교체를 지적으로 올리지 않는다 | [](source:bw-intro) |
| 같은 객체·동작의 동의어 혼용 | 사전 조사에서 정리한 명사·동사 목록만 쓰며, 같은 대상을 두 단어로 부르면 지적으로 보고한다 | [](source:bw-inv) |
| 문자열 조각 결합(`" + n + "`), 삼항 복수형(`=== 1`), `Please`·`successfully`·`Click here`·`Are you sure`·`OK`/`Yes`/`No` | 금지 패턴. 각각 완전한 메시지(ICU/`Intl`), 삭제, 목적지 명시, 행동+대상 명시, 동사+목적어 버튼으로 바꾼다 | [](source:bw-whole) [](source:bw-finish) |
| 빈 상태에 상시 정보 배치 | 금지. 콘텐츠가 들어오면 사라지므로 상시 정보를 두지 않는다 | [](source:bw-empty) |
| 계정·workspace·저장소 같은 중대 파괴 작업 | 확인 대화상자에서 객체 이름을 직접 입력할 때까지 확인 버튼을 비활성화한다 | [](source:bw-undo) [](source:bw-pat) |
| 단독 리뷰에서 복구 방법 없는 에러 또는 확인·undo 없는 파괴적 작업 | 항상 `HIGH`로 판정하고 `Block`으로 끝낸다 | [](source:bw-repref) |
| 서버·CMS 출처 미확인 문자열과 미검사 영역 | `Approve` 금지. `Not verified`로 보고한다 | [](source:bw-report) [](source:bw-repref) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 상황별 상태·파괴적 흐름 템플릿 — undo 우선과 파괴적 작업 확인 · 5가지 파괴적 흐름 문구와 진행·완료·실패·불가·부분 완료 병렬 템플릿을 담았다.
- ICU MessageFormat과 `Intl` 지역화 표 — 문장 단위·복수형·지역화 · `Intl.PluralRules`, 통화·단위·날짜·상대 시간·목록 포맷 호출 예시를 모았다.

읽은 원본: 텍스트 파일 4개. 제외: 없음.
