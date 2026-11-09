---
name: dsh-pre-push-checks
description: Use before pushing, force-pushing, marking ready for review, or claiming checks pass on a deepseek-harness branch, and immediately after gh stack sync publishes rewritten branches — deepseek-harness 브랜치를 push, force-push, ready for review 전환, 체크 통과 주장을 하기 전에, 그리고 gh stack sync가 재작성된 브랜치를 게시한 직후에 사용한다. 전체 저장소 테스트 스위트를 습관적으로 돌리지 않고, 나가는(또는 방금 게시된) diff를 덮는 가장 작은 테스트와 검사를 고른다.
---

# DSH Pre-Push Checks

이 스킬은 `deepseek-harness` push 전에 관련 로컬 증거를 한 번 실행할 때 쓴다. 예외는 `gh stack sync`뿐이다. 이 명령은 재작성된 layer를 검증하기 전에 cascading rebase를 먼저 게시할 수 있다. 그 경우에는 직후에 검증하고, 증거가 통과하기 전까지 merge하지 않는다. Git hook은 의도적으로 좁다. pre-commit은 staged lint를 고치고, staged whitespace를 검사하고, vendored source 메타데이터를 보호한다. pre-push는 증분 repository typecheck만 실행한다. 전체 커버리지와 플랫폼 matrix는 CI가 담당한다.

## 나가는 변경 점검

1. checkout과 브랜치를 확인한다.

```sh
git status --short --branch
git rev-parse --show-toplevel
```

2. 살아 있는 PR base나 stack parent를 확인하고, 그 ref를 fetch한 뒤 전체 범위를 그 기준으로 검사한다.

```sh
pnpm --silent run change-scope --base <verified-base-ref>
```

이 명령은 base를 추측하거나 가져오지 않는다. 현재 remote나 stack 상태에서 확인한 ref를 넘긴다. `HEAD`가 아닌 commit을 검사할 때는 `--head <ref>`를 쓴다. 버전이 붙은 JSON은 커밋된 경로를 해결된 merge base 기준으로 기록한다. staged, unstaged, untracked 경로는 현재 worktree를 나타낸다. 변경된 base를 merge한 뒤에는 보고서를 다시 실행하고, 합쳐진 범위가 영향을 줄 수 있는 동작을 다시 판단한다. merge로 무효화된 검사만 다시 실행한다.

## 관련 증거 고르기

hook 말고는 저장소 전체에 공통으로 적용되는 로컬 기준선이 없다. 모든 동작 변경에는 그 회귀에서 실패할 가장 좁은 테스트나 목적에 맞는 검사가 필요하다. 변경이 실제로 닿는 표면에 대해서만 더 넓은 검사를 추가한다.

변경이 자원을 소유하거나 비동기인 테스트, fixture, helper, CI 실행 경로를 추가하거나 바꾸면, 먼저 [dsh-ci-test-reliability](../dsh-ci-test-reliability/SKILL.md)로 restoration, negative-control, quiescent-teardown, concurrent-process 증거가 필요한지 판단한다. 이 스킬은 여전히 명령을 고르고, 이미 통과한 증거를 반복하지 않게 한다.

- **패키지나 스크립트 동작:** 소유하는 Vitest 파일이나 집중 테스트 이름을 실행한다. 공유 계약이 바뀌면 인접 패키지 테스트를 추가한다. 변경이 정말 저장소를 가로지르거나 사용자가 요청하지 않는 한 저장소 전체 coverage는 CI에 맡긴다.
- **Remote mock 타입:** 빌드되지 않은 `any`는 명시적인 로컬 fallback이지 엄격한 증거가 아니다. Remote/mock 변경을 넘기기 전에 `pnpm run typecheck`를 실행한다. 남은 오류를 진단하기 전에 누락, 오래됨, 부분적인 생성 선언을 다시 빌드한다. 예외는 [test proxy](../../../packages/test-support/remote-mock/README.md#remote-proxy)에만 둔다. production Remote 타입, ambient 플래그, 복사된 시그니처에는 두지 않는다.
- **문서, Agent Note, 카탈로그, 문서와 연결된 주석:** `pnpm run doc-sync`를 실행한다. 문서 워크플로가 요구하면 전체 lint도 실행한다.
- **모델, 편집기, CLI, 터미널에 보이는 출력:** 그 출력을 소유하는 키 없는(keyless) 집중 snapshot이나 실제 실행 가능한 예제 시나리오를 실행한다.
- **기대 출력의 위치:** 선택된 기록 Session 세대가 replay 입력이자 기대 영속 출력인 테스트는 최상위 `snapshots/` 아래에 둔다. `snapshot.yml`에는 배포되는 `dsh` profile과 composition/header pin을 적는다. 정식 부모 파일은 `session[.vN].jsonl`이고, 자식은 `session.<ordinal>[.vN].jsonl`이다. harness는 역할마다 가장 높은 세대를 고른다. 이런 Session round trip 없이 확인하는 ARIA, geometry, generator, CLI, unit 기대값은 소유 테스트 옆 `tests/expected/`에 둔다. `snapshots/`에 두거나 `*.snapshot.ts` 소유자를 주지 않는다. 해당하는 `test:expected`, `test:web`, `test` 레인을 쓴다.
- **Profile과 설정의 위치:** 배포되는 `dsh` profile의 패키지 간 동작은 `apps/cli/tests/profiles/` 아래에 둔다. 특정 패키지의 Loader composition은 그 패키지의 `tests/fixtures/` 아래에 둔다. 사용자가 쓰는 선택적 overlay는 `apps/cli/config/examples/`에 두고, 짝이 되는 안내 문서를 `docs/user/`에 둔다.
- **패키지 manifest, 공개 export, 빌드 설정, worker/bin entry, 빌드된 런타임 경로:** `pnpm run build`, 관련 hygiene 검사, 소유하는 built-artifact smoke를 실행한다.
- **저장소 테스트와 스크립트 타입:** `pnpm run build:artifacts`는 패키지 project만 검사한다. TypeScript 변경의 완료를 주장하기 전에는 최신 `build:artifacts` 이후 `pnpm run build:check`를 실행하거나 `pnpm run build`를 실행한다. `build:check`는 기존 `build:artifacts` 출력을 읽기만 하고 다시 빌드하지 않는다.
- **실제 provider나 agent 동작:** 자격 증명이 있을 때 관련 `pnpm run test:e2e` 대상을 실행한다. 비밀 값은 절대 출력하지 않는다.

커밋이나 push가 이어진다는 이유만으로 통과한 검사를 수동으로 반복하지 않는다. 특히 pre-push hook과 중복하려고 push 직전에 typecheck를 따로 돌리지 않는다.

Vitest 파일과 이름 필터는 `pnpm run` 뒤 스크립트 이름 바로 다음에 그대로 넘긴다. 단독 `--`를 넣지 않는다. `--`는 Vitest에 전달되어 `-t` 필터링을 끌 수 있다. 예를 들어 아래 명령은 키 없는 headless snapshot 시나리오 하나를 실행한다.

```sh
pnpm run test:snapshot snapshots/session/headless.snapshot.ts -t 'cordis-inspect-jsdoc'
```

이 규칙은 pnpm 스크립트에 적용된다. npm과 다른 launcher는 자체 인자 전달 문법을 쓴다. 필터가 걸린 실행을 집중 증거로 간주하기 전에 보고된 선택 테스트 수를 확인한다.

### 영향받는 소스로 unit coverage 좁히기

테스트 선택과 coverage 선택은 별개다. Vitest 파일 필터는 어떤 테스트를 실행할지 고른다. 반면 저장소 설정은 그 밖에도 모든 `packages/*/*/src/**/*.ts` 파일을 측정한다. unit coverage가 관련 있을 때는 소유 테스트와 함께, 그 테스트가 증명해야 하는 소스 파일이나 패키지를 이름으로 지정한다.

```sh
pnpm exec vitest run packages/<group>/<package>/tests/<behavior>.spec.ts \
  --coverage \
  --coverage.include='packages/<group>/<package>/src/**/*.ts'
```

동작이 한 모듈에만 국한될 때만 정확한 소스 파일을 쓴다. 영향받는 파일이나 패키지가 여럿이면 `--coverage.include`를 반복한다. 그 범위를 연습하는 데 필요한 소유 테스트 파일을 모두 넘긴다. 선택된 소스 범위 안에서도 설정된 파일별 100% 임계값은 그대로 적용된다.

소유 테스트가 분명하지 않으면 Vitest의 의존성 그래프로 후보 집합을 찾고, 그 테스트를 확인한 뒤에야 실행 결과를 증거로 쓴다.

```sh
pnpm exec vitest related packages/<group>/<package>/src/<changed>.ts \
  --run \
  --coverage \
  --coverage.include='packages/<group>/<package>/src/<changed>.ts'
```

`vitest related`는 설정, 동적 로딩, subprocess, worker, 빌드된 artifact, 외부 provider를 통해서만 도달하는 동작을 찾지 못한다. 그런 경우에는 소유 테스트를 직접 고른다. 커버되지 않은 영향 파일을 숨기려고 `--passWithNoTests`를 쓰거나, coverage 임계값을 낮추거나, `--coverage.include`를 좁히지 않는다. 선택한 패키지 범위가 집중 테스트 하나에서 커버되지 않아 실패하면, 관련된 다른 소유 테스트를 추가한다. 제외된 모듈이 이번 변경의 영향을 받을 수 없을 때만 소스 범위를 좁힌다.

## 전체 로컬 리허설

사용자가 명시적으로 요청했거나, CI 실패를 진단하고 있거나, 변경이 저장소 전체에 너무 넓게 걸쳐 더 좁은 집합이 타당하지 않을 때만 전체 로컬 근사 실행을 한다. 현재 워크플로와 패키지 스크립트를 목록의 기준으로 쓴다. 제거된 `check:pre-push` 통합 명령을 다시 만들지 않는다.

## 히스토리를 다시 쓰는 push 보호

독립형 PR 브랜치와 stacked PR 브랜치 모두 리뷰 후를 포함해 rebase가 허용된다. 독립형 히스토리를 다시 쓰기 전에는 현재 remote 브랜치를 fetch하고 정확한 OID를 기록한다. 그다음 `--force-with-lease=<branch>:<observed-oid>`로 게시해서, 동시에 업데이트가 일어나면 push가 중단되게 한다. `gh stack push`와 `gh stack sync`는 관리하는 브랜치에 lease 보호를 제공한다. raw `--force`는 허용하지 않는다.

재작성된 push가 끝나면 live head를 다시 fetch하고, 미해결 리뷰 thread, 승인, mergeability, 체크를 다시 점검한다. 재작성 전의 commit hash와 inline comment 앵커는 현재 증거가 아니다.

### 동기화 후 검증

`gh stack sync`는 fetch, cascade rebase, push를 하나의 작업으로 수행한다. 따라서 재작성과 게시 사이에 로컬 검증을 끼워 넣을 수 없다. 실행 전에는 worktree가 깨끗한지 확인하고, 공식 stack 순서와 정확한 remote head를 기록한다. 실행이 끝나면 다음을 한다.

1. 모든 브랜치 head와 공식 GitHub stack 순서를 다시 조회한다.
2. 재작성된 각 layer의 변경 범위를 live PR base와 대조해 검사한다.
3. 이 스킬이 고른 관련 증거를 영향받는 layer마다 실행한다.
4. 선택된 모든 검사가 통과하기 전까지 모든 PR을 merge하지 않은 상태로 두고, 검증은 보류 중으로 보고한다.

동기화 후 증거가 실패하면 lease로 보호된 게시 head는 그대로 둔다. 실패를 고치고, 수정을 검증하고, 정정본을 게시한다. 명령이 성공했다고 해서 stack이 준비되었다고 주장하지 않는다.

## 실패 처리

일반 push 전에 관련 검사가 실패하면 멈추고 blocker를 고치거나 설명한다. push한 뒤 CI가 다르게 나오기를 기대하지 않는다. 동기화 후의 예외에서는 merge를 막고, 위의 복구 절차를 따른다.

실패가 환경 특유의 것으로 보이면 그것을 증명한다.

- 정확한 명령, 실패한 테스트, 플랫폼 특유의 불일치를 기록한다.
- 플랫폼과 무관한 관련 증거를 확인한다.
- 필수 검사라면 플랫폼 간에 달라지는 비결정성을 고치는 쪽을 우선한다.
- 사용자가 명시적으로 요청하거나 동의한 경우에만 로컬 hook을 우회한다. 무엇이 실패했고 왜 CI에서는 다를 것으로 예상하는지 정확히 보고한다.

## Push 절차

일반 push와 독립형 rebase push에서는 다음 순서를 따른다.

1. 선택한 관련 검사를 한 번 실행한다.
2. 평소처럼 commit하고, pre-commit fixer가 바꾼 파일을 확인한 뒤 진행한다.
3. 평소처럼 push하거나, 승인된 재작성 브랜치라면 정확한 lease를 써서 push한다. 그래야 증분 typecheck hook이 실행된다.
4. remote ref가 로컬 `HEAD`와 같은지 확인한다.

```sh
git rev-parse HEAD origin/$(git branch --show-current)
```

GitHub PR이라면 push 후 원격 CI를 확인한다.

```sh
gh pr checks
```

대기 중인 체크는 대기 중으로 보고한다. 실패를 브랜치 탓으로 돌리거나 환경 탓으로 돌리기 전에 실패 내용을 확인한다.

`gh pr checks`가 "no checks reported"를 보고하고, `/actions/runs?head_sha=<sha>`가 `total_count: 0`을 반환하면, push나 누락된 GitHub 이벤트를 의심하기 전에 mergeability를 확인한다.

```sh
gh pr view <number> --json mergeable,mergeStateStatus
```

GitHub는 PR이 `CONFLICTING`/`DIRTY` 상태인 동안에는 `pull_request` 워크플로 실행을 만들지 않는다. 따라서 빠져 있는 신호는 인프라 문제가 아니라 충돌이다. 충돌을 해결하는 것이 유일한 수정이다. 빈 commit, `--allow-empty` push, draft/ready 전환, revert 후 복원 같은 조작은 모두 `total_count`를 0으로 남기고 쓸모없는 히스토리만 늘린다. 브랜치를 아직 로컬에서 merge할 수 없다면 `git merge-tree --write-tree HEAD origin/<base>`로 충돌 경로를 확인한다.

`gh stack sync`라면 일반 순서가 불가능했던 것처럼 행동하지 말고, 동기화 후 검증 순서를 따른다.
