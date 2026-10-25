# 정책 / 정부 스타일 설명 슬라이드 템플릿

이 문서는 "정부 공고 / 정책 해설 / 공공 홍보" 스타일의 시각 페이지를 만들 때 사용합니다.

- 정부 정책 해설
- 업계 백서 한 페이지 요약
- 공공 서비스 안내
- 법규 변경 안내
- 공지 / 고시 대표 이미지

특징:

- 엄격하고 절제된 느낌
- 큰 메인 제목과 공식적인 인상
- 정보를 명확하게 구획
- 차분한 색상(짙은 파랑 / 짙은 빨강 / 짙은 초록 + 베이지)
- 장식은 적절히 사용하되 과하지 않게 함

## 적용 범위

- 정책 해설 이미지
- 정부 공고 대표 이미지
- 업계 백서 요약 이미지
- 법규 변경 안내 이미지
- 공공 홍보 포스터 스타일 슬라이드

## 사용 시점

- 사용자가 "정책 해설 / 정부 공고 / 백서 / 공공 홍보 / 엄격한 설명"을 언급할 때
- 권위 있고 진지하며 오락적이지 않은 시각물을 원할 때

다음에는 사용하지 마세요.

- 강의 설명 자료(`dense-explainer-slides.md` 사용)
- 비즈니스 보고서(`visual-report-page.md` 사용)
- 과학 교육 그림(`educational-diagram-slide.md` 사용)

## 누락 정보 확인 우선순위

1. 주제(정책명 / 공고명 / 법규명)
2. 공포 기관 / 발표 기관
3. 핵심 내용 섹션(3~5개)
4. 주요 수치 또는 날짜
5. 색상: 공공 빨강 / 공공 파랑 / 공공 초록 / 중립 회색
6. QR 코드 / 연락처가 필요한지 여부

## 기본 템플릿: 정책 해설 단일 페이지 슬라이드

📖 설명

전체 페이지 구성: 상단에 공식 로고 / 기관명 + 메인 제목 + 부제, 중간에 여러 설명 구역 + 강조 수치, 하단에 출처 / QR 코드 / 발표 날짜를 둡니다.

📝 프롬프트

```json
{
  "type": "정책 해설 단일 페이지 슬라이드",
  "goal": "정부 공고 / 정책 해설 용도로 사용할 수 있는 엄격하고 권위 있는 시각 페이지를 생성",
  "style": {
    "color_palette": "{argument name=\"color palette\" default=\"공공 빨강 + 미색 + 짙은 회색\"}",
    "tone": "{argument name=\"visual tone\" default=\"엄격하고 절제된 공식 분위기\"}",
    "typography": "{argument name=\"typography\" default=\"큰 제목은 Source Han Serif, 본문은 Source Han Sans\"}"
  },
  "header": {
    "agency_name": "{argument name=\"agency name\" default=\"국가 모 기관\"}",
    "agency_logo": "{argument name=\"agency logo\" default=\"국장 / 기관 엠블럼\"}",
    "main_title": "{argument name=\"main title\" default=\"특정 업계의 고품질 발전 추진에 관한 지침\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"정책 핵심 내용 해설\"}",
    "release_date": "{argument name=\"release date\" default=\"2026년 4월 24일\"}"
  },
  "sections": {
    "count": "{argument name=\"section count\" default=\"5\"}",
    "items": [
      "{argument name=\"section 1\" default=\"정책 배경\"}",
      "{argument name=\"section 2\" default=\"주요 목표\"}",
      "{argument name=\"section 3\" default=\"중점 과제\"}",
      "{argument name=\"section 4\" default=\"보장 조치\"}",
      "{argument name=\"section 5\" default=\"시행 일정\"}"
    ],
    "section_block_style": "번호 + 제목 + 설명 2~3줄, 작은 아이콘을 추가할 수 있음"
  },
  "highlight_numbers": {
    "enabled": "{argument name=\"highlight numbers enabled\" default=\"true\"}",
    "items": [
      "{argument name=\"key number 1\" default=\"중점 과제 5개\"}",
      "{argument name=\"key number 2\" default=\"3년 시행 주기\"}",
      "{argument name=\"key number 3\" default=\"28개 분야 포함\"}"
    ]
  },
  "footer": {
    "source": "{argument name=\"source\" default=\"출처: 공식 문서 원문 링크\"}",
    "qr_code": "{argument name=\"qr code\" default=\"오른쪽 아래 QR 코드: 정책 원문 확인\"}"
  },
  "constraints": {
    "must_keep": [
      "메인 제목이 가장 큰 글자",
      "기관 로고와 이름이 모두 나타나고 읽기 쉬움",
      "색상 팔레트는 절제해 3가지 이하",
      "수치 강조 구역은 눈에 띄되 과장되지 않음"
    ],
    "avoid": [
      "오락적인 글꼴 사용",
      "일러스트가 지나치게 카툰 스타일",
      "브랜드 광고 요소 등장",
      "색상의 채도가 지나치게 높음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 정책 이름, 기관, 섹션
- 기본값 지정 가능: 색상 팔레트, 글꼴 체계, 하단 정보
- 무작위 지정 가능: 작은 장식 아이콘

### 자동 완성 전략

- 기본 섹션은 "배경 / 목표 / 과제 / 보장 / 일정"의 다섯 부분으로 구성합니다.
- 기본 색상은 공공 빨강 + 미색 + 짙은 회색입니다.
- 실제 기관을 사칭하지 않도록 기관 스타일은 보편적인 형태로 둡니다.

## 변형 1: 공공 홍보 포스터 스타일 슬라이드

📝 프롬프트

```json
{
  "type": "공공 홍보 포스터 스타일 슬라이드",
  "header": {
    "main_title": "{argument name=\"main title\" default=\"올바른 분리배출, 모두 함께 실천해요\"}",
    "subtitle": "공식 안내 + 실천 가이드"
  },
  "centerpiece": {
    "description": "{argument name=\"centerpiece\" default=\"네 가지 쓰레기통 + 간단한 분류 아이콘\"}"
  },
  "sections": {
    "items": [
      "재활용품",
      "음식물 쓰레기",
      "유해 폐기물",
      "일반 쓰레기"
    ]
  },
  "constraints": {
    "must_feel": "공익적이고 명확하며 이해하기 쉬움"
  }
}
```

## 변형 2: 백서 요약 슬라이드

📝 프롬프트

```json
{
  "type": "업계 백서 요약 슬라이드",
  "header": {
    "main_title": "{argument name=\"report name\" default=\"2026년 특정 업계 발전 백서\"}"
  },
  "sections": {
    "items": ["시장 개요", "동향 분석", "핵심 데이터", "향후 전망"]
  },
  "highlight_numbers": {
    "enabled": true,
    "items": ["시장 규모 1조 2천억", "연평균 성장률 18%", "활성 기업 4,500+개"]
  },
  "constraints": {
    "must_feel": "전문적이며 공개 자료로 사용할 수 있어야 함"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "정책 스타일 슬라이드 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 주제를 주면 기관 스타일, 섹션 구분, 색상 팔레트를 자동 선택",
  "constraints": {
    "must_feel": "권위 있고 절제되어 배포할 수 있음"
  }
}
```

## 피해야 할 사항

- 실제 기관의 로고를 사칭하지 않습니다.
- 특별한 상황이 아니라면 붓글씨 / 카툰체처럼 오락적인 글꼴을 사용하지 않습니다.
- 삽화가 주의를 분산시키지 않게 합니다.
- 주색을 3가지 넘게 사용하지 않습니다.
- 본문 행간을 지나치게 좁혀 읽기 어렵게 하지 않습니다.
- 정책 스타일 슬라이드에 마케팅 카드를 지나치게 많이 추가하지 않습니다.
