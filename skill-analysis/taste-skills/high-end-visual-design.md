# high-end-visual-design 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/high-end-visual-design/`
- **핵심 파일**: `SKILL.md` (10,561 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **고급 에이전시 미학 처방 + 변량 엔진 + 사전 출력 체크리스트**를 결합한 스타일 스킬. `minimalist-ui`/`industrial-brutalist-ui`가 단일 미학을 고정하는 것과 달리, 이 스킬은 **3개 vibe × 3개 layout = 9개 조합**에서 하나를 고르게 하고 그 위에 공통 기법(Double-Bezel, Button-in-Button, 모션 물리)을 강제한다.

원문 자기 규정: "**Objective:** You engineer **$150k+ agency-level** digital experiences, not just websites. Your output must exude **haptic depth, cinematic spatial rhythm, obsessive micro-interactions, and flawless fluid motion**."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Teaches the AI to design like a high-end agency. Defines the exact fonts, spacing, shadows, card structures, and animations that make a website feel expensive. Blocks all the common defaults that make AI designs look cheap or generic."

**해석**: "Use when…" 트리거 문구가 **없다.** 대신 스킬의 목적("design like a high-end agency")과 방법("Defines the exact… / Blocks all the common defaults")을 서술한다.

**매칭될 것으로 보이는 사용자 발화**
- "비싸 보이게 만들어줘", "고급스럽게"
- "에이전시 급 랜딩 페이지"
- "Apple / Linear 같은 느낌으로" — 본문이 "Apple-esque / Linear-tier"를 기준선으로 명시
- "AI 티 안 나게", "템플릿 같지 않게"

**description의 특징**: **"feel expensive"와 "look cheap or generic"이라는 두 감각어를 축으로** 스킬을 정의한다. 이 컬렉션에서 가장 직접적으로 "비싸 보임"을 목표로 선언한 스킬.

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **마케팅 랜딩 페이지 / 에이전시 사이트 / 제품 소개** — 매크로 여백, 거대 타이포, 스크롤 진입 모션이 전부 이 용도
- SaaS / AI / Tech 제품 소개 → Vibe A (Ethereal Glass)
- 라이프스타일 / 부동산 / 에이전시 → Vibe B (Editorial Luxury)
- 소비자 / 헬스 / 포트폴리오 → Vibe C (Soft Structuralism)
- Tailwind + React 스택 (지침 전체가 Tailwind 클래스로 작성)
- **모바일 대응이 필요할 때** — 이 컬렉션 스타일 스킬 중 **유일하게 반응형 규칙이 명시**됨 (§3의 Mobile Collapse + Universal Override)
- **성능을 신경 써야 할 때** — §6 Performance Guardrails가 이 컬렉션에서 유일

**부적합 / 과한 상황**
- 정보 밀도가 높은 기능성 UI (대시보드, 관리 도구) — `py-24`~`py-40` 여백, Double-Bezel 이중 컨테이너, 모든 요소에 스크롤 진입 애니메이션은 밀도와 상충
- 브랜드 팔레트가 확정된 프로젝트 — Vibe별 색이 고정값 (`#050505`, `#FDFBF7` 등)
- Tailwind를 쓰지 않는 스택 — 지침 대부분이 Tailwind 유틸리티 클래스 (`ring-1 ring-black/5`, `rounded-[calc(2rem-0.375rem)]`, `backdrop-blur-2xl`)
- 접근성 요구가 높은 제품 — `prefers-reduced-motion`이 **없고** 모든 요소에 진입 애니메이션을 요구
- 미니멀·브루탈리즘 미학 → `minimalist-ui` / `industrial-brutalist-ui`

**형제 스킬 대신 이걸 고르는 기준**: 이 컬렉션의 스타일 스킬 4개 비교 —
- `minimalist-ui`: 조용한 문서형, 라이트 고정, 파스텔, 모션 최소
- `industrial-brutalist-ui`: 기계적, radius 0, 흑백+빨강, 모션 없음
- `gpt-taste`: 모션 중심(GSAP 필수), AIDA 구조, 랜덤화
- **`high-end-visual-design`**: **haptic depth(이중 베젤 물성) + 반응형 + 성능 가드레일**. 3개 vibe로 톤을 조절 가능하며, **유일하게 모바일·성능·체크리스트를 갖춤**

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 해당 없음. 이미지 플레이스홀더 지침도 **원문에 없음**.
- **필요한 CLI/런타임/패키지**
  - **Tailwind CSS** — 필수 수준. 임의값 문법(`rounded-[2rem]`, `text-[10px]`, `tracking-[0.2em]`, `shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`, `ease-[cubic-bezier(0.32,0.72,0,1)]`, `min-h-[100dvh]`)에 깊이 결합
  - **React** — "Deliver flawless, pixel-perfect **React**/Tailwind/HTML code"
  - **폰트** (모두 유료 또는 특정 플랫폼): **`Geist`**(Vercel, 무료), **`Clash Display`**(Fontshare, 무료), **`PP Editorial New`**(Pangram Pangram, **상업 유료**), **`Plus Jakarta Sans`**(Google, 무료). 원문은 "Assume premium fonts ... are available"라고 전제
  - **아이콘**: **Phosphor Light**, **Remix Line** (ultra-light 스트로크)
  - **`IntersectionObserver`** 또는 **Framer Motion** (`whileInView`) — 스크롤 진입 애니메이션
- **네트워크**: 폰트 로딩
- **비용 발생 지점**: 유료 API 없음. **`PP Editorial New`는 상업 라이선스 폰트**이며 원문에 라이선스 언급이 없다.

## 5. 워크플로우

### Execution Protocol (§7) — 5단계 고정 순서
"When generating UI code, follow this **exact sequence**:"

1. **[SILENT THOUGHT]** — "Roll the Variance Engine (Section 3). Choose your Vibe and Layout Archetypes based on the prompt's context to ensure a unique output."
2. **[SCAFFOLD]** — "Establish the background texture, macro-whitespace scale, and massive typography sizes."
3. **[ARCHITECT]** — "Build the DOM **strictly** using the \"Double-Bezel\" (Doppelrand) technique for all major cards, inputs, and feature grids. Use exaggerated squircle radii (`rounded-[2rem]`)."
4. **[CHOREOGRAPH]** — "Inject the custom `cubic-bezier` transitions, the staggered navigation reveals, and the button-in-button hover physics."
5. **[OUTPUT]** — "Deliver flawless, pixel-perfect React/Tailwind/HTML code. **Do not include basic, generic fallbacks.**"

**순서의 논리**: 변량 선택(1) → 거시 구조(2) → 컨테이너 물성(3) → 모션(4) → 출력(5). 1단계의 선택이 2~4단계의 값을 결정하는 **구속 구조**.

### 게이트 — The Creative Variance Engine (§3)
"**Before writing code**, silently \"roll the dice\" and select ONE combination from the following archetypes based on the prompt's context"

**A. Vibe & Texture Archetypes (Pick 1)**

| # | 이름 (용도) | 규정 |
|---|---|---|
| 1 | **Ethereal Glass** (SaaS / AI / Tech) | "Deepest OLED black (**`#050505`**), radial mesh gradients (e.g., subtle glowing purple/emerald orbs) in the background. **Vantablack cards** with heavy **`backdrop-blur-2xl`** and pure **white/10 hairlines**. Wide geometric Grotesk typography." |
| 2 | **Editorial Luxury** (Lifestyle / Real Estate / Agency) | "Warm creams (**`#FDFBF7`**), muted sage, or deep espresso tones. **High-contrast Variable Serif** fonts for massive headings. Subtle CSS noise/film-grain overlay (**`opacity-[0.03]`**) for a physical paper feel." |
| 3 | **Soft Structuralism** (Consumer / Health / Portfolio) | "Silver-grey or completely white backgrounds. **Massive bold Grotesk** typography. Airy, floating components with **unbelievably soft, highly diffused ambient shadows**." |

**B. Layout Archetypes (Pick 1)** — 각각에 **Mobile Collapse 규칙이 붙어 있음**

| # | 이름 | 데스크톱 | Mobile Collapse |
|---|---|---|---|
| 1 | **The Asymmetrical Bento** | "masonry-like CSS Grid of varying card sizes (e.g., `col-span-8 row-span-2` next to stacked `col-span-4` cards)" | "single-column stack (`grid-cols-1`) with generous vertical gaps (`gap-6`). **All `col-span` overrides reset to `col-span-1`.**" |
| 2 | **The Z-Axis Cascade** | "Elements are stacked like physical cards, slightly overlapping ... some with a subtle **`-2deg`** or **`3deg`** rotation to break the digital grid" | "**Remove all rotations and negative-margin overlaps below `768px`.** ... **Overlapping elements cause touch-target conflicts on mobile.**" |
| 3 | **The Editorial Split** | "Massive typography on the left half (`w-1/2`), with interactive, scrollable horizontal image pills or staggered interactive cards on the right" | "Converts to a full-width vertical stack (`w-full`). Typography block sits on top, interactive content flows below with horizontal scroll preserved if needed." |

**Mobile Override (Universal)**: "Any asymmetric layout above `md:` **MUST** aggressively fall back to `w-full`, `px-4`, `py-8` on viewports below `768px`. **Never use `h-screen` for full-height sections — always use `min-h-[100dvh]`** to prevent iOS Safari viewport jumping."

### 최종 게이트 — Pre-Output Checklist (§8)
"Evaluate your code against this matrix before delivering. **This is the last filter.**" (11항목, 아래 §6 참조)

**사용자 확인 요구 지점**: **없음.** 변량 선택은 "[SILENT THOUGHT]"로 내부 처리되고, 체크리스트도 자기 검증이다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

§2 "THE \"ABSOLUTE ZERO\" DIRECTIVE (STRICT ANTI-PATTERNS)"
"If your generated code includes **ANY** of the following, **the design instantly fails**:"

- "**Banned Fonts:** Inter, Roboto, Arial, Open Sans, Helvetica."
- "**Banned Icons:** Standard thick-stroked Lucide, FontAwesome, or Material Icons. Use only ultra-light, precise lines (e.g., Phosphor Light, Remix Line)."
- "**Banned Borders & Shadows:** Generic 1px solid gray borders. Harsh, dark drop shadows (`shadow-md`, `rgba(0,0,0,0.3)`)."
- "**Banned Layouts:** Edge-to-edge sticky navbars glued to the top. Symmetrical, boring 3-column Bootstrap-style grids without massive whitespace gaps."
- "**Banned Motion:** Standard `linear` or `ease-in-out` transitions. Instant state changes without interpolation."

본문의 추가 금지:
- "**NEVER generate the exact same layout or aesthetic twice in a row.**" (The Variance Mandate)
- "**Never place a premium card, image, or container flatly on the background.**" (§4A)
- 버튼 화살표: "It **NEVER sits naked** next to the text." (§4B)
- "**Never use default transitions.**" (§5)
- 햄버거: "must fluidly rotate and translate to form a perfect 'X' ... **not just disappear**" (§5A)
- 내비 링크: "**do not just appear**" (§5A)
- 호버: "**do not just change the background color**" (§5B)
- "Elements **never appear statically on load**." (§5C)
- "**Never use `window.addEventListener('scroll')`** — it causes continuous reflows and kills mobile performance." (§5C)
- "**Never animate `top`, `left`, `width`, or `height`.**" (§6)
- "Use `will-change: transform` **sparingly** and only on elements that are actively animating." (§6)
- "**Never apply blur filters to scrolling containers or large content areas** — this causes continuous GPU repaints and severe mobile frame drops." (§6)
- "**Never attach them [noise overlays] to scrolling containers.**" (§6)
- "**Do not use arbitrary `z-50` or `z-[9999]`.**" (§6)
- "**Never use `h-screen`** for full-height sections" (§3)
- "**Remove all rotations and negative-margin overlaps below `768px`.**" (§3B2)
- "**Do not include basic, generic fallbacks.**" (§7-5)

### 강제 규칙 — 수치 인용

**Double-Bezel (Doppelrand / Nested Architecture) — §4A, 이 스킬의 서명 기법**
"They must look like **physical, machined hardware (like a glass plate sitting in an aluminum tray)** using nested enclosures."
- **Outer Shell**: 배경 `bg-black/5` 또는 `bg-white/5`, hairline 테두리 `ring-1 ring-black/5` 또는 `border border-white/10`, 패딩 **`p-1.5`** 또는 **`p-2`**, 라운드 **`rounded-[2rem]`**
- **Inner Core**: 자체 배경색, 내부 하이라이트 **`shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`**, 그리고 **수학적으로 계산된 작은 라운드** — **`rounded-[calc(2rem-0.375rem)]`** ("for concentric curves")

→ `2rem - 0.375rem`은 outer radius에서 outer padding(`p-1.5` = 0.375rem)을 뺀 값. **동심원 곡률을 수식으로 강제**한 것이 이 지침의 핵심.

**Nested CTA & "Island" Button — §4B**
- "Primary interactive buttons must be **fully rounded pills (`rounded-full`)** with generous padding (**`px-6 py-3`**)."
- Trailing icon: "nested inside its own distinct circular wrapper (e.g., **`w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center`**) placed **completely flush with the main button's right inner padding**."

**Spatial Rhythm — §4C**
- "**Macro-Whitespace:** Double your standard padding. Use **`py-24` to `py-40`** for sections."
- "**Eyebrow Tags:** Precede major H1/H2s with a microscopic, pill-shaped badge (**`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium`**)."

**모션 — §5**
- 기본 곡선: **`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]`**
- Fluid Island Nav (닫힌 상태): **`mt-6`, `mx-auto`, `w-max`, `rounded-full`** (플로팅 글래스 필)
- 햄버거 모프: **`rotate-45`** 와 **`-rotate-45`** + absolute positioning
- 모달 확장: **`backdrop-blur-3xl bg-black/80`** 또는 **`bg-white/80`**
- Staggered Mask Reveal: **`translate-y-12 opacity-0`** → **`translate-y-0 opacity-100`**, 딜레이 **`delay-100`, `delay-150`, `delay-200`**
- Magnetic Button Hover: 버튼 전체 **`active:scale-[0.98]`**, 내부 아이콘 원 **`group-hover:translate-x-1 group-hover:-translate-y-[1px]`** + **`scale-105`**
- Scroll Entry: **`translate-y-16 blur-md opacity-0`** → **`translate-y-0 blur-0 opacity-100`** over **`800ms+`**

**성능 가드레일 — §6**
- "Animate **exclusively** via `transform` and `opacity`"
- `backdrop-blur`: "only to **fixed or sticky** elements (navbars, overlays)"
- 노이즈: "exclusively to **fixed, `pointer-events-none`** pseudo-elements (**`position: fixed; inset: 0; z-index: 50`**)"
- z-index: "Reserve z-indexes strictly for **systemic layers**: sticky nav, modals, overlays, tooltips"

**반응형 — §3**
- 브레이크포인트: **`768px`** (`md:`)
- 모바일 폴백: **`w-full`, `px-4`, `py-8`**
- 전체 높이: **`min-h-[100dvh]`** (`h-screen` 금지)
- Bento 모바일: `grid-cols-1` + `gap-6`, 모든 `col-span` → `col-span-1`

**Vibe별 색·효과 값**
- Ethereal Glass: `#050505`, `backdrop-blur-2xl`, `white/10` hairlines
- Editorial Luxury: `#FDFBF7`, noise/grain `opacity-[0.03]`
- Soft Structuralism: silver-grey 또는 순백

**Z-Axis 회전값**: **`-2deg`** 또는 **`3deg`**

### 항목별 지침

**타이포그래피**
- 금지 5서체: Inter, Roboto, Arial, Open Sans, Helvetica
- 권장 4서체: `Geist`, `Clash Display`, `PP Editorial New`, `Plus Jakarta Sans`
- Vibe별 서체 성격: Ethereal Glass = "Wide geometric Grotesk" / Editorial Luxury = "High-contrast Variable Serif" / Soft Structuralism = "Massive bold Grotesk"
- Eyebrow tag: `text-[10px] uppercase tracking-[0.2em] font-medium`
- "massive typography sizes" (§7-2) — 구체적 scale 값은 **원문에 명시 없음**
- line-height 지침 **없음** (`minimalist-ui`/`industrial-brutalist-ui`가 명시하는 것과 대비)

**컬러**
- Vibe별 배경 고정값 3개 (`#050505` / `#FDFBF7` / silver-grey·white)
- 투명도 기반 표면: `bg-black/5`, `bg-white/5`, `white/10`, `bg-black/80`, `bg-white/80`
- 액센트: Ethereal Glass에 "subtle glowing purple/emerald orbs" (mesh gradient)
- Editorial Luxury에 "muted sage, or deep espresso tones"
- **팔레트 체계(primary/secondary/neutral 등)나 hex 목록은 원문에 없음** — Vibe 서술로 대체
- 대비 비율(WCAG) 수치는 **원문에 명시 없음**

**스페이싱**
- 섹션: `py-24`~`py-40` ("Double your standard padding")
- Double-Bezel outer padding: `p-1.5` / `p-2`
- 버튼: `px-6 py-3`
- Eyebrow: `px-3 py-1`
- 모바일: `px-4 py-8`, `gap-6`
- spacing scale 체계 선언은 **원문에 없음** (Tailwind 기본 스케일 전제)

**모션** — 이 컬렉션 스타일 스킬 중 **가장 구체적**
- 단일 기본 곡선 `cubic-bezier(0.32,0.72,0,1)` + `duration-700`
- 4개 모션 패턴 (Fluid Island Nav / 햄버거 모프 / Staggered Mask Reveal / Magnetic Button Hover / Scroll Interpolation)
- 각각의 시작·종료 상태와 딜레이 수치 명시
- `prefers-reduced-motion`은 **원문에 언급 없음**

**레이아웃**
- 3개 layout archetype + 각각의 모바일 붕괴 규칙
- Double-Bezel 이중 컨테이너 (모든 주요 카드·입력·기능 그리드에 강제)
- 라운드: `rounded-[2rem]` (squircle), inner은 `calc()` 계산
- 플로팅 내비 (`mt-6` 분리) — 상단 밀착 sticky navbar 금지
- Z-Axis 회전 `-2deg`/`3deg`

**접근성**
- **명시적 지침 없음.** `prefers-reduced-motion` / 포커스 상태 / 키보드 내비게이션 / alt / ARIA / 대비 비율 모두 **원문에 없음.**
- 유일한 근접 항목: Z-Axis 모바일 붕괴 근거가 "**Overlapping elements cause touch-target conflicts on mobile**" — 터치 타깃 충돌을 인지한 지점. 다만 44px 같은 수치는 없음.
- 모든 요소에 스크롤 진입 애니메이션(`800ms+`)을 요구하면서 감소 모션 대응이 없는 것이 가장 큰 공백.

### 지침을 주는 방식 자체

1. **페르소나 코드네임 부여**: "**Persona:** `Vanguard_UI_Architect`" — 이 컬렉션에서 유일하게 페르소나에 식별자 형식의 이름을 붙였다.
2. **금액으로 기준선 설정**: "**$150k+ agency-level**" / 체크리스트 마지막 항목 "reads as \"**$150k agency build**\", not \"**template with nice fonts**\"". 품질을 **가격표로 번역**한 특이한 방식.
3. **변량 명령 (The Variance Mandate)**: "NEVER generate the exact same layout or aesthetic twice in a row." + 3×3 아키타입 조합. `gpt-taste`의 "Python 랜덤화"와 같은 문제의식이지만 **더 단순한 해법**(아키타입 카탈로그 + "roll the dice")을 택했다.
4. **아키타입에 용도를 명시**: Vibe 1/2/3에 각각 "(SaaS / AI / Tech)", "(Lifestyle / Real Estate / Agency)", "(Consumer / Health / Portfolio)"를 붙여 **선택을 맥락에 연동**.
5. **실패 조건을 즉각적으로 선언**: "If your generated code includes **ANY** of the following, **the design instantly fails**." — 조건부 예외 없음.
6. **물리적 비유로 기법을 설명**: Double-Bezel = "like a **glass plate sitting in an aluminum tray**", "physical, machined hardware". 추상적 기법을 촉각적 이미지로 전달.
7. **수학적 관계를 강제**: `rounded-[calc(2rem-0.375rem)]` — 동심원 곡률을 계산식으로. 이 컬렉션에서 유일하게 **수식으로 표현된 디자인 규칙**.
8. **모션에 물리 은유**: "All motion must **simulate real-world mass and spring physics**", "creating **internal kinetic tension**", "**Magnetic** Button Hover Physics".
9. **각 layout에 모바일 붕괴 규칙 부착 + 근거 제시**: 단순히 "반응형으로"가 아니라 archetype별 구체적 폴백 + 이유("Overlapping elements cause touch-target conflicts"). **이 컬렉션 스타일 스킬 중 유일**.
10. **성능 가드레일 별도 섹션 (§6)**: GPU 안전 애니메이션 / blur 제약 / 노이즈 제약 / z-index 규율. 각각에 **왜 안 되는지**를 명시 ("causes continuous GPU repaints and severe mobile frame drops", "causes continuous reflows and kills mobile performance"). **이 컬렉션 스타일 스킬 중 유일**.
11. **사전 출력 체크리스트 (§8, 11항목)**: "This is the last filter." **이 컬렉션 스타일 스킬 중 유일하게 검증 장치를 갖춤** (`gpt-taste`의 `<design_plan>`은 사전 계획, 이쪽은 사후 검증).
12. **참조 대상**: "**Apple-esque / Linear-tier**" (기준선), "**Awwwards-Tier**" (제목). 브랜드 2개 + 어워드 사이트.
13. **실행 순서에 라벨 부여**: `[SILENT THOUGHT]` / `[SCAFFOLD]` / `[ARCHITECT]` / `[CHOREOGRAPH]` / `[OUTPUT]`.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**feel expensive**" (description) | 금지 5서체 회피 + Double-Bezel 이중 컨테이너 + `py-24~py-40` + `cubic-bezier(0.32,0.72,0,1)` + 800ms 진입 모션 + ultra-light 아이콘 |
| "**cheap or generic**" (회피 대상) | Inter/Roboto/Arial/Open Sans/Helvetica + Lucide/FontAwesome/Material + 1px solid gray + `shadow-md` + 상단 밀착 sticky navbar + 3열 Bootstrap 그리드 + `linear`/`ease-in-out` |
| "**$150k+ agency-level**" vs "**template with nice fonts**" | 체크리스트 11항목 전체 통과 |
| "**haptic depth**" | Double-Bezel — outer shell(`p-1.5` + hairline) + inner core(inset highlight + `calc()` 동심 라운드) |
| "**cinematic spatial rhythm**" | `py-24`~`py-40` 섹션 패딩 ("Double your standard padding") |
| "**obsessive micro-interactions**" | Button-in-Button trailing icon + `active:scale-[0.98]` + 내부 아이콘 `translate-x-1 -translate-y-[1px] scale-105` |
| "**flawless fluid motion**" | 커스텀 cubic-bezier + `duration-700` + 햄버거 모프 + staggered reveal |
| "**physical, machined hardware**" | "glass plate sitting in an aluminum tray" = 이중 베젤 구조 |
| "**concentric curves**" | `rounded-[calc(2rem-0.375rem)]` — outer radius − outer padding |
| "**internal kinetic tension**" | 버튼은 축소(`0.98`), 내부 아이콘은 대각 이동 + 확대(`105`) — **반대 방향 운동의 동시 발생** |
| "**simulate real-world mass and spring physics**" | `cubic-bezier(0.32,0.72,0,1)` (iOS drawer 계열 곡선) |
| "**breathe heavily**" | 체크리스트: "Section padding is at minimum `py-24`" |
| "**Deepest OLED black**" | `#050505` |
| "**Vantablack cards**" | `backdrop-blur-2xl` + `white/10` hairlines on `#050505` |
| "**physical paper feel**" | CSS noise/film-grain `opacity-[0.03]` |
| "**unbelievably soft, highly diffused ambient shadows**" | 구체값 **원문에 명시 없음** (Soft Structuralism의 유일한 미지정 항목) |
| "**break the digital grid**" | `-2deg` / `3deg` 회전 |
| "**microscopic**" (eyebrow) | `text-[10px]` + `tracking-[0.2em]` |

## 7. 산출물

- **형식**: "flawless, pixel-perfect **React/Tailwind/HTML** code"
- **출력 순서**: §7의 5단계. 1단계는 "[SILENT THOUGHT]"로 **출력하지 않음** (`gpt-taste`가 `<design_plan>`을 명시적으로 출력하게 하는 것과 대비).
- **완결성 요구**: "**Do not include basic, generic fallbacks.**"
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**

### Pre-Output Checklist (§8) — 11항목 전문
- [ ] No banned fonts, icons, borders, shadows, layouts, or motion patterns from Section 2 are present
- [ ] A Vibe Archetype and Layout Archetype from Section 3 were consciously selected and applied
- [ ] All major cards and containers use the Double-Bezel nested architecture (outer shell + inner core)
- [ ] CTA buttons use the Button-in-Button trailing icon pattern where applicable
- [ ] Section padding is at minimum `py-24` — the layout breathes heavily
- [ ] All transitions use custom cubic-bezier curves — no `linear` or `ease-in-out`
- [ ] Scroll entry animations are present — no element appears statically
- [ ] Layout collapses gracefully below `768px` to single-column with `w-full` and `px-4`
- [ ] All animations use only `transform` and `opacity` — no layout-triggering properties
- [ ] `backdrop-blur` is only applied to fixed/sticky elements, never to scrolling content
- [ ] The overall impression reads as "$150k agency build", not "template with nice fonts"

## 8. 주의점 / 한계

- **접근성 지침 부재 + 필수 모션의 조합**: "Scroll entry animations are present — **no element appears statically**"가 체크리스트 항목인데 `prefers-reduced-motion` 대응이 **원문에 전혀 없다.** 800ms 페이드업 + blur를 모든 요소에 적용하면 감소 모션 사용자에게 문제가 된다. 성능은 챘기면서 접근성은 놓친 비대칭.
- **`ease-in-out` 금지의 과잉**: §2가 `linear`와 `ease-in-out`을 "Banned Motion"으로 분류한다. 그런데 화면 위에서 A→B로 이동하는 모션에는 `ease-in-out`이 표준 선택이다 (`emilkowalski` 컬렉션은 "Moving / morphing on screen → `ease-in-out`"을 명시적으로 권한다). **이 금지는 근거 없이 과도하며, 원문에 예외가 없다.**
- **모션 곡선 단일화**: `cubic-bezier(0.32,0.72,0,1)` 하나로 모든 상황을 처리한다. 진입/이탈/이동/호버의 구분이 **원문에 없다.** (참고: 이 값은 `emilkowalski` 컬렉션의 `--ease-drawer`와 동일한 iOS drawer 곡선이다.)
- **`duration-700` / `800ms+`의 상한 부재**: UI 모션 시간에 상한이 없다. `emilkowalski` 계열의 "UI animations stay under 300ms"와 정면 충돌하지만, 적용 대상(마케팅 페이지 vs 제품 UI)이 달라 직접 모순은 아니다 — 다만 이 스킬이 그 구분을 하지 않는다.
- **상업 폰트 라이선스**: **`PP Editorial New`**가 Pangram Pangram의 유료 폰트다. 원문은 "Assume premium fonts like … are available"라고 전제하며 **라이선스·조달 방법을 다루지 않는다.**
- **Tailwind 임의값 문법 의존**: `rounded-[calc(2rem-0.375rem)]`, `shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`, `ease-[cubic-bezier(0.32,0.72,0,1)]` 등은 Tailwind JIT 임의값 문법이다. Tailwind가 아닌 스택에서는 전부 수동 변환이 필요하며 **원문에 대응이 없다.**
- **Double-Bezel의 범용 강제**: "**All** major cards and containers"에 이중 컨테이너를 요구한다. DOM 깊이가 배로 늘고, 정보 밀도가 높은 화면에서는 공간 낭비가 된다. 예외 조건이 **원문에 없다.**
- **`z-index: 50` 하드코딩의 자기모순**: §6이 "Do not use arbitrary `z-50` or `z-[9999]`"라고 금지하면서, 같은 섹션의 노이즈 오버레이 지침에 "`z-index: 50`"을 명시한다. **원문 내 모순.**
- **컬러 지침의 상대적 얕음**: Vibe별 배경 hex 3개와 투명도 표면만 있고, 텍스트 색 계층·시맨틱 색·팔레트 체계가 **원문에 없다.** `minimalist-ui`(3단 monochrome + 4쌍 파스텔)나 `industrial-brutalist-ui`(기판별 3색)보다 컬러 처방이 느슨하다.
- **컬렉션 내 스타일 충돌**: `minimalist-ui`는 "DO NOT use gradients"·"DO NOT use `rounded-full` for large containers... primary buttons"인데, 이 스킬은 mesh gradient를 Vibe 1의 핵심으로 쓰고 "Primary interactive buttons **must be** fully rounded pills (`rounded-full`)"를 강제한다. `industrial-brutalist-ui`는 "Absolute rejection of `border-radius`"인데 이쪽은 `rounded-[2rem]`을 요구한다. **description에 트리거와 배타성 안내가 없어 동시 활성화 시 모순.**
- **`Inter` 판정의 컬렉션 내 불일치**: 이 스킬과 `minimalist-ui`, `gpt-taste`는 Inter를 금지하는데 `industrial-brutalist-ui`는 Macro 폰트로 허용한다.
- **강한 경고 지점**:
  - "If your generated code includes ANY of the following, **the design instantly fails**."
  - "**NEVER generate the exact same layout or aesthetic twice in a row.**"
  - "**Never place a premium card, image, or container flatly on the background.**"
  - "It **NEVER sits naked** next to the text."
  - "**Never use default transitions.**"
  - "**Never use `window.addEventListener('scroll')`**"
  - "**Never animate `top`, `left`, `width`, or `height`.**"
  - "**Never apply blur filters to scrolling containers**"
  - "**Never use `h-screen`** ... always `min-h-[100dvh]`"
  - "**Do not include basic, generic fallbacks.**"
  - "This is the last filter." (체크리스트)
- **검증 장치 (이 컬렉션 스타일 스킬 중 최고)**: 11항목 사전 출력 체크리스트 + 5단계 실행 프로토콜 + archetype별 모바일 붕괴 규칙 + 성능 가드레일. 다만 **전부 자기 선언**이며 실행 가능한 검증(빌드, 브라우저 확인, 린트)은 없다. garden-skills의 `tsc --noEmit`/browser-acceptance와 비교하면 여전히 판독 검증 수준.
