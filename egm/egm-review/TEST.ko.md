# 테스트 계획: EGM Review & Subagents

Frontmatter와 링크 검사는 `pytest tests/unit`에서 실행한다([TESTING.md](../../TESTING.md) 참고).

## Protocol Verification Checklist

채팅에서 `egm-review`를 대화형으로 평가하거나 살펴볼 때 다음을 확인한다.

-   **Step 1 (Intake):** `TargetFile`과 선택 항목인 `GoldfishContext`를 수집한다.
    `GoldfishContext`를 받는 첫 단계 전에, 작업 디렉터리 안의 linked file을 추가하고, 밖으로 해석되는 링크나 URL은 추가하기 전에 묻고, 각 URL을 파일로 저장해 `GoldfishContext`에 넣는다.
-   **Step 2 (Preset Selection):** 네 가지 리뷰 preset(interactive, consolidated, feature spec only, implementation plan only)을 제시하거나, 명시된 `Step` 인자를 해당 preset 또는 개별 단계 subflow에 매핑한다.
-   **Step 3 (Semantic Split):** Feature Spec과 Detailed Implementation Plan 사이의 split 행을 찾는다.
-   **Subflows:** Zoom Out, Comprehension, Critic Review, Readiness Test를 올바른 subagent에 위임한다.
