# 미니멀 분위기 일러스트 템플릿

이 문서는 "미니멀한 여백 / 강한 분위기"의 일러스트를 만들 때 사용합니다.

- 미니멀 포스터
- 문학적인 분위기 이미지
- 브랜드 감정 이미지
- 공식 계정 글 말미 이미지
- 데스크톱 / 휴대전화 배경화면

특징:

- 넓은 여백
- 단일 주제 또는 매우 적은 요소
- 지배적인 색상 한 가지
- 강한 감정 / 분위기
- 텍스트가 있을 경우 매우 적게 사용

## 적용 범위

- 문학적인 분위기 이미지
- 미니멀 포스터
- 브랜드 감정 이미지
- 배경화면 / 글 말미 이미지

## 사용 시점

- 사용자가 "미니멀 / 여백 / 분위기 / 한 가지 기분 / 문학적 스타일"을 언급할 때
- 서사 없이 "감정이 우선"인 시각물을 원할 때

다음에는 사용하지 마세요.

- 편안한 일상 장면(`healing-scene.md` 사용)
- 콘셉트 대형 장면(`concept-scene.md` 사용)
- 그림책 일러스트(`picture-book-scene.md` 사용)

## 누락 정보 확인 우선순위

1. 한 가지 기분 / 한 문장
2. 주제(사람 한 명 / 새 한 마리 / 나무 한 그루 / 추상 도형)
3. 지배적인 색상
4. 텍스트가 필요한지 여부
5. 비율

## 기본 템플릿: 미니멀 여백 분위기 이미지

📖 설명

여백이 넓고 주제는 작게 치우쳐 배치합니다. 색조를 통일하고 텍스트가 있다면 한 문장만 넣습니다.

📝 프롬프트

```json
{
  "type": "미니멀 여백 분위기 이미지",
  "goal": "감정과 넓은 여백이 중심인 미니멀 일러스트 생성",
  "mood": {
    "feeling": "{argument name=\"feeling\" default=\"고요함, 혼자 있음, 늦가을\"}",
    "one_sentence": "{argument name=\"one sentence\" default=\"바람이 멈추고, 나도 마침내 잠깐 멈췄다.\"}"
  },
  "subject": {
    "description": "{argument name=\"main subject\" default=\"멀리 홀로 서 있는 작은 나무 한 그루\"}",
    "scale": "{argument name=\"subject scale\" default=\"화면의 10% 차지\"}",
    "position": "{argument name=\"subject position\" default=\"화면 오른쪽 아래\"}"
  },
  "background": {
    "type": "{argument name=\"background\" default=\"은은한 종이 질감의 미색 안개\"}",
    "main_color": "{argument name=\"main color\" default=\"미색 + 따뜻한 회색 한 방울\"}"
  },
  "text_overlay": {
    "enabled": "{argument name=\"text enabled\" default=\"true\"}",
    "text": "{argument name=\"text\" default=\"바람이 멈추고, 나도 마침내 잠깐 멈췄다.\"}",
    "position": "{argument name=\"text position\" default=\"화면 왼쪽 위\"}",
    "font_style": "{argument name=\"font style\" default=\"가는 세리프체\"}",
    "color": "짙은 회색"
  },
  "style": {
    "rendering": "미니멀 일러스트 + 은은한 종이 질감 + 부드러운 입자",
    "lighting": "전체적으로 부드러운 빛, 거의 극적인 조명 없음",
    "color_palette": "주색 2가지 이하"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "여백이 화면의 70% 이상",
      "주제는 작더라도 반드시 존재",
      "색조를 엄격히 통일",
      "장식이 아니라 색상과 여백으로 감정을 전달"
    ],
    "avoid": [
      "보조 요소가 쌓임",
      "색상을 2가지 넘게 사용",
      "텍스트가 한 문장을 초과",
      "브랜드 로고 등장"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 기분, 주제
- 기본값 지정 가능: 배경, 색상 팔레트, 글꼴
- 무작위 지정 가능: 주제의 작은 세부 사항

### 자동 완성 전략

- 기분에 맞춰 색상을 고릅니다(혼자 있음 = 미색; 밤 = 짙은 파랑; 가을 = 따뜻한 갈색; 봄 = 벚꽃 분홍).
- 기분에 따라 주제를 선택합니다(외로움 = 나무 한 그루 / 새 한 마리; 평온함 = 바다 한 조각; 그리움 = 멀어지는 뒷모습).
- 텍스트는 18자 이하로 제한합니다.

## 변형 1: 단색 미니멀 포스터

📝 프롬프트

```json
{
  "type": "단색 미니멀 포스터",
  "subject": {
    "description": "{argument name=\"subject\" default=\"날아가는 새 실루엣 한 마리\"}",
    "scale": "5%"
  },
  "background": {
    "type": "단색",
    "main_color": "{argument name=\"main color\" default=\"짙은 파랑\"}"
  },
  "text_overlay": {
    "text": "{argument name=\"text\" default=\"자유\"}",
    "font_style": "매우 굵은 고딕체"
  },
  "constraints": {
    "must_feel": "강한 한 문장, 절제, 개념성"
  }
}
```

## 변형 2: 추상 도형 분위기 이미지

📝 프롬프트

```json
{
  "type": "추상 도형 분위기 이미지",
  "subject": {
    "description": "{argument name=\"abstract\" default=\"서로 접하는 원 두 개\"}",
    "scale": "30%"
  },
  "constraints": {
    "must_feel": "개념적이고 디자인 감각이 있으며 브랜드 자산 같은 느낌"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "미니멀 분위기 이미지 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 기분 한 문장 또는 단어 하나를 주면 주제, 색상, 텍스트, 비율을 자동으로 결정",
  "constraints": {
    "must_feel": "배경화면 / 글 말미 이미지로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 화면을 요소로 가득 채우지 않습니다.
- 주색을 두 가지 넘게 사용하지 않습니다.
- 텍스트를 18자 넘게 쓰지 않습니다.
- 주제를 정중앙에 놓지 않습니다(미니멀 구성에서는 보통 치우쳐 배치).
- 화려한 서체를 사용하지 않습니다.
