# principle-exhaust-the-design-space 스킬은 에이전트를 어떻게 바꾸나 {#exhaust-design-space-skill}

`principle-exhaust-the-design-space`를 읽은 에이전트는 선례 없는 상호작용이나 아키텍처 결정을 바로 구현하지 않는다. 서로 경쟁하는 시제품이나 스케치를 2~3개 만들어 나란히 비교한 뒤에야 하나를 고른다.[](source:rule)

- 원문의 이유: 틀린 것을 만드는 비용이 선택지 세 개를 살펴보는 비용보다 크다는 것이다.[](source:intro)
- 에이전트는 첫 모양의 변형 하나를 더 만들어도 두 번째 후보로 세지 않는다.[](source:rule)
- "두 번 설계하라(design it twice)"는 같은 규칙의 다른 이름이다.[](source:rule)
- 패턴이 이미 정해진 기계적 구현, 목표 상태가 분명한 버그 수정과 리팩터링에는 적용하지 않는다.[](source:not)

@answer scope="pstack/principle-exhaust-the-design-space · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-exhaust-the-design-space/SKILL.md · 1152B · 원칙 본문(frontmatter)" path=pstack/principle-exhaust-the-design-space/SKILL.md lines=1:5
@source intro title="pstack/principle-exhaust-the-design-space/SKILL.md · 도입" path=pstack/principle-exhaust-the-design-space/SKILL.md lines=9:9
@source rule title="pstack/principle-exhaust-the-design-space/SKILL.md · 규칙" path=pstack/principle-exhaust-the-design-space/SKILL.md lines=11:11
@source yes title="pstack/principle-exhaust-the-design-space/SKILL.md · 적용하는 경우" path=pstack/principle-exhaust-the-design-space/SKILL.md lines=13:16
@source not title="pstack/principle-exhaust-the-design-space/SKILL.md · 적용하지 않는 경우" path=pstack/principle-exhaust-the-design-space/SKILL.md lines=18:21
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Core 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=52:52
@source pb-proto title="pstack/poteto-mode/playbooks/prototype.md · 2161B · 4단계" path=pstack/poteto-mode/playbooks/prototype.md lines=10:10
@source architect title="pstack/architect/SKILL.md · 5675B · 두 번 설계" path=pstack/architect/SKILL.md lines=35:35

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-exhaust-the-design-space`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-exhaust-the-design-space` 입력 |
| `poteto-mode` (Core 분류) | 선례 없는 상호작용이나 아키텍처 결정이면, 경쟁 시제품을 2~3개 만들어 비교한 뒤 결정한다[](source:pm-trigger) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite) 원장에는 이 원칙을 이름으로 부르는 플레이북이 없다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 정답이 뻔하지 않으면 경쟁하는 시제품이나 스케치를 2~3개 만든다[](source:rule) | 의무 |
| 후보를 나란히 놓고 비교한다[](source:rule) | 의무 |
| 비교가 끝난 뒤에만 하나에 결정한다[](source:rule) | 의무 |
| 첫 모양의 변형 하나는 후보로 세지 않는다[](source:rule) | 판단 기준 |

| 상황 | 적용 여부 |
| --- | --- |
| 코드베이스에 선례가 없는 UI 상호작용[](source:yes) | {good:적용} |
| 쓸 만한 접근이 여럿인 아키텍처 선택[](source:yes) | {good:적용} |
| 논리보다 느낌이 사용자 경험을 좌우하는 제품 설계 결정[](source:yes) | {good:적용} |
| 패턴이 정해진 기계적 구현[](source:not) | {bad:적용 안 함} |
| 목표 상태가 분명한 버그 수정이나 리팩터링[](source:not) | {bad:적용 안 함} |
| 제약 때문에 가능한 접근이 하나뿐인 변경[](source:not) | {bad:적용 안 함} |

@facts
| 후보 수 | 2~3개(정답이 뻔하지 않을 때) |
| 후보 형태 | 시제품 또는 스케치 |
| 결정 시점 | 나란히 비교한 뒤 |

## 흐름 속 위치 {#position}

@workflow id=exhaust-position title="exhaust-the-design-space 앞뒤"
| pm | poteto-mode | backend |
| me | exhaust-the-design-space | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 선례 없음 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 선례 없는 상호작용이나 아키텍처 결정 |

이 원칙은 다른 스킬을 가리키지 않는다. 원장에는 없지만 이 원칙을 이름으로 언급하는 곳이 있다(rel-id 없음).

- `prototype` 플레이북 4단계: 대안을 한 전환 스위치 뒤에 두고 각 변형에 이름을 붙인다. 플레이북은 이것을 이 원칙의 싼 형태라고 부른다.[](source:pb-proto)
- `architect`는 구조가 다른 후보를 최소 2개 요구하고, 이것을 이 원칙의 구체화라고 부른다.[](source:architect)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-exhaust-the-design-space/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 52줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 2곳이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
후보를 비교할 기준(무엇을 재고 누가 고르는지)은 원문에 명시 없음. 2개와 3개 중 무엇을 고를지 정하는 기준도 원문에 명시 없음.
