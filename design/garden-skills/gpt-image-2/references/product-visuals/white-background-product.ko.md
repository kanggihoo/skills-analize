# 흰 배경 전자상거래 메인 이미지 템플릿

이 문서는 가장 일반적인 "깨끗한 흰 배경 제품 이미지"를 만들 때 사용합니다.

- 단일 제품 흰 배경 이미지
- 여러 각도의 흰 배경 이미지
- 흰 배경 + 옅은 그림자
- 흰 배경 + 미니멀 문구

적합한 용도:

- 플랫폼 대표 이미지(타오바오 / JD / 아마존 / 도우인 전자상거래 첫 이미지)
- 상품 SKU 카드
- 상세 페이지 첫 화면 정지 이미지
- 앱 아이콘 스타일의 제품 시각 미리보기 이미지

## 적용 범위

- 단일 제품 이미지
- 여러 각도 조합 이미지
- 최소한의 문구를 넣은 대표 이미지
- 일반 전자상거래 메인 이미지

## 사용 시점

- 사용자가 "흰 배경 이미지 / 대표 이미지 / 상품 이미지 / 플랫폼 메인 이미지 / SKU 카드"를 언급할 때
- 생활 장면의 분위기 없이 전자상거래 플랫폼에 바로 올릴 수 있는 이미지를 원할 때
- 장식 없이 제품 자체를 강조하고 싶을 때

다음에는 사용하지 마세요.

- 생활 장면 속 제품을 원하는 경우(`lifestyle-product-scene.md` 사용)
- 스튜디오급 분위기와 질감을 원하는 경우(`premium-studio-product.md` 사용)
- 포장 외관을 보여 주고 싶은 경우(`packaging-showcase.md` 사용)

## 누락 정보 확인 우선순위

1. 구체적인 제품(이름 + 핵심 시각 특징)
2. 단일 제품인지 여러 각도인지
3. 문구(브랜드명 / 장점 / 가격)가 필요한지 여부
4. 배지(신상품 / 한정 / 할인)가 필요한지 여부
5. 옅은 그림자와 반사가 필요한지 여부

## 기본 템플릿: 미니멀 흰 배경 단일 제품

📖 설명

깨끗한 흰 배경 중앙에 제품을 배치하고 부드러운 반사 / 바닥 그림자를 줍니다. 브랜드 이름과 판매 장점 하나를 겹쳐 넣을지 선택할 수 있습니다.

📝 프롬프트

```json
{
  "type": "흰 배경 전자상거래 메인 이미지",
  "goal": "전자상거래 플랫폼 상품 대표 영역에 바로 사용할 수 있는 흰 배경 제품 이미지 생성, 제품을 절대적인 시각 중심으로 배치",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"흰색 펌프형 에센스 용기\"}",
    "visual_description": "{argument name=\"product visual description\" default=\"둥근 어깨 형태의 무광 흰색 용기, 은색 금속 펌프, 앞면에 깔끔한 라벨\"}",
    "label_text": "{argument name=\"label text\" default=\"DERMA CALM Moisture Serum 30ml\"}",
    "angle": "{argument name=\"shot angle\" default=\"정면 3/4 시점\"}",
    "scale": "{argument name=\"product scale\" default=\"화면의 60% 차지\"}"
  },
  "background": {
    "type": "{argument name=\"background type\" default=\"순백색\"}",
    "shadow": "{argument name=\"shadow\" default=\"아래쪽에 옅고 부드러운 그림자\"}",
    "reflection": "{argument name=\"reflection\" default=\"없음\"}"
  },
  "lighting": {
    "key_light": "{argument name=\"key light\" default=\"정면의 부드러운 조명\"}",
    "fill_light": "{argument name=\"fill light\" default=\"양쪽에서 고르게 들어오는 부드러운 보조광\"}"
  },
  "text_overlay": {
    "enabled": "{argument name=\"text overlay enabled\" default=\"false\"}",
    "brand": "{argument name=\"overlay brand\" default=\"\"}",
    "selling_point": "{argument name=\"overlay selling point\" default=\"\"}"
  },
  "style": {
    "rendering": "고해상도 상업 사진 + 깔끔한 후반 보정, 장면 요소 없음",
    "consistency": "색상을 실제 제품과 맞추고 질감을 사실적으로 재현"
  },
  "constraints": {
    "must_keep": [
      "깨끗한 흰 배경",
      "제품 하나만 시각 중심으로 배치",
      "라벨 글자를 선명하게 읽을 수 있어야 함"
    ],
    "avoid": [
      "장식 소품 등장",
      "배경에 색상 얼룩이 생김",
      "강한 반사가 제품 자체를 가림",
      "제품 가장자리에 진한 윤곽선"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 제품명, 핵심 시각 특징, 라벨 문구
- 기본값 지정 가능: 촬영 각도, 그림자 방식, 조명 구성
- 무작위 지정 가능: 합리적인 범위 안에서 화면을 차지하는 비율

### 자동 완성 전략

- 구체적인 각도가 없으면 스킨케어 / 음료 / 디지털 제품은 정면 3/4 시점, 신발은 45° 측면, 가방은 정면 눈높이로 설정합니다.
- 라벨 문구가 없으면 브랜드를 지어내지 말고 비워 둡니다.
- 배지가 지정되지 않으면 추가하지 않습니다.

## 변형 1: 여러 각도를 조합한 흰 배경 이미지

📝 프롬프트

```json
{
  "type": "여러 각도 흰 배경 제품 조합 이미지",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"무선 이어폰\"}",
    "angles_count": "{argument name=\"angle count\" default=\"3\"}",
    "angles": [
      "{argument name=\"angle 1\" default=\"충전 케이스를 닫은 정면 모습\"}",
      "{argument name=\"angle 2\" default=\"케이스를 열어 이어폰이 보이는 모습\"}",
      "{argument name=\"angle 3\" default=\"이어폰 하나의 클로즈업\"}"
    ],
    "arrangement": "{argument name=\"arrangement\" default=\"가로로 일정한 간격을 두고 배열\"}"
  },
  "background": {
    "type": "순백색",
    "shadow": "옅은 그림자"
  },
  "constraints": {
    "must_feel": "모든 이미지를 같은 촬영 세션에서 찍은 듯 조명이 일관되어야 함"
  }
}
```

## 변형 2: 흰 배경 + 미니멀 마케팅 레이어

흰 배경 위에 "브랜드 + 장점 하나 + 가격"을 겹쳐야 할 때 적합합니다.

📝 프롬프트

```json
{
  "type": "흰 배경 미니멀 마케팅 대표 이미지",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"운동용 물병\"}"
  },
  "background": "순백색",
  "text_overlay": {
    "enabled": true,
    "brand": "{argument name=\"brand\" default=\"AQUA GO\"}",
    "selling_point": "{argument name=\"selling point\" default=\"24시간 보온\"}",
    "price": "{argument name=\"price\" default=\"¥89\"}",
    "badge": "{argument name=\"badge\" default=\"신상품 출시\"}",
    "layout": "브랜드는 왼쪽 위, 장점은 오른쪽 위, 가격은 오른쪽 아래, 배지는 왼쪽 아래"
  },
  "constraints": {
    "must_feel": "전자상거래 플랫폼 SKU 메인 이미지처럼 보임",
    "avoid": "정보 위계가 혼란스러움"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "흰 배경 메인 이미지 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 제품명만 제공하면 각도, 그림자, 화면 점유율을 자동 결정하되 완전한 흰 배경을 엄격히 유지",
  "constraints": {
    "must_feel": "전자상거래 플랫폼에 바로 등록 가능"
  }
}
```

## 피해야 할 사항

- 배경에 회색 테두리, 그라데이션, 질감이 생기지 않게 합니다.
- 보기 좋게 하려고 꽃 / 돌 / 천 같은 소품을 자동으로 추가하지 않습니다.
- 그림자 방향과 조명 방향이 서로 모순되지 않게 합니다.
- 제품이 화면의 40%보다 작지 않게 합니다. 너무 작으면 휑해 보입니다.
- 허용이 명확하지 않은 한 라벨에 존재하지 않는 브랜드명을 만들어 넣지 않습니다.
- `text_overlay`를 명시적으로 켜지 않은 흰 배경 이미지에 스타일화된 텍스트 글꼴을 추가하지 않습니다.
