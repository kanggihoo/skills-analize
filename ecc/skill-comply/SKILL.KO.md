---
name: skill-comply
description: 스킬, 규칙, 에이전트 정의가 실제로 따라지고 있는지 시각화합니다 — 프롬프트 엄격도 3단계의 시나리오를 자동 생성하고, 에이전트를 실행하며, 행동 순서를 분류하고, 준수율과 전체 도구 호출 타임라인을 보고합니다. 에이전트에게 주어진 스킬, 규칙, 정의를 실제로 따르는지 가정하지 않고 확인하고 싶을 때 사용합니다.
metadata:
  origin: ECC
tools: Read, Bash
---

# skill-comply: 자동화된 준수 측정

다음 방식으로 코딩 에이전트가 스킬, 규칙, 또는 에이전트 정의를 실제로 따르는지 측정합니다:
1. 임의의 .md 파일로부터 기대 행동 순서(spec)를 자동 생성
2. 프롬프트 엄격도가 점점 낮아지는 시나리오(supportive → neutral → competing)를 자동 생성
3. `claude -p`를 실행하고 stream-json으로 도구 호출 트레이스를 캡처
4. LLM을 사용하여(정규식이 아님) 도구 호출을 spec 단계에 분류
5. 시간 순서를 결정적으로 검사
6. spec, 프롬프트, 타임라인을 포함한 자체 완결형 보고서 생성

## 지원 대상

- **스킬** (`skills/*/SKILL.md`): search-first, TDD 가이드 같은 워크플로 스킬
- **규칙** (`rules/common/*.md`): testing.md, security.md, git-workflow.md 같은 필수 규칙
- **에이전트 정의** (`agents/*.md`): 기대될 때 에이전트가 호출되는지 여부(내부 워크플로 검증은 아직 지원하지 않음)

## 활성화 시점

- 사용자가 `/skill-comply <path>`를 실행할 때
- 사용자가 "이 규칙이 실제로 지켜지고 있나?"라고 물을 때
- 새 규칙/스킬을 추가한 후, 에이전트 준수를 검증하기 위해
- 품질 유지보수의 일환으로 주기적으로

## 사용법

```bash
# 전체 실행
uv run python -m scripts.run ~/.claude/rules/common/testing.md

# 드라이 런 (비용 없음, spec과 시나리오만 생성)
uv run python -m scripts.run --dry-run ~/.claude/skills/search-first/SKILL.md

# 모델 지정
uv run python -m scripts.run --gen-model haiku --model sonnet <path>
```

## 핵심 개념: 프롬프트 독립성

프롬프트가 스킬을 명시적으로 지원하지 않는 경우에도 스킬/규칙이 따라지는지 측정합니다.

## 보고서 내용

보고서는 자체 완결형이며 다음을 포함합니다:
1. 기대 행동 순서 (자동 생성된 spec)
2. 시나리오 프롬프트 (각 엄격도 수준에서 요청된 내용)
3. 시나리오별 준수 점수
4. LLM 분류 라벨이 붙은 도구 호출 타임라인

### 고급 (선택 사항)

hook에 익숙한 사용자를 위해, 보고서에는 준수율이 낮은 단계에 대한 hook 승격 권고도 포함됩니다. 이는 참고용 정보이며, 핵심 가치는 준수 현황 자체를 보여주는 데 있습니다.
