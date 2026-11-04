# swarm 스킬은 에이전트를 어떻게 바꾸나 {#swarm-skill}

`swarm`을 쓰면 에이전트는 일을 혼자 차례로 하지 않는다. 클라우드 작업자 N개를 한꺼번에 띄우고, 모두 끝나기를 기다린 뒤, 결과를 보고서 하나로 묶는다.[](source:skill-intro)

- 작업자는 서로 다른 slice(일을 나눈 한 조각)를 맡거나, 같은 지시로 race(같은 일을 여럿이 경쟁)하거나, 둘을 섞는다.[](source:skill-intro)[](source:skill-a)
- race라면, 에이전트는 결과를 고르는 규칙(`first pass`, `rank all`, `best-of`)을 작업자를 띄우기 전에 정한다.[](source:skill-a)
- 작업자는 `PASS`, `ISSUES`, `BLOCKED` 중 하나와 근거를 돌려준다.[](source:skill-b-brief)
- 에이전트는 결과가 없는 slice를 빈칸(gap)으로 남긴다. 빈칸은 통과로 세지 않는다.[](source:skill-c)

@answer scope="pstack/swarm · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/swarm/SKILL.md · 2949B · 본문(frontmatter)" path=pstack/swarm/SKILL.md lines=1:5
@source skill-intro title="pstack/swarm/SKILL.md · 목적" path=pstack/swarm/SKILL.md lines=9:9
@source skill-start title="pstack/swarm/SKILL.md · Start" path=pstack/swarm/SKILL.md lines=11:18
@source skill-a title="pstack/swarm/SKILL.md · Phase A 1~3" path=pstack/swarm/SKILL.md lines=20:24
@source skill-a-model title="pstack/swarm/SKILL.md · Phase A 4, 작업자 모델" path=pstack/swarm/SKILL.md lines=25:25
@source skill-a-out title="pstack/swarm/SKILL.md · Phase A 5, 출력과 SHA" path=pstack/swarm/SKILL.md lines=26:26
@source skill-b title="pstack/swarm/SKILL.md · Phase B 띄우기" path=pstack/swarm/SKILL.md lines=28:32
@source skill-b-brief title="pstack/swarm/SKILL.md · Phase B 지시문과 이탈" path=pstack/swarm/SKILL.md lines=34:36
@source skill-c title="pstack/swarm/SKILL.md · Phase C" path=pstack/swarm/SKILL.md lines=38:42
@source skill-d title="pstack/swarm/SKILL.md · Phase D" path=pstack/swarm/SKILL.md lines=44:46
@source pm-trigger title="pstack/poteto-mode/SKILL.md · swarm 호출 조건" path=pstack/poteto-mode/SKILL.md lines=23:23
@source setup-line title="pstack/setup-pstack/SKILL.md · swarm workers 줄" path=pstack/setup-pstack/SKILL.md lines=63:63
@source pb-mpp title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 실사용 검증" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=13:13
@source pb-mpp-run title="pstack/poteto-mode/playbooks/multi-phase-plan.md · swarm 실행 항목" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=65:66
@source pb-apf title="pstack/poteto-mode/playbooks/autopilot-full.md · 병합 전 검증" path=pstack/poteto-mode/playbooks/autopilot-full.md lines=8:8

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 그래서 사용자가 `/swarm`을 입력하거나, 다른 스킬이 진행 중에 부를 때 켜진다. `description`은 이 스킬이 어떤 일에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/swarm` 입력 |
| `poteto-mode` | 병렬 분산(조사 범위 나누기, race, gauntlet(연달아 통과해야 하는 시험), 탐색 분할)이 필요할 때[](source:pm-trigger) |
| Multi-phase plan 플레이북 | PR 헤드에서 실사용 검증 갈래 10개를 돌릴 때[](source:pb-mpp)[](source:pb-mpp-run) |
| Autopilot-full 플레이북 | 병합 전 매 회차마다 독립 검증 갈래를 돌려 판정 하나로 묶을 때[](source:pb-apf) |

**`arena`와 나누는 기준**: base(기반이 되는 후보)를 고르고 graft(진 후보의 장점을 base에 합치기)하는 설계·코드 경합은 `arena`가 맡는다. `swarm`은 고르기보다 나눠서 덮거나 빨리 끝내는 일에 쓴다.[](source:pm-trigger)

## 네 단계는 어떻게 이어지나 {#flow}

에이전트는 시작할 때 단계마다 한 줄씩 할 일 목록을 연다. 항목은 Frame, Fan out, Aggregate, Report 네 개다.[](source:skill-start)

@workflow id=swarm-flow title="swarm 단계 흐름"
| lane plan | 틀 잡기 |
| lane run | 띄우고 모으기 |
| shape | 모양은? | backend | plan |
| slice | slice 분할 | backend | plan |
| race | race | backend | plan |
| fan | 일괄 띄우기 | cloud | run |
| check | 기록 있나? | backend | run |
| retry | 1회 재실행 | backend | run |
| report | 보고 | frontend | run |
| shape > slice | 분할 | |
| shape > race | race | |
| slice > fan | | |
| race > fan | | |
| fan > check | | |
| check > report | 예 | emphasis |
| check > retry | 아니오 | |
| retry > report | 결과·빈칸 | dashed |

@steps id=swarm-steps
| s-shape | 모양은? | Phase A. 에이전트는 먼저 완료 조건과 돌려받을 산출물이나 보고서를 정한다. 그다음 slice로 나눌지, 같은 지시로 N개를 race시킬지, 둘을 섞을지 고른다. race나 혼합이면, 작업자를 띄우기 전에 `first pass`, `rank all`, `best-of` 중 하나를 선언한다. 혼합은 그림에서 생략했다. | swarm-flow | shape |
| s-slice | slice 분할 | 에이전트는 작업자마다 정확한 slice를 준다. 조사 범위가 목적이면, 필수 slice마다 결과가 있어야 한다. | swarm-flow | slice |
| s-race | race | 에이전트는 작업자에게 같은 지시를 준다. 모델 race라면, 갈래마다 모델을 미리 적는다. | swarm-flow | race |
| s-fan | 일괄 띄우기 | Phase B. 에이전트는 작업자 N개를 한 메시지에서 띄운다. 이때 `subagent_type: generalPurpose`, `environment: "cloud"`, `run_in_background: true`를 쓴다. 작업에 사용자 컴퓨터에 있는 것이 필요할 때만 `environment: "local"`을 쓴다. | swarm-flow | fan |
| s-check | 기록 있나? | Phase C. 에이전트는 결과가 지시문이 요구한 SHA와 측정 방법을 적었는지 본다. 빠졌으면, 그 결과를 버린다. | swarm-flow | check |
| s-retry | 1회 재실행 | 에이전트는 그 작업자를 한 번만 다시 띄운다. 두 번째도 빠지면, 빈칸으로 기록한다. | swarm-flow | retry |
| s-report | 보고 | Phase D. 에이전트는 채팅 안에 보고서 하나를 낸다. 보고서에는 결과 표, 근거가 붙은 한 줄짜리 문제, 빈칸과 dropout(결과를 못 낸 작업자), race 규칙을 담는다. | swarm-flow | report |

작업자가 결과를 아예 못 내고 빠지면, 에이전트는 N-1개로 진행하고 그 사실을 적는다.[](source:skill-b-brief) race라면, 미리 선언한 규칙을 그대로 적용한다.[](source:skill-c)

## 작업자 지시문에 무엇을 넣나 {#brief}

작업자에게 주는 지시문은, 그것만 읽어도 일할 수 있어야 한다.[](source:skill-b-brief)

| 넣을 것 | 조건 |
| --- | --- |
| 목표, 범위, 맡은 slice나 race 갈래, 검증 방법, 보고할 것 | 항상[](source:skill-b-brief) |
| 작업자 전용 쓰기 위치 | 작업자가 파일을 쓸 때[](source:skill-a-out) |
| 정확한 commit SHA | commit을 검증하거나 측정할 때[](source:skill-a-out) |
| 측정 방법(표본 수, 표본 하나의 정의, 순서) | 측정 지시일 때. 작업자는 SHA와 방법을 결과에 적는다[](source:skill-a-out) |
| `cloud_base_branch` | 기본이 아닌 push된 branch에서 시작해야 할 때[](source:skill-b) |

| 보고 상태 | 뜻 |
| --- | --- |
| `PASS` | 근거와 함께 통과 |
| `ISSUES` | 증명할 수 있는 결함이 있다. 첫 번째만이 아니라 증명할 수 있는 결함을 모두 적는다 |
| `BLOCKED` | 진행이 막혔다. 근거를 붙인다 |

세 상태와 `ISSUES` 규칙은 원문 그대로다.[](source:skill-b-brief) `PASS`와 `BLOCKED`의 정확한 판정 기준은 원문에 명시 없음.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| race·혼합이면 고르는 규칙을 띄우기 전에 선언한다[](source:skill-a) | 의무 |
| 작업자 N개를 한 메시지에서 띄운다[](source:skill-b) | 의무 |
| SHA·방법이 빠진 결과는 버리고 한 번만 다시 띄운다[](source:skill-c) | 의무 |
| 빈칸을 통과로 세지 않는다[](source:skill-c) | 금지 |
| 작업자 원문 출력을 보고서에 그대로 붙이지 않는다[](source:skill-c) | 금지 |

@facts
| 할 일 목록 항목 | 4개(Frame, Fan out, Aggregate, Report) |
| N의 뜻 | 전체 작업자 수. 클라우드 동시 실행 한도가 아니다 |
| N 정하기 | 사용자가 주거나, 모양에서 끌어낸다 |
| 기본 작업자 모델 | `grok-4.7-xhigh-fast` |
| 재실행 | 기록이 빠진 작업자당 1회 |
| 작업자 dropout | N-1개로 진행 |

에이전트는 작업자 모델을 `~/.cursor/rules/pstack-models.mdc`의 `swarm workers` 줄에서 읽는다.[](source:setup-line) 값이 `auto`나 `inherit-parent`면, `model`을 비우고 부모 모델을 쓴다. Task 도구가 모델 이름을 거부하면, 기본값을 쓰고 알린다. 기본값도 거부되면, 오류 메시지에 나온 같은 계열의 가장 가까운 이름을 쓴다.[](source:skill-a-model)

## 흐름 속 위치 {#position}

@workflow id=swarm-position title="swarm 앞뒤의 스킬"
| caller | poteto-mode | backend |
| swarm | swarm | backend |
| back | 플레이북 단계 | backend |
| caller > swarm | 작업 slice | |
| swarm > back | 보고서 1개 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 작업 slice | 보고서 1개 | 병렬 분산(범위 나누기, race, gauntlet, 탐색 분할) | r03 |
| `pstack-models.mdc`의 `swarm workers` 줄 | - | 줄이 없으면 기본 모델 | r33 |

`swarm`은 다른 pstack 스킬을 부르지 않는다. 플레이북에서 부르는 경우는 "언제 켜지나" 표에 있다. 전체 흐름은 `pstack/_group-design-review/design-review.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 폴더의 원본 텍스트 파일은 이것뿐이다.
- 호출 조건을 확인하려고 `poteto-mode`, `setup-pstack`, 플레이북 2개의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 이 페이지의 흐름은 모두 원문이 지시한 동작이다. `environment`, `cloud_base_branch` 같은 Task 매개변수는 Cursor 환경을 전제로 한다(판정).[](source:skill-b)

@callout level=open-question title="확인하지 못한 것"
`first pass`, `rank all`, `best-of`가 각각 정확히 어떻게 고르는지는 원문에 명시 없음.[](source:skill-a)
`description`에 나오는 gauntlet은 본문에서 따로 정의하지 않는다.[](source:skill-fm)
작업자가 dropout하면 N-1개로 진행하라고 한다.[](source:skill-b-brief) 반면 조사 범위가 목적이면 필수 slice마다 결과가 있어야 한다.[](source:skill-c) 판정: 필수 slice의 작업자가 dropout하면 그 slice는 빈칸이 되는 것으로 읽힌다. 다시 띄울지는 원문에 명시 없음.
