# 4칸 만화 템플릿

이 문서는 "4칸 만화 / 풍자 만화 / 개그 만화"를 만들 때 사용합니다.

- 반전이 있는 4칸 개그
- 제품 광고 풍자 만화
- 짧은 이야기 4칸
- 소셜 미디어용 4칸 만화
- 음식 / 기분 4칸

특징:

- 크기가 같은 패널 4개(2×2 또는 1×4)
- 각 칸의 장면은 독립적이지만 이야기는 연속됨
- 기승전결의 흐름
- 보통 말풍선 / 속마음 포함
- 그림 스타일 통일

## 적용 범위

- 소셜 미디어용 4칸 만화
- 풍자 광고 4칸 만화
- 반전 개그
- 기분 일기 만화

## 사용 시점

- 사용자가 "4칸 / 4컷 만화 / 개그 만화 / 풍자 만화"를 언급할 때
- 리듬감 있는 짧은 이야기를 들려주고 싶을 때
- 반전 / 웃음 포인트를 원할 때

다음에는 사용하지 마세요.

- 여러 장면이 이어지는 만화 펼침 페이지(`manga-spread-page.md` 사용)
- 서사가 없는 패널 콜라주(`grids-and-collages/banner-grid-2x2.md` 사용)
- 단일 KV(`anime-key-visual.md` 사용)

## 누락 정보 확인 우선순위

1. 주제 / 이야기의 핵심
2. 주인공 설명
3. 네 칸이 각각 무엇을 다루는지(기승전결)
4. 스타일(손그림 일본 만화 / 미니멀 선화 / 미국 카툰 / 중국 만화)
5. 말풍선이 필요한지 여부
6. 비율(1:1 / 4:3 / 9:16)

## 기본 템플릿: 반전이 있는 2×2 4칸 만화

📖 설명

이미지 하나를 2×2 네 칸으로 나누고 기승전결의 흐름으로 반전이 있는 짧은 이야기를 전합니다.

📝 프롬프트

```json
{
  "type": "2x2 반전 4칸 만화",
  "goal": "리듬과 반전이 있는 짧은 이야기를 담은 2×2 4칸 만화를 생성",
  "story": {
    "theme": "{argument name=\"theme\" default=\"다이어트 중인 사람과 한밤중의 치킨\"}",
    "structure": "기 / 승 / 전 / 결",
    "main_character": "{argument name=\"main character\" default=\"잠옷을 입은 단발 소녀\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"일본 만화 선화 + 옅은 단색 채색\"}",
    "consistency": "네 칸 모두 같은 주인공, 통일된 그림 스타일",
    "color_palette": "{argument name=\"color palette\" default=\"미색 + 따뜻한 주황색 + 회색\"}"
  },
  "panels": {
    "format": "2x2 grid",
    "items": [
      {
        "position": "top-left",
        "label": "기",
        "scene": "{argument name=\"panel 1\" default=\"주인공이 체중계 위에 서서 인상을 찌푸림\"}",
        "dialogue": "{argument name=\"dialogue 1\" default=\"오늘 밤부터 다이어트 시작!\"}"
      },
      {
        "position": "top-right",
        "label": "승",
        "scene": "{argument name=\"panel 2\" default=\"주인공이 결연하게 물 한 잔을 마심\"}",
        "dialogue": "{argument name=\"dialogue 2\" default=\"물도 배부르네\"}"
      },
      {
        "position": "bottom-left",
        "label": "전",
        "scene": "{argument name=\"panel 3\" default=\"한밤중에 주인공이 몰래 배달 앱을 엶\"}",
        "dialogue": "{argument name=\"dialogue 3\" default=\"...치킨 한 마리만\"}"
      },
      {
        "position": "bottom-right",
        "label": "결",
        "scene": "{argument name=\"panel 4\" default=\"주인공이 치킨 통을 안고 눈물이 그렁그렁함\"}",
        "dialogue": "{argument name=\"dialogue 4\" default=\"내일부터 다이어트\"}"
      }
    ]
  },
  "dialogue_design": {
    "balloon_style": "{argument name=\"balloon style\" default=\"검은 테두리가 있는 흰색 둥근 말풍선\"}",
    "font_style": "{argument name=\"font style\" default=\"둥근 손글씨\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"1:1\"}",
  "constraints": {
    "must_keep": [
      "네 칸 모두 같은 주인공",
      "이야기 흐름이 분명함(기 / 승 / 전 / 결)",
      "말풍선이 얼굴을 가리지 않음",
      "그림 스타일을 통일하고 변하지 않게 유지"
    ],
    "avoid": [
      "이야기에 평탄하고 반전이 없음",
      "대사가 12자를 초과",
      "칸 크기가 서로 다름",
      "글꼴 종류가 여러 개"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주제, 주인공, 4칸의 이야기
- 기본값 지정 가능: 스타일, 색상, 말풍선 스타일
- 무작위 지정 가능: 대사의 구체적인 표현

### 자동 완성 전략

- 사용자가 주제만 제시하면 기승전결 4칸의 이야기와 대사 네 줄을 자동으로 만듭니다.
- 주인공은 기본적으로 주제에 어울리는 모습으로 선택합니다.
- 기본 레이아웃은 2×2입니다.

## 변형 1: 제품 광고 풍자 4칸 만화

📝 프롬프트

```json
{
  "type": "제품 광고 풍자 4칸 만화",
  "story": {
    "theme": "{argument name=\"product satire theme\" default=\"기술 회사의 프레젠테이션과 실제 제품\"}"
  },
  "panels": {
    "format": "2x2 grid",
    "items": [
      {"label": "프레젠테이션에서의 모습", "scene": "미래적인 제품 + 감탄하는 사용자"},
      {"label": "출시 행사 시연", "scene": "손을 떠는 엔지니어"},
      {"label": "실제 배송품", "scene": "제품 상자에 충전기 하나만 들어 있음"},
      {"label": "고객 지원 답변", "scene": "'다음 버전에서 제공됩니다'"}
    ]
  },
  "constraints": {
    "must_feel": "풍자 + 개그 + 한눈에 이해되는 내용"
  }
}
```

## 변형 2: 1×4 가로 스트립(Twitter / X 스레드용)

📝 프롬프트

```json
{
  "type": "1x4 가로 스트립 만화",
  "panels": {
    "format": "1x4 horizontal strip",
    "items": [
      {"label": "1", "scene": "..."},
      {"label": "2", "scene": "..."},
      {"label": "3", "scene": "..."},
      {"label": "4", "scene": "..."}
    ]
  },
  "aspect_ratio": "16:9",
  "constraints": {
    "must_feel": "가로로 읽히며 네 칸이 하나의 동작 흐름으로 연결됨"
  }
}
```

## 변형 3: 음식 / 기분 일기 4칸 만화

📝 프롬프트

```json
{
  "type": "기분 일기 4칸 만화",
  "story": {
    "theme": "{argument name=\"daily theme\" default=\"월요일 아침의 나\"}"
  },
  "style": {
    "art_style": "미니멀 선화 + 최소한의 색면"
  },
  "constraints": {
    "must_feel": "친근하고 일상적이며 공감이 감"
  }
}
```

## 변형 4: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "4칸 만화 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 주제를 주면 기승전결 4칸 + 주인공 모습 + 대사를 자동 생성",
  "constraints": {
    "must_feel": "소셜 미디어에 바로 게시할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 네 칸에 반전이나 리듬이 없지 않게 합니다.
- 칸마다 대사를 12자 넘게 쓰지 않습니다.
- 칸마다 그림 스타일이 달라지지 않게 합니다.
- 일부러 연출하는 경우가 아니라면 네 칸의 크기를 같게 합니다.
- 말풍선이 얼굴을 가리지 않게 합니다.
