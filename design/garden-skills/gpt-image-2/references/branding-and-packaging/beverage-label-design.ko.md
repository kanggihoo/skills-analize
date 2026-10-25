# 음료 / 식품 라벨 디자인 템플릿

이 파일은 “음료병 / 식품 캔 / 조미료 병 등의 라벨 + 패키지 디자인” 비주얼을 위한 템플릿입니다.

- 음료병 라벨 디자인
- 식품 캔 라벨
- 조미료 병 라벨
- 중국풍 / 일본풍 / 서양풍 등 다양한 스타일
- 제품 단독 사진 + 라벨 디자인 혼합

특징:

- 라벨 정보(브랜드명 + 제품명 + 용량 + 영양 표시)를 강조
- 라벨 글꼴과 조판을 세심하게 구성
- 일러스트 / 그래픽 요소를 포함하는 경우가 많음
- 패키지를 주변 환경과 함께 촬영
- 제품의 성격(건강 / 고급 / 복고 / 중국풍 트렌드)을 강조

## 적용 범위

- 음료 / 식품 라벨 디자인
- 조미료 패키지
- 중국풍 트렌드 / 복고풍 음료

## 사용 시점

- 사용자가 “음료 / 식품 / 라벨 디자인 / 캔 제품 / 병 제품”을 언급할 때
- “패키지 + 라벨”을 포함한 완성된 디자인을 원할 때

사용하지 말 것:

- 화장품 패키지 (`cosmetic-packaging.md` 사용)
- 선물 상자 사진 (`product-visuals/packaging-showcase.md` 사용)
- 일반 브랜드 보드 (`brand-identity-board.md` 사용)

## 정보가 부족할 때 먼저 물어볼 순서

1. 브랜드명 + 제품군 (차 / 커피 / 주스 / 조미료)
2. 스타일 분위기 (중국풍 트렌드 / 일본풍 / 현대 서양풍 / 복고)
3. 병 / 캔의 형태
4. 주조색 1–2개
5. 일러스트 / 그래픽 필요 여부
6. 영양 표시 / 경고 문구 필요 여부

## 기본 템플릿: 중국풍 트렌드 음료 라벨 디자인

📖 설명

이미지 한 장에 음료병 하나와 라벨 디자인을 중심으로 배치하고, 배경에는 동양적 분위기의 장면을 둡니다.

📝 프롬프트

```json
{
  "type": "중국풍 트렌드 음료병 라벨 디자인",
  "goal": "제품 출시 이미지 / 전자상거래 대표 이미지로 사용할 수 있는 음료병 + 라벨 비주얼 생성",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"동풍 다사\"}",
    "positioning": "{argument name=\"positioning\" default=\"중국풍 트렌드 + 현대적\"}",
    "product_name": "{argument name=\"product name\" default=\"맑은 아침 우롱\"}",
    "product_subtitle": "{argument name=\"product subtitle\" default=\"OOLONG MORNING\"}",
    "volume": "{argument name=\"volume\" default=\"330ml\"}"
  },
  "bottle": {
    "form": "{argument name=\"bottle form\" default=\"짧고 통통한 유리병 + 금속 뚜껑\"}",
    "material": "{argument name=\"material\" default=\"투명 유리 + 안에 차가 보임\"}"
  },
  "label_design": {
    "style": "{argument name=\"label style\" default=\"수묵화 + 공필화 + 여백\"}",
    "primary_color": "{argument name=\"primary color\" default=\"먹색 녹색 + 금색\"}",
    "background_color": "{argument name=\"label bg\" default=\"미색\"}",
    "illustration": "{argument name=\"illustration\" default=\"공필화 기법의 차밭 산 + 먼 산\"}",
    "typography": "{argument name=\"typography\" default=\"제목은 명조체 + 영어 산세리프\"}",
    "info_strip_bottom": "영양 성분 + 용량 + 원재료 표기 (작은 글씨)"
  },
  "scene": {
    "background": "{argument name=\"background\" default=\"대나무 돗자리 + 찻잔 + 녹색 잎 한 장\"}",
    "lighting": "{argument name=\"lighting\" default=\"자연스럽고 부드러운 빛\"}"
  },
  "format": {
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"4:5\"}",
    "composition": "병을 중앙에 두고 살짝 기울임 + 라벨이 카메라를 향해 선명하게 보임"
  },
  "constraints": {
    "must_keep": [
      "라벨 스타일을 일관되게 유지 (수묵화 + 미국 만화 스타일 혼합 금지)",
      "라벨 글꼴은 최대 2종",
      "영양 표시 / 원재료 표의 작은 글씨는 읽을 수 있되 시선을 빼앗지 않음",
      "병 재질이 사실적으로 보여야 함"
    ],
    "avoid": [
      "라벨 디자인을 지나치게 빽빽하게 구성",
      "일러스트 스타일과 문자 스타일이 서로 충돌",
      "바탕색이 너무 밝아 일러스트를 압도",
      "오탈자"
    ]
  }
}
```

### 매개변수 전략

- 반드시 물을 것: 브랜드명, 제품군, 스타일
- 기본값 사용 가능: 병 모양, 라벨, 장면
- 무작위로 정해도 됨: 소품의 세부 사항

### 자동 보완 전략

- 사용자가 “중국풍 트렌드 / 일본풍 / 현대 서양풍 / 복고” 스타일을 선택하면 라벨 일러스트 + 색상 + 글꼴을 자동으로 결정
- 기본 세로 비율은 4:5
- 작은 글씨의 영양 표시를 기본으로 포함

## 변형 1: 일본 공예풍 조미료 병

📝 프롬프트

```json
{
  "type": "일본 공예풍 조미료 병",
  "brand": {
    "product_name": "{argument name=\"product\" default=\"마루다이즈 간장\"}"
  },
  "bottle": {
    "form": "복고풍 작은 병 + 나무 마개"
  },
  "label_design": {
    "style": "일본 공예 + 손글씨 서예 + 미색 화지",
    "primary_color": "짙은 갈색 + 주홍 인장"
  },
  "scene": {
    "background": "원목 테이블 + 대나무 채반"
  },
  "constraints": {
    "must_feel": "전통 공예의 느낌"
  }
}
```

## 변형 2: 현대 서양풍 주스

📝 프롬프트

```json
{
  "type": "현대 서양풍 주스병",
  "brand": {
    "product_name": "COLD-PRESS ORANGE",
    "volume": "350ml"
  },
  "bottle": {
    "form": "길고 가는 투명 PET 병"
  },
  "label_design": {
    "style": "현대적인 미니멀 + 큰 글자 색면 + 명확한 영양 표시",
    "primary_color": "밝은 오렌지 + 흰색"
  },
  "scene": {
    "background": "흰색 아크릴 받침 + 반으로 자른 오렌지"
  },
  "constraints": {
    "must_feel": "건강함 + 현대적임 + 마트 진열에 적합"
  }
}
```

## 변형 3: 자동 보완 모드

📝 프롬프트

```json
{
  "type": "음료 / 식품 라벨 자동 보완",
  "mode": "auto-fill",
  "rule": "사용자가 브랜드 + 제품군 + 스타일을 알려주면 병 / 라벨 / 일러스트 / 장면을 자동으로 결정",
  "constraints": {
    "must_feel": "인쇄소에 바로 전달할 수 있어야 함"
  }
}
```

## 피할 것

- 스타일을 혼합하지 말 것 (중국풍 트렌드 + 미국 만화 스타일을 한 화면에 배치하지 않음)
- 라벨 글꼴을 2종 넘게 사용하지 말 것
- 목업이 아닌 경우 영양 표시 / 원재료 표를 빼먹지 말 것
- 병의 비율을 왜곡하지 말 것
- 일러스트가 지나치게 두드러져 브랜드명을 알아볼 수 없게 하지 말 것
- 배경색의 채도를 높여 제품을 압도하지 말 것
