# 평가 도구를 고치거나 nightly 결과를 볼 때 어떤 스킬을 고르나? {#eval-quality-loop-page}

무엇을 바꿨는지, 무엇을 보려는지로 고른다. `gd dev` 프롬프트와 생성 로직을 고쳤으면 `dev-prompt-canary`, grader와 공용 helper를 고쳤으면 `grader-replay`, nightly 통과율과 retrieval 표시를 분류하려면 `nightly-eval-investigation`이다. 세 스킬을 가리키는 쪽은 `project-evals`다.[](source:pe-route)

- 세 스킬은 `project-evals`의 8 red line과 `task.md`·`grader.ts` 규칙을 확인 기준으로 삼는다.[](source:canary-rule)[](source:replay-rel)[](source:nightly-red)
- `nightly-eval-investigation`과 `grader-replay`는 같은 nightly 결과 폴더를 쓴다. 선후 관계는 없다.[](source:nightly-pull)[](source:replay-pull)
- 대량 nightly 조사는 읽기 전용이다. `guides/` 아래 파일을 고치면 안 된다(`MUST NOT`).[](source:nightly-ro)
- 에이전트는 `publish_report.ts`를 실행하지 않는다(`MUST NOT`). 사용자가 보고서를 확인한 뒤 직접 실행한다.[](source:nightly-publish)

@answer scope="로컬 SKILL.md 4개 · 관계 R16~R25, R37, R38 · 평가 실행 없음 · 원본 저장소의 src·guides 파일은 확인하지 못함"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source pe-stage title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(6~12행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=6:12
@source pe-files title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(14~29행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=14:29
@source pe-red title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(31~46행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source pe-calib title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(118~134행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=118:134
@source pe-route title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(136행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source canary-desc title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 관계 확인용 일부(3~8행)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=3:8
@source canary-rule title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 관계 확인용 일부(12~14행)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=12:14
@source canary-run title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 관계 확인용 일부(18~33행)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=18:33
@source canary-task title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 관계 확인용 일부(45행)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=45:45
@source replay-desc title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 관계 확인용 일부(3~16행)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=3:16
@source replay-calib title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 관계 확인용 일부(18~26행)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=18:26
@source replay-pull title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 관계 확인용 일부(28~38행)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=28:38
@source replay-triage title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 관계 확인용 일부(63~75행)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=63:75
@source replay-rel title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 관계 확인용 일부(77~81행)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=77:81
@source replay-ts title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 관계 확인용 일부(285~346행)" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=285:346
@source nightly-desc title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 관계 확인용 일부(3~19행)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=3:19
@source nightly-ro title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 관계 확인용 일부(21~23행)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=21:23
@source nightly-gcs title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 관계 확인용 일부(27~32행)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=27:32
@source nightly-pull title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 관계 확인용 일부(75~103행)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=75:103
@source nightly-red title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 관계 확인용 일부(109~127행)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=109:127
@source nightly-publish title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 관계 확인용 일부(152~164행)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=152:164
@source investigate-ts title="modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts · 20833B · 관계 확인용 일부(270~285행)" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=270:285
@source publish-ts title="modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts · 12872B · 관계 확인용 일부(40~70행)" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=40:70
@source publish-proj title="modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts · 12872B · 관계 확인용 일부(198~231행)" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=198:231
@source cs-calib title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 관계 확인용 일부(97~99행)" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=97:99

## 어떤 작업인지에 따라 어느 스킬로 가나? {#flow}

그림은 `project-evals`가 세 스킬로 넘기는 갈래다. 갈래는 순서가 아니라 선택지다. 판정 · 한 번에 여러 가지를 고쳤다면 해당하는 스킬을 모두 쓸 수 있다. 하나만 고르라는 문장은 원문에 명시 없음이다.[](source:pe-route)

@workflow id=eval-loop-flow title="평가 도구 작업에서 스킬 고르기"
| evals | project-evals | backend | source:pe-stage |
| ask | 어떤 작업인가? | backend | source:pe-route |
| canary | dev-prompt-canary | backend | source:canary-desc |
| replay | grader-replay | backend | source:replay-desc |
| nightly | nightly-eval-investigation | backend | source:nightly-desc |
| evals > ask | R16~R18 넘김 | emphasis |
| ask > canary | R16 프롬프트 | dashed |
| ask > replay | R17 grader | dashed |
| ask > nightly | R18 nightly | dashed |

@steps id=eval-loop-steps
| evals-step | project-evals | 8 red line과 `expectations.md`·`task.md`·`grader.ts` 규칙을 정하고, 아래 세 스킬을 가리킨다.[](source:pe-red)[](source:pe-route) | eval-loop-flow | evals |
| ask-step | 어떤 작업인가? | 무엇을 바꿨고 무엇을 보려는지 고른다. 이 노드는 스킬이 아니라 독자의 선택이다. | eval-loop-flow | ask |
| canary-step | dev-prompt-canary | `gd dev` 프롬프트를 고친 뒤 `task.md`와 `grader.ts`를 일부만 다시 만들어 규칙 위반을 확인한다.[](source:canary-run) | eval-loop-flow | canary |
| replay-step | grader-replay | grader를 고친 뒤 과거 nightly의 agent 결과에 다시 채점해 뒤집힌 결과를 분류한다.[](source:replay-desc)[](source:replay-triage) | eval-loop-flow | replay |
| nightly-step | nightly-eval-investigation | 최근 nightly 3종을 내려받아 문제 task를 표시하고 원인과 권고를 보고서로 쓴다.[](source:nightly-desc)[](source:nightly-pull) | eval-loop-flow | nightly |

## 스킬 사이에 무엇을 주고받나? {#relations}

원장의 관계 R16~R25와 범위 밖 R37·R38을 적었다. 이 묶음 밖 스킬과 이어진 R26, R28은 `_group-repo-upkeep/repo-upkeep.html` 표에 있다. `종류`와 `조건`은 원장과 같다.

| rel-id · 종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R16 · 넘김 | `project-evals` → `dev-prompt-canary`. `src/authoring/dev-prompts.ts`, `dev.ts`, `generate-grader.ts`를 고칠 때 이 스킬로 canary suite에 대해 프롬프트 변경을 검증하라고 쓴다.[](source:pe-route)[](source:canary-desc) | 표시 |
| R17 · 넘김 | `project-evals` → `grader-replay`. 기존 grader나 공용 grading helper를 고칠 때 저장된 nightly 해답을 replay해 check 뒤집힘을 확인하라고 쓴다.[](source:pe-route)[](source:replay-desc) | 표시 |
| R18 · 넘김 | `project-evals` → `nightly-eval-investigation`. 여러 nightly에 걸친 통과율과 retrieval 표시를 분류할 때 쓰라고 쓴다.[](source:pe-route)[](source:nightly-desc) | 표시 |
| R19 · 참고 | `dev-prompt-canary` → `project-evals`. 다시 만든 `task.md`와 `grader.ts`가 `project-evals`의 규칙을 지키는지가 확인 기준이다. 실험 A는 `task.md`를 `project-evals`의 `task.md` 규칙에 대조한다.[](source:canary-rule)[](source:canary-task) | 생략 |
| R20 · 참고 | `grader-replay` → `project-evals`. Related Skills 목록에서 expectations·task·grader 작성 규칙의 출처로 안내한다.[](source:replay-rel) | 생략 |
| R21 · 넘김 | `grader-replay` → `dev-prompt-canary`. `gd dev` 프롬프트 생성을 검증하려는 경우는 `grader-replay`를 쓰지 말고 `dev-prompt-canary`를 쓰라고 쓴다(description의 부정 조건과 Related Skills).[](source:replay-desc)[](source:replay-rel) | 생략 |
| R22 · 넘김 | `grader-replay` → `nightly-eval-investigation`. eval job을 표시하거나 조사하려는 경우는 `grader-replay`를 쓰지 말고 `nightly-eval-investigation`을 쓰라고 쓴다.[](source:replay-desc)[](source:replay-rel) | 생략 |
| R23 · 참고 | `nightly-eval-investigation` → `project-evals`. 대량 조사 모드에서는 `guides/` 파일을 고치지 않고 보고서에만 권고를 쓴다. 단일 guide를 로컬에서 진단·수정할 때는 8 red line을 먼저 확인하고 guide를 grader에 맞춰 고치지 않는다. flagged task마다 prompt·guide·grader를 8 red line에 대조하는 것이 playbook의 필수 규칙이다.[](source:nightly-ro)[](source:nightly-red) | 생략 |
| R24 · 공유 상태 | `nightly-eval-investigation`과 `grader-replay`가 같은 nightly 결과 폴더를 쓴다. 선후 관계는 없다. 자세한 내용은 아래 상태 표다.[](source:nightly-pull)[](source:replay-pull) | 생략, 상태 표 |
| R25 · 공유 상태 | `nightly-eval-investigation`이 대량 모드에서 `guides/<카테고리>/<use-case>/`의 `task.md`, `guide.md`, `grader.ts`, `expectations.md`를 읽기 전용으로 읽는다. 쓰기와 삭제는 금지(`MUST NOT`)다.[](source:nightly-ro)[](source:nightly-red) | 생략, 상태 표와 callout |
| R37 · 참고 | `nightly-eval-investigation` → `publish_report.ts` 실행(GitHub 이슈와 GoogleChrome Project 30). 에이전트가 이 스크립트를 실행하면 안 된다(`MUST NOT`). 보고서가 끝나면 사용자에게 명령만 알리고, 사용자가 보고서를 확인한 뒤 직접 실행한다. 스크립트는 부모 이슈와 하위 이슈를 만들고, 스크립트 코드상 하위 이슈를 Project 30에 올리며 Status를 `needs-investigation`으로 바꾼다.[](source:nightly-publish)[](source:publish-ts)[](source:publish-proj) | 생략, 아래 외부 표 |
| R38 · 참고 | `nightly-eval-investigation`과 `grader-replay` → GCS 버킷 `gs://guidance-evals/`. nightly 결과를 `gcloud storage ls`와 `rsync`로 받는다. 용량을 줄이려고 `.zip`과 `.png`는 제외한다. replay는 로컬 job이 없거나 낡았을 때만 받는다.[](source:nightly-pull)[](source:replay-pull) | 생략, 아래 외부 표 |

판정 · R16~R18은 "이때만 쓰라"는 제한이 아니다. `project-evals`는 "If you modify X, use Y" 형식으로 조건부로 가리킬 뿐이고, 다른 경우를 막는 문장은 없다.[](source:pe-route) 쓰지 말라는 부정 조건은 `grader-replay`가 R21·R22에서 스스로 적는다.[](source:replay-desc)

## 어떤 파일과 상태를 같이 쓰나? {#state}

| 파일·상태 | 쓰는 스킬 · 주체 | 읽는 스킬 · 조건 |
|---|---|---|
| `results/suites/nightly-*/`(`evals.json`, `agent.patch`, `*_results.json`) (R24) | `nightly-eval-investigation`이 `gcloud storage rsync`로 `results/suites/<폴더>`에 내려받는다. 같은 이름의 폴더가 이미 있으면 내려받지 않는다.[](source:nightly-pull)[](source:investigate-ts) | `grader-replay`가 `results/suites/`와 `~/guidance-evals/`에서 agent별로 가장 최근 `nightly-*` job을 골라 읽는다. 로컬 job이 없거나 낡았을 때만 직접 받는다.[](source:replay-pull)[](source:replay-ts) |
| `guides/<카테고리>/<use-case>/`의 `task.md`, `guide.md`, `grader.ts`, `expectations.md` (R25) | 쓰기 규칙은 `project-evals`가 정한다. 대량 nightly 조사에서는 쓰기·삭제가 모두 금지다.[](source:pe-files)[](source:nightly-ro) | `nightly-eval-investigation`이 flagged task마다 읽는다. 읽기 전용이다.[](source:nightly-red) |
| `targets/<app>/`의 `task.md`, `grader.ts` (R19) | `dev-prompt-canary`가 격리 worktree 안에서 지우고 다시 만든다. 실제 `guides/`는 고치지 않는다.[](source:canary-run) | 다시 만든 파일을 `project-evals` 규칙에 대조한다.[](source:canary-rule) |
| `out/nightly-investigation/nightly_investigation_report.md`, `flagged_tasks_context.json` (R37) | `nightly-eval-investigation`의 스크립트와 에이전트가 쓴다.[](source:nightly-pull) | 사용자가 확인한 뒤 `publish_report.ts`가 읽는다.[](source:nightly-publish)[](source:publish-ts) |

@callout level=warning title="대량 nightly 조사는 읽기 전용이다"
| `nightly-eval-investigation`의 대량 모드는 진단과 권고만 한다. 에이전트는 `guides/` 아래 task, guide, grader, expectations, demo를 만들거나 고치거나 지우면 안 된다(`MUST NOT`). 권고는 보고서의 "Actionable Recommendations" 절에만 쓴다.[](source:nightly-ro) |
| 단일 guide를 로컬에서 진단하고 고치라는 요청을 받은 경우만 예외다. 그때도 8 red line을 먼저 확인하고 guide를 grader에 맞춰 고치지 않는다.[](source:nightly-ro) |

외부 서비스와 사용자 개입을 표로 남긴다.

| 대상 | 누가 어떻게 접근하나 | 사용자 개입 |
|---|---|---|
| GCS 버킷 `gs://guidance-evals/` (R38) | `gcloud storage ls`와 `rsync`로 받는다. `.zip`, `.png`는 제외한다.[](source:nightly-gcs)[](source:nightly-pull) | 원문에 명시 없음 |
| GitHub 이슈와 GoogleChrome Project 30 (R37) | `publish_report.ts`가 `gh issue create`로 부모 이슈를 만든다. 지시상 동작이다.[](source:publish-ts) | 사용자가 보고서를 확인한 뒤 직접 실행한다. 에이전트는 실행하지 않는다.[](source:nightly-publish) |

## 어디까지 대조했고 무엇이 남았나? {#audit-panel}

이 페이지는 묶음 스킬 4개의 SKILL.md에서 관계와 조건이 나온 줄을 다시 읽어 원장 R16~R25, R37, R38과 대조했다. 보조로 `replay.ts` 285~346행, `investigate.ts` 270~285행, `publish_report.ts` 40~70행과 198~231행을 읽었다.

관계 12개(R16~R25, R37, R38)를 모두 원문과 대조했다. 번역본은 이 컬렉션에 없어 열지 않았다. 구조·표본만 읽은 파일은 이 페이지에서 0개다. 스킬 내부 규칙은 스킬 페이지에서 다룬다.

@callout level=open-question title="미확인 범위"
| 본문 속 `gd`, `gcloud`, `gh`, `git worktree` 명령과 `.ts` 스크립트는 읽기만 했고 실행하지 않았다. 상태와 결과는 지시상 동작으로만 적었다.[](source:canary-run)[](source:nightly-pull) |
| `src/`, `guides/`, `docs/`와 GCS 버킷, GitHub Project 30은 이 저장소에 없어 확인하지 못했다. |
| `project-coding-standards`와 R26, R28 같은 계열 관계는 직접 호출 지시가 없는 추론이라 이 흐름에 그리지 않았다.[](source:cs-calib) |

자동 검증은 HTML 구조와 출처 해석을 확인한다. 실제 효과와 독자의 이해는 별도로 확인해야 한다. 사람 검토는 미실시다.
