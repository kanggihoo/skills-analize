# 매장 분포 지도 템플릿

이 문서는 "특정 지역 내 브랜드 / 외식 / 소매 매장 분포"를 시각화하는 지도를 만들 때 사용합니다.

- 체인 브랜드 매장 분포
- 가맹점 모집 지도
- 도시 / 상권 매장 커버리지
- 축제 행사에서 이용할 수 있는 매장 표시
- 은행 / 충전소 / 공유 시설 분포

## 적용 범위

- 전국 / 도 / 시 단위 매장 분포
- 단일 상권 내 매장 분포
- 가맹점 모집 소개 이미지
- 지역 서비스 커버리지 지도

## 사용 시점

- 사용자가 "매장 분포 / 지점 분포 / 커버리지 지도 / 매장 지도 / 가맹 모집"을 언급할 때
- "매장이 어디에 있는지" 이미지 한 장으로 설명하고 싶어 할 때
- 매장 밀도와 브랜드 커버리지를 강조하고 싶어 할 때

다음에는 사용하지 마세요.

- 맛집 탐방 지도(`food-map.md` 사용)
- 경로 지도(`travel-route-map.md` 사용)
- 도시 풍경 지도(`illustrated-city-map.md` 사용)

## 누락 정보 확인 우선순위

1. 지역: 전국 / 도 / 시 / 상권
2. 브랜드 이름 + 로고 설명
3. 매장 유형: 플래그십 / 일반 매장 / 팝업 / 가맹점
4. 매장 수와 구체적인 이름(또는 제가 목록을 작성해도 되는지)
5. 매장 유형을 구분하는 범례가 필요한지 여부
6. 스타일: 브랜드 색상의 현대 평면 / 사실적인 지도 / 인포그래픽 스타일

## 기본 템플릿: 현대 평면 브랜드 매장 분포 지도

📖 설명

지역 윤곽을 단순화한 바탕 지도 위에 브랜드 색상의 핀 / 아이콘으로 매장을 표시하고, 브랜드 정보 카드와 범례를 더합니다.

📝 프롬프트

```json
{
  "type": "브랜드 매장 분포 지도",
  "goal": "브랜드 공식 웹사이트 / 가맹 모집 안내서 / 축제 행사에 바로 사용할 수 있는 매장 분포 시각화 지도 생성",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"AURA Coffee\"}",
    "logo_description": "{argument name=\"brand logo\" default=\"금색 커피콩 + 브랜드명\"}",
    "brand_color": "{argument name=\"brand color\" default=\"따뜻한 갈색 + 크림색 흰색\"}"
  },
  "scope": {
    "region": "{argument name=\"region scope\" default=\"전국\"}",
    "base_map_style": "{argument name=\"base map style\" default=\"단순화된 도 경계 + 옅은 색 채우기\"}"
  },
  "stores": {
    "total_count": "{argument name=\"total stores\" default=\"168\"}",
    "by_type": [
      "{argument name=\"flagship\" default=\"플래그십 매장 8곳\"}",
      "{argument name=\"standard\" default=\"일반 매장 120곳\"}",
      "{argument name=\"pop_up\" default=\"팝업 매장 12곳\"}",
      "{argument name=\"franchise\" default=\"가맹점 28곳\"}"
    ],
    "highlight_cities": "{argument name=\"highlight cities\" default=\"베이징, 상하이, 광저우, 선전, 청두, 항저우\"}"
  },
  "marker_design": {
    "shapes": "원형 브랜드 색 핀 + 크기 차이로 매장 유형을 구분",
    "rule": "크기 순서: 플래그십 > 일반 > 팝업 > 가맹점"
  },
  "info_panel": {
    "enabled": "{argument name=\"info panel enabled\" default=\"true\"}",
    "position": "{argument name=\"info panel position\" default=\"오른쪽\"}",
    "content": [
      "총 매장 수",
      "커버 도시 수",
      "지난 1년간 신규 오픈",
      "주요 도시 TOP 5"
    ]
  },
  "legend": {
    "items": [
      "큰 원: 플래그십 매장",
      "중간 원: 일반 매장",
      "삼각형: 팝업 매장",
      "사각형: 가맹점"
    ]
  },
  "extras": ["브랜드 로고 배지", "가맹 문의 연락처 영역"],
  "constraints": {
    "must_keep": [
      "매장 밀도가 실제와 맞고 합리적이어야 함(전국이 빽빽한 점으로 가득하지 않게 함)",
      "브랜드 색상을 엄격히 통일",
      "범례와 매장 유형이 대응해야 함",
      "주요 도시 이름을 읽을 수 있어야 함"
    ],
    "avoid": [
      "바탕 지도의 세부 요소가 매장 표시보다 눈에 띔",
      "브랜드 색상이 아닌 색상 사용",
      "표시가 너무 빽빽해 구별하기 어려움",
      "범례 누락"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 브랜드, 지역, 매장 수, 브랜드 색상
- 기본값 지정 가능: 범례 스타일, 정보 카드 내용
- 무작위 지정 가능: 도시 표시 순서, 부수적인 장식

### 자동 완성 전략

- 사용자가 브랜드 이름만 제공하면 매장 수를 100~200곳으로 설정하고 주요 도시는 상위 5~10곳으로 선택합니다.
- 브랜드 색상이 없으면 업종에서 흔히 쓰는 색을 적용합니다(커피 갈색, 밀크티 분홍색, 소매 파랑, 의료 초록).
- 범례 항목은 최소 2개, 최대 5개로 합니다.

## 변형 1: 단일 상권 밀도 지도

📝 프롬프트

```json
{
  "type": "상권 매장 밀도 지도",
  "scope": {
    "region": "{argument name=\"district\" default=\"상하이 징안쓰 상권\"}"
  },
  "stores": {
    "total_count": "{argument name=\"store count\" default=\"24\"}",
    "highlight_cities": "구체적인 매장 이름 + 번호"
  },
  "constraints": {
    "must_feel": "지역 특색, 밀집된 분포, 동네 단위"
  }
}
```

## 변형 2: 서비스 커버리지 지도(충전소 / 지점 / 서비스 거점)

📝 프롬프트

```json
{
  "type": "서비스 커버리지 분포 지도",
  "service": {
    "name": "{argument name=\"service name\" default=\"NEX 충전 네트워크\"}",
    "color": "{argument name=\"service color\" default=\"테크 블루 + 밝은 노랑\"}"
  },
  "stations_count": "{argument name=\"station count\" default=\"800+\"}",
  "marker_design": {
    "shapes": "번개 아이콘 + 충전 속도 등급에 따른 색상 구분"
  },
  "legend": {
    "items": ["노랑: 초급속 충전", "파랑: 급속 충전", "회색: 완속 충전"]
  },
  "constraints": {
    "must_feel": "기술적이고 전문적이며 믿을 수 있는 느낌"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "매장 분포 지도 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 브랜드 + 업종을 제시하면 매장 규모, 브랜드 색상, 범례를 자동으로 추정",
  "constraints": {
    "must_feel": "가맹 모집 안내서 수준"
  }
}
```

## 피해야 할 사항

- 위치 밀도를 실제와 동떨어지게 하지 않습니다(작은 브랜드를 전국 곳곳에 점으로 가득 차게 표시하지 않음).
- 브랜드 로고가 지도의 세부 정보에 묻히지 않게 합니다.
- 서로 다른 업종의 여러 브랜드를 지도 한 장에 섞지 않습니다.
- 정보 카드가 이미지의 3분의 1을 넘지 않게 합니다.
- 실제 지도 스크린샷처럼 만들지 않습니다(브랜드 이미지이지 GIS 화면이 아닙니다).
