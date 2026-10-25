# 그림책 / 동화 장면 일러스트 템플릿

이 문서는 "그림책 / 동화책 / 어린이 콘텐츠" 스타일의 일러스트를 만들 때 사용합니다.

- 동화책 내지 / 표지
- 어린이 콘텐츠 공식 계정 헤더 이미지
- 그림책 스타일 굿즈
- 교육 콘텐츠 삽화
- 명절 카드

특징:

- 부드러운 수채화 / 크레용 / 콜라주 스타일
- 귀엽고 친근한 캐릭터
- 따뜻한 색상
- 정보가 명확하고 이해하기 쉬움
- 이야기의 정취가 느껴짐

## 적용 범위

- 동화책 내지 / 표지
- 교육 콘텐츠 삽화
- 어린이 명절 카드
- 어린이 친화적 브랜드 일러스트

## 사용 시점

- 사용자가 "그림책 / 동화책 / 어린이 / 크레용 스타일 / 수채화 동화책 스타일"을 언급할 때
- 따뜻하고 어린이다우며 이야기가 느껴지는 이미지를 원할 때

다음에는 사용하지 마세요.

- 힐링 일상 장면(`healing-scene.md` 사용)
- 콘셉트 대형 장면(`concept-scene.md` 사용)
- 미니멀 분위기 이미지(`minimalist-mood-scene.md` 사용)

## 누락 정보 확인 우선순위

1. 이야기 / 주제
2. 주인공(어린이 / 동물)
3. 장면
4. 스타일: 수채화 / 크레용 / 콜라주 / 어린이 애니메이션
5. 텍스트 포함 여부
6. 비율

## 기본 템플릿: 동화책 내지 일러스트

📖 설명

동화책 한 페이지 같은 일러스트입니다. 주인공은 귀엽고 친근하게 표현하고, 장면은 부드러운 빛으로 그립니다. 이야기 문장 하나를 포함할 수 있습니다.

📝 프롬프트

```json
{
  "type": "동화책 내지 일러스트",
  "goal": "동화책 내지에 바로 넣을 수 있는 따뜻한 일러스트 생성",
  "story": {
    "theme": "{argument name=\"story theme\" default=\"꼬마 곰의 첫 숲 모험\"}",
    "scene": "{argument name=\"scene\" default=\"아침 안개가 낀 숲길\"}",
    "moment": "{argument name=\"story moment\" default=\"꼬마 곰이 나뭇잎 사이로 들어오는 첫 햇살을 올려다봄\"}"
  },
  "main_character": {
    "description": "{argument name=\"main character\" default=\"작은 천 가방을 멘 동글동글한 꼬마 곰\"}",
    "expression": "{argument name=\"expression\" default=\"호기심 + 미소\"}",
    "pose": "{argument name=\"pose\" default=\"고개를 들어 올려다봄\"}"
  },
  "secondary_characters": {
    "items": [
      "{argument name=\"secondary 1\" default=\"날아가는 작은 새\"}",
      "{argument name=\"secondary 2\" default=\"얼굴을 내미는 토끼\"}"
    ]
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"부드러운 윤곽선의 수채화 그림책 스타일\"}",
    "color_palette": "{argument name=\"color palette\" default=\"따뜻한 주황색 + 부드러운 초록 + 미색\"}",
    "rendering": "입자감 있는 종이 질감 + 부드러운 수채화 + 단순한 선"
  },
  "text_overlay": {
    "enabled": "{argument name=\"text enabled\" default=\"true\"}",
    "text": "{argument name=\"text\" default=\"꼬마 곰이 고개를 들자, 세상이 갑자기 아주 커 보였어요.\"}",
    "position": "{argument name=\"text position\" default=\"화면 아래쪽 중앙\"}",
    "font_style": "둥글고 친근한 손글씨"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"4:3\"}",
  "constraints": {
    "must_keep": [
      "주인공을 시각적 중심으로 유지",
      "전체 색상 팔레트가 따뜻하고 편안함",
      "텍스트와 그림의 여백이 적절함",
      "보조 캐릭터가 주인공의 시선을 빼앗지 않음"
    ],
    "avoid": [
      "성인의 복잡한 표정 등장",
      "차가운 색조",
      "장면을 지나치게 실사처럼 표현",
      "브랜드 로고 등장"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주인공, 장면, 텍스트
- 기본값 지정 가능: 스타일, 색상, 글꼴
- 무작위 지정 가능: 보조 캐릭터

### 자동 완성 전략

- 주인공은 귀여운 스타일을 우선하며 동물이 어린이보다 기본 선택입니다.
- 기본 스타일은 수채화 그림책입니다.
- 텍스트는 25자 이하로 제한합니다.
- 기본 비율은 4:3 또는 3:4입니다.

## 변형 1: 명절 카드

📝 프롬프트

```json
{
  "type": "명절 어린이 카드",
  "story": {
    "theme": "{argument name=\"festival\" default=\"크리스마스\"}",
    "scene": "눈 내리는 밤의 작은 집"
  },
  "main_character": {
    "description": "빨간 모자를 쓴 작은 여우"
  },
  "text_overlay": {
    "text": "Merry Christmas",
    "position": "상단"
  },
  "constraints": {
    "must_feel": "명절 분위기, 따뜻함, 공유하기 좋은 구성"
  }
}
```

## 변형 2: 교육 삽화

📝 프롬프트

```json
{
  "type": "어린이 교육 삽화",
  "story": {
    "theme": "{argument name=\"concept\" default=\"올바른 양치 순서\"}",
    "scene": "욕실"
  },
  "main_character": {
    "description": "칫솔을 든 어린이"
  },
  "text_overlay": {
    "enabled": true,
    "text": "1. 입 헹구기 → 2. 윗니 닦기 → 3. 아랫니 닦기 → 4. 다시 헹구기"
  },
  "constraints": {
    "must_feel": "이해하기 쉽고 교육에 활용 가능하며 친근함"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "동화책 일러스트 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 주제를 제공하면 주인공, 장면, 스타일, 텍스트를 자동 결정",
  "constraints": {
    "must_feel": "그림책으로 인쇄할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 인물의 이목구비를 실사처럼 표현하지 않습니다.
- 장면을 지나치게 어둡게 만들지 않습니다.
- 텍스트는 25자를 넘기지 않습니다.
- 글꼴을 세 종류 넘게 사용하지 않습니다.
- 성인만 이해할 수 있는 개념을 넣지 않습니다.
