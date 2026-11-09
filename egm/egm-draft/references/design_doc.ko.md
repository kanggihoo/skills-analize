# [Feature/Project Name]

*   **Author:** [Author Name or GitHub Handle]
*   **Status:** [Draft | Proposed | In Review | Approved]
*   **Date:** [YYYY-MM-DD]

--------------------------------------------------------------------------------

## Overview

<!-- 기능의 고수준 요약, 해결하려는 비즈니스 또는 기술 문제, 시스템 안에서의 맥락을 제공한다. 사람과 에이전트 모두가 주요 목표를 빠르게 파악할 수 있도록 간결하게 쓴다.
-->

## The Problem

[문제와 제안된 해결 방향을 요약한다.]

## Goals

<!--
이 기능이 무엇을 달성하는가? 구체적이고 측정 가능하며 명확하게 쓴다.
이 목표들이 성공의 절대적 기준이다.
-->

*   Goal 1
*   Goal 2

## Non-Goals

<!--
범위 밖인 것을 명시적으로 적는다. 기능 확장(feature creep)을 막고, 구현 에이전트를 위한 엄격한 경계를 정의하는 데 필수적이다.
-->

*   Non-Goal 1
*   Non-Goal 2

## Open Questions

<!--
해결되지 않은 설계 질문, 기술적 미지수, 조사가 필요한 의존성을 나열한다. 미해결 질문은 대화 기억을 보존하고 이후 세션이 이미 논의된 질문을 다시 묻지 않도록 여러 초안 작성 세션에 걸쳐 유지한다. 해결된 질문은 제거한다.
-->

*   **Question 1**: [기술적 미지수 또는 미해결 질문 설명]
*   **Question 2**: [기술적 미지수 또는 미해결 질문 설명]

## Critical User Journeys (CUJs)

<!--
이 설계가 가능하게 하는 엔드 투 엔드 사용자 여정을 정의한다. 각 CUJ에는 다음이 포함되어야 한다.

1. Given: 전제 조건, 시작 상태, 환경 설정.
2. When: 트리거, 사용자 행동, 또는 시스템 이벤트.
3. Then: 기대 결과, 검증 기준, 사후 조건(postcondition).
-->

### CUJ 1: [Journey Title]

*   **Given**: [전제 조건]
*   **When**: [행동]
*   **Then**: [기대 결과]

### CUJ 2: [Journey Title]

*   **Given**: [전제 조건]
*   **When**: [행동]
*   **Then**: [기대 결과]

## Technical Plan (Architecture)

<!-- 고수준 설계, 아키텍처 선택, 시스템 데이터 흐름, 컴포넌트 상호작용을 자세히 설명한다. 관계를 명확히 모델링하기 위해 ASCII 또는 Mermaid 다이어그램을 포함한다.
-->

[아키텍처 선택, 데이터 구조, 시스템 컴포넌트 매핑을 설명한다.]

```text
[선택 사항: ASCII 아키텍처 다이어그램]
```

## Alternatives Considered

<!-- 평가했지만 기각한 다른 아키텍처 접근이나 설계를 기록한다. 선택된 계획이 더 나은 이유에 대한 장단점과 기술적 근거를 설명한다.
-->

### Alternative A: [Alternative Title]

*   **Pros**: [장점 나열]
*   **Cons**: [단점 나열]
*   **Reason for Rejection**: [이 옵션이 선택되지 않은 이유 (예: "Rejected by author: technical rationale"). 링크 없이 maintainer에게 기각 사유를 돌리지 않는다.]

--------------------------------------------------------------------------------

## Non-Functional Requirements

<!-- 이 설계에 치명적인 위험이 될 때만 비기능 요구사항을 분석한다.

- Security & Privacy: (데이터 민감도, 인증/인가, 시크릿 관리).
- Performance & Latency: (실행 시간, 저장 공간, LLM 토큰 오버헤드).
- Rollout & Rollback: (기능 플래그, 하위 호환성, 롤백 명령).
-->

[치명적인 비기능 요구사항을 자세히 적는다. 없으면 이 섹션을 생략하거나 "None"으로 표기할 수 있다.]

--------------------------------------------------------------------------------

### Additional Resources

<!-- 설계 논의 중에 사용한 외부 리소스와 컨텍스트를 명시한다. 선택 사항이다. 제공된 것이 없으면 이 섹션을 생략한다.-->

*   Important project docs referenced
*   Important docs/ referenced
*   Related work

### Future Improvements

<!-- 향후 개선의 여지가 있는 영역을 명시한다. 없으면 이 섹션을 생략한다.-->

*   **The idea**: 무엇을 개선할 수 있는가?

--------------------------------------------------------------------------------

## Detailed Implementation Plan

<!-- 반드시 생성하거나 수정해야 할 파일을 정확히 명시한다. 모호한 표현이나 TBD를 사용하지 않는다.
-->

### Target Files to Create/Modify

#### 1. `[File Path 1]` ([Create | Modify])

*   **Type / Scope**: [예: Python Service, C++ Library, TypeScript Module, Build
    Configuration]
*   **Proposed Changes**: [새 API, 클래스/함수 시그니처, 또는 동작 로직을 설명한다. 구현에 필요한 최소한의 세부 사항에 집중한다.]

#### 2. `[File Path 2]` ([Create | Modify])

*   **Type / Scope**: [예: Unit Test, E2E Test Driver]
*   **Proposed Changes**: [테스트 커버리지, 예상 테스트 케이스, 또는 mock 검증(assertion)을 설명한다.]

### Verification Plan

<!-- 구현을 검증하기 위해 통과해야 하는 unit, integration, 수동 테스트를 명시한다. 성공을 검증하기 위해 어떤 지표를 측정해야 하는가?
-->

*   **Compilation/Build**: [예: `npm run build`, `cargo build`, `make`]
*   **Unit Tests**: [예: `pytest`, `npm test`, `cargo test`]
*   **Static Analysis & Linting**: [예: `eslint`, `ruff check`, `golangci-lint`]
*   **Test Coverage Requirement**: [예: 85%+ branch coverage]
*   **E2E/Integration**: [예: Integration test 명령 또는 자동화된 eval runner]

--------------------------------------------------------------------------------

<!-- Provenance: EGM을 통한 초기 구조 초안 작성을 나타낸다. -->

*Drafted with EGM*
