# grader-replay — grader 변경 뒤 과거 nightly 결과에 다시 채점해 뒤집힌 곳을 분류 {#overview}

`grader-replay`는 에이전트가 `grader.ts`나 공용 helper를 고친 뒤, 과거 nightly 평가에 저장된 agent 해답에 오늘의 grader를 다시 돌려 결과가 바뀐 곳(`DIFF`, `PATCH_CONFLICT`, `ERROR`)을 원인별로 분류하게 하는 스킬이다.[](source:gr-front)[](source:gr-why)

- 쓰는 때: `grader.ts`, `test-fixture.ts`, `run-grader.ts`, grader가 쓰는 parser helper를 고칠 때다.[](source:gr-front)
- 결과: 바뀐 결과마다 진짜 퇴행, 의도한 grader 수정, timeout, 이름 변경, base app 변화 중 하나로 분류한 판정이다. 자동 통과·실패 기준은 아니다.[](source:gr-why)[](source:gr-triage)
- 다른 스킬과의 관계: `gd dev` 프롬프트 검증은 `dev-prompt-canary`로, eval job 조사는 `nightly-eval-investigation`으로 넘긴다(다음 안내). 작성 규칙은 `project-evals`를 참고한다(참고).[](source:gr-front)[](source:gr-rel)
- 하지 않는 것: 검증 중에 `--test-grader` 없이 `gd dev`를 돌리지 않고, job 폴더 안의 `grade.mjs`를 실행하지 않는다.[](source:gr-calib)[](source:gr-why2)

@answer scope="modern-web-guidance-src/grader-replay · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source gr-front title="이름과 description" path=modern-web-guidance-src/grader-replay/SKILL.md lines=1:10
@source gr-why title="replay를 쓰는 이유" path=modern-web-guidance-src/grader-replay/SKILL.md lines=12:16
@source gr-calib title="1단계 calibration" path=modern-web-guidance-src/grader-replay/SKILL.md lines=18:26
@source gr-pull title="2단계 job 확인과 내려받기" path=modern-web-guidance-src/grader-replay/SKILL.md lines=28:38
@source gr-run title="replay 실행 옵션" path=modern-web-guidance-src/grader-replay/SKILL.md lines=40:57
@source gr-why2 title="grade.mjs를 쓰지 않는 이유와 stacking" path=modern-web-guidance-src/grader-replay/SKILL.md lines=59:61
@source gr-triage title="3단계 분류" path=modern-web-guidance-src/grader-replay/SKILL.md lines=63:75
@source gr-rel title="관련 스킬" path=modern-web-guidance-src/grader-replay/SKILL.md lines=77:81
@source gr-opts title="replay.ts의 옵션 도움말" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=96:102
@source gr-scope title="replay.ts의 기본 범위 선택" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=228:253
@source gr-combo title="replay.ts의 옵션 조합 검사" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=137:140
@source gr-night title="replay.ts의 nightly job 선택" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=331:336
@source gr-conf title="replay.ts의 PATCH_CONFLICT 처리" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=515:520
@source pe-hub title="project-evals의 연결 안내" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source ne-front title="nightly-eval-investigation 이름과 description" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=1:8
@source ne-sync title="nightly-eval-investigation의 내려받기" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=84:91
@source dpc-front title="dev-prompt-canary 이름과 description" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=1:8
@source cs-gate title="project-coding-standards의 preflight" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=87:89

## 어떻게 동작하나 {#flow span=12}

원문은 1~3단계를 번호로 지시한다. 분류 뒤 grader를 고쳤으면 calibration과 replay를 다시 돌리고 `pnpm run preflight`로 끝낸다. 이 되돌림은 3단계 마지막 문장에 있어 그림에 간선으로 그렸다.[](source:gr-triage)

@workflow id=flow-diagram title="grader-replay 흐름"
| lane calib | 1 calibration |
| lane replay | 2 replay |
| lane triage | 3 분류 |
| calib | grader calibration | backend | calib | source:gr-calib |
| stale | 로컬 job이 없거나 낡았나? | backend | replay | source:gr-pull |
| pull | nightly 내려받기 | external | replay | source:gr-pull |
| replay | replay 실행 | backend | replay | source:gr-run |
| triage | 차이 분류 | backend | triage | source:gr-triage |
| edit | grader 고쳤나? | backend | triage | source:gr-triage |
| calib > stale | |
| stale > pull | 예 |
| stale > replay | 아니오 |
| pull > replay | |
| replay > triage | |
| triage > edit | |
| edit > calib | 예, 다시 |

@steps id=flow-steps
| s-calib | grader calibration | **입력** 고친 guide · **실행** `gd dev <guide> --test-grader` · **출력** golden patch 3개와 `zero-passrate.patch`에 대한 채점 결과. **처리** 에이전트가 고친 guide마다 잠긴 해답에 대한 calibration을 먼저 돌린다.[](source:gr-calib) **다음** 검증 중에는 `--test-grader` 없이 `gd dev`를 돌리지 않는다. write mode가 손으로 고친 `grader.ts`를 덮어쓸 수 있어서다(Never). | flow-diagram | calib |
| s-stale | 로컬 job이 없거나 낡았나? | **입력** `results/suites/`와 `~/guidance-evals/`의 job 폴더 · **참조** `suite_config.json` · **출력** 쓸 job 여부. **처리** `scripts/replay.ts`가 agent마다 가장 최근 `nightly-*` job을 고르므로 에이전트는 그 job이 있는지, 현재 base app보다 뒤처지지 않았는지 본다.[](source:gr-pull)[](source:gr-night) | flow-diagram | stale |
| s-pull | nightly 내려받기 | **입력** 최근 nightly의 suite id · **실행** `gcloud storage ls gs://guidance-evals/`, `gcloud storage rsync gs://guidance-evals/<suite_id> ~/guidance-evals/<suite_id> --recursive --exclude ".*\.zip$\|.*\.png$"` · **출력** 로컬 suite 폴더. **처리** 에이전트가 trace archive와 screenshot은 빼고 최근 nightly를 받는다.[](source:gr-pull) | flow-diagram | pull |
| s-replay | replay 실행 | **입력** 로컬 nightly job과 고친 grader · **참조** `scripts/replay.ts` · **실행** `node .agents/skills/grader-replay/scripts/replay.ts [--guides <목록>] [--all --concurrency 6] [--suites <목록> --limit <n> --json]` · **출력** run마다 `MATCH`, `DIFF`, `PATCH_CONFLICT`, `ERROR` 상태. **처리** script가 저장된 `agent.patch`에 오늘의 grader를 다시 채점해 저장된 결과와 비교한다. → 내부: `replay.ts`(코드 확인)[](source:gr-run)[](source:gr-opts) **다음** 옵션이 없으면 `origin/main` 대비 바뀐 grader로 범위를 정한다. `test-fixture.ts`, `run-grader.ts`, parser 의존성을 고쳤다면 `--all`이 필요하다.[](source:gr-scope) | flow-diagram | replay |
| s-triage | 차이 분류 | **입력** `DIFF`, `PATCH_CONFLICT`, `ERROR` 결과 · **참조** 저장된 `agent.patch`(Gen 1은 `index.html`), 고친 `grader.ts`, `expectations.md` · **출력** 차이마다 분류. **처리** 에이전트가 다섯 분류(진짜 퇴행, 의도한 grader 수정, timeout, 이름·구조 변화, base app 변화)로 가른다.[](source:gr-triage) **다음** 진짜 퇴행은 고쳐야 한다. `PATCH_CONFLICT`는 grader 버그가 아니므로 더 새 nightly로 다시 돌린다. **상세** 아직 없음 | flow-diagram | triage |
| s-edit | grader 고쳤나? | **입력** 분류 결과 · **출력** 고친 `grader.ts`나 종료. **처리** 분류 뒤 `grader.ts`를 고쳤으면 `gd dev <guide> --test-grader`와 `scripts/replay.ts`를 다시 돌리고 `pnpm run preflight`로 끝낸다.[](source:gr-triage) | flow-diagram | edit |

replay는 오늘의 grader를 어제의 저장 출력에 적용하므로 전후 불일치는 예상된 일이다. 불일치는 분류할 신호이지 자동 통과·실패 기준이 아니다.[](source:gr-why)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다. description은 두 경우에 쓰지 말라고 한다[](source:gr-front) |
| 성격 | calibration, 재채점, 분류를 순서대로 하는 절차형 검증 스킬 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-evals` {#r17} | **이 스킬** | 다음 안내 | 기존 grader나 공용 grading helper를 고칠 때 쓰라고 한다. "그때만"이라는 제한 표현은 없다.[](source:pe-hub)[](source:gr-front) |
| **이 스킬** {#r20} | `project-evals` | 참고 | Related Skills에서 `expectations.md`, `task.md`, `grader.ts` 작성·검토 규칙의 출처로 안내한다.[](source:gr-rel) |
| **이 스킬** {#r21} | `dev-prompt-canary` | 다음 안내 | `gd dev` 프롬프트 생성을 검증하려는 경우는 이 스킬을 쓰지 말고 `dev-prompt-canary`를 쓰라고 한다.[](source:gr-front)[](source:gr-rel) |
| **이 스킬** {#r22} | `nightly-eval-investigation` | 다음 안내 | eval job을 표시하거나 조사하려는 경우는 이 스킬을 쓰지 말고 `nightly-eval-investigation`을 쓰라고 한다.[](source:gr-front)[](source:gr-rel) |
| `nightly-eval-investigation` {#r24} | **이 스킬** | 같은 파일 | 같은 nightly 결과 폴더(`results/suites/nightly-*/`)를 쓴다. 선후 관계는 없다. nightly 쪽은 `results/suites/<폴더>`에 받고, replay는 두 곳에서 가장 최근 `nightly-*` job을 고른다.[](source:ne-sync)[](source:gr-pull) |
| **이 스킬** {#r26} | `project-coding-standards` | 대안 | 둘 다 마지막 검증으로 `pnpm run preflight`를 요구하고 `gd dev <guide> --test-grader`를 쓴다. 연결을 지시한 문장은 없다.[](source:gr-calib)[](source:gr-triage)[](source:cs-gate) |
| **이 스킬** {#r38} | GCS 버킷 `gs://guidance-evals/` | 참고 | nightly 결과를 `gcloud storage ls`와 `rsync`로 받는다. 로컬 job이 없거나 낡았을 때만 받는다. 범위 밖이다.[](source:gr-pull) |

@architecture id=relation-map title="grader-replay와 이어지는 스킬"
| pe | project-evals | backend |
| self | grader-replay(이 스킬) | backend |
| dpc | dev-prompt-canary | backend |
| ne | nightly-eval-investigation | backend |
| cs | project-coding-standards | backend |
| pe > self | 다음 안내 |
| self > pe | 참고 |
| self > dpc | 다음 안내 |
| self > ne | 다음 안내 |
| ne > self | 같은 파일 | dashed |
| self > cs | 대안 | dashed |

@code source=gr-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 3단계 절차, replay 옵션, 분류 기준, 관련 스킬을 담는다 | 스킬이 켜질 때 읽는다 | grader calibration, 로컬 job이 없거나 낡았나?, nightly 내려받기, replay 실행, 차이 분류, grader 고쳤나? |
| `scripts/replay.ts` | 저장된 해답에 grader를 다시 돌려 결과를 비교하는 script다 | 2단계에서 에이전트가 `node`로 실행한다 | replay 실행 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 검증 중 `gd dev` 실행 | `--test-grader`를 반드시 붙인다. 없으면 write mode가 손으로 고친 `grader.ts`를 덮어쓸 수 있다(Never) | [](source:gr-calib) |
| job 폴더 안의 `grade.mjs` | 실행하지 않는다. 원래 runner의 home 경로가 박혀 있고, 옛 `runPlaywright` 시그니처를 쓰며, 비교할 저장 `*_results.json`을 덮어쓴다 | [](source:gr-why2) |
| 저장된 `pass -> fail`이 `guide.md`와 `expectations.md`를 만족한다 | 진짜 퇴행이다. 고쳐야 한다 | [](source:gr-triage) |
| guide가 허용하지 않는 패턴이거나 그것 때문에 실패한 valid 해답이 없다 | check를 추측으로 느슨하게 하지 않는다 | [](source:gr-triage) |
| `timedOut`이 낀 변화 | grader 변경이 아니라 worker 경합이다. 더 낮은 `--concurrency`로 다시 돌린다 | [](source:gr-triage) |
| `PATCH_CONFLICT` | grader 버그가 아니다. 더 새 nightly를 받아 다시 돌린다. `zero-passrate.patch`와 `agent.patch` 중 하나라도 적용에 실패하면 `PatchApplyError`로 난다 | [](source:gr-triage)[](source:gr-why2) |
| `--all`과 `--guides`를 함께 쓴다 | script가 오류로 막는다. `grader.ts` 변경이 없고 `--guides`나 `--all`도 없으면 오류로 끝난다 | [](source:gr-combo)[](source:gr-scope) |
| 사용자 승인 | 원문에 명시 없음 | [](source:gr-why) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 분류 다섯 가지의 판정 기준 — 차이 분류 · 개요에는 이름과 핵심 조건만 담았다. 각 분류의 확인 방법은 상세로 남긴다.
- `replay.ts` 옵션과 범위 선택 — replay 실행 · 개요에는 옵션 이름과 기본 범위만 담았다.

@callout level=open-question title="확인하지 못한 것"
| `gd dev`, `gcloud`, `runPlaywright`, `src/harness/base-apps/`와 `suite_config.json`은 이 컬렉션에 없어 동작을 확인하지 못했다. `scripts/replay.ts`는 618줄 중 옵션, 범위 선택, nightly 선택, 충돌 처리 부분만 대조했다. 명령은 모두 지시상 동작이고 실행하지 않았다. |

읽은 원본: 텍스트 파일 2개. 제외: 없음. `replay.ts`는 필요한 부분만 읽었다.
