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
name: shadcn Base (Dark)
description: shadcn.DESIGN.md 의 다크 대응본. semantic 이름은 동일하고 참조 대상만 바뀐다.

dials:
  density: 5
  variance: 4
  motion: 4

colors:
  # ── 1층 primitive ── 다크용 팔레트
  neutral-950: "#0A0A0A"
  neutral-900: "#171717"
  neutral-800: "#262626"
  neutral-700: "#404040"
  neutral-400: "#A3A3A3"
  neutral-200: "#E5E5E5"
  neutral-50:  "#FAFAFA"
  white:       "#FFFFFF"
  red-600:     "#DC2626"
  chart-orange: "#E76E50"
  chart-teal:   "#2A9D90"
  chart-navy:   "#8FB3C4"
  chart-sand:   "#E8C468"
  chart-amber:  "#F4A462"

  # ── 2층 semantic ── 라이트본과 "이름이 완전히 동일". 참조 대상만 다르다.
  background:            "{colors.neutral-950}"
  foreground:            "{colors.neutral-50}"
  card:                  "{colors.neutral-900}"
  card-foreground:       "{colors.neutral-50}"
  popover:               "{colors.neutral-900}"
  popover-foreground:    "{colors.neutral-50}"
  primary:               "{colors.neutral-200}"
  primary-foreground:    "{colors.neutral-900}"
  secondary:             "{colors.neutral-800}"
  secondary-foreground:  "{colors.neutral-50}"
  muted:                 "{colors.neutral-800}"
  muted-foreground:      "{colors.neutral-400}"
  accent:                "{colors.neutral-800}"
  accent-foreground:     "{colors.neutral-50}"
  destructive:           "{colors.red-600}"
  destructive-foreground: "{colors.white}"
  border:                "{colors.neutral-800}"
  input:                 "{colors.neutral-700}"
  ring:                  "{colors.neutral-400}"
  chart-1:               "{colors.chart-orange}"
  chart-2:               "{colors.chart-teal}"
  chart-3:               "{colors.chart-navy}"
  chart-4:               "{colors.chart-sand}"
  chart-5:               "{colors.chart-amber}"
  sidebar:                       "{colors.neutral-900}"
  sidebar-foreground:            "{colors.neutral-50}"
  sidebar-primary:               "{colors.neutral-200}"
  sidebar-primary-foreground:    "{colors.neutral-900}"
  sidebar-accent:                "{colors.neutral-800}"
  sidebar-accent-foreground:     "{colors.neutral-50}"
  sidebar-border:                "{colors.neutral-800}"
  sidebar-ring:                  "{colors.neutral-400}"

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

# shadcn Base (Dark)

## Overview

`shadcn.DESIGN.md` 의 다크 대응본. **semantic 토큰 이름이 라이트본과 완전히 동일**하고
1층 primitive 참조만 다르다. 그래서 export 결과를 `.dark { }` 로 감싸기만 하면 된다.

라이트본에 토큰을 추가하면 여기에도 같은 이름으로 추가해야 한다. 이름이 어긋나면
그 토큰은 다크에서 라이트 값을 그대로 쓰게 된다.

## Colors

`destructive` 는 라이트와 같은 `#DC2626` 을 유지했다. shadcn 기본 다크값은 더 밝은 적색이지만
흰 글자와 3.6:1 이라 AA 에 미달한다. `chart-3` 만 어두운 네이비에서 밝은 청회색으로 바꿨다 —
어두운 배경에서 원래 값이 보이지 않는다.

## Typography

라이트본과 동일.

## Layout

라이트본과 동일.

## Elevation & Depth

**다크에서 그림자는 거의 보이지 않는다.** 층 구분은 표면 밝기로 낸다.
`background` #0A0A0A → `card` / `popover` #171717 → hover 표면 #262626.

## Shapes

라이트본과 동일.

## Components

라이트본과 동일한 엔트리. 값만 다크 참조를 따른다.

## Do's and Don'ts

| 금지 | 대신 |
|---|---|
| 라이트본에만 토큰 추가 | 두 파일에 같은 이름으로 추가한다 |
| 다크에서 순수 검정 `#000000` 배경 | `#0A0A0A`. 순수 검정은 OLED 에서 스미어가 보인다 |
| 라이트 팔레트를 그대로 반전 | 채도를 낮추고 밝기를 재조정한다 |
