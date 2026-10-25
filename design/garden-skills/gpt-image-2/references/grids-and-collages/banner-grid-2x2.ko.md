# 2×2 마케팅 배너 그리드 템플릿

이 문서는 "한 이미지 안에 같은 시리즈 디자인의 독립 배너 4개"를 구성할 때 사용합니다.

- 온라인 교육 강좌 시리즈 배너
- 연수 / 신입생 모집 배너
- 브랜드 행사 다중 장면 배너
- SNS / 소셜 피드 광고 4종 세트

특징:

- 크기가 같은 2×2 그리드
- 각 칸이 제목 + 시각 요소 + CTA를 갖춘 독립 배너
- 네 배너의 스타일은 통일하되 내용은 다르게 구성
- 각 배너를 따로 잘라 게시할 수 있음

## 적용 범위

- 교육 / 연수 배너 시리즈
- 브랜드 SNS 세트
- 여러 장면의 행사 광고
- A/B 테스트용 시안

## 사용 시점

- 사용자가 "배너 시리즈 / 강좌 배너 / 광고 4장"을 언급할 때
- 같은 스타일로 배너 네 개를 한 번에 만들고 싶어 할 때
- SNS 광고 소재가 필요할 때

다음에는 사용하지 마세요.

- 완성된 대형 배너 한 장(`poster-and-campaigns/banner-hero.md` 사용)
- 다중 패널 내러티브(`storyboards-and-sequences/four-panel-comic.md` 사용)
- 아바타 그리드(`avatars-and-profile/character-grid-portrait.md` 사용)

## 누락 정보 확인 우선순위

1. 주제 / 사업(교육 / 전자상거래 / 브랜드 행사)
2. 배너 네 장에서 각각 홍보할 내용
3. 각 배너의 핵심 인물 / 소품
4. 브랜드 색상 / 브랜드 글꼴
5. 로고 / CTA가 필요한지 여부
6. 각 배너 내부 화면 비율(1:1 / 4:5 / 16:9)

## 기본 템플릿: 강좌 / 교육 배너 2×2 세트

📖 설명

하나의 이미지에 독립 배너 네 개를 2×2로 배치합니다. 각 배너는 강좌 하나씩을 홍보하며 브랜드 색상과 로고 영역을 공유합니다.

📝 프롬프트

```json
{
  "type": "강좌 배너 2x2 세트",
  "goal": "통일된 스타일의 강좌 배너 4장을 생성합니다. 각각 잘라 SNS / 공식 계정 상단에 게시할 수 있습니다.",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"싱하이 학당\"}",
    "logo_position": "{argument name=\"logo position\" default=\"각 배너의 왼쪽 위 모서리\"}",
    "primary_color": "{argument name=\"primary color\" default=\"#FF6B35\"}",
    "secondary_color": "{argument name=\"secondary color\" default=\"#0F4C81\"}"
  },
  "layout": {
    "format": "2x2 grid",
    "panel_count": 4,
    "gap": "16px 흰색 구분선",
    "panel_aspect_ratio": "{argument name=\"panel aspect\" default=\"4:5\"}",
    "overall_aspect_ratio": "1:1"
  },
  "panels": [
    {
      "position": "top-left",
      "course": "{argument name=\"course 1\" default=\"어린이 코딩\"}",
      "headline": "{argument name=\"headline 1\" default=\"6살부터 배우는 Scratch\"}",
      "visual": "{argument name=\"visual 1\" default=\"화면 앞에서 키보드를 두드리는 만화풍 남자아이\"}",
      "cta": "{argument name=\"cta 1\" default=\"무료 수업 듣기\"}"
    },
    {
      "position": "top-right",
      "course": "{argument name=\"course 2\" default=\"어린이 영어\"}",
      "headline": "{argument name=\"headline 2\" default=\"원어민 선생님과 자연스럽게 대화하기\"}",
      "visual": "{argument name=\"visual 2\" default=\"헤드폰을 쓰고 영어로 말하는 만화풍 여자아이\"}",
      "cta": "{argument name=\"cta 2\" default=\"체험 수업 받기\"}"
    },
    {
      "position": "bottom-left",
      "course": "{argument name=\"course 3\" default=\"어린이 수학\"}",
      "headline": "{argument name=\"headline 3\" default=\"1:1 사고력 훈련\"}",
      "visual": "{argument name=\"visual 3\" default=\"화이트보드에서 문제를 푸는 만화풍 아이\"}",
      "cta": "{argument name=\"cta 3\" default=\"진단 받아 보기\"}"
    },
    {
      "position": "bottom-right",
      "course": "{argument name=\"course 4\" default=\"어린이 미술\"}",
      "headline": "{argument name=\"headline 4\" default=\"매주 완성하는 작품 한 점\"}",
      "visual": "{argument name=\"visual 4\" default=\"그림을 그리는 만화풍 아이\"}",
      "cta": "{argument name=\"cta 4\" default=\"온라인 등록\"}"
    }
  ],
  "style": {
    "art_style": "{argument name=\"art style\" default=\"부드러운 느낌의 평면 카툰\"}",
    "typography": "둥근 한글 글꼴 + 영어 산세리프체"
  },
  "constraints": {
    "must_keep": [
      "네 배너가 같은 브랜드 색상과 로고 스타일을 공유",
      "각 배너를 따로 봐도 완성된 구성이어야 함",
      "제목은 한 줄에 12자 이하",
      "CTA 버튼의 위치를 통일"
    ],
    "avoid": [
      "네 배너의 스타일이 서로 달라짐",
      "제목 글자 크기 차이가 지나치게 큼",
      "CTA 문구의 표현 방식이 통일되지 않음",
      "시각 요소가 지나치게 많이 들어감"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 브랜드 이름, 홍보할 내용 네 가지
- 기본값 지정 가능: 브랜드 색상, 스타일, 레이아웃
- 무작위 지정 가능: 각 시각 요소의 구체적인 형태

### 자동 완성 전략

- 사용자가 브랜드와 제품 네 개를 제시하면 헤드라인 + 시각 요소 + CTA 네 세트를 자동으로 만듭니다.
- 기본값은 2×2 그리드 + 16px 흰색 구분선입니다.
- 사업 유형에 맞는 CTA 문구를 자동으로 고릅니다.

## 변형 1: 전자상거래 상품 배너 세트

📝 프롬프트

```json
{
  "type": "전자상거래 상품 배너 세트",
  "panels": [
    {"course": "신상품", "headline": "기간 한정 첫 출시", "cta": "지금 구매"},
    {"course": "인기 상품", "headline": "TOP 1 베스트셀러", "cta": "상품 보기"},
    {"course": "재구매", "headline": "단골 고객의 호평", "cta": "재구매 할인"},
    {"course": "세트 상품", "headline": "2개 구매 시 1개 증정", "cta": "지금 주문"}
  ],
  "constraints": {
    "must_feel": "전자상거래 분위기 + 구매 전환 중심"
  }
}
```

## 변형 2: 여러 장면의 행사 배너 세트

📝 프롬프트

```json
{
  "type": "여러 장면의 행사 배너 세트",
  "brand": {
    "name": "{argument name=\"event\" default=\"618 쇼핑 행사\"}"
  },
  "panels": [
    {"headline": "사전 예고"},
    {"headline": "판매 시작"},
    {"headline": "인기 상품"},
    {"headline": "앵콜 판매"}
  ],
  "constraints": {
    "must_feel": "행사 전체에 통일된 시각 시스템"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "2x2 배너 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 브랜드와 사업 설명 한 줄을 주면 배너 4장의 주제 + 디자인을 자동으로 결정",
  "constraints": {
    "must_feel": "바로 광고에 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 네 배너의 스타일이 서로 달라지지 않게 합니다.
- 제목 글자 크기 / 서체를 통일합니다.
- CTA 위치를 일관되게 유지합니다.
- 로고를 배너마다 다른 위치에 두지 않습니다.
- 한 배너 안에 시각 요소를 5개 넘게 넣지 않습니다.
