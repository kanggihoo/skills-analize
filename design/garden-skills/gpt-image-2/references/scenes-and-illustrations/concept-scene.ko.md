# 콘셉트 / 대형 장면 일러스트 템플릿

이 문서는 "영화적인 대형 장면 / 콘셉트 아트 / 서사적인 일러스트"를 만들 때 사용합니다.

- 게임 콘셉트 아트
- 영화 키 아트
- 소설 / IP 대표 이미지
- 예고편 포스터 장면
- 세계관 소개 장면

특징:

- 대형 장면 / 깊은 원근감
- 강한 분위기
- 시각 정보가 풍부함
- 드라마틱한 조명
- 대형 화면 전시에 적합

## 적용 범위

- 게임 / 애니메이션 / 영화 콘셉트 아트
- 소설 / IP 대표 이미지
- 예고편 포스터
- 세계관 대표 이미지

## 사용 시점

- 사용자가 "콘셉트 아트 / 키 아트 / 대형 장면 / 영화적 / 서사적"을 언급할 때
- 이미지 한 장으로 세계관을 설명하고 싶어 할 때

다음에는 사용하지 마세요.

- 힐링 일상 장면(`healing-scene.md` 사용)
- 그림책 스타일(`picture-book-scene.md` 사용)
- 미니멀 분위기 이미지(`minimalist-mood-scene.md` 사용)

## 누락 정보 확인 우선순위

1. 세계관 주제(사이버펑크 / 동양 판타지 / 종말 / 우주 / 무협)
2. 주 대상(인물 + 원경 / 거대 생물 / 도시)
3. 시간 / 날씨 / 분위기
4. 색상 팔레트 + 조명 방향
5. 화면 비율(가로 21:9 / 16:9 / 세로 9:16)
6. 제목 문구를 위한 공간이 필요한지 여부

## 기본 템플릿: 영화적인 콘셉트 대형 장면

📖 설명

전경 인물 + 중경의 서사 요소 + 원경의 깊은 원근감을 가진 와이드 이미지입니다. 드라마틱한 조명을 사용하고 제목을 넣을 공간을 확보합니다.

📝 프롬프트

```json
{
  "type": "영화적인 콘셉트 대형 장면",
  "goal": "게임 키 아트 / 영화 키 아트 / IP 세계관 대표 이미지로 사용할 수 있는 콘셉트 대형 장면 생성",
  "world": {
    "theme": "{argument name=\"world theme\" default=\"사이버펑크 동양 도시\"}",
    "tone": "{argument name=\"world tone\" default=\"네온 + 비 오는 밤 + 고밀도 건축물\"}"
  },
  "composition": {
    "foreground": "{argument name=\"foreground\" default=\"우산을 든 여주인공의 뒷모습\"}",
    "midground": "{argument name=\"midground\" default=\"젖은 거리 + 네온사인 + 반사광\"}",
    "background": "{argument name=\"background\" default=\"높이 솟은 마천루 + 홀로그램 광고\"}",
    "perspective": "{argument name=\"perspective\" default=\"낮은 카메라 위치에서 올려다봄\"}"
  },
  "lighting": {
    "key_light": "{argument name=\"key light\" default=\"네온 핑크 + 네온 블루가 교차하는 조명\"}",
    "fill_light": "{argument name=\"fill light\" default=\"젖은 지면의 반사광\"}",
    "atmosphere": "{argument name=\"atmosphere\" default=\"습한 공기 + 안개비 + 은은한 빛 입자\"}"
  },
  "color_palette": "{argument name=\"color palette\" default=\"네온 핑크 + 일렉트릭 블루 + 짙은 검정\"}",
  "title_safe_area": "{argument name=\"title area\" default=\"화면 상단 1/4에 제목 영역 확보\"}",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"21:9\"}",
  "style": {
    "rendering": "영화급 콘셉트 아트 + 디지털 페인팅 + 세밀한 묘사"
  },
  "constraints": {
    "must_keep": [
      "전경 / 중경 / 원경의 층위가 뚜렷함",
      "조명 방향이 통일됨",
      "색상 팔레트가 엄격하게 통일됨",
      "전경 인물의 실루엣이 선명함"
    ],
    "avoid": [
      "전경과 배경이 한 덩어리로 섞임",
      "세부 요소가 지나치게 많아 화면이 꽉 참",
      "실제 브랜드 로고나 간판이 등장함",
      "색조가 갑자기 바뀜"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 세계관, 구도 층위, 비율
- 기본값 지정 가능: 조명, 색상 팔레트, 스타일
- 무작위 지정 가능: 원경 세부 요소

### 자동 완성 전략

- 주제에 따라 색상을 자동 선택합니다(사이버펑크 = 네온 / 무협 = 수묵 / 종말물 = 그을린 갈색 / 우주 = 짙은 보라).
- 기본 비율은 가로 21:9입니다.
- 제목 영역을 자동으로 남겨 둡니다.

## 변형 1: 세로형 IP 대표 이미지

📝 프롬프트

```json
{
  "type": "세로형 IP 대표 이미지",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"9:16\"}",
  "composition": {
    "foreground": "주인공 전신을 중앙에 배치",
    "midground": "후광 + 동료 실루엣",
    "background": "세계관을 대표하는 핵심 건축물"
  },
  "constraints": {
    "must_feel": "포스터 분위기, 영웅적 느낌, 첫 공개 대표 이미지"
  }
}
```

## 변형 2: 자연 경이 대형 장면

📝 프롬프트

```json
{
  "type": "자연 경이 대형 장면",
  "world": {
    "theme": "{argument name=\"natural theme\" default=\"극지의 유빙 + 거대한 고래\"}",
    "tone": "고독하고 장대하며 장엄함"
  },
  "composition": {
    "foreground": "아주 작게 보이는 사람 실루엣",
    "background": "거대한 자연물"
  },
  "constraints": {
    "must_feel": "작은 존재와 웅대한 자연의 대비"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "콘셉트 대형 장면 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 세계관을 한 문장으로 설명하면 구도, 조명, 색상, 비율을 자동으로 결정",
  "constraints": {
    "must_feel": "대형 화면 / 첫 공개 키 비주얼로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 전경과 배경이 같은 색으로 합쳐지지 않게 합니다.
- 조명 출처가 통일되지 않게 하지 않습니다.
- 보조 세부 요소를 너무 많이 넣지 않습니다.
- 세계관의 규모감을 해치도록 인물을 건물보다 크게 만들지 않습니다.
- 주색을 네 가지 넘게 사용하지 않습니다.
