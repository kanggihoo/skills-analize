# 전자상거래 라이브 / 소셜 라이브 UI 목업 템플릿

이 문서는 "인물 초상화 + 라이브 스트리밍 플랫폼 UI 오버레이"가 포함된 복합 비주얼을 만들 때 사용합니다.

적합한 용도:

- 전자상거래 라이브 화면
- 소셜 미디어 라이브 방송 스크린샷
- 스트리머 상품 판매 목업
- 채팅 말풍선 + 선물 팝업 + 상품 카드가 포함된 라이브 UI 합성 이미지

## 사용 규칙

이 템플릿의 핵심은 특정 스트리머를 고정하는 것이 아니라 이미지 구조를 안정적으로 정의해 사용자가 다음 중 하나를 선택하도록 하는 것입니다.

- 실제 인물 사진 지정
- 유명인 이름 지정
- 인물 설명 지정
- 완전히 무작위로 스트리머 캐릭터 생성

상품 카드, 채팅 메시지, 배경 브랜드, 선물 내용도 다음 방식으로 지정할 수 있습니다.

- 사용자 지정
- 기본값 사용
- 합리적인 범위에서 무작위 생성

## 누락 정보 확인 우선순위

사용자가 "전자상거래 라이브 UI 목업 하나 만들어 줘"라고만 말하면 우선 다음을 질문합니다.

1. 스트리머 출처: 실제 사진 / 유명인 이름 / 인물 설명 / 무작위 생성
2. 상품 정보: 무엇을 판매하는지
3. 플랫폼 스타일: 도우인 / 샤오홍슈 / 타오바오 라이브 / 일반 라이브 중 무엇에 가까운지
4. 언어: 중국어 또는 영어 인터페이스

사용자가 질문마다 답하기 싫어하면 "자동 완성 모드"를 명확히 제안합니다.

- 보조 정보는 무작위로 채움
- 사용자가 지정한 핵심 요소만 유지

## 템플릿 1: 일반 전자상거래 라이브 UI 목업

📖 설명

인물 초상화 위에 소셜 미디어 라이브 인터페이스를 겹쳐 실제 화면처럼 표현합니다. 사용자 지정 채팅 메시지, 선물 팝업, 상품 구매 카드를 포함합니다.

📝 프롬프트

```json
{
  "type": "전자상거래 라이브 UI 목업",
  "goal": "스트리머 초상화를 중심으로 전체 라이브 인터페이스가 겹쳐진 실제 방송 판매 스크린샷 스타일의 시각물을 생성. 소셜 공유, 콘셉트 목업, 라이브 판매 비주얼 제안에 적합",
  "subject": {
    "source_mode": "{argument name=\"host source mode\" default=\"celebrity-name\"}",
    "reference_photo": "{argument name=\"host reference photo\" default=\"none\"}",
    "celebrity_name": "{argument name=\"host name\" default=\"Elon Musk\"}",
    "description": "{argument name=\"host portrait description\" default=\"흰색 기술 도식이 인쇄된 검은색 티셔츠를 입고 웃는 상반신 인물 사진\"}",
    "pose": "{argument name=\"host pose\" default=\"카메라를 정면으로 보고 약간 앞으로 기울여 라이브 방송에서 말하는 듯한 자세\"}",
    "expression": "{argument name=\"host expression\" default=\"편안하고 자신감 있으며 소통하는 느낌\"}"
  },
  "scene": {
    "background_style": "{argument name=\"background style\" default=\"기술 회사 발표회 백스테이지 + 라이브 방송 세트\"}",
    "left_background": "왼쪽 화면에 '{argument name=\"left background logo\" default=\"SPACEX\"}'라는 글자가 표시",
    "right_background": "오른쪽 화면에 빨간 '{argument name=\"right background logo\" default=\"Tesla T logo\"}'와 짙은 색 자동차가 표시",
    "lighting": "{argument name=\"lighting\" default=\"밝고 상업적이며 스튜디오 수준의 보조광, 실제 라이브 스크린샷 느낌은 유지\"}"
  },
  "ui_overlay": {
    "platform_style": "{argument name=\"platform style\" default=\"일반 중국어 라이브 커머스 플랫폼 UI\"}",
    "top_header": {
      "host_info": "아바타, 이름 '{argument name=\"host name\" default=\"Elon Musk\"}', 부제 '이번 방송 좋아요 55.6만', 빨간색 '팔로우' 버튼",
      "rank_badge": "'전체 1위'라고 적힌 코인 아이콘",
      "viewer_stats": "상단 시청자 아바타 3개, '12.3w', '8.6w', '5.7w' 표시, 합계 '68.7만', 'X' 닫기 버튼",
      "right_links": "'라이브 더 보기 >', '선물 갤러리 0/24'(파란색 '클래식' 라벨 포함)"
    },
    "mid_left_gifts": {
      "count": 2,
      "items": [
        "아바타 'Tech Lover', '하트를 보냄', 하트 아이콘 x 1314",
        "아바타 'Starlight Ocean', '로켓을 보냄', 로켓 아이콘 x 666"
      ]
    },
    "bottom_left_chat": {
      "system_message": "37레벨 배지 '우주 여행자가 라이브 방송에 입장했습니다'",
      "message_count": 7,
      "messages": [
        "Little Rocket: 머스크! 미래가 기대돼요! 🚀",
        "future: Tesla Model 2는 언제 나와요?",
        "Star Dreamer: SpaceX는 올해 화성에 갈 수 있을까요?",
        "AI Explorer: Neuralink 진행 상황은요?",
        "Handsome Netizen: 머스크 형님 안녕하세요!",
        "Mars: 처음 라이브 보는데 정말 신나요!",
        "User123: AI 얘기해 주세요. 인간을 대체할까요?"
      ]
    },
    "bottom_right_product_card": {
      "hot_tag": "주황색 '인기 판매 x 1888'",
      "image": "{argument name=\"product image subject\" default=\"Tesla Cybertruck\"}",
      "title": "{argument name=\"product name\" default=\"Tesla Cybertruck 전기 픽업트럭\"}",
      "price": "{argument name=\"product price\" default=\"¥ 1,618,000\"}",
      "button": "빨간색 '구매' 버튼",
      "floating_animation": "반투명한 하트가 화면 오른쪽 가장자리를 따라 위로 떠오름"
    },
    "bottom_bar": {
      "input_field": "'메시지를 입력하세요...'",
      "icons": ["웃는 얼굴", "더 보기", "장바구니", "선물 상자", "공유"]
    }
  },
  "style": {
    "visual_target": "UI 디자인 시안도 순수 사진 포스터도 아닌, 스트리머 실제 영상과 플랫폼 인터페이스가 자연스럽게 결합된 사실적인 라이브 스크린샷 목업",
    "rendering": "실사 인물 사진 + 플랫폼 UI 오버레이 + 상업 광고 수준의 선명도",
    "color_tone": "기술적이고 상업적이며 플랫폼 라이브 분위기를 함께 표현",
    "composition": "세로형 라이브 스크린샷 구도, 인물은 시각적 중심, UI는 읽기 쉽고 상품 카드는 오른쪽 아래, 채팅 영역은 왼쪽 아래"
  },
  "constraints": {
    "must_keep": [
      "스트리머가 시각적 중심",
      "라이브 UI의 층위가 명확",
      "상품 카드, 채팅 영역, 선물 영역 모두 포함",
      "단순한 콜라주가 아니라 실제 라이브 화면처럼 보여야 함"
    ],
    "avoid": [
      "UI 텍스트를 전혀 읽을 수 없음",
      "인터페이스가 지나치게 복잡함",
      "인물 얼굴이 왜곡됨",
      "상품 카드의 원근감이 잘못됨",
      "채팅창이 배경에 묻힘"
    ]
  }
}
```

## 템플릿 2: 브랜드 창업자 라이브 판매 목업

📖 설명

브랜드 창업자 / 기술 기업가 / 셀럽 대표가 직접 출연하는 신뢰도 높은 라이브 판매 장면에 적합합니다.

📝 프롬프트

```json
{
  "type": "브랜드 창업자 라이브 판매 목업",
  "subject": {
    "identity": "{argument name=\"host identity\" default=\"기술 회사 창업자\"}",
    "name": "{argument name=\"host name\" default=\"Elon Musk\"}",
    "description": "{argument name=\"host portrait description\" default=\"제품 장점을 설명하는 듯 살짝 미소 짓는 신뢰도 높은 실제 상반신 인물 사진\"}"
  },
  "product": {
    "name": "{argument name=\"product name\" default=\"플래그십 스마트 전기차\"}",
    "category": "{argument name=\"product category\" default=\"기술 하드웨어\"}",
    "price": "{argument name=\"product price\" default=\"¥ 399,999\"}",
    "selling_points": [
      "{argument name=\"selling point 1\" default=\"운전자 보조 자율 주행\"}",
      "{argument name=\"selling point 2\" default=\"미니멀한 스마트 실내\"}",
      "{argument name=\"selling point 3\" default=\"긴 주행 거리\"}"
    ]
  },
  "ui": {
    "product_card": "제품 이미지, 제목, 가격, 눈에 띄는 구매 버튼이 있는 신뢰감 높은 상품 카드",
    "chat_style": "가격, 출시 시점, 기능에 대해 질문하는 시청자 채팅",
    "gift_style": "기술 팬덤에 어울리는 선물 문구"
  },
  "constraints": {
    "goal": "단순한 콘셉트 포스터가 아니라 브랜드 대표가 실제 라이브 판매를 하는 것처럼 보여야 함"
  }
}
```

## 템플릿 3: 무작위 스트리머 + 무작위 상품 자동 완성 모드

📖 설명

사용자가 인물이나 상품을 지정하지 않고 "라이브 판매 인터페이스 이미지 하나 만들어 줘"라고 할 때 적합합니다.

📝 프롬프트

```json
{
  "type": "라이브 판매 자동 완성 템플릿",
  "mode": "auto-fill",
  "subject": {
    "host_generation_mode": "그럴듯한 무작위 생성",
    "description": "라이브 출연에 적합하고 명확한 캐릭터 설정, 직업적 느낌, 카메라 앞 표현력을 갖춘 스트리머 자동 생성"
  },
  "product": {
    "generation_mode": "일관성 있는 무작위 생성",
    "rule": "스트리머 설정과 장면에 맞는 상품을 자동 생성하고 명백히 어울리지 않는 조합은 피함"
  },
  "ui": {
    "chat_messages": "상품과 관련 있고 실제 라이브 시청자가 쓸 법한 채팅 문구 자동 생성",
    "gift_messages": "라이브 분위기를 살리는 소량의 선물 팝업 자동 생성",
    "product_card": "합리적인 상품명, 가격, 인기 판매 라벨 자동 생성"
  },
  "constraints": {
    "must_feel": [
      "현실적임",
      "플랫폼 특성이 분명함",
      "정보가 풍부하지만 복잡하지 않음",
      "사례 목업으로 사용하기 적합함"
    ]
  }
}
```

## 이 템플릿에서 변형 만들기

### 변형 1: 사용자가 사진을 제공

- `subject.source_mode`를 `reference-photo`로 설정
- 사용자 이미지를 주제 참고로 사용
- 나머지 UI 필드는 템플릿 구조를 유지

### 변형 2: 사용자가 유명인 이름을 제공

- `celebrity-name` 모드 사용
- 보조 인물 설명 필드는 유지

### 변형 3: 사용자가 인물 설명만 제공

- `text-description` 모드 사용
- 템플릿의 `description` 필드를 주된 정보로 사용

### 변형 4: 사용자가 구체적인 정보를 제공하지 않음

- `auto-fill` 사용
- 핵심 필드만 필요한 만큼 질문
- 나머지 필드는 합리적으로 무작위 완성 가능
