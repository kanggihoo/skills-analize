---
name: egm-resolve
license: Apache-2.0
disable-model-invocation: true
description: >-
  Elephant 해결(resolution) 스킬이다. 동시에 실행된 Goldfish reviewer들이 만든 평면 deficiency report를 수집하고, UI 객관식 게이트를 통해 PROPOSE FIX 항목에 자동 수정을 적용하며, 협상(negotiation)과 재동기화(re-sync) 체크포인트를 대화형으로 제시한다.
---

# Goldfish Review: Resolve

Codex 또는 ChatGPT Work에서 실행할 때는 먼저 [Codex integration](../../docs/codex.md)을 읽는다.
Claude Code 또는 Cowork에서는 먼저 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 읽는다.

## Overview

이 스킬은 agent가 primary Elephant context window 안에서 동작하며, 동시에 실행된 Goldfish reviewer들의 평면 deficiency report를 파싱하도록 지시한다. 설계 결정을 정확하게 방어하고, 자동 텍스트 수정을 적용하며, 대화형 협상 체크포인트를 관리한다.

## Prerequisites & Context Strategy

*   **Context Recommendation (Elephant Memory)**: 이 스킬은 대상 문서를 생성한 지속 대화 세션(Elephant)에서 실행하는 것을 권장한다. 이전 추론을 떠올려 더 높은 품질의 수정을 만들기 위해서다.

## Inputs

호출자 또는 오케스트레이션 driver는 정확히 다음 파라미터를 제공한다.

*   **`TargetFile`**: 대상 문서의 절대 경로 또는 상대 경로.
*   **`LineRange`**: 정확한 줄 번호(또는 `full file`).
*   **`FindingsList`**: Goldfish reviewer들이 취합한 평면 finding 목록.

## Execution Workflow

### Step 1: Intake Validation & Gather Context

1.  **Hybrid Execution UX**: 실행 인자가 있는지 확인한다.

    *   *Automated Mode*: 모든 파라미터가 주어지면 subprocess로 조용히 실행한다.
    *   *Standalone Human Mode*: 파라미터가 빠져 있으면 친절한 onboarding 흐름을 시작한다. 입력은 한 번에 하나씩 묻고, 사용자의 응답을 받은 뒤 다음 입력으로 넘어간다. 모든 입력이 정해지면 최종 설정을 보여 주고, 사용자가 계속 진행할 준비가 되었는지 확인한다.

2.  `TargetFile`을 `LineRange`에서 읽고 `FindingsList`를 파싱한다.

### Step 2: Evaluate & Categorize

각 finding에 카테고리를 정확히 하나씩 부여한다.

*   **CONTEST**: 비판이 부정확하거나 코드베이스를 잘못 이해한 데서 나왔다. reviewer가 읽을 수 있는 증거를 제시한다. 파일과 symbol, 또는 문서에 기록된 결정을 가리킨다.
*   **ESCALATE**: 비판은 부정확하지만, 증거가 reviewer가 읽을 수 있는 모든 파일 밖에 있다(예: 팀 컨벤션이나 구두 결정). 이 사실을 명시한다. finding은 수정하지 않고 사용자에게 넘긴다.
*   **PROPOSE FIX**: 비판이 타당하다. gap을 해소하기 위한 정확한 텍스트 치환 또는 구조적 서식 조정을 정의한다.
*   **DECLINE**: finding이 Nit이다. 기록만 하고 수정하지 않는다. Nit이라도 수정할 가치가 있으면 PROPOSE FIX를 쓸 수 있다.

다음 규칙을 적용한다.

*   **Contest는 검증 가능해야 한다.** "의도된 것이다"는 증거가 아니다. reviewer가 읽을 수 있는 증거를 제시할 수 없다면 ESCALATE 또는 PROPOSE FIX를 쓴다.
*   **reviewer를 만족시키려고 맥락을 추가하지 않는다.** 맥락은 문서의 사람 독자에게 필요할 때 추가한다. zero-context subagent만 필요로 한다면 ESCALATE를 쓴다.
*   **이해 부족을 contest하지 않는다.** 새로 읽는 독자가 문서를 따라가지 못하면 문서에 맥락이 빠진 것이다.
*   **severity를 바꾸지 않는다.** Blocker가 실제로는 Nit이라고 생각하면 CONTEST하고 이유를 밝힌다.
*   당신이 검토 대상 문서를 작성했다. contest하고 싶다는 마음이 reviewer가 틀렸다는 증거는 아니다.

### Step 3: Report Fixes

최종 보고서를 작성해 `goldfish_review_report.md`라는 이름으로 저장한다. 저장 위치는 작업 디렉터리이고, harness에 artifact 디렉터리가 있으면 그곳이다. 파일 쓰기 도구를 사용한다. 다음 레이아웃을 쓴다.

```markdown
# Goldfish Annotated Review Report

**Target:** `[TargetFile]` (`[LineRange]`)

## Prioritized Findings & AI Suggestions

{{range findings, ordered by Severity}}
### [Issue 1] [`[ReviewerPersona]`] - Severity: [Blocker | Major | Nit]
*   **Affected Scope:** [Lines Start-End]([RelativePath]#L[Start]-L[End]) ([Sub-header])
*   **Discrepancy Description:** [copied from FindingsList]
*   **Rationale:** [copied from FindingsList]
*   ***AI Suggestion:*** [CONTEST | ESCALATE | PROPOSE FIX | DECLINE]
*   ***Justification:*** [Detailed reason]
*   ***Proposed Edit:***
    *   Location: [Line/Header]
    *   Change: [Precise replacement string or deletion note]
{{end}}
```

### Step 4: Interactive Resolution Gate

`ESCALATE` finding이 하나라도 있으면 채팅 메시지에서 그 finding들을 먼저 나열한다. 이 항목들은 승인만 필요한 것이 아니라 사용자의 지식이 필요하다.

진행하기 전에 사용자에게 보이는 채팅 메시지를 출력한다: *"audit finding을 `goldfish_review_report.md`에 정리했다. 파일에서 finding을 검토한 뒤 진행 방식을 고른다.

-   **Comment directly on the file**: `goldfish_review_report.md`를 채팅 또는 파일에서 검토하고, 댓글이나 수정으로 특정 항목을 승인, 거절, 또는 contest한다.
-   **Auto accept**: "auto accept"라고 답하면 제안된 수정을 일괄 적용한다(contest된 항목은 건너뛴다).
-   **Continue to next phase**: "continue" 또는 "no changes"라고 답하면 수정을 적용하지 않고 다음 단계로 넘어간다.
-   **Interactive breakdown**: "interactive breakdown"이라고 답하면 채팅에서 항목별 안내를 받는다. 각 제안된 수정이나 contest된 finding에 대한 자세한 설명을 보고 결정한다.
-   **Custom instruction / Wildcard request**: 임의의 지시, 질문, 또는 범위 밖 요청을 답으로 보낼 수 있다."*

이 턴에서는 **도구를 0개 호출**하여 즉시 실행을 멈춰야 한다. 실행을 멈추고 대기 상태로 들어가, 사람 개발자가 artifact에 댓글을 달거나 채팅으로 답하기를 기다린다.

사용자의 행동은 다음과 같이 해석한다.

-   **"Auto accept" / "Accept all suggestions" / 사용자가 contest 없이 "Proceed"를 누름**: `PROPOSE FIX`로 표시된 모든 수정을 `TargetFile`의 `LineRange`에 파일 편집 도구로 한 번의 batch로 적용한다. `CONTEST`, `ESCALATE`, `DECLINE`으로 분류된 항목은 명시적으로 건너뛴다. 그 다음 Step 5로 진행한다.
-   **"Continue to next phase" / "No changes"**: 자동 수정을 전혀 적용하지 않는다. 그 다음 Step 5로 진행한다.
-   **"Interactive breakdown"**: `DECLINE`을 제외한 모든 finding 항목을 대상으로 순차 breakdown 루프에 들어간다.

    1.  각 항목 `i`에 대해 전체 finding 세부 사항과 설명을 rich markdown으로 정리한 채팅 메시지를 출력한다:

        ```markdown
        ### Breakdown Item [i]: [Issue Title] [`[ReviewerPersona]`]
        * **Scope:** [Lines Start-End]([RelativePath]#L[Start]-L[End]) ([Sub-header])
        * **Description:** [Description]
        * **AI Suggestion:** [CONTEST | ESCALATE | PROPOSE FIX]
        * **Explanation & Justification:** [Detailed reason and background explaining why the fix is proposed or why the finding is contested]
        * **Proposed Edit:** [Precise replacement text or deletion note]
        ```

        그런 다음 이 항목에 대한 사용자의 결정을 채팅으로 묻는다(도구는 **0개** 호출하고 대기한다):

        *   `PROPOSE FIX`인 경우: 사용자에게 **Accept proposed fix**, **Skip / ignore**, **Discuss** 중 하나로 답하도록 요청한다.
        *   `CONTEST`인 경우: 사용자에게 **Skip / agree with contest**, **Overrule contest (propose fix)**, **Discuss** 중 하나로 답하도록 요청한다.
        *   `ESCALATE`인 경우: 사용자에게 **Confirm (no change)**, **Add the fact to the document**, **Discuss** 중 하나로 답하도록 요청한다.

    2.  사용자의 결정을 내부 메모리 체크리스트에 기록한다(예: *Item 1: Accepted*, *Item 2: Ignored*, *Item 3: Overruled*). **이 순차 루프 중에는 파일 편집 도구를 호출하지 않는다.**

    3.  모든 항목의 결정이 끝나면 수락된 수정을 요약하고, 파일 편집 도구로 실행한 뒤 Step 5로 진행한다.

-   **Custom instruction / Out-of-band edit**: 사용자가 구체적인 지시를 주면 그대로 적용하고 진행한다.

### Step 5: Post-Resolution Synchronization & Exit

1.  **Re-verify Lines**: `TargetFile`을 변경했다면 파일이 구조적으로 일관되고 유효한 markdown인지 확인한다.
2.  보고서에 `Status: resolved` 줄을 맨 위에 추가해 해결됨으로 표시한다.
3.  **Handoff**: `egm-review-loop` 같은 호출자에게 제어를 넘긴다. 이때 수락된 수정, contest된 항목, escalate된 항목, decline된 항목, 그리고 아직 처리되지 않은 나머지 이슈의 개수를 함께 전달한다.
