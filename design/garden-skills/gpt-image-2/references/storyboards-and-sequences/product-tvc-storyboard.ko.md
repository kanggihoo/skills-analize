# 제품 TVC 광고 스토리보드 보드 템플릿

이 문서는 "단일 제품을 주인공으로 삼아 상업 광고용 샷 9~12개에 걸친 실사 사진풍 스토리보드 표"를 만들 때 사용합니다. 각 패널은 실제 촬영 장면의 시각적 예시입니다.

대표적인 용도:

- 광고 / TVC 회사에 제출하는 촬영 전 스토리보드 제안
- 전자상거래 상세 페이지용 "이런 품질의 영상을 제작할 수 있습니다" 사전 시각화
- Seedance / Sora / Runway 등의 동영상 생성 도구용 샷 목록 참고
- 고객 검토 전 영상 스크립트 시각화
- 전자상거래 "메인 이미지 → TVC" 원페이지 승인 시안

기존 스토리보드 템플릿과 다른 점:

| 템플릿 | 특성 | 스타일 |
|---|---|---|
| `four-panel-comic.md`(기존) | 만화 4칸 | 만화 / 개그 / 반전 |
| `manga-spread-page.md`(기존) | 만화 펼침 페이지 콘티 | 일본 만화 / 불규칙 칸 |
| `recipe-process-flowchart.md`(기존) | 절차 안내 | 레시피 / 튜토리얼 일러스트 |
| **이 템플릿**(신규) | **실제 촬영 스토리보드** | **상업 광고 사진** |

**핵심 차이**: 이 템플릿의 모든 패널은 "실제 사진 / 사실적인 렌더" 장면입니다. 만화 콘티도 절차도 아니며 "이 15초 광고가 어떤 장면으로 촬영될지"를 시각화합니다.

## 적용 범위

- 상업 TVC 촬영 전 스토리보드
- 전자상거래 상세 페이지 영상 사전 시각화
- 고객 검토("완성 영상이 대략 이렇게 보입니다")
- 영상 생성 모델(Sora / Seedance / Runway)용 샷 목록 참고
- 자동차 판매점 / 뷰티 / 식품 / 디지털 제품군의 15~30초 광고 콘티

## 사용 시점

- 사용자가 "TVC / 광고 콘티 / storyboard / 영상 스크립트 시각화"를 언급할 때
- 제품이 이미 있고 완성 영상이 어떻게 보일지 시각 제안이 필요할 때
- 고객이 "샷 9개 / 12개에서 각각 무엇을 촬영하는지" 확인하고 싶어 할 때

다음에는 사용하지 마세요.

- 만화 / 이야기 4칸 → `four-panel-comic.md` 사용
- 불규칙한 만화 펼침 페이지 → `manga-spread-page.md` 사용
- 레시피 / 튜토리얼 절차 → `recipe-process-flowchart.md` 사용
- 히어로 메인 이미지 하나만 필요 → `product-visuals/premium-studio-product.md` 사용
- 상세 페이지 원페이지 종합 판매 보드 → `product-visuals/ecommerce-marketing-board.md` 사용

## 누락 정보 확인 우선순위

1. 제품(구체적인 제품 / 포장 / 색상 / 형태 필수)
2. 영상 길이(15초 / 30초 / 60초) + 비율(세로 9:16 / 가로 16:9 / 1:1)
3. 전체 샷 수(9 / 12 / 6개)
4. 스타일(**영화적 / 미니멀 고급 / 따뜻한 라이프스타일 / 차가운 테크 / 레트로 향수**)
5. 손 / 배우 등 사용자가 장면에 등장해야 하는지 여부
6. 반드시 보여 줄 장점(클로즈업 또는 라이프스타일 샷을 결정)
7. 샷 제목 / 타임코드의 중영문 병기 여부

## 기본 템플릿: 9패널 제품 TVC 광고 스토리보드 보드

📖 설명

3×3 = 9칸입니다. 각 칸은 독립된 광고 촬영 장면을 시각화하며, 헤더(캠페인 제목 + 영상 길이 + 비율) + 각 칸의 중국어 샷 제목 + 타임코드 + 촬영 설명을 포함합니다.

📝 프롬프트

```json
{
  "type": "제품 TVC 스토리보드 보드",
  "goal": "제품 상업 광고의 실제 촬영 장면을 각각 보여 주는 9칸 스토리보드 이미지를 생성합니다. 촬영 전 콘티 / 고객 검토 / 영상 생성 참고 자료로 사용할 수 있습니다.",
  "input_mode": "{argument name=\"input mode\" default=\"text-only\"}",
  "reference_image_note": "사용자가 제품 참고 이미지를 제공한 경우 제품 외형(색상 / 포장 / 로고)을 완전히 동일하게 유지하고 달라지지 않게 함",
  "header": {
    "title": "{argument name=\"header title\" default=\"제품 TVC 스토리보드\"}",
    "subtitle_meta": "{argument name=\"video duration\" default=\"15초\"} / {argument name=\"aspect ratio\" default=\"세로 9:16\"} / 9칸 그리드",
    "product_name_subtitle": "{argument name=\"product name\" default=\"청화백자 재떨이\"}"
  },
  "layout": {
    "format": "{argument name=\"board orientation\" default=\"세로형 3:4 스토리보드 시트\"}",
    "background": "{argument name=\"board background\" default=\"은은한 종이 질감의 어둡고 우아한 그라데이션\"}",
    "grid": {
      "rows": 3,
      "columns": 3,
      "panel_count": 9,
      "panel_aspect_ratio": "{argument name=\"panel ratio\" default=\"9:16 세로형 TVC\"}",
      "panel_borders": "가는 밝은색 구분선, 넉넉한 간격",
      "panel_label_position": "왼쪽 위에 번호 배지 + 중국어 장면 제목, 오른쪽 위에 작은 타임코드, 이미지 아래에 짧은 중국어 설명"
    }
  },
  "scenes": {
    "count": 9,
    "items": [
      { "id": 1, "title_zh": "{argument name=\"scene 1 title\" default=\"장면 설정\"}", "timestamp": "0-2s", "description": "책, 창문, 제품이 자연스럽게 놓인 책상을 보여 주는 환경 설정 와이드 샷, 부드러운 아침빛" },
      { "id": 2, "title_zh": "{argument name=\"scene 2 title\" default=\"제품 등장\"}", "timestamp": "2-3s", "description": "테이블 위 주인공 제품의 미디엄 샷, 따뜻한 윤곽광과 얕은 피사계 심도" },
      { "id": 3, "title_zh": "{argument name=\"scene 3 title\" default=\"공예 디테일 클로즈업\"}", "timestamp": "3-5s", "description": "{argument name=\"signature detail\" default=\"파란 꽃무늬 공예 패턴\"}의 극단적인 클로즈업" },
      { "id": 4, "title_zh": "{argument name=\"scene 4 title\" default=\"사용 장면\"}", "timestamp": "5-7s", "description": "{argument name=\"use action\" default=\"연기가 보이는 재떨이에 손으로 담배를 놓는 장면\"}을 보여 주는 사용 장면" },
      { "id": 5, "title_zh": "{argument name=\"scene 5 title\" default=\"기능 시연\"}", "timestamp": "7-8s", "description": "{argument name=\"function shot\" default=\"여러 담배 꽁초가 들어가는 용량을 보여 주는 탑다운 컷\"}" },
      { "id": 6, "title_zh": "{argument name=\"scene 6 title\" default=\"세척 및 관리\"}", "timestamp": "8-10s", "description": "{argument name=\"care shot\" default=\"제품을 손에 든 채 싱크대에서 흐르는 물로 세척하는 장면\"}" },
      { "id": 7, "title_zh": "{argument name=\"scene 7 title\" default=\"디테일 품질\"}", "timestamp": "10-11s", "description": "{argument name=\"quality detail\" default=\"밑면과 미끄럼 방지 패드를 보여 주는 하단 디테일 클로즈업\"}" },
      { "id": 8, "title_zh": "{argument name=\"scene 8 title\" default=\"라이프스타일 분위기\"}", "timestamp": "11-13s", "description": "{argument name=\"mood scene\" default=\"밤에 책상 위 제품, 피어오르는 연기, 은은한 스탠드 불빛을 담은 분위기 장면\"}" },
      { "id": 9, "title_zh": "{argument name=\"scene 9 title\" default=\"브랜드 마무리\"}", "timestamp": "13-15s", "description": "제품을 주인공으로 내세우고 중국어 마케팅 문구 '{argument name=\"closing tagline\" default=\"장인의 정신을 이어, 삶을 음미하다\"}'를 넣은 브랜드 마무리 장면" }
    ]
  },
  "global_style": {
    "rendering": "9개 패널 전체에 고급스럽고 사실적인 상업 사진 스타일 적용",
    "consistency": "모든 9개 패널에서 제품의 색상 / 형태 / 포장 / 로고를 완전히 동일하게 유지",
    "lighting": "{argument name=\"lighting style\" default=\"따뜻한 고급 조명, 얕은 피사계 심도, 세련된 라이프스타일 책상 환경\"}",
    "color_grading": "{argument name=\"color grading\" default=\"따뜻한 영화 색보정\"}",
    "panel_treatment": "모든 패널이 스케치나 와이어프레임이 아닌 실제 광고 스틸처럼 보여야 함"
  },
  "constraints": {
    "must_keep": [
      "9개 샷의 번호가 명확하고 타임코드가 겹치지 않으며 순차 증가(합계가 영상 길이와 일치)",
      "9개 샷에서 제품 외관이 완전히 동일",
      "각 칸에 중국어 샷 제목 + 타임코드 + 설명이 모두 포함",
      "무작위 이미지 9장이 아니라 전문적인 광고 스토리보드 보드처럼 보여야 함"
    ],
    "avoid": [
      "모든 샷이 같은 각도(근경 / 중경 / 원경 / 탑다운 / 로우앵글 혼합 필요)",
      "제품 종류에 맞지 않는 샷 설명(예: 휴대전화 광고에 가루를 컵에 붓는 장면)",
      "샷마다 제품 색상이나 외관이 달라짐",
      "타임코드의 합계가 영상 전체 시간과 일치하지 않음",
      "마무리 샷 누락(마지막 패널은 반드시 브랜드 엔딩)"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: 제품 이름, 영상 길이 + 비율, 제품 참고 이미지(있으면)
- **기본값 지정 가능**: 보드 배경, 마무리 슬로건, 조명 스타일
- **무작위 지정 가능**: 제품 카테고리에 맞춘 장면 1~9의 구체적인 설명

### 자동 완성 전략

- 사용자가 "내 제품의 9칸 TVC 콘티를 만들어 줘"라고 참고 이미지를 제공하면 제품 카테고리에 따라 9개 샷 템플릿을 자동 적용합니다.
- 구체적인 샷 내용이 없으면 "환경 설정 → 제품 등장 → 공예 디테일 → 사용 → 기능 → 세척 / 관리 → 세부 사항 → 분위기 → 마무리" 표준 구조를 사용합니다.
- 길이를 지정하지 않으면 기본값은 15초 9칸입니다.

## 변형 1: 12패널 30초 장편 버전

📝 프롬프트

```json
{
  "type": "12패널 30초 제품 TVC 스토리보드",
  "header": {
    "subtitle_meta": "30초 / {argument name=\"aspect ratio\" default=\"가로 16:9\"} / 12칸 그리드"
  },
  "layout": { "rows": 3, "columns": 4, "panel_count": 12 },
  "scenes_extension": [
    "10) 사용자 후기 / 사용 체험 장면",
    "11) 데이터 / 비교 / 인증 장면",
    "12) 두 번째 브랜드 엔딩 + CTA"
  ],
  "use_case": "30초 TVC / 상세 페이지 장편 영상 / 완전한 제품 스토리"
}
```

### 이 변형을 선택할 때

- 영상 길이가 30초 이상
- 사용자 후기 + 데이터 비교 + CTA를 포함한 더 완전한 판매 흐름이 필요
- YouTube / Bilibili / 상세 페이지 배너 영상처럼 가로 재생 채널용

## 변형 2: 6패널 짧은 동영상 버전(도우인 15초에 적합)

📝 프롬프트

```json
{
  "type": "15초 세로 짧은 동영상 스토리보드 6패널",
  "header": {
    "subtitle_meta": "15초 / 세로 9:16 / 6칸 그리드"
  },
  "layout": { "rows": 2, "columns": 3, "panel_count": 6 },
  "scenes": [
    "1 훅 / 문제 제기 오프닝",
    "2 제품 등장",
    "3 핵심 장점 하나 클로즈업",
    "4 사용 순간",
    "5 효과 / 비교",
    "6 브랜드 + CTA"
  ],
  "use_case": "도우인 / 콰이쇼우 / TikTok / Reels 15초 짧은 동영상"
}
```

### 이 변형을 선택할 때

- 플랫폼이 15초 이내 영상으로 제한될 때
- "훅 + 장점 + 전환" 중심의 빠른 짧은 영상이 필요할 때
- 샷 6개로 나누면 샷당 평균 2.5초가 되어 직관적으로 전달 가능

## 변형 3: 영화적 내러티브 TVC(고급 제품)

📝 프롬프트

```json
{
  "type": "영화적 내러티브 TVC 스토리보드",
  "header": {
    "subtitle_meta": "{argument name=\"video duration\" default=\"60초\"} / 와이드 16:9 / 9칸 그리드"
  },
  "scenes_replacement": [
    "1 주인공 등장 / 상황 소개",
    "2 갈등 / 곤경",
    "3 전환 / 제품 등장",
    "4 상호작용 / 체험",
    "5 하이라이트",
    "6 감정 해소",
    "7 여러 인물 / 공감",
    "8 브랜드 철학 진술",
    "9 로고 + 슬로건 정지 화면"
  ],
  "style_override": {
    "lighting": "대비가 강하고 분위기 있는 영화 조명",
    "color_grading": "레트로 / 티파니 / 사막 오렌지 / 특정 흑백 색조",
    "talent": "감정적인 표정을 연기하는 실제 배우"
  }
}
```

### 이 변형을 선택할 때

- 자동차 / 럭셔리 / 고급 가전 / 글로벌 브랜드
- 장점과 데이터보다 "이야기 + 감정 + 철학"을 중심으로 전달
- 60초 이상 장편 브랜드 필름

## 피해야 할 사항

- ❌ 9개 샷이 모두 제품 클로즈업 → 원경 / 중경 / 근경 / 극근접 / 하이·로우앵글을 섞어 리듬을 구성해야 함
- ❌ 샷마다 제품 색상 / 형태가 달라짐 → 치명적 오류이므로 "동일한 제품"을 강조해야 함
- ❌ 제품 종류와 맞지 않는 샷 설명(예: 립스틱 광고에 수도꼭지 세척 장면)
- ❌ 타임코드 합계가 영상 길이와 다름 → 고객에게 비전문적으로 보임
- ❌ 브랜드 엔딩 샷 누락(마지막 칸은 로고 + 슬로건 / CTA여야 함)
- ❌ 9칸을 만화 / 일러스트 스타일로 그림 → 사실적인 촬영 느낌이어야 함
- ❌ 헤더(제목 + 길이 + 비율)가 없어 무작위 이미지 9장처럼 보임
- ❌ 템플릿의 "argument" 자리표시자를 최종 프롬프트에 그대로 둠
