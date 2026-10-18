# dsh-pre-push-checks 분석
읽은 파일 목록 (전수 조사, 디렉터리 재귀 확인 결과 파일은 1개뿐):
| 경로 | 크기 |
|---|---|
| `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-pre-push-checks/SKILL.md` | 10967 bytes (136줄) |
| `references/`, `scripts/`, `templates/`, `assets/` | 존재하지 않음 (`find . -type f` 결과 SKILL.md 단 1개) |
본 분석에서 `SKILL.md:N` 은 SKILL.md 의 N번째 줄을 뜻한다.

## 1. 개요
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-pre-push-checks/`
- 컬렉션: deepseek-harness
- 핵심 파일: `SKILL.md` (10967 bytes, 136줄)
- 보조 파일: 없음. `references/`, `scripts/`, `templates/` 디렉터리 자체가 없다.
- SKILL.md 가 링크로 참조하는 외부 문서 (이 디렉터리 밖, 본 분석에서 읽지 않음):
  - `../dsh-ci-test-reliability/SKILL.md` (`SKILL.md:31`) — 형제 스킬
  - `../../../packages/test-support/remote-mock/README.md#remote-proxy` (`SKILL.md:34`) — 리포지토리 내 README
- SKILL.md 가 호출하는 리포지토리 측 명령 (이 디렉터리에는 구현이 없음): `pnpm --silent run change-scope`, `pnpm run doc-sync`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test:e2e`, `pnpm run test:snapshot` 등
- 성격 한 줄: **검증(verification)** 스킬이 주축이고, "무엇을 검증할지 고르는" 선택 로직(계획·라우팅 성격)과 history 재작성 push 보호 절차(게이트)를 함께 가진다. 생성(construction)은 하지 않는다.
- 원문 자기 규정 (`SKILL.md:8`):
  > Use this skill to run relevant local evidence once before a `deepseek-harness` push.
- 원문이 스스로 밝힌 핵심 목적 (`description`):
  > to select the smallest tests and checks that cover the outgoing or just-published diff without reflexively running the full repository suite.
- 원문이 밝힌 역할 분담 (`SKILL.md:8`):
  > Git hooks are intentionally narrow: pre-commit fixes staged lint, checks staged whitespace, and guards vendored-source metadata; pre-push runs only the incremental repository typecheck. CI owns exhaustive coverage and the platform matrix.

## 2. 활성화 조건 (언제 켜지는가)

### 2.1 frontmatter description 전문 (`SKILL.md:3`)
> Use before pushing, force-pushing, marking ready for review, or claiming checks pass on a deepseek-harness branch, and immediately after gh stack sync publishes rewritten branches, to select the smallest tests and checks that cover the outgoing or just-published diff without reflexively running the full repository suite.
description 에서 추출되는 트리거 이벤트 5종:
1. pushing
2. force-pushing
3. marking ready for review
4. claiming checks pass
5. immediately after `gh stack sync` publishes rewritten branches
공통 조건: 대상은 `deepseek-harness` 브랜치 (description 에 명시).

### 2.2 매칭되는 사용자 발화 예시 (트리거 사전 추출)
description 의 이벤트에서 환산한 발화 (원문에 예시 발화 목록은 없음; 아래는 description 문구와의 대응):
| # | 발화 예시 | 대응되는 description 문구 |
|---|---|---|
| 1 | "이제 push 해줘" / "push this branch" | `before pushing` |
| 2 | "rebase 했으니 force push 해줘" | `force-pushing` |
| 3 | "리뷰 요청 올려도 되나? ready for review 로 바꿔줘" | `marking ready for review` |
| 4 | "로컬 체크 다 통과했어?" / "checks pass 라고 보고해도 돼?" | `claiming checks pass` |
| 5 | "gh stack sync 돌렸어, 이제 괜찮은 거지?" | `immediately after gh stack sync publishes rewritten branches` |
| 6 | "push 전에 어떤 테스트 돌려야 해?" | `select the smallest tests and checks` |
| 7 | "전체 테스트 돌리고 push 할까?" (스킬이 최소 선택 쪽으로 교정) | `without reflexively running the full repository suite` |
| 8 | "스택 PR 전체가 머지 가능한지 확인해줘" | post-sync 검증 절차 (`SKILL.md:85-94`) |
| 9 | "gh pr checks 가 아무것도 안 나와, 왜 이래?" | 본문 말미 `no checks reported` 처리 (`SKILL.md:128-134`) |

### 2.3 의도적으로 배제되는 발화와 넘길 스킬
- 원문에 "이 스킬을 쓰지 말 것"이라는 명시적 배제 문장은 없다. `원문에 명시 없음`.
- 본문의 위임(라우팅) 규칙 1건 (`SKILL.md:31`):
  > When the outgoing change adds or changes a resource-owning or asynchronous test, fixture, helper, or CI execution path, use [dsh-ci-test-reliability](../dsh-ci-test-reliability/SKILL.md) first to decide whether restoration, negative-control, quiescent-teardown, or concurrent-process evidence applies. This skill still selects the commands and avoids repeating evidence that already passed.
  - 즉 "넘기는" 것이 아니라 **먼저 쓰고 돌아오는** 선행 호출 관계다. 이 스킬은 명령 선택 책임을 계속 가진다.
- 전체 로컬 리허설은 예외 조건에서만 허용 (`SKILL.md:77`):
  > Run the complete local approximation only when the user explicitly requests it, while diagnosing a CI failure, or when the change spans the repository so broadly that no narrower set is credible.

### 2.4 frontmatter 의 다른 필드
- `name`: `dsh-pre-push-checks`
- `description`: 위 전문
- `allowed-tools`: 없음
- `model`: 없음
- `metadata`: 없음
- 그 외 필드: 없음. frontmatter 는 `SKILL.md:1-4` 의 두 필드가 전부다.

## 3. 적합 / 부적합

### 3.1 적합 (원문에서 읽히는 대상)
- `pnpm` 기반 모노레포. 근거: `pnpm run change-scope`, `pnpm exec vitest`, `packages/*/*/src/**/*.ts` 경로 (`SKILL.md:22, 54`).
- Vitest 를 쓰고 파일별 100% 커버리지 임계값이 걸린 리포지토리. 근거 (`SKILL.md:62`):
  > The configured per-file 100% thresholds still apply inside the selected source scope.
- pre-commit / pre-push git hook 이 좁게 설정된 리포지토리 (`SKILL.md:8`).
- GitHub PR + `gh stack` (스택 PR) 워크플로우. 근거: `gh stack sync`, `gh stack push`, `gh pr checks`, `gh pr view`.
- 리뷰 이후에도 rebase 를 허용하는 팀 (`SKILL.md:81`):
  > Rebase is allowed for standalone and stacked PR branches, including after review.
- 변경 범위가 패키지/스크립트/문서/스냅샷/빌드 설정 등으로 나뉘어 각각 담당 검사가 정해져 있는 상황 (`SKILL.md:33-40`).

### 3.2 부적합 / 과함 (원문이 직접 말하는 것만)
- 원문이 "이 경우엔 쓰지 말라"고 적은 문장은 없다. `원문에 명시 없음`.
- 원문에서 읽히는 적용 범위 한계:
  - description 이 `deepseek-harness` 브랜치로 한정됨.
  - 커맨드가 `pnpm` 전용. `SKILL.md:50`: `This applies to these pnpm scripts; npm and other launchers retain their own argument-forwarding syntax.`
  - `change-scope`, `doc-sync`, `test:snapshot` 등은 리포지토리 `package.json` 스크립트라는 전제. 해당 스크립트 정의는 이 디렉터리에 없음.
- 스킬이 스스로 "전체 스위트를 돌리지 말라"고 하므로, 전체 테스트가 요구되는 상황은 3.3 의 예외 조건 (`SKILL.md:77`)을 통해서만 열린다.

### 3.3 형제 스킬 대신 이걸 고르는 판정 기준 한 줄
- 판정 기준: **"push / ready-for-review / 'checks pass' 보고 / `gh stack sync` 직후 중 하나가 임박했고, 어떤 명령을 몇 번 돌릴지 정해야 한다"면 이 스킬**, 리소스 소유·비동기 테스트의 증거 종류(restoration, negative-control, quiescent-teardown, concurrent-process)를 정해야 한다면 `dsh-ci-test-reliability` 를 먼저 (`SKILL.md:31`).
- 다른 형제 스킬(이 컬렉션의 나머지)과의 관계는 원문에 `원문에 명시 없음`.

## 4. 전제 조건과 외부 의존성

### 4.1 실행 스크립트
- 이 스킬 디렉터리에 실행 스크립트 없음 (`scripts/` 없음).
- 스킬은 리포지토리가 이미 가진 pnpm 스크립트를 호출하라고 지시만 한다.

### 4.2 런타임·패키지·CLI 도구
- `git` (`SKILL.md:15-16, 117, 134`), `pnpm` (`SKILL.md:22, 47, 57`), `vitest` run/related (`SKILL.md:57, 67`), `gh pr checks`/`gh pr view` (`SKILL.md:123, 131`), `gh stack sync/push` (`SKILL.md:3, 81, 87`), GitHub REST `/actions/runs?head_sha=<sha>` (`SKILL.md:128`).

### 4.3 호출되는 pnpm 스크립트 (정의는 이 디렉터리에 없음)
- `change-scope` (`--base <verified-base-ref>`, `--head <ref>`) — `SKILL.md:22-25`
- `typecheck` — `SKILL.md:34`
- `doc-sync` — `SKILL.md:35`
- `build` — `SKILL.md:39`
- `test:e2e` — `SKILL.md:40`
- `test:snapshot` — `SKILL.md:47`
- `test:expected`, `test:web`, `test` — `SKILL.md:37`
- 제거된 스크립트 언급 (`SKILL.md:77`): `do not recreate the removed check:pre-push aggregate.`

### 4.4 API 키·환경변수·네트워크
- API 키: 조건부. `SKILL.md:40`:
  > Real provider or agent behavior: run the relevant `pnpm run test:e2e` target when credentials are available; never print secrets.
  - 즉 자격 증명이 있을 때만 e2e 를 돌리고, 비밀을 출력하지 말라는 지시. 어떤 환경변수명인지는 `원문에 명시 없음`.
- 키리스 경로 존재: `SKILL.md:36` 의 `focused keyless snapshot`.
- 네트워크: `git fetch`(base ref, 원격 branch 재조회), `gh` 호출에 필요. 단 `change-scope` 자체는 `SKILL.md:25`: `The command never guesses or fetches a base.` — 즉 fetch 는 사용자(에이전트)가 직접 해야 한다 (`SKILL.md:19`: `fetch that ref`).

### 4.5 리포지토리 전제
- 테스트 러너: Vitest (`SKILL.md:57`)
- CI: GitHub Actions (`/actions/runs`, `pull_request` workflow 언급, `SKILL.md:128, 134`). CI 가 `exhaustive coverage and the platform matrix` 를 소유 (`SKILL.md:8`).
- 린터: pre-commit 이 `fixes staged lint` (`SKILL.md:8`). 린터 종류는 `원문에 명시 없음`.
- 타입 시스템: TypeScript 로 읽히는 근거는 `*.ts` 경로와 `typecheck` 스크립트. 원문은 pre-push 훅이 `incremental repository typecheck` 만 돈다고 명시.
- 커밋 권한: 일반 커밋·푸시 가능 전제. 브랜치 전략: standalone PR 브랜치 + stacked PR 브랜치 (`SKILL.md:81`).
- git hook: pre-commit (lint fix, whitespace check, vendored-source metadata guard), pre-push (incremental typecheck). hook 설치 방식은 `원문에 명시 없음`.
- 디렉터리 규약 (스킬이 전제하는 리포지토리 구조, `SKILL.md:37-38`):
  - `snapshots/` (최상위), `snapshot.yml`, `tests/expected/`
  - `apps/cli/tests/profiles/`, `tests/fixtures/`, `apps/cli/config/examples/`, `docs/user/`
  - `packages/test-support/remote-mock/README.md`

### 4.6 비용 발생 지점
- 유료 API: `test:e2e` (실제 provider/agent 호출). 요금·상한은 `원문에 명시 없음`.
- CI 분: push 후 CI 가 돌므로 발생. 스킬은 `without reflexively running the full repository suite` 로 로컬 비용을 줄이는 것이 목적.
- 로컬 시간: 커버리지 범위를 좁히는 지시(`--coverage.include`)가 전체 소스 측정을 피하게 한다 (`SKILL.md:54`).

### 4.7 상태 파일·산출물 디렉터리
- 이 스킬은 `plan.md`, `TODO`, `.claude/` 등 상태 파일을 만들라고 지시하지 않는다. `원문에 명시 없음`.
- 단, 기록을 요구하는 항목이 있음 (저장 위치는 지정 안 됨):
  - 원격 branch 의 exact OID 기록 (`SKILL.md:81`)
  - 공식 스택 순서와 원격 head 기록 (`SKILL.md:87`)
  - 환경 특이 실패 시 exact command / failing test / mismatch 기록 (`SKILL.md:101`)
- `change-scope` 는 "versioned JSON" 을 출력 (`SKILL.md:25`). 파일로 저장하는지는 `원문에 명시 없음`.

## 5. 워크플로우
순서 강제 문구: "Run ... once" (`SKILL.md:8`), Push procedure 는 번호 매긴 4단계 (`SKILL.md:109-114`). "do not skip" 류 명시 문구는 없다. 게이트는 `[GATE]` 로 표시한다.

### 5.1 단계별 입력 → 행동 → 출력 → 통과 조건
**단계 A. 체크아웃·브랜치 확인** (`SKILL.md:12-17`) — 비게이트
- 입력: 현재 작업 디렉터리
- 행동: `git status --short --branch`, `git rev-parse --show-toplevel`
- 출력: 브랜치 상태, 리포지토리 루트
- 통과 조건: 원문에 명시 없음 (확인 행위 자체가 목적)
**단계 B. base 검증 및 변경 범위 조회** (`SKILL.md:19-25`) — 비게이트(준-게이트: 잘못된 base 방지)
- 입력: live PR base 또는 stack parent ref
- 행동: 해당 ref 를 fetch 하고
  ```
  pnpm --silent run change-scope --base <verified-base-ref>
  ```
  실행. 다른 커밋을 보려면 `--head <ref>`.
- 출력: versioned JSON. 원문: `Its versioned JSON records committed paths relative to the resolved merge base, while staged, unstaged, and untracked paths describe the current worktree.`
- 통과 조건: 원문에 명시 없음. 규칙 — `The command never guesses or fetches a base. Supply the ref verified from current remote or stack state`.
- base 가 바뀐 경우 (`SKILL.md:25`):
  > After merging a changed base, rerun the report, reassess which behavior the combined scope can affect, and rerun only checks invalidated by the merge.
**단계 C. 관련 증거 선택** (`SKILL.md:27-50`) — 비게이트(선택 규칙)
- 입력: 단계 B 의 변경 범위
- 행동: 6.2 표의 매핑대로 최소 검사 선택.
- 기본 원칙 (`SKILL.md:29`):
  > There is no universal local baseline beyond the hooks. Every behavior change needs the narrowest available test or purpose-built check that would fail for its regression; add broader checks only for surfaces the diff actually reaches.
- 선행 분기: 리소스·비동기 테스트 변경이면 `dsh-ci-test-reliability` 먼저 (`SKILL.md:31`).
- 출력: 실행할 명령 목록
- 통과 조건: 선택된 명령이 통과해야 함 (단계 E 로)
**단계 C-1. 필터 실행 시 확인** (`SKILL.md:44-50`) — 준-게이트
- 행동: `pnpm run` 뒤에 Vitest 파일/이름 필터를 직접 붙인다. 독립 `--` 금지.
  > do not insert a standalone `--`, which reaches Vitest and can disable `-t` filtering.
- 예시: `pnpm run test:snapshot snapshots/session/headless.snapshot.ts -t 'cordis-inspect-jsdoc'`
- 통과 조건: `Check the reported selected test count before treating a filtered run as focused evidence.`
**단계 C-2. 커버리지 범위 지정** (`SKILL.md:52-73`) — 비게이트(커버리지 관련 시)
- 입력: 소유 테스트 파일 + 영향받는 소스
- 행동:
  ```
  pnpm exec vitest run packages/<group>/<package>/tests/<behavior>.spec.ts \
    --coverage \
    --coverage.include='packages/<group>/<package>/src/**/*.ts'
  ```
- 소유 테스트가 불명확하면 `vitest related <src> --run --coverage --coverage.include=<src>` 로 후보 탐색 후 선택된 테스트를 직접 검토 (`SKILL.md:64-71`).
- 통과 조건: per-file 100% 임계값 (`SKILL.md:62`).
- 실패 처리 (`SKILL.md:73`): 선택 범위가 한 테스트 부족으로 실패하면 관련 소유 테스트를 추가하거나, 제외 모듈이 영향받을 수 없을 때만 소스 범위를 좁힌다.
**단계 D. 전체 로컬 리허설** (`SKILL.md:75-77`) — 조건부(예외)
- 허용 조건 3가지: 사용자 명시 요청 / CI 실패 진단 / 리포 전반에 걸쳐 더 좁은 집합이 신뢰 불가.
- 인벤토리: `Use the current workflow and package scripts as the inventory; do not recreate the removed check:pre-push aggregate.`
**단계 E. 실패 처리** (`SKILL.md:96-105`) — **[GATE]**
- 입력: 관련 체크 결과
- 행동 (일반 push): `If a relevant check fails before an ordinary push, stop and fix or explain the blocker. Do not push and hope CI differs.`
- 행동 (post-sync 예외): `block the merge and follow the repair procedure above.`
- 환경 특이 실패로 보일 때 (`SKILL.md:100-105`): 정확한 명령·실패 테스트·플랫폼 불일치 기록 → 비플랫폼 증거 확인 → 가능하면 크로스플랫폼 비결정성 수정 → hook 우회는 `only when the user explicitly asks or agrees`, 그리고 `report exactly what failed and why CI is expected to differ.`
- 사람 개입 지점: hook 우회 시 사용자 동의 필수.
**단계 F. Push 절차** (`SKILL.md:107-118`) — 순서 번호 강제
1. `Run the selected relevant checks once.`
2. `Commit normally and inspect any files changed by the pre-commit fixer before continuing.`
3. `Push normally, or use the exact lease for an authorized rewritten branch, so the incremental typecheck hook runs.`
4. `Verify the remote ref matches local HEAD.` — `git rev-parse HEAD origin/$(git branch --show-current)`
- 통과 조건: 두 OID 일치 (원문은 "matches" 로 서술).
**단계 G. push 후 CI 확인** (`SKILL.md:120-126`) — 비게이트(보고 규칙)
- 행동: `gh pr checks`
- 보고 규칙: `Report pending checks as pending. Inspect failures before attributing them to the branch or the environment.`
**단계 H. "no checks reported" 진단** (`SKILL.md:128-134`) — 조건부
- 트리거: `gh pr checks` 가 `no checks reported` 이고 `/actions/runs?head_sha=<sha>` 가 `total_count: 0`.
- 행동: `gh pr view <number> --json mergeable,mergeStateStatus` 로 먼저 확인.
- 원인 판정 (`SKILL.md:134`): `GitHub creates no pull_request workflow runs while a PR is CONFLICTING/DIRTY, so the absent signal is the conflict, not infrastructure.`
- 해결: `Resolving the conflict is the only fix`
- 금지: `empty commits, --allow-empty pushes, draft/ready toggles, and revert-and-restore bounces`
- 충돌 경로 확인: `git merge-tree --write-tree HEAD origin/<base>` (로컬 머지가 아직 불가할 때)

### 5.2 history 재작성 push 경로 (`SKILL.md:79-83`) — **[GATE]**
- 입력: standalone PR 브랜치 rebase 결과
- 행동 (push 전):
  > Before a standalone history rewrite, fetch the current remote branch and record its exact OID; publish with `--force-with-lease=<branch>:<observed-oid>` so a concurrent update aborts the push.
- `gh stack push` / `gh stack sync`: `supply lease protection for their managed branches.`
- 금지: `Raw --force is never allowed.`
- push 후 (`SKILL.md:83`):
  > After any rewritten push, fetch the live heads again and re-audit unresolved review threads, approvals, mergeability, and checks. Commit hashes and inline-comment anchors from before the rewrite are not current evidence.
- 통과 조건: lease 값이 관측 OID 와 일치해 push 가 성공.  불일치 시 push 가 abort 됨 (원문: `a concurrent update aborts the push`).

### 5.3 Post-sync validation (`SKILL.md:85-94`) — **[GATE]**
- 배경 (`SKILL.md:87`): `gh stack sync fetches, cascade-rebases, and pushes as one operation, so it cannot place local validation between rewrite and publication.`
- sync 전 요구: `require a clean worktree and record the official stack order and exact remote heads.`
- sync 후 4단계:
  1. `Re-query every branch head and the official GitHub stack order.`
  2. `Inspect the changed scope of every rewritten layer against its live PR base.`
  3. `Run the relevant evidence selected by this skill for each affected layer.`
  4. `Keep every PR unmerged and report validation as pending until all selected checks pass.`
- 실패 시 (`SKILL.md:94`):
  > If post-sync evidence fails, leave the lease-protected published heads in place, repair the failure, validate the repair, and publish the correction. Do not claim the sync made the stack ready merely because the command succeeded.
- 이는 "검증 후 push" 순서의 유일한 예외임을 `SKILL.md:8` 이 선언: `The sole ordering exception is gh stack sync`.

### 5.4 루프 구조
- 명시적 retry 상한/횟수: `원문에 명시 없음`.
- 수렴 구조: 실패 → 수정 → 재검증 → 재발행(post-sync) (`SKILL.md:94`). 종료 조건은 `until all selected checks pass` (`SKILL.md:92`).
- "한 번만 실행" 원칙: 통과한 체크의 중복 실행 금지 (6.1 참조).

### 5.5 사람 개입 지점
- 전체 로컬 리허설 요청 (`SKILL.md:77`), hook 우회 동의 (`SKILL.md:105`), 재작성 push 권한 (`SKILL.md:113` `authorized rewritten branch`, 부여 방식 `원문에 명시 없음`), e2e 자격 증명 (`SKILL.md:40`). 질문 라운드는 `원문에 명시 없음`.

## 6. 엔지니어링 규칙 분석

### 6.1 금지 규칙 (anti-pattern) 과 막으려는 실패 모드
| # | 원문 금지 | 위치 | 막으려는 실패 모드 |
|---|---|---|---|
| 1 | `Raw --force is never allowed.` | `SKILL.md:81` | 동시 갱신된 원격 커밋 덮어쓰기 |
| 2 | `Do not manually repeat a passing check merely because commit or push follows.` | `SKILL.md:42` | 중복 실행으로 시간 낭비 |
| 3 | `do not run typecheck immediately before pushing solely to duplicate the pre-push hook.` | `SKILL.md:42` | pre-push 훅과 typecheck 이중 실행 |
| 4 | `do not insert a standalone --` | `SKILL.md:44` | Vitest 가 `--` 를 받아 `-t` 필터 무력화, 전체 테스트 실행 |
| 5 | `Do not use --passWithNoTests, lower coverage thresholds, or narrow --coverage.include merely to hide an uncovered affected file.` | `SKILL.md:73` | 커버리지 미달을 설정 조작으로 은폐 |
| 6 | `do not recreate the removed check:pre-push aggregate.` | `SKILL.md:77` | 제거된 집계 스크립트 부활 |
| 7 | `Do not push and hope CI differs.` | `SKILL.md:98` | 실패 체크를 무시한 push |
| 8 | `Do not claim the sync made the stack ready merely because the command succeeded.` | `SKILL.md:94` | sync 성공을 검증 완료로 오인 |
| 9 | `empty commits, --allow-empty pushes, draft/ready toggles, and revert-and-restore bounces all leave total_count at zero and add junk history` | `SKILL.md:134` | CI 미실행을 인프라 문제로 오진해 쓰레기 커밋 생성 |
| 10 | "unbuilt `any` is an explicit local fallback, not strict evidence" 의 예외를 `production Remote types, ambient flags, or copied signatures` 에 두지 말 것 | `SKILL.md:34` | mock 타이핑 예외가 프로덕션 타입으로 누출 |
| 11 | `do not place them in snapshots/ or give them a *.snapshot.ts owner` (Session round trip 없는 기대 출력) | `SKILL.md:37` | 기대 출력 파일의 위치 오분류 |
| 12 | `Check the reported selected test count before treating a filtered run as focused evidence.` (부정형: 선택 수 미확인 상태로 focused 증거 취급 금지) | `SKILL.md:50` | 선택 테스트 0개/과다인데 통과로 간주 |
| 13 | 이전 커밋 해시·인라인 코멘트 앵커를 현재 증거로 사용 | `SKILL.md:83` | rewrite 이후 stale 증거 |
| 14 | `Keep every PR unmerged` 상태에서 머지 | `SKILL.md:92` | post-sync 미검증 머지 |

### 6.2 강제 규칙 — 변경 유형별 증거 매핑 (`SKILL.md:33-40`)
| 변경 유형 | 원문이 요구하는 검사 |
|---|---|
| Package or script behavior | `run the owning Vitest file or focused test name. Add adjacent package tests when a shared contract changes; leave repository-wide coverage to CI unless the change is genuinely cross-cutting or the user requests it.` |
| Remote mock typing | `Run pnpm run typecheck before handing off Remote/mock changes; rebuild missing, stale, or partial generated declarations before diagnosing remaining errors.` |
| Documentation, Agent Notes, catalogs, doc-linked comments | `run pnpm run doc-sync; run full lint when the documentation workflow requires it.` |
| Model-, editor-, CLI-, terminal-visible output | `run the focused keyless snapshot or real runnable-example scenario that owns the output.` |
| Expected-output placement | Session replay input + 기대 persisted output 은 최상위 `snapshots/` (`snapshot.yml` 이 shipped `dsh` profile 과 composition/header pin 명시; parent `session[.vN].jsonl`, child `session.<ordinal>[.vN].jsonl`, `the harness selects the highest generation per role`). Session round trip 없는 ARIA, geometry, generator, CLI, unit 기대값은 `tests/expected/`, `snapshots/` 배치와 `*.snapshot.ts` owner 금지. `Use the owning test:expected, test:web, or test lane.` |
| Profile and configuration placement | 6.3 참조 |
| Package manifests, public exports, build configuration, worker/bin entries, built runtime paths | `run pnpm run build, the relevant hygiene checks, and the owning built-artifact smoke.` |
| Real provider or agent behavior | `run the relevant pnpm run test:e2e target when credentials are available; never print secrets.` |

### 6.3 프로필·설정 배치 규칙 (`SKILL.md:38`)
| 대상 | 위치 |
|---|---|
| shipped `dsh` profile 의 cross-package 동작 | `apps/cli/tests/profiles/` |
| 패키지 전용 Loader composition | 해당 패키지의 `tests/fixtures/` |
| 사용자용 optional overlay | `apps/cli/config/examples/` + `docs/user/` 에 가이드 짝 |

### 6.4 수치·임계값 전수 (원문에 등장하는 모든 숫자)
| 수치 | 맥락 | 위치 |
|---|---|---|
| 100% | 파일별(per-file) 커버리지 임계값, 선택한 소스 범위 안에서도 적용 | `SKILL.md:62` |
| `total_count: 0` | 워크플로우 실행 0건 판정 값 | `SKILL.md:128, 134` |
| once (1회) | 관련 체크 실행 횟수 | `SKILL.md:8, 111` |
| 4단계 | Push procedure 번호 항목 | `SKILL.md:109-114` |
| 4단계 | Post-sync validation 번호 항목 | `SKILL.md:89-92` |
| 3가지 | 전체 로컬 리허설 허용 조건 | `SKILL.md:77` |
- 재시도 횟수, 타임아웃, 함수 길이, 파일 줄 수 상한, 커밋 단위 크기: `원문에 명시 없음`.
- 커버리지 전체 임계값(라인/브랜치 등 항목별 %)은 "configured" 라고만 쓰여 있고 100% 외 수치는 `원문에 명시 없음`.

### 6.5 검증 방식 (무엇을 근거로 "됐다"고 판정하는가)
| 근거 | 원문 |
|---|---|
| 테스트 통과 (좁은 범위) | `the narrowest available test or purpose-built check that would fail for its regression` (`SKILL.md:29`) |
| 커버리지 | per-file 100% 임계값 (`SKILL.md:62`) |
| 선택 테스트 수 | `Check the reported selected test count` (`SKILL.md:50`) |
| 타입체크 | pre-push 훅 `incremental repository typecheck` (`SKILL.md:8`), Remote/mock 은 `pnpm run typecheck` (`SKILL.md:34`) |
| 빌드 | `pnpm run build` + built-artifact smoke (`SKILL.md:39`) |
| 원격 ref 일치 | `git rev-parse HEAD origin/<branch>` (`SKILL.md:117`) |
| 원격 CI | `gh pr checks` (`SKILL.md:123`) |
| 머지 가능성 | `gh pr view --json mergeable,mergeStateStatus` (`SKILL.md:131`) |
| 자기 진술 | 단독 근거로 허용되지 않음. `Do not claim the sync made the stack ready merely because the command succeeded.` (`SKILL.md:94`) |
- 증거의 약한 형태를 명시적으로 구분: `unbuilt any is an explicit local fallback, not strict evidence` (`SKILL.md:34`).
- `vitest related` 한계 (`SKILL.md:73`): `cannot discover behavior reached only through configuration, dynamic loading, subprocesses, workers, built artifacts, or external providers; select those owning tests explicitly.`
- 사람 확인: 완료 판정에 사람의 승인을 요구하는 문장은 없음. `원문에 명시 없음`.

### 6.5a 도구 사용 규칙
- `pnpm --silent run change-scope --base <ref>` (base 추측·자동 fetch 없음, `SKILL.md:25`), `pnpm exec vitest run/related` (`SKILL.md:57, 67`), `--force-with-lease=<branch>:<observed-oid>` (`SKILL.md:81`), `gh pr checks`, `gh pr view --json mergeable,mergeStateStatus`, `git merge-tree --write-tree HEAD origin/<base>`.
- 금지 도구/옵션: raw `--force`, 독립 `--`, `--passWithNoTests`, `--allow-empty`. `allowed-tools` 필드 없음.
### 6.6 컨텍스트·토큰 규율
- 파일 읽기 범위 지시: `원문에 명시 없음`.
- 서브에이전트 위임: `원문에 명시 없음`.
- 요약·압축 지시: `원문에 명시 없음`.
- 출력 억제 관련: `pnpm --silent run change-scope` 의 `--silent` 로 pnpm 로그를 줄이는 효과가 있으나, 이유는 원문에 적혀 있지 않다 (`원문에 명시 없음`).
- 비밀 출력 금지: `never print secrets` (`SKILL.md:40`).

### 6.7 모호어의 조작적 정의
| 모호어 | 원문의 환산 | 위치 |
|---|---|---|
| "relevant" evidence | 6.2 표의 변경 유형 매핑 + `surfaces the diff actually reaches` | `SKILL.md:29` |
| "smallest / narrowest" | `the narrowest available test or purpose-built check that would fail for its regression` | `SKILL.md:29` |
| "focused" evidence | 선택된 테스트 수를 확인한 필터 실행 | `SKILL.md:50` |
| "cross-cutting" / "so broadly that no narrower set is credible" | 수치 기준 없음 (`원문에 명시 없음`) | `SKILL.md:33, 77` |
| "strict evidence" | `unbuilt any` 가 아닌, 재빌드된 선언으로 `pnpm run typecheck` 한 결과 | `SKILL.md:34` |
| "checks pass" | 선택된 모든 체크 통과 (`until all selected checks pass`) | `SKILL.md:92` |
| "exact lease" | `--force-with-lease=<branch>:<observed-oid>` | `SKILL.md:81` |
| "genuinely cross-cutting" | 환산 규칙 없음 | `SKILL.md:33` |
| "ready" (stack) | sync 성공이 아니라 post-sync 증거 통과 | `SKILL.md:94` |
| "ordinary push" | standalone/일반 push, 즉 post-sync 예외가 아닌 경우 | `SKILL.md:98, 109` |

## 7. 산출물

### 7.1 최종 결과물의 형태
- 코드 diff 를 만드는 스킬이 아니다. 산출물은 (1) 실행된 검증 명령의 결과, (2) push 된 원격 ref, (3) 상태 보고.
- 보고 형식 지시:
  - `Report pending checks as pending.` (`SKILL.md:126`)
  - `report validation as pending until all selected checks pass.` (`SKILL.md:92`)
  - hook 우회 시 `report exactly what failed and why CI is expected to differ.` (`SKILL.md:105`)
- 출력 포맷을 강제하는 템플릿(표, 헤더, 체크리스트 양식): `원문에 명시 없음`.

### 7.2 커밋·PR·브랜치 조작
| 동작 | 근거 |
|---|---|
| 일반 커밋 | `Commit normally and inspect any files changed by the pre-commit fixer before continuing.` (`SKILL.md:112`) |
| 일반 push | `Push normally` (`SKILL.md:113`) |
| lease push | `--force-with-lease=<branch>:<observed-oid>` (`SKILL.md:81`) |
| 스택 동기화 | `gh stack sync` (fetch + cascade rebase + push 를 한 번에), `gh stack push` |
| PR 상태 조회 | `gh pr checks`, `gh pr view` |
| PR draft/ready 전환 | description 에 `marking ready for review` 가 트리거로 등장하나, 전환 조작을 지시하는 문장은 없음. 반대로 `draft/ready toggles` 는 CI 미실행의 해결책으로 쓰지 말라고 금지 (`SKILL.md:134`) |
| PR 머지 | 스킬이 머지를 수행하라는 문장 없음. `Keep every PR unmerged` / `do not merge until the evidence passes` (`SKILL.md:8`) |

### 7.3 파괴적 동작
- history rewrite: 허용되지만 lease 필수 (`SKILL.md:81`). `gh stack sync` 는 rebase + 원격 push 를 자동 수행하는 파괴적 가능성이 있는 명령이며, 사전 요건은 `a clean worktree` 와 스택 순서·원격 head 기록 (`SKILL.md:87`).
- `--force` 단독: 금지 (`SKILL.md:81`).
- 파일 삭제, 마이그레이션: 지시 없음 (`원문에 명시 없음`).
- pre-commit fixer 가 파일을 수정함: 스킬은 수정된 파일을 `inspect` 하라고만 지시 (`SKILL.md:112`). 수정 결과의 재스테이징 방법은 `원문에 명시 없음`.
- hook 우회(`--no-verify` 등 구체 플래그명): 원문에 플래그명은 없다. 우회는 사용자 동의가 있을 때만 (`SKILL.md:105`).

## 8. 주의점 / 한계 (여기서만 평가)

### 8.1 오작동·과잉작동 시나리오
1. **change-scope 의 base 오지정.** `change-scope` 는 base 를 추측하지 않으므로 (`SKILL.md:25`), 에이전트가 잘못된 `<verified-base-ref>` 를 넣거나 fetch 를 빼먹으면 변경 범위 전체가 틀어져 이후 "최소 선택" 이 전부 잘못된 근거 위에 선다. 스킬은 "verify" 하라고만 하고 검증 방법(어떤 명령으로 live base 를 조회하는지)을 적지 않았다.
2. **과소 검증.** "전체 스위트를 반사적으로 돌리지 말라" 가 강조되어 있어, 에이전트가 영향 범위를 좁게 해석하면 회귀를 놓친다. "genuinely cross-cutting" 과 "so broadly that no narrower set is credible" 은 수치 기준이 없는 판단이다 (`SKILL.md:33, 77`).
3. **필터 실행 함정.** `--` 삽입 시 `-t` 필터가 무력화되어 의도치 않게 전체가 돈다 (`SKILL.md:44`). 스킬이 이를 경고하지만, pnpm 외 런처에서는 다르다고만 하고 해법은 없다 (`SKILL.md:50`).
4. **post-sync 이후 이미 퍼블리시된 상태.** `gh stack sync` 는 검증 전에 푸시를 끝낸다. 스킬도 이를 인정하며 (`SKILL.md:87`) 사후 검증과 머지 금지로 보완하지만, 실패 기간 동안 잘못된 head 가 원격에 노출된다. 노출 중 다른 사람이 해당 브랜치를 참조하는 경우의 안내는 `원문에 명시 없음`.
5. **레이어가 많은 스택.** post-sync 3단계가 "every rewritten layer" × "relevant evidence" 이므로 스택이 깊으면 비용이 커진다. 상한이나 병렬화 지침은 없다.
6. **실패 처리 루프 상한 없음.** 수정 → 재검증 → 재발행 반복에 횟수 상한이나 에스컬레이션 규칙이 없다 (`SKILL.md:94`).
7. **"실패가 환경 특이적" 오판 가능성.** `prove it` 절차(`SKILL.md:100-105`)가 있으나, 플랫폼 불일치를 "증명" 하는 기준이 기록 항목 나열에 그친다. hook 우회로 이어질 수 있는 지점이라 판단 오류의 비용이 크다.

### 8.2 다른 스킬·기존 규칙과의 충돌 가능 지점
- `dsh-ci-test-reliability` 와의 중복 가능성: 양쪽이 "어떤 증거를 돌릴지"를 다룬다. 이 스킬은 `This skill still selects the commands and avoids repeating evidence that already passed` 로 책임을 나눴지만 (`SKILL.md:31`), 선행 스킬이 이미 명령을 지정한 경우의 우선순위는 `원문에 명시 없음`.
- 일반적인 "push 전에 전체 테스트를 돌려라" 류의 CLAUDE.md 규칙과 정면 충돌한다. 이 스킬은 "Do not manually repeat a passing check" 와 "no universal local baseline beyond the hooks" 를 명시한다 (`SKILL.md:29, 42`).
- "항상 커밋 전 lint/format 수행" 류 규칙과도 겹칠 수 있다: pre-commit 이 이미 staged lint 를 fix 하므로 이 스킬은 수동 중복을 금한다.
- `gh stack sync` 를 쓰지 말라거나 rebase 를 금지하는 팀 규칙이 있으면 `SKILL.md:81` 과 충돌.
- `Raw --force is never allowed` 가 사용자의 직접 지시 `git push --force` 와 충돌할 때의 우선순위는 `원문에 명시 없음` (hook 우회에는 사용자 동의 규정이 있으나 force 에는 없다).

### 8.3 검증 공백
- 원문이 확인하지 않고 넘어가는 것:
  - `change-scope` JSON 의 구체 필드와 이를 변경 유형 매핑(6.2)으로 변환하는 규칙: 사람이 보고 판단하라는 구조이며 자동 매핑 표는 없음.
  - lease 사용 시 로컬 ref 가 observed OID 와 일치하는지 검증하는 단계: `fetch ... record its exact OID` 후 push 만 있고, 기록 후 재확인 지시는 없음.
  - push 후 `gh pr checks` 가 완료될 때까지 기다리는 시간/폴링 규칙: `원문에 명시 없음`. pending 으로 보고한다는 규칙만 있다.
  - 커버리지 외 정적 분석(보안 스캔, 의존성 감사 등): `원문에 명시 없음`.
  - e2e 자격 증명 부재 시 대체 증거: `when credentials are available` 이외에 `원문에 명시 없음`. 자격 증명이 없으면 검증이 비어 있는 채로 넘어갈 수 있다.
  - 플랫폼 매트릭스(OS별)는 CI 소유라고만 되어 있어 (`SKILL.md:8`) 로컬에서 확인하지 않는다.
  - 스킬이 `pnpm run doc-sync` 의 성공 기준, `hygiene checks` 가 무엇인지를 정의하지 않는다 (`SKILL.md:39`).
  - `unbuilt any` 상태를 감지하는 방법: 원문에 명시 없음. "rebuild missing, stale, or partial generated declarations" 라고만 한다.
- 완료 판정이 에이전트의 진술에 의존하는 부분: "relevant" 의 범위 판단, "cross-cutting" 판정, 환경 특이 실패의 입증.

### 8.4 유지보수 리스크
- 하드코딩된 리포지토리 경로가 많다: `packages/test-support/remote-mock/README.md`, `apps/cli/tests/profiles/`, `apps/cli/config/examples/`, `docs/user/`, `snapshots/`, `snapshot.yml`, `session[.vN].jsonl` 등 (`SKILL.md:34-38`). 디렉터리 구조 변경 시 스킬이 즉시 낡는다.
- 스크립트명 의존: `change-scope`, `doc-sync`, `test:snapshot`, `test:expected`, `test:web`, `test:e2e`. 이미 `check:pre-push` 가 제거된 이력이 본문에 남아 있어 (`SKILL.md:77`), 스크립트명 변동이 실제로 일어나는 리포지토리임을 알 수 있다.
- 훅 내용을 본문에 서술(`SKILL.md:8`)하고 있어, 훅 구성(pre-commit/pre-push 동작)이 바뀌면 스킬 본문과 어긋난다. 훅 설정 파일과의 동기화 장치는 `원문에 명시 없음`.
- 상대 링크 `../dsh-ci-test-reliability/SKILL.md`, `../../../packages/test-support/remote-mock/README.md` 가 디렉터리 이동 시 깨진다 (본 분석에서는 링크 대상 존재 여부를 확인하지 않음).

### 8.5 한 줄 판정
**조건부 도입 권장.** 근거: `pnpm` + Vitest + `gh stack` + 해당 리포지토리 스크립트(`change-scope`, `doc-sync` 등)가 모두 갖춰진 deepseek-harness 전용 환경에서는 "raw `--force` 금지 / lease 필수 / sync 후 머지 금지" 같은 구체적 게이트(`SKILL.md:81, 92, 94`)가 값어치를 하지만, 그 외 리포지토리에서는 스크립트·경로 의존성(`SKILL.md:34-40`) 때문에 그대로 쓸 수 없다.

