# 레시피 / 단계별 절차 이미지 템플릿

이 문서는 "절차를 단계별 그림으로 보여 주는" 시각물을 만들 때 사용합니다.

- 레시피 / 요리 단계 이미지
- 제품 사용 단계 이미지
- DIY 튜토리얼 단계 이미지
- 수공예 / 메이크업 단계 이미지
- 제조 공정도

특징:

- 단계가 분명하게 구분됨(번호 + 설명 + 일러스트)
- 흐름이 명확함(→ 또는 번호 순서)
- "이미지 하나를 보고 따라 할 수 있음"을 강조
- 보통 재료 / 도구 목록을 포함
- 시각적으로 명확하고 정보 밀도는 중간 정도

## 적용 범위

- 레시피 / 베이킹 단계 이미지
- 제품 사용 / 설치 튜토리얼 이미지
- 공예 / DIY 튜토리얼 이미지
- 메이크업 / 스킨케어 단계 이미지

## 사용 시점

- 사용자가 "단계 이미지 / 순서도 / 레시피 그림 / 튜토리얼 이미지 / how-to"를 언급할 때
- "그림을 보며 그대로 따라 하고 싶다"고 할 때

다음에는 사용하지 마세요.

- 교육용 도식(`slides-and-visual-docs/educational-diagram-slide.md` 사용)
- 고밀도 인포그래픽(`infographics/legend-heavy-infographic.md` 사용)
- 캐릭터 관계도(`character-relationship-diagram.md` 사용)

## 누락 정보 확인 우선순위

1. 주제(어떤 레시피 / 어떤 튜토리얼)
2. 단계 수(4~8개)
3. 재료 / 도구 목록이 필요한지 여부
4. 스타일: 손그림 수채화 / 실물 같은 3D / 평면 카툰 / 실사 사진
5. 이중 언어 / 영어 텍스트가 필요한지 여부
6. 비율

## 기본 템플릿: 레시피 단계 이미지

📖 설명

이미지 한 장의 상단에 요리 이름 + 재료 목록, 중앙에 번호가 붙은 단계 일러스트 4~6개, 하단에 완성 요리를 크게 배치합니다.

📝 프롬프트

```json
{
  "type": "레시피 단계 이미지",
  "goal": "공식 계정 / 샤오홍슈 / 요리책 페이지에 사용할 수 있는 레시피 단계 이미지 생성",
  "recipe": {
    "name": "{argument name=\"recipe name\" default=\"토마토 달걀 볶음\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"5분 가정식 버전\"}",
    "servings": "{argument name=\"servings\" default=\"2인분\"}",
    "time": "{argument name=\"time\" default=\"5분\"}"
  },
  "ingredients": {
    "enabled": "{argument name=\"ingredients enabled\" default=\"true\"}",
    "position": "{argument name=\"ingredients position\" default=\"오른쪽 위\"}",
    "items": [
      "{argument name=\"ing 1\" default=\"토마토 2개\"}",
      "{argument name=\"ing 2\" default=\"달걀 3개\"}",
      "{argument name=\"ing 3\" default=\"다진 파 약간\"}",
      "{argument name=\"ing 4\" default=\"소금 / 설탕 / 기름 약간\"}"
    ],
    "design": "각 재료 옆에 작은 아이콘 추가"
  },
  "steps": {
    "count": "{argument name=\"step count\" default=\"5\"}",
    "items": [
      {"id": 1, "scene": "{argument name=\"step 1\" default=\"토마토를 썰고 달걀을 풀어 둠\"}"},
      {"id": 2, "scene": "{argument name=\"step 2\" default=\"기름을 달군 뒤 달걀을 넣어 반쯤 익을 때까지 볶아 꺼냄\"}"},
      {"id": 3, "scene": "{argument name=\"step 3\" default=\"기름을 조금 더 두르고 토마토를 넣어 즙이 나올 때까지 볶음\"}"},
      {"id": 4, "scene": "{argument name=\"step 4\" default=\"달걀을 다시 넣고 소금과 설탕을 조금 넣음\"}"},
      {"id": 5, "scene": "{argument name=\"step 5\" default=\"고르게 볶고 다진 파를 뿌려 완성\"}"}
    ],
    "step_block_style": "번호 + 일러스트 + 설명 한 문장"
  },
  "final_dish": {
    "enabled": "{argument name=\"final dish enabled\" default=\"true\"}",
    "position": "{argument name=\"final dish position\" default=\"하단 중앙의 큰 이미지\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"베이지 종이 질감의 손그림 수채화\"}",
    "color_palette": "{argument name=\"color palette\" default=\"토마토 빨강 + 달걀 노랑 + 미색\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "단계 번호가 연속되고 명확함",
      "각 단계 일러스트가 설명과 일치",
      "재료 목록이 단계 설명과 연결됨",
      "완성 요리 이미지가 눈에 띔"
    ],
    "avoid": [
      "단계 설명이 15자를 넘음",
      "일러스트가 텍스트 설명과 맞지 않음",
      "팔레트에 음식과 관련 없는 색이 포함됨",
      "글꼴 종류가 지나치게 많음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 요리 이름, 단계 수
- 기본값 지정 가능: 스타일, 색상 팔레트, 재료 표시 방식
- 무작위 지정 가능: 배경 질감

### 자동 완성 전략

- 사용자가 요리 이름만 주면 재료 목록과 단계 4~6개를 자동 작성합니다.
- 기본 스타일은 손그림 수채화입니다.
- 단계 설명은 단계당 15자 이하로 제한합니다.

## 변형 1: 제품 사용 / 설치 튜토리얼 이미지

📝 프롬프트

```json
{
  "type": "제품 사용 / 설치 튜토리얼 이미지",
  "recipe": {
    "name": "{argument name=\"product\" default=\"AURORA Pro 이어폰 페어링\"}"
  },
  "ingredients": { "enabled": false },
  "steps": {
    "count": 4,
    "items": [
      {"id": 1, "scene": "충전 케이스 열기"},
      {"id": 2, "scene": "휴대전화 블루투스 켜기"},
      {"id": 3, "scene": "'AURORA Pro' 선택"},
      {"id": 4, "scene": "알림음이 들리면 페어링 완료"}
    ]
  },
  "final_dish": { "enabled": false },
  "style": {
    "art_style": "브랜드 색상을 사용하는 평면 벡터 스타일"
  },
  "constraints": {
    "must_feel": "사용 설명서 수준으로 명확함"
  }
}
```

## 변형 2: 메이크업 / 스킨케어 단계 이미지

📝 프롬프트

```json
{
  "type": "메이크업 / 스킨케어 단계 이미지",
  "recipe": {
    "name": "{argument name=\"routine\" default=\"아침 스킨케어 5단계\"}"
  },
  "steps": {
    "count": 5,
    "items": [
      {"id": 1, "scene": "세안"},
      {"id": 2, "scene": "토너"},
      {"id": 3, "scene": "에센스"},
      {"id": 4, "scene": "크림"},
      {"id": 5, "scene": "자외선 차단제"}
    ]
  },
  "style": {
    "art_style": "부드러운 분홍색의 미니멀 일러스트"
  },
  "constraints": {
    "must_feel": "깔끔하고 여성 취향에 맞으며 공유하기 좋음"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "절차도 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 주제를 주면 단계 수, 재료 / 도구, 스타일, 색상을 자동 결정",
  "constraints": {
    "must_feel": "공식 계정 / 샤오홍슈에 바로 게시할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 단계가 8개를 넘으면 집중이 끊길 수 있습니다.
- 한 단계 설명을 15자 넘게 쓰지 않습니다.
- 일러스트가 설명과 다르지 않게 합니다.
- 색상 팔레트가 주제와 어긋나지 않게 합니다(음식 이미지에 형광 파랑을 쓰지 않음).
- 번호를 빠뜨리거나 단계를 생략하지 않습니다.
- 재료 목록이 주인공을 압도하지 않게 합니다.
