---
name: orch-refine-code
description: 동작을 보존하는 리팩터링을 오케스트레이션합니다 — 테스트가 녹색인지 확인하고, 동작을 바꾸지 않으면서 구조를 재편하고, 테스트를 녹색으로 유지하며, 리뷰하고 게이트가 적용된 커밋을 합니다. 구조는 개선되어야 하지만 동작은 바뀌면 안 될 때 사용합니다.
metadata:
  origin: ECC
---

# orch-refine-code

행위자 · 동작 · 대상: **orch · refine · code**. 공유 엔진인 [`orch-pipeline`](../orch-pipeline/SKILL.md)을 감싸는 얇은 래퍼입니다.

## 사용 시점

- 동작은 같고, **구조가 더 좋아져야** 할 때: 모듈 추출, 중복 제거, 죽은 코드 제거, 중첩 감소, 명확성을 위한 이름 변경
- 유사한 스킬과 구분하면: 동작이 조금이라도 바뀌어야 한다면 이 스킬은 맞지 않습니다(`orch-change-feature` / `orch-fix-defect`).

## 동작 설정

- **기본 규모 하한:** standard — 리팩터링은 여러 파일에 걸칩니다
- **단계 마스크:** 0 → 2(재구조화 계획) → 4(녹색 유지) → 5 → 6. 새 동작 테스트는 작성하지 않습니다. 기존 테스트 스위트가 안전망입니다.
- **첫 동작 (4단계):** 코드를 건드리기 **전에** 관련 테스트가 존재하고 **녹색인지** 확인합니다. 커버리지가 부족하면 먼저 특성화(characterization) 테스트를 추가합니다. 그다음 작은 단계로 재구조화하며, 각 단계마다 테스트를 다시 실행합니다.

## 동작 방식

1. 위 설정으로 `orch-pipeline` 엔진을 실행합니다.
2. 죽은 코드나 중복 정리는 `refactor-cleaner` 에이전트에 위임합니다(knip / depcheck / ts-prune을 실행하고 안전하게 제거합니다).
3. **Gate 1**(재구조화 계획)과 **Gate 2**(커밋 전 확인)에서 멈춥니다.
4. `refactor:`로 커밋합니다 — diff는 동작에 영향이 없어야 합니다.

## 예시

```
orch-refine-code: extract the NWS HTTP client out of poller.py
→ confirm tests green → plan extraction  [GATE 1: approve]
→ move in small steps, tests green throughout → code-review
→ commit refactor:  [GATE 2: confirm]
```
