# write-swift 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/write-swift/`
- **핵심 파일**: `SKILL.md` (42,185 bytes) — **이 컬렉션에서 가장 큰 단일 파일**
- **보조 파일**: 없음
- **성격**: **언어 레퍼런스 스킬**. 디자인/애니메이션 스킬이 아니라 **현대 Swift(6.3, 6.4 예고 포함) 작성·리뷰·마이그레이션 가이드**. 16개 섹션 + Quick Reference 표(25행).

원문 자기 규정: "How to write Swift the way the language wants to be written, current through Swift 6.4."

**이 컬렉션 내에서 가장 이질적인 스킬**이다. 다른 11개는 웹/RN UI 모션·디자인이고, 이것만 Swift 언어 전반(concurrency, ARC, generics, testing, macros, 성능, unsafe/interop)을 다룬다.

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "How to write modern Swift well — modeling with value types, Swift 6 data-race safety and approachable concurrency (@concurrent, main-actor-by-default, actors, task groups), protocols and generics (some vs any), API design, performance and ARC, Swift Testing, macros, and the modern language features agents don't know about yet. Use when writing, reviewing, or migrating Swift, or when a concurrency error, a hang, a data race, a retain cycle, or a performance problem needs fixing."

**매칭되는 사용자 발화**
- "Swift로 이거 작성해줘", "이 Swift 코드 리뷰해줘"
- "Swift 6로 마이그레이션해줘"
- **증상 기반 트리거**: "concurrency 에러", "앱이 hang 걸림", "data race", "retain cycle", "성능 문제"

**주목할 문구**: "**the modern language features agents don't know about yet**" — 스킬의 존재 이유를 모델의 지식 컷오프 보완으로 명시한다. 즉 이 스킬은 미학 지침이 아니라 **최신성 주입 장치**다.

`allowed-tools` / `metadata`: **원문에 명시 없음**.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- Swift 6.2 이후의 concurrency 모델을 정확히 써야 할 때 — 원문이 "This is the section agents get wrong most often, **because the model changed in Swift 6.2**"라고 지목
- data race 에러, hang, retain cycle 진단 — 각각 우선순위 목록이 제공됨
- Swift 6 language mode 마이그레이션 — §16이 순서와 실패 방식까지 규정
- 구버전 문법을 최신 문법으로 교체 — §15의 17행 대응표
- 성능 문제 — §9가 4가지 비용 유형 + 프로파일러 판독법 제공
- 새 테스트 작성 — Swift Testing 기준

**부적합 / 과한 상황**
- Swift 6.1 이하 프로젝트 — 원문 경고: "if the project is on 6.1 or earlier, §3's rules about `async` and `@concurrent` **do not apply**."
- Swift 6.4 미출시 기능 — ⚠ 표시된 항목은 "safe to plan around and **unsafe to write today**"
- SwiftUI 뷰 디자인·레이아웃·애니메이션 — 이 문서에 SwiftUI는 §6(concurrency 관점)만 있음. 시각적 디자인 지침은 **원문에 없음**
- 웹/RN 작업 — 무관

**형제 스킬 대신 이걸 고르는 기준**: 언어가 Swift인가. 이 컬렉션에 Swift 관련 다른 스킬은 없으므로 경쟁 없음. 단 `apple-design`이 Apple의 디자인 원칙을 다루므로, **Apple 플랫폼 앱을 만들 때 `write-swift`(언어) + `apple-design`(디자인·모션)의 조합**이 자연스럽다 — 다만 이 연결은 원문에 명시되지 않음.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 툴체인 버전에 따른 분기가 폴백처럼 작동 — 6.4 기능은 "prefer the older form if it targets 6.3 or earlier".
- **필요한 CLI/런타임/패키지**
  - **Swift 툴체인 6.3** (기준선). "current release as of August 2026"
  - **Xcode 26** — main-actor-by-default가 신규 앱 프로젝트 기본값
  - **Instruments** — Time Profiler, Allocations, hangs, Swift Concurrency template. 프로파일링이 여러 규칙의 전제 조건
  - **LLDB** — `swift task info`
  - **Address Sanitizer** — unsafe 코드 사용 시
  - **Console / `log collect --device --start ...`** — 로그 수집
  - 빌드 설정: **Approachable Concurrency**, **Default Actor Isolation = MainActor**, **Optimize Object Lifetimes**, whole-module optimization, strict memory safety
  - 패키지: **Subprocess**(1.0은 6.4와 함께), **Swift Binary Parsing**, `Synchronization` 모듈(`Mutex`/`Atomic`), `os`(`Logger`), Swift Testing, swift-syntax(매크로 `assertMacroExpansion`)
  - SwiftPM 설정: `swiftSettings: [.defaultIsolation(MainActor.self)]`
- **네트워크**: 불필요. 참조 링크 — swift.org/migration.
- **비용 발생 지점**: 없음.

## 5. 워크플로우

이 스킬은 **단일 시퀀스가 아니다.** 16개 주제 섹션이며, 절차형인 부분은 (a) 전역 기본값 계층, (b) concurrency 진행 4단계, (c) data race 해결 4단계, (d) 프로토콜 도입 워크플로우, (e) 마이그레이션 6단계다.

### 관통 원칙 (모든 규칙의 상위)
"**Swift is a progressive-disclosure language. Start with the simplest, most static, most single-threaded thing that works, and buy dynamism — concurrency, reference semantics, existentials, unsafe pointers — only where you can point at the reason.** Every rule below is an application of that."

### 전역 기본값 계층 표 — "Move down a level only with a reason you can state"

| Need | Reach for | Move down only when |
| --- | --- | --- |
| Data | `struct` / `enum` | you need identity, sharing, or inheritance |
| Abstraction | concrete type | you have repeated code across types |
| Polymorphism | `some P` (generic) | you need heterogeneous storage → `any P` |
| Execution | main actor, synchronous | profiling shows a hang → `async` → `@concurrent` → `actor` |
| Memory | `Array`, `String` | profiling shows the cost → `InlineArray`, `Span` |
| Safety | safe API | C interop or a measured hot path → `Unsafe*` |

### §3 Concurrency 진행 4단계 — **순서 강제 게이트**
"**The progression, in order. Do not skip steps.**"
1. "**Single-threaded on the main actor.** No concurrency at all. Fine for most apps."
2. "**`async`/`await`** to hide latency (network, disk). Still no concurrency of your own"
3. "**`@concurrent`** to move _your_ expensive work off the main thread — **only after Instruments shows a hang.**"
4. "**`actor`** to move _state_ off the main actor — only when too much main-actor state is forcing tasks to hop back constantly."

**선행 조건**: "**Turn on the right build settings first.** Enable **Approachable Concurrency** in every project. For app modules and UI-facing modules, also set **Default Actor Isolation** to **MainActor**"
**분기**: "**Do not set main-actor-by-default for a general-purpose library** — libraries should ship `nonisolated` APIs and let clients decide where work runs."

### §4 Data race 해결 4단계 — **우선순위 목록**
"When you hit a data-race error, work down this list:"
1. "**Don't share it.** Move the shared object into a local so each concurrent job gets its own instance. (**This is the fix for the overwhelming majority of real errors.**)"
2. "**Make it a `Sendable` value type**, so \"sharing\" is really copying."
3. "**Isolate it to an actor** — the main actor, or your own."
4. "Only then reach for `Mutex`/`Atomic` from the `Synchronization` module (store them in `let` properties), or `@unchecked Sendable`."

전역 변수 전용 순서: "make it a `let`; put it on `@MainActor`; wrap it in a `Mutex`; `nonisolated(unsafe)`."

### §7 프로토콜 도입 워크플로우
"Don't start with a class. **Don't start with a protocol either.**"
"The workflow: **write concrete types → notice repeated code across them → factor the shared capability into a protocol → write generic code against it.** Overloads with near-identical bodies are the signal that it's time to generalize."

### §9 성능 워크플로우 — 순서 강제
1. "**But do the algorithmic work first.**" — 복잡도 확인, 루프를 알고리즘 호출로 대체
2. "**Then profile.**" — Instruments를 **테스트에 대해** 실행 ("secondary-click the test's run button → Profile")
3. 프로파일 판독: "`platform_memmove` dominating a flame graph means accidental copying; a million transient allocations means intermediate arrays; `swift_beginAccess` means runtime exclusivity checks; `swift_retain`/`swift_release` means reference-counting traffic."
4. 그 다음에야 concrete levers 적용

### §16 마이그레이션 6단계 — **순서 강제, 혼합 금지**
"**The order matters, and mixing steps is how migrations stall.**"
1. "Build with the new compiler first." (Swift 5 mode)
2. "Per target, enable complete concurrency checking ... **Start with the UI/app layer, not the frameworks below it**"
3. "Fix the warnings, **cheapest first.**"
4. "Flip the target to the Swift 6 language mode to lock the work in."
5. "Move to the next target and repeat."
6. "**Refactor afterwards, separately. Never combine a significant refactor with enabling data-race safety — you'll have to back out both.**"

**사용자 확인 요구 지점**: 없음. 다만 여러 규칙이 **프로파일링 증거를 전제**하므로 실질적으로 측정 결과 없이는 진행할 수 없는 게이트가 존재.

## 6. 디자인 지침 분석

**이 스킬은 시각 디자인 지침을 담지 않는다.** 타이포그래피·컬러·스페이싱·모션·레이아웃 지침은 전부 **원문에 없음**. 대신 "코드 미학"을 강제하는 방식이 다른 스킬들과 구조적으로 유사하므로, 그 관점에서 분석한다.

### 금지 규칙 (anti-pattern) — 원문 그대로

**§1 값 타입**
- "Use `class` only for identity, shared mutable state, inheritance, or resource lifetime."
- "**A struct with a mutable reference-type property is neither a value nor a reference.** Copies share the object; mutations leak across copies."

**§2 에러**
- "**Recoverable → `throw`. Programmer mistake → `precondition`/`fatalError`.**"
- "**Force-unwrap only where you can state the invariant**, and prefer a failing `#require`/`precondition` with a message over a bare `!`."

**§3 Concurrency**
- "**In Swift 6.2, marking a function `async` does _not_ move it off the current actor.**"
- "**Don't spawn a task for trivial work.** A child task to read a `UserDefaults` value costs more than it saves."
- "**`await` is a suspension point, and it breaks atomicity.** ... **Never hold a lock across one. Never rely on thread-local storage across one.**"
- "**Actors are not FIFO.**"
- "Actors guarantee mutual exclusion, **not transactions**."

**§4 Sendable**
- "**Public types never get inferred sendability**"
- "**Most model classes should be neither `@MainActor` nor `Sendable`.**"
- "**`@unchecked Sendable` is a promise the compiler can't check.** ... last resort, **not a warning silencer**."

**§5 구조적 동시성**
- "**`Task.detached` almost never.** It inherits nothing"
- "**Cancellation is cooperative.** Cancelling sets a flag; **it stops nothing.**"
- "**Bound your concurrency.** Don't fan out one child per item over an unbounded list."
- 연속(continuation) 계약: "**resume exactly once on every path** — never resuming hangs the caller forever; resuming twice is a fatal error."

**§6 SwiftUI**
- "**don't send `self` — copy the one value you need into the closure's capture list.**"
- "**SwiftUI's action callbacks are synchronous on purpose.**"

**§7 프로토콜·제네릭**
- "**A protocol with no per-type customization is a wasted protocol.**"
- "Elaborate protocol hierarchies (\"**type zoology**\") cost compile time and binary size and **buy nothing**."
- "**Prefer has-a to is-a.**"
- "**Composition over inheritance.** Class inheritance is monolithic ... intrusive ... and leaves unwritten contracts"
- "**A forced downcast is a code smell**"
- "**You cannot call a method that takes an associated type on an `any P`.**"

**§8 API 설계**
- "**No type prefixes in Swift-only APIs.**"
- "**Drop leading `get`** ... `persistentPosts`, not `getPersistentPosts`."
- "**Design the model so illegal states can't be spelled.**"

**§9 성능**
- "**Chained `map`/`flatMap`/`filter` allocate an array per stage. Elegant ≠ fast.**"
- "`Array.remove(at:)` is O(n); calling it in a loop is O(n²)." / "Building a `Data` by re-slicing per byte is O(n²)" — "Both of these were **100×+ regressions hiding behind clean-looking code.**"
- "another reason **not to make something `async` that has nothing to await**"

**§10 ARC**
- "**An object's guaranteed lifetime ends at its last use, not at the closing brace.** ... **Code that depends on when a `deinit` runs is a latent bug.**"
- "**`weak`/`unowned` are for breaking reference cycles — nothing else.**"
- "Optional binding there is _worse_ than force-unwrap: **it turns a loud crash into a silent wrong answer.**"
- "`withExtendedLifetime` works but shifts correctness onto you ... **treat it as a patch, not a design.**"
- "**Keep `deinit` side effects local.**"

**§11 테스트**
- "**never comment a test out** — a disabled test still compiles"
- "**Parameterize instead of copy-pasting or looping.**"
- "**Refactor rather than reaching for `.serialized`.**"
- 프레임워크 상호운용: "set the mode to **complete** or **strict** (**not limited, and never none**)"

**§12 매크로**
- "**Never let a macro silently generate code that won't compile.**"

**§13 로깅**
- "**`Logger` from `os`, not `print`.**"
- "**Non-numeric interpolations are redacted by default.** Opt in per value with `privacy: .public` **only for data that is genuinely not personal.**"

**§14 Unsafe**
- "**\"Unsafe\" means the API cannot fully validate its input, so violating its preconditions is undefined behavior** — not that it crashes."
- "**never let a pointer escape the closure that vends it**"
- "**Adopt Swift one file at a time; don't rewrite.**"

**§16 마이그레이션**
- "**Never combine a significant refactor with enabling data-race safety**"

### 강제 규칙 — 수치·버전 인용

미적 수치 대신 **버전·복잡도·크기**가 규칙의 수치 역할을 한다.

**버전 기준선**
- 툴체인 기준: **Swift 6.3** ("current release as of August 2026")
- Concurrency 모델: **Swift 6.2** 기준. "if the project is on 6.1 or earlier, §3's rules ... do not apply."
- ⚠ 표시 = **Swift 6.4 미출시**
- 기능별 도입 버전 (§15 표): 5.7(Swift Regex), 5.9(if/switch expressions, parameter packs, `@Observable`), 6.0(raw identifiers), 6.2(`Observations`, 개념 notification types, Subprocess, `InlineArray`, `.span`, Swift Binary Parsing), 6.3(module selector `Rocket::SaturnV`, `@c`, `@inline(always)`, `@specialized`), 6.4 ⚠(cancellation shield SE-0504, `mapKeyedValues`, `@available(anyAppleOS)`, `@diagnose`, `weak let`/`~Sendable`, `borrow`/`mutate` accessors, `UniqueArray`/`UniqueBox`, `Ref`/`MutableRef`, `Continuation` 타입)
- Swift 6.1+: "`nonisolated` on a type makes all its members nonisolated"

**복잡도 수치**
- `Array.remove(at:)` = O(n), 루프 내 사용 = **O(n²)**
- `removeAll(where:)` = **O(n) total**
- `Data` 바이트별 재슬라이스 = **O(n²)**, `popFirst()` = **O(1)**
- 회귀 규모: "**100×+ regressions**"

**메모리 레이아웃 수치**
- "An `any P` existential has a **3-word inline buffer**." — 넘으면 복사마다 힙 할당
- "a large struct with three reference-typed fields costs **three retains _per copy_**, versus one for a class"
- 할당 비용 서열: "global (free), stack (cheap: **one subtraction**), heap (expensive: search plus locking)"

**로그 레벨 서열**: `debug`(never persisted, fastest) → `info` → `notice`(default) → `error` → `fault`(most persistent, slowest)

**성능 4대 비용**: 1) Function calls 2) Memory layout 3) Allocation 4) Copies

**Exit tests 플랫폼 제약**: "macOS, Linux, FreeBSD, Windows only."

### 항목별 지침

- **타이포그래피 / 컬러 / 스페이싱 / 모션 / 레이아웃**: **원문에 지침 없음.** (언어 스킬)
- **명명 규칙 (§8)** — 이것이 이 스킬의 "타이포그래피"에 해당하는 층위:
  - "Clarity at the point of use is the goal that **outranks every other one here**."
  - 접두어 금지, `get` 제거, "avoid very general names from specific frameworks — they read badly out of context"
  - "**Access control is documentation.**"
- **API 표면 설계**: property wrappers("factor out an _access policy_ ... so the declaration site states the policy in one word"), result builders, macros
- **접근성 / 프라이버시**: `Logger`의 기본 리댁션 + `.private(mask: .hash)`. 이 스킬에서 "접근성"에 가장 가까운 항목은 프라이버시 기본값.
- **테스트 가능성**: §6의 "Put a piece of state on the seam between UI and async work. ... makes the async logic **testable without importing SwiftUI**."

### 지침을 주는 방식 자체

1. **단일 관통 원칙에서 연역**: progressive disclosure. "**Every rule below is an application of that.**" — `animate-expo`의 "everything in this skill follows from them"과 동일한 구조.
2. **기본값 계층 표 + "move down only when"**: 규칙을 금지 목록이 아니라 **기본값과 이탈 조건의 쌍**으로 제시. 이 컬렉션의 "cheapest tool that works" 패턴과 동형.
3. **순서 강제 + 건너뛰기 금지**: "The progression, in order. Do not skip steps." / "The order matters, and mixing steps is how migrations stall." — `animate`의 "Run the sequence in order"와 동일한 장치.
4. **우선순위 목록(remedial hierarchy)**: data race 해결 4단, 전역 변수 4단, 참조 순환 4단(don't build the cycle → redesign the API → `withExtendedLifetime` → `weak`). `review-animations`의 9단 처방 계층과 동일한 방법론.
5. **증거 요구 (프로파일링 게이트)**: "only after Instruments shows a hang", "profiling shows the cost", "a measured hot path", "**Deciding to optimize → Instruments on a profiled test, not intuition**". 감각 판단을 계측으로 대체.
6. **모델의 오류를 지목**: "This is the section agents get wrong most often" / "**Agents routinely write the older, longer form of all of these.**" / "the modern language features agents don't know about yet". 즉 **독자를 에이전트로 명시**하고 그 알려진 실패를 겨냥.
7. **버전 안전장치**: ⚠ 마킹 + "safe to plan around and unsafe to write today — check the project's toolchain before using one".
8. **Instead of → Write → Since 3열 표 (§15, 17행)**: 구문 교체를 대응표로. `review-animations`의 `| Before | After | Why |`와 같은 형식.
9. **Quick Reference 표 (25행) — Need / Reach for / Not**: 문서 전체의 치트시트. **"Not" 열이 안티패턴을 병기**하는 것이 특징.
10. **진단 신호 판독법**: 프로파일러 심볼 → 원인 매핑(`platform_memmove`, `swift_beginAccess`, `swift_retain`/`swift_release`). 증상 기반 역인덱스는 `ask-sonner`의 Troubleshooting 표와 같은 방법.
11. **코드 예시로 규칙 시연**: `Material`(COW), `PhotoProcessor`(`nonisolated` + `@concurrent` + `async let`), `.visualEffect { [pulse] ... }`(캡처 리스트).
12. **실물 참조 없음**: Linear/Apple 같은 미적 참조 대신 **표준 라이브러리 구현**을 참조로 사용 — "This is exactly how `Array`, `String`, and `Dictionary` work."
13. **페르소나 부여 없음**: `animate` 계열의 "You are a senior design engineer" 같은 문장이 없다. 문서 전체가 3인칭 규범.

### 모호한 감각어의 번역

이 스킬에는 미적 감각어가 거의 없다. 대신 **"좋은 코드"류의 모호어를 검증 가능한 조건으로 환원**한다.

| 모호어 (원문) | 구체적 조작 |
| --- | --- |
| "the way the language wants to be written" | progressive disclosure — 6행 기본값 계층 표 |
| "**a reason you can state**" | 각 계층의 "Move down only when" 조건. 즉 이탈에 서술 가능한 근거 요구 |
| "**the most natural code to write**" (data-race free by default) | Swift 6.2에서 `async`가 actor를 옮기지 않는다는 사실 |
| "**Elegant ≠ fast**" | 체인된 `map`/`filter`가 단계마다 배열을 할당 |
| "**clean-looking code**"에 숨은 회귀 | `remove(at:)` 루프 = O(n²), 100×+ 회귀 |
| "**a code smell**" | forced downcast — "usually means a type relationship was lost" |
| "**type zoology**" | 정교한 프로토콜 계층 — "cost compile time and binary size and buy nothing" |
| "**a wasted protocol**" | 모든 conformance가 같은 default implementation을 쓰는 경우 |
| "**neither a value nor a reference**" | mutable reference-type 프로퍼티를 가진 struct |
| "**worse than force-unwrap**" | weak 참조의 optional binding — "turns a loud crash into a silent wrong answer" |
| "**a latent bug**" | `deinit` 실행 시점에 의존하는 코드 |
| "**a promise the compiler can't check**" | `@unchecked Sendable` |
| "**a patch, not a design**" | `withExtendedLifetime` |
| "**last resort, not a warning silencer**" | `nonisolated(unsafe)` |
| "**Clarity at the point of use**" | 접두어 없음, `get` 없음, 접근제어 명시, 불법 상태 표현 불가 |
| "**intuition**" (최적화 판단) | **금지** — "Instruments on a profiled test" |

## 7. 산출물

- **형식**: Swift 코드, 리뷰 의견, 마이그레이션 절차. 출력 규격 섹션(`animate`의 "Output" 같은 것)은 **원문에 없음.**
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- 톤 규정: **원문에 없음.**

## 8. 주의점 / 한계

- **버전 종속성이 극단적으로 높다**: 문서 전체가 특정 툴체인 시점("Swift 6.3, current release as of August 2026")에 고정되어 있다. 이 컬렉션에서 가장 빠르게 낡는 스킬이며, 원문 스스로 이를 인정하고 ⚠ 마킹으로 관리한다. 다만 6.5 이후에는 ⚠ 표시 자체가 부정확해진다 — 갱신 절차는 **원문에 명시 없음.**
- **하위 버전에서의 위험**: "if the project is on 6.1 or earlier, §3's rules about `async` and `@concurrent` do not apply." → 프로젝트 버전 확인이 선행되어야 하는데, 그 확인을 강제하는 절차는 없다. 잘못 적용하면 concurrency 조언이 정반대가 된다.
- **미출시 기능(⚠) 사용 위험**: `@diagnose`, `weak let`, `~Sendable`, `borrow`/`mutate`, `UniqueArray`, `Continuation`, cancellation shield, `mapKeyedValues`, `@available(anyAppleOS)` — 9개 항목이 컴파일되지 않을 수 있다. 원문이 경고하지만 실수 여지가 큼.
- **컬렉션 내 이질성**: 나머지 11개 스킬과 주제·도구·기준이 전혀 겹치지 않는다. "emilkowalski" 컬렉션을 디자인 컬렉션으로 평가할 때 이 스킬은 별개 항목으로 취급해야 한다. `apple-design`과의 연계(Apple 플랫폼 앱)가 자연스럽지만 **두 스킬 간 상호 참조가 원문에 전혀 없다.**
- **SwiftUI 커버리지의 편중**: §6이 SwiftUI를 다루지만 concurrency 관점만이다. 뷰 구성, 레이아웃, 모션(`withAnimation`은 한 번 언급), 접근성, 디자인 시스템은 **원문에 없음**. Apple 플랫폼 UI를 만들려면 이 스킬만으로는 부족하고 `apple-design`이 웹 CSS로 번역되어 있어 그대로 쓸 수 없다 — 컬렉션의 구조적 공백.
- **프로파일링 전제의 실용 부담**: `@concurrent`, `InlineArray`, `Span`, `@inline(always)`, `Unsafe*` 등 다수 규칙이 "profiling shows"를 전제한다. Instruments 접근이 없는 환경(CI, 서버사이드 Swift, 리눅스)에서는 이 게이트를 만족할 수 없으며, 그 경우의 대안은 **원문에 명시 없음.**
- **분량**: 42KB 단일 파일. 특정 주제(예: 테스트만) 필요할 때도 전체 로드. references/ 분할이 없다 — 같은 컬렉션의 `improve-animations`나 `review-animations`가 2층 구조를 쓰는 것과 대비된다.
- **강한 경고 지점**:
  - "**The progression, in order. Do not skip steps.**"
  - "**Do not set main-actor-by-default for a general-purpose library**"
  - "**Never hold a lock across [an `await`].**"
  - "`Task.detached` almost never."
  - "**resume exactly once on every path**"
  - "**`weak`/`unowned` are for breaking reference cycles — nothing else.**"
  - "**Never let a macro silently generate code that won't compile.**"
  - "**Never combine a significant refactor with enabling data-race safety**"
  - "**never comment a test out**"
  - "**never hand-roll date or number parsing inside a regex**"
- **검증 장치**: 프로파일링 게이트(Instruments), Address Sanitizer, strict memory safety, `assertMacroExpansion`, exit tests, 프레임워크 상호운용 모드(complete/strict) — 이 컬렉션에서 유일하게 **컴파일러·계측 도구에 검증을 위임**하는 스킬. 다른 스킬들의 검증은 전부 육안·모델 판독에 의존하는데, 이 스킬은 타입 시스템과 프로파일러가 검증한다.
