# dsh-pre-push-checks 스킬은 에이전트를 어떻게 바꾸나 {#dsh-pre-push-checks-skill}

`dsh-pre-push-checks`가 켜지면 에이전트는 push 전에 바뀐 범위를 덮는 가장 작은 테스트와 검사만 골라 한 번 돌린다. 저장소 전체 테스트는 기본으로 돌리지 않는다.[](source:skill-fm)

- 에이전트는 검사를 고르기 전에 `change-scope`로 바뀐 범위 전체를 본다. `change-scope`는 base branch를 추측하지 않으므로, 현재 원격이나 stack(서로 기대는 PR 체인) 상태에서 확인한 값을 에이전트가 직접 넘긴다.[](source:skill-scope)
- 로컬 기준선은 훅뿐이다. 동작을 바꿨다면, 그 회귀가 생길 때 실패할 가장 좁은 검사를 돌린다. 넓은 검사는 변경이 실제로 닿는 곳에만 더한다.[](source:skill-select)
- 관련 검사가 실패하면 에이전트는 push하지 않는다. 예외는 `gh stack sync` 직후다. 이때는 PR 병합을 막고 검증을 보류로 보고한다.[](source:skill-fail)
- 히스토리를 다시 쓰는 push는 fetch해서 관측해 둔 OID를 지정한 `--force-with-lease`로만 한다. 날 `--force`는 허용하지 않는다.[](source:skill-lease)

@answer scope="deepseek-harness/dsh-pre-push-checks · 원본 텍스트 파일 1개 · 커밋 475505c · 실행하지 않음"
@meta locale=ko
@source skill-fm title="deepseek-harness/dsh-pre-push-checks/SKILL.md · 11283B · frontmatter" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=1:4
@source skill-intro title="SKILL.md · 목적과 훅의 역할" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=8:8
@source skill-scope title="SKILL.md · 변경 범위 확인" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=12:25
@source skill-select title="SKILL.md · 관련 근거 고르기 도입" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=29:29
@source skill-ci title="SKILL.md · ci-test-reliability 먼저" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=31:31
@source skill-pkg title="SKILL.md · 패키지·스크립트 동작" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=33:33
@source skill-remote title="SKILL.md · Remote mock 타입" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=34:34
@source skill-docs title="SKILL.md · 문서·Agent Note" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=35:35
@source skill-output title="SKILL.md · 눈에 보이는 출력" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=36:36
@source skill-expected title="SKILL.md · 기대 출력 위치" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=37:37
@source skill-profile title="SKILL.md · 프로필·설정 위치" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=38:38
@source skill-build title="SKILL.md · 매니페스트·빌드" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=39:39
@source skill-types title="SKILL.md · 테스트·스크립트 타입" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=40:40
@source skill-e2e title="SKILL.md · 실제 provider" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=41:41
@source skill-norepeat title="SKILL.md · 반복 금지" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=43:43
@source skill-args title="SKILL.md · Vitest 인자 전달" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=45:51
@source skill-cov title="SKILL.md · 커버리지 범위 지정" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=55:63
@source skill-related title="SKILL.md · vitest related" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=65:74
@source skill-full title="SKILL.md · 전체 로컬 리허설" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=78:78
@source skill-lease title="SKILL.md · 히스토리 재작성 push" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=82:84
@source skill-sync title="SKILL.md · sync 직후 검증" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=88:95
@source skill-fail title="SKILL.md · 실패 처리" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=99:99
@source skill-env title="SKILL.md · 환경 의존 실패" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=101:106
@source skill-push title="SKILL.md · push 절차" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=110:119
@source skill-checks title="SKILL.md · 원격 CI 확인" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=121:127
@source skill-nochecks title="SKILL.md · 체크가 아예 없을 때" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=129:135
@source skill-syncend title="SKILL.md · sync 직후는 별도 순서" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=137:137
@source dup-copy title="verification-skills/deepseek-harness/dsh-pre-push-checks/SKILL.md · 동명 사본 · diff 비교만" path=verification-skills/deepseek-harness/dsh-pre-push-checks/SKILL.md lines=39:41

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`description`은 모델이 스킬을 켤지 판단할 때 읽는 설명이다. 여기에 적힌 호출 시점은 두 가지다.

- `deepseek-harness` branch에서 에이전트가 push, force-push, 리뷰 준비 완료 표시, "검사가 통과했다"는 주장을 하려는 직전이다.[](source:skill-fm)
- `gh stack sync`가 다시 쓴 branch를 올린 직후다.[](source:skill-fm)

frontmatter에는 `name`과 `description`만 있다. `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음. 이 스킬은 에이전트가 로컬 근거를 push 전에 한 번 돌리게 한다. 이 순서의 유일한 예외가 `gh stack sync`다.[](source:skill-intro)

@facts id=hook-roles
| pre-commit 훅 | stage한 파일의 lint 수정, 공백 검사, vendored 소스 메타데이터 보호[](source:skill-intro) |
| pre-push 훅 | 증분 저장소 typecheck만 실행[](source:skill-intro) |
| CI | 전체 검사와 플랫폼 매트릭스를 맡는다[](source:skill-intro) |

## push 전에 어떤 순서로 진행하나 {#flow}

@workflow id=pre-push-flow title="push 전 검사 순서"
| scope | 범위 확인 | backend |
| select | 검사 고르기 | backend |
| run | 한 번 실행 | backend |
| okq | 통과? | backend |
| push | commit·push | backend |
| ci | 원격 CI 보기 | external |
| stop | 중단·보고 | security |
| scope > select | |
| select > run | |
| run > okq | |
| okq > push | 예 | emphasis |
| okq > stop | 아니오 | security |
| push > ci | |

@steps id=pre-push-steps
| s-scope | 범위 확인 | 에이전트는 `git status --short --branch`와 `git rev-parse --show-toplevel`로 체크아웃을 확인한다. 이어서 살아 있는 PR base나 stack의 부모를 확인하고 그 ref 이름을 fetch한 뒤, `pnpm --silent run change-scope --base <확인한 base ref>`로 전체 범위를 본다. `change-scope`는 base branch를 추측하거나 fetch하지 않는다. base branch를 바꿔 병합했다면, 보고서를 다시 만들고 무효가 된 검사만 다시 돌린다.[](source:skill-scope) | pre-push-flow | scope |
| s-select | 검사 고르기 | 변경 종류별로 가장 좁은 검사를 고른다. 자원을 소유하거나 비동기인 테스트·픽스처·헬퍼·CI 실행 경로를 바꿨다면, 먼저 `dsh-ci-test-reliability`로 어떤 근거가 필요한지 정한다. 어떤 명령을 돌릴지는 계속 이 스킬이 고른다.[](source:skill-ci) | pre-push-flow | select |
| s-run | 한 번 실행 | 고른 검사를 한 번 돌린다. 이미 통과한 검사는 commit이나 push로 이어진다는 이유로 되풀이하지 않는다.[](source:skill-norepeat) | pre-push-flow | run |
| s-ok | 통과? | 관련 검사가 하나라도 실패하면, 일반 push 앞에서 멈추고 고치거나 막힌 이유를 설명한다. push해 놓고 CI가 다르게 나오기를 바라는 일은 하지 않는다.[](source:skill-fail) | pre-push-flow | okq |
| s-push | commit·push | 정상 commit 뒤에 pre-commit 수정기가 바꾼 파일을 확인한다. 이어서 정상 push하거나, 허가된 재작성 branch라면 정확한 lease(원격이 바뀌었으면 push를 막는 보호)를 걸어 push한다. 이 push가 증분 typecheck 훅을 돌린다. push한 뒤에는 `git rev-parse HEAD origin/<브랜치>`로 원격 branch 끝이 로컬 `HEAD`와 같은지 확인한다.[](source:skill-push) | pre-push-flow | push |
| s-ci | 원격 CI 보기 | GitHub PR이면 push 뒤 `gh pr checks`로 원격 CI를 본다. 대기 중인 체크는 대기 중이라고 보고한다. 실패한 체크는 branch 탓인지 환경 탓인지 따지기 전에 먼저 살핀다.[](source:skill-checks) | pre-push-flow | ci |
| s-stop | 중단·보고 | 환경 때문이라고 주장하려면, 정확한 명령·실패한 테스트·플랫폼별 불일치를 기록하고 플랫폼과 무관한 근거를 확인해 증명한다. 필수 검사라면 플랫폼 간 비결정성을 고치는 쪽을 우선한다.[](source:skill-env) | pre-push-flow | stop |

판정: 이 스킬의 중심은 검증을 빼먹지 않게 하는 것보다 검사를 과하게 돌리지 않게 하는 데 있다. 스킬이 로컬 기준선을 훅으로 한정하고, 전체 리허설을 예외로 두고, 이미 통과한 검사를 되풀이하지 못하게 금지하기 때문이다.[](source:skill-select)[](source:skill-norepeat)[](source:skill-full)

## 변경 종류별로 무엇을 돌리나 {#select}

로컬 기준선은 훅뿐이다.[](source:skill-select) 아래 표는 바뀐 것에 따라 에이전트가 고르는 검사와 파일 배치 규칙이다.

| 바뀐 것 | 돌리거나 지키는 것 |
| --- | --- |
| 패키지·스크립트 동작 | 그 동작을 소유한 Vitest 파일이나 테스트 이름을 돌린다. 공유 계약이 바뀌면 인접 패키지 테스트를 더한다. 저장소 전체 커버리지는 CI에 맡긴다. 변경이 정말 여러 곳에 걸치거나 사용자가 요청하면 예외다.[](source:skill-pkg) |
| Remote·mock 타입 | 빌드되지 않은 `any`는 로컬의 명시적 대체일 뿐 엄격한 근거가 아니다. 넘기기 전에 `pnpm run typecheck`를 돌린다. 생성된 선언이 없거나 낡았거나 일부만 있으면 다시 빌드한 뒤 남은 오류를 진단한다. 이 예외는 테스트 프록시에만 두고 운영 Remote 타입, 전역 플래그, 복사한 시그니처에는 두지 않는다.[](source:skill-remote) |
| 문서, Agent Note, 카탈로그, 문서에 연결된 주석 | `pnpm run doc-sync`를 돌린다. 문서 워크플로가 요구하면 전체 lint도 돌린다.[](source:skill-docs) |
| 모델·에디터·CLI·터미널에 보이는 출력 | 그 출력을 소유한 keyless 스냅샷이나 실제 실행 가능한 예제 시나리오를 돌린다.[](source:skill-output) |
| 기대 출력의 위치 | 기록된 Session 세대를 재생 입력으로 쓰고 기대 출력을 저장하는 테스트는 최상위 `snapshots/`에 둔다. `snapshot.yml`은 출시된 `dsh` 프로필과 `composition/header` pin을 적는다. Session 왕복이 없는 ARIA·기하·생성기·CLI·단위 기대값은 소유 테스트 옆 `tests/expected/`에 둔다. 이런 기대값을 `snapshots/`에 두거나 `*.snapshot.ts` 소유자를 만들지 않는다. 레인은 소유 쪽 `test:expected`, `test:web`, `test` 중에서 고른다.[](source:skill-expected) |
| 프로필·설정 위치 | 출시된 `dsh` 프로필의 패키지 간 동작은 `apps/cli/tests/profiles/`에 둔다. 패키지 하나의 Loader 구성은 그 패키지의 `tests/fixtures/`에 둔다. 사용자용 선택 오버레이는 `apps/cli/config/examples/`에 두고 `docs/user/`의 안내 문서와 짝을 맞춘다.[](source:skill-profile) |
| 패키지 매니페스트, 공개 export, 빌드 설정, worker·bin 진입점, 빌드된 런타임 경로 | `pnpm run build`, 관련 hygiene 검사, 소유 빌드 산출물의 smoke 테스트를 돌린다.[](source:skill-build) |
| 저장소 테스트·스크립트 타입 | `pnpm run build:artifacts`는 패키지 프로젝트만 검사한다. TypeScript 변경을 끝냈다고 말하기 전에, 최신 `build:artifacts` 뒤에 `pnpm run build:check`를 돌리거나 `pnpm run build`를 돌린다. `build:check`는 기존 산출물을 읽을 뿐 다시 빌드하지 않는다.[](source:skill-types) |
| 실제 provider·에이전트 동작 | 자격 증명이 있으면 관련 `pnpm run test:e2e` 대상을 돌린다. 비밀을 출력하지 않는다.[](source:skill-e2e) |

명령을 쓸 때 걸리는 규칙은 다음과 같다.

- `pnpm run`으로 Vitest 파일·이름 필터를 넘길 때는, 필터를 스크립트 이름 바로 뒤에 붙인다. 독립된 `--`를 끼우면 `--`가 Vitest까지 그대로 전달돼 `-t` 필터가 꺼질 수 있다. 에이전트는 선택된 테스트 수를 확인하고 나서야 그 실행을 좁은 근거로 친다. npm 등 다른 런처는 인자 전달 문법이 각각 다르다.[](source:skill-args)
- 테스트 선택과 커버리지 선택은 별개다. 파일 필터는 돌릴 테스트만 고르고, 커버리지 설정은 기본으로 `packages/*/*/src/**/*.ts` 전체를 잰다. 단위 커버리지가 필요하면, 소유 테스트와 함께 `--coverage.include`로 소스 범위도 적는다. 파일별 100% 임계값은 선택한 소스 범위 안에서도 그대로 걸린다.[](source:skill-cov)
- 소유 테스트가 불분명하면 `vitest related`로 후보를 찾고, 고른 테스트를 살핀 뒤에야 근거로 쓴다. `vitest related`는 설정, 동적 로딩, 서브프로세스, 워커, 빌드 산출물, 외부 provider로만 닿는 동작을 찾지 못하므로, 그런 동작의 테스트는 직접 고른다.[](source:skill-related)
- `--passWithNoTests`를 쓰지 않는다. 커버리지 임계값을 낮추지 않는다. 테스트가 덮지 않는 파일을 숨기려고 `--coverage.include`를 좁히지 않는다. 좁은 범위가 실패하면 다른 소유 테스트를 더한다. 소스 범위를 좁히는 것은 제외할 모듈이 변경의 영향을 받을 수 없을 때뿐이다.[](source:skill-related)

## 무엇을 강제하고 언제 멈추나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 에이전트는 전체 로컬 리허설을 세 경우에만 돌린다. 사용자가 명시로 요청했을 때, CI 실패를 진단할 때, 변경이 저장소 전체에 걸쳐 더 좁은 세트를 믿을 수 없을 때다. 리허설 목록은 지금 워크플로와 패키지 스크립트에서 뽑고, 없어진 `check:pre-push` 집계는 다시 만들지 않는다[](source:skill-full) | 조건부 의무, 재생성 금지 |
| 독립 branch와 stack branch는 리뷰 뒤에도 rebase할 수 있다. 독립 branch의 히스토리를 다시 쓰기 전에 현재 원격 branch를 fetch해 정확한 OID 값을 기록하고, 그 값을 넣은 `--force-with-lease=<브랜치>:<관측한 OID>`로 게시한다. 원격이 동시에 갱신되면 push 자체가 중단된다[](source:skill-lease) | 의무 |
| 날 `--force`는 어떤 경우에도 허용하지 않는다. `gh stack push`와 `gh stack sync`는 자기가 관리하는 branch에 lease를 건다고 원문이 적는다(지시상 동작)[](source:skill-lease) | 금지 |
| 재작성 push 뒤에는 살아 있는 head commit을 다시 fetch하고, 미해결 리뷰 스레드·승인·병합 가능성·체크를 다시 감사한다. 재작성 이전의 commit 해시와 인라인 댓글 위치는 근거로 쓰지 않는다[](source:skill-lease) | 의무 |
| 관련 검사가 일반 push 전에 실패하면, 에이전트는 멈추고 고치거나 막힌 이유를 설명한다[](source:skill-fail) | 의무 |
| 에이전트는 로컬 훅을 사용자가 명시로 요청하거나 동의할 때만 우회한다. 우회할 때는 무엇이 왜 실패했는지, CI가 왜 다를 것으로 보는지 정확히 보고한다[](source:skill-env) | 조건부 허용 |
| `gh pr checks`가 "no checks reported"이고 `/actions/runs?head_sha=<sha>`의 `total_count`가 `0`이면, 인프라를 의심하기 전에 `gh pr view <number> --json mergeable,mergeStateStatus`로 병합 가능성을 읽는다[](source:skill-nochecks) | 의무 |
| PR이 `CONFLICTING`/`DIRTY`이면 GitHub는 `pull_request` 워크플로를 만들지 않는다고 원문이 적는다. 고치는 방법은 충돌 해결뿐이다. 빈 commit, `--allow-empty` push, draft/ready 토글, `revert-and-restore`는 `total_count`를 `0`으로 둔 채 이력만 어지럽힌다[](source:skill-nochecks) | 해결 방법 한정 |

## `gh stack sync` 직후에는 무엇이 다른가 {#post-sync}

`gh stack sync`는 fetch, cascading rebase(아래 층부터 차례로 하는 rebase), push를 한 동작으로 끝낸다. 그래서 branch를 다시 쓴 뒤 push하기 전에 로컬 검증을 끼울 수 없다. 이 동작은 외부 CLI 도구가 관리하며, 아래는 원문이 적은 지시상 동작이다.[](source:skill-sync)

@workflow id=post-sync-flow title="sync 직후 검증"
| pre | sync 전 기록 | backend |
| sync | `gh stack sync` | external |
| req | 다시 조회 | backend |
| scope | 층별 범위 확인 | backend |
| run | 선택한 검사 | backend |
| okq | 모두 통과? | backend |
| fix | 고쳐서 다시 게시 | security |
| done | 통과 보고 | backend |
| pre > sync | |
| sync > req | |
| req > scope | |
| scope > run | |
| run > okq | |
| okq > done | 예 | emphasis |
| okq > fix | 아니오 | security |
| fix > run | 수리 검증 | dashed |

@steps id=post-sync-steps
| p-pre | sync 전 기록 | sync 실행 전에 깨끗한 worktree를 요구하고, GitHub 공식 stack 순서와 정확한 원격 head commit을 기록한다.[](source:skill-sync) | post-sync-flow | pre |
| p-req | 다시 조회 | sync가 끝나면 모든 branch head commit과 GitHub의 공식 stack 순서를 다시 조회한다.[](source:skill-sync) | post-sync-flow | req |
| p-scope | 층별 범위 확인 | sync가 다시 쓴 층마다 살아 있는 PR base 대비 바뀐 범위를 본다.[](source:skill-sync) | post-sync-flow | scope |
| p-run | 선택한 검사 | 영향받는 층마다 이 스킬이 고른 근거를 돌린다. 선택한 검사가 모두 통과할 때까지 PR을 병합하지 않고, 검증은 보류로 보고한다.[](source:skill-sync) | post-sync-flow | run |
| p-fix | 고쳐서 다시 게시 | 검사가 실패하면, sync가 lease로 이미 올려 둔 head commit은 그대로 두고 원인을 고친다. 고친 것을 검증한 뒤 수정본을 게시한다. `gh stack sync` 명령이 성공했다는 이유만으로 stack이 준비됐다고 말하지 않는다.[](source:skill-sync) | post-sync-flow | fix |

## 흐름 속 위치 {#position}

@workflow id=pre-push-position title="pre-push 앞뒤의 스킬"
| cir | dsh-ci-test-reliability | backend |
| stk | dsh-merging-stacked-prs | backend |
| oth | 문서·번역·정리·성능 스킬 | backend |
| me | dsh-pre-push-checks | backend |
| out | push·원격 CI 확인 | external |
| cir > me | 테스트 설계 뒤 | |
| stk > me | sync 직후 | emphasis |
| oth > me | 정해진 검사 외 | |
| me > out | 통과 시 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `dsh-ci-test-reliability`로 다듬은 테스트 | push 전 검증 명령 | 테스트 설계를 마친 뒤. 재시도·건너뛴 테스트·대기 중인 CI는 통과라고 하지 않는다 | r20 |
| 나가는 변경이 자원 소유·비동기 테스트, 픽스처, 헬퍼, CI 실행 경로를 바꾼다 | 필요한 근거 종류(복원, 음성 대조, quiescent teardown, 동시 프로세스)를 `dsh-ci-test-reliability`에서 받는다 | 이 방향은 위 그림에서 생략했다. 명령 선택은 이 스킬이 계속 맡는다 | r21 |
| `dsh-merging-stacked-prs`가 다시 쓴 stack 층 | 층별 검증 결과 | `gh stack sync` 직후. 통과 전에는 병합하거나 준비됐다고 하지 않는다. 서로 이름을 부르지 않는 추론 관계다 | r22 |
| `dsh-translate-docs`의 PR 단위 `doc-sync` | `doc-sync` 실행 | PR 전에 PR 단위로 한 번. 번역 작업마다 돌리지 않는다 | r25 |
| `dsh-doc`의 웹사이트 동기화 결과 | push 전 검사 | 웹사이트 동기화 뒤 push 전에 | r26 |
| `dsh-find-simplifications`의 정리 | 정해진 검사 외의 검사 선택 | `doc-sync`, `lint`, `git diff --check` 밖의 검사 | r27 |
| `dsh-archive-agent-notes`의 보관 작업 | 추가 근거 선택 | 보관 검증기 테스트 등 정해진 검사를 돌린 뒤 | r28 |
| `dsh-speed-up-perf`의 성능 수정 | 실행한 근거 보고 | 이 스킬을 적용한다. 로컬 시간 측정이 runner 안정성을 증명한다고 가정하지 않는다 | r29 |
| GitHub 공식 stack 객체 | - | `dsh-merging-stacked-prs`, `dsh-speed-up-perf`와 같은 stack 상태를 공유한다. 상태는 `gh stack`과 GitHub가 관리한다 | r45 |

`dsh-ci-test-reliability`와 이 스킬은 서로 상대를 가리킨다. `dsh-ci-test-reliability`는 테스트 설계가 끝나면 이 스킬로 넘기고, 이 스킬은 검사를 고르는 중간에 `dsh-ci-test-reliability`로 근거 종류를 정한다. 전체 흐름은 `deepseek-harness/_group-ship/ship.html`에 있다. 문서·정리 묶음에서의 위치는 `deepseek-harness/_group-docs/docs.html`과 `deepseek-harness/_group-cleanup/cleanup.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-pre-push-checks/SKILL.md` 하나. 이 스킬 폴더에는 다른 텍스트 파일이 없다.
- 제외한 파일: 없다. 번역본도 이 폴더에는 없다.
- 원문 비교: `verification-skills/deepseek-harness/dsh-pre-push-checks`에 이름이 같은 사본이 있고 `SKILL.md`가 다르다(원장 기준 동명·내용 다름). `diff`로 확인하니 사본에는 "Repository test and script types" 항목(`build:artifacts`·`build:check` 규칙)이 없다. 나머지 줄은 같다. 이 페이지는 `deepseek-harness/` 쪽 원문만 분석한다.[](source:skill-types)[](source:dup-copy)
- 실행하지 않았다. 원문의 `git`, `gh`, `pnpm` 명령은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원문이 링크한 `../../../packages/test-support/remote-mock/README.md`는 원래 deepseek-harness 저장소의 파일이라 이 저장소에 없다. 범위 밖이다. `change-scope`가 출력하는 JSON 형식의 세부와 `pnpm run` 스크립트들이 실제로 하는 일은 원문에 명시 없음. 사용자가 검사 선택을 중간에 바꿔야 하는 경우의 절차도 원문에 명시 없음.
