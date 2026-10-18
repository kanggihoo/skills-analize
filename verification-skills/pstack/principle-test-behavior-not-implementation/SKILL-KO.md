---
name: principle-test-behavior-not-implementation
description: "테스트를 작성하거나 변경하거나 유지할 때 적용한다. 코드를 사용자가 쓰는 방식 그대로 호출하고, 사용자가 관찰하는 결과를 리터럴 기대값과 비교해 assertion한다. 임포트한 모든 함수가 undefined를 반환해도 테스트가 통과한다면 assertion을 다시 쓰거나 테스트를 삭제한다."
disable-model-invocation: true
---

# Test Behavior, Not Implementation

테스트는 코드를 사용자가 쓰는 방식 그대로 호출하고, 사용자가 관찰하는 결과를 리터럴 기대값과 비교해 assertion한다. 코드가 어떤 호출을 했는지를 assertion하거나 코드가 담고 있는 상수를 다시 적는 테스트는 둘 다 하지 않는다.

검사: 테스트를 유지하기 전에, 그 테스트가 임포트한 모든 함수가 `undefined`를 반환해도 여전히 통과하는지 묻는다. 그렇다면 그 테스트는 어떤 동작도 관찰하지 않으며 결함이 있어도 실패할 수 없다. assertion을 다시 쓰거나 테스트를 삭제하라.

**이유:** 결함이 있어도 실패할 수 없는 테스트는 CI 시간과 리뷰 주의력을 소모하면서 아무것도 잡아내지 못한다. 상수 고정(constant pin)은 누군가 그 상수나 그것이 다시 적은 프롬프트를 수정할 때도 실패하므로, 그 수정을 막아 버린다.

**임포트한 모든 함수가 `undefined`를 반환해도 여전히 통과하는 다섯 가지 형태:**

- **약하거나 없는 assertion.** `expect`가 없거나, `toBeDefined`, `toBeTruthy`, `not.toThrow`, `toBeInstanceOf`, `toBeGreaterThan(0)`만 있다.
- **목(mock) 또는 부재만 확인.** `toHaveBeenCalled`, `not.toHaveBeenCalled`, `toBeUndefined`, `toEqual([])`, `toHaveLength(0)`, `not.toBe(wrongValue)`만 있다.
- **자기 참조.** 기대값이 테스트 대상 코드에서 나온다. `expect(f(a)).toBe(f(a))`, `expect(parsed.url).toBe(buildUrl(...))`.
- **상수 고정.** assertion이 손으로 관리하는 상수, 설정 기본값, 테이블 행, 프롬프트 문자열을 다시 적는다. `expect(LIMITS.maxTools).toBe(8)`, `expect(PROMPT).toContain("You are")`.
- **픽스처가 픽스처를 assertion.** assertion이 테스트가 직접 만든 데이터나 `beforeEach`에서 계산한 값을 읽으며, 본문에서 대상(subject)이 실행되지 않는다.

**해결책:** 테스트 본문 안에서 구체적인 입력 하나로 대상을 호출하고 리터럴 출력이나 관찰 가능한 효과를 assertion한다. 예: `expect(slugify("Hello, World!")).toBe("hello-world")`. 부재(absence)를 확인할 때는 같은 테스트 안에서 다른 입력에 대해 존재를 assertion한다. 상수는 값을 다시 적지 말고, 그 상수를 읽는 메커니즘을 입력 하나로 테스트한다. 목(mock)은 호출되었다는 사실이 아니라 그것이 받은 페이로드나 호출 후의 상태를 assertion한다. 그런 assertion이 존재하지 않으면 테스트를 삭제한다.

**유지하라:** 테이블 행들 사이의 관계(두 테이블에 모두 존재하는 키, 존재하는 부모)를 확인하는 테스트와, `*.test-d.ts` 파일의 컴파일 타임 검사.
