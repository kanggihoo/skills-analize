---
name: arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
disable-model-invocation: true
---

# Arena

같은 과제에 대해 N개의 병렬 시도를 펼친다. 모든 후보를 처음부터 끝까지 읽는다. 가장 강한 것을 기반으로 고른다. 나머지에서 가장 좋은 아이디어를 그 기반에 접목한다. 종합 결과를 검증한다.

## 시작

무엇이든 실행하기 전에 단계마다 항목 하나씩 todolist를 연다.

1. Frame
2. Fan out
3. Cross-judge
4. Pick
5. Graft
6. Verify

## Phase A: 틀 잡기 (Frame)

N개의 후보는 같은 프롬프트를 받으므로, 프롬프트가 계약이다.

1. 각 후보가 만들어야 할 산출물을 명시한다.
2. 평가 기준(rubric)을 도출한다. *이* 과제에서 성공이 무엇인지 말한 다음, 이를 3~6개의 구체적이고 채점 가능한 기준으로 바꾼다. 평가 기준은 Phase D에서 고르는 사람이 쓰는 도구다. 후보들은 과제만 본다.
3. 러너를 고른다. `~/.cursor/rules/pstack-models.mdc`의 `arena runners` 줄을 쓴다. 규칙이나 그 줄이 없으면 `claude-opus-5-5-max`, `gpt-5.6-sol-max`, `grok-4.7-xhigh-fast`를 각각 한 번씩 기본으로 쓴다. 이 줄이나 cross-judge 줄의 `auto` 또는 `inherit-parent` 항목은 부모 모델을 뜻하므로, 그 항목에는 `model`을 생략한다. Task 도구가 설정된 항목을 거부하면 그 자리는 해당 계열의 기본 모델로 실행하고, 그렇다고 밝힌다. 계열은 접두사로 구분한다: `claude-*`, `gpt-*`, `grok-*`. 일치하는 계열이 없으면 `claude-opus-5-5-max`를 쓴다. 기본값을 거부하면 오류 메시지에 나온, 같은 계열의 가장 가까운 유효 slug를 쓴다. 아레나가 여러 설계 방향을 다루면 더 많이 띄운다. 작업이 판단보다 생성에 치우쳐 있다면 같은 모델을 N번 쓴다.
4. 출력 경로를 배정한다. 각 후보는 자기만의 위치에 쓴다(가능하면 git worktree, 아니면 `/tmp/arena-<slug>/candidate-<n>/`). **separate-before-serializing-shared-state** 원칙 스킬에 따른다.

## Phase B: 병렬 실행 (Fan out)

N개의 하위 에이전트를 모두 한 메시지에서 `run_in_background: true`로 띄운다. 각각에 과제, 공유 근거의 경로, 자기 출력 경로, 그리고 산출물과 짧은 근거를 함께 만들라는 지시를 준다.

각 근거는 후보가 고려한 대안과 기각한 것을 명시한다.

Phase B 후보가 출력을 만들지 못하면 N-1개로 진행하고, 이탈(dropout)을 종합 기록에 적는다.

## Phase C: 교차 심사 (Cross-judge)

Phase B의 모든 후보가 끝나면, `~/.cursor/rules/pstack-models.mdc`의 `arena cross-judge pool` 줄에서 모델 하나를 고른다. 규칙이나 그 줄이 없으면 `claude-opus-5-5-max`, `gpt-5.6-sol-max`, `grok-4.7-xhigh-fast` 중에서 고른다. 부모와 다른 모델 계열을 우선한다. 그 모델로 읽기 전용 심사 하위 에이전트 하나를 띄운다. 심사관은 평가 기준과 후보 경로 라벨을 보고, 기준마다 점수를 매기고, 근거와 함께 기반을 추천한다. 심사는 Phase D에서 부모가 읽는 것과 병렬로 실행되며, 후보와 병렬로 실행하는 것이 아니다. 후보가 아직 쓰고 있는 동안에는 심사관을 띄우지 마라.

## Phase D: 기반 고르기 (Pick a base)

고르기 전에 모든 후보를 처음부터 끝까지 읽는다.

모든 후보를 평가 기준에 따라 기준별로 점수 매긴다. 전체적인 느낌으로 평가하지 마라. 교차 심사와 비교한다. 기반에 대한 의견이 일치하면 선택이 확인된다. 의견이 갈리면 누군가 편향되었거나 평가 기준이 모호했던 것이다. 결정하기 전에 두 근거를 모두 읽어라.

미래의 유지보수자가 불변식을 깨뜨리지 않고 가장 쉽게 확장할 수 있는 후보를 기반으로 고른다. 두 후보가 비슷하면 Laziness Protocol에 따라 더 깔끔한 경계나 더 작은 API를 택한다.

선택과 그 이유를 기반 산출물 옆의 짧은 종합 노트에 기록한다. 교차 심사의 판정도 포함한다.

## Phase E: 접목 (Graft)

지는 후보를 한 번 더 훑고, 기반에 옮겨 올 가치가 있는 것을 찾는다. 신호는 보통 후보마다 대부분이 아니라 한두 가지다.

각 접목은 **redesign-from-first-principles** 원칙 스킬에 따라 손으로 통합한다. 기계적으로 붙여 넣지 마라. 결과는 하나의 멘탈 모델 아래에서 일관되어야 한다.

무엇을 접목했는지, 어느 후보에서 왔는지, 무엇을 왜 기각했는지 기록한다.

N개의 후보가 같은 형태로 수렴하면 강한 합의 신호다. 수렴을 기록에 적고 합의된 형태를 그대로 낸다. 접목은 필요 없다. N개의 후보가 완전히 갈라지면 Phase A가 충분히 명세되지 않은 것이다. 차이를 평균내지 말고, 틀을 다시 잡고 다시 실행하라.

## Phase F: 검증 (Verify)

종합된 산출물은 다른 어떤 산출물과 같은 정밀한 검토를 견뎌야 한다. **prove-it-works** 원칙 스킬에 따른다.

검증에서 아레나가 잡지 못한 문제가 드러나면, Phase A가 잘못되었거나(틀을 다시 잡고 다시 실행) 한 후보가 그것을 잡았는데 당신이 접목을 놓친 것이다(Phase E로 돌아간다). 덮어 두지 마라.

## 산출물

하나의 종합 산출물. 그리고 그 옆에 짧은 종합 노트 하나. 노트에는 기반, 접목(출처 후보 포함), 기각, 이탈(있다면), 검증 결과를 적는다.
