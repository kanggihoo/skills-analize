# dsh-find-simplifications 분석

## 1. 개요

- 컬렉션: deepseek-harness
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-find-simplifications/`
- 읽은 파일 전체 (디렉터리 재귀 조사 결과, 파일은 이 2개뿐. `scripts/`, `templates/`, `assets/` 디렉터리는 존재하지 않음)

| 파일 | 크기(바이트) | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 10674 | 67 | 핵심. 범위 설정, 탐색 질문 6개, 도달성 증명, 소유권/실패 의미론, 의존성 교체, 기록/검증 규칙 |
| `references/historical-patterns.md` | 8543 | 45 | 과거 단순화 결정(archived / implemented / rejected 노트)을 8개 패턴으로 묶은 교정(calibration)용 예시집 |

- 보조 파일 역할: `historical-patterns.md`는 "Use these examples to calibrate a candidate whose value is not established by an unused-symbol search." (`historical-patterns.md:3`). 즉 현재 삭제 목록이 아니라 판정 감각을 맞추는 참고자료다.
- 실행 스크립트: 없음. 순수 지침 문서.
- 성격 한 줄: **감사(audit)** 중심 + 제안서 작성(planning)이 결합된 스킬. 코드를 직접 생성하지 않고, 제거 가능한 유지보수 의무를 찾아 증거와 함께 제안한다. 구현은 사용자 허가 범위에서만.
- 원문 자기 규정 인용:
  > Find changes that remove maintained obligations: APIs, representations, lifecycle states, configuration paths, dependencies, tests, or documentation. Prefer a few well-supported candidates over a count of deletions. This is guidance, not a checklist; keep the user's scope and distinguish a survey from permission to implement its proposals. (`SKILL.md:8`)
- 이 스킬은 DeepSeek Harness 저장소 전용이다. 본문이 `AGENTS.md`, `docs/architecture.md`, `docs/defensive-patterns.md`, `docs/testing.md`, `docs/development.md`, `notes/` 등 저장소 내부 경로를 직접 참조한다.

## 2. 활성화 조건 (언제 켜지는가)

### 2.1 frontmatter description 전문

> Find evidence-backed simplifications in DeepSeek Harness code, APIs, configuration, tests, and prose; write or consolidate proposals, identify small inline cleanups, or assess simplifications from another branch. Use for removing dead, duplicated, speculative, or unnecessarily maintained behavior and infrastructure. (`SKILL.md:3`)

### 2.2 트리거 사전 (description 키워드에서 추출한 매칭 발화 예시)

description의 동사 구문 "find evidence-backed simplifications", "write or consolidate proposals", "identify small inline cleanups", "assess simplifications from another branch", "removing dead, duplicated, speculative, or unnecessarily maintained behavior and infrastructure"에 대응하는 발화 예:

1. "DeepSeek Harness에서 죽은 코드나 안 쓰는 API를 찾아서 단순화 후보를 뽑아줘."
2. "Find simplifications in the persistence and loop packages."
3. "이 설정 키 아무도 안 읽는 것 같은데, 지워도 되는지 근거 포함해서 제안서 써줘."
4. "Consolidate the simplification proposals in the notes into one."
5. "다른 브랜치의 simplification PR을 base 대비 diff로 비교해서 겹치는 건 합쳐줘." (`SKILL.md:65` "When folding another branch")
6. "Which tests only exist to keep a duplicate definition equal? Can we delete the whole thing?"
7. "이 캐시/이벤트 구독, 권위 있는 값을 필요할 때 읽으면 없앨 수 있는지 봐줘." (`SKILL.md:25`)
8. "Is this optional-service-presence check really policy, or can explicit config replace it?" (`SKILL.md:26`)

### 2.3 의도적 배제 / 넘길 스킬 (본문에 박힌 라우팅 규칙)

| 상황 | 원문 근거 | 넘길 대상 |
|---|---|---|
| 산문(prose) 정리가 범위에 포함 | "Use [dsh-prose-standard](../dsh-prose-standard/SKILL.md) when prose is in scope." (`SKILL.md:59`) | `dsh-prose-standard` |
| 새 노트 작성 시 대체(supersession) 검사 | "Every new note requires a scoped supersession check through [dsh-archive-agent-notes](../dsh-archive-agent-notes/SKILL.md). That workflow owns retention, consolidation, triplet deletion, and frozen archive mechanics." (`SKILL.md:63`) | `dsh-archive-agent-notes` |
| 코드/기타 변경의 푸시 전 검사 선택 | "Select other checks through [dsh-pre-push-checks](../dsh-pre-push-checks/SKILL.md)." (`SKILL.md:67`) | `dsh-pre-push-checks` |
| 작은 로컬 개선 | "Small local improvements belong in actionable `TODO`/`FIXME`/`XXX` comments under the [urgency rules](../../../docs/development.md), not standalone design records." (`SKILL.md:41`) | 스킬 아님. 코드 주석 규칙 (`docs/development.md`) |
| 구현된 결정의 기록 포맷 | "An implemented decision uses the [implemented format](../../notes/README.md#the-body-skeleton) instead." (`SKILL.md:61`) | `notes/README.md` 규칙 |

- 보호 대상으로 인한 제안 배제(발화 자체를 거부하는 것은 아니지만 제안 금지):
  > The two LLM adapters are intentional. JSONL is the sole first-party Session persistence provider, while the backend-neutral Service Definition supports out-of-tree providers. Do not propose deleting an LLM twin or the persistence seam unless the user explicitly overrides that constraint. (`SKILL.md:14`)
- 조사 배제: "Archived notes are historical examples, not current authority: never inspect, verify, or repair their outbound links." (`SKILL.md:12`)
- 서베이와 구현의 분리: "distinguish a survey from permission to implement its proposals" (`SKILL.md:8`). 사용자가 "찾아줘"라고만 하면 구현하지 않는 쪽으로 배제된다.
- "A code survey does not imply a repository-wide note audit." (`SKILL.md:63`) 노트 전수 감사 발화는 이 스킬의 범위 밖으로 취급.

### 2.4 frontmatter 필드

- 존재: `name: dsh-find-simplifications`, `description` (`SKILL.md:2-3`)
- `allowed-tools`, `model`, `metadata` 등 그 외 필드: 없음.

## 3. 적합 / 부적합

### 3.1 적합

- DeepSeek Harness 모노레포(`packages/*/*/src`, `apps/`, `python/` 등, `SKILL.md:33`)에서 유지보수 의무를 줄이려는 감사 작업.
- 선언은 있으나 생산자(producer)/소비자(consumer)가 끊긴 필드·유니온 멤버·설정 키 정리 (`SKILL.md:22`).
- 서브시스템 하나를 더 작은 명시적 동작으로 대체해 삭제할 수 있는지 검토 (고정 주기 스케줄, 명시적 타임존 등, `SKILL.md:24`).
- 중복 캐시/이벤트 구독/복사 이력 제거 후보 (`SKILL.md:25`).
- 중복 앱 트리, 데모 런처, resolver 전용 워크스페이스, 설치 보조기구 (`SKILL.md:27`).
- 다른 브랜치의 단순화 제안을 base 대비로 재평가·병합 (`SKILL.md:65`).
- 광범위 요청: 도메인별 서브에이전트 분할이 가능한 대규모 조사 (`SKILL.md:16`).

### 3.2 부적합 / 과함

- DeepSeek Harness가 아닌 저장소: 문서 경로(`AGENTS.md`, `docs/*.md`, `notes/`)와 스킬 형제(`dsh-*`)가 전제이며, 그 외 저장소에 대한 적용 방법은 원문에 명시 없음.
- LLM 어댑터 쌍 또는 영속성 seam 삭제 요구: 사용자가 명시적으로 override하지 않는 한 제안 금지 (`SKILL.md:14`).
- 단순한 인라인 정리 한두 건: 별도 설계 노트가 아니라 `TODO`/`FIXME`/`XXX` 주석 (`SKILL.md:41`).
- 산문만 고치는 작업: `dsh-prose-standard` (`SKILL.md:59`).
- 노트 보관·통합·삭제 메커니즘 자체: `dsh-archive-agent-notes` (`SKILL.md:63`).
- 삭제 개수를 채우려는 목적: "Prefer a few well-supported candidates over a count of deletions." (`SKILL.md:8`) 및 "do not create duplicate notes to preserve candidate counts" (`SKILL.md:61`).

### 3.3 형제 스킬 대신 이걸 고르는 판정 기준 한 줄

"제거 가능한 유지보수 의무를 근거(소비자 증거 + 거부된 대안)와 함께 찾는 일이면 이 스킬, 산문이면 `dsh-prose-standard`, 노트 보관이면 `dsh-archive-agent-notes`, 푸시 전 검증이면 `dsh-pre-push-checks`."

## 4. 전제 조건과 외부 의존성

### 4.1 실행 스크립트 / 런타임

- 번들 스크립트: 없음 (파일 2개 모두 마크다운).
- 원문이 언급하는 CLI/도구:
  - `rg` — "Start with `rg`, then read the matches." (`SKILL.md:31`)
  - `pnpm run doc-sync`, `pnpm run lint`, `git diff --check` (`SKILL.md:67`)
  - 스킬/주석 편집 시 "the applicable validator" — 구체 명령은 원문에 명시 없음.
  - 그 외 검사는 `dsh-pre-push-checks`에 위임 (`SKILL.md:67`).
  - 서브에이전트 (`SKILL.md:16`), draft PR (`SKILL.md:67`), 다른 PR 닫기 (`SKILL.md:65`).
- Node 엔진 하한: "Search existing dependencies and Node builtins at the engine floor before adding a package." (`SKILL.md:53`) 엔진 하한의 구체 버전은 원문에 명시 없음.

### 4.2 API 키 / 환경변수 / 네트워크

- 원문에 명시 없음. 스킬 자체는 불필요. (서브에이전트·PR 사용 시 환경에 따라 달라지나 원문은 다루지 않음.)

### 4.3 리포지토리 전제

- 읽어야 하는 문서 (`SKILL.md:12`): `AGENTS.md`, `docs/architecture.md`("before judging packages"), `docs/defensive-patterns.md`, `docs/testing.md`, 관련 활성 Agent Notes, `notes/README.md`(note rules).
- 추가 참조: `docs/development.md`(urgency rules, `SKILL.md:41`), `notes/implemented/process/2026-07-26-dependencies-over-hand-rolling.md`(dependency policy, `SKILL.md:53`), `notes/README.md#the-body-skeleton` (`SKILL.md:61`).
- 형제 스킬 3개가 존재해야 함: `dsh-prose-standard`, `dsh-archive-agent-notes`, `dsh-pre-push-checks`.
- 패키지 매니저 pnpm, 모노레포 구조(`packages/*/*/src`, `apps/`, `python/`), 테스트 정책 문서, 노트 체계(active / archived / implemented / rejected)가 전제.
- 커밋 권한·브랜치 전략: "Use a draft PR while the survey is expanding" (`SKILL.md:67`)로 PR 생성이 가능한 환경을 전제하나, 브랜치 전략 상세는 원문에 명시 없음.

### 4.4 비용 발생 지점

- 유료 API·CI 분에 대한 명시: 원문에 명시 없음.
- 토큰 비용: 광범위 요청 시 다중 서브에이전트 병렬 (`SKILL.md:16`), 문서 6종 이상 선독(`SKILL.md:12`), "Inspect substantial production machinery as well as obvious unused symbols; do not stop after the first promising deletion." (`SKILL.md:16`) — 조사 깊이를 요구하므로 토큰 사용이 큼. 수치 상한은 원문에 명시 없음.

### 4.5 상태 파일 / 산출물 디렉터리

- 신규 제안은 노트로 기록: "A substantial proposal uses the mandatory note skeleton" (`SKILL.md:61`). 노트 디렉터리는 `notes/` 하위 (`notes/archived/simplification/`, `notes/implemented/simplification/`, `notes/rejected/simplification/`, `notes/implemented/process/` — 모두 `historical-patterns.md` 및 `SKILL.md:53`에서 인용된 경로). 신규 노트의 정확한 저장 경로 규칙은 `notes/README.md`에 위임, 원문(이 스킬)에 명시 없음.
- `.claude/`, `plan.md`, `TODO` 파일 생성: 없음. 코드 내 `TODO`/`FIXME`/`XXX` 주석만 언급.

## 5. 워크플로우

원문 섹션 헤더 순서: Establish scope and constraints → Search for removable obligations → Prove reachability and the trade-off → Preserve ownership and failure semantics → Replace infrastructure only for a net reduction → Record, consolidate, and validate.

순서 강제 여부: "This is guidance, not a checklist" (`SKILL.md:8`). "run in order"류 강제 문구는 원문에 명시 없음. 단 아래 단계 0의 "read ... before judging packages"는 선행 조건 표현이다. `[GATE]`는 탈락 가능 단계를 가리킨다 (원문이 "Reject a candidate when..."라고 말하는 지점).

### 단계 0. 범위와 제약 설정 (비게이트, 선독 강제)

- 입력: 사용자 요청, 저장소.
- 행동: `AGENTS.md`, `docs/architecture.md`(패키지 판단 전), `docs/defensive-patterns.md`, `docs/testing.md` 읽기. 관련 active Agent Notes 확인. 신규 기록은 note rules 사용. archived 노트는 링크 추적·검증·수리 금지 (`SKILL.md:12`).
- 보호 제약 반영: LLM 어댑터 쌍, 영속성 seam은 제안 금지 (`SKILL.md:14`). 단 "Unused members within a protected design remain candidates when their removal preserves its purpose."
- 광범위 요청 시 5개 독립 도메인으로 서브에이전트 분할 (`SKILL.md:16`):
  1. loop and persistence
  2. model/tool assembly
  3. Host, Client, and SDKs
  4. subprocess and execution providers
  5. composition, scripts, tests, and documentation
  - 에이전트별 요구: "Give each agent a bounded domain and require consumer evidence and rejected alternatives."
- 출력: 범위·제약이 확정된 조사 계획.
- 통과 조건: 원문에 명시된 별도 통과 조건 없음.
- 사람 개입: "keep the user's scope" (`SKILL.md:8`) — 서베이 vs 구현 허가의 구분을 사용자 지시에 맞춘다.

### 단계 1. 제거 가능한 의무 탐색 (비게이트, 질문 6개)

필요 시 `historical-patterns.md`의 해당 섹션으로 교정 (`SKILL.md:20`). 질문 6개:

| # | 질문 | 찾는 것 | 원문 |
|---|---|---|---|
| 1 | Does a declared feature have a complete effect path? | producer → 변환 → provider/endpoint 지원 → 관찰 가능한 결과. setter 없음 / reader 없음 / 거부만 하는 구현 | `SKILL.md:22` |
| 2 | Which distinctions change a consumer's action? | 한 모델용 상태·식별자로 합칠 수 있는 내부 상태들. 권한/상주(residency)/내구성/소유권 구분은 유지 | `SKILL.md:23` |
| 3 | Could a smaller explicit behavior remove the subsystem? | 고정 주기, 호출자 제공 타임존, 활성화 실패 보고로 달력/영속 기본값/자동 롤백 제거 | `SKILL.md:24` |
| 4 | Can a consumer read the authoritative value when needed? | 복사된 이력, 승격 장부, 무효화 이벤트 후 읽기, 공유 projection 옆 기능 캐시 | `SKILL.md:25` |
| 5 | Is composition being mistaken for policy? | 서비스 존재 / provider 메서드 / 형제 도구 존재로 정책을 추론하는 경우 | `SKILL.md:26` |
| 6 | What owns the complete maintenance cost? | 패스스루 설정, 중복 앱 트리, 제품이 쓰는 데모 런처, resolver 전용 워크스페이스, 설치 보조기구 | `SKILL.md:27` |

- 질문 1 세부: "Search constructors and discriminant emitters as well as callers."
- 질문 3 세부: "Name the capability given up and the machinery deleted. A production caller makes this a behavior decision, not an automatic rejection; implementation must remain within the user's authorization."
- 질문 6 세부: "Compare the entire removed system with the replacement, including residual glue; moving complexity or adding a gate to keep duplicate definitions equal does not remove it."
- 종료 조건: "do not stop after the first promising deletion" (`SKILL.md:16`).

### 단계 2. 도달성과 트레이드오프 증명 (게이트)

- 입력: 단계 1 후보.
- 행동: `rg`로 시작 후 매치를 읽는다. 검색 대상: "exact symbols, property reads and writes, discriminants, event and wire strings, config keys, package names, and both `.method(` and `method(` forms." (`SKILL.md:31`)
- 포함 범위 (`SKILL.md:33`): `packages/*/*/src`, `apps/`, `python/`, runtime scripts, shipped profiles and overlays, package manifests and exports, loader resolution, generated runtime assets, installed-package consumers.
- 분류 규칙: 예제·픽스처는 디렉터리명이 아니라 실제 진입점 기준. 생성된 카탈로그는 소비자까지 추적 (모델이 쓰는 플러그인 마운트가 쓰는 카탈로그는 동적 제품 API, 문서용 목록은 고정 호출자 아님). "Public third-party extension paths can be intentional despite zero repository call sites."
- 주의: "Tests and declarations can show a contract without proving a shipped producer or consumer." (`SKILL.md:31`)
- 후보별 기록 항목 (`SKILL.md:35`): 현재 owner, effective producer/consumer path, 사라지는 것, 남는 것, 유지해야 할 가장 강한 이유.
- 후보 3분류 (`SKILL.md:37-39`):
  - removal of unreachable or unread behavior
  - a narrower public or product behavior with an explicit loss
  - a protected obligation or insufficient evidence
- **[GATE] 탈락 조건 (`SKILL.md:41`)**: "Reject a candidate when it breaks a retained obligation, merely relocates the same complexity, or has no meaningful reduction."
- 탈락 시 행동: 후보 폐기(거부 사유 기록). 거부 사유 해석: "Read rejection reasons at the level of the proposed change: a stale inventory or a mixed proposal's rejected behavior does not settle every independent item. Refresh the evidence before re-proposing one."
- 탈락한 소규모 항목의 행선지: 별도 설계 노트가 아니라 actionable `TODO`/`FIXME`/`XXX` 주석.
- 통과 조건: 위 3분류 중 앞의 두 가지로 분류되고 기록 5항목이 채워짐.

### 단계 3. 소유권 / 실패 의미론 점검 (게이트성 점검)

- 복사·freeze·검증기·콜백 캡처: 값의 origin, next owner, trust boundary를 명명 (`SKILL.md:45`).
  - "Typed same-process calls ordinarily borrow readonly values; parsers, config loaders, queues, model/tool JSON, durable files, workers, processes, and wire decoders own or validate their inputs."
  - "Hostile-getter or callback-replacement tests do not establish a requirement by themselves. A frozen root does not prove its descendants immutable, and equal ids do not prove object identity."
- 비동기 장치: promise, flag, cancellation path, disposer, reservation을 owner와 transition에 매핑 (`SKILL.md:47`). "Collapse mechanisms only when they express the same fact."
- 보존 항목: "synchronous publication and rollback, callback containment, first-terminal-outcome arbitration, worker/process ownership, and dispose-to-quiescence where required."
- 내구 기록: "Durable start/end markers can record real facts even when transcript renderers ignore them; dropping interrupted work is a capability loss, not redundant-log cleanup."
- invariant companion 규칙 (`SKILL.md:49`):
  - 정당화 조건: "comparing independently produced observations that can diverge."
  - 불인정: "Checks of service presence, plugin metadata, fixed examples, or the same mutation's return value do not qualify."
  - 제거 시 동반 삭제: export, build entry, invariant-only compiler references, dependencies, tests; "record the package-specific omission reason in both READMEs."
  - 유지: "Keep checks comparing independent event producers, durable history, or mutable data."
- 탈락 시: 해당 단순화는 보존 의무를 깨므로 기각 (단계 2의 reject 조건과 동일 계열).

### 단계 4. 인프라 교체 평가 (게이트, 해당 시에만)

- 입력: 직접 구현을 라이브러리·빌트인으로 교체하자는 후보.
- 행동 (`SKILL.md:53`): dependency policy 노트를 따른다. 새 패키지 추가 전 기존 의존성과 엔진 하한의 Node builtins 검색. 교체가 삭제하는 정확한 구현과 전용 테스트, 유지보수·전이 비용, glue가 보존해야 할 잔여 동작을 식별.
- 시험할 불일치 (`SKILL.md:55`): "protocol truncation, cancellation and teardown, configured bounds, deterministic test clocks, platform packaging, and source versus built entry points."
- **[GATE] 탈락 예시**: "A library that covers framing but requires rebuilding the same framing to enforce a size limit is not a simplification."
- 수락된 엣지 동작 변경은 제안과 관련 테스트에 포함. "Do not re-prove a dependency's generic specification while omitting tests for the harness-specific shim."
- 통과 조건: 순감소(net reduction) — 제목 "Replace infrastructure only for a net reduction" (`SKILL.md:51`).

### 단계 5. 기록 / 통합 / 검증 (비게이트 + 일부 사람 개입)

- 산문 범위면 `dsh-prose-standard` 사용; 코드 재진술·원격 소유 설명 제거, 로컬 동작/타이밍/소유권/실패 의무 유지. README, JSDoc, 모델에 보이는 카탈로그, 설정, 스냅샷, 생성 파일을 소유 변경과 함께 갱신 (`SKILL.md:59`).
- 제안서 작성: 필수 노트 골격 `Problem`, `Proposal`, `Alternatives considered`, `Acceptance criteria`, `Risks` (`SKILL.md:61`). 포함 요소: concrete consumer evidence, removed maintenance cost, capability given up, observable acceptance conditions. 구현 완료된 결정은 implemented format 사용. 같은 결정이면 기존 owner 노트를 갱신, 중복 노트 금지.
- **[GATE] 대체(supersession) 검사**: 신규 노트마다 `dsh-archive-agent-notes`를 통한 scoped supersession check 필수 (`SKILL.md:63`). 부분 대체와 현재의 durable / wire / compatibility / rejected-alternative 의무는 보존.
- 다른 브랜치 접기 (`SKILL.md:65`): 독립 diff를 target base 대비로 비교, 지원되는 비중복 제안만 포팅, 겹치는 근거는 통합. 다른 PR 닫기는 권한 또는 명확한 소유가 있을 때만.
- 검증 (`SKILL.md:67`):
  - docs-only Agent Note 작업: `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`
  - 스킬/주석 편집: 해당 validator 추가
  - 그 외: `dsh-pre-push-checks`로 선택
- 보고 항목 (`SKILL.md:67`): surveyed areas, supported candidates, meaningful rejections or deferrals, notes added/consolidated/retained/removed, commands actually run.
- PR 정책: "Use a draft PR while the survey is expanding; do not describe an unverified search as exhaustive."

### 루프 / 수렴 구조
- 재시도 상한, 반복 횟수, 수렴 수치 조건: 원문에 명시 없음. 종료 기준은 "do not describe an unverified search as exhaustive" 정도의 서술뿐.

### 사람 개입 지점

- 서베이 vs 구현 허가 구분 (`SKILL.md:8`).
- LLM 쌍/영속성 seam 제안은 "unless the user explicitly overrides that constraint" (`SKILL.md:14`).
- 행동 결정(production caller가 있는 제거)은 "implementation must remain within the user's authorization" (`SKILL.md:24`).
- 다른 PR 닫기는 authorization 필요 (`SKILL.md:65`).
- 질문 라운드·승인 요청 UI 형식: 원문에 명시 없음.

## 6. 엔지니어링 규칙 분석

### 6.1 금지 규칙 (anti-pattern)

| # | 원문 | 막으려는 실패 모드 |
|---|---|---|
| 1 | "Do not propose deleting an LLM twin or the persistence seam unless the user explicitly overrides that constraint." (`SKILL.md:14`) | 의도된 이중 구현/확장점을 중복으로 오인해 삭제 제안 |
| 2 | "never inspect, verify, or repair their outbound links." (archived 노트, `SKILL.md:12`) | 동결 스냅샷을 현재 권위로 취급하거나 링크 수리로 불필요한 diff 발생 |
| 3 | "do not stop after the first promising deletion." (`SKILL.md:16`) | 조기 종료, 명백한 미사용 심볼만 훑는 얕은 조사 |
| 4 | "Zero fixed callers is weaker evidence than unreachability." (`historical-patterns.md:9`) | 호출자 0건 = 죽은 코드라는 단정 (서드파티 등록 경로 오삭제) |
| 5 | "moving complexity or adding a gate to keep duplicate definitions equal does not remove it." (`SKILL.md:27`) | 복잡도 이동을 단순화로 보고 |
| 6 | "Hostile-getter or callback-replacement tests do not establish a requirement by themselves." (`SKILL.md:45`) | 방어적 복사/freeze를 테스트 존재만으로 정당화 |
| 7 | "A frozen root does not prove its descendants immutable, and equal ids do not prove object identity." (`SKILL.md:45`) | 얕은 freeze·id 동등성에 대한 잘못된 불변성 가정 |
| 8 | "dropping interrupted work is a capability loss, not redundant-log cleanup." (`SKILL.md:47`) | 내구 start/end 마커 삭제로 중단 작업 복구 능력 상실 |
| 9 | "Checks of service presence, plugin metadata, fixed examples, or the same mutation's return value do not qualify." (`SKILL.md:49`) | 독립 관찰이 아닌 자기확인 invariant companion 유지 |
| 10 | "Do not re-prove a dependency's generic specification while omitting tests for the harness-specific shim." (`SKILL.md:55`) | 라이브러리 일반 명세 테스트에 집중하고 harness 고유 glue를 무검증 |
| 11 | "do not create duplicate notes to preserve candidate counts." (`SKILL.md:61`) | 후보 수 채우기용 중복 노트 |
| 12 | "do not describe an unverified search as exhaustive." (`SKILL.md:67`) | 검증 안 된 검색을 전수라고 주장 |
| 13 | "Convenience, smaller unions, or fewer tests alone do not justify losing required data or behavior." (`historical-patterns.md:21`) | 편의·축소만을 근거로 한 기능 손실 |
| 16 | "Do not move a requirement past the place that must enforce it." (`historical-patterns.md:27`) | 검증을 소비 지점 너머로 이동시켜 방어 상실 |
| 17 | "Do not erase distinct durable facts merely because one renderer ignores them." (`historical-patterns.md:15`) | 렌더러 무시를 이유로 내구 사실 삭제 |

### 6.2 강제 규칙 (수치·임계값 포함)

수치형 임계값(커버리지 %, 줄 수 상한, 재시도 횟수, 타임아웃, 함수 길이, 커밋 단위)은 이 스킬 원문에 **없다**. 원문에 등장하는 숫자는 다음이 전부다.

| 항목 | 값 | 출처 |
|---|---|---|
| 광범위 요청의 독립 도메인 수 | 5개 (loop and persistence; model/tool assembly; Host, Client, and SDKs; subprocess and execution providers; composition, scripts, tests, and documentation) | `SKILL.md:16` |
| 탐색 질문 수 | 6개 | `SKILL.md:22-27` |
| 후보 분류 수 | 3개 | `SKILL.md:37-39` |
| 필수 노트 골격 섹션 수 | 5개 (`Problem`, `Proposal`, `Alternatives considered`, `Acceptance criteria`, `Risks`) | `SKILL.md:61` |
| docs-only 검증 명령 수 | 3개 (`pnpm run doc-sync`, `pnpm run lint`, `git diff --check`) | `SKILL.md:67` |
| 보고 항목 수 | 5개 (surveyed areas, supported candidates, meaningful rejections or deferrals, notes added/consolidated/retained/removed, commands actually run) | `SKILL.md:67` |
| 도달성 검색 대상 범위 | 9개 (packages/*/*/src, apps/, python/, runtime scripts, shipped profiles and overlays, package manifests and exports, loader resolution, generated runtime assets, installed-package consumers) | `SKILL.md:33` |

강제 규칙(정성):

| 규칙 | 원문 |
|---|---|
| 판단 전 문서 선독 | "Read `AGENTS.md`, [architecture]... before judging packages, [defensive patterns], and [testing policy]." (`SKILL.md:12`) |
| 서브에이전트에 증거 요구 | "require consumer evidence and rejected alternatives" (`SKILL.md:16`) |
| 후보별 기록 | "record the current owner, effective producer/consumer path, what disappears, what remains, and the strongest reason to retain it." (`SKILL.md:35`) |
| 비동기 보존 | "Preserve synchronous publication and rollback, callback containment, first-terminal-outcome arbitration, worker/process ownership, and dispose-to-quiescence where required." (`SKILL.md:47`) |
| 컴패니언 제거 시 동반 작업 | export, build entry, invariant-only compiler references, dependencies, tests 제거 + 양쪽 README에 생략 사유 (`SKILL.md:49`) |
| 의존성 교체 비용 식별 | 삭제되는 구현·전용 테스트, 유지보수·전이 비용, 잔여 동작 (`SKILL.md:53`) |
| 노트 골격 | 5개 섹션 + 구체적 소비자 증거 등 4요소 (`SKILL.md:61`) |
| 신규 노트마다 supersession 검사 | `SKILL.md:63` |
| 부분 대체·현재 의무 보존 | "Preserve partial supersessions and current durable, wire, compatibility, or rejected-alternative obligations." (`SKILL.md:63`) |
| 연동 갱신 | README, JSDoc, model-visible catalogs, configuration, snapshots, generated files를 소유 변경과 함께 (`SKILL.md:59`) |

### 6.3 검증 방식

- 단순화 후보의 "맞다" 판정 근거: **정적 증거** — `rg` 검색 후 매치 읽기, 소비자 경로 추적 (`SKILL.md:31`). 코드 실행·테스트 통과가 후보 채택 조건이라는 문구는 원문에 명시 없음.
- 산출물(문서/노트)의 검증: 명령 실행 — `pnpm run doc-sync`, `pnpm run lint`, `git diff --check` (`SKILL.md:67`), 스킬/주석 편집은 "applicable validator", 기타는 `dsh-pre-push-checks`.
- 제안 후보의 수락 기준: 노트의 `Acceptance criteria` 섹션 — "observable acceptance conditions" (`SKILL.md:61`).
- 완료 보고: "commands actually run"을 보고 (`SKILL.md:67`) — 실제 실행한 명령만 기재하도록 요구. 이는 자기 진술을 실행 증거로 제한하는 문구.
- 포괄성 주장 제한: "do not describe an unverified search as exhaustive."

### 6.4 도구 사용 규칙

| 도구 | 지시 | 출처 |
|---|---|---|
| `rg` | 첫 검색 도구. 그 후 매치를 직접 읽음 | `SKILL.md:31` |
| 서브에이전트 | 광범위 요청에서 독립 도메인별 분할 | `SKILL.md:16` |
| `pnpm run doc-sync` / `pnpm run lint` / `git diff --check` | docs-only Agent Note 작업 검증 | `SKILL.md:67` |
| draft PR | 서베이가 확장 중일 때 | `SKILL.md:67` |
| 금지 도구 | 원문에 명시 없음. 단 archived 노트 링크는 "inspect, verify, or repair" 금지 (`SKILL.md:12`) |
| 검색 형태 | `.method(` 과 `method(` 두 형태 모두 | `SKILL.md:31` |

### 6.5 컨텍스트·토큰 규율

- 파일 읽기 범위: 선독 문서 지정(`SKILL.md:12`), 후보별 필요 시에만 `historical-patterns.md`의 관련 섹션만 읽도록 유도: "Read the relevant section of [historical patterns]... when a candidate needs calibration" (`SKILL.md:20`).
- 서브에이전트 위임: 5개 도메인 분할, 각 에이전트에 bounded domain 부여 (`SKILL.md:16`).
- 요약·압축 지시: 서브에이전트 결과 압축 형식은 원문에 명시 없음. 보고 5항목만 지정 (`SKILL.md:67`).
- 토큰/컨텍스트 예산 수치: 원문에 명시 없음.
- 제외 지시: archived 노트의 outbound 링크는 따라가지 않음 → 불필요한 읽기 차단 (`SKILL.md:12`, `historical-patterns.md:3`).

### 6.6 모호어의 조작적 정의

| 모호어 | 원문 환산 | 출처 |
|---|---|---|
| "simplification" | "changes that remove maintained obligations: APIs, representations, lifecycle states, configuration paths, dependencies, tests, or documentation" | `SKILL.md:8` |
| "evidence-backed" | 후보별 기록 5항목(owner, producer/consumer path, 사라지는 것, 남는 것, 유지 이유) + consumer evidence + rejected alternatives | `SKILL.md:16, 35` |
| "dead / unreachable" | 도달성 증명 검색 대상 9개 범위에서 생산자 또는 소비자가 없음. 단 "Zero fixed callers is weaker evidence than unreachability." | `SKILL.md:33`, `historical-patterns.md:9` |
| "net reduction" | 제거되는 전체 시스템 vs 대체물(잔여 glue 포함) 비교. 환산 수치(줄 수 등)는 원문에 명시 없음 | `SKILL.md:27, 53` |
| "meaningful reduction" | 정의 없음. "no meaningful reduction"이면 기각이라는 문구만 존재 | `SKILL.md:41` |
| "substantial proposal" | 정의 없음 (작은 것은 TODO 주석, 큰 것은 노트라는 구분 외 기준 수치는 원문에 명시 없음) | `SKILL.md:41, 61` |
| "small local improvements" | 정의 없음. 처리 방식만 지정 | `SKILL.md:41` |
| "protected obligation" | 일부 열거: authorization, residency, durability, ownership (`SKILL.md:23`); durable, wire, compatibility, rejected-alternative (`SKILL.md:63`) | 위 |
| "independent observations" | "independently produced observations that can diverge" | `SKILL.md:49` |
| "exhaustive" | 정의 없음. 검증되지 않은 검색은 그렇게 부르지 말라는 금지만 존재 | `SKILL.md:67` |
| "substantial production machinery" | 정의 없음 | `SKILL.md:16` |

## 7. 산출물

### 7.1 최종 결과물의 형태

요청 종류에 따라 달라진다 (원문이 하나로 고정하지 않음).

1. **서베이 보고(리포트)**: surveyed areas, supported candidates, meaningful rejections or deferrals, notes added/consolidated/retained/removed, commands actually run (`SKILL.md:67`).
2. **제안 노트(파일)**: 필수 골격 5섹션 — `Problem`, `Proposal`, `Alternatives considered`, `Acceptance criteria`, `Risks` (`SKILL.md:61`). 구현된 결정은 `notes/README.md#the-body-skeleton`의 implemented format.
3. **인라인 TODO 주석(코드 diff)**: `TODO`/`FIXME`/`XXX` — `docs/development.md` urgency rules (`SKILL.md:41`).
4. **연동 문서·코드 diff**: README, JSDoc, model-visible catalogs, configuration, snapshots, generated files (`SKILL.md:59`).
5. **draft PR**: 서베이 확장 중 (`SKILL.md:67`).
6. **다른 브랜치 병합 결과**: 비중복 제안 포팅 + 겹치는 근거 통합 (`SKILL.md:65`).

### 7.2 출력 포맷 강제 템플릿

- 노트 골격: 위 5개 섹션 (`SKILL.md:61`). 각 섹션의 세부 서식은 `notes/README.md`에 위임, 원문(이 스킬)에 명시 없음.
- 후보 기록 5항목: 현재 owner / effective producer-consumer path / what disappears / what remains / strongest reason to retain (`SKILL.md:35`).
- 노트에 반드시 담을 내용: "concrete consumer evidence, the removed maintenance cost, the capability given up, and observable acceptance conditions." (`SKILL.md:61`)
- 최종 보고 5항목 (`SKILL.md:67`).

### 7.3 커밋 / PR / 브랜치 / 파괴적 동작

- 커밋 명령 지시: 원문에 명시 없음.
- PR: "Use a draft PR while the survey is expanding" (`SKILL.md:67`). 다른 PR 종료: "Closing another PR requires authorization or clear ownership of that housekeeping." (`SKILL.md:65`).
- 브랜치: 다른 브랜치의 diff를 target base와 비교 (`SKILL.md:65`). 브랜치 생성·전략 지시는 원문에 명시 없음.
- 파괴적 동작:
  - 노트 삭제: `dsh-archive-agent-notes`가 "retention, consolidation, triplet deletion, and frozen archive mechanics"를 소유 (`SKILL.md:63`). 이 스킬은 직접 수행하지 않고 위임.
  - 코드 삭제: 사용자 허가 범위 내에서만 ("distinguish a survey from permission to implement", `SKILL.md:8`; "implementation must remain within the user's authorization", `SKILL.md:24`).
  - force push, 마이그레이션: 원문에 명시 없음.
  - 신규 노트 보존: "Update an existing owner when the decision is the same" (`SKILL.md:61`).

## 8. 주의점 / 한계 (여기서만 평가)

### 8.1 오작동 / 과잉작동 시나리오

1. **서베이가 구현으로 번짐.** 사용자가 "단순화할 거 찾아줘"라고만 했는데 에이전트가 제안을 곧바로 삭제 diff로 옮기는 경우. 원문은 구분을 요구하지만(`SKILL.md:8`) 구분 판단을 에이전트의 해석에 맡긴다. 허가 확인 절차(질문 형식)는 원문에 없다.
2. **조사 깊이 요구 대비 종료 기준 부재.** "do not stop after the first promising deletion"(`SKILL.md:16`)과 "do not describe an unverified search as exhaustive"(`SKILL.md:67`)만 있고 종료 조건·후보 수·시간/토큰 상한이 없다. 대규모 모노레포에서 5개 도메인 서브에이전트를 돌리면 비용이 크고 끝을 정하는 기준이 모호하다.
3. **필수 선독 문서 부재 시 정지/우회 규정 없음.** `AGENTS.md`, `docs/*.md`가 없거나 이동했을 때의 행동은 원문에 명시 없음.
4. **깊게 얽힌 참조 구조.** 본문이 `notes/` 하위 날짜가 박힌 개별 노트 경로를 다수 인용한다(`historical-patterns.md` 전반). 노트가 archived로 이동하거나 이름이 바뀌면 참조가 끊기는데, 스킬은 "never inspect, verify, or repair their outbound links"(`SKILL.md:12`)로 수리를 금지하므로 끊긴 참조를 스스로 복구하는 경로가 막혀 있다. 또 본문 링크의 상대 경로(`../../../notes/archived/...`, `../../notes/README.md`)가 서로 다른 깊이를 가진다(`SKILL.md:12`의 `../../notes/README.md` vs `historical-patterns.md`의 `../../../notes/...`). 스킬 파일 위치에 따라 해석이 달라질 수 있으나, 실제 저장소 구조는 이 컬렉션 사본에 없어 원문만으로는 검증 불가.
5. **판단어 의존.** "meaningful reduction", "substantial proposal", "small local improvements", "substantial production machinery"에 임계값이 없어 에이전트마다 노트 vs TODO 주석 vs 기각 경계가 달라질 수 있다 (6.6 참조).

### 8.2 다른 스킬 / 기존 CLAUDE.md 규칙과 충돌 가능 지점

- 일반적인 "최소 diff / 요청 범위 밖 수정 금지" 규칙과는 대체로 정렬되지만, 반대로 "삭제 후보를 적극 탐색"하라는 이 스킬의 방향은 "테스트 우선 / 방어 코드 유지" 계열 지침과 긴장한다. 원문은 `docs/defensive-patterns.md`를 선독시켜 충돌을 사전에 완화하나, 그 문서 내용은 이 컬렉션에 없어 판정 불가.
- `dsh-prose-standard`, `dsh-archive-agent-notes`, `dsh-pre-push-checks` 3개 형제에 의존. 이 중 하나라도 비활성이면 노트 신규 작성의 supersession 검사(필수, `SKILL.md:63`)를 수행할 수 없다.
- 노트 작성을 "mandatory note skeleton"으로 강제하는 부분은 사용자가 "그냥 목록만 보여줘"라고 한 경우와 충돌 가능. 서베이 보고(리포트)와 노트 작성이 언제 분리되는지는 `SKILL.md:61`, `SKILL.md:67`에서 명확히 나뉘지 않는다.
- 사용자 CLAUDE.md가 "문서 파일 생성 금지"를 둔 환경이면 노트 작성이 충돌한다 (이 스킬은 노트 작성을 기본 산출물로 상정).

### 8.3 검증 공백

- 후보의 정당성은 정적 검색(`rg`)과 읽기에 기반한다. 동적 호출(리플렉션, 문자열 조합, 모델이 작성하는 플러그인 마운트)은 "generated catalogs... dynamic product API"(`SKILL.md:33`)로 언급되나, 동적 경로를 확인하는 구체적 방법(실행, 계측, 로그 분석)은 원문에 명시 없음.
- 삭제 후 테스트·빌드 통과를 후보 승인 전에 요구하는 문구가 없다. 검증 명령은 docs-only 작업 중심(`SKILL.md:67`)이며, 코드 제거 제안의 사전 검증 실행은 `dsh-pre-push-checks` 위임 한 줄뿐이다.
- 서브에이전트 보고의 신뢰성 확인(재검증, 샘플링) 단계 없음 — "require consumer evidence and rejected alternatives"(`SKILL.md:16`)만 있다.
- "commands actually run" 보고(`SKILL.md:67`)는 에이전트 자기 진술이며 독립 확인 수단은 원문에 명시 없음.
- 릴리스된 데이터 의무: `historical-patterns.md:3`은 "Verify current owners and released-data obligations before applying a pattern"이라 하지만 released-data 의무를 확인하는 구체 절차는 원문에 명시 없음.
- 의존성 교체 평가의 "net reduction" 수치 기준(줄 수, 전이 의존성 수 등)이 없어 순감소 판단이 서술에 의존.

### 8.4 유지보수 리스크

- 하드코딩된 경로: `packages/*/*/src`, `apps/`, `python/` (`SKILL.md:33`), `docs/architecture.md` 등 상대 경로 링크, 날짜가 박힌 노트 파일명 12개 이상(`historical-patterns.md`). 저장소 재구성 시 스킬이 함께 낡는다.
- 도메인 5분할 목록(`SKILL.md:16`)이 현재 패키지 구성에 고정. 구성 변경 시 갱신 필요.
- 명령 `pnpm run doc-sync` 등 스크립트 이름 의존 (`SKILL.md:67`).
- 과거 노트가 "archived"로 옮겨지면(스킬이 인용하는 다수가 이미 archived), 스킬이 인용하는 노트가 "current authority가 아님"이라고 스스로 선언(`SKILL.md:12`)하는 구조라, 참조의 수명이 짧다.
- 모델명·외부 도구 버전 하드코딩: 없음. 엔진 하한(Node 버전)은 이름만 언급하고 버전 숫자는 원문에 명시 없음.
- `historical-patterns.md` 자체 경고: "They describe recorded decisions, not current removal opportunities." 예시가 현재 삭제 목록으로 오독될 위험이 있어 스킬이 반복 경고한다 (`SKILL.md:20`, `historical-patterns.md:3`).

### 8.5 한 줄 판정

**조건부 도입 권장** — DeepSeek Harness 저장소 안에서 증거 기반 단순화 감사를 할 때는 "Prefer a few well-supported candidates over a count of deletions."(`SKILL.md:8`)와 소비자 증거·기각 대안·잃는 기능 명시 요구가 강력한 가드레일이지만, 저장소 내부 문서·형제 스킬 3개·노트 체계에 강하게 결합되어 있고 종료 기준과 임계값이 없어 해당 환경 밖에서는 쓸 수 없다.
