# writing-for-agents 스킬은 에이전트를 어떻게 바꾸나 {#wfa-skill}

`writing-for-agents`는 절차가 아니라 참고 자료다. 에이전트가 스킬, `AGENTS.md`, `CLAUDE.md`처럼 다른 에이전트가 읽을 문서를 쓸 때 판단 기준을 준다. 목표는 같은 출력이 아니라 매번 같은 **과정**을 밟게 하는 문서다.[](source:wfa-intro)

- 문서에 가는 길은 컨텍스트 포인터(context pointer)가 정한다. 포인터의 대상이 아니라 문구가 언제, 얼마나 확실히 닿는지를 정한다.[](source:wfa-ptr)
- 내용마다 정보 계층(information hierarchy)의 어느 칸에 둘지 고른다. 모든 갈래가 쓰는 것은 본문에, 일부만 쓰는 것은 포인터 뒤로 뺀다.[](source:wfa-disc)
- 단계마다 분명하고 요구가 큰 완료 조건(completion criterion)을 둔다.[](source:wfa-steps)
- 금지보다 원하는 행동을 쓰고, 행동을 바꾸지 못하는 문장은 통째로 지운다.[](source:wfa-neg)[](source:wfa-noop)

@answer scope="mattpocock/writing-for-agents · 원본 텍스트 파일 3개 · 커밋 0f0d1b0 · 실행하지 않음, 지시상 동작만"
@meta locale=ko
@source wfa-fm title="mattpocock/writing-for-agents/SKILL.md · 10886B · frontmatter" path=mattpocock/writing-for-agents/SKILL.md lines=1:4
@source wfa-yaml title="mattpocock/writing-for-agents/agents/openai.yaml · 102B · 표시 정보" path=mattpocock/writing-for-agents/agents/openai.yaml lines=1:3
@source wfa-intro title="mattpocock/writing-for-agents/SKILL.md · 도입과 SKILL-MECHANICS 안내" path=mattpocock/writing-for-agents/SKILL.md lines=6:8
@source wfa-ptr title="mattpocock/writing-for-agents/SKILL.md · Context pointers" path=mattpocock/writing-for-agents/SKILL.md lines=10:18
@source wfa-loads title="mattpocock/writing-for-agents/SKILL.md · The two loads" path=mattpocock/writing-for-agents/SKILL.md lines=20:27
@source wfa-ladder title="mattpocock/writing-for-agents/SKILL.md · Information hierarchy 사다리" path=mattpocock/writing-for-agents/SKILL.md lines=31:37
@source wfa-disc title="mattpocock/writing-for-agents/SKILL.md · Progressive disclosure" path=mattpocock/writing-for-agents/SKILL.md lines=39:39
@source wfa-coloc title="mattpocock/writing-for-agents/SKILL.md · Co-location" path=mattpocock/writing-for-agents/SKILL.md lines=41:41
@source wfa-sprawl title="mattpocock/writing-for-agents/SKILL.md · Sprawl" path=mattpocock/writing-for-agents/SKILL.md lines=43:43
@source wfa-steps title="mattpocock/writing-for-agents/SKILL.md · Steps and completion criteria" path=mattpocock/writing-for-agents/SKILL.md lines=45:52
@source wfa-split title="mattpocock/writing-for-agents/SKILL.md · When to split" path=mattpocock/writing-for-agents/SKILL.md lines=54:59
@source wfa-lead title="mattpocock/writing-for-agents/SKILL.md · Leading words" path=mattpocock/writing-for-agents/SKILL.md lines=61:72
@source wfa-neg title="mattpocock/writing-for-agents/SKILL.md · Negation" path=mattpocock/writing-for-agents/SKILL.md lines=74:74
@source wfa-sst title="mattpocock/writing-for-agents/SKILL.md · Pruning 단일 원본" path=mattpocock/writing-for-agents/SKILL.md lines=78:78
@source wfa-cache title="mattpocock/writing-for-agents/SKILL.md · Pruning 환경과 캐시" path=mattpocock/writing-for-agents/SKILL.md lines=79:79
@source wfa-rel title="mattpocock/writing-for-agents/SKILL.md · Pruning 관련성과 퇴적층" path=mattpocock/writing-for-agents/SKILL.md lines=80:80
@source wfa-noop title="mattpocock/writing-for-agents/SKILL.md · Pruning 효과 없는 지시" path=mattpocock/writing-for-agents/SKILL.md lines=81:81
@source mech-intro title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · 2629B · 도입" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=1:3
@source mech-model title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · model-invoked" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=9:9
@source mech-user title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · user-invoked" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=10:10
@source mech-pick title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · 고르는 기준과 공유 참고 자료" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=12:14
@source mech-split title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · Splitting by invocation" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=16:18
@source mech-router title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · Router skills" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=20:22
@source retro-s1 title="mattpocock/retro/SKILL.md · 4369B · Step 1" path=mattpocock/retro/SKILL.md lines=11:11
@source retro-skills title="mattpocock/retro/SKILL.md · Files 절 Skills 줄" path=mattpocock/retro/SKILL.md lines=44:44
@source retro-dmi title="mattpocock/retro/SKILL.md · disable-model-invocation" path=mattpocock/retro/SKILL.md lines=4:4
@source cos-dmi title="mattpocock/chief-of-staff/SKILL.md · 4729B · disable-model-invocation" path=mattpocock/chief-of-staff/SKILL.md lines=4:4
@source cos-ex title="mattpocock/chief-of-staff/SKILL.md · 위키 문장 예시" path=mattpocock/chief-of-staff/SKILL.md lines=45:45
@source cos-proc title="mattpocock/chief-of-staff/SKILL.md · 절차를 파일로 읽기" path=mattpocock/chief-of-staff/SKILL.md lines=51:53

## 언제 켜지고 누가 부르나 {#trigger}

@code source=wfa-fm language=yaml

`disable-model-invocation` 필드가 없다. 그래서 모델 호출형(model-invoked) 스킬이다.[](source:wfa-fm)[](source:mech-model) `description`은 모델이 판단할 때 참고하는 설명이다.

- 에이전트가 스킬을 만들거나 고칠 때, `AGENTS.md`나 `CLAUDE.md`를 바꿀 때 스스로 켤 수 있다.
- 사용자가 `/writing-for-agents`를 입력해도 켜진다.
- 다른 스킬이 Skill 도구로 부를 수 있다.

@code source=wfa-yaml language=yaml

`agents/openai.yaml`에는 `policy` 항목이 없다.[](source:wfa-yaml) `allow_implicit_invocation: false`가 있는 `retro`, `chief-of-staff`와 다르다. 이 항목이 없을 때의 기본 동작은 원문에 명시 없음.

| 누가 | 어떻게 | rel-id |
| --- | --- | --- |
| 에이전트 자신 | `description`의 조건(스킬 작성·수정, `AGENTS.md`·`CLAUDE.md` 수정)에 맞으면 스스로 켠다[](source:wfa-fm) | - |
| `retro` | 1단계에서 Skill 도구로 부른다(의무형). 참고 절에서도 스킬은 이 조언을 따르라고 한다[](source:retro-s1)[](source:retro-skills) | r03 |
| `chief-of-staff` | 부르지 않는다. 위키 문장 예시에 이름만 나온다[](source:cos-ex) | r10 |

문서가 스킬이면 `SKILL-MECHANICS.md`도 읽으라고 한다. 머리말, 호출 방식 선택, 길잡이 스킬(router skill)을 다룬다.[](source:wfa-intro)[](source:mech-intro)

## 모델 호출형과 사용자 호출형은 어떻게 고르나 {#invocation}

두 방식은 두 가지 부담을 맞바꾼다. 하나는 에이전트 창에 늘 실리는 컨텍스트 부담(context load), 하나는 사람이 기억해야 하는 인지 부담(cognitive load)이다.[](source:mech-model)[](source:mech-user)

| 기준 | 모델 호출형 | 사용자 호출형 |
| --- | --- | --- |
| 설정 | `disable-model-invocation`을 뺀다. 발동 갈래를 담은 모델용 `description`을 쓴다[](source:mech-model) | `disable-model-invocation: true`. `description`은 사람용 한 줄 요약, 발동 목록은 지운다[](source:mech-user) |
| 누가 켜나 | 에이전트, 다른 스킬, 사람 {good:모두} | 이름을 입력한 사람만 {caution:사람만} |
| 부담 | `description`이 늘 실린다. 상시 컨텍스트 부담[](source:mech-model) | 컨텍스트 부담 0. 대신 사람이 존재를 기억해야 한다[](source:mech-user) |
| 공유 참고 자료 | 내용이 모두 참고 자료면 여러 스킬이 부르는 한 곳이 될 수 있다[](source:mech-model) | 다른 스킬이 부를 수 없다 {bad:공유 불가} |

@workflow id=wfa-invoke title="호출 방식 선택"
| need | 혼자 닿아야? | backend |
| model | 모델 호출형 | backend |
| user | 사용자 호출형 | backend |
| need > model | 예 | emphasis |
| need > user | 아니오 | |

@steps id=wfa-invoke-steps
| i-need | 혼자 닿아야? | 에이전트가 스스로 이 스킬에 닿아야 하나, 또는 다른 스킬이 이 스킬을 불러야 하나를 묻는다. | wfa-invoke | need |
| i-model | 모델 호출형 | 둘 중 하나라도 맞으면 모델 호출형으로 둔다. `SKILL.md`의 포인터 작성 규칙이 `description`에 그대로 적용된다. | wfa-invoke | model |
| i-user | 사용자 호출형 | 손으로만 켜는 스킬이면 사용자 호출형으로 두고 컨텍스트 부담을 내지 않는다. | wfa-invoke | user |

- 사용자 호출형 스킬 둘이 같은 참고 자료를 써야 하면, 그 자료는 어느 스킬에도 둘 수 없다. 스킬 체계 밖의 일반 파일로 빼서 양쪽이 가리키게 한다.[](source:mech-pick)
- 스킬을 따로 떼어 모델 호출형으로 만드는 경우는 둘이다. 실제 프롬프트에서 쓰는 독자적인 발동 단어가 있거나, 다른 스킬이 닿아야 할 때다. 새 `description`의 상시 부담만큼 가치가 있어야 한다.[](source:mech-split)
- 사용자 호출형 스킬이 기억 못 할 만큼 늘면 길잡이 스킬 하나를 둔다. 다른 스킬의 이름과 쓸 때를 적은 사용자 호출형 스킬이다. 사람은 그것 하나만 기억하면 된다. 길잡이는 힌트만 줄 뿐 다른 스킬을 켜지 못한다.[](source:mech-router)

판정: 이 규칙이 묶음 안의 호출 방식 차이를 설명한다.

- `retro`와 `chief-of-staff`는 `disable-model-invocation: true`라 다른 스킬이 Skill 도구로 부를 수 없다.[](source:retro-dmi)[](source:cos-dmi) 그래서 `chief-of-staff`는 `retro`의 `SKILL.md`를 파일 경로로 읽는다(r01).[](source:cos-proc)
- 반대로 `writing-for-agents`는 이 필드가 없어 `retro`가 Skill 도구로 부른다(r03).[](source:retro-s1)
- 파일 경로로 읽는 방식은 "스킬 체계 밖의 일반 파일" 규칙과 같은 해법이다.[](source:mech-pick)[](source:mech-user)

## 포인터와 정보 계층은 무엇을 정하나 {#hierarchy}

컨텍스트 포인터는 컨텍스트에 있으면서 밖의 자료를 가리키고, 그 자료에 닿을 조건을 담는다. 스킬의 `description`도, `AGENTS.md`에서 문서를 가리키는 한 줄도 포인터다.[](source:wfa-ptr) 꼭 필요한 대상이 약한 문구 뒤에 있으면 실행마다 결과가 흔들린다. 원문은 먼저 문구를 다듬고, 그래도 안 되면 내용을 본문에 넣으라고 한다.[](source:wfa-ptr)

| 포인터 작성 규칙 | 뜻 |
| --- | --- |
| 이끄는 단어를 앞에 둔다 | 발동을 일으키는 것이 포인터이므로 핵심 단어를 맨 앞에 쓴다[](source:wfa-ptr) |
| 갈래 하나에 발동어 하나 | 같은 갈래를 이름만 바꾼 동의어는 하나로 합친다. 진짜 다른 갈래(branch)만 남긴다[](source:wfa-ptr) |
| 본문이 이미 말하는 정체는 뺀다 | 상시 실리는 포인터는 단어마다 매 턴 비용이 들어 본문보다 더 깎는다[](source:wfa-ptr) |

포인터 뒤에만 있는 자료는 포인터 한 줄 값만 컨텍스트 부담으로 낸다. 포인터가 아예 없는 자료는 전부 사람의 인지 부담이 된다. 원문은 인지 부담을 줄일 대상이 아니라 사람이 주도권을 갖는 값으로 본다. 사람의 판단이 필요한 곳에만 쓰라고 한다.[](source:wfa-loads)

| 정보 계층 | 무엇을 두나 |
| --- | --- |
| 1. 본문 단계(in-file step) | 에이전트가 순서대로 하는 일. 가장 위 칸이다[](source:wfa-ladder) |
| 2. 본문 참고(in-file reference) | 필요할 때 찾아보는 정의, 규칙, 사실. 리뷰 규칙처럼 평평하게 나열돼도 괜찮다[](source:wfa-ladder) |
| 3. 분리된 참고(disclosed reference) | 별도 파일로 빼고 포인터로 닿는다. 같은 폴더 파일부터 어디에나 있는 외부 자료까지다[](source:wfa-ladder) |

- **점진적 공개(progressive disclosure)**: 내용을 아래 칸으로 내려 포인터 뒤에 두는 것이다. 토큰 절약보다 계층을 지키는 수단이다. 시험은 갈래다. 모든 갈래가 쓰면 본문에, 일부만 쓰면 포인터 뒤로 뺀다.[](source:wfa-disc)
- **함께 두기(co-location)**: 한 개념의 정의, 규칙, 주의점을 한 제목 아래 모은다. 흩어 놓는 것은 중복과 다르다. 중복은 한 뜻을 두 곳에 되풀이하고, 흩어짐은 한 뜻을 여러 조각으로 쪼갠다.[](source:wfa-coloc)
- **비대(sprawl)**: 줄마다 살아 있어도 문서가 너무 길면 주의가 얇아진다. 처방은 참고 자료를 포인터 뒤로 빼고, 갈래나 순서로 나누는 것이다.[](source:wfa-sprawl)

## 단계는 언제 끝났다고 보나 {#completion}

단계마다 끝을 알리는 완료 조건이 있어야 한다. 원문은 두 성질을 지렛대로 본다.[](source:wfa-steps)

| 성질 | 묻는 것 | 원문 예 |
| --- | --- | --- |
| 명확성(clarity) | 끝났는지 아닌지 에이전트가 가를 수 있나 | "이해에 도달함"은 흐려서 성급한 완료(premature completion)를 부른다[](source:wfa-steps) |
| 요구량(demand) | 얼마나 많이 요구하나 | "수정한 모델을 빠짐없이 설명함"은 "변경 목록 작성"보다 철저한 발품(legwork)을 끌어낸다[](source:wfa-steps) |

가장 강한 조건은 검사할 수 있고 빠짐이 없는 조건이다.[](source:wfa-steps) 요구량은 단계에만 걸리지 않는다. "모든 규칙 적용" 같은 조건은 참고 자료만 있는 문서에도 철저함을 요구한다.[](source:wfa-steps)

@workflow id=wfa-rush title="성급한 완료 막는 순서"
| fuzzy | 흐린가? | backend |
| sharpen | 다듬기 | backend |
| still | 서두르나? | backend |
| split | 순서 나누기 | backend |
| fuzzy > sharpen | 예 | |
| sharpen > still | | |
| still > split | 예 | emphasis |

@steps id=wfa-rush-steps
| r-fuzzy | 흐린가? | 뒤에 보이는 단계(post-completion steps)가 에이전트를 끌어당긴다. 조건의 명확성이 그 힘에 맞선다. | wfa-rush | fuzzy |
| r-sharpen | 다듬기 | 첫 방어는 완료 조건을 날카롭게 고치는 것이다. 그 자리에서 싸게 할 수 있다. | wfa-rush | sharpen |
| r-still | 서두르나? | 조건이 본래 흐릴 수밖에 없고, 실제로 서두르는 모습을 봤을 때만 다음으로 간다. 아니면 나누지 않는다. | wfa-rush | still |
| r-split | 순서 나누기 | 뒤 단계를 숨기려고 순서를 나눈다. 인계나 서브에이전트 같은 진짜 컨텍스트 경계를 넘어야 효과가 있다. 같은 창 안의 호출은 뒤 단계를 그대로 남긴다. | wfa-rush | split |

나누기는 두 부담 중 하나를 쓰므로 이득이 있을 때만 나눈다. 반대 방향도 경고한다. 순서를 합치면 각 단계에 뒤 단계가 보여 성급한 완료를 부른다.[](source:wfa-split)

## 어떤 단어를 쓰고 어떤 문장을 지우나 {#words}

**이끄는 단어(leading word)**는 모델이 사전 학습으로 이미 아는 압축된 개념이다. 예로 `lesson`, `fog of war`, `tracer bullets`가 나온다.[](source:wfa-lead)

- 문장이 아니라 토큰으로 반복하면 넓은 행동 영역을 적은 토큰으로 붙잡는다. 본문에서는 실행을, 포인터에서는 호출을 붙잡는다.[](source:wfa-lead)
- 새 단어를 지어도 되지만 사전 지식을 끌어오지 못하므로 정의 비용이 든다. 기존 단어를 먼저 찾는다.[](source:wfa-lead)

| 늘어진 표현 | 이끄는 단어 |
| --- | --- |
| "fast, deterministic, low-overhead" | `tight` (a `tight` loop)[](source:wfa-lead) |
| "a loop you believe in" | `red`. 흐린 통과 조건을 버그에서 빨개지는지 아닌지라는 이분 상태로 바꾼다[](source:wfa-lead) |

**부정(negation)**은 이 지렛대 옆의 실패다. 금지 문장은 금지한 행동을 컨텍스트로 끌고 들어와 오히려 더 떠오르게 한다("코끼리를 생각하지 마라").[](source:wfa-neg)

- 원하는 행동을 긍정형으로 쓴다. 원문 예는 "한 줄 주석을 쓴다"다.[](source:wfa-neg)
- 금지는 긍정형으로 쓸 수 없는 강한 안전장치일 때만 쓴다. 그때도 긍정 목표를 함께 적는다.[](source:wfa-neg)

| 가지치기 규칙 | 할 일 |
| --- | --- |
| 단일 원본(single source of truth) | 한 뜻은 한 곳에만 둔다. 중복은 유지 비용과 토큰을 들이고, 그 뜻을 계층에서 실제보다 높게 보이게 한다[](source:wfa-sst) |
| 환경은 원본, 문서는 캐시 | `package.json` 스크립트, 설정 파일, 폴더 구조, `--help` 출력을 다시 적은 문서는 캐시다. 찾아보기 비싼 것만 적는다. 적힌 적 없는 관례, 선택의 이유, 설정에 드러나지 않는 함정이 그렇다[](source:wfa-cache) |
| 관련성 | 줄마다 아직 문서의 일과 관련 있는지 본다. 가지치기 습관이 없으면 낡은 층이 쌓이는 퇴적층(sediment)이 된다[](source:wfa-rel) |
| 효과 없는 지시(no-op) | 모델이 기본으로 이미 하는 일을 시키는 문장은 지운다. 단어만 깎지 말고 문장을 통째로 지운다. 판단은 토론이 아니라 문서를 돌려서 한다[](source:wfa-noop) |

효과 없는 지시 시험은 이끄는 단어에도 적용된다. 기본값을 못 이기는 약한 단어(`be thorough`)는 효과가 없다. 처방은 다른 기법이 아니라 더 센 단어(`relentless`)다.[](source:wfa-noop)

## 흐름 속 위치 {#position}

@workflow id=wfa-position title="writing-for-agents 앞뒤의 스킬"
| retro | retro | backend |
| cos | chief-of-staff | backend |
| wfa | writing-for-agents | backend |
| back | 부른 쪽으로 | backend |
| retro > wfa | Skill 도구 | |
| cos > wfa | 예시만 | dashed |
| wfa > back | 작성 기준 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `retro` | 호출 | 문서 작성 기준 | 1단계에서 의무형으로 호출. 참고 절의 Skills 줄도 이 스킬을 가리킨다[](source:retro-s1)[](source:retro-skills) | r03 |
| `chief-of-staff` | - | - | 위키 문장 예시에 이름만 나온다. 실행 지시가 아니다[](source:cos-ex) | r10 |

`writing-for-agents`는 다른 스킬을 부르지 않는다. 판정: 이 묶음에서 개선 후보를 문서로 옮길 때의 기준 역할(안내)을 맡는다. 전체 흐름은 `mattpocock/_group-env-improve/env-improve.html`에 있다. 관계 근거는 `mattpocock/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `SKILL-MECHANICS.md`, `agents/openai.yaml`. 모두 원본이다. 관계 확인을 위해 `retro/SKILL.md`와 `chief-of-staff/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: 없음. 이 스킬 폴더에는 번역본이 없다.
- 원문 비교: 원장은 `SKILL.md`가 사용자 전역 스킬 `~/.claude/skills/writing-for-agents`(저장소 밖)와 같다고 적는다. 이번에 `shasum`으로 다시 보니 `SKILL-MECHANICS.md`도 같다. r03, r10의 출처 줄을 원문과 대조했고 원장과 같다.
- 실제로 실행해 보지 않았다. 이 스킬의 규칙이 실제 에이전트 행동을 얼마나 바꾸는지는 확인하지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`agents/openai.yaml`에 `policy`가 없을 때 그 하네스가 암묵 호출을 허용하는지는 원문에 명시 없음.
원문은 수치 기준을 두지 않는다. 문서가 몇 줄이면 비대한지, 몇 개부터 길잡이 스킬이 필요한지는 원문에 명시 없음. 다른 스킬의 수치(예: `retro`의 1,000줄)는 이 스킬이 정한 것이 아니다.
