# dsh-speed-up-perf 분석

## 1. 개요
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-speed-up-perf/`
- 컬렉션: deepseek-harness
- 디렉터리 전수 조사 결과 (`find . -type f`): 파일은 1개뿐이다.
| 파일 | 크기 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 12,174 bytes | 92줄 | 유일한 파일. frontmatter + 본문 전체 |
| `references/` | 원문에 명시 없음 (디렉터리 없음) | - | - |
| `scripts/` | 원문에 명시 없음 (디렉터리 없음) | - | - |
| `templates/` | 원문에 명시 없음 (디렉터리 없음) | - | - |
- 보조 파일 없음. 대신 SKILL.md가 상대 경로로 이 디렉터리 밖의 문서를 참조한다 (이 분석에서는 읽지 않았고, 존재 여부도 확인하지 않았다).
  - `../../../AGENTS.md`, `../../../docs/architecture.md`, `../../../docs/testing.md`, `../../../docs/defensive-patterns.md` (`SKILL.md:12`)
  - `../dsh-ci-test-reliability/SKILL.md` (`SKILL.md:12`)
  - `../../notes/implemented/process/2026-09-06-evidence-driven-performance-skill.md` (`SKILL.md:16`)
  - `../../../benchmarks/AGENTS.md`, `../../notes/implemented/testing/2026-09-04-session-open-performance-gate.md` (`SKILL.md:33`)
  - `../../notes/README.md` (`SKILL.md:86`)
  - `../dsh-pre-push-checks/SKILL.md` (`SKILL.md:90`)
- 성격: 계획(planning) + 검증(verification)의 혼합. "측정 카드(measurement card)를 먼저 쓰고, 회귀를 재현한 뒤, 작업을 제거한다"는 절차 지침이다. 코드를 생성하는 스킬이라기보다 성능 최적화 작업의 증거 규율을 강제하는 스킬이다. 실행 스크립트는 없다.
- 원문 자기 규정:
  > Turn a broad “make it faster” request into reproducible user-path measurements and small, evidence-backed fixes. This is guidance, not a quota or a script: survey broadly, follow measured cost, and reject attractive changes that do not improve the workload users actually run. (`SKILL.md:8`)
- 즉 스스로를 "guidance, not a quota or a script"로 규정한다. 고정된 단계 번호나 스크립트가 없고, 섹션 헤더 6개로 구성된다.

본문 섹션 구조 (헤더 원문):
| 줄 | 헤더 |
|---|---|
| 10 | `## Establish scope and current authority` |
| 18 | `## Survey user paths, then rank candidates` |
| 31 | `## Build realistic synthetic benchmarks first` |
| 59 | `## Prove the regression, then remove work` |
| 76 | `## Preserve behavior and resource ownership` |
| 84 | `## Deliver a bounded, reviewable result` |

## 2. 활성화 조건 (언제 켜지는가)
frontmatter 전문 (`SKILL.md:1-4`):

```
---
name: dsh-speed-up-perf
description: 'Use when investigating or optimizing DeepSeek Harness performance, designing realistic synthetic benchmarks or CI performance gates, profiling long Sessions or Web responsiveness, or turning performance PR evidence into measured behavior-preserving fixes.'
---
```

description을 분해하면 트리거 조건은 4개다.
1. investigating or optimizing DeepSeek Harness performance
2. designing realistic synthetic benchmarks or CI performance gates
3. profiling long Sessions or Web responsiveness
4. turning performance PR evidence into measured behavior-preserving fixes

매칭되는 실제 사용자 발화 예시 (description 어휘에서 추출한 것이며, 원문에 발화 예시 목록은 없다):
1. "DeepSeek Harness가 느려, 왜 느린지 프로파일링해줘" (조건 1)
2. "make the Session open path faster" (조건 1; 본문에 `Cold profile startup, first historical read` 도메인이 있음, `SKILL.md:21`)
3. "긴 Session에서 웹 UI 스크롤이 버벅여" (조건 3; `scrolling`, `inactive-view activation`, `SKILL.md:24`)
4. "성능 회귀를 잡는 CI performance gate를 만들어줘" (조건 2; `SKILL.md:33`의 required lane)
5. "이 성능 PR의 수치가 실제로 맞는지 검증하고 고쳐줘" (조건 4; `SKILL.md:16`, `SKILL.md:92`)
6. "tool-heavy history 로딩 벤치마크를 현실적으로 설계해줘" (조건 2; `SKILL.md:22`)

의도적으로 배제되는 발화 / 넘겨야 할 스킬:
| 상황 | 원문 | 넘길 곳 |
|---|---|---|
| 프로세스, 시계, 브라우저 테스트, 비동기 정리에서 테스트가 불안정 | `Use [CI test reliability](../dsh-ci-test-reliability/SKILL.md) for processes, clocks, browser tests, and asynchronous cleanup.` (`SKILL.md:12`) | `dsh-ci-test-reliability` |
| push 전 점검 | `Apply [pre-push checks](../dsh-pre-push-checks/SKILL.md)` (`SKILL.md:90`) | `dsh-pre-push-checks` |
| 노트(Agent Note) 작성 규칙 | `Use [Agent Note rules](../../notes/README.md)` (`SKILL.md:86`) | `notes/README.md` (스킬이 아닌 문서) |
- description과 본문에는 "이런 발화는 이 스킬이 아니다"라는 명시적 배제 문구가 없다. 위 표는 본문 중간에 박힌 위임 지점이다.
- 모델/네트워크 지연은 범위에서 제외하라는 규칙이 있다: `Exclude model/network latency when measuring local overhead, and state that exclusion rather than calling the result complete product latency.` (`SKILL.md:14`)
- DeepSeek Harness 이외의 프로젝트에 대한 성능 작업은 description상 대상이 아니다 (`DeepSeek Harness performance`로 한정).

frontmatter 필드: `name`, `description` 두 개뿐. `allowed-tools`, `model`, `metadata` 등은 없다.

## 3. 적합 / 부적합
적합 (원문이 열거한 상황):
- 막연한 "make it faster" 요청을 재현 가능한 측정으로 바꿔야 할 때 (`SKILL.md:8`)
- Session 관련 비용 도메인이 여럿 얽힌 경우 (`SKILL.md:20-25`)
  - 콜드 프로필 시작, 첫 historical read, current-generation reopen, writable resume
  - many-turn / tool-heavy history, 큰 개별 메시지/결과, child Session 목록, Session 간 반복 이동
  - 초기 history 전송/fold, 첫 사용 가능 브라우저 paint, 이전 페이지 로딩, 스크롤, tool 확장, 비활성 뷰 활성화
  - live streaming과 reconnect, 긴 active attempt, 끼어드는 tool 작업, settlement, cancellation, teardown
- 필수(required) CI 성능 게이트를 추가하거나 조정할 때 (`SKILL.md:33`, `SKILL.md:53`)
- 이미 머지/종료된 성능 PR의 증거를 재평가할 때 (`SKILL.md:16`)
- 병렬로 조사할 독립 도메인이 있어 서브에이전트 위임이 이득인 때: `Delegate independent domains when breadth helps` (`SKILL.md:20`)

부적합 / 과함 (원문에서 직접 언급된 것만):
- 원문에 "이 경우엔 쓰지 말라"는 명시 문장은 없다. 원문에 명시 없음.
- 다만 스킬 자체가 요구하는 항목이 많아서 (측정 카드 7행, 기준선 실행, negative control, 기능 테스트, Agent Note 등) 작은 변경에는 절차 비용이 크다. 이는 7절 이후의 평가가 아니라 요구 항목 수에 대한 사실이다: 측정 카드 7개 필드(`SKILL.md:39-47`), 요약 7개 항목(`SKILL.md:92`).
- 스킬이 스스로 범위를 제한한다: `Stop at the agreed scenario/fix scope; retain a short ranked follow-up list instead of chasing unrelated opportunities.` (`SKILL.md:92`)

형제 스킬 대신 이걸 고르는 판정 기준 한 줄:
- 작업의 목적이 "측정된 성능 개선 또는 성능 게이트 설계"이면 이 스킬, 테스트 불안정(프로세스/시계/브라우저/비동기 정리)이면 `dsh-ci-test-reliability`, push 직전 점검이면 `dsh-pre-push-checks`.

## 4. 전제 조건과 외부 의존성
- 실행 스크립트: 없음 (스킬 디렉터리에 `scripts/` 없음). `This is guidance, not a quota or a script` (`SKILL.md:8`).
- 런타임/패키지: 원문이 요구하는 것
  - CPU 워커 측정은 built JavaScript를 plain Node로: `Measure built JavaScript under plain Node for CPU workers; source-loader overhead and module resolution are not the shipped path.` (`SKILL.md:49`)
  - 브라우저 케이스는 built product assets와 supported `dsh` profile, 기존 테스트 하네스 사용 (`SKILL.md:49`)
  - Node 버전, 패키지 매니저, 브라우저 종류: 원문에 명시 없음
- CLI 도구: `dsh` 프로필(`SKILL.md:49`), GitHub official stacks (`SKILL.md:88`). `gh` 명령 자체는 언급되지 않는다. git worktree는 `separate worktrees`로 언급 (`SKILL.md:88`). 구체 명령어는 원문에 명시 없음.
- API 키 / 환경변수 / 네트워크:
  - 벤치마크는 네트워크 비의존이어야 한다: `no benchmark depends on the user’s home, ambient repository, network service, or private data.` (`SKILL.md:35`)
  - 스킬 자체가 요구하는 API 키/환경변수: 불필요 (원문에 언급 없음)
  - 예산을 환경변수로 덮어쓰는 것은 금지: `Budgets are source constants, not environment overrides.` (`SKILL.md:53`)
  - GUI 변경 시 "keyless snapshot"이라는 표현이 있어 (`SKILL.md:80`), 소유 테스트가 키 없이 돌아가야 함을 시사하는 표현이 있으나 상세는 원문에 명시 없음.
- 리포지토리 전제:
  - 기존 문서 체계: `AGENTS.md`, `docs/architecture.md`, `docs/testing.md`, `docs/defensive-patterns.md`, 패키지별 instructions와 Agent Notes (`SKILL.md:12`)
  - 기존 벤치마크 인프라: `benchmarks/` 디렉터리, `benchmarks/AGENTS.md`, 기존 required lane, 공유 시간 보정(shared time calibration) (`SKILL.md:33`, `SKILL.md:53`)
  - CI에 Node 레인과 브라우저 레인이 있고, 브라우저 required 케이스는 별도 lane decision 필요 (`SKILL.md:53`)
  - 커밋/PR 권한과 브랜치 전략: stacked PR이 요청되면 GitHub official stacks 사용 (`SKILL.md:88`). 기본 브랜치 전략은 원문에 명시 없음.
  - 이 스킬은 DeepSeek Harness 리포지토리 구조에 강하게 결합되어 있다 (상대 경로 6종 이상).
- 비용 발생 지점:
  - 유료 API: 원문에 명시 없음. 모델 지연은 측정에서 제외 (`SKILL.md:14`).
  - CI 분: 필수 레인 확장과 CI 검증(`inspect CI rather than assuming local timing proves runner stability`, `SKILL.md:90`), 브라우저 레인의 반복 측정 (`SKILL.md:53`)
  - 토큰: 서브에이전트 위임 (`SKILL.md:20`), 최종 요약 형식 (`SKILL.md:92`). 토큰 상한은 원문에 명시 없음.
- 상태 파일 / 산출물 디렉터리:
  - `benchmarks/` 아래 교차 패키지 required case (`SKILL.md:33`: `cross-package required cases live under the measured user path in benchmarks/`)
  - 패키지 로컬 진단은 소유 패키지 옆 (`SKILL.md:33`: `Package-local diagnostics remain beside their owner`)
  - Agent Note: 경로는 `notes/` 계열 (`SKILL.md:86` → `../../notes/README.md`). 신규 노트의 정확한 파일 경로 규칙은 원문에 명시 없음.
  - 측정 기록 (`command, revision, runtime/platform, fixture dimensions, raw measurements, verdict`)을 저장하라고 하지만 저장 위치는 원문에 명시 없음 (`SKILL.md:61`).
  - `plan.md`, `TODO`, `.claude/` 같은 상태 파일: 원문에 언급 없음.

## 5. 워크플로우
순서 강제 문구: 섹션 제목 자체가 순서를 암시한다 ("Survey ... then rank", "Build ... first", "Prove the regression, then remove work"). 그러나 `run in order`, `do not skip` 같은 명시 문구는 없다. 스킬은 `guidance, not a quota or a script` (`SKILL.md:8`)라고 자기 규정한다.

다음 순서는 헤더 순서를 따른 것이다. 원문에 단계 번호는 없다. 게이트 표시는 `[GATE]`.

### 단계 A. Establish scope and current authority (`SKILL.md:10-16`)
- 입력: 사용자의 성능 요청, 리포지토리 문서
- 행동:
  - AGENTS.md, architecture, testing policy, defensive patterns, 영향받는 패키지의 instructions와 Agent Notes 읽기 (`SKILL.md:12`)
  - 사용자와 합의할 항목: `the user-visible endpoint, workload range, resource constraints, acceptable minor behavior differences, and stopping rule` (`SKILL.md:14`)
  - 백엔드와 브라우저 end-to-end 측정을 분리: `a fast history iterator or Client fold does not prove fast transport, paint, scrolling, or input response.` (`SKILL.md:14`)
  - 현재 base를 검사: `Inspect the exact current base, not just the running checkout.` (`SKILL.md:16`)
  - 최종 머지된 diff, 소유 소스, 테스트, 해결된 리뷰 스레드를 연구: `a PR body can describe an abandoned implementation.` (`SKILL.md:16`)
  - 증거 분류: `Separate merged, closed-unmerged, superseded, estimated, and newly measured evidence.` (`SKILL.md:16`)
- 출력: 합의된 범위와 중단 조건, 증거 분류
- 통과 조건: 원문에 명시적 게이트 없음. 사람 개입 지점이다 (`Agree on ...`).
- 주의: 과거 성능 노트는 `historical leads, not authority to reintroduce their implementations` (`SKILL.md:16`).

### 단계 B. Survey user paths, then rank candidates (`SKILL.md:18-29`)
- 입력: 합의된 범위
- 행동:
  - 독립 도메인은 위임: `require measurements and production call sites, not guesses.` (`SKILL.md:20`)
  - 비용 동인을 독립적으로 변화: `bytes, durable events, compact records, raw deltas, turns, tools, children, and visible DOM nodes are different quantities.` (`SKILL.md:27`)
  - `Include typical and tail workloads, but avoid a combinatorial matrix with no decision value.` (`SKILL.md:27`)
  - 후보 순위 기준: `observed user latency, CPU/allocations, retained memory, occurrence, and confidence` (`SKILL.md:29`)
  - 각 후보마다 기록: `the production consumer, the repeated work, the expected complexity, the smallest falsifiable intervention, and the behavior that must remain stable` (`SKILL.md:29`)
- 출력: 순위가 매겨진 후보 목록
- 통과 조건: `A suspicious loop, unused cache, or large file alone is not evidence of a bottleneck.` (`SKILL.md:29`) 즉 의심만으로는 후보로 인정되지 않는다.

### 단계 C. Build realistic synthetic benchmarks first (`SKILL.md:31-57`)
- 입력: 상위 후보, `benchmarks/AGENTS.md`, performance-gate decision 노트
- 행동:
  - 기존 required lane을 확장: `Extend the existing required lane rather than creating competing calibration or reporting infrastructure.` (`SKILL.md:33`)
  - 로컬 코퍼스 조사는 사용자가 승인한 경우에만, 집계 특성만 추출 (`SKILL.md:35`)
  - 구현 전에 측정 카드 기록 (`SKILL.md:37`, 표는 6절에 전재)
  - 기준선과 후보를 같은 입력, 같은 검증, 같은 완료 조건, 같은 도달 가능 출력으로 비교 (`SKILL.md:51`)
  - 모든 샘플과 판정을 결정한 집계값을 보고 (`SKILL.md:53`)
  - end-to-end 지연을 구성 단계와 독립적으로 측정 (`SKILL.md:55`)
  - 브라우저 반응성은 실제 브라우저 입력 사용 (`SKILL.md:57`)
- 출력: 벤치마크 케이스, 측정 카드
- 통과 조건: [GATE, 암묵적] 측정 카드의 7개 필드가 구현 전에 채워져야 한다 (`Before implementation, record a measurement card`, `SKILL.md:37`). 미충족 시 어떻게 하라는 문구는 원문에 명시 없음.

### 단계 D. Prove the regression, then remove work (`SKILL.md:59-74`)
- 입력: 벤치마크
- 행동:
  - `Run the unoptimized workload before changing production code.` (`SKILL.md:61`)
  - 저장 항목: `the command, revision, runtime/platform, fixture dimensions, raw measurements, and verdict` (`SKILL.md:61`)
  - `Reduce a failing scenario until it still exercises the real bottleneck, then rank falsifiable hypotheses before patching.` (`SKILL.md:61`)
  - 프로파일, 할당 샘플, 작업 횟수, 단계별 타이밍으로 가설 구분 (`SKILL.md:61`)
  - 일반 패턴 8개를 검토 (`SKILL.md:63-72`, `not automatic prescriptions`)
  - `Change one causal factor at a time.` (`SKILL.md:74`)
  - 집중 시나리오와 그 end-to-end 상위 시나리오를 둘 다 재실행 (`SKILL.md:74`)
- 출력: 수정 코드, 강화된 어서션
- 통과 조건 [GATE]: negative control
  > Require a negative control: the tightened assertion fails on the original implementation or a controlled reintroduction of the targeted cost. (`SKILL.md:74`)
- 탈락 시: `Reject an optimization when gains disappear end-to-end, a typical workload regresses materially, complexity outweighs a small gain, or cancellation/retention/durability cannot be explained and tested. Record the rejected hypothesis briefly instead of expanding scope to justify it.` (`SKILL.md:82`)

### 단계 E. Preserve behavior and resource ownership (`SKILL.md:76-82`)
- 입력: 최적화된 코드
- 행동:
  - 소유 테스트를 실행하거나 추가: `output, ordering, paging, stream indexes, errors, cancellation, concurrency, and disposal as applicable` (`SKILL.md:78`)
  - 보존 대상: `model-visible/logged equivalence, released-generation immutability, atomic publication, required validation, and writable readiness` (`SKILL.md:78`)
  - 의도한 사소한 가시적 차이는 소유 keyless snapshot으로 검증 (`SKILL.md:80`)
  - 제품 가시적 GUI 변경은 브라우저 증거/GIF 포함 (`SKILL.md:80`)
- 통과 조건 [GATE, 암묵적]: 위 단계 D의 Reject 조건(`SKILL.md:82`)과 결합해 판정된다.
- 금지: `Do not silently truncate history, skip tool results, disable invariants, or change lifecycle semantics to reach a number.` (`SKILL.md:78`)

### 단계 F. Deliver a bounded, reviewable result (`SKILL.md:84-92`)
- 입력: 검증된 변경
- 행동:
  - 내구성 있는 근거는 Agent Note에 기록 (`SKILL.md:86`)
  - stacked PR이 요청되면: 레이어를 편집 전에 선택, official GitHub stacks와 별도 worktree 사용 (`SKILL.md:88`)
  - `Apply pre-push checks` (`SKILL.md:90`)
  - CI 확인 (`SKILL.md:90`)
  - 리뷰 대응: 코드와 실행 가능한 증거로 평가, 이유를 달거나 수정, 해결된 스레드 resolve (`SKILL.md:90`)
- 출력: PR, 요약 (형식은 7절)
- 통과 조건 [GATE]: `report only executed evidence` (`SKILL.md:90`). 자동 검증 장치는 원문에 명시 없음.

### 루프 구조 도식
```
범위 합의(사람) -> 후보 조사/순위 -> 측정 카드 -> 기준선 실행 (최적화 전)
       ^                                                |
       |                                                v
 후속 후보 목록 <- 거부 기록 <-(이득 소멸/회귀)- 가설 1개 수정 -> 집중+상위 시나리오 재실행
                                                        |
                                           negative control + 기능 테스트 통과
                                                        v
                                            Agent Note -> pre-push -> PR -> CI -> 리뷰 대응
```
- 재시도 상한, 수렴 조건의 숫자: 원문에 명시 없음. 중단은 "합의된 stopping rule"(`SKILL.md:14`)과 "agreed scenario/fix scope"(`SKILL.md:92`)에 의존한다.
- 사람 개입 지점:
  - 범위/endpoint/중단 규칙 합의 (`SKILL.md:14`)
  - 로컬 코퍼스 조사 승인 (`If the user authorizes local corpus inspection`, `SKILL.md:35`)
  - 브라우저 required 성능 케이스의 lane decision (`SKILL.md:53`)
  - stacked PR 요청 여부 (`When the task requests stacked PRs`, `SKILL.md:88`)
  - PR 리뷰 (`SKILL.md:90`)

## 6. 엔지니어링 규칙 분석
### 6.1 금지 규칙 (anti-pattern)
| # | 원문 금지/경고 | 인용 | 막으려는 실패 모드 |
|---|---|---|---|
| 1 | 측정 없이 후보 판단 | `A suspicious loop, unused cache, or large file alone is not evidence of a bottleneck.` (`SKILL.md:29`) | 의심 기반 최적화 |
| 2 | 무의미한 대량 동일 메시지 | `Do not call a large count of tiny identical messages “realistic” without checking which user operation it stresses.` (`SKILL.md:27`) | 비현실적 워크로드 |
| 7 | 측정 전용 프로덕션 export | `Do not add a production export solely for measurement or copy the algorithm into a “benchmark implementation.”` (`SKILL.md:49`) | 프로덕션 경로를 측정하지 않는 벤치마크 |
| 8 | 콜드 시나리오 오염 | `never let fixture setup secretly warm a cold scenario` (`SKILL.md:51`) | 콜드 측정이 워밍됨 |
| 9 | 비동등 비교 | `A parse-and-discard baseline is not comparable with validated retained history.` (`SKILL.md:51`) | 검증/보존 없는 기준선과의 비교 |
| 10 | 숫자 스케일링 | `do not scale bytes, counts, or dimensionless ratios by CPU speed` (`SKILL.md:53`) | 잘못된 보정 |
| 11 | 환경변수 예산 | `Budgets are source constants, not environment overrides.` (`SKILL.md:53`) | 예산 우회 |
| 12 | 회귀 은폐 | `Do not widen a budget or select a lucky run to hide a regression.` (`SKILL.md:53`) | 예산 완화, 운 좋은 샘플 선택 |
| 13 | 무조건적 속도 승리 | `Faster execution with unbounded retention is not an automatic win.` (`SKILL.md:55`) | 메모리 보존 악화 |
| 14 | 브라우저 대체 측정 | `Node folds, fake DOMs, and custom heartbeat events alone cannot establish browser responsiveness.` (`SKILL.md:57`) | 가짜 DOM으로 반응성 주장 |
| 15 | 신뢰 경계 약화 | `Typed same-process borrowing is not permission to weaken durable or wire parsing.` (`SKILL.md:66`) | 검증 제거 |
| 16 | 지연의 삭제화 | `Deferral is not deletion, and viewport highlighting is not full virtualization.` (`SKILL.md:69`) | 지연을 제거로 오인 |
| 17 | 캐시 남용 | `Avoid caching expanded representations merely to make repeated benchmarks look fast.` (`SKILL.md:72`) | 벤치마크용 캐시 |
| 18 | 느슨한 임계값 | `A threshold so generous that the regression passes is not protection; a budget below a verified noise floor is not reliable either.` (`SKILL.md:74`) | 무력한 게이트 / 불안정 게이트 |
| 19 | 의미 변경으로 수치 달성 | `Do not silently truncate history, skip tool results, disable invariants, or change lifecycle semantics to reach a number.` (`SKILL.md:78`) | 기능을 깎아 얻은 속도 |
| 20 | 범위 확장 | `instead of expanding scope to justify it` (`SKILL.md:82`) | 거부된 가설의 합리화 |

### 6.2 강제 규칙 (수치/임계값)
숫자 임계값 자체는 이 스킬에 거의 없다. 원문의 숫자는 구조적인 것(필드 수, 날짜)뿐이다.
| 항목 | 값 | 출처 |
|---|---|---|
| 측정 카드 필드 수 | 7 (User operation, Workload, Entry path, Clock, Memory, Verdict, Behavior) | `SKILL.md:39-47` |
| 최종 요약 항목 수 | 7 (workload, before/after absolute values and ratio, endpoint and memory semantics, behavior evidence, negative control, exact checks, exclusions) | `SKILL.md:92` |
| 성능 예산 숫자 (ms, %, 배수) | 원문에 명시 없음 | - |

수치 대신 "정성적 강제"가 대부분이며, 강제 문장은 다음과 같다.
- 구현 전 측정 카드 기록 (`SKILL.md:37`)
- 최적화 전 기준선 실행 (`SKILL.md:61`)
- negative control 필수 (`SKILL.md:74`)
- 예산은 소스 상수 (`SKILL.md:53`)
- 브라우저 required 케이스는 `an explicit lane decision and repeated measurements on its actual CI browser/runner before adopting timing budgets` (`SKILL.md:53`)
- 측정 작업은 직렬화: `Serialize measured work against other owned CPU-heavy jobs` (`SKILL.md:53`)
- 기준과 후보는 비교 가능한 조건에서 측정: `measure reference and candidate under comparable conditions` (`SKILL.md:53`)
- 콜드/프로세스 메모리 샘플은 새 자식 프로세스와 private temp root: `Use fresh children and private temporary roots for cold/process-memory samples.` (`SKILL.md:51`)
- 워밍 샘플은 의도한 캐시를 명시적으로 보존 (`SKILL.md:51`)
- 수동 브라우저 진단은 임계값 없음: `Keep manual browser diagnostics threshold-free.` (`SKILL.md:53`)

측정 카드 전문 (`SKILL.md:39-47`):
| 필드 | 필수 결정 사항 (원문) |
|---|---|
| User operation | Exact action and externally observable completion condition |
| Workload | Fixed dimensions, distributions, construction seed/constants, and why they exercise ordinary and tail use |
| Entry path | Production calls/composition and built artifacts; mocked external boundaries |
| Clock | Included setup, cold/warm state, timing start/end, and excluded costs |
| Memory | Reachable endpoint objects, baseline, GC policy, retained versus transient limits |
| Verdict | Raw samples, chosen aggregate, calibrated absolute/ratio/memory limits, and negative control |
| Behavior | Owning functional tests/snapshots and permitted minor differences |

일반 패턴 8개 (모두 `Common patterns worth testing, not automatic prescriptions`, `SKILL.md:63`):
| # | 패턴 | 원문 근거 |
|---|---|---|
| 1 | 압축 표현을 하류까지 유지, delta별 객체 회피 | `SKILL.md:64` |
| 2 | 중복 파싱/복사/freeze/검증 제거 (소유권과 신뢰 전환 식별 후) | `SKILL.md:65-66` |
| 7 | 반복 shift/scan/rebuild 대신 적합한 자료구조, 전체 consumer 경로 측정 | `SKILL.md:71` |
| 8 | revision-keyed reuse 또는 singleflight, 명시적 무효화/제한된 보존/독립 waiter 취소/dispose 소유권 필요 | `SKILL.md:72` |

### 6.3 검증 방식
"됐다"의 판정 근거 (원문 기준):
- 측정 기반: 원시 샘플, 선택한 집계값, 보정된 절대/비율/메모리 한도 (`SKILL.md:46`, `SKILL.md:53`)
- negative control: 강화된 어서션이 원본 구현 또는 통제된 비용 재도입에서 실패해야 함 (`SKILL.md:74`)
- 기능 테스트: 소유 테스트의 출력/순서/페이징/스트림 인덱스/오류/취소/동시성/dispose (`SKILL.md:78`)
- snapshot: 의도한 사소한 차이는 소유 keyless snapshot (`SKILL.md:80`)
- 브라우저 증거: GUI 변경 시 브라우저 증거/GIF (`SKILL.md:80`)
- CI: `inspect CI` (`SKILL.md:90`)
- pre-push checks (`SKILL.md:90`)
- 사람 확인: 리뷰 스레드 대응 (`SKILL.md:90`)
- 자기 진술 규율: `report only executed evidence` (`SKILL.md:90`), 과거 수치와 신규 측정과 CI 증거를 분리 (`SKILL.md:92`: `Separate author-reported historical numbers, fresh local measurements, and CI evidence.`)
- 커버리지/린트/타입체크 기준: 원문에 명시 없음 (pre-push checks 스킬에 위임, 내용은 읽지 않음)

### 6.4 도구 사용 규칙
| 도구/수단 | 지시 | 출처 |
|---|---|---|
| 서브에이전트 | 독립 도메인 위임, 측정과 production call site를 요구 | `SKILL.md:20` |
| 프로파일, 할당 샘플, 작업 횟수, 단계 타이밍 | 가설 구분에 사용 | `SKILL.md:61` |
| plain Node | built JavaScript로 CPU 워커 측정 | `SKILL.md:49` |
| 실제 브라우저 입력 | 반응성 측정에 사용 | `SKILL.md:57` |
| 기존 테스트 하네스 + `dsh` 프로필 | 브라우저 케이스 | `SKILL.md:49` |
| GitHub official stacks, 별도 worktree | stacked PR 요청 시 | `SKILL.md:88` |

도구 allowlist/denylist(frontmatter): 없음.

### 6.5 컨텍스트 / 토큰 규율
- 서브에이전트 위임으로 폭을 확보: `Delegate independent domains when breadth helps` (`SKILL.md:20`)
- 파일 읽기 범위: 필수 문서 목록 지정 (`SKILL.md:12`), 최종 머지된 diff와 소유 소스/테스트/해결 스레드로 제한 (`SKILL.md:16`)
- 노트 정리 범위 제한: `without turning performance work into a corpus-wide prose cleanup` (`SKILL.md:86`)
- 요약 규칙: `retain a short ranked follow-up list` (`SKILL.md:92`)
- 요약/압축 지시 중 토큰 숫자 제한: 원문에 명시 없음.
- 로컬 코퍼스는 집계 특성만 추출 (`SKILL.md:35`)

### 6.6 모호어의 조작적 정의
| 모호어 | 원문의 환산 | 출처 |
|---|---|---|
| "realistic" 워크로드 | 숫자 정의 없음. 환산 규칙은 "어떤 사용자 조작을 자극하는지 확인"하고, 비용 동인을 독립 변화시키는 것 | `SKILL.md:27` |
| "faster" | before/after 절대값과 비율, endpoint 및 메모리 의미, 부정 대조를 보고 | `SKILL.md:92` |
| "done" / 완료 | `externally observable completion condition` (측정 카드 User operation, `SKILL.md:40`) | `SKILL.md:40` |
| "regression" | 숫자 정의 없음. 강화된 어서션이 원본 구현에서 실패하는지로 판정 | `SKILL.md:74` |
| "typical workload regresses materially" | "materially"의 수치 기준: 원문에 명시 없음 | `SKILL.md:82` |
| "small gain" / "complexity outweighs" | 수치 기준: 원문에 명시 없음 | `SKILL.md:82` |
| "minor behavior differences" | 수치/목록 기준 없음. 사용자와 합의 + keyless snapshot 검증 | `SKILL.md:14`, `SKILL.md:80` |
| "bottleneck" | 관찰된 사용자 지연, CPU/할당, 보존 메모리, 발생 빈도, 확신도로 순위화 | `SKILL.md:29` |

## 7. 산출물
최종 결과물의 형태:
- 코드 diff: 최적화 수정 (`SKILL.md:88`: `the optimization layer carries its fix, functional coverage, and tighter budget`)
- 벤치마크 코드: `benchmarks/` 하위 required case 또는 패키지 로컬 진단 (`SKILL.md:33`)
- 테스트/스냅샷: 소유 기능 테스트, keyless snapshot (`SKILL.md:78`, `SKILL.md:80`)
- 브라우저 증거 / GIF: 제품 가시적 GUI 변경 시 (`SKILL.md:80`)
- Agent Note: 근거, 대안, 보정, 제외, 잔여 위험 (`SKILL.md:86`: `durable rationale, alternatives, calibration, exclusions, and remaining risks`)
- PR(들): 필요 시 stacked (`SKILL.md:88`)
- 리포트: 최종 요약 + 후속 후보의 짧은 순위 목록 (`SKILL.md:92`)

출력 포맷을 강제하는 템플릿:
- 측정 카드 표 (`SKILL.md:39-47`, 6.2에 전재)
- 최종 요약 형식:
  > Summarize each result as: workload → before/after absolute values and ratio → endpoint and memory semantics → behavior evidence → negative control → exact checks → exclusions. (`SKILL.md:92`)
- 기준선 기록 항목: `the command, revision, runtime/platform, fixture dimensions, raw measurements, and verdict` (`SKILL.md:61`)
- 파일 템플릿(`templates/`): 원문에 명시 없음.

PR 레이어 구조 (`SKILL.md:88`):
| 레이어 | 포함 내용 |
|---|---|
| 벤치마크 인프라 레이어 | `benchmark infrastructure can protect the measured baseline` |
| 최적화 레이어 | `carries its fix, functional coverage, and tighter budget` |
| 독립 병목 | `Independent bottlenecks may use separate stacks` |
| 결함 수정 | `Fix a finding in its owning layer before propagating upward` |
| 각 레이어 | `Keep each layer mergeable` |

커밋/PR/브랜치 조작:
- 커밋: 커밋 단위나 메시지 형식에 대한 규칙은 원문에 명시 없음.
- PR: "official GitHub stacks"와 "separate worktrees"는 사용자가 stacked PR을 요청한 경우에만 (`SKILL.md:88`). 비스택 PR 규칙은 원문에 명시 없음.
- 리뷰: `After marking ready, evaluate review findings against code and executable evidence; reply with the reason or fix and resolve addressed threads.` (`SKILL.md:90`). 즉 스레드 resolve 동작이 있다.
- 파괴적 동작 (파일 삭제, force push, 마이그레이션): 원문에 명시 없음. 다만 Agent Note 관련 `Check relevant notes for supersession` (`SKILL.md:86`)는 노트 상태 변경 가능성을 시사하나 구체 동작은 원문에 명시 없음.
- 개인 정보를 아티팩트에 쓰지 않는다는 제한은 산출물 전체에 적용 (`SKILL.md:35`).

## 8. 주의점 / 한계 (여기서만 평가)
### 오작동 / 과잉작동 시나리오
1. 작은 성능 수정에도 측정 카드 7필드, 기준선 실행, negative control, Agent Note, CI 확인을 모두 요구하는 것으로 읽힐 수 있다. 스킬이 "guidance, not a quota or a script"(`SKILL.md:8`)라고 하지만 `Require a negative control`(`SKILL.md:74`) 같은 강제어가 섞여 있어, 에이전트가 어디까지 생략 가능한지 판단 기준이 없다.
2. 스킬 전체가 DeepSeek Harness 리포지토리 구조(`benchmarks/AGENTS.md`, `docs/`, `notes/`, `dsh` 프로필, required lane)에 묶여 있다. 해당 파일이 없는 체크아웃이나 다른 프로젝트에서 켜지면 참조가 모두 끊긴 채로 진행한다. 경로 부재 시 행동은 원문에 명시 없음.
3. 최종 요약 단계가 "모든 수치를 분리 보고"를 요구하지만 (`SKILL.md:92`), 실제로 실행하지 못한 CI 증거가 있을 때의 처리는 `report only executed evidence`(`SKILL.md:90`) 한 줄뿐이다.
4. 서브에이전트 병렬 위임(`SKILL.md:20`)과 "측정 작업은 다른 CPU 집약 작업과 직렬화"(`SKILL.md:53`)는 긴장 관계다. 병렬 조사 중 측정이 겹치면 노이즈가 생길 수 있는데, 원문은 어느 단계에서 병렬을 멈추라고 명시하지 않는다.
5. 로컬 코퍼스 조사 허락(`SKILL.md:35`)이 있을 때 "집계 특성만 추출"하는 구체 절차(어떤 통계, 어디에 저장)는 없다. 에이전트가 실수로 원문 조각을 로그에 남길 위험이 절차로 막혀 있지 않고 문장 규칙에만 의존한다.

### 다른 스킬 / CLAUDE.md 충돌 가능 지점
- `dsh-ci-test-reliability`와 경계가 겹친다. 시계/프로세스/비동기 정리를 이 스킬이 직접 다루는 부분(`Serialize measured work`, 브라우저 반응성 측정)과 위임 부분(`SKILL.md:12`)의 구분선이 명확하지 않다.
- `dsh-pre-push-checks`와의 순서: push 전 점검은 `SKILL.md:90`에서만 언급된다. 이 스킬의 CI 확인과 pre-push 사이의 선후는 원문에 명시 없음.
- 프로젝트 `AGENTS.md`가 우선 권위로 지정돼 있다 (`Read [AGENTS.md]...`, `SKILL.md:12`). 사용자의 개인 CLAUDE.md와의 우선순위는 원문에 명시 없음.
- "최소 diff" 성격의 다른 지침과는 방향이 다를 수 있다. 이 스킬은 벤치마크 인프라, 기능 테스트, 노트를 함께 추가하라고 하므로 diff가 커진다. 스킬이 `Stop at the agreed scenario/fix scope`(`SKILL.md:92`)로 제한하긴 한다.

### 검증 공백 (원문이 확인하지 않고 넘어가는 것)
- 임계값 수치 부재: "materially", "small gain", "noise floor", "lucky run"에 수치가 없다. 같은 결과를 에이전트마다 다르게 판정할 수 있다.
- 샘플 수/반복 횟수 부재: `repeated measurements`(`SKILL.md:53`)의 횟수가 없다.
- 거부 기록의 저장 위치: `Record the rejected hypothesis briefly`(`SKILL.md:82`)에 위치 지정이 없다.
- 기준선 기록의 저장 위치 (`SKILL.md:61`) 부재.
- negative control의 실행 증거를 어디에 남기는지 원문에 명시 없음. 최종 요약 항목에는 들어 있다 (`SKILL.md:92`).
- 자기 진술 의존: negative control 수행과 "executed evidence" 보고의 진위를 확인하는 자동 장치는 원문에 없다. 사람 리뷰와 CI에 의존한다.
- 메모리 측정: GC 정책과 한도가 측정 카드 필드로만 요구되고(`SKILL.md:45`) 수치 기준이 없다.

### 유지보수 리스크
- 하드코딩된 상대 경로 8종 이상 (`SKILL.md:12`, `16`, `33`, `86`, `88`, `90`). 디렉터리 이동 시 링크가 끊긴다.
- 날짜가 박힌 노트 파일명 2종: `2026-09-06-evidence-driven-performance-skill.md`(`SKILL.md:16`), `2026-09-04-session-open-performance-gate.md`(`SKILL.md:33`). 노트가 supersede되면 스킬 본문이 낡는다. 스킬은 이를 인지하고 `Check relevant notes for supersession`(`SKILL.md:86`)을 요구한다.
- 용어 `dsh` 프로필, "required lane", "shared time calibration", "Agent Note", "keyless snapshot", "writable resume", "current-generation reopen" 등은 모두 리포지토리 고유 용어이며 스킬 안에서 정의되지 않는다. 외부 문서를 읽지 않으면 해석할 수 없다.
- 모델명, 도구 버전 하드코딩: 없음 (원문에 모델명/버전 언급 없음).

### 한 줄 판정
조건부 도입 권장 (DeepSeek Harness 리포지토리 안에서 성능 작업을 할 때만): 측정 카드, 최적화 전 기준선 실행, negative control이라는 증거 규율이 구체적이지만, 수치 임계값이 전혀 없고 리포지토리 고유 문서 8종 이상에 의존하므로 그 밖에서는 작동하지 않는다.
