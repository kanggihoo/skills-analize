# 잡지 / 에디토리얼 표지 템플릿

이 문서는 "잡지 표지 / 에디토리얼 시각물 / 출판물 표지"를 만들 때 사용합니다.

- 패션 잡지 표지
- 업계 전문지 표지
- 사내 간행물 / 보고서 표지
- 개인 미디어 특별호 표지
- 에디토리얼 특집 대표 이미지

특징:

- 강한 "출판물 분위기"
- 인물 초상화 / 단일 물체가 시각적으로 주도
- 큰 제목 + 작은 코너 기사 안내
- 보통 세로형 3:4 / 4:5
- 잡지명 + 호수 자리 확보

## 적용 범위

- 잡지 / 정기 간행물 표지
- 업계 보고서 표지
- 개인 미디어 특별호 표지
- 출판물 스타일의 시각 포스터

## 사용 시점

- 사용자가 "잡지 / 표지 / 정기 간행물 / cover / 출판물 스타일"을 언급할 때
- 광고 포스터와 다른 "에디토리얼 감각"이 강한 이미지를 원할 때

다음에는 사용하지 마세요.

- 일반 브랜드 포스터(`brand-poster.md` 사용)
- 배너(`banner-hero.md` 사용)
- 캠페인 KV(`campaign-kv.md` 사용)

## 누락 정보 확인 우선순위

1. 간행물 이름 / 호수 / 발행사
2. 메인 제목(표지의 큰 글자)
3. 대표 이미지(인물 / 물체 / 개념)
4. 부제 / 내부 기사 안내 문구 3~5개
5. 스타일: 하이패션 / 문화 / 경제 / 기술 / 레트로
6. 비율

## 기본 템플릿: 잡지 표지(인물 초상화)

📖 설명

세로형 표지에 인물 초상화 또는 단일 물체를 대표 이미지로 사용합니다. 왼쪽 위에는 간행물 이름 + 호수를 놓고, 메인 제목은 크게 가로 또는 세로로 배치하며 양쪽에 작은 기사 안내 문구를 둡니다.

📝 프롬프트

```json
{
  "type": "잡지 표지",
  "goal": "강한 에디토리얼 분위기의 패션 / 문화 / 업계 잡지 표지로 사용할 수 있는 시각 이미지 생성",
  "publication": {
    "name": "{argument name=\"publication name\" default=\"NEUE\"}",
    "tagline": "{argument name=\"tagline\" default=\"Culture · Design · Future\"}",
    "issue": "{argument name=\"issue\" default=\"Issue 042 / 2026 April\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "main_visual": {
    "type": "{argument name=\"main visual type\" default=\"인물 초상화\"}",
    "description": "{argument name=\"main visual\" default=\"차분한 눈빛과 자연광의 동아시아 젊은 여성 정면 초상\"}",
    "composition": "{argument name=\"composition\" default=\"화면을 채우며 머리는 중앙에서 약간 오른쪽에 배치\"}"
  },
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"다시 시작하는 순간들\"}",
    "main_title_style": "{argument name=\"title style\" default=\"대표 이미지 위에 겹쳐 놓은 매우 큰 굵은 세리프체\"}",
    "kicker": "{argument name=\"kicker\" default=\"인터뷰\"}"
  },
  "side_teasers": {
    "count": "{argument name=\"teaser count\" default=\"4\"}",
    "items": [
      "{argument name=\"teaser 1\" default=\"AI 시대의 글쓰기 · 한쑹뤄 vs ChatGPT\"}",
      "{argument name=\"teaser 2\" default=\"건축가의 노트 · 항저우에서 천천히 집 짓기\"}",
      "{argument name=\"teaser 3\" default=\"특별 기획 · 30대 30인\"}",
      "{argument name=\"teaser 4\" default=\"장문 기사 · 실패한 창업 하나\"}"
    ],
    "position": "{argument name=\"teaser position\" default=\"화면 아래쪽 + 왼쪽 세로 배치\"}"
  },
  "color_palette": "{argument name=\"color palette\" default=\"미색 + 먹색 + 브랜드 오렌지 한 방울\"}",
  "barcode": {
    "enabled": "{argument name=\"barcode enabled\" default=\"true\"}",
    "position": "오른쪽 아래 모서리"
  },
  "constraints": {
    "must_keep": [
      "대표 이미지가 절대적인 시각적 기준점",
      "간행물 이름을 선명하게 읽을 수 있고 가리지 않음",
      "메인 제목이 가장 큰 글자",
      "기사 안내 문구가 주목을 빼앗지 않음"
    ],
    "avoid": [
      "대표 이미지와 텍스트가 같은 영역을 두고 경쟁함",
      "글꼴을 세 종류 넘게 사용",
      "팔레트에 불필요한 색상을 추가",
      "광고 로고가 나타남"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 간행물 이름, 호수, 메인 제목, 대표 이미지
- 기본값 지정 가능: 색상 팔레트, 기사 안내 문구, 바코드
- 무작위 지정 가능: 작은 장식 요소

### 자동 완성 전략

- 간행물 유형에 따라 스타일을 자동 선택합니다(패션 = 강한 대비 + 미니멀, 경제 = 청회색 + 세리프체, 문화 = 따뜻한 베이지 + 세리프체).
- 메인 제목은 기본 6~12자입니다.
- 기사 안내 문구는 기본 3~4개입니다.

## 변형 1: 단일 물체 표지(제품 / 사물)

📝 프롬프트

```json
{
  "type": "단일 물체 잡지 표지",
  "main_visual": {
    "type": "object",
    "description": "{argument name=\"object\" default=\"잘 관리된 레트로 타자기 한 대\"}"
  },
  "title_block": {
    "main_title": "{argument name=\"title\" default=\"도구의 영혼\"}"
  },
  "constraints": {
    "must_feel": "정물, 절제, 문학적 분위기"
  }
}
```

## 변형 2: 경제 / 기술 잡지 표지

📝 프롬프트

```json
{
  "type": "경제·기술 잡지 표지",
  "main_visual": {
    "type": "concept",
    "description": "{argument name=\"concept\" default=\"정보 흐름을 추상화한 그래픽 + 인물 실루엣\"}"
  },
  "color_palette": "짙은 파랑 + 은색 + 형광색 한 방울",
  "title_block": {
    "main_title": "{argument name=\"title\" default=\"AI가 비즈니스를 다시 쓰다\"}"
  },
  "constraints": {
    "must_feel": "첨단, 신뢰, 업계 대표성"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "잡지 표지 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 간행물 종류 + 주제를 주면 간행물 이름, 호수, 메인 제목, 기사 안내 문구, 스타일을 자동 생성",
  "constraints": {
    "must_feel": "가판대에 바로 놓을 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 간행물 이름이 대표 이미지에 가려지지 않게 합니다.
- 메인 제목과 대표 이미지의 색상 대비를 낮게 만들지 않습니다.
- 기사 안내 문구를 5개 넘게 넣지 않습니다.
- 글꼴을 세 종류 넘게 사용하지 않습니다.
- 바코드를 대표 이미지 중앙에 배치하지 않습니다.
