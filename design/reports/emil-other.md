# emilkowalski 스킬 분석 (애니메이션 계열 제외 8종)

공통 사항:
- 모든 폴더의 `*.ko.md` 파일은 원본 `*.md`의 한국어 번역본이다(사용자가 추가, frontmatter description까지 번역). 내용은 원본과 같으므로 분석은 영어 원본 기준이다.
- 출처: `emilkowalski/skills-lock.json` (95줄)에는 `emilkowalski/skills` GitHub 저장소의 스킬 15개가 hash와 함께 기록되어 있다. 이 보고서의 8개 외에 `animate`, `animate-expo`, `animation-performance`, `animation-vocabulary`, `find-animation-opportunities`, `improve-animations`, `review-animations`가 있다. 본문에서 이 스킬들을 서로 참조한다(예: "for motion use review-animations").
- 8개 모두 같은 **"Initial Response" 패턴**을 쓴다. 질문 없이 호출되면 정해진 한 문장("I'm ready to ..., my knowledge comes from Emil Kowalski's ...")만 답하고 멈춘다.
- 신작 스킬(break-ui, prototype, mobile-native)은 공통 골격을 따른다: `Operating Posture`(페르소나 + "실패 모드 두 가지, 첫째가 더 나쁘다") → `Hard Rules`(번호 목록) → `Workflow`(Phase별 **Completion criterion**) → `Required Output Format` → `Invocation Variants` 표 → `Tone`.
- 스크립트, MCP, 서브에이전트는 하나도 없다. 전부 순수 지식/절차 문서다.

---

## emilkowalski/emil-design-eng
- 파일 구성:
  - `SKILL.md` (674줄): 원칙, 애니메이션 결정 프레임워크, 컴포넌트 규칙, 성능, 접근성, 리뷰 체크리스트를 담은 단일 문서
  - `SKILL.ko.md` (695줄): 한국어 번역
- frontmatter: `name: emil-design-eng`, description: "This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great." 호출 플래그는 없다(모델 자동 호출 가능). 다만 description에 "Use when ..." 트리거 문구가 없어서 자동 발동은 약하다.
- 트리거/언제 쓰나: UI 폴리시, 컴포넌트 설계, 애니메이션 결정, UI 코드 리뷰. 다른 스킬(break-ui)이 "시각적 디자인 비평은 emil-design-eng"으로 넘긴다.
- 입력 → 출력: UI 코드나 질문을 받아 조언, 코드, 리뷰를 낸다. 리뷰할 때는 **Before | After | Why 마크다운 표가 필수 형식**이다.
- 동작 흐름:
  1. 질문 없이 호출되면 정해진 한 문장만 답한다.
  2. 애니메이션을 작성하기 전에 "Animation Decision Framework" 4문항을 순서대로 답한다: ①애니메이션이 필요한가(빈도) ②목적 ③easing ④duration.
  3. 리뷰 요청이면 하단 "Review Checklist" 표의 항목을 점검하고 Before/After/Why 표로 출력한다.
  - 절차형 Phase나 도구 사용은 없다. 지식 참조형이다.
- 핵심 규칙/지식:
  - 빈도별 애니메이션 결정: "100+ times/day … No animation. Ever." / "Never animate keyboard-initiated actions." (예: Raycast)
  - easing 결정 트리: 진입/퇴장 → ease-out, 화면 내 이동 → ease-in-out, hover/색 → ease, 상시 움직임 → linear. "**Never use ease-in for UI animations.**"
  - 커스텀 곡선: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`
  - duration 표: 버튼 press 100–160ms, 툴팁 125–200ms, 드롭다운 150–250ms, 모달/드로어 200–500ms. "**UI animations should stay under 300ms.**"
  - 버튼 `:active { transform: scale(0.97) }`(0.95–0.98), "Never animate from scale(0)"(0.95 + opacity 0), popover는 `transform-origin: var(--transform-origin)`(모달은 center 유지)
  - 툴팁은 첫 번째 이후 delay와 애니메이션을 생략한다(`[data-instant]{transition-duration:0ms}`).
  - interruptible UI에는 keyframes 대신 CSS transitions. crossfade가 어색하면 `filter: blur(2px)`로 가린다(20px 미만).
  - `@starting-style`로 진입 애니메이션(useEffect mounted 패턴 대체)
  - clip-path 활용 패턴: 탭 색 전환(리스트 복제 + clip), hold-to-delete(2s linear 누르기 / 200ms ease-out 놓기), 스크롤 이미지 reveal, 비교 슬라이더
  - 제스처: velocity `> 0.11`이면 거리와 무관하게 dismiss, 경계 damping, pointer capture, 멀티터치 무시
  - 성능: transform/opacity만 애니메이트, CSS 변수 상속 재계산 주의, Framer Motion `x/y` shorthand는 하드웨어 가속이 안 되므로 `transform: "translateX()"` 문자열 사용, 부하 상황에서는 CSS가 JS보다 낫다, WAAPI
  - 접근성: reduced-motion은 "fewer and gentler, not zero", hover는 `@media (hover: hover) and (pointer: fine)`로 게이트
  - Sonner 원칙 6개(DX, 좋은 기본값 > 옵션, 이름, 보이지 않는 엣지케이스 처리, transitions, 문서 사이트)
  - stagger 30–80ms, 디버깅(2–5배 슬로모션, 프레임 단위, 실기기)
  - 11행짜리 Review Checklist 표(`transition: all`, scale(0), ease-in, origin, 키보드 애니메이션, >300ms, hover 게이트, keyframes, FM x/y, 대칭 enter/exit, stagger)
- 의존성: 없음. 코드 예시가 Base UI(`--transform-origin`, `data-starting-style`)와 Framer Motion을 전제한다. 외부 링크는 easing.dev, easings.co.
- 장점 (가져올 만한 것):
  - 빈도 → 애니메이션 여부 표와 easing 결정 트리는 판단 절차로 그대로 쓸 수 있다.
  - 정확한 cubic-bezier 값과 duration 표
  - Before/After/Why 리뷰 표 형식 강제(wrong format 예시까지 포함)
  - Review Checklist 표는 lint처럼 기계적으로 적용할 수 있다.
  - clip-path 패턴과 제스처 velocity 수치
- 단점/한계 (버릴 만한 것):
  - 철학 서론("Taste is trained", Paul Graham 인용)은 토큰만 쓰고 행동 지시가 없다.
  - description에 트리거 조건이 없다.
  - 애니메이션 비중이 압도적이고 레이아웃, 타이포, 색, 간격 규칙은 거의 없다. "디자인 엔지니어링" 이름에 비해 범위가 좁다.
  - 문서 안 모순: 체크리스트의 "Same enter/exit transition speed → Make exit faster than enter (e.g., enter 2s, exit 200ms)"는 hold-to-delete에서만 맞고 일반 규칙으로는 부정확하다.
  - Sonner/Vercel 일화는 사례로는 좋지만 규칙으로 압축할 수 있다.
  - Phase나 completion criterion이 없어 리뷰 범위가 모호하다.

## emilkowalski/apple-design
- 파일 구성:
  - `SKILL.md` (290줄): WWDC 기반 유동적 인터페이스 원칙 17개 섹션과 Quick Reference
  - `SKILL.ko.md` (291줄): 번역
- frontmatter: `name: apple-design`, description: "Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring animations, drag/swipe/sheet interactions, momentum and interruptible transitions, translucent materials and depth, typography (optical sizing, tracking, leading), reduced-motion, or the design foundations (feedback, spatial consistency, restraint) behind Apple-style interfaces." 플래그 없음(자동 호출 가능, 트리거 문구가 구체적).
- 트리거/언제 쓰나: 제스처, 스프링, 드래그/스와이프/시트, 반투명 머티리얼, 타이포, reduced-motion, Apple식 디자인 원칙.
- 입력 → 출력: 질문이나 코드를 받아 조언과 웹 코드(CSS, Pointer Events, Motion)를 낸다. 정해진 출력 형식은 없다.
- 동작 흐름: 지식 참조형이다. Initial Response 후 섹션 1–17을 필요에 따라 적용한다. Phase, 체크리스트 출력 강제, 도구 사용은 없다.
- 핵심 규칙/지식:
  - 관통 원칙: "motion starts from the current on-screen value, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant."
  - Response: pointer-down 시점에 피드백, 드래그 중에는 연속 1:1 피드백, 300ms 탭 지연과 debounce 점검
  - Direct manipulation: `setPointerCapture`, grab offset 유지, velocity 계산을 위한 위치 히스토리
  - Interruptibility: "Always animate from the *presentation* (current) value", 제스처 기반 UI에는 CSS transitions/keyframes를 피한다(**emil-design-eng의 "transitions 선호"와 범위가 다름**), X/Y 스프링 분리
  - 스프링 파라미터 damping/response 표: 이동 1.0/0.4, 회전 0.8/0.4, 드로어 0.8/0.3. 기본은 critically damped(1.0), bounce(~0.8)는 "only when the gesture itself carried momentum"
  - Velocity handoff: `relativeVelocity = gestureVelocity / (target − current)`
  - Momentum projection 함수: `(v/1000) * d / (1 - d)`, `d≈0.998`(textbook `v²/2a`가 아님)
  - Rubber-band 공식: `(overshoot * dim * 0.55) / (dim + 0.55*|overshoot|)`
  - 제스처: ~10px hysteresis, 모든 제스처를 병렬로 인식, double-tap 지연 최소화
  - Materials: `backdrop-filter: blur(20px) saturate(180%)`, 밝은 반투명 위에 밝은 반투명을 쌓지 않는다, 큰 표면일수록 두꺼운 blur와 그림자, scrim(모달) vs 비차단 패널, 1px 구분선 대신 scroll edge effect, "Materialize, don't just fade"
  - Multimodal feedback 3원칙: Causality, Harmony(같은 프레임), Utility
  - 접근성 신호 3종: `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more`. 0.2Hz 근처 루프 진동은 피한다.
  - 타이포: 크기별 tracking(디스플레이 `-0.02em`, 본문 ~0), leading은 크기에 반비례, 계층은 weight+size+leading 세트로, rem 단위, system-ui 우선
  - Apple 8원칙(Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity ≠ minimalism, Craft, Delight), 피드백 4종, wayfinding 4문항, 구체적 라벨
  - Quick Reference 표 14행
- 의존성: 없음. `motion` 라이브러리 예시가 있고 Vaul, Embla를 언급한다.
- 장점:
  - 정량 공식(projection, rubber-band, velocity 정규화)과 스프링 값 표는 다른 스킬에 드문 고유 지식이다.
  - 머티리얼/깊이와 reduced-transparency/contrast까지 다루는 접근성
  - 타이포 tracking/leading 규칙(emil-design-eng에 없음)
  - Quick Reference 표가 압축이 잘 되어 있다.
- 단점/한계:
  - 절차, 출력 형식, 체크리스트 강제가 없다(리뷰 시 무엇을 내놓을지 불명확).
  - 16절 "Principles of Great Design (WWDC 2026)" 등 원칙 서술은 일반론에 가깝다.
  - emil-design-eng와 스프링, 원점, reduced-motion, 슬로모션 리뷰가 중복된다. "CSS transitions 지양(제스처)" vs "transitions 선호(빠른 토글)"의 범위 구분이 명시되지 않아 함께 로드하면 혼동할 수 있다.
  - 웹 API 매핑이 일부 근사적이다(additive animation 대체를 "spring library 선택"으로 넘김).

## emilkowalski/break-ui
- 파일 구성:
  - `SKILL.md` (175줄): 적대적 스트레스 테스트 워크플로 6 Phase, 실패 시그니처 표, 출력 형식
  - `CATALOG.md` (135줄): 필드 유형별 현실적 worst-case 값 카탈로그(이름, 이메일/URL/ID, 라벨, 숫자, 컬렉션, 시간, 미디어, 상태, 환경)
  - `SKILL.ko.md`, `CATALOG.ko.md` (각 175/135줄): 번역
- frontmatter: `name: break-ui`, description: "Try to break a piece of UI by feeding it worst-case data — long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, long labels, non-Latin text, emoji, extreme numbers — then render it behind a "Demo data / Worst case" toggle and report everything that broke, with the fix for each. Use when the user asks to stress-test, break, or find edge cases in a component or screen, or to "try the worst case". For visual design critique use emil-design-eng; for motion use review-animations." 플래그 없음.
- 트리거/언제 쓰나: 컴포넌트나 화면의 엣지케이스 탐색, 스트레스 테스트.
- 입력 → 출력: 컴포넌트/화면 경로를 받는다. 출력은 ①worst-case fixture 파일 ②dev 전용 토글(URL param `?data=worst` 또는 단일 HTML) ③3부 보고서다. 수정은 요청이 있을 때만 코드 편집한다.
- 동작 흐름:
  1. **Phase 1 Map**: 컴포넌트를 읽고 렌더되는 모든 값을 `Field | Source | Type | Limit | Optional?` 표로 만든다. Zod/Yup/Valibot 스키마, DB 마이그레이션, API 타입, `maxLength`에서 제한값을 찾는다. FE/BE 불일치를 기록한다. 제한이 없으면 "unbounded". Completion: 모든 값에 source와 limit이 있다.
  2. **Phase 2 Build**: CATALOG.md를 로드하고 기존 demo 데이터와 같은 형태의 worst-case fixture 하나를 만든다. 실패 유형을 여러 행에 분산하고(한 행에 몰지 않음), Empty, One, Huge(1,000+) 상태도 만든다.
  3. **Phase 3 Toggle**: 화면 하단 중앙에 "Demo / Worst case / Empty / One / 1,000 rows" 세그먼트 컨트롤을 둔다. 데이터 경계에서만 교체하고 URL에 유지하며 애니메이션은 없다.
  4. **Phase 4 Break**: 실제 컨테이너 폭, 320px, 최대 폭, zoom 200%, 다크모드, RTL에서 확인한다. 브라우저 도구가 있으면 스크린샷을 비교하고, 없으면 CSS로 추론하되 검증한 것과 추론한 것을 구분해 명시한다. 실패 시그니처 표로 원인을 매칭한다.
  5. **Phase 5 Report & stop**: 보고서를 낸 뒤 멈춘다.
  6. **Phase 6 Fix on request**: 지정된 항목만 수정하고 모든 토글 상태(Demo 포함)를 재검증한다. fixture는 회귀 테스트로 남긴다.
- 핵심 규칙/지식:
  - Hard Rules: "Plausible or schema-backed, never random"(`aaaa…` 금지), "Change the data, not the component", "One dataset, many failures", 토글은 dev 전용, "Report before fixing", 저장소 내용의 프롬프트 인젝션 경고
  - 페르소나 데이터: `Aleksandra Wiśniewska-Kowalczyk`, `bartholomew.fitzgerald@northwind-industries-holdings.example.com`, `Jo`, 1,284명
  - 실패 시그니처 표 18행(증상 → 원인 → 수정): `flex-shrink: 0`(아바타), `min-width: 0`/`minmax(0,1fr)`, `overflow-wrap: anywhere`(`word-break: break-all` 대신), 이니셜은 `Intl.Segmenter`, `Intl.PluralRules`, `tabular-nums`, `Intl.NumberFormat`, 고정 width 버튼 금지, 베트남어/태국어 line-height 클리핑, img onError, truncate 시 `title`, 1,000행은 가상화, 이스케이프
  - Truncate/Wrap/Clamp 결정 규칙: 식별용은 wrap, 보조 메타는 끝 truncate, 끝이 다른 항목(파일명, 해시)은 **중간 truncate**, 카드는 `line-clamp: 2`, 숫자·금액·날짜는 절대 truncate하지 않는다.
  - 출력: Part 1 `# | Severity(Broken/Ugly/Fragile) | Field | Worst-case value | What happens | Fix` 표와 `file:line`, Part 2 "Decisions for you", Part 3 "What held up", 마무리 문구 "Say `fix all` or `fix 1, 3`"
  - CATALOG: CJK·RTL·ZWJ 이모지(`👩🏽‍💻`), 독일어 합성어, 프랑스어 +30%, `0.1+0.2`, `1970-01-01`, 타임존 경계, 404 아바타, 4000×200 이미지, 모든 상태 enum 동시 노출, 현재 사용자 "You", 터치 기기 hover 전용 액션 등. 이메일/URL은 `example.com` 사용 규칙.
  - Invocation Variants: `<component>`, `<component> + fix`, `fix all`/`fix 1, 3`, `data only <component>`
- 의존성: 선택적으로 브라우저 스크린샷 도구(없으면 추론으로 대체). 외부 스킬은 참조만 한다(emil-design-eng, review-animations, prototype).
- 장점:
  - 데이터 경계로만 주입하는 방식과 fixture를 회귀 테스트로 보존하는 방식은 재현 가능하고 방법론이 탄탄하다.
  - 증상 → 원인 → CSS 수정 표는 그대로 복사할 가치가 있다.
  - Truncate/wrap/clamp 결정 규칙, Severity 3단계, "What held up" 섹션(테스트가 실제로 수행됐음을 증명)
  - 검증한 것과 추론한 것을 구분하는 정직성 규칙, 프롬프트 인젝션 방어 규칙
  - Phase마다 completion criterion이 있다.
- 단점/한계:
  - 토글 UI를 프로젝트에 심는 작업은 비용이 크다(작은 컴포넌트에는 과함). `data only` 반대 방향의 "report only" 변형이 없다.
  - React/웹 전제(네이티브 앱에는 적용이 제한적)
  - 시각 검증은 브라우저 도구 없이는 추론 의존

## emilkowalski/prototype
- 파일 구성:
  - `SKILL.md` (98줄): 발산형 변형 3–5개 제작 워크플로
  - `PICKER.md` (197줄): 변형 전환용 picker의 고정 스펙(HTML 마크업, CSS, 행동 계약, JS 레퍼런스 구현)
  - `SKILL.ko.md`(98), `PICKER.ko.md`(200): 번역
- frontmatter: `name: prototype`, description: "Build multiple genuinely different versions of a UI piece you describe, rendered behind a visual picker so you can flip through them live and promote the one that feels right. Only runs when explicitly invoked; it does not trigger on its own." **`disable-model-invocation: true`** (사용자가 명시적으로 호출해야만 동작)
- 트리거/언제 쓰나: `/prototype <설명>`. 하나의 UI 조각에 대해 여러 방향을 탐색할 때.
- 입력 → 출력: "토스트", "가격 카드" 같은 설명을 받는다. 출력은 격리된 프로토타입 라우트(`/prototypes/<slug>`, 변형당 파일 1개 + harness)나 단일 HTML, 그리고 변형 비교 표다. 선택 후 프로덕션에 통합하고 프로토타입을 삭제한다.
- 동작 흐름:
  1. **Scope**: 한 번에 하나만 한다. 범위가 넓으면 가장 레버리지가 큰 조각을 골라 이유를 말한다. 브리프를 한 문장으로 재진술한다.
  2. **Recon**: 스택, 토큰(색, 반경, 간격, 폰트, easing), 제품 성격, 렌더 맥락을 파악한다. 프로젝트가 없으면 중립 회색, 액센트 1개, 시스템 폰트를 쓴다.
  3. **Choose directions**: 기본 3개, 최대 5개. 각 변형에 이름(Quiet/Editorial/Playful/Dense, "Option A" 금지)과 축(layout, density, personality, motion, interaction model)을 붙인다. 색이나 카피만 다른 변형은 하나로 합친다. Completion: 축 위치 중복 없음.
  4. **Build harness**: PICKER.md를 **verbatim**으로 복사한다. 실제 맥락에서 변형 하나씩 풀사이즈로 렌더하고, 썸네일 나란히 보기는 금지한다. 변형 전환은 즉시(애니메이션 없음).
  5. **Verify & hand off**: 직접 실행해 모든 변형, 상호작용, 콘솔 에러 0을 확인하고, 가능하면 스크린샷을 찍는다. `# | Variant | Axis | When it's the right choice | Its cost` 표를 내고 **멈춘다**(선택은 사용자 몫, 미리 추천 금지).
  6. **Promote**: 선택된 변형을 프로젝트 규칙에 맞게 통합하고 프로토타입을 삭제한다. `riff`면 해당 방향 주변으로 다시 발산한다.
- 핵심 규칙/지식:
  - "three tints of the same idea waste the picker". 발산이 핵심이지만 각 변형은 Emil 기준(ease-out, <300ms, transform-origin, transform/opacity, reduced-motion)을 충족해야 한다.
  - 프로덕션 코드는 탐색 중 건드리지 않는다. lorem ipsum, 죽은 버튼 금지.
  - Picker 스펙: 하단 중앙 다크 글래스 pill, `rgba(10,10,10,0.82)`, `blur(12px) saturate(1.4)`, 13px 시스템 폰트, 하이라이트는 250ms `cubic-bezier(0.23,1,0.32,1)`로 슬라이드(첫 페인트 후 `data-ready`), 항목 28px, `:active scale(0.97)`, 변형이 하단을 차지하면 `data-position="top"`(유일하게 허용된 수정), replay 버튼은 조건부
  - 행동 계약: 숫자키 1–N, ←/→, R=replay, 입력 포커스나 modifier 키 상태면 무시, `?v=2` URL로 유지, 전환 시 re-mount로 진입 애니메이션 재실행
  - Invocation: `<desc>`, `<desc> x5`, `riff <variant>`, `keep <variant>`, `keep <variant>, leave the picker`
- 의존성: 프로젝트 dev 서버(선택), 브라우저 스크린샷 도구(선택). 외부 스킬은 참조만(review-animations, improve-animations, pick-ui-library).
- 장점:
  - "축(axis)을 명시해야 변형이 성립한다"는 규칙으로 가짜 다양성을 막는다.
  - picker를 verbatim 스펙으로 고정해 harness가 디자인 판단 대상이 되지 않게 한다. JS/CSS까지 바로 쓸 수 있는 형태다.
  - 정직한 tradeoff 표("Its cost"), 사용자 선택 전 멈춤, 정리(cleanup) 규칙
  - break-ui와 같은 "하단 중앙 토글 + URL 유지" 패턴이라 재사용 가능하다.
- 단점/한계:
  - `disable-model-invocation`이라 자동 발동이 안 된다(의도된 것).
  - 변형 3–5개를 실제로 완성 구현하므로 토큰과 시간 비용이 크다.
  - picker 스펙 197줄을 매번 로드한다.
  - 프레임워크 이식은 "idiomatically" 수준의 지시만 있다.

## emilkowalski/pick-ui-library
- 파일 구성:
  - `SKILL.md` (85줄): 큐레이션된 라이브러리 목록과 사용 절차
  - `SKILL.ko.md` (85줄): 번역
- frontmatter: `name: pick-ui-library`, description: "Pick the right library for a given frontend task from a curated, opinionated list — numbers, OTP inputs, charts, command menus, virtualization, drag and drop, toasts, state, styling, and more. Only runs when explicitly invoked; it does not trigger on its own." **`disable-model-invocation: true`**
- 트리거/언제 쓰나: 명시적 호출. "토스트 필요해", "DnD 뭐 써?" 같은 질문.
- 입력 → 출력: 작업 설명을 받아 라이브러리 하나를 추천(1문장 설명)한다. 요청 범위에 포함되면 설치와 연결까지 한다.
- 동작 흐름:
  1. 사용자가 말한 라이브러리가 아니라 **작업**을 식별한다.
  2. `package.json`을 확인한다. 목록의 라이브러리가 이미 있으면 그것을 쓰고, 경쟁 라이브러리가 있으면 지적만 하고 교체는 요청 시에만 한다.
  3. 메뉴를 나열하지 않고 하나만 추천한다.
  4. 목록에 없으면 목록 밖이라는 것을 명시한 뒤 자체 지식으로 추천한다.
- 핵심 규칙/지식 (목록):
  - 프리미티브: base-ui, cmdk, Sonner, input-otp, Leva(대안 dialkit)
  - 모션/비주얼: motion, NumberFlow, torph, Cobe, Satori, shiki. "A simple hover or fade doesn't need it — plain CSS"
  - 차트: Liveline(실시간 스트리밍) vs recharts(그 외)
  - 상호작용: dnd kit, Virtuoso
  - 상태/스타일: zustand, clsx(임시 조건부) vs cva(타입 있는 변형), next-themes
  - Common mismatches 6개(직접 만든 토스트 → Sonner, div 드롭다운 → base-ui, 텍스트 재렌더 숫자 → NumberFlow, 1,000행 → Virtuoso, prop 그물 → zustand, 중첩 ternary className → clsx/cva)
- 의존성: 없음(npm 설치 가능).
- 장점:
  - "하나만 추천", "기존 의존성 존중", "목록 밖이면 명시"라는 결정 규칙이 깔끔하다.
  - Common mismatches는 코드 리뷰 휴리스틱으로 재사용할 수 있다.
  - 짧다(85줄).
- 단점/한계:
  - React 생태계 전용이고 작성자 취향 목록이라 시간이 지나면 낡는다(버전, 대안 근거 없음).
  - Sonner를 추천하는 것은 작성자 본인의 라이브러리라 이해충돌이 있다.
  - 폼, 라우팅, 데이터 패칭, 날짜 등 큰 카테고리가 빠져 있다.

## emilkowalski/ask-sonner
- 파일 구성:
  - `SKILL.md` (88줄): Sonner 셋업, 호출 선택, 레시피, 스타일링 사다리, 트러블슈팅
  - `API.md` (64줄): `<Toaster />` props, `toast()` 옵션, 함수 표(타입과 기본값)
  - `SKILL.ko.md`(88), `API.ko.md`(64): 번역
- frontmatter: `name: ask-sonner`, description: "Guide to Sonner, the React toast library — install and wire up the Toaster, pick the right toast() call, promise and loading toasts, updating, dismissing and persisting toasts, styling, theming and icons, positioning and multiple toasters. Use when working with Sonner or troubleshooting it — toasts that don't appear, appear twice, lose their styles, ignore Tailwind classes, sit behind a modal, or don't follow dark mode." 플래그 없음.
- 트리거/언제 쓰나: Sonner를 쓰거나 Sonner 문제를 디버깅할 때.
- 입력 → 출력: 질문이나 증상을 받아 설정 코드, 수정 사항, 답변을 낸다.
- 동작 흐름: SKILL.md를 먼저 보고 답하며, 정확한 prop 이름, 타입, 기본값이 필요할 때만 API.md를 읽는다(progressive disclosure).
- 핵심 규칙/지식:
  - `<Toaster />`는 루트에 한 번만(Next.js `layout.tsx`). `toast()`는 클라이언트 전용이라 server action에서는 결과를 반환하고 클라이언트에서 호출한다.
  - 호출 선택 표(`toast.promise`, `toast.loading` + id 업데이트, `toast.custom` headless 등)
  - 같은 `id`로 다시 호출하면 업데이트된다. `duration: Infinity`면 유지된다. `onDismiss`와 `onAutoClose`는 별개다.
  - **스타일링 escalation ladder**: defaults/richColors → inline style → classNames(`!important` 필요) → headless `toast.custom`. "If you're marking more than a few things important, stop — go headless."
  - `theme` 기본값은 `'light'`(OS를 따르지 않음)
  - 트러블슈팅 표 14행(이중 Toaster, StrictMode 이중 호출, Astro 스타일 유실 시 `import 'sonner/dist/styles.css'`, Shadow DOM, stacking context, swipeDirections, toasterId, mobileOffset 16px)
- 의존성: sonner 패키지.
- 장점:
  - "증상 → 원인 → 수정" 트러블슈팅 표와 "스타일링 사다리" 형식은 다른 라이브러리 가이드 스킬의 템플릿으로 쓸 수 있다.
  - SKILL과 API 레퍼런스를 분리한 progressive disclosure 구조
- 단점/한계:
  - Sonner 한 라이브러리 전용이라 범용 디자인 스킬에 넣을 내용은 거의 없다(형식만 차용).
  - API가 바뀌면 낡는다(버전 명시 없음).

## emilkowalski/mobile-native
- 파일 구성:
  - `SKILL.md` (311줄): 모바일 웹을 네이티브처럼 느끼게 하는 플랫폼 레이어 수정 11개, Baseline, Never Ship
  - `SKILL.ko.md` (327줄): 번역
- frontmatter: `name: mobile-native`, description: "Make a web app feel native on a phone — the small CSS and meta-tag fixes that separate "a website in a browser" from something that feels installed. Covers sticky hover states, tap highlight flashes, the 100vh bug, inputs that zoom the page, laggy taps, pull-to-refresh hijacking scroll, content under the notch, long-press selecting button text, carousels that scroll the wrong way, mismatched status bars, and the rule that you test on real hardware. Use when … mobile … PWA, a bottom sheet, a carousel, … For motion itself use animate; for React Native use animate-expo." 플래그 없음.
- 트리거/언제 쓰나: 모바일용 웹앱 제작이나 리뷰, "Chrome에서는 되는데 폰에서 이상함", PWA, 바텀시트, 캐러셀.
- 입력 → 출력: 웹앱 코드를 받아 **직접 코드를 수정**하고, 그 뒤 짧은 3줄 요약(What was wrong / What changed / What needs a phone)을 낸다. "Don't pad this into a report. The code is the deliverable."
- 동작 흐름:
  1. 증상 표에서 사용자 증상을 매칭한다.
  2. 해당 섹션의 why와 코드를 적용한다(why가 적용되는 곳에만).
  3. 새 앱이면 Baseline(meta와 CSS)을 먼저 깐다.
  4. "Never Ship" 표로 자체 점검한다.
  5. 코드로 검증 가능한 것과 실기기가 필요한 것을 구분해 보고한다.
- 핵심 규칙/지식:
  - Hard Rules: 이유와 함께 수정, 디바이스 스니핑 대신 미디어쿼리, 터치와 마우스는 배타적이지 않음, **줌 비활성화 금지**(`user-scalable=no`, `maximum-scale=1`), 실기기 테스트
  - 11개 수정: hover는 `(hover: hover) and (pointer: fine)` 게이트, `-webkit-tap-highlight-color: transparent`, 앱 셸 `100dvh` / 히어로 `100svh`, input `font-size: 16px`(iOS 줌 방지)와 `inputmode`/`enterkeyhint`, `touch-action: manipulation`과 `:active` 피드백 100–160ms, `overscroll-behavior: none`(root)/`contain`(자식), `viewport-fit=cover` + `env(safe-area-inset-*)`, 컨트롤에만 `user-select: none` + `-webkit-touch-callout: none`, 캐러셀 `touch-action: pan-y`(또는 scroll-snap), `theme-color`를 color-scheme별로
  - Baseline: viewport meta에 `interactive-widget=resizes-content`, `-webkit-text-size-adjust: 100%`
  - Never Ship 표 12행
  - 실기기 디버깅 절차(LAN IP, Safari Develop, `chrome://inspect`, 오래된 폰, 키보드 열린 상태, 가로 모드, PWA standalone)
- 의존성: 없음(실기기 권장). 형제 스킬 animate, animate-expo, review-animations를 참조한다.
- 장점:
  - 증상 → 수정 표, Baseline 블록, Never Ship 표의 3단 구성으로 즉시 적용할 수 있다.
  - "Fixing what the desktop shows you" 실패 모드와 "검증 가능/불가능 구분" 보고
  - 출력이 최소(코드가 결과물)라 토큰 효율이 좋다.
- 단점/한계:
  - 웹 플랫폼 레이어만 다룬다(디자인 판단 없음).
  - 일부 사실은 브라우저 버전에 따라 낡을 수 있다(Tailwind v3/v4 hover 설명 등).
  - emil-design-eng, apple-design과 hover 게이트, `:active` scale, 실기기 테스트가 중복된다.

## emilkowalski/write-swift
- 파일 구성:
  - `SKILL.md` (396줄): Swift 6.x 작성 가이드 16개 섹션과 Quick Reference
  - `SKILL.ko.md` (398줄): 번역
- frontmatter: `name: write-swift`, description: "How to write modern Swift well — modeling with value types, Swift 6 data-race safety and approachable concurrency (@concurrent, main-actor-by-default, actors, task groups), protocols and generics (some vs any), API design, performance and ARC, Swift Testing, macros, and the modern language features agents don't know about yet. Use when writing, reviewing, or migrating Swift, or when a concurrency error, a hang, a data race, a retain cycle, or a performance problem needs fixing." 플래그 없음.
- 트리거/언제 쓰나: Swift 작성, 리뷰, 마이그레이션, 동시성/성능/ARC 문제. **디자인 스킬이 아니라 언어 가이드다.**
- 입력 → 출력: Swift 코드나 질문을 받아 코드와 조언을 낸다. 출력 형식 강제는 없다.
- 동작 흐름: 지식 참조형이다. "기본값 위계" 표에서 단계를 내려갈 때는 이유가 있어야 한다는 원칙을 적용한다. 데이터 레이스 오류는 4단계 순서로 해결하고, 마이그레이션은 6단계 순서로 진행한다. 도구 사용은 없다.
- 핵심 규칙/지식:
  - 툴체인 기준 Swift 6.3, ⚠는 미출시 6.4 기능
  - 관통 원칙: "progressive-disclosure language … buy dynamism only where you can point at the reason". 위계: struct → class, concrete → protocol, `some` → `any`, main actor sync → async → `@concurrent` → actor, Array → InlineArray/Span, safe → Unsafe
  - Swift 6.2 변경점: "marking a function `async` does *not* move it off the current actor". `@concurrent`/`nonisolated` 의미, Approachable Concurrency와 Default Actor Isolation=MainActor(라이브러리에는 쓰지 말 것)
  - Actor reentrancy, 비 FIFO, 데이터 레이스 해결 순서(공유하지 않기 → Sendable 값 → actor → Mutex/unchecked)
  - 구조화 동시성(async let, TaskGroup, discarding, Task.detached는 거의 쓰지 않음), continuation은 정확히 한 번 resume
  - SwiftUI: `@Sendable` 클로저에는 self 대신 값만 캡처, 액션 콜백은 동기적으로
  - 성능 4대 비용, `final`, existential 3-word 버퍼, `remove(at:)` 루프는 O(n²)
  - ARC: lifetime은 마지막 사용 시점에 끝난다, weak는 사이클 끊기 용도로만
  - Swift Testing(`#expect`, `#require`, arguments, withKnownIssue), Logger 프라이버시, 모던 문법 표, Quick Reference 27행
- 의존성: 없음.
- 장점 (디자인 스킬 관점):
  - "기본값 위계 표 + 내려갈 때는 이유 필요" 구조와 "Instead of → Write → Since" 표는 다른 도메인 스킬의 서술 형식으로 차용할 만하다.
  - 미출시 기능을 ⚠로 구분하고 툴체인 기준을 명시한 버전 관리 방식
- 단점/한계:
  - 디자인/UI와 무관하다(SwiftUI 동시성 일부만 관련). 디자인 스킬을 만드는 데에는 제외 대상이다.
  - 396줄로 길고, 미래 날짜(2026) 버전 정보는 빠르게 낡는다.

---

## 스킬 간 관계

| 스킬 | 유형 | 호출 | 주 출력 | 다른 스킬과 겹치는 부분 | 고유한 부분 |
| --- | --- | --- | --- | --- | --- |
| emil-design-eng | 지식 + 리뷰 | 자동(트리거 약함) | 조언, Before/After/Why 표 | apple-design(스프링, 원점, reduced-motion), mobile-native(hover 게이트, :active), prototype(품질 기준 출처) | 빈도 → 애니 여부, easing 트리, cubic-bezier 값, clip-path 패턴, 리뷰 체크리스트 |
| apple-design | 지식 | 자동 | 조언, 웹 코드 | emil-design-eng(모션 전반), mobile-native(포인터 다운 피드백) | projection/rubber-band 공식, 스프링 damping/response 표, 머티리얼, 타이포, Apple 8원칙 |
| break-ui | 절차(6 Phase) | 자동 | fixture + 토글 + 3부 보고서, 요청 시 수정 | prototype(하단 토글 harness, URL 유지) | worst-case CATALOG, 실패 시그니처 표, truncate 결정, Severity |
| prototype | 절차(6 Phase) | **수동 전용** | 변형 3–5개 + picker + tradeoff 표 → 통합 | break-ui(harness 패턴), emil-design-eng(품질 기준) | 축 기반 발산 규칙, verbatim picker 스펙 |
| pick-ui-library | 룩업 | **수동 전용** | 라이브러리 1개 추천(+설치) | ask-sonner(Sonner 추천) | 큐레이션 목록, mismatch 휴리스틱 |
| ask-sonner | 라이브러리 가이드 | 자동 | 설정, 수정 | pick-ui-library | 스타일링 사다리, 트러블슈팅 표, API.md 분리 |
| mobile-native | 수정형(fix-it) | 자동 | **코드 직접 수정** + 3줄 요약 | emil-design-eng, apple-design(hover, :active, 실기기) | 플랫폼 레이어 11개 수정, Baseline, Never Ship |
| write-swift | 언어 가이드 | 자동 | 코드, 조언 | 없음(디자인 외) | Swift 6 동시성, 모던 문법 표 |

정리:
- **디자인 원칙 코어 후보**: emil-design-eng(웹 모션/폴리시 규칙)과 apple-design(물리 기반 제스처, 머티리얼, 타이포). 이 둘은 상호 보완적이지만 "CSS transition 선호 vs 제스처에는 지양" 같은 범위 구분을 명시해 합쳐야 한다.
- **절차형 템플릿 후보**: break-ui와 prototype(Phase + Completion criterion + Hard Rules + 출력 표 + "멈추고 사용자 결정" + Invocation Variants). mobile-native의 "증상 표 → 수정 → Never Ship 자체 점검 → 검증 가능 여부 보고" 패턴도 가볍고 좋다.
- **제외 후보**: write-swift(도메인 외), ask-sonner와 pick-ui-library(특정 라이브러리 의존. 형식만 차용).
