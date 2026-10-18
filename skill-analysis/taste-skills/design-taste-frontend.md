# design-taste-frontend 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/design-taste-frontend/`
- **핵심 파일**: `SKILL.md` (87,253 bytes, 1,206줄) — **4개 컬렉션 37개 스킬 전체에서 가장 큰 단일 파일**
- **보조 파일**: 없음 (단, §12가 `skills/taste-skill/blocks/` 디렉토리 구조를 정의하지만 **실제 파일은 존재하지 않음** — §8 참조)
- **성격**: **랜딩 페이지·포트폴리오·리디자인 전용 종합 안티슬롭 스킬**. 14개 본문 섹션 + 3개 부록(Appendix A/B/C). `design-taste-frontend-v1`의 "substantial rewrite" 버전이며, v1 대비 브리프 추론 단계, 실제 디자인 시스템 매핑, 리디자인 프로토콜, GSAP 정본 코드, 부록(실제 설치 명령·공식 문서 링크)이 추가되었다.

원문 자기 규정 (제목 아래 인용):
> "Landing pages, portfolios, and redesigns. **Not dashboards, not data tables, not multi-step product UI.**
> Every rule below is **contextual**. **None of it fires automatically.** First read the brief, then pull only what fits."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check."

**매칭되는 사용자 발화**
- "랜딩 페이지 만들어줘", "포트폴리오 사이트"
- "이 사이트 리디자인해줘"
- "AI가 만든 것처럼 안 보이게"
- "Linear 스타일로", "Awwwards 느낌", "브루탈리즘", "premium consumer", "Apple-y" — §0.A가 이런 vibe 단어를 신호로 규정

**명시적 배제 (§13 OUT OF SCOPE)**
- Dashboards / dense product UI / admin panels → "use Fluent, Carbon, Atlassian, or Polaris from Section 2.A"
- Data tables → "use TanStack Table or AG Grid"
- Multi-step forms / wizards
- Code editors → "use Monaco / CodeMirror"
- Native mobile → "use Apple HIG / Material directly"
- Realtime collab UIs
→ "If the brief is one of the above, **say so explicitly**, point to the right tool, and only apply this skill's marketing-page / about-page / landing-page parts to the surfaces where they apply."

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 랜딩 페이지 / 포트폴리오 / 에디토리얼·블로그 (신규 또는 리디자인)
- **브리프를 읽고 방향을 추론해야 할 때** — §0이 이 컬렉션에서 유일하게 "설계 전 브리프 해석"을 절차화
- **실제 디자인 시스템이 적절한 경우** — §2.A가 13개 공식 패키지를 브리프 유형에 매핑 (Fluent / Material / Carbon / Polaris / Atlaskit / Primer / GOV.UK / USWDS / Bootstrap / Radix / shadcn / Tailwind)
- **기존 사이트 리디자인** — §11이 모드 감지(Greenfield / Preserve / Overhaul) + 감사 + 보존 규칙 + 레버 우선순위 제공
- 스크롤 하이재킹·스티키 스택이 필요할 때 — §5.A/5.B에 GSAP 정본 스켈레톤 제공
- 접근성·성능 기준이 필요할 때 — §6이 WCAG AA + Core Web Vitals 수치 제시

**부적합 / 과한 상황**
- §13의 6개 배제 영역
- 이미지 생성만 필요한 경우 → `imagegen-frontend-web`
- 모바일 앱 → `imagegen-frontend-mobile`
- 단일 미학 고정을 원할 때 → `minimalist-ui` / `industrial-brutalist-ui`
- **v1 산출물과의 호환이 필요한 기존 프로젝트** → `design-taste-frontend-v1`
- 짧은 작업 — 62항목 Pre-Flight Check가 과함

**형제 스킬 대신 이걸 고르는 기준**: `design-taste-frontend-v1`의 description이 "The current default is `design-taste-frontend` (v2 experimental)"라고 명시하므로, **신규 작업의 기본값이 이 스킬**이다. 단 "experimental" 표기가 남아 있다.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**
  - 이미지 자산 3단 폴백 (§4.8): "**Image-generation tool first** → **Real web images second** (picsum.photos) → **Last resort: tell the user**" + 플레이스홀더 슬롯 + 사용자에게 요청
  - 디자인 시스템: 공식 패키지가 없는 미학은 native CSS + Tailwind (§2.B)
  - 모션: 구현 불가 시 "drop the dial to 3 and ship a clean static page"
- **필요한 CLI/런타임/패키지**
  - **React / Next.js** (RSC 기본)
  - **Tailwind v4** (기본), v3는 기존 프로젝트만
  - **Motion** — `import { motion } from "motion/react"` (`framer-motion`은 레거시 별칭)
  - **`next/font`** 또는 `@font-face` 셀프 호스팅 — "**Never link Google Fonts via `<link>` in production**"
  - **아이콘 (우선순위)**: `@phosphor-icons/react` → `hugeicons-react` → `@radix-ui/react-icons` → `@tabler/icons-react`. `lucide-react`는 **discouraged**
  - 조건부: **GSAP + ScrollTrigger** (스크롤 하이재킹), **Three.js/WebGL** (캔버스), **Zustand/Jotai** (전역 상태)
  - §2.A의 13개 공식 디자인 시스템 (Appendix A에 설치 명령 전문)
  - **Simple Icons** (`https://cdn.simpleicons.org/{slug}/ffffff`) / **devicon** — 실제 브랜드 로고
  - **이미지 생성 도구** (있으면 필수 사용) — `generate_image`, MCP 이미지 도구, IDE 통합, OpenAI 이미지 도구 등
  - **Lighthouse** — "Run Lighthouse before declaring a page done"
- **네트워크**: 패키지 설치, 폰트, 이미지, Simple Icons CDN
- **비용 발생 지점**: 이미지 생성 도구 사용 시 (§4.8이 "MUST use it"으로 강제). 상한은 **원문에 없음.**
- **의존성 검증 (§3.F, mandatory)**: "Before importing ANY 3rd-party library, check `package.json`. If the package is missing, output the install command first. **Never** assume a library exists."

## 5. 워크플로우

### §0 BRIEF INFERENCE — **모든 것보다 먼저 (이 스킬의 고유 단계)**

**0.A 읽어야 할 신호 6개**
1. **Page kind** — landing (SaaS/consumer/agency/event), portfolio (dev/designer/creative studio), redesign (preserve vs overhaul), editorial/blog
2. **Vibe words** — "minimalist", "calm", "Linear-style", "Awwwards", "brutalist", "premium consumer", "Apple-y", "playful", "serious B2B", "editorial", "agency-y", "glassy", "dark tech"
3. **Reference signals** — URL, 스크린샷, 제품명, 경쟁 브랜드
4. **Audience** — "B2B procurement panel vs. design-conscious consumer vs. recruiter scanning a portfolio. **The audience picks the aesthetic, not your taste.**"
5. **Brand assets that already exist** — 로고, 색, 타입, 사진. 리디자인에서는 "starting material, not optional input"
6. **Quiet constraints** — "accessibility-first audiences, public-sector, regulated industries, trust-first commerce, kids' products. **These constraints OVERRIDE aesthetic preference.**"

**0.B Design Read 한 줄 출력 (필수)**
> "Before any code, state in one line: **\"Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<design system or aesthetic family>.\"**"

예시 3개 (원문):
- "Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind utilities + Geist + restrained motion."
- "Reading this as: solo designer portfolio for hiring managers, with an editorial / kinetic-type language, leaning toward native CSS + scroll-driven animation + custom typography."
- "Reading this as: redesign of a public-sector service site, with a trust-first language, leaning toward GOV.UK Frontend or USWDS."

**0.C 애매하면 질문 1개만**
"Ask exactly **one** clarifying question - **never a multi-question dump** - and only when the design read genuinely diverges." 예: *"Should this feel closer to Linear-clean or Awwwards-experimental?"*
"If you can confidently infer from context, **do not ask**."

**0.D Anti-Default Discipline**
"Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, infinite-loop micro-animations everywhere, **Inter + slate-900**. These are the LLM defaults."

### §1 THE THREE DIALS + 추론표 + 프리셋

다이얼 3개 (기본 **8 / 6 / 4**): `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`

**1.A Dial Inference (신호 → 다이얼 값)** — 이 컬렉션에서 가장 정교한 다이얼 추론표

| Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| "minimalist / clean / calm / editorial / Linear-style" | 5-6 | 3-4 | 2-3 |
| "premium consumer / Apple-y / luxury / brand" | 7-8 | 5-7 | 3-4 |
| "playful / wild / Dribbble / Awwwards / experimental / agency" | 9-10 | 8-10 | 3-4 |
| "landing page / portfolio / marketing site (default)" | 7-9 | 6-8 | 3-5 |
| "trust-first / public-sector / regulated / accessibility-critical" | 3-4 | 2-3 | 4-5 |
| "redesign - preserve" | match existing | +1 | match existing |
| "redesign - overhaul" | +2 | +2 | match existing |

**1.B Use-Case Presets** — 9개 용도별 프리셋 (Landing SaaS 7/6/4, Landing Agency 9/8/3, Portfolio Designer 8/7/3, Portfolio Developer 6/5/4, Editorial 6/4/3, Public-sector 3/2/5 등)

**1.C** "Cross-references throughout this document refer to these exact variable names - **never invent aliases** like `LAYOUT_VARIANCE` or `ANIM_LEVEL`."

### §2 BRIEF → DESIGN SYSTEM MAP — **실제 공식 패키지 매핑 (이 스킬 고유)**

**2.A 13개 매핑** (브리프 → 패키지 → 이유). 예:
- Microsoft/enterprise SaaS → `@fluentui/react-components` — "Official Fluent UI, Microsoft tokens, accessibility done"
- Public-sector UK → `govuk-frontend` — "**Legally / regulatorily expected**"
- Shopify app → `polaris.js` — "**Required** for Shopify admin UI"
- Modern SaaS 소유형 → shadcn/ui — "**never ship default state**"

**Honesty rule (원문)**: "if the brief reads as one of the systems above, install and use the **official** package. **Do not recreate its CSS by hand. Do not import a system's tokens but then override 90% of them.**"
**One system per project**: "Do not mix Fluent React with Carbon in the same tree."

**2.B 미학은 시스템이 아니다** — 8개 미학의 "정직한 구현" 방법. 특히:
> "**Apple Liquid Glass** | Apple documents this for Apple platforms only. **There is no official `liquid-glass.css`.** Web implementations are approximations using `backdrop-filter` + layered borders + highlights. **Label clearly as approximation.**"

### §11 REDESIGN PROTOCOL — 6단계

**11.A 모드 감지 (첫 행동)**: Greenfield / Redesign-Preserve / Redesign-Overhaul. "**Misclassifying the mode is the single biggest source of bad redesign output.**" 애매하면 한 번만 질문.

**11.B 감사 (변경 전)** 7항목: brand tokens / information architecture / content blocks / patterns to preserve / patterns to retire / **기존 사이트의 다이얼 판독** / **SEO baseline** — "**SEO migration is the #1 redesign risk.**"

**11.C 보존 규칙 5개**: IA 변경 금지(슬러그·앵커·nav 라벨 유지) / 브랜드 색 추출 후 §4.2 적용("A brand that is already purple **stays purple**") / 카피 보이스 보존 / **기존 접근성 성과 유지**("Do not regress focus states, alt text, keyboard nav, contrast") / **기존 애널리틱스 이벤트 존중**

**11.D 현대화 레버 (우선순위)**: 1. Typography refresh("biggest visual lift per unit of risk") → 2. Spacing & rhythm → 3. Color recalibration → 4. Motion layer → 5. Hero & key-section recomposition → 6. Full block replacement("only when unsalvageable")

**11.E 결정 트리**: IA·콘텐츠·SEO 건전 → targeted evolution (레버 1-4). "**~70% of value at ~40% of risk**" / 시각 부채가 구조적 → full redesign + 콘텐츠 보존 / 브랜드 자체 변경 → greenfield

**11.F 조용히 바꾸면 안 되는 것 6개**: URL 구조·라우트 슬러그 / 주 nav 라벨 / **폼 필드명·순서**("breaks analytics + autofill") / 브랜드 로고·워드마크 / 기존 법적·동의·쿠키 카피

### §14 FINAL PRE-FLIGHT CHECK — **62개 체크박스** (4개 컬렉션 전체 최다)
"**THIS IS NOT OPTIONAL. Run every box. If any box fails, the output is not done.**"
"If a single checkbox cannot be honestly ticked, **the page is not done**. Fix it before delivering."

전체 항목은 §6에서 주요 규칙과 함께 인용. 특징: **기계적으로 셀 수 있는 항목이 다수** — 예 "count instances of `uppercase tracking` micro-labels ... Count ≤ ceil(sectionCount / 3)?", "no 3+ consecutive sections with the same image+text-split layout?", "ZERO em-dashes"

**사용자 확인 요구 지점**: §0.C(브리프 애매 시 질문 1개) + §11.A(리디자인 모드 애매 시 질문 1개) + §4.8 3단 폴백의 마지막(이미지 요청). 강제 Checkpoint는 없다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

이 스킬은 **금지 목록의 규모와 구체성이 4개 컬렉션 전체 최고**다. §9가 7개 하위 섹션이며, §9.F "Production-Test Tells"는 실제 테스트에서 나온 실패 패턴을 카테고리별로 열거한다.

#### §9.G EM-DASH BAN — **이 스킬의 가장 강한 규칙**
> "**Em-dash (`—`) is COMPLETELY banned.** It is the LLM's signature stylistic crutch and it is **the #1 visual Tell in production tests**. There is **no \"limited use\" allowance, no \"natural language frequency\" allowance, no \"in body copy is fine\" allowance. None.**"
- Banned in headlines / eyebrows·labels·pills·button text·image captions·nav items / body copy / quote attribution
- "Banned in **en-dash form too (`–`)** when used as a separator"
- 허용되는 대시는 2개뿐: "Regular hyphen `-`" / "Minus sign in math (`-5°C`)"
- "If your output contains a **single** `—` or `–` anywhere visible to the user, **the output fails the Pre-Flight Check** and must be rewritten."
- 메타 설명까지 포함: "The agent has historically **ignored em-dash limits when phrased as \"use sparingly.\"** The phrasing here is **binary: zero em-dashes.**"

#### §4.1 SERIF DISCIPLINE — "가장 많이 테스트된 AI tell"
> "Serif is **very discouraged as the default font for any project**. \"It feels creative / premium / editorial\" is **NOT** a reason to reach for serif. The agent's default mental model that \"creative brief = serif\" is **the single most-tested AI tell in production rounds**."
- 허용 조건 2개 중 하나: 브랜드 브리프가 세리프 폰트를 명시 / 미학이 진정 editorial·luxury·publication·manuscript·heritage·vintage **AND** 왜 이 세리프가 이 브랜드에 맞는지 서술 가능
- **명시 금지 2개**: "Specifically BANNED as defaults: **`Fraunces`** and **`Instrument_Serif`** (the two LLM-favorite display serifs)."
- 기본 대안 (sans display): Geist Display, ABC Diatype, Söhne Breit, Cabinet Grotesk Display, Migra Sans, GT Walsheim, Inter Display, PP Neue Montreal — "Sans display fonts are not \"boring\" — they are the default **for the same reason black is the default in fashion**."
- 세리프가 정당화되면 **로테이션 풀 20개** 제시 + "do NOT reuse the same serif across consecutive projects"
- **EMPHASIS RULE**: "use **italic or bold of the SAME font**. Do NOT inject a random serif word into a sans headline ... **Mixed-family emphasis is amateur.**"

#### §4.2 PREMIUM-CONSUMER PALETTE BAN — **hex 단위 금지 (4개 컬렉션 전체에서 유일)**
> "**(mandatory, second-most-recurring AI-tell)** For premium-consumer briefs (cookware, wellness, artisan, luxury, heritage craft, DTC home goods, etc.) the LLM default is **warm beige/cream + brass/clay/oxblood/ochre + espresso/ink dark text**. Concretely banned hex families as default backgrounds and accents:"
- **Backgrounds 금지**: `#f5f1ea`, `#f7f5f1`, `#fbf8f1`, `#efeae0`, `#ece6db`, `#faf7f1`, `#e8dfcb`
- **Accents 금지**: `#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`, `#bc7c3a`, `#7d5621`
- **Text 금지**: `#1a1714`, `#1a1814`, `#1b1814`
- 근거: "**Every premium-consumer site you have ever shipped uses this exact palette. The brand becomes invisible.**"
- **대안 7개 (로테이션)**: Cold Luxury (silver-grey + chrome + smoke) / Forest (deep green + bone + amber) / Black and Tan / Cobalt + Cream / Terracotta + Slate / Olive + Brick + Paper / Pure monochrome + single saturated pop
- **Palette-rotation rule**: "if the previous premium-consumer project you generated used the beige+brass family, this one **MUST** use a different family."

#### §4.7 Layout Discipline — "Failing any of these is shipping broken work"
- **Hero MUST fit in the initial viewport**: 헤드라인 **최대 2줄**, 서브텍스트 **최대 20단어 AND 최대 3-4줄**, CTA는 스크롤 없이 보여야. "If you cannot describe the value-prop in 20 words of subtext, **the value-prop is unclear, not the rule too tight**."
- **Hero font-scale**: 기본 범위 `text-4xl md:text-5xl lg:text-6xl`, `text-6xl md:text-7xl`은 헤드라인 3-5단어일 때만. "**A 4-line hero headline is always a font-size error, never a copy-length error.**"
- **HERO TOP PADDING CAP**: 최대 `pt-24` (≈6rem). "More than that means the hero content floats halfway down the viewport and reads as a layout bug"
- **HERO STACK DISCIPLINE (max 4 text elements)**: eyebrow OR brand strip OR neither / headline / subtext / CTAs(1 primary + max 1 secondary)
  **BANNED in the hero**: "tiny tagline below CTAs / trust micro-strip / pricing teaser / feature bullet list / social-proof avatar row"
- **"Used by / Trusted by" logo wall belongs UNDER the hero, never inside it.**
- **Navigation MUST render on a single line on desktop.** "A two-line nav at desktop is broken design."
- **Navigation height cap: 80px max desktop, default 64-72px.**
- **BENTO CELL COUNT RULE**: "A bento grid has EXACTLY as many cells as you have content for. 3 items → 3 cells. 5 items → 5 cells. **If your grid has an empty cell in the middle or at the end, you planned wrong.** Re-shape the grid; do not paste a blank tile."
- **Section-Layout-Repetition Ban**: "that family can appear at most ONCE on the page. ... A landing page with 8 sections must use **at least 4 different layout families**."
- **ZIGZAG ALTERNATION CAP**: "Max **2** sections in a row with this image+text-split pattern. The **3rd** consecutive image+text split is a **Pre-Flight Fail**."
- **EYEBROW RESTRAINT (the #1 violated rule in production tests)**: "**Maximum 1 eyebrow per 3 sections.** Hero counts as 1." + **기계적 검증**: "count instances of `uppercase tracking` ... If count > **ceil(sectionCount / 3)**, the output fails." + "What to do instead of an eyebrow: **drop it entirely.**"
- **SPLIT-HEADER BAN**: "left big headline + right small explainer paragraph" 패턴 금지, 수직 스택으로
- **Bento Background Diversity**: "At least **2-3** cells in any multi-cell grid need real visual variation"
- **Mobile collapse must be explicit per section.** "No \"it'll work, Tailwind handles it\" assumptions."

#### §4.5 접근성 강제 (mandatory 3건)
- **BUTTON CONTRAST CHECK**: "White button + white text, `bg-white` CTA with `text-white` label, transparent button against the page background with no border → all banned. Audit every CTA: contrast ratio **WCAG AA min (4.5:1 for body, 3:1 for large text 18px+)**."
- **CTA BUTTON WRAP BAN**: "Button text MUST fit on one line at desktop. ... **3 words max for primary CTAs, ideally 1-2**"
- **NO DUPLICATE CTA INTENT**: "\"Get in touch\" + \"Contact us\" + \"Let's talk\" + \"Start a project\" + \"Start something\" + \"Reach out\" = all \"contact\" intent → **pick ONE label and use it everywhere**"
- **FORM CONTRAST CHECK**: "Form inputs, placeholder text, focus rings, helper text, and error text all pass WCAG AA"

#### §4.9 Content Density
- 기본 섹션 형태: "short headline (**≤ 8 words**) + short sub-paragraph (**≤ 25 words**) + one visual asset OR one CTA"
- **No data-dump sections**: 20행 출판 목록, 30행 수상 목록, 거대 가격 매트릭스 금지
- **Long lists need a different UI component**: 5개 초과 시 6개 대안 (2-column split / card grid / tabs·accordion / horizontal scroll-snap pills / carousel / marquee). "**A spec sheet with 10 rows + a hairline under every row is the WORST default.**"
- **Spec sheets (the Marrow-cookware pattern)**: 4개 구체적 대안 제시
- **COPY SELF-AUDIT (mandatory)**: 모든 가시 문자열을 재독. 4가지 플래그 — "Grammatically broken (\"free on its past\", \"two plans but one is honest\") / Has unclear referents / Sounds like AI hallucination (cute-but-wrong wordplay, forced metaphors, \"elegant nothing\" phrases) / **Reads like an LLM trying to sound thoughtful** (passive-aggressive humility, fake-craftsman labels, mock-poetic micro-meta)". 결론: "**AI-generated cute copy is worse than boring copy.**"
- **Fake-precise numbers**: `92%`, `4.1×`, `48k`, `5.8 mm`, `13.4 lb` — 실데이터/명시적 mock이 아니면 금지. "**Don't fake engineering precision the brand doesn't claim.**"
- **One copy register per page.**

#### §9.F Production-Test Tells — **8개 카테고리 (실제 테스트에서 추출)**
"These patterns came out of **real LLM-generated landing-page tests**."

*Hero & top-of-page*: "V0.6, v2.0, BETA, INVITE-ONLY PREVIEW, EARLY ACCESS, ALPHA" 히어로 버전 라벨 금지 / "Marrow · No. 01 · The 6-quart" 서브 eyebrow 금지

*Section numbering & micro-labels*: "`00 / INDEX`, `001 · Capabilities`, `002 · Featured commission`, `06 · how it works`, `05 · The honest table`" 금지 / "`01 / 4`-style pagination" 금지 ("If the user can count, they don't need the label") / "`Scroll · 001 Capabilities`" 금지 / "\"Index of Work, 2018 - 2026\"-style range labels" 금지

*Separators & dots*: "The middle-dot (`·`) is **rationed. Maximum 1 per line**" / "NO decorative colored status dots on every list/nav/badge"

*Em-dashes & typography flourishes*: em-dash 금지(§9.G) / "`<br>`-broken-and-italicized headlines" 금지 / "vertical rotated text" 금지 / "crosshair / hairline grid lines as decoration" 금지

*Fake product previews*: "**NO div-based fake product UI in the hero** (fake task list, fake terminal, fake dashboard built from styled divs). **It is the #1 LLM-design Tell.**" / "NO fake version footers (\"v0.6.2-rc.1\", \"last sync 4s ago · main\")"

*Marketing-copy Tells*: "\"Quietly in use at\" / \"Quietly trusted by\"" 금지 / "\"From the field\" / \"Field notes\" / \"Currently on the bench\" / \"On our desks\" / \"Loose plates\"" 금지 ("Reads as **performative-craftsman**") / "\"We respect the French ones\"-style mock-humble industry-references" 금지 / "weather / locale strips (\"LIS 14:23 · 18°C\")" 금지 / "micro-meta-sentences under eyebrows" 금지 / "generic step labels (\"Stage 1 / Stage 2\", \"Phase 01\")" 금지

*Pills, labels and version stamps*: "NO pills/labels/tags overlaid on images" / "**NO photo-credit captions as decoration** (`Field study no. 12 · Ines Caetano`, `Plate 03 · House archive`, `Frame XII · 35mm`)" / "NO version footers on marketing pages" / "NO \"Reservation 412 of 800\"-style live-stock counters"

*Decoration text strips*: "`BRAND. MOTION. SPATIAL.`, `TYPE / FORM / MOTION`, `DESIGN · BUILD · SHIP`, `ESTD. 2018 · LISBON`" 히어로 하단 스트립 금지 / "NO floating top-right sub-text in section headings"

*Lists, dividers and scoring*: "NO `border-t` + `border-b` on every row" / "NO scoring/progress bars with filled background tracks"

*Locale, time, scroll cues*: "Locale / city-name / time / weather strips are banned for **99% of briefs**" / "**Scroll cues are banned.** `Scroll`, `↓ scroll`, `Scroll to explore`, animated mouse-wheel icons. **If the user has not scrolled yet, they are looking at the hero. They know what scroll is.**" / "**ZERO decorative status dots by default.**"

#### §5.D Forbidden Animation Patterns
- "**`window.addEventListener(\"scroll\", ...)`** is banned." → Motion `useScroll()`, GSAP ScrollTrigger, IntersectionObserver, CSS `animation-timeline: view()`
- "Custom scroll progress calculations using `window.scrollY` in React state" 금지
- "`requestAnimationFrame` loops that touch React state" 금지
- "Do not wrap static content in `layout` props \"for safety\" - **it costs measurement work**."

#### §5 모션 정당화 (mandatory)
- "**MOTION MUST BE MOTIVATED**: Before adding any animation, ask: \"what does this animation communicate?\" Valid answers: **hierarchy / storytelling / feedback / state transition**. Invalid answer: \"it looked cool\". **GSAP everywhere because GSAP is available is amateur.** ... **If you cannot articulate the reason in one sentence, drop the animation.**"
- "**MARQUEE MAX-ONE-PER-PAGE**: Two or more marquees on the same page reads as **lazy filler**."
- "**\"Motion claimed, motion shown.\"** If `MOTION_INTENSITY > 4`, the page **must actually move**. ... Conversely, if you cannot ship working motion in the available scope, **drop the dial to 3** and ship a clean static page. **Never half-build motion that breaks.**"

#### §4.11 Page Theme Lock / §4.2 Color Consistency Lock / §4.4 Shape Consistency Lock — **3개 "Lock"**
- **Theme Lock**: "The page has ONE theme. **Sections do not invert.** ... **The user must not feel they walked into a different website mid-scroll.**" 예외 1회 허용 (명시적 "Color Block Story" / "Theme Switch on Scroll")
- **Color Consistency Lock**: "Once an accent color is chosen for a page, it is used on the WHOLE page. **A warm-grey site does not suddenly get a blue CTA in section 7.**"
- **Shape Consistency Lock**: "Pick ONE corner-radius scale ... **Round buttons in a square layout, or square cards on a pill-button page, is broken design.**"

#### 기타 주요 금지
- §4.6: "**No placeholder-as-label. Ever.**"
- §4.8: "**Div-based fake screenshots are banned.**" / "**Hero needs a real visual.** Text + gradient blob is not a hero - it's a placeholder." / "**Even minimalist sites need real images.** A pure-text page is not minimalism. **It is incomplete work.**" / "**LOGO-ONLY rule**: logo wall = logos and nothing else. Do NOT print industry / category labels below each logo"
- §4.10: 인용문 "**Max 3 lines**. Never 6." / "Attribution: name + role + (optionally) company. **Never name only (\"- Sarah\")**" / "Quote marks: use real typographic quotes ( " " ) or none at all. **Not straight ASCII**"
- §3.C: "**NEVER hand-roll SVG icons.**" / "**One family per project.**"
- §3.A: "**Never link Google Fonts via `<link>` in production.**"
- §3.B: "**NEVER** use `useState` to track continuous values driven by user input ... **`useState` re-renders the React tree on every change and collapses on mobile.**"
- §6.F: "**NEVER spam arbitrary `z-50` or `z-10`.**"
- §10: "**NEVER mix GSAP / Three.js with Motion in the same component tree. They fight over the same frames.**"

### 강제 규칙 — 수치 인용

**타이포그래피 (§4.1)**
- Display 기본: `text-4xl md:text-6xl tracking-tighter leading-none`
- Body 기본: `text-base text-gray-600 leading-relaxed max-w-[65ch]`
- 페어링 4세트: `Geist`+`Geist Mono` / `Satoshi`+`JetBrains Mono` / `Cabinet Grotesk`+`Inter Tight` / `GT America`+`IBM Plex Mono`
- **ITALIC DESCENDER CLEARANCE (mandatory)**: "`leading-[1]` or `leading-none` will clip the descender. Use **`leading-[1.1]` minimum** and add **`pb-1` or `mb-1`** reserve"

**컬러 (§4.2)**: "Max 1 accent color. Saturation **< 80%**" + 금지 hex 17개 + 대안 팔레트 7개

**레이아웃 (§3.E, §4.7)**
- 브레이크포인트: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`
- 컨테이너: `max-w-[1400px] mx-auto` 또는 `max-w-7xl`
- 전체 높이: `min-h-[100dvh]` (`h-screen` 금지)
- Hero: 헤드라인 ≤2줄 / 서브텍스트 ≤20단어 & ≤3-4줄 / top padding ≤ `pt-24` / 텍스트 요소 ≤4개
- Nav: 1줄, 높이 ≤**80px** (기본 **64-72px**)
- Eyebrow: ≤ **ceil(sectionCount / 3)**
- Zigzag: 연속 최대 **2**
- 레이아웃 패밀리: 8섹션에 최소 **4종**
- Bento 배경 다양성: 최소 **2-3** 셀

**콘텐츠 (§4.9, §4.10)**: 헤드라인 ≤**8단어** / 서브 문단 ≤**25단어** / 긴 목록 임계 **5개** / 인용 ≤**3줄** / CTA 라벨 **3단어 max, 이상적으로 1-2**

**다이얼 정의 (§7)**
- VARIANCE 8-10: `grid-template-columns: 2fr 1fr 1fr`, `padding-left: 20vw`
- MOTION 4-7: `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`
- DENSITY 1-3: `py-32`~`py-48` / 4-7: `py-16`~`py-24` / 8-10: `font-mono` for all numbers
- 모바일 붕괴: **< 768px** → `w-full`, `px-4`, `py-8`

**모션 (§5, §5.C)**
- Spring: `type: "spring", stiffness: 100, damping: 20`
- Stagger: `animation-delay: calc(var(--index) * 100ms)`
- Motion 예시: `duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1]`, `viewport={{ once: true, amount: 0.3 }}`
- GSAP 스티키 스택: `start: "top top"`, `pin: true`, `pinSpacing: false`, `scale: 0.92, opacity: 0.55`
- GSAP 수평 팬: `start: "top top"`, `end: () => \`+=${distance}\``, `scrub: 1`, `invalidateOnRefresh: true`
- Liquid Glass: `border-white/10` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`

**접근성·성능 (§6)**
- WCAG: **AA 최소** (본문 4.5:1, 큰 텍스트 18px+ 3:1), 히어로 카피는 **AAA 목표**
- Reduced motion: "**Any motion above `MOTION_INTENSITY > 3` MUST honor `prefers-reduced-motion`. This is non-negotiable.**"
- Core Web Vitals: **LCP < 2.5s / INP < 200ms / CLS < 0.1**
- 노이즈 필터: `fixed inset-0 z-[60] pointer-events-none`
- 다크모드: "**No pure `#000000` and no pure `#ffffff`** - use off-black (zinc-950) and off-white. **Pure values kill depth.**"

**Tactile Feedback**: `-translate-y-[1px]` 또는 `scale-[0.98]` on `:active`
**폼**: label 위, error 아래, `gap-2`

### 항목별 지침

**타이포그래피** — 4개 컬렉션 전체에서 **세리프 규율이 가장 강하다**. 기본값 금지 + 조건부 허용 2개 + 명시 금지 2개(Fraunces, Instrument_Serif) + 로테이션 풀 20개 + sans display 대안 8개 + 강조는 동일 폰트의 italic/bold + italic descender 클리어런스(mandatory).

**컬러** — **hex 단위로 금지한 유일한 스킬** (17개). 그리고 대안 팔레트를 7개 계열로 제시하고 **연속 프로젝트에서 같은 계열 재사용 금지**. Color Consistency Lock으로 페이지 전체 액센트 통일 강제.

**스페이싱** — 다이얼별 `py-` 범위 3단 + 히어로 top padding 상한 + nav 높이 상한 + 모바일 붕괴 값. spacing scale 체계 선언은 없으나 실용 값이 충분.

**모션** — 정당화 4가지 유효 답변 + "motion claimed, motion shown" + 마퀴 1개 제한 + GSAP 정본 스켈레톤 2개 + 경량 대안(Motion `whileInView`) + 금지 패턴 5개 + `prefers-reduced-motion` 비협상. **4개 컬렉션 중 `emilkowalski` 다음으로 모션 지침이 촘촘하다.**

**레이아웃** — §4.7이 이 스킬의 핵심. 히어로·nav·bento·섹션 반복·eyebrow·split-header·zigzag까지 **모두 정량 규칙**.

**접근성** — **이 컬렉션에서 가장 충실**: WCAG AA/AAA 수치 명시 + 버튼·폼 대비 감사 mandatory + `prefers-reduced-motion` 비협상 + `prefers-reduced-transparency` 폴백 + 다크모드 필수 + 리디자인 시 기존 접근성 성과 보존 + Core Web Vitals. 누락: 터치 타깃 크기, 키보드 트랩, ARIA 상세.

**성능** — §6 전체 + §3.B(useState 금지) + §5.D(스크롤 리스너 금지) + §6.E(노이즈/번들) + Lighthouse 실행 요구.

### 지침을 주는 방식 자체

1. **"모든 규칙은 맥락적"이라는 메타 원칙**: "Every rule below is **contextual**. **None of it fires automatically.**" 그리고 거의 모든 금지에 **Override 경로**가 붙는다 ("Override: Inter is acceptable when...", "Override: if the brand or brief explicitly asks for purple..."). **이 컬렉션의 다른 스킬들이 무조건 금지하는 것과 결정적으로 다른 태도.**
2. **브리프 추론을 첫 단계로 절차화 (§0)**: 6개 신호 → Design Read 한 줄 → 다이얼 추론표. "**The audience picks the aesthetic, not your taste.**"
3. **조용한 제약이 미학을 무효화**: "accessibility-first audiences, public-sector, regulated industries, trust-first commerce, kids' products. **These constraints OVERRIDE aesthetic preference.**"
4. **실제 공식 패키지 매핑 + 정직성 규칙 (§2)**: 13개 시스템을 브리프에 매핑하고 "Do not recreate its CSS by hand". 그리고 **미학과 시스템을 구분** — "Do not pretend an aesthetic trend is an official system."
5. **Apple Liquid Glass의 정직한 처리 (§2.B, Appendix C)**: "**There is no official `liquid-glass.css`.**" + 공식/비공식 구분 + "Label clearly as approximation". **4개 컬렉션에서 유일하게 "무엇이 공식이 아닌지"를 명시한 지점.**
6. **실제 테스트 결과를 지침으로 (§9.F)**: "These patterns came out of **real LLM-generated landing-page tests**." + 위반 빈도 순위 표기 — "the #1 violated rule in production tests" (eyebrow), "the single most-tested AI tell" (serif), "second-most-recurring AI-tell" (beige palette), "the #1 visual Tell" (em-dash), "the #1 LLM-design Tell" (div fake screenshot). **경험적 근거를 규칙에 부착한 유일한 스킬.**
7. **금지를 기계적으로 셀 수 있게 만듦**: eyebrow 개수 ≤ `ceil(sectionCount/3)`, zigzag 연속 ≤2, 레이아웃 패밀리 ≥4/8섹션, em-dash 0개, 마퀴 ≤1, 인용 ≤3줄, 서브텍스트 ≤20단어. **Pre-Flight Check가 실제로 수행 가능한 형태.**
8. **로테이션 규칙 (연속 프로젝트 간 반복 금지)**: 세리프("do NOT reuse the same serif across consecutive projects")와 팔레트("this one MUST use a different family"). **세션을 넘는 다양성을 요구한 유일한 사례** — 다만 실행 가능성은 §8 참조.
9. **3개 "Lock" (Theme / Color / Shape)**: 페이지 전체의 일관성을 명시적 잠금으로.
10. **정본 코드 스켈레톤 제공 (§5.A/B/C)**: GSAP 스티키 스택, 수평 팬, Motion 스크롤 리빌. 각각 "Critical points"로 흔한 실패(`start: "top center"` 대신 `"top top"`)를 지목. **실행 가능한 코드를 제공한 유일한 taste-skill.**
11. **리디자인을 1급 시민으로 (§11)**: 모드 감지 → 감사 7항목 → 보존 5규칙 → 레버 우선순위 6단 → 결정 트리 → 변경 금지 6항목. "SEO migration is the #1 redesign risk."
12. **범위 밖을 명시하고 대안 지목 (§13)**: 6개 영역 + 각각의 올바른 도구.
13. **카피 자체 감사 (§4.9)**: 4가지 플래그 유형에 실제 실패 문구 예시. "**AI-generated cute copy is worse than boring copy.**"
14. **부록으로 사실 근거 제공 (Appendix A/B/C)**: 13개 시스템의 실제 설치 명령 + 공식 문서 링크 60여 개 + Liquid Glass의 공식/비공식 구분. "Use them to ground decisions in **production reality, not training-data fiction**."
15. **62항목 Pre-Flight Check**: "THIS IS NOT OPTIONAL. Run every box."
16. **참조 어휘집 (§10, 54개 패턴명)**: "This is a **vocabulary, not a library**. The agent should KNOW these pattern names to **communicate about them**." 8개 카테고리 (Hero / Navigation / Layout / Cards / Scroll / Galleries / Typography / Micro-Interactions).
17. **Block Library 계약 (§12)**: 파일 구조 + frontmatter 스키마 + 필수 본문 8섹션 + 규율 4항목을 정의. "Do not freelance new blocks without following this schema."
18. **변수명 고정**: "never invent aliases like `LAYOUT_VARIANCE` or `ANIM_LEVEL`."

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**do not look templated**" (description) | §9의 7개 하위 섹션 + §9.F의 8개 실전 tell 카테고리 + 62항목 체크 |
| "**anti-slop**" | em-dash 0개 / 세리프 기본값 금지 / 베이지+브래스 hex 17개 금지 / eyebrow ≤N/3 / div 가짜 스크린샷 금지 |
| "**creative brief = serif**" (회피할 정신 모델) | "the single most-tested AI tell in production rounds" → sans display 8개 대안 |
| "**Sans display fonts are not \"boring\"**" | "they are the default **for the same reason black is the default in fashion**" |
| "**The brand becomes invisible**" | 프리미엄 소비재 브리프에서 매번 같은 베이지+브래스 팔레트를 쓴 결과 |
| "**Mixed-family emphasis is amateur**" | sans 헤드라인에 세리프 단어 삽입 → 같은 폰트의 italic/bold |
| "**a font-size error, never a copy-length error**" | 4줄 히어로 헤드라인의 진단 |
| "**reads as a layout bug, not as intentional space**" | 히어로 top padding > `pt-24` |
| "**broken design**" | 2줄 nav (데스크톱) / 사각 레이아웃의 원형 버튼 / 다크 페이지 중간의 라이트 섹션 |
| "**you planned wrong**" | bento에 빈 셀이 있음 |
| "**lazy filler**" | 한 페이지에 마퀴 2개 이상 |
| "**amateur**" | "GSAP everywhere because GSAP is available" |
| "**performative-craftsman**" | "From the field" / "Field notes" / "Currently on the bench" / "Loose plates" |
| "**mock-poetic micro-meta**" | "elegant nothing" 류의 카피 |
| "**Reads like an LLM trying to sound thoughtful**" | "passive-aggressive humility, fake-craftsman labels" |
| "**AI-generated cute copy is worse than boring copy**" | 불확실하면 "plain functional sentence"로 교체 |
| "**They know what scroll is**" | 스크롤 큐 금지의 근거 |
| "**If the user can count, they don't need the label**" | `01 / 4` 페이지네이션 금지의 근거 |
| "**A pure-text page is not minimalism. It is incomplete work.**" | 미니멀 사이트도 최소 2-3개 실제 이미지 필요 |
| "**Text + gradient blob is not a hero - it's a placeholder.**" | 히어로에 실제 비주얼 필수 |
| "**Motion claimed, motion shown**" | MOTION_INTENSITY > 4면 실제로 움직여야, 못 하면 다이얼을 3으로 |
| "**~70% of value at ~40% of risk**" | 리디자인의 targeted evolution (레버 1-4) |
| "**Pure values kill depth**" | 다크모드에서 `#000000`/`#ffffff` 금지 |
| "**They fight over the same frames**" | GSAP/Three.js와 Motion 혼용 금지의 근거 |
| "**walked into a different website mid-scroll**" | Theme Lock 위반의 체감 |
| "**production reality, not training-data fiction**" | 부록의 실제 설치 명령·공식 링크 제공 이유 |

## 7. 산출물

- **형식**: React / Next.js (RSC 기본) + Tailwind v4 + Motion 코드. 또는 §2.A의 공식 디자인 시스템 기반 코드.
- **필수 선행 출력**: §0.B의 Design Read 한 줄 ("Reading this as: …")
- **다이얼 명시**: Pre-Flight — "Dial values explicit and reasoned from the brief, **not silently using baseline**"
- **의존성 부재 시**: 설치 명령을 먼저 출력
- **이미지 부재 시**: 플레이스홀더 슬롯 (`<!-- TODO: hero product photo, 1600x1200 -->`) + 응답 끝에 "This page needs real images at: \[list of placements\]. Please generate or provide them."
- **파일 저장 위치 / 네이밍 규칙**: 코드에 대해서는 **원문에 명시 없음.** 단 §12.A가 Block Library의 경로 구조(`skills/taste-skill/blocks/<category>/<name>.md`)를 정의.
- 출력 전 §14의 62항목 체크 통과.

## 8. 주의점 / 한계

- **Block Library가 비어 있다 (가장 큰 실질적 공백)**: §12가 파일 구조·frontmatter 스키마·필수 본문 8섹션을 상세히 정의하지만, "**Status:** schema defined here. **Blocks will be added iteratively.**"라고 명시되어 있고 실제 `blocks/` 디렉토리는 **존재하지 않는다** (스킬 폴더에 SKILL.md 하나뿐). 즉 §10의 54개 패턴 어휘가 가리키는 구현체가 없다. §14의 체크리스트도 Block Library 통과를 요구하지 않으므로 치명적이지는 않으나, 문서의 상당 부분이 미완 계약이다.
- **경로 불일치**: §12.A가 `skills/taste-skill/blocks/`를 지정하는데, 실제 스킬 이름은 `design-taste-frontend`다. 문서 내 경로가 갱신되지 않았다.
- **로테이션 규칙의 실행 불가능성**: "if the **previous** premium-consumer project you generated used the beige+brass family, this one MUST use a different family" / "do NOT reuse the same serif **across consecutive projects**". LLM은 세션 간 기억이 없으므로 **이 규칙을 스스로 지킬 수단이 없다.** 상태를 저장하는 장치가 원문에 없다.
- **62항목 체크리스트의 실효성**: "Run every box. If any box fails, the output is not done." 항목 수가 많아 실제로 전부 수행되는지 확인할 수 없고, 자동 검증 스크립트가 없다. 다만 항목 상당수가 **기계적으로 셀 수 있는 형태**(em-dash 0, eyebrow ≤N/3, zigzag ≤2)라는 점이 다른 스킬 대비 강점이다.
- **em-dash 전면 금지의 부작용**: 한국어·일본어 등 전각 문장부호를 쓰는 언어나, em-dash가 표준 조판인 출판물 스타일에는 맞지 않는다. 원문은 "binary: zero em-dashes"로 예외를 두지 않는다. 또한 이 규칙은 **디자인이 아니라 문장부호**이므로, 브랜드 카피가 em-dash를 쓰는 경우 충돌한다 — Override 경로가 없는 유일한 규칙이다.
- **"experimental" 표기**: `design-taste-frontend-v1`의 description이 이 스킬을 "v2 **experimental**"로 지칭한다. 기본값이면서 실험 상태라는 이중 위치가 해소되지 않았다.
- **접근성의 남은 공백**: WCAG 대비, reduced motion, reduced transparency, 다크모드, Core Web Vitals까지 다루지만 **터치 타깃 최소 크기(44px 등)가 없다.** 키보드 내비게이션은 리디자인 보존 규칙에만 등장하고, ARIA·포커스 순서·스킵 링크는 없다 (같은 컬렉션의 `redesign-existing-projects`가 skip-link를 다루는 것과 대비).
- **이미지 생성 강제의 비용**: §4.8이 "If ANY image-gen tool is available ... you **MUST** use it to create section-specific assets"라고 요구한다. 섹션마다 이미지를 생성하면 비용이 누적되는데 **상한·확인 절차가 없다.**
- **§13 배제와 §2.A 매핑의 긴장**: §13은 대시보드를 범위 밖으로 밀어내면서 "use Fluent, Carbon, Atlassian, or Polaris from Section 2.A"라고 안내한다. 그런데 §2.A는 이 스킬 안에 있고 그 시스템들의 사용법을 다룬다. 즉 경계가 "이 스킬을 쓰지 마라"인지 "§2.A만 쓰라"인지 모호하다.
- **분량**: 87KB / 1,206줄. 매 호출마다 전체가 로드되며, references/ 분할이 없다. garden-skills의 `web-design-engineer`(35KB + 34개 참조 파일, 점진 로딩)와 대비되는 구조적 선택이다. 특정 작업(예: 리디자인만)에 필요 없는 부분이 항상 함께 들어온다.
- **컬렉션 내 중복**: `design-taste-frontend-v1`과 다이얼·아키텍처·AI Tells·성능 가드레일이 겹치고, `redesign-existing-projects`와 리디자인 감사·금지 목록이 겹치며, `stitch-design-taste`와 금지 목록이 겹친다. 역할 분담이 description에만 있고 본문 상호 참조가 없다.
- **강한 경고 지점**:
  - "**Every rule below is contextual. None of it fires automatically.**"
  - "**Em-dash (`—`) is COMPLETELY banned.** ... The phrasing here is **binary: zero em-dashes.**"
  - "Serif ... **is the single most-tested AI tell in production rounds**."
  - "**Every premium-consumer site you have ever shipped uses this exact palette. The brand becomes invisible.**"
  - "**EYEBROW RESTRAINT (the #1 violated rule in production tests)**"
  - "**NO div-based fake product UI in the hero** ... **It is the #1 LLM-design Tell.**"
  - "**A pure-text page is not minimalism. It is incomplete work.**"
  - "**Motion claimed, motion shown.**" / "**Never half-build motion that breaks.**"
  - "**Any motion above `MOTION_INTENSITY > 3` MUST honor `prefers-reduced-motion`. This is non-negotiable.**"
  - "**SEO migration is the #1 redesign risk.**"
  - "**Misclassifying the mode is the single biggest source of bad redesign output.**"
  - "**THIS IS NOT OPTIONAL. Run every box.**"
  - "There is **no official `liquid-glass.css`**."
- **검증 장치 (4개 컬렉션 전체 최고 수준)**: §14의 **62항목** Pre-Flight Check + **기계적으로 계산 가능한 임계값 다수**(em-dash 0, eyebrow ≤ ceil(N/3), zigzag ≤2, 레이아웃 패밀리 ≥4, 마퀴 ≤1, 인용 ≤3줄, nav ≤80px, 서브텍스트 ≤20단어) + WCAG AA 수치 + Core Web Vitals 수치 + Lighthouse 실행 요구 + COPY SELF-AUDIT + 3개 Lock. **다만 여전히 전부 자기 선언이며 실행 가능한 린터·테스트는 제공되지 않는다.** Lighthouse만이 외부 도구에 위임된 유일한 검증이다.
