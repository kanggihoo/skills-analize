# redesign-existing-projects 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/redesign-existing-projects/`
- **핵심 파일**: `SKILL.md` (15,060 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **기존 프로젝트 감사 + 수리 스킬**. 새로 만드는 것이 아니라 이미 있는 웹사이트/앱을 진단하고 고친다. 이 컬렉션에서 유일하게 **기존 코드베이스를 대상**으로 하며, 문서의 대부분이 **10개 카테고리 × 총 100여 개 증상→처방 목록**이다.

원문 자기 규정: "Audits current design, identifies generic AI patterns, and applies high-end design standards **without breaking functionality**. Works with any CSS framework or vanilla CSS."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS."

**매칭되는 사용자 발화**
- "이 사이트 좀 개선해줘", "디자인 업그레이드"
- "AI로 만든 티 나는 부분 고쳐줘"
- "우리 앱 좀 고급스럽게"
- "디자인 감사해줘"

**특징**: "Use when…" 문구는 없으나 `Upgrades existing` / `Audits current design`이 대상(기존 프로젝트)을 명확히 지시한다. 이 컬렉션의 스타일 스킬들과 **역할이 명확히 분리**된다 (그쪽은 신규 생성, 이쪽은 기존 개선).

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 이미 동작하는 사이트/앱의 시각 품질을 올려야 할 때
- AI로 생성한 결과물의 "AI 티"를 제거해야 할 때 — "identifies **generic AI patterns**"
- 프레임워크를 바꿀 수 없는 상황 — "**Works with any CSS framework or vanilla CSS**" + "Do not migrate frameworks or styling libraries"
- 리스크를 통제하며 점진 개선하고 싶을 때 — Fix Priority가 "maximum visual impact with **minimum risk**" 순으로 정렬됨
- 체크리스트가 필요할 때 — 10개 카테고리의 감사 목록이 그대로 점검표로 쓰인다
- **접근성·콘텐츠·코드 품질까지 포함한 종합 점검** — 이 컬렉션에서 접근성 항목이 가장 많다

**부적합 / 과한 상황**
- 신규 프로젝트 → `high-end-visual-design` / `minimalist-ui` / `design-taste-frontend`
- 전면 재설계가 필요한 경우 — "**Do not rewrite from scratch. Improve what's there.**"
- 특정 미학으로 통일하고 싶을 때 — 이 스킬은 단일 미학을 강제하지 않고 **일반적 품질 기준**만 적용 (다만 금지 목록은 특정 취향을 반영)
- 브랜드 아이덴티티 재정의 → `brandkit`

**형제 스킬 대신 이걸 고르는 기준**: 대상이 **이미 존재하는 코드**인가. 이 컬렉션에서 유일한 "기존 개선" 스킬이므로 경쟁이 없다. `garden-skills/web-design-engineer`의 `redesign-protocol.md`(Extension / Preserve / Overhaul 3분류)가 가장 유사한 기능이며, 그쪽은 변경 모드 분류에, 이쪽은 증상 카탈로그에 강점이 있다.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 스택별 분기가 폴백처럼 작동 — "If the project has **no framework, use vanilla CSS**." 이미지 자산 부재 시 `picsum.photos` 사용.
- **필요한 CLI/런타임/패키지**
  - 기존 프로젝트의 스택을 그대로 사용 (Tailwind / vanilla CSS / styled-components 등)
  - **`package.json` 확인 필수** — "Before importing any new library, **check the project's dependency file first**" + "**Import hallucinations.** Check that every import actually exists in `package.json`"
  - **Tailwind 버전 확인 필수** — "If the project uses Tailwind, **check the version (v3 vs v4)** before modifying config"
  - 권장 폰트: `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`
  - 권장 아이콘: Phosphor, Heroicons, 또는 커스텀 세트
  - 이미지 플레이스홀더: `https://picsum.photos/seed/{name}/1920/1080`
- **네트워크**: 폰트·이미지 로딩
- **비용 발생 지점**: 없음.

## 5. 워크플로우

### How This Works — 3단계
"When applied to an existing project, follow this sequence:"

1. **Scan** — "Read the codebase. Identify the **framework, styling method** (Tailwind, vanilla CSS, styled-components, etc.), and **current design patterns**."
2. **Diagnose** — "Run through the audit below. **List every generic pattern, weak point, and missing state you find.**"
3. **Fix** — "Apply targeted upgrades **working with the existing stack**. **Do not rewrite from scratch. Improve what's there.**"

→ 1단계의 스택 파악이 3단계의 수정 방식을 제약한다. 2단계는 목록화이며, 즉시 수정하지 않고 **먼저 전부 나열**하도록 요구한다.

### Design Audit — 10개 카테고리
Typography / Color and Surfaces / Layout / Interactivity and States / Content / Component Patterns / Iconography / Code Quality / Strategic Omissions

각 항목이 **"증상 (굵게) — 처방"** 형식으로 작성됨. 예:
> "**Pure `#000000` background.** Replace with off-black, dark charcoal, or tinted dark (`#0a0a0a`, `#121212`, or a dark navy)."

### Upgrade Techniques — 4개 영역의 고임팩트 기법
"When upgrading a project, pull from these high-impact techniques to replace generic patterns"
- Typography Upgrades (3개)
- Layout Upgrades (4개)
- Motion Upgrades (4개)
- Surface Upgrades (4개)

### Fix Priority — **7단계 적용 순서 (리스크 순)**
"Apply changes in this order for **maximum visual impact with minimum risk**:"
1. **Font swap** — "biggest instant improvement, lowest risk"
2. **Color palette cleanup** — "remove clashing or oversaturated colors"
3. **Hover and active states** — "makes the interface feel alive"
4. **Layout and spacing** — "proper grid, max-width, consistent padding"
5. **Replace generic components** — "swap cliche patterns for modern alternatives"
6. **Add loading, empty, and error states** — "makes it feel finished"
7. **Polish typography scale and spacing** — "the premium final touch"

→ **이 스킬의 가장 실용적인 장치.** 임팩트/리스크 비율로 작업 순서를 정렬한 것이 이 컬렉션에서 유일하다.

### Rules — 6개 안전 규칙
- "Work with the existing tech stack. **Do not migrate frameworks or styling libraries.**"
- "**Do not break existing functionality. Test after every change.**"
- "Before importing any new library, **check the project's dependency file first**."
- "If the project uses Tailwind, **check the version (v3 vs v4)** before modifying config."
- "If the project has no framework, use vanilla CSS."
- "**Keep changes reviewable and focused. Small, targeted improvements over big rewrites.**"

**사용자 확인 요구 지점**: **없음.** 다만 "Test after every change"와 "Keep changes reviewable"이 사실상 사람의 검토를 전제한다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

이 스킬은 **전체가 안티패턴 카탈로그**다. 카테고리별 주요 항목:

**Typography (8항목)**
- "**Browser default fonts or Inter everywhere.**"
- "**Headlines lack presence.**"
- "**Body text too wide.**" → "roughly **65 characters**"
- "**Only Regular (400) and Bold (700) weights used.**" → "Introduce **Medium (500) and SemiBold (600)**"
- "**Numbers in proportional font.**" → "`font-variant-numeric: tabular-nums`"
- "**Missing letter-spacing adjustments.**" → "negative tracking for large headers, positive tracking for small caps or labels"
- "**All-caps subheaders everywhere.**" → "lowercase italics, sentence case, or small-caps"
- "**Orphaned words.**" → "`text-wrap: balance` or `text-wrap: pretty`"

**Color and Surfaces (11항목)**
- "**Pure `#000000` background.**" → `#0a0a0a`, `#121212`, or dark navy
- "**Oversaturated accent colors.**" → "Keep saturation **below 80%**"
- "**More than one accent color.**" → "Pick one. Remove the rest. **Consistency beats variety.**"
- "**Mixing warm and cool grays.**"
- "**Purple/blue \"AI gradient\" aesthetic.** This is **the most common AI design fingerprint**."
- "**Generic `box-shadow`.**" → "**Tint shadows to match the background hue.**"
- "**Flat design with zero texture.**" → "Add subtle noise, grain, or micro-patterns. **Pure flat vectors feel sterile.**"
- "**Perfectly even gradients.**" → "radial gradients, noise overlays, or mesh gradients instead of standard linear 45-degree fades"
- "**Inconsistent lighting direction.**" → "**a single, consistent light source**"
- "**Random dark sections in a light mode page (or vice versa).**" → "A single dark-background section breaking an otherwise light page **looks like a copy-paste accident**. ... use a slightly darker shade of the same palette — **not a sudden jump to `#111` in the middle of a cream page**."
- "**Empty, flat sections with no visual depth.**"

**Layout (16항목)** — 이 컬렉션에서 가장 상세한 레이아웃 감사
- "**Everything centered and symmetrical.**"
- "**Three equal card columns as feature row.** This is **the most generic AI layout**."
- "**Using `height: 100vh`**" → "`min-height: 100dvh`"
- "**Complex flexbox percentage math.**" → CSS Grid
- "**No max-width container.**" → "around **1200-1440px**"
- "**Cards of equal height forced by flexbox.**"
- "**Uniform border-radius on everything.**" → "**tighter on inner elements, softer on containers**"
- "**No overlap or depth.**" → "Use negative margins to create layering"
- "**Symmetrical vertical padding.**" → "**bottom padding often needs to be slightly larger**"
- "**Dashboard always has a left sidebar.**"
- "**Missing whitespace.**" → "**Double the spacing.**"
- "**Buttons not bottom-aligned in card groups.**" → "Pin buttons to the bottom of each card so they form a **clean horizontal line**"
- "**Feature lists starting at different vertical positions.**" → "should start at **the same Y position** across all columns"
- "**Inconsistent vertical rhythm in side-by-side elements.**" → "**Misaligned baselines make the layout look broken.**"
- "**Mathematical alignment that looks optically wrong.**" → "Icons next to text, play buttons in circles, or text in buttons often need **1-2px optical adjustments**"

**Interactivity and States (11항목)**
- "**No hover states on buttons.**"
- "**No active/pressed feedback.**" → "`scale(0.98)` or `translateY(1px)`"
- "**Instant transitions with zero duration.**" → "**200-300ms**"
- "**Missing focus ring.**" → "**This is an accessibility requirement, not optional.**"
- "**No loading states.**" → "skeleton loaders that match the layout shape"
- "**No empty states.**" / "**No error states.**" → "**Do not use `window.alert()`**"
- "**Dead links.**" → "Buttons that link to `#`"
- "**No indication of current page in navigation.**"
- "**Scroll jumping.**" → "`scroll-behavior: smooth`"
- "**Animations using `top`, `left`, `width`, `height`.**" → "`transform` and `opacity`"

**Content (11항목)**
- "**Generic names like \"John Doe\" or \"Jane Smith\".**" → "**diverse, realistic-sounding names**"
- "**Fake round numbers like `99.99%`, `50%`, `$100.00`.**" → "**organic, messy data: `47.2%`, `$99.00`, `+1 (312) 847-1928`**"
- "**Placeholder company names like \"Acme Corp\", \"Nexus\", \"SmartFlow\".**"
- "**AI copywriting cliches.** Never use \"**Elevate**\", \"**Seamless**\", \"**Unleash**\", \"**Next-Gen**\", \"**Game-changer**\", \"**Delve**\", \"**Tapestry**\", or \"**In the world of...**\""
- "**Exclamation marks in success messages.** Remove them. **Be confident, not loud.**"
- "**\"Oops!\" error messages.**" → "\"Connection failed. Please try again.\""
- "**Passive voice.**" → "\"We couldn't save your changes\" instead of \"Mistakes were made.\""
- "**All blog post dates identical.**"
- "**Same avatar image for multiple users.**"
- "**Lorem Ipsum.** Never use placeholder latin text."
- "**Title Case On Every Header.**" → "Use sentence case"

**Component Patterns (10항목)**
- "**Generic card look (border + shadow + white background).**" → "Cards should exist **only when elevation communicates hierarchy**"
- "**Always one filled button + one ghost button.**"
- "**Pill-shaped \"New\" and \"Beta\" badges.**"
- "**Accordion FAQ sections.**"
- "**3-card carousel testimonials with dots.**"
- "**Pricing table with 3 towers.**" → "Highlight the recommended tier with **color and emphasis, not just extra height**"
- "**Modals for everything.**"
- "**Avatar circles exclusively.**" → "squircles or rounded squares"
- "**Light/dark toggle always a sun/moon switch.**"
- "**Footer link farm with 4 columns.**"

**Iconography (5항목)**
- "**Lucide or Feather icons exclusively.** These are the \"default\" AI icon choice."
- "**Rocketship for \"Launch\", shield for \"Security\".**" → "bolt, fingerprint, spark, vault"
- "**Inconsistent stroke widths across icons.**"
- "**Missing favicon.**"
- "**Stock \"diverse team\" photos.**" → "**uncanny stock imagery**"

**Code Quality (8항목)**
- "**Div soup.**" → "`<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`"
- "**Inline styles mixed with CSS classes.**"
- "**Hardcoded pixel widths.**" → "`%`, `rem`, `em`, `max-width`"
- "**Missing alt text on images.**" → "**Never leave `alt=\"\"` or `alt=\"image\"` on meaningful images**"
- "**Arbitrary z-index values like `9999`.**"
- "**Commented-out dead code.**"
- "**Import hallucinations.**"
- "**Missing meta tags.**" → "`<title>`, `description`, `og:image`"

**Strategic Omissions (What AI Typically Forgets) — 6항목**
- "**No legal links.**" → privacy policy, terms of service
- "**No \"back\" navigation.**" → "Dead ends in user flows. **Every page needs a way back.**"
- "**No custom 404 page.**"
- "**No form validation.**"
- "**No \"skip to content\" link.**" → "**Essential for keyboard users.**"
- "**No cookie consent.**"

### 강제 규칙 — 수치 인용

| 항목 | 값 |
|---|---|
| 본문 폭 | "roughly **65 characters**" |
| 폰트 웨이트 | Regular **400** / Medium **500** / SemiBold **600** / Bold **700** |
| 액센트 채도 | "**below 80%**" |
| 액센트 개수 | **1개** |
| 다크 배경 | **`#0a0a0a`**, **`#121212`**, 또는 dark navy (순흑 금지) |
| max-width 컨테이너 | "around **1200-1440px**" |
| 전체 높이 | **`min-height: 100dvh`** (`100vh` 금지) |
| 트랜지션 시간 | **200-300ms** |
| Active 피드백 | **`scale(0.98)`** 또는 **`translateY(1px)`** |
| 광학 보정 | "**1-2px** optical adjustments" |
| 여백 | "**Double the spacing.**" |
| 이미지 플레이스홀더 | `https://picsum.photos/seed/{name}/1920/1080` |
| 유기적 데이터 예시 | `47.2%`, `$99.00`, `+1 (312) 847-1928` |
| 금지 z-index | `9999` |
| CSS 유틸 | `font-variant-numeric: tabular-nums`, `text-wrap: balance`, `text-wrap: pretty`, `scroll-behavior: smooth` |

### 항목별 지침

**타이포그래피** — 8개 증상. 서체 교체(Inter/브라우저 기본 → Geist/Outfit/Cabinet Grotesk/Satoshi), 4단 웨이트 도입, 65ch 폭, tabular-nums, 사이즈별 tracking 방향(큰 헤더 negative / 작은 라벨 positive), 전체 대문자 회피, 고아 단어 처리. **에디토리얼용 세리프+산세리프 페어링 권장.**

**컬러** — 11개 증상. 순흑 금지, 채도 <80%, 액센트 1개, 회색 계열 통일, AI 그라디언트 제거, **그림자 색조를 배경 색조에 맞춤**, 텍스처 추가, 균일 그라디언트 회피, **광원 방향 일관성**, 라이트/다크 섹션 혼재 금지. 대비 비율(WCAG) 수치는 **원문에 명시 없음.**

**스페이싱** — "Double the spacing", 비대칭 수직 패딩(하단을 약간 크게), 1-2px 광학 보정. spacing scale 체계는 **원문에 없음.**

**모션** — Interactivity 카테고리 + Motion Upgrades 4개. 200-300ms 트랜지션, scale(0.98) 프레스, transform/opacity 전용, smooth scroll. Upgrade로 smooth scroll with inertia / staggered entry / spring physics / scroll-driven reveals. **`prefers-reduced-motion`은 원문에 없음.**

**레이아웃** — 16개 증상. 이 컬렉션에서 **정렬(alignment) 문제를 가장 상세히 다룬다**: 카드 버튼 하단 정렬, 기능 목록 시작 Y좌표 통일, 나란한 요소의 baseline 정렬, 수학적 중앙 vs 광학적 중앙. 이는 다른 스킬에 없는 층위의 지적이다.

**접근성** — **이 컬렉션에서 가장 광범위**:
- "**Missing focus ring.** ... **This is an accessibility requirement, not optional.**"
- "**Missing alt text on images.** Describe image content **for screen readers**. Never leave `alt=\"\"` or `alt=\"image\"` on meaningful images."
- "**No \"skip to content\" link.** **Essential for keyboard users.** Add a hidden skip-link."
- "**Div soup.**" → 시맨틱 HTML
- "**No form validation.**"
- "**No indication of current page in navigation.**"
- "**No \"back\" navigation.** ... Every page needs a way back."
- 누락: `prefers-reduced-motion`, 대비 비율 수치, ARIA 속성, 키보드 트랩

### 지침을 주는 방식 자체

1. **증상 → 처방 쌍**: 100여 개 항목이 모두 "**증상.** 처방" 형식. 굵게 표시된 증상은 코드에서 찾을 수 있는 관찰 가능한 상태이고, 그 뒤에 즉시 실행 가능한 처방이 붙는다. **이 컬렉션에서 가장 실용적인 지침 형식.**
2. **카테고리 10개로 커버리지 확보**: 타이포/컬러/레이아웃/인터랙션/콘텐츠/컴포넌트/아이콘/코드품질/누락사항. **디자인을 넘어 콘텐츠·코드·접근성·법적 요구까지** 포함.
3. **"Strategic Omissions (What AI Typically Forgets)" 별도 섹션**: AI가 빠뜨리는 것을 별도 카테고리로 분리. 법적 링크, 뒤로 가기, 404, 폼 검증, skip-link, 쿠키 동의 — **기능적 완결성**을 디자인 감사에 편입.
4. **Fix Priority (임팩트/리스크 정렬)**: 7단계. "biggest instant improvement, **lowest risk**"부터 "the premium **final touch**"까지. 각 단계에 이유가 붙는다. **이 컬렉션에서 유일한 작업 순서 최적화.**
5. **안전 규칙 6개**: 스택 유지, 기능 파괴 금지 + 매 변경 후 테스트, 의존성 파일 사전 확인, Tailwind 버전 확인, 프레임워크 없으면 vanilla, 작고 검토 가능한 변경. **파괴적 변경을 구조적으로 억제.**
6. **Upgrade Techniques를 별도 분리**: 감사(고칠 것) / 업그레이드(더할 것)를 분리. 업그레이드는 4개 영역 × 3~4기법으로 "high-impact techniques"만 제시.
7. **광학적 판단을 명시적으로 인정**: "**Mathematical alignment that looks optically wrong.** Centering by the math doesn't always look centered to the eye." + "Symmetrical vertical padding ... **Adjust optically**". 이 컬렉션에서 **수치가 아닌 눈의 판단을 지침으로 명문화한 유일한 지점.**
8. **AI 지문(fingerprint) 개념**: "Purple/blue \"AI gradient\" aesthetic. This is **the most common AI design fingerprint**." / "Three equal card columns ... **the most generic AI layout**" / "Lucide or Feather icons ... the \"**default**\" AI icon choice". 즉 **AI 산출물의 통계적 특징을 진단 지표로** 사용.
9. **대안을 복수로 제시**: 대부분의 처방이 2~4개 선택지를 준다 ("Replace with a 2-column zig-zag, asymmetric grid, horizontal scroll, or masonry layout"). 단일 처방을 강제하지 않아 기존 프로젝트의 제약에 맞출 수 있다.
10. **카피라이팅·콘텐츠까지 규정**: 감탄사 제거("Be confident, not loud"), "Oops!" 금지, 수동태 금지, 날짜 무작위화, 아바타 중복 금지, Title Case 금지. **디자인 스킬이 문안 톤까지 다룬다.**
11. **페르소나 부여 없음**, **실물 브랜드 참조 없음**, **다이얼 없음**. 미학 서술이 최소화되고 진단 목록에 집중한 형태.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**premium quality**" (description) | 100여 개 증상 제거 + Fix Priority 7단계 + Upgrade Techniques |
| "**generic AI patterns**" | 퍼플/블루 그라디언트, 3열 균등 카드, Lucide/Feather 아이콘, Inter, 순흑 배경, John Doe, Acme Corp, `99.99%`, Lorem Ipsum |
| "**Headlines lack presence**" | 크기 증가 + tracking 축소 + line-height 감소 → "should feel **heavy and intentional**" |
| "**Pure flat vectors feel sterile**" | subtle noise / grain / micro-patterns 추가 |
| "**looks like a copy-paste accident**" | 라이트 페이지 중간의 단독 다크 섹션 → 같은 팔레트의 약간 어두운 톤 사용 |
| "**Misaligned baselines make the layout look broken**" | 나란한 요소의 title/description/price/button을 모두 정렬 |
| "**looks optically wrong**" | 1-2px 수동 보정 (아이콘+텍스트, 원 안의 재생 버튼, 버튼 안의 텍스트) |
| "**makes the interface feel alive**" | hover/active 상태 추가 (Fix Priority 3단계) |
| "**makes it feel finished**" | loading/empty/error 상태 추가 (Fix Priority 6단계) |
| "**the premium final touch**" | 타이포그래피 스케일·간격 폴리시 (Fix Priority 7단계) |
| "**Be confident, not loud**" | 성공 메시지의 감탄사 제거 |
| "**organic, messy data**" | `47.2%`, `$99.00`, `+1 (312) 847-1928` |
| "**uncanny stock imagery**" | "diverse team" 스톡 사진 → 실제 팀 사진 / 캔디드 / 일관된 일러스트 |
| "**Let the design breathe**" | "**Double the spacing.**" |
| "**Consistency beats variety**" | 액센트 색 1개만 |
| "**text that feels alive**" | 스크롤/호버에 variable font weight·width 보간 |
| "**True glassmorphism**" | "`backdrop-filter: blur`를 넘어 **1px inner border + subtle inner shadow**로 edge refraction 시뮬레이션" |

## 7. 산출물

- **형식**: 기존 프로젝트의 **수정된 코드** (기존 스택 유지). 그리고 2단계 Diagnose의 **진단 목록**.
- **파일 저장 위치 / 네이밍 규칙**: 기존 프로젝트 구조를 따름. **별도 규정 없음.**
- **변경 방식**: "Keep changes reviewable and focused. **Small, targeted improvements over big rewrites.**"
- 진단 결과를 파일로 남기라는 지침은 **원문에 없음** (`garden-skills/improve-animations`가 `plans/NNN-*.md`로 남기는 것과 대비).

## 8. 주의점 / 한계

- **진단 결과의 산출물 형식 미규정**: 2단계가 "List every generic pattern"을 요구하지만 그 목록의 형식(표, 우선순위, 심각도)이 **원문에 없다.** 100여 개 항목을 점검하면 진단 목록이 매우 길어질 수 있는데, 우선순위 정렬은 Fix Priority(7단계)로만 간접 제공된다.
- **증상 판정의 자동화 불가**: "Headlines lack presence", "Missing whitespace", "looks optically wrong" 같은 항목은 코드만 보고 판정하기 어렵다. 브라우저 렌더링 확인이 사실상 필요하지만 **원문에 검증 절차가 없다** (`garden-skills/web-design-engineer`의 browser-acceptance와 대비).
- **`prefers-reduced-motion` 부재**: 접근성 항목이 이 컬렉션에서 가장 많은데도 감소 모션이 빠졌다. 동시에 Motion Upgrades로 "smooth scroll with inertia", "staggered entry", "spring physics", "scroll-driven reveals"를 권장하므로 공백이 실질적이다.
- **대비 비율 수치 부재**: focus ring과 alt text를 접근성 요구로 명시하면서 색 대비의 수치 기준(WCAG AA 4.5:1 등)이 **원문에 없다.** "Keep saturation below 80%"는 대비와 다른 축이다.
- **"Test after every change"의 실효성**: 테스트 방법(수동 확인, 자동 테스트, 스크린샷 비교)이 **원문에 없다.** 기존 프로젝트에 테스트가 없으면 이 규칙은 선언에 그친다.
- **취향의 은폐**: description은 "high-end design standards"라는 중립적 표현을 쓰지만, 실제 금지 목록은 특정 취향을 강하게 반영한다 (Inter 금지, Lucide 금지, 아코디언 FAQ 금지, 3열 카드 금지, sun/moon 토글 금지). 프로젝트가 의도적으로 그 패턴을 쓰고 있을 때의 처리가 **원문에 없다** — `garden-skills/web-design-engineer`가 "the brand spec uses it"을 유일한 예외로 명시하는 것과 대비.
- **컴포넌트 패턴 금지의 과잉 위험**: "Accordion FAQ sections"나 "Pricing table with 3 towers"는 사용자에게 익숙하고 효과적인 패턴일 수 있다. 이를 "generic"으로 분류해 교체를 권하면 사용성이 나빠질 수 있으며, **판단 기준이 원문에 없다.**
- **컬렉션 내 중복**: 금지 목록이 `high-end-visual-design`, `minimalist-ui`, `stitch-design-taste`와 상당 부분 겹친다 (Inter, 순흑, 액센트 1개/채도 80%, AI 그라디언트, `h-screen`, John Doe/Acme, AI 카피 클리셰, `picsum.photos`). 다만 이 스킬은 **역할이 명확히 다르므로**(기존 개선 vs 신규 생성) 중복이 충돌로 이어지지 않는다.
- **`design-taste-frontend`와의 관계**: 87KB의 종합 스킬이 같은 컬렉션에 있고 내용이 겹칠 가능성이 높다. 상호 참조가 **원문에 없다.**
- **강한 경고 지점**:
  - "**Do not rewrite from scratch. Improve what's there.**"
  - "**Do not migrate frameworks or styling libraries.**"
  - "**Do not break existing functionality. Test after every change.**"
  - "Before importing any new library, **check the project's dependency file first.**"
  - "If the project uses Tailwind, **check the version (v3 vs v4)**"
  - "**Keep changes reviewable and focused. Small, targeted improvements over big rewrites.**"
  - "**Missing focus ring** ... This is an accessibility requirement, **not optional**."
  - "**Never leave `alt=\"\"` or `alt=\"image\"` on meaningful images.**"
  - "**Never use placeholder latin text.**"
  - "Do not use **`window.alert()`**"
- **검증 장치**: Design Audit 자체가 100여 항목 체크리스트로 기능한다 — **이 컬렉션에서 가장 큰 검증 목록**. 그리고 "Test after every change" + "Import hallucinations" 확인 + Tailwind 버전 확인이 실질적 안전장치다. 다만 실행 가능한 검증(빌드, 브라우저, 린트)이 **명시되지 않았고**, 진단→수정의 완료 판정 기준도 없다.
