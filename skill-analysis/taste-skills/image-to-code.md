# image-to-code 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/image-to-code/`
- **핵심 파일**: `SKILL.md` (36,442 bytes) — 단일 파일, **38개 섹션**
- **보조 파일**: 없음
- **성격**: **이미지 우선(image-first) 워크플로우 강제 스킬**. 웹 디자인 요청에 대해 **먼저 디자인 이미지를 직접 생성하고 → 깊이 분석하고 → 그것에 충실하게 코드로 구현**하도록 순서를 강제한다. 이 컬렉션에서 유일하게 "이미지를 설계 진실의 원천"으로 삼는 스킬.

원문 자기 규정: "The required workflow is: **image generation first / deep image analysis second / implementation third**. If the task is mainly visual, **this order is mandatory**." 그리고 "The images are the **primary art-direction source**. The code is the **implementation layer**."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Elite website image-to-code skill **for Codex**. For visually important web tasks, it must first generate the design image(s) itself, deeply analyze them, then implement the website to match them as closely as possible. In Codex, it must prefer large, readable, section-specific images instead of tiny compressed boards, generate fresh standalone images for sections or detail views instead of cropping old ones, avoid lazy under-generation, avoid cards-inside-cards-inside-cards UI, and keep the hero clean, spacious, readable, and visible on a small laptop."

**대상 환경이 명시됨**: "**for Codex**". 본문도 §4, §10, §18 등에서 "Inside Codex" 규칙을 별도로 둔다.

**§11이 트리거 발화를 직접 열거** — "Trigger image-first workflow when the user asks for:"
- a beautiful hero section
- a premium landing page
- a creative website
- a redesign
- a more modern website
- a more aesthetic interface
- a polished marketing page
- a portfolio site
- a startup site where visual taste matters heavily
- a multi-section website concept
- **anything described mainly in visual terms**

**직접 코딩이 허용되는 경우 (§11)** — "Direct-code first is more acceptable only when:"
- the task is mostly technical
- the user wants a bug fix
- **the user already provides a precise design system**
- the task is mainly structural rather than visual

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **이미지 생성 도구가 있는 환경**에서 시각 품질이 핵심인 웹 작업
- 다중 섹션 랜딩 페이지 — §33이 4/8/12 섹션 팩을 제공
- 코드로 바로 짜면 "AI 티"가 나는 경우 — 이미지를 먼저 만들어 미학을 고정하고 코드는 번역만 하게 함
- 클라이언트에게 **시각 승인**을 먼저 받아야 할 때 (부산물로 레퍼런스 이미지가 남음)
- 디자인 드리프트가 반복되는 팀 — §26, §27이 드리프트 방지에 특화

**부적합 / 과한 상황**
- **이미지 생성 도구가 없는 환경** — 스킬의 전제가 무너진다. 원문은 "when image generation is available"이라는 조건을 여러 곳에 달지만, 없을 때의 대체 워크플로우가 **명시되지 않았다** (§8 참조)
- 기술적 작업, 버그 수정, 구조 작업 — §11이 명시적으로 제외
- 이미 정확한 디자인 시스템이 있는 경우 — §11이 제외
- **비용·시간이 제약인 상황** — 8섹션 요청 시 8개 이미지 + 추가 상세 이미지 + 재생성까지 요구
- 대시보드·앱 내부 UI — 이 스킬은 마케팅/랜딩/포트폴리오 계열에 특화 ("This skill is for: hero sections / landing pages / marketing sites / startup sites / editorial brand pages / product pages / portfolio websites / premium multi-section websites / redesigns")

**형제 스킬 대신 이걸 고르는 기준**: **워크플로우가 이미지 우선인가.** 같은 컬렉션의 `imagegen-frontend-web` / `imagegen-frontend-mobile`이 이름상 가장 가까우며(미분석 시점), `high-end-visual-design`/`design-taste-frontend`는 코드 직행이다. `garden-skills/web-design-engineer`는 §2b에 "optional image-first branch"를 두지만 이 스킬처럼 강제하지 않는다.

## 4. 외부 의존성

- **API 키**: **원문에 명시 없음.** 그런데 스킬의 전제가 **이미지 생성 능력**이다. 어떤 도구·모델·키를 쓰는지, 비용이 얼마인지가 **전혀 다뤄지지 않는다.** Codex 환경의 내장 이미지 생성을 전제하는 것으로 보이나 명시가 없다.
- **폴백 모드**: **불완전하게 존재.** 원문이 "when image generation is available", "If image generation is available"이라는 조건을 반복하지만, **없을 때 무엇을 하라는 지시가 없다.** §36의 3항이 "if image generation is available and visual quality is central, generate the design image(s) first"로 조건부이지만 else 분기가 없다.
- **필요한 CLI/런타임/패키지**
  - **이미지 생성 도구** (필수 전제)
  - **이미지 분석/비전 능력** (필수 — §9의 "deeply analyze")
  - 프론트엔드 스택: **원문에 명시 없음.** 프레임워크·CSS 방식에 대한 지정이 전혀 없다 (이 컬렉션의 다른 스킬들이 Tailwind/React를 강제하는 것과 대조적)
- **네트워크**: 이미지 생성 API 호출 시
- **비용 발생 지점**: **매우 크다.** §3~§7이 이미지 수를 늘리도록 강하게 요구:
  - "it is better to generate **too many clear images** than too few compressed images"
  - "1 section requested → 1 image / … / 10 sections requested → 10 images"
  - 불명확하면 **재생성** (§6), 그래도 부족하면 **추가 상세 이미지** (§7)
  - "Do not hesitate to create a **second or third** extraction-oriented image for a section"
  → 12섹션 사이트면 12장 + 상세/재생성분까지 **20장 이상**이 될 수 있다. **비용 상한·예산 개념이 원문에 전혀 없다.**

## 5. 워크플로우

### 필수 순서 (3단계) — **이 스킬의 핵심**
```
image generation first
deep image analysis second
implementation third
```
"If the task is mainly visual, **this order is mandatory**."

금지 (원문): "Do not skip image generation when image generation is available. **Do not begin with freeform coding first.**"

### §10 상세 실행 순서 (8단계)
1. infer the section count
2. generate section reference images first
3. generate extra detail/extraction images where needed
4. if needed, **regenerate unclear sections as fresh standalone images**
5. deeply inspect all generated images
6. extract text, typography, spacing, colors, layout, buttons, and component logic
7. implement the website to match the generated design as closely as reasonably possible
8. **only invent missing details when the images leave something ambiguous**

### §36 응답 행동 (22단계) — 가장 상세한 절차
1. infer site type
2. infer number of sections
3. 이미지 생성 가능 + 시각 품질 핵심이면 이미지 먼저
4. Codex 내부에서는 섹션당 큰 이미지 1장 선호
5. 텍스트·컴포넌트가 작으면 추가 상세/추출 이미지
6. 가독성·추출 품질이 향상되면 이미지를 더 생성
7. **이미지 수에 게으르지 말 것**
8. **기존 이미지를 크롭하지 말 것**
9. 필요하면 섹션을 새 독립 이미지로 재생성
10. 강한 시각 조합 선택 (§12)
11. **서명 컴포넌트 4개** 선택
12. **모션 암시 큐 2개** 선택
13. 히어로 청결성 + 짧은 헤드라인 줄 수 강제
14. 불필요한 pill·라벨·마이크로 UI 감소
15. 카드-속-카드-속-카드와 거대 박스 래퍼 회피
16. 첫 화면을 작은 노트북에서 읽히고 균형 있게
17. 적절한 곳에 강한 이미지 사용
18. 간격을 관대하고 균일하고 분석 가능하게
19. 모든 생성 이미지를 깊고 깨끗하게 분석
20. 텍스트·타이포·간격·버튼·색·컴포넌트·레이아웃 로직 추출
21. 생성된 레퍼런스에 가능한 한 가깝게 구현
22. **전체 분석 패스 후에만 최종 파일 생성**

추가 금지: "**Do not ask unnecessary follow-up questions if a strong interpretation is possible.**"

### 이미지 생성 규칙 체계 (§3~§7) — **4단 에스컬레이션**
1. **§3 충분히 생성**: 가독성·추출 품질이 향상되는 모든 항목(텍스트/타이포/간격/버튼/카드/색/컴포넌트/구현 충실도/반응형 이해/섹션 명확성)에 대해 더 생성
2. **§4 섹션당 1장 (Codex)**: N섹션 → N이미지. "Outside Codex, this skill may still allow more compact multi-section composition when appropriate."
3. **§5 크롭 금지 → §6 재생성**: 크롭은 "spacing accuracy / type scale relationships / clean margins / layout proportions / button clarity / section balance / overall implementation fidelity"를 파괴. 대신 같은 디자인 언어를 유지한 **새 독립 이미지**
4. **§7 추가 상세 이미지**: 그래도 부족하면 2번째·3번째 추출용 이미지

### §12 조합 변량 엔진 — **7개 축에서 선택**
"internally choose a strong combination and commit to it consistently. Do not mash everything into chaos."

| 축 | 선택 수 | 옵션 |
|---|---|---|
| **Theme Paradigm** | 1 | Pristine Light Mode / Deep Dark Mode / Bold Studio Solid / Quiet Premium Neutral |
| **Background Character** | 1 | subtle technical grid·dotted field / pure solid + soft ambient gradient depth / full-bleed cinematic imagery / tactile textured surface feel |
| **Typography Character** | 1 | clean grotesk / refined grotesk / expressive display / compressed statement typography / editorial serif + sans / Swiss rational hierarchy |
| **Hero Architecture** | 1 | cinematic centered minimalist / asymmetric split hero / floating polaroid scatter / inline typography behemoth / editorial offset composition / massive image-first hero with restrained text |
| **Section System** | 1 | modular bento rhythm / alternating editorial blocks / poster-like stacked storytelling / gallery-led cadence / Swiss grid discipline / asymmetric premium marketing flow |
| **Signature Component Set** | **정확히 4개** | diagonal staggered square masonry / 3D cascading card deck / hover-accordion slice layout / pristine gapless bento grid / infinite brand marquee strip / turning polaroid arc / vertical rhythm lines / off-grid editorial layout / product UI panel stack / split testimonial quote wall / layered image crop frames |
| **Motion-Implied Language** | **정확히 2개** | scrubbing text reveal energy / pinned narrative section energy / staggered float-up energy / parallax image drift energy / smooth accordion expansion energy / cinematic fade-through energy |

중요 단서: "These are **not coding instructions**. They are **visual-direction cues the design should imply**." → 즉 이미지 생성 단계의 지침이며, 코드 단계에서는 이미지에서 추출된 것이 우선.

### §28 모호성 해결 순서 (6단 우선순위)
1. preserve the visible design language
2. preserve layout and spacing logic
3. preserve component family
4. preserve mood and polish level
5. generate an extra detail image if needed
6. regenerate the section as a fresh standalone image if needed
7. "only then choose the most implementation-friendly faithful version"

"**Do not fill ambiguity with generic defaults too quickly.**"

### §35 CLARITY CHECK — 21항목 최종 검증
"Before finalizing, verify internally:"
1. Has the design been generated first?
2. Have all generated images been deeply analyzed?
3. Is the text readable enough?
4. If not, were extra detail images created?
5. **Were enough images generated, or was the image count too lazy?**
6. Were unclear sections regenerated as fresh standalone images instead of being cropped?
7. Is the hierarchy obvious?
8. Is the hero clean enough?
9. Is typography analyzed properly?
10. Are spacing relationships understood properly?
11. Are buttons and components extracted properly?
12. Are colors analyzed properly?
13. Is the design visually distinctive?
14. Is it free of obvious AI tells?
15. **Can someone code from this faithfully?**
16. If multiple images exist, do they clearly belong together?
17. Has Codex avoided compressing too many sections into one tiny image?
18. Was the analysis clean, structured, and specific?
19. Has unnecessary nested boxing been removed?
20. Is the first screen still clean and readable on a small laptop?
21. Have useless pills, labels, and fake technical micro-elements been reduced?

"If not, **refine internally before output**."

**사용자 확인 요구 지점**: **없음.** 오히려 "Do not ask unnecessary follow-up questions if a strong interpretation is possible."로 질문을 억제한다.

## 6. 디자인 지침 분석

### §1 다이얼 9개 (ACTIVE BASELINE CONFIGURATION) — 이 컬렉션 최다

| 다이얼 | 기본값 | 범위 정의 |
|---|---|---|
| DESIGN_VARIANCE | **8** | 1 = rigid/conventional, 10 = highly art-directed/asymmetric |
| VISUAL_DENSITY | **3** | 1 = airy/calm, 10 = dense/packed |
| ART_DIRECTION | **8** | 1 = safe commercial, 10 = bold creative statement |
| IMPLEMENTATION_CLARITY | **9** | 1 = loose moodboard, 10 = highly buildable UI reference |
| IMAGE_USAGE_PRIORITY | **9** | 1 = mostly typographic, 10 = strongly image-led when appropriate |
| SPACING_GENEROSITY | **9** | 1 = compact/tight, 10 = spacious/breathable |
| ANALYSIS_PRECISION | **10** | 1 = broad vibe only, 10 = deep extraction of design details |
| IMAGE_GENERATION_EAGERNESS | **10** | 1 = minimal image count, 10 = generate as many images as needed |
| UI_SIMPLICITY_DISCIPLINE | **9** | 1 = willing to add many micro-elements, 10 = aggressively reduce clutter |

**해석 규칙 (원문)**:
- "If the user says \"clean\", **reduce density and increase clarity**."
- "If the user says \"crazy creative\", **increase variance and art direction**."
- "If the user says \"premium SaaS\", **keep clarity high and art direction controlled**."
- "If the user says \"editorial\", **allow stronger type and more asymmetry**."

→ **사용자의 형용사를 다이얼 조작으로 번역하는 표가 제공된 유일한 사례** (이 컬렉션 내에서).

### 금지 규칙 (anti-pattern) — 원문 그대로

**서두: LLM의 붕괴 패턴 13개** — "Standard AI output tends to collapse into repetitive defaults:"
- one single giant compressed image for too many sections
- text that becomes too small to read
- centered dark hero clichés
- generic card spam
- repeated left-text/right-image layouts
- weak typography hierarchy
- vague spacing
- cards inside cards inside cards
- giant rounded section containers everywhere
- too much visible information in the first screen
- tiny pills, labels, tags, system markers, and fake interface jargon
- nice-looking but unextractable designs
- generic coded reinterpretations after the image step
- lazily generating too few images for too many sections

**§29 ANTI-AI-SLOP RULES** — 5개 카테고리

*Layout slop*
one giant unreadable collage / endless centered sections / identical card rows repeated section after section / cloned left-text/right-image blocks / fake complexity without hierarchy / decorative empty space with no purpose / cards-inside-cards-inside-cards / giant rounded wrapper sections around everything / overcompartmentalized dashboard framing

*Visual slop*
default purple/blue AI gradients / too many glowing edges / floating blobs everywhere / glassmorphism stacked without reason / random futuristic details with no structure / over-rendered noise that hides the layout

*Typography slop*
giant heading + weak tiny subcopy / too many font moods / awkward line breaks / lazy all-caps everywhere / generic gradient headline tricks

*Content slop*
- 필러 표현: **unleash / elevate / revolutionize / next-gen / seamless / transformative platform**
- 가짜 브랜드: **Acme / Nexus / Flowbit / Quantumly / NovaCore**
- 가짜 복잡성: "pseudo-enterprise control labels / decorative system markers / filler status microcopy / **fake operator / runtime / orchestration jargon** unless truly central to the brand"

*Density slop*
over-packed sections / card overload / tiny spacing between major sections / visually exhausting walls of content

**§16 ANTI-NESTED-BOX RULE**
- "Avoid: giant rounded section containers wrapping everything / cards inside larger cards inside outer cards / dashboard-like compartment stacking for no reason / nested boxed UI that makes the layout feel trapped / sections that are just one big bordered panel containing more bordered panels containing more bordered panels"
- "**A section should not feel like a prison of containers.** It should feel designed, open, and intentional."

**§17 REDUCE MICRO-UI CLUTTER RULE**
- "Avoid: unnecessary pills / pseudo-system markers / fake control labels / decorative code-like tags / meaningless small metadata rows / filler chips / tiny badges everywhere / fake dashboard jargon / overdesigned labels"
- 구체적 예시 금지: "**\"00 orchestration layer\"** / tiny technical status pills / decorative runtime markers / overly specific pseudo-enterprise microcopy / filler operator/control-room labels that exist only to look complex"

**§5 크롭 금지 (원문)**
- "Do not: crop a hero out of a full-page board / crop a pricing area out of a larger composition / crop tiny cards out of a multi-section image / rely on rough cutouts from existing images"

**§26–§27 드리프트 금지**
- "Do not drift into a different design direction during implementation. Do not \"**improve**\" the design by replacing it with a generic coded layout."
- "The goal is **not**: inspired by the image. The goal is: **visually faithful to the image**, translated into real frontend."
- §27: "do not simplify into default templates / do not replace distinctive sections with generic rows / do not compress generous spacing into dense layout / do not replace strong typography with plain hierarchy / do not remove the page's visual identity for convenience / do not merge section logic into repetitive patterns that were not present in the source images / do not reintroduce nested-box complexity"

**§25 컬러**: "**Do not replace a carefully designed palette with generic default web colors.**"
**§22 타이포**: "**Do not flatten typography into a generic coded hierarchy.**"
**§23 간격**: "**Do not collapse the implementation into generic tight spacing if the generated design is more generous.**"
**§21 텍스트**: "**Do not ignore text extraction.**"
**§13**: "**Do not produce vague abstract artwork when the request is for frontend.**"
**§20**: "Avoid: random image sizes with no system / inconsistent proportions across similar modules / messy scaling / uncontrolled collage chaos"
**§34**: "Image 2, 3, or 8 **must not drift into a different website**."

### 강제 규칙 — 수치 인용

**히어로 헤드라인 (§14 Headline Rule)** — 이 스킬에서 가장 명확한 수치
- "**1 line if possible / 2 lines very good / 3 lines maximum in normal cases**"
- "Avoid: **4+ line hero headlines** / paragraph-like hero copy / weak headline-to-subheadline contrast"
- "the hero headline should ideally stay within **1–3 lines**"
- "if the headline starts becoming too long, **reduce words instead of forcing more lines**"

**이미지 수 (§4, §18)**
- "1 section requested → generate 1 image … 10 sections requested → generate 10 images, and so on when reasonable"
- "one section = one primary image / one complex section = one primary image + one or more optional detail images / one unclear section = regenerate it again as a fresh clean standalone image"

**선택 개수 (§12)**
- Signature Component Set: **정확히 4개**
- Motion-Implied Language: **정확히 2개**
- 나머지 5개 축: 각 1개

**섹션 팩 (§33)**
- 4-section: Hero / Features / Social proof·testimonial / CTA
- 8-section: Hero / Trust bar / Features / Product showcase / Benefits·use cases / Testimonials / Pricing / CTA
- 12-section: Hero / Trust bar / Feature grid / Product preview / Problem·solution / Benefits / Workflow / Metrics·proof·integration / Testimonials / Pricing / FAQ / CTA+footer

**다이얼 9개 기본값**: 8/3/8/9/9/9/10/10/9

**그 외 수치는 거의 없다.** hex, px, rem, ms, cubic-bezier가 **전혀 등장하지 않는다.** 이유는 명확하다 — 이 스킬은 값을 **생성된 이미지에서 추출**하도록 설계되었기 때문이다 (§21~§25가 추출 대상을 규정).

### 항목별 지침

**타이포그래피 (§22, §30)**
- 추출 대상: "size relationships / weight relationships / line count / line height feel / tracking feel / serif vs sans behavior / display vs body contrast / section heading rhythm / CTA text scale / whether the design uses **calm or aggressive** type"
- §30 원칙: "Typography is a **primary design material**." → 명확한 크기 대비, 명백한 읽기 순서, 강한 display 순간, 읽히는 본문, 간결한 카피, 구조를 강화하는 섹션 헤딩
- 방향별: "For **editorial** directions: let typography **shape composition**. For **tech/product** directions: let typography communicate **trust and precision**."
- **금지**: "Do not only notice that typography \"looks nice\". **Analyze it properly.**"
- 폰트 이름·크기·line-height 수치는 **원문에 없음** (이미지에서 추출)

**컬러 (§25)**
- 추출 대상: "background color / panel colors / accent colors / button fills / text color hierarchy / border color logic / shadow color mood / **image tint / grade** / gradient restraint or intensity"
- "The implemented website should **preserve the original color logic** as closely as reasonably possible."
- 팔레트 값·대비 비율은 **원문에 없음** (이미지에서 추출). 유일한 금지: "default purple/blue AI gradients"

**스페이싱 (§23, §32)**
- 추출 대상 10개: "distance between headline and subheadline / distance between text and buttons / distance between cards / section top and bottom spacing / side gutters / card padding / image-to-text distance / navbar spacing / CTA block spacing / overall cadence across sections"
- 핵심 단서: "The goal is **not exact pixel OCR**. The goal is **faithful spacing logic**."
- §32 규칙: "use even section spacing / keep major section gaps controlled and intentional / allow negative space to create calmness / **avoid one section feeling cramped while the next feels empty** / smaller sections should still have enough surrounding space / prefer analyzable generous spacing over compressed compositions / do not fill every available area with extra UI / **let simplicity do part of the design work**"

**모션 (§12 Motion-Implied Language)**
- 6개 중 **정확히 2개** 선택: scrubbing text reveal / pinned narrative section / staggered float-up / parallax image drift / smooth accordion expansion / cinematic fade-through
- **결정적 단서**: "These are **not coding instructions**. They are **visual-direction cues the design should imply**."
- §24가 "hover-implied mood"를 추출 대상에 포함
- duration/easing/spring 수치, `prefers-reduced-motion`은 **원문에 전혀 없음.** 이 컬렉션 스킬 중 **모션 지침이 가장 얇다.**

**레이아웃 (§14~§20, §31, §32)**
- §15 반응형 첫 화면: "The first visible website screen must feel usable and clean on **a small laptop**." 작은 노트북에서 보여야 할 5요소: "a clear headline / readable supporting text / clean spacing / a visible CTA / a believable, balanced visual focal point"
- §16 중첩 박스 금지, §17 마이크로 UI 감소
- §20 고정 미디어 프레임: "fixed-aspect media blocks / clearly framed image areas / repeatable media modules / consistent corner radius logic / stable visual proportions across similar sections"
- §31 섹션 리듬: "Vary section rhythm across the page by changing: density / image-to-text ratio / alignment / scale / whitespace / card grouping / background intensity / visual tempo" — 단 "keep the page coherent / keep spacing controlled / **avoid random jumps**"
- 브레이크포인트·컨테이너 폭 수치는 **원문에 없음**

**접근성** — **원문에 지침이 사실상 없다.** 근접 항목:
- "keep the first screen readable on a small laptop" (가독성)
- "readable supporting text"
- `prefers-reduced-motion`, 포커스, 대비 비율, alt text, ARIA, 터치 타깃 **모두 없음**
→ 이 컬렉션에서도 접근성 커버가 가장 얇은 편.

### 지침을 주는 방식 자체

1. **워크플로우 순서 자체를 지침으로**: 이 스킬의 본질은 미학 규칙이 아니라 **작업 순서의 강제**다. "image generation first → deep analysis → implementation". 미학은 생성된 이미지에 위임하고, 스킬은 그 이미지가 **분석 가능하도록** 만드는 데 집중한다.
2. **"분석 가능성(analyzability)"을 최우선 품질 지표로**: IMPLEMENTATION_CLARITY 9, ANALYSIS_PRECISION 10. 그리고 이미지 생성 규칙 전체가 "extraction quality"를 목표로 한다 — "it is better to generate **one clear image per section** than one unreadable board for the whole site". **미학보다 추출 가능성을 우선하는 것이 이 스킬의 고유 판단.**
3. **게으름(laziness)을 명시적 실패로 규정**: "Do not be lazy with image count"가 4회 반복되고, §35 체크리스트 5번이 "was the image count **too lazy**?"다. 즉 **비용 절약 행동을 결함으로 정의**한다.
4. **크롭 금지 + 재생성 강제 (§5, §6)**: 이 스킬 고유의 통찰. 크롭이 파괴하는 것 7개를 열거하고, 재생성 시 **유지할 것**(디자인 언어/팔레트/타이포 무드/버튼 스타일/radius 로직/이미지 처리/브랜드 세계)과 **개선할 것**(텍스트 크기/간격 가시성/버튼 검사 용이성/컴포넌트 구조/레이아웃 비율/청결도)을 분리 명시. "This is **not a different design**. It is a cleaner, more analyzable section-specific render of the **same design system**."
5. **드리프트 방지를 별도 섹션으로 (§26, §27)**: "A common failure mode is design drift: the generated images look strong, but **the coded result becomes generic**." 그리고 "The goal is **not**: inspired by the image. The goal is: **visually faithful**." — **이미지→코드 단계의 품질 손실을 정면으로 다룬 유일한 스킬.**
6. **다이얼 9개 + 형용사 번역표**: 사용자의 "clean" / "crazy creative" / "premium SaaS" / "editorial"을 다이얼 조작으로 매핑.
7. **조합 변량 엔진 (7축)**: 축마다 선택 수를 지정하고("Choose exactly 4", "Choose exactly 2"), "commit to it consistently"를 요구. `gpt-taste`의 Python 랜덤화, `high-end-visual-design`의 3×3 아키타입과 같은 계보.
8. **환경별 분기 (Codex vs 그 외)**: "Inside Codex, prioritize section clarity and extraction accuracy. **Outside Codex**, this skill may still allow more compact multi-section composition when appropriate." 도구 환경에 따라 규칙을 조정한 사례.
9. **추출 대상을 목록으로 완전 열거 (§9)**: 33개 항목. "Treat them like a **design specification**." / "Do not just glance at them."
10. **모호성 해결 우선순위 (§28)**: 7단계. "Do not fill ambiguity with generic defaults **too quickly**."
11. **21항목 최종 검증 (§35)** + **22단계 응답 행동 (§36)** + **3개 예시 해석 (§37)**: 절차·검증·예시의 3중 규정.
12. **예시 해석 (§37)**: "make me one hero section for an AI startup" / "design me an 8-section landing page" / "make a premium creative agency website with 4 sections" — 각각의 이미지 수와 처리를 명시. **few-shot 형태로 판단을 고정.**
13. **부정적 자기규정으로 시작**: "Your job is **not** to generate generic website mockups. Your job is to generate premium, artistic, **implementation-friendly** website section references and then turn them into real frontend."
14. **참조 대상**: 브랜드명·디자이너명이 **없다.** "Swiss rational hierarchy", "Swiss grid discipline", "editorial serif + sans", "polaroid" 같은 사조·형식 어휘만 사용.
15. **페르소나 부여**: "You are an elite web design art director and implementation strategist." — art director(이미지)와 implementation strategist(코드) 두 역할.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**premium / art-directed**" | 7축 조합 변량 엔진 + 다이얼 8/3/8 + AI slop 5카테고리 회피 |
| "**implementation-friendly**" | 섹션당 큰 이미지 1장 + 추출 33항목 + 크롭 금지 + 고정 종횡비 미디어 프레임 |
| "**deeply analyzable**" | ANALYSIS_PRECISION 10 + "Treat them like a design specification" + §8~§9 |
| "**readable on a small laptop**" | 첫 화면에 5요소만 (헤드라인/보조 텍스트/간격/CTA/시각 초점) + 헤드라인 1–3줄 |
| "**a prison of containers**" (회피 대상) | 중첩 박스 — 카드 속 카드 속 카드, 거대 라운드 섹션 래퍼 |
| "**fake interface jargon**" | "00 orchestration layer", 기술적 status pill, runtime 마커, 의사 엔터프라이즈 마이크로카피 |
| "**nice-looking but unextractable**" | 텍스트가 작아 읽히지 않는 압축 보드 — **미학적으로 좋아도 실패로 규정** |
| "**generic coded reinterpretations after the image step**" | 디자인 드리프트 (§26, §27) |
| "**lazy**" (이미지 수) | 섹션 수보다 적은 이미지, 압축 보드 1장으로 여러 섹션 |
| "**calm or aggressive type**" | §22의 추출 대상 — 타이포그래피 기질을 이분법으로 판정 |
| "**faithful spacing logic**" vs "**exact pixel OCR**" | 간격의 **관계**를 재현하되 픽셀 측정은 아님 |
| "**one big design world**" (다중 이미지) | 같은 브랜드 세계/타입 스케일 로직/간격 규율/CTA 스타일/아이콘 무드/이미지 처리/톤/컴포넌트 패밀리 |
| "**let simplicity do part of the design work**" | 모든 영역을 UI로 채우지 않기 |
| "**visual tempo**" | 섹션마다 밀도·이미지비·정렬·스케일·여백·카드 그룹핑·배경 강도를 변화 |
| "**cinematic**" (히어로) | "a strong opening scene" + 단일 초점 + 여백 우선 + 1–3줄 헤드라인 |

## 7. 산출물

- **1차 산출물**: **디자인 레퍼런스 이미지들** (섹션당 1장 + 필요 시 상세/재생성 이미지)
- **2차 산출물**: 이미지 분석 (텍스트/타이포/간격/버튼/색/컴포넌트/레이아웃 추출)
- **3차 산출물**: 프론트엔드 코드 — "implement the website to match the generated design as closely as reasonably possible"
- **최종 파일 생성 시점**: "create the final files **only after the full analysis pass**" (§36-22)
- **프레임워크/스택**: **원문에 명시 없음**
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음** (이미지도 코드도)
- **이미지 저장 규칙**: **원문에 명시 없음** (`garden-skills/gpt-image-2`가 `garden-gpt-image-2/image/<task-slug>-<timestamp>.png`로 규정하는 것과 대비)

## 8. 주의점 / 한계

- **이미지 생성 능력이 없으면 스킬이 성립하지 않는다**: 전제가 "when image generation is available"이지만 **없을 때의 워크플로우가 원문에 없다.** `garden-skills/gpt-image-2`가 Mode A/B/C로 3가지 환경을 감지하고 각각의 행동을 규정하는 것과 극명하게 대비된다. 이 스킬의 가장 큰 구조적 공백.
- **비용이 통제되지 않는다**: 이미지 수를 늘리도록 4회 반복 강조하고, 게으름을 결함으로 규정하며, 재생성과 추가 상세 이미지를 권장한다. 12섹션 사이트라면 20장 이상이 될 수 있는데 **비용·시간 상한이 원문에 전혀 없다.** "Never reduce image count just for convenience if that harms quality"는 품질 우선 선언이지만, 예산 제약 상황의 처리가 없다.
- **이미지 생성 모델의 텍스트 렌더링 한계**: §21이 "extract it and use it"으로 이미지에서 텍스트를 읽어 쓰라고 요구한다. 그런데 이미지 생성 모델이 만든 텍스트는 깨지거나 무의미한 문자열이 되기 쉽다. 원문의 대응은 "generate a closer extraction image"뿐이며, **텍스트가 근본적으로 렌더링되지 않는 경우의 처리가 없다.**
- **디자인 값의 정밀도 한계**: 간격·크기를 이미지에서 "추출"하지만 원문 스스로 "The goal is **not exact pixel OCR**"이라고 인정한다. 즉 최종 코드의 수치는 근사이며, 정확한 디자인 시스템(토큰)이 필요한 프로젝트에는 부적합하다.
- **다이얼 9개의 실효성**: DESIGN_VARIANCE 8, ART_DIRECTION 8 같은 값이 이미지 생성 프롬프트에 어떻게 반영되는지 **매핑이 원문에 없다.** `design-taste-frontend-v1`은 다이얼 임계값으로 규칙을 발동시키지만(>4, >5, >7), 이 스킬은 다이얼과 규칙의 연결이 §1의 해석 문장 4개뿐이다.
- **모션 지침의 부재**: Motion-Implied Language 6개는 "not coding instructions"로 명시되어 있어, 실제 구현 단계의 모션 값(duration, easing, spring)이 **어디에서도 제공되지 않는다.** 정적 이미지에서 모션을 추출할 수 없으므로 이 부분은 구조적 공백이다. `prefers-reduced-motion`도 없다.
- **접근성 지침 부재**: 대비 비율, 포커스, alt text, 키보드, ARIA, 터치 타깃 모두 없다. 이미지 기반 워크플로우이므로 접근성이 자연스럽게 누락되는 구조인데 **경고조차 없다.**
- **스택 미지정의 양면**: 프레임워크·CSS 방식을 지정하지 않아 이식성이 높지만, 동시에 구현 단계의 구체적 지침이 없어 "충실하게 구현"의 방법론이 모델에 위임된다. 같은 컬렉션의 다른 스킬들이 Tailwind/React를 강제하는 것과 다른 선택.
- **"Codex" 종속 표현**: description과 본문이 "for Codex", "Inside Codex"를 반복한다. 다른 환경에서의 동작은 "Outside Codex, this skill may still allow more compact multi-section composition"이라는 한 문장뿐이다. 스킬을 다른 하네스에서 쓸 때의 조정 지침이 부족하다.
- **컬렉션 내 중복**: `imagegen-frontend-web` / `imagegen-frontend-mobile`이 이름상 같은 문제 영역(이미지+프론트엔드)을 다룰 가능성이 높고, AI slop 금지 목록은 `high-end-visual-design`·`design-taste-frontend-v1`·`redesign-existing-projects`와 겹친다 (퍼플/블루 그라디언트, Acme/Nexus, elevate/seamless/unleash/next-gen). **상호 참조나 역할 구분이 원문에 없다.**
- **질문 억제의 위험**: "Do not ask unnecessary follow-up questions if a strong interpretation is possible"가 §36에 있다. 8~12섹션 사이트를 이미지 수십 장으로 생성하기 전에 방향 확인이 없다면, 방향이 틀렸을 때 낭비가 크다. `garden-skills`의 Checkpoint 구조와 정반대 태도.
- **강한 경고 지점**:
  - "**this order is mandatory**" (이미지 → 분석 → 구현)
  - "**Do not begin with freeform coding first.**"
  - "**Do not be lazy with image count.**" (4회 반복)
  - "**it is better to generate too many clear images than too few compressed images**"
  - "Fresh section-specific generation is **strongly preferred over cropping**."
  - "**Do not just glance at them.** Treat them like a design specification."
  - "The goal is **not**: inspired by the image. The goal is: **visually faithful to the image**."
  - "**Do not fill ambiguity with generic defaults too quickly.**"
  - "**Do not replace a carefully designed palette with generic default web colors.**"
  - "**A section should not feel like a prison of containers.**"
  - "**Image 2, 3, or 8 must not drift into a different website.**"
- **검증 장치**: §35 CLARITY CHECK 21항목이 **이 컬렉션에서 가장 큰 검증 체크리스트**이며, 이미지 수·크롭 여부·추출 품질·드리프트를 모두 점검한다. §36의 22단계와 §37의 3개 예시가 절차를 고정한다. 다만 **전부 자기 선언**이며, 생성 이미지의 텍스트 정확성이나 코드-이미지 일치도를 객관적으로 확인하는 수단(스크린샷 비교, 브라우저 검증)이 **없다.**
