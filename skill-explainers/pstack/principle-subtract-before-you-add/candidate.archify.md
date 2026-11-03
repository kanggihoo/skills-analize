# principle-subtract-before-you-add 스킬은 에이전트를 어떻게 바꾸나 {#subtract-skill}

이 원칙을 적용하면 에이전트는 시스템을 바꿀 때 복잡도를 먼저 덜어 낸다. 죽은 코드, 중복 검증기, 껍데기 참조를 지운 뒤 더 단순해진 바탕 위에 새로 짓는다.[](source:skill-fm)[](source:skill-intro)

- 복잡한 시스템에 더하면 복잡도가 불어난다. 먼저 빼면 핵심 구조가 드러나고 다음 설계가 보통 뻔해진다.[](source:skill-why)
- 기본값은 빼기다. 단순화는 한 번이 아니라 계속하는 투자로 본다.[](source:skill-why)[](source:skill-invest)
- 명세가 요구하지 않는 추측성 검증기, 파서, 가드는 넣지 않는다.[](source:skill-pattern)
- `poteto-mode`는 추가, 리팩터링, 재작성의 순서를 정할 때 이 원칙을 꺼낸다.[](source:pm-line)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-subtract-before-you-add/SKILL.md · 1094B · frontmatter" path=pstack/principle-subtract-before-you-add/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-subtract-before-you-add/SKILL.md lines=9:9
@source skill-why title="SKILL.md · Why" path=pstack/principle-subtract-before-you-add/SKILL.md lines=11:11
@source skill-invest title="SKILL.md · 계속하는 투자" path=pstack/principle-subtract-before-you-add/SKILL.md lines=13:13
@source skill-pattern title="SKILL.md · The pattern" path=pstack/principle-subtract-before-you-add/SKILL.md lines=15:21
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Core 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=48:48
@source pb-refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 4단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=10:10
@source pb-refactoring-8 title="pstack/poteto-mode/playbooks/refactoring.md · 8단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=14:14
@source architect title="pstack/architect/SKILL.md · 폐기 후 3단계" path=pstack/architect/SKILL.md lines=78:78
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-subtract-before-you-add`를 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 원칙 이름을 말로 꺼내 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-subtract-before-you-add` 입력[](source:help-principles) |
| `poteto-mode` | Core 원칙. 추가, 리팩터링, 재작성의 순서를 정할 때[](source:pm-line) |
| `refactoring` 플레이북 | 4단계. 새 모양을 들이기 전[](source:pb-refactoring) |
| `architect` | 설계 스케치를 버린 뒤 다시 그릴 때[](source:architect) |

`poteto-mode`에서 켜지면 의무가 따라온다. 적용하는 원칙은 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝힌다. 인용은 이번 세션에 읽은 원칙만 한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 알려 주는 설명이다. 그 문장과 같은 말이 나와야 켜지는 장치는 아니다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 짓기 전에 빼기를 먼저 배치한다[](source:skill-pattern) | 의무 |
| 다듬기 전에 자른다. 최소한까지 줄인 뒤에 품질에 투자한다[](source:skill-pattern) | 의무 |
| 추측한 예외 상황이 아니라 관찰된 사용에 맞춰 설계한다[](source:skill-pattern) | 의무 |
| 명세가 요구하는 것 이상으로 검증기, 파서, 가드를 넣지 않는다[](source:skill-pattern) | 금지 |
| 프롬프트를 단순하게 한다. 중복 지시와 과한 템플릿을 뺀다[](source:skill-pattern) | 의무 |
| 새 내용이 없는 참조는 껍데기로 남기지 말고 지운다[](source:skill-pattern) | 의무 |
| 손댄 설계를 처음보다 조금 더 단순하게, 같거나 작은 겉면 뒤에서 더 유능하게 남긴다[](source:skill-invest) | 권고(계속하는 투자) |

원문에는 적용 전후 예시가 없다.

## 흐름 속 위치 {#position}

@workflow id=subtract-position title="먼저 빼기 원칙의 앞뒤"
| pm | poteto-mode | backend |
| refac | refactoring | backend |
| architect | architect | backend |
| this | 먼저 빼기 | backend |
| back | 단순한 바탕 | frontend |
| pm > this | 순서 정하기 | |
| refac > this | 4단계 | |
| architect > this | 다시 그리기 | |
| this > back | 빼기 먼저 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 추가·리팩터링·재작성의 순서[](source:pm-line) | r12 |
| `refactoring` 플레이북 4단계 | 죽은 코드·한 호출자 래퍼·중복 검증기·고아 참조 삭제 | 새 모양 도입 전. "도움이 될지도" 하는 추측성 정리는 되돌린다[](source:pb-refactoring) | 원장 플레이북 표 |
| `architect` 폐기 후 3단계 | 더 작은 새 스케치 | 새 스케치는 커지기 전에 옛 스케치보다 작아야 한다[](source:architect) | 원장에 없음 |

이 원칙은 다른 스킬을 부르지 않는다. 원칙끼리의 참고 관계(r100~r107)에도 나오지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(1094B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `playbooks/refactoring.md`, `architect/SKILL.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
빼기와 더하기를 커밋으로 나누라는 지시는 이 원칙 본문에 없다. `refactoring` 플레이북 8단계가 빼기 커밋을 먼저 두라고 할 뿐이다.[](source:pb-refactoring-8)
"관찰된 사용"을 무엇으로 확인하는지는 원문에 명시 없음.
