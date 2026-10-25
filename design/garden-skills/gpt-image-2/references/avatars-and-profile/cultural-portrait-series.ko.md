# 문화 / 역사 인물 시리즈 초상화 템플릿

이 문서는 "문화 / 역사 / 신화 주제를 바탕으로 여러 초상화로 이루어진 시리즈를 생성"할 때 사용합니다.

- 왕조별 황제 시리즈(명나라 황제 모음 / 청나라 황제 모음)
- 신화 속 인물 시리즈(그리스 신화 / 북유럽 신화)
- 역사적 인물 시리즈
- 고전 문학 캐릭터 시리즈
- 민족 의상 시리즈

특징:

- 여러 인물을 한 명씩 각 칸에 배치합니다.
- 각 칸에 이름 / 칭호 라벨을 붙입니다.
- 같은 화가 또는 같은 시대풍 등 통일된 스타일을 사용합니다.
- 교육 / 문화 상품 / 테마 마케팅에 적합합니다.

## 적용 범위

- 왕조별 황제 / 유명 인물 시리즈
- 신화 / 문학 속 인물 시리즈
- 민족 / 문화 주제 시리즈

## 사용 시점

- 사용자가 "시리즈 / 모음 / 왕조 / 신화 / 역사적 인물"을 언급할 때
- 여러 인물과 라벨을 넣고 싶어 할 때

다음에는 사용하지 마세요.

- 한 인물의 여러 버전( `character-grid-portrait.md` 사용)
- 한 인물의 단일 스타일 변환( `style-transfer-selfie.md` 사용)
- 캐릭터 IP 설정 시트( `portraits-and-characters/character-sheet.md` 사용)

## 누락 정보 확인 우선순위

1. 주제(왕조 / 신화 / 문학 / 문화)
2. 인물 수(6~12명 권장)
3. 이름 / 칭호 / 짧은 설명을 표시할지 여부
4. 스타일: 수묵 실사화 / 유화 / 카툰 / 반실사
5. 참고할 스타일이 있는지 여부(사용자가 제공한 참고 이미지 / 고전 화가의 스타일)
6. 화면 비율

## 기본 템플릿: 왕조별 황제 초상화 시리즈

📖 설명

하나의 큰 이미지 안에 여러 황제의 초상화를 배치하고, 각 초상화 아래에 시호와 이름을 표시합니다.

📝 프롬프트

```json
{
  "type": "왕조별 황제 초상화 시리즈",
  "goal": "한 왕조의 여러 황제를 담은 시리즈 초상화 이미지를 생성합니다. 교육 자료, 문화 상품 또는 소셜 미디어 역사 콘텐츠로 사용할 수 있습니다.",
  "theme": {
    "dynasty": "{argument name=\"dynasty\" default=\"명나라\"}",
    "subject_count": "{argument name=\"subject count\" default=\"9\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"중국 전통 공필화풍의 사실적인 인물화 + 은은한 수묵 느낌\"}",
    "consistency": "모든 초상화를 동일한 화풍으로 그려야 합니다.",
    "color_palette": "{argument name=\"color palette\" default=\"채도를 낮춘 금색 + 주홍색 + 검정\"}"
  },
  "layout": {
    "format": "{argument name=\"format\" default=\"3x3 grid\"}",
    "background": "{argument name=\"background\" default=\"베이지색 비단 질감\"}",
    "panel_design": {
      "portrait_shape": "모서리가 둥근 사각형 / 타원형",
      "label_position": "초상화 아래 가운데",
      "label_content": "시호 + 이름. 예: '태조 주원장'"
    }
  },
  "subjects": {
    "auto_select": "{argument name=\"auto select\" default=\"true\"}",
    "rule": "auto_select가 true이면 왕조 순서에 따라 대표 황제를 선정합니다. 사용자가 목록을 지정하면 해당 목록을 따릅니다.",
    "user_list": "{argument name=\"user list\" default=\"\"}"
  },
  "constraints": {
    "must_keep": [
      "모든 초상화의 화풍을 동일하게 유지",
      "의상과 장신구가 해당 왕조 시대에 정확히 부합",
      "라벨이 읽기 쉽고 역사적으로 정확",
      "초상화를 균등하게 배치"
    ],
    "avoid": [
      "다른 왕조의 의상이 등장함",
      "초상화마다 화풍이 달라짐(각기 다른 화가가 그린 듯한 모습)",
      "라벨 오기 / 잘못된 위치",
      "배경을 과도하게 장식함"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주제, 인물 수
- 기본값 지정 가능: 스타일, 레이아웃, 색상 팔레트, 라벨
- 무작위 지정 가능: 배경 질감의 세부 요소

### 자동 완성 전략

- 사용자가 왕조를 제시하면 대표 황제 9명을 자동으로 선정합니다.
- 기본 스타일은 중국 공필화입니다.
- 기본 라벨은 "시호 + 이름"입니다.

## 변형 1: 신화 속 인물 시리즈

📝 프롬프트

```json
{
  "type": "신화 속 인물 초상화 시리즈",
  "theme": {
    "mythology": "{argument name=\"mythology\" default=\"그리스 신화\"}",
    "subject_count": 12
  },
  "style": {
    "art_style": "고전 유화 + 임파스토 기법",
    "color_palette": "짙은 파랑 + 금색 + 따뜻한 갈색"
  },
  "layout": {
    "format": "4x3 grid",
    "panel_design": {
      "label_content": "신의 이름 + 관장하는 영역"
    }
  },
  "subjects": {
    "user_list": "제우스 / 헤라 / 포세이돈 / 하데스 / 아테나 / 아폴론 / 아르테미스 / 아레스 / 아프로디테 / 헤르메스 / 헤파이스토스 / 디오니소스"
  },
  "constraints": {
    "must_feel": "고전 유화가 전시된 미술관의 소장품 같은 분위기"
  }
}
```

## 변형 2: 고전 문학 인물 시리즈

📝 프롬프트

```json
{
  "type": "고전 문학 인물 시리즈",
  "theme": {
    "literature": "{argument name=\"literature\" default=\"홍루몽의 금릉십이채\"}",
    "subject_count": 12
  },
  "style": {
    "art_style": "정교한 채색 공필화 + 고전풍 일러스트",
    "color_palette": "연지색 + 달빛 흰색 + 비취색"
  },
  "constraints": {
    "must_feel": "고전 문학 화보집 수준"
  }
}
```

## 변형 3: 민족 의상 시리즈

📝 프롬프트

```json
{
  "type": "민족 의상 초상화 시리즈",
  "theme": {
    "subject_count": 9,
    "category": "{argument name=\"category\" default=\"중국 56개 민족을 대표하는 9개 민족\"}"
  },
  "style": {
    "art_style": "고해상도 실사 인물 사진 + 스튜디오 촬영",
    "color_palette": "각 민족 의상의 고유 색상을 유지"
  },
  "constraints": {
    "must_feel": "문화를 존중하고 의상을 정확하게 표현"
  }
}
```

## 변형 4: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "문화 인물 시리즈 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 문화 주제를 하나 제시하면 인물 목록, 스타일, 레이아웃, 라벨을 자동으로 선정",
  "constraints": {
    "must_feel": "교과서 수준 / 문화 상품으로 바로 공개할 수 있는 완성도"
  }
}
```

## 피해야 할 사항

- 왕조별 의상을 혼동하지 않습니다(가장 흔한 오류입니다).
- 화풍이 달라지지 않게 합니다(시리즈 전체가 통일되어야 합니다).
- 문화적으로 민감한 주제에 익살스러운 표정을 사용하지 않습니다.
- 신을 코스프레처럼 묘사하지 않습니다.
- 라벨을 틀리거나 빠뜨리지 않습니다.
- 한 칸에 인물을 12명 넘게 넣지 않습니다. 이미지가 산만해집니다.
