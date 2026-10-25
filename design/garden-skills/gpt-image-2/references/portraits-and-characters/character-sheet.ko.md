# 캐릭터 설정 / 삼면도 템플릿

이 문서는 "캐릭터 전체 설정 페이지 / 삼면도 / 표정 모음 / 액세서리 모음" 시각물을 만들 때 사용합니다.

- 애니메이션 / 게임 캐릭터 설정
- IP 캐릭터 설정
- 만화 주인공 설정
- 2차 창작 캐릭터 설정
- 브랜드 마스코트 설정

특징:

- 한 페이지에서 여러 시점 / 자세를 보여 줍니다.
- 색상 / 의상 세부 사항 / 주요 치수를 표시합니다.
- 그리드 형식으로 배치합니다.
- 애니메이션 스튜디오의 설정 시트와 비슷합니다.

## 적용 범위

- 캐릭터 삼면도(앞 / 옆 / 뒤)
- 표정 9분할
- 의상 변형
- 액세서리 / 무기 모음

## 사용 시점

- 사용자가 "캐릭터 설정 / 삼면도 / 설정 시트 / 표정 모음 / 캐릭터 시트"를 언급할 때
- 캐릭터 하나의 전체 디자인을 이미지 한 장에 보여 주길 원할 때

다음에는 사용하지 마세요.

- 인물 초상화 한 장(`professional-portrait.md` / `founder-portrait.md` 사용)
- 버추얼 호스트 개인 카드(`virtual-host.md` 사용)

## 누락 정보 확인 우선순위

1. 캐릭터 이름 / 콘셉트
2. 스타일: 애니메이션 / 3D 카툰 / 실사 / 픽셀
3. 성별 / 나이 / 인종
4. 의상 스타일
5. 시트 유형: 삼면도 / 표정 모음 / 의상 변형 / 종합
6. 설명 라벨과 색상 팔레트가 필요한지 여부

## 기본 템플릿: 종합 캐릭터 설정 시트

📖 설명

4:3 또는 3:4 크기의 큰 이미지에 삼면도(앞 / 옆 / 뒤), 표정 9분할, 의상과 액세서리 클로즈업, 색상 팔레트를 담습니다.

📝 프롬프트

```json
{
  "type": "종합 캐릭터 설정 시트",
  "goal": "애니메이션 / 게임 / IP 프로젝트 기획에 바로 사용할 수 있는 종합 캐릭터 설정 시트를 생성",
  "character": {
    "name": "{argument name=\"character name\" default=\"서백·노나\"}",
    "concept": "{argument name=\"character concept\" default=\"겨울을 지키는 파수꾼, 외롭지만 굳은 의지를 지님\"}",
    "art_style": "{argument name=\"art style\" default=\"애니메이션 + 반실사\"}",
    "gender": "{argument name=\"gender\" default=\"소녀\"}",
    "age_setting": "{argument name=\"age setting\" default=\"18세\"}"
  },
  "sections": {
    "three_view": {
      "enabled": "{argument name=\"three view enabled\" default=\"true\"}",
      "items": ["전신 정면", "전신 측면", "전신 후면"],
      "annotations": ["머리색", "눈동자 색", "의상의 층", "액세서리"]
    },
    "expression_grid": {
      "enabled": "{argument name=\"expression grid enabled\" default=\"true\"}",
      "count": "{argument name=\"expression count\" default=\"9\"}",
      "items": ["미소", "활짝 웃음", "수줍음", "화남", "서운함", "놀람", "진지함", "혼란스러움", "잠든 얼굴"]
    },
    "outfit_variants": {
      "enabled": "{argument name=\"outfit variants enabled\" default=\"true\"}",
      "count": "{argument name=\"outfit count\" default=\"3\"}",
      "items": [
        "{argument name=\"outfit 1\" default=\"일상용 고딕 원피스\"}",
        "{argument name=\"outfit 2\" default=\"전투복: 은색 갑옷\"}",
        "{argument name=\"outfit 3\" default=\"평상복: 스웨터 + 롱스커트\"}"
      ]
    },
    "props_and_weapons": {
      "enabled": "{argument name=\"props enabled\" default=\"true\"}",
      "items": ["{argument name=\"prop 1\" default=\"빙정 지팡이\"}", "{argument name=\"prop 2\" default=\"눈송이 펜던트\"}"]
    },
    "color_palette": {
      "enabled": "{argument name=\"palette enabled\" default=\"true\"}",
      "main": "{argument name=\"palette main\" default=\"얼음 파랑 / 달빛 흰색 / 은회색\"}",
      "accent": "{argument name=\"palette accent\" default=\"연한 분홍색\"}"
    }
  },
  "layout": {
    "background": "{argument name=\"background\" default=\"설정 시트처럼 깔끔한 미색 그리드 배경\"}",
    "grid": "시트를 가는 선으로 구역 분리하고 각 구역에 제목 + 라벨 추가"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"4:3\"}",
  "constraints": {
    "must_keep": [
      "삼면도의 비율을 엄격하게 일치",
      "표정은 얼굴형을 유지하고 표정만 변경",
      "의상 변형에서도 같은 외모 유지",
      "색상 팔레트가 캐릭터의 실제 색상과 일치"
    ],
    "avoid": [
      "삼면도의 캐릭터가 서로 다른 사람처럼 보임",
      "표정 9분할에 같은 표정이 반복됨",
      "설명선이 교차함",
      "배경이 주의를 빼앗음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 캐릭터 이름, 스타일, 성별, 콘셉트
- 기본값 지정 가능: 시트 구성, 배경, 레이아웃
- 무작위 지정 가능: 표정 종류, 액세서리 형태

### 자동 완성 전략

- IP 유형에 따라 스타일을 자동 선택합니다(소녀는 애니메이션 / 남성은 실사 / 마스코트는 3D).
- 기본적으로 삼면도 + 표정 9분할 + 색상 팔레트를 포함합니다.
- 설명이 없으면 무기를 넣지 않습니다.

## 변형 1: 표정 9분할만 포함

📝 프롬프트

```json
{
  "type": "캐릭터 표정 9분할 시트",
  "sections": {
    "three_view": { "enabled": false },
    "expression_grid": { "enabled": true, "count": 9 },
    "outfit_variants": { "enabled": false }
  },
  "constraints": {
    "must_feel": "메신저 이모티콘 / 라이브 방송 표정 리소스로 사용할 수 있어야 함"
  }
}
```

## 변형 2: 의상 변형 모음

📝 프롬프트

```json
{
  "type": "캐릭터 의상 변형 시트",
  "sections": {
    "three_view": { "enabled": false },
    "expression_grid": { "enabled": false },
    "outfit_variants": { "enabled": true, "count": 5 }
  },
  "constraints": {
    "must_feel": "의상 기획 시안으로 사용할 수 있어야 함"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "캐릭터 설정 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 콘셉트 한 줄을 제시하면 전체 설정(시점, 표정, 의상, 색상)을 자동 생성",
  "constraints": {
    "must_feel": "프로젝트 기획 자료로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 삼면도의 비율을 다르게 만들지 않습니다(가장 흔한 오류입니다).
- 표정 9분할에 같은 표정이 반복되지 않게 합니다.
- 설정 시트의 배경에 복잡한 장면을 추가하지 않습니다.
- 설명 라벨이 캐릭터의 몸을 가리지 않게 합니다.
- 저작권이 있는 실제 캐릭터를 참고 대상으로 사용하지 않습니다.
