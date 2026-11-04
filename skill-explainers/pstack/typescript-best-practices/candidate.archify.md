# typescript-best-practices 스킬은 에이전트를 어떻게 바꾸나 {#typescript-best-practices-skill}

`typescript-best-practices`를 쓰면 에이전트는 `.ts`나 `.tsx` 파일을 읽거나 고칠 때 규칙 16개를 적용한다. 이 규칙의 핵심은 잘못된 상태를 타입으로 만들 수 없게 하고, 외부 데이터는 경계에서 한 번 검증하는 것이다.[](source:table)

- 스킬 본문은 먼저 `principle-type-system-discipline` 원칙을 적용하라고 한다. 이 스킬은 그 원칙을 TypeScript 문법으로 옮긴 것이다.[](source:first)[](source:tsd)
- 에이전트는 `as` 캐스트를 검증 뒤에만 쓴다. 타입을 좁히는 방법에는 다섯 단계 우선순위가 있다.[](source:table)
- `pstack`에서 `paths:` 필드를 가진 스킬은 이 스킬 하나다. 이 스킬은 대상 파일을 `**/*.ts`, `**/*.tsx`로 선언한다.[](source:fm)
- 코드 예는 `references/patterns.md`에 있다. 규칙 16개 가운데 14개에 예가 있다.[](source:examples)[](source:pat-intro)

@answer scope="pstack/typescript-best-practices · 원본 텍스트 파일 2개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/typescript-best-practices/SKILL.md · 2684B · 본문(frontmatter)" path=pstack/typescript-best-practices/SKILL.md lines=1:6
@source first title="pstack/typescript-best-practices/SKILL.md · 원칙 먼저" path=pstack/typescript-best-practices/SKILL.md lines=10:10
@source table title="pstack/typescript-best-practices/SKILL.md · 규칙표" path=pstack/typescript-best-practices/SKILL.md lines=12:29
@source t-model title="SKILL.md · 모델링 규칙 4개" path=pstack/typescript-best-practices/SKILL.md lines=14:17
@source t-check title="SKILL.md · 검증과 좁히기 규칙" path=pstack/typescript-best-practices/SKILL.md lines=18:26
@source t-conv title="SKILL.md · 인자, 테스트, 로그 규칙" path=pstack/typescript-best-practices/SKILL.md lines=27:29
@source examples title="pstack/typescript-best-practices/SKILL.md · 예시 위치" path=pstack/typescript-best-practices/SKILL.md lines=31:31
@source pat title="pstack/typescript-best-practices/references/patterns.md · 9214B · 규칙별 코드 예" path=pstack/typescript-best-practices/references/patterns.md lines=1:324
@source pat-intro title="patterns.md · 도입부" path=pstack/typescript-best-practices/references/patterns.md lines=1:3
@source pat-brand title="patterns.md · Branded types" path=pstack/typescript-best-practices/references/patterns.md lines=5:22
@source pat-du title="patterns.md · Discriminated unions" path=pstack/typescript-best-practices/references/patterns.md lines=28:37
@source pat-du-name title="patterns.md · 판별 필드 이름" path=pstack/typescript-best-practices/references/patterns.md lines=39:39
@source pat-cons title="patterns.md · Constructive modeling" path=pstack/typescript-best-practices/references/patterns.md lines=41:84
@source pat-total title="patterns.md · Simplest total type" path=pstack/typescript-best-practices/references/patterns.md lines=96:106
@source pat-total-alt title="patterns.md · 다른 total 시그니처" path=pstack/typescript-best-practices/references/patterns.md lines=108:108
@source pat-unknown title="patterns.md · 외부 데이터 목록" path=pstack/typescript-best-practices/references/patterns.md lines=128:128
@source pat-schema title="patterns.md · Schemas before hand-rolled guards" path=pstack/typescript-best-practices/references/patterns.md lines=130:149
@source pat-as title="patterns.md · as 제거 원인" path=pstack/typescript-best-practices/references/patterns.md lines=175:188
@source pat-narrow title="patterns.md · Narrowing hierarchy" path=pstack/typescript-best-practices/references/patterns.md lines=192:198
@source pat-exh title="patterns.md · Exhaustiveness" path=pstack/typescript-best-practices/references/patterns.md lines=219:255
@source pat-boundary title="patterns.md · Boundary validation" path=pstack/typescript-best-practices/references/patterns.md lines=270:276
@source pat-args title="patterns.md · Object args 예외" path=pstack/typescript-best-practices/references/patterns.md lines=324:324
@source tsd title="pstack/principle-type-system-discipline/SKILL.md · 언어별 구체화" path=pstack/principle-type-system-discipline/SKILL.md lines=11:11
@source bd title="pstack/principle-boundary-discipline/SKILL.md · description" path=pstack/principle-boundary-discipline/SKILL.md lines=3:3
@source pm-tsd title="pstack/poteto-mode/SKILL.md · 경계·타입 원칙 조건" path=pstack/poteto-mode/SKILL.md lines=58:59
@source help-ts title="pstack/poteto-help/SKILL.md · 상황별 스킬 표" path=pstack/poteto-help/SKILL.md lines=71:71
@source sy-paths title="pstack/reflect/references/synthesizer.md · 남길 패턴 예" path=pstack/reflect/references/synthesizer.md lines=34:34

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 그래서 사용자가 `/typescript-best-practices`를 입력하면 켜진다. `poteto-help`는 "`.ts`나 `.tsx` 작업에 TypeScript 규칙을 적용할 때" 쓰라고 안내한다.[](source:help-ts)

`paths:` 필드는 이 스킬이 다루는 파일을 경로 패턴으로 적는다. `reflect`의 종합 담당 프롬프트도 "path-shaped triggers belong in `paths:`, not description prose"를 남길 패턴으로 든다.[](source:sy-paths) 판정: 저자는 `paths:`를 경로 기반 트리거로 쓰려고 넣었다. 다만 `paths:`와 `disable-model-invocation: true`가 함께 있을 때 실행 환경이 이 스킬을 자동으로 붙이는지는 원문에 명시 없음.[](source:fm)

`pstack` 안에서 이 스킬을 직접 부르는 스킬은 없다. `principle-type-system-discipline`이 이 스킬을 "특정 문법으로 구체화하는 스킬"의 예로 든다(r97).[](source:tsd) `poteto-mode`는 타입이나 시그니처를 설계할 때 그 원칙을 꺼낸다.[](source:pm-tsd)

## 어떤 규칙을 적용하나 {#rules}

**잘못된 상태를 만들 수 없게 모델링한다.**

| 규칙 | 에이전트가 하는 일 | 예외·조건 |
| --- | --- | --- |
| 판별 유니온(Discriminated unions) | 변형마다 `kind` 같은 리터럴 판별 필드를 둔다. 선택 필드 묶음을 쓰지 않는다[](source:t-model) | 판별 필드 이름(`kind`, `type`, `tag`)은 하나로 정해 지킨다[](source:pat-du-name) |
| 브랜드 타입(Branded types) | `& { readonly __brand: "X" }`로 원시 값을 구분한다. 경계에서 한 번 검증한다[](source:t-model) | 이 모양을 그대로 쓰고 새 관례를 만들지 않는다[](source:pat-brand) |
| 구성으로 모델링 | 잘못된 값이 아예 만들어지지 않는 모양을 고른다. 비어 있지 않은 배열은 `[T, ...T[]]`, 짝수 길이는 `[T, T][]`, 기간은 `start`와 `duration`[](source:t-model) | 런타임 검사나 정제 타입에 기대지 않는다. `durationMs`는 원시 숫자가 섞일 위험이 있을 때만 브랜드를 붙인다[](source:pat-cons) |
| 가장 단순한 total 타입 | 모든 연산이 total이면 `T[]`를 그대로 둔다[](source:t-model) | `!`, 캐스트, "should never happen" `throw`가 생기는 곳에서만 `NonEmpty<T>`로 강화한다[](source:pat-total) |

**외부 데이터는 경계에서 검증하고, 안에서는 타입을 믿는다.**

| 규칙 | 에이전트가 하는 일 | 예외·조건 |
| --- | --- | --- |
| `unknown` over `any` | 외부 데이터는 `unknown`으로 받고 좁힌 뒤 쓴다[](source:t-check) | 외부: RPC 페이로드, `JSON.parse`, `postMessage`, IPC, 파일 내용, 환경 변수, DB 결과[](source:pat-unknown) |
| 가드보다 스키마 | 속성별 타입 가드를 직접 쓰기 전에 저장소의 런타임 스키마 라이브러리를 쓰고 타입을 추론한다(`z.infer`)[](source:t-check) | 실패가 예상된 분기면 `safeParse`. 가드 하나 때문에 새 스키마 의존성을 넣지 않는다[](source:pat-schema) |
| `as` 금지 | `as`를 런타임 충돌 위험으로 본다. 검증 뒤에만 쓴다[](source:t-check) | `as`를 없앨 때 추론 실패 원인 4가지를 먼저 찾는다(아래)[](source:pat-as) |
| 좁히기 우선순위 | 판별 필드 switch → `in` → `typeof`·`instanceof` → 사용자 정의 가드 → `as`[](source:t-check) | 뒤로 갈수록 최후 수단이다[](source:pat-narrow) |
| 타입 가드 | 주장을 실제로 검증한다. 이름은 `isX`, `hasX`[](source:t-check) | 거짓말하는 가드는 `as`보다 나쁘다. 버그가 안전해 보이는 이름 뒤에 숨기 때문이다 |
| 빠짐없는 분기 검사 | `default` 갈래에 `const _exhaustive: never = x;`를 둔다. 새 변형이 생기면 컴파일러가 막는다[](source:t-check) | 값을 돌려주는 `switch`는 `return`, 문장형 `switch`는 `void`로 쓴다[](source:pat-exh) |
| `satisfies` over `as` | 리터럴 타입을 넓히지 않고 값을 검증한다[](source:t-check) | - |
| 경계 검증 | 데이터가 들어오는 곳에서 이름 있는 도메인 타입으로 파싱한다. `Record<string, unknown>`은 그 파싱에서 멈춘다[](source:t-check) | 와이어 형식은 `ignoreUnknownFields`로 파싱한다. 저장된 JSON 데이터는 버전을 붙이고 파싱을 `try/catch`로 감싼다. 호출 깊은 곳에서 다시 검증하지 않는다[](source:pat-boundary) |
| 스키마에서 파생한 타입 | 새 interface 전에 `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof`를 쓴다[](source:t-check) | `.proto`, OpenAPI, GraphQL, DB 마이그레이션이 이미 정한 모양은 생성된 타입에서 파생한다 |

**코드 관례.**

| 규칙 | 에이전트가 하는 일 | 예외·조건 |
| --- | --- | --- |
| 객체 인자 | 위치 인자 대신 객체를 넘겨 순서를 스스로 드러낸다[](source:t-conv) | 핫 패스(프레임마다 렌더, 토크나이저, 파서, 할당 비용이 큰 루프)에서는 쓰지 않는다[](source:pat-args) |
| 실제 테스트 | 돌릴 수 있는 것은 가짜(mock)로 바꾸지 않는다. 프레임워크의 실제 테스트 도구와 누수 검사를 쓰고, UI는 실행 중인 빌드에서 확인한다[](source:t-conv) | 로컬에서 못 돌리는 것만 가짜로 바꾼다. patterns.md에 예 없음 |
| 구조화된 로그 | id만으로 디버깅할 수 있는 맥락을 담은 구조화 로거를 쓴다[](source:t-conv) | 배포 코드에 `console.log` 금지. patterns.md에 예 없음 |

`as`를 없앨 때 에이전트가 찾는 원인은 네 가지다.[](source:pat-as)

- 판별 필드가 없다. 하나 더하고 판별 유니온으로 바꾼다.
- 원본 타입이 너무 넓다(예: `Record<string, unknown>`). 좁힌다.
- 경계에 타입이 없다. 그 모양을 가진 스키마로 파싱한다. 스키마가 없을 때만 더한다.
- 정말 표현할 수 없다. 브랜드 타입이나 `satisfies`를 쓴다.

## 코드는 어떻게 달라지나 {#examples}

선택 필드 묶음을 판별 유니온으로 바꾸는 예다. 고치기 전 모양은 "loading인데 error도 있는" 상태를 허용한다.[](source:pat-du)

@code source=pat-du language=ts

느슨한 배열이 `!`를 부르는 곳에서만 입력 타입을 강화하는 예다.[](source:pat-total) 결과를 `Session | undefined`로 약하게 하는 것도 원문은 다른 total 시그니처로 인정한다.[](source:pat-total-alt)

@code source=pat-total language=ts

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/patterns.md`. 두 파일 모두 원본이다.
- 관계 확인용으로 읽은 줄: 위 출처 목록의 다른 스킬 줄. 각 줄만 확인했다.
- 제외한 파일: `SKILL.KO.md`, `references/patterns.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 이 페이지의 동작은 모두 원문이 지시한 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`paths:`와 `disable-model-invocation: true`가 함께 있을 때, 경로에 맞는 파일을 열면 Cursor 환경이 스킬을 붙이는지는 원문에 명시 없음.[](source:fm)
patterns.md는 "Code examples for each rule"이라고 적지만, "Real tests"와 "Structured telemetry"에는 절이 없다.[](source:pat-intro)[](source:t-conv)
`SKILL.md`는 `principle-type-system-discipline`을 먼저 적용하라고 하고, `principle-boundary-discipline`을 참고하라고 한다. 관계 원장에는 이 스킬에서 나가는 두 관계가 없다.[](source:first)[](source:bd)
