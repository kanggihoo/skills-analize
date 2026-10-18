# animate 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/animate/`
- **핵심 파일**: `SKILL.md` (11,575 bytes)
- **보조 파일**: `RECIPES.md` (7,957 bytes) — button press / dropdown·popover·menu·select / tooltip / modal / drawer·sheet / toast / accordion·collapse / stagger group entrance / hold to confirm / tab indicator / scroll reveal / drag to dismiss / masking a crossfade / programmatic without a library, 총 14개 레시피
- **성격**: 애니메이션을 **새로 만드는 "construction skill"** — 감사(audit)·비평(critique)·기회 탐색(opportunity hunting)을 명시적으로 배제하고, 요청을 "리뷰를 한 번에 통과하는 구현"으로 변환하는 것만 담당.

원문 자기 규정: "A construction skill. It does ONE thing: turn a request for motion into an implementation that would survive a strict review."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which properties, which curve and duration, how it interrupts, how it exits. Writes the implementation. Use when asked to animate something, add motion, make a component feel alive, or build a transition. For critiquing existing motion use review-animations; for auditing a whole codebase use improve-animations."

**매칭되는 사용자 발화**
- "이 버튼에 애니메이션 넣어줘", "드롭다운 열릴 때 모션 추가", "이 컴포넌트 살아있는 느낌으로", "트랜지션 만들어줘"
- `animate something` / `add motion` / `make a component feel alive` / `build a transition` 네 문구가 사실상 트리거 사전.

**의도적으로 배제되는 발화** (description 안에 라우팅 규칙이 박혀 있음)
- 기존 모션 비평 → `review-animations`
- 코드베이스 전체 감사 → `improve-animations`
- 본문에서 추가로: 애니메이션 넣을 곳 찾기 → `find-animation-opportunities`, React Native → `animate-expo`

`allowed-tools` / `metadata` 필드는 **원문에 명시 없음** (frontmatter는 `name`, `description`만 존재).

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 모달/드로어/토스트/드롭다운처럼 "occasional" 빈도의 컴포넌트에 처음 모션을 붙일 때
- 이미 코드베이스에 easing·duration 토큰이 있고 그것을 지키면서 새 모션을 추가해야 할 때 ("Extend the codebase's tokens, don't fork them")
- 제스처(drag-to-dismiss), hold-to-confirm처럼 interruption 설계가 필요한 모션
- 레시피에 있는 14개 패턴 중 하나에 해당하는 요청 — 이 경우 "start from the recipe rather than from a blank file"

**부적합 / 과한 상황**
- 키보드 단축키로 열리는 UI, 하루 100회 이상 쓰이는 액션 → 스킬 자체가 **코드 0줄을 출력하도록** 설계됨. 원문: "The gate below exists to produce zero lines of code sometimes. That's a success, not a dodge."
- 토스트·드로어·커맨드 메뉴 같은 **컴포넌트 자체가 없는** 경우 → 본문이 `pick-ui-library`로 넘기라고 지시 ("Hand-rolling those is how you end up with a `<div>` dropdown and no focus management")
- React Native / Expo → `animate-expo`
- 기존 코드 품질 점검 목적 → `review-animations`

**형제 스킬 대신 이걸 고르는 기준**: 산출물이 **새 구현 코드**인가? 그렇다면 `animate`. 산출물이 **판단문/리포트**라면 review 또는 improve 계열.

## 4. 외부 의존성

- **API 키**: **불필요**. SKILL.md·RECIPES.md 전체에 API 키, 환경변수, 외부 서비스 호출이 없음.
- **폴백 모드**: 키 개념이 없으므로 해당 없음.
- **런타임/패키지**: 스킬 자체는 실행 스크립트가 없음(scripts/ 폴더 없음). 다만 생성되는 코드가 선택적으로 의존:
  - CSS만으로 끝나는 경로 (transition, `@starting-style`, CSS animation, WAAPI) → 의존성 0
  - 스프링·layout 애니메이션·exit 애니메이션·제스처 → **Motion (`motion.dev`)** 필요
  - `var(--transform-origin)`, `[data-starting-style]`, `[data-ending-style]` 속성은 **Base UI** 전제 (RECIPES.md에 "Base UI supplies this")
- **네트워크**: 불필요. 참고 링크로 [easing.dev](https://easing.dev/), [easings.co](https://easings.co/)를 제시하지만 필수 접근은 아님.
- **비용 발생 지점**: 없음.
- 원문 하드룰: "**Cheapest tool that works.** Don't install a motion library for a fade." — 의존성 추가 자체를 억제하는 규칙이 내장됨.

## 5. 워크플로우

"The Build Sequence" — 순서 강제. 하드룰 1번: "Run the sequence in order. Steps 1 and 2 gate everything. Don't reach for a curve before you know whether it animates at all."

### Step 1. Should this animate at all? — **게이트 (탈락 가능)**
빈도 테이블로 판정:

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | **No animation. Ever.** Stop here. |
| Tens of times/day (hover effects, list navigation) | Near-imperceptible only — fast and subtle, or nothing |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, success, celebration) | The delight budget lives here |

- "**Keyboard-initiated actions are a disqualifier, not a judgment call.**" — 판단 여지 없는 실격 사유. 근거로 Raycast(개폐 애니메이션 없음)를 제시.
- 탈락 시: "say so plainly and don't write the animation. Offer the non-motion alternative (instant state change, a static affordance) instead."
- **왜 첫 단계인가**: 두 실패 모드 중 "Animating something that shouldn't animate"를 더 나쁜 것으로 규정하기 때문.

### Step 2. What is the purpose? — **게이트 (탈락 가능)**
다음 6개 중 하나로 **한 단어로 명명**해야 통과:
Feedback / Spatial consistency / State indication / Preventing a jarring change / Explanation(마케팅·온보딩 전용) / Delight(rare·first-time 티어에서만 허용)

- "Can't name it? Don't build it. 'It looks cool' on a frequently-seen element is a reason to stop."
- 추가 **function 체크**: "data the user is reading or acting on should not move for style." 예시 — 장식적 마우스 트래킹은 마케팅 페이지용이며 뱅킹 앱 그래프에는 부적합.

### Step 3. Pick the tool — cheapest that works
"Walk down; stop at the first that fits." 위에서 아래로 첫 매칭에서 정지:

| Need | Tool |
| --- | --- |
| Hover, press, color, class/attribute로 제어하는 state toggle | **CSS transition** |
| mount 시 entry animation, JS state 없음 | **CSS `@starting-style`** |
| 페이지가 로딩으로 바쁜 동안에도 부드러워야 하는 predetermined motion | **CSS animation** (메인 스레드 밖에서 실행) |
| CSS 성능 + 프로그래매틱 제어, 라이브러리 없이 | **WAAPI** (`element.animate()`) |
| Springs, layout animations, exit animations, gesture-driven values | **Motion** (`motion.dev`) |

근거 명시: "CSS animations beat JS under load — they run off the main thread, while `requestAnimationFrame`-based animation drops frames while the browser loads, scripts, or paints."

**분기 게이트**: 요청이 애니메이션이 아니라 *컴포넌트*(toast/drawer/command menu/dropdown)를 필요로 하면 → 중단하고 `pick-ui-library` 호출.

### Step 4. Pick the properties
Step 3에서 고른 도구 위에서 무엇을 움직일지 결정. 상세 규칙은 §6 참조.

### Step 5. Easing and duration — or a spring
Step 4에서 확정한 속성에 곡선·시간을 부여. 스프링으로 갈지 여부도 여기서 분기 (drag with momentum / alive한 느낌 / 사용자가 중단·역전 가능한 제스처 / 장식적 마우스 트래킹 → 스프링).

### Step 6. Interruption and exit
Step 5의 선택이 중단·역방향 상황에서도 성립하는지 검증. keyframes ↔ transitions 재선택이 여기서 발생 ("Transitions retarget from the current value; keyframes restart from zero").

### Step 7. Reduced motion and pointer gating
"Ships with the animation, every time." 하드룰 4번에서 "not as a follow-up"으로 못박음 — 즉 별도 단계지만 **누락 불가**.

### 마지막. Never Ship 셀프체크
13행 금지 테이블로 자기 산출물을 재검증. "Each of these is an automatic block in `review-animations`" — 즉 자매 스킬의 리뷰 기준과 동일한 표를 자기 검증 장치로 재사용.

**사용자 확인 요구 지점**: 없음. 오히려 반대로 명시 — "**Never present motion options as a menu.** Make the call, state the reasoning in one line, write the code." 유일하게 사용자에게 넘기는 것은 §7의 "What to feel-check" (코드로 판단 불가능한 감각 항목).

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

"Never Ship" 테이블 전체:

| Never | Instead |
| --- | --- |
| `transition: all` | Name the exact properties |
| `transform: scale(0)` entrance | `scale(0.95)` + `opacity: 0` |
| `ease-in` on a UI element | `ease-out` or a strong custom curve |
| Built-in `ease-out` on a deliberate animation | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Animation on a keyboard shortcut or 100+/day action | No animation |
| UI duration over 300ms with no reason | 150–250ms |
| `transform-origin: center` on a trigger-anchored popover | `var(--transform-origin)` (modals exempt) |
| Keyframes on toasts, toggles, rapidly-triggered elements | CSS transitions |
| Animating `width`/`height`/`margin`/`padding`/`top`/`left` | `transform` / `opacity` |
| Motion `x`/`y`/`scale` props under load | Full `transform` string |
| Ungated `:hover` motion | `@media (hover: hover) and (pointer: fine)` |
| Missing `prefers-reduced-motion` | Gentler variant, not zero |
| Everything entering at once | 30–80ms stagger |

본문의 추가 금지:
- "**Never `scale(0)`.** Start from `scale(0.9–0.97)` + `opacity: 0`. Nothing in the real world appears from nothing."
- "**Never `ease-in` on UI.** It starts slow, delaying the exact moment the user is watching."
- "**Never drive a child's transform from a CSS variable on the parent** — it recalculates styles for every child."
- "**No approximated values.** ... Never invent `cubic-bezier(0.4, 0, 0.2, 1)` because it looks familiar." (Material Design 표준 곡선을 이름으로 지목해 금지)
- "Built-in CSS easings are too weak."

### 강제 규칙 — 수치 인용

**Easing 토큰 (3개 고정값)**
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```
목록에 없는 곡선이 필요하면 easing.dev / easings.co에서 **가져올 것**, "Don't hand-roll one."

**Easing 선택 결정 순서**

| Situation | Easing |
| --- | --- |
| Entering or exiting | `ease-out` |
| Moving / morphing on screen | `ease-in-out` |
| Hover / color change | `ease` |
| Constant motion (marquee, progress) | `linear` |
| Default | `ease-out` |

**Duration 스케일**

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

- 상한선: "**UI animations stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one."
- Stagger: **30–80ms**

**Spring 설정 (2개 고정 프리셋)**
```js
{ type: "spring", duration: 0.5, bounce: 0.2 }            // Apple-style — easier to reason about
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }  // traditional physics — more control
```
- bounce는 **0.1–0.3** 유지, "avoid bounce in most UI — reserve it for drag-to-dismiss and playful interactions."

**Scale 시작값**: `scale(0.9–0.97)` (레시피에서 popover는 `0.95`, tooltip은 `0.97`, button press는 `0.97`)

### 항목별 지침

- **타이포그래피 / 컬러 / 스페이싱**: 이 스킬의 범위 밖 — **원문에 지침 없음**. 컬러는 "hover/color change → `ease`" 정도로 모션 대상으로만 언급.
- **모션** (전체가 이 항목): 위 §강제 규칙 전부.
- **레이아웃**: `transform-origin`을 트리거에 두라는 공간 규칙만 존재. "**`transform-origin` at the trigger** for popovers, dropdowns, menus, tooltips — `var(--transform-origin)` in Base UI. **Modals are exempt**; they're not anchored to a trigger, so they stay centered."
- **속성 선택**: "**`transform` and `opacity` only.** They skip layout and paint and run on the GPU." 예외 2개 — `clip-path`("the sanctioned fourth"), `height`("tolerated only for accordions, where there's no transform equivalent").
- **단위**: "**Percentages in `translate()`** are relative to the element's own size — `translateY(100%)` moves by its own height whatever the content. Prefer over hardcoded pixels."
- **접근성**: `prefers-reduced-motion`은 0이 아니라 "fewer and gentler" — "keep transitions that aid comprehension, remove movement and position changes." 포인터 게이팅은 `@media (hover: hover) and (pointer: fine)`, 이유는 "touch fires false hovers on tap".
- **대칭성**: "**Exit the way it entered.** A toast that slides in from the bottom leaves through the bottom."
- **비대칭 타이밍**: "**Asymmetric timing where the user is deciding.** Slow on the deliberate phase (a hold-to-confirm press: 2s linear), snappy on the system response (release: 200ms ease-out)."

### 지침을 주는 방식 자체

1. **페르소나 부여**: "You are a senior design engineer building the animation yourself. The bar is Emil Kowalski's animation philosophy" — 개인 이름을 기준선으로 사용.
2. **실패 모드 서열화**: 두 실패 모드를 나열하고 "the first is worse"로 우선순위를 명시.
3. **결정 테이블**: 빈도→결정, 상황→easing, 요소→duration, 필요→도구. 모든 판단이 lookup table로 환원됨. 산문 설명이 아니라 표가 규범.
4. **게이트 구조**: Step 1–2가 코드 생성 자체를 차단하는 관문. "produce zero lines of code sometimes. That's a success, not a dodge."
5. **금지 테이블 + Instead 열**: 금지만 하지 않고 대체안을 같은 행에 배치.
6. **레시피 라이브러리**: RECIPES.md 14개 패턴 — 코드 예시로 직접 제공.
7. **자매 스킬과의 기준 공유**: "Each of these is an automatic block in `review-animations`" — 생성 기준 = 검증 기준으로 동기화.
8. **실물 참조**: Raycast(개폐 애니메이션 부재), Ionic(`--ease-drawer` 출처), Base UI(`var(--transform-origin)`), Apple(스프링 스타일).
9. **근거 부착**: 거의 모든 규칙에 물리적/지각적 이유가 붙음 — GPU/layout/paint, 메인 스레드, "Nothing in the real world appears from nothing", "delaying the exact moment the user is watching".

### 모호한 감각어의 번역

- "**feel right**" → 7단계 결정 순서 자체로 치환. description 원문: "making the decisions in the order that determines whether it feels right".
- "**feels faster**" → 곡선 선택으로 번역: "`ease-out` at 200ms *feels* faster than `ease-in` at 200ms" / "A 180ms dropdown feels more responsive than a 400ms one." 즉 체감 속도 = 곡선 + 300ms 상한.
- "**feel alive**" → 스프링 사용 조건으로 번역: "an element that should feel alive" → `{ type: "spring", ... }`.
- "**physical press**" → `scale(0.97)`이 자식까지 스케일한다는 사실로 번역: "`scale()` scales children too — the label and icons come along, which is what makes it read as a physical press."
- 코드로 판단 불가능한 감각은 **미해결로 남기고 검증 절차로 넘김**: "play it at 2–5× duration or in the DevTools animation inspector, step it frame by frame, test gestures on a real device, and look again the next day with fresh eyes." — 감각어를 억지로 수치화하지 않는 점이 특징.

## 7. 산출물

- **형식**: 구현 코드 (CSS / JSX+Motion / WAAPI JS). "The code is the deliverable."
- **코드 뒤에 붙는 요약** — 최대 몇 줄, 3항목:
  1. **The gate result** — frequency tier + named purpose, 거절된 요청이 있으면 무엇을 왜 거절했는지
  2. **The ingredients** — tool, properties, curve, duration 또는 spring config, 각 1줄
  3. **What to feel-check** — 코드로 판정 불가능한 감각 항목과 검증 방법
- "Don't pad this into a report."
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.** 기존 코드베이스에 인라인으로 작성하는 것을 전제하며, 토큰은 "Extend the codebase's tokens, don't fork them" 규칙에 따라 기존 토큰 파일에 편입.

## 8. 주의점 / 한계

- **Base UI 결합**: `var(--transform-origin)`, `[data-starting-style]`, `[data-ending-style]`는 Base UI가 공급하는 것. 다른 헤드리스 라이브러리(Radix 등)를 쓰면 이 레시피가 그대로 안 맞음 — 대응 방법은 원문에 명시 없음.
- **`prefers-reduced-motion`의 해석 폭**: "fewer and gentler, not zero"는 판단 여지가 남는 부분. 어떤 transition이 "aid comprehension"인지의 기준은 원문에 명시 없음.
- **토큰 충돌**: 하드룰 3번이 "Adding a parallel system is a defect"라고 하지만, 기존 코드베이스의 easing이 built-in `ease-out`처럼 "too weak"한 값일 때 어느 쪽을 따를지는 원문에 명시 없음 (규칙 3과 "Built-in CSS easings are too weak"가 충돌 가능).
- **스킬 간 라우팅 부담**: 하나의 요청이 `pick-ui-library`(컴포넌트 필요) → `animate`(모션) → `review-animations`(검증)으로 이어질 수 있어, 4개 형제 스킬 중 어느 것이 켜져야 하는지 판단이 선행됨. description에 라우팅이 박혀 있어 오작동 위험은 낮은 편.
- **강한 경고 지점**:
  - "Keyboard-initiated actions are a disqualifier, not a judgment call."
  - "Never present motion options as a menu."
  - "No approximated values."
  - "Reduced motion and hover gating ship with the animation, not as a follow-up."
- **한계**: 코드 리뷰나 실행 검증 장치(스크립트/테스트)가 없음. Never Ship 테이블은 모델의 셀프체크에 의존하며, 실제로 브라우저에서 프레임 드랍을 측정하는 수단은 제공하지 않음.
