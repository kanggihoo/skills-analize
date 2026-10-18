# TypeScript 패턴

`SKILL.md`의 각 규칙에 대한 코드 예시다. 기저 원칙은 언어에 독립적이다. **type-system-discipline**과 **boundary-discipline** 원칙 스킬을 참고한다.

## Branded types

원시 타입을 브랜드로 구분해 섞이지 않게 한다. 경계에서 한 번 검증한다. 하류 코드는 타입을 신뢰한다.

```ts
type AgentId = string & { readonly __brand: "AgentId" };

function parseAgentId(input: string): AgentId {
  if (!isUUID(input)) throw new Error(`Invalid agent id: ${input}`);
  return input as AgentId;
}

function focusAgent(id: AgentId): void {
  /* input is trusted */
}
```

`readonly __brand: 'X'` 형태에 맞춘다. 새로운 관례를 만들어 내지 않는다.

## Discriminated unions

변형을 리터럴 판별자로 모델링한다. 모든 변형이 같은 필드 이름을 공유하고 각 변형의 값이 고유하므로, 모순되는 조합은 표현할 수 없다.

```ts
// Don't. Boolean + optionals lets contradictory states exist.
type DiffState = { loading: boolean; diff?: GitDiff; error?: string };

// Do. Only valid states exist.
type DiffState =
  | { kind: "loading" }
  | { kind: "ready"; diff: GitDiff }
  | { kind: "error"; error: string };
```

판별자 이름은 하나(`kind`, `type`, `tag`)를 정해 고수한다.

## Constructive modeling

느슨한 타입을 런타임 검사로 제한하는 대신, 모두 합법적인 부품으로 타입을 만든다.

비어 있지 않음, 가변 튜플로:

```ts
type NonEmpty<T> = [T, ...T[]];

// Don't: T[] plus a length check every caller must repeat
function pickWinner(entries: string[]): string {
  if (entries.length === 0) throw new Error("no entries");
  return entries[Math.floor(Math.random() * entries.length)];
}

// Do: an empty value of the type can't exist
function pickWinner(entries: NonEmpty<string>): string {
  return entries[Math.floor(Math.random() * entries.length)];
}
```

일반 `T[]`가 들어올 때는 가드로 한 번 좁힌다. 그러면 그 사실이 타입을 따라다닌다.

```ts
const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0;
```

짝수 길이, 쌍으로:

```ts
type Pairs<T> = [T, T][];
```

시간 범위, 시작 시각과 길이로:

```ts
// Don't: a comment holds the invariant
type TimeRange = { start: Date; end: Date }; // start <= end

// Do: a negative range can't be written; derive end when needed
type TimeRange = { start: Date; durationMs: number };
```

`durationMs`는 평범한 number로 둔다. 원시 숫자가 기간이 필요한 자리에 잘못 전달될 수 있을 때만 브랜드를 붙인다(Branded types 참고). 습관으로 붙이지 않는다. 잘못된 상태를 구성할 수 없게 만드는 표현을 고르고, 필요한 읽기 방식을 그 위에 얹는다(`pairs.flat()`, `rangeEnd()` 헬퍼).

## Simplest total type

모든 것을 강화하지 않는다. 모든 연산이 전체 함수일 때는 `T[]`를 유지한다.

```ts
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0); // [] is 0, fine
```

느슨한 타입이 사용처에서 거짓말을 강요할 때 강화한다. 신호는 `!`, `arr[0] as T`, "should never happen" 던지기다.

```ts
// Don't: partiality smuggled past the compiler
function newestSession(sessions: Session[]): Session {
  return sessions.at(0)!;
}

// Do: strengthen the input; the assertion disappears
function newestSession(sessions: NonEmpty<Session>): Session {
  return sessions[0];
}
```

결과를 `Session | undefined`로 약화하는 것이 다른 전체 시그니처다.

## `unknown` over `any`

외부 데이터는 항상 `unknown`이다. 사용하기 전에 좁힌다.

```ts
// Don't
function handle(input: any) {
  return input.foo.bar;
}

// Do
function handle(input: unknown) {
  if (typeof input === "object" && input !== null && "foo" in input) {
    // narrowed; compiler verifies access
  }
}
```

외부 출처에는 RPC 페이로드, `JSON.parse`, `postMessage`, IPC, 파일 내용, 환경 변수, 데이터베이스 결과가 포함된다.

## Schemas before hand-rolled guards

외부 데이터에 대해 속성마다 타입 가드를 쓰기 전에, 저장소의 런타임 스키마 라이브러리와 기존 스키마를 찾는다. 하나의 스키마가 검증을 소유하게 하고, TypeScript 타입은 그 스키마에서 파생시킨다. 스키마, 중복 인터페이스, 가드가 서로 어긋날 수 있게 두지 않는다.

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): User {
  return UserSchema.parse(input);
}
```

실패가 예상된 분기일 때는 `safeParse`를 쓴다. 저장소가 다른 스키마 라이브러리를 쓴다면 그에 상응하는 추론 헬퍼를 쓴다. 가드 하나를 위해 새 스키마 의존성을 추가하지 않는다. 이 규칙은 코드베이스가 이미 신뢰하는 스키마 시스템을 선호한다.

## No `as` casts

모든 `as`는 잠재적인 런타임 크래시다. 타입 시스템이 주장을 검증한 뒤에만 캐스트한다.

```ts
import { z } from "zod";

// Don't
const user = data as User;

// Don't
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "id" in data;
}

// Do
const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>;

function parseUser(data: unknown): User {
  return userSchema.parse(data);
}
```

타입이 먼저 있을 때는 검증기에 그 타입을 주석으로 붙인다. 그러면 컴파일러가 타입보다 덜 증명하는 검증기를 거부한다. 아래 객체에서 `name`을 빼면 할당이 컴파일되지 않는다.

```ts
type User = { id: string; name: string };

const userSchema: z.ZodType<User> = z.object({ id: z.string(), name: z.string() });
```

기존 코드에서 `as`를 없앨 때는 TypeScript가 왜 추론하지 못하는지 확인한다.

- 판별자가 없다: 하나를 추가하거나 판별 유니온으로 바꾼다.
- 원천 타입이 너무 넓다(예: `Record<string, unknown>`): 좁힌다.
- 타입이 없는 경계: 형태를 소유한 스키마로 파싱한다. 스키마가 없는 곳에만 스키마를 추가한다.
- 정말로 표현할 수 없다: 브랜드 타입이나 `satisfies`를 쓴다.

## Narrowing hierarchy

가장 좋은 것부터 최후의 수단까지:

1. **Discriminated union switch / if.** 컴파일러가 자동으로 좁힌다.
2. **`in` operator.** `"key" in obj`는 그 키를 가진 변형으로 좁힌다.
3. **`typeof` / `instanceof`.** 원시 값과 클래스 인스턴스에 쓴다.
4. **User-defined type guard.** 위의 것만으로 부족할 때 쓴다.
5. **`as` cast.** 검증 후에만 쓴다.

```ts
function area(s: Shape): number {
  if ("radius" in s) return Math.PI * s.radius ** 2; // narrowed to circle
  return s.width * s.height; // narrowed to rect
}
```

## Type guards

가드는 실제로 주장을 검증해야 한다. 거짓말하는 가드는 `as`보다 나쁘다.

```ts
function isCircle(s: Shape): s is Shape & { kind: "circle" } {
  return s.kind === "circle";
}
```

가능하면 판별자 좁히기를 선호한다.

## Exhaustiveness

기본 분기에서 판별자를 `never` 타입의 지역 변수에 할당한다.

```ts
// Value-returning switch
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.width * s.height;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

// Void switch
function handle(s: Shape): void {
  switch (s.kind) {
    case "circle":
      drawCircle(s);
      break;
    case "rect":
      drawRect(s);
      break;
    default: {
      const _exhaustive: never = s;
      void _exhaustive;
    }
  }
}
```

값을 반환하는 switch에는 return 형태를, 문장형 switch에는 void 형태를 쓴다.

## `satisfies` over `as`

`satisfies`는 리터럴 타입을 넓히지 않고 검증한다.

```ts
// Don't. Widens, loses literal types.
const config = { theme: "dark", cols: 3 } as Config;

// Do. Validates AND preserves literal types.
const config = { theme: "dark", cols: 3 } satisfies Config;
// config.theme is "dark" (literal), not string
```

## Boundary validation

데이터가 들어오는 지점에서 한 번 검증한다. 내부에서는 타입을 신뢰한다. **boundary-discipline** 원칙 스킬을 참고한다.

- **와이어 포맷**(proto, JSON-RPC): 전방 호환 변경이 구버전 클라이언트를 깨뜨리지 않도록 `ignoreUnknownFields`로 파싱한다.
- **영속 JSON:** 파싱을 try/catch로 감싼 버전이 있는 blob.
- **호출 체인 깊숙한 곳에서 다시 검증하지 않는다.**

## Schema-derived types

`.proto`, OpenAPI 명세, GraphQL 스키마, 데이터베이스 마이그레이션이 이미 형태를 정의하고 있다면, 그것을 복제하지 말고 생성된 타입에서 파생시킨다.

```ts
// Don't. Duplicate shape, drifts when the schema changes.
type CheckSummary = {
  totalCount: number;
  checks: { name: string; status: string }[];
};
function renderChecks(s: CheckSummary) {
  /* ... */
}

// Do. Derive from the generated schema type.
import type { ChecksMessage } from "<generated module>";
function renderChecks(s: Pick<ChecksMessage, "totalCount" | "checks">) {
  /* ... */
}
```

새 인터페이스를 쓰기 전에 `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof`를 찾는다.

## Object args

```ts
// Don't. Swap two args, still compiles.
openFile(uri, {
  startLineNumber: 10,
  startColumn: 1,
  endLineNumber: 10,
  endColumn: 1,
});

// Do. Order-independent, self-documenting.
openFile({
  uri,
  selection: {
    startLineNumber: 10,
    startColumn: 1,
    endLineNumber: 10,
    endColumn: 1,
  },
});
```

핫 패스에서는 건너뛴다. 프레임마다 렌더링, 토크나이저, 파서, 할당 비용이 중요한 촘촘한 루프 안이 여기에 해당한다.
