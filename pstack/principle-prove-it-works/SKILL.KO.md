---
name: principle-prove-it-works
description: "Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'"
disable-model-invocation: true
---

# 작동을 증명하라

모든 작업 결과는 실제 대상을 직접 확인해서 검증한다. 대리 지표, 자기 보고, "컴파일된다"는 사실로 추론하지 않는다.

**이유:** 검증되지 않은 작업은 정확성을 알 수 없다. 간접 검증(파일 수정 시각, 출력 최신성, 에이전트의 자기 보고, 캐시된 스크린샷)은 직접 관찰보다 저렴해 보이지만, 잘못된 추론에 따라 행동하는 비용은 원본을 확인하는 비용보다 훨씬 크다.

실제 대상을 확인하고, 대리 지표는 확인하지 않는다:
- 파생된 상태를 거치지 않고 프로세스가 살아 있는지 직접 확인한다
- 캐시되었거나 파생된 표현이 아니라 실제 값을 읽는다
- 검증이 실패하면 시스템을 의심하기 전에 관찰 방법을 먼저 의심한다

## 가능하면 검사를 스크립트로 만든다

가장 강력한 증명은 일회성 눈대중이 아니라, 같은 비교를 다시 실행하는 결정적 스크립트다. 스크립트를 작성하고 실행한 뒤, 그 출력을 리뷰어가 다시 실행할 수 있는 산출물로 남긴다. 작성자의 말을 믿게 하지 않는다.

산출물은 사람이 볼 수 있게 둔다. 큰 포팅이나 마이그레이션처럼 나중에 감사 가능한 흔적이 필요한 대규모 또는 복잡한 작업에 한해서만 커밋한다(**show-me-your-work** 스킬).
