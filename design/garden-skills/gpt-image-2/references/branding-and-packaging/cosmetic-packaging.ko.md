# 화장품 / 스킨케어 패키지 템플릿

이 파일은 “화장품 / 스킨케어 용기의 병, 상자, 세트” 패키지 디자인 비주얼을 위한 템플릿입니다.

- 스킨케어 제품 단일 용기 패키지 디자인
- 화장품 라인 세트 패키지
- 선물 세트 패키지
- 패키지를 포함한 뷰티 전자상거래 대표 이미지

특징:

- 용기 형태 + 라벨 + 재질을 강조
- 재질의 느낌(유리 / 무광 유리 / 금속 뚜껑)을 강조
- 보통 브랜드명 + 제품명 + 용량 포함
- 절제된 색상과 고급스러운 분위기
- 단일 제품 또는 제품군을 보여줌

## 적용 범위

- 스킨케어 / 화장품 패키지 디자인
- 뷰티 선물 세트
- 뷰티 전자상거래 대표 이미지

## 사용 시점

- 사용자가 “스킨케어 / 화장품 / 패키지 디자인 / 병”을 언급할 때
- 제품 패키지 비주얼을 원할 때

사용하지 말 것:

- 식품 / 음료 라벨 (`beverage-label-design.md` 사용)
- 선물 상자 사진 (`product-visuals/packaging-showcase.md` 사용)
- 흰 배경의 단일 제품 사진 (`product-visuals/white-background-product.md` 사용)

## 정보가 부족할 때 먼저 물어볼 순서

1. 브랜드명 + 스타일 포지셔닝 (고급 / 미니멀 / 문예적 / Y2K)
2. 제품 유형 (세럼 / 크림 / 클렌저 / 향수)
3. 용기 재질 (유리 / 무광 유리 / PETG / 세라믹)
4. 주조색 1–2개
5. 단품 / 세트
6. 용량

## 기본 템플릿: 단일 스킨케어 세럼 패키지 디자인

📖 설명

이미지 한 장에서 스킨케어 세럼 병 하나와 외부 상자를 중심에 배치하고, 배경은 간결하게 구성합니다.

📝 프롬프트

```json
{
  "type": "스킨케어 세럼 단품 패키지 디자인",
  "goal": "제품 출시 대표 이미지 / 패키지 제안서 / 전자상거래 대표 이미지로 사용할 수 있는 화장품 패키지 비주얼 생성",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"LUMEN\"}",
    "positioning": "{argument name=\"positioning\" default=\"과학적 스킨케어 + 미니멀\"}"
  },
  "product": {
    "name": "{argument name=\"product name\" default=\"광자 리페어 세럼\"}",
    "subtitle": "{argument name=\"product subtitle\" default=\"PHOTON REPAIR SERUM\"}",
    "volume": "{argument name=\"volume\" default=\"30ml\"}",
    "form": "{argument name=\"bottle form\" default=\"원통형 유리병 + 스포이트\"}",
    "key_ingredient": "{argument name=\"ingredient\" default=\"나이아신아마이드 5%\"}"
  },
  "design": {
    "bottle_material": "{argument name=\"bottle material\" default=\"반투명 무광 유리\"}",
    "label_material": "{argument name=\"label material\" default=\"무광 점착 라벨 + 은박 글자\"}",
    "primary_color": "{argument name=\"primary color\" default=\"#0F4C81 짙은 파랑\"}",
    "accent_color": "{argument name=\"accent color\" default=\"무광 은색\"}",
    "typography": "{argument name=\"typography\" default=\"현대적인 산세리프 + 작은 한국어 글씨\"}"
  },
  "outer_box": {
    "enabled": "{argument name=\"outer box\" default=\"true\"}",
    "shape": "{argument name=\"box shape\" default=\"정육면체 형태의 단단한 종이 상자\"}",
    "finish": "{argument name=\"box finish\" default=\"무광 종이 + 은박 로고\"}"
  },
  "scene": {
    "background": "{argument name=\"background\" default=\"미색 실크 + 부드러운 빛\"}",
    "props": "{argument name=\"props\" default=\"투명한 아크릴 판 한 장 + 물방울 몇 개\"}",
    "lighting": "{argument name=\"lighting\" default=\"고급스러운 부드러운 빛 + 위쪽 주광\"}"
  },
  "format": {
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"4:5\"}",
    "composition": "병을 중앙에서 약간 오른쪽에 배치 + 외부 상자는 뒤쪽에 배치"
  },
  "constraints": {
    "must_keep": [
      "병 재질이 사실적으로 표현됨 (유리에 반사와 굴절이 있어야 함)",
      "라벨 글자가 선명하게 읽힘",
      "전체 색상은 최대 3개",
      "고급스럽고 절제된 느낌"
    ],
    "avoid": [
      "라벨 글꼴을 2종 초과해 사용",
      "배경이 너무 밝아 제품을 압도",
      "병 비율 왜곡",
      "의도한 경우가 아니라면 저렴한 플라스틱 느낌"
    ]
  }
}
```

### 매개변수 전략

- 반드시 물을 것: 브랜드명, 제품 유형, 용기 형태
- 기본값 사용 가능: 재질, 색상, 외부 상자, 장면
- 무작위로 정해도 됨: 소품의 세부 사항

### 자동 보완 전략

- 사용자가 브랜드 포지셔닝 + 제품 유형을 알려주면 용기 / 라벨 / 색상 / 장면을 자동으로 구성
- 고급 = 검정과 금색 / 미니멀 = 흰색과 파랑 / 문예적 = 미색과 원목 / Y2K = 고채도 색상
- 기본 세로 비율은 4:5

## 변형 1: 화장품 라인 세트

📝 프롬프트

```json
{
  "type": "화장품 라인 세트",
  "product": {
    "form": "5종 세트 (클렌저 + 토너 + 세럼 + 크림 + 자외선 차단제)"
  },
  "design": {
    "consistency_rule": "5종 패키지가 동일한 시스템을 엄격히 따름: 같은 용기 비율 + 같은 글꼴 + 같은 색상"
  },
  "scene": {
    "composition": "5개 제품을 높이 순으로 세워 중앙에 배치"
  },
  "constraints": {
    "must_feel": "세트다운 완성도 + 제품 라인 인지성"
  }
}
```

## 변형 2: 선물 세트

📝 프롬프트

```json
{
  "type": "화장품 선물 세트",
  "outer_box": {
    "enabled": true,
    "shape": "길고 납작한 직사각형 선물 상자 (반쯤 열린 상태)",
    "finish": "벨벳 포장 + 금박 로고 + 리본"
  },
  "scene": {
    "background": "어두운 배경 + 스포트라이트"
  },
  "constraints": {
    "must_feel": "축제 / 선물용 품격"
  }
}
```

## 변형 3: 자동 보완 모드

📝 프롬프트

```json
{
  "type": "화장품 패키지 자동 보완",
  "mode": "auto-fill",
  "rule": "사용자가 브랜드 + 제품 유형 + 스타일 포지셔닝을 알려주면 용기 / 라벨 / 외부 상자 / 장면을 자동으로 결정",
  "constraints": {
    "must_feel": "제품 출시 행사에 바로 공개할 수 있어야 함"
  }
}
```

## 피할 것

- 제품명과 용량의 글자 크기 차이를 지나치게 크게 하지 말 것
- 라벨 글꼴을 2종 넘게 사용하지 말 것
- 병 비율을 왜곡하지 말 것
- 배경이 너무 밝아 제품을 압도하지 않게 할 것
- 브랜드 로고를 눈에 띄지 않는 위치에 두지 말 것
- 고급 포지셔닝 제품에 저렴해 보이는 재질을 사용하지 말 것
