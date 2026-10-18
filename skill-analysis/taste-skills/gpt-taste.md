# gpt-taste 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/gpt-taste/`
- **핵심 파일**: `SKILL.md` (7,857 bytes) — 단일 파일
- **보조 파일**: 없음
- **성격**: **Awwwards 급 프론트엔드 디자인 엔지니어링 지침**. 8개 섹션으로 구성된 강한 명령형 프롬프트. 핵심 전략은 **LLM의 통계적 편향을 명시적으로 지목하고 랜덤화로 깨뜨리는 것**.

원문 자기 규정: "CORE DIRECTIVE: AWWWARDS-LEVEL DESIGN ENGINEERING. You are an elite, award-winning frontend design engineer."

가장 특징적인 문장: "**Standard LLMs possess severe statistical biases**: they generate massive 6-line wrapped headings by using narrow containers, leave ugly empty gaps in bento grids, use cheap meta-labels (\"QUESTION 05\", \"SECTION 01\"), output invisible button text, and endlessly repeat the same Left/Right layouts. **Your goal is to aggressively break these defaults.**"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Elite UX/UI & Advanced GSAP Motion Engineer. Enforces Python-driven true randomization for layout variance, strict AIDA page structure, wide editorial typography (bans 6-line wraps), gapless bento grids, strict GSAP ScrollTriggers (pinning, stacking, scrubbing), inline micro-images, and massive section spacing."

**해석**: description에 "Use when…" 형태의 트리거 문구가 **없다.** 기능 목록만 열거되어 있어 활성화 조건이 명시적이지 않다. 매칭될 것으로 보이는 발화:
- "Awwwards 스타일 랜딩 페이지 만들어줘"
- "GSAP 스크롤 애니메이션 넣어줘"
- "bento grid로 기능 섹션"
- "고급스러운 히어로 섹션"
- 스킬 이름 자체가 짧고 일반적(`gpt-taste`)이라 명시적 호출로 쓰일 가능성이 높음

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- **마케팅 랜딩 페이지 / 에이전시 사이트 / 제품 소개 페이지** — AIDA 구조가 이 용도에 특화
- React + Tailwind + GSAP 스택 (지침이 이를 전제)
- 여러 번 생성해도 매번 다른 레이아웃을 원할 때 — §1의 랜덤화가 이 문제를 겨냥
- 강한 모션이 자산이 되는 페이지 — "Static interfaces are **strictly forbidden**"

**부적합 / 과한 상황**
- **기능성 UI (대시보드, 앱 내부 화면, 관리 도구)** — AIDA는 설득 구조이며 도구 UI와 맞지 않음. `py-32 md:py-48` 같은 거대 여백, 필수 GSAP, 이미지 필터는 정보 밀도가 필요한 화면에 부적합
- 접근성·성능이 중요한 제품 — 이 스킬에는 접근성 지침이 전혀 없고(§6 참조), `scale`·pin·scrub 애니메이션을 필수로 요구
- Tailwind / GSAP를 쓰지 않는 스택 — 지침 대부분이 Tailwind 클래스명과 GSAP API에 결합
- 실제 이미지 자산이 있는 프로젝트 — `picsum.photos` 플레이스홀더를 전제
- 모션을 절제해야 하는 맥락 — `emilkowalski` 컬렉션의 빈도 게이트와 정면 충돌 (§8 참조)

**형제 스킬 대신 이걸 고르는 기준**: 이 컬렉션 안에서 — 미니멀을 원하면 `minimalist-ui`, 브루탈리즘이면 `industrial-brutalist-ui`, 종합 프론트엔드 취향이면 `design-taste-frontend`, 브랜드 아이덴티티면 `brandkit`. 이 스킬은 **"모션 많은 어워드형 랜딩 페이지"**라는 좁고 뚜렷한 지점을 겨냥.

## 4. 외부 의존성

- **API 키**: **불필요.** 환경변수·API 호출 없음.
- **폴백 모드**: 해당 없음.
- **필요한 CLI/런타임/패키지** (생성 코드가 요구)
  - **React** — JSX 문법으로 예시가 작성됨
  - **Tailwind CSS** — `max-w-5xl`, `grid-flow-dense`, `py-32 md:py-48`, `group-hover:scale-105` 등 클래스명에 전면 의존
  - **GSAP** — 명시적으로 `@gsap/react`, `ScrollTrigger`. "You must write **real GSAP**"
  - **`@phosphor-icons/react`** — 마퀴 섹션의 아이콘 소스로 지정
  - 폰트: **Satoshi, Cabinet Grotesk, Outfit, Geist** 중 1개 (Inter 금지)
- **네트워크**: `https://picsum.photos/seed/{keyword}/1920/1080` 이미지 로드에 필요. 폰트 로딩에도 필요.
- **비용 발생 지점**: 유료 API 없음.
- **"Python 실행"의 실체**: §1이 "You MUST **simulate** a Python script execution"이라고 명시 — 실제 Python 런타임이 아니라 **`<design_plan>` 안에서 시뮬레이션한 출력**을 쓰라는 것. 즉 Python 의존성은 없다.

## 5. 워크플로우

### 게이트 0. 필수 사전 비행 `<design_plan>` (§8) — **코드 작성 전 강제**
"Before writing **ANY** React/UI code, you MUST output a `<design_plan>` block containing:"
1. **Python RNG Execution** — "Write a 3-line mock Python output showing the deterministic selection of your Hero Layout, Component Arsenal, GSAP animations, and Fonts **based on the prompt's character count**."
2. **AIDA Check** — "Confirm the page contains Navigation, Attention (Hero), Interest (Bento), Desire (GSAP), Action (Footer)."
3. **Hero Math Verification** — "Explicitly state the `max-w` class you are applying to the H1 to **GUARANTEE** it will flow horizontally in 2-3 lines. Confirm NO stamp icons or spam tags exist."
4. **Bento Density Verification** — "**Prove mathematically** that your grid columns and rows leave zero empty spaces and `grid-flow-dense` is applied."
5. **Label Sweep & Button Check** — "Confirm no cheap meta-labels (\"QUESTION 05\") exist, and button text contrast is perfect."

"**Only output the UI code after this rigorous verification is complete.**"

### 1단계 — Python 구동 진짜 랜덤화 (§1)
"LLMs are inherently lazy and always pick the first layout option. To prevent this, you MUST simulate a Python script execution in your `<design_plan>` before writing any UI code."

시드: "Use a **deterministic seed** (e.g., character count of the user prompt modulo math) to simulate `random.choice()`"

**엄격히 선택할 4가지**:
- 1 Hero Architecture (§3에서)
- 1 Typography Stack (Satoshi, Cabinet Grotesk, Outfit, or Geist. **NEVER Inter**)
- 3 Unique Component Architectures (§6에서)
- 2 Advanced GSAP Paradigms (§5에서)

"You are **forbidden from defaulting to the same UI twice**. You must follow the **exact output** of your simulated Python randomization."

→ 앞 단계(랜덤화 결과)가 뒤 단계(실제 코드)를 구속하는 구조. 즉 **자기 선택을 문서화해 이탈을 막는** 장치.

### 2단계 — AIDA 구조 배치 (§2)
"Every page MUST begin with a highly creative, premium Navigation Bar (e.g., floating glass pill, or minimal split nav)."

| AIDA | 내용 |
|---|---|
| **Attention (Hero)** | "Cinematic, clean, wide layout" |
| **Interest (Features/Bento)** | "High-density, mathematically perfect grid or interactive typographic components" |
| **Desire (GSAP Scroll/Media)** | "Pinned sections, horizontal scroll, or text-reveals" |
| **Action (Footer/Pricing)** | "Massive, high-contrast CTA and clean footer links" |

### 3단계 — Hero 구축 (§3)
랜덤화가 배정한 3개 옵션 중 하나 (아래 §6 참조)

### 4단계 — Bento Grid (§4)
`grid-flow-dense` 필수 + 수학적 검증

### 5단계 — GSAP 모션 (§5)
5가지 패러다임 중 랜덤화가 배정한 2개

### 6단계 — 컴포넌트 무기고 (§6)
4가지 중 랜덤화가 배정한 3개

### 7단계 — 콘텐츠·자산·금지 스윕 (§7)

**사용자 확인 요구 지점**: **없음.** `<design_plan>`은 사용자 승인용이 아니라 자기 검증용이며, 그 직후 바로 코드를 출력한다.

## 6. 디자인 지침 분석

### 금지 규칙 (anti-pattern) — 원문 그대로

**LLM 편향 목록 (스킬의 출발점)**
"they generate massive 6-line wrapped headings by using narrow containers, leave ugly empty gaps in bento grids, use cheap meta-labels (\"QUESTION 05\", \"SECTION 01\"), output invisible button text, and endlessly repeat the same Left/Right layouts."

**전역 금지**
- "**DO NOT USE EMOJIS IN YOUR CODE, COMMENTS, OR OUTPUT.** Maintain strictly professional formatting."
- "You are **forbidden from defaulting to the same UI twice**."
- 폰트: "**NEVER Inter**"

**Hero 금지 (§3)**
- "The H1 **MUST NEVER exceed 2 to 3 lines**. 4, 5, or 6 lines is a **catastrophic failure**."
- "It must **NOT** be a narrow, 6-line text wall."
- "**Invisible text is a failure.**" (버튼 대비)
- "**BANNED IN HERO:** Do NOT use arbitrary floating stamp/badge icons on the text. Do NOT use pill-tags under the hero. Do NOT place raw data/stats in the hero."

**Grid 금지 (§4)**
- "**Zero Empty Space in Grids:** LLMs notoriously leave blank, dead cells in CSS grids."
- "**No grid shall have a missing corner or empty void.**"
- "Do not use too many cards. **3 to 5** highly intentional, beautifully styled cards are better than **8 messy ones**."

**모션 금지 (§5)**
- "**Static interfaces are strictly forbidden.**"

**콘텐츠 금지 (§7)**
- "**The Meta-Label Ban:** BANNED FOREVER are labels like \"SECTION 01\", \"SECTION 04\", \"QUESTION 05\", \"ABOUT US\". **Remove them entirely. They look cheap and unprofessional.**"
- 이미지: 필터를 적용해 "**so they do not look like boring stock photos**"
- 배경: "**Avoid flat, boring colors.**"

**간격 금지 (§2)**
- "**Do not cramp elements together.**"

### 강제 규칙 — 수치 인용

**타이포그래피**
- H1 라인 수: **2~3줄** 상한. "4, 5, or 6 lines is a catastrophic failure"
- H1 컨테이너: "ultra-wide containers for the H1 (e.g., **`max-w-5xl`, `max-w-6xl`, `w-full`**)"
- H1 크기: **`clamp(3rem, 5vw, 5.5rem)`**
- 폰트 스택 (4개 중 1개): **Satoshi / Cabinet Grotesk / Outfit / Geist**

**스페이싱**
- 섹션 간 수직 패딩: **`py-32 md:py-48`**. "Sections must feel like distinct, cinematic chapters."

**그리드**
- `grid-flow-dense` (`grid-auto-flow: dense`) — "on **every** Bento Grid"
- 카드 수: **3~5개** (8개는 "messy")
- "You must **mathematically verify** that your `col-span` and `row-span` values interlock perfectly."

**모션 (§5, 5개 패러다임)**
- **Hover Physics**: "`group-hover:scale-105 transition-transform duration-700 ease-out` inside `overflow-hidden` containers" — 모든 클릭 가능한 카드·이미지에
- **Scroll Pinning (GSAP Split)**: "Pin a section title on the left (`ScrollTrigger pin: true`) while a gallery of elements scrolls upwards on the right side."
- **Image Scale & Fade Scroll**: "Images must start small (**`scale: 0.8`**). As they scroll into view, they grow to **`scale: 1.0`**. As they scroll out of view, they smoothly darken and fade out (**`opacity: 0.2`**)."
- **Scrubbing Text Reveals**: "Opacity of central paragraph words starts at **0.1** and scrubs to **1.0** sequentially as the user scrolls."
- **Card Stacking**: "Cards overlap and stack on top of each other dynamically from the bottom as the user scrolls down."

**이미지**
- 소스: **`https://picsum.photos/seed/{keyword}/1920/1080`** — "match the keyword to the vibe"
- 필터: "**`grayscale`, `mix-blend-luminosity`, `opacity-90`, `contrast-125`**"

**인라인 타이포그래피 이미지 (§6)** — 코드까지 명시
```jsx
I shape <span className="inline-block w-24 h-10 rounded-full align-middle bg-cover bg-center mx-2" style={{backgroundImage: 'url(...)'}}></span> digital spaces.
```

**수평 스크롤 방지**
- "Wrap the entire page in **`<main className=\"overflow-x-hidden w-full max-w-full\">`**"

**버튼 대비**
- "Dark background = white text. Light background = dark text."

### 항목별 지침

**타이포그래피**
- 4개 폰트 스택 중 랜덤 1개, Inter 금지
- H1 2~3줄 철칙 + 초광폭 컨테이너 + `clamp(3rem, 5vw, 5.5rem)`
- "wide editorial typography" (description)
- Bento 카드에 "dense typography" 허용
- 인라인 이미지를 거대 헤딩 **안에** 삽입 (`w-24 h-10 rounded-full`)
- 마퀴에 "large typography" 옵션

**컬러**
- 팔레트 값 지침은 **원문에 명시 없음.** 색 자체보다 처리 방식만 규정:
  - 버튼 대비 (다크 배경↔흰 텍스트)
  - "Creative Backgrounds: Inject subtle, professional ambient design. Use **deep radial blurs, grainy mesh gradients, or shifting dark overlays**."
  - 이미지에 `grayscale` / `mix-blend-luminosity` / `contrast-125`
  - Hero 배경: "full-bleed background image with a **dark radial wash**"
  - CTA: "**high-contrast**"
- 대비 비율(WCAG) 수치는 **원문에 명시 없음** — "perfectly legible" / "perfect"라는 감각어로만

**스페이싱**
- 섹션 간 `py-32 md:py-48` (유일한 명시 수치)
- "massive section spacing" (description), "massive negative space" (Editorial Split)
- spacing scale 체계는 **원문에 명시 없음** (Tailwind 기본 스케일 전제)

**모션**
- 필수 (Static 금지), GSAP + ScrollTrigger 실사용
- 5개 패러다임 중 2개를 랜덤 선택
- 구체값: `duration-700 ease-out`, `scale: 0.8→1.0`, `opacity: 0.2` / `0.1→1.0`
- `prefers-reduced-motion` 언급 **없음**

**레이아웃**
- AIDA 5부 구조 (Nav + Attention + Interest + Desire + Action) 필수
- Hero 3옵션:
  1. *Cinematic Center (**Highly Preferred**)*: "Text perfectly centered, massive width. Below the text, **exactly two** high-contrast CTAs. Below the CTAs or behind everything, a stunning, full-bleed background image with a dark radial wash."
  2. *Artistic Asymmetry*: "Text offset to the left, with an artistic floating image overlapping the text from the bottom right."
  3. *Editorial Split*: "Text left, image right, but with **massive negative space**."
- Bento: `grid-flow-dense` + 수학적 인터록 + 3~5 카드
- 컴포넌트 무기고 4개: Inline Typography Images / Horizontal Accordions("Vertical slices that expand horizontally on hover") / Infinite Marquee / Feedback·Testimonial Carousel
- `overflow-x-hidden` 래핑

**접근성**
- **원문에 지침 없음.** 유일하게 근접한 것이 버튼 텍스트 가독성("Invisible text is a failure")과 CTA 고대비. `prefers-reduced-motion`, 키보드 내비게이션, 포커스 상태, alt 텍스트, ARIA 모두 **언급 없음.** 필수 GSAP 스크롤 애니메이션과 결합하면 접근성 위험이 큰 구조.

### 지침을 주는 방식 자체

1. **LLM 편향을 명시적으로 지목**: 이 스킬의 핵심 방법론. "Standard LLMs possess severe statistical biases"로 시작해 6개 구체적 실패(6줄 헤딩, 빈 그리드 셀, 싸구려 메타라벨, 안 보이는 버튼 텍스트, Left/Right 반복)를 열거하고 각각에 대응하는 섹션을 배치. **모델의 알려진 실패를 지침의 골격으로 사용.**
2. **랜덤화를 자기 구속 장치로**: "LLMs are inherently lazy and always pick the first layout option." → 시뮬레이션한 `random.choice()` 결과를 먼저 문서화하고 그것을 따르게 함. 창의성을 **의지가 아니라 절차**로 확보하려는 시도.
3. **결정론적 시드 지정**: "character count of the user prompt modulo math" — 재현 가능하면서 프롬프트마다 달라지는 값.
4. **사전 비행 검증 블록 (`<design_plan>`)**: 코드 작성 전 5항목 검증. 특히 "**Prove mathematically**"(그리드)와 "Explicitly state the `max-w` class"(H1)처럼 **검증 결과를 텍스트로 남기게** 함.
5. **철칙(iron rule) 명명**: "THE 2-LINE IRON RULE", "THE GAPLESS BENTO GRID", "The Meta-Label Ban" — 규칙에 이름을 붙여 각인.
6. **실패의 강도 표현**: "catastrophic failure", "BANNED FOREVER", "strictly forbidden", "Invisible text is a failure".
7. **구체적 Tailwind 클래스 제공**: 지침을 즉시 코드로 옮길 수 있게 클래스명을 직접 명시.
8. **참조 대상 제시**: **Awwwards** (기준선). 개별 브랜드/디자이너 참조는 없음.
9. **선호도 명시**: Hero 옵션 1에 "(Highly Preferred)" — 랜덤화를 요구하면서도 편향을 삽입한 지점.
10. **페르소나 부여**: "You are an elite, award-winning frontend design engineer."

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**AWWWARDS-LEVEL**" | AIDA 구조 + 필수 GSAP(5개 패러다임 중 2개) + `py-32 md:py-48` + gapless bento + 2~3줄 H1 + 4개 폰트 스택 |
| "**The Hero must breathe**" | `max-w-5xl`/`max-w-6xl`/`w-full` + `clamp(3rem, 5vw, 5.5rem)` + H1 2~3줄 |
| "**cinematic**" | 섹션 간 `py-32 md:py-48` — "Sections must feel like distinct, cinematic chapters" |
| "**cheap and unprofessional**" | "SECTION 01" / "QUESTION 05" / "ABOUT US" 메타라벨 |
| "**boring stock photos**" | `grayscale` / `mix-blend-luminosity` / `opacity-90` / `contrast-125` 필터로 처리 |
| "**flat, boring colors**" | "deep radial blurs, grainy mesh gradients, or shifting dark overlays" |
| "**high-end assets**" | picsum seed 키워드를 vibe에 맞추기 + 필터 적용 |
| "**mathematically flawless**" | `grid-flow-dense` + `col-span`/`row-span` 인터록 검증 |
| "**premium**" (Nav) | "floating glass pill, or minimal split nav" |
| "**perfectly legible**" (버튼) | "Dark background = white text. Light background = dark text." |
| "**messy**" | 카드 8개 vs "3 to 5 highly intentional" |
| "**inherently lazy**" (LLM) | 첫 번째 레이아웃 옵션을 항상 고르는 습성 → 랜덤화로 차단 |

## 7. 산출물

- **형식**: React + Tailwind + GSAP 코드. 그 앞에 `<design_plan>` 블록.
- **출력 순서 (강제)**: `<design_plan>` (5항목 검증) → UI 코드. "Only output the UI code after this rigorous verification is complete."
- **파일 저장 위치 / 네이밍 규칙**: **원문에 명시 없음.**
- **금지 형식**: 이모지 (코드·주석·출력 전체)

## 8. 주의점 / 한계

- **"Python 실행"이 실제 실행이 아니다**: 시뮬레이션이므로 진짜 무작위성이 없다. "deterministic seed (character count ... modulo math)"라고 명시하지만, 모델이 자신의 편향에서 실제로 벗어나는지를 보장하는 장치는 아니다. 결국 **모델이 스스로 "랜덤한 결과"라고 선언하는 것**에 의존한다. 이 스킬의 핵심 메커니즘이 원리적으로 가장 취약한 지점.
- **Hero 옵션 1이 "Highly Preferred"로 표시된 자기모순**: 랜덤화로 편향을 깨겠다면서 특정 옵션에 선호를 붙였다. 실질적으로 옵션 1로 수렴할 가능성이 있다.
- **접근성 지침의 전면 부재**: `prefers-reduced-motion`, 포커스, 키보드, alt, ARIA 모두 없다. 동시에 GSAP pin/scrub/scale 애니메이션을 필수화한다. 이 조합은 접근성 관점에서 위험하며, **원문에 경고가 없다.**
- **`emilkowalski` 컬렉션과의 정면 충돌**: 그쪽은 "Should this animate at all?" 빈도 게이트로 시작해 모션 삭제를 1순위 처방으로 두고 UI 모션을 300ms 이하로 제한한다. 이 스킬은 "Static interfaces are strictly forbidden" + `duration-700` + 필수 스크롤 모션이다. **두 컬렉션을 함께 쓰면 판정이 정반대로 갈린다.** (적용 대상이 다르다 — 마케팅 페이지 vs 제품 UI — 는 점이 완화 요인이지만, 원문에 이 구분이 없다.)
- **성능 고려 부재**: 모든 카드에 hover scale, 스크롤마다 GSAP 트리거, `mix-blend-mode`, `backdrop`/radial blur, 1920×1080 이미지 다수. 성능 예산·측정에 대한 언급이 **원문에 없다.**
- **`picsum.photos` 의존**: 플레이스홀더 이미지 서비스에 네트워크로 의존한다. 실제 브랜드 자산이 있는 프로젝트에서의 처리는 **원문에 명시 없음.** (`web-design-engineer`의 Asset Protocol과 정반대 태도 — 그쪽은 실물 자산이 없으면 정지하라고 한다.)
- **폰트 4개의 라이선스·가용성**: Satoshi, Cabinet Grotesk는 Fontshare, Outfit·Geist는 Google Fonts/Vercel. 로딩 방법이나 라이선스는 **원문에 명시 없음.**
- **AIDA의 범용 강제**: 모든 페이지에 AIDA를 요구하므로 도구형 UI나 문서 페이지에 부적합. 예외 처리가 **원문에 없다.**
- **description에 트리거 문구 없음**: "Use when…"이 없어 언제 활성화되는지 불명확. 이 컬렉션의 다른 스타일 스킬(minimalist-ui, industrial-brutalist-ui)과 동시 활성화될 위험이 있으며, 그 경우 지침이 충돌한다 (미니멀 vs 모션 필수).
- **강한 경고 지점**:
  - "**DO NOT USE EMOJIS IN YOUR CODE, COMMENTS, OR OUTPUT.**"
  - "**NEVER Inter**"
  - "The H1 **MUST NEVER exceed 2 to 3 lines**. 4, 5, or 6 lines is a **catastrophic failure**."
  - "**BANNED FOREVER** are labels like \"SECTION 01\" ... \"ABOUT US\""
  - "**Static interfaces are strictly forbidden.**"
  - "You are **forbidden from defaulting to the same UI twice**."
  - "**Only output the UI code after this rigorous verification is complete.**"
- **검증 장치**: `<design_plan>` 5항목이 유일한 검증이며 **전부 자기 선언**이다. 실행 가능한 검증(빌드, 타입체크, 브라우저 확인)이 없어, "Prove mathematically that your grid ... leave zero empty spaces" 같은 요구도 텍스트 주장에 그친다. garden-skills의 `tsc --noEmit`이나 browser-acceptance와 대비되는 약점.
