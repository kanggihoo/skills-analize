# 룩북 / 9분할 목록 인포그래픽 템플릿

이 문서는 "한 이미지 안에 주제별 목록을 N개 칸으로 나누어 보여 주는" 시각물에 사용합니다.

- 7일 코디 룩북
- 9분할 셀프 케어 목록
- 일주일 식단 룩북
- 월간 계획 9분할
- 주제별 목록 이미지(추천 10선, 7일 습관)

특징:

- 여러 칸으로 구성된 목록(7 / 9 / 12개)
- 각 칸을 독립적으로 읽을 수 있음
- 보통 번호 / 날짜 / 라벨을 표시
- 강한 서사보다 목록을 보여 주는 데 중점을 둠
- 상단에 메인 제목, 하단에 짧은 요약

## 적용 범위

- 코디 룩북
- 주간 식단표
- 습관 체크 카드
- 상위 N개 목록 시각물

## 사용 시점

- 사용자가 "7일 / 9분할 / 월간 / 룩북 / TOP N"을 언급할 때
- 목록 하나를 이미지 한 장에 모두 담고 싶어 할 때

다음에는 사용하지 마세요.

- 마케팅 배너 세트(`banner-grid-2x2.md` 사용)
- 관계도(`storyboards-and-sequences/character-relationship-diagram.md` 사용)
- 표정 9분할(`avatars-and-profile/character-grid-portrait.md` 사용)

## 누락 정보 확인 우선순위

1. 주제(코디 / 식단 / 습관 / TOP)
2. 칸 수(7 / 9 / 12)
3. 각 칸의 내용
4. 번호 / 날짜 / 라벨이 필요한지 여부
5. 스타일: 실사 사진 / 일러스트 / 미니멀
6. 화면 비율

## 기본 템플릿: 7일 코디 룩북

📖 설명

한 이미지의 위쪽에 제목을 두고, 주요 영역에는 전신 코디 7개를 배치하며, 아래쪽에 짧은 스타일 요약을 넣습니다.

📝 프롬프트

```json
{
  "type": "7일 코디 룩북",
  "goal": "샤오홍슈 / Instagram에 게시할 수 있는 7일 코디 인포그래픽 생성",
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"이번 주엔 뭘 입을까\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"7일 · 7가지 코디\"}",
    "position": "상단 중앙"
  },
  "subject": {
    "model": "{argument name=\"model description\" default=\"자연스럽게 미소 짓는 동아시아 젊은 여성\"}",
    "consistency": "7개 칸 모두 같은 인물이어야 합니다."
  },
  "layout": {
    "format": "{argument name=\"layout\" default=\"위쪽 4개 + 아래쪽 3개를 엇갈리게 배치\"}",
    "panel_count": 7,
    "panel_design": {
      "label_top": "{argument name=\"label format\" default=\"DAY 1 / MON\"}",
      "outfit_caption": "스타일을 설명하는 한 문장"
    }
  },
  "outfits": [
    {"day": 1, "label": "MON", "style": "{argument name=\"day 1\" default=\"출근용 흰 셔츠 + 베이지색 슬랙스\"}"},
    {"day": 2, "label": "TUE", "style": "{argument name=\"day 2\" default=\"니트 카디건 + 청바지\"}"},
    {"day": 3, "label": "WED", "style": "{argument name=\"day 3\" default=\"원피스 + 플랫 슈즈\"}"},
    {"day": 4, "label": "THU", "style": "{argument name=\"day 4\" default=\"운동용 후드티 + 짧은 치마\"}"},
    {"day": 5, "label": "FRI", "style": "{argument name=\"day 5\" default=\"가죽 재킷 + 검정 스트레이트 팬츠\"}"},
    {"day": 6, "label": "SAT", "style": "{argument name=\"day 6\" default=\"면·마 셔츠 + 와이드 팬츠\"}"},
    {"day": 7, "label": "SUN", "style": "{argument name=\"day 7\" default=\"후드티 + 운동용 반바지\"}"}
  ],
  "style": {
    "art_style": "{argument name=\"art style\" default=\"일본 잡지풍 패션 사진 + 베이지색 배경\"}",
    "color_palette": "{argument name=\"color palette\" default=\"베이지색 + 대지색 + 검정\"}"
  },
  "footer": {
    "summary": "{argument name=\"summary\" default=\"평일 출근 코디 + 주말의 여유\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "7개 칸 모두 같은 인물",
      "한 주의 흐름에 어울리는 코디 스타일",
      "색상 팔레트를 엄격하게 통일",
      "라벨 글꼴을 일관되게 유지"
    ],
    "avoid": [
      "7개 칸의 인물이 서로 다른 사람처럼 보임",
      "채도가 높은 형광색을 색상 팔레트에 사용",
      "서로 어울리지 않는 방향으로 코디 스타일이 달라짐",
      "서체를 두 종류 넘게 사용"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주제, 모델 설명, 코디 7개
- 기본값 지정 가능: 레이아웃, 스타일, 색상 팔레트
- 무작위 지정 가능: 배경의 세부 요소

### 자동 완성 전략

- 사용자가 "미니멀 / 레트로 / 스트리트" 같은 스타일 키워드를 주면 코디 7가지를 자동으로 구체화합니다.
- 기본값은 7칸 엇갈림 배치입니다.
- 기본값은 일본 잡지 스타일 사진입니다.

## 변형 1: 셀프 케어 9분할 목록

📝 프롬프트

```json
{
  "type": "셀프 케어 9분할 목록",
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"매일 나를 돌보는 9가지\"}"
  },
  "layout": {
    "format": "3x3 grid",
    "panel_count": 9
  },
  "outfits": [
    {"label": "1", "style": "물 8잔 마시기"},
    {"label": "2", "style": "10분 스트레칭"},
    {"label": "3", "style": "햇볕 15분 쬐기"},
    {"label": "4", "style": "심호흡하기"},
    {"label": "5", "style": "감사한 일 3가지 적기"},
    {"label": "6", "style": "좋아하는 노래 한 곡 듣기"},
    {"label": "7", "style": "가족과 통화하기"},
    {"label": "8", "style": "책 10쪽 읽기"},
    {"label": "9", "style": "밤 11시에 잠자리에 들기"}
  ],
  "style": {
    "art_style": "부드러운 색상의 미니멀 일러스트"
  },
  "constraints": {
    "must_feel": "습관 체크 포스터로 바로 사용할 수 있어야 합니다."
  }
}
```

## 변형 2: TOP 12 목록 이미지

📝 프롬프트

```json
{
  "type": "TOP 12 목록 이미지",
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"2026년에 읽을 가치가 있는 책 12권\"}"
  },
  "layout": {
    "format": "3x4 grid",
    "panel_count": 12
  },
  "constraints": {
    "must_feel": "추천 목록의 느낌 + 공유하기 좋은 구성"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "룩북 / 목록 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 주제를 제시하면 칸 수, 내용, 스타일을 자동으로 결정",
  "constraints": {
    "must_feel": "샤오홍슈에 바로 게시할 수 있어야 합니다."
  }
}
```

## 피해야 할 사항

- 칸을 16개 넘게 만들지 않습니다.
- 칸 크기 차이가 2배를 넘지 않게 합니다(대표 이미지가 일관된 규칙을 따르는 경우 제외).
- 배경 색상이 주제와 동떨어지지 않게 합니다.
- 제목의 글자 크기 / 서체 종류가 여러 가지가 되지 않게 합니다.
- 하나의 룩북에 여러 모델을 넣지 않습니다(인물 정체성 유지).
