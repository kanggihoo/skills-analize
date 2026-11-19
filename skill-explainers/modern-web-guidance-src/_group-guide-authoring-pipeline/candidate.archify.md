# guide-authoring-pipeline — 새 web 기능을 guidance와 평가 기준까지 완성하는 흐름 {#guide-authoring-pipeline-page}

새로 나온 web 기능 하나를 guidance와 평가 기준까지 만드는 일은 스킬 7개가 나눠 맡는다. 이슈 분류(`project-features`), use case 정하기(`project-use-cases`), guide 쓰기(`project-guides`), 자체 검증(`project-guide-validation`), 평가 기준(`project-evals`)이 단계이고, `project-discipline-guides`와 `baseline-status`는 곁가지다.[](source:ga-pf)[](source:ga-uc)[](source:ga-pg)[](source:ga-gv)[](source:ga-pe)

- 순서는 이슈 분류, use case, guide 쓰기 순이다. use case와 guide 쓰기 사이에는 Content ATL의 사람 승인이 있다. 온보딩된 Peer는 use case 단계를 건너뛰고 guide 쓰기로 바로 갈 수 있다.[](source:ga-uc-gov)[](source:ga-uc-ask)
- 자체 검증(`project-guide-validation`)은 Stage 2 끝에 권하는 단계이고 사람 SME 검토를 대체하지 않는다.[](source:ga-pg-self)[](source:ga-gv-sme)
- `project-evals`는 guide를 grader에 맞춰 고치지 않는다는 규칙으로 앞 단계와 이어진다. Stage 3 파일은 `gd dev`가 만든다.[](source:ga-pg-agent)[](source:ga-pe-own)
- 이 묶음의 스킬은 모두 원본 저장소의 `guides/`, `src/`, `docs/`, `GOVERNANCE.md`를 전제한다. 이 컬렉션에는 그 파일이 없어 그 관계는 범위 밖이다.

@answer scope="modern-web-guidance-src · 묶음 guide-authoring-pipeline · 스킬 7개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source ga-pf title="project-features: 이슈 분류와 자동화" path=modern-web-guidance-src/project-features/SKILL.md lines=8:21
@source ga-pf-id title="project-features: ID 하나 정하기" path=modern-web-guidance-src/project-features/SKILL.md lines=65:73
@source ga-pf-after title="project-features: 분류 뒤 pipeline" path=modern-web-guidance-src/project-features/SKILL.md lines=113:121
@source ga-pf-sync title="project-features: sync와 checklist" path=modern-web-guidance-src/project-features/SKILL.md lines=109:111
@source ga-uc title="project-use-cases: Stage 1 목표" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=6:12
@source ga-uc-gov title="project-use-cases: 권한과 fast-track" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=14:14
@source ga-uc-stub title="project-use-cases: guide.md 틀" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=78:98
@source ga-uc-ask title="project-use-cases: 승인 요청" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=104:108
@source ga-uc-dg title="project-use-cases: 허브 guide 안내" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=31:31
@source ga-pg title="project-guides: Stage 2 소개" path=modern-web-guidance-src/project-guides/SKILL.md lines=6:14
@source ga-pg-agent title="project-guides: 에이전트가 보는 파일과 Stage 3" path=modern-web-guidance-src/project-guides/SKILL.md lines=16:32
@source ga-pg-exp title="project-guides: expectations.md" path=modern-web-guidance-src/project-guides/SKILL.md lines=148:159
@source ga-pg-self title="project-guides: 자체 검증" path=modern-web-guidance-src/project-guides/SKILL.md lines=166:168
@source ga-gv title="project-guide-validation: 소개" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=6:8
@source ga-gv-sme title="project-guide-validation: 사람 SME" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=10:10
@source ga-gv-qual title="project-guide-validation: 정성 검토" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=32:42
@source ga-gv-align title="project-guide-validation: expectation 정렬" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=44:46
@source ga-gv-base title="project-guide-validation: baseline 조회" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=77:80
@source ga-pe title="project-evals: Stage 3" path=modern-web-guidance-src/project-evals/SKILL.md lines=6:12
@source ga-pe-red title="project-evals: 8 red line" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source ga-pe-own title="project-evals: 소유권" path=modern-web-guidance-src/project-evals/SKILL.md lines=48:50
@source ga-pe-exp title="project-evals: expectations 안내" path=modern-web-guidance-src/project-evals/SKILL.md lines=52:58
@source ga-dg title="project-discipline-guides: discipline guide 정의" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=8:14
@source ga-dg-filter title="project-discipline-guides: inverse filter" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=37:49
@source ga-bs title="baseline-status: 쓰는 때와 상태 해석" path=modern-web-guidance-src/baseline-status/SKILL.md lines=8:32

## 스킬들은 어떤 순서와 갈래로 이어지나 {#flow span=12}

그림의 간선 라벨은 원장 관계 값과 관계 id다. 그림에서 뺀 관계(R02, R07~R10, R13~R15)는 아래 표에 있다. 승인 노드는 `project-use-cases`의 6단계(승인 요청)와 승인 뒤 Stage 2 안내를 합쳐 그린 것이다.[](source:ga-uc-ask)

@workflow id=pipeline-flow title="guide 작성 흐름"
| lane stage0 | 0 이슈 분류 |
| lane stage1 | 1 use case |
| lane stage2 | 2 guide 작성과 검증 |
| lane stage3 | 3 평가 |
| pf | project-features | backend | stage0 | source:ga-pf |
| uc | project-use-cases | backend | stage1 | source:ga-uc |
| atl | Content ATL 승인 | security | stage1 | source:ga-uc-ask |
| pg | project-guides | backend | stage2 | source:ga-pg |
| gv | project-guide-validation | backend | stage2 | source:ga-gv |
| dg | project-discipline-guides | backend | stage2 | source:ga-dg |
| bs | baseline-status | backend | stage2 | source:ga-bs |
| pe | project-evals | backend | stage3 | source:ga-pe |
| pf > uc | 다음 안내 R01 | emphasis |
| uc > atl | 승인 요청 |
| atl > pg | 다음 안내 R03 | emphasis |
| pg > gv | 다음 안내 R05 | emphasis |
| pg > pe | 다음 안내 R06 | emphasis |
| uc > dg | 참고 R04 | dashed |
| gv > dg | 참고 R11 | dashed |
| gv > bs | 참고 R12 | dashed |

@steps id=pipeline-steps
| st-pf | project-features | `new-feature` 이슈가 guidance 대상인지 가려 내고 web-feature ID를 하나로 정한다.[](source:ga-pf)[](source:ga-pf-id) | pipeline-flow | pf |
| st-uc | project-use-cases | web 기능 하나를 use case 2~5개로 풀고 guide ID와 `guide.md` 틀을 만든다.[](source:ga-uc)[](source:ga-uc-stub) | pipeline-flow | uc |
| st-atl | Content ATL 승인 | category의 Content ATL이 PR이나 new-use-case 이슈를 검토해 승인한다. 사람 승인이다.[](source:ga-uc-ask) | pipeline-flow | atl |
| st-pg | project-guides | 자체 완결된 `guide.md`와 `demo.html`, `expectations.md`를 쓴다.[](source:ga-pg-agent)[](source:ga-pg-exp) | pipeline-flow | pg |
| st-gv | project-guide-validation | 세 파일을 DevTools MCP와 체크리스트로 검증하고 피드백 보고서를 낸다.[](source:ga-gv)[](source:ga-gv-qual) | pipeline-flow | gv |
| st-dg | project-discipline-guides | 분야 전체 guide에서 모델이 이미 아는 내용을 mirror와 비교해 걷어 낸다.[](source:ga-dg-filter) | pipeline-flow | dg |
| st-bs | baseline-status | 기능의 browser 지원과 Baseline 상태를 `pnpm baselinestatus`로 조회한다.[](source:ga-bs) | pipeline-flow | bs |
| st-pe | project-evals | `expectations.md`, `task.md`, `grader.ts`를 8 red line으로 쓰고 검토한다.[](source:ga-pe-red) | pipeline-flow | pe |

## 파일은 누가 쓰고 누가 읽나 {#shared-state span=12}

단계 사이에서 주고받는 것은 대부분 같은 파일이다. 아래 표는 원장의 관계(R01, R03, R05, R06, R13, R14, R15)와 각 스킬 본문에서 확인한 것이다.

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `guides/<category>/<guide-id>/guide.md` | `project-use-cases`(틀, Stage 1)[](source:ga-uc-stub), `project-guides`(본문, Stage 2)[](source:ga-pg-agent), `project-discipline-guides`(discipline guide를 줄임)[](source:ga-dg-filter) | `project-guide-validation`(검증)[](source:ga-gv-qual), `project-evals`(grader와 대조)[](source:ga-pe-red) |
| `expectations.md` | `project-guides`(SME 소유, 쓰기)[](source:ga-pg-exp) | `project-guide-validation`(정렬 검토)[](source:ga-gv-align), `project-evals`(`grader.ts` 테스트와 1:1 검토)[](source:ga-pe-exp) |
| `demo.html` | `project-guides` | `project-guide-validation`(DevTools MCP로 실행) |
| `task.md`, golden patch, `grader.ts` | `gd dev`(Stage 3에서 생성). 사람은 손볼 수 있고 에이전트는 사람이 시킬 때만 손본다[](source:ga-pg-agent) | `project-evals`(검토) |
| `new-feature` 이슈와 use-case checklist | `project-features`(이슈), sync(`src/ci/sync-use-cases.ts`)가 checklist를 다시 쓰고 이슈를 닫는다. 범위 밖이고 지시상 동작이다[](source:ga-pf-sync) | `project-use-cases`(web-feature ID로 이어진다)[](source:ga-pf-after) |

## 그림에서 뺀 관계와 범위 밖 {#omitted span=12}

| rel-id | 관계 | 종류 | 언제 | 그림 |
| --- | --- | --- | --- | --- |
| R02 | `project-features` → `project-guides` | 참고 | use-case 이슈가 닫히는 때(non-draft guidance와 `expectations.md`가 `main`에 오른 때)를 설명하며 `project-guides`를 보라고만 안내한다.[](source:ga-pf-after) | 생략 |
| R07 | `project-evals` → `project-guides` | 참고 | `expectations.md` 작성 규칙은 `project-guides`에 있다고 안내하고 Stage 3에는 grader 규칙만 더한다.[](source:ga-pe-exp) | 생략 |
| R08 | `project-guide-validation` → `project-guides` | 참고 | 정성 검토와 expectation 정렬의 기준 문서다.[](source:ga-gv-qual) | 생략 |
| R09 | `project-guide-validation` → `project-use-cases` | 참고 | guide를 두 스킬의 작성 기준에 대조하라고 한다.[](source:ga-gv-qual) | 생략 |
| R10 | `project-guide-validation` → `project-evals` | 참고 | expectation 검토 때 8 red line을 따른다. SME 문구는 의미가 바뀔 때만 고치고 이유를 적는다.[](source:ga-gv-align) | 생략 |
| R13 | `project-use-cases` → `project-guides` | 같은 파일 | 같은 `guide.md`를 틀로 만들고(Stage 1) 나중에 본문으로 채운다(Stage 2). 선후는 R03이다.[](source:ga-uc-stub)[](source:ga-pg-agent) | 생략 |
| R14 | `project-guides` → `project-evals` | 같은 파일 | `expectations.md`는 SME가 소유한다. `project-guides`가 쓰고 `project-evals`가 `grader.ts`와 1:1로 대응시켜 검토한다.[](source:ga-pg-exp)[](source:ga-pe-exp) | 생략 |
| R15 | `project-discipline-guides` → `project-guides` | 같은 파일 | 둘 다 discipline guide의 `guide.md`를 고친다(추론). 새 규칙은 더하지 않고 mirror에 완전히 있는 규칙만 걷어 낸다.[](source:ga-dg-filter) | 생략 |
| R34 | `project-features`, `project-use-cases` → sync와 이슈 checklist | 같은 파일 | 범위 밖. checklist는 sync가 다시 쓴다. 자격 있는 feature 이슈는 사람이 직접 닫지 않는다.[](source:ga-pf-sync) | 범위 밖 |
| R35 | `project-guides`, `project-use-cases`, `project-guide-validation` → `GOVERNANCE.md`, `docs/ATLS.md` | 참고 | 범위 밖. 작성 권한과 병합 전 승인 조건을 확인하라고 한다.[](source:ga-uc-gov)[](source:ga-gv-sme) | 범위 밖 |
| R36 | `project-guide-validation` → `guides/accessibility/accessibility/guide.md` | 참고 | 범위 밖. 접근성은 항상 평가하며(MUST) 이 문서를 먼저 읽는다.[](source:ga-gv-qual) | 범위 밖 |

`project-evals`에서 나가는 평가 도구 안내(R16~R18)와 `project-features`의 `web-features` 갱신(R33)은 다른 묶음의 관계라 여기서 다루지 않는다.

## 어디까지 읽고 확인했나 {#audit span=12}

| 구분 | 확인 범위 |
| --- | --- |
| 읽은 원본 | `modern-web-guidance-src` 스킬 7개의 `SKILL.md`를 끝까지 읽었다. `project-discipline-guides`의 script와 mirror 생성물은 개요 페이지에서 따로 다룬다 |
| 대조 | 원장 R01~R15, R34~R36을 원문 줄과 맞춰 봤다 |
| 확인하지 못한 것 | `guides/`, `src/ci/`, `GOVERNANCE.md`, `docs/ATLS.md`는 이 컬렉션에 없다. 명령은 모두 지시상 동작이고 실행하지 않았다 |

각 스킬의 내부 규칙은 스킬별 개요 페이지에 있다. 이동은 컬렉션 색인이 맡는다.
