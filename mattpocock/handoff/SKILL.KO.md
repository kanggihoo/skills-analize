---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

현재 대화를 요약한 핸드오프 문서를 작성하여, 새로운 에이전트가 작업을 이어갈 수 있게 하십시오. 저장 위치는 사용자 OS의 임시 디렉터리입니다(`$TMPDIR`, 없으면 `/tmp`; Windows에서는 `%TEMP%`). 현재 워크스페이스에는 저장하지 마십시오.

문서에 "추천 스킬" 섹션을 포함하고, 다음 에이전트가 Skill 도구로 호출해야 할 스킬을 명시하십시오.

다른 산출물(스펙, 계획, ADR, 이슈, 커밋, diff)에 이미 담긴 내용은 중복하지 마십시오. 경로나 URL로 참조하십시오.

API 키, 비밀번호, 개인식별정보(PII) 등 민감한 정보는 모두 가리십시오.

사용자가 인자를 전달했다면, 그것을 다음 세션이 집중할 주제에 대한 설명으로 간주하고 문서를 그에 맞게 조정하십시오.
