# retro 스킬은 에이전트를 어떻게 바꾸나 {#retro-skill}

`retro`를 쓰면 에이전트는 끝난 코딩 세션을 돌아보고, 다음 실행이 나아지도록 작업 환경의 개선 후보를 찾는다. 코드를 고치는 대신 후보를 심각도 순으로 사용자에게 내놓는다.[](source:retro-intro)[](source:retro-s4)

- 먼저 Skill 도구로 `writing-for-agents`를 불러 문서 작성 기준을 얻는다.[](source:retro-s1)
- 세션 기록을 읽고 일곱 범주에서 후보를 찾는다. 범주마다 "이럴 때 본다(Use when)" 조건이 붙어 있다.[](source:retro-cats)
- 기계적인 규칙 위반은 문장 규칙이 아니라 자동 검사로 막는다. `CODING_STANDARDS.md`는 사람의 판단이 필요한 규칙에만 쓴다.[](source:retro-std)
- 코딩 규칙을 강제하는 쪽은 구현 에이전트가 아니라 리뷰 에이전트다. 리뷰 쪽이 컨텍스트 압박(context pressure)이 가장 작기 때문이다.[](source:retro-ir)

@answer scope="mattpocock/retro · 원본 텍스트 파일 2개 · 커밋 0f0d1b0 · 실행하지 않음, 지시상 동작만"
@meta locale=ko
@source retro-fm title="mattpocock/retro/SKILL.md · 4369B · frontmatter" path=mattpocock/retro/SKILL.md lines=1:5
@source retro-yaml title="mattpocock/retro/agents/openai.yaml · 146B · 호출 정책" path=mattpocock/retro/agents/openai.yaml lines=1:5
@source retro-intro title="mattpocock/retro/SKILL.md · 도입" path=mattpocock/retro/SKILL.md lines=7:7
@source retro-s1 title="mattpocock/retro/SKILL.md · Step 1" path=mattpocock/retro/SKILL.md lines=11:11
@source retro-s2 title="mattpocock/retro/SKILL.md · Step 2" path=mattpocock/retro/SKILL.md lines=13:13
@source retro-cats title="mattpocock/retro/SKILL.md · Step 3 범주 목록" path=mattpocock/retro/SKILL.md lines=15:23
@source retro-nav title="mattpocock/retro/SKILL.md · Navigation" path=mattpocock/retro/SKILL.md lines=17:17
@source retro-checks title="mattpocock/retro/SKILL.md · Automated checks" path=mattpocock/retro/SKILL.md lines=18:18
@source retro-std title="mattpocock/retro/SKILL.md · Coding standards" path=mattpocock/retro/SKILL.md lines=19:19
@source retro-agents title="mattpocock/retro/SKILL.md · Global AGENTS.md" path=mattpocock/retro/SKILL.md lines=20:20
@source retro-tool title="mattpocock/retro/SKILL.md · Tool economy" path=mattpocock/retro/SKILL.md lines=21:21
@source retro-noop title="mattpocock/retro/SKILL.md · No-ops" path=mattpocock/retro/SKILL.md lines=22:22
@source retro-info title="mattpocock/retro/SKILL.md · Information access" path=mattpocock/retro/SKILL.md lines=23:23
@source retro-s4 title="mattpocock/retro/SKILL.md · Step 4" path=mattpocock/retro/SKILL.md lines=25:25
@source retro-ir title="mattpocock/retro/SKILL.md · Implementation vs Review" path=mattpocock/retro/SKILL.md lines=29:35
@source retro-files title="mattpocock/retro/SKILL.md · Files" path=mattpocock/retro/SKILL.md lines=37:44
@source cos-retro title="mattpocock/chief-of-staff/SKILL.md · 4729B · Retro 절차" path=mattpocock/chief-of-staff/SKILL.md lines=51:53
@source wfa-fm title="mattpocock/writing-for-agents/SKILL.md · 10886B · frontmatter" path=mattpocock/writing-for-agents/SKILL.md lines=1:4
@source spc-fm title="mattpocock/setup-pre-commit/SKILL.md · 2258B · frontmatter만 확인" path=mattpocock/setup-pre-commit/SKILL.md lines=1:4
@source gg-fm title="mattpocock/git-guardrails-claude-code/SKILL.md · 2313B · frontmatter만 확인" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=1:4

## 언제 켜지나 {#trigger}

@code source=retro-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:retro-fm) 사용자가 `/retro`를 입력하면 켜진다. 본문도 "사용자가 회고(retrospective)를 요청했다"는 문장으로 시작한다.[](source:retro-intro)

@code source=retro-yaml language=yaml

`agents/openai.yaml`도 `allow_implicit_invocation: false`로 같은 제한을 건다.[](source:retro-yaml)

| 누가 쓰나 | 방식 |
| --- | --- |
| 사용자 | `/retro` 입력. 세션을 지정하지 않으면 현재 세션을 돌아본다[](source:retro-s2) |
| `chief-of-staff` | Skill 도구가 아니라 `../retro/SKILL.md` 파일을 읽고 따른다. 서브에이전트 세션 약 5개 중 1개에 쓴다[](source:cos-retro) |

## 회고는 어떤 순서로 하나 {#flow}

@workflow id=retro-flow title="retro 네 단계"
| wfa | 기준 로드 | backend |
| read | 기록 읽기 | database |
| find | 후보 찾기 | backend |
| present | 후보 제시 | frontend |
| wfa > read | | |
| read > find | | |
| find > present | 후보 | emphasis |

@steps id=retro-steps
| s-wfa | 기준 로드 | Skill 도구로 `writing-for-agents`를 불러 문서 작성 기준을 얻는다. 개선안이 결국 에이전트가 읽는 문서가 되기 때문이다(판정). | retro-flow | wfa |
| s-read | 기록 읽기 | 사용자가 지정한 세션의 원자료를 읽는다. 이 컴퓨터의 세션 로그를 뒤져야 할 수도 있다. 지정이 없으면 현재 세션이다. | retro-flow | read |
| s-find | 후보 찾기 | 아래 일곱 범주에서 개선 후보를 찾는다. 범주마다 붙은 조건이 맞을 때 그 범주를 본다. | retro-flow | find |
| s-present | 후보 제시 | 후보를 심각도 순으로 사용자에게 내놓는다. 여기서 끝난다. | retro-flow | present |

단계는 원문 Step 1~4와 같다.[](source:retro-s1)[](source:retro-s2)[](source:retro-cats)[](source:retro-s4) 원문은 스스로를 "개선을 제안하는" 일로 규정한다.[](source:retro-intro) 판정: 후보를 직접 적용하는 단계는 없다. 사용자가 고르거나, `chief-of-staff` 안에서는 그 스킬이 대신 고른다.[](source:cos-retro)

| 범주 | 무엇을 보나 | 이럴 때 본다(Use when) |
| --- | --- | --- |
| 길 찾기(Navigation) | 에이전트가 맞는 파일을 쉽게 찾았나. 파일 사이에 숨은 의존이 있나. 위치 안내(navigation pointer)를 두면 쉬워지나[](source:retro-nav) | 정보 하나를 찾는 데 오래 걸렸을 때 |
| 자동 검사(Automated checks) | 린트, 타입, 테스트, 파일 시스템 린터가 에이전트의 실수를 잡을 수 있었나[](source:retro-checks) | 자동 검사로 잡을 수 있던 실수가 있었거나, 저장소에 안전장치가 전혀 없을 때 |
| 코딩 규칙(Coding standards) | 리뷰 에이전트(reviewer agent)에 새 규칙을 줄지, 기존 규칙을 지우거나 분명히 할지[](source:retro-std) | 리뷰 에이전트가 실수를 놓쳤을 때 |
| 전역 `AGENTS.md` | 코딩 규칙이나 자동 검사로 옮겨야 할 지침이 있나[](source:retro-agents) | 저장소나 사용자 전역의 `AGENTS.md`가 특히 클 때 |
| 도구 비용(Tool economy) | 줄일 수 있는 비싼 도구 호출, 토큰을 많이 쓰는 CLI·MCP 도구가 있나[](source:retro-tool) | 비싼 도구 호출이 있었을 때 |
| 효과 없는 지시(No-ops) | 지침 파일에 에이전트 행동을 바꾸지 못하는 지시가 있나[](source:retro-noop) | 지침 파일이 크고 다루기 어려울 때 |
| 정보 접근(Information access) | 개발 서버 로그를 따로 받아 두기, 외부 서비스 읽기 전용 접근처럼 접근을 넓힐 곳[](source:retro-info) | 중요한 정보를 에이전트가 볼 수 없었을 때 |

자동 검사 범주에는 두 가지 의무가 더 붙는다.[](source:retro-checks)

- 새 검사를 만들기 전에 저장소의 기존 검사 명령(`package.json`의 `lint`/`check` 스크립트, CI 워크플로)을 먼저 읽는다. 있는데 연결이 안 됐거나 조용히 깨진 검사가 있으면 그것을 지적한다.
- pre-commit 훅도, 린트·타입 검사·테스트를 돌리는 CI 작업도 없는 저장소는 그 자체로 지적 대상이다. 원문은 이를 "중립적인 기본값이 아니라 계속 놓치는 기회"라고 부른다.

## 규칙 위반은 어디에 적나 {#standards}

@workflow id=retro-classify title="코딩 규칙 위반 분류"
| miss | 리뷰가 놓침 | external |
| kind | 기계적 위반? | backend |
| check | 결정적 검사 | backend |
| doc | 규칙 문서 | database |
| miss > kind | | |
| kind > check | 예 | emphasis |
| kind > doc | 아니오 | |

@steps id=retro-classify-steps
| c-miss | 리뷰가 놓침 | 코딩 규칙 범주는 리뷰 에이전트가 실수를 놓쳤을 때 본다. 먼저 위반의 종류를 가른다. | retro-classify | miss |
| c-kind | 기계적 위반? | 기계적 위반은 고정된 문법 패턴, 금지된 API, import 모양, 파일 위치 규칙처럼 정해진 모양이 있는 것이다. | retro-classify | kind |
| c-check | 결정적 검사 | 저장소 린터의 맞춤 규칙, 새 pre-commit 훅, 새 CI 작업 중에서 저장소 언어와 기존 안전장치로 보아 가장 싼 것을 만든다. 원문은 여기에 "더 따질 것 없다(full stop)"를 붙인다. | retro-classify | check |
| c-doc | 규칙 문서 | `CODING_STANDARDS.md`는 진짜 판단이 필요한 것에만 남긴다. 파일 간 일관성, "주변 스타일과 맞는가"처럼 어떤 안전장치로도 대신할 수 없는 것이다. | retro-classify | doc |

기본값은 규칙 문장을 쓰는 것보다 검사를 만드는 것이다.[](source:retro-std)

| 단계 | 컨텍스트 압박 | 맡는 일 |
| --- | --- | --- |
| 구현 에이전트 | 가장 크다 {bad:압박 큼} | 탐색, 코드 작성, 실패 디버깅[](source:retro-ir) |
| 리뷰 에이전트 | 가장 작다 {good:압박 작음} | diff만 받는다. 탐색이 필요 없고, 코드를 쓰거나 디버깅할 일도 드물다. 그래서 코딩 규칙 강제는 리뷰 쪽 몫이다[](source:retro-ir) |

| 파일 | 원문이 정한 역할 |
| --- | --- |
| `CLAUDE.md` / `AGENTS.md` | 이 저장소의 모든 에이전트 컨텍스트에 들어간다. 아주 아껴 쓰고, 대개 다른 파일로 가는 위치 안내만 둔다[](source:retro-files) |
| `CODING_STANDARDS.md` | 구현이 아니라 리뷰 때 읽힌다. 1,000줄을 넘으면 docs 폴더로 가는 위치 안내를 둔다[](source:retro-files) |
| docs | 다른 파일이 가리키는 참고 파일로 쓴다. 새로 쓰기 전에 기존 문서를 찾는다[](source:retro-files) |
| 스킬 | 설명(description)이 에이전트 컨텍스트에 들어가므로 문서용으로, 또는 사용자가 부르는 명령용으로 쓴다. `writing-for-agents`의 조언을 따른다[](source:retro-files) |

@facts
| `CODING_STANDARDS.md` 분할 기준 | 1,000줄 초과 시 docs 폴더로 위치 안내 추가(의무형) |
| `chief-of-staff` 안에서의 실행 빈도 | 서브에이전트 세션 약 5개 중 1개(`chief-of-staff` 원문) |

## 흐름 속 위치 {#position}

@workflow id=retro-position title="retro 앞뒤의 스킬"
| cos | chief-of-staff | backend |
| retro | retro | backend |
| wfa | writing-for-agents | backend |
| guard | 안전장치 설치 | external |
| cos > retro | 세션 기록 | |
| retro > wfa | Skill 도구 | emphasis |
| retro > guard | 후보 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `chief-of-staff` | 서브에이전트 세션 | 개선 후보 | 약 5개 중 1개. 마지막 단계(사용자 제시)는 `chief-of-staff`가 대신 결정[](source:cos-retro) | r01 |
| `writing-for-agents` | 문서 작성 기준 | - | 1단계에서 반드시 호출. 4단계 참고 절에서도 이 기준을 따르라고 한다[](source:retro-s1)[](source:retro-files) | r03 |
| `setup-pre-commit`, `git-guardrails-claude-code` | - | "안전장치 없음" 후보 | 추론. `retro`는 두 스킬을 이름으로 부르지 않는다[](source:retro-checks)[](source:spc-fm)[](source:gg-fm) | r09 |

`writing-for-agents`는 `disable-model-invocation`이 없는 스킬이라 `retro`가 Skill 도구로 부를 수 있다.[](source:wfa-fm) 그림의 "안전장치 설치"는 `setup-pre-commit`(커밋 전 훅)과 `git-guardrails-claude-code`(명령 실행 전 훅)를 묶은 것이다. 전체 흐름은 `mattpocock/_group-env-improve/env-improve.html`에 있다. 관계 근거는 `mattpocock/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 둘 다 원본이다. 관계 확인을 위해 `chief-of-staff/SKILL.md`의 절차 줄, `writing-for-agents`, `setup-pre-commit`, `git-guardrails-claude-code`의 머리말을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준). r01, r03, r09의 출처 줄을 원문과 대조했고 원장과 같다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"심각도"를 어떻게 매기는지는 원문에 명시 없음. 범주 사이의 우선순위도 없다.
세션 로그가 이 컴퓨터의 어디에 있는지는 원문에 명시 없음. 하네스마다 다를 수 있다.
한 실수가 여러 범주에 걸칠 때(예: 자동 검사와 코딩 규칙) 어느 쪽으로 낼지는 원문에 명시 없음. 다만 코딩 규칙 범주는 기계적 위반을 검사로 보내라고 한다.[](source:retro-std)
