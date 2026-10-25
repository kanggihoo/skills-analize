# 스티커 세트 템플릿

이 문서는 "한 이미지 안에 개별적으로 잘라 쓸 수 있는 스티커 N개를 넣는" 시각물을 만들 때 사용합니다.

- 재미있는 동물 스티커
- 캐릭터 표정 스티커
- 명절 / 축제 테마 스티커
- 업종 / 취미 테마 스티커
- iMessage / Telegram 스타일 스티커 팩

특징:

- 한 이미지 안에 서로 독립적인 작은 요소가 여러 개 있습니다.
- 각 요소에 투명 / 흰색 / 테두리 바깥선을 적용합니다.
- 요소끼리 연결되지 않습니다.
- 전체 이미지를 인쇄하거나 개별 요소를 잘라 사용할 수 있습니다.
- 전체 스타일을 통일합니다.

## 적용 범위

- 스티커 세트(4~12개)
- 이모티콘 모음
- 명절 선물 상자 스티커
- 굿즈용 스티커 카드

## 사용 시점

- 사용자가 "스티커 / sticker set / 스티커 팩"을 언급할 때
- 한 이미지에 독립적인 작은 요소를 여러 개 넣고 싶어 할 때
- 각 요소를 따로 사용할 수 있기를 원할 때

다음에는 사용하지 마세요.

- 한 캐릭터의 여러 표정을 담은 3×3 그리드( `character-grid-portrait.md` 사용)
- 여러 버전의 아바타( `themed-3d-icon.md` 사용)
- 여러 패널로 구성된 이야기 콜라주( `grids-and-collages/mixed-style-multi-panel.md` 사용)

## 누락 정보 확인 우선순위

1. 주제(동물 / 음식 / 캐릭터 / 명절 / 기분)
2. 스티커 수(4 / 6 / 8 / 9 / 12)
3. 스타일: 손그림 / 3D 귀여운 스타일 / 실물 같은 표현 / 애니메이션
4. 텍스트 라벨을 넣을지 여부
5. 기본 색상 팔레트
6. 흰색 테두리가 필요한지 여부

## 기본 템플릿: 재미있는 동물 스티커 세트(9개)

📖 설명

전체 이미지는 1:1 또는 4:3 비율의 큰 이미지입니다. 연한 베이지 배경에 스티커 9개를 3×3으로 배치하고, 각 스티커에 흰색 테두리를 둘러 줍니다.

📝 프롬프트

```json
{
  "type": "스티커 세트 sticker set",
  "goal": "개별적으로 잘라 사용할 수 있는 작은 스티커 N개를 한 이미지에 모아 생성",
  "theme": "{argument name=\"theme\" default=\"일상 속 재미있는 동물\"}",
  "style": {
    "rendering": "{argument name=\"art style\" default=\"귀여운 3D 스타일 + 부드러운 빛\"}",
    "color_palette": "{argument name=\"color palette\" default=\"따뜻한 주황색 + 미색 + 연두색\"}"
  },
  "sticker_design": {
    "outline": "{argument name=\"outline\" default=\"3px 흰색 테두리\"}",
    "shadow": "{argument name=\"shadow\" default=\"아래에 은은한 그림자\"}",
    "with_label": "{argument name=\"with label\" default=\"true\"}",
    "label_style": "{argument name=\"label style\" default=\"둥글고 손으로 쓴 듯한 짙은 갈색 글씨\"}"
  },
  "layout": {
    "background": "{argument name=\"background\" default=\"옅은 베이지색 + 은은한 종이 질감\"}",
    "grid": "{argument name=\"grid\" default=\"3x3\"}",
    "spacing": "스티커 사이의 간격을 고르게 배치",
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"1:1\"}"
  },
  "stickers": {
    "count": "{argument name=\"sticker count\" default=\"9\"}",
    "items": [
      "{argument name=\"sticker 1\" default=\"커피를 마시는 주황색 고양이 + 'morning' 라벨\"}",
      "{argument name=\"sticker 2\" default=\"풍선을 든 시바견 + 'yay' 라벨\"}",
      "{argument name=\"sticker 3\" default=\"하품하는 작은 곰 + 'sleepy' 라벨\"}",
      "{argument name=\"sticker 4\" default=\"선글라스를 쓴 토끼 + 'cool' 라벨\"}",
      "{argument name=\"sticker 5\" default=\"꽃을 안은 카피바라 + 'love' 라벨\"}",
      "{argument name=\"sticker 6\" default=\"깡충 뛰는 작은 여우 + 'go' 라벨\"}",
      "{argument name=\"sticker 7\" default=\"책을 읽는 부엉이 + 'study' 라벨\"}",
      "{argument name=\"sticker 8\" default=\"케이크를 먹는 햄스터 + 'yum' 라벨\"}",
      "{argument name=\"sticker 9\" default=\"손을 흔드는 펭귄 + 'hi' 라벨\"}"
    ]
  },
  "constraints": {
    "must_keep": [
      "모든 스티커를 서로 연결되지 않게 독립적으로 배치",
      "전체 스타일을 통일하고 일관되게 유지",
      "흰색 테두리의 두께를 고르게 유지",
      "라벨 글꼴을 통일"
    ],
    "avoid": [
      "스티커 크기의 차이가 지나치게 큼",
      "실사와 카툰 스타일을 섞음",
      "라벨 오타",
      "배경이 스티커보다 눈에 띔"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주제, 수량
- 기본값 지정 가능: 스타일, 테두리, 라벨
- 무작위 지정 가능: 각 스티커의 구체적인 모양

### 자동 완성 전략

- 기본값은 9개(3×3)입니다.
- 기본값은 흰색 테두리와 짧은 라벨을 포함합니다.
- 주제에 따라 스타일을 자동으로 선택합니다(동물 = 귀여운 스타일 / 음식 = 실물 같은 3D / 명절 = 명절 색상).

## 변형 1: 명절 / 축제 스티커 세트

📝 프롬프트

```json
{
  "type": "명절 스티커 세트",
  "theme": "{argument name=\"festival\" default=\"크리스마스\"}",
  "style": {
    "color_palette": "크리스마스 빨강 + 크리스마스 초록 + 금색"
  },
  "stickers": {
    "count": 6,
    "items": [
      "크리스마스 트리 + 'Merry'",
      "눈사람 + 'Joy'",
      "선물 상자 + 'Gift'",
      "산타클로스 얼굴 + 'Ho Ho Ho'",
      "순록 + 'Rudolph'",
      "눈송이 + 'Cool'"
    ]
  },
  "constraints": {
    "must_feel": "명절 분위기가 있고 공유하거나 인쇄하기 좋아야 합니다."
  }
}
```

## 변형 2: 기분 표정 스티커(텍스트 없음)

📝 프롬프트

```json
{
  "type": "기분 표정 스티커(텍스트 없음)",
  "sticker_design": {
    "with_label": false
  },
  "stickers": {
    "count": 12,
    "items": ["기쁨", "화남", "서운함", "어이없음", "빵 터짐", "깜짝 놀람", "졸림", "배고픔", "두근거림", "멋짐", "민망함", "잘 가"]
  },
  "constraints": {
    "must_feel": "메신저 이모티콘으로 바로 사용할 수 있어야 합니다."
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "스티커 세트 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 주제를 제시하면 수량, 스타일, 색상 팔레트, 라벨 내용을 자동으로 결정",
  "constraints": {
    "must_feel": "바로 인쇄하거나 iMessage에 업로드할 수 있어야 합니다."
  }
}
```

## 피해야 할 사항

- 스티커를 16개 넘게 넣지 않습니다(이미지가 지나치게 빽빽해집니다).
- 스티커 크기 차이가 2배를 넘지 않게 합니다.
- 실사 스타일과 귀여운 스타일을 섞지 않습니다.
- 라벨 글꼴은 한 종류만 사용합니다.
- 배경에 알아볼 수 있는 로고를 넣지 않습니다.
- 스티커끼리 겹치지 않게 합니다(각 요소가 독립적이어야 합니다).
