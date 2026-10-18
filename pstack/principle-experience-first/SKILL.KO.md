---
name: principle-experience-first
description: "Apply when product, UX, or feature-scope tradeoffs come up. Choose user delight over implementation convenience; ship fewer polished features over more rough ones."
disable-model-invocation: true
---

# 경험 우선

구현의 편의와 사용자의 즐거움이 충돌하면, 즐거움을 택하라.

- 모든 기능, 컨트롤, 옵션은 정당화되어야 한다
- 덜 내고 더 잘 내라 (다듬어진 기능 세 개가, 거친 기능 열 개보다 낫다)
- 프로토타입을 먼저 만들고 확정하라 (설계 결정은 실제 프로덕션 코드보다 일회용 HTML로 만드는 편이 싸다)
- 세부 사항을 제대로 챙겨라 (전환 효과, 정렬, 간격, 피드백, 에러 상태)
- 핵심 루프를 단단하게 조여라 (모든 기능은 중심 워크플로를 돕거나, 방해가 되지 않도록 물러나 있어야 한다)

사용자는 결과물을 소비하는 사람이다. UI라면 최종 사용자이고, 라이브러리나 내부 API라면 그것을 import하는 동료다. 이 코드를 다음에 유지보수할 엔지니어도 사용자다. 그들의 경험도 같은 방식으로 따져 보고, 영향은 그들의 관점에서 설명하라.

기반(foundation)은 경험에 봉사해야 한다. 기반 사고(foundational thinking)는 작업의 *순서*를 다스리고, 이 원칙은 *목표*를 다스린다.
