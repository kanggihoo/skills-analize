# brandkit 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/brandkit/`
- **핵심 파일**: `SKILL.md` (15,992 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **브랜드 아이덴티티 보드 이미지 생성 지침**. 코드가 아니라 **이미지 프롬프트를 구성하는 지침**이며, 이 컬렉션에서 유일하게 브랜드 전략·로고 컨셉팅을 다룬다. 산출물은 "brand-guidelines deck" 형태의 단일 이미지.

원문 자기 규정: "You are an elite brand identity art director, logo designer, visual-system strategist, and presentation designer. Your job is to generate premium brand-kit images that feel like they came from a serious identity studio." 그리고 "**Create a complete brand world in one image.**"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Premium brand-kit image generation skill for creating high-end brand-guidelines boards, logo systems, identity decks, and visual-world presentations. Trained for minimalist, cinematic, editorial, dark-tech, luxury, cultural, security, gaming, developer-tool, and consumer-app brand systems. Optimized for intentional logo concepting, refined composition, sparse typography, strong symbolic meaning, premium mockups, art-directed imagery, and flexible grid layouts."

**해석**: "Use when…" 트리거 문구가 **없다.** 산출물 종류(brand-guidelines boards / logo systems / identity decks / visual-world presentations)와 커버 도메인 10개(minimalist, cinematic, editorial, dark-tech, luxury, cultural, security, gaming, developer-tool, consumer-app)를 열거한다.

**매칭될 것으로 보이는 사용자 발화**
- "우리 브랜드 아이덴티티 보드 만들어줘"
- "로고 컨셉 몇 개 뽑아줘"
- "브랜드 가이드라인 덱 이미지"
- "이 스타트업 브랜드 세계관 시각화"

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 브랜드 방향을 **한 장의 이미지로 제시**해야 할 때 (피치, 초기 컨셉 리뷰, 무드 정렬)
- 로고 컨셉을 **의미 기반으로** 도출해야 할 때 — 5개 컨셉 방법론 + 카테고리별 심볼 로직 표
- 브랜드 카테고리가 원문의 8개 Visual Mode 중 하나에 해당할 때
- 참조 이미지가 있고 그 "품질 수준"을 재현하고 싶을 때 — "Use references as **quality training, not as templates**"

**부적합 / 과한 상황**
- **실제 사용 가능한 로고 파일이 필요할 때** — 산출물은 래스터 이미지 보드이며, 벡터 로고나 실제 브랜드 자산이 아니다. (`garden-skills/web-design-engineer`의 Asset Protocol은 "로고를 확보하지 못하면 정지"라고 하는데, 이 스킬은 로고를 **생성**한다 — 서로 다른 층위)
- 기존 브랜드가 확정된 프로젝트 — 이 스킬은 새 아이덴티티를 만든다
- 실제 웹/앱 구현 → `high-end-visual-design` / `design-taste-frontend`
- 텍스트가 많이 들어가야 하는 보드 — "Use **very little text**"가 철칙
- 코드 산출물이 필요할 때

**형제 스킬 대신 이걸 고르는 기준**: 산출물이 **이미지**인가, 그리고 주제가 **브랜드 아이덴티티**인가. 이 컬렉션에서 이미지를 다루는 다른 스킬(`imagegen-frontend-web`, `imagegen-frontend-mobile`)은 UI 목업 이미지를 코드로 옮기는 쪽이고, 이 스킬만 브랜드 시스템을 다룬다.

## 4. 외부 의존성

- **API 키**: **원문에 명시 없음.** 그런데 이 스킬은 **이미지 생성을 전제**한다 ("brand-kit **image** generation skill", "The **image** must look like…"). 즉 실제 실행에는 이미지 생성 도구가 필요하지만, **어떤 도구·어떤 키를 쓰는지 원문이 전혀 다루지 않는다.**
  - `garden-skills/gpt-image-2`가 모드 감지(A/B/C)와 `OPENAI_API_KEY`를 명시하는 것과 대조적으로, 이 스킬은 **실행 경로를 규정하지 않는다.**
  - 호스트 에이전트의 내장 이미지 도구를 전제하는 것으로 보이나 **원문에 명시 없음.**
- **폴백 모드**: **원문에 명시 없음.** 이미지 도구가 없을 때의 동작(프롬프트만 출력 등)이 규정되지 않았다.
- **필요한 CLI/런타임/패키지**: **원문에 명시 없음.** 스크립트 없음.
- **네트워크**: 이미지 생성 API 호출 시 필요 (추정 — 원문 미명시)
- **비용 발생 지점**: **이미지 생성 호출**. 단 비용·크기·품질 파라미터에 대한 언급이 **원문에 전혀 없다.**

## 5. 워크플로우

### 1. 브랜드 전략 추론 (**게이트 — 생성 전 필수**)
"**Before generating, infer the brand strategy.**"

추론 항목 9개 (원문): category / audience / product function / emotional promise / cultural position / trust level / visual world / symbolic metaphor / **what the brand should avoid**

"**The visual system must be based on meaning.**"

**카테고리 → 심볼 로직 표** (원문 전문):

| Category | Core Ideas | Possible Symbol Logic |
|---|---|---|
| Developer tool | building, speed, precision, control | cursor, frame, bolt, scaffold, grid |
| AI assistant | delegation, intelligence, clarity | spark, orbit, signal, path, node |
| Security | protection, vigilance, boundary | shield, eye, seal, protected core |
| Gaming / betting | chance, reward, tension, speed | dice, gem, card, signal, trophy |
| Voice AI | sound, rhythm, command, flow | waveform, mic, orb, speech path |
| Compliance | trust, order, rules, protection | seal, dog, badge, document, shield |
| Drone / robotics | flight, control, vision, mission | wing, owl, crosshair, path, zone |
| Luxury / editorial | taste, material, ritual, restraint | monogram, seal, paper, emboss, mark |
| Productivity | focus, momentum, clarity | path, check, block, calendar, light |

"**Do not pick symbols randomly.**"

### 2. 5가지 질문에 답하기 (Core Principle) — **정당화 게이트**
"A premium brand kit is not decoration. It is **a visual argument for why the brand exists**. Every generated board must answer:"
1. What does this brand represent?
2. What is the core metaphor?
3. How does the logo express that?
4. How does the system scale across UI, print, image, and detail?
5. **Why does the whole thing feel ownable?**

### 3. 로고 컨셉 방법 선택 — **"최대 2개까지 조합"**
"Use one or **combine two maximum**."

| # | 방법 | 규정 |
|---|---|---|
| 1 | **Monogram + Meaning** | 브랜드 이니셜 + 메타포. 예: `K` + kite/frame/direction, `S` + sound wave. "**Do not make a boring letter icon.** Use negative space, cuts, folds, or geometry." |
| 2 | **Product Action** | 제품의 주 행위를 심볼로. build→frame/scaffold/block/cursor, protect→shield/boundary, convert→switch/arrow, speak→waveform/mic/pulse, hunt threats→eye/raptor/radar, automate→loop/handoff/path. "**Make it abstract and premium, not literal.**" |
| 3 | **Metaphor Fusion** | 두 의미를 하나로 축약. 예: owl+drone vision, shield+mountain, moon+waveform, dog+compliance seal, dice+mobile game economy, cursor+lightning speed, kite+product frame. "The fusion should be **subtle and readable**." |
| 4 | **Negative Space** | "Use empty space to create intelligence." 예: hidden arrow, protected center, cutout initial, internal path, folded corner, eye formed by crossing shapes. "Negative space should be **crisp**." |
| 5 | **Construction Geometry** | circles / diagonal cuts / grids / frames / modular blocks / layered cards / orbital paths / crosshairs / measured linework. "One panel can show construction logic." |

### 4. Visual Mode 선택 (8개) — **브랜드 성격에 따라**
각 모드마다 **용도 / 시각 단서 / 로고 로직 / 무드** 4항목이 규정됨:

| 모드 | 용도 | 팔레트·시각 단서 | 로고 로직 | Mood |
|---|---|---|---|---|
| **Dark Developer / Builder** | developer tools, coding agents, infra, automation, AI builders | near-black panels, monospace accents, command lines, terminal windows, prompt bars, subtle grid, **cyan/blue/coral/lime** accents, pixel or CRT texture | cursor+frame, bolt+build speed, scaffold+monogram, terminal glyph+symbol, modular construction mark | "precise, sharp, confident, builder-native" |
| **Dark Product / Operator** | business tools, growth tools, sales agents, automation, productivity | **black / dark red / amber**, glowing UI chips, card systems, segmented flows, icon rows, reward/progress motifs | signal, gift, path, operator mark, switch, loop, command system | "fast, operational, tactical, premium" |
| **Dark Nature / Calm System** | strategy, travel, wellness, climate, quiet premium SaaS | **deep green + lime accent**, misty landscapes, image UI circles, soft overlays, calm page labels | path, leaf, moon, horizon, compass, portal, folded mark | "calm, trustworthy, focused" |
| **Dark Security / Threat Intelligence** | security, compliance, monitoring, network | **black/navy**, shield forms, radar lines, threat labels, motion traces, **red/blue** alert chips | shield, raptor, eye, watch, boundary, protected core | "serious, vigilant, precise" |
| **Light Editorial / Compliance** | legal, privacy, compliance, documents, trust | **warm ivory**, paper texture, small serif labels, seals/badges, color wheel, calm stationery, **deep blue/red/gold** | seal, dog, shield, document, stamp, monogram | "trustworthy, refined, institutional but modern" |
| **Luxury / Beauty / Fashion** | beauty, fashion, hospitality, premium services | **ivory / stone / espresso**, serif wordmark, elegant monogram, paper grain, embossing, editorial crops, soft shadows | monogram, seal, petal, vessel, ritual object, refined typographic mark | "tasteful, adult, expensive" |
| **Voice / Communication** | voice AI, chat, assistants, speech, audio | **dark indigo + lilac glow**, waveform, mic motif, phone crop, command input, app icon | wave+initial, sound orb, speech path, microphone abstraction, pulse ring | "fluid, intelligent, intimate" |
| **Cultural / Experimental** | music, creative tools, events, gaming-adjacent, cultural | halftone, CRT texture, analog print, **bold accent color**, poster-style panels, unexpected image crops | custom wordmark, icon with attitude, symbolic mascot, print-inspired mark | "memorable, creative, still controlled" |

### 5. 레이아웃 선택
기본값: **`3 × 3`**, 종횡비 **`4:3` 또는 `16:10`**

허용 레이아웃 (원문):
- `3 × 3` full identity system
- `2 × 3` cinematic brand deck overview
- `2 × 2` compact concept board
- `1 × 3` horizontal brand strip
- `4 × 2` wide contact-sheet layout
- custom layout when requested

### 6. 패널 구성 (기본 3×3 — 9개 패널)
1. **Logo Cover** — "Large logo and wordmark. Minimal title. Strong negative space."
2. **Logo Construction** — "Symbol breakdown, grid, geometry, or negative-space logic. **Show why the mark exists.**"
3. **Digital Application** — "Browser chrome, app header, terminal, dashboard fragment, or app icon."
4. **Brand Essence** — "One short tagline. Large readable typography. Sparse composition."
5. **Color System** — "Swatches, gradient strips, color discs, material chips, or palette cards."
6. **Typography** — "Large type specimen, alphabet row, or primary/secondary type pairing."
7. **Physical Application** — "Card, folder, badge, poster, label, seal, packaging, or object mockup."
8. **Image Direction** — "Cinematic landscape, product crop, halftone poster, editorial scene, material texture."
9. **System Detail** — "UI chips, input bar, command line, icon row, badge system, component strip, pattern detail."

**2 × 3 대안 레이아웃 (6패널)**: Logo/Wordmark → Browser/Product Surface → Command/Functional Panel → Atmosphere/Campaign Image → Symbol/Construction/Badge → Tagline/System Promise. "This layout should feel like a **premium mini-deck**."

### 7. 리듬 부여 (Board Composition DNA)
"A strong brand-kit board should feel like a **curated sequence**." 필요 패널 6종: "large calm cover panel / one digital mockup panel / one image-led atmosphere panel / one system/construction panel / one physical or icon application panel / one quiet tagline panel"

"**Do not make every panel equally loud.**" 리듬: "quiet / functional / emotional / technical / atmospheric / detailed"

### 8. 내부 프롬프트 템플릿 적용
원문이 "Use this structure **internally**"로 제공하는 고정 템플릿 (브랜드명 / 브랜드 전략 5항목 / 레이아웃 / 패널 목록 / Visual mode / Palette / Style / Typography / Logo).

**사용자 확인 요구 지점**: **없음.** 게이트는 모두 자기 추론이다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

**최상단 3금지**
- "**Do not generate generic logos.**"
- "**Do not generate random mockups.**"
- "**Do not generate messy AI moodboards.**"

**로고 금지 (Logo Generation Standard)** — "Avoid:"
- "generic lightning bolts **unless strongly justified**"
- "random animals"
- "fake luxury crests"
- "copied famous marks"
- "overcomplicated symbols"
- "clipart-style icons"
- "meaningless sparkles"
- "inconsistent logo variants"

"The logo should feel like it came from **research and reduction**."

**ANTI-GENERIC RULES** (원문 전문) — "Never make:"
- random floating icons
- generic startup gradients
- overdesigned logos
- meaningless blobs
- messy layout collages
- fake tiny UI
- inconsistent logo marks
- too many colors
- cheap neon
- stock-template brand boards
- corporate PowerPoint slides
- soulless SaaS dashboards

"Make the design **quieter, sharper, and more intentional**."

**텍스트 금지 (TEXT RULES)** — "Bad text:"
- long paragraphs
- tiny fake body copy
- lots of menu items
- lorem ipsum
- dense explanations
- unreadable labels

**태그라인 금지 (TAGLINE STYLE)** — "Avoid:"
- generic corporate slogans
- long marketing copy
- buzzword soup
- fake inspirational fluff

**이미지 금지 (IMAGE DIRECTION)** — "Avoid:"
- generic stock people
- random office photos
- cliché robot imagery
- overbusy scenes
- unrelated imagery

**목업 금지 (MOCKUP DIRECTION)** — "Avoid:"
- full fake dashboards with too much data
- cheap glossy mockups
- random device overload
- busy app screens
- excessive icons

"**Mockups are identity applications, not feature demos.**"

**컬러 금지 (COLOR DISCIPLINE)**
- "no random rainbow unless requested"
- "no generic purple-blue AI glow unless appropriate"

**참조 사용 금지 (REFERENCE USAGE)** — "Do not copy:"
- exact logo / exact brand name / exact composition / exact slogan / unique visual asset

**기타**
- "**Do not pick symbols randomly.**"
- "**Do not make a boring letter icon.**"
- "**Do not make every panel equally loud.**"
- Premium detail: "**Do not overuse them.**"
- 로고 컨셉 방법: "Use one or **combine two maximum**"
- Style: "**no copied real-world logos**"
- Typography: "**no tiny fake text**"

### 강제 규칙 — 수치 인용

이 스킬은 **hex나 px 수치를 거의 쓰지 않는다.** 이미지 생성 프롬프트이므로 자연어 서술이 주된 수단이다. 명시된 수치·규격:

| 항목 | 값 |
|---|---|
| 기본 레이아웃 | **`3 × 3`** |
| 기본 종횡비 | **`4:3`** 또는 **`16:10`** |
| 허용 레이아웃 | `3×3` / `2×3` / `2×2` / `1×3` / `4×2` / custom |
| 로고 컨셉 방법 조합 | **최대 2개** |
| 섹션 라벨 개수 | **2–5개** ("2–5 section labels") |
| 팔레트 구성 | base color + primary accent + secondary accent + neutrals (**4층**) |

**추천 팔레트 8개 (원문 그대로)** — "Good reference-style palettes:"
- black + cyan + muted coral
- black + red + cream + blue
- forest green + lime + fog gray
- navy + white + steel
- ivory + deep blue + red + gold
- black + lilac + soft purple
- black + amber + red
- charcoal + white + pale blue

**컬러 규칙**
- "accents must **repeat across panels**"
- "**one accent can carry the entire system**"
- "Use **one dominant palette**"

**좋은 태그라인 예시 8개 (원문 그대로)**
- "What will you build today?"
- "Nothing random."
- "Your network. Our watch."
- "Build better."
- "On guard."
- "Every mission under control."
- "Everything operators need."
- "Clarity builds confidence."

**좋은 텍스트 종류** — brand name / one tagline / one URL / one command / 2–5 section labels / short UI chips

### 항목별 지침

**타이포그래피**
- "very sparse typography" (Reference Style DNA)
- 패널 6번이 Typography 전담 — "Large type specimen, alphabet row, or primary/secondary type pairing"
- 프롬프트 템플릿: "readable, minimal, high hierarchy, **no tiny fake text**"
- "Text should be **large enough and sparse enough to render well**" — 이미지 생성 모델의 텍스트 렌더링 한계를 고려한 실용적 규칙
- Visual Mode별 서체 성격: Dark Developer = "monospace accents", Light Editorial = "small serif labels", Luxury = "serif wordmark, elegant monogram", Cultural = "custom wordmark"
- **구체적 서체명·크기·line-height는 원문에 없음** (이미지 생성이므로 해당 없음)

**컬러**
- 4층 팔레트 구조 (base / primary accent / secondary accent / neutrals)
- 8개 추천 조합 (자연어 색 이름)
- Visual Mode별 팔레트 지정
- 액센트 반복 강제, 무지개·AI 퍼플블루 글로우 금지
- "muted but powerful accent colors" (Reference Style DNA)
- **hex 값은 원문에 없음** — 자연어 색 이름만 (`cyan`, `muted coral`, `espresso`, `fog gray` 등)

**스페이싱 / 레이아웃**
- "strong gutters between panels", "consistent gutters"
- "large negative space", "refined negative space"
- "restrained visual density"
- "clean presentation grid", "clean alignment"
- "Make every panel feel connected"
- **수치 없음** — 전부 자연어

**모션**
- **원문에 지침 없음** (정지 이미지).

**텍스처**
- "halftone, grain, scanline, or print texture" (Reference Style DNA)
- Visual Mode별: pixel/CRT texture (Developer), paper texture (Light Editorial), paper grain/embossing (Luxury), halftone/CRT/analog print (Cultural)
- Premium Detail: "low-opacity texture", "halftone image treatment"

**Premium Detail Language (16항목)** — 원문 전문:
small page numbers / tiny footer labels / precise alignment marks / construction lines / subtle crosshair grids / thin rules / browser bars / rounded rectangles / image masks / soft shadows / low-opacity texture / halftone image treatment / one highlighted word / one accent chip / one strong icon state
→ "Do not overuse them. **Premium detail should reward looking closer.**"

**접근성**
- **원문에 지침 없음.** 이미지 보드이므로 직접적 접근성 요구는 낮으나, 대체 텍스트나 대비에 대한 언급도 없다.

### 지침을 주는 방식 자체

1. **의미 우선 (meaning-first) 원칙**: 이 스킬의 핵심. "A premium brand kit is not decoration. It is **a visual argument for why the brand exists**." 5개 질문 게이트 + 9개 전략 추론 항목 + 카테고리별 심볼 로직 표. **미학보다 의미 도출을 앞세운 유일한 스킬** (이 컬렉션 내에서).
2. **카테고리 → 심볼 매핑 표**: 9개 카테고리에 core ideas와 possible symbol logic을 짝지음. 로고 아이디어를 **조회 가능한 형태로** 제공.
3. **로고 컨셉 방법론 5개 + 조합 상한**: "Use one or combine two maximum." 각 방법에 예시 4~7개. 창의성을 **방법론 선택 + 상한**으로 구조화.
4. **Visual Mode 8개 × 4항목 (용도/시각단서/로고로직/무드)**: 브랜드 카테고리를 시각 어휘 세트에 매핑. `garden-skills/web-design-engineer`의 6개 학파나 `beautiful-article`의 11개 테마와 같은 방법론.
5. **패널 시스템으로 구성 강제**: 9개 패널 각각의 내용을 규정. 즉 "브랜드 보드"라는 모호한 산출물을 **9개 슬롯으로 분해**.
6. **리듬 규정**: "Do not make every panel equally loud." + 6개 톤 (quiet/functional/emotional/technical/atmospheric/detailed). 시각적 강약을 명시적 설계 변수로.
7. **좋은 예 / 나쁜 예를 항목마다 쌍으로**: 텍스트, 태그라인, 이미지, 목업, 컬러, 참조 사용 — 6개 영역에서 "Use / Avoid" 또는 "Good / Bad"를 병기.
8. **좋은 태그라인 8개를 실물로 제시**: 추상적 "짧고 구체적"이 아니라 실제 문구 8개. 즉 **감각을 예시로 전달**.
9. **참조를 품질 기준으로 재정의**: "The references are not a fixed style. They define the **quality bar, restraint, and presentation logic**." + "Use references as **quality training, not as templates**." 그리고 추출할 것(layout rhythm, grid style, spacing, typography scale, visual density, logo placement, amount of text, image treatment, accent color logic, brand-system behavior) vs 복사 금지할 것(exact logo/brand name/composition/slogan/unique visual asset)을 분리 명시. **이 컬렉션에서 참조 사용 윤리를 가장 명확히 규정한 지점.**
10. **내부 프롬프트 템플릿 제공**: "Use this structure **internally**" — 최종 이미지 프롬프트의 골격을 9개 필드로 고정.
11. **이미지 생성 모델의 한계를 반영**: "Text should be large enough and sparse enough to **render well**" — 텍스트 렌더링 실패를 사전에 회피하는 실용 규칙.
12. **최종 산출 기준을 5개 대조로 제시**: "The image must look like: a premium identity deck / a senior designer's presentation board / a brand-system case study / a visual launch direction / a professional logo concept board"
13. **페르소나 부여**: "elite brand identity art director, logo designer, visual-system strategist, and presentation designer" — 4개 역할 동시 부여.
14. **참조 대상**: 브랜드명·디자이너명이 **없다.** 대신 "premium brand-guidelines decks", "serious identity studio"라는 카테고리로 지시. (`web-design-engineer`가 25개 브랜드를 명시하는 것과 정반대 — 로고 표절 방지 목적으로 읽힌다)

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**visually expensive**" | 강한 gutters + 절제된 밀도 + 매우 희소한 타이포 + 큰 네거티브 스페이스 + Premium Detail 16항목 중 일부 + 단일 지배 팔레트 |
| "**came from a serious identity studio**" | 9개 패널 시스템 + 로고 구성 논리 패널 + 리듬 있는 강약 + 최종 산출 기준 5개 |
| "**ownable**" | 5개 질문 중 마지막 — 의미 기반 심볼 + 카테고리별 로직 + 리덕션 |
| "**research and reduction**" (로고) | 5개 컨셉 방법론 중 1~2개 + 카테고리 심볼 로직 표 |
| "**intentional**" | "Do not pick symbols randomly" + 전략 9항목 추론 선행 |
| "**generic logos**" (회피) | 번개·랜덤 동물·가짜 럭셔리 크레스트·표절·과복잡·클립아트·의미 없는 반짝임 |
| "**messy AI moodboards**" (회피) | ANTI-GENERIC 12항목 |
| "**quieter, sharper, more intentional**" | ANTI-GENERIC 규칙 전체의 방향 |
| "**cinematic brand atmosphere**" | image-led 패널 + 저투명도 오버레이 + halftone/grain/scanline 텍스처 + 무디한 이미지 디렉션 |
| "**premium detail should reward looking closer**" | 16개 디테일 항목을 **절제해서** 사용 |
| "**rhythm**" (보드 구성) | quiet / functional / emotional / technical / atmospheric / detailed 6개 톤의 배분 |
| "**subtle and readable**" (메타포 융합) | 두 의미를 하나로 축약, 예시 7개 제시 |
| "**crisp**" (네거티브 스페이스) | hidden arrow / protected center / cutout initial / internal path / folded corner / crossing shapes로 만든 눈 |
| "**abstract and premium, not literal**" | Product Action 방법의 제약 |
| "**Mockups are identity applications, not feature demos**" | 브라우저 크롬·URL 바·터미널·앱 아이콘 수준으로 제한, 데이터 많은 대시보드 금지 |
| "**one strong brand idea per board**" | 보드 하나에 하나의 아이디어 |
| "**stronger than normal AI-generated brand visuals**" | 최종 산출 기준 9항목 (clean/strategic/symbolic/minimal/coherent/premium/art-directed/implementation-friendly) |

## 7. 산출물

- **형식**: **단일 이미지** (브랜드킷 오버뷰 보드)
- **기본 규격**: `3 × 3` 그리드, 종횡비 `4:3` 또는 `16:10`
- **패널 구성**: 기본 9개 (또는 선택한 레이아웃에 맞춰 6/4/3/8개)
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- **최종 산출 기준 (원문)**: "clean / strategic / symbolic / minimal / coherent / premium / art-directed / implementation-friendly / stronger than normal AI-generated brand visuals"
- 프롬프트를 파일로 남기라는 지침 **없음** (`gpt-image-2`가 프롬프트 낙반을 의무화하는 것과 대비)

## 8. 주의점 / 한계

- **실행 경로가 규정되지 않음 (가장 큰 공백)**: 이미지 생성 스킬인데 **어떤 도구로 생성하는지, 키가 필요한지, 없으면 어떻게 하는지가 원문에 전혀 없다.** 같은 성격의 `garden-skills/gpt-image-2`는 3개 모드(로컬 API / 호스트 위임 / 프롬프트 고문)를 감지 스크립트로 판정하고 각 모드의 행동을 규정한다. 이 스킬은 호스트의 이미지 도구를 암묵적으로 전제하는 것으로 보이나 명시가 없어, 도구가 없는 환경에서 무엇을 출력할지 불명확하다.
- **이미지 생성 모델의 텍스트 렌더링 한계**: 보드에는 브랜드명·태그라인·라벨·UI 칩·페이지 번호 등 텍스트가 다수 들어간다. 원문이 "large enough and sparse enough to render well"로 완화하려 하지만, 현실적으로 텍스트가 깨질 가능성이 높다. **검증 장치가 없다.**
- **로고를 이미지로 생성하는 근본 한계**: 산출물은 래스터이므로 실제 브랜드 자산(벡터 로고, 파일 세트)이 되지 못한다. "implementation-friendly"라고 최종 기준에 넣었지만 벡터화 경로가 **원문에 없다.** 컨셉 제시용으로만 유효하다.
- **표절 위험**: "copied famous marks" / "no copied real-world logos" / "Do not copy: exact logo"를 명시 금지하지만, 이미지 생성 모델이 학습된 브랜드 마크를 재현할 위험은 프롬프트 규칙으로 완전히 막을 수 없다. **검증 절차가 없다.**
- **hex 값 부재**: 8개 추천 팔레트가 자연어 색 이름("muted coral", "fog gray", "espresso")으로만 주어진다. 이미지 생성에는 충분하지만, 그 결과를 실제 디자인 시스템으로 옮길 때 hex 추출이 별도 작업이 된다. 후속 스킬로의 핸드오프 지침이 **원문에 없다.**
- **컬렉션 내 연계 부재**: 이 스킬이 브랜드 방향을 만들고, `high-end-visual-design`이나 `design-taste-frontend`가 그것을 구현하는 흐름이 자연스럽지만 **상호 참조가 전혀 없다.** `garden-skills/web-design-engineer`가 `brand-spec.md`를 산출물로 규정하는 것과 비교하면, 이 스킬은 다음 단계로 넘길 구조화된 산출물(토큰 파일 등)을 만들지 않는다.
- **8개 Visual Mode 중 6개가 다크**: Dark Developer / Dark Product / Dark Nature / Dark Security / Light Editorial / Luxury / Voice(dark indigo) / Cultural. 라이트 계열이 Light Editorial과 Luxury 2개뿐이다. 밝고 친근한 소비자 브랜드(교육, 아동, 커머스 등)의 커버가 얇다.
- **description의 트리거 부재**: "Use when…"이 없어 활성화 조건이 불명확. 다만 산출물 종류가 명확하므로 다른 스킬과의 혼동 위험은 낮다.
- **강한 경고 지점**:
  - "**Do not generate generic logos.** / **Do not generate random mockups.** / **Do not generate messy AI moodboards.**"
  - "**Do not pick symbols randomly.**"
  - "Use one or **combine two maximum**." (로고 방법)
  - "**Do not make every panel equally loud.**"
  - "**Never make:**" (ANTI-GENERIC 12항목)
  - "Use references as **quality training, not as templates**." + "Do not copy: exact logo / brand name / composition / slogan / unique visual asset"
  - "**Mockups are identity applications, not feature demos.**"
  - "**Do not overuse them.**" (Premium Detail)
- **검증 장치**: **없다.** 체크리스트, 사전 계획 블록, 자체 점검, 실행 검증 모두 부재. 최종 산출 기준 9항목이 있으나 검증 절차가 아니라 목표 서술이다. 생성된 이미지의 품질·텍스트 정확성·표절 여부를 확인하는 단계가 전혀 없다는 점이 이 스킬의 가장 큰 구조적 약점.
