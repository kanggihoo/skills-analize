---
name: orch-change-feature
description: 기존의 동작하는 기능을 새로운 원하는 동작으로 변경하도록 오케스트레이션합니다 — 테스트를 새 명세에 맞게 업데이트하고, 구현을 그에 맞게 변경한 뒤, 리뷰하고 게이트가 적용된 커밋을 합니다. 동작이 깨진 것은 아니지만 달라져야 할 때 사용합니다.
metadata:
  origin: ECC
---

# orch-change-feature

행위자 · 동작 · 대상: **orch · change · feature**. 공유 엔진인 [`orch-pipeline`](../orch-pipeline/SKILL.md)을 감싸는 얇은 래퍼입니다.

## 사용 시점

- 기존 기능은 **동작하지만**, 원하는 동작이 다를 때("change", "adjust", "make it also …", "instead of X do Y")
- 유사한 스킬과 구분하면:
  - **깨진 것이 아님** → `orch-fix-defect`가 아닙니다(재현할 버그가 없습니다).
  - **새로운 것이 아님** → `orch-add-feature`가 아닙니다(기능이 이미 존재합니다).

## 동작 설정

- **기본 규모 하한:** small — 대부분의 조정은 함수 한두 개입니다
- **단계 마스크:** 0 → (새 동작에 조사가 필요한 경우에만 1) → 가벼운 2 → 4 → 5 → 6
- **첫 동작 (4단계):** *기존* 테스트를 새로운 원하는 동작을 표현하도록 업데이트한 뒤, 테스트가 통과할 때까지 구현을 변경합니다. 테스트를 먼저 바꾸는 것이 조정과 수정을 구분하는 기준입니다.

## 동작 방식

1. 위 설정으로 `orch-pipeline` 엔진을 실행합니다.
2. 계획은 가볍게 유지합니다. `standard` 이상의 규모에서만 전체 `planner` 단계가 필요합니다.
3. **Gate 1**(계획 / 변경된 테스트 승인)과 **Gate 2**(커밋 전 확인)에서 멈춥니다.
4. 변경이 보안 트리거에 해당하면 `security-reviewer`를 추가합니다.

## 예시

```
orch-change-feature: make nws-poller alert at 2 warnings instead of 3
→ update threshold tests to new spec → change impl to green
→ code-review → commit  [GATE 2: confirm]
```
