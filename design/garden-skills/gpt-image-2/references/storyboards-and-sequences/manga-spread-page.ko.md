# 만화 펼침 / 다중 패널 페이지 템플릿

이 문서는 "한 페이지 안에 불규칙한 여러 패널로 이야기를 전개"하는 만화 시각물을 만들 때 사용합니다.

- 한 페이지에 5~7개 패널이 있는 만화
- 좌우 페이지로 이어지는 펼침(spread)
- 심리 / 미스터리 / 전투 / 일상 다중 장면
- 동인지 / 상업 만화
- 스토리보드

특징:

- 불규칙한 칸 구성
- 큰 칸과 작은 칸을 혼합
- 읽기 순서가 있음(보통 오른쪽 위 → 왼쪽 아래)
- 대사 상자 + 속마음 + 내레이션 포함
- 4칸 개그 만화보다 "만화책"에 가까운 스타일

## 적용 범위

- 단일 페이지 다중 패널 만화
- 좌우 페이지 펼침 구성
- 스토리보드 / 콘티
- 동인지 / 상업 만화

## 사용 시점

- 사용자가 "만화 콘티 / spread / 다중 패널 만화 / 스토리보드"를 언급할 때
- 이야기의 복잡도가 높고 리듬이 역동적이길 원할 때
- "만화책" 질감을 원할 때

다음에는 사용하지 마세요.

- 4칸 개그 만화(`four-panel-comic.md` 사용)
- 단일 KV(`anime-key-visual.md` 사용)
- 캐릭터 설정 시트(`portraits-and-characters/character-sheet.md` 사용)

## 누락 정보 확인 우선순위

1. 이야기 개요 / 이 페이지에서 전할 내용
2. 패널 수(5~9칸)
3. 주인공 설명
4. 스타일: 일본 만화 / 한국 만화 / 미국 만화 / 동인지
5. 읽기 방향(일본식 오른쪽에서 왼쪽 / 미국식 왼쪽에서 오른쪽)
6. 컬러 또는 순수 흑백 여부

## 기본 템플릿: 단일 페이지 다중 패널 만화

📖 설명

불규칙한 패널 5~7개가 있는 만화 한 페이지입니다. 읽는 순서대로 이야기를 펼칩니다.

📝 프롬프트

```json
{
  "type": "단일 페이지 다중 패널 만화",
  "goal": "리듬이 빠르고 서사가 촘촘한 완성된 단일 페이지 만화를 생성",
  "story": {
    "summary": "{argument name=\"story summary\" default=\"주인공이 수상한 전화를 받고 혼자 나서기로 결심함\"}",
    "main_character": "{argument name=\"main character\" default=\"짧은 머리의 젊은 여성 탐정, 검은 트렌치코트\"}",
    "supporting": "{argument name=\"supporting\" default=\"없음\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"스크린톤과 강한 그림자를 쓴 일본식 흑백 만화 선화\"}",
    "tone": "{argument name=\"tone\" default=\"미스터리 + 긴장감\"}",
    "color": "{argument name=\"color\" default=\"흑백 + 회색조\"}"
  },
  "page_layout": {
    "panel_count": "{argument name=\"panel count\" default=\"6\"}",
    "reading_direction": "{argument name=\"reading direction\" default=\"일본식: 오른쪽에서 왼쪽, 위에서 아래\"}",
    "panels": [
      {
        "id": 1,
        "size": "상단 절반을 가로지르는 큰 칸",
        "scene": "{argument name=\"panel 1\" default=\"전화기를 귀에 댄 주인공의 옆얼굴 클로즈업\"}",
        "text": "{argument name=\"text 1\" default=\"내레이션: 그 전화 한 통이 모든 것을 바꿨다\"}"
      },
      {
        "id": 2,
        "size": "오른쪽 아래 중간 크기 칸",
        "scene": "{argument name=\"panel 2\" default=\"전화 수화기에서 들리는 잡음 클로즈업\"}",
        "text": "{argument name=\"text 2\" default=\"상대방: 오늘 밤 열 시, 늘 만나던 곳에서\"}"
      },
      {
        "id": 3,
        "size": "왼쪽 아래 작은 칸",
        "scene": "{argument name=\"panel 3\" default=\"동공이 커진 주인공의 눈 클로즈업\"}",
        "text": "{argument name=\"text 3\" default=\"속마음: 또 그 사람인가\"}"
      },
      {
        "id": 4,
        "size": "오른쪽 중간 칸",
        "scene": "{argument name=\"panel 4\" default=\"주인공이 트렌치코트를 입는 동작 장면\"}",
        "text": ""
      },
      {
        "id": 5,
        "size": "가운데 중간 칸",
        "scene": "{argument name=\"panel 5\" default=\"주인공이 문을 열고 비 내리는 거리로 나감\"}",
        "text": ""
      },
      {
        "id": 6,
        "size": "하단 절반을 가로지르는 큰 칸",
        "scene": "{argument name=\"panel 6\" default=\"가로등의 희미한 빛 아래 멀어지는 주인공의 뒷모습\"}",
        "text": "{argument name=\"text 6\" default=\"내레이션: 이건 약속 장소로 가는 걸까, 죽음을 향해 가는 걸까\"}"
      }
    ]
  },
  "dialogue_design": {
    "balloon_style": "검은 윤곽선과 꼬리가 있는 흰색 말풍선",
    "narration_box": "회색 배경과 검은 테두리의 직사각형 상자",
    "thought_balloon": "점선 꼬리가 있는 구름 모양 말풍선",
    "font_style": "만화용 산세리프체"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "패널 크기에 리듬이 있음(큰 칸 + 작은 칸 + 큰 칸)",
      "읽기 순서가 분명함",
      "여러 칸에서 주인공 외형을 일관되게 유지",
      "말풍선이 인물의 핵심 동작을 가리지 않음"
    ],
    "avoid": [
      "모든 패널이 같은 크기라 리듬이 단조로움",
      "읽기 순서가 혼란스러움",
      "주인공 외형이 달라짐",
      "흑백 페이지에 갑자기 컬러가 들어가는 등 색조가 급변함"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 이야기 개요, 패널 수, 주인공
- 기본값 지정 가능: 스타일, 읽기 방향, 말풍선 스타일
- 무작위 지정 가능: 대사의 구체적인 표현

### 자동 완성 전략

- 사용자가 이야기만 제공하면 기승전결에 맞춘 패널 5~7개를 자동 구성합니다.
- 기본은 일본식 흑백 만화 + 스크린톤입니다.
- 기본 읽기 방향은 일본식입니다.

## 변형 1: 좌우 두 페이지 펼침(spread)

📝 프롬프트

```json
{
  "type": "두 페이지 펼침 만화",
  "page_layout": {
    "panel_count": "8~12개(좌우 두 페이지 합계)",
    "format": "가로 펼침 구성, 화면을 좌우 두 페이지로 나눔"
  },
  "aspect_ratio": "16:11",
  "constraints": {
    "must_feel": "양쪽 페이지가 하나로 이어지고 중앙 제본선이 핵심 요소를 자르지 않음"
  }
}
```

## 변형 2: 컬러 상업 만화 페이지

📝 프롬프트

```json
{
  "type": "컬러 상업 만화 페이지",
  "style": {
    "color": "풀컬러 + 플랫 셰이딩 + 디지털 만화 질감",
    "art_style": "미국 만화 / 한국 만화 스타일"
  },
  "constraints": {
    "must_feel": "상업 만화 연재 페이지로 사용할 수 있어야 함"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "만화 펼침 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 이야기 한 단락을 주면 패널 분할, 레이아웃, 대사를 자동 구성",
  "constraints": {
    "must_feel": "출판사 편집자가 바로 지면에 넣을 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 모든 패널을 같은 크기로 만들지 않습니다.
- 읽기 순서가 헷갈리지 않게 합니다.
- 말풍선이 얼굴 / 동작을 가리지 않게 합니다.
- 흑백 만화에 갑자기 강한 컬러를 넣지 않습니다.
- 각 칸에서 주인공이 다른 사람처럼 보이지 않게 합니다.
- 펼침 페이지의 핵심 요소가 중앙 제본선에 걸리지 않게 합니다.
