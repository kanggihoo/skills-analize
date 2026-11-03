# principle-minimize-reader-load 스킬은 에이전트를 어떻게 바꾸나 {#reader-load-skill}

이 원칙을 적용하면 에이전트는 코드의 좋고 나쁨을 독자가 들이는 수고로 잰다. 따라갈 계층 수와 머리에 들고 있어야 할 상태, 이 두 축을 줄이는 쪽으로 코드를 고친다.[](source:skill-axes)

- 한 번만 불리는 래퍼, 두 번째 구현이 없는 어댑터, 통과만 시키는 계층은 접어서 인라인으로 만든다.[](source:skill-pattern)
- 상태 범위를 줄인다. 전역보다 모듈 상태, 모듈 상태보다 필드, 필드보다 지역 변수, 지역 변수보다 순수 함수를 고른다.[](source:skill-pattern)
- 통과 기준은 30초다. 처음 보는 독자가 "X는 어디서 오나", "무엇이 X를 바꾸나"에 30초 안에 답해야 한다.[](source:skill-test)
- `refactoring` 플레이북은 이 원칙을 성공 기준으로 쓴다. 독자 부담이 줄지 않은 변경은 되돌린다.[](source:pb-refactoring)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-minimize-reader-load/SKILL.md · 2095B · frontmatter" path=pstack/principle-minimize-reader-load/SKILL.md lines=1:5
@source skill-axes title="SKILL.md · 두 축" path=pstack/principle-minimize-reader-load/SKILL.md lines=9:11
@source skill-why title="SKILL.md · Why" path=pstack/principle-minimize-reader-load/SKILL.md lines=13:13
@source skill-pattern title="SKILL.md · The pattern" path=pstack/principle-minimize-reader-load/SKILL.md lines=15:21
@source skill-test title="SKILL.md · The test" path=pstack/principle-minimize-reader-load/SKILL.md lines=23:23
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Core 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=49:49
@source pb-refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 7단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=13:13
@source runner title="pstack/architect/references/runner-prompt.md · 짧은 호출 사슬" path=pstack/architect/references/runner-prompt.md lines=18:18
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-minimize-reader-load`를 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 원칙 이름을 말로 꺼내 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-minimize-reader-load` 입력[](source:help-principles) |
| `poteto-mode` | Core 원칙. 따라가기 어려운 코드를 리뷰하거나 다듬을 때[](source:pm-line) |
| `refactoring` 플레이북 | 7단계. 바꿀 가치가 있는지 확인할 때[](source:pb-refactoring) |
| `architect` 러너 프롬프트 | 흐름을 따라가는 데 파일이 셋을 넘을 때[](source:runner) |

`poteto-mode`에서 켜지면 의무가 따라온다. 적용하는 원칙은 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝힌다. 인용은 이번 세션에 읽은 원칙만 한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 알려 주는 설명이다. 그 문장과 같은 말이 나와야 켜지는 장치는 아니다.

## 무엇을 강제하나 {#rules}

| 축 | 독자가 치르는 비용 |
| --- | --- |
| 따라갈 계층 | 질문과 답 사이에 놓인 간접 단계 수[](source:skill-axes) |
| 들고 있을 상태 | 머리에 담아 둬야 하는 숨은 상태, 바뀌는 상태의 양[](source:skill-axes) |

두 축은 서로 독립이다. 원문은 전역 변수 50개가 있는 평평한 파일이 6층짜리 어댑터 더미만큼 어려울 수 있다고 예를 든다.[](source:skill-why) 코드 줄 수, 순환 복잡도, "클린 아키텍처"는 대리 지표일 뿐이라고 본다.

| 규칙 | 원문의 강도 |
| --- | --- |
| 얻는 것보다 비용이 큰 계층은 접는다. 호출자가 하나인 래퍼, 두 번째 구현이 없는 어댑터, 끝내 필요 없던 추측성 간접층[](source:skill-pattern) | 의무 |
| 이웃한 계층은 추상화 수준을 바꿔야 한다. 같은 메서드와 인자를 되풀이하는 통과 계층은 접는다[](source:skill-pattern) | 의무 |
| 인터페이스는 압축을 해야 한다. 넓은데 숨기는 것이 적은 경계보다 의미 있는 결정을 숨기는 경계를 고른다[](source:skill-pattern) | 권고 |
| 상태 범위를 줄인다. 반환이 변경보다, 지역 변수가 필드보다, 필드가 모듈 상태보다, 모듈 상태가 전역보다 낫다. 동기화하지 말고 파생한다[](source:skill-pattern) | 권고 |
| 불변 조건은 소비자마다 쓰지 않고 경계에서 한 번 이름 붙인다[](source:skill-pattern) | 의무 |
| 계층이나 상태를 더하기 전에, 다른 곳의 독자 부담을 그만큼 이상 줄이는지 묻는다[](source:skill-pattern) | 의무 |

@facts
| 통과 기준 | 새 독자가 "X는 어디서 오나", "무엇이 X를 바꾸나"에 30초 안에 답한다 |
| 못 넘으면 | 계층을 줄이거나 상태를 줄인다 |

원문에는 적용 전후 코드 예시가 없다.

## 흐름 속 위치 {#position}

@workflow id=reader-position title="독자 부담 원칙의 앞뒤"
| pm | poteto-mode | backend |
| pb | refactoring | backend |
| runner | architect 러너 | backend |
| this | 독자 부담 | backend |
| back | 답변에 인용 | frontend |
| gcw | 컨텍스트 원칙 | backend |
| pm > this | 리뷰 | |
| pb > this | 7단계 | |
| runner > this | 파일 3개 초과 | |
| this > back | 선택 근거 | emphasis |
| this > gcw | 대응 | dashed |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 따라가기 어려운 코드의 리뷰나 정리[](source:pm-line) | r12 |
| `refactoring` 플레이북 7단계 | 유지 또는 되돌리기 판단 | 성공 기준은 줄어든 독자 부담. 줄지 않으면 변경을 되돌린다[](source:pb-refactoring) | 원장 플레이북 표 |
| `architect` 러너 프롬프트 | 평평해진 구조 | 흐름 추적에 파일이 셋을 넘으면 계층을 줄인다. `principle-laziness-protocol`과 함께 든다[](source:runner) | 원장에 없음 |
| - | `principle-guard-the-context-window` 참고 | 이 원칙은 그 원칙의 사람 독자판이다. 독자의 작업 기억도 유한하다[](source:skill-why) | r107 |

이 원칙은 다른 스킬을 실행하지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(2095B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `playbooks/refactoring.md`, `architect/references/runner-prompt.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
30초 기준을 누가 어떻게 재는지는 원문에 명시 없음. 판정: 에이전트가 스스로 가늠하는 기준으로 읽힌다.[](source:skill-test)
`architect` 러너 프롬프트의 "파일 셋 초과" 기준은 이 원칙 본문에는 없다. 두 기준의 관계는 원문에 명시 없음.
