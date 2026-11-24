# write-swift — 현대 Swift 코드 작성·리뷰 기준을 적용한다 {#overview}

`write-swift`는 에이전트가 Swift 코드를 작성·리뷰하거나 Swift 6으로 이전할 때, 값 타입과 정적·단일 스레드 기본값에서 출발해 프로파일링 근거가 있을 때만 동시성과 동적 기능을 쓰도록 이끄는 언어 가이드다.[](source:s-fm)[](source:s-base)

- Swift 코드 작성·리뷰·마이그레이션이나 동시성 오류, 멈춤, data race, 순환 참조, 성능 문제를 고칠 때 켜지며, 질문 없이 처음 부르면 정해진 한 줄만 답하고 대기한다.[](source:s-fm)[](source:s-init)
- 결과로 값 타입 모델, Swift 6.2+ 동시성 격리, `some` 중심 프로토콜 API, Swift Testing 테스트, 그리고 마이그레이션 단계가 반영된 코드나 리뷰가 남는다.[](source:s-val)[](source:s-conc)[](source:s-mig)
- 다른 스킬과의 관계: 조사 범위에서 확인된 연결 없음.
- 도구 체인이 Swift 6.1 이하면 Swift 6.2 동시성(`async`·`@concurrent`) 규칙을 적용하지 않고, 미출시 Swift 6.4(⚠ 표시) 문법은 도구 체인을 확인하기 전까지 함부로 쓰지 않는다.[](source:s-base)[](source:s-mod)

@answer scope="design/emilkowalski/write-swift · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/write-swift/SKILL.md lines=1:4
@source s-init title="질문 없이 첫 호출 시 응답" path=design/emilkowalski/write-swift/SKILL.md lines=8:15
@source s-base title="도구 체인 기준(6.3/6.2)과 6단계 기본 계층" path=design/emilkowalski/write-swift/SKILL.md lines=16:32
@source s-val title="§1 값 타입 모델링과 ~Copyable" path=design/emilkowalski/write-swift/SKILL.md lines=35:62
@source s-err title="§2 오류 처리와 옵셔널" path=design/emilkowalski/write-swift/SKILL.md lines=65:74
@source s-conc title="§3 Swift 6.2 동시성 진행 순서와 actor 재진입" path=design/emilkowalski/write-swift/SKILL.md lines=77:124
@source s-send title="§4 `Sendable`과 data race 해결 순서" path=design/emilkowalski/write-swift/SKILL.md lines=127:148
@source s-struct title="§5 구조적 동시성, 취소, 콜백 브리지" path=design/emilkowalski/write-swift/SKILL.md lines=151:171
@source s-ui title="§6 SwiftUI 동시성과 @Sendable 캡처" path=design/emilkowalski/write-swift/SKILL.md lines=174:187
@source s-proto title="§7 프로토콜·제네릭과 some 대 any" path=design/emilkowalski/write-swift/SKILL.md lines=190:210
@source s-api title="§8 API 설계 원칙" path=design/emilkowalski/write-swift/SKILL.md lines=213:223
@source s-perf title="§9 성능 계측과 메모리·복사 비용" path=design/emilkowalski/write-swift/SKILL.md lines=226:257
@source s-arc title="§10 ARC, 객체 수명, 순환 참조 해소" path=design/emilkowalski/write-swift/SKILL.md lines=260:268
@source s-test title="§11 Swift Testing 기본 규칙" path=design/emilkowalski/write-swift/SKILL.md lines=271:286
@source s-macro title="§12 매크로와 §13 os.Logger·§14 Unsafe·Span" path=design/emilkowalski/write-swift/SKILL.md lines=289:319
@source s-mod title="§15 현대 문법 17항목(Swift 5.7~6.4⚠)" path=design/emilkowalski/write-swift/SKILL.md lines=322:349
@source s-mig title="§16 Swift 6 코드베이스 6단계 마이그레이션" path=design/emilkowalski/write-swift/SKILL.md lines=352:364
@source s-qref title="Quick Reference 25항목 대조표" path=design/emilkowalski/write-swift/SKILL.md lines=367:396

## 어떻게 동작하나 {#flow span=12}

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 질문 없이 첫 호출 | `SKILL.md` 첫 응답 절 | 다른 정보를 미리 내지 않고 정해진 한 문장만 답한 뒤 사용자 질문을 기다린다.[](source:s-init) | 언어 의도에 맞는 현대 Swift 작성을 도울 준비가 됐다는 한 문장만 출력한다.[](source:s-init) |
| 데이터·오류 모델 설계 | `SKILL.md` 기본 계층·§1·§2·§8 | 정체성·공유·상속이 없으면 `struct`/`enum`을 쓰고, 상호 배타 상태는 `enum`으로 묶어 불법 상태를 표현 불가능하게 만든다.[](source:s-base)[](source:s-val)[](source:s-api) | 복구 가능한 오류는 연관값 `enum`으로 `throw`하고 프로그래머 실수는 `precondition`/`fatalError`로 나눈다.[](source:s-err) |
| 동시성·`Sendable`·SwiftUI | `SKILL.md` §3·§4·§5·§6 | 메인 액터 동기 실행부터 시작해 지연은 `async`/`await`, 계측된 멈춤은 `@concurrent`, 잦은 홉은 `actor` 순으로 올린다.[](source:s-conc) | 앱 모듈은 MainActor 기본 격리·라이브러리는 `nonisolated`로 두고, `visualEffect` 등 `@Sendable` 클로저는 값만 복사 캡처한다.[](source:s-conc)[](source:s-ui) |
| data race 오류 해결 | `SKILL.md` §4·§5 | `@unchecked Sendable`이나 `Task.detached`로 우회하지 않고, 공유 중단→`Sendable` 값 타입→액터 격리→`Mutex`/락 순으로 푼다.[](source:s-send)[](source:s-struct) | 고정 개수는 `async let`, 동적 자식은 `withTaskGroup`으로 제한하며 콜백 브리지 연속체는 모든 경로에서 정확히 1회 재개한다.[](source:s-struct) |
| 프로토콜·성능·ARC·테스트 | `SKILL.md` §7·§9·§10·§11 | 구체 타입 반복을 본 뒤 프로토콜로 묶고 `some P`를 기본으로 쓰며, `removeAll(where:)`·`.span`·`InlineArray`와 테스트 프로파일링을 따른다.[](source:s-proto)[](source:s-perf) | 순환 참조는 `weak` 남용 전에 공유 상태 트리로 풀고, 새 테스트는 `XCTest` 대신 `@Test`·`#expect`·`try #require`로 쓴다.[](source:s-arc)[](source:s-test) |
| 매크로·로그·현대 문법·이전 | `SKILL.md` §12~§16·Quick Reference | `print` 대신 `os.Logger`와 상관 ID를 쓰고, `Unsafe*Pointer` 대신 `Span`을 쓰며, Swift 6 이전은 UI 계층부터 6단계로 밟는다.[](source:s-macro)[](source:s-mig) | `ObservableObject` 대신 `@Observable`, `if`/`switch` 표현식 등 현대 문법을 쓰되 ⚠ 표시 6.4 기능은 `swift --version` 확인 뒤 결정한다.[](source:s-base)[](source:s-mod) |

이 스킬의 일관된 원리는 "가장 정적이고 단일 스레드이며 단순한 해법으로 시작해, 근거를 댈 수 있을 때만 동시성·참조·존재 타입(`any P`)·`Unsafe*` 비용을 산다"는 점진적 공개 계층이다.[](source:s-base) §16 마이그레이션 절에만 순서 있는 6단계가 있고, 나머지는 상황별 판단 원칙과 빠른 대조표로 구성된다.[](source:s-mig)[](source:s-qref)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(`description`). Swift 작성·리뷰·마이그레이션과 동시성·멈춤·data race·순환 참조·성능 문제 해결 시 켜진다. 호출 제한 필드는 없다.[](source:s-fm) |
| 성격 | 원칙형(언어 설계·동시성·성능 가이드). 6단계 기본 계층과 16개 영역 규칙으로 현대 Swift 기준을 적용한다.[](source:s-base) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| 없음 {#none} | - | - | 조사 범위에서 확인된 연결 없음 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 첫 응답, 6단계 기본 계층표, §1~§16 언어·동시성·성능·테스트·마이그레이션 가이드, 25행 `Quick Reference`를 담은 본문 396줄 | 스킬이 켜질 때 읽는다 | 질문 없이 첫 호출, 데이터·오류 모델 설계, 동시성·`Sendable`·SwiftUI, data race 오류 해결, 프로토콜·성능·ARC·테스트, 매크로·로그·현대 문법·이전 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 질문 없이 처음 호출될 때 | 정해진 한 문장만 답하고 대기한다. | [](source:s-init) |
| 프로젝트 도구 체인이 Swift 6.1 이하일 때 | §3의 `async`와 `@concurrent` 규칙(`NonisolatedNonsendingByDefault`)을 적용하지 않는다. | [](source:s-base)[](source:s-conc) |
| ⚠ 표시가 붙은 Swift 6.4 기능을 쓰려 할 때 | 미출시 기능이므로 `swift --version`으로 도구 체인을 확인하고 6.3 이하 대상이면 기존 문법을 우선한다. | [](source:s-base)[](source:s-mod) |
| 일반 목적 라이브러리를 설계할 때 | 앱 모듈과 달리 MainActor 기본 격리를 켜지 말고 `nonisolated` API를 기본으로 둔다. | [](source:s-conc)[](source:s-qref) |
| `await` 전후나 액터 메서드 안의 상태를 다룰 때 | `await` 사이에서 상태가 바뀔 수 있으므로 락·스레드 로컬 저장소를 유지하지 말고 동기 메서드를 트랜잭션 경계로 둔다. | [](source:s-conc) |
| data race 경고나 콜백 브리지 코드를 고칠 때 | `@unchecked Sendable`·`nonisolated(unsafe)`를 경고 억제용으로 쓰지 않으며, `withCheckedContinuation`은 모든 경로에서 정확히 1회만 재개한다. | [](source:s-send)[](source:s-struct) |
| UI 테스트·성능 계측·Objective-C 예외 테스트를 작성할 때 | Swift Testing 기본 원칙의 예외로 `XCTest`(`XCUIApplication`, `XCTMetric`, Objective-C)를 유지한다. | [](source:s-test) |
| `deinit`이나 `weak` 참조에 수명 의존 로직을 둘 때 | 최적화기가 마지막 사용 직후 해제할 수 있으므로 `deinit` 부수 효과를 피하고 호출 지점 `defer`나 트리 구조로 푼다. | [](source:s-arc) |
| 기존 코드베이스를 Swift 6로 이전할 때 | 단계를 섞거나 동시성 안전성 활성화와 대규모 리팩터링을 한 번에 합치지 않고 UI 계층부터 분리해 진행한다. | [](source:s-mig) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- §3~§6 Swift 6.2+ 동시성·`Sendable`·구조적 동시성·SwiftUI 규칙 — 맡을 개요 항목: 동시성·`Sendable`·SwiftUI · 액터 재진입성, 취소 협력, `AsyncStream` 브리지 세부가 길어서 뺐다.
- §7~§11 프로토콜·성능·ARC·Swift Testing 세부 — 맡을 개요 항목: 프로토콜·성능·ARC·테스트 · `any P` 언박싱, `Span`/`InlineArray`, Instruments 화염 그래프 지표, `@Test` 트레이트를 개요에 담지 않았다.
- §12~§16 매크로·로깅·`Unsafe`·현대 문법 17항목·6단계 마이그레이션 — 맡을 개요 항목: 매크로·로그·현대 문법·이전 · Swift 버전별 문법 대조표와 Quick Reference 25행을 뺐다.

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md` 1개(낡은 번역본).
