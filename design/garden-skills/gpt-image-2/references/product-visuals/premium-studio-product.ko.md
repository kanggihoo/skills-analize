# 고급 스튜디오 제품 이미지 템플릿

이 문서는 "최상급 스튜디오 상업 제품 사진"을 만들 때 사용합니다.

- 잡지 광고 수준의 질감
- 드라마틱한 조명
- 통일된 색상 방향
- 소품 절제
- 제품이 이야기의 유일한 주인공

적합한 제품:

- 향수 / 고급 화장품
- 고급 시계 / 주얼리
- 증류주 / 와인
- 럭셔리 액세서리
- 고급 3C / 오디오·영상 장비
- 미슐랭 레스토랑 메인 이미지

`white-background-product.md`와의 차이:

- 흰 배경 제품 이미지: 전자상거래 플랫폼 메인 이미지, 깔끔하고 실제 제품의 외형을 충실히 표현
- 스튜디오 이미지: 광고 수준의 비주얼, 분위기 / 드라마틱한 연출 / 브랜드 격조 강조

`lifestyle-product-scene.md`와의 차이:

- 스튜디오 이미지: 제품 + 분위기만 사용, 인물이나 생활 장면 없음
- 라이프스타일 이미지: 실제 사용 장면 속에 제품 배치

## 적용 범위

- 고급 브랜드 공식 웹사이트 첫 화면 이미지
- 잡지 한 페이지 광고
- 인쇄 광고 대표 비주얼
- 단일 제품 출시 대표 이미지

## 사용 시점

- 사용자가 "스튜디오 / 상업 광고 / 잡지 / 고급스러운 느낌 / 화보 느낌 / cinematic / studio"를 언급할 때
- 제품이 "비싸 보이길" 원할 때
- 흰 배경은 피하고 싶지만 일상 장면은 원하지 않을 때

다음에는 사용하지 마세요.

- 전자상거래 플랫폼 메인 이미지(`white-background-product.md` 사용)
- 생활 속에 있는 제품 이미지(`lifestyle-product-scene.md` 사용)
- 포장 구조 / 선물 상자 전시(`packaging-showcase.md` 사용)

## 누락 정보 확인 우선순위

1. 구체적인 제품 + 카테고리
2. 브랜드 포지셔닝(고급 / 미니멀 / 레트로 / 다크 / 자연 유기 / 미래적)
3. 색상 방향 + 주색 + 보조색
4. 조명 분위기(부드러움 / 드라마틱 / 차가움 / 따뜻함 / 상단 투과광)
5. 소품을 약간 넣을지 여부(같은 색조로 제한)
6. 메인 슬로건 / 브랜드 로고가 필요한지 여부

## 기본 템플릿: 고급 스튜디오 단일 제품 비주얼

📖 설명

제품을 화면 중앙 또는 황금 비율 위치에 배치합니다. 어두운 배경 또는 제품과 같은 색조의 배경, 드라마틱한 주요 조명, 최소한의 소품을 사용하고 브랜드명 + 슬로건 한 줄을 겹쳐 넣을 수 있습니다.

📝 프롬프트

```json
{
  "type": "고급 스튜디오 상업 제품 이미지",
  "goal": "제품을 유일한 이야기의 중심으로 삼고 분위기와 색조를 절제한, 광고 단일 페이지 메인 이미지로 바로 쓸 수 있는 스튜디오 비주얼 생성",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"고급 향수 유리병\"}",
    "visual_description": "{argument name=\"product visual\" default=\"두꺼운 호박색 유리병, 금색 금속 뚜껑, 병에 간결한 검은색 브랜드명이 인쇄됨\"}",
    "position": "{argument name=\"product position\" default=\"화면 중앙에서 약간 오른쪽\"}",
    "scale": "{argument name=\"product scale\" default=\"화면의 45% 차지\"}"
  },
  "background": {
    "type": "{argument name=\"background type\" default=\"짙은 갈색 벨벳 천 + 같은 색조의 주변\"}",
    "texture": "{argument name=\"background texture\" default=\"미세한 벨벳 질감\"}",
    "color_tone": "{argument name=\"color tone\" default=\"따뜻한 갈색 + 금색\"}"
  },
  "lighting": {
    "key_light": "{argument name=\"key light\" default=\"모양이 뚜렷한 45° 상단 드라마틱 조명\"}",
    "fill_light": "{argument name=\"fill light\" default=\"오른쪽의 약한 부드러운 빛\"}",
    "rim_light": "{argument name=\"rim light\" default=\"뒤에서 비추는 금색 윤곽광으로 병의 외곽 강조\"}",
    "mood": "{argument name=\"lighting mood\" default=\"따뜻하고 고급스러우며 해질녘 같은 분위기\"}"
  },
  "props": {
    "enabled": "{argument name=\"props enabled\" default=\"true\"}",
    "items": [
      "{argument name=\"prop 1\" default=\"흩어진 말린 장미 꽃잎 몇 장\"}",
      "{argument name=\"prop 2\" default=\"부분적으로 보이는 금색 금속 반사 스트립\"}"
    ],
    "rule": "소품은 최대 2개, 제품 주색과 일치하는 색상만 사용"
  },
  "text_overlay": {
    "enabled": "{argument name=\"text overlay enabled\" default=\"true\"}",
    "brand": "{argument name=\"brand name\" default=\"NUIT D'OR\"}",
    "headline": "{argument name=\"headline\" default=\"밤은 또 하나의 빛\"}",
    "position": "{argument name=\"text position\" default=\"화면 왼쪽 위쪽, 여백을 충분히 확보\"}"
  },
  "style": {
    "rendering": "최상급 상업 사진 + 높은 다이내믹 레인지 + 미세한 입자감, 잡지 한 페이지 광고처럼 표현",
    "depth": "얕은 피사계 심도, 배경은 약하게 흐림",
    "consistency": "색상 팔레트를 엄격하게 통일하고 선명한 추가 색상은 사용하지 않음"
  },
  "constraints": {
    "must_keep": [
      "제품이 절대적인 주인공",
      "조명 방향이 일관됨",
      "색조가 통일되고 산만하지 않음",
      "문구가 제품 자체를 가리지 않음"
    ],
    "avoid": [
      "소품이 주인공을 압도함",
      "생활 장면 요소(손, 식기, 모델)가 등장함",
      "글꼴 종류가 지나치게 많음",
      "배경색이 제품과 지나치게 비슷해 외곽을 알아보기 어려움"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 제품, 브랜드 포지셔닝, 주색 방향
- 기본값 지정 가능: 소품, 문구 위치, 조명 방향
- 무작위 지정 가능: 주색 범위 안에서 고르는 소품 구체 항목

### 자동 완성 전략

- 향수 / 증류주 기본값: 어두운 색조 + 상단 주요 조명
- 화장품 기본값: 부드러운 크림색 조 + 정면 소프트박스 조명
- 주얼리 기본값: 어두운 배경 + 윤곽을 강조하는 강한 가장자리 빛
- 디지털 제품 기본값: 딥 스페이스 배경 + 푸른 차가운 조명
- 문구 기본값: 8자 이하 한 문장, 긴 슬로건은 피함

## 변형 1: 다크 럭셔리 제품(주얼리 / 시계)

📝 프롬프트

```json
{
  "type": "다크 럭셔리 스튜디오 비주얼",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"금색 기계식 시계\"}",
    "visual_description": "{argument name=\"product visual\" default=\"둥근 금색 케이스, 갈색 악어가죽 밴드, 선명한 시계판\"}"
  },
  "background": {
    "type": "거의 반사가 없는 짙은 검정 평면",
    "color_tone": "거의 검정 + 국소적인 금색"
  },
  "lighting": {
    "key_light": "상단 스포트라이트",
    "rim_light": "케이스 윤곽을 강조하는 금속 가장자리 빛"
  },
  "constraints": {
    "must_feel": "희소성, 절제, 의식적인 분위기"
  }
}
```

## 변형 2: 차가운 디지털 / 오디오·영상 제품

📝 프롬프트

```json
{
  "type": "차가운 색조의 디지털 제품 스튜디오 비주얼",
  "subject": {
    "product_name": "{argument name=\"product name\" default=\"무선 스마트 스피커\"}",
    "visual_description": "{argument name=\"product visual\" default=\"상단 터치 링에 파란 빛이 도는 원통형 딥 스페이스 그레이 금속 외장\"}"
  },
  "background": {
    "type": "딥 스페이스 그레이 그라데이션",
    "color_tone": "회색 + 차가운 파랑"
  },
  "lighting": {
    "key_light": "정면 소프트박스 조명",
    "rim_light": "기술적인 분위기를 위한 파란색 역광"
  },
  "props": {
    "enabled": false
  },
  "constraints": {
    "must_feel": "고급스럽고 절제되며 미래적인 분위기"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "고급 스튜디오 비주얼 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "제품 카테고리에 따라 배경 색조, 조명 방향, 문구 길이를 자동 선택하되 제품을 유일한 이야기의 중심으로 유지",
  "constraints": {
    "must_feel": "잡지 광고 수준"
  }
}
```

## 피해야 할 사항

- 소품을 2개 넘게 넣지 않습니다.
- 인물이나 신체 일부(손 / 입술 / 손톱)를 등장시키지 않습니다.
- 차가운 색과 따뜻한 색을 섞지 않습니다(브랜드 방향에서 명확히 허용하는 경우 제외).
- 제품 반사가 지나쳐 브랜드 글자를 읽을 수 없게 하지 않습니다.
- 흰 배경 이미지 스타일을 그대로 가져오지 않습니다(분위기가 없으면 고급스럽지 않음).
- 글자가 브랜드의 절제된 인상을 해치지 않게 합니다(슬로건은 짧고 간결하게).
