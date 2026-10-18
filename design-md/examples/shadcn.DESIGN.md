---
# ═══════════════════════════════════════════════════════════════
#  DESIGN.md — shadcn/ui + Tailwind v4 대응 변형본
#  Google design.md (alpha) 호환 · lint 검증됨
#
#  범용 스타터(../DESIGN.md)와 다른 점은 딱 하나:
#  2층 semantic 토큰의 "이름"을 shadcn 계약명으로 맞췄다.
#  → export 결과가 그대로 shadcn 컴포넌트가 찾는 유틸리티를 만든다.
#     --color-background → bg-background / --color-primary-foreground → text-primary-foreground
#
#  파이프라인
#    npx @google/design.md export examples/shadcn.DESIGN.md --format css-tailwind > src/theme.css
#    (다크 모드는 아래 "Colors" 섹션의 .dark 블록을 theme.css 뒤에 이어붙인다)
#
#  ⚠ 이 스키마로 표현 불가능한 것
#   · 다크 모드   — alpha 에 mode/scheme 개념이 없다. .dark 블록은 수기 또는 2파일 export
#   · 그림자      — shadow 토큰 타입 없음 (Elevation 섹션 프로즈로만)
#   · 투명도 변형 — shadcn 의 hover:bg-primary/90 같은 알파 변형
# ═══════════════════════════════════════════════════════════════
version: alpha
name: shadcn Base
description: shadcn/ui + Tailwind v4 프로젝트용 토큰 정의. semantic 이름이 shadcn 계약과 1:1 대응한다.

dials:
  density: 5
  variance: 4
  motion: 4

colors:
  # ── 1층 primitive ── 여기만 hex. 브랜드 색으로 교체하는 지점.
  white:       "#FFFFFF"
  neutral-50:  "#FAFAFA"
  neutral-100: "#F5F5F5"
  neutral-200: "#E5E5E5"
  neutral-600: "#525252"
  neutral-900: "#171717"
  red-600:     "#DC2626"
  # ── 조건부 ── Chart 컴포넌트를 설치한 경우에만. 안 쓰면 chart-* 전부 삭제.
  chart-orange: "#E76E50"
  chart-teal:   "#2A9D90"
  chart-navy:   "#274754"
  chart-sand:   "#E8C468"
  chart-amber:  "#F4A462"

  # ── 2층 semantic ── 이름 = shadcn 계약. 절대 바꾸지 말 것.
  #    브랜드 적용은 아래 "참조 대상"만 바꿔서 한다.
  background:            "{colors.white}"
  foreground:            "{colors.neutral-900}"
  card:                  "{colors.white}"
  card-foreground:       "{colors.neutral-900}"
  popover:               "{colors.white}"
  popover-foreground:    "{colors.neutral-900}"
  primary:               "{colors.neutral-900}"
  primary-foreground:    "{colors.neutral-50}"
  secondary:             "{colors.neutral-100}"
  secondary-foreground:  "{colors.neutral-900}"
  muted:                 "{colors.neutral-100}"
  muted-foreground:      "{colors.neutral-600}"
  accent:                "{colors.neutral-100}"
  accent-foreground:     "{colors.neutral-900}"
  destructive:           "{colors.red-600}"
  destructive-foreground: "{colors.white}"
  border:                "{colors.neutral-200}"
  input:                 "{colors.neutral-200}"
  ring:                  "{colors.neutral-900}"
  # ── 조건부 ── Chart 설치 시에만
  chart-1:               "{colors.chart-orange}"
  chart-2:               "{colors.chart-teal}"
  chart-3:               "{colors.chart-navy}"
  chart-4:               "{colors.chart-sand}"
  chart-5:               "{colors.chart-amber}"
  # ── 조건부 ── Sidebar 컴포넌트를 설치한 경우에만
  sidebar:                       "{colors.neutral-50}"
  sidebar-foreground:            "{colors.neutral-900}"
  sidebar-primary:               "{colors.neutral-900}"
  sidebar-primary-foreground:    "{colors.neutral-50}"
  sidebar-accent:                "{colors.neutral-100}"
  sidebar-accent-foreground:     "{colors.neutral-900}"
  sidebar-border:                "{colors.neutral-200}"
  sidebar-ring:                  "{colors.neutral-900}"

typography:
  # sans / mono 그룹은 shadcn 이 요구하는 --font-sans / --font-mono 를 만들기 위해 존재한다.
  sans:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, monospace"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.02em
  heading:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.25

rounded:
  # shadcn 의 --radius: 0.625rem(10px) 기준 파생값을 그대로 고정한 것.
  # shadcn 은 calc(var(--radius) - 2px) 식으로 만들지만, 여기서 확정값을 내보내면
  # 같은 결과를 얻으면서 --radius 하나로 전체 스케일이 흔들리는 일이 없어진다.
  none: 0px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  full: 9999px

spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "6": 24px
  "8": 32px

components:
  # 각 엔트리는 실제 shadcn 컴포넌트에 대응한다.
  # 동시에 orphaned-tokens 경고를 막는 역할도 한다 — 모든 색 토큰이 최소 1회 소비된다.
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  card-title:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    typography: "{typography.heading}"
  card-description:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
  popover:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.4}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
    height: 36px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
    height: 36px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
    height: 36px
  button-ghost--hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
  focus-ring:
    # ring 토큰 소비용. 실제 구현은 outline / box-shadow 이며 스키마에 해당 타입이 없다.
    backgroundColor: "{colors.ring}"
    height: 3px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
    height: 36px
  input-border:
    backgroundColor: "{colors.input}"
    height: 1px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  skeleton:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.md}"
  muted-block:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
  numeric-cell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.mono}"
  page-title:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.display}"
  body-text:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.sans}"
  # ── 조건부 ── 위 chart-* 색과 반드시 같이 지운다 (색만 남기면 orphaned-tokens 경고)
  chart-series-1:
    backgroundColor: "{colors.chart-1}"
  chart-series-2:
    backgroundColor: "{colors.chart-2}"
  chart-series-3:
    backgroundColor: "{colors.chart-3}"
  chart-series-4:
    backgroundColor: "{colors.chart-4}"
  chart-series-5:
    backgroundColor: "{colors.chart-5}"
  # ── 조건부 ── 위 sidebar-* 색과 반드시 같이 지운다
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
    typography: "{typography.body}"
    padding: "{spacing.4}"
    width: 256px
  sidebar-item--active:
    backgroundColor: "{colors.sidebar-primary}"
    textColor: "{colors.sidebar-primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.2}"
  sidebar-item--hover:
    backgroundColor: "{colors.sidebar-accent}"
    textColor: "{colors.sidebar-accent-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.2}"
  sidebar-divider:
    backgroundColor: "{colors.sidebar-border}"
    height: 1px
  sidebar-focus-ring:
    backgroundColor: "{colors.sidebar-ring}"
    height: 3px

motion:
  instant:
    durationMs: 0
    easing: linear
    intent: "즉시 반영"
  fast:
    durationMs: 150
    easing: ease-out
    intent: "호버·프레스. shadcn 기본 transition-colors 와 동일 대역"
  base:
    durationMs: 200
    easing: ease-out
    intent: "Popover / DropdownMenu 등장·퇴장"
  slow:
    durationMs: 300
    easing: ease-out
    intent: "Dialog / Sheet"
---

# shadcn Base

## Overview

shadcn/ui + Tailwind v4 프로젝트에서 **토큰의 단일 정본**으로 쓰는 문서다.
`components/ui/*.tsx` 는 건드리지 않는다 — shadcn 컴포넌트는 이미 `bg-background`,
`text-primary-foreground`, `border-border` 같은 유틸리티를 하드코딩해 두었고,
이 문서는 **그 유틸리티가 참조할 변수를 공급**하는 역할만 한다.

그래서 2층 semantic 토큰의 **이름은 계약**이다. `bg` 나 `surface` 로 바꾸는 순간
shadcn 컴포넌트 전체가 스타일 없는 상태로 렌더된다. 브랜드를 입히려면 이름이 아니라
**참조 대상(1층 primitive)** 을 바꾼다.

다이얼: `density 5` / `variance 4` / `motion 4`.
shadcn 은 기성 컴포넌트 집합이라 variance 를 높게 잡을 수 없다 — 레이아웃에서만 낸다.

## Colors

3층 구조. 1층 primitive 만 hex 를 쓰고, 2층 semantic 은 참조로만 정의한다.

**shadcn 계약명을 써야 하는 토큰은 전부가 아니다.** 세 등급으로 나뉜다.

### A. 필수 — 거의 모든 shadcn 컴포넌트가 읽는다

이름 변경 불가. 하나라도 없으면 해당 유틸리티가 **에러 없이 무시**되고 컴포넌트가 스타일 없이 렌더된다.

| 토큰 | 어디서 읽히나 |
|---|---|
| `background` / `foreground` | `globals.css` body, 거의 전부 |
| `border` / `input` / `ring` | 테두리·포커스가 있는 모든 컴포넌트 |
| `primary` / `primary-foreground` | Button 기본, Badge 기본 |
| `secondary` / `secondary-foreground` | Button·Badge secondary 변형 |
| `muted` / `muted-foreground` | Skeleton, 설명 텍스트, 보조 라벨 |
| `accent` / `accent-foreground` | ghost 버튼 hover, DropdownMenu·Select 항목 hover |
| `destructive` | Button·Alert destructive, 폼 에러 |
| `card` / `card-foreground` | Card |
| `popover` / `popover-foreground` | Popover, DropdownMenu, Select, Command |

### B. 조건부 — 해당 컴포넌트를 설치했을 때만

| 토큰 | 필요 조건 |
|---|---|
| `chart-1` ~ `chart-5` | `npx shadcn@latest add chart` 를 했을 때만 |
| `sidebar` 계열 8개 | `add sidebar` 를 했을 때만 |

**안 쓰면 통째로 지운다.** 단 색 토큰과 대응 컴포넌트 엔트리를 **같이** 지워야 한다 —
색만 남기면 `orphaned-tokens` 경고가 뜬다.

### C. 자유 — 내 이름을 그대로 쓴다

shadcn 이 읽지 않는 토큰은 계약과 무관하다. 같은 `@theme` 블록에 공존하며
`bg-brand-600` `text-display` `font-mono` 처럼 그대로 유틸리티가 된다.

- 브랜드 원색, 도메인 색(`positive` / `negative` 등)
- `display` / `heading` / `label` 타이포 스케일
- `spacing`, `motion`, 그 외 확장 키

즉 **shadcn 에 맞춰야 하는 건 A(+설치한 B)뿐이고, 나머지 디자인 시스템은 손대지 않는다.**

`--input` 은 **입력 필드의 배경이 아니라 테두리 색**이다. shadcn 의 명명이 그렇다.
배경은 `--background` 를 쓴다.

### 다크 모드

**alpha 스키마에 mode 개념이 없다.** 이 문서는 라이트 모드만 표현한다.
두 가지 방법 중 하나를 쓴다.

1. **2파일 export** (권장) — `shadcn.dark.DESIGN.md` 를 만들어 semantic 이름은 그대로 두고
   1층 primitive 만 어둡게 바꾼 뒤, export 결과를 `.dark { }` 로 감싸 이어붙인다.
   semantic 이름이 같으므로 컴포넌트 정의는 복사만 하면 된다.

   ```sh
   npx @google/design.md export examples/shadcn.DESIGN.md      --format css-tailwind >  src/theme.css
   npx @google/design.md export examples/shadcn.dark.DESIGN.md --format css-tailwind \
     | sed '1s/@theme {/.dark {/' >> src/theme.css
   ```

2. **수기 블록** — 색이 20개 안팎이면 `.dark` 블록을 직접 쓰는 편이 빠르다.
   Tailwind v4 의 `@theme`(non-inline)은 변수를 `:root` 에 실제로 내보내고 유틸리티가
   `var(--color-*)` 를 참조하므로, `.dark` 에서 같은 이름을 재정의하면 그대로 덮인다.
   shadcn 이 쓰는 `@theme inline` + 별도 `--background` 간접층은 이 목적에는 불필요하다.

### Banned

- semantic 토큰 이름 변경 — 이름이 곧 shadcn 과의 계약이다
- `components/ui/*.tsx` 안에서 hex 직접 기입
- 1층 primitive 를 컴포넌트에서 직접 참조 (`bg-neutral-900` 대신 `bg-primary`)

## Typography

`sans` / `mono` 그룹은 shadcn 이 기대하는 `--font-sans` · `--font-mono` 를 만들기 위해 존재한다.
`display` / `heading` / `body` / `label` 은 본문 스케일이다.

| 역할 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| `display` | 2.25rem | 600 | 페이지 최상단 제목. 화면당 1회 |
| `heading` | 1.125rem | 600 | 카드·섹션 제목 |
| `body` | 0.875rem | 400 | 본문 기본. shadcn 컴포넌트 기본 크기와 일치 |
| `label` | 0.875rem | 500 | 버튼·라벨·배지 |
| `mono` | 0.875rem | 400 | 숫자·코드. `tnum` 으로 자릿수 고정 |

shadcn 기본 본문이 `text-sm`(0.875rem)이라 `body` 를 여기에 맞췄다.
`1rem` 으로 올리면 기성 컴포넌트와 어긋난다.

### Banned

- 프로젝트 고유 금지만 여기에 적는다. 범용 금지는 `../DESIGN.md` 의 Do's and Don'ts 를 따른다.
- 값이 갱신되는 숫자에 `sans` 사용 — `mono` + 우측 정렬

## Layout

4px 배수. `spacing` 토큰이 Tailwind v4 기본 스케일과 값이 같으므로 실질적으로 무해한 재정의다.
`p-5` `gap-1.5` `size-4` 처럼 여기 없는 단계는 Tailwind 기본 `--spacing` 이 계속 생성한다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `1` | 4px | 아이콘·텍스트 간격 |
| `2` | 8px | 요소 내부 |
| `3` | 12px | 버튼·입력 패딩 |
| `4` | 16px | 카드 내부 기본 |
| `6` | 24px | 카드 패딩 · 그룹 간격 |
| `8` | 32px | 섹션 간격 |

사이드바 폭 256px 은 shadcn `Sidebar` 기본값과 같다.

## Elevation & Depth

**alpha 스키마에 shadow 토큰 타입이 없다.** 아래가 정본이며 코드에서 직접 구현한다.

| 층 | 표현 | 적용 |
|---|---|---|
| 0 | 없음 | 페이지 표면, 인라인 요소 |
| 1 | `border` 1px | Card, Table — shadcn 기본값. 그림자보다 테두리를 쓴다 |
| 2 | `0 4px 12px rgb(0 0 0 / 0.08)` + border | Popover, DropdownMenu |
| 3 | `0 16px 48px rgb(0 0 0 / 0.16)` + backdrop | Dialog, Sheet |

다크 모드에서 그림자는 거의 보이지 않는다. 층 구분은 표면 밝기와 테두리로 낸다.

## Shapes

| 토큰 | 값 | 적용 |
|---|---|---|
| `none` | 0px | 표·전폭 요소 |
| `sm` | 6px | 배지, 작은 칩 |
| `md` | 8px | 버튼, 입력, 메뉴 항목 |
| `lg` | 10px | 카드, 패널 |
| `xl` | 14px | 모달, 시트 |
| `full` | 9999px | 아바타, 원형 아이콘 버튼 |

shadcn 은 `--radius` 하나에서 `calc()` 로 파생하지만 여기서는 확정값을 내보낸다.
값 자체는 `--radius: 0.625rem` 기준 파생과 동일하다.

## Components

28개 엔트리는 실제 shadcn 컴포넌트에 대응하는 동시에, 모든 색 토큰이 최소 1회 소비되도록 해
`orphaned-tokens` 경고를 없앤다.

`focus-ring` / `input-border` / `sidebar-focus-ring` 은 **토큰 소비용 엔트리**다.
스키마에 `borderColor` · `outlineColor` 속성이 없어(컴포넌트 속성은 8개로 고정)
`backgroundColor` 로 표현했다. 실제 구현은 `outline` 또는 `box-shadow` 다.

### 상태 매트릭스 (모든 인터랙티브 요소 필수)

| 상태 | 규칙 |
|---|---|
| default | 위 정의 |
| hover | `fast`(150ms). shadcn 은 `/90` 알파 변형을 쓴다 — 스키마로 표현 불가, 코드에서 처리 |
| active | 이동 없이 색만. `instant` |
| focus-visible | `ring` 색 3px + offset 2px. **제거 금지** |
| disabled | `opacity-50` + `pointer-events-none` (shadcn 기본) |
| loading | 스피너 + 라벨 유지. 버튼 폭 고정 |

### 필수 비상태 화면

- **loading** — `skeleton` 토큰. 스피너 단독 금지
- **empty** — 무엇이 없는지 + 다음 행동 1개
- **error** — 원인 + 복구 경로. `destructive` 는 텍스트에만, 배경 전체에 쓰지 않는다

## Do's and Don'ts

범용 금지 목록은 `../DESIGN.md` 의 같은 섹션을 정본으로 삼는다. 여기 복제하지 않는다 —
같은 금지를 두 곳에 쓰면 갱신 시 갈라진다.

### shadcn 고유

| 금지 | 대신 |
|---|---|
| `components/ui/*.tsx` 를 업스트림과 다르게 대량 수정 | 래퍼 컴포넌트를 새로 만든다. CLI 업데이트가 덮어쓴다 |
| semantic 토큰 이름 변경 | 참조 대상(primitive)만 바꾼다 |
| `bg-neutral-900` 처럼 primitive 직접 사용 | `bg-primary` |
| `--input` 을 배경색으로 사용 | 테두리 색이다. 배경은 `--background` |
| `cn()` 없이 `className` 문자열 결합 | `cn()` 으로 병합해야 변형 우선순위가 맞는다 |
| Dialog 안에 Dialog | 한 단계로 재설계 |
| `--radius` 를 런타임에 바꿔 전체 스케일 조정 | 이 문서의 `rounded` 를 수정하고 재export |

## Motion

> `export` 결과에 모션 토큰은 포함되지 않는다. 아래 표가 정본이다.

| 토큰 | 지속 | 이징 | 적용 |
|---|---|---|---|
| `instant` | 0ms | linear | 고빈도 조작, 값 갱신 |
| `fast` | 150ms | ease-out | 호버·프레스. shadcn `transition-colors` 대역 |
| `base` | 200ms | ease-out | Popover, DropdownMenu, Tooltip |
| `slow` | 300ms | ease-out | Dialog, Sheet |

shadcn v4 는 `tw-animate-css` 를 쓴다(`tailwindcss-animate` 아님).
`data-[state=open]:animate-in` 계열 유틸리티의 기본 지속시간을 위 표에 맞춰 조정한다.

## Accessibility Contract

| 항목 | 규칙 |
|---|---|
| 대비 | 본문 4.5:1, 큰 텍스트·비텍스트 3:1. `lint` 가 컴포넌트 쌍을 검사한다 |
| 색 단독 금지 | `destructive` 만으로 오류를 표시하지 않는다. 아이콘·문구 병기 |
| 포커스 | `focus-visible` 링 제거 금지. shadcn 기본 링을 유지 |
| 키보드 | Radix 프리미티브 기반이라 기본 제공된다. 커스텀 래퍼에서 깨뜨리지 말 것 |
| 폼 | `FormLabel` 사용. placeholder 를 라벨로 쓰지 않는다 |
| `prefers-reduced-motion` | `tw-animate-css` 애니메이션 비활성. 투명도 전환은 유지 |
| 터치 타깃 | 44×44px 이상. shadcn `size-sm` 버튼은 32px 이라 모바일에서 부족하다 |
