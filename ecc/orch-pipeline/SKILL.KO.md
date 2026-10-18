---
name: orch-pipeline
description: orch-* 스킬 계열 뒤의 공유 오케스트레이션 엔진 — 게이트가 적용된 Research-Plan-TDD-Review-Commit 파이프라인, 규모 분류기, 에이전트 및 명령어 맵, 그리고 orch-* 동작 스킬이 위임하는 두 개의 사람 게이트(계획 승인, 커밋 확인). orch-add-feature, orch-fix-defect, orch-change-feature, orch-refine-code, orch-build-mvp를 통해 간접적으로 사용합니다. orch 동작을 추가하거나 공유 단계를 조정할 때만 직접 읽습니다.
metadata:
  origin: ECC
---

# 오케스트레이터 파이프라인 (공유 엔진)

`orch-*` 스킬은 얇은 래퍼입니다. 작업 자체를 다시 구현하지 않습니다. 요청을 분류하고, *이* 파이프라인의 어떤 단계를 실행할지 선택하고, 각 단계를 기존 ECC 에이전트나 명령어에 위임합니다. 이 파일이 그 파이프라인입니다.

> 이 엔진을 직접 호출하지 말고, 동작 스킬(`orch-add-feature`, `orch-fix-defect`, …)을 호출하세요. 이 파일은 그들이 참조하는 기준 문서입니다.

## 사용 시점

- `orch-*` 동작 스킬이 실행될 때 간접적으로 로드됩니다.
- 이 계열에 새 동작을 추가하거나, 공유 단계, 게이트, 에이전트 맵을 조정할 때만 직접 읽습니다.

## 동작 계열

| 스킬 | 동작 | 트리거 | 첫 동작 |
|-------|-----------|---------|------------|
| `orch-add-feature` | feature | 기능이 아직 존재하지 않음 | 새 슬라이스를 조사하고 계획 |
| `orch-change-feature` | tweak | 동작하지만 원하는 동작이 다름 | 기존 동작 *및 그 테스트*를 수정 |
| `orch-fix-defect` | fix | 깨짐; 동작이 잘못됨 | 실패 테스트로 재현한 뒤 수정 |
| `orch-refine-code` | refactor | 동작은 유지되고 구조가 개선됨 | 테스트를 녹색으로 유지하며 재구조화 |
| `orch-build-mvp` | mvp | 설계/명세 문서로부터 부트스트랩 | 문서 수집 → 수직 슬라이스 |

> 이 래퍼들은 기존 ECC 명령어를 대체하지 않고 **조합**합니다: `/feature-dev`, `/plan`, `/code-review`, `/build-fix`, `/refactor-clean`, `/gan-build`, 그리고 `tdd-workflow` 스킬. orch-* 계열은 이들 위에 공유 규모 분류기와 두 개의 게이트를 추가하므로, 하나의 상위 체계가 다섯 가지 동작을 일관되게 다룹니다.

## 0단계 — 규모 분류 (적정 규모 설정)

의식(절차)의 규모는 영향 범위에 비례합니다. 요청을 세 가지 신호로 평가하고, 어떤 신호든 도달한 **가장 높은** 등급을 취하며, 결과를 한 줄로 밝혀 사용자가 재정의할 수 있도록 합니다:

| 등급 | 변경 파일 | 새 의존성 / 계약 | 설계 모호성 | 실행되는 단계 |
|------|---------------|---------------------------|------------------|-----------------|
| trivial | 1개, 몇 줄 | 없음 | 없음 — 변경이 명백함 | 4 → 5 → 6 |
| small | 1개 파일 / 1개 함수 | 없음 | 코드를 읽으면 명확함 | (1 가볍게) → 4 → 5 → 6 |
| standard | 2–5개 파일 | 새 내부 모듈일 수 있음 | 하나의 실질적 선택이 필요함 | 1 → 2 → 4 → 5 → 6 |
| large | 다수 / 여러 영역에 걸침 | 새 외부 의존성, 공개 API, 또는 명세 문서 | 여러 열린 질문 | 1 → 2 → (3) → 4 → 5 → 6 |

0단계(Intake)는 항상 실행되며, 위 마스크 열에서는 생략되어 있습니다. 판정 기준: 아래의 보안 트리거에 해당하거나 공개 API / 계약에 영향을 주는 작업은, 파일 수와 관계없이 **최소 standard**입니다.

## 단계

각 단계는 작업을 직접 하지 않고 위임합니다.

- **0. Intake** — 요청을 다시 진술합니다. `orch-build-mvp`의 경우 명세/설계 문서를 읽고 범위, 확정된 결정 사항, 기능 목록을 추출합니다.
- **1. Research & Reuse** — `rules/common/development-workflow.md`에 따라: `gh search repos` / `gh search code`, 그다음 Context7 / 벤더 문서, 그다음 패키지 레지스트리, 그다음 Exa. 새로 작성하기보다 검증된 구현을 채택하는 것을 선호합니다.
- **2. Plan** — `planner` 에이전트에 위임합니다(구조적 결정은 `architect` / `code-architect`). 얇은 수직 슬라이스 순서의 `task_list`를 출력합니다. → **GATE 1.**
- **3. Scaffold** — `orch-build-mvp` 전용: 첫 번째 종단간 슬라이스를 세웁니다.
- **4. Implement (TDD)** — 각 작업을 `tdd-guide` 에이전트(또는 `tdd-workflow` 스킬)를 통해 진행합니다: 붉은색 → 녹색 → 리팩터링. 해당 동작의 첫 동작 규칙을 따릅니다.
- **5. Review** — `code-reviewer` 에이전트 / `/code-review`. diff가 보안 트리거(아래)에 해당하면 `security-reviewer`를 추가합니다.
- **6. Commit** — 논리적 단위마다 하나씩, 컨벤셔널 커밋(`feat:` / `fix:` / `refactor:` / …)을 합니다. → **GATE 2.**

## 두 개의 게이트

이 계열은 **자율이 아니라 게이트가 적용됩니다**:

1. **GATE 1 — 계획 이후.** `task_list`를 제시하고, 사용자가 승인하기 전까지 구현 코드를 작성하지 않습니다.
2. **GATE 2 — 커밋 이전.** diff 요약과 제안된 커밋 메시지를 제시하고, 사용자가 확인하기 전까지 커밋하지 않습니다.

두 게이트 사이의 모든 작업은 멈추지 않고 진행합니다.

## 에이전트 / 명령어 맵

| 단계 | 기본 | 대체 / 에스컬레이션 |
|-------|---------|----------------------|
| Intake / 이해 | `code-explorer` | 조정, 수정, 리팩터링 전에 기존 경로를 추적 |
| Plan | `planner` | 구조적 판단에는 `architect`, `code-architect` |
| Implement | `tdd-guide` (또는 `tdd-workflow` 스킬) | 빌드 실패 시 `build-error-resolver` / `/build-fix` |
| Review | `code-reviewer` / `/code-review` | 언어별 리뷰어(`python-reviewer`, `typescript-reviewer`, …) |
| Security | `security-reviewer` | — |
| MVP 내부 루프 | `/gan-build "<brief>" --skip-planner` | `gan-generator` → `gan-evaluator` 구동; `--max-iterations` / `--pass-threshold` 조정 |

저장소에 맞는 언어별 리뷰어를 선택합니다(저장소의 `CLAUDE.md`를 참고하세요).

## 보안 리뷰 트리거

diff가 다음 중 하나라도 건드리면 `security-reviewer`를 투입합니다: 인증 또는 권한 부여, 사용자 입력 처리, 데이터베이스 쿼리, 파일 시스템 경로, 외부 API 호출, 암호화, 또는 시크릿 / 자격 증명. (`rules/common/security.md`에 따름.)

## 인계 산출물

파이프라인은 숨겨진 상태를 두지 않습니다 — 계획 문서가 곧 인계물입니다:

- Plan에서 나온 `task_list`가 Implement 루프를 이끕니다.
- 규모가 큰 작업은 `rules/common/development-workflow.md`에 따라 저장소의 `docs/` 아래에 PRD / 아키텍처 / system_design을 함께 생성할 수 있습니다.
- 리뷰 결과(CRITICAL / HIGH)는 Gate 2 이전에 해결해야 합니다.

## 검증

- 규모 등급이 명시되었고 작업과 일치함
- Gate 1(계획)과 Gate 2(커밋)가 모두 지켜짐
- `security-reviewer`는 보안 트리거에 닿았을 때만 실행됨
- 커밋은 컨벤셔널 형식이며 하나의 논리적 변경으로 범위가 제한됨
- 새로운 / 변경된 동작에 테스트가 있고, `rules/common/testing.md`에 따라 커버리지 ≥ 80%
