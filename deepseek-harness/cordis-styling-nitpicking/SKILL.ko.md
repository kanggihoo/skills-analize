---
name: cordis-styling-nitpicking
description: DeepSeek Harness의 Cordis 플러그인과 entrypoint에서 도달 가능한 helper를 리뷰할 때(pull request 포함), 그리고 집중된 lifecycle 감사를 할 때 사용한다. singleton 상태, 되돌려지지 않은 side effect, 소비자가 끝나기 전에 해제된 cleanup 의존성을 확인하고, 소유권 증거와 결정적 검증이 뒷받침되는 P0 발견만 보고한다.
---

# Cordis 소유권과 Lifecycle 감사

이 스킬은 Cordis 소유권과 lifecycle에 대한 집중된 의미 리뷰다. 저장소 감사는 exported plugin entrypoint(`apply` 또는 Cordis가 호출하는 구체적인 default export)에서 시작하고, 그 루트들에서 도달 가능한 모듈 초기화, 등록된 service, listener, effect, disposer, 전이적 호출을 추적한다. 관련 없는 helper, 빌드 도구, CLI 경로, 테스트는 발견 대상에서 제외한다. 동작을 확인하려고 테스트와 vendored Cordis를 읽되, 생성된 결함은 소유 source에 보고한다. 이 스킬 아래에서는 vendored 코드의 결함을 보고하지 않는다.

## 근거 문서

- [저장소 규약](../../../AGENTS.md): Cordis 소유권 요구사항.
- [Lifecycle과 effect](../../../docs/cordis-tutorial/02-lifecycle-and-effects.md): effect 획득과 해제.
- [Service](../../../docs/cordis-tutorial/03-services.md): 의존성 추적과 service 가용성.
- [방어 패턴](../../../docs/defensive-patterns/general.md): 정지 상태 teardown과 필수 완료 listener.

## 리뷰 절차

1. 요청된 플러그인 루트에서 도달 가능한 가변 소유자, 등록, 리소스 획득, 작업 admission을 찾는다. 범위가 크면 독립된 디렉터리 스캔을 한 뒤, 같은 소비자와 리소스가 얽힌 발견을 합친다.
2. 실제 context를 따라 소유권을 추적한다. 추적 가능한 service 메서드에서 `this.ctx`는 호출자의 context다. 각 effect의 소유자와 그것을 해제하는 disposer를 찾는다.
3. 모든 await를 지나 cleanup을 마지막 service 호출, 발행된 이벤트, 확인된 작업, durable write까지 추적한다. abort, kill, cancellation 이후에 수행되는 간접 이벤트 전달과 cleanup도 포함한다.
4. 소비자의 완료 시점을, 필수 listener, registry, writer, connection, domain, transport가 사용할 수 없게 되는 시점과 비교한다. 현재 Cordis 구현을 확인한다. 시작 순서를 뒤집거나 의존성을 등록하는 순서만으로는 완료 순서가 증명되지 않는다.
5. 실패하는 합법적 interleaving과 관찰 가능한 영향을 확립한다. 보고하기 전에 기존 cancellation, 명시적 순서 제어, 문서화된 discard 의미를 확인한다. 가능하면 통제된 promise로 재현하고, source만으로 확인한 발견은 그렇게 정확히 표시한다.

## P0: singleton 패턴

모듈 로딩, static 필드, 전역 symbol, 숨겨진 cache, `getInstance()` accessor에서 정체성이나 수명이 오는 프로세스 전역 인스턴스 또는 가변 상태 소유자를 표시한다. weak key, 크기 제한, generation 검사, 동작을 보존하는 memoization은 모듈 수준 cache에 Cordis 소유권을 주지 않는다.

불변 scalar 상수, 순수한 frozen table, 상태 없는 함수, 명시적으로 범위가 정해진 소유자 안에서 할당된 객체는 제외한다. 필요한 경우 Cordis service와 선언되었거나 해석된 소비자 의존성을 권장한다. 더 좁은 수명에는 scoped context나 service 소유의 keyed record를 쓴다.

## P0: 되돌려지지 않은 side effect

disposal 후에도 살아 있는 effect를 남기는 소유자를 표시한다. 대상은 listener, registration, timer, watcher, 자식 fiber, process, connection, 임시 파일, subscription, ambient patch, 비동기 작업이다. cleanup이 소유 작업이 멈추기 전에 반환될 수 있다면, abort나 kill 후 완료를 기다리지 않는 것도 위반이다.

올바르게 소유된 `ctx.on()`, `ctx.plugin()`, `ctx.effect()` 등록은 이미 되돌림을 제공하므로, 호출자가 early disposer를 보관할 필요는 없다. 관리되지 않는 리소스에는 소유된 effect나 명시적으로 기다리는 cleanup이 필요하다. 의도된 durable write나 원격 변경의 롤백은 요구하지 않는다. 다만 그 작업에 쓰이는 임시 리소스와 살아 있는 리소스에는 여전히 소유자가 필요하다.

## P0: 소비자 완료 전에 해제된 cleanup 의존성

cleanup을 끝내는 데 필요한 모든 service 호출이나 이벤트 전달은 lifecycle 의존성이다. 소비자가 정착할 때까지, 최종 결과 발행과 durable write를 포함해 그 실제 리소스와 listener를 사용 가능하게 유지한다. provider의 disposal promise가 소비자보다 늦게 끝난다고 해서, 그 리소스가 자신의 cleanup 동안 살아 있었다는 증명은 되지 않는다.

현재 [fiber unload](../../../vendor/cordis/src/fiber.ts)는 형제 disposer를 동시에 시작한다. [service 철회](../../../vendor/cordis/src/reflect.ts)는 자기 disposer 안에서 의존 fiber를 기다리는 동안, 형제 리소스 closer는 이미 실행될 수 있다. `inject`를 추가하거나, 등록 순서를 뒤집거나, service 참조를 보관하는 것으로는 이 경합이 해결되지 않는다. listener가 소비자 fiber에 속해 작업의 drain과 함께 자동 unsubscribe될 수도 있다.

명시적인 소유권과 기다리는 순서를 요구한다. 새 admission을 멈추고, 이미 admission된 소비자는 의존성이 사용 가능한 동안 정리하고, 그 뒤 리소스를 drain하고 해제한다. 새 admission 거부와 이미 수락된 작업의 완료는 따로 범위를 정한다. 명시적으로 합성된 effect나, 기다리는 소비자/service child를 가진 리소스 소유 부모를 쓰고, 실제로 캡처된 disposer 식별자를 검증한다. `ctx.effect(function* ...)`는 자신이 수집한 disposer를 직렬화하지만, 독립적으로 등록된 effect를 감싸는 wrapper는 원래 effect의 소유권을 넘겨받지 못한다. 최상위 plugin generator의 yield는 일반적인 형제 disposer 직렬화를 보장하지 않는다. 실패 경로도 확인한다. cleanup 하나의 오류 때문에 필수 abort, 정착, 리소스 해제가 건너뛰어져서는 안 된다.

### 현재 우회법: yield하는 function plugin

function 스타일의 provider plugin 하나와 `ctx.effect(function* () { ... })` 하나로 service 발행과 리소스 effect를 합성한다. 등록이 반환한 정확한 disposer를 yield해 합성된 effect가 그것들의 소유권을 갖게 한다.

1. 리소스와 필수 완료 listener를 획득하고, 각 등록이 반환한 disposer를 `yield`한다. 리소스 cleanup은 `ctx.effect()`로 등록하고, 반환된 disposer도 똑같이 `yield`한다.
2. service는 마지막에 `yield ctx.provide(name, service)`로 발행한다. 역순 disposal은 service를 철회하면서, Cordis에 아직 등록된 의존 소비자를 기다린 뒤에 앞서 만든 리소스 effect를 해제한다.
3. provider에 별도의 admission gate가 필요하다면, 그 cleanup을 마지막에 yield한다. 그래야 disposal이 service를 철회하기 전에 새 admission을 멈춘다. 수락된 cleanup 작업은 소비자가 끝나는 동안 계속 사용할 수 있어야 한다.

이것은 provider 철회를 그 소비자가 여전히 등록된 상태에서 정렬하지만, 완전한 상위 소유자 종료 수정은 아니다. 소비자 disposal은 cleanup이 끝나기 전에 fiber를 registry에서 제거하므로, service 철회가 이미 disposal 중인 소비자를 놓칠 수 있다. root나 상위 소유자 disposal, 독립적으로 시작된 소비자 cleanup에서는 실제 소비자 disposal task를 명시적인 owner를 통해 보관하고 기다린 뒤에 리소스를 해제한다.

이 yield들은 plugin 자체가 generator라도 `ctx.effect()`의 합성 generator 안에 둔다. 최상위 plugin yield만으로는 현재 구현에서 disposer가 동시 형제로 남는다. 이미 등록된 disposer를 감싼 대체 wrapper를 yield하지 않는다. 원래 effect가 여전히 독립적으로 소유되어 조기에 닫힐 수 있다. 이 우회법은 캡처된 effect의 순서만 정하며, 캡처되지 않은 소비자 소유 listener를 고치지 않고 cleanup 실패를 처리하는 필요를 없애지도 않는다.

단순히 주입이 빠졌다는 이유, 소비자에 도달할 수 없는 늦은 호출이 가능하다는 이유, 선택적 알림을 의도적으로 억제한다는 이유만으로 보고하지 않는다. 필수 persistence와 완료 관찰자는 선택적 알림으로 취급하지 않는다.

회귀 테스트는 소비자를 마지막 의존성 사용 직전에 멈추고, provider나 상위 소유자의 disposal을 시작한다. 그다음 리소스와 필수 listener가 여전히 사용 가능한지 확인하고, 소비자를 풀어 준다. 실제 최종 결과와 durable 출력을 assert하고, 완료 전까지 disposal이 대기 상태인지 assert한다. provider unload와 replacement도 소비자 단독 cleanup과 함께 다룬다. 호출 횟수나 유휴 상태의 happy-path disposal만으로는 충분하지 않다.

## 보고

위의 세 규칙 중 증명된 P0 위반만 보고한다. 날카로운 소스 위치, 플러그인 루트, 소비자와 리소스 소유자, 실패하는 interleaving, 관찰 가능한 영향, 수정안, 결정적인 수용 테스트를 제시한다. 같은 실패를 구현하는 여러 위치는 하나로 합친다. 검토한 범위, 기각한 후보, 재현의 한계를 밝힌다. 패턴 검색만으로 완전한 안전성을 주장하지 않는다.

미해결 발견을 기록하라고 요청받았다면, 근거, 대안, 수용 기준, 위험, 활성 Agent Note의 supersession 검사를 담은 제안 Agent Note를 쓴다. 그렇지 않으면 발견을 직접 반환한다. 확립된 위반이 없다면, 검토한 범위에서 P0 위반을 찾지 못했다고 말하고, 중요한 증거 공백을 밝힌다. 호출자가 구조화된 출력 schema를 제공하면, 이 규칙 이름과 심각도를 그 schema와 함께 쓴다. 자동 감사를 실행하기 전에, 충돌하는 규칙 지시가 있으면 먼저 보고한다.
