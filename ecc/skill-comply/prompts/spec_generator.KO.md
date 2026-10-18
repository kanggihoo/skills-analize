<!-- markdownlint-disable MD007 -->
당신은 코딩 에이전트(Claude Code)를 위한 스킬/규칙 파일을 분석하고 있습니다.
당신의 과제: 이 스킬이 활성화되었을 때 에이전트가 따라야 할 **관찰 가능한 행동 순서**를 추출하십시오.

각 단계는 자연어로 설명하십시오. 정규식 패턴을 사용하지 마십시오.

정확히 다음 형식의 YAML만 출력하십시오(마크다운 펜스나 설명 없이):

id: <kebab-case-id>
name: <사람이 읽을 수 있는 이름>
source_rule: <제공된 파일 경로>
version: "1.0"

steps:
  - id: <snake_case>
    description: <에이전트가 해야 할 일>
    required: true|false
    detector:
      description: <찾아야 할 도구 호출을 설명하는 자연어>
      after_step: <이 단계가 뒤따라야 하는 step_id, 선택 사항 — 필요 없으면 생략>
      before_step: <이 단계가 앞서야 하는 step_id, 선택 사항 — 필요 없으면 생략>

scoring:
  threshold_promote_to_hook: 0.6

규칙:
- detector.description은 패턴이 아니라 도구 호출의 의미를 설명해야 합니다
  좋은 예: "Write 또는 Edit로 테스트 파일 작성(구현 파일 제외)"
  나쁜 예: "Write|Edit with input matching test.*\\.py"
- 순서가 중요한 스킬(예: TDD에서 테스트가 구현보다 먼저)에는 before_step/after_step을 사용하십시오
- 존재 여부만 중요한 스킬에서는 순서 제약을 생략하십시오
- 스킬이 "선택적으로" 또는 "해당되는 경우"라고 말하는 경우에만 required: false로 표시하십시오
- 3~7개 단계가 이상적입니다. 과도하게 세분화하지 마십시오
- 중요: 콜론(:)을 포함하는 모든 YAML 문자열 값은 큰따옴표로 감싸십시오
  좋은 예: description: "Use conventional commit format (type: description)"
  나쁜 예: description: Use conventional commit format (type: description)

분석할 스킬 파일:

---
{skill_content}
---
