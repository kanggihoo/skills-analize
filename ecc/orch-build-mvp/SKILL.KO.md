---
name: orch-build-mvp
description: 설계 또는 명세 문서로부터 동작하는 MVP를 부트스트랩합니다 — SDD/PRD를 수집하고, 얇은 수직 슬라이스를 계획하고, 첫 번째 종단간(end-to-end) 슬라이스를 스캐폴딩한 뒤, generator-evaluator 빌드 루프를 리뷰와 게이트가 적용된 feat 커밋과 함께 진행합니다. 설계 또는 명세 문서를 계획된 수직 슬라이스를 통해 실행 가능한 MVP로 만들어야 할 때 사용합니다.
metadata:
  origin: ECC
---

# orch-build-mvp

행위자 · 동작 · 대상: **orch · build · mvp**. 공유 엔진인 [`orch-pipeline`](../orch-pipeline/SKILL.md)을 감싸는 얇은 래퍼입니다.

## 사용 시점

- 사용자가 **설계 / 명세 문서**(SDD, PRD, system_design)를 가지고 있으며, 이로부터 동작하는 수직 슬라이스를 부트스트랩하려 할 때
- 인자로 문서 경로를 받습니다. 예: `civicpulse/docs/SDD-v0.6.md`

## 동작 설정

- **기본 규모 하한:** large — 스캐폴딩을 포함한 전체 파이프라인입니다
- **단계 마스크:** 0(명세 읽기) → 1 → 2(집중) → 3(스캐폴드) → 4 → 5 → 6
- **첫 동작 (0 → 2단계):** 문서를 읽고 범위, 확정된 결정 사항, 기능 목록을 추출합니다. 이를 **얇은 수직 슬라이스**로 정렬합니다(모든 모델을 먼저, 그다음 모든 뷰를 만드는 방식이 아니라, 종단간 경로 하나를 먼저 만듭니다). 3단계에서 그 첫 슬라이스를 세웁니다.

## 동작 방식

1. 위 설정으로 `orch-pipeline` 엔진을 실행합니다.
2. 반복 루프를 직접 만드는 대신 **기존 GAN 하네스를 재사용합니다**:
   - SDD를 `gan-harness/spec.md`와 `gan-harness/eval-rubric.md`로 변환합니다(이미 명세가 있으므로 `gan-planner`가 생성했을 내용을 대신합니다).
   - `/gan-build "<one-line brief>" --skip-planner`로 빌드를 진행합니다
     (기본값: `--max-iterations 15`, `--pass-threshold 7.0`, `--eval-mode playwright`. UI가 없는 슬라이스에는 `--eval-mode code-only`를 사용합니다).
   - 이 명령은 `gan-generator` → `gan-evaluator` 루프를 실행하고, 점수가 통과하거나 정체될 때까지 `gan-harness/feedback/feedback-NNN.md`를 작성합니다.
3. **Gate 1**(슬라이스 계획)과 **Gate 2**(커밋 전 확인)에서 멈춥니다. 스캐폴드와 각 슬라이스는 별도의 `feat:` 커밋으로 커밋합니다.
4. 보안 트리거에 해당하는 슬라이스가 있으면 `security-reviewer`를 추가합니다.

## 예시

```
orch-build-mvp: civicpulse/docs/SDD-v0.6.md
→ read SDD → slice list (vertical) → scaffold slice 1  [GATE 1: approve]
→ /gan-build --skip-planner (generator → evaluator loop) scores vs spec → review
→ commit feat:  [GATE 2: confirm] → next slice
```
