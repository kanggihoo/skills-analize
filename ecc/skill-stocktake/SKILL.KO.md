---
name: skill-stocktake
description: "Claude 스킬과 커맨드의 품질을 감사할 때 사용합니다. 순차적 서브에이전트 배치 평가를 사용하는 Quick Scan(변경된 스킬만)과 Full Stocktake 모드를 지원합니다."
metadata:
  origin: ECC
---

# skill-stocktake

체크리스트 기반 품질 검사와 AI의 종합 판단을 사용하여 모든 Claude 스킬과 커맨드를 감사하는 슬래시 커맨드(`/skill-stocktake`)입니다. 최근에 변경된 스킬을 위한 Quick Scan과 전체 검토를 위한 Full Stocktake, 두 가지 모드를 지원합니다.

## 범위

이 커맨드는 **호출한 디렉터리를 기준으로 한** 다음 경로를 대상으로 합니다:

| 경로 | 설명 |
|------|------|
| `~/.claude/skills/` | 전역 스킬 (모든 프로젝트) |
| `{cwd}/.claude/skills/` | 프로젝트 수준 스킬 (디렉터리가 존재하는 경우) |

**Phase 1 시작 시, 이 커맨드는 어떤 경로가 발견되고 스캔되었는지 명시적으로 나열합니다.**

### 특정 프로젝트 대상 지정

프로젝트 수준 스킬을 포함하려면 해당 프로젝트의 루트 디렉터리에서 실행하십시오:

```bash
cd ~/path/to/my-project
/skill-stocktake
```

프로젝트에 `.claude/skills/` 디렉터리가 없으면, 전역 스킬과 커맨드만 평가합니다.

## 모드

| 모드 | 트리거 | 소요 시간 |
|------|---------|---------|
| Quick Scan | `results.json`이 존재 (기본값) | 5–10분 |
| Full Stocktake | `results.json`이 없거나, `/skill-stocktake full` | 20–30분 |

**결과 캐시:** `~/.claude/skills/skill-stocktake/results.json`

## Quick Scan 흐름

마지막 실행 이후 변경된 스킬만 다시 평가합니다 (5–10분).

1. `~/.claude/skills/skill-stocktake/results.json`을 읽습니다
2. 실행: `bash ~/.claude/skills/skill-stocktake/scripts/quick-diff.sh \
         ~/.claude/skills/skill-stocktake/results.json`
   (프로젝트 디렉터리는 `$PWD/.claude/skills`에서 자동 감지되며, 필요한 경우에만 명시적으로 전달)
3. 출력이 `[]`이면: "No changes since last run."을 보고하고 중단합니다
4. 변경된 파일만 Phase 2와 동일한 기준으로 다시 평가합니다
5. 변경되지 않은 스킬은 이전 결과에서 그대로 이월합니다
6. 차이점만 출력합니다
7. 실행: `bash ~/.claude/skills/skill-stocktake/scripts/save-results.sh \
         ~/.claude/skills/skill-stocktake/results.json <<< "$EVAL_RESULTS"`

## Full Stocktake 흐름

### Phase 1 — 인벤토리

실행: `bash ~/.claude/skills/skill-stocktake/scripts/scan.sh`

이 스크립트는 스킬 파일을 나열하고, frontmatter를 추출하며, UTC mtime을 수집합니다.
프로젝트 디렉터리는 `$PWD/.claude/skills`에서 자동 감지되며, 필요한 경우에만 명시적으로 전달합니다.
스크립트 출력에서 스캔 요약과 인벤토리 표를 제시하십시오:

```
Scanning:
  ✓ ~/.claude/skills/         (17 files)
  ✗ {cwd}/.claude/skills/    (not found — global skills only)
```

| 스킬 | 7일 사용 | 30일 사용 | 설명 |
|-------|--------|---------|-------------|

### Phase 2 — 품질 평가

전체 인벤토리와 체크리스트를 가지고 Agent 도구 서브에이전트(**general-purpose 에이전트**)를 실행합니다:

```text
Agent(
  subagent_type="general-purpose",
  prompt="
다음 스킬 인벤토리를 체크리스트에 따라 평가하십시오.

[INVENTORY]

[CHECKLIST]

각 스킬에 대해 다음 형식의 JSON을 반환하십시오:
{ \"verdict\": \"Keep\"|\"Improve\"|\"Update\"|\"Retire\"|\"Merge into [X]\", \"reason\": \"...\" }
"
)
```

서브에이전트는 각 스킬을 읽고 체크리스트를 적용하여 스킬별 JSON을 반환합니다:

`{ "verdict": "Keep"|"Improve"|"Update"|"Retire"|"Merge into [X]", "reason": "..." }`

**청크 가이드:** 컨텍스트를 관리 가능한 수준으로 유지하기 위해 서브에이전트 호출당 약 20개의 스킬을 처리하십시오. 각 청크 이후에는 중간 결과를 `results.json`(`status: "in_progress"`)에 저장하십시오.

모든 스킬 평가가 끝나면 `status: "completed"`로 설정하고 Phase 3으로 진행합니다.

**재개 감지:** 시작 시 `status: "in_progress"`가 발견되면, 아직 평가되지 않은 첫 번째 스킬부터 다시 시작합니다.

각 스킬은 다음 체크리스트에 따라 평가됩니다:

```
- [ ] 다른 스킬과의 내용 중복 확인
- [ ] MEMORY.md / CLAUDE.md와의 중복 확인
- [ ] 기술 참조의 최신성 검증 (도구 이름 / CLI 플래그 / API가 있으면 WebSearch 사용)
- [ ] 사용 빈도 고려
```

판정 기준:

| 판정 | 의미 |
|---------|---------|
| Keep | 유용하며 최신 상태 |
| Improve | 유지할 가치가 있지만 구체적인 개선이 필요 |
| Update | 참조하는 기술이 오래됨 (WebSearch로 확인) |
| Retire | 품질이 낮거나, 오래되었거나, 비용 대비 효과가 떨어짐 |
| Merge into [X] | 다른 스킬과 상당한 중복이 있음; 병합 대상을 명시 |

평가는 **전체적인 AI 판단**이며, 숫자 루브릭이 아닙니다. 주요 판단 기준:
- **실행 가능성(Actionability)**: 즉시 행동할 수 있게 해 주는 코드 예시, 명령, 단계
- **범위 적합성(Scope fit)**: 이름, 트리거, 내용이 일치하며, 너무 넓거나 좁지 않음
- **고유성(Uniqueness)**: MEMORY.md / CLAUDE.md / 다른 스킬로 대체할 수 없는 가치
- **최신성(Currency)**: 기술 참조가 현재 환경에서 동작함

**reason 품질 요구사항** — `reason` 필드는 그 자체로 완결되고, 의사결정을 돕는 내용이어야 합니다:
- "unchanged"라고만 쓰지 마십시오 — 항상 핵심 근거를 다시 서술하십시오
- **Retire**의 경우: (1) 발견된 구체적인 결함, (2) 같은 필요를 대신 충족하는 것이 무엇인지를 명시하십시오
  - 나쁜 예: `"Superseded"`
  - 좋은 예: `"disable-model-invocation: true already set; superseded by continuous-learning-v2 which covers all the same patterns plus confidence scoring. No unique content remains."`
- **Merge**의 경우: 병합 대상을 명시하고, 통합할 내용을 설명하십시오
  - 나쁜 예: `"Overlaps with X"`
  - 좋은 예: `"42-line thin content; Step 4 of chatlog-to-article already covers the same workflow. Integrate the 'article angle' tip as a note in that skill."`
- **Improve**의 경우: 필요한 구체적 변경(어떤 섹션, 어떤 조치, 관련 있는 경우 목표 크기)을 설명하십시오
  - 나쁜 예: `"Too long"`
  - 좋은 예: `"276 lines; Section 'Framework Comparison' (L80–140) duplicates ai-era-architecture-principles; delete it to reach ~150 lines."`
- **Keep**의 경우 (Quick Scan에서 mtime만 변경된 경우): 원래 판정 근거를 다시 서술하고, "unchanged"라고 쓰지 마십시오
  - 나쁜 예: `"Unchanged"`
  - 좋은 예: `"mtime updated but content unchanged. Unique Python reference explicitly imported by rules/python/; no overlap found."`

### Phase 3 — 요약 표

| 스킬 | 7일 사용 | 판정 | 이유 |
|-------|--------|---------|--------|

### Phase 4 — 통합

1. **Retire / Merge**: 사용자에게 확인받기 전에 파일별로 상세한 근거를 제시하십시오:
   - 발견된 구체적인 문제(중복, 오래됨, 깨진 참조 등)
   - 같은 기능을 대신하는 대안(Retire의 경우: 어떤 기존 스킬/규칙, Merge의 경우: 대상 파일과 통합할 내용)
   - 제거의 영향(의존하는 스킬, MEMORY.md 참조, 영향을 받는 워크플로)
2. **Improve**: 근거와 함께 구체적인 개선 제안을 제시하십시오:
   - 무엇을 왜 바꿀지 (예: "섹션 X/Y가 python-patterns와 중복되므로 430→200줄로 줄이기")
   - 조치 여부는 사용자가 결정합니다
3. **Update**: 확인한 출처와 함께 업데이트된 내용을 제시하십시오
4. MEMORY.md 줄 수를 확인하고, 100줄을 넘으면 압축을 제안하십시오

## 결과 파일 스키마

`~/.claude/skills/skill-stocktake/results.json`:

**`evaluated_at`**: 평가가 완료된 실제 UTC 시각으로 설정해야 합니다.
Bash로 얻으십시오: `date -u +%Y-%m-%dT%H:%M:%SZ`. `T00:00:00Z` 같은 날짜만 있는 근사값은 절대 사용하지 마십시오.

```json
{
  "evaluated_at": "2026-02-21T10:00:00Z",
  "mode": "full",
  "batch_progress": {
    "total": 80,
    "evaluated": 80,
    "status": "completed"
  },
  "skills": {
    "skill-name": {
      "path": "~/.claude/skills/skill-name/SKILL.md",
      "verdict": "Keep",
      "reason": "Concrete, actionable, unique value for X workflow",
      "mtime": "2026-01-15T08:30:00Z"
    }
  }
}
```

## 참고

- 평가는 블라인드로 진행됩니다: 출처(ECC, 직접 작성, 자동 추출)와 관계없이 모든 스킬에 같은 체크리스트를 적용합니다
- 보관/삭제 작업은 항상 사용자의 명시적 확인이 필요합니다
- 출처에 따라 판정을 달리하지 않습니다
