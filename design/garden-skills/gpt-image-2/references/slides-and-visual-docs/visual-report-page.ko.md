# 비즈니스 시각 보고서 페이지 템플릿

이 문서는 "비즈니스 보고서 / 투자 분석 / 성장 회고 / OKR 개요" 스타일의 시각 단일 페이지를 만들 때 사용합니다.

- 비즈니스 컨설팅 회사 스타일
- 투자은행 / 리서치 보고서
- 기업 연례 보고서 개요
- 투자자 브리핑
- OKR 분기 결산

특징:

- 데이터 중심
- 표 + 차트 + 일러스트를 혼합
- 엄격한 레이아웃
- 한 페이지에서 비즈니스 판단 하나를 명확히 설명

## 적용 범위

- 한 페이지 KPI 개요
- 투자자 브리핑 표지
- 보고서 경영진 요약 페이지
- 분기 업무 회고 페이지

## 사용 시점

- 사용자가 "보고서 / 회고 / 투자자 브리핑 / KPI / OKR / executive summary"를 언급할 때
- 데이터 시각화와 비즈니스 판단 중심 스타일이 필요할 때

다음에는 사용하지 마세요.

- 정부 공고(`policy-style-slide.md` 사용)
- 설명 강의 자료(`dense-explainer-slides.md` 사용)
- 과학 정보 이미지(`educational-diagram-slide.md` 사용)

## 누락 정보 확인 우선순위

1. 보고서 주제(사업 / 분기 / 프로젝트 / 기업)
2. 주요 데이터(3~5개)
3. 핵심 판단(결론 한 문장)
4. 타임라인 / 추세 차트가 필요한지 여부
5. 색상: 비즈니스 블루 / 블랙 골드 / 웜 그레이
6. 영어 / 중영문 병기가 필요한지 여부

## 기본 템플릿: 비즈니스 보고서 경영진 요약 페이지

📖 설명

상단에 제목 + 보고 기간 + 로고를 놓습니다. 중앙에는 핵심 수치 카드 + 작은 추세 차트 + 판단 한 문장을 배치하고, 하단에는 출처 / 주석을 둡니다.

📝 프롬프트

```json
{
  "type": "비즈니스 보고서 경영진 요약 페이지",
  "goal": "투자자 브리핑, 분기 보고서 표지, 사내 OKR 회고에 사용할 수 있는 경영진 요약 시각 페이지 생성",
  "style": {
    "color_palette": "{argument name=\"color palette\" default=\"비즈니스 블루 + 회색 + 흰색\"}",
    "tone": "{argument name=\"visual tone\" default=\"이성적이고 절제되며 신뢰할 수 있음\"}",
    "typography": "{argument name=\"typography\" default=\"현대적 산세리프체 + 굵은 숫자\"}"
  },
  "header": {
    "company_or_team": "{argument name=\"team name\" default=\"NEX Inc.\"}",
    "report_period": "{argument name=\"period\" default=\"2026년 1분기\"}",
    "main_title": "{argument name=\"main title\" default=\"분기 사업 회고 · 경영진 요약\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"핵심 데이터 3개 + 핵심 판단 1개\"}"
  },
  "kpi_cards": {
    "count": "{argument name=\"kpi count\" default=\"4\"}",
    "items": [
      {
        "label": "{argument name=\"kpi 1 label\" default=\"매출\"}",
        "value": "{argument name=\"kpi 1 value\" default=\"¥ 12.4억\"}",
        "change": "{argument name=\"kpi 1 change\" default=\"전년 동기 대비 +18%\"}"
      },
      {
        "label": "{argument name=\"kpi 2 label\" default=\"활성 사용자\"}",
        "value": "{argument name=\"kpi 2 value\" default=\"3,820만\"}",
        "change": "{argument name=\"kpi 2 change\" default=\"전년 동기 대비 +22%\"}"
      },
      {
        "label": "{argument name=\"kpi 3 label\" default=\"매출총이익률\"}",
        "value": "{argument name=\"kpi 3 value\" default=\"62.1%\"}",
        "change": "{argument name=\"kpi 3 change\" default=\"+3.4%p\"}"
      },
      {
        "label": "{argument name=\"kpi 4 label\" default=\"NPS\"}",
        "value": "{argument name=\"kpi 4 value\" default=\"62\"}",
        "change": "{argument name=\"kpi 4 change\" default=\"+8\"}"
      }
    ]
  },
  "trend_chart": {
    "enabled": "{argument name=\"trend chart enabled\" default=\"true\"}",
    "type": "{argument name=\"chart type\" default=\"선 + 영역\"}",
    "metric": "{argument name=\"chart metric\" default=\"분기 매출\"}",
    "x_axis": "Q1-Q4",
    "y_axis": "억 위안"
  },
  "core_judgment": {
    "headline": "{argument name=\"core judgment\" default=\"핵심 성장은 AI 제품군에서 나왔으며 2분기에는 연구개발 자원을 더 투입해야 합니다.\"}"
  },
  "footer": {
    "source": "{argument name=\"source\" default=\"데이터 출처: 사내 재무 시스템\"}",
    "confidentiality": "{argument name=\"confidentiality\" default=\"내부 자료 · 토론용\"}"
  },
  "constraints": {
    "must_keep": [
      "숫자가 가장 크고 눈에 띄어야 함",
      "추세 차트와 KPI 데이터가 일치해야 함",
      "핵심 판단은 한 문장만 사용",
      "색상 팔레트는 단순하게 3가지 이하"
    ],
    "avoid": [
      "데이터가 지나치게 빽빽함",
      "장식 목적의 일러스트 사용",
      "글꼴 종류가 너무 많음",
      "배경이 지나치게 밝아 숫자를 식별하기 어려움"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 보고 기간, 주제, 핵심 데이터
- 기본값 지정 가능: 색상, 글꼴, 기밀 표시
- 무작위 지정 가능: 작은 장식 요소

### 자동 완성 전략

- 사용자가 주제만 제시하면 흔한 KPI 4개(매출 / 사용자 / 매출총이익률 / NPS)를 자동 구성합니다.
- 기본 팔레트는 비즈니스 블루입니다.
- 핵심 판단은 기본적으로 "X 때문에 Y" 문장 구조를 사용합니다.

## 변형 1: 투자자 피치 표지

📝 프롬프트

```json
{
  "type": "투자자 피치 표지 단일 페이지",
  "header": {
    "main_title": "{argument name=\"company\" default=\"NEX Inc.\"}",
    "subtitle": "{argument name=\"tagline\" default=\"AI 업무 흐름을 새롭게 정의합니다\"}"
  },
  "kpi_cards": {
    "items": [
      "ARR ¥1.2억",
      "전년 동기 대비 성장률 240%",
      "고객 4,500+개"
    ]
  },
  "core_judgment": {
    "headline": "지금이 투자 유치의 가장 좋은 시기입니다."
  },
  "constraints": {
    "must_feel": "선명하고 자신감 있으며 미래적"
  }
}
```

## 변형 2: 연례 보고서 개요 페이지

📝 프롬프트

```json
{
  "type": "기업 연례 보고서 개요 페이지",
  "header": {
    "main_title": "{argument name=\"year\" default=\"2025 연례 보고서\"}",
    "subtitle": "연간 주요 성과 + 내년 전망"
  },
  "sections": {
    "items": ["연간 KPI", "주요 이정표", "팀 성장", "내년 계획"]
  },
  "constraints": {
    "must_feel": "절제되고 축적된 성과가 느껴짐"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "비즈니스 보고서 페이지 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 사업 방향 + 보고 기간을 주면 KPI / 추세 / 핵심 판단을 자동 구성",
  "constraints": {
    "must_feel": "투자자 / 임원에게 보낼 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 경영진 요약 페이지에 KPI를 6개 초과로 넣지 않습니다.
- 추세 차트와 KPI가 서로 모순되지 않게 합니다.
- 장식적인 글꼴을 사용하지 않습니다.
- 핵심 판단을 두 문장 넘게 쓰지 않습니다.
- 배경이 너무 어두워 숫자를 읽기 어렵게 하지 않습니다.
