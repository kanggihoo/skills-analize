# animate-expo 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/animate-expo/`
- **핵심 파일**: `SKILL.md` (17,564 bytes)
- **보조 파일**: `RECIPES.md` (16,808 bytes) — Setup the recipes assume / Two worklets you'll need everywhere / Press feedback / Bottom sheet you can drag to dismiss / Swipe to delete a row / Collapsing header on scroll / List entrances / Keyboard-synced UI / Tab·segmented indicator / Screen transitions (Expo Router) / Toast / Firing something once at a threshold
- **성격**: `animate`의 **React Native/Expo 판본**. 동일한 7단계 게이트 구조를 유지하되, 모바일 고유 제약(스레드, 제스처, 햅틱, 디바이스 검증)을 추가한 construction skill.

원문 자기 규정: "It turns a request for motion into an implementation that survives a strict review on a real device — not in the simulator, not on a flagship phone in dev mode."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring or timing, how the gesture hands off, how it degrades. Writes the implementation with Reanimated, Gesture Handler, Expo Router and expo-haptics. Use when animating anything in an Expo app, adding gestures, sheets, screen transitions, press feedback or haptics, or fixing motion that stutters on device. For web animation use `animate`."

**매칭되는 사용자 발화**
- "Expo 앱에서 바텀시트 드래그로 닫히게 해줘"
- "이 화면 전환 애니메이션 넣어줘" (RN 프로젝트 문맥)
- "제스처 추가", "press feedback", "햅틱 넣어줘"
- "**실기기에서 애니메이션이 버벅인다**" — `fixing motion that stutters on device`가 명시적 트리거. 즉 **디버깅 요청도 이 스킬로 라우팅됨** (웹 `animate`에는 없는 진입점).

**배제**: 웹 애니메이션 → `animate`.

`allowed-tools` / `metadata`: **원문에 명시 없음**.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- Expo/React Native 앱에 제스처 기반 모션(드래그 시트, swipe-to-delete, collapsing header)을 붙일 때
- 이미 만든 모션이 실기기에서 프레임 드랍하는 원인을 찾을 때 → "Setup that silently breaks motion" 섹션이 진단 체크리스트로 기능
- 햅틱을 설계에 편입할 때 — 웹 스킬에는 없는 8번 단계
- Reanimated 3 → 4 마이그레이션 맥락 (`runOnJS` → `scheduleOnRN`, `.value` → `.get()/.set()` 전환 규칙이 명시)

**부적합 / 과한 상황**
- 탭 전환, 키보드 개폐, 설정 토글 → Step 1에서 "**No animation.** Platform default or nothing. Stop here."
- 화면 전환을 직접 만들려는 시도 → "Screen to screen | **Native stack options in Expo Router.** Never hand-roll this"
- 바텀시트를 직접 구현하려는 시도 → `presentation: 'formSheet'`("it's a real UISheetPresentationController, free and correct")
- 탭바, 컨텍스트 메뉴, large title 헤더 → 각각 `NativeTabs`, `Link.Menu`/`Link.Preview`, `headerLargeTitleEnabled`로 위임
- 웹 프로젝트 → `animate`

**형제 스킬 대신 이걸 고르는 기준**: 플랫폼이 RN/Expo인가. 그리고 산출물이 코드인가. RN 코드베이스 감사·비평용 형제 스킬은 이 컬렉션에 없음(`review-animations`/`improve-animations`는 웹 기준).

## 4. 외부 의존성

- **API 키**: **불필요.** 환경변수, 외부 서비스 호출 없음.
- **폴백 모드**: 해당 없음.
- **필요한 CLI/런타임/패키지** — 원문이 표로 명시하며, **설치 명령까지 강제**:

  설치는 반드시 `npx expo install <package>` — "it resolves the version that matches the project's SDK, which plain `npm install` won't"

  | Need | Package |
  | --- | --- |
  | Animation | `react-native-reanimated` + `react-native-worklets` |
  | Gestures | `react-native-gesture-handler` |
  | Navigation, sheets, native tabs, menus | `expo-router` |
  | Haptics | `expo-haptics` |
  | Keyboard-following UI | `react-native-keyboard-controller` (needs `KeyboardProvider` at the root) |
  | Illustration, celebration | `lottie-react-native` |
  | Very large animated scenes, custom drawing | `@shopify/react-native-skia` |

- **런타임/환경 전제 조건 (하드)**:
  - "Reanimated 4 requires the **New Architecture**."
  - "`GestureHandlerRootView` must wrap the app, or gestures do nothing with no error."
  - Babel: "In an Expo project, `babel-preset-expo` configures the worklets Babel plugin automatically — no `babel.config.js` step. Only a bare RN project without that preset adds the plugin manually, and there it must be **last in the list**."
  - 120fps: `CADisableMinimumFrameDurationOnPhone: true` (미설정 시 서드파티 애니메이션이 60fps로 캡)
- **네트워크**: 패키지 설치 시에만 필요.
- **비용 발생 지점**: 없음 (유료 API 없음). 단 **실기기 검증 비용**이 있음 — "Feel is judged on a release build on the slowest device you support. Nothing else counts as verified."

## 5. 워크플로우

### 전제 프레임: "Mobile changes three things"
스킬 전체가 3개 명제에서 파생됨 (원문 그대로):
1. "**There is no hover.** Every affordance the web puts in hover has to live in press, position, or nothing."
2. "**There are two runtimes.** ... the React Native runtime ... and the UI runtime, where worklets run every frame ... An animation that touches the RN runtime stutters the moment the app does anything else. The whole craft is keeping motion on the UI runtime."
3. "**The user's finger is on the element.** Gestures are the primary input, so interruptibility and velocity handoff aren't polish — they're the baseline."

### Step 1. Should this animate at all? — **게이트 (탈락 가능)**

| Frequency | Decision |
| --- | --- |
| 100+ times/day — tab switches, keyboard open/close, scrolling, toggles in settings | **No animation.** Platform default or nothing. Stop here. |
| Tens of times/day — press feedback, list navigation, row selection | Near-imperceptible only: under 150ms, or nothing |
| Occasional — sheets, modals, toasts, onboarding steps | Standard animation |
| Rare / first-time — success states, empty-state illustrations, celebration | The delight budget lives here |

- 웹판과 다른 점: "keyboard open/close, scrolling, toggles in settings"가 100+/day 티어에 명시적으로 들어감.
- 절대 규칙: "**Tab switches never slide.** Tabs are peers, not a hierarchy — sliding implies depth that isn't there, and the user pays for it dozens of times a session. `animation: 'none'`."

### Step 2. What is the purpose? — **게이트 (탈락 가능)**
웹판과 동일한 6개 어휘: feedback / spatial consistency / state indication / preventing a jarring change / explanation / delight(rare tier only). "Can't name it? Don't build it."

### Step 3. Pick the tool — cheapest that works
"Walk down; stop at the first that fits." 15행 테이블 — 웹판(5행)보다 훨씬 큼. 핵심은 **대부분의 행이 "직접 만들지 말고 플랫폼 것을 써라"**로 되어 있다는 점:

| Need | Tool |
| --- | --- |
| 제스처 없는 state 변화 — press, toggle, color, 값 플립 | **Reanimated CSS transition** (`transitionProperty`) |
| Loop, multi-stage, mount 시 재생 | **Reanimated CSS animation** (`animationName` keyframes) |
| mount/unmount, 리스트 reflow | **Layout animations** (`entering`/`exiting`/`itemLayoutAnimation`) |
| 손가락이 닿는 것, scroll 파생 값 | **`useSharedValue` + `Gesture` + `useAnimatedStyle`** |
| Screen to screen | **Native stack options in Expo Router.** Never hand-roll this |
| 자기 화면인 바텀시트 | **`presentation: 'formSheet'`** |
| Tab bar | **`NativeTabs`** (`expo-router/unstable-native-tabs`) |
| 컨텍스트 메뉴, press-and-hold preview | **`Link.Menu` / `Link.Preview`** (iOS-only) |
| large title로 접히는 헤더 | **`headerLargeTitleEnabled`** (iOS-only; `headerLargeTitle`은 deprecated) — "not a scroll worklet" |
| Pull to refresh | **`RefreshControl`** — "hand-roll only when it's a signature interaction" |
| 키보드를 추적하는 UI | **`react-native-keyboard-controller`** |
| 벡터 일러스트, 축하, empty state | **Lottie** — "for illustration only, never for UI state" |
| 거대한 애니메이션 씬, freeform drawing | **`@shopify/react-native-skia`** |

임계 판단 기준: "Reach for a shared value only when the value is continuous or interruptible. A press scale is a CSS transition; a drag is a shared value. **Using a worklet for a two-state toggle is the mobile equivalent of installing a motion library for a fade.**"

### Step 4. Pick the properties
Step 3의 도구 위에서 무엇을 움직일지. 상세는 §6.

### Step 5. Timing or spring — **분기**
분기 조건이 단일 질문으로 압축됨: "**If a finger was involved, use a spring.** Springs carry velocity through an interruption; timing curves restart. Everything else uses timing."

### Step 6. Keep it off the JS thread — **모바일 고유 단계**
"This is the mobile-specific craft, and it's where most React Native motion dies." Step 4·5의 구현이 UI 런타임에 머무는지 검증. 웹판 Step 6(interruption/exit)을 대체.

### Step 7. Press, not hover — **모바일 고유 단계**
전제 명제 1에서 파생. "Every hover affordance from the web has to be redesigned, not ported."

### Step 8. Haptics — **모바일 고유 단계**
"Mobile has a sense the web doesn't."

### Step 9. Reduced motion and accessibility
웹판 Step 7에 대응. "ships with the animation, not as a follow-up" (하드룰 4).

### 부가 단계 A. Setup that silently breaks motion
"Check these first when 'the animation just doesn't run'" — **진단 진입점**. 순서상 마지막에 놓였으나 실제로는 디버깅 요청의 첫 단계.

### 부가 단계 B. 120fps 확인
`CADisableMinimumFrameDurationOnPhone` 확인 → "Then the frame budget is 8ms, not 16."

### 마지막. Never Ship 셀프체크
18행 금지 테이블 (웹판 13행보다 큼).

**사용자 확인 요구 지점**: 없음 — "Never present motion options as a menu." 사용자에게 넘기는 것은 출력의 "What to feel-check on device"뿐: "flick it, interrupt it mid-flight, reverse it, run it on the slowest Android you have."

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

"Never Ship" 테이블 전체:

| Never | Instead |
| --- | --- |
| `PanResponder` | `Gesture.Pan()` from gesture-handler |
| `setState` in a gesture or scroll handler | shared value + `useAnimatedStyle` |
| `runOnJS` (deprecated in Reanimated 4) | `scheduleOnRN` from `react-native-worklets` |
| `scheduleOnRN` per frame | `onEnd`, or `useAnimatedReaction` at a threshold |
| Reading or writing a shared value during render | `.get()` / `.set()` in worklets, handlers, effects |
| Core `Animated` for anything a finger touches | Reanimated |
| Animating `height` / `width` / `margin` / `flex` / `top` | `transform` + `opacity` (absolute, childless elements exempt) |
| Animating `BlurView` intensity or Android `elevation` | crossfade a static layer |
| `entering` on a virtualized list row | animate the container, or `itemLayoutAnimation` |
| A screen transition rebuilt in JS | native stack `animation` |
| Sliding between tabs | `animation: 'none'` |
| `Easing.in(...)` on a UI element | `Easing.bezier(0.23, 1, 0.32, 1)` |
| `scale(0)` entrance | `scale(0.95)` + `opacity: 0` |
| Distance-only dismissal threshold | velocity **or** distance — a flick is enough |
| Hard stop at a boundary | rubber-band resistance |
| A haptic per frame, or as the only feedback | one per commit, always paired with a visual |
| Judging feel in Expo Go or the simulator | release build, slowest supported device |

본문의 추가 금지:
- "**Reanimated, not core `Animated`.** Core `Animated` can't be driven by a gesture without crossing the bridge, and `useNativeDriver` refuses anything but transform and opacity anyway."
- "**Never `scale(0)`.** Start from `scale(0.9–0.97)` + `opacity: 0`. Nothing in the real world appears from nothing."
- "**Never animate `BlurView` intensity.** On Android it re-renders the blur each frame."
- "**Android shadows are `elevation`, and animating elevation re-renders the shadow every frame.** Animate opacity of a pre-shadowed layer instead."
- "**Never `setState` from a gesture or scroll handler.** One React render per frame is the single biggest cause of jank in RN apps."
- "**Never schedule back to the RN runtime inside `onUpdate` or a scroll handler.** ... in `onUpdate` that's 60–120× per second."
- "**Never read a shared value during render** (`translateY.get()` in JSX). It's a snapshot that never updates and it silently desyncs. **Never write one during render either**"
- "**Never `ease-in` on UI.** ... Reanimated's built-ins are as weak as CSS's"
- "**Never animate to a hardcoded height** — measure with `onLayout`, or animate a transform instead."
- "**Expo Go is not a performance environment.**"

### 강제 규칙 — 수치 인용

**Easing 토큰 (3개, 웹판과 동일한 값)**
```js
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // strong ease-out for UI
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet curve
```

**Spring 설정 — Apple의 2-파라미터 형식 강제**
"Reanimated's spring takes Apple's two designer parameters directly — use this form, **not mass/stiffness/damping**"

| Interaction | Config |
| --- | --- |
| Default settle, no overshoot | `{ duration: 400, dampingRatio: 1 }` |
| Reposition / snap back after a drag | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| Sheet, drawer | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| Must not pass a hard edge | add `overshootClamping: true` |

- "**Bounce only when the gesture carried momentum.** Overshoot on a menu that faded in feels wrong; overshoot on a card you flicked feels right."

**Easing 선택 순서**

| Situation | Easing |
| --- | --- |
| Entering or exiting | `ease-out` |
| Moving / morphing on screen | `ease-in-out` |
| Constant motion (progress, marquee) | `linear` |
| Default | `ease-out` |

**Duration**

| Element | Duration |
| --- | --- |
| Press feedback | 100–150ms |
| Toggle, chip, small state change | 150–200ms |
| Sheet, modal, drawer | spring, ~300ms perceived |
| Screen transition | the platform default — don't override it |

- "Mobile UI animations stay under 300ms, same as web. The platform's own transitions are longer (**iOS push is 350ms**); match the platform for navigation, beat it everywhere else."

**터치 타깃 / 프레스 수치**
- "**`scale: 0.97` in 100–150ms** on any pressable"
- "**44×44pt minimum touch target** (48dp Android). If the visual is smaller, add `hitSlop` — don't grow the visual."
- `pressRetentionOffset` 사용 — "so a finger drifting a few pixels doesn't cancel a press the user meant"

**프레임 예산**
- 60fps → 16ms, 120fps(ProMotion) → **8ms**

**햅틱 매핑 테이블**

| Moment | Call |
| --- | --- |
| A value ticks past a step — picker, slider detent, segmented control | `Haptics.selectionAsync()` |
| Something snaps home, a sheet detent catches, a drag commits | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| A heavy object lands, a destructive action fires | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` |
| Operation succeeded or failed | `Haptics.notificationAsync(NotificationFeedbackType.Success / Error)` |

### 항목별 지침

- **타이포그래피**: 접근성 관점에서만 — "**Text scales.** `allowFontScaling` is on by default, so any height you measured at default type size is wrong at 200%." 서체·크기 지침은 **원문에 명시 없음**.
- **컬러**: "color, a value flipping"이 CSS transition 대상으로 언급될 뿐. 팔레트 지침 **없음**.
- **스페이싱**: 터치 타깃(44×44pt / 48dp)과 `hitSlop`, `pressRetentionOffset`이 유일한 공간 규칙. spacing scale **없음**.
- **모션**: 전체. 위 강제 규칙 참조.
- **레이아웃**: `transform`이 배열이며 순서가 결과를 바꾼다는 규칙 — "`[{ translateY }, { scale }]` scales after moving; reversed, the translate gets scaled too. **Keep translate first unless you want the multiplication.**"
- **속성 선택**: "**`transform` and `opacity` are free.** Everything else is a layout pass. `width`, `height`, `margin`, `padding`, `flex`, `top`, `left`, `gap` re-run Yoga on every frame for that node *and its siblings*." 예외 1개 — "**an absolutely positioned element with no children** — a tab pill, a progress bar fill. It's out of flow, so nothing else re-lays-out, and animating `width` keeps the corner radius that `scaleX` would smear."
- **단위**: "**Percentages work in `translate`** and are relative to the element's own size — `translateY('100%')` moves a sheet by its own height whatever its content."
- **접근성 / reduced motion**: "Reduced motion means **fewer and gentler**, not zero: keep opacity and color changes that explain a state change, drop translation, scale, parallax and overshoot. Screen transitions become `animation: 'fade'`."
- **플랫폼 일관성**: "**Android ripple only in a Material-styled app.** In a custom-designed app, the same scale on both platforms is more coherent than a ripple on one."
- **햅틱 3대 절대 규칙** (원문 "Three rules, and they're absolute"):
  1. "**Same frame as the visual.** A haptic that lags its animation reads as a glitch, not as feedback. Fire it at the causal moment — the detent catching — not when the animation finishes."
  2. "**One per user action.** Never on scroll, never per frame, never on an entrance animation the user didn't cause."
  3. "**Never the only feedback.** Haptics are off system-wide for many users, and silent on most Android hardware. The visual has to stand alone."

### 지침을 주는 방식 자체

1. **공리에서 연역**: "Mobile changes three things about animation, and **everything in this skill follows from them**" — 3개 명제 → 9단계 구조. 이 컬렉션에서 가장 명시적인 연역 구조.
2. **결정 테이블 중심**: 빈도→결정, 필요→도구(15행), 상호작용→spring config, 요소→duration, 순간→햅틱 호출. 산문보다 표가 규범.
3. **게이트 + 실패 모드 서열화**: 웹판과 동일. 단 두 번째 실패 모드가 모바일 특화됨 — "Animating the right thing on the **wrong thread** ... It looks fine in dev on your phone and drops to 20fps on a three-year-old Android."
4. **위임 우선 테이블**: Step 3의 대부분 행이 플랫폼 네이티브 컴포넌트를 지목. "Never hand-roll this"가 반복 등장.
5. **버전 마이그레이션 규칙 내장**: `runOnJS`→`scheduleOnRN`, `.value`→`.get()/.set()`, `headerLargeTitle`→`headerLargeTitleEnabled`. 즉 최신성 관리가 지침에 포함.
6. **침묵 실패 목록**: "Setup that silently breaks motion" — 에러 없이 실패하는 케이스를 별도 섹션으로 분리. "gestures do nothing with no error", "throws `Failed to create a worklet` at runtime", "working fine in the debugger" 등 **디버깅 난이도 정보까지 제공**.
7. **검증 환경 규정**: 하드룰 5 — "Feel is judged on a release build on the slowest device you support. **Nothing else counts as verified.**"
8. **실물 참조**: Apple(spring 2-파라미터), iOS(sheet curve, push 350ms, UISheetPresentationController), Material(ripple).
9. **금지 규칙에 물리적 근거 부착**: Yoga 재실행, GPU, 60–120×/sec, 브리지 통과, 블러 재렌더 등.

### 모호한 감각어의 번역

- "**feel right**" → 9단계 결정 순서. description: "making the decisions in the order that determines whether they feel right".
- "**feels dead**" → 프레스 타이밍으로 번역: "**Feedback on press-in, commit on press-out.** Waiting for the tap to complete before showing anything feels dead — this is the latency the user actually perceives."
- "**read as physical**" → `scale`이 자식을 함께 스케일하는 사실로 번역: "`scale` takes the label and icons with it, which is what makes it read as physical."
- "**feel expensive**" → 햅틱의 절제로 번역: "Use it sparingly and it becomes the thing that makes the app feel expensive; use it everywhere and users turn it off."
- "**reads as a glitch**" → 햅틱과 비주얼의 프레임 동기로 번역: "A haptic that lags its animation reads as a glitch, not as feedback."
- "**feels wrong / feels right**" → 오버슈트 조건으로 번역: "Overshoot on a menu that faded in feels wrong; overshoot on a card you flicked feels right."
- "**implies depth that isn't there**" → 탭 슬라이드 금지로 번역: "Tabs are peers, not a hierarchy."
- **판정 불가능한 감각은 디바이스 검증으로 이송**: "gestures, velocity handoff and haptic timing **cannot be judged from code**." — 웹판과 동일한 태도지만 검증 조건이 더 엄격(릴리즈 빌드 + 최저 사양 기기).

## 7. 산출물

- **형식**: 구현 코드 (JSX + Reanimated / Gesture Handler / Expo Router / expo-haptics), 필요 시 `app.json`의 `infoPlist` 설정.
- **코드 뒤 요약 3항목**:
  1. **The gate result** — frequency tier + named purpose, "Say what you rejected and why."
  2. **The ingredients** — tool, properties, spring 또는 curve + duration, **thread** (웹판에 없는 항목)
  3. **What to feel-check on device** — "flick it, interrupt it mid-flight, reverse it, run it on the slowest Android you have."
- "The code is the deliverable. Don't pad it into a report."
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.** 기존 Expo 프로젝트 구조(`_layout`, `app/`)에 인라인 작성 전제.

## 8. 주의점 / 한계

- **New Architecture 필수**: "Reanimated 4 requires the New Architecture." 레거시 아키텍처 프로젝트에는 이 스킬의 대부분이 적용 불가 — 대안은 **원문에 명시 없음**.
- **iOS 편향**: `Link.Menu`/`Link.Preview`, `headerLargeTitleEnabled`, `formSheet`, `CADisableMinimumFrameDurationOnPhone`이 모두 iOS 전용 또는 iOS 우선. Android 대응은 "Android ripple only in a Material-styled app", "elevation", "on most Android hardware" 정도의 경고성 언급에 그침 — Android 등가물은 원문에 명시 없음.
- **`unstable-native-tabs`**: `NativeTabs`가 `expo-router/unstable-native-tabs`에서 온다고 명시 — 이름 그대로 불안정 API에 의존.
- **검증 비용이 실질 장벽**: "Judging feel in Expo Go or the simulator"가 Never Ship 목록에 있어, 최저 사양 Android 실기기 + 릴리즈 빌드 없이는 스킬의 완결 조건을 만족할 수 없음. 이 검증을 대신할 자동 장치(측정 스크립트 등)는 제공되지 않음.
- **버전 종속성이 높음**: Reanimated 4 / Expo SDK / `react-native-worklets` 분리 / deprecated API가 규칙에 직접 박혀 있어, SDK가 올라가면 SKILL.md가 낡음. 웹판보다 노후화 속도가 빠른 구조.
- **강한 경고 지점**:
  - "Tab switches never slide."
  - "Never hand-roll this" (스크린 전환)
  - "Lottie — for illustration only, never for UI state"
  - 햅틱 "Three rules, and they're absolute"
  - "Nothing else counts as verified."
  - "Expo Go is not a performance environment."
- **다른 스킬과의 충돌**: 웹 `animate`와 값(easing 토큰, scale 0.97, 300ms 상한)이 공유되므로 철학 충돌은 없음. 다만 RN 코드에 대한 리뷰·감사 스킬이 컬렉션에 없어, `review-animations`/`improve-animations`를 RN 코드에 적용하면 웹 기준(`transition: all`, `@media (hover: hover)` 등)이 오작동할 소지가 있음.
