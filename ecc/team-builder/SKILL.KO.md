---
name: team-builder
description: 대화형 선택기로, `claude agents` 명령과 agents/ 마크다운 glob으로 사용 가능한 에이전트 페르소나를 찾아 도메인별로 묶고, 사용자가 최대 5명까지 선택하면 같은 작업에 병렬로 배정한 뒤 합의점과 충돌 지점을 하나의 통합 리포트로 정리합니다. 에이전트 팀을 구성하거나, 사용 가능한 에이전트 페르소나를 둘러보거나, 여러 전문 에이전트를 병렬로 실행할 때 사용합니다.
metadata:
  origin: community
---

# Team Builder

에이전트 팀을 필요할 때 둘러보고 구성하는 대화형 메뉴입니다. 평평한(flat) 구조와 도메인 하위 디렉터리 구조의 에이전트 모음을 모두 지원합니다.

## 사용 시점

- 여러 에이전트 페르소나(마크다운 파일)가 있고, 작업에 쓸 에이전트를 골라야 할 때
- 서로 다른 도메인(예: Security + SEO + Architecture)에서 임시 팀을 구성하고 싶을 때
- 결정하기 전에 어떤 에이전트가 있는지 먼저 둘러보고 싶을 때

## 사전 요구 사항

에이전트 파일은 페르소나 프롬프트(정체성, 규칙, 워크플로, 산출물)를 담은 마크다운 파일이어야 합니다. 첫 번째 `# 제목`은 에이전트 이름으로, 첫 번째 단락은 설명으로 사용합니다.

평평한 구조와 하위 디렉터리 구조를 모두 지원합니다.

**하위 디렉터리 구조** — 도메인은 폴더 이름에서 추론합니다.

```
agents/
├── engineering/
│   ├── security-engineer.md
│   └── software-architect.md
├── marketing/
│   └── seo-specialist.md
└── sales/
    └── discovery-coach.md
```

**평평한 구조** — 도메인은 공유 파일명 접두사에서 추론합니다. 접두사를 2개 이상의 파일이 공유하면 도메인으로 인정합니다. 고유한 접두사를 가진 파일은 "General"로 분류합니다. 알고리즘은 첫 번째 `-`에서 나눈다는 점에 유의하세요. 따라서 여러 단어로 된 도메인(예: `product-management`)은 하위 디렉터리 구조를 써야 합니다.

```
agents/
├── engineering-security-engineer.md
├── engineering-software-architect.md
├── marketing-seo-specialist.md
├── marketing-content-strategist.md
├── sales-discovery-coach.md
└── sales-outbound-strategist.md
```

## 설정

에이전트는 두 가지 방법으로 찾으며, 결과는 에이전트 이름 기준으로 병합하고 중복을 제거합니다.

1. **`claude agents` 명령** (기본) — `claude agents`를 실행하면 CLI가 알고 있는 모든 에이전트를 가져옵니다. 사용자 에이전트, 플러그인 에이전트(예: `ecc:architect`), 기본 제공 에이전트가 포함됩니다. 이 방식은 경로 설정 없이 ECC 마켓플레이스 설치본도 자동으로 포함합니다.
2. **파일 glob** (대체 수단, 에이전트 내용을 읽기 위해) — 다음 위치의 에이전트 마크다운 파일을 읽습니다.
   - `./agents/**/*.md` + `./agents/*.md` — 프로젝트 로컬 에이전트
   - `~/.claude/agents/**/*.md` + `~/.claude/agents/*.md` — 전역 사용자 에이전트

이름이 겹치면 앞선 출처가 우선합니다. 사용자 에이전트 > 플러그인 에이전트 > 기본 제공 에이전트 순입니다. 사용자가 다른 경로를 지정하면 그 경로를 사용할 수 있습니다.

## 동작 방식

### 1단계: 사용 가능한 에이전트 찾기

`claude agents`를 실행해 전체 에이전트 목록을 얻습니다. 각 줄을 다음과 같이 파싱합니다.
- **플러그인 에이전트**는 `plugin-name:` 접두사가 붙어 있습니다(예: `ecc:security-reviewer`). `:` 뒤의 부분을 에이전트 이름으로, 플러그인 이름을 도메인으로 사용합니다.
- **사용자 에이전트**는 접두사가 없습니다. `~/.claude/agents/` 또는 `./agents/`에서 해당 마크다운 파일을 읽어 이름과 설명을 추출합니다.
- **기본 제공 에이전트**(예: `Explore`, `Plan`)는 사용자가 명시적으로 포함을 요청하지 않으면 건너뜁니다.

마크다운 파일에서 불러온 사용자 에이전트는 다음과 같이 처리합니다.
- **하위 디렉터리 구조:** 상위 폴더 이름에서 도메인을 추출합니다.
- **평평한 구조:** 모든 파일명 접두사(첫 번째 `-` 앞의 텍스트)를 모읍니다. 접두사가 2개 이상의 파일명에 나타날 때만 도메인으로 인정합니다(예: `engineering-security-engineer.md`와 `engineering-software-architect.md`가 모두 `engineering`으로 시작 → Engineering 도메인). 접두사가 고유한 파일(예: `code-reviewer.md`, `tdd-guide.md`)은 "General"로 묶습니다.
- 에이전트 이름은 첫 번째 `# 제목`에서 추출합니다. 제목이 없으면 파일명에서 이름을 만듭니다. `.md`를 제거하고, 하이픈을 공백으로 바꾸고, 각 단어의 첫 글자를 대문자로 씁니다.
- 제목 뒤 첫 단락에서 한 줄 요약을 추출합니다.

`claude agents`를 실행하고 파일 위치를 확인했는데도 에이전트가 없으면 사용자에게 "No agents found. Run `claude agents` to verify your setup."라고 알리고 중단합니다.

### 2단계: 도메인 메뉴 보여주기

```
Available agent domains:
1. Engineering — Software Architect, Security Engineer
2. Marketing — SEO Specialist
3. Sales — Discovery Coach, Outbound Strategist

Pick domains or name specific agents (e.g., "1,3" or "security + seo"):
```

- 에이전트가 0명인 도메인(빈 디렉터리)은 건너뜁니다.
- 도메인별 에이전트 수를 표시합니다.

### 3단계: 선택 처리

유연한 입력을 받아들입니다.
- 숫자: "1,3"은 Engineering과 Sales의 모든 에이전트를 선택합니다.
- 이름: "security + seo"는 발견한 에이전트와 느슨하게 매칭합니다.
- "all from engineering"은 해당 도메인의 모든 에이전트를 선택합니다.

5명을 초과해 선택하면 알파벳 순으로 나열하고 사용자에게 좁히도록 요청합니다. "You selected N agents (max 5). Pick which to keep, or say 'first 5' to use the first five alphabetically."

선택을 확인합니다.
```
Selected: Security Engineer + SEO Specialist
What should they work on? (describe the task):
```

### 4단계: 에이전트 병렬 실행

1. 선택된 각 에이전트의 마크다운 파일을 읽습니다.
2. 작업 설명이 아직 없으면 요청합니다.
3. Agent 도구로 모든 에이전트를 병렬 실행합니다.
   - `subagent_type: "general-purpose"`
   - `prompt: "{agent file content}\n\nTask: {task description}"`
   - 각 에이전트는 독립적으로 실행되며, 에이전트 간 통신은 필요하지 않습니다.
4. 에이전트가 실패하면(오류, 시간 초과, 빈 출력) 해당 실패를 인라인으로 적고(예: "Security Engineer: failed — [reason]") 성공한 에이전트의 결과로 계속 진행합니다.

### 5단계: 결과 종합

모든 출력을 모아 통합 리포트로 제시합니다.
- 결과는 에이전트별로 묶습니다.
- 종합(Synthesis) 섹션에서 다음을 강조합니다.
  - 에이전트 간 합의 사항
  - 권고 사항 사이의 충돌이나 긴장 관계
  - 권장 다음 단계

1개 에이전트만 선택했다면 종합 단계를 건너뛰고 출력을 바로 보여줍니다.

## 규칙

- **동적 탐색만 사용합니다.** 에이전트 목록을 하드코딩하지 않습니다. 디렉터리에 새 파일이 생기면 메뉴에 자동으로 나타나야 합니다.
- **팀당 최대 5명 에이전트.** 5명을 넘으면 효과가 체감하기 어려워지고 토큰 사용량이 과도해집니다. 선택 시점에 강제합니다.
- **병렬 디스패치.** 모든 에이전트는 동시에 실행합니다. Agent 도구의 병렬 호출 패턴을 사용합니다.
- **TeamCreate가 아니라 병렬 Agent 호출을 사용합니다.** 이 스킬은 독립적인 작업에 병렬 Agent 도구 호출을 씁니다. TeamCreate(멀티 에이전트 대화를 위한 Claude Code 도구)는 에이전트들이 서로 토론하거나 응답해야 할 때만 필요합니다.

## 예시

```
User: team builder

Claude:
Available agent domains:
1. Engineering (2) — Software Architect, Security Engineer
2. Marketing (1) — SEO Specialist
3. Sales (4) — Discovery Coach, Outbound Strategist, Proposal Strategist, Sales Engineer
4. Support (1) — Executive Summary

Pick domains or name specific agents:

User: security + seo

Claude:
Selected: Security Engineer + SEO Specialist
What should they work on?

User: Review my Next.js e-commerce site before launch

[Both agents spawn in parallel, each applying their specialty to the codebase]

Claude:
## Security Engineer Findings
- [findings...]

## SEO Specialist Findings
- [findings...]

## Synthesis
Both agents agree on: [...]
Tension: Security recommends CSP that blocks inline styles, SEO needs inline schema markup. Resolution: [...]
Next steps: [...]
```
