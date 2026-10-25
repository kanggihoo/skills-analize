# 레트로 스큐어모픽 아이콘 세트 템플릿

이 파일은 “세트형 아이콘 / 스큐어모픽 / Y2K / 레트로” 아이콘 이미지를 만들 때 사용합니다.

- 스큐어모픽 앱 아이콘 세트
- Y2K 스타일 크리스털 아이콘
- 픽셀 / 레트로 게임 아이콘
- 테마 아이콘 팩(생활 / 업무 / 여행)
- UI 아이콘 시스템

특징:

- 여러 아이콘을 하나의 일관된 스타일로 구성
- 보통 6 / 8 / 12 / 16개
- 각 아이콘은 둥근 사각형 / 원형 형태
- 재질감(유리 / 금속 / 스큐어모픽)을 강조
- 앱 아이콘 팩 / 아이콘 세트로 사용하기 적합

## 적용 범위

- 앱 아이콘 세트
- 테마 아이콘 팩
- UI 아이콘 시스템
- 굿즈용 스티커 / 카드

## 사용 시점

- 사용자가 “아이콘 / icon set / 스큐어모픽 / skeuomorphic / Y2K / 픽셀 아이콘”을 언급할 때
- 사용자가 통일된 아이콘 세트를 원할 때

다음에는 사용하지 마세요.

- 단일 3D 아이콘 아바타 → `avatars-and-profile/themed-3d-icon.md` 사용
- 스티커 세트 → `avatars-and-profile/sticker-set.md` 사용
- 범용 브랜드 아이덴티티 → `branding-and-packaging/brand-identity-board.md` 사용

## 누락된 정보가 있을 때 우선 질문할 항목

1. 스타일(스큐어모픽 / Y2K / 픽셀 / Flat / Glass / Clay)
2. 아이콘 주제(앱 / 업무 / 생활 / 여행)
3. 아이콘 개수(6 / 8 / 12 / 16)
4. 주요 색상 1~2개
5. 기본 형태(둥근 사각형 / 원형 / 자유 형태)
6. 텍스트 레이블을 넣을지 여부

## 기본 템플릿: 스큐어모픽 앱 아이콘 세트

📖 설명

한 장의 이미지에 N개의 스큐어모픽 아이콘을 일관된 스타일로 만들어 격자 형태로 배치합니다.

📝 프롬프트

```json
{
  "type": "스큐어모픽 앱 아이콘 세트",
  "goal": "아이콘 팩 / 테마 팩으로 사용할 수 있도록 일관된 스타일의 아이콘 세트를 생성합니다.",
  "theme": "{argument name=\"theme\" default=\"클래식 오피스 앱\"}",
  "style": {
    "rendering": "{argument name=\"rendering\" default=\"스큐어모픽 3D + 부드러운 조명 + 은은한 그림자\"}",
    "material": "{argument name=\"material\" default=\"유리 질감 + 은은한 반사광\"}",
    "color_palette": "{argument name=\"color palette\" default=\"미색 + 따뜻한 주황색 + 연한 파랑 + 회색\"}",
    "shape_base": "{argument name=\"shape base\" default=\"둥근 사각형(모서리 반경 24%)\"}"
  },
  "layout": {
    "grid": "{argument name=\"grid\" default=\"4x3\"}",
    "icon_count": "{argument name=\"icon count\" default=\"12\"}",
    "spacing": "16px",
    "background": "{argument name=\"background\" default=\"베이지색 종이 질감\"}",
    "label_below": "{argument name=\"label below\" default=\"true\"}",
    "label_style": "가는 회색 산세리프 소문자"
  },
  "icons": [
    {"id": 1, "concept": "{argument name=\"icon 1\" default=\"메일 - 봉투 + 빛나는 알림 표시\"}", "label": "Mail"},
    {"id": 2, "concept": "{argument name=\"icon 2\" default=\"달력 - 펼쳐진 페이지 + 빨간색 오늘 표시\"}", "label": "Calendar"},
    {"id": 3, "concept": "{argument name=\"icon 3\" default=\"메모 - 노란 메모지 + 빨간 책갈피\"}", "label": "Notes"},
    {"id": 4, "concept": "{argument name=\"icon 4\" default=\"카메라 - 레트로 필름 카메라\"}", "label": "Camera"},
    {"id": 5, "concept": "{argument name=\"icon 5\" default=\"음악 - 바이닐 레코드\"}", "label": "Music"},
    {"id": 6, "concept": "{argument name=\"icon 6\" default=\"지도 - 접힌 지도 + 빨간 핀\"}", "label": "Maps"},
    {"id": 7, "concept": "{argument name=\"icon 7\" default=\"날씨 - 태양 + 구름\"}", "label": "Weather"},
    {"id": 8, "concept": "{argument name=\"icon 8\" default=\"계산기 - 숫자 버튼\"}", "label": "Calc"},
    {"id": 9, "concept": "{argument name=\"icon 9\" default=\"시계 - 둥근 시계판\"}", "label": "Clock"},
    {"id": 10, "concept": "{argument name=\"icon 10\" default=\"설정 - 톱니바퀴\"}", "label": "Settings"},
    {"id": 11, "concept": "{argument name=\"icon 11\" default=\"건강 - 하트 모양 심전도 선\"}", "label": "Health"},
    {"id": 12, "concept": "{argument name=\"icon 12\" default=\"지갑 - 갈색 가죽 지갑\"}", "label": "Wallet"}
  ],
  "constraints": {
    "must_keep": [
      "아이콘 12개의 스타일을 엄격하게 통일(같은 조명, 같은 모서리 형태, 같은 두께)",
      "팔레트는 6색 이하",
      "레이블 글꼴을 통일",
      "각 아이콘을 개별적으로 알아볼 수 있어야 함"
    ],
    "avoid": [
      "아이콘 스타일이 달라지는 것(일부는 스큐어모픽, 일부는 플랫 스타일)",
      "색상이 6개를 초과하는 것",
      "아이콘 내부에 세부 요소를 지나치게 많이 넣는 것",
      "레이블 오타"
    ]
  }
}
```

### 매개변수 전략

- 필수 질문: 주제, 개수, 스타일
- 기본값 사용 가능: 레이아웃, 색상, 기본 형태
- 무작위 선택 가능: 각 아이콘의 구체적인 디자인

### 자동 완성 전략

- 사용자가 주제와 개수를 알려주면 각 아이콘의 구체적인 이미지를 자동으로 구성합니다.
- 기본 격자는 4×3, 총 12개
- 기본 스타일은 스큐어모픽 3D + 유리 질감

## 변형 1: Y2K 크리스털 아이콘 팩

📝 프롬프트

```json
{
  "type": "Y2K 크리스털 아이콘 팩",
  "style": {
    "material": "투명 크리스털 + 굴절광",
    "color_palette": "채도 높은 분홍색 + 청보라색 + 은색"
  },
  "constraints": {
    "must_feel": "Y2K Aero 스타일"
  }
}
```

## 변형 2: 픽셀 레트로 게임 아이콘

📝 프롬프트

```json
{
  "type": "픽셀 레트로 게임 아이콘",
  "style": {
    "rendering": "16비트 픽셀 + 선명한 가장자리",
    "color_palette": "16색 레트로 게임 팔레트"
  },
  "constraints": {
    "must_feel": "FC / SNES 시대"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "아이콘 팩 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 주제를 주면 아이콘 개수, 스타일, 색상, 레이아웃을 자동으로 정합니다.",
  "constraints": {
    "must_feel": "아이콘 팩으로 출시할 수 있는 품질"
  }
}
```

## 피해야 할 사항

- 아이콘 스타일이 달라지지 않게 하세요.
- 팔레트는 6색을 넘지 않게 하세요.
- 레이블 글꼴은 한 종류만 사용하세요.
- 아이콘 하나에 요소를 3개 넘게 넣지 마세요.
- 격자 간격과 크기가 일정하지 않게 하지 마세요.
- 아이콘과 배경의 대비가 부족하지 않게 하세요.
