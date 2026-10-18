# stitch-design-taste 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/stitch-design-taste/`
- **핵심 파일**: `SKILL.md` (11,851 bytes) — DESIGN.md를 **생성하는 방법**을 규정
- **보조 파일**: `DESIGN.md` (12,053 bytes) — **완성된 참조 산출물**. "Design System: Taste Standard"라는 이름으로 다이얼 4개 + 9개 섹션이 채워진 실제 예시
- **성격**: **메타 스킬**. 직접 UI를 만들지 않고, **Google Stitch용 `DESIGN.md` 파일을 생성**한다. 즉 산출물이 "다른 AI 도구를 위한 디자인 시스템 문서"다. 이 컬렉션에서 유일하게 특정 외부 제품(Google Stitch)을 대상으로 한다.

원문 자기 규정: "This skill generates `DESIGN.md` files optimized for Google Stitch screen generation. It translates the battle-tested anti-slop frontend engineering directives into **Stitch's native semantic design language** — descriptive, natural-language rules paired with precise values that Stitch's AI agent can interpret."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance."

**매칭되는 사용자 발화**
- "Stitch용 DESIGN.md 만들어줘"
- "Google Stitch로 화면 생성할 디자인 시스템 문서"
- "Stitch에 넣을 디자인 가이드"

**특징**: 대상 제품이 명확하므로 트리거 오작동 위험이 낮다. 다만 "Use when…" 문구는 없다.

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **Google Stitch를 실제로 쓰는 워크플로우** — labs.google/stitch에서 화면을 생성하고, 그 스타일을 일관되게 통제해야 할 때
- Stitch MCP 서버로 Cursor / Antigravity / Gemini CLI와 연동하는 파이프라인
- 여러 화면을 생성할 때 **단일 진실 소스**가 필요할 때 — "serves as the **single source of truth**"
- Stitch 산출물을 코딩 에이전트가 이어받아 구현할 때 — §8이 그 핸드오프를 명시적으로 설계 (아래 §5 참조)
- 첨부된 `DESIGN.md`를 **그대로 쓰거나 다이얼만 조정**하고 싶을 때 — 이미 완성된 시스템이 제공됨

**부적합 / 과한 상황**
- **Stitch를 쓰지 않는 프로젝트** — 이 스킬의 존재 이유가 사라진다. 다만 생성되는 `DESIGN.md`는 일반적인 디자인 시스템 문서이므로 다른 에이전트에게도 쓸 수 있다 (원문에 이 용법은 명시 없음)
- 직접 코드를 원할 때 → `design-taste-frontend` / `high-end-visual-design`
- 모션이 핵심인 결과물 — "**Note:** Stitch generates static screens — **it does not animate.**" 모션 섹션은 후속 코딩 단계를 위한 의도 기록일 뿐
- 브랜드 팔레트가 확정된 프로젝트 — 액센트 4개 후보가 고정값으로 제시됨

**형제 스킬 대신 이걸 고르는 기준**: 도구가 **Google Stitch**인가. 그 외에는 이 컬렉션의 다른 스킬이 더 직접적이다.

## 4. 외부 의존성

- **API 키**: **불필요** (원문에 언급 없음).
- **Prerequisites (원문 명시)**
  - "**Access to Google Stitch** via [labs.google/stitch](https://labs.google/stitch)"
  - "Optionally: **Stitch MCP Server** for programmatic integration with **Cursor, Antigravity, or Gemini CLI**"
- **폴백 모드**: **원문에 명시 없음.** Stitch 접근이 없을 때의 동작이 규정되지 않았다.
- **필요한 CLI/런타임/패키지**: 스킬 자체는 없음 (마크다운 파일 생성). 생성된 `DESIGN.md`가 지시하는 대상:
  - 폰트: `Geist`, `Geist Mono`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, `JetBrains Mono`, (세리프 필요 시) `Fraunces`, `Gambarino`, `Editorial New`, `Instrument Serif`
  - 이미지: `picsum.photos/seed/{id}/800/600` 또는 SVG UI Avatars
  - 후속 코딩 단계: spring physics 라이브러리 (`stiffness: 100, damping: 20`), CSS Grid
- **네트워크**: Stitch 접근, 폰트·이미지 로딩
- **비용 발생 지점**: **Google Stitch 사용 비용** (원문에 언급 없음). 이 스킬 자체는 비용 0.

## 5. 워크플로우

### 목표 — 7개 항목을 인코딩한 `DESIGN.md` 생성
"Generate a `DESIGN.md` file that encodes:"
1. Visual atmosphere — mood, density, design philosophy
2. Color calibration — neutrals, accents, banned patterns **with hex codes**
3. Typographic architecture — font stacks, scale hierarchy, anti-patterns
4. Component behaviors — buttons, cards, inputs with interaction states
5. Layout principles — grid systems, spacing philosophy, responsive strategy
6. Motion philosophy — animation engine specs, spring physics, perpetual micro-interactions
7. Anti-patterns — explicit list of banned AI design clichés

### Analysis & Synthesis Instructions — 9단계

**1. Define the Atmosphere** — 3개 다이얼 (SKILL.md)
"Evaluate the target project's intent. Use evocative adjectives from the taste spectrum:"

| 다이얼 | 1–3 | 4–7 | 8–10 |
|---|---|---|---|
| **Density** | "Art Gallery Airy" | "Daily App Balanced" | "Cockpit Dense" |
| **Variance** | "Predictable Symmetric" | "Offset Asymmetric" | "Artsy Chaotic" |
| **Motion** | "Static Restrained" | "Fluid CSS" | "Cinematic Choreography" |

"**Default baseline: Variance 8, Motion 6, Density 4.** Adapt dynamically based on user's vibe description."

(참조 `DESIGN.md`는 여기에 **Creativity** 다이얼을 추가해 4개로 확장했다 — SKILL.md와 DESIGN.md 사이의 불일치)

**2. Map the Color Palette**
"For each color provide: **Descriptive Name** + **Hex Code** + **Functional Role**."

**Mandatory constraints (원문)**:
- "Maximum **1 accent color**. Saturation **below 80%**"
- "The \"**AI Purple/Blue Neon**\" aesthetic is strictly **BANNED** — no purple button glows, no neon gradients"
- "Use absolute neutral bases (**Zinc/Slate**) with high-contrast singular accents"
- "Stick to **one palette** for the entire output — **no warm/cool gray fluctuation**"
- "**Never use pure black (`#000000`)** — use Off-Black, Zinc-950, or Charcoal"

**3. Establish Typography Rules**
- Display: "Track-tight, controlled scale. **Not screaming.** Hierarchy through **weight and color, not just massive size**"
- Body: "Relaxed leading, max **65 characters per line**"
- Font: "`Inter` is **BANNED** for premium/creative contexts. Force unique character: `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`"
- Serif Ban: "Generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`, `Palatino`) are **BANNED**. If serif is needed ... use only distinctive modern serifs: `Fraunces`, `Gambarino`, `Editorial New`, or `Instrument Serif`. **Serif is always BANNED in dashboards or software UIs**"
- Dashboard: "Use Sans-Serif pairings exclusively (`Geist` + `Geist Mono` or `Satoshi` + `JetBrains Mono`)"
- High-Density Override: "**When density exceeds 7, all numbers must use Monospace**"

**4. Define the Hero Section**
- "**Inline Image Typography:** Embed small, contextual photos or visuals directly between words or letters in the headline. Images sit inline at type-height, rounded, acting as visual punctuation. **This is the signature creative technique**"
- "**No Overlapping:** Text must never overlap images or other text."
- "**No Filler Text:** \"Scroll to explore\", \"Swipe down\", scroll arrow icons, bouncing chevrons are **BANNED**. The content should pull users in naturally"
- "**Asymmetric Structure:** Centered Hero layouts **BANNED when variance exceeds 4**"
- "**CTA Restraint:** Maximum **one** primary CTA. No secondary \"Learn more\" links"

**5. Describe Component Stylings** — 6개 컴포넌트
- Buttons: "Tactile push feedback on active state. **No neon outer glows. No custom mouse cursors**"
- Cards: "Use **ONLY when elevation communicates hierarchy**. Tint shadows to background hue. **For high-density layouts, replace cards with border-top dividers or negative space**"
- Inputs/Forms: "Label above input, helper text optional, error text below"
- Loading States: "**Skeletal loaders** matching layout dimensions — **no generic circular spinners**"
- Empty States: "Composed compositions indicating how to populate data"
- Error States: "Clear, inline error reporting"

**6. Define Layout Principles**
- "No overlapping elements ... **No absolute-positioned content stacking**"
- "Centered Hero sections are **BANNED when variance exceeds 4** — force Split Screen, Left-Aligned, or Asymmetric Whitespace"
- "The generic \"**3 equal cards horizontally**\" feature row is **BANNED** — use 2-column Zig-Zag, asymmetric grid, or horizontal scroll"
- "**CSS Grid over Flexbox math** — never use `calc()` percentage hacks"
- "Contain layouts using max-width constraints (e.g., **1400px** centered)"
- "Full-height sections must use **`min-h-[100dvh]`** — **never `h-screen`** (iOS Safari catastrophic jump)"

**7. Define Responsive Rules** — 7항목
- Mobile-First Collapse (**< 768px**): "All multi-column layouts collapse to single column. **No exceptions**"
- No Horizontal Scroll: "Horizontal overflow on mobile is a **critical failure**"
- Typography Scaling: "Headlines scale via `clamp()`. Body text minimum **`1rem`/`14px`**"
- Touch Targets: "All interactive elements minimum **`44px`** tap target"
- Image Behavior: "Inline typography images ... **stack below headline on mobile**"
- Navigation: "Desktop horizontal nav collapses to clean mobile menu"
- Spacing: "Vertical section gaps reduce proportionally (**`clamp(3rem, 8vw, 6rem)`**)"

**8. Encode Motion Philosophy**
- "**Spring Physics default:** `stiffness: 100, damping: 20` — premium, weighty feel. **No linear easing**"
- "**Perpetual Micro-Interactions:** Every active component should have an **infinite loop state** (Pulse, Typewriter, Float, Shimmer)"
- "**Staggered Orchestration:** Never mount lists instantly — use cascade delays for waterfall reveals"
- "**Performance:** Animate exclusively via `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`. Grain/noise filters on **fixed pseudo-elements only**"

**9. List Anti-Patterns (AI Tells)** — 16항목 (§6 참조)

### 출력 형식 — `DESIGN.md` 7섹션 골격 (SKILL.md 제공)
```
# Design System: [Project Title]
## 1. Visual Theme & Atmosphere
## 2. Color Palette & Roles
## 3. Typography Rules
## 4. Component Stylings
## 5. Layout Principles
## 6. Motion & Interaction
## 7. Anti-Patterns (Banned)
```

(첨부된 실제 `DESIGN.md`는 9섹션 + Configuration 다이얼 표로 확장되어 있다 — Hero Section과 Responsive Rules가 독립 섹션으로 분리됨)

### 핸드오프 설계 (참조 DESIGN.md §8의 주석) — **이 스킬의 중요한 구조**
> "**Note:** Stitch generates static screens — **it does not animate.** This section documents the **intended motion behavior** so that the coding agent (Antigravity, Cursor, etc.) knows exactly how to implement animations when building the exported design into a live product."

즉 파이프라인이 3단이다: **이 스킬 → Stitch (정적 화면) → 코딩 에이전트 (모션 구현)**. 모션 섹션은 마지막 단계를 위한 사양서.

**사용자 확인 요구 지점**: **없음.** 다만 다이얼 조정은 사용자가 하도록 설계됨 — 참조 DESIGN.md: "**How to use:** Change the numbers above to match your project's vibe."

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

**SKILL.md §9 Anti-Patterns (16항목)**
- No emojis anywhere
- No `Inter` font
- No generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`) — distinctive modern serifs only if needed
- No pure black (`#000000`)
- No neon/outer glow shadows
- No oversaturated accents
- No excessive gradient text on large headers
- No custom mouse cursors
- No overlapping elements — clean spatial separation always
- No 3-column equal card layouts
- No generic names ("John Doe", "Acme", "Nexus")
- No fake round numbers (`99.99%`, `50%`)
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- No filler UI text: "Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons
- No broken Unsplash links — use `picsum.photos` or SVG avatars
- No centered Hero sections (for high-variance projects)

**참조 DESIGN.md §9 (확장된 20항목)** — 위에 다음이 추가:
- "No generic names: \"John Doe\", \"**Sarah Chan**\", \"Acme\", \"Nexus\", \"**SmartFlow**\""
- "No fake round numbers: `99.99%`, `50%`, `1234567` — **use organic data: `47.2%`, `+1 (312) 847-1928`**"
- AI 클리셰에 "**Revolutionize**" 추가
- "No generic **`shadcn/ui` defaults** — customize radii, colors, shadows to match this system"
- "No **`z-index` spam** — use only for Navbar, Modal, Overlay layer contexts"
- "No `h-screen` — always `min-h-[100dvh]`"
- "No **circular loading spinners** — skeletal shimmer only"
- 이미지: "use `picsum.photos/seed/{id}/800/600` or **SVG UI Avatars**"

**Common Pitfalls to Avoid (SKILL.md, 메타 수준 금지)**
- "Using technical jargon **without translation** (\"rounded-xl\" instead of \"generously rounded corners\")"
- "Omitting hex codes or using only descriptive names"
- "Forgetting functional roles of design elements"
- "Being too vague in atmosphere descriptions"
- "**Ignoring the anti-pattern list — these are what make the output premium**"
- "**Defaulting to generic \"safe\" designs** instead of enforcing the curated aesthetic"

### 강제 규칙 — 수치 인용

**컬러 (참조 DESIGN.md — 완전한 팔레트)**

| 이름 | 값 | 역할 |
|---|---|---|
| Canvas White | **`#F9FAFB`** | "Primary background surface. Warm-neutral, never clinical blue-white" |
| Pure Surface | **`#FFFFFF`** | "Card and container fill" |
| Charcoal Ink | **`#18181B`** | "Primary text. Zinc-950 depth — never pure black" |
| Steel Secondary | **`#71717A`** | "Body text, descriptions, metadata. Zinc-500 warmth" |
| Muted Slate | **`#94A3B8`** | "Tertiary text, timestamps, disabled states" |
| Whisper Border | **`rgba(226,232,240,0.5)`** | "Card borders, structural 1px lines. Semi-transparent for depth" |
| Diffused Shadow | **`rgba(0,0,0,0.05)`** | "Card elevation. Wide-spreading, **40px blur, -15px offset**. Never harsh" |

**Accent Selection (Pick ONE per project)** — 4개 후보
- Emerald Signal **`#10B981`** — "growth, success, positive data dashboards"
- Electric Blue **`#3B82F6`** — "productivity, SaaS, developer tools"
- Deep Rose **`#E11D48`** — "creative, editorial, fashion-adjacent"
- Amber Warmth **`#F59E0B`** — "community, social, warm-toned products"

제약: 액센트 **최대 1개**, 채도 **80% 미만**, 순흑 금지, warm/cool 회색 혼용 금지

**타이포그래피 (참조 DESIGN.md)**
- Display: tracking **`-0.025em`**, weight **700–900**, leading **`1.1`**, scale **`clamp(2.25rem, 5vw, 3.75rem)`**
- Body: weight **400**, leading **`1.65`**, **65ch** max-width, 색 `#71717A`, 크기 **`1rem`/`1.125rem`**
- Mono: metadata **`0.8125rem`**
- 밀도 7 초과 시 모든 숫자 → 모노스페이스

**컴포넌트 (참조 DESIGN.md)**
- Buttons: active **`-1px translateY`** 또는 **`scale(0.98)`**
- Cards: 라운드 **`2.5rem`**, 테두리 **`1px`** semi-transparent, 그림자 **`0 20px 40px -15px rgba(0,0,0,0.05)`**, 내부 패딩 **`2rem–2.5rem`**
- Inputs: focus ring **`2px`** offset, label-input-error gap **`0.5rem`**

**레이아웃 (참조 DESIGN.md)**
- 컨테이너: **`max-width: 1400px`** 중앙
- 수평 패딩: **`1rem`** (모바일) / **`2rem`** (태블릿) / **`4rem`** (데스크톱)
- 전체 높이: **`min-height: 100dvh`**
- Bento: "Row 1: **3 columns** | Row 2: **2 columns (70/30 split)**. Each tile contains a perpetual micro-animation"
- 대안 그리드: "asymmetric Bento grids (**2fr 1fr 1fr**)"

**반응형 (참조 DESIGN.md — SKILL.md보다 상세)**
- 붕괴 기준: **< 768px** → `width: 100%`, `padding: 1rem`, `gap: 1.5rem`
- 본문 최소: **`1rem`** / 절대 **`14px`** 이하 금지
- 터치 타깃: **`44px`** 최소, "Buttons must be **full-width on mobile**"
- 섹션 간격: **`clamp(3rem, 8vw, 6rem)`**
- **테스트 뷰포트 5개 명시**: **`375px`** (iPhone SE), **`390px`** (iPhone 14), **`768px`** (iPad), **`1024px`** (small laptop), **`1440px`** (desktop)
- 강조: "**Responsive is not optional — it is a hard requirement. Every single element must be tested at 375px, 768px, and 1440px.**"

**모션 (참조 DESIGN.md)**
- Spring: **`stiffness: 100, damping: 20`**
- Stagger: **`animation-delay: calc(var(--index) * 100ms)`**
- 목표: "Target **60fps** minimum"
- Perpetual loops: Pulse (status dots) / Typewriter (search bars) / Float (feature icons) / Shimmer (loading states)
- "CPU-heavy perpetual animations isolated in **microscopic leaf components**. Never trigger parent re-renders"

**이미지**: `picsum.photos/seed/{id}/800/600`

### 항목별 지침

**타이포그래피** — 3계층(Display/Body/Mono) + 금지 서체 2군(Inter, 제네릭 세리프) + 허용 대안 명시 + 밀도 연동 규칙(7 초과 → 모노 숫자) + 대시보드 세리프 절대 금지. 수치가 완비됨 (tracking, weight, leading, clamp scale). **위계를 "weight and color"로 만들라는 지침이 특징** — 크기만으로 위계를 만들지 말라는 것.

**컬러** — 7개 중립 토큰 + 4개 액센트 후보 (전부 hex). 각 색에 **Descriptive Name + Hex + Functional Role** 3요소 강제. 액센트 1개·채도 80% 미만·순흑 금지·warm/cool 혼용 금지. Zinc/Slate 계열 지정. **대비 비율(WCAG) 수치는 원문에 없음.**

**스페이싱** — 컨테이너 1400px, 반응형 패딩 3단(1/2/4rem), 카드 내부 2~2.5rem, 섹션 간격 `clamp(3rem, 8vw, 6rem)`, 모바일 gap 1.5rem. spacing scale 체계 선언은 없으나 실용 값이 충분히 제시됨.

**모션** — spring 물리(stiffness/damping) + perpetual micro-loop 4종 + stagger 100ms + transform/opacity 전용 + 60fps 목표. 단 **"Stitch generates static screens — it does not animate"**이므로 이 섹션은 후속 코딩 단계용 사양. `prefers-reduced-motion`은 **원문에 없음.**

**레이아웃** — CSS Grid 우선(`calc()` 퍼센트 금지), 겹침 절대 금지, 3열 균등 카드 금지, Bento 구조 명시(3열/2열 70:30), 중앙 히어로 금지(variance>4), `min-h-[100dvh]`.

**접근성** — 부분적으로 존재:
- 터치 타깃 **44px** 최소 ✓
- 본문 최소 `1rem`/`14px` ✓
- "No tiny hamburger icons **without labels**" ✓
- focus ring 명시 (accent color, 2px offset) ✓
- 5개 뷰포트 테스트 요구 ✓
- **누락**: `prefers-reduced-motion` (perpetual infinite loop를 모든 활성 컴포넌트에 요구하면서 감소 모션 대응 없음), 대비 비율 수치, ARIA, 키보드 내비게이션
→ **이 컬렉션 스타일 스킬 중 접근성 커버가 가장 넓지만 여전히 불완전.**

### 지침을 주는 방식 자체

1. **메타 스킬 구조**: 지침을 직접 적용하지 않고 **지침 문서를 생성**한다. 그 문서가 다른 AI 도구(Stitch)의 입력이 된다. 이 컬렉션에서 유일한 구조.
2. **참조 산출물 동봉**: `DESIGN.md`가 "이렇게 만들라"의 예시가 아니라 **바로 쓸 수 있는 완성품**이다. 사용자는 다이얼 4개만 바꿔도 된다. SKILL.md(방법) + DESIGN.md(결과)의 2층 구조.
3. **다이얼로 강도 조절**: Creativity / Density / Variance / Motion Intent 4개를 1–10으로. 각 다이얼의 1/5/10 지점을 서술로 앵커링 ("`1` = Ultra-minimal, Swiss, silent, monochrome" ↔ "`10` = Expressive, editorial, bold typography experiments"). `garden-skills/web-design-engineer`의 5개 다이얼과 같은 방법론.
4. **다이얼과 규칙의 연동**: 규칙이 다이얼 값에 조건부로 발동한다 — "Centered Hero layouts BANNED **when variance exceeds 4**", "**When density exceeds 7**, all numbers must use Monospace", "high-density layouts replace cards with border-top dividers". **이 컬렉션에서 유일하게 다이얼이 실제 규칙을 분기시킨다.**
5. **3요소 강제 (컬러)**: Descriptive Name + Hex Code + Functional Role. 그리고 Best Practices에서 "\"Deep Charcoal Ink (#18181B)\" — **not just \"dark text\"**"로 예시.
6. **자연어 번역 요구**: "Using technical jargon **without translation** (\"rounded-xl\" instead of \"generously rounded corners\")"를 pitfall로 지목. Stitch가 "Visual Descriptions"로 디자인을 해석하기 때문 — **대상 도구의 인터페이스에 맞춘 표현 규칙**.
7. **Best Practices 5원칙**: Be Descriptive / Be Functional / Be Consistent / Be Precise / **Be Opinionated** ("This is not a neutral template — it enforces a specific, premium aesthetic").
8. **Tips 5항목 + Pitfalls 6항목**: 작성 순서(분위기 먼저 → 패턴 식별 → 시맨틱 명명 → 위계 고려 → **금지 인코딩**)와 실패 방식을 별도 섹션으로.
9. **금지 목록을 품질의 원천으로 규정**: "**Ignoring the anti-pattern list — these are what make the output premium**" / "Encode the bans — **anti-patterns are as important as the rules themselves**".
10. **가짜 데이터의 대안 제시**: 금지만 하지 않고 대체값을 준다 — "use organic data: **`47.2%`, `+1 (312) 847-1928`**". 이 컬렉션에서 유일하게 **유기적 데이터의 예시를 제공**.
11. **도구 한계를 명시하고 핸드오프 설계**: "Stitch generates static screens — it does not animate" → 모션 섹션은 코딩 에이전트용 사양. **파이프라인의 각 단계 역할을 문서에 박아넣음.**
12. **테스트 뷰포트 5개 명시**: 375/390/768/1024/1440px. 이 컬렉션에서 가장 구체적인 반응형 검증 기준.
13. **페르소나 부여 없음**, **실물 브랜드 참조 없음** (다이얼 서술에 "Swiss", "Notion-like"가 등장하는 정도).

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**premium, anti-generic**" (description) | 16~20개 금지 목록 + 액센트 1개/채도<80% + Inter 금지 + hex 7개 중립 토큰 |
| "**Art Gallery Airy**" ↔ "**Cockpit Dense**" | Density 다이얼 1–3 ↔ 8–10. 8 초과 시 숫자 모노스페이스 강제 |
| "**Predictable Symmetric**" ↔ "**Artsy Chaotic**" | Variance 다이얼. 4 초과 시 중앙 히어로 금지 |
| "**Static Restrained**" ↔ "**Cinematic Choreography**" | Motion 다이얼 |
| "**clinical yet warm — like a well-lit architecture studio**" (참조 DESIGN.md의 분위기 예시) | Canvas White `#F9FAFB`("Warm-neutral, never clinical blue-white") + Density 4 + Variance 8 + Motion 6 |
| "**Not screaming**" (Display) | "Hierarchy through **weight and color**, not just massive size" + `clamp(2.25rem, 5vw, 3.75rem)` |
| "**expensive, intentional, alive**" | 다이얼 조합 + perpetual micro-loops + spring physics |
| "**whisper**" (border/shadow) | `rgba(226,232,240,0.5)` 1px / `0 20px 40px -15px rgba(0,0,0,0.05)` |
| "**generously rounded corners**" | `2.5rem` |
| "**tactile push feedback**" | `-1px translateY` 또는 `scale(0.98)` on active |
| "**premium, weighty feel**" (모션) | `stiffness: 100, damping: 20` |
| "**AI Purple/Blue Neon**" (회피 대상) | 퍼플 버튼 글로우, 네온 그라디언트 |
| "**AI Tells**" | 16~20개 금지 목록 전체 |
| "**fake round numbers**" | `99.99%`, `50%`, `1234567` → `47.2%`, `+1 (312) 847-1928` |
| "**signature creative technique**" | Inline Image Typography — 헤드라인 단어 사이에 type-height 라운드 이미지 삽입 |
| "**critical failure**" | 모바일 수평 스크롤 |
| "**catastrophic jump**" | `h-screen`이 iOS Safari에서 유발 → `min-h-[100dvh]` |

## 7. 산출물

- **형식**: **`DESIGN.md` 마크다운 파일** (Stitch의 입력)
- **구조**: SKILL.md가 7섹션 골격을 제시, 참조 DESIGN.md는 Configuration 다이얼 표 + 9섹션으로 확장
  1. Visual Theme & Atmosphere
  2. Color Palette & Roles
  3. Typography Rules
  4. Component Stylings
  5. Hero Section (참조판에서 분리)
  6. Layout Principles
  7. Responsive Rules (참조판에서 분리)
  8. Motion & Interaction (Code-Phase Intent)
  9. Anti-Patterns (Banned)
- **파일명**: `DESIGN.md` (고정)
- **저장 위치**: **원문에 명시 없음** (Stitch 프로젝트 또는 리포지토리 루트로 추정)
- **역할**: "serves as the **single source of truth** for prompting Stitch to generate new screens"

## 8. 주의점 / 한계

- **SKILL.md와 DESIGN.md의 불일치**: SKILL.md는 다이얼 3개(Density/Variance/Motion)와 7섹션 골격을 제시하는데, 첨부된 DESIGN.md는 다이얼 4개(**Creativity** 추가)와 9섹션이다. 어느 쪽이 정본인지 **원문에 명시 없음.** DESIGN.md가 더 발전한 버전으로 보이나 SKILL.md가 갱신되지 않았다.
- **Google Stitch 종속**: Prerequisites가 "Access to Google Stitch"다. Stitch가 실험적 제품(labs.google)이므로 서비스 변경·종료 위험이 있고, **Stitch 없이 쓸 때의 안내가 원문에 없다.** (생성된 DESIGN.md 자체는 범용적으로 쓸 수 있으나 이 용법은 명시되지 않음)
- **Stitch의 "Visual Descriptions" 해석 능력에 의존**: 이 스킬의 핵심 전제는 "Stitch interprets design through **\"Visual Descriptions\"** supported by specific color values"다. 즉 자연어 서술이 정확히 해석된다는 가정이며, **검증 수단이 없다.**
- **모션 섹션의 실효성**: Stitch는 애니메이션을 만들지 않으므로 §8은 후속 코딩 에이전트를 위한 기록이다. 그 핸드오프가 실제로 일어나는지, 코딩 에이전트가 이 섹션을 읽는지는 이 스킬의 통제 밖이다. 파이프라인의 마지막 단계가 **보장되지 않는다.**
- **`prefers-reduced-motion` 부재 + Perpetual Loop 강제의 충돌**: "**Every active component** should have an **infinite loop state**"를 요구하면서 감소 모션 대응이 없다. 무한 루프 애니메이션은 감소 모션 사용자에게 가장 문제가 되는 유형이며, 접근성 커버가 상대적으로 좋은 이 스킬에서도 이 항목은 누락되었다.
- **`shadcn/ui` 금지의 실무적 부담**: "No generic `shadcn/ui` defaults — customize radii, colors, shadows to match this system"은 정당한 요구지만, 커스터마이즈 범위와 방법이 **원문에 없다.**
- **Inline Image Typography의 실현성**: "signature creative technique"으로 지정했지만 Stitch가 이를 정확히 생성할 수 있는지는 불확실하다. 모바일 폴백(헤드라인 아래로 스택)은 규정되어 있어 설계는 성실하다.
- **컬렉션 내 규칙 중복·충돌**: 금지 목록이 `high-end-visual-design`, `minimalist-ui`, `gpt-taste`와 상당 부분 겹친다 (Inter 금지, 순흑 금지, 이모지 금지, AI 카피 클리셰, `h-screen` 금지, `picsum.photos`). 다만 이 스킬은 **`Inter` 금지 이유를 "premium/creative contexts"로 한정**하고 세리프도 조건부 허용하는 등 **가장 세밀한 조건부 금지**를 쓴다. 반면 `industrial-brutalist-ui`는 Inter를 허용하므로 컬렉션 내 판정 불일치가 여전하다.
- **다이얼 기본값의 편향**: "Default baseline: Variance **8**, Motion **6**, Density **4**"가 매우 높은 변량이다. 즉 기본 산출물이 비대칭·실험적 레이아웃이 되며, 보수적 결과를 원하면 사용자가 명시적으로 낮춰야 한다. 이 편향이 **description에는 드러나지 않는다.**
- **강한 경고 지점**:
  - "`Inter` is **BANNED** for premium/creative contexts"
  - "**Serif is always BANNED in dashboards or software UIs**"
  - "The \"AI Purple/Blue Neon\" aesthetic is **strictly BANNED**"
  - "**Never use pure black (`#000000`)**"
  - "Centered Hero layouts **BANNED when variance exceeds 4**"
  - "The generic \"3 equal cards horizontally\" feature row is **BANNED**"
  - "**never `h-screen`** (iOS Safari catastrophic jump)"
  - "Horizontal overflow on mobile is a **critical failure**"
  - "**Responsive is not optional — it is a hard requirement.**"
  - "**Never mount lists instantly**"
  - "**Ignoring the anti-pattern list — these are what make the output premium**"
- **검증 장치**: **부분적으로 존재.** 5개 테스트 뷰포트 명시(375/390/768/1024/1440px)가 이 컬렉션에서 가장 구체적인 검증 기준이며, "Common Pitfalls to Avoid" 6항목이 산출물 자체 점검 역할을 한다. 다만 체크리스트 형식이 아니고 실행 가능한 검증도 없다. 생성된 DESIGN.md가 실제로 Stitch에서 의도한 결과를 내는지 확인하는 루프가 **원문에 없다.**
