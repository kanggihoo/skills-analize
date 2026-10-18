# imagegen-frontend-web 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/imagegen-frontend-web/`
- **핵심 파일**: `SKILL.md` (36,854 bytes) — 단일 파일, **20개 섹션 + 2개 "READ FIRST" 블록**
- **보조 파일**: 없음
- **성격**: **웹 디자인 레퍼런스 이미지 생성 전용 스킬**. 코드를 만들지 않고 **섹션당 1장의 가로 이미지**를 생성한다. `image-to-code`가 "이미지 → 분석 → 코드"의 3단 전체를 다루는 반면, 이 스킬은 **1단계(이미지 생성)에만 특화**되어 있고 훨씬 상세하다.

원문 자기 규정: "You are an elite frontend image art director. Your job is not to generate generic AI art. Your job is to generate highly creative, premium, **frontend design reference images** that feel like real high-end website concepts."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Elite frontend image-direction skill for generating premium, conversion-aware website design references. **CRITICAL OUTPUT RULE — generate ONE separate horizontal image FOR EVERY section. A landing page with 8 sections produces 8 images. Never compress multiple sections into one image.** Enforces composition variety (not always left-text / right-image), background-image freedom, varied CTAs, varied hero scales (giant / mid / mini minimalist), narrative concept spine, second-read moments, and a single consistent palette across all images. Optimized for landing pages, marketing sites, and product comps that developers or coding models can accurately recreate."

**특징**: description 자체가 **출력 규칙을 CRITICAL로 선언**한다. 이 컬렉션에서 description에 출력 형식을 대문자로 강조한 유일한 사례.

**매칭되는 사용자 발화**
- "랜딩 페이지 디자인 시안 만들어줘"
- "8개 섹션 웹사이트 목업"
- "히어로 섹션 레퍼런스 이미지"
- "마케팅 사이트 comp"
- 용도 명시: "landing pages, marketing sites, and product comps"

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **코드 전 단계의 시각 방향 확정** — 클라이언트/팀 승인용 시안
- 다중 섹션 랜딩 페이지의 전체 스크롤 경험을 미리 보고 싶을 때
- 개발자나 코딩 모델이 재현할 레퍼런스가 필요할 때 — "that developers or coding models can accurately recreate"
- **전환(conversion) 구조를 시안 단계에서 검증**하고 싶을 때 — CONVERSION_DISCIPLINE 다이얼 + §18의 "hook → proof → action"
- 브랜드 성격에 맞는 방향을 여러 축에서 결정해야 할 때 — §2의 12개 선택 축

**부적합 / 과한 상황**
- **코드가 필요할 때** — 이 스킬은 이미지만 만든다. 후속 구현은 `image-to-code`나 다른 스킬로 넘겨야 하는데 **핸드오프 지침이 원문에 없다**
- 이미지 생성 도구가 없는 환경 — 전제가 무너짐 (§4 참조)
- 모바일 앱 UI → `imagegen-frontend-mobile` (자매 스킬)
- 대시보드·앱 내부 화면 — 이 스킬은 "landing pages, marketing sites, product comps"에 특화. §8이 "fake dashboards"를 slop으로 규정
- 비용·시간 제약 — 8섹션이면 8장, 12섹션이면 12장을 **반드시** 생성해야 한다

**형제 스킬 대신 이걸 고르는 기준**:
- **이미지만** 필요 → 이 스킬
- **이미지 + 코드** 전체 → `image-to-code`
- 모바일 → `imagegen-frontend-mobile`
- 코드 직행 → `high-end-visual-design` / `design-taste-frontend`

## 4. 외부 의존성

- **API 키**: **원문에 명시 없음.** 이미지 생성 능력이 전제이지만 도구·모델·키가 전혀 다뤄지지 않는다.
- **폴백 모드**: **부분적으로 존재.** 이미지 생성 자체가 불가능한 경우는 다루지 않지만, **한 번에 한 장만 렌더링 가능한 경우**를 명시적으로 처리한다:
  > "If you can only render one image at a time, output them **sequentially in the same response**, one after the other, until every section has its own image. Announce each one (\"Section 1 of 8: Hero\", \"Section 2 of 8: Trust bar\", etc.)."
  → 도구 제약을 우회하는 실용적 폴백. 이 컬렉션에서 드문 배려.
- **필요한 CLI/런타임/패키지**: 이미지 생성 도구 외에는 **없음.** 프론트엔드 스택·프레임워크·폰트 패키지 지정이 전혀 없다 (이미지 생성 스킬이므로 당연).
- **네트워크**: 이미지 생성 API 호출 시
- **비용 발생 지점**: **매우 크고 하한이 고정되어 있다.** 섹션 수 = 이미지 수가 절대 규칙이며, 애매하면 **높게 기본값**을 잡는다:
  - "landing page" → 6장
  - "full website" / "marketing site" → 8장
  - "product page" / "portfolio" → 6장
  → 사용자가 개수를 말하지 않아도 최소 6장이 생성된다. **비용 상한이나 확인 절차가 원문에 없다.**

## 5. 워크플로우

### 최상단 강제 규칙 2개 ("READ FIRST")

**① HARD OUTPUT RULE**
"**Generate one separate horizontal image PER section. Always. No exceptions.**"

| 요청 | 이미지 수 |
|---|---|
| 1 section | 1 |
| 4 sections | 4 |
| 8 sections | 8 |
| 12 sections | 12 |
| "landing page" (개수 없음) | **6** (기본) |
| "full website template" | **8** (기본) |

"Never combine multiple sections into one frame. Never return a single tall image that contains the whole page."
"**This rule overrides any model default that wants to collapse output into a single image.**"

**② HERO COMPOSITION BIAS**
"The default **left-text / right-image hero is the most overused AI pattern**. It is allowed, but **it should not be your first instinct**."
대안 9개 제시: centered over background image / bottom-left over image / bottom-right over image / top-left lead / stacked center / image-as-canvas / off-grid editorial / mini minimalist / right-text·left-image (inverted classic)
"Use left-text / right-image **only when it is genuinely the strongest choice** — not by default."

### §19 RESPONSE BEHAVIOR — 16단계 (원문의 번호 오류 포함, 5가 2회)
1. infer site type and primary conversion goal
2. infer number of sections (불명확 시 §5 기본값)
3. "**commit out loud** to the section count and announce it (\"Generating N horizontal images, one per section\")"
4. plan ONE horizontal image PER SECTION
5. choose Hero Scale for the whole site (giant / mid / mini)
5(원문 중복 번호). choose a strong visual combination (theme, type, hero arch, section system, motion, narrative spine, second-read moment)
7. 섹션별로 Composition Anchor / Background Mode / CTA Variation 선택 — 섹션 간 변화
8. 서명 컴포넌트 4개 선택
9. 히어로 미니멀리즘 + 섹션 크기 변화 강제
10. 전체 화면(full-bleed) 배경 포함 강한 이미지 사용 강제
11. **하나의 일관된 팔레트를 전체 이미지에 고정**
12. §18 EXTRA CREATIVITY & IMPLEMENTATION EDGE 적용
13. 간격을 관대하고 균일하고 깨끗하게
14. AI slop 제거
15. §17 CLARITY CHECK 실행
16. "**generate every per-section horizontal image, labeled \"Section X of N: <name>\"**, until the full set is delivered. **Do not stop early. Do not summarize. Do not return only one image.**"

추가: "Do not ask unnecessary follow-up questions if a strong interpretation is possible."

### §2 조합 변량 엔진 — **12개 선택 축** (이 컬렉션 최다)

| 축 | 선택 수 | 범위 |
|---|---|---|
| Theme Paradigm | 1 | 4개 |
| Background Character | 1 | 4개 |
| Typography Character | 1 | 6개 |
| Hero Architecture | 1 | 6개 |
| Section System | 1 | 6개 |
| **Signature Component Set** | **정확히 4개** | 12개 |
| **Motion-Implied Language** | **정확히 2개** | 6개 |
| **Composition Anchor** | **섹션당 1개** | 10개 |
| **Background Mode** | **섹션당 1개** | 12개 |
| **CTA Variation** | 섹션에 맞게 | 6개 |
| **Hero Scale** | 페이지당 1개 | 3개 |
| **Narrative / Concept Spine** | 1 | 6개 |
| **Second-Read Moment** | **정확히 1개** | 5개 |

→ `image-to-code`의 7축보다 5축이 더 많고, **섹션 단위 선택(anchor/background)**과 **페이지 단위 선택(hero scale/narrative spine/second-read)**을 분리한 것이 특징.

### §1 Brief-to-direction mapping — **브리프 → 다이얼·선택 매핑표 (7가지 케이스)**

이 컬렉션에서 가장 정교한 "사용자 어휘 → 조작" 번역표다.

| 브리프 키워드 | Hero Scale | Background Mode | Gradients | Composition |
|---|---|---|---|---|
| "minimalist / clean / typography-only / swiss / ultra simple" | **Mini Minimalist** | solid surfaces, subtle texture, optional ONE color-blocked diptych | skip 또는 가장 부드러운 tonal만 | stacked center, generous negative space. **"Skip the 'must include full-bleed' rule"** |
| "editorial / magazine / art-directed / fashion" | Mid Editorial 또는 Giant Statement | editorial side-image, duotone treated image, atmospheric photo grade | subtle tonal grades only | off-grid editorial offset, asymmetric pulls |
| "cinematic / atmospheric / premium / luxury / bold" | **Giant Statement** | full-bleed image + tonal overlay, soft radial vignette + product, micro-noise gradient | cinematic palette-matched welcomed | bottom-left over background image, centered low, image-as-canvas |
| "SaaS / product / dashboard / fintech / infra" | Mid Editorial | solid + inline asset, flat block + detail crop, occasional editorial side-image | very subtle, palette-matched only | clear product framing, trust-driven anchors. "Slightly higher implementation clarity" |
| "agency / creative studio / portfolio" | Giant Statement **또는** Mini Minimalist (**decisive**) | vary boldly (full-bleed, color-blocked diptych, duotone) | editorial color washes acceptable | off-grid, poster-like |
| "e-commerce / shop / store / product page" | Mid Editorial + 강한 제품 초점 | full-bleed product photo, soft radial vignette + crop, flat block + detail | subtle, **never competing with product** | product-led; CTAs unmistakable |
| 스타일 무언급 | §1+§2 기본값 + 확신 있는 배경 변화 | — | — | "Pick one Hero Scale **decisively**, do not split the difference" |

핵심 원칙: "**Never force backgrounds, gradients, or full-bleed treatments where the brief asks for restraint. Never strip them out where the brief asks for atmosphere.**" 그리고 "**the user's brief always overrides defaults**".

### §17 CLARITY CHECK — 21항목
(전문은 §6 참조) 특히 20번이 이 스킬의 핵심 검증:
> "Is the **total number of images equal to the number of sections** (never fewer)?"
그리고 대응 지침: "**If the count is wrong, regenerate the missing sections.** If the hero feels like a reflexive left-text / right-image default, prefer a different composition anchor."

### §18 Composition variety check — **정량적 거부 조건**
"Across all per-section images, **internally log** the chosen composition anchor and background mode. **Reject the set if**:"
- "the same composition anchor repeats **more than 2 sections in a row**"
- "the same background mode repeats **more than 3 sections in a row**"
- "**every section is inline-asset (no full-bleed background ever appears) AND the brief does not call for minimalism / typography-only / swiss / ultra simple**"

"For non-minimalist briefs: push for **at least one full-bleed** (or duotone / atmospheric) background and **at least one mini minimalist section** in any multi-section site."
"For minimalist briefs: **this rule is suspended. Restraint is the design.**"

→ **이 컬렉션에서 유일하게 "선택 이력을 기록하고 정량 조건으로 거부"하는 검증 장치.**

**사용자 확인 요구 지점**: **없음.** 단 §19-3이 섹션 수를 "commit out loud"로 선언하게 하므로, 사용자가 개입할 기회는 그 시점에 생긴다.

## 6. 디자인 지침 분석

### §1 다이얼 8개

| 다이얼 | 기본값 | 범위 |
|---|---|---|
| DESIGN_VARIANCE | **8** | 1 = rigid/symmetrical, 10 = artsy/asymmetric |
| VISUAL_DENSITY | **4** | 1 = airy/gallery-like, 10 = packed/intense |
| ART_DIRECTION | **8** | 1 = safe commercial, 10 = bold creative statement |
| IMPLEMENTATION_CLARITY | **9** | 1 = loose moodboard, 10 = very codeable UI reference |
| IMAGE_USAGE_PRIORITY | **9** | 1 = mostly typographic, 10 = strongly image-led |
| SPACING_GENEROSITY | **8** | 1 = compact/tight, 10 = very spacious/breathable |
| LAYOUT_VARIATION | **8** | 1 = same anchor repeats, 10 = bold composition variety |
| CONVERSION_DISCIPLINE | **8** | 1 = pure art moodboard, 10 = clear funnel + premium design balance |

(`image-to-code`의 9개와 6개가 겹치고, `LAYOUT_VARIATION`·`CONVERSION_DISCIPLINE`이 이 스킬 고유)

### 금지 규칙 (anti-pattern) — 원문 그대로

**서두: 이미지 생성의 붕괴 패턴 10개**
"centered dark hero / purple/blue AI glow / floating meaningless blobs / generic dashboard card spam / weak typography hierarchy / cloned sections / \"**luxury**\" that is just beige serif text / \"**creative**\" that is actually messy and unreadable / text-heavy layouts with not enough imagery / overly dense sections with no breathing room"

**§8 ANTI-AI-SLOP RULES** — 7개 카테고리 (`image-to-code`의 5개보다 2개 많음)

*Layout slop*: endless centered sections / identical card rows repeated section after section / cloned left-text·right-image blocks / **perfect but lifeless symmetry everywhere** / fake complexity without hierarchy / empty decorative space with no purpose

*Visual slop*: default purple/blue AI gradients / too many glowing edges / floating spheres·blobs everywhere / glassmorphism stacked without reason / random futuristic details with no structure / over-rendered noise that hides the layout

*Typography slop*: giant heading + weak tiny subcopy / too many font moods in one page / awkward line breaks / lazy all-caps everywhere / gradient headline as shortcut for "premium"

*Content slop*
- 카피: **unleash / elevate / revolutionize / next-gen / seamless / powerful solution / transformative platform**
- 가짜 브랜드: **Acme / Nexus / Flowbit / Quantumly / NovaCore / obvious nonsense wordmarks**

*Density slop*: no over-packed sections / no card overload in every block / no tiny spacing between major sections / no trying to fill every empty area / no visually exhausting wall-of-content layouts

*Carousel / marquee slop (layout)* — **이 스킬 고유**
- "infinity logo strips repeating **the same 6 blobs**"
- "\"trusted by\" ticker that is **unreadable mosquito logos**"
- "auto-play-style hero dots with no semantic purpose"

*Data / KPI slop* — **이 스킬 고유**
- "three identical stat columns (**99% satisfaction, $10 saved, ∞ scale**) unless user asked for KPIs"
- "fake dashboards with pointless charts shading the real layout"

**§4 히어로 금지**
- "avoid stuffing the hero with pills, fake stats, badges, tiny logos, and nonsense detail"
- Typography Execution — "Avoid: random extra-bold shouting everywhere / **gradient text as a lazy premium effect** / **6-line startup headings** / text treatment that looks generated"
- Graphic Restraint — "Do not default to: **giant meaningless outline numbers** / **cheap SVG-looking filler graphics** / generic AI blobs / **random orb clutter**"

**§13 Gradient Discipline — 허용/금지를 명시적으로 분리 (이 스킬의 특징)**
> "Gradients are **allowed and encouraged** when professional and subtle. **They are not the same as AI slop gradients.**"

*Allowed (use confidently)*:
- "low-chroma palette-matched tonal gradients (e.g. **ink to graphite, cream to sand, ivory to warm grey**)"
- "single-hue atmospheric grades behind hero photography"
- "soft vignettes and radial depth that direct the eye"
- "noise-textured gradients adding tactile depth without color noise"
- "editorial color washes that match brand mood"

*Banned (AI gradient slop)*:
- "rainbow / mesh blob gradients"
- "**purple-to-blue \"AI\" defaults**"
- "**pink-to-orange \"creator\" defaults**"
- "neon edges and glow halos with no purpose"
- "gradient text as a shortcut for \"premium\""
- "gradients that compete with imagery instead of supporting it"

**§13 Background Confidence Rule**
"**Do not retreat to plain white surfaces by default.**" → 브리프·브랜드 무드·섹션 역할이 분위기를 요구하면 full-bleed 이미지 / duotone·graded photo / tonal gradient / tactile material / 확신 있는 flat color field를 "picked **deliberately**, not as decoration"

**§7 이미지 사용 금지**
"Avoid: tiny useless thumbnails / random decorative images with no structural role / **one single image and then a completely text-heavy rest of page** / overusing fake UI panels instead of real visual variety"

**§14 이미지 방향 금지**: irrelevant scenery / stock-photo cliches / decorative junk / visuals that overpower the page hierarchy

**§6 창의성 금지**: "do not default to safe template layouts / repeat the same block structure too often / **confuse creativity with clutter** / make the page overly dense"

**§16 다중 이미지 일관성**: "**Anything that breaks brand recall is over-variation.**"

**§3**: "Do not produce vague abstract artwork when the request is for frontend."

### 강제 규칙 — 수치 인용

**이미지 수·형식 (§5)** — 이 스킬의 핵심 수치
- 섹션 수 = 이미지 수 (절대)
- 기본값: landing page **6**, full website **8**, marketing site **8**, product page **6**, portfolio **6**, hero **1**
- 형식: "**Always horizontal (16:9, 16:10, or 21:9** depending on density)"
- "Hero usually **16:9 or 21:9**; narrower content sections may be **16:10**"
- 라벨: "**Section X of N: <name>**"

**히어로 (§4)**
- "headline should usually read like **5-10 strong words**, not a paragraph"
- "centered low (text in **lower 40%** over hero image)"

**팔레트 (§13)** — 4층 구조
- "**1 primary** (brand anchor) / **1 secondary** (supporting tone) / **1 accent** (used sparingly for CTA / highlight) / **a neutral scale** (background, surface, text, hairline)"
- "Section-level mood shifts must reuse the same palette — **no full theme swap per section**"

**변량 검증 임계값 (§18)**
- 동일 composition anchor 연속 **3개 이상** 금지 ("more than 2 sections in a row")
- 동일 background mode 연속 **4개 이상** 금지 ("more than 3 sections in a row")
- 비미니멀 브리프: 최소 **1개** full-bleed 배경 + 최소 **1개** mini minimalist 섹션

**선택 개수 (§2)**
- Signature Component Set: **정확히 4개**
- Motion-Implied Language: **정확히 2개**
- Second-Read Moment: **정확히 1개**
- Composition Anchor: 사이트 전체에서 최소 **3개 서로 다른** anchor 등장
- CTA 스타일: 사이트 전체에서 최소 **1회** 변화

**창의성 에스컬레이션 (§6)**: "Actively increase **at least 3** of these" (9개 항목 중)

**이미지 다양성 (§18)**: "Mix **at least two distinct image crops** where multiple sections exist"

**교차 대비 (§18)**: "deliberately vary foreground/background intensity **at least twice** (lighter → richer → calmer)"

**섹션 팩 (§15)**: 4 / 8 / 12 섹션 구성 (`image-to-code`와 동일)

**editorial side-image 비율 (§2)**: "**50/50, 60/40, 40/60** — invertible"

### 항목별 지침

**타이포그래피 (§2, §4, §9)**
- 6개 Typography Character: "**Satoshi-like** clean grotesk / **Neue-Montreal-like** refined grotesk / **Cabinet / Clash-like** expressive display / **Monument-like** compressed statement typography / elegant editorial serif + sans pairing / Swiss rational sans with very strong hierarchy"
- "**Never drift into boring default web typography energy.**"
- 실행: "medium / normal / light elegance / tight tracking / controlled line count / strong scale contrast"
- §9: "Typography is not filler. Typography is a **primary design material**." + 방향별 역할 (editorial = 구성을 형성 / tech·product = 신뢰와 정밀을 전달)
- 폰트 이름을 "-like"로 표현한 것이 특징 — 실제 라이선스 폰트가 아니라 **시각 성격**을 지시

**컬러 (§13)**
- 4층 팔레트 (primary / secondary / accent / neutral scale)
- Theme Paradigm 4개에 색 서술: "Off-white / cream / paper tones, sharp dark text" (Pristine Light) / "Charcoal / graphite / zinc, elegant glow only when justified" (Deep Dark) / "**oxblood, royal blue, forest, vermilion, or emerald**" (Bold Studio Solid) / "**Bone, sand, taupe, stone, smoke**, muted contrast, restrained luxury" (Quiet Premium Neutral)
- 그라디언트 허용/금지 명시 분리
- 배경 이미지 조화: "the image must **tonally match** the palette (not fight it) / use overlays (dark, light, or color tint) to keep text fully readable / the brand accent stays consistent regardless of background image"
- **hex 값은 원문에 없음** (이미지 생성이므로 색 이름으로 서술)
- 대비 비율 수치는 **원문에 없음**

**스페이싱 (§12)**
- "Leave **slightly more blank space** between sections than a default AI-generated design would."
- "use more **even** vertical spacing between major sections"
- "avoid one section feeling very cramped while the next feels too empty"
- "**separate denser sections with calmer sections**"
- "Whitespace is a design tool. Use it deliberately. **Do not let spacing become random.**"
- 수치는 **없음** (SPACING_GENEROSITY 8 다이얼로만)

**모션 (§2 Motion-Implied Language)**
- 6개 중 **정확히 2개**: scrubbing text reveal / pinned narrative section / staggered float-up / parallax image drift / smooth accordion expansion / cinematic fade-through
- **결정적 단서**: "These are **not coding instructions**. They are **visual-direction cues the generated design should imply**."
- duration/easing/spring 값, `prefers-reduced-motion` 모두 **원문에 없음** (정지 이미지 스킬)

**레이아웃 (§2, §5, §10, §11)**
- 10개 Composition Anchor (섹션당 1개, 사이트 전체 최소 3종)
- 12개 Background Mode (섹션당 1개, 페이지 전체에서 변화)
- 3개 Hero Scale (Giant Statement / Mid Editorial / Mini Minimalist). "**Mini does not mean weak — it means confident restraint.**"
- §5 섹션 크기 변화: "some sections are large, content-rich, art-directed / some sections are **mini, ultra minimalist, mostly negative space** / some sections are medium editorial blocks" → "This rhythm creates a **premium scrollscape**, not uniform slabs."
- §10 섹션 리듬 변화 축 8개: density / image-to-text ratio / alignment / scale / whitespace / card grouping / background intensity / visual tempo
- §11 컴포넌트 실행 가이드 8개 — 각 컴포넌트의 "should feel X, not Y" 형식:
  - Diagonal Staggered Square Masonry: "should feel **curated and graphic, not messy**"
  - 3D Cascading Card Deck: "should feel **premium and tactile, not gimmicky**"
  - Hover-Accordion Slice Layout: "In static images, **imply interaction clearly through proportions and emphasis**"
  - Pristine Gapless Bento Grid: "**No accidental gaps.**"
  - Turning Polaroid Arc: "should feel **styled and intentional, not scrapbook-random**"
  - Off-Grid Editorial Layout: "asymmetry and tension **with control**. Must remain readable"
  - Product UI Panel Stack: "**Avoid generic fake dashboards.**"
  - Vertical Rhythm Lines: "**Never let them become decorative clutter.**"

**접근성** — 거의 없다. 근접 항목:
- "use overlays ... to keep text **fully readable**" (§13)
- §18 "**Mobile-implied fidelity (even for desktop mocks)**: Maintain **tap-friendly hit sizes** and **readable caption sizes** visually; stacking order should imply a sane single-column narrative." — 이 컬렉션 이미지 스킬 중 유일한 접근성 인접 항목
- 대비 비율, alt text, ARIA, `prefers-reduced-motion` 모두 **없음**

**전환(conversion) — 이 스킬 고유 축**
- CONVERSION_DISCIPLINE 다이얼 8
- "Stay conversion-aware: **every section has a job (hook / proof / educate / convert)**"
- §18 Conversion focus: "the hero communicates value in seconds and offers **one obvious next action** / proof sections (logos, quotes, metrics) feel **earned, not stuffed** / pricing or CTA sections feel **decisive, not buried** / the final section closes: a single strong CTA + supporting trust cue"
- "**Avoid pure mood reels with no funnel logic.**"
- §18 CTA specificity: "**one unmistakable primary action per major viewport tier**; secondary actions must **look secondary** (scale, outline, ghost), not clones of primary"

### 지침을 주는 방식 자체

1. **출력 규칙을 최상단에 "READ FIRST"로 배치**: 두 개의 규칙(이미지 수, 히어로 구성 편향)을 §1 앞에 놓고 "This rule **overrides any model default**"로 우선순위를 선언. 이 컬렉션에서 유일한 배치 전략.
2. **모델의 특정 습관을 이름 지어 차단**: "The default left-text / right-image hero is **the most overused AI pattern**"을 두 곳(READ FIRST, §4)에서 반복하고, **자기 점검 질문**까지 제공 — "Before rendering the hero image, ask yourself: '**Am I drafting the default text-left / image-right layout out of habit?**' If yes, prefer a different anchor."
3. **브리프 → 조작 매핑표 (§1)**: 7가지 브리프 유형에 대해 Hero Scale / Background Mode / Gradients / Composition을 각각 지정. **이 컬렉션에서 가장 정교한 어휘 번역 장치.** 그리고 "the user's brief **always overrides** defaults"로 우선순위 명시.
4. **선택 축을 스코프별로 분리 (§2)**: 사이트 전체(theme/type/hero arch/section system/hero scale/narrative spine/second-read) vs 섹션별(composition anchor/background mode/CTA variation). 일관성과 변화를 구조적으로 양립.
5. **정량 거부 조건 (§18)**: 선택 이력을 기록하고 "동일 anchor 3연속" / "동일 background 4연속" / "full-bleed 전무"를 거부 사유로. **이 컬렉션에서 유일하게 검증이 정량적.**
6. **허용/금지의 명시적 분리 (§13 Gradient)**: 그라디언트를 통째로 금지하지 않고 "allowed and encouraged"와 "banned AI gradient slop"을 각 5~6항목으로 분리. **"AI 티"의 원인을 기법이 아니라 실행 품질로 진단.**
7. **미니멀 브리프에 규칙 유예**: "For minimalist briefs: **this rule is suspended. Restraint is the design.**" 그리고 §1의 매핑표에도 "Skip the 'must include full-bleed' rule". **규칙의 예외를 브리프 유형에 연동한 사례.**
8. **컴포넌트별 "should feel X, not Y" (§11)**: 8개 컴포넌트 각각의 성공/실패 방향을 대조로.
9. **서사 축 도입 (Narrative / Concept Spine)**: 6개 은유 — Artifact·collectible / Journey·pilgrimage / Tool·precision instrument / Living system·garden / Stage·spotlight / Archive·dossier. "let it **thread through visuals and short copy** across the page." **디자인에 개념적 일관성을 부여하는 축이며 이 컬렉션에서 유일.**
10. **Second-Read Moment**: "Pick **exactly 1** unobvious but legible motif and place it **deliberately, once** across the page" + "**Avoid gimmick-for-gimmick: the moment must aid scan order or brand recall.**" **의도적 예외 1개를 설계에 편입.**
11. **한 장씩만 렌더링 가능한 경우의 폴백**: 순차 출력 + 라벨링. 도구 제약을 인정한 실용적 처리.
12. **"commit out loud" (§19-3)**: 섹션 수를 선언하게 해 조용한 축소를 차단.
13. **전환(conversion) 축의 도입**: 이 컬렉션의 다른 스킬들이 미학만 다루는 데 반해 "every section has a job (hook / proof / educate / convert)"을 규정. "Avoid pure mood reels with no funnel logic."
14. **문화·지역 정렬 (§18)**: "When the brief names an industry or region, steer palette and typographic temperament to match — **don't ship default \"neutral SF startup\"** unless the brief is intentionally generic SaaS."
15. **데이터 시각화 절제 (§18)**: "Charts, sparklines, and graphs appear **only when the site type logically needs them** (analytics, pricing, infra, observability brands). Else keep proof **human** (quotes, receipts, timelines, screenshots of real workflows)."
16. **참조 대상**: Awwwards (제목). 폰트는 "-like"로 성격만 지시 (Satoshi-like, Neue-Montreal-like, Cabinet/Clash-like, Monument-like). 브랜드·디자이너 실명 참조는 없음.
17. **페르소나 부여**: "You are an elite frontend image art director."

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**AWWWARDS-LEVEL**" | 다이얼 8/4/8/9/9/8/8/8 + 12축 조합 + AI slop 7카테고리 회피 + 섹션당 1이미지 |
| "**\"luxury\" that is just beige serif text**" (회피) | 실패 사례로 명시 — 미학 어휘의 표면적 적용을 결함으로 규정 |
| "**\"creative\" that is actually messy and unreadable**" (회피) | 동일 |
| "**premium scrollscape**" vs "**uniform slabs**" | 섹션 크기를 large/mini/medium으로 의도적 혼합 |
| "**Mini does not mean weak — it means confident restraint**" | Mini Minimalist Hero = 작은 로고 + 짧은 문장 + 얇은 CTA + 대부분 여백 |
| "**second-read moment**" | 5개 모티프 중 1개를 페이지 전체에 1회만. "must aid scan order or brand recall" |
| "**professional and subtle**" (그라디언트) | ink→graphite, cream→sand, ivory→warm grey (low-chroma palette-matched) |
| "**AI gradient slop**" | rainbow/mesh blob, purple→blue, pink→orange, neon glow halo |
| "**Do not retreat to plain white surfaces by default**" | full-bleed 이미지 / duotone / tonal gradient / tactile material / 확신 있는 flat color field 중 선택 |
| "**one brand world**" (다중 이미지) | 같은 팔레트·액센트 로직 / 타이포 패밀리·스케일 / CTA 패밀리 / border radius 언어 / 이미지 처리(색보정·재질·프레이밍) / 카피의 톤 |
| "**over-variation**" | "Anything that breaks brand recall" |
| "**earned, not stuffed**" (proof 섹션) | 로고·인용·지표가 진짜로 느껴지게 |
| "**decisive, not buried**" (pricing·CTA) | — |
| "**unreadable mosquito logos**" | "trusted by" 티커의 실패 형태 |
| "**the same 6 blobs**" | 무한 로고 스트립의 실패 형태 |
| "**99% satisfaction, $10 saved, ∞ scale**" | KPI slop의 구체적 실패 예시 |
| "**neutral SF startup**" (회피) | 산업·지역이 명시되었는데 기본 톤을 쓰는 것 |
| "**confident restraint**" / "**bold but controlled**" | §6의 "at least 3" 창의성 증가 + "Creativity must feel intentional, not chaotic" |
| "**text-heavy layouts with not enough imagery**" | IMAGE_USAGE_PRIORITY 9 + "several sections should meaningfully include imagery" |
| "**one single image and then a completely text-heavy rest of page**" | 이미지 사용의 실패 형태로 명시 |

## 7. 산출물

- **형식**: **가로 이미지 N장** (N = 섹션 수). 코드는 산출하지 않는다.
- **종횡비**: 16:9 / 16:10 / 21:9. "Hero usually 16:9 or 21:9; narrower content sections may be 16:10"
- **라벨링**: "**Section X of N: \<name\>**"
- **선언**: 시작 시 "Generating N horizontal images, one per section"
- **완결 요구**: "**Do not stop early. Do not summarize. Do not return only one image.**"
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- **후속 핸드오프**: **원문에 명시 없음.** 생성된 이미지를 코드로 옮기는 단계에 대한 언급이 전혀 없다 (`image-to-code`가 그 역할이지만 상호 참조 없음).

## 8. 주의점 / 한계

- **비용 하한이 고정되어 있고 통제 수단이 없다**: 섹션 수 = 이미지 수가 절대 규칙이고, 개수 미지정 시 기본값이 6~8이다. 사용자가 "랜딩 페이지 시안 보여줘"라고만 해도 **6장이 생성된다.** 확인 절차나 비용 경고가 **원문에 전혀 없다.** 오히려 "Do not ask unnecessary follow-up questions"로 확인을 억제한다.
- **이미지 생성 실패 시의 처리 부재**: 한 장씩만 렌더링 가능한 경우는 다루지만, **이미지 생성 자체가 불가능한 환경의 폴백이 없다.** `garden-skills/gpt-image-2`의 Mode C(프롬프트 고문)에 해당하는 경로가 없다.
- **텍스트 렌더링 한계**: 이미지에 헤드라인·CTA·라벨·가격표·FAQ가 들어가야 하는데(§15의 12섹션 팩), 이미지 생성 모델의 텍스트는 깨지기 쉽다. 원문이 "readable"을 반복 요구하지만 **텍스트가 렌더링되지 않는 경우의 대응이 없다.** `IMPLEMENTATION_CLARITY 9`와 "developers or coding models can accurately recreate"라는 목표가 이 한계에 직접 부딪힌다.
- **후속 단계와의 연결 부재**: 이 스킬은 이미지만 만들고 끝난다. 그 이미지를 코드로 옮기는 것이 `image-to-code`의 역할인데 **양쪽 모두 상호 참조가 없다.** 게다가 `image-to-code`는 자기가 이미지를 직접 생성하도록 되어 있어, 두 스킬을 연결해 쓰는 방법이 불명확하다.
- **`image-to-code`와의 광범위한 중복**: 조합 변량 엔진(7축 vs 12축), 섹션 팩(4/8/12, 동일), AI slop 목록, 다이얼(6개 공통), 히어로 규칙, 간격 규율, CLARITY CHECK(21항목, 다수 동일 문항)이 겹친다. 이 스킬이 이미지 생성 부분을 확장한 판본으로 보이지만 **버전 관계나 역할 분담이 원문에 명시되지 않았다.**
- **모션 지침이 무의미하게 남아 있다**: Motion-Implied Language 2개를 선택하게 하지만 정지 이미지이므로 실제 모션은 구현되지 않는다. "not coding instructions"라고 명시되어 혼동은 없으나, 이 정보가 후속 코드 단계로 전달되는 경로가 **없다.**
- **접근성 지침 부재**: §18의 "tap-friendly hit sizes"와 "readable caption sizes"가 유일한 언급이다. 대비 비율, alt text, 키보드, ARIA는 없다. 다만 이미지 산출물이므로 직접적 접근성 요구는 낮다.
- **다이얼 기본값의 편향**: DESIGN_VARIANCE 8 + ART_DIRECTION 8 + LAYOUT_VARIATION 8이므로 **기본 산출물이 매우 비대칭·실험적**이다. 보수적 결과를 원하면 브리프에서 명시해야 하며, §1의 매핑표가 이를 처리하지만 **description에는 이 편향이 드러나지 않는다.**
- **§19의 번호 오류**: 단계 번호가 1,2,3,4,5,5,7,8,…로 5가 두 번 나온다. 사소하지만 문서 품질의 지표.
- **"commit out loud"의 실효성**: 섹션 수를 선언하게 하지만 사용자 승인을 기다리지 않는다. 선언 직후 생성이 시작되므로 개입 여지가 실질적으로 없다.
- **강한 경고 지점**:
  - "**Generate one separate horizontal image PER section. Always. No exceptions.**"
  - "**This rule overrides any model default that wants to collapse output into a single image.**"
  - "The default left-text / right-image hero is **the most overused AI pattern**."
  - "**Am I drafting the default text-left / image-right layout out of habit?**"
  - "**Do not stop early. Do not summarize. Do not return only one image.**"
  - "**Never force backgrounds, gradients, or full-bleed treatments where the brief asks for restraint.**"
  - "**Do not retreat to plain white surfaces by default.**"
  - "**Anything that breaks brand recall is over-variation.**"
  - "**Avoid pure mood reels with no funnel logic.**"
  - "**Avoid gimmick-for-gimmick.**"
  - "For minimalist briefs: **this rule is suspended. Restraint is the design.**"
- **검증 장치 (이 컬렉션 최고 수준)**: §17 CLARITY CHECK 21항목 + §18의 **정량 거부 조건**(anchor 3연속, background 4연속, full-bleed 전무) + "internally log the chosen composition anchor and background mode" + 개수 불일치 시 "regenerate the missing sections". **선택 이력을 기록해 정량 조건으로 판정하는 유일한 스킬**이며, 이 점이 다른 taste-skills 대비 뚜렷한 강점이다. 다만 전부 자기 선언이며 실행 가능한 검증은 없다.
