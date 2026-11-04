# principle-redesign-from-first-principles 스킬은 에이전트를 어떻게 바꾸나 {#redesign-skill}

이 원칙을 적용하면 에이전트는 새 요구를 기존 설계에 덧대지 않는다. 그 요구가 처음부터 있었던 것처럼 설계를 다시 짠다.[](source:skill-intro)

- 영향받는 파일을 모두 읽고 지금 설계를 이해한 뒤 시작한다.[](source:skill-steps)
- "이 요구를 안고 처음부터 쓴다면 무엇을 만들까?"를 묻는다.[](source:skill-steps)
- 바뀐 내용을 타입, 문서, 예시, 근거 절까지 모든 참조에 퍼뜨린다.[](source:skill-steps)
- 재설계는 통째로 생각하되, 전달은 조금씩 한다.[](source:skill-steps)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-redesign-from-first-principles/SKILL.md · 844B · frontmatter" path=pstack/principle-redesign-from-first-principles/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-redesign-from-first-principles/SKILL.md lines=9:9
@source skill-steps title="SKILL.md · 규칙 목록" path=pstack/principle-redesign-from-first-principles/SKILL.md lines=11:14
@source skill-close title="SKILL.md · 마지막 문장" path=pstack/principle-redesign-from-first-principles/SKILL.md lines=16:16
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Core 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=46:46
@source pb-refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 3단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=9:9
@source architect-e title="pstack/architect/SKILL.md · Phase E 첫 문단" path=pstack/architect/SKILL.md lines=61:61
@source architect-scrap title="pstack/architect/SKILL.md · 폐기 후 절차" path=pstack/architect/SKILL.md lines=76:79
@source arena title="pstack/arena/SKILL.md · 접붙이기" path=pstack/arena/SKILL.md lines=57:57
@source nocomments title="pstack/no-comments/SKILL.md · 4단계" path=pstack/no-comments/SKILL.md lines=22:22
@source premise title="pstack/principle-attack-the-premise/SKILL.md · 구별 문단" path=pstack/principle-attack-the-premise/SKILL.md lines=23:23
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-redesign-from-first-principles`를 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 사용자가 대화에서 원칙 이름을 말해 에이전트의 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-redesign-from-first-principles` 입력[](source:help-principles) |
| `poteto-mode` | Core 원칙. 새 요구를 기존 설계에 통합할 때[](source:pm-line) |
| `refactoring` 플레이북 | 3단계. 목표 모양에 이름을 붙일 때[](source:pb-refactoring) |
| `architect` | Phase E. 구현 마찰이 계속되어 설계 스케치를 버릴 때[](source:architect-e)[](source:architect-scrap) |
| `arena` | 진 후보의 좋은 부분을 base(기반이 되는 후보)에 graft(진 후보의 장점을 합치기)할 때[](source:arena) |
| `no-comments` | 4단계. 근본 원인 수정의 의도를 잡을 때[](source:nocomments) |

`poteto-mode`에서 켜지면 의무가 따라온다. 에이전트는 적용하는 원칙의 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 적은 설명이다. 요청이 그 문장과 같은 말이어야 켜지는 것은 아니다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 변경을 기존 설계에 덧대지 않는다[](source:skill-intro) | 금지 |
| 영향받는 파일을 모두 읽고 지금 설계를 이해한다[](source:skill-steps) | 의무 |
| "이 요구를 안고 처음부터 쓴다면 무엇을 만들까?"를 묻는다[](source:skill-steps) | 의무 |
| 변경을 모든 참조에 퍼뜨린다. 타입, 문서, 예시, 근거 절이 대상이다[](source:skill-steps) | 의무 |
| 재설계 전체를 생각한 뒤 조금씩 전달한다[](source:skill-steps) | 의무 |

원문은 이 방법을 기존 설계에 변경을 통합하면서 선택의 여지를 지키는 방법이라고 부른다.[](source:skill-close)

`principle-attack-the-premise`와는 다르다. 이 원칙은 새 요구를 중심으로 설계를 다시 짠다. 저쪽은 지금 설계가 가정하는 사실 자체를 의심한다.[](source:premise)

원문에는 적용 전후 예시가 없다.

## 흐름 속 위치 {#position}

@workflow id=redesign-position title="재설계 원칙의 앞뒤"
| pm | poteto-mode | backend |
| refac | refactoring | backend |
| others | architect 등 | backend |
| this | 처음부터 재설계 | backend |
| back | 새 설계 | frontend |
| pm > this | 새 요구 | |
| refac > this | 3단계 | |
| others > this | 스케치 폐기 | |
| this > back | 재설계 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 새 요구를 기존 설계에 통합[](source:pm-line) | r12 |
| `refactoring` 3단계 | 오늘 짓는다면 어떤 모듈 배치·타입·호출 그래프일지 | `principle-foundational-thinking`과 함께 든다[](source:pb-refactoring) | 원장 플레이북 표 |
| `architect` Phase E | 새 스케치 | 구현 마찰을 스케치가 흡수하지 못할 때. 새 제약을 첫날 가정처럼 다룬다[](source:architect-e)[](source:architect-scrap) | 원장에 없음 |
| `arena` graft | 하나의 머릿속 모델로 일관된 결과 | 기계적으로 붙여 넣지 않고 손으로 합친다[](source:arena) | 원장에 없음 |
| `no-comments` 4단계 | - | 이 원칙은 의도만 안내하며 범위 밖 수정을 허락하지 않는다[](source:nocomments) | r67 |
| `principle-attack-the-premise` | - | 두 원칙의 구별[](source:premise) | r103 |

이 원칙은 다른 스킬을 부르지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(844B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `playbooks/refactoring.md`, `architect/SKILL.md`, `arena/SKILL.md`, `no-comments/SKILL.md`, `principle-attack-the-premise/SKILL.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지에 적은 동작은 모두 SKILL.md가 지시하는 동작이며, 실행해서 확인한 동작이 아니다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"조금씩 전달한다"의 단위(commit, PR)는 원문에 명시 없음.
"선택의 여지(option value)"가 무엇을 가리키는지 원문은 더 설명하지 않는다.
