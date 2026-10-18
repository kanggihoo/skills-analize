---
name: autonomous-agent-harness
description: 영구 메모리, 예약 작업, 컴퓨터 사용, 작업 큐잉을 갖춘 완전 자율 에이전트 시스템으로 Claude Code를 변환합니다. Claude Code의 네이티브 cron, dispatch, MCP 도구, 메모리를 활용하여 독립형 에이전트 프레임워크(Hermes, AutoGPT)를 대체합니다. 사용자가 지속적인 자율 운영, 예약 작업, 또는 스스로 방향을 정하는 에이전트 루프를 원할 때 사용하세요.
metadata:
  origin: ECC
---

# 자율 에이전트 하네스

Claude Code의 세션 도구와 별도로 설정된 예약, 메모리, 컴퓨터 사용 통합을 결합합니다. 이것은 설정 패턴이지, 번들로 제공되는 항상 실행 중인 런타임이 아닙니다.

## 동의와 안전 경계

자율 운영은 사용자가 명시적으로 요청하고 범위를 정해야 합니다. 현재 설정에서 사용자가 해당 기능과 대상 작업공간을 승인하지 않았다면, 예약을 만들거나, 원격 에이전트를 dispatch하거나, 영구 메모리를 쓰거나, 컴퓨터 제어를 사용하거나, 외부에 게시하거나, 제3자 리소스를 수정하거나, 개인 통신에 따라 행동하지 마세요.

반복 실행 또는 이벤트 기반 동작을 활성화하기 전에는 dry-run 계획과 로컬 큐 파일을 우선하세요. 자격 증명, 비공개 작업공간 내보내기, 개인 데이터셋, 계정별 자동화는 재사용 가능한 ECC 산출물에 넣지 마세요.

## 사용 시점

- 사용자가 지속적으로 또는 일정에 따라 실행되는 에이전트를 원할 때
- 주기적으로 트리거되는 자동화 워크플로를 설정할 때
- 세션을 넘어 맥락을 기억하는 개인 AI 비서를 만들 때
- 사용자가 "이걸 매일 실행해", "정기적으로 확인해", "계속 모니터링해"라고 말할 때
- Hermes, AutoGPT 또는 비슷한 자율 에이전트 프레임워크의 기능을 재현하고 싶을 때
- 예약 실행과 함께 컴퓨터 사용이 필요할 때

## 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│                    Claude Code Runtime                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Crons   │  │ Dispatch │  │ Memory   │  │ Computer    │ │
│  │ Schedule │  │ Remote   │  │ Store    │  │ Use         │ │
│  │ Tasks    │  │ Agents   │  │          │  │             │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              ECC Skill + Agent Layer                  │    │
│  │                                                      │    │
│  │  skills/     agents/     commands/     hooks/        │    │
│  └──────────────────────────────────────────────────────┘    │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              MCP Server Layer                        │    │
│  │                                                      │    │
│  │  memory    github    exa    supabase    browser-use  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## 핵심 구성 요소

### 1. 영구 메모리

구조화된 데이터를 위해 MCP 메모리 서버로 강화된 Claude Code의 내장 메모리 시스템을 사용합니다.

**내장 메모리** (`~/.claude/projects/*/memory/`):
- 사용자 선호, 피드백, 프로젝트 맥락
- frontmatter가 있는 마크다운 파일로 저장
- 세션 시작 시 자동으로 로드됨

**MCP 메모리 서버** (구조화된 지식 그래프):
- 엔티티, 관계, 관찰(observation)
- 쿼리 가능한 그래프 구조
- 세션 간 영속성

**메모리 패턴:**

```
# 단기: 현재 세션 맥락
세션 내 작업 추적에는 TodoWrite 사용

# 중기: 프로젝트 메모리 파일
세션 간 회상을 위해 ~/.claude/projects/*/memory/에 작성

# 장기: MCP 지식 그래프
영구적인 구조화 데이터에는 mcp__memory__create_entities 사용
관계 매핑에는 mcp__memory__create_relations 사용
알려진 엔티티에 대한 새 사실 추가에는 mcp__memory__add_observations 사용
```

### 2. 예약 작업 (Crons)

대화형 세션 안에서 반복 프롬프트를 실행하려면 Claude Code의 네이티브 [예약 작업](https://code.claude.com/docs/en/scheduled-tasks)을 사용합니다. 이 작업들은 세션에 한정됩니다. 열린 세션과 무관하게 독립적으로 실행되어야 하는 작업에는 외부 스케줄러가 필요합니다. `/loop`에는 예약용 MCP 서버가 필요하지 않습니다.

**cron 설정:**

```
# 대화형 Claude Code 세션에서
/loop 30m Review open PRs in this repository and summarize CI failures.
```

셸에서 한 번만 실행하려면 CLI를 호출하기 전에 작업 디렉터리를 설정하세요.

```bash
cd "/path/to/repo" && claude -p "Review open PRs and summarize"
```

대화형 세션이 실행 중이 아닐 때 이 명령을 반복 호출하려면 OS 스케줄러나 CI 스케줄을 사용하세요. 실행기(runner)의 인증과 도구 권한은 별도로 설정하세요.

**유용한 cron 패턴:**

| 패턴 | 스케줄 | 사용 사례 |
|---------|----------|----------|
| 데일리 스탠드업 | `0 9 * * 1-5` | PR, 이슈, 배포 상태 검토 |
| 주간 리뷰 | `0 10 * * 1` | 코드 품질 지표, 테스트 커버리지 |
| 시간별 모니터 | `0 * * * *` | 운영 상태, 에러율 확인 |
| 야간 빌드 | `0 2 * * *` | 전체 테스트 스위트 실행, 보안 스캔 |
| 회의 전 | `*/30 * * * *` | 다가오는 회의 맥락 준비 |

### 3. Dispatch / 원격 에이전트

인증된 CI 작업이나 webhook 수신기가 자신이 소유한 작업공간에서 Claude Code를 호출하도록 합니다. 지원되는 진입점은 Anthropic의 공개 dispatch 엔드포인트가 아니라 [프로그래매틱 CLI 모드](https://code.claude.com/docs/en/headless)입니다.

**Dispatch 패턴:**

```bash
# CI 작업공간 안에서 실행
cd "/path/to/repo" && claude -p "Build failed on main. Diagnose the failure."

# webhook에서 트리거
# GitHub webhook -> 인증된 CI 실행기 -> claude -p -> 검토 가능한 결과

# 다른 에이전트에서 트리거
claude -p "Analyze the output of the security scan and create issues for findings"
```

### 4. 컴퓨터 사용

컴퓨터 제어에는 별도로 설정된 통합이 필요합니다. Anthropic의 [computer-use 도구와 참조 환경](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)은 격리된 데스크톱 환경에서 도구 호출을 실행할 애플리케이션을 요구합니다. MCP 패키지 이름을 추가한다고 해서 그 환경이 제공되지는 않습니다.

**기능:**
- 브라우저 자동화 (이동, 클릭, 폼 작성, 스크린샷)
- 데스크톱 제어 (앱 열기, 타이핑, 마우스 제어)
- CLI를 넘어서는 파일 시스템 작업

**하네스 내 사용 사례:**
- 웹 UI 자동 테스트
- 폼 작성과 데이터 입력
- 스크린샷 기반 모니터링
- 다중 앱 워크플로

### 5. 작업 큐

세션 경계를 넘어 살아남는 영속적인 작업 큐를 관리합니다.

**구현:**

```
# 메모리를 통한 작업 영속화
~/.claude/projects/*/memory/task-queue.md에 작업 큐 작성

# 작업 형식
---
name: task-queue
type: project
description: Persistent task queue for autonomous operation
---

## Active Tasks
- [ ] PR #123: CI가 초록이면 검토 후 승인
- [ ] Monitor deploy: 2시간 동안 30분마다 /health 확인
- [ ] Research: AI 도구 분야에서 리드 5개 찾기

## Completed
- [x] Daily standup: PR 3개, 이슈 2개 검토
```

## Hermes 대체하기

| Hermes 구성 요소 | ECC 대응 | 방법 |
|------------------|---------------|-----|
| Gateway/Router | CLI + 외부 스케줄러 | 인증된 실행기가 에이전트 세션을 시작 |
| Memory System | Claude 메모리 + MCP 메모리 서버 | 내장 영속성 + 지식 그래프 |
| Tool Registry | MCP 서버 | 동적으로 로드되는 도구 제공자 |
| Orchestration | ECC 스킬 + 에이전트 | 스킬 정의가 에이전트 동작을 지시 |
| Computer Use | 별도로 설정된 통합 | 격리 환경에서의 브라우저 또는 데스크톱 제어 |
| Context Manager | 세션 관리 + 메모리 | ECC 2.0 세션 수명 주기 |
| Task Queue | 메모리에 영속화된 작업 목록 | TodoWrite + 메모리 파일 |

## 설정 가이드

### 1단계: MCP 서버 설정

메모리 MCP는 선택 사항입니다. [MCP 참조 메모리 서버](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)는 `@modelcontextprotocol/server-memory`로 배포되어 있으며, 버전 `2026.8.31`은 2026-09-07에 공개 npm 레지스트리에서 검증되었습니다. 이것은 참조 구현이지, ECC가 번들로 제공하는 서비스가 아닙니다.

해당 패키지를 검토하고 사용을 승인한 후, 기존 설정을 보존하면서 이 항목을 `~/.claude.json`의 사용자 범위 MCP 설정에 병합하세요. `MEMORY_FILE_PATH`는 사용자가 소유한 비공개 디렉터리의 절대 경로로 바꾸세요. CLI 등록과 Windows `cmd /c npx` 설정은 [Claude Code MCP 설정](https://code.claude.com/docs/en/mcp)을 참조하세요.

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory@2026.8.31"],
      "env": {
        "MEMORY_FILE_PATH": "/absolute/path/to/private/memory.jsonl"
      }
    }
  }
}
```

추측했거나 게시되지 않은 npm 패키지를 등록하지 마세요. `npx -y`는 나중에 그 이름으로 게시되는 무엇이든 실행하게 됩니다. 다른 서버를 추가하기 전에 정확한 패키지, 게시자, 버전을 검증하세요. 예약과 컴퓨터 사용에는 이전에 여기에 나열되었던 게시되지 않은 세 패키지 이름이 필요하지 않습니다.

### 2단계: 기본 cron 만들기

대화형 세션 중 폴링하려면 다음을 입력하세요.

```text
/loop 30m Review open PRs in this repository and summarize CI failures.
```

닫힌 세션 이후에도 살아남아야 하는 일일 또는 주간 작업에는, OS cron 작업이나 GitHub Actions 같은 외부 스케줄러를 설정하여 핵심 구성 요소의 2단계에 있는 일회성 명령을 실행하세요. 스케줄을 요청하기 위해 `claude -p`를 호출한다고 해서 항상 실행되는 스케줄러가 준비되지는 않습니다. 활성화하기 전에 스케줄, 작업공간, 허용된 동작을 명시적으로 선택하세요.

### 3단계: 메모리 그래프 초기화

```bash
# 정체성과 맥락 부트스트랩
claude -p "Create memory entities for: me (user profile), my projects, my key contacts. Add observations about current priorities."
```

### 4단계: 컴퓨터 사용 활성화 (선택 사항)

위에 링크된 computer-use 참조 환경, 또는 검토한 특정 브라우저 통합의 문서를 따르세요. 필요한 권한만 부여하고, 예약 워크플로에 추가하기 전에 격리 환경에서 무해한 동작 하나를 검증하세요.

## 예시 워크플로

### 자율 PR 리뷰어
```
Cron: 근무 시간 동안 30분마다
1. 감시 중인 repo에서 새 PR 확인
2. 각 새 PR에 대해:
   - 브랜치를 로컬로 가져오기
   - 테스트 실행
   - code-reviewer 에이전트로 변경 검토
   - GitHub MCP로 리뷰 코멘트 게시
3. 리뷰 상태를 메모리에 갱신
```

### 개인 리서치 에이전트
```
Cron: 매일 오전 6시
1. 메모리에 저장된 검색 쿼리 확인
2. 각 쿼리에 대해 Exa 검색 실행
3. 새로운 발견 사항 요약
4. 어제 결과와 비교
5. 다이제스트를 메모리에 작성
6. 아침 검토를 위해 우선순위가 높은 항목 표시
```

### 회의 준비 에이전트
```
트리거: 각 캘린더 일정 30분 전
1. 일정 세부 정보 읽기
2. 참석자 맥락을 메모리에서 검색
3. 참석자와 관련된 최근 이메일/Slack 스레드 가져오기
4. 논의 포인트와 안건 제안 준비
5. 준비 문서를 메모리에 작성
```

## 제약

- 네이티브 예약 프롬프트는 대화형 세션을 공유합니다. 외부 스케줄러 호출은 명시적으로 재개하지 않는 한 별도 세션으로 시작됩니다.
- 컴퓨터 사용에는 명시적인 권한 부여가 필요합니다. 접근 권한을 가정하지 마세요.
- CLI 자동화도 모델 사용량을 소비하며 설정된 제공자의 한도를 따릅니다. 적절한 스케줄러 간격을 선택하세요.
- 메모리 파일은 간결하게 유지하세요. 무한히 커지도록 두지 말고 오래된 데이터는 보관하세요.
- 예약 작업이 성공적으로 완료되었는지 항상 확인하세요. cron 프롬프트에 에러 처리를 추가하세요.
