# emil-design-eng 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/emil-design-eng/`
- **핵심 파일**: `SKILL.md` (27,226 bytes) — 이 컬렉션에서 `write-swift` 다음으로 큰 단일 파일
- **보조 파일**: 없음
- **성격**: **통합 지식 + 리뷰 스킬**. Emil Kowalski의 디자인 엔지니어링 철학 전체를 한 파일에 담은 모놀리식 스킬. 실질적으로 `animate`(결정 프레임워크) + `review-animations`(체크리스트) + 성능·제스처·clip-path·접근성 지식 + Sonner 제작 회고가 한 문서에 합쳐진 형태.

원문 자기 규정: "This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문 (전문):

> "This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great."

**해석**: description에 **트리거 문구가 없다.** `animate`("Use when asked to animate something…")나 `ask-sonner`("Use when working with Sonner…")와 달리, 이 스킬은 "무엇을 담고 있는지"만 선언하고 "언제 켜야 하는지"를 지정하지 않는다.

**매칭될 것으로 보이는 사용자 발화**
- "UI 폴리시 좀 봐줘", "이 컴포넌트 디테일 개선해줘"
- "Emil Kowalski 스타일로", "디자인 엔지니어링 관점으로 리뷰해줘"
- "software feel great" — 막연한 품질 개선 요청

**특이점**: 스킬 호출 시 **정해진 첫 응답**이 강제된다.
> "When this skill is first invoked without a specific question, respond only with:
> *I'm ready to help you build interfaces that feel right, my knowledge comes from Emil Kowalski's design engineering philosophy. If you want to dive even deeper, check out Emil's course: [animations.dev](https://animations.dev/).*
> **Do not provide any other information until the user asks a question.**"

즉 질문 없이 켜지면 **대화형 게이트로 정지**한다. 이 컬렉션의 다른 스킬에는 없는 패턴이며, 강좌 홍보 링크가 첫 응답에 고정되어 있다.

`allowed-tools` / `metadata`: **원문에 명시 없음**.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 기존 UI 코드를 **Before/After 표로 리뷰**받고 싶을 때 — 출력 포맷이 강제되어 결과가 일관됨
- 애니메이션 외 주제(clip-path 기법, 제스처 물리, 성능 함정, Sonner 설계 원칙)를 한 번에 참조하고 싶을 때
- `clip-path` 기반 기법(탭 컬러 전환, hold-to-delete, 비교 슬라이더, 스크롤 리빌)이 필요할 때 — **이 5개 패턴은 컬렉션 내에서 이 스킬에만 상세히 있음**
- 컴포넌트를 라이브러리로 공개할 때의 설계 원칙 (Sonner Principles 6항목)

**부적합 / 과한 상황**
- 특정 애니메이션 하나만 구현하면 되는 경우 → `animate`가 더 좁고 실행 지향적 (게이트 + 레시피 + 출력 규격이 명확)
- diff를 비평받고 싶은 경우 → `review-animations`가 전용 (STANDARDS.md 보유)
- 코드베이스 전체 감사 → `improve-animations`
- React Native → `animate-expo`
- **이 스킬의 내용 대부분이 다른 4개 스킬과 중복된다** (§8 참조). 컬렉션 전체를 설치한 환경에서는 중복 활성화 위험이 실질적 부작용.

**형제 스킬 대신 이걸 고르는 기준**: 원문에 라우팅 규칙이 **없다.** `animate`는 description에서 형제 스킬로 라우팅하지만, 이 스킬은 자기 경계를 선언하지 않는다. 실용적 판단 기준을 세우자면 — (a) `clip-path` 기법이나 Sonner 설계 회고가 필요한가, (b) Before/After 표 형식의 리뷰를 원하는가. 그 외에는 세분화된 형제 스킬이 우세.

## 4. 외부 의존성

- **API 키**: **불필요.** 환경변수·외부 서비스 없음.
- **폴백 모드**: 해당 없음.
- **필요한 CLI/런타임/패키지**: 스크립트 없음. 예시 코드가 참조하는 것:
  - **Motion / Framer Motion** — `useSpring`, `useReducedMotion`, `useInView`, `motion.div`
  - **Base UI** — `var(--transform-origin)`, `[data-starting-style]`, `[data-ending-style]`, `[data-instant]`
  - 웹 표준: `@starting-style`, `clip-path`, `transform-style: preserve-3d`, WAAPI (`element.animate()`), `IntersectionObserver`
  - 디버깅: **Chrome DevTools Animations panel**, **Safari 원격 devtools**, 선택적으로 Xcode Simulator
- **네트워크**: 불필요. 참조 링크로 animations.dev, easing.dev, easings.co.
- **비용 발생 지점**: 없음 (단 첫 응답이 **유료 강좌 animations.dev를 홍보**함 — 도구 비용은 아니지만 편향으로 기록할 지점).

## 5. 워크플로우

이 스킬은 **하나의 선형 시퀀스가 아니다.** (a) 강제 초기 응답 게이트, (b) 리뷰 시 강제 출력 포맷, (c) 애니메이션 결정 프레임워크 4단계, (d) 주제별 지식 섹션들의 혼합 구조.

### 게이트 0. 강제 초기 응답
질문 없이 스킬이 켜지면 지정된 한 문단만 출력하고 **정지**. "Do not provide any other information until the user asks a question."

### 게이트 1. 리뷰 시 출력 포맷 강제 (**Review Format (Required)**)
"When reviewing UI code, you **MUST** use a markdown table with Before/After columns. **Do NOT** use a list with \"Before:\" and \"After:\" on separate lines."

원문이 올바른 예와 **틀린 예를 둘 다 제시**한다:
```
| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; avoid `all` |
```
틀린 형식(원문 "Wrong format (never do this)"):
```
Before: transition: all 300ms
After: transition: transform 200ms ease-out
```
"Correct format: A single markdown table with | Before | After | Why | columns, **one row per issue found**."

### The Animation Decision Framework — 4단계 순차
"Before writing any animation code, answer these questions **in order**:"

**1. Should this animate at all?** — **게이트 (탈락 가능)**

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | No animation. Ever. |
| Tens of times/day (hover effects, list navigation) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare/first-time (onboarding, feedback forms, celebrations) | Can add delight |

"**Never animate keyboard-initiated actions.** These actions are repeated hundreds of times daily." 근거로 Raycast.

**2. What is the purpose?** — **게이트 (탈락 가능)**
유효 목적 5개: Spatial consistency / State indication / Explanation / Feedback / Preventing jarring changes.
"If the purpose is just \"it looks cool\" and the user will see it often, don't animate."

**3. What easing should it use?** — **결정 트리** (다른 스킬은 표, 여기는 트리 형태)
```
Is the element entering or exiting?
  Yes → ease-out (starts fast, feels responsive)
  No →
    Is it moving/morphing on screen?
      Yes → ease-in-out
    Is it a hover/color change?
      Yes → ease
    Is it constant motion (marquee, progress bar)?
      Yes → linear
    Default → ease-out
```

**4. How fast should it be?** — duration 테이블 조회.

**앞 단계 산출물의 사용 관계**: 1·2단계가 코드 생성 여부를 결정하고, 3단계는 요소의 상태(entering/exiting/on-screen/hover/constant)를 입력으로 받아 곡선을 산출, 4단계는 요소 종류를 입력으로 duration을 산출. 3·4의 결과가 최종 `transition` 선언을 구성.

### 그 다음은 주제별 지식 섹션 (순서 없음)
- Perceived performance
- Spring Animations (when to use / mouse interactions / configuration / interruptibility)
- Component Building Principles (버튼 / scale(0) 금지 / origin-aware popover / tooltip 후속 즉시 표시 / transition vs keyframes / blur 마스킹 / `@starting-style`)
- CSS Transform Mastery (translateY %, scale이 자식 포함, 3D transform, transform-origin)
- clip-path for Animation (inset / 탭 컬러 전환 / hold-to-delete / 스크롤 리빌 / 비교 슬라이더)
- Gesture and Drag Interactions (momentum 해제 / boundary damping / pointer capture / multi-touch 보호 / friction)
- Performance Rules (transform·opacity만 / CSS 변수 상속 비용 / Framer Motion 단축 prop 함정 / CSS가 부하에서 우세 / WAAPI)
- Accessibility (`prefers-reduced-motion` / 터치 hover 게이팅)
- The Sonner Principles (6항목) + Cohesion / opacity+height / 다음날 리뷰 / 비대칭 타이밍
- Stagger Animations
- Debugging Animations (슬로모션 / 프레임별 / 실기기)

### 마지막. Review Checklist (11행)
리뷰 시 점검 항목. Review Format의 표와 함께 리뷰 산출물을 구성.

**사용자 확인 요구 지점**: 게이트 0(초기 응답 후 질문 대기)이 유일. 그 외에는 없음.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

**Review Checklist 테이블 (11행)** — 리뷰의 금지 목록:

| Issue | Fix |
| --- | --- |
| `transition: all` | Specify exact properties: `transition: transform 200ms ease-out` |
| `scale(0)` entry animation | Start from `scale(0.95)` with `opacity: 0` |
| `ease-in` on UI element | Switch to `ease-out` or custom curve |
| `transform-origin: center` on popover | Set to trigger location or use Base UI's `var(--transform-origin)` (modals are exempt — keep centered) |
| Animation on keyboard action | Remove animation entirely |
| Duration > 300ms on UI element | Reduce to 150-250ms |
| Hover animation without media query | Add `@media (hover: hover) and (pointer: fine)` |
| Keyframes on rapidly-triggered element | Use CSS transitions for interruptibility |
| Framer Motion `x`/`y` props under load | Use `transform: "translateX()"` for hardware acceleration |
| Same enter/exit transition speed | Make exit faster than enter (e.g., enter 2s, exit 200ms) |
| Elements all appear at once | Add stagger delay (30-80ms between items) |

본문의 추가 금지:
- "**Never animate keyboard-initiated actions.**"
- "**Never animate from scale(0).** Nothing in the real world disappears and reappears completely."
- "**Never use ease-in for UI animations.** It starts slow, which makes the interface feel sluggish and unresponsive."
- "**Critical: use custom easing curves.** The built-in CSS easings are too weak. They lack the punch that makes animations feel intentional."
- "**Don't create curves from scratch.**" (easing.dev / easings.co 사용)
- "The default `transform-origin: center` is **wrong for almost every popover**."
- "Keyframes restart from zero. ... **Not interruptible - avoid for dynamic UI**"
- "**Keep blur under 20px.** Heavy blur is expensive, especially in Safari."
- "Framer Motion's shorthand properties (`x`, `y`, `scale`) are **NOT hardware-accelerated**."
- CSS 변수: "**Bad: triggers recalc on all children** — `element.style.setProperty('--swipe-amount', ...)`"
- "**Don't require dragging past a threshold.**" (velocity도 봐야 함)
- "**Long delays make the interface feel slow.** Stagger is decorative — **never block interaction while stagger animations are playing.**"
- "Things in real life don't suddenly stop; they slow down first." (하드 스톱 금지)
- "Instead of preventing upward drag entirely, allow it with increasing friction. It feels more natural than **hitting an invisible wall**."
- Review Format: "**Do NOT** use a list with \"Before:\" and \"After:\" on separate lines." / "Wrong format (never do this)"

### 강제 규칙 — 수치 인용

**Easing 토큰 (3개)** — `animate`와 동일한 값:
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* Strong ease-out for UI interactions */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* Strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (from Ionic Framework) */
```

**Duration 테이블** — `animate`와 동일:

| Element | Duration |
| --- | --- |
| Button press feedback | 100-160ms |
| Tooltips, small popovers | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modals, drawers | 200-500ms |
| Marketing/explanatory | Can be longer |

"**Rule: UI animations should stay under 300ms.**"

**Spring 설정 (2 프리셋)**
```js
{ type: "spring", duration: 0.5, bounce: 0.2 }                // Apple's approach (recommended)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }      // Traditional physics
```
"Keep bounce subtle (**0.1-0.3**) when used."

마우스 인터랙션용 spring 값도 명시:
```js
useSpring(mouseX * 0.1, { stiffness: 100, damping: 10 })
```

**Scale 값**
- press: `transform: scale(0.97)`, transition `160ms ease-out`
- "The scale should be subtle (**0.95-0.98**)."
- entrance: "Start from `scale(0.9)` or higher, combined with opacity."

**Blur**
- `filter: blur(2px)` (crossfade 마스킹), opacity `0.7`, transition `200ms ease`
- 상한: "**Keep blur under 20px.**"

**Stagger**
- 딜레이 예시: `0ms / 50ms / 100ms / 150ms` (`:nth-child` 별)
- 규칙: "Keep stagger delays short (**30-80ms** between items)."
- 진입값: `opacity: 0; transform: translateY(8px)`, `animation: fadeIn 300ms ease-out forwards`

**제스처 임계값**
```js
const velocity = Math.abs(swipeAmount) / timeTaken;
if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) { dismiss(); }
```
"If velocity exceeds **~0.11**, dismiss regardless of distance."

**비대칭 타이밍**
- hold-to-delete: press `2s linear`, release `200ms ease-out`
- "slow where the user is deciding, fast where the system is responding."

**Tooltip 수치**: `125ms ease-out`, `scale(0.97)`, 후속 tooltip은 `transition-duration: 0ms`

**clip-path 값**
- 숨김: `inset(0 100% 0 0)` (오른쪽에서) / `inset(0 0 100% 0)` (아래에서)
- 표시: `inset(0 0 0 0)`
- 비교 슬라이더: `inset(0 50% 0 0)`
- 스크롤 리빌: `useInView`에 `{ once: true, margin: "-100px" }`

**3D orbit 예시**: `translateZ(72px)`

**Reduced motion 대체**: `animation: fade 0.2s ease;`

### 항목별 지침

- **타이포그래피**: **원문에 지침 없음.** `scale()`이 font-size를 함께 스케일한다는 사실만 언급.
- **컬러**: 값 지침은 **없음.** 다만 컬러 전환 기법이 있음 — "**Tabs with perfect color transitions**: Duplicate the tab list. Style the copy as \"active\" ... Clip the copy so only the active tab is visible. Animate the clip on tab change. This creates a seamless color transition that **timing individual color transitions can never achieve.**" 즉 색 전환을 색 애니메이션이 아니라 **클리핑으로 해결**하라는 지침.
- **스페이싱**: spacing scale **없음.** stagger의 `translateY(8px)`, orbit의 `translateZ(72px)` 정도의 개별 값.
- **모션**: 문서의 대부분. 위 강제 규칙 전체.
- **레이아웃**: `transform-origin` 앵커링, 3D `preserve-3d`, `translateY(100%)` 퍼센트 규칙.
- **성능**: "**Only animate transform and opacity.** These properties skip layout and paint, running on the GPU." / "**CSS variables are inheritable.** Changing a CSS variable on a parent recalculates styles for all children." / "**CSS animations beat JS under load.**" / WAAPI 권장.
- **접근성**: `prefers-reduced-motion`("fewer and gentler animations, not zero"), `@media (hover: hover) and (pointer: fine)`.

### 지침을 주는 방식 자체

이 스킬은 **컬렉션에서 가장 다양한 방식을 섞어 쓴다.**

1. **페르소나 부여 (명시적)**: "**You are a design engineer with the craft sensibility.** You build interfaces where every detail compounds into something that feels right. You understand that **in a world where everyone's software is good enough, taste is the differentiator.**"
2. **철학 선언 3개 섹션** — 규칙 앞에 세계관을 배치:
   - "**Taste is trained, not innate.** Good taste is not personal preference. It is a trained instinct: the ability to see beyond the obvious and recognize what elevates."
   - "**Unseen details compound.** Most details users never consciously notice. **That is the point.**"
   - "**Beauty is leverage.** ... Beauty is underutilized in software. Use it as leverage to stand out."
3. **외부 인용으로 권위 부여**: Paul Graham — "All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune."
4. **출력 포맷 강제 + 반례 제시**: MUST/Do NOT + "Wrong format (never do this)" 코드 블록. 이 컬렉션에서 유일하게 **틀린 출력 예시를 명시**하는 스킬.
5. **결정 트리** (§3 easing) — 다른 스킬은 표, 여기는 들여쓰기 트리.
6. **결정 테이블**: 빈도→결정, 요소→duration, 이슈→수정.
7. **실전 사례 서술**: "At Vercel, the dashboard tab animation used Shared Layout Animations and dropped frames during page loads. Switching to CSS animations (off main thread) fixed it." — 구체적 조직/제품의 실패 사례.
8. **제작 회고를 원칙화 (Sonner Principles, 6항목)**: "These principles come from building Sonner (13M+ weekly npm downloads)". 다운로드 수를 권위 근거로 사용.
9. **참조 대상 제시**: Raycast(애니메이션 부재), Apple Dynamic Island(살아있는 느낌), Ionic(drawer 곡선), Base UI, Sonner/Vaul(구현 참조), Family(drawer의 opacity+height), Vercel(성능 실패 사례).
10. **검증 절차 제공 (Debugging Animations)**: 슬로모션(2–5×) 시 볼 것 4가지를 질문 형태로 명시 —
    - "Do colors transition smoothly, or do you see two distinct states overlapping?"
    - "Does the easing feel right, or does it start/stop abruptly?"
    - "Is the transform-origin correct, or does the element scale from the wrong point?"
    - "Are multiple animated properties (opacity, transform, color) in sync?"
11. **체크리스트 검증**: Review Checklist 11행.
12. **강좌 홍보 내장**: 초기 응답에 animations.dev 링크 고정.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "feels great" / "feels right" | 4단계 결정 프레임워크 + 체크리스트 11항목 통과 |
| "taste is the differentiator" | "trained instinct" — 좋은 작업을 관찰하고 "Reverse engineer animations. Inspect interactions." |
| "unseen details compound" | popover origin, tooltip 후속 즉시 표시, 탭 숨김 시 타이머 정지 등 개별 조작의 합 |
| "feels sluggish and unresponsive" | `ease-in` 사용 → `ease-out`으로 교체. 근거: "ease-in delays the initial movement — the exact moment the user is watching most closely." |
| "feels more responsive" | 180ms vs 400ms. 그리고 `scale(0.97)` on `:active` |
| "makes the app feel like it loads faster" | "A **fast-spinning spinner**" — 실제 로드 시간 동일 |
| "the whole toolbar feel faster" | 첫 tooltip 이후 delay+animation 생략 (`transition-duration: 0ms`) |
| "feels alive" | spring 사용 (Dynamic Island 참조) |
| "feels artificial" (마우스 추적) | 즉시 갱신 대신 `useSpring`으로 보간 |
| "looks unnatural" (crossfade) | "you see two distinct objects during a crossfade" → `filter: blur(2px)`로 브리징 |
| "like a balloon that has a visible shape even when deflated" | `scale(0)` 금지, `scale(0.9)` 이상에서 시작 |
| "hitting an invisible wall" | 하드 스톱 → 증가하는 friction |
| "elegant" (Sonner) | "It is slightly slower than typical UI animations and uses `ease` rather than `ease-out`" — **자기 규칙(ease-out 기본)을 의도적으로 어긴 사례를 미학 근거로 제시** |
| "Match the motion to the mood" | "A playful component can be bouncier. A professional dashboard should be crisp and fast." |
| "it feels right" (opacity+height 조합) | **번역 불가로 명시** — "This is often trial and error. **There is no formula** — you adjust until it feels right." |
| "fresh eyes" | "Review your work the next day" + 슬로모션/프레임별 검사 |

특징: 대부분 수치로 환원하지만, **환원 불가 지점을 명시적으로 인정**한다("There is no formula"). 또한 Cohesion 섹션에서 **규칙을 어겨야 할 때**를 사례로 제시하는 점이 다른 스킬과 다르다.

## 7. 산출물

- **형식**:
  - **리뷰 시**: `| Before | After | Why |` 3열 마크다운 표 하나. 이슈당 1행. 리스트 형식 금지.
  - **구현 시**: CSS / JSX 코드. 출력 규격은 **원문에 명시 없음** (`animate`의 "Output" 섹션 같은 규정이 없음).
  - **초기 호출 시**: 지정된 한 문단 (강좌 링크 포함).
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- 톤 규정: 명시적 "Tone" 섹션은 없으나 페르소나 문단이 그 역할.

## 8. 주의점 / 한계

- **다른 스킬과의 대규모 중복** — 이 컬렉션의 가장 큰 구조적 문제:
  - Animation Decision Framework 1·2단계 ≒ `animate` Step 1·2 (빈도 테이블, purpose 목록이 거의 동일)
  - Easing 토큰 3개, duration 테이블, spring 프리셋 2개, stagger 30–80ms, scale(0.97), blur, `prefers-reduced-motion`, hover 게이팅 — **전부 `animate`와 중복**
  - Review Checklist 11행 ≒ `animate`의 Never Ship 13행 ≒ `review-animations`의 기준
  - Performance Rules(CSS 변수 / Framer Motion 단축 prop / CSS vs JS) — `animate` §4와 중복
  - 제스처·momentum·damping·pointer capture — `apple-design` §2·§5·§6·§9와 중복 (단 수치가 다름: 여기는 velocity `0.11`, apple-design은 `project()` 함수)
  - Tooltip·popover·drawer 레시피 — `animate/RECIPES.md`와 중복
  → **컬렉션 전체를 설치하면 같은 지식이 5개 스킬에 분산 중복**된다. `animate`가 이 스킬의 개선판(게이트·출력 규격·형제 스킬 라우팅이 명시된 버전)으로 보이며, 이 스킬은 그 전신 또는 통합본 성격.
- **description에 트리거가 없다**: "언제 켜야 하는지"가 명시되지 않아 활성화 조건이 불명확. `animate`/`review-animations`처럼 형제 스킬로 라우팅하는 문장도 없음 → 다른 스킬과 동시 활성화될 위험.
- **초기 응답 게이트의 부작용**: 질문 없이 켜지면 강좌 홍보 문단만 출력하고 정지. 자동화 파이프라인이나 다른 스킬이 이 스킬을 참조로 끌어올 때 마찰이 될 수 있음. 또한 상업적 링크가 스킬 동작에 고정되어 있음.
- **`clip-path` 섹션은 서술만, 코드 불완전**: "Tabs with perfect color transitions", "Comparison sliders"는 방법을 문장으로 설명하지만 완성 코드가 없음. hold-to-delete는 값이 명시되나 전체 마크업은 없음. 구현 시 추가 작업 필요.
- **`transition: all` 관련 자기모순 없음이지만 값 불일치 가능**: `review-animations`/`animate`와 값이 대부분 일치하나, 제스처 임계값(`velocity > 0.11`)은 `apple-design`의 `project()`/`rubberband()` 접근과 방법론이 다름. 같은 문제에 두 가지 처방이 컬렉션에 공존.
- **강한 경고 지점**:
  - "Do not provide any other information until the user asks a question."
  - "you MUST use a markdown table with Before/After columns"
  - "Never animate keyboard-initiated actions."
  - "Critical: use custom easing curves."
  - "Keep blur under 20px. Heavy blur is expensive, especially in Safari."
  - "Stagger is decorative — never block interaction while stagger animations are playing."
- **검증 장치**: 체크리스트(11행) + 디버깅 절차(슬로모션/프레임별/실기기)는 있으나 실행 가능한 스크립트·테스트는 없음. 전부 모델·사람의 육안 검증에 의존.
