# industrial-brutalist-ui 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/industrial-brutalist-ui/`
- **핵심 파일**: `SKILL.md` (8,456 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **단일 미학 처방형 스타일 스킬**. 스위스 타이포그래피 인쇄 + 군용/항공 터미널 미학을 융합한 "Industrial Brutalism & Tactical Telemetry" 시각 언어를 8개 섹션으로 규정. `minimalist-ui`와 동일한 문서 구조(Meta → 금지/원형 → 타이포 → 컬러 → 레이아웃 → 컴포넌트 → 텍스처 → 엔지니어링)를 갖는 자매 스킬.

원문 자기 규정: "The objective is to construct digital environments that project **raw functionality, mechanical precision, and high data density, deliberately discarding conventional consumer UI patterns.**"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Raw mechanical interfaces fusing Swiss typographic print with military terminal aesthetics. Rigid grids, extreme type scale contrast, utilitarian color, analog degradation effects. For data-heavy dashboards, portfolios, or editorial sites that need to feel like declassified blueprints."

**매칭되는 사용자 발화**
- "브루탈리즘 스타일로", "터미널 느낌 UI"
- "declassified blueprint 같은 느낌" — description이 이 비유를 직접 제시
- "데이터 밀도 높은 대시보드를 거칠고 기계적으로"
- "스위스 타이포그래피 기반 포트폴리오"
- "CRT / 스캔라인 / 하프톤 효과"

**용도 지정 (description 후반)**: "For **data-heavy dashboards, portfolios, or editorial sites**" — 세 가지 용도를 명시한다. 이 컬렉션의 스타일 스킬 중 **용도를 description에 밝힌 유일한 스킬**이다 (`minimalist-ui`, `gpt-taste`는 미학만 서술).

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **데이터 밀도가 높은 대시보드** — "High-density tabular data presentation", "Bimodal Density"
- 포트폴리오 / 에디토리얼 사이트 — 거대 타이포그래피가 주역
- 개발자·엔지니어링 도구 — 모노스페이스 지배, 시맨틱 태그(`<data>`, `<samp>`, `<output>`)
- 기술적·기계적 인상이 브랜드 자산인 제품
- 브랜드 컬러가 없거나 흑백+빨강으로 성립하는 프로젝트

**부적합 / 과한 상황**
- 일반 소비자 제품 — "**deliberately discarding conventional consumer UI patterns**"
- 친근함·온화함이 필요한 도메인 (웰니스, 교육, 아동, 의료 등)
- 브랜드 컬러가 강한 프로젝트 — 액센트가 **빨강 하나로 고정** ("This is the ONLY accent color")
- 그라디언트·부드러운 그림자·유리 효과를 원할 때 — "strictly prohibited"
- 라운드 코너가 필요한 UI — "**Absolute rejection of `border-radius`**"
- 접근성 요구가 높은 제품 — 스캔라인·노이즈·1비트 디더링은 가독성과 상충하며 **접근성 지침이 원문에 없음**

**형제 스킬 대신 이걸 고르는 기준**: 이 컬렉션의 스타일 스킬 3개는 상호 배타적이다.
- 조용하고 문서적 → `minimalist-ui` (warm monochrome, 파스텔, 라운드 8~12px)
- 거칠고 기계적 → **이 스킬** (흑백+빨강, radius 0, 스캔라인)
- 화려하고 모션 중심 → `gpt-taste` (GSAP 필수, mesh gradient, 거대 여백)
**셋 중 하나만 켜야 하며**, 원문에 이 배타성에 대한 언급은 없다.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 해당 없음. 이미지 플레이스홀더 지침도 **원문에 없음** (`minimalist-ui`/`gpt-taste`의 `picsum.photos`와 대비 — 이 스킬은 "Imagery is secondary"이므로 필요성이 낮다).
- **필요한 CLI/런타임/패키지**
  - **폰트** (2계층 + 1보조):
    - Macro: **Neue Haas Grotesk (Black)** (상업 유료), **Inter (Extra Bold/Black)**, **Archivo Black** (Google), **Roboto Flex (Heavy)** (Google), **Monument Extended** (상업 유료)
    - Micro: **JetBrains Mono**, **IBM Plex Mono**, **Space Mono**, **VT323**, **Courier Prime** (모두 무료/오픈)
    - Textural: **Playfair Display**, **EB Garamond** (Google), **Times New Roman** (시스템)
  - **CSS/SVG 필터** — 하프톤, 1비트 디더링, 스캔라인, 노이즈. 별도 라이브러리 불필요
  - Tailwind 등 특정 프레임워크에 **결합되지 않음** — 순수 CSS 속성으로 지침이 작성됨 (`display: grid; gap: 1px;`, `clamp()`, `repeating-linear-gradient`, `mix-blend-mode`)
- **네트워크**: 폰트 로딩에만 필요
- **비용 발생 지점**: 유료 API 없음. 단 **Neue Haas Grotesk / Monument Extended는 상업 라이선스 폰트**이며 원문에 라이선스 언급이 없다.

## 5. 워크플로우

이 스킬은 **절차형 워크플로우가 없다.** 대신 **두 개의 배타적 선택 게이트**가 있고, 그 선택이 이후 모든 값을 결정한다.

### 게이트 1 — 시각 원형 선택 (§2) — **배타적, 혼합 금지**
"The design system operates by merging two distinct but highly compatible visual paradigms. **Pick ONE per project and commit to it. Do not alternate or mix both modes within the same interface.**"

**2.1 Swiss Industrial Print** — "Derived from 1960s corporate identity systems and heavy machinery blueprints."
특징 (원문): "High-contrast **light modes** (newsprint/off-white substrates). Reliance on **monolithic, heavy sans-serif** typography. **Unforgiving structural grids** outlined by visible dividing lines. Aggressive, asymmetric use of negative space punctuated by **oversized, viewport-bleeding numerals or letterforms**. Heavy use of **primary red** as an alert/accent color."

**2.2 Tactical Telemetry & CRT Terminal** — "Derived from classified military databases, legacy mainframes, and aerospace Heads-Up Displays (HUDs)."
특징 (원문): "**Dark mode exclusivity.** **High-density tabular data** presentation. **Absolute dominance of monospaced typography.** Integration of **technical framing devices** (ASCII brackets, crosshairs). Application of **simulated hardware limitations** (phosphor glow, scanlines, low bit-depth rendering)."

### 게이트 2 — 기판(substrate) 팔레트 선택 (§4) — **배타적, 혼합 금지**
"**CRITICAL: Choose ONE substrate palette per project and use it consistently. Never mix light and dark substrates within the same interface.**"

게이트 1의 선택이 게이트 2를 결정한다 (Swiss → Light, Tactical → Dark). 즉 **앞 단계 산출물이 뒤 단계를 구속**하는 유일한 지점.

### 그 다음은 층위별 처방 (순서 없음)
- §3 타이포그래피 3계층 (Macro / Micro / Textural)
- §4 컬러 (선택된 기판에 따라)
- §5 레이아웃·공간 엔지니어링
- §6 UI 컴포넌트·기호 체계
- §7 텍스처·후처리 효과
- §8 웹 엔지니어링 지시 3항목

**분기·조건**
- Terminal Green (`#4AF626`): "**Optional.** Use ONLY for a single specific UI element ... **If it doesn't serve a clear purpose, omit it entirely.**"
- Textural Serif: "Used **exceedingly sparingly**"
- CRT Scanlines: "**For terminal interfaces**" (즉 Tactical 모드 전용)
- Mechanical Noise: "applied to the DOM root ... **across both dark and light modes**" (양쪽 공통)

**사용자 확인 요구 지점**: **없음.** 두 게이트는 모델이 스스로 판정한다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

- "**Pick ONE per project and commit to it. Do not alternate or mix both modes within the same interface.**" (§2)
- "**Gradients, soft drop shadows, and modern translucency are strictly prohibited.**" (§4)
- "**Never mix light and dark substrates within the same interface.**" (§4)
- "This is the **ONLY** accent color." (빨강)
- Terminal Green: "**never as a general text color**" / "If it doesn't serve a clear purpose, **omit it entirely**"
- "**Avoid pure `#000000`**" (다크 배경)
- "**Absolute rejection of `border-radius`.** All corners must be **exactly 90 degrees** to enforce mechanical rigidity." (§5)
- "It **rejects conventional web padding** in favor of visible compartmentalization." (§5)
- "Elements **do not float**; they are anchored precisely to grid tracks and intersections." (§5)
- "**Standard web UI conventions are replaced** with utilitarian, industrial graphic elements." (§6)
- 산업 마커(®/©/™): "functioning as **structural geometric elements rather than legal text**" (§6)
- Textural Serif: "**Must be subjected to heavy post-processing** (halftone filters, 1-bit dithering) to **degrade vector perfection**" (§3.3)
- "To prevent the design from appearing **purely digital**, simulated analog degradation is engineered into the frontend" (§7)
- "**deliberately discarding conventional consumer UI patterns**" (§1)
- 타이포그래피 우선순위: "Typography is the primary structural and decorative infrastructure. **Imagery is secondary.**" (§3)
- Casing: "**Exclusively uppercase**" (Macro와 Micro 모두)
- Clamping: "Implement CSS `clamp()` functions **exclusively for macro-typography**" (§8-3)

### 강제 규칙 — 수치 인용

**타이포그래피 (§3) — 3계층**

*3.1 Macro-Typography (Structural Headers)*
- 분류: Neo-Grotesque / Heavy Sans-Serif
- 폰트: Neue Haas Grotesk (Black), Inter (Extra Bold/Black), Archivo Black, Roboto Flex (Heavy), Monument Extended
- **Scale**: `clamp(4rem, 10vw, 15rem)`
- **Tracking**: "Extremely tight, often negative (**`-0.03em` to `-0.06em`**), forcing glyphs to form **solid architectural blocks**"
- **Leading**: "Highly compressed (**`0.85` to `0.95`**)"
- **Casing**: "**Exclusively uppercase** for structural impact"

*3.2 Micro-Typography (Data & Telemetry)*
- 분류: Monospace / Technical Sans
- 폰트: JetBrains Mono, IBM Plex Mono, Space Mono, VT323, Courier Prime
- **Scale**: "Fixed and small (**`10px` to `14px`** / **`0.7rem` to `0.875rem`**)"
- **Tracking**: "Generous (**`0.05em` to `0.1em`**) to simulate mechanical typewriter spacing or terminal matrices"
- **Leading**: "Standard to tight (**`1.2` to `1.4`**)"
- **Casing**: "Exclusively uppercase. Used for **all metadata, navigation, unit IDs, and coordinates**"

*3.3 Textural Contrast (Artistic Disruption)*
- 분류: High-Contrast Serif
- 폰트: Playfair Display, EB Garamond, Times New Roman
- 사용: "exceedingly sparingly" + 반드시 하프톤/1비트 디더링 후처리

**컬러 (§4) — 기판별**

*Swiss Industrial Print (Light)*

| 역할 | 값 |
|---|---|
| Background | **`#F4F4F0`** 또는 **`#EAE8E3`** ("Matte, unbleached documentation paper") |
| Foreground | **`#050505`** ~ **`#111111`** ("Carbon Ink") |
| Accent | **`#E61919`** 또는 **`#FF2A2A`** ("Aviation/Hazard Red") — 용도: "strike-throughs, thick structural dividing lines, or vital data highlights" |

*Tactical Telemetry (Dark)*

| 역할 | 값 |
|---|---|
| Background | **`#0A0A0A`** 또는 **`#121212`** ("Deactivated CRT") |
| Foreground | **`#EAEAEA`** ("White phosphor") |
| Accent | **`#E61919`** 또는 **`#FF2A2A`** (동일 빨강, 동일 규칙) |
| Terminal Green (선택) | **`#4AF626`** — 단일 UI 요소에만 |

**레이아웃 (§5)**
- 테두리: "**`1px` or `2px solid`**"
- `<hr>`: "frequently **span the entire container width**"
- 라운드: **0** (90도 강제)
- 그리드: "Strict adherence to **CSS Grid** architectures"
- **Bimodal Density**: "Layouts oscillate between **extreme data density** (tightly packed monospace metadata clustered together) and **vast expanses of calculated negative space** framing macro-typography"

**컴포넌트·기호 (§6)**
- ASCII 프레이밍: `[ DELIVERY SYSTEMS ]`, `< RE-IND >`
- 방향 기호: `>>>`, `///`, `\\\\`
- 산업 마커: `®`, `©`, `™`
- 기술 자산: "crosshairs (**`+`**) at grid intersections, repeating vertical lines (barcodes), thick horizontal warning stripes, and **randomized string data** (e.g., **`REV 2.6`, `UNIT / D-01`**)"

**텍스처 (§7)**
- CRT 스캔라인 (원문 코드):
  ```css
  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)
  ```
- 하프톤/디더링: "CSS `mix-blend-mode: multiply` overlays combined with SVG radial dot patterns"
- 노이즈: "A global, **low-opacity** SVG static/noise filter applied to the **DOM root**"

**엔지니어링 지시 (§8) — 3항목**
1. **Grid Determinism**: "Utilize **`display: grid; gap: 1px;`** with contrasting parent/child background colors to generate mathematically perfect, razor-thin dividing lines **without complex border declarations**."
2. **Semantic Rigidity**: "Construct the DOM using precise semantic tags (**`<data>`, `<samp>`, `<kbd>`, `<output>`, `<dl>`**) to accurately reflect the technical nature of the telemetry."
3. **Typography Clamping**: "Implement CSS `clamp()` functions **exclusively for macro-typography**"

### 항목별 지침

**타이포그래피** — 이 스킬의 **주역**이다. "Typography is the primary structural and decorative infrastructure. **Imagery is secondary.**" 3계층 각각에 분류·폰트 후보·scale·tracking·leading·casing이 전부 명시. Macro와 Micro의 값이 **정반대 방향**으로 설정된 것이 특징: tracking은 `-0.03~-0.06em` vs `+0.05~0.1em`, leading은 `0.85~0.95` vs `1.2~1.4`, scale은 `clamp(4rem,10vw,15rem)` vs `10~14px`. 즉 **극단적 대비를 수치로 강제**.

**컬러** — 3색 체계 (배경/전경/빨강) + 선택적 초록 1개. 액센트를 단일화하고 용도를 3가지로 한정. 그라디언트·반투명·부드러운 그림자 금지. 순백/순흑 회피 (`#F4F4F0`, `#0A0A0A`). 대비 비율 수치는 **원문에 명시 없음** — 다만 `#050505` on `#F4F4F0`, `#EAEAEA` on `#0A0A0A` 조합은 매우 높은 대비.

**스페이싱** — spacing scale이 **원문에 없다.** 대신 두 가지 원리로 대체:
- `gap: 1px` (구분선 생성 기법)
- **Bimodal Density** — 극단적 밀집과 광대한 여백의 교차
"conventional web padding"을 명시적으로 거부하고 "visible compartmentalization"으로 대체.

**모션** — **원문에 지침이 전혀 없다.** 이 컬렉션의 스타일 스킬 3개 중 유일하게 모션 섹션이 부재. transition, animation, easing, duration 모두 언급 없음. (`minimalist-ui`는 §7 전체가 모션, `gpt-taste`는 §5 전체가 GSAP)

**레이아웃** — CSS Grid 절대 준수, radius 0, 1~2px 테두리로 구획, `<hr>` 전폭, 요소는 그리드 트랙에 앵커. 반응형 브레이크포인트는 **원문에 없음** (단 `clamp()`와 `10vw`가 유동성을 일부 담당).

**접근성** — **원문에 지침 없음.** 오히려 상충 요소가 다수:
- "Exclusively uppercase" (Macro + Micro 전부) — 전체 대문자는 가독성 저해
- Micro 타이포 `10px`~`14px` — 작은 크기
- 스캔라인 / 노이즈 / 1비트 디더링 오버레이 — 텍스트 위 텍스처
- ASCII 기호를 장식으로 사용 — 스크린리더 처리 미언급
- `®`/`©`/`™`를 "legal text가 아닌 구조적 기하 요소로" 사용 — 시맨틱 왜곡
긍정 요소: §8-2의 시맨틱 태그 강제(`<data>`, `<samp>`, `<output>`, `<dl>`)는 접근성에 기여.

### 지침을 주는 방식 자체

1. **배타적 선택 게이트 2개**: "Pick ONE per project and **commit to it**" + "**CRITICAL**: Choose ONE substrate palette". 이 스킬의 핵심 장치. 미학의 일관성을 **혼합 금지**로 확보한다. `minimalist-ui`(단일 미학 고정)나 `gpt-taste`(랜덤 선택)와 다른 세 번째 전략.
2. **출처(derivation)를 명시**: 각 원형에 "Derived from…"을 붙여 참조 계보를 밝힘 — 1960s corporate identity systems / heavy machinery blueprints / classified military databases / legacy mainframes / aerospace HUDs.
3. **극단적 대비를 수치로 구현**: Macro와 Micro의 tracking·leading·scale을 정반대로 설정. 감각적 "대비"를 수치 방향의 반대로 번역.
4. **하드웨어 한계의 시뮬레이션**: "Application of **simulated hardware limitations**" — 디지털의 완벽함을 결함으로 취급하고 아날로그 열화를 의도적으로 주입.
5. **기법(technique)까지 제공**: `gap: 1px` + 대비 배경색으로 1px 구분선을 만드는 트릭, `repeating-linear-gradient` 스캔라인 코드, `mix-blend-mode: multiply` + SVG dot 하프톤. **구현 방법을 규정에 포함.**
6. **기호 체계를 어휘로 제공**: ASCII 프레이밍(`[ ... ]`, `< ... >`), 방향(`>>>`, `///`), 마커(`®©™`), 십자선(`+`), 더미 데이터(`REV 2.6`, `UNIT / D-01`). 즉 **장식 어휘를 사전처럼 제공**.
7. **시맨틱 HTML을 미학에 편입**: `<data>`, `<samp>`, `<kbd>`, `<output>`, `<dl>` — "to accurately reflect the technical nature of the telemetry". 시맨틱 정확성을 미학적 일관성의 일부로 취급.
8. **선택 요소의 사용 조건 명시**: Terminal Green에 "단일 요소만 / 일반 텍스트 색 금지 / 목적 없으면 완전 생략"이라는 3중 제약. 즉 선택 사항에도 남용 방지 장치.
9. **참조 대상**: 브랜드명 대신 **시대·분야**로 지시 (1960s corporate identity, heavy machinery manuals, aerospace HUD, declassified blueprints). `web-design-engineer`(브랜드 25개 명시)와 `minimalist-ui`("top-tier workspace platforms")의 중간 방식.
10. **페르소나 부여**: "Advanced proficiency in architecting…" — 인칭이 아닌 역량 서술형.
11. **`minimalist-ui`와 동일한 문서 골격**: 두 스킬이 Meta → 제약/원형 → 타이포 → 컬러 → 레이아웃 → 컴포넌트 → 텍스처/모션 → 실행 지시의 같은 구조를 갖는다. 동일 저자·동일 템플릿의 산물로 보인다.

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**declassified blueprints**" (description) | 흑백+빨강 3색 + radius 0 + 1~2px 테두리 구획 + ASCII 프레이밍 + `REV 2.6` 더미 데이터 + 노이즈 필터 |
| "**raw functionality**" | 관습적 padding 거부 → 가시적 구획화, 요소가 그리드에 앵커 |
| "**mechanical precision**" | `border-radius` 0, 90도 코너, `display: grid; gap: 1px` |
| "**high data density**" | Micro 타이포 10~14px + 모노스페이스 지배 + tabular 데이터 |
| "**solid architectural blocks**" (글자 덩어리) | tracking `-0.03em ~ -0.06em` + leading `0.85 ~ 0.95` + uppercase |
| "**mechanical typewriter spacing / terminal matrices**" | tracking `+0.05em ~ 0.1em` |
| "**Matte, unbleached documentation paper**" | `#F4F4F0` / `#EAE8E3` |
| "**Carbon Ink**" | `#050505` ~ `#111111` |
| "**Aviation/Hazard Red**" | `#E61919` / `#FF2A2A` |
| "**Deactivated CRT**" | `#0A0A0A` / `#121212` (순흑 회피) |
| "**White phosphor**" | `#EAEAEA` |
| "**appearing purely digital**" (회피 대상) | 하프톤 / 1비트 디더링 / 스캔라인 / 전역 노이즈 |
| "**degrade vector perfection**" | 세리프에 하프톤·디더링 후처리 강제 |
| "**Unforgiving structural grids**" | 가시적 분할선 + 요소가 부유하지 않음 |
| "**viewport-bleeding numerals**" | `clamp(4rem, 10vw, 15rem)` |
| "**Bimodal Density**" | 밀집 모노스페이스 클러스터 ↔ 거대 여백 + 매크로 타이포의 교차 |
| "**razor-thin dividing lines**" | `gap: 1px` + 부모/자녀 배경색 대비 (테두리 선언 없이) |
| "**simulate active mechanical processes**" | 랜덤 문자열 데이터 (`REV 2.6`, `UNIT / D-01`) |

## 7. 산출물

- **형식**: 프론트엔드 코드. 프레임워크는 **원문에 명시 없음** (순수 CSS 속성으로 지침이 작성되어 Tailwind/React/Vue 모두 가능). §8이 "Web Engineering Directives"로 CSS Grid, 시맨틱 태그, `clamp()`를 요구.
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- 출력 형식·순서 규정 없음 (`gpt-taste`의 `<design_plan>` 같은 사전 검증 블록 부재).

## 8. 주의점 / 한계

- **접근성 위험이 가장 큰 스킬**: "Exclusively uppercase"를 Macro와 Micro 양쪽에 강제하고, Micro는 10~14px이며, 그 위에 스캔라인·노이즈·디더링 오버레이를 얹는다. 전체 대문자는 단어 형태 인식을 저해하고, 텍스처 오버레이는 대비를 떨어뜨린다. **원문에 접근성 언급이 전혀 없고 경고도 없다.** §8-2의 시맨틱 태그 강제가 유일한 긍정 요소.
- **모션 지침 전면 부재**: transition/animation/easing/duration이 하나도 없다. 인터랙티브 상태(hover/focus/active)도 언급되지 않는다. 대시보드 용도를 명시하면서 상호작용 피드백 지침이 없는 것은 실질적 공백이다.
- **상업 폰트 라이선스**: Macro 스택의 첫 항목 **Neue Haas Grotesk (Black)**와 **Monument Extended**가 상업 유료 폰트다. 라이선스·대체 안내가 **원문에 없다** (Archivo Black, Roboto Flex가 무료 대안으로 목록에 있으나 명시되지 않음).
- **`Inter`의 위치 충돌**: 이 스킬은 Macro 폰트로 "Inter (Extra Bold/Black)"을 허용한다. 그런데 같은 컬렉션의 `minimalist-ui`는 "DO NOT use the \"Inter\"... typefaces"로 금지하고, `gpt-taste`는 "**NEVER Inter**"라고 못박는다. **동일 컬렉션 내에서 같은 폰트에 대한 판정이 정면으로 갈린다.**
- **컬렉션 내 스타일 충돌**: `minimalist-ui`는 라운드 8~12px·파스텔·부드러운 모션·`rounded-full` 태그를 요구하고, 이 스킬은 radius 0·흑백빨강·모션 없음을 요구한다. `gpt-taste`는 mesh gradient·필수 GSAP를 요구한다. **description에 트리거 문구와 배타성 안내가 없어**, 두 개 이상이 동시 활성화되면 지침이 상호 모순한다.
- **텍스처 효과의 성능 비용**: 전역 SVG 노이즈 필터를 DOM root에 적용하고, `mix-blend-mode: multiply` 오버레이를 쓴다. 이는 렌더링 비용이 크며 특히 스크롤 중 성능 저하를 유발한다. **원문에 성능 언급이 없다.**
- **반응형 지침 부재**: `clamp()`와 `10vw`가 매크로 타이포의 유동성을 담당하지만, 모바일에서 "High-density tabular data"와 "gap: 1px 구획"이 어떻게 되는지는 **원문에 없다.** Micro 타이포 10px는 모바일에서 특히 문제가 될 수 있다.
- **이미지 처리 지침의 얕음**: "Imagery is secondary"라고 선언하고 하프톤/디더링 변환만 언급한다. 이미지가 필요한 경우의 플레이스홀더·소싱 지침이 **원문에 없다.**
- **다크/라이트 모드 토글 불가**: 기판 선택이 프로젝트 단위로 고정되며 "Never mix light and dark substrates within the same interface"이므로, 사용자 선택형 테마 토글이 구조적으로 배제된다. 이 제약의 근거는 미학적 일관성이지만, 실무 요구와 충돌할 수 있고 **대응 지침이 원문에 없다.**
- **강한 경고 지점**:
  - "**Pick ONE per project and commit to it. Do not alternate or mix both modes.**"
  - "**CRITICAL: Choose ONE substrate palette per project... Never mix light and dark substrates.**"
  - "**Gradients, soft drop shadows, and modern translucency are strictly prohibited.**"
  - "**Absolute rejection of `border-radius`.** All corners must be exactly 90 degrees."
  - "This is the **ONLY** accent color."
  - Terminal Green: "**never as a general text color**" / "**omit it entirely**"
  - "**Avoid pure `#000000`**"
  - "**Exclusively uppercase**"
  - "**Imagery is secondary.**"
  - "**deliberately discarding conventional consumer UI patterns**"
- **검증 장치**: **없다.** 체크리스트, 자체 점검, 사전 검증 블록, 실행 검증 모두 부재. `minimalist-ui`와 동일한 전략 — **처방의 구체성으로 품질을 확보하고 검증은 생략**. 다만 이 스킬은 배타적 게이트 2개가 일관성 위반을 사전에 차단하는 역할을 한다.
