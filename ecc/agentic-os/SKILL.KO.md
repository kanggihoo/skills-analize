---
name: agentic-os
description: Claude Code 위에 지속적인 다중 에이전트 운영체제를 구축합니다. 커널 아키텍처, 전문 에이전트, 슬래시 명령, 파일 기반 메모리, 예약 자동화, 외부 데이터베이스 없는 상태 관리를 다룹니다. 자체 메모리, 명령, 스케줄링을 갖춘 지속적인 다중 에이전트 시스템을 Claude Code 위에 구축할 때 사용하세요.
metadata:
  origin: ECC
---

# Agentic OS

Claude Code를 채팅 세션이 아니라 지속적인 런타임/운영체제로 다루세요. 이 스킬은 프로덕션 에이전틱 설정에서 쓰이는 아키텍처를 정리한 것입니다. 작업을 전문 에이전트로 라우팅하는 커널 설정, 지속적인 파일 기반 메모리, 예약 자동화, 그리고 JSON/마크다운 데이터 계층으로 구성됩니다.

## 활성화 시점

- Claude Code 안에서 다중 에이전트 워크플로를 구축할 때
- 세션 재시작 후에도 살아남는 지속적인 Claude Code 자동화를 설정할 때
- 반복 작업을 위한 "개인 OS" 또는 "agentic OS"를 만들 때
- 사용자가 "agentic OS", "personal OS", "multi-agent", "agent coordinator", "persistent agent"라고 말할 때
- 세션을 넘어 맥락이 살아남아야 하는 장기 프로젝트를 구조화할 때

## 아키텍처 개요

Agentic OS는 네 개의 계층으로 이루어집니다. 각 계층은 프로젝트 루트의 디렉터리입니다.

```
project-root/
├── CLAUDE.md          # 커널: 정체성, 라우팅 규칙, 에이전트 레지스트리
├── agents/            # 전문 에이전트 정의 (마크다운 프롬프트)
├── .claude/commands/  # 슬래시 명령: 사용자 대면 CLI
├── scripts/           # 데몬 스크립트: 예약 또는 이벤트 기반 작업
└── data/              # 상태: JSON/마크다운 파일 시스템, 외부 DB 없음
```

### 계층별 역할

| 계층 | 목적 | 영속성 |
|---|---|---|
| 커널 (`CLAUDE.md`) | 정체성, 라우팅, 모델 정책, 에이전트 레지스트리 | Git으로 추적 |
| 에이전트 (`agents/`) | 범위가 정해진 도구와 메모리를 가진 전문 정체성 | Git으로 추적 |
| 명령 (`.claude/commands/`) | 사용자 대면 슬래시 명령 (`/daily-sync`, `/outreach`) | Git으로 추적 |
| 스크립트 (`scripts/`) | cron이나 웹훅으로 트리거되는 Python/JS 데몬 | Git으로 추적 |
| 상태 (`data/`) | 추가 전용 로그, 프로젝트 상태, 결정 기록 | Git 무시 또는 추적 |

## 커널

`CLAUDE.md`가 커널입니다. COO/오케스트레이터 역할을 합니다. Claude는 세션 시작 시 이것을 읽고 작업을 라우팅하는 데 사용합니다.

### 커널 구조

```markdown
# CLAUDE.md - Agentic OS Kernel

## Identity
당신은 [project-name]의 COO입니다. 작업을 전문 에이전트에게 라우팅합니다.
당신은 직접 코드를 작성하지 않습니다. 적절한 에이전트에게 위임하고 결과를 종합합니다.

## Agent Registry

| Agent | Role | Trigger |
|---|---|---|
| @dev | 코드, 아키텍처, 디버깅 | 사용자가 "build", "fix", "refactor"라고 말함 |
| @writer | 문서, 콘텐츠, 이메일 | 사용자가 "write", "draft", "blog"라고 말함 |
| @researcher | 조사, 분석, 사실 확인 | 사용자가 "research", "analyze", "compare"라고 말함 |
| @ops | DevOps, 배포, 인프라 | 사용자가 "deploy", "CI", "server"라고 말함 |

## Routing Rules
1. 사용자 요청에서 의도 키워드를 파싱합니다
2. Agent Registry의 Trigger 열과 맞춥니다
3. `agents/<name>.md`에서 해당 에이전트 파일을 불러옵니다
4. 전체 맥락과 함께 실행을 넘깁니다
5. 결과를 종합하여 사용자에게 제시합니다

## Model Policies
- 기본 모델: 저장소 또는 하네스의 기본값을 사용합니다.
- @dev 작업: 복잡한 아키텍처에는 추론 능력이 높은 모델을 우선합니다.
- @researcher 작업: 구성된 조사 가능 모델과 승인된 검색 도구를 사용합니다.
- 비용 상한: 프로젝트에 설정된 지출 임계값을 넘기 전에 경고합니다.
```

### 핵심 원칙

커널은 **작고 선언적**이어야 합니다. 라우팅 로직은 코드가 아니라 평범한 마크다운 표에 둡니다. 이렇게 하면 디버깅 없이도 시스템을 점검하고 편집할 수 있습니다.

## 전문 에이전트

각 에이전트는 `agents/`에 있는 독립된 마크다운 파일입니다. Claude는 작업을 라우팅할 때 관련 에이전트 파일을 불러옵니다.

### 에이전트 정의 형식

```markdown
# @dev - Software Engineer

## Identity
당신은 숙련된 소프트웨어 엔지니어입니다. 깔끔하고 테스트된, 프로덕션 수준의 코드를 작성합니다.
단순한 해결책을 선호합니다. 요구사항이 모호하면 명확히 질문합니다.

## Memory Scope
- 맥락을 위해 `data/projects/<current-project>.md`를 읽습니다
- 아키텍처 결정을 위해 `data/decisions/`를 읽습니다
- 실행 로그를 `data/logs/<date>-@dev.md`에 덧붙입니다

## Tool Access
- 프로젝트 루트 안의 전체 파일시스템 접근
- Git 작업 (status, diff, commit, branch)
- 테스트 러너 접근
- `.claude/mcp.json`에 설정된 MCP 서버

## Constraints
- 새 기능에는 항상 테스트를 작성합니다
- `main`에 직접 커밋하지 않습니다. 기능 브랜치를 사용합니다
- 새 파일을 만들기보다 기존 파일을 편집하는 것을 우선합니다
- 가능하면 함수는 50줄 이하로 유지합니다
```

### 다중 에이전트 협업 패턴

작업이 여러 에이전트에 걸치면 커널은 이들을 순차적으로 또는 병렬로 실행합니다:

```
사용자: "랜딩 페이지를 만들고 출시 블로그 글도 써 줘"

커널 라우팅:
1. @dev - "[요구사항]으로 랜딩 페이지를 만들어라"
2. @writer - "랜딩 페이지 문구를 활용해 [제품]의 출시 블로그 글을 써라"
3. 커널이 두 결과를 하나의 응답으로 종합
```

병렬 실행에는 Claude Code의 백그라운드 작업 기능을 사용하거나, 특정 에이전트 맥락으로 Claude Code를 호출하는 셸 스크립트를 사용하세요.

## 명령과 일상 워크플로

슬래시 명령은 `.claude/commands/`에 있는 마크다운 파일입니다. 재사용 가능한 워크플로를 정의합니다.

### 명령 구조

```markdown
# /daily-sync

아침 브리핑을 실행합니다:

1. 맥락을 위해 `data/logs/last-sync.md`를 읽습니다
2. 프로젝트 상태를 확인합니다: `git status`, 대기 중인 PR, CI 상태
3. 새 작업이나 필요한 결정이 있는지 `data/inbox/`를 확인합니다
4. 블로커, 우선순위, 다음 조치를 요약합니다
5. 브리핑을 `data/logs/daily/<date>.md`에 덧붙입니다
```

### 기본 명령 세트

| 명령 | 목적 |
|---|---|
| `/daily-sync` | 아침 브리핑: 상태, 블로커, 우선순위 |
| `/outreach` | 아웃리치 워크플로 실행 (이메일, LinkedIn 등) |
| `/research <topic>` | 인용 추적을 포함한 심층 조사 |
| `/apply-jobs` | 목표 직무에 맞춘 이력서 + 커버 레터 작성 |
| `/analytics` | Stripe, GitHub 또는 커스텀 소스에서 지표 가져오기 |
| `/interview-prep` | 플래시카드 또는 모의 면접 질문 생성 |
| `/decision <topic>` | 장단점과 선택한 경로를 포함해 결정 기록 |

### 명령 활성화

명령 파일을 `.claude/commands/<command-name>.md`에 두세요. Claude Code가 자동으로 찾습니다. 사용자는 `/<command-name>`으로 호출합니다.

## 지속적 메모리

메모리는 파일 기반입니다. 벡터 DB, Redis, PostgreSQL이 없습니다. `data/`의 JSON과 마크다운 파일이 곧 데이터베이스입니다.

### 메모리 디렉터리 구조

```
data/
├── daily-logs/         # 추가 전용 일일 활동 로그
├── projects/           # 프로젝트별 맥락 파일
├── decisions/          # 아키텍처 및 비즈니스 결정 (ADR 형식)
├── inbox/              # 분류를 기다리는 새 작업이나 아이디어
├── contacts/           # 사람, 회사, 관계 메모
└── templates/          # 재사용 가능한 프롬프트와 형식
```

### 일일 로그 형식

```markdown
# 2026-04-22 - 일일 로그

## Sessions
- 09:00 - 세션 1: 인증 모듈 리팩터링 (@dev)
- 11:30 - 세션 2: 투자자 업데이트 초안 작성 (@writer)

## Decisions
- JWT에서 세션 쿠키로 전환 (`data/decisions/2026-04-22-auth.md` 참고)

## Blockers
- 벤더의 API 키 대기 중 (2026-04-24에 후속 확인)

## Next Actions
- [ ] 인증 리팩터링 PR 머지
- [ ] 투자자 업데이트를 검토용으로 발송
```

### 자동 회고 패턴

각 세션이 끝나면 커널이 회고를 덧붙입니다:

```markdown
## Reflection - Session 3
- 잘된 점: 병렬 에이전트 실행으로 20분을 절약함
- 안 된 점: @researcher가 유료 장벽이 있는 출처에 막힘. 더 나은 출처 순위가 필요함
- 바꿀 점: 조사 노트에 `source-tier` 필드 추가 (A/B/C 신뢰도)
```

이것은 코드 변경 없이도 시간이 지나며 시스템을 개선하는 피드백 루프를 만듭니다.

## 예약 자동화

Agentic OS 작업은 Claude Code의 내장 cron(세션이 끝나면 함께 종료됨)이 아니라 외부 cron을 사용해 예약 실행됩니다.

### macOS: LaunchAgent

```xml
<!-- ~/Library/LaunchAgents/com.agentic.daily-sync.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ...>
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.agentic.daily-sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/claude</string>
        <string>--cwd</string>
        <string>/path/to/project</string>
        <string>--command</string>
        <string>/daily-sync</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/agentic-daily-sync.log</string>
</dict>
</plist>
```

### Linux: systemd 타이머

```ini
# ~/.config/systemd/user/agentic-daily-sync.service
[Unit]
Description=Agentic OS Daily Sync

[Service]
Type=oneshot
ExecStart=/usr/local/bin/claude --cwd /path/to/project --command /daily-sync
```

```ini
# ~/.config/systemd/user/agentic-daily-sync.timer
[Unit]
Description=Run daily sync every morning

[Timer]
OnCalendar=*-*-* 8:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### 크로스 플랫폼: pm2

```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'agentic-daily-sync',
    script: 'claude',
    args: '--cwd /path/to/project --command /daily-sync',
    cron_restart: '0 8 * * *',
    autorestart: false
  }]
};
```

## 데이터 계층

데이터 계층은 파일 시스템입니다. 구조화된 데이터에는 JSON을, 서술형 내용에는 마크다운을 사용하세요.

### 구조화된 상태에 JSON 사용

```json
// data/projects/website-v2.json
{
  "name": "Website v2",
  "status": "in-progress",
  "milestone": "beta-launch",
  "agents_involved": ["@dev", "@writer"],
  "files": {
    "spec": "docs/website-v2-spec.md",
    "design": "designs/website-v2.fig"
  },
  "metrics": {
    "commits": 47,
    "last_session": "2026-04-22T11:30:00Z"
  }
}
```

### 서술형에 마크다운 사용

사람이 읽는 모든 것, 즉 결정, 로그, 조사 노트, 연락처 기록에는 마크다운을 사용하세요.

### 스키마 진화

기존 필드의 이름을 바꾸지 마세요. 새 필드를 추가하고 오래된 필드는 deprecated로 표시하세요:

```json
{
  "name": "Website v2",
  "status": "in-progress",
  "milestone": "beta-launch",
  "_deprecated_priority": "high",
  "priority_v2": { "level": "high", "rationale": "Blocks investor demo" }
}
```

이렇게 하면 마이그레이션 스크립트 없이도 과거 데이터를 읽을 수 있습니다.

## 안티패턴

### 단일 에이전트가 모든 것을 맡는 구조

```markdown
# 나쁨 - 한 에이전트가 모든 것을 함
당신은 풀스택 개발자, 작가, 연구원, DevOps 엔지니어입니다.
```

전문 에이전트로 나누세요. 라우팅은 커널이 담당합니다.

### 상태가 없는 세션

```markdown
# 나쁨 - 세션 사이에 메모리가 없음
Claude Code를 열 때마다 매번 처음부터 시작함.
```

세션 시작 시 항상 `data/`를 읽고, 세션 종료 시 다시 기록하세요.

### 하드코딩된 자격 증명

```markdown
# 나쁨 - 에이전트 파일이나 CLAUDE.md에 API 키가 있음
Your OpenAI API key is sk-xxxxxxxx
```

환경 변수를 사용하거나, 스크립트가 불러오는 `.env` 파일을 사용하세요. 에이전트는 `process.env.API_KEY`를 참조합니다.

### 단순한 상태를 위한 외부 데이터베이스

```markdown
# 나쁨 - 1인 사용자의 agentic OS에 PostgreSQL
```

동시 사용자가 여럿이거나 데이터가 GB 단위가 될 때까지는 JSON/마크다운 파일을 사용하세요.

### 과도하게 설계된 라우팅

```markdown
# 나쁨 - 마크다운 표 대신 코드에 라우팅 로직을 둠
if (intent.includes('deploy')) { agent = opsAgent; }
```

라우팅은 `CLAUDE.md`의 마크다운 표에 선언적으로 두세요. 점검하기 쉽고, 편집하기 쉽고, 디버깅하기 쉽습니다.

## 모범 사례

- [ ] `CLAUDE.md`는 200줄 미만이며 컨텍스트 윈도우에 들어맞는다
- [ ] 각 에이전트 파일은 100줄 미만이며 한 영역에만 집중한다
- [ ] `data/`는 민감한 로그에 대해서는 Git 무시, 결정과 명세에 대해서는 Git 추적
- [ ] 명령은 명령형 이름을 사용한다: `/run-daily-sync`가 아니라 `/daily-sync`
- [ ] 로그는 추가 전용이며, 과거 일일 로그는 절대 편집하지 않는다
- [ ] 모든 에이전트에는 읽는 파일을 정의한 `Memory Scope` 섹션이 있다
- [ ] 회고는 모든 세션이 끝날 때 작성한다
- [ ] 예약 작업은 Claude Code의 세션 cron이 아니라 외부 cron(LaunchAgent, systemd, pm2)을 사용한다
- [ ] 비용 추적: 세션별 API 지출을 `data/logs/<date>-costs.json`에 기록한다
- [ ] 프로젝트 하나 = Agentic OS 하나. 관련 없는 프로젝트끼리 하나의 `CLAUDE.md`를 공유하지 않는다
