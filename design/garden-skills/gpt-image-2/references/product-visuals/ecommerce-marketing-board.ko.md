# 중국형 전자상거래 원페이지 종합 판매 보드 템플릿

이 문서는 "제품 메인 이미지 + 상세 페이지 + 장점 + 사용 순서 + 사용 장면 + 포장 정보 + TVC 스토리보드를 초대형 세로 이미지 한 장에 모두 담는" 복합 판매 비주얼을 만들 때 사용합니다.

대표적인 용도:

- 타오바오 / 티몰 / JD 상세 페이지의 메인 판매 영역, "게시 전 원페이지 검수"
- 도우인 / 콰이쇼우 전자상거래 상세 페이지용 세로 이미지
- 입점 제안 / 고객 검토용 전체 개요
- 신규 제품 전체 소재를 만들기 위한 "마스터 이미지", 이후 메인 이미지 / 상세 페이지 / 영상 스크립트로 분할
- 크로스보더 전자상거래 내부 공유용 "완전한 제품 마케팅 전략"

기존 제품 시각물 템플릿과 다른 점:

| 템플릿 | 정보 밀도 | 기능 |
|---|---|---|
| `white-background-product.md`(기존) | 낮음 | 흰 배경에 단일 제품의 여러 각도 |
| `premium-studio-product.md`(기존) | 중간 | 고급 스튜디오 상업 이미지 |
| `lifestyle-product-scene.md`(기존) | 중간 | 라이프스타일 장면 |
| `packaging-showcase.md`(기존) | 중간 | 선물 상자 / 포장 전시 |
| `exploded-view-poster.md`(기존) | 높음 | 제품 분해도 + 콜아웃 |
| **이 템플릿**(신규) | **매우 높음** | **판매 모듈 5~7개 + TVC 스토리보드 표를 한 이미지에 모두 표시** |

**핵심 차이**: 이 템플릿은 "제품 비주얼 포스터"가 아니라 "상세 페이지 + 메인 이미지 + 장점 + 사용법 + 장면 + 영상 스크립트 디자인 마스터 보드"입니다.

## 적용 범위

- 중국형 전자상거래 상세 페이지 전체 디자인 마스터 보드
- 신제품 출시 전 원페이지 검수 시안
- 입점 제안 + 고객 검토 + 내부 공유 전반
- 식품 / 뷰티 / 생활용품 / 건강 제품(정보 밀도가 높은 카테고리)
- "메인 이미지 + 상세 페이지 + 영상 스크립트" 통합 제안

## 사용 시점

- 사용자가 "상세 페이지 디자인 / 전자상거래 메인 이미지와 상세 페이지를 함께 / 원페이지 검수 / 전체 판매 보드"를 언급할 때
- 사용 단계 + 장면 + TVC 스토리보드를 포함하는 복합 시각물을 원할 때
- 중국형 전자상거래 식품 / 뷰티 / 유아용품 / 생활용품처럼 정보 밀도가 자연히 높은 제품군일 때

다음에는 사용하지 마세요.

- 흰 배경 단일 제품 메인 이미지 → `white-background-product.md` 사용
- 고급 상업 화보 → `premium-studio-product.md` 사용
- TVC 9칸 스토리보드만 필요 → `storyboards-and-sequences/product-tvc-storyboard.md` 사용
- 해외 전자상거래용 정보 밀도가 낮은 단일 이미지 → `product-card-overlay.md` 또는 `banner-hero.md` 사용

## 누락 정보 확인 우선순위

1. 제품 카테고리 + 브랜드 + 제품명(필수, 보드의 핵심)
2. 포장 외관(상자 색상 / 글꼴 / 로고 / 구성품)
3. 색상 방향(다크 럭셔리 식품 / 밝고 산뜻한 뷰티 / 따뜻한 유아용품 / 차가운 기술)
4. 반드시 포함할 핵심 장점(4~6개, 중앙 기능 패널 내용 결정)
5. 사용법 / 타는 순서(사용법 영역에 반영)
6. 사용 장면(아침 / 사무실 / 운동 / 잠들기 전 등에서 4개 선택)
7. 하단 TVC 스토리보드가 필요한지 여부(기본값: 필요)

## 기본 템플릿: 5+1 모듈 전자상거래 원페이지 종합 판매 보드

📖 설명

세로로 긴 캔버스를 상단 / 중단 / 하단 + 최하단 스토리보드 표의 네 영역으로 나눕니다. 판매 모듈 5개 + TVC 스토리보드 띠 하나를 포함합니다.

📝 프롬프트

```json
{
  "type": "중국형 전자상거래 제품 마케팅 보드",
  "goal": "메인 이미지 / 상세 페이지 / 장점 / 사용 단계 / 사용 장면 / 휴대 편의 / TVC 스토리보드를 포함한 복합 판매 보드를 생성합니다. 상세 페이지 마스터 / 입점 제안 / 판매자 내부 공유 자료로 사용할 수 있습니다.",
  "product": {
    "category": "{argument name=\"product category\" default=\"즉석 곡물 파우더 음료\"}",
    "brand": "{argument name=\"brand\" default=\"五谷磨房\"}",
    "name": "{argument name=\"product name\" default=\"호두·참깨·검은콩 파우더\"}",
    "packaging": "{argument name=\"packaging description\" default=\"앞면에 금색 중국어 글자와 크게 소용돌이치는 그릇 그래픽이 인쇄된 무광 검정 판매 상자, 안에는 개별 검정 포장 봉지\"}",
    "net_weight": "{argument name=\"net weight\" default=\"320g (32g×10봉)\"}"
  },
  "style": {
    "overall": "{argument name=\"overall style\" default=\"고급스럽고 어두운 식품 광고 레이아웃\"}",
    "color_palette": ["검정", "짙은 갈색", "따뜻한 금색", "베이지", "호두색 갈색"],
    "lighting": "광택 하이라이트와 따뜻한 윤곽광이 있는 드라마틱한 스튜디오 조명",
    "mood": "{argument name=\"mood\" default=\"고급스럽고 영양이 풍부하며 건강하고 먹음직스러운 분위기\"}"
  },
  "layout": {
    "format": "주요 구역 5개와 하단 스토리보드 표로 나눈 긴 단일 보드",
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"세로, 약 9:16\"}",
    "grid": "상단은 왼쪽 메인 이미지와 오른쪽 상세 페이지로 나눔; 중간은 사용 안내와 기능 패널로 나눔; 하단은 라이프스타일 장면과 봉지 포장 소개로 나눔; 맨 아래는 너비 전체를 사용하는 표 형식 스토리보드",
    "sections": [
      {
        "title": "메인 이미지 / Main image",
        "position": "왼쪽 위",
        "count": 8,
        "labels": [
          "{argument name=\"brand\" default=\"五谷磨房\"}",
          "{argument name=\"product name\" default=\"호두·참깨·검은콩 파우더\"}",
          "32g×10봉 개별 포장",
          "{argument name=\"main keyword 1\" default=\"검은 곡물 다섯 가지\"}",
          "{argument name=\"main keyword 2\" default=\"진하고 고소한 맛\"}",
          "{argument name=\"main keyword 3\" default=\"개별 소포장\"}",
          "{argument name=\"main keyword 4\" default=\"바로 타서 마심\"}",
          "제품 상자와 음료 컵을 함께 보여 주는 히어로 구도"
        ]
      },
      {
        "title": "상세 페이지 / Details page",
        "position": "오른쪽 위",
        "count": 5,
        "labels": ["{argument name=\"ingredient 1\" default=\"검은 참깨\"}", "{argument name=\"ingredient 2\" default=\"검은콩\"}", "{argument name=\"ingredient 3\" default=\"흑미\"}", "{argument name=\"ingredient 4\" default=\"호두\"}", "{argument name=\"ingredient 5\" default=\"곡물 가루\"}"]
      },
      {
        "title": "{argument name=\"feature title\" default=\"진하고 부드러우며 목 넘김이 좋음\"}",
        "position": "오른쪽 가운데",
        "count": 4,
        "labels": [
          "{argument name=\"feature 1\" default=\"한 번에 타서 맛있고 영양 가득\"}",
          "{argument name=\"feature 2\" default=\"고운 입자 Fine powder\"}",
          "{argument name=\"feature 3\" default=\"진하고 고소한 맛 Rich & Smooth\"}",
          "{argument name=\"feature 4\" default=\"영양 식사 대용 Nutritious\"}"
        ]
      },
      {
        "title": "{argument name=\"how to title\" default=\"타는 방법 HOW TO MAKE\"}",
        "position": "왼쪽 중앙 아래",
        "count": 3,
        "labels": [
          "{argument name=\"step 1\" default=\"1 파우더 한 봉(32g)을 넣습니다\"}",
          "{argument name=\"step 2\" default=\"2 뜨거운 물 또는 우유 200ml를 넣습니다\"}",
          "{argument name=\"step 3\" default=\"3 잘 저으면 완성입니다\"}"
        ]
      },
      {
        "title": "{argument name=\"scenario title\" default=\"곡물 한 잔으로 가볍고 편안한 일상\"}",
        "position": "왼쪽 아래",
        "count": 4,
        "labels": [
          "{argument name=\"scenario 1\" default=\"활기찬 아침 식사\"}",
          "{argument name=\"scenario 2\" default=\"사무실 오후 간식\"}",
          "{argument name=\"scenario 3\" default=\"운동 식사 대용\"}",
          "{argument name=\"scenario 4\" default=\"잠들기 전 따뜻한 음료\"}"
        ]
      },
      {
        "title": "{argument name=\"convenience title\" default=\"개별 포장으로 간편하게 휴대\"}",
        "position": "오른쪽 아래",
        "count": 3,
        "labels": ["개별 포장으로 위생적이고 휴대가 편함", "신선도 유지, 습기와 산화를 방지", "1봉지로 1잔, 정량 사용"]
      },
      {
        "title": "동영상 광고 / TVC 프롬프트 + 장면별 스토리보드",
        "position": "하단 전체 너비",
        "count": 7,
        "labels": [
          "장면 1 오프닝-제품 소개",
          "장면 2 재료 클로즈업",
          "장면 3 컵에 가루를 붓기",
          "장면 4 타서 젓기",
          "장면 5 음용 장면",
          "장면 6 제품 장점",
          "장면 7 마무리 슬로건"
        ]
      }
    ]
  },
  "scene_elements": {
    "ingredients": [
      { "name": "{argument name=\"ingredient 1\" default=\"검은 참깨\"}", "form": "둥근 그릇 안에 담긴 작은 검은 씨앗" },
      { "name": "{argument name=\"ingredient 2\" default=\"검은콩\"}", "form": "둥근 그릇 안의 윤기 있는 통콩" },
      { "name": "{argument name=\"ingredient 3\" default=\"흑미\"}", "form": "둥근 그릇 안의 짙은 색 긴 쌀알" },
      { "name": "{argument name=\"ingredient 4\" default=\"호두\"}", "form": "둥근 그릇 안의 호두 반쪽" },
      { "name": "{argument name=\"ingredient 5\" default=\"곡물 가루\"}", "form": "둥근 그릇 안의 연한 베이지색 가루" }
    ],
    "serving": {
      "drink": "{argument name=\"drink description\" default=\"표면에 부드러운 소용돌이 무늬가 있는 걸쭉한 회갈색 참깨·호두·콩 음료\"}",
      "cup": "손잡이가 있는 투명한 유리컵",
      "utensil": "음료를 젓거나 컵 안에 놓인 금속 숟가락"
    },
    "supporting_props": ["탁자 위 호두", "흩어진 검은콩", "곡식 이삭 또는 밀 줄기", "어두운 탁자", "재료 그릇", "봉지 5개가 보이도록 개봉한 포장"]
  },
  "text_treatment": {
    "headline_font": "금속성 금색의 우아하고 굵은 중국어 디스플레이 서체",
    "body_font": "가끔 영어 부제를 더한 깔끔한 중국어 산세리프체",
    "accent": "가는 금색 구분선과 원형 재료 프레임"
  },
  "camera_and_composition": {
    "product_shots": "정면을 향한 대표 상자, 비스듬한 소포장 진열 상자, 음료 매크로 클로즈업",
    "food_photography": "얕은 피사계 심도와 선명한 질감 강조를 적용한 세밀한 상업용 푸드 스타일링"
  },
  "quality": "세부 묘사가 매우 높은 상업 디자인 목업, 전자상거래 키 비주얼 + 상세 페이지 + 광고 스토리보드, 4K",
  "constraints": {
    "must_keep": [
      "판매 모듈 5개 + TVC 스토리보드 띠 1개가 모두 있고 식별 가능",
      "모든 모듈에 작은 제목 + 번호 또는 아이콘 포함",
      "여러 모듈에 등장하는 포장 / 제품 외관을 일관되게 유지",
      "중국어 문구의 메인 제목 / 부제 / 장점 간 위계를 명확히 함"
    ],
    "avoid": [
      "상세 페이지 영역을 텍스트로만 구성(재료 이미지 / 아이콘 필요)",
      "5개 모듈 사이의 시각적 경계가 없음",
      "TVC 스토리보드 띠가 텍스트 목록으로만 구성됨(썸네일 + 라벨 필요)",
      "모든 문구를 메인 이미지에 겹쳐 메인 이미지의 기능을 잃음",
      "영역마다 재료 / 상품 포장 색상이 달라짐"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: 제품 브랜드 + 이름, 포장 설명, 재료 / 성분 / 장점 키워드 5개
- **기본값 지정 가능**: 전체 스타일(카테고리에 맞춰 자동 선택), 장면 / 단계 / 기능 문구(카테고리에 맞춰 자동 적용)
- **무작위 지정 가능**: 보조 소품 세부 사항, TVC 7개 장면의 구체적인 문구

### 자동 완성 전략

- 사용자가 "XX 전자상거래 상세 페이지 전체를 한 장으로 만들어 줘"라고 하면 식품 / 뷰티 / 유아용품 카테고리에 따라 다크 / 라이트 / 웜 팔레트를 선택합니다.
- 재료 5개를 지정하지 않으면 제품 카테고리에 맞춰 자동 목록을 만듭니다(분유 → 원유 종류 5가지; 스킨케어 → 성분 5가지; 운동 식사 대용 → 곡물 5가지).
- TVC 장면이 지정되지 않으면 템플릿의 7단계 표준 구조를 사용합니다.

## 변형 1: 밝고 산뜻한 뷰티 / 스킨케어 보드(스타일 교체)

📝 프롬프트

```json
{
  "type": "중국형 전자상거래 스킨케어 제품 마케팅 보드",
  "style_override": {
    "overall": "깨끗하고 밝으며 고급스러운 뷰티 레이아웃",
    "color_palette": ["미색", "부드러운 베이지", "로즈 골드", "파스텔 핑크", "샴페인색"],
    "lighting": "은은한 하이라이트가 있는 밝고 가벼운 자연광",
    "mood": "산뜻하고 깨끗하며 촉촉하고 고급스러운 분위기"
  },
  "section_replacements": {
    "ingredients_section": "활성 성분 아이콘 5개(히알루론산 / 나이아신아마이드 / 세라마이드 / 레티놀 / 비타민 C)",
    "feature_section": "효능 문구 4개(보습 / 미백 / 주름 개선 / 피부 장벽 회복)",
    "scenario_section": "사용 순간 4개(아침 / 출퇴근 / 메이크업 전 / 야간 회복 케어)",
    "how_to_section": "3단계 루틴(세안 → 도포 → 마사지)"
  }
}
```

### 이 변형을 선택할 때

- 뷰티 / 스킨케어 / 퍼스널 케어 제품
- 고객이 "일본식 산뜻함 / 한국식 힐링" 스타일을 원함
- 식품 제품의 "다크 + 금색" 고급 분위기가 필요하지 않음

## 변형 2: 유아 / 어린이 / 따뜻한 색상 계열

📝 프롬프트

```json
{
  "type": "중국형 전자상거래 유아·아동 제품 마케팅 보드",
  "style_override": {
    "overall": "둥근 모서리와 부드러운 일러스트를 활용한 따뜻하고 친근하며 어린이에게 안전한 레이아웃",
    "color_palette": ["크림색", "연노랑", "아기 파랑", "파스텔 핑크", "나무 갈색"],
    "lighting": "부드러운 그림자의 따뜻한 자연광",
    "mood": "안전하고 다정하며 건강하고 믿음직한 분위기"
  },
  "extra_section": {
    "title": "엄마도 안심 / 안전 인증",
    "elements": ["EU 인증", "첨가물 없음", "방부제 0%", "아기 사용 가능"]
  }
}
```

### 이 변형을 선택할 때

- 유아 / 어린이 / 임산부 제품
- "안전 / 인증 / 무첨가"를 반드시 강조해야 할 때
- 따뜻한 색상 + 둥근 형태의 시각 요소가 필요할 때

## 변형 3: 3C / 디지털 / 도구 제품(문구 적게 + 기술 사양 많이)

📝 프롬프트

```json
{
  "type": "중국형 전자상거래 3C / 디지털 제품 마케팅 보드",
  "style_override": {
    "overall": "네온 포인트가 있는 기술적이고 미니멀한 다크 레이아웃",
    "color_palette": ["무광 검정", "흑연색", "시안", "흰색"],
    "mood": "하이테크, 정밀, 전문적"
  },
  "section_replacements": {
    "ingredients_section": "사양 표(CPU / RAM / 배터리 / 연결 / 무게)",
    "feature_section": "아이콘을 포함한 기술 장점 칩 4개",
    "scenario_section": "사용 장면 4개(업무 / 출장 / 창작 / 게임)",
    "how_to_section": "생략하고 제품 각도 클로즈업 6개로 대체"
  }
}
```

### 이 변형을 선택할 때

- 디지털 / 도구 / 전자 제품
- 고객이 "수식어는 적게 + 사양은 많이 + 강한 기술 감성"을 원함

## 피해야 할 사항

- ❌ 판매 모듈 5개 + 스토리보드 1개를 정사각 1:1 이미지에 욱여넣음 → 9:16 / 3:4 장형 이미지 필요
- ❌ 메인 이미지에 문구를 가득 씀 → 메인 이미지는 제품 이미지이며 문구는 장점 영역에 배치
- ❌ 모듈 사이 시각적 경계(선 / 색면 / 여백)가 없음 → 전체가 뭉개져 보임
- ❌ TVC 스토리보드가 순수 텍스트 목록으로 표현됨 → 썸네일 7개 + 번호 + 제목 필요
- ❌ 모듈마다 포장 / 제품의 색상이나 글꼴이 달라짐 → 일관성이 이 보드의 핵심
- ❌ 주색 6가지 이상 사용 → 주색 3~4개 + 강조색 1개로 제한
- ❌ 이미지 전체에 글꼴 4종 이상 사용 → 제목 + 본문 + 손글씨 강조 글꼴 하나면 충분
- ❌ 제품에 실제로 특정 성분이 있는데 모델이 재료 다섯 가지를 임의로 생각하게 함 → 프롬프트에 정확히 열거해야 함
