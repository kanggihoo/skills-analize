---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

현재 대화에서 지속 가능한 학습 내용을 찾아내고, 이를 스킬 수정으로 연결한다.

## 호출 시점

사용자가 "reflect" 또는 "/reflect"라고 말하면 호출한다. 대화가 사소하거나 주제와 무관하거나, 부모 에이전트가 이미 올바르게 따른 기존 스킬로 다뤄진 경우에는 건너뛴다. 일회성 사건은 학습 내용이 아니다.

## 절차

### 1. 활성 트랜스크립트 찾기

부모 에이전트는 하위 에이전트를 띄우기 전에 자신의 트랜스크립트 파일을 먼저 찾는다. 시스템 프롬프트가 활성 워크스페이스의 `agent-transcripts/` 디렉터리를 알려 주며, 그 경로를 사용한다. `~/.cursor/projects/*/` 전체를 glob하지 않는다. 그러면 워크스페이스 경계를 넘어 관련 없는 프로젝트의 비공개 채팅을 읽게 된다.

```bash
ls -t <agent-transcripts>/*.jsonl <agent-transcripts>/*/*.jsonl <agent-transcripts>/*/subagents/*.jsonl 2>/dev/null | head -10
```

트랜스크립트 레이아웃은 세 가지다. 구형 평면 구조(`<id>.jsonl`), 현재 중첩 구조(`<id>/<id>.jsonl`), 하위 에이전트 구조(`<parent>/subagents/<child>.jsonl`)다.

각 후보에 대해 첫 번째 JSONL 줄을 읽고 `message.content[0].text`에 대화의 첫 사용자 프롬프트가 들어 있는지 확인한다. 일치하는 경로를 선택한다. 어떤 경로도 맞지 않으면 세션의 간결한 다이제스트를 작성해 그것을 넘긴다.

### 2. 리뷰어 세 명을 병렬로 띄우기

메시지 하나에 `Task` 호출 세 개를 담는다. `subagent_type: generalPurpose`, `model`은 아래에 따라 설정하고, 에이전트 모드(`readonly: false`)로 실행한다. 리뷰어는 맥락 조회(트랜스크립트에 언급된 티켓, 채팅 스레드, 관측 트레이스)를 위해 MCP 접근이 필요하다. readonly 모드는 MCP를 제거한다.

각 리뷰어와 synthesizer는 `pstack-models.mdc` 규칙에 역할 줄이 있고 기본값이 있다. 해당 줄의 값으로 `model`을 설정하되, 규칙이나 줄이 없으면 기본값을 쓴다. 값이 `auto` 또는 `inherit-parent`이면 `model`을 설정하지 않는다. Task 도구가 슬러그를 거부하면 기본값을 쓰고 그 사실을 말한다. 기본값까지 거부하면 오류 메시지에 나온 같은 계열의 가장 가까운 유효 슬러그를 쓴다.

| 렌즈 | 역할 줄 | 기본 `model` | 프롬프트 템플릿 |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | `claude-opus-5-5-max` | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | `gpt-5.6-sol-max` | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | `claude-opus-5-5-max` | `references/divergent-reviewer.md` |

각 템플릿을 표시된 자리에 트랜스크립트 경로나 다이제스트를 넣어 그대로 전달한다. 리뷰어는 결과를 `Task` 응답 본문으로 돌려준다.

### 3. 종합하기

`Task` 호출 하나를 `subagent_type: generalPurpose`로 보낸다. `model`은 `reflect judgment, divergent, synthesizer` 줄의 값을 쓰고(기본값 `claude-opus-5-5-max`), 에이전트 모드(`readonly: false`)로 실행한다. synthesizer의 품질 점검에는 인용을 표본 검증하는 작업이 포함되며, 이 작업에는 MCP 접근이 필요할 수 있다. readonly 모드는 MCP를 제거한다. `references/synthesizer.md`를 그대로 사용하고, 표시된 자리마다 각 리뷰어의 전체 출력을 넣는다. synthesizer는 구조화된 Accepted / Rejected / Backlog 목록을 돌려준다.

### 4. 구조적 강제 점검

synthesizer의 Accepted 목록을 검토한다. 린트 규칙, 스크립트, 메타데이터 플래그, 런타임 검사로 더 안정적으로 강제할 수 있는 항목은 Accepted에서 Backlog로 옮긴다. **encode-lessons-in-structure** 원칙 스킬을 참고한다.

### 5. 적용하기

Accepted 항목의 수정을 적용하기 전에, synthesizer의 전체 Accepted/Rejected/Backlog 출력을 사용자에게 보여 주고 명시적 승인을 기다린다. 사용자는 적용할 항목을 고르고 라우팅을 바꿀 수 있다. 스킬 변경은 조직의 모든 미래 에이전트에 영향을 준다. 자동으로 적용하지 않는다.

Backlog 항목은 팀이 쓰는 devex / 백로그 트래커에 자동으로 등록한다. Accepted 목록만 승인을 기다린다.

승인된 Accepted 항목마다 Routing 필드를 정확히 따른다.

- 사소한 기존 스킬 수정(한 줄짜리 글머리 기호, 다듬은 문장, 틀린 사실 정정): 부모가 직접 한다.
- 실질적인 기존 스킬 수정(새 섹션, 새 패턴 표, 10줄 이상): Cursor 내장 `create-skill` 스킬에 넘기고 그 초안 / 테스트 / 반복 루프를 실행한다.
- `tune description: <skill path>`(스킬은 존재하지만 트리거되어야 할 때 트리거되지 않았다): `create-skill`에 넘기고 그 설명 최적화 루프를 실행한다.
- `new skill via create-skill: <kebab-name>`: 생성은 `create-skill`에 맡긴다. 임의로 구조를 만들지 않는다.

환경에 SKILL.md 검증기가 있다면, 완료를 선언하기 전에 수정한 모든 스킬에 실행한다. 없으면 이 단계를 건너뛴다.

### 6. 사용자에게 요약하기

서문 없이 짧은 목록으로 쓴다.

- 적용된 수정: `<skill path>`. 무엇이 바뀌었는지 한 줄씩.
- 새로 만든 스킬: `<skill path>`. 한 줄씩(드묾).
- devex 트래커에 등록된 Backlog: `<issue title>` (`<tags>`). 한 줄씩.
- 제외됨: 기각된 항목마다 한 줄, 이유는 synthesizer가 제시한 것.
