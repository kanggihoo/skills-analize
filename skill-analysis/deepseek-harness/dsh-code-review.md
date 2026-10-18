# dsh-code-review 분석

## 1. 개요

- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-code-review/`
- 컬렉션: deepseek-harness
- 읽은 파일 전체 목록 (재귀 탐색 결과, 디렉터리 내 파일은 이것 하나뿐):

| 파일 | 크기 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 9,410 bytes | 53줄 | 스킬 본문 전부 (frontmatter + 4개 섹션) |

- `references/`, `scripts/`, `templates/`, `assets/` 디렉터리: 원문에 명시 없음 (존재하지 않음. `ls -laR` 결과 `SKILL.md` 단독).
- 보조 파일: 없음. 대신 SKILL.md 가 **디렉터리 밖** 파일을 상대 링크로 14개 이상 참조한다. 이 파일들은 분석 대상 디렉터리에 포함되어 있지 않으므로 내용은 읽지 않았고, 아래에서는 "링크 대상"으로만 다룬다.
  - 컬렉션 내부 형제 스킬 (존재 확인됨): `dsh-prose-standard`, `dsh-ci-test-reliability`, `dsh-client-ui-ux`
  - 컬렉션 밖 리포지토리 파일 (이 디렉터리에서 확인 불가): `AGENTS.md`, `packages/AGENTS.md`, `docs/defensive-patterns.md`, `docs/AGENTS.md`, `docs/testing.md`, `docs/subsystems/README.md`, `docs/i18n/translation-rules.md`, `docs/i18n/terminology.md`, `../../notes/implemented/process/2026-06-11-quality-gates.md`, `../../notes/README.md`
- 성격 한 줄: **감사(audit)** 스킬. 부가적으로 일부 **라우팅(routing)** 성격(prose / CI 신뢰성 / UI 스킬로 위임)을 가진다. 코드를 생성하지 않고, PR 을 읽고 결함 리포트를 쓰는 역할이다.
- 원문 자기 규정 (인용):
  > **This skill is guidance, not a complete checklist.** (`SKILL.md:8`)
  > Prioritize correctness, lifecycle, security, and broken required behavior over style; a short review with one substantiated blocker is better than a list of nits. (`SKILL.md:8`)
- 스킬 제목: `# Reviewing a DeepSeek-Harness PR` (`SKILL.md:6`)
- 구조: 도입 단락(8행) / `## Sources of truth`(10-20행) / `## Blocking requirements`(22-30행, 번호 7개) / `## Manual checks`(32-49행, 불릿 16개) / `## Reporting findings`(51-53행).

## 2. 활성화 조건 (언제 켜지는가)

### 2.1 frontmatter `description` 전문

> Use when reviewing a pull request in the deepseek-harness repo — orients the reviewer to this codebase's standards (AGENTS.md conventions, defensive patterns, ADRs, quality gates) and the review-specific checks that code alone can't show

(`SKILL.md:3`)

번역: deepseek-harness 리포지토리의 PR 을 리뷰할 때 사용. 이 코드베이스의 기준(AGENTS.md 규약, 방어 패턴, ADR, 품질 게이트)과 코드만으로는 드러나지 않는 리뷰 전용 점검 항목을 리뷰어에게 안내한다.

### 2.2 매칭되는 사용자 발화 예시 (트리거 사전 추출)

description 의 핵심 조건은 "reviewing a pull request" + "deepseek-harness repo" 두 가지이다. 이에 근거해 매칭되는 발화:

1. "Review this PR" (deepseek-harness 리포 안에서)
2. "Review PR #123 in deepseek-harness"
3. "이 풀 리퀘스트 리뷰해줘" (리포가 deepseek-harness 일 때)
4. "Check this PR against our AGENTS.md conventions"
5. "Does this PR follow the quality gates?"
6. "Look at this diff and tell me if there are blockers"
7. "Someone left review comments on my PR — verify each claim" (본문 53행 "When receiving review, verify each claim" 에 대응)

위 발화는 description 과 본문 문구에서 도출한 예시이며, 원문이 트리거 발화 목록을 직접 제공하지는 않는다 (원문에 명시 없음).

### 2.3 의도적으로 배제되는 발화와 넘길 스킬

description 에 "Use when ... in the deepseek-harness repo" 라는 한정이 박혀 있다. 그 외 명시적 배제 문장은 다음뿐이다.

- 번역 스킬:
  > the extended translation skill is outside automatic review and runs only on explicit user invocation. (`SKILL.md:20`)
  - 즉 "이 PR 의 번역 품질을 확장 검수해줘"는 이 스킬이 자동으로 처리하지 않고, 사용자가 명시적으로 번역 스킬(`dsh-translate-docs` 로 추정되나 원문은 스킬명을 적지 않음 — 원문에 명시 없음)을 호출해야 한다.
- 위임 라우팅 (배제는 아니지만 세부 판단을 넘기는 지점):
  - 산문(Markdown, JSDoc, 주석, 프롬프트, 진단문, 화면 문자열) → `dsh-prose-standard` (`SKILL.md:15`, `:24`)
  - 자원 소유·비동기·플래키 테스트 → `dsh-ci-test-reliability` (`SKILL.md:16`, `:45`)
  - 제품 사용자에게 보이는 GUI 변경 → `dsh-client-ui-ux` (`SKILL.md:17`)
- deepseek-harness 가 아닌 리포의 PR 리뷰: description 상 대상이 아니다. 어느 스킬로 넘길지는 원문에 명시 없음.
- PR 이 없는 상황(로컬 변경 리뷰 등): 본문이 "the PR's live base and exact head"(8행)를 전제하므로 PR 이 없으면 절차가 성립하지 않는다. 대체 스킬은 원문에 명시 없음.

### 2.4 frontmatter 필드

- `name`: `dsh-code-review`
- `description`: 위 인용
- `allowed-tools`, `model`, `metadata`, 기타 필드: **없음** (frontmatter 는 `name`, `description` 두 필드뿐, `SKILL.md:1-4`).

## 3. 적합 / 부적합

### 3.1 적합

- deepseek-harness 리포에서 PR 이 열려 있고, 리뷰어가 base/head 를 확인할 수 있는 상황. 본문은 "Verify and fetch the PR's live base and exact head" 를 요구한다 (`SKILL.md:8`).
- 플러그인/레지스트리/세션/에이전트 등 **생명주기가 있는 코드** 변경 (Registrations, lifecycle, disposal, callback, subprocess 관련 항목이 다수: `:27`, `:35`).
- `./invariant` 컴패니언 파일을 건드리는 PR (`:28`, `:46`).
- 모델이 받는 프롬프트·툴 스키마·진단을 바꾸는 PR (`:39`, `:48`).
- 이중언어(bilingual) 문서 변경 PR (`:20`, `:49`).
- 클라이언트 GUI 문자열 변경 PR (`:30`).
- 이미 받은 리뷰 코멘트를 검증해야 하는 작성자 입장 (`:53`).

### 3.2 부적합 · 과함

원문이 직접 "이럴 땐 쓰지 마라"를 적은 곳은 없다 (원문에 명시 없음). 본문 구조로부터 읽히는 사실만 적는다.

- 이 스킬의 모든 링크 대상(AGENTS.md, docs/*, notes/*)이 deepseek-harness 리포 구조에 고정되어 있다. 다른 리포에서는 링크 대상이 없다.
- `pnpm --silent run change-scope` 를 먼저 실행하라고 요구하므로 (`:8`) pnpm 스크립트가 없는 리포에서는 첫 단계가 성립하지 않는다.
- 소규모 스크립트·프로토타입·핫픽스에 대한 경량 모드: 원문에 명시 없음. 다만 "a short review with one substantiated blocker is better than a list of nits" (`:8`) 라는 문장이 리뷰 분량을 줄이는 방향의 유일한 규칙이다.

### 3.3 형제 스킬 대신 이걸 고르는 판정 기준 한 줄

PR 단위의 **리뷰 총괄**이면 `dsh-code-review`, 산문 품질 심사면 `dsh-prose-standard`, 테스트 플래키 해결이면 `dsh-ci-test-reliability`, GUI 설계면 `dsh-client-ui-ux` — 이 스킬은 위 셋을 "필요할 때 호출해 쓰는 상위 오케스트레이터" 위치에 있다 (`:24`, `:45`, `:17`).

## 4. 전제 조건과 외부 의존성

### 4.1 실행 스크립트·런타임·CLI

- 이 스킬 디렉터리 내 실행 스크립트: 없음 (`scripts/` 부재).
- 본문이 지시하는 명령은 하나:
  > run `pnpm --silent run change-scope --base <verified-base-ref> --head <verified-head-ref>` before reading the diff (`SKILL.md:8`)
  - 런타임: Node 계열 + pnpm. `change-scope` 스크립트는 리포의 package.json 에 있다는 전제이며 이 디렉터리에서는 확인 불가 (원문에 명시 없음).
  - 이 보고서의 역할: 원문은 "The report identifies paths and dirty layers but does not replace semantic review." 라고 규정한다.
- 암묵적으로 필요한 도구: PR 의 "live base and exact head" 를 가져오는 수단. 원문은 `gh` 등 도구명을 지정하지 않는다 (원문에 명시 없음). "Use the existing GitHub review thread for replies" (`:53`) 로 GitHub 이 전제됨.
- 본문이 언급하는 검증 도구: `verify-client-ui-i18n` (`:30`), `type-equiv` 엔트리 (`:26`), "pairing hash" (`:49`). 모두 리포 측 도구이며 사용법은 원문에 없음.

### 4.2 API 키·환경변수·네트워크

- API 키 / 환경변수: 불필요 (원문에 언급 없음).
- 네트워크: PR 의 live base/head 를 "fetch" 해야 하므로 원격 접근이 필요하다 (`:8`). 구체 방법은 원문에 명시 없음.

### 4.3 리포지토리 전제

| 전제 | 원문 근거 |
|---|---|
| pnpm 워크스페이스, `change-scope` 스크립트 | `:8` |
| `AGENTS.md` / `packages/AGENTS.md` / `docs/AGENTS.md` 계층 | `:12-14` |
| `docs/defensive-patterns.md` | `:13` |
| 품질 게이트 Agent Note `2026-06-11-quality-gates.md` | `:18` |
| 로컬 체크 절차 (`AGENTS.md#run-relevant-checks-locally`) | `:29` |
| CI "exhaustive matrix" | `:29` |
| 패키지 단위 README + JSDoc | `:25` |
| `./invariant` 컴패니언 + "publication wiring" | `:28` |
| 스냅샷 테스트 (transcript) | `:48` |
| 로더(Loader) / bin / worker / ACP bridge 진입 경로 | `:43` |
| Agent Notes 디렉터리(`notes/implemented/...`) | `:18`, `:47` |
| GitHub 리뷰 스레드 | `:53` |

테스트 러너, 린터, 타입 시스템의 종류: 원문에 명시 없음. 브랜치 전략은 "retarget or merge" 후 재실행 (`:8`) 이라는 언급 외에 없음.

### 4.4 비용 발생 지점

- 유료 API: 원문에 명시 없음.
- CI 분: 스킬이 직접 CI 를 돌리지는 않는다. "CI covers the exhaustive matrix" (`:29`) 로 CI 결과를 신뢰하는 구조.
- 토큰: 필수 읽기 대상이 매우 많다. 도입 단락 기준 diff + "enough surrounding code" (`:8`), 링크된 문서 약 13개 (`:12-20`). 토큰 상한은 원문에 명시 없음.

### 4.5 상태 파일·산출물 디렉터리

- 이 스킬이 만드는 상태 파일: 없음 (`plan.md`, `TODO`, `.claude/` 언급 없음).
- 쓰기 대상으로 언급되는 것은 PR 코멘트(GitHub) 뿐이다 (`:53`).
- 다만 리뷰 대상 PR 에 요구하는 파일 변경은 있다: Agent Note 를 `implemented` 로 이동·재작성 (`:47`), 패키지 README 갱신 (`:25`), subsystems 페이지 갱신 (`:26`). 이는 스킬이 만드는 파일이 아니라 PR 이 포함해야 할 파일이다.

## 5. 워크플로우

원문은 번호가 붙은 단계 흐름이 아니라 "선행 절차 → 차단 요건 7개 → 수동 점검 16개 → 보고" 구조다. 순서 강제 표현은 8행의 "before reading the diff" 하나뿐이고, 나머지 목록의 순서 강제 문구 ("run in order", "do not skip")는 원문에 명시 없음.

### 5.1 단계 0 — 기준 확정 (선행, 순서 강제)

- 입력: PR
- 행동: "Verify and fetch the PR's live base and exact head, then run `pnpm --silent run change-scope --base <verified-base-ref> --head <verified-head-ref>` before reading the diff and enough surrounding code to understand the design." (`:8`)
- 출력: change-scope 리포트 ("identifies paths and dirty layers")
- 통과 조건: 원문에 명시 없음 (명령 성공 외 기준 없음).
- 재실행 조건: "Re-establish the base and rerun it after a retarget or merge." (`:8`)
- 순서 강제: "before reading the diff" — 이 구간만 명시적 선후 관계.
- 한계 선언: "does not replace semantic review" (`:8`)

### 5.2 단계 1 — Sources of truth 확인 (`:10-20`)

- 입력: 링크된 문서 11개
- 행동: 리뷰 중 참조. 읽는 순서·범위 지정 없음.
- 출력: 없음 (기준 로딩)
- 통과 조건: 해당 없음
- 조건부 문서:
  - 이중언어 변경일 때만 `translation-rules.md`, `terminology.md` (`:20`)
  - Agent Note 와 의견이 다르면: "Treat disagreement with an Agent Note as a design discussion, not an automatic veto." (`:19`)

### 5.3 단계 2 — Blocking requirements 7개 (게이트)

제목이 "Blocking requirements" 이므로 이 7개가 **게이트(탈락 가능) 단계**이다. 아래 표는 각 항목의 입력 → 행동 → 출력 → 통과 조건이다.

| # | 입력 | 행동 (원문 동사) | 통과 조건 (원문) |
|---|---|---|---|
| 1 | 추가·변경된 Markdown, JSDoc, 주석, 프롬프트, 설명, 진단문, 화면 문자열 | "critically review" with `dsh-prose-standard` | "Verify required coverage, accuracy, placement, and editorial quality against the owning code or behavior; automated checks do not establish those properties." |
| 2 | Config, defaults, errors, wire fields, events, public behavior 변경 | README·JSDoc 동일 diff 에서 갱신 확인 | "update the package README and JSDoc in the same diff"; 주석은 "state non-obvious contracts" |
| 3 | spine / seam 어휘 변경 | subsystems 페이지 및 `type-equiv` 엔트리 갱신 확인 | "Internal types need no catalog entry." |
| 4 | 새 registry contribution | disposal 테스트 통과 확인 | `packages/AGENTS.md` 가 요구하는 disposal tests |
| 5 | 건드린 `./invariant` | 컴패니언의 의미성 검증 | 아래 5.3.1 참조 |
| 6 | 작성자의 로컬 체크 / CI | 실행 증거 확인 | "Verify the author ran the relevant local checks for the diff and that CI covers the exhaustive matrix" |
| 7 | Client UI 문자열 | 로케일 소유 여부 검증 | 아래 5.3.2 참조 |

탈락 시 에이전트 행동에 대한 원문: "Separate blockers from suggestions" (`:53`). 탈락 시 PR 차단 방식(request changes 등)은 원문에 명시 없음.

#### 5.3.1 Blocking 5 (invariant companion) 세부

> For every touched `./invariant`, require an owner event-stream or mutable-data relationship with independent observations at the point where that package can observe it; service or method presence, plugin metadata or effects, fixed pure examples, and probes that call the same operation they claim to verify belong in load, behavior, or unit tests. When no plausible relationship exists, require the package to omit the companion and publication wiring and record its package-specific reason in the README. Reject empty installers and invented checks.

- 즉 판정 분기: (a) 관계가 있다 → 독립 관측이 있는 컴패니언 요구. (b) 관계가 없다 → 컴패니언과 publication wiring 을 생략하고 README 에 이유 기록.
- 명시적 거절 대상: "empty installers and invented checks".
- "미리 정의된 임계값" 같은 수치: 없음.

#### 5.3.2 Blocking 7 (Client UI copy) 세부

> Reject product text embedded in JSX, templates, helper returns, accessibility attributes, or primitive defaults. Require typed dictionary keys, the standard `t` seat or explicit localized props, `verify-client-ui-i18n`, and behavior evidence in each affected locale; preserve user/model/wire data and code tokens verbatim.

- 거절 대상 5곳: JSX / templates / helper returns / accessibility attributes / primitive defaults
- 요구 4가지: typed dictionary keys / 표준 `t` seat 또는 명시적 localized props / `verify-client-ui-i18n` / 영향받는 각 로케일에서의 behavior evidence
- 보존 규칙: user/model/wire 데이터와 코드 토큰은 verbatim.

### 5.4 단계 3 — Manual checks 16개 (비게이트, 의미 리뷰)

"Manual checks" 는 차단 요건으로 명시되지 않았다. 각 항목은 리뷰어가 수행하는 탐색이다. 통과 조건은 대부분 명시되지 않고 "flag" / "require" 동사로 결함 판정만 제시한다.

| 항목 | 핵심 행동 (원문 동사) |
|---|---|
| Intent and interface contracts | "trace both sides of every changed interface"; PR·Agent Note 와 구현 일치, errors/cancellation/ownership/disposal 포함 |
| Lifecycle and concurrency | `defensive-patterns.md` 적용; "races before publication, cancellation during awaits, independent error reporting, callback containment, ownership before reentry, complete detach cleanup, and quiescent disposal" |
| Capability and consumer fit | "trace every current consumer"; consumer-specific 동작이 인터페이스로 새는 것을 flag; 단일 내부 소비자용 public method 추가는 "unnecessary API expansion" → "require a private capability closure handed to that consumer at construction instead" |
| Scope, ownership, and necessity | 각 추상·상태 기계·옵션·defensive copy·compat path 를 "current contract, production consumer, and owning plugin or service" 에 매핑; "Challenge unrelated features and speculative generality" |
| Configuration and public choices | 각 default / public operation set / format / imported external concept 의 근거("current-consumer evidence or prior art") 질의; 근거 없으면 "explicit choice or deferral" 요구 |
| Model perspective | 모델이 받는 "exact prompts, tool schemas, results, and diagnostics" 를 영향받는 모드 전반에서 검사; "Flag concepts outside the model's task"; "stable text verbatim and dynamic behavior through snapshots or end-to-end coverage" |
| Enforcement | "follow every denial path to the operation that executes it"; schemas, prompts, facades, wrappers, listener ordering 을 우회하는 direct/alternate caller 실험 |
| Borrowed and derived state | 보유 값이 borrowed 인지 owned 인지 패키지 계약 기준으로 판정; cache, prompt, UI echo, replay, query view 를 "documented success point and authoritative source" 까지 추적 |
| Bounds cover the final operation | 방출·보유 결과 전체(래퍼·메타데이터 포함)의 소유자 확인; "Probe tiny and exact limits, oversized single chunks, and multibyte text for byte limits." |
| Real entry path | 테스트가 "shipped Loader, bin, worker, ACP bridge, or subprocess" 를 통과하는지; "A hand-mounted plugin does not catch invalid Loader exports; a function plugin must named-export its namespace and have no default export." |
| Test strength | "assertions fail on the intended regression"; 외부 상태·로그·이벤트·disposal 검증; "Coverage is necessary but not evidence that the scenario is correct." |
| Test reliability | 자원 소유·비동기·플랫폼 민감·플래키 테스트에 `dsh-ci-test-reliability` 적용: "real worker/job topology, resource allocation, global-state restoration, synchronization, timeout budget, and quiescent teardown" |
| Invariant lifecycle and negative controls | 후보 관측이 publication 전에 거부되는지; "session-backed checks reconstruct durable history after late loading or HMR"; "a deliberately invalid case fails through the real runner for the intended rule" |
| Implemented Agent Notes match shipped reality | proposed Agent Note 를 구현하는 PR 은 "move and rewrite it as present-tense shipped state in the same diff", 이후 경로·이름·메커니즘을 구현과 대조 |
| Transcript changes | 에디터·모델에 보이는 변경은 스냅샷 갱신 또는 "explain why no snapshot applies"; "Review expected-output diffs as behavior changes, not formatting noise." |
| Bilingual changes | 양쪽의 의미·용어 비교; "a green pairing hash does not prove translation quality." |

### 5.5 단계 4 — 보고 (Reporting findings, `:51-53`)

- 입력: 위 단계에서 확인된 결함
- 행동/출력 형식:
  > State the defect, location, impact, and evidence. Place a localized defect inline on the tightest relevant diff range; use a PR-level comment for cross-cutting architecture, scope, or review-wide synthesis. Separate blockers from suggestions and omit issues already enforced by a green gate. Use the existing GitHub review thread for replies.
- 통과 조건: 해당 없음 (산출 단계)
- 수신 모드 규칙:
  > When receiving review, verify each claim and fix or rebut it on technical grounds without performative agreement. (`:53`)

### 5.6 루프 구조와 사람 개입

- 루프: base 변경 시 단계 0 재실행 (`:8`) 외에 반복 루프·재시도 상한·수렴 조건은 원문에 명시 없음.
- 도식:

```
[PR] -> verify live base + exact head
     -> pnpm change-scope (재실행: retarget/merge 후)
     -> diff + 주변 코드 읽기
     -> Blocking 1..7  (게이트)
     -> Manual checks 16 (탐색, 필요한 항목만)
     -> 보고: inline / PR-level, blocker vs suggestion 분리
```

- 사람 개입 지점: 번역 확장 스킬은 "only on explicit user invocation" (`:20`). 그 외 승인 요청·질문 라운드는 원문에 명시 없음.
- Agent Note 와 불일치 시 "design discussion" 으로 전환 (`:19`) — 논의가 필요하다는 의미이나 누구와 어떻게는 원문에 명시 없음.

## 6. 엔지니어링 규칙 분석

### 6.1 금지 규칙 (anti-pattern) 과 막으려는 실패 모드

| 원문 금지·거절 대상 | 위치 | 막으려는 실패 모드 |
|---|---|---|
| "Reject product text embedded in JSX, templates, helper returns, accessibility attributes, or primitive defaults." | `:30` | 현지화 불가능한 하드코딩 문구 |
| "Reject empty installers and invented checks" | `:28` | 형식만 갖춘 invariant 컴패니언 |
| "service or method presence, plugin metadata or effects, fixed pure examples, and probes that call the same operation they claim to verify" 는 invariant 가 아님 (load/behavior/unit 테스트 소속) | `:28` | 자기참조·동어반복 검증 |
| "flag implementation narration, test walkthroughs, review history, and duplicated rationale for deletion or a link to their one home" | `:25` | 주석 비대화, 사유 중복 |
| "a new public method on a generic service (registry, session, agent) whose only caller is one internal consumer is an unnecessary API expansion" | `:36` | 범용 서비스 API 의 소비자 종속 확장 |
| "Challenge unrelated features and speculative generality" | `:37` | 무관한 기능 동봉, 투기적 일반화 |
| "A hand-mounted plugin does not catch invalid Loader exports" | `:43` | 실제 진입 경로를 우회하는 테스트 |
| "a function plugin must named-export its namespace and have no default export" | `:43` | Loader 가 거부하는 export 형태 |
| "restating the implementation or trusting an agent's report" | `:44` | 구현을 되풀이하는 단언, 에이전트 보고 맹신 |
| "Coverage is necessary but not evidence that the scenario is correct." | `:44` | 커버리지 수치 = 정확성이라는 착각 |
| "a green pairing hash does not prove translation quality" | `:49` | 해시 일치를 번역 품질로 오인 |
| "Review expected-output diffs as behavior changes, not formatting noise." | `:48` | 스냅샷 diff 를 기계적으로 승인 |
| "automated checks do not establish those properties" | `:24` | 산문 품질을 자동 검사에 위임 |
| "without performative agreement" | `:53` | 리뷰 수신 시 근거 없는 동의 |
| "omit issues already enforced by a green gate" | `:53` | 게이트가 이미 잡은 사항의 중복 지적 |
| "a short review with one substantiated blocker is better than a list of nits" | `:8` | nit 위주 리뷰 |

### 6.2 강제 규칙 (수치·임계값)

- 원문에 **정량 임계값은 하나도 없다**: 커버리지 %, 줄 수 상한, 함수 길이, 재시도 횟수, 타임아웃 값, 커밋 단위 수치 — 전부 원문에 명시 없음.
- 원문에 등장하는 숫자는 구조적인 것뿐이다.
  - Blocking requirements 항목 수: 7 (`:24-30`, 번호 1-7)
  - Manual checks 불릿 수: 16 (`:34-49`)
  - 날짜 문자열 `2026-06-11` (품질 게이트 Agent Note 파일명, `:18`)
- 수치와 유사한 "경계 탐침" 지시만 존재:
  > Probe tiny and exact limits, oversized single chunks, and multibyte text for byte limits. (`:42`)
  - 구체적 한계 값은 지시하지 않음. 한계 값은 대상 코드가 정의한다.
- 강제 규칙 표 (조건 → 요구):

| 조건 | 강제 사항 | 위치 |
|---|---|---|
| 모든 PR | change-scope 를 `--base`/`--head` 와 함께 diff 읽기 전에 실행 | `:8` |
| base 재설정(retarget/merge) | change-scope 재실행 | `:8` |
| 산문 추가·변경 | `dsh-prose-standard` 로 의미 리뷰 | `:24` |
| config/defaults/errors/wire fields/events/public behavior 변경 | 같은 diff 에서 README + JSDoc 갱신 | `:25` |
| spine/seam 어휘 변경 | subsystems 페이지 + `type-equiv` 갱신 | `:26` |
| 신규 registry contribution | disposal tests | `:27` |
| `./invariant` 변경 | 의미 있는 컴패니언 또는 README 사유 기록 | `:28` |
| 모든 PR | 작성자의 로컬 체크 실행 증거 + CI exhaustive matrix | `:29` |
| Client UI 문자열 | typed dictionary keys + `t` seat + `verify-client-ui-i18n` + 로케일별 behavior evidence | `:30` |
| 에디터·모델 가시 변경 | 스냅샷 갱신 또는 무적용 사유 설명 | `:48` |
| proposed Agent Note 구현 | 같은 diff 에서 이동·현재형 재작성 | `:47` |

### 6.3 검증 방식 (무엇을 근거로 "됐다"고 판정하는가)

- 리뷰어 측 완료 판정 기준: 원문에 "리뷰 완료" 정의 없음 (원문에 명시 없음).
- 근거 유형별 정리:
  - **도구 결과**: `change-scope` 리포트 (경로·dirty layer 식별). 단 "does not replace semantic review".
  - **CI 결과**: "CI covers the exhaustive matrix" 를 전제하고 그 위의 의미 공백만 본다 (`:29`).
  - **작성자의 로컬 체크**: "Verify the author ran the relevant local checks" (`:29`). 어떻게 검증하는지(로그 요구, 재실행)는 원문에 명시 없음.
  - **테스트 설계 검토**: 단언이 의도한 회귀에서 실패하는지, 외부 상태·로그·이벤트·disposal 을 보는지 (`:44`).
  - **부정 통제(negative control)**: "a deliberately invalid case fails through the real runner for the intended rule" (`:46`) — 실제로 실패하는 케이스를 요구.
  - **자기 진술 배제**: "trusting an agent's report" 를 명시적으로 나쁜 테스트 특성으로 규정 (`:44`).
  - **사람/전문 스킬 판단**: 산문 품질은 자동 검사가 아니라 `dsh-prose-standard` 로 판단 (`:24`); 번역 품질은 pairing hash 로 판정 불가 (`:49`).
- 리뷰어 자신의 결론은 "State the defect, location, impact, and evidence" (`:53`) 로 근거 제시를 요구하므로, 리뷰 산출물에 대해서는 자기 진술만으로 끝나지 않는 구조다.

### 6.4 도구 사용 규칙

- 지시된 도구: `pnpm --silent run change-scope` (`:8`), `verify-client-ui-i18n` (`:30`).
- 금지된 도구: 원문에 명시 없음.
- 리뷰 코멘트 도구: GitHub 인라인/PR 레벨 코멘트 (`:53`). 구체 CLI는 원문에 명시 없음.
- 번역 확장 스킬은 자동 호출 금지: "runs only on explicit user invocation" (`:20`).

### 6.5 컨텍스트·토큰 규율

- 읽기 범위: "before reading the diff and enough surrounding code to understand the design" (`:8`) — "enough" 이상의 수치 한계 없음.
- 서브에이전트 위임: 원문에 명시 없음 (다른 스킬 호출은 있으나 서브에이전트 지시는 없음).
- 요약·압축 지시: 리뷰 결과에 대해서만 간결성 요구 — "short review with one substantiated blocker" (`:8`), "omit issues already enforced by a green gate" (`:53`).
- Sources of truth 13개 문서를 전부 읽으라는 지시는 없고, 이중언어 변경에만 조건부로 읽으라 명시 (`:20`). 나머지는 "standing ... rules" 로 제시될 뿐 읽기 시점 지정은 원문에 명시 없음.

### 6.6 모호어의 조작적 정의

| 모호어 | 원문의 환산 | 정의 유무 |
|---|---|---|
| "semantic review" | 산문: "required coverage, accuracy, placement, and editorial quality against the owning code or behavior" (`:24`) | 4축 분해는 있음. 각 축의 수치 기준은 원문에 명시 없음 |
| "necessary" / "necessity" | "map each abstraction ... to its current contract, production consumer, and owning plugin or service" (`:37`) | 매핑이 안 되면 불필요라는 환산 규칙에 해당 |
| "speculative generality" | 환산 규칙은 별도로 없음. 근접 기준은 "current-consumer evidence or prior art" (`:38`) | 근거 부재 시 "explicit choice or deferral" 요구 |
| "unnecessary API expansion" | "whose only caller is one internal consumer" (`:36`) | 조작적 정의 있음 (소비자 1개 + 내부) |
| "independent observations" | "at the point where that package can observe it" (`:28`) | 부분 정의. 독립성의 판정 절차는 원문에 명시 없음 |
| "strong test" | "assertions fail on the intended regression and verify external state, logs, events, or disposal" (`:44`) | 정의 있음 |
| "enough surrounding code" | 원문에 명시 없음 | 환산 없음 |
| "relevant local checks" | `AGENTS.md#run-relevant-checks-locally` 로 링크 위임 (`:29`) | 링크 대상 내용은 이 디렉터리에서 확인 불가 |
| "blocker" vs "suggestion" | 구분하라는 지시만 있고 기준 문장은 없음 (`:53`). 근접 기준: 8행의 우선순위 "correctness, lifecycle, security, and broken required behavior over style" | 부분 정의 |
| "nit" | 원문에 명시 없음 (style 이 후순위라는 8행 문장으로만 간접 한정) | 환산 없음 |
| "quiescent disposal / teardown" | 원문에 명시 없음 (`defensive-patterns.md` 에 위임) | 이 디렉터리 내 정의 없음 |
| "green gate" | 원문에 명시 없음 (품질 게이트 Agent Note 에 위임) | 이 디렉터리 내 정의 없음 |
| "done" (리뷰 종료) | 원문에 명시 없음 | 환산 없음 |

## 7. 산출물

### 7.1 최종 결과물의 형태

- 리뷰 코멘트(판정문·결함 보고). 파일·코드 diff 를 만들지 않는다.
- 두 가지 형태:
  - **인라인 코멘트**: "Place a localized defect inline on the tightest relevant diff range" (`:53`)
  - **PR 레벨 코멘트**: "use a PR-level comment for cross-cutting architecture, scope, or review-wide synthesis" (`:53`)
- 코멘트 필수 요소: "State the defect, location, impact, and evidence." (`:53`)
- 구분: "Separate blockers from suggestions" (`:53`)
- 제외: "omit issues already enforced by a green gate" (`:53`)

### 7.2 출력 포맷 강제 템플릿

- 포맷 템플릿 파일(`templates/`)과 고정 서식: 없음. 원문에 명시 없음.
- 강제되는 것은 코멘트에 담을 4요소(defect, location, impact, evidence)와 blocker/suggestion 분리뿐이다.

### 7.3 커밋·PR·브랜치 조작, 파괴적 동작

- 커밋·푸시·브랜치 생성·force push·파일 삭제·마이그레이션: 스킬 본문에 지시 없음 (원문에 명시 없음).
- 읽기 위주 동작: PR 의 base/head fetch, `change-scope` 실행, GitHub 코멘트 작성.
- "fetch" 가 로컬 git 상태에 미치는 영향(원격 ref 갱신)은 원문에 명시 없음.
- 문서 삭제 권고는 있다: "flag implementation narration ... for deletion or a link to their one home" (`:25`). 이는 PR 작성자에게 하는 요구이며 리뷰어가 직접 삭제하지 않는다.
- 리뷰를 받는 쪽 동작: "verify each claim and fix or rebut it" (`:53`) — 이 경우에는 코드 수정(fix)이 포함된다. 수정의 커밋 방식은 원문에 명시 없음.

## 8. 주의점 / 한계 (여기서만 평가)

### 8.1 오작동·과잉작동 시나리오

1. **링크 깨짐으로 인한 맹목 리뷰.** 스킬이 판정 기준 대부분을 외부 파일(`AGENTS.md`, `docs/defensive-patterns.md`, 품질 게이트 노트 등)에 위임한다. 스킬만 복사해 다른 환경에서 쓰면 에이전트는 링크 대상 없이 "relevant local checks", "green gate", "quiescent disposal" 같은 용어를 자의적으로 해석하게 된다. 이 디렉터리 자체에는 구체 체크 목록이 없다 ("guidance, not a complete checklist").
2. **Manual checks 16개 전수 수행 압박.** 순서·선택 기준이 없고 모든 항목이 동일한 형식(굵은 제목 + 지시)으로 나열되어 있어, 소규모 PR 에서도 에이전트가 16개를 전부 돌려 시간·토큰을 쓸 수 있다. 반대로 "short review ... better" (`:8`) 와 긴장 관계다. 규모별 선택 규칙은 원문에 없다.
3. **Blocking 7개의 범위 오판.** 항목 5(invariant)와 7(Client UI i18n)은 해당 파일이 없는 PR 에서는 적용 대상이 아니지만, 조건부 문구("For every touched ./invariant" `:28`; Client UI 문자열 `:30`) 외에 "해당 없음이면 건너뛴다"는 명시가 없다. 반면 6번(Required evidence)은 모든 PR 에 적용된다.
4. **blocker 와 suggestion 의 경계가 리뷰어 재량.** 기준은 "Prioritize correctness, lifecycle, security, and broken required behavior over style" (`:8`) 한 문장뿐이다. Blocking requirements 위반이 곧 blocker 인지, 그 외 Manual check 위반이 어디까지 blocker 인지 규칙이 없다. 에이전트마다 판정이 달라질 수 있다.
5. **change-scope 실패 시 행동 미정의.** 첫 단계가 `pnpm` 명령인데, 실패(워크스페이스 미설치 등)하거나 base 를 확정하지 못할 때 대체 절차는 원문에 명시 없음. 에이전트가 단계 0 을 건너뛰고 diff 부터 읽을 위험이 있다.
6. **"verify each claim" 과 "fix" 의 범위.** 리뷰 수신 모드 문장(`:53`)은 한 줄이라 코드 수정 권한·범위·커밋 규칙이 불명확하다. 같은 스킬 안에서 리뷰어 역할(읽기 전용)과 작성자 역할(수정)이 섞여 있다.
7. **번역 제외 규칙의 사각.** 번역 확장 스킬은 자동 리뷰 밖이라고 되어 있고(`:20`), 이중언어 변경 점검은 "meaning and terminology" 비교(`:49`)에 그친다. 자동 리뷰에서 번역 품질을 어느 깊이까지 봐야 하는지의 경계가 불명확하다.

### 8.2 다른 스킬·CLAUDE.md 규칙과의 충돌 가능 지점

- `dsh-prose-standard` 와의 이중 판정: Blocking 1 은 산문 리뷰를 해당 스킬에 위임하지만, Blocking 2 는 같은 산문(주석·JSDoc)에 대해 독자적 기준("flag implementation narration, test walkthroughs, review history, and duplicated rationale")을 갖는다. 두 스킬의 기준이 갈리면 어느 쪽이 우선인지 원문에 명시 없음.
- `dsh-ci-test-reliability` 와의 이중 판정: 44행(Test strength)과 45행(Test reliability)이 별도 항목이고 후자만 위임한다. 경계는 "resource-owning, asynchronous, platform-sensitive, or flaky" 라는 조건 판단에 달려 있다.
- `dsh-client-ui-ux` 와의 겹침: Sources 항목은 UI 스킬을 가리키지만(`:17`), Blocking 7 의 i18n 규칙은 본문에 직접 들어 있다. 두 곳의 규칙이 어긋날 때의 우선순위는 원문에 명시 없음.
- Agent Note 와의 관계: "Treat disagreement with an Agent Note as a design discussion, not an automatic veto" (`:19`) 는 리뷰어가 Note 위반을 blocker 로 못 올리게 한다. 반면 "Confirm the implementation matches the PR and any Agent Note" (`:34`) 는 일치를 확인하라 한다. 불일치 시 blocker 인지 논의 사항인지는 `:19` 로 후자에 가깝지만, 확정 문장은 없다.

### 8.3 검증 공백 (원문이 확인하지 않고 넘어가는 것)

- 작성자가 로컬 체크를 "ran" 했다는 증거의 형태(로그, CI 링크 등)를 정하지 않는다.
- CI 가 실제로 green 인지 확인하라는 명시 문장이 없다. "CI covers the exhaustive matrix" 는 커버 여부 확인이지 통과 여부 확인이 아니다 (`:29`).
- 성능, 보안(예: 비밀 유출, 의존성 취약점) 전용 점검 항목 없음. 8행에서 "security" 를 우선순위로 언급하지만 보안 체크리스트는 이 파일에 없다. 보안 상세는 원문에 명시 없음.

### 8.4 유지보수 리스크

- 하드코딩된 경로: 모든 링크가 상대 경로(`../../../AGENTS.md`, `../../notes/implemented/process/2026-06-11-quality-gates.md` 등). 스킬 위치나 문서 구조가 바뀌면 링크가 끊긴다.
- 날짜 박힌 파일명: `2026-06-11-quality-gates.md` (`:18`) — Agent Note 를 이동·개명하면 깨짐. 본문 47행이 Agent Note 를 `implemented` 로 옮기는 관례를 요구하므로, 이동이 일상적이다.
- 하드코딩된 명령: `pnpm --silent run change-scope --base ... --head ...` (`:8`). 스크립트명·플래그 변경에 취약하다.
- 도구 이름: `verify-client-ui-i18n`, `type-equiv`, "pairing hash" 는 이 파일 밖 정의에 의존.
- 앵커 링크: `AGENTS.md#conventions`, `AGENTS.md#run-relevant-checks-locally` (`:29`, `:37`, `:28`) — 제목 변경 시 앵커가 조용히 깨진다.
- 컬렉션 내부 참조 스킬 3개(`dsh-prose-standard`, `dsh-ci-test-reliability`, `dsh-client-ui-ux`)는 모두 현재 존재한다. 끊긴 스킬 참조는 없다. 단 번역 스킬은 이름 없이 서술만 되어 있어(`:20`) 참조가 느슨하다.

### 8.5 한 줄 판정

**조건부 (deepseek-harness 리포 전용으로 도입 권장)** — 근거: 판정 기준의 실체가 모두 `AGENTS.md`·`docs/*`·Agent Notes 라는 외부 링크에 있어, 그 문서들이 갖춰진 deepseek-harness 리포에서는 강한 리뷰 가이드이지만 단독으로는 정량 기준·완료 정의·blocker 판정 규칙이 없어 다른 환경으로는 이식되지 않는다.
