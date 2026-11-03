# 환경 개선 묶음(env-improve)은 어떻게 이어지나 {#env-improve-group}

긴 목표를 밀고 가면서 에이전트가 일하는 환경을 계속 고치는 스킬 세 개다. `chief-of-staff`가 허브이고, 세션 일부를 `retro`로 돌아보며, `retro`는 문서 기준을 `writing-for-agents`에서 가져온다.[](source:cos-retro)[](source:retro-s1)

- `chief-of-staff`는 서브에이전트 세션 약 5개 중 1개에 `retro`를 쓴다. Skill 도구가 아니라 `../retro/SKILL.md`를 읽어 따른다.[](source:cos-retro)
- `retro`는 1단계에서 Skill 도구로 `writing-for-agents`를 부른다.[](source:retro-s1)
- 호출 방식이 다른 이유는 `disable-model-invocation` 필드다. 이 필드가 있는 스킬은 다른 스킬이 부를 수 없다.[](source:mech-user)
- 단독 `retro`는 후보를 사용자에게 내놓고 끝난다. `chief-of-staff` 안에서는 에이전트가 직접 고르고 실행한다.[](source:retro-s4)[](source:cos-retro)

@answer scope="mattpocock/env-improve 묶음 · 스킬 3개의 원본과 관계 대상 머리말 · 커밋 0f0d1b0 · 관계는 relations.md의 rel-id 기준"
@meta locale=ko
@source cos-fm title="mattpocock/chief-of-staff/SKILL.md · 4729B · frontmatter" path=mattpocock/chief-of-staff/SKILL.md lines=1:5
@source cos-role title="mattpocock/chief-of-staff/SKILL.md · 두 갈래" path=mattpocock/chief-of-staff/SKILL.md lines=9:12
@source cos-wiki title="mattpocock/chief-of-staff/SKILL.md · Wiki" path=mattpocock/chief-of-staff/SKILL.md lines=28:32
@source cos-ops title="mattpocock/chief-of-staff/SKILL.md · Ingest, Query, Lint" path=mattpocock/chief-of-staff/SKILL.md lines=34:38
@source cos-ex title="mattpocock/chief-of-staff/SKILL.md · 위키 문장 예시" path=mattpocock/chief-of-staff/SKILL.md lines=45:45
@source cos-proc title="mattpocock/chief-of-staff/SKILL.md · Procedures 도입" path=mattpocock/chief-of-staff/SKILL.md lines=51:51
@source cos-retro title="mattpocock/chief-of-staff/SKILL.md · Retro 절차" path=mattpocock/chief-of-staff/SKILL.md lines=53:53
@source cos-large title="mattpocock/chief-of-staff/SKILL.md · 큰 작업 절차" path=mattpocock/chief-of-staff/SKILL.md lines=54:54
@source cos-strat title="mattpocock/chief-of-staff/SKILL.md · Strategic View" path=mattpocock/chief-of-staff/SKILL.md lines=58:62
@source retro-fm title="mattpocock/retro/SKILL.md · 4369B · frontmatter" path=mattpocock/retro/SKILL.md lines=1:5
@source retro-s1 title="mattpocock/retro/SKILL.md · Step 1" path=mattpocock/retro/SKILL.md lines=11:11
@source retro-s2 title="mattpocock/retro/SKILL.md · Step 2" path=mattpocock/retro/SKILL.md lines=13:13
@source retro-checks title="mattpocock/retro/SKILL.md · Automated checks" path=mattpocock/retro/SKILL.md lines=18:18
@source retro-std title="mattpocock/retro/SKILL.md · Coding standards" path=mattpocock/retro/SKILL.md lines=19:19
@source retro-s4 title="mattpocock/retro/SKILL.md · Step 4" path=mattpocock/retro/SKILL.md lines=25:25
@source retro-files title="mattpocock/retro/SKILL.md · Files" path=mattpocock/retro/SKILL.md lines=41:44
@source wfa-fm title="mattpocock/writing-for-agents/SKILL.md · 10886B · frontmatter" path=mattpocock/writing-for-agents/SKILL.md lines=1:4
@source mech-model title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · 2629B · model-invoked" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=9:9
@source mech-user title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · user-invoked" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=10:10
@source mech-shared title="mattpocock/writing-for-agents/SKILL-MECHANICS.md · 공유 참고 자료" path=mattpocock/writing-for-agents/SKILL-MECHANICS.md lines=14:14
@source cos-yaml title="mattpocock/chief-of-staff/agents/openai.yaml · 184B" path=mattpocock/chief-of-staff/agents/openai.yaml lines=4:5
@source retro-yaml title="mattpocock/retro/agents/openai.yaml · 146B" path=mattpocock/retro/agents/openai.yaml lines=4:5
@source wfa-yaml title="mattpocock/writing-for-agents/agents/openai.yaml · 102B" path=mattpocock/writing-for-agents/agents/openai.yaml lines=1:3
@source spc-fm title="mattpocock/setup-pre-commit/SKILL.md · 2258B · frontmatter만 확인" path=mattpocock/setup-pre-commit/SKILL.md lines=1:4
@source gg-fm title="mattpocock/git-guardrails-claude-code/SKILL.md · 2313B · frontmatter만 확인" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=1:4

## 누가 누구를 부르나 {#flow span=12}

@workflow id=env-flow title="env-improve 묶음 호출 관계"
| cos | chief-of-staff | backend |
| retro | retro | backend |
| wfa | writing-for-agents | backend |
| spec | to-spec 외 | external |
| cos > retro | 파일 읽기 | emphasis |
| retro > wfa | Skill 도구 | emphasis |
| cos > spec | 불명 | dashed |

@steps id=env-steps
| s-cos | chief-of-staff | 사용자가 `/chief-of-staff`로 긴 목표를 맡기면 시작한다. 목표를 서브에이전트로 추진하고, 위키에 기록을 쌓고, 매 요청마다 환경 개선을 먼저 찾는다. | env-flow | cos |
| s-retro | retro | 사용자가 `/retro`로 단독 실행할 수도 있다. 세션 기록에서 일곱 범주의 환경 개선 후보를 찾아 심각도 순으로 낸다. | env-flow | retro |
| s-wfa | writing-for-agents | 개선 내용을 스킬이나 `AGENTS.md` 같은 문서로 쓸 때의 기준을 준다. | env-flow | wfa |
| s-spec | to-spec 외 | 큰 작업이면 명세, 티켓, 구현 스킬을 파일로 읽어 따른다. 세 폴더가 이 저장소에 없다. | env-flow | spec |

각 스킬의 내부 단계는 `mattpocock/chief-of-staff/chief-of-staff.html`, `mattpocock/retro/retro.html`, `mattpocock/writing-for-agents/writing-for-agents.html`에 있다.

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r01 | `chief-of-staff` → `retro` | 내부 위임 | 서브에이전트 세션 약 5개 중 1개, 문제가 있던 세션 먼저. `SKILL.md`를 파일로 읽어 따른다. 마지막 단계는 `chief-of-staff`가 대신한다[](source:cos-retro) | 파일 읽기 간선 |
| r02 | `chief-of-staff` → `to-spec`, `to-tickets`, `implement-spec` | 내부 위임 | 큰 작업이면 명세 → 티켓 → 이슈 트래커 게시 → 구현. 대상 폴더 없음[](source:cos-large) | 점선(불명) |
| r03 | `retro` → `writing-for-agents` | 내부 위임 | 1단계에서 Skill 도구로 호출(의무형). 참고 절에서도 이 기준을 따르라고 한다[](source:retro-s1)[](source:retro-files) | Skill 도구 간선 |
| r10 | `chief-of-staff` → `writing-for-agents` | 참고 | 위키 문장 예시에 이름만 나온다. 실행 지시가 아니다[](source:cos-ex) | 생략(예시) |
| r09 | `retro` → `setup-pre-commit`, `git-guardrails-claude-code` | 산출물 호환 | 추론. "안전장치 없음" 후보를 실행하는 도구가 될 수 있다. 이름으로 부르지 않는다[](source:retro-checks)[](source:spc-fm)[](source:gg-fm) | 생략(묶음 밖, 추론) |

`chief-of-staff`가 회고를 따라가면 `retro`의 1단계 때문에 `writing-for-agents`도 함께 쓰게 된다. 판정: 이 연결은 `chief-of-staff` 원문에는 없고 `retro` 원문을 거쳐 생긴다.[](source:cos-retro)[](source:retro-s1)

## 왜 호출 방식이 둘로 나뉘나 {#invocation}

| 스킬 | `disable-model-invocation` | `openai.yaml` 정책 | 다른 스킬이 Skill 도구로 부를 수 있나 |
| --- | --- | --- | --- |
| `chief-of-staff` | `true`[](source:cos-fm) | `allow_implicit_invocation: false`[](source:cos-yaml) | 없음 {bad:불가} |
| `retro` | `true`[](source:retro-fm) | `allow_implicit_invocation: false`[](source:retro-yaml) | 없음 {bad:불가} |
| `writing-for-agents` | 필드 없음[](source:wfa-fm) | `policy` 항목 없음[](source:wfa-yaml) | 있음 {good:가능} |

`writing-for-agents`의 `SKILL-MECHANICS.md`가 이 차이의 규칙을 적는다. 사용자 호출형 스킬은 사람이 이름을 입력해야만 켜지고, 다른 스킬은 부를 수 없다.[](source:mech-user) 모델 호출형 스킬은 다른 스킬이 부를 수 있고, 여러 스킬이 쓰는 참고 자료를 한 곳에 둘 수 있다.[](source:mech-model)

판정: 그래서 `chief-of-staff`는 `retro`를 Skill 도구로 부를 수 없고, 옆 폴더의 `SKILL.md`를 파일 경로로 읽는다(r01).[](source:cos-proc) `writing-for-agents`는 필드가 없어 `retro`가 Skill 도구로 부른다(r03).[](source:retro-s1) 파일로 읽는 방식은 "사용자 호출형끼리 나눌 자료는 스킬 체계 밖의 일반 파일로 둔다"는 규칙과 같은 해법이다.[](source:mech-shared)

| 상황 | 회고 후보를 누가 고르나 | 사람 확인 |
| --- | --- | --- |
| 사용자가 `/retro` 입력 | 사용자. `retro`는 심각도 순으로 내놓고 끝난다[](source:retro-s4) | 있음 {good:사람 선택} |
| `chief-of-staff` 안에서 회고 | `chief-of-staff`가 직접 고르고 실행한다[](source:cos-retro) | 원문에 명시 없음 {caution:확인 빠짐} |

## 어떤 파일을 함께 쓰고 읽나 {#shared-state}

| 파일·장소 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 위키 폴더(`index.md`와 페이지들) | `chief-of-staff`(반영, 점검)[](source:cos-ops) | `chief-of-staff`(결정 전 조회)[](source:cos-ops) |
| 세션 기록 | 원문에 명시 없음(서브에이전트 실행으로 생긴다) | `retro` 2단계[](source:retro-s2) |
| `CLAUDE.md` / `AGENTS.md` | `retro`가 후보로 제안, `chief-of-staff`가 후보를 실행할 수 있음(판정)[](source:retro-files)[](source:cos-retro) | 이 저장소의 모든 에이전트[](source:retro-files) |
| `CODING_STANDARDS.md` | 위와 같음. `chief-of-staff` 전략 관점도 이 파일을 예로 든다[](source:cos-strat) | 리뷰 에이전트(리뷰 때만)[](source:retro-files) |
| 린트 규칙, pre-commit 훅, CI 작업 | `retro`는 후보만 낸다. 기계적 위반은 문서보다 이쪽이 기본값이다[](source:retro-std) | 원문에 명시 없음 |
| 이슈 트래커 | `chief-of-staff`(명세·티켓 게시)[](source:cos-large) | `implement-spec`(폴더 없음, 불명) |

위키는 `chief-of-staff`만 다룬다. `retro`가 위키를 읽거나 쓴다는 내용은 원문에 명시 없음.[](source:cos-wiki) 판정: 회고로 알게 된 사실을 위키에 남기는 일은 `chief-of-staff`의 반영 규칙(오래 갈 사실을 배우면 반영)으로 이어진다.[](source:cos-ops)

`writing-for-agents`는 어떤 파일도 쓰지 않는다. 위 표의 `CLAUDE.md`, `AGENTS.md`, 스킬을 쓸 때 기준이 된다.[](source:wfa-fm)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 3개의 `SKILL.md`, `writing-for-agents/SKILL-MECHANICS.md`, 세 스킬의 `agents/openai.yaml`. 관계 확인을 위해 `setup-pre-commit`, `git-guardrails-claude-code`의 머리말을 읽었다. 모두 원본이다.
- 제외한 파일: `chief-of-staff/SKILL.KO.stale.md`, `retro/SKILL.KO.md`. 번역본이다.
- 원문 비교: r01, r02, r03, r09, r10의 출처 줄을 원문과 대조했다. 종류와 조건이 원장과 같다.
- 원장의 묶음 표는 `to-spec` 외 세 스킬을 "범위 밖"이라 부르지만, 관계 행 r02의 해석 상태는 "불명"이다. 이 페이지는 r02를 따라 불명으로 적었다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`to-spec`, `to-tickets`, `implement-spec`의 내용은 확인하지 못했다. 폴더가 이 저장소에 없다(r02).
`chief-of-staff` 안에서 회고를 에이전트가 직접 하는지 서브에이전트에게 맡기는지는 원문에 명시 없음.
