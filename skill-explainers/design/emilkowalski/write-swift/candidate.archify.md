# write-swift 스킬은 에이전트를 어떻게 바꾸나 {#write-swift-skill}

`write-swift`를 쓰면 에이전트는 Swift 코드를 쓸 때 가장 단순한 선택에서 출발하고, 더 복잡한 도구는 이유를 댈 수 있을 때만 꺼낸다. `struct`부터 쓰고, main actor에서 동기 코드로 시작하고, `some P`를 먼저 쓴다. 동시성·참조 타입·existential·unsafe pointer는 측정이나 구체적인 필요가 있을 때만 들인다.[](source:ws-thru)[](source:ws-ladder)

- 켜지는 때: Swift를 쓰거나 리뷰하거나 이전할 때, 그리고 동시성 오류·hang·data race·retain cycle·성능 문제를 고칠 때다. 호출 제한 필드는 없다.[](source:ws-fm)
- 버전 기준: 툴체인 기준은 Swift 6.3이다. ⚠ 표시는 아직 나오지 않은 Swift 6.4 기능이고, 동시성 규칙은 Swift 6.2 모델을 전제로 한다.[](source:ws-base)
- 강제하는 것: 동시성은 정해진 네 단계를 건너뛰지 않고, data race는 공유를 끊는 것부터 고친다. 새 테스트는 Swift Testing으로 쓴다.[](source:ws-prog)[](source:ws-race)[](source:ws-test-a)
- 쓰면 안 되는 때: 프로젝트가 Swift 6.1 이하면 `async`·`@concurrent` 규칙이 맞지 않는다. 6.3 이하를 쓰는 프로젝트에 ⚠ 문법을 쓰면 안 된다.[](source:ws-base)[](source:ws-modern-note)

@answer scope="design/emilkowalski/write-swift · 원본 텍스트 1개 42,445B · 커밋 4e3fc89 · 원칙형 스킬이라 규칙표와 원문의 전후 쌍으로 정리 · 코드 예시는 컴파일하지 않음 · 지시상 동작"
@meta locale=ko
@source ws-fm title="design/emilkowalski/write-swift/SKILL.md · 42445B · 지시 본문과 frontmatter" path=design/emilkowalski/write-swift/SKILL.md lines=1:4
@source ws-init title="SKILL.md · 처음 호출될 때의 응답" path=design/emilkowalski/write-swift/SKILL.md lines=8:14
@source ws-base title="SKILL.md · 툴체인 기준 Swift 6.3과 ⚠ 표시" path=design/emilkowalski/write-swift/SKILL.md lines=16:18
@source ws-thru title="SKILL.md · 관통 원칙(progressive disclosure)" path=design/emilkowalski/write-swift/SKILL.md lines=20:20
@source ws-ladder title="SKILL.md · 기본값 사다리 표" path=design/emilkowalski/write-swift/SKILL.md lines=22:31
@source ws-value title="SKILL.md · §1 값 타입으로 모델링" path=design/emilkowalski/write-swift/SKILL.md lines=35:44
@source ws-cow title="SKILL.md · §1 copy-on-write 예시 코드" path=design/emilkowalski/write-swift/SKILL.md lines=46:59
@source ws-noncopy title="SKILL.md · §1 noncopyable 타입" path=design/emilkowalski/write-swift/SKILL.md lines=61:61
@source ws-err title="SKILL.md · §2 오류와 optional" path=design/emilkowalski/write-swift/SKILL.md lines=65:73
@source ws-prog title="SKILL.md · §3 동시성 네 단계" path=design/emilkowalski/write-swift/SKILL.md lines=77:88
@source ws-build title="SKILL.md · §3 빌드 설정" path=design/emilkowalski/write-swift/SKILL.md lines=90:90
@source ws-rule title="SKILL.md · §3 Swift 6.2에서 바뀐 규칙" path=design/emilkowalski/write-swift/SKILL.md lines=92:98
@source ws-photo title="SKILL.md · §3 PhotoProcessor 예시 코드" path=design/emilkowalski/write-swift/SKILL.md lines=100:109
@source ws-cost title="SKILL.md · §3 offload 전 측정과 await" path=design/emilkowalski/write-swift/SKILL.md lines=111:114
@source ws-actor title="SKILL.md · §3 actor 재진입" path=design/emilkowalski/write-swift/SKILL.md lines=116:123
@source ws-send title="SKILL.md · §4 Sendable" path=design/emilkowalski/write-swift/SKILL.md lines=127:136
@source ws-race title="SKILL.md · §4 data race 오류를 고치는 순서와 전역 변수" path=design/emilkowalski/write-swift/SKILL.md lines=138:145
@source ws-bridge title="SKILL.md · §4 옛 callback API 연결" path=design/emilkowalski/write-swift/SKILL.md lines=147:147
@source ws-struct title="SKILL.md · §5 structured task 종류" path=design/emilkowalski/write-swift/SKILL.md lines=151:160
@source ws-cancel title="SKILL.md · §5 취소, 동시성 상한, task-local" path=design/emilkowalski/write-swift/SKILL.md lines=162:166
@source ws-cont title="SKILL.md · §5 continuation과 AsyncSequence" path=design/emilkowalski/write-swift/SKILL.md lines=168:170
@source ws-swiftui title="SKILL.md · §6 SwiftUI 격리" path=design/emilkowalski/write-swift/SKILL.md lines=174:177
@source ws-vfx title="SKILL.md · §6 visualEffect 예시 코드" path=design/emilkowalski/write-swift/SKILL.md lines=179:183
@source ws-swiftui2 title="SKILL.md · §6 동기 action callback" path=design/emilkowalski/write-swift/SKILL.md lines=185:186
@source ws-proto title="SKILL.md · §7 protocol과 generic 작업 순서" path=design/emilkowalski/write-swift/SKILL.md lines=190:200
@source ws-some title="SKILL.md · §7 some과 any" path=design/emilkowalski/write-swift/SKILL.md lines=202:209
@source ws-api title="SKILL.md · §8 API 설계" path=design/emilkowalski/write-swift/SKILL.md lines=213:222
@source ws-perf title="SKILL.md · §9 성능 비용 네 가지" path=design/emilkowalski/write-swift/SKILL.md lines=226:233
@source ws-algo title="SKILL.md · §9 알고리즘 먼저, 그다음 측정" path=design/emilkowalski/write-swift/SKILL.md lines=235:239
@source ws-levers title="SKILL.md · §9 구체 수단" path=design/emilkowalski/write-swift/SKILL.md lines=241:250
@source ws-6364 title="SKILL.md · §9 6.3 출시 기능과 6.4 예정 기능" path=design/emilkowalski/write-swift/SKILL.md lines=251:252
@source ws-hop title="SKILL.md · §9 async 비용과 main actor 왕복" path=design/emilkowalski/write-swift/SKILL.md lines=254:256
@source ws-arc title="SKILL.md · §10 ARC와 객체 수명" path=design/emilkowalski/write-swift/SKILL.md lines=260:267
@source ws-test-a title="SKILL.md · §11 Swift Testing 기본" path=design/emilkowalski/write-swift/SKILL.md lines=271:278
@source ws-test-b title="SKILL.md · §11 parameterize, trait, 병렬, 이전" path=design/emilkowalski/write-swift/SKILL.md lines=279:285
@source ws-macro title="SKILL.md · §12 macro" path=design/emilkowalski/write-swift/SKILL.md lines=289:297
@source ws-log title="SKILL.md · §13 로깅과 디버깅" path=design/emilkowalski/write-swift/SKILL.md lines=301:308
@source ws-unsafe title="SKILL.md · §14 unsafe 코드와 interop" path=design/emilkowalski/write-swift/SKILL.md lines=312:318
@source ws-modern-note title="SKILL.md · §15 ⚠ 표시 설명" path=design/emilkowalski/write-swift/SKILL.md lines=322:326
@source ws-modern title="SKILL.md · §15 최신 문법 표" path=design/emilkowalski/write-swift/SKILL.md lines=328:346
@source ws-regex title="SKILL.md · §15 Regex 보충" path=design/emilkowalski/write-swift/SKILL.md lines=348:348
@source ws-mig title="SKILL.md · §16 Swift 6 이전 순서" path=design/emilkowalski/write-swift/SKILL.md lines=352:363
@source ws-qr title="SKILL.md · Quick Reference 표" path=design/emilkowalski/write-swift/SKILL.md lines=367:395

## 언제 켜지고, 어디서 멈추고, 언제 쓰면 안 되나 {#trigger}

@code source=ws-fm language=yaml

호출 제한 필드가 없어서 모델이 `description`을 보고 스스로 켤 수 있다.[](source:ws-fm) 판정: `description`은 판단을 돕는 설명이다. 특정 단어가 들어 있다고 켜지는 목록은 아니다.

사람이 개입하는 지점은 처음 호출될 때 한 곳뿐이다. 구체적인 질문 없이 스킬이 켜지면, 에이전트는 정해진 한 문장만 답하고 사용자가 질문할 때까지 다른 정보를 주지 않는다.[](source:ws-init)

```text title="처음 호출될 때 답하는 문장(원문)"
I'm ready to help you write modern Swift, the way the language wants to be written.
```

그 밖에 승인이나 종료 조건을 따로 두지 않는다. 대신 규칙마다 "이 조건이 확인될 때만 다음 단계로 간다"는 문턱이 있다. 예를 들어 `@concurrent`는 Instruments가 hang을 보여 준 뒤에만 쓴다.[](source:ws-prog)

| 상황 | 원문이 정한 것 | 강도 |
| --- | --- | --- |
| 프로젝트가 Swift 6.1 이하 | §3의 `async`·`@concurrent` 규칙이 적용되지 않는다[](source:ws-base) | {caution:적용 제외} |
| 프로젝트가 6.3 이하를 대상으로 함 | ⚠ 문법 대신 예전 형태를 쓴다. 쓰기 전에 툴체인을 확인한다[](source:ws-modern-note) | {bad:쓰지 않음} |
| 범용 라이브러리 | main actor 기본 격리를 켜지 않는다. `nonisolated` API를 내보내고 실행 위치는 호출자가 정하게 한다[](source:ws-build) | {bad:금지} |
| Exit test를 쓰려는 플랫폼 | macOS, Linux, FreeBSD, Windows에서만 된다[](source:ws-test-b) | 제약 |
| UI 자동화, 성능 지표, Objective-C 테스트 | XCTest가 아직 필요하다(`XCUIApplication`, `XCTMetric`, Objective-C 예외)[](source:ws-test-a) | 예외 |

원문이 이 스킬을 쓰지 말라고 하는 작업 유형은 `원문에 명시 없음`이다. 다른 스킬로 넘기라는 문장도 없다.

@facts
| 툴체인 기준 | Swift 6.3. 원문은 "2026년 8월 기준 현재 릴리스"라고 적는다. ⚠ 없는 내용은 모두 6.3에서 컴파일된다고 한다[](source:ws-base) |
| ⚠ 표시 | Swift 6.4 기능이다. 아직 출시되지 않았고, 제안은 승인되어 main에 구현돼 있다. 계획에 넣어도 되지만 오늘 코드에 쓰면 안 된다[](source:ws-modern-note) |
| 동시성 전제 | Swift 6.2 모델. 6.2에서 `async`의 의미가 바뀌었다[](source:ws-base)[](source:ws-rule) |
| `nonisolated` 타입 | 타입에 붙이면 모든 멤버가 nonisolated가 된다. Swift 6.1+[](source:ws-rule) |
| 원문이 다루는 범위 | Swift 6.4까지[](source:ws-base) |

## 무엇을 강제하나: 기본값 사다리와 영역별 규칙 {#rules}

원문 전체를 관통하는 원칙은 하나다. Swift는 점진적으로 드러내는(progressive disclosure) 언어이니, 가장 정적이고 단순한 것에서 시작해 이유를 가리킬 수 있을 때만 한 칸 내려간다.[](source:ws-thru) 아래 표가 그 사다리다.[](source:ws-ladder)

| 필요 | 먼저 쓰는 것 | 한 칸 내려가는 조건 |
| --- | --- | --- |
| 데이터 | `struct` / `enum` | identity, 공유, 상속이 필요할 때 |
| 추상화 | 구체 타입 | 여러 타입에 반복되는 코드가 생겼을 때 |
| 다형성 | `some P`(generic) | 서로 다른 타입을 담아야 할 때 → `any P` |
| 실행 | main actor, 동기 | profiling이 hang을 보여 줄 때 → `async` → `@concurrent` → `actor` |
| 메모리 | `Array`, `String` | profiling이 비용을 보여 줄 때 → `InlineArray`, `Span` |
| 안전 | 안전한 API | C interop이나 측정된 hot path → `Unsafe` 계열 포인터 |

영역별 규칙은 다음과 같다. 원문은 대부분 명령형이라 "강도" 칸은 원문 표현(never·don't·always·prefer·almost never)으로 나눴다.

| 영역 | 에이전트가 하는 일 | 강도 |
| --- | --- | --- |
| 값 타입 {#rule-1} | `struct`·`enum`을 기본으로 쓴다. `class`는 identity, 공유 가변 상태, 상속, 자원 수명이 필요할 때만 쓴다. `let`이 기본이고 바꿀 때만 `var`다[](source:ws-value) | 권고(기본값) |
| 값 타입 {#rule-2} | 가변 참조 타입 프로퍼티를 가진 struct는 복사본끼리 객체를 공유한다. 참조 타입을 불변으로 두거나, 계산 프로퍼티로 전달하거나, `private` 저장 프로퍼티 뒤에 copy-on-write를 둔다[](source:ws-value) | 권고 |
| 값 타입 {#rule-3} | 서로 배타적인 상태는 optional 여러 개 대신 `enum State` 하나로 둔다. 예: `isSharing`, `selectedRows`, `shareTarget`[](source:ws-value) | 권고 |
| 값 타입 {#rule-4} | 한 번만 써야 하는 자원은 `~Copyable`로 표현하고, 마무리 메서드를 `consuming`으로 표시한다[](source:ws-noncopy) | 권고 |
| 오류 {#rule-5} | 복구할 수 있는 오류는 `throw`, 프로그래머 실수는 `precondition`/`fatalError`다. 오류 타입은 연관값 있는 enum으로 쓴다[](source:ws-err) | 권고 |
| 오류 {#rule-6} | typed throws는 내부 함수, 오류를 넘기는 generic 코드, 제약 환경에만 쓴다. public API는 untyped `throws`를 쓴다[](source:ws-err) | 권고 |
| 오류 {#rule-7} | 강제 unwrap은 불변식을 말할 수 있는 곳에서만 쓰고, 맨 `!`보다 메시지 있는 `#require`·`precondition`을 쓴다[](source:ws-err) | 권고 |
| protocol {#rule-8} | 구체 타입부터 쓰고, 반복 코드가 보이면 protocol로 뽑는다. class로도 protocol로도 시작하지 않는다[](source:ws-proto) | {bad:don't} |
| protocol {#rule-9} | 타입마다 바꿀 것이 없는 protocol은 만들지 않고 제약된 extension을 쓴다. 타입이 바꿔야 하는 동작은 requirement로 둔다[](source:ws-proto) | 권고 |
| protocol {#rule-10} | 상속보다 합성을 쓴다. 강제 downcast는 code smell로 본다[](source:ws-proto) | 권고 |
| `some`/`any` | `some P`가 기본이다. 임의 타입을 저장해야 할 때만 `any P`로 바꾼다[](source:ws-some) | 권고(기본값) |
| API 설계 1 | Swift 전용 API에 타입 접두어를 붙이지 않고, 결과를 바로 돌려주는 함수에서 `get`을 뗀다. 예: `getPersistentPosts` 대신 `persistentPosts`[](source:ws-api) | 권고 |
| API 설계 2 | 잘못된 상태를 표현할 수 없게 모델을 짠다. private setter와 검증 메서드, 닫힌 집합은 enum, `String` 대신 강타입 `UUID`를 쓴다[](source:ws-api) | 권고 |
| ARC 1 | `weak`·`unowned`는 참조 순환을 끊을 때만 쓴다. 그보다 순환을 만들지 않는 구조(트리)가 낫다. `deinit`이 도는 시점에 기대는 코드는 잠재 버그로 본다[](source:ws-arc) | 권고 |
| ARC 2 | `deinit`에서 지표 발행 같은 전역 부수 효과를 내지 않고, 호출 지점의 `defer`를 쓴다[](source:ws-arc) | 권고 |
| 테스트 1 | 새 테스트는 Swift Testing(`@Test`, `#expect`)으로 쓴다. suite는 `struct`다[](source:ws-test-a) | 의무(새 테스트) |
| 테스트 2 | 테스트를 주석 처리하지 않는다. 조건은 `.enabled(if:)`·`.disabled("reason")`, 외부 원인 실패는 `withKnownIssue`를 쓴다[](source:ws-test-b) | {bad:never} |
| 테스트 3 | 테스트는 기본으로 병렬·무작위 순서로 돈다. `.serialized`에 기대기보다 테스트를 고친다[](source:ws-test-b) | 권고 |
| 테스트 이전 | 상호운용 모드는 complete나 strict로 둔다. limited는 쓰지 말고 none은 절대 쓰지 않는다[](source:ws-test-b) | {bad:never none} |
| macro | 컴파일러가 만들 수 있는 코드를 쓸 때만 macro를 쓴다. 적용되지 않을 때는 진단을 내고, 컴파일되지 않는 코드를 조용히 만들지 않는다[](source:ws-macro) | {bad:never} |
| 로깅 | `print` 대신 `os`의 `Logger`를 쓴다. 개인정보가 아닌 값에만 `privacy: .public`을 붙인다[](source:ws-log) | 권고 |
| unsafe | 연속 메모리 접근은 `Unsafe` 포인터보다 `Span`을 쓴다. 포인터를 써야 하면 범위를 좁히고, buffer pointer를 쓰고, 클로저 밖으로 내보내지 않고, Address Sanitizer를 돌린다[](source:ws-unsafe) | {bad:never escape} |
| interop | Swift 도입은 파일 하나씩 한다. 다시 쓰지 않는다[](source:ws-unsafe) | {bad:don't rewrite} |

판정: 이 스킬의 규칙은 대부분 권고형이다. "never", "don't", "do not skip"처럼 금지·의무로 적힌 것은 동시성 순서, 테스트 주석 처리, macro 진단, 포인터 탈출, 범용 라이브러리 설정 정도다. 근거는 위 표의 출처 줄이다.

원문이 직접 준 적용 전후 쌍은 Quick Reference 표다. 일부만 옮긴다.[](source:ws-qr)

| 필요 | 이렇게 쓴다 | 이렇게 쓰지 않는다 |
| --- | --- | --- |
| 데이터 타입 | `struct` / `enum` | identity·공유 없는 `class` {bad:Not} |
| 공유 가변 상태 | `actor` 또는 `@MainActor` class | `class`와 기억해야 하는 lock |
| main thread 밖으로 작업 이동 | `@concurrent func … async` | `Task.detached`, `DispatchQueue.global()` {bad:Not} |
| 라이브러리 API의 격리 | `nonisolated` | `@MainActor`, `@concurrent` |
| data race 고치기 | 객체 공유를 멈춘다 | `@unchecked Sendable` {bad:Not} |
| `await`를 사이에 둔 blocking | 없음. 구조를 바꾼다 | `DispatchSemaphore`, `NSCondition` {bad:Not} |
| 일치하는 원소 지우기 | `removeAll(where:)` O(n) | 루프 안 `remove(at:)` O(n²) |
| 같은 테스트를 여러 입력으로 | `@Test(arguments:)` | `for` 루프나 복사 |
| 잠시 깨진 테스트 | `withKnownIssue` | `.disabled`나 주석 처리 |
| 최적화할지 정하기 | profiling한 테스트에 Instruments | 직관 {bad:Not} |

copy-on-write로 값 의미를 지키는 원문 예시다. 참조 타입 `Texture`를 `private`으로 감추고, 고유하게 참조될 때만 그대로 바꾼다.[](source:ws-cow)

@code source=ws-cow language=swift

## 동시성: 어떤 순서로 내려가나 {#concurrency}

원문은 이 영역을 에이전트가 가장 자주 틀리는 곳이라고 한다. Swift 6.2에서 모델이 바뀌었기 때문이다.[](source:ws-prog) 에이전트는 모든 앱을 main thread에서 시작하고, 아래 네 단계를 순서대로만 내려간다. 원문은 "단계를 건너뛰지 말라"고 적는다.[](source:ws-prog)

@workflow id=concurrency-ladder title="동시성 네 단계"
| c-main | 1 main actor 단일 스레드 | backend |
| c-latency | 기다림이 있나? | backend |
| c-async | 2 async/await | backend |
| c-hang | Instruments에 hang? | external |
| c-conc | 3 @concurrent | backend |
| c-hop | main actor 왕복 과다? | external |
| c-actor | 4 actor | backend |
| c-main > c-latency | |
| c-latency > c-async | 네트워크·디스크 |
| c-async > c-hang | |
| c-hang > c-conc | 예 | emphasis |
| c-conc > c-hop | |
| c-hop > c-actor | 예 | emphasis |

@steps id=concurrency-steps
| c-main | 1 main actor 단일 스레드 | 동시성이 전혀 없다. 원문은 대부분의 앱에 이것으로 충분하다고 한다.[](source:ws-prog) | concurrency-ladder | c-main |
| c-latency | 기다림이 있나? | 네트워크·디스크 지연을 숨겨야 할 때 다음 단계로 간다.[](source:ws-prog) | concurrency-ladder | c-latency |
| c-async | 2 async/await | 지연을 숨길 뿐 자기 동시성은 아직 없다. `URLSession.data(from:)` 같은 SDK API가 대신 작업을 넘긴다.[](source:ws-prog) | concurrency-ladder | c-async |
| c-hang | Instruments에 hang? | Time Profiler와 hang 도구로 측정한다. 동시성 없이 빠르게 만들 수 있으면 항상 그쪽을 먼저 한다.[](source:ws-cost) | concurrency-ladder | c-hang |
| c-conc | 3 @concurrent | 자기의 CPU 작업을 concurrent thread pool로 옮긴다. Instruments가 hang을 보여 준 뒤에만 쓴다.[](source:ws-prog)[](source:ws-rule) | concurrency-ladder | c-conc |
| c-hop | main actor 왕복 과다? | main actor 상태가 너무 많아 task가 계속 되돌아와야 하면 다음 단계로 간다.[](source:ws-prog) | concurrency-ladder | c-hop |
| c-actor | 4 actor | 상태를 main actor 밖으로 옮긴다.[](source:ws-prog) | concurrency-ladder | c-actor |

판정: 그림의 "아니오" 간선은 그리지 않았다. 원문은 조건이 없으면 그 단계에 머문다는 뜻으로만 읽힌다.

**바뀐 규칙.** Swift 6.2부터 함수에 `async`를 붙여도 현재 actor를 떠나지 않고, 호출된 곳에서 돈다.[](source:ws-rule) 그래서 실행 위치를 정하는 표시는 셋으로 나뉜다.

| 표시 | 어디서 도나 | 원문이 권하는 쓰임 |
| --- | --- | --- |
| `@concurrent` | 항상 concurrent thread pool | 자기의 CPU 작업[](source:ws-rule) |
| `nonisolated` | 호출된 곳 | 라이브러리 API의 기본값. 호출자가 정한다[](source:ws-rule) |
| 둘 다 없음 | 호출자의 actor | -[](source:ws-rule) |

원문 예시는 `nonisolated` 타입 안에서 `@concurrent` 메서드가 독립 작업 두 개를 `async let`으로 병렬 실행한다.[](source:ws-photo)

@code source=ws-photo language=swift

**빌드 설정.** 에이전트는 모든 프로젝트에 Approachable Concurrency를 켠다. 앱 모듈과 UI 모듈은 Default Actor Isolation을 MainActor로 둔다. 원문에 따르면 Xcode 26의 새 앱 프로젝트 기본값이다.

package에서는 `swiftSettings: [.defaultIsolation(MainActor.self)]`를 쓴다. 범용 라이브러리에는 이 설정을 하지 않는다.[](source:ws-build)

**await와 actor.** 다음 규칙은 순서 단계와 별개로 늘 지킨다.

- 사소한 작업에 task를 띄우지 않는다. 예: `UserDefaults` 값 하나 읽기. 순서가 필요한 일은 task 하나에, 독립된 일은 따로 둔다.[](source:ws-cost)
- `await`는 원자성을 깬다. `await` 뒤마다 가정을 다시 확인한다. lock을 잡은 채 `await`하지 않고, thread-local 저장소에 기대지 않는다.[](source:ws-cost)
- actor는 상호 배제를 보장할 뿐 transaction이 아니다. actor 상태는 동기 메서드에서 바꾼다. 캐시 확인 → `await` 다운로드 → 캐시 쓰기는 두 task가 함께 놓치는 고전 버그다.[](source:ws-actor)
- actor는 FIFO가 아니다. 우선순위가 높은 일을 먼저 한다. 순서가 필요하면 task나 `AsyncStream`을 쓴다.[](source:ws-actor)

**data race 오류를 만났을 때**는 이 순서로 내려간다.[](source:ws-race)

@steps id=race-fix-steps
| race-1 | 공유하지 않는다 | 공유 객체를 지역 변수로 옮겨 동시 작업마다 자기 인스턴스를 갖게 한다. 원문은 실제 오류 대부분이 이것으로 고쳐진다고 한다.[](source:ws-race) |
| race-2 | Sendable 값 타입 | 공유를 사실상 복사로 바꾼다.[](source:ws-race) |
| race-3 | actor에 격리 | main actor나 직접 만든 actor에 둔다.[](source:ws-race) |
| race-4 | 그다음 동기화 도구 | `Synchronization` 모듈의 `Mutex`·`Atomic`(`let` 프로퍼티에 저장)이나 `@unchecked Sendable`을 쓴다.[](source:ws-race) |

전역·정적 변수는 가장 흔한 오류 원인이다. 우선순위는 `let` → `@MainActor` → `Mutex` → `nonisolated(unsafe)`다.[](source:ws-race)

`@unchecked Sendable`과 `nonisolated(unsafe)`는 실제 내부 동기화가 있을 때만 쓰는 마지막 수단이고, 경고를 끄는 용도가 아니다.[](source:ws-send) 대부분의 model class는 `@MainActor`도 `Sendable`도 아니게 둔다. main actor를 떠나야 하면 `Sendable`이 아니라 `nonisolated`로 만든다.[](source:ws-send)

**structured concurrency.** 항상 structured task를 먼저 쓴다.[](source:ws-struct)

| 도구 | 쓰는 때 |
| --- | --- |
| `async let` | 자식 수가 고정이고 정적으로 알 때[](source:ws-struct) |
| `withTaskGroup` | 자식 수가 동적일 때. 동시성에 상한을 둔다. N개를 띄우고 하나 끝날 때마다 하나를 더한다[](source:ws-struct)[](source:ws-cancel) |
| `withDiscardingTaskGroup` | 자식이 아무것도 돌려주지 않을 때[](source:ws-struct) |
| `Task { }` | 수명이 범위에 안 맞을 때. 예: delegate callback, 버튼 탭. 취소는 직접 관리한다[](source:ws-struct) |
| `Task.detached` | 거의 쓰지 않는다. 격리·우선순위·task-local을 하나도 물려받지 않는다 [](source:ws-struct) {bad:almost never} |

- 취소는 협조형이다. 비싼 작업 전에 `Task.isCancelled`나 `try Task.checkCancellation()`을 확인한다.[](source:ws-cancel)
- continuation은 모든 경로에서 정확히 한 번 resume한다. 안 하면 호출자가 영원히 멈추고, 두 번 하면 fatal error다. Swift 6.4(미출시)는 이를 컴파일 시점에 검사하는 `Continuation` 타입을 더한다.[](source:ws-cont)

**SwiftUI.** `View`와 그 안의 `@State`는 `@MainActor`다. 시그니처에 `@Sendable`이 있는 API(`visualEffect`, `Shape.path(in:)`, `Layout`, `onGeometryChange`)는 main thread 밖에서 돌 수 있다. 그 클로저에서 격리 오류가 나면 `self`를 보내지 않고 필요한 값 하나를 capture list로 복사한다.[](source:ws-swiftui)

@code source=ws-vfx language=swift

애니메이션 시작 같은 시간에 민감한 UI 갱신은 동기 action callback 안에서 `withAnimation`으로 하고, 오래 걸리는 일만 `Task`로 연다.[](source:ws-swiftui2)

## 기존 코드를 Swift 6으로 옮길 때 {#migration}

원문은 단계를 섞으면 이전이 멈춘다고 한다. 에이전트는 아래 순서를 지키고, 대규모 리팩터링을 data-race safety 켜기와 함께 하지 않는다.[](source:ws-mig)

@workflow id=migration-flow title="Swift 6 이전 순서"
| m-build | 1 새 컴파일러로 빌드 | backend |
| m-check | 2 target별 완전 검사 | backend |
| m-fix | 3 싼 경고부터 수정 | backend |
| m-mode | 4 Swift 6 모드로 전환 | backend |
| m-next | 남은 target? | backend |
| m-refac | 6 리팩터링은 따로 | backend |
| m-build > m-check | |
| m-check > m-fix | |
| m-fix > m-mode | |
| m-mode > m-next | |
| m-next > m-check | 5 예 |
| m-next > m-refac | 아니오 | emphasis |

@steps id=migration-steps
| m-build | 1 새 컴파일러로 빌드 | Swift 5 모드에서 그대로 빌드되어야 한다.[](source:ws-mig) | migration-flow | m-build |
| m-check | 2 target별 완전 검사 | Swift 5 모드에 Swift 6 경고를 모두 켠다. 아래 프레임워크가 아니라 UI·앱 층부터 시작한다. SDK가 이미 main actor 표시를 많이 해 두어 고치기 쉽다.[](source:ws-mig) | migration-flow | m-check |
| m-fix | 3 싼 경고부터 수정 | 경고 수백 개가 원인 몇 개에서 나온다고 본다. 예: `let`이어야 할 `var` 전역, `@MainActor`에 속할 자유 함수, `: Sendable`이 필요한 public struct 하나.[](source:ws-mig) | migration-flow | m-fix |
| m-mode | 4 Swift 6 모드로 전환 | target을 Swift 6 언어 모드로 바꿔 고친 상태를 고정한다.[](source:ws-mig) | migration-flow | m-mode |
| m-next | 남은 target? | 다음 target으로 가서 반복한다(원문 5단계).[](source:ws-mig) | migration-flow | m-next |
| m-refac | 6 리팩터링은 따로 | 리팩터링은 나중에 따로 한다. 함께 하면 둘 다 되돌려야 한다.[](source:ws-mig) | migration-flow | m-refac |

시작하기 전에 Approachable Concurrency와 앱 모듈의 main actor 기본 격리를 켠다. 원문은 이것이 오류 수를 크게 줄인다고 한다. 엄격 검사를 다시 끄고 출시해도 이미 고친 것은 그대로 개선으로 남는다.[](source:ws-mig)

## 버전별 최신 문법과 성능 수치 {#modern-syntax}

원문은 에이전트가 아래 항목의 예전 형태를 습관처럼 쓴다고 한다.[](source:ws-modern-note) 에이전트는 오른쪽 형태를 쓴다. ⚠ 행은 Swift 6.4라서 프로젝트 툴체인을 먼저 확인하고, 6.3 이하가 대상이면 예전 형태를 쓴다.[](source:ws-modern-note)

| 예전 형태 | 쓸 형태 | 버전 |
| --- | --- | --- |
| 중첩 삼항, `let` 초기화용 즉시 호출 클로저 | `if`/`switch` 표현식 | 5.9 |
| 인자 1·2·3개 overload | parameter pack(`each T`), pack에 대한 `for` | 5.9 |
| `ObservableObject`와 프로퍼티마다 `@Published` | `@Observable` | 5.9 |
| 객체 변화를 polling | `Observations { ... }`. transaction 단위 갱신의 `AsyncSequence` | 6.2 |
| 문자열 키 `userInfo`를 쓰는 `NotificationCenter` | 구체 알림 타입(`MainActorMessage` / `AsyncMessage`) | 6.2 |
| 스크립트용 `Process`와 pipe | Subprocess package(줄 단위 출력은 `AsyncBufferSequence.strings()`). 1.0은 6.4와 함께 나온다 | 6.2+ |
| 손으로 짠 문자열 인덱스 계산 | Swift Regex. 짧게는 literal, 구조는 `RegexBuilder` | 5.7 |
| hot path의 고정 크기 `[String]` | `InlineArray<N, T>` | 6.2 |
| `withUnsafeBufferPointer` | `.span` / `.bytes`(`RawSpan`) / `OutputSpan` | 6.2 |
| 쓰기를 끝내려고 `Task.isCancelled`를 수동 처리 | `Task` cancellation shield(SE-0504) | {caution:6.4 ⚠} |
| key를 쓰려고 dictionary를 손으로 재구성 | `mapKeyedValues` | {caution:6.4 ⚠} |
| 플랫폼을 다 나열한 `@available(iOS ..., macOS ..., ...)` | `@available(anyAppleOS ...)` | {caution:6.4 ⚠} |
| 타입이 모듈을 가릴 때 `Rocket.SaturnV` | module selector `Rocket::SaturnV` | 6.3 |
| 일괄 "warnings as errors" | 선언·경고 그룹별 `@diagnose` | {caution:6.4 ⚠} |
| `weak var` 때문에 `@unchecked Sendable` | `weak let`, 또는 `~Sendable`로 비-sendable 명시 | {caution:6.4 ⚠} |
| 포인터로 바이너리 형식 직접 파싱 | Swift Binary Parsing(`ParserSpan`, overflow 검사 초기화) | 6.2 |
| 어색한 테스트 함수 이름 | raw identifier. 함수 이름을 백틱으로 감싸 문장으로 쓴다. 예: fruits have a tropical climate | 6.0 |

표 출처: §15 표 14행 전부.[](source:ws-modern) Regex에서는 날짜·숫자 파싱을 손으로 짜지 않고 Foundation 파서(`.date(...)`, `.currency(...)`)와 조합한다. locale은 명시하고, 전체 입력에 걸친 backtracking은 `NegativeLookahead`나 `Local`로 막는다.[](source:ws-regex)

표 밖에서 버전이 붙은 항목도 있다. 6.4 항목은 원문이 미출시라고 적지만 ⚠ 기호는 없다.

| 항목 | 버전 | 원문 위치 |
| --- | --- | --- |
| `@inline(always)`(메서드엔 `final`과 함께), `@specialized(where T == ...)`(SE-0460) | 6.3 출시, 필요를 측정했을 때 | §9[](source:ws-6364) |
| `@c` 속성(헤더에 선언이 있으면 `@implementation`과 함께) | 6.3 | §14[](source:ws-unsafe) |
| `borrow`/`mutate` accessor, `UniqueArray`/`UniqueBox`, `Ref`/`MutableRef` | {caution:6.4 미출시} | §9[](source:ws-6364) |
| 컴파일 시점에 한 번 resume을 검사하는 `Continuation` 타입 | {caution:6.4 미출시} | §5[](source:ws-cont) |
| 함수 단위 strict memory safety를 켜는 `@diagnose` | {caution:6.4 미출시} | §14[](source:ws-unsafe) |
| `InlineArray`, `Span`/`RawSpan`/`OutputSpan` | 6.2 | §9[](source:ws-levers) |
| 테스트 프레임워크 상호운용(ST-0021) | Xcode 버전에 따라 확인 | §11[](source:ws-test-b) |

**성능.** 에이전트는 알고리즘을 먼저 고치고, 그다음 측정하고, 그다음 저수준 수단을 쓴다.[](source:ws-algo) 원문의 수치는 다음과 같다. 모두 설명용 사실이고 따라야 할 임계값은 없다.

@facts
| 저수준 비용 네 가지 | 함수 호출, 메모리 배치, 할당, 복사. 할당은 전역(무료), stack(뺄셈 한 번), heap(탐색과 lock 때문에 비쌈) 순이다[](source:ws-perf) |
| 루프 안 `remove(at:)` | `remove(at:)`는 O(n)이라 루프에서 O(n²)가 된다. `removeAll(where:)`는 전체 O(n)이다[](source:ws-algo) |
| 바이트마다 다시 자른 `Data` | O(n²). `popFirst()`는 O(1)이다. 원문은 두 사례가 모두 100배 이상 느려진 회귀였다고 한다[](source:ws-algo) |
| `any P` existential | inline buffer가 3 word다. 들어가지 않는 값은 복사마다 heap에 할당된다[](source:ws-levers) |
| 참조 필드 3개인 큰 struct | 복사마다 retain 3번, class는 1번이다[](source:ws-levers) |
| main actor 왕복 | 실제 context switch 비용이 든다. 루프를 `loadArticles`·`updateUI` 안으로 넣어 배열로 넘긴다[](source:ws-hop) |

profiling은 테스트를 대상으로 Instruments의 Time Profiler와 Allocations를 돌린다. flame graph에서 `platform_memmove`가 크면 의도치 않은 복사, `swift_beginAccess`는 런타임 exclusivity 검사, `swift_retain`/`swift_release`는 참조 카운팅 비용으로 읽는다.[](source:ws-algo) 로그는 `debug`(저장 안 함, 가장 빠름)부터 `info`, `notice`(기본), `error`, `fault`(가장 오래 저장, 가장 느림) 순으로 저장과 비용이 늘어난다.[](source:ws-log)

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 1개, 42,445B다. `design/emilkowalski/write-swift/SKILL.md`를 1줄부터 396줄까지 모두 읽었다.
- 제외한 파일: 번역본 `SKILL.ko.md`(48,010B)는 열지 않았다. 바이너리와 구조·표본만 본 파일은 없다.
- 관계: 다른 스킬과 연결 없음(원장). 원문에도 다른 스킬 이름이나 슬래시 명령이 없다(`grep`으로 확인).
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 사람 개입 1곳(첫 호출 응답), 적용 제외·금지 5행, 버전 표기(§15 표 14행과 표 밖 7행), 성능 수치 6행, 동시성 4단계, data race 4단계, 이전 6단계를 모두 원문과 대조했다. 영역별 규칙표는 각 절의 굵은 글씨 규칙을 중심으로 옮겼고, 원문의 설명 문장을 모두 옮기지는 않았다. 생략한 것은 macro 역할 다섯 가지의 세부, `Logger`의 `format:`·`align:`, LLDB의 `swift task info` 같은 도구 사용 팁이다.
- 원문의 Swift 코드 예시 3개는 `@code`로 그대로 실었다. 컴파일하거나 실행하지 않았다.
- 분석 중 바뀐 파일: 없음. 작업 트리는 commit `4e3fc89` 그대로다.

@callout level=open-question title="원문 안에서 확인하지 못했거나 어긋나 보이는 곳"
- 툴체인 기준 "Swift 6.3, 2026년 8월 기준 현재 릴리스"는 원문의 주장이다. 이 분석에서 Swift 릴리스 현황을 확인하지 않았다.[](source:ws-base)
- ⚠ 기호는 §15 표에만 붙어 있다. §5·§9·§14의 6.4 항목은 "unreleased"라는 말로만 표시된다. 판정: 같은 규칙(6.3 이하면 쓰지 않음)이 적용된다고 읽는 것이 자연스럽지만, 원문이 그 범위를 명시하지는 않는다.[](source:ws-modern-note)[](source:ws-6364)
- Subprocess 행은 "6.2+"이고 "1.0은 6.4와 함께"라고 적지만 ⚠가 없다. 6.3에서 1.0 이전 버전을 쓸 수 있다는 뜻인지는 `원문에 명시 없음`이다.[](source:ws-modern)
- §4는 "대부분의 model class는 `@MainActor`도 `Sendable`도 아니게 두라"고 한다. Quick Reference는 공유 model class에 "non-`Sendable`, 또는 `@MainActor`"를 권한다. 판정: 둘이 정면으로 충돌하지는 않지만 `@MainActor`를 권하는 정도가 다르다. 우선순위는 원문에 없다.[](source:ws-send)[](source:ws-qr)
- 처음 호출 응답은 "구체적인 질문 없이" 켜질 때만 적용된다. 질문과 함께 켜지면 바로 답하는 것으로 읽힌다. 실제 동작은 확인하지 않았다(지시상 동작).[](source:ws-init)
