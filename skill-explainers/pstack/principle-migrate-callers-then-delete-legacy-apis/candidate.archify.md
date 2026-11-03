# principle-migrate-callers-then-delete-legacy-apis 스킬은 에이전트를 어떻게 바꾸나 {#migrate-callers-skill}

이 원칙을 적용하면 에이전트는 새 내부 API를 들이면서 옛 API를 남겨 두지 않는다. 호출자를 모두 옮기고, 같은 리팩터링 차례(wave)에서 옛 API를 지운다.[](source:skill-rule)

- 호환 계층을 기본 구조로 두지 않는다. 임시 어댑터는 예외로만 쓰고 기한을 정한다.[](source:skill-rule)
- 테스트는 새 계약을 확인하게 고친다. 옛 구현 세부만 지키던 테스트는 지운다.[](source:skill-rule)
- 원문은 적용 조건 셋을 든다. 그중 첫째는 외부 사용자가 하위 호환에 기대지 않는 경우다.[](source:skill-when)
- `poteto-mode`와 `refactoring` 플레이북이 API 모양을 바꿀 때 이 원칙을 꺼낸다.[](source:pm-line)[](source:pb-refactoring)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-migrate-callers-then-delete-legacy-apis/SKILL.md · 1146B · frontmatter" path=pstack/principle-migrate-callers-then-delete-legacy-apis/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-migrate-callers-then-delete-legacy-apis/SKILL.md lines=9:9
@source skill-rule title="SKILL.md · Rule" path=pstack/principle-migrate-callers-then-delete-legacy-apis/SKILL.md lines=11:15
@source skill-when title="SKILL.md · When this applies" path=pstack/principle-migrate-callers-then-delete-legacy-apis/SKILL.md lines=17:20
@source skill-why title="SKILL.md · 마지막 문단(이유)" path=pstack/principle-migrate-callers-then-delete-legacy-apis/SKILL.md lines=22:22
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Architecture 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=61:61
@source pb-refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 5단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=11:11
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120
@source rubric title="pstack/interrogate/references/rubric.md · Legacy dual-paths 항목" path=pstack/interrogate/references/rubric.md lines=41:41

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-migrate-callers-then-delete-legacy-apis`를 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 원칙 이름을 말로 꺼내 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-migrate-callers-then-delete-legacy-apis` 입력[](source:help-principles) |
| `poteto-mode` | Architecture 원칙. 옛 호출자가 남은 채 새 내부 API를 들일 때[](source:pm-line) |
| `refactoring` 플레이북 | 5단계. API 모양을 바꿀 때[](source:pb-refactoring) |

`poteto-mode`에서 켜지면 의무가 따라온다. 적용하는 원칙은 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝힌다. 인용은 이번 세션에 읽은 원칙만 한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 알려 주는 설명이다. 그 문장과 같은 말이 나와야 켜지는 장치는 아니다.

## 무엇을 강제하나 {#rules}

새 API가 맞는 설계라고 정했다면, 호출자 이전과 옛 API 삭제를 한 차례에 끝낸다.[](source:skill-intro)

| 규칙 | 원문의 강도 |
| --- | --- |
| 내부 호출자가 남아 있다는 이유만으로 옛 API 경로를 지키지 않는다[](source:skill-rule) | 금지 |
| 호출자를 모두 찾아 옮기고, 옛 API를 바로 지운다[](source:skill-rule) | 의무 |
| 임시 어댑터는 예외로만 쓰고 기한을 둔다. 기본 구조로 삼지 않는다[](source:skill-rule) | 의무 |
| 테스트는 새 계약을 확인하게 고친다. 리팩터링 전 구현 세부만 지키던 테스트는 지운다[](source:skill-rule) | 의무 |

| 적용 조건(원문 목록) | 비고 |
| --- | --- |
| 외부 사용자가 하위 호환에 기대지 않는다[](source:skill-when) | 외부 사용자가 있으면 이 원칙의 범위가 아니다(판정) |
| 프로젝트가 조율된 호환성 깨짐을 감당할 수 있다[](source:skill-when) | - |
| 새 API가 단순화나 리팩터링 작업의 일부다[](source:skill-when) | - |

원문이 드는 이유는 셋이다. 옛 API와 새 API를 함께 두면 경로가 둘로 갈라져 복잡해진다. 정리가 늦어진다. 코드베이스가 덧붙이기만 하는 곳처럼 된다.[](source:skill-why)

원문에는 적용 전후 코드 예시가 없다.

## 흐름 속 위치 {#position}

@workflow id=migrate-position title="호출자 이전 원칙의 앞뒤"
| pm | poteto-mode | backend |
| pb | refactoring | backend |
| this | 호출자 이전 | backend |
| back | 답변에 인용 | frontend |
| pm > this | 새 API | |
| pb > this | 5단계 | |
| this > back | 선택 근거 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 옛 호출자가 남은 채 새 내부 API 도입[](source:pm-line) | r12 |
| `refactoring` 플레이북 5단계 | 모든 호출자 이전, 같은 차례의 옛 API 삭제 | API 모양 변경. 호환 심(shim)이나 옛·새 병행 경로 금지[](source:pb-refactoring) | 원장 플레이북 표 |
| `interrogate` 리뷰 기준표 | - | 이름 없이 같은 규칙을 리뷰 항목으로 둔다[](source:rubric) | 원장에 없음(추론) |

이 원칙은 다른 스킬을 부르지 않는다. 원칙끼리의 참고 관계(r100~r107)에도 나오지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(1146B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `playbooks/refactoring.md`, `poteto-help/SKILL.md`, `interrogate/references/rubric.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
적용 조건 셋이 모두 맞아야 하는지, 하나만 맞아도 되는지는 원문에 명시 없음.
임시 어댑터의 기한을 얼마로 잡는지는 원문에 명시 없음.
"같은 차례"가 PR 하나인지, 리팩터링 작업 전체인지는 원문에 명시 없음.
