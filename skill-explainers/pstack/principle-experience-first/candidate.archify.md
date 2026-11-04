# principle-experience-first 스킬은 에이전트를 어떻게 바꾸나 {#experience-first-skill}

`principle-experience-first`를 읽은 에이전트는 구현이 편한 쪽과 사용자가 만족하는 쪽이 부딪히면 사용자 만족을 고른다. 기능을 적게, 대신 다듬어서 내보낸다.[](source:rule)

- 모든 기능, 컨트롤, 옵션은 있어야 할 이유를 대야 한다.[](source:list)
- 원문에서 사용자는 작업 결과를 쓰는 사람 모두다. UI에서는 최종 사용자이고, 라이브러리나 내부 인터페이스에서는 그것을 가져다 쓰는 동료다. 다음에 코드를 고칠 엔지니어도 사용자다.[](source:user)
- 작업의 영향은 그 사용자의 관점에서 설명한다.[](source:user)
- 이 원칙은 일의 목표를 정한다. 일의 순서는 기초 설계 원칙(`principle-foundational-thinking`)이 정한다.[](source:target)

@answer scope="pstack/principle-experience-first · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-experience-first/SKILL.md · 1184B · 원칙 본문(frontmatter)" path=pstack/principle-experience-first/SKILL.md lines=1:5
@source rule title="pstack/principle-experience-first/SKILL.md · 규칙" path=pstack/principle-experience-first/SKILL.md lines=9:9
@source list title="pstack/principle-experience-first/SKILL.md · 다섯 가지 지침" path=pstack/principle-experience-first/SKILL.md lines=11:15
@source user title="pstack/principle-experience-first/SKILL.md · 사용자의 범위" path=pstack/principle-experience-first/SKILL.md lines=17:17
@source target title="pstack/principle-experience-first/SKILL.md · 기초 설계와의 관계" path=pstack/principle-experience-first/SKILL.md lines=19:19
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Core 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=51:51

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-experience-first`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-experience-first` 입력 |
| `poteto-mode` (Core 분류) | 제품, UX, 기능 범위를 두고 절충할 때[](source:pm-trigger) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite) 원장에는 이 원칙을 이름으로 부르는 플레이북이 없다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 구현 편의와 사용자 만족이 부딪히면 만족을 고른다[](source:rule) | 의무 |
| 모든 기능, 컨트롤, 옵션은 존재 이유가 있어야 한다[](source:list) | 의무 |
| 적게 내보내고 더 잘 내보낸다[](source:list) | 의무 |
| 결정하기 전에 시제품을 만든다. 설계 결정은 운영 코드보다 버릴 HTML 시안에서 더 싸다[](source:list) | 의무 |
| 세부를 맞춘다: 전환, 정렬, 간격, 피드백, 오류 상태[](source:list) | 의무 |
| 핵심 흐름을 조인다. 모든 기능은 중심 작업 흐름을 돕거나 비켜선다[](source:list) | 의무 |
| 다음에 코드를 고칠 엔지니어의 경험도 같은 무게로 잰다[](source:user) | 의무 |

원문은 기능 수를 두고 이렇게 비교한다.[](source:list)

| 비교 | 다듬은 기능 3개 | 거친 기능 10개 |
| --- | --- | --- |
| 원문 판단 | {good:낫다} | {bad:못하다} |

이 원칙을 적용하지 않는 경우는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=experience-position title="experience-first 앞뒤"
| pm | poteto-mode | backend |
| me | experience-first | backend |
| found | foundational-thinking | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 범위 절충 | |
| me > found | 순서 구분 | dashed |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 제품, UX, 기능 범위 절충 |
| 원장 없음 | - | `principle-foundational-thinking`과의 구분 | 일의 순서와 목표를 나눌 때[](source:target) |

그림의 점선은 원장에 없는 관계다. 이 원칙의 마지막 문단은 "Foundational thinking"을 링크 없이 제목으로 부른다.[](source:target) 원장의 원칙끼리 참고 표(r100~r107)에는 이 관계가 빠져 있다.

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-experience-first/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 51줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 다른 스킬이 이 원칙을 언급하는 곳은 없다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"사용자 만족(delight)"을 어떻게 확인하는지, 기능의 존재 이유를 누구에게 대는지는 원문에 명시 없음.
