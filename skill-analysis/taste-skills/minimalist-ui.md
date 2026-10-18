# minimalist-ui 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/minimalist-ui/`
- **핵심 파일**: `SKILL.md` (7,901 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **단일 미학에 고정된 스타일 프로토콜**. "Premium Utilitarian Minimalism & Editorial UI"라는 하나의 시각 언어를 8개 섹션으로 규정. 컬러 hex, 폰트명, px/ms 값이 전부 명시된 **완전 처방형** 지침.

원문 자기 규정: "An advanced frontend engineering directive for generating highly refined, ultra-minimalist, \"document-style\" web interfaces **analogous to top-tier workspace platforms**." 그리고 "**It actively rejects standard generic SaaS design trends.**"

(원문에 브랜드명은 없으나 팔레트값 `#F7F6F3`/`#2F3437`/`#787774`와 "document-style", "top-tier workspace platforms"는 Notion 계열 미학을 지시한다 — 이는 해석이며 원문에 명시는 없음.)

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids, muted pastels. No gradients, no heavy shadows."

**해석**: "Use when…" 형태의 트리거 문구가 **없다.** 미학 특성만 열거되어 있다. 매칭될 것으로 보이는 발화:
- "미니멀하게 만들어줘", "깔끔한 문서 스타일 UI"
- "Notion 같은 느낌으로" (브랜드명은 원문에 없으나 팔레트가 일치)
- "에디토리얼 느낌", "warm monochrome"
- "그라디언트 없이", "그림자 최소화"

**중요**: description이 짧고 미학 서술뿐이라, 같은 컬렉션의 다른 스타일 스킬(`gpt-taste`, `industrial-brutalist-ui`, `high-end-visual-design`)과 **동시 활성화될 위험**이 있다. 그 경우 지침이 정면 충돌한다 (§8 참조).

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 문서형·워크스페이스형 제품 UI — "document-style", "top-tier workspace platforms"
- 텍스트 밀도가 높은 랜딩 페이지 / 제품 소개 — 에디토리얼 세리프 헤딩 + 관대한 line-height
- 개발자 도구 / B2B SaaS 중 절제된 톤을 원할 때 — `<kbd>` 키스트로크 UI, 모노스페이스 메타데이터, faux-OS 창 크롬
- 브랜드 팔레트가 없고 즉시 쓸 수 있는 값 세트가 필요할 때 — hex·px·ms가 전부 명시되어 있어 그대로 적용 가능
- FAQ·기능 그리드·태그 같은 정형 컴포넌트가 필요할 때 — §5가 컴포넌트별 스펙 제공

**부적합 / 과한 상황**
- 브랜드 컬러가 강한 프로젝트 — 팔레트가 warm monochrome + 4개 파스텔로 고정되어 있어 브랜드색을 넣을 자리가 없음 ("Color is a scarce resource")
- 임팩트·모션이 자산인 마케팅 페이지 → `gpt-taste` (모션 필수, 거대 스케일)
- 브루탈리즘·실험적 미학 → `industrial-brutalist-ui`
- 다크 모드 중심 제품 — 이 프로토콜은 전부 라이트 팔레트이며 **다크 모드 지침이 원문에 없음**
- 이미 디자인 시스템이 있는 프로젝트 — 이 스킬은 자체 값으로 덮어씀

**형제 스킬 대신 이걸 고르는 기준**: 원하는 결과가 **"조용하고 문서적"**인가. 이 컬렉션의 스타일 스킬 3개(`minimalist-ui` / `industrial-brutalist-ui` / `gpt-taste`)는 서로 배타적인 미학이므로 **하나만 골라야 한다.**

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 이미지 자산 부재 시 — "Use reliable placeholders like `https://picsum.photos/seed/{context}/1200/800` **when real assets are unavailable**."
- **필요한 CLI/런타임/패키지** (생성 코드가 요구)
  - **Tailwind CSS** (권장 대상 중 하나) — `py-24`/`py-32`, `max-w-4xl`, `text-xs` 클래스 사용. 다만 실행 지침이 "HTML, React, Tailwind, Vue"를 모두 열거하므로 Tailwind 필수는 아님
  - **폰트** (모두 유료 또는 특정 플랫폼 종속):
    - Sans: `'SF Pro Display'`(Apple), `'Geist Sans'`(Vercel), `'Helvetica Neue'`, `'Switzer'`(Fontshare)
    - Serif: `'Lyon Text'`(**상업 유료**), `'Newsreader'`(Google), `'Playfair Display'`(Google), `'Instrument Serif'`(Google)
    - Mono: `'Geist Mono'`, `'SF Mono'`(Apple), `'JetBrains Mono'`
  - **아이콘**: **Phosphor Icons** (Bold 또는 Fill weight) 또는 **Radix UI Icons**
  - **`IntersectionObserver`** (웹 표준) — 스크롤 진입 애니메이션에 필수 지정
- **네트워크**: 폰트 로딩, `picsum.photos` 플레이스홀더에 필요
- **비용 발생 지점**: 유료 API 없음. 단 **`Lyon Text`는 상업 라이선스 폰트**이며 원문에 라이선스 언급이 없다.

## 5. 워크플로우

### Execution Protocol (§8) — 7단계 순서

"When tasked with writing frontend code (HTML, React, Tailwind, Vue) or designing a layout:"

1. "**Establish the macro-whitespace first.** Use massive vertical padding between sections (e.g., `py-24` or `py-32` in Tailwind)."
2. "**Constrain the main typography content width** to `max-w-4xl` or `max-w-5xl`."
3. "**Apply the custom typographic hierarchy and monochromatic color variables immediately.**"
4. "**Ensure every card, divider, and border adheres strictly to the `1px solid #EAEAEA` rule.**"
5. "**Add scroll-entry animations to all major content blocks.**"
6. "**Ensure sections have visual depth** through imagery, ambient gradients, or subtle textures — **no empty flat backgrounds**."
7. "**Provide code that reflects this high-end, uncluttered, editorial aesthetic natively without requiring manual adjustments.**"

**순서의 논리**: 여백(1) → 폭 제약(2) → 타이포·컬러 변수(3) → 테두리 통일(4) → 모션(5) → 깊이 보강(6) → 완결성(7). 즉 **거시 구조에서 미시 마감으로** 내려가며, 마지막 단계가 "수동 조정 없이 그대로 쓸 수 있어야 한다"는 완결 요구.

**분기·조건·게이트**: 사실상 없다. 이 스킬은 게이트나 Checkpoint가 없는 **선형 처방**이다. 조건부는 두 곳뿐 —
- 이미지 자산 부재 시 `picsum.photos` 폴백
- "Background Ambient Motion: **Optional**"
- "Faux-OS Window Chrome: **When mocking up software**"

**사용자 확인 요구 지점**: **없음.** 이 컬렉션의 스타일 스킬 공통 특징으로, garden-skills의 Checkpoint 구조와 대조된다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

§2 "Absolute Negative Constraints (Banned Elements)" 전문:

- "DO NOT use the **\"Inter\", \"Roboto\", or \"Open Sans\"** typefaces."
- "DO NOT use generic, thin-line icon libraries like **\"Lucide\", \"Feather\", or standard \"Heroicons\"**."
- "DO NOT use Tailwind's default heavy drop shadows (e.g., `shadow-md`, `shadow-lg`, `shadow-xl`). Shadows must be **practically non-existent or heavily customized to be ultra-diffuse and low opacity (< 0.05)**."
- "DO NOT use primary colored backgrounds for large elements or sections (e.g., **no bright blue, green, or red hero sections**)."
- "DO NOT use **gradients, neon colors, or 3D glassmorphism** (beyond subtle navbar blurs)."
- "DO NOT use **`rounded-full`** (pill shapes) for large containers, cards, or primary buttons."
- "DO NOT use **emojis** anywhere in code, markup, text content, headings, or alt text. Replace with proper icons or clean SVG primitives."
- "DO NOT use generic placeholder names like **\"John Doe\", \"Acme Corp\", or \"Lorem Ipsum\"**. Use realistic, contextual content."
- "DO NOT use **AI copywriting clichés: \"Elevate\", \"Seamless\", \"Unleash\", \"Next-Gen\", \"Game-changer\", \"Delve\"**. Write plain, specific language."

본문의 추가 금지:
- "Body text must **never be absolute black (`#000000`)**."
- "**Never use oversaturated stock photos.**"
- "Sections should not feel empty and flat." / "**no empty flat backgrounds**"
- 아코디언: "**Strip all container boxes.**"
- 모션: "Use `IntersectionObserver`, **never `window.addEventListener('scroll')`**."
- 스태거: "**Never mount everything at once.**"
- 앰비언트 모션: "**Never on scrolling containers.**"
- 성능: "**No layout-triggering properties (`top`, `left`, `width`, `height`).** Use `will-change: transform` **sparingly** and only on actively animating elements."
- 전체: "**It actively rejects standard generic SaaS design trends.**"

### 강제 규칙 — 수치 인용

**타이포그래피 (§3)**
```css
/* Primary Sans-Serif (Body, UI, Buttons) */
font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'Switzer', sans-serif;
/* Editorial Serif (Hero Headings & Quotes) */
font-family: 'Lyon Text', 'Newsreader', 'Playfair Display', 'Instrument Serif', serif;
/* Monospace (Code, Keystrokes, Meta-data) */
font-family: 'Geist Mono', 'SF Mono', 'JetBrains Mono', monospace;
```
- 세리프 헤딩: tracking **`letter-spacing: -0.02em` ~ `-0.04em`**, line-height **`1.1`**
- 본문 색: **`#111111`** 또는 **`#2F3437`** (off-black/charcoal), line-height **`1.6`**
- 보조 텍스트: **`#787774`** (muted gray)
- 태그 타이포: **`text-xs`**, uppercase, tracking **`letter-spacing: 0.05em`**

**컬러 팔레트 (§4)** — "Color is a scarce resource, utilized only for semantic meaning or subtle accents."

| 역할 | 값 |
|---|---|
| Canvas / Background | `#FFFFFF` 또는 warm bone/off-white **`#F7F6F3`** / **`#FBFBFA`** |
| Primary Surface (Cards) | `#FFFFFF` 또는 **`#F9F9F8`** |
| Structural Borders / Dividers | **`#EAEAEA`** 또는 **`rgba(0,0,0,0.06)`** |

**Spot Pastels (4개, 배경+텍스트 쌍)** — "Exclusively use highly desaturated, washed-out pastels for tags, inline code backgrounds, or subtle icon backgrounds."

| 이름 | 배경 | 텍스트 |
|---|---|---|
| Pale Red | **`#FDEBEC`** | **`#9F2F2D`** |
| Pale Blue | **`#E1F3FE`** | **`#1F6C9F`** |
| Pale Green | **`#EDF3EC`** | **`#346538`** |
| Pale Yellow | **`#FBF3DB`** | **`#956400`** |

**컴포넌트 스펙 (§5)**

*Bento Box Feature Grids*
- "Utilize **asymmetrical** CSS Grid layouts."
- "Cards must have **exactly `border: 1px solid #EAEAEA`**."
- "Border-radius must be crisp: **`8px` or `12px` maximum**."
- "Internal padding must be generous (e.g., **`24px` to `40px`**)."

*Primary CTA (Buttons)*
- "Solid background **`#111111`**, text **`#FFFFFF`**."
- "Slight border-radius (**`4px` to `6px`**). **No box-shadow.**"
- "Hover state should be a subtle color shift to **`#333333`** or a micro-scale **`transform: scale(0.98)`**."

*Tags & Status Badges*
- "Pill-shaped (**`border-radius: 9999px`**), very small typography (`text-xs`), uppercase with wide tracking (`letter-spacing: 0.05em`)."
- "Background must use the defined Muted Pastels."

*Accordions (FAQ)*
- "Strip all container boxes. Separate items **only** with a **`border-bottom: 1px solid #EAEAEA`**."
- "Use a clean, sharp **`+` and `-`** icon for the toggle state."

*Keystroke Micro-UIs*
- "Render shortcuts as physical keys using **`<kbd>`** tags: `border: 1px solid #EAEAEA`, `border-radius: 4px`, `background: #F7F6F3`, using the Monospace font."

*Faux-OS Window Chrome*
- "wrap it in a minimalist container with a white top bar containing **three small, light gray circles** (replicating macOS window controls)."

**모션 (§7)** — "Motion should feel **invisible** — present but never distracting. The goal is **quiet sophistication, not spectacle**."

| 항목 | 값 |
|---|---|
| Scroll Entry | **`translateY(12px)`** + **`opacity: 0`** → **`600ms`** with **`cubic-bezier(0.16, 1, 0.3, 1)`** |
| Hover (카드) | `box-shadow` **`0 0 0`** → **`0 2px 8px rgba(0,0,0,0.04)`** over **`200ms`** |
| Active (버튼) | **`scale(0.98)`** |
| Staggered Reveals | **`animation-delay: calc(var(--index) * 80ms)`** |
| Background Ambient (선택) | radial gradient blob, **`animation-duration: 20s+`**, **`opacity: 0.02-0.04`**, `position: fixed; pointer-events: none` |
| 성능 | "Animate **exclusively** via `transform` and `opacity`" |

**이미지·배경 (§6)**
- 사진: "high-quality, **desaturated** images with a **warm tone**". 오버레이 — "**`opacity: 0.04`** warm grain"
- 플레이스홀더: **`https://picsum.photos/seed/{context}/1200/800`**
- 섹션 배경: "soft radial light spots (`radial-gradient` with warm tones at **`opacity: 0.03`**)"
- 일러스트: "**Monochromatic, rough continuous-line ink sketches** on a white background, featuring **a single offset geometric shape filled with a muted pastel color**."

**레이아웃 (§8)**
- 섹션 간 수직 패딩: **`py-24`** 또는 **`py-32`**
- 본문 폭: **`max-w-4xl`** 또는 **`max-w-5xl`**

**그림자 상한**: opacity **< 0.05**

### 항목별 지침

**타이포그래피** — 3계층 스택(Sans/Serif/Mono) + 금지 3서체 + 세리프 헤딩의 negative tracking(-0.02~-0.04em) + line-height 1.1(헤딩)/1.6(본문) + off-black 강제. **이 컬렉션에서 타이포그래피 값이 가장 촘촘한 스킬 중 하나.**

**컬러** — warm monochrome 3단(canvas/surface/border) + 파스텔 4쌍. 색을 "scarce resource"로 규정하고 용도를 3가지로 한정(태그, 인라인 코드 배경, 미묘한 아이콘 배경). 대비 비율(WCAG) 수치는 **원문에 명시 없음** — 다만 파스텔 배경/텍스트 쌍이 미리 짝지어져 있어 실무적으로 대비를 보장하려는 설계로 읽힌다.

**스페이싱** — 섹션 `py-24`/`py-32`, 카드 내부 24~40px, 본문 폭 max-w-4xl/5xl. 8pt 그리드 같은 체계 선언은 **원문에 없음** (Tailwind 기본 스케일 전제).

**모션** — 5개 항목 전부 구체값. easing이 **단 하나** (`cubic-bezier(0.16, 1, 0.3, 1)`)로 고정되고, 성능 규칙(transform/opacity 전용, layout 속성 금지, `will-change` 절제)까지 포함. `prefers-reduced-motion`은 **원문에 언급 없음**.

**레이아웃** — 비대칭 Bento 그리드, 아코디언은 컨테이너 제거, faux-OS 크롬. 반응형 브레이크포인트 지침은 **원문에 없음** (`md:` 접두사조차 없음 — `gpt-taste`의 `py-32 md:py-48`과 대비).

**Border-radius 전략** — 명시적으로 계층화됨: 카드 8~12px(최대), 버튼 4~6px, `<kbd>` 4px, 태그만 9999px. 그리고 "**`rounded-full`을 큰 컨테이너·카드·주 버튼에 금지**". 즉 **pill은 아주 작은 요소에만 허용**.

**접근성** — 명시적 지침 **없음.** 근접 항목: 본문 line-height 1.6 "for legibility", off-black 강제, `<kbd>` 시맨틱 태그 사용, alt text에 이모지 금지(즉 alt text 존재를 전제). `prefers-reduced-motion` / 포커스 상태 / 키보드 내비게이션 / 대비 비율은 **원문에 없음.**

### 지침을 주는 방식 자체

1. **완전 처방 (full prescription)**: 이 스킬은 판단을 요구하지 않는다. hex, px, ms, cubic-bezier, 폰트명이 전부 주어져 있어 **그대로 복사하면 결과가 나온다**. 그 결과 재현성이 높고 판단 오류 여지가 적다.
2. **"Protocol" 프레이밍**: 제목이 "Protocol: Premium Utilitarian Minimalism UI Architect", 섹션 1이 "Protocol Overview". 지침을 규격서로 제시.
3. **금지를 최상단에 배치 (§2)**: 무엇을 만들지보다 **무엇을 피할지를 먼저** 규정. "Absolute Negative Constraints"라는 강한 명명.
4. **금지에 구체적 이름 지목**: 서체(Inter/Roboto/Open Sans), 아이콘 라이브러리(Lucide/Feather/Heroicons), Tailwind 클래스(`shadow-md`/`lg`/`xl`), 플레이스홀더 이름(John Doe/Acme Corp/Lorem Ipsum), 카피 클리셰(Elevate/Seamless/Unleash/Next-Gen/Game-changer/Delve). **검출 가능한 문자열 단위 금지.**
5. **카피라이팅까지 규정**: AI 클리셰 6개를 명시 금지하고 "Write plain, specific language." 디자인 스킬이 문안까지 다루는 사례.
6. **컴포넌트별 스펙표 (§5)**: 6개 컴포넌트에 대해 테두리·라운드·패딩·색·호버를 각각 지정. 즉 **디자인 시스템의 컴포넌트 층까지 처방**.
7. **색을 자원으로 프레이밍**: "**Color is a scarce resource**, utilized only for semantic meaning or subtle accents."
8. **모션의 목표를 대조로 정의**: "**quiet sophistication, not spectacle**", "Motion should feel **invisible**".
9. **파스텔을 배경/텍스트 쌍으로 제공**: 4개 파스텔마다 대응 텍스트 색을 명시 — 사용자가 조합을 고민하지 않게 함.
10. **참조 대상**: "**analogous to top-tier workspace platforms**" — 브랜드명을 쓰지 않고 카테고리로 지시. `web-design-engineer`(Linear/Aesop/MUJI 등 25개 명시)와 대비되는 방식.
11. **페르소나 부여**: "UI Architect" (제목), "The AI must strictly avoid…"
12. **실행 순서를 거시→미시로**: §8의 7단계. 특히 1단계가 "여백을 먼저 확립"인 것이 미니멀리즘 철학과 일치.
13. **완결성 요구**: "without requiring manual adjustments" — 후속 수정 없이 바로 쓸 수 있는 코드를 요구.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**Premium**" | 금지 서체 3개 회피 + 유료/플랫폼 폰트 스택 + 그림자 opacity <0.05 + 색을 희소 자원으로 |
| "**editorial feel**" | "extreme typographic contrast" — 세리프 헤딩(`-0.02~-0.04em`, lh `1.1`) vs sans 본문(lh `1.6`) |
| "**document-style**" | warm bone 캔버스(`#F7F6F3`) + off-black 본문(`#111111`) + 1px `#EAEAEA` 구분선 + `<kbd>` 물리 키 |
| "**ultra-flat**" | `shadow-md`/`lg`/`xl` 금지, 그림자 opacity <0.05, 버튼 "No box-shadow" |
| "**warm monochrome**" | `#F7F6F3` / `#FBFBFA` / `#F9F9F8` (warm off-whites) + `#787774` (warm gray) |
| "**muted / washed-out pastels**" | 4개 hex 쌍 (`#FDEBEC`/`#9F2F2D` 등) |
| "**macro-whitespace**" | `py-24` / `py-32` 섹션 패딩 + 카드 내부 24~40px |
| "**crisp**" (라운드) | `8px` 또는 `12px` 최대 (카드), `4~6px` (버튼) |
| "**Motion should feel invisible**" | `translateY(12px)` + 600ms + `cubic-bezier(0.16, 1, 0.3, 1)`, hover 그림자 `rgba(0,0,0,0.04)` |
| "**quiet sophistication, not spectacle**" | 위 값들 + 앰비언트 blob `20s+` / `opacity 0.02-0.04` |
| "**should not feel empty and flat**" | 저투명도 배경 이미지 / `radial-gradient` warm `opacity: 0.03` / 미니멀 기하 선 패턴 |
| "**technical, slightly thicker-stroke aesthetic**" | Phosphor Icons (Bold 또는 Fill) 또는 Radix UI Icons, stroke width 통일 |
| "**AI copywriting clichés**" | Elevate / Seamless / Unleash / Next-Gen / Game-changer / Delve — 6개 단어 금지 |
| "**realistic, contextual content**" | John Doe / Acme Corp / Lorem Ipsum 금지 |
| "**oversaturated stock photos**" | desaturated + warm tone + `opacity: 0.04` warm grain 오버레이 |

## 7. 산출물

- **형식**: 프론트엔드 코드 — "HTML, React, Tailwind, Vue" 중 과제에 맞는 것. 또는 레이아웃 설계.
- **완결성 요구**: "Provide code that reflects this high-end, uncluttered, editorial aesthetic **natively without requiring manual adjustments**."
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- 출력 형식·순서 규정 (`<design_plan>` 같은 것)도 **없음** — `gpt-taste`와 대비되는 지점.

## 8. 주의점 / 한계

- **다크 모드 지침 부재**: 전체 팔레트가 라이트 전용이다. 다크 모드 요청 시의 대응이 **원문에 없다.** warm off-white 캔버스와 off-black 텍스트가 프로토콜의 핵심이므로 단순 반전으로는 성립하지 않는다.
- **반응형 지침 부재**: 브레이크포인트, 모바일 대응, 컨테이너 쿼리가 **원문에 전혀 없다.** `py-24`/`max-w-4xl` 같은 값이 데스크톱 기준으로만 주어져 모바일에서 여백이 과할 수 있다.
- **접근성 지침 부재**: `prefers-reduced-motion`이 없는데 모든 주요 블록에 스크롤 진입 애니메이션을 요구한다(§8-5). 포커스 상태, 키보드 내비게이션, 대비 비율도 없다. 파스텔 배경/텍스트 쌍은 실무적으로 대비를 고려한 것으로 보이나 **검증 수치가 제시되지 않는다.**
- **`Lyon Text` 라이선스**: 세리프 스택의 첫 항목이 상업 유료 폰트다. 라이선스·대체 안내가 **원문에 없다** (폴백 체인에 Google Fonts 3개가 있어 실무적으로는 동작하지만, 첫 선택이 유료라는 점은 명시되지 않음).
- **`SF Pro Display` / `SF Mono`**: Apple 시스템 폰트로 웹에서 자유롭게 배포할 수 없다. 라이선스 언급 **없음.**
- **브랜드 커스터마이즈 경로 없음**: 팔레트가 고정값이므로 브랜드 컬러를 어디에 넣을지가 **원문에 없다.** "Color is a scarce resource"라는 철학과 브랜드 요구가 충돌할 때의 처리 지침이 없다.
- **컬렉션 내 스타일 충돌**: `gpt-taste`는 "Static interfaces are strictly forbidden" + `duration-700` + 필수 GSAP + `mesh gradients`를 요구하는데, 이 스킬은 "gradients 금지" + "Motion should feel invisible" + 600ms 페이드다. `industrial-brutalist-ui`는 또 다른 미학일 것이다. **description에 트리거가 없어 어느 것이 켜질지 예측하기 어렵고, 둘 이상 켜지면 지침이 상호 모순**한다. 원문에 형제 스킬 라우팅이 전혀 없다.
- **`picsum.photos` 의존**: 플레이스홀더가 외부 서비스. `web-design-engineer`의 "실물 자산 없으면 정지" 태도와 반대.
- **모션 easing 단일화의 경직성**: `cubic-bezier(0.16, 1, 0.3, 1)` 하나만 제시된다. 진입/이탈/이동 등 상황별 곡선 구분이 **원문에 없다** (`emilkowalski`가 3개 토큰을 상황별로 분기시키는 것과 대비).
- **강한 경고 지점**:
  - "**Absolute Negative Constraints**" (§2 전체)
  - "Cards must have **exactly** `border: 1px solid #EAEAEA`"
  - "Body text must **never be absolute black**"
  - "Use `IntersectionObserver`, **never `window.addEventListener('scroll')`**"
  - "**Never mount everything at once.**"
  - "**Never on scrolling containers.**" (앰비언트 모션)
  - "**No layout-triggering properties**"
  - "**It actively rejects standard generic SaaS design trends.**"
- **검증 장치**: **없다.** 체크리스트, 자체 점검, 실행 검증 모두 부재. §8의 7단계가 사실상의 순서 가이드일 뿐 검증이 아니다. `gpt-taste`의 `<design_plan>`이나 garden-skills의 리뷰어 구조와 비교하면 이 스킬은 **처방의 구체성으로 품질을 확보하고 검증은 생략**하는 전략이다.
