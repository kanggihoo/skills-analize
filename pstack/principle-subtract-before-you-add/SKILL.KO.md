---
name: principle-subtract-before-you-add
description: "Apply when sequencing an addition, refactor, or rewrite. Remove dead code, redundant validators, and stub references first, then build on the simpler base."
disable-model-invocation: true
---

# 더하기 전에 빼라

시스템을 발전시킬 때 먼저 복잡도를 제거한 뒤 구축한다.

**이유:** 복잡한 시스템에 더하면 복잡도가 누적된다. 먼저 제거하면 코드가 줄고, 본질적인 구조가 드러나며, 다음 설계가 대개 자명해진다. 기본값은 빼기다.

단순화를 지속적인 투자로 삼는다. 발견했을 때와 같은 표면, 또는 더 작은 표면 뒤에서 설계를 조금 더 단순하고 더 유능하게 남긴다.

**패턴:**
- 구축보다 제거를 먼저 순서화한다
- 다듬기 전에 잘라낸다(품질에 투자하기 전에 최소한까지 줄인다)
- 추측성 가장자리 사례가 아니라 관찰된 사용에 맞춰 설계한다
- 명세가 요구하는 것 이상의 추측성 검증기, 파서, 가드를 만들지 않는다
- 프롬프트를 단순화한다(중복된 지시, 과도한 템플릿을 제거)
- 새로운 내용이 없는 참조는 스텁으로 남기지 말고 삭제한다
