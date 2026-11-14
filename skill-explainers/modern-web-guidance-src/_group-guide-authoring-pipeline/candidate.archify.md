# 새 web 기능은 어떤 순서로 guide와 평가 기준이 되나? {#guide-authoring-pipeline-page}

`project-features`로 이슈를 분류한 뒤 use case, guide, 자체 검증, 평가 순서로 진행한다. use case는 Content ATL이 승인한 뒤에야 guide 작성(Stage 2)으로 넘어간다.[](source:uc-approve)

- 순서는 `project-use-cases`(Stage 1), `project-guides`(Stage 2), `project-evals`(Stage 3)가 각자 적은 번호에 근거한다.[](source:uc-stage)[](source:pg-stage)[](source:pe-stage) `project-features`는 번호 없이 "use case보다 앞"이라고만 쓴다.[](source:feat-intro)
- `project-guides`는 Stage 3으로 가기 전에 `project-guide-validation`을 invoke하라고 명령형으로 쓴다. 받는 쪽은 "strongly encouraged"라고 쓰며 사람 SME 검토를 대체하지 않는다고 못박는다.[](source:pg-val)[](source:pv-intro)
- 온보딩된 Peer는 Stage 1을 건너뛰고 바로 Stage 2로 갈 수 있다.[](source:uc-gov)
- `project-discipline-guides`와 `baseline-status`는 필수 단계가 아니라 참고 관계로 이어지는 갈래다. 이 묶음에 안내 역할 스킬은 없다.

@answer scope="로컬 SKILL.md 7개 · 관계 R01~R15 · 원본 저장소의 guides·src·docs 파일은 확인하지 못함"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source feat-intro title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 관계 확인용 일부(8~17행)" path=modern-web-guidance-src/project-features/SKILL.md lines=8:17
@source feat-after title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 관계 확인용 일부(113~121행)" path=modern-web-guidance-src/project-features/SKILL.md lines=113:121
@source feat-close title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 관계 확인용 일부(111행)" path=modern-web-guidance-src/project-features/SKILL.md lines=111:111
@source feat-steps title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 관계 확인용 일부(Step 제목 19·65·86·99행)" path=modern-web-guidance-src/project-features/SKILL.md lines=19:19
@source uc-stage title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부(6~12행)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=6:12
@source uc-gov title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부(14행)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=14:14
@source uc-desc title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부(23행)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=23:23
@source uc-hub title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부(31행)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=31:31
@source uc-ex title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부(49~53행)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=49:53
@source uc-stub title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부(78~98행)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=78:98
@source uc-approve title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부(100~108행)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=100:108
@source pg-stage title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부(6~14행)" path=modern-web-guidance-src/project-guides/SKILL.md lines=6:14
@source pg-stage2 title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부(30행)" path=modern-web-guidance-src/project-guides/SKILL.md lines=30:30
@source pg-fm title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부(36~47행)" path=modern-web-guidance-src/project-guides/SKILL.md lines=36:47
@source pg-exp title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부(148~158행)" path=modern-web-guidance-src/project-guides/SKILL.md lines=148:158
@source pg-disc title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부(156행)" path=modern-web-guidance-src/project-guides/SKILL.md lines=156:156
@source pg-val title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부(166~168행)" path=modern-web-guidance-src/project-guides/SKILL.md lines=166:168
@source pv-intro title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(6~10행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=6:10
@source pv-list title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(14~21행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=14:21
@source pv-qual title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(34~35행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=34:35
@source pv-a11y title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(36~38행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=36:38
@source pv-tok title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(41행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=41:41
@source pv-exp title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(46행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=46:46
@source pv-base title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(77~80행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=77:80
@source pe-stage title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(6~12행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=6:12
@source pe-red title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(31~46행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source pe-exp title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(48~58행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=48:58
@source dg-top title="modern-web-guidance-src/project-discipline-guides/SKILL.md · 5288B · 관계 확인용 일부(3~14행)" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=3:14
@source dg-flow title="modern-web-guidance-src/project-discipline-guides/SKILL.md · 5288B · 관계 확인용 일부(16~49행)" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=16:49
@source dg-cli title="modern-web-guidance-src/project-discipline-guides/SKILL.md · 5288B · 관계 확인용 일부(20~25행)" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=20:25
@source bs-top title="modern-web-guidance-src/baseline-status/SKILL.md · 899B · 전부 읽음" path=modern-web-guidance-src/baseline-status/SKILL.md
@source lock title="modern-web-guidance-src/skills-lock.json · 3621B · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 어떤 순서로 진행하고 어디서 갈라지나? {#flow}

굵은 화살표는 넘김, 점선은 참고 관계다. 그림에서 뺀 관계는 다음 패널 표에 남겼다. 이 그림이 바로 이 묶음의 흐름이고, 각 스킬의 내부 규칙은 스킬 페이지에서 본다.

@workflow id=pipeline-flow title="feature 이슈에서 평가 기준까지"
| lane s0 | feature 이슈 |
| lane s1 | Stage 1 |
| lane s2 | Stage 2 |
| lane s3 | Stage 3 |
| features | project-features | backend | s0 | source:feat-intro |
| usecases | project-use-cases | backend | s1 | source:uc-stage |
| atl | ATL 승인 | external | s1 | source:uc-approve |
| guides | project-guides | backend | s2 | source:pg-stage |
| validation | project-guide-validation | backend | s2 | source:pv-intro |
| discipline | project-discipline-guides | backend | s2 | source:dg-top |
| baseline | baseline-status | backend | s2 | source:bs-top |
| evals | project-evals | backend | s3 | source:pe-stage |
| features > usecases | R01 넘김 | emphasis |
| usecases > atl | R03 승인 요청 | emphasis |
| atl > guides | R03 승인 후 | emphasis |
| guides > validation | R05 넘김 | emphasis |
| guides > evals | R06 넘김 | emphasis |
| validation > discipline | R11 참고 | dashed |
| validation > baseline | R12 참고 | dashed |

@steps id=pipeline-steps
| features-step | project-features | 새 `new-feature` 이슈가 guidance 대상인지 가리고 web-feature ID를 하나로 정한다.[](source:feat-intro) | pipeline-flow | features |
| usecases-step | project-use-cases | web 기능 하나를 use case로 풀고 guide ID와 `guide.md` stub을 만든다.[](source:uc-stub) | pipeline-flow | usecases |
| atl-step | ATL 승인 | Content ATL이 use case를 검토한다. 사람이 하는 일이다.[](source:uc-approve) | pipeline-flow | atl |
| guides-step | project-guides | `guide.md`, `demo.html`, `expectations.md`를 쓰고 검토한다.[](source:pg-stage2) | pipeline-flow | guides |
| validation-step | project-guide-validation | 쓴 세 파일을 체크리스트 6단계로 검증하고 피드백 보고서를 낸다.[](source:pv-list) | pipeline-flow | validation |
| discipline-step | project-discipline-guides | 분야 전체 guide에서 모델이 이미 아는 규칙을 mirror와 비교해 걷어 낸다.[](source:dg-flow) | pipeline-flow | discipline |
| baseline-step | baseline-status | 웹 기능의 browser 지원과 Baseline 상태를 조회한다.[](source:bs-top) | pipeline-flow | baseline |
| evals-step | project-evals | `expectations.md`와 `task.md`, `grader.ts`를 8 red line으로 검토한다.[](source:pe-red) | pipeline-flow | evals |

`guides`에서 `evals`로 가는 간선은 Stage 2가 끝난 뒤를 뜻한다. `project-guides`는 검증 스킬을 PR을 열거나 Stage 3으로 가기 전에 invoke하라고 쓴다.[](source:pg-val) 판정 · 그래서 실제 순서는 `project-guides`, `project-guide-validation`, `project-evals`이다. 원장에는 `project-guide-validation`에서 `project-evals`로 가는 넘김 행이 없어(R10은 참고) 그 순서는 간선으로 그리지 않았다.[](source:pe-red)

## 스킬 사이에 무엇을 주고받나? {#relations}

원장의 관계 R01~R15를 모두 적었다. `종류`와 `조건`은 원장과 같다.

| rel-id · 종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R01 · 넘김 | `project-features` → `project-use-cases`. feature 이슈가 자격을 통과한 뒤(Step 1~4) ATL이 use case를 찾는다. ATL은 새 use-case 이슈를 올리거나, stub guide를 추가하거나, 기존 guide의 `web-feature-ids`에 ID를 더한다. web-feature ID가 이슈에서 use case 이슈와 `guide.md` frontmatter로 이어진다.[](source:feat-after)[](source:feat-steps) | 표시 |
| R02 · 참고 | `project-features` → `project-guides`. use-case 이슈가 닫히는 때(non-draft guidance와 `expectations.md`가 `main`에 오른 때)를 설명하며 "see the `project-guides` skill"이라고만 안내한다.[](source:feat-after) | 생략 |
| R03 · 넘김 | `project-use-cases` → `project-guides`. use case를 Content ATL이 승인한 뒤 Stage 2로 간다. PR이나 new-use-case 이슈로 검토를 요청한다. 온보딩된 Peer는 Stage 1을 건너뛰고 바로 Stage 2로 갈 수 있다. 전달물은 `guides/<category>/<guide-id>/guide.md` stub(`name`, `description`, `web-feature-ids`)이다.[](source:uc-gov)[](source:uc-stub)[](source:uc-approve) | 승인 노드 경유만 표시, Peer 경로는 생략 |
| R04 · 참고 | `project-use-cases` → `project-discipline-guides`. "Granular Guide Decomposition" 규칙 끝에서 허브 guide와 하위 guide 구조는 이 스킬을 보라고 안내한다.[](source:uc-hub) | 생략(간선 겹침을 피하려고 뺌) |
| R05 · 넘김 | `project-guides` → `project-guide-validation`. `guide.md`, `demo.html`, `expectations.md`를 다 쓴 뒤 PR을 열거나 Stage 3으로 가기 전에 invoke하라고 쓴다(명령형). 받는 쪽은 "strongly encouraged"라고 쓰고 사람 SME 검토를 대체하지 않는다고 못박는다. 전달물은 세 파일이고 결과는 피드백 보고서다.[](source:pg-val)[](source:pv-intro) | 표시 |
| R06 · 넘김 | `project-guides` → `project-evals`. Stage 2는 `guide.md`, `demo.html`, `expectations.md`에서 끝난다. `task.md`, golden patch, `grader.ts`는 Stage 3에서 `gd dev`가 만들고, 사람은 손볼 수 있으며 에이전트는 사람이 시킬 때만 손본다. grader가 맞지 않아도 guide를 고치지 않는다.[](source:pg-stage2)[](source:pe-stage) | 표시 |
| R07 · 참고 | `project-evals` → `project-guides`. `expectations.md` 작성 규칙은 전부 project-guides의 "Writing expectations.md" 절에 있다고 안내하고 Stage 3에는 grader 규칙만 더한다.[](source:pe-exp)[](source:pg-exp) | 생략 |
| R08 · 참고 | `project-guide-validation` → `project-guides`. 정성 검토와 expectation 정렬의 기준 문서다. token economy, `{# ... #}` 주석, `BASELINE_STATUS` 규칙 등을 이 문서 기준으로 본다.[](source:pv-qual)[](source:pv-tok)[](source:pv-exp) | 생략 |
| R09 · 참고 | `project-guide-validation` → `project-use-cases`. guide를 `project-use-cases`와 `project-guides`의 작성 기준에 대조하라고 한다.[](source:pv-qual) | 생략 |
| R10 · 참고 | `project-guide-validation` → `project-evals`. expectation 검토 때 8개 red line을 따르라고 한다. SME 문구는 의미가 바뀔 때만 고치고 이유를 적는다.[](source:pv-exp)[](source:pe-red) | 생략 |
| R11 · 참고 | `project-guide-validation` → `project-discipline-guides`. 해당 분야의 discipline guide가 `DISCIPLINE_GUIDES`에 있으면 그것을 따르는지 확인하고, 새 orientation guide는 그 목록에 추가해야 한다.[](source:pv-qual)[](source:dg-top) | 표시 |
| R12 · 참고 | `project-guide-validation` → `baseline-status`. 기능이 widely available인지 조회할 때 `web-baseline` 스킬과 `gd baselinestatus` 또는 `pnpm baselinestatus`를 쓰라고 한다. 링크 대상 `../web-baseline/SKILL.md` 폴더는 이 컬렉션에 없다.[](source:pv-base)[](source:bs-top) | 표시 |
| R13 · 공유 상태 | `project-use-cases`와 `project-guides`가 같은 `guide.md`를 쓴다. Stage 1에서 stub으로 만들고 Stage 2에서 본문으로 채운다. 선후는 R03이다.[](source:uc-stub)[](source:pg-fm) | 생략, 아래 상태 표 |
| R14 · 공유 상태 | `expectations.md`는 SME가 소유한다. `project-guides`가 쓰고 `project-evals`가 `grader.ts` 테스트와 1:1로 대응시켜 검토한다. 문구를 테스트 제목에 맞춰 고치지 않는다.[](source:pg-exp)[](source:pe-exp) | 생략, 아래 상태 표 |
| R15 · 공유 상태 | `project-discipline-guides`와 `project-guides`가 둘 다 `guide.md`를 고친다. 앞쪽은 mirror에 완전히 들어 있는 규칙만 걷어 내고 새 규칙은 더하지 않는다. 뒤쪽은 discipline guide의 expectations 작성 조건을 따로 정한다.[](source:dg-flow)[](source:pg-disc) | 생략, 아래 상태 표 |

R12의 판정: `baseline-status` 폴더의 이름과 링크 대상 `web-baseline`이 다르다. `skills-lock.json`의 `skillPath`가 `.agents/skills/web-baseline/SKILL.md`로 같은 스킬을 가리켜 이 둘을 같은 스킬로 읽었다.[](source:lock) R15의 근거 방식은 추론이다. 두 스킬이 같은 파일을 고친다는 점을 직접 연결한 문장은 원문에 없다.[](source:dg-flow)[](source:pg-disc)

## 어떤 파일과 상태를 같이 쓰나? {#state}

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 · 조건 |
|---|---|---|
| `guides/<category>/<guide-id>/guide.md` (R13, R15) | `project-use-cases`가 stub을 만든다. `project-guides`가 본문을 쓴다. `project-discipline-guides`는 discipline guide일 때 군더더기를 걷어 낸다.[](source:uc-stub)[](source:pg-fm)[](source:dg-flow) | `project-guide-validation`이 전체를 읽고 검토한다.[](source:pv-qual) |
| `expectations.md` (R14) | `project-guides`가 쓴다. SME가 소유한다.[](source:pg-exp) | `project-evals`가 grader 테스트와 1:1로 검토한다. `project-guide-validation`도 정렬을 본다.[](source:pe-exp)[](source:pv-exp) |
| `demo.html` (R05) | `project-guides`가 쓴다.[](source:pg-stage2) | `project-guide-validation`이 브라우저에서 실행해 확인한다.[](source:pg-val) |
| `targets/<base_app>/task.md`, golden patch, `grader.ts` (R06) | `gd dev`가 만든다(외부 CLI). 사람이 손볼 수 있고 에이전트는 사람이 시킬 때만 손본다.[](source:pg-stage2) | `project-evals`가 8 red line으로 검토한다.[](source:pe-red) |
| feature 이슈의 `use-cases-start`~`use-cases-end` checklist (R34) | sync(`src/ci/sync-use-cases.ts`)가 다시 쓴다. 손으로 고치지 않는다.[](source:feat-close) | 원장 해석 상태는 범위 밖이다. `src/ci/sync-use-cases.ts`는 이 컬렉션에 없다. |

## 원장 밖으로 남긴 관계와 원문이 충돌하는 곳은? {#boundary}

원장의 범위 밖 관계는 그림과 표에서 뺐다. 여기에는 이 묶음 스킬이 가리키는 것만 적는다.

| rel-id · 종류 | 내용 | 확인 상태 |
|---|---|---|
| R34 · 공유 상태 | feature 이슈 checklist는 sync가 다시 쓴다. 자격 있는 feature 이슈는 사람이 직접 닫지 않고, 한 번 닫히면 sync가 다시 열지 않는다.[](source:feat-close)[](source:feat-after) | 범위 밖. sync 스크립트 미확인 |
| R35 · 참고 | 작성 권한(Peer와 ATL)과 병합 전 승인 조건은 `GOVERNANCE.md`와 `docs/ATLS.md`에서 확인하라고 한다. 모든 guide는 병합 전에 category Content ATL 승인이 필요하다고 쓴다. 사람 SME 검토는 자동 검증으로 대체되지 않는다.[](source:uc-gov)[](source:pg-stage)[](source:pv-intro) | 범위 밖. 두 문서 미확인 |
| R36 · 참고 | 접근성은 항상 검토해야 한다(MUST). `guides/accessibility/accessibility/guide.md`를 먼저 읽고 `guide.md`는 해당하는 모든 규칙을 따라야 한다. `demo.html`은 guide가 요구한 패턴만 보여 주면 된다.[](source:pv-a11y) | 범위 밖. 대상 guide 미확인 |
| R39 · 참고 | mirror 생성 스크립트가 모델 CLI `agy`, `claude`, `codex`를 `--dangerously-skip-permissions` 옵션으로 부르고 교집합은 gemini CLI로 만든다. 원문은 모델 설정이 끝났는지 먼저 확인하라고 쓴다.[](source:dg-cli) | 범위 밖. 각 CLI 미확인. 스크립트는 읽기만 했고 실행하지 않았다 |

@callout level=open-question title="원문 충돌: use case description에 feature 이름을 쓰는가"
| `project-guides`의 frontmatter 예시는 description을 `<do thing> <with feature>`로 쓰고, 예문에 "modern color syntax"를 넣는다.[](source:pg-fm) |
| `project-use-cases`는 description에서 feature 이름과 API 이름을 기본으로 생략하라고 쓴다. 검색에 꼭 필요할 때는 예외이고, `gd dev`가 `task.md`를 만들 때 feature·API 이름을 걷어 낸다는 설명이 붙는다.[](source:uc-desc) 같은 문서의 Step 1 예시는 description에 "Fetch API"를 쓴다.[](source:uc-ex) |
| 어느 쪽이 우선하는지 원문에 명시 없음. 이 페이지는 우선순위를 정하지 않는다. `guide.md` description을 쓰기 전에 두 문서를 같이 확인해야 한다. |

## 어디까지 대조했고 무엇이 남았나? {#audit-panel}

이 페이지는 묶음 스킬 7개의 SKILL.md에서 관계와 조건이 나온 줄만 다시 읽어 원장 R01~R15와 대조했다. `baseline-status`는 899B 전부 읽었다.

번역본은 이 컬렉션에 없어 열지 않았다. 바이너리와 구조·표본만 읽은 파일은 이 페이지에서 0개다. 스킬 내부 규칙은 스킬 페이지에서 다룬다.

관계 15개(R01~R15)를 모두 원문과 대조했다. 원장에 있는 범위 밖 R34, R35, R36, R39는 이 묶음 스킬이 가리키는 원문 줄만 확인했다. 원본 저장소의 `guides/`, `src/`, `docs/`는 이 저장소에 없어 확인하지 못했다. 분석 중 원본은 수정하지 않았고, 본문 속 명령(`gd`, `pnpm`, `agy`, `claude`, `codex`)은 읽기만 했다.[](source:dg-cli)

@callout level=open-question title="미확인 범위"
| Stage 1~3 번호 순서와 sync가 이슈 상태를 바꾸는 동작은 SKILL.md 서술(지시상 동작)만 확인했다. 원본 저장소의 CI 스크립트는 없어 실행·확인하지 않았다.[](source:feat-after) |
| `project-guide-validation`이 쓰는 DevTools MCP 서버는 이 컬렉션 밖에 있다. |

자동 검증은 HTML 구조와 출처 해석을 확인한다. 실제 효과와 독자의 이해는 별도로 확인해야 한다. 사람 검토는 미실시다.
