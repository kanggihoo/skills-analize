# 벤토 그리드 / 모듈형 인포그래픽 템플릿

이 문서는 "벤토 그리드 / Bento grid / 고밀도 모듈형" 인포그래픽을 만들 때 사용합니다.

- 샤오홍슈용 "고밀도 정보 이미지"(실수 방지 가이드 / 완벽한 안내서 / 다각도 리뷰)
- 공식 계정 / Notion 스타일 지식 카드
- 제품 기능 개요 이미지
- 다각도 리뷰 / 여러 SKU 비교를 한 이미지에 정리
- 연말 결산 / 분기 리뷰 대시보드

특징:

- 크기가 다른 직사각형 모듈 6~9개로 구성합니다(Apple iOS 위젯 배치와 유사).
- 각 모듈은 독립적인 정보 단위 하나(데이터 묶음 / 스크린샷 하나 / 핵심 항목 하나)를 담습니다.
- 큰 모듈은 시각적 기준점 역할을 하고 작은 모듈은 세부 정보를 보완합니다.
- 모듈의 모서리 반경을 통일하고 여백을 절제해 정보 밀도를 높입니다.
- 전체 색상을 통일하고 색상 면으로 모듈의 기능을 구분합니다.

## 적용 범위

- 고밀도 지식 / 실용 정보 / 가이드 이미지
- 여러 모듈을 사용한 제품 소개 이미지
- 다각도 리뷰 이미지
- 연간 / 분기 리뷰 이미지
- Notion / 대시보드 스타일 시각물

## 사용 시점

- 사용자가 "bento / 벤토 그리드 / 위젯 / 모듈형 / 고밀도 정보 이미지 / 한 장으로 정리 / 유용한 팁 이미지 / Notion 스타일"을 언급할 때
- 여러 측면을 이미지 한 장에서 명확히 설명하고 싶어 할 때
- Apple Newsroom / iOS 위젯 / Notion 대시보드 같은 시각 스타일을 원할 때

다음에는 사용하지 마세요.

- 단일 주제 인포그래픽을 원하는 경우(`infographics/legend-heavy-infographic.md` 사용)
- 손그림 / 노트 스타일을 원하는 경우(`infographics/hand-drawn-infographic.md` 사용)
- 단계별 절차를 원하는 경우(`infographics/step-by-step-infographic.md` 사용)
- 기술 아키텍처 다이어그램을 원하는 경우(`technical-diagrams/system-architecture.md` 사용)

## 누락 정보 확인 우선순위

1. 주제(예: "2026년에 살 가치가 있는 국산 카메라 8종")
2. 모듈 수(6 / 8 / 9, 8개 권장)
3. 메인 제목 + 부제
4. 색상 방향(미니멀한 흑백 / 모란디 / Apple식 연회색 / 다크 테크 / 따뜻한 색)
5. 비율(샤오홍슈 3:4 / 공식 계정 16:9 / 1:1)
6. "대표 추천 / TOP 1"을 위한 특별 강조 모듈이 필요한지 여부

## 기본 템플릿: 벤토 그리드 고밀도 인포그래픽

📖 설명

하나의 이미지를 크기가 서로 다른 둥근 직사각형 모듈 6~9개로 나눕니다. 전체 배치는 iOS 위젯 화면처럼 보이며 각 모듈은 독립적인 정보 단위를 담당합니다.

📝 프롬프트

```json
{
  "type": "벤토 그리드 / 고밀도 모듈형 인포그래픽",
  "goal": "Apple Newsroom / iOS 위젯 / Notion 대시보드 같은 다중 모듈 인포그래픽을 생성해 여러 측면을 한 이미지에서 설명",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"3:4 세로형\"}",
    "background": "{argument name=\"background\" default=\"따뜻한 미색 #F5F2EC\"}",
    "global_corner_radius": "{argument name=\"global_corner_radius\" default=\"24px\"}",
    "module_gap": "{argument name=\"module_gap\" default=\"16px\"}"
  },
  "header": {
    "main_title": "{argument name=\"main_title\" default=\"2026년에 살 가치가 있는 국산 카메라 8종\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"풀프레임 / APS-C / 동영상용 / 레트로 카메라를 한눈에\"}",
    "title_position": "왼쪽 위, 크고 굵은 산세리프체"
  },
  "palette": {
    "primary": "{argument name=\"primary\" default=\"짙은 먹색 #1A1A1A\"}",
    "accent": "{argument name=\"accent\" default=\"주홍색 #E94B3C\"}",
    "module_tints": [
      "부드러운 모래색 #EBE3D5",
      "차분한 세이지 그린 #C7D3C0",
      "더스티 블루 #B4C5D6",
      "따뜻한 복숭아색 #F2D4C4"
    ],
    "rule": "모듈 배경은 색조를 번갈아 사용하고, 주색은 텍스트에 사용하며, 강조색은 최대 두 번 사용"
  },
  "layout": {
    "style": "{argument name=\"layout_style\" default=\"비대칭 벤토 그리드\"}",
    "module_count": "{argument name=\"module_count\" default=\"8\"}",
    "grid": "불규칙 배치: 대형 히어로 모듈 1개(2x2 공간) + 1x1 / 1x2 / 2x1 크기가 섞인 보조 모듈 4~7개",
    "alignment": "모든 모듈의 모서리 반경과 간격을 통일하고 모듈 가장자리는 보이지 않는 그리드에 정렬"
  },
  "modules": [
    {
      "id": "M1-hero",
      "size": "large (2x2)",
      "role": "TOP 1 / 대표 추천",
      "content": "표지 수준의 소개: 큰 이미지 + 추천 이유 + ★★★★★ 평점 + 간단한 사양"
    },
    {
      "id": "M2",
      "size": "medium (1x2)",
      "role": "비교 기준 1",
      "content": "예: '무게 비교': 막대 차트 + 숫자 라벨 + 1위 항목 강조"
    },
    {
      "id": "M3",
      "size": "small (1x1)",
      "role": "핵심 수치",
      "content": "큰 숫자 하나 + 짧은 설명. 예: '8대', '¥4,999부터'"
    },
    {
      "id": "M4",
      "size": "small (1x1)",
      "role": "아이콘 설명",
      "content": "간결한 아이콘 4~6개 + 매우 짧은 라벨(예: '사용 장면')"
    },
    {
      "id": "M5",
      "size": "medium (2x1)",
      "role": "순위 / 목록",
      "content": "1/2/3 큰 숫자 배지가 앞에 붙은 TOP 3 텍스트 목록"
    },
    {
      "id": "M6",
      "size": "small (1x1)",
      "role": "인용 / 장점",
      "content": "인상적인 문구 한 줄 / KOL 인용 + 따옴표 장식"
    },
    {
      "id": "M7",
      "size": "medium (1x2)",
      "role": "세부 사항",
      "content": "제품 부분 클로즈업 + 콜아웃 라벨 1~2개"
    },
    {
      "id": "M8",
      "size": "small (1x1)",
      "role": "하단 / 안내",
      "content": "'다음 페이지로 넘기기 →' / QR 코드 / 출처 표기"
    }
  ],
  "module_internal_style": {
    "padding": "각 모듈 안쪽 패딩 16~24px",
    "typography": "산세리프체(Inter / Helvetica Neue / Source Han Sans). 모듈 제목은 굵게, 본문은 더 작게",
    "rule": "각 모듈은 독립적으로 완결되어 단독으로도 이해 가능해야 함",
    "imagery": "작은 제품 사진 / 아이콘 / 미니 차트 사용. 모듈 전체를 텍스트만으로 채우지 않음"
  },
  "constraints": {
    "must_keep": [
      "모든 모듈의 모서리 반경을 통일",
      "모듈 사이에 일정한 간격 유지",
      "모든 모듈에 자체 미니 제목 포함",
      "시각화된 데이터(chart / 큰 숫자)를 포함한 모듈이 최소 하나 있어야 함",
      "이미지 전체의 주색은 5가지 이하"
    ],
    "avoid": [
      "모든 모듈 크기를 동일하게 만들어 표처럼 보이게 함",
      "모듈을 붙여 배치해 여백을 없앰",
      "모듈 안의 정보가 너무 적어 빈 위젯처럼 보임",
      "2px를 초과하는 두꺼운 모듈 테두리",
      "그라데이션 / 유리 효과 블러로 벤토의 미니멀한 느낌을 해침"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `main_title`, `module_count`
- **기본값 지정 가능**: `aspect_ratio`(3:4), `palette`(따뜻한 미색 + 주홍색 강조), `global_corner_radius`, `module_gap`
- **무작위 지정 가능**: `module_tints`의 구체적인 순서, 각 모듈의 구체적인 내용(사용자가 지정하지 않으면 주제에서 자동 추론)

### 자동 완성 전략

- 사용자가 주제만 제시하면 모듈 8개를 기본으로 정하고 역할을 추론합니다(TOP 1 / 핵심 수치 / 아이콘 / 순위 / 장점 / 세부 사항 / 하단 안내).
- 사용자가 "샤오홍슈 스타일"을 원하면 따뜻한 미색 + 따뜻한 강조색 팔레트와 3:4 비율을 선택합니다.
- 사용자가 "기술 / 디지털 스타일"을 원하면 짙은 회색 + 네온 강조색 팔레트를 선택하고 비율은 1:1 또는 3:4로 합니다.
- 사용자가 "금융 / 진중한 스타일"을 원하면 단색 + 짙은 강조색 하나를 선택하고 16:9 비율로 합니다.

## 변형 1: iOS 위젯 화면 스타일

```json
{
  "modify": {
    "background": "iOS 시스템 배경화면 그라데이션(짙은 파랑·보라 → 검정)",
    "module_backgrounds": "반투명 유리 + 옅은 윤곽선",
    "module_corner_radius": "32px(더 둥글게)",
    "typography": "SF Pro Display + SF Symbols 스타일 아이콘",
    "vibe": "iPhone 홈 화면을 캡처한 뒤 위젯을 정보로 가득 채운 듯한 느낌"
  }
}
```

적합: 디지털 기기 / 앱 추천 / 제품 소개.

## 변형 2: Notion 대시보드 스타일

```json
{
  "modify": {
    "background": "순백색 #FFFFFF",
    "module_backgrounds": "아주 옅은 회색 #F7F6F3 + 1px 연회색 테두리",
    "module_corner_radius": "8px(각진 느낌)",
    "module_padding": "더 넉넉하게",
    "typography": "Inter / Söhne, 가는 글자 굵기 중심",
    "vibe": "미니멀하고 절제된 Notion 페이지 스크린샷 같은 느낌"
  }
}
```

적합: 지식 관리, 생산성, SaaS 도구 소개.

## 변형 3: 고밀도 샤오홍슈 "실수 방지 가이드" 스타일

```json
{
  "modify": {
    "module_count": "9-12",
    "background": "따뜻한 크림색 + 입자감 있는 종이 질감",
    "module_tints": ["민트", "복숭아색", "라벤더", "레몬색"],
    "accent": "'⚠️ 실수 방지' 라벨에 토마토 빨강 사용",
    "typography": "친근한 느낌을 더하도록 둥근 글꼴 / 손글씨체를 약간 사용",
    "vibe": "정보를 빽빽하게 담고, 더 선명한 색을 사용하며, 이모지 / 라벨을 포함"
  }
}
```

적합: 샤오홍슈 실수 방지 가이드, 초보자 안내, 필수 체크리스트.

## 피해야 할 사항

- 모듈 크기가 모두 같으면 일반 그리드 표가 되어 벤토의 "중요도 차이"가 사라집니다.
- 모듈에 미니 제목이 없으면 "독립 정보 단위"라는 의미가 사라집니다.
- 이미지 전체가 텍스트 모듈로만 구성되면 시각적 임팩트가 약해집니다.
- 모듈 사이 여백이 없거나 일정하지 않으면 화면이 산만해집니다.
- 주색을 5가지 넘게 사용하면 전체 통일감이 무너집니다.
- 내용이 빈 히어로 모듈을 장식용으로 억지로 넣으면 시각적 비중을 낭비합니다.
- 모듈 테두리가 2px를 넘으면 벤토가 아니라 스프레드시트처럼 보입니다.
