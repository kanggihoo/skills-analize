# grader-replay는 grader를 고친 뒤 과거 eval 결과로 무엇을 확인하나? {#grader-replay-page}

`grader.ts`나 채점 helper를 고치면, 과거 nightly eval에 저장된 에이전트 풀이에 오늘의 grader를 다시 돌려 결과가 뒤집힌 곳을 하나씩 분류한다. golden 보정은 풀이 3개와 `zero-passrate.patch`만 보지만, 과거 실행에는 불완전한 풀이가 많아 깨진 가정과 false positive가 드러난다.[](source:intro)

- 먼저 `gd dev <guide> --test-grader`로 보정하고, 그다음 `replay.ts`를 돌린다.[](source:calib)[](source:run)
- 결과가 뒤집힌 곳은 합격·불합격 관문이 아니라 분류할 신호다. 어긋남은 예상된 일이다.[](source:intro)
- 저장된 `grade.mjs`는 돌리지 않는다. 기준선 `*_results.json`을 덮어쓴다.[](source:nograde)
- `replay.ts`는 `DIFF`만 나오면 exit 0이고 `ERROR`가 있어야 exit 1이다. 분류 기준은 스킬이 주고, 사람 승인 지점은 원문에 명시 없음.[](source:main)[](source:triage)

@answer scope="로컬 원본 분석 · SKILL.md 81줄과 scripts/replay.ts 618줄 전체 읽음 · gd, gcloud, node, pnpm 명령과 replay.ts는 실행하지 않음 · 원본 저장소의 src/ 파일과 eval 결과는 이 컬렉션에 없어 확인하지 못함"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 스킬 본문(81줄 전체)" path=modern-web-guidance-src/grader-replay/SKILL.md
@source front title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · frontmatter" path=modern-web-guidance-src/grader-replay/SKILL.md lines=1:10
@source intro title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 도입" path=modern-web-guidance-src/grader-replay/SKILL.md lines=12:16
@source calib title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 1단계 보정" path=modern-web-guidance-src/grader-replay/SKILL.md lines=18:26
@source pull title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · job 받기" path=modern-web-guidance-src/grader-replay/SKILL.md lines=28:38
@source run title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · replay 실행 예" path=modern-web-guidance-src/grader-replay/SKILL.md lines=40:57
@source nograde title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · grade.mjs 금지" path=modern-web-guidance-src/grader-replay/SKILL.md lines=59:59
@source stack title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · Gen 2 stacking" path=modern-web-guidance-src/grader-replay/SKILL.md lines=61:61
@source triage title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 3단계 분류" path=modern-web-guidance-src/grader-replay/SKILL.md lines=63:73
@source after title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 수정 뒤 재검증" path=modern-web-guidance-src/grader-replay/SKILL.md lines=75:75
@source related title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · Related Skills" path=modern-web-guidance-src/grader-replay/SKILL.md lines=77:81
@source rp-full title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 스크립트 본문(618줄 전체)" path=modern-web-guidance-src/grader-replay/scripts/replay.ts
@source usage title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 사용법과 옵션" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=92:102
@source args title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 인자 해석" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=113:150
@source zero title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · zero-passrate 찾기" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=161:173
@source select title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 대상 grader 고르기" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=175:256
@source auto title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 자동 범위(변경된 grader)" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=230:256
@source suites title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · suite 찾기" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=258:346
@source jobs title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · replay job 모으기" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=348:391
@source specmap title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · spec 상태 비교" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=412:442
@source runjob title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · job 하나 실행" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=466:527
@source main title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · main과 종료 코드" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=529:613
@source pe-hub title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 참조 확인용 부분 읽음(136줄)" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source nei-desc title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 참조 확인용 부분 읽음(description)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=1:8
@source nei-pull title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 참조 확인용 부분 읽음(결과 받기)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=84:92
@source nei-ts title="modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts · 20833B · 참조 확인용 부분 읽음(rsync)" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=270:293
@source dpc title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 참조 확인용 부분 읽음(description)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=1:8
@source cs-pre title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 참조 확인용 부분 읽음(preflight)" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=85:100

## 언제 켜지고, 무엇을 반드시 지켜야 하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

| 조건 | 에이전트가 하는 일 |
|---|---|
| `grader.ts`, `test-fixture.ts`, `run-grader.ts`, grader가 쓰는 parser helper를 고쳤다 | 이 스킬을 쓴다.[](source:front) |
| eval job을 표시하거나 조사하려는 경우 | 쓰지 않는다. `nightly-eval-investigation`을 쓴다.[](source:front)[](source:related) |
| `gd dev` 프롬프트 생성을 검증하려는 경우 | 쓰지 않는다. `dev-prompt-canary`를 쓴다.[](source:front)[](source:related) |
| 수정한 guide마다 | 검증 중 `gd dev <guide> --test-grader`를 먼저 돌린다.[](source:calib) |

@callout level=warning title="하지 말 것 셋"
| 검증 중 `gd dev`를 `--test-grader` 없이 돌리지 않는다. write mode가 수동으로 고친 `grader.ts`를 덮어쓸 수 있다.[](source:calib) |
| job 폴더 안의 `grade.mjs`를 돌리지 않는다. 저장된 `grade.mjs`는 원래 실행자의 홈 디렉터리를 하드코딩하고, 옛 `runPlaywright` signature를 쓰며, 비교 기준인 `*_results.json`을 덮어쓴다.[](source:nograde) |
| 요구가 guide에 없거나, 그 패턴을 막았던 유효한 풀이가 없으면 검사를 추측으로 느슨하게 만들지 않는다.[](source:triage) |

범위가 다르면 `replay.ts` 옵션도 다르다. 원문은 `test-fixture.ts`, `run-grader.ts`, parser 의존성을 고칠 때 `--all`(모든 task 재생)이 필요하다고 쓴다.[](source:run)

## 어떤 순서로 실행하나? {#run}

@workflow id=replay-flow title="grader 변경 검증 순서"
| calib | golden 보정 | backend |
| fresh | job이 최신인가? | backend |
| pull | nightly 받기 | external |
| replay | replay 실행 | backend |
| classify | diff 분류 | backend |
| fix | grader를 고치나? | backend |
| edit | grader 수정 | backend |
| recheck | 재검증 | backend |
| pre | preflight | security |
| end | 종료 | external |
| calib > fresh | |
| fresh > replay | 최신 | emphasis |
| fresh > pull | 없음 또는 낡음 | dashed |
| pull > replay | |
| replay > classify | |
| classify > fix | |
| fix > edit | 예 | emphasis |
| fix > end | 아니요 | dashed |
| edit > recheck | |
| recheck > pre | |

@steps id=replay-steps
| calib-step | golden 보정 | 수정한 guide마다 `gd dev <guide> --test-grader`를 돌린다. 보정은 golden 풀이 3개와 `zero-passrate.patch`만 본다. `zero-passrate.patch`는 거의 모든 guide에서 비어 있다(손대지 않은 시작 app).[](source:intro)[](source:calib) | replay-flow | calib |
| pull-step | nightly 받기 | 로컬 job이 없거나 현재 base app보다 낡았으면 `gcloud storage rsync`로 받는다. `.zip`과 `.png`는 제외한다.[](source:pull) | replay-flow | pull |
| replay-step | replay 실행 | `replay.ts`가 `results/suites/`와 `~/guidance-evals/`에서 agent별 가장 최근 `nightly-*` job을 골라 다시 채점한다.[](source:pull)[](source:suites) | replay-flow | replay |
| classify-step | diff 분류 | `DIFF`, `PATCH_CONFLICT`, `ERROR`마다 `agent.patch`(Gen 1은 `index.html`), 수정한 `grader.ts`, `expectations.md`를 보고 분류한다.[](source:triage) | replay-flow | classify |
| edit-step | grader 수정 | 분류 결과가 실제 퇴행이면 grader를 고친다.[](source:triage) | replay-flow | edit |
| recheck-step | 재검증 | 수정했다면 `gd dev <guide> --test-grader`와 `replay.ts`를 다시 돌린다.[](source:after) | replay-flow | recheck |
| pre-step | preflight | 마지막으로 `pnpm run preflight`를 돈다.[](source:after) | replay-flow | pre |

원문에 명시 없음: grader를 고치지 않을 때의 종료 조건, 사람 승인 지점. 그림의 "종료" 노드는 이 분석이 둔 표기다.

`replay.ts`의 동작은 아래와 같다. 옵션 목록은 `--help`와 같다.[](source:usage)[](source:args)

| 옵션 | 동작 |
|---|---|
| 옵션 없음 | `origin/main...HEAD`, staged, unstaged, untracked 변경에서 `grader.ts`를 찾아 그것만 재생한다. 하나도 없으면 오류로 멈춘다.[](source:auto) |
| `--guides <목록>`과 위치 인자 | guide slug, task key, guide 경로, grader 경로로 대상을 고른다. 하나라도 맞는 것이 없으면 오류로 멈춘다.[](source:select)[](source:args) |
| `--all` | `getTaskMap()`의 모든 task를 재생한다. `--guides`와 함께 쓰면 오류다.[](source:usage)[](source:args) |
| `--suites <목록>` | job 폴더를 직접 지정한다. 지정하면 최신 nightly 필터를 거치지 않는다.[](source:suites) |
| `--limit <n>` | 만들어진 job 목록의 앞쪽 n개만 실행한다. 순서는 suite, run 번호, task, `guided`/`unguided` 순이다.[](source:jobs) |
| `--concurrency <n>` | Playwright worker 수다. 기본값은 4다.[](source:usage)[](source:args) |
| `--json` | 사람이 읽는 출력 대신 JSON만 낸다.[](source:usage) |

@facts id=replay-facts
| 자동 범위 예외 | `grader.ts` 변경이 없는데 `src/grading/` 아래 파일이 바뀌었으면 `--all` 또는 `--guides`를 쓰라는 오류로 멈춘다[](source:auto) |
| suite 고르기 | 이름이 `nightly-`로 시작하는 폴더 중 agent별로 가장 최근 것을 고른다. `nightly-` 폴더가 하나도 없으면 모든 suite를 후보로 삼는다[](source:suites) |
| agent 이름 | `suite_config.json`의 `agent`가 우선이고, 없으면 폴더 이름에서 찾는다[](source:suites) |
| job 조건 | 각 run 폴더에서 `guided`와 `unguided` 둘 다, `<slug>_results.json`이 있을 때만. `agent.patch`가 있으면 patch 모드, 없고 `index.html`이 있으면 single-file 모드[](source:jobs) |
| zero-passrate | 후보 3곳(task 폴더, base app 폴더, guide 루트) 순서로 찾고, 비어 있지 않은 파일만 쓴다. patch 모드에서만 적용한다[](source:zero)[](source:runjob) |

Gen 2 target에서는 eval이 에이전트를 부르기 전에 `zero-passrate.patch`를 적용하므로 `agent.patch`는 `base-apps/<app> + zero-passrate.patch` 위의 diff다. `runPlaywright`가 두 patch를 임시 workspace에 겹쳐 적용하고, 어느 쪽이든 적용이 실패하면 `PatchApplyError`(보고서 표기 `PATCH_CONFLICT`)를 던진다. task별 `baselineTarget`(`widely`, `newly`, `limited`)도 함께 넘긴다.[](source:stack)

## 결과가 뒤집히면 어떻게 분류하나? {#triage}

스크립트는 spec 제목마다 저장 결과와 현재 결과의 상태(`pass`, `fail`, `timedOut`, `skipped`)를 비교하고, 한쪽에만 있는 제목은 `<missing>`으로 표시한다. 상태가 하나라도 다르면 `DIFF`, 모두 같으면 `MATCH`다. `PatchApplyError`는 `PATCH_CONFLICT`, 그 밖의 오류는 `ERROR`다.[](source:specmap)[](source:runjob)

| 분류 | 신호 | 조치 |
|---|---|---|
| 실제 퇴행 | 저장 결과가 `pass -> fail`인데 그 결과물이 `guide.md`와 `expectations.md`를 정당하게 만족한다. 또는 refactor 뒤 검사가 유효한 문법을 더 못 잡는다 | 고쳐야 한다[](source:triage) |
| 의도한 수정 · `pass -> fail` | 무관한 CSS·마크업에서 통과하던 검사를 조였다 | `agent.patch`에서 저장 풀이가 요구를 빠뜨렸는지 확인한다[](source:triage) |
| 의도한 수정 · `fail -> pass` | 지나치게 엄격한 검사를 고쳤다 | `agent.patch`가 `guide.md`와 `expectations.md`를 지키는지 확인한다. 추측으로 완화하지 않는다[](source:triage) |
| timeout 흔들림 | `pass -> timedOut` 또는 `timedOut -> pass` | worker 경쟁으로 본다. 낮은 `--concurrency`로 다시 돌린다[](source:triage) |
| 제목·구조 변화 | 제목이 `saved -> <missing>`과 `<missing> -> now`로 나온다 | `main`에서 이름이 바뀌거나 합쳐진 것이다. `git log -p -n 3 -- <grader>`와 pass/fail 합계를 비교한다[](source:triage) |
| base app 변경 | `agent.patch`가 현재 `src/harness/base-apps/`나 `zero-passrate.patch`에 적용되지 않는다(`PATCH_CONFLICT`) | grader 버그가 아니다. 더 새로운 nightly job으로 다시 돌린다[](source:triage) |

`ERROR`에 해당하는 별도 분류는 원문에 명시 없음. 위 6개 중 어느 것에도 안 맞으면 어떻게 하는지도 원문에 명시 없음.

판정 · 자동 범위에는 빈틈이 있다. 원문은 공용 helper를 고치면 `--all`이 필요하다고 하지만, 스크립트는 `grader.ts` 변경이 하나도 없을 때만 `src/grading/` 변경을 보고 멈춘다. `grader.ts`도 함께 고쳤다면 옵션 없이 돌렸을 때 그 grader들만 재생하고 조용히 넘어간다. 공용 helper를 고쳤다면 직접 `--all`을 붙여야 한다.[](source:run)[](source:auto)

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="project-evals에서 이 스킬로, 다른 두 스킬로"
| before | project-evals | backend | source:pe-hub |
| current | grader-replay | backend | source:full |
| canary | dev-prompt-canary | external | source:dpc |
| nightly | nightly-eval-investigation | external | source:nei-desc |
| before > current | R17 넘김 | emphasis |
| current > canary | R21 넘김 | dashed |
| current > nightly | R22 넘김 | dashed |

@steps id=position-steps
| highlight | grader-replay | 이 페이지의 스킬이다. grader를 고쳤을 때만 오고, 프롬프트 검증과 eval 조사는 다른 스킬로 보낸다.[](source:front)[](source:related) | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R17 · 넘김(`project-evals` → 이 스킬) | `project-evals`가 기존 grader나 공용 grading helper를 고칠 때 이 스킬로 저장된 nightly 풀이를 재생하라고 안내한다. 전달물은 없다.[](source:pe-hub) |
| R21 · 넘김(이 스킬 → `dev-prompt-canary`) | `gd dev` 프롬프트 생성 검증이면 이 스킬을 쓰지 말라는 부정 조건이다. 의무 순서가 아니라 선택 경계다.[](source:front)[](source:related)[](source:dpc) |
| R22 · 넘김(이 스킬 → `nightly-eval-investigation`) | eval job을 표시하거나 조사하려면 이 스킬을 쓰지 말라는 부정 조건이다.[](source:front)[](source:related)[](source:nei-desc) |
| R20 · 참고(이 스킬 → `project-evals`) | Related Skills가 `expectations.md`, `task.md`, `grader.ts` 작성 규칙의 출처로 `project-evals`를 안내한다.[](source:related) |
| R24 · 공유 상태(`nightly-eval-investigation`과) | 같은 nightly 결과 폴더를 쓴다. nightly 쪽은 `results/suites/<폴더>`로 받고, 이 스킬은 `results/suites/`와 `~/guidance-evals/`에서 읽는다. 선후 관계는 없다.[](source:suites)[](source:nei-pull)[](source:nei-ts) |
| R26 · 같은 계열(`project-coding-standards`와) | 둘 다 마지막 검증으로 `pnpm run preflight`를 요구한다. 연결을 지시한 문장은 없다. 판정으로 둔 연결이다.[](source:after)[](source:cs-pre) |
| R38 · 참고(GCS 버킷 `gs://guidance-evals/`, 범위 밖) | 로컬 job이 없거나 낡았을 때만 `gcloud storage ls`와 `rsync`로 받는다. 버킷은 이 컬렉션 밖이다.[](source:pull) |

전체 흐름은 색인 기준 `_group-eval-quality-loop/eval-quality-loop.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/grader-replay/SKILL.md` 81줄, 5,300B와 `scripts/replay.ts` 618줄, 19,853B, 텍스트 2개를 끝까지 읽었다.[](source:full)[](source:rp-full) |
| 참조 확인용 부분 읽음 | `project-evals/SKILL.md`의 1~8, 28~48, 66~82, 118~140줄, `nightly-eval-investigation/SKILL.md`의 1~8, 28~31, 84~92줄, `investigate.ts` 268~294줄, `dev-prompt-canary/SKILL.md` description, `project-coding-standards/SKILL.md` 85~100줄. 관계 원장 R17, R20~R22, R24, R26을 대조하려고 읽었다.[](source:pe-hub)[](source:nei-pull)[](source:cs-pre) |
| 제외 | 이 폴더에는 번역본과 바이너리가 없다. |
| 부분 읽음 | 위 참조 확인용 5개 파일. 스킬 자체의 파일은 모두 전부 읽었다. |

활성화 대상 파일 4개, 부정 조건 2개, 보정 3개 + zero-passrate, `replay.ts` 옵션 6개(`--guides`, `--all`, `--suites`, `--limit`, `--concurrency`, `--json`)와 기본 concurrency 4, 상태 4종(`MATCH`, `DIFF`, `PATCH_CONFLICT`, `ERROR`), 분류 6개, 금지 3개, 종료 코드 조건을 모두 원문과 대조했다. SKILL.md의 예시 `--concurrency 6`, `--limit 12`는 예시이고 권고 값인지는 원문에 명시 없음.[](source:run)

@callout level=open-question title="확인하지 못한 부분"
| 이 컬렉션에는 원본 저장소의 `src/core/guide-validation.ts`, `src/grading/run-grader.ts`, `src/harness/config.ts`와 eval 결과가 없다. `getTaskMap`, `runPlaywright`의 동작(저장 결과를 정말 건드리지 않는지 포함)과 Gen 1/Gen 2 구분은 SKILL.md와 `replay.ts` 서술만 옮겼다. `replay.ts`가 저장 결과 파일을 읽기만 하고 새 결과를 임시 폴더에 두는 점(`testResultsDir`)은 확인했다.[](source:runjob)[](source:main) 어떤 스크립트도 실행하지 않았다. |

분석 중 원본은 수정하지 않았다. 관계 원장은 이미 확정된 것을 그대로 썼다.
