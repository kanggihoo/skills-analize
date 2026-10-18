---
name: principle-laziness-protocol
description: "Apply when refactoring, evaluating diff size, or tempted to add abstractions, layers, or signal threading. Bias toward deletion and the smallest change that solves the problem."
disable-model-invocation: true
---

# 게으름 프로토콜

가장 적은 코드와 복잡도로 가장 큰 결과를 내는 것을 목표로 하라.

- **삭제를 우선하라.** 리팩터링이나 개선을 요청받으면, 추가보다 제거할 것을 먼저 찾아라.
- **호출 계층을 평평하게 유지하라.** 깊은 호출 체인을 피하라. 실질적인 작업을 숨기는 풍부한 인터페이스는 깊은 호출 체인이 아니다. 질문에 답하려면 3개를 넘는 파일이나 계층을 거쳐야 한다면, 평평하게 만들어라.
- **결정을 한곳으로 모아라.** 같은 선택을 여러 곳에 반복하지 마라. 하나의 진실 공급원 뒤에 두고, 결과를 단순한 플래그로 넘겨라.
- **diff를 최소화하라.** 문제를 해결하는 가장 작은 변경을 하라. "우아한" 보일러플레이트보다 적은 줄이 낫다.
- **전달 경로를 의심하라.** 작업이 타입, 스키마, 파이프라인, 또는 그와 비슷한 계층들을 통해 새로운 신호를 전달하라고 요구하면, 멈추고 더 직접적인 경로가 있는지 찾아라.
- **작은 누수를 메워라.** 사소한 pass-through, 표현 누수, 중복된 선택은 퍼지기 전에 제거하라. 작은 누수는 쌓여서 영구적인 조정 비용이 된다.

**테스트:** 사람인 개발자가 이 코드를 유지보수하느라 지치게 된다면, 그것은 나쁜 해법이다.
