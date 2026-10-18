# dsh-ci-test-reliability 분석

## 1. 개요

- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-ci-test-reliability/`
- 컬렉션: deepseek-harness
- 읽은 파일 (전수, 총 2개):

| 파일 | 바이트 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 9434 | 131 | 핵심 파일. 테스트 격리·신뢰성 설계 규칙 전체 |
| `references/ci-flake-diagnosis.md` | 5346 | 60 | 보조 파일. 기존 flaky CI 실패를 조사할 때만 읽는 진단 워크플로우 |

- `scripts/`, `templates/`, `assets/` 디렉터리: 존재하지 않음 (find 결과 파일 2개뿐). 실행 스크립트 없음.
- 성격 한 줄: **검증(verification) + 감사(audit)** 성격의 규칙집. 테스트를 "새로 설계/수정"할 때의 설계 지침(construction 요소)과, 이미 발생한 flaky 실패를 "진단"하는 절차(audit)가 한 스킬에 섞여 있다. 코드를 생성하는 템플릿은 없다.
- 원문 자기 규정:
  > Build tests that remain correct under the repository's real CI topology, not only when run alone on a quiet workstation. This skill owns isolation and reliability decisions; it does not replace the repository's test-tier policy or select every command for a push. (`SKILL.md:8`)
  - 번역: 조용한 개발자 PC에서 혼자 돌 때만이 아니라 실제 CI 토폴로지에서도 올바른 테스트를 만든다. 이 스킬은 격리·신뢰성 결정을 소유하며, 저장소의 테스트 계층 정책을 대체하거나 push용 명령 전체를 고르지는 않는다.
- 본문 제목: `# Reliable DSH CI tests` (`SKILL.md:6`)
- 소유 범위의 경계: 이 스킬은 "격리와 신뢰성 결정"만 소유하고, 테스트 계층 선택은 `docs/testing.md`, 수명주기 패턴은 `docs/defensive-patterns.md`, push 전 명령 선택은 `dsh-pre-push-checks` 스킬이 소유한다 (`SKILL.md:12-16`).

## 2. 활성화 조건 (언제 켜지는가)

### frontmatter `description` 전문

> Design, review, and diagnose DeepSeek Harness tests and fixtures that can fail nondeterministically under CI concurrency, shared host resources, clocks, process-global state, subprocesses, network listeners, or asynchronous teardown. Use when adding or changing tests with those risks, investigating flaky CI, or reviewing test isolation; use dsh-pre-push-checks separately to select outgoing commands. (`SKILL.md:3`)

- 번역: CI 동시성, 공유 호스트 자원, 시계, 프로세스 전역 상태, 서브프로세스, 네트워크 리스너, 비동기 teardown 때문에 비결정적으로 실패할 수 있는 DeepSeek Harness 테스트·픽스처를 설계·리뷰·진단한다. 그런 위험이 있는 테스트를 추가/변경할 때, flaky CI를 조사할 때, 테스트 격리를 리뷰할 때 사용. 나가는 명령 선택은 `dsh-pre-push-checks`를 별도로 쓴다.

### 매칭되는 사용자 발화 예시 (트리거 사전 추출)

description의 키워드(flaky CI, test isolation, nondeterministically, CI concurrency, shared host resources, clocks, process-global state, subprocesses, network listeners, asynchronous teardown)에서 추출한 발화다. 아래 문장들은 원문에 있는 문장이 아니라 해당 키워드와 매칭되는 발화 예시다.

1. "CI에서 이 테스트가 가끔만 실패해요. flaky 원인 좀 조사해 주세요." (investigating flaky CI)
2. "테스트에서 로컬 HTTP 서버를 띄우는 픽스처를 추가하려고 해요." (network listeners)
3. "이 테스트가 `process.env`를 바꾸는데 다른 테스트에 새는 것 같아요. 격리 리뷰해 줘." (process-global state, reviewing test isolation)
4. "fake timer를 쓰는 테스트를 새로 작성할게요." (clocks)
5. "자식 프로세스를 spawn하는 테스트가 Windows CI에서만 간헐적으로 timeout 나요." (subprocesses, platform)
6. "테스트가 고정 포트 4000을 쓰는데 병렬 실행하면 EADDRINUSE가 나요." (shared host resources, CI concurrency)
7. "afterEach에서 server.close()를 호출하는데 다음 테스트에 로그가 섞여 나와요." (asynchronous teardown)
8. "이 PR의 테스트들이 test isolation 관점에서 안전한지 리뷰해 줘." (reviewing test isolation)

### 의도적으로 배제되는 발화와 넘길 스킬

| 발화 유형 | 넘길 대상 | 근거 |
|---|---|---|
| "push 전에 어떤 명령을 돌려야 해?" | `dsh-pre-push-checks` | `use dsh-pre-push-checks separately to select outgoing commands` (`SKILL.md:3`), `SKILL.md:16`, `SKILL.md:131` |
| 단위/커버리지/expected-output/snapshot/browser/real-API 중 어떤 증거를 쓸지 | `docs/testing.md` (스킬 아님, 문서) | `SKILL.md:12` |
| lifecycle/subprocess/cancellation/teardown 동작 패턴 자체 | `docs/defensive-patterns.md` (문서) | `SKILL.md:13` |
| 기록된 세션(recorded-session) 시나리오 | `snapshots/AGENTS.md` 지침을 추가로 따름 | `SKILL.md:15` |
| 단순 진단 요청에서 수정까지 요구하지 않은 경우 | 이 스킬 안에서 읽기 전용으로 처리 (넘기는 게 아니라 범위 제한) | `SKILL.md:120`, `ci-flake-diagnosis.md:3` |

- "배제되는 발화"에 대한 명시적 부정 트리거("Do NOT use for...")는 description에 없다. 명시된 배제는 "push 명령 선택은 `dsh-pre-push-checks`" 하나뿐이다.
- 위험 키워드가 없는 일반 테스트 작성(순수 함수 단위 테스트 등)이 이 스킬 범위 밖이라는 문장은 원문에 명시 없음. description의 "with those risks"가 간접 한정어다.

### 기타 frontmatter 필드

- `name`: `dsh-ci-test-reliability` (`SKILL.md:2`)
- `description`: 위 인용 (`SKILL.md:3`)
- `allowed-tools`, `model`, `metadata` 등 다른 필드: 없음. frontmatter는 `name`, `description` 두 필드뿐 (`SKILL.md:1-4`).

## 3. 적합 / 부적합

### 적합

원문이 직접 열거하는 위험 상황 기준이다.

- 한 Vitest 파일 안, 여러 파일/워커, 한 job 안의 독립 Vitest/repository-gate 프로세스, 같은 호스트를 공유하는 서로 다른 Actions job 러너가 겹칠 수 있는 CI (`SKILL.md:20-25`).
- 포트, 소켓, DB, 예측 가능한 파일 경로, 서브프로세스, 외부 서비스를 획득하는 테스트 픽스처 (`SKILL.md:27`).
- `process.env`, `cwd`, fake timers, locale/timezone, module mocks, registries, console hooks, `globalThis`, global `fetch` interception을 건드리는 테스트 (`SKILL.md:45`).
- Windows와 POSIX 양쪽에서 CI가 도는 저장소: `CI runs the same suite on Windows and on POSIX hosts` (`SKILL.md:58`).
- self-hosted 러너 풀에서 같은 시그니처가 서로 무관한 브랜치에 반복되는 간헐 실패 (`ci-flake-diagnosis.md:24`).
- 테스트 timeout이 대상(subject)인 케이스 (`SKILL.md:73`).

### 부적합·과함

원문이 부적합을 직접 선언한 문장은 없다. 아래는 원문에 박힌 범위 한정 문장에서 읽히는 사실만 적는다.

- 순수 파서 입력/기대값으로만 쓰이는 리터럴 경로·URL: `Literal paths and URLs used only as parser inputs or expected values are not acquired resources. Do not rewrite them merely because they look fixed.` (`SKILL.md:41`) — 이 경우 스킬이 "고치지 말라"고 명시한다.
- 진단만 요청받은 경우 수정·워크플로우 rerun·CI 설정 변경은 하지 않는다: `diagnosis does not authorize a fix, workflow rerun, or CI configuration change` (`ci-flake-diagnosis.md:3`).
- 소규모 스크립트, 프로토타입, 핫픽스에 대해 이 스킬을 끄라는 문장: 원문에 명시 없음.
- DeepSeek Harness 저장소가 아닌 프로젝트에서의 사용 가능 여부: 원문에 명시 없음. 본문이 `docs/testing.md`, `snapshots/AGENTS.md`, `dsh-pre-push-checks` 등 이 저장소 고유 경로를 참조한다 (`SKILL.md:12-16`).

### 형제 스킬 대신 이걸 고르는 판정 기준 한 줄

테스트가 "혼자 돌면 통과하지만 CI 동시성·공유 호스트·전역 상태 아래서 비결정적으로 깨질 수 있는가"이면 이 스킬, "무슨 명령을 돌려 push할지"이면 `dsh-pre-push-checks`.

## 4. 전제 조건과 외부 의존성

- 실행 스크립트: 없음 (`scripts/` 디렉터리 부재).
- 런타임·패키지: 스킬 자체는 설치할 것이 없다. 다만 본문이 전제하는 기술 스택은 다음과 같다.
  - Vitest (`SKILL.md:22-24`, `SKILL.md:69` `--testTimeout`)
  - Node.js 계열 API: `listen(0)`, `mkdtemp`, `process.env`, `globalThis`, global `fetch` (`SKILL.md:35-36`, `SKILL.md:45`)
  - GitHub Actions (`SKILL.md:25`, `SKILL.md:14`, `ci-flake-diagnosis.md:11`)
- CLI 도구: git/gh/docker/playwright 등을 명시한 문장은 원문에 명시 없음. "Use Actions logs and metadata" (`ci-flake-diagnosis.md:11`)로 Actions 로그/메타데이터 접근이 필요하지만 어떤 CLI로 가져오라는 지시는 없다.
- API 키·환경변수·네트워크: 스킬이 요구하는 것 불필요. 단 real-API 정책 테스트는 외부 provider 경계에 있으며 (`SKILL.md:114`) 이 스킬은 그 정책을 대체하지 않는다.
- 리포지토리 전제:
  - 활성 Vitest 설정과 GitHub 워크플로우 파일이 존재하고 읽을 수 있어야 한다: `Read the active Vitest config and GitHub workflow when their worker or job topology affects the test.` (`SKILL.md:14`)
  - `docs/testing.md`, `docs/defensive-patterns.md`, `snapshots/AGENTS.md`, `../dsh-pre-push-checks/SKILL.md` 존재 가정 (`SKILL.md:12-16`). 이 파일들은 이번 분석 대상 디렉터리 밖이어서 읽지 않았다. 내용은 원문에 명시 없음.
  - 린터, 타입 시스템, 커밋 권한, 브랜치 전략 요구: 원문에 명시 없음.
  - 플랫폼: Windows·POSIX 양쪽 CI 존재를 전제 (`SKILL.md:58`).
- 비용 발생 지점:
  - 유료 API/토큰 비용에 대한 언급: 원문에 명시 없음.
  - CI 분: 진단 시 "Stress runs", "run independent test processes concurrently", "separate jobs or runner processes" (`SKILL.md:96`, `SKILL.md:100`, `ci-flake-diagnosis.md:36`) 가 CI/로컬 실행 시간을 쓰지만 비용 수치는 원문에 명시 없음.
- 상태 파일·산출물 디렉터리: 이 스킬이 생성하는 `plan.md`, `TODO`, `.claude/` 등 상태 파일은 원문에 명시 없음. 테스트 코드가 `mkdtemp`로 임시 루트를 만들라는 지시는 있으나 (`SKILL.md:36`) 그것은 스킬이 아니라 작성될 테스트의 동작이다.

## 5. 워크플로우

이 스킬은 단계 번호가 붙은 단일 순차 워크플로우가 아니라 "섹션별 규칙집"이다. SKILL.md의 섹션 순서와, 진단 모드에서 ci-flake-diagnosis.md의 섹션 순서를 각각 정리한다. 순서 강제 문구("run in order", "do not skip")는 SKILL.md 본문에 없다. 유일한 번호 순서는 토폴로지 계층 목록(`SKILL.md:22-25`)과 재현 사다리(`ci-flake-diagnosis.md:32-36`)다.

### 5-A. 테스트 설계/변경 모드 (SKILL.md 섹션 순서)

| # | 단계 (원문 제목) | 입력 | 행동 | 출력 | 통과 조건 | 게이트 |
|---|---|---|---|---|---|---|
| 1 | Read the owning rules (`:10`) | 변경 대상 테스트 | testing.md, defensive-patterns.md, 활성 Vitest config, GitHub workflow, 필요 시 snapshots/AGENTS.md를 읽음 | 적용할 정책 파악 | 명시된 통과 기준 없음 | 아님 |
| 2 | Model the execution topology (`:18`) | 테스트와 CI 설정 | 4개 겹침 계층을 가정하고 획득 자원마다 owner, atomic allocation mechanism, observable readiness signal, registered cleanup, quiescent completion signal 5가지를 식별 | 자원별 5요소 식별 | 5요소가 식별됨 | 아님 (식별 의무) |
| 3 | Allocate resources atomically (`:31`) | 획득 자원 목록 | `listen(0)`, `mkdtemp`, 고유 네임스페이스, exclusive creation 사용 | 격리된 자원 할당 | check-then-claim 패턴 없음 | 아님 |
| 4 | Contain process-global state (`:43`) | 전역 상태 변경 | 주입 의존성 우선, 불가피하면 복원 규칙 6개 적용 | 복원 보장 코드 | 원래 상태(부재/존재) 정확히 복원 | 아님 |
| 5 | Respect platform-owned semantics (`:56`) | Windows/POSIX 차이 | 4가지 플랫폼 규칙 적용 | 플랫폼 중립 관찰 또는 명시적 skip | 모든 플랫폼에서 성립하는 관찰 | 아님 |
| 6 | Budget timeouts against the lane (`:67`) | 테스트/훅 timeout | lane 예산과 비교, 훅 예산도 함께 상향 | 예산 정렬된 timeout | 더 짧은 값은 이유를 동반 | 아님 |
| 7 | Synchronize on state (`:75`) | 대기/sleep 지점 | 고정 sleep 제거, readiness 이벤트·barrier 사용 | 상태 기반 동기화 | timeout은 대기의 상한으로만 사용 | 아님 |
| 8 | Dispose to quiescence (`:85`) | 획득 자원 | 획득 직후 cleanup 등록, 완료 신호 await | 정지 상태까지의 teardown | 완료 신호를 기다림 | 아님 |
| 9 | Prove the intended regression (`:91`) | 수정/신규 테스트 | 수정 전 실패 관찰, negative control, barrier, 동시 독립 프로세스 실행 등 | 의도한 회귀를 증명하는 증거 | 해당 증거가 관찰됨 | **사실상 게이트** (증거 없이 완료 주장 불가) |
| 10 | Reject flake-masking fixes (`:102`) | 제안된 수정안 | 7개 마스킹 수정을 root-cause 수정으로 제시 금지 | 마스킹 제외 | 7개 항목 비해당 | **게이트** (탈락 시 재설계) |
| 11 | Diagnose existing flakes (`:118`) | 기존 flaky 실패 | 5-B 워크플로우로 분기 | 진단 결과 | 5-B 종료 조건 | 분기 |
| 12 | Validate and report (`:122`) | 변경 결과 | 가장 작은 focused regression 실행, 위험별 추가 증거, 정확한 명령과 결과 보고 | 보고문 | 재시도·skip·pending을 통과로 서술하지 않음 | **게이트** |

- 탈락 시 에이전트 행동 (원문 인용):
  - 마스킹 수정 해당 시: `Do not present these as root-cause fixes for deterministic local tests` (`SKILL.md:104`). 탈락 후 대안 행동은 "Narrow the exclusive scope or change the resource allocation first" (`SKILL.md:29`), "Fix at the owner" (`ci-flake-diagnosis.md:44`).
  - 증명 단계에서 pre-fix 실패를 관찰하지 못한 경우: `Observe an ordinary regression fail before the fix when practical.` (`SKILL.md:93`) — "when practical" 이므로 불가능 시의 대체 행동은 원문에 명시 없음.
  - 정지 기준 수치(예: 반복 실행 횟수): 원문에 명시 없음. `Stress runs supplement a deterministic regression; they do not replace one.` (`SKILL.md:100`).

### 5-B. 진단 모드 (`references/ci-flake-diagnosis.md` 섹션 순서)

진입 조건: `Use this workflow only when the task is to investigate an existing probabilistic test or CI failure.` (`ci-flake-diagnosis.md:3`)

| # | 단계 | 입력 | 행동 | 출력 | 통과 조건 |
|---|---|---|---|---|---|
| D1 | Freeze the evidence (`:5`) | 실패한 CI 런 | 저장소, workflow, job, commit SHA, runner labels, 타임스탬프, 정확한 실패 테스트/명령, 첫 안정 실패 시그니처 기록. 인프라 메시지와 테스트 출력 분리 | 증거 레코드 | 항목 기록 |
| D1' | 런 비교 (`:9`) | 실패/성공 런 다수 | 동일 SHA 우선, 불가 시 테스트·CI 설정 동일성 검증 | 비교표 | 원문에 통과 수치 없음 |
| D1'' | 겹침 확인 (`:11`) | Actions 로그/메타데이터 | 실패가 한 호스트·자원 네임스페이스에서 겹치는지 확인, 큰 로그 대신 링크 보존 | 링크 모음 | - |
| D2 | Classify the failure (`:13`) | 기록된 증거 | 8개 분류 중 지원되는 것 선택 | 분류 | "Classify from recorded evidence, not from the eventual fix" (`:15`) |
| D3 | Reproduce the smallest relevant topology (`:28`) | 분류와 시그니처 | 5단계 사다리를 올라가며 재현 | 재현 결과 | 첫 재현 토폴로지에서 정지 |
| D4 | Fix at the owner (`:44`) | 구현이 승인된 경우만 | 할당/readiness/전역 변경/teardown 소유 컴포넌트 수정 | 수정 | 아래 D5 |
| D5 | Close the investigation (`:50`) | 모든 증거 | 5개 종료 조건 점검 | 최종 보고 | 5개 조건 충족 |

### 5-C. 재현 사다리 (루프 구조)

> Start with the owning test file or focused test name. Increase concurrency only to the first topology that reproduces the signature (`ci-flake-diagnosis.md:30`)

```
1 one test process
   -> 2 concurrent tests or files
      -> 3 multiple independent Vitest processes
         -> 4 owning repository gate with its configured worker count
            -> 5 separate jobs or runner processes sharing the implicated host resource
(재현되는 첫 단계에서 멈춤)
```

- 플랫폼 한계: 호스트가 재현 불가한 플랫폼이면 마지막 도달 가능 단계에서 멈추고 한계를 기록, 다른 플랫폼의 통과 실행으로 대체하지 않으며, CI를 재현 수단으로 쓰되 `changing one suspected owner per run` (`ci-flake-diagnosis.md:40`).
- 경쟁 의심 시: `replace probabilistic timing with a barrier at the contested transition` (`:42`). 호스트 충돌 의심 시: 동일 식별자 동시 획득 증명 또는 atomic unique allocation이 충돌을 제거함을 증명 (`:42`).
- 재시도 상한, 반복 횟수 수치: 원문에 명시 없음. 대신 `Do not run until a test happens to pass and call that result stable.` (`:60`).
- 종료 조건 (수렴): 5개 항목 (`ci-flake-diagnosis.md:52-58`)
  1. 원래 시그니처가 지원되는 분류를 가짐
  2. 가장 작은 관련 토폴로지에서 재현되거나, 외부 증거가 충분하고 재현 한계가 명시됨
  3. 승인된 수정이 negative control 또는 pre-fix 상태에서 실패하고 동일 토폴로지에서 이후 통과
  4. 리소스 owner가 요구하는 동시 프로세스·복원·quiescent teardown 증명 통과
  5. 남은 Actions 체크를 passing/pending/skipped/failing 관찰 상태로 보고
- 정지 규칙: `Stop after the selected evidence establishes the conclusion, or report the missing fact that blocks classification.` (`:60`)

### 5-D. 사람 개입 지점

- 승인/질문 라운드를 명시한 문장: 원문에 명시 없음.
- 암묵적 범위 확인점: 진단 요청이 읽기 전용이며 "unless the user also asks for a fix" (`SKILL.md:120`). 구현 단계는 `When implementation is authorized` (`ci-flake-diagnosis.md:46`) 조건부.
- 소프트 게이트: `Before a push, use dsh-pre-push-checks` (`SKILL.md:131`).

## 6. 엔지니어링 규칙 분석

### 6-1. 금지 규칙 (anti-pattern)

| # | 원문 | 막으려는 실패 모드 | 출처 |
|---|---|---|---|
| 1 | `Never scan for a free port and bind it later.` | 검사-후-점유(TOCTOU) 포트 충돌 | `SKILL.md:35` |
| 2 | `do not acquire predictable shared paths` | 병렬 프로세스/잡 간 경로 충돌 | `SKILL.md:36` |
| 3 | `Do not serialize an entire suite merely because one fixture lacks isolation.` | 격리 결함 하나 때문에 전체 직렬화로 느려지는 것 | `SKILL.md:29` |
| 4 | `A sequential Vitest block cannot protect a host resource from another file, process, job, or runner.` | 순차 블록이 호스트 자원을 보호한다는 착각 | `SKILL.md:29` |
| 5 | `Do not rewrite them merely because they look fixed.` | 파서 입력/기대값 리터럴을 불필요하게 재작성 | `SKILL.md:41` |
| 6 | `A fixed sleep is not evidence that setup completed or cleanup settled.` | sleep으로 준비/정리 완료를 가정 | `SKILL.md:77` |
| 7 | `Use a timeout only to bound a wait, never as the condition that makes the assertion correct.` | timeout 자체가 정확성 조건이 되는 것 | `SKILL.md:81` |
| 8 | `Do not assert scheduler-dependent ordering unless that ordering is the product behavior under test.` | 스케줄러 의존 순서 단언 | `SKILL.md:82` |
| 9 | `Calling abort(), close(), or kill() without awaiting the owned completion signal is incomplete teardown.` | 종료 요청만 하고 완료 대기 안 함 → 늦은 콜백이 다른 테스트 오염 | `SKILL.md:89` |
| 10 | `repeated execution alone is not a race test` | 반복 실행만으로 경쟁을 "검증"했다는 주장 | `SKILL.md:95` |
| 11 | `Stress runs supplement a deterministic regression; they do not replace one.` | 스트레스 실행으로 결정적 회귀 테스트 대체 | `SKILL.md:100` |
| 12 | Reject flake-masking 7종 (아래) | 근본 원인 은폐 | `SKILL.md:104-112` |
| 13 | `do not describe retries, skipped tests, or pending CI as passing` | 보고 부풀리기 | `SKILL.md:131` |
| 14 | `One passing rerun does not prove an infrastructure fault, and one timeout does not prove a product race.` | 단일 관찰로 원인 단정 | `ci-flake-diagnosis.md:9` |
| 15 | `Do not lower a production timeout or add random load merely to manufacture a different failure.` | 재현을 위해 다른 실패를 인위적으로 생성 | `ci-flake-diagnosis.md:38` |
| 16 | `Do not collapse a timeout, signal, exit code, and assertion into a single inferred outcome.` | 독립 사실을 하나의 추정으로 뭉개는 것 | `ci-flake-diagnosis.md:26` |
| 17 | `Do not hide the failure in a snapshot normalizer, retry wrapper, broader timeout, global serialization setting, or weaker assertion.` | 소유자 아닌 곳에서의 은폐 | `ci-flake-diagnosis.md:46` |
| 18 | `Do not run until a test happens to pass and call that result stable.` | 우연한 통과를 안정으로 선언 | `ci-flake-diagnosis.md:60` |

flake-masking 7종 (`SKILL.md:106-112`): (1) increasing a timeout without identifying the awaited state, (2) adding retries, (3) making all files serial, (4) swallowing an error or unhandled rejection, (5) weakening an assertion, (6) normalizing away unstable behavior, (7) adding a sleep before cleanup or assertion.

예외 두 가지:
- `Retries remain valid for documented transient external-provider tests under the real-API policy. Keep that exception at the external boundary.` (`SKILL.md:114`)
- `Restoring a budget is not masking.` — lane 예산으로 되돌리기, 측정된 경합에 맞춘 bounded retry는 마스킹이 아니다 (`SKILL.md:116`).

### 6-2. 강제 규칙 (수치·임계값 전부)

원문의 숫자 전수:

| 규칙 | 수치/임계 | 출처 |
|---|---|---|
| 겹칠 수 있는 실행 계층 수 | 4개 계층 (한 Vitest 파일 내 테스트 / 별도 파일·워커 / 한 job 내 독립 프로세스 / 러너가 호스트 공유하는 다른 Actions job) | `SKILL.md:22-25` |
| 획득 자원당 식별 항목 | 5개: owner, atomic allocation mechanism, observable readiness signal, registered cleanup, quiescent completion signal | `SKILL.md:27` |
| 네트워크 픽스처 바인딩 | `listen(0)` (포트 0), 루프백(loopback) | `SKILL.md:35` |
| 전역 변경 시 복원 수칙 | 6개 불릿 (원래 부재/존재 캡처, 정확 복원, 즉시 등록, 최소 범위 try/finally, afterEach 폴백, 가장 좁은 정확 요청 가로채기) | `SKILL.md:49-54` |
| 전역 상태 대상 항목 | 9종 열거: `process.env`, `cwd`, fake timers, locale and timezone, module mocks, registries, console hooks, `globalThis`, global `fetch` interception | `SKILL.md:45` |
| NTFS 시간 해상도 | `100-nanosecond ticks` (소수 밀리초를 무손실 왕복 못 함) | `SKILL.md:60` |
| Windows 환경변수 | 대소문자 비구분: `http_proxy`와 `HTTP_PROXY`는 한 엔트리 | `SKILL.md:61` |
| timeout 예시 | `a 20 ms deadline` 을 증명하는 케이스에서 외부 대기는 이보다 훨씬 커야 함 (구체 배수 수치는 원문에 명시 없음: "far larger") | `SKILL.md:73` |
| 플랫폼 skip | 명시적 skip + 이유 명시 | `SKILL.md:63` |
| Validate 증거 유형 | 4종: 전역 변이→복원 증거, lifecycle/subprocess→quiescent teardown 증거, 포트/소켓/공유 경로→동시 독립 프로세스 증거, 새 guard→negative control | `SKILL.md:126-129` |
| 재현 사다리 | 5단계 | `ci-flake-diagnosis.md:32-36` |
| 실패 분류 | 8개 클래스 | `ci-flake-diagnosis.md:17-24` |
| 종료 조건 | 5개 | `ci-flake-diagnosis.md:52-58` |
| 코드 커버리지 %, 파일 줄 수 상한, 재시도 횟수, 함수 길이, 커밋 단위, 반복 실행 횟수 | 원문에 명시 없음 | - |
| `--testTimeout` 구체 값, lane 예산 수치 | 원문에 명시 없음 ("lane's budget"는 활성 설정을 읽으라는 지시) | `SKILL.md:69` |
| bounded retry 상한 | 원문에 명시 없음 ("sized to the observed contention") | `SKILL.md:62` |

8개 실패 분류 (`ci-flake-diagnosis.md:17-24`):

1. Host-resource collision
2. Incomplete lifecycle
3. Process-global contamination
4. Load-sensitive synchronization
5. Platform or entry-path mismatch
6. Product concurrency defect
7. External-provider transience
8. Runner infrastructure — `Require direct runner evidence before assigning this class.` (`:24`)

### 6-3. 검증 방식 (무엇을 근거로 "됐다"고 판정하는가)

- 근거의 종류는 자기 진술이 아니라 외부 관찰이다: `Verify external state, events, files, logs, exits, or disposal instead of trusting the component's self-report.` (`SKILL.md:98`)
- 수정 전 실패 관찰 후 수정 후 통과: `Observe an ordinary regression fail before the fix when practical.` (`SKILL.md:93`), `an authorized fix fails under a negative control or pre-fix state and passes under the same topology afterward` (`ci-flake-diagnosis.md:56`)
- 새 정적/코퍼스 guard: `temporarily introduce the rejected case and observe the intended failure.` (`SKILL.md:94`)
- 경쟁: barrier로 겹침 증명 (`SKILL.md:95`)
- 서브프로세스 자체 deadline: `assert that no signal or timeout ended the child before asserting its exit status` (`SKILL.md:97`) — 신호/타임아웃으로 죽은 자식이 상태 불일치가 아니라 timeout으로 보고되게 한다.
- 최소 실행: `Run the smallest focused regression for the affected behavior.` (`SKILL.md:124`)
- 보고: `Report exact commands and observed results` (`SKILL.md:131`)
- 최종 판정이 사람 확인인지 자동 게이트인지: 사람 확인 요구 문장은 원문에 명시 없음. 증거는 에이전트가 실행·관찰한 명령 결과로 구성됨.
- 단, "관찰했다"는 에이전트의 보고로 최종 전달되므로 그 보고 자체의 외부 검증 수단은 원문에 명시 없음.

### 6-4. 도구 사용 규칙

- 지시된 도구/기능: Vitest(`--testTimeout`, 다중 독립 프로세스), GitHub Actions 로그와 메타데이터(`ci-flake-diagnosis.md:11`), Node API `listen(0)`, `mkdtemp`, `try/finally`, `afterEach`.
- 지정 스킬: 푸시 전 `dsh-pre-push-checks` (`SKILL.md:16`, `SKILL.md:131`).
- 금지 도구/명령: 구체적으로 금지하는 CLI는 원문에 명시 없음. 금지 대상은 기법(재시도 래퍼, 전체 직렬화 설정, snapshot normalizer 등)이다 (`ci-flake-diagnosis.md:46`).
- 읽기/쓰기 범위 규칙: 진단 요청은 읽기 전용 (`SKILL.md:120`), `Preserve the requested read/write scope` (`ci-flake-diagnosis.md:3`).
- 워크플로우 rerun, CI 설정 변경은 진단만 요청받은 경우 권한 없음 (`ci-flake-diagnosis.md:3`).

### 6-5. 컨텍스트·토큰 규율

- 서브에이전트 위임 지시: 원문에 명시 없음.
- 파일 읽기 범위: 필요할 때 조건부로 읽기 — 활성 Vitest config·workflow는 "when their worker or job topology affects the test" (`SKILL.md:14`), snapshots/AGENTS.md는 recorded-session일 때만 (`SKILL.md:15`), `ci-flake-diagnosis.md`는 기존 probabilistic CI 실패일 때만 (`SKILL.md:120`).
- 로그 압축: `Preserve links to the supporting runs rather than pasting large logs.` (`ci-flake-diagnosis.md:11`)
- 보고 압축: 요약·압축 지시는 이 한 문장 외에 원문에 명시 없음.

### 6-6. 모호어의 조작적 정의

| 모호어 | 원문의 환산 | 출처 |
|---|---|---|
| "isolated"/격리 | 프로세스 격리만으로는 부족. 호스트 포트, 예측 가능한 경로, 외부 서비스, DB, 소켓, 상속된 자식 프로세스는 격리되지 않음 → 자원별 5요소 식별로 환산 | `SKILL.md:27` |
| "cleanup 완료" | 새 콜백/요청 중단, 리스너 분리, 전역 훅 복원, 소유 작업 종료, 그리고 child exit/server close/worker termination 등 완료 신호 await | `SKILL.md:87` |
| "ready"/준비됨 | 명시적 readiness 이벤트, handshake, 상태 전이, 소유 promise, 외부 관찰 가능 조건 | `SKILL.md:79` |
| "root-cause fix" | 할당/readiness 발행/전역 변경/teardown을 소유한 컴포넌트에서의 수정 | `ci-flake-diagnosis.md:46` |
| "stable"/안정 | 우연히 한 번 통과한 것은 안정이 아님. 5개 종료 조건 충족이 증거 | `ci-flake-diagnosis.md:52-60` |
| "passing" | 재시도·skip·pending은 passing으로 서술 금지, 관찰된 상태(passing/pending/skipped/failing)로 보고 | `SKILL.md:131`, `ci-flake-diagnosis.md:58` |
| "runner infrastructure" 판정 | 직접 러너 증거 필요. 호스트 지표가 없으면 그 사실을 말하고, 무관한 브랜치에서 반복되는 하나의 시그니처를 공유 호스트 경합 증거로 분류 | `ci-flake-diagnosis.md:24` |
| "masking" vs "restoring budget" | 기다리는 작업을 명명하고 lane이 부여한 예산으로 되돌리거나, 러너에서 측정한 경합에 맞춘 bounded retry면 마스킹 아님 | `SKILL.md:116` |
| "tight timeout" | 더 짧은 값은 더 짧은 이유를 동반 | `SKILL.md:69` |
| "when practical" | 환산 규칙 원문에 명시 없음 | `SKILL.md:93` |
| "far larger" (외부 대기 vs 대상 timeout) | 배수 수치 원문에 명시 없음 | `SKILL.md:73` |

## 7. 산출물

- 최종 결과물의 형태는 모드에 따라 다르다.
  - 설계/변경 모드: 테스트·픽스처 코드 diff와 정확한 실행 명령·관찰 결과 보고 (`SKILL.md:124-131`).
  - 진단 모드: 원인과 증거의 보고. 읽기 전용이 기본: `report the cause and evidence unless the user also asks for a fix` (`SKILL.md:120`).
- 진단 보고에 담기는 항목 (원문 근거로 열거):
  - 저장소, workflow, job, commit SHA, runner labels, 타임스탬프, 정확한 실패 테스트/명령, 첫 안정 실패 시그니처 (`ci-flake-diagnosis.md:7`)
  - 지원 런 링크 (`:11`)
  - 분류와 그 근거. 독립 사실이 둘 이상이면 각각 보고 (`:26`)
  - 재현 토폴로지 또는 재현 한계 (`:55`)
  - 남은 Actions 체크 상태: passing/pending/skipped/failing (`:58`)
  - 결론을 막는 누락 사실 (`:60`)
- 출력 포맷을 강제하는 템플릿: 원문에 명시 없음. 보고 필수 요소는 "exact commands and observed results" 정도다 (`SKILL.md:131`).
- 커밋·PR·브랜치 조작: 이 스킬이 직접 수행하라고 지시하는 문장은 원문에 명시 없음. push 전 검증은 `dsh-pre-push-checks`로 위임 (`SKILL.md:131`).
- 파괴적 동작(파일 삭제, force push, 마이그레이션): 원문에 명시 없음. 진단만 요청받은 경우 수정·workflow rerun·CI 설정 변경을 허용하지 않는다고 명시 (`ci-flake-diagnosis.md:3`).
- 파일 생성: 스킬이 보고서 파일을 쓰라는 지시는 원문에 명시 없음. 테스트 쪽 임시 디렉터리는 `mkdtemp` 사용 지시(`SKILL.md:36`).

## 8. 주의점 / 한계 (여기서만 평가)

### 오작동·과잉작동 시나리오

1. **마스킹 금지 규칙의 경계가 판단에 달려 있다.** 예산 복원은 마스킹이 아니라는 예외(`SKILL.md:116`)와 "increasing a timeout without identifying the awaited state"(`SKILL.md:106`)가 겹치는 영역에서 에이전트가 "awaited work를 명명했다"는 서술만 붙이고 timeout을 올릴 수 있다. 명명이 실제 증거인지 확인하는 기준은 원문에 없다.
2. **"when practical" 탈출구.** pre-fix 실패 관찰이 `when practical`로 조건부(`SKILL.md:93`)라, 에이전트가 실행 비용을 이유로 건너뛰고도 규칙을 지켰다고 말할 수 있다. 대체 증거 요구는 없다.
3. **과잉 진단.** 간단한 고정 포트 하나 때문에 4개 계층 모델링과 자원별 5요소 식별(`SKILL.md:20-27`)을 전부 문서화하게 되어, 작은 수정에도 보고가 비대해질 수 있다. 규모별 단축 경로는 원문에 명시 없음.
4. **경로 하드코딩 상대 링크.** `../../../docs/testing.md` 등(`SKILL.md:12-15`)은 스킬이 저장소 내 특정 깊이에 있을 때만 해석된다. 컬렉션을 다른 위치로 복사하면 링크가 끊겨 "Read the owning rules" 단계가 실패한다. 이번 분석에서도 그 문서들은 해당 디렉터리 밖이라 확인할 수 없었다.
5. **"관련 위험이 있는 테스트" 판정의 모호성.** description의 "with those risks"는 위험 유무의 판정 규칙이 없어, 위험이 없는 평범한 테스트 작업에서도 에이전트가 이 스킬을 켜서 과잉 작업을 할 가능성이 있다.
6. **재현을 위한 동시 독립 프로세스 실행**(`SKILL.md:96`)은 로컬/CI 자원을 쓰는 지시인데 상한(프로세스 수, 시간)이 없다.

### 다른 스킬·CLAUDE.md 규칙과 충돌 가능 지점

- `dsh-pre-push-checks`와는 역할 분리가 분명하다 (`SKILL.md:3`, `:16`, `:131`). 다만 "smallest focused regression" (`SKILL.md:124`)과 pre-push의 전체 게이트 사이에서 어느 쪽이 우선인지의 순서는 "after the test design is sound" (`SKILL.md:16`)로만 규정돼 있다.
- 일반적인 "최소 diff / 핫픽스" 지향 CLAUDE.md 규칙과는 충돌할 수 있다: 이 스킬은 소유자 수준 수정, 격리 재설계, 플랫폼 skip 등을 요구해 diff가 커질 수 있다. 그런 CLAUDE.md의 내용 자체는 원문에 명시 없음(이 분석 범위 밖).
- 재시도 허용 정책: 이 스킬은 retry를 금지하되 real-API 정책 예외를 둔다 (`SKILL.md:114`). 저장소의 다른 테스트 규칙이 재시도를 넓게 허용하면 충돌한다. 그 규칙은 `docs/testing.md`에 있을 수 있으나 원문에 명시 없음.

### 검증 공백

- 규칙 준수를 자동 확인하는 스크립트·린트가 없다(`scripts/` 부재). 모든 규칙이 에이전트의 자기 보고에 의존한다: `Report exact commands and observed results` (`SKILL.md:131`).
- Windows lane은 로컬에서 재현 못 하는 경우 CI를 재현 수단으로 쓰라고 하지만(`ci-flake-diagnosis.md:40`), CI 접근 권한이 없을 때의 행동은 원문에 명시 없음.
- 수치 임계(반복 횟수, 배수, 재시도 상한, 예산 값)가 전혀 없어 "충분함"의 판정이 에이전트 재량이다.
- 자식 프로세스·서버의 "quiescence" 확인법은 일반 원칙뿐이고 구체 API나 검사 방법은 원문에 명시 없음.
- `afterEach` 폴백이 필요한 "failure before the local finally is plausible" (`SKILL.md:53`)의 판정 기준 원문에 명시 없음.

### 유지보수 리스크

- 특정 도구에 결박: Vitest(`--testTimeout` 옵션 의미, `describe`/case timeout 우선순위 동작, `SKILL.md:69`), GitHub Actions 용어, NTFS 100ns 해상도(`SKILL.md:60`). 도구 버전별 동작 변화에 대한 대비 문구는 원문에 명시 없음.
- 저장소 고유 경로(`docs/testing.md`, `docs/defensive-patterns.md`, `snapshots/AGENTS.md`)와 형제 스킬명(`dsh-pre-push-checks`)에 대한 하드코딩 의존. 이름이나 위치가 바뀌면 스킬이 깨진다.
- 모델명 하드코딩: 없음.
- 두 파일 사이 중복: 마스킹 금지 목록이 `SKILL.md:104-112`와 `ci-flake-diagnosis.md:46`에 부분적으로 중복되어, 한쪽만 수정되면 불일치가 생길 수 있다.

### 장점 (판정 근거 관련 관찰)

- 거의 모든 금지 규칙에 "왜"가 붙어 있고 예시(NTFS 100ns, `http_proxy`/`HTTP_PROXY`, 20 ms deadline)가 구체적이다.
- 진단 모드가 읽기 전용 범위를 명시해 의도치 않은 수정·rerun을 막는다 (`ci-flake-diagnosis.md:3`).
- 마스킹 수정의 예외(real-API 재시도, 예산 복원)가 명시돼 있어 과잉 금지를 줄인다 (`SKILL.md:114-116`).

### 한 줄 판정

**조건부 도입 권장** — 비결정적 CI 실패를 다루는 DSH 저장소에서는 금지 규칙과 증거 요구가 구체적이고 외부 관찰 중심이라 유용하나, 수치 임계와 자동 검증 수단이 없고 저장소 고유 문서·형제 스킬 경로에 의존하므로 해당 문서가 갖춰진 DeepSeek Harness 저장소에서만 켜는 것이 맞다.
