# 테스트 계획: Goldfish Review Resolve 스킬

Frontmatter와 링크 검사는 `pytest tests/unit`에서 실행한다([TESTING.md](../../TESTING.md) 참고).

## 프로토콜 검증 체크리스트

chat에서 `egm-resolve`를 대화형으로 평가하거나 탐색할 때 다음을 확인한다.

-   **Step 1 (Intake & Context):** `TargetFile`, `LineRange`, `FindingsList`를 입력으로 받는다.
-   **Step 2 (Evaluate & Categorize):** 검증 가능한 증거로 타당한 설계 선택을 방어하고(`CONTEST`), 어떤 검토 파일도 뒷받침하지 않는 반박을 사용자에게 넘기며(`ESCALATE`), 구체적인 수정안을 작성하고(`PROPOSE FIX`), 수정 없이 Nit을 기록한다(`DECLINE`).
-   **Step 3 (Report Fixes):** `goldfish_review_report.md` artifact를 생성한다.
-   **Step 4 (Resolution Gate):** 모달 팝업 없이 명확한 결정 선택지(Auto accept, Continue, Interactive breakdown)를 사용자에게 제시하고, 승인된 파일 수정을 실행한다.
