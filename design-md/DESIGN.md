---
# ═══════════════════════════════════════════════════════════════
#  DESIGN.md — 범용 스타터 템플릿
#  Google design.md (alpha) 호환 · lint 0 errors / 0 warnings 검증됨
#
#  사용법
#   1. name / description 을 프로젝트에 맞게 교체
#   2. 1층 primitive 의 hex 를 브랜드 값으로 교체
#   3. 2층 semantic 은 이름을 유지한 채 참조 대상만 바꾼다  ← 테마 전환의 핵심
#   4. components 에 실제 컴포넌트를 추가
#   5. npx @google/design.md lint DESIGN.md 로 검증
#
#  ⚠ 규칙 (실측 확인)
#   · 모든 dimension 에 단위 필수. `0` 은 error, `0px` 로 쓸 것
#   · `primary` 색 토큰이 없으면 warning (에이전트가 임의 생성)
#   · components 에서 참조되지 않는 색 토큰은 orphaned warning
#     (단 primary / neutral 등 표준명은 면제)
#   · 확장 키에 "150ms" 같은 dimension 문자열을 쓰면 warning → 숫자로
# ═══════════════════════════════════════════════════════════════
version: alpha
name: Starter Design System
description: 프로젝트 설명을 한 줄로. 이 문장은 dtcg export 의 $description 이 된다.

# ── EXTENSION: 다이얼 ─────────────────────────────────────────────
# 문서 내 다른 규칙을 조건부로 발동시킨다. Overview 섹션에 반드시 재기술할 것.
# 값이 순수 숫자라 린터를 통과한다.
dials:
  density: 5     # 1 여백형 ── 5 표준 ── 10 데이터 밀집
  variance: 5    # 1 대칭·예측가능 ── 5 표준 ── 10 비대칭·실험적
  motion: 5      # 1 정적 ── 5 표준 ── 10 시네마틱

colors:
  # ── 1층 primitive ── 원시값. 여기만 hex 를 직접 쓴다.
  white:     "#FFFFFF"
  gray-50:   "#F8FAFC"
  gray-100:  "#F1F5F9"
  gray-200:  "#E2E8F0"
  gray-500:  "#64748B"
  gray-600:  "#475569"
  gray-900:  "#0F172A"
  brand-600: "#2563EB"
  brand-700: "#1D4ED8"
  green-700: "#15803D"   # AA 통과값. #16A34A 는 흰 배경에서 3.30:1 로 미달
  amber-700: "#B45309"   # AA 통과값. #D97706 는 3.19:1 로 미달
  red-600:   "#DC2626"

  # ── 2층 semantic ── 역할 이름. 반드시 참조로만 정의한다.
  #    다크 테마 전환 시 이 층의 참조 대상만 바꾸면 된다.
  primary:        "{colors.brand-600}"
  primary-hover:  "{colors.brand-700}"
  neutral:        "{colors.gray-500}"
  bg:             "{colors.gray-50}"
  surface:        "{colors.white}"
  surface-sunken: "{colors.gray-100}"
  border:         "{colors.gray-200}"
  on-primary:     "{colors.white}"
  text-primary:   "{colors.gray-900}"
  text-secondary: "{colors.gray-600}"
  text-disabled:  "{colors.gray-500}"
  success:        "{colors.green-700}"
  warning:        "{colors.amber-700}"
  danger:         "{colors.red-600}"

typography:
  # fontFamily 는 브랜드 서체로 교체할 것. 아래는 안전한 시스템 스택.
  display:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  heading:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, monospace"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"   # 등폭 숫자 — 값이 갱신되는 UI 에서 자릿수 흔들림 방지

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px

spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "6": 24px
  "8": 32px

components:
  # 상태·변형은 별도 엔트리 + 관련 명명 (Google 관례). 스펙 확장 아님.
  #   <name>  /  <name>--hover  /  --active  /  --disabled  /  --focus
  app-shell:
    backgroundColor: "{colors.bg}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.4}"
  card-caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "{spacing.2}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.3}"
  button-primary--hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary--active:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary--disabled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-disabled}"
  button-primary--focus:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  badge-neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-success:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-warning:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"

# ── EXTENSION: 모션 ───────────────────────────────────────────────
# Google alpha 스키마에 모션 토큰이 없다. 확장 키로 둔다.
# durationMs 는 반드시 숫자. "150ms" 로 쓰면 token-like-ignored 경고 발생.
# ⚠ export(dtcg/tailwind) 결과에는 포함되지 않는다 → 본문 Motion 섹션에 이중 기재
motion:
  instant:
    durationMs: 0
    easing: linear
    intent: "즉시 반영. 고빈도 조작에는 애니메이션을 넣지 않는다"
  fast:
    durationMs: 150
    easing: ease-out
    intent: "호버·프레스 등 직접 조작 피드백"
  base:
    durationMs: 250
    easing: ease-out
    intent: "패널·드롭다운 등장·퇴장"
  slow:
    durationMs: 400
    easing: ease-out
    intent: "모달·시트 등 큰 표면 이동"
---

# Starter Design System

## Overview

<!-- 채우는 법: 제품 성격 2~3문장. 누가 언제 쓰는가. 무엇이 아니어야 하는가. -->

이 시스템이 무엇인지 한 문단으로 쓴다. 에이전트는 토큰에서 *값*을 얻고
이 프로즈에서 *왜 그 값인지*를 얻는다. 값만 있고 근거가 없으면 응용이 어긋난다.

**다이얼** (front matter `dials` 재기술 — 도구가 확장 키를 버려도 의미가 살아남게)

| 다이얼 | 값 | 이 값이 발동시키는 규칙 |
|---|---|---|
| `density` | **5** | 표준 간격. 8 이상이면 숫자 mono + `tnum` 강제, 카드 대신 1px 구분선 |
| `variance` | **5** | 표준 그리드. 4 초과면 중앙정렬 히어로 금지 |
| `motion` | **5** | 표준 전환. 4 이상이면 **`prefers-reduced-motion` 대응 필수** |

## Colors

<!-- 채우는 법: semantic 토큰만 표로 적는다. primitive 는 front matter 에만 두고
     여기서는 "역할"과 "근거"를 쓴다. hex 를 여기 중복 기재하지 말 것 -->

| 토큰 | 역할 | 근거 |
|---|---|---|
| `primary` | 주 액션, 링크, 활성 상태 | 브랜드 인지의 축. 화면의 소수 지점에만 |
| `on-primary` | primary 위 텍스트 | 항상 primary 와 쌍으로 대비 검증 |
| `bg` / `surface` / `surface-sunken` | 페이지 · 카드 · 입력 배경 | 3단 이상 늘리지 않는다 |
| `border` | 1px 구분선 | 그림자보다 우선하는 계층 수단 |
| `text-primary` / `text-secondary` / `text-disabled` | 텍스트 3단 | 회색 계열을 통일 (warm/cool 혼용 금지) |
| `success` / `warning` / `danger` | 상태 | **색 단독으로 의미를 전달하지 않는다** — 아이콘·텍스트 병기 |
| `neutral` | 무상태 | 색 없음 = 변화 없음 |

**다크 테마**: 1층 primitive 를 늘리고 2층 semantic 의 **참조 대상만** 교체한다.
components 는 손대지 않는다. 이것이 3층 구조를 쓰는 이유다.

### Banned

<!-- 프로젝트 고유 금지만 여기 적는다. 범용 금지는 ## Do's and Don'ts 에 있다 -->

- 컴포넌트에 hex 직접 기입 · 액센트 2개 이상 · warm/cool gray 혼용
- 대비 4.5:1 미만 텍스트 → `lint` 로 검증
- (프로젝트 고유 금지를 여기 추가)

## Typography

<!-- 채우는 법: 스택과 스케일의 "의도"를 쓴다. 값은 front matter 에 있다 -->

| 토큰 | 용도 |
|---|---|
| `display` | 페이지 최상위 제목. 한 화면에 1회 |
| `heading` | 섹션 제목 |
| `body` | 본문. 기본값 |
| `label` | 버튼·라벨·캡션 |
| `mono` | 코드, **갱신되는 숫자** (`tnum` 적용) |

**규칙**
- 서체 패밀리는 2개까지 (sans + mono)
- 본문 최소 16px, 12px 미만 금지
- 위계는 **weight + color** 로 만든다. 크기만으로 만들지 않는다
- 값이 바뀌는 숫자는 반드시 `mono` + 우측 정렬

### Banned

<!-- 프로젝트 고유 금지만 여기 적는다. 범용 금지는 ## Do's and Don'ts 에 있다 -->

- 3개 이상의 서체 패밀리 · 본문 대문자 강제 · 가변폭 숫자로 실시간 수치
- (브랜드가 지정하지 않는 한 `Inter` 를 기본 선택으로 쓰지 않는다)

## Layout

<!-- 반응형 규칙은 Google canonical order 유지를 위해 이 섹션에 흡수한다 -->

- 컨테이너 최대 폭: `1280px` (조정 가능)
- 그리드: CSS Grid 우선. flexbox 퍼센트 계산 금지
- 전체 높이 섹션은 `min-height: 100dvh` (`100vh` 는 모바일에서 점프)

**브레이크포인트**

| 이름 | 폭 | 동작 |
|---|---|---|
| `sm` | 640px | |
| `md` | 768px | **이 아래는 단일 컬럼 강제** |
| `lg` | 1024px | |
| `xl` | 1280px | |

테스트 뷰포트: `375 / 768 / 1024 / 1440`

## Elevation & Depth

<!-- ⚠ Google alpha 스키마에 shadow 토큰 타입이 없다. 프로즈로만 기술한다.
     빌드에서 쓰려면 CSS 변수로 별도 관리할 것 -->

| 레벨 | 값 | 용도 |
|---|---|---|
| `0` | 그림자 없음, `border` 1px | 기본. **대부분의 표면은 여기** |
| `1` | `0 1px 2px rgba(0,0,0,0.06)` | 카드 호버 |
| `2` | `0 4px 12px rgba(0,0,0,0.08)` | 드롭다운·팝오버 |
| `3` | `0 12px 32px rgba(0,0,0,0.12)` | 모달·시트 |

**규칙**: 그림자는 배경 색조로 tint 한다. 순흑 그림자 금지. 4단 이상 늘리지 않는다.

## Shapes

- 한 화면에 **radius 2종까지**. `sm`(입력·버튼) + `md`(카드) 조합이 기본
- `full` 은 배지·아바타 등 작은 요소에만. 큰 컨테이너에 적용 금지
- radius 를 섞을 거면 규칙을 문서화한다 (예: 버튼 full, 카드 md, 입력 sm)

## Components

<!-- 채우는 법: 컴포넌트마다 상태 매트릭스를 채운다. 빈칸을 남기지 않는다 -->

### 상태 매트릭스 (모든 인터랙티브 요소 필수)

| 컴포넌트 | Default | Hover | Active | Disabled | Focus |
|---|---|---|---|---|---|
| `button-primary` | primary 배경 | primary-hover | primary-hover + `translateY(1px)` | surface + text-disabled | **2px 아웃라인** |
| `input` | surface-sunken | border 강조 | — | 투명도 감소 | **2px 아웃라인** |
| `card` | surface + border | elevation 1 | — | — | — |

### 필수 비상태 화면

- **loading** — 레이아웃과 같은 형태의 스켈레톤. 원형 스피너 금지
- **empty** — 다음 행동을 안내하는 구성. "데이터 없음" 텍스트만 두지 않는다
- **error** — 필드 옆 인라인. `alert()` 금지

## Do's and Don'ts

<!-- 아래 금지 목록은 4개 스킬 컬렉션(37개 스킬) 분석에서 추출한 **도메인 무관 기본값**이다.
     그대로 두고 시작해도 되고, 프로젝트에 맞게 덜어내도 된다.

     ⚠ 예외 정책: 이 목록은 "무조건 금지"가 아니라 **기본값**이다.
        예외는 브랜드 스펙이 명시적으로 요구할 때만 허용하고,
        그 이유를 해당 섹션 프로즈에 기록한다. 근거 없는 예외는 허용하지 않는다. -->

### ✅ Do

- semantic 토큰만 참조한다 (`{colors.primary}`)
- 상태를 **색 + 형태 + 텍스트** 세 겹으로 전달한다
- 값이 갱신되는 영역에 고정 폭 슬롯을 확보한다
- 새 색이 필요하면 primitive 를 추가하고 semantic 을 거쳐 쓴다
- 없는 것은 **없다고 표시**한다 (플레이스홀더 > 가짜 데이터)

### ❌ Don't — 기본 금지 목록

**토큰 규율**

| 금지 | 대신 |
|---|---|
| 컴포넌트에 hex·폰트명 직접 기입 | semantic 토큰 참조 |
| semantic 층 건너뛰고 primitive 를 컴포넌트에서 직접 참조 | 2층을 거친다 |
| 문서화되지 않은 radius·간격 값 | 정의된 스케일만 |
| 컴포넌트 라이브러리 기본값 그대로 출고 (shadcn/ui 등) | radius·색·그림자를 이 시스템에 맞춰 커스터마이즈 |

**타이포그래피**

| 금지 | 대신 |
|---|---|
| `Inter` 를 **기본 선택**으로 (브랜드가 지정하면 예외) | `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi` 등 |
| 제네릭 세리프 (`Times New Roman`, `Georgia`, `Garamond`) | 세리프가 필요하면 특징 있는 현대 세리프만 |
| 세리프를 대시보드·소프트웨어 UI 본문에 | sans + mono 조합 |
| 3개 이상의 서체 패밀리 | 2개 (sans + mono) |
| 본문 12px 미만 | 최소 16px |
| 크기만으로 위계 만들기 · 과대 H1 | weight + color 로 |
| 본문에 `text-transform: uppercase` 강제 | 문장 케이스 |
| 큰 헤더에 그라디언트 텍스트 | 단색 |
| 값이 바뀌는 숫자를 가변폭 서체로 | mono + `tnum` + 우측 정렬 |

**컬러 · 표면**

| 금지 | 대신 |
|---|---|
| 순흑 `#000000` / 순백 `#FFFFFF` | off-black / off-white (깊이가 죽는다) |
| 채도 80% 초과 액센트 | 중립 베이스 + 절제된 단일 액센트 |
| 액센트 색 2개 이상 | 1개 |
| warm gray 와 cool gray 혼용 | 한 계열로 통일 |
| 보라-파랑 "AI 그라디언트", 네온 글로우, 외곽 glow | 내부 테두리 또는 배경 색조로 tint 한 그림자 |
| 대비 4.5:1 미만 텍스트 | lint 로 검증 |
| 페이지 중간에서 라이트↔다크 반전 | 한 페이지 한 테마 |

**레이아웃**

| 금지 | 대신 |
|---|---|
| 요소 겹침 (텍스트가 이미지·다른 텍스트 위로) | 각자 공간을 차지 |
| **3열 균등 카드** 기능 행 | 2열 지그재그 · 비대칭 그리드 · 가로 스크롤 |
| `height: 100vh` | **`min-height: 100dvh`** (모바일 주소창 점프) |
| flexbox 퍼센트 계산 (`calc(33% - 1rem)`) | CSS Grid |
| 고정 px 컨테이너 폭 | `max-width` + 상대 단위 |
| 수평 스크롤 발생 | 모바일 단일 컬럼 강제 |
| 사용자 확대 비활성화 | 허용 |
| `z-index` 남발 (`9999`) | Navbar / Modal / Overlay 계층에만 |

**상태 · 피드백**

| 금지 | 대신 |
|---|---|
| 포커스 링 제거 | 2px 이상, 배경 대비 3:1 |
| 라벨 없는 아이콘 전용 버튼 | `aria-label` / 접근 가능한 이름 |
| 호버에만 의존하는 기능 | 터치·키보드 경로 병행 |
| 0ms 즉시 상태 변화 (전환 없음) | `fast` 토큰 |
| placeholder 를 라벨로 사용 | 라벨은 입력 위 |
| 에러를 폼 상단에만 표시 | 해당 필드 옆 인라인 |
| `window.alert()` | 인라인 에러 UI |
| 원형 스피너 | 레이아웃 형태와 같은 스켈레톤 |
| "데이터 없음" 텍스트만 있는 빈 상태 | 다음 행동을 안내하는 구성 |
| `#` 로 연결된 죽은 링크 | 실제 목적지 또는 시각적 비활성화 |
| 하단 내비 5개 초과 | 5개 이하 |

**모션**

| 금지 | 대신 |
|---|---|
| `transition: all` | 속성을 명시 |
| `width` / `height` / `top` / `left` 애니메이트 | `transform` + `opacity` |
| `scale(0)` 에서 등장 | `scale(0.95)` + `opacity: 0` |
| UI 진입·퇴장에 `ease-in` | `ease-out` |
| 모든 전환에 같은 duration 하나 | 거리·복잡도에 맞춘 토큰 |
| **하루 수십~수백 번 하는 조작에 애니메이션** | `instant` (모션 없음) |
| 읽거나 조작 중인 데이터를 장식 목적으로 이동 | 정지 |
| 미디어쿼리 없는 `:hover` 모션 | `@media (hover: hover) and (pointer: fine)` |
| `prefers-reduced-motion` 미대응 | 이동·확대 제거, 투명도는 유지 |
| 목록이 한꺼번에 등장 | 30–80ms stagger |

**콘텐츠 · 카피**

| 금지 | 대신 |
|---|---|
| 이모지 (UI·코드·alt 텍스트 어디에도) | 아이콘 라이브러리 글리프 |
| 제네릭 이름 (`John Doe`, `Acme`, `Nexus`, `SmartFlow`) | 맥락에 맞는 그럴듯한 이름 |
| 가짜 반올림 수치 (`99.99%`, `50%`, `1234567`) | 유기적 데이터 (`47.2%`, `+1 (312) 847-1928`) |
| AI 카피 클리셰 ("Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize") | 구체적 동사 |
| 채움용 UI 텍스트 ("Scroll to explore", "Swipe down", 튕기는 셰브론) | 삭제. 사용자는 스크롤을 안다 |
| Lorem Ipsum | 실제 초안 카피 |
| `Title Case On Every Header` | 문장 케이스 |
| 성공 메시지의 느낌표 · "Oops!" 에러 | "연결에 실패했습니다. 다시 시도해 주세요." |
| 수동태 | 능동태 |
| 여러 사용자에게 같은 아바타 · 동일한 날짜 | 각각 다르게 |
| `<div>` 로 만든 가짜 스크린샷·가짜 대시보드 | 실제 스크린샷 · 생성 이미지 · 생략 |
| 깨진 이미지 링크 | `picsum.photos/seed/{id}/800/600` 또는 SVG 아바타 |

**코드 품질 · 자주 빠뜨리는 것**

| 금지 | 대신 |
|---|---|
| div soup | `<nav>` `<main>` `<article>` `<aside>` `<section>` |
| 의미 있는 이미지에 alt 누락 (`alt=""`, `alt="image"`) | 내용을 서술 |
| 하드코딩 px 폭 | `%` / `rem` / `max-width` |
| `<title>` · `description` · `og:image` 누락 | 메타 태그 완비 |
| 커스텀 마우스 커서 | 시스템 커서 (성능·접근성 저해) |
| 404 페이지 · 뒤로 가기 경로 · skip-to-content 링크 부재 | 전부 제공 |
| 폼 클라이언트 검증 부재 | 이메일·필수·형식 검증 |

### 다이얼 연동 금지

| 조건 | 발동되는 금지 |
|---|---|
| `variance` > 4 | 중앙정렬 히어로 금지 → Split / Left-aligned / 비대칭 |
| `density` ≥ 8 | 카드 컨테이너 금지 → 1px 구분선·여백으로 그룹화. 숫자는 mono + `tnum` |
| `motion` ≥ 4 | `prefers-reduced-motion` 미대응 금지 |
| `motion` ≤ 3 | 자동 애니메이션 금지 (`:hover` / `:active` 만) |

### 프로젝트에 따라 선택 (기본 미적용)

- **em-dash(`—`) 전면 금지** — 영문 LLM 산출물의 대표 지문이라 금지하는 가이드가 있다.
  다만 한국어·일본어 조판이나 출판 스타일에서는 정상적인 문장부호이므로 기본값에서 제외했다.
  영문 마케팅 카피가 주력이면 켤 것.
- **무한 루프 마이크로 인터랙션** — 제품 성격에 따라 자산이 되기도, 소음이 되기도 한다.
- **가로 스크롤 하이재킹 · 스크롤 핀** — `motion` ≥ 8 에서만 검토.

## Motion

> **인계 계약**: 이 섹션은 토큰 정의이며 구현은 코드 단계에서 이루어진다.
> DESIGN.md 자체는 애니메이션을 만들지 않는다.
> 그리고 **`export` 결과에는 모션 토큰이 포함되지 않는다** — 아래 표가 정본이다.

| 토큰 | 지속 | 이징 | 적용 |
|---|---|---|---|
| `instant` | 0ms | linear | 고빈도 조작(탭 전환, 정렬, 필터). **애니메이션 없음** |
| `fast` | 150ms | ease-out | 호버, 프레스 피드백 |
| `base` | 250ms | ease-out | 드롭다운, 팝오버, 툴팁 |
| `slow` | 400ms | ease-out | 모달, 시트, 페이지 전환 |

**규칙**
- `transform` 과 `opacity` 만 애니메이트한다. `width`/`height`/`top`/`left` 금지
- 사용자가 하루에 수십~수백 번 하는 조작에는 **모션을 넣지 않는다**
- 읽거나 조작 중인 데이터는 장식 목적으로 움직이지 않는다
- `dials.motion` 이 4 이상이면 `prefers-reduced-motion` 대응이 필수다

## Accessibility Contract

| 항목 | 기준 |
|---|---|
| 본문 대비 | **≥ 4.5:1** |
| 큰 텍스트(18px+)·비텍스트 UI | **≥ 3:1** |
| **색 단독 의존** | **금지.** 상태는 아이콘·텍스트·형태를 병기 |
| 포커스 표시 | 제거 금지. 2px 이상, 배경 대비 3:1 |
| 키보드 | 탭 순서 = 시각 순서. 모든 기능에 키보드 경로 |
| 폼 | 라벨은 입력 위. placeholder 를 라벨로 쓰지 않는다 |
| `prefers-reduced-motion` | 이동·확대·패럴랙스 제거, 투명도 전환은 유지 |
| 터치 타깃 | 44×44px 이상 (iOS) / 48×48dp (Android) |
| 이미지 | 의미 있는 이미지에 alt 필수. 장식 이미지는 접근성 트리에서 숨김 |
