---
name: search-first
description: "코딩 전에 조사하는 워크플로우입니다. 직접 코드를 작성하기 전에 npm/PyPI, MCP 서버, 스킬, GitHub에서 기존 도구를 검색한 뒤 채택, 확장 또는 직접 구현을 결정합니다. 사소하지 않은 요구에는 researcher 에이전트를 실행합니다. 기능을 시작할 때, 의존성이나 통합을 추가할 때, 이미 존재할 수 있는 유틸리티를 작성하려 할 때 사용하세요."
metadata:
  origin: ECC
---

# /search-first — 코딩 전에 조사하기

구현 전에 기존 해결책을 검색하는 워크플로우를 체계화합니다.

## 트리거

다음의 경우에 이 스킬을 사용합니다.
- 기존 해결책이 있을 가능성이 높은 새 기능을 시작할 때
- 의존성이나 통합을 추가할 때
- 사용자가 "X 기능을 추가해 줘"라고 요청했고 코드를 작성하려 할 때
- 새로운 유틸리티, 헬퍼, 추상화를 만들기 전

## 워크플로우

```
┌─────────────────────────────────────────────┐
│  0. TOOL AVAILABILITY PREFLIGHT             │
│     Check search channels before relying on │
│     them; report skipped channels honestly   │
├─────────────────────────────────────────────┤
│  1. NEED ANALYSIS                           │
│     Define what functionality is needed      │
│     Identify language/framework constraints  │
├─────────────────────────────────────────────┤
│  2. PARALLEL SEARCH (researcher agent)      │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│     │  npm /   │ │  MCP /   │ │  GitHub / │  │
│     │  PyPI    │ │  Skills  │ │  Web      │  │
│     └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────┤
│  3. EVALUATE                                │
│     Score candidates (functionality, maint, │
│     community, docs, license, deps)         │
├─────────────────────────────────────────────┤
│  4. DECIDE                                  │
│     ┌─────────┐  ┌──────────┐  ┌─────────┐  │
│     │  Adopt  │  │  Extend  │  │  Build   │  │
│     │ as-is   │  │  /Wrap   │  │  Custom  │  │
│     └─────────┘  └──────────┘  └─────────┘  │
├─────────────────────────────────────────────┤
│  5. IMPLEMENT                               │
│     Install package / Configure MCP /       │
│     Write minimal custom code               │
└─────────────────────────────────────────────┘
```

## 결정 매트릭스

| 신호 | 조치 |
|--------|--------|
| 정확히 일치, 잘 관리됨, MIT/Apache | **Adopt(채택)** — 설치하여 바로 사용 |
| 부분적으로 일치, 좋은 기반 | **Extend(확장)** — 설치 + 얇은 래퍼 작성 |
| 약하게 일치하는 후보가 여러 개 | **Compose(조합)** — 작은 패키지 2~3개를 결합 |
| 적합한 것이 없음 | **Build(직접 구현)** — 조사 결과를 반영하여 직접 작성 |

## 사용 방법

### 0단계: 도구 가용성 점검

이것은 실행 가능한 설정 스크립트가 아니라 에이전트를 위한 안내입니다. 눈앞의 작업과 프로젝트에 관련된 채널만 점검하세요.

| 채널 | 점검 | 없을 때 |
|---------|-------|------------|
| 저장소 검색 | `rg --files` 및 대상 지정 `rg` 쿼리 | 볼 수 있었던 파일만 확인했다고 명시 |
| 패키지 레지스트리 | `npm --version`, `python -m pip --version`, 또는 프로젝트의 패키지 관리자 | 웹/문서 검색을 사용하고 레지스트리를 확인했다고 주장하지 않음 |
| GitHub CLI | `gh auth status` | 공개 웹 또는 로컬 git 이력만 사용 |
| MCP/문서 도구 | 사용 가능한 도구 목록 또는 로컬 MCP 설정 | 공식 문서/웹 검색으로 대체 |
| 스킬 디렉터리 | 해당되는 경우 `ls ~/.claude/skills ~/.codex/skills` | 로컬 스킬 카탈로그를 사용할 수 없었다고 말함 |

### 빠른 모드 (인라인)

유틸리티를 작성하거나 기능을 추가하기 전에 머릿속으로 다음을 확인합니다.

0. 저장소에 이미 있는가? → 먼저 관련 모듈/테스트를 `rg`로 검색
1. 흔한 문제인가? → npm/PyPI 검색
2. 이를 위한 MCP가 있는가? → `~/.claude/settings.json`을 확인하고 검색
3. 이를 위한 스킬이 있는가? → `~/.claude/skills/` 확인
4. GitHub 구현이나 템플릿이 있는가? → 새 코드를 작성하기 전에 유지보수되는 오픈소스를 GitHub 코드 검색으로 찾기

### 전체 모드 (에이전트)

사소하지 않은 기능에는 researcher 에이전트를 실행합니다.

```
Agent(subagent_type="general-purpose", prompt="
  Research existing tools for: [DESCRIPTION]
  Language/framework: [LANG]
  Constraints: [ANY]

  Search: npm/PyPI, MCP servers, Claude Code skills, GitHub
  Return: Structured comparison with recommendation
")
```

이전 Claude Code 문서에서는 이를 `Task(...)`로 부르기도 합니다. 활성 하네스가 제공하는 현재의 agent/subagent 도구 이름을 사용하세요.

## 카테고리별 검색 바로가기

### 개발 도구
- 린터 → `eslint`, `ruff`, `textlint`, `markdownlint`
- 포매터 → `prettier`, `black`, `gofmt`
- 테스트 → `jest`, `pytest`, `go test`
- 커밋 전 훅 → `husky`, `lint-staged`, `pre-commit`

### AI/LLM 통합
- Claude SDK → 최신 문서는 Context7 사용
- 프롬프트 관리 → MCP 서버 확인
- 문서 처리 → `unstructured`, `pdfplumber`, `mammoth`

### 데이터 & API
- HTTP 클라이언트 → `httpx` (Python), `ky`/`undici` (Node)
- 검증 → `zod` (TS), `pydantic` (Python)
- 데이터베이스 → 먼저 MCP 서버 확인

### 콘텐츠 & 퍼블리싱
- Markdown 처리 → `remark`, `unified`, `markdown-it`
- 이미지 최적화 → `sharp`, `imagemin`

## 통합 지점

### planner 에이전트와 함께
planner는 1단계(아키텍처 검토) 전에 researcher를 호출해야 합니다.
- researcher가 사용 가능한 도구를 식별
- planner가 이를 구현 계획에 반영
- 계획에서 "바퀴를 다시 발명하는" 일을 방지

### architect 에이전트와 함께
architect는 다음을 위해 researcher에게 자문해야 합니다.
- 기술 스택 결정
- 통합 패턴 발견
- 기존 참조 아키텍처

### iterative-retrieval 스킬과 함께
점진적 탐색을 위해 결합합니다.
- 1차: 넓은 검색 (npm, PyPI, MCP)
- 2차: 상위 후보를 상세히 평가
- 3차: 프로젝트 제약과의 호환성 테스트

## 예시

### 예시 1: "마크다운 깨진 링크 검사 추가"
```
Need: Check markdown files for broken links
Search: npm "markdown dead link checker"
Found: textlint-rule-no-dead-link (score: 9/10)
Action: ADOPT — npm install textlint-rule-no-dead-link
Result: Zero custom code, battle-tested solution
```

### 예시 2: "HTTP 클라이언트 래퍼 추가"
```
Need: Resilient HTTP client with retries and timeout handling
Search: npm "http client retry", PyPI "httpx retry"
Found: got (Node) with retry plugin, httpx (Python) with built-in retry
Action: ADOPT — use got/httpx directly with retry config
Result: Zero custom code, production-proven libraries
```

### 예시 3: "설정 파일 린터 추가"
```
Need: Validate project config files against a schema
Search: npm "config linter schema", "json schema validator cli"
Found: ajv-cli (score: 8/10)
Action: ADOPT + EXTEND — install ajv-cli, write project-specific schema
Result: 1 package + 1 schema file, no custom validation logic
```

## 안티패턴

- **바로 코드로 뛰어들기**: 이미 존재하는지 확인하지 않고 유틸리티를 작성함
- **MCP 무시**: 이미 해당 기능을 제공하는 MCP 서버가 있는지 확인하지 않음
- **조용한 건너뛰기**: 검색 채널을 사용할 수 없었는데도 "아무것도 찾지 못했다"고 보고함
- **과도한 커스터마이징**: 라이브러리를 너무 많이 감싸서 그 이점을 잃어버림
- **의존성 비대화**: 작은 기능 하나를 위해 거대한 패키지를 설치함
