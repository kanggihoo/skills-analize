---
name: egm-review-loop
license: Apache-2.0
disable-model-invocation: true
description: >-
  Elephant-Goldfish Model(EGM)의 Antagonistic-Review 과정을 자동화된 다중 에이전트 리뷰 루프로 실행한다.
  문서를 정성적 기준과 구조 템플릿에 비추어 감사하고, 승인된 수정 사항을 자동으로 적용한다.
  설계 문서, README, 기능 명세, 구현 계획을 검토하거나 문서의 완성도와 어조를 확인할 때 사용한다.
---

# Goldfish Review: Loop (Orchestration Driver)

Codex 또는 ChatGPT Work에서 실행할 때는 먼저 [Codex integration](../../docs/codex.md)을 읽는다.
Claude Code 또는 Cowork에서 실행할 때는 먼저 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 읽는다.

## Overview

이 스킬은 다중 에이전트 리뷰 루프를 구동하는 중앙 오케스트레이션 엔진이다.
두 가지 서로 다른 에이전트 메모리 모델을 조율한다.

*   **The Goldfish (Adversarial Auditors)**: 과거 맥락에 영향받지 않도록 격리된 새 컨텍스트 창에서 생성되는 하위 에이전트다.
    기록되지 않은 가정을 편향 없이 찾아낸다.
*   **The Elephant (Persistent Resolver)**: 기본 에이전트 컨텍스트이며 기관 지식을 보유한다.
    발견 사항을 평가하고 승인된 수정을 적용한다.

드라이버는 입력 인자를 받아들이고, 리뷰어와 기준 문서의 경로를 해석하며, 매 반복 전에 대상 줄 범위를 무조건 다시 파싱한다.
설정에 따라 동시에 실행되는 전문화된 Goldfish 감사자를 생성하고, Elephant 컨텍스트와 함께 발견 사항을 처리한다.

## Delegation

Goldfish는 대화 이력이 없는 새 컨텍스트에서 실행된다. 각 하위 에이전트는 하네스의 하위 에이전트 도구로 생성한다(Antigravity: `invoke_subagent`, Claude Code: `Agent`, Codex: `spawn_agent`). 각 하위 에이전트는 `agents/<file>.md`에 정의되며, frontmatter의 `name`(예: `egm-zoom-out`)이 하네스가 이름 있는 하위 에이전트를 등록한 곳에서 요청할 하위 에이전트 타입이다. 그렇지 않으면 범용 하위 에이전트를 생성하고 먼저 해당 페르소나 파일을 읽으라고 지시한다. 프롬프트는 그대로 전달하고 보고서가 올 때까지 기다린다. 하네스가 하위 에이전트의 중첩 실행을 지원하지 않으면 synthesizer 대신 직접 디스패치를 사용한다. 자세한 내용은 `docs/harnesses.md`를 본다.
하네스에 하위 에이전트 도구가 없으면 작업을 멈추고 사용자에게 알린다. 같은 컨텍스트에서 하는 리뷰는 Goldfish 리뷰가 아니다.

## Inputs

호출자 또는 사용자는 정확히 다음 파라미터를 제공한다.

*   **`TargetFile`**: 대상 문서의 절대 경로 또는 상대 경로.
*   **`SemanticTarget`**: 대상을 설명하는 문자열(예: *"SS-ID 'S1.12'를 가진 H4 블록을 대상으로 한다"*), 또는 `full file`.
*   **`Reviewers`**: 리뷰어 이름 목록(짧은 이름 또는 경로).
*   **`Standards`**: 리뷰어 이름과 기준 이름의 매핑(짧은 이름 또는 경로).
*   **`GoldfishContext`**: 리뷰어의 기준선을 세우기 위해 전달하는 읽기 목록(소스 파일, 디렉터리, 또는 문서 URL).
    호출자가 빈 목록을 주면 제공된 것으로 간주하며 다시 묻지 않는다.
    일부 리뷰어는 URL을 열 수 없으므로 첫 라운드 전에 각 URL의 원본 페이지를 작업 디렉터리(또는 하네스의 아티팩트 디렉터리)에 새 파일로 저장하고, 그 파일의 절대 경로를 전달한다.
    페이지를 저장할 수 없으면 사용자에게 로컬 사본을 요청하고 턴을 종료한다. 아무도 답할 수 없는 헤드리스 실행이면 해당 항목을 빼고, 사용자에게 알린 뒤 계속 진행한다.

## Path & Standard Resolution Logic

`Reviewers`와 `Standards`의 이름을 해석할 때는 다음을 따른다.

*   **Reviewer Shortnames**: 리뷰어 짧은 이름(예: `design_critic`, `structural`, `style`, `implementation_readiness`,
    `codebase_details`, `comprehension`, `zoom_out`)을 `agents/{name}.md`에 대응시킨다.
    페르소나 파일은 리뷰어의 핵심 임무, 감사 관점, 출력 형식을 정의한다.
*   **Standard Shortnames**: 기준 짧은 이름(예: `feature-spec-standard`, `implementation-readiness-standard`, `zoom-out-standard`, `heilmeier-standard`,
    `re-implementation-standard`)을 `resources/document_standards/{name}.md`에 대응시킨다.
*   **Custom Paths**: 이름에 슬래시(`/`)가 있으면 절대 경로 또는 워크스페이스 기준 상대 경로로 보고 그대로 읽는다.

## Execution Workflow

### Step 1: Intake & Configuration UX

입력값(`TargetFile`, `SemanticTarget`, `Reviewers`, `Standards`, `GoldfishContext`)을 검토한다.

1.  **Identify Missing Inputs**: 필수 파라미터 중 누락된 것을 확인한다.
2.  **Interactive Onboarding**:
    *   **모든** 입력이 있으면 Step 2로 진행한다.
    *   **일부 또는 전부**가 없으면 누락된 입력만 채팅으로 한 번에 하나씩 사용자에게 묻는다.
3.  **Reviewer Recommendations**:
    *   *Feature Specs*: `design_critic`(`resources/document_standards/feature-spec-standard.md`에 대응)과
        `structural`(`resources/document_standards/feature-spec-standard.md`에 대응)을 추천한다.
    *   *Implementation Plans*: `implementation_readiness`
        (`resources/document_standards/implementation-readiness-standard.md`에 대응)와 `codebase_details`를 추천한다.
4.  **Confirm Configuration**: 통합된 계획(Target, Reviewers, 대응되는 Standards)을 표시하고, 진행하기 전에 사용자에게 확인을 받는다.

### Step 2: The Sharpening Loop (Iterative Cycle)

다음 순서를 연속해서 반복한다.

#### 2.1 Unconditional Target Resolution

매 반복 전에 `TargetFile`을 읽고 안정적인 `SemanticTarget` 문자열(예: 대상 헤더 찾기)을 사용해 `TargetFile`을 무조건 다시 스캔한다.
이렇게 하면 이전 라운드에서 파일이 수정되었더라도 시작 줄과 끝 줄 번호를 갱신할 수 있다.
(`full file` 모드이면 파일 전체의 줄 경계를 확인한다.)

#### 2.2 Review Swarm Execution

1.  **Launch Subagent Swarm**:
    하위 에이전트를 생성해 리뷰를 실행한다.
    *   **Hierarchical Dispatch (Synthesizer)**: 중간 synthesizer 하위 에이전트(`agents/synthesizer.md` / `egm-synthesizer`)를 생성한다.
        synthesizer는 Goldfish 리뷰 군집을 병렬로 생성하고, 발견 사항을 중복 제거하고, 보고서 아티팩트를 작성하고, 루트 대화의 컨텍스트 오염을 피하기 위해 요약 메시지 하나만 반환한다.
        아래의 Failed Reviewers 규칙과 `GoldfishContext`를 전달하고, 그 파일들을 각 리뷰어에게 전달하도록 지시한다.
        요약에는 요청된 리뷰어마다 `completed` 또는 `not run` 상태를 반드시 적는다.
    *   **Direct Dispatch (Flat Swarm)**: 대안으로 `Reviewers`에 있는 각 리뷰어 하위 에이전트를 직접 생성한다.
        각 하위 에이전트에게 먼저 `agents/{name}.md`의 페르소나 정의를 읽도록 지시한 뒤, 해석된 줄 범위의 `TargetFile`을 지정된 `resources/document_standards/` 기준에 대해 감사하도록 하고, `GoldfishContext`를 함께 제공한다.
    *   각 리뷰어는 심각도(🔴 Blocker, 🟡 Major, 🟢
        Nit), 줄 번호, 불일치 설명, 근거를 포함한 발견 사항을 생성한다.
2.  **Consolidate Findings**: 모든 리뷰어의 발견 사항을 하나의 평평한 `FindingsList`로 모은다.
    각 발견 사항에 고정 ID(`<reviewer>-<round>-<n>`)를 부여하고, 리뷰어, 심각도, 영향 범위를 기록한다.
3.  **Failed Reviewers**: 시간 초과, 실패, 보고서 없음으로 끝난 리뷰어는 리뷰하지 않은 것이다.
    한 번 재시도한다. 다시 실패하면 보고서에 **not run**으로 기록한다.
    발견 사항이 0개인 리뷰어로 계산하지 않는다.
    synthesizer 요약에 요청된 리뷰어의 상태가 없으면 그 리뷰어를 not run으로 기록한다.

#### 2.3 Aggregated Resolution Hand-off

1.  `TargetFile`, 활성 줄 범위, 통합된 `FindingsList`를 **`egm-resolve`** 워크플로에 전달한다.
2.  Elephant 기본 컨텍스트에서 resolution 워크플로를 실행한다.
    *   발견 사항을 `CONTEST`와 `PROPOSE FIX`로 분류한다.
    *   파일 쓰기 도구로 `goldfish_review_report.md`를 저장한다.
    *   대화형 결정 게이트(Auto accept, Continue, Interactive
        breakdown)를 표시한다.
    *   파일 편집 도구로 승인된 텍스트 수정을 `TargetFile`에 적용한다.

#### 2.4 Iteration Check & Turn Boundary

새 리뷰어는 매 라운드마다 다르게 샘플링하므로, 문서가 좋아져도 발견 사항이 0개인 라운드는 드물다.
대신 다음 규칙을 사용한다.

*   **Settled findings**: 발견 사항이 이의 제기(contested)되었거나 수정 없이 기록된(accepted risk) 경우 settled 상태다.
    settled 목록은 라운드 사이에 유지한다. 새 리뷰어가 settled 발견 사항을 같은 영향 범위, 같은 문제로 다시 지적해도 재개(re-open)하지 않는다.
*   **Fixed findings**: 적용된 수정만으로는 발견 사항이 settled 되지 않는다.
    이후 리뷰어가 같은 영역에서 같은 문제를 지적하면 수정이 실패했거나 이후 편집이 문제를 다시 만든 것이다. 발견 사항을 재개한다.
*   **Clean round**: 어떤 리뷰어도 settled 되지 않은 Blocker 또는 Major 발견 사항을 제기하지 않으면 라운드는 clean이다.
    Nit은 막지 않는다. not run으로 기록된 리뷰어가 있으면 라운드는 clean이 아니다.
    이 판단은 해당 라운드의 수정을 적용하기 전에, 리뷰 결과를 근거로 내린다.
*   **Converged**: 연속으로 clean 라운드 두 번이면 수렴(converged)이다. 한 번으로는 충분하지 않은데, 다음 새 리뷰어가 같은 텍스트에서 다른 빈틈을 찾을 수 있기 때문이다.
*   **Cap**: 5라운드.
*   **Churn**: 새 발견 사항이 적용된 수정과 같은 범위에 있고, 그 수정을 되돌리면 발견 사항이 해결되는 경우.

converged이면 Step 3으로 간다. cap 또는 churn이면 심각도별로 열린 발견 사항의 짧은 목록을 작성한 뒤, 사용자에게 질문 하나를 한다.
질문은 승인하고 진행할지, cap을 넘어 계속할지, 문서를 초안 작성 단계로 되돌릴지다.

**Crucial Turn-Taking Requirement**: 주어진 라운드의 resolution 단계가 끝나면, 루프 드라이버는 **반드시 `egm-resolve`의 턴 전환 체크포인트를 따라야 한다**.
드라이버는 사람의 턴 사이에서 대기 상태를 유지하며, 사용자가 리뷰를 한 라운드 더 실행하겠다고 명시적으로 확인한 경우에만 Step 2.1로 돌아간다.

### Step 3: Output Boundary & Final Checkpoint

완료되면(converged, 사용자가 승인한 cap 또는 churn, 또는 수동 중단) 다음을 수행한다.

*   **Programmatic Callers**: `egm-review`의 하위 흐름으로 실행 중이면 실행을 깔끔하게 끝내고 제어를 상위 워크플로에 돌려준다.
*   **Manual Invocations**: 채팅에 완료 요약을 출력한다: *"리뷰 루프가 [N]라운드 후 완료되었다([converged | accepted at cap | halted]).
열린 발견 사항은 보고서에 있다. 다음 단계로 진행할지, 아니면 마지막으로 궁금한 점이 있는지 알려 달라."*
