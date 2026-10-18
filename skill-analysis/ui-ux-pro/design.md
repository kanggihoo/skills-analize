# design 분석

## 1. 개요

- **원본 경로**: `skills-collections/ui-ux-pro/design/`
- **핵심 파일**: `SKILL.md` (12,430 bytes) — **version 2.1.0** (이 컬렉션에서 유일하게 1.0.0이 아닌 버전)
- **보조 파일** (총 40개 이상)
  - `references/` 18개 (총 2,264줄): `design-routing.md`(207), 로고 4개(`logo-design`96 / `logo-style-guide`109 / `logo-color-psychology`101 / `logo-prompt-engineering`158), CIP 4개(`cip-design`121 / `cip-deliverable-guide`95 / `cip-style-guide`68 / `cip-prompt-engineering`84), 슬라이드 6개(`slides`42 / `slides-create`4 / `slides-html-template`295 / `slides-layout-patterns`137 / `slides-copywriting-formulas`84 / `slides-strategies`94), `banner-sizes-and-styles.md`(118), `social-photos-design.md`(329), `icon-design.md`(122)
  - `data/` 8개 CSV: `logo/styles.csv`(56행), `logo/colors.csv`(56행), `logo/industries.csv`(56행), `cip/deliverables.csv`(50행), `cip/styles.csv`(20행), `cip/industries.csv`(20행), `cip/mockup-contexts.csv`(20행), `icon/styles.csv`(16행)
  - `scripts/` 9개: `logo/`(search, generate, core, tests/test_generate.py), `cip/`(search, generate, render-html, core), `icon/generate.py`
- **성격**: **이 컬렉션의 통합 허브(umbrella) 스킬**. 6개 내장 기능(Logo / CIP / Slides / Banner / Social Photos / Icon) + 3개 외부 서브스킬 라우팅(brand / design-system / ui-styling). **4개 컬렉션 37개 스킬 중 커버 범위가 가장 넓다.**

원문 자기 규정: "Unified design skill: brand, tokens, UI, logo, CIP, slides, banners, social photos, icons."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문 (전문):

> "Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (**55 styles, Gemini or Atlas Cloud AI**), corporate identity program (**50 deliverables, CIP mockups**), HTML presentations (Chart.js), banner design (**22 styles**, social/ads/web/print), icon design (**15 styles, SVG, Gemini 3.1 Pro**), social photos (HTML→screenshot, multi-platform). **Actions:** design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. **Platforms:** Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads."

`argument-hint`: `[design-type] [context]`
`metadata`: `author: claudekit`, **`version: "2.1.0"`**

**§When to Use (8개)** — brand identity / design system tokens / UI styling / logo / CIP / presentations / banner / social photos

**description의 구조**: `banner-design`과 같은 방식(`Actions:` / `Platforms:` 분류 나열)이지만 범위가 훨씬 넓다. **트리거 어휘를 최대화한 설계이며, 그 결과 같은 컬렉션의 5개 스킬(`brand`, `design-system`, `ui-styling`, `slides`, `banner-design`)과 트리거가 전면 중첩된다** (§8 참조).

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **완전한 브랜드 패키지가 필요할 때** — 원문의 워크플로우: "Logo → CIP → Presentation"
- **로고 생성** — 55개 스타일 + 30개 팔레트 + 25개 산업 가이드, Gemini/Atlas Cloud 2개 제공자
- **CIP (기업 아이덴티티 프로그램)** — 50개 산출물 + 20개 스타일 + 20개 산업 + 20개 목업 컨텍스트. **4개 컬렉션에서 CIP를 다룬 유일한 스킬**
- **SVG 아이콘 생성** — 15개 스타일, Gemini 3.1 Pro의 **텍스트 출력**으로 SVG 생성 (이미지 생성 API 불필요)
- 소셜 사진 다플랫폼 — 8개 규격 + HTML→스크린샷
- 어느 하위 기능이 필요한지 판단이 필요할 때 — `design-routing.md` 207줄

**부적합 / 과한 상황**
- **`GEMINI_API_KEY`가 없는 환경** — 로고·CIP·아이콘 3개 기능이 모두 막힌다. 폴백은 **원문에 명시 없음**
- 단일 기능만 필요할 때 — 전용 스킬(`brand`/`design-system`/`ui-styling`/`slides`/`banner-design`)이 별도로 존재
- 의존 스킬이 없는 환경 — `frontend-design`, `ai-artist`, `ai-multimodal`, `chrome-devtools`, `assets-organizing`, `project-management`, `ui-ux-pro-max` 참조. 이 중 **`ui-ux-pro-max`만 이 컬렉션에 존재**
- Python이 없는 환경

**형제 스킬 대신 이걸 고르는 기준**: 원문이 `design-routing.md`로 이를 다루지만, 실질적으로는 **이 스킬이 다른 5개를 포함하는 상위 집합**이다. 즉 "무엇을 골라야 하는가"가 이 컬렉션의 가장 큰 미해결 문제다 (§8 참조).

## 4. 외부 의존성 (**이 컬렉션에서 가장 무겁다**)

### API 키 — **2개, 3개 기능이 의존**
- **`GEMINI_API_KEY`** (필수 — 로고/CIP/아이콘)
  ```bash
  export GEMINI_API_KEY="your-key"  # https://aistudio.google.com/apikey
  pip install google-genai pillow
  ```
  - `logo/generate.py`, `cip/generate.py`, `icon/generate.py`가 사용
  - `cip/generate.py`는 `GEMINI_API_KEY` **또는 `GOOGLE_API_KEY`** 중 하나를 읽음 (grep 확인)
  - `icon/generate.py`는 키 없을 때 명시적 에러: `"Error: GEMINI_API_KEY not set"` + `"Set it with: export GEMINI_API_KEY='your-key'"`
- **`ATLASCLOUD_API_KEY`** (선택 — 로고의 대체 제공자)
  ```bash
  # Optional Atlas Cloud provider (no extra Python package required)
  export ATLASCLOUD_API_KEY="your-key"
  ```
  - `logo/generate.py --provider atlas`로 호출
  - 테스트가 존재: `test_atlas_requires_api_key`가 `"ATLASCLOUD_API_KEY not set"` RuntimeError를 검증
  - 보안 테스트: `test_media_download_never_forwards_api_key` — **미디어 다운로드 시 API 키를 전달하지 않음을 검증.** 4개 컬렉션에서 키 유출 방지를 테스트로 검증한 유일한 사례

**키 없을 때의 동작**: 스크립트가 에러 메시지 + 설정 방법을 출력한다(아이콘 기능 확인). 그러나 **SKILL.md 수준의 폴백 워크플로우(키 없이 진행하는 경로)는 원문에 없다.**

### 사용 모델 (원문)
| 기능 | 모델 | 비고 |
|---|---|---|
| CIP | `gemini-2.5-flash-image` (`flash`, 기본) | |
| CIP | `gemini-3-pro-image-preview` (`pro`) | "Pro model (4K text)" |
| Icon | `gemini-3.1-pro-preview` | "**text-only output (SVG is XML text). No image generation API needed.**" |
| Logo | "Gemini Nano Banana models" | 구체 모델명은 SKILL.md에 없음 |

### 필요한 CLI/런타임/패키지
- **Python 3** — "On Windows, use `python` instead of `python3`". 확인 명령 제공: `python3 --version || python --version`
- **`google-genai`**, **`pillow`** (pip)
- **Node.js** — 외부 스킬(`chrome-devtools`)
- **Chrome / Playwright** — 소셜 사진 스크린샷 ("2x deviceScaleFactor")
- **BM25** — `logo/core.py`, `cip/core.py`가 "BM25 search engine". 라이브러리 의존은 **원문에 명시 없음**

### 의존 스킬 (원문 "Integration")
> "**External sub-skills:** brand, design-system, ui-styling
> **Related Skills:** frontend-design, ui-ux-pro-max, ai-multimodal, chrome-devtools"

추가로 본문에서 언급: `ai-artist`, `assets-organizing`, `project-management`, 슬래시 커맨드 `/ckm:brand`, `/ckm:design-system`, `/ck:ui-ux-pro-max`, `/ck:frontend-design`, `/ui-ux-pro-max`

→ **이 컬렉션에 존재하는 것은 `brand`, `design-system`, `ui-styling`, `ui-ux-pro-max` 4개뿐이며, `frontend-design`, `ai-artist`, `ai-multimodal`, `chrome-devtools`, `assets-organizing`, `project-management` 6개는 없다.**

- **네트워크**: Gemini API, Atlas Cloud API, Pinterest 리서치, pip 설치
- **비용 발생 지점**: **Gemini 이미지 생성이 주된 비용.** 로고 변형, CIP 전체 세트(`--set`, 50개 산출물 중 다수), 아이콘 배치(`--batch 4`), 멀티사이즈(`--sizes "16,24,32,48"`). Pro 모델(4K)은 더 비쌈. **비용 상한·확인 절차가 원문에 없다.**

## 5. 워크플로우

### Sub-skill Routing (원문 표) — 진입점
| Task | Sub-skill | Details |
|------|-----------|---------|
| Brand identity, voice, assets | `brand` | **External skill** |
| Tokens, specs, CSS vars | `design-system` | **External skill** |
| shadcn/ui, Tailwind, code | `ui-styling` | **External skill** |
| Logo creation, AI generation | Logo (built-in) | `references/logo-design.md` |
| CIP mockups, deliverables | CIP (built-in) | `references/cip-design.md` |
| Presentations, pitch decks | Slides (built-in) | `references/slides.md` |
| Banners, covers, headers | Banner (built-in) | `references/banner-sizes-and-styles.md` |
| Social media images/photos | Social Photos (built-in) | `references/social-photos-design.md` |
| SVG icons, icon sets | Icon (built-in) | `references/icon-design.md` |

### Logo Design (내장) — 3단계
**1. 디자인 브리프 생성**
```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```
**2. 도메인별 검색** (style / color / industry)
```bash
python3 .../logo/search.py "minimalist clean" --domain style
python3 .../logo/search.py "tech professional" --domain color
python3 .../logo/search.py "healthcare medical" --domain industry
```
**3. AI 생성**
```bash
python3 .../logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python3 .../logo/generate.py --prompt "coffee shop vintage badge" --style vintage
python3 .../logo/generate.py --brand "TechFlow" --provider atlas
```

**강제 규칙 (원문)**
- "**ALWAYS** generate output logo images with **white background**."
- "**IMPORTANT:** When scripts fail, **try to fix them directly**."
- "After generation, **ALWAYS** ask user about HTML preview via `AskUserQuestion`. If yes, invoke `/ui-ux-pro-max` for gallery."

### CIP Design (내장) — 3단계
**1. 브리프 생성**: `cip/search.py "tech startup" --cip-brief -b "BrandName"`
**2. 도메인 검색** (deliverable / style / industry / mockup)
**3. 목업 생성**
```bash
# With logo (RECOMMENDED)
python3 .../cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --deliverable "business card" --industry "consulting"
# Full CIP set
python3 .../cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --industry "consulting" --set
# Pro model (4K text)
python3 .../cip/generate.py --brand "TopGroup" --logo logo.png --deliverable "business card" --model pro
# Without logo
python3 .../cip/generate.py --brand "TechFlow" --deliverable "business card" --no-logo-prompt
```
**4. HTML 프레젠테이션 렌더**: `cip/render-html.py --brand ... --industry ... --images /path/to/cip-output`

**팁 (원문)**: "If no logo exists, **use Logo Design section above first**." → 로고 → CIP의 순서 의존.

### Banner Design (내장) — 5단계 (`banner-design` 스킬의 압축판)
1. "**Gather requirements** via `AskUserQuestion` — purpose, platform, content, brand, style, quantity"
2. "**Research** — Activate `ui-ux-pro-max`, browse Pinterest for references"
3. "**Design** — Create HTML/CSS banner with `frontend-design`, generate visuals with `ai-artist`/`ai-multimodal`"
4. "**Export** — Screenshot to PNG at exact dimensions via `chrome-devtools`"
5. "**Present** — Show all options side-by-side, iterate on feedback"

### Icon Design (내장) — 3가지 모드
```bash
# 단일
python3 .../icon/generate.py --prompt "settings gear" --style outlined
python3 .../icon/generate.py --prompt "shopping cart" --style filled --color "#6366F1"
python3 .../icon/generate.py --name "dashboard" --category navigation --style duotone
# 배치 변형
python3 .../icon/generate.py --prompt "cloud upload" --batch 4 --output-dir ./icons
# 멀티사이즈
python3 .../icon/generate.py --prompt "user profile" --sizes "16,24,32,48" --output-dir ./icons
```

### Social Photos (내장) — **8단계 (이 컬렉션에서 가장 긴 워크플로우)**
1. "**Orchestrate** — `project-management` skill for TODO tasks; **parallel subagents** for independent work"
2. "**Analyze** — Parse prompt: subject, platforms, style, brand context, content elements"
3. "**Ideate** — **3-5 concepts**, present via `AskUserQuestion`"
4. "**Design** — `/ckm:brand` → `/ckm:design-system` → **randomly invoke** `/ck:ui-ux-pro-max` **OR** `/ck:frontend-design`; HTML per idea × size"
5. "**Export** — `chrome-devtools` or Playwright screenshot at exact px (**2x deviceScaleFactor**)"
6. "**Verify** — Use Chrome MCP or `chrome-devtools` skill to **visually inspect exported designs**; fix layout/styling issues and **re-export**"
7. "**Report** — Summary to `plans/reports/` with design decisions"
8. "**Organize** — Invoke `assets-organizing` skill to sort output files and reports"

→ **6단계의 "시각적 검사 후 수정·재내보내기"가 4개 컬렉션에서 유일한 시각 검증 루프다.** 그리고 4단계의 "**randomly invoke**"는 스킬 선택을 무작위화하라는 지시로, 이 컬렉션에서 유일한 랜덤화 장치.

### Workflows (원문 2개)
**Complete Brand Package**
1. Logo → `scripts/logo/generate.py` → Generate logo variants
2. CIP → `scripts/cip/generate.py --logo ...` → Create deliverable mockups
3. Presentation → Load `references/slides-create.md` → Build pitch deck

**New Design System**
1. Brand (brand skill) → Define colors, typography, voice
2. Tokens (design-system skill) → Create semantic token layers
3. Implement (ui-styling skill) → Configure Tailwind, shadcn/ui

**사용자 확인 요구 지점 (3곳)**: 로고 생성 후 HTML 프리뷰 여부 (ALWAYS + AskUserQuestion) / 배너 요구사항 수집 (AskUserQuestion) / 소셜 사진 콘셉트 3-5개 제시 (AskUserQuestion). **이 컬렉션에서 사용자 확인이 가장 많은 스킬.**

## 6. 디자인 지침 분석

### 데이터 기반 지침 — **CSV 8개가 지침의 실체**

**`logo/styles.csv` (56행) 스키마 — 12열**
```
No,Style Name,Category,Keywords,Primary Colors,Secondary Colors,Typography,Effects,Best For,Avoid For,Complexity,Era
```
행 예시 (원문):
```
1,Minimalist,General,"clean, simple, essential, whitespace, geometric, modern",
  #000000 #FFFFFF #F5F5F5, Single accent only, Sans-serif thin weight,
  "None, sharp edges, high contrast",
  Tech startups SaaS apps professional services,
  Playful brands children entertainment, Low, 2010s-Present

2,Wordmark,Typography,"logotype, text-only, custom lettering, brand name",
  Brand-specific, Monochromatic, Custom modified typeface,
  "Kerning adjustments, ligatures",
  Established brands name recognition,
  Complex names visual-heavy industries, Low, Classic
```
→ **`Avoid For` 열이 스타일별 금지 용도를 데이터로 담고, `Complexity`·`Era` 열이 선택 근거를 제공한다.** 4개 컬렉션에서 로고 스타일에 시대·복잡도·부적합 용도를 데이터 필드로 기록한 유일한 사례.

**`logo/colors.csv` (56행) 스키마 — 12열**
```
No,Palette Name,Category,Keywords,Primary Hex,Secondary Hex,Accent Hex,Background Hex,Text Hex,Psychology,Best For,Avoid For
```
행 예시 (원문):
```
1,Classic Blue Trust,Professional,"trust, stability, corporate, reliable",
  #003366,#0055A4,#FFD700,#FFFFFF,#1A1A1A,
  Trust reliability professionalism, Finance legal healthcare corporate,
  Entertainment children playful

2,Tech Gradient,Technology,"modern, innovative, digital, future",
  #6366F1,#8B5CF6,#06B6D4,#0F172A,#F8FAFC,
  Innovation technology forward-thinking, Tech startups SaaS AI companies,
  Traditional heritage artisan
```
→ **팔레트당 5개 hex(primary/secondary/accent/background/text) + 심리 + 적합/부적합 용도.** 4개 컬렉션에서 컬러 심리학을 hex와 함께 데이터화한 유일한 사례. `logo-color-psychology.md`(101줄)가 이를 보완.

**기타 CSV**: `logo/industries.csv`(56행), `cip/deliverables.csv`(50행), `cip/styles.csv`(20행), `cip/industries.csv`(20행), `cip/mockup-contexts.csv`(20행), `icon/styles.csv`(16행)

### 강제 규칙 — 수치 인용

**Banner Design Rules (원문, `banner-design` 스킬과 동일)**
- "Safe zones: critical content in central **70-80%**"
- "One CTA per banner, **bottom-right**, min **44px** height"
- "Max **2** fonts, min **16px** body, **≥32px** headline"
- "Text under **20%** for ads (**Meta penalizes**)"
- "Print: **300 DPI**, **CMYK**, **3-5mm** bleed"

**Banner Quick Size Reference (8개)**
| Platform | Type | Size (px) |
|----------|------|-----------|
| Facebook | Cover | 820 x 312 |
| Twitter/X | Header | 1500 x 500 |
| LinkedIn | Personal | 1584 x 396 |
| YouTube | Channel art | 2560 x 1440 |
| Instagram | Story | 1080 x 1920 |
| Instagram | Post | 1080 x 1080 |
| Google Ads | Med Rectangle | 300 x 250 |
| Website | Hero | 1920 x 600-1080 |

**Social Photos Key Sizes (8개)**
| Platform | Size (px) | Platform | Size (px) |
|----------|-----------|----------|-----------|
| IG Post | 1080×1080 | FB Post | 1200×630 |
| IG Story | 1080×1920 | X Post | 1200×675 |
| IG Carousel | 1080×1350 | LinkedIn | 1200×627 |
| YT Thumb | 1280×720 | Pinterest | 1000×1500 |

**소셜 사진 내보내기**: "**2x deviceScaleFactor**"
**아이콘 멀티사이즈**: `16,24,32,48`
**아이콘 배치**: `--batch 4`
**콘셉트 수**: **3-5개** (소셜 사진 Ideate)

**로고 백그라운드**: "**ALWAYS** generate output logo images with **white background**"

### 스타일 카탈로그 (규모)
- **로고**: 55+ 스타일, 30 컬러 팔레트, 25 산업 가이드
- **CIP**: 50+ 산출물, 20 스타일, 20 산업, 20 목업 컨텍스트
- **배너**: 22 아트 디렉션 스타일 (Top 7을 SKILL.md에 표로)
- **아이콘**: 15 스타일 (Top 7을 SKILL.md에 표로)

**Icon Top Styles (원문)**
| Style | Best For |
|-------|----------|
| outlined | UI interfaces, web apps |
| filled | Mobile apps, nav bars |
| duotone | Marketing, landing pages |
| rounded | Friendly apps, health |
| sharp | Tech, fintech, enterprise |
| flat | Material design, Google-style |
| gradient | Modern brands, SaaS |

**Banner Top Art Styles (원문)**: Minimalist(SaaS,tech) / Bold Typography(Announcements) / Gradient(Modern brands) / Photo-Based(Lifestyle,e-com) / Geometric(Tech,fintech) / Glassmorphism(SaaS,apps) / Neon·Cyberpunk(Gaming,events)

### 금지 규칙 (anti-pattern)

**이 스킬에도 미학 금지 목록이 거의 없다.** 존재하는 것:
- 배너: "Text under 20% for ads (Meta penalizes)" — 플랫폼 정책
- CSV의 `Avoid For` 열 — **금지를 데이터로 표현.** 예: Minimalist → "Playful brands children entertainment", Wordmark → "Complex names visual-heavy industries", Classic Blue Trust → "Entertainment children playful", Tech Gradient → "Traditional heritage artisan"
- 로고 스타일의 `Effects` 열에 "None, sharp edges, high contrast" 같은 제약

→ **금지를 산문이 아니라 CSV 열로 구조화한 것이 이 컬렉션의 방식이다.** taste-skills가 수백 개의 산문 금지를 열거하는 것과 대조적이며, 조회 가능하다는 장점과 맥락 설명이 없다는 단점을 동시에 갖는다.

### 항목별 지침

- **타이포그래피**: 배너(최대 2폰트, 본문 ≥16px, 헤드라인 ≥32px). 로고는 CSV의 `Typography` 열("Sans-serif thin weight", "Custom modified typeface"). 서체명 지정·크기 스케일은 **SKILL.md에 없음**
- **컬러**: `logo/colors.csv`의 30개 팔레트 × 5 hex + 심리 + 적합/부적합. **4개 컬렉션에서 팔레트를 hex와 함께 가장 많이 제공하는 스킬**
- **스페이싱**: 배너 안전 영역 70-80%가 유일. spacing scale은 **없음** (`design-system`에 위임)
- **모션**: 슬라이드 애니메이션 클래스(참조 파일에 위임)가 유일. `prefers-reduced-motion` **없음**
- **레이아웃**: 플랫폼 규격(배너 8 + 소셜 8), 슬라이드 25개 레이아웃(참조 파일)
- **접근성**: 배너 규칙의 "min 44px height"(CTA)가 유일. 대비 비율은 `banner-design` 스킬에는 4.5:1이 있으나 **이 스킬의 압축판에는 누락**
- **아이콘**: 15 스타일 + 12 카테고리. SVG를 **텍스트 출력**으로 생성 (이미지 API 불필요)
- **CIP**: 50개 산출물 + 목업 컨텍스트 20개 (예: "office reception")

### 지침을 주는 방식 자체

1. **통합 허브 + 라우팅 표**: 9개 과제 → 서브스킬(내장 6 / 외부 3) 매핑. 별도로 `design-routing.md`(207줄)가 과제 유형별 라우팅을 상세화.
2. **CSV를 지침 저장소로**: 8개 CSV에 스타일·색·산업·산출물·목업 컨텍스트를 구조화. `Best For` / `Avoid For` / `Psychology` / `Complexity` / `Era` 열이 **선택 근거를 데이터로** 제공.
3. **BM25 검색으로 조회**: `logo/core.py`, `cip/core.py`. 자연어 쿼리 → 스타일·색·산업 추천.
4. **디자인 브리프 자동 생성**: `--design-brief` / `--cip-brief` 플래그. 검색 결과를 브리프 문서로 합성.
5. **제공자 선택 (로고)**: Gemini(기본) / Atlas Cloud(`--provider atlas`). **4개 컬렉션에서 이미지 생성 제공자를 2개 지원한 유일한 스킬.**
6. **모델 티어 (CIP)**: `flash`(기본) / `pro`(4K 텍스트). 텍스트 품질이 중요한 산출물(명함 등)에 Pro.
7. **아이콘을 텍스트 생성으로**: "`gemini-3.1-pro-preview` — text-only output (**SVG is XML text**). **No image generation API needed.**" → 이미지 생성의 텍스트 렌더링 한계를 **SVG 코드 생성으로 우회한 영리한 설계.**
8. **로고 → CIP 순서 의존 명시**: "If no logo exists, use Logo Design section above first."
9. **스크립트 실패 시 직접 수정 지시**: "**IMPORTANT:** When scripts fail, **try to fix them directly**." — 4개 컬렉션에서 스크립트 자체를 고치라고 지시한 유일한 사례.
10. **AskUserQuestion 3곳**: 로고 후 프리뷰(ALWAYS), 배너 요구사항, 소셜 콘셉트 3-5개.
11. **시각 검증 루프 (소셜 사진 6단계)**: "**visually inspect** exported designs; fix layout/styling issues and **re-export**". Chrome MCP 또는 `chrome-devtools` 사용.
12. **병렬 서브에이전트 + TODO 오케스트레이션**: 소셜 사진 1단계가 `project-management` 스킬로 TODO를 만들고 병렬 서브에이전트를 쓰라고 지시.
13. **스킬 선택의 무작위화**: "**randomly invoke** `/ck:ui-ux-pro-max` OR `/ck:frontend-design`". 근거는 **원문에 없다.**
14. **보고서 산출**: "Summary to `plans/reports/` with design decisions" + `assets-organizing`으로 정리.
15. **Windows 대응 반복**: "On Windows, use `python` instead of `python3`" + `python -m pip` 안내 + 버전 확인 명령.
16. **테스트 + 보안 테스트**: `logo/tests/test_generate.py`에 `test_media_download_never_forwards_api_key`, `test_atlas_requires_api_key`.
17. **페르소나 부여 없음**, **미학 산문 지침 최소.**

### 모호한 감각어의 번역

이 스킬은 **감각어를 CSV 열로 환원한다.** 이 컬렉션의 방식이 가장 극단적으로 나타난 지점:

| 감각어 | 구체적 조작 |
| --- | --- |
| "**minimalist**" (로고) | CSV 행: Primary `#000000 #FFFFFF #F5F5F5` / Secondary "Single accent only" / Typography "Sans-serif thin weight" / Effects "None, sharp edges, high contrast" / Complexity "Low" / Era "2010s-Present" |
| "**trust, stability, corporate**" | `Classic Blue Trust`: `#003366`/`#0055A4`/`#FFD700`/`#FFFFFF`/`#1A1A1A` + Psychology "Trust reliability professionalism" |
| "**modern, innovative, digital, future**" | `Tech Gradient`: `#6366F1`/`#8B5CF6`/`#06B6D4`/`#0F172A`/`#F8FAFC` |
| "**tech startup modern**" (자연어 쿼리) | BM25 검색 → 스타일·색·산업 추천 → `--design-brief`로 브리프 합성 |
| "**friendly**" (아이콘) | `rounded` 스타일 ("Friendly apps, health") |
| "**enterprise**" (아이콘) | `sharp` 스타일 ("Tech, fintech, enterprise") |
| "**Playful brands children entertainment**" | Minimalist 로고 스타일의 `Avoid For` — **부적합을 데이터로** |

## 7. 산출물

- **로고**: PNG 이미지 (**흰 배경 강제**), 변형 다수. 선택적으로 `/ui-ux-pro-max` HTML 갤러리
- **CIP**: 목업 이미지 (`--set`으로 전체 세트) + **HTML 프레젠테이션** (`render-html.py`)
- **아이콘**: **SVG** (텍스트 출력), 배치·멀티사이즈(`16,24,32,48`) 지원, `--output-dir ./icons`
- **배너**: PNG (Chrome 스크린샷)
- **소셜 사진**: PNG (2x deviceScaleFactor) + **보고서** (`plans/reports/`)
- **슬라이드**: HTML (Chart.js)
- **파일 저장 위치**: `--output-dir` 옵션(아이콘), `plans/reports/`(소셜 사진 보고서). 그 외 네이밍 규칙은 **SKILL.md에 명시 없음** (`assets-organizing` 스킬에 위임)

## 8. 주의점 / 한계

- **이 컬렉션 전체와 트리거·기능이 중복된다 (가장 큰 구조적 문제)**
  | 기능 | 이 스킬 | 전용 스킬 | 중복 형태 |
  |---|---|---|---|
  | Slides | `references/slides*.md` 6개 | `slides` 스킬 (`references/` 5개) + `design-system` (CSV 8개 + 스크립트 5개) | **3중 중복** |
  | Banner | `references/banner-sizes-and-styles.md` + 5단계 워크플로우 | `banner-design` 스킬 (동명 참조 파일 + 상세 워크플로우) | **2중 중복, 파일명 동일** |
  | Brand | 라우팅만 | `brand` 스킬 | 라우팅 |
  | Tokens | 라우팅만 | `design-system` 스킬 | 라우팅 |
  | UI | 라우팅만 | `ui-styling` 스킬 | 라우팅 |
  → `design/references/banner-sizes-and-styles.md`와 `banner-design/references/banner-sizes-and-styles.md`는 **같은 파일명으로 둘 다 존재**하며 동기화 방법이 **원문에 없다.** description도 두 스킬이 배너 트리거를 공유하므로 **어느 스킬이 활성화될지 예측하기 어렵다.**
- **의존 스킬 6개가 이 컬렉션에 없다**: `frontend-design`, `ai-artist`, `ai-multimodal`, `chrome-devtools`, `assets-organizing`, `project-management`. 배너·소셜 사진 워크플로우가 이들에 의존하므로 **단독 설치 시 실행되지 않는다.** 폴백은 **원문에 없다.**
- **`GEMINI_API_KEY` 부재 시 3개 기능 정지**: 로고·CIP·아이콘이 모두 Gemini에 의존한다. 스크립트가 에러 메시지를 내지만, **SKILL.md 수준에서 "키 없이 무엇을 할 수 있는가"가 규정되지 않았다.** `garden-skills/gpt-image-2`가 Mode A/B/C로 3가지 환경을 처리하는 것과 대비된다.
- **하드코딩된 경로**: `python3 ~/.claude/skills/design/scripts/...`. 홈 디렉토리 기준 절대 경로이므로 다른 설치 위치에서는 동작하지 않는다.
- **"randomly invoke"의 근거 부재**: 소셜 사진 4단계가 `/ck:ui-ux-pro-max` 또는 `/ck:frontend-design`을 무작위로 호출하라고 한다. **왜 무작위인지, 무엇이 달라지는지 원문에 설명이 없다.** 재현성을 해치는 지시다.
- **"When scripts fail, try to fix them directly"의 위험**: 스킬 스크립트를 에이전트가 직접 수정하라는 지시다. 스킬 자체가 오염될 수 있고, 원인 진단 없이 수정하면 조용한 실패로 이어질 수 있다. **범위 제한이나 주의사항이 없다.**
- **배너 규칙의 압축 손실**: `banner-design` 스킬에는 "**4.5:1 contrast ratio**"가 있는데 이 스킬의 압축판에는 **누락**되었다. 즉 통합 스킬을 쓰면 접근성 규칙 하나를 잃는다.
- **버전 불일치**: 이 스킬만 `2.1.0`이고 나머지 6개는 `1.0.0`이다. 무엇이 2.x로 올라간 변화인지, 다른 스킬과의 호환성이 어떤지 **원문에 없다.**
- **CIP의 텍스트 렌더링 위험**: 명함·레터헤드는 텍스트가 핵심인데 이미지 생성으로 만든다. `--model pro`가 "4K text"로 이를 완화하려 하지만, 이미지 생성 모델의 텍스트 정확성은 보장되지 않는다. **검증 절차가 로고·CIP에는 없다** (소셜 사진에만 시각 검증 루프가 있다).
- **아이콘의 SVG 품질 검증 부재**: Gemini 3.1 Pro가 SVG 텍스트를 생성하는 영리한 설계이지만, 생성된 SVG가 유효한지·최적화되었는지·시각적으로 올바른지 검증하는 단계가 **원문에 없다.**
- **비용 통제 부재**: CIP `--set`은 50개 산출물 중 다수를 생성하고, 아이콘 `--batch 4` × 4사이즈, 로고 변형 다수. **상한·경고·확인이 원문에 없다.**
- **미학 금지 목록의 희박함**: CSV의 `Avoid For` 열이 유일한 금지 체계다. "AI가 만든 것 같은 로고"를 막는 장치가 없어, 55개 스타일 중 하나를 고르고 CSV 값을 따르더라도 진부한 결과가 나올 수 있다.
- **강한 경고 지점**
  - "**ALWAYS** generate output logo images with **white background**."
  - "**IMPORTANT:** When scripts fail, **try to fix them directly**."
  - "After generation, **ALWAYS** ask user about HTML preview via `AskUserQuestion`."
  - "If no logo exists, **use Logo Design section above first**."
  - "On Windows, use `python` instead of `python3`"
- **검증 장치**: 소셜 사진 6단계의 **시각 검사 + 재내보내기 루프** (4개 컬렉션에서 유일한 시각 검증) + `logo/tests/test_generate.py`의 **보안 테스트**(API 키 미전달 검증) + 스크립트 실패 시 직접 수정. 다만 로고·CIP·아이콘 산출물 자체의 품질 검증은 없고, 체크리스트도 없다.
