---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects your available models and writes an always-applied rule that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

`~/.cursor/rules/pstack-models.mdc`를 작성한다. 역할별로 pstack의 모델을 정하는 항상 적용되는 규칙이다.

## 단계

### 1. 사용 가능한 모델 감지하기

이 세션에서 `Task` 하위 에이전트에 전달할 수 있는 모델 슬러그를 나열한다. 이것이 신뢰할 수 있는 출처다. Cursor가 사용자가 쓸 자격이 있는 모델을 나열하는 모델 API나 CLI도 노출한다면, 완전성을 위해 그것을 우선 사용한다. 하나도 감지할 수 없다면 사용자에게 접근 가능한 슬러그를 붙여 넣어 달라고 요청한다. 사용 가능한지 확인하지 않은 실제 슬러그는 절대 쓰지 않는다. 별칭 `inherit-parent`와 `auto`는 감지된 슬러그가 아니어도 항상 유효하다.

### 2. 현재 상태 불러오기

기본 역할-모델 매핑은 아래 5단계의 규칙 형태다. `~/.cursor/rules/pstack-models.mdc`가 이미 있다면 읽고, 그 `# budget` 줄과 역할 값을 현재 선택으로 취급한다. 없다면 기본값에서 시작한다. 5단계에 없는 역할(예: `how critics`)의 줄은 폐기된 역할에서 온 것이므로 버린다.

### 3. 예산 정하기, 매핑하기, 확인받기

**(a) 예산 묻기.** 자유 입력보다 AskQuestion을 우선 사용한다. 다음 네 가지 옵션을 정확히 이 라벨로 제시하고, 규칙에 현재 예산이 기록되어 있다면 그것을 명시한다.

- `unlimited — keep max`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) 적용하기.** 스킬 기본값으로 작업 표를 만든다. 재실행 시에는 사용자가 계열, 목록, 또는 별칭(`inherit-parent`, `auto`)으로 바꾼 역할을 유지한다. `unlimited`는 모든 노력 수준을 그 표에 있는 대로 둔다. `large`, `medium`, `small`은 모든 실제 슬러그의 노력 토큰을 `xhigh`, `high`, `medium`으로 설정한다. 패널 항목도 포함한다. 노력 토큰은 마지막 토큰이거나, 끝의 `fast` 바로 앞 토큰이다. 사다리는 `max` > `xhigh` > `high` > `medium` > `low`다. 결과가 감지된 슬러그가 아니라면, 같은 계열에서 목표 이하의 노력 수준을 가진 감지된 슬러그 중 가장 높은 것을 쓴다. 그런 것이 없으면 역할에 선택이 필요하다고 표시한다. `inherit-parent`와 `auto`는 바뀌지 않는다. 따라서 `small`은 `claude-opus-5-5-max`를 `claude-opus-5-5-medium`으로, `grok-4.7-xhigh-fast`를 `grok-4.7-medium-fast`로 바꾼다.

**(c) 역할을 보여 주고 확인받기.** 모든 역할과 그 모델을 보여 준다. 감지된 집합에 없는 실제 슬러그에는 선택이 필요하다고 표시한다. 또한 2단계에서 버려진 줄을 모두 나열한다. 그대로 수락할지, 특정 역할을 바꿀지 묻는다. 선택지는 감지된 모델과 `inherit-parent`, `auto`다(둘 다 뜻은 이 역할이 부모 채팅 모델에서 실행된다는 것이며, Auto 사용자가 Auto에 머무는 방식이다). 자유 입력보다 AskQuestion을 우선 사용한다. 패널 역할(arena runner, architect runner, interrogate reviewer)의 값은 목록이며, 목록의 각 항목마다 하위 에이전트 하나가 실행된다. 별칭 항목도 포함하며, 목록 길이가 실행 수를 정한다. `arena cross-judge pool`도 목록이지만, Arena는 그중에서 부모와 모델 계열이 다른 값을 가능하면 하나 고른다. `swarm workers`는 경주나 비교가 워커마다 다른 모델을 지정하지 않는 한 모든 워커의 기본 모델이다.

### 4. 검증하기

작성되는 모든 실제 슬러그는 감지된 집합에 있어야 한다. `inherit-parent`와 `auto`는 항상 통과한다. 선택한 실제 슬러그를 쓸 수 없다면 중단하고 다시 묻는다.

### 5. 규칙 작성하기

`~/.cursor/rules/pstack-models.mdc`를 `alwaysApply: true`로 작성한다. 선택한 라벨과 목표 노력 수준을 담은 `# budget` 줄 하나, 그리고 역할마다 줄 하나를 둔다. 라벨은 poteto-mode가 쓰는 것과 같은 것을 쓴다. 재실행해도 결과가 같도록 파일 전체를 덮어쓴다. 형태는 다음과 같다.

```
---
description: pstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Task `model`). Alias entries in a panel list still count toward its fan-out.
# budget: unlimited (max)
feature, refactoring: grok-4.7-xhigh-fast
bug-fix: grok-4.7-xhigh-fast
perf-issue: grok-4.7-xhigh-fast
hillclimb: grok-4.7-xhigh-fast
judgment and prose: claude-opus-5-5-max
hardest tasks: claude-opus-5-5-max
how explorer: grok-4.7-xhigh-fast
how explainer: claude-opus-5-5-max
why investigators: grok-4.7-xhigh-fast
why synthesizer: claude-opus-5-5-max
reflect tooling: gpt-5.6-sol-max
reflect judgment, divergent, synthesizer: claude-opus-5-5-max
arena runners: claude-opus-5-5-max, gpt-5.6-sol-max, grok-4.7-xhigh-fast
arena cross-judge pool: claude-opus-5-5-max, gpt-5.6-sol-max, grok-4.7-xhigh-fast
swarm workers: grok-4.7-xhigh-fast
architect runners: claude-opus-5-5-max, gpt-5.6-sol-max, grok-4.7-xhigh-fast
interrogate reviewers: claude-opus-5-5-max, gpt-5.6-sol-max, grok-4.7-xhigh-fast
```

### 6. 확인하기

규칙을 작성했고 새 세션부터 적용된다고 사용자에게 알린다. 이 스킬을 다시 실행하면 규칙이 갱신된다.

### 7. 검증 스킬 제안하기(선택)

프로젝트에 증명을 위해 실제 앱을 구동할 방법(`verify-*` 스킬 또는 기존 하네스)이 있는지 확인한다. 없다면 한 번 제안한다. "에이전트가 사용자처럼 앱을 조작해서 변경이 작동함을 증명할 수 있도록 프로젝트 로컬 검증 스킬을 원하나요? /create-verification-skill로 만들어 드릴 수 있습니다." 예라고 하면 `/create-verification-skill`을 호출한다(pstack이 설치된 위치, 즉 워크스페이스, 사용자, 또는 플러그인에서 해석된다). 아니요라고 하면 강요하지 않고 넘어간다.
