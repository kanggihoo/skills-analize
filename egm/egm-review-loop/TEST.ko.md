# Test Plan: Goldfish Review Loop Skill

Frontmatter 및 링크 검사는 `pytest tests/unit`에서 실행한다(see [TESTING.md](../../TESTING.md)).

## Protocol Verification Checklist

채팅에서 `egm-review-loop`을 대화형으로 평가하거나 살펴볼 때 다음을 확인한다.

-   **Step 1 (Intake & Config):** 필수 입력을 검증하고, 기준 경로를 해석하며, 첫 라운드 전에 `GoldfishContext`의 각 URL을 파일로 저장한다. 저장할 수 없는 페이지는 로컬 사본을 요청한다.
-   **Step 2.1 (Target Resolution):** 감사 전에 줄 번호를 무조건 다시 스캔한다.
-   **Step 2.2 (Review Swarm):** 요청된 기준 전체에 대해 하위 에이전트를 생성한다(또는 degraded 모드에서는 페르소나를 순차적으로 반복한다).
-   **Step 2.3 & 2.4 (Resolve Handoff & Turn Boundary):** 발견 사항을 `egm-resolve`에 넘기고 사람의 결정 게이트를 존중한다.
-   **Step 2.4 (Round Control):** contested 및 accepted 발견 사항은 settled 상태로 유지하고, 리뷰어가 다시 지적한 fixed 발견 사항은 재개한다. 수정을 적용하기 전에 clean 라운드를 판단한다. 실패한 리뷰어(및 synthesizer 요약에 상태가 없는 리뷰어)는 not run으로 기록한다. 연속 clean 라운드가 두 번이면 멈춘다. 5라운드 cap이나 churn에서는 사용자에게 묻는다.
