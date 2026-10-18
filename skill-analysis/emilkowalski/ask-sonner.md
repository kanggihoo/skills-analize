# ask-sonner 분석

## 1. 개요

- **원본 경로**: `skills-collections/emilkowalski/ask-sonner/`
- **핵심 파일**: `SKILL.md` (6,944 bytes)
- **보조 파일**: `API.md` (4,545 bytes) — `<Toaster />` prop 표(16행), `toast()` options 표(22행), Functions 표(9행). "read it when you need an exact prop name, type, or default."
- **성격**: 특정 라이브러리(**Sonner**) 사용 가이드 + **트러블슈팅 매뉴얼**. 디자인 스킬이 아니라 **라이브러리 문서 스킬**이며, 이 컬렉션에서 유일하게 단일 npm 패키지에 종속된 스킬.

원문 자기 규정: "A guide skill for [Sonner](https://sonner.emilkowal.ski), the toast library. When a task involves Sonner ... **answer from this file first.**"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Guide to Sonner, the React toast library — install and wire up the Toaster, pick the right toast() call, promise and loading toasts, updating, dismissing and persisting toasts, styling, theming and icons, positioning and multiple toasters. Use when working with Sonner or troubleshooting it — toasts that don't appear, appear twice, lose their styles, ignore Tailwind classes, sit behind a modal, or don't follow dark mode."

**매칭되는 사용자 발화**
- "Sonner 설치해서 토스트 띄워줘"
- **증상 기반 발화가 트리거로 직접 열거됨**: "토스트가 안 보임", "토스트가 두 번 뜸", "스타일이 사라짐", "Tailwind 클래스가 안 먹힘", "모달 뒤에 깔림", "다크모드를 안 따라감"
- "toast.promise 어떻게 써?"

**특징**: 트리거의 절반이 **버그 증상**이다. 라이브러리 이름을 몰라도 증상만으로 매칭되도록 설계됨 (단, "Sonner"라는 단어 없이 "토스트가 두 번 뜬다"만으로 켜질지는 description의 앞부분이 Sonner에 묶여 있어 불확실).

`allowed-tools` / `metadata`: **원문에 명시 없음**.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- Sonner를 새로 설치·배선할 때 (Next.js `layout.tsx` 배치 규칙 등)
- Sonner가 오작동할 때 — 12행 Troubleshooting 표가 증상→원인→처방으로 정리됨
- 디자인 시스템 토스트를 만들 때 어느 단계까지 커스터마이즈해야 하는지 판단 (Styling escalation ladder)
- Astro / view transitions / Shadow DOM 같은 특수 환경 대응

**부적합 / 과한 상황**
- Sonner를 쓰지 않는 프로젝트 — 다른 토스트 라이브러리에는 무용
- 토스트 라이브러리를 **선택**하는 단계 → `pick-ui-library`가 맡는 영역
- 토스트의 **애니메이션 설계** → `animate` (RECIPES.md에 Toast 레시피 존재). 이 스킬은 모션 지침을 담지 않음.
- React가 아닌 스택

**형제 스킬 대신 이걸 고르는 기준**: Sonner라는 특정 패키지의 API·버그가 문제인가. 모션 품질이나 라이브러리 선택 문제라면 다른 스킬.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 해당 없음.
- **필요한 CLI/런타임/패키지**:
  - **`sonner`** (npm) — 필수. 이 스킬의 존재 이유.
  - **React** — Sonner가 React 라이브러리
  - 선택적으로 **`next-themes`** (테마 연동 예시: `<Toaster theme={resolvedTheme} />`)
  - 특수 환경: Astro / view transitions에서 `import 'sonner/dist/styles.css'`
- **네트워크**: 패키지 설치 시에만.
- **비용 발생 지점**: 없음.
- **문서 종속성**: Sonner의 실제 API 버전과 API.md의 동기 여부에 의존. 버전 명시는 **원문에 없음** — 어느 Sonner 버전 기준인지 불명확.

## 5. 워크플로우

절차형 게이트가 아니라 **참조 우선순위 + 결정 테이블**로 구성. 원문의 지시: "answer from this file first. Full prop tables ... live in [API.md](API.md); read it when you need an exact prop name, type, or default." → **점진적 로딩(progressive disclosure)** 구조.

### 1. Setup — "Two pieces, and only two"
1. **`<Toaster />` 하나만, 루트에 가깝게 마운트.** Next.js에서는 `layout.tsx`("it works inside server components"). 금지: "**Never render it per-page or conditionally; a second mounted Toaster duplicates every toast.**"
2. **`toast()`는 클라이언트 코드에서 호출.** "It's a plain function, no hook or provider needed, but it does nothing on the server: in a server action, return the result and call `toast()` in the client code that receives it."

### 2. Picking the right call — 목적→호출 매핑 테이블

| You want | Call |
| --- | --- |
| Plain message | `toast('Title')` — add `{ description }` for a second line |
| Success / error / info / warning icon | `toast.success('…')`, `toast.error('…')`, etc. |
| Spinner while you manage state yourself | `toast.loading('…')`, then update it by id |
| Loading → success/error tied to a promise | `toast.promise(promise, { loading, success, error })` |
| Button that does something | `{ action: { label, onClick } }` — closes the toast unless `onClick` calls `event.preventDefault()`; `cancel` is the secondary variant |
| Custom JSX, default toast shell | `toast(<jsx />)` |
| Custom JSX, no styles at all | `toast.custom((t) => <jsx />)` — headless, `t` gives you the id to dismiss |

### 3. Recipes — 목적별 최소 코드
- **Update a toast**: 같은 `id`로 다시 호출. "only the props you pass change. Switching to `toast.success(…, { id })` changes the type." → `toast.promise` 없이 loading→success 흐름 구현 가능.
- **Persist**: `{ duration: Infinity }`
- **Dismiss**: `toast.dismiss(id)` / 전체는 `toast.dismiss()`
- **Read active toasts**: `useSonner()` (React 내) / `toast.getActiveToasts()` (React 외)
- **Links or components in the text**: 제목·설명에 함수 전달 — `toast(() => <a href="…">View</a>)`
- **Multiple toasters**: Toaster마다 `id`, 호출 시 `toasterId`. "Without `toasterId`, every toaster renders the toast."
- **Close callbacks**: `onDismiss`(닫기 버튼·스와이프) / `onAutoClose`(타임아웃). "They are separate; there is no single \"closed\" callback."

### 4. Styling — the escalation ladder (**핵심 분기 구조**)
"Climb only as far as the change requires; **jumping to the top rung too early is fine (it's the recommended end state), lingering in the middle is not.**"

1. **Defaults** — `richColors`(컬러풀한 success/error), `invert`(테마 반전)
2. **Inline tweaks** — Toaster의 `toastOptions={{ style: {…} }}` (전체) 또는 `toast()`별 `style`
3. **Classes on parts** — `toastOptions={{ classNames: { toast, title, description, actionButton, cancelButton, closeButton } }}`. **게이트**: "Sonner's injected styles win the cascade, so every class needs `!important` (Tailwind: `!text-red-900`). **If you're marking more than a few things important, stop — go headless.**"
4. **Headless** — `toast.custom()`. "The recommended approach for a design-system toast: wrap it in your own `toast()` abstraction. (`unstyled: true` exists as a halfway house, but headless gives more control for the same effort.)"

- **Icons**: Toaster의 `icons` prop(타입별) / 토스트별 `icon` / `null`로 제거
- **Theme**: "`theme` defaults to `'light'` and **does not track the OS.** Pass `theme=\"system\"`, or wire your theme provider"

### 5. Troubleshooting — 증상→원인→처방 (12행)
디버깅 요청의 실제 진입점. 표 전체:

| Symptom | Cause → fix |
| --- | --- |
| Toast never appears | Toaster 미마운트 또는 언마운트(조건부 렌더, 페이지별 배치). 루트에 하나. 서버 액션이면 `toast()`는 client-only. |
| Same toast appears twice | Toaster 2개(layout **and** page) — 하나만. 또는 React StrictMode dev double-invoke — 이벤트 핸들러에서 발사하거나 안정적 `id` 전달. |
| Tailwind/CSS classes have no effect | 기본 스타일이 override. `!important` 또는 `unstyled`/headless. |
| Toasts render completely unstyled (Astro, view transitions) | 주입된 스타일시트 유실 — `import 'sonner/dist/styles.css'`. |
| Unstyled inside Shadow DOM | 스타일이 `document.head`로 감. `[data-sonner-toaster]`를 포함한 style 태그를 shadow root로 복사. |
| Toast behind a modal/overlay, or clipped | 조상이 stacking context 생성(`transform`, `filter`, `overflow`) 또는 오버레이 z-index. Toaster를 document root로. |
| Dark mode ignored | `theme` 기본값 `'light'`. |
| Success/error look gray, not green/red | 기본값. `richColors` 추가. |
| Toast never closes | `duration: Infinity`, `dismissible: false`, 또는 settle되지 않는 `toast.promise`. |
| `toast.promise` stuck on loading | promise(또는 promise 반환 함수)가 첫 인자여야 하고 실제로 resolve/reject 되어야 함. |
| Swipe-to-dismiss goes the wrong way / doesn't work | 방향은 `position`에서 파생. `swipeDirections`로 override. |
| Toast shows up in every toaster | Toaster에 `id`, 호출에 `toasterId`. |
| Toasts too close to the screen edge on mobile | `offset`(desktop, default 32px), `mobileOffset`(<600px, default 16px). |

### 6. API.md 조회 — **조건부 로딩**
"read it when you need an exact prop name, type, or default." 즉 SKILL.md로 해결되면 API.md는 읽지 않음.

**사용자 확인 요구 지점**: 없음.

## 6. 디자인 지침 분석

이 스킬은 **미적 판단을 강제하지 않는다.** 디자인 컬렉션 안에 있지만 성격이 API 문서다. 그럼에도 "지침을 주는 방식"에는 이 컬렉션 공통의 패턴이 있다.

### 금지 규칙 (anti-pattern) — 원문 그대로
- "**Never render it [Toaster] per-page or conditionally; a second mounted Toaster duplicates every toast.**"
- "**If you're marking more than a few things important, stop — go headless.**" (커스터마이즈 깊이의 상한)
- "`unstyled: true` exists as a halfway house, but **headless gives more control for the same effort**." (중간 단계 비권장)
- "lingering in the middle is not [fine]" — escalation ladder의 2·3단에 머무는 것을 명시적으로 반대
- "`theme` defaults to `'light'` and **does not track the OS**" — 기본값 신뢰 금지

### 강제 규칙 — 수치 인용

수치는 전부 **라이브러리 기본값**이며 디자인 규범이 아님. API.md 기준:

| 항목 | 기본값 |
| --- | --- |
| `duration` | `4000` ms (`Infinity`로 영구) |
| `visibleToasts` | `3` |
| `gap` (expanded 시 토스트 간격) | `14` |
| `offset` (desktop) | `'32px'` |
| `mobileOffset` (<600px) | `'16px'` |
| `position` | `'bottom-right'` |
| `theme` | `'light'` |
| `dir` | `'ltr'` |
| `hotkey` | `⌥/alt + T` |
| `containerAriaLabel` | `'Notifications'` |
| `richColors` / `expand` / `closeButton` / `invert` / `unstyled` | `false` |
| `dismissible` | `true` |

### 항목별 지침

- **타이포그래피**: **원문에 지침 없음.** `title`·`description` 파트 클래스 이름만 언급.
- **컬러**: `richColors`(success/error를 컬러풀하게), `invert`(테마 반전), `theme` 3값. 팔레트나 색상 값 지침은 **원문에 명시 없음.**
- **스페이싱**: `gap: 14`, `offset: 32px`, `mobileOffset: 16px` — 라이브러리 기본값. 이유나 근거는 **원문에 명시 없음.**
- **모션**: **원문에 지침 없음.** Sonner의 positioning/stacking/swipe 동작을 headless에서도 "keeping Sonner's positioning, stacking, and swipe"로 유지한다는 언급만 있음. 스와이프 방향이 `position`에서 파생된다는 사실이 유일한 모션 관련 정보.
- **레이아웃**: `position` 6값(`top-left`/`top-center`/`top-right`/`bottom-left`/`bottom-center`/`bottom-right`), `offset` per-side 객체 형태.
- **접근성**: `containerAriaLabel` 기본 `'Notifications'`, `hotkey`(토스터 영역 포커스), `testId`(e2e용 `data-testid`), `dir`. 접근성 요구사항 자체를 강제하지는 않음.

### 지침을 주는 방식 자체

1. **결정 테이블**: "You want → Call" 7행. 목적어에서 API로 직행하도록 설계.
2. **에스컬레이션 래더**: 커스터마이즈 깊이를 4단으로 계층화하고, **어디에 머물면 안 되는지**를 명시. 단순 옵션 나열이 아니라 "언제 다음 단으로 올라가야 하는가"의 판단 기준(`!important` 개수)을 제공.
3. **증상 기반 역인덱스**: Troubleshooting 표가 원인이 아니라 **증상**을 키로 삼음. description에도 증상이 들어가 트리거 자체가 증상 기반.
4. **원인의 층위까지 설명**: 단순 처방이 아니라 메커니즘 제시 — "Sonner's injected styles win the cascade", "Styles land in `document.head`, not the shadow root", "An ancestor creates a stacking context (`transform`, `filter`, `overflow`)", "React StrictMode's dev double-invoke".
5. **2단 문서 구조**: SKILL.md(판단) / API.md(정확한 이름·타입·기본값). "answer from this file first"로 로딩 순서를 명시.
6. **"Two pieces, and only two"** — 최소 설정을 수량으로 못박아 오버엔지니어링 방지.
7. **페르소나 부여 없음**: `animate` 계열과 달리 페르소나·미학 기준선이 없음. 순수 기술 문서 톤.
8. **참조 대상 제시 없음**: Linear/Apple 같은 미적 참조가 없음.

### 모호한 감각어의 번역

이 스킬에는 감각어가 거의 없다. 유일하게 판단이 필요한 지점은 "얼마나 커스터마이즈할 것인가"이며, 그것을 **`!important` 개수**라는 관찰 가능한 지표로 번역한다:

> "If you're marking more than a few things important, stop — go headless."

그리고 "design-system toast"라는 목적어를 최종 단계(headless + 자체 `toast()` 래퍼)로 직접 매핑한다:

> "The recommended approach for a design-system toast: wrap it in your own `toast()` abstraction."

## 7. 산출물

- **형식**: JSX/TSX 코드 (Toaster 배선, `toast()` 호출), 또는 트러블슈팅 답변.
- **파일 저장 위치 규칙**: 하나 명시됨 — **`<Toaster />`는 루트, Next.js에서는 `layout.tsx`**. 그 외 파일 네이밍 규칙은 **원문에 명시 없음.**
- Output 형식·톤 규정 섹션 자체가 **없음** (`animate` 계열에는 있음).

## 8. 주의점 / 한계

- **버전 명시 없음**: 어느 Sonner 버전을 기준으로 한 API인지 원문에 없음. `toasterId`, `swipeDirections`, `mobileOffset`, `getActiveToasts` 등 비교적 최근 API가 포함되어 있으나, 사용 중 버전이 낮으면 존재하지 않는 prop을 제안할 위험. **원문에 경고 없음.**
- **단일 라이브러리 종속**: Sonner를 안 쓰면 가치 0. 이 컬렉션에서 가장 좁은 스킬.
- **디자인 컬렉션 내 이질성**: 미적 지침이 전혀 없어, "디자인 스킬"로서 평가하면 성격이 다름. 저자(Emil Kowalski)가 Sonner의 제작자라는 맥락에서 컬렉션에 포함된 것으로 보이나, 이는 원문에 명시되지 않음(도메인 `sonner.emilkowal.ski`로만 암시).
- **모션 지침 부재**: 토스트는 이 컬렉션에서 모션 규칙이 가장 엄격한 대상 중 하나인데(`animate`: "Keyframes on toasts, toggles, rapidly-triggered elements → CSS transitions"), 이 스킬은 그 규칙을 언급하지 않음. 토스트 커스터마이즈를 headless로 진행하면 Sonner의 모션을 직접 다뤄야 하는데, 그 지침은 `animate`로 넘어가야 함 — **스킬 간 연결이 원문에 명시되지 않음.**
- **강한 경고 지점**:
  - "Never render it per-page or conditionally"
  - "If you're marking more than a few things important, stop — go headless."
  - "`theme` defaults to `'light'` and does not track the OS."
  - "`toast()` ... does nothing on the server"
  - "Without `toasterId`, every toaster renders the toast."
- **검증 장치**: 없음. 테스트 스크립트나 체크리스트 없음. 단 `testId` prop이 e2e 테스트 훅으로 언급됨.
