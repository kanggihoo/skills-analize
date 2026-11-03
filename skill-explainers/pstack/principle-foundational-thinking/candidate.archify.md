# principle-foundational-thinking 스킬은 에이전트를 어떻게 바꾸나 {#foundational-thinking-skill}

`principle-foundational-thinking`을 읽은 에이전트는 로직을 쓰기 전에 데이터 모양부터 정한다. 핵심 타입을 일찍 정의하고, 모든 접근 경로를 따라가 본 뒤, 주된 경로에 맞는 구조를 고른다.[](source:data)

- 원문은 결정을 두 층으로 나눈다. 구조 결정은 나중의 선택지를 지키고, 코드 수준 결정은 단순함을 지킨다.[](source:layers)
- 뒤따르는 모든 단계에 도움이 되는 것은 먼저 한다. CI, 린트, 테스트 기반, 공유 타입이 골격에 든다.[](source:scaffold)
- 상태를 여러 실행 주체가 함께 쓰기 전에 "다른 주체가 동시에 바꾸면?"을 묻는다. 답이 "아무 일 없음"이 아니면 분리한다.[](source:concurrency)
- 골격보다 빼기가 먼저다. 죽은 코드를 먼저 지우고 기초를 놓는다.[](source:subtract)

@answer scope="pstack/principle-foundational-thinking · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-foundational-thinking/SKILL.md · 1530B · 원칙 본문(frontmatter)" path=pstack/principle-foundational-thinking/SKILL.md lines=1:5
@source layers title="pstack/principle-foundational-thinking/SKILL.md · 두 층의 결정" path=pstack/principle-foundational-thinking/SKILL.md lines=9:9
@source data title="pstack/principle-foundational-thinking/SKILL.md · 데이터 구조 먼저" path=pstack/principle-foundational-thinking/SKILL.md lines=11:11
@source code title="pstack/principle-foundational-thinking/SKILL.md · 코드 수준" path=pstack/principle-foundational-thinking/SKILL.md lines=13:13
@source concurrency title="pstack/principle-foundational-thinking/SKILL.md · 동시성 따름 규칙" path=pstack/principle-foundational-thinking/SKILL.md lines=15:15
@source scaffold title="pstack/principle-foundational-thinking/SKILL.md · 골격 먼저" path=pstack/principle-foundational-thinking/SKILL.md lines=17:17
@source increment title="pstack/principle-foundational-thinking/SKILL.md · 증분마다 추상" path=pstack/principle-foundational-thinking/SKILL.md lines=19:19
@source subtract title="pstack/principle-foundational-thinking/SKILL.md · 빼기 먼저" path=pstack/principle-foundational-thinking/SKILL.md lines=21:21
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Core 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=45:45
@source pb-refactor title="pstack/poteto-mode/playbooks/refactoring.md · 3211B · 3단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=9:9
@source architect title="pstack/architect/SKILL.md · 5675B · 종합 결과 커밋" path=pstack/architect/SKILL.md lines=49:49
@source fio title="pstack/figure-it-out/SKILL.md · 4059B · 단위 순서" path=pstack/figure-it-out/SKILL.md lines=27:27
@source exp title="pstack/principle-experience-first/SKILL.md · 1184B · 순서와 목표" path=pstack/principle-experience-first/SKILL.md lines=19:19

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-foundational-thinking`을 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 어떤 상황에 맞는 원칙인지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-foundational-thinking` 입력 |
| `poteto-mode` (Core 분류) | 로직을 쓰기 전: 핵심 타입과 데이터 구조, 골격과 기능의 순서, 동시 실행 주체가 공유하는 것[](source:pm-trigger) |
| `refactoring` 플레이북 | 3단계에서 지금 새로 짓는다면 어떤 모양일지 정할 때[](source:pb-refactor) |
| `architect` | 종합한 설계를 따로 커밋하는 "골격 먼저" 방식의 근거[](source:architect) |

`poteto-mode`는 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 로직보다 데이터 모양을 먼저 맞춘다. 핵심 타입을 일찍 정의하고 접근 경로를 모두 따라간다[](source:data) | 의무 |
| 모든 줄이 아니라 구조를 중복 없이 만든다. 타입과 데이터 모델은 하나로 모은다[](source:code) | 의무 |
| 비슷한 문장 세 개가 섣부른 추상보다 낫다[](source:code) | 판단 기준 |
| 영리함보다 명시성을 고른다[](source:code) | 권고 |
| 줄 수가 아니라 동작과 경계 사례를 테스트한다[](source:code) | 의무 |
| 공유 상태는 "동시에 바꾸면?"의 답이 "아무 일 없음"이 아니면 분리한다[](source:concurrency) | 의무 |
| 뒤따르는 모든 단계에 도움이 되면 먼저 한다. 설정은 기능 전에, 테스트는 수정 전에[](source:scaffold) | 의무 |
| 커밋은 작게, 목적 하나로 만든다[](source:scaffold) | 의무 |
| 증분마다 일관된 추상 하나를 올리거나 있는 추상을 깊게 한다[](source:increment) | 의무 |
| 새 기능을 호출자들 사이의 특수 사례 조정으로 흩뜨리지 않는다[](source:increment) | 금지 |
| 죽은 코드를 먼저 지우고 기초를 놓는다[](source:subtract) | 의무 |

@facts
| 골격 판정 질문 | "뒤따르는 모든 단계가 이것이 있어서 이득을 보는가?" |
| 골격의 예 | CI, 린트, 테스트 기반, 공유 타입 |
| 비슷한 문장 | 3개가 섣부른 추상보다 낫다 |

원문은 몇 개부터 추상하라고 말하지 않는다.[](source:code) 이 원칙을 적용하지 않는 경우는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=found-position title="foundational-thinking 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 | backend |
| arch | architect | backend |
| exp | experience-first | backend |
| me | foundational-thinking | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 로직 전 | |
| pb > me | 목표 모양 | |
| arch > me | 골격 커밋 | |
| exp > me | 순서 구분 | dashed |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 로직을 쓰기 전 |
| r12 플레이북 표 | `refactoring` 3단계 | 목표 모양 정하기 | 리팩터링에서 목표 구조를 이름 붙일 때 |
| r64 | `architect`의 종합 설계 | - | 골격을 먼저 커밋할 때 |
| 원장 없음 | `principle-experience-first`의 구분 | - | 이 원칙은 순서, 그 원칙은 목표[](source:exp) |

점선 간선은 원장에 없는 관계다. 원장에는 없지만 `figure-it-out`도 이 원칙을 이름으로 언급한다(rel-id 없음). 골격과 검증을 기능보다 앞에 둔다고 한다.[](source:fio)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-foundational-thinking/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 45줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 2곳이다(`figure-it-out`, `principle-experience-first`).
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"골격보다 빼기가 먼저"와 "골격 먼저"를 함께 놓으면 순서는 빼기, 골격, 기능이다(판정). 다만 `principle-subtract-before-you-add`와 어떻게 나눠 쓰는지는 이 원칙에 명시 없음.[](source:subtract)
