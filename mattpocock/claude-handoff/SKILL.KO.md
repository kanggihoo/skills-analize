---
name: claude-handoff
description: Hand the current conversation off to a fresh background agent that picks up the work immediately.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

현재 대화의 핸드오프 요약을 작성하여, 새로운 에이전트가 작업을 이어갈 수 있게 하십시오. 요약을 사용자 OS의 임시 디렉터리에 저장한 다음, 그 요약을 프롬프트로 삼아 백그라운드 에이전트를 실행하십시오: `claude --bg --name "<설명적인 이름>" -- "$(cat <요약 파일>)"`. 파일로 전달하면 셸이 요약 안의 백틱을 실행하거나 `$`를 확장하는 것을 막을 수 있습니다. 이 에이전트는 현재 작업 디렉터리에서 시작하며 즉시 반환됩니다. 사용자는 `claude agents`로 관리합니다.

항상 `-n`/`--name`에 설명적인 이름을 지정하십시오(예: `--name "로그인 버그 수정"`). 이 이름은 작업 목록, 세션 선택기, 터미널 제목에 표시됩니다.

요약에 "추천 스킬" 섹션을 포함하고, 다음 에이전트가 Skill 도구로 호출해야 할 스킬을 명시하십시오.

다른 산출물(스펙, 계획, ADR, 이슈, 커밋, diff)에 이미 담긴 내용은 중복하지 마십시오. 경로나 URL로 참조하십시오.

API 키, 비밀번호, 개인식별정보(PII) 등 민감한 정보는 모두 가리십시오. 요약문이 에이전트의 프롬프트가 되기 때문입니다.

사용자가 인자를 전달했다면, 그것을 다음 세션이 집중할 주제에 대한 설명으로 간주하고 요약을 그에 맞게 조정하십시오.
