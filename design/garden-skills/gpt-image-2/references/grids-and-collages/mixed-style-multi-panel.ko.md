# 여러 스타일 혼합 다중 패널 콜라주 템플릿

이 문서는 "한 이미지 안에서 여러 패널을 사용하고, 각 패널의 스타일은 다르지만 주제는 통일"할 때 사용합니다.

- 5칸 / 6칸 혼합 스타일 콜라주
- 여러 화풍을 넘나드는 IP 시각 포스터
- "같은 주제의 서로 다른 시공간" 콜라주
- "한 문장으로 보는 진화의 역사" 콜라주
- 소셜 미디어용 재미있는 포스터

특징:

- 서로 다른 여러 스타일의 패널이 공존합니다.
- 패널마다 스타일이 완전히 다릅니다(실사 + 애니메이션 + 픽셀 + 유화).
- 주제 또는 주인공은 일관되게 유지합니다.
- 시각적 임팩트가 강하고 재미있습니다.
- 보통 패널 안에 작은 라벨을 넣습니다.

## 적용 범위

- 여러 화풍을 넘나드는 예술 콜라주
- 캐릭터 / 주제 하나를 여러 스타일로 표현
- 바이럴 포스터
- IP 역사 / 타임라인 콜라주

## 사용 시점

- 사용자가 "다중 스타일 / 여러 화풍 / 스타일 혼합"을 언급할 때
- 시각적 임팩트와 재미를 원할 때
- 같은 주제를 서로 다른 스타일로 표현하고 싶을 때

다음에는 사용하지 마세요.

- 스타일이 통일된 배너 세트(`banner-grid-2x2.md` 사용)
- 스타일이 통일된 룩북(`lookbook-grid.md` 사용)
- 스타일이 통일된 4칸 만화(`storyboards-and-sequences/four-panel-comic.md` 사용)

## 누락 정보 확인 우선순위

1. 주제 / 주인공(여러 스타일의 기준이 되므로 반드시 명확히 지정)
2. 칸 수(4 / 5 / 6)
3. 각 칸의 스타일(실사 / 애니메이션 / 유화 / 픽셀 / 3D / 크레용 등)
4. 스타일 라벨이 필요한지 여부
5. 화면 비율

## 기본 템플릿: 한 주제를 서로 다른 스타일로 표현한 5칸 혼합 콜라주

📖 설명

하나의 이미지에 모양이 서로 다른 다섯 칸을 배치합니다. 주인공은 같지만 각 칸의 화풍은 완전히 다르며, 각 칸 아래쪽에 작은 스타일 라벨을 둡니다.

📝 프롬프트

```json
{
  "type": "5칸 혼합 스타일 콜라주",
  "goal": "같은 주제를 서로 다른 화풍으로 표현한 5칸 혼합 스타일 콜라주 이미지를 생성",
  "subject": {
    "description": "{argument name=\"subject description\" default=\"선글라스를 쓴 주황색 고양이 한 마리\"}",
    "consistency_rule": "5개 칸의 주제는 동일하고 화풍만 달라야 합니다."
  },
  "layout": {
    "format": "{argument name=\"layout\" default=\"중앙의 큰 칸 + 네 모서리의 작은 칸\"}",
    "panel_count": 5,
    "label_position": "각 칸의 아래쪽",
    "label_design": "검은색 작은 글씨 + 흰색 배경"
  },
  "panels": [
    {
      "position": "center",
      "style": "{argument name=\"panel 1 style\" default=\"고해상도 실사 사진\"}",
      "label": "{argument name=\"panel 1 label\" default=\"PHOTO\"}"
    },
    {
      "position": "top-left",
      "style": "{argument name=\"panel 2 style\" default=\"일본 애니메이션 임파스토 스타일\"}",
      "label": "{argument name=\"panel 2 label\" default=\"ANIME\"}"
    },
    {
      "position": "top-right",
      "style": "{argument name=\"panel 3 style\" default=\"금색 액자 느낌의 고전 유화\"}",
      "label": "{argument name=\"panel 3 label\" default=\"OIL\"}"
    },
    {
      "position": "bottom-left",
      "style": "{argument name=\"panel 4 style\" default=\"16비트 픽셀 아트\"}",
      "label": "{argument name=\"panel 4 label\" default=\"PIXEL\"}"
    },
    {
      "position": "bottom-right",
      "style": "{argument name=\"panel 5 style\" default=\"귀여운 3D 픽사 스타일\"}",
      "label": "{argument name=\"panel 5 label\" default=\"3D\"}"
    }
  ],
  "global_constraints": {
    "background": "{argument name=\"background\" default=\"베이지색 종이 질감\"}",
    "spacing": "12px 흰색 구분선"
  },
  "constraints": {
    "must_keep": [
      "5개 칸의 주인공은 동일해야 함(같은 사람 / 동물임을 한눈에 알아볼 수 있어야 함)",
      "각 칸의 스타일 차이가 분명해야 함",
      "라벨 글꼴을 통일",
      "전체 레이아웃의 균형을 유지"
    ],
    "avoid": [
      "칸마다 주인공이 다른 종 / 다른 사람처럼 보임",
      "라벨이 주인공을 가림",
      "서로 다른 배경 때문에 콜라주가 조각난 듯 보임",
      "칸 크기에 규칙이 없음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주제, 스타일 다섯 가지
- 기본값 지정 가능: 레이아웃, 라벨, 배경
- 무작위 지정 가능: 각 칸의 세부 묘사

### 자동 완성 전략

- 사용자가 주제를 주면 대비가 큰 스타일 다섯 가지를 자동 선택합니다(실사 + 애니메이션 + 유화 + 픽셀 + 3D가 대표 조합).
- 기본값은 중앙의 큰 칸 + 네 모서리의 작은 칸입니다.
- 기본값은 각 칸 아래쪽의 작은 라벨입니다.

## 변형 1: 6칸 "진화의 역사" 콜라주

📝 프롬프트

```json
{
  "type": "6칸 진화의 역사 콜라주",
  "subject": {
    "description": "{argument name=\"subject\" default=\"자동차 한 대\"}",
    "common_theme": "같은 주제가 시대에 따라 변화한 모습 6개"
  },
  "panels": [
    {"label": "1900s", "style": "복고풍 흑백 필름"},
    {"label": "1950s", "style": "복고풍 컬러 포스터"},
    {"label": "1980s", "style": "네오 스팀펑크"},
    {"label": "2000s", "style": "디지털 사진"},
    {"label": "2020s", "style": "현대적 실사"},
    {"label": "2050s", "style": "사이버펑크 콘셉트 아트"}
  ],
  "constraints": {
    "must_feel": "시간의 흐름 + 진화의 느낌"
  }
}
```

## 변형 2: 4칸 "다른 나라에서 태어났다면"

📝 프롬프트

```json
{
  "type": "4칸 다른 나라 상상 콜라주",
  "subject": {
    "description": "{argument name=\"subject\" default=\"커피숍 주인 한 명\"}",
    "common_theme": "같은 정체성을 서로 다른 나라 문화에 따라 시각적으로 표현"
  },
  "panels": [
    {"label": "JAPAN", "style": "일본식 킷사텐 + 아늑한 나무 인테리어"},
    {"label": "ITALY", "style": "이탈리아 골목 카페 + 장식 타일 바닥"},
    {"label": "ETHIOPIA", "style": "전통 커피 의식 + 붉은색 직물"},
    {"label": "USA", "style": "인더스트리얼 카페 + 검은 금속"}
  ],
  "constraints": {
    "must_feel": "문화적 특색 + 동일한 정체성"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "혼합 스타일 콜라주 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 주제 + 콜라주의 축(스타일 / 시대 / 문화)을 주면 패널 다섯 개를 자동으로 결정",
  "constraints": {
    "must_feel": "바이럴할 만큼 재미있음"
  }
}
```

## 피해야 할 사항

- 패널을 6개 넘게 만들지 않습니다(시각적으로 조각나 보입니다).
- 여러 칸에서 주제를 알아볼 수 없게 만들지 않습니다.
- 스타일 간 차이가 분명하지 않아 같은 칸을 반복한 것처럼 보이지 않게 합니다.
- 배경색이 충돌하지 않게 합니다(공통 바탕색을 기준점으로 통일).
- 라벨은 한 줄을 넘기지 않습니다.
