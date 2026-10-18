# animation-vocabulary 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/animation-vocabulary/`
- **핵심 파일**: `SKILL.md` (13,128 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: 애니메이션 **역방향 조회 용어집(reverse-lookup glossary)**. 디자인·구현을 하지 않고, 모호한 묘사를 정확한 용어로 변환하는 것만 담당.

원문 자기 규정: "For naming an effect, not designing or building one."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Reverse-lookup glossary that turns a vague description of a web animation or motion effect into its exact term (\"the bouncy thing when a popover opens\" → Pop in; \"the iOS rubber-band scroll\" → Rubber-banding). Use when the user asks \"what's it called when…\", or describes a motion effect without knowing its name and wants the right word to prompt an AI or designer with. For naming an effect, not designing or building one."

**매칭되는 사용자 발화**
- "이거 뭐라고 하지? 팝오버 열릴 때 통통 튀는 거"
- "what's it called when…" — description이 이 문구를 직접 트리거로 지정
- "iOS에서 스크롤 끝까지 당기면 튕겨 돌아오는 거 용어가 뭐야"
- 특히 **AI나 디자이너에게 프롬프트를 쓰려고 정확한 단어를 찾는** 상황을 명시적으로 겨냥 ("wants the right word to prompt an AI or designer with")

**배제되는 발화**: 만들어 달라는 요청 (→ `animate`), 비평 요청 (→ `review-animations`).

`allowed-tools` / `metadata`: **원문에 명시 없음** (`name`, `description`만).

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 사용자가 효과를 눈으로만 알고 이름을 모를 때, 그 이름을 알아야 다음 요청(프롬프트, 디자이너 커뮤니케이션)이 정확해지는 상황
- 유사 용어 사이에서 무엇을 요청해야 할지 헷갈릴 때 — 원문이 지목한 3쌍: *Clip-path* vs *Mask*, *Pop in* vs *Bounce*, *Shared element transition* vs *Layout animation*
- 이 스킬은 **`animate`의 선행 단계**로 유용: 용어가 확정되면 `animate`나 RECIPES.md의 어느 항목인지 특정 가능

**부적합 / 과한 상황**
- 구현이나 값(duration, easing)을 원할 때 — 이 스킬에는 수치가 전혀 없음
- 이미 용어를 아는 사용자 — 순수 오버헤드
- 용어집에 없는 효과 — 원문이 발명을 금지하므로 답이 "없다"로 끝날 수 있음

**형제 스킬 대신 이걸 고르는 기준**: 요청의 산출물이 **단어 하나**인가. 코드/판단문이 필요하면 다른 스킬.

## 4. 외부 의존성

- **API 키**: **불필요**.
- **폴백 모드**: 해당 없음.
- **CLI/런타임/패키지**: **없음.** 스크립트 없음, 실행 요소 전무. 지식 자체가 SKILL.md에 인라인.
- **네트워크**: 불필요.
- **비용 발생 지점**: 없음.
- 단, 용어집은 "A curated snapshot mirroring the project's `/vocabulary` page; keep the two in sync when either changes." — 외부 웹페이지와의 **수동 동기화 부채**가 존재 (자동 fetch는 없음).

## 5. 워크플로우

Quick Start + Instructions 6항목이 곧 절차.

1. **입력 수신** — 사용자가 효과를 느슨하게 묘사.
2. **Read for intent, not keywords.** — "Users describe what they *see* or *feel* (\"springy\", \"slides off\", \"draws itself in\"), not the technical name. Map the sensation to the glossary below." 키워드 매칭이 아니라 감각→용어 매핑.
3. **Quote the glossary verbatim.** — "Its descriptions are authoritative — use them as-is, don't paraphrase." 설명문을 재작성하지 않음. (이 단계가 출력 품질의 일관성을 보장하는 장치)
4. **분기 — 후보 개수에 따라 출력 형태가 갈림**:
   - 정확히 1개: 단일 용어 출력
   - 여러 개 경합: "list the best match first, then 1–2 alternates with a one-line note on how they differ" → Example 2의 `Morph` + `Close alternates:` 형태
   - **정확히 매칭 없음**: "name the closest term and say plainly it's an approximation, or describe the effect in the glossary's vocabulary (e.g. \"that's a *stagger* of *scale-in* entrances\")" → 즉 용어집 어휘의 **조합**으로 합성
   - **용어집에 진짜 없음**: "say so rather than inventing one — though you may explain the concept using these words." → 발명 금지 게이트
5. **출력 포맷 고정**:
   ```
   **Stagger** — Animate several items one after another with a small delay between each, creating a cascade.
   ```
6. **Keep it tight.** — "A naming question wants a name, not an essay. Lead with the term; expand only if asked."

**사용자 확인 요구 지점**: 없음. 확장은 사용자가 추가로 물을 때만 ("expand only if asked").

**앞 단계 산출물의 사용 관계**: 2단계(감각 해석)의 결과가 3단계(원문 인용)의 조회 키가 되고, 4단계 분기는 조회 결과 개수에 의해 결정됨. 순서 자체가 "해석 → 조회 → 분기 → 포맷"으로 단선적.

## 6. 디자인 지침 분석

이 스킬은 **미적 판단을 강제하지 않는다** — 용어집이므로 지침의 성격이 다름. 다만 용어 정의 안에 **규범적 판단이 삽입되어 있다는 점**이 이 컬렉션의 특징이다.

### 금지 규칙 (anti-pattern)

스킬 자체의 금지:
- "**Stay within this glossary.** If a term genuinely isn't here, say so rather than inventing one" — 용어 발명 금지
- "Quote the glossary verbatim. ... don't paraphrase." — 의역 금지
- "A naming question wants a name, not an essay." — 장문 금지

**용어 정의문에 숨어 있는 디자인 금지 규칙** (원문 그대로):
- **Ease-in** — "Starts slow, ends fast. **Usually avoided; can feel sluggish.**"
- **Linear** — "Constant speed. **Avoid for UI**; reserve for spinners or marquees."
- **Layout thrashing** — "Animating properties like width, height, top, or left that force the browser to recalculate layout every frame, **causing jank**."
- **Jank** — "Visible stutter when the browser drops frames"

즉 중립적 사전이 아니라, `animate` / `review-animations`의 규칙과 **같은 방향의 가치판단이 정의문에 내장**되어 있다.

### 강제 규칙 — 수치

수치 지침은 거의 없음. 존재하는 유일한 수치:
- **Frame rate (FPS)** — "60fps is the baseline for smooth motion; 120fps on newer displays."
- **Keyframes** — "Defined points in an animation (0%, 50%, 100%)"

spacing / border-radius / contrast ratio / duration 값 등은 **원문에 명시 없음** (설계상 범위 밖).

### 항목별 지침

- **타이포그래피**: 모션 맥락에서만 등장 — **Text morph**("Text that animates character by character when it changes"), **Typewriter**, **Number ticker**, **Tabular numbers**("Fixed-width digits so numbers don't shift around as they change. **Essential for tickers, timers, and counters.**"). 정적 타이포그래피 지침은 없음.
- **컬러**: **원문에 지침 없음** (컬러 용어 항목 자체가 없음).
- **스페이싱**: **원문에 지침 없음.**
- **모션**: 전체가 이 항목. 13개 카테고리로 분류 — Entrances & Exits / Sequencing & Timing / Movement & Transforms / Transitions Between States / Scroll / Feedback & Interaction / Easing / Spring Animations / Looping & Ambient Motion / Polish & Effects / Performance / Principles to Know.
- **레이아웃**: 공간 관계 용어로만 — **Transform origin**, **Origin-aware animation**, **Spatial consistency**("Animating so an element keeps its identity and position across states, so users never lose track of where things went"), **Direction-aware transition**.
- **접근성**: **Reduced motion** — "Respecting the user's prefers-reduced-motion setting by toning down or removing motion."
- **성능**: Compositing, will-change, Layout thrashing, Hardware acceleration("Animating transform and opacity lets the GPU keep motion smooth") — `animate`의 property 규칙과 동일한 근거.

### 지침을 주는 방식 자체

1. **역방향 사전(reverse dictionary)**: 감각어 → 용어. 일반 용어집과 방향이 반대이며, 이 방향성이 스킬의 존재 이유.
2. **카테고리 분류 + 한 줄 정의**: 13개 카테고리, 각 항목당 한 문장. 코드 예시 없음, 체크리스트 없음.
3. **Few-shot 예시 3개**: feel-based / disambiguation / physics feel — 세 가지 입력 유형별로 출력 형태를 보여줌.
4. **실물 참조를 정의문에 내장**: "Dynamic Island"(Morph), "the iOS overscroll feel"(Rubber-banding), "like a thumbnail expanding into a card"(Shared element transition), "like an invisible pen tracing it"(Line drawing).
5. **원칙 섹션으로 가치판단 명시**: "Principles to Know" 카테고리는 용어가 아니라 규범 — **Purposeful animation**("Motion should serve a function — orient, give feedback, show relationships — not just decorate"), **Frequency of use**("The more often a user sees an animation, the shorter and subtler it should be"), **Perceived performance**("The right animation makes an interface feel faster, even when it isn't"). 이 3개는 `animate`의 Step 1·2 게이트와 정확히 대응.
6. **권위 고정**: "Its descriptions are authoritative" — 모델의 재해석 여지를 제거.

### 모호한 감각어의 번역

이 스킬은 **감각어→용어 번역 자체가 유일한 기능**이며, 그 대응이 예시로 명시됨:

| 감각어 (원문) | 번역된 용어 |
| --- | --- |
| "the bouncy thing when a popover opens" | **Pop in** — "Element appears with a slight overshoot, like it bounces into place." |
| "the iOS rubber-band scroll" / "resists and snaps back when you pull too far" | **Rubber-banding** |
| "seems to grow out of the button you clicked instead of from its middle" | **Origin-aware animation** |
| "one image turns into another image" | **Morph** (+ 대안 Crossfade, Shared element transition) |
| "springy" | **Spring** 계열 |
| "slides off" | **Slide in** / **Swipe to dismiss** |
| "draws itself in" | **Line drawing** |
| "feels more alive" | **Asymmetric easing** — "Feels more alive than a symmetric one." |
| "makes a static element feel alive and weightless" | **Float** |
| "separate good from great" | **Polish & Effects** 카테고리 전체 |
| "feels finished" (스프링이 미세 정착 중인데도) | **Perceptual duration** |

특히 **Perceptual duration**("How long a spring feels finished, even though it keeps micro-settling underneath")과 **Perceived performance**는 "느낌"을 그 자체로 정식 개념화한 항목 — 감각어를 수치로 환원하지 않고 **감각을 다루는 전문 용어를 제공**하는 방식.

## 7. 산출물

- **형식**: 마크다운 텍스트 (코드 블록 안의 용어 정의문). 파일 생성 없음.
- **고정 포맷**:
  ```
  **<Term>** — <glossary description verbatim>
  ```
  경합 시:
  ```
  **<Best match>** — <description>

  Close alternates:
  - **<Alt>** — <how it differs>
  ```
- **저장 위치 / 네이밍 규칙**: 해당 없음 (파일 산출물이 없음). **원문에 명시 없음.**

## 8. 주의점 / 한계

- **동기화 부채**: 용어집은 "a curated snapshot mirroring the project's `/vocabulary` page"이며 "keep the two in sync when either changes"가 사람에게 남겨진 숙제. 자동 갱신 장치 없음 → 원본 페이지가 바뀌면 이 스킬은 낡은 스냅샷이 됨.
- **닫힌 어휘의 한계**: 용어집 밖 개념은 답변 불가로 처리됨. 새 브라우저 API나 신조어(예: View Transitions의 세부 용어)는 커버 범위 밖일 수 있음.
- **커버 범위**: 웹 애니메이션 중심. 네이티브(iOS/Android) 고유 용어는 Rubber-banding·Dynamic Island 정도의 비유로만 등장 — SwiftUI 모션 용어는 커버하지 않음.
- **다른 스킬과의 충돌**: 낮음. 산출물 형태(단어 vs 코드)가 명확히 달라 `animate`와 겹치지 않음. 오히려 `animate` 요청 전 단계로 연쇄 사용이 자연스러움.
- **원문에서 강하게 경고하는 부분**:
  - "Quote the glossary verbatim. Its descriptions are authoritative — use them as-is, don't paraphrase."
  - "Stay within this glossary. If a term genuinely isn't here, say so rather than inventing one."
  - "Keep it tight. A naming question wants a name, not an essay."
- **한계**: 검증 장치 없음. 잘못된 용어를 골랐을 때 이를 잡아주는 체크리스트나 스크립트가 없으며, 정확성은 감각→용어 매핑의 품질에 전적으로 의존.
