# ui-styling 분석

## 1. 개요

- **원본 경로**: `skills-collections/ui-ux-pro/ui-styling/`
- **핵심 파일**: `SKILL.md` (10,045 bytes)
- **보조 파일** (총 110개 이상)
  - `references/` 7개 (총 2,908줄): `shadcn-components.md`(424), `shadcn-theming.md`(373), `shadcn-accessibility.md`(471), `tailwind-utilities.md`(455), `tailwind-responsive.md`(382), `tailwind-customization.md`(483), **`canvas-design-system.md`(320)**
  - `canvas-fonts/` — **TTF 54개 + OFL 라이선스 파일 다수**, 총 **29개 폰트 계열**: ArsenalSC, BigShoulders, Boldonse, BricolageGrotesque, CrimsonPro, DMMono, EricaOne, GeistMono, Gloock, IBMPlexMono, IBMPlexSerif, InstrumentSans, InstrumentSerif, Italiana, JetBrainsMono, Jura, LibreBaskerville, Lora, NationalPark, NothingYouCouldDo, Outfit, PixelifySans, PoiretOne, RedHatMono, Silkscreen, SmoochSans, Tektur, WorkSans, YoungSerif
  - `scripts/` — `shadcn_add.py`, `tailwind_config_gen.py`, `requirements.txt`, `tests/`(2개 테스트 + coverage)
  - `LICENSE.txt`
- **성격**: **두 개의 이질적 기능이 합쳐진 하이브리드**. (a) **shadcn/ui + Tailwind 실무 구현 레퍼런스** (2,588줄), (b) **캔버스 기반 "미술관급" 비주얼 디자인 철학 시스템** (320줄 + 폰트 54개). 원문도 "Core Stack"을 3층으로 제시 — Component Layer(shadcn) / Styling Layer(Tailwind) / **Visual Design Layer(Canvas)**.

## 2. 활성화 조건 (언제 켜지는가)

frontmatter 원문:
```yaml
name: ui-styling
description: Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications.
argument-hint: "[component or layout]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
```

**§When to Use This Skill (9개)**
- "Building UI with React-based frameworks (Next.js, Vite, Remix, Astro)"
- "Implementing accessible components (dialogs, forms, tables, navigation)"
- "Styling with utility-first CSS approach"
- "Creating responsive, mobile-first layouts"
- "Implementing dark mode and theme customization"
- "Building design systems with consistent tokens"
- "**Generating visual designs, posters, or brand materials**"
- "Rapid prototyping with immediate visual feedback"
- "Adding complex UI patterns (data tables, charts, command palettes)"

→ 7번째 항목이 Canvas 기능을 가리키며, 나머지 8개는 shadcn/Tailwind다.

## 3. 적합한 상황 / 부적합한 상황

**적합 (shadcn/Tailwind 층)**
- React 기반(Next.js / Vite / Remix / Astro)에 shadcn/ui를 도입·구성할 때
- 접근성 있는 컴포넌트 구현 — `shadcn-accessibility.md` 471줄이 ARIA·키보드·포커스·스크린리더를 다룸
- 다크 모드 + 테마 커스터마이즈 — `shadcn-theming.md` 373줄
- Tailwind v4 설정·확장 — `tailwind-customization.md` 483줄 (`@theme` 지시자, 커스텀 유틸리티, 레이어)
- 반응형 — `tailwind-responsive.md` 382줄 (컨테이너 쿼리, max-width 쿼리, 커스텀 브레이크포인트)
- 폼 검증 — react-hook-form + zod 패턴 코드 제공

**적합 (Canvas 층)**
- **포스터·브랜드 자료 등 "미술관급" 비주얼 산출물** — PDF/PNG
- 5개 디자인 무브먼트 중 하나로 시각 철학을 세우고 표현할 때
- 로컬 폰트 54개를 캔버스에 임베드해야 할 때

**부적합 / 과한 상황**
- React가 아닌 스택 — shadcn/ui가 React 전용
- shadcn/ui를 쓰지 않는 프로젝트 — 참조의 대부분이 무용
- Python이 없는 환경 — 유틸리티 스크립트 2개
- **UI 코딩과 포스터 디자인 중 하나만 필요할 때** — 반대쪽 절반이 불필요하게 로드됨 (§8 참조)

**형제 스킬 대신 이걸 고르는 기준**
- 토큰 아키텍처 설계 → `design-system`
- 브랜드 문서 → 토큰 전파 → `brand`
- **토큰 → Tailwind/shadcn 실제 적용 → 이 스킬** (`design-system`이 "With ui-styling: Component tokens → Tailwind config"로 명시)
- 배너 이미지 → `banner-design`
- 포스터·비주얼 아트 → **이 스킬의 Canvas 층** (단 `banner-design`·`design`과 경계가 흐림)

## 4. 외부 의존성

- **API 키**: **불필요.** grep 결과 이 스킬에 API 키 참조가 없다.
- **폴백 모드**: shadcn/ui 없이 Tailwind만 쓰는 경로가 명시됨 — "**Alternative: Tailwind-Only Setup**"
- **필요한 CLI/런타임/패키지**
  - **Node.js + npx** — `npx shadcn@latest init`, `npx shadcn@latest add ...`
  - **React 기반 프레임워크** (Next.js / Vite / Remix / Astro)
  - **Tailwind CSS** — Vite 경로: `npm install -D tailwindcss @tailwindcss/vite`
  - **Python 3** — `shadcn_add.py`, `tailwind_config_gen.py` (`scripts/requirements.txt` 존재)
  - 폼 패턴: **react-hook-form**, **@hookform/resolvers/zod**, **zod**
  - 다크모드: **next-themes** (`shadcn-theming.md`)
  - **로컬 폰트 54개** — `canvas-fonts/` 디렉토리 (OFL 라이선스 포함)
- **네트워크**: npm/npx 설치, `https://ui.shadcn.com/llms.txt` 참조
- **비용 발생 지점**: 없음.

## 5. 워크플로우

### Quick Start — 2가지 경로

**A. Component + Styling Setup (shadcn + Tailwind)**
```bash
npx shadcn@latest init
```
"CLI prompts for framework, TypeScript, paths, and theme preferences. **This configures both shadcn/ui and Tailwind CSS.**"
```bash
npx shadcn@latest add button card dialog form
```

**B. Alternative: Tailwind-Only Setup (Vite)**
```bash
npm install -D tailwindcss @tailwindcss/vite
```
```javascript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```
```css
/* src/index.css */
@import "tailwindcss";
```

### 참조 라우팅 — 7개 파일 (주제별)
SKILL.md가 각 주제마다 "See: `references/...`" + "Covers:" 목록을 제시. 즉 **점진 로딩 구조**.

| 주제 | 파일 | 커버 내용 (원문) |
|---|---|---|
| Component Library | `shadcn-components.md` | "Form & input components (Button, Input, Select, Checkbox, Date Picker, Form validation) / Layout & navigation (Card, Tabs, Accordion, Navigation Menu) / Overlays & dialogs (Dialog, Drawer, Popover, Toast, Command) / Feedback & status (Alert, Progress, Skeleton) / Display components (Table, Data Table, Avatar, Badge)" |
| Theme & Customization | `shadcn-theming.md` | "Dark mode setup with next-themes / CSS variable system / Color customization and palettes / Component variant customization / Theme toggle implementation" |
| Accessibility Patterns | `shadcn-accessibility.md` | "Radix UI accessibility features / Keyboard navigation patterns / Focus management / Screen reader announcements / Form validation accessibility" |
| Tailwind Utilities | `tailwind-utilities.md` | "Layout utilities (Flexbox, Grid, positioning) / Spacing system / Typography / Colors and backgrounds / Borders and shadows / Arbitrary values" |
| Responsive Design | `tailwind-responsive.md` | "Mobile-first approach / Breakpoint system (sm, md, lg, xl, 2xl) / Responsive utility patterns / **Container queries** / **Max-width queries** / Custom breakpoints" |
| Tailwind Customization | `tailwind-customization.md` | "**@theme directive** for custom tokens / Custom colors and fonts / Spacing and breakpoint extensions / Custom utility creation / Custom variants / **Layer organization (@layer base, components, utilities)** / Apply directive" |
| Visual Design System | `canvas-design-system.md` | "Design philosophy approach / Visual communication over text / Systematic patterns / Color, form, and spatial design / Minimal text integration / **Museum-quality execution** / Multi-page design systems" |

### Canvas 워크플로우 — **2단계 (이 스킬 고유)**

**Phase 1: Design Philosophy Creation**
> "Create visual philosophy - aesthetic movement expressed through form, space, color, composition. **Not layouts or templates, but pure visual philosophy.**"

산출물: "Design manifesto emphasizing: Visual expression over text / Spatial communication / Artistic interpretation / Minimal words as visual accent"

**철학 구조 (4-6 단락)**: "Space and form principles / Color and material approach / Scale and rhythm guidance / Composition and balance rules / Visual hierarchy system"

**Phase 2: Visual Expression**
> "Express philosophy through canvas artifacts: **90% visual design / 10% essential text** / Museum-quality execution / Systematic patterns / Sophisticated composition"

→ **미학을 먼저 산문으로 선언하고 그것을 캔버스로 표현하는 2단 구조.** `garden-skills/web-design-engineer`의 "declare the design system before writing code"와 같은 계보이나, 이쪽은 **시각 철학 선언문**이라는 더 추상적 형태.

### 유틸리티 스크립트
```bash
python scripts/shadcn_add.py button card dialog
python scripts/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

**사용자 확인 요구 지점**: **없음.** (`banner-design`/`brand`가 AskUserQuestion을 쓰는 것과 대비)

## 6. 디자인 지침 분석

### Canvas Design System — **이 컬렉션에서 유일하게 미학 철학을 서술하는 부분**

#### Core Principles (4개, 원문)

**1. Visual Communication First**
> "Information lives in design, not paragraphs. Express ideas through: Color zones and fields / Geometric precision / Spatial relationships / Visual weight and tension / Form and structure"

**2. Minimal Text Integration**
> "Text as rare, powerful gesture: **Never paragraphs** / Only essential words / Integrated into visual architecture / **Small labels, huge impact** / Typography as visual element"

**3. Expert Craftsmanship**
> "Work must appear: Meticulously crafted / **Labored over with care** / **Product of countless hours** / **From absolute top of field** / Master-level execution"

**4. Systematic Patterns**
> "Use scientific visual language: Repeating patterns / Perfect shapes / **Dense accumulation of marks** / Layered elements / **Patient repetition rewards sustained viewing**"

#### 5개 디자인 무브먼트 (Philosophy + Expression 쌍) — 원문 전문

**Concrete Poetry**
- Philosophy: "Communication through monumental form and bold geometry."
- Expression: "Massive color blocks / **Sculptural typography (huge words, tiny labels)** / Brutalist spatial divisions / **Polish poster energy meets Le Corbusier** / Ideas through visual weight and spatial tension / Text as rare, powerful gesture"

**Chromatic Language**
- Philosophy: "Color as primary information system."
- Expression: "Geometric precision / Color zones create meaning / Typography minimal - small sans-serif labels / **Josef Albers' interaction meets data visualization** / Information encoded spatially and chromatically / **Words only anchor what color shows**"

**Analog Meditation**
- Philosophy: "Quiet visual contemplation through texture and breathing room."
- Expression: "Paper grain, ink bleeds / Vast negative space / Photography and illustration dominate / **Typography whispered (small, restrained)** / **Japanese photobook aesthetic** / Images breathe across pages / Text appears sparingly - short phrases only"

**Organic Systems**
- Philosophy: "Natural clustering and modular growth patterns."
- Expression: "Rounded forms / Organic arrangements / **Color from nature through architecture** / Information through visual diagrams / Spatial relationships and iconography / Text only for key labels floating in space"

**Geometric Silence**
- Philosophy: "Pure order and restraint."
- Expression: "Grid-based precision / Bold photography or stark graphics / Dramatic negative space / Typography precise but minimal / **Swiss formalism meets Brutalist material honesty** / **Structure communicates, not words** / **Every alignment from countless refinements**"

→ **실명 참조**: Le Corbusier, Josef Albers, Polish poster, Japanese photobook, Swiss formalism, Brutalism. 4개 컬렉션에서 **미술사·건축사 인물과 사조를 직접 인용한 유일한 스킬.**

#### Subtle Reference Integration — **이 스킬의 가장 독특한 지침**
> "Embed conceptual DNA without announcing:
> - Niche reference woven invisibly
> - **Those who know feel it intuitively**
> - Others experience masterful abstract composition
> - **Like jazz musician quoting another song**
> - Sophisticated, never literal
> - Reference enhances depth quietly"

→ **"아는 사람만 알아채는 참조"를 지침으로 삼은 유일한 사례.** 4개 컬렉션 전체에서 미적 깊이를 이런 방식으로 규정한 곳은 없다.

### 강제 규칙 — 수치 인용

**Canvas 컬러 (원문)**
- "Limited colors (**2-5**)"
- "**oklch color space** for precision"
- "Each shade carries meaning"
- 예시 팔레트:
  ```
  --color-primary: oklch(0.55 0.22 264)
  --color-accent:  oklch(0.75 0.18 45)
  --color-neutral: oklch(0.90 0.02 264)
  --color-dark:    oklch(0.25 0.15 264)
  ```
→ **oklch를 실제 값으로 제시한 유일한 스킬** (다른 스킬들은 "oklch를 쓰라"고만 함).

**Canvas 타이포그래피 (원문)**
- "**Thin fonts preferred**: Light weights (**200-300**)"
- "Clean sans-serifs / Geometric precision / Small sizes for labels / Large sizes for impact moments"
- 폰트 통합: "**Search `./canvas-fonts` directory** / Download needed fonts / Bring typography onto canvas / **Part of art, not typeset digitally**"

**Canvas 텍스트 비율**: "**90% visual design / 10% essential text**"

**Canvas 기술 규격 (원문)**
- "Single page default (multi-page when requested)"
- "**PDF or PNG output**"
- "High resolution / Clean margins / Contained composition / Flawless formatting"

**Tailwind 브레이크포인트**: `sm, md, lg, xl, 2xl` (참조 파일에 위임)

**shadcn 예시 코드의 값**: `container mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3`, `text-2xl font-bold`, `space-y-4`, `min-h-screen`, `px-4 py-8`, `text-xl font-semibold`
폼 스키마: `z.string().email()`, `z.string().min(8)`

### 금지 규칙 (anti-pattern) — 원문 그대로

**Canvas Spacing Discipline (원문)**
- "**Nothing falls off page**"
- "**Nothing overlaps**"
- "Every element within canvas boundaries"
- "**Proper margins non-negotiable**"
- "Breathing room and clear separation"
- "**Professional execution mandatory**"

**Canvas Quality Standards — "What to Avoid" (8항목, 원문)**
- Cartoony aesthetics
- Amateur execution
- Text-heavy composition
- Random placement
- Overlapping elements
- Inconsistent spacing
- **Obvious AI generation**
- Lack of refinement

**Minimal Text**: "**Never paragraphs**"

**Best Practices의 함의적 금지**
- "Use Tailwind classes directly; **extract components only for true repetition**"
- "**avoid dynamic class names**" (성능)

→ **금지 목록이 14개 정도로 매우 적다.** taste-skills의 수백 개와 대비되며, 이 컬렉션의 일관된 특징이다.

### Canvas Execution Checklist — **13항목 (원문 전문)**
- [ ] Philosophy guides every decision
- [ ] **90% visual, 10% text maximum**
- [ ] Text minimal and integrated
- [ ] **Nothing overlaps or falls off page**
- [ ] Margins and spacing pristine
- [ ] Composition cohesive with art
- [ ] Appears meticulously crafted
- [ ] Master-level execution evident
- [ ] Sophisticated, never amateur
- [ ] **Could be displayed in museum**
- [ ] **Proves undeniable expertise**
- [ ] Formatting flawless
- [ ] Every detail perfect

### Multi-Page Design Systems (Canvas)
- Approach: "**Treat first page as single page in coffee table book** / Create more pages along same philosophy / Distinctly different but cohesive / Pages tell story tastefully / Full creative freedom"
- Consistency Elements: "Shared color palette / Consistent typography system / Related compositional approach / Visual language continuity / **Philosophical thread throughout**"
- Variation Strategy: "Unique twist per page / Different focal points / Varied spatial arrangements / Complementary patterns / Progressive visual narrative"

### Best Practices (10항목, 원문)
1. "**Component Composition**: Build complex UIs from simple, composable primitives"
2. "**Utility-First Styling**: Use Tailwind classes directly; extract components only for true repetition"
3. "**Mobile-First Responsive**: Start with mobile styles, layer responsive variants"
4. "**Accessibility-First**: Leverage Radix UI primitives, add focus states, use semantic HTML"
5. "**Design Tokens**: Use consistent spacing scale, color palettes, typography system"
6. "**Dark Mode Consistency**: Apply dark variants to all themed elements"
7. "**Performance**: Leverage automatic CSS purging, avoid dynamic class names"
8. "**TypeScript**: Use full type safety for better DX"
9. "**Visual Hierarchy**: Let composition guide attention, use spacing and color intentionally"
10. "**Expert Craftsmanship**: Every detail matters - treat UI as a craft"

### 항목별 지침

- **타이포그래피**: Canvas는 얇은 웨이트(200-300) + 라벨은 작게 + 임팩트는 크게 + 로컬 폰트 54개 임베드. shadcn/Tailwind 층은 `tailwind-utilities.md`(font sizes, weights, alignment, line height)에 위임. **서체 금지 목록 없음**
- **컬러**: Canvas는 2-5색 + oklch 실제 값 4개. shadcn 층은 `shadcn-theming.md`의 CSS 변수 시스템. **팔레트 금지 없음**
- **스페이싱**: Canvas는 "Nothing falls off page / Nothing overlaps / Proper margins non-negotiable". Tailwind 층은 `tailwind-utilities.md`(padding, margin, gap)에 위임. **수치 스케일은 SKILL.md에 없음**
- **모션**: **원문에 지침 거의 없음.** shadcn 예시에 `transition-shadow` 1건. `prefers-reduced-motion`은 **없음**
- **레이아웃**: Tailwind Flexbox/Grid + 반응형(컨테이너 쿼리, max-width 쿼리 포함). Canvas는 5개 무브먼트별 구성 원리
- **접근성**: **이 컬렉션에서 가장 충실.** `shadcn-accessibility.md` **471줄** — "Radix UI accessibility features / Keyboard navigation patterns / Focus management / Screen reader announcements / Form validation accessibility". Best Practices 4번이 "Accessibility-First: Leverage Radix UI primitives, add focus states, use semantic HTML". 다만 **대비 비율 수치는 SKILL.md에 없음**
- **다크 모드**: next-themes + CSS 변수 + "Apply dark variants to **all** themed elements". 예시 코드에 `dark:bg-gray-900`, `dark:bg-gray-800`, `dark:border-gray-700`, `dark:text-white`

### 지침을 주는 방식 자체

1. **3층 스택 선언**: Component(shadcn) / Styling(Tailwind) / **Visual Design(Canvas)**. 각 층의 특성을 4-5개 항목으로.
2. **공식 문서를 최상단에 배치**: "shadcn/ui: https://ui.shadcn.com/**llms.txt**" — LLM용 문서 엔드포인트를 지목. 4개 컬렉션에서 `llms.txt`를 참조한 유일한 사례.
3. **점진 로딩 + Covers 요약**: 각 주제마다 "See: ..." + "Covers:" 목록. 파일을 열기 전에 무엇이 있는지 알 수 있게.
4. **실행 가능한 코드 패턴 제공**: 폼 검증(react-hook-form + zod 완전 코드), 반응형+다크모드 레이아웃. **shadcn 층의 지침이 코드 예시 형태.**
5. **Canvas: 철학 선언 → 표현의 2단**: "Not layouts or templates, but **pure visual philosophy**". 4-6단락 매니페스토를 먼저 작성.
6. **무브먼트를 Philosophy/Expression 쌍으로**: 5개 무브먼트 각각에 한 문장 철학 + 6-7개 표현 요소.
7. **미술사 실명 참조**: Le Corbusier, Josef Albers, Polish poster, Japanese photobook, Swiss formalism, Brutalism. **비유로 방향을 지시** ("Polish poster energy meets Le Corbusier", "Josef Albers' interaction meets data visualization").
8. **"jazz musician quoting another song" 비유**: 참조를 은밀히 심으라는 지침을 음악 비유로.
9. **로컬 폰트 라이브러리 제공**: 54개 TTF + OFL 라이선스. "Search `./canvas-fonts` directory". **4개 컬렉션에서 폰트 바이너리를 함께 배포한 유일한 스킬.**
10. **oklch 실제 값 제시**: 다른 스킬들이 "oklch를 쓰라"고만 하는 데 반해 4개 값을 예시로.
11. **체크리스트 (Canvas 13항목)**: "Could be displayed in museum", "Proves undeniable expertise" 같은 **주관적이지만 방향이 명확한 기준**.
12. **테스트 존재**: `scripts/tests/test_shadcn_add.py`, `test_tailwind_config_gen.py` + coverage. `brand`/`design-system`과 함께 이 컬렉션의 특징.
13. **페르소나 부여 없음**, **다이얼 없음**, **금지 목록 최소.**

### 모호한 감각어의 번역

Canvas 층은 **감각어를 다른 감각어로 설명하는 경향**이 있어, 이 컬렉션의 다른 스킬(수치·규격 중심)과 성격이 다르다.

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**Museum-quality**" | 13항목 체크리스트 ("Could be displayed in museum" 자체가 항목) + 90/10 비율 + 겹침·이탈 금지 + 여백 규율 |
| "**90% visual, 10% text**" | 텍스트 비율을 수치로 — 이 스킬에서 가장 명확한 번역 |
| "**Text as rare, powerful gesture**" | "Never paragraphs / Only essential words / Small labels, huge impact" |
| "**Sculptural typography**" | "huge words, tiny labels" (Concrete Poetry) |
| "**Typography whispered**" | "small, restrained" (Analog Meditation) |
| "**Patient repetition rewards sustained viewing**" | "Repeating patterns / Perfect shapes / Dense accumulation of marks / Layered elements" |
| "**Product of countless hours**" / "**Labored over with care**" | 조작적 정의 없음 — 태도 요구 |
| "**Every alignment from countless refinements**" | 동일 (Geometric Silence) |
| "**Those who know feel it intuitively**" | "Like jazz musician quoting another song" — 참조를 문자 그대로 쓰지 않기 |
| "**Words only anchor what color shows**" | Chromatic Language의 텍스트 역할 |
| "**Structure communicates, not words**" | Geometric Silence의 텍스트 역할 |
| "**Color from nature through architecture**" | Organic Systems의 팔레트 방향 |
| "**Obvious AI generation**" (회피) | 8개 회피 목록 중 하나. 조작적 정의 **없음** |
| "**coffee table book**" (멀티페이지) | 첫 페이지를 책의 한 페이지로 취급, 같은 철학으로 확장 |
| "**Part of art, not typeset digitally**" | 폰트를 캔버스에 임베드 (디지털 조판이 아니라 그림의 일부로) |
| "**Expert Craftsmanship**" (Best Practice 10) | "Every detail matters - treat UI as a craft" |

## 7. 산출물

- **shadcn/Tailwind 층**: React/TSX 컴포넌트 코드, `tailwind.config.js`(스크립트 생성), 설치된 shadcn 컴포넌트
- **Canvas 층**: **PDF 또는 PNG** — "Single page default (multi-page when requested) / High resolution / Clean margins / Contained composition / Flawless formatting". 그 앞에 **디자인 철학 매니페스토 4-6단락**
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음** (양쪽 모두)
- 검증: Canvas 13항목 체크리스트. shadcn/Tailwind 층은 **체크리스트 없음** (Best Practices 10항목이 대신)

## 8. 주의점 / 한계

- **두 기능의 이질성 (가장 큰 구조적 문제)**: shadcn/Tailwind 실무 레퍼런스(2,588줄)와 Canvas 미술 철학(320줄 + 폰트 54개)이 한 스킬에 있다. 접점은 "Visual Design Layer"라는 명명뿐이며, **shadcn 컴포넌트와 Canvas 포스터가 어떻게 연결되는지 원문에 설명이 없다.** UI 코딩만 필요한 사용자에게 Canvas 철학이, 포스터만 필요한 사용자에게 shadcn 카탈로그가 불필요하게 로드된다.
- **Canvas 산출 메커니즘 미명시**: "PDF or PNG output"이라고 하지만 **무엇으로 어떻게 렌더링하는지가 원문에 없다.** HTML → 스크린샷인지, 이미지 생성 도구인지, 다른 도구인지 불명확하다. `banner-design`이 Chrome DevTools 스크린샷 파이프라인을 명시하는 것과 대비된다.
- **`canvas-fonts` 사용법의 모순**: "**Search `./canvas-fonts` directory** / **Download needed fonts**"라고 쓰여 있는데, 폰트가 이미 로컬에 54개 있으므로 "download"가 불필요하다. 그리고 "Bring typography onto canvas"의 구체적 방법(`@font-face`? 이미지 렌더러?)이 없다.
- **Canvas 지침이 감각어에 의존**: "Product of countless hours", "From absolute top of field", "Proves undeniable expertise", "Could be displayed in museum" 같은 항목은 조작적 정의가 없다. 이 컬렉션의 다른 스킬들이 규격·수치·검증 스크립트로 품질을 확보하는 것과 **전략이 정반대**다.
- **모션 지침 부재**: shadcn 예시에 `transition-shadow` 1건이 전부다. `prefers-reduced-motion`이 없고, 컴포넌트 상태 전환·애니메이션 지침이 SKILL.md에 없다.
- **대비 비율 수치 부재**: `shadcn-accessibility.md` 471줄이 접근성을 다루므로 그 안에 있을 가능성이 있으나, SKILL.md 본문에는 WCAG 수치가 없다. Best Practices 4번도 "add focus states, use semantic HTML" 수준.
- **`Inter`를 예시로 사용**: `tailwind_config_gen.py --fonts display:Inter`. 같은 저장소의 `taste-skills` 다수가 Inter를 금지한다 (`brand`·`slides` 분석에서 지적한 동일 문제).
- **컬렉션 내 역할 중복**: 포스터·브랜드 자료 생성이 Canvas 층에 있고, `banner-design`(배너 이미지)·`design`(로고/아이콘/CIP)도 시각 산출물을 만든다. 세 스킬의 경계가 **원문에 정의되지 않았다.**
- **`design-system`과의 연계는 한쪽만 명시**: `design-system`이 "With ui-styling: Component tokens → Tailwind config"라고 밝히지만, **이 스킬의 SKILL.md에는 `design-system`·`brand`에 대한 언급이 전혀 없다.** 단방향 참조.
- **미학 금지 목록의 희박함**: Canvas의 "What to Avoid" 8항목이 전부이며, "Obvious AI generation"의 조작적 정의가 없다. taste-skills의 안티슬롭 카탈로그 같은 방어가 없어, 5개 무브먼트를 따르면서도 진부한 결과가 나올 수 있다.
- **강한 경고 지점**
  - "**Nothing falls off page**" / "**Nothing overlaps**"
  - "**Proper margins non-negotiable**" / "**Professional execution mandatory**"
  - "Text as rare, powerful gesture: **Never paragraphs**"
  - "**90% visual, 10% text maximum**"
  - "Not layouts or templates, but **pure visual philosophy**"
  - "**avoid dynamic class names**" (성능)
- **검증 장치**: Canvas 13항목 체크리스트 + Best Practices 10항목 + **스크립트 단위 테스트 2개 + coverage 리포트**. 실행 검증은 스크립트 테스트뿐이며, 산출물(UI 코드·포스터) 자체를 검증하는 수단은 없다. `design-system`의 토큰 검증기 3개와 비교하면 이 스킬은 검증이 약하다.
