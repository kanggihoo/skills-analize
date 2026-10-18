---
name: generate-visual-plan
description: Generate an interactive visual implementation plan the reader can answer in place
---

visual-explainer 스킬을 로드하고 다음 내용의 시각적 구현 계획을 만드세요: $@

`references/plans.md`를 따르세요.

1. **먼저 조사하세요:** 진입점, 영향을 받는 모듈, 공개 API, 데이터 모델과 설정, 테스트, 유사한 기능, README/CHANGELOG의 제약. 정확한 `file:line`과 사용자의 원래 표현을 기록하세요.
2. **1단계 주장을 작성하고** 다른 무엇보다 먼저 수정하세요.
3. `<ve-flow>`로 **히어로를 그리세요**: 새로 추가되거나 제거되는 부분을 표시하고, 각각을 해당 주장에 연결하세요.
4. **방법과 위치에 관한 주장을 추가한 뒤 결정 사항을 추가하세요.** 확인하지 못한 주장은 `evidence="guess"`로 표시하세요. 1단계 주장마다 `check`를 주세요.
5. **렌더링하세요**(Pi에서는 `viewer: "glimpse"`가 응답을 바로 되돌려 보냅니다). 한 줄로 전달하고 기다리세요. 응답이 도착하기 전에는 빌드하지 마세요.
6. **빌드한 뒤**, 각 주장의 `status`를 설정하고 다시 렌더링하세요.
