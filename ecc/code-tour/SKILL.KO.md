---
name: code-tour
description: CodeTour `.tour` 파일을 만듭니다 — 특정 독자에 맞춘, 실제 파일과 줄 번호에 고정된 단계별 안내입니다. 온보딩 투어, 아키텍처 안내, PR 투어, RCA 투어, 그리고 구조화된 "이것이 어떻게 동작하는지 설명해 줘" 요청에 사용합니다. 사용자가 코드 투어, 온보딩 안내, PR 투어, 또는 하위 시스템의 동작 설명을 요청할 때 사용합니다.
metadata:
  origin: ECC
---

# Code Tour

코드베이스를 안내하는 **CodeTour** `.tour` 파일을 만듭니다. 이 파일은 실제 파일과 줄 범위로 바로 열립니다. 투어는 `.tours/`에 저장되며, 임시 Markdown 메모가 아니라 CodeTour 형식을 위한 것입니다.

좋은 투어는 특정 독자를 위한 이야기입니다.
- 독자가 지금 보고 있는 것이 무엇인지
- 그것이 왜 중요한지
- 다음에 어떤 경로를 따라가야 하는지

`.tour` JSON 파일만 만듭니다. 이 스킬의 일부로 소스 코드를 수정하지 마세요.

## 사용 시점

다음 경우에 이 스킬을 사용합니다.
- 사용자가 코드 투어, 온보딩 투어, 아키텍처 안내, 또는 PR 투어를 요청할 때
- 사용자가 "X가 어떻게 동작하는지 설명해 줘"라고 말하면서 재사용 가능한 안내 자료를 원할 때
- 사용자가 신입 엔지니어나 리뷰어를 위한 학습 경로를 원할 때
- 작업이 평면적인 요약보다 안내된 순서로 더 잘 전달될 때

예시:
- 새 유지보수자 온보딩
- 하나의 서비스나 패키지에 대한 아키텍처 투어
- 변경된 파일에 고정된 PR 리뷰 안내
- 실패 경로를 보여 주는 RCA 투어
- 신뢰 경계와 주요 검사를 다루는 보안 리뷰 투어

## 사용하지 말아야 할 때

| code-tour 대신 | 사용할 것 |
| --- | --- |
| 채팅에서 한 번 설명하면 충분할 때 | 바로 답변 |
| 사용자가 `.tour` 자료가 아니라 산문 문서를 원할 때 | `documentation-lookup` 또는 저장소 문서 편집 |
| 작업이 구현이나 리팩터링일 때 | 구현 작업 수행 |
| 투어 자료 없이 넓은 범위의 코드베이스 온보딩일 때 | `codebase-onboarding` |

## 워크플로

### 1. 탐색

무엇인가를 쓰기 전에 저장소를 살펴봅니다.
- README와 패키지/앱 진입점
- 폴더 구조
- 관련 설정 파일
- PR 중심 투어라면 변경된 파일

코드의 형태를 이해하기 전에는 단계를 쓰기 시작하지 마세요.

### 2. 독자 추론

요청으로부터 페르소나와 깊이를 정합니다.

| 요청 형태 | 페르소나 | 권장 깊이 |
| --- | --- | --- |
| "onboarding", "new joiner" | `new-joiner` | 9-13 단계 |
| "quick tour", "vibe check" | `vibecoder` | 5-8 단계 |
| "architecture" | `architect` | 14-18 단계 |
| "tour this PR" | `pr-reviewer` | 7-11 단계 |
| "why did this break" | `rca-investigator` | 7-11 단계 |
| "security review" | `security-reviewer` | 7-11 단계 |
| "explain how this feature works" | `feature-explainer` | 7-11 단계 |
| "debug this path" | `bug-fixer` | 7-11 단계 |

### 3. 읽기 및 앵커 검증

모든 파일 경로와 줄 앵커는 실제로 존재해야 합니다.
- 파일이 존재하는지 확인합니다
- 줄 번호가 범위 안에 있는지 확인합니다
- 선택 영역을 사용한다면, 정확한 블록을 확인합니다
- 파일이 자주 바뀐다면, 패턴 기반 앵커를 선호합니다

줄 번호를 추측하지 마세요.

### 4. `.tour` 작성

다음 경로에 씁니다.

```text
.tours/<persona>-<focus>.tour
```

경로는 결정적이고 읽기 쉽게 유지하세요.

### 5. 검증

마무리하기 전에 확인합니다.
- 참조된 모든 경로가 존재한다
- 모든 줄이나 선택 영역이 유효하다
- 첫 단계가 실제 파일이나 디렉터리에 고정되어 있다
- `ref`가 참조하는 모든 파일을 실제로 가진 브랜치나 커밋을 가리킨다(아래 참조)
- 투어가 파일 목록 나열이 아니라 일관된 이야기를 전달한다

## `ref` 필드

`ref`는 투어를 git 브랜치나 커밋에 연결합니다. 생각보다 중요합니다. `ref`가 독자가 체크아웃한 브랜치가 아니면, CodeTour는 디스크의 파일이 아니라 git의 해당 리비전에서 각 단계의 파일을 엽니다. 해당 리비전에 파일이 없으면 단계가 열리지 않습니다. 파일이 바로 옆에 있어도 독자는 *"The editor could not be opened because the file was not found"* 메시지를 보게 됩니다. 투어와 주석은 그대로 보이기 때문에 진짜 원인을 놓치기 쉽습니다.

투어 종류에 따라 `ref`를 고르세요.

| 투어 종류 | `ref` 설정 값 |
| --- | --- |
| PR 투어 | PR 브랜치 — 기본 브랜치는 절대 아님 |
| 온보딩 / 아키텍처 | 독자가 있을 브랜치(보통 `main`), 또는 생략 |
| 잘 모르겠음 | `ref`를 생략하여 CodeTour가 디스크에서 바로 읽도록 함 |

흔한 함정은 PR 경우입니다. PR은 보통 새 파일을 추가하는데, 새 파일은 아직 기본 브랜치에 없습니다. `ref`를 기본 브랜치(예: `develop`)로 지정하면, 새 파일을 가리키는 모든 단계가 열리지 않습니다.

마무리하기 전에 각 단계의 파일이 선택한 `ref`에 실제로 존재하는지 확인하세요.

## 단계 유형

### Content(내용)

드물게, 보통 마지막 단계에서만 사용합니다.

```json
{ "title": "Next Steps", "description": "You can now trace the request path end to end." }
```

첫 단계를 내용만 있는 단계로 만들지 마세요.

### Directory(디렉터리)

독자에게 모듈의 방향을 알려 줄 때 사용합니다.

```json
{ "directory": "src/services", "title": "Service Layer", "description": "The core orchestration logic lives here." }
```

### File + line(파일 + 줄)

이것이 기본 단계 유형입니다.

```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "Every protected request passes here first." }
```

### Selection(선택 영역)

파일 전체보다 특정 코드 블록이 더 중요할 때 사용합니다.

```json
{
  "file": "src/core/pipeline.ts",
  "selection": {
    "start": { "line": 15, "character": 0 },
    "end": { "line": 34, "character": 0 }
  },
  "title": "Request Pipeline",
  "description": "This block wires validation, auth, and downstream execution."
}
```

### Pattern(패턴)

정확한 줄이 바뀔 수 있을 때 사용합니다.

```json
{ "file": "src/app.ts", "pattern": "export default class App", "title": "Application Entry" }
```

### URI

필요할 때 PR, 이슈, 문서에 사용합니다.

```json
{ "uri": "https://github.com/org/repo/pull/456", "title": "The PR" }
```

## 작성 규칙: SMIG

각 설명은 다음 질문에 답해야 합니다.
- **Situation(상황)**: 독자가 무엇을 보고 있는가
- **Mechanism(메커니즘)**: 어떻게 동작하는가
- **Implication(함의)**: 이 페르소나에게 왜 중요한가
- **Gotcha(함정)**: 똑똑한 독자가 놓칠 수 있는 것은 무엇인가

설명은 간결하고 구체적이며, 실제 코드에 근거해야 합니다.

## 이야기 구조

과제가 분명히 다른 것을 요구하지 않는 한, 다음 흐름을 사용하세요.
1. 방향 잡기
2. 모듈 지도
3. 핵심 실행 경로
4. 예외 상황이나 함정
5. 마무리 / 다음 행동

투어는 목록이 아니라 하나의 길처럼 느껴져야 합니다.

## 예시

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "API Service Tour",
  "description": "Walkthrough of the request path for the payments service.",
  "ref": "main",
  "steps": [
    {
      "directory": "src",
      "title": "Source Root",
      "description": "All runtime code for the service starts here."
    },
    {
      "file": "src/server.ts",
      "line": 12,
      "title": "Entry Point",
      "description": "The server boots here and wires middleware before any route is reached."
    },
    {
      "file": "src/routes/payments.ts",
      "line": 8,
      "title": "Payment Routes",
      "description": "Every payments request enters through this router before hitting service logic."
    },
    {
      "title": "Next Steps",
      "description": "You can now follow any payment request end to end with the main anchors in place."
    }
  ]
}
```

## 안티패턴

| 안티패턴 | 해결 |
| --- | --- |
| 평면적인 파일 목록 | 단계 사이의 의존 관계로 이야기를 만든다 |
| 일반적인 설명 | 구체적인 코드 경로나 패턴의 이름을 댄다 |
| 추측한 앵커 | 모든 파일과 줄을 먼저 검증한다 |
| 빠른 투어에 단계가 너무 많음 | 과감하게 줄인다 |
| 첫 단계가 내용만 있음 | 첫 단계를 실제 파일이나 디렉터리에 고정한다 |
| 페르소나 불일치 | 일반 엔지니어가 아니라 실제 독자를 위해 쓴다 |

## 모범 사례

- 단계 수를 저장소 규모와 페르소나의 깊이에 맞춥니다
- 방향 잡기에는 디렉터리 단계를, 실질적인 내용에는 파일 단계를 사용합니다
- PR 투어에서는 변경된 파일을 먼저 다룹니다
- 모노레포에서는 모든 것을 안내하지 말고 관련 패키지로 범위를 한정합니다
- 요약이 아니라, 독자가 이제 무엇을 할 수 있는지로 마무리합니다

## 관련 스킬

- `codebase-onboarding`
- `coding-standards`
- `council`
- 공식 upstream 형식: `microsoft/codetour`
