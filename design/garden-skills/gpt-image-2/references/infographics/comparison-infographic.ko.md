# 비교 인포그래픽 템플릿

이 문서는 "두 대상 또는 여러 대상을 비교"하는 인포그래픽을 만들 때 사용합니다.

- A와 B의 두 열 비교(제품 / 개념 / 방법)
- 세 대상 비교(예: 세 가지 방안 / 요금제 세 단계)
- 여러 기준으로 평가(여러 제품 × 여러 평가 항목)
- 장단점 / 찬반 비교
- "기존 방식 vs 새로운 방식"을 설명하는 이미지
- 가격대 비교 이미지

특징:

- 좌우 또는 여러 열로 엄격하게 정렬합니다.
- 각 열의 머리 부분에 명확한 대상(캐릭터 / 이름 / 큰 이미지)을 둡니다.
- 각 행은 하나의 비교 기준입니다.
- ✓ ✗, 색상, 점수 등으로 차이를 분명히 표현합니다.
- "어느 쪽이 더 나은지" 한눈에 알 수 있어야 합니다.

## 적용 범위

- 제품 대 제품 비교 이미지
- 방법 / 방안 / 학파 비교 이미지
- 요금제 등급 비교 이미지
- 장단점 비교 이미지
- "오해 vs 정답" 설명 이미지

## 사용 시점

- 사용자가 "대조 / 비교 / vs / PK / 장단점 / 찬반 / 두 열 / 여러 열 비교 / 요금제 / 등급"을 언급할 때
- 독자가 "어느 쪽이 자신에게 더 맞는지 한눈에 구별"하길 원할 때
- 시각적으로 "대결 / 선택" 느낌을 원할 때

다음에는 사용하지 마세요.

- "단계 / 절차"를 원하는 경우(`infographics/step-by-step-infographic.md` 사용)
- "벤토 그리드 고밀도 정보"를 원하는 경우(`infographics/bento-grid-infographic.md` 사용)
- "슬라이드 한 페이지 설명"을 원하는 경우(`slides-and-visual-docs/` 사용)
- "실제 엔지니어링 비교표 / 설정표" 형태의 순수 표 이미지를 원하는 경우(`academic-figures/qualitative-comparison-grid.md` 사용)

## 누락 정보 확인 우선순위

1. 비교 대상 수(2 / 3 / 4개)
2. 각 대상의 이름
3. 비교 기준 수(4~7개 권장. 예: 가격, 성능, 사용 편의성, 확장성, 생태계, 학습 곡선)
4. 각 기준에서 대상별로 구체적으로 다른 점
5. 뚜렷한 "승자 표시"(왕관 / TOP 1 라벨)가 필요한지 여부
6. 색상 방향(중립 / 따뜻한 색 / 기술 / 흑백)
7. 화면 비율(샤오홍슈 3:4 / 공식 계정 16:9 / 1:1)

## 기본 템플릿: 두 열 비교 인포그래픽

📖 설명

이미지를 좌우 두 열로 나눕니다. 각 열의 상단에는 비교 대상(로고 / 아바타 / 큰 이미지)을 배치하고, 아래에는 4~7개의 비교 기준 행을 둡니다. 각 행은 아이콘 + 짧은 텍스트 + 색상 / ✓✗로 차이를 표현하며 아래쪽에 한 줄 결론을 둡니다.

📝 프롬프트

```json
{
  "type": "두 열 비교 인포그래픽",
  "goal": "독자가 '어느 쪽이 자신에게 더 잘 맞는지' 한눈에 알 수 있는 비교 이미지를 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"3:4 portrait\"}",
    "background": "{argument name=\"background\" default=\"따뜻한 미색 #F8F6F2\"}",
    "split_line": "{argument name=\"split_line\" default=\"가운데 얇은 구분선 / 또는 교차하는 대결 기호 'VS'\"}"
  },
  "header": {
    "main_title": "{argument name=\"main_title\" default=\"React와 Vue, 무엇을 선택할까? 2026 실전 비교\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"7가지 기준으로 결정하기\"}"
  },
  "columns": [
    {
      "id": "left",
      "name": "{argument name=\"left_name\" default=\"React\"}",
      "color_theme": "{argument name=\"left_color\" default=\"시안 #61DAFB + 짙은 회색\"}",
      "header_visual": "{argument name=\"left_visual\" default=\"React 로고(큰 크기 + 밝은 배경 카드)\"}",
      "tagline": "{argument name=\"left_tagline\" default=\"유연하고 생태계가 풍부하며 커뮤니티가 큼\"}"
    },
    {
      "id": "right",
      "name": "{argument name=\"right_name\" default=\"Vue\"}",
      "color_theme": "{argument name=\"right_color\" default=\"에메랄드 #41B883 + 짙은 회색\"}",
      "header_visual": "{argument name=\"right_visual\" default=\"Vue 로고(큰 크기 + 밝은 배경 카드)\"}",
      "tagline": "{argument name=\"right_tagline\" default=\"배우기 쉽고 문서가 좋으며 규약이 많음\"}"
    }
  ],
  "comparison_rows": {
    "count": "{argument name=\"row_count\" default=\"7\"}",
    "structure": "각 행: 왼쪽의 기준 아이콘 + 가운데 정렬된 기준 이름('중앙 열') → 왼쪽과 오른쪽 대상의 성과를 배치하고, 오른쪽에 색상 면 / ✓✗ / 별 1~5개로 표시",
    "items": [
      "학습 곡선",
      "시작 속도",
      "생태계 성숙도",
      "채용 시장",
      "성능",
      "TypeScript 사용 경험",
      "적합한 프로젝트 유형"
    ],
    "marker_style": "{argument name=\"marker_style\" default=\"별점 5점 척도 + 색상 비교\"}",
    "highlight_winner_per_row": true
  },
  "footer": {
    "verdict": "{argument name=\"verdict\" default=\"팀의 선호에 따라 결정하세요. 빠르게 익히려면 Vue, 장기적인 생태계를 원하면 React를 선택하세요.\"}",
    "winner_badge": {
      "enabled": "{argument name=\"winner_badge_enabled\" default=\"false\"}",
      "label": "{argument name=\"winner_badge_label\" default=\"Editor's Choice\"}",
      "position": "left | right"
    }
  },
  "constraints": {
    "must_keep": [
      "좌우 열의 너비를 대칭으로 유지",
      "모든 행의 높이를 정렬",
      "기준 이름은 가운데('중앙 열')에 두고 좌우에서 각각 성과를 표현",
      "한쪽이 다른 쪽을 압도하는 색상 사용 금지(승자를 명시한 경우 제외)",
      "글꼴을 통일",
      "데이터 / 점수를 시각적으로 표시하고 순수 텍스트만 사용하지 않음"
    ],
    "avoid": [
      "좌우 열의 크기가 비대칭",
      "비교 기준 행에 아이콘이 없음",
      "색상이 충돌해 어느 쪽이 어느 대상인지 구분하기 어려움",
      "비교 기준이 1~2개뿐이라 정보 밀도가 낮음",
      "비교 기준이 10개를 넘어 행이 지나치게 좁아짐",
      "결론이 지나치게 주관적임(객관적인 한 문장 요약 권장)"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `left_name`, `right_name`, `row_count`(또는 구체적인 기준 목록)
- **기본값 지정 가능**: `background`, `marker_style`(별점 5점), `color_theme`(브랜드 색상 / 기본 색상 기반)
- **무작위 지정 가능**: 기준 아이콘의 구체적인 형태, `split_line`을 얇은 선 또는 VS 기호 중 무엇으로 할지

### 자동 완성 전략

- 사용자가 대상 두 개만 제시하면(예: "React vs Vue") 흔한 비교 기준 7개를 자동으로 추론합니다.
- 사용자가 주제만 제시하면(예: "React와 Vue 비교") 이름, 태그라인, 색상 테마(브랜드 색상 사용)를 보완합니다.
- 사용자가 승자를 지정하지 않으면 승자 배지를 넣지 않고 중립적인 결론을 씁니다.
- 사용자가 "대결하는 느낌을 분명하게" 원하면 VS 기호 + 승자 배지 + 대비가 강한 색상을 추가합니다.

## 변형 1: 세 열 비교(요금제 등급 / 세 가지 방안)

```json
{
  "type": "세 열 등급 비교 인포그래픽",
  "columns_count": 3,
  "column_examples": ["Free", "Pro", "Enterprise"],
  "rule": "가운데 열을 조금 넓고 밝은 배경으로 표시하고 'Most Popular' 배지를 추가합니다. 행은 기능 기준 + ✓ ✗ 정량 지표로 구성합니다."
}
```

적합: SaaS 가격 페이지, 요금제 비교, 멤버십 등급 비교.

## 변형 2: 오해 vs 정답(정보 전달용)

```json
{
  "type": "오해 vs 정답 두 열 비교",
  "left_column": {
    "label": "❌ 흔한 오해",
    "color": "차분한 빨강 / 회색",
    "items": "흔히 하는 잘못된 주장 3~5개"
  },
  "right_column": {
    "label": "✅ 올바른 방법",
    "color": "차분한 초록 / 산뜻한 색",
    "items": "간단한 설명을 덧붙인 올바른 주장 3~5개"
  },
  "vibe": "교육 / 정보 전달 / 건강 / 육아"
}
```

적합: 건강 정보, 육아 관련 오해, 현명한 소비, 운동 관련 오해.

## 변형 3: 여러 제품 × 여러 기준 평가 매트릭스(가로형)

```json
{
  "type": "여러 열 가로형 평가 매트릭스",
  "layout": "맨 윗줄 = 제품 여러 개(4~6개), 왼쪽 열 = 평가 기준(5~8행), 셀 안 = 점수 / ✓✗ / 짧은 텍스트",
  "highlight_rule": "각 행에서 최고 점수를 색으로 강조하고 각 열 아래에 우승 횟수를 표시",
  "vibe": "미디어 제품 리뷰 이미지, 소비자 보고서"
}
```

적합: 카메라 리뷰, 노트북 평가, 앱 비교, SUV 비교.

## 피해야 할 사항

- 두 열의 너비가 비대칭이면 시각적으로 한쪽에 치우쳐 불공정해 보입니다.
- 행 높이가 다르면 비교 항목의 위치가 맞지 않습니다.
- 기준 아이콘이 없으면 행끼리 구별하기 어렵습니다.
- 양쪽 색상이 완전히 같으면 좌우 구분이 사라집니다.
- 색상 대비가 지나치게 강하면(한쪽은 선명한 빨강, 다른 쪽은 선명한 초록) 감정적인 판결처럼 보입니다.
- 점수를 1 / 0으로만 표현하면 단계감이 없습니다(별 1~5개 / 점 / 진행 막대 권장).
- 결론 문구가 없으면 독자는 어떤 선택을 권하는지 알 수 없습니다.
- 비교 이미지를 순수 텍스트 표로 만들면 인포그래픽의 "한눈에 읽히는" 특성이 사라집니다.
