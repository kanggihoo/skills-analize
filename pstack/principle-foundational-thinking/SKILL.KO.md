---
name: principle-foundational-thinking
description: "Apply before writing logic: choosing core types and data structures, sequencing scaffold-vs-feature work, asking what concurrent actors share. Get the data structures right so downstream code becomes obvious."
disable-model-invocation: true
---

# 기반 사고

**구조적 결정**은 선택지의 가치를 지킨다. **코드 수준의 결정**은 단순성을 지킨다.

**데이터 구조가 먼저다.** 로직을 쓰기 전에 데이터 형태를 제대로 잡아라. 핵심 타입을 일찍 정의하고, 모든 접근 패턴을 추적하고, 주요 경로에 맞는 구조를 골라라.

코드 수준에서는 구조를 DRY하게 하되, 모든 줄을 DRY하게 하지는 마라. 타입과 데이터 모델은 하나로 수렴해야 한다. 비슷한 문장 세 개가, 섣부른 추상화보다 낫다. 암시적인 것보다 명시적인 것을 택하라. 줄 수가 아니라 동작과 엣지 케이스를 테스트하라.

**동시성 따름 정리.** 행위자들 사이에서 상태를 공유하기 전에, "다른 행위자가 이것을 동시에 수정하면 어떻게 되는가?"를 물어라. 답이 "아무 일도 없다"가 아니라면, 격리하라.

**스캐폴드가 먼저다.** 이후의 모든 단계에 도움이 되는 것이라면 먼저 하라. "이후의 모든 단계가 이것이 있는 덕을 보는가?"를 물어라. CI, 린팅, 테스트 인프라, 공유 타입이 스캐폴드다. 선택지의 가치를 위해 순서를 잡아라. 기능보다 설정이 먼저, 수정보다 테스트가 먼저. 커밋은 작고 목적이 하나이게 하라.

각 증분은 일관된 추상화를 하나 들여오거나, 이미 있는 추상화를 더 깊게 만들어야 한다. 새로운 기능을 여러 호출자에 걸쳐 특수 사례 조정 코드로 흩뿌리지 마라.

**빼기가 더하기보다 먼저다.** 기반을 깔기 전에 죽은 코드를 먼저 제거하라.
