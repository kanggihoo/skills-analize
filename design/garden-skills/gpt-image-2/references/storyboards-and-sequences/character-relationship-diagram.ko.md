# 인물 관계도 템플릿

이 문서는 "작품 / 조직을 바탕으로 캐릭터 관계도"를 만들 때 사용합니다.

- 애니메이션 / 영화 / 소설 인물 관계도
- 회사 / 조직 구성원 관계도
- 역사적 사건 참여자 관계도
- 팀 / 파벌 관계도

특징:

- 여러 캐릭터 카드(아바타 + 이름 + 태그)
- 관계 유형에 따라 색상 / 선 스타일을 다르게 사용
- 시각적 위계가 명확함(주인공은 크게, 조연은 작게)
- "정보 시각화 + 포스터 디자인"을 강조
- 전체적으로 절제되고 복잡하지 않음

## 적용 범위

- IP 캐릭터 관계도
- 조직 / 팀 구조도
- 역사적 사건 인물 관계도
- 소셜 미디어 교육 이미지

## 사용 시점

- 사용자가 "관계도 / 관계망 / 캐릭터 그래프 / 파벌도"를 언급할 때
- 인물 간 관계를 한 장에서 설명하고 싶을 때

다음에는 사용하지 마세요.

- 단일 KV(`anime-key-visual.md` 사용)
- 캐릭터 설정 시트(`portraits-and-characters/character-sheet.md` 사용)
- 일반 인포그래픽(`infographics/legend-heavy-infographic.md` 사용)

## 누락 정보 확인 우선순위

1. 주제(작품 / 조직)
2. 캐릭터 수(6~12명 권장)
3. 주인공은 누구인지(시각적 비중이 가장 큼)
4. 관계 유형(혈연 / 우정 / 사제 / 적대 / 동맹 / 짝사랑)
5. 스타일: 원작 화풍을 따름 / 일반적인 현대 디자인
6. 비율

## 기본 템플릿: 작품 캐릭터 관계도 포스터

📖 설명

큰 이미지 하나에 여러 캐릭터 카드를 관계망 형태로 배치합니다. 선으로 관계 유형을 구분하고 범례와 제목을 추가합니다.

📝 프롬프트

```json
{
  "type": "작품 캐릭터 관계도 포스터",
  "goal": "교육 / 팬 창작 / 입문 가이드 포스터로 사용할 수 있는 완성도 높은 캐릭터 관계도 생성",
  "ip": {
    "name": "{argument name=\"ip name\" default=\"귀멸의 칼날\"}",
    "tone": "{argument name=\"ip tone\" default=\"원작 화풍과 조화되는 포스터 디자인\"}"
  },
  "characters": {
    "count": "{argument name=\"character count\" default=\"9\"}",
    "auto_select": "{argument name=\"auto select\" default=\"true\"}",
    "rule": "auto_select가 true이면 주제에 맞는 대표 캐릭터 6~12명을 자동으로 선택",
    "user_list": "{argument name=\"user list\" default=\"\"}",
    "card_design": {
      "components": ["아바타", "이름", "파벌 / 정체성 태그"],
      "shape": "{argument name=\"card shape\" default=\"모서리가 둥근 사각형\"}"
    }
  },
  "composition": {
    "structure": "{argument name=\"composition\" default=\"주인공을 중앙에 두고 동료는 양옆, 적대자는 먼 쪽에 배치\"}",
    "hierarchy": "주인공 카드가 가장 크고 주요 조연은 중간, 단역은 가장 작게 표시"
  },
  "relationships": {
    "types": [
      {"name": "혈연", "color": "짙은 빨강", "line": "실선"},
      {"name": "우정 / 동료", "color": "따뜻한 주황", "line": "실선"},
      {"name": "사제 관계", "color": "금색", "line": "이중 실선"},
      {"name": "적대", "color": "짙은 보라", "line": "지그재그 선"},
      {"name": "짝사랑", "color": "분홍", "line": "점선"},
      {"name": "동맹", "color": "초록", "line": "굵은 실선"}
    ],
    "annotation_rule": "각 연결선의 가운데에 관계를 짧게 표기"
  },
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"귀멸의 칼날 · 인물 관계도\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"한 장으로 입문하기\"}",
    "position": "상단"
  },
  "legend": {
    "enabled": "{argument name=\"legend enabled\" default=\"true\"}",
    "position": "{argument name=\"legend position\" default=\"오른쪽 아래 모서리\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"원작 화풍을 따른 캐릭터 아바타 + 현대 포스터 레이아웃\"}",
    "color_palette": "{argument name=\"color palette\" default=\"원작의 주요 색상을 참고\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "주인공을 가장 큰 시각 요소로 표현",
      "관계선이 교차하거나 복잡하게 얽히지 않음",
      "모든 캐릭터 이름이 선명하고 읽기 쉬움",
      "범례와 관계 유형이 정확히 대응"
    ],
    "avoid": [
      "인물이 너무 많아 정보 과부하가 생김(15명 초과)",
      "선 스타일 6종 초과",
      "색상 8종 초과",
      "저렴한 흐름도처럼 보임"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주제, 캐릭터 수
- 기본값 지정 가능: 관계 유형, 레이아웃, 범례, 스타일
- 무작위 지정 가능: 배경 질감

### 자동 완성 전략

- 사용자가 주제를 주면 대표 캐릭터와 관계 유형을 자동으로 선택합니다.
- 기본은 주인공 중앙 구도입니다.
- 기본 관계 유형은 6개이며 필요에 따라 줄입니다.

## 변형 1: 조직 / 팀 구조도

📝 프롬프트

```json
{
  "type": "조직 / 팀 구조도",
  "ip": {
    "name": "{argument name=\"organization\" default=\"한 AI 스타트업\"}",
    "tone": "현대적인 기업 포스터"
  },
  "composition": {
    "structure": "피라미드형: 맨 위에 CEO + 가운데 임원 + 아래쪽에 일반 직원"
  },
  "relationships": {
    "types": [
      {"name": "보고 체계", "color": "회색", "line": "실선"},
      {"name": "협업", "color": "파랑", "line": "점선"}
    ]
  },
  "constraints": {
    "must_feel": "전문적이며 공개 가능한 완성도"
  }
}
```

## 변형 2: 역사적 사건 참여자 관계도

📝 프롬프트

```json
{
  "type": "역사적 사건 참여자 관계도",
  "ip": {
    "name": "{argument name=\"event\" default=\"삼국지 적벽대전\"}",
    "tone": "역사 일러스트 + 포스터 디자인"
  },
  "composition": {
    "structure": "세 파벌 대치: 조조 진영 / 손권 진영 / 유비 진영"
  },
  "constraints": {
    "must_feel": "교과서와 포스터의 중간"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "캐릭터 관계도 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 주제(작품 / 조직 / 사건)를 주면 인물 + 관계 + 스타일 + 범례를 자동 선택",
  "constraints": {
    "must_feel": "한 장으로 작품에 입문할 수 있는 수준"
  }
}
```

## 피해야 할 사항

- 캐릭터를 15명 넘게 넣지 않습니다.
- 선 스타일을 6종 넘게 사용하지 않습니다.
- 모든 선이 거미줄처럼 교차하지 않게 합니다(읽기 순서가 분명해야 함).
- 공식 포스터 레이아웃을 단순 복제하지 않습니다.
- 라벨 글자를 캐릭터 이름보다 작게 만들지 않습니다.
- 범례를 빼먹지 않습니다.
