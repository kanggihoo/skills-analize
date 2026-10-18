---
name: principle-outcome-oriented-execution
description: "Apply during planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture; don't preserve smooth intermediate states with throwaway compatibility code."
disable-model-invocation: true
---

# 결과 지향 실행

중간 단계의 매끄러운 상태를 유지하기보다, 의도된 검증 가능한 최종 상태를 최적화한다.

**이유:** 모든 중간 단계를 완전히 안정적으로 유지하려다 보면 임시 호환성 코드가 만들어지고, 그것이 오래 남는 기술 부채가 된다. 목표 아키텍처로 수렴하고, 명시적인 검증 경계에서 정확성을 증명한다.

**핵심 규칙:**
- 전환 단계의 안정성보다 최종 상태의 무결성을 우선한다
- 계획되고, 범위가 정해지고, 되돌릴 수 있는 경우에 한해 중간 단계의 깨짐은 허용된다

**가이드라인:**
- 명시적 단계 경계가 있는 계획된 재작성과 마이그레이션에 사용한다
- 일시적 깨짐이 허용되는 영역을 선언한다
- 마이그레이션하는 동안 실제로 건드리는 영역에는 신호가 강한 검사를 유지한다
- 계획 완료 시점에는 정적 및 런타임 검증을 전부 요구한다
