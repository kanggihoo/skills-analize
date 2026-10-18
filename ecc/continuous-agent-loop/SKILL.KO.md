---
name: continuous-agent-loop
description: 품질 게이트, 평가(eval), 복구 제어를 갖춘 지속적 자율 에이전트 루프의 패턴입니다. 에이전트 루프가 스스로 점검하고, eval로 게이트를 걸고, 실패에서 복구해야 할 때 사용합니다.
metadata:
  origin: ECC
---

# 지속적 에이전트 루프

이것은 v1.8 이상의 정식 루프 스킬 이름입니다. `autonomous-loops`를 대체하며, 한 릴리스 동안은 호환성을 유지합니다.

## 루프 선택 흐름

```text
Start
  |
  +-- Need strict CI/PR control? -- yes --> continuous-pr
  |
  +-- Need RFC decomposition? -- yes --> rfc-dag
  |
  +-- Need exploratory parallel generation? -- yes --> infinite
  |
  +-- default --> sequential
```

## 결합 패턴

권장 프로덕션 스택:
1. RFC 분해 (`ralphinho-rfc-pipeline`)
2. 품질 게이트 (`plankton-code-quality` + `/quality-gate`)
3. eval 루프 (`eval-harness`)
4. 세션 영속성 (`nanoclaw-repl`)

## 실패 모드

- 측정 가능한 진전 없이 루프가 맴도는 현상
- 같은 근본 원인에 대한 반복 재시도
- 병합 큐 정체
- 제한 없는 에스컬레이션에서 생기는 비용 증가

## 복구

- 루프를 멈춥니다.
- `/harness-audit`을 실행합니다.
- 범위를 실패한 단위로 줄입니다.
- 명시적인 수용 기준과 함께 다시 실행합니다.
