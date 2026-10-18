# slides 분석

## 1. 개요

- **원본 경로**: `skills-collections/ui-ux-pro/slides/`
- **핵심 파일**: `SKILL.md` (1,137 bytes) — **4개 컬렉션 37개 스킬 중 가장 작은 SKILL.md**
- **보조 파일** (총 5개, 614줄 — 실질 내용 전부):
  - `references/create.md` (**4줄**) — 서브커맨드 진입점
  - `references/html-template.md` (295줄) — 완전한 HTML 슬라이드 골격 + Chart.js 통합
  - `references/layout-patterns.md` (137줄) — **25개 슬라이드 레이아웃** + CSS 구조 + 애니메이션 클래스
  - `references/copywriting-formulas.md` (84줄) — **25개 설득 카피 공식**
  - `references/slide-strategies.md` (94줄) — **15개 검증된 덱 구조** + 감정 아크
- **성격**: **전략 기반 HTML 프레젠테이션 생성 스킬**. 미학보다 **설득 구조(덱 전략) + 카피 공식 + 레이아웃 카탈로그**의 조합. 산출물은 Chart.js를 포함한 단일 HTML.

원문 자기 규정: "Strategic HTML presentation design with data visualization."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter 원문:
```yaml
name: slides
description: Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
argument-hint: "[topic] [slide-count]"
metadata:
  author: claudekit
  version: "1.0.0"
```

`argument-hint`: `[topic] [slide-count]` — 주제와 슬라이드 수를 인자로.

**§When to Use (4개)**
- "Marketing presentations and pitch decks"
- "Data-driven slides with Chart.js"
- "Strategic slide design with layout patterns"
- "Copywriting-optimized presentation content"

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **투자 유치 덱 / 세일즈 피치 / QBR / 보드 미팅** — 15개 전략 중 해당 구조를 조회
- 데이터가 있는 슬라이드 — Chart.js 통합이 템플릿에 내장
- 설득 카피가 중요한 슬라이드 — 25개 공식(PAS, AIDA, FAB, Cost of Inaction, Before-After-Bridge 등)
- 브랜드 토큰이 이미 있는 프로젝트 — `embed-tokens.cjs` 출력을 템플릿에 삽입
- 웹으로 공유·발표할 프레젠테이션 (PPT/Keynote가 아니라 HTML)

**부적합 / 과한 상황**
- PPT/PPTX 파일이 필요할 때 — 산출물은 HTML
- 시각적 실험이 목적인 프레젠테이션 — 이 스킬은 25개 정형 레이아웃 카탈로그 방식
- Chart.js CDN 접근이 불가한 환경
- 슬라이드 1~2장 — 전략·공식 조회의 이득이 없다
- 인쇄용 슬라이드 — 반응형 16:9 뷰포트 전제

**형제 스킬 대신 이걸 고르는 기준**: 같은 컬렉션의 `design` 스킬이 `references/slides.md`, `slides-create.md`, `slides-html-template.md`, `slides-layout-patterns.md`, `slides-strategies.md`, `slides-copywriting-formulas.md`를 **모두 중복 보유**하고, `design-system`이 `data/slide-*.csv` 8개와 `generate-slide.py`, `search-slides.py`를 보유한다. 즉 **슬라이드 기능이 이 컬렉션 3개 스킬에 분산 중복**되어 있다 (§8 참조).

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: **원문에 명시 없음.**
- **필요한 CLI/런타임/패키지**
  - **Chart.js 4.4.1 (CDN)** — `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`
  - **`embed-tokens.cjs`** — "Paste embed-tokens.cjs output here" (템플릿 주석). 이 스크립트는 **`design-system/scripts/embed-tokens.cjs`에 있으며 이 스킬 폴더에는 없다**
  - 브라우저 (HTML 실행)
- **네트워크**: Chart.js CDN, 폰트 로딩
- **비용 발생 지점**: 없음.
- **스킬 간 의존**: `design-system`의 `embed-tokens.cjs` (토큰 삽입). SKILL.md 본문에는 이 의존이 **명시되지 않았다** — html-template.md의 주석에만 등장.

## 5. 워크플로우

### SKILL.md 전체 구조 (1,137 bytes)
1. **§When to Use** (4항목)
2. **§Subcommands** — `create` 하나
3. **§References (Knowledge Base)** — 4개 파일 표
4. **§Routing** — 3단계

### Routing (이 컬렉션 공통 패턴)
1. "Parse subcommand from `$ARGUMENTS` (first word)"
2. "Load corresponding `references/{subcommand}.md`"
3. "Execute with remaining arguments"

### `create` 서브커맨드 (`references/create.md`, 4줄 전문)
> "Invoke `slides` skill to create persuasive HTML slides using **design tokens, Chart.js, and the slide knowledge database**.
>
> ## Task
> \<task\>$ARGUMENTS\</task\>"

→ **4줄뿐이다.** 실제 절차가 규정되어 있지 않고, "지식 데이터베이스를 써서 설득력 있는 슬라이드를 만들라"는 지시와 인자 전달만 있다. 순서·게이트·검증이 **원문에 없다.**

### 실질 워크플로우 (references에서 재구성)
SKILL.md에 절차가 없으므로, 4개 참조 파일의 사용 순서를 추론하면:
1. **전략 선택** (`slide-strategies.md`) — 15개 중 목적·청중에 맞는 덱 구조 + 슬라이드 수 + 감정 아크
2. **레이아웃 배정** (`layout-patterns.md`) — 슬라이드별로 25개 레이아웃 중 선택 + 애니메이션 클래스
3. **카피 작성** (`copywriting-formulas.md`) — 슬라이드 역할별로 25개 공식 중 적용
4. **HTML 조립** (`html-template.md`) — 토큰 삽입 + Chart.js + 16:9 컨테이너 + 내비게이션

**사용자 확인 요구 지점**: **없음.** `banner-design`·`brand`가 AskUserQuestion을 명시하는 것과 달리 이 스킬에는 질문 절차가 없다.

## 6. 디자인 지침 분석

### 15개 덱 전략 (`slide-strategies.md`) — **이 스킬의 고유 자산**

"15 proven deck structures with emotion arcs."

| Strategy | Slides | Goal | Audience |
|----------|--------|------|----------|
| YC Seed Deck | 10-12 | Raise seed funding | VCs |
| Guy Kawasaki | 10 | Pitch in 20 min | Investors |
| Series A | 12-15 | Raise Series A | Growth VCs |
| Product Demo | 5-8 | Demonstrate value | Prospects |
| Sales Pitch | 7-10 | Close deal | Qualified leads |
| Nancy Duarte Sparkline | Varies | Transform perspective | Any |
| Problem-Solution-Benefit | 3-5 | Quick persuasion | Time-pressed |
| QBR | 10-15 | Update stakeholders | Leadership |
| Team All-Hands | 8-12 | Align team | Employees |
| Conference Talk | 15-25 | Thought leadership | Attendees |
| Workshop | 20-40 | Teach skills | Learners |
| Case Study | 8-12 | Prove value | Prospects |
| Competitive Analysis | 6-10 | Strategic decisions | Internal |
| Board Meeting | 15-20 | Update board | Directors |
| Webinar | 20-30 | Generate leads | Registrants |

**구조 + 감정 아크 예시 (YC Seed Deck, 원문)**
```
1. Title/Hook  2. Problem  3. Solution  4. Traction  5. Market
6. Product  7. Business Model  8. Team  9. Financials  10. The Ask

Emotion arc: curiosity→frustration→hope→confidence→trust→urgency
```

→ **감정 아크를 명시한 유일한 스킬** (4개 컬렉션 전체에서). 슬라이드 순서를 미학이 아니라 **설득 심리의 진행**으로 규정한다. 실명 참조: **Guy Kawasaki**, **Nancy Duarte** (Sparkline), **YC**.

### 25개 레이아웃 패턴 (`layout-patterns.md`)

"25 slide layouts with CSS structures and animation classes."

| Layout | Use Case | Animation |
|--------|----------|-----------|
| Title Slide | Opening/first impression | `animate-fade-up` |
| Problem Statement | Establish pain point | `animate-stagger` |
| Solution Overview | Introduce solution | `animate-scale` |
| Feature Grid | Show capabilities (**3-6 cards**) | `animate-stagger` |
| Metrics Dashboard | Display KPIs (**3-4 metrics**) | `animate-stagger-scale` |
| Comparison Table | Compare options | `animate-fade-up` |
| Timeline Flow | Show progression | `animate-stagger` |
| Team Grid | Introduce people | `animate-stagger` |
| Quote Testimonial | Customer endorsement | `animate-fade-up` |
| Two Column Split | Compare/contrast | `animate-fade-up` |
| Big Number Hero | Single powerful metric | `animate-count` |
| Product Screenshot | Show product UI | `animate-scale` |
| Pricing Cards | Present tiers | `animate-stagger` |
| CTA Closing | Drive action | `animate-pulse` |

→ **레이아웃 → 용도 → 애니메이션 클래스**의 3열 매핑. 즉 모션이 레이아웃에 **미리 배정**되어 있어 판단이 필요 없다. CSS 구조도 함께 제공:
```css
.slide-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
```

### 25개 카피라이팅 공식 (`copywriting-formulas.md`) — **템플릿 문장 제공**

"25 formulas for persuasive slide copy." 각 공식이 **Use / Components / Template** 3요소로 제시된다:

- **PAS (Problem-Agitate-Solution)**
  - Use: "Problem slides, pain points"
  - Components: "Problem → Agitate → Solution"
  - Template: "**\"[Pain point]? Every [time frame], [consequence]. [Solution] fixes this.\"**"
- **AIDA (Attention-Interest-Desire-Action)**
  - Use: "CTAs, closing slides"
  - Template: "**\"[Bold statement]. [Benefit detail]. [Social proof]. [CTA].\"**"
- **FAB (Features-Advantages-Benefits)**
  - Use: "Feature slides, product showcases"
  - Template: "**\"[Feature] lets you [advantage], so you can [benefit].\"**"
- **Cost of Inaction**
  - Use: "Agitation slides, urgency"
  - Components: "Status Quo → Loss → Time Decay"
  - Template: "**\"Without [solution], you're losing [amount] every [timeframe].\"**"
- **Before-After-Bridge**
  - Use: "Transformation slides, case studies"
  - Template: "**\"[Pain point before]. [Desired state after]. [Your solution] is the bridge.\"**"

→ **채워 넣을 슬롯이 있는 문장 템플릿을 제공한 유일한 스킬.** 4개 컬렉션의 다른 스킬들이 "AI 카피 클리셰를 금지"하는 데 그치는 반면, 이 스킬은 **대체할 구조를 준다.**

### 강제 규칙 — 수치 인용

**HTML 템플릿 (`html-template.md`)**
- Chart.js 버전: **4.4.1** (CDN 고정)
- 토큰 예시: `--color-primary: #FF6B6B; --color-background: #0D0D0D;`
- 폰트: `var(--typography-font-body, 'Inter', sans-serif)`
- 리셋: `* { margin: 0; padding: 0; box-sizing: border-box; }`
- 본문: `background: var(--color-background); color: #fff; overflow: hidden;`
- **16:9 종횡비 고정 (데스크톱)**:
  ```css
  @media (min-width: 769px) {
      .slide-deck {
          /* Lock to 16:9 — letterbox if viewport ratio differs */
          max-width: calc(100vh * 16 / 9);
          max-height: calc(100vw * 9 / 16);
          margin: auto;
          position: absolute;
          inset: 0;
      }
  }
  ```
- 브레이크포인트: **769px** (데스크톱 기준)

**레이아웃 개수 제약**
- Feature Grid: **3-6 cards**
- Metrics Dashboard: **3-4 metrics**

**덱 길이**: 전략별 슬라이드 수 (3-5 ~ 20-40)

### 애니메이션 클래스 (7종)
`animate-fade-up` / `animate-stagger` / `animate-scale` / `animate-stagger-scale` / `animate-count` / `animate-pulse`
→ 클래스 이름만 제시되고 **duration·easing 값은 확인한 발췌 범위에 없음** (`html-template.md` 나머지에 있을 가능성).

### 금지 규칙 (anti-pattern)

**이 스킬에는 금지 규칙이 없다.** 확인한 4개 참조 파일과 SKILL.md 전체에 "Do not", "Never", "Avoid", "Banned" 형태의 규칙이 등장하지 않는다. 4개 컬렉션에서 **금지 목록이 완전히 부재한 유일한 스킬**이다.

### 항목별 지침

- **타이포그래피**: `var(--typography-font-body, 'Inter', sans-serif)` — 토큰 우선, 폴백 Inter. 크기 스케일은 **원문(확인 범위)에 없음**
- **컬러**: 토큰 변수(`--color-primary`, `--color-background`) + 예시값 `#FF6B6B`/`#0D0D0D`. 팔레트 지침은 **없음** (브랜드/토큰에서 주입)
- **스페이싱**: **원문에 지침 없음**
- **모션**: 레이아웃별로 애니메이션 클래스가 배정됨 (7종). 값·곡선은 확인 범위에 없음. `prefers-reduced-motion`은 **없음**
- **레이아웃**: 25개 정형 패턴 + CSS 구조 + 16:9 락 + 769px 브레이크포인트
- **접근성**: **원문에 지침 없음.** `overflow: hidden` + `color: #fff` 고정이 있어 대비·키보드·스크린리더 고려가 보이지 않는다
- **데이터 시각화**: Chart.js 통합이 템플릿에 내장. 차트 디자인 지침(data-ink, 색 인코딩 등)은 **없음**
- **카피**: 25개 공식 (이 스킬의 최대 강점)
- **설득 구조**: 15개 전략 + 감정 아크

### 지침을 주는 방식 자체

1. **지식 데이터베이스 조회 방식**: 미학 규칙을 서술하지 않고 **카탈로그(15/25/25)를 조회**하게 한다. "the slide knowledge database"라는 표현이 이를 명시.
2. **극단적으로 얇은 진입점**: SKILL.md 1.1KB에 지침이 0개, 표 3개(Subcommands/References/Routing)뿐. 이 컬렉션의 index-first 구조가 가장 극단적으로 나타난 사례.
3. **전략 → 레이아웃 → 카피 → HTML의 4층 분리**: 각 층이 독립 참조 파일이며 각각 카탈로그 형태.
4. **감정 아크 명시**: "curiosity→frustration→hope→confidence→trust→urgency". 슬라이드 순서를 심리 진행으로 규정.
5. **템플릿 문장 제공**: 카피 공식마다 슬롯이 있는 문장. **금지 대신 대안을 준 유일한 사례.**
6. **레이아웃에 모션 사전 배정**: 판단을 제거하고 조회로 대체.
7. **실명 방법론 참조**: Guy Kawasaki, Nancy Duarte (Sparkline), YC Seed Deck. **디자이너·브랜드가 아니라 프레젠테이션 방법론가를 참조한 유일한 스킬.**
8. **개수 제약을 레이아웃에 내장**: Feature Grid 3-6, Metrics 3-4.
9. **완성 HTML 골격 제공**: 295줄 템플릿. 토큰 삽입 지점, Chart.js, 16:9 락, 내비게이션 포함.
10. **페르소나 부여 없음**, **금지 목록 없음**, **체크리스트 없음**, **검증 없음.**

### 모호한 감각어의 번역

이 스킬은 **감각어를 거의 쓰지 않는다.** "persuasive", "strategic", "proven"이 전부이며, 각각이 카탈로그로 환원된다:

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**persuasive**" | 25개 카피 공식의 템플릿 문장 적용 |
| "**strategic**" | 15개 덱 구조 중 목적·청중에 맞는 것 선택 |
| "**proven deck structures**" | YC / Guy Kawasaki / Nancy Duarte 등 실명 방법론 |
| "**emotion arcs**" | "curiosity→frustration→hope→confidence→trust→urgency" 같은 명시적 시퀀스 |
| "**first impression**" (Title Slide) | 레이아웃 + `animate-fade-up` |
| "**Single powerful metric**" (Big Number Hero) | 레이아웃 + `animate-count` |
| "**Drive action**" (CTA Closing) | 레이아웃 + `animate-pulse` + AIDA 공식 |

## 7. 산출물

- **형식**: **단일 HTML 프레젠테이션** (Chart.js 포함, 디자인 토큰 인라인, 16:9 레터박스, 내비게이션)
- **토큰 주입**: `embed-tokens.cjs` 출력을 `<style>` 안 `:root`에 붙여넣기
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- 출력 검증·체크리스트: **없음.**

## 8. 주의점 / 한계

- **`create.md`가 4줄뿐이다 (가장 큰 공백)**: 서브커맨드의 실제 절차가 없다. "Invoke `slides` skill to create persuasive HTML slides using design tokens, Chart.js, and the slide knowledge database" + `$ARGUMENTS` 전달이 전부다. 전략 선택 → 레이아웃 배정 → 카피 작성 → 조립의 순서, 각 단계의 게이트, 완료 조건이 **모두 명시되지 않았다.** 참조 파일에 자료는 풍부한데 **그것을 쓰는 절차가 없다.**
- **자기 참조 순환**: `create.md`가 "Invoke `slides` skill"이라고 쓰여 있는데, 이 파일 자체가 `slides` 스킬의 서브커맨드 문서다. 즉 스킬이 자기를 호출하라고 지시하는 형태 — 원래는 다른 스킬(예: `design`)에서 이 파일을 참조하도록 작성된 것으로 보인다.
- **이 컬렉션 내 3중 중복**: 슬라이드 기능이 세 스킬에 분산되어 있다.
  - `slides/references/`: create, html-template, layout-patterns, copywriting-formulas, slide-strategies (5개)
  - `design/references/`: slides.md, slides-create.md, slides-html-template.md, slides-layout-patterns.md, slides-strategies.md, slides-copywriting-formulas.md (**6개, 접두사만 다름**)
  - `design-system/`: `data/slide-*.csv` 8개 (backgrounds, charts, color-logic, copy, layout-logic, layouts, strategies, typography) + `scripts/generate-slide.py`, `search-slides.py`, `fetch-background.py`, `slide-token-validator.py`, `slide_search_core.py`
  → **같은 지식이 마크다운(2곳)과 CSV(1곳)로 세 번 존재한다.** 어느 것이 정본인지, 어떻게 동기화하는지가 **원문에 없다.** 특히 `design-system`은 검색·생성·검증 스크립트까지 갖추고 있어 그쪽이 더 발전한 구현일 가능성이 있는데, 이 스킬은 그것을 참조하지 않는다.
- **`embed-tokens.cjs` 의존이 SKILL.md에 없다**: 템플릿 주석에만 "Paste embed-tokens.cjs output here"가 있고, 이 스크립트는 `design-system/scripts/`에 있다. 의존 관계가 문서화되지 않았다.
- **금지 규칙·검증 장치 전무**: 4개 컬렉션에서 **금지 목록과 검증 장치가 모두 없는 유일한 스킬**이다. `design-system`에 `slide-token-validator.py`가 있으나 이 스킬은 그것을 언급하지 않는다.
- **접근성 부재**: `overflow: hidden`, `color: #fff` 고정, 대비 지침 없음, 키보드 내비게이션 언급 없음, `prefers-reduced-motion` 없음. 애니메이션 클래스 7종이 레이아웃마다 배정되는데 감소 모션 대응이 없다.
- **`Inter` 폴백**: `var(--typography-font-body, 'Inter', sans-serif)`. 같은 저장소의 `taste-skills` 다수가 Inter를 금지한다 (컬렉션 간 상충 — `brand` 스킬 분석에서도 지적된 동일 문제).
- **Chart.js 버전 고정**: `4.4.1` CDN 하드코딩. 보안 패치·호환성 갱신 절차가 **원문에 없다.**
- **모션 값 미확인**: 애니메이션 클래스 7종의 이름만 제시되고 duration/easing이 확인 범위에 없다. `html-template.md`의 나머지 245줄에 있을 가능성이 있으나 SKILL.md에서 이를 안내하지 않는다.
- **인쇄·PPT 내보내기 부재**: HTML만 산출하며 PDF/PPTX 변환 경로가 없다. `garden-skills/beautiful-article`이 `html-to-pdf.sh`를 제공하는 것과 대비.
- **강한 경고 지점**: **없다.** 이 스킬에는 명령형 경고문이 하나도 없다.
