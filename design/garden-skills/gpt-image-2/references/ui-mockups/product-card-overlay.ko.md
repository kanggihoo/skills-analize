# 상품 카드 오버레이 목업 템플릿

이 문서는 "인물 / 장면 이미지를 바탕으로 상품 카드 / 마케팅 UI 요소를 겹치는" 전자상거래 목업에 사용합니다.

`live-commerce-ui.md`와의 차이:

- `live-commerce-ui.md`: 실제 라이브 플랫폼 인터페이스를 흉내 내고 채팅 영역 / 선물 영역 / 플랫폼 UI 강조
- 이 템플릿: "제품 + 모델 / 제품 + 장면 + 장점 카드" 중심의 마케팅 비주얼. 랜딩 페이지 히어로 또는 전자상거래 상세 페이지 메인 이미지에 가까움

## 적용 범위

- 전자상거래 상세 페이지 대표 이미지 목업
- 랜딩 페이지 히어로 섹션
- 상품 카드가 포함된 소셜 피드 / 공식 계정 이미지
- 단일 이미지 광고: 인물 + 상품 카드 + 장점 배지
- 모델이 상품을 든 장면 + 정보 카드 오버레이

## 사용 시점

- 상품이 무엇인지 / 장점이 무엇인지 / 가격이 얼마인지 이미지 한 장에서 설명하고 싶을 때
- 사용자가 "상세 페이지 대표 이미지 / 광고 이미지 / 히어로 이미지 / 랜딩 페이지 목업"을 언급할 때
- 실제 인물 이미지와 전자상거래 정보 레이어를 동시에 원할 때

다음에는 사용하지 마세요.

- 실제 라이브 방송 스크린샷(`live-commerce-ui.md` 사용)
- 흰 배경 순수 제품 이미지(`product-visuals/white-background-product.md` 사용)

## 누락 정보 확인 우선순위

1. 제품(이름 + 카테고리)
2. 주 대상 출처: 실제 모델 사진, 모델 설명, 인물이 없는 추상 장면
3. 가격 / 장점 / 배지를 표시할지 여부
4. 스타일: 일본식 미니멀 / 테크 / 따뜻한 라이프스타일 / 고급 스튜디오 / 스트리트 패션
5. 주 색상 방향
6. 문구 언어: 중국어 / 영어 / 일본어 / 이중 언어

## 기본 템플릿: 인물 + 상품 카드 + 장점 오버레이

📖 설명

전자상거래 랜딩 페이지의 히어로 시각물을 생성합니다. 안정된 구성: 왼쪽 문구 + 가운데 제품 + 오른쪽 모델 / 장면.

📝 프롬프트

```json
{
  "type": "전자상거래 랜딩 페이지 히어로 상품 카드 오버레이 목업",
  "goal": "전자상거래 상세 페이지 메인 이미지 또는 마케팅 랜딩 페이지 히어로로 바로 사용할 수 있는 이미지 생성. 인물, 제품, 장점, 가격 정보를 모두 포함.",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"DERMA CALM\"}",
    "subtext": "{argument name=\"brand subtext\" default=\"민감 피부 전문 케어\"}"
  },
  "color_palette": {
    "base": "{argument name=\"base color\" default=\"흰색\"}",
    "primary": "{argument name=\"primary color\" default=\"짙은 파랑\"}",
    "accent": "{argument name=\"accent color\" default=\"연한 파랑\"}"
  },
  "layout": {
    "header": {
      "logo": "왼쪽에 브랜드명 + 부제",
      "navigation_links": "{argument name=\"nav links\" default=\"ABOUT, PRODUCT, FEATURE, INGREDIENT, VOICE, Q&A\"}",
      "cta_buttons": "{argument name=\"cta buttons\" default=\"마이페이지, 지금 구매\"}"
    },
    "hero": {
      "left_column": {
        "headline": "{argument name=\"main headline\" default=\"민감 피부도 매일 안심하고 쓰는 순한 케어\"}",
        "subtext": "{argument name=\"sub headline\" default=\"저자극 · 오래가는 보습 · 무향 · 무알코올\"}",
        "buttons": ["지금 구매", "자세히 보기"]
      },
      "center_column": {
        "product": "{argument name=\"product description\" default=\"'Moisture Barrier Serum' 문구가 인쇄된 흰색 펌프 용기\"}",
        "props": [
          "흰 로션 제형의 액적 클로즈업",
          "'피부과 전문의 감수' 원형 배지"
        ]
      },
      "right_column": {
        "subject": "{argument name=\"model description\" default=\"맑고 투명한 피부의 동아시아 젊은 여성, 손가락으로 볼을 부드럽게 만짐\"}",
        "background": "{argument name=\"background\" default=\"흐릿한 실험실 유리 도구 배경, 밝고 깔끔함\"}"
      }
    },
    "bottom_features_panel": {
      "left_cards": {
        "count": "{argument name=\"left feature count\" default=\"3\"}",
        "items": [
          "{argument name=\"feature 1\" default=\"사용자 95%가 별점 5점 평가\"}",
          "{argument name=\"feature 2\" default=\"저자극 포뮬러, 방패 아이콘\"}",
          "{argument name=\"feature 3\" default=\"물방울 아이콘 + 피부 장벽 회복\"}"
        ]
      },
      "right_badges": {
        "count": 3,
        "items": ["무향료", "무알코올", "민감 피부 테스트 완료"]
      },
      "footer": "하단의 작은 면책 안내"
    }
  },
  "style": {
    "rendering": "깨끗하고 임상적이며 상업 수준으로 렌더링, 실제 랜딩 페이지 스크린샷처럼 보임",
    "consistency": "base / primary / accent 세 가지 색상을 엄격히 따름"
  },
  "constraints": {
    "must_keep": [
      "세 열 구조가 명확",
      "제품이 시각적 중심",
      "문구가 제품과 일치",
      "배지가 로고보다 커지지 않음"
    ],
    "avoid": [
      "레이아웃이 극도로 빽빽함",
      "모델 자세가 부자연스러움",
      "팔레트에 채도 높은 추가 색상 포함"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 제품명, 브랜드명, 모델 방향, 주색
- 기본값 지정 가능: 내비게이션 문구, 버튼 문구, 배지 문구
- 무작위 지정 가능: 하단 면책 문구, 장점 표현 방식

### 자동 완성 전략

- 브랜드가 없으면 간결한 영어 브랜드 이름 + 중국어 부제를 생성합니다.
- 모델 방향을 지정하지 않으면 목표 고객을 기본으로 합니다(스킨케어 → 젊은 여성 / 남성 스킨케어 → 젊은 남성 / 디지털 제품 → 도시의 젊은 층).
- 장점은 반드시 세 가지로 하고 서로 중복되지 않으며 공허하지 않게 작성합니다.

## 변형 1: 다크 테크 제품 랜딩 페이지

📝 프롬프트

```json
{
  "type": "다크 테크 브랜드 랜딩 페이지 히어로 목업",
  "theme": "{argument name=\"theme\" default=\"남성 스킨케어 / 디지털 하드웨어\"}",
  "color_palette": ["짙은 네이비", "흰색", "파란색 그라데이션"],
  "header": {
    "logo": "{argument name=\"brand name\" default=\"NEX SKIN\"}",
    "navigation": ["HOME", "PRODUCT", "ABOUT", "FEATURE", "FAQ"],
    "cta_button": "지금 시작 >"
  },
  "hero": {
    "left_column": {
      "headline": "{argument name=\"main headline\" default=\"산뜻함은 매일의 케어에서 시작됩니다\"}",
      "sub_headline": "남성 피부일수록 더 간단하게",
      "feature_highlights": [
        "유분 조절: 피지 관리",
        "보습: 오래 지속되는 촉촉함",
        "한 병으로 완성: 토너 + 에센스 + 로션"
      ]
    },
    "center_image": {
      "subject": "{argument name=\"model\" default=\"깔끔하고 산뜻한 인상의 젊은 아시아 남성\"}",
      "pose": "손으로 턱을 받치고 생각하는 자세"
    },
    "right_column": {
      "product_shot": "{argument name=\"product\" default=\"물방울이 맺힌 가늘고 키 큰 짙은 파란색 용기\"}"
    }
  },
  "bottom_stats_bar": {
    "items": [
      "누적 판매량 120만 병",
      "만족도 92.1%",
      "재구매율 85.3%"
    ]
  },
  "constraints": {
    "must_feel": "단단하고 전문적이며 신뢰할 수 있음"
  }
}
```

## 변형 2: 4분할 인물 + 상품 카드 모음

한 이미지에서 여러 고객군 / 사용 장면을 다룰 때 적합합니다.

📝 프롬프트

```json
{
  "type": "4분할 인물-상품 카드 모음 목업",
  "layout": "2x2 그리드, 각 칸에 인물 하나 + 독립 상품 카드 하나",
  "quadrants": [
    {
      "position": "왼쪽 위",
      "industry": "스킨케어",
      "subject": "볼을 가볍게 만지는 아시아 여성",
      "product": "흰색 펌프 용기",
      "headline": "{argument name=\"q1 headline\" default=\"본연의 피부를 깨우다\"}"
    },
    {
      "position": "오른쪽 위",
      "industry": "외식",
      "subject": "이탈리아식 미트소스 파스타 클로즈업",
      "product": "레스토랑 로고 + 기간 한정 출시 표시",
      "headline": "{argument name=\"q2 headline\" default=\"이 파스타, 화제의 중심\"}"
    },
    {
      "position": "왼쪽 아래",
      "industry": "여행",
      "subject": "고산 호수를 바라보는 배낭을 멘 여성",
      "product": "여행 브랜드 + 할인 배너",
      "headline": "{argument name=\"q3 headline\" default=\"떠나요, 나를 자유롭게\"}"
    },
    {
      "position": "오른쪽 아래",
      "industry": "SaaS 앱",
      "subject": "작업 관리 앱 화면이 표시된 휴대전화",
      "product": "앱 브랜드 + 7일 무료 체험",
      "headline": "{argument name=\"q4 headline\" default=\"작업 관리를 더 간단하게\"}"
    }
  ],
  "constraints": {
    "must_feel": "같은 브랜드 포트폴리오 또는 하나의 광고 캠페인에서 나온 듯한 통일감"
  }
}
```

## 변형 3: 자동 완성 모드

사용자가 "전자상거래 랜딩 페이지 대표 이미지 하나 만들어 줘"라고만 말할 때 적합합니다.

📝 프롬프트

```json
{
  "type": "랜딩 페이지 상품 카드 오버레이 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "주 템플릿을 바탕으로 브랜드명, 문구, 모델 방향을 자동으로 채우되 브랜드, 인물, 제품, 장점 네 요소를 모두 포함",
  "constraints": {
    "must_feel": "실제 전자상거래 광고 이미지",
    "avoid": "PPT처럼 보임"
  }
}
```

## 피해야 할 사항

- 인물 표정이 지나치게 과장되거나 억지 미소가 되지 않게 합니다(신뢰감이 바로 사라짐).
- 장점 배지는 3~4개 이하로 제한합니다. 더 많으면 광고 잡음이 됩니다.
- 문구 색상이 배경과 너무 비슷해 읽기 어려워지지 않게 합니다.
- 제품에는 선명한 주광이 있어야 하며 모델과 함께 흐려지면 안 됩니다.
- 중국어 + 영어 + 일본어를 같은 크기로 모두 쓰지 않습니다. 주 언어 하나가 있어야 합니다.
