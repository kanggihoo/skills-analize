# imagegen-frontend-mobile 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/imagegen-frontend-mobile/`
- **핵심 파일**: `SKILL.md` (40,326 bytes) — 단일 파일, **38개 섹션**. 이 컬렉션에서 `design-taste-frontend`(87KB) 다음으로 큰 파일
- **보조 파일**: 없음
- **성격**: **모바일 앱 화면·플로우 이미지 생성 전용 스킬**. `imagegen-frontend-web`의 모바일 판본이며, 웹판이 "섹션당 1 이미지"를 강제하는 자리에 이 스킬은 **"화면당 1 이미지 + 플로우 논리 + 디바이스 목업 프레임"**을 강제한다.

원문 자기 규정: "You are an elite mobile product design art director. Your job is not to generate generic app mockups. Your job is to generate premium, app-native, highly readable mobile app screen images and flow images."

**명시적 코드 금지** (이 스킬의 특징): "This skill generates images only. **Do not switch into coding mode. Do not describe code. Do not build SwiftUI, React Native, Flutter, or HTML.**"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Elite mobile app image-generation skill for creating premium, app-native screen concepts and flows. Designed for iOS, Android, and cross-platform mobile products. Prioritizes clean hierarchy, comfortably readable text, strong multi-screen consistency, controlled color palettes, non-generic creative direction, textured surfaces, image-led composition, tasteful custom iconography, and clean phone mockup framing. **By default, screens should be shown inside a subtle premium iPhone or similar phone mockup with a visible frame, while the main focus stays on the app content itself. This skill generates images only. It does not write code.**"

**본문이 적용 범위를 양방향으로 명시 (§CORE DIRECTIVE)**

*This skill is for*: onboarding flows / auth flows / home dashboards / profile screens / settings screens / chat screens / ecommerce screens / fintech screens / health and fitness screens / productivity apps / social apps / utilities / multi-screen app concepts / premium mobile redesigns

*This skill is **not** for*: **websites / landing pages / desktop dashboards / image-to-code / frontend implementation / code generation**

→ **자매 스킬 3개(`imagegen-frontend-web`, `image-to-code`, 코드 생성 계열)를 명시적으로 배제한 유일한 스킬.** 이 컬렉션에서 가장 명확한 역할 경계.

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 모바일 앱 컨셉을 **플로우 단위로** 시각화할 때 — 온보딩, 인증, 브라우즈→상세, 카트→체크아웃
- iOS / Android / 크로스플랫폼 중 하나의 네이티브 느낌을 확정해야 할 때 (§2 Platform Mode)
- 앱 카테고리별 톤이 필요할 때 — §33이 6개 카테고리(Fintech / Health·Fitness / Productivity / Social / Commerce / Wellness·Lifestyle)별 편향 제공
- 디바이스 목업 프레임에 담긴 프레젠테이션 자료가 필요할 때 (기본 동작)
- "AI 티 나는 앱 목업"을 피해야 할 때 — §21이 모바일 특화 AI tell 4카테고리 제공

**부적합 / 과한 상황**
- **웹사이트·랜딩페이지·데스크톱 대시보드** — 원문이 명시적으로 배제
- **코드가 필요할 때** — "It does not write code"가 description과 본문에 각각 명시
- 이미지 생성 도구가 없는 환경 — 폴백이 **원문에 없음**
- 비용·시간 제약 — 플로우를 요청하면 여러 화면이 강제 생성되고, 약하면 **재생성**까지 요구
- 실제 구현 사양이 필요할 때 — 이미지에서 값을 추출하는 절차가 없다 (`image-to-code`가 그 역할)

**형제 스킬 대신 이걸 고르는 기준**: **모바일 앱 화면 이미지인가.** 원문이 배제 목록으로 경계를 확정했으므로 판단이 명확하다.

## 4. 외부 의존성

- **API 키**: **원문에 명시 없음.** 이미지 생성 능력이 전제이지만 도구·모델·키가 다뤄지지 않는다.
- **폴백 모드**: **없다.** `imagegen-frontend-web`이 "한 번에 한 장만 렌더링 가능한 경우" 순차 출력을 규정한 것과 달리, 이 스킬은 그런 처리가 없다. 이미지 생성 불가 환경의 대응도 없다.
- **필요한 CLI/런타임/패키지**: 이미지 생성 도구 외에는 **없음.** 프레임워크·폰트 패키지 지정 없음 (오히려 SwiftUI/React Native/Flutter/HTML 작성을 금지).
- **네트워크**: 이미지 생성 API 호출 시
- **비용 발생 지점**: **크다.** IMAGE_GENERATION_EAGERNESS 다이얼이 **10**(최대)이고 §4가 "Do not be lazy with screen count"를 명령한다. 플로우 요청 시 여러 화면 + 상세 렌더 + **§34의 재생성**까지 누적된다. **비용 상한·확인 절차가 원문에 없다.**

## 5. 워크플로우

### §36 RESPONSE BEHAVIOR — 28단계 (이 컬렉션 최다)
1. infer app category
2. infer platform mode
3. infer number of screens
4. choose a strong visual direction
5. choose an image art direction bias
6. choose a texture / surface treatment
7. choose tasteful decorative assets
8. choose a clean palette logic
9. **lock an internal design bible for consistency**
10. generate the required screen images
11. generate more screens if needed for a believable flow
12. generate extra detail renders if needed
13. keep the first screen especially clean
14. avoid website-like layouts
15. avoid nested-card clutter
16. enforce strong and creative image usage where appropriate
17. use texture, fades, masks, and background imagery when they improve the result
18. keep spacing generous and readable
19. keep text comfortably legible
20. avoid generic palettes and generic composition
21. avoid generic icon-library-looking iconography
22. present screens inside a clean phone mockup by default
23. keep the phone border/mockup subtle and premium
24. keep focus on the app content, not on showing off the device
25. maintain strong consistency across the whole image set
26. keep device mockups clean, balanced, and evenly spaced
27. **refine weak screens instead of accepting them**
28. output the final screen set

금지: "Do not switch into coding mode. Do not write implementation instructions. **Do not collapse a requested flow into one lazy collage.**"

### 게이트 1 — §2 PLATFORM MODE RULE (**배타적 선택**)
"**Always decide the platform mode first.**" 3택:

| 모드 | 편향 (원문) |
|---|---|
| **iOS-native premium** | "cleaner top areas / tab-bar clarity / safe-area awareness / elegant spacing / restrained chrome / calm hierarchy / native-feeling sheets and cards / polished but not overdecorated" |
| **Android-native premium** | "stronger component rhythm / clearer app bar behavior / bottom navigation clarity / sheet logic / card·list structure / slightly firmer layout framing / more explicit state clarity" |
| **Cross-platform premium neutral** | "clean safe-area handling / universal mobile navigation patterns / clear hierarchy / less platform-specific ornament / premium but broadly buildable visual language" |

"**Do not mix iOS and Android patterns carelessly.** Pick one dominant platform feel and stay coherent."

### 게이트 2 — §6 APP DESIGN BIBLE RULE (**다중 이미지 시 필수**)
"When generating multiple images for the same app, **lock an internal design bible before continuing**."

고정 항목 16개 (원문): platform mode / device frame style / device scale / palette logic / typography mood / type scale rhythm / spacing system / corner radius logic / icon style / illustration·imagery treatment / texture intensity / decorative asset language / navigation model / card and list behavior / button styling / shadow language

"**Do not let screen 3, 4, or 5 drift into a different app.**"

### §8 LOGICAL FLOW RULE — **플로우 논리 검증 (이 스킬 고유)**
"When multiple images are generated, they must form a **believable app flow**. Do not generate random unrelated screens."

예시 플로우 6개: onboarding → auth → home / home → browse → detail / profile → settings → edit profile / cart → checkout → confirmation / dashboard → activity → detail / welcome → permissions → personalized home

**내부 자문 4문항 (원문)**:
- "why does screen 2 come after screen 1?"
- "what action or navigation leads to the next screen?"
- "is this a believable user journey?"
- "does the UI state carry forward logically?"

"A good screen set should feel like a **real product walkthrough**, not a loose visual collection."

→ **`imagegen-frontend-web`에 없는 축.** 웹은 섹션이 병렬이지만 앱은 화면이 순차이므로, 플로우 논리를 별도 규칙으로 세운 것이 타당한 설계.

### §22 STYLE VARIATION ENGINE — **9개 선택 축**

| 축 | 선택 수 | 옵션 수 |
|---|---|---|
| Theme Paradigm | 1 | 8 (pristine light / deep dark / soft wellness neutral / premium monochrome / rich accent-driven / editorial luxe / playful consumer color / calm productivity minimal) |
| Typography Character | 1 | 5 (clean system-like sans / refined grotesk / expressive premium display + clean body / soft humanist sans / sharper product sans) |
| Structure Bias | 1 | 8 (list-led utility / card-led modular / dashboard-led overview / media-led storytelling / profile-led identity / commerce-led browse·detail / chat-led conversational / wellness-led calm block rhythm) |
| Image Art Direction Bias | 1 | 8 (editorial photography / cinematic lifestyle / soft illustration-led / tactile abstract / premium product / mixed photo+vector / moody atmospheric / collage-lite layered) |
| Texture / Surface Treatment | 1 | 8 (ultra-subtle grain / matte paper / foggy gradient atmosphere / soft noise wash / blurred image haze / clean flat with one textured hero area / tactile monochrome / low-opacity technical pattern) |
| Palette Logic | 1 | 8 (restrained monochrome + one accent / warm neutral + sharp dark contrast / cool mineral + clean highlight / editorial cream·charcoal·muted accent / rich dark base + refined warm accent / wellness soft with controlled saturation / bright consumer with disciplined balance / desaturated premium with one bold hit) |
| **Signature Component Set** | **정확히 4개** | 18 |
| **Decorative Asset Set** | **정확히 2개** | 10 |
| **Motion-Implied Language** | **정확히 2개** | 7 |

"These are **image-direction cues, not code instructions**."

**Signature Component Set 18개 (원문)**: large hero metric card / compact stat strip / modular collection grid / media carousel / layered profile header / premium segmented control / bottom action sheet / framed product card stack / progress ring block / message bubble system / settings group cells / photo-led card strip / sticky mini player / collection shelf / habit tracker block / checkout summary card / journal entry card / achievement tile row

### §35 QUALITY CHECK — **27항목** (이 컬렉션 최다 검증 항목)
1. Does this feel like a real mobile app, **not a website in a phone**?
2. Are safe areas respected visually?
3. Is the first screen clean enough?
4. Is the copy short enough?
5. Is the type readable?
6. Are there enough screens for the requested flow?
7. **Were too few screens generated out of laziness?**
8. If a detail was unclear, was a new detail render created?
9. Is the app free of obvious mobile AI tells?
10. Is the layout free of box-in-box clutter?
11. Are image moments purposeful and consistent?
12. Does the flow feel coherent?
13. Do screens vary enough without breaking the design system?
14. Does the product feel premium and app-native?
15. Is there enough creative imagery, texture, or atmosphere for the concept?
16. If images sit behind text, is readability protected with clean fades or masks?
17. Are decorative assets clean and restrained?
18. Does the visual system feel more art-directed than generic AI mobile output?
19. Is the color palette clean and controlled?
20. Does the design feel non-generic?
21. **Is the design clean without being boringly oversimplified?**
22. Do all screens clearly belong to the same app?
23. Is the flow logical from screen to screen?
24. Is the phone mockup framing clean and evenly padded on all sides?
25. Is the text comfortably readable and not too small?
26. Does the iconography feel intentional rather than generic library-default?
27. Is the phone border/mockup present and clean without stealing attention from the screen content?

### §34 REGENERATION RULE — **재생성 트리거 19개**
"If a generated screen is not strong enough, **regenerate it**." 트리거: text too small / spacing unclear / navigation feels fake / **looks too much like a website** / UI too crowded / onboarding too repetitive / image framing inconsistent / cards too nested / first screen too noisy / flow lacks variation / backgrounds too flat or generic / imagery weak·lazy·missing / fade·mask treatment poor / decorative assets absent or overly bland / **creative elements too timid to matter** / color palette generic or muddy / **design feels too simple in a boring way** / screen set loses consistency / device mockup framing uneven or sloppy

"**Do not settle for the first mediocre render.**"

**사용자 확인 요구 지점**: **없음.**

## 6. 디자인 지침 분석

### §1 다이얼 **19개** — 이 컬렉션(및 4개 컬렉션 전체) 최다

| 다이얼 | 기본값 | 범위 |
|---|---|---|
| DESIGN_VARIANCE | 8 | 1 = rigid/standard, 10 = highly art-directed/varied |
| VISUAL_DENSITY | 3 | 1 = airy/calm, 10 = dense/packed |
| ART_DIRECTION | 9 | 1 = safe utility UI, 10 = bold premium mobile statement |
| PLATFORM_AWARENESS | 9 | 1 = generic phone UI, 10 = strongly app-native |
| FLOW_VARIETY | 8 | 1 = repeated screen templates, 10 = clearly differentiated screen rhythm |
| IMAGE_GENERATION_EAGERNESS | **10** | 1 = minimal screens, 10 = generate as many screens and detail views as needed |
| SPACING_GENEROSITY | 9 | 1 = tight, 10 = spacious and breathable |
| CLARITY_DISCIPLINE | **10** | 1 = loose vibe, 10 = highly readable, structured, clean |
| IMAGE_CREATIVITY | 9 | 1 = minimal image involvement, 10 = strongly art-directed imagery |
| TEXTURE_STRENGTH | 7 | 1 = perfectly flat, 10 = rich tactile/noisy/textured |
| COLOR_PALETTE_DISCIPLINE | **10** | 1 = random or muddy, 10 = always clean, controlled, premium |
| NON_GENERICITY | **10** | 1 = acceptable to look standard, 10 = must feel distinct and specific |
| COMPLEXITY_WITH_CONTROL | 8 | 1 = forced minimalism only, 10 = richer and more layered as long as clean |
| CONSISTENCY_STRENGTH | **10** | 1 = loose screen relationship, 10 = one clear product system |
| FLOW_LOGIC_DISCIPLINE | **10** | 1 = random screen set, 10 = clearly logical app progression |
| MOCKUP_FRAME_DISCIPLINE | 9 | 1 = sloppy device presentation, 10 = clean, even, premium framing |
| TEXT_READABILITY_PRIORITY | **10** | 1 = text may become decorative/small, 10 = text must stay clearly readable |
| CONTENT_FIRST_MOCKUP_BALANCE | **10** | 1 = device frame dominates, 10 = frame supports, content remains hero |
| MIN_TEXT_SIZE_DISCIPLINE | **10** | 1 = small text acceptable, 10 = text must never feel too small |

→ **8개 다이얼이 최대값 10**이며, 그중 5개가 **가독성·일관성·플로우 논리**에 관한 것이다. 즉 이 스킬은 미학보다 **읽히는 정도와 일관성**에 최대 가중치를 둔다.

**해석 규칙 (원문)**:
- "clean" → 밀도 감소, 명확성 증가
- "premium iOS" → "elegant restraint and native-feeling hierarchy"
- "Android" → "stronger Material-like structure and navigation clarity"
- "creative social app" → "increase visual variance and image creativity **without sacrificing readability**"
- "fintech" / "health" / "productivity" → "increase trust, calmness, and structural clarity"

### 금지 규칙 (anti-pattern) — 원문 그대로

**서두: 모바일 AI 붕괴 패턴 22개** (이 컬렉션 최다)
"fake fintech dashboards with random charts / one pretty screen and then generic filler screens / too many floating cards / too many pills and tags / no safe-area awareness / weak navigation logic / **phone-sized websites** / gradient-heavy dribbble clones / glassmorphism without purpose / tiny unreadable text / too much content above the fold / cloned onboarding screens / fake complexity instead of good mobile hierarchy / sterile flat backgrounds with no texture or visual atmosphere / generic palettes / default purple-blue startup color clichés / random bright colors / generic developer-tool icon sets / **overly simplistic layouts that feel empty instead of elegant** / screen sets that drift into different design systems / inconsistent device mockups and uneven margins around the phone / **device frames that dominate more than the actual screen content**"

**§21 MOBILE ANTI-AI-TELLS RULE** — 4개 카테고리

*Visual AI tells*: "purple-blue fintech gradients everywhere / random glass cards / ambient blobs with no purpose / fake neon premium look / **generic dribbble-style floating widgets** / **oversized corner radii on everything** / over-rendered glossy surfaces without hierarchy"

*Layout AI tells*: "fake chart dashboard spam / repeated stat cards with no product reason / **a homepage that looks like 12 widgets fighting for attention** / cloned screens in a flow / giant empty cards with weak content / **phone-shaped websites instead of app screens**"

*Copy AI tells*: "**elevate your life / unlock your potential / next-gen finance / seamless control / smarter than ever / transform your day**"
가짜 브랜드: "**Acme / NovaCore / Flowbit / Quantix / VeloPay**"

*UI clutter tells*: "too many pills / too many badges / too many tiny labels / fake system markers / **meaningless avatar rows** / random chart inserts / **decorative toggles with no product meaning**"

**§15 CLEAN LAYOUT RULE**
"Do not default to box-in-box-in-box mobile UI. Avoid: giant nested card stacks / floating surfaces everywhere / **5 levels of framing** / dashboard clutter for no reason / tiny widgets packed together / **fake operating-system labels** / decorative pills and micro-status elements"
"A premium mobile screen should **not feel trapped inside too many boxes**."

**§12 FIRST SCREEN CLEANLINESS RULE**
"Avoid: giant wall of text / too many micro-labels / too many overlapping cards / fake enterprise complexity / **\"website hero inside a phone frame\"**"

**§11 ONBOARDING FLOW RULE**
"Avoid: **3 identical screens with only icon and headline changes** / too much copy / giant abstract blobs with no product meaning / **fake motivational filler language** / **early rating/review prompts** / cluttered first-run screens"

**§13 SAFE AREA RULE**
"Do not: cram important content into unsafe areas / ignore top and bottom system regions / **make screens feel like edge-to-edge posters with no functional logic** / place critical UI where it would be visually unsafe"
"Mobile images should feel like **real app screens, not posters**."

**§14 NAVIGATION RULE**
"Do not: overload bottom navigation / hide the main path through the app / **make every action equally important** / create unclear hierarchy between tabs, sheets, and actions"

**§20 ICONOGRAPHY RULE**
"Do not default to generic developer-style icon packs or **bland Lucide-like icon vibes**. Avoid: generic line-icon defaults that make the app feel like a template / overused developer-tool icon language / **icons that feel too plain, too open-source-default, or too undifferentiated** / randomly mixing icon weights and styles"

**§18 IMAGE-BEHIND-TEXT RULE**
"Avoid: **raw image under text with no readability support** / muddy overlays / too many heavy gradients / noisy backgrounds that destroy hierarchy"

**§19 CREATIVE ASSET RULE**
"Do not: spam random stickers / clutter the interface with decorative icons / add meaningless SVG art / **use childish doodles unless the brand clearly wants it**"
"A few clean visual accents are good. **Too many become noise.**"

**§23 COLOR PALETTE RULE**
"avoid muddy, accidental, or chaotic color combinations / avoid generic startup gradients unless they truly fit / **avoid default purple-blue AI palettes unless specifically justified** / avoid random bright rainbow color use / avoid throwing many unrelated saturated colors together / keep saturation under control"

**§24 NON-GENERICITY RULE**
"Do not settle for: standard generic fintech / standard wellness pastel app / standard social feed clone / standard productivity dashboard clone / standard ecommerce browse·detail clone without personality"
"The result should feel like: a real designed product, not: **a reusable starter template with better lighting**"

**§28 TEXT RULE**
"Avoid: lorem ipsum overload / long paragraphs / fake inspirational filler / overloaded onboarding explanations / overly technical filler labels"

**§29 TEXT SIZE RULE**
"Do not: shrink text to fit too much UI / use tiny decorative labels / let body copy become hard to read / **sacrifice legibility for style** / place text on busy imagery without protection / compress too much information into one screen until the type becomes small"

**§30 TYPOGRAPHY RULE**
"Do not: make everything the same weight / use too many font moods / create awkward line wrapping / **use oversized headline drama on every screen** / let body text become tiny or decorative"

**§26 IMAGE SYSTEM RULE**
"Avoid: random filler thumbnails / **one pretty screen and then no imagery at all** / inconsistent image proportions / collage chaos"

**§32 SCREEN-TO-SCREEN VARIATION**
"do not drift into a different design system / **do not randomize for the sake of randomizing**"

**§5 크롭 금지**: "crop a settings view out of a larger board / crop tiny onboarding copy out of a multi-screen collage / crop a small card from a broader screen to inspect it / rely on cutouts if they distort spacing, proportions, or typography"

**§10 디바이스 목업 금지**: "do not let the phone touch the canvas edges / do not use awkwardly cropped device frames / do not use inconsistent bezels or random frame sizes across screens"

### 강제 규칙 — 수치 인용

**첫 화면 텍스트 (§12)**
- "Strong preference: **1 to 3 short lines** for the main statement / concise supporting text / **one clear next action**"
- "use **one primary focal point**"

**화면 수 (§4)**
- "1 screen → 1 screen image / 2 → 2 / 3 → 3 / 5 → 5 / 7 → 7"
- "onboarding flow → generate **multiple** onboarding screens, **not one**"
- "auth flow → generate **separate sign in / sign up / recovery states** when useful"
- "app concept → generate a **meaningful set, not one isolated hero mockup**"

**선택 개수 (§22)**
- Signature Component Set: **정확히 4개** (18개 중)
- Decorative Asset Set: **정확히 2개** (10개 중)
- Motion-Implied Language: **정확히 2개** (7개 중)

**팔레트 (§23)**
- "let **one or two** accents do real work"
- 8개 Palette Logic 옵션 (모두 "monochrome + one accent", "one bold hit" 등 액센트 수를 제한하는 형태)

**디바이스 목업 (§10)**
- "use **one coherent device style** across the full set"
- "keep device **scale consistent** across all screens"
- "keep top, bottom, left, and right canvas margins **visually even**"
- 다중 디바이스 시: "keep the same scale / keep **equal gutter spacing** between devices / align them cleanly"
- "keep shadows **soft and controlled**"

**텍스처 (§1)**: TEXTURE_STRENGTH **7** (1=완전 평면, 10=풍부한 촉감)

**hex 값·px·rem·ms는 원문에 전혀 없다.** 이미지 생성 스킬이므로 색·크기를 자연어로 서술한다.

### 항목별 지침

**타이포그래피 (§28, §29, §30)** — **이 컬렉션에서 가독성 지침이 가장 강한 스킬**
- 다이얼 3개가 텍스트에 배정됨: TEXT_READABILITY_PRIORITY 10 / MIN_TEXT_SIZE_DISCIPLINE 10 / CLARITY_DISCIPLINE 10
- **핵심 규칙**: "**if the text feels small, the design is not finished yet**"
- 텍스트가 작아지면 취할 행동 6개 (원문): "simplify the layout / reduce content / increase spacing / enlarge the text / **split content into another screen if needed** / **regenerate the screen if necessary**"
- 3연 강조: "**Readable beats clever. Readable beats dense. Readable beats decorative small type.**"
- 5개 Typography Character 선택, "for premium apps: typography should feel **deliberate, not loud by default**"
- 구체적 pt/sp 수치는 **원문에 없음**

**컬러 (§23)**
- 8개 Palette Logic 중 1개 선택
- "use a strong palette with **internal logic**"
- "let **one or two** accents do real work"
- 팔레트가 가질 수 있는 성격 7개: bold / soft / dark / editorial / playful / luxurious / atmospheric — "But it must still feel **clean**."
- 대비: §29가 "enough contrast against the background"를 요구하나 **수치는 없음**

**스페이싱 (§31)**
- "use **generous** spacing between major screen blocks / keep internal padding clean / **avoid one screen feeling cramped while the next is empty** / smaller modules still need enough surrounding space / let whitespace create calmness and focus / **separate dense screens from calmer screens in a flow** / allow textured or image-led areas to breathe instead of stacking more UI on top"
- 목표 상태: "open / composed / balanced / **touch-friendly** / calm"
- 수치는 **없음** (SPACING_GENEROSITY 9 다이얼로만)

**모션 (§22)**
- 7개 중 **정확히 2개**: springy card lift energy / sheet rise energy / tab transition calmness / staggered list reveal energy / soft dashboard fade-up energy / parallax header drift energy / carousel glide energy
- "These are **image-direction cues, not code instructions**."
- duration/easing, `prefers-reduced-motion` **없음** (정지 이미지)

**레이아웃 (§13, §14, §15, §27)**
- **§13 안전 영역 인식 (이 스킬 고유)**: "safe areas / status bar region / top bar or title region / bottom navigation region / **home indicator region** / **sheet docking zone** / **gesture space**" — 모바일 플랫폼의 물리적 제약을 규칙으로
- **§14 내비게이션 패턴**: "tab bar / bottom navigation for major app sections / stack navigation feel for drill-down flows / sheets for secondary tasks / segmented controls for local switching / app bars where useful / clear primary and secondary actions"
- §15 중첩 박스 금지 ("5 levels of framing")
- §27 고정 미디어 프레임: "stable aspect ratios / consistent crop behavior / repeatable media modules / clear radius logic / clean framing"

**이미지 (§16, §18, §26)**
- §16 창의적 이미지 사용 11종: photography-led onboarding / large editorial image blocks / image-backed headers / product or lifestyle imagery / scenic or atmospheric backgrounds / illustration-driven entry screens / media cards with layered treatment / bold visual covers / image strips·shelves·carousels / background images partially revealed behind typography
- **§18 IMAGE-BEHIND-TEXT (이 스킬 고유)** 7가지 처리: "image background under a title block with a **fade to transparent** / **bottom-to-top gradient fade** to support text legibility / **side fade masks** so text sits over the clean portion / soft blur overlays behind text / image partially visible behind copy, fading into the background color / large edge-to-edge visual with a **scrim** under headline and CTA / photo or illustration bleeding behind typography but **gently masked**"
- §26 이미지가 유효한 카테고리 10개: social / ecommerce / travel / wellness / editorial / food / fashion / content apps / creator apps / marketplace apps

**텍스처 (§17)** — 10가지 허용 처리: soft film grain / subtle noise / paper-like texture / lightly speckled surfaces / brushed or frosted texture feel / tonal gradient fog / clouded ambient depth / tactile matte surfaces / faint grid or pattern texture / blurred photographic background layers
"Good rule: **texture should support the mood, not compete with the interface.**"

**아이콘 (§20)** — 커스텀 느낌 강제. "a clean custom-feeling icon system / restrained, brand-appropriate iconography / **consistent stroke or filled logic** / icons with slightly more character when the concept allows it / **product-specific icon decisions instead of default library-looking symbols**"

**접근성** — **이 컬렉션 이미지 스킬 중 가장 넓다** (다만 여전히 부분적):
- 텍스트 가독성에 다이얼 3개 배정 + §29 전체
- "if the text feels small, the design is not finished yet"
- §13 safe area 전체 (status bar / home indicator / gesture space)
- "touch-friendly" (§31)
- "enough contrast against the background" (§29)
- 이미지 위 텍스트의 가독성 보호 (§18)
- **누락**: 대비 비율 수치, 최소 터치 타깃 크기(44pt 등), 최소 텍스트 크기 수치, 동적 타입(Dynamic Type), 스크린리더

**카테고리별 편향 (§33)** — 6개

| 카테고리 | Prefer (원문) |
|---|---|
| **Fintech** | trust / calm spacing / clear numbers / restrained accents / **less fake chart spam** / strong transaction clarity / subtle texture, not loud effects |
| **Health / Fitness** | calm structure / strong metric hierarchy / **motivating but not noisy** / readable progress modules / airy spacing / optimistic imagery or wellness textures |
| **Productivity** | clarity / list and card discipline / navigation simplicity / calm density / strong task hierarchy / minimal but premium supporting visuals |
| **Social** | profile and feed rhythm / media moments / **clearer hierarchy between creation and browsing** / stronger flow variety / more expressive image direction |
| **Commerce** | browse·detail·cart clarity / strong product imagery / **stable product card proportions** / clean checkout hierarchy / tasteful editorial image treatments |
| **Wellness / Lifestyle** | softer materials / calm typography / less visual noise / breathing room / elegant imagery / tactile backgrounds and soft fades |

### 지침을 주는 방식 자체

1. **적용/비적용 범위를 양방향 명시**: "This skill is for: (14항목)" + "This skill is **not** for: (6항목)". **이 컬렉션에서 유일하게 자매 스킬을 명시 배제**해 역할 경계를 확정.
2. **코드 작성을 반복 금지**: description + CORE DIRECTIVE + §36 + §38에서 4회. "Do not build SwiftUI, React Native, Flutter, or HTML." **스킬 오작동(모드 전환)을 구조적으로 차단.**
3. **다이얼 19개 + 8개를 최대값으로**: 가독성(TEXT_READABILITY_PRIORITY, MIN_TEXT_SIZE_DISCIPLINE), 일관성(CONSISTENCY_STRENGTH), 플로우 논리(FLOW_LOGIC_DISCIPLINE), 팔레트 규율(COLOR_PALETTE_DISCIPLINE), 비범용성(NON_GENERICITY), 명확성(CLARITY_DISCIPLINE), 콘텐츠 우선(CONTENT_FIRST_MOCKUP_BALANCE), 이미지 생성 적극성(IMAGE_GENERATION_EAGERNESS)에 10을 부여. **무엇이 타협 불가인지를 다이얼로 선언.**
4. **플랫폼 모드를 첫 게이트로**: "Always decide the platform mode first." + 혼용 금지. 모바일 특수성을 반영.
5. **디자인 바이블(design bible) 잠금**: 16개 항목을 다중 이미지 생성 전에 고정. "Do not let screen 3, 4, or 5 drift into a different app."
6. **플로우 논리를 별도 규칙 + 자문 4문항으로**: 웹판에 없는 축. "why does screen 2 come after screen 1?"
7. **"not always simple, always clean" (§25)** — 이 스킬의 고유 명제:
   > "Simplicity is not the goal by itself. **Cleanliness is the goal.**" / "The rule is: **not always simple / always clean**"
   그리고 허용 7항목(sophisticated layering / controlled visual depth / richer compositions / stronger image presence / decorative accents with purpose / multiple visual zones / more character)과 불허 5항목(noisy complexity / **clutter disguised as creativity** / random decorative overload / muddy hierarchy / unreadable interfaces)을 분리.
   → **미니멀리즘을 기본값으로 강제하는 다른 스킬들과 정면으로 다른 입장.**
8. **디바이스 목업을 기본값으로 + 콘텐츠 우선 균형**: §9 "phone mockup present / content still primary" + §10의 13개 프레이밍 규칙. CONTENT_FIRST_MOCKUP_BALANCE 10. **프레젠테이션 형식까지 규정한 유일한 스킬.**
9. **가독성 실패 시의 6가지 행동 (§29)**: 문제를 진단만 하지 않고 **해결 경로를 순서로** 제공 (레이아웃 단순화 → 콘텐츠 축소 → 간격 증가 → 텍스트 확대 → 화면 분리 → 재생성).
10. **재생성 트리거 19개 (§34)**: 어떤 상태를 실패로 볼지 열거. "Do not settle for the first mediocre render."
11. **27항목 품질 체크 (§35)**: 이 컬렉션 최다.
12. **카테고리별 편향표 (§33)**: 6개 앱 카테고리에 톤을 매핑.
13. **온보딩 특화 규칙 (§11)**: "3 identical screens with only icon and headline changes"를 명시 금지하고, "early rating/review prompts"까지 배제. 실무 경험이 반영된 지점.
14. **참조 대상**: 브랜드·디자이너 실명이 **없다.** "Lucide-like icon vibes"(부정), "dribbble-style floating widgets"(부정), "Material-like structure"(Android 편향) 정도. 부정 참조가 긍정 참조보다 많다.
15. **페르소나 부여**: "You are an elite mobile product design art director."

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**app-native**" | 플랫폼 모드 3택 + safe area 7영역 인식 + 내비게이션 패턴 6종 + "not a website in a phone" |
| "**phone-sized websites**" / "**website hero inside a phone frame**" (회피) | 실패 형태로 명시. 재생성 트리거에도 포함 |
| "**premium**" | 다이얼 ART_DIRECTION 9 + 텍스처 + 절제된 액센트 + 깨끗한 목업 프레이밍 + AI tell 4카테고리 회피 |
| "**not always simple, always clean**" | 층위·깊이·풍부함은 허용, noisy complexity·clutter disguised as creativity는 불허 |
| "**overly simplistic layouts that feel empty instead of elegant**" | 단순함 자체를 실패로 규정한 지점 (§25와 연결) |
| "**a reusable starter template with better lighting**" (회피) | NON_GENERICITY 10의 실패 형태 |
| "**if the text feels small, the design is not finished yet**" | 가독성을 완성 조건으로 — 6가지 해결 경로 제공 |
| "**Readable beats clever / dense / decorative small type**" | 3연 우선순위 선언 |
| "**12 widgets fighting for attention**" | 홈 화면의 실패 형태 |
| "**5 levels of framing**" | 중첩 박스의 정량적 실패 기준 |
| "**texture should support the mood, not compete with the interface**" | TEXTURE_STRENGTH 7 + 10가지 허용 처리 |
| "**creative elements too timid to matter**" | 재생성 트리거 — **소극성도 실패로 규정** |
| "**design feels too simple in a boring way**" | 재생성 트리거 — 동일 |
| "**device frames that dominate more than the actual screen content**" | CONTENT_FIRST_MOCKUP_BALANCE 10 |
| "**meaningless avatar rows**" / "**decorative toggles with no product meaning**" | UI clutter tell |
| "**elevate your life / unlock your potential / next-gen finance**" | Copy AI tell 6개 |
| "**believable user journey**" | 자문 4문항 + 플로우 예시 6개 |
| "**one or two accents do real work**" | 8개 Palette Logic이 모두 액센트 수를 제한 |
| "**edge-to-edge posters with no functional logic**" (회피) | safe area 무시의 실패 형태 |

## 7. 산출물

- **형식**: **모바일 화면 이미지 N장** (N = 화면 수) + 필요 시 상세 렌더. **코드 없음.**
- **프레젠테이션**: 기본적으로 **깨끗한 폰 목업 프레임 안에** 표시. iOS → iPhone 스타일, Android → Android 스타일, 크로스플랫폼 → 중립적 프리미엄 폰
- **프레임 제거 조건 (§9)**: "the user explicitly asks for raw screen-only output / the concept clearly benefits from borderless presentation / the user asks for UI sheets or assets instead of full phone compositions"
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- **라벨링 규칙**: **원문에 명시 없음** (`imagegen-frontend-web`이 "Section X of N: \<name\>"을 규정한 것과 대비 — 이 스킬에는 화면 라벨링 규칙이 없다)
- **후속 핸드오프**: **원문에 명시 없음.** 오히려 "image-to-code"를 적용 범위에서 배제했으므로, 생성된 이미지를 코드로 옮기는 경로가 이 컬렉션 안에서 끊긴다.

## 8. 주의점 / 한계

- **이미지 생성 도구 부재 시의 폴백이 없다**: `imagegen-frontend-web`은 "한 장씩만 렌더링 가능한 경우"를 처리했지만 이 스킬에는 그런 배려도, 생성 불가 환경의 대응도 **없다.**
- **텍스트 렌더링 한계와 지침의 충돌**: 이 스킬은 가독성에 다이얼 3개를 최대값으로 두고 "if the text feels small, the design is not finished yet"까지 선언한다. 그런데 산출물은 이미지 생성 모델의 출력이며, **텍스트가 깨지거나 무의미해질 가능성이 구조적으로 높다.** §29의 해결 경로 6개 중 마지막이 "regenerate the screen if necessary"인데, 재생성으로도 모델의 텍스트 렌더링 한계는 넘을 수 없다. **원문에 이 한계에 대한 인식이 없다.**
- **비용이 통제되지 않는다**: IMAGE_GENERATION_EAGERNESS 10 + "Do not be lazy with screen count" + §34의 19개 재생성 트리거. 온보딩 플로우 하나만 요청해도 여러 화면 + 재생성이 누적된다. **비용 상한·확인 절차가 원문에 없다.**
- **접근성 수치의 부재**: 가독성을 최우선으로 선언하면서 **최소 텍스트 크기(pt/sp)나 최소 터치 타깃(44pt/48dp)의 수치가 없다.** "comfortably readable", "touch-friendly"라는 감각어에 머문다. `emilkowalski/animate-expo`가 "44×44pt minimum touch target (48dp Android)"를 명시하는 것과 대비된다. Dynamic Type / 스크린리더 / 대비 비율도 없다.
- **후속 구현 경로가 끊긴다**: 적용 범위에서 "image-to-code / frontend implementation / code generation"을 배제했다. 경계는 명확하지만, **생성된 모바일 화면 이미지를 실제 앱으로 옮기는 스킬이 이 컬렉션에 없다** (`image-to-code`는 웹 전용이며 "websites, landing pages"를 대상으로 한다). 즉 이 스킬의 산출물은 컬렉션 안에서 종착점이 된다.
- **`imagegen-frontend-web`과의 광범위한 중복**: 다이얼 체계, 조합 변량 엔진, AI slop 목록, 크롭 금지, 다중 이미지 일관성, 간격 규율, 텍스처 규칙, QUALITY CHECK 구조가 겹친다. 두 스킬이 같은 템플릿에서 파생되었고 웹/모바일로 갈라진 것으로 보이지만 **상호 참조나 공통 기반에 대한 언급이 없다.**
- **화면 라벨링 규칙 부재**: 웹판은 "Section X of N"을 강제해 누락을 방지하는데, 이 스킬은 화면 라벨링이 없다. 다중 화면 세트에서 무엇이 몇 번째 화면인지 식별하는 규칙이 **원문에 없다.**
- **`§25 "not always simple"`과 다른 스킬의 충돌**: 같은 컬렉션의 `minimalist-ui`는 "ultra-minimalist"를 강제하고, `high-end-visual-design`은 매크로 여백을 요구한다. 이 스킬은 "Simplicity is not the goal by itself"로 명시적으로 다른 입장을 취한다. 두 스킬이 동시 활성화되면 판정이 갈린다 — 다만 대상(모바일 앱 이미지 vs 웹 코드)이 달라 실무 충돌 가능성은 낮다.
- **모션 지침의 무용성**: Motion-Implied Language 2개를 선택하게 하지만 정지 이미지이며, 후속 코드 단계가 배제되었으므로 이 정보가 쓰일 곳이 **없다.**
- **다이얼 19개의 실효성**: 8개가 최대값 10으로 고정되어 있어 실질적으로는 조정 가능한 다이얼이 11개다. 그리고 각 다이얼이 어떤 규칙을 발동시키는지의 매핑이 `design-taste-frontend-v1`처럼 임계값(`>4`, `>7`)으로 명시되지 않고 §1의 해석 문장 5개에 그친다.
- **강한 경고 지점**:
  - "**Do not switch into coding mode. Do not describe code. Do not build SwiftUI, React Native, Flutter, or HTML.**"
  - "**Always decide the platform mode first.**" / "Do not mix iOS and Android patterns carelessly."
  - "**Do not let screen 3, 4, or 5 drift into a different app.**"
  - "**Do not be lazy with screen count.**"
  - "**if the text feels small, the design is not finished yet**"
  - "**Readable beats clever. Readable beats dense. Readable beats decorative small type.**"
  - "**Do not settle for the first mediocre render.**"
  - "**Do not collapse a requested flow into one lazy collage.**"
  - "Mobile images should feel like **real app screens, not posters**."
  - "not always simple / **always clean**"
- **검증 장치 (이 컬렉션 최다)**: §35 QUALITY CHECK **27항목** + §34 재생성 트리거 **19개** + §8 플로우 자문 4문항 + §6 디자인 바이블 16항목 잠금. **항목 수로는 4개 컬렉션 전체에서 가장 많다.** 다만 전부 자기 선언이며, 생성 이미지의 텍스트 정확성·목업 정렬·안전 영역 준수를 객관적으로 확인하는 수단이 **없다.** `imagegen-frontend-web`의 정량 거부 조건(anchor 3연속 등) 같은 계량 장치도 이 스킬에는 없다.
