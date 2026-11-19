# eval-quality-loop — 평가 도구를 고친 뒤 회귀를 막고 nightly 결과를 진단하는 흐름 {#eval-quality-loop-page}

평가 도구(프롬프트, grader, nightly 결과)를 고치거나 살필 때는 무엇을 바꿨느냐에 따라 스킬 셋 중 하나를 고른다. 허브는 `project-evals`가 맡는다. `gd dev` 프롬프트나 생성 로직을 바꿨으면 `dev-prompt-canary`, grader나 공용 helper를 바꿨으면 `grader-replay`, nightly 결과를 보려면 `nightly-eval-investigation`이다.[](source:eq-pe-hub)[](source:eq-dpc)[](source:eq-gr)[](source:eq-ne)

- 셋은 선택지이지 순서가 아니다. `project-evals`가 "수정할 때 쓰라"고 하는 조건부 안내이고, "그때만"이라는 제한 표현은 없다.[](source:eq-pe-hub)
- `grader-replay`와 `nightly-eval-investigation`은 같은 nightly 결과 폴더를 쓰지만 선후 관계는 없다.[](source:eq-ne-pull)[](source:eq-gr-pull)
- `nightly-eval-investigation`의 대량 모드는 `guides/` 아래 파일을 고치지 않는다. 권고는 보고서에만 쓴다.[](source:eq-ne-ro)
- `project-evals`의 8 red line은 세 스킬 모두의 검토 기준이다. 원본 저장소 파일(`src/`, `guides/`)과 외부 서비스(GCS, GitHub)는 범위 밖이다.

@answer scope="modern-web-guidance-src · 묶음 eval-quality-loop · 스킬 4개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source eq-pe title="project-evals: Stage 3와 8 red line" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source eq-pe-hub title="project-evals: 평가 도구를 고칠 때의 안내" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source eq-pe-cal title="project-evals: 생성과 검증 명령" path=modern-web-guidance-src/project-evals/SKILL.md lines=118:134
@source eq-dpc title="dev-prompt-canary: 쓰는 때와 확인 기준" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=1:14
@source eq-dpc-wt title="dev-prompt-canary: scratch worktree" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=30:42
@source eq-dpc-exp title="dev-prompt-canary: 실험 A, B1, B2" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=44:67
@source eq-gr title="grader-replay: 쓰는 때와 쓰지 않는 때" path=modern-web-guidance-src/grader-replay/SKILL.md lines=1:16
@source eq-gr-pull title="grader-replay: job 선택과 내려받기" path=modern-web-guidance-src/grader-replay/SKILL.md lines=28:38
@source eq-gr-tri title="grader-replay: 분류" path=modern-web-guidance-src/grader-replay/SKILL.md lines=63:75
@source eq-gr-rel title="grader-replay: 관련 스킬" path=modern-web-guidance-src/grader-replay/SKILL.md lines=77:81
@source eq-ne title="nightly-eval-investigation: 쓰는 때" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=1:19
@source eq-ne-ro title="nightly-eval-investigation: 읽기 전용 제약" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=21:23
@source eq-ne-pull title="nightly-eval-investigation: 내려받기" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=84:93
@source eq-ne-pb title="nightly-eval-investigation: playbook 규칙" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=105:127
@source eq-ne-pub title="nightly-eval-investigation: publish script 안내" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=152:160
@source eq-ne-inv title="investigate.ts: 내려받기 건너뛰기" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=270:293

## 무엇을 바꿨느냐에 따라 어느 스킬을 쓰나 {#flow span=12}

그림의 "무엇을 바꾸거나 보려나?" 노드는 `project-evals`의 안내 문장(136줄)을 판단 노드로 그린 것이다. 원문은 판단 노드를 두지 않고 세 조건을 나열한다(판정). 간선 라벨은 원장 관계 값과 관계 id다.[](source:eq-pe-hub)

@workflow id=loop-flow title="평가 도구를 고치거나 볼 때의 선택"
| pe | project-evals | backend |
| ch | 무엇을 바꾸거나 보려나? | backend |
| dpc | dev-prompt-canary | backend |
| gr | grader-replay | backend |
| ne | nightly-eval-investigation | backend |
| pe > ch | 판단 기준 |
| ch > dpc | gd dev 프롬프트·생성 로직 R16 | emphasis |
| ch > gr | grader·공용 helper R17 | emphasis |
| ch > ne | nightly 통과율·retrieval R18 | emphasis |
| gr > dpc | 프롬프트 검증이면 R21 | dashed |
| gr > ne | eval job 조사면 R22 | dashed |

@steps id=loop-steps
| lp-pe | project-evals | 평가 파일(`expectations.md`, `task.md`, `grader.ts`)의 판단 기준 8 red line과 작성 규칙을 정하고, 평가 도구를 고칠 때 쓸 스킬을 안내하는 허브다.[](source:eq-pe)[](source:eq-pe-hub) | loop-flow | pe |
| lp-ch | 무엇을 바꾸거나 보려나? | 에이전트가 바꾼 대상이나 보려는 것을 보고 아래 셋 중 하나를 고른다.[](source:eq-pe-hub) | loop-flow | ch |
| lp-dpc | dev-prompt-canary | `gd dev` 작성·채점 프롬프트를 고친 뒤 scratch worktree에서 `task.md`와 `grader.ts`를 일부만 다시 만들어 퇴행을 본다.[](source:eq-dpc)[](source:eq-dpc-exp) | loop-flow | dpc |
| lp-gr | grader-replay | grader나 helper를 고친 뒤 과거 nightly의 agent 결과에 다시 채점해 뒤집힌 곳을 분류한다.[](source:eq-gr)[](source:eq-gr-tri) | loop-flow | gr |
| lp-ne | nightly-eval-investigation | 최근 nightly 3종을 받아 문제 task를 표시하고 원인과 권고를 보고서로 쓴다.[](source:eq-ne)[](source:eq-ne-pb) | loop-flow | ne |

@callout level=warning title="nightly 대량 조사는 읽기 전용이다"
| `nightly-eval-investigation`의 대량 모드에서 에이전트는 `guides/` 아래 파일(task, guide, grader, expectations, demo)을 만들거나 고치거나 지우지 않는다(MUST NOT). 고칠 점은 보고서의 "Actionable Recommendations"에만 쓴다.[](source:eq-ne-ro) |
| 반대로 `grader-replay`는 분류 뒤 `grader.ts`를 고칠 수 있다. 고쳤으면 `gd dev <guide> --test-grader`와 replay를 다시 돌린다. 두 스킬의 쓰기 권한이 다르다(판정).[](source:eq-gr-tri) |

## 파일과 상태는 누가 쓰고 누가 읽나 {#shared-state span=12}

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `results/suites/nightly-*/`(`evals.json`, `agent.patch`, `*_results.json`) | `nightly-eval-investigation`(`gcloud storage rsync`로 받는다. 폴더가 이미 있으면 건너뛴다)[](source:eq-ne-pull)[](source:eq-ne-inv) | `grader-replay`(`results/suites/`와 `~/guidance-evals/`에서 가장 최근 `nightly-*`를 고른다. 없거나 낡았을 때만 받는다)[](source:eq-gr-pull), `nightly-eval-investigation` |
| `out/nightly-investigation/nightly_investigation_report.md` | `nightly-eval-investigation`[](source:eq-ne-pub) | 사용자. `publish_report.ts`는 사용자가 실행한다 |
| `guides/<카테고리>/<use-case>/`의 `task.md`, `grader.ts`, `expectations.md` | `grader-replay`(`grader.ts`를 분류 뒤 고칠 수 있다)[](source:eq-gr-tri), `dev-prompt-canary`(scratch worktree의 복사본만 다시 만든다)[](source:eq-dpc-wt) | `nightly-eval-investigation`(읽기 전용)[](source:eq-ne-pb), `project-evals`(검토) |
| `.worktrees/canary-eval`와 branch `exp/canary-eval` | `dev-prompt-canary`(만들고 마지막에 지운다)[](source:eq-dpc-wt) | `dev-prompt-canary`의 서브에이전트 3개 |

## 그림에서 뺀 관계와 범위 밖 {#omitted span=12}

| rel-id | 관계 | 종류 | 언제 | 그림 |
| --- | --- | --- | --- | --- |
| R19 | `dev-prompt-canary` → `project-evals` | 참고 | 다시 만든 `task.md`와 `grader.ts`가 `project-evals` 규칙을 지키는지가 확인 기준이다.[](source:eq-dpc) | 생략 |
| R20 | `grader-replay` → `project-evals` | 참고 | Related Skills에서 `expectations.md`, `task.md`, `grader.ts` 작성·검토 규칙의 출처로 안내한다.[](source:eq-gr-rel) | 생략 |
| R23 | `nightly-eval-investigation` → `project-evals` | 참고 | flagged task마다 prompt·guide·grader를 8 red line에 대조하는 것이 playbook의 필수 규칙이다. 단일 guide를 고칠 때도 8 red line을 먼저 본다.[](source:eq-ne-pb) | 생략 |
| R24 | `nightly-eval-investigation` → `grader-replay` | 같은 파일 | 같은 nightly 결과 폴더를 쓴다. 선후 관계는 없다.[](source:eq-ne-pull)[](source:eq-gr-pull) | 생략 |
| R25 | `nightly-eval-investigation` → `project-evals` | 같은 파일 | 대량 모드에서 `task.md`, `guide.md`, `grader.ts`, `expectations.md`를 읽기 전용으로 읽는다. 쓰기와 삭제는 금지(MUST NOT)다.[](source:eq-ne-ro)[](source:eq-ne-pb) | 위 callout |
| R37 | `nightly-eval-investigation` → `publish_report.ts` 실행(GitHub 이슈, Project 30) | 참고 | 범위 밖. 에이전트는 실행하지 않고(MUST NOT) 사용자에게 명령만 알린다.[](source:eq-ne-pub) | 범위 밖 |
| R38 | `nightly-eval-investigation`, `grader-replay` → GCS 버킷 `gs://guidance-evals/` | 참고 | 범위 밖. `gcloud storage ls`와 `rsync`로 받고 `.zip`과 `.png`는 뺀다. replay는 로컬 job이 없거나 낡았을 때만 받는다.[](source:eq-ne-pull)[](source:eq-gr-pull) | 범위 밖 |

이 묶음 밖의 관계로 `grader-replay`와 `project-coding-standards`가 모두 `pnpm run preflight`를 요구하는 것(R26, 대안)과 `project-coding-standards`와 `project-evals`가 같은 `gd dev <guide> --test-grader`를 쓰는 것(R28, 대안)이 있다. 연결을 지시한 문장은 없다.[](source:eq-gr-tri)[](source:eq-pe-cal)

## 어디까지 읽고 확인했나 {#audit span=12}

| 구분 | 확인 범위 |
| --- | --- |
| 읽은 원본 | 스킬 4개의 `SKILL.md`를 끝까지 읽었다. `replay.ts`와 `investigate.ts`, `publish_report.ts`는 개요 페이지에서 필요한 부분만 대조했다 |
| 대조 | 원장 R16~R25, R37~R38을 원문 줄과 맞춰 봤다 |
| 확인하지 못한 것 | `gd dev`, `gd eval`, `gcloud`, `gh`, 평가 harness와 GCS의 실제 내용은 이 컬렉션에 없다. 명령은 모두 지시상 동작이고 실행하지 않았다 |

각 스킬의 내부 규칙은 스킬별 개요 페이지에 있다. 이동은 컬렉션 색인이 맡는다.
