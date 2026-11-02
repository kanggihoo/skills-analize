# emilkowalski 애니메이션 스킬 7종 분석

공통 사항:
- 모든 폴더에 `*.ko.md`가 있다. 원본 `.md`를 한국어로 옮긴 번역본이고(줄 수가 거의 같다: AUDIT 115/117, STANDARDS 187/188, PLAN-TEMPLATE 73/74, 나머지는 동일), 사용자 커밋("skill translations")으로 추가된 것이라 스킬 동작에는 영향이 없다. 아래 분석은 원본 `.md`를 기준으로 했다.
- 7개 모두 같은 "Initial Response" 패턴을 쓴다. 질문 없이 호출되면 정해진 한 문장("I'm ready to ..., my knowledge comes from Emil Kowalski's animation philosophy.")만 답하고 다른 말은 하지 않는다.
- 7개 모두 "It does ONE thing" 선언과 함께 형제 스킬로 넘기는 경계를 명시한다.
- 스크립트, MCP, 외부 바이너리는 하나도 없다. 전부 순수 마크다운 지식과 절차다.

---

## emilkowalski/animate
- 파일 구성:
  - `SKILL.md` (207줄): 7단계 빌드 시퀀스, 토큰과 표, Never Ship 표, 출력 형식
  - `RECIPES.md` (324줄): 웹 컴포넌트별 바로 쓰는 CSS/JS 레시피 14종
  - `SKILL.ko.md`, `RECIPES.ko.md`: 번역본
- frontmatter: `name: animate`. description: "Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which properties, which curve and duration, how it interrupts, how it exits. Writes the implementation. Use when asked to animate something, add motion, make a component feel alive, or build a transition. For critiquing existing motion use review-animations; for auditing a whole codebase use improve-animations." 호출 플래그는 없다(모델 자동 호출 가능).
- 트리거/언제 쓰나: 웹에서 "이거 애니메이션 넣어줘", "살아있는 느낌", "트랜지션 만들어줘" 같은 요청. 새 모션을 만들 때 쓴다.
- 입력 → 출력: 입력은 애니메이션 요청과 대상 코드. 출력은 **코드 수정(구현)**과 짧은 메모 3줄(게이트 결과, 재료, feel-check 포인트). "Don't pad this into a report."
- 동작 흐름:
  1. 빈도 게이트: 100+/일이거나 키보드로 시작하는 동작이면 즉시 중단하고 애니메이션 없는 대안을 제시한다. "zero lines of code sometimes. That's a success".
  2. 목적을 한 단어로 명명한다(Feedback / Spatial consistency / State indication / Preventing a jarring change / Explanation / Delight). 명명하지 못하면 만들지 않는다. 읽거나 조작해야 하는 데이터는 스타일 목적으로 움직이지 않는다는 function 검사도 한다.
  3. 도구 선택: 가장 싼 것부터 내려간다. CSS transition → `@starting-style` → CSS animation → WAAPI → Motion. toast, drawer, dropdown처럼 "컴포넌트"가 필요하면 `pick-ui-library` 스킬로 넘긴다.
  4. 속성 선택: transform/opacity만 쓴다(clip-path 허용, 아코디언에 한해 height 허용).
  5. easing/duration 표 또는 spring을 고른다.
  6. 중단(interrupt)과 exit 설계.
  7. reduced-motion과 hover gating을 함께 넣는다.
  8. 요청이 RECIPES에 해당하면 레시피에서 시작한다.
  9. Never Ship 표로 자가 점검한 뒤 출력한다.
  질문을 하거나 서브에이전트를 쓰는 단계는 없다. "Never present motion options as a menu. Make the call".
- 핵심 규칙/지식:
  - 토큰: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. 임의 curve를 만들지 말고 필요하면 easing.dev나 easings.co에서 가져온다.
  - Duration: press 100–160ms, tooltip 125–200, dropdown 150–250, modal/drawer 200–500. "UI animations stay under 300ms."
  - Easing 결정 순서: 진입/퇴장은 ease-out, 화면 내 이동은 ease-in-out, hover/색상은 ease, 상시 모션은 linear. "Never `ease-in` on UI."
  - Spring: `{ type: "spring", duration: 0.5, bounce: 0.2 }`, bounce는 0.1–0.3.
  - `scale(0)` 금지. `scale(0.9–0.97)`과 opacity 0에서 시작한다. popover는 `transform-origin: var(--transform-origin)`을 쓰고 modal은 예외다.
  - Motion의 `x`/`y`/`scale` 단축 prop 대신 전체 `transform` 문자열을 쓴다(하드웨어 가속).
  - 부모 CSS 변수로 자식의 transform을 구동하지 않는다.
  - 빠르게 반복 트리거되는 요소는 keyframe이 아니라 transition으로 만든다(transition은 현재 값에서 retarget한다).
  - 비대칭 타이밍: hold-to-confirm은 누를 때 2s linear, 뗄 때 200ms ease-out.
  - 레시피 예: tooltip은 하나가 열린 뒤 이웃 tooltip을 `transition-duration: 0ms`로 즉시 연다. 탭 색상 전환은 탭 리스트를 복제해 clip-path로 처리한다. drag dismiss는 `velocity > 0.11`, pointer capture, 멀티터치 보호, 경계에서 damping. crossfade는 `blur(2px)`로 이음새를 가린다(20px 미만).
- 의존성: `pick-ui-library`(컴포넌트가 필요할 때), 문맥상 Base UI/Motion 전제. 스크립트는 없다.
- 장점 (가져올 만한 것): "애니메이션 안 함"을 성공으로 정의하는 게이트 순서, 수치가 박힌 결정 표, Never Ship 자가 점검 표, 출력을 코드와 3줄 메모로 제한하는 규칙, feel-check 안내(2–5배 슬로우, 다음날 다시 보기).
- 단점/한계 (버릴 만한 것): Base UI의 `var(--transform-origin)`과 Motion에 편향되어 있다. 표와 토큰이 review/improve/find 스킬과 사실상 복붙이라 유지보수 부담이 생긴다. 웹 전용이다. 실행이나 검증 수단(브라우저 확인 등)이 없다.

## emilkowalski/animate-expo
- 파일 구성:
  - `SKILL.md` (263줄): RN/Expo용 9단계 빌드 시퀀스, 셋업 함정, 120fps, Never Ship
  - `RECIPES.md` (385줄): Reanimated 4, Gesture Handler, Expo Router 레시피와 공용 worklet(`project`, `rubberband`)
  - `*.ko.md`: 번역본
- frontmatter: `name: animate-expo`. description: "Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring or timing, how the gesture hands off, how it degrades. Writes the implementation with Reanimated, Gesture Handler, Expo Router and expo-haptics. Use when animating anything in an Expo app, adding gestures, sheets, screen transitions, press feedback or haptics, or fixing motion that stutters on device. For web animation use `animate`." 호출 플래그는 없다.
- 트리거/언제 쓰나: Expo/RN 앱의 모션, 제스처, 시트, 화면 전환, haptics 작업, 그리고 기기에서 모션이 끊길 때.
- 입력 → 출력: 요청과 코드를 받아 **코드를 구현**하고, 게이트 결과, 재료(스레드 포함), 기기에서 확인할 항목을 짧게 덧붙인다.
- 동작 흐름: animate와 같은 골격에 모바일 단계가 추가된다.
  1. 빈도 게이트("Tab switches never slide", `animation: 'none'`)
  2. 목적 명명
  3. 도구 선택: Reanimated CSS transition → CSS animation → layout animations → shared value와 Gesture → Expo Router native stack, `formSheet`, `NativeTabs`, `Link.Menu`, `headerLargeTitleEnabled`, `RefreshControl`, keyboard-controller, Lottie, Skia. 설치는 `npx expo install`로 한다.
  4. 속성 선택
  5. timing과 spring 중 선택
  6. JS 스레드 밖에서 실행되게 유지
  7. hover 대신 press
  8. haptics
  9. reduced motion과 접근성
  그 뒤 셋업 함정 점검, 레시피 사용, Never Ship 점검 순서로 진행한다.
- 핵심 규칙/지식:
  - "Reanimated, not core `Animated`." `PanResponder` 금지. `runOnJS`는 deprecated이므로 `scheduleOnRN`을 쓰되 `onUpdate` 안에서는 쓰지 않는다(`onEnd`나 `useAnimatedReaction`에서 호출).
  - 제스처/스크롤 핸들러에서 `setState` 금지. shared value는 `.get()/.set()`으로만 다루고(React Compiler 대응), render 중에는 읽지도 쓰지도 않는다. worklet 함수에는 `'worklet'` 지시어가 필요하다.
  - Spring은 Apple식 파라미터로 쓴다: 기본 `{ duration: 400, dampingRatio: 1 }`, drag 후 `{400, 0.8, velocity}`, sheet `{300, 0.8, velocity}`, 경계는 `overshootClamping`. "If a finger was involved, use a spring." bounce는 제스처에 운동량이 있을 때만 쓴다.
  - Easing은 웹과 같은 3개 bezier(`Easing.bezier(...)`). press 100–150ms, toggle 150–200ms. 화면 전환은 플랫폼 기본값을 쓴다(iOS push 350ms).
  - 예외: 자식이 없는 absolute 요소(탭 pill, progress)는 width 애니메이션을 허용한다. scaleX를 쓰면 radius가 뭉개지기 때문이다. Android `elevation`과 `BlurView` intensity는 애니메이션하지 않고 정적 레이어를 crossfade한다. transform 배열 순서에 주의한다.
  - Press: press-in 때 피드백, press-out 때 커밋, `scale 0.97`. 터치 영역은 44pt/48dp 이상이고 부족하면 `hitSlop`을 쓴다. `pressRetentionOffset`. ripple은 Material 앱에서만 쓴다.
  - Haptics 표(selection / impact Light·Medium / notification)와 절대 규칙 3개: 시각 효과와 같은 프레임, 사용자 동작 하나에 하나, 유일한 피드백으로 쓰지 않음.
  - 셋업: `GestureHandlerRootView`가 없으면 에러 없이 아무 일도 일어나지 않는다. Reanimated 4는 New Architecture가 필수다. Expo Go는 성능 환경이 아니다. 120fps를 쓰려면 `CADisableMinimumFrameDurationOnPhone`가 필요하고, 그러면 프레임 예산은 8ms다.
  - 레시피: 운동량 투영 `project(v, 0.998)`(Apple식 지수 감쇠), `rubberband(overshoot, dim, 0.55)`. 시트에서는 `onStart`에 현재 값을 캡처하고, 거리 대신 velocity로 dismiss를 판단하고, velocity를 spring에 넘긴다. 스와이프 삭제는 먼저 `ReanimatedSwipeable` 사용을 검토한다. `activeOffsetX`로 스크롤과 충돌을 막는다. 가상화 리스트 row에는 `entering`을 금지한다. header height는 애니메이션하지 않는다. 키보드는 `useReanimatedKeyboardAnimation`. toast exit은 enter보다 약 20% 빠르게 하고 safe area를 지킨다. 임계값 감지는 `useAnimatedReaction`. Gesture Handler v3 차이도 정리되어 있다.
  - "Feel is judged on a release build on the slowest device you support."
- 의존성: `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`, `expo-router`, `expo-haptics`, (선택) `react-native-keyboard-controller`, `lottie-react-native`, `@shopify/react-native-skia`. 다른 스킬은 호출하지 않는다(웹은 `animate`로 넘긴다).
- 장점: 7개 중 가장 실전적이고 최신 API(Reanimated 4, scheduleOnRN, .get/.set, GH v3)를 반영한다. "네이티브 컴포넌트 먼저, 직접 구현은 마지막" 도구 사다리, haptics 규칙, 셋업 함정 체크리스트, `project`/`rubberband` worklet 코드는 그대로 가져올 만하다.
- 단점/한계: Expo/Reanimated 버전에 강하게 묶여 있어 빨리 낡는다. 비-Expo RN이나 Flutter/네이티브에는 적용하기 어렵다. 분량(약 650줄)이 커서 컨텍스트 비용이 높다. 웹 animate와 게이트, easing, 목적 부분이 중복된다.

## emilkowalski/animation-performance
- 파일 구성: `SKILL.md` (222줄) 단일 파일, 진단 지식과 3단계 워크플로. `SKILL.ko.md`는 번역본.
- frontmatter: `name: animation-performance`. description: "Keep web animations inside the frame budget — animate composite-only properties, keep motion off the main thread when the page is busy, and find the cause when an animation drops frames. Covers the layout/paint/composite pipeline, cheaper property swaps, CSS vs WAAPI vs requestAnimationFrame, Framer Motion's hardware-accelerated path, React re-rendering per frame, inherited CSS variable recalculation, blur cost, and when `will-change` actually helps. Use when an animation is janky, choppy, stutters, or drops frames; ... For choosing easing, duration, or whether to animate at all use animate; for reviewing motion as a whole use review-animations." 호출 플래그는 없다.
- 트리거/언제 쓰나: jank, 끊김, 프레임 드랍이 있을 때, 어떤 속성을 애니메이션할지 고를 때, CSS와 JS를 성능 기준으로 비교할 때, `will-change` 사용을 고민할 때.
- 입력 → 출력: 문제 증상과 코드를 받아 **진단 리포트**(finding별 Cause/Before/After/Verified)를 낸다. "Then stop. Apply fixes when asked." 즉 기본적으로 수정하지 않고, 요청이 있을 때만 수정한다.
- 동작 흐름:
  1. 증상 표(Symptom Table)에서 해당 증상을 찾는다.
  2. Phase 1: 범위 안의 모든 애니메이션을 표로 정리한다(Element / Driver / Properties / Plays during). `transition: all`과 Motion 단축 prop은 실제로 애니메이션되는 속성으로 풀어 쓴다.
  3. Phase 2: 빈도순 7단계 진단 목록으로 내려간다. 속성 → 바쁜 메인 스레드 → 프레임마다 React re-render → 콘텐츠 증가에 따른 악화(상속 CSS 변수) → CSS 변수 애니메이션 → blur 20px 초과 → 마지막에 will-change.
  4. 녹화로 확인한다(DevTools Performance/Animations 패널, 실제 중급 폰 원격 디버깅). "CPU throttling ... models a slow CPU, not a weak GPU".
  5. Phase 3: 비용순으로 리포트한다(layout이 paint보다, 바쁜 스레드가 한가한 스레드보다 먼저).
- 핵심 규칙/지식:
  - Hard Rule: "Name the cause before changing code." "Never conclude 'it's fine' from a fast machine." 코드로 확인한 것과 기기 녹화가 필요한 것을 구분해서 쓴다.
  - 프레임 예산: 16.7ms, 120Hz에서는 8ms. 작은 쪽을 기준으로 설계한다.
  - 3단계 속성 표: composite(transform, opacity, 그리고 최근 Chrome/FF에서 filter, clip-path, background-color) / paint(box-shadow, border-radius, color) / layout.
  - 한 단계 아래로 바꾸기: width/height → scale, top/left/margin → translate, display → opacity, `box-shadow` → `filter: drop-shadow()`.
  - 스레드 표: rAF(GSAP, motion/react 컴포넌트)는 항상 메인 스레드다. WAAPI와 CSS는 가속될 수 있다. 사례로 Vercel 탭 인디케이터를 layoutId에서 CSS로 옮긴 것과 Vaul의 상속 CSS 변수 문제(~20개 아이템)를 든다.
  - Framer `x/y` 단축 prop은 CSS 변수로 구현되어 가속되지 않는다. 기본으로는 단축 prop을 유지하고, 바쁜 페이지에서만 문자열 form으로 바꾼다(animate 스킬보다 완화된 입장).
  - `will-change`는 1px 흔들림을 보았거나 측정했을 때만, 애니메이션되는 요소에만 붙인다.
  - React: 매 프레임 `setState` 대신 `ref.current.style.transform`이나 motion value를 쓴다.
- 의존성: 없음(DevTools 사용을 권장할 뿐이다).
- 장점: 증상 → 원인 → 처방 표, 원인을 먼저 명명하라는 규칙, "verified from code / needs a device recording" 표기, 빈도순 진단 체크리스트. 성능 지식을 체계적으로 정리한 가장 좋은 문서다.
- 단점/한계: 웹 전용이고 수정은 요청이 있어야 한다. animate의 성능 규칙과 일부 중복되며, Framer 단축 prop에 대한 입장이 animate/review("항상 문자열")와 미묘하게 다르다(여기서는 "기본은 단축 prop, 바쁠 때만 문자열"). 자동 측정 스크립트는 없다.

## emilkowalski/animation-vocabulary
- 파일 구성: `SKILL.md` (181줄) 단일 파일, 지시 6개, 예시 3개, 12개 카테고리 용어집(약 95개 용어). `SKILL.ko.md`는 번역본.
- frontmatter: `name: animation-vocabulary`. description: "Reverse-lookup glossary that turns a vague description of a web animation or motion effect into its exact term ('the bouncy thing when a popover opens' → Pop in; 'the iOS rubber-band scroll' → Rubber-banding). Use when the user asks 'what's it called when…', or describes a motion effect without knowing its name and wants the right word to prompt an AI or designer with. For naming an effect, not designing or building one." 호출 플래그는 없다.
- 트리거/언제 쓰나: "이 효과 이름이 뭐야?"처럼 모호한 묘사를 정확한 용어로 바꾸고 싶을 때.
- 입력 → 출력: 효과 묘사를 받아 `**Term** — 정의`를 1개 내고, 필요하면 대안 1–2개와 차이를 한 줄로 덧붙인다. 코드 수정은 없다.
- 동작 흐름: (1) 키워드가 아니라 감각과 의도로 읽는다. (2) 용어집 정의를 그대로 인용하고 paraphrase하지 않는다. (3) 가까운 용어끼리 구분한다(Clip-path vs Mask, Pop in vs Bounce, Shared element vs Layout animation). (4) 정확히 맞는 것이 없으면 근사라고 밝히거나 용어를 조합한다("stagger of scale-in"). (5) 용어집 밖의 용어를 만들어내지 않는다. (6) 짧게 답한다.
- 핵심 규칙/지식: 카테고리는 Entrances & Exits / Sequencing & Timing / Movement & Transforms / Transitions Between States / Scroll / Feedback & Interaction / Easing / Spring / Looping & Ambient / Polish & Effects / Performance / Principles. "keep the two in sync" 주석이 있어 외부 `/vocabulary` 페이지와 동기화되는 스냅샷이다.
- 의존성: 없음.
- 장점: 사용자와 에이전트가 공유할 용어 사전으로 재사용하기 좋다. "verbatim 인용, 지어내지 않음, 근사임을 명시"하는 규칙은 환각 방지 패턴으로 쓸 만하다. 가볍다.
- 단점/한계: 지식 수치(duration, easing)가 없는 순수 용어집이다. 단독 스킬로 두기에는 활용 빈도가 낮을 수 있으니 다른 스킬의 reference 파일로 흡수하는 편이 낫다. 웹 중심이다.

## emilkowalski/find-animation-opportunities
- 파일 구성: `SKILL.md` (140줄) 단일 파일, 4단계 게이트, 사냥 목록, 3부 출력 형식. `SKILL.ko.md`는 번역본.
- frontmatter: `name: find-animation-opportunities`. description: "Search a codebase or UI for places that don't animate but should, and reject everything that shouldn't. Read-only; it proposes motion with exact values, it does not implement it. Use when the user asks 'what could be animated here?' or wants to 'make this feel more alive'. For fixing existing animations, use improve-animations or review-animations instead." 호출 플래그는 없다.
- 트리거/언제 쓰나: "여기서 뭘 애니메이션할 수 있을까?", "더 살아있게 만들어줘"처럼 아직 모션이 없는 곳을 찾을 때.
- 입력 → 출력: 코드베이스나 화면을 받아 **읽기 전용 리포트**(기회 표, 기각 후보 목록, 판정)를 낸다. 소스는 수정하지 않는다.
- 동작 흐름:
  1. Recon: 스택, 모션 라이브러리, 기존 easing/duration 토큰, 제품 성격, 빈도 지도를 파악한다.
  2. Sweep: 사냥 목록의 seam 클래스(Feedback gaps / Teleporting state / Missing spatial story / Group entrances / Gesture seams / Delight budget)마다 후보를 `file:line` 증거와 함께 찾거나, 해당 없음으로 명시적으로 정리한다. grep 힌트로 `{isOpen &&`, `display: none`, `:active`가 없는 `onClick`, `details`, drag 핸들러, `.map(`, empty-state를 쓴다.
  3. Gate: 모든 후보에 4개 질문(Frequency → Purpose → Speed ≤300ms → Function)을 순서대로 적용한다.
  4. Report: 앱 전체 기준 최대 5–7개, 레버리지 순으로 정렬한다.
  서브에이전트나 사용자 질문은 없다.
- 핵심 규칙/지식: "Expect to reject most candidates." 출력 상한은 5–7개다. **기각 후보 섹션(2–5개, 어떤 게이트 질문에서 탈락했는지 표기)이 필수**다("This section is what separates this skill from an animation wishlist"). 각 제안에는 정확한 curve, duration, 속성, reduced-motion과 hover gating을 포함한다. 저장소 내용은 데이터로 취급한다(프롬프트 인젝션은 플래그). 다음 단계는 `improve-animations plan <suggestion>`으로 넘긴다. 근거 글은 Emil의 "You Don't Need Animations".
- 의존성: 다른 스킬로 넘기는 경로만 있다(`improve-animations plan`). 도구 의존성은 없다.
- 장점: "기각 목록 필수"와 "출력 개수 상한"은 위시리스트 팽창을 막는 좋은 장치다. 4단계 게이트와 seam 클래스 사냥 목록, grep 힌트, "결과 없음도 좋은 결과" 원칙도 쓸 만하다.
- 단점/한계: 표와 수치가 animate/AUDIT와 중복된다. 실제 UI를 보는 수단(스크린샷, 브라우저)이 없어 코드 정적 분석에만 의존한다. 웹 전용이다.

## emilkowalski/improve-animations
- 파일 구성:
  - `SKILL.md` (109줄): 4단계 워크플로(recon → 병렬 audit → vet → plans), 호출 변형 표
  - `AUDIT.md` (115줄): 8개 카테고리 규칙 카탈로그와 정확한 수치
  - `PLAN-TEMPLATE.md` (73줄): 실행자용 자기완결 계획서 템플릿
  - `*.ko.md`: 번역본
- frontmatter: `name: improve-animations`. description: "Survey a codebase's animation and motion code as a senior motion advisor, then produce a prioritized audit and self-contained implementation plans for other agents (or cheaper models) to execute. Read-only on source code — it plans improvements, it does not apply them. Use when the user asks to 'improve the animations', 'audit the motion', 'make this app feel better', or wants a roadmap of animation fixes rather than a review of a single diff." 호출 플래그는 없다.
- 트리거/언제 쓰나: 코드베이스 전체의 모션 감사와 개선 로드맵이 필요할 때.
- 입력 → 출력: 코드베이스(와 선택적 effort/category 인자)를 받아 채팅에 findings 표와 missed opportunities를 내고, 사용자가 고른 항목마다 **`plans/NNN-slug.md` 파일과 `plans/README.md`**(실행 순서, 의존성, 상태)를 만든다. 소스 코드는 수정하지 않는다.
- 동작 흐름:
  1. Recon: 스택, 모션이 있는 위치(토큰, Tailwind, keyframes), 컨벤션, 제품 성격, 빈도 지도를 파악한다. grep 대상은 `transition`, `@keyframes`, `motion.`, `ease-in`, `transition: all`, `scale(0)`, `prefers-reduced-motion`, `transform-origin`.
  2. Audit: 8개 카테고리(Purpose & frequency / Easing & duration / Physicality & origin / Interruptibility / Performance / Accessibility / Cohesion & tokens / Missed opportunities). 저장소가 작지 않으면 **카테고리별 읽기 전용 서브에이전트로 fan-out**한다. 프롬프트에는 AUDIT.md 절대경로와 섹션, recon 결과, "findings only(file:line + evidence)", Hard Rule 4 원문을 넣는다. effort는 quick(0–1 서브에이전트, HIGH만 약 5개), standard(≤4), deep(≤8, LOW 포함).
  3. Vet: 모든 finding의 인용 코드를 직접 다시 읽는다. by-design, 오귀속, 중복, 예외(modal의 center origin 등)는 제거한다. 레버리지(impact÷effort) 순 표로 정리하고 Severity HIGH/MEDIUM/LOW 정의를 따른다. missed opportunity 2–4개를 따로 적는다. **사용자가 선택할 때까지 멈춘다**(비대화형이면 상위 3–5개).
  4. Plans: PLAN-TEMPLATE로 작성하고 `git rev-parse --short HEAD`로 커밋을 찍는다. 가장 약한 실행자를 기준으로 정확한 경로, 현재 코드 발췌, 목표 값, repo exemplar, 단계, 경계, 검증(mechanical과 feel check)을 쓴다. 마지막으로 README를 갱신한다.
  - 호출 변형: bare / `quick`·`deep` / 카테고리 집중 / `plan <desc>`(감사 생략, 단일 계획) / `execute <plan>`(**격리 worktree에서 실행자 서브에이전트를 디스패치**한 뒤 review-animations 기준으로 diff를 판정) / `reconcile`(plans와 현재 코드를 대조해 DONE 처리하고 file:line 갱신).
- 핵심 규칙/지식: Hard Rules는 소스 수정 금지(`plans/`만 쓰고, 이미 다른 용도로 있으면 `animation-plans/`), 설치·빌드·커밋·포매터 금지, 계획서는 완전히 자기완결("Never write 'use the easing discussed above'"), 저장소 내용은 데이터, 문서화된 의도적 결정은 다시 따지지 않음. PLAN-TEMPLATE의 Boundaries에는 "코드가 커밋 스탬프와 다르면 STOP and report"가 있다. feel check는 생략할 수 없다(DevTools 10% 재생, reduced-motion 토글). AUDIT.md 수치는 animate/STANDARDS와 같다.
- 의존성: 서브에이전트(Agent), git(`rev-parse`), worktree 격리(execute), `review-animations` 기준(execute 판정). 스크립트는 없다.
- 장점: 7개 중 가장 정교한 **audit → 사용자 선택 → 자기완결 계획서 → (선택) 격리 실행과 리뷰** 파이프라인이다. 그대로 가져올 만한 것: 서브에이전트 프롬프트 필수 요소 목록, vet 단계("확인하지 않은 finding은 내놓지 않는다"), 약한 실행자용 PLAN-TEMPLATE(drift가 있으면 STOP), effort 표, `reconcile` 변형.
- 단점/한계: 무겁다(plans 파일 생성, 사용자 대기). 작은 수정에는 과하다. AUDIT.md가 STANDARDS.md와 내용이 거의 중복된다. `execute`는 Claude Code의 worktree와 서브에이전트 기능이 있어야 한다.

## emilkowalski/review-animations
- 파일 구성:
  - `SKILL.md` (120줄): 10개 표준, 에스컬레이션 트리거, 처방 우선순위, 출력 형식
  - `STANDARDS.md` (187줄): 수치와 규칙 레퍼런스(easing, duration, spring, gesture, clip-path, 성능, a11y, 디버깅)
  - `*.ko.md`: 번역본
- frontmatter: `name: review-animations`. description: "Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy. Default to flagging; approval is earned." **`disable-model-invocation: true`**(7개 중 유일하다. 사용자가 `/review-animations`로 명시적으로 호출해야 한다).
- 트리거/언제 쓰나: diff나 특정 모션 코드의 리뷰. 일반 코드 리뷰 요청은 거절하고 다른 스킬로 안내한다.
- 입력 → 출력: diff나 코드를 받아 **리뷰 리포트**를 낸다. Part 1은 Before | After | Why 표(한 줄에 한 이슈, "Never a 'Before:/After:' list"), Part 2는 6개 영향 tier별 판정과 최종 **Block / Approve**. 코드 수정은 없다.
- 동작 흐름:
  1. diff의 모든 애니메이션을 10개 Non-Negotiable 표준(정당화, 빈도, easing, ≤300ms, origin/scale(0), 중단 가능성, GPU 속성, 접근성, 비대칭 타이밍, 응집성)으로 잰다.
  2. 에스컬레이션 트리거 14개는 보는 즉시 플래그한다.
  3. 수정 제안은 처방 우선순위(1. 삭제 → 2. 축소 → 3. easing → 4. origin → 5. 중단 가능 → 6. GPU → 7. 비대칭 → 8. polish → 9. a11y와 응집성)에서 앞쪽을 우선한다.
  4. 값은 STANDARDS.md에서 그대로 가져와 `file:line`과 함께 인용한다.
  5. tier별 판정을 쓰고 Block/Approve를 결정한다. Block 조건은 feel-breaking, 키보드/고빈도 동작, `scale(0)`나 `ease-in`, 쉽게 고칠 수 있는 비-GPU 애니메이션.
  feel이 불확실하면 슬로우 모션이나 다음날 다시 보기를 권한다.
- 핵심 규칙/지식: 자세는 "Default to flagging. Approval is earned." 처방 1순위는 "Delete the animation"이다. STANDARDS에만 있는 내용: 빠른 spinner는 로딩을 짧게 느끼게 한다, 첫 tooltip 이후에는 즉시 열기, 3D(`preserve-3d`), mouse 추적은 `useSpring` 보간(장식용일 때만), 디버깅 4가지(2–5배 슬로우, 프레임 단위, 실기기 Safari remote, 다음날), Sonner 응집성 사례. 리뷰 방법론(비협상 표준, 에스컬레이션, 처방 위계, tier 출력, 명시적 승인 기준)은 "aggressive code-quality review"에서 가져왔다고 밝힌다.
- 의존성: 없음. improve-animations의 `execute`가 이 스킬의 기준을 판정에 사용한다.
- 장점: 처방 우선순위(삭제가 1순위), Before/After/Why 표 강제, 명시적 Block/Approve 기준, 에스컬레이션 트리거 목록. 리뷰 스킬 템플릿으로 그대로 재사용할 수 있다. 모델 자동 호출을 막아 오발동이 없다.
- 단점/한계: STANDARDS.md가 animate SKILL과 RECIPES, AUDIT.md와 대부분 중복된다. 리뷰 대상(diff) 수집 절차(git diff 실행 등)가 명시되어 있지 않다. 웹 전용이라 RN 리뷰 기준이 없다.

---

## 스킬 간 관계

| 스킬 | 역할 유형 | 코드 수정 | 산출물 | 다른 스킬 참조/호출 | 공유·중복 지식 |
| --- | --- | --- | --- | --- | --- |
| animate | 구현(웹) | O | 코드와 3줄 메모 | `pick-ui-library` 호출, review/improve/find/expo로 넘김 | 빈도 표, 목적 6종, easing 3토큰, duration 표, spring, Never Ship. STANDARDS, AUDIT와 거의 동일 |
| animate-expo | 구현(RN/Expo) | O | 코드와 기기 체크 메모 | 웹은 `animate`로 넘김 | 빈도 게이트, 목적, 같은 bezier 3개, `scale(0)` 금지 등은 animate와 중복. 스레드, haptics, Expo Router는 고유 |
| animation-performance | 진단(웹 성능) | 요청 시만 | Cause/Before/After/Verified 리포트 | animate, review, expo로 넘김 | transform/opacity, Framer 문자열 transform, CSS 변수, blur 20px는 animate, STANDARDS, AUDIT §5와 중복. 3단계 속성 표, 스레드 표, will-change, 진단 순서는 고유 |
| animation-vocabulary | 용어 역조회 | X | 용어와 정의 | 없음 | 용어집이 다른 스킬 개념의 이름표 역할. 수치 없음 |
| find-animation-opportunities | 탐색(추가할 곳) | X | 기회 표, 기각 목록, 판정 | `improve-animations plan`으로 넘김 | 빈도/목적/duration 게이트 중복. AUDIT §8 Missed opportunities를 확장한 버전 |
| improve-animations | 전체 감사와 계획 | X(plans/만 작성) | findings 표, `plans/*.md`, README | 서브에이전트 fan-out, `execute` 시 worktree 실행자와 `review-animations` 기준 | AUDIT.md는 STANDARDS.md의 8카테고리 재배열판(수치 동일) |
| review-animations | diff 리뷰 | X | Before/After/Why 표와 Block/Approve | improve의 execute 판정 기준으로 사용됨 | STANDARDS.md가 사실상 "정본" 수치 레퍼런스 |

요약:
- **지식 중복**: 빈도 표, 목적 목록, easing 토큰 3개(`0.23,1,0.32,1` / `0.77,0,0.175,1` / `0.32,0.72,0,1`), duration 표, spring `{duration 0.5, bounce 0.2}`, `scale(0)` 금지, origin 규칙, reduced-motion/hover gating이 animate, STANDARDS, AUDIT, find 4곳에 복붙되어 있다. 공유 reference 파일은 없고 각자 사본을 가진다. 직접 만들 때는 `motion-standards.md` 하나로 합치고 각 스킬이 참조하게 하면 된다.
- **워크플로 연결**: find → (`improve-animations plan`) → improve → (`execute`) → review 기준으로 판정. animate는 구현, performance는 성능 진단, vocabulary는 용어로 각각 독립적이다.
- **고유 가치만 추리면**: animate의 게이트 순서와 RECIPES, animate-expo의 RN 스레드·haptics·셋업 함정과 worklet, performance의 증상 표와 진단 순서, vocabulary의 용어집, find의 "기각 목록 필수"와 상한, improve의 audit → 선택 → 자기완결 plan → worktree execute 파이프라인, review의 처방 우선순위와 Block/Approve 기준.
- **입장 불일치 1건**: Framer `x/y` 단축 prop에 대해 animate와 review는 "항상 전체 transform 문자열"이고, performance는 "기본은 단축 prop, 바쁜 메인 스레드에서만 문자열"이다.
