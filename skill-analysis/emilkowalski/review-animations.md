# review-animations 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/review-animations/`
- **핵심 파일**: `SKILL.md` (8,108 bytes)
- **보조 파일**: `STANDARDS.md` (9,801 bytes) — easing 곡선, duration 표, spring config, 제스처, clip-path, 성능, a11y의 정확한 값 카탈로그. "Cite these in findings instead of approximating."
- **성격**: **diff 비평(review) 스킬**. 애니메이션 코드를 높은 크래프트 기준으로 심사하고 **Block / Approve 판정**을 내린다. 기본값이 flagging이며 승인은 획득해야 하는 것.

원문 자기 규정: "A specialized review skill. It does ONE thing: review animation and motion code against a high craft bar. It does not write features, fix unrelated bugs, or review non-motion code."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter 원문:
```yaml
name: review-animations
description: Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy. Default to flagging; approval is earned.
disable-model-invocation: true
```

**`disable-model-invocation: true`** — 이 컬렉션에서 3번째(그리고 마지막) 자동 호출 차단 스킬. `pick-ui-library`, `prototype`과 동일.

**매칭되는 사용자 발화** (명시적 호출 필요)
- `/review-animations`, "애니메이션 리뷰해줘" (명시 호출)
- 다른 스킬로부터의 호출: `improve-animations execute <plan>`이 실행 결과 diff를 "**with the `review-animations` bar**"로 검토하도록 지시. 즉 **파이프라인의 검증 게이트**로 사용됨.
- `animate`의 Never Ship 테이블이 "Each of these is an automatic block in `review-animations`"라고 명시 — 생성 스킬이 이 스킬의 기준을 참조.

**배제**: "If asked to review general code, **decline and point to a general review skill.**"

**description의 특이점**: 트리거 문구 대신 **판정 성향**을 선언한다 — "Default to flagging; approval is earned." 즉 활성화 조건이 아니라 동작 성향이 description에 들어있음.

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- PR/diff에 애니메이션 변경이 포함되어 있고 게이트를 통과시킬지 판단할 때
- `improve-animations`가 만든 계획을 실행한 결과를 검증할 때 (파이프라인 종단)
- `animate`로 작성한 코드가 기준을 통과하는지 자체 확인할 때
- 팀에 "왜 이건 블록인지" 근거를 제시해야 할 때 — 10개 표준 + 판정 기준이 명문화됨

**부적합 / 과한 상황**
- 코드베이스 전체 감사 → `improve-animations` (이 스킬은 diff 단위)
- 애니메이션이 없는 코드 — 심사 대상이 없음
- 일반 코드 리뷰 → 원문이 거절하도록 지시
- 새로 만드는 단계 → `animate` (다만 `animate`가 이 스킬의 기준을 내장하고 있어 사전 통과가 가능)
- RN/Expo 코드 — STANDARDS.md가 웹 CSS 전제 (§8 참조)

**형제 스킬 대신 이걸 고르는 기준**: 대상이 **diff**인가(→ 이 스킬), **코드베이스 전체**인가(→ improve), **아직 없는 것**인가(→ animate / find-animation-opportunities).

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 해당 없음.
- **필요한 CLI/런타임/패키지**: 스크립트 없음. 리뷰 대상 diff를 읽을 수 있으면 됨. 검증 권고에 등장하는 도구:
  - **Chrome DevTools Animations panel** (프레임별 검사)
  - **DevTools animation inspector** (슬로모션)
  - **실기기 + Safari remote devtools** (제스처 검증)
- **네트워크**: 불필요. 참조 링크 — animations.dev, easing.dev, easings.co.
- **비용 발생 지점**: 없음.

## 5. 워크플로우

### Operating Posture (심사 태도)
- "You are a senior design engineer with **a brutal eye for craft**."
- "Your bias is toward **motion that feels right**, not motion that merely runs."
- "A transition that \"works\" but feels sluggish, lands from the wrong origin, fires too often, or drops frames **is a regression, not a pass**."
- "**Default to flagging. Approval is earned, not assumed.**"

방법론의 출처를 명시: "The substantive bar comes from Emil Kowalski's animation philosophy (animations.dev). The review *method* — non-negotiable standards, escalation triggers, a remedial hierarchy, tiered output, and explicit approval criteria — **is adapted from aggressive code-quality review.**"

### 1. 10개 비협상 표준으로 측정
"Every animation in the diff is measured against these. **A violation is a finding.**"

1. **Justified motion** — "why does this animate?" 유효 목적 5개(spatial consistency, state indication, feedback, explanation, preventing a jarring change). "\"It looks cool\" on a frequently-seen element is **a block**."
2. **Frequency-appropriate** — 키보드 발동·100+/day는 **모션 없음**, tens/day는 축소, occasional은 표준, rare/first-time은 delight 허용
3. **Responsive easing** — entering/exiting은 `ease-out` 또는 강한 커스텀 곡선. "**`ease-in` on UI is a block**". "Built-in CSS easings are too weak; **expect custom cubic-beziers.**"
4. **Sub-300ms UI** — 초과 시 "needs justification or it's a finding"
5. **Origin & physical correctness** — 트리거 앵커링, `scale(0)` 금지, `scale(0.9–0.97)` + opacity. "Modals are exempt"
6. **Interruptibility** — 빠르게 트리거되거나 제스처 기반이면 transitions/springs, keyframes 아님
7. **GPU-only properties** — `transform`/`opacity`만. layout 속성 또는 Framer Motion 단축 prop은 "a performance finding"
8. **Accessibility** — `prefers-reduced-motion`(gentler, not zero) + hover 게이팅
9. **Asymmetric enter/exit** — "Symmetric timing on a press-and-release or hold interaction is a finding."
10. **Cohesion** — 성격 일치. "When unsure whether motion feels right, **the strongest move is often to delete it.**"

### 2. Aggressive Escalation Triggers — "Flag these on sight, hard" (14항목)
즉시 강하게 지적할 목록 (전문):
- `transition: all` (unbounded property animation)
- `scale(0)` or pure-fade entrances with no initial transform
- `ease-in` on any UI interaction; weak built-in easing on a deliberate animation
- Animation on a keyboard shortcut, command-palette toggle, or 100+/day action
- UI duration > 300ms with no stated reason
- `transform-origin: center` on a trigger-anchored popover/dropdown/tooltip
- Keyframes on toasts, toggles, or anything added/triggered rapidly
- Animating layout properties (`width`/`height`/`margin`/`padding`/`top`/`left`)
- Framer Motion `x`/`y`/`scale` props on motion that runs while the page is busy
- Updating a CSS variable on a parent to drive a child transform (style recalc storm)
- Missing `prefers-reduced-motion` handling on movement
- Ungated `:hover` motion
- Symmetric enter/exit timing on a press-and-release or hold interaction
- Everything-at-once entrance where a 30–80ms stagger belongs

### 3. Remedial Preference Hierarchy — **처방의 우선순위 (9단)**
"When proposing fixes, **prefer earlier moves over later ones**":

1. **Delete the animation** (high-frequency / no purpose / keyboard-triggered)
2. **Reduce it** — shorter duration, smaller transform, fewer animated properties
3. **Fix the easing** — `ease-in`→`ease-out`/custom curve
4. **Fix the origin/physicality** — `transform-origin`; `scale(0)`→`scale(0.95)`+opacity
5. **Make it interruptible** — keyframes → transitions, 또는 제스처엔 spring
6. **Move it to the GPU** — layout props → `transform`/`opacity`; shorthand → full `transform` string; WAAPI
7. **Asymmetric timing** — 심사숙고 구간은 느리게, 응답은 즉각
8. **Polish** — blur 마스킹, stagger, `@starting-style`, spring for "alive"
9. **Accessibility & cohesion** — reduced-motion + hover 게이팅, 성격 튜닝

→ **삭제가 1순위**라는 점이 이 컬렉션의 핵심 태도. 폴리시는 8순위.

### 4. Required Output Format — 2부, 순서 강제

**Part 1 — Findings table (REQUIRED)**
"A single markdown table. One row per issue. **Never a \"Before:/After:\" list.**"
```
| Before | After | Why |
```
원문 예시 4행:
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; `all` animates unintended properties off-GPU |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing appears from nothing — `scale(0)` looks like it came from nowhere |
| `ease-in` on dropdown | `ease-out` + custom curve | `ease-in` delays the moment the user watches most; feels sluggish |
| `transform-origin: center` on popover | `var(--transform-origin)` (Base UI) | Popovers scale from their trigger, not center (modals are exempt) |

**Part 2 — Verdict (REQUIRED)**
임팩트 티어별로 그룹화, 높은 것부터. "Omit empty tiers."
1. **Feel-breaking regressions** — sluggish easing, comes-from-nowhere, fires on high-frequency/keyboard actions
2. **Missed simplifications** — animations that should be removed or drastically reduced
3. **Performance** — non-GPU properties, dropped-frame risks, recalc storms
4. **Interruptibility & timing** — keyframes where transitions/springs belong; symmetric timing that should be asymmetric
5. **Origin, physicality & cohesion** — wrong origin, mismatched personality, jarring crossfades
6. **Accessibility** — reduced-motion and pointer/hover gating

**명시적 판정 (게이트)**
- **Block** — "any feel-breaking regression, animation on a keyboard/high-frequency action, `scale(0)`/`ease-in` on UI, or a non-GPU animation with an easy GPU fix."
- **Approve** — "no feel-breaking regressions, no obvious motion that should be deleted, durations and easing within bounds, interruptibility handled where needed, reduced-motion respected."

**인용 의무**: "Be specific and cite `file:line`. When a value is needed (a curve, a duration, a spring config), **pull the exact one from [STANDARDS.md](STANDARDS.md) rather than approximating.**"

### STANDARDS.md 조건부 로딩
"Load it whenever a finding needs a precise value or citation."

**사용자 확인 요구 지점**: 없음. 판정을 스킬이 직접 내린다 (Block/Approve).

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

**Escalation Triggers 14항목** (위 §5.2 전문) — 이것이 금지 목록의 본체.

**10 표준에서의 금지**
- "\"It looks cool\" on a frequently-seen element is a block."
- "Keyboard-initiated and 100+/day actions get **no** animation."
- "**`ease-in` on UI is a block**"
- "Built-in CSS easings are too weak"
- "**Never animate from `scale(0)`**"
- "Animate `transform` and `opacity` only."
- "Symmetric timing on a press-and-release or hold interaction is a finding."

**STANDARDS.md에서의 금지**
- "**Never animate keyboard-initiated actions** — they repeat hundreds of times daily"
- "**Never `ease-in` on UI.**"
- "**Never `scale(0)`.** ... Nothing in the real world appears from nothing."
- "**Don't drive child transforms via a CSS variable on the parent** — it recalcs styles for all children."
- "**Framer Motion shorthands are NOT hardware-accelerated.**"
- "don't hand-roll from scratch" (easing 곡선)
- "avoid bounce in most UI"
- "Not interruptible — avoid for dynamic UI" (`@keyframes`)
- "Prefer over hardcoded px" (translate 퍼센트)
- "**don't require crossing a distance threshold**" (velocity도 봐야 함)
- "**Friction over hard stops** — allow over-drag with rising resistance rather than an invisible wall."
- "Keep blur < 20px (heavy blur is expensive, especially Safari)."
- "Longer delays feel slow. Stagger is decorative — **never block interaction while it plays.**"
- "Reduced motion means fewer and gentler animations, **not zero**"
- 출력: "**Never a \"Before:/After:\" list.**"
- 범위: "It does not write features, fix unrelated bugs, or review non-motion code."

### 강제 규칙 — 수치 인용 (STANDARDS.md)

**Frequency → Decision**

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | No animation. Ever. |
| Tens of times/day (hover effects, list navigation) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, feedback, celebrations) | Can add delight |

**Easing 결정 순서**: Entering/exiting → `ease-out` / Moving·morphing → `ease-in-out` / Hover·color → `ease` / Constant motion → `linear` / Default → `ease-out`

**Easing 토큰 3개**
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```

**Duration**

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

"**Rule: UI animations stay under 300ms.**"

**Physicality**
- entrance: `scale(0.9–0.97)` + `opacity: 0`
- press: `transform: scale(0.97)` on `:active`, `transition: transform 160ms ease-out`, subtle **0.95–0.98**
- popover: `transform-origin: var(--transform-origin)` (Base UI), 모달 예외

**Springs**
```js
{ type: "spring", duration: 0.5, bounce: 0.2 }             // Apple-style — recommended
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }   // Traditional physics
```
bounce **0.1–0.3**

**Asymmetric timing**: release `clip-path 200ms ease-out` / press `clip-path 2s linear`

**Gestures**: velocity 해제 임계 `Math.abs(distance)/elapsedMs > ~0.11`

**Blur 마스킹**: `filter: blur(2px)`, 상한 **20px**

**Stagger**: **30–80ms**. 예시 값 — `opacity: 0; transform: translateY(8px)`, `animation: fadeIn 300ms ease-out forwards`, delay `50ms`/`100ms`

**WAAPI 예시**: `{ duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }`

**clip-path**: `inset(0 0 100% 0)` → `inset(0 0 0 0)`

**Reduced motion 대체**: `animation: fade 0.2s ease;`

### 항목별 지침

- **타이포그래피 / 컬러 / 스페이싱**: **원문에 지침 없음** (모션 전용 리뷰).
- **모션**: 전체. 위 강제 규칙 참조.
- **레이아웃**: `transform-origin`, `translate` 퍼센트, 3D(`preserve-3d`), `clip-path: inset()`.
- **성능**: transform/opacity만, CSS 변수 상속 비용, Framer Motion 단축 prop, CSS가 rAF보다 우세, WAAPI.
- **접근성**: 표준 8 + STANDARDS.md의 Accessibility 섹션.
- **일관성(Cohesion)**: 표준 10 + STANDARDS.md의 Cohesion 섹션.

### 지침을 주는 방식 자체

1. **페르소나 + 판정 성향을 description에 삽입**: "Default to flagging; approval is earned." — 활성화 조건 자리에 성향을 넣은 것이 특징.
2. **방법론의 출처를 분리 명시**: 실질 기준은 Emil Kowalski, 리뷰 *방법*은 "aggressive code-quality review"에서 차용. 즉 미학과 심사 메커니즘을 별개 출처로 밝힘.
3. **번호가 붙은 비협상 표준 10개**: "A violation is a finding." 규칙을 셀 수 있게 만들어 커버리지를 검증 가능하게 함.
4. **"Flag on sight" 목록**: 판단 없이 즉시 지적하는 14항목. 표준(해석 필요)과 트리거(즉시 판정)를 분리.
5. **처방의 우선순위 계층 (9단)**: 이 컬렉션에서 가장 특징적인 장치. 무엇을 고칠지가 아니라 **어떤 종류의 수정이 더 좋은 수정인지**를 서열화. 1순위가 **삭제**.
6. **출력 형식 강제 + 반례**: 표 1개, 이슈당 1행, "Never a Before:/After: list."
7. **임팩트 티어 6단**: 코멘트를 심각도로 그룹화, 빈 티어 생략.
8. **명시적 승인 기준**: Block/Approve의 조건을 각각 열거. 판정이 주관에 맡겨지지 않음.
9. **인용 의무 + 값 출처 고정**: `file:line` + STANDARDS.md에서 정확한 값. "rather than approximating."
10. **2층 문서 + 조건부 로딩**: SKILL.md(심사 절차) / STANDARDS.md(값 카탈로그). "Load it whenever a finding needs a precise value."
11. **불확실성의 처리 규칙**: "When unsure whether motion feels right, recommend reviewing it in slow motion / frame-by-frame and with fresh eyes the next day **rather than guessing.**"
12. **실물 참조**: Raycast, Base UI, Ionic, Sonner/Vaul, Apple Dynamic Island.
13. **규칙 위반의 정당화 사례 제시**: STANDARDS.md의 Cohesion이 Sonner를 예로 들며 "slightly slower, `ease` rather than `ease-out`, to feel elegant"라고 서술 — 자기 규칙(기본 `ease-out`)의 예외를 미학 근거로 인정.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**motion that feels right**" vs "motion that merely runs" | 10개 표준 통과 + 14개 트리거 부재 |
| "**feels sluggish**" | `ease-in` 사용, 또는 UI에서 300ms 초과. "delays the moment the user watches most" |
| "**feels faster**" | "`ease-out` at 200ms *feels* faster than `ease-in` at 200ms" / "A 180ms dropdown feels more responsive than a 400ms one" / "Faster spinners make load feel faster (same actual time)" / "Instant tooltips after the first ... make a toolbar feel faster" |
| "**feel-breaking regression**" | Verdict 티어 1의 조작적 정의: sluggish easing / comes-from-nowhere / fires on high-frequency·keyboard actions |
| "**comes-from-nowhere**" | `scale(0)` 또는 초기 transform 없는 순수 페이드 |
| "**alive**" | spring 사용 (Dynamic Island) |
| "**artificial**" (마우스 추적) | 값을 마우스 위치에 직접 연결 → `useSpring` 보간 |
| "**an invisible wall**" | 하드 스톱 → 상승하는 friction |
| "**personality**" | "playful can be bouncier; a professional dashboard should be crisp and fast" |
| "**elegant**" (Sonner) | "slightly slower, `ease` rather than `ease-out`" |
| "**there's no formula**" (opacity+height) | **번역 불가로 명시** — "trial and error ... adjust until it feels right" |
| "**when feel is uncertain**" | 슬로모션(2–5×) / 프레임별 / 실기기 / 다음날 신선한 눈 — 4가지 검증 절차로 이송 |

## 7. 산출물

- **형식**: 대화 산출물 2부 (파일 생성 없음)
  - **Part 1**: `| Before | After | Why |` 단일 마크다운 표, 이슈당 1행
  - **Part 2**: 6개 임팩트 티어별 코멘트 (빈 티어 생략) + **Block 또는 Approve 판정**
- 모든 지적에 `file:line` 인용
- 값은 STANDARDS.md에서 정확히 인용
- **파일 저장 위치 / 네이밍 규칙**: 해당 없음. **원문에 명시 없음.**

## 8. 주의점 / 한계

- **웹 CSS 전제 — RN/Expo에 부적합**: STANDARDS.md 전체가 CSS/DOM 전제(`transition: all`, `@media (hover: hover)`, CSS 변수, `@starting-style`, `clip-path`). `animate-expo`로 만든 React Native 코드에 이 스킬을 적용하면 대량 오탐이 발생한다. **원문에 이 경계에 대한 언급이 없다** — `improve-animations`의 `execute` 변형이 "review its diff with the `review-animations` bar"라고만 지시하므로, RN 프로젝트에서는 잘못된 게이트가 걸릴 수 있음.
- **`prototype`의 피커와 충돌**: PICKER.md는 `width` transition을 의도적 예외로 사용하고 근거를 밝히지만, 이 스킬의 표준 7과 트리거는 layout 속성 애니메이션을 finding으로 규정. 프로토타입 표면을 리뷰 대상에 포함하면 오탐. **원문에 예외 처리 없음.**
- **`disable-model-invocation: true`의 부작용**: 자동으로 켜지지 않으므로, `improve-animations execute`가 "review-animations bar"로 검토한다는 지시가 실제로 이 스킬을 로드하는지는 하네스에 의존. 원문에 메커니즘 설명 없음.
- **값 중복 (컬렉션 전체의 문제)**: easing 토큰 3개, duration 표, frequency 표, scale 값, spring 프리셋, stagger 30–80ms, velocity 0.11, blur 20px가 `animate`, `emil-design-eng`, `improve-animations/AUDIT.md`, `find-animation-opportunities`, 그리고 여기 STANDARDS.md에 **5중 복제**되어 있다. 한 곳만 갱신되면 스킬 간 판정이 갈린다.
- **"needs justification"의 판정 여지**: 표준 4가 300ms 초과를 "needs justification or it's a finding"으로 두는데, 무엇이 정당한 사유인지 기준은 **원문에 명시 없음** (마케팅 페이지 정도만 예시).
- **Cohesion(표준 10)의 검증 불가능성**: "성격 일치"는 코드만으로 판정하기 어렵고, `improve-animations`처럼 Recon 단계에서 제품 성격을 수집하는 절차가 이 스킬에는 없다. diff만 보고 성격 불일치를 판정하도록 되어 있음 — 구조적 약점.
- **Block 판정의 강도**: "any feel-breaking regression"이 Block 사유이고 기본값이 flagging이므로, 실무에서 대부분의 diff가 Block될 가능성이 있다. 이는 의도된 설계("approval is earned")이지만 도입 시 팀 합의가 필요한 지점.
- **강한 경고 지점**:
  - "Default to flagging. Approval is earned, not assumed."
  - "A transition that \"works\" but feels sluggish ... is a regression, not a pass."
  - "`ease-in` on UI is a block."
  - "Flag these on sight, hard."
  - "**Delete the animation**" — 처방 1순위
  - "When unsure whether motion feels right, the strongest move is often to delete it."
  - "Never a \"Before:/After:\" list."
  - "pull the exact one from STANDARDS.md rather than approximating."
- **검증 장치**: 10개 표준 + 14개 트리거 + Block/Approve 조건 + `file:line` 인용 의무 + 값 출처 고정. 텍스트 기준으로는 이 컬렉션에서 가장 촘촘하지만, 실행 가능한 린터·테스트는 없어 전부 모델의 판독에 의존.
