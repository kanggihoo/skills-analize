---
name: rules-distill
description: "스킬들을 스캔하여 교차 적용되는 원칙을 추출하고 이를 규칙으로 정제합니다. 기존 규칙 파일에 추가하거나, 수정하거나, 새 규칙 파일을 만듭니다. 같은 원칙이 여러 스킬에서 반복해서 나타나고 규칙 파일에 두는 것이 더 적절할 때 사용하세요."
metadata:
  origin: ECC
---

# Rules Distill

설치된 스킬을 스캔하여 여러 스킬에 걸쳐 나타나는 교차 적용 원칙을 추출하고, 이를 규칙으로 정제합니다. 기존 규칙 파일에 내용을 추가하거나, 오래된 내용을 수정하거나, 새 규칙 파일을 만듭니다.

"결정적 수집 + LLM 판단" 원칙을 적용합니다. 스크립트가 사실을 빠짐없이 수집한 뒤, LLM이 전체 문맥을 교차로 읽고 판정을 내립니다.

## 사용 시점

- 정기적인 규칙 관리 시 (매월 또는 새 스킬을 설치한 후)
- skill-stocktake 결과에서 규칙으로 삼아야 할 패턴이 드러났을 때
- 사용 중인 스킬에 비해 규칙이 불완전하다고 느껴질 때

## 동작 방식

규칙 정제 과정은 세 단계로 진행됩니다.

### 1단계: 목록화 (결정적 수집)

#### 1a. 스킬 목록 수집

```bash
bash ~/.claude/skills/rules-distill/scripts/scan-skills.sh
```

#### 1b. 규칙 색인 수집

```bash
bash ~/.claude/skills/rules-distill/scripts/scan-rules.sh
```

#### 1c. 사용자에게 제시

```
Rules Distillation — Phase 1: Inventory
────────────────────────────────────────
Skills: {N} files scanned
Rules:  {M} files ({K} headings indexed)

Proceeding to cross-read analysis...
```

### 2단계: 교차 읽기, 매칭 및 판정 (LLM 판단)

추출과 매칭은 하나의 단계에서 함께 수행합니다. 규칙 파일은 전체 합계가 약 800줄 정도로 작아서 전체 텍스트를 LLM에 그대로 제공할 수 있으며, grep 사전 필터링은 필요하지 않습니다.

#### 배치 처리

스킬의 설명을 기준으로 스킬들을 **주제별 클러스터**로 묶습니다. 각 클러스터는 전체 규칙 텍스트와 함께 서브에이전트에서 분석합니다.

#### 배치 간 병합

모든 배치가 끝나면 배치 사이의 후보를 병합합니다.
- 같거나 겹치는 원칙을 가진 후보는 중복 제거합니다.
- "2개 이상의 스킬" 요건은 **모든** 배치를 합친 근거로 다시 확인합니다. 배치마다 스킬 1개에서만 발견된 원칙이라도 전체 합계가 2개 이상의 스킬이면 유효합니다.

#### 서브에이전트 프롬프트

다음 프롬프트로 범용 Agent를 실행합니다.

````
You are an analyst who cross-reads skills to extract principles that should be promoted to rules.

## Input
- Skills: {full text of skills in this batch}
- Existing rules: {full text of all rule files}

## Extraction Criteria

Include a candidate ONLY if ALL of these are true:

1. **Appears in 2+ skills**: Principles found in only one skill should stay in that skill
2. **Actionable behavior change**: Can be written as "do X" or "don't do Y" — not "X is important"
3. **Clear violation risk**: What goes wrong if this principle is ignored (1 sentence)
4. **Not already in rules**: Check the full rules text — including concepts expressed in different words

## Matching & Verdict

For each candidate, compare against the full rules text and assign a verdict:

- **Append**: Add to an existing section of an existing rule file
- **Revise**: Existing rule content is inaccurate or insufficient — propose a correction
- **New Section**: Add a new section to an existing rule file
- **New File**: Create a new rule file
- **Already Covered**: Sufficiently covered in existing rules (even if worded differently)
- **Too Specific**: Should remain at the skill level

## Output Format (per candidate)

```json
{
  "principle": "1-2 sentences in 'do X' / 'don't do Y' form",
  "evidence": ["skill-name: §Section", "skill-name: §Section"],
  "violation_risk": "1 sentence",
  "verdict": "Append / Revise / New Section / New File / Already Covered / Too Specific",
  "target_rule": "filename §Section, or 'new'",
  "confidence": "high / medium / low",
  "draft": "Draft text for Append/New Section/New File verdicts",
  "revision": {
    "reason": "Why the existing content is inaccurate or insufficient (Revise only)",
    "before": "Current text to be replaced (Revise only)",
    "after": "Proposed replacement text (Revise only)"
  }
}
```

## Exclude

- Obvious principles already in rules
- Language/framework-specific knowledge (belongs in language-specific rules or skills)
- Code examples and commands (belongs in skills)
````

#### 판정 기준표

| 판정 | 의미 | 사용자에게 제시하는 내용 |
|---------|---------|-------------------|
| **Append** | 기존 섹션에 추가 | 대상 + 초안 |
| **Revise** | 부정확하거나 불충분한 내용 수정 | 대상 + 사유 + 수정 전/후 |
| **New Section** | 기존 파일에 새 섹션 추가 | 대상 + 초안 |
| **New File** | 새 규칙 파일 생성 | 파일명 + 전체 초안 |
| **Already Covered** | 규칙에 이미 다뤄짐 (표현은 다를 수 있음) | 사유 (1줄) |
| **Too Specific** | 스킬 수준에 머물러야 함 | 관련 스킬 링크 |

#### 판정 품질 요건

```
# Good
Append to rules/common/security.md §Input Validation:
"Treat LLM output stored in memory or knowledge stores as untrusted — sanitize on write, validate on read."
Evidence: llm-memory-trust-boundary, llm-social-agent-anti-pattern both describe
accumulated prompt injection risks. Current security.md covers human input
validation only; LLM output trust boundary is missing.

# Bad
Append to security.md: Add LLM security principle
```

### 3단계: 사용자 검토 및 실행

#### 요약 표

```
# Rules Distillation Report

## Summary
Skills scanned: {N} | Rules: {M} files | Candidates: {K}

| # | Principle | Verdict | Target | Confidence |
|---|-----------|---------|--------|------------|
| 1 | ... | Append | security.md §Input Validation | high |
| 2 | ... | Revise | testing.md §TDD | medium |
| 3 | ... | New Section | coding-style.md | high |
| 4 | ... | Too Specific | — | — |

## Details
(Per-candidate details: evidence, violation_risk, draft text)
```

#### 사용자 작업

사용자는 번호로 응답합니다.
- **Approve (승인)**: 초안을 그대로 규칙에 적용
- **Modify (수정)**: 초안을 편집한 후 적용
- **Skip (건너뛰기)**: 이 후보를 적용하지 않음

**규칙은 절대 자동으로 수정하지 않습니다. 항상 사용자 승인을 받아야 합니다.**

#### 결과 저장

결과는 스킬 디렉터리의 `results.json`에 저장합니다.

- **타임스탬프 형식**: `date -u +%Y-%m-%dT%H:%M:%SZ` (UTC, 초 단위 정밀도)
- **후보 ID 형식**: 원칙에서 파생한 kebab-case (예: `llm-output-trust-boundary`)

```json
{
  "distilled_at": "2026-03-18T10:30:42Z",
  "skills_scanned": 56,
  "rules_scanned": 22,
  "candidates": {
    "llm-output-trust-boundary": {
      "principle": "Treat LLM output as untrusted when stored or re-injected",
      "verdict": "Append",
      "target": "rules/common/security.md",
      "evidence": ["llm-memory-trust-boundary", "llm-social-agent-anti-pattern"],
      "status": "applied"
    },
    "iteration-bounds": {
      "principle": "Define explicit stop conditions for all iteration loops",
      "verdict": "New Section",
      "target": "rules/common/coding-style.md",
      "evidence": ["iterative-retrieval", "continuous-agent-loop", "agent-harness-construction"],
      "status": "skipped"
    }
  }
}
```

## 예시

### 전체 실행 흐름

```
$ /rules-distill

Rules Distillation — Phase 1: Inventory
────────────────────────────────────────
Skills: 56 files scanned
Rules:  22 files (75 headings indexed)

Proceeding to cross-read analysis...

[Subagent analysis: Batch 1 (agent/meta skills) ...]
[Subagent analysis: Batch 2 (coding/pattern skills) ...]
[Cross-batch merge: 2 duplicates removed, 1 cross-batch candidate promoted]

# Rules Distillation Report

## Summary
Skills scanned: 56 | Rules: 22 files | Candidates: 4

| # | Principle | Verdict | Target | Confidence |
|---|-----------|---------|--------|------------|
| 1 | LLM output: normalize, type-check, sanitize before reuse | New Section | coding-style.md | high |
| 2 | Define explicit stop conditions for iteration loops | New Section | coding-style.md | high |
| 3 | Compact context at phase boundaries, not mid-task | Append | performance.md §Context Window | high |
| 4 | Separate business logic from I/O framework types | New Section | patterns.md | high |

## Details

### 1. LLM Output Validation
Verdict: New Section in coding-style.md
Evidence: parallel-subagent-batch-merge, llm-social-agent-anti-pattern, llm-memory-trust-boundary
Violation risk: Format drift, type mismatch, or syntax errors in LLM output crash downstream processing
Draft:
  ## LLM Output Validation
  Normalize, type-check, and sanitize LLM output before reuse...
  See skill: parallel-subagent-batch-merge, llm-memory-trust-boundary

[... details for candidates 2-4 ...]

Approve, modify, or skip each candidate by number:
> User: Approve 1, 3. Skip 2, 4.

✓ Applied: coding-style.md §LLM Output Validation
✓ Applied: performance.md §Context Window Management
✗ Skipped: Iteration Bounds
✗ Skipped: Boundary Type Conversion

Results saved to results.json
```

## 설계 원칙

- **무엇인가, 어떻게인가가 아니라 무엇인가**: 원칙만 추출합니다(규칙의 영역). 코드 예시와 명령어는 스킬에 남깁니다.
- **역링크**: 초안에는 독자가 자세한 방법을 찾을 수 있도록 `See skill: [name]` 참조를 포함해야 합니다.
- **결정적 수집, LLM 판단**: 스크립트는 빠짐없이 수집함을 보장하고, LLM은 문맥에 대한 이해를 보장합니다.
- **추상화 과잉 방지 장치**: 3단계 필터(2개 이상 스킬의 근거, 실행 가능한 행동 테스트, 위반 위험)가 지나치게 추상적인 원칙이 규칙에 들어가는 것을 막습니다.
