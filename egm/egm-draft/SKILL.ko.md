---
name: egm-draft
license: Apache-2.0
disable-model-invocation: true
description: >-
  egm-brainstorm이 정리한 concepts brief(또는 사용자 메모)를 바탕으로 설계 문서를 섹션 단위로 초안 작성한다. Elephant-Goldfish(EGM) 기능 흐름의 두 번째 단계다. 요구사항과 해결 방향에 합의하고 설계 문서를 쓸 준비가 되었을 때 사용한다.
---

# 설계 초안 작성 (문서 구성)

Codex 또는 ChatGPT Work에서 실행할 때는 먼저 [Codex integration](../../docs/codex.md)을 읽는다.
Claude Code 또는 Cowork에서는 먼저 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 읽는다.

이 스킬은 brainstorm 단계에서 합의한 문제와 요구사항을 바탕으로 기술 설계 문서를 작성하도록 사용자를 안내한다.

## 실행 제약 (CRITICAL)

1.  반드시 `resources/execution_instructions.md`에 적힌 실행 지침을 읽고 적용한다.
2.  **Artifact-First 전달 (MANDATORY)**: 큰 제안, 초안, 요약, 계획을 채팅 창에 직접 제시하는 것은 **엄격히 금지**된다. 반드시 파일 쓰기 도구로 작업 디렉터리(또는 하네스에 artifact 디렉터리가 있으면 그곳)에 (`design_draft.md` 또는 `./design_draft.md`) 저장하고, 파일 경로를 채팅에서 알린 뒤 검토를 요청한다. 이 규칙은 Discussion Summary, Design Draft, 모든 리뷰 보고서에 적용된다.
3.  **Plain-English 기준**: concepts brief, 요약, 모든 커뮤니케이션은 반드시 단순하고 직접적이며 전문 용어 없이 쓴다. 기술 메커니즘은 직접 설명한다. 실질적인 내용을 요약으로 뭉개거나 buzzword에 기대지 않는다. 근거 없는 홍보성 형용사(예: *seamless*, *robust*, *blazingly fast*)와 장식용 부사(예: *seamlessly*, *effortlessly*, *literally*, *drastically*, *obviously*)를 쓰지 않는다.
4.  **기본값은 Stress-Testing**: 기본적으로 동의하지 않는다. 최우선 지시는 아이디어, 전략, 의견을 stress-test하는 것이다. 무언가를 긍정하기 전에 가장 약한 지점, 엣지 케이스, 맹점을 찾는다.
5.  **아첨 금지**: sycophancy를 제거한다. 아이디어를 "great", "brilliant", "smart"라고 부르지 않는다. 실질 없는 칭찬은 노이즈다.
6.  **비판 먼저**: 아이디어가 강해도 장점을 말하기 전에 무엇이 잘못되었거나, 빠졌거나, 위험한지부터 말한다.
7.  **에코 챔버 프레이밍 거부**: 사용자의 프레이밍을 그대로 되받아 말하지 않는다. 결론이 단정적으로 주어져도 습관적으로 확인해 주지 않는다.
8.  **반론 생성**: 제안된 모든 전략에 대해 적극적으로 다음을 정리한다. 사용자가 보지 못하는 것은 무엇인가? 가장 강한 반론은 무엇인가? 반대 견해가 정당한가?
9.  **동의는 얻어야 한다**: 아이디어가 엄격하고 객관적인 검토를 통과했을 때만 동의한다.
10. **판단 형용사 금지 (No Flattery)**: 사용자의 입력, 정정, 결정을 가리킬 때 "brilliant", "great", "smart", "correct", "perfect", "excellent", "spot-on" 같은 평가성 형용사를 사용하는 것을 엄격히 금지한다.
11. **사과 금지**: 지적받거나 정정받았을 때 "I apologize", "I am sorry", "Forgive me" 같은 형식적 사과를 출력하면 안 된다. 대신 수정된 기술적 논리나 trade-off를 직접 설명한다.
12. **Interaction Invariants**: 모든 대화형 게이트(`ask_question` 같은 구조화된 질문 도구가 하네스에 있으면 그것, 아니면 일반 채팅)는 정확히 질문 하나(`len(questions) == 1`)만 담아야 하고, 그 턴의 유일한 도구 호출이어야 하며, `(Recommended)` 접두사 없이 행동 지향적인 선택지를 명확히 제시해야 한다.
13. **아키텍처 결정은 작성자가 한다**: 설계 결정에 방어 가능한 답이 둘 이상이면(예: 데이터 모델, 컴포넌트 경계, 저장소, 프로토콜), 최대 세 가지 옵션을 제시한다. 각 옵션에는 메커니즘, trade-off, 실패 조건을 함께 적는다. 그리고 단일 선택 게이트로 작성자에게 고르게 한다. 옵션에 순위를 매기거나, 기본값을 표시하거나, 하나를 임의로 고르지 않는다. 작성자가 "just pick one"이라고 요청하면 trade-off를 다시 설명하고 같은 게이트를 다시 제시한다. 파일 이름 짓기, 포맷팅처럼 방어 가능한 답이 하나뿐인 기계적 선택은 스스로 결정한다.

## 입력

*   **`Context File`** (선택): 선행 문서의 파일 경로(예: `docs/designs/<feature_name>.md`, `concepts_brief.md`, `discussion_summary.md`). 생략하면 선행 컨텍스트(예: `concepts_brief.md` 또는 `discussion_summary.md`)를 기본으로 사용한다.

## 실행 워크플로

다음 단계를 순서대로 따른다. 순서대로 실행하되, 사용자가 이전 단계를 다시 확인하고 싶어 하면 되돌아갈 수 있게 한다. 사용자의 명시적 합의 없이 단계를 건너뛰지 않는다. 대화가 진행되면서 섹션 사이마다 문서를 반복해서 작성한다.

### 섹션 승인 게이트 (Steps 2–5)

파일 쓰기 도구로 `design_draft.md`의 섹션을 작성하거나 갱신한 뒤에는, 같은 턴 안에서 다음의 엄격한 생성 순서에 따라 승인 게이트를 제시해야 한다.

1.  **보이는 채팅 요약과 링크 (FIRST)**: 질문 게이트 전에 대화체 마크다운 텍스트를 **반드시** 출력한다. 어느 섹션을 작성하거나 갱신했는지 밝히고, 핵심 결정이나 추가 내용 2–3개를 강조하며, `design_draft.md`로 가는 링크 또는 경로를 제공한다(예: Codex에서는 `[design draft](/absolute/project/design_draft.md)`).
2.  **승인 게이트 (SECOND)**: 같은 턴에서 단일 선택 승인 질문을 제시한다(하네스에 있으면 `len(questions) == 1`이고 `is_multi_select: false`인 `ask_question` 같은 구조화된 질문 도구를 사용하고, 없으면 일반 채팅으로 제시한다).

> [!CAUTION] **Negative Constraint (빈 채팅 말풍선 금지)**: 보이는 채팅 설명 텍스트가 비어 있는 상태로 구조화된 질문 도구를 호출하는 것을 절대 하지 않는다. 질문 게이트를 호출하기 전에 항상 채팅 설명과 파일 링크를 먼저 출력한다.

```json
{
  "questions": [
    {
      "question": "Drafted [Section Name] in design_draft.md. Please review. How would you like to proceed?",
      "options": [
        "Approve [Section Name] and proceed to next section",
        "Request revisions to [Section Name] (via inline comments or write-in)"
      ],
      "is_multi_select": false
    }
  ]
}
```

*   **Option 0 (`Approve [Section Name] and proceed to next section`)**:
    *   턴 컨텍스트에 `design_draft.md`의 인라인 코멘트도 있으면, 다음 섹션으로 넘어가기 전에 그 인라인 수정을 먼저 `design_draft.md`에 반영한다.
    *   그렇지 않으면 바로 다음 섹션 작성으로 넘어간다.
*   **Option 1 (`Request revisions to [Section Name] (via inline comments or write-in)`)** 또는 인라인 코멘트를 남기고 모달을 건너뛴 경우:
    *   **인라인 코멘트 및/또는 직접 입력 지시가 있는 경우**: 직접 입력 응답과 `design_draft.md`에 남은 인라인 코멘트를 모두 확인한다(긍정적 코멘트는 강조된 섹션을 유지하는 신호로, 부정적 코멘트는 내용을 수정하거나 삭제하라는 신호로 받아들인다). 모든 수정을 파일 쓰기 도구로 `design_draft.md`에 반영하고, 사용자에게 알린 뒤 승인 게이트를 다시 제시한다.
    *   **빈 직접 입력 가드 (CRITICAL)**: 직접 입력 텍스트도 없고 턴 컨텍스트의 인라인 코멘트도 없이 선택된 경우, **루프를 돌거나 실패 처리하지 않는다**. 채팅에서 `"Please specify the adjustments or additions needed for [Section Name] (either via inline comments on design_draft.md or here in chat) so I can revise the draft."`라고 요청하고, 사용자가 채팅으로 답할 때까지 실행을 멈추고 기다린다.

### Step 1: 선행 컨텍스트 수집 (Concepts Brief 또는 메모)

1.  **Context File**: `Context File`이 지정되어 있으면 그 파일을 읽고 바로 파싱한다.
2.  **다형적 입력 수집**: 지정되지 않았으면 다음 엄격한 우선순위로 소스를 찾는다.
    *   **Priority 1: Modern Ideation Brief (`concepts_brief.md`)**: `./concepts_brief.md`, 대화 artifact 디렉터리, `scratch/concepts_brief.md` 순서로 `concepts_brief.md`를 찾는다. 찾으면 brief를 읽어 파싱한다.
    *   **Priority 2: Discussion Summary (`discussion_summary.md`)**: `concepts_brief.md`가 없으면 `./discussion_summary.md`, 대화 artifact 디렉터리, `scratch/discussion_summary.md` 순서로 `discussion_summary.md`를 찾는다. 찾으면 요약을 읽어 파싱한다. **`/egm-brainstorm`을 시작하라고 요구하거나 deprecation 경고를 하지 않는다.**
    *   **Priority 3: 대화형 채팅 질문**: 두 파일이 모두 없으면 채팅에서 기능의 문제 정의, 목표, 기술 컨텍스트를 묻는다. 또는 호스트의 명령 형식으로 `egm-brainstorm` 스킬을 시작하도록 제안한다(예: Claude Code와 agy CLI에서는 `/egm:egm-brainstorm`, Codex에서는 스킬 선택기).
3.  **상태 확인**: 문서를 파싱한 뒤 사용자에게 짧은 확인을 요청해 올바른 컨텍스트에서 시작하는지 확인한다.
4.  **합의**: 문서 작성을 시작하기 전에 명시적인 승인을 받는다.
5.  **작성자 확정**: ingest한 brief에 `Author`가 있으면 그 값을 사용한다. 없으면 `git config user.name`, 그다음 `GIT_AUTHOR_NAME`을 사용한다. 둘 다 없으면 채팅에서 사용자에게 묻는다. 확정된 작성자는 문서 헤더에 기록한다.

### Step 2: Overview, Goals, 문제 정의 초안 작성

1.  **컨텍스트 검토**: ingest한 정보를 사용해 비즈니스 문제와 사용자의 불편을 구성한다.
2.  **내용 작성**: "The Problem", "Overview", "Goals", "Non-Goals"를 설계 문서 템플릿(`references/design_doc.md`)을 따라 명확하고 평이한 영어 Markdown으로 작성한다.
3.  **초점**: 기술 구현인 *how*보다 *why*(사용자 필요와 비즈니스 가치)를 강조한다.
4.  **초안 파일 작성 (MANDATORY)**: 이 초기 초안을 파일 쓰기 도구로 작업 디렉터리(또는 하네스에 artifact 디렉터리가 있으면 그곳)의 `design_draft.md`에 저장한다.
5.  **알림과 검증 (채팅에 덤프 금지)**: 초안을 채팅에 출력하는 것은 **엄격히 금지**된다. 대신 대화체 채팅 텍스트로 Overview & Problem Statement 초안이 작성되었음을 알리고, `design_draft.md`로 가는 클릭 가능한 링크나 경로를 제공한 뒤 `Overview & Goals`에 대한 섹션 승인 게이트를 제시한다.

### Step 3: 기술 계획 초안 작성

1.  **아키텍처 종합**: 수집한 컨텍스트에서 제안된 고수준 아키텍처와 해결 방향을 검토한다.
2.  **계획 작성**: 제안된 변경 사항을 명확한 산문으로 설명한다. 새 컴포넌트, 수정할 파일, API 변경을 식별한다. 데이터 흐름을 보여 주는 텍스트 기반 블록 다이어그램(예: ASCII 또는 Mermaid)을 포함한다.
3.  **초안 파일 갱신 (MANDATORY)**: 파일 쓰기 도구로 `design_draft.md`에 "Technical Plan" 섹션을 추가하거나 삽입하도록 갱신한다.
4.  **알림과 검증 (채팅에 덤프 금지)**: 기술 계획을 채팅에 출력하는 것은 **엄격히 금지**된다. 대화체 채팅 텍스트로 Technical Plan이 추가되었음을 알리고, 클릭 가능한 링크나 경로를 제공한 뒤 `Technical Plan`에 대한 섹션 승인 게이트를 제시한다.

### Step 4: 대안 초안 작성

1.  **대안 검토**: 수집한 컨텍스트의 `Alternatives Weighed` 섹션에서 brainstorm 중에 기각된 대안을 읽는다. 초안 작성은 새 세션에서 자주 이어지므로 기억에 의존하지 않는다. 해당 섹션이 없으면 어떤 대안이 기각되었고 이유가 무엇인지 사용자에게 묻는다.
2.  **내용 작성**: "Alternatives Considered" 섹션을 평이한 영어 Markdown 형식으로 작성한다.
3.  **이유 상세화**: 각 대안마다 *왜* 기각되었는지 명시한다(예: 높은 지연 시간, 확장성 한계, 팀의 익숙하지 않음). 작성자의 결정은 `Rejected by author: [technical rationale]` 형식으로 기록한다. upstream maintainer의 issue, discussion, PR URL을 인용하는 경우가 아니면 `Rejected by maintainer`라고 쓰지 않는다.
4.  **초안 파일 갱신 (MANDATORY)**: 파일 쓰기 도구로 `design_draft.md`에 "Alternatives Considered" 섹션을 추가하거나 삽입하도록 갱신한다.
5.  **알림과 검증 (채팅에 덤프 금지)**: 대안을 채팅에 출력하는 것은 **엄격히 금지**된다. 대화체 채팅 텍스트로 Alternatives 섹션이 추가되었음을 알리고, 클릭 가능한 링크나 경로를 제공한 뒤 `Alternatives Considered`에 대한 섹션 승인 게이트를 제시한다.

### Step 5: 구현 초안 작성

기능을 어떻게 구현할지에 초점을 맞춰 상세한 구현 계획을 작성한다. 이 계획은 상세해야 한다. 계획만 보고도 중대한 결정을 새로 내리지 않고 구현할 수 있을 만큼 질문하고 세부 내용을 채운다. 다음 지침을 따른다.

1.  **단일 구현 목록**: 필요한 모든 작업을 하나의 통합된 섹션에 나열한다.
2.  **파일 나열**: 변경, 생성, 삭제되는 파일을 **모두** 나열한다. 갱신이 필요한 문서, 스키마, 설정, proto, 테스트 파일도 포함한다. 계획이 건드리는 모든 파일에 대한 참조를 **반드시** 포함한다.
3.  **근거**: 모든 파일에는 *무엇이* 바뀌는지와 *왜* 그 변경이 필요한지 설명하는 근거를 함께 적는다.
4.  **링크 형식**: 파일 경로를 알고 있으면 전체 경로를, 아니면 명확한 basename을 제공한다. 같은 패키지 내부나 형제 문서 링크에는 상대 경로(예: `./sub/README.md` 또는 `../sibling/README.md`)를 사용한다.
5.  **코드 금지**: 이 설계 초안에 실제 구현 코드를 작성하지 않는다. 의사 코드(pseudocode), API, 스키마는 허용한다.
6.  **초안 파일 갱신 (MANDATORY)**: 파일 쓰기 도구로 `design_draft.md`에 "Detailed Implementation" 섹션을 추가하거나 삽입하도록 갱신한다.
7.  **알림과 검증 (채팅에 덤프 금지)**: 구현 계획을 채팅에 출력하는 것은 **엄격히 금지**된다. 대화체 채팅 텍스트로 Detailed Implementation Plan이 추가되었음을 알리고, 클릭 가능한 링크나 경로를 제공한 뒤 `Detailed Implementation`에 대한 섹션 승인 게이트를 제시한다.

### Step 6: 설계 문서 최종화

설계 문서를 작성하거나 저장하라는 요청을 받으면 다음 규칙을 엄격히 따른다.

1.  **선행 컨텍스트와 대조**: 여기서는 초안을 Zoom Out 기준으로 채점하지 않는다. 초안을 쓴 세션은 그 기준에 동의한 상태이며, 이 검사는 `/egm-review`의 Stage 5가 새 컨텍스트에서 수행한다. 대신 Step 1에서 수집한 컨텍스트를 다시 읽고 초안과 비교한다. 이 검사는 brief를 읽지 않는 Goldfish는 수행할 수 없다.
    *   **Contradiction (모순)**: brief가 어떤 질문을 결정했는데 초안이 다르게 결정한 경우. 모두 보고한다.
    *   **Addition (추가)**: 초안이 brief에서 다루지 않은 질문을 결정한 경우. 아키텍처, 외부 인터페이스, 의존성을 바꾸는 경우에만 보고한다.

    모순을 먼저, 항목당 한 줄로 나열하고 brief와 초안을 각각 인용한다. 각 항목에 대해 사용자가 결정하도록 요청한다. 코드를 읽는 과정에서 brainstorm이 알지 못한 사실이 드러났을 수 있으므로, 초안이 맞을 수 있다. 따라서 임의로 초안을 brief에 맞춰 바꾸지 않는다. 차이가 없으면 그렇다고 한 줄로 말한다. Step 1에서 선행 파일을 찾지 못했으면 이 단계를 건너뛴다.

    미해결 모순이 있으면 중단하고 사용자의 답을 기다린다. 각 결정은 Step 6.2로 넘어가기 전에 `design_draft.md`에 반영한다.

2.  **대상 디렉터리**: 사용자가 대상 디렉터리나 파일을 지정했으면 그것을 사용한다. 아니면 워크스페이스에서 기존 설계 디렉터리(`Context File`의 디렉터리, `docs/designs/`, `<project>/docs/designs/`)를 찾아 `[DiscoveredPath]`를 정하고(기본값은 `docs/designs/`), 단일 선택 게이트를 제시한다(하네스에 있으면 `len(questions) == 1`이고 `is_multi_select: false`인 `ask_question` 같은 구조화된 질문 도구를 사용하고, 없으면 일반 채팅으로 제시한다).

    ```json
    {
      "questions": [
        {
          "question": "Where should the design be saved?",
          "options": [
            "Save to detected directory: [DiscoveredPath]",
            "Specify custom target directory"
          ],
          "is_multi_select": false
        }
      ]
    }
    ```

    *   **Option 0**: `<DESIGN_DIR>`을 `[DiscoveredPath]`로 설정한다.
    *   **Option 1**: 직접 입력 텍스트에 사용자 지정 경로가 있으면 `<DESIGN_DIR>`을 그 경로로 설정한다. 직접 입력이 비어 있으면 채팅에서 `"Please specify the custom target directory path where you would like to save the design document."`라고 요청하고 실행을 멈춘다.

3.  **Sitemap 갱신**: `<DESIGN_DIR>/SITEMAP.md`가 있으면 새 설계를 그 파일에 등록한다(Link, Date, Author, Components, Description).

4.  **문서 작성**: 최종화가 끝나면 파일 쓰기 도구로 `design_draft.md`의 내용을 지정된 대상 파일 `<DESIGN_DIR>/<FEATURE>.md`에 쓴다. 최종 구조는 [템플릿](references/design_doc.md)을 따르며, 필요하면 조정한다.

5.  **포맷 정리**: 깔끔한 표준 Markdown 포맷, 유효한 표 문법, 올바른 코드 블록 펜스를 보장한다.

6.  **인계**: 완성된 설계 문서로 가는 클릭 가능한 링크를 제공하고, 사용자에게 `egm-review` 스킬을 `<DESIGN_PATH>`에 대해 시작해 검토할 것을 권한다. 호스트의 명령 형식을 사용한다(예: Claude Code와 agy CLI에서는 `/egm:egm-review <DESIGN_PATH>`, Codex에서는 스킬 선택기).
