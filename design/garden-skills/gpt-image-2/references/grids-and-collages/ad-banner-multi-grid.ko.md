# 여러 업종을 섞은 광고 배너 그리드 템플릿

이 문서는 "한 이미지 안에 업종 / 주제 / 스타일이 서로 완전히 다른 독립 광고 배너 N개를 조합"한 시각물을 만들 때 사용합니다.

대표적인 용도:

- 광고 / 디자인 에이전시의 역량 시연 보드(서로 다른 네 가지 사업 분야의 결과물을 한 번에 보여 주기)
- 공식 계정 / 광고 소재 모음 미리보기
- "AI로 만들 수 있는 배너" 자기소개 이미지
- 해외용 일본식 / 한국식 SNS 배너 모음(여행 / 뷰티 / 식음료 / 교육 혼합)
- 템플릿 라이브러리 / 소재 모음 대표 이미지

기존 `banner-grid-2x2.md`와 다른 점:

| 항목 | `banner-grid-2x2.md`(기존) | 이 템플릿(신규) |
|---|---|---|
| 주제 통일성 | 같은 브랜드의 시리즈, 통일된 스타일 | **칸마다 업종 / 주제 / 색상이 완전히 다름** |
| 시각적 일관성 | 브랜드 색상과 로고 공유 | 그리드와 여백 리듬만 공유 |
| 용도 | 강의 / SNS 광고용 4종 세트 | 에이전시 시연 / 배너 모음 / 여러 장면 예시 |

## 적용 범위

- 독립 광고 배너 4 / 6 / 9개를 배치한 이미지
- 여러 업종 시연 보드(여행 / 뷰티 / 식음료 / 교육 / 금융 / 디지털 등)
- 여러 플랫폼의 광고 소재를 한 이미지로 미리 보기
- 디자이너 역량 포트폴리오 대표 이미지

## 사용 시점

- 사용자가 "서로 다른 네 업종 배너 / 여러 주제의 광고 세트 / 각각 한 장씩"을 언급할 때
- "완전히 다른 주제의 배너 N개를 한 이미지에 담고 싶다"고 할 때
- 에이전시 제안서 / 템플릿 예시 이미지를 제작할 때

다음에는 사용하지 마세요.

- 같은 브랜드의 배너 4종 확장 → `grids-and-collages/banner-grid-2x2.md` 사용
- 완성된 대형 배너 한 장 → `poster-and-campaigns/banner-hero.md` 사용
- 같은 주제를 여러 스타일로 표현 → `grids-and-collages/mixed-style-multi-panel.md` 사용
- 같은 사업의 여러 날짜 콘텐츠(룩북 / 시간표) → `grids-and-collages/lookbook-grid.md` 사용

## 누락 정보 확인 우선순위

1. 그리드 규격(2×2 / 2×3 / 3×3)
2. 각 칸의 주제 / 업종(사용자 목록 또는 무작위 선택)
3. 언어(일본어 / 중국어 / 영어 / 여러 언어 혼합)
4. 읽을 수 있는 실제 가격 / 할인율 / 문구가 필요한지 여부
5. 각 칸에 주인공 인물을 넣을지, 제품 / 텍스트만 넣을지
6. 주제 출처: 무작위 생성 / 동일 모델 라이브러리 / 사용자가 제공한 참고 자료

사용자가 "알아서 해 줘"라고 하면 언어는 질문하고, 나머지 주제는 서로 차이가 큰 업종 네 가지로 자동 생성합니다.

## 기본 템플릿: N×M 업종 혼합 광고 배너 시연 보드

📖 설명

캔버스를 N×M 칸으로 나누고 각 칸에 독립적인 구도, 주제, 글자 위계를 적용합니다. 완성된 배너 네 장을 한 이미지에 합쳐 놓은 것처럼 보여야 합니다.

📝 프롬프트

```json
{
  "type": "{argument name=\"grid spec\" default=\"2x2\"} 독립 광고 배너 그리드",
  "goal": "각 칸이 따로 잘라 사용할 수 있는 완성된 배너인 고밀도 광고 시연 보드를 생성합니다. 서로 다른 업종의 시각물을 다루는 능력을 보여 줍니다.",
  "language": "{argument name=\"language\" default=\"일본어\"}",
  "layout": {
    "structure": "{argument name=\"panel count\" default=\"4\"}개의 동일한 사분면",
    "gutter": "{argument name=\"gutter\" default=\"6px 흰색 구분선\"}",
    "overall_aspect_ratio": "{argument name=\"overall ratio\" default=\"1:1\"}",
    "panel_aspect_ratio": "{argument name=\"panel ratio\" default=\"1:1\"}",
    "quadrants": [
      {
        "position": "top-left",
        "theme": "{argument name=\"theme 1\" default=\"여행\"}",
        "subject": "{argument name=\"subject 1\" default=\"청록색 바다와 맑고 푸른 하늘이 보이는 흰 모래 해변에서 손을 잡고 있는 커플\"}",
        "elements": ["{argument name=\"deco 1\" default=\"왼쪽 아래 모서리의 붉은 히비스커스 꽃\"}"],
        "text_labels": [
          "{argument name=\"text 1a\" default=\"올해야말로, 떠나 보세요.\"}",
          "{argument name=\"text 1b\" default=\"오키나와 여행\"}",
          "{argument name=\"text 1c\" default=\"3일간의 힐링 여행\"}",
          "{argument name=\"text 1d\" default=\"항공권 + 호텔\"}",
          "{argument name=\"price 1\" default=\"39,800엔부터\"}",
          "{argument name=\"text 1e\" default=\"절경, 맛집, 체험을 모두 즐겨 보세요!\"}"
        ],
        "icons": { "count": 3, "descriptions": ["비행기", "호텔 건물", "자동차"] },
        "color_palette": "{argument name=\"palette 1\" default=\"하늘색, 청록색, 모래색 미색, 강조용 빨강\"}"
      },
      {
        "position": "top-right",
        "theme": "{argument name=\"theme 2\" default=\"스킨케어\"}",
        "subject": "{argument name=\"subject 2\" default=\"촉촉하고 빛나는 피부를 가진 젊은 여성의 클로즈업, 눈을 감고 있음\"}",
        "elements": [
          "{argument name=\"deco 2a\" default=\"부드러운 분홍색 그라데이션 배경\"}",
          "{argument name=\"deco 2b\" default=\"역동적으로 튀는 물방울 효과\"}",
          "{argument name=\"product 2\" default=\"'LUMIÈRE Brightening Gel' 라벨이 붙은 분홍색 화장품 용기\"}"
        ],
        "text_labels": [
          "모공과 칙칙함은 이제 안녕!",
          "맑고 투명한",
          "물광 피부로",
          "새로운 스킨케어 경험",
          "{argument name=\"discount 2\" default=\"첫 구매 한정 78% 할인\"}",
          "{argument name=\"price 2\" default=\"1,980엔\"}"
        ],
        "badges": { "count": 3, "style": "금색 원형", "labels": ["모공 케어", "고보습", "탄력과 윤기"] },
        "color_palette": "홍조 핑크, 아이보리, 부드러운 금색 강조"
      },
      {
        "position": "bottom-left",
        "theme": "{argument name=\"theme 3\" default=\"미식\"}",
        "subject": "{argument name=\"subject 3\" default=\"짙은 그릴 접시 위에서 지글거리는 두툼한 미디엄 레어 스테이크\"}",
        "elements": ["마늘 칩", "로즈마리 가지", "연기와 빛나는 숯불이 있는 어두운 배경"],
        "text_labels": [
          "입안에서 녹는 맛!",
          "{argument name=\"food 3\" default=\"일본산 흑모 와규\"}",
          "프리미엄 스테이크",
          "기간 한정 / 특별 가격",
          "{argument name=\"original price 3\" default=\"정가 8,980엔\"}",
          "{argument name=\"sale price 3\" default=\"4,980엔\"}"
        ],
        "badges": { "count": 1, "style": "빨간색 원형", "labels": ["A4·A5 등급"] },
        "color_palette": "짙은 갈색, 차콜 블랙, 호박색, 강조용 진홍색"
      },
      {
        "position": "bottom-right",
        "theme": "{argument name=\"theme 4\" default=\"온라인 교육\"}",
        "subject": "{argument name=\"subject 4\" default=\"책상에 앉아 열린 노트북 옆에서 노트에 필기하는 파란 셔츠의 젊은 남성\"}",
        "elements": ["밝은 실내 조명", "미니멀한 책상 주변"] ,
        "text_labels": [
          "자투리 시간에",
          "{argument name=\"goal 4\" default=\"최단 기간 합격!\"}",
          "온라인 자격증 강좌",
          "스마트폰으로 완성",
          "효율적인 학습으로 앞서가세요!",
          "{argument name=\"discount 4\" default=\"지금만! 수강료 20% 할인\"}"
        ],
        "badges": { "count": 1, "style": "파란색 원형", "labels": ["수강생 10만 명 돌파!"] },
        "icons": { "count": 2, "descriptions": ["스마트폰", "펼친 책"] },
        "color_palette": "하늘색, 흰색, 활기찬 노란색 강조"
      }
    ]
  },
  "global_style": {
    "rendering": "각 패널을 광고에 적합하게 구성하고, 각각 따로 써도 완성된 배너처럼 보여야 함",
    "typography": "패널마다 굵은 산세리프 헤드라인 + 작은 보조 제목, 여러 단계의 글자 위계",
    "layering": "주제 사진 + 선명한 텍스트 오버레이 + 작은 배지 / 아이콘 장식",
    "lighting": "패널의 주제에 맞는 조명(햇살 비치는 여행, 촉촉한 뷰티, 연기 자욱한 음식, 밝은 사무실)"
  },
  "constraints": {
    "must_keep": [
      "각 칸이 간단한 콜라주가 아니라 따로 잘라 쓸 수 있는 독립된 완성 배너처럼 보여야 함",
      "각 칸 안에서 글자 위계가 분명해야 함(헤드라인 ≫ 보조 문구 ≫ 가격 / CTA)",
      "인접한 칸으로 요소가 넘어가지 않도록 함"
    ],
    "avoid": [
      "모든 칸이 같은 색상이나 같은 모델을 반복 사용",
      "읽을 수 없을 정도로 흐릿한 텍스트",
      "칸마다 여백 비율이 균형을 잃음",
      "모든 로고 / 브랜드를 억지로 같은 브랜드처럼 표현"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: 그리드 규격, 언어, 각 주제(또는 무작위로 정해도 되는지)
- **기본값 지정 가능**: 텍스트 라벨(주제에 맞는 문구 자동 적용), 색상 팔레트(주제에 맞게 추천)
- **무작위 지정 가능**: 주제 설명, 가격 숫자, 배지 문구

### 자동 완성 전략

- 사용자가 "서로 다른 업종 광고 4장"만 말하면 여행 / 뷰티 / 식음료 / 교육 조합을 기본으로 사용합니다(Case 90에서 효용이 확인되었습니다).
- 업종 목록만 주고 문구를 지정하지 않으면 업종에 맞는 헤드라인 / 가격 / 배지 문구를 자동 작성합니다.
- 사용자가 언어를 지정하면 모든 패널이 같은 언어를 사용해야 합니다(명시적으로 "언어 혼합"을 요청한 경우 제외).

## 변형 1: 업종 9개를 한눈에 보여 주는 3×3 배너 시연 보드

📝 프롬프트

```json
{
  "type": "9개 업종 광고 배너 3x3 그리드",
  "language": "{argument name=\"language\" default=\"일본어\"}",
  "layout": {
    "structure": "크기가 동일한 셀 9개",
    "industries": [
      "여행", "스킨케어", "미식",
      "온라인 교육", "패션", "금융",
      "모바일 게임", "부동산", "헬스케어"
    ]
  },
  "per_cell_required_elements": [
    "업종에 어울리는 대표 주제",
    "큰 헤드라인 1개",
    "보조 문구 1개",
    "가격 또는 CTA 띠 1개",
    "작은 배지 또는 아이콘 행 1개"
  ],
  "global_style": {
    "rendering": "9개 셀 모두 선명한 인쇄물 수준으로 균일하게 표현",
    "color_diversity": "각 셀이 서로 섞여 보이지 않도록 눈에 띄게 다른 팔레트 9개 사용",
    "negative_space": "각 셀 내부 패딩 약 12%"
  }
}
```

### 이 변형을 선택할 때

- 사용자가 "업종이 완전히 다른 배너 9장"을 요청할 때
- 디자이너가 범용 템플릿 시연 페이지를 만들 때
- Behance / Dribbble 포트폴리오 표지로 바로 사용할 때

## 변형 2: 모바일 세로형 2×4 광고 소재 모음

📝 프롬프트

```json
{
  "type": "모바일 광고 배치 미리보기 2x4 세로형",
  "panel_aspect_ratio": "9:16",
  "overall_aspect_ratio": "미니 세로 배너 8개를 모은 9:16 콜라주",
  "use_case": "Pinterest / TikTok / Reels / 친구 피드 광고 효과 미리보기",
  "per_cell_required_elements": [
    "세로형 대표 사진 또는 일러스트",
    "위쪽 정렬 헤드라인",
    "아래쪽 정렬 CTA 칩",
    "작은 브랜드 워터마크"
  ],
  "constraints": {
    "must_keep": [
      "세로 구도 안전 영역(위 / 아래 각각 플랫폼 UI를 위해 12% 여백)",
      "8개 패널의 업종 차이가 분명해야 함"
    ]
  }
}
```

### 이 변형을 선택할 때

- 광고 소재 시연 이미지를 만들 때
- 모바일 광고 효과 미리보기 이미지가 필요할 때
- 고객에게 "하나의 캠페인을 여러 업종 관점으로 표현하는 방법"을 보여 줄 때

## 피해야 할 사항

- ❌ 4개 칸의 모델을 모두 같은 사람으로 그리지 않습니다(다업종 시연이 아니라 룩북이 됩니다).
- ❌ 모든 패널이 같은 색상을 공유하지 않게 합니다 → "다업종"이라는 시각적 대비가 사라집니다.
- ❌ 긴 문구로 패널 안의 위계를 무너뜨리지 않습니다(헤드라인을 화면 높이의 3분의 1~절반 영역 안에서 읽을 수 있어야 함).
- ❌ 최종 프롬프트에 템플릿의 "argument" 문구를 그대로 넣지 않습니다(매개변수 대체를 수행하거나 기본값을 유지해야 함).
- ❌ 여러 언어를 섞으면서 어느 패널에 어떤 언어를 사용할지 지정하지 않으면 모델이 혼란스러워집니다.
- ❌ 패널을 9개보다 많이 만들지 않습니다 → 한 이미지 안에서 각 칸의 세부 묘사가 무너지므로 두 장으로 나누는 편이 낫습니다.
