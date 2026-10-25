# 여행 경로 지도 템플릿

이 문서는 "여행 경로 하나 / 일정 하나"를 지도 형태로 시각화할 때 사용합니다. 대표적인 용도:

- 자동차 / 자전거 / 도보 경로 추천 이미지
- 여러 날 일정 가이드 대표 이미지
- 도시 간 여행 가이드
- 소셜 미디어용 여행 콘텐츠 표지
- 여행 브랜드 행사 시각물

## 적용 범위

- 여러 날 일정(D1-D7)
- 도시 간 경로 지도
- 하루 시티워크 경로 지도
- 야외 하이킹 / 자전거 경로 지도
- 테마 여행 경로(벚꽃, 온천, 포켓몬 촬영지 등)

## 사용 시점

- 사용자가 "경로 지도 / 일정 지도 / 여행 가이드 이미지 / 자동차 여행 경로"를 언급할 때
- 위치 밀도보다 "순서 + 시간"을 시각적으로 강조하고 싶을 때

다음에는 사용하지 마세요.

- 맛집 지도(`food-map.md` 사용)
- 도시 풍경 지도(`illustrated-city-map.md` 사용)

## 누락 정보 확인 우선순위

1. 출발지 / 목적지 / 경유 도시
2. 여행 일수
3. 주제(음식, 자연, 문화, 가족 여행, 예술)
4. 이동 수단(자동차 / 고속철도 / 비행기 / 도보 / 자전거)
5. 스타일: 레트로 손그림 / 현대 평면 / 귀여운 스타일
6. 일별 주요 내용 목록이 필요한지 여부

## 기본 템플릿: 여러 날 여행 경로 지도

📖 설명

여러 도시나 명소를 컬러 실선 / 점선으로 지도 위에 연결하고 D1-Dn 번호를 붙입니다. 각 경유지에 작은 일러스트를 넣고 아래쪽 또는 옆 열에 매일의 주요 일정을 나열합니다.

📝 프롬프트

```json
{
  "type": "여행 경로 지도",
  "goal": "여러 날 일정을 시각화한 경로 지도를 생성합니다. 여행 가이드 / 축제 캠페인 대표 이미지로 사용할 수 있습니다.",
  "style": "{argument name=\"art style\" default=\"레트로 손그림 + 수채화 + 베이지색 양피지 배경\"}",
  "title_section": {
    "title_text": "{argument name=\"title\" default=\"일본 간사이 7일 심층 여행\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"D1-D7 음식 + 문화 + 자연 코스\"}"
  },
  "route": {
    "transport": "{argument name=\"transport\" default=\"고속철도 + 도보\"}",
    "stops": [
      "{argument name=\"stop 1\" default=\"D1 오사카: 도톤보리 야경\"}",
      "{argument name=\"stop 2\" default=\"D2 교토: 기요미즈데라 + 기온\"}",
      "{argument name=\"stop 3\" default=\"D3 교토: 아라시야마 + 대나무숲\"}",
      "{argument name=\"stop 4\" default=\"D4 나라: 도다이지 + 사슴 먹이 주기\"}",
      "{argument name=\"stop 5\" default=\"D5 고베: 기타노 이진칸\"}",
      "{argument name=\"stop 6\" default=\"D6 오사카: 유니버설 스튜디오 재팬\"}",
      "{argument name=\"stop 7\" default=\"D7 오사카: 귀국 전 쇼핑\"}"
    ],
    "line_style": "{argument name=\"route line style\" default=\"빨간 점선 + 원형 노드로 연결\"}"
  },
  "stop_illustrations": "각 경유지에 도리이, 사찰, 사슴, 온천, 탑 같은 간결한 손그림 일러스트 하나를 배치",
  "side_panel": {
    "enabled": "{argument name=\"side panel enabled\" default=\"true\"}",
    "position": "{argument name=\"side panel position\" default=\"오른쪽 또는 아래쪽\"}",
    "content_type": "D1-Dn을 포함한 일별 주요 일정 목록. 매일 글머리 항목 2~3개"
  },
  "legend": {
    "items": [
      "빨간 점선: 고속철도 경로",
      "파란 실선: 도보 경로",
      "금색 별: 꼭 가야 할 명소",
      "분홍색 꽃: 인기 사진 촬영 지점"
    ]
  },
  "extras": ["레트로 나침반", "짧은 안내 문구", "은은한 무늬가 있는 테두리"],
  "constraints": {
    "must_keep": [
      "경로 순서와 번호가 일치",
      "모든 경유지에 일러스트 + 라벨 표시",
      "사이드바의 일별 주요 일정은 짧게, 3줄 이하"
    ],
    "avoid": [
      "도시 위치가 명백하게 어긋남(대략적인 지리 방향과 일치해야 함)",
      "라벨이 경로를 가림",
      "색상 채도가 지나치게 높음",
      "선 스타일을 2종류 넘게 사용"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 출발지, 목적지, 여행 일수, 주제
- 기본값 지정 가능: 스타일, 나침반, 범례
- 무작위 지정 가능: 일별 글머리 목록의 부수적인 세부 내용

### 자동 완성 전략

- 사용자가 목적지 국가만 말하면 대표 도시 5~8곳을 자동으로 선택합니다.
- 스타일에 맞는 마스코트를 자동으로 고릅니다.
- 되돌아가는 구간이 생기지 않도록 합리적인 경로 순서를 자동으로 구성합니다.
- 여행 일수 기본값은 5~7일입니다.

## 변형 1: 하루 시티워크 경로

📝 프롬프트

```json
{
  "type": "하루 시티워크 경로 지도",
  "city": "{argument name=\"city\" default=\"상하이\"}",
  "duration": "{argument name=\"duration\" default=\"반나절\"}",
  "title_text": "{argument name=\"title\" default=\"상하이 주말 시티워크 · 우캉루 일대\"}",
  "stops": [
    "{argument name=\"stop 1\" default=\"안푸루\"}",
    "{argument name=\"stop 2\" default=\"우캉루\"}",
    "{argument name=\"stop 3\" default=\"우위안루\"}",
    "{argument name=\"stop 4\" default=\"우루무치 중루\"}"
  ],
  "side_panel": {
    "enabled": true,
    "content_type": "각 지점에 추천 이유 한 문장 + 권장 방문 시간 포함"
  },
  "constraints": {
    "must_feel": "여유롭고 사진이 잘 나오며 생활감이 있는 분위기"
  }
}
```

## 변형 2: 야외 경로(하이킹 / 자전거)

📝 프롬프트

```json
{
  "type": "야외 하이킹 / 자전거 경로 지도",
  "title_text": "{argument name=\"title\" default=\"촨시 순환 코스 7일 자전거 여행\"}",
  "transport": "{argument name=\"transport\" default=\"자전거\"}",
  "stops_count": "{argument name=\"stops count\" default=\"7\"}",
  "elevation_chart": {
    "enabled": "{argument name=\"elevation chart\" default=\"true\"}",
    "position": "아래쪽"
  },
  "legend": {
    "items": [
      "실선: 주요 경로",
      "점선: 대체 경로",
      "삼각형: 캠핑 지점",
      "하트: 사진 촬영 지점"
    ]
  },
  "constraints": {
    "must_feel": "도전적이고 야외 활동 느낌이 나며 전문적이어야 함"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "여행 경로 지도 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 목적지와 여행 일수만 주면 대표 경로, 스타일, 사이드바 일정을 자동 구성",
  "constraints": {
    "must_feel": "바로 게시할 수 있는 여행 가이드 대표 이미지"
  }
}
```

## 피해야 할 사항

- 경로가 화면 경계를 넘거나 되돌아가며 겹치지 않게 합니다.
- 경유지 번호를 건너뛰지 않습니다(D1부터 Dn까지 연속이어야 함).
- 사이드바의 텍스트 밀도가 지도보다 높지 않게 합니다.
- 여러 이동 수단의 선 스타일을 혼합하지 않습니다(실선 + 점선이면 충분하며 5종류를 쓰지 않음).
- 실제 축척 지도로 그리지 않습니다. 일러스트 스타일이 무너집니다.
