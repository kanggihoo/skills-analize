# 테스트 계획: EGM Brainstorm 스킬

Frontmatter 및 링크 검사는 `pytest tests/unit`에서 실행한다([TESTING.md](../../TESTING.md) 참고).

## 프로토콜 검증 체크리스트

채팅에서 `egm-brainstorm`을 대화형으로 평가하거나 살펴볼 때 다음을 확인한다.

-   **Step 1 (Open-Ended Clarification & Gate):** 반쯤 완성된 개념을 개방형 채팅 질문으로 파고들며(구조화된 질문 도구나 객관식 목록 없이), subagent를 호출하기 전에 사용자 준비 확인 게이트를 강제하는지 확인한다.
-   **Step 2 (Upstream Multi-Lens Ideation):** 기능 개념을 6개 전문 Goldfish 관점 렌즈(Contrarian/YAGNI, Cost/Quota Economics, UX Ergonomics, Migration & Compatibility, Observability & SRE, Tech Debt & Maintenance)로 평가하는지 확인한다.
-   **Step 3 & 4 (Concepts Brief Deliverable & Handoff):** 종합된 `concepts_brief.md` artifact를 작성해 사용자 검토용으로 저장하고, `/egm-draft`로 인계하는지 확인한다.
