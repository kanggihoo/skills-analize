---
name: plan-review
description: Compare an implementation plan against the current codebase, with each fix to accept or reject in the page
---

visual-explainer 스킬을 로드하고 시각적 계획 리뷰를 만드세요.

입력: `$@`는 계획 파일 경로 또는 계획 텍스트입니다. 비어 있으면 계획을 요청하세요. `--quick`이 있으면 플래그를 제거하고 스킬의 Quick 모드를 따르세요.

계획 전체, 계획이 참조하는 모든 파일, 그리고 이에 의존하는 코드를 읽으세요. 제안된 각 변경에 대해, 파일, 함수 또는 타입이 존재하는지, 현재 동작이 계획과 일치하는지, 놓치고 있는 파급 효과가 무엇인지, 테스트가 저장소의 스타일에 맞는지 확인하세요. 계획의 섹션과 `file:line`을 인용하세요.

리뷰는 계획 페이지(`references/plans.md`)로 작성하여, 독자가 각 수정안을 그 자리에서 수락하거나 거절할 수 있게 하세요:

- **헤더**: h1 "Review: <계획 이름>"; 리드 문단에 결론(승인, 수정, 거절)과 그 이유를 적으세요.
- **히어로**: 계획된 설계의 `<ve-flow>`. 어떤 발견 사항이 닿는 부분은 `gone` 또는 `new`로 표시하고 해당 주장에 연결하세요.
- **주장**: 발견 사항마다 1단계 주장 하나를, 거짓일 수 있는 문장으로 쓰세요(예: "Step 3 edits a function that no longer exists."). 가장 심각한 것부터, 최대 5개. 더 작은 발견 사항은 하위 주장으로 두세요. 각 주장은 `<ve-code src=… lines=…>` 또는 계획의 인용으로 증명하세요. 확인되지 않은 발견 사항에는 `evidence="guess"`를 붙이세요.
- **결정**: 발견 사항마다 `<ve-ask id="f1" q="Fix the plan this way?">`를 두고, 수정안을 설명하는 `<ve-opt value="accept" default>`와 `<ve-opt value="reject">Keep the plan as written</ve-opt>`를 넣으세요. 실제로 가능한 대안이 있으면 함께 넣으세요.
- **마무리**: `aux="scope"`로 계획에서 옳은 부분을 적으세요.

한 줄로 전달하세요. 응답이 도착하면 계획 파일을 수정하세요: 수락된 수정안은 적용하고, 거절된 것은 원래대로 두세요.
