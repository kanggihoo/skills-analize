---
name: how
description: "Use for \"how does X work\", code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation."
disable-model-invocation: true
---

# How

코드베이스를 탐색해 "X는 어떻게 동작하는가?"라는 질문에 답합니다. 서브시스템에 새로 합류한 시니어 엔지니어가 작업 모델을 세울 수 있을 정도의 아키텍처 설명을 만듭니다. 주석이 달린 소스 코드처럼 읽힐 만큼 길게 쓰지는 않습니다.

아래의 각 spawn은 `pstack-models.mdc` 규칙의 역할 행을 가리키며, 기본값을 가집니다. `model`은 해당 행의 값으로 설정하고, 규칙이나 행이 없으면 기본값을 사용하세요. 값이 `auto` 또는 `inherit-parent`라면 `model`을 설정하지 마세요. Task 도구가 슬러그를 거부하면 기본값을 쓰고 그 사실을 말하세요. 기본값마저 거부되면, 오류 메시지에 나온 같은 계열에서 가장 가까운 유효 슬러그를 쓰세요.

## Step 1. Assess Complexity

범위가 모호하다면 해석한 내용을 밝히고 탐색하세요. 사용자는 방향을 바꿀 수 있습니다.

- **Simple**(단일 모듈, 작은 유틸리티, "함수 X는 어떻게 동작하나"처럼 좁은 질문): explorer를 쓰지 않습니다. explainer 하나가 한 번의 패스로 탐색하고 설명합니다. Step 2b로 가세요.
- **Complex**(여러 파일이나 서비스에 걸친 서브시스템, 교차 기능, 전체 아키텍처 개요): 병렬 explorer를 먼저 띄운 뒤 explainer에게 넘깁니다. Step 2a로 가세요.

판단이 애매하면 simple 경로를 택하세요.

## Step 2a. Explore (complex questions only)

질문을 서브시스템의 서로 다른 조각인 2~4개의 탐색 관점으로 나누세요. 모든 explorer를 하나의 메시지에서 한꺼번에 spawn하세요.

- `subagent_type`: `generalPurpose`
- `model`: `how explorer` 행의 값, 기본값 `grok-4.7-xhigh-fast`
- `readonly`: `true`

각 explorer는 `references/explorer-prompt.md`의 프롬프트를 받되, 자신의 관점을 채워 넣습니다. 그 다음 Step 3로 가세요.

## Step 2b. Direct Explain (simple questions)

탐색과 설명을 한 번에 수행하는 Task 서브에이전트 하나를 spawn하세요.

- `subagent_type`: `generalPurpose`
- `model`: `how explainer` 행의 값, 기본값 `claude-opus-5-5-max`
- `readonly`: `true`

프롬프트는 `references/explainer-prompt.md`에서 explorer 결과 섹션을 뺀 채로 만드세요. Step 4로 가세요.

## Step 3. Synthesize (complex questions only)

모든 explorer가 결과를 반환하면, 그 결과를 하나의 설명으로 합치는 Task 서브에이전트 하나를 spawn하세요.

- `subagent_type`: `generalPurpose`
- `model`: `how explainer` 행의 값, 기본값 `claude-opus-5-5-max`
- `readonly`: `true`

프롬프트는 `references/explainer-prompt.md`에서 모든 explorer의 결과를 채워 넣어 만드세요.

## Step 4. Present

explainer의 출력을 사용자에게 보여 주세요. 대화 맥락에 맞춰 명확성을 위한 가벼운 수정은 괜찮습니다. 실질적으로 다시 쓰지는 마세요.

## Output Format

설명은 `references/explainer-prompt.md`에 정의된 섹션을 사용합니다. 해당하지 않는 섹션은 뺍니다. Overview, Key Concepts, How It Works, Where Things Live, Gotchas입니다.
