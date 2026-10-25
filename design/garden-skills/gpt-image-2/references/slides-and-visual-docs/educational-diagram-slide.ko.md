# 교육용 도식 슬라이드 템플릿

이 문서는 "개념 / 작동 원리 / 절차 하나를 한 페이지에서 설명"하는 교육용 시각 자료를 만들 때 사용합니다.

- 강의 자료 한 페이지
- 교과서 도식
- 온라인 강의 스크린샷
- 엔지니어 교육 그림
- 교육 매뉴얼 삽화

특징:

- 중앙 대표 그림 + 단계 분해
- 텍스트는 절제
- 색상이 부드러움
- 가독성 강조
- 반복해서 읽기에 적합

## 적용 범위

- 개념 도식
- 작동 원리 / 절차 도식
- 공학 원리도
- 교과서 내지 삽화

## 사용 시점

- 사용자가 "교육 / 강의 / 교과서 / 개념도 / 작동 원리도 / 원리도"를 언급할 때
- "X가 어떻게 작동하는지" 설명하고 싶을 때
- 투자자 / 정부가 아니라 학생 / 학습자를 대상으로 할 때

다음에는 사용하지 마세요.

- 설명 강의 슬라이드(`dense-explainer-slides.md` 사용)
- 정책 스타일(`policy-style-slide.md` 사용)
- 비즈니스 보고서(`visual-report-page.md` 사용)

## 누락 정보 확인 우선순위

1. 개념 / 원리 이름
2. 학습 수준(초등 / 중등 / 대학 / 업계 교육)
3. 단계 수(3~7개)
4. 중앙 대표 이미지가 필요한지 여부
5. 스타일: 손그림 / 카툰 / 학술 / 엔지니어링 도면
6. 색상 팔레트

## 기본 템플릿: 단계별 교육 도식

📖 설명

한 페이지 교육 이미지입니다. 상단에 메인 제목, 중앙에 핵심 그림, 주변에 번호가 붙은 단계 설명, 하단에 짧은 요약을 배치합니다.

📝 프롬프트

```json
{
  "type": "교육용 도식 슬라이드",
  "goal": "학습자가 개념 / 작동 원리 / 절차를 한눈에 이해할 수 있는 교육용 도식 생성",
  "style": {
    "color_palette": "{argument name=\"color palette\" default=\"부드러운 베이지 + 학술 블루 + 연회색\"}",
    "rendering": "{argument name=\"rendering\" default=\"선명한 벡터 일러스트 + 간결한 서체\"}"
  },
  "header": {
    "main_title": "{argument name=\"main title\" default=\"광합성은 어떻게 작동할까요?\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"빛에서 당까지, 일곱 단계로 알아보기\"}",
    "audience": "{argument name=\"audience\" default=\"중학생\"}"
  },
  "centerpiece": {
    "enabled": "{argument name=\"centerpiece enabled\" default=\"true\"}",
    "description": "{argument name=\"centerpiece description\" default=\"엽록체와 기공을 표시한 잎의 단면 전체\"}"
  },
  "steps": {
    "count": "{argument name=\"step count\" default=\"6\"}",
    "items": [
      "{argument name=\"step 1\" default=\"01 빛이 엽록체에 들어옴\"}",
      "{argument name=\"step 2\" default=\"02 물이 뿌리에서 위로 이동\"}",
      "{argument name=\"step 3\" default=\"03 이산화탄소가 기공으로 들어옴\"}",
      "{argument name=\"step 4\" default=\"04 명반응: 물이 수소와 산소로 분해됨\"}",
      "{argument name=\"step 5\" default=\"05 암반응: CO₂가 당으로 전환됨\"}",
      "{argument name=\"step 6\" default=\"06 산소를 방출하고 포도당을 생성\"}"
    ],
    "step_block_style": "번호 + 한 문장 + 작은 아이콘"
  },
  "annotations": {
    "style": "가는 연결선 + 작은 번호 라벨",
    "rule": "주석선이 서로 교차하지 않도록 함"
  },
  "summary_line": "{argument name=\"summary\" default=\"광합성 = 빛 + 물 + CO₂ → 포도당 + O₂\"}",
  "constraints": {
    "must_keep": [
      "중앙 그림을 시각적 기준점으로 유지",
      "단계 번호가 연속적이고 선명함",
      "글꼴을 통일",
      "주색은 3가지 이하"
    ],
    "avoid": [
      "단계가 너무 많아 한 페이지에 들어가지 않음",
      "여러 일러스트 스타일을 섞음",
      "주석선이 핵심 그림을 관통함",
      "본문에 설명 없이 전문 용어를 과도하게 사용"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 개념, 학습 수준, 단계 수
- 기본값 지정 가능: 스타일, 색상, 하단 공식 문장
- 무작위 지정 가능: 아이콘 모양

### 자동 완성 전략

- 학습 수준이 낮을수록 일러스트를 더 카툰처럼 만들고 문장을 짧게 합니다.
- 학습 수준이 높을수록 일러스트를 더 과학적이고 도식적으로 만들며 설명을 정밀하게 합니다.
- 단계는 4~7개를 권장하고 7개를 넘으면 여러 페이지로 나눕니다.

## 변형 1: 공학 원리 도식

📝 프롬프트

```json
{
  "type": "공학 원리 도식 슬라이드",
  "header": {
    "main_title": "{argument name=\"concept\" default=\"내연기관의 4행정은 어떻게 작동할까요?\"}"
  },
  "centerpiece": {
    "description": "실린더 단면도 + 피스톤 동작"
  },
  "steps": {
    "count": 4,
    "items": ["흡기", "압축", "연소·팽창", "배기"]
  },
  "constraints": {
    "must_feel": "공학 도면 느낌, 전문적이고 신뢰할 수 있음"
  }
}
```

## 변형 2: 어린이를 위한 교육 그림

📝 프롬프트

```json
{
  "type": "저연령 어린이 과학 교육 슬라이드",
  "header": {
    "main_title": "{argument name=\"concept\" default=\"비는 왜 내릴까요?\"}"
  },
  "style": {
    "color_palette": "분홍빛 주황 + 하늘색 + 미색",
    "rendering": "귀여운 카툰 일러스트"
  },
  "steps": {
    "count": 4,
    "items": ["태양이 물을 데움", "물이 구름이 됨", "구름이 무거워짐", "비가 내림"]
  },
  "constraints": {
    "must_feel": "귀엽고 이해하기 쉬우며 따뜻함"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "교육 도식 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 개념을 주면 단계, 스타일, 색상, 대표 그림을 자동 결정",
  "constraints": {
    "must_feel": "교과서 / 수업 자료에 바로 넣을 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 초등학생이 이해하기 어려울 만큼 개념을 지나치게 학술적으로 표현하지 않습니다.
- 단계를 7개 넘게 만들지 않습니다.
- 일러스트와 설명 텍스트의 스타일이 충돌하지 않게 합니다.
- 과학 도식에 브랜드 광고를 넣지 않습니다.
- 주석선이 서로 교차하지 않게 합니다.
- 읽기 편안함을 해칠 만큼 채도가 높은 색을 사용하지 않습니다.
