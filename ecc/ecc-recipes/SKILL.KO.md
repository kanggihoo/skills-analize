---
name: ecc-recipes
description: 설명된 워크플로를 실행 순서와 중단 조건이 포함된 적절한 ECC 명령 그룹에 매핑하거나, commands 디렉터리에서 실시간으로 읽은 모든 명령 그룹 레시피 계열을 살펴봅니다. 자문 전용이며 절대 실행하지 않습니다. 워크플로를 실행하는 명령이 무엇인지, 작업의 명령 순서가 무엇인지, ECC 파이프라인 목록을 물을 때 사용합니다. 작업 자체를 실행하는 경우(명령으로 라우팅), 단일 명령 문서(ecc-guide 사용), 프롬프트 재작성(prompt-optimizer 사용)에는 사용하지 않습니다.
argument-hint: <워크플로 설명 | 비우면 전체 목록>
origin: community
author: KyawZinLatt
metadata:
  version: "1.0.0"
---

# ECC 레시피

"내 워크플로를 실행하는 ECC 슬래시 명령 그룹은 무엇이고, 어떤 순서로 실행하며, 언제 멈춰야 하는가"에 대한 단일 진입점입니다. 모든 명령 그룹 레시피 계열을 둘러보는 기능도 제공합니다.

기존의 두 스킬 사이의 공백을 메웁니다.

- `ecc-guide` — 명령을 나열하고 문서를 읽을 위치를 알려 주지만, 평면적인 카탈로그로만 제공합니다.
- `prompt-optimizer` — 작업을 구성 요소에 맞추지만, 실행 순서와 중단 조건이 있는 여러 명령 그룹이 아니라 단일 프롬프트를 출력합니다.

이 스킬은 **계열 그룹화 + 실행 순서 + 중단 조건**을 추가합니다.

## 활성화 시점

- "<workflow>에는 어떤 명령 그룹을 실행하나요?"
- "MVP를 만들기 / 결함을 고치기 / 리팩터링하기 위한 명령 순서는 무엇인가요?"
- "ECC 명령 그룹 레시피를 모두 보여 주세요" (카탈로그 모드)
- "ECC에는 워크플로 파이프라인이 몇 개 있나요?"
- 사용자가 설명과 함께 또는 설명 없이 `/ecc-recipes`를 호출하는 경우

### 사용하지 않는 경우

- 사용자가 지금 작업이 완료되기를 원하는 경우 — 설명하지 말고 실제 명령으로 라우팅하세요.
- 명령 하나에 대한 깊은 문서를 원하는 경우 — `ecc-guide`를 사용하세요.
- 초안 프롬프트를 다시 쓰고 싶은 경우 — `prompt-optimizer`를 사용하세요.

## 핵심 원칙

**기억이 아니라 현재 파일을 근거로 답합니다.** 명령 집합은 바뀌므로 개수나 구성원 목록을 하드코딩하지 마세요. 매번 실행할 때 살아 있는 `commands/` 디렉터리를 읽은 뒤 계열로 분류하세요.

### 실시간 읽기

명령 디렉터리를 찾고(존재하는 첫 번째 경로), 이름을 나열합니다.

```bash
for D in \
  "$HOME"/.claude/plugins/marketplaces/ecc/commands \
  "$HOME"/.claude/plugins/cache/ecc/ecc/*/commands \
  ./commands \
  ./.claude/commands \
  "$HOME"/.claude/commands; do
  [ -d "$D" ] && CMD_DIR="$D" && break
done
[ -z "${CMD_DIR:-}" ] && { echo "ECC 명령 디렉터리를 찾을 수 없습니다."; return 1; }
find "$CMD_DIR" -maxdepth 1 -name '*.md' -exec basename {} .md \; | sort
```

필요하다면 더 풍부한 그룹화를 위해 `manifests/install-*.json`이 있으면 읽어도 됩니다. 필요한 최소한의 파일만 읽으세요.

## 계열 분류 (접두사 기준)

명령 이름을 선행 접두사로 묶고, 알려진 단독 명령은 수동으로 매핑합니다. 계열은 실시간으로 도출되며, 아래 표는 고정된 목록이 아니라 *분류 규칙*입니다.

| 계열 접두사 | 레시피 의미 | 일반적인 실행 순서 |
|---|---|---|
| `orch-*` | 작업 유형별로 게이트가 있는 Research, Plan, TDD, Review, Commit | 작업 종류에 따라 orch-* 하나를 고르세요. 내부 단계는 스스로 실행합니다. |
| `multi-*` | 다중 모델 워크플로 | `multi-plan` → `multi-execute` → 리뷰 (또는 엔드 투 엔드 `multi-workflow`) |
| `prp-*` | PRD에서 계획, 구현, PR까지 이어지는 파이프라인 | `prp-prd` → `prp-plan` → `prp-implement` → `prp-commit` → `prp-pr` |
| `epic-*` | 여러 단위로 나뉘는 대규모 에픽, 병렬 처리 | `epic-decompose` → `epic-claim` → `epic-validate` → `epic-review` → `epic-unblock` → `epic-sync` → `epic-publish` |
| `loop-*` | 관리되는 자율 루프와 모니터 | `loop-start <pattern>` 후 `loop-status`로 관찰 |
| `gan-*` | 생성기와 평가기 루프 | `gan-build`(코드) 또는 `gan-design`(UI); 자체 반복 |
| `*-build` / `*-review` / `*-test` | 언어별 CI 트라이어드 | `<lang>-test`(TDD) → `<lang>-build`(수정) → `<lang>-review` |
| `hookify-*` | 동작 hook 관리 | `hookify` → `hookify-list` → `hookify-configure` |
| `learn` / `instinct-*` / `evolve` / `promote` / `prune` | 지속 학습 | `learn` → `instinct-status` → `evolve` → `promote` |
| 단독 명령 | `santa-loop`, `plan`, `plan-prd`, `pr`, `code-review`, `checkpoint` 등 | 단독으로 쓰거나 그룹 사이를 잇는 역할 |

접두사 규칙에 맞지 않는 명령은 모두 한 줄 설명과 함께 **단독 명령**에 나열합니다.

## 동작 방식

```
1. CMD_DIR에서 명령 이름을 실시간으로 읽습니다.
2. 접두사와 단독 명령 매핑으로 계열을 분류합니다.
3. 워크플로 설명이 주어지면 -> 매칭 모드.
   없으면 -> 카탈로그 모드.
4. 자문 전용: 계획만 출력합니다. 매칭된 명령을 절대 실행하지 않습니다.
```

### 카탈로그 모드 (설명 없음)

계열 표를 출력합니다. 각 계열, 구성원 수, 구성원, 한 줄 의미, 일반적인 실행 순서를 포함하세요. 마지막에는 전체 명령 수와 워크플로를 설명해서 레시피를 매칭하도록 유도하는 문장을 넣으세요.

### 매칭 모드 (설명 있음)

1. 워크플로를 한 문장으로 다시 서술합니다.
2. 가장 적합한 계열 1~2개를 고르고, 각각 왜 맞는지 한 줄로 설명합니다.
3. **실행 순서 블록** — 매칭된 계열의 정확한 명령 순서입니다.
4. **중단 조건** — 항상 명시하세요(최대 실행 횟수, 완료 신호, 리뷰 통과 횟수, 또는 단일 실행). 자율 루프의 경우 구독/크레딧 소진 위험을 경고하고, 상한이 있는 안전장치(backstop)를 권장하세요.
5. **읽을 곳** — `commands/<name>.md` 경로와 `/ecc-guide <name>`.

## 출력 템플릿 (매칭 모드)

```
워크플로: <one-sentence restatement>

가장 적합: <family> — <why>
(대안: <family> — <why>)

실행 순서:
  /<cmd1>   # 작업
  /<cmd2>   # 작업
  /<cmd3>   # 작업
  중단 조건: <condition>
  경고 (자율 루프에만 해당): 상한 없는 루프는 구독/크레딧을 소진합니다 —
  완료 신호와 함께 최대 반복 횟수 또는 최대 비용 안전장치를 추가하세요.

전체 문서 읽기:
  commands/<cmd1>.md   (또는: /ecc-guide <cmd1>)
```

## 예시

**카탈로그:** `/ecc-recipes` → 계열 표와 전체 개수를 출력합니다.

**매칭:** `/ecc-recipes plan a whole app upfront then auto-build with adversarial
review until done` → 가장 적합: `loop-*`(자율) 가 `gan-*` 또는 `santa-loop`(적대적)을 감쌉니다. 실행 순서: `plan-prd` 후
`loop-start rfc-dag --mode safe`, 그다음 `loop-status`로 모니터링; 모든 단위가 N회 연속 리뷰를 통과하면 중단 (소진을 제한하려면 최대 반복 횟수 안전장치를 추가하세요).

**매칭:** `/ecc-recipes fix a bug in my Go service` → 가장 적합: `orch-fix-defect`
(재현, 수정, 리뷰, 커밋). 대안: `go-test` → `go-build` → `go-review`. 중단 조건: 회귀 테스트가 green이고 리뷰가 통과할 때.

## 비목표

- 실행기가 아닙니다 — 자문 전용입니다.
- 명령별 깊은 문서가 아닙니다 — 그것은 `ecc-guide`의 역할입니다.
- 프롬프트 재작성이 아닙니다 — 그것은 `prompt-optimizer`의 역할입니다.
- 명령 수나 구성원 목록을 하드코딩하지 마세요 — 항상 실시간으로 읽으세요.
