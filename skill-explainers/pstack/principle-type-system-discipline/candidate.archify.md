# principle-type-system-discipline 스킬은 에이전트를 어떻게 바꾸나 {#type-skill}

이 원칙을 적용하면 에이전트는 타입 검사기를 증명 도구로 쓴다. 불가능한 상태, 섞이면 안 되는 기본형, 처리하지 않은 변형을 컴파일 시점에 막는다. 원문은 타입이 무시하게 둔 경우를 컴파일러가 막을 수 있었던 런타임 실패로 본다.[](source:skill-intro)

- 잘못된 상태는 표현할 수 없게 만든다. 모순된 조합이 컴파일되는 선택 필드 묶음 대신 합 타입(sum type)을 쓴다.[](source:p-illegal)
- 외부 데이터는 파싱하기 전까지 타입이 없다고 본다. 경계마다 파싱 함수를 둔다.[](source:p-parse)
- 형 변환(cast)으로 컴파일러를 속이지 않는다. 증명할 수 없으면 검증하거나 모델을 다듬는다.[](source:p-lie)
- 타입은 부분성(partiality)이 드러난 곳에서만 강화하고 거기서 멈춘다.[](source:p-strengthen)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-type-system-discipline/SKILL.md · 4922B · frontmatter" path=pstack/principle-type-system-discipline/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-type-system-discipline/SKILL.md lines=9:9
@source skill-scope title="SKILL.md · 적용 언어 범위" path=pstack/principle-type-system-discipline/SKILL.md lines=11:11
@source p-illegal title="SKILL.md · 잘못된 상태를 표현할 수 없게" path=pstack/principle-type-system-discipline/SKILL.md lines=15:15
@source p-construct title="SKILL.md · 타입은 구성이다" path=pstack/principle-type-system-discipline/SKILL.md lines=16:16
@source p-brand title="SKILL.md · 의미 있는 기본형에 브랜드" path=pstack/principle-type-system-discipline/SKILL.md lines=17:17
@source p-parse title="SKILL.md · 외부 데이터 파싱" path=pstack/principle-type-system-discipline/SKILL.md lines=18:18
@source p-lie title="SKILL.md · 타입 시스템을 속이지 않기" path=pstack/principle-type-system-discipline/SKILL.md lines=19:19
@source p-exhaust title="SKILL.md · 빠짐없는 매칭" path=pstack/principle-type-system-discipline/SKILL.md lines=20:20
@source p-derive title="SKILL.md · 권위 있는 스키마에서 파생" path=pstack/principle-type-system-discipline/SKILL.md lines=21:21
@source p-strengthen title="SKILL.md · 부분성이 보일 때만 강화" path=pstack/principle-type-system-discipline/SKILL.md lines=22:22
@source skill-tests title="SKILL.md · The tests" path=pstack/principle-type-system-discipline/SKILL.md lines=24:31
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Architecture 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=59:59
@source tbp title="pstack/typescript-best-practices/SKILL.md · 이 원칙 먼저 적용" path=pstack/typescript-best-practices/SKILL.md lines=10:10
@source tbp-patterns title="pstack/typescript-best-practices/references/patterns.md · 도입부" path=pstack/typescript-best-practices/references/patterns.md lines=3:3
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-type-system-discipline`을 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 사용자가 대화에서 원칙 이름을 말해 에이전트의 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-type-system-discipline` 입력[](source:help-principles) |
| `poteto-mode` | Architecture 원칙. 타입 언어에서 타입이나 시그니처를 설계할 때[](source:pm-line) |
| `typescript-best-practices` | 그 스킬의 규칙보다 이 원칙을 먼저 적용한다[](source:tbp) |

`poteto-mode`에서 켜지면 의무가 따라온다. 에이전트는 적용하는 원칙의 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 적은 설명이다. 요청이 그 문장과 같은 말이어야 켜지는 것은 아니다.

## 무엇을 강제하나 {#rules}

원문은 어느 타입 언어에나 적용된다고 한다. 언어별 문법은 `typescript-best-practices` 같은 스킬이 맡는다.[](source:skill-scope)

| 패턴 | 하는 일 |
| --- | --- |
| 잘못된 상태를 표현할 수 없게 | 변형은 합 타입으로 모델링한다. 언어별 예: 판별 유니언(TypeScript), 값 있는 enum(Rust·Swift·Kotlin), sealed class(Scala), ADT(Haskell·OCaml)[](source:p-illegal) |
| 타입은 구성이다 | 느슨한 타입을 검사로 깎지 말고 원하는 값으로 쌓는다. 비어 있지 않은 목록은 머리와 나머지, 유효한 시간 범위는 시작과 길이[](source:p-construct) |
| 의미 있는 기본형에 브랜드 | `UserId`와 `OrderId`는 둘 다 문자열이지만 바꿔 쓰지 못하게 한다. 만들 때 한 번 검증하고 그 뒤로는 타입을 믿는다[](source:p-brand) |
| 외부 데이터는 파싱 전까지 타입 없음 | RPC 내용, JSON, IPC 메시지, CLI 인자, 설정 파일, 환경 변수, DB 행. 경계마다 파싱 함수를 둔다[](source:p-parse) |
| 타입 시스템을 속이지 않기 | 형 변환, 안전하지 않은 강제 변환, 컴파일러를 우회하는 단언 함수는 잠복한 런타임 충돌이다[](source:p-lie) |
| 빠짐없는 매칭은 컴파일러 몫 | 새 변형을 처리하지 않으면 컴파일이 실패해야 한다. 언어별 관용구: `never` 바인딩(TypeScript), 주석 없는 `match`(Rust), `-Wincomplete-patterns`(Haskell)[](source:p-exhaust) |
| 권위 있는 스키마에서 파생 | protobuf, OpenAPI, GraphQL 스키마, DB 마이그레이션, 디자인 토큰이 모양을 정하면 손으로 평행 타입을 만들지 않는다[](source:p-derive) |
| 부분성이 보일 때만 강화 | 런타임 단언, null 검사, "일어날 리 없다"는 `throw`가 타입이 약한 곳이다. 그 검사를 타입으로 올리고 멈춘다. 전체 함수를 고른다[](source:p-strengthen) |

원문이 드는 적용 전후 예시는 이렇다.[](source:p-illegal)

```ts title="원문 예시: 모순 조합이 컴파일되는 타입과 고친 타입"
// 피할 모양: completed가 true인데 completedAt이 undefined일 수 있다
{ completed: boolean; completedAt?: Date }

// 고친 모양 1: boolean을 하나의 원천에서 파생한다
completedAt !== null

// 고친 모양 2: 변형을 명시한다
{ kind: 'open' } | { kind: 'done'; at: Date }
```

강화를 멈추는 기준도 예가 있다. 빈 목록의 `sum`은 0이므로 평범한 목록을 받는다. 빈 목록의 `head`는 답이 없으므로 비어 있지 않은 목록을 요구한다.[](source:p-strengthen)

| 스스로 묻는 질문 | 답이 이러면 |
| --- | --- |
| 이 필드 조합이 언제 유효한지 주석으로 설명할 수 있나? | 예 → 타입이 느슨하다. 합 타입으로 나눈다[](source:skill-tests) |
| 함수 인자 둘이 같은 기본형인데 뜻이 다른가? | 예 → 브랜드를 붙인다[](source:skill-tests) |
| 이 `any`, `as`, `assertNotNull`은 어디서 왔나? | 경계까지 따라가 거기서 검증한다[](source:skill-tests) |
| 다음 달 새 변형이 생기면 컴파일러가 다음 에이전트에게 알려 주나? | 아니오 → 매칭이 빠짐없지 않다[](source:skill-tests) |
| 다른 파일이 가진 모양을 이 타입이 베끼고 있나? | 예 → 파생한다[](source:skill-tests) |
| 연산을 전체 함수로 지키려고 강화하나, 더 정밀하려고 강화하나? | 강화하지 않아도 `panic`이 날 곳이 없으면 평범한 타입을 둔다[](source:skill-tests) |

## 흐름 속 위치 {#position}

@workflow id=type-position title="타입 규율 원칙의 앞뒤"
| pm | poteto-mode | backend |
| tbp | TS 모범 사례 | backend |
| this | 타입 규율 | backend |
| back | 타입 설계 | frontend |
| others | 경계·구조 원칙 | backend |
| pm > this | 타입 설계 | |
| tbp > this | 먼저 적용 | |
| this > back | 타입 | emphasis |
| this > others | 참고 | dashed |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 타입 언어에서 타입이나 시그니처 설계[](source:pm-line) | r12 |
| `typescript-best-practices` | - | 그 스킬은 이 원칙을 먼저 적용하라고 한다. 예제 모음도 이 원칙을 가리킨다[](source:tbp)[](source:tbp-patterns) | 원장에 없음(r97의 반대 방향) |
| 언어 범위 문단 | `typescript-best-practices` 참고 | 특정 언어 문법으로 구체화하는 스킬의 예[](source:skill-scope) | r97 |
| 파싱 패턴 | `principle-boundary-discipline` 참고 | 검증을 어디에 둘지는 그 원칙을 보라고 한다[](source:p-parse) | 원장에 없음 |
| 파생 패턴 | `principle-encode-lessons-in-structure` 참고 | 스키마에서 파생하는 근거로 가리킨다[](source:p-derive) | 원장에 없음 |

이 원칙은 다른 스킬을 실행하지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(4922B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `typescript-best-practices/SKILL.md`, `typescript-best-practices/references/patterns.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지에 적은 동작은 모두 SKILL.md가 지시하는 동작이며, 실행해서 확인한 동작이 아니다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`description`은 "모든 정적 타입 언어로 코드를 쓸 때"까지 넓게 적는다. `poteto-mode`는 "타입이나 시그니처 설계"로 좁게 적는다. 어느 쪽이 기준인지 우선순위는 원문에 명시 없음.[](source:skill-fm)[](source:pm-line)
