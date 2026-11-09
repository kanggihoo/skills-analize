# 테스트 계획: EGM Draft 스킬

Frontmatter와 링크 검사는 `pytest tests/unit`에서 실행한다 (see [TESTING.md](../../TESTING.md)).

## 프로토콜 검증 체크리스트

채팅에서 `egm-draft`를 대화형으로 평가하거나 살펴볼 때 다음을 확인한다.

-   **Step 4 (Alternatives):** brief의 `Alternatives Weighed` 섹션에서 기각된 대안을 읽고, 해당 섹션이 없으면 사용자에게 묻는다.
-   **Step 6 (Finalize):** 디렉터리를 고르기 전에 brief와 초안 사이의 모순을 보고하고, 사용자가 각 모순을 결정할 때까지 기다린다. Zoom Out 기준으로 스스로 채점하지 않는다.
