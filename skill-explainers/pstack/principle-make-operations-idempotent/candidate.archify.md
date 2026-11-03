# principle-make-operations-idempotent 스킬은 에이전트를 어떻게 바꾸나 {#idempotent-skill}

`principle-make-operations-idempotent`를 읽은 에이전트는 상태를 바꾸는 작업마다 두 가지를 묻는다. "두 번 돌면 어떻게 되나?" "직전 실행이 중간에 죽었다면?" 그리고 몇 번 돌든 어디서 시작하든 같은 올바른 상태로 수렴하게 설계한다.[](source:rule)

- 원문의 이유: 명령, 수명 주기 단계, 처리 루프는 충돌, 재시작, 재시도가 흔한 곳에서 돈다.[](source:why)
- 남은 부분 상태가 다음 실행 결과를 바꾸면, 재시작할 때마다 디버깅을 하게 된다.[](source:why)
- 시작할 때 기존 상태를 훑고, 낡은 산출물을 치우고, 살아 있는 세션은 이어받는다.[](source:pattern)
- 어떤 질문의 답이 "남은 상태에 따라 다르다"면 그 작업에는 상태 맞추기(reconciliation) 단계가 필요하다.[](source:verdict)

@answer scope="pstack/principle-make-operations-idempotent · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-make-operations-idempotent/SKILL.md · 1390B · 원칙 본문(frontmatter)" path=pstack/principle-make-operations-idempotent/SKILL.md lines=1:5
@source rule title="pstack/principle-make-operations-idempotent/SKILL.md · 규칙" path=pstack/principle-make-operations-idempotent/SKILL.md lines=9:9
@source why title="pstack/principle-make-operations-idempotent/SKILL.md · 이유" path=pstack/principle-make-operations-idempotent/SKILL.md lines=11:11
@source pattern title="pstack/principle-make-operations-idempotent/SKILL.md · 패턴" path=pstack/principle-make-operations-idempotent/SKILL.md lines=13:17
@source tests title="pstack/principle-make-operations-idempotent/SKILL.md · 판단 질문" path=pstack/principle-make-operations-idempotent/SKILL.md lines=19:22
@source verdict title="pstack/principle-make-operations-idempotent/SKILL.md · 결론 규칙" path=pstack/principle-make-operations-idempotent/SKILL.md lines=24:24
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Architecture 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=60:60
@source runner title="pstack/architect/references/runner-prompt.md · 3087B · 멱등 상태 전이" path=pstack/architect/references/runner-prompt.md lines=17:17

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-make-operations-idempotent`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 어떤 상황에 맞는 원칙인지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-make-operations-idempotent` 입력 |
| `poteto-mode` (Architecture 분류) | 충돌과 재시도 속에서 도는 명령, 수명 주기 단계, 루프를 설계할 때[](source:pm-trigger) |

`poteto-mode`는 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite) 원장 기준으로 이 원칙을 이름으로 부르는 플레이북은 없다.

## 무엇을 강제하나 {#rules}

| 패턴 | 하는 일 | 원문의 강도 |
| --- | --- | --- |
| 수렴하는 시작 | 기존 상태를 훑고, 낡은 산출물을 치우고, 살아 있는 세션을 이어받는다[](source:pattern) | 권고(패턴 예) |
| 내용 기준 정리 | 만든 순서가 아니라 내용이 같은지로 비교한다[](source:pattern) | 권고(패턴 예) |
| 스스로 풀리는 락 | 프로세스 번호(PID)로 낡은 락을 알아낸다[](source:pattern) | 권고(패턴 예) |
| 멱등한 스케줄링 | 실패한 일은 깨끗이 다시 띄우고, 매 주기 뒤 새 입력을 다시 만든다[](source:pattern) | 권고(패턴 예) |

에이전트는 작업마다 아래 세 질문에 답한다.[](source:tests)

@list ordered=true
| 연달아 두 번 돌면 어떻게 되나? |
| 직전 실행이 가능한 모든 지점에서 죽었다면 어떻게 되나? |
| 다시 실행하면 같은 최종 상태로 수렴하나? |

| 답 | 행동 |
| --- | --- |
| 어느 답이든 "남은 상태에 따라 다르다"[](source:verdict) | {bad:상태 맞추기 단계 추가} |
| 세 답 모두 남은 상태와 무관하게 같은 최종 상태 | {good:통과} |

"통과" 행은 결론 규칙을 뒤집어 쓴 것이다(판정).[](source:verdict) 이 원칙을 적용하지 않는 경우는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=idem-position title="make-operations-idempotent 앞뒤"
| pm | poteto-mode | backend |
| me | make-operations-idempotent | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 재시도 설계 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 충돌·재시도 속에서 도는 명령, 수명 주기 단계, 루프 |

이 원칙은 다른 스킬을 가리키지 않는다. 원장에는 없지만 `architect` 러너 프롬프트가 이 원칙을 이름으로 언급한다(rel-id 없음). 해당되면 상태 전이를 멱등하게 만들라고 하고, 같은 두 질문을 던지게 한다.[](source:runner)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-make-operations-idempotent/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 60줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 1곳이다. `poteto-mode/references/bugbot-triage.md`의 "idempotent"는 일반 단어라 언급으로 세지 않았다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
상태 맞추기 단계가 어떤 모양이어야 하는지(시작 시 검사, 별도 명령 등)는 원문에 명시 없음. PID 기반 락 감지가 PID 재사용을 어떻게 다루는지도 원문에 명시 없음.
