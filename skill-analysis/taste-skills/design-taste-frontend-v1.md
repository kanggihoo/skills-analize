# design-taste-frontend-v1 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/design-taste-frontend-v1/`
- **핵심 파일**: `SKILL.md` (21,195 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **종합 프론트엔드 취향 스킬의 v1 버전**. 다이얼 3개 + 아키텍처 규약 + 편향 교정 규칙 + 성능 가드레일 + AI Tells 금지 목록 + 60여 개 "Creative Arsenal" 기법 카탈로그 + Bento 2.0 사양 + 사전 비행 체크리스트로 구성. **`design-taste-frontend`(v2)의 전신이며 하위 호환용으로 보존된 버전.**

원문 자기 규정 (제목): "High-Agency Frontend Skill"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "The original v1 taste-skill, preserved for projects depending on its exact behavior. The current default is `design-taste-frontend` (v2 experimental), which is a substantial rewrite. **Use this v1 install name only if you need exact backward compatibility.**"

**해석**: description이 **디자인 지침이 아니라 버전 정책만 서술한다.** 이 컬렉션에서 유일하게 "자기를 쓰지 말라"에 가까운 안내를 담고 있다:
- 기본값은 `design-taste-frontend`(v2)
- v2는 "a substantial rewrite"
- 이 스킬은 "exact backward compatibility"가 필요할 때만

**매칭되는 사용자 발화**
- "v1 스킬로 해줘", "예전 동작 그대로"
- 기존 프로젝트가 v1 산출물에 맞춰져 있어 일관성이 필요한 경우

**중요**: description에 디자인 트리거(폰트, 레이아웃, 모션 등)가 전혀 없으므로, **일반적인 디자인 요청으로는 활성화되지 않도록 의도된 것으로 보인다.** 즉 v2와의 경쟁을 피하는 설계.

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **v1 산출물과의 정확한 일관성이 필요한 기존 프로젝트** — description이 지정한 유일한 용도
- v2와 v1의 차이를 비교·검증해야 할 때
- v2의 변경이 기존 코드베이스와 충돌할 때의 폴백

**부적합 / 과한 상황**
- **신규 프로젝트** — description이 명시적으로 v2를 기본값으로 지정
- v1/v2 구분이 무의미한 일회성 작업
- Next.js/React가 아닌 스택 — §2가 React/Next.js + Tailwind + Framer Motion을 전제
- 모션을 절제해야 하는 제품 — 기본 MOTION_INTENSITY가 6이며 Bento 사양은 "Every card **must** have an \"Active State\" that loops infinitely"

**형제 스킬 대신 이걸 고르는 기준**: **버전 호환성뿐이다.** 원문이 스스로 "Use this v1 install name **only if** you need exact backward compatibility"라고 규정했으므로, 그 외의 경우에는 v2(`design-taste-frontend`)를 쓰는 것이 원문의 지시다.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 스택 분기가 존재 — "Unless the user explicitly specifies a different stack". 라이브러리 부재 시 **설치 명령을 출력**하도록 규정 (아래 참조).
- **필요한 CLI/런타임/패키지**
  - **React 또는 Next.js** — "Default to Server Components (`RSC`)"
  - **Tailwind CSS (v3 또는 v4)** — "Use Tailwind CSS (v3/v4) for **90% of styling**". **버전 확인 필수**
  - **Framer Motion** — magnetic hover, `layout`/`layoutId`, `staggerChildren`, `AnimatePresence`, `useMotionValue`/`useTransform`
  - **아이콘: 정확히 2개만 허용** — "You MUST use **exactly** `@phosphor-icons/react` or `@radix-ui/react-icons` as the import paths"
  - 폰트: `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, (모노) `Geist Mono`, `JetBrains Mono`
  - 조건부: **GSAP** (ScrollTrigger/Parallax), **ThreeJS/WebGL** — "for isolated full-page scrolltelling or canvas backgrounds"
  - 선택: `zustand` (전역 상태), `shadcn/ui` (단 커스터마이즈 필수)
  - 이미지: `https://picsum.photos/seed/{random_string}/800/600` 또는 SVG UI Avatars
- **의존성 검증 규칙 (MANDATORY)** — 원문:
  > "**DEPENDENCY VERIFICATION [MANDATORY]:** Before importing ANY 3rd party library (e.g. `framer-motion`, `lucide-react`, `zustand`), you MUST check `package.json`. If the package is missing, you MUST output the installation command (e.g. `npm install package-name`) before providing the code. **Never** assume a library exists."
- **네트워크**: 패키지 설치, 폰트·이미지 로딩
- **비용 발생 지점**: 유료 API 없음.

## 5. 워크플로우

이 스킬은 **절차형 워크플로우가 없다.** 대신 (a) 다이얼 3개가 전역 변수로 작동하고, (b) 규칙들이 다이얼 값에 조건부로 발동하며, (c) 마지막에 체크리스트가 있다.

### §1 ACTIVE BASELINE CONFIGURATION — 다이얼 3개
```
DESIGN_VARIANCE:  8  (1=Perfect Symmetry, 10=Artsy Chaos)
MOTION_INTENSITY: 6  (1=Static/No movement, 10=Cinematic/Magic Physics)
VISUAL_DENSITY:   4  (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)
```

**AI Instruction (원문)**: "The standard baseline for all generations is **strictly set to these values (8, 6, 4)**. **Do not ask the user to edit this file.** Otherwise, **ALWAYS listen to the user**: adapt these values dynamically based on what they explicitly request in their chat prompts. Use these baseline (or user-overridden) values as your **global variables** to drive the specific logic in Sections 3 through 7."

→ 다이얼이 §3~§7의 규칙을 구동하는 전역 변수라는 점이 명시됨. 파일 편집 요구 금지 + 대화로 조정.

### 다이얼이 발동시키는 조건부 규칙 (**이 스킬의 핵심 메커니즘**)

| 조건 | 발동 규칙 | 원문 |
|---|---|---|
| `DESIGN_VARIANCE > 4` | 중앙 정렬 히어로 금지 | "Centered Hero/H1 sections are **strictly BANNED** when `DESIGN_VARIANCE > 4`. Force \"Split Screen\" (50/50), \"Left Aligned content/Right Aligned asset\", or \"Asymmetric White-space\"" |
| `VISUAL_DENSITY > 7` | 카드 컨테이너 금지 | "**DASHBOARD HARDENING:** For `VISUAL_DENSITY > 7`, generic card containers are **strictly BANNED**. Use logic-grouping via `border-t`, `divide-y`, or purely negative space." |
| `VISUAL_DENSITY 8-10` | 숫자에 모노스페이스 강제 | "**Mandatory:** Use Monospace (`font-mono`) for all numbers." |
| `MOTION_INTENSITY > 5` | Magnetic micro-physics 구현 | "Implement buttons that pull slightly toward the mouse cursor" |
| `MOTION_INTENSITY > 5` | Perpetual micro-interactions 삽입 | "embed continuous, infinite micro-animations (Pulse, Typewriter, Float, Shimmer, Carousel)" |
| Sections 4 or 7 활성 | 클라이언트 컴포넌트 격리 | "**INTERACTIVITY ISOLATION:** ... the specific interactive UI component MUST be extracted as an isolated leaf component with `'use client'` at the very top." |

### §6 다이얼 레벨별 정의 (Technical Reference)

**DESIGN_VARIANCE**
- **1-3 (Predictable)**: "Flexbox `justify-center`, strict 12-column symmetrical grids, equal paddings"
- **4-7 (Offset)**: "`margin-top: -2rem` overlapping, varied image aspect ratios (e.g., **4:3 next to 16:9**), left-aligned headers over center-aligned data"
- **8-10 (Asymmetric)**: "Masonry layouts, CSS Grid with fractional units (e.g., **`grid-template-columns: 2fr 1fr 1fr`**), massive empty zones (**`padding-left: 20vw`**)"
- **MOBILE OVERRIDE**: "For levels 4-10, any asymmetric layout above `md:` MUST aggressively fall back to a strict, single-column layout (`w-full`, `px-4`, `py-8`) on viewports **< 768px**"

**MOTION_INTENSITY**
- **1-3 (Static)**: "No automatic animations. CSS `:hover` and `:active` states only."
- **4-7 (Fluid CSS)**: "`transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`. Use `animation-delay` cascades. Focus strictly on `transform` and `opacity`. Use `will-change: transform` **sparingly**."
- **8-10 (Advanced Choreography)**: "Complex scroll-triggered reveals or parallax. Use Framer Motion hooks. **NEVER use `window.addEventListener('scroll')`.**"

**VISUAL_DENSITY**
- **1-3 (Art Gallery Mode)**: "Lots of white space. Huge section gaps. Everything feels very expensive and clean."
- **4-7 (Daily App Mode)**: "Normal spacing for standard web apps."
- **8-10 (Cockpit Mode)**: "Tiny paddings. **No card boxes; just 1px lines to separate data.** Everything is packed."

### §10 FINAL PRE-FLIGHT CHECK — 7항목 체크리스트
"Evaluate your code against this matrix before outputting. This is the **last** filter you apply to your logic."
- [ ] Is global state used appropriately to avoid deep prop-drilling rather than arbitrarily?
- [ ] Is mobile layout collapse (`w-full`, `px-4`, `max-w-7xl mx-auto`) guaranteed for high-variance designs?
- [ ] Do full-height sections safely use `min-h-[100dvh]` instead of the bugged `h-screen`?
- [ ] Do `useEffect` animations contain strict cleanup functions?
- [ ] Are empty, loading, and error states provided?
- [ ] Are cards omitted in favor of spacing where possible?
- [ ] Did you strictly isolate CPU-heavy perpetual animations in their own Client Components?

**사용자 확인 요구 지점**: **없음.** 오히려 "Do not ask the user to edit this file"로 파일 편집 요청을 금지한다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

**§7 AI TELLS (Forbidden Patterns)** — 카테고리별

*Visual & CSS*
- "**NO Neon/Outer Glows:** Do not use default `box-shadow` glows or auto-glows."
- "**NO Pure Black:** Never use `#000000`. Use Off-Black, Zinc-950, or Charcoal."
- "**NO Oversaturated Accents**"
- "**NO Excessive Gradient Text:** Do not use text-fill gradients for large headers."
- "**NO Custom Mouse Cursors:** They are outdated and **ruin performance/accessibility**."

*Typography*
- "**NO Inter Font:** Banned. Use `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`."
- "**NO Oversized H1s:** The first heading should not scream. **Control hierarchy with weight and color, not just massive scale.**"
- "**Serif Constraints:** Use Serif fonts ONLY for creative/editorial designs. **NEVER** use Serif on clean Dashboards."

*Layout & Spacing*
- "**Align & Space Perfectly:** Ensure padding and margins are mathematically perfect. Avoid floating elements with awkward gaps."
- "**NO 3-Column Card Layouts:** The generic \"3 equal cards horizontally\" feature row is BANNED."

*Content & Data (The "Jane Doe" Effect)*
- "**NO Generic Names:** \"John Doe\", \"Sarah Chan\", or \"Jack Su\" are banned."
- "**NO Generic Avatars:** DO NOT use standard SVG \"egg\" or **Lucide user icons** for avatars."
- "**NO Fake Numbers:** Avoid predictable outputs like `99.99%`, `50%`, or basic phone numbers (`1234567`). Use organic, messy data (`47.2%`, `+1 (312) 847-1928`)."
- "**NO Startup Slop Names:** \"Acme\", \"Nexus\", \"SmartFlow\"."
- "**NO Filler Words:** Avoid AI copywriting clichés like \"Elevate\", \"Seamless\", \"Unleash\", or \"Next-Gen\"."

*External Resources & Components*
- "**NO Broken Unsplash Links:** **Do not use Unsplash.** Use absolute, reliable placeholders like `https://picsum.photos/seed/{random_string}/800/600` or SVG UI Avatars."
- "**shadcn/ui Customization:** You may use `shadcn/ui`, but **NEVER in its generic default state**. You MUST customize the radii, colors, and shadows."

**§2 아키텍처 금지**
- "**ANTI-EMOJI POLICY [CRITICAL]:** **NEVER** use emojis in code, markup, text content, or alt text. ... **Emojis are BANNED.**"
- "**Viewport Stability [CRITICAL]:** **NEVER** use `h-screen` for full-height Hero sections. ALWAYS use `min-h-[100dvh]` to prevent **catastrophic** layout jumping"
- "**Grid over Flex-Math:** **NEVER** use complex flexbox percentage math (`w-[calc(33%-1rem)]`)."
- "**TAILWIND VERSION LOCK:** ... **Do not use v4 syntax in v3 projects.**"
- "**T4 CONFIG GUARD:** For v4, do **NOT** use `tailwindcss` plugin in `postcss.config.js`."
- "**Never** assume a library exists."

**§3 편향 교정 금지**
- "**ANTI-SLOP:** Discourage `Inter` for \"Premium\" or \"Creative\" vibes."
- "**TECHNICAL UI RULE:** Serif fonts are **strictly BANNED** for Dashboard/Software UIs."
- "**THE LILA BAN:** The \"AI Purple/Blue\" aesthetic is **strictly BANNED**. No purple button glows, no neon gradients."
- "**COLOR CONSISTENCY:** ... Do not fluctuate between warm and cool grays within the same project."
- "**ANTI-CENTER BIAS**" (VARIANCE > 4)
- "**DASHBOARD HARDENING**" (DENSITY > 7)
- "Use cards **ONLY when elevation communicates hierarchy**."
- Loading: "avoid generic circular spinners"

**§4 창의성 구현의 성능 금지 (CRITICAL 3건)**
- "**CRITICAL:** **NEVER use React `useState` for magnetic hover or continuous animations.** Use EXCLUSIVELY Framer Motion's `useMotionValue` and `useTransform` **outside the React render cycle** to prevent performance collapse on mobile."
- "**CRITICAL:** For `staggerChildren`, the Parent (`variants`) and Children **MUST reside in the identical Client Component tree.**"
- "Apply premium Spring Physics ... **no linear easing**."

**§5 성능 가드레일**
- "Apply grain/noise filters exclusively to fixed, pointer-event-none pseudo-elements ... and **NEVER to scrolling containers**"
- "**Never animate `top`, `left`, `width`, or `height`.**"
- "**NEVER spam arbitrary `z-50` or `z-10` unprompted.**"

**§8 라이브러리 혼용 금지 (CRITICAL)**
- "**CRITICAL:** **Never mix GSAP/ThreeJS with Framer Motion in the same component tree.** Default to Framer Motion for UI/Bento interactions. Use GSAP/ThreeJS EXCLUSIVELY for isolated full-page scrolltelling or canvas backgrounds, **wrapped in strict useEffect cleanup blocks**."

**§8 히어로 금지**
- "**Stop doing centered text over a dark image.**"

**§9 Bento 성능 금지**
- "**PERFORMANCE CRITICAL:** Any perpetual motion or infinite loop MUST be memoized (React.memo) and **completely isolated in its own microscopic Client Component**. **Never trigger re-renders in the parent layout.**"

### 강제 규칙 — 수치 인용

**타이포그래피 (§3 Rule 1)**
- Display/Headlines 기본값: **`text-4xl md:text-6xl tracking-tighter leading-none`**
- Body/Paragraphs 기본값: **`text-base text-gray-600 leading-relaxed max-w-[65ch]`**
- 대시보드 페어링: **`Geist` + `Geist Mono`** 또는 **`Satoshi` + `JetBrains Mono`**

**컬러 (§3 Rule 2)**
- "Max **1** Accent Color. Saturation **< 80%**"
- 중립 베이스: **Zinc/Slate**
- 허용 액센트 예시: **Emerald, Electric Blue, Deep Rose**

**레이아웃 (§2)**
- 컨테이너: **`max-w-[1400px] mx-auto`** 또는 **`max-w-7xl`**
- 브레이크포인트: `sm`, `md`, `lg`, `xl` 표준화
- 전체 높이: **`min-h-[100dvh]`**
- 그리드 예시: **`grid grid-cols-1 md:grid-cols-3 gap-6`**
- 모바일 붕괴: **< 768px** → `w-full`, `px-4`, `py-8`

**아이콘 (§2)**
- 정확히 2개 패키지: **`@phosphor-icons/react`** 또는 **`@radix-ui/react-icons`**
- "Standardize `strokeWidth` globally (e.g., exclusively use **`1.5`** or **`2.0`**)"

**인터랙션 (§3 Rule 5)**
- Tactile Feedback: **`-translate-y-[1px]`** 또는 **`scale-[0.98]`** on `:active`

**폼 (§3 Rule 6)**
- "Label **MUST** sit above input. Helper text is optional but **should exist in markup**. Error text below input. Use a standard **`gap-2`** for input blocks."

**Liquid Glass (§4)**
- 1px inner border: **`border-white/10`**
- inner shadow: **`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`**

**모션 (§4, §6, §9)**
- Spring: **`type: "spring", stiffness: 100, damping: 20`**
- Fluid CSS 곡선: **`transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`**
- Stagger: **`animation-delay: calc(var(--index) * 100ms)`** 또는 Framer `staggerChildren`
- 무한 캐러셀: **`x: ["0%", "-100%"]`**
- 알림 배지 지속: **3초**
- 목표: **60fps**

**Bento 2.0 사양 (§9)**
- 배경: **`#f9fafb`**
- 카드: **`#ffffff`** + 1px 테두리 **`border-slate-200/50`**
- 라운드: **`rounded-[2.5rem]`**
- 그림자: **`shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]`** ("diffusion shadow")
- 폰트: `Geist` / `Satoshi` / `Cabinet Grotesk` + `tracking-tight`
- 카드 내부 패딩: **`p-8`** 또는 **`p-10`**
- 레이블 위치: "**outside and below** the cards" (gallery-style)
- 그리드 구성: "Row 1: **3 cols** | Row 2: **2 cols split 70/30**"

**DESIGN_VARIANCE 수치 예시**: `margin-top: -2rem`, 4:3 옆에 16:9, `grid-template-columns: 2fr 1fr 1fr`, `padding-left: 20vw`

### 항목별 지침

**타이포그래피** — Tailwind 클래스 기본값 제공(display/body), Inter 금지, 4개 대안 서체, 대시보드 세리프 절대 금지, 대시보드용 sans+mono 페어링 2세트, H1 과대 금지("Control hierarchy with weight and color"), 밀도 8+ 숫자 모노스페이스. **line-height는 `leading-none`/`leading-relaxed` 유틸리티로만 지정** (수치 없음).

**컬러** — 액센트 1개/채도 80% 미만, Zinc/Slate 베이스, AI 퍼플블루 금지, warm/cool 회색 혼용 금지, 순흑 금지, 그림자를 배경 색조로 tint. Bento 사양에 구체 hex 2개(`#f9fafb`, `#ffffff`). **대비 비율 수치는 원문에 없음.**

**스페이싱** — 컨테이너 1400px/max-w-7xl, 폼 `gap-2`, Bento 카드 `p-8`/`p-10`, 모바일 `px-4 py-8`. spacing scale 체계 선언은 **없음** (Tailwind 기본 전제).

**모션** — spring 물리 고정값, 다이얼별 3단 정의, perpetual micro-loop 5종(Pulse/Typewriter/Float/Shimmer/Carousel), stagger, layout/layoutId, 성능 격리 규칙 3건(CRITICAL). **`prefers-reduced-motion`은 원문에 없음.**

**레이아웃** — 다이얼 기반 3단 정의, 중앙 히어로 조건부 금지, 3열 균등 카드 금지, CSS Grid 강제, `min-h-[100dvh]`, 모바일 강제 붕괴, Bento 2.0 구조.

**아키텍처 (이 스킬의 특징)** — RSC 기본, 클라이언트 컴포넌트 격리, 전역 상태 정책, Tailwind 버전 락, PostCSS 설정 가드, 의존성 검증 의무. **이 컬렉션에서 프레임워크 아키텍처를 가장 깊이 다룬다.**

**접근성** — 매우 얇다:
- "Custom Mouse Cursors ... ruin performance/**accessibility**" (금지 근거로 1회 언급)
- alt text에 이모지 금지 (즉 alt 존재 전제)
- 폼 라벨을 input 위에 강제
- 누락: `prefers-reduced-motion`(무한 루프를 요구하면서), 포커스 링, 대비 비율, ARIA, 키보드 내비게이션, 터치 타깃 크기

### 지침을 주는 방식 자체

1. **다이얼을 전역 변수로 선언 + 규칙에 조건부 발동**: "Use these baseline (or user-overridden) values as your **global variables** to drive the specific logic in Sections 3 through 7." 그리고 실제로 `> 4`, `> 5`, `> 7` 같은 임계값으로 규칙이 켜진다. **이 컬렉션에서 다이얼-규칙 결합이 가장 명시적** (`stitch-design-taste`와 동일 계보).
2. **다이얼 기본값을 고정하고 파일 편집을 금지**: "strictly set to these values (8, 6, 4). **Do not ask the user to edit this file.**" 대신 대화로 조정. 즉 스킬 파일을 불변으로 취급.
3. **LLM 편향을 명시적 전제로**: "LLMs have statistical biases toward specific UI cliché patterns. **Proactively construct** premium interfaces using these engineered rules" / "LLMs naturally generate \"static\" successful states. **You MUST implement full interaction cycles**". `gpt-taste`와 같은 문제의식.
4. **[MANDATORY] / [CRITICAL] 태그**: 규칙 강도를 대괄호 태그로 표시 — `[MANDATORY]`, `[CRITICAL]`, `PERFORMANCE CRITICAL`. 6곳에 사용.
5. **금지에 이름 붙이기**: "**THE LILA BAN**", "**ANTI-CENTER BIAS**", "**DASHBOARD HARDENING**", "**ANTI-EMOJI POLICY**", "**The \"Jane Doe\" Effect**", "**TAILWIND VERSION LOCK**", "**T4 CONFIG GUARD**". 규칙에 고유명을 부여해 각인.
6. **성능 함정을 구체적 API 수준에서 지적**: `useState` for magnetic hover 금지 → `useMotionValue`/`useTransform`. `staggerChildren`의 부모-자식 동일 트리 요구. GSAP/Framer 혼용 금지. **프레임워크 실무 함정을 지침에 편입한 것이 이 스킬의 강점.**
7. **Creative Arsenal (60여 기법 카탈로그)**: 8개 영역 × 5~8개 기법. Navigation & Menus / Layout & Grids / Cards & Containers / Scroll-Animations / Galleries & Media / Typography & Text / Micro-Interactions & Effects. 각 기법이 **1줄 설명**으로 제시 — "**Gooey Menu:** Sub-items detach from the main button like a viscous liquid.", "**Dome Gallery:** A 3D gallery feeling like a panoramic dome." 즉 **아이디어 사전**.
8. **Bento 2.0 전용 사양 (§9)**: 팔레트·라운드·그림자·패딩·레이블 위치까지 완전 처방 + 5개 카드 아키타입의 마이크로 애니메이션 사양. "**Vercel-core meets Dribbble-clean**"이라는 기준선 표현.
9. **5-Card Archetypes를 서사로 규정**: 각 카드가 무엇을 시뮬레이션하는지 명시 — "The Intelligent List: ... Items swap positions using `layoutId`, **simulating an AI prioritizing tasks in real-time**". 애니메이션에 의미를 부여.
10. **사전 비행 체크리스트 (§10, 7항목)**: "This is the **last** filter you apply to your logic." 항목이 **아키텍처·성능 중심**(전역 상태, 모바일 붕괴, dvh, useEffect cleanup, 상태 3종, 카드 생략, 애니메이션 격리)이며 미학 항목이 거의 없다.
11. **참조 대상**: "Apple Control Center" (Bento Grid), "Pinterest" (Masonry), "Mac OS Dock" (Dock Magnification), "Dynamic Island", "Tinder Swipe Stack", "Vercel-core meets Dribbble-clean", "Locomotive Scroll", "Matrix-style" (Text Scramble). **제품·플랫폼 이름을 기법 이름에 직접 사용.**
12. **페르소나 부여 없음** — "High-Agency Frontend Skill"이라는 제목이 그 역할.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**High-Agency**" (제목) | 다이얼 8/6/4 기본값 + AI Tells 금지 + Creative Arsenal 사용 + 상태 3종 구현 |
| "**Artsy Chaos**" (VARIANCE 10) | Masonry, `2fr 1fr 1fr`, `padding-left: 20vw` |
| "**Perfect Symmetry**" (VARIANCE 1) | `justify-center`, 12열 대칭 그리드, 균등 패딩 |
| "**Cinematic/Magic Physics**" (MOTION 10) | 스크롤 트리거 리빌, 패럴랙스, Framer Motion hooks |
| "**Art Gallery/Airy**" (DENSITY 1) | "Lots of white space. Huge section gaps. Everything feels **very expensive and clean**" |
| "**Pilot Cockpit/Packed Data**" (DENSITY 10) | "Tiny paddings. No card boxes; just 1px lines. ... Monospace for all numbers" |
| "**premium, weighty feel**" | `type: "spring", stiffness: 100, damping: 20` |
| "**physical edge refraction**" (Liquid Glass) | `border-white/10` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]` |
| "**simulate a physical push**" | `-translate-y-[1px]` 또는 `scale-[0.98]` on `:active` |
| "**feels \"alive\"**" (Bento) | 모든 카드에 무한 루프 Active State (Pulse/Typewriter/Float/Carousel) |
| "**diffusion shadow**" | `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]` |
| "**Vercel-core meets Dribbble-clean**" | Bento 2.0 사양 전체 (`#f9fafb`/`#ffffff`/`rounded-[2.5rem]`/`p-8~p-10`) |
| "**should not scream**" (H1) | "Control hierarchy with **weight and color**, not just massive scale" |
| "**AI Purple/Blue**" (회피) | 퍼플 버튼 글로우, 네온 그라디언트 → Zinc/Slate + Emerald/Electric Blue/Deep Rose |
| "**organic, messy data**" | `47.2%`, `+1 (312) 847-1928` |
| "**performance collapse on mobile**" | `useState`로 연속 애니메이션 구동 → `useMotionValue`/`useTransform` |
| "**catastrophic layout jumping**" | `h-screen` on iOS Safari → `min-h-[100dvh]` |
| "**gallery-style presentation**" (Bento 레이블) | 제목·설명을 카드 **밖 아래**에 배치 |

## 7. 산출물

- **형식**: React/Next.js + Tailwind + Framer Motion 코드. RSC 기본, 인터랙티브 요소는 `'use client'` 리프 컴포넌트로 격리.
- **의존성 부재 시**: "you MUST output the installation command (e.g. `npm install package-name`) **before providing the code**"
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- **품질 요구**: "Code must be extremely clean, visually striking, memorable, and meticulously refined in every detail."
- 출력 전 §10 체크리스트 7항목 통과.

## 8. 주의점 / 한계

- **원문이 스스로 비권장한다**: description이 "The current default is `design-taste-frontend` (v2 experimental)"이며 "Use this v1 install name **only if** you need exact backward compatibility"라고 명시한다. 즉 이 스킬의 가장 큰 한계는 **설계상 대체되었다는 점**이다.
- **v2와의 차이가 문서화되지 않음**: "a substantial rewrite"라고만 언급되고 무엇이 어떻게 바뀌었는지, v1→v2 마이그레이션 시 무엇이 깨지는지가 **원문에 없다.** 하위 호환용으로 보존한다면서 차이표가 없는 것은 실용적 공백이다.
- **v2가 "experimental"로 표기됨**: 기본값이 실험 상태라는 뜻이므로, 안정성을 원하면 v1을, 최신을 원하면 v2를 써야 하는 판단이 사용자에게 남는다. 그 판단 기준이 **원문에 없다.**
- **접근성 지침이 거의 없다**: 무한 루프 애니메이션을 모든 Bento 카드에 요구하면서(`MOTION_INTENSITY > 5`, §9 B) `prefers-reduced-motion` 대응이 **전혀 없다.** 포커스 링, 대비 비율, ARIA, 터치 타깃도 없다. `redesign-existing-projects`(같은 컬렉션)가 focus ring을 "accessibility requirement, not optional"로 명시하는 것과 대비된다.
- **다이얼 기본값의 강한 편향**: VARIANCE 8은 "Asymmetric" 대역이며 중앙 히어로가 자동 금지된다(>4). MOTION 6은 magnetic physics와 perpetual loop가 자동 발동한다(>5). 즉 **기본 산출물이 매우 실험적·모션 과잉**이 되며, 이 사실이 description에 드러나지 않는다.
- **"Do not ask the user to edit this file"의 경직성**: 다이얼을 대화로만 조정하게 하므로, 프로젝트 단위로 기본값을 낮추고 싶을 때 매번 프롬프트에서 지정해야 한다.
- **라이브러리 결합이 깊다**: Framer Motion이 사실상 필수(magnetic, layoutId, staggerChildren, AnimatePresence)이고 아이콘은 2개 패키지로 제한된다. Tailwind 없이는 대부분의 지침이 무의미하다. 스택이 다른 프로젝트로의 이식 지침이 **원문에 없다.**
- **GSAP/ThreeJS 권장과 혼용 금지의 긴장**: §8이 "leverage GSAP ... or ThreeJS/WebGL"을 권하면서 "Never mix GSAP/ThreeJS with Framer Motion in the same component tree"로 제한한다. 실무에서 경계를 어떻게 그을지(페이지 단위? 라우트 단위?)가 "isolated full-page scrolltelling or canvas backgrounds" 정도로만 안내된다.
- **Creative Arsenal 60여 기법의 구현 부담**: 각 기법이 1줄 설명뿐이며 코드나 라이브러리 지정이 없다. "Locomotive Scroll Sequence", "Dome Gallery", "Holographic Foil Card" 같은 항목은 상당한 구현 비용이 든다. 선택 기준이나 비용 안내가 **원문에 없다.**
- **컬렉션 내 중복**: 금지 목록·다이얼·수치가 `stitch-design-taste`, `high-end-visual-design`, `redesign-existing-projects`와 광범위하게 겹친다 (Inter, 순흑, 액센트 1개/80%, `h-screen`, 3열 카드, picsum, John Doe/Acme, AI 카피 클리셰, spring 100/20, `cubic-bezier(0.16,1,0.3,1)`). 특히 `stitch-design-taste`의 DESIGN.md는 이 스킬의 규칙을 Stitch용 문서로 옮긴 것으로 보인다.
- **강한 경고 지점**:
  - "**DEPENDENCY VERIFICATION [MANDATORY]** ... **Never** assume a library exists."
  - "**ANTI-EMOJI POLICY [CRITICAL]** ... Emojis are BANNED."
  - "**Viewport Stability [CRITICAL]:** NEVER use `h-screen`"
  - "**THE LILA BAN**"
  - "**NEVER use React `useState` for magnetic hover or continuous animations.**"
  - "For `staggerChildren`, the Parent and Children **MUST reside in the identical Client Component tree.**"
  - "**Never mix GSAP/ThreeJS with Framer Motion in the same component tree.**"
  - "Any perpetual motion or infinite loop **MUST be memoized (React.memo) and completely isolated**"
  - "You may use `shadcn/ui`, but **NEVER in its generic default state**."
  - "**Do not ask the user to edit this file.**"
- **검증 장치**: §10 사전 비행 체크리스트 7항목. **미학보다 아키텍처·성능 중심**이라는 점이 특징이며(전역 상태, 모바일 붕괴, dvh, useEffect cleanup, 상태 3종, 카드 생략, 애니메이션 격리), 실제로 코드에서 확인 가능한 항목들이다. 다만 실행 가능한 검증(빌드, 린트, 브라우저)은 없다.
