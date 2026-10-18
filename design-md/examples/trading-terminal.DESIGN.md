---
version: alpha
name: Mock Trading Terminal
description: 모의 투자 시스템. 데이터 밀집 트레이딩 워크스테이션 UI.

# ── EXTENSION: 다이얼 ─────────────────────────────────────────────
# 값이 순수 숫자라 token-like-ignored 규칙에 걸리지 않는다(검증됨).
dials:
  density: 9
  variance: 2
  motion: 2

colors:
  # ── 1층 primitive ── 출처: garden-skills/web-design-engineer
  #                     references/style-recipes/bloomberg-terminal.md
  ground:       "#0A0E1A"
  surface-1:    "#11172A"
  surface-2:    "#1A2138"
  hairline:     "#2A3050"
  amber-500:    "#FFA02F"
  green-500:    "#00B96B"
  red-500:      "#F23645"
  slate-300:    "#8B93A8"   # WCAG 조정값 — 아래 주석 참조
  slate-400:    "#7A8299"   # 원본 #5E6680 은 panel 대비 3.13:1 로 AA 미달 → 상향
  chrome-100:   "#E8ECF4"
  # 차트 전용 — 출처: ui-ux-pro/ui-ux-pro-max data/charts.csv
  chart-blue:   "#0080FF"
  chart-orange: "#FF9500"
  chart-alert:  "#FF0000"
  chart-band:   "#FFF3CD"

  # ── 2층 semantic ── 반드시 참조로만 정의
  primary:       "{colors.amber-500}"   # missing-primary 규칙 충족
  neutral:       "{colors.slate-400}"
  bg:            "{colors.ground}"
  panel:         "{colors.surface-1}"
  panel-raised:  "{colors.surface-2}"
  border:        "{colors.hairline}"
  text-primary:  "{colors.chrome-100}"
  text-muted:    "{colors.slate-400}"
  text-disabled: "{colors.slate-300}"
  positive:      "{colors.green-500}"
  negative:      "{colors.red-500}"

typography:
  data-sm:
    fontFamily: "IBM Plex Mono, JetBrains Mono, monospace"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
  data-md:
    fontFamily: "IBM Plex Mono, JetBrains Mono, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
  data-lg:
    fontFamily: "IBM Plex Mono, JetBrains Mono, monospace"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.35
    fontFeature: "tnum"
  label:
    fontFamily: "IBM Plex Mono, JetBrains Mono, monospace"
    fontSize: 11px
    fontWeight: 500
    letterSpacing: 0.04em

rounded:
  none: 0px
  sm: 2px

spacing:
  "1": 2px
  "2": 4px
  "3": 8px
  "4": 12px

components:
  # 상태·변형은 Google 관례(별도 엔트리 + 관련 명명)
  price-cell:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    typography: "{typography.data-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.2}"
  price-cell--up:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.positive}"
    typography: "{typography.data-md}"
  price-cell--down:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.negative}"
    typography: "{typography.data-md}"
  panel-label:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  panel-header:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    padding: "{spacing.2}"
  panel-divider:
    backgroundColor: "{colors.border}"
    height: 1px
  order-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.3}"
  order-button--hover:
    backgroundColor: "{colors.amber-500}"
    textColor: "{colors.bg}"
  order-button--active:
    backgroundColor: "{colors.amber-500}"
    textColor: "{colors.bg}"
  order-button--disabled:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text-disabled}"
  order-button--focus:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
  # 차트 계열을 컴포넌트로 모델링 → orphaned-tokens 해소
  chart-series-actual:
    backgroundColor: "{colors.chart-blue}"
  chart-series-forecast:
    backgroundColor: "{colors.chart-orange}"
  chart-anomaly-marker:
    backgroundColor: "{colors.chart-alert}"
  chart-alert-band:
    backgroundColor: "{colors.chart-band}"

# ── EXTENSION: 모션 ───────────────────────────────────────────────
# durationMs 를 숫자로 둔다. "80ms" 같은 dimension 문자열을 쓰면
# token-like-ignored 경고가 발생한다(검증됨).
motion:
  data-flash:
    durationMs: 80
    easing: linear
    intent: "시세 갱신 알림. 이징 금지 — 데이터는 이동하지 않는다"
  ticker-scroll:
    durationMs: 0
    easing: linear
    intent: "상단 티커바 연속 스크롤. 가변 속도 금지"
  press-feedback:
    durationMs: 100
    easing: ease-out
    intent: "주문 버튼 눌림 확인. 100+회/일 조작이므로 이것만 허용"
---

## Overview

전문 트레이더가 **하루 수백 번 조작**하는 워크스테이션이다. 마케팅 페이지가 아니다.
4~9개 패널이 동시에 보이고, 화면 대부분이 갱신되는 숫자로 채워진다.

**정보 밀도 등급: 9/10** — 여백은 사치다. 다만 숫자 오독은 금전 손실이므로
가독성은 밀도보다 우선한다.

**다이얼과 발동 규칙** (front matter `dials` 재기술)

| 다이얼 | 값 | 발동되는 규칙 |
|---|---|---|
| `density` | **9** | 모든 숫자 mono + `tnum` 강제 / spacing 2-12px / **카드 컨테이너 금지, 1px hairline 으로 대체** |
| `variance` | **2** | 대칭 그리드 고정. 비대칭·off-grid 레이아웃 금지 |
| `motion` | **2** | 자동 애니메이션 금지. `data-flash` / `ticker-scroll` / `press-feedback` 3개만 허용 |

## Colors

### Semantic

| 토큰 | 값 | 역할 | 근거 |
|---|---|---|---|
| **bg** | `#0A0E1A` | 전역 배경 | 순흑 아님. 장시간 응시 피로 감소 |
| **panel** | `#11172A` | 패널 표면 | bg 와 hairline 없이도 구분되는 최소 단차 |
| **panel-raised** | `#1A2138` | 패널 헤더·활성 패널 | |
| **border** | `#2A3050` | 1px hairline | **그림자 대신 유일한 계층 수단** |
| **text-primary** | `#E8ECF4` | 핵심 데이터 | |
| **text-muted** | `#7A8299` | 라벨·단위·타임스탬프 | |
| **primary** | `#FFA02F` | 최우선 정보·주문 CTA | 터미널 시그니처. **화면의 5% 미만**에만 |
| **positive** | `#00B96B` | 상승·수익 | |
| **negative** | `#F23645` | 하락·손실 | |
| **neutral** | `#7A8299` | 보합 | 색 없음 = 변화 없음 |

### Banned Colors

- 그라디언트 일체 — "gradient meshes are not data-ink"
- 네온 글로우, 외곽 glow
- 순흑 `#000000` / 순백 `#FFFFFF`
- 보라-파랑 AI 그라디언트
- accent 를 배경 대면적에 사용

## Typography

**단일 mono 스택.** sans-serif 본문 금지 — 등폭이 이 시스템의 규칙이다.

| 토큰 | 크기 | 용도 |
|---|---|---|
| `data-sm` | 11px | 밀집 테이블 셀, 보조 지표 |
| `data-md` | 12px | 기본 시세·수량 |
| `data-lg` | 14px | 현재가, 총 평가액 |
| `label` | 11px + `0.04em` | 컬럼 헤더, 패널 제목 |

**철칙**
- 모든 숫자에 `font-feature-settings: "tnum"` — *"Fixed-width digits so numbers don't shift
  around as they change. **Essential for tickers, timers, and counters.**"*
- 숫자 컬럼은 **우측 정렬**
- **16px 본문 없음. 32px 헤드라인 없음.**
- 천 단위 구분자 필수

### Banned Fonts

- 모든 sans-serif 본문 서체 (Inter 포함)
- 세리프 일체
- 가변폭 숫자를 쓰는 모든 서체

## Layout

- **멀티페인 4~9 패널** 동시 표시. hairline 1px 로만 분할
- `display: grid; gap: 1px;` + 부모/자녀 배경색 대비 → 테두리 선언 없이 razor-thin 구분선
- 컨테이너 여백 없음. 패널 내부 padding 2~4px
- 상단 티커바 고정
- 키보드 숏컷 칩을 여백에 노출 (`F9: 주문`)

**반응형** (Google Layout 섹션에 편입)

| 뷰포트 | 동작 |
|---|---|
| ≥ 1440px | 전체 패널 표시 |
| 1024~1439px | 보조 패널 탭으로 접기 |
| < 768px | 단일 컬럼. 테이블은 `overflow-x: auto` 래퍼 |

테스트 뷰포트: `375 / 768 / 1024 / 1440`

## Shapes

- radius **0** 기본, **2px** 최대. `rounded-full` 금지
- 한 화면에 두 종류 이상의 radius 혼용 금지

## Components

### 상태 커버리지 (모든 인터랙티브 요소 필수)

| 컴포넌트 | Default | Hover | Active | Disabled | Focus |
|---|---|---|---|---|---|
| `order-button` | accent 배경 | 동일 배경 + 밝기 | `translateY(1px)` | surface-2 + muted | **2px 아웃라인 필수** |
| `price-cell` | text-primary | 행 하이라이트 | — | — | 셀 아웃라인 |
| `panel-header` | panel-raised | — | 활성 패널 accent 테두리 | — | — |

**추가 필수 상태**: loading(스켈레톤, 스피너 금지) / empty / error(인라인, `alert()` 금지)

### 차트

| 데이터 | 차트 | 렌더 임계값 | 출처 |
|---|---|---|---|
| 시세 추이 | Line | **<1000pt: SVG / ≥1000pt: Canvas + downsampling / >10000: 구간 집계** | charts.csv #1 |
| 예측 구간 | Line + Confidence Band | actual 실선, forecast **점선**, band 15% opacity | charts.csv #9 |
| 이상 거래 | Line + Highlights | **스트리밍 ≤60fps Canvas**, 이상치는 별도 레이어 | charts.csv #10 |

## Do's and Don'ts

### ✅ Do

- 상승/하락을 **색 + 부호 + 화살표** 세 겹으로 표시
- 갱신되는 값에 **고정 폭 슬롯** 확보 (레이아웃 흔들림 방지)
- 숫자는 mono + `tnum` + 우측 정렬
- 계층은 hairline 으로만
- 실제 데이터로 화면을 채울 것

### ❌ Don't

- **색만으로 상승/하락 전달** — charts.csv 전 행: *"Do not rely on color alone"*
- 시세 갱신에 이징 애니메이션 (`data-flash` 80ms linear 만 허용)
- 카드 컨테이너, 중첩 박스, 둥근 모서리
- 그림자, 그라디언트, glassmorphism
- 16px 본문, 세리프, 가변폭 숫자
- 더미 데이터로 채운 터미널 레이아웃 — *"terminal aesthetic + dummy 'Lorem 1,234'
  placeholders **looks broken**"*
- `100+회/일` 조작(패널 전환, 탭, 정렬)에 전환 애니메이션

### ⚠ 미결정 사항 — 상승/하락 색 관행

`positive: green / negative: red` 는 **서구(Bloomberg) 관행**이다.
한국 시장은 **상승=적색 / 하락=청색**이 표준이다.

- 국내 사용자 대상 → `positive: red-500` / `negative: blue` 로 **semantic 층만 교체**
- primitive 층과 component 층은 손대지 않는다 ← 3층 구조를 쓰는 이유
- 결정 후 이 항목을 삭제하고 근거를 Colors 섹션에 기록할 것

## Motion

> **인계 계약**: 이 섹션은 토큰 정의이며 구현은 프론트엔드 코드 단계에서 이루어진다.
> DESIGN.md 자체는 애니메이션을 생성하지 않는다.

| 토큰 | 값 | 적용 대상 |
|---|---|---|
| `data-flash` | **80ms linear** | 시세 셀 갱신 시 배경 flash 1회 |
| `ticker-scroll` | linear 무한 | 상단 티커바 |
| `press-feedback` | 100ms ease-out | 주문 버튼 `:active` |

**금지**: 위 3개 외 모든 애니메이션. 스크롤 연출, 진입 애니메이션, stagger, spring, 무한 루프 없음.

근거 — 빈도 게이트: *"100+ times/day (keyboard shortcuts, command palette toggle) →
**No animation. Ever.**"* 그리고 *"data the user is reading or acting on **should not move
for style** ... not on a graph in a banking app."*

## Accessibility Contract

| 항목 | 기준 |
|---|---|
| 본문 대비 | **≥ 4.5:1** |
| 큰 텍스트·비텍스트 UI | **≥ 3:1** |
| **색 단독 의존** | **금지.** 상승/하락은 색 + 부호(+/−) + 화살표(▲▼) 병기 |
| 차트 계열 구분 | 색 + **선 스타일(실선/점선/파선)** + 직접 라벨 |
| 차트 대체 수단 | **가시 데이터 테이블** + 요약문 제공 |
| 키보드 | 포커스 시 hover 와 동일 정보 노출. +/- 확대, Reset 복원 |
| 포커스 링 | 제거 금지. 2px 이상 |
| `prefers-reduced-motion` | `data-flash` / `ticker-scroll` 정지 |
| 터치 타깃 | 44×44px 이상 (모바일 뷰) |
