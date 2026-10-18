---
name: context-budget
description: 에이전트, 스킬, MCP 서버, 규칙 전반에 걸친 Claude Code 컨텍스트 윈도우 사용량을 감사합니다. 군더더기, 중복 구성 요소를 찾아내고, 우선순위가 매겨진 토큰 절약 권장 사항을 만듭니다. 컨텍스트 윈도우가 너무 빨리 차고 있고, 그것을 소비하는 에이전트, 스킬, MCP 서버, 규칙을 찾아내야 할 때 사용합니다.
metadata:
  origin: ECC
---

# 컨텍스트 예산

Claude Code 세션에서 로드된 모든 구성 요소의 토큰 오버헤드를 분석하고, 컨텍스트 공간을 되찾기 위한 실행 가능한 최적화 항목을 제시합니다.

## 사용 시점

- 세션 성능이 느리게 느껴지거나 출력 품질이 떨어질 때
- 최근에 스킬, 에이전트, MCP 서버를 많이 추가했을 때
- 실제로 컨텍스트 여유 공간이 얼마나 남아 있는지 알고 싶을 때
- 구성 요소를 더 추가하려는데 여유가 있는지 알아야 할 때
- `/context-budget` 명령을 실행할 때(이 스킬이 명령을 뒷받침합니다)

## 작동 방식

### 1단계: 목록 작성

모든 구성 요소 디렉터리를 스캔하고 토큰 소비량을 추정합니다.

**에이전트** (`agents/*.md`)
- 파일별 줄 수와 토큰 수를 셉니다(단어 수 × 1.3).
- frontmatter의 `description` 길이를 추출합니다.
- 표시 대상: 200줄 초과 파일(무거움), description 30단어 초과(부풀어 있는 frontmatter)

**스킬** (`skills/*/SKILL.md`)
- SKILL.md별 토큰 수를 셉니다.
- 표시 대상: 400줄 초과 파일
- `.agents/skills/`에 중복 사본이 있는지 확인하고, 동일한 사본은 이중 계산을 피하기 위해 건너뜁니다.

**규칙** (`rules/**/*.md`)
- 파일별 토큰 수를 셉니다.
- 표시 대상: 100줄 초과 파일
- 같은 언어 모듈 안의 규칙 파일들 사이에 내용이 겹치는지 감지합니다.

**MCP 서버** (`.mcp.json` 또는 활성 MCP 구성)
- 구성된 서버 수와 전체 도구 수를 셉니다.
- 도구당 약 500토큰으로 스키마 오버헤드를 추정합니다.
- 표시 대상: 도구가 20개를 넘는 서버, `gh`, `git`, `npm`, `supabase`, `vercel` 같은 단순 CLI 명령을 감싸는 서버

**지속된 기록 바이트** (선택 사항)

로컬 파일 진단을 위해서는 안정적이고 일반 형식인 JSONL 파일 또는 검사하려는 스냅샷을 명시적으로 선택하십시오. 아래 예시 경로는 바꿔서 사용하십시오. 이 방법은 세션을 찾거나 다시 연결하지 않습니다.
이 스니펫은 집계된 바이트 수만 출력합니다. 한 번에 한 줄씩 읽으므로 메모리 사용량은 가장 큰 레코드에 따라 달라집니다. 아주 큰 레코드나 계속 커지고 있는 파일은 피하십시오.

```sh
python3 - "/path/to/selected-session.jsonl" <<'EOF'
import json
import sys

total = attachment = other = unclassified = 0
try:
    with open(sys.argv[1], "rb") as source:
        for raw in source:
            size = len(raw)
            total += size
            try:
                record = json.loads(raw.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                unclassified += size
                continue
            record_type = record.get("type") if isinstance(record, dict) else None
            if not isinstance(record_type, str):
                unclassified += size
            elif record_type == "attachment":
                attachment += size
            else:
                other += size
except OSError:
    print("Cannot read selected JSONL file.", file=sys.stderr)
    raise SystemExit(1)

pct = attachment * 100.0 / total if total else 0.0
print(f"persisted {total}B | attachment records {attachment}B ({pct:.1f}%) | "
      f"other records {other}B | unclassified {unclassified}B")
EOF
```

세 범주의 합은 줄바꿈과 빈 줄을 포함한 원본 파일 바이트와 같습니다.
`attachment`는 정확한 레코드 타입 필터일 뿐이며, 하네스의 현재 내부 스키마를 보장하지 않습니다. 다른 레코드는 문자열 `type`이 다릅니다. 잘못된 JSON, 잘못된 UTF-8, 객체가 아닌 값, 없거나 문자열이 아닌 type, 빈 줄은 분류되지 않은 것으로 간주합니다. 두 범주 모두 "대화"를 뜻하지 않으며, 백분율은 지속된 바이트 중의 비중일 뿐입니다.

이 수치는 활성 컨텍스트, 남은 여유, 토큰 사용량, 과금, 또는 재연결 시 로드되는 내용을 확정하지 않습니다. 하네스가 보고하는 현재 컨텍스트와 사용량을 보려면 해당 버전에 맞는 [`/context` 및 `/usage` 명령(`/cost`는 별칭)](https://code.claude.com/docs/en/commands)을 사용하십시오.

**CLAUDE.md** (프로젝트 + 사용자 수준)
- CLAUDE.md 체인에 있는 파일별 토큰 수를 셉니다.
- 표시 대상: 합계가 300줄을 넘을 때

### 2단계: 분류

모든 구성 요소를 버킷에 넣으십시오.

| 버킷 | 기준 | 조치 |
|------|------|------|
| **항상 필요** | CLAUDE.md에서 참조되거나, 활성 명령을 뒷받침하거나, 현재 프로젝트 유형과 일치함 | 유지 |
| **가끔 필요** | 도메인 특화(예: 언어 패턴), CLAUDE.md에서 참조되지 않음 | 필요할 때 활성화하는 방안 검토 |
| **거의 필요 없음** | 명령 참조가 없거나, 내용이 중복되거나, 명확한 프로젝트 일치가 없음 | 제거하거나 지연 로드 |

### 3단계: 문제 감지

다음 문제 패턴을 찾아내십시오.

- **부풀어 있는 에이전트 description**: frontmatter의 description이 30단어를 넘으면 모든 Task 도구 호출에 로드됩니다.
- **무거운 에이전트**: 200줄을 넘는 파일은 생성될 때마다 Task 도구 컨텍스트를 부풀립니다.
- **중복 구성 요소**: 에이전트 로직과 중복되는 스킬, CLAUDE.md와 중복되는 규칙
- **MCP 과다 구독**: 서버가 10개를 넘거나, 무료로 쓸 수 있는 CLI 도구를 감싸는 서버
- **CLAUDE.md 군더더기**: 장황한 설명, 오래된 섹션, 규칙으로 옮겨야 할 지시문

### 4단계: 보고

컨텍스트 예산 보고서를 작성하십시오.

```
Context Budget Report
═══════════════════════════════════════

Total estimated overhead: ~XX,XXX tokens
Context model: Claude Sonnet (200K window)
Effective available context: ~XXX,XXX tokens (XX%)

Component Breakdown:
┌─────────────────┬────────┬───────────┐
│ Component       │ Count  │ Tokens    │
├─────────────────┼────────┼───────────┤
│ Agents          │ N      │ ~X,XXX    │
│ Skills          │ N      │ ~X,XXX    │
│ Rules           │ N      │ ~X,XXX    │
│ MCP tools       │ N      │ ~XX,XXX   │
│ CLAUDE.md       │ N      │ ~X,XXX    │
└─────────────────┴────────┴───────────┘

WARNING: Issues Found (N):
[ranked by token savings]

Top 3 Optimizations:
1. [action] → save ~X,XXX tokens
2. [action] → save ~X,XXX tokens
3. [action] → save ~X,XXX tokens

Potential savings: ~XX,XXX tokens (XX% of current overhead)
```

verbose 모드에서는 파일별 토큰 수, 가장 무거운 파일의 줄 단위 분석, 겹치는 구성 요소 사이의 구체적인 중복 줄, 도구별 스키마 크기 추정이 포함된 MCP 도구 목록을 추가로 출력합니다.

## 예시

**기본 감사**
```
User: /context-budget
Skill: Scans setup → 16 agents (12,400 tokens), 28 skills (6,200), 87 MCP tools (43,500), 2 CLAUDE.md (1,200)
       Flags: 3 heavy agents, 14 MCP servers (3 CLI-replaceable)
       Top saving: remove 3 MCP servers → -27,500 tokens (47% overhead reduction)
```

**verbose 모드**
```
User: /context-budget --verbose
Skill: Full report + per-file breakdown showing planner.md (213 lines, 1,840 tokens),
       MCP tool list with per-tool sizes, duplicated rule lines side by side
```

**확장 전 점검**
```
User: I want to add 5 more MCP servers, do I have room?
Skill: Current overhead 33% → adding 5 servers (~50 tools) would add ~25,000 tokens → pushes to 45% overhead
       Recommendation: remove 2 CLI-replaceable servers first to stay under 40%
```

## 모범 사례

- **토큰 추정**: 산문에는 `단어 × 1.3`, 코드가 많은 파일에는 `글자 수 / 4`를 사용하십시오.
- **MCP가 가장 큰 변수입니다**: 도구 스키마 하나당 약 500토큰이며, 도구 30개짜리 서버 하나가 모든 스킬을 합친 것보다 더 많이 듭니다.
- **에이전트 description은 항상 로드됩니다**: 에이전트가 한 번도 호출되지 않더라도 description 필드는 모든 Task 도구 컨텍스트에 존재합니다.
- **디버깅용 verbose 모드**: 오버헤드를 일으키는 정확한 파일을 찾아야 할 때 사용하며, 일상적인 감사에는 쓰지 마십시오.
- **변경 후 감사**: 에이전트, 스킬, MCP 서버를 추가할 때마다 실행해 부풀어 오르는 현상을 일찍 잡으십시오.
