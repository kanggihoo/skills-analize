---
name: rpi
description: 사용자가 이 스킬을 이름으로 명시적으로 호출한 경우에만 사용합니다.
---

# 조사, 설계, 구현

사용자가 변경 사항을 조사하고, 설계를 정리하고, 구현하도록 돕습니다. 사용자가 요청한 단계를 따르며, 아래의 단계별 지침을 사용합니다.

`$SKILLBASE`는 이 `SKILL.md`가 들어 있는 디렉터리를 의미합니다.

템플릿의 `<rpi-invocation>`은 호스트의 스킬 명령을 의미합니다. Codex에서는 `$rpi`, Claude Code에서는 `/rpi`, 호스트가 플러그인 이름을 붙인 형태를 제공하면 그 플러그인 한정 이름을 뜻합니다. 다음 명령을 안내할 때는 해당 호스트의 고유 호출 방식을 사용합니다.

## 단계 선택

사용자가 요청한 단계를 따릅니다. 흐름을 설명하거나 다음에 무엇을 할지 정할 때는 `$SKILLBASE/references/workflow.md`를 읽습니다.

요청한 단계 없이 작업 설명만 주어지면 리서치 질문부터 시작합니다. 사용자에게 어떤 흐름을 원하는지 물어봅니다. 리서치 후 설계 논의, PRD, TDD를 진행할지, 아니면 리서치만 할지 선택지를 줍니다. 사용자가 선택할 때까지 단계를 시작하지 않으며, 선택한 흐름은 이후 제안하는 다음 명령에 그대로 반영합니다.

사용자에게 흐름을 고르도록 할 때는 `$SKILLBASE/references/workflow-choice.md`를 읽고, 질문과 함께 박스와 선으로 된 차트를 보여줍니다.

Create는 새 문서를 작성하고, iterate는 사용자의 피드백을 반영해 기존 문서를 제자리에서 갱신하거나, 일부만 끝난 문서의 워크플로를 이어서 진행합니다.

각 단계에 맞는 프로세스는 `$SKILLBASE/references/<step>/process.md`에서 불러옵니다.

| 요청 | 단계 |
| --- | --- |
| 리서치 질문 | `create-research-questions` 또는 `iterate-research-questions` |
| 리서치 | `create-research` 또는 `iterate-research` |
| 설계 논의 | `create-design-discussion` 또는 `iterate-design-discussion` |
| 제품 요구사항 / PRD | `create-prd` 또는 `iterate-prd` |
| 기술 설계 / TDD | `create-tdd` 또는 `iterate-tdd` |
| 구현 개요 | `create-structure-outline` 또는 `iterate-structure-outline` |
| 구현 | `implement-outline` |
| 구현 피드백 또는 수정 | `iterate-implementation` |

기본적으로 기존 문서를 갱신합니다. 필요하거나 요청받은 경우에만 새로 만듭니다. 여러 문서가 해당되면 가장 최신 문서를 사용하고, 어떤 파일을 선택했는지 밝힙니다.

## 작업 디렉터리 사용

사용자가 지정한 디렉터리를 사용합니다.

지정이 없으면 `.agents/artifacts/` 아래에서 이름이나 워크플로 파일명이 요청 또는 현재 작업 브랜치와 맞는 기존 작업 디렉터리를 찾습니다. 명확히 맞는 디렉터리는 묻지 않고 재사용합니다. 다른 작업의 것일 수도 있는 디렉터리가 비슷해 보이거나, 그럴듯한 디렉터리가 여러 개라면 쓰기 전에 사용자에게 어떤 것을 쓸지 묻습니다. 일치 여부를 확인할 때는 선택한 단계에서 허용하는 문서만 읽습니다.

맞는 디렉터리가 없으면, 브랜치가 작업을 식별할 수 있는 경우 `.agents/artifacts/<branch-name>`을 사용합니다. 이때 `/`는 `-`로 바꿉니다. `main` 브랜치이거나 브랜치로 작업을 식별할 수 없으면, 요청에서 짧은 kebab-case 슬러그를 골라 `.agents/artifacts/<task-slug>`를 승인 요청 없이 사용합니다. 선택한 경로를 밝히고, 필요에 따라 디렉터리를 재사용하거나 만듭니다.

선택한 경로에 저장합니다. 샌드박스가 그 경로에 대한 쓰기를 막으면, 범위가 제한된 쓰기 권한이나 쓰기 가능한 작업 디렉터리를 요청하고 사용자의 선택을 기다립니다.

RPI 프레임워크 작성자들은 산출물을 커밋하지 않을 것을 권장합니다.

새 워크플로 문서는 작업 디렉터리에서 다음 사용 가능한 `NN-` 접두사를 사용해 번호를 붙입니다. 문서를 갱신할 때는 기존 경로를 유지합니다. 보조 목업과 다이어그램은 문서 옆에 저장하고, 일반 로컬 파일로 링크합니다.

워크플로 문서의 frontmatter에는 `repos` 항목이 들어갑니다. 이는 각각 `identifier`와 `sha`를 가진 저장소 목록이며, 해당하는 저장소가 없으면 빈 목록 `repos: []`로 둡니다. 문자열 값은 유효한 YAML이 되도록 필요에 따라 따옴표로 감쌉니다.

## 다음 단계 제안

다음에 무엇을 할지는 해당 단계의 인계 지침과 `$SKILLBASE/references/workflow.md`를 바탕으로 고릅니다. 사용자는 기본적으로 단계마다 별도의 컨텍스트 창에서 작업합니다. 다음 명령을 제안할 때는 작업 디렉터리와 선택한 흐름을 포함합니다. 이 명령은 여기서 실행하거나, 컴팩션 후에 실행하거나, 새 세션에서 실행해도 된다고 알려줍니다.

다음에 무엇을 해야 하는지 물으면 산출물 파일명으로 현재 단계를 찾고, 그 문서를 읽어 미완료 작업과 확정된 선택 사항을 확인합니다. `prd` 또는 `product-requirements`, `tdd` 또는 `tech-design`, `structure-outline` 또는 `outline`을 인식합니다.

## 서브에이전트 사용

`codebase-locator`, `codebase-analyzer`, `codebase-pattern-finder`, `web-search-researcher`, `outline-implementer-agent`에 대해서는 각 단계의 지시에 따라 번들된 에이전트 지침을 사용합니다.

<important if="Agent() 또는 Task() 또는 서브에이전트를 실행할 다른 도구가 없는 경우">
  $SKILLBASE/references/subagents/SUBAGENT_NAME.md에서 서브에이전트 지침을 읽습니다.
</important>

<important if="서브에이전트나 위임 세션을 실행하는 도구는 있지만, 지정된 서브에이전트를 사용할 수 없는 경우">
  $SKILLBASE/references/subagents/SUBAGENT_NAME.md에서 서브에이전트 지침을 읽고, 메인 프롬프트와 함께 다음 형식으로 서브에이전트에 전달합니다.
<instructions>
REFERENCE_CONTENTS
</instructions>
<message>
YOUR_MESSAGE ON WHAT TO LOOK FOR OR BUILD
</message>
</important>
