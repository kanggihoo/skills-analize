---
name: orch-fix-defect
description: 버그를 수정하도록 오케스트레이션합니다 — 실패하는 회귀 테스트로 재현하고, 녹색이 될 때까지 수정한 뒤, 리뷰하고 게이트가 적용된 커밋을 합니다. 각 단계는 해당 ECC 에이전트에 위임합니다. 기존 동작이 깨졌거나 잘못되었을 때 사용합니다.
metadata:
  origin: ECC
---

# orch-fix-defect

행위자 · 동작 · 대상: **orch · fix · defect**. 공유 엔진인 [`orch-pipeline`](../orch-pipeline/SKILL.md)을 감싸는 얇은 래퍼입니다.

## 사용 시점

- 무언가 **깨졌을** 때: 잘못된 출력, 오류, 크래시, 회귀
- 유사한 스킬과 구분하면:
  - 동작은 올바르지만 다르게 만들고 싶다면 → `orch-change-feature`.
  - 기능이 아직 존재하지 않는다면 → `orch-add-feature`.

## 동작 설정

- **기본 규모 하한:** small (대개 사소합니다)
- **단계 마스크:** 0 → (근본 원인이 명확하지 않거나 standard 이상일 때만 가벼운 2) → 4 → 5 → 6. 조사(1)는 보통 건너뜁니다.
- **첫 동작 (4단계):** 버그를 **새로운 실패** 테스트(회귀 테스트)로 재현한 뒤, 녹색이 될 때까지 수정합니다. 버그가 존재함을 먼저 증명하는 것이 수정과 조정을 구분하는 기준입니다.

## 동작 방식

1. 위 설정으로 `orch-pipeline` 엔진을 실행합니다.
2. 근본 원인이 불분명하면, 붉은색(실패) 테스트 전에 `code-explorer`로 범위를 파악합니다. 빌드 오류는 `build-error-resolver` / `/build-fix`로 넘깁니다.
3. **Gate 1**(계획이 생성된 경우에만)과 **Gate 2**(커밋 전 확인)에서 멈춥니다.
4. 결함이 보안에 민감한 경로에 있으면 `security-reviewer`를 추가합니다.

## 예시

```
orch-fix-defect: poller crashes on empty NWS response
→ write failing test reproducing the crash → fix to green
→ code-review → commit  [GATE 2: confirm]   (commit: fix:)
```
