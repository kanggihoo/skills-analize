# web-design-engineer 분석

## 1. 개요

- **원본 경로**: `skills-collections/garden-skills/web-design-engineer/`
- **핵심 파일**: `SKILL.md` (35,406 bytes)
- **보조 파일** (총 34개):
  - `references/` 8개 정책·가이드: `design-calibration.md`, `redesign-protocol.md`, `failure-patterns.md`, `browser-acceptance.md`, `block-library.md`, `advanced-patterns.md`, `design-directions.md`, `critique-guide.md`
  - `references/style-recipes/` — `INDEX.md` + **25개 단일 레시피 파일**: apple-hig, muji-kenya-hara, aesop, linear, vercel-mesh, raycast, notion-pre-ai, pentagram, bloomberg-terminal, bloomberg-businessweek-turley, tufte-dataink, vignelli-swiss-helvetica, dieter-rams-braun, mid-century-modern, monocle-magazine, stripe-press, mailchimp-freddie, headspace-meditation, are-na, balenciaga-post-2017, field-io, active-theory, resn-storytelling, nyt-the-daily, y2k-retrofuturism
  - `agents/openai.yaml` — 하네스 통합 설정 (`allow_implicit_invocation: true`)
  - `manifest.json`, `README.md`, `README.zh-CN.md`
- **성격**: **HTML/CSS/JS/React로 브라우저 렌더링 시각 산출물을 만드는 종합 디자인 엔지니어링 스킬**. 이 컬렉션에서 유일하게 문서가 영어로 작성됨. 7단계 워크플로우 + 3개 Checkpoint + 5차원 크리틱 + 25개 앵커 레시피.

원문 자기 규정: "This skill positions the Agent as a top-tier design engineer ... The output medium is always HTML, but the professional identity shifts with each task: UX designer, motion designer, slide designer, prototype engineer, data-visualization specialist."

핵심 철학 (원문): "**The bar is \"stunning,\" not \"functional.\" Every pixel is intentional, every interaction is deliberate. Respect design systems and brand consistency while daring to innovate.**"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Build or redesign polished browser-rendered visual artifacts with HTML/CSS/JavaScript/React: pages, dashboards, prototypes, slide decks, animations, UI mockups, and data visualizations. Use for visual front-end creation, design-system exploration, design critique, or explicit browser acceptance / QA of a web artifact. Not for back-end, CLI, non-visual coding, source-to-longform article conversion, or narration-driven click-through video presentations."

**매칭되는 사용자 발화**
- "랜딩 페이지 만들어줘", "대시보드 디자인해줘", "프로토타입", "슬라이드 덱", "애니메이션", "UI 목업", "데이터 시각화"
- "Linear 스타일로 만들어줘" (앵커 지정)
- "이거 좀 봐줘 / 예쁜가?" — `design critique`
- "브라우저에서 검증해줘 / 验收 / QA" — `explicit browser acceptance`
- "make something nice", "I don't know what style I want" — Design Direction Advisor 모드로 분기

**명시적 배제 + 라우팅** (description 마지막 문장)
- back-end, CLI, non-visual coding
- **source-to-longform article conversion** → `beautiful-article`
- **narration-driven click-through video presentations** → `web-video-presentation`
- 본문에서 재확인: "Route the last two to their dedicated skills when available." **이 컬렉션에서 유일하게 형제 스킬로 라우팅하는 스킬.**

`allowed-tools` / `metadata`: frontmatter에는 **원문에 명시 없음**. 별도로 `agents/openai.yaml`이 존재:
```yaml
interface:
  display_name: "Web Design Engineer"
  short_description: "Build and refine polished browser-rendered visual experiences"
  default_prompt: "Use $web-design-engineer to design and build a polished visual web artifact from my brief."
policy:
  allow_implicit_invocation: true
```

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 랜딩 페이지·대시보드·프로토타입·슬라이드·시각화를 **처음부터** 만들 때
- 브랜드가 있는 작업 — Asset Protocol이 로고·제품 이미지·UI 스크린샷 확보를 강제
- 기존 UI를 확장·재디자인할 때 — Extension / Redesign·Preserve / Redesign·Overhaul 3분류 + `redesign-protocol.md`
- **방향이 없을 때** — Design Direction Advisor가 6개 학파에서 3개 방향을 제시
- **참조 대상이 명확할 때** — 25개 앵커 레시피가 구체적 팔레트·타이포·스페이싱·radius·shadow·모션 값을 즉시 제공
- 디자인 비평이 필요할 때 — 5차원 0–10점 채점
- 브라우저 실행 검증이 필요할 때 — `browser-acceptance.md` (단, **명시 요청 시에만**)

**부적합 / 과한 상황**
- 백엔드·CLI·데이터 처리·순수 로직
- 소스 자료 → 장문 HTML 기사 → `beautiful-article`
- 나레이션 기반 클릭스루 영상 프레젠테이션 → `web-video-presentation`
- 사소한 수정 — Fallback 섹션의 "When to skip"에 명시: "Small tweaks or explicit tool calls (\"convert this HTML to PDF\") → skip"
- 사용자가 이미 Figma/스크린샷/브랜드 참조를 준 경우 Direction Advisor는 건너뛸 것

**형제 스킬 대신 이걸 고르는 기준**: 산출물이 **읽는 기사**인가(→ `beautiful-article`), **보는·조작하는 웹 산출물**인가(→ 이 스킬), **재생되는 영상**인가(→ `web-video-presentation`), **래스터 이미지**인가(→ `gpt-image-2`).

## 4. 외부 의존성

- **API 키**: **불필요.** grep 결과 API 키·환경변수 참조 없음 (`manifest.json`의 `gemini-cli` 호환 문자열만).
- **폴백 모드**
  - 방향 없음 → **Design Direction Advisor** (6학파 3선택)
  - 참조 없음 → "explicitly tell the user that \"no reference will affect the final quality\"" + 임시 시스템 수립 또는 레시피 선택
  - 로고 확보 실패 → "**stop and ask the user**, don't proceed with a colored rectangle"
  - 아이콘/이미지/데이터 없음 → **Placeholder Philosophy** (가짜 대신 플레이스홀더)
  - 애셋 소싱 실패 체인: "official press kit / brand site → official launch-video frames (`yt-dlp` + `ffmpeg`) → App Store / Google Play screenshots → Wikimedia Commons / Apple Press → AI-generated from official references → honest \"asset pending\" placeholder"
- **필요한 CLI/런타임/패키지**
  - **WebSearch** — Step 0의 사실 검증에 필수 ("verified via WebSearch, not assumed")
  - **브라우저 자동화** — Step 6의 executable acceptance (명시 요청 시)
  - **`yt-dlp` + `ffmpeg`** — 공식 런치 영상에서 프레임 추출 (애셋 소싱 2순위)
  - **CDN 리소스** (조건부): React + ReactDOM + Babel (pinned + integrity), Chart.js, D3 v7, Google Fonts, Popmotion(`11.0.5`)
  - Node/빌드 도구는 **불필요** — 산출물이 단일 HTML + 인라인 Babel
- **네트워크**: Step 0 검색, CDN 로드, 애셋 소싱에 필요
- **비용 발생 지점**: 유료 API 없음. WebSearch·브라우저 실행의 토큰/시간 비용만.

## 5. 워크플로우

### Step 0 — Verify Facts Before Anything Else (**최우선 게이트**)
"**Highest priority — runs before clarifying questions.**"

**트리거 조건 (하나라도 해당)**:
- 확실치 않은 제품/SDK/라이브러리 이름이 등장 (예: 새 기기, 최근 발표 모델)
- 시간 민감한 릴리스 타임라인 / 버전 / 스펙
- **자기 검열 신호**: "You catch yourself thinking \"I think it's…\" / \"should still be…\" / \"probably not released yet\" / \"I don't think that exists\""
- 특정 회사·제품용 자료 요청

**금지 문구 (사전 검색 없이)**: "*\"I think X hasn't released yet\" / \"X is currently version N\" / \"X probably doesn't exist\" / \"As I recall, X's specs are…\"*"

검색 결과가 없거나 모호하면 → 사용자에게 질문. "Don't guess."

### Step 1 — Understand the Requirements (**질문 여부를 맥락으로 결정**)
"**Do not mechanically fire off a long list of questions every time**"

| Scenario | Ask? |
|---|---|
| "Make a deck" (no PRD, no audience) | ✅ Ask extensively: audience, duration, tone, variants |
| "Use this PRD to make a 10-min deck for Eng All Hands" | ❌ Enough info — start building |
| "Turn this screenshot into an interactive prototype" | ⚠️ Only ask if the intended interactions are unclear |
| "Make 6 slides about the history of butter" | ✅ Too vague — at least ask about tone and audience |
| "Design onboarding for my food-delivery app" | ✅ Ask heavily: users, flows, brand, variants |
| "Recreate the composer UI from this codebase" | ❌ Read the code directly — no questions needed |
| "Make me something nice / I don't know what style I want" | ⚡ Switch to **Design Direction Advisor** |

탐색 영역: Product context / Output type / Variation dimensions / Constraints. "pick as needed — **no fixed count required**"

### Step 2 — Gather Design Context (**우선순위 5단**)
"Good design is rooted in existing context. **Never start from thin air.**"
1. 사용자가 능동 제공한 리소스 (screenshots / Figma / codebase / UI Kit / design system) → 정독 + 토큰 추출
2. 사용자 제품의 기존 페이지 → 검토 가능 여부를 능동적으로 질문
3. 업계 베스트 프랙티스 → 어느 브랜드·제품을 참조할지 질문
4. 사용자가 앵커를 지목 ("Linear-style" / "Aesop feeling" / "MUJI quietness") → `references/style-recipes/<anchor>.md` **단일 파일**만 로드
5. 완전 백지 → "no reference will affect the final quality"를 명시 고지 + 3가지 대안

참조 분석 시 초점: "color system, typography scheme, spacing system, border-radius strategy, shadow hierarchy, motion style, component density, copywriting tone"

**핵심 규칙**: "**Code ≫ Screenshots**: When the user provides both a codebase and screenshots, invest your effort in reading source code and extracting design tokens rather than guessing from screenshots"

### Step 2 부속 — Asset Protocol (**브랜드 작업 시**)
"**Asset > Spec.** A brand's identity is \"being recognized.\" Recognition is driven by assets in this order — **not by hex codes**"

| Asset | Recognition contribution | When required |
|---|---|---|
| **Logo** (SVG/PNG, light & dark) | Highest | **Any brand task — non-negotiable** |
| **Product imagery** (hero, detail, in-context) | Very high | **Physical products** |
| **UI screenshots** (latest, real data scrubbed) | Very high | **Digital products** |
| Color tokens | Medium — auxiliary | Auxiliary |
| Typography | Low | Auxiliary |

**Hard rules (원문)**:
- "**Don't substitute CSS silhouettes / hand-drawn SVG for real product imagery** — the result is generic \"tech aesthetic\" any brand could wear (zero recognition value, **the #1 way branded work fails**)"
- "**Logo is non-negotiable** — if you can't source it after a real attempt, **stop and ask the user**, don't proceed with a colored rectangle"
- "**Color hex codes alone are not a brand** — they're the cheapest part of the identity"
- "Capture all assets in a `brand-spec.md` file ... All HTML must reference these via `<img src=\"…\">`, not redraw them"

### Step 2 부속 — 기존 UI에 추가할 때
"Classify the task as **Extension**, **Redesign · Preserve**, or **Redesign · Overhaul** before editing." → `redesign-protocol.md` 읽고, 기존 시각 어휘와 보호 계약(protected contracts)을 감사한 뒤 "**choose the smallest change mode that satisfies the request**". "New elements in Extension mode should be **indistinguishable from the originals**."

### Step 2b — Design Read + Five Dials
```yaml
Design Read:
  artifact: [landing / dashboard / prototype / slides / visualization / ...]
  audience: [primary audience]
  visual-language: [specific family, not "modern / clean"]
  mode: [greenfield / extension / preserve / overhaul]
  visual-variance: [1-10]
  motion-intensity: [1-10]
  information-density: [1-10]
  asset-dependence: [1-10]
  brand-fidelity: [1-10]
```
"Use the dials as **decision variables, not decorative scores**. They must affect layout variation, motion, content per viewport, real-asset effort, and preservation strictness." → `design-calibration.md`

### Step 3a — Position Four Questions Before Picking a System
**시스템 선택 전 4개 질문** (아티팩트별 / 슬라이드별 / 화면별 / 씬별):
- **Narrative role**: Hero / transition / data / pull-quote / closing?
- **Viewing distance**: 10cm phone / 1m laptop / 10m projector?
- **Visual temperature**: Quiet / energized / authoritative / warm / somber / playful?
- **Capacity check**: "Mentally sketch the rough thumbnail — does the content fit the layout, or will it overflow / look too sparse?"

"**Picking aesthetics in a vacuum is the root cause of generic output.**"

### Step 3 — Declare the Design System Before Writing Code
```markdown
Design Decisions:
- Design Read: [one-line synthesis + five dials]
- Anchor / recipe (if any): [e.g., "linear" → `references/style-recipes/linear.md`, or "custom"]
- Color palette: [primary / secondary / neutral / accent]
- Typography: [heading font / body font / code font]
- Spacing system: [base unit and multiples]
- Border-radius strategy: [large / small / sharp]
- Shadow hierarchy: [elevation 1–5]
- Motion style: [easing curves / duration / trigger]
```
"If you picked a recipe ... paste its concrete palette / typography / spacing / radius / shadow / motion values straight into the block above — that catalog exists so you don't have to invent these on the fly, **which is the leading cause of AI-default Inter + #3b82f6 mush**. **Load only the one recipe file you're using**, not the whole catalog."

🛑 **Checkpoint 1**: "After articulating Steps 3a + 3, stop. Tell the user \"I plan to use this system. Confirm and I'll start the v0.\" Then **actually wait** — don't say it and immediately start coding."

### Step 4 — Show a v0 Draft Early
"**Don't hold back a big reveal.**"
- v0의 목적: "**let the user course-correct early** — Is the tone right? Is the layout direction right? Are the variant directions right?"
- 포함: "core structure + color/typography tokens + key module placeholders (with explicit markers like `[image]` `[icon]`) + your list of design assumptions"
- **불포함**: "content details, complete component library, all states, motion"
- 근거: "A v0 with assumptions and placeholders is more valuable than a \"perfect v1\" that took 3x the time — **if the direction is wrong, the latter has to be scrapped entirely.**"

🛑 **Checkpoint 2**: "Push v0 to the user before continuing."

### Step 5 — Full Build
🛑 **Checkpoint 3**: "When you hit a non-trivial decision point during the build (interaction approach choice, content variant, fundamental layout shift), pause and confirm again — **don't silently push through**."

### Step 6 — Verification (**2단 분기**)
- **항상**: 경량 **Pre-delivery Checklist** (코드/디자인 자체 점검, 브라우저 실행 불필요)
- **조건부**: executable browser acceptance harness — "**only when the user explicitly asks** for acceptance / 验收, QA, browser testing / 浏览器测试, visual regression, responsive testing / 响应式检查, cross-viewport verification, or equivalent hands-on validation. **Do not infer this request merely from \"build,\" \"finish,\" \"polish,\" or \"verify your work.\"**" → `browser-acceptance.md`

`browser-acceptance.md`의 Trigger Gate가 이를 재확인하고, acceptance contract 항목을 명시: "Entry URL or local command / Critical routes / screens / Primary interaction path / Required viewport(s) / Target browser(s) / Whether the user wants evidence, repairs, or report-only QA". 그리고 "**Do not replace the stack or install a new test framework unless necessary and authorized.**"

### Step 7 — Critique on Request (or Self-Check)
트리거: "review this", "is it good?", "score this", "好不好看", 또는 배포 전 자체 점검

**5차원 크리틱**:

| Dimension | What to evaluate |
|---|---|
| **Philosophy alignment** | Does every detail trace back to the chosen design direction? Or has it drifted into a generic mishmash? |
| **Visual hierarchy** | Does the eye flow where intended? Squint test passes? Title/body ratio ≥ 2.5×? |
| **Craft quality** | Pixel-level alignment, consistent spacing system (e.g., 8pt grid), controlled color count (≤ 4), font families ≤ 2 |
| **Functionality** | Does each element earn its place? "If I delete this, does the design get worse?" If no → delete |
| **Originality** | Avoids clichés while staying coherent? Any "unexpected but right" decisions, or pure template? |

산출: "Score each 0–10; report overall score, dimension scores, Keep, severity-sorted Fixes, and **three Quick Wins**. **Critique the design, not the designer.**" → `critique-guide.md`

### Fallback: Design Direction Advisor
**트리거**: 진짜 애매한 요청 / 디자인 맥락 없음 + 참조 제공 불가 / 명시적 스타일 추천 요청
**건너뛸 때**: Figma·스크린샷·브랜드 참조 제공 / 특정 방향 명시 / 사소한 수정

**메커니즘**: "**3 differentiated directions, not 10 questions**"
각 방향에 반드시 포함:
- "**A named designer or studio reference** (e.g., \"Pentagram-style information architecture\", not just \"minimalist\")"
- "**2–3 lines of why this direction fits the user's context**"
- "**Signature visual cues** (3–4 concrete details: color, typography, layout, motion)"
- 선택: "one famous touchstone work"

**6개 학파 라이브러리** (원문):

| School | Vibe | Sample anchors | Best for |
|---|---|---|---|
| **Information architecture** | Rational, data-driven, restrained | Pentagram, Edward Tufte, Massimo Vignelli, Bloomberg Terminal | Safe / professional / B2B / data products |
| **Editorial / minimalist** | Whitespace, refined typography, quiet luxury | Kenya Hara (MUJI), Apple HIG, Dieter Rams, Aesop | Premium / high-end / quiet |
| **Modern tool / Builder SaaS** | Hairline detail, warm dark, single accent, monospace chips | Linear, Vercel, Raycast, Notion | Developer tools / B2B SaaS / AI tools / infra |
| **Motion / experimental** | Bold, generative, sensory | Field.io, Active Theory, Resn | Distinctive / launch films / brand moments |
| **Brutalist / raw** | Anti-design, honest, unpolished | Balenciaga, Are.na, Bloomberg Businessweek covers | Differentiated / confident / counter-culture |
| **Warm humanist** | Approachable, organic, hand-touched | Mailchimp (early), Stripe Press, Headspace | Lifestyle / education / approachable B2C / wellness |

❌ **Hard rule**: "**never recommend 3 picks from the same row** — the user can't tell them apart and the contrast that makes the choice meaningful collapses."

**사용자 확인 요구 지점 (총 3곳 + 조건부)**: Checkpoint 1(디자인 시스템 승인), Checkpoint 2(v0 승인), Checkpoint 3(빌드 중 비자명한 결정), 그리고 Step 0의 검색 실패 시 / 로고 확보 실패 시 / 애매한 피드백 시.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

**AI 클리셰 방지의 논리 (원문의 WHY)**
"Anti-cliché is **not aesthetic snobbery** — it's protecting the user's brand recognition. The reasoning chain:
1. The user wants their brand to be recognized
2. AI defaults = average of training data = all brands averaged together = **no brand recognized**
3. So AI-default output dilutes the user's identity into \"yet another AI-generated page\"
This is why the only legitimate exception to every anti-cliché rule below is **\"the brand spec uses it\"** — at that point it stops being slop and becomes a brand signature."

**클리셰 표 (전문)** — `Pattern / Why it's slop / When it's actually fine` 3열

| Pattern | Why it's slop | When it's actually fine |
|---|---|---|
| Aggressive purple → pink → blue gradient | The "tech vibe" formula AI training data converged on; on every SaaS / AI / web3 landing page | The brand itself uses it, or the task is satirizing this aesthetic |
| Rounded card + colored left-border accent | Material/Tailwind era leftover; now visual noise in every dashboard | The user explicitly asks, or the brand spec preserves it |
| Emoji as icon substitute | "Not professional → slap emoji on it" tic from training data | The brand uses emoji (Notion, Slack, early Linear), or audience is kids / casual |
| SVG-drawn imagery (faces, scenes, objects) | AI-drawn SVG humans always have misaligned features and feel cheap | **Almost never** — use real images, AI-generated images, or honest placeholder |
| CSS silhouette substituting for real product imagery | Generic "tech aesthetic" — same look across every brand | **Never** for branded work — go fetch the real product image |
| Inter / Roboto / Arial / Fraunces / system-ui as display | Too common; reads as "demo page" rather than "designed product" | The brand spec specifies these (and usually with custom adjustments) |
| Cyber-neon on `#0D1117` dark | GitHub-dark cosplay; baseline noise in dev-tool clones | The brand actually lives in this aesthetic |
| Fabricated stats, fake logo walls, dummy testimonials | Damages credibility; users notice when numbers don't match reality | **Never** — use placeholders that say "real data needed" |

"These are baseline examples, **not the whole taxonomy**." → `failure-patterns.md`. 그리고 처리 방식을 규정: "Treat each pattern as **default → reason → exceptions → detection → repair**, not as an unconditional aesthetic ban."

**Emoji 규칙**
"**No emoji by default.** Only use emoji when the target design system/brand itself uses them (e.g., Notion, early Linear, certain consumer brands), and match their density and context precisely."
- ❌ "Using emoji as icon substitutes (\"I don't have an icon library, so I'll use 🚀 ⚡ ✨ as fillers\")"
- ❌ "Using emoji as decorative filler"
- ✅ 아이콘 없으면 플레이스홀더 / 브랜드가 쓰면 브랜드를 따름

**기술적 하드룰 3개 (React + 인라인 Babel)**
1. "**Never use `const styles = { ... }`** — multiple component files with `styles` as a global object will silently overwrite each other. Always namespace: `const terminalStyles = { ... }` ... **Never use `styles` as a variable name.**"
2. "**Separate `<script type=\"text/babel\">` blocks do not share scope** — each Babel script is compiled independently. To share components ... `Object.assign(window, { Terminal, Line });`"
3. "**Do not use `scrollIntoView`** — in iframe-embedded preview environments, it disrupts outer-frame scrolling. Use `element.scrollTop = ...` or `window.scrollTo({...})` instead."
+ "Do not change versions, do not add `type=\"module\"` (breaks the Babel transpilation pipeline)"

**콘텐츠 금지**
- "**No filler content** — every element must earn its place"
- "**Don't add sections/pages unilaterally** — if more content seems needed, ask the user first; they know their audience better"
- "**Placeholders > fabricated data** — fake data damages credibility more than admitting a gap"
- "**Less is more** — \"1,000 no's for every yes\"; whitespace is design"
- "If the page looks empty → **it's a layout problem, not a content problem.** Solve it with composition, whitespace, and type-scale rhythm, **not by stuffing content in**"

**CSS 금지**
- "**Prefer brand colors for palette**; when more colors are needed, derive harmonious variants using `oklch()` — **never invent new hues from scratch**"

**CDN 금지/제한**
- "**Default to hand-written CSS or resources from the brand/design system.** Only load a CDN when the scenario clearly calls for it — never include everything by default."
- Tailwind CDN: "Conflicts with the \"declare design tokens first\" workflow" — 명시 요청 또는 일회성 프로토타입만
- Lucide Icons CDN: "Prefer placeholders over inserting icons \"to look complete\"" — 동일 조건
- Google Fonts: "avoid Inter / Roboto / Arial / Fraunces / system-ui as display"

**모션 라이브러리 금지**
- "**Avoid Framer Motion / GSAP / Lottie unless explicitly requested** — bundle overhead, version conflicts, and React 18 inline Babel breakage."
- "skip \"title screen\" intros — go straight to content"

**프로토타입 금지**
- "**No title screen / cover page** — prototypes should center in the viewport or fill it"

**슬라이드 규칙**
- "**Slide numbering is 1-indexed**: use labels like `01 Title`, `02 Agenda` ... **never use 0-indexed labels that cause off-by-one confusion**"

**데이터 시각화 금지**
- "Focus on **data-ink ratio**: remove unnecessary gridlines, 3D effects, and shadows; let the data speak"
- "Color encoding should carry semantic meaning (up/down / category / time), **not serve as decoration**"

**Direction Advisor 금지**
- "❌ **Hard rule**: never recommend 3 picks from the same row"
- "Don't ask the user 10 generic taste questions"

**협업 금지**
- "**Honor checkpoints**: when you say \"I'll wait for your confirmation,\" **actually wait**"
- "When summarizing, **only mention important caveats and next steps** — don't recap what you did; the code speaks for itself"

**레시피 로딩 금지** (`INDEX.md`)
- "Do **not** load every recipe file up front. The entire catalog is ~1400 lines if loaded together; loading one recipe is ~50 lines. **Loading the whole catalog when you only need one recipe is the exact anti-pattern this split is designed to prevent.**"

### 강제 규칙 — 수치 인용

**크리틱 기준 수치 (Step 7)**
- "Title/body ratio **≥ 2.5×**"
- "consistent spacing system (e.g., **8pt grid**)"
- "controlled color count (**≤ 4**)"
- "font families **≤ 2**"
- 점수 범위 **0–10**, Quick Wins **3개**

**타입 스케일**
- "Bold type-size contrast (a **4–6×** ratio between h1 and body text is normal)"

**Appropriate Scale 표 (원문)**

| Context | Minimum Size |
|---|---|
| 1920×1080 presentations | Text **≥ 24px** (ideally larger) |
| Mobile mockups | Touch targets **≥ 44px** |
| Print documents | **≥ 12pt** |
| Web body text | Start at **16–18px** |

**슬라이드 규격**
- "Fixed canvas at **1920×1080 (16:9)**, auto-fitted to any viewport via JS `transform: scale()`"
- "use at most **1–2 background colors** per deck"
- 키보드: ← → 슬라이드 이동, Space 다음
- `localStorage`에 현재 위치 저장
- `data-screen-label` 속성

**프로토타입 규격**
- "At least **3 variants**, toggled via the Tweaks panel"
- "Complete state coverage: default / hover / active / focus / disabled / loading / empty / error" (**8개 상태**)

**파일 관리 수치**
- "Split large files (**>1000 lines**) into multiple small JSX files"
- 버전: `My Design.html` → `My Design v2.html`
- 브랜드 애셋: `assets/<brand>-brand/`

**모션 4단 계층 (복잡도 순)**
1. "**CSS transitions / animations** — sufficient for **80%** of micro-interactions"
2. "**Simple React state + setTimeout / requestAnimationFrame**"
3. "**Custom `useTime` + `Easing` + `interpolate`**" — 타임라인 구동 씬
4. "**Fallback: Popmotion** (`https://unpkg.com/popmotion@11.0.5/dist/popmotion.min.js`) — only if the above three layers genuinely can't cover the use case"
+ "Always provide play/pause + scrubber, reuse a single easing-function library across the project"

**Five Dials 밴드 예시 (`design-calibration.md`, Visual Variance)**

| Band | Behavior |
|---|---|
| 1–3 | Stable grids, symmetry, familiar navigation, low surprise |
| 4–6 | One or two asymmetric moves, varied section rhythm, controlled novelty |
| 7–8 | Strong art direction, off-grid moments, multiple layout families |
| 9–10 | Experimental composition; use only when comprehension and brand permit |

**앵커 레시피의 구체적 수치 예시 (`linear.md` 전문 발췌)**
```
Palette
- Ground: #08090A (near-black with warm undertone, not pure black)
- Surface 1: #16171C / Surface 2: #1E1F25 / Surface 3 (raised): #26272E
- Hairline border: rgba(255,255,255,0.06)
- Primary text: #F7F8F8 / Secondary: #9CA3AF / Muted: #6B7280
- Accent: Linear purple #5E6AD2 — used on < 5% of pixels
- Gradient meshes (very controlled, < 8% opacity) in the hero only

Typography
- Display: Inter Tight at weight 600 (or Söhne, or Geist Sans) — never plain Inter at default weight, that's the AI-default
- Body: Inter at 14–15px, weight 400–500, line-height 1.55
- Mono: GeistMono, JetBrains Mono, or Berkeley Mono
- Letter-spacing on display headlines: -0.02em (tight)

Spacing: 4 / 8 / 12 / 16 / 24 / 40 / 64 / 96
Radius: 6 (small UI) / 12 (medium cards) / 16 (large panels). Never above 16.
Shadow: soft 0 1px 2px rgba(0,0,0,0.3) on raised surfaces. Never glow, never colored shadow.
Motion: ease-out around 150ms for hover, 350–450ms for layout moves with a quint curve
        (e.g., the famous cubic-bezier(0.22, 1, 0.36, 1)). "snappy but not bouncy."

Avoid: Emoji / Bouncy springs or elastic easings / More than one saturated color /
       Border-radius above 16 / Stock photography of people /
       "Get Started Free" hero CTAs styled like a 2018 SaaS landing page
```
25개 레시피가 모두 이 형식(School / Vibe / Best for / Touchstone / Palette / Typography / Spacing / Radius / Shadow / Motion / Signature moves / Avoid / AI prompt seed)을 따른다.

### 항목별 지침

**타이포그래피**
- 선언 의무: heading font / body font / code font (Step 3)
- 금지 서체: "Inter / Roboto / Arial / Fraunces / system-ui as display"
- 대비: h1 : body = **4–6×**, 크리틱 기준 **≥ 2.5×**
- 최소 크기: 프레젠테이션 ≥24px, 인쇄 ≥12pt, 웹 본문 16–18px
- 서체 패밀리 수: **≤ 2**
- `clamp()` 유동 타이포그래피, `text-wrap: pretty`
- 레시피별 구체값 (Linear 예: Inter Tight 600, body 14–15px/1.55, `-0.02em`)

**컬러**
- 선언 의무: primary / secondary / neutral / accent
- "Prefer brand colors"; 추가 색은 `oklch()`로 조화 변형 도출, "**never invent new hues from scratch**"
- 색 개수: **≤ 4** (크리틱 기준)
- 배포 체크리스트: "All colors come from the design system declared in Step 3 — **no rogue hues introduced**"
- 금지 팔레트: purple→pink→blue 그라디언트, cyber-neon on `#0D1117`
- 데이터 시각화: 색은 의미(상승/하락, 카테고리, 시간)를 담당, 장식 아님
- 레시피별 구체 hex (Linear 예: accent `#5E6AD2`가 픽셀의 <5%)

**스페이싱**
- 선언 의무: "base unit and multiples"
- 크리틱 기준: 일관된 spacing system, 예로 **8pt grid**
- 레시피별 스케일 (Linear: 4 / 8 / 12 / 16 / 24 / 40 / 64 / 96)
- "Play with proportion and whitespace to create visual rhythm"
- "whitespace is design"

**모션**
- 선언 의무: "easing curves / duration / trigger"
- 4단 복잡도 계층 (CSS → React state → custom timeline → Popmotion)
- `prefers-reduced-motion` 미디어쿼리 활용
- Framer Motion / GSAP / Lottie 금지 (명시 요청 없이)
- motion-intensity 다이얼 (1–10)
- 레시피별 구체값 (Linear: hover ~150ms ease-out, layout 350–450ms `cubic-bezier(0.22, 1, 0.36, 1)`)

**레이아웃**
- "Prefer CSS Grid + Flexbox"
- `@container` 쿼리로 컴포넌트 수준 반응형
- 슬라이드: 1920×1080 고정 캔버스 + `transform: scale()`, 레터박스, prev/next는 스케일 컨테이너 **밖**
- "Experiment with unconventional layouts"
- visual-variance 다이얼이 레이아웃 이탈 정도를 통제

**Border-radius / Shadow**
- 선언 의무: radius strategy (large / small / sharp), shadow hierarchy (elevation 1–5)
- 레시피별 (Linear: radius 6/12/16, never above 16; shadow `0 1px 2px rgba(0,0,0,0.3)`, never glow/colored)

**접근성**
- Step 1 constraints에 "Accessibility?" 포함
- `@media (prefers-color-scheme)`, `@media (prefers-reduced-motion)`
- 터치 타깃 ≥44px
- 상태 커버리지에 focus 포함
- `redesign-protocol.md`가 "protect routes, IA, analytics, forms, **accessibility**, and brand"
- **대비 비율(WCAG) 수치는 원문에 명시 없음**

**Aim to Stun (원문)**
- "Bold type-size contrast (4–6× ratio)"
- "Use color fills, textures, layering, and blend modes to create depth"
- "Use SVG filters, `backdrop-filter`, `mix-blend-mode`, `mask`, and other advanced CSS to create memorable moments"
- "CSS, HTML, JS, and SVG are far more capable than most people realize — **use them to astonish the user**"

### 지침을 주는 방식 자체

1. **페르소나 + 정체성 전환**: "top-tier design engineer" + "the professional identity shifts with each task: UX designer, motion designer, slide designer, prototype engineer, data-visualization specialist."
2. **기준선을 한 문장으로 선언**: "**The bar is \"stunning,\" not \"functional.\"**" 그리고 배포 체크리스트에 검증 가능한 형태로 재등장: "Visual quality at **Dribbble / Behance showcase level**".
3. **앵커 레시피 카탈로그 (25개)** — 이 스킬의 핵심 장치. 이름 있는 브랜드/스튜디오/디자이너에 묶인 **구체적 수치 세트**를 즉시 붙여넣게 함. 존재 이유를 명시: "that catalog exists so you don't have to invent these on the fly, **which is the leading cause of AI-default Inter + #3b82f6 mush**".
4. **학파 분류(6개) + 레시피(25개)의 2층 구조**: `design-directions.md`는 학파 대화용, `style-recipes/`는 앵커 구체값용. `INDEX.md`가 3개 인덱스(by school / by best-for / by mode)로 라우팅.
5. **금지에 이유와 예외를 병기**: 클리셰 표가 `Pattern / Why it's slop / When it's actually fine` 3열. "Treat each pattern as **default → reason → exceptions → detection → repair**, not as an unconditional aesthetic ban." — **무조건 금지가 아니라 조건부 기본값**으로 취급.
6. **금지의 상위 논리 제시**: 안티클리셰를 "미적 우월감"이 아니라 "브랜드 인지 보호"로 정당화하고 3단 추론을 명시. 그리고 유일한 예외를 "브랜드 스펙이 그것을 쓴다"로 고정.
7. **다이얼(1–10) 5개로 강도를 수치화**: visual-variance / motion-intensity / information-density / asset-dependence / brand-fidelity. "decision variables, not decorative scores"이며 밴드별 행동이 `design-calibration.md`에 정의.
8. **4개 포지셔닝 질문**: narrative role / viewing distance / visual temperature / capacity check. 미학 선택 전에 **맥락을 먼저 고정**.
9. **선언 후 코딩 (declare-then-code)**: Step 3의 마크다운 블록을 채우지 않고는 코드 작성 금지 + Checkpoint 1 정지.
10. **v0 조기 공개**: 완성도보다 방향 교정을 우선. 근거를 비용으로 설명 ("3x the time", "has to be scrapped entirely").
11. **애셋 위계 (Asset > Spec)**: 브랜드 인지도 기여도로 애셋을 서열화하고 hex code를 "the cheapest part of the identity"로 강등. 로고를 "non-negotiable"로.
12. **플레이스홀더 철학**: "**a placeholder is more professional than a poorly drawn fake.** ... A placeholder signals \"real material needed here.\" A fake signals \"I cut corners.\"" 유형별 플레이스홀더 지정(아이콘→`[icon]`/`▢`, 아바타→이니셜 원, 이미지→비율 카드, 데이터→질문, 로고→정지+질문).
13. **5차원 크리틱 + 채점 루브릭**: 0–10 점수 + 차원별 기준. `critique-guide.md`에 9–10/7–8/5–6/3–4/1–2 밴드 서술. "**Critique the design, not the designer.**"
14. **검증의 2단 분기 + 오발동 방지**: 경량 체크리스트는 항상, 브라우저 실행은 명시 요청 시만. "Do not infer this request merely from \"build,\" \"finish,\" \"polish,\" or \"verify your work.\"" — **검증 비용을 사용자 의도에 연동**.
15. **점진적 로딩 + 로딩 안티패턴 명시**: References Routing 표 + "Loading the whole catalog when you only need one recipe is the exact anti-pattern this split is designed to prevent."
16. **디자인 언어로 설명하라**: "Explain decisions using **design language** (\"I tightened the spacing to create a tool-like feel\"), not technical language."
17. **변체 전략을 스펙트럼으로**: "Start the first few variants safely within the design system; then progressively push boundaries. **Vary the calibrated dials intentionally rather than producing cosmetic recolors.** Show the spectrum from \"safe and functional\" to \"ambitious and daring\"."
18. **사실 검증을 최우선 게이트로**: 디자인 스킬에 WebSearch 게이트가 0단계로 있는 것은 이례적. 자기 검열 신호("I think it's…")까지 트리거로 지정.
19. **Tweaks 패널을 관례화**: 이름을 "Tweaks"로 고정, 우하단 플로팅, 닫으면 완전 숨김, "Even if the user doesn't ask for tweaks, **add 1–2 creative ones by default**".

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**stunning**" (기준선) | 4–6× 타입 대비 + 비정형 레이아웃 + 고급 CSS(SVG filter/`backdrop-filter`/`mix-blend-mode`/`mask`) + "Dribbble / Behance showcase level" |
| "**modern / clean**" | **금지 어휘** — "Avoid empty labels such as \"modern\" or \"clean.\"" 대신 "specific family such as restrained builder SaaS, kinetic editorial, warm humanist, or institutional data-first" |
| "**minimalist**" (막연) | **불충분** — "A named designer or studio reference (e.g., \"Pentagram-style information architecture\", **not just \"minimalist\"**)" |
| "**Linear-style**" | `linear.md`의 구체값 — `#08090A` ground, `#5E6AD2` accent <5% 픽셀, radius ≤16, hover 150ms ease-out, hairline `rgba(255,255,255,0.06)` |
| "**quiet luxury**" | Editorial/minimalist 학파 — "Whitespace, refined typography" + 앵커 (Kenya Hara, Apple HIG, Dieter Rams, Aesop) |
| "**tool-like feel**" | "I tightened the spacing" — 설명 예시로 제시 |
| "**premium / expensive**" | 직접 언급은 없으나 Editorial/minimalist 학파의 "Best for: Premium / high-end / quiet" + Aesop/MUJI 레시피로 매핑 |
| "**AI slop / generic**" | 8개 클리셰 패턴 + "AI-default Inter + #3b82f6 mush" + "average of training data = all brands averaged together" |
| "**restraint as confidence**" (Linear vibe) | accent를 픽셀 <5%로, saturated color 1개만, gradient <8% opacity |
| "**snappy but not bouncy**" | hover 150ms ease-out / layout 350–450ms quint curve, "Bouncy springs or elastic easings" 금지 |
| "**does each element earn its place**" | "If I delete this, does the design get worse?" If no → delete |
| "**Less is more**" | "1,000 no's for every yes" + "If the page looks empty → it's a layout problem, not a content problem" |
| "**looks empty**" | 콘텐츠 추가가 아니라 "composition, whitespace, and type-scale rhythm"으로 해결 |
| "**unexpected but right**" | Originality 차원의 평가 기준 |
| "**Squint test**" | Visual hierarchy 차원의 검증 방법 |
| "**recognized**" (브랜드) | 로고 > 제품 이미지/UI 스크린샷 > 색 토큰 > 타이포 순 기여도. hex는 "cheapest part" |

## 7. 산출물

- **형식**: HTML (인라인 CSS/JS, React는 인라인 Babel + pinned CDN). "The output medium is always HTML."
- **파일 네이밍 규칙 (원문)**
  - "Use descriptive filenames: `Landing Page.html`, `Dashboard Prototype.html`" — 공백 포함 자연어 파일명
  - 1000줄 초과 시 여러 JSX 파일로 분할 + 메인 파일에서 `<script>`로 조립
  - 대규모 개정: "copy + rename with `v2`/`v3`" — `My Design.html` → `My Design v2.html`
  - 다중 변체: "prefer **a single file + Tweaks toggles** over separate files"
  - 애셋: "Copy assets locally before referencing them — don't hotlink". 브랜드 애셋은 `assets/<brand>-brand/`
- **부수 산출물**
  - **`brand-spec.md`** — 브랜드 작업 시 필수. 로고·제품 이미지·UI 스크린샷 경로 + 색 토큰 + 폰트
  - Design Read (YAML 블록) + Design Decisions (마크다운 블록)
  - 크리틱 리포트 — 종합 점수 + 차원 점수 + Keep + 심각도순 Fixes + 3개 Quick Wins
  - Acceptance 리포트 (조건부) — evidence + 수리 내역
- **Tweaks 패널** — 우하단 플로팅, 제목 "Tweaks", 닫으면 완전 숨김
- **요약 방식**: "only mention important caveats and next steps — don't recap what you did"

## 8. 주의점 / 한계

- **Checkpoint 3개의 마찰**: Step 3(디자인 시스템) / Step 4(v0) / Step 5(비자명 결정)에서 정지. 원문이 "actually wait"을 두 번 강조하는 것은 이 규칙이 어겨지기 쉽다는 자각. 자동화·배치 실행과는 상충.
- **`agents/openai.yaml`의 `allow_implicit_invocation: true`와 Checkpoint의 긴장**: 암묵적 호출을 허용하면서 3개 정지점을 요구하므로, 짧은 요청에 무거운 절차가 붙을 수 있음. 경량 경로(사소한 수정)는 Fallback의 "When to skip"에만 언급되고 메인 워크플로우에는 없다.
- **인라인 Babel의 구조적 취약성**: 하드룰 3개(`styles` 금지, 스코프 분리, `scrollIntoView` 금지)가 모두 이 아키텍처의 부작용이다. 빌드 도구 없이 단일 HTML을 얻는 대가로 스코프·전역 오염 문제를 규칙으로 방어하는 구조. React 버전 고정도 필수("Do not change versions").
- **애셋 소싱의 현실성**: Asset Protocol이 로고·제품 이미지를 필수로 요구하지만, 실제 확보는 네트워크·저작권·접근권에 의존한다. 소싱 체인 마지막이 "honest \"asset pending\" placeholder"이고 로고는 "stop and ask the user"로 정지 — 즉 **브랜드 작업이 사용자 개입 없이는 완결되지 않을 수 있다.**
- **Step 0의 WebSearch 의존**: 검색 도구가 없는 환경에서 이 게이트를 어떻게 통과할지는 **원문에 명시 없음.** ("If search returns nothing or is ambiguous → ask the user"는 검색이 가능한 경우의 처리)
- **접근성 수치의 부재**: 터치 타깃 44px과 미디어쿼리 활용은 있으나 **WCAG 대비 비율 수치가 원문에 없다.** 크리틱 5차원에도 접근성 차원이 없음 — 이 스킬의 가장 뚜렷한 지침 공백.
- **25개 레시피의 품질 불균일 가능성**: 샘플로 확인한 `linear.md`는 매우 구체적(hex, px, ms, cubic-bezier)이지만 모든 레시피가 같은 밀도인지는 파일별로 다를 수 있다. `INDEX.md`가 "~1400 lines / 25 files"라 했으므로 파일당 평균 ~56줄 — Linear 레시피와 비슷한 규모로 추정.
- **레시피와 브랜드의 충돌 처리**: 사용자가 앵커를 지목했지만 자기 브랜드도 있는 경우, "Asset > Spec"과 레시피 값 중 무엇이 우선인지 명시가 약하다. `INDEX.md`에 "Do not read recipe files when: The user provided their own brand assets / Figma / codebase — extract from those instead (Asset > Spec)"가 있어 사실상 브랜드 우선이지만, SKILL.md 본문에서는 이 우선순위가 표로 정리되어 있지 않다.
- **`beautiful-article`과의 경계**: 둘 다 단일 HTML을 산출하고 둘 다 테마/레시피 라이브러리를 갖는다. description이 명시적으로 라우팅하지만(장문 기사 → beautiful-article), "슬라이드 덱"이나 "정보 밀도 높은 페이지"처럼 경계에 있는 요청은 판단이 필요하다.
- **모션 지침의 상대적 얕음**: 4단 계층과 레시피별 duration/easing은 있으나, `emilkowalski` 컬렉션 수준의 빈도 게이트·중단 가능성·GPU 속성 규칙은 없다. `prefers-reduced-motion`은 "leverage" 수준의 언급.
- **강한 경고 지점**:
  - "**Highest priority — runs before clarifying questions.**" (Step 0)
  - "Forbidden phrases without prior search"
  - "**Never start from thin air.**"
  - "**Logo is non-negotiable**" / "the #1 way branded work fails"
  - "**Never use `styles` as a variable name.**"
  - "**Do not use `scrollIntoView`**"
  - "Picking aesthetics in a vacuum is **the root cause of generic output**."
  - "Then **actually wait** — don't say it and immediately start coding."
  - "**Do not infer this request merely from \"build,\" \"finish,\" \"polish,\"**"
  - "**never recommend 3 picks from the same row**"
  - "**never invent new hues from scratch**"
  - "**Loading the whole catalog when you only need one recipe is the exact anti-pattern**"
- **검증 장치 (강점)**: 17항목 Pre-delivery Checklist + 5차원 0–10 크리틱 + 채점 루브릭 + 조건부 실행 가능 브라우저 acceptance(수리 루프 + 증거 기록) + 클리셰 탐지/수리 패턴(`failure-patterns.md`). `emilkowalski`의 `review-animations`에 견줄 만한 검증 밀도이며, **실행 가능한 검증(브라우저)까지 갖춘 점**이 강점. 다만 그 실행을 명시 요청으로 제한해 기본 경로는 여전히 판독 검증이다.
