---
name: principle-exhaust-the-design-space
description: "Apply when facing a novel UI interaction or architectural decision with no precedent in the codebase. Build 2-3 competing prototypes and compare side by side before committing."
disable-model-invocation: true
---

# 설계 공간을 남김없이 탐색하기

새로운 상호작용이나 아키텍처 결정에 확립된 선례가 없다면, 구현하기 전에 여러 구체적인 대안을 탐색하라. 세 가지 옵션을 탐색하는 비용보다 잘못된 것을 만드는 비용이 더 크다.

**규칙.** 정답이 명확하지 않을 때는 경쟁하는 프로토타입이나 스케치를 2~3개 만든다. 나란히 비교한다. 그다음에야 확정한다. "두 번 설계하라"는 이 규칙의 다른 표현이다. 첫 번째 형태의 변형 하나를 더 만드는 것은 여기에 해당하지 않는다.

**적용되는 경우:**
- 새로운 UI 상호작용 (코드베이스에 선행 사례가 없음)
- 여러 가지 실행 가능한 접근이 있는 아키텍처 선택
- 사용자 경험이 논리가 아니라 체감에 달려 있는 제품 설계 결정

**적용되지 않는 경우:**
- 패턴이 확립된 기계적 구현
- 목표 상태가 명확한 버그 수정이나 리팩터링
- 제약이 단 하나의 실행 가능한 접근만을 강제하는 변경
