# impeccable 분석

## 1. 개요

- **원본 경로**: `skills-collections/impeccable/`
- **출처**: `pbakaus/impeccable` (GitHub), 설치 경로 규약 `.agents/skills/impeccable/SKILL.md`
- **핵심 파일**: `SKILL.md` (10,773 bytes) — **metadata.version 4.1.3** (분석한 스킬 중 유일한 메이저 4 버전)
- **보조 파일** (총 **168개**, 5.2MB)
  - `reference/` **39개 (총 5,157줄)**: `critique.md`(**828**), `document.md`(416), `harden.md`(336), `live.md`(325), `adapt.md`(312), `optimize.md`(258), `onboard.md`(234), `new-work.md`(145), `audit.native.md`(139), `audit.md`(136), `init.md`(131), `overdrive.md`(127), `hooks.md`(111), `distill.md`(111), `polish.md`(105), `live-setup.md`(102), `quieter.md`(99), `clarify.md`(94), `animate.md`(89), `colorize.md`(86), `layout.md`(84), `typeset.md`(80), `delight.md`(70), `extract.md`(69), `operate.md`(61), `shape.md`(59), `adapt.native.md`(58), `doctor.md`(54), `ios.md`(51), `craft-floor.md`(50), `visualize.md`(46), `android.md`(46), `bolder.md`(33), `routing.md`(18), `craft.md`(5)
  - `reference/degraded/` 4개: `manual-edit-applier.md`(91), `asset-producer.md`(38), `finish-reviewer.md`(37), `documenter.md`(23) — **서브에이전트를 못 쓰는 하네스용 폴백 절차**
  - `scripts/` **123개 파일 / 약 74,000줄 JS**
    - 라이브 모드 `scripts/live*.mjs` + `scripts/live/` + `scripts/live/frameworks/` — **약 30,000줄**. `live-browser.js` 단일 파일이 **12,793줄**
    - 디텍터 `scripts/detector/` 20개 — **약 24,200줄**. `rules/checks.mjs`(**5,744**), `browser/injected/index.mjs`(2,204), `design-system.mjs`(1,311), `engines/regex/detect-text.mjs`(1,293), `engines/static-html/css-cascade.mjs`(1,242), `registry/antipatterns.mjs`(635)
    - 오케스트레이션: `context.mjs`(1,597), `serve-question.mjs`(1,783), `build-phase.mjs`(1,022), `concept-seed.mjs`(814), `hook-lib.mjs`(2,490), `hook-admin.mjs`(819), `comp-spec.mjs`(513), `comp-diff.mjs`(391), `generate-image.mjs`(447), `palette.mjs`(628), `font-match.mjs`(457), `doctor.mjs`(329), `pin.mjs`(340)
    - `scripts/lib/` 24개: `design-parser.mjs`(880), `impeccable-config.mjs`(640), `font-fingerprint.mjs`(564), `staleness.mjs`(533), `staleness-deep.mjs`(485), `concept-catalog.mjs`(396), `roll-selection.mjs`(369)
  - `agents/` 5개: **서브에이전트 4종 정의(TOML)** — `impeccable_finish_reviewer`(41줄), `impeccable_manual_edit_applier`(95), `impeccable_asset_producer`(42), `impeccable_documenter`(27) + `openai.yaml`(하네스 표시용 메타 3줄)
- **성격**: **디자인 스킬이 아니라 디자인 파이프라인 프레임워크**. 23개 서브커맨드 라우터 + 81개 규칙 정적 디텍터 + 브라우저 라이브 편집 서버 + 서브에이전트 리뷰 게이트 + 프로젝트 영속 상태(`.impeccable/`)를 하나로 묶는다. **지금까지 분석한 어떤 스킬보다 코드 규모가 크고, 유일하게 "에이전트 자신을 감시하는 검증 계층"을 갖는다.**

원문 자기 규정 (SKILL.md 본문 첫 문장):

> "This skill gives you the tools and **permission** to create design that earns to be called **out-of-distribution craft**: Whereas before, your design work would have been safe, timid and measured, you now approach every design task as an **award-winning design director**..."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문 (전문):

> "Use when the user wants to **design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract**, or otherwise improve a frontend interface. Covers **websites, landing pages, dashboards, product UI, app shells, components, forms, settings, onboarding, and empty states**. Handles **UX review, visual hierarchy, information architecture, cognitive load, accessibility, performance, responsive behavior, theming, anti-patterns, typography, fonts, spacing, layout, alignment, color, motion, micro-interactions, UX copy, error states, edge cases, i18n, and reusable design systems or tokens**. Also use for **bland designs that need to become bolder** or more delightful, **loud designs that should become quieter**, live browser iteration on UI elements, or ambitious visual effects that should feel technically extraordinary. **Not for backend-only or non-UI tasks.**"

`metadata`: `version: 4.1.3` (author 필드 없음, `argument-hint` 없음)

**description의 구조**: **동사 13개를 그대로 나열**한다. 이 동사들은 곧 Commands 테이블의 서브커맨드 이름이며(`design`→new-work, `critique`, `audit`, `polish`, `clarify`, `distill`, `harden`, `optimize`, `adapt`, `animate`, `colorize`, `extract`, `shape`), **description이 라우팅 키의 인덱스 역할을 겸한다.** `ui-ux-pro/design`이 `Actions:` / `Platforms:` 라벨로 분류 나열한 것과 달리, 여기서는 라벨 없이 3문장(동사 / 표면 종류 / 관심사)으로 나눈다.

**명시적 배제**: 마지막 문장 `"Not for backend-only or non-UI tasks."` — 분석한 스킬 중 **description에 부적합 조건을 직접 쓴 드문 사례**다.

**두 단계 활성화**: description으로 스킬이 켜진 뒤, SKILL.md의 Routing 규칙이 **인수 없음 → `routing.md`의 메뉴 제시**, **명시/암시된 커맨드 → 해당 reference 로드**, **그 외 → 일반 디자인 작업**으로 다시 분기한다. 원문:

> "**No argument:** read routing.md and present its context-aware menu; **never auto-run a command.**"

`$<command>` 형태의 독립 슬래시 단축키는 `pin.mjs`로 생성/제거한다(`node .agents/skills/impeccable/scripts/pin.mjs <pin|unpin> <command>`).

## 3. 적합한 상황 / 부적합한 상황

**적합**

- **새 표면(surface) 또는 비주얼 아이덴티티 전면 교체** — `new-work.md`가 7개 후보 → 주사위 배정 → 챌린저 대결 → 1개 방향 제시까지의 전 과정을 규정
- **기존 UI에 대한 감사·비평** — `critique`(Nielsen 10 휴리스틱 채점 + 5개 페르소나 + 디텍터 증거)와 `audit`(a11y/perf/responsive 5차원 0–4점)이 분리되어 있다
- **좁은 범위의 리파인** — `bolder`/`quieter`/`distill`/`polish`/`layout`/`typeset`/`colorize`/`animate`가 각각 별도 reference를 갖고, 전부 "범위 밖은 손대지 않는다"를 강제
- **브라우저에서 눌러가며 반복** — `live` 모드: dev 서버 HMR에 붙어 요소를 클릭 → 변형 3개 생성 → 핫스왑 → accept/discard
- **네이티브 앱 UI** — `ios.md` / `android.md` / `audit.native.md` / `adapt.native.md`로 플랫폼 분기. **분석한 스킬 중 iOS/Android 네이티브 디자인 언어를 웹과 분리해 다루는 유일한 사례**
- **AI 티(slop) 제거가 목표일 때** — 디텍터의 `slop` 카테고리 32개 규칙이 정확히 이 목적
- **CI/훅으로 상시 감시하고 싶을 때** — `$impeccable hooks on`이 편집 후 자동 스캔을 붙인다

**부적합 / 과한 상황**

- **단발 컴포넌트 스타일링** — 스킬 본문 + reference 1개 + `context.mjs` 실행 + craft-floor 로드까지 최소 진입 비용이 크다. `emilkowalski/emil-design-eng`나 `taste-skills/minimalist-ui` 같은 "지침만 주는" 스킬이 더 싸다
- **Node.js가 없는 환경** — 모든 보조 기능이 `node` 실행에 의존한다(외부 npm 의존성은 없음, §4)
- **정적 마크업만 있고 dev 서버가 없는 경우** — `live` 모드는 HMR 서버 또는 브라우저에 열린 정적 HTML을 전제로 한다
- **이미지 생성이 필요한 comp-led 빌드에서 `OPENAI_API_KEY`도 하네스 이미지 툴도 없을 때** — 이때는 code-led 경로(와이어프레임)로 강등되며, 원문이 이 강등을 설계된 분기로 명시한다
- **백엔드/비UI** — description이 직접 배제
- **결과를 빠르게 받고 싶을 때** — 빌드 후 서브에이전트 리뷰 → fix 배치 → 재캡처 → verdict 패스까지 **최대 2라운드**가 계약이다

## 4. 외부 의존성

- **npm 외부 패키지: 0개.** `scripts/` 전체에서 `node:` 이외의 import는 프레임워크 어댑터가 생성하는 코드 문자열(`svelte`, `react`)뿐이다. **분석한 스킬 중 가장 무거운 코드베이스인데 런타임 의존성은 Node 표준 라이브러리만 쓴다.** PNG 디코딩(`lib/png.mjs` 281줄), 색상 변환(`detector/shared/color.mjs` 596줄), CSS 캐스케이드 해석(`css-cascade.mjs` 1,242줄)까지 자체 구현
- **Node.js 런타임** — 필수. 모든 커맨드가 `node <skill-base-dir>/scripts/*.mjs` 호출
- **하네스(에이전트 환경) 의존** — 원문에서 하네스별 분기를 명시적으로 다룬다. 언급 빈도: **Cursor 245회 / Codex 93회 / Claude Code 16회 / GitHub Copilot 14회 / opencode 22회 / Grok Build 9회**
  - 서브에이전트 툴 유무 → `critique`의 A/B 이중 평가, finish reviewer, documenter의 실행 방식이 달라진다
  - 없으면 `reference/degraded/` 4개 파일의 인-스레드 폴백으로 강등되고, **강등 사실을 배너로 공개해야 한다**
  - 구조화 질문 툴 유무 → `serve-question.mjs`(1,783줄)가 자체 결정 페이지를 서빙
  - 브라우저 툴 유무 → `critique`의 오버레이 주입과 `live` 모드 가용성이 갈린다
  - 훅 이벤트 지원 여부 → Claude Code/Codex/Grok은 `Stop` 딥 패스, Cursor는 `preToolUse` 차단, Copilot은 딥 패스 없음
- **`OPENAI_API_KEY`** — `generate-image.mjs`가 `api.openai.com/v1/images/{generations,edits}`를 호출. **없으면 에러 후 "하네스 네이티브 이미지 툴을 쓰라"고 안내하고, 상위 흐름은 code-led로 강등된다.** `ui-ux-pro/design`이 `GEMINI_API_KEY` 부재 시 폴백을 명시하지 않은 것과 대비되는 지점
- **`IMPECCABLE_IMAGE_GEN_FAKE`** — 이미지 생성 테스트용 환경 변수
- **dev 서버 (Vite / Next.js / Bun 등)** — `live` 모드 전제. `scripts/live/frameworks/` 12개 어댑터: `nextjs`, `nuxt`, `astro`, `sveltekit`, `tanstack-start`, `vite-generic`, `static-html` 등
- **프로젝트 측 산출 파일** — 스킬이 프로젝트 루트에 쓰는 영속 상태:
  | 경로 | 소유 커맨드 | 내용 |
  |---|---|---|
  | `PRODUCT.md` | `init` | 제품 진실(불변 사실, 플랫폼) |
  | `DESIGN.md` + `.impeccable/design.json` | `document` | 비주얼 시스템 + 머신리더블 사이드카 |
  | `.impeccable/config.json` / `config.local.json` | `hooks`, `doctor` | 디텍터 무시 규칙, 훅 동의, 빌드 경로 기본값 |
  | `.impeccable/mocks/` `mocks/decision/` | `visualize`, new-work | 방향 comp / 결정 카드 comp |
  | `.impeccable/build/state.json` `spec.json` | `build-phase.mjs` | 빌드 페이즈 상태, 측정 스펙 |
  | `.impeccable/review/` `review/diff/{hero,final}/` | finish review | 스크린샷, side-by-side, heatmap, `report.json` |
  | `.impeccable/live/sessions/` `roots.json` | `live` | 세션 저널(재개용), 앱 루트 매니페스트 |
  | `.impeccable/critique/` `critique/ignore.md` | `critique` | 스냅샷 아카이브, 무시 목록 |
- **`npx impeccable update`** — 스킬 자체의 버전 업데이트 경로. `context.mjs`가 부트 시 `UPDATE_AVAILABLE`를 보고한다

## 5. 워크플로우

### Setup — 세션당 정확히 1회

SKILL.md의 3단계:

1. `node <skill-base-dir>/scripts/context.mjs` — **"once per session"**, cwd는 사용자 프로젝트 유지. `--target <path>`로 대상 지정. PRODUCT.md / DESIGN.md / 표면 브리프 / 네이티브 가이드를 로드하고 지시(directive)를 출력. 원문: **"follow its directives and do not rerun it."**
2. 요청의 플레이북 로드 — Commands 테이블의 해당 reference, 또는 새 표면/교체면 `new-work.md`
3. **UI를 편집하기 직전에** `craft-floor.md` 로드. 원문: **"Do not load it for planning-only work."**

`context.mjs`가 내보내는 지시어 예: `RESOLVED_CONTEXT`, `NO_PRODUCT_MD`, `CONTEXT_STALE`, `UPDATE_AVAILABLE`, `IMAGE_TOOLS`, `STOP_REVIEW_PROVIDERS`.

### Modes — 표면의 성공 정의 4종

원문: "The mode names what **the visitor's success** looks like on this surface."

| Mode | 방문자의 성공 | 표면 예 | 우선하는 것 |
|---|---|---|---|
| **Persuade** | 결정하고 행동한다 | 랜딩, 마케팅, 캠페인, 가격 | 주목과 행동 획득. "design is the product" |
| **Operate** | 과업을 완료한다 | 앱 UI, 대시보드, 에디터, 관리자, 설정 | 스캔성·일관성·네이티브 기대치 > 표현. "Brand lives in precise details" |
| **Read** | 무언가를 이해한다 | 문서, 기사, 가이드, 체인지로그 | 이해를 위한 구조, 그 다음 머무를 가치 |
| **Experience** | 작품 안에 들어간다 | 포트폴리오, 갤러리, 쇼케이스 | 첫 뷰포트부터 작품이 리드, 인터페이스는 후퇴 |

**모드는 제품이 아니라 요청된 표면에서 고른다**는 규칙을 원문이 3개 반례로 못박는다:

> "A tool's landing page is still **Persuade**; a fashion house's documentation is still **Read**; a docs index is **Read, not Persuade**."

모드는 그 표면 브리프에만 영속된다(전역 상태가 아니다).

### Commands — 23개 / 6개 카테고리

| Category | Commands | 개수 |
|---|---|---|
| **Build** | `craft`(deprecated alias), `shape`, `init`, `document`, `extract` | 5 |
| **Evaluate** | `critique`, `audit`(+native) | 2 |
| **Refine** | `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard` | 6 |
| **Enhance** | `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive` | 6 |
| **Fix** | `clarify`, `adapt`(+native), `optimize` | 3 |
| **Iterate** | `live` | 1 |

별칭·비별칭 규정: `teach` = `init`. `craft`는 **deprecated**이며 원문이 **"adds nothing"**이라고 직접 쓴다. `shape`는 과업 발견을 소유하고, 비주얼 월드/표면 콘셉트 결정만 new-work로 넘긴다.

### 새 작업 흐름 (`new-work.md` 5단계 + 빌드/리뷰)

**1. 이미 참인 것을 판정** — DESIGN.md, 대표 코드, 토큰, 컴포넌트, 에셋을 읽고 4갈래:
- **Redesign**: 제품 진실·콘텐츠·기능·제약·브랜드 확약은 보존, **옛 룩은 교체**. 원문: "The old look is **evidence** of what the subject is, not **authority** over what it becomes."
- **Established world**: 상속. **"A missing DESIGN.md does not erase a coherent identity already in code"**
- **Incomplete brand**: 확정 자산 보존 + 사용자와 확장
- **No visual authority**: 사용자와 새 월드 생성

**2. 작업을 바꿀 것만 질문** — 구조화 질문 툴로 **1라운드, 2–3개**. 모드별 질문 축이 다르다. 금지: **"Never ask for CSS values or canned aesthetic lanes."**

**3. 발명의 양 결정** — 3분기:
- **기존 표면 확장**: 월드·구성 상속, 콘셉트 토너먼트 없음, DESIGN.md 변경 없음
- **확립된 월드 안의 새 표면**: 5–7개 구조를 도출 → `concept-seed.mjs --scope surface --mode <mode>`가 **그중 3개를 주사위로 뽑는다.** 원문: "the dice pick which three reach the user, **breaking the ranking rut** while the user keeps a real choice." 리드 카드는 kicker `THE ROLL`
- **월드 생성/교체**: 아래 5단계

**4. 월드 생성/교체 5단계** (원문 요지)
1. 제품의 고유 메커니즘 1문장 + 청중의 실제 장면 + 문화적 고향 + 이 표면이 증명할 것. **카테고리가 항상 내놓는 페이지와 그 예상 가능한 반대편을 둘 다 "rut"으로 후보에서 제외**
2. 청중이 외우고 있는 **구체적 비주얼 시스템/인공물/장소/의례 7개**를 공명순으로. 물리적 사물뿐 아니라 그 세계의 **그래픽·화면 전통**(표기법, 출판물, 아이덴티티 프로그램, 데이터 그래픽)도 포함. **7개 중 3개 이상이 한 재료 계열이면 도출을 덜 한 것 → 최소 3계열로 확장**
3. 재료를 완전한 방향으로 전환
4. `concept-seed.mjs --scope direction --mode <mode>` — **대체 불가, 생략 불가.** 원문: "**writing artifact code before this script has run and its assignment is acknowledged is a contract violation**, whatever the harness, the model, or the time pressure." 스크립트가 빌드할 방향을 배정하고 카탈로그 챌린저를 딜한다. 각 챌린저를 **fuse**(형태는 챌린저, 사실은 제품, 충돌 시 명확성 승) 후 **정확히 2축**(audience identification / product clarity)으로 판정 → `wins` / `competitive` / `declined`. **declined도 버리지 않는다**: 그 시스템의 규율 1개를 지목해 배정 방향을 그만큼 올린다(raise). 기부는 야망과 시스템 규율만 이전하고 **모티프를 베끼는 건 "costume note"로 raise가 아니다**
5. **방향 1개**만 제시(world / first viewport / visitor path / signature interaction / cross-surface reach / honest risk), raise는 기부자 이름과 함께 각각 한 줄로 가시화. 챌린저는 판정별로: wins·competitive는 QUALITY BAR 카드와 함께 완전한 대안, declined는 **강등 렌더(작고 조용하게, 판정과 남긴 것 표기, 절대 조용히 삭제 금지)**

**5. comp-led vs code-led 분기**
- **comp-led** (이미지 생성 가능 + comp 기본값): `build-phase.mjs start --direction <seed key> --kind <...>`로 `comps` 페이즈를 열고 → `visualize.md`가 **3개** 고충실도 north-star comp을 `.impeccable/mocks/`에 생성. **3이 숫자다**: "one comp invites rubber-stamping." 결정 라운드의 comp이 이미 있으면 그것이 첫 번째, 2개만 추가 생성. 확립된 월드에서는 **기존 페이지 스크린샷을 `--ref`로 전달** — 원문: "**prose paraphrases of a design system drift, pixel references do not**"
- **code-led**: 와이어프레임 스키마(`serve-question.mjs --schema`)를 결정 페이지가 직접 그린다. **설계된 분기이며 드리프트가 아니다** — 원문: "A code-led contract skips this file **by design, not by drift**"
- 카드 락 = 승인. 락된 comp → comp-led(그 comp이 승인 comp, 2차 승인 없음), 락된 와이어프레임 → code-led

**6. 검증 — 무한 루프 금지, 2라운드 상한**

SKILL.md의 3번째 핵심 원칙 원문:

> "**Verify in bounded passes, not a loop**, and the ceiling covers the whole cycle: screenshots, defect scans, micro-edits, and rebuilds alike. Build fully, inspect once with a batched round (desktop and mobile together on the web; the shipped device classes on a native platform), fix everything it shows in one batch, confirm with at most one more round, and stop polishing. **Open-ended self-QA burns the user's money doing worse what the finish handoffs do better.**"

구체 절차:
- 웹이고 훅이 없는 하네스면 여기서 `detect.mjs --json`을 **1회** 실행, 기계적인 것만 고치고 나머지는 리뷰어에게 넘긴다. 원문: "a hookless web build that skips this **ships every tell the hook exists to catch**"
- **네이티브는 디텍터를 완전히 건너뛴다** — HTML/CSS만 읽으므로 네이티브 코드에 대한 판정이 없고, 이 사실을 리뷰어 입력 패킷에 명시
- 스크린샷은 `.impeccable/review/`에 뷰포트별 1파일(`desktop.png`, `mobile.png`, 사용자 뷰포트가 포함됐으면 `user-<width>.png`)

**7. finish reviewer 서브에이전트** — `impeccable-finish-reviewer`

입력 패킷: 원 요청, 확정 답변, 아티팩트 경로, 스크린샷 경로, direction contract(THESIS / OWN-WORLD / STORY / FIRST VIEWPORT / FORM), 훅·디텍터 findings, QUALITY BAR 카드, 승인 comp, 빌드 상태·스펙, diff 디렉터리, craft-floor 경로, 네이티브면 플랫폼 reference + "디텍터 미실행" 한 줄.

강제 사항:
- **리뷰어는 브라우저가 없다.** "screenshots you fail to pass are checks it cannot run"
- **빌드 스레드를 절대 상속하지 않는다** (`fork_turns: 0`). 원문: "a reviewer that inherits your transcript inherits **your framing, your optimism, and your abstractions**"
- 에이전트 정의 파일을 먼저 읽지 말 것 — 하네스가 로드한다
- 대기는 **긴 타임아웃 1회**, 짧은 폴 루프 금지
- 서브에이전트가 아예 없는 하네스만 `degraded/finish-reviewer.md`로 인-스레드 대체하고, **대체 사실을 finish에서 한 줄로 공개**

**disposition 4개** — 정확히 넷:

| 단어 | 의미 | 대응 |
|---|---|---|
| `recapture` | **증거가 실패**(빌드가 아님) | 재캡처 후 **전체 리뷰 재실행**. 무효 증거 기반 리뷰는 아무것도 구속하지 않고, verdict 패스가 뒤따를 수 없다 |
| `rebuild` | 충실도가 **부분이 아니라 전면** 실패 | fix 배치 건너뛰고 즉시 재구축 → 새 전체 리뷰. 허락을 구하지 말고 무슨 일인지 알린다 |
| `ship` | 남은 빚 없음 | 스코프를 명시해 verdict 보고 → documenter로 |
| `fix` | 물질적 수정 목록 | **1배치**로 적용 → 1회 재빌드 → 같은 뷰포트 재캡처 → **같은 리뷰어에게 resolved/partial/unresolved 채점(verdict pass)** |

리뷰어의 **check 0은 Evidence**: 필요한 캡처가 존재하고 유효한지(검은/빈 영역 없음, 파일명이 주장하는 내용과 일치, 전체 페이지라면 문서 최상단 보임, 뷰포트에 맞는 치수) 먼저 확인. 하나라도 실패면 첫 줄에 `disposition: recapture`, 섹션 하나(`recapture`)만 쓰고 정지.

**보고 규율**: verdict 패스는 **나열된 fix만 채점한다.** 원문: "'the reviewer scored all three fixes resolved' is a claim it supports, **'no material issues remain' is not.**" 열린 항목이 있는 표를 pass로 발표하거나 완화하거나 전체 표면 승인으로 포장하는 것을 금지. 사용자가 자기 스크린샷 등 반증을 내면 **그 증거가 내가 만든 모든 캡처를 능가**하며, 새 리뷰어를 띄운다.

2라운드가 무인 실행의 예산. 유인 세션의 상한은 사용자 것이므로, 2차 verdict에도 열린 항목이 남으면 **표를 사용자 앞에 놓고 선택하게 한다.**

**8. documenter 서브에이전트** — `impeccable-documenter`가 빌드된 월드에서 DESIGN.md + 사이드카를 기록. **"ground truth over intention"**. 마지막 수정이 착지한 뒤에 실행하고, 문서화 이후 fix 라운드가 생기면 **재실행**한다 — 원문: "a DESIGN.md describing a layout that no longer exists **turns defects into system guidance**".

원문 종결부:

> "A clean detector pass is **not** finished; finished is the contract kept, the comp honored, the review closed, and the system recorded."

### `critique` 흐름 (828줄, 가장 상세)

**Hard Invariants**(원문 요약):
- Assessment A(디자인 리뷰) + Assessment B(디텍터/브라우저 증거) **둘 다 필수**
- 서브에이전트 툴이 노출되어 있으면 **A와 B는 격리된 두 서브에이전트로 병렬 실행이 의무**. 인라인은 "가능"하지만 **허용되지 않는다**
- 강등 시 보고서 첫 줄에 배너 강제: `⚠️ DEGRADED: single-context (<reason>)`. 원문: "**A silent degraded critique is a failed critique.**"
- **A가 끝나기 전에 디텍터 findings가 부모 컨텍스트에 들어가면 안 된다** — 결정적 출력이라도 판단을 앵커링한다
- 디텍터 생략은 실패한 런(단, `detect.mjs`가 없거나 실제 시도 후 크래시한 경우 제외)
- **질문은 응답의 맨 마지막.** 구조화 질문 뒤의 산문은 사용자가 답할 때까지 보류되므로, 질문 뒤에 쓴 보고서는 크리틱이 실행되지 않은 것처럼 읽힌다
- 질문도 `Questions skipped: <reason>` 리터럴도 없이 끝난 런은 불완전. **"The report is not the finish; the close is."**

**보고서 구조**: Report header provenance → **Design Health Score**(Nielsen 10휴리스틱 0–4점 표) → **Design Specificity Verdict**(LLM 평가 + 결정적 스캔 + 시각 오버레이) → Overall Impression → What's Working(2–3) → **Priority Issues**(3–5, P0–P3 + 각 항목에 실행할 `$impeccable <cmd>` 추천) → **Persona Red Flags** → Minor Observations → Questions to Consider → Run Notes.

**채점 규율**: 적용 가능 최대치는 **실제로 채점한 휴리스틱 수 × 4**. Persuade/Experience 표면에서는 7(Flexibility)과 10(Help)을 `n/a`로 둘 수 있고, 그러면 총점을 `/32`로 정규화한다. 원문: **"Never print `/40` over a partial set."** 그리고 **"Most real interfaces score 20-32 out of 40."**

**페르소나 5종** (2–3개 자동 선택): Alex(성급한 파워 유저), Jordan(혼란한 첫 사용자), Sam(접근성 의존), Riley(의도적 스트레스 테스터), Casey(산만한 모바일). `AGENTS.md`에 `## Design Context`가 있으면 프로젝트 전용 페르소나 1–2개 추가 생성. 원문: **"Don't write generic persona descriptions; write what broke for them."**

또한 크리틱을 위해 띄운 로컬 서버는 백그라운드 실행 + 정지 방법 기록 + 최종 보고 전 정지가 강제되고, **스크립트 주입이 성공하지 않았으면 오버레이가 존재한다고 주장 금지**다.

### `live` 흐름 (브라우저 인터랙티브 변형)

계약(원문: "Execute in order. No step skipped, no step reordered"), 그리고 **툴 출력의 `_instructions` 필드가 이 문서보다 우선한다**:

1. `live.mjs` 부트 — dev 서버 설정 파일에서 앱 루트를 해석해 `.impeccable/live/roots.json`에 영속. 모든 헬퍼가 이 매니페스트에 재앵커(잘못된 cwd로 세션 상태가 갈라지는 것을 막는다)
2. `pageFile`을 서빙하는 앱 URL을 열기. **`serverPort`는 헬퍼 포트이므로 절대 쓰지 않는다**
3. `live-poll.mjs` 폴 루프 — 기본 긴 타임아웃 **600000ms**. 짧은 `--timeout=` 금지. 글로벌 바의 Impeccable 마크가 **호박색 점으로 펄스**하면 폴링이 끊긴 신호
4. `generate` 이벤트: `event.scaffold` 재사용, 스크린샷 읽기, 액션 reference 로드, **변형 3개** 전달, `--reply done`, 재폴링. **이 스레드에서 생성한다**(프로젝트 토큰과 레이아웃을 이미 갖고 있으므로). 원문: "**The overlay preview IS the verification channel**; do not screenshot, re-render, or QA variants between generate and accept"
5. `steer`: 메시지 읽고 작업 후 `--reply steer_done`
6. `accept`/`discard`: `live-accept.mjs`가 실행되고 `_completionAck` 출력. carbonize accept는 `live-complete.mjs --id EVENT_ID`까지 복구 가능
7. 중단됐으면 추측 대신 `live-status.mjs` / `live-resume.mjs`. `.impeccable/live/sessions/` 저널이 정본이며 미확인 작업을 리플레이
8. `exit`: 하단 클린업

**하네스별 폴링 정책**: Claude Code는 백그라운드 태스크(짧은 타임아웃 금지, 셸 블로킹 금지). Cursor는 백그라운드 터미널 원샷 + notify(`--stream` 금지 — 측정치 ~5초 vs 1초 미만). Codex는 양보된 포그라운드 원샷이며 **띄우는 것만으로는 부족하고 반환까지 읽어서 서비스해야 한다** — 원문: "a yielded poll nobody reads is a dead session, and the user's Go sits unanswered."

변형 계획 순서도 규정: **identity first, then mode, then axes** (`live.md` §4), 파라미터는 변형당 0–4개.

### 훅 (`$impeccable hooks <on|off|status|ignore-rule|ignore-file|ignore-value|reset>`)

- 대상 확장자: `.tsx .jsx .html .vue .svelte .astro .css .scss .sass .less .ts .js`
- **2티어 규칙**:
  - **per-edit(즉시 티어)**: 편집을 끊을 만한 기계적·명백한 문제 — 깨진 이미지, 오버플로/클리핑, 대비·가독성 실패, 그라디언트 텍스트, glow 섀도, 디자인 시스템 드리프트
  - **Stop 딥 패스**: 나머지 전부(카피 리듬, 팔레트·타이포 취향, 레이아웃 리듬)를 세션에서 만진 모든 UI 파일에 대해 1회, per-edit 결과와 중복 제거해서 surface. 보고할 게 없으면 조용히 종료
  - `hook.perEditRules: "all"`로 매 편집 전체 규칙 복원 가능
- 하네스 차이: Claude Code/Codex/Copilot은 PostToolUse + 시스템 리마인더, **Cursor는 `preToolUse`로 나쁜 쓰기를 착지 전에 차단**하고 통과 시 침묵, Grok Build는 PostToolUse로 표시 후 Stop `additionalContext`로 노출(**Grok은 per-edit 리마인더가 없다 — stdout을 버린다**). Stop 딥 패스는 Claude Code/Codex/Grok만.
- 훅이 살아 있으면 craft-floor의 기계적 체크를 재감사하지 말고 **훅의 findings에 대응**하라고 원문이 지시한다

### `doctor` — 드리프트 3종 분리

| 종류 | 정의 | 소유자 |
|---|---|---|
| **Tool version** | 설치된 스킬이 배포판보다 오래됨 | `context.mjs`의 `UPDATE_AVAILABLE` + `npx impeccable update`. **doctor의 일이 아니다** |
| **Schema drift** | 구버전이 쓴 아티팩트(죽은 필드, 새 필수 필드, 폐기 위치) | **doctor가 대부분 기계적으로 수리** |
| **Truth drift** | 코드가 앞서 나가 문서가 더 이상 현실을 서술하지 않음 | 파일 비교로 해결 불가. DESIGN.md는 `document`, PRODUCT.md는 `init`. doctor는 **막연한 의심 대신 구체적 갭을 넘겨준다** |

SKILL.md 최상위 규칙:

> "**Never repair drift as a side effect of a design task.** A `CONTEXT_STALE` finding is reported, not acted on, unless the user asks. The one exception is a finding marked `auto`, which the next write to that file performs anyway."

## 6. 디자인 지침 분석

### Core principles (SKILL.md, 3개 전문)

> - "**Go all out.** No hedging, no shortcuts. The deliverable must be complete (except assets the user must provide)."
> - "**Dream big and bold.** Distinct, beautiful, outstanding and highly inspiring work."
> - "**Verify in bounded passes, not a loop** ... Open-ended self-QA burns the user's money doing worse what the finish handoffs do better."

**1·2번(야망)과 3번(절제)이 짝을 이룬다.** 대부분의 디자인 스킬이 "더 대담하게"만 말하는 데 비해, 여기서는 **야망의 상한을 검증 예산으로 명시**한다. 3번은 사실상 토큰 비용 정책이다.

### How to design — 3개 판정 규칙

- **The brief wins.** 원문: "Honor pinned aesthetics, eras, materials, fonts, and palettes **even when they conflict with a saturated-pattern warning**. **Redirecting a clear brief toward your taste is failure.**" → 디텍터·craft-floor보다 사용자 브리프가 위에 있다는 명시적 우선순위
- **Refinement preserves; redesign replaces.** 리파인먼트는 기존 아이덴티티·동작·카피·범위 밖 전부를 보존하고, **사실 카피 교체나 주장 추가 전에 물어야 한다.** 리디자인은 제품 진실·콘텐츠·기능·네이티브 어포던스·제약은 유지하되 옛 룩을 **anti-reference**로 취급. 금지: **"Never split the difference into polish on the discarded look."**
- **Visual authority is evidence, not a filename.** "Missing DESIGN.md alone does not make a project greenfield."

### `craft-floor.md` — 편집 직전에만 로드하는 품질 하한

원문 전제: "Load this after the direction is settled, and **build without announcing the checklist**. A pinned brief or the committed visual world overrides anything here; **your own habit does not**."

**Verify — 결과물에 대한 측정 가능한 체크 (수치 인용)**

| 항목 | 규정 |
|---|---|
| **Contrast** | 본문/placeholder ≥ **4.5:1**, 큰 텍스트 ≥ **3:1**. 컬러 표면에서는 2차 텍스트를 그 색조나 전경색에서 틴트, **"never gray"** |
| **Depth** | 섀도는 offset + soft blur를 가진다. **zero-offset 컬러 halo는 장식** |
| **Spacing** | 그룹은 타이트, 분리는 넉넉, **헤딩 위 공백 > 아래 공백**. **계산된 값을 읽어라** |
| **Type** | 본문 measure **65–75ch**, 디스플레이 최대 **6rem**, tracking 하한 **-0.04em**, balanced headings, 명확한 크기·굵기 단계. **실제 카피로 모든 브레이크포인트 확인** |
| **Motion** | authored moment **1개**. 흩어진 이펙트도, 모든 섹션에 동일한 등장도 아니다. **already-visible 기본값에서 exponential ease-out**. transform/opacity를 넘어 blur, backdrop-filter, clip-path, mask, shadow까지 — 매끄럽다면 |
| **States** | hover, disabled, loading, error, empty + 실제 콘텐츠, 작동하는 컨트롤, 반응형 구성, 키보드 포커스 |
| **Browser surfaces** | **텍스트 선택, 캐럿, 커스텀 스크롤바, 포커스 링, underline offset, 표 숫자(tabular numerals)** — 팔레트에서 테마링. 원문: "the cheapest signal that a page was **built rather than assembled**, and **the one models skip most reliably**" |
| **Copy** | 제품 자신의 언어. 컨트롤은 행동을 명명, 에러는 문제와 복구를 명명 |
| **Coverage** | 모든 브리프 요구사항이 존재하고 **몇 초 안에 찾을 수 있어야** |

**Refuse — 카테고리 기본값 거부 목록** (원문 프레이밍: "These are the category's defaults, **not bans**: the brief's own words can earn any of them")

*페이지 스캐폴드*
- 동일 크기 카드(아이콘+헤딩+텍스트)를 페이지 구조로 쓰기. **"Cards are the lazy container; nested cards are always wrong."**
- hero-metric 템플릿(큰 숫자 + 작은 라벨 + 보조 통계 + 액센트)
- **헤딩 위 kicker/eyebrow — 이건 유일하게 "ban, not a default"**: "no brief earns it back. The heading carries its own weight; delete the label"
- 섹션 번호(01/02/03) — 순서 자체가 정보일 때만
- 중단도 보호된 집중도 필요 없는 과업의 모달

*표면 습관*
- **그라디언트 텍스트** (강조는 weight나 size에서)
- 특정 효과가 아닌 장식으로서의 glass/blur
- 카드·리스트·콜아웃·알럿의 **1px 초과 컬러 `border-left`/`border-right`**
- 실제 neobrutalist 월드 밖의 하드 오프셋 섀도(`box-shadow: 4px 4px 0`) — **"a costume, not a depth system"**
- 콘텐츠 대역으로서의 스파크라인·프로그레스 링·soft-shadow 라운드 사각형
- 코드/데이터/측정이 아닌 **"technical"의 코스튬으로서의 모노스페이스**
- own-world 페이지의 디스플레이 보이스로 시스템 폰트(Impact, Arial Black, 플랫폼 산세). **"the closest installed font is a failure, not a fallback"** — 승인된 레터링에 맞는 폰트를 소싱·셀프호스팅
- 아이콘 시스템 대신 유니코드 글리프/이모지. **아이콘은 실제 라이브러리나 authored SVG로, 하나의 일관된 stroke와 weight로 그린다**
- 유기적 윤곽 대신 기하학 마스크(원/폴리곤/radial-gradient 컷아웃). **실제 이미지에서 알파 매트를 도출하거나 컷아웃 에셋을 생산**
- 카테고리로 라이트/다크 고르기 → **사용 장면(누가, 어디서, 어떤 주변광)에서 고른다**

*수치 하한*
- tracking은 **-0.04em에서 멈춘다**. 실제로는 **-0.02 ~ -0.03em이 대개 더 낫다**
- **elevation은 한 번만 선언** — border 또는 shadow. "A 1px border under a wide soft shadow is **the ghost card**". 카드 radius **12–16px**, pill은 작은 컨트롤용
- **Real illustration or none.** sketch-style SVG 장면, `loose-sketch`/`doodle` 클래스명, `feTurbulence` 그레인은 아마추어로 읽힌다. 단, **"이건 그림을 모방하는 SVG를 금지하지, 기하학을 하는 SVG는 절대 금지하지 않는다"** — 선명한 벡터 도형, 다이어그램, 애니메이션 라인워크, 셰이더 효과는 1급 매체
- 배경은 표면이며, 텍스처는 **주제의 세계에서만**. `repeating-linear-gradient` 스트라이프와 2축 그리드 오버레이는 그 아래 실제 캔버스·지도·청사진·측정 도구가 필요하다
- 주장과 설정값은 공급된 진실에서. 예시값은 정직하게 라벨링

마무리 원문: "The floor holds the mechanics; **it never picks the direction.** With every check green, spend the page on the committed world, and **when torn between refined and committed, commit.**"

### 디텍터 — 지침을 코드로 강제

- `rules/checks.mjs` **5,744줄, 규칙 id 81개**. 예: `low-contrast`, `icon-tile-stack`, `italic-serif-display`, `hero-eyebrow-chip`, `kicker-above-heading`
- `registry/antipatterns.mjs` **안티패턴 61개** = **`slop` 32개 + `quality` 29개**
- 각 안티패턴이 `skillSection` / `skillGuideline`으로 **SKILL.md 지침 문구에 역참조**된다 → 디텍터 findings가 곧 지침 인용이 된다
- 실제 항목 예:
  - `side-tab` — "Thick colored border on one side of a card — **the most recognizable tell of AI-generated UIs**"
  - `overused-font` — "**Inter, Roboto, Fraunces, Geist, Plus Jakarta Sans, and Space Grotesk** are used on so many sites they no longer feel distinctive. **Each new wave of AI-generated UIs converges on the same handful of faces.**"
  - `flat-type-hierarchy` — 지배 헤딩과 본문 역할이 **모든 단계에서 1.25× 미만**이면 플랫로 판정
  - `border-accent-on-rounded` — 라운드 카드의 두꺼운 액센트 보더는 라운드와 충돌
- 엔진 4종: `engines/regex/detect-text.mjs`(1,293), `engines/static-html/`(detect-html + css-cascade 1,242), `engines/browser/detect-url.mjs`(434), `engines/visual/screenshot-contrast.mjs`(189) → **소스 텍스트 / 정적 HTML+CSS 캐스케이드 / 실행 중 페이지 / 스크린샷 픽셀**의 4계층 검사
- 인라인 무시(`shared/inline-ignores.mjs`) + config 무시(`ignoreRules` / `ignoreFiles` / `ignoreValues`) + `designSystem.enabled`

### 커맨드별 지침 방식

- **`bolder`** — 반사적 답을 먼저 거부한다: **"The reflex answer, reaching for more effects, is the opposite of bold; reject it first."** 그리고 **"Scope is sovereign"**: 이름 지목된 대상만 만지고, 색·폰트·radius·섀도·시스템 프리미티브를 표면이 이미 갖지 않은 것은 추가하지 않는다. 진단 프레임: **"A flat section is typically one that quietly opts out of the system's own strongest moves."** → 증폭은 새 어휘가 아니라 **시스템이 이미 소유한 것을 최대 강도로**
- **`quieter`** — 시작 문장: **"Quiet design is harder than bold design. Subtlety needs precision."** 모드별로 의미가 갈린다: Persuade/Experience에서는 절제된 팔레트·여백·타이포 여유이며 **"Drama is reduced, not eliminated; the POV stays intact"**, Operate/Read에서는 시각 노이즈 감소이며 **"The tool should disappear more completely into the task"**
- **`polish`** — **"Polish is refinement, never concealed redesign."** 콘셉트 자체가 틀렸으면 **말하고 redesign이나 bolder를 권하라, 교체를 밀수하지 마라.** 그리고 **"A detector result is defect evidence, not proof of quality."** 드리프트를 4분류(missing token / one-off implementation / conceptual mismatch / local defect)하고 **가장 좁은 올바른 층위에서 원인을 고친다**
- **`audit`** — 5차원 0–4점 진단, **고치지 않고 문서화만** ("Don't fix issues; document them for other commands to address"). a11y 항목에 `prefers-reduced-motion`의 **전역 `0.01ms` kill을 플래그**하라는 구체 지시가 있다(상태 변화와 계층을 파괴하므로). 웹 전용, 네이티브는 `audit.native.md`로 라우팅
- **`document`** — DESIGN.md를 **[google-labs-code/design.md 공식 스펙](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md)** 에 맞춘다. **토큰이 normative, 산문은 컨텍스트.** 8개 섹션 고정 순서(Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts). 컴포넌트 서브토큰은 **8개 prop로 제한**(`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`)이고 섀도·모션·포커스링·backdrop-filter는 **사이드카**(`.impeccable/design.json`)로. 스케일 키는 프로젝트가 쓰는 이름 유지 — **"Don't rename to Material defaults."**

### 모호한 감각어의 번역

이 스킬의 특징은 **감각어를 커맨드 이름으로 승격**시킨 것이다. "더 대담하게" → `bolder`, "너무 시끄럽다" → `quieter`, "군더더기 빼줘" → `distill`, "재미있게" → `delight`, "한계를 넘어" → `overdrive`. 각 단어가 독립 reference를 갖고, 그 안에서 **모드별로 다시 번역**된다(`quieter`의 Persuade/Experience vs Operate/Read 분기가 대표적).

그리고 커맨드 단어의 **문맥 충돌을 명시적으로 처리**한다. `bolder.md` 첫 단락:

> "An open direction round owns the word first: '**bolder**' said while a direction decision is on the table is the **Bolder hand register steer**, a fresh deal of foreign forms (see new-work.md), **not this command.**"

## 7. 산출물

- **코드** — 프로덕션 UI 코드. 프로젝트의 기존 스택·토큰·컴포넌트 위에 작성
- **`PRODUCT.md`** (프로젝트 루트) — `init`이 소유. 제품 진실 + `## Platform`(`web` / `ios` / `android` / `adaptive`)
- **`DESIGN.md`** (프로젝트 루트) — `document` 소유. YAML frontmatter 토큰(design.md 공식 스펙) + 8섹션 마크다운
- **`.impeccable/design.json`** — DESIGN.md 사이드카(스펙 8 prop에 안 들어가는 섀도·모션·포커스링 등)
- **comp 이미지** — `.impeccable/mocks/` (방향 comp 3개), `.impeccable/mocks/decision/` (결정 카드 comp). 생성 프롬프트/출처를 **파일에 임베드**해야 하고 `embed-prompt.mjs --scan`이 누락을 잡는다
- **리뷰 증거** — `.impeccable/review/{desktop,mobile,user-<width>}.png` (네이티브는 `phone.png`/`tablet.png`, adaptive는 OS 접미사), `.impeccable/review/diff/{hero,final}/{side-by-side.png, heatmap.png, regions/<id>.png, report.json}`
- **빌드 상태** — `.impeccable/build/state.json`, `spec.json`, `scaffold/layout.css`, `crops/`
- **크리틱 스냅샷** — `.impeccable/critique/<filename>` + `ignore.md`(다음 런이 소비하는 유일한 이전-런 입력)
- **라이브 세션 저널** — `.impeccable/live/sessions/`, `roots.json`, `inject-journal.json`, `config.json`
- **설정** — `.impeccable/config.json`(공유) / `config.local.json`(개발자별, gitignore). `.git/info/exclude`에 마커를 넣어 관리
- **채팅 리포트** — `critique`의 주 산출물은 **채팅 응답 자체**이며 스냅샷은 아카이브다(원문: "The chat response is the primary deliverable")
- **슬래시 단축키** — `pin.mjs`가 `$<command>` 형태로 생성/제거

## 8. 주의점 / 한계

- **진입 비용이 크고, 그 비용이 문서화되어 있지 않다.** 최소 경로가 `context.mjs` 실행 → reference 로드 → `craft-floor.md` 로드다. 새 월드면 여기에 7개 후보 도출 + `concept-seed.mjs` + 챌린저 판정 + comp 3개 생성 + 서브에이전트 리뷰 + verdict 패스가 붙는다. **"버튼 hover 좀 고쳐줘"에도 스킬이 켜지는 description 범위인데, 그 규모에 맞는 경량 경로가 SKILL.md에 규정되어 있지 않다.** Routing의 "narrow refinement ... proceeds on the incumbent implementation as context.mjs directs"가 유일한 완충인데, 어디까지가 narrow인지 기준이 없다.
- **하네스 이식성이 사실상 이 스킬의 최대 복잡도다.** 참조 빈도(Cursor 245 / Codex 93 / Claude Code 16 / opencode 22 / Copilot 14 / Grok 9)에서 보이듯 문서 분량의 상당 부분이 하네스 분기다. 그 결과:
  - **Claude Code에 대한 규정이 Cursor·Codex보다 훨씬 얕다.** 예를 들어 `new-work.md`는 "on the web, where **this harness runs no design hook**"이라고 훅 없는 웹 빌드를 전제한 문장을 두는데, 훅은 Claude Code에서 지원되는 기능(`$impeccable hooks on`)이다. **훅이 켜졌는지에 따라 이 문장의 유효성이 갈리지만 조건이 명시되지 않는다.**
  - Grok Build는 per-edit 리마인더가 원리적으로 불가(stdout 폐기), Cursor는 Stop 딥 패스 불가, Copilot은 딥 패스 미지원 → **같은 스킬이 하네스마다 다른 품질 게이트를 갖는다.** 어느 조합에서 무엇이 꺼지는지 한눈에 보는 표가 없다.
- **서브에이전트 의존이 품질의 전제인데, 강등 경로의 품질 손실이 정량화되지 않는다.** `critique`는 A/B 격리를 "의무"로 규정하고 인라인을 "가능하지만 허용되지 않음"으로 못박은 뒤, 서브에이전트가 없으면 순차 실행 + 배너로 강등한다. 그런데 **배너는 사실 공개일 뿐, 순차 실행된 크리틱을 어느 정도 신뢰해야 하는지는 원문에 없다.** finish reviewer도 동일(`degraded/finish-reviewer.md` 37줄이 41줄 TOML 에이전트를 대체).
- **`reference/critique.md` 828줄은 단일 커맨드 문서로 과하다.** Nielsen 10휴리스틱 채점 가이드(§416–620, 약 200줄)와 페르소나 5종(§651–810, 약 160줄)이 문서 안에 인라인되어 있어, `critique`를 호출하는 순간 이 전체가 컨텍스트에 들어온다. 다른 커맨드가 참조할 수 있는 공용 reference로 분리되어 있지 않다.
- **`craft.md`가 5줄만 남은 deprecated alias로 남아 있다.** SKILL.md가 직접 "adds nothing"이라고 쓰면서도 Commands 테이블의 첫 행을 차지한다. 테이블을 읽는 에이전트에게는 23개 중 1개가 노이즈다.
- **`.impeccable/` 디렉터리가 프로젝트에 상당한 상태를 쓴다.** config, mocks, review 스크린샷, build state, live 세션 저널, critique 스냅샷. 스크린샷과 comp은 바이너리이며, **무엇이 커밋 대상이고 무엇이 아닌지가 SKILL.md 수준에서 규정되지 않는다**(`config.local.json`만 gitignore 대상으로 명시). 5.2MB 스킬이 프로젝트 저장소를 얼마나 키우는지 예측하기 어렵다.
- **이미지 생성 경로가 OpenAI에 고정되어 있다.** `generate-image.mjs`는 `OPENAI_API_KEY` + `api.openai.com`만 지원하고, 대안은 "하네스 네이티브 이미지 툴"이다. 하네스 툴도 키도 없으면 comp-led → code-led 강등이 되는데, **이 강등은 설계된 분기로 명시되어 있어(원문: "by design, not by drift") 처리 자체는 `ui-ux-pro/design`의 `GEMINI_API_KEY` 미명시보다 훨씬 낫다.** 다만 comp-led와 code-led 결과물 품질 차이는 문서화되지 않는다.
- **`concept-seed.mjs`의 무작위성이 재현성과 맞바꾼 것이다.** 원문은 주사위가 "ranking rut"을 깨는 장치라고 근거를 명시하고(`ui-ux-pro/design`의 근거 없는 "randomly invoke"와 대비된다) `IMPECCABLE_CONCEPT_SEED`로 시드를 고정할 수 있다. 하지만 **new-work가 이 스크립트 실행을 "contract violation" 수준으로 강제**하므로, 같은 브리프에 같은 결과를 원하는 사용자는 환경 변수를 알아야 한다 — **SKILL.md에는 그 변수가 나오지 않는다.**
- **네이티브 경로는 검증 계층이 얇다.** 원문이 직접 인정한다: 디텍터는 HTML/CSS만 읽으므로 네이티브에서 완전히 건너뛰고, **"the reviewer's floor check is the only slop gate"**. 81개 규칙과 61개 안티패턴이라는 이 스킬의 최대 강점이 iOS/Android에서는 작동하지 않으며, `ios.md`(51줄) + `android.md`(46줄)가 그 공백을 메운다.
- **"the brief wins"와 디텍터가 구조적으로 충돌한다.** 브리프가 그라디언트 텍스트나 하드 오프셋 섀도를 요구하면 지침상 정당한데, 디텍터는 규칙 위반으로 계속 보고한다. 해결책은 `ignoreRules`/`ignoreValues` 설정과 인라인 무시인데, **"브리프가 획득한 예외"를 config로 승격하는 절차가 hooks.md에만 있고 "How to design"의 브리프 우선 규칙과 연결되어 있지 않다.** 같은 실행 안에서 지침은 허용하고 훅은 매 편집마다 경고하는 상태가 될 수 있다.
- **검증 상한(2라운드)이 비용 정책이면서 품질 상한이기도 하다.** 원문은 무인 실행에서 2라운드로 끝내고, 열린 항목이 남으면 사용자에게 표를 넘긴다. 합리적이지만 결과적으로 **"열린 물질적 결함이 남은 채로 종료되는 것이 정상 경로"**다. 원문이 이를 감추지 않고 "put the table in front of them"으로 규정한 점은 정직하지만, 사용자가 이 계약을 모르면 "완료"로 오해할 수 있다.
- **강점으로 기록해 둘 것 — 분석한 스킬 중 유일한 패턴 3개**:
  1. **에이전트의 자기 검증을 불신하는 구조.** finish reviewer가 빌드 스레드를 상속하지 않고(`fork_turns: 0`), 브라우저도 없이 전달된 증거만 본다. 원문이 이유까지 쓴다: "a reviewer that inherits your transcript inherits your framing, your optimism, and your abstractions."
  2. **증거 유효성 검사(check 0)를 리뷰의 첫 단계로 둔 것.** 검은 화면, 파일명과 내용 불일치, 잘린 캡처를 먼저 걸러내고 `recapture`로 되돌린다. "a verdict derived from a broken capture **launders the breakage into an approval**."
  3. **보고 문구까지 규정한 것.** "the reviewer scored all three fixes resolved"는 지지되는 주장, "no material issues remain"은 아니다 — **에이전트가 부분 검증을 전체 승인으로 포장하는 것을 문장 단위로 금지**한다.
