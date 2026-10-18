# prototype 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/prototype/`
- **핵심 파일**: `SKILL.md` (7,488 bytes)
- **보조 파일**: `PICKER.md` (7,548 bytes) — 프로토타입 전환용 UI(피커)의 마크업·CSS·키보드 동작·참조 구현을 **verbatim 복사 대상**으로 규정
- **성격**: **발산(divergence) 스킬**. 하나의 UI 브리프에 대해 서로 다른 방향의 변형 3–5개를 만들고, 실행 가능한 피커 뒤에 배치해 사용자가 직접 넘겨보며 고르게 한다.

원문 자기 규정: "A divergence skill. It does ONE thing: take a described piece of UI ... build several genuinely different versions of it, and put them behind a visual picker so the user can flip through them live and choose a winner."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter 원문:
```yaml
name: prototype
description: Build multiple genuinely different versions of a UI piece you describe, rendered behind a visual picker so you can flip through them live and promote the one that feels right. Only runs when explicitly invoked; it does not trigger on its own.
disable-model-invocation: true
```

**`pick-ui-library`와 함께 이 컬렉션에서 `disable-model-invocation: true`가 설정된 2개 스킬 중 하나.** 자동 활성화되지 않는다.

**매칭되는 사용자 발화** (명시적 호출 필요)
- `/prototype a toast`, `/prototype the pricing card`, `/prototype a hold-to-delete button`
- Invocation Variants: `<description> x5`, `riff <variant>`, `keep <variant>`, `keep <variant>, leave the picker`

**왜 자동 호출을 막았는가**: 원문에 이유 명시 없음. 다만 이 스킬은 파일을 여러 개 생성하고 프로토타입 라우트를 만들며 dev server를 전제하므로, 부작용이 큰 작업을 의도치 않게 시작하는 것을 막는 설계로 읽힌다.

`allowed-tools` / `metadata`: **원문에 명시 없음.**

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 방향이 아직 정해지지 않은 UI 조각 — "히어로 섹션을 어떤 톤으로 갈지 모르겠다", "이 카드의 밀도를 어느 정도로 할지"
- **코드로만 판단할 수 없는 감각**이 결정 요인일 때 — 이 컬렉션의 다른 스킬들이 반복해 "feel can't be judged from code"라고 말하는 지점을 실제 실행 가능한 비교로 해결
- 이해관계자에게 선택지를 보여주고 결정을 받아야 할 때 — 산출물이 URL/파일로 남고 트레이드오프 표가 함께 제공됨
- 프로젝트가 없는 상태에서의 탐색 — Phase 2가 "no project" 분기를 명시 (standalone HTML)

**부적합 / 과한 상황**
- 정답이 하나뿐인 과제 — 발산할 축이 없으면 이 스킬의 가치가 0. 원문: "three tints of the same idea waste the picker"
- 여러 컴포넌트를 동시에 ("the dashboard") — Phase 1이 **강제로 좁힘**: "One thing per run."
- 기존 UI 비평 → `review-animations` / 수정 계획 → `improve-animations` / 의존성 선택 → `pick-ui-library` (본문이 명시적으로 배제)
- 즉시 프로덕션 코드에 반영하고 싶을 때 — 하드룰 1이 탐색 중 프로덕션 코드 수정을 금지. 통합은 Phase 6에서만.
- 6개 이상의 변형 — "More than 5 dilutes the comparison." (상한 5)

**형제 스킬 대신 이걸 고르는 기준**: 문제가 **"어느 방향으로 갈지 모른다"**인가. 방향이 정해졌으면 `animate`로 바로 구현.

## 4. 외부 의존성

- **API 키**: **불필요.** 환경변수·외부 서비스 없음.
- **폴백 모드**: 프로젝트가 없을 때 → standalone 단일 HTML 파일 브랜치. "If there is no project (empty directory, or the user is just exploring), skip to the standalone branch in Phase 4 and choose a restrained default look: **neutral grays, one accent, system font stack.**"
- **필요한 CLI/런타임/패키지**:
  - **dev server** (프로젝트 브랜치) — 프로토타입 라우트를 띄우기 위해
  - 프로젝트의 프레임워크·스타일링 시스템 (Phase 2에서 파악)
  - **브라우저 도구 (선택)** — "If browser tooling are available, screenshot each variant." 즉 스크린샷은 조건부
  - standalone 브랜치는 브라우저만 필요 (인라인 CSS/JS)
- **네트워크**: 불필요.
- **비용 발생 지점**: 없음.
- **PICKER.md 의존**: 피커 구현은 이 파일을 **반드시 로드**해야 함 — "load it now and build exactly that."

## 5. 워크플로우

### 하드룰 (5개)
1. "**Never touch production code during exploration.** Everything lives in an isolated prototype surface (see Phase 4). Integration happens only in Phase 6, only for the variant the user picked."
2. "**Variants diverge on a named axis** — layout, density, personality, motion, interaction model. Before building, you must be able to state each variant's axis in a phrase. **Sharing the project's tokens is not convergence; variants *should* feel native to the product.**"
3. "**Every variant fully works.** Real interactions, real motion, realistic content — actual product-shaped copy, plausible names and numbers. **No lorem ipsum, no dead buttons, no \"imagine this part\".**"
4. "**The picker is chrome, not a contestant.** Its exact markup, styles, and behavior are specified in [PICKER.md](PICKER.md) — copy them verbatim. **Its look is not a design decision and never adapts to the project.**"
5. "**Clean up after the choice.** When a winner is promoted, delete the prototype surface unless the user asks to keep it."

### Phase 1 — Scope — **게이트 (범위 축소 강제)**
"One thing per run." 설명이 여러 컴포넌트에 걸치면 **좁힐 의무**: "pick the single highest-leverage piece, say which and why, and offer the rest as follow-up runs."
산출물: 한 문장 브리프 재진술 — "what the thing is, where it will live, what it must do."

### Phase 2 — Recon — **분기 (프로젝트 유무)**
"Before designing anything, map the ground the variants must stand on":
- **Stack**: framework, styling system (Tailwind, CSS modules, vanilla), motion library
- **Tokens**: colors, radii, spacing, fonts, easing/duration variables — "every variant should look like it could ship in this product tomorrow"
- **Personality**: playful consumer app or crisp dashboard? — "**This bounds how far the boldest variant may go.**"
- **Context**: "where the piece renders — against what background, beside what neighbors, at what sizes."

→ Recon의 4개 산출물이 Phase 3(어디까지 대담해질 수 있는지)과 Phase 4(어떤 맥락에 렌더할지)의 입력이 됨.

**분기**: 프로젝트 없음 → Phase 4의 standalone 브랜치 + 절제된 기본값(neutral grays, one accent, system font stack)

### Phase 3 — Choose directions — **게이트 (코드 작성 전)**
- 기본 **3개**, 사용자 요청 또는 넓은 설계 공간이면 최대 **5개**. "More than 5 dilutes the comparison."
- **코드 작성 전에** 세트를 나열: 각 변형의 **이름 + 축(axis)**
- 이름 규칙: "Names describe the direction — \"Quiet\", \"Editorial\", \"Playful\", \"Dense\" — **never \"Option A/B/C\"**."
- 수렴 검사: "If two proposed directions would differ only in accent color or copy, **they are one direction**; replace one with a real alternative (different layout, different interaction model, different motion story)."
- **Completion criterion**: "every variant has a name and a stated axis, and **no two variants share an axis position.**"

### Phase 4 — Build the picker harness — **분기 2개**
- **프로젝트 + dev server**: 격리된 라우트/페이지 (`/prototypes/<slug>` 또는 프레임워크 등가물), 변형당 파일 1개 + 작은 harness 파일. "**Nothing imports from the prototype surface into production code.**"
- **프로젝트 없음 / static**: 인라인 CSS/JS를 가진 **단일 자기완결 HTML 파일**

피커는 PICKER.md에서 verbatim. harness 요구사항:
- "render **one variant at a time, full size, in realistic surrounding context** — a toast needs a page behind it, a card needs siblings, a button needs a form."
- 금지: "**Side-by-side thumbnails distort spacing and scale; never judge UI at postage-stamp size.**"
- 전환 속도: "Switching is **instant** — flipping is a 100+/session action; **by the frequency rule the variant swap gets no animation.**" → **자기 컬렉션의 빈도 규칙을 자기 도구에 적용한 사례**

### Phase 5 — Verify and hand off — **사용자 확인 지점 (명시)**
- "Run the harness. Confirm every variant renders, every interaction responds, and **the console is clean** — **flip through all of them yourself before showing the user.**"
- 조건부: "If browser tooling is available, screenshot each variant."
- 표로 제시하고 **정지**: "**stop — the choice belongs to the user**"
  ```
  | # | Variant | Axis | When it's the right choice | Its cost |
  ```
  원문 예시:
  | 1 | Quiet | Minimal motion, borders over shadows | The product is a daily-use tool | Least memorable |
  | 2 | Editorial | Large type, generous whitespace | The moment deserves weight | Eats vertical space |
- 마감: "where the picker is running (URL or file path) and the keys to flip."
- **Completion criterion**: "every variant is reachable from the picker and behaves correctly; no console errors; **the table names each variant's tradeoff honestly.**"

### Phase 6 — Promote on selection
- 선택된 변형을 "following the project's existing conventions (file layout, naming, token usage)"에 맞춰 통합, 그 후 하드룰 5에 따라 프로토타입 표면 삭제
- 또는 다시 발산: "keep the harness and run Phase 3 again, **diverging *around* the direction they gravitated to.**"

### Invocation Variants

| Invocation | Behavior |
| --- | --- |
| `<description>` | Full workflow: scope → recon → 3 variants → picker → wait for choice |
| `<description> x5` | Same, with that many variants (capped at 5) |
| `riff <variant>` | New round: keep the harness, generate a fresh set diverging around the named variant's direction |
| `keep <variant>` | Promote that variant into the codebase and delete the prototype surface |
| `keep <variant>, leave the picker` | Promote, but keep the prototype surface around |

## 6. 디자인 지침 분석

이 스킬의 디자인 지침은 **두 층위**로 나뉜다: (a) 변형이 지켜야 할 크래프트 기준(다른 스킬에서 상속), (b) **피커 자체의 완전 규격**(이 스킬 고유).

### 금지 규칙 (anti-pattern) — 원문 그대로

**발산에 관한 금지**
- "**three tints of the same idea waste the picker** — the user learns nothing by flipping between them."
- "**Divergence is not an excuse to drop the craft bar.**"
- "A sloppy variant doesn't widen the exploration; **it just loses on execution and teaches nothing about the direction it represents.**"
- "never \"Option A/B/C\""
- "If two proposed directions would differ only in accent color or copy, they are one direction"
- "More than 5 dilutes the comparison."
- "**No lorem ipsum, no dead buttons, no \"imagine this part\".**"
- "**Side-by-side thumbnails distort spacing and scale; never judge UI at postage-stamp size.**"
- "Nothing imports from the prototype surface into production code."
- Tone: "**Never pre-pick a favorite in the table**"
- Tone: "If two variants converged while you built them, **cut one and say so**: a picker with two truly distinct directions beats one padded to three."

**피커에 관한 금지 (PICKER.md)**
- "The picker's appearance is **not a design decision** — it is this spec."
- "**Do not restyle it with the project's tokens, fonts, or colors.**"
- "**Verbatim.** These values are the spec. **No project fonts, no brand colors, no theme switching, no extra shadows or borders.**"
- "**One allowed modification:** ... set `data-position=\"top\"` ... **Nothing else about it may move or change.**"
- 키 이벤트: "Ignore key events when focus is in an input, textarea, select, or contenteditable, or when a modifier is held."

**상속된 크래프트 금지 (Operating Posture)**
"right easing (`ease-out` on entrances, **never `ease-in`**), sub-300ms UI motion, correct `transform-origin`, `transform`/`opacity` only, reduced-motion handled."

### 강제 규칙 — 수치 인용

**변형에 요구되는 값 (컬렉션 공통 상속)**
- entrances에 `ease-out`, `ease-in` 금지
- UI 모션 **sub-300ms**
- `transform-origin` 정확히
- `transform`/`opacity`만
- reduced-motion 처리

**변형 개수**: 기본 3, 상한 5

**피커의 정확한 수치 (PICKER.md, 전부 verbatim 강제)**
```css
.proto-picker {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  z-index: 2147483647;
  gap: 2px; padding: 4px; border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px; line-height: 1;
}
.proto-picker-highlight { top: 4px; height: 28px; border-radius: 999px; background: rgba(255,255,255,0.12); will-change: transform; }
.proto-picker[data-ready] .proto-picker-highlight {
  transition: transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
              width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}
.proto-picker-item {
  height: 28px; padding: 0 12px; border-radius: 999px;
  color: rgba(255, 255, 255, 0.55);
  transition: color 150ms ease-out;
}
.proto-picker-item:hover { color: rgba(255, 255, 255, 0.85); }
.proto-picker-item:active { transform: scale(0.97); }
.proto-picker-item:focus-visible { outline: 2px solid rgba(255,255,255,0.4); outline-offset: 2px; }
.proto-picker-item[data-active] { color: #fff; }
.proto-picker-divider { width: 1px; height: 16px; margin: 0 4px; background: rgba(255,255,255,0.12); }
.proto-picker-replay { padding: 0 10px; font-size: 14px; }
.proto-picker[data-position="top"] { bottom: auto; top: 24px; }
@media (prefers-reduced-motion: reduce) { .proto-picker[data-ready] .proto-picker-highlight { transition: none; } }
```
주목: 하이라이트 전환 곡선이 컬렉션의 `--ease-out` 토큰값(`cubic-bezier(0.23, 1, 0.32, 1)`)과 **동일**, duration 250ms(300ms 상한 내), press 피드백 `scale(0.97)`, hover는 색만 — 즉 **피커 자체가 컬렉션 규칙의 시연물**이다.

**standalone 기본 룩 (프로젝트 없을 때)**: "neutral grays, one accent, system font stack"

### 항목별 지침

- **타이포그래피**: 피커에 한해 `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` / `13px` / `line-height: 1` / `-webkit-font-smoothing: antialiased`. 변형의 타이포그래피 지침은 **원문에 없음** (프로젝트 토큰을 따르라는 지시만).
- **컬러**: 피커는 다크 글래스 고정 — `rgba(10,10,10,0.82)`. 이유가 명시됨: "**Dark glass works on top of any page — light or dark — which is why it is not theme-aware.**" 변형의 컬러는 프로젝트 토큰. standalone은 "neutral grays, one accent".
- **스페이싱**: 피커에 한해 `bottom: 24px`, `padding: 4px`, `gap: 2px`, `padding: 0 12px`, divider `margin: 0 4px`. 변형용 spacing scale은 **원문에 없음.**
- **모션**: 피커 하이라이트만 애니메이트(250ms, strong ease-out), **변형 전환은 무애니메이션**. 근거: "flipping is a 100+/session action; by the frequency rule the variant swap gets no animation." 변형 내부 모션은 컬렉션 규칙 상속.
- **레이아웃**: 피커는 floating dark pill, bottom-center 고정, `z-index: 2147483647`. 변형은 "one variant at a time, full size, in realistic surrounding context."
- **접근성**: 피커에 `aria-label="Prototype variants"`, `aria-current="true"`(정확히 1개), `aria-hidden="true"`(highlight, divider), `aria-label="Replay animation (R)"`, `:focus-visible` 아웃라인, `prefers-reduced-motion` 대응. 변형도 reduced-motion 처리 의무.

### 지침을 주는 방식 자체

1. **페르소나 부여**: "You are a senior design engineer **running a design exploration.**"
2. **스킬의 실패 조건을 먼저 정의**: "The entire value of this skill is **divergence**: three tints of the same idea waste the picker."
3. **완료 기준(completion criterion)을 단계마다 명시**: Phase 3과 Phase 5에 각각 검증 가능한 종료 조건. 이 컬렉션에서 "completion criterion"을 명시하는 유일한 스킬.
4. **축(axis) 개념으로 발산을 조작화**: layout / density / personality / motion / interaction model. "you must be able to state each variant's axis **in a phrase**." + "no two variants share an axis position."
5. **이름으로 방향을 강제**: "Quiet", "Editorial", "Playful", "Dense" — 옵션 A/B/C 금지. 이름 자체가 방향의 선언이 됨.
6. **verbatim 규격서 분리**: PICKER.md가 마크업·CSS·키보드 계약·참조 구현을 전부 제공. "the only values that change per run are the variant names and count."
7. **도구가 판단을 오염시키지 않게 하는 원칙**: "The picker is **chrome, not a contestant.** ... It stays identical across every project so it **always reads as harness chrome, never as part of the design being judged.**" — 측정 도구의 중립성을 설계 원칙으로 명시.
8. **예외에 근거 부착**: `width` transition이 transform/opacity 규칙의 예외인 이유를 명시 — "the element is 28px tall, absolutely positioned, and has **no layout dependents**, so the paint cost is negligible." 즉 규칙을 어길 때 조건을 밝힘.
9. **자기 규칙의 자기 적용**: 변형 전환에 애니메이션을 넣지 않는 근거로 자기 컬렉션의 빈도 규칙을 인용.
10. **트레이드오프 강제 표기**: Phase 5 표의 "When it's the right choice" / "Its cost" 두 열. "**Sell each variant honestly — one line on when it wins, one on what it costs.**"
11. **선택권 이양**: "stop — the choice belongs to the user" / "Never pre-pick a favorite in the table". 판단 근거를 요구받으면 "a reason rooted in the product's personality and frequency of use, **not aesthetics alone.**"
12. **행위 계약(behavior contract) 명시**: 키보드(1–N, ←/→, R), URL 파라미터 지속(`?v=2`), 재마운트 규칙, `data-ready` 타이밍 — "The contract is fixed regardless of how the harness renders."
13. **프레임워크 이식 지침**: "in a framework, keep the same behavior but express it idiomatically (state instead of `innerHTML`, a keyed re-mount instead of `requestAnimationFrame`, refs + a layout effect for the highlight measurement)."

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "the one that **feels right**" (description) | 실제로 실행되는 변형들을 사용자가 직접 넘겨보게 함. **감각 판단을 모델에서 사람으로 이전**하는 것이 이 스킬의 방법론 |
| "**genuinely different**" | 명명된 축(axis) + "no two variants share an axis position" + accent color/copy만 다르면 같은 방향으로 취급 |
| "**a direction you could defend shipping on its own**" | 변형 하나하나가 크래프트 기준(easing, 300ms, transform-origin, transform/opacity, reduced-motion) 전부 통과 |
| "**feel native to the product**" | 프로젝트 토큰(colors, radii, spacing, fonts, easing/duration) 사용. "look like it could ship in this product tomorrow" |
| "**how far the boldest variant may go**" | Recon의 personality(playful consumer app vs crisp dashboard)가 상한을 규정 |
| "**realistic surrounding context**" | "a toast needs a page behind it, a card needs siblings, a button needs a form" |
| "**Quiet**" (예시 축) | "Minimal motion, borders over shadows" → 언제 이기는가: "The product is a daily-use tool" / 비용: "Least memorable" |
| "**Editorial**" (예시 축) | "Large type, generous whitespace" → "The moment deserves weight" / "Eats vertical space" |
| "**chrome, not a contestant**" | 피커를 verbatim 고정, 테마 비인식, 프로젝트 토큰 적용 금지 |
| "**restrained default look**" (프로젝트 없을 때) | "neutral grays, one accent, system font stack" |

## 7. 산출물

**형식 (분기 2개)**
- **프로젝트 브랜치**: 격리된 라우트/페이지 — `/prototypes/<slug>` 또는 프레임워크 등가물. 변형당 파일 1개 + harness 파일 1개. 프로덕션 코드로의 import 금지.
- **standalone 브랜치**: 인라인 CSS/JS의 단일 자기완결 HTML 파일 (브라우저에서 바로 열림)

**대화 산출물**
- Phase 5의 트레이드오프 표: `| # | Variant | Axis | When it's the right choice | Its cost |`
- 피커 실행 위치(URL 또는 파일 경로) + 전환 키

**파일 저장 위치 규칙**: `/prototypes/<slug>` (명시). standalone 파일의 경로·이름 규칙은 **원문에 명시 없음.**

**정리 규칙**: 승자 승격 후 프로토타입 표면 삭제 (하드룰 5). `keep <variant>, leave the picker`로 보존 가능.

## 8. 주의점 / 한계

- **`disable-model-invocation: true`**: 명시적 호출만 가능. 다른 스킬이 이 스킬로 라우팅하는 지시는 컬렉션 내에 **없다** (`animate`는 `pick-ui-library`로만 라우팅). 즉 사용자가 존재를 알고 직접 불러야 함.
- **검증이 도구 가용성에 의존**: Phase 5의 스크린샷이 "If browser tooling is available"로 조건부. 브라우저 도구가 없으면 "flip through all of them yourself"를 어떻게 수행하는지는 **원문에 명시 없음** — 실질적으로 사람이 열어보게 됨.
- **`z-index: 2147483647`**: 32비트 정수 최대값. 프로젝트에 동일 값을 쓰는 요소가 있으면 순서가 불확정 — 원문에 언급 없음.
- **피커의 `width` transition 예외**: 원문이 근거를 밝히지만, 컬렉션의 다른 스킬(`animate`, AUDIT.md)은 "Animating `width`" 를 무조건 finding으로 규정한다. 감사 스킬이 프로토타입 표면을 스캔하면 **오탐이 발생**할 구조 — 원문에 이 상호작용에 대한 언급 없음.
- **`riff` 변형의 컨텍스트 요구**: 이전 라운드의 harness와 변형 이름을 기억해야 하므로 세션 연속성에 의존. 상태가 파일로만 남는지(`?v=2` URL 파라미터 외에) **원문에 명시 없음.**
- **정리 규칙의 위험**: 하드룰 5가 "delete the prototype surface"를 기본 동작으로 규정. 사용자가 다른 목적으로 그 경로에 파일을 두었을 경우의 처리는 **원문에 명시 없음.**
- **Phase 1의 판단 부담**: "pick the single highest-leverage piece"에서 leverage의 정의는 **원문에 명시 없음** (`improve-animations`는 `impact ÷ effort`로 정의하는데 이 스킬은 정의 없음).
- **강한 경고 지점**:
  - "three tints of the same idea waste the picker"
  - "No lorem ipsum, no dead buttons, no \"imagine this part\"."
  - "never judge UI at postage-stamp size"
  - "The picker is chrome, not a contestant." / "Do not restyle it"
  - "stop — the choice belongs to the user" / "Never pre-pick a favorite in the table"
  - "Never touch production code during exploration."
- **검증 장치 (강점)**: 단계별 completion criterion 2개, 콘솔 클린 확인, 전 변형 직접 플립, 트레이드오프 표의 정직성 요구, 그리고 무엇보다 **사람이 직접 눌러보는 실행 가능한 산출물**. 이 컬렉션에서 "감각 검증"을 실제로 실행 가능하게 만든 유일한 스킬.
