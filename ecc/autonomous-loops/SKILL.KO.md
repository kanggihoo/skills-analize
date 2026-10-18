---
name: autonomous-loops
description: "단순한 순차 파이프라인부터 RFC 기반 다중 에이전트 DAG 시스템까지, 자율 Claude Code 루프를 위한 패턴과 아키텍처. 호환성 목적으로만 유지됩니다. 새로운 자율 루프 가이드가 필요하면 대신 continuous-agent-loop를 사용하세요."
metadata:
  origin: ECC
---

# 자율 루프 스킬

Claude Code를 루프 안에서 자율적으로 실행하기 위한 패턴, 아키텍처, 참조 구현입니다. 단순한 `claude -p` 파이프라인부터 RFC 기반 다중 에이전트 DAG 오케스트레이션까지 다룹니다.

> 호환성 참고 (v1.8.0): `autonomous-loops`는 한 번의 릴리스 동안 유지됩니다.
> 정식 스킬 이름은 이제 `continuous-agent-loop`입니다. 새로운 루프 가이드는
> 그곳에 작성되어야 하며, 기존 워크플로가 깨지지 않도록 이 스킬도 계속 사용할 수 있습니다.

## 사용 시점

- 사람의 개입 없이 실행되는 자율 개발 워크플로를 설정할 때
- 문제에 맞는 루프 아키텍처 선택하기 (단순 vs 복잡)
- CI/CD 스타일의 지속적 개발 파이프라인을 만들 때
- 병합 조율과 함께 병렬 에이전트를 실행할 때
- 루프 반복 간 맥락 영속성을 구현할 때
- 자율 워크플로에 품질 게이트와 정리 단계를 추가할 때

## 루프 패턴 스펙트럼

가장 단순한 것부터 가장 정교한 것까지:

| 패턴 | 복잡도 | 적합한 용도 |
|---------|-----------|----------|
| [순차 파이프라인](#1-sequential-pipeline-claude--p) | 낮음 | 일일 개발 단계, 스크립트화된 워크플로 |
| [NanoClaw REPL](#2-nanoclaw-repl) | 낮음 | 대화형 영속 세션 |
| [무한 에이전트 루프](#3-infinite-agentic-loop) | 중간 | 병렬 콘텐츠 생성, 명세 기반 작업 |
| [Continuous Claude PR 루프](#4-continuous-claude-pr-loop) | 중간 | CI 게이트가 있는 여러 날에 걸친 반복 프로젝트 |
| [De-Sloppify 패턴](#5-the-de-sloppify-pattern) | 부가 기능 | 구현자(Implementer) 단계 후의 품질 정리 |
| [Ralphinho / RFC 기반 DAG](#6-ralphinho--rfc-driven-dag-orchestration) | 높음 | 병합 큐가 있는 대규모 기능, 다중 단위 병렬 작업 |

---

## 1. 순차 파이프라인 (`claude -p`)

**가장 단순한 루프.** 일일 개발을 일련의 비대화형 `claude -p` 호출로 나눕니다. 각 호출은 명확한 프롬프트를 가진 집중된 단계입니다.

### 핵심 통찰

> 이런 루프를 떠올릴 수 없다면, 대화형 모드에서 LLM이 코드를 고치도록 이끌 수조차 없다는 뜻입니다.

`claude -p` 플래그는 프롬프트와 함께 Claude Code를 비대화형으로 실행하고, 끝나면 종료합니다. 호출을 연결하여 파이프라인을 만드세요.

```bash
#!/bin/bash
# daily-dev.sh — 기능 브랜치를 위한 순차 파이프라인

set -e

# 1단계: 기능 구현
claude -p "Read the spec in docs/auth-spec.md. Implement OAuth2 login in src/auth/. Write tests first (TDD). Do NOT create any new documentation files."

# 2단계: De-sloppify (정리 단계)
claude -p "Review all files changed by the previous commit. Remove any unnecessary type tests, overly defensive checks, or testing of language features (e.g., testing that TypeScript generics work). Keep real business logic tests. Run the test suite after cleanup."

# 3단계: 검증
claude -p "Run the full build, lint, type check, and test suite. Fix any failures. Do not add new features."

# 4단계: 커밋
claude -p "Create a conventional commit for all staged changes. Use 'feat: add OAuth2 login flow' as the message."
```

### 핵심 설계 원칙

1. **각 단계는 격리됨** — `claude -p` 호출마다 새로운 컨텍스트 창을 쓰므로 단계 간 맥락이 새지 않습니다.
2. **순서가 중요함** — 단계는 순차적으로 실행되며, 각 단계는 이전 단계가 남긴 파일 시스템 상태 위에 쌓입니다.
3. **부정형 지시는 위험함** — "타입 시스템을 테스트하지 마"라고 말하지 마세요. 대신 별도의 정리 단계를 추가하세요 ([De-Sloppify 패턴](#5-the-de-sloppify-pattern) 참조).
4. **종료 코드가 전파됨** — `set -e`로 실패 시 파이프라인을 멈춥니다.

### 변형

**모델 라우팅 포함:**
```bash
# Opus로 조사 (깊은 추론)
claude -p --model opus "Analyze the codebase architecture and write a plan for adding caching..."

# Sonnet으로 구현 (빠르고 유능함)
claude -p "Implement the caching layer according to the plan in docs/caching-plan.md..."

# Opus로 리뷰 (철저함)
claude -p --model opus "Review all changes for security issues, race conditions, and edge cases..."
```

**환경 맥락 포함:**
```bash
# 맥락은 프롬프트 길이가 아니라 파일로 전달
echo "Focus areas: auth module, API rate limiting" > .claude-context.md
claude -p "Read .claude-context.md for priorities. Work through them in order."
rm .claude-context.md
```

**`--allowedTools` 제한 포함:**
```bash
# 읽기 전용 분석 단계
claude -p --allowedTools "Read,Grep,Glob" "Audit this codebase for security vulnerabilities..."

# 쓰기 전용 구현 단계
claude -p --allowedTools "Read,Write,Edit,Bash" "Implement the fixes from security-audit.md..."
```

---

## 2. NanoClaw REPL

**ECC에 내장된 영속 루프.** 전체 대화 기록과 함께 `claude -p`를 동기적으로 호출하는, 세션을 인식하는 REPL입니다.

```bash
# 기본 세션 시작
node scripts/claw.js

# 스킬 맥락이 있는 이름 있는 세션
CLAW_SESSION=my-project CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
```

### 작동 방식

1. `~/.claude/claw/{session}.md`에서 대화 기록을 로드
2. 각 사용자 메시지를 전체 기록을 맥락으로 담아 `claude -p`에 전송
3. 응답을 세션 파일에 덧붙임 (마크다운을 데이터베이스로 사용)
4. 재시작해도 세션이 유지됨

### NanoClaw vs 순차 파이프라인

| 사용 사례 | NanoClaw | 순차 파이프라인 |
|----------|----------|-------------------|
| 대화형 탐색 | 예 | 아니오 |
| 스크립트 자동화 | 아니오 | 예 |
| 세션 영속성 | 내장 | 수동 |
| 맥락 누적 | 턴마다 증가 | 단계마다 새로 시작 |
| CI/CD 통합 | 약함 | 우수함 |

자세한 내용은 `/claw` 명령 문서를 참조하세요.

---

## 3. 무한 에이전트 루프

명세 기반 생성을 위해 병렬 하위 에이전트를 조율하는 **두 프롬프트 시스템**입니다. disler가 개발했습니다 (크레딧: @disler).

### 아키텍처: 두 프롬프트 시스템

```
PROMPT 1 (Orchestrator)              PROMPT 2 (Sub-Agents)
┌─────────────────────┐             ┌──────────────────────┐
│ Parse spec file      │             │ Receive full context  │
│ Scan output dir      │  deploys   │ Read assigned number  │
│ Plan iteration       │────────────│ Follow spec exactly   │
│ Assign creative dirs │  N agents  │ Generate unique output │
│ Manage waves         │             │ Save to output dir    │
└─────────────────────┘             └──────────────────────┘
```

### 패턴

1. **명세 분석** — 오케스트레이터가 무엇을 생성할지 정의한 명세 파일(마크다운)을 읽음
2. **디렉터리 정찰** — 기존 출력을 스캔하여 가장 높은 반복 번호를 찾음
3. **병렬 배포** — N개의 하위 에이전트를 실행하며, 각각은 다음을 받음:
   - 전체 명세
   - 고유한 창작 방향
   - 특정 반복 번호 (충돌 없음)
   - 기존 반복의 스냅샷 (고유성 보장용)
4. **웨이브 관리** — 무한 모드에서는 컨텍스트가 소진될 때까지 3-5개 에이전트의 웨이브를 배포

### Claude Code 명령으로 구현

`.claude/commands/infinite.md`를 만드세요.

```markdown
$ARGUMENTS에서 다음 인자를 파싱:
1. spec_file — 명세 마크다운 경로
2. output_dir — 반복 결과를 저장할 위치
3. count — 1-N 정수 또는 "infinite"

PHASE 1: 명세를 읽고 깊이 이해한다.
PHASE 2: output_dir을 나열하고 가장 높은 반복 번호를 찾는다. N+1에서 시작한다.
PHASE 3: 창작 방향을 계획한다 — 각 에이전트는 서로 다른 테마/접근을 받는다.
PHASE 4: 하위 에이전트를 병렬로 배포한다 (Task 도구). 각 에이전트는 다음을 받는다:
  - 전체 명세 텍스트
  - 현재 디렉터리 스냅샷
  - 할당된 반복 번호
  - 고유한 창작 방향
PHASE 5 (무한 모드): 컨텍스트가 적어질 때까지 3-5개 단위 웨이브로 반복한다.
```

**실행:**
```bash
/project:infinite specs/component-spec.md src/ 5
/project:infinite specs/component-spec.md src/ infinite
```

### 배치 전략

| 개수 | 전략 |
|-------|----------|
| 1-5 | 모든 에이전트를 동시에 |
| 6-20 | 5개씩 배치 |
| infinite | 3-5개 웨이브, 점진적으로 정교해짐 |

### 핵심 통찰: 할당을 통한 고유성

에이전트가 스스로 차별화하도록 기대하지 마세요. 오케스트레이터가 각 에이전트에게 특정 창작 방향과 반복 번호를 **할당**합니다. 이렇게 하면 병렬 에이전트 간 중복된 개념을 막을 수 있습니다.

---

## 4. Continuous Claude PR 루프

Claude Code를 지속적으로 루프에서 실행하며, PR을 만들고, CI를 기다리고, 자동으로 병합하는 **프로덕션 수준의 셸 스크립트**입니다. AnandChowdhary가 만들었습니다 (크레딧: @AnandChowdhary).

### 핵심 루프

```
┌─────────────────────────────────────────────────────┐
│  CONTINUOUS CLAUDE ITERATION                        │
│                                                     │
│  1. 브랜치 생성 (continuous-claude/iteration-N)     │
│  2. 강화된 프롬프트로 claude -p 실행                │
│  3. (선택) 리뷰어 단계 — 별도의 claude -p           │
│  4. 변경 커밋 (claude가 메시지 생성)                │
│  5. Push + PR 생성 (gh pr create)                   │
│  6. CI 체크 대기 (gh pr checks 폴링)                │
│  7. CI 실패? → 자동 수정 단계 (claude -p)           │
│  8. PR 병합 (squash/merge/rebase)                   │
│  9. main으로 돌아가서 반복                          │
│                                                     │
│  제한 기준: --max-runs N | --max-cost $X             │
│            --max-duration 2h | 완료 신호            │
└─────────────────────────────────────────────────────┘
```

### 설치

> **경고:** 코드를 검토한 뒤 저장소에서 continuous-claude를 설치하세요. 외부 스크립트를 bash에 직접 파이프로 연결하지 마세요.

### 사용법

```bash
# 기본: 10회 반복
continuous-claude --prompt "Add unit tests for all untested functions" --max-runs 10

# 비용 제한
continuous-claude --prompt "Fix all linter errors" --max-cost 5.00

# 시간 제한
continuous-claude --prompt "Improve test coverage" --max-duration 8h

# 코드 리뷰 단계 포함
continuous-claude \
  --prompt "Add authentication feature" \
  --max-runs 10 \
  --review-prompt "Run npm test && npm run lint, fix any failures"

# worktree를 통한 병렬 실행
continuous-claude --prompt "Add tests" --max-runs 5 --worktree tests-worker &
continuous-claude --prompt "Refactor code" --max-runs 5 --worktree refactor-worker &
wait
```

### 반복 간 맥락: SHARED_TASK_NOTES.md

결정적인 혁신은 반복 간에 유지되는 `SHARED_TASK_NOTES.md` 파일입니다.

```markdown
## Progress
- [x] Added tests for auth module (iteration 1)
- [x] Fixed edge case in token refresh (iteration 2)
- [ ] Still need: rate limiting tests, error boundary tests

## Next Steps
- Focus on rate limiting module next
- The mock setup in tests/helpers.ts can be reused
```

Claude는 반복 시작 시 이 파일을 읽고, 반복이 끝나면 갱신합니다. 이것이 독립적인 `claude -p` 호출 사이의 맥락 격차를 메웁니다.

### CI 실패 복구

PR 체크가 실패하면 Continuous Claude는 자동으로 다음을 수행합니다.
1. `gh run list`로 실패한 실행 ID를 가져옴
2. CI 수정 맥락과 함께 새로운 `claude -p`를 생성
3. Claude가 `gh run view`로 로그를 살펴보고, 코드를 고치고, 커밋하고, push
4. 체크를 다시 기다림 (`--ci-retry-max` 횟수까지)

### 완료 신호

Claude는 특정 문구를 출력하여 "끝났다"고 신호를 보낼 수 있습니다.

```bash
continuous-claude \
  --prompt "Fix all bugs in the issue tracker" \
  --completion-signal "CONTINUOUS_CLAUDE_PROJECT_COMPLETE" \
  --completion-threshold 3  # 3회 연속 신호 후 중지
```

세 번 연속 반복에서 완료 신호가 나오면 루프가 멈추어, 이미 끝난 작업에 실행을 낭비하지 않습니다.

### 주요 설정

| 플래그 | 목적 |
|------|---------|
| `--max-runs N` | 성공한 반복 N회 후 중지 |
| `--max-cost $X` | $X를 지출한 후 중지 |
| `--max-duration 2h` | 경과 시간 후 중지 |
| `--merge-strategy squash` | squash, merge, 또는 rebase |
| `--worktree <name>` | git worktree를 통한 병렬 실행 |
| `--disable-commits` | dry-run 모드 (git 작업 없음) |
| `--review-prompt "..."` | 반복마다 리뷰어 단계 추가 |
| `--ci-retry-max N` | CI 실패 자동 수정 (기본값: 1) |

---

## 5. De-Sloppify 패턴

**모든 루프에 붙일 수 있는 부가 패턴.** 각 구현자(Implementer) 단계 뒤에 전용 정리/리팩터링 단계를 추가합니다.

### 문제

LLM에게 TDD로 구현하라고 하면 "테스트를 작성하라"를 지나치게 문자 그대로 받아들입니다.
- 타입 시스템이 작동하는지 검증하는 테스트 (`typeof x === 'string'` 테스트)
- 타입 시스템이 이미 보장하는 것에 대한 과도하게 방어적인 런타임 검사
- 비즈니스 로직이 아니라 프레임워크 동작을 위한 테스트
- 실제 코드를 가리는 과도한 에러 처리

### 왜 부정형 지시를 쓰지 않는가?

구현자 프롬프트에 "타입 시스템을 테스트하지 마" 또는 "불필요한 검사를 추가하지 마"를 넣으면 다운스트림에 영향이 생깁니다.
- 모델이 **모든** 테스트 작성을 주저하게 됨
- 정당한 엣지 케이스 테스트도 건너뜀
- 품질이 예측 불가능하게 떨어짐

### 해결책: 별도의 단계

구현자를 제약하는 대신, 충분히 철저하게 하도록 둡니다. 그런 다음 집중된 정리 에이전트를 추가하세요.

```bash
# 1단계: 구현 (철저하게 하도록 둠)
claude -p "Implement the feature with full TDD. Be thorough with tests."

# 2단계: De-sloppify (별도 맥락, 집중된 정리)
claude -p "Review all changes in the working tree. Remove:
- Tests that verify language/framework behavior rather than business logic
- Redundant type checks that the type system already enforces
- Over-defensive error handling for impossible states
- Console.log statements
- Commented-out code

Keep all business logic tests. Run the test suite after cleanup to ensure nothing breaks."
```

### 루프 맥락에서

```bash
for feature in "${features[@]}"; do
  # 구현
  claude -p "Implement $feature with TDD."

  # De-sloppify
  claude -p "Cleanup pass: review changes, remove test/code slop, run tests."

  # 검증
  claude -p "Run build + lint + tests. Fix any failures."

  # 커밋
  claude -p "Commit with message: feat: add $feature"
done
```

### 핵심 통찰

> 품질에 다운스트림 영향을 주는 부정형 지시를 추가하기보다, 별도의 de-sloppify 단계를 추가하세요. 두 개의 집중된 에이전트가 하나의 제약된 에이전트보다 낫습니다.

---

## 6. Ralphinho / RFC 기반 DAG 오케스트레이션

**가장 정교한 패턴.** RFC 기반의 다중 에이전트 파이프라인으로, 명세를 의존성 DAG로 분해하고, 각 단위를 계층화된 품질 파이프라인에 통과시키며, 에이전트가 주도하는 병합 큐로 착지시킵니다. enitrat가 만들었습니다 (크레딧: @enitrat).

### 아키텍처 개요

```
RFC/PRD 문서
       │
       ▼
  분해 (AI)
  RFC를 의존성 DAG를 가진 작업 단위로 나눔
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  RALPH 루프 (최대 3회 패스)                          │
│                                                      │
│  DAG 계층별로 (의존성 순서에 따라 순차적으로):        │
│                                                      │
│  ┌── 품질 파이프라인 (단위별 병렬) ───────────────┐  │
│  │  각 단위는 자신의 worktree에서:                │  │
│  │  Research → Plan → Implement → Test → Review   │  │
│  │  (깊이는 복잡도 등급에 따라 다름)              │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌── 병합 큐 ─────────────────────────────────────┐  │
│  │  main에 리베이스 → 테스트 실행 → 착지 또는 퇴출 │  │
│  │  퇴출된 단위는 충돌 맥락과 함께 재진입         │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### RFC 분해

AI가 RFC를 읽고 작업 단위를 만듭니다.

```typescript
interface WorkUnit {
  id: string;              // kebab-case 식별자
  name: string;            // 사람이 읽을 수 있는 이름
  rfcSections: string[];   // 이 작업이 다루는 RFC 섹션
  description: string;     // 상세 설명
  deps: string[];          // 의존성 (다른 단위 ID)
  acceptance: string[];    // 구체적인 수용 기준
  tier: "trivial" | "small" | "medium" | "large";
}
```

**분해 규칙:**
- 더 적고 응집력 있는 단위를 선호 (병합 위험 최소화)
- 단위 간 파일 겹침을 최소화 (충돌 방지)
- 테스트는 구현과 함께 둠 (별도의 "X 구현" + "X 테스트"로 나누지 않음)
- 실제 코드 의존이 있는 곳에서만 의존성을 둠

의존성 DAG가 실행 순서를 결정합니다.
```
계층 0: [unit-a, unit-b]     ← 의존성 없음, 병렬 실행
계층 1: [unit-c]             ← unit-a에 의존
계층 2: [unit-d, unit-e]     ← unit-c에 의존
```

### 복잡도 등급

등급마다 파이프라인 깊이가 다릅니다.

| 등급 | 파이프라인 단계 |
|------|----------------|
| **trivial** | implement → test |
| **small** | implement → test → code-review |
| **medium** | research → plan → implement → test → PRD-review + code-review → review-fix |
| **large** | research → plan → implement → test → PRD-review + code-review → review-fix → final-review |

이렇게 하면 단순한 변경에 비싼 작업이 들어가는 것을 막고, 아키텍처 변경은 철저한 검토를 받게 됩니다.

### 별도의 컨텍스트 창 (작성자 편향 제거)

각 단계는 자신만의 에이전트 프로세스와 컨텍스트 창에서 실행됩니다.

| 단계 | 모델 | 목적 |
|-------|-------|---------|
| Research | Sonnet | 코드베이스와 RFC를 읽고 맥락 문서 작성 |
| Plan | Opus | 구현 단계 설계 |
| Implement | Codex | 계획을 따라 코드 작성 |
| Test | Sonnet | 빌드와 테스트 스위트 실행 |
| PRD Review | Sonnet | 명세 준수 확인 |
| Code Review | Opus | 품질과 보안 확인 |
| Review Fix | Codex | 리뷰 이슈 해결 |
| Final Review | Opus | 품질 게이트 (large 등급에서만) |

**핵심 설계:** 리뷰어는 자신이 검토하는 코드를 작성하지 않았습니다. 이것은 작성자 편향을 제거합니다. 자기 리뷰에서 이슈를 놓치는 가장 흔한 원인이 바로 작성자 편향입니다.

### 퇴출이 있는 병합 큐

품질 파이프라인이 끝나면 단위들이 병합 큐에 들어갑니다.

```
단위 브랜치
    │
    ├─ main에 리베이스
    │   └─ 충돌? → 퇴출 (충돌 맥락 캡처)
    │
    ├─ 빌드 + 테스트 실행
    │   └─ 실패? → 퇴출 (테스트 출력 캡처)
    │
    └─ 통과 → main을 fast-forward, push, 브랜치 삭제
```

**파일 겹침 인텔리전스:**
- 겹치지 않는 단위는 추측적으로 병렬 착지
- 겹치는 단위는 하나씩, 매번 리베이스하며 착지

**퇴출 복구:**
퇴출되면 전체 맥락(충돌 파일, diff, 테스트 출력)이 캡처되어 다음 Ralph 패스에서 구현자에게 다시 전달됩니다.

```markdown
## 병합 충돌 — 다음 착지 전에 해결할 것

당신의 이전 구현이 먼저 착지한 다른 단위와 충돌했습니다.
아래의 충돌 파일/라인을 피하도록 변경을 재구성하세요.

{diff를 포함한 전체 퇴출 맥락}
```

### 단계 간 데이터 흐름

```
research.contextFilePath ──────────────────→ plan
plan.implementationSteps ──────────────────→ implement
implement.{filesCreated, whatWasDone} ─────→ test, reviews
test.failingSummary ───────────────────────→ reviews, implement (다음 패스)
reviews.{feedback, issues} ────────────────→ review-fix → implement (다음 패스)
final-review.reasoning ────────────────────→ implement (다음 패스)
evictionContext ───────────────────────────→ implement (병합 충돌 후)
```

### Worktree 격리

모든 단위는 격리된 worktree에서 실행됩니다 (git이 아니라 jj/Jujutsu 사용):
```
/tmp/workflow-wt-{unit-id}/
```

같은 단위의 파이프라인 단계들은 worktree를 **공유**하여, research → plan → implement → test → review 전반에 걸쳐 상태(맥락 파일, 계획 파일, 코드 변경)를 보존합니다.

### 핵심 설계 원칙

1. **결정적 실행** — 사전 분해가 병렬성과 순서를 고정함
2. **중요한 지점에서의 사람 검토** — 작업 계획이 가장 레버리지가 큰 개입 지점
3. **관심사 분리** — 각 단계는 별도의 에이전트가 맡는 별도의 컨텍스트 창에서 실행
4. **맥락을 포함한 충돌 복구** — 전체 퇴출 맥락이 맹목적인 재시도가 아니라 지능적인 재실행을 가능하게 함
5. **등급에 따른 깊이** — trivial 변경은 research/review를 건너뛰고, large 변경은 최대한의 검토를 받음
6. **재개 가능한 워크플로** — 전체 상태를 SQLite에 영속화하며, 어느 지점에서든 재개 가능

### Ralphinho를 쓸지, 더 단순한 패턴을 쓸지

| 신호 | Ralphinho 사용 | 단순한 패턴 사용 |
|--------|--------------|-------------------|
| 상호 의존적인 여러 작업 단위 | 예 | 아니오 |
| 병렬 구현이 필요 | 예 | 아니오 |
| 병합 충돌 가능성이 높음 | 예 | 아니오 (순차가 괜찮음) |
| 단일 파일 변경 | 아니오 | 예 (순차 파이프라인) |
| 여러 날에 걸친 프로젝트 | 예 | 아마도 (continuous-claude) |
| 명세/RFC가 이미 작성됨 | 예 | 아마도 |
| 한 가지에 대한 빠른 반복 | 아니오 | 예 (NanoClaw 또는 파이프라인) |

---

## 적절한 패턴 고르기

### 결정 매트릭스

```
작업이 단일하고 집중된 변경인가?
├─ 예 → 순차 파이프라인 또는 NanoClaw
└─ 아니오 → 작성된 명세/RFC가 있는가?
         ├─ 예 → 병렬 구현이 필요한가?
         │        ├─ 예 → Ralphinho (DAG 오케스트레이션)
         │        └─ 아니오 → Continuous Claude (반복형 PR 루프)
         └─ 아니오 → 같은 것의 많은 변형이 필요한가?
                  ├─ 예 → 무한 에이전트 루프 (명세 기반 생성)
                  └─ 아니오 → de-sloppify가 포함된 순차 파이프라인
```

### 패턴 조합하기

이 패턴들은 잘 조합됩니다.

1. **순차 파이프라인 + De-Sloppify** — 가장 흔한 조합. 모든 구현 단계에 정리 단계가 붙음.

2. **Continuous Claude + De-Sloppify** — 각 반복에 de-sloppify 지시가 담긴 `--review-prompt`를 추가.

3. **어떤 루프에든 + 검증** — 커밋 전 게이트로 ECC의 `/verify` 명령이나 `verification-loop` 스킬을 사용.

4. **단순한 루프에서의 Ralphinho식 등급 분리** — 순차 파이프라인에서도 단순한 작업은 Haiku로, 복잡한 작업은 Opus로 보낼 수 있습니다.
   ```bash
   # 단순한 포매팅 수정
   claude -p --model haiku "Fix the import ordering in src/utils.ts"

   # 복잡한 아키텍처 변경
   claude -p --model opus "Refactor the auth module to use the strategy pattern"
   ```

---

## 안티 패턴

### 흔한 실수

1. **종료 조건이 없는 무한 루프** — 항상 max-runs, max-cost, max-duration, 또는 완료 신호를 두세요.

2. **반복 간 맥락 다리가 없음** — 각 `claude -p` 호출은 새로 시작합니다. `SHARED_TASK_NOTES.md`나 파일 시스템 상태를 사용해 맥락을 잇으세요.

3. **같은 실패를 재시도함** — 반복이 실패하면 그냥 재시도하지 마세요. 오류 맥락을 캡처하여 다음 시도에 전달하세요.

4. **정리 단계 대신 부정형 지시** — "X를 하지 마"라고 말하지 마세요. X를 제거하는 별도의 단계를 추가하세요.

5. **모든 에이전트가 하나의 컨텍스트 창에 있음** — 복잡한 워크플로에서는 관심사를 서로 다른 에이전트 프로세스로 분리하세요. 리뷰어는 작성자여서는 안 됩니다.

6. **병렬 작업에서 파일 겹침을 무시함** — 두 병렬 에이전트가 같은 파일을 수정할 수 있다면, 병합 전략(순차 착지, 리베이스, 또는 충돌 해결)이 필요합니다.

---

## 참고 자료

| 프로젝트 | 작성자 | 링크 |
|---------|--------|------|
| Ralphinho | enitrat | credit: @enitrat |
| Infinite Agentic Loop | disler | credit: @disler |
| Continuous Claude | AnandChowdhary | credit: @AnandChowdhary |
| NanoClaw | ECC | 이 repo의 `/claw` 명령 |
| Verification Loop | ECC | 이 repo의 `skills/verification-loop/` |
