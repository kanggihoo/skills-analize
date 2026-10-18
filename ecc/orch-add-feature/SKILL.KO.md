---
name: orch-add-feature
description: 완전히 새로운 기능을 처음부터 끝까지 오케스트레이션합니다 — 조사, 계획, TDD 구현, 리뷰, 게이트가 적용된 커밋을 각 단계마다 해당 ECC 에이전트에 위임합니다. 아직 존재하지 않는 기능을 추가할 때 사용합니다.
metadata:
  origin: ECC
---

# orch-add-feature

행위자 · 동작 · 대상: **orch · add · feature**. 공유 엔진인 [`orch-pipeline`](../orch-pipeline/SKILL.md)을 감싸는 얇은 래퍼입니다.

## 사용 시점

- 사용자가 **아직 존재하지 않는** 기능을 원할 때("add", "build", "implement", "support …")
- 완전히 새로운 동작이며, 수정(`orch-fix-defect`)이나 기존 동작의 변경(`orch-change-feature`)이 아닐 때

## 동작 설정

- **기본 규모 하한:** standard — 명백히 작은 경우가 아니라면 Research + Plan을 실행합니다
- **단계 마스크:** 0 → 1 → 2 → 4 → 5 → 6 (3 Scaffold는 건너뜁니다. 이는 MVP 전용입니다)
- **첫 동작 (4단계):** 새 동작에 대한 *새로운* 실패 테스트를 작성한 뒤, 녹색(통과)이 될 때까지 구현합니다

## 동작 방식

1. 위 설정으로 `orch-pipeline` 엔진을 실행합니다.
2. 먼저 규모를 분류합니다. 작거나 사소한 기능은 4 → 5 → 6으로 축소됩니다.
3. **Gate 1**(계획 승인)과 **Gate 2**(커밋 전 확인)에서 멈춥니다.
4. 기능이 보안 트리거에 해당하면 `security-reviewer`를 추가합니다.

> 관련: `/feature-dev`는 이 흐름의 독립형 버전입니다. `orch-add-feature`는 `orch-pipeline` 엔진을 공유한다는 점이 다릅니다. 즉 규모 분류기와 두 개의 게이트를 계열의 다른 스킬과 함께 사용하므로, 사소한 기능은 4 → 5 → 6으로 적절히 축소합니다.

## 예시

```
orch-add-feature: add OAuth2 login to nws-poller
→ research existing auth libs → plan task_list  [GATE 1: approve]
→ TDD each task → code-review (+ security-reviewer: auth path)
→ commit  [GATE 2: confirm]
```
