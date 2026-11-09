---
name: egm-review
license: Apache-2.0
disable-model-invocation: true
description: >-
  EGM Goldfish Review Protocol을 조율한다. EGM 프로세스의 일부로 설계 문서 리뷰를 수행할 때 사용한다. 다섯 가지 리뷰 단계를 실행한다. Initial Zoom Out Review, Comprehension Review, Design Critique, Intermediate Zoom Out Review, Implementation Readiness이다.
---

# Review, Validation & Automated Remediation

Codex 또는 ChatGPT Work에서 실행할 때는 먼저 [Codex integration](../../docs/codex.md)을 읽는다.
Claude Code 또는 Cowork에서는 먼저 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 읽는다.

설계 문서를 전문 리뷰어 페르소나를 통해 리뷰하고 검증한다.

## Delegation

Goldfish는 대화 이력이 없는 새 컨텍스트에서 실행된다. 하네스의 subagent 도구로 각 subagent를 생성한다(Antigravity: `invoke_subagent`, Claude Code: `Agent`, Codex: `spawn_agent`). 각 subagent는 `agents/<file>.md`에 정의되어 있으며, frontmatter의 `name`(예: `egm-zoom-out`)이 하네스가 이름 있는 subagent를 등록한 경우 요청할 subagent type이다. 그렇지 않으면 general-purpose subagent를 생성하고 해당 페르소나 파일을 먼저 읽으라고 지시한다. 프롬프트는 그대로 전달하고 보고서를 기다린다. 하네스가 subagent 중첩을 지원하지 않으면 synthesizer 대신 direct dispatch를 사용한다. `docs/harnesses.md`를 참고한다.
하네스에 subagent 도구가 없으면 작업을 멈추고 사용자에게 알린다. 같은 컨텍스트에서 하는 리뷰는 Goldfish 리뷰가 아니다.

## Execution Constraints (CRITICAL)

1.  **Artifact-First Delivery (MANDATORY)**: 큰 제안서, 초안, 요약, 계획을 채팅창에 직접 제시하는 것은 **절대 금지**된다. 파일 쓰기 도구로 작업 디렉터리(하네스에 artifact 디렉터리가 있으면 그곳)에 저장한 뒤, 채팅으로 파일 경로를 알리고 검토를 요청해야 한다. 이 규칙은 Discussion Summary, Design Drafts, 모든 리뷰 보고서에 적용된다.
2.  **Plain-English Standard**: 모든 개념 설명, 요약, 커뮤니케이션은 **반드시** 간단하고 직접적이며 전문 용어 없는 평이한 영어로 작성한다. 기술적 메커니즘은 바로 설명한다. 실질적 내용을 축약하거나 buzzword에 기대지 않는다. 근거 없는 홍보성 형용사(예: *seamless*, *robust*, *blazingly fast*)와 장식적 부사(예: *seamlessly*, *effortlessly*, *literally*, *drastically*, *obviously*)는 쓰지 않는다.
3.  **Default to Stress-Testing**: 기본값으로 동의하지 않는다. 핵심 지침은 아이디어, 전략, 의견을 스트레스 테스트하는 것이다. 무엇이든 긍정하기 전에 가장 약한 지점, 엣지 케이스, 맹점을 찾는다.
4.  **No Glazing**: 아첨을 없앤다. 아이디어를 "great", "brilliant", "smart"라고 부르지 않는다. 실질 없는 칭찬은 잡음일 뿐이다.
5.  **Critique First**: 아이디어가 좋아도 장점을 강조하기 전에 무엇이 잘못되었고, 빠졌고, 위험한지부터 말한다.
6.  **Reject Echo-Chamber Framing**: 사용자의 framing을 그대로 되돌려 말하지 않는다. 결론이 단언되더라도 습관적으로 확인해 주지 않는다.
7.  **Generate Counter-Arguments**: 제안된 모든 전략에 대해 다음을 적극적으로 제시한다. 사용자가 놓치고 있는 것은 무엇인가? 가장 강력한 반론은 무엇인가? 반대 견해가 정당한가?
8.  **Earn Your Agreement**: 엄격하고 객관적인 검증을 통과한 아이디어에만 동의한다.
9.  **Banned Adjectives (No Flattery)**: 사용자의 입력, 정정, 결정을 가리킬 때 "brilliant", "great", "smart", "correct", "perfect", "excellent", "spot-on" 같은 검증성 형용사를 사용하는 것을 엄격히 금지한다.
10. **Banned Apologies**: 지적받거나 정정받았을 때 "I apologize", "I am sorry", "Forgive me" 같은 형식적 사과를 출력하지 **않는다**. 대신 수정된 기술적 논리나 trade-off를 바로 서술한다.
11. **Interaction Invariants**: 모든 대화형 게이트(하네스에 있으면 `ask_question` 같은 구조화된 질문 도구, 아니면 일반 채팅)는 질문을 정확히 하나만 담아야 한다(`len(questions) == 1`). 해당 턴의 유일한 도구 호출이어야 하며, `(Recommended)` 접두사 없이 실행 가능한 명확한 선택지를 제시해야 한다.

## Inputs

*   **`TargetFile`**: 설계 문서의 절대 또는 상대 경로.
*   **`GoldfishContext`** (선택): 시스템 기준선을 세우기 위한 읽기 목록. 생략하면 Step 1.3이 추가하는 linked file만 담는다.
*   **`Step` (선택)**: 실행할 특정 파이프라인 preset 또는 단계(예: `interactive`, `uninterrupted`, `feature_spec`, `implementation`, 또는 개별 단계 `5`, `6`, `7`, `8`, `9`). 생략하면 사용자에게 묻는다.

## Workflow

### Step 1: Intake & Setup

1.  `TargetFile`이 제공되었는지 확인한다. 없으면:
    *   설계 문서 경로가 있어야 구조를 분석하고 semantic split을 찾을 수 있다고 사용자에게 설명한다.
    *   일반 텍스트 메시지로 채팅에서 경로를 요청하고 턴을 끝낸다. `ask_question` 같은 구조화된 질문 도구는 쓰지 않는다. 임의의 파일 경로는 고정된 선택지 중 하나가 아니라 자유 입력이기 때문이다.
2.  `TargetFile`이 제공되면 `GoldfishContext`가 제공되었는지 확인한다(빈 목록도 제공된 것으로 본다. 사용자가 추가 컨텍스트 없이 진행하겠다고 프롬프트에 명시한 경우도 마찬가지다). 없으면:
    *   goldfish context(읽기 파일 목록)는 선택 사항이지만 리뷰어에게 기준 지식을 제공할 수 있다고 설명한다.
    *   작업 디렉터리 안의 linked file은 자동으로 추가되며, 그 밖의 링크와 URL은 승인이 필요하다고 명확히 한다.
    *   일반 텍스트로 추가 컨텍스트 파일을 제공할지 채팅에서 묻는다. 자유 형식 파일 경로에는 구조화된 질문 도구를 쓰지 않는다.
3.  **Linked Files (run later)**: intake 중에는 이 단계를 실행하지 않는다. Step 2에서 preset을 고른 뒤, `GoldfishContext`를 받는 첫 단계 바로 직전(Stage 6을 제외한 모든 단계)에 한 번 실행한다. `uninterrupted` 등 모든 흐름에 적용된다. `TargetFile`을 읽고, anchor-only 링크(`#...`)는 건너뛰며, 다른 링크에서는 `#fragment`를 제거한다. 상대 링크는 설계 문서가 있는 폴더 기준으로 해석한다. 실제 경로(심볼릭 링크를 따라간 뒤)가 작업 디렉터리 안에 머무르는 링크만 `GoldfishContext`에 추가하고, 존재하지 않는 파일은 건너뛴다. 작업 디렉터리 밖으로 해석되는 링크나 URL이 있으면 해당 링크를 일반 텍스트로 채팅에 나열하고, 포함할지 묻고 턴을 끝낸다. 아무도 답할 수 없는 상황(예: 무인 실행)이면 모두 제외하고 계속 진행한다. 승인된 것만 추가하고, 제외한 항목은 사용자에게 알린다. 일부 리뷰어는 URL을 열 수 없으므로, 각 URL의 원본 페이지를 작업 디렉터리(또는 하네스의 artifact 디렉터리)에 새 파일로 저장하고 그 절대 경로를 `GoldfishContext`에 넘긴다. 페이지를 저장할 수 없으면 사용자에게 로컬 사본을 요청하고 턴을 끝낸다. 아무도 답할 수 없으면(무인 실행 등) 그 항목을 제외하고 사용자에게 알린 뒤 계속 진행한다. Stage 6은 문서만 읽으므로 제외하고, 그 밖의 모든 단계에 `GoldfishContext`를 넘긴다. synthesizer에게는 이 파일들을 각 리뷰어에게 전달하라고 알린다.

### Step 2: Curated Pipeline Preset Selection

1.  **Preset Gate Check**:
    *   `Step` 파라미터가 호출 시 명시되었으면(예: `interactive`, `uninterrupted`, `feature_spec`, `implementation`, 또는 개별 단계 `5`, `6`, `7`, `8`, `9`), 해당 preset 또는 subflow에 매핑하고 대화형 preset 선택 게이트를 건너뛴다.
    *   그렇지 않으면(`Step`이 생략되었으면) 반드시 Curated Pipeline Presets 단일 선택 게이트를 사용자에게 제시한다(하네스에 있으면 `ask_question` 같은 구조화된 질문 도구, 아니면 일반 채팅).
2.  **Modal Invariants & Wire Payload**:

    *   질문 payload에는 **반드시** 질문 객체 하나만 있어야 한다(`len(questions) == 1`). 여러 질문이 담긴 payload는 엄격히 금지된다.
    *   질문 도구는 이 턴 payload의 유일한 도구 호출이어야 한다. 호출하자마자 **반드시** 실행을 멈춘다.
    *   `is_multi_select`는 **반드시** `false`여야 한다. 조합형 다중 선택 체크리스트는 위상 의존성(5 → 6 → 7 → 8 → 9)을 보호하기 위해 엄격히 금지된다.
    *   Option 0은 `(Recommended)` 접두사 없이 기본 주요 동작이어야 한다.
    *   Payload 명세:

        ```json
        {
          "questions": [
            {
              "question": "Select the review execution mode for this document:",
              "options": [
                "Interactive review with all review rubrics (step-by-step, check in after each review)",
                "Consolidated report with all review rubrics (runs full flow without stopping)",
                "Feature spec only (evaluate design without considering implementation)",
                "Implementation plan only (evaluate design for implementation readiness)"
              ],
              "is_multi_select": false
            }
          ]
        }
        ```

3.  **Action Dispatch Based on Preset**:

    *   **Preset 0: `Interactive review with all review rubrics`**: Step 3으로 가서 semantic split을 찾은 뒤, Stage 5, 6, 7, 8, 9를 단계 사이에 대화형 checkpoint 게이트를 두고 순서대로 실행한다.
    *   **Preset 1: `Consolidated report with all review rubrics`**: Step 3으로 가서 semantic split을 찾은 뒤, 체크포인트에서 멈추지 않고 다섯 단계를 모두 실행하며, 결과를 `consolidated_review_report.md`로 통합한다.
    *   **Preset 2: `Feature spec only`**: **Step 3의 semantic split 탐색을 완전히 건너뛴다**. `FeatureRange = 1..End`, `DetailedRange = N/A`로 설정하고, Stage 5, 6, 7, 8을 checkpoint와 함께 실행한다. Stage 8 이후 Stage 9 전에 리뷰를 깔끔하게 중단한다.
    *   **Preset 3: `Implementation plan only`**: Step 3으로 가서 semantic split을 찾고 `DetailedRange`를 확인한 뒤, 바로 Stage 9(Implementation Readiness Test)로 간다.

### Step 3: Semantic Split Discovery

1.  **Split Bypass Check**: Preset 2(`Feature spec only`)를 골랐으면 **이 단계를 완전히 건너뛴다**. `FeatureRange`를 문서 전체(1행부터 End까지)로 설정하고 바로 Step 4로 간다.
2.  **Inspect Document**: `TargetFile`을 읽어 구조와 행 수를 확인한다.
3.  **Discover Split Boundary**: 주된 구분 헤더 `## Detailed Implementation Plan`(또는 표준 동의어 `## Implementation Plan`, `## Work Breakdown`, `## Implementation Steps`)을 찾는다.
    *   **Standard Layout Detected**: 경계 헤더가 $L$행에서 명확히 확인되면:
        *   `FeatureRange = 1..(L-1)`로 자동 지정한다.
        *   `DetailedRange = L..End`로 자동 지정한다.
        *   채팅으로 다음과 같이 간결하게 확인 메시지를 알린다.
            `"Discovered semantic boundary at line L. FeatureRange: 1..(L-1),
            DetailedRange: L..End."`
        *   확인 모달 없이 바로 Step 4로 진행한다.
    *   **Ambiguous Boundary / Multiple Candidate Headers**: 충돌하는 헤더가 여러 개이거나 비표준 구조가 있으면:
        *   단일 선택 게이트를 제시한다(하네스에 있으면 `len(questions) == 1`인 `ask_question` 같은 구조화된 질문 도구, 아니면 일반 채팅). 가장 가능성 높은 split 행을 Option 0으로 제안하고, Option 1에서는 직접 입력으로 행 범위를 지정할 수 있게 한다.
    *   **No Implementation Plan Found**: 문서에 고수준 기능 명세만 있으면:
        *   채팅으로 구현 계획이 감지되지 않았다고 알린다.
        *   `FeatureRange = 1..End`, `DetailedRange = N/A`로 지정한다.
        *   Stage 5–8(Feature Spec 게이트)을 실행할지 제안하고 진행한다.

### Step 4: Staging Strategy

semantic split과 실행 preset이 확정되면:

1.  **Confirm Review Target**: `FeatureRange`와 `DetailedRange`가 바인딩되어 있는지 확인한다.
2.  **Dispatch Execution Pipeline**:
    *   **Interactive review with all review rubrics**: Stage 5 → Stage 6 → Stage 7 → Stage 8 → Stage 9를 순서대로 실행한다.
    *   **Consolidated report with all review rubrics**: Subflow: Uninterrupted Full Flow를 실행한다.
    *   **Feature spec only**: Stage 5 → Stage 6 → Stage 7 → Stage 8을 실행한 뒤 깔끔하게 중단한다.
    *   **Implementation plan only**: 바로 Stage 9(Implementation Readiness Test)로 간다.

--------------------------------------------------------------------------------

## Subflows

### Subflow Checkpoint Gates & Pause/Resume Protocol

모든 대화형 리뷰 단계는 명시적인 단일 선택 게이트로 끝난다(`len(questions) == 1`, `is_multi_select: false`, 턴의 유일한 도구 호출인 `ask_question` 같은 구조화된 질문 도구, 또는 일반 채팅):

1.  **Stage Checkpoint Patterns**:
    *   **Stages 5, 6, 8 (Altitude & Comprehension Checkpoints)**:
        *   Option 0: `Proceed to next stage: Stage [N+1] ([Next Stage Name])`
            (Stage 8 종료 단계에서는 `Conclude review and begin detailed implementation planning`).
        *   Option 1: `I will update doc first (pause session; notify me in chat
            when edits are complete to re-run)`.
        *   Option 2: `Pause Review (save progress and exit)`.
    *   **Stages 7, 9 (Remediation & Readiness Checkpoints)**:
        *   Option 0: `Proceed to next stage: Stage [N+1] ([Next Stage Name])`
            (Stage 9 종료 단계에서는 `Conclude review and finalize document`).
        *   Option 1: `Resolve findings with agent (evaluate findings, propose
            fixes, and apply approved edits)`.
        *   Option 2: `I will update doc manually (pause session; notify me in
            chat when edits are complete to re-run)`.
        *   Option 3: `Pause Review (save progress and exit)`.
2.  **Resolution Semantics (Option 1 for Stages 7 and 9)**:
    *   **Hand-off to Resolver**: 에이전트는 주 Elephant 컨텍스트 창에서 대상 범위(`FeatureRange` 또는 `DetailedRange`)에 대해 `egm-resolve`를 호출하고, `critic_report.md` 또는 `implementation_readiness_report.md`에서 파싱한 findings를 넘긴다.
    *   **Resolution Workflow**: Elephant는 각 finding을 분류하고(`PROPOSE FIX` 또는 `CONTEST`), `goldfish_review_report.md`를 작성하며, 승인된 수정을 파일 편집 도구로 `TargetFile`에 적용한다.
    *   **Convergence**: 수정을 적용한 뒤 `TargetFile`을 다시 읽어 행 경계를 다시 계산하고, 다음 단계로 넘어가거나 단계 감사를 다시 실행한다(재감사는 최대 1회로 제한).
3.  **Pause & Resume Semantics (Manual Doc Updates)**:
    *   **Turn Yield**: 에이전트는 수동 문서 수정을 위해 리뷰가 멈춰 있음을 채팅으로 알리고, 즉시 실행을 넘긴다.
    *   **Resume Notification**: 작성자가 채팅에서 수정이 끝났다고 답하면:
        *   `TargetFile`을 다시 읽어 행 이동을 다시 계산한다.
        *   Step 1.3이 이미 실행되었다면, 그 이후 추가된 링크에도 해당 규칙을 적용한다.
        *   현재 단계 subflow를 다시 실행한다.
        *   **1-Audit Convergence Cap**: 각 단계는 재감사를 최대 1회만 허용한다. 재감사 후 수동 문서 수정이 다시 요청되면, 작성자에게 상한에 도달했다고 알리고, 남은 findings를 감수된 trade-off로 기록한 뒤 Option 0을 자동으로 선택하고 다음 단계로 넘어간다.
4.  **Graceful Halt Semantics (`Pause Review`)**:
    *   도구 호출 없이 즉시 실행을 멈추고, 모든 보고서 artifact를 보존한다.

### Subflow: Uninterrupted Full Flow

1.  **Uninterrupted Stage Execution**: 단계 사이에 대화형 checkpoint 멈춤 없이 다섯 리뷰 단계를 순서대로 실행한다. 각 단계마다 개별 보고서 파일을 작업 디렉터리(하네스에 artifact 디렉터리가 있으면 그곳)에 쓴다. Step 6을 제외한 모든 단계에 `GoldfishContext`를 넘긴다.
    *   **Step 5 (Initial Zoom Out)**: `Reviewers: [egm-zoom-out]`로 `egm-synthesizer`(또는 direct subagent)를 생성해 `full file`을 리뷰하고 → `zoom_out_report.md`를 쓴다.
    *   **Step 6 (Comprehension Test)**: synthesizer를 거치지 않고 `egm-comprehension` subagent를 직접 생성해 `FeatureRange` & `DetailedRange`를 리뷰하고 → 전체 결과를 `comprehension_report.md`에 쓴다.
    *   **Step 7 (Critic Review)**: `Reviewers: [egm-design, egm-structural, egm-style]`로 `egm-synthesizer`(또는 direct subagents)를 생성해 `FeatureRange`를 리뷰하고 → `critic_report.md`를 쓴다.
    *   **Step 8 (Intermediate Zoom Out)**: `Reviewers: [egm-zoom-out]`로 `egm-synthesizer`(또는 direct subagent)를 생성해 `full file`을 리뷰하고 → `intermediate_zoom_out_report.md`를 쓴다.
    *   **Step 9 (Implementation Readiness Test)**: `Reviewers: [egm-implementation-readiness, egm-codebase-details, egm-style]`로 `egm-synthesizer`(또는 direct subagents)를 생성해 `DetailedRange`를 리뷰하고 → `implementation_readiness_report.md`를 쓴다.
2.  **Cross-Stage Synthesis & Deduplication**:
    *   다섯 단계 보고서의 모든 findings를 모은다.
    *   관찰 사항을 우선순위(🔴 Blocker, 🟡 Major, 🟢 Nit)별 실행 가능한 작업으로 통합한다.
    *   원시 findings를 통합된 작업 항목에 매핑하는 Traceability Matrix를 만든다.
3.  **Deliverable Delivery**: 파일 쓰기 도구로 `consolidated_review_report.md`에 쓴다.
4.  **Notify User**: `consolidated_review_report.md`의 경로를 가리키는 간결한 채팅 알림을 출력한다(경로 포함).

### Subflow: Zoom Out Review

1.  **Delegate to Synthesizer Subagent**: `resources/document_standards/zoom-out-standard.md`를 적용해 `egm-synthesizer`(또는 전용 `egm-zoom-out` subagent, `agents/zoom_out.md`)를 생성해 `full file`을 리뷰한다. Step 8(Intermediate Zoom Out)로 실행할 때는 컨텍스트에 `zoom_out_report.md` 경로를 포함하고, Comprehension과 Critic 단계의 추가 사항과 완화책에 집중한다.
    Stage 5와 Stage 8 모두 `GoldfishContext`를 넘긴다.
2.  **Delivery**: findings를 파일 쓰기 도구로 `zoom_out_report.md`(Stage 5) 또는 `intermediate_zoom_out_report.md`(Stage 8)에 쓴다.
3.  **Notify User (No Chat Dumps)**: findings가 보고서 파일에 기록되었다고 사용자에게 알린다(경로 포함).
4.  **Checkpoint Gate**: Checkpoint Gate Protocol에 따라 3단계(tri-state) 게이트를 제시한다.
    *   **Stage 5**: 질문: `"Stage 5 (Initial Zoom Out Review) completed.
        Findings written to zoom_out_report.md. How would you like to
        proceed?"`, Option 0: `"Proceed to next stage: Stage 6 (Comprehension
        Test)"`.
    *   **Stage 8 (Feature Spec Gates Only)**: 질문: `"Stage 8 (Intermediate
        Zoom Out) completed. High-level architecture verified. How would you
        like to proceed?"`, Option 0: `"Conclude review and begin detailed
        implementation planning"`.
    *   **Stage 8 (Interactive Full Flow)**: 질문: `"Stage 8 (Intermediate
        Zoom Out) completed. Findings written to
        intermediate_zoom_out_report.md. How would you like to proceed?"`,
        Option 0: `"Proceed to next stage: Stage 9 (Implementation Readiness
        Test)"`.
    *   모든 경우에 Option 1: `"I will update doc first (pause session;
        notify me in chat when edits are complete to re-run)"`와 Option 2:
        `"Pause Review (save progress and exit)"`를 함께 제공한다.

### Subflow: Comprehension Test

1.  **Spawn the Reviewer Directly**: `agents/comprehension.md`의 `egm-comprehension` subagent를 생성해 `FeatureRange` & `DetailedRange`를 리뷰한다. 문서 기준(standard)은 적용하지 않는다. Synthesizer는 쓰지 않는다. 그 보고서는 findings만 남기기 때문에, 작성자가 직접 봐야 하는 paraphrase가 빠진다. 이 테스트는 상세함이 아니라 자기완결성(self-containment)을 검사한다. `re-implementation-standard.md`는 적용하지 않는다. 이 기준은 코드 수준의 상세함을 요구하는데, Zoom Out 기준은 `FeatureRange`에서 그런 상세함을 금지하기 때문이다.
2.  **Delivery**: 리뷰어의 전체 결과를 파일 쓰기 도구로 `comprehension_report.md`에 쓴다. 두 paraphrase 제목을 그대로 먼저 쓰고, 그 뒤에 findings를 쓴다. findings가 없어도 paraphrase는 남긴다.
3.  **Notify User (No Chat Dumps)**: findings가 `comprehension_report.md`에 기록되었다고 사용자에게 알린다(경로 포함).
4.  **Checkpoint Gate**: Stage 6 tri-state 게이트를 제시한다.
    *   질문: `"Stage 6 (Comprehension Test) completed. Findings written to
        comprehension_report.md. How would you like to proceed?"`
    *   Option 0: `"Proceed to next stage: Stage 7 (Critic Review)"`
    *   Option 1: `"I will update doc first (pause session; notify me in chat
        when edits are complete to re-run)"`
    *   Option 2: `"Pause Review (save progress and exit)"`

### Subflow: Critic Review

1.  **Invoke Antagonistic Review Loop**: `FeatureRange`에 대해 리뷰어 `[egm-design, egm-structural, egm-style]`로 `egm-review-loop`를 스레드 안에서 호출한다. 기준은 `{"egm-design": "feature-spec-standard", "egm-structural":
    "feature-spec-standard"}`이며, `GoldfishContext`도 함께 넘긴다.
2.  **Notify User (No Chat Dumps)**: findings가 `critic_report.md`에 기록되었다고 사용자에게 알린다(경로 포함).
3.  **Checkpoint Gate**: Stage 7 게이트를 제시한다.
    *   질문: `"Stage 7 (Critic Review) completed. Findings written to
        critic_report.md. How would you like to proceed?"`
    *   Option 0: `"Proceed to next stage: Stage 8 (Intermediate Zoom Out
        Review)"`
    *   Option 1: `"Resolve findings with agent (evaluate findings, propose
        fixes, and apply approved edits)"`
    *   Option 2: `"I will update doc manually (pause session; notify me in chat
        when edits are complete to re-run)"`
    *   Option 3: `"Pause Review (save progress and exit)"`
4.  **Remediation & Resolution (Option 1)**:
    *   주 Elephant 컨텍스트에서 `FeatureRange`에 대해 `egm-resolve`를 호출하고, `critic_report.md`(또는 `goldfish_review_report.md`)의 findings를 넘긴다.
    *   승인된 수정을 파일 편집 도구로 `TargetFile`에 직접 적용한다.
    *   수정을 적용한 뒤 `TargetFile`을 다시 읽어 행 경계를 다시 계산하고, Stage 8로 넘어가거나 Stage 7을 다시 실행한다(재감사는 최대 1회).

### Subflow: Implementation Readiness Test

1.  **Invoke Antagonistic Review Loop**: `DetailedRange`에 대해 리뷰어 `[egm-implementation-readiness, egm-codebase-details, egm-style]`로 `egm-review-loop`를 스레드 안에서 호출한다. 기준은 `{"egm-implementation-readiness": "implementation-readiness-standard",
    "egm-codebase-details": "implementation-readiness-standard"}`이며, `GoldfishContext`도 함께 넘긴다.
2.  **Notify User (No Chat Dumps)**: findings가 `implementation_readiness_report.md`에 기록되었다고 사용자에게 알린다(경로 포함).
3.  **Terminal Checkpoint Gate**: Stage 9 종료 게이트를 제시한다.
    *   질문: `"Stage 9 (Implementation Readiness Test) completed. Report
        written to implementation_readiness_report.md. How would you like to
        proceed?"`
    *   Option 0: `"Conclude review and finalize document"`
    *   Option 1: `"Resolve findings with agent (evaluate findings, propose
        fixes, and apply approved edits)"`
    *   Option 2: `"I will update doc manually (pause session; notify me in chat
        when edits are complete to re-run)"`
    *   Option 3: `"Pause Review (save progress and exit)"`
4.  **Remediation & Resolution (Option 1)**:
    *   주 Elephant 컨텍스트에서 `DetailedRange`에 대해 `egm-resolve`를 호출하고, `implementation_readiness_report.md`(또는 `goldfish_review_report.md`)의 findings를 넘긴다.
    *   승인된 수정을 파일 편집 도구로 `TargetFile`에 직접 적용한다.
    *   수정을 적용한 뒤 `TargetFile`을 다시 읽어 행 경계를 다시 계산하고, 리뷰 세션을 끝내거나 Stage 9를 다시 실행한다(재감사는 최대 1회).
