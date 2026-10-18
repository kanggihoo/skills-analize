# apple-design 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/apple-design/`
- **핵심 파일**: `SKILL.md` (22,715 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **지식 참조(knowledge) 스킬**. 절차를 실행하는 construction skill이 아니라, Apple WWDC 디자인 강연의 원칙·수식·수치를 웹 플랫폼으로 번역해 놓은 17개 섹션 + Quick Reference 표.

원문 자기 규정: "This knowledge comes from Apple's WWDC design talks — chiefly *Designing Fluid Interfaces* (WWDC 2018) — distilled and translated into the web platform (CSS, Pointer Events, `requestAnimationFrame`, spring libraries like Motion/Framer Motion)."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring animations, drag/swipe/sheet interactions, momentum and interruptible transitions, translucent materials and depth, typography (optical sizing, tracking, leading), reduced-motion, or the design foundations (feedback, spatial consistency, restraint) behind Apple-style interfaces."

**매칭되는 사용자 발화**
- "iOS처럼 부드럽게 만들어줘", "Apple 느낌으로"
- "드래그로 닫히는 시트 만들어줘", "flick하면 던져지는 느낌"
- "backdrop-filter로 유리 느낌 툴바"
- "letter-spacing을 크기별로 어떻게 잡아야 해"
- "spring 파라미터 뭘 써야 하나"
- **build "or reviewing"** 양쪽을 다 포함 — 즉 생성·검토 모두에서 참조 자료로 켜짐.

**주의**: 트리거 범위가 매우 넓음(gesture / spring / drag / momentum / materials / typography / reduced-motion / design foundations). `animate`, `animate-expo`, `emil-design-eng`와 트리거가 겹칠 수 있음.

`allowed-tools` / `metadata`: **원문에 명시 없음**.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 제스처 기반 인터랙션의 **수식이 필요할 때** — momentum projection, rubber-banding, relative velocity 정규화. 이 세 수식은 이 컬렉션에서 여기에만 있음.
- Apple의 실제 출하 spring 값(damping/response 조합)을 알아야 할 때
- 반투명 재질(materials & depth) 설계 — `animate`/`animate-expo`에는 이 주제가 없음
- 타이포그래피의 optical sizing / tracking / leading 규칙
- `prefers-reduced-transparency`, `prefers-contrast` 같은 덜 알려진 접근성 신호
- 디자인 원칙 어휘를 정리해서 논거로 쓸 때 — "Use these as the names you reason with"

**부적합 / 과한 상황**
- 단순한 fade나 hover 같은 저비용 모션 — 이 문서의 대부분(velocity handoff, projection, additive animation)이 무관
- 애니메이션을 넣을지 말지 판단이 먼저 필요한 경우 — 이 스킬에는 **빈도 게이트가 없음** (`animate`의 Step 1에 해당하는 차단 장치 부재). 오히려 §16 Purpose("decide what *not* to build")로 원칙 수준에서만 언급.
- Apple 스타일이 아닌 브랜드(브루탈리즘, 에디토리얼 등)를 만들 때 — 이 문서는 단일 미학에 강하게 커밋되어 있음

**형제 스킬 대신 이걸 고르는 기준**: 필요한 것이 **"왜/얼마"에 대한 근거와 값**인가 (→ apple-design), 아니면 **"지금 이 컴포넌트의 코드"**인가 (→ `animate` / `animate-expo`). 실질적으로 `animate` 계열의 **참조 백엔드** 역할.

## 4. 외부 의존성

- **API 키**: **불필요.** 환경변수·외부 서비스 없음.
- **폴백 모드**: 해당 없음.
- **필요한 CLI/런타임/패키지**: 스킬 자체는 실행 요소 없음(scripts 폴더 없음). 예시 코드가 참조하는 것:
  - **Motion / Framer Motion** — `import { animate } from 'motion'`
  - 웹 표준: **Pointer Events** (`setPointerCapture`), `requestAnimationFrame`, `backdrop-filter`, `font-optical-sizing`, Vibration API
  - Apple 측 대응물로 `CADisplayLink`, iOS additive animations를 언급하지만 웹에서는 참조용
- **네트워크**: 불필요.
- **비용 발생 지점**: 없음.
- **지식 출처 의존성**: WWDC 2018 *Designing Fluid Interfaces*, WWDC 2020 *The Details of UI Typography*, *Designing Audio-Haptic Experiences*, WWDC 2026 *Principles of Great Design* — 원문 문서는 링크되지 않고 요약만 내장.

## 5. 워크플로우

이 스킬은 **절차형이 아니다.** 번호가 붙어 있으나 순차 실행 시퀀스가 아니라 **주제별 참조 섹션**이며, "run in order" 같은 하드룰이 없다. 다만 §1–§6은 fluid interaction을 만드는 **인과적 사슬**로 읽히도록 배치되어 있고, 원문이 그 연결을 명시한다.

### 관통 명제 (전 섹션의 전제)
"**an interface feels alive when motion starts from the current on-screen value, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant.** Springs are the tool that makes all of this natural, because they are inherently interruptible and velocity-aware."

이 한 문장이 §3(current value) → §5(inherits velocity) → §6(projects momentum) → §3(grabbed and reversed)로 각각 대응.

### 실제 구현 순서로 재구성한 사슬

1. **§1 Response — kill latency**: 모든 것의 토대. "Response is the foundation everything else is built on." pointer-down에 반응, 지연 요소 감사, 인터랙션 *중* 연속 피드백.
2. **§2 Direct manipulation — 1:1 tracking**: pointer-down 이후 손가락에 붙이기. `setPointerCapture` + **grab offset 존중** + **velocity/position history 축적**. → 여기서 축적한 history가 §5의 release velocity로 소비됨 (앞 단계 산출물이 뒤에 쓰이는 명확한 지점).
3. **§3 Interruptibility — "the single most important principle"**: 애니메이션이 presentation(현재) 값에서 시작해야 함. 이 요구가 §4의 spring 선택을 강제. 분기 규칙: "Avoid CSS transitions and `@keyframes` for anything gesture-driven".
4. **§4 Behavior over animation — use springs**: §3의 요구를 만족하는 도구 선택. damping/response 2-파라미터로 사고.
5. **§5 Velocity handoff**: §2에서 모은 velocity를 §4의 spring 초기속도로 전달. 정규화 필요 여부가 API별 분기.
6. **§6 Momentum projection**: 목표 지점 자체를 velocity로 계산 → 그 다음 §5의 handoff 실행. 원문 코드가 순서를 명시: `project()` → `nearestSnapPoint()` → `animateSpringTo(target, { velocity })`.
7. **§7 Spatial consistency**: 경로의 대칭성·origin 앵커링 검증.
8. **§8 Hint in the direction of the gesture**: 중간 프레임이 결과를 예고하는지.
9. **§9 Rubber-banding**: 경계 처리.
10. **§10 Gesture design details ("the feel checklist")**: tap / drag·swipe의 히스테리시스, 병렬 제스처 인식.
11. **§11 Frame-level smoothness**: 프레임 내용 검증.
12. **§12 Materials & depth**: 시각 레이어.
13. **§13 Multimodal feedback**: motion + sound + haptics 결합 3규칙.
14. **§14 Reduced motion & accessibility**: 3개 미디어 쿼리 신호 대응.
15. **§15 Typography**.
16. **§16 Design foundations — the eight principles**: 위 전부의 상위 정당화. "The motion and craft above serve Apple's eight design principles."
17. **§17 Process**: 프로토타입 우선, 인터랙션·비주얼 동시 설계, 실사용자 테스트 + 프레임별 리뷰.

**분기·조건·게이트**
- §3: gesture-driven이면 CSS transition/keyframes 금지 → spring 필수 (도구 분기)
- §4: "gesture itself carried momentum"이면 damping ~0.8, 아니면 1.0 (값 분기)
- §5: spring API가 relative velocity를 요구하면 정규화, Motion/Framer Motion이면 raw px/s 그대로 (API별 분기)
- §12: 모달 태스크면 scrim + push back, 병렬 non-blocking 패널이면 scrim 없이 translucency + offset (맥락 분기)
- §14: 3개 신호(`prefers-reduced-motion` / `prefers-reduced-transparency` / `prefers-contrast`)를 **독립적으로** 처리 — "Respond to three independent signals"
- §16-2: "a confirmation dialog only for genuinely destructive, irreversible actions"
- §16-4: "Only break a familiar pattern if you can prove it's better — then test it, don't assume."

**사용자 확인 요구 지점**: 스킬 자체에는 없음. 단 §17이 검증을 사람에게 위임 — "Test with real people in real context", "play it in slow motion / frame-by-frame".

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

- "Waiting for `click`/touch-up to show feedback **feels dead**."
- "**Anything on the input path that isn't essential is a regression.**" (debounce, artificial timer, transition wait, ~300ms tap delay를 지목)
- "never animate only when the gesture completes"
- "**Snapping to the element's center on grab breaks the illusion immediately.**"
- "**Never lock out input during a transition.**"
- "**Always animate from the *presentation* (current) value, never the target value.** ... Starting from the logical/target value causes a visible jump."
- "**Avoid CSS transitions and `@keyframes` for anything gesture-driven** — they can't be smoothly grabbed and reversed mid-flight."
- "**When a gesture reverses, blend velocity — don't hard-cut it.** Replacing one animation with another at a reversal creates a velocity discontinuity, a \"brick wall.\""
- "A single spring on a 2D distance desyncs when X and Y have different velocities." (2D를 X/Y 독립 spring으로 분해할 것)
- "Overshoot on a menu that just faded in **feels wrong**"
- "**Don't snap to the nearest boundary from the *release point*.**"
- "the physics-textbook `v²/(2·decel)` is *not* what Apple ships"
- "In-from-right / out-the-bottom **feels disconnected and confusing**."
- "**Never stack a light translucent surface on another** — legibility collapses."
- "Over blurred/translucent surfaces, **don't use flat gray text**"
- "**Scroll edge effects, not hard dividers.** Instead of a 1px border under a sticky header, fade a small blur/gradient mask"
- "**Materialize, don't just fade.**"
- "Avoid recognizers that only report a *final* state (`swipeleft`-type events) — they throw away the continuous tracking you need for feedback."
- "**Tracking (letter-spacing) is size-specific — never one value for all sizes.** ... A fixed `letter-spacing` is wrong somewhere."
- "avoid full-viewport moving backgrounds, slow looping oscillations (near 0.2 Hz / one cycle per 5s), and abrupt brightness jumps"
- "**Simplicity — not minimalism.** ... burying everything in one place looks minimal but isn't simple."
- "**Delight.** The result of getting the other seven right, **not confetti tacked on top**."
- "Jittery scroll, misaligned icons, and layouts that break on rotation **read as carelessness**."
- "If you need a label to explain a control, **the mapping is weak**."
- "**Direct, specific labels beat safe generic ones.** Name nav items for their contents (\"Progress\", \"Library\"), not vague umbrellas (\"Home\")."
- "a confirmation dialog only for genuinely destructive, irreversible actions (use sparingly; **overusing it trains people to click through**)"
- "**Over-feedback trains users to ignore all of it.**"

### 강제 규칙 — 수치·수식 인용

**Spring 파라미터 체계** — "Apple deliberately replaced the physics triplet (mass/stiffness/damping) with two designer-friendly parameters."
- **Damping ratio** — "`1.0` = critically damped, no bounce, smooth settle. `< 1.0` = overshoots and oscillates. Lower = bouncier."
- **Response** — "how quickly the value reaches the target, in seconds. Lower = snappier. **This is not \"duration\"** — a spring has no fixed duration; its settle time emerges from the parameters."

기본값: "Start most UI at **damping `1.0`**", 바운스는 "**damping ~`0.8`**) **only when the gesture itself carried momentum**".

**Apple이 실제로 출하하는 값** ("Concrete values Apple ships"):

| Interaction | Damping | Response |
| --- | --- | --- |
| Move / reposition (e.g. PiP) | `1.0` | `0.4` |
| Rotation | `0.8` | `0.4` |
| Drawer / sheet | `0.8` | `0.3` |

Motion/Framer Motion 매핑:
```js
animate(el, { y: 0 }, { type: 'spring', bounce: 0, duration: 0.4 });      // critically damped default
animate(el, { y: target }, { type: 'spring', bounce: 0.2, duration: 0.4 }); // momentum interaction
```

**Velocity 정규화 수식**
```
relativeVelocity = gestureVelocity / (targetValue − currentValue)
```
예시까지 명시: "element at `y=50`, target `y=150` (100px to go), finger moving 50px/s → initial spring velocity = `50 / 100 = 0.5`."

**Momentum projection 함수 (Apple 샘플 코드 원문)**
```js
function project(initialVelocity /* px/s */, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}
const projectedEndpoint = currentPosition + project(releaseVelocity);
const target = nearestSnapPoint(projectedEndpoint);
animateSpringTo(target, { velocity: releaseVelocity });
```
- `decelerationRate ≈ 0.998` for normal scroll feel; **`0.99` for snappier**
- 참조 구현으로 **Vaul, Embla** 지목

**Rubber-banding 함수**
```js
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
```
`constant = 0.55` 고정값.

**프레스 피드백**
```css
.button:active { transform: scale(0.97); transition: transform 100ms ease-out; }
```

**제스처 히스테리시스**: "Add **~10px** of hysteresis/hit padding around the target" / "require a small movement threshold (hysteresis, **~10px**) before committing to a direction"

**타이포그래피 수치**
```css
:root { font: 100%/1.5 system-ui, sans-serif; }
.display {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.05;        /* tight leading for large text */
  letter-spacing: -0.02em;  /* negative tracking as it grows */
  font-optical-sizing: auto;
}
```
- 큰 텍스트 tracking **`-0.02em`**, body는 **`0` 근처**
- 큰 헤딩 line-height **`1.05`**, body **`1.5`**

**Materials 예시값**
```css
.toolbar {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.4); /* bright top edge = light catching the material */
}
```

**금지 주파수**: "slow looping oscillations (**near 0.2 Hz / one cycle per 5s**)"

**Reduced motion 대체값**: `transition: opacity 200ms ease; transform: none !important;`

### 항목별 지침

**타이포그래피 (§15)**
- tracking은 사이즈별 — "Large display text wants *negative* tracking (letters read too far apart as they grow); small text wants slightly *positive* tracking for legibility."
- leading은 사이즈에 반비례 — "Tight on large headings, looser on body copy. Increase it for scripts with tall ascenders/descenders; tighten it for dense, information-heavy UI."
- 위계는 3요소 세트 — "**Build hierarchy from weight + size + leading as a set,** not size alone. Emphasize with weight — it adds presence without taking more space."
- Dynamic Type 대응 — "spacing in `rem`/`em`, not fixed px"
- 서체 선택 — "**Default to the platform's system font** before a custom face; it already ships optical sizing, tracking tables, and legibility tuning. Override only with a reason."
- 반투명 위 텍스트(§12) — "use higher-contrast, slightly heavier weight, and a small letter-spacing bump. Put color on a solid layer, not the translucent foreground."

**컬러**
- 팔레트나 색상 값 지침은 **원문에 명시 없음.**
- 색에 대한 언급은 세 곳뿐: §12 "Put color on a solid layer, not the translucent foreground", §14 `prefers-contrast: more` → "near-solid backgrounds with a defined, contrasting border", §16-7 "colors that adapt to light/dark".
- 대비 비율(contrast ratio) 수치는 **원문에 명시 없음** — `prefers-contrast` 대응만 있음.

**스페이싱**
- spacing scale은 **원문에 명시 없음.**
- 공간 관련 규칙은 (a) `rem`/`em` 사용, (b) §16-4 "things that look the same must behave the same and **live in the same place**", (c) §16 Grouping & mapping — "Proximity implies relationship; place a control near what it affects and arrange controls to mirror what they change."
- 터치 타깃: "~10px of hysteresis/hit padding" (44pt 같은 값은 없음 — 그건 `animate-expo`에 있음)

**모션**
- 전체 문서의 절반 이상(§1–§11, §13, §14). 핵심: presentation value에서 시작, velocity 상속, momentum projection, 중단·역전 가능, 경계 rubber-band, 대칭 경로, origin 앵커, 프레임 내용의 매끄러움.
- 성능: "Animate only compositor-friendly properties — `transform` and `opacity` — and hint with `will-change` where motion is imminent."
- 지각: "Keep the per-frame positional change below the perception threshold to avoid strobing." / "For very fast motion, a subtle **motion blur / stretch** encodes speed."

**레이아웃 / 깊이 (§12)**
- "**Build nav/toolbars/sheets as translucent layers** ... with content scrolling underneath — not opaque bars that consume a fixed strip."
- "**Material weight encodes hierarchy:** darker/heavier materials separate structural regions (sidebars); lighter materials draw attention to interactive elements (buttons)."
- "**Bigger surfaces should read as thicker:** stronger blur + a deeper shadow than small chips. Consider context-aware shadow — heavier over busy/text content for separation, lighter over plain backgrounds."
- "**Dim to focus, separate to keep flow.**" 모달 = scrim + push back / 병렬 패널 = scrim 없음 / 스택 시트 = "progressively dim and push back each parent layer."
- §16 Wayfinding — "Every screen should answer: Where am I? Where can I go? What's there? How do I get out? **Never trap the user.**"

**햅틱·사운드 (§13)** — 3규칙: **Causality** / **Harmony**("must fire on the **same frame**") / **Utility**.

### 지침을 주는 방식 자체

1. **인용(quote) 중심 권위 구성**: 6개의 블록 인용문이 섹션 머리에 놓여 원칙을 각인. 예 — "When we align the interface to the way we think and move, something magical happens", "Touch and content should move together", "The thought and the gesture happen in parallel", "Think of animation as a conversation between you and the object", "Take a small input and make a big output", "If something disappears one way, we expect it to emerge from where it came".
2. **출처 명기**: WWDC 2018 *Designing Fluid Interfaces*, WWDC 2020 *The Details of UI Typography*, *Designing Audio-Haptic Experiences*, WWDC 2026 *Principles of Great Design*. 규칙마다 출처를 붙여 권위를 이전.
3. **수식 제공**: 이 컬렉션에서 유일하게 **실행 가능한 수식 3개**(project / rubberband / relativeVelocity)를 코드로 제공. 감각을 함수로 환원.
4. **"Apple이 실제로 쓰는 값" 테이블**: 이론값이 아니라 출하값임을 명시 — "Concrete values Apple ships".
5. **원칙에 이름 부여 → 논거 어휘화**: §16 "Use these as **the names you reason with**." 8개 원칙(Purpose / Agency / Responsibility / Familiarity / Flexibility / Simplicity / Craft / Delight)을 판단 어휘로 제공.
6. **인간 욕구로의 환원**: "Apple frames design as serving four human needs: **safety/predictability, understanding, achievement, and joy.** **Every rule here serves one of them.**"
7. **웹 매핑 명시**: Apple의 개념마다 웹 등가물을 붙임 — additive animations → velocity 재타깃 spring 라이브러리, `CADisplayLink` → `requestAnimationFrame`, Apple materials → `backdrop-filter`, Dynamic Type → `rem`/`em`.
8. **참조 구현 지목**: Vaul, Embla (momentum projection), Motion/Framer Motion.
9. **Quick Reference 표로 압축**: 14행 "Need / Technique / Concrete value" 표가 문서 전체의 인덱스 겸 치트시트.
10. **오정보 정정 장치**: "the physics-textbook `v²/(2·decel)` is *not* what Apple ships" — 흔한 오답을 명시적으로 배제.

### 모호한 감각어의 번역

이 스킬의 핵심 가치가 여기에 있다 — 감각어를 **수식·파라미터·이벤트 타이밍**으로 환원한다.

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "feels alive" | presentation value에서 시작 + velocity 상속 + momentum projection + 중단 가능 (관통 명제) |
| "seamless extension of us" | §1–§11 전체 |
| "falls off a cliff" (직접성 상실) | pointer-down 반응, debounce·타이머·300ms tap delay 제거 |
| "feels dead" | touch-up 대기 대신 pointer-down에 하이라이트 |
| "breaks the illusion" | grab offset 무시 → 존중 (`e.clientY - rect.top`) |
| "brick wall" (역전 시 위화감) | velocity discontinuity → velocity 블렌딩 spring |
| "no visible seam between dragging and animating" | release velocity를 spring 초기속도로 전달 (§5) |
| "makes a flick feel like it throws the element" | `project(v, 0.998)`로 착지점 계산 후 snap |
| "reads as 'frozen'" vs "responsive, but there's nothing more here" | 하드 스톱 → `rubberband(overshoot, dimension, 0.55)` |
| "feels wrong / feels right" (오버슈트) | damping 1.0 (모션 없던 것) vs 0.8 (flick 뒤) |
| "letters read too far apart as they grow" | `letter-spacing: -0.02em` on display type |
| "legibility collapses" | 반투명 위 반투명 금지 |
| "light catching the material" | `border-top: 1px solid rgba(255,255,255,0.4)` |
| "a real material arriving rather than a plain opacity fade" | blur radius + scale을 함께 애니메이트 |
| "reads as carelessness" | jittery scroll / misaligned icons / rotation 시 레이아웃 파괴 |
| "delight" | "The result of getting the other seven right, not confetti tacked on top" |
| "strobing" | per-frame 위치 변화량을 지각 임계 이하로 |
| "an interactive demo is worth 'a million static designs'" | 프로토타입을 구현 품질의 하한선으로 사용 |

## 7. 산출물

- **형식**: 이 스킬 자체는 산출물을 정의하지 않음. 참조 지식이므로 산출물은 호출 문맥(CSS/JS 코드, 리뷰 의견)에 따름.
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- 출력 형식·톤 규정도 **원문에 명시 없음** (`animate` 계열의 "Output"/"Tone" 섹션이 이 스킬에는 없음).

## 8. 주의점 / 한계

- **게이트가 없다**: `animate`의 "Should this animate at all?" 같은 차단 장치가 없어, 이 스킬만 켜면 **과잉 모션으로 흐를 위험**이 있다. §16-1 Purpose와 §16-6 Simplicity가 원칙 수준의 절제를 말하지만 실행 가능한 게이트는 아니다. 실무에서는 `animate`의 빈도 게이트와 병행하는 것이 안전.
- **단일 미학에 강하게 커밋**: system font 우선, 반투명 재질, spring 중심. Apple 스타일이 아닌 결과물을 원할 때는 이 문서의 상당 부분이 오히려 방해.
- **WWDC 2026 출처**: §16이 "*Principles of Great Design*, WWDC 2026"을 출처로 제시. 스킬 파일 자체에 원문 링크나 검증 수단이 없으므로 인용 정확성은 확인 불가 — **원문에 링크 명시 없음**.
- **spring API 파라미터 매핑의 근사성**: "the `bounce` + `duration` spring API **maps closely to** Apple's damping + response" — 정확한 변환식은 원문에 명시 없음. damping 1.0 ↔ bounce 0, damping 0.8 ↔ bounce 0.2 정도의 대응만 예시로 제시됨.
- **`decelerationRate` 단위 전제**: `project()`가 `initialVelocity`를 px/s로, 내부에서 `/1000` 하는 형태이므로 ms 기반 velocity를 넣으면 조용히 틀린 결과가 나옴. 이 함정은 원문에 경고되지 않음.
- **다른 스킬과의 충돌 소지**:
  - `animate`는 "**Avoid CSS transitions and `@keyframes`**"가 아니라 오히려 "**Transitions, not keyframes, for anything triggered rapidly**"를 권한다. 둘은 대상이 다르지만(제스처 vs 빠른 재트리거) 표면적으로는 반대로 읽힘 — 적용 대상을 구분해야 함.
  - `animate`는 CSS transition을 최우선 도구로 두는데, 이 스킬은 gesture-driven에서 이를 배제. 판단 기준은 "손가락이 관여하는가".
  - Duration 상한: `animate`는 "UI animations stay under 300ms", 이 스킬은 response 0.3–0.4s (spring이므로 고정 duration 개념이 없음)로 표현 — 충돌은 아니나 비교 시 주의.
- **분량과 밀도**: 22KB 단일 파일에 17섹션. 특정 주제(예: 타이포그래피 하나)만 필요할 때도 전체가 로드됨. references/ 분할이 없는 구조.
- **원문에서 강하게 경고하는 부분**:
  - "**Interruptibility — the single most important principle**"
  - "**Never lock out input during a transition.**"
  - "**Always animate from the *presentation* (current) value, never the target value.**"
  - "**Never stack a light translucent surface on another** — legibility collapses."
  - "Anything on the input path that isn't essential is a regression."
  - §13 Harmony — "must fire on the **same frame**. Latency between them destroys the illusion."
