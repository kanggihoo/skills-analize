---
name: principle-test-behavior-not-implementation
description: "Apply when you write, change, or keep a test. Call the code the way its users do and assert the result they observe against a literal expected value. If the test would still pass when every imported function returns undefined, rewrite the assertion or delete the test."
disable-model-invocation: true
---

# 구현이 아니라 동작을 테스트하라

테스트는 사용자가 코드를 호출하는 방식대로 호출하고, 사용자가 관찰하는 결과를 리터럴 기대값과 비교한다. 코드가 수행한 호출을 단언하거나, 코드에 들어 있는 상수를 다시 적는 테스트는 어느 쪽도 하지 않는다.

확인 방법: 테스트를 유지하기 전에, 테스트가 import한 모든 함수가 `undefined`를 반환하더라도 여전히 통과하는지 묻는다. 그렇다면 동작을 관찰하지 않는 것이므로 결함 때문에 실패할 수 없다. 단언을 다시 쓰거나 테스트를 삭제한다.

**이유:** 결함 때문에 실패할 수 없는 테스트는 CI 시간과 리뷰 주의력을 낭비하고 아무것도 잡지 못한다. 상수를 고정(pin)하는 테스트는 상수나 상수를 다시 적은 프롬프트를 누군가 수정하면 실패하므로, 그런 수정 자체를 막는다.

**모든 함수가 `undefined`를 반환해도 여전히 통과하는 다섯 가지 형태:**

- **약한 단언 또는 단언 없음.** `expect`가 없거나, `toBeDefined`, `toBeTruthy`, `not.toThrow`, `toBeInstanceOf`, `toBeGreaterThan(0)`만 있다.
- **모의 객체 또는 부재만 확인.** `toHaveBeenCalled`, `not.toHaveBeenCalled`, `toBeUndefined`, `toEqual([])`, `toHaveLength(0)`, `not.toBe(wrongValue)`만 있다.
- **자기 참조.** 기대값이 테스트 대상 코드에서 나온다: `expect(f(a)).toBe(f(a))`, `expect(parsed.url).toBe(buildUrl(...))`.
- **상수 고정.** 단언이 손으로 관리하는 상수, 설정 기본값, 테이블 행, 또는 프롬프트 문자열을 다시 적는다: `expect(LIMITS.maxTools).toBe(8)`, `expect(PROMPT).toContain("You are")`.
- **픽스처가 픽스처를 단언.** 단언이 테스트가 만든 데이터나 `beforeEach`에서 계산된 값을 읽고, 테스트 본문 안에서 대상이 실행되지 않는다.

**해결 방법:** 테스트 본문 안에서 구체적인 입력 하나로 대상을 호출하고, 리터럴 출력 또는 관찰 가능한 효과를 단언한다. 예: `expect(slugify("Hello, World!")).toBe("hello-world")`. 부재를 확인하려면 같은 테스트 안에서 다른 입력에 대한 존재를 단언한다. 상수의 경우, 값을 다시 적지 말고 하나의 입력으로 그것을 읽는 메커니즘을 테스트한다. 모의 객체의 경우, 호출되었는지가 아니라 받은 페이로드나 호출 후 상태를 단언한다. 그런 단언이 없다면 테스트를 삭제한다.

**유지할 것:** 테이블 행 전반에 걸친 관계를 검증하는 테스트(두 테이블에 존재하는 키, 존재하는 부모)와 `*.test-d.ts` 파일의 컴파일 타임 검사는 유지한다.
