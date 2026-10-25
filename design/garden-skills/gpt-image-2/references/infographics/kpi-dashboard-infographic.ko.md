# KPI 대시보드형 인포그래픽 템플릿

이 문서는 "KPI / 대시보드 / 데이터 회고" 인포그래픽을 만들 때 사용합니다.

- 연간 / 분기 / 월간 데이터 회고 이미지
- 제품 핵심 지표 개요
- 개인 연간 결산(책을 몇 권 읽었는지 / 몇 km를 달렸는지 / 영화를 몇 편 봤는지)
- 팀 실적 대시보드
- 기업 연차 보고서의 핵심 페이지
- "X년에 내가 한 일" 데이터 시각화 요약

특징:

- 숫자 + 진행 막대 + 미니 차트 + 아이콘을 많이 사용합니다.
- 독립적인 "지표 카드" 여러 개를 조합합니다.
- 주요 지표는 매우 큰 글자로 표시합니다.
- 데이터가 느껴지는 "데이터 시각화 대시보드"처럼 보여야 합니다.

## 적용 범위

- 연간 / 분기 / 월간 결산
- 개인 회고 / 데이터 요약
- 제품 / 사업 KPI 개요
- 기업 연차 보고서의 주요 페이지
- 사용자 래핑 콘텐츠(Spotify Wrapped 스타일)

## 사용 시점

- 사용자가 "KPI / dashboard / 대시보드 / 연말 결산 / wrapped / 데이터 요약 / 회고"를 언급할 때
- "데이터가 강하게 느껴지고 SaaS 백오피스나 Wrapped처럼 보이는" 디자인을 원할 때
- 실제로 표시할 숫자가 있을 때

다음에는 사용하지 마세요.

- 다양한 콘텐츠를 모듈로 나누는 벤토 그리드를 원하는 경우(`infographics/bento-grid-infographic.md` 사용)
- 출판물 수준의 엄격한 데이터 차트를 원하는 경우(`academic-figures/publication-chart.md` 사용)
- 비즈니스 보고서 슬라이드를 원하는 경우(`slides-and-visual-docs/visual-report-page.md` 사용)
- 브랜드 아이덴티티 시스템 보드를 원하는 경우(`branding-and-packaging/brand-identity-board.md` 사용)

## 누락 정보 확인 우선순위

1. 주제 + 기간(예: "2025년 독서 회고 / 3분기 사업 개요 / 월간 달리기 데이터")
2. 주요 지표(가장 큰 숫자 1~3개. 예: "책 47권 완독", "매출 1,200만 위안", "612km 달리기")
3. 보조 지표(4~8개. 예: "가장 많이 읽은 장르", "가장 빠른 랩타임", "가장 바빴던 달")
4. 추세 차트 / 순위 / 비중 차트가 필요한지 여부(어떤 데이터가 자연스럽게 시각화되는지)
5. 색상(기술적인 어두운 색 / 따뜻한 결산 / Spotify Wrapped 그라데이션 / 미니멀 흰 배경)
6. 비율(샤오홍슈 3:4 / 공식 계정 16:9 / 1:1)

## 기본 템플릿: KPI 대시보드 인포그래픽

📖 설명

한 이미지에 여러 지표 카드를 배치합니다. 맨 위에는 큰 숫자로 주요 지표를 놓고 아래에는 숫자 + 진행 링 / 미니 차트 / 순위 / 추세선으로 구성된 보조 지표 카드를 배치합니다. 세심하게 디자인한 데이터 스냅샷처럼 보여야 합니다.

📝 프롬프트

```json
{
  "type": "KPI 대시보드 인포그래픽",
  "goal": "숫자 묶음을 '데이터 시각화 대시보드' 형태로 표현해 독자가 데이터 규모와 분포를 한눈에 파악하도록 함",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"3:4 portrait\"}",
    "background": "{argument name=\"background\" default=\"짙은 잉크색 #0F172A에서 #1E293B로 이어지는 그라데이션(다크 모드)\"}",
    "alt_background_light": "따뜻한 크림색 #F8F5EE(사용자가 밝은 화면을 선호하는 경우)"
  },
  "header": {
    "main_title": "{argument name=\"main_title\" default=\"2025년 독서 결산\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"올해 완독 / 읽는 중 / 중단한 책 한눈에 보기\"}",
    "period": "{argument name=\"period\" default=\"2025.01 - 2025.12\"}"
  },
  "palette": {
    "primary_text": "{argument name=\"primary_text\" default=\"#F1F5F9\"}",
    "accent_main": "{argument name=\"accent_main\" default=\"시안 #22D3EE\"}",
    "accent_secondary": "{argument name=\"accent_secondary\" default=\"바이올렛 #A78BFA\"}",
    "accent_alert": "{argument name=\"accent_alert\" default=\"로즈 #FB7185\"}",
    "rule": "주색은 4가지로 제한하고 강조색은 '핵심 숫자 강조'에 사용"
  },
  "hero_metrics": {
    "count": "{argument name=\"hero_count\" default=\"3\"}",
    "rule": "상단에 주요 지표 카드를 1~3개 배치합니다. 각 카드는 매우 큰 숫자 + 짧은 라벨 + 전년 대비 변화 화살표로 구성합니다.",
    "examples": [
      { "value": "47", "label": "완독한 책", "delta": "↑ +12 vs 2024" },
      { "value": "23,140", "label": "총 페이지 수", "delta": "↑ +28%" },
      { "value": "8.2", "label": "평균 평점", "delta": "↓ -0.1" }
    ]
  },
  "sub_metrics": {
    "count": "{argument name=\"sub_count\" default=\"6\"}",
    "card_types_to_use": [
      "progress_ring  — 원형 진행률, 중앙 숫자 + 라벨('목표 달성률 78%'에 적합)",
      "bar_mini       — 여러 항목의 순위를 보여 주는 미니 가로 막대('가장 많이 읽은 장르 TOP 5'에 적합)",
      "trend_line     — 시간에 따른 추세를 보여 주는 미니 선 그래프('월별 독서량 추이'에 적합)",
      "donut_split    — 2~4개 구간의 비중 도넛 차트('전자책 vs 종이책 비율'에 적합)",
      "big_number_card — 숫자 하나 + 라벨('가장 빨리 완독한 책: 3일'에 적합)",
      "ranked_list    — 3~5개 항목의 순위 목록('평점이 가장 높은 책 TOP 3'에 적합)"
    ],
    "rule": "각 카드는 작은 제목 + 주요 시각 요소(chart) + 짧은 데이터 메모(한 줄 이하)를 포함",
    "examples": [
      { "type": "ranked_list", "title": "평점 TOP 3", "items": ["《...》 9.5", "《...》 9.3", "《...》 9.1"] },
      { "type": "donut_split", "title": "종이책 vs 전자책", "values": "60% / 40%" },
      { "type": "trend_line", "title": "월별 독서량", "delta": "최고점: 8월 7권" },
      { "type": "progress_ring", "title": "연간 목표", "value": "94%(47/50)" },
      { "type": "bar_mini", "title": "장르 TOP 5", "items": "교양 / 소설 / 역사 / 경영·경제 / 철학" },
      { "type": "big_number_card", "title": "가장 빨리 완독한 책", "value": "3일" }
    ]
  },
  "layout": {
    "structure": "상단 hero_metrics 가로 배열 → 중간 sub_metrics 그리드(2열 × 3행 또는 3열 × 2행) → 하단 footer 띠",
    "card_styling": "반경 16~24px, 반투명한 짙은 색 채우기 + 1px 밝은 테두리, 넉넉한 내부 패딩, 명확한 텍스트 위계"
  },
  "footer": {
    "tagline": "{argument name=\"footer_tagline\" default=\"내년에도 계속 📚\"}",
    "credit": "{argument name=\"credit\" default=\"@your_handle · gpt-image-2로 제작\"}"
  },
  "constraints": {
    "must_keep": [
      "숫자를 실제로 읽을 수 있어야 함(큰 글자, 강한 대비)",
      "모든 카드에 데이터 시각화가 있어야 하며 순수 텍스트만 사용하지 않음",
      "색상 의미를 명확히 함: accent_main은 주요 숫자, alert는 부정 / 이상 상태에만 사용",
      "카드 사이의 간격과 모서리 반경을 통일",
      "변화가 느껴지는 trend_line 또는 progress_ring 카드가 최소 하나 있어야 함"
    ],
    "avoid": [
      "숫자가 너무 작아 읽기 어려움",
      "카드가 텍스트만 포함해 대시보드 느낌을 잃음",
      "색상 5가지를 넘어 대시보드가 아니라 무지개처럼 보임",
      "가짜 정밀도처럼 보이는 차트(정확한 척하는 좌표 등) → 예시용임을 표시",
      "대시보드를 순수 표로 만듦",
      "Comic Sans / 손글씨체를 사용해 데이터 느낌이 사라짐"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `hero_metrics`(구체적인 숫자와 라벨이 있는 주요 지표 최소 하나), `sub_metrics` 개수, 색상 선호(어두운 화면 / 밝은 화면)
- **기본값 지정 가능**: `aspect_ratio`(3:4), `palette`(어두운 화면의 시안 + 바이올렛), 카드 반경 / 간격
- **무작위 지정 가능**: 사용자가 지정하지 않은 경우 각 보조 지표 카드에 사용할 차트 종류

### 자동 완성 전략

- 사용자가 주제와 숫자 몇 개만 주면 카드 구성을 합리적으로 채우고 trend 1개, ranked_list 1개, progress_ring 1개 이상을 포함합니다.
- 사용자가 "Spotify Wrapped 스타일"을 원하면 선명한 그라데이션 배경(분홍·보라·주황)을 쓰고 서체를 더 대담하게 바꿉니다.
- 사용자가 "연차 보고서의 진중한 버전"을 원하면 밝은 배경 + 단색 팔레트를 쓰고 서체를 Inter로 바꾸며 이모지를 제거합니다.
- 사용자가 "개인 회고"를 원하면 하단 제작자 표시를 넣고 따뜻한 강조색을 쓰며 귀여운 이모지를 추가할 수 있습니다.

## 변형 1: Spotify Wrapped 스타일

```json
{
  "type": "Wrapped 스타일 KPI 대시보드",
  "modify": {
    "background": "선명한 그라데이션(자홍색 → 청보라 → 주황색)",
    "typography": "매우 굵은 디스플레이 글꼴, 슬로건 스타일",
    "hero_metrics": "숫자를 화면 너비 대부분을 차지하도록 크게 표시하고 한 페이지에 주요 지표 하나만 배치",
    "vibe": "음악 플레이어의 연간 결산처럼 리듬과 강한 감정이 느껴지는 분위기"
  }
}
```

적합: 개인 연간 결산, 브랜드 Wrapped 캠페인, 소셜 플랫폼 연말 이미지.

## 변형 2: 비즈니스 / 사업용 진중한 대시보드

```json
{
  "type": "비즈니스 KPI 대시보드 인포그래픽",
  "modify": {
    "background": "순백색 #FFFFFF 또는 아주 옅은 회색 #F8FAFC",
    "palette": "짙은 회색 기본 글자 #0F172A, 단일 짙은 파란색 강조 #1E40AF",
    "typography": "Inter / Söhne, 매우 절제된 스타일",
    "vibe": "투자자 덱 / 연차 보고서 / 분기 보고서"
  }
}
```

적합: 기업 연차 보고서, 분기 사업 리뷰, 투자자 브리핑.

## 변형 3: 레트로 / 신문 스타일 데이터 회고

```json
{
  "type": "레트로 신문 스타일 KPI 인포그래픽",
  "modify": {
    "background": "따뜻하고 오래된 종이",
    "palette": "검정 + 빨강 + 베이지 세 가지 색",
    "typography": "세리프 제목(Playfair / Bodoni) + 고정폭 숫자",
    "vibe": "The Economist / Wall Street Journal 데이터 특집 페이지 같은 느낌"
  }
}
```

적합: 언론사의 연간 데이터 특집, 레트로 콘텐츠, 진지한 독자 대상 콘텐츠.

## 피해야 할 사항

- 데이터가 전부 텍스트면 대시보드 시각화의 의미가 사라집니다.
- 카드 사이 간격이 없으면 개별 카드의 구분이 사라집니다.
- 주색을 5가지 넘게 쓰면 대시보드가 아니라 무지개판처럼 보입니다.
- Comic Sans 같은 손글씨체를 쓰면 데이터 신뢰도가 떨어집니다.
- X축 / Y축의 수치가 실제인 것처럼 정밀한 척하지 않습니다(허구 수치로 오해를 부름).
- 카드 안 정보가 너무 비면(큰 숫자 + 라벨 하나만 있음) 여백이 과도해 보입니다.
- 주요 지표가 없고 모든 카드 크기가 같으면 시각적 중심을 잃습니다.
