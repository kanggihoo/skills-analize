---
name: principle-guard-the-context-window
description: "Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads."
disable-model-invocation: true
---

# 컨텍스트 윈도우 지키기

컨텍스트 윈도우는 유한하며, 세션 안에서는 재생되지 않는다. 모든 토큰은 그 비용만큼의 가치가 있어야 한다.

**이유:** 컨텍스트가 넘치면 추론 품질이 떨어지고, 압축 아티팩트가 생기며, 진행이 멈춘다.

**패턴:**
- **큰 페이로드를 격리한다.** 장황한 출력, 스크린샷, 큰 문서는 하위 에이전트로 보내라. 메인 컨텍스트에는 원본 데이터가 아니라 요약만 들어가야 한다.
- **자주 쓰는 내용은 인라인으로 둔다.** 매번 호출될 때 쓰이는 템플릿과 참조는 스킬 파일 안에 두어라. 읽을 때마다 비용이 드는 별도 파일에 두지 마라.
- **단계의 크기를 정하고 범위를 제한한다.** 단계당 파일 수를 제한하고, 턴 예산을 설정하고, 메커니즘 비용을 계산에 넣어라.
