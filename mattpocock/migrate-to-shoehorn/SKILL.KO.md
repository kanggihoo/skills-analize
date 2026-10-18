---
name: migrate-to-shoehorn
description: 테스트 파일의 `as` 타입 단언을 @total-typescript/shoehorn으로 마이그레이션합니다. 사용자가 shoehorn을 언급하거나, 테스트에서 `as`를 대체하고 싶거나, 부분 테스트 데이터가 필요할 때 사용합니다.
---

# Shoehorn으로 마이그레이션

## 왜 shoehorn인가?

`shoehorn`을 사용하면 테스트에서 TypeScript의 타입 검사를 만족시키면서 부분 데이터를 전달할 수 있습니다. `as` 단언을 타입 안전한 대안으로 바꿔 줍니다.

**테스트 코드에서만 사용합니다.** 프로덕션 코드에서는 절대 shoehorn을 사용하지 마세요.

테스트에서 `as`를 쓸 때의 문제점:

- `as` 사용을 피하도록 학습되어 있음
- 대상 타입을 수동으로 명시해야 함
- 의도적으로 잘못된 데이터를 만들 때 이중 `as`(`as unknown as Type`)가 필요함

## 설치

```bash
npm i @total-typescript/shoehorn
```

## 마이그레이션 패턴

### 속성이 많은 큰 객체에서 필요한 속성이 적은 경우

이전:

```ts
type Request = {
  body: { id: string };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // ...속성 20개 더
};

it("gets user by id", () => {
  // body.id만 필요하지만 Request 전체를 가짜로 만들어야 함
  getUser({
    body: { id: "123" },
    headers: {},
    cookies: {},
    // ...속성 20개를 모두 가짜로 채움
  });
});
```

이후:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

it("gets user by id", () => {
  getUser(
    fromPartial({
      body: { id: "123" },
    }),
  );
});
```

### `as Type` → `fromPartial()`

이전:

```ts
getUser({ body: { id: "123" } } as Request);
```

이후:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

이전:

```ts
getUser({ body: { id: 123 } } as unknown as Request); // 의도적으로 잘못된 타입
```

이후:

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## 함수별 사용 시점

| 함수            | 사용 사례                                          |
| --------------- | -------------------------------------------------- |
| `fromPartial()` | 타입 검사를 통과하는 부분 데이터를 전달할 때       |
| `fromAny()`     | 의도적으로 잘못된 데이터를 전달할 때(자동 완성 유지) |
| `fromExact()`   | 전체 객체를 강제할 때(나중에 fromPartial로 교체 가능) |

## 작업 순서

1. **요구 사항 수집** - 사용자에게 질문:
   - `as` 단언 때문에 문제가 되는 테스트 파일은 무엇인가?
   - 일부 속성만 중요한 큰 객체를 다루고 있는가?
   - 에러 테스트를 위해 의도적으로 잘못된 데이터를 전달해야 하는가?

2. **설치 및 마이그레이션**:
   - [ ] 설치: `npm i @total-typescript/shoehorn`
   - [ ] `as` 단언이 있는 테스트 파일 찾기: `grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] `as Type`을 `fromPartial()`로 교체
   - [ ] `as unknown as Type`을 `fromAny()`로 교체
   - [ ] `@total-typescript/shoehorn`에서 import 추가
   - [ ] 타입 검사를 실행하여 검증
