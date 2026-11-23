---
name: write-swift
description: 최신 Swift를 제대로 작성하는 방법을 다룹니다. 값 타입으로 모델링, Swift 6 데이터 경쟁 안전성과 쉽게 접근할 수 있는 동시성(`@concurrent`, main-actor-by-default, actor, task group), 프로토콜과 제네릭(`some` 대 `any`), API 설계, 성능과 ARC, Swift Testing, 매크로, 에이전트가 아직 모르는 최신 언어 기능을 설명합니다. Swift를 작성·검토·마이그레이션하거나 동시성 오류, 멈춤, 데이터 경쟁, retain cycle, 성능 문제를 고칠 때 사용합니다.
---

# Swift 작성

## 첫 응답

이 스킬이 구체적인 질문 없이 처음 호출되면 다음 문장만 응답합니다.

> I'm ready to help you write modern Swift, the way the language wants to be written.

사용자가 질문하기 전까지 다른 정보를 제공하지 않습니다.

언어가 지향하는 방식으로 Swift를 작성하는 법입니다. Swift 6.4까지의 내용을 반영합니다.

**툴체인 기준선: Swift 6.3**(2026년 8월 기준 최신 릴리스). ⚠가 붙은 미출시 Swift 6.4 기능을 제외하면 여기의 내용은 모두 6.3에서 컴파일됩니다. 동시성 설명은 Swift 6.2 모델을 기준으로 합니다. 프로젝트가 6.1 이하라면 3절의 `async` 및 `@concurrent` 규칙은 적용되지 않습니다.

핵심 원칙은 다음과 같습니다. **Swift는 기능을 점진적으로 드러내는 언어입니다. 작동하는 가장 단순하고 정적이며 단일 스레드인 방식부터 시작하고, 동시성·참조 의미론·존재 타입·unsafe 포인터는 이유를 명확히 설명할 수 있을 때만 도입합니다.** 아래 규칙은 모두 이를 적용한 것입니다.

기본 선택의 위계를 기억하세요. 이유를 말할 수 있을 때만 한 단계 더 아래의 선택을 합니다.

| 필요 | 먼저 선택 | 다음 단계로 넘어가는 이유 |
| --- | --- | --- |
| 데이터 | `struct` / `enum` | 정체성, 공유, 상속이 필요할 때 |
| 추상화 | 구체 타입 | 여러 타입에 반복되는 코드가 있을 때 |
| 다형성 | `some P`(제네릭) | 서로 다른 타입을 함께 저장해야 해 `any P`가 필요할 때 |
| 실행 | main actor, 동기 방식 | 프로파일링에서 멈춤이 확인되면 `async` → `@concurrent` → `actor` |
| 메모리 | `Array`, `String` | 프로파일링에서 비용이 확인되면 `InlineArray`, `Span` |
| 안전성 | 안전한 API | C 상호 운용이나 측정된 핫패스가 있을 때 `Unsafe*` |

---

## 1. 값 타입으로 데이터 모델링

Swift에서는 값 타입이 기본이며 특별한 예외가 아닙니다.

- **기본은 `struct`와 `enum`입니다. `class`는 정체성, 공유 가변 상태, 상속, 리소스 수명이 필요한 경우에만 씁니다.** 창, 데이터베이스 연결, 렌더링 엔진에 저장되는 엔티티는 정체성이 필요합니다. `Point`, `Drink`, `Material`에는 필요하지 않습니다.
- **기본은 `let`이고 실제로 변경할 때만 `var`를 씁니다.** `any`보다 `some`, 참조보다 값 타입을 먼저 선택하는 것과 같은 원칙입니다. 좁게 시작하고 이유가 생길 때 넓힙니다.
- **가변 참조 타입 속성을 가진 구조체는 값도 참조도 아닙니다.** 복사본들이 같은 객체를 공유해 한쪽의 변경이 다른 복사본에 새어 나갑니다. 참조 타입을 불변으로 유지하거나, 계산 속성만 공개해 내부 참조로 전달하거나, copy-on-write 뒤에 `private` 저장 속성으로 감쌉니다.
- **Copy-on-write는 별도 저장소와 값 의미론을 함께 얻는 방식입니다.** final class를 구조체로 감싸고 변경 전에 `isKnownUniquelyReferenced(&storage)`를 확인합니다. 고유하게 참조되지 않으면 먼저 복사합니다. `Array`, `String`, `Dictionary`가 같은 방식으로 작동합니다.
- **열거형은 “정해진 선택지”와 상호 배타적 상태를 표현하는 도구입니다.** `isSharing`, `selectedRows`, `shareTarget` 같은 선택 속성을 늘어놓는 대신 `enum State` 하나로 나타내면 유효하지 않은 조합을 표현할 수 없고 상태 변경도 여러 속성 쓰기의 연속이 아니라 원자적인 변화가 됩니다.
- **값을 조합하면 값이 됩니다.** 저장 속성이 모두 값 타입인 구조체는 별도 노력 없이 값 의미론을 가집니다. 덕분에 undo, diff, 상태 복원을 여러 코드 경로가 아니라 하나의 경로로 처리할 수 있습니다.

```swift
struct Material {                       // value semantics preserved
  var roughness: Double
  private var _texture: Texture         // a class

  var color: Color {
    get { _texture.color }
    set {
      if !isKnownUniquelyReferenced(&_texture) { _texture = Texture(copying: _texture) }
      _texture.color = newValue
    }
  }
}
```


**복사 불가능 타입**(`~Copyable`)은 파일 디스크립터, 은행 송금, 열린 리소스처럼 소유권이 하나뿐인 값을 나타냅니다. 복사를 막으면 “두 번 실행하면 안 됨”이 주석이나 assertion이 아니라 컴파일 오류가 되며 구조체의 `deinit`도 의미를 가집니다. 마지막 사용임을 컴파일러가 증명하도록 종료 메서드를 `consuming`으로 표시합니다. 매개변수 소유권도 분명해집니다. `borrowing`은 읽기 전용(기본), `consuming`은 소유권을 넘기며, `inout` / `mutating`은 임시 쓰기 권한을 나타냅니다.

---

## 2. 오류와 옵셔널 — 실패 경로를 드러내기

Swift의 오류 처리는 세 가지 원칙에 기반합니다. 오류가 날 수 있는 위치를 표시해 놀라지 않게 하고, 오류에 대응할 맥락을 담으며, **복구 가능한 오류와 프로그래머 실수를 구분합니다.**

- **복구 가능한 오류는 `throw`, 프로그래머 실수는 `precondition` / `fatalError`.** 네트워크 요청 실패는 프로그램을 계속 실행할 수 있습니다. 범위를 벗어난 인덱스는 코드가 잘못된 것이므로 보안 문제가 되기 전에 중단해야 합니다.
- **연관 값을 가진 열거형이 좋은 오류 타입입니다.** `case duplicateFriend(String)`은 `case duplicateFriend`보다 낫습니다. 어떤 값이 중복됐는지 맥락이 중요합니다.
- **오류 조건에는 `guard`를 씁니다.** 종료 경로가 분명해집니다. 일반적인 옵셔널 해제에는 `if let`을 사용합니다.
- **타입 지정 throws(`throws(MyError)`)는 내부 함수, 오류를 전달하는 제네릭 코드, `any Error` 박싱 비용이 큰 환경에 사용합니다.** 공개 API에서는 타입을 지정하지 않은 `throws`로 두어 나중에 오류 타입을 바꿀 자유를 유지합니다. `throws`는 `throws(any Error)`, 비 throw 함수는 `throws(Never)`와 같습니다. 이것이 `map`이 두 경우를 모두 추상화할 수 있는 이유입니다.
- **불변 조건을 분명히 말할 수 있는 곳에서만 force unwrap합니다.** 맨몸 `!`보다 실패 시 메시지를 보여 주는 `#require` / `precondition`을 우선합니다.

---

## 3. 동시성: 프로파일링이 달리 말하기 전까지 단일 스레드 유지

Swift 6.2에서 모델이 바뀌었기 때문에 에이전트가 가장 자주 틀리는 부분입니다.

앱은 처음에 메인 스레드에서만 실행합니다. 단일 스레드 코드만으로도 할 수 있는 일이 많고, 대부분의 앱은 다른 스레드가 필요하지 않습니다.

**아래 순서를 지키고 단계를 건너뛰지 않습니다.**

1. **main actor에서 단일 스레드로 시작.** 동시성 없음. 대부분의 앱에는 충분합니다.
2. 네트워크나 디스크 대기 시간을 숨기기 위해 **`async` / `await` 사용.** 직접 동시성을 만들 필요는 없습니다. `URLSession.data(from:)` 같은 SDK API가 대신 다른 스레드에서 처리합니다.
3. Instruments에서 멈춤이 확인된 경우에만 **`@concurrent`로 직접 작성한 비용 큰 작업을 메인 스레드 밖으로 옮깁니다.**
4. main actor 상태가 많아 작업이 계속 되돌아와야 할 때에만 **`actor`로 상태를 메인 액터 밖으로 옮깁니다.**

**먼저 올바른 빌드 설정을 켭니다.** 모든 프로젝트에서 **Approachable Concurrency**를 활성화합니다. 앱 모듈과 UI 모듈에서는 **Default Actor Isolation**도 **MainActor**로 설정합니다. Xcode 26에서 새 앱 프로젝트의 기본값이며 대부분의 `@MainActor` 주석을 없앨 수 있습니다. 패키지에서는 `swiftSettings: [.defaultIsolation(MainActor.self)]`를 사용합니다. **범용 라이브러리에는 main actor 기본 격리를 설정하지 않습니다.** 라이브러리는 `nonisolated` API를 제공하고 호출자가 실행 위치를 결정하게 해야 합니다.

### 달라진 규칙

**Swift 6.2에서는 함수에 `async`를 붙여도 현재 액터를 벗어나지 않습니다.** 호출된 위치에서 실행됩니다. 덕분에 자연스럽게 작성하는 코드가 기본적으로 데이터 경쟁에서 안전합니다.

- **`@concurrent`** — 항상 동시 실행 스레드 풀로 전환합니다. 직접 작성한 CPU 집약 작업에 사용합니다.
- **`nonisolated`** — 호출된 위치에서 실행합니다. **라이브러리 API의 올바른 기본값입니다.** 실행 위치는 호출자가 정하기 때문입니다. 타입을 `nonisolated`로 선언하면 모든 멤버가 비격리됩니다(Swift 6.1 이상).
- 둘 다 지정하지 않으면 호출자의 액터에 머뭅니다.

```swift
nonisolated struct PhotoProcessor {          // decoupled from the main actor
  @concurrent                                // guaranteed to run in the background
  func process(_ data: Data) async -> ProcessedPhoto {
    async let sticker = extractSticker(data)  // two independent jobs, in parallel
    async let colors  = extractColors(data)
    return await ProcessedPhoto(sticker: sticker, colors: colors)
  }
}
```


- **작업을 다른 스레드로 옮기기 전에 프로파일링합니다.** Instruments(Time Profiler, hangs)를 사용합니다. 동시성 없이 코드를 더 빠르게 만들 수 있다면 먼저 그렇게 합니다. 동시성에는 작업 할당, 스케줄링, 추론 비용이 발생합니다.
- **사소한 일을 위해 task를 만들지 않습니다.** `UserDefaults` 값을 읽는 하위 task 하나의 비용이 얻는 이득보다 클 수 있습니다.
- **하나의 종단 간 작업에는 task 하나를 사용합니다.** 순서대로 진행해야 하는 일은 _하나의_ task 안에 두고, 독립 작업만 별도 task로 만들어 런타임이 서로 끼워 넣을 수 있게 합니다.
- **`await`는 중단 지점이며 원자성을 끊습니다.** 기다리는 사이 상태가 바뀔 수 있고 다른 스레드에서 다시 실행될 수도 있습니다. 매 `await` 뒤에 전제를 다시 확인합니다. `await`를 가로질러 lock을 잡아 두지 않습니다. `await` 이후 thread-local storage에 의존하지 않습니다.

### 액터 재진입

액터는 상호 배제를 보장하지만 트랜잭션은 아닙니다. 같은 액터의 `await` 두 개 사이에 다른 작업이 실행될 수 있습니다.

- **동기 메서드에서 액터 상태를 변경합니다.** 액터의 동기 코드는 중단 없이 끝까지 실행되므로 트랜잭션 경계로 쓸 수 있습니다.
- **비동기 액터 메서드는 얇게 유지합니다.** 동기 트랜잭션 작업으로 구성하고, `await` 지점마다 액터 상태가 일관되게 남도록 합니다.
- 흔한 버그: 캐시 확인 → `await` 다운로드 → 캐시에 저장. 두 task가 모두 캐시를 놓쳐 각자 다운로드하고 두 번째 작업이 첫 번째 결과를 덮어씁니다. `await` 뒤에 다시 확인하거나 진행 중 작업을 중복 제거합니다.
- **액터는 FIFO가 아닙니다.** 우선순위 역전을 피하기 위해 우선순위가 가장 높은 작업을 먼저 실행합니다. 순서가 필요하면 시작부터 끝까지 실행되는 task나 `AsyncStream`을 사용하고 액터에 기대지 않습니다.

---

## 4. Sendable과 데이터 공유

`Sendable`은 타입을 격리 영역 사이에서 안전하게 공유할 수 있음을 나타냅니다. 컴파일러는 task와 actor 경계마다 이를 검사합니다.

- **저장 속성도 `Sendable`이면 값 타입도 `Sendable`입니다.** 공개되지 않은 타입은 자동 추론됩니다. **공개 타입은 sendability를 자동 추론하지 않습니다.** 공개 타입에 `Sendable`을 표시하면 사용자를 향한 보장이 되므로 Swift는 직접 선언하게 합니다.
- **액터와 `@MainActor` 클래스는 상태가 격리되어 있어 암시적으로 `Sendable`입니다.**
- **대부분의 모델 클래스는 `@MainActor`도 `Sendable`도 아니어야 합니다.** 일부 모델은 메인 스레드에서, 나머지는 백그라운드에서 바뀌는 상황을 막으려면 의도적으로 non-`Sendable`로 둡니다. main actor 밖으로 나가야 한다면 `Sendable`이 아니라 `nonisolated`로 지정합니다.
- **보내는 쪽이 이후에 사용을 중단한다면 non-`Sendable` 객체도 격리 영역 사이로 전달할 수 있습니다.** 넘기기 전에 변경을 모두 끝내고, 이후 접근을 오류로 처리합니다.
- 클로저도 상태를 캡처합니다. 함수 타입이 실제로 격리 영역을 넘을 때만 `@Sendable`을 표시합니다.
- **`@unchecked Sendable`은 컴파일러가 확인할 수 없는 약속입니다.** `Mutex`나 lock 같은 내부 동기화가 실제로 있는 타입에만 사용합니다. 전역 변수의 `nonisolated(unsafe)`도 마찬가지로 최후의 수단이지 경고를 없애기 위한 것이 아닙니다.

**데이터 경쟁 오류가 생기면 다음 순서로 해결합니다.**

1. **공유하지 않습니다.** 공유 객체를 지역 변수로 옮겨 동시 작업마다 인스턴스를 하나씩 사용하게 합니다. 실제 오류의 대부분은 이 방법으로 해결됩니다.
2. 복사를 통한 공유가 가능하도록 **`Sendable` 값 타입으로 만듭니다.**
3. **액터에 격리합니다.** main actor 또는 별도 액터를 사용합니다.
4. 그다음에야 `Synchronization` 모듈의 `Mutex` / `Atomic`(속성은 `let`으로 보관) 또는 `@unchecked Sendable`을 고려합니다.

**전역 변수와 static 변수는 오류의 가장 흔한 원인입니다.** 우선순위대로 `let`으로 만들고, `@MainActor`에 두고, `Mutex`로 감싸고, 마지막으로 `nonisolated(unsafe)`를 사용합니다. Swift의 전역 변수는 C와 달리 지연 초기화되며 원자적으로 초기화됩니다.

**기존 콜백 API 연결:** 소유한 delegate 프로토콜에는 `@MainActor`를 지정합니다. 소유하지 않는다면 메서드를 `nonisolated`로 표시하고 `MainActor.assumeIsolated { }`를 사용합니다. 이 방식은 액터로 전환하지 않고 단언하므로 데이터 경쟁을 조용히 허용하는 대신 즉시 오류를 냅니다. 준수 선언의 `@preconcurrency`는 같은 처리를 간단히 표현합니다. 마이그레이션되지 않은 모듈의 sendability 경고를 임시로 끄려면 `@preconcurrency import`를 사용합니다. 해당 모듈이 마이그레이션되면 경고는 올바르게 다시 나타납니다.

---

## 5. 구조적 동시성

구조적 task를 우선 사용합니다.

구조적 task(`async let`, task group)는 지역 변수처럼 범위가 정해집니다. 블록 밖으로 살아남을 수 없고 자동으로 await되며 task 트리에서 취소, 우선순위, task-local 값을 이어받습니다. 비구조적 task(`Task { }`, `Task.detached`)는 이를 자동으로 제공하지 않습니다.

- **`async let`** — 동시 실행할 하위 작업 수가 고정되어 정적으로 알려진 경우.
- **`withTaskGroup`** — 작업 수가 동적일 때 사용합니다. task group은 `AsyncSequence`를 준수하므로 결과가 도착하는 순서대로 순회할 수 있습니다. 하위 작업이 아무것도 반환하지 않으면 **`withDiscardingTaskGroup`**을 사용합니다. 각 작업의 리소스를 즉시 해제하고 첫 오류에서 형제를 취소합니다.
- **`Task { }`** — delegate 콜백, 버튼 탭, 뷰 표시처럼 작업 수명이 lexical scope와 맞지 않을 때만 사용합니다. actor 격리와 우선순위는 이어받지만 취소는 직접 관리해야 합니다.
- **`Task.detached`** — 거의 쓰지 않습니다. 격리, 우선순위, task-local을 하나도 상속하지 않습니다. detached root가 꼭 필요하면 detached task를 반복해서 만들지 말고 그 안에서 task group을 사용합니다.

**취소는 협력 방식입니다.** 취소는 플래그를 설정할 뿐 작업을 중단시키지 않습니다. 비용이 큰 작업을 시작하기 전과 동기 helper에서도 `Task.isCancelled` 또는 `try Task.checkCancellation()`을 확인합니다. 실행 중이 아니라 대기 상태인 작업(`AsyncSequence`의 `next()` 등)에는 `withTaskCancellationHandler`를 사용합니다. 핸들러는 본문과 동시에 즉시 실행되므로 핸들러가 접근하는 상태에는 액터가 아니라 실제 동기화(atomic 또는 lock)가 필요합니다. 액터에서는 순서를 보장할 수 없습니다.

**동시 작업 수를 제한합니다.** 크기 제한이 없는 목록의 모든 항목마다 하위 작업을 만들지 않습니다. N개 작업을 먼저 시작하고 하나가 끝날 때마다 새 작업을 추가합니다.

**Task-local 값**(`@TaskLocal`)은 요청 ID나 trace span 같은 맥락을 시그니처마다 매개변수로 전달하지 않고 task 트리에 전파합니다. 바인딩이 없을 때도 합리적인 기본값을 얻도록 optional로 선언합니다.

**콜백 연결:** `withCheckedContinuation` / `withCheckedThrowingContinuation`을 사용합니다. 계약은 **모든 경로에서 정확히 한 번 resume**하는 것입니다. 호출하지 않으면 대기자가 영원히 멈추고, 두 번 호출하면 치명적 오류가 발생합니다. 나중에 실행되는 delegate API에서는 continuation을 저장했다가 resume할 때 nil로 바꿉니다. (미출시 Swift 6.4에는 한 번만 resume하는지 컴파일 시 검사하는 `Continuation` 타입이 추가됩니다.)

**`AsyncSequence`:** `for await` / `for try await`로 순회합니다. handler / delegate 기반 API는 `AsyncStream` / `AsyncThrowingStream`으로 연결합니다. 클로저 안에서 원본을 만들고 handler에서 `yield`한 다음 `onTermination`에서 정리합니다.

---

## 6. SwiftUI의 동시성

- **`View`는 `@MainActor`에 격리되며 내부의 모든 값(`@State` 포함)도 마찬가지입니다.** 뷰나 뷰 모델에 `@MainActor`를 직접 쓸 일은 거의 없습니다. main-actor-by-default를 사용하면 이미 있는 주석 대부분을 지울 수 있습니다.
- **SwiftUI는 프레임 비용을 줄이려고 일부 코드를 의도적으로 메인 스레드 밖에서 실행합니다.** API 시그니처의 `@Sendable`로 확인할 수 있습니다. `visualEffect`, `Shape.path(in:)`, `Layout` 요구 사항, `onGeometryChange`가 해당합니다. 이런 클로저 안에서 격리 오류가 나면 **`self`를 전달하지 말고 캡처 리스트에 필요한 값 하나만 복사합니다.**

```swift
.visualEffect { [pulse] effect, proxy in    // copy the Bool, don't capture self
  effect.blur(radius: pulse ? 2 : 0)
}
```


- **SwiftUI의 action callback은 의도적으로 동기식입니다.** 제스처나 스크롤 이벤트에 반응해 애니메이션을 시작하는 것처럼 시간에 민감한 UI 갱신은 이벤트와 같은 프레임에 이루어져야 합니다. 동기 콜백 안에서 `withAnimation` 상태 변경을 실행하고, 이어지는 긴 작업에만 `Task`를 엽니다.
- **UI와 비동기 작업의 경계에 상태를 둡니다.** 뷰가 task를 시작하고, 완료 시 비동기 계층이 동기 변경을 적용하며, UI가 반응합니다. 그러면 뷰 로직은 동기로 유지되고 SwiftUI를 import하지 않아도 비동기 로직을 테스트할 수 있습니다.

---

## 7. 프로토콜과 제네릭

클래스부터 시작하지 마세요. **프로토콜부터 시작하지도 마세요.**

작업 흐름: **구체 타입 작성 → 중복 코드 발견 → 공통 기능을 프로토콜로 추출 → 프로토콜을 대상으로 제네릭 코드 작성**. 본문이 거의 같은 오버로드가 일반화할 때가 되었다는 신호입니다.

- **타입마다 사용자 지정이 필요 없는 프로토콜은 낭비입니다.** 모든 준수 타입이 같은 기본 구현을 사용한다면 기존 프로토콜에 제약된 extension을 작성합니다. 복잡한 프로토콜 계층(“타입 동물원”)은 컴파일 시간과 바이너리 크기만 늘리고 이점은 없습니다.
- **is-a보다 has-a를 우선합니다.** 프로토콜의 일부 작업만 타입에 의미가 있다면 프로토콜을 세분화하지 말고 제네릭 구조체로 감싸 의도한 API만 공개합니다. (`GeometricVector<Storage: SIMD>`이지 `GeometricVector: SIMD`가 아닙니다.)
- **프로토콜 요구 사항은 사용자 지정 지점입니다.** 동적 디스패치되며 준수 타입의 구현이 모든 곳에서 우선합니다. 반면 extension에만 있는 메서드는 정적 디스패치되어 준수 타입의 메서드가 재정의가 아니라 *가리기* 동작을 합니다. `any P`만 아는 코드는 extension 구현을 호출합니다. 타입별로 사용자 지정해야 한다면 요구 사항으로 선언합니다.
- **상속보다 조합을 사용합니다.** 클래스 상속은 단일 상위 클래스만 허용하고, 저장 속성과 초기화 복잡성까지 물려주며, 무엇을 언제 재정의하거나 `super`를 호출해야 하는지 암묵적 계약을 남깁니다. 작은 값들을 조합합니다.
- **강제 다운캐스트는 코드 냄새입니다.** 보통 클래스 계층이나 existential로 타입 관계가 소실됐다는 신호입니다.

### `some`과 `any`

- **기본은 `some P`로 작성하고 임의의 타입을 저장해야 할 때 `any P`로 바꿉니다.** `var`보다 `let`을 우선하는 것과 같은 원칙입니다.
- `some P` — 각 범위에서 기반 타입 하나가 고정됩니다. 연관 타입을 포함한 모든 타입 관계가 유지되고 컴파일러가 특수화할 수 있습니다.
- `any P` — 타입이 지워진 상자이며 실제 타입은 런타임에 달라집니다. 이질적인 컬렉션, 기반 타입의 optional, 추상화를 완전히 숨겨야 하는 경우에 필요합니다. 연관 타입 관계가 상한 타입으로 지워지고 호출이 최적화기에 불투명해지는 비용이 있습니다.
- **`any P`에서는 연관 타입을 받는 메서드를 호출할 수 없습니다.** 결과 타입을 지우는 생산 위치에서는 동작하지만 소비 위치에서는 동작하지 않습니다. 해결책은 existential을 `some P`를 받는 함수에 전달하는 것입니다. 컴파일러가 값을 unbox하면 해당 범위 안의 타입이 다시 고정됩니다.
- **제약된 existential과 opaque type** — `some Collection<Element>`, `any Collection<any Animal>` — 은 요소 타입을 공개하면서도 `LazyFilterSequence<[Animal]>`를 숨길 수 있습니다. 자체 프로토콜(`protocol Container<Item>`)에 기본 연관 타입을 선언할 때는 `Iterator` 같은 구현 세부 정보가 아니라 호출자가 실제로 넘기는 타입을 기준으로 합니다.
- **`where` 절의 동일 타입 요구 사항**으로 프로토콜 간 관계를 고정합니다(`where Self.CropType.FeedType == Self`). 이 조건이 없으면 “재배한 다음 수확하기”가 타입 검사되지 않거나 잘못된 준수가 컴파일될 수 있습니다.

---

## 8. API 설계 — 사용하는 위치에서의 명료함

사용하는 순간의 명료함은 다른 어떤 목표보다 중요합니다.

- **Swift만 사용하는 API에는 타입 접두사를 붙이지 않습니다.** 모듈이 이름 충돌을 구분합니다. Objective-C API를 닮아야 할 때만 접두사를 유지합니다. 다만 특정 프레임워크의 너무 일반적인 이름은 맥락 없이 읽기 어렵고 수동 구분을 요구하므로 피합니다.
- 비동기 대안이나 결과를 바로 반환하는 API에서 앞의 **`get`을 생략합니다.** `getPersistentPosts`가 아니라 `persistentPosts`입니다.
- **접근 제어는 문서입니다.** `private`(파일), `internal`(모듈, 기본값), `package`, `public`. 경계를 명시하면 위에서 다룬 sendability와 API 진화 결정을 하게 됩니다.
- **불가능한 상태는 표현할 수 없도록 모델링합니다.** `private` setter와 검증하는 변경 메서드, 닫힌 값 집합을 위한 enum, `String` 대신 강한 타입의 `UUID`를 사용합니다.
- **Property wrapper**는 접근 정책(`@Argument`, `@Published`, 방어적 복사, 지연, 스레드 로컬)을 캡슐화해 선언 위치에서 정책을 한 단어로 표현합니다. key path의 `@dynamicMemberLookup`과 함께 쓰면 wrapper를 통해 속성을 투영할 수 있습니다(`$binding.title`이 그런 방식입니다).
- 선언형 DSL에는 **result builder**를 사용하고, 컴파일러가 작성할 수 있는 반복 코드를 없애는 경우에만 **매크로**를 사용합니다(§12).

---

## 9. 성능 — 측정한 뒤 선택

낮은 수준의 Swift 성능은 네 가지 비용이 좌우합니다. 현재 어느 비용을 지불하는지 파악합니다.

1. **함수 호출** — 인수 복사, 정적 / 동적 디스패치, 호출 프레임 할당, 최적화 방해.
2. **메모리 배치** — 인라인 또는 별도 저장소, 동적으로 크기가 정해지는 타입.
3. **할당** — 전역(무료), 스택(빠름: 뺄셈 한 번), 힙(느림: 검색과 잠금 필요).
4. **복사** — retain/release와 재귀적 구조체 복사.

**하지만 먼저 알고리즘을 개선합니다.** 루프를 작성할 때마다 알고리즘 호출로 바꿀 수 있는지 확인합니다. 큰 성능 향상은 거의 항상 미세 최적화가 아닙니다.

- **호출하는 작업의 복잡도를 파악합니다.** `Array.remove(at:)`은 O(n)이므로 루프 안에서 호출하면 O(n²)입니다. `removeAll(where:)`은 전체 O(n)입니다. `Data`를 바이트마다 다시 잘라 만들어도 O(n²)이고 `popFirst()`는 O(1)입니다. 깔끔해 보이는 코드에 숨은 이런 문제가 성능을 100배 이상 떨어뜨리기도 합니다.
- **`map`/`flatMap`/`filter`를 연이어 호출하면 단계마다 배열을 할당합니다.** 우아함이 곧 빠르다는 뜻은 아닙니다. 핫 루프에서 픽셀이나 요소마다 처리한다면 결과 크기를 한 번 정하고 그 안에 기록합니다.
- **그다음 프로파일링합니다.** Instruments의 Time Profiler와 Allocations를 _테스트_에 적용합니다(테스트의 실행 버튼을 보조 클릭해 Profile 선택). 그래야 필요한 코드만 정확히 측정할 수 있습니다. flame graph를 `platform_memmove`가 차지하면 의도치 않은 복사를 뜻하고, 임시 할당이 백만 개면 중간 배열이 많다는 뜻이며, `swift_beginAccess`는 런타임 독점성 검사, `swift_retain` / `swift_release`는 참조 카운팅 작업이 많다는 뜻입니다.

**효과가 큰 순서로 대략 정리한 구체적인 방법:**

- **상속을 고려하지 않는 클래스에는 `final`을 붙입니다.** 동적 디스패치를 정적으로 바꿔 인라이닝을 허용합니다. 많은 경우 whole-module optimization이 이를 증명하고 제네릭 특수화도 활성화합니다. 제네릭도 이때 비용이 사라집니다.
- **구조체 저장은 인라인, 클래스 저장은 별도 저장소에 위치합니다.** 작은 구조체는 비용이 거의 없습니다. 참조 타입 필드 세 개가 있는 큰 구조체는 복사할 때마다 retain 세 번을 수행하지만 클래스는 한 번입니다. 자주 복사한다면 copy-on-write를 사용합니다.
- **`any P` existential은 3 word 인라인 버퍼를 가집니다.** 들어가는 값은 인라인에 두고, 큰 값은 복사할 때마다 힙에 할당합니다. 큰 타입을 copy-on-write의 간접 저장소에 두면 버퍼 안에 유지할 수 있습니다.
- **동일 타입 배열 `[MyModel]`은 `[any Model]`보다 효율적입니다.** 촘촘하게 저장되고 타입 정보는 한 번만 전달하며 특수화가 가능합니다. `[any Model]`은 유연하지만 불투명하므로 필요한 경우 사용합니다.
- **제네릭 매개변수를 클래스에 제한**(`T: AnyObject`)하면 특수화가 없어도 컴파일러가 표현 방식을 알 수 있습니다.
- 고정 크기 저장소에는 Swift 6.2의 **`InlineArray<N, T>`**를 사용할 수 있습니다. 값 제네릭으로 크기가 타입에 포함되고 요소가 인라인 저장되며 힙 할당, 참조 카운팅, 고유성 / 독점성 검사가 없습니다. 복사되거나 공유되는 경우에는 적합하지 않습니다.
- Swift 6.2의 **`Span` / `RawSpan` / `OutputSpan`**은 연속 저장소에 직접 접근할 때 `withUnsafeBufferPointer`를 대체합니다. escape할 수 없으므로 컴파일러가 컨테이너에 수명을 연결합니다. 포인터 성능과 메모리 수명 안전성을 함께 얻으며 retain/release도 없어집니다.
- 중첩된 클래스에서 저장 속성을 바깥 구조체로 옮기면 런타임 독점성 검사를 줄일 수 있습니다.
- 필요성이 측정된 경우 Swift 6.3에서 제공된 **`@inline(always)`**(메서드에는 `final`도 함께 고려)와 **`@specialized(where T == ...)`**(SE-0460)로 핫패스의 구체 타입을 미리 특수화할 수 있습니다.
- Swift 6.4에서 제공될 예정(**미출시** — §15 참고): 큰 저장 값에 `get` / `set` 대신 쓰는 `borrow` / `mutate` 접근자, `UniqueArray` / `UniqueBox`, 반복 조회를 루프 바깥으로 옮기는 `Ref` / `MutableRef`.

**async 함수**는 C 스택이 아니라 task별 slab allocator에 상태를 보관하고 중단 지점마다 부분 함수로 나뉩니다. 호출 오버헤드가 약간 높지만 비용 특성은 동기 함수와 비슷합니다. await할 것이 없는 작업을 `async`로 만들지 말아야 하는 이유이기도 합니다.

**main actor로 들어오고 나가는 전환은 실제 실행 컨텍스트 전환 비용을 냅니다.** 반복마다 두 번 전환하지 말고 루프를 _`loadArticles` / `updateUI` 안으로_ 옮겨 배열 단위로 처리합니다.

---

## 10. ARC와 객체 수명

- **객체가 보장된 수명을 유지하는 시점은 중괄호가 닫힐 때가 아니라 마지막으로 사용될 때입니다.** 관찰되는 수명은 옵티마이저에 따라 달라지고 바뀔 수 있습니다. `deinit` 실행 시점을 전제로 하는 코드는 잠복 버그입니다.
- **`weak` / `unowned`는 참조 순환을 끊는 용도로만 사용합니다.** 강한 소유자가 마지막으로 사용된 뒤 `weak` 참조를 읽으면 정상적으로 `nil`일 수 있습니다. 이곳에서 optional binding을 하는 것은 force unwrap보다 **더 나쁩니다.** 크게 드러나는 충돌 대신 조용히 잘못된 값을 쓰게 됩니다.
- **`weak`보다 나은 방법은 처음부터 순환을 만들지 않는 것입니다.** 양쪽에서 참조하는 공유 데이터를 세 번째 타입으로 분리해 순환을 트리로 바꿉니다.
- 다음 방법은 **API를 재설계**해 객체가 강한 참조로만 도달 가능하게 하는 것입니다. `withExtendedLifetime`도 쓸 수 있지만 정확성 책임이 사용자에게 있고 코드베이스 전체로 번질 수 있으므로 설계가 아니라 패치로 취급합니다.
- **`deinit`의 부수 효과는 국소적으로 유지합니다.** `deinit`에서 지표를 게시하거나 전역 효과를 발생시키면 옵티마이저 동작에 따라 순서가 달라집니다. 호출 지점에서 `defer`를 사용하고 `deinit`은 검증에 남겨 둡니다.
- Xcode의 **Optimize Object Lifetimes** 빌드 설정은 관찰되는 수명을 보장된 최소치에 가깝게 줄여 이런 버그를 정확히 드러냅니다.

---

## 11. 테스트 — 기본은 Swift Testing

새 테스트에는 **Swift Testing**을 사용합니다. XCTest는 정확히 세 가지 경우에 계속 필요합니다. UI 자동화(`XCUIApplication`), 성능 지표(`XCTMetric`), Objective-C로 작성해야 하거나 Objective-C 예외를 잡아야 하는 테스트입니다.

- **어떤 함수든 `@Test`를 붙일 수 있습니다.** 전역, static, 인스턴스 메서드 모두 가능하고 `async`, `throws`, 전역 actor 격리도 지원됩니다.
- **`#expect(...)`에는 일반 표현식을 넣습니다.** `XCTAssertEqual` 계열을 외울 필요 없이 `#expect(a == b)`, `#expect(list.isEmpty)`, `#expect(!x.contains(y))`가 실패 시 하위 표현식의 값까지 수집해 표시합니다.
- **실패 시 테스트를 중단하고 옵셔널을 안전하게 해제하려면 `try #require(...)`를 사용합니다.** `continueAfterFailure = false`를 대체하며 expectation마다 적용할 수 있습니다.
- **Suite는 `struct`로 선언합니다.** 테스트 함수마다 새 인스턴스가 생겨 상태가 테스트 사이에 새지 않습니다. 설정에는 `init`을 쓰고 teardown에 `deinit`이 필요할 때만 `class` / `actor`를 사용합니다. Suite를 중첩해 그룹화할 수 있습니다.
- **복사해서 붙여 넣거나 루프를 돌리지 말고 매개변수화합니다.** `@Test(arguments: [...])`는 각 사례를 독립적으로, 병렬로 실행하고 개별 재실행도 지원합니다. 실패한 인수는 결과에 이름과 함께 표시됩니다. 인수 컬렉션 두 개를 모두 조합할 때는 전체 교차곱이 만들어집니다. 짝지은 값만 필요하면 `zip()`을 사용합니다.
- **Trait으로 의도를 표현합니다.** 조건에는 `.enabled(if:)` / `.disabled("reason")`를 사용합니다(테스트를 주석 처리하지 마세요. 비활성화된 테스트도 컴파일됩니다). 추적에는 `.bug(url)`, 파일과 타깃 사이 연결에는 `.tags(...)`, 시간 제한에는 `.timeLimit`, 병렬 실행이 실제로 불가능한 경우에는 `.serialized`를 씁니다. 테스트 라이브러리가 인식할 수 있도록 런타임 `#available` 대신 `@available`을 사용합니다.
- 통제할 수 없는 문제 때문에 테스트가 실패하면 **`withKnownIssue { }`**를 사용합니다. 테스트를 계속 컴파일하고 실행하며 문제가 고쳐졌는지도 알려 줍니다. `.disabled`와 다릅니다.
- N회 호출되는 callback은 **`confirmation`**, async 오버로드가 없는 일회성 callback은 `withCheckedContinuation`으로 확인합니다.
- **기본적으로 테스트는 무작위 순서로 병렬 실행됩니다.** 숨은 테스트 간 의존성을 찾아 주는 장점입니다. `.serialized`를 쓰기보다 의존성을 없애도록 리팩터링합니다.
- **종료 테스트** — `#expect(processExitsWith: .failure) { ... }` — 는 `precondition` / `fatalError` 경로를 격리된 하위 프로세스에서 검증합니다. macOS, Linux, FreeBSD, Windows에서 지원합니다.
- 마이그레이션할 때는 두 프레임워크가 한 타깃에서 함께 쓸 수 있으므로 점진적으로 옮기고 지금부터 새 테스트는 Swift Testing으로 작성합니다. **테스트 프레임워크 상호 운용성**(swift-testing ST-0021, Xcode 버전별 지원 확인)을 사용하면 `XCTFail`을 감싼 helper를 Swift Testing에서 호출하거나 그 반대로 할 수 있습니다. 모드는 **complete** 또는 **strict**로 설정합니다(`limited`나 `none`은 사용하지 않음). 그래야 두 프레임워크 사이의 문제가 오류로 잡히고 `Issue.record` 대안을 안내합니다.

---

## 12. 매크로

컴파일러가 대신 만들 수 있는 코드를 작성할 때만 매크로를 사용합니다.

- **매크로는 확장 전에 타입 검사를 받습니다.** 인수는 선언한 시그니처에 맞는지 확인되므로 잘못 사용하면 생성 코드 내부의 혼란 대신 호출 지점에서 명확한 오류가 발생합니다.
- **Freestanding(`#foo`)** 매크로는 표현식이나 선언을 만듭니다. **Attached(`@Foo`)** 매크로는 멤버, 피어, 접근자, 멤버 속성, 준수의 다섯 역할 중 하나로 선언을 확장합니다. 역할은 조합할 수 있습니다. `@Observable`은 멤버 + 멤버 속성 + 준수입니다.
- **매크로는 순수한 구문 트리 변환으로 테스트**합니다(`assertMacroExpansion`). 반복 속도가 가장 빠르고 아무도 읽지 않는 코드의 버그를 방지할 수 있습니다. `expansion`에 breakpoint를 두고 구문 노드에 `po`를 실행해 형태를 파악합니다.
- **매크로가 적용되지 않을 때 실제 진단을 출력합니다.** 오류를 throw하거나 정확한 위치에 경고와 fix-it을 붙이려면 `context.addDiagnostic`을 사용합니다. 컴파일되지 않는 코드를 매크로가 조용히 생성하게 두지 않습니다.
- 확장된 코드는 일반 Swift 코드입니다. 검사할 수 있고(“Expand Macro”), 디버깅하고 단계별 실행을 할 수 있습니다.

---

## 13. 로깅과 디버깅

- **`print`가 아니라 `os`의 `Logger`를 사용합니다.** 하위 시스템과 범주마다 하나씩 만듭니다. 메시지는 최적화된 형태로 보관하고 표시할 때만 렌더링하므로 로그를 남겨 두어도 충분히 저렴합니다.
- **숫자가 아닌 보간값은 기본으로 가려집니다.** 실제로 개인정보가 아닌 값에만 `privacy: .public`을 지정합니다. 값을 노출하지 않고 상관관계를 찾으려면 `.private(mask: .hash)`를 사용합니다.
- **로그 수준에 따라 보존성과 비용이 달라집니다.** `debug`(저장되지 않으며 가장 빠름. 스트리밍하지 않으면 메시지 구성까지 완전히 최적화 제거), `info`, `notice`(기본값), `error`, `fault`(가장 오래 유지되고 가장 느림). 버그 보고서에서 확인할 내용은 `error` / `fault`로 기록합니다.
- task 또는 요청 UUID 같은 **상관관계 ID**를 기록하면 재현하지 않고도 기기 로그에서 한 실패의 전체 기록을 필터링할 수 있습니다. `log collect --device --start ...`로 수집한 뒤 Console에서 하위 시스템으로 필터링합니다.
- `format:`과 `align:`은 비용이 없습니다. 로그를 읽고 열 기준으로 선택하기 쉽게 사용합니다.
- LLDB는 Swift task를 이해합니다. 스레드 사이의 `await`도 따라가고, `swift task info`에서 우선순위와 하위 작업을 확인할 수 있습니다. 이름 붙인 task는 debugger와 Instruments Swift Concurrency 템플릿에 표시됩니다.

---

## 14. Unsafe 코드와 상호 운용

- **“Unsafe”는 API가 입력을 완전히 검증할 수 없어 선행 조건 위반 시 정의되지 않은 동작이 생길 수 있다는 뜻입니다.** 프로그램이 충돌한다는 뜻은 아닙니다. 안전한 API는 의도적으로 trap을 일으킬 수 있으며, 명확한 fatal error가 안전한 결과입니다.
- **`Unsafe*Pointer`보다 `Span`을 우선합니다.** Swift 6.2부터 연속 저장소에 접근할 수 있는 안전하고 비탈출이며 속도도 같은 방식이 있습니다. 원시 포인터는 C 상호 운용에만 남겨 둡니다.
- 포인터를 써야 한다면 unsafe 영역을 가능한 한 작게 두고, 경계를 추적할 수 있게 포인터만 쓰지 말고 주소와 개수를 함께 가진 **buffer pointer**를 사용합니다. 포인터가 제공된 클로저 밖으로 나가지 않게 하고 **Address Sanitizer**를 실행합니다.
- 보안이 중요한 모듈에서는 **strict memory safety**를 활성화합니다. 모든 unsafe 사용을 소스에서 명시하게 하므로 감사를 할 수 있습니다. Swift 6.4의 `@diagnose` 속성(미출시)은 개별 함수에 적용할 수 있습니다.
- **상호 운용은 양방향이며 점진적으로 합니다.** C, Objective-C, C++ 타입을 Swift에서 직접 사용할 수 있습니다(C++ 값 의미론, Swift 컬렉션으로 매핑되는 컨테이너, `~Copyable`로 표시되는 이동 전용 타입 포함). Swift 6.3의 `@c` 속성은 Swift 함수를 다시 C에 노출합니다(선언이 헤더에 이미 있을 때는 `@implementation`). Swift를 한 번에 파일 하나씩 도입하고 전체를 다시 쓰지 않습니다.

---

## 15. 지금 사용해야 할 최신 문법

에이전트는 아래 표현을 더 오래되고 장황한 형태로 작성하는 경우가 많습니다.

**⚠ 표시가 붙은 행은 아직 출시되지 않은 Swift 6.4 기능입니다.** 현재 릴리스는 6.3.x입니다. 제안이 채택되고 main에 구현되어 계획에는 안전하지만 지금 바로 코드를 작성하기에는 이릅니다. 사용 전에 프로젝트 툴체인을 확인하고 6.3 이하 대상이면 기존 문법을 우선합니다.

| 기존 방식 | 권장 방식 | 버전 |
| --- | --- | --- |
| 중첩 삼항식, `let` 초기화를 위한 즉시 실행 클로저 | `if` / `switch` **표현식** | 5.9 |
| 인수 1개, 2개, 3개…용 오버로드 | **parameter pack**(`each T`)과 pack 순회 `for` | 5.9 |
| 모든 속성에 `ObservableObject` + `@Published` | **`@Observable`** | 5.9 |
| 변경 확인을 위해 객체를 폴링 | **`Observations { ... }`** — 트랜잭션 업데이트를 담은 `AsyncSequence` | 6.2 |
| 문자열 기반 `userInfo`를 사용하는 `NotificationCenter` | 구체적 notification 타입(`MainActorMessage` / `AsyncMessage`) | 6.2 |
| 스크립트에 `Process`와 pipe 사용 | **Subprocess** 패키지(줄 단위 출력은 `AsyncBufferSequence.strings()`; 1.0은 6.4에 출시) | 6.2+ |
| 직접 구현한 문자열 인덱스 계산 | **Swift Regex** — 간단할 때는 리터럴, 구조가 필요하면 `RegexBuilder` | 5.7 |
| 핫패스에서 크기가 고정된 `[String]` | **`InlineArray<N, T>`** | 6.2 |
| `withUnsafeBufferPointer` | **`.span`** / **`.bytes`**(`RawSpan`) / `OutputSpan` | 6.2 |
| 쓰기를 끝내려고 직접 `Task.isCancelled`를 반복 확인 | `Task` **cancellation shield** (SE-0504) | 6.4 ⚠ |
| key를 쓰려고 딕셔너리를 직접 재구성 | **`mapKeyedValues`** | 6.4 ⚠ |
| `@available(iOS ..., macOS ..., tvOS ..., watchOS ..., visionOS ...)` | **`@available(anyAppleOS ...)`** | 6.4 ⚠ |
| 타입 이름이 모듈 이름을 가릴 때 `Rocket.SaturnV` 사용 | **모듈 선택자** `Rocket::SaturnV` | 6.3 |
| 모든 경고를 일괄 오류로 취급 | 선언별 / 경고 그룹별 **`@diagnose`** | 6.4 ⚠ |
| `weak var` 때문에 `@unchecked Sendable` 적용 | `weak let`, 또는 `~Sendable`로 non-sendability 명시 | 6.4 ⚠ |
| 포인터로 바이너리 형식을 직접 파싱 | **Swift Binary Parsing**(`ParserSpan`, overflow 검사가 있는 파싱 initializer) | 6.2 |
| 불편한 테스트 함수 이름 | **raw identifier**: `` @Test func `fruits have a tropical climate`() `` | 6.0 |

추가로 알아둘 점: **Swift Regex parser는 Foundation의 실제 parser**(`.date(...)`, `.currency(...)`)와 조합할 수 있습니다. 정규식 안에서 날짜나 숫자 파싱을 직접 구현하지 마세요. 시스템 로케일을 그대로 쓰기보다 로케일을 명시합니다. 패턴이 전체 입력을 두고 backtracking하지 않도록 `NegativeLookahead`나 원자적 그룹인 `Local`을 사용합니다.

---

## 16. 기존 코드베이스를 Swift 6으로 마이그레이션

순서가 중요합니다. 단계를 섞으면 마이그레이션이 멈춥니다.

1. **먼저 새 컴파일러로 빌드합니다.** 소스 호환성 덕분에 Swift 5 모드에서는 그대로 빌드되어야 합니다.
2. **타깃마다 완전한 동시성 검사를 켭니다**(Swift 5 모드 + Swift 6 경고 모두). SDK가 이미 main actor로 주석을 단 코드가 많아 수정 효과가 큰 **UI / 앱 계층**부터 시작합니다. 그 아래 프레임워크부터 시작하지 않습니다.
3. **비용이 가장 낮은 경고부터 수정합니다.** 적은 수의 원인에서 수백 개 경고가 나올 수 있습니다. `let`이어야 할 `var` 전역 변수, `@MainActor`에 둘 자유 함수, `: Sendable`이 필요한 공개 구조체 하나 등이 대표적입니다. 한 줄 수정으로 여러 경고가 사라질 수 있습니다.
4. 작업이 유지되도록 타깃을 **Swift 6 언어 모드**로 전환합니다.
5. 다음 타깃으로 이동해 반복합니다.
6. **그 후 별도 작업으로 리팩터링합니다.** 데이터 경쟁 안전성을 켜는 작업과 대규모 리팩터링을 한꺼번에 하지 않습니다. 두 작업을 모두 되돌려야 할 수 있습니다.

엄격 검사를 다시 끄고 출시해도 괜찮습니다. 이 과정에서 적용한 수정은 모두 실질적인 개선입니다. 시작 전에 **Approachable Concurrency**와 앱 모듈의 main-actor-by-default를 켜면 오류 수가 크게 줄어듭니다. Xcode에는 변경 사항 상당수를 적용해 주는 마이그레이션 도구도 있습니다(swift.org/migration).

---

## 빠른 참조

| 필요 | 먼저 사용 | 피할 것 |
| --- | --- | --- |
| 데이터 타입 | `struct` / `enum` | 정체성이나 공유가 필요하지 않은 `class` |
| 공유 가변 상태 | `actor` 또는 `@MainActor` 클래스 | 기억해야 할 lock이 있는 `class` |
| 메인 스레드에서 작업 이동 | `@concurrent func … async` | `Task.detached`, `DispatchQueue.global()` |
| 라이브러리 API 격리 | `nonisolated` | `@MainActor`, `@concurrent` |
| 고정 개수의 병렬 작업 | `async let` | 비구조적 `Task` N개 |
| 동적 개수의 병렬 작업 | `withTaskGroup`(개수 제한) | 항목마다 작업을 만들고 무제한 실행 |
| 결과를 반환하지 않는 하위 작업 | `withDiscardingTaskGroup` | 끝까지 비우지 않는 `withTaskGroup` |
| UI 이벤트에 연결된 작업 | callback 안의 `Task { }` | callback 자체를 `async`로 만들기 |
| 데이터 경쟁 해결 | 객체 공유 중단 | `@unchecked Sendable` |
| 공유 모델 클래스 | non-`Sendable` 또는 `@MainActor` | 수동 lock을 사용하는 `Sendable` |
| `await`를 가로지르는 blocking primitive | 없음 — 구조를 바꿈 | `DispatchSemaphore`, `NSCondition` |
| 다형성 | `some P` | 저장이 필요하지 않은 `any P` |
| 이질적 컬렉션 | `[any P]` | 클래스 계층 |
| 사용자 지정이 없는 공유 동작 | 제약된 `extension` | 새 프로토콜 |
| 사용자 지정 지점 | 프로토콜 **requirement** | extension에만 정의된 메서드 |
| 참조 순환 해소 | 트리 구조로 재설계 | `weak` + `withExtendedLifetime` |
| 일치 항목 삭제 | `removeAll(where:)` — O(n) | 루프에서 `remove(at:)` — O(n²) |
| 연속 메모리에 직접 접근 | `.span` | `withUnsafeBufferPointer` |
| 핫패스의 고정 크기 버퍼 | `InlineArray<N, T>` | `Array` |
| 새 테스트 | `@Test` + `#expect` | `XCTestCase` + `XCTAssertEqual` |
| 여러 입력으로 같은 테스트 실행 | `@Test(arguments:)` | `for` 루프 또는 복사 / 붙여넣기 |
| 실패 시 테스트 중단 | `try #require` | `continueAfterFailure = false` |
| 일시적으로 실패하는 테스트 | `withKnownIssue` | `.disabled` 또는 주석 처리 |
| 배포 코드의 진단 로그 | `Logger` + correlation ID | `print` |
| 최적화 여부 판단 | 프로파일링된 테스트를 Instruments로 분석 | 직감 |
