---
name: dsh-pre-push-checks
description: deepseek-harness 브랜치에서 push, force-push, 리뷰 준비 표시, 검사 통과 주장을 하기 전에, 그리고 gh stack sync가 다시 쓴 브랜치를 게시한 직후에, 전체 저장소 스위트를 반사적으로 돌리지 않고 나가는(또는 방금 게시된) diff를 다루는 가장 작은 테스트와 검사를 선택할 때 사용한다.
---

# DSH Pre-Push Checks

이 스킬은 `deepseek-harness` push 전에 관련 로컬 증거를 한 번 실행하는 데 사용한다. 순서의 유일한 예외는 `gh stack sync`로, 다시 쓴 레이어를 검증하기 전에 연쇄 리베이스를 게시할 수 있다. 이 경우 직후에 즉시 검증하고, 증거가 통과할 때까지 머지하지 마라. Git 훅은 의도적으로 좁게 설정되어 있다. pre-commit은 스테이징된 lint를 고치고, 스테이징된 공백을 검사하며, vendored 소스 메타데이터를 보호한다. pre-push는 증분 저장소 타입 체크(typecheck)만 실행한다. 전수 커버리지와 플랫폼 매트릭스는 CI가 맡는다.

## 나가는 변경 사항 검사하기

1. 체크아웃과 브랜치를 확인한다.

```sh
git status --short --branch
git rev-parse --show-toplevel
```

2. 현재 PR 베이스 또는 스택 부모를 확인하고, 해당 ref를 fetch한 뒤, 그것을 기준으로 전체 범위를 검사한다.

```sh
pnpm --silent run change-scope --base <verified-base-ref>
```

이 명령은 베이스를 추측하거나 fetch하지 않는다. 현재 원격 또는 스택 상태에서 확인한 ref를 제공하라. `HEAD`가 아닌 커밋을 검사할 때는 `--head <ref>`를 사용하라. 버전이 붙은 JSON은 커밋된 경로를 해석된 머지 베이스 기준 상대 경로로 기록하고, 스테이징됨/스테이징 안 됨/추적되지 않음 경로는 현재 워크트리를 설명한다. 변경된 베이스를 머지한 뒤에는 보고서를 다시 실행하고, 결합된 범위가 영향을 줄 수 있는 동작을 다시 평가하며, 머지로 무효화된 검사만 다시 실행하라.

## 관련 증거 선택하기

훅 외에 보편적인 로컬 기준선은 없다. 모든 동작 변경에는 그 회귀를 실패시킬 수 있는 가장 좁은 테스트 또는 목적에 맞게 만든 검사가 필요하다. diff가 실제로 닿는 영역에 대해서만 더 넓은 검사를 추가하라.

나가는 변경이 리소스를 소유하거나 비동기인 테스트, 픽스처, 헬퍼 또는 CI 실행 경로를 추가하거나 변경하면, 먼저 [dsh-ci-test-reliability](../dsh-ci-test-reliability/SKILL-KO.md)를 사용해 복원, 음성 대조군(negative control), 정지 상태 정리(quiescent teardown), 동시 프로세스 증거가 적용되는지 판단하라. 이 스킬은 여전히 명령을 선택하며, 이미 통과한 증거를 반복하지 않는다.

- **패키지 또는 스크립트 동작:** 소유 Vitest 파일 또는 집중된 테스트 이름을 실행한다. 공유 계약이 바뀌면 인접한 패키지 테스트를 추가한다. 변경이 진정으로 횡단적이거나 사용자가 요청하지 않는 한 저장소 전체 커버리지는 CI에 맡긴다.
- **Remote mock 타이핑:** 빌드되지 않은 `any`는 명시적인 로컬 폴백이지 엄격한 증거가 아니다. Remote/mock 변경을 넘기기 전에 `pnpm run typecheck`를 실행하라. 남은 오류를 진단하기 전에 누락되었거나 오래되었거나 불완전한 생성 선언을 다시 빌드하라. 이 예외는 [테스트 프록시](../../../packages/test-support/remote-mock/README.md#remote-proxy)에만 두고, 프로덕션 Remote 타입, ambient 플래그, 복사한 시그니처에는 절대 두지 마라.
- **문서, Agent Notes, 카탈로그, 또는 문서에 연결된 주석:** `pnpm run doc-sync`를 실행한다. 문서 워크플로가 요구하면 전체 lint를 실행한다.
- **모델, 에디터, CLI, 또는 터미널에 보이는 출력:** 그 출력을 소유한 집중된 keyless 스냅샷 또는 실제 실행 가능한 예제 시나리오를 실행한다.
- **기대 출력 배치:** 선택된 기록 Session 세대가 재생 입력이고 기대하는 영속 출력인 테스트는 최상위 `snapshots/` 아래에 두며, `snapshot.yml`이 배포된 `dsh` 프로필과 구성/헤더 핀을 명시한다. 표준 부모 파일은 `session[.vN].jsonl`, 자식은 `session.<ordinal>[.vN].jsonl`이며, 하네스는 역할별로 가장 높은 세대를 선택한다. 그 Session 왕복이 없는 ARIA, 기하, 생성기, CLI, 단위 기대값은 소유 테스트 옆의 `tests/expected/`에 둔다. 이를 `snapshots/`에 두거나 `*.snapshot.ts` 소유자를 부여하지 마라. 소유하는 `test:expected`, `test:web`, `test` 레인(lane)을 사용하라.
- **프로필과 구성 배치:** 배포된 `dsh` 프로필의 패키지 간 동작은 `apps/cli/tests/profiles/` 아래에 둔다. 패키지별 Loader 구성은 해당 패키지의 `tests/fixtures/` 아래에 둔다. 사용자 대상 선택적 오버레이는 `apps/cli/config/examples/`에 두고 `docs/user/` 아래의 가이드와 짝을 이룬다.
- **패키지 매니페스트, 공개 export, 빌드 구성, worker/bin 엔트리, 또는 빌드된 런타임 경로:** `pnpm run build`, 관련 위생(hygiene) 검사, 소유하는 빌드 산출물 스모크를 실행한다.
- **실제 프로바이더 또는 에이전트 동작:** 자격 증명이 있으면 관련 `pnpm run test:e2e` 대상을 실행한다. 비밀 값은 절대 출력하지 마라.

commit이나 push가 뒤따른다는 이유만으로 통과한 검사를 수동으로 반복하지 마라. 특히 pre-push 훅을 중복하려는 목적만으로 push 직전에 타입 체크를 실행하지 마라.

Vitest 파일 및 이름 필터는 `pnpm run`으로 스크립트 이름 바로 뒤에 직접 전달하라. 독립된 `--`를 넣지 마라. 그것은 Vitest에 전달되어 `-t` 필터링을 비활성화할 수 있다. 예를 들어 다음 명령은 헤드리스 스냅샷 시나리오 하나를 실행한다.

```sh
pnpm run test:snapshot snapshots/session/headless.snapshot.ts -t 'cordis-inspect-jsdoc'
```

이는 위의 pnpm 스크립트에 적용되며, npm과 다른 런처는 각자의 인자 전달 문법을 유지한다. 필터링한 실행을 집중된 증거로 취급하기 전에 보고된 선택 테스트 수를 확인하라.

### 영향받는 소스에 단위 커버리지 집중하기

테스트 선택과 커버리지 선택은 별개다. Vitest 파일 필터는 어떤 테스트를 실행할지 고르지만, 저장소 구성은 그 외에는 모든 `packages/*/*/src/**/*.ts` 파일을 측정한다. 단위 커버리지가 관련될 때는 소유 테스트와, 그 테스트가 커버리지를 증명해야 하는 소스 파일 또는 패키지를 모두 지정하라.

```sh
pnpm exec vitest run packages/<group>/<package>/tests/<behavior>.spec.ts \
  --coverage \
  --coverage.include='packages/<group>/<package>/src/**/*.ts'
```

동작이 정말로 한 모듈에 국한될 때는 정확한 소스 파일을 사용하라. 여러 영향받는 파일이나 패키지에 대해서는 `--coverage.include`를 반복하고, 그 범위를 실행하는 데 필요한 모든 소유 테스트 파일을 전달하라. 설정된 파일별 100% 임계값은 선택한 소스 범위 안에서 그대로 적용된다.

소유 테스트가 불분명하면 Vitest의 의존성 그래프로 후보 집합을 찾은 다음, 실행을 증거로 취급하기 전에 선택된 테스트를 검사하라.

```sh
pnpm exec vitest related packages/<group>/<package>/src/<changed>.ts \
  --run \
  --coverage \
  --coverage.include='packages/<group>/<package>/src/<changed>.ts'
```

`vitest related`는 구성, 동적 로딩, 서브프로세스, worker, 빌드 산출물, 외부 프로바이더를 통해서만 도달하는 동작을 찾을 수 없다. 그런 것은 소유 테스트를 명시적으로 선택하라. 커버되지 않은 영향 파일을 숨기려는 목적으로 `--passWithNoTests`를 사용하거나, 커버리지 임계값을 낮추거나, `--coverage.include`를 좁히지 마라. 선택한 패키지 범위가 집중된 테스트 하나가 그것을 커버하지 않아 실패하면, 다른 관련 소유 테스트를 추가하거나, 제외되는 모듈이 변경의 영향을 받을 수 없을 때만 소스 범위를 좁혀라.

## 전체 로컬 리허설

전체 로컬 근사는 사용자가 명시적으로 요청했을 때, CI 실패를 진단할 때, 또는 변경이 저장소 전반에 걸쳐 더 좁은 집합이 신뢰할 만하지 않을 때만 실행하라. 현재 워크플로와 패키지 스크립트를 목록으로 사용하고, 제거된 `check:pre-push` 집계를 다시 만들지 마라.

## 히스토리를 다시 쓰는 push 보호하기

리뷰 이후를 포함해, 독립 PR 브랜치와 스택 PR 브랜치 모두 리베이스가 허용된다. 독립 히스토리 재작성 전에 현재 원격 브랜치를 fetch하고 정확한 OID를 기록하라. `--force-with-lease=<branch>:<observed-oid>`로 게시해 동시 업데이트가 push를 중단시키게 하라. `gh stack push`와 `gh stack sync`는 관리하는 브랜치에 대해 lease 보호를 제공한다. 순수 `--force`는 절대 허용되지 않는다.

다시 쓴 push 이후에는 항상 라이브 head를 다시 fetch하고, 해결되지 않은 리뷰 스레드, 승인, 머지 가능 여부, 검사를 다시 감사하라. 재작성 이전의 커밋 해시와 인라인 코멘트 앵커는 현재 증거가 아니다.

### Post-sync 검증

`gh stack sync`는 fetch, 연쇄 리베이스, push를 하나의 작업으로 수행하므로 재작성과 게시 사이에 로컬 검증을 넣을 수 없다. 실행하기 전에 깨끗한 워크트리를 요구하고, 공식 스택 순서와 정확한 원격 head를 기록하라. 명령이 반환된 후:

1. 모든 브랜치 head와 공식 GitHub 스택 순서를 다시 조회한다.
2. 다시 쓴 각 레이어의 변경 범위를 라이브 PR 베이스 기준으로 검사한다.
3. 영향받는 각 레이어에 대해 이 스킬이 선택한 관련 증거를 실행한다.
4. 선택한 모든 검사가 통과할 때까지 모든 PR을 머지하지 않은 상태로 유지하고 검증을 보류 중으로 보고한다.

post-sync 증거가 실패하면 lease로 보호된 게시된 head는 그대로 두고, 실패를 고치고, 수정을 검증한 뒤, 정정본을 게시하라. 명령이 성공했다는 이유만으로 sync가 스택을 준비 완료로 만들었다고 주장하지 마라.

## 실패 처리하기

일반 push 전에 관련 검사가 실패하면 중단하고 고치거나 차단 요인을 설명하라. push해 놓고 CI가 다르기를 바라지 마라. post-sync 예외의 경우 머지를 차단하고 위의 복구 절차를 따르라.

실패가 환경에 특정된 것처럼 보이면 그것을 증명하라.

- 정확한 명령, 실패한 테스트, 플랫폼별 불일치를 기록한다.
- 관련된 비플랫폼 증거를 확인한다.
- 검사가 필수라면 플랫폼 간 비결정성을 고치는 쪽을 택한다.
- 사용자가 명시적으로 요청하거나 동의할 때만 로컬 훅을 우회하고, 정확히 무엇이 왜 실패했는지와 CI가 다를 것으로 예상되는 이유를 보고한다.

## Push 절차

일반 push와 독립 리베이스 push의 경우:

1. 선택한 관련 검사를 한 번 실행한다.
2. 평소처럼 commit하고, 계속하기 전에 pre-commit fixer가 변경한 파일을 검사한다.
3. 증분 타입 체크 훅이 실행되도록 평소처럼 push하거나, 승인된 재작성 브랜치에는 정확한 lease를 사용한다.
4. 원격 ref가 로컬 `HEAD`와 일치하는지 확인한다.

```sh
git rev-parse HEAD origin/$(git branch --show-current)
```

GitHub PR의 경우 push 후 원격 CI를 검사한다.

```sh
gh pr checks
```

보류 중인 검사는 보류 중으로 보고하라. 실패를 브랜치나 환경 탓으로 돌리기 전에 먼저 검사하라.

`gh pr checks`가 "no checks reported"를 보고하고 `/actions/runs?head_sha=<sha>`가 `total_count: 0`을 반환하면, push나 누락된 GitHub 이벤트를 의심하기 전에 머지 가능 여부를 읽어라.

```sh
gh pr view <number> --json mergeable,mergeStateStatus
```

GitHub는 PR이 `CONFLICTING`/`DIRTY`인 동안 `pull_request` 워크플로 실행을 만들지 않으므로, 신호가 없는 원인은 인프라가 아니라 충돌이다. 충돌을 해결하는 것이 유일한 해결책이다. 빈 커밋, `--allow-empty` push, draft/ready 토글, revert-and-restore 바운스는 모두 `total_count`를 0으로 둔 채 쓸모없는 히스토리만 추가한다. 브랜치를 아직 로컬에서 머지할 수 없을 때는 `git merge-tree --write-tree HEAD origin/<base>`로 충돌 경로를 확인하라.

`gh stack sync`의 경우 일반 순서가 가능했던 척하지 말고 post-sync 검증 순서를 사용하라.
