# 포장 전시 이미지 템플릿

이 문서는 "제품 포장 자체를 시각적 주인공으로 삼는" 전시 이미지를 만들 때 사용합니다.

- 선물 상자 포장 + 내용물
- 단일 제품 외부 상자 + 여러 각도
- 시리즈 제품 포장 모음
- 한정 선물 세트 분해 전시
- 세트 구성품을 꺼내 배치한 장면

`branding-and-packaging/`의 "브랜드 포장 시스템" 템플릿과의 차이:

- 이 템플릿: 단일 제품 / 단일 선물 상자 중심, 바로 사용할 수 있는 제품 이미지에 중점
- branding-and-packaging: 여러 SKU와 규격 페이지가 포함될 수 있는 브랜드 포장 디자인 시스템에 중점

`white-background-product.md`와의 차이:

- 흰 배경 메인 이미지: 제품 단품
- 포장 전시: 상자 + 열어 꺼낸 병 / 카드 / 설명서 / 굿즈

## 적용 범위

- 선물 상자 전시
- 한정 세트 홍보 이미지
- 명절 프로모션 메인 이미지
- 뷰티 세트 / 식품 선물 세트 / 디지털 기기 세트
- 포장 안 구성품 배치 이미지
- 명절 선물 상자 대표 이미지

## 사용 시점

- 사용자가 "선물 상자 / 세트 / 포장 / 언박싱 이미지 / 패키지 대표 이미지"를 언급할 때
- 외부 상자와 내용물을 함께 보여 주길 원할 때
- 포장 디자인 자체를 강조할 때

다음에는 사용하지 마세요.

- 흰 배경 단일 제품 이미지만 필요한 경우(`white-background-product.md` 사용)
- 장면 연출이 필요한 경우(`lifestyle-product-scene.md` 사용)
- 분해도가 필요한 경우(`exploded-view-poster.md` 사용)

## 누락 정보 확인 우선순위

1. 포장 종류: 종이 상자 / 철제 상자 / 나무 상자 / 천 주머니 / 선물 상자 / 단순 상자
2. 내용물: 품목 수와 각 품목
3. 브랜드 이름 / 시리즈 이름
4. 스타일: 고급 미니멀 / 명절 축하 / 가벼운 럭셔리 레트로 / 어린이 귀여움 / 중국풍 동양 스타일
5. 주색 + 보조색
6. 상자를 연 상태로 보여 줄지 여부

## 기본 템플릿: 열린 선물 상자 + 내용물 전시

📖 설명

뚜껑이 열린 선물 상자를 중심에 놓고 내용물은 상자 안 또는 옆에 가지런히 배치합니다. 배경은 같은 색조의 깔끔한 표면으로 구성합니다.

📝 프롬프트

```json
{
  "type": "선물 상자 포장 전시 이미지",
  "goal": "외부 상자 + 내용물 + 브랜드 정보 레이어를 포함해 제품 소개와 명절 분위기를 함께 전달하는 선물 상자 이미지 생성",
  "package": {
    "type": "{argument name=\"package type\" default=\"뚜껑을 연 단단한 종이 선물 상자\"}",
    "shape": "{argument name=\"package shape\" default=\"직사각형\"}",
    "exterior_color": "{argument name=\"exterior color\" default=\"짙은 녹색 + 금박 로고\"}",
    "interior_color": "{argument name=\"interior color\" default=\"미색 벨벳 안감\"}",
    "logo": "{argument name=\"package logo\" default=\"금색 브랜드 워드마크\"}",
    "ribbon": "{argument name=\"ribbon\" default=\"짙은 녹색 리본\"}"
  },
  "contents": {
    "count": "{argument name=\"content count\" default=\"4\"}",
    "items": [
      "{argument name=\"content item 1\" default=\"주력 제품 유리병\"}",
      "{argument name=\"content item 2\" default=\"샘플 소포장 2개\"}",
      "{argument name=\"content item 3\" default=\"브랜드 카드 + 사용 설명서\"}",
      "{argument name=\"content item 4\" default=\"금속 스푼 / 액세서리\"}"
    ],
    "arrangement": "{argument name=\"content arrangement\" default=\"내용물은 상자 안에 대칭으로 배치하고 주력 제품은 약간 앞쪽으로 빼서 강조\"}"
  },
  "scene": {
    "background_surface": "{argument name=\"background surface\" default=\"미색 무광 석재 표면\"}",
    "background_color_tone": "{argument name=\"background tone\" default=\"미색 + 짙은 녹색 포인트\"}",
    "extra_decorations": [
      "{argument name=\"deco 1\" default=\"흩어진 작은 식물 잎\"}",
      "{argument name=\"deco 2\" default=\"없음\"}"
    ]
  },
  "lighting": {
    "key_light": "{argument name=\"key light\" default=\"45° 상단 부드러운 조명\"}",
    "fill_light": "{argument name=\"fill light\" default=\"고르게 분포된 주변 보조광\"}"
  },
  "text_overlay": {
    "enabled": "{argument name=\"text overlay enabled\" default=\"true\"}",
    "brand": "{argument name=\"brand name\" default=\"NORINE\"}",
    "headline": "{argument name=\"headline\" default=\"소중한 날을 위한 선물\"}",
    "subline": "{argument name=\"subline\" default=\"Limited Edition · 2026 Holiday\"}",
    "position": "화면 왼쪽 위 또는 오른쪽 위, 간결한 레이아웃"
  },
  "style": {
    "rendering": "내용물의 질감과 포장 소재가 선명하게 보이는 고해상도 상업 제품 사진",
    "consistency": "팔레트와 재질을 통일하고 화면은 절제되고 깔끔하게 유지"
  },
  "constraints": {
    "must_keep": [
      "외부 상자 모양과 로고를 알아볼 수 있음",
      "내용물을 선명하게 구분하고 셀 수 있음",
      "상자 뚜껑이 자연스러운 각도로 열림",
      "문구가 주제와 경쟁하지 않음"
    ],
    "avoid": [
      "내용물이 겹쳐 구분하기 어려움",
      "상자 형태가 불규칙함",
      "조명 때문에 금박 로고가 완전히 사라짐",
      "인물 / 모델 / 손 등장"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 포장 유형, 내용물 구성, 브랜드 이름, 주색
- 기본값 지정 가능: 리본, 안감 색, 장식
- 무작위 지정 가능: 팔레트 안에서 선택하는 작은 장식품

### 자동 완성 전략

- 뷰티 선물 세트 기본값: 미색 안감 + 금색 로고 + 유리병 주력 제품
- 명절 식품 선물 세트 기본값: 나무 상자 또는 크라프트지 + 빨간 리본 + 다양한 소포장 내용물
- 디지털 제품 선물 세트 기본값: 검정 하드 케이스 + 회색 폼 안감 + 본체 + 액세서리
- 슬로건은 기본적으로 "Limited Edition / Holiday / Anniversary" 형식의 마무리 문구

## 변형 1: 명절 축하 선물 상자

📝 프롬프트

```json
{
  "type": "명절 축하 선물 상자 전시 이미지",
  "package": {
    "type": "뚜껑을 연 단단한 종이 선물 상자",
    "exterior_color": "{argument name=\"exterior color\" default=\"중국식 빨강 + 금박\"}",
    "interior_color": "금색 벨벳 안감",
    "ribbon": "금색 리본 매듭"
  },
  "contents": {
    "items": [
      "{argument name=\"content 1\" default=\"빨간 선물 봉투 2개\"}",
      "{argument name=\"content 2\" default=\"대표 선물(식품 / 차 / 공예품)\"}",
      "{argument name=\"content 3\" default=\"축하 카드\"}"
    ]
  },
  "scene": {
    "background_surface": "금색 광택 표면 또는 짙은 빨간 벨벳",
    "extra_decorations": ["흩어진 작은 금색 조각", "매화 가지 장식"]
  },
  "constraints": {
    "must_feel": "격조 있는 명절 분위기, 동양적인 축하 느낌"
  }
}
```

## 변형 2: 미니멀한 가벼운 럭셔리 선물 상자

📝 프롬프트

```json
{
  "type": "미니멀 럭셔리 선물 상자 전시 이미지",
  "package": {
    "type": "무광 하드 페이퍼 선물 상자",
    "exterior_color": "미색 + 가는 회색 선",
    "interior_color": "짙은 회색 벨벳",
    "logo": "엠보싱 브랜드 글자 + 아주 작은 금박"
  },
  "contents": {
    "items": [
      "{argument name=\"content 1\" default=\"주력 유리병\"}",
      "{argument name=\"content 2\" default=\"액세서리 / 설명 카드\"}"
    ]
  },
  "scene": {
    "background_surface": "따뜻한 회색 무광 석판",
    "extra_decorations": []
  },
  "constraints": {
    "must_feel": "절제되고 품격 있는 분위기"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "포장 전시 이미지 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자는 제품 종류와 브랜드만 제시합니다. 포장 유형, 내용물 구성, 색상, 장식을 자동 선택하되 포장을 시각적 중심으로 유지합니다.",
  "constraints": {
    "must_feel": "브랜드 공식 웹사이트 또는 전자상거래 히어로 이미지로 바로 사용 가능"
  }
}
```

## 피해야 할 사항

- 내용물이 6개를 넘으면 복잡해지므로 3~5개 권장
- 내용물을 전부 상자 안에 넣지 말고 최소 하나는 반쯤 보이거나 앞쪽에 배치
- 반사가 강한 금속 표면을 배경으로 사용하지 않음(금박 로고가 보이지 않을 수 있음)
- 브랜드와 무관한 다른 로고를 이미지에 넣지 않음
- 선물 상자를 저렴한 "택배 상자를 뜯은" 느낌으로 표현하지 않음
- 채도가 지나치게 높은 배경색으로 상자 색이 왜곡되지 않도록 함
