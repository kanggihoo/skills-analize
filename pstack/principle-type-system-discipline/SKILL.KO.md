---
name: principle-type-system-discipline
description: "Apply when designing types, reviewing a function signature, or writing code in any statically-typed language. Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, refuse to lie to the compiler, exhaust variants, derive from authoritative schemas."
disable-model-invocation: true
---

# 타입 시스템 규율

타입 검사기는 증명 보조기다. 이것을 사용해 컴파일 시점에 불가능한 상태, 잘못 짝지어진 원시 타입, 처리되지 않은 변형을 제거한다. 타입이 무시하도록 허용하는 경우는 컴파일러가 막을 수 있었던 런타임 실패가 된다. 처리기를 늘리기보다 오류와 특수 경우를 아예 존재하지 않도록 정의하는 것을 선호한다. 표현 불가능한 상태, 전체 함수(total function), 인터페이스 재설계(아래 패턴들)가 도구다.

모든 타입 언어에 적용된다. `typescript-best-practices` 같은 스킬은 이를 특정 문법에 맞춰 구체화한다.

**패턴:**

- **불법 상태를 표현 불가능하게 만든다.** 변형을 합 타입(sum type)으로 모델링한다: TypeScript의 판별된 유니온, Rust/Swift/Kotlin의 페이로드를 가진 enum, Scala의 sealed class, Haskell/OCaml의 ADT. 모순된 조합이 컴파일되는 선택적 필드 묶음으로 상태를 모델링하지 않는다. 미묘한 안티패턴: `{ completed: boolean; completedAt?: Date }`는 `completed: true; completedAt: undefined`를 허용하는데, 이는 의미가 없다. 불리언을 `completedAt !== null` 같은 단일 출처에서 파생하거나, `{ kind: 'open' } | { kind: 'done'; at: Date }`처럼 변형을 명시적으로 모델링한다. 버그가 "잠깐, 이 조합이 실제로 가능한가?"라는 질문을 강요한다면, 그 타입은 너무 느슨하다.
- **타입은 제한이 아니라 구성이다.** 더 느슨한 타입에서 검사를 통해 잘라내지 말고, 원하는 값으로부터 타입을 쌓아 올린다. 정제 타입(refinement type)이 필요해 보이는 불변식은 대개 구성 한 단계 거리에 있다. 비어 있지 않은 리스트는 길이 검사가 있는 리스트가 아니라 head와 rest다. 유효한 시간 범위는 두 개의 타임스탬프를 순서대로 유지해야 하는 것이 아니라 시작 시각과 기간이다. 특권적인 표현은 없다. 짝의 리스트도 그렇게 해석하면 짝수 길이 리스트다. 따라서 불법 값을 만들 수 없는 형태를 고르고, 호출자가 필요로 하는 인터페이스를 그 위에 노출한다.
- **의미를 가진 원시 타입에 브랜드를 붙인다.** `UserId`와 `OrderId`는 내부적으로 문자열이지만 서로 바꿔 쓸 수 없어야 한다. Rust의 newtype, Swift의 opaque type, Kotlin의 value class, Haskell의 phantom type, TypeScript의 브랜드 교차 타입. 생성 시점에 한 번 검증하고, 이후에는 타입을 신뢰한다.
- **외부 데이터는 파싱되기 전까지 타입이 없다.** RPC 페이로드, JSON, IPC 메시지, CLI 인자, 설정 파일, 환경 변수, 데이터베이스 행. 모든 경계에 비구조화된 입력을 타입 모델로 바꾸는 파싱 함수를 둔다. 검증을 어디에 둘지는 **boundary-discipline** 원칙 스킬을 참고한다.
- **타입 시스템을 속이지 않는다.** 캐스트, 안전하지 않은 강제 변환, 컴파일러를 우회하는 단언 함수는 잠재적 런타임 충돌이다. 컴파일러가 사실을 증명할 수 없다면, 증명하거나(검증, 좁히기, 모델 정제) 그 캐스트가 위험 요소임을 받아들인다.
- **완전한 매칭은 컴파일러의 일이다.** 합 타입에 대해 매칭할 때, 새 변형이 추가되었는데 처리되지 않으면 컴파일러가 실패해야 한다. 언어가 제공하는 관용구를 사용한다: TypeScript의 `never` 타입 바인딩, Rust의 주석 없는 `match`, Haskell의 `-Wincomplete-patterns`, Kotlin의 sealed class 매치 완전성.
- **권위 있는 스키마에서 타입을 파생한다.** 프로토콜 버퍼, OpenAPI 명세, GraphQL 스키마, 데이터베이스 마이그레이션, 디자인 시스템 토큰 파일이 형태를 정의하면, 병렬 타입을 손으로 만들지 말고 그것에서 파생한다. **encode-lessons-in-structure** 원칙 스킬을 참고한다.
- **부분성이 나타나는 곳에서만 타입을 강화한다.** 런타임 단언, null 검사, "이런 일은 일어나지 않아야 한다"는 throw는 타입이 너무 약한 지점을 표시한다. 그 검사를 타입으로 끌어올린다. 그리고 거기서 멈춘다. 타입 시스템의 역할은 각 사용 지점이 처리해야 하는 경우를 추적하는 것이지, 데이터를 가능한 한 정밀하게 묘사하는 것이 아니다. 전체 함수를 선호한다. 빈 리스트의 `sum`은 0이므로 일반 리스트를 받는다. 빈 리스트의 `head`에는 답이 없으므로 비어 있지 않은 리스트를 요구한다.

**테스트:**

- "이 필드 조합이 언제 유효한지 설명하는 주석을 쓸 수 있는가?" 그렇다면 타입이 너무 느슨하다. 합 타입으로 나눈다.
- "두 함수 인자가 같은 원시 타입을 공유하는데 의미가 다른가?" 브랜드를 붙인다.
- "이 `any`, 이 `as`, 이 `assertNotNull`은 어디서 왔는가?" 경계까지 추적해서 거기서 검증한다.
- "다음 달 새 변형이 추가되면, 컴파일러가 다음 에이전트에게 케이스를 어디에 추가해야 하는지 알려 줄 것인가?" 아니라면 매칭이 완전하지 않다.
- "이 타입이 다른 파일이 소유한 형태를 중복하고 있는가?" 대신 파생한다.
- "이 타입을 강화하는 이유가 연산을 전체 함수로 유지하기 위해서인가, 아니면 단지 더 정밀하게 하려는 것인가?" 아무것도 패닉하지 않는다면 일반 타입을 유지한다.
