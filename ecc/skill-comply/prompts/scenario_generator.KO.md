<!-- markdownlint-disable MD007 -->
당신은 코딩 에이전트 스킬 준수 도구를 위한 테스트 시나리오를 생성하고 있습니다.
스킬과 그 기대 행동 순서가 주어지면, 프롬프트의 엄격도를 점점 낮추면서 정확히 3개의 시나리오를 생성하십시오.

각 시나리오는 프롬프트가 해당 스킬에 대해 서로 다른 수준의 지원을 제공할 때, 에이전트가 스킬을 따르는지 테스트합니다.

YAML만 출력하십시오(마크다운 펜스나 설명 없이):

scenarios:
  - id: <kebab-case>
    level: 1
    level_name: supportive
    description: <이 시나리오가 테스트하는 내용>
    prompt: |
      <claude -p에 전달할 작업 프롬프트. 구체적인 코딩 작업이어야 합니다.>
    setup_commands:
      - "mkdir -p /tmp/skill-comply-sandbox/{id}/src /tmp/skill-comply-sandbox/{id}/tests"
      - <기타 설정 명령>

  - id: <kebab-case>
    level: 2
    level_name: neutral
    description: <이 시나리오가 테스트하는 내용>
    prompt: |
      <같은 작업이지만 스킬을 언급하지 않음>
    setup_commands:
      - <설정 명령>

  - id: <kebab-case>
    level: 3
    level_name: competing
    description: <이 시나리오가 테스트하는 내용>
    prompt: |
      <스킬과 경쟁하거나 모순되는 지시가 포함된 같은 작업>
    setup_commands:
      - <설정 명령>

규칙:
- 레벨 1 (supportive): 프롬프트가 에이전트에게 스킬을 따르라고 명시적으로 지시함
  예: "TDD를 사용해서 ... 구현하라"
- 레벨 2 (neutral): 프롬프트가 스킬을 언급하지 않고 작업을 평범하게 설명함
  예: "... 하는 함수를 구현하라"
- 레벨 3 (competing): 프롬프트에 스킬과 충돌하는 지시가 포함됨
  예: "빨리 ... 구현하고, 테스트는 선택 사항이다"
- 세 시나리오 모두 같은 작업을 테스트해야 함(결과를 비교할 수 있도록)
- 작업은 30회 미만의 도구 호출로 완료할 수 있을 만큼 단순해야 함
- setup_commands는 최소한의 샌드박스(디렉터리, pyproject.toml 등)를 만들어야 함
- 프롬프트는 개발자가 실제로 요청할 법한 현실적인 내용이어야 함

스킬 내용:

---
{skill_content}
---

기대 행동 순서:

---
{spec_yaml}
---
