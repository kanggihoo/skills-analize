---
name: typescript-best-practices
description: TypeScript best practices. Use when reading or editing any .ts or .tsx file.
paths: ["**/*.ts", "**/*.tsx"]
disable-model-invocation: true
---

# TypeScript best practices

먼저 **type-system-discipline** 원칙 스킬을 적용한다.

| 규칙 | 요약 |
|------|---------|
| Discriminated unions | `kind` 리터럴 판별자로 변형을 모델링해, 불가능한 상태를 표현할 수 없게 한다. 선택적 필드 덩어리는 쓰지 않는다. |
| Branded types | `& { readonly __brand: "X" }`로 원시 타입에 브랜드를 붙여 섞이지 않게 한다. 경계에서 한 번 검증한다. |
| Constructive modeling | 불법 값을 만들 수 없도록 형태를 구성한다. 비어 있지 않은 값에는 `[T, ...T[]]`, 짝수 길이에는 `[T, T][]`, 범위에는 `start`와 `duration`을 쓴다. 런타임 가드가 아니며, 정제 타입에 대한 바람도 아니다. |
| Simplest total type | 모든 연산이 전체 함수(total)로 남는 동안에는 `T[]`를 유지한다. 느슨한 타입이 `!`, 캐스트, 또는 "should never happen" 던지기를 강요하는 곳에서만 `NonEmpty<T>`로 강화한다. |
| `unknown` over `any` | 외부 데이터는 `unknown`이다. |
| Schemas before guards | 속성마다 직접 타입 가드를 쓰기 전에, 저장소의 런타임 스키마 라이브러리를 쓰고 `z.infer` 같은 방식으로 스키마에서 타입을 추론한다. |
| No `as` casts | 모든 `as`는 기다리는 런타임 크래시다. 검증 후에만 캐스트한다. |
| Narrowing hierarchy | 판별자 switch > `in` 연산자 > `typeof`/`instanceof` > 사용자 정의 타입 가드 > `as`. |
| Type guards | 주장을 실제로 검증해야 한다. 거짓말하는 가드는 `as`보다 나쁘다. 안전하다고 말하는 이름 뒤에 버그가 숨기 때문이다. `isX` 또는 `hasX`로 이름 붙인다. |
| Exhaustiveness | 기본 분기에 `const _exhaustive: never = x;`를 인라인으로 두어, 새 변형이 추가되면 컴파일러가 오류를 내게 한다. |
| `satisfies` over `as` | 리터럴 타입을 넓히지 않고 값을 검증한다. |
| Boundary validation | 데이터가 들어오는 지점에서 파싱해 이름 있는 도메인 타입으로 만든다. `Record<string, unknown>`(어떻게 표기되든)은 그 파싱에서 멈춘다. 내부에서는 타입을 신뢰한다. **boundary-discipline** 원칙 스킬을 참고한다. |
| Schema-derived types | 새 인터페이스를 선언하기 전에 `Pick`/`Omit`/`Parameters`/`ReturnType`/`Awaited`/`typeof`를 찾는다. |
| Object args | 위치 인자 대신 객체를 넘겨, 인자 순서가 그 자체로 문서가 되게 한다. 핫 패스(프레임마다 렌더, 토크나이저, 파서)에서는 건너뛴다. |
| Real tests | 실행할 수 있는 것은 모킹하지 않는다. 누수와 disposable 검사를 갖춘 프레임워크의 실제 테스트 기본 요소를 선호하고, 실행 중인 빌드에서 UI를 검증한다. 로컬에서 실행할 수 없는 것만 모킹한다. |
| Structured telemetry | id로 디버깅할 수 있을 만큼 맥락을 담은 구조화된 로거 진단을 선호한다. 배포되는 코드에는 `console.log`를 두지 않는다. |

예시: `references/patterns.md`.
