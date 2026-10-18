---
name: build-iterated-agentic-loop
description: 저장소 로컬 스킬을 만들고, 이에 맞는 반복형 코딩 에이전트 GitHub Actions 워크플로, 프롬프트, 메모리 파일, 참조 템플릿을 설치합니다
---

# Build Iterated Agentic Loop

사용자가 반복 가능한 에이전트 작업을 저장소 로컬 스킬과, 일정에 따라 또는 수동으로(또는 둘 다) 코딩 에이전트를 실행하는 GitHub Actions 워크플로로 바꾸고 싶을 때 이 스킬을 사용합니다.

목표 형태는 반복형 에이전트 루프(iterated agentic loop)입니다. 집중된 스킬이 에이전트의 판단 기준을 정의하고, 워크플로가 저장소별 프롬프트와 함께 코딩 에이전트를 호출하며, 에이전트 메모리 파일이 실행 간에 지속적인 피드백을 전달하고, 각 워크플로는 PR에 라벨을 붙여 루프당 열린 PR이 하나만 존재하도록 합니다. `narrow-react-prop-types` 스킬이 구체적인 참조 패턴입니다.

## 산출물

대상 저장소에 다음 파일을 생성하거나 업데이트합니다.

- `.claude/skills/<skill-name>/SKILL.md`: 저장소 로컬 에이전트 동작 정의.
- `.github/workflows/agent-<task-name>.yml`: 주기적으로 실행되는 코딩 에이전트 자동화.
- `.github/agent-memory/<task-name>.md`: 지속적인 피드백과 범위 제약 조건.
- 스킬에 템플릿, 예시, 또는 긴 보조 자료가 필요한 경우 `.claude/skills/<skill-name>/references/` 아래의 선택적 참조 파일.

## 워크플로

### 1. 대상 저장소 탐색

설정 질문을 하기 전에 먼저 읽습니다.

- 러너, 체크아웃, 의존성 설치, 캐시, PR 패턴을 파악하기 위해 기존 `.github/workflows/*.yml`과 `.github/actions/**`를 확인합니다.
- `package.json`, `bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `pyproject.toml`, `go.mod`, `Cargo.toml` 같은 패키지 관리 파일 또는 그와 관련된 다른 파일을 확인합니다.
- 기존 검증 스크립트를 확인합니다. 특히 typecheck, lint, test, quality, format 및 패키지 단위 명령을 봅니다.
- 관례의 중복을 피하기 위해 기존 `.claude/skills`와 `.agents/skills`를 확인합니다.

완료 기준: 저장소의 패키지 관리자, 설치 명령, 예상되는 검증 명령, 기존 워크플로 관례를 말할 수 있어야 합니다.

### 2. 설정 질문하기

다음 결정 사항을 사용자와 함께 확인합니다. 빈 양식을 제시하지 말고, 저장소의 근거를 바탕으로 기본값을 추천합니다.

1. **코딩 에이전트**: Claude Code, Codex, OpenCode, 또는 CodeLayer. 추천하는 선택지에 필요한 시크릿과 헤드리스 명령을 설명합니다. `references/agent-runner-templates.md`를 사용합니다. CodeLayer는 Humanlayer의 초경량 에이전트 하네스입니다.
2. **주기**: 매일, 매주, 평일, 매월, 수동 전용, 또는 사용자 지정 cron. 작업 위험도와 리뷰 부담을 기준으로 주기를 추천합니다. 대개 평일, 매일, 또는 매주 중 하나입니다.
3. **작업**: 에이전트 루프가 달성해야 할 작업은 무엇인가요?
   - 이 작업을 수행하는 기존 스킬이 있는지 확인합니다. (사용자에게 묻기 전에 조사해도 됩니다.)
   - 참고용으로 최근 PR, git 히스토리, 또는 코드베이스의 특정 부분을 살펴볼지 사용자에게 묻습니다.
4. **범위**: 루프가 변경할 수 있는 디렉터리/패키지와 검사만 할 수 있는 디렉터리/패키지.
5. **검증**: 에이전트가 커밋하기 전에 반드시 통과해야 하는 명령. (앞선 조사를 바탕으로 이를 제안하고 사용자에게 확인을 받습니다.)
6. **PR 제한**: 예약된 실행에서, 이 에이전트가 만든 열린 PR이 이미 있으면 실행을 건너뛸지(no-op), 그렇다면 새 실행을 차단하기 전에 몇 개의 열린 PR을 허용할지 묻습니다.
   - **추천: 예, 에이전트 루프당 열린 PR을 1개로 제한합니다.** 이렇게 하면 에이전트가 사람이 리뷰할 수 있는 속도보다 빠르게 쌓이는 무제한 작업을 만드는 것을 막을 수 있습니다. 제한이 없으면 매일 실행되는 에이전트가 일주일에 리뷰되지 않은 PR을 5개 이상 만들어 리뷰 피로와 병합 충돌을 일으킬 수 있습니다.
   - 워크플로는 각 에이전트 루프의 PR을 식별하기 위해 라벨(예: `agent-<task-slug>`)을 사용합니다. 예약 실행은 `gh pr list --label <label> --state open`으로 확인하고, 개수가 제한 이상이면 건너뜁니다.
   - 수동 `workflow_dispatch` 실행은 제한 확인을 우회하므로, 필요할 때 강제 실행할 수 있습니다.
7. **PR 메타데이터**: 라벨 이름, PR 제목 접두사, 브랜치 접두사.
   - 템플릿으로 `[MM/DD][Agent: <Agent Name>]: <Concise Description>`을 제안합니다. 예: `[6/23][Agent: Effect Migrator]: Migrate XYZ module`
8. **응답 형식**: CI 에이전트가 최종 응답을 어떤 형식으로 작성해야 하나요? (이 응답이 PR 본문이 됩니다.)
   - 예시(수정/마이그레이션, 생성, 리팩터링)를 보여주려면 사용자에게 `references/response-template.md`를 제시합니다.
   - 리뷰어에게 필요한 정보가 무엇인지 묻습니다. 요약 통계, 위험 수준, 검증 단계, 파일 목록 등이 해당됩니다.
   - 생성된 스킬이 `references/` 디렉터리에서 참조할, 맞춤형 응답 템플릿을 만듭니다.
9. **반복 동작**: `/iterate` 댓글이 기존 PR을 업데이트할지 여부.
   - 활성화하면 `references/agent-iteration.ts`를 저장소에 설치합니다. 선호하는 위치를 사용자에게 묻습니다: `.github/scripts/`, `ci-scripts/`, 또는 `scripts/`.
   - 이 스크립트에는 두 가지 모드가 있습니다. `footer`(PR 본문 마커를 추가)와 `prompt`(PR 컨텍스트로부터 반복 프롬프트를 생성)입니다.
   - 비활성화하면 워크플로에서 `issue_comment` 트리거와 반복 전용 단계를 제거합니다.

완료 기준: 워크플로, 프롬프트, 메모리 템플릿의 모든 플레이스홀더에 선택된 값 또는 명시된 기본값이 있어야 합니다.

### 3. 에이전트 작업 정의

에이전트가 수행해야 할 가장 작은 반복 가능 작업을 추출합니다. 다음 세 가지 질문을 사용자와 함께 검토합니다.

**무엇을 찾는가?** 에이전트가 이번 실행의 대상을 어떻게 식별하나요?
- 문제를 보고하는 CLI 도구 (예: `bunx react-doctor`, `eslint --format json`)
- 검색 패턴 (예: 커버리지가 없는 `*.test.ts` 파일, 더 이상 권장되지 않는 API를 사용하는 컴포넌트)
- diff 또는 변경 로그 (예: 마지막 릴리스 이후 새로 추가된 의존성, PR에서 변경된 파일)
- 새 패턴으로 교체하거나 새 프레임워크로 마이그레이션해야 하는 오래된 패턴
- 이전 CI 실행 결과에 기반한 불안정한(flaky) 테스트

**무엇을 변경하는가?** 에이전트가 각 대상에 적용할 변환은 무엇인가요?
- 수정(Fix): 보고된 문제를 제자리에서 해결
- 마이그레이션(Migrate): 코드를 한 패턴에서 다른 패턴으로 업데이트
- 생성(Generate): 기존 소스를 바탕으로 새 파일 생성
- 리팩터링(Refactor): 동작을 바꾸지 않고 구조만 재구성

**어떻게 검증하는가?** 무엇이 변경이 올바르다는 것을 증명하나요?
- 빌드/typecheck 통과
- 테스트 통과 (또는 특정 하위 집합)
- 문제를 찾아낸 바로 그 도구가 해당 문제가 해결되었다고 보고
- 린트 또는 포맷 검사 통과

완료 기준: 작업을 한 문장으로 말할 수 있어야 합니다. 예: "react-doctor 위반 5개를 찾아 수정하고, typecheck와 quality 통과를 검증한다."

### 4. 스킬 작성

이 작업에 대한 에이전트의 판단 기준을 담은 저장소 로컬 스킬을 작성합니다. 이 스킬은 저장소 안에 있으므로 저장소별 경로, 패키지 이름, 관례를 포함할 수 있습니다.

다음 스킬 작성 규칙을 사용합니다.

- 순서가 있는 동작은 스킬 디렉터리(저장소 패턴과 사용자 선호에 따라 `.claude/skill-slug-here` 또는 `.agents/skill-slug-here`)의 `SKILL.md`에 확인 가능한 완료 기준과 함께 단계로 작성합니다.
- 길이가 긴 템플릿과 예시는 형제 참조 파일로 옮기고, `SKILL.md`에서 해당 파일을 가리킵니다.
- 각 규칙은 하나의 출처만 갖도록 합니다. 스킬, 프롬프트, 메모리 파일에 같은 지침을 반복하지 않습니다.
- CI 에이전트가 최종 출력을 어떤 형식으로 작성해야 하는지 정의하는 응답 템플릿을 참조 파일로 포함합니다(예: 스킬 디렉터리 아래의 `references/response-template.md`). 스킬은 에이전트에게 최종 응답을 형식화할 때 이 템플릿을 읽고 따르라고 지시해야 하며, 이 최종 응답이 PR 본문으로 사용됩니다.
- `references/skill-template.md`의 스킬 템플릿을 사용합니다. 예시 스킬은 `references/example-skill.md`에서 찾을 수 있습니다.
- 스킬 명세를 이해하려면 https://agentskills.io/specification 을 참고해도 됩니다.

**중요**: `SKILL.md` frontmatter의 `name` 필드는 스킬 슬러그와 일치해야 합니다. 예를 들어 `name`이 `fix-eslint-issues`인 스킬은 `.claude/skills/fix-eslint-issues/SKILL.md` 또는 `.agents/skills/fix-eslint-issues/SKILL.md`에 있어야 합니다.

완료 기준: 스킬이 최종 응답의 형식을 포함하여, 에이전트가 추가 지시 없이도 따를 수 있을 만큼 작업 방법을 명확히 설명해야 합니다.

### 5. 워크플로 프롬프트 작성

저장소별 대상 지정은 일반적인 스킬이 아니라 GitHub Actions 프롬프트에 넣습니다. 다음을 포함합니다.

- `Begin by using the <skill-name> skill.`
- 범위: 에이전트가 변경하거나 검사할 수 있는 디렉터리/패키지.
- 지침: 리뷰 가능한 작업 단위, 피해야 할 것, 검증 방법.
- 해당되는 경우 펜스드 bash 블록으로 된 검증 명령.
- `.github/agent-memory/<task-name>.md`에서 가져오는 에이전트 메모리 보간.
- 마무리 요건: 검증, 커밋, 푸시, 그리고 PR에 바로 쓸 수 있는 요약 반환.

기본 템플릿으로 `references/workflow-template.yml`을 사용합니다. 포함된 프롬프트를 작성할 때는 `references/prompt-template.md`를 사용합니다.

완료 기준: 프롬프트에 무인 실행에 필요한 저장소별 제약 조건이 모두 포함되어 있어야 합니다.

### 6. 메모리 파일 설치

`references/memory-template.md`를 출발점으로 삼아 `.github/agent-memory/<task-name>.md`를 만듭니다. 메모리 파일은 향후 실행에 영향을 줄 지속적인 피드백을 담습니다. 짧게 유지합니다.

좋은 메모리 항목:

- 영구적인 범위 제외 항목.
- 알려진 오탐(false-positive) 영역.
- 향후 에이전트 선택을 바꿔야 하는 리뷰 피드백.

나쁜 메모리 항목:

- 일회성 작업 지시.
- 단일 실행의 검증 출력.
- 스킬에 이미 명시된 규칙.

완료 기준: 메모리 파일을 삭제했을 때 잃는 것이 단순한 이력이 아니라 유용한 향후 실행 컨텍스트여야 합니다.

### 7. 워크플로 생성

`references/workflow-template.yml`로부터 `.github/workflows/agent-<task-name>.yml`을 만들고, 모든 플레이스홀더를 교체합니다.

필수 맞춤 설정:

- 워크플로 이름, cron, 브랜치 접두사, 워크플로 ID, 에이전트 라벨, PR 제목.
- 저장소용 러너 라벨과 설정 단계.
- 의존성 설치 명령.
- 코딩 에이전트 설치, 시크릿, 헤드리스 실행 명령 (`references/agent-runner-templates.md`에서 가져옴).
- 응답 추출 단계: 에이전트마다 출력 형식이 다릅니다(JSON, stream-json, 일반 텍스트). `references/agent-runner-templates.md`의 에이전트별 추출 방식을 사용해 최종 응답을 PR 본문용 `/tmp/pr-body.md`로 가져옵니다.
- 스킬 이름, 범위, 검증 명령, 메모리 경로.
- PR 제한 게이트: 실행 전에 워크플로가 에이전트 라벨이 붙은 열린 PR을 확인합니다. 2단계에서 사용자가 선택한 제한값(기본값: 1)으로 설정합니다. 게이트는 `gh pr list --label "$AGENT_LABEL" --state open`을 사용해 개수를 비교합니다. 제한을 비활성화하면 게이트 단계를 완전히 제거합니다.
- `/iterate`가 활성화된 경우: `references/agent-iteration.ts`를 사용자가 선호하는 위치에 설치하고, 워크플로의 경로를 그에 맞게 업데이트합니다. 이 스크립트는 PR 푸터 생성과 반복 프롬프트 생성을 모두 처리합니다. 이 파일은 사용자가 선호하는 TypeScript 도구(타입 제거 기능이 있는 node, **Bun(추천)**, Deno, tsx 등)로 실행할 수 있으며, 사용자가 요청하면 다른 언어로 다시 작성할 수도 있습니다.

`/iterate`가 비활성화된 경우 `issue_comment` 트리거, 반복 전용 단계를 제거하고 `agent-iteration.ts` 설치는 건너뜁니다.

완료 기준: 존재하지 않는 파일에 의존하지 않고 워크플로를 `workflow_dispatch`로 실행할 수 있어야 합니다.

### 8. 검증 및 확인

**워크플로 YAML 검증:** 커밋하기 전에 워크플로 파일을 파싱해 문법 오류를 미리 찾습니다. 다음 중 하나를 사용합니다.

```bash
# Node.js / bun (js-yaml)
bunx js-yaml .github/workflows/agent-<task-name>.yml > /dev/null && echo "Valid YAML"

# Python
python -c "import yaml; yaml.safe_load(open('.github/workflows/agent-<task-name>.yml'))"

# yq (설치된 경우)
yq eval '.name' .github/workflows/agent-<task-name>.yml
```

파서가 실패하면, 다음 단계로 넘어가기 전에 YAML 문법을 수정합니다.

**참조와 경로 확인:** 스킬, 워크플로, 메모리 파일이 언급하는 모든 경로가 존재하거나 이 작업에서 의도적으로 생성되는지 확인합니다.

완료 기준: 워크플로 YAML이 오류 없이 파싱되고, 참조된 모든 파일이 존재해야 합니다.

### 9. 워크플로 드라이 런

GitHub Actions 워크플로는 최소 한 번 실행되기 전까지 `workflow_dispatch`로 수동 실행할 수 없습니다. 워크플로를 부트스트랩하려면 다음을 따릅니다.

1. (현재 브랜치가 main이 아닌 경우) 현재 브랜치에 대해 임시 `push` 트리거를 추가합니다.
   ```yaml
   on:
     push:
       branches:
         - <current-branch-name>  # 첫 실행 후 제거
     schedule:
       - cron: "0 13 * * *"
     workflow_dispatch:
       # ...
   ```

2. 새 파일(워크플로, 스킬, 메모리 파일, 스크립트)을 모두 커밋하고 푸시합니다.

3. 워크플로는 푸시 시 트리거됩니다. Actions 탭을 지켜보며 정상 실행되는지 확인합니다.

4. 첫 실행이 성공한 후 임시 `push` 트리거를 제거하고 다시 푸시합니다. 이제 Actions UI 또는 `gh workflow run`으로 워크플로를 수동 실행할 수 있습니다.

5. 드라이 런이 PR을 만들었다면, 에이전트 동작을 확인하기 위해 리뷰한 뒤 적절히 닫거나 병합합니다.

완료 기준: 워크플로가 Actions 탭에 나타나고, `workflow_dispatch`로 트리거할 수 있어야 합니다.

## 참조 파일

- `references/workflow-template.yml` - 코딩 에이전트 GitHub Actions 워크플로 골격.
- `references/agent-runner-templates.md` - Claude Code, Codex, OpenCode, CodeLayer용 헤드리스 명령과 시크릿.
- `references/agent-iteration.ts` - `/iterate` 지원용 헬퍼 스크립트(PR 푸터 및 반복 프롬프트 생성). 사용자 선호에 따라 `.github/scripts/`, `ci-scripts/`, 또는 `scripts/`에 설치합니다.
- `references/prompt-template.md` - 워크플로에 포함되는 프롬프트 구조.
- `references/memory-template.md` - 에이전트 메모리 파일 골격.
- `references/skill-template.md` - 생성되는 작업 스킬의 골격.
- `references/response-template.md` - CI 에이전트가 최종 응답(PR 본문)을 형식화하는 방법의 예시.
- `references/example-skill.md` - 예시 스킬.
