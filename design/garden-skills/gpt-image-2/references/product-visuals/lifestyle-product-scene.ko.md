# 라이프스타일 제품 장면 이미지 템플릿

이 문서는 "실제 생활 장면 안에 제품이 놓인" 시각물을 만들 때 사용합니다.

- 책상에서 사용하는 노트북
- 해변 휴가 테이블 위의 음료
- 카페 테이블 위의 라테
- 아침 화장대 위의 스킨케어 제품
- 기숙사 침대 위의 헤드폰
- 야외 캠핑 장면의 장비

강조점:

- 제품이 장면 안에서 "사용 중 / 사용 준비 중 / 막 사용한" 모습
- 실제 생활감
- 자연광 또는 부드러운 조명 중심
- 소품은 적당히 사용하되 제품보다 눈에 띄지 않게 함

`premium-studio-product.md`와의 차이:

- 스튜디오 이미지: 분위기와 제품만 강조, 드라마틱한 조명, 배경 장면 없음
- 라이프스타일 이미지: 실제 장면, 자연광, 인물 일부(손, 뒷모습 등) 포함 가능

`product-card-overlay.md`와의 차이:

- product-card-overlay: 전자상거래 상세 페이지 히어로 이미지, UI 카드 / 문구 오버레이가 필요
- 이 템플릿: 순수한 생활 장면 사진, UI 요소는 필수가 아님

## 적용 범위

- 브랜드 공식 웹사이트 첫 화면
- 마케팅 배너 대표 이미지
- Instagram / 샤오홍슈 / 소셜 피드 표지
- 콘텐츠형 전자상거래 소재
- 명절 프로모션 장면 이미지
- 잡지 스타일 라이프스타일 표지

## 사용 시점

- 사용자가 "장면 이미지 / 라이프스타일 / lifestyle / 실제 장면 / 잡지 느낌"을 언급할 때
- 제품이 "누군가 사용 중인 것처럼" 보이길 원할 때
- 광고처럼 과장되지 않고 자연스러운 이미지를 원할 때

다음에는 사용하지 마세요.

- 전자상거래 메인 이미지가 필요(`white-background-product.md` 사용)
- 분해도가 필요(`exploded-view-poster.md` 사용)
- 포장 전시가 필요(`packaging-showcase.md` 사용)
- 분위기 중심의 고급 단일 제품 광고가 필요(`premium-studio-product.md` 사용)

## 누락 정보 확인 우선순위

1. 구체적인 제품 종류
2. 장면: 책상 / 카페 / 아침 화장대 / 해변 / 야외 / 주방 / 침실
3. 시간: 새벽, 오후, 황혼, 밤
4. 날씨 / 조명: 자연광, 따뜻한 빛, 흐린 날의 부드러운 빛, 실내 조명
5. 인물 포함 여부(일부 / 전신 / 뒷모습)
6. 짧은 문구(slogan / hashtag)가 필요한지 여부

## 기본 템플릿: 단일 제품 + 실제 장면

📖 설명

제품을 실제 생활 장면 안에 배치합니다. 자연광을 주로 사용하고 손 / 뒷모습 등 인물 일부를 포함할 수 있으며, 소품을 조금 사용해 생활감을 더합니다.

📝 프롬프트

```json
{
  "type": "라이프스타일 제품 장면 이미지",
  "goal": "제품이 실제 생활 장면 안에 놓인 이미지를 생성합니다. 분위기는 현실적이고 절제되어 있으며 품질감이 강해 브랜드 대표 이미지 또는 소셜 미디어 표지로 사용할 수 있습니다.",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"흰색 펌프형 에센스 용기\"}",
    "visual_description": "{argument name=\"product visual\" default=\"둥근 어깨 모양의 반투명 흰색 무광 용기, 앞면에 'DERMA CALM' 인쇄\"}",
    "position": "{argument name=\"product position\" default=\"화면 중앙보다 약간 오른쪽 아래\"}"
  },
  "scene": {
    "location": "{argument name=\"scene location\" default=\"이른 아침 햇살이 드는 나무 화장대\"}",
    "time_of_day": "{argument name=\"time of day\" default=\"이른 아침\"}",
    "weather_or_mood": "{argument name=\"mood\" default=\"산뜻하고 부드러우며 막 잠에서 깬 느낌\"}",
    "extra_props": [
      "{argument name=\"prop 1\" default=\"반투명 유리잔에 담긴 맑은 물\"}",
      "{argument name=\"prop 2\" default=\"흩어진 흰 꽃잎 몇 장\"}",
      "{argument name=\"prop 3\" default=\"접어 둔 미색 수건\"}"
    ]
  },
  "lighting": {
    "type": "{argument name=\"light type\" default=\"자연광\"}",
    "direction": "{argument name=\"light direction\" default=\"왼쪽 창문에서 들어오는 측면광\"}",
    "intensity": "{argument name=\"light intensity\" default=\"부드러움\"}",
    "color_temp": "{argument name=\"color temperature\" default=\"약간 따뜻함\"}"
  },
  "human_presence": {
    "enabled": "{argument name=\"include human\" default=\"true\"}",
    "form": "{argument name=\"human form\" default=\"손가락이 용기에 살짝 닿는 등 인물의 일부만 표현\"}",
    "rule": "인물이 포함되면 자연스럽고 연출된 느낌이 없어야 하며 얼굴 전체를 정면으로 보여 주지 않음"
  },
  "text_overlay": {
    "enabled": "{argument name=\"text enabled\" default=\"false\"}",
    "brand": "{argument name=\"brand name\" default=\"\"}",
    "headline": "{argument name=\"headline\" default=\"\"}"
  },
  "style": {
    "rendering": "자연스러운 사진 느낌 + 입자감 + 저채도, 딱딱한 광고 촬영처럼 보이지 않음",
    "depth": "얕은 피사계 심도, 주제는 선명함",
    "consistency": "색조를 통일하고 튀는 고채도 요소를 넣지 않음"
  },
  "constraints": {
    "must_keep": [
      "제품이 시각적 초점",
      "장면이 현실적이고 믿을 만함",
      "조명 방향이 일관됨",
      "소품이 제품과 같은 색상 계열"
    ],
    "avoid": [
      "장면이 3D 렌더처럼 보임",
      "인물의 정면 얼굴이 주목을 빼앗음",
      "소품이 주인공을 압도함",
      "전자상거래 광고 카드가 뚜렷하게 나타남"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 제품, 장면, 인물 포함 여부
- 기본값 지정 가능: 시간, 조명, 소품
- 무작위 지정 가능: 색상 팔레트와 장면에 적합한 소품의 구체적인 항목

### 자동 완성 전략

- 스킨케어 기본값: 아침 화장대 + 자연 측면광 + 수건, 꽃잎, 유리잔
- 음료 기본값: 야외 또는 탁자 + 자연광 + 얼음, 레몬 조각
- 디지털 제품 기본값: 책상 + 실내 자연광 + 노트북, 커피잔
- 아웃도어 장비 기본값: 황혼 자연광 + 산 / 해변 + 단순한 배경 물체

## 변형 1: 음료 야외 장면

📝 프롬프트

```json
{
  "type": "음료 야외 라이프스타일 장면 이미지",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"금색 탄산 음료 캔\"}"
  },
  "scene": {
    "location": "해변의 나무 테이블",
    "time_of_day": "맑은 오후",
    "extra_props": [
      "레몬 장식이 놓인 긴 유리잔",
      "가까이에 맺힌 물방울이 보이는 알루미늄 캔",
      "멀리 흐릿하게 보이는 해변과 하늘"
    ]
  },
  "lighting": {
    "type": "자연광",
    "direction": "상단광 + 반짝이는 보케",
    "intensity": "밝음"
  },
  "human_presence": {
    "enabled": true,
    "form": "멀리 바다를 바라보는 여성의 뒷모습"
  },
  "text_overlay": {
    "enabled": true,
    "headline": "{argument name=\"headline\" default=\"여름, 이 한 모금이면 충분해\"}"
  },
  "constraints": {
    "must_feel": "휴가, 시원함, 자유로움"
  }
}
```

## 변형 2: 책상 위 디지털 제품 장면

📝 프롬프트

```json
{
  "type": "책상 위 디지털 제품 라이프스타일 장면 이미지",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"무선 이어폰 충전 케이스\"}"
  },
  "scene": {
    "location": "미니멀한 북유럽 스타일 책상",
    "time_of_day": "오전",
    "extra_props": [
      "반쯤 열린 노트북",
      "커피잔",
      "작은 식물",
      "펼친 노트"
    ]
  },
  "lighting": {
    "type": "실내 자연광 + 부드러운 상단 조명",
    "direction": "정면에서 약간 왼쪽",
    "intensity": "밝고 균일함"
  },
  "human_presence": {
    "enabled": true,
    "form": "손가락 일부가 책상 위에 자연스럽게 놓임"
  },
  "constraints": {
    "must_feel": "전문적이고 집중되어 있으며 깔끔함"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "라이프스타일 장면 이미지 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 제품명만 주면 적합한 장면, 시간, 조명, 인물 표현 방식을 자동 결정하되 제품이 시각적 중심에 있도록 유지",
  "constraints": {
    "must_feel": "잡지 스타일, 믿을 만함, 과장되지 않음"
  }
}
```

## 피해야 할 사항

- 인물의 정면 얼굴이 주인공이 되지 않게 합니다.
- 소품을 4~5개 넘게 넣지 않습니다.
- 스튜디오 상단 조명과 실내 자연광을 무리하게 섞지 않습니다.
- 채도를 지나치게 높여 딱딱한 광고 사진이 되지 않게 합니다.
- 라이프스타일 이미지에 "가격 + 할인" 전자상거래 카드를 겹치지 않습니다(그 기능은 product-card-overlay 템플릿에 해당).
- 배경에 명백히 충돌하는 브랜드가 나타나지 않게 합니다(예: 경쟁사 발표 장면에 Apple 컴퓨터를 배치).
