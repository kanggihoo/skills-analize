# pick-ui-library 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/pick-ui-library/`
- **핵심 파일**: `SKILL.md` (4,514 bytes) — 이 컬렉션에서 가장 작은 스킬
- **보조 파일**: 없음
- **성격**: **큐레이션된 라이브러리 조회(lookup) 스킬**. 프론트엔드 과제 → 추천 라이브러리 1개를 매핑하는 표 5개 + 흔한 오선택 목록.

원문 자기 규정: "A lookup skill. ... These are **deliberate, taste-driven picks** — don't substitute alternatives outside this list unless the user asks for one or the task genuinely isn't covered."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter 원문:
```yaml
name: pick-ui-library
description: Pick the right library for a given frontend task from a curated, opinionated list — numbers, OTP inputs, charts, command menus, virtualization, drag and drop, toasts, state, styling, and more. Only runs when explicitly invoked; it does not trigger on its own.
disable-model-invocation: true
```

**이 컬렉션에서 유일하게 `disable-model-invocation: true`가 설정된 스킬이다.** description도 이를 재확인 — "**Only runs when explicitly invoked; it does not trigger on its own.**"

**매칭되는 사용자 발화**
- 명시적 호출만: `/pick-ui-library`, "pick-ui-library로 골라줘"
- 스킬 문서가 상정하는 입력 예시: "I need toasts", "what should I use for drag and drop?"
- **모델이 자동으로 켤 수 없다.** 단, `animate`의 Step 3이 이 스킬을 명시적으로 호출하도록 지시함 — "If the task needs a *component* rather than an animation — a toast, a drawer, a command menu, a dropdown — **stop and invoke `pick-ui-library`**."

**왜 자동 호출을 막았는가**: 원문에 이유는 명시 없음. 다만 라이브러리 추천은 프로젝트 의존성을 바꾸는 결정이므로, 사용자가 요청하지 않은 상황에서 의존성 제안이 튀어나오는 것을 막는 설계로 읽힌다.

`allowed-tools` / `metadata`: **원문에 명시 없음** (`disable-model-invocation`만 추가 필드).

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 새 기능에 필요한 라이브러리를 고를 때, 특히 선택지가 많은 영역(차트, 상태관리, 가상화)
- `animate`가 "이건 애니메이션이 아니라 컴포넌트 문제"로 판정해 넘겨줄 때
- 기존 코드가 손으로 만든 것(hand-rolled dropdown, 수동 토스트)을 대체할지 판단할 때 → "Common mismatches to catch" 6항목
- 스타일링 유틸(clsx vs cva) 같은 미묘한 분기 판단

**부적합 / 과한 상황**
- 목록에 없는 영역 — 원문이 이 경우를 명시: "If the task isn't covered by the list, **say so explicitly** and recommend from your own knowledge — **but be clear you've left the curated list.**"
- 이미 경쟁 라이브러리를 쓰고 있는 프로젝트에서 교체를 원하지 않을 때 — 규칙 2가 "don't churn the dependency without being asked"
- React 이외 스택 — 목록 전체가 React 생태계 (Satori/shiki 제외)
- 여러 후보를 비교 검토하고 싶을 때 — 이 스킬은 **의도적으로 하나만 추천**한다: "Don't present a menu of options when the list has a clear answer."

**형제 스킬 대신 이걸 고르는 기준**: 문제가 **"무엇을 설치할지"**인가. 모션 구현이면 `animate`, Sonner 사용법이면 `ask-sonner`.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 목록 밖 과제일 때 "recommend from your own knowledge"로 폴백 — 단 목록을 벗어났음을 밝혀야 함.
- **필요한 CLI/런타임/패키지**:
  - **`package.json` 읽기** — 규칙 2가 필수 단계로 지정: "**Check what's already installed.** Look at `package.json` first."
  - 추천 시 설치를 수행할 경우 npm/pnpm/yarn — "install/wire it up if that's part of the request"
  - **추천 대상 라이브러리 자체**가 곧 이 스킬이 유발하는 의존성 (아래 목록)
- **네트워크**: 패키지 설치 시. 목록의 모든 항목에 문서 URL이 붙어 있음.
- **비용 발생 지점**: 없음 (모두 오픈소스 라이브러리).

**이 스킬이 도입을 유발할 수 있는 의존성 전체 (18개)**
base-ui, cmdk, Sonner, input-otp, Leva(대안 dialkit), motion(Framer Motion), NumberFlow, torph, Cobe, Satori, shiki, Liveline, recharts, dnd kit, Virtuoso, zustand, clsx, cva, next-themes

## 5. 워크플로우

### How to use this — 4단계

**1. Identify the task, not the library the user named.**
"\"I need to show a dropdown\" is a UI-primitives task (base-ui), **even if they asked about something else.**"
→ 사용자가 말한 라이브러리 이름을 그대로 받지 않고, 과제 성격으로 재분류하는 단계.

**2. Check what's already installed.** — **분기 게이트**
"Look at `package.json` first."
- 목록에 있는 라이브러리를 이미 쓰고 있다 → **그것을 사용** ("use it")
- 경쟁 라이브러리를 쓰고 있다 (예시: react-window instead of Virtuoso) → **추천은 알리되 교체하지 않음** ("flag the recommendation but **don't churn the dependency without being asked**")
- 아무것도 없다 → 3단계로

**3. Recommend one library**, 용도를 한 문장으로 설명, 요청에 포함되면 설치·배선까지.
"**Don't present a menu of options when the list has a clear answer.**"

**4. 목록 밖 과제 처리** — **폴백 분기**
"say so explicitly and recommend from your own knowledge — but be clear you've left the curated list."

### 조회 대상: 5개 카테고리 표

**UI components & primitives**

| Task | Library |
| --- | --- |
| Unstyled, accessible UI components (dialogs, popovers, menus, selects…) | [base-ui](https://base-ui.com) |
| Command menus (⌘K palettes) | [cmdk](https://cmdk.paco.me) |
| Toasts / notifications | [Sonner](https://sonner.emilkowal.ski) |
| One-time password / verification code inputs | [input-otp](https://input-otp.rodz.dev) |
| Customizable GUIs / control panels | [Leva](https://github.com/pmndrs/leva) — [dialkit](https://joshpuckett.me/dialkit) is an alternative |

**Motion & visuals**

| Task | Library |
| --- | --- |
| General-purpose animation (springs, layout animations, enter/exit) | [motion](https://motion.dev) (Framer Motion) |
| Animating numbers (counters, prices, stats) | [NumberFlow](https://number-flow.barvian.me) |
| Animated text components | [torph](https://torph.lochie.me/) |
| 3D globes | [Cobe](https://cobe.vercel.app) |
| Dynamic OG images (HTML/CSS → SVG/PNG) | [Satori](https://github.com/vercel/satori) |
| Syntax highlighting | [shiki](https://shiki.style) |

절제 규칙 첨부: "Reach for motion when you need springs, layout animations, exit animations, or gesture-driven values. **A simple hover or fade doesn't need it — plain CSS transitions are the right tool there.**"

**Charts**

| Task | Library |
| --- | --- |
| Real-time / streaming charts | [Liveline](https://github.com/benjitaylor/liveline) |
| General charts (static or interactive dashboards) | [recharts](https://recharts.org) |

분기 기준 명시: "if data points arrive live and the chart scrolls with time, use Liveline. **Everything else is recharts.**"

**Interaction & performance**

| Task | Library |
| --- | --- |
| Drag and drop | [dnd kit](https://dndkit.com) |
| Virtualization (long lists, large tables) | [Virtuoso](https://virtuoso.dev) |

**State & styling**

| Task | Library |
| --- | --- |
| State management | [zustand](https://zustand.docs.pmnd.rs) |
| Constructing `className` strings conditionally | [clsx](https://github.com/lukeed/clsx) |
| Type-safe, variant-driven styling for Tailwind | [cva](https://cva.style) |
| Theme switching / dark mode (no flash on load) | [next-themes](https://github.com/pacocoursey/next-themes) |

분기 기준 명시: "clsx for ad-hoc conditional classes; cva when a component has **real variants (size, intent, state) that deserve a typed API.** They compose — cva uses clsx-style inputs internally."

### Common mismatches to catch — 역방향 진단 (6항목)
사용자가 요청하지 않아도 코드에서 발견하면 지적할 패턴:
- "**Toasts built by hand or with a modal library** → Sonner exists for exactly this."
- "**A `<div>`-based dropdown/dialog with manual focus handling** → base-ui, which handles accessibility, focus trapping, and dismissal."
- "**Animating a number by re-rendering text** → NumberFlow handles digit transitions properly."
- "**Rendering a 1,000+ row list directly** → Virtuoso before reaching for pagination hacks."
- "**A `useState`-per-component web of props for shared state** → zustand."
- "**Template-literal className ternaries three conditions deep** → clsx (or cva if it's variant-shaped)."

**사용자 확인 요구 지점**: 의존성 교체 — "don't churn the dependency without being asked". 즉 경쟁 라이브러리 교체는 사용자 승인 필요.

## 6. 디자인 지침 분석

이 스킬은 **미적 규칙(수치·금지 폰트·easing 등)을 제공하지 않는다.** 대신 "취향"을 **도구 선택**의 층위에서 강제한다 — 이 컬렉션에서 취향이 작동하는 또 하나의 층위로 볼 수 있다.

### 금지 규칙 (anti-pattern) — 원문 그대로

- "**don't substitute alternatives outside this list** unless the user asks for one or the task genuinely isn't covered."
- "**Don't present a menu of options when the list has a clear answer.**"
- "**don't churn the dependency without being asked**"
- "A simple hover or fade doesn't need it [motion] — plain CSS transitions are the right tool there."
- "Common mismatches" 6항목 전부가 금지 패턴 목록 (손으로 만든 토스트, `<div>` 드롭다운, 텍스트 재렌더 숫자 애니메이션, 1000행 직접 렌더, useState 프롭 웹, 3중 삼항 className)
- 목록을 벗어날 때는 반드시 밝힐 것 — "be clear you've left the curated list."

### 강제 규칙 — 수치 인용

수치는 사실상 하나뿐: **"Rendering a 1,000+ row list directly → Virtuoso"** — 가상화 도입 임계값.

그 외 easing/duration/spacing 같은 수치는 **원문에 없음** (스킬의 성격상 해당 없음).

### 항목별 지침

- **타이포그래피 / 컬러 / 스페이싱 / 모션 수치 / 레이아웃**: **원문에 지침 없음.**
- **모션**: 라이브러리 선택 층위에서만 — motion을 쓸 조건(springs / layout animations / exit animations / gesture-driven values)과 쓰지 말 조건(simple hover or fade). 이는 `animate` Step 3의 도구 선택 테이블과 동일한 판단.
- **접근성**: base-ui 추천 근거로 등장 — "handles accessibility, focus trapping, and dismissal". 손으로 만든 드롭다운을 오선택으로 규정하는 근거가 접근성.
- **성능**: Virtuoso(1,000+ 행), NumberFlow(digit transitions), Liveline vs recharts 분기.
- **타입 안전성**: cva 선택 기준 — "real variants (size, intent, state) that **deserve a typed API**".

### 지침을 주는 방식 자체

1. **큐레이션 자체가 지침**: 규칙 목록이 아니라 **닫힌 선택지 집합**으로 취향을 강제. "These are **deliberate, taste-driven picks**."
2. **단일 답 강제**: 메뉴 제시 금지. 비교표·트레이드오프 분석을 의도적으로 제거.
3. **과제 재분류 단계**: 사용자의 어휘를 그대로 받지 않고 과제 성격으로 번역 (1단계).
4. **기존 상태 우선 확인**: `package.json` 확인이 추천보다 앞. 의존성 추가를 억제하는 순서.
5. **분기 기준의 한 줄 정의**: 경합하는 두 라이브러리(Liveline/recharts, clsx/cva)마다 "The split:"으로 판정 기준을 한 문장으로 제시.
6. **역방향 진단 목록**: "Common mismatches to catch" — 사용자가 묻지 않아도 코드에서 발견할 안티패턴. 조회 스킬에 감사 기능을 부착.
7. **경계 인정 장치**: 목록 밖일 때 명시적으로 선언하도록 요구. 큐레이션의 신뢰성을 유지하는 메타 규칙.
8. **자동 호출 차단**: `disable-model-invocation: true` — 지침을 주는 방식이 아니라 **지침이 작동하는 시점 자체를 제한**. 이 컬렉션에서 유일.
9. **페르소나 부여 없음**, **참조 대상(Linear/Apple 등) 제시 없음**, **체크리스트 없음**.

### 모호한 감각어의 번역

이 스킬의 유일한 감각어는 "**taste-driven picks**"이며, 그 번역이 **목록 그 자체**다. 취향을 서술하지 않고 **선택지를 좁히는 방식**으로 구현한 것이 이 스킬의 방법론.

부수적 번역:
- "**the right tool**" → motion을 쓸 조건 4개 vs plain CSS transitions
- "**deserve a typed API**" → variants가 size/intent/state처럼 실재하는가
- "**exists for exactly this**" (Sonner) → 손으로 만든 토스트를 즉시 오선택으로 판정
- "**pagination hacks**" → 1,000행 이상은 가상화가 정답

## 7. 산출물

- **형식**: 추천 문장 (라이브러리 1개 + 용도 한 문장), 요청에 포함되면 설치 명령 + 배선 코드.
- **파일 저장 위치 / 네이밍 규칙**: 해당 없음. **원문에 명시 없음.**
- 출력 규격·톤 섹션 자체가 **없음**.

## 8. 주의점 / 한계

- **노후화가 빠른 유형**: 라이브러리 목록은 시간이 지나면 낡는다. 목록에 버전이나 갱신 시점이 **원문에 명시 없음.** torph, Liveline, dialkit 등은 상대적으로 알려지지 않은 항목이라 유지보수 상태 확인이 필요.
- **React 전제**: 목록 대부분이 React 라이브러리인데 **원문이 이를 명시하지 않는다.** Vue/Svelte 프로젝트에서 호출되면 대부분의 추천이 무의미하며, 그 판단은 스킬 밖에 있음.
- **`disable-model-invocation: true`의 양면**: 원치 않는 의존성 제안을 막지만, `animate` Step 3이 이 스킬을 호출하도록 지시하고 있어 **자동 호출이 차단된 스킬을 다른 스킬이 호출하도록 되어 있는 구조**. 실제로 동작하는지는 하네스 구현에 의존 — 원문에 설명 없음.
- **단일 추천의 위험**: 트레이드오프를 제시하지 않으므로, 목록의 선택이 프로젝트 제약(번들 크기, 라이선스, SSR 호환성 등)에 안 맞을 때 그 사실이 드러나지 않는다. 라이선스·번들 크기 정보는 **원문에 없음.**
- **커버 범위의 공백**: 폼(react-hook-form), 데이터 페칭(TanStack Query), 라우팅, 테이블(TanStack Table), i18n, 날짜 처리 등 프론트엔드 필수 영역이 목록에 없다. 4단계 폴백으로 처리되지만 "curated list를 벗어났다"는 고지가 매번 붙게 됨.
- **자기 참조 편향**: Sonner는 이 컬렉션 저자(Emil Kowalski)의 라이브러리이며 전용 스킬(`ask-sonner`)도 함께 제공된다. 원문은 이 관계를 밝히지 않음 (도메인 `sonner.emilkowal.ski`로만 암시).
- **강한 경고 지점**:
  - "Only runs when explicitly invoked; it does not trigger on its own."
  - "don't substitute alternatives outside this list"
  - "Don't present a menu of options when the list has a clear answer."
  - "don't churn the dependency without being asked"
  - "be clear you've left the curated list."
- **검증 장치**: 없음. `package.json` 확인이 유일한 사실 확인 단계.
