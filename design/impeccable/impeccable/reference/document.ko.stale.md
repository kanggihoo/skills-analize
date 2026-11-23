프로젝트 루트에 `DESIGN.md` 파일을 만들어 현재 시각 디자인 시스템을 기록합니다. 그러면 AI 에이전트가 브랜드에 맞는 새 화면을 만들 수 있습니다.

`DESIGN.md`는 [공식 DESIGN.md 형식 사양](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md)을 따릅니다. 기계가 읽을 수 있는 디자인 토큰을 담은 선택적 YAML frontmatter 뒤에, 고정된 순서의 Markdown 섹션을 최대 8개 둡니다. **토큰은 규범이고 본문은 적용 방법을 설명하는 맥락입니다.** 관련 없는 섹션은 생략할 수 있지만, 포함하는 섹션은 지정된 순서를 따릅니다. DESIGN.md를 인식하는 여러 도구에서 파일을 이식성 있게 사용하려면 아래의 표준 제목을 그대로 사용합니다.

## Frontmatter: 토큰 스키마

YAML frontmatter는 기계가 읽는 계층입니다. Stitch의 린터가 검증하고 라이브 패널이 타일을 렌더링할 때 사용하는 정보입니다. 간결하게 작성하고 모든 항목이 프로젝트에서 실제 사용하는 토큰에 대응하게 합니다.

```yaml
---
name: <project title>
description: <one-line tagline>
colors:
  primary: "#b8422e"
  neutral-bg: "#faf7f2"
  # ...추출한 색상마다 한 항목; 키는 설명형 slug
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0em"
  body:
    # ...
rounded:
  sm: "4px"
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
---
```

중요 규칙:

- **토큰 참조**는 `{path.to.token}` 형식을 사용합니다 (예: `{colors.primary}`, `{rounded.md}`). 컴포넌트는 기본 토큰을 참조할 수 있지만 기본 토큰끼리는 서로 참조할 수 없습니다.
- **색상은 유효한 CSS 색상 문자열이면 무엇이든 허용됩니다.** 이식성을 위해 hex를 기본으로 권장하지만 프로젝트의 규범적 색상 출처가 `rgb()`, `hsl()`, `oklch()`, 와이드 개멋 또는 복합 색상이라면 기존 형식을 유지합니다. 명확한 이유 없이 단일 기준값을 여러 형식으로 나누지 않습니다.
- **컴포넌트 하위 토큰**은 속성 8개로 제한됩니다: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. 그림자, 모션, 포커스 링, backdrop-filter는 여기에 포함되지 않습니다. 이런 항목은 보조 파일 (Step 4b)에 기록합니다.
- **스케일 키 이름은 자유롭게 확장할 수 있습니다.** 프로젝트에서 이미 쓰는 이름 (`oxblood-deep`, `surface-container-low`)을 사용합니다. Material 기본값에 맞춰 이름을 바꾸지 않습니다.
- **변형은 스키마가 아닌 명명 규칙입니다.** `button-primary` / `button-primary-hover` / `button-primary-active`를 같은 수준의 키로 둡니다.

## Markdown 본문: 8개 섹션 (표준 순서)

1. `## Overview`
2. `## Colors`
3. `## Typography`
4. `## Layout`
5. `## Elevation & Depth`
6. `## Shapes`
7. `## Components`
8. `## Do's and Don'ts`

관련 없는 섹션은 지어낸 규칙으로 채우지 말고 생략합니다. 반응형 레이아웃은 Layout에, 깊이감은 Elevation & Depth에, 모서리 반경과 형태 언어는 Shapes에, 컴포넌트별 동작은 Components에 기록합니다. 형식에서 알 수 없는 섹션은 보존되지만 새 시각 지침은 가능한 한 표준 구조를 사용해야 합니다.

## 실행 시점

- new-work에서 일관된 기존 디자인 시스템을 찾았지만 `DESIGN.md`가 없을 때.
- 새로운 디자인 세계의 첫 구현을 마쳤고 임시 결정을 확정해 기록해야 할 때.
- 기존 `DESIGN.md`가 오래되어 현재 디자인과 달라졌을 때.
- 대규모 리디자인 전에 현재 상태를 기준 자료로 남길 때.

`DESIGN.md`가 이미 있으면 **조용히 덮어쓰지 않습니다.** 사용자에게 기존 파일을 먼저 보여줍니다. Codex의 구조화된 사용자 입력 / 질문 도구가 있으면 사용하고, 없으면 채팅으로 직접 질문한 뒤 답을 기다립니다. 선택지는 갱신, 덮어쓰기, 병합입니다.

## 두 가지 경로

- **스캔 모드 (기본)**: 프로젝트에 디자인 토큰, 컴포넌트, 렌더링 결과가 있음. 먼저 추출한 뒤 묘사 문구를 확인합니다. 분석할 코드가 있을 때 사용합니다.
- **시드 모드**: 구현 전 프로젝트. 먼저 PRODUCT.md가 있는지 확인하고 new-work의 시각 세계 워크숍을 활용해 방향성 DESIGN.md 시드를 작성합니다. 코드가 생기면 다시 스캔 모드를 실행합니다.

먼저 스캔 모드 Step 1로 확인해 경로를 선택합니다. 토큰, 컴포넌트 파일, 렌더링된 사이트가 없다면 시드 모드를 제안하되 조용히 전환하지 않습니다. `$impeccable document --seed`는 new-work의 시각 세계 워크숍을 요청하지만 일관된 기존 코드를 교체할 권한을 주는 것은 아닙니다. 기존 시스템이 있으면 스캔 모드를 제안하거나 명시적인 아이덴티티 교체 요청을 new-work에 전달합니다.

## 스캔 모드 (접근법 C: 자동 추출 후 묘사 문구 확인)

### Step 1: 디자인 에셋 찾기

다음 우선순위로 코드베이스를 검색합니다.

1. **CSS 사용자 지정 속성**: CSS 파일 (일반적으로 `src/styles/`, `public/css/`, `app/globals.css` 등)에서 `--color-`, `--font-`, `--spacing-`, `--radius-`, `--shadow-`, `--ease-`, `--duration-` 선언을 검색합니다. 이름, 값, 정의 파일을 기록합니다.
2. **Tailwind 설정**: `tailwind.config.{js,ts,mjs}`가 있으면 색상, fontFamily, spacing, borderRadius, boxShadow의 `theme.extend` 블록을 읽습니다.
3. **CSS-in-JS 테마 파일**: styled-components, emotion, vanilla-extract, stitches 등을 확인하고 `theme.ts`, `tokens.ts` 또는 이에 해당하는 파일을 찾습니다.
4. **디자인 토큰 파일**: `tokens.json`, `design-tokens.json`, Style Dictionary 출력, W3C 토큰 커뮤니티 그룹 형식을 확인합니다.
5. **컴포넌트 라이브러리**: 주요 버튼, 카드, 입력란, 내비게이션, 대화상자 컴포넌트를 살펴봅니다. 변형 API와 기본 스타일을 기록합니다.
6. **전역 스타일시트**: 루트 CSS 파일에서 기본 타이포그래피와 색상 할당을 확인합니다.
7. **렌더링된 화면**: 브라우저 자동화 도구를 사용할 수 있으면 실제 사이트를 열고 핵심 요소 (body, h1, a, button, .card)의 계산된 스타일을 추출합니다. 토큰에서 놓친 값을 찾을 수 있습니다.

### Step 2: 자동 추출 가능한 내용 추출

발견한 토큰을 바탕으로 구조화된 초안을 만듭니다. 토큰 종류별 지침:

- **색상**: Primary / Secondary / Tertiary / Neutral로 분류합니다 (Stitch가 사용하는 Material 기반 역할). 프로젝트에 강조색 하나만 있으면 Primary + Neutral로 표현하고 Secondary / Tertiary는 지어내지 말고 생략합니다.
- **타이포그래피**: 관찰된 크기와 굵기를 Material 위계 (display / headline / title / body / label)에 대응시킵니다. 글꼴 패밀리 스택과 크기 비율도 기록합니다.
- **Elevation**: 그림자 어휘를 정리합니다. 프로젝트가 평면적이고 색조 레이어를 사용한다면 그것도 유효한 방식이므로 명시적으로 적습니다.
- **컴포넌트**: 각 일반 컴포넌트 (button, card, input, chip, list item, tooltip, nav)의 형태 (반경), 색상 할당, hover/focus 처리, 내부 padding을 추출합니다.
- **레이아웃 + 간격**: 격자, 컨테이너, 중단점, 리듬, 밀도 반응을 Layout 섹션으로 추출합니다.
- **Shapes**: 반경, 모서리, 테두리, clipping, 반복되는 형태 동작을 추출합니다.

### Step 2b: Frontmatter 준비

자동 추출한 토큰으로 YAML frontmatter 초안을 만듭니다 (Step 4에서 DESIGN.md 맨 위에 작성). 이 레이어는 라이브 패널과 Stitch 린터가 소비하는 기계 판독 정보입니다.

- **색상**: 추출한 색상마다 한 항목을 둡니다. 키는 설명형 slug (`blue-800` 대신 `oxblood-deep`, `editorial-magenta`)를 사용합니다. 값은 프로젝트의 규범적 형식을 사용합니다 (OKLCH 또는 hex; 앞의 frontmatter 규칙 참고). 기준 원본을 분리하지 않습니다. frontmatter에서 한 형식만 사용하고 같은 토큰을 본문에서 다른 값으로 다시 정의하지 않습니다.
- **Typography**: 역할마다 (`display`, `headline`, `title`, `body`, `label`) 한 항목을 둡니다. Typography는 객체이며 프로젝트에 실제로 존재하는 속성만 포함합니다 (`fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFeature`, `fontVariation`).
- **Rounded / Spacing**: 프로젝트에서 실제 사용하는 스케일 단계를 사용하며 프로젝트의 기존 스케일 이름 (`sm` / `md` / `lg`, `surface-sm`, 숫자 단계 등)을 키로 씁니다.
- **Components**: 변형마다 (`button-primary`, `button-primary-hover`, `button-ghost`) 한 항목을 둡니다. `{colors.X}`, `{rounded.Y}`로 기본 토큰을 참조합니다. 변형에 Stitch 속성 8개로 다루지 못하는 값 (그림자, 포커스 링, backdrop-filter)이 있으면 전체 예시를 보조 파일에 기록합니다.

프로젝트에 없는 항목은 생략합니다. 빈 스케일 키나 조작된 토큰은 사양을 오염시킵니다.

### Step 3: 정성적 표현을 사용자에게 질문

자동 추출할 수 없는 창의적 표현은 사용자의 입력이 필요합니다. 두 차례에 나눠 질문하고 (회당 최대 3개 또는 하네스의 더 낮은 한도) 각 차례 사이에 답변을 기다립니다.

- **Creative North Star**: 전체 시스템을 나타내는 이름 있는 비유 하나 (“Editorial Sanctuary”, “Golden State Curator”, “Lab Notebook”). PRODUCT.md의 브랜드 성격을 존중하는 선택지 2–3개를 제안합니다.
- **Overview 어조**: 분위기 형용사, 2–3문장의 미학 철학, 확인된 시각적 반례를 묻습니다.
- **색상 성격** (자동 추출된 색상): 설명형 이름 (“blue-800”이 아닌 “Deep Muted Teal-Navy”). 색조 / 채도를 고려해 각 주요 색상별 이름 2–3개를 제안합니다.
- **Elevation 철학**: 평면 / 레이어 / 들뜸 중 어떤 방식인지. 그림자가 있다면 배경 분위기인지 구조 표현인지 확인합니다.
- **컴포넌트 철학**: 버튼, 카드, 입력란의 느낌을 한 문구로 정리 (“촉감 있고 자신감 있음” vs. “세련되고 절제됨”).

PRODUCT.md에서 지속적이며 실제로 시각 시스템을 제약하는 브랜드 약속만 가져옵니다. 페이지 전략과 표면 콘셉트는 이 문서의 내용이 아닙니다.

### Step 4: DESIGN.md 작성

파일은 Step 2b에서 준비한 YAML frontmatter로 시작하고 (이 문서 앞부분의 스키마 설명 참고), 아래 표준 구조의 Markdown 본문을 이어 작성합니다.

```markdown
---
name: [Project Title]
description: [one-line tagline]
colors:
  # ... Step 2b에서 준비한 frontmatter
---

# Design System: [Project Title]

## Overview

**Creative North Star: "[Named metaphor in quotes]"**

[2-3 paragraph holistic description: personality, density, and aesthetic philosophy. Start from the North Star and work outward. State only confirmed visual rejections. End with a short **Key Characteristics:** bullet list.]

## Colors

[Describe the palette character in one sentence.]

### Primary
- **[Descriptive Name]** (#HEX / oklch(...)): [Where and why this color is used. Be specific about context, not just role.]

### Secondary (optional; omit if the project has only one accent)
- **[Descriptive Name]** (#HEX): [Role.]

### Tertiary (optional)
- **[Descriptive Name]** (#HEX): [Role.]

### Neutral
- **[Descriptive Name]** (#HEX): [Text / background / border / divider role.]
- [...]

### Named Rules (optional, powerful)
**The [Rule Name] Rule.** [Short, forceful prohibition or doctrine, e.g. "The One Voice Rule. The primary accent is used on ≤10% of any given screen. Its rarity is the point."]

## Typography

**Display Font:** [Family] (with [fallback])
**Body Font:** [Family] (with [fallback])
**Label/Mono Font:** [Family, if distinct]

**Character:** [1-2 sentence personality description of the pairing.]

### Hierarchy
- **Display** ([weight], [size/clamp], [line-height]): [Purpose; where it appears.]
- **Headline** ([weight], [size], [line-height]): [Purpose.]
- **Title** ([weight], [size], [line-height]): [Purpose.]
- **Body** ([weight], [size], [line-height]): [Purpose. Include max line length like 65–75ch if relevant.]
- **Label** ([weight], [size], [letter-spacing], [case if uppercase]): [Purpose.]

### Named Rules (optional)
**The [Rule Name] Rule.** [Short doctrine about type use.]

## Layout

[Describe the grid or spatial model, container behavior, density, responsive changes, and the spacing rhythm. Include exact values only when observed.]

## Elevation & Depth

[One paragraph: does this system use shadows, tonal layering, or a hybrid? If "no shadows", say so explicitly and describe how depth is conveyed instead.]

### Shadow Vocabulary (if applicable)
- **[Role name]** (`box-shadow: [exact value]`): [When to use it.]
- [...]

### Named Rules (optional)
**The [Rule Name] Rule.** [e.g. "The Flat-By-Default Rule. Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus)."]

## Shapes

[Describe the form language: corner/radius strategy, borders, clipping, and any recurring silhouette or geometry.]

## Components

For each component, lead with a short character line, then specify shape, color assignment, states, and any distinctive behavior.

### Buttons
- **Shape:** [radius described, exact value in parens]
- **Primary:** [color assignment + padding, in semantic + exact terms]
- **Hover / Focus:** [transitions, treatments]
- **Secondary / Ghost / Tertiary (if applicable):** [brief description]

### Chips (if used)
- **Style:** [background, text color, border treatment]
- **State:** [selected / unselected, filter / action variants]

### Cards / Containers
- **Corner Style:** [radius]
- **Background:** [colors used]
- **Shadow Strategy:** [reference Elevation section]
- **Border:** [if any]
- **Internal Padding:** [scale]

### Inputs / Fields
- **Style:** [stroke, background, radius]
- **Focus:** [treatment, e.g. glow, border shift, etc.]
- **Error / Disabled:** [if applicable]

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.**

### [Signature Component] (optional; if the project has a distinctive custom component worth documenting)
[Description.]

## Do's and Don'ts

Concrete visual guardrails grounded in the incumbent implementation or the user's chosen world. Lead each with "Do" or "Don't" and include exact values only when established. Do not turn a task-specific concept or surface strategy into a system-wide prohibition.

### Do:
- **Do** [specific prescription with exact values / named rule].
- **Do** [...]

### Don't:
- **Don't** [specific prohibition confirmed by the incumbent system or the user].
- **Don't** [...]
- **Don't** [...]
```

### Step 4b: `.impeccable/design.json` 보조 파일 작성 (확장 정보만)

Frontmatter는 토큰 기본값 (색상, 타이포그래피, rounded, spacing, components)을 소유합니다. `.impeccable/design.json` 보조 파일에는 **Stitch 스키마에 담을 수 없는 내용**만 둡니다: 색상별 색조 단계, 그림자 / elevation 토큰, 모션 토큰, 중단점, 완전한 컴포넌트 HTML/CSS 예시 (패널이 이를 shadow DOM에 렌더링), 설명 (north star, 규칙, Do/Don't). 보조 파일은 frontmatter를 확장해야 하며 중복해서는 안 됩니다.

루트 `DESIGN.md`를 다시 생성할 때마다 보조 파일도 함께 다시 생성합니다. 사용자가 보조 파일만 갱신해 달라고 했다면 (예: 라이브 패널의 오래된 상태 알림), `DESIGN.md`는 보존하고 `.impeccable/design.json`만 작성합니다.

#### 스키마

```json
{
  "schemaVersion": 2,
  "generatedAt": "ISO-8601 string",
  "title": "Design System: [Project Title]",
  "extensions": {
    "colorMeta": {
      "primary":        { "role": "primary",  "displayName": "Editorial Magenta", "canonical": "oklch(60% 0.25 350)", "tonalRamp": ["...", "...", "..."] },
      "cool-paper": { "role": "neutral",  "displayName": "Cool Paper",    "canonical": "oklch(96% 0.005 230)", "tonalRamp": ["...", "...", "..."] }
    },
    "typographyMeta": {
      "display": { "displayName": "Display", "purpose": "Hero headlines only." }
    },
    "shadows": [
      { "name": "ambient-low", "value": "0 4px 24px rgba(0,0,0,0.12)", "purpose": "Diffuse hover glow under accent elements." }
    ],
    "motion": [
      { "name": "ease-standard", "value": "cubic-bezier(0.4, 0, 0.2, 1)", "purpose": "Default easing for state transitions." }
    ],
    "breakpoints": [
      { "name": "sm", "value": "640px" }
    ]
  },
  "components": [
    {
      "name": "Primary Button",
      "kind": "button | input | nav | chip | card | custom",
      "refersTo": "button-primary",
      "description": "One-line what and when.",
      "html": "<button class=\"ds-btn-primary\">SAVE CHANGES</button>",
      "css": ".ds-btn-primary { background: #191c1d; color: #fff; padding: 16px 48px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; border: none; border-radius: 0; transition: background 0.2s, transform 0.2s; } .ds-btn-primary:hover { background: oklch(60% 0.25 350); transform: translateY(-2px); }"
    }
  ],
  "narrative": {
    "northStar": "The Editorial Sanctuary",
    "overview": "2-3 paragraphs of the philosophy, pulled from DESIGN.md Overview section.",
    "keyCharacteristics": ["...", "..."],
    "rules": [{ "name": "The One Voice Rule", "body": "...", "section": "colors|typography|elevation" }],
    "dos":   ["Do use ..."],
    "donts": ["Don't use ..."]
  }
}
```

**schemaVersion 1에서 바뀐 점.** 이전 보조 파일에는 토큰 기본값 배열 (`tokens.colors[]`, `tokens.typography[]` 등)이 있었습니다. 이제 이 값은 frontmatter에 들어갑니다. 보조 파일에는 frontmatter에 담을 수 없는 메타데이터만 포함합니다 (색조 단계, hex가 근삿값일 때의 기준 OKLCH, 표시명, 역할 힌트). frontmatter 토큰 이름을 키로 사용합니다 (`colorMeta.<token-name>`, `typographyMeta.<token-name>`). 컴포넌트에는 Stitch의 8개 속성으로 담을 수 없는 전체 HTML/CSS를 계속 기록합니다.

#### 컴포넌트 변환 규칙

`html`과 `css` 필드는 shadow DOM에 주입했을 때 올바르게 렌더링되는 **자기완결적이며 바로 삽입 가능한 코드**여야 합니다. 패널이 그대로 적용하므로 후처리나 프레임워크 런타임을 가정하지 않습니다.

1. **Tailwind 확장**: 원본에서 Tailwind를 사용한다면 (`className="bg-primary text-white rounded-lg px-6 py-3"`), 모든 유틸리티를 `css` 문자열 안의 문자 그대로인 CSS 속성으로 풀어 씁니다. Tailwind 클래스를 참조하거나 Tailwind CSS 번들이 로드되어 있다고 가정하지 않습니다. 각 컴포넌트는 독립적으로 완결되어야 합니다.
2. **토큰 해석**: 프로젝트가 `:root`에 CSS 사용자 지정 속성으로 토큰을 제공한다면 (예: `--color-primary`, `--radius-md`), `var(--color-primary)` 형식으로 참조합니다. shadow DOM을 통해 상속되며 실시간 토큰에 연결됩니다. 토큰이 JS 테마 객체 (styled-components, CSS-in-JS)에만 있다면 생성 시점에 실제 값으로 변환합니다.
3. **아이콘**: SVG를 인라인으로 넣습니다. Lucide / Heroicons 패키지, 아이콘 글꼴, `<img src="...">`를 참조하지 않습니다. 일반적인 아이콘 크기는 16–24px이며 SVG path 데이터를 그대로 복사합니다.
4. **상태**: `:hover`, `:focus-visible`, 의미가 있다면 `:active` 규칙도 포함합니다. 기본 상태만 있는 스냅샷은 패널을 죽은 듯 보이게 합니다. CSS에 hover + focus 규칙을 넣으면 생동감이 납니다.
5. **초기화 코드 최소화**: 컴포넌트의 *고유한* CSS만 추출합니다 (background, color, padding, border-radius, typography, transition). 범용 초기화 (`box-sizing: border-box`, `line-height: inherit`, `-webkit-font-smoothing`)는 생략합니다. 패널에는 중립 캔버스가 있으므로 초기화 코드를 다시 넣지 않습니다.
6. **범위가 겹치지 않는 클래스 이름**: 같은 shadow DOM 안의 다른 컴포넌트 CSS와 충돌하지 않도록 모든 클래스에 `ds-` 접두어를 붙입니다 (예: `ds-btn-primary`, `ds-input-search`).

#### 포함할 항목

시각 시스템을 가장 잘 대표하는 **컴포넌트 5–10개**로 간결하게 구성합니다.

- **기본 프리미티브 (프로젝트에 있으면 반드시 포함)**: 버튼 (변형별로 별도 항목), 입력란 / 텍스트 필드, 내비게이션, chip / tag, 카드.
- **시그니처 컴포넌트 (독특한 경우 포함)**: 실제 구현된 시스템을 정의하는 반복적인 사용자 지정 패턴.
- **나머지는 생략합니다.** 유틸리티 컴포넌트, 폼 조립 요소, 래퍼 레이아웃은 시각적으로 독특하지 않으면 문서화할 필요가 없습니다.

프로젝트에 **아직 컴포넌트 라이브러리가 없다면** (기본 랜딩 페이지, 신규 프로젝트), DESIGN.md의 규칙에 맞는 모범 사례 기본값으로 토큰에서 표준 프리미티브를 합성합니다. 첫날부터 모든 `.impeccable/design.json`에 렌더링할 항목이 있어야 합니다.

#### 색조 단계

각 색상 토큰마다 어두운색에서 밝은색으로 이어지는 8단계 `tonalRamp` 배열을 만듭니다. 색조는 유지하되 흰색과 검정에 가까울수록 채도를 낮추고 명도는 약 15%–95% 사이로 단계화합니다. 패널은 이 배열을 색상 견본 아래 띠로 렌더링합니다. 프로젝트에서 이미 명도 체계를 정의했다면 (Material `surface-container-low` 계열, Tailwind 스타일 `blue-50..blue-900`) 그 값을 사용합니다. 그렇지 않으면 OKLCH에서 생성합니다.

#### 설명 매핑

방금 작성한 DESIGN.md에서 직접 가져옵니다.

- `narrative.northStar` → Overview의 `**Creative North Star: "..."**` 행
- `narrative.overview` → Overview의 철학 설명 문단
- `narrative.keyCharacteristics` → `**Key Characteristics:**` 목록
- `narrative.rules` → 모든 섹션의 `**The [Name] Rule.** [body]`, 섹션 이름 포함
- `narrative.dos` / `narrative.donts` → Do's and Don'ts의 글머리 목록을 그대로 복사

문구를 다시 쓰지 않습니다. 패널은 이를 접을 수 있는 보조 맥락으로 보여주며 Markdown의 목소리를 그대로 이어갑니다.

### Step 5: 확인 및 개선

1. 작성한 DESIGN.md 전체를 사용자에게 보여줍니다. 설명형 색상 이름, 분위기 표현, 이름 붙인 규칙 등 눈에 띄지 않는 창의적 선택을 간략히 설명합니다.
2. `.impeccable/design.json`도 같은 위치에 작성했다고 알립니다. 그러면 라이브 패널이 일반적인 근사값 대신 프로젝트의 실제 버튼 / 입력란 / 내비게이션 프리미티브를 렌더링합니다.
3. 섹션 개선을 제안합니다: “특정 섹션을 수정하거나, 놓친 컴포넌트 패턴을 추가하거나, 분위기 표현을 조정할까요?”

직접 작성한 파일이 가장 최신 출처이므로 이 세션의 후속 명령에서는 다시 읽지 않아도 됩니다.

## 시드 모드

아직 추출할 시각 시스템이 없는 프로젝트용입니다. 토큰 사양을 지어내는 대신 사용자가 선택한 시각 세계의 뼈대를 만듭니다.

### Step 1: new-work 워크숍으로 연결

선행 조건은 PRODUCT.md입니다. 파일이 없으면 [init.md](init.md)를 불러와 먼저 제품 인터뷰를 진행합니다. 지속적인 제품 맥락이 없으면 시각 아이덴티티를 만들지 않습니다.

PRODUCT.md가 있으면 [new-work.md](new-work.md)를 읽고 시각 방향의 기준을 확정합니다. 시드 모드를 시작하려면 구체적인 첫 표면이 필요합니다. 사용자가 지정한 대상을 사용하거나 무엇부터 만들지 물어봅니다. new-work의 **시각 세계 생성 또는 교체** 흐름을 실행한 뒤 **세계 확정**을 진행해 시각 세계와 첫 적용 표면을 함께 선택합니다. 방향성 DESIGN.md 시드와 표면 brief까지만 만들고 구현하지 않습니다. 구조화된 모의 사용자는 실제 사용자로 간주하고 같은 선택 과정을 거칩니다.

이번 세션에서 new-work 워크숍을 이미 완료했다면 그때 선택한 방향을 그대로 사용합니다. 다시 묻지 않습니다.

### Step 2: 시드 DESIGN.md 작성

스캔 모드의 표준 섹션 순서를 사용합니다. 선택된 워크숍 방향을 채우고 아직 결정되지 않은 구현 사실은 솔직한 placeholder로 표시합니다. 시드는 시각 세계와 불변 조건을 확정하는 것이지 구현 토큰이 이미 존재한다고 가장하는 문서가 아닙니다.

파일 맨 앞에 둡니다.

```markdown
<!-- SEED: established with the user before implementation; re-run $impeccable document once there's code to capture the actual tokens and components. -->
```

시드 모드의 섹션별 지침:

- **Overview**: 선택한 디자인 명제, 레이아웃 동작, 재질 성격, 이미지 기준, 모션 문법, 재사용 가능한 시그니처. North Star에서 출발해 전체 방향을 설명합니다. 첫 표면 표현은 surface brief에 두고 해당 구도를 전역 디자인 세계로 확대하지 않습니다.
- **Colors**: 선택한 팔레트 전략과 역할을 기록합니다. 사용자가 확정했거나 기존 에셋 또는 new-work 탐색으로 확립된 값만 포함하고, 그 외에는 `[to be resolved during implementation]`이라고 표시합니다.
- **Typography**: 글자 성격과 역할 간 관계를 기록합니다. 글꼴 이름이 확정된 경우에만 포함하고 그렇지 않으면 `[to be resolved during implementation]`이라고 표시합니다.
- **Layout**: 정확한 치수가 확정된 것처럼 꾸미지 말고 선택된 공간 문법과 반응형 동작을 기술합니다.
- **Elevation & Depth**: 일반 프리셋으로 추측하지 말고 선택된 재질과 깊이 표현을 불변 조건으로 기록합니다.
- **Shapes**: 선택한 형태와 모서리 언어를 기록합니다.
- **Components**: 아직 컴포넌트가 없으므로 섹션을 생략합니다.
- **Do's and Don'ts**: 세계 방향을 선택할 때 확정한 지속적인 가드레일을 기록합니다. 특정 작업에만 해당하는 거절 조건은 넣지 않습니다.

시드 모드의 최소 frontmatter에는 `name`과 `description`만 포함합니다. 아직 실제 토큰이 없으므로 colors, typography, rounded, spacing, components는 작성하지 않습니다. 다음 스캔 모드 실행에서 실제 토큰을 기록합니다. 같은 이유로 시드 모드에서는 `.impeccable/design.json` 보조 파일도 생략합니다. 렌더링할 내용이 없습니다.

### Step 3: 확인

1. 시드 DESIGN.md를 보여줍니다. 해당 문서가 시드임을 설명합니다 (마커가 이 약속을 명시함).
2. 사용자에게 다음을 알립니다: “코드가 생기면 `$impeccable document`를 다시 실행하세요. 실제 토큰을 추출하고 보조 파일을 생성합니다.”

직접 작성한 파일이 최신 출처이므로 다시 불러올 필요는 없습니다.

## 문체 지침

- **Frontmatter 먼저, 본문은 다음**: 토큰은 YAML frontmatter에 두고 본문은 맥락을 설명합니다. 같은 토큰 값을 두 번 정의하지 않습니다. 규범적 출처는 frontmatter입니다.
- **지속적인 제품 제약만 포함**: PRODUCT.md의 로고 규칙, 아이덴티티 에셋, 접근성 요구, 브랜드 약속이 DESIGN.md를 제약할 수 있습니다. 표면 전략은 해당 표면 brief에 둡니다.
- **사양 준수**: 표준 섹션 8개를 순서대로 사용하고 무관한 섹션은 생략합니다. 스키마가 지원하지 않는 모션 토큰 그룹을 만들지 말고 영향을 받는 세계나 컴포넌트에서 움직임을 설명합니다.
- **기술적 표현보다 설명형 표현**: “rounded-lg”보다 “부드럽게 둥근 모서리 (반경 8px)”를 사용합니다. 설명을 먼저 쓰고 괄호 안에 기술 값을 둡니다.
- **장식보다 기능**: 각 토큰을 어디에 왜 쓰는지 설명합니다. 무엇인지에 그치지 않습니다.
- **정확한 값은 괄호 안에**: hex 코드, px/rem 값, 글꼴 굵기 등은 설명과 함께 괄호 안에 숫자를 표시합니다.
- **이름 있는 규칙 사용**: `**The [Name] Rule.** [short doctrine]` 형식을 씁니다. 기억하고 인용하기 쉬워 AI가 글머리표보다 잘 활용합니다. Stitch 결과물도 “The No-Line Rule”, “The Ghost Border Fallback” 등을 많이 씁니다. 섹션별로 1–3개를 목표로 합니다.
- **근거가 확실하면 단호하게**: 실제 불변 조건은 강한 표현을 쓰고, 잠정 지침은 완화해 씁니다.
- **구체적인 감사 테스트는 관찰된 시스템이나 사용자 확인에 근거할 때만 작성**: 한 문장의 테스트가 한 문단 원칙보다 낫습니다.
- **PRODUCT.md는 선택적으로 참조**: 제품의 사실은 시각 세계가 맞는 이유를 설명할 수 있지만 페이지 구도나 시각적 금지 목록을 기본 제공하지 않습니다.
- **역할별 색상 그룹화**: hex 순서나 색조 순서가 아니라 Primary / Secondary / Tertiary / Neutral 순으로 정리합니다.

## 주의할 함정

- 원시 CSS 클래스 이름을 붙여 넣지 않습니다. 설명형 표현으로 바꿉니다.
- 모든 토큰을 추출하지 않습니다. 실제로 재사용되는 지점까지만 기록합니다. 일회성 값은 시스템을 오염시킵니다.
- 존재하지 않는 컴포넌트를 지어내지 않습니다. 프로젝트에 버튼과 카드만 있다면 그것만 문서화합니다.
- 기존 DESIGN.md를 허락 없이 덮어쓰지 않습니다.
- PRODUCT.md 내용을 중복하지 않습니다. DESIGN.md는 시각 디자인만 다룹니다.
- 표준 섹션을 비슷한 다른 제목으로 대체하지 않습니다. 레이아웃과 반응형 동작은 `Layout`에, 모션은 영향을 받는 세계나 컴포넌트에 둡니다.
- 섹션 제목을 조금이라도 바꾸지 않습니다. `Colors`이지 `Color Palette & Roles`가 아닙니다. `Typography`이지 `Typography Rules`가 아닙니다. 도구에서 정확한 제목을 기준으로 파싱합니다.
- frontmatter와 본문에 토큰 값을 중복 기록하지 않습니다. `colors.primary`에 hex가 있으면 본문에서 색상 이름과 역할을 설명할 수 있지만 다른 hex 값을 다시 쓰지 않습니다. 규범적 값은 frontmatter입니다.
- Stitch 스키마 바깥의 frontmatter 토큰 그룹을 지어내지 않습니다 (최상위에 `motion:`, `breakpoints:`, `shadows:` 금지). 나머지는 보조 파일의 `extensions`에 넣습니다.
