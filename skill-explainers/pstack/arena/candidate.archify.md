# arena 스킬은 에이전트를 어떻게 바꾸나 {#arena-skill}

`arena`를 쓰면 에이전트는 한 번 시도한 결과를 그대로 내지 않는다. 같은 과제를 서브에이전트 N개에게 동시에 맡기고, 가장 나은 후보를 base(기반이 되는 후보)로 골라 나머지의 좋은 부분을 graft(진 후보의 장점을 base에 합치기)한다.[](source:skill-intro)

- 후보에게 줄 프롬프트가 계약이다. 채점 기준은 3~6개로 만들지만 후보에게는 보여 주지 않는다.[](source:skill-a)
- 후보가 모두 끝나면, 다른 모델 하나가 읽기 전용으로 후보를 교차 심사한다. 에이전트는 그와 별개로 모든 후보를 끝까지 읽고 고른다.[](source:skill-c)[](source:skill-d)
- 에이전트는 graft를 손으로 한다. 결과는 한 가지 사고 모형으로 읽혀야 한다.[](source:skill-e)
- 마지막에 합친 결과 하나와 짧은 종합 기록을 낸다.[](source:skill-out)

@answer scope="pstack/arena · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/arena/SKILL.md · 4973B · 본문(frontmatter)" path=pstack/arena/SKILL.md lines=1:5
@source skill-intro title="pstack/arena/SKILL.md · 목적" path=pstack/arena/SKILL.md lines=9:9
@source skill-start title="pstack/arena/SKILL.md · Start" path=pstack/arena/SKILL.md lines=11:20
@source skill-a title="pstack/arena/SKILL.md · Phase A" path=pstack/arena/SKILL.md lines=22:29
@source skill-a-runners title="pstack/arena/SKILL.md · 러너 고르기" path=pstack/arena/SKILL.md lines=28:28
@source skill-a-paths title="pstack/arena/SKILL.md · 출력 위치" path=pstack/arena/SKILL.md lines=29:29
@source skill-b title="pstack/arena/SKILL.md · Phase B" path=pstack/arena/SKILL.md lines=31:37
@source skill-c title="pstack/arena/SKILL.md · Phase C" path=pstack/arena/SKILL.md lines=39:41
@source skill-d title="pstack/arena/SKILL.md · Phase D" path=pstack/arena/SKILL.md lines=43:51
@source skill-e title="pstack/arena/SKILL.md · Phase E" path=pstack/arena/SKILL.md lines=53:59
@source skill-e-conv title="pstack/arena/SKILL.md · 수렴과 발산" path=pstack/arena/SKILL.md lines=61:61
@source skill-f title="pstack/arena/SKILL.md · Phase F" path=pstack/arena/SKILL.md lines=63:67
@source skill-out title="pstack/arena/SKILL.md · Outputs" path=pstack/arena/SKILL.md lines=69:71
@source pm-trigger title="pstack/poteto-mode/SKILL.md · arena 호출 조건" path=pstack/poteto-mode/SKILL.md lines=23:23
@source pm-oneway title="pstack/poteto-mode/SKILL.md · 되돌리기 어려운 결정" path=pstack/poteto-mode/SKILL.md lines=36:36
@source architect-b title="pstack/architect/SKILL.md · Phase B" path=pstack/architect/SKILL.md lines=31:33
@source br-trigger title="pstack/blast-radius/SKILL.md · arena 호출" path=pstack/blast-radius/SKILL.md lines=38:38
@source fio-trigger title="pstack/figure-it-out/SKILL.md · 두 번째 arena" path=pstack/figure-it-out/SKILL.md lines=30:30
@source setup-lines title="pstack/setup-pstack/SKILL.md · arena 줄" path=pstack/setup-pstack/SKILL.md lines=61:62
@source pb-feature title="pstack/poteto-mode/playbooks/feature.md · 구현 위임" path=pstack/poteto-mode/playbooks/feature.md lines=12:12
@source pb-eval title="pstack/poteto-mode/playbooks/eval.md · 후보와 심사" path=pstack/poteto-mode/playbooks/eval.md lines=20:21
@source pb-orch title="pstack/poteto-mode/playbooks/orchestrate.md · Frame" path=pstack/poteto-mode/playbooks/orchestrate.md lines=60:60

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/arena`를 입력하거나, 다른 스킬이 진행 중에 부를 때 켜진다. `description`의 "arena this" 같은 표현은 어떤 요청에 맞는지 보여 주는 예다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/arena` 입력 |
| `poteto-mode` | base 선택과 graft가 필요한 설계·코드 경합. 단순 병렬 분산은 `swarm` 몫이다[](source:pm-trigger) |
| `architect` | Phase B. 설계 스케치 과제를 맡긴다[](source:architect-b) |
| `blast-radius` | 크거나 넓은 변경일 때만. 여러 모델에 같은 질문을 던져 답을 합친다[](source:br-trigger) |
| Feature 플레이북 | 구현 모양이 여러 가지로 가능할 때 구현 위임을 `arena`로 한다(의무형)[](source:pb-feature) |
| Eval 플레이북 | 후보 생성은 Phase B, 심사는 Phase C를 그대로 쓴다[](source:pb-eval) |
| Orchestrate 플레이북 | 분해 방식에 이견이 있거나 되돌리기 어려운 결정일 때[](source:pb-orch) |

**쓰지 않는 경우**: 이미 정해진 설계에 `arena`를 두 번째로 돌리는 것은 과설계다.[](source:pm-oneway)[](source:fio-trigger)

## 여섯 단계는 어떻게 이어지나 {#flow}

시작할 때 단계마다 한 줄씩 할 일 목록을 연다. 항목은 Frame, Fan out, Cross-judge, Pick, Graft, Verify 여섯 개다.[](source:skill-start)

@workflow id=arena-flow title="arena 단계 흐름"
| frame | 틀 잡기 | backend |
| fan | 후보 N개 | backend |
| judge | 교차 심사 | security |
| pick | base 고르기 | backend |
| graft | graft | backend |
| verify | 검증 | backend |
| done | 합친 결과 | frontend |
| frame > fan | 같은 프롬프트 | |
| fan > judge | 완료 후 | |
| fan > pick | 직접 읽기 | |
| judge > pick | 추천 | dashed |
| pick > graft | | |
| graft > verify | | |
| verify > done | 통과 | emphasis |

@steps id=arena-steps
| s-frame | 틀 잡기 | Phase A. 에이전트가 후보가 만들 산출물을 정한다. 이 과제의 성공 모습을 채점할 수 있는 기준 3~6개로 바꾼다. runner 모델을 고르고, 후보마다 출력 위치를 따로 준다. | arena-flow | frame |
| s-fan | 후보 N개 | Phase B. 에이전트가 서브에이전트 N개를 한 메시지에서 `run_in_background: true`로 띄운다. 서브에이전트는 각자 과제, 공유 근거 자료 경로, 자기 출력 경로를 받고, 산출물과 짧은 근거를 낸다. 근거에는 검토하고 버린 대안을 적는다. | arena-flow | fan |
| s-judge | 교차 심사 | Phase C. 모든 후보가 끝난 뒤, 에이전트가 심사 모델 하나를 읽기 전용으로 띄운다. 심사 담당은 채점 기준과 경로 이름만 보고 기준별로 점수를 매겨서 base를 추천한다. 후보가 아직 쓰는 중이면 띄우지 않는다. | arena-flow | judge |
| s-pick | base 고르기 | Phase D. 에이전트가 모든 후보를 끝까지 읽는다. 전체 느낌이 아니라 기준별로 채점하고, 그 점수를 심사 결과와 비교한다. 에이전트와 심사 담당의 의견이 갈리면, 어느 한쪽이 치우쳤거나 기준이 모호한 것이다. 두 근거를 모두 읽고 정한다. | arena-flow | pick |
| s-graft | graft | Phase E. 에이전트가 진 후보를 한 번 더 훑어서 가져올 것을 찾는다. 보통 후보당 한두 가지다. 기계적으로 붙여 넣지 않고 손으로 base에 녹여 넣는다. | arena-flow | graft |
| s-verify | 검증 | Phase F. 합친 결과도 다른 산출물과 같은 수준으로 검증한다. 검증에서 `arena`가 못 잡은 문제가 나오면, Phase A가 틀렸거나(틀을 다시 잡고 재실행) graft를 놓친 것이다(Phase E로 복귀). 덮고 넘어가지 않는다. 이 되돌림은 그림에서 생략했다. | arena-flow | verify |

교차 심사는 후보와 동시에 돌지 않는다. 에이전트가 Phase D에서 후보를 읽는 동안 함께 돈다.[](source:skill-c)

## 결과가 몰리거나 흩어지면 어떻게 하나 {#converge}

| 상황 | 해야 할 일 |
| --- | --- |
| 후보 하나가 산출물을 내지 못했다 | N-1개로 진행하고 종합 기록에 dropout(결과를 못 낸 후보)을 적는다[](source:skill-b) |
| 후보 N개가 같은 모양으로 모였다 | 강한 합의 신호다. 기록에 수렴을 적고 그 모양을 낸다. graft는 필요 없다[](source:skill-e-conv) {good:graft 생략} |
| 후보 N개가 크게 흩어졌다 | Phase A가 부족했던 것이다. 평균 내지 말고 틀을 다시 잡아 재실행한다[](source:skill-e-conv) {bad:평균 금지} |
| 에이전트와 심사 담당이 다른 후보를 골랐다 | 두 근거를 모두 읽고 정한다[](source:skill-d) |
| 두 후보가 비슷하다 | 경계가 더 깔끔하거나 API가 더 작은 쪽을 고른다. Laziness Protocol 원칙을 따른다[](source:skill-d) |

base를 고르는 기준은 "나중에 유지보수하는 사람이 불변식을 깨지 않고 가장 쉽게 확장할 수 있는가"다.[](source:skill-d)

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 후보는 모두 같은 프롬프트를 받는다. 채점 기준은 고르는 쪽만 쓴다[](source:skill-a) | 의무 |
| 후보마다 출력 위치를 따로 준다(worktree, 안 되면 `/tmp/arena-<slug>/candidate-<n>/`)[](source:skill-a-paths) | 의무 |
| 서브에이전트 N개를 한 메시지에서 백그라운드로 띄운다[](source:skill-b) | 의무 |
| 심사 담당은 부모와 다른 모델 계열을 고른다[](source:skill-c) | 권고 |
| 후보가 쓰는 중에 심사 담당을 띄우지 않는다[](source:skill-c) | 금지 |
| 고르기 전에 모든 후보를 끝까지 읽는다[](source:skill-d) | 의무 |
| graft를 기계적으로 붙여 넣지 않는다[](source:skill-e) | 금지 |
| 검증에서 나온 문제를 덮고 넘어가지 않는다[](source:skill-f) | 금지 |

@facts
| 할 일 목록 항목 | 6개(Frame부터 Verify까지) |
| 채점 기준 수 | 3~6개 |
| 기본 runner | `claude-opus-5-5-max`, `gpt-5.6-sol-max`, `grok-4.7-xhigh-fast` 한 개씩 |
| 심사 담당 수 | 1개, 읽기 전용 |
| graft할 것 | 진 후보당 보통 한두 가지 |
| 후보 dropout | N-1개로 진행 |

runner는 `~/.cursor/rules/pstack-models.mdc`의 `arena runners` 줄에서 읽는다. 심사 담당은 같은 파일의 `arena cross-judge pool` 줄에서 하나 고른다.[](source:setup-lines) 값이 `auto`나 `inherit-parent`이면, `model`을 비워서 부모 모델을 쓴다.

Task 도구가 설정 값을 거부하면, 그 자리를 같은 계열(`claude-*`, `gpt-*`, `grok-*`) 기본값으로 바꾸고 그 사실을 알린다. 맞는 계열이 없으면 `claude-opus-5-5-max`를 쓴다.[](source:skill-a-runners)

N은 고정값이 아니다. 설계 방향 여러 개를 다루면 후보를 더 띄우고, 판단보다 생성량이 중요한 일이면 같은 모델을 N번 쓴다.[](source:skill-a-runners)

## 무엇을 남기나 {#outputs}

| 산출물 | 담는 것 |
| --- | --- |
| 합친 산출물 1개 | base에 graft를 녹인 결과 |
| 종합 기록 1개 | base와 고른 이유, 교차 심사 판정, graft한 것과 출처 후보, 버린 것과 이유, dropout한 후보, 검증 결과 |

종합 기록은 기반 산출물 옆에 둔다.[](source:skill-d)[](source:skill-out) `architect`가 부를 때는 이 기록이 근거 문서의 Synthesis decision 절을 채운다.[](source:architect-b)

## 흐름 속 위치 {#position}

@workflow id=arena-position title="arena 앞뒤의 스킬"
| caller | 부른 스킬 | backend |
| arena | arena | backend |
| back | 부른 스킬로 복귀 | backend |
| caller > arena | 같은 과제 | |
| arena > back | 합친 결과 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 과제 | 합친 결과 | base 선택·graft가 필요한 경합 | r04 |
| `architect`의 설계 과제와 근거 자료 | 설계 후보와 graft한 결과 | Phase B, 폐기 후 다시 | r62 |
| `blast-radius`의 질문 | 합친 답 | 크거나 넓은 변경일 때만 | r50 |
| `pstack-models.mdc`의 `arena runners`, `arena cross-judge pool` 줄 | - | 줄이 없으면 기본 모델 | r32 |

`arena`는 다른 pstack 스킬을 부르지 않는다. 원칙 스킬 참고는 r65에 있다. 전체 흐름은 `pstack/_group-design-review/design-review.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 폴더의 원본 텍스트 파일은 이것뿐이다.
- 호출 조건을 확인하려고 `poteto-mode`, `architect`, `blast-radius`, `figure-it-out`, `setup-pstack`, 플레이북 3개의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 스킬 문서가 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
설계 방향이 여러 개일 때 후보를 몇 개 더 띄울지는 원문에 명시 없음.[](source:skill-a-runners)
심사 담당은 부모와 다른 계열을 고르라고 한다. 그런데 기본 runner가 세 계열을 모두 쓰므로 심사 담당은 늘 어떤 후보와 같은 계열이 된다. 이 겹침을 어떻게 다룰지는 원문에 명시 없음.[](source:skill-a-runners)[](source:skill-c)
Phase F의 검증 방법은 원칙 스킬(prove-it-works)에 맡긴다. 산출물이 설계 스케치일 때 무엇을 검증으로 볼지는 원문에 명시 없음.[](source:skill-f)
