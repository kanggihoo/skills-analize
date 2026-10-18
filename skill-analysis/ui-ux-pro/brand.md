# brand 분석

## 1. 개요

- **원본 경로**: `skills-collections/ui-ux-pro/brand/`
- **핵심 파일**: `SKILL.md` (2,939 bytes) — **인덱스 역할만 하는 얇은 진입점**
- **보조 파일** (총 20개, 실질 내용의 대부분):
  - `references/` 11개 (총 1,532줄): `voice-framework.md`(88), `visual-identity.md`(96), `messaging-framework.md`(85), `consistency-checklist.md`(94), `brand-guideline-template.md`(140), `asset-organization.md`(157), `color-palette-management.md`(186), `typography-specifications.md`(214), `logo-usage-rules.md`(185), `approval-checklist.md`(169), `update.md`(118)
  - `templates/brand-guidelines-starter.md` (275줄)
  - `scripts/` 5개: `inject-brand-context.cjs`, `sync-brand-to-tokens.cjs`, `validate-asset.cjs`, `extract-colors.cjs`, `tests/test_sync_brand_to_tokens.py`
- **성격**: **브랜드 아이덴티티 관리 + 디자인 토큰 동기화 스킬**. 미적 창작이 아니라 **브랜드 문서를 단일 진실 소스로 두고 토큰·프롬프트·자산 검증으로 전파**하는 파이프라인. 4개 컬렉션에서 유일하게 브랜드 문서 ↔ 코드 토큰의 **양방향 배관**을 구현한다.

원문 자기 규정: "Brand identity, voice, messaging, asset management, and consistency frameworks."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter 원문:
```yaml
name: brand
description: Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
argument-hint: "[update|review|create] [args]"
metadata:
  author: claudekit
  version: "1.0.0"
```

`argument-hint`가 3개 서브커맨드를 시사: `update` / `review` / `create`. 단 **§Subcommands 표에는 `update` 하나만 정의**되어 있다 (§8 참조).

**§When to Use (6개)**
- "Brand voice definition and content tone guidance"
- "Visual identity standards and style guide development"
- "Messaging framework creation"
- "Brand consistency review and audit"
- "Asset organization, naming, and approval"
- "Color palette management and typography specs"

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **브랜드 가이드라인을 문서로 수립**하고 그것을 코드 토큰으로 내려보내야 할 때 — 이 스킬의 핵심 가치
- 브랜드 색·서체를 바꾸고 **모든 디자인 시스템 파일에 자동 반영**해야 할 때 (`sync-brand-to-tokens.cjs`)
- 다른 스킬(예: `banner-design`, `design`)에 **브랜드 컨텍스트를 프롬프트로 주입**해야 할 때 (`inject-brand-context.cjs`)
- 산출된 자산이 브랜드 규격을 지켰는지 검증할 때 (`validate-asset.cjs`, `extract-colors.cjs`)
- 브랜드 일관성 감사 — 94줄 체크리스트 + 169줄 승인 체크리스트
- 신규 브랜드 착수 — 275줄 스타터 템플릿

**부적합 / 과한 상황**
- **브랜드 아이덴티티를 창작해야 할 때** — 이 스킬은 로고 컨셉·심볼 도출을 다루지 않는다. `taste-skills/brandkit`(브랜드 보드 이미지 생성)이나 같은 컬렉션의 `design`(로고 생성)이 그 역할
- `docs/brand-guidelines.md` 관례를 따르지 않는 프로젝트 — 모든 스크립트가 이 경로를 전제
- Node.js가 없는 환경
- 일회성 작업 — 토큰 동기화 파이프라인의 이득이 없다

**형제 스킬 대신 이걸 고르는 기준**: **브랜드 규격의 정의·전파·검증**인가. 창작이면 `design`/`brandkit`, 토큰 아키텍처면 `design-system`, 스타일 적용이면 `ui-styling`.

## 4. 외부 의존성

- **API 키**: **불필요.** grep 결과 이 스킬의 스크립트·문서에 API 키 참조가 없다 (같은 컬렉션의 `design` 스킬만 `GEMINI_API_KEY`/`ATLASCLOUD_API_KEY`를 요구).
- **폴백 모드**: **원문에 명시 없음.**
- **필요한 CLI/런타임/패키지**
  - **Node.js** — 4개 `.cjs` 스크립트
  - **Python 3** — 테스트(`tests/test_sync_brand_to_tokens.py`)
  - 이미지 색 추출(`extract-colors.cjs <image-path>`)에 필요한 패키지는 **원문에 명시 없음**
- **파일 경로 전제 (하드 관례)**
  - `docs/brand-guidelines.md` — **Source of truth**
  - `assets/design-tokens.json` — Token definitions
  - `assets/design-tokens.css` — CSS variables
- **네트워크**: 폰트 로딩 시 (typography-specifications.md가 Google Fonts `<link>` 방식을 "recommended"로 제시)
- **비용 발생 지점**: 없음.

## 5. 워크플로우

### Quick Start — 3개 명령

**프롬프트에 브랜드 컨텍스트 주입**
```bash
node scripts/inject-brand-context.cjs
node scripts/inject-brand-context.cjs --json
```

**자산 검증**
```bash
node scripts/validate-asset.cjs <asset-path>
```

**색 추출/비교**
```bash
node scripts/extract-colors.cjs --palette
node scripts/extract-colors.cjs <image-path>
```

### Brand Sync Workflow — **3단계 (이 스킬의 핵심 파이프라인)**
```bash
# 1. Edit docs/brand-guidelines.md (or use /brand update)
# 2. Sync to design tokens
node scripts/sync-brand-to-tokens.cjs
# 3. Verify
node scripts/inject-brand-context.cjs --json | head -20
```

동기화 대상 (원문):
- `docs/brand-guidelines.md` → **Source of truth**
- `assets/design-tokens.json` → Token definitions
- `assets/design-tokens.css` → CSS variables

→ **문서(사람이 읽는) → JSON(기계가 읽는) → CSS(브라우저가 읽는)의 3층 전파.** 4개 컬렉션에서 이 배관을 실제 스크립트로 구현한 유일한 사례.

### Routing — 서브커맨드 라우팅 (이 컬렉션 공통 패턴)
1. "Parse subcommand from `$ARGUMENTS` (first word)"
2. "Load corresponding `references/{subcommand}.md`"
3. "Execute with remaining arguments"

### `update` 서브커맨드 (references/update.md) — **AskUserQuestion 사용**
"This command systematically updates:
1. `docs/brand-guidelines.md` - Human-readable brand doc
2. `assets/design-tokens.json` - Token source of truth
3. `assets/design-tokens.css` - Generated CSS variables"

**Step 1: Gather Brand Input** — "Use `AskUserQuestion` to collect:"
- **Theme Selection**: 테마 이름 (예 "Ocean Professional", "Electric Creative", "Forest Calm")
- **Primary Color**: 색 이름 + hex (예 "Ocean Blue", `#3B82F6`)
- **Secondary Color**: 색 이름 + hex
- **Accent Color**: 색 이름 + hex
- **Brand Mood (for AI image generation)**: 무드 키워드 (예 "professional, trustworthy, premium" 또는 "bold, creative, energetic")

**Step 2**: `docs/brand-guidelines.md`의 Quick Reference 표 갱신 (색 이름 + hex)

→ **브랜드 무드를 "AI 이미지 생성용"으로 명시 수집**하는 점이 이 컬렉션의 스킬 간 연계를 보여준다.

**사용자 확인 요구 지점**: `update` 서브커맨드의 AskUserQuestion (테마/색 3종/무드). `banner-design`과 동일하게 **하네스의 구조화된 질문 도구를 명시**한다.

## 6. 디자인 지침 분석

SKILL.md 본문에는 디자인 지침이 **거의 없다.** 실질 지침은 11개 reference 파일에 있으며, 성격은 **"템플릿 + 체크리스트"**다.

### 강제 규칙 — 수치 인용

**컬러 시스템 구조 (`color-palette-management.md`)**
```
Primary Colors (1-2)
├── Main brand color - Used for CTAs, headers, key elements
└── Supporting primary - Secondary emphasis

Secondary Colors (2-3)
├── Accent colors - Highlights, interactive states
└── Supporting visuals - Icons, illustrations

Neutral Palette (3-5)
├── Background colors - Page, card, modal backgrounds
├── Text colors - Headings, body, muted text
└── UI elements - Borders, dividers, shadows

Semantic Colors (4)
├── Success - #22C55E (green)
├── Warning - #F59E0B (amber)
├── Error - #EF4444 (red)
└── Info - #3B82F6 (blue)
```
→ **개수 범위를 명시**(1-2 / 2-3 / 3-5 / 4)하고 **시맨틱 색은 hex 고정값 4개** 제공.

**컬러 문서화 형식 (원문)**
- 마크다운 표: `| Name | Hex | RGB | HSL | Usage |` — 예: `| Primary Blue | #2563EB | rgb(37,99,235) | hsl(217,91%,53%) | CTAs, links |`
- CSS 변수 예시:
  ```css
  --color-primary: #2563EB;  --color-primary-light: #3B82F6;  --color-primary-dark: #1D4ED8;
  --color-secondary: #8B5CF6;  --color-accent: #F59E0B;
  --color-background: #FFFFFF;  --color-surface: #F9FAFB;
  --color-text-primary: #111827;  --color-text-secondary: #6B7280;  --color-border: #E5E7EB;
  ```
- Tailwind config 형태도 제공

**타이포그래피 (`typography-specifications.md`)**
```css
--font-heading: 'Inter', system-ui, -apple-system, sans-serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Type Scale (Base System)**
- Base size: **16px (1rem)**
- Scale ratio: **1.25 (Major Third)**

| Element | Size (rem) | Size (px) | Weight | Line Height |
|---------|------------|-----------|--------|-------------|
| Display | 3.815rem | 61px | 700 | 1.1 |
| H1 | 3.052rem | 49px | 700 | 1.2 |
| H2 | 2.441rem | 39px | 600 | 1.25 |
| H3 | 1.953rem | 31px | 600 | 1.3 |
| H4 | 1.563rem | 25px | 600 | 1.35 |
| H5 | 1.25rem | 20px | 600 | 1.4 |

→ **모듈러 스케일 비율(1.25)에서 계산된 값을 rem/px 양쪽으로 제시하고 weight·line-height까지 지정.** 4개 컬렉션에서 타입 스케일을 수학적 비율로 정의한 유일한 사례.

**폰트 로딩 (원문)**
```html
<!-- Google Fonts (recommended) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Visual Identity 타이포 표 (`visual-identity.md`)**
| Usage | Font | Weight | Size |
|-------|------|--------|------|
| H1 | [Font] | Bold | 32-48px |
| H2 | [Font] | Semibold | 24-32px |
| Body | [Font] | Regular | 16-18px |
| Caption | [Font] | Regular | 12-14px |

**로고 규격 (`visual-identity.md`)**
- Primary: "Full logo (horizontal/stacked)"
- Secondary: "Abbreviated version"
- Icon/Mark: "Symbol only"
- **Clear space**: "Minimum padding around logo"
- **Minimum size**: "Smallest readable size"
→ 구체 수치는 `logo-usage-rules.md`(185줄)에 있을 것으로 보이나 이 발췌 범위에는 없음.

### 금지 규칙 (anti-pattern) — 원문 그대로

`visual-identity.md`의 "Incorrect Usage" (로고):
- "Don't stretch or distort"
- "Don't change colors (unless approved)"
- "Don't add effects"
- "Don't place on busy backgrounds"

→ **금지 목록이 4개뿐이다.** taste-skills가 수백 개를 열거하는 것과 극단적으로 대비되며, 이 컬렉션의 전략이 "금지가 아니라 템플릿·체크리스트"임을 보여준다.

### 항목별 지침

- **타이포그래피**: 3층 폰트 스택 + 1.25 비율 모듈러 스케일 6단(rem/px/weight/line-height) + 용도별 크기 범위. 기본 서체는 **`Inter`** (taste-skills가 금지하는 서체를 이 컬렉션은 기본값으로 제시 — §8 참조)
- **컬러**: 4층 구조(Primary 1-2 / Secondary 2-3 / Neutral 3-5 / Semantic 4) + 시맨틱 hex 고정 + 문서화 3형식(마크다운 표 / CSS 변수 / Tailwind config)
- **스페이싱**: SKILL.md·확인한 references에는 **없음** (같은 컬렉션의 `design-system`이 담당)
- **모션**: **원문에 지침 없음**
- **레이아웃**: **원문에 지침 없음**
- **접근성**: `consistency-checklist.md`에 "**Proper contrast for accessibility**" 1항목. 수치는 **원문에 명시 없음** (같은 컬렉션의 `banner-design`이 4.5:1을 명시하는 것과 대비)
- **보이스/메시징** (이 스킬 고유): `voice-framework.md`(88줄), `messaging-framework.md`(85줄). 일관성 체크리스트가 Tone / Language / Messaging 3영역을 다룸
- **자산 관리** (이 스킬 고유): `asset-organization.md`(157줄) + `validate-asset.cjs`가 "asset naming, size, format" 검증

### 지침을 주는 방식 자체

1. **얇은 진입점 + 두꺼운 참조 (index-first)**: SKILL.md 2.9KB에 지침이 거의 없고, 11개 표(References / Scripts / Templates / Subcommands)로 **어디를 읽을지만 안내**한다. 4개 컬렉션 중 가장 극단적인 점진 로딩 구조.
2. **단일 진실 소스 + 자동 전파**: `docs/brand-guidelines.md` → `design-tokens.json` → `design-tokens.css`. 사람이 편집하는 문서를 기계 소비 형식으로 내려보내는 파이프라인을 **실행 가능한 스크립트로** 구현.
3. **프롬프트 주입 (`inject-brand-context.cjs`)**: 브랜드 컨텍스트를 다른 스킬의 프롬프트에 주입하는 메커니즘. `banner-design`이 "**Brand: always inject via `inject-brand-context.cjs`**"로 이를 강제한다. **스킬 간 데이터 전달을 스크립트로 구현한 유일한 사례.**
4. **검증을 스크립트로 위임**: `validate-asset.cjs`(네이밍/크기/포맷), `extract-colors.cjs`(팔레트 대조). **판독 검증이 아니라 실행 검증.**
5. **템플릿 제공**: `brand-guidelines-starter.md` 275줄 — 신규 브랜드가 채워 넣을 완성 골격.
6. **체크리스트 2종**: `consistency-checklist.md`(94줄, Visual/Voice/Channel), `approval-checklist.md`(169줄). 체크박스 형식.
7. **AskUserQuestion 명시**: `update` 서브커맨드가 테마명·색 3종·무드를 구조화된 질문으로 수집.
8. **서브커맨드 라우팅 패턴**: `$ARGUMENTS` 첫 단어 → `references/{subcommand}.md` 로드. 이 컬렉션 5개 스킬이 공유하는 아키텍처.
9. **문서화 형식을 3중으로 제공**: 마크다운 표 / CSS 변수 / Tailwind config. 소비 대상(사람/CSS/Tailwind)별로.
10. **테스트 존재**: `scripts/tests/test_sync_brand_to_tokens.py`. **4개 컬렉션에서 스킬 스크립트에 테스트를 붙인 것은 이 컬렉션뿐이다.**
11. **페르소나 부여 없음**, **참조 브랜드·디자이너 없음**, **금지 목록 최소.**

### 모호한 감각어의 번역

이 스킬은 **감각어를 거의 쓰지 않는다.** 존재하는 것:

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**Brand Mood**" | AskUserQuestion으로 키워드 수집 — "professional, trustworthy, premium" / "bold, creative, energetic". 그리고 그 용도를 "**for AI image generation**"으로 명시 |
| 테마 이름 예시 | "Ocean Professional", "Electric Creative", "Forest Calm" — 감각을 **이름 + 색 3종 hex**로 환원 |
| "**Clear space**" | "Minimum padding around logo" (수치는 logo-usage-rules.md) |
| "**Minimum size**" | "Smallest readable size" |
| "**Matches brand style**" (이미지) | 체크리스트 항목 — 조작적 정의는 없음 |
| "**brand consistency**" | 94줄 체크리스트 (Visual: 로고·색·타이포·이미지 / Voice: 톤·언어·메시징 / Channel audit) |

## 7. 산출물

- **주 산출물 3개 (동기화 대상)**
  - `docs/brand-guidelines.md` — 사람이 읽는 브랜드 문서 (Source of truth)
  - `assets/design-tokens.json` — 토큰 정의
  - `assets/design-tokens.css` — CSS 변수
- **부수 산출물**: 자산 검증 결과, 색 추출/비교 결과, 프롬프트 주입용 브랜드 컨텍스트 (`--json` 옵션)
- **템플릿 기반 시작**: `templates/brand-guidelines-starter.md`
- **네이밍 규칙**: `validate-asset.cjs`가 "asset naming"을 검증하므로 규칙이 존재하지만, **SKILL.md 본문에는 명시 없음** (`asset-organization.md`에 있을 것으로 보임)

## 8. 주의점 / 한계

- **서브커맨드 3개 중 1개만 구현됨**: `argument-hint`가 `[update|review|create]`를 시사하지만 §Subcommands 표에는 **`update` 하나만** 정의되어 있고 `references/`에도 `update.md`만 있다. `review`·`create`를 호출하면 `references/review.md`·`references/create.md` 로드에 실패한다. **원문에 이 불일치에 대한 설명이 없다.**
- **`Inter`를 기본 서체로 제시**: `typography-specifications.md`가 `--font-heading: 'Inter'`와 `--font-body: 'Inter'`를 기본값으로 준다. 그런데 같은 저장소의 `taste-skills` 다수(`minimalist-ui`, `gpt-taste`, `high-end-visual-design`, `stitch-design-taste`, `design-taste-frontend`)가 **Inter를 명시적으로 금지**한다. 두 컬렉션을 함께 쓰면 판정이 정면으로 갈린다.
- **Google Fonts `<link>` 방식을 권장**: `typography-specifications.md`가 "`<!-- Google Fonts (recommended) -->`"로 `<link>` 로딩을 제시한다. `taste-skills/design-taste-frontend`는 "**Never link Google Fonts via `<link>` in production**"으로 이를 금지한다. 동일 저장소 내 상충.
- **파일 경로 관례에 강하게 의존**: 4개 스크립트 전부가 `docs/brand-guidelines.md`, `assets/design-tokens.json`, `assets/design-tokens.css`를 전제한다. 다른 구조의 프로젝트에서 경로를 어떻게 바꾸는지 **원문에 명시 없음.**
- **접근성 수치 부재**: 일관성 체크리스트의 "Proper contrast for accessibility"가 유일한 언급이며 WCAG 비율이 없다. 같은 컬렉션의 `banner-design`이 4.5:1을 명시하는 것과 불균형.
- **브랜드 창작 기능 없음**: 로고 컨셉 도출, 심볼 메타포, 브랜드 전략 수립을 다루지 않는다. `taste-skills/brandkit`이 그 영역을 다루지만 **상호 참조가 없고**, 산출물 형식도 다르다(그쪽은 이미지 보드, 이쪽은 문서+토큰).
- **`extract-colors.cjs`의 의존성 미명시**: 이미지에서 색을 추출하려면 이미지 파싱 라이브러리가 필요한데 **원문에 명시가 없다.** `package.json` 확인 절차도 없다.
- **모션·스페이싱·레이아웃 지침 부재**: 브랜드 스킬의 범위상 당연하지만, `design-system`(토큰), `ui-styling`(적용)과의 역할 분담이 SKILL.md에 **명시되지 않았다.** 4개 스킬(`brand`/`design-system`/`ui-styling`/`ui-ux-pro-max`)이 모두 토큰과 스타일을 다루므로 경계가 흐리다.
- **금지 규칙의 희박함**: 로고 4개 금지 외에는 없다. 브랜드 일관성을 체크리스트로 확인하는 방식이므로 "무엇이 브랜드를 망치는가"에 대한 구체적 안티패턴 카탈로그가 없다. `garden-skills/web-design-engineer`의 Asset Protocol("로고를 못 구하면 정지")이나 `taste-skills`의 팔레트 금지 목록 같은 방어가 이 스킬에는 없다.
- **강한 경고 지점**: 이 스킬에는 강한 경고문이 **거의 없다.** 유일하게 명령형인 것은 로고 "Don't" 4개. 이 컬렉션 전체가 명령보다 **파이프라인과 체크리스트**로 품질을 확보하는 전략이다.
- **검증 장치 (이 컬렉션의 강점)**: `validate-asset.cjs`(네이밍/크기/포맷 자동 검증) + `extract-colors.cjs`(팔레트 대조) + `sync-brand-to-tokens.cjs` + `--json` 검증 단계 + 2종 체크리스트(94줄, 169줄) + **스크립트 단위 테스트**(`test_sync_brand_to_tokens.py`). **4개 컬렉션 37개 스킬 중 실행 가능한 검증을 가장 많이 갖춘 스킬군이 이 컬렉션이며, 그 대표가 이 스킬이다.**
