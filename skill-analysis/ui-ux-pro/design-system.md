# design-system 분석

## 1. 개요

- **원본 경로**: `skills-collections/ui-ux-pro/design-system/`
- **핵심 파일**: `SKILL.md` (6,875 bytes)
- **보조 파일** (총 26개)
  - `references/` 7개: `token-architecture.md`, `primitive-tokens.md`, `semantic-tokens.md`, `component-tokens.md`, `component-specs.md`, `states-and-variants.md`, `tailwind-integration.md`
  - **`data/` 8개 CSV (슬라이드 의사결정 시스템)**: `slide-strategies.csv`, `slide-layouts.csv`, `slide-layout-logic.csv`, `slide-typography.csv`, `slide-color-logic.csv`, `slide-backgrounds.csv`, `slide-copy.csv`, `slide-charts.csv`
  - `scripts/` 9개: `generate-tokens.cjs`, `validate-tokens.cjs`, `embed-tokens.cjs`, `search-slides.py`, `slide_search_core.py`, `slide-token-validator.py`, `generate-slide.py`, `fetch-background.py`, `html-token-validator.py`, `tests/test_validate_tokens.py`
  - `templates/design-tokens-starter.json`
- **성격**: **두 기능이 한 스킬에 합쳐진 하이브리드**. (a) 3층 디자인 토큰 아키텍처 + 컴포넌트 스펙, (b) **CSV 기반 슬라이드 의사결정 시스템 + BM25 검색**. 원문도 이를 인지하고 "Token architecture, component specifications, **and slide generation**"으로 병기한다.

## 2. 활성화 조건 (언제 켜지는가)

frontmatter 원문:
```yaml
name: design-system
description: Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
argument-hint: "[component or token]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
```

**§When to Use (7개)**
- "Design token creation"
- "Component state definitions"
- "CSS variable systems"
- "Spacing/typography scales"
- "Design-to-code handoff"
- "Tailwind theme configuration"
- "**Slide/presentation generation**" (원문에서 굵게 강조)

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **디자인 토큰 시스템 수립** — 3층 구조(primitive → semantic → component)
- 하드코딩된 색·크기를 토큰으로 마이그레이션 — `validate-tokens.cjs --dir src/`가 자동 검출
- 컴포넌트 상태 정의 (default / hover / active / disabled)
- Tailwind 테마 설정 — `tailwind-integration.md`
- **브랜드 준수 프레젠테이션** — 8개 CSV + BM25 검색 + 토큰 검증기
- 슬라이드의 감정 아크·패턴 브레이킹을 계산으로 결정할 때 (Duarte Sparkline)

**부적합 / 과한 상황**
- 토큰 체계가 필요 없는 일회성 작업
- `docs/brand-guidelines.md` + `assets/design-tokens.json` 관례를 따르지 않는 프로젝트
- Node.js / Python 3가 없는 환경
- 이미지 배경이 필요한데 Pexels/Unsplash 키가 없는 경우 (`fetch-background.py`)

**형제 스킬 대신 이걸 고르는 기준**
- 브랜드 문서 → 토큰 전파: `brand`
- 토큰 아키텍처 설계·검증: **이 스킬**
- 토큰 → Tailwind/shadcn 적용: `ui-styling`
- 슬라이드: **이 스킬(CSV+스크립트)** vs `slides`(마크다운 참조) vs `design`(마크다운 참조) — **3중 중복** (§8 참조)

원문이 명시한 통합 관계:
> "**With brand:** Extract primitives from brand colors/typography
> **With ui-styling:** Component tokens → Tailwind config
> **Skill Dependencies:** brand, ui-styling
> **Primary Agents:** ui-ux-designer, frontend-developer"

→ **스킬 의존과 담당 에이전트를 명시한 유일한 스킬** (4개 컬렉션 전체에서).

## 4. 외부 의존성

- **API 키**
  - **토큰 기능**: **불필요**
  - **`fetch-background.py`**: "Fetch images from **Pexels/Unsplash**" → 두 서비스의 API 키가 필요할 것으로 보이나 **환경변수 이름이 SKILL.md에 명시되지 않았다.** grep 결과 이 스킬 스크립트에 API 키 참조가 없어(`GOOGLE_FONTS_API_KEY`는 `ui-ux-pro-max`의 테스트에만 등장), 키 처리 방식이 불명확하다
  - 키 없을 때의 폴백: **원문에 명시 없음**
- **필요한 CLI/런타임/패키지**
  - **Node.js** — `generate-tokens.cjs`, `validate-tokens.cjs`, `embed-tokens.cjs`
  - **Python 3** — `search-slides.py`, `slide-token-validator.py`, `generate-slide.py`, `fetch-background.py`, `html-token-validator.py`
  - **BM25 구현** — `slide_search_core.py`가 자체 구현인지 외부 라이브러리(rank_bm25 등)인지 **원문에 명시 없음**
  - **Chart.js 4.4.1 (CDN)**
- **파일 경로 전제 (Source of Truth 4개)**
  | File | Purpose |
  |------|---------|
  | `docs/brand-guidelines.md` | Brand identity, voice, colors |
  | `assets/design-tokens.json` | Token definitions (primitive→semantic→component) |
  | `assets/design-tokens.css` | CSS variables (import in slides) |
  | `assets/css/slide-animations.css` | CSS animation library |
- **네트워크**: Chart.js CDN, Pexels/Unsplash 이미지
- **비용 발생 지점**: Pexels/Unsplash API (무료 티어 존재). 유료 LLM API는 없음.

## 5. 워크플로우

### 기능 A — 토큰 시스템

**3층 구조 (원문)**
```
Primitive (raw values)
       ↓
Semantic (purpose aliases)
       ↓
Component (component-specific)
```
```css
/* Primitive */
--color-blue-600: #2563EB;
/* Semantic */
--color-primary: var(--color-blue-600);
/* Component */
--button-bg: var(--color-primary);
```

**Quick Start 2개 명령**
```bash
node scripts/generate-tokens.cjs --config tokens.json -o tokens.css
node scripts/validate-tokens.cjs --dir src/
```

**Component Spec Pattern (원문 표)**
| Property | Default | Hover | Active | Disabled |
|----------|---------|-------|--------|----------|
| Background | primary | primary-dark | primary-darker | muted |
| Text | white | white | white | muted-fg |
| Border | none | none | none | muted-border |
| Shadow | sm | md | none | none |

### 기능 B — 슬라이드 시스템 (**이 스킬의 고유 자산**)

**8개 CSV 의사결정 데이터베이스 (원문 표)**
| File | Purpose |
|------|---------|
| `data/slide-strategies.csv` | **15 deck structures + emotion arcs + sparkline beats** |
| `data/slide-layouts.csv` | **25 layouts + component variants + animations** |
| `data/slide-layout-logic.csv` | **Goal → Layout + break_pattern flag** |
| `data/slide-typography.csv` | **Content type → Typography scale** |
| `data/slide-color-logic.csv` | **Emotion → Color treatment** |
| `data/slide-backgrounds.csv` | **Slide type → Image category (Pexels/Unsplash)** |
| `data/slide-copy.csv` | **25 copywriting formulas (PAS, AIDA, FAB)** |
| `data/slide-charts.csv` | **25 chart types with Chart.js config** |

**CSV 실제 스키마 (`slide-strategies.csv` 헤더)**
```
id,strategy_name,keywords,slide_count,structure,goal,audience,tone,narrative_arc,key_metrics,sources,emotion_arc,sparkline_beats
```
행 예시 (YC Seed Deck):
```
1,YC Seed Deck,"yc, seed, startup, investor, funding, vc, venture","10-12",
"1.Title 2.Problem 3.Solution 4.Traction 5.Market 6.Product 7.Business Model 8.Team 9.Financials 10.Ask",
Raise seed funding from VCs, Seed investors hunting asymmetric upside,
Clear concise focused narrative, Problem→Solution→Evidence→Ask,
MRR ARR growth rate user count, Y Combinator Library,
"curiosity→frustration→hope→confidence→trust→urgency",
"hook|what-is|what-could-be|proof|proof|what-could-be|proof|trust|what-could-be|action"
```
→ **`sparkline_beats` 열이 슬라이드별 서사 박자를 파이프 구분으로 지정한다.** 그리고 `sources` 열에 출처("Y Combinator Library", "Guy Kawasaki Blog")를 기록.

**`slide-color-logic.csv` 스키마**
```
emotion,background,text_color,accent_usage,use_full_bleed,gradient,card_style
frustration,dark-surface,foreground,minimal,false,none,subtle-border
hope,accent-bleed,dark,none,true,none,none
```
→ **감정 → 색 처리를 표로 결정.** `frustration`은 다크 표면 + 최소 액센트 + 미묘한 테두리, `hope`는 액센트 블리드 + 전면 사용. 4개 컬렉션에서 **감정을 색 파라미터로 매핑한 유일한 사례.**

**BM25 검색 (원문 명령)**
```bash
# Basic search (auto-detect domain)
python scripts/search-slides.py "investor pitch"

# Domain-specific search
python scripts/search-slides.py "problem agitation" -d copy
python scripts/search-slides.py "revenue growth" -d chart

# Contextual search (Premium System)
python scripts/search-slides.py "problem slide" --context --position 2 --total 9
python scripts/search-slides.py "cta" --context --position 9 --prev-emotion frustration
```
→ **슬라이드 위치(`--position`/`--total`)와 이전 감정(`--prev-emotion`)을 검색 파라미터로 받는다.** 즉 문맥 인식 추천.

**Contextual Decision Flow (원문)**
```
1. Parse goal/context
        ↓
2. Search slide-strategies.csv → Get strategy + emotion beats
        ↓
3. For each slide:
   a. Query slide-layout-logic.csv → layout + break_pattern
   b. Query slide-typography.csv → type scale
   c. Query slide-color-logic.csv → color treatment
   d. Query slide-backgrounds.csv → image if needed
   e. Apply animation class from slide-animations.css
        ↓
4. Generate HTML with design tokens
        ↓
5. Validate with slide-token-validator.py
```
→ **5단계이며 마지막이 스크립트 검증.** 4개 컬렉션에서 슬라이드 생성에 실행 가능한 검증을 붙인 유일한 사례.

**Pattern Breaking (Duarte Sparkline) — 원문**
> "Premium decks alternate between emotions for engagement:
> ```
> \"What Is\" (frustration) ↔ \"What Could Be\" (hope)
> ```
> System calculates pattern breaks at **1/3 and 2/3 positions**."

→ 감정 전환 지점을 **수치로 계산**(1/3, 2/3). Nancy Duarte의 Sparkline 방법론을 알고리즘화한 것.

**사용자 확인 요구 지점**: **없음.** `banner-design`/`brand`가 AskUserQuestion을 쓰는 것과 달리 이 스킬은 질문 절차가 없다.

## 6. 디자인 지침 분석

### 강제 규칙 — 수치 인용

**Primitive Tokens (`primitive-tokens.md`)** — Tailwind 계열 스케일

*Gray Scale (11단)*
```css
--color-gray-50:  #F9FAFB;   --color-gray-100: #F3F4F6;   --color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;   --color-gray-400: #9CA3AF;   --color-gray-500: #6B7280;
--color-gray-600: #4B5563;   --color-gray-700: #374151;   --color-gray-800: #1F2937;
--color-gray-900: #111827;   --color-gray-950: #030712;
```

*Primary Blue (10단)*
```css
--color-blue-50:  #EFF6FF;   --color-blue-100: #DBEAFE;   --color-blue-200: #BFDBFE;
--color-blue-300: #93C5FD;   --color-blue-400: #60A5FA;   --color-blue-500: #3B82F6;
--color-blue-600: #2563EB;   --color-blue-700: #1D4ED8;   --color-blue-800: #1E40AF;
--color-blue-900: #1E3A8A;
```

*Status Colors*
```css
--color-green-500: #22C55E;  --color-green-600: #16A34A;   /* Success */
--color-yellow-500: #EAB308; --color-yellow-600: #CA8A04;  /* Warning */
--color-red-500: #EF4444;    --color-red-600: #DC2626;     /* Error */
--color-info: var(--color-blue-500);                        /* Info */
```

**Semantic Tokens (`semantic-tokens.md`)**
```css
--color-background: var(--color-gray-50);
--color-foreground: var(--color-gray-900);
--color-card: white;
--color-card-foreground: var(--color-gray-900);
--color-popover: white;
--color-popover-foreground: var(--color-gray-900);
--color-primary: var(--color-blue-600);
--color-primary-hover: var(--color-blue-700);
```
→ shadcn/ui의 시맨틱 토큰 명명 규약(`background`/`foreground`/`card`/`popover`/`primary`)을 따른다.

**Chart.js 예시 (원문 전문)**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<canvas id="revenueChart"></canvas>
<script>
new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            data: [5, 12, 28, 45],
            borderColor: '#FF6B6B',  // Use brand coral
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true,
            tension: 0.4
        }]
    }
});
</script>
```

**패턴 브레이킹 위치**: **1/3 및 2/3**

**CSV 규모**: 15 전략 / 25 레이아웃 / 25 카피 공식 / 25 차트 타입

### 금지 규칙 (anti-pattern) — 원문 그대로

**Token Compliance (원문 CORRECT/WRONG 대조)**
```css
/* CORRECT - uses token */
background: var(--slide-bg);
color: var(--color-primary);
font-family: var(--typography-font-heading);

/* WRONG - hardcoded */
background: #0D0D0D;
color: #FF6B6B;
font-family: 'Space Grotesk';
```

**Best Practices (6항목, 원문)**
1. "**Never use raw hex in components** - always reference tokens"
2. "Semantic layer enables theme switching (light/dark)"
3. "Component tokens enable per-component customization"
4. "Use **HSL format** for opacity control"
5. "Document every token's purpose"
6. "**Slides must import design-tokens.css and use `var()` exclusively**"

**Slide Requirements — "ALL slides MUST" (6항목, 원문)**
1. "Import `assets/design-tokens.css` - single source of truth"
2. "Use CSS variables: `var(--color-primary)`, `var(--slide-bg)`, etc."
3. "**Use Chart.js for charts (NOT CSS-only bars)**"
4. "Include navigation (keyboard arrows, click, progress bar)"
5. "Center align content"
6. "Focus on persuasion/conversion"

→ **금지가 "하드코딩 금지" 하나로 수렴한다.** taste-skills의 수백 개 미학 금지와 달리, 이 스킬의 금지는 **토큰 규율 위반**에 집중되며 **스크립트로 검출 가능**하다 (`validate-tokens.cjs`, `slide-token-validator.py`, `html-token-validator.py`).

### 항목별 지침

- **타이포그래피**: `--typography-font-heading` 토큰 참조. 실제 스케일은 `primitive-tokens.md`의 나머지와 `slide-typography.csv`("Content type → Typography scale")에 있음. 서체명 지정은 SKILL.md에 **없음**
- **컬러**: 3층 토큰 + Gray 11단 + Blue 10단 + Status 4종. **hex 값이 전부 명시된 유일한 컬렉션의 스킬 중 하나** (`brand`와 함께). HSL 포맷 권장(투명도 제어)
- **스페이싱**: "Spacing/typography scales"가 When to Use에 있으나 SKILL.md 본문에 값이 **없음**. `primitive-tokens.md`의 확인하지 않은 부분에 있을 것으로 보임
- **모션**: `assets/css/slide-animations.css`를 애니메이션 라이브러리로 지정. 클래스명·값은 SKILL.md에 **없음**. `prefers-reduced-motion`은 **없음**
- **레이아웃**: 슬라이드 25개 레이아웃(CSV), 컴포넌트 스펙 4상태
- **접근성**: 슬라이드 요구사항 4번 "Include navigation (**keyboard arrows**, click, progress bar)"가 유일한 접근성 인접 항목. 대비 비율·ARIA·`prefers-reduced-motion`은 **원문에 없음**
- **컴포넌트 상태**: default / hover / active / disabled 4열 스펙 패턴 + `states-and-variants.md`
- **데이터 시각화**: Chart.js 필수(CSS 전용 바 금지), 25개 차트 타입 CSV

### 지침을 주는 방식 자체

1. **3층 토큰 아키텍처를 지침의 골격으로**: primitive → semantic → component. 각 층에 전용 reference 파일. 미학이 아니라 **참조 관계**로 일관성을 확보.
2. **CSV를 의사결정 데이터베이스로**: 8개 CSV가 goal/emotion/content type/slide type을 입력으로 받아 layout/color/typography/background/copy/chart를 출력한다. **지식을 구조화된 데이터로 만든 유일한 사례** (마크다운 서술이 아니라 조회 가능한 테이블).
3. **BM25 검색 + 문맥 파라미터**: `--position`, `--total`, `--prev-emotion`. 즉 **슬라이드의 위치와 직전 감정에 따라 추천이 달라진다.**
4. **감정을 계산 대상으로**: `emotion_arc`, `sparkline_beats`, `slide-color-logic.csv`(emotion → color), 패턴 브레이크 1/3·2/3. Nancy Duarte의 방법론을 알고리즘화.
5. **출처를 데이터에 기록**: CSV의 `sources` 열에 "Y Combinator Library", "Guy Kawasaki Blog". **지침의 근거를 데이터 필드로 남긴 유일한 사례.**
6. **CORRECT/WRONG 코드 대조**: 토큰 준수를 코드 예시 쌍으로.
7. **"ALL slides MUST" 6항목**: 예외 없는 요구사항.
8. **검증을 스크립트로 위임 (3개)**: `validate-tokens.cjs`(하드코딩 검출), `slide-token-validator.py`(슬라이드 HTML 토큰 준수), `html-token-validator.py`. **4개 컬렉션에서 검증 스크립트가 가장 많은 스킬.**
9. **스킬 의존과 담당 에이전트 명시**: "Skill Dependencies: brand, ui-styling / Primary Agents: ui-ux-designer, frontend-developer". 오케스트레이션 관계를 문서화.
10. **참조 구현 지목**: "`assets/designs/slides/claudekit-pitch-251223.html`" — 모든 기능이 들어간 작동 예시.
11. **슬래시 커맨드 형태 제시**: `/slides:create "10-slide investor pitch for ClaudeKit Marketing"`
12. **실명 방법론 참조**: Y Combinator, Guy Kawasaki, Nancy Duarte (Sparkline).
13. **페르소나 부여 없음**, **미학 금지 목록 없음.**

### 모호한 감각어의 번역

이 스킬은 **감각어를 데이터로 환원한다.** 이 컬렉션의 특징이 가장 잘 드러나는 지점:

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**frustration**" (감정) | `slide-color-logic.csv`: background=`dark-surface`, text=`foreground`, accent=`minimal`, full_bleed=`false`, gradient=`none`, card=`subtle-border` |
| "**hope**" (감정) | background=`accent-bleed`, text=`dark`, accent=`none`, full_bleed=**`true`**, gradient=`none`, card=`none` |
| "**emotion arc**" | `curiosity→frustration→hope→confidence→trust→urgency` (문자열 필드) |
| "**sparkline beats**" | `hook\|what-is\|what-could-be\|proof\|proof\|what-could-be\|proof\|trust\|what-could-be\|action` (슬라이드별 박자) |
| "**Premium decks alternate between emotions**" | 패턴 브레이크를 **1/3, 2/3 위치**에서 계산 |
| "**persuasion/conversion**" | 15개 전략의 goal/audience/tone + 25개 카피 공식 |
| "**brand-compliant**" | `design-tokens.css` import + `var()` 전용 + 3개 검증 스크립트 |
| "**Clear concise focused narrative**" (톤) | CSV의 `tone` 열 값 — 자연어를 데이터 필드로 |
| "**Seed investors hunting asymmetric upside**" (청중) | CSV의 `audience` 열 — 청중 서술을 데이터로 |

## 7. 산출물

- **토큰 산출물**: `tokens.css` (`generate-tokens.cjs --config tokens.json -o tokens.css`), `assets/design-tokens.json`, `assets/design-tokens.css`
- **슬라이드 산출물**: HTML 프레젠테이션 (design-tokens.css import + Chart.js + 내비게이션 + 애니메이션 클래스)
- **검증 산출물**: `validate-tokens.cjs`(하드코딩 목록), `slide-token-validator.py`(토큰 준수), `html-token-validator.py`
- **템플릿**: `templates/design-tokens-starter.json` — "Starter JSON with three-layer structure"
- **참조 구현**: `assets/designs/slides/claudekit-pitch-251223.html`
- **파일 네이밍**: 참조 구현이 `{project}-{type}-{YYMMDD}.html` 형태를 시사하나 **규칙으로 명시되지 않음**

## 8. 주의점 / 한계

- **두 기능이 한 스킬에 합쳐진 구조**: 토큰 아키텍처와 슬라이드 생성은 별개 관심사다. `argument-hint`가 `[component or token]`인데 실제로는 슬라이드도 처리하며, 슬라이드 진입은 `/slides:create` 커맨드로 이루어진다(즉 `slides` 스킬 경유). **스킬 경계가 흐리다.**
- **슬라이드 기능의 3중 중복 (이 컬렉션의 가장 큰 구조적 문제)**
  - `design-system/data/*.csv` (8개) + 스크립트 5개 — **가장 발전한 구현** (검색·생성·검증)
  - `slides/references/*.md` (5개) — 마크다운 서술
  - `design/references/slides*.md` (6개) — 마크다운 서술, 접두사만 다름
  → 같은 지식(15 전략, 25 레이아웃, 25 카피 공식)이 **CSV 1곳 + 마크다운 2곳**에 존재한다. 어느 것이 정본인지, 갱신 시 동기화 방법이 **원문에 없다.** `slides` 스킬은 CSV·검증 스크립트를 언급조차 하지 않는다.
- **Pexels/Unsplash 키 처리 미명시**: `fetch-background.py`가 두 서비스에서 이미지를 가져온다고 하는데, 필요한 환경변수 이름·발급 방법·키 없을 때의 동작이 **모두 원문에 없다.** grep 결과 스크립트에서 API 키 참조가 발견되지 않아, 키 없이 동작하는지도 불명확하다.
- **BM25 구현 의존성 미명시**: `slide_search_core.py`가 자체 구현인지 외부 패키지인지, `requirements.txt`가 있는지 **원문에 없다.** (`ui-styling`에는 `scripts/requirements.txt`가 있으나 이 스킬에는 없다)
- **접근성 지침 부재**: 슬라이드 요구사항의 "keyboard arrows"가 유일하다. 3층 토큰 시스템을 갖추면서 **대비 비율 검증 토큰이나 규칙이 없다.** `validate-tokens.cjs`는 하드코딩만 검출하고 대비는 보지 않는다. `prefers-reduced-motion`도 없다.
- **스페이싱 스케일이 SKILL.md에 없다**: When to Use에 "Spacing/typography scales"가 있는데 본문에 값이 없고 `primitive-tokens.md`에 위임된다. 컬러는 hex를 본문에 노출하는데 스페이싱은 안 하는 비대칭.
- **`Space Grotesk`를 WRONG 예시로 사용**: 토큰 준수 예시에서 `font-family: 'Space Grotesk'`를 하드코딩의 나쁜 예로 든다. 이는 폰트 자체를 금지하는 것이 아니라 하드코딩을 금지하는 것이지만, 읽는 사람이 오해할 여지가 있다.
- **Chart.js 버전 고정**: `4.4.1` CDN. 갱신 절차 **없음** (`slides` 스킬과 동일한 문제).
- **참조 구현 파일의 존재 불확실**: `assets/designs/slides/claudekit-pitch-251223.html`은 사용자 프로젝트 경로이며 이 스킬 폴더에 없다. 즉 **"Working example with all features"가 실제로 없을 수 있다.**
- **감정 → 색 매핑의 근거 부재**: `slide-color-logic.csv`가 `frustration → dark-surface`, `hope → accent-bleed`로 매핑하지만 **이 매핑의 근거가 원문에 없다.** Duarte 방법론을 인용하지만 색 처리까지 그 방법론에서 온 것인지 불명확하다.
- **미학 금지 목록 부재**: 토큰 규율은 강하지만 "AI가 만든 것 같은 슬라이드"를 막는 장치가 없다. taste-skills의 안티슬롭 카탈로그 같은 방어가 없어, 토큰을 지키면서도 진부한 결과가 나올 수 있다.
- **강한 경고 지점**
  - "**Never use raw hex in components** - always reference tokens"
  - "**Slides must import design-tokens.css and use `var()` exclusively**"
  - "**ALL slides MUST**" (6항목)
  - "**Use Chart.js for charts (NOT CSS-only bars)**"
- **검증 장치 (4개 컬렉션 최고 수준의 실행 검증)**: `validate-tokens.cjs`(소스 전체 하드코딩 스캔) + `slide-token-validator.py` + `html-token-validator.py` + `tests/test_validate_tokens.py`(**스크립트 자체의 단위 테스트**) + Contextual Decision Flow의 5단계 마지막이 검증. **판독이 아니라 실행으로 검증하는 유일한 컬렉션의 대표 스킬.** 다만 검증 대상이 **토큰 준수에 한정**되며 시각 품질·접근성·대비는 검증하지 않는다.
