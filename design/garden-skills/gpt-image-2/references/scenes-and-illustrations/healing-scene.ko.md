# 힐링 장면 일러스트 템플릿

이 문서는 "부드러운 빛, 따뜻함, 편안함"이 느껴지는 장면 일러스트를 만들 때 사용합니다.

- 편안한 일상 장면
- 계절 분위기 일러스트
- 카드 / 굿즈 표지 이미지
- 공식 계정 / 샤오홍슈 대표 이미지
- 부드러운 분위기의 브랜드 메인 이미지

특징:

- 부드러운 색상 팔레트
- 자연광 느낌
- 절제된 여백
- 캐릭터 + 장면 + 작은 소품으로 구성
- 극적인 갈등을 강조하지 않음

## 적용 범위

- 힐링 일상 장면
- 계절 분위기 이미지
- 공식 계정 대표 이미지
- 굿즈 카드

## 사용 시점

- 사용자가 "힐링 / 다정함 / 부드러운 빛 / 일상 / 스튜디오 지브리풍"을 언급할 때
- 보는 사람이 잠시 멈춰 바라보고 싶어지는 시각물을 원할 때

다음에는 사용하지 마세요.

- 콘셉트 / 서사적 대형 장면(`concept-scene.md` 사용)
- 그림책 일러스트(`picture-book-scene.md` 사용)
- 미니멀 여백 분위기(`minimalist-mood-scene.md` 사용)

## 누락 정보 확인 우선순위

1. 장면(카페 / 방 / 창가 / 바닷가 / 길모퉁이)
2. 계절 / 시간
3. 인물이 필요한지 여부
4. 소품(책 / 고양이 / 차 / 식물)
5. 스타일: 손그림 애니메이션 / 수채화 / 디지털 일러스트
6. 색상 방향

## 기본 템플릿: 힐링 일상 장면

📖 설명

부드러운 빛을 사용하는 장면 일러스트 한 장입니다. 일상적인 환경을 주제로 하고 인물 한 명 또는 동물 한 마리를 넣을 수 있으며 따뜻하고 자연스러운 색상을 사용합니다.

📝 프롬프트

```json
{
  "type": "힐링 일상 장면 일러스트",
  "goal": "잠시 멈춰 바라보고 싶어지는 편안한 일상 장면 일러스트 생성",
  "scene": {
    "location": "{argument name=\"location\" default=\"창가의 작은 책상\"}",
    "season": "{argument name=\"season\" default=\"초여름\"}",
    "time_of_day": "{argument name=\"time of day\" default=\"이른 아침\"}",
    "weather_or_mood": "{argument name=\"mood\" default=\"맑고 산들바람이 불며 막 잠에서 깬 느낌\"}"
  },
  "subject": {
    "human_or_animal": "{argument name=\"main subject\" default=\"짧은 머리 소녀가 창밖을 바라보며 턱을 괸 뒷모습\"}",
    "scale": "{argument name=\"subject scale\" default=\"화면의 1/3 차지\"}"
  },
  "props": {
    "items": [
      "{argument name=\"prop 1\" default=\"펼친 책 + 반 컵의 따뜻한 차\"}",
      "{argument name=\"prop 2\" default=\"창턱의 작은 화분\"}",
      "{argument name=\"prop 3\" default=\"접힌 베이지색 담요\"}"
    ]
  },
  "lighting": {
    "type": "{argument name=\"light type\" default=\"자연광\"}",
    "direction": "{argument name=\"light direction\" default=\"창문에서 들어오는 측면광\"}",
    "intensity": "{argument name=\"light intensity\" default=\"부드러움\"}",
    "color_temp": "{argument name=\"color temp\" default=\"따뜻한 금빛\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"손그림 애니메이션 + 부드러운 수채화 빛\"}",
    "rendering": "종이 입자감 + 부드러운 수채화 + 간결한 선",
    "color_palette": "{argument name=\"color palette\" default=\"미색 + 따뜻한 주황색 + 초록색\"}"
  },
  "constraints": {
    "must_keep": [
      "전체 분위기가 따뜻하고 편안함",
      "조명 방향이 통일됨",
      "색조가 절제되고 과장되지 않음",
      "소품과 장면이 같은 분위기를 공유"
    ],
    "avoid": [
      "극적인 감정이 드러남",
      "색상이 지나치게 채도가 높음",
      "장면 요소가 지나치게 빽빽함",
      "브랜드 광고가 등장함"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 장면, 계절, 주인공
- 기본값 지정 가능: 스타일, 조명, 색상
- 무작위 지정 가능: 소품의 구체적인 형태

### 자동 완성 전략

- 계절에 맞춰 색상을 자동 선택합니다(봄 = 벚꽃 분홍 / 여름 = 파랑·흰색 / 가을 = 따뜻한 갈색 / 겨울 = 눈처럼 흰색).
- 주인공은 기분에 맞춰 선택합니다(외로움 = 나무 한 그루 / 새 한 마리; 평온함 = 바다 한 조각; 그리움 = 멀어지는 뒷모습).
- 기본 스타일은 손그림 애니메이션 + 수채화입니다.

## 변형 1: 반려동물 힐링 장면

📝 프롬프트

```json
{
  "type": "반려동물 힐링 장면 일러스트",
  "subject": {
    "human_or_animal": "{argument name=\"animal\" default=\"담요에 웅크린 주황 고양이\"}"
  },
  "constraints": {
    "must_feel": "복슬복슬하고 편안하며 쓰다듬고 싶음"
  }
}
```

## 변형 2: 야외 힐링 장면

📝 프롬프트

```json
{
  "type": "야외 힐링 장면 일러스트",
  "scene": {
    "location": "{argument name=\"outdoor\" default=\"호숫가 나무 산책로\"}",
    "weather_or_mood": "황혼 + 산들바람"
  },
  "subject": {
    "human_or_animal": "나란히 걷는 두 사람의 뒷모습"
  },
  "constraints": {
    "must_feel": "영화적이고 여백이 있으며 느린 리듬"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "힐링 장면 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 계절 / 시간 / 기분 한 문장을 주면 장면, 주인공, 소품, 색상을 자동 결정",
  "constraints": {
    "must_feel": "공식 계정 / 샤오홍슈 대표 이미지로 사용할 수 있음"
  }
}
```

## 피해야 할 사항

- 인물의 정면 얼굴이 시선을 끌지 않게 합니다.
- 광원 방향이 서로 다르지 않게 합니다.
- 색상이 지나치게 채도가 높아 "달콤해서 질리는" 느낌이 들지 않게 합니다.
- 소품을 지나치게 많이 넣지 않습니다.
- 알아볼 수 있는 로고를 넣지 않습니다.
