# principle-model-the-domain 스킬은 에이전트를 어떻게 바꾸나 {#model-domain-skill}

이 원칙을 적용하면 에이전트는 도메인을 여러 곳에 흩어진 조건문으로 쓰지 않는다. 도메인에 맞는 자료 구조를 먼저 고르고, 그 구조에 규칙을 담는다.[](source:skill-intro)

- 흩어진 boolean 대신 상태 기계, 여러 파일에 퍼진 분기 대신 표나 등록부처럼 구조를 바꿔 끼운다.[](source:skill-structures)
- 구조는 코드를 쓸 때 고른다. 쓸 때 고르면 비용이 작지만, 나중에 되찾으려 하면 리팩터링으로 보여 계속 미뤄지기 때문이다.[](source:skill-why)
- 추상화를 억지로 만들지는 않는다. 모양이 이미 명확하고 지역적이면 평범한 코드를 둔다.[](source:skill-caution)
- `poteto-mode`는 에이전트가 코드를 쓸 때마다 데이터 모양을 먼저 정하고, 그 구조를 이 원칙으로 고르게 한다.[](source:pm-code)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-model-the-domain/SKILL.md · 2082B · frontmatter" path=pstack/principle-model-the-domain/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-model-the-domain/SKILL.md lines=9:9
@source skill-why title="SKILL.md · Why" path=pstack/principle-model-the-domain/SKILL.md lines=11:11
@source skill-structures title="SKILL.md · 고를 구조 목록" path=pstack/principle-model-the-domain/SKILL.md lines=13:22
@source skill-caution title="SKILL.md · 억지 추상화 경계" path=pstack/principle-model-the-domain/SKILL.md lines=24:24
@source skill-sign title="SKILL.md · 건너뛴 신호" path=pstack/principle-model-the-domain/SKILL.md lines=26:26
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-code title="pstack/poteto-mode/SKILL.md · Non-negotiables 코드 항목" path=pstack/poteto-mode/SKILL.md lines=21:21
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Architecture 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=57:57
@source pb-feature title="pstack/poteto-mode/playbooks/feature.md · 4단계" path=pstack/poteto-mode/playbooks/feature.md lines=12:12
@source pb-refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 2단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=8:8
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-model-the-domain`을 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 사용자가 대화에서 원칙 이름을 말해 에이전트의 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-model-the-domain` 입력[](source:help-principles) |
| `poteto-mode` Non-negotiables | 코드를 쓸 때 언제나. 데이터 모양을 먼저 정하고 구조를 이 원칙으로 고른다(의무형)[](source:pm-code) |
| `poteto-mode` 원칙 목록 | Architecture 원칙. 상태 있는 로직, 분기가 많은 코드, 여러 파일에 반복되는 모양 가정[](source:pm-line) |
| `feature` 플레이북 | 4단계. 코드 작성을 서브에이전트에 맡기기 전에 구조를 정할 때[](source:pb-feature) |
| `refactoring` 플레이북 | 2단계. 코드에 빠진 구조를 이름 붙일 때[](source:pb-refactoring) |

`poteto-mode`에서 켜지면 의무가 따라온다. 에이전트는 적용하는 원칙의 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 적은 설명이다. 요청이 그 문장과 같은 말이어야 켜지는 것은 아니다.

## 무엇을 강제하나 {#rules}

원문은 "이런 구조를 쓰라"는 목록을 준다. 목록은 예시이고, 맞는 구조가 없으면 다른 구조를 써도 된다.[](source:skill-structures)

| 이런 코드 대신 | 이런 구조 |
| --- | --- |
| 흩어진 boolean, 단계, 수명 주기 검사 | 상태 기계[](source:skill-structures) |
| 느슨한 매개변수, 반복되는 모양 가정 | 타입이 있는 객체나 모델[](source:skill-structures) |
| 여러 파일에 퍼진 분기 | map, 등록부(registry), 조회 표, 판별 유니언(discriminated union)[](source:skill-structures) |
| 그때그때 하는 상태 변경 | reducer, 명령·이벤트 모델[](source:skill-structures) |
| 불러오기 → 검증 → 변환 → 저장처럼 순서로 나눈 모듈 | 도메인 지식 하나를 중심으로 짠 모듈. 실행 순서는 소유가 아니다[](source:skill-structures) |
| 되풀이되는 동작, 소유, 불변 조건 | 그것을 모으는 작은 모듈 경계[](source:skill-structures) |
| 데이터 접근 패턴이 요구할 때 | 큐, 캐시, 색인, 그래프·트리, 정규화된 컬렉션[](source:skill-structures) |
| 맞는 것이 없을 때 | 코드가 절대 허용하면 안 되는 것과 데이터를 읽는 방식을 정리한다. 그것을 정확히 담는 구조를 찾는다[](source:skill-structures) |

| 경계 규칙 | 원문의 강도 |
| --- | --- |
| 추상화를 억지로 만들지 않는다[](source:skill-caution) | 금지 |
| 지금 모양이 명확하고, 지역적이고, 커질 것 같지 않으면 평범한 코드를 고른다[](source:skill-caution) | 권고 |
| 분기, 중복 규칙, 잘못된 상태, 수명 주기 위험을 없애지 못하고 간접층만 더하는 추상화는 의심한다[](source:skill-caution) | 권고 |

이 원칙을 건너뛰었다는 신호도 원문에 있다.[](source:skill-sign)

- 새 기능이 기존 if/else 사슬에 분기를 하나 더 붙인다.
- 첫 `boolean`과 맞춰 둬야 하는 두 번째 `boolean`이 생긴다.
- 단계 이름이 붙은 모듈들이 같은 도메인 규칙을 단계마다 되풀이한다(시간순 분해).

원문에는 적용 전후 코드 예시가 없다.

## 흐름 속 위치 {#position}

@workflow id=domain-position title="도메인 모델 원칙의 앞뒤"
| pm | poteto-mode | backend |
| feature | feature | backend |
| refac | refactoring | backend |
| this | 도메인 모델 | backend |
| back | 구조 결정 | frontend |
| pm > this | 코드 작성 | |
| feature > this | 4단계 | |
| refac > this | 2단계 | |
| this > back | 구조 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode` Non-negotiables | 데이터 모양과 그 구조 | 모든 코드 작성. 의무형[](source:pm-code) | r13 |
| `poteto-mode` 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 상태 있는 로직, 분기가 많거나 모양 가정이 반복될 때[](source:pm-line) | r12 |
| `feature` 플레이북 4단계 | 위임 범위에 넣을 구조 | 위임하는 에이전트가, 서브에이전트가 로직을 쓰기 전에 구조를 고른다[](source:pb-feature) | 원장 플레이북 표 |
| `refactoring` 플레이북 2단계 | 빠진 구조의 이름 | 평범한 코드는 둔다. 재구성은 분기나 잘못된 상태를 지워야 한다[](source:pb-refactoring) | 원장 플레이북 표 |

이 원칙은 다른 스킬을 부르지 않는다. 원칙끼리의 참고 관계(r100~r107)에도 나오지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(2082B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `playbooks/feature.md`, `playbooks/refactoring.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지에 적은 동작은 모두 SKILL.md가 지시하는 동작이며, 실행해서 확인한 동작이 아니다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"분기가 많다"나 "커질 것 같지 않다"의 수치 기준은 원문에 명시 없음.
`poteto-mode`는 모든 코드에 이 원칙을 요구하지만, 원칙 본문은 평범한 코드를 남기라고도 한다. 판정: 두 지시는 충돌하지 않는다. 구조를 따져 본 결과로 평범한 코드를 고를 수 있다.[](source:pm-code)[](source:skill-caution)
