# 제품 / 모델 라인업 비교 인포그래픽 포스터 템플릿

이 문서는 "단일 브랜드의 전체 제품군 / 전체 모델 / 전체 SKU를 중심에 두고 등급 / 시리즈 / 카테고리별 행으로 배치하며, 범례 / 아이콘 키 / 장점 차트를 함께 넣는" 고급 카탈로그 스타일 인포그래픽 포스터를 만들 때 사용합니다.

대표적인 용도:

- 악기 브랜드 전체 라인업 포스터(PRS / Fender / Gibson / Boss 등)
- 자동차 브랜드 모델 계보 포스터(Porsche / Audi / Ford 등)
- 시계 / 렌즈 / 펜 / 고급 하드웨어 시리즈 비교
- 컬렉터용 포스터 / 박물관 수준 브랜드 헌정 이미지
- 연간 카탈로그 또는 기념일 포스터
- 대리점 벽면에 거는 차트

기존 포스터 / 인포그래픽 템플릿과 다른 점:

| 템플릿 | 용도 |
|---|---|
| `infographics/comparison-infographic.md`(기존) | A vs B / 요금제 등급 / 오해 비교(최대 6개 항목) |
| `infographics/legend-heavy-infographic.md`(기존) | 고밀도 정보 / 인과 관계 / 진화(제품 라인업은 강조하지 않음) |
| **이 템플릿**(신규) | **SKU 30개 이상을 동시에 보여 주고 등급 × 시리즈 매트릭스로 배열하며 범례 포함** |

**핵심 특징**: 제품 썸네일 30~50개를 한 화면에 배치하고 등급 키 + 아이콘 범례 + 음색 차트를 사용해 "어떤 유형을 구매해야 할지" 한눈에 알 수 있게 합니다.

## 적용 범위

- 단일 브랜드 SKU 30개 이상의 라인업 기념 포스터
- 대리점 벽면 안내 / 컬렉터 포스터
- 연간 카탈로그 한눈에 보기
- 기념일 / 주년 기념 포스터
- B2B 영업용 "보유 SKU 규모" 소개 이미지

## 사용 시점

- 사용자가 "전체 라인업 / 전체 제품군 / 전체 모델 / 컬렉터 포스터 / 카탈로그 한 장"을 언급할 때
- 단일 브랜드 제품 수가 20개 이상일 때
- 브랜드 역사 / 폭넓은 제품군 / 풍부한 선택지를 강조하고 싶을 때

다음에는 사용하지 마세요.

- 제품이 6개 이하인 비교 → `infographics/comparison-infographic.md` 사용
- 단일 제품의 여러 각도 → `product-visuals/exploded-view-poster.md` 사용
- 단일 제품 고급 스튜디오 이미지 → `product-visuals/premium-studio-product.md` 사용
- 여러 브랜드를 섞은 비교 → 부적합(이 템플릿은 단일 브랜드에 초점을 둠)

## 누락 정보 확인 우선순위

1. 브랜드 이름 + 제품 종류(PRS 기타 / 포르쉐 자동차 / 몽블랑 만년필 등)
2. 총 SKU 수(20~50개가 적절하며 60개 초과 시 각 칸이 무너짐)
3. 행을 나누는 기준(등급 / 시리즈 / 연도 / 가격대 등)
4. 아이콘 키 / 음색 키 / 사양 키가 필요한지 여부(상단 범례 수에 영향)
5. 색상 방향(**다크 럭셔리 / 흰 배경 미니멀 / 레트로 샌드 골드**)
6. 비율(기본값 세로형 3:4)
7. 브랜드 서명 / 인장 / 봉인 장식을 포함할지 여부

## 기본 템플릿: 고급 라인업 비교 인포그래픽 포스터

📖 설명

세로형 포스터입니다. 헤더(메인 제목 + 부제 + 서명 + 양쪽 인장) 아래에 범례 키 3개를 두고, 중간에는 등급별 6~8행 제품 매트릭스를 배치합니다. 각 행 왼쪽에는 등급 이름, 오른쪽에는 제품 카드 6~7개를 배열합니다.

📝 프롬프트

```json
{
  "type": "고급 레트로 라인업 비교 인포그래픽 포스터",
  "goal": "등급 / 아이콘 / 음색 범례와 함께 SKU 30개 이상을 보여 주는 고급 카탈로그 스타일의 전체 브랜드 제품 라인 비교 포스터 생성",
  "subject": "{argument name=\"subject description\" default=\"고급 박물관 포스터 또는 컬렉터 참고 보드처럼 디자인한 세밀하고 세로형인 PRS 일렉트릭 기타 라인업 차트\"}",
  "style": {
    "overall": "{argument name=\"overall style\" default=\"화려하고 어두우며 윤기 나는 고대비, 금박 서체, 우아한 목재와 금속 질감, 대칭 그리드 레이아웃, 고급 카탈로그 분위기, 은은한 레트로 풍화 질감, 매우 선명한 그래픽 디자인\"}"
  },
  "branding": {
    "main_headline": "{argument name=\"main headline\" default=\"THE LEGENDARY LINEAGE OF PRS GUITARS\"}",
    "subheadline": "{argument name=\"subheadline\" default=\"EVERY ICON. EVERY LINE. ONE HERITAGE.\"}",
    "signature": "{argument name=\"signature\" default=\"Paul Reed Smith\"}",
    "left_seal": "{argument name=\"left seal\" default=\"PAUL REED SMITH GUITARS\"}",
    "right_seal": "{argument name=\"right seal\" default=\"MADE IN MARYLAND U.S.A.\"}"
  },
  "palette": {
    "background": "{argument name=\"background palette\" default=\"검정과 짙은 차콜에 어두운 무늬목 포인트\"}",
    "primary": "{argument name=\"primary color\" default=\"앤티크 골드\"}",
    "secondary": "{argument name=\"secondary color\" default=\"크림색\"}",
    "accent_colors": ["짙은 초록", "청록", "로열 블루", "보라", "금색", "버건디"]
  },
  "layout": {
    "format": "{argument name=\"format\" default=\"한 페이지 세로 포스터\"}",
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"세로 3:4\"}",
    "header": {
      "position": "상단",
      "elements": [
        "가운데의 큰 제목",
        "아래쪽의 작은 태그라인",
        "필기체 서명",
        "왼쪽 위와 오른쪽 위의 원형 엠블럼 2개",
        "제목 아래 가로 범례 상자 {argument name=\"legend count\" default=\"3\"}개"
      ]
    },
    "sections": [
      {
        "title": "{argument name=\"key 1 title\" default=\"PRESTIGE TIER KEY\"}",
        "position": "제목 아래 왼쪽 위",
        "count": 6,
        "labels": ["{argument name=\"tier 1\" default=\"SE\"}", "{argument name=\"tier 2\" default=\"S2\"}", "{argument name=\"tier 3\" default=\"CE\"}", "{argument name=\"tier 4\" default=\"CORE\"}", "{argument name=\"tier 5\" default=\"WOOD LIBRARY\"}", "{argument name=\"tier 6\" default=\"PRIVATE STOCK\"}"]
      },
      {
        "title": "{argument name=\"key 2 title\" default=\"PICKUP ICON KEY\"}",
        "position": "제목 아래 중앙 오른쪽",
        "count": 7,
        "labels": ["HH", "HSH", "P-90", "SOAP", "58/15", "TCI", "Bass"]
      },
      {
        "title": "{argument name=\"key 3 title\" default=\"TONAL CHARACTER KEY\"}",
        "position": "제목 아래 오른쪽",
        "count": 7,
        "labels": ["따뜻함 / 빈티지", "균형 / 다용도", "밝음 / 선명함", "고게인 / 현대적", "블루스 / 클래식 록", "메탈 / 프로그레시브", "펑크 / 소울 / 클린"]
      },
      {
        "title": "{argument name=\"row 1 label\" default=\"CORE\"}",
        "position": "첫 번째 본문 행의 왼쪽 라벨",
        "count": 7,
        "labels": ["{argument name=\"row 1 model 1\" default=\"Custom 24\"}", "McCarty 594", "DGT (David Grissom)", "Custom 22", "Hollowbody II", "SC 594", "행 카테고리 패널"]
      },
      {
        "title": "{argument name=\"row 2 label\" default=\"S2\"}",
        "position": "두 번째 본문 행의 왼쪽 라벨",
        "count": 6,
        "labels": ["S2 Custom 24", "S2 McCarty 594", "S2 Standard 24", "S2 Vela", "S2 Singlecut", "S2 Mira"]
      },
      {
        "title": "{argument name=\"row 3 label\" default=\"SE\"}",
        "position": "세 번째 본문 행의 왼쪽 라벨",
        "count": 6,
        "labels": ["SE Custom 24", "SE Standard 24", "SE Paul's Guitar", "SE Santana", "SE Hollowbody II", "SE Mark Holcomb"]
      },
      {
        "title": "{argument name=\"row 4 label\" default=\"CE\"}",
        "position": "네 번째 본문 행의 왼쪽 라벨",
        "count": 6,
        "labels": ["CE 24", "CE 22", "CE 24 Semi-Hollow", "CE 24 Floyd", "CE 24 Satin", "CE Bass"]
      },
      {
        "title": "{argument name=\"row 5 label\" default=\"BOLT-ON SERIES\"}",
        "position": "다섯 번째 본문 행의 왼쪽 라벨",
        "count": 6,
        "labels": ["NF 53", "Silver Sky", "NF 3", "NF 53 Satin", "DGT Bolt-On", "Studio"]
      },
      {
        "title": "{argument name=\"row 6 label\" default=\"PRIVATE STOCK\"}",
        "position": "여섯 번째 본문 행의 왼쪽 라벨",
        "count": 6,
        "labels": ["Dragon I", "Frostbite", "#4004", "The Tree of Life", "#8731", "PS DGT"]
      }
    ],
    "footer": {
      "position": "하단",
      "elements": ["왼쪽 아래의 작은 배지", "가운데 정렬된 회사 문구", "오른쪽의 필기체 서명"]
    }
  },
  "content_grid": {
    "total_models_shown": "{argument name=\"total model count\" default=\"37\"}",
    "card_design": "{argument name=\"card design\" default=\"제품 카드마다 기타 렌더링, 모델명, 연도, 작은 픽업 아이콘, 짧은 설명, 하단에 원산지 / 목재 사양 포함\"}",
    "row_side_panels": 6
  },
  "visual_details": {
    "products": "{argument name=\"product description\" default=\"바디 형태가 다양하고 고광택 무늬 메이플 탑, 금속성 및 반투명 마감, 단색, 천연 목재색을 사용한 정면 전기 기타\"}",
    "typography": "대문자 세리프 헤드라인, 작은 세리프 본문, 필기체 서명 강조",
    "borders": "모든 패널과 포스터 전체에 가는 장식 금색 선",
    "lighting": "어두운 패널 배경 위에 스튜디오 조명으로 비춘 제품",
    "render_quality": "사실적인 제품 렌더링과 깔끔한 인포그래픽 정밀도"
  },
  "camera": "원근 왜곡이 없는 정면 평면 포스터 시점, 중앙 구도",
  "quality": "세부 묘사가 매우 높고 인쇄에 적합한 고해상도 에디토리얼 인포그래픽, 고급 브랜드 포스터",
  "constraints": {
    "must_keep": [
      "제품 썸네일 30개 이상을 읽을 수 있고 같은 방향 / 시점을 유지",
      "등급 행의 왼쪽 라벨이 명확",
      "상단 범례 키 3개(등급 / 픽업 / 음색)가 제품 카드의 작은 아이콘과 대응",
      "서명 / 인장 / 메인 제목 / 부제가 모두 포함",
      "전체적으로 짙은 색 + 금색 / 샌드 화이트 팔레트 통일"
    ],
    "avoid": [
      "제품 방향이 제각각(정면, 45도, 위에서 내려다본 각도 혼합)",
      "라벨이 정렬되지 않아 행이 카탈로그처럼 보이지 않음",
      "제품 30개 이상을 정사각형 1:1에 욱여넣음 → 세로 3:4 이상으로 구성",
      "주색 4개 + 강조색 6개를 초과",
      "제품명 오탈자(라인업 포스터의 핵심 정보이므로 정확해야 함)"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: 브랜드 이름, 제품 종류, 등급 이름 6개 + 각 행의 제품 목록
- **기본값 지정 가능**: 전체 스타일(제품군에 맞춰 자동 선택), 팔레트, 비율
- **무작위 지정 가능**: 제품별 짧은 설명, 카드의 사양 문구

### 자동 완성 전략

- 사용자가 "PRS 기타 전체 라인업"을 제시하면 기본 6행 × 행마다 SKU 6~7개 구조를 사용합니다.
- 사용자가 자동차 브랜드와 모델을 몇 개 제공하면 "세단 / SUV / 스포츠카 / EV"로 행을 자동 분류합니다.
- 범례 수를 지정하지 않으면 기본 3개(등급 / 핵심 사양 / 성격)로 설정합니다.

## 변형 1: 밝은 미니멀(기술 / 디자인 브랜드에 적합)

📝 프롬프트

```json
{
  "type": "미니멀 라인업 비교 포스터, 라이트 버전",
  "style_override": {
    "overall": "깨끗한 흰색 / 연회색 배경, 가는 산세리프체, 금박 없음, 화려한 테두리 없이 얇은 선만 사용",
    "palette": "미색 배경, 부드러운 회색 구분선, 브랜드의 강조색 하나(예: 주황 / 파랑 / 초록)"
  },
  "use_case": "Apple / Tesla / Bose / 디자인 중심 브랜드"
}
```

### 이 변형을 선택할 때

- 기술 / 디자인 브랜드(고급 금박은 어울리지 않음)
- 미니멀 / 현대적인 분위기를 원할 때
- 강조색 하나로 강한 대비를 만들 때

## 변형 2: 가로 타임라인 계보 버전(연도별 행)

📝 프롬프트

```json
{
  "type": "가로형 라인업 연대기 포스터",
  "format_override": "가로 포스터, 16:9 또는 21:9",
  "row_grouping_by": "10년 단위(1950년대 / 60년대 / 70년대 / 80년대 / 90년대 / 2000년대 / 2010년대 / 2020년대)",
  "use_case": "브랜드 기념일 포스터 / 제품 변천사"
}
```

### 이 변형을 선택할 때

- 브랜드 주년 / 역사 포스터
- "등급 + 선택"보다 "타임라인 + 진화"를 강조하고 싶을 때
- 전시장 / 매장 벽 등 가로 화면에 표시할 때

## 변형 3: 3시리즈 비교표(SKU가 적거나 입문~플래그십 비교에 적합)

📝 프롬프트

```json
{
  "type": "3등급 라인업 비교표 포스터",
  "row_count": 3,
  "rows": ["BASIC / 입문", "PRO / 고급", "ULTRA / 플래그십"],
  "columns_per_row": 4,
  "extra_columns": ["각 등급의 체크 / 대시 사양표"],
  "use_case": "신제품 출시 / 가격대 비교 / B2C 구매 가이드"
}
```

### 이 변형을 선택할 때

- SKU가 12개 이하일 때
- 전체 라인업 개요보다 "성능 비교"가 더 중요할 때
- 공식 웹사이트 / 랜딩 페이지 / 영업 자료에 적합

## 피해야 할 사항

- ❌ SKU 30개 이상을 정사각 1:1에 욱여넣지 않습니다 → 세로로 긴 이미지 또는 가로 와이드 이미지 필요
- ❌ 제품 방향 / 시점을 통일하지 않으면 카탈로그 느낌이 즉시 무너집니다.
- ❌ 등급 라벨과 본문 글자 크기가 같으면 행을 빠르게 구별할 수 없습니다.
- ❌ 범례 키와 제품 썸네일 아이콘이 대응하지 않으면 범례 기능이 사라집니다.
- ❌ 제품 썸네일 간격이 일정하지 않으면 화면이 어수선해집니다.
- ❌ 제품명에 오타를 내지 않습니다(카탈로그 포스터의 핵심 정보).
- ❌ 주색을 6가지 이상 사용하지 않습니다(배경색 1 + 기본 글자색 1 + 강조색 1 + 행 강조색 최대 6개로 제한).
- ❌ 브랜드가 PRS가 아닌데 템플릿의 "PRS Guitars"를 그대로 두지 않습니다 → 브랜드 이름과 모든 제품명을 교체해야 함.
