# 타이포그래피

방문자가 보는 것의 대부분이 글자이며, 글자가 페이지를 디자인한 것처럼 보이게 할지 조립한 것처럼 보이게 할지를 크게 결정합니다. 방향 시트에서 글꼴, 굵기, 설정으로 구성된 타이포그래피 시스템을 받습니다. 이 문서는 그 시스템의 사용법입니다.

## 목차

1. 조사에서 측정한 항목
2. 크기 체계: 적은 크기를 큰 차이로 사용
3. 디스플레이 글자 설정
4. 본문 글자 설정
5. 올바른 글꼴 불러오기
6. 글꼴 계열 하나 또는 둘
7. 조판과 타이핑을 구별하는 세부 사항
8. Inspector가 볼 수 없는 실수

## 1. 조사에서 측정한 항목

조사 대상 247개 중 측정 가능한 사이트 202개(Chrome, 1440×900 및 390×844):

| 항목 | 중앙값 | 중간 절반 | 참고 |
|---|---|---|---|
| Hero 제목 크기 | 72px (5.0vw) | 43~109px | 상위 사이트 중앙값: 6.0vw |
| 페이지에서 가장 큰 글자 | 6.4vw | 최대 10.4vw | 상위 사이트 8.4vw, 낮은 점수 사이트 5.0vw |
| 휴대전화 hero 제목 | 40px | 32~59px | |
| Hero 자간 | -0.01em | -0.03~0 | 커질수록 더 좁게 |
| Hero 행간 | 1.0 | 0.95~1.1 | |
| 본문 크기 | 16px | 14~18px | |
| 제목 ÷ 본문 크기 | 4.3 | | 상위 사이트 4.7 |
| 실제 사용 글꼴 수 | 2 | 한 계열 31%, 두 계열 45%, 세 계열 22% | |
| Hero 굵기 | regular 48%, medium 18%, bold 이상 22% | | 큰 글자는 굵지 않아도 됨 |
| Hero 대문자 표기 | 24% | | |
| Hero 가운데 정렬 | 39% | | 낮은 점수 사이트 52% |

여기서 두 가지를 기억합니다. 첫째, 크기 대비가 가장 중요한 조정 수단이며 상위 사이트는 이를 더 강하게 활용합니다. 둘째, 굵기는 그렇지 않습니다. Hero 절반가량이 regular 굵기입니다. 크기와 간격이 글자를 자신 있게 만들며 굵기는 여러 선택지 중 하나입니다.

## 2. 크기 체계: 적은 크기를 큰 차이로 사용

패널은 상위 사이트 114개 중 약 30개가 사이에 다른 크기 없이 글자 크기 두세 개만 사용했다고 설명했습니다. 5~6단계가 균일하게 증가하는 크기 체계를 쓴 사이트는 없었습니다. 따라서 디스플레이 크기 하나, 본문 크기 하나, 작은 크기 하나가 페이지를 구성하고 필요할 때 리드 크기와 제목 크기를 더합니다. 최대 다섯 단계입니다. 흔한 실패는 서로 비슷한 크기 아홉 개를 사용하는 것입니다(16, 18, 20, 24, 28, 32…). 모두 한 덩어리처럼 보입니다. 단계 차이가 분명한 크기를 선택합니다.

```css
:root {
  --step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);   /* 13–14px  captions, legal */
  --step-body:  clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);    /* 17–19px  paragraphs */
  --step-lead:  clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);      /* 20–26px  supporting line, large body */
  --step-head:  clamp(2rem, 1.3rem + 3.2vw, 4rem);             /* 32–64px  section headings */
  --step-display: clamp(3rem, 1rem + 9vw, 9rem);               /* set by the hero blueprint */
}
```

- `--step-display`는 방향에 따라 달라집니다. 기념비적인 wordmark는 16~24vw이고 조용한 계측 도구의 제목은 28px일 수 있습니다. Hero 청사진에 제시된 크기를 사용하고 `clamp()`로 viewport에 맞게 조절하되 휴대전화와 매우 넓은 화면에서 상한·하한을 둡니다.
- 차이를 유지합니다. 데스크톱에서 display 크기는 본문 크기의 최소 네 배여야 합니다. 디자인상 여섯 번째 크기가 꼭 필요하지 않다면 `--step-lead`와 `--step-head` 사이에 새 크기를 두지 않습니다.
- 모든 카드와 레이블에 “부제목” 크기를 추가하지 않습니다. 두 크기가 거의 같아 보이면 하나로 합칩니다.

## 3. 디스플레이 글자 설정

큰 글자는 본문 크기에서는 보이지 않던 간격 문제를 드러냅니다. 40px를 넘는 텍스트에는 다음을 모두 적용합니다.

```css
.display {
  font-size: var(--step-display);
  line-height: 0.95;              /* 0.85–1.05; capitals and condensed faces need less */
  letter-spacing: -0.035em;       /* -0.02 to -0.05em; use the value on the direction sheet */
  font-kerning: normal;
  text-wrap: balance;
  max-width: 14ch;                /* choose the measure so lines break where you want */
  margin: 0;
}
```

- **크기에 따라 자간을 조절합니다.** 글자가 클수록 더 좁은 자간이 필요합니다. 120px에 맞는 값을 32px에 적용하면 글자가 뭉칩니다. 제목 전체에 한 번만 설정하지 말고 크기 단계별로 정합니다.
- **행간을 1.0보다 작게 설정할 때는 확인합니다.** 아래로 내려오는 글자 부분과 다음 줄의 위로 올라오는 글자나 악센트가 부딪히지 않는지 봅니다. 두 줄 제목에서 쉽게 확인할 수 있습니다.
- **모두 대문자**라면 디스플레이 크기에서도 자간을 약간 넓게(0~+0.03em) 두고 행간은 약 0.9로 설정합니다.
- **광학적 정렬**: O, C, A, T, W처럼 둥글거나 대각선으로 시작하는 큰 글자는 안쪽으로 들어간 것처럼 보입니다. 제목을 텍스트 기준으로 시각적으로 맞추려면 왼쪽으로 약 0.04~0.06em 당깁니다(`margin-left: -0.05em`).
- **화면 너비를 가로지르는 글자**: 화면을 가로질러야 하는 한 줄은 `vw`로 크기를 정하고 390 및 1440 viewport에서 확인합니다. `white-space: nowrap`을 설정하고 줄바꿈 대신 컨테이너에서 자릅니다. `copy.md` §2의 k 값으로 문자 수에 따른 크기를 계산합니다: `font-size ≈ container width ÷ (characters × k)`.
- 디스플레이 글자에 text shadow, 외곽선, 그라데이션 채우기를 추가하지 않습니다.

## 4. 본문 글자 설정

```css
body { font-size: var(--step-body); line-height: 1.5; font-kerning: normal; text-rendering: optimizeLegibility; }
p { max-width: 62ch; text-wrap: pretty; margin: 0; }
p + p { margin-top: 0.9em; }
.lead { font-size: var(--step-lead); line-height: 1.35; max-width: 40ch; }
small, .caption { font-size: var(--step-small); line-height: 1.45; }
```

- 행 길이: 45~75자. 이보다 길면 다음 줄을 찾기 어려워집니다. Inspector는 약 88자를 넘으면 경고합니다.
- 행간: 본문은 1.45~1.6, 더 큰 리드 크기는 조금 좁은 1.3~1.4, 긴 글은 더 넓게 설정합니다.
- 보조 텍스트는 더 옅은 잉크(`--muted`)를 사용한 같은 글꼴 계열이어야 합니다. 굵기를 낮추거나 13px 미만으로 줄이지 않습니다.
- 세 줄을 넘는 단락은 가운데 정렬하지 않습니다. 양쪽 맞춤도 하지 않습니다.
- 어두운 바탕 위의 밝은 글자는 더 굵게 보입니다. 굵기를 한 단계 낮추거나 자간을 0.01em 추가하고 행간도 조금 늘립니다.

## 5. 올바르게 글꼴 불러오기

시트에 `<link>` 태그가 지정되어 있으면 그대로 사용합니다. 자신이 선호하는 글꼴로 바꾸지 않습니다.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="…from the direction sheet…" rel="stylesheet">
```

```css
:root {
  --font-display: "Family From Sheet", "Helvetica Neue", Arial, sans-serif;
  --font-text: "Family From Sheet", Georgia, serif;
}
```

- 사용하는 굵기만 요청합니다(보통 전체 두세 개).
- 같은 대분류(sans는 sans, serif는 serif)의 대체 글꼴 stack을 제공합니다.
- framework에서는 같은 계열과 굵기를 사용하는 글꼴 loader를 씁니다(`next/font/google` 또는 `font-display: swap`이 있는 self-hosted `@font-face`). Fontshare 계열은 시트의 `api.fontshare.com` stylesheet에서 불러옵니다.
- 빌드 후 `inspect.mjs`에서 실제 렌더링한 글꼴 계열을 확인합니다. 글꼴을 불러오지 못했다고 경고하면 스크린샷에는 대체 글꼴이 보이고 판단 근거가 무효입니다. 먼저 링크를 수정합니다.

## 6. 글꼴 계열 하나 또는 둘

조사 대상 사이트의 3분의 1은 전체에 한 글꼴 계열을 사용했습니다. 응집력을 얻기 가장 안전한 방법입니다. 추첨된 시스템에 두 글꼴이 있다면:

- 각각 역할 하나를 맡기고 바꿔 쓰지 않습니다. 하나는 제목, 다른 하나는 나머지 모든 글자에 사용합니다.
- 레이블, 숫자, 인용문에 세 번째 글꼴을 추가하지 않습니다.
- 제목 하나 안에 서로 다른 글꼴 두 개를 섞지 않습니다.
- 이탤릭은 작품명과 단락 안의 실제 강조에만 쓰고 장식으로 사용하지 않습니다.

## 7. 조판과 타이핑을 구별하는 세부 사항

- 곡선 따옴표와 아포스트로피, 알맞은 대시, 올바른 줄임표(`copy.md` §7 참고)를 씁니다.
- 열에 놓인 가격, 표, 날짜에는 `font-variant-numeric: tabular-nums`를 사용합니다. 세리프 본문 글꼴에는 `oldstyle-nums`가 어울립니다.
- 링크에는 `text-underline-offset: 0.18em; text-decoration-thickness: 0.07em`을 적용해 밑줄과 글자 아래로 내려오는 부분이 겹치지 않게 합니다.
- 제목은 `hyphens: none`을 사용합니다. 긴 URL이나 이메일에만 `overflow-wrap: anywhere`를 적용합니다.
- 제목은 뒤따르는 텍스트와 한 단위입니다. 제목 위의 공간은 아래보다 최소 두 배 넓어야 합니다.
- `::selection { background: var(--accent); color: var(--accent-ink); }`와 눈에 보이는 포인트 색 `:focus-visible` 외곽선을 사용해 브라우저 자체 상태도 디자인에 포함합니다.
- hover에서 굵기를 바꾸지 않습니다. 줄바꿈 위치가 바뀝니다.

## 8. Inspector가 볼 수 없는 실수

- 두 줄 규칙은 통과하지만 줄바꿈이 나쁜 제목: 둘째 줄에 한 단어만 남거나 구절 중간에서 끊김(“Stools for small / kitchens”). 줄바꿈 위치를 직접 정합니다.
- 디스플레이 글자의 간격이 너무 좁아 글자가 닿거나 너무 넓어 글자가 흩어짐.
- 확신 있는 hero 뒤에 거의 같은 크기의 섹션 제목이 나옴. 화면마다 주도 크기 하나만 둡니다.
- 큰 크기로만 설계한 디스플레이 글꼴로 본문을 씀.
- 모든 것이 굵게 표시됨. 모두 강조되면 아무것도 강조되지 않습니다.
