# chief-of-staff 스킬은 에이전트를 어떻게 바꾸나 {#chief-of-staff-skill}

`chief-of-staff`를 쓰면 에이전트는 긴 목표 하나를 맡은 책임자가 된다. 일은 서브에이전트(subagent)에게 맡기고, 자신은 기억을 위키에 쌓으며 작업 환경을 계속 고친다.[](source:cos-role)[](source:cos-sub)[](source:cos-wiki)

- 두 갈래로 동시에 생각한다. 지금 일을 끝내는 전술(tactical)과, 다음 일이 더 잘되게 환경을 바꾸는 전략(strategic)이다.[](source:cos-role)
- 모든 일은 서브에이전트가 한다. 지시와 보고는 짧게 하고, 위키 페이지나 commit 같은 컨텍스트 포인터(context pointer)로 주고받는다.[](source:cos-sub)
- 위키는 "지금 이렇다"가 아니라 날짜와 commit을 붙인 기록으로 쓴다.[](source:cos-hist)
- 서브에이전트 세션 약 5개 중 1개는 `retro` 절차로 돌아본다. 이 절차는 `../retro/SKILL.md` 파일을 읽어 따른다.[](source:cos-retro)

@answer scope="mattpocock/chief-of-staff · 원본 텍스트 파일 2개 · 커밋 0f0d1b0 · 실행하지 않음, 지시상 동작만"
@meta locale=ko
@source cos-fm title="mattpocock/chief-of-staff/SKILL.md · 4729B · frontmatter" path=mattpocock/chief-of-staff/SKILL.md lines=1:5
@source cos-yaml title="mattpocock/chief-of-staff/agents/openai.yaml · 184B · 호출 정책" path=mattpocock/chief-of-staff/agents/openai.yaml lines=1:5
@source cos-role title="mattpocock/chief-of-staff/SKILL.md · 역할과 두 갈래" path=mattpocock/chief-of-staff/SKILL.md lines=7:12
@source cos-sched title="mattpocock/chief-of-staff/SKILL.md · Schedules" path=mattpocock/chief-of-staff/SKILL.md lines=14:16
@source cos-sub title="mattpocock/chief-of-staff/SKILL.md · Subagents" path=mattpocock/chief-of-staff/SKILL.md lines=18:24
@source cos-wiki title="mattpocock/chief-of-staff/SKILL.md · Wiki 위치와 구성" path=mattpocock/chief-of-staff/SKILL.md lines=26:32
@source cos-ops title="mattpocock/chief-of-staff/SKILL.md · Ingest, Query, Lint" path=mattpocock/chief-of-staff/SKILL.md lines=34:38
@source cos-hist title="mattpocock/chief-of-staff/SKILL.md · Write history, not the present" path=mattpocock/chief-of-staff/SKILL.md lines=40:47
@source cos-hist-ex title="mattpocock/chief-of-staff/SKILL.md · 커밋 인용 예시" path=mattpocock/chief-of-staff/SKILL.md lines=45:45
@source cos-proc title="mattpocock/chief-of-staff/SKILL.md · Procedures 도입" path=mattpocock/chief-of-staff/SKILL.md lines=49:51
@source cos-retro title="mattpocock/chief-of-staff/SKILL.md · Retro 절차" path=mattpocock/chief-of-staff/SKILL.md lines=53:53
@source cos-large title="mattpocock/chief-of-staff/SKILL.md · 큰 작업 절차" path=mattpocock/chief-of-staff/SKILL.md lines=54:54
@source cos-strat title="mattpocock/chief-of-staff/SKILL.md · Strategic View" path=mattpocock/chief-of-staff/SKILL.md lines=56:75
@source cos-first title="mattpocock/chief-of-staff/SKILL.md · 환경 개선 먼저" path=mattpocock/chief-of-staff/SKILL.md lines=58:58
@source cos-relent title="mattpocock/chief-of-staff/SKILL.md · 모든 메시지마다" path=mattpocock/chief-of-staff/SKILL.md lines=75:75
@source retro-step1 title="mattpocock/retro/SKILL.md · 4369B · Step 1" path=mattpocock/retro/SKILL.md lines=11:11
@source retro-step4 title="mattpocock/retro/SKILL.md · Step 4" path=mattpocock/retro/SKILL.md lines=25:25
@source lock-cos title="mattpocock/skills-lock.json · chief-of-staff 원격 경로" path=mattpocock/skills-lock.json lines=4:9
@source lock-retro title="mattpocock/skills-lock.json · retro 원격 경로" path=mattpocock/skills-lock.json lines=36:41

## 언제 켜지나 {#trigger}

@code source=cos-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:cos-fm) 사용자가 `/chief-of-staff`를 입력해야 켜진다. `description`은 사람이 읽는 한 줄 요약이다.

@code source=cos-yaml language=yaml

`agents/openai.yaml`도 `allow_implicit_invocation: false`로 같은 제한을 건다.[](source:cos-yaml) 이 저장소의 다른 스킬 중 `chief-of-staff`를 부르는 스킬은 없다(원장 기준).

| 이럴 때 쓴다 | 이럴 때는 맞지 않는다 |
| --- | --- |
| 한 세션을 오래 열어 두고 긴 목표 하나를 끌고 갈 때[](source:cos-role) | 한 번에 끝나는 작은 질문 {caution:판정} |
| 일을 서브에이전트에 나눠 맡길 수 있는 하네스(harness)일 때[](source:cos-sub) | 백그라운드 서브에이전트가 없는 환경 {caution:판정} |

판정: 오른쪽 칸은 원문이 직접 말하지 않는다. 원문이 서브에이전트와 긴 세션을 전제로 하므로 그 전제가 없으면 절반이 빠진다.[](source:cos-role)[](source:cos-sub)

## 요청 하나를 어떻게 처리하나 {#flow}

에이전트는 이 일의 직접 책임자(Directly Responsible Individual)다. 평소보다 훨씬 긴 시야로 생각해도 된다고 원문이 허락한다.[](source:cos-role)

@workflow id=cos-turn title="chief-of-staff 요청 처리 흐름"
| msg | 사용자 메시지 | frontend |
| env | 환경 개선 검토 | backend |
| query | 위키 조회 | database |
| sub | 서브에이전트 | backend |
| ingest | 위키 반영 | database |
| pick | 회고할까? | backend |
| retro | 회고 실행 | backend |
| msg > env | 먼저 | emphasis |
| env > query | | |
| query > sub | | |
| sub > ingest | 보고 | |
| ingest > pick | | |
| pick > retro | 약 5분의 1 | |

@steps id=cos-steps
| s-msg | 사용자 메시지 | 백그라운드 서브에이전트를 쓰므로 에이전트는 일하는 동안에도 사용자와 계속 대화한다. 모든 메시지를 환경 개선을 찾을 계기로 삼는다. | cos-turn | msg |
| s-env | 환경 개선 검토 | 어떤 일이든 **먼저** 에이전트가 일하는 환경을 어떻게 고칠지 생각한다. 무엇을 보는지는 아래 표에 있다. | cos-turn | env |
| s-query | 위키 조회 | 결정을 내리기 전에 `index.md`와 그것이 가리키는 페이지를 읽는다. 새로 만든 답이 남길 만하면 페이지로 남긴다. | cos-turn | query |
| s-sub | 서브에이전트 | 일은 서브에이전트가 한다. 매번 새 컨텍스트 창(context window)으로 띄우고, 포인터로 짧게 지시한다. | cos-turn | sub |
| s-ingest | 위키 반영 | 오래 갈 사실(결정, 사용자의 정정, 서브에이전트의 발견)을 알게 되면 관련 페이지 모두와 `index.md`를 고친다. | cos-turn | ingest |
| s-pick | 회고할까? | 서브에이전트 세션 약 5개 중 1개를 고른다. 문제가 있던 세션을 먼저 고른다. | cos-turn | pick |
| s-retro | 회고 실행 | `retro`의 `SKILL.md`를 읽어 따른다. 마지막 단계(사용자에게 제시) 대신 에이전트가 직접 고르고 실행한다. | cos-turn | retro |

판정: 원문은 이 순서를 한 목록으로 주지 않는다. "먼저 환경을 본다", "결정 전에 위키를 읽는다", "배우면 반영한다", "약 5분의 1을 회고한다"를 이어 붙인 것이다.[](source:cos-first)[](source:cos-ops)[](source:cos-retro)

| 전략 관점의 세 축 | 원문이 드는 예 |
| --- | --- |
| 저절로 성공하는 환경(pit of success) | 아주 좁게 제한된 API와 함수, 정확성을 강제하는 린트 규칙, 리뷰어가 모범 사례를 강제하게 해 주는 `CODING_STANDARDS.md`[](source:cos-strat) |
| 데이터 출처(data sources) | 개발 서버 같은 핵심 프로세스의 로그(또는 운영 로그), 테스트 DB 접근, 필요할 때 클릭과 스크린숏을 위한 브라우저 접근[](source:cos-strat) |
| 우회책 금지(no workarounds) | 일회성 우회책이나 정해진 절차를 건너뛰는 꼼수를 두지 않는다. 관례에서 벗어난 곳은 기능 작업 **전에** 먼저 고친다[](source:cos-strat) |

원문은 환경 개선에 "집요하라(relentless)"고 쓰고, 모든 사용자 메시지를 개선점을 찾을 구실로 삼으라고 한다.[](source:cos-relent)

일정(schedule)은 하네스가 허락하면 반복 일정을 **제안**한다. 위키 점검(Lint)도 일정으로 제안하라고 한다.[](source:cos-sched)[](source:cos-ops) 일정을 직접 만든다는 말은 원문에 명시 없음.

## 서브에이전트와 위키는 어떻게 다루나 {#memory}

| 규칙 | 원문의 강도 |
| --- | --- |
| 모든 일은 서브에이전트에서 한다. 자기 컨텍스트 창을 지킨다[](source:cos-sub) | 권고(should) |
| 백그라운드 에이전트를 써서 사용자와 대화를 이어 간다[](source:cos-sub) | 의무(명령형) |
| 서브에이전트는 매번 새 컨텍스트 창으로 시작한다[](source:cos-sub) | 의무(명령형) |
| 주고받는 말은 짧게. 연구 메모, 이전 commit, 위키 페이지 같은 포인터로 전한다[](source:cos-sub) | 권고(should) |
| 포인터로 볼 수 있는 정보를 다시 적지 않는다[](source:cos-sub) | 금지 |
| 위키 위치: 사용자나 다른 에이전트가 쓰는 공용 위키를 먼저 찾고 그 관례를 따른다. 없을 때만 첫 쓰기 **전에** 사용자와 위치를 정한다[](source:cos-wiki) | 의무, 사람 개입 |
| 이슈, PR, 대화 기록 같은 원자료는 위키에 복사하거나 고치지 않고 인용만 한다[](source:cos-wiki) | 금지 |

@tree id=cos-wiki-tree title="위키 폴더 구성"
| root | 위키 폴더 | - |
| index | index.md | root |
| decision | 결정 | root |
| problem | 반복 문제 | root |
| subsystem | 하위 시스템 | root |
| pref | 사용자 선호 | root |

`index.md`는 모든 페이지를 링크와 한 줄 요약으로 나열하고, 범주별로 묶는다. 나머지 페이지는 하나가 한 가지만 다루고, 관련 페이지끼리 서로 링크한다.[](source:cos-wiki) 위키가 필요한 이유는 압축(compaction) 때문이다. 컨텍스트에만 있는 지식은 압축 때 사라지고, 위키가 그것을 다음 세션에 넘긴다.[](source:cos-wiki)

| 작업 | 언제 | 하는 일 |
| --- | --- | --- |
| 반영(Ingest) | 오래 갈 사실을 배웠을 때 | 새 페이지만 만들지 않고 닿는 페이지 모두와 `index.md`를 고친다[](source:cos-ops) |
| 조회(Query) | 결정을 내리기 전 | `index.md`와 가리키는 페이지를 읽는다. 남길 만한 답은 페이지로 만든다[](source:cos-ops) |
| 점검(Lint) | 주기적으로 | 모순, 고아 페이지, 빠진 링크, 새 자료가 뒤집은 주장을 찾는다. 일정으로 제안한다[](source:cos-ops) |

**"현재가 아니라 기록을 쓴다"**는 위키 문장 규칙이다. 위키는 코드를 따라잡을 수 없으므로 지금 상태를 말하지 않는다.[](source:cos-hist)

- 모든 주장에 날짜를 붙인다. 원문 예: `On 2026-10-13, Matt decided...`.[](source:cos-hist)
- 코드에 대한 주장에는 그 주장이 참이던 commit과 저장소를 붙인다. 원문 예시는 `mattpocock/skills@abc1234` 시점에 `retro`가 1단계에서 `writing-for-agents`를 불러온다는 문장이다.[](source:cos-hist-ex)
- 코드에 대해 "currently", "now", "is"를 날짜나 commit 없이 쓰지 않는다.[](source:cos-hist)
- 바뀐 것은 날짜를 붙인 새 주장으로 추가하고, 옛 주장은 대체됨으로 표시한다. 옛 문장을 고쳐 쓰지 않는다.[](source:cos-hist)

## 다른 스킬의 절차는 어떻게 쓰나 {#procedures}

일부 절차는 옆에 설치된 다른 스킬에 있다. 에이전트는 이 스킬 폴더 기준 상대 경로로 그 `SKILL.md`를 **읽고 따른다**. Skill 도구로 부르는 것이 아니다.[](source:cos-proc)

| 절차 | 경로 | 조건 | 이 저장소에서 |
| --- | --- | --- | --- |
| 회고 | `../retro/SKILL.md` | 서브에이전트 세션 약 5개 중 1개. `implement-spec`이 띄운 세션도 포함. 문제가 생긴 세션부터 고른다. `retro`의 마지막 단계 대신 에이전트가 직접 후보를 골라 실행한다[](source:cos-retro) | `mattpocock/retro`에 있다 {good:범위 내} |
| 큰 작업 | `../to-spec/SKILL.md` → `../to-tickets/SKILL.md` → `../implement-spec/SKILL.md` | 명세를 쓰고, 티켓으로 나누고, 둘 다 이슈 트래커에 올린 뒤 구현한다[](source:cos-large) | 세 폴더가 없다 {bad:불명} |

`retro`의 마지막 단계는 "후보를 심각도 순으로 사용자에게 제시"다.[](source:retro-step4) `chief-of-staff` 안에서는 이 사람 확인 단계가 빠지고 에이전트가 결정한다. 판정: 회고로 찾은 환경 변경이 사용자 확인 없이 진행될 수 있다.[](source:cos-retro)[](source:retro-step4)

`retro`는 1단계에서 Skill 도구로 `writing-for-agents`를 부른다.[](source:retro-step1) 그래서 `chief-of-staff`가 회고를 따라가면 `writing-for-agents`도 함께 쓰게 된다. 판정: 이것은 `chief-of-staff`가 직접 지시한 것이 아니라 `retro` 원문을 따른 결과다.

@callout level=open-question title="확인하지 못한 것"
`to-spec`, `to-tickets`, `implement-spec` 폴더가 이 저장소에 없다. 그래서 큰 작업 절차의 내용은 확인하지 못했다(원장 r02, 불명).
회고를 에이전트가 직접 하는지 서브에이전트에게 맡기는지는 원문에 명시 없음. "모든 일은 서브에이전트에서"라는 규칙과 어떻게 맞물리는지도 알 수 없다.[](source:cos-sub)[](source:cos-retro)
원격 저장소에서는 `chief-of-staff`가 `skills/in-progress/`, `retro`가 `skills/engineering/`에 있다.[](source:lock-cos)[](source:lock-retro) 원문은 "옆에 설치된" 스킬을 전제하므로, 설치 위치가 다르면 `../retro/SKILL.md`가 풀리지 않을 수 있다. 이 저장소에서는 두 폴더가 나란히 있어 풀린다.
종료 조건은 원문에 명시 없음. 목표를 다 이루면 어떻게 끝내는지 적혀 있지 않다.

## 흐름 속 위치 {#position}

@workflow id=cos-position title="chief-of-staff 앞뒤의 스킬"
| user | 사용자 | frontend |
| cos | chief-of-staff | backend |
| retro | retro | backend |
| spec | to-spec 외 | external |
| user > cos | 긴 목표 | |
| cos > retro | 파일로 읽기 | emphasis |
| cos > spec | 큰 작업 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자 | 긴 목표 | - | 사용자가 `/chief-of-staff` 입력 | - |
| `retro` | 개선 후보 | 서브에이전트 세션 기록 | 약 5개 중 1개. 마지막 단계는 에이전트가 대신 결정 | r01 |
| `to-spec`, `to-tickets`, `implement-spec` | 원문에 명시 없음 | 명세, 티켓 | 큰 작업일 때. 대상 폴더 없음 | r02(불명) |
| `writing-for-agents` | - | - | 위키 문장 예시에 이름만 등장. 실행 지시가 아님 | r10 |

전체 흐름은 `mattpocock/_group-env-improve/env-improve.html`에 있다. 관계 근거는 `mattpocock/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 둘 다 원본이다. 관계 확인을 위해 `retro/SKILL.md`의 1·4단계 줄과 `skills-lock.json`의 해당 항목을 읽었다.
- 제외한 파일: `SKILL.KO.stale.md`. 원본이 바뀐 뒤 남은 낡은 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준). r01, r02, r10의 출처 줄을 원문과 대조했고 원장과 같다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.
