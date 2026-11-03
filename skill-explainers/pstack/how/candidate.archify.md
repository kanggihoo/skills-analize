# how 스킬은 에이전트를 어떻게 바꾸나 {#how-skill}

`how`를 쓰면 에이전트는 "X는 어떻게 동작하나"에 직접 답하지 않는다. 읽기 전용 서브에이전트에게 조사와 설명을 맡기고, 그 설명을 거의 그대로 전한다.[](source:skill-body)

- 질문이 단순하면 설명 담당 하나가 조사와 설명을 한 번에 한다. 복잡하면 탐색 담당 2~4개가 먼저 나눠 조사한다.[](source:skill-assess)
- 판단이 애매하면 단순한 경로를 고른다.[](source:skill-assess)
- 띄우는 서브에이전트는 모두 `readonly: true`다. 코드를 바꾸지 않는다.[](source:skill-explore)
- 결과는 개요, 핵심 개념, 동작 방식, 파일 위치, 주의할 점 순서의 설명이다. 메인 에이전트는 이 설명을 크게 고쳐 쓰지 않는다.[](source:skill-present)

@answer scope="pstack/how · 원본 텍스트 파일 3개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/how/SKILL.md · 3077B · 본문(frontmatter)" path=pstack/how/SKILL.md lines=1:5
@source skill-body title="pstack/how/SKILL.md · 목적과 모델 규칙" path=pstack/how/SKILL.md lines=9:11
@source skill-assess title="pstack/how/SKILL.md · Step 1" path=pstack/how/SKILL.md lines=13:20
@source skill-explore title="pstack/how/SKILL.md · Step 2a, 2b" path=pstack/how/SKILL.md lines=22:40
@source skill-synth title="pstack/how/SKILL.md · Step 3" path=pstack/how/SKILL.md lines=42:50
@source skill-present title="pstack/how/SKILL.md · Step 4, 출력 형식" path=pstack/how/SKILL.md lines=52:58
@source explorer title="pstack/how/references/explorer-prompt.md · 2684B · 탐색 담당 프롬프트" path=pstack/how/references/explorer-prompt.md lines=7:52
@source explainer title="pstack/how/references/explainer-prompt.md · 3085B · 설명 담당 프롬프트" path=pstack/how/references/explainer-prompt.md lines=7:55
@source explainer-head title="pstack/how/references/explainer-prompt.md · 도입부" path=pstack/how/references/explainer-prompt.md lines=7:15
@source pm-trigger title="pstack/poteto-mode/SKILL.md · how 호출 조건" path=pstack/poteto-mode/SKILL.md lines=19:19
@source architect-how title="pstack/architect/SKILL.md · how 실행" path=pstack/architect/SKILL.md lines=23:25
@source teach-how title="pstack/teach/SKILL.md · how·why 실행" path=pstack/teach/SKILL.md lines=11:14
@source why-pair title="pstack/why/SKILL.md · how와의 구분" path=pstack/why/SKILL.md lines=11:11
@source setup-roles title="pstack/setup-pstack/SKILL.md · how 역할 줄" path=pstack/setup-pstack/SKILL.md lines=55:56

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/how`를 입력하거나, 다른 스킬이 실행 단계에서 부를 때 켜진다. `description`은 이 스킬이 어떤 질문을 다루는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/how` 입력 |
| `poteto-mode` | 사소하지 않은 변경, 아키텍처 결정, "정말 확실해?" 같은 질문[](source:pm-trigger) |
| `architect` | 새 코드가 닿는 시스템마다 설계 전에 실행[](source:architect-how) |
| `teach` | 동작 설명이 필요할 때 `why`와 함께 병렬로 실행[](source:teach-how) |

동기나 이유를 묻는 질문은 `why`가 맡는다. `how`는 무엇을 어떻게 하는지, `why`는 왜 그렇게 생겼는지를 답한다.[](source:why-pair)

## 질문을 받으면 어떻게 진행하나 {#flow}

@workflow id=how-flow title="how 진행 흐름"
| assess | 복잡한가? | backend |
| explore | 탐색 2~4개 | backend |
| synth | 종합 | backend |
| direct | 단독 설명 | backend |
| present | 전달 | frontend |
| assess > explore | 예 | emphasis |
| assess > direct | 아니오 | |
| explore > synth | | |
| synth > present | | |
| direct > present | | |

@steps id=how-steps
| s-assess | 복잡한가? | 모듈 하나, 작은 유틸리티, 함수 하나에 대한 질문은 단순하다. 여러 파일이나 서비스에 걸친 하위 시스템, 전체 구조 개요는 복잡하다. 범위가 애매하면 해석을 밝히고 진행한다. 사용자가 방향을 바꿀 수 있다. | how-flow | assess |
| s-explore | 탐색 2~4개 | 질문을 서로 다른 조사 각도 2~4개로 나눈다. 탐색 담당을 한 메시지에서 한꺼번에 띄운다. 각자 탐색 담당 프롬프트에 자기 각도를 채워 받는다. | how-flow | explore |
| s-synth | 종합 | 탐색 담당이 모두 돌아오면 설명 담당 하나를 띄운다. 모든 탐색 결과를 설명 담당 프롬프트에 채워 넘긴다. | how-flow | synth |
| s-direct | 단독 설명 | 설명 담당 하나가 조사와 설명을 한 번에 한다. 프롬프트에서 탐색 결과 부분은 뺀다. | how-flow | direct |
| s-present | 전달 | 설명 담당의 결과를 사용자에게 보여 준다. 대화 맥락을 덧붙이거나 읽기 쉽게 조금 다듬는 것은 괜찮다. 크게 다시 쓰지는 않는다. | how-flow | present |

이 흐름은 `SKILL.md`의 Step 1~4를 그대로 옮긴 것이다.[](source:skill-assess)[](source:skill-explore)[](source:skill-synth)[](source:skill-present)

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 모든 서브에이전트는 `subagent_type: generalPurpose`, `readonly: true`로 띄운다[](source:skill-explore) | 의무 |
| 탐색 담당은 한 메시지에서 한꺼번에 띄운다[](source:skill-explore) | 의무 |
| 판단이 애매하면 단순한 경로를 고른다[](source:skill-assess) | 의무 |
| 설명 담당의 결과를 크게 다시 쓰지 않는다[](source:skill-present) | 금지 |
| 해당 없는 출력 절은 뺀다[](source:skill-present) | 허용 |

@facts
| 탐색 각도 수 | 2~4개(복잡한 질문일 때만) |
| 탐색 담당 모델 | 규칙 파일의 `how explorer` 줄. 없으면 `grok-4.7-xhigh-fast` |
| 설명 담당 모델 | 규칙 파일의 `how explainer` 줄. 없으면 `claude-opus-5-5-max` |

모델은 `setup-pstack`이 쓰는 `~/.cursor/rules/pstack-models.mdc`에서 읽는다.[](source:setup-roles) 값이 `auto`나 `inherit-parent`면 `model`을 비워 부모 채팅 모델을 쓴다. Task 도구가 이름을 거부하면 기본값을 쓰고 그 사실을 알린다. 기본값도 거부되면 오류 메시지에 나온 같은 계열의 가장 가까운 이름을 쓴다.[](source:skill-body)

## 서브에이전트에게 무엇을 시키나 {#prompts}

| 역할 | 하는 일 | 돌려주는 것 |
| --- | --- | --- |
| 탐색 담당 | 진입점 찾기 → 호출 흐름 따라가기 → 핵심 추상 정리 → 경계 찾기 → 예상 밖 동작 찾기. 이름만 보고 짐작하지 않고 코드를 읽는다[](source:explorer) | 찾은 구성 요소, 흐름, 읽은 파일, 경계, 예상 밖 동작, 풀지 못한 질문 |
| 설명 담당 | 겹치는 탐색 결과를 합치고, 서로 어긋나면 코드를 직접 확인해 정리한다. 다시 처음부터 탐색할 필요는 없다[](source:explainer) | 개요, 핵심 개념, 동작 방식, 파일 위치, 주의할 점 |

설명 담당 프롬프트는 "이 영역을 모르는 시니어 엔지니어가 읽고 바로 일을 시작할 수 있는 수준"을 목표로 삼는다.[](source:explainer) 그래서 의사 코드 대신 산문을 쓰고, 파일과 함수 이름을 구체적으로 적게 한다. 그림은 흐름을 분명하게 만들 때만 넣는다. 탐색 담당이 남긴 풀지 못한 질문은 숨기지 않고 드러내게 한다.

@callout level=open-question title="단순 경로에서 쓰는 프롬프트의 첫머리"
단순 경로는 설명 담당 프롬프트에서 탐색 결과 부분만 빼고 쓴다고 한다. 그런데 프롬프트 도입부는 "여러 탐색 담당이 이미 병렬로 조사했다"고 전제한다. 이 문장을 어떻게 바꿀지는 원문에 명시 없음. 판정: 단순 경로에서는 메인 에이전트가 도입부를 직접 고쳐야 한다.[](source:skill-explore)[](source:explainer-head)

## 흐름 속 위치 {#position}

@workflow id=how-position title="how 앞뒤의 스킬"
| caller | poteto-mode · architect · teach | backend |
| how | how | backend |
| back | 부른 스킬로 돌아감 | backend |
| caller > how | 조사 질문 | |
| how > back | 동작 설명 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 조사 질문 | 동작 설명 | 사소하지 않은 변경, 아키텍처 결정 | r01 |
| `architect`의 하위 시스템 목록 | 추적한 동작 모델 | Phase A, 구현이 어긋나면 다시 | r60 |
| `teach`의 질문 | 동작 설명 | `why`와 병렬 | r42 |
| `pstack-models.mdc`의 역할 줄 | - | 파일이나 줄이 없으면 기본 모델 | r30 |

`how`는 다른 스킬을 부르지 않는다. 전체 흐름은 `pstack/_group-understand/understand.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/explorer-prompt.md`, `references/explainer-prompt.md`. 세 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`, `references/*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"복잡하다"와 "단순하다"의 경계는 예시로만 주어진다. 파일 몇 개부터 복잡한지 같은 수치 기준은 원문에 명시 없음.
