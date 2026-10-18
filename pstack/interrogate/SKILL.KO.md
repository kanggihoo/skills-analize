---
name: interrogate
description: "Use for \"interrogate\", \"adversarial review\", \"multi-model review\", \"challenge this\", \"stress test this code\", \"find blind spots\", or \"tear this apart\". Multiple LLM reviewers challenge changes from independent angles."
disable-model-invocation: true
---

# Interrogate

설정된 모델마다 리뷰어 한 명씩을 spawn해 코드 변경을 적대적으로 리뷰합니다. 각 모델은 같은 프롬프트와 루브릭을 받습니다. 적대적 신호는 할당된 페르소나가 아니라 모델의 다양성에서 나옵니다.

결과물은 종합된 판정입니다. 변경 사항을 자동으로 적용하지 마세요.

## Step 1, Determine Scope

맥락에서 리뷰 대상을 파악하세요.

- 사용자가 특정 파일이나 diff를 가리키면 그것을 사용하세요.
- 기능 브랜치에 있다면, 전체 변경 집합을 위해 `git diff main...HEAD`(또는 적절한 기준 브랜치)를 실행하세요.
- 사용자의 메시지가 최근 작업을 언급하면, 관련 파일을 모으세요.

리뷰어가 코드를 이해하는 데 필요한 주변 맥락 파일과 함께 diff(또는 파일 내용)를 묶으세요.

## Step 2, State the Intent

리뷰어를 spawn하기 전에 의도를 명시적으로 밝히세요. 다음에서 도출하세요.

- 사용자의 메시지
- 커밋 메시지
- PR 설명(있다면)
- 코드 자체

명확한 단락 하나로 쓰세요. 의도가 불확실하다면, 진행하기 전에 사용자에게 물어보세요.

## Step 3, Spawn Reviewers

Task 도구로 모든 리뷰어를 하나의 메시지에서 한꺼번에 실행하세요. `~/.cursor/rules/pstack-models.mdc`의 `interrogate reviewers` 행을 사용하고, 항목마다 리뷰어 한 명씩 배치하세요. 아래의 Reviewer A/B/C 라벨을 설정된 항목 수에 맞게 늘이거나 줄이세요. 규칙이나 해당 행이 없다면 표의 기본값을 사용하세요.

| Subagent | Default model |
|----------|---------------|
| Reviewer A | `claude-opus-5-5-max` |
| Reviewer B | `gpt-5.6-sol-max` |
| Reviewer C | `grok-4.7-xhigh-fast` |

각 리뷰어에 대해:
- `subagent_type`: `generalPurpose`
- `model`: 설정된 `interrogate reviewers` 항목의 값이며, 설정 행이 없다면 표의 기본값입니다. `auto` 또는 `inherit-parent` 항목이라면 `model`을 생략해 해당 리뷰어가 부모 모델에서 실행되도록 하세요.
- `readonly`: `true`

Task 도구가 설정된 항목을 거부하면, 그 리뷰어는 같은 계열의 표 기본값으로 실행하고 그 사실을 말하세요. 계열은 접두사로 구분합니다. `claude-*`, `gpt-*`, `grok-*`입니다. 계열이 일치하지 않으면 Reviewer A의 기본값을 사용하세요. 표의 기본값마저 거부되면, Task 도구의 오류 메시지에서 유효한 슬러그를 확인하고, 가장 가까운 대체 모델을 고르세요(같은 계열에서 추론 등급이 가장 높은 것을 선호합니다). 그 모델로 spawn하고, 기본 표를 업데이트하는 별도의 PR을 여세요. 슬러그 문제로 리뷰를 막지 마세요. 별칭(alias) 항목을 거부된 슬러그로 취급하거나 두 가지 대체 방식 중 어느 것이라도 적용하지 마세요.

`references/reviewer-prompt.md`를 읽고 템플릿을 다음으로 채우세요.
1. 명시된 의도
2. diff 또는 파일 내용
3. `references/rubric.md`의 리뷰 루브릭
4. `references/code-quality-review.md`의 코드 품질 렌즈

같은 채워진 템플릿을 모든 리뷰어에게 보내므로, 모든 모델이 코드 품질 렌즈를 똑같이 적용합니다.

## Step 4, Synthesize

결과가 돌아오는 대로 통합된 그림을 만드세요.

1. **모든 리뷰어의 발견 사항을 파싱하세요.**
2. **합의를 찾으세요.** 2개 이상의 모델이 독립적으로 제기한 발견 사항이 가장 신호가 강합니다.
3. **단일 모델의 발견 사항을 확인하세요.** 여전히 읽을 가치는 있지만, 그에 맞게 비중을 낮추세요.
4. **중복을 제거하세요.** 서로 다른 모델이 같은 문제를 다르게 설명할 수 있습니다. 이를 합치고, 어느 모델이 제기했는지 적으세요.
5. **불일치를 기록하세요.** 한 모델이 무엇인가를 지적했는데 다른 모델이 명시적으로 정반대로 말한다면, 그것은 판정에 유용한 맥락입니다.

## Step 5, Lead Judgment

당신은 중립적인 취합자가 아니라, 실용적인 시니어 엔지니어인 리드 리뷰어입니다.

전체 프레임워크는 `references/lead-judgment.md`를 읽으세요.

모든 발견 사항을 다음 버킷으로 분류하세요.

- **Act on**. 실제 목표에 비추어 정확성, 보안, 유지 관리성에 영향을 주는 실제 문제입니다. 실제 PR을 막을 만한 것들입니다.
- **Consider**. 타당한 지적이지만, 지금 해결하는 비용이 그만한 가치가 있을지 확신할 수 없는 것들입니다. 사용자의 주의를 받을 만합니다.
- **Noted**. 기술적으로는 맞지만 실행할 만하지 않은 것들입니다. 맥락에 따라 다르거나, 조기 최적화이거나, 현재 단계에서 영향이 작은 것들입니다.
- **Dismissed**. 틀렸거나, 사소하거나, 맥락이 빠진 것들입니다. 왜 기각하는지 짧게 설명하세요.

각 발견 사항에 대해 다음을 포함하세요.
- 어떤 모델(들)이 제기했는지
- 분류(act on / consider / noted / dismissed)
- 분류에 대한 한 줄 근거

## Output Format

판정은 다음 구조로 제시하세요.

### Intent
> [Step 2의 명시된 의도 단락]

### Reviewers
- Reviewer [label]: [model name], [N findings] (리뷰어마다 한 줄씩)

### Act On
[해결해야 할 발견 사항. 각각에 대해 설명, 제기한 모델, 중요한 이유.]

### Consider
[생각해 볼 만한 발견 사항. 각각에 대해 설명, 제기한 모델, 관련된 트레이드오프.]

### Noted
[타당하지만 우선순위가 낮은 것. 간단한 목록.]

### Dismissed
[기각된 발견 사항과 짧은 근거.]

### Agreement Map
[어디에서 모델들이 일치했고, 어디에서 갈라졌으며, 그 일치와 불일치의 패턴이 무엇을 말해 주는가?]
