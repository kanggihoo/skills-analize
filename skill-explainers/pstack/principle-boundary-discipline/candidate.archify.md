# principle-boundary-discipline 스킬은 에이전트를 어떻게 바꾸나 {#boundary-discipline-skill}

`principle-boundary-discipline`을 읽은 에이전트는 검증, 타입 좁히기, 오류 처리를 시스템 경계에만 둔다. 경계 안쪽 코드는 조건 없이 믿고, 비즈니스 로직은 순수 함수로 뺀다.[](source:rule)

- 경계는 CLI 인자, 설정 파일, 외부 API, 네트워크 프로토콜이다. 에이전트는 경계에서 데이터를 검증하고, 오류를 돌려주고, 방어적으로 다룬다.[](source:p-pattern)
- 경계 안쪽에서는 타입이 있는 데이터를 쓰고, 오류는 전파만 한다. 데이터를 다시 검증하지 않는다.[](source:p-pattern)
- 원문은 이유를 두 가지로 든다. 흩어진 검증은 시끄럽고 중복되며 안전하다는 착각을 준다. 로직을 프레임워크 연결부에서 떼어야 프레임워크 없이 테스트할 수 있다.[](source:why)
- 판단 질문은 둘이다. "이 데이터가 지금 경계를 넘는가?" "셸이 부르기만 하는 순수 함수로 만들 수 있는가?" 여기서 셸은 순수 함수를 부르는 쪽이고, 원문은 셸을 얇고 기계적으로 두라고 한다.[](source:tests)[](source:rule)

@answer scope="pstack/principle-boundary-discipline · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-boundary-discipline/SKILL.md · 1883B · 원칙 본문(frontmatter)" path=pstack/principle-boundary-discipline/SKILL.md lines=1:5
@source rule title="pstack/principle-boundary-discipline/SKILL.md · 규칙" path=pstack/principle-boundary-discipline/SKILL.md lines=9:9
@source why title="pstack/principle-boundary-discipline/SKILL.md · 이유" path=pstack/principle-boundary-discipline/SKILL.md lines=11:11
@source p-pattern title="pstack/principle-boundary-discipline/SKILL.md · 패턴" path=pstack/principle-boundary-discipline/SKILL.md lines=13:16
@source app-valid title="pstack/principle-boundary-discipline/SKILL.md · 적용: 검증과 오류 처리" path=pstack/principle-boundary-discipline/SKILL.md lines=20:24
@source app-org title="pstack/principle-boundary-discipline/SKILL.md · 적용: 코드 구성" path=pstack/principle-boundary-discipline/SKILL.md lines=26:30
@source tests title="pstack/principle-boundary-discipline/SKILL.md · 판단 질문" path=pstack/principle-boundary-discipline/SKILL.md lines=32:34
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Architecture 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=58:58
@source ts-skill title="pstack/typescript-best-practices/SKILL.md · 2684B · 경계 검증 줄" path=pstack/typescript-best-practices/SKILL.md lines=25:25
@source ts-pat-head title="pstack/typescript-best-practices/references/patterns.md · 9214B · 도입부" path=pstack/typescript-best-practices/references/patterns.md lines=3:3
@source ts-pat title="pstack/typescript-best-practices/references/patterns.md · 경계 검증 예" path=pstack/typescript-best-practices/references/patterns.md lines=272:272
@source runner title="pstack/architect/references/runner-prompt.md · 3087B · 러너 설계 기준" path=pstack/architect/references/runner-prompt.md lines=15:15
@source tsd title="pstack/principle-type-system-discipline/SKILL.md · 4922B · 외부 데이터 목록" path=pstack/principle-type-system-discipline/SKILL.md lines=18:18
@source rubric title="pstack/interrogate/references/rubric.md · 5025B · 리뷰 기준 항목" path=pstack/interrogate/references/rubric.md lines=36:36

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-boundary-discipline`을 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-boundary-discipline` 입력 |
| `poteto-mode` (Architecture 분류) | 검증, 오류 처리, 프레임워크 어댑터를 연결할 때[](source:pm-trigger) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite) 원장에는 이 원칙을 이름으로 부르는 플레이북이 없다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 경계에서 검증하고, 오류를 돌려주고, 방어적으로 다룬다[](source:p-pattern) | 의무 |
| 안쪽에서는 타입을 믿고 다시 검증하지 않는다[](source:p-pattern) | 의무 |
| 경계 밖으로는 도메인 개념을 내보낸다. 경계의 내부 표현은 내보내지 않는다[](source:p-pattern) | 의무 |
| 범용 메커니즘은 안쪽에, 특수 목적 정책은 가장자리에 둔다[](source:p-pattern) | 의무 |
| 설정은 비즈니스 로직 안이 아니라 파싱할 때 검증한다[](source:app-valid) | 적용 예 |
| 원시 데이터는 경계에서 도메인 타입으로 파싱한다[](source:app-valid) | 적용 예 |
| 전송·저장·프레임워크·와이어 타입을 공개 표면으로 다시 내보내지 않는다[](source:app-valid) | 적용 예(금지형) |
| 경계가 이미 검증했으면 호출 사슬 깊은 곳에 중복 nil 검사를 두지 않는다[](source:app-valid) | 적용 예(금지형) |
| 비즈니스 로직은 프레임워크 의존이 없는 순수 함수로 둔다[](source:app-org) | 적용 예 |
| 파싱, 프롬프트 구성, 점수 매기기는 상태를 받아 결과를 내는 순수 변환으로 만든다[](source:app-org) | 적용 예 |

| 판단 질문 | 답 | 행동 |
| --- | --- | --- |
| 이 데이터가 지금 시스템 경계를 넘는가?[](source:tests) | 아니오 | {bad:검증은 중복} |
| 셸이 부르기만 하는 순수 함수가 될 수 있는가?[](source:tests) | 예 | {good:함수로 뺀다} |

이 원칙을 적용하지 않는 경우는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=boundary-position title="boundary-discipline 앞뒤"
| pm | poteto-mode | backend |
| me | boundary-discipline | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 검증 연결 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 검증, 오류 처리, 프레임워크 어댑터 연결 |

이 원칙은 다른 스킬을 가리키지 않는다. 원장에는 없지만 다른 스킬이 이 원칙을 이름으로 언급하는 곳이 있다(rel-id 없음).

- `typescript-best-practices`는 경계 검증 규칙에서 이 원칙을 보라고 한다.[](source:ts-skill)[](source:ts-pat-head)[](source:ts-pat)
- `architect`의 runner 프롬프트는 "경계에서 검증하고 안쪽은 타입을 믿는다"를 이 원칙에 따라 요구한다.[](source:runner)
- `interrogate`의 리뷰 기준에는 같은 이름의 항목이 있다. 원칙 스킬을 가리킨다는 표현은 없다.[](source:rubric)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-boundary-discipline/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 58줄과 위 언급 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 찾은 언급은 4개 파일 5곳이며 위 목록에 있다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원문이 꼽은 경계는 CLI 인자, 설정 파일, 외부 API, 네트워크 프로토콜이다. 데이터베이스 행이나 환경 변수가 경계인지는 이 원칙에 명시 없음. `principle-type-system-discipline`은 데이터베이스 행과 환경 변수를 둘 다 파싱이 필요한 외부 데이터로 꼽는다. 그 원칙의 해당 줄만 확인했다.[](source:tsd)
