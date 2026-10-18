---
name: agent-eval
description: 커스텀 작업에서 코딩 에이전트(Claude Code, Aider, Codex 등)를 head-to-head로 비교하여 통과율, 비용, 시간, 일관성 지표를 측정합니다. 코딩 에이전트를 선택할 때, 또는 에이전트 설정 변경에 대해 인상이 아닌 측정된 통과율, 비용, 시간이 필요할 때 사용합니다.
license: MIT
metadata:
  origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Agent Eval 스킬

재현 가능한 작업에서 코딩 에이전트를 head-to-head로 비교하는 가벼운 CLI 도구입니다. "어떤 코딩 에이전트가 최고인가?"라는 비교는 대개 느낌에 의존합니다. 이 도구는 그 비교를 체계화합니다.

## 활성화 시점

- 자신의 코드베이스에서 코딩 에이전트(Claude Code, Aider, Codex 등)를 비교할 때
- 새 도구나 모델을 도입하기 전에 에이전트 성능을 측정할 때
- 에이전트가 모델이나 도구를 업데이트한 뒤 회귀 검사를 할 때
- 팀을 위해 데이터에 기반한 에이전트 선택 결정을 내릴 때

## 설치

> **참고:** 소스를 검토한 뒤 저장소에서 agent-eval을 설치하세요.

## 핵심 개념

### YAML 작업 정의

작업을 선언적으로 정의합니다. 각 작업은 무엇을 할지, 어떤 파일을 건드릴지, 성공을 어떻게 판단할지 지정합니다.

```yaml
name: add-retry-logic
description: HTTP 클라이언트에 지수 백오프 재시도 추가
repo: ./my-project
files:
  - src/http_client.py
prompt: |
  모든 HTTP 요청에 지수 백오프 재시도 로직을 추가하세요.
  최대 3회 재시도. 초기 지연 1초, 최대 지연 30초.
judge:
  - type: pytest
    command: pytest tests/test_http_client.py -v
  - type: grep
    pattern: "exponential_backoff|retry"
    files: src/http_client.py
commit: "abc1234"  # 재현성을 위해 특정 커밋에 고정
```

### Git Worktree 격리

각 에이전트 실행은 자체 git worktree를 가집니다. Docker는 필요하지 않습니다. 이는 에이전트끼리 서로 간섭하거나 기본 저장소를 손상시키지 못하도록 재현성 격리를 제공합니다.

### 수집되는 지표

| 지표 | 측정 대상 |
|------|-----------|
| 통과율 | 에이전트가 judge를 통과하는 코드를 만들었는가? |
| 비용 | 작업당 API 지출 (가능한 경우) |
| 시간 | 완료까지 걸린 실제 경과 시간(초) |
| 일관성 | 반복 실행에 걸친 통과율 (예: 3/3 = 100%) |

## 워크플로

### 1. 작업 정의

YAML 파일을 하나씩 담은 `tasks/` 디렉터리를 만듭니다.

```bash
mkdir tasks
# 작업 정의 작성 (위 템플릿 참고)
```

### 2. 에이전트 실행

에이전트를 작업에 대해 실행합니다.

```bash
agent-eval run --task tasks/add-retry-logic.yaml --agent claude-code --agent aider --runs 3
```

각 실행은 다음을 수행합니다.
1. 지정된 커밋에서 새 git worktree를 생성
2. 프롬프트를 에이전트에게 전달
3. judge 기준을 실행
4. 통과/실패, 비용, 시간을 기록

### 3. 결과 비교

비교 보고서를 생성합니다.

```bash
agent-eval report --format table
```

```
Task: add-retry-logic (3 runs each)
┌──────────────┬───────────┬────────┬────────┬─────────────┐
│ Agent        │ Pass Rate │ Cost   │ Time   │ Consistency │
├──────────────┼───────────┼────────┼────────┼─────────────┤
│ claude-code  │ 3/3       │ $0.12  │ 45s    │ 100%        │
│ aider        │ 2/3       │ $0.08  │ 38s    │  67%        │
└──────────────┴───────────┴────────┴────────┴─────────────┘
```

## Judge 유형

### 코드 기반 (결정적)

```yaml
judge:
  - type: pytest
    command: pytest tests/ -v
  - type: command
    command: npm run build
```

### 패턴 기반

```yaml
judge:
  - type: grep
    pattern: "class.*Retry"
    files: src/**/*.py
```

### 모델 기반 (LLM-as-judge)

```yaml
judge:
  - type: llm
    prompt: |
      이 구현이 지수 백오프를 올바르게 처리하는가?
      다음을 확인하라: 최대 재시도 횟수, 증가하는 지연, 지터(jitter).
```

## 모범 사례

- **실제 작업 부하를 대표하는 3~5개의 작업으로 시작**하세요. 장난감 예제는 피하세요.
- 에이전트마다 **최소 3회 시행**하여 분산을 확인하세요. 에이전트는 비결정적입니다.
- 결과가 며칠, 몇 주에 걸쳐 재현되도록 작업 YAML에 **커밋을 고정**하세요.
- 작업마다 **최소 하나의 결정적 judge**(테스트, 빌드)를 포함하세요. LLM judge는 노이즈를 더합니다.
- **통과율과 함께 비용을 추적**하세요. 95% 성공률이지만 비용이 10배인 에이전트는 올바른 선택이 아닐 수 있습니다.
- **작업 정의에 버전을 부여**하세요. 테스트 픽스처이므로 코드처럼 관리하세요.

## 링크

- 저장소: [github.com/joaquinhuigomez/agent-eval](https://github.com/joaquinhuigomez/agent-eval)
